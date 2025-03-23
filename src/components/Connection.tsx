import React from 'react'
import { observer } from 'mobx-react-lite'
import { useStore } from '../store/store'
import { Connection as ConnectionType } from '../store/connectionStore'

interface ConnectionProps {
  connection: ConnectionType
}

export const Connection: React.FC<ConnectionProps> = observer(({ connection }) => {
  const { nodeStore } = useStore()
  
  // Find source and target nodes
  const sourceNode = nodeStore.getNodeById(connection.sourceId)
  const targetNode = nodeStore.getNodeById(connection.targetId)
  
  if (!sourceNode || !targetNode) return null
  
  // Calculate line coordinates (center of nodes)
  const sourceX = sourceNode.x + 100 // Assuming node width is 200px
  const sourceY = sourceNode.y + 40  // Approximate center of node
  const targetX = targetNode.x + 100
  const targetY = targetNode.y + 40
  
  // Calculate control points for curve
  const dx = Math.abs(targetX - sourceX) * 0.5
  const controlPoint1X = sourceX + dx
  const controlPoint1Y = sourceY
  const controlPoint2X = targetX - dx
  const controlPoint2Y = targetY
  
  return (
    <svg 
      className="absolute top-0 left-0 w-full h-full pointer-events-none"
      style={{ zIndex: 5 }}
    >
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#6366F1" />
        </marker>
      </defs>
      <path
        d={`M ${sourceX} ${sourceY} C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${targetX} ${targetY}`}
        stroke="#6366F1"
        strokeWidth="2"
        fill="none"
        markerEnd="url(#arrowhead)"
      />
    </svg>
  )
})

export default Connection