import React from 'react'
import { observer } from 'mobx-react-lite'
import { useStore } from '../store/store'

interface ControlPanelProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = observer(({
  onZoomIn,
  onZoomOut,
  onResetZoom
}) => {
  // Remove unused uiStore
  const { nodeStore } = useStore()

  const handleAddNode = () => {
    // Implementation using nodeStore
    nodeStore.addNode({
      id: Date.now().toString(),
      x: 200,
      y: 200,
      content: 'New node'
    })
  }

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col">
      <h2 className="font-bold text-gray-700 mb-4">Mind Map Tools</h2>
      
      <button 
        onClick={handleAddNode}
        className="bg-indigo-600 text-white px-4 py-2 rounded-md mb-3 hover:bg-indigo-700 flex items-center justify-center"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Add Node
      </button>
      
      <div className="mt-4">
        <h3 className="font-medium text-gray-700 mb-2">Zoom Controls</h3>
        <div className="flex space-x-2">
          <button 
            className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded"
            onClick={onZoomIn}
          >
            +
          </button>
          <button 
            className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded"
            onClick={onZoomOut}
          >
            -
          </button>
          <button 
            className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-xs"
            onClick={onResetZoom}
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  )
})

export default ControlPanel