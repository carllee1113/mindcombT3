import { observer } from 'mobx-react-lite'
import { useStore } from '../store/store'

export const ControlPanel = observer(() => {
  const { uiStore } = useStore()

  return (
    <div className="fixed bottom-4 right-4 flex gap-2">
      <button
        onClick={() => uiStore.zoomIn()}
        className="bg-white p-2 rounded-lg shadow-md hover:bg-gray-50"
      >
        <span className="text-xl">+</span>
      </button>
      <button
        onClick={() => uiStore.zoomOut()}
        className="bg-white p-2 rounded-lg shadow-md hover:bg-gray-50"
      >
        <span className="text-xl">-</span>
      </button>
      <button
        onClick={() => uiStore.resetZoom()}
        className="bg-white px-3 py-2 rounded-lg shadow-md hover:bg-gray-50"
      >
        Reset
      </button>
    </div>
  )
})

export default ControlPanel