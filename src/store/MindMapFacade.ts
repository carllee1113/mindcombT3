import { IMindMapManager } from '../interfaces/IMindMapManager';
import { IViewportManager } from '../interfaces/IViewportManager';
import { IMarkdownManager } from '../interfaces/IMarkdownManager';
import { handleError } from '../utils/errorHandler';

export class MindMapFacade {
  constructor(
    private mindMapManager: IMindMapManager,
    private viewportManager: IViewportManager,
    private markdownManager: IMarkdownManager
  ) {}

  switchToMarkdownView(): void {
    try {
      const markdown = this.mindMapManager.convertToMarkdown();
      this.markdownManager.setContent(markdown);
    } catch (error) {
      handleError(error, 'Failed to switch to markdown view');
    }
  }

  switchToMindMapView(): void {
    try {
      const markdown = this.markdownManager.getContent();
      this.mindMapManager.loadFromMarkdown(markdown);
      this.viewportManager.setZoomLevel(1); // Reset zoom when switching views
    } catch (error) {
      handleError(error, 'Failed to switch to mindmap view');
    }
  }

  updateViewport(x: number, y: number, zoom: number): void {
    try {
      this.viewportManager.setPosition(x, y);
      this.viewportManager.setZoomLevel(zoom);
    } catch (error) {
      handleError(error, 'Failed to update viewport');
    }
  }
}