export interface IMindMapManager {
  convertToMarkdown(): string;
  loadFromMarkdown(markdown: string): void;
  // ... other mindmap operations
}