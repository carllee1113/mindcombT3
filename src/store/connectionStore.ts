import { makeAutoObservable } from 'mobx'
import type { NodeId } from './nodeStore'

export interface IConnection {
  id?: string
  sourceId: NodeId
  targetId: NodeId
}

export class ConnectionStore {
  connections: IConnection[] = []

  constructor() {
    makeAutoObservable(this)
  }

  addConnection(sourceId: NodeId, targetId: NodeId) {
    if (!this.connections.some(conn => 
      conn.sourceId === sourceId && conn.targetId === targetId
    )) {
      this.connections.push({ sourceId, targetId })
    }
  }

  removeConnection(sourceId: NodeId, targetId: NodeId) {
    this.connections = this.connections.filter(conn =>
      !(conn.sourceId === sourceId && conn.targetId === targetId)
    )
  }

  removeConnectionsForNode(nodeId: NodeId) {
    this.connections = this.connections.filter(conn =>
      conn.sourceId !== nodeId && conn.targetId !== nodeId
    )
  }

  initializeDefaultConnections(centralNodeId: NodeId, childNodeIds: NodeId[]) {
    // Create connections directly in array format (same as imports)
    const newConnections = childNodeIds.map(childId => ({
        id: `${centralNodeId}-${childId}`,
        sourceId: centralNodeId,
        targetId: childId
    }));
    
    // Merge with existing connections (same as import behavior)
    this.connections = [...this.connections, ...newConnections];
}

// Also update getAllConnections to use connection IDs as keys
getAllConnections(): Map<string, IConnection> {
    return new Map(
        this.connections.map(conn => [conn.id || `${conn.sourceId}-${conn.targetId}`, conn])
    );
}
  
    restoreConnectionsFromSavedState(savedConnections: Map<string, IConnection>) {
      // Convert Map to array and ensure all connections have IDs
      this.connections = Array.from(savedConnections.values()).map(conn => ({
          id: conn.id || `${conn.sourceId}-${conn.targetId}`,
          sourceId: conn.sourceId,
          targetId: conn.targetId
      }));
    }

    clearConnections() {
      this.connections = [];
    }
}