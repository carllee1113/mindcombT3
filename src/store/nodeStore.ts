import { makeAutoObservable } from 'mobx'
import { v4 as uuid } from 'uuid'
// Import only ConnectionPointType from types/node
import { ConnectionPointType } from '../types/node'

// Keep local interface definition
export interface ConnectionPoint {
  x: number
  y: number
  type: ConnectionPointType
}

// Add this import instead
import { getBranchColor } from '../utils/colors'

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
const calculateConnectionPoints = (nodeWidth: number = 180, nodeHeight: number = 60): ConnectionPoint[] => {
  return [
    { x: 0, y: nodeHeight / 2, type: 'left' },
    { x: nodeWidth, y: nodeHeight / 2, type: 'right' },
    { x: 0, y: 0, type: 'leftTop' },
    { x: nodeWidth, y: 0, type: 'rightTop' },
    { x: 0, y: nodeHeight, type: 'leftBottom' },
    { x: nodeWidth, y: nodeHeight, type: 'rightBottom' }
  ]
}

export class NodeFactory {
  static createCentralNode(position: NodePosition): INode {
    return {
      id: uuid(),
      position,
      title: 'SCORE Story Element',
      content: 'SCORE Storytelling Framework',
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

// Add predefined colors for default branches
const defaultBranchColors = [
  '#FF6B6B', // coral red
  '#4ECDC4', // turquoise
  '#45B7D1', // sky blue
  '#96CEB4', // sage green
  '#FFEEAD'  // soft yellow
];

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
  
    const centralNode = NodeFactory.createCentralNode({ x: centerX, y: centerY })
    this._centralNodeId = centralNode.id
    this.addNode(centralNode)
  
    const childNodeIds: NodeId[] = []
    const defaultSubtopics = [
      'Situation (Context, background, setup)',
      'Complication (Problem, conflict, challenge)',
      'Opportunity (Solution, path, possibility)',
      'Resolution (Action, outcome, solution)',
      'Effect (Impact, result, change)'
    ]
  
    // Create child nodes with specific colors using getBranchColor
    defaultSubtopics.forEach((topic, index) => {
      const childNode = NodeFactory.createChildNode({
        position: { x: centerX, y: centerY },
        title: topic,
        parentId: centralNode.id,
        level: 1,
        branchColor: getBranchColor(index)
      })
      this.addNode(childNode)
      childNodeIds.push(childNode.id)
    })
  
    this.alignFirstLayerNodes()
    this.rootStore.connectionStore.initializeDefaultConnections(centralNode.id, childNodeIds)
  }

  private getEmptyPosition(parentNode: INode): NodePosition {
    // Get all existing child nodes of the parent
    const childNodes = this.getChildNodes(parentNode.id)
    
    // Base offset from parent node
    const baseOffset = 200
    
    // If no children exist, place first child at a default position
    if (childNodes.length === 0) {
      return {
        x: parentNode.position.x + baseOffset,
        y: parentNode.position.y
      }
    }
  
    // Find the least crowded angle for the new node
    const angles = 8 // Divide the space into 8 sectors
    const sectorSize = (2 * Math.PI) / angles
    let bestAngle = 0
    let minNodesInSector = Infinity
  
    // Check each sector for number of nodes
    for (let i = 0; i < angles; i++) {
      const sectorStart = i * sectorSize
      const nodesInSector = childNodes.filter(node => {
        const angle = Math.atan2(
          node.position.y - parentNode.position.y,
          node.position.x - parentNode.position.x
        )
        return angle >= sectorStart && angle < sectorStart + sectorSize
      }).length
  
      if (nodesInSector < minNodesInSector) {
        minNodesInSector = nodesInSector
        bestAngle = sectorStart + (sectorSize / 2)
      }
    }
  
    // Calculate position using the best angle and add some randomness
    const randomOffset = (Math.random() - 0.5) * 50
    return {
      x: parentNode.position.x + (baseOffset * Math.cos(bestAngle)) + randomOffset,
      y: parentNode.position.y + (baseOffset * Math.sin(bestAngle)) + randomOffset
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
  
    // Adjust the regions to spread nodes more evenly
    const upperRegion = { start: -Math.PI / 12, end: Math.PI / 2.5 }    // Wider spread for right side
    const lowerRegion = { start: -Math.PI, end: -Math.PI / 3 } // Wider spread for left side
    const radius = 300 // Keep increased distance
  
    const totalNodes = firstLayerNodes.length
    const leftSideCount = Math.ceil(totalNodes / 2)
    const rightSideCount = Math.floor(totalNodes / 2)

    firstLayerNodes.forEach((node, index) => {
      let angle
      if (index < leftSideCount) {
        // Left side nodes - ensure even spacing
        const progress = leftSideCount > 1 ? index / (leftSideCount - 1) : 0.5
        angle = lowerRegion.start + (lowerRegion.end - lowerRegion.start) * progress
      } else {
        // Right side nodes - ensure even spacing
        const rightIndex = index - leftSideCount
        const progress = rightSideCount > 1 ? rightIndex / (rightSideCount - 1) : 0.5
        angle = upperRegion.start + (upperRegion.end - upperRegion.start) * progress
      }

      // Add slight radius variation to prevent overlap
      const radiusVariation = radius + (index * 20)
      const newX = centralNode.position.x + (radiusVariation * Math.cos(angle))
      const newY = centralNode.position.y + (radiusVariation * Math.sin(angle))
  
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