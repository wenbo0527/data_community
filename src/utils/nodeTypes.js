/**
 * 节点类型定义工具类
 * 统一管理所有节点类型的配置信息
 */

import { canvasConfig } from './canvasConfig.js'

/**
 * 节点类型配置
 */
export const nodeTypes = {
  'start': {
    label: '开始节点',
    color: '#5F95FF',
    shape: 'circle',
    width: 100,
    height: 100,
    maxOutputs: 1,
    autoExpand: true,
    nextSlots: [
      {
        type: 'single',
        position: { x: 0, y: 160 }, // 对齐到网格（8个小网格单位）
        label: '下一步',
        allowedTypes: ['audience-split', 'event-split', 'sms', 'ai-call', 'manual-call', 'ab-test', 'wait', 'end']
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
              stroke: '#5F95FF',
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
              stroke: '#5F95FF',
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
  'audience-split': {
    label: '人群分流',
    color: '#FF6A6A',
    shape: 'circle',
    width: 100,
    height: 100,
    maxOutputs: 'dynamic', // 动态端口数量
    autoExpand: true,
    nextSlots: [] // 动态生成，基于配置页面结果
  },
  'event-split': {
    label: '事件分流',
    color: '#69C0FF',
    shape: 'circle',
    width: 100,
    height: 100,
    maxOutputs: 2,
    autoExpand: true,
    nextSlots: [] // 动态生成，基于配置页面结果
  },
  'sms': {
    label: '短信触达',
    color: '#45B7D1',
    shape: 'circle',
    width: 100,
    height: 100,
    maxOutputs: 1,
    autoExpand: true,
    nextSlots: [
      {
        type: 'single',
        position: { x: 0, y: 150 },        label: '下一步',
        allowedTypes:  ['audience-split', 'event-split', 'sms', 'ai-call', 'manual-call', 'ab-test', 'wait', 'end']
      }
    ]
  },
  'end': {
    label: '结束节点',
    color: '#8C8C8C',
    shape: 'circle',
    width: 100,
    height: 100,
    maxOutputs: 0,
    autoExpand: false,
    nextSlots: []
  },
  'ai-call': {
    label: 'AI外呼',
    color: '#96CEB4',
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
        allowedTypes:  ['audience-split', 'event-split', 'sms', 'ai-call', 'manual-call', 'ab-test', 'wait', 'end']
      }
    ]
  },
  'manual-call': {
    label: '人工外呼',
    color: '#FFEAA7',
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
        allowedTypes:  ['audience-split', 'event-split', 'sms', 'ai-call', 'manual-call', 'ab-test', 'wait', 'end']
      }
    ]
  },
  'ab-test': {
    label: 'AB实验',
    color: '#DDA0DD',
    shape: 'circle',
    width: 100,
    height: 100,
    maxOutputs: 2,
    autoExpand: true,
    nextSlots: [] // 动态生成，基于配置页面结果
  },
  'wait': {
    label: '等待节点',
    color: '#A8A8A8',
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
        allowedTypes:  ['audience-split', 'event-split', 'sms', 'ai-call', 'manual-call', 'ab-test', 'wait', 'end']
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
  const config = nodeTypes[nodeType]
  if (!config) {
    console.warn(`Unknown node type: ${nodeType}`)
    return null
  }
  return { ...config }
}

/**
 * 获取节点的基础属性配置
 * @param {string} nodeType - 节点类型
 * @returns {Object} 节点属性配置
 */
export const getNodeAttrs = (nodeType) => {
  const config = getNodeConfig(nodeType)
  if (!config) return {}

  return {
    body: {
      fill: config.color,        // 使用实心颜色填充
      stroke: config.color,      // 边框颜色与填充颜色一致
      strokeWidth: 0,            // 去掉边框，使用纯实心效果
    },
    text: {
      fill: '#FFFFFF',
      fontSize: nodeType === 'start' ? 14 : 12,
      fontWeight: 'bold',
      textAnchor: 'middle',
      textVerticalAnchor: 'middle',
    },
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

  // 获取布局方向，默认为TB
  const layoutDirection = options.layoutDirection || 'TB'

  // 默认端口配置 - 统一为每个节点配置1个输入端口和1个输出端口
  const portGroups = canvasConfig.getPortGroups(layoutDirection)
  const baseConfig = {
    groups: {
      in: {
        ...portGroups.in,
        attrs: {
          circle: {
            ...portGroups.in.attrs.circle,
            stroke: config.color
          }
        }
      },
      out: {
        ...portGroups.out,
        attrs: {
          circle: {
            ...portGroups.out.attrs.circle,
            stroke: config.color
          }
        }
      }
    },
    items: []
  }

  // 根据节点类型添加端口
  if (nodeType === 'start') {
    // 开始节点只有输出端口
    baseConfig.items.push({
      group: 'out',
      id: 'out',
      attrs: {
        circle: {
          ...portGroups.out.attrs.circle,
          stroke: config.color
        }
      }
    })
  } else if (nodeType === 'end') {
    // 结束节点只有输入端口
    baseConfig.items.push({
      group: 'in',
      id: 'in',
      attrs: {
        circle: {
          ...portGroups.in.attrs.circle,
          stroke: config.color
        }
      }
    })
  } else {
    // 其他节点都有1个输入端口和1个输出端口
    baseConfig.items.push(
      {
        group: 'in',
        id: 'in',
        attrs: {
          circle: {
            ...portGroups.in.attrs.circle,
            stroke: config.color
          }
        }
      },
      {
        group: 'out',
        id: 'out',
        attrs: {
          circle: {
            ...portGroups.out.attrs.circle,
            stroke: config.color
          }
        }
      }
    )
  }

  return baseConfig
}

/**
 * 获取所有节点类型列表
 * @returns {Array} 节点类型数组
 */
export const getAllNodeTypes = () => {
  return Object.keys(nodeTypes)
}

/**
 * 检查节点类型是否存在
 * @param {string} nodeType - 节点类型
 * @returns {boolean} 是否存在
 */
export const isValidNodeType = (nodeType) => {
  return nodeTypes.hasOwnProperty(nodeType)
}

/**
 * 获取节点类型的显示标签
 * @param {string} nodeType - 节点类型
 * @returns {string} 显示标签
 */
export const getNodeLabel = (nodeType) => {
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
  const allowedTypes = ['audience-split', 'event-split', 'sms', 'ai-call', 'manual-call', 'ab-test', 'wait', 'end']
  
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
      // 基于人群分流配置生成分支
      if (config.branches && Array.isArray(config.branches)) {
        const branchSlots = config.branches.map((branch, index) => {
          // 计算分支位置，确保分支均匀分布
          const totalBranches = config.branches.length
          const spacing = Math.min(120, 200 / Math.max(1, totalBranches - 1)) // 动态调整间距
          const startX = -(totalBranches - 1) * spacing / 2
          
          return {
            id: `audience-split-branch-${index}`,
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
            id: `audience-split-branch-${i}`,
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
          id: 'audience-split-branch-0',
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
        const versionSlots = config.versions.map((version, index) => ({
          id: `ab-test-version-${index}`,
          type: 'branch',
          position: { 
            x: (index - (config.versions.length - 1) / 2) * 120, 
            y: 150 
          },
          label: version.name || `版本${String.fromCharCode(65 + index)}`,
          allowedTypes,
          occupied: false,
          state: 'empty'
        }))
        return versionSlots
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
      console.warn('[nodeTypes] 未知节点类型，返回空预设位:', nodeType)
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