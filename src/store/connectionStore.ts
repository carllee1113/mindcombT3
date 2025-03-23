import { makeAutoObservable } from 'mobx'

export interface Connection {
  sourceId: string
  targetId: string
  type?: 'default' | 'dashed' | 'dotted'
  color?: string
}

export class ConnectionStore {
  connections: Connection[] = []

  constructor() {
    makeAutoObservable(this)
  }

  initializeDefaultConnections(centralId: string, childIds: string[]): void {
    // Connect all child nodes to the central node
    childIds.forEach(childId => {
      this.addConnection(centralId, childId)
    })
  }

  addConnection(sourceId: string, targetId: string, type: 'default' | 'dashed' | 'dotted' = 'default', color: string = '#6366F1'): void {
    // Prevent duplicate connections
    const exists = this.connections.some(
      conn => conn.sourceId === sourceId && conn.targetId === targetId
    )
    
    if (!exists && sourceId !== targetId) {
      this.connections.push({ sourceId, targetId, type, color })
    }
  }

  removeConnection(sourceId: string, targetId: string): void {
    this.connections = this.connections.filter(
      conn => !(conn.sourceId === sourceId && conn.targetId === targetId)
    )
  }

  removeConnectionsForNode(nodeId: string): void {
    this.connections = this.connections.filter(
      conn => conn.sourceId !== nodeId && conn.targetId !== nodeId
    )
  }
}