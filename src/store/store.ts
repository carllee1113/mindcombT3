import { makeAutoObservable, configure, runInAction } from 'mobx'
import React from 'react'
import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'

// Configure MobX for strict mode
configure({
  enforceActions: 'observed',
  computedRequiresReaction: false,
  reactionRequiresObservable: false,
  observableRequiresReaction: false,
  disableErrorBoundaries: false
})

// Node type definition
export interface Node {
  id: string
  content: string
  x: number
  y: number
}

// Connection type definition
export interface Connection {
  sourceId: string
  targetId: string
}

class NodeStore {
  nodes: Node[] = []
  centralNodeId: string | null = null

  constructor() {
    makeAutoObservable(this)
  }

  addNode(node: Node) {
    runInAction(() => {
      this.nodes.push(node)
      if (!this.centralNodeId) {
        this.centralNodeId = node.id
      }
    })
  }

  updateNode(id: string, updates: Partial<Node>) {
    runInAction(() => {
      const node = this.nodes.find(n => n.id === id)
      if (node) {
        Object.assign(node, updates)
      }
    })
  }

  setCentralNode(id: string) {
    runInAction(() => {
      this.centralNodeId = id
    })
  }

  // Initialize with default mind map structure
  initializeDefaultMindMap() {
    runInAction(() => {
      const centralNode: Node = {
        id: 'central',
        content: 'Main idea or concept',
        x: 400,
        y: 250
      }
      
      const subtopics: Node[] = [
        { id: 'sub1', content: 'Subtopic 1', x: 200, y: 150 },
        { id: 'sub2', content: 'Subtopic 2', x: 600, y: 150 },
        { id: 'sub3', content: 'Subtopic 3', x: 200, y: 350 },
        { id: 'sub4', content: 'Subtopic 4', x: 600, y: 350 }
      ]
      
      this.nodes = [centralNode, ...subtopics]
      this.centralNodeId = centralNode.id
    })
  }

  // Add missing methods
  getNodeById(id: string): Node | undefined {
    return this.nodes.find(n => n.id === id)
  }

  removeNode(id: string) {
    runInAction(() => {
      this.nodes = this.nodes.filter(n => n.id !== id)
    })
  }

  updateNodeTitle(id: string, title: string) {
    this.updateNode(id, { content: title })
  }

  updateNodeContent(id: string, content: string) {
    this.updateNode(id, { content })
  }
}

class ConnectionStore {
  connections: Connection[] = []

  constructor() {
    makeAutoObservable(this)
  }

  addConnection(connection: Connection) {
    runInAction(() => {
      this.connections.push(connection)
    })
  }

  // Initialize with default connections
  initializeDefaultConnections() {
    runInAction(() => {
      this.connections = [
        { sourceId: 'central', targetId: 'sub1' },
        { sourceId: 'central', targetId: 'sub2' },
        { sourceId: 'central', targetId: 'sub3' },
        { sourceId: 'central', targetId: 'sub4' }
      ]
    })
  }
}

class UIStore {
  zoomLevel = 1
  // Add missing properties
  isNodeEditModalOpen = false
  selectedNodeId: string | null = null

  constructor() {
    makeAutoObservable(this)
  }

  zoomIn() {
    runInAction(() => {
      this.zoomLevel = Math.min(2, this.zoomLevel + 0.1)
    })
  }

  zoomOut() {
    runInAction(() => {
      this.zoomLevel = Math.max(0.5, this.zoomLevel - 0.1)
    })
  }

  resetZoom() {
    runInAction(() => {
      this.zoomLevel = 1
    })
  }

  // Add missing methods
  openNodeEditModal(nodeId: string) {
    runInAction(() => {
      this.selectedNodeId = nodeId
      this.isNodeEditModalOpen = true
    })
  }

  closeNodeEditModal() {
    runInAction(() => {
      this.isNodeEditModalOpen = false
      this.selectedNodeId = null
    })
  }
}

class RootStore {
  nodeStore: NodeStore
  connectionStore: ConnectionStore
  uiStore: UIStore

  constructor() {
    this.nodeStore = new NodeStore()
    this.connectionStore = new ConnectionStore()
    this.uiStore = new UIStore()
    
    // Initialize default data
    this.nodeStore.initializeDefaultMindMap()
    this.connectionStore.initializeDefaultConnections()
  }
}

// Remove duplicate imports and keep the store context implementation at the bottom
export const StoreContext = createContext<RootStore | null>(null)

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const store = new RootStore()
  return React.createElement(
    StoreContext.Provider,
    { value: store },
    children
  )
}

export const useStore = () => {
  const store = useContext(StoreContext)
  if (!store) {
    throw new Error('useStore must be used within a StoreProvider')
  }
  return store
}