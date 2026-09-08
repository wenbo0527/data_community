/**
 * 连接预览配置常量
 * 集中管理所有预览相关的配置
 */

export const PREVIEW_CONFIG = {
  // 预览线样式
  LINE_STYLES: {
    DEFAULT: {
      stroke: '#1890ff',
      strokeWidth: 2,
      strokeDasharray: '5,5',
      opacity: 0.8
    },
    BRANCH: {
      stroke: '#52c41a',
      strokeWidth: 2,
      strokeDasharray: '3,3',
      opacity: 0.7
    },
    HOVER: {
      stroke: '#ff4d4f',
      strokeWidth: 3,
      strokeDasharray: '5,5',
      opacity: 0.9
    }
  },

  // 标签样式
  LABEL_STYLES: {
    DEFAULT: {
      fontSize: 12,
      fill: '#666',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#fff',
      padding: '2px 6px',
      borderRadius: '3px',
      border: '1px solid #d9d9d9'
    }
  },

  // 动画配置
  ANIMATION: {
    DURATION: 300,
    EASING: 'ease-in-out',
    DELAY: 50
  },

  // 布局配置
  LAYOUT: {
    PREVIEW_LINE_LENGTH: 100,
    BRANCH_SPACING: 30,
    LABEL_OFFSET: 10,
    MIN_DISTANCE: 50
  },

  // 节点类型配置
  NODE_TYPES: {
    BRANCH_NODES: ['audience-split', 'event-split', 'ab-test'],
    START_NODES: ['start'],
    ACTION_NODES: ['sms', 'ai-call', 'manual-call'],
    CONTROL_NODES: ['wait', 'end']
  },

  // 预览模式
  PREVIEW_MODES: {
    SINGLE: 'single',
    MULTIPLE: 'multiple',
    SMART: 'smart'
  },

  // 日志级别
  LOG_LEVELS: {
    ERROR: 'error',
    WARN: 'warn',
    INFO: 'info',
    DEBUG: 'debug'
  }
}

/**
 * 连接规则配置
 */
export const CONNECTION_RULES = {
  'start': {
    maxOutputs: 1,
    allowedTargets: ['audience-split', 'event-split', 'sms', 'ai-call', 'manual-call', 'wait'],
    requiresConfig: true
  },
  'audience-split': {
    maxOutputs: -1, // 无限制
    allowedTargets: ['sms', 'ai-call', 'manual-call', 'wait', 'end'],
    requiresConfig: true,
    branchMode: true
  },
  'event-split': {
    maxOutputs: -1,
    allowedTargets: ['sms', 'ai-call', 'manual-call', 'wait', 'end'],
    requiresConfig: true,
    branchMode: true
  },
  'ab-test': {
    maxOutputs: 2,
    allowedTargets: ['sms', 'ai-call', 'manual-call', 'wait', 'end'],
    requiresConfig: true,
    branchMode: true
  },
  'sms': {
    maxOutputs: 1,
    allowedTargets: ['audience-split', 'event-split', 'ab-test', 'wait', 'end'],
    requiresConfig: true
  },
  'ai-call': {
    maxOutputs: 1,
    allowedTargets: ['audience-split', 'event-split', 'ab-test', 'wait', 'end'],
    requiresConfig: true
  },
  'manual-call': {
    maxOutputs: 1,
    allowedTargets: ['audience-split', 'event-split', 'ab-test', 'wait', 'end'],
    requiresConfig: true
  },
  'wait': {
    maxOutputs: 1,
    allowedTargets: ['audience-split', 'event-split', 'ab-test', 'sms', 'ai-call', 'manual-call', 'end'],
    requiresConfig: true
  },
  'end': {
    maxOutputs: 0,
    allowedTargets: [],
    requiresConfig: false
  }
}

/**
 * 获取节点类型的预览配置
 */
export function getNodePreviewConfig(nodeType) {
  const isBranchNode = PREVIEW_CONFIG.NODE_TYPES.BRANCH_NODES.includes(nodeType)
  const isStartNode = PREVIEW_CONFIG.NODE_TYPES.START_NODES.includes(nodeType)
  
  return {
    isBranchNode,
    isStartNode,
    style: isBranchNode ? PREVIEW_CONFIG.LINE_STYLES.BRANCH : PREVIEW_CONFIG.LINE_STYLES.DEFAULT,
    mode: isBranchNode ? PREVIEW_CONFIG.PREVIEW_MODES.MULTIPLE : PREVIEW_CONFIG.PREVIEW_MODES.SINGLE,
    rules: CONNECTION_RULES[nodeType] || {}
  }
}