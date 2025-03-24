import React from 'react'
import { observer } from 'mobx-react-lite'
import { useStore } from '../store/store'
import type { Node as NodeType } from '../store/store'

interface NodeProps {
  node: NodeType
  isCentral: boolean
}

const Node = observer(({ node, isCentral }: NodeProps) => {
  const { uiStore, nodeStore } = useStore()
  
  const handleNodeClick = () => {
    uiStore.openNodeEditModal(node.id)
  }
  
  const handleRemoveNode = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isCentral) {
      nodeStore.removeNode(node.id)
    }
  }
  
  return (
    <div 
      className={`absolute rounded-md p-3 shadow-md bg-white border ${
        isCentral ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
      }`}
      style={{
        left: `${node.x}px`,
        top: `${node.y}px`,
        transform: 'translate(-50%, -50%)',
        minWidth: '120px',
        textAlign: 'center',
        cursor: 'pointer'
      }}
      onClick={handleNodeClick}
    >
      {node.content}
      {!isCentral && (
        <button 
          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
          onClick={handleRemoveNode}
        >
          ×
        </button>
      )}
    </div>
  )
})

export default Node