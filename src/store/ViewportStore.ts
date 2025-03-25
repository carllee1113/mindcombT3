import { makeAutoObservable } from 'mobx';
import { IViewportManager } from '../interfaces/IViewportManager';

export class ViewportStore implements IViewportManager {
  viewportX: number = 0;
  viewportY: number = 0;
  zoomLevel: number = 1;

  constructor() {
    makeAutoObservable(this);
  }

  setZoomLevel(level: number): void {
    this.zoomLevel = Math.max(0.1, Math.min(2, level));
  }

  setPosition(x: number, y: number): void {
    this.viewportX = x;
    this.viewportY = y;
  }

  getZoomLevel(): number {
    return this.zoomLevel;
  }

  getPosition(): { x: number; y: number } {
    return {
      x: this.viewportX,
      y: this.viewportY
    };
  }
}