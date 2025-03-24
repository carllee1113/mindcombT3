import { observer } from 'mobx-react-lite'
import { useStore } from '../store/store'
import type { INode } from '../store/store'

interface NodeProps {
  node: INode
  isCentral: boolean
}

const NodeComponent = observer(({ node, isCentral }: NodeProps) => {
  const { uiStore, nodeStore } = useStore()

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      e.stopPropagation()
      uiStore.startNodeDrag(node.id)
      uiStore.lastMouseX = e.clientX
      uiStore.lastMouseY = e.clientY
      
      // Add document-level event listeners
      document.addEventListener('mousemove', handleGlobalMouseMove)
      document.addEventListener('mouseup', handleGlobalMouseUp)
    }
  }

  const handleGlobalMouseMove = (e: MouseEvent) => {
    if (uiStore.isDraggingNode && uiStore.draggedNodeId === node.id) {
      const deltaX = (e.clientX - uiStore.lastMouseX) / uiStore.zoomLevel
      const deltaY = (e.clientY - uiStore.lastMouseY) / uiStore.zoomLevel
      
      const newX = node.position.x + deltaX
      const newY = node.position.y + deltaY
      
      nodeStore.updateNodePosition(node.id, { x: newX, y: newY })
      
      uiStore.lastMouseX = e.clientX
      uiStore.lastMouseY = e.clientY
    }
  }

  const handleGlobalMouseUp = () => {
    if (uiStore.isDraggingNode) {
      uiStore.endNodeDrag()
      // Remove document-level event listeners
      document.removeEventListener('mousemove', handleGlobalMouseMove)
      document.removeEventListener('mouseup', handleGlobalMouseUp)
    }
  }

  return (
    <div
      key={node.id}
      className={`absolute p-4 rounded-lg shadow-md transition-transform ${
        isCentral ? 'bg-white' :
        'bg-white'
      }`}
      style={{
        transform: `translate(${node.position.x}px, ${node.position.y}px)`,
        cursor: uiStore.isDraggingNode && uiStore.draggedNodeId === node.id ? 'grabbing' : 'grab',
        border: `2px solid ${node.branchColor || '#4A5568'}`,
      }}
      onMouseDown={handleMouseDown}
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