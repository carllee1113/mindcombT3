import { observer } from 'mobx-react-lite'
import { useStore } from '../store/store'
import type { Connection as ConnectionType } from '../store/store'

interface ConnectionProps {
  connection: ConnectionType
}

const Connection = observer(({ connection }: ConnectionProps) => {
  const { nodeStore } = useStore()
  
  // Get source and target nodes
  const sourceNode = nodeStore.getNodeById(connection.sourceId)
  const targetNode = nodeStore.getNodeById(connection.targetId)
  
  if (!sourceNode || !targetNode) {
    return null
  }
  
  // Calculate line coordinates
  const x1 = sourceNode.x
  const y1 = sourceNode.y
  const x2 = targetNode.x
  const y2 = targetNode.y
  
  // SVG path
  const path = `M ${x1} ${y1} L ${x2} ${y2}`
  
  return (
    <svg 
      className="absolute top-0 left-0 w-full h-full pointer-events-none"
      style={{ zIndex: -1 }}
    >
      <path 
        d={path} 
        stroke="#6366F1" 
        strokeWidth="2" 
        fill="none" 
      />
    </svg>
  )
})

export default Connection