// 横版端口配置工厂：左进右出，出端口数量可配置
import { COLORS, NODE_DIMENSIONS, INTERACTION_STATES, TYPOGRAPHY } from '../styles/nodeStyles.js'
import { usePortValidation } from '../composables/usePortValidation.js'

/**
 * 创建横向端口配置
 * @param {number} outCount - 输出端口数量
 * @param {Object} options - 配置选项
 * @param {boolean} options.includeIn - 是否包含输入端口
 * @param {Array} options.outIds - 输出端口ID数组
 * @param {Array} options.verticalOffsets - 垂直偏移数组
 * @param {number} options.nodeHeight - 节点高度
 * @param {number} options.inVerticalOffset - 输入端口垂直偏移
 * @param {Array} options.contentLines - 内容行数组（用于验证）
 * @param {number} options.tolerance - 误差容忍度（默认±2px）
 * @param {boolean} options.enableValidation - 是否启用验证
 * @returns {Object} 端口配置对象
 */
export function createHorizontalPortConfig(outCount = 1, options = {}) {
  const { 
    includeIn = true,
    includeOut = true,
    outIds = null, 
    verticalOffsets = null, 
    nodeHeight = null, 
    inVerticalOffset = null,
    contentStart = null,
    contentEnd = null,
    contentLines = null,
    tolerance = 2,
    enableValidation = false,
    evenDistribution = false
  } = options

  const groups = {
    in: {
      position: 'left',
      layout: { name: 'fixed-left-y' },
      connectOptions: {
        // 限制in端口组只能接收连接
        inbound: true,
        outbound: false,
        // 每个in端口只能有一条连接
        maxConnections: 1
      },
      attrs: {
        circle: { 
          r: NODE_DIMENSIONS.PORT_RADIUS, 
          magnet: true, 
          stroke: COLORS.PORT_STROKE, 
          strokeWidth: COLORS.PORT_STROKE_WIDTH, 
          fill: COLORS.PORT_FILL_IN,
          // 限制in端口只能连接一条线
          maxConnections: 1,
          // 端口类型标识
          portType: 'in',
          // 连接方向限制：只能作为目标端口
          allowSource: false,
          allowTarget: true,
          // 交互状态样式
          style: {
            cursor: 'crosshair',
            transition: 'all 0.3s ease',
            transformOrigin: 'center center'
          },
          // 悬停状态
          hover: {
            stroke: COLORS.PORT_STROKE,
            strokeWidth: 2,
            fill: COLORS.PORT_FILL_IN
          },
          // 连接中状态
          connecting: {
            stroke: '#2563EB',
            strokeWidth: 2,
            fill: COLORS.PORT_FILL_IN
          },
          // 已连接状态
          connected: {
            stroke: COLORS.PORT_STROKE,
            strokeWidth: COLORS.PORT_STROKE_WIDTH,
            fill: COLORS.PORT_FILL_IN
          }
        }
      }
    },
    out: {
      position: { name: 'absolute' },
      layout: null,
      connectOptions: {
        // 限制out端口组只能发出连接
        inbound: false,
        outbound: true,
        // 每个out端口只能有一条连接
        maxConnections: 1
      },
      attrs: {
        circle: { 
          r: NODE_DIMENSIONS.PORT_RADIUS, 
          magnet: true, 
          stroke: COLORS.PORT_STROKE, 
          strokeWidth: COLORS.PORT_STROKE_WIDTH, 
          fill: COLORS.PORT_FILL_OUT,
          // 限制out端口只能连接一条线
          maxConnections: 1,
          // 端口类型标识
          portType: 'out',
          // 连接方向限制：只能作为源端口
          allowSource: true,
          allowTarget: false,
          // 交互状态样式
          style: {
            cursor: 'crosshair',
            transition: 'all 0.3s ease',
            transformOrigin: 'center center'
          },
          // 悬停状态
          hover: {
            stroke: COLORS.PORT_STROKE,
            strokeWidth: 2,
            fill: COLORS.PORT_FILL_OUT
          },
          // 连接中状态
          connecting: {
            stroke: '#2563EB',
            strokeWidth: 2,
            fill: '#2563EB'
          },
          // 已连接状态
          connected: {
            stroke: COLORS.PORT_STROKE,
            strokeWidth: COLORS.PORT_STROKE_WIDTH,
            fill: COLORS.PORT_FILL_OUT
          }
        }
      }
    }
  }

  const items = []
  if (includeIn) {
    // in端口始终位于节点中心，不需要偏移
    items.push({ id: 'in', group: 'in', args: { dy: 0 }, attrs: { circle: { 'data-port': 'in', 'data-port-group': 'in', 'data-port-type': 'in', class: 'x6-port-body' } }, markup: [{ tagName: 'circle', selector: 'circle' }] })
    console.log('📐 [portConfigFactoryHorizontal] 创建in端口:', { id: 'in', group: 'in', dy: 0 })
  }

  // 输出端口：仅当开启时才生成
  const ids = includeOut && outIds && Array.isArray(outIds)
    ? outIds
    : includeOut
      ? Array.from({ length: Math.max(1, outCount) }, (_, i) => `out-${i}`)
      : []

  // 工具函数：在内容区范围内钳制Y坐标
  const clamp = (val, min, max) => {
    if (typeof min !== 'number' || typeof max !== 'number') return val
    return Math.max(min, Math.min(max, val))
  }

  ids.forEach((id, idx) => {
    const start = typeof contentStart === 'number' ? contentStart : (NODE_DIMENSIONS.HEADER_HEIGHT + NODE_DIMENSIONS.CONTENT_PADDING)
    const end = typeof contentEnd === 'number' ? contentEnd : (start + Math.max(1, outCount) * NODE_DIMENSIONS.ROW_HEIGHT)
    const contentH = end - start
    let yRel
    if (evenDistribution && contentH > 0) {
      const n = Math.max(1, ids.length)
      const step = contentH / n
      yRel = start + (idx + 0.5) * step
    } else {
      const base = start + idx * NODE_DIMENSIONS.ROW_HEIGHT + Math.floor(NODE_DIMENSIONS.ROW_HEIGHT / 2)
      yRel = base
    }
    const yClamped = clamp(yRel, start, end)
    const args = { x: NODE_DIMENSIONS.WIDTH, y: yClamped }
    const item = {
      id,
      group: 'out',
      args,
      attrs: { circle: { 'data-port': id, 'data-port-group': 'out', 'data-port-type': 'out', 'data-abs-y': String(yClamped), class: 'x6-port-body', cx: 0, cy: 0 } },
      markup: [{ tagName: 'circle', selector: 'circle' }]
    }
    items.push(item)
  })
  
  // 创建端口配置
  const portConfig = { groups, items }
  
  // 如果启用了验证且提供了内容行，进行端口位置验证
  if (enableValidation && contentLines && Array.isArray(contentLines)) {
    const { validatePortPositions } = usePortValidation()
    const validationResult = validatePortPositions(portConfig, contentLines, tolerance)
    
    console.log('🔍 [portConfigFactory] 端口验证结果:', {
      isValid: validationResult.isValid,
      errors: validationResult.errors,
      warnings: validationResult.warnings,
      contentLinesCount: contentLines.length,
      portItemsCount: portConfig.items.length
    })
    
    if (!validationResult.isValid) {
      console.warn('端口配置验证失败:', validationResult.errors)
      if (validationResult.warnings.length > 0) {
        console.warn('端口配置警告:', validationResult.warnings)
      }
    }
    
    // 将验证结果附加到配置对象上
    portConfig._validation = validationResult
  }

  return portConfig
}

export default { createHorizontalPortConfig }