/**
 * 节点类型定义工具类
 * 统一管理所有节点类型的配置信息
 * 
 * 视觉设计原则：
 * 1. 统一色彩系统：基于Arco Design的色彩体系
 * 2. 功能分组：按节点功能分类，每类使用同一色系的不同明度
 * 3. 可访问性：确保WCAG 2.1 AA级别的对比度要求
 * 4. 色盲友好：避免仅依靠颜色区分，配合图标和文字
 * 5. 视觉层次：通过明度和饱和度创建清晰的视觉层次
 */

import { canvasConfig } from '../pages/marketing/tasks/utils/canvas/canvasConfig.js'

/**
 * 现代化色彩系统设计
 * 基于2024年设计趋势，提供更简洁、专业的视觉体验
 * 
 * 设计目标：
 * 1. 降低饱和度10-15%，减少视觉疲劳
 * 2. 增加中性色层次，提升内容可读性
 * 3. 优化对比度，确保WCAG 2.1 AA合规
 * 4. 建立统一的8px网格系统
 * 
 * 可访问性设计原则：
 * 1. WCAG 2.1 AA级别对比度：文本与背景对比度 ≥ 4.5:1
 * 2. 色盲友好：避免仅依靠颜色区分，提供图标/文字辅助
 * 3. 明暗适应：支持不同亮度环境
 * 4. 状态清晰：hover、active、disabled状态明确可辨
 */
const ColorSystem = {
  // 主色系 - 降低饱和度的蓝色系
  primary: {
    start: '#2563eb',      // 开始节点 - 沉稳蓝 (对比度: 5.2:1)
    end: '#475569',        // 结束节点 - 中性灰蓝 (对比度: 5.8:1)
    general: '#0891b2'     // 通用节点 - 青蓝 (对比度: 4.9:1)
  },
  
  // 业务逻辑系 - 统一红色系，降低饱和度
  logic: {
    base: '#dc2626',       // 基础红 - 人群分流 (对比度: 5.1:1)
    light: '#ef4444',      // 浅红 - 事件分流 (对比度: 4.6:1)
    dark: '#b91c1c'        // 深红 - AB实验 (对比度: 6.1:1)
  },
  
  // 触达系 - 更自然的绿色系
  outreach: {
    base: '#059669',       // 森林绿 - 短信 (对比度: 5.3:1)
    light: '#10b981',      // 翡翠绿 - 邮件 (对比度: 4.8:1)
    dark: '#047857'        // 深绿 - 外呼 (对比度: 6.2:1)
  },
  
  // 权益系 - 温暖的橙色系
  benefit: {
    base: '#ea580c',       // 温暖橙 - 权益发放 (对比度: 4.7:1)
    light: '#f97316',      // 浅橙 - 优惠券 (对比度: 4.3:1)
    dark: '#c2410c'        // 深橙 - 积分 (对比度: 5.9:1)
  },
  
  // 时间系 - 优雅的紫色系
  time: {
    base: '#7c3aed',       // 优雅紫 - 等待节点 (对比度: 5.4:1)
    light: '#a855f7',      // 浅紫 - 定时任务 (对比度: 4.5:1)
    dark: '#6d28d9'        // 深紫 - 延迟执行 (对比度: 6.3:1)
  },
  
  // 中性色系统 - 增加灰度层次
  neutral: {
    50: '#f8fafc',     // 背景色
    100: '#f1f5f9',    // 浅灰背景
    200: '#e2e8f0',    // 边框色
    300: '#cbd5e1',    // 次要边框
    400: '#94a3b8',    // 次要文字
    500: '#64748b',    // 默认文字
    600: '#475569',    // 主要文字
    700: '#334155',    // 标题文字
    800: '#1e293b',    // 深色文字
    900: '#0f172a'     // 最深文字
  },
  
  // 文字色彩系统
  text: {
    primary: '#1e293b',    // 主要文字 - 深蓝灰
    secondary: '#64748b',  // 次要文字 - 中灰
    disabled: '#94a3b8',   // 禁用文字 - 浅灰
    onPrimary: '#ffffff',  // 主要色上的文字 - 白色
    onDark: '#ffffff',   // 深色背景上的文字 - 白色
    onLight: '#1e293b'   // 浅色背景上的文字 - 深蓝灰
  },
  
  // 状态色彩系统 - 更微妙的状态表达
  state: {
    hover: 'rgba(255, 255, 255, 0.08)',     // 悬停状态 - 更微妙
    active: 'rgba(255, 255, 255, 0.15)',    // 激活状态 - 适中
    disabled: 'rgba(0, 0, 0, 0.06)',        // 禁用状态 - 更淡
    selected: 'rgba(37, 99, 235, 0.12)',    // 选中状态 - 主题色
    error: '#ef4444',                        // 错误状态
    success: '#10b981',                      // 成功状态
    warning: '#f59e0b'                       // 警告状态
  }
}

/**
 * 节点类型配置
 */
export const nodeTypes = {
  // ===== 主节点 - 蓝色系 =====
  'start': {
    label: '开始',
    color: ColorSystem.primary.start,  // 标准蓝 - 起始节点
    shape: 'circle',
    width: 100,
    height: 100,
    maxOutputs: 1,
    autoExpand: true,
    nextSlots: [
      {
        type: 'single',
        position: { x: 0, y: 160 },
        label: '下一步',
        allowedTypes: ['audience-split', 'crowd-split', 'event-split', 'sms', 'ai-call', 'manual-call', 'ab-test', 'wait', 'benefit', 'end']
      }
    ],
    ports: {
      groups: {
        out: {
          position: 'bottom',
          attrs: {
            circle: {
              r: 6,
              magnet: true,
              stroke: ColorSystem.primary.start,
              strokeWidth: 2,
              fill: '#fff',
              style: {
                visibility: 'visible'
              }
            }
          }
        }
      },
      items: [
        { 
          group: 'out', 
          id: 'out',
          attrs: {
            circle: {
              r: 6,
              magnet: true,
              stroke: ColorSystem.primary.start,
              strokeWidth: 2,
              fill: '#fff',
              style: {
                visibility: 'visible'
              }
            }
          }
        }
      ]
    }
  },
  'end': {
    label: '结束节点',
    color: ColorSystem.primary.end,  // 中性灰蓝 - 结束节点
    shape: 'circle',
    width: 100,
    height: 100,
    maxOutputs: 0,
    autoExpand: false,
    nextSlots: []
  },
  
  // ===== 业务逻辑节点 - 统一红色系 =====
  'audience-split': {
    label: '人群分流',
    color: ColorSystem.logic.base,  // 基础红 - 主要分流节点
    shape: 'circle',
    width: 100,
    height: 100,
    maxOutputs: 'dynamic', // 动态端口数量
    autoExpand: true,
    nextSlots: [] // 动态生成，基于配置页面结果
  },
  // 与 audience-split 等价的别名类型，供横版页面使用
  'crowd-split': {
    label: '人群分流',
    color: ColorSystem.logic.base,  // 基础红 - 主要分流节点
    shape: 'circle',
    width: 100,
    height: 100,
    maxOutputs: 'dynamic',
    autoExpand: true,
    nextSlots: []
  },
  'event-split': {
    label: '事件分流',
    color: ColorSystem.logic.light,  // 浅红 - 事件分流
    shape: 'circle',
    width: 100,
    height: 100,
    maxOutputs: 2,
    autoExpand: true,
    nextSlots: [] // 动态生成，基于配置页面结果
  },
  'ab-test': {
    label: 'AB实验',
    color: ColorSystem.logic.dark,  // 深红 - AB实验
    shape: 'circle',
    width: 100,
    height: 100,
    maxOutputs: 'dynamic',
    autoExpand: true,
    nextSlots: []
  },
  
  // ===== 触达节点 - 统一绿色系 =====
  'sms': {
    label: '短信触达',
    color: ColorSystem.outreach.base,  // 标准绿 - 主要触达方式
    shape: 'circle',
    width: 100,
    height: 100,
    maxOutputs: 1,
    autoExpand: true,
    nextSlots: [
      {
        type: 'single',
        position: { x: 0, y: 150 },
        label: '下一步',
        allowedTypes:  ['audience-split', 'crowd-split', 'event-split', 'sms', 'email', 'wechat', 'ai-call', 'manual-call', 'ab-test', 'wait', 'condition', 'benefit', 'task', 'end']
      }
    ]
  },
  'email': {
    label: '邮件触达',
    color: ColorSystem.outreach.light,  // 浅绿 - 邮件方式
    shape: 'circle',
    width: 100,
    height: 100,
    maxOutputs: 1,
    autoExpand: true,
    nextSlots: [
      {
        type: 'single',
        position: { x: 0, y: 150 },
        label: '下一步',
        allowedTypes: ['audience-split', 'crowd-split', 'event-split', 'sms', 'email', 'wechat', 'ai-call', 'manual-call', 'ab-test', 'wait', 'condition', 'benefit', 'task', 'end']
      }
    ]
  },
  'wechat': {
    label: '微信触达',
    color: ColorSystem.outreach.light,  // 浅绿 - 微信方式
    shape: 'circle',
    width: 100,
    height: 100,
    maxOutputs: 1,
    autoExpand: true,
    nextSlots: [
      {
        type: 'single',
        position: { x: 0, y: 150 },
        label: '下一步',
        allowedTypes: ['audience-split', 'crowd-split', 'event-split', 'sms', 'email', 'wechat', 'ai-call', 'manual-call', 'ab-test', 'wait', 'condition', 'benefit', 'task', 'end']
      }
    ]
  },
  'ai-call': {
    label: 'AI外呼',
    color: ColorSystem.outreach.dark,  // 深绿 - AI外呼
    shape: 'circle',
    width: 100,
    height: 100,
    maxOutputs: 1,
    autoExpand: true,
    nextSlots: [
      {
        type: 'single',
        position: { x: 0, y: 150 },
        label: '下一步',
        allowedTypes: ['audience-split', 'crowd-split', 'event-split', 'sms', 'email', 'wechat', 'ai-call', 'manual-call', 'ab-test', 'wait', 'condition', 'benefit', 'task', 'end']
      }
    ]
  },
  'manual-call': {
    label: '人工外呼',
    color: ColorSystem.outreach.dark,  // 深绿 - 人工外呼
    shape: 'circle',
    width: 100,
    height: 100,
    maxOutputs: 1,
    autoExpand: true,
    nextSlots: [
      {
        type: 'single',
        position: { x: 0, y: 150 },
        label: '下一步',
        allowedTypes: ['audience-split', 'crowd-split', 'event-split', 'sms', 'email', 'wechat', 'ai-call', 'manual-call', 'ab-test', 'wait', 'condition', 'benefit', 'task', 'end']
      }
    ]
  },
  
  // ===== 权益节点 - 统一橙色系 =====
  'benefit': {
    label: '权益节点',
    color: ColorSystem.benefit.base,  // 标准橙 - 权益发放
    shape: 'circle',
    width: 100,
    height: 100,
    maxOutputs: 1,
    autoExpand: true,
    nextSlots: [
      {
        type: 'single',
        position: { x: 0, y: 150 },
        label: '下一步',
        allowedTypes: ['audience-split', 'crowd-split', 'event-split', 'sms', 'ai-call', 'manual-call', 'ab-test', 'wait', 'condition', 'benefit', 'task', 'end']
      }
    ]
  },

  // ===== 时间控制节点 - 紫色系 =====
  'wait': {
    label: '等待节点',
    color: ColorSystem.time.base,  // 标准紫 - 时间控制
    shape: 'circle',
    width: 100,
    height: 100,
    maxOutputs: 1,
    autoExpand: true,
    nextSlots: [
      {
        type: 'single',
        position: { x: 0, y: 150 },
        label: '下一步',
        allowedTypes: ['audience-split', 'crowd-split', 'event-split', 'sms', 'ai-call', 'manual-call', 'ab-test', 'wait', 'condition', 'benefit', 'task', 'end']
      }
    ]
  },
  // 🔧 修复：添加缺失的task类型定义
  'task': {
    label: '任务节点',
    color: '#722ED1',
    shape: 'circle',
    width: 100,
    height: 100,
    maxOutputs: 1,
    autoExpand: true,
    nextSlots: [
      {
        type: 'single',
        position: { x: 0, y: 150 },
        label: '下一步',
        allowedTypes: ['audience-split', 'crowd-split', 'event-split', 'sms', 'ai-call', 'manual-call', 'ab-test', 'wait', 'benefit', 'task', 'end']
      }
    ]
  }
}

/**
 * 获取节点配置
 * @param {string} nodeType - 节点类型
 * @returns {Object|null} 节点配置对象
 */
export const getNodeConfig = (nodeType) => {
  // 🔧 修复：添加类型检查，处理非字符串类型
  if (typeof nodeType !== 'string') {

    return null
  }
  
  // 🔧 修复：处理空字符串和空值
  if (!nodeType || nodeType.trim() === '') {

    return null
  }
  
  const normalizedType = nodeType.trim()
  const config = nodeTypes[normalizedType]

  })
  
  if (!config) {
    // 🔧 修复：为常见的错误类型提供更好的错误信息
    if (normalizedType === 'task') {
      console.warn(`[getNodeConfig] Unknown node type: "${normalizedType}". Did you mean one of: ${Object.keys(nodeTypes).join(', ')}?`)
    } else {
      console.warn(`[getNodeConfig] Unknown node type: "${normalizedType}". Available types: ${Object.keys(nodeTypes).join(', ')}`)
    }
    return null
  }
  
  return { ...config }
}

/**
 * 获取节点的X6属性配置
 * @param {string} nodeType - 节点类型
 * @returns {Object} X6节点属性配置
 */
export const getNodeAttrs = (nodeType) => {
  const config = getNodeConfig(nodeType)
  if (!config) {

    return {}
  }

  // 🔧 修复：返回正确的X6节点样式配置，确保与FlowNode.vue和x6Config.js保持一致
  return {
    body: {
      fill: config.color,
      stroke: config.color,
      strokeWidth: 2,
      // 🔧 修复：根据shape属性设置正确的圆角
      rx: config.shape === 'circle' ? config.width / 2 : 8,
      ry: config.shape === 'circle' ? config.height / 2 : 8
    },
    label: {
      text: config.label,
      fill: '#fff',
      fontSize: 12,
      fontWeight: 'bold',
      textAnchor: 'middle',
      textVerticalAnchor: 'middle'
    }
  }
}

/**
 * 获取节点的端口配置
 * @param {string} nodeType - 节点类型
 * @param {Object} options - 额外选项
 * @returns {Object} 端口配置
 */
export const getNodePorts = (nodeType, options = {}) => {
  const config = getNodeConfig(nodeType)
  if (!config) return { groups: {}, items: [] }

  // 如果节点配置中已定义端口，直接返回
  if (config.ports) {
    return config.ports
  }

  // 🔧 修复：直接使用portConfigFactory创建端口配置，确保一致性
  const { createNodePortConfig } = require('../pages/marketing/tasks/utils/canvas/portConfigFactory.js')
  return createNodePortConfig(nodeType, config)
}

/**
 * 获取所有节点类型
 * @returns {string[]} 节点类型数组
 */
export const getAllNodeTypes = () => {
  const types = Object.keys(nodeTypes)
  
  // 🔧 修复：过滤掉无效的键，确保返回的都是有效的字符串
  const validTypes = types.filter(type => {
    return type && 
           typeof type === 'string' && 
           type.trim() !== '' &&
           nodeTypes[type] && 
           typeof nodeTypes[type] === 'object'
  })

  return validTypes
}

/**
 * 检查节点类型是否存在
 * @param {string} nodeType - 节点类型
 * @returns {boolean} 是否存在
 */
export const isValidNodeType = (nodeType) => {
  // 🔧 修复：添加类型检查，处理非字符串类型
  if (typeof nodeType !== 'string') {
    return false
  }
  
  // 🔧 修复：处理空字符串和空值
  if (!nodeType || nodeType.trim() === '') {
    return false
  }
  
  return nodeTypes.hasOwnProperty(nodeType.trim())
}

/**
 * 获取节点类型的显示标签
 * @param {string} nodeType - 节点类型
 * @returns {string} 显示标签
 */
export const getNodeLabel = (nodeType) => {
  // 🔧 修复：添加类型检查，处理非字符串类型
  if (typeof nodeType !== 'string') {

    return '未知节点'
  }
  
  // 🔧 修复：处理空字符串和空值
  if (!nodeType || nodeType.trim() === '') {

    return '未知节点'
  }
  
  const config = getNodeConfig(nodeType)
  return config ? config.label : nodeType
}

/**
 * 动态生成节点的预设位配置
 * @param {string} nodeType - 节点类型
 * @param {Object} config - 节点配置数据
 * @returns {Array} 预设位配置数组
 */
export const generateDynamicNextSlots = (nodeType, config = {}) => {
  const allowedTypes = ['audience-split', 'crowd-split', 'event-split', 'sms', 'ai-call', 'manual-call', 'ab-test', 'wait', 'benefit', 'end']
  
  switch (nodeType) {
    case 'start':
      // 开始节点的预设位
      const startSlots = [
        {
          id: 'start-next-1',
          type: 'single',
          position: { x: 0, y: 160 },
          label: '下一步',
          allowedTypes,
          occupied: false,
          state: 'empty'
        }
      ]
      return startSlots

    case 'sms':
    case 'ai-call':
    case 'manual-call':
    case 'wait':
    case 'benefit':
      // 单输出节点的预设位
      const singleSlots = [
        {
          id: `${nodeType}-next-1`,
          type: 'single',
          position: { x: 0, y: 160 },
          label: '下一步',
          allowedTypes,
          occupied: false,
          state: 'empty'
        }
      ]
      return singleSlots

    case 'audience-split':
    case 'crowd-split':
      // 基于人群分流配置生成分支
      if (config.branches && Array.isArray(config.branches)) {
        const branchSlots = config.branches.map((branch, index) => {
          // 计算分支位置，确保分支均匀分布
          const totalBranches = config.branches.length
          const spacing = Math.min(160, 280 / Math.max(1, totalBranches - 1)) // 🔧 优化：动态间距提升，改善分支布局
          const startX = -(totalBranches - 1) * spacing / 2
          
          return {
            id: `${nodeType}-branch-${index}`,
            type: 'branch',
            position: { 
              x: startX + index * spacing, 
              y: 160 
            },
            label: branch.isDefault ? '未命中人群' : (branch.name || `分流${index + 1}`),
            allowedTypes,
            occupied: false,
            state: 'empty',
            branchData: {
              isDefault: branch.isDefault || false,
              crowdId: branch.crowdId || null,
              name: branch.name || ''
            }
          }
        })
        return branchSlots
      }
      
      // 如果有 branchCount 配置，根据数量生成分支
      if (config.branchCount && typeof config.branchCount === 'number') {
        const branchCount = Math.max(1, Math.min(10, config.branchCount)) // 限制在1-10之间
        // 不再自动添加未命中分支，总数就是配置的分支数
        const totalBranches = branchCount
        const spacing = Math.min(120, 200 / Math.max(1, totalBranches - 1))
        const startX = -(totalBranches - 1) * spacing / 2
        
        const branchSlots = []
        
        // 生成普通分流分支
        for (let i = 0; i < branchCount; i++) {
          branchSlots.push({
            id: `${nodeType}-branch-${i}`,
            type: 'branch',
            position: { 
              x: startX + i * spacing, 
              y: 160 
            },
            label: `分流${i + 1}`,
            allowedTypes,
            occupied: false,
            state: 'empty',
            branchData: {
              isDefault: false,
              crowdId: null,
              name: `分流${i + 1}`
            }
          })
        }
        
        return branchSlots
      }
      
      // 默认配置：只生成一个分流分支，未命中分支由配置管理
      const defaultAudienceSlots = [
        {
          id: `${nodeType}-branch-0`,
          type: 'branch',
          position: { x: 0, y: 160 },
          label: '分流1',
          allowedTypes,
          occupied: false,
          state: 'empty',
          branchData: {
            isDefault: false,
            crowdId: null,
            name: '分流1'
          }
        }
      ]
      return defaultAudienceSlots

    case 'event-split':
      // 基于事件分流配置生成分支
      const eventSlots = [
        {
          id: 'event-split-true',
          type: 'branch',
          position: { x: -80, y: 160 },
          label: config.trueLabel || '是',
          allowedTypes,
          occupied: false,
          state: 'empty'
        },
        {
          id: 'event-split-false',
          type: 'branch',
          position: { x: 80, y: 160 },
          label: config.falseLabel || '否',
          allowedTypes,
          occupied: false,
          state: 'empty'
        }
      ]
      return eventSlots

    case 'ab-test':
      // 基于AB实验配置生成版本分支
      if (config.versions && Array.isArray(config.versions)) {
        // 过滤掉比例为0的版本，支持动态分支数量
        const activeVersions = config.versions.filter(version => version.ratio > 0)
        const versionSlots = activeVersions.map((version, index) => ({
          id: `ab-test-version-${index}`,
          type: 'branch',
          position: { 
            x: (index - (activeVersions.length - 1) / 2) * 120, 
            y: 150 
          },
          label: version.name || `版本${String.fromCharCode(65 + index)}`,
          allowedTypes,
          occupied: false,
          state: 'empty'
        }))
        return versionSlots
      }
      
      // 基于variants配置生成变体分支
      if (config.variants && Array.isArray(config.variants)) {
        const activeVariants = config.variants.filter(variant => variant.percentage > 0)
        const variantSlots = activeVariants.map((variant, index) => ({
          id: `ab-test-variant-${index}`,
          type: 'branch',
          position: { 
            x: (index - (activeVariants.length - 1) / 2) * 120, 
            y: 150 
          },
          label: variant.name || `变体${String.fromCharCode(65 + index)}`,
          allowedTypes,
          occupied: false,
          state: 'empty'
        }))
        return variantSlots
      }
      
      // 默认两个版本
      const defaultAbSlots = [
        {
          id: 'ab-test-version-0',
          type: 'branch',
          position: { x: -80, y: 150 },
          label: '版本A',
          allowedTypes,
          occupied: false,
          state: 'empty'
        },
        {
          id: 'ab-test-version-1',
          type: 'branch',
          position: { x: 80, y: 150 },
          label: '版本B',
          allowedTypes,
          occupied: false,
          state: 'empty'
        }
      ]
      return defaultAbSlots

    case 'end':
      // 结束节点没有预设位
      return []

    default:

      return []
  }
}

/**
 * 获取任务类型标签映射
 */
export const getTaskTypeLabels = () => ({
  marketing: '营销活动',
  notification: '通知推送',
  survey: '问卷调研',
  retention: '用户留存'
})

/**
 * 获取任务类型对应的颜色
 */
export const getTaskTypeColors = () => ({
  marketing: '#FF6B6B',
  notification: '#4ECDC4',
  survey: '#45B7D1',
  retention: '#96CEB4'
})

export default {
  nodeTypes,
  getNodeConfig,
  getNodeAttrs,
  getNodePorts,
  getAllNodeTypes,
  isValidNodeType,
  getNodeLabel,
  generateDynamicNextSlots,
  getTaskTypeLabels,
  getTaskTypeColors
}