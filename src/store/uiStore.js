import { makeAutoObservable } from 'mobx'

export class UIStore {
  zoomLevel = 1
  isNodeEditModalOpen = false
  selectedNodeId = null
  
  constructor(rootStore) {
    this.rootStore = rootStore
    makeAutoObservable(this, {
      rootStore: false // Don't observe the rootStore reference
    })
  }
  
  zoomIn() {
    this.zoomLevel = Math.min(2, this.zoomLevel + 0.1)
  }
  
  zoomOut() {
    this.zoomLevel = Math.max(0.5, this.zoomLevel - 0.1)
  }
  
  resetZoom() {
    this.zoomLevel = 1
  }
  
  openNodeEditModal(nodeId) {
    this.selectedNodeId = nodeId
    this.isNodeEditModalOpen = true
  }
  
  closeNodeEditModal() {
    this.isNodeEditModalOpen = false
    this.selectedNodeId = null
  }
}