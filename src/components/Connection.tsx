import { observer } from 'mobx-react-lite'
import type { INode } from '../store/store'

interface ConnectionProps {
  sourceNode: INode
  targetNode: INode
  color: string
}

const Connection = observer(({ sourceNode, targetNode, color }: ConnectionProps) => {
  const startX = sourceNode.position.x
  const startY = sourceNode.position.y
  const endX = targetNode.position.x
  const endY = targetNode.position.y

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

export default Connection