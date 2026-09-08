/**
 * 画布相关类型定义
 */

// 节点类型
export type NodeType = 
  | 'start' 
  | 'end' 
  | 'audience-split' 
  | 'event-split' 
  | 'ab-test' 
  | 'message' 
  | 'delay' 
  | 'condition'

// 端口类型
export type PortType = 'in' | 'out'

// 端口组类型
export type PortGroup = 'in' | 'out' | 'right'

// 连接点类型
export type ConnectionPoint = 'anchor' | 'bbox' | 'rect'

// 连接器类型
export type ConnectorType = 'normal' | 'rounded' | 'smooth' | 'jumpover'

// 路由器类型
export type RouterType = 'normal' | 'manhattan' | 'metro' | 'er'

// 位置配置
export interface PositionConfig {
  x?: number
  y?: number
  dx?: number
  dy?: number
  name?: 'top' | 'bottom' | 'left' | 'right' | 'center'
  args?: {
    dx?: number
    dy?: number
    x?: number
    y?: number
  }
}

// 端口配置
export interface PortConfig {
  id: string
  group: PortGroup
  position?: PositionConfig
  attrs?: {
    circle?: {
      r?: number
      magnet?: boolean
      stroke?: string
      strokeWidth?: number
      fill?: string
      style?: {
        visibility?: 'visible' | 'hidden'
      }
    }
  }
  markup?: Array<{
    tagName: string
    selector: string
  }>
}

// 分支端口配置参数
export interface BranchPortConfigParams {
  branchId: string
  branchIndex: number
  totalBranches: number
  nodeType: NodeType
  spacing?: number
}

// 连接配置
export interface ConnectionConfig {
  source: {
    cell: string
    port: string
  }
  target: {
    cell: string
    port: string
  }
  connector?: {
    name: ConnectorType
    args?: {
      radius?: number
    }
  }
  router?: {
    name: RouterType
    args?: any
  }
  connectionPoint?: ConnectionPoint
  attrs?: {
    line?: {
      stroke?: string
      strokeWidth?: number
      targetMarker?: {
        name: string
        width?: number
        height?: number
        fill?: string
      }
    }
  }
  labels?: Array<{
    attrs: {
      text: {
        text: string
        fill?: string
        fontSize?: number
        fontWeight?: string
        textAnchor?: string
        textVerticalAnchor?: string
      }
      rect?: {
        ref: string
        refX?: number
        refY?: number
        refWidth?: string | number
        refHeight?: string | number
        refWidth2?: number
        refHeight2?: number
        fill?: string
        stroke?: string
        strokeWidth?: number
        rx?: number
        ry?: number
      }
    }
    position: number
  }>
  data?: {
    type: string
    sourceNodeId: string
    targetNodeId: string
    branchId?: string
    branchLabel?: string
  }
}

// 分支连接配置参数
export interface BranchConnectionConfigParams {
  sourceNodeId: string
  targetNodeId: string
  branchId?: string
  branchLabel?: string
  sourcePort?: string
  targetPort?: string
}

// 节点数据
export interface NodeData {
  id: string
  type: NodeType
  label: string
  position: {
    x: number
    y: number
  }
  config?: any
  lastUpdated?: number
}

// 连接数据
export interface ConnectionData {
  id: string
  source: string
  target: string
  sourcePort?: string
  targetPort?: string
  branchId?: string
  branchLabel?: string
}

// 错误类型
export enum ErrorTypes {
  CONNECTION_ERROR = 'CONNECTION_ERROR',
  PORT_ERROR = 'PORT_ERROR',
  NODE_ERROR = 'NODE_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  PREVIEW_LINE_ERROR = 'PREVIEW_LINE_ERROR'
}

// 日志级别
export enum LogLevels {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

// 验证结果
export interface ValidationResult {
  valid: boolean
  errors: string[]
}

// 错误上下文
export interface ErrorContext {
  nodeId?: string
  connectionId?: string
  portId?: string
  operation?: string
  timestamp?: number
  [key: string]: any
}

// 安全执行选项
export interface SafeExecuteOptions {
  maxRetries?: number
  retryDelay?: number
  timeout?: number
  errorHandler?: (error: Error) => any
}