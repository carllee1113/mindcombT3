export type ConnectionPointType = 
  | 'left'
  | 'right'
  | 'leftTop'
  | 'leftBottom'
  | 'rightTop'
  | 'rightBottom'

export interface ConnectionPoint {
  x: number
  y: number
  type: ConnectionPointType
}