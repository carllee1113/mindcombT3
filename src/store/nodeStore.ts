import { makeAutoObservable } from 'mobx'
import { v4 as uuid } from 'uuid'
export type ConnectionPointType = 'left' | 'right' | 'leftTop' | 'rightTop' | 'leftBottom' | 'rightBottom'

export interface ConnectionPoint {
  x: number
  y: number
  type: ConnectionPointType
}
import { getRandomColor } from '../utils/colors'

// Define node types for better type safety
export type NodeId = string
export type NodeLevel = 0 | 1 | 2 | 3

// Separate interface for node position
interface NodePosition {
  x: number
  y: number
}

// Base node interface
export interface INode {
  id: NodeId
  position: NodePosition
  title: string
  content: string
  level: NodeLevel
  parentId?: NodeId
  branchColor?: string
  connectionPoints: ConnectionPoint[]
}

// Node factory for creating different types of nodes
// Export NodeFactory
const calculateConnectionPoints = (nodeWidth: number = 100, nodeHeight: number = 50): ConnectionPoint[] => {
  return [
    { x: 0, y: nodeHeight / 2, type: 'left' },
    { x: nodeWidth, y: nodeHeight / 2, type: 'right' },
    { x: nodeWidth / 4, y: 0, type: 'leftTop' },
    { x: nodeWidth * 3/4, y: 0, type: 'rightTop' },
    { x: nodeWidth / 4, y: nodeHeight, type: 'leftBottom' },
    { x: nodeWidth * 3/4, y: nodeHeight, type: 'rightBottom' }
  ]
}

export class NodeFactory {
  static createCentralNode(position: NodePosition): INode {
    return {
      id: uuid(),
      position,
      title: 'Main idea or concept',
      content: 'Main idea or concept',
      level: 0,
      connectionPoints: calculateConnectionPoints(),
      branchColor: '#4A5568'
    }
  }

  static createChildNode(params: {
    position: NodePosition,
    title: string,
    parentId: NodeId,
    level: NodeLevel,
    branchColor: string
  }): INode {
    return {
      id: uuid(),
      position: params.position,
      title: params.title,
      content: params.title,
      level: params.level,
      parentId: params.parentId,
      connectionPoints: calculateConnectionPoints(),
      branchColor: params.branchColor
    }
  }
}

export class NodeStore {
  private nodes: Map<NodeId, INode> = new Map()
  private _centralNodeId: NodeId = ''
  private rootStore: any // We'll type this properly later

  constructor(rootStore: any) {
    this.rootStore = rootStore
    makeAutoObservable(this)
    this.initializeDefaultNodes()
  }

  get centralNodeId(): NodeId {
    return this._centralNodeId
  }

  get allNodes(): INode[] {
    return Array.from(this.nodes.values())
  }

  private initializeDefaultNodes(): void {
    const centerX = window.innerWidth / 2
    const centerY = window.innerHeight / 2
  
    // Create central node
    const centralNode = NodeFactory.createCentralNode({ x: centerX, y: centerY })
    this._centralNodeId = centralNode.id
    this.addNode(centralNode)
  
    const childNodeIds: NodeId[] = []
  
    // Define child node positions and their connection points
    const childPositions = [
      { x: centerX - 200, y: centerY - 200, color: getRandomColor() }, // Top left
      { x: centerX + 200, y: centerY - 200, color: getRandomColor() }, // Top right
      { x: centerX - 200, y: centerY + 200, color: getRandomColor() }, // Bottom left
      { x: centerX + 200, y: centerY + 200, color: getRandomColor() }  // Bottom right
    ]
  
    // Create child nodes
    childPositions.forEach((pos, index) => {
      const childNode = NodeFactory.createChildNode({
        position: { x: pos.x, y: pos.y },
        title: `Subtopic ${index + 1}`,
        parentId: centralNode.id,
        level: 1,
        branchColor: pos.color
      })
      this.addNode(childNode)
      childNodeIds.push(childNode.id)
    })
  
    // Initialize connections in the connection store
    this.rootStore.connectionStore.initializeDefaultConnections(centralNode.id, childNodeIds)
  }

  addNode(node: INode): void {
    this.validateNode(node)
    this.nodes.set(node.id, node)
  }

  removeNode(id: NodeId): void {
    if (id === this._centralNodeId) return
    this.nodes.delete(id)
    // Remove child nodes recursively
    this.removeChildNodes(id)
  }

  private removeChildNodes(parentId: NodeId): void {
    const childNodes = this.getChildNodes(parentId)
    childNodes.forEach(child => {
      this.nodes.delete(child.id)
      this.removeChildNodes(child.id)
    })
  }

  updateNodePosition(id: NodeId, position: NodePosition): void {
    const node = this.nodes.get(id)
    if (node) {
      node.position = position
    }
  }

  updateNodeContent(id: NodeId, content: string): void {
    const node = this.nodes.get(id)
    if (node) {
      node.content = this.sanitizeContent(content)
    }
  }

  updateNodeTitle(id: NodeId, title: string): void {
    const node = this.nodes.get(id)
    if (node) {
      node.title = this.sanitizeTitle(title)
    }
  }

  getNodeById(id: NodeId): INode | undefined {
    return this.nodes.get(id)
  }

  getChildNodes(parentId: NodeId): INode[] {
    return this.allNodes.filter(node => node.parentId === parentId)
  }

  private validateNode(node: INode): void {
    if (!node.id || !node.title || node.level === undefined) {
      throw new Error('Invalid node structure')
    }
  }

  private sanitizeContent(content: string): string {
    return content.trim()
  }

  private sanitizeTitle(title: string): string {
    return title.trim()
  }
}