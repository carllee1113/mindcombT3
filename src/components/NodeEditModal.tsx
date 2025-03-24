import { useState, useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { useStore } from '../store/store'

const NodeEditModal = observer(() => {
  const { uiStore, nodeStore } = useStore()
  const [title, setTitle] = useState('')
  
  // Get the node being edited
  const node = uiStore.selectedNodeId ? nodeStore.getNodeById(uiStore.selectedNodeId) : null
  
  useEffect(() => {
    if (node) {
      setTitle(node.content)
    }
  }, [node])
  
  const handleSave = () => {
    if (uiStore.selectedNodeId) {
      nodeStore.updateNodeTitle(uiStore.selectedNodeId, title)
      uiStore.closeNodeEditModal()
    }
  }
  
  if (!uiStore.isNodeEditModalOpen) {
    return null
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-xl font-bold mb-4">Edit Node</h2>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Node Text</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => uiStore.closeNodeEditModal()}
            className="px-4 py-2 border border-gray-300 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-indigo-600 text-white rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
})

export default NodeEditModal