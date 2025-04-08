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
    ? 'min-w-[120px] min-h-[10px] max-w-[300px]' 
    : 'min-w-[180px] min-h-[10px] max-w-[180px]'
}

interface NodeProps {
  node: INode
  isCentral: boolean
}

const truncateContent = (content: string, isCentral: boolean) => {
  if (isCentral) return content;
  
  // Split content into lines
  const lines = content.split('\n');
  
  // Process up to 3 lines
  const processedLines = lines.slice(0, 3).map((line, index) => {
    // Only truncate if we have all 3 lines and current line is too long
    if (lines.length >= 3 && line.length > 30) {
      return line.substring(0, 27) + '...';
    }
    return line;
  });
  
  // Pad with empty lines if needed
  while (processedLines.length < 3) {
    processedLines.push('');
  }
  
  return processedLines.join('\n');
}

// Remove NodeComponent and keep only the main Node component
const Node = observer(({ node, isCentral }: NodeProps) => {
  const { uiStore, nodeStore } = useStore()
  const [isHovered, setIsHovered] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const nodeColor = isCentral ? '#FF0000' : (node.branchColor || '#666666')

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    uiStore.openNodeEditModal(node.id)
  }

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
  
    // Determine if this is a first-level node (direct child of central node)
    const isFirstLevel = node.id === nodeStore.centralNodeId
    
    // For first level nodes, distribute evenly in a circle
    // For subsequent levels, distribute based on parent's position
    const isRightSide = isFirstLevel ? childCount % 2 === 0 : node.position.x > centralNode.position.x
    
    // Adjust angle ranges for better distribution
    const rightRange = { start: Math.PI / 12, end: 11 * Math.PI / 12 }    // 15° to 165°
    const leftRange = { start: -11 * Math.PI / 12, end: -Math.PI / 12 }  // -165° to -15°
    
    // Calculate angle with improved distribution
    const range = isRightSide ? rightRange : leftRange
    const maxNodesPerSide = 6
    const progress = (childCount % maxNodesPerSide) / maxNodesPerSide
    const angle = range.start + (range.end - range.start) * progress
    
    // Calculate new position with adjusted offset based on level
    const levelMultiplier = node.level === 0 ? 1 : 0.8
    const newPosition = {
      x: node.position.x + (offset * levelMultiplier * Math.cos(angle)),
      y: node.position.y + (offset * levelMultiplier * Math.sin(angle))
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

  const handleDeleteNode = (e: React.MouseEvent) => {
    e.stopPropagation()
    
    // Don't allow deleting the central node
    if (isCentral) return
    
    // Get the parent node and all child nodes
    const parentId = node.parentId
    if (!parentId) return
    
    const childNodes = nodeStore.getChildNodes(node.id)
    const connectionStore = nodeStore.getConnectionStore()
    
    // For each child node, create a new connection to the parent
    childNodes.forEach(childNode => {
      // Remove connection between this node and child
      connectionStore.removeConnection(node.id, childNode.id)
      
      // Create new connection between parent and child
      connectionStore.addConnection(parentId, childNode.id)
      
      // Update the child's parentId
      childNode.parentId = parentId
    })
    
    // Remove all connections for this node
    connectionStore.removeConnectionsForNode(node.id)
    
    // Remove the node
    nodeStore.removeNode(node.id)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation()
    if (e.touches.length === 1) {
      uiStore.startNodeDrag(node.id)
      uiStore.lastMouseX = e.touches[0].clientX
      uiStore.lastMouseY = e.touches[0].clientY
      
      // Add document-level event listeners
      document.addEventListener('touchmove', handleGlobalTouchMove, { passive: false })
      document.addEventListener('touchend', handleGlobalTouchEnd)
    }
  }

  const handleGlobalTouchMove = (e: TouchEvent) => {
    e.preventDefault() // Prevent scrolling while dragging
    if (uiStore.isDraggingNode && uiStore.draggedNodeId === node.id && e.touches.length === 1) {
      const touch = e.touches[0]
      // Calculate deltas with zoom level
      const deltaX = (touch.clientX - uiStore.lastMouseX) / uiStore.zoomLevel
      const deltaY = (touch.clientY - uiStore.lastMouseY) / uiStore.zoomLevel
      
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
      
      // Update touch position for next frame
      uiStore.lastMouseX = touch.clientX
      uiStore.lastMouseY = touch.clientY
    }
  }

  const handleGlobalTouchEnd = () => {
    if (uiStore.isDraggingNode) {
      uiStore.endNodeDrag()
      // Remove document-level event listeners
      document.removeEventListener('touchmove', handleGlobalTouchMove)
      document.removeEventListener('touchend', handleGlobalTouchEnd)
    }
  }

  return (
    <div
      key={node.id}
      className="relative"
    >
      <div
        className={`relative flex flex-col items-center justify-center p-2 rounded-lg shadow-md cursor-pointer select-none ${getNodeSizeClass(node)}`}
        style={{
          position: 'absolute',
          left: `${node.position.x}px`,
          top: `${node.position.y}px`,
          backgroundColor: 'white',
          border: `2px solid ${nodeColor}`,
          transform: `scale(${uiStore.zoomLevel})`,
          transformOrigin: '0 0',
          zIndex: isHovered ? 10 : 1,
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onDoubleClick={handleDoubleClick}
      >
        <div className="flex flex-col items-center h-full">
          <div className="text-sm text-center w-full h-[70%] overflow-hidden">
            {truncateContent(node.content, isCentral)}
          </div>
          {isHovered && (
            <div className="flex gap-2 mt-auto">
              {!isCentral && (
                <>
                  <button
                    className={`w-5 h-5 rounded-full 
                      ${isLoading ? 'bg-gray-400' : 'bg-green-500'} text-white text-xs 
                      flex items-center justify-center hover:bg-green-600 transition-colors`}
                    onClick={handleElaborate}
                    disabled={isLoading}
                  >
                    {isLoading ? '...' : '×'}
                  </button>
                  <button
                    className="w-5 h-5 bg-red-500 rounded-full text-white flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                    onClick={handleDeleteNode}
                  >
                    -
                  </button>
                </>
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