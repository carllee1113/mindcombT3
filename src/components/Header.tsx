import { useStore } from '../store/store'
import type { INode } from '../store/store'
import { generateFreeMindXML, downloadFreeMind, importFreeMind } from '@/utils/exportFreeMind'
import { calculateConnectionPoints } from '../store/nodeStore'
import { getBranchColor } from '../utils/colors'
import { useRef } from 'react'

const Header = () => {
  const { uiStore, nodeStore } = useStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = () => {
    const xml = generateFreeMindXML(nodeStore.allNodes, nodeStore.centralNodeId)
    downloadFreeMind(xml)
  }

  const handleViewModeSwitch = () => {
    uiStore.toggleViewMode();
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const { nodes, centralNodeId } = await importFreeMind(file)
      
      // Clear existing nodes and connections
      nodeStore.clearNonCentralNodes()
      nodeStore.getConnectionStore().clearConnections()
      
      // Create maps to store node information
      const nodeLevels = new Map<string, number>()
      const nodeColors = new Map<string, string>()
      const firstLayerNodes: INode[] = []
      
      // First pass: Identify first layer nodes and assign colors
      nodes.forEach((node) => {
        if (node.parentId === centralNodeId) {
          const color = getBranchColor(firstLayerNodes.length)
          nodeColors.set(node.id, color)
          firstLayerNodes.push(node)
        }
      })

      // Second pass: Calculate levels and inherit colors
      const processNode = (node: INode, level: number, color?: string) => {
        nodeLevels.set(node.id, level)
        if (color) nodeColors.set(node.id, color)

        const childNodes = nodes.filter(n => n.parentId === node.id)
        childNodes.forEach(childNode => {
          processNode(childNode, level + 1, nodeColors.get(node.id))
        })
      }

      // Process central node and its hierarchy
      const centralNode = nodes.find(n => n.id === centralNodeId)
      if (centralNode) {
        processNode(centralNode, 0)
        firstLayerNodes.forEach(node => {
          processNode(node, 1, nodeColors.get(node.id))
        })
      }

      // Remove this duplicate call that causes the type error
      // firstLayerNodes.forEach(node => {
      //   processNode(node.id, 1, nodeColors.get(node.id))
      // })

      // Third pass: Create nodes with correct levels and colors
      nodes.forEach(node => {
        if (node.id === centralNodeId) {
          const currentCentralNode = nodeStore.getNodeById(nodeStore.centralNodeId)
          if (currentCentralNode) {
            nodeStore.updateNodeContent(nodeStore.centralNodeId, node.content)
            nodeStore.updateNodeTitle(nodeStore.centralNodeId, node.title || node.content)
          }
        } else {
          const newNode = {
            ...node,
            connectionPoints: calculateConnectionPoints(),
            position: { x: 0, y: 0 },
            level: (nodeLevels.get(node.id) || 1) as 0 | 1 | 2 | 3,
            branchColor: nodeColors.get(node.id) || getBranchColor(0)
          }
          nodeStore.addNode(newNode)
        }
      })

      // Fourth pass: Create connections
      nodes.forEach(node => {
        if (node.parentId) {
          const parentId = node.parentId === centralNodeId ? nodeStore.centralNodeId : node.parentId
          nodeStore.getConnectionStore().addConnection(parentId, node.id)
        }
      })

      // Position first layer nodes
      const angleConstraints = {
        maxDeviation: Math.PI / 8,
        preferredAngles: {
          left: [-Math.PI * 0.8, -Math.PI / 3],
          right: [-Math.PI / 6, Math.PI / 2.5]
        },
        smoothing: 0.4
      }

      const regions = {
        upper: { start: -Math.PI / 4, end: Math.PI / 2 },
        lower: { start: -Math.PI * 0.9, end: -Math.PI / 3 }
      }

      const baseRadius = 300
      const levelSpacing = {
        first: baseRadius,
        second: baseRadius * 0.7,
        other: baseRadius * 0.5
      }

      const constrainAngle = (angle: number, parentAngle: number, isRight: boolean) => {
        const preferred = isRight ? angleConstraints.preferredAngles.right : angleConstraints.preferredAngles.left
        const baseAngle = Math.max(preferred[0], Math.min(preferred[1], angle))
        const deviation = baseAngle - parentAngle
        const constrainedDeviation = Math.max(
          -angleConstraints.maxDeviation,
          Math.min(angleConstraints.maxDeviation, deviation)
        )
        return parentAngle + constrainedDeviation
      }

      firstLayerNodes.forEach((node, index) => {
        let angle
        const leftSideCount = Math.ceil(firstLayerNodes.length / 2)
        const rightSideCount = Math.floor(firstLayerNodes.length / 2)

        if (index < leftSideCount) {
          const progress = leftSideCount > 1 ? index / (leftSideCount - 1) : 0.5
          angle = regions.lower.start + (regions.lower.end - regions.lower.start) * progress
        } else {
          const rightIndex = index - leftSideCount
          const progress = rightSideCount > 1 ? rightIndex / (rightSideCount - 1) : 0.5
          angle = regions.upper.start + (regions.upper.end - regions.upper.start) * progress
        }

        const radiusVariation = levelSpacing.first + (Math.floor(index / 2) * 20)
        const newX = nodeStore.getNodeById(nodeStore.centralNodeId)!.position.x + (radiusVariation * Math.cos(angle))
        const newY = nodeStore.getNodeById(nodeStore.centralNodeId)!.position.y + (radiusVariation * Math.sin(angle))

        nodeStore.updateNodePosition(node.id, { x: newX, y: newY })

        // Position child nodes recursively
        const positionChildNodes = (parentNode: INode, parentAngle: number, level: number, parentPos: {x: number, y: number}) => {
          const childNodes = nodes.filter(n => n.parentId === parentNode.id)
          const angleSpread = Math.PI / (level === 2 ? 8 : 6)
          
          childNodes.forEach((childNode, idx) => {
            const baseAngle = parentAngle + (angleSpread * (idx - (childNodes.length - 1) / 2) / Math.max(childNodes.length, 1))
            const isRightSide = baseAngle > -Math.PI / 2
            
            // Apply angle constraints and smoothing
            const smoothedAngle = parentAngle * angleConstraints.smoothing + 
                                baseAngle * (1 - angleConstraints.smoothing)
            const childAngle = constrainAngle(smoothedAngle, parentAngle, isRightSide)
            
            const childRadius = level === 2 ? 
              levelSpacing.second : 
              levelSpacing.first + (level * levelSpacing.other * 0.8)
            
            const childX = parentPos.x + (childRadius * Math.cos(childAngle))
            const childY = parentPos.y + (childRadius * Math.sin(childAngle))
            
            nodeStore.updateNodePosition(childNode.id, { x: childX, y: childY })
            positionChildNodes(childNode, childAngle, level + 1, {x: childX, y: childY})
          })
        }

        // Position all child nodes of this first layer node
        positionChildNodes(node, angle, 2, {x: newX, y: newY})
      })
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('Failed to import mind map:', error)
    }
  }

  return (
    <header className="bg-white shadow-sm py-3 px-6 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <img 
          src="public\mindcomb-logo.png" 
          alt="Mindcomb Logo" 
          className="h-8 w-8"
        />
        <h1 className="text-2xl font-bold text-indigo-700">Mindcomb</h1>
      </div>
      
      <div className="flex space-x-2">
        <input
          type="file"
          accept=".mm"
          className="hidden"
          ref={fileInputRef}
          onChange={handleImport}
        />
        <button 
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
          onClick={() => fileInputRef.current?.click()}
        >
          Import
        </button>
        <button 
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
          onClick={handleExport}
        >
          Export
        </button>
        <button 
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
          onClick={handleViewModeSwitch}
          data-view-mindmap
        >
          {uiStore.viewMode === 'mindmap' ? 'View as Markdown' : 'View as Mind Map'}
        </button>
        <button 
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
          onClick={() => {
            // Calculate bounds of all nodes
            const nodes = nodeStore.allNodes
            if (nodes.length === 0) return

            let minX = Infinity, maxX = -Infinity
            let minY = Infinity, maxY = -Infinity

            nodes.forEach((node: INode) => {
              minX = Math.min(minX, node.position.x)
              maxX = Math.max(maxX, node.position.x)
              minY = Math.min(minY, node.position.y)
              maxY = Math.max(maxY, node.position.y)
            })

            // Calculate center and required scale
            const padding = 100
            const viewportWidth = window.innerWidth
            const viewportHeight = window.innerHeight
            const contentWidth = maxX - minX + padding * 2
            const contentHeight = maxY - minY + padding * 2

            const scaleX = viewportWidth / contentWidth
            const scaleY = viewportHeight / contentHeight
            const scale = Math.min(scaleX, scaleY, 1)

            // Center the content
            const centerX = (minX + maxX) / 2
            const centerY = (minY + maxY) / 2

            uiStore.setZoomLevel(scale)
            uiStore.setViewportPosition(
              viewportWidth / 2 - centerX * scale,
              viewportHeight / 2 - centerY * scale
            )
          }}
        >
          Show All
        </button>
      </div>
    </header>
  )
}

export default Header