import { makeAutoObservable } from 'mobx'

export class UIStore {
  viewportX: number = 0
  viewportY: number = 0
  isDragging: boolean = false
  isDraggingNode: boolean = false
  draggedNodeId: string | null = null
  lastMouseX: number = 0
  lastMouseY: number = 0
  zoomLevel: number = 1
  selectedNodeId: string | null = null
  isNodeEditModalOpen: boolean = false

  constructor() {
    makeAutoObservable(this)
  }

  startNodeDrag(nodeId: string) {
    this.isDraggingNode = true
    this.draggedNodeId = nodeId
  }

  endNodeDrag() {
    this.isDraggingNode = false
    this.draggedNodeId = null
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

  openNodeEditModal(nodeId: string) {
    this.selectedNodeId = nodeId
    this.isNodeEditModalOpen = true
  }

  closeNodeEditModal() {
    this.selectedNodeId = null
    this.isNodeEditModalOpen = false
  }
}