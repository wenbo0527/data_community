// 分析流程可视化编辑工具 - 工作流类型定义

// 节点类型枚举
export type NodeType = 'datasource' | 'sql' | 'python';

// 节点状态枚举
export type NodeStatus = 'idle' | 'running' | 'success' | 'error' | 'breakpoint';

// 工作流状态枚举
export type WorkflowStatus = 'draft' | 'published';

// 流程执行状态枚举
export type FlowExecutionStatus = 'idle' | 'running' | 'completed' | 'failed';

// 调试模式枚举
export type DebugMode = 'step' | 'full';

// 数据源类型枚举
export type DataSourceType = 'file' | 'database';

// 日志级别枚举
export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

// 数据源配置接口
export interface DataSourceConfig {
  type: DataSourceType;
  fileData?: {
    fileName: string;
    content: string;
    size?: number;
    lastModified?: Date;
  };
  databaseData?: {
    host: string;
    port: number;
    database: string;
    table: string;
    username?: string;
    password?: string;
    connectionString?: string;
  };
}

// SQL配置接口
export interface SqlConfig {
  query: string;
  description?: string;
  timeout?: number;
}

// Python配置接口
export interface PythonConfig {
  script: string;
  description?: string;
  timeout?: number;
  dependencies?: string[];
}

// 节点配置联合类型
export type NodeConfig = DataSourceConfig | SqlConfig | PythonConfig;

// 节点测试结果接口
export interface NodeTestResult {
  success: boolean;
  output?: any;
  error?: string;
  executionTime?: number;
  timestamp: Date;
  rowCount?: number;
  dataPreview?: any[];
}

// 节点调试信息接口
export interface NodeDebugInfo {
  status: NodeStatus;
  output?: any;
  error?: string;
  executionTime?: number;
  lastTestResult?: NodeTestResult;
}

// 工作流节点接口
export interface WorkflowNode {
  id: string;
  type: NodeType;
  label?: string;
  position: { x: number; y: number };
  data: {
    label: string;
    config: NodeConfig;
  };
  debugInfo?: NodeDebugInfo;
  size?: { width: number; height: number };
  style?: Record<string, any>;
}

// 工作流边接口
export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourcePort?: string;
  targetPort?: string;
  style?: Record<string, any>;
}

// 调试配置接口
export interface DebugConfig {
  mode: DebugMode;
  breakpoints: string[]; // node ids
  autoSave: boolean;
  stepDelay?: number;
}

// 调试日志接口
export interface DebugLog {
  id: string;
  sessionId: string;
  timestamp: string;
  nodeId?: string;
  level: LogLevel;
  message: string;
  data?: any;
}

// 调试会话接口
export interface DebugSession {
  workflowId: string;
  sessionId: string;
  startTime: Date;
  logs: DebugLog[];
  currentNodeId?: string;
  endTime?: Date;
}

// 流程执行状态接口
export interface FlowExecutionState {
  status: FlowExecutionStatus;
  currentNodeId?: string;
  executionLog: string[];
  startTime?: Date;
  endTime?: Date;
  progress?: number;
}

// 工作流接口
export interface Workflow {
  id: string;
  name: string;
  description?: string;
  status: WorkflowStatus;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  debugConfig?: DebugConfig;
  createdAt: Date;
  updatedAt: Date;
  version?: string;
  tags?: string[];
}

// 文件数据源接口
export interface FileDataSource {
  id: string;
  fileName: string;
  fileType: string;
  size: number;
  content: string;
  uploadTime: Date;
  preview?: any[];
}

// 数据库连接接口
export interface DatabaseConnection {
  id: string;
  name: string;
  type: string; // mysql, postgresql, etc.
  host: string;
  port: number;
  database: string;
  username: string;
  password?: string;
  connectionString?: string;
  isConnected: boolean;
  lastConnected?: Date;
  tables?: string[];
}

// 数据源存储接口
export interface DataSourceStorage {
  files: FileDataSource[];
  databases: DatabaseConnection[];
}

// 工作流存储接口
export interface WorkflowStorage {
  workflows: Workflow[];
  currentWorkflowId?: string;
  debugSessions: DebugSession[];
}

// 完整存储数据接口
export interface WorkflowStorageType {
  workflows: Workflow[];
  dataSources: DataSourceStorage;
  settings: AppSettings;
}

// 应用设置接口
export interface AppSettings {
  autoSave: boolean;
  debugMode: boolean;
  theme: 'light' | 'dark';
  language?: 'zh-CN' | 'en-US';
  canvasSettings?: {
    gridSize: number;
    snapToGrid: boolean;
    showGrid: boolean;
    zoomLevel: number;
  };
  debugSettings?: {
    stepDelay: number;
    maxLogEntries: number;
  };
}

// 节点工厂配置接口
export interface NodeFactoryConfig {
  type: NodeType;
  label: string;
  icon: string;
  defaultConfig: NodeConfig;
  ports?: {
    input?: string[];
    output?: string[];
  };
}

// 画布配置接口
export interface CanvasConfig {
  width: number;
  height: number;
  background: string;
  grid: {
    size: number;
    visible: boolean;
    color: string;
  };
  zoom: {
    min: number;
    max: number;
    step: number;
  };
}

// 节点执行上下文接口
export interface NodeExecutionContext {
  nodeId: string;
  workflowId: string;
  sessionId: string;
  inputData?: any;
  config?: NodeConfig;
  parameters?: Record<string, any>;
  environment?: string;
  timestamp: Date;
  previousResults?: Map<string, any>;
  globalVariables?: Record<string, any>;
}

// 执行结果接口
export interface ExecutionResult {
  success: boolean;
  data?: any;
  error?: string;
  executionTime: number;
  metadata?: {
    rowCount?: number;
    columnCount?: number;
    dataType?: string;
  };
}

// 节点执行结果接口
export interface NodeExecutionResult {
  nodeId: string;
  success: boolean;
  outputData?: any;
  error?: string;
  errorDetails?: string;
  logs: string[];
  executionTime: number;
  timestamp: string;
  metadata?: {
    rowCount?: number;
    columnCount?: number;
    dataType?: string;
  };
}

// 工作流验证结果接口
export interface WorkflowValidationResult {
  isValid: boolean;
  errors: {
    nodeId?: string;
    edgeId?: string;
    message: string;
    type: 'error' | 'warning';
  }[];
}

// 导出默认节点配置
export const DEFAULT_NODE_CONFIGS: Record<NodeType, NodeFactoryConfig> = {
  datasource: {
    type: 'datasource',
    label: '数据源',
    icon: 'icon-database',
    defaultConfig: {
      type: 'file'
    } as DataSourceConfig,
    ports: {
      output: ['out']
    }
  },
  sql: {
    type: 'sql',
    label: 'SQL查询',
    icon: 'icon-code',
    defaultConfig: {
      query: 'SELECT * FROM table_name LIMIT 100;'
    } as SqlConfig,
    ports: {
      input: ['in'],
      output: ['out']
    }
  },
  python: {
    type: 'python',
    label: 'Python脚本',
    icon: 'icon-python',
    defaultConfig: {
      script: '# Python数据处理脚本\nimport pandas as pd\n\n# 处理输入数据\nresult = input_data\nprint(result.head())'
    } as PythonConfig,
    ports: {
      input: ['in'],
      output: ['out']
    }
  }
};

// 存储键名常量
export const STORAGE_KEYS = {
  WORKFLOW_STORAGE: 'workflow_storage',
  DATASOURCE_STORAGE: 'datasource_storage',
  DEBUG_STORAGE: 'debug_storage',
  APP_SETTINGS: 'app_settings',
  TEMP_FILES: 'temp_files',
  EXECUTION_CACHE: 'execution_cache'
} as const;