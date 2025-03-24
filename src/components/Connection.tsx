import { observer } from 'mobx-react-lite'
import { useStore } from '../store/store'

interface ConnectionProps {
  connection: {
    sourceId: string
    targetId: string
  }
}

const Connection = observer(({ connection }: ConnectionProps) => {
  const { nodeStore } = useStore()
  
  const sourceNode = nodeStore.getNodeById(connection.sourceId)
  const targetNode = nodeStore.getNodeById(connection.targetId)
  
  if (!sourceNode || !targetNode) return null

  return (
    <line
      x1={sourceNode.position.x}
      y1={sourceNode.position.y}
      x2={targetNode.position.x}
      y2={targetNode.position.y}
      stroke="#6366F1"
      strokeWidth="2"
    />
  )
})

export default Connection