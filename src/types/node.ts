// Type definitions for node-related interfaces

export type ConnectionPointType = 'left' | 'right' | 'leftTop' | 'rightTop' | 'leftBottom' | 'rightBottom';

export interface ConnectionPoint {
  x: number;
  y: number;
  type: ConnectionPointType;
}

export interface NodePosition {
  x: number;
  y: number;
}

// Re-export types from nodeStore if needed elsewhere
export type NodeId = string;
export type NodeLevel = number;

export interface INode {
  id: NodeId;
  position: NodePosition;
  title: string;
  content: string;
  level: NodeLevel;
  parentId?: string;
  connectionPoints: ConnectionPoint[];
  branchColor: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
}