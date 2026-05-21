/**
 * 复制到剪贴板工具
 */

/**
 * 复制文本到剪贴板
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
    // 降级方案
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    const success = document.execCommand('copy')
    document.body.removeChild(textarea)
    return success
  } catch (err) {
    console.error('复制失败:', err)
    return false
  }
}

/**
 * 复制 JSON 到剪贴板
 */
export async function copyJsonToClipboard(obj: any): Promise<boolean> {
  try {
    const jsonStr = JSON.stringify(obj, null, 2)
    return await copyToClipboard(jsonStr)
  } catch (err) {
    console.error('复制 JSON 失败:', err)
    return false
  }
}
