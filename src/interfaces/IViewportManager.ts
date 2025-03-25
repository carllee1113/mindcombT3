export interface IViewportManager {
  setZoomLevel(level: number): void;
  setPosition(x: number, y: number): void;
  getZoomLevel(): number;
  getPosition(): { x: number; y: number };
}