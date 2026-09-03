/**
 * 统一消息提示工具
 * 基于 Arco Design Message 组件封装
 */
import { Message } from '@arco-design/web-vue'

const defaultConfig = {
  duration: 3000,
  closable: true,
  showIcon: true
}

export const success = (content: string, config: Record<string, any> = {}) => {
  return Message.success({
    content,
    ...defaultConfig,
    ...config
  })
}

export const error = (content: string, config: Record<string, any> = {}) => {
  return Message.error({
    content,
    ...defaultConfig,
    duration: 4000,
    ...config
  })
}

export const warning = (content: string, config: Record<string, any> = {}) => {
  return Message.warning({
    content,
    ...defaultConfig,
    ...config
  })
}

export const info = (content: string, config: Record<string, any> = {}) => {
  return Message.info({
    content,
    ...defaultConfig,
    ...config
  })
}

export const loading = (content: string, config: Record<string, any> = {}) => {
  return Message.loading({
    content,
    duration: 0,
    ...config
  })
}

export const clear = () => {
  Message.clear()
}

export default {
  success,
  error,
  warning,
  info,
  loading,
  clear,
  Message
}

export const businessMessage = {
  operationSuccess: (operation = '操作') => success(`${operation}成功`),

  operationError: (operation = '操作', reason = '') => {
    const content = reason ? `${operation}失败：${reason}` : `${operation}失败`
    return error(content)
  },

  saveSuccess: () => success('保存成功'),
  deleteSuccess: () => success('删除成功'),
  updateSuccess: () => success('更新成功'),
  networkError: () => error('网络请求失败，请检查网络连接'),
  permissionDenied: () => warning('权限不足，请联系管理员'),
  dataLoading: () => loading('数据加载中...'),
  validationError: () => warning('请检查表单填写是否正确'),
  confirmOperation: (operation = '此操作') => warning(`${operation}不可撤销，请确认`)
}
