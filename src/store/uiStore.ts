import { makeAutoObservable } from 'mobx'

export class UIStore {
  viewportX: number = 0
  viewportY: number = 0
  isDragging: boolean = false
  lastMouseX: number = 0
  lastMouseY: number = 0
  zoomLevel: number = 1
  selectedNodeId: string | null = null
  isNodeEditModalOpen: boolean = false

  constructor() {
    makeAutoObservable(this)
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

  startPan(x: number, y: number) {
    this.isDragging = true
    this.lastMouseX = x
    this.lastMouseY = y
  }

  updatePan(x: number, y: number) {
    if (this.isDragging) {
      const deltaX = x - this.lastMouseX
      const deltaY = y - this.lastMouseY
      this.viewportX += deltaX
      this.viewportY += deltaY
      this.lastMouseX = x
      this.lastMouseY = y
    }
  }

  endPan() {
    this.isDragging = false
  }

  openNodeEditModal(nodeId: string) {
    this.selectedNodeId = nodeId
    this.isNodeEditModalOpen = true
  }

  closeNodeEditModal() {
    this.selectedNodeId = null
    this.isNodeEditModalOpen = false
  }
}