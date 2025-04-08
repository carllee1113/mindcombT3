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

  const handleViewModeSwitch = async () => {
    try {
      // Generate temporary .mm file from current nodes
      const xml = generateFreeMindXML(nodeStore.allNodes, nodeStore.centralNodeId);
      const blob = new Blob([xml], { type: 'application/xml' });
      const tempFile = new File([blob], 'temp-view-switch.mm');
      
      // Import from temp file to ensure consistent structure
      const { nodes, centralNodeId } = await importFreeMind(tempFile);
      
      // Update markdown content if switching to markdown view
      if (uiStore.viewMode === 'mindmap') {
        const markdown = generateMarkdownFromNodes(nodes, centralNodeId);
        uiStore.setMarkdownContent(markdown);
      }
      
      // Toggle view mode after conversion
      uiStore.toggleViewMode();
    } catch (error) {
      console.error('Failed to switch view mode:', error);
    }
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const { nodes, centralNodeId } = await importFreeMind(file)
      
      // 在添加节点之前验证节点结构
      const validateNode = (node: INode) => {
        if (!node.id || !node.content || node.level === undefined) {
          throw new Error(`Invalid node structure: ${JSON.stringify(node)}`)
        }
        // Remove level restriction, keep it as a number
        if (typeof node.level !== 'number') {
          node.level = 1
        }
      }
      
      // 验证所有节点
      nodes.forEach(validateNode)

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
            level: nodeLevels.get(node.id) || 1, // Remove the type assertion
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

        // Position child nodes recursively using centralized configuration
        const positionChildNodes = (parentNode: INode, parentAngle: number, level: number, parentPos: {x: number, y: number}) => {
          const childNodes = nodes.filter(n => n.parentId === parentNode.id)
          const angleSpread = Math.PI / (level === 2 ? 8 : 6)
          const { angleConstraints, levelSpacing, variation } = nodeStore.nodeLayout
          
          childNodes.forEach((childNode, idx) => {
            const baseAngle = parentAngle + (angleSpread * (idx - (childNodes.length - 1) / 2) / Math.max(childNodes.length, 1))
            
            // Apply angle constraints and smoothing from config
            const smoothedAngle = parentAngle * angleConstraints.smoothing + 
                                baseAngle * (1 - angleConstraints.smoothing)
            const maxDev = angleConstraints.maxDeviation
            const childAngle = Math.max(Math.min(smoothedAngle, parentAngle + maxDev), parentAngle - maxDev)
            
            // Use level-specific spacing from config
            const baseRadius = level === 1 ? levelSpacing.first :
                             level === 2 ? levelSpacing.second :
                             levelSpacing.other
            
            // Apply radius variation
            const childRadius = baseRadius * (1 + (Math.random() - 0.5) * variation.radius)
            
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

    // After all nodes are processed and positioned, update markdown content
    const markdown = generateMarkdownFromNodes(nodeStore.allNodes, nodeStore.centralNodeId)
    uiStore.setMarkdownContent(markdown)
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <header className="bg-white shadow-sm py-3 px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-2">
      <div className="flex items-center gap-2">
        <img 
          src="/mindcomb-logo.png" 
          alt="Mindcomb Logo" 
          className="h-10 w-10 sm:h-8 sm:w-8"
        />
        <h1 className="text-2xl font-bold text-indigo-700">Mindcomb</h1>
      </div>
      
      <div className="flex flex-wrap justify-center gap-2 w-full sm:w-auto">
        <input
          type="file"
          accept=".mm"
          className="hidden"
          ref={fileInputRef}
          onChange={handleImport}
        />
        <button 
          className="min-w-[100px] px-6 py-3 sm:px-4 sm:py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition text-lg sm:text-base touch-manipulation"
          onClick={() => fileInputRef.current?.click()}
        >
          Import
        </button>
        <button 
          className="min-w-[100px] px-6 py-3 sm:px-4 sm:py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition text-lg sm:text-base touch-manipulation"
          onClick={handleExport}
        >
          Export
        </button>
        
        <button 
          className="min-w-[100px] px-6 py-3 sm:px-4 sm:py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition text-lg sm:text-base touch-manipulation"
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

// Add this helper function
const generateMarkdownFromNodes = (nodes: INode[], centralNodeId: string): string => {
  const centralNode = nodes.find(node => node.id === centralNodeId)
  if (!centralNode) return ''

  const processNode = (node: INode, level: number): string => {
    const header = '#'.repeat(level)
    let markdown = `${header} ${node.content}\n`
    
    const children = nodes.filter(n => n.parentId === node.id)
    children.forEach(child => {
      markdown += processNode(child, level + 1)
    })
    
    return markdown
  }

  return processNode(centralNode, 1)
}