/**
 * 营销画布系统服务接口定义
 * 定义所有服务层接口，确保服务调用的类型安全
 */

import type {
  BaseNode,
  Connection,
  CanvasState,
  CanvasSnapshot,
  OperationResult,
  BatchOperationResult,
  QueryCondition,
  SortCondition,
  Pagination,
  QueryResult,
  ExportOptions,
  ImportOptions,
  ValidationResult
} from './core'

/**
 * 基础服务接口
 */
export interface BaseService {
  /**
   * 初始化服务
   */
  initialize(): Promise<void>

  /**
   * 销毁服务
   */
  destroy(): Promise<void>

  /**
   * 检查服务状态
   */
  isReady(): boolean
}

/**
 * 节点服务接口
 */
export interface NodeService extends BaseService {
  /**
   * 创建节点
   */
  createNode(nodeData: Partial<BaseNode>): Promise<OperationResult<BaseNode>>

  /**
   * 批量创建节点
   */
  createNodes(nodesData: Partial<BaseNode>[]): Promise<BatchOperationResult<BaseNode>>

  /**
   * 获取节点
   */
  getNode(nodeId: string): Promise<OperationResult<BaseNode>>

  /**
   * 获取多个节点
   */
  getNodes(nodeIds: string[]): Promise<OperationResult<BaseNode[]>>

  /**
   * 获取所有节点
   */
  getAllNodes(): Promise<OperationResult<BaseNode[]>>

  /**
   * 更新节点
   */
  updateNode(nodeId: string, nodeData: Partial<BaseNode>): Promise<OperationResult<BaseNode>>

  /**
   * 批量更新节点
   */
  updateNodes(updates: Array<{ id: string; data: Partial<BaseNode> }>): Promise<BatchOperationResult<BaseNode>>

  /**
   * 删除节点
   */
  deleteNode(nodeId: string): Promise<OperationResult<boolean>>

  /**
   * 批量删除节点
   */
  deleteNodes(nodeIds: string[]): Promise<BatchOperationResult<boolean>>

  /**
   * 查询节点
   */
  queryNodes(conditions: QueryCondition[], sort?: SortCondition[], pagination?: Pagination): Promise<QueryResult<BaseNode>>

  /**
   * 验证节点
   */
  validateNode(nodeData: Partial<BaseNode>): Promise<ValidationResult>

  /**
   * 复制节点
   */
  cloneNode(nodeId: string, position?: { x: number; y: number }): Promise<OperationResult<BaseNode>>

  /**
   * 移动节点
   */
  moveNode(nodeId: string, position: { x: number; y: number }): Promise<OperationResult<BaseNode>>

  /**
   * 调整节点大小
   */
  resizeNode(nodeId: string, size: { width: number; height: number }): Promise<OperationResult<BaseNode>>
}

/**
 * 连接服务接口
 */
export interface ConnectionService extends BaseService {
  /**
   * 创建连接
   */
  createConnection(connectionData: Partial<Connection>): Promise<OperationResult<Connection>>

  /**
   * 批量创建连接
   */
  createConnections(connectionsData: Partial<Connection>[]): Promise<BatchOperationResult<Connection>>

  /**
   * 获取连接
   */
  getConnection(connectionId: string): Promise<OperationResult<Connection>>

  /**
   * 获取多个连接
   */
  getConnections(connectionIds: string[]): Promise<OperationResult<Connection[]>>

  /**
   * 获取所有连接
   */
  getAllConnections(): Promise<OperationResult<Connection[]>>

  /**
   * 获取节点的连接
   */
  getNodeConnections(nodeId: string, type?: 'input' | 'output' | 'all'): Promise<OperationResult<Connection[]>>

  /**
   * 更新连接
   */
  updateConnection(connectionId: string, connectionData: Partial<Connection>): Promise<OperationResult<Connection>>

  /**
   * 批量更新连接
   */
  updateConnections(updates: Array<{ id: string; data: Partial<Connection> }>): Promise<BatchOperationResult<Connection>>

  /**
   * 删除连接
   */
  deleteConnection(connectionId: string): Promise<OperationResult<boolean>>

  /**
   * 批量删除连接
   */
  deleteConnections(connectionIds: string[]): Promise<BatchOperationResult<boolean>>

  /**
   * 删除节点的所有连接
   */
  deleteNodeConnections(nodeId: string): Promise<OperationResult<boolean>>

  /**
   * 查询连接
   */
  queryConnections(conditions: QueryCondition[], sort?: SortCondition[], pagination?: Pagination): Promise<QueryResult<Connection>>

  /**
   * 验证连接
   */
  validateConnection(connectionData: Partial<Connection>): Promise<ValidationResult>

  /**
   * 检查连接是否有效
   */
  isValidConnection(sourceId: string, targetId: string): Promise<OperationResult<boolean>>

  /**
   * 获取连接路径
   */
  getConnectionPath(connectionId: string): Promise<OperationResult<{ x: number; y: number }[]>>
}

/**
 * 画布服务接口
 */
export interface CanvasService extends BaseService {
  /**
   * 获取画布状态
   */
  getCanvasState(): Promise<OperationResult<CanvasState>>

  /**
   * 更新画布状态
   */
  updateCanvasState(state: Partial<CanvasState>): Promise<OperationResult<CanvasState>>

  /**
   * 重置画布
   */
  resetCanvas(): Promise<OperationResult<boolean>>

  /**
   * 清空画布
   */
  clearCanvas(): Promise<OperationResult<boolean>>

  /**
   * 适应画布大小
   */
  fitCanvas(): Promise<OperationResult<boolean>>

  /**
   * 居中画布
   */
  centerCanvas(): Promise<OperationResult<boolean>>

  /**
   * 缩放画布
   */
  zoomCanvas(scale: number, center?: { x: number; y: number }): Promise<OperationResult<boolean>>

  /**
   * 平移画布
   */
  panCanvas(offset: { x: number; y: number }): Promise<OperationResult<boolean>>

  /**
   * 获取画布边界
   */
  getCanvasBounds(): Promise<OperationResult<{ x: number; y: number; width: number; height: number }>>

  /**
   * 屏幕坐标转画布坐标
   */
  screenToCanvas(point: { x: number; y: number }): Promise<OperationResult<{ x: number; y: number }>>

  /**
   * 画布坐标转屏幕坐标
   */
  canvasToScreen(point: { x: number; y: number }): Promise<OperationResult<{ x: number; y: number }>>
}

/**
 * 历史服务接口
 */
export interface HistoryService extends BaseService {
  /**
   * 创建快照
   */
  createSnapshot(description?: string): Promise<OperationResult<CanvasSnapshot>>

  /**
   * 获取快照
   */
  getSnapshot(snapshotId: string): Promise<OperationResult<CanvasSnapshot>>

  /**
   * 获取所有快照
   */
  getAllSnapshots(): Promise<OperationResult<CanvasSnapshot[]>>

  /**
   * 删除快照
   */
  deleteSnapshot(snapshotId: string): Promise<OperationResult<boolean>>

  /**
   * 恢复快照
   */
  restoreSnapshot(snapshotId: string): Promise<OperationResult<boolean>>

  /**
   * 撤销操作
   */
  undo(): Promise<OperationResult<boolean>>

  /**
   * 重做操作
   */
  redo(): Promise<OperationResult<boolean>>

  /**
   * 检查是否可以撤销
   */
  canUndo(): Promise<OperationResult<boolean>>

  /**
   * 检查是否可以重做
   */
  canRedo(): Promise<OperationResult<boolean>>

  /**
   * 清空历史
   */
  clearHistory(): Promise<OperationResult<boolean>>

  /**
   * 获取历史记录数量
   */
  getHistorySize(): Promise<OperationResult<number>>
}

/**
 * 选择服务接口
 */
export interface SelectionService extends BaseService {
  /**
   * 选择节点
   */
  selectNodes(nodeIds: string[]): Promise<OperationResult<boolean>>

  /**
   * 选择连接
   */
  selectConnections(connectionIds: string[]): Promise<OperationResult<boolean>>

  /**
   * 选择全部
   */
  selectAll(): Promise<OperationResult<boolean>>

  /**
   * 清空选择
   */
  clearSelection(): Promise<OperationResult<boolean>>

  /**
   * 反选
   */
  invertSelection(): Promise<OperationResult<boolean>>

  /**
   * 获取选中的节点
   */
  getSelectedNodes(): Promise<OperationResult<BaseNode[]>>

  /**
   * 获取选中的连接
   */
  getSelectedConnections(): Promise<OperationResult<Connection[]>>

  /**
   * 检查节点是否被选中
   */
  isNodeSelected(nodeId: string): Promise<OperationResult<boolean>>

  /**
   * 检查连接是否被选中
   */
  isConnectionSelected(connectionId: string): Promise<OperationResult<boolean>>

  /**
   * 区域选择
   */
  selectByArea(area: { x: number; y: number; width: number; height: number }): Promise<OperationResult<boolean>>
}

/**
 * 布局服务接口
 */
export interface LayoutService extends BaseService {
  /**
   * 自动布局
   */
  autoLayout(algorithm?: string, options?: Record<string, any>): Promise<OperationResult<boolean>>

  /**
   * 对齐节点
   */
  alignNodes(nodeIds: string[], alignment: string): Promise<OperationResult<boolean>>

  /**
   * 分布节点
   */
  distributeNodes(nodeIds: string[], distribution: string): Promise<OperationResult<boolean>>

  /**
   * 调整间距
   */
  adjustSpacing(nodeIds: string[], spacing: number): Promise<OperationResult<boolean>>

  /**
   * 层次布局
   */
  hierarchicalLayout(options?: Record<string, any>): Promise<OperationResult<boolean>>

  /**
   * 力导向布局
   */
  forceLayout(options?: Record<string, any>): Promise<OperationResult<boolean>>

  /**
   * 圆形布局
   */
  circularLayout(options?: Record<string, any>): Promise<OperationResult<boolean>>

  /**
   * 网格布局
   */
  gridLayout(options?: Record<string, any>): Promise<OperationResult<boolean>>

  /**
   * 获取布局建议
   */
  getLayoutSuggestions(): Promise<OperationResult<string[]>>
}

/**
 * 验证服务接口
 */
export interface ValidationService extends BaseService {
  /**
   * 验证画布
   */
  validateCanvas(): Promise<ValidationResult>

  /**
   * 验证节点
   */
  validateNode(nodeId: string): Promise<ValidationResult>

  /**
   * 验证连接
   */
  validateConnection(connectionId: string): Promise<ValidationResult>

  /**
   * 验证工作流
   */
  validateWorkflow(): Promise<ValidationResult>

  /**
   * 获取验证规则
   */
  getValidationRules(): Promise<OperationResult<any[]>>

  /**
   * 添加验证规则
   */
  addValidationRule(rule: any): Promise<OperationResult<boolean>>

  /**
   * 移除验证规则
   */
  removeValidationRule(ruleId: string): Promise<OperationResult<boolean>>

  /**
   * 启用验证规则
   */
  enableValidationRule(ruleId: string): Promise<OperationResult<boolean>>

  /**
   * 禁用验证规则
   */
  disableValidationRule(ruleId: string): Promise<OperationResult<boolean>>
}

/**
 * 导入导出服务接口
 */
export interface ImportExportService extends BaseService {
  /**
   * 导出画布
   */
  exportCanvas(options: ExportOptions): Promise<OperationResult<Blob | string>>

  /**
   * 导入画布
   */
  importCanvas(data: File | string, options: ImportOptions): Promise<OperationResult<boolean>>

  /**
   * 导出节点
   */
  exportNodes(nodeIds: string[], options: ExportOptions): Promise<OperationResult<Blob | string>>

  /**
   * 导入节点
   */
  importNodes(data: File | string, options: ImportOptions): Promise<OperationResult<BaseNode[]>>

  /**
   * 导出连接
   */
  exportConnections(connectionIds: string[], options: ExportOptions): Promise<OperationResult<Blob | string>>

  /**
   * 导入连接
   */
  importConnections(data: File | string, options: ImportOptions): Promise<OperationResult<Connection[]>>

  /**
   * 获取支持的导出格式
   */
  getSupportedExportFormats(): Promise<OperationResult<string[]>>

  /**
   * 获取支持的导入格式
   */
  getSupportedImportFormats(): Promise<OperationResult<string[]>>
}

/**
 * 存储服务接口
 */
export interface StorageService extends BaseService {
  /**
   * 保存画布
   */
  saveCanvas(name?: string): Promise<OperationResult<string>>

  /**
   * 加载画布
   */
  loadCanvas(id: string): Promise<OperationResult<CanvasState>>

  /**
   * 删除画布
   */
  deleteCanvas(id: string): Promise<OperationResult<boolean>>

  /**
   * 获取画布列表
   */
  getCanvasList(): Promise<OperationResult<Array<{ id: string; name: string; updateTime: number }>>>

  /**
   * 自动保存画布
   */
  autoSaveCanvas(): Promise<OperationResult<boolean>>

  /**
   * 设置自动保存间隔
   */
  setAutoSaveInterval(interval: number): Promise<OperationResult<boolean>>

  /**
   * 启用自动保存
   */
  enableAutoSave(): Promise<OperationResult<boolean>>

  /**
   * 禁用自动保存
   */
  disableAutoSave(): Promise<OperationResult<boolean>>

  /**
   * 检查是否有未保存的更改
   */
  hasUnsavedChanges(): Promise<OperationResult<boolean>>
}

/**
 * 事件服务接口
 */
export interface EventService extends BaseService {
  /**
   * 订阅事件
   */
  subscribe(eventType: string, handler: (data: any) => void): Promise<OperationResult<string>>

  /**
   * 取消订阅事件
   */
  unsubscribe(subscriptionId: string): Promise<OperationResult<boolean>>

  /**
   * 发布事件
   */
  publish(eventType: string, data: any): Promise<OperationResult<boolean>>

  /**
   * 获取事件历史
   */
  getEventHistory(eventType?: string, limit?: number): Promise<OperationResult<any[]>>

  /**
   * 清空事件历史
   */
  clearEventHistory(): Promise<OperationResult<boolean>>

  /**
   * 启用事件记录
   */
  enableEventLogging(): Promise<OperationResult<boolean>>

  /**
   * 禁用事件记录
   */
  disableEventLogging(): Promise<OperationResult<boolean>>
}

/**
 * 性能监控服务接口
 */
export interface PerformanceService extends BaseService {
  /**
   * 开始性能监控
   */
  startMonitoring(): Promise<OperationResult<boolean>>

  /**
   * 停止性能监控
   */
  stopMonitoring(): Promise<OperationResult<boolean>>

  /**
   * 获取性能指标
   */
  getMetrics(): Promise<OperationResult<Record<string, any>>>

  /**
   * 重置性能指标
   */
  resetMetrics(): Promise<OperationResult<boolean>>

  /**
   * 记录性能标记
   */
  mark(name: string): Promise<OperationResult<boolean>>

  /**
   * 测量性能
   */
  measure(name: string, startMark: string, endMark: string): Promise<OperationResult<number>>

  /**
   * 获取内存使用情况
   */
  getMemoryUsage(): Promise<OperationResult<Record<string, number>>>

  /**
   * 获取渲染性能
   */
  getRenderPerformance(): Promise<OperationResult<Record<string, number>>>
}

/**
 * 服务管理器接口
 */
export interface ServiceManager {
  /**
   * 注册服务
   */
  registerService<T extends BaseService>(name: string, service: T): void

  /**
   * 获取服务
   */
  getService<T extends BaseService>(name: string): T | null

  /**
   * 移除服务
   */
  removeService(name: string): boolean

  /**
   * 初始化所有服务
   */
  initializeAll(): Promise<void>

  /**
   * 销毁所有服务
   */
  destroyAll(): Promise<void>

  /**
   * 获取服务状态
   */
  getServiceStatus(): Record<string, boolean>
}

/**
 * 服务工厂接口
 */
export interface ServiceFactory {
  /**
   * 创建节点服务
   */
  createNodeService(): NodeService

  /**
   * 创建连接服务
   */
  createConnectionService(): ConnectionService

  /**
   * 创建画布服务
   */
  createCanvasService(): CanvasService

  /**
   * 创建历史服务
   */
  createHistoryService(): HistoryService

  /**
   * 创建选择服务
   */
  createSelectionService(): SelectionService

  /**
   * 创建布局服务
   */
  createLayoutService(): LayoutService

  /**
   * 创建验证服务
   */
  createValidationService(): ValidationService

  /**
   * 创建导入导出服务
   */
  createImportExportService(): ImportExportService

  /**
   * 创建存储服务
   */
  createStorageService(): StorageService

  /**
   * 创建事件服务
   */
  createEventService(): EventService

  /**
   * 创建性能监控服务
   */
  createPerformanceService(): PerformanceService
}