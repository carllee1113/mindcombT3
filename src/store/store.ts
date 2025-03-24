import { configure } from 'mobx'
import React from 'react'
import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import { NodeStore } from './nodeStore'
import { ConnectionStore } from './connectionStore'
import { UIStore } from './uiStore'

// Configure MobX
configure({
  enforceActions: "observed",
  computedRequiresReaction: true,
  reactionRequiresObservable: true,
  observableRequiresReaction: true
})

// Import and re-export types from child stores
export type { Node } from './nodeStore'
export type { Connection } from './connectionStore'

// Root store class
class RootStore {
  nodeStore: NodeStore
  connectionStore: ConnectionStore
  uiStore: UIStore

  constructor() {
    this.nodeStore = new NodeStore()
    this.connectionStore = new ConnectionStore()
    this.uiStore = new UIStore()
    
    // Initialize default nodes
    this.nodeStore.initializeDefaultNodes()
    
    // Initialize connections after nodes are created
    setTimeout(() => {
      const centralNode = this.nodeStore.nodes.find(node => node.id === this.nodeStore.centralNodeId)
      const childNodes = this.nodeStore.nodes.filter(node => node.id !== this.nodeStore.centralNodeId)
      
      if (centralNode) {
        const childIds = childNodes.map(node => node.id)
        this.connectionStore.initializeDefaultConnections(centralNode.id, childIds)
      }
    }, 0)
  }
}

// Create singleton store instance
const store = new RootStore()

// Create context with type
const StoresContext = createContext<RootStore>(store)

// Provider component using createElement
const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return React.createElement(
    StoresContext.Provider,
    { value: store },
    children
  )
}

// Hook for accessing store
const useStore = () => {
  const context = useContext(StoresContext)
  if (!context) {
    throw new Error('useStore must be used within StoreProvider')
  }
  return context
}

// Consolidated exports
export {
  store,
  StoresContext,
  StoreProvider,
  useStore
}