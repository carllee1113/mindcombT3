import React, { useMemo } from 'react'
import { observer } from 'mobx-react-lite'
import { useStore } from './store/store'
import { ControlPanel } from './components/ControlPanel'
import MindMap from './components/MindMap.tsx'
import Header from './components/Header.tsx'

const App = observer(() => {
  const { uiStore } = useStore()
  
  // Prevent unnecessary re-renders by using stable references
  const memoizedHandlers = useMemo(() => ({
    handleZoomIn: () => uiStore.zoomIn(),
    handleZoomOut: () => uiStore.zoomOut(),
    handleResetZoom: () => uiStore.resetZoom()
  }), [uiStore])
  
  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        <ControlPanel 
          onZoomIn={memoizedHandlers.handleZoomIn}
          onZoomOut={memoizedHandlers.handleZoomOut}
          onResetZoom={memoizedHandlers.handleResetZoom}
        />
        
        <div className="flex-1 relative overflow-auto">
          <MindMap />
        </div>
      </div>
    </div>
  )
})

export default React.memo(App)