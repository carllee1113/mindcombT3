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
  id: string;
  position: NodePosition;
  title: string;
  content: string;
  level: NodeLevel;
  parentId?: string;
  connectionPoints: ConnectionPoint[];
  branchColor: string;
  x: number;
  y: number;
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
      branchColor: '#4A5568',
      x: position.x,
      y: position.y
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
      branchColor: params.branchColor,
      x: params.position.x,
      y: params.position.y
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
  
    // Create child nodes with temporary positions
    for (let i = 0; i < 4; i++) {
      const childNode = NodeFactory.createChildNode({
        position: { x: centerX, y: centerY }, // Temporary position
        title: `Subtopic ${i + 1}`,
        parentId: centralNode.id,
        level: 1,
        branchColor: getRandomColor()
      })
      this.addNode(childNode)
      childNodeIds.push(childNode.id)
    }
  
    // Align the nodes in a circle
    this.alignFirstLayerNodes()
  
    // Initialize connections
    this.rootStore.connectionStore.initializeDefaultConnections(centralNode.id, childNodeIds)
  }

  private getEmptyPosition(parentNode: INode): NodePosition {
    const offset = 200
    const angle = Math.random() * 2 * Math.PI
    return {
      x: parentNode.position.x + (offset * Math.cos(angle)),
      y: parentNode.position.y + (offset * Math.sin(angle))
    }
  }

  addNode(node: INode): void {
    this.validateNode(node)
    if (node.parentId && !node.position) {
      const parentNode = this.getNodeById(node.parentId)
      if (parentNode) {
        node.position = this.getEmptyPosition(parentNode)
      }
    }
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

  getConnectionStore() {
    return this.rootStore.connectionStore
  }

  alignFirstLayerNodes(): void {
    const centralNode = this.getNodeById(this.centralNodeId)
    if (!centralNode) return
  
    const firstLayerNodes = this.getChildNodes(this.centralNodeId)
    if (firstLayerNodes.length === 0) return
  
    // Calculate positions in a circle around the central node
    const radius = 200 // Distance from central node
    const startAngle = -Math.PI / 6 // Start from 1 o'clock position (-30 degrees)
    const angleStep = (2 * Math.PI) / firstLayerNodes.length
  
    firstLayerNodes.forEach((node, index) => {
      const angle = startAngle + (angleStep * index)
      const newX = centralNode.position.x + (radius * Math.cos(angle))
      const newY = centralNode.position.y + (radius * Math.sin(angle))
  
      this.updateNodePosition(node.id, {
        x: newX,
        y: newY
      })
    })
  }

  updateFromMarkdown(lines: string[]) {
    lines.forEach(line => {
      const match = line.match(/^(#+)\s+(.+)/)
      if (match) {
        const level = match[1].length
        const content = match[2].trim()
        
        if (level === 1) {
          // Update central node
          this.updateNodeContent(this.centralNodeId, content)
        } else {
          // Find parent and create/update child nodes
          const parentLevel = level - 1
          const potentialParents = Array.from(this.nodes.values())
            .filter(node => node.level === parentLevel - 1)
          
          if (potentialParents.length > 0) {
            const parentNode = potentialParents[potentialParents.length - 1]
            const existingChild = this.getChildNodes(parentNode.id)
              .find(child => child.content === content)
            
            if (!existingChild) {
              const newNode = NodeFactory.createChildNode({
                position: { x: 0, y: 0 },
                title: content,
                parentId: parentNode.id,
                level: level as NodeLevel,
                branchColor: parentNode.branchColor || '#4A5568'
              })
              this.addNode(newNode)
              this.getConnectionStore().addConnection(parentNode.id, newNode.id)
            }
          }
        }
      }
    })
  }

  clearNonCentralNodes() {
    // Get all nodes except central node
    const nonCentralNodes = Array.from(this.nodes.values())
      .filter(node => node.id !== this.centralNodeId)
    
    // Remove each non-central node
    nonCentralNodes.forEach(node => {
      this.removeNode(node.id)
      // Use getConnectionStore() method instead of direct access
      this.getConnectionStore().removeConnectionsForNode(node.id)
    })
  }

  getAllNodesAsMap(): Map<string, INode> {
      return new Map(this.nodes);
    }
  
    restoreNodesFromSavedState(savedNodes: Map<string, INode>) {
      this.nodes = new Map(savedNodes);
    }
  
    updateNodesFromMarkdown(lines: string[], savedNodes: Map<string, INode>) {
        lines.forEach(line => {
          const match = line.match(/^(#+)\s+(.+)/);
          if (match) {
            const level = match[1].length as NodeLevel;
            const content = match[2].trim();
            
            if (level === 1) {
              this.updateNodeContent(this.centralNodeId, content);
            } else {
              const parentLevel = level - 1;
              const potentialParents = Array.from(this.nodes.values())
                .filter(node => node.level === parentLevel - 1);
              
              if (potentialParents.length > 0) {
                const parentNode = potentialParents[potentialParents.length - 1];
                // Find existing node with same content
                const existingNode = Array.from(savedNodes.values())
                  .find(node => node.content === content);
  
                if (existingNode) {
                  // Preserve position and color from existing node
                  this.nodes.set(existingNode.id, existingNode);
                } else {
                  // Create new node with random position
                  const newNode = NodeFactory.createChildNode({
                    position: this.getEmptyPosition(parentNode),
                    title: content,
                    parentId: parentNode.id,
                    level: level,
                    branchColor: parentNode.branchColor || '#4A5568'
                  });
                  this.addNode(newNode);
                  this.getConnectionStore().addConnection(parentNode.id, newNode.id);
                }
              }
            }
          }
        });
      }

  clearNodes() {
    this.nodes.clear();
  }

  getAllNodes(): INode[] {
    return Array.from(this.nodes.values());
  }
}