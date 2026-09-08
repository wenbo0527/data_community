/**
 * 节点抽屉配置类型定义
 * 为所有节点抽屉提供类型安全和智能提示
 */

// 基础分支配置
export interface BaseBranch {
  id: string
  name: string
  type?: string
}

// 时间单位类型
export type TimeUnit = 'minutes' | 'hours' | 'days'

// 时间配置
export interface TimeConfig {
  value: number
  unit: TimeUnit
}

// AB实验节点配置
export interface ABTestBranch extends BaseBranch {
  percentage: number
}

export interface ABTestNodeConfig {
  experimentName: string
  description?: string
  branches: ABTestBranch[]
  randomSeed?: number
  trafficAllocation: number
}

// AI外呼节点配置
export interface AICallIntentBranch extends BaseBranch {
  intentCode: string
}

export interface AICallNodeConfig {
  taskId: string
  enableIntentRouting: boolean
  maxWaitTime?: TimeConfig
  intentBranches: AICallIntentBranch[]
  defaultBranch: BaseBranch
  retryConfig?: {
    enabled: boolean
    maxRetries: number
    retryInterval: TimeConfig
  }
  callSettings?: {
    enableRecording: boolean
    enableRealTimeAnalysis: boolean
  }
}

// 短信节点配置
export type SMSResultType = 'success' | 'failure'

export interface SMSResultBranch extends BaseBranch {
  resultType: SMSResultType
}

export interface SMSNodeConfig {
  templateId: string
  content: string
  enableResultJudgment: boolean
  maxWaitTime?: TimeConfig
  resultBranches: SMSResultBranch[]
  retryConfig?: {
    enabled: boolean
    maxRetries: number
    retryInterval: TimeConfig
  }
  sendSettings?: {
    enableDeliveryReport: boolean
    enableClickTracking: boolean
    sendTime: 'immediate' | 'scheduled' | 'optimal'
    scheduledTime?: string
  }
}

// 等待节点配置
export type WaitType = 'fixed' | 'conditional' | 'dynamic'

export interface WaitNodeConfig {
  waitTime: TimeConfig
  waitType: WaitType
  conditionalConfig?: {
    earlyEndConditions: string[]
  }
  dynamicConfig?: {
    userActivity: boolean
    timeSlot: boolean
    userSegment: boolean
  }
  behaviorDuringWait?: {
    enableNotification: boolean
    enableProgressTracking: boolean
    enableUserInteraction: boolean
  }
  timeoutHandling?: {
    action: 'continue' | 'retry' | 'fail'
    maxTimeout: TimeConfig
  }
}

// 节点抽屉状态
export interface DrawerState {
  visible: boolean
  loading: boolean
  readonly: boolean
}

// 抽屉配置映射
export interface DrawerConfigMap {
  'ab-test': ABTestNodeConfig
  'ai-call': AICallNodeConfig
  'sms': SMSNodeConfig
  'wait': WaitNodeConfig
}

// 表单验证规则
export interface ValidationRule {
  required?: boolean
  message?: string
  type?: 'string' | 'number' | 'array'
  min?: number
  max?: number
  pattern?: RegExp
  validator?: (value: any, callback: (error?: string) => void) => void
}

export type FormRules<T> = {
  [K in keyof T]?: ValidationRule[]
}

// 抽屉操作事件
export interface DrawerEvent {
  type: 'save' | 'cancel' | 'delete' | 'validate'
  nodeId: string
  config?: any
  timestamp: number
}

// 导出所有类型
export type NodeDrawerConfig = 
  | ABTestNodeConfig 
  | AICallNodeConfig 
  | SMSNodeConfig 
  | WaitNodeConfig

export type NodeType = keyof DrawerConfigMap