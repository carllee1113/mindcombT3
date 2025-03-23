import React from 'react'
import { observer } from 'mobx-react-lite'
import { useStore } from '../store/store'

// Single observer declaration
const MindMap = observer(() => {
  const { nodeStore, connectionStore, uiStore } = useStore()
  
  return (
    <div className="canvas-container" style={{
      transform: `scale(${uiStore.zoomLevel})`,
      transformOrigin: '0 0'
    }}>
      {/* Render connections */}
      {connectionStore.connections.map(connection => (
        <div 
          key={`${connection.sourceId}-${connection.targetId}`}
          className="connection"
        >
          {/* Connection rendering logic */}
        </div>
      ))}
      
      {/* Render nodes */}
      {nodeStore.nodes.map(node => (
        <div 
          key={node.id}
          className="node"
          style={{
            position: 'absolute',
            left: `${node.x}px`,
            top: `${node.y}px`
          }}
        >
          {node.content}
        </div>
      ))}
    </div>
  )
})

export default MindMap