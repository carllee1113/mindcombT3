import { makeAutoObservable } from 'mobx'
import { v4 as uuid } from 'uuid'
import { ConnectionStore } from './connectionStore'
import { RootStore } from './store'
import { importFreeMind } from '../utils/exportFreeMind'

// All types and interfaces consolidated here
export type ConnectionPointType = 'left' | 'right' | 'leftTop' | 'rightTop' | 'leftBottom' | 'rightBottom'
export type NodeId = string
export type NodeLevel = number // Changed from 0|1|2|3 to number to remove level restriction

export interface ConnectionPoint {
  x: number
  y: number
  type: ConnectionPointType
}

interface NodePosition {
  x: number
  y: number
}

export interface INode {
  id: string
  position: NodePosition
  title: string
  content: string
  level: NodeLevel
  parentId?: string
  connectionPoints: ConnectionPoint[]
  branchColor: string
  x: number
  y: number
  width?: number  // Add width property
  height?: number // Add height property
}

// Node factory for creating different types of nodes
// Export NodeFactory
// Make the function exportable
export const calculateConnectionPoints = (nodeWidth: number = 180, nodeHeight: number = 60): ConnectionPoint[] => {
  if (nodeWidth <= 0 || nodeHeight <= 0) {
    nodeWidth = 180;
    nodeHeight = 60;
  }
  return [
    // Left side points
    { x: 0, y: nodeHeight * 0.5, type: 'left' },
    
    // Right side points
    { x: nodeWidth, y: nodeHeight * 0.5, type: 'right' },
    
    // Top points
    { x: nodeWidth * 0.3, y: 0, type: 'leftTop' },
    { x: nodeWidth * 0.7, y: 0, type: 'rightTop' },
    
    // Bottom points
    { x: nodeWidth * 0.3, y: nodeHeight, type: 'leftBottom' },
    { x: nodeWidth * 0.7, y: nodeHeight, type: 'rightBottom' }
  ]
}

// Remove the standalone calculateConnectionPoints function
// and keep it only as a class method

export class NodeFactory {
  static createCentralNode(position: NodePosition): INode {
    return {
      id: uuid(),
      position,
      title: 'SCORE Story Element',
      content: 'SCORE Storytelling Framework',
      level: 0,
      connectionPoints: calculateConnectionPoints(180, 60), // Default dimensions
      branchColor: '#4A5568',
      x: position.x,
      y: position.y,
      width: 180,  // Set default width
      height: 60   // Set default height
    };
  }

  static createChildNode(params: {
    position: NodePosition,
    title: string,
    parentId: NodeId,
    level: NodeLevel,
    branchColor: string,
    width?: number,  // Optional width
    height?: number  // Optional height
  }): INode {
    return {
      id: uuid(),
      position: params.position,
      title: params.title,
      content: params.title,
      level: params.level,
      parentId: params.parentId,
      connectionPoints: calculateConnectionPoints(params.width, params.height),
      branchColor: params.branchColor,
      x: params.position.x,
      y: params.position.y,
      width: params.width,
      height: params.height
    };
  }
}

import { defaultNodeLayout, NodeLayoutConfig } from '../config/nodeLayoutConfig';
import { getBranchColor } from '../utils/colors';

export class NodeStore {
  constructor(rootStore: any) {
    makeAutoObservable(this);
    this.rootStore = rootStore;
    this.initializeDefaultNodes();
  }

  async loadScoreTemplate() {
    try {
      const response = await fetch('/templates/score-template.mm')
      const xmlText = await response.text()
      const blob = new Blob([xmlText], { type: 'application/xml' })
      const file = new File([blob], 'score-template.mm')
      const { nodes, centralNodeId } = await importFreeMind(file)
      
      nodes.forEach((node: INode, index) => {
        this.addNode({
          ...node,
          branchColor: node.branchColor || getBranchColor(index),
          connectionPoints: calculateConnectionPoints(node.width, node.height),
          width: node.width || 180,  // Add default if missing
          height: node.height || 60   // Add default if missing
        })
      })
      this._centralNodeId = centralNodeId
    } catch (error) {
      console.error('Failed to load score template:', error)
    }
  }
  private nodes: Map<NodeId, INode> = new Map()
  private _centralNodeId: NodeId = ''
  private rootStore: RootStore

  // Node layout configuration
  nodeLayout: NodeLayoutConfig = {
  ...defaultNodeLayout,
  baseRadius: 200,
  variation: {
    angle: 0.2,
    radius: 0.3
  }
};

  // Public getters for commonly accessed properties
  get allNodes(): INode[] {
    return Array.from(this.nodes.values())
  }

  // Note: Using importFreeMind from exportFreeMind.ts for FreeMind XML parsing

  private async initializeDefaultNodes(): Promise<void> {
    await this.loadScoreTemplate();
    
    // Position central node at exact center of canvas (0,0)
    const centralNode = this.getNodeById(this.centralNodeId);
    if (centralNode) {
      this.updateNodePosition(centralNode.id, { x: 0, y: 0 });
    }
    
    // Align first layer nodes around the center with consistent spacing
    this.alignFirstLayerNodes();
    
    // Create connections for all child nodes using the same approach as import
    const childNodes = this.getChildNodes(this.centralNodeId);
    const connectionStore = this.getConnectionStore();
    
    // Clear existing connections first to avoid duplicates
    connectionStore.clearConnections();
    
    // Initialize connections with IDs (same as import behavior)
    connectionStore.initializeDefaultConnections(
      this.centralNodeId,
      childNodes.map(node => node.id)
    );
    
    // Ensure the UI viewport is centered
    if (this.rootStore.uiStore) {
      // Center the viewport on (0,0)
      this.rootStore.uiStore.setViewportPosition(window.innerWidth / 2, window.innerHeight / 2);
      this.rootStore.uiStore.resetZoom();
    }
  }

  updateNodePosition(id: NodeId, position: NodePosition): void {
    const node = this.nodes.get(id);
    if (node) {
      node.position = position;
      node.x = position.x;
      node.y = position.y;
      this.nodes.set(id, node);
    }
  }

  getConnectionStore(): ConnectionStore {
    return this.rootStore.connectionStore;
  }

  get centralNodeId(): NodeId {
    return this._centralNodeId
  }

  get get(): (id: string) => INode | undefined {
    return this.getNodeById.bind(this)
  }





  getNodeById(id: NodeId): INode | undefined {
    return this.nodes.get(id);
  }

  getChildNodes(parentId: NodeId): INode[] {
    return this.allNodes.filter((node: INode) => node.parentId === parentId);
  }

  getAllNodesAsMap(): Map<NodeId, INode> {
    return new Map(this.nodes);
  }

  removeNode(id: NodeId): void {
    this.nodes.delete(id);
  }

  updateNodeContent(id: NodeId, content: string): void {
    const node = this.nodes.get(id);
    if (node) {
      node.content = content;
      this.nodes.set(id, node);
    }
  }

  updateNodeTitle(id: NodeId, title: string): void {
    const node = this.nodes.get(id);
    if (node) {
      node.title = title;
      this.nodes.set(id, node);
    }
  }

  addNode(node: INode): void {
    this.nodes.set(node.id, node);
  }

  alignFirstLayerNodes(): void {
    const centralNode = this.getNodeById(this.centralNodeId);
    if (!centralNode) return;
  
    const firstLayerNodes = this.getChildNodes(this.centralNodeId);
    if (firstLayerNodes.length === 0) return;
  
    const { regions, baseRadius, levelSpacing } = this.nodeLayout;
    const radius = levelSpacing.first || baseRadius; // Use consistent spacing from config
    
    const totalNodes = firstLayerNodes.length;
    const leftSideCount = Math.ceil(totalNodes / 2);
    const rightSideCount = Math.floor(totalNodes / 2);

    // Sort nodes to ensure consistent ordering (same as import behavior)
    const sortedNodes = [...firstLayerNodes].sort((a, b) => {
      // Sort by title for consistent ordering
      return a.title.localeCompare(b.title);
    });

    sortedNodes.forEach((node, index) => {
      let angle;
      if (index < leftSideCount) {
        // Left side nodes distribution - evenly spaced
        const progress = leftSideCount > 1 ? index / (leftSideCount - 1) : 0.5;
        angle = regions.lower.start + (regions.lower.end - regions.lower.start) * progress;
      } else {
        // Right side nodes distribution - evenly spaced
        const rightIndex = index - leftSideCount;
        const progress = rightSideCount > 1 ? rightIndex / (rightSideCount - 1) : 0.5;
        angle = regions.upper.start + (regions.upper.end - regions.upper.start) * progress;
      }

      // Calculate position with consistent radius (no random variation)
      const newX = centralNode.position.x + (radius * Math.cos(angle));
      const newY = centralNode.position.y + (radius * Math.sin(angle));
  
      this.updateNodePosition(node.id, {
        x: newX,
        y: newY
      });
    });
  }

  updateFromMarkdown(lines: string[]): void {
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

  clearNonCentralNodes(): void {
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

  clearNodes(): void {
    this.nodes.clear();
  }

  updateNodeDimensions(id: NodeId, width: number, height: number): void {
    const node = this.nodes.get(id);
    if (node) {
      node.width = width;
      node.height = height;
      node.connectionPoints = this.calculateConnectionPoints(width, height);
      this.nodes.set(id, node);
    }
  }

  private calculateConnectionPoints(width: number, height: number): ConnectionPoint[] {
    // Use the same connection points calculation as the standalone function
    // to ensure consistency between default and imported mindmaps
    return calculateConnectionPoints(width, height);
  }
} // <-- Class closing brace