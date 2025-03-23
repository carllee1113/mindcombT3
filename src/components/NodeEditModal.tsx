import React, { useState, useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { useStore } from '../store/store'

export const NodeEditModal: React.FC = observer(() => {
  const { nodeStore, uiStore } = useStore()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  
  const node = uiStore.selectedNodeId ? nodeStore.getNodeById(uiStore.selectedNodeId) : null
  
  useEffect(() => {
    if (node) {
      setTitle(node.title || '')
      setContent(node.content || '')
    }
  }, [node])
  
  const handleSave = () => {
    if (node && uiStore.selectedNodeId) {
      nodeStore.updateNodeTitle(uiStore.selectedNodeId, title)
      nodeStore.updateNodeContent(uiStore.selectedNodeId, content)
      uiStore.closeNodeEditModal()
    }
  }
  
  if (!uiStore.isNodeEditModalOpen || !node) return null
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-96 p-6">
        <h2 className="text-xl font-bold mb-4">Edit Node</h2>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Content
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
          />
        </div>
        
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => uiStore.closeNodeEditModal()}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
})

export default NodeEditModal