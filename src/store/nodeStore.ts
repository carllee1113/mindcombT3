import { makeAutoObservable } from 'mobx'

export interface Node {
  id: string
  x: number
  y: number
  title?: string
  content: string
  parentId?: string
}

export class NodeStore {
  nodes: Node[] = []
  centralNodeId: string = ''

  constructor() {
    makeAutoObservable(this)
  }

  initializeDefaultNodes(): void {
    // Create central node
    const centralNode: Node = {
      id: 'central-' + Date.now(),
      x: window.innerWidth / 2 - 100,
      y: window.innerHeight / 2 - 100,
      title: 'Central Topic',
      content: 'Main idea or concept'
    }
    this.centralNodeId = centralNode.id
    
    // Add central node
    this.addNode(centralNode)
    
    // Create child nodes
    const childNodes: Node[] = [
      {
        id: 'child-1-' + Date.now(),
        x: centralNode.x - 250,
        y: centralNode.y - 150,
        content: 'Subtopic 1',
        parentId: centralNode.id
      },
      {
        id: 'child-2-' + Date.now(),
        x: centralNode.x + 250,
        y: centralNode.y - 150,
        content: 'Subtopic 2',
        parentId: centralNode.id
      },
      {
        id: 'child-3-' + Date.now(),
        x: centralNode.x - 250,
        y: centralNode.y + 150,
        content: 'Subtopic 3',
        parentId: centralNode.id
      },
      {
        id: 'child-4-' + Date.now(),
        x: centralNode.x + 250,
        y: centralNode.y + 150,
        content: 'Subtopic 4',
        parentId: centralNode.id
      }
    ]
    
    // Add child nodes
    childNodes.forEach(node => this.addNode(node))
  }

  addNode(node: Node): void {
    this.nodes.push(node)
  }

  removeNode(id: string): void {
    // Don't allow removing the central node
    if (id === this.centralNodeId) return
    
    this.nodes = this.nodes.filter(node => node.id !== id)
  }
  
  updateNodePosition(id: string, x: number, y: number): void {
    const node = this.getNodeById(id)
    if (node) {
      node.x = x
      node.y = y
    }
  }
  
  updateNodeContent(id: string, content: string): void {
    const node = this.getNodeById(id)
    if (node) {
      node.content = content
    }
  }
  
  updateNodeTitle(id: string, title: string): void {
    const node = this.getNodeById(id)
    if (node) {
      node.title = title
    }
  }
  
  getNodeById(id: string): Node | undefined {
    return this.nodes.find(node => node.id === id)
  }
}