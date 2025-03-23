import { createContext, useContext } from 'react'
import { NodeStore } from './nodeStore'
import { ConnectionStore } from './connectionStore'
import { UIStore } from './uiStore'

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

export const store = new RootStore()
export const StoresContext = createContext(store)
export const useStore = () => useContext(StoresContext)

export const StoreProvider = StoresContext.Provider