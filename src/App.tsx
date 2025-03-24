import React from 'react'
import { observer } from 'mobx-react-lite'
import MindMap from './components/MindMap.tsx'
import Header from './components/Header.tsx'

const App = observer(() => {
  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 relative overflow-auto">
          <MindMap />
        </div>
      </div>
    </div>
  )
})

export default React.memo(App)