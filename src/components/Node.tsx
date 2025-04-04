import { observer } from 'mobx-react-lite'
import { useStore } from '../store/store'
import type { INode } from '../store/store'
import { NodeFactory, type NodeLevel } from '../store/nodeStore'
import { getBranchColor, branchColors } from '../utils/colors'
import { useState } from 'react'
import { generateElaboration } from '../utils/elaborationService'

// Add utility functions
const getNodeSizeClass = (node: INode) => {
  return node.level === 0 
    ? 'min-w-[200px] min-h-[80px] max-w-[300px]' 
    : 'min-w-[180px] min-h-[60px] max-w-[180px]' // Restrict width for child nodes
}

interface NodeProps {
  node: INode
  isCentral: boolean
}

const truncateContent = (content: string, isCentral: boolean) => {
  if (isCentral) return content;
  
  const lines = content.split('\n');
  const truncatedLines = lines.slice(0, 3).map(line => 
    line.length > 30 ? line.substring(0, 27) + '...' : line
  );
  return truncatedLines.join('\n');
}

// Remove NodeComponent and keep only the main Node component
const Node = observer(({ node, isCentral }: NodeProps) => {
  const { uiStore, nodeStore } = useStore()
  const [isHovered, setIsHovered] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const nodeColor = isCentral ? '#FF0000' : (node.branchColor || '#666666')
  const backgroundColor = isCentral ? 'white' : nodeColor + '4D' // Changed central node background to white

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
      // Calculate deltas with zoom level
      const deltaX = (e.clientX - uiStore.lastMouseX) / uiStore.zoomLevel
      const deltaY = (e.clientY - uiStore.lastMouseY) / uiStore.zoomLevel
      
      // Update node positions
      const newX = node.position.x + deltaX
      const newY = node.position.y + deltaY
      
      // Update the node and its connection points together
      nodeStore.updateNodePosition(node.id, { x: newX, y: newY })
      
      // Move all child nodes recursively with the same zoom-adjusted deltas
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
      
      // Update mouse position for next frame
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
    const childNodes = nodeStore.getChildNodes(node.id)
    const centralNode = nodeStore.getNodeById(nodeStore.centralNodeId)
    if (!centralNode) return
  
    const offset = 150
    const childCount = childNodes.length
  
    // Define the two regions (1-4 o'clock and 7-11 o'clock)
    const upperRegion = { start: -Math.PI / 6, end: Math.PI / 3 }    // ~30° to ~60°
    const lowerRegion = { start: -5 * Math.PI / 6, end: -Math.PI / 6 } // ~-150° to ~-30°
  
    // Determine which region to place the new node
    let angle
    if (childCount % 2 === 0) {
      // Even numbers go to upper region
      const progress = Math.floor(childCount / 2) / 3 // Divide upper region into 3 parts
      angle = upperRegion.start + (upperRegion.end - upperRegion.start) * progress
    } else {
      // Odd numbers go to lower region
      const progress = Math.floor(childCount / 2) / 3 // Divide lower region into 3 parts
      angle = lowerRegion.start + (lowerRegion.end - lowerRegion.start) * progress
    }
  
    const newPosition = {
      x: node.position.x + (offset * Math.cos(angle)),
      y: node.position.y + (offset * Math.sin(angle))
    }
    
    // Get all existing branch colors from direct children of central node
    const allFirstLevelNodes = nodeStore.getChildNodes(nodeStore.centralNodeId)
    const usedColors = new Set(allFirstLevelNodes.map(child => child.branchColor))
    
    let nextColor: string
    if (isCentral) {
      // Find the first unused color from the branchColors array
      const unusedColor = branchColors.find((color: string) => !usedColors.has(color))
      nextColor = unusedColor || getBranchColor(usedColors.size)
    } else {
      nextColor = node.branchColor
    }
    
    const newNode = NodeFactory.createChildNode({
      position: newPosition,
      title: 'New Subtopic',
      parentId: node.id,
      level: (node.level + 1) as NodeLevel,
      branchColor: nextColor
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
      elaboration.subtopics.forEach((subtopic, index) => {
        const firstLevelNodes = nodeStore.getChildNodes(nodeStore.centralNodeId)
        const existingColors = new Set(firstLevelNodes.map(child => child.branchColor))
        
        const newNode = NodeFactory.createChildNode({
          position: { x: 0, y: 0 },
          title: subtopic,
          parentId: node.id,
          level: (node.level + 1) as NodeLevel,
          branchColor: isCentral 
            ? getBranchColor(existingColors.size + index)
            : node.branchColor
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
        className={`absolute p-4 rounded-lg shadow-md transition-transform break-words text-center
          ${isCentral ? 'bg-white' : 'bg-white line-clamp-3'}
          ${getNodeSizeClass(node)}`}
        style={{
          transform: `translate(${node.position.x}px, ${node.position.y}px)`,
          cursor: uiStore.isDraggingNode && uiStore.draggedNodeId === node.id ? 'grabbing' : 'grab',
          border: `2px solid ${nodeColor}`,
          backgroundColor: backgroundColor
        }}
        onMouseDown={handleMouseDown}
        onDoubleClick={(e) => {
          e.stopPropagation()
          uiStore.openNodeEditModal(node.id)
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex flex-col items-center">
          <div className="text-sm text-center w-full">
            {truncateContent(node.content, isCentral)}
          </div>
          {isHovered && (
            <div className="flex gap-2 mt-2">
              {!isCentral && (
                <button
                  className={`w-5 h-5 rounded-full 
                    ${isLoading ? 'bg-gray-400' : 'bg-green-500'} text-white text-xs 
                    flex items-center justify-center hover:bg-green-600 transition-colors`}
                  onClick={handleElaborate}
                  disabled={isLoading}
                >
                  {isLoading ? '...' : '×'}
                </button>
              )}
              <button
                className="w-5 h-5 bg-blue-500 rounded-full text-white flex items-center justify-center text-sm hover:bg-blue-600 transition-colors"
                onClick={handleAddNode}
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
})

export default Node