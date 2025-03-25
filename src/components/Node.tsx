import { observer } from 'mobx-react-lite'
import { useStore } from '../store/store'
import type { INode } from '../store/store'
import { NodeFactory, type NodeLevel } from '../store/nodeStore'
import { getRandomColor } from '../utils/colors'
import { useState } from 'react'
import { generateElaboration } from '../utils/elaborationService'

// Add utility functions
const getNodeSizeClass = (node: INode) => {
  return node.level === 0 ? 'w-48 h-24' : 'w-40 h-16'
}

const getBorderColorClass = (node: INode) => {
  return `border-2 ${node.branchColor ? `border-[${node.branchColor}]` : 'border-gray-400'}`
}

interface NodeProps {
  node: INode
  isCentral: boolean
}

const NodeComponent = observer(({ node, isCentral }: NodeProps) => {
  const { uiStore, nodeStore } = useStore()
  const [isHovered, setIsHovered] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      e.stopPropagation()
      uiStore.startNodeDrag(node.id)
      uiStore.lastMouseX = e.clientX
      uiStore.lastMouseY = e.clientY
      
      // Add document-level event listeners
      document.addEventListener('mousemove', handleGlobalMouseMove)
      document.addEventListener('mouseup', handleGlobalMouseUp)
    }
  }

  const handleGlobalMouseMove = (e: MouseEvent) => {
    if (uiStore.isDraggingNode && uiStore.draggedNodeId === node.id) {
      const deltaX = (e.clientX - uiStore.lastMouseX) / uiStore.zoomLevel
      const deltaY = (e.clientY - uiStore.lastMouseY) / uiStore.zoomLevel
      
      // Move current node
      const newX = node.position.x + deltaX
      const newY = node.position.y + deltaY
      nodeStore.updateNodePosition(node.id, { x: newX, y: newY })
      
      // Move all child nodes recursively
      const moveChildNodes = (parentId: string, dx: number, dy: number) => {
        const childNodes = nodeStore.getChildNodes(parentId)
        childNodes.forEach(childNode => {
          const newChildX = childNode.position.x + dx
          const newChildY = childNode.position.y + dy
          nodeStore.updateNodePosition(childNode.id, { x: newChildX, y: newChildY })
          moveChildNodes(childNode.id, dx, dy)
        })
      }
      
      moveChildNodes(node.id, deltaX, deltaY)
      
      uiStore.lastMouseX = e.clientX
      uiStore.lastMouseY = e.clientY
    }
  }

  const handleGlobalMouseUp = () => {
    if (uiStore.isDraggingNode) {
      uiStore.endNodeDrag()
      // Remove document-level event listeners
      document.removeEventListener('mousemove', handleGlobalMouseMove)
      document.removeEventListener('mouseup', handleGlobalMouseUp)
    }
  }

  const handleAddNode = (e: React.MouseEvent) => {
    e.stopPropagation()
    const centralNode = nodeStore.getNodeById(nodeStore.centralNodeId)
    if (!centralNode) return
  
    const offset = 150
    const dx = node.position.x - centralNode.position.x
    
    const newPosition = {
      x: node.position.x + (dx > 0 ? offset : -offset),
      y: node.position.y + (Math.random() - 0.5) * 50
    }
    
    const newNode = NodeFactory.createChildNode({
      position: newPosition,
      title: 'New Subtopic',
      parentId: node.id,
      level: (node.level + 1) as NodeLevel,
      branchColor: node.branchColor || getRandomColor()
    })
    
    nodeStore.addNode(newNode)
    nodeStore.getConnectionStore().addConnection(node.id, newNode.id)
  }

  const handleElaborate = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      setIsLoading(true)
      const mainNode = nodeStore.getNodeById(nodeStore.centralNodeId)
      if (!mainNode) return

      const elaboration = await generateElaboration(
        node.content,
        mainNode.content
      )

      // Create new child nodes for each subtopic
      elaboration.subtopics.forEach((subtopic) => {
        const newNode = NodeFactory.createChildNode({
          position: { x: 0, y: 0 },
          title: subtopic,
          parentId: node.id,
          level: (node.level + 1) as NodeLevel,
          branchColor: node.branchColor
        })
        nodeStore.addNode(newNode)
        nodeStore.getConnectionStore().addConnection(node.id, newNode.id)
      })

      // Realign nodes after adding new ones
      nodeStore.alignFirstLayerNodes()
    } catch (error) {
      console.error('Elaboration failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      key={node.id}
      className="relative"
    >
      <div
        className={`absolute p-4 rounded-lg shadow-md transition-transform 
          ${isCentral ? 'bg-white' : 'bg-white'}
          ${getNodeSizeClass(node)}
          ${getBorderColorClass(node)}`}
        style={{
          transform: `translate(${node.position.x}px, ${node.position.y}px)`,
          cursor: uiStore.isDraggingNode && uiStore.draggedNodeId === node.id ? 'grabbing' : 'grab',
          border: `2px solid ${node.branchColor || '#4A5568'}`,
        }}
        onMouseDown={handleMouseDown}
        onDoubleClick={(e) => {
          e.stopPropagation()
          uiStore.openNodeEditModal(node.id)
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="text-sm">
          {node.content}
        </div>
        {isHovered && (
          <>
            <button
              className="absolute -right-2 top-1/2 -translate-y-1/2 w-5 h-5 bg-blue-500 rounded-full text-white flex items-center justify-center text-sm hover:bg-blue-600 transition-colors"
              onClick={handleAddNode}
            >
              +
            </button>
            {!isCentral && (
              <button
                className={`absolute -left-6 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full 
                  ${isLoading ? 'bg-gray-400' : 'bg-red-500'} text-white text-xs 
                  flex items-center justify-center hover:bg-red-600 transition-colors`}
                onClick={handleElaborate}
                disabled={isLoading}
              >
                {isLoading ? '...' : '×'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
})

export default NodeComponent