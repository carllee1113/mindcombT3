import { useStore } from '../store/store'
import type { INode } from '../store/store'
import { generateFreeMindXML, downloadFreeMind } from '../utils/exportFreeMind'

const Header = () => {
  const { uiStore, nodeStore } = useStore()

  const handleExport = () => {
    const xml = generateFreeMindXML(nodeStore.allNodes, nodeStore.centralNodeId)
    downloadFreeMind(xml)
  }

  const handleViewModeSwitch = () => {
    uiStore.toggleViewMode();
  }

  return (
    <header className="bg-white shadow-sm py-3 px-6 flex justify-between items-center">
      <h1 className="text-2xl font-bold text-indigo-700">Mindcomb T3</h1>
      
      <div className="flex space-x-2">
        <button 
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
          onClick={handleExport}
        >
          Export
        </button>
        <button 
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
          onClick={handleViewModeSwitch}
          data-view-mindmap
        >
          {uiStore.viewMode === 'mindmap' ? 'View as Markdown' : 'View as Mind Map'}
        </button>
        <button 
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
          onClick={() => {
            // Calculate bounds of all nodes
            const nodes = nodeStore.allNodes
            if (nodes.length === 0) return

            let minX = Infinity, maxX = -Infinity
            let minY = Infinity, maxY = -Infinity

            nodes.forEach((node: INode) => {
              minX = Math.min(minX, node.position.x)
              maxX = Math.max(maxX, node.position.x)
              minY = Math.min(minY, node.position.y)
              maxY = Math.max(maxY, node.position.y)
            })

            // Calculate center and required scale
            const padding = 100
            const viewportWidth = window.innerWidth
            const viewportHeight = window.innerHeight
            const contentWidth = maxX - minX + padding * 2
            const contentHeight = maxY - minY + padding * 2

            const scaleX = viewportWidth / contentWidth
            const scaleY = viewportHeight / contentHeight
            const scale = Math.min(scaleX, scaleY, 1)

            // Center the content
            const centerX = (minX + maxX) / 2
            const centerY = (minY + maxY) / 2

            uiStore.setZoomLevel(scale)
            uiStore.setViewportPosition(
              viewportWidth / 2 - centerX * scale,
              viewportHeight / 2 - centerY * scale
            )
          }}
        >
          Show All
        </button>
      </div>
    </header>
  )
}

export default Header