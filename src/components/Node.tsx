import React, { useState } from 'react'
import { observer } from 'mobx-react-lite'
import { useStore } from '../store/store'
import { Node as NodeType } from '../store/nodeStore'

interface NodeProps {
  node: NodeType
}

export const Node: React.FC<NodeProps> = observer(({ node }) => {
  const { nodeStore, uiStore } = useStore()
  const [isDragging, setIsDragging] = useState(false)
  
  // Handle node drag
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsDragging(true)
    // Dragging implementation will be added later
  }
  
  // Handle double click to edit
  const handleDoubleClick = () => {
    uiStore.openNodeEditModal(node.id)
  }
  
  // Determine if this is the central/root node
  const isCentralNode = node.id === nodeStore.centralNodeId
  
  return (
    <div 
      className={`absolute rounded-lg ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} transition-shadow duration-200`}
      style={{ 
        left: `${node.x}px`, 
        top: `${node.y}px`,
        zIndex: isDragging ? 20 : 10,
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
    >
      <div className={`bg-white rounded-lg shadow-lg overflow-hidden border ${isCentralNode ? 'border-indigo-500' : 'border-gray-200'}`}>
        <div className={`px-4 py-2 flex justify-between items-center ${isCentralNode ? 'bg-indigo-600' : 'bg-gray-100'}`}>
          <h3 className={`font-medium text-sm truncate ${isCentralNode ? 'text-white' : 'text-gray-700'}`}>
            {node.title || `Node ${node.id.substring(0, 4)}`}
          </h3>
          
          {!isCentralNode && (
            <button 
              onClick={(e) => {
                e.stopPropagation()
                nodeStore.removeNode(node.id)
              }}
              className="text-gray-500 hover:text-red-500"
            >
              ×
            </button>
          )}
        </div>
        
        <div className="p-3 text-gray-700 text-sm">
          {node.content}
        </div>
      </div>
    </div>
  )
})

export default Node