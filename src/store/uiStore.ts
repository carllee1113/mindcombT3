import { makeAutoObservable } from 'mobx'
import { RootStore } from './store'
import type { INode, NodeLevel } from './nodeStore'
import { NodeFactory } from './nodeStore'
import type { IConnection } from './connectionStore'
import { throwMindMapError } from '../utils/errorHandler';
import { ErrorCodes } from '../errors/ErrorCodes';

export class UIStore {
  private rootStore: RootStore
  private lastProcessedContent: string = ''
  private savedMindMapState: {
    nodes: Map<string, INode>;
    connections: Map<string, IConnection>;
  } | null = null;

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
  isPanning: boolean = false
  viewMode: 'mindmap' | 'markdown' = 'mindmap'
  markdownContent: string = ''
  showLandingPage: boolean = true

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore
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

  // Keep only one implementation of setZoomLevel
  setZoomLevel(level: number) {
    try {
      if (level < 0.1 || level > 2) {
        throwMindMapError(
          'Invalid zoom level',
          ErrorCodes.VIEWPORT.INVALID_ZOOM,
          { level }
        );
      }
      this.zoomLevel = Math.max(0.1, Math.min(2, level));
    } catch (error) {
      // Set to nearest valid value
      this.zoomLevel = Math.max(0.1, Math.min(2, level));
    }
  }

  // Change from private to public
  handleMarkdownToMindMap() {
    if (this.markdownContent !== this.lastProcessedContent) {
      const lines = this.markdownContent.split('\n').filter(line => line.trim());
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      
      // Create a map to track processed nodes
      const processedNodes = new Set<string>();
      
      // Keep existing nodes and update their content
      const existingNodes = this.rootStore.nodeStore.getAllNodesAsMap();
      const existingConnections = this.rootStore.connectionStore.getAllConnections();
  
      // Process all markdown lines to update or create nodes
      lines.forEach((line, index) => {
        const match = line.match(/^(#+)\s+(.+)/);
        if (match) {
          const level = match[1].length;
          const content = match[2].trim();
          
          if (level === 1) {
            // Update central node
            const centralNode = Array.from(existingNodes.values())
              .find(node => node.level === 0);
            if (centralNode) {
              this.rootStore.nodeStore.updateNodeContent(centralNode.id, content);
              processedNodes.add(centralNode.id);
            }
          } else {
            const parentLevel = level - 1;
            const parentLines = lines.slice(0, index).reverse();
            const parentLine = parentLines.find(l => l.match(/^#{1,}/)?.[0].length === parentLevel);
            
            if (parentLine) {
              const parentContent = parentLine.match(/^#+\s+(.+)/)?.[1].trim();
              const parentNode = Array.from(existingNodes.values())
                .find(n => n.content === parentContent);
              
              if (parentNode) {
                // Find existing node with same level and parent
                const existingNode = Array.from(existingNodes.values())
                  .find(n => n.level === level && 
                            existingConnections.get(parentNode.id + '_' + n.id));
                
                if (existingNode) {
                  // Update existing node
                  this.rootStore.nodeStore.updateNodeContent(existingNode.id, content);
                  processedNodes.add(existingNode.id);
                } else {
                  // Create new node only if necessary
                  const newNode = NodeFactory.createChildNode({
                    position: { x: 0, y: 0 },
                    title: content,
                    parentId: parentNode.id,
                    level: level as NodeLevel,
                    branchColor: parentNode.branchColor
                  });
                  this.rootStore.nodeStore.addNode(newNode);
                  this.rootStore.connectionStore.addConnection(parentNode.id, newNode.id);
                  processedNodes.add(newNode.id);
                }
              }
            }
          }
        }
      });
  
      // Remove nodes that weren't processed (deleted in markdown)
      existingNodes.forEach((node, nodeId) => {
        if (!processedNodes.has(nodeId)) {
          this.rootStore.nodeStore.removeNode(nodeId);
        }
      });
  
      // Align nodes if needed
      if (!this.savedMindMapState) {
        this.rootStore.nodeStore.alignFirstLayerNodes();
      }
  
      // Force re-render
      requestAnimationFrame(() => {
        this.setViewportPosition(centerX, centerY);
        this.setZoomLevel(1);
      });
    }
  
    this.lastProcessedContent = this.markdownContent;
    this.viewMode = 'mindmap';
  }

  // Remove duplicate convertMarkdownToMindMap method

  setViewportPosition(x: number, y: number) {
    this.viewportX = x
    this.viewportY = y
  }

  startPan() {
    this.isPanning = true
  }

  endPan() {
    this.isPanning = false
  }

  toggleViewMode() {
    if (this.viewMode === 'mindmap') {
      // Save current mindmap state when switching to markdown
      this.savedMindMapState = {
        nodes: this.rootStore.nodeStore.getAllNodesAsMap(),
        connections: this.rootStore.connectionStore.getAllConnections()
      };
      
      // Convert to markdown and switch view
      const markdown = this.generateMarkdownFromMindMap();
      this.setMarkdownContent(markdown);
      this.lastProcessedContent = markdown;
      this.viewMode = 'markdown';
    } else {
      // Handle markdown to mindmap conversion
      this.handleMarkdownToMindMap();
    }
  }

  private generateMarkdownFromMindMap(): string {
    const centralNode = this.rootStore.nodeStore.getNodeById(this.rootStore.nodeStore.centralNodeId);
    if (!centralNode) return '';

    const processNode = (node: INode, level: number): string => {
      const header = '#'.repeat(level);
      let markdown = `${header} ${node.content}\n`;
      
      const children = this.rootStore.nodeStore.getChildNodes(node.id);
      children.forEach(child => {
        markdown += processNode(child, level + 1);
      });
      
      return markdown;
    };

    return processNode(centralNode, 1);
  }

  // Add missing method
  setMarkdownContent(content: string) {
    this.markdownContent = content;
  }

  setSavedMindMapState(state: {
    nodes: Map<string, INode>;
    connections: Map<string, IConnection>;
  }) {
    this.savedMindMapState = state;
  }

  setShowLandingPage(show: boolean) {
    this.showLandingPage = show
  }
}