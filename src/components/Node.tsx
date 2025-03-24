import { observer } from 'mobx-react-lite'
import { useStore } from '../store/store'
import type { INode } from '../store/store'

interface NodeProps {
  node: INode
  isCentral: boolean
}

const NodeComponent = observer(({ node, isCentral }: NodeProps) => {
  const { uiStore } = useStore()

  return (
    <div
      key={node.id}
      className={`absolute p-4 rounded-lg shadow-md transition-transform ${
        isCentral ? 'bg-indigo-600 text-white' :
        node.level === 1 ? 'bg-indigo-100 text-gray-800' :
        node.level === 2 ? 'bg-white text-gray-800' :
        'bg-gray-50 text-gray-600'
      }`}
      style={{
        transform: `translate(${node.position.x}px, ${node.position.y}px)`,
        cursor: 'pointer'
      }}
      onDoubleClick={(e) => {
        e.stopPropagation()
        uiStore.openNodeEditModal(node.id)
      }}
    >
      <div className="text-sm">
        {node.content}
      </div>
    </div>
  )
})

export default NodeComponent