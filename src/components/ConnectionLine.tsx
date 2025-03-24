import { observer } from 'mobx-react-lite'
import type { INode } from '../store/store'
type ConnectionPoint = {
  x: number
  y: number
}

interface ConnectionLineProps {
  sourceNode: INode
  targetNode: INode
  color: string
  sourcePoint: ConnectionPoint
  targetPoint: ConnectionPoint
}

const ConnectionLine = observer(({ sourceNode, targetNode, color, sourcePoint, targetPoint }: ConnectionLineProps) => {
  const startX = sourceNode.position.x + sourcePoint.x
  const startY = sourceNode.position.y + sourcePoint.y
  const endX = targetNode.position.x + targetPoint.x
  const endY = targetNode.position.y + targetPoint.y

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    >
      <line
        x1={startX}
        y1={startY}
        x2={endX}
        y2={endY}
        stroke={color}
        strokeWidth={2}
      />
    </svg>
  )
})

export default ConnectionLine