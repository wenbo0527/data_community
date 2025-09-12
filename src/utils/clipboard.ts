import { Message } from '@arco-design/web-vue'

/**
 * 复制文本到剪贴板
 * @param text 要复制的文本
 * @param successMessage 成功提示信息
 * @param errorMessage 错误提示信息
 * @returns Promise<boolean> 是否复制成功
 */
export const copyToClipboard = async (
  text: string,
  successMessage: string = '复制成功',
  errorMessage: string = '复制失败'
): Promise<boolean> => {
  try {
    // 优先使用现代的 Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      Message.success(successMessage)
      return true
    } else {
      // 降级到传统方法
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      
      const successful = document.execCommand('copy')
      document.body.removeChild(textArea)
      
      if (successful) {
        Message.success(successMessage)
        return true
      } else {
        throw new Error('execCommand failed')
      }
    }
  } catch (err) {
    console.error('复制到剪贴板失败:', err)
    Message.error(errorMessage)
    return false
  }
}

/**
 * 复制对象为JSON字符串到剪贴板
 * @param obj 要复制的对象
 * @param successMessage 成功提示信息
 * @param errorMessage 错误提示信息
 * @returns Promise<boolean> 是否复制成功
 */
export const copyObjectToClipboard = async (
  obj: any,
  successMessage: string = '复制成功',
  errorMessage: string = '复制失败'
): Promise<boolean> => {
  try {
    const jsonString = JSON.stringify(obj, null, 2)
    return await copyToClipboard(jsonString, successMessage, errorMessage)
  } catch (err) {
    console.error('对象序列化失败:', err)
    Message.error(errorMessage)
    return false
  }
}