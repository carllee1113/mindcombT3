import { ConnectionPoint, INode } from '../types/node';

/**
 * Calculates connection points for a node using relative coordinates
 * This ensures consistency with the nodeStore implementation
 * 
 * @param node The node to calculate connection points for
 * @returns Array of connection points with coordinates relative to the node position
 */
export function calculateConnectionPoints(node: INode): ConnectionPoint[] {
  // Use actual node dimensions instead of hardcoded values
  // Default to reasonable values if dimensions aren't available
  const nodeWidth = node.width || 200;
  const nodeHeight = node.height || 100;
  
  return [
    // Left side points
    { x: 0, y: nodeHeight * 0.5, type: 'left' },
    
    // Right side points
    { x: nodeWidth, y: nodeHeight * 0.5, type: 'right' },
    
    // Top points (for central node connections)
    { x: nodeWidth * 0.3, y: 0, type: 'leftTop' },
    { x: nodeWidth * 0.7, y: 0, type: 'rightTop' },
    
    // Bottom points (for central node connections)
    { x: nodeWidth * 0.3, y: nodeHeight, type: 'leftBottom' },
    { x: nodeWidth * 0.7, y: nodeHeight, type: 'rightBottom' }
  ];
}