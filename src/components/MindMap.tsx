import { observer } from 'mobx-react-lite'
import { useStore } from '../store/store'
import NodeComponent from './Node'
import ConnectionLine from './ConnectionLine'
import NodeEditModal from './NodeEditModal'
import type { ConnectionPoint } from '../types/node'
import { useEffect, useRef } from 'react'

export const MindMap = observer(() => {
  const { nodeStore, connectionStore, uiStore } = useStore()
  const touchStartRef = useRef({ x: 0, y: 0 })
  const pinchStartRef = useRef(0)
  const initialTouchDistanceRef = useRef(0)

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault()
        const zoomDelta = -e.deltaY * 0.001
        uiStore.setZoomLevel(Math.max(0.1, Math.min(2, uiStore.zoomLevel + zoomDelta)))
      }
    }

    document.addEventListener('wheel', handleWheel, { passive: false })
    return () => document.removeEventListener('wheel', handleWheel)
  }, [uiStore])

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only start panning on left click and when clicking empty space
    const target = e.target as HTMLElement
    if (e.button === 0 && (target.classList.contains('mindmap-container') || 
        target.classList.contains('mindmap-wrapper'))) {
      uiStore.startPan()
      uiStore.lastMouseX = e.clientX
      uiStore.lastMouseY = e.clientY
      
      document.addEventListener('mousemove', handleGlobalMouseMove)
      document.addEventListener('mouseup', handleGlobalMouseUp)
    }
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      // Single touch for panning
      const touch = e.touches[0]
      touchStartRef.current = { x: touch.clientX, y: touch.clientY }
      uiStore.startPan()
      uiStore.lastMouseX = touch.clientX
      uiStore.lastMouseY = touch.clientY
    } else if (e.touches.length === 2) {
      // Double touch for pinch zoom
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      )
      initialTouchDistanceRef.current = distance
      pinchStartRef.current = uiStore.zoomLevel
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault()
    if (e.touches.length === 1 && uiStore.isPanning) {
      // Handle panning
      const touch = e.touches[0]
      const deltaX = touch.clientX - uiStore.lastMouseX
      const deltaY = touch.clientY - uiStore.lastMouseY
      
      uiStore.setViewportPosition(
        uiStore.viewportX + deltaX,
        uiStore.viewportY + deltaY
      )
      
      uiStore.lastMouseX = touch.clientX
      uiStore.lastMouseY = touch.clientY
    } else if (e.touches.length === 2) {
      // Handle pinch zoom
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      )
      
      const scale = distance / initialTouchDistanceRef.current
      const newZoom = Math.max(0.1, Math.min(2, pinchStartRef.current * scale))
      uiStore.setZoomLevel(newZoom)
    }
  }

  const handleTouchEnd = () => {
    if (uiStore.isPanning) {
      uiStore.endPan()
    }
  }

  const handleGlobalMouseMove = (e: MouseEvent) => {
    if (uiStore.isPanning) {
      const deltaX = e.clientX - uiStore.lastMouseX
      const deltaY = e.clientY - uiStore.lastMouseY
      
      uiStore.setViewportPosition(
        uiStore.viewportX + deltaX,
        uiStore.viewportY + deltaY
      )
      
      uiStore.lastMouseX = e.clientX
      uiStore.lastMouseY = e.clientY
    }
  }

  const handleGlobalMouseUp = () => {
    if (uiStore.isPanning) {
      uiStore.endPan()
      document.removeEventListener('mousemove', handleGlobalMouseMove)
      document.removeEventListener('mouseup', handleGlobalMouseUp)
    }
  }

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
          key={`${conn.id || `${conn.sourceId}-${conn.targetId}`}`}
          sourceNode={sourceNode}
          targetNode={targetNode}
          sourcePoint={sourcePoint}
          targetPoint={targetPoint}
          color={targetNode.branchColor || '#4A5568'}
        />
      )
    })
  }

  const handleDoubleClick = (e: React.MouseEvent) => {
    // Check if clicking on the mindmap container or its direct wrapper
    const target = e.target as HTMLElement
    if (target.classList.contains('mindmap-container') || 
        target.classList.contains('mindmap-wrapper')) {
      const zoomIncrement = 0.2
      uiStore.setZoomLevel(uiStore.zoomLevel + zoomIncrement)
    }
  }

  return (
    <div 
      className="mindmap-container relative w-full h-full overflow-hidden touch-none"
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div 
        className="mindmap-wrapper"
        style={{
          transform: `translate(${uiStore.viewportX}px, ${uiStore.viewportY}px) scale(${uiStore.zoomLevel})`,
          transformOrigin: 'center',
          position: 'absolute',
          width: '100%',
          height: '100%',
          cursor: uiStore.isPanning ? 'grabbing' : 'grab'
        }}
      >
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