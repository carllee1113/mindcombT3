import type { INode } from '../store/nodeStore';
import type { IConnection } from '../store/connectionStore';

export interface IMindMapManager {
  convertToMarkdown(): string;
  loadFromMarkdown(markdown: string): void;
  getAllNodes(): Map<string, INode>;
  getAllConnections(): Map<string, IConnection>;
}