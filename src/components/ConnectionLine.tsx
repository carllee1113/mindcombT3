import { observer } from 'mobx-react-lite'
import type { INode } from '../store/store'
import type { ConnectionPoint } from '../types/node'

interface ConnectionLineProps {
  sourceNode: INode
  targetNode: INode
  color: string
  sourcePoint: ConnectionPoint
  targetPoint: ConnectionPoint
}

const ConnectionLine = observer(({ sourceNode, targetNode, color, sourcePoint, targetPoint }: ConnectionLineProps) => {
  // Recalculate connection points based on current positions
  const dx = targetNode.position.x - sourceNode.position.x

  // Dynamically determine connection points
  let currentSourcePoint = sourcePoint
  let currentTargetPoint = targetPoint

  if (sourceNode.connectionPoints && targetNode.connectionPoints) {
    // Check if target node is a child of central node
    if (targetNode.parentId === sourceNode.id) {
      // For direct children of central node, use standard left/right connection
      if (dx > 0) {
        currentSourcePoint = sourceNode.connectionPoints.find(p => p.type === 'right') || sourcePoint
        currentTargetPoint = targetNode.connectionPoints.find(p => p.type === 'left') || targetPoint
      } else {
        currentSourcePoint = sourceNode.connectionPoints.find(p => p.type === 'left') || sourcePoint
        currentTargetPoint = targetNode.connectionPoints.find(p => p.type === 'right') || targetPoint
      }
    } else {
      // For subsequent levels, maintain the same side as parent
      const isRightBranch = dx > 0
      currentSourcePoint = sourceNode.connectionPoints.find(p => 
        isRightBranch ? p.type === 'right' : p.type === 'left'
      ) || sourcePoint
      currentTargetPoint = targetNode.connectionPoints.find(p => 
        isRightBranch ? p.type === 'left' : p.type === 'right'
      ) || targetPoint
    }
  }

  const startX = sourceNode.position.x + currentSourcePoint.x
  const startY = sourceNode.position.y + currentSourcePoint.y
  const endX = targetNode.position.x + currentTargetPoint.x
  const endY = targetNode.position.y + currentTargetPoint.y

  const deltaX = endX - startX
  const deltaY = endY - startY
  const controlPointOffset = Math.abs(deltaX) * 0.4
  const verticalOffset = Math.sign(deltaY) * Math.min(Math.abs(deltaY) * 0.2, 30)

  const path = deltaX > 0 
    ? `M ${startX} ${startY}
       C ${startX + controlPointOffset} ${startY + verticalOffset}
         ${endX - controlPointOffset} ${endY - verticalOffset}
         ${endX} ${endY}`
    : `M ${startX} ${startY}
       C ${startX - controlPointOffset} ${startY + verticalOffset}
         ${endX + controlPointOffset} ${endY - verticalOffset}
         ${endX} ${endY}`

  return (
    <svg
      style={{
        position: 'absolute',
        top: -10000,
        left: -10000,
        width: '20000px',
        height: '20000px',
        pointerEvents: 'none',
        overflow: 'visible',
      }}
    >
      <g transform="translate(10000, 10000)">
        <path
          d={path}
          stroke={color}
          strokeWidth={5}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  )
})

export default ConnectionLine