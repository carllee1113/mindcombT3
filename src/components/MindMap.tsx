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

      // Calculate relative position to determine connection points
      const dx = targetNode.position.x - sourceNode.position.x
      const dy = targetNode.position.y - sourceNode.position.y

      let sourcePoint: ConnectionPoint
      let targetPoint: ConnectionPoint

      if (sourceNode.id === nodeStore.centralNodeId) {
        // For central node, select connection point based on target position
        if (dx > 0 && Math.abs(dy) < Math.abs(dx)) {
          sourcePoint = sourceNode.connectionPoints.find(p => p.type === 'right')!
          targetPoint = targetNode.connectionPoints.find(p => p.type === 'left')!
        } else if (dx < 0 && Math.abs(dy) < Math.abs(dx)) {
          sourcePoint = sourceNode.connectionPoints.find(p => p.type === 'left')!
          targetPoint = targetNode.connectionPoints.find(p => p.type === 'right')!
        } else if (dy > 0) {
          sourcePoint = sourceNode.connectionPoints.find(p => dx > 0 ? p.type === 'rightBottom' : p.type === 'leftBottom')!
          targetPoint = targetNode.connectionPoints.find(p => p.type === 'leftTop')!
        } else {
          sourcePoint = sourceNode.connectionPoints.find(p => dx > 0 ? p.type === 'rightTop' : p.type === 'leftTop')!
          targetPoint = targetNode.connectionPoints.find(p => p.type === 'leftBottom')!
        }
      } else {
        // For non-central nodes, use simple left-right connection
        sourcePoint = sourceNode.connectionPoints.find(p => p.type === 'right')!
        targetPoint = targetNode.connectionPoints.find(p => p.type === 'left')!
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