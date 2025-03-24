import { makeAutoObservable } from 'mobx'
import { v4 as uuid } from 'uuid'

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
}

// Node factory for creating different types of nodes
// Export NodeFactory
export class NodeFactory {
  static createCentralNode(position: NodePosition): INode {
    return {
      id: uuid(),
      position,
      title: 'Main idea or concept',
      content: 'Main idea or concept',
      level: 0
    }
  }

  static createChildNode(params: {
    position: NodePosition,
    title: string,
    parentId: NodeId,
    level: NodeLevel
  }): INode {
    return {
      id: uuid(),
      position: params.position,
      title: params.title,
      content: params.title,
      level: params.level,
      parentId: params.parentId
    }
  }
}

export class NodeStore {
  private nodes: Map<NodeId, INode> = new Map()
  private _centralNodeId: NodeId = ''

  constructor() {
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

    // Define child node positions relative to center
    const childPositions = [
      { x: centerX, y: centerY - 200 },
      { x: centerX + 300, y: centerY },
      { x: centerX, y: centerY + 200 }
    ]

    // Create child nodes
    childPositions.forEach((position, index) => {
      const childNode = NodeFactory.createChildNode({
        position,
        title: `Subtopic ${index + 1}`,
        parentId: centralNode.id,
        level: 1
      })
      this.addNode(childNode)
    })
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