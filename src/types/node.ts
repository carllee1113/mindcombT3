export type ConnectionPointType = 'left' | 'right' | 'leftTop' | 'rightTop' | 'leftBottom' | 'rightBottom'

export interface ConnectionPoint {
  x: number
  y: number
  type: ConnectionPointType
}