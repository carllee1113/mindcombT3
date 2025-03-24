import { makeAutoObservable } from 'mobx'
import { NodeStore } from './nodeStore'
import { UIStore } from './uiStore'
import { ConnectionStore } from './connectionStore'
import type { INode } from './nodeStore'
import React, { createContext, useContext, type ReactNode } from 'react'

export class RootStore {
  nodeStore: NodeStore
  uiStore: UIStore
  connectionStore: ConnectionStore

  constructor() {
    this.connectionStore = new ConnectionStore()
    this.nodeStore = new NodeStore(this)
    this.uiStore = new UIStore()
    makeAutoObservable(this)
  }
}

interface StoreProviderProps {
  children: ReactNode
}

const StoreContext = createContext<RootStore | null>(null)

export const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  const store = new RootStore()
  return (
    <StoreContext.Provider value={store}>
      {children}
    </StoreContext.Provider>
  )
}

export const useStore = (): RootStore => {
  const store = useContext(StoreContext)
  if (!store) {
    throw new Error('useStore must be used within a StoreProvider')
  }
  return store
}

// Re-export types
export type { INode }