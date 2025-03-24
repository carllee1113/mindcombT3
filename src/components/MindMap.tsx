// Remove React import since it's not used
import { observer } from 'mobx-react-lite'
import { useStore } from '../store/store'
import NodeComponent from './Node'
import Connection from './Connection'
import NodeEditModal from './NodeEditModal'

const MindMap = observer(() => {
  const { nodeStore, connectionStore, uiStore } = useStore()
  
  return (
    <div className="relative w-full h-full"
      style={{
        transform: `scale(${uiStore.zoomLevel})`,
        transformOrigin: 'center',
        transition: 'transform 0.2s ease'
      }}>
      {/* Render connections */}
      {connectionStore.connections.map(connection => (
        <Connection 
          key={`${connection.sourceId}-${connection.targetId}`}
          connection={connection}
        />
      ))}
      
      {/* Render nodes */}
      {nodeStore.nodes.map(node => (
        <NodeComponent 
          key={node.id}
          node={node}
          isCentral={node.id === nodeStore.centralNodeId}
        />
      ))}
      
      <NodeEditModal />
    </div>
  )
})

export default MindMap