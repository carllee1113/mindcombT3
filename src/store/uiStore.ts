import { makeAutoObservable } from 'mobx'

export interface Point {
  x: number
  y: number
}

export class UIStore {
  zoomLevel: number = 1
  panOffset: Point = { x: 0, y: 0 }
  isNodeEditModalOpen: boolean = false
  selectedNodeId: string | null = null
  contextMenuPosition: Point | null = null
  
  constructor() {
    makeAutoObservable(this)
  }
  
  setZoomLevel(level: number): void {
    // Limit zoom between 0.2 and 2
    this.zoomLevel = Math.max(0.2, Math.min(2, level))
  }
  
  zoomIn(): void {
    this.setZoomLevel(this.zoomLevel + 0.1)
  }
  
  zoomOut(): void {
    this.setZoomLevel(this.zoomLevel - 0.1)
  }
  
  resetZoom(): void {
    this.zoomLevel = 1
    this.panOffset = { x: 0, y: 0 }
  }
  
  setPanOffset(offset: Point): void {
    this.panOffset = offset
  }
  
  openNodeEditModal(nodeId: string): void {
    this.selectedNodeId = nodeId
    this.isNodeEditModalOpen = true
  }
  
  closeNodeEditModal(): void {
    this.isNodeEditModalOpen = false
    this.selectedNodeId = null
  }
  
  showContextMenu(position: Point): void {
    this.contextMenuPosition = position
  }
  
  hideContextMenu(): void {
    this.contextMenuPosition = null
  }
}