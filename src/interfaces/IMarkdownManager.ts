export interface IMarkdownManager {
  setContent(content: string): void;
  getContent(): string;
  parseContent(content: string): string[];
}