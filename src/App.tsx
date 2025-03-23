import { observer } from 'mobx-react-lite'
import { useStore } from './store/store'
import { ControlPanel } from './components/ControlPanel'
// Change imports to match component exports
import MindMap from './components/MindMap'  // Default import
import { Header } from './components/Header' // Named import
import { useCallback } from 'react'

export const App = observer(() => {
  const { uiStore } = useStore()
  
  // Use memoized callbacks to prevent unnecessary re-renders
  const handleZoomIn = useCallback(() => {
    uiStore.zoomIn()
  }, [uiStore])
  
  const handleZoomOut = useCallback(() => {
    uiStore.zoomOut()
  }, [uiStore])
  
  const handleResetZoom = useCallback(() => {
    uiStore.resetZoom()
  }, [uiStore])
  
  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        <ControlPanel 
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onResetZoom={handleResetZoom}
        />
        
        <div className="flex-1 relative overflow-auto">
          <MindMap />
        </div>
      </div>
    </div>
  )
})

export default App