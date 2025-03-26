import { observer } from 'mobx-react-lite'
import { useStore } from './store/store'
import MindMap from './components/MindMap'
import MarkdownView from './components/MarkdownView'
import Header from './components/Header'
import LandingPage from './components/LandingPage'

const App = observer(() => {
  const { uiStore } = useStore()

  return (
    <div className="h-screen">
      {uiStore.showLandingPage ? (
        <LandingPage />
      ) : (
        <>
          <Header />
          <main className="h-[calc(100vh-4rem)]">
            {uiStore.viewMode === 'mindmap' ? <MindMap /> : <MarkdownView />}
          </main>
        </>
      )}
    </div>
  )
})

export default App