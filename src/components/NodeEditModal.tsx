import { useState, useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { useStore } from '../store/store'

const NodeEditModal = observer(() => {
  const { uiStore, nodeStore } = useStore()
  const [content, setContent] = useState('')
  
  const node = uiStore.selectedNodeId ? nodeStore.getNodeById(uiStore.selectedNodeId) : null
  
  useEffect(() => {
    if (node) {
      setContent(node.content)
    }
  }, [node])

  const handleSave = () => {
    if (uiStore.selectedNodeId) {
      nodeStore.updateNodeContent(uiStore.selectedNodeId, content)
      uiStore.closeNodeEditModal()
    }
  }

  if (!uiStore.isNodeEditModalOpen || !node) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-4 rounded-lg shadow-lg w-96">
        <h2 className="text-lg font-semibold mb-4">Edit Node</h2>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-32 p-2 border rounded mb-4"
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={() => uiStore.closeNodeEditModal()}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
})

export default NodeEditModal