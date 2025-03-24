import React from 'react'
import { observer } from 'mobx-react-lite'
import { useStore } from './store/store'
import MindMap from './components/MindMap'
import MarkdownView from './components/MarkdownView'
import Header from './components/Header'

const App = observer(() => {
  const { uiStore } = useStore()

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 relative overflow-auto">
          {uiStore.viewMode === 'mindmap' ? <MindMap /> : <MarkdownView />}
        </div>
      </div>
    </div>
  )
})

export default App