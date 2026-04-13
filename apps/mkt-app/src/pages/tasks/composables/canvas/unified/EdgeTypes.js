/**
 * 统一边数据模型和类型定义
 * 用于预览线与连接线功能集成
 */

// 边的类型枚举
export const EdgeTypes = {
  PREVIEW: 'preview',           // 预览线
  CONNECTION: 'connection',     // 真实连接线
  TEMPORARY: 'temporary'        // 临时连接线
}

// 预览线状态枚举
export const PreviewStates = {
  INTERACTIVE: 'interactive',   // 可交互状态
  DRAGGING: 'dragging',        // 拖拽中状态
  CONNECTED: 'connected',      // 已连接状态
  HOVER: 'hover',              // 鼠标悬停状态
  PENDING: 'pending',          // 待处理状态
  INVALID: 'invalid'           // 无效状态
}

// 连接线状态枚举
export const ConnectionStates = {
  ACTIVE: 'active',            // 活跃连接
  INACTIVE: 'inactive',        // 非活跃连接
  BROKEN: 'broken',            // 断开连接
  VALIDATING: 'validating'     // 验证中
}

// 节点类型枚举
export const NodeTypes = {
  AUDIENCE_SPLIT: 'audience-split',  // 人群分流
  EVENT_SPLIT: 'event-split',        // 事件分流
  AB_TEST: 'ab-test',               // AB测试
  NORMAL: 'normal',                 // 普通节点
  START: 'start',                   // 开始节点
  END: 'end'                        // 结束节点
}

// 边端点接口
export class EdgeEndpoint {
  constructor(nodeId, portId = null, position = null, offset = null) {
    this.nodeId = nodeId
    this.portId = portId
    this.position = position
    this.offset = offset
  }
}

// 分支信息接口
export class BranchInfo {
  constructor(id, label, index, color = null) {
    this.id = id
    this.label = label
    this.index = index
    this.color = color
  }
}

// 边样式接口
export class EdgeStyle {
  constructor(options = {}) {
    this.stroke = options.stroke || '#1890ff'
    this.strokeWidth = options.strokeWidth || 2
    this.strokeDasharray = options.strokeDasharray || '0'
    this.opacity = options.opacity || 1
    this.targetMarker = options.targetMarker || null
    this.animation = options.animation || null
  }
}

// 渲染配置接口
export class RenderConfig {
  constructor(options = {}) {
    this.visible = options.visible !== false
    this.zIndex = options.zIndex || 0
    this.interactive = options.interactive !== false
    this.selectable = options.selectable !== false
  }
}

// 边元数据接口
export class EdgeMetadata {
  constructor(options = {}) {
    this.createdAt = options.createdAt || Date.now()
    this.updatedAt = options.updatedAt || Date.now()
    this.createdBy = options.createdBy || 'system'
    this.version = options.version || '2.0'
    this.lastAccessed = options.lastAccessed || Date.now()
  }
}

// 统一边数据接口
export class UnifiedEdge {
  constructor(options = {}) {
    // 基础标识
    this.id = options.id || this.generateId()
    this.type = options.type || EdgeTypes.PREVIEW
    
    // 连接信息
    this.source = options.source instanceof EdgeEndpoint 
      ? options.source 
      : new EdgeEndpoint(
          options.source?.nodeId || options.source, 
          options.source?.port || options.source?.portId
        )
    this.target = options.target 
      ? (options.target instanceof EdgeEndpoint 
          ? options.target 
          : new EdgeEndpoint(
              options.target?.nodeId || options.target,
              options.target?.port || options.target?.portId
            ))
      : null
    
    // 状态管理
    this.state = options.state || (this.type === EdgeTypes.PREVIEW ? PreviewStates.INTERACTIVE : ConnectionStates.ACTIVE)
    this.isPreview = this.type === EdgeTypes.PREVIEW
    this.isConnected = !!this.target
    this.isValid = options.isValid !== false
    
    // 分支信息
    this.branch = options.branch instanceof BranchInfo 
      ? options.branch 
      : (options.branchId ? new BranchInfo(options.branchId, options.branchLabel, options.branchIndex) : null)
    
    // 样式配置
    this.style = options.style instanceof EdgeStyle 
      ? options.style 
      : new EdgeStyle(options.style)
    
    // 渲染配置
    this.render = options.render instanceof RenderConfig 
      ? options.render 
      : new RenderConfig(options.render)
    
    // 元数据
    this.metadata = options.metadata instanceof EdgeMetadata 
      ? options.metadata 
      : new EdgeMetadata(options.metadata)
    
    // X6图形实例引用
    this.graphInstance = null
  }
  
  // 生成唯一ID
  generateId() {
    return `edge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
  
  // 检查是否为预览线
  isPreviewLine() {
    return this.type === EdgeTypes.PREVIEW || this.isPreview || !this.target
  }
  
  // 检查是否为连接线
  isConnectionLine() {
    return this.type === EdgeTypes.CONNECTION && this.target && this.isConnected
  }
  
  // 获取连接键（用于去重）
  getConnectionKey() {
    const sourceId = this.source?.nodeId || 'unknown'
    const targetId = this.target?.nodeId || 'unknown'
    const branchId = this.branch?.id || 'default'
    return `${sourceId}-${targetId}-${branchId}`
  }
  
  // 更新状态
  updateState(newState) {
    const oldState = this.state
    this.state = newState
    this.metadata.updatedAt = Date.now()
    return { oldState, newState }
  }
  
  // 转换为预览线
  convertToPreview() {
    this.type = EdgeTypes.PREVIEW
    this.state = PreviewStates.INTERACTIVE
    this.isPreview = true
    this.isConnected = false
    this.target = null
    this.metadata.updatedAt = Date.now()
    return this
  }
  
  // 转换为连接线
  convertToConnection(targetEndpoint) {
    this.type = EdgeTypes.CONNECTION
    this.state = ConnectionStates.ACTIVE
    this.isPreview = false
    this.isConnected = true
    this.target = targetEndpoint instanceof EdgeEndpoint 
      ? targetEndpoint 
      : new EdgeEndpoint(targetEndpoint?.nodeId || targetEndpoint)
    this.metadata.updatedAt = Date.now()
    return this
  }
  
  // 验证边的有效性
  validate() {
    const errors = []
    
    if (!this.source?.nodeId) {
      errors.push('缺少源节点ID')
    }
    
    if (this.type === EdgeTypes.CONNECTION && !this.target?.nodeId) {
      errors.push('连接线必须有目标节点')
    }
    
    if (this.isPreview && this.target?.nodeId) {
      errors.push('预览线不应该有目标节点')
    }
    
    this.isValid = errors.length === 0
    
    return {
      isValid: this.isValid,
      errors
    }
  }
  
  // 转换为X6边数据格式
  toX6EdgeData() {
    const baseData = {
      id: this.id,
      source: this.source.nodeId,
      sourcePort: this.source.portId || 'out',
      data: {
        type: this.type,
        isPreview: this.isPreview,
        isConnected: this.isConnected,
        state: this.state,
        branchId: this.branch?.id,
        branchLabel: this.branch?.label,
        branchIndex: this.branch?.index,
        createdBy: this.metadata.createdBy,
        version: this.metadata.version
      },
      attrs: {
        line: {
          stroke: this.style.stroke,
          strokeWidth: this.style.strokeWidth,
          strokeDasharray: this.style.strokeDasharray,
          opacity: this.style.opacity
        }
      }
    }
    
    // 如果有目标节点，添加目标信息
    if (this.target?.nodeId) {
      baseData.target = this.target.nodeId
      baseData.targetPort = this.target.portId || 'in'
      
      // 连接线添加箭头
      if (this.type === EdgeTypes.CONNECTION) {
        baseData.attrs.line.targetMarker = {
          name: 'block',
          width: 8,
          height: 8
        }
      }
    }
    
    return baseData
  }
  
  // 从X6边数据创建统一边实例
  static fromX6EdgeData(x6Data) {
    const edgeData = x6Data.getData?.() || x6Data.data || {}
    
    return new UnifiedEdge({
      id: x6Data.id,
      type: edgeData.type || (edgeData.isPreview ? EdgeTypes.PREVIEW : EdgeTypes.CONNECTION),
      source: new EdgeEndpoint(
        x6Data.getSourceCellId?.() || x6Data.source,
        x6Data.getSourcePortId?.() || x6Data.sourcePort
      ),
      target: x6Data.getTargetCellId?.() || x6Data.target 
        ? new EdgeEndpoint(
            x6Data.getTargetCellId?.() || x6Data.target,
            x6Data.getTargetPortId?.() || x6Data.targetPort
          )
        : null,
      state: edgeData.state,
      isValid: true,
      branch: edgeData.branchId 
        ? new BranchInfo(edgeData.branchId, edgeData.branchLabel, edgeData.branchIndex)
        : null,
      style: new EdgeStyle(x6Data.getAttrs?.()?.line || {}),
      metadata: new EdgeMetadata({
        createdBy: edgeData.createdBy,
        version: edgeData.version
      })
    })
  }
  
  // 克隆边实例
  clone() {
    return new UnifiedEdge({
      id: this.generateId(), // 生成新ID
      type: this.type,
      source: new EdgeEndpoint(this.source.nodeId, this.source.portId, this.source.position, this.source.offset),
      target: this.target ? new EdgeEndpoint(this.target.nodeId, this.target.portId, this.target.position, this.target.offset) : null,
      state: this.state,
      isValid: this.isValid,
      branch: this.branch ? new BranchInfo(this.branch.id, this.branch.label, this.branch.index, this.branch.color) : null,
      style: new EdgeStyle({
        stroke: this.style.stroke,
        strokeWidth: this.style.strokeWidth,
        strokeDasharray: this.style.strokeDasharray,
        opacity: this.style.opacity,
        targetMarker: this.style.targetMarker,
        animation: this.style.animation
      }),
      render: new RenderConfig({
        visible: this.render.visible,
        zIndex: this.render.zIndex,
        interactive: this.render.interactive,
        selectable: this.render.selectable
      }),
      metadata: new EdgeMetadata({
        createdBy: this.metadata.createdBy,
        version: this.metadata.version
      })
    })
  }
}

// 状态转换规则
export const StateTransitions = {
  // 预览线状态转换
  [PreviewStates.INTERACTIVE]: [PreviewStates.DRAGGING, PreviewStates.HOVER, PreviewStates.INVALID],
  [PreviewStates.DRAGGING]: [PreviewStates.CONNECTED, PreviewStates.INTERACTIVE, PreviewStates.INVALID],
  [PreviewStates.CONNECTED]: [ConnectionStates.ACTIVE],
  [PreviewStates.HOVER]: [PreviewStates.INTERACTIVE, PreviewStates.DRAGGING],
  [PreviewStates.PENDING]: [PreviewStates.INTERACTIVE, PreviewStates.INVALID],
  [PreviewStates.INVALID]: [], // 无效状态不能转换
  
  // 连接线状态转换
  [ConnectionStates.ACTIVE]: [ConnectionStates.INACTIVE, ConnectionStates.BROKEN],
  [ConnectionStates.INACTIVE]: [ConnectionStates.ACTIVE, ConnectionStates.BROKEN],
  [ConnectionStates.BROKEN]: [ConnectionStates.ACTIVE],
  [ConnectionStates.VALIDATING]: [ConnectionStates.ACTIVE, ConnectionStates.BROKEN]
}

// 验证状态转换是否允许
export function canTransitionState(fromState, toState) {
  const allowedTransitions = StateTransitions[fromState] || []
  return allowedTransitions.includes(toState)
}

// 预览线识别函数
export function isPreviewLine(edge) {
  if (!edge) return false
  
  // 如果是UnifiedEdge实例
  if (edge instanceof UnifiedEdge) {
    return edge.isPreviewLine()
  }
  
  // 如果是X6边实例
  const edgeData = edge.getData?.() || edge.data || {}
  
  // 方法1: 通过数据类型判断
  if (edgeData.type === EdgeTypes.PREVIEW || edgeData.isPreview === true) {
    return true
  }
  
  // 方法2: 通过连接状态判断（核心特征）
  const hasSource = edge.getSourceCellId?.() || edge.source?.nodeId || edge.source
  const hasTarget = edge.getTargetCellId?.() || edge.target?.nodeId || edge.target
  
  return hasSource && !hasTarget
}

// 连接线识别函数
export function isConnectionLine(edge) {
  if (!edge) return false
  
  // 如果是UnifiedEdge实例
  if (edge instanceof UnifiedEdge) {
    return edge.isConnectionLine()
  }
  
  // 如果是X6边实例
  const edgeData = edge.getData?.() || edge.data || {}
  
  // 方法1: 通过数据类型判断
  if (edgeData.type === EdgeTypes.CONNECTION && edgeData.isPreview === false) {
    return true
  }
  
  // 方法2: 通过连接状态判断
  const hasSource = edge.getSourceCellId?.() || edge.source?.nodeId || edge.source
  const hasTarget = edge.getTargetCellId?.() || edge.target?.nodeId || edge.target
  
  return hasSource && hasTarget && !edgeData.isPreview
}

// 预览线类型分类
export function classifyPreviewLine(edge) {
  const edgeData = edge.getData?.() || edge.data || {}
  
  if (edgeData.branchId) {
    return {
      type: 'branch-preview',
      branchId: edgeData.branchId,
      branchLabel: edgeData.branchLabel,
      branchIndex: edgeData.branchIndex
    }
  }
  
  return {
    type: 'single-preview'
  }
}

// 获取边的显示样式
export function getEdgeDisplayStyle(edge, nodeType = 'normal') {
  const baseStyle = {
    stroke: '#1890ff',
    strokeWidth: 2,
    strokeDasharray: '0',
    opacity: 1
  }
  
  if (isPreviewLine(edge)) {
    return {
      ...baseStyle,
      stroke: '#52c41a',
      strokeDasharray: '5,5',
      opacity: 0.7
    }
  }
  
  if (isConnectionLine(edge)) {
    const edgeData = edge.getData?.() || edge.data || {}
    
    // 分支连接线使用不同颜色
    if (edgeData.branchId) {
      const branchColors = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1']
      const colorIndex = (edgeData.branchIndex || 0) % branchColors.length
      return {
        ...baseStyle,
        stroke: branchColors[colorIndex],
        targetMarker: {
          name: 'block',
          width: 8,
          height: 8
        }
      }
    }
    
    return {
      ...baseStyle,
      targetMarker: {
        name: 'block',
        width: 8,
        height: 8
      }
    }
  }
  
  return baseStyle
}

export default {
  EdgeTypes,
  PreviewStates,
  ConnectionStates,
  NodeTypes,
  EdgeEndpoint,
  BranchInfo,
  EdgeStyle,
  RenderConfig,
  EdgeMetadata,
  UnifiedEdge,
  StateTransitions,
  canTransitionState,
  isPreviewLine,
  isConnectionLine,
  classifyPreviewLine,
  getEdgeDisplayStyle
}