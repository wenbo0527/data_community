/**
 * X6 Graph 类型契约（轻量）
 * 说明：为 service 层 / composable 提供基础接口，替代 `: any`。
 * 边界：仅声明常用方法签名；非穷尽；不引入 X6 类型依赖，避免编译时长。
 */

export interface XYPoint { x: number; y: number }
export interface SizeBox { width: number; height: number }
export interface CellPosSize extends XYPoint, SizeBox {}

export interface X6Port {
  cell?: string
  port?: string
}

export interface X6EdgeData {
  source?: string
  target?: string
  sourcePort?: string
  targetPort?: string
  branchId?: string | null
  [k: string]: unknown
}

export interface X6NodeData {
  type?: string
  nodeType?: string
  isConfigured?: boolean
  config?: Record<string, unknown>
  displayLines?: string[]
  nodeName?: string
  [k: string]: unknown
}

export interface X6Cell {
  id: string
  getData?: () => any
  setData?: (data: any) => void
  getPosition?: () => XYPoint
  getSize?: () => SizeBox
  getBBox?: () => SizeBox
  position?: (x: number, y: number) => void
  remove?: () => void
  getSource?: () => X6Port
  getTarget?: () => X6Port
  getSourceCell?: () => X6Cell
  getTargetCell?: () => X6Cell
  getSourcePortId?: () => string | null
  getTargetPortId?: () => string | null
  getPorts?: () => Array<{ id: string; group?: string }>
  [k: string]: any
}

export interface X6GraphLike {
  // 节点操作
  getNodes?: () => X6Cell[]
  getEdges?: () => X6Cell[]
  addNode?: (spec: any) => X6Cell | null
  removeNode?: (id: string) => void
  getCellById?: (id: string) => X6Cell | null
  cleanSelection?: () => void
  select?: (cell: X6Cell) => void
  getSelectedCells?: () => X6Cell[]
  getOutgoingEdges?: (cell: X6Cell) => X6Cell[]
  clearCells?: () => void
  freeze?: () => void
  unfreeze?: () => void

  // 边操作
  addEdge?: (spec: any) => X6Cell | null
  removeEdge?: (id: string) => void

  // 坐标转换
  pageToLocal?: (px: number, py: number) => XYPoint
  localToPage?: (x: number, y: number) => XYPoint

  // 视图控制
  scrollContentToPoint?: (x: number, y: number, options?: any) => void
  translateTo?: (x: number, y: number) => void
  dispose?: () => void

  // 容器/尺寸
  container?: any
  getBoundingClientRect?: () => DOMRect

  // 事件
  on?: (event: string, handler: (...args: any[]) => void) => void
  off?: (event: string, handler: (...args: any[]) => void) => void

  [k: string]: any
}

export interface CanvasNodeRecord {
  id: string
  type?: string
  x?: number
  y?: number
  position?: { x: number; y: number }
  label?: string
  config?: Record<string, any>
  data?: X6NodeData
  isConfigured?: boolean
  branches?: Array<{ id?: string; label?: string; name?: string }>
  [k: string]: any
}

export interface CanvasConnectionRecord extends X6EdgeData {
  source: string
  target: string
  sourcePort?: string
  sourcePortId?: string
  targetPort?: string
  targetPortId?: string
  label?: string
  [k: string]: any
}

export interface CanvasData {
  nodes: CanvasNodeRecord[]
  connections: CanvasConnectionRecord[]
  _migrationVersion?: number
  [k: string]: unknown
}

export type NodeType = string

export interface ValidationResult {
  pass: boolean
  messages: string[]
  details?: Array<{ kind: string; nodeIds: string[] }>
}

export interface TaskMeta {
  id?: string | number
  name: string
  description?: string
  version: number
  type?: string
  status?: string
  approvalStatus?: string | null
  publishReady?: boolean
  publishMessages?: string[]
  lastValidatedAt?: string
  updateTime?: string
  publishTime?: string | null
  creator?: string
  canvasData?: CanvasData
  [k: string]: unknown
}
/*
用途：X6 Graph 类型契约（轻量）
说明：为 service 层 / composable 提供基础接口，替代 `: any`；不引入 X6 类型依赖避免编译时长。
边界：仅声明常用方法签名；非穷尽；CanvasData / ValidationResult / TaskMeta 用于持久化与校验模块。
*/