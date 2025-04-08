import { observer } from 'mobx-react-lite'
import { useStore } from '../store/store'
import { useState, useEffect } from 'react'
import NodeEditor from './NodeEditor'

const NodeEditModal = observer(() => {
  const { uiStore, nodeStore } = useStore()
  const [editedContent, setEditedContent] = useState('')
  
  const node = uiStore.selectedNodeId ? nodeStore.getNodeById(uiStore.selectedNodeId) : null

  useEffect(() => {
    if (node) {
      setEditedContent(node.content)
    }
  }, [node])

  const handleSave = () => {
    if (node) {
      nodeStore.updateNodeContent(node.id, editedContent)
      uiStore.closeNodeEditModal()
    }
  }

  if (!uiStore.isNodeEditModalOpen || !node) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-h-[90vh] flex flex-col mx-4">
        <h2 className="text-xl font-semibold mb-4">Edit Node</h2>
        <div className="flex-grow overflow-auto mb-4">
          {uiStore.selectedNodeId && <NodeEditor nodeId={uiStore.selectedNodeId} onContentChange={setEditedContent} />}
        </div>
        <div className="flex justify-end gap-3">
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