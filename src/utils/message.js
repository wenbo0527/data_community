/**
 * 统一消息提示工具
 * 基于 Arco Design Message 组件封装
 * 遵循企业后台设计原则
 */
import { Message } from '@arco-design/web-vue'

/**
 * 消息提示配置
 */
const defaultConfig = {
  duration: 3000,
  closable: true,
  showIcon: true
}

/**
 * 成功消息
 * @param {string} content - 消息内容
 * @param {object} config - 自定义配置
 */
export const success = (content, config = {}) => {
  return Message.success({
    content,
    ...defaultConfig,
    ...config
  })
}

/**
 * 错误消息
 * @param {string} content - 消息内容
 * @param {object} config - 自定义配置
 */
export const error = (content, config = {}) => {
  return Message.error({
    content,
    ...defaultConfig,
    duration: 4000, // 错误消息显示时间稍长
    ...config
  })
}

/**
 * 警告消息
 * @param {string} content - 消息内容
 * @param {object} config - 自定义配置
 */
export const warning = (content, config = {}) => {
  return Message.warning({
    content,
    ...defaultConfig,
    ...config
  })
}

/**
 * 信息消息
 * @param {string} content - 消息内容
 * @param {object} config - 自定义配置
 */
export const info = (content, config = {}) => {
  return Message.info({
    content,
    ...defaultConfig,
    ...config
  })
}

/**
 * 加载消息
 * @param {string} content - 消息内容
 * @param {object} config - 自定义配置
 */
export const loading = (content, config = {}) => {
  return Message.loading({
    content,
    duration: 0, // 加载消息不自动关闭
    ...config
  })
}

/**
 * 清除所有消息
 */
export const clear = () => {
  Message.clear()
}

/**
 * 默认导出 Message 实例（兼容性）
 */
export default {
  success,
  error,
  warning,
  info,
  loading,
  clear,
  Message // 原始 Message 组件
}

/**
 * 业务场景快捷方法
 */
export const businessMessage = {
  // 操作成功
  operationSuccess: (operation = '操作') => success(`${operation}成功`),
  
  // 操作失败
  operationError: (operation = '操作', reason = '') => {
    const content = reason ? `${operation}失败：${reason}` : `${operation}失败`
    return error(content)
  },
  
  // 保存成功
  saveSuccess: () => success('保存成功'),
  
  // 删除成功
  deleteSuccess: () => success('删除成功'),
  
  // 更新成功
  updateSuccess: () => success('更新成功'),
  
  // 网络错误
  networkError: () => error('网络请求失败，请检查网络连接'),
  
  // 权限不足
  permissionDenied: () => warning('权限不足，请联系管理员'),
  
  // 数据加载中
  dataLoading: () => loading('数据加载中...'),
  
  // 表单验证失败
  validationError: () => warning('请检查表单填写是否正确'),
  
  // 确认操作
  confirmOperation: (operation = '此操作') => warning(`${operation}不可撤销，请确认`)
}