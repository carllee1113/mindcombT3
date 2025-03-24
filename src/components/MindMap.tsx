import { observer } from 'mobx-react-lite'
import { useStore } from '../store/store'
import NodeComponent from './Node'
import Connection from './Connection'
import NodeEditModal from './NodeEditModal'
import { useCallback } from 'react'

export const MindMap = observer(() => {
  const { nodeStore, connectionStore, uiStore } = useStore()

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      e.preventDefault()
      uiStore.startPan(e.clientX, e.clientY)
    }
  }, [uiStore])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (uiStore.isDragging) {
      e.preventDefault()
      requestAnimationFrame(() => {
        uiStore.updatePan(e.clientX, e.clientY)
      })
    }
  }, [uiStore])

  const handleMouseUp = useCallback(() => {
    if (uiStore.isDragging) {
      uiStore.endPan()
    }
  }, [uiStore])

  return (
    <div className="mindmap-container relative w-full h-full overflow-hidden"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{
        cursor: uiStore.isDragging ? 'grabbing' : 'default'
      }}
    >
      <div style={{
        transform: `translate(${uiStore.viewportX}px, ${uiStore.viewportY}px) scale(${uiStore.zoomLevel})`,
        transformOrigin: 'center',
        transition: uiStore.isDragging ? 'none' : 'transform 0.2s ease',
        position: 'absolute',
        width: '100%',
        height: '100%'
      }}>
        <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
          {connectionStore.connections.map(connection => (
            <Connection 
              key={`${connection.sourceId}-${connection.targetId}`}
              connection={connection}
            />
          ))}
        </svg>
        
        <div className="relative w-full h-full">
          {nodeStore.allNodes.map(node => (
            <NodeComponent 
              key={node.id}
              node={node}
              isCentral={node.id === nodeStore.centralNodeId}
            />
          ))}
        </div>
      </div>
      
      <NodeEditModal />
    </div>
  )
})

export default MindMap