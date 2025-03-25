import { makeAutoObservable } from 'mobx'
import type { NodeId } from './nodeStore'

export interface IConnection {
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
    childNodeIds.forEach(childId => {
      this.addConnection(centralNodeId, childId)
    })
  }

  getAllConnections(): Map<string, IConnection> {
      // Convert array to Map using sourceId as key
      return new Map(
        this.connections.map(conn => [conn.sourceId, conn])
      );
    }
  
    restoreConnectionsFromSavedState(savedConnections: Map<string, IConnection>) {
      // Convert Map back to array
      this.connections = Array.from(savedConnections.values());
    }

    clearConnections() {
      this.connections = [];
    }
}