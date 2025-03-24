import { observer } from 'mobx-react-lite'
import { useStore } from '../store/store'
import NodeComponent from './Node'
import ConnectionLine from './ConnectionLine'
import NodeEditModal from './NodeEditModal'
import type { ConnectionPoint } from '../types/node'

export const MindMap = observer(() => {
  const { nodeStore, connectionStore, uiStore } = useStore()

  const handleMouseUp = () => {
    if (uiStore.isDraggingNode) {
      uiStore.endNodeDrag()
    }
  }

  const renderConnections = () => {
    return connectionStore.connections.map(conn => {
      const sourceNode = nodeStore.getNodeById(conn.sourceId)
      const targetNode = nodeStore.getNodeById(conn.targetId)
      
      if (!sourceNode || !targetNode) return null

      const dx = targetNode.position.x - sourceNode.position.x
      const dy = targetNode.position.y - sourceNode.position.y

      // Determine which side of the child node to connect
      let targetPoint: ConnectionPoint
      let sourcePoint: ConnectionPoint

      if (sourceNode.id === nodeStore.centralNodeId) {
        // For central node, select connection point based on quadrant
        if (Math.abs(dx) > Math.abs(dy)) {
          // Horizontal connection
          if (dx > 0) {
            sourcePoint = sourceNode.connectionPoints.find(p => p.type === 'rightTop')!
            targetPoint = targetNode.connectionPoints.find(p => p.type === 'left')!
          } else {
            sourcePoint = sourceNode.connectionPoints.find(p => p.type === 'leftTop')!
            targetPoint = targetNode.connectionPoints.find(p => p.type === 'right')!
          }
        } else {
          // Vertical connection
          if (dy > 0) {
            sourcePoint = sourceNode.connectionPoints.find(p => p.type === 'rightBottom')!
            targetPoint = targetNode.connectionPoints.find(p => p.type === 'left')!
          } else {
            sourcePoint = sourceNode.connectionPoints.find(p => p.type === 'leftBottom')!
            targetPoint = targetNode.connectionPoints.find(p => p.type === 'right')!
          }
        }
      } else {
        // For non-central nodes, use simple left-right connection
        sourcePoint = sourceNode.connectionPoints.find(p => dx > 0 ? p.type === 'right' : p.type === 'left')!
        targetPoint = targetNode.connectionPoints.find(p => dx > 0 ? p.type === 'left' : p.type === 'right')!
      }

      return (
        <ConnectionLine
          key={`${conn.sourceId}-${conn.targetId}`}
          sourceNode={sourceNode}
          targetNode={targetNode}
          sourcePoint={sourcePoint}
          targetPoint={targetPoint}
          color={targetNode.branchColor || '#4A5568'}
        />
      )
    })
  }

  return (
    <div 
      className="mindmap-container relative w-full h-full overflow-hidden"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div style={{
        transform: `translate(${uiStore.viewportX}px, ${uiStore.viewportY}px) scale(${uiStore.zoomLevel})`,
        transformOrigin: 'center',
        position: 'absolute',
        width: '100%',
        height: '100%'
      }}>
        {renderConnections()}
        {nodeStore.allNodes.map(node => (
          <NodeComponent 
            key={node.id}
            node={node}
            isCentral={node.id === nodeStore.centralNodeId}
          />
        ))}
      </div>
      <NodeEditModal />
    </div>
  )
})

export default MindMap