/**
 * 自动布局管理 Composable
 * 提供自动排版和画布扩展功能
 */

import { ref, computed } from 'vue'
import AutoLayoutManager from '../utils/AutoLayoutManager.js'

export function useAutoLayout(getGraph) {
  const layoutManager = ref(null)
  const isLayouting = ref(false)

  // 初始化布局管理器
  const initLayoutManager = () => {
    const graph = getGraph()
    if (graph && !layoutManager.value) {
      layoutManager.value = new AutoLayoutManager(graph)
      console.log('[useAutoLayout] 自动布局管理器已初始化')
    }
    return layoutManager.value
  }

  // 获取布局管理器
  const getLayoutManager = () => {
    return layoutManager.value || initLayoutManager()
  }

  /**
   * 自动添加节点
   * @param {string} nodeType - 节点类型
   * @param {Object} parentNode - 父节点
   * @param {Object} options - 选项
   * @returns {Object} 新节点数据
   */
  const addNodeWithAutoLayout = (nodeType, parentNode, options = {}) => {
    const manager = getLayoutManager()
    if (!manager) {
      console.error('[useAutoLayout] 布局管理器未初始化')
      return null
    }

    try {
      const result = manager.addNodeWithAutoLayout(nodeType, parentNode, options)
      console.log('[useAutoLayout] 节点已自动添加:', result.nodeData.id)
      return result
    } catch (error) {
      console.error('[useAutoLayout] 添加节点失败:', error)
      return null
    }
  }

  /**
   * 重新布局所有节点
   * @param {Array} nodes - 节点数组
   * @param {Array} edges - 边数组
   */
  const relayoutAll = async (nodes, edges) => {
    const manager = getLayoutManager()
    if (!manager) {
      console.error('[useAutoLayout] 布局管理器未初始化')
      return
    }

    isLayouting.value = true
    try {
      manager.relayoutAll(nodes, edges)
      console.log('[useAutoLayout] 重新布局完成')
    } catch (error) {
      console.error('[useAutoLayout] 重新布局失败:', error)
    } finally {
      isLayouting.value = false
    }
  }

  /**
   * 获取节点的下一个可用位置
   * @param {Object} parentNode - 父节点
   * @param {number} branchCount - 分支数量
   * @returns {Array} 位置数组
   */
  const getNextAvailablePositions = (parentNode, branchCount = 1) => {
    const manager = getLayoutManager()
    if (!manager) {
      console.error('[useAutoLayout] 布局管理器未初始化')
      return []
    }

    return manager.getNextAvailablePositions(parentNode, branchCount)
  }

  /**
   * 扩展画布
   * @param {Object} position - 位置
   */
  const expandCanvas = (position) => {
    const manager = getLayoutManager()
    if (manager) {
      manager.expandCanvasIfNeeded(position)
    }
  }

  /**
   * 清理布局数据
   */
  const clearLayout = () => {
    if (layoutManager.value) {
      layoutManager.value.clear()
      layoutManager.value = null
      console.log('[useAutoLayout] 布局数据已清理')
    }
  }

  // 计算状态
  const isReady = computed(() => !!layoutManager.value)

  return {
    // 状态
    isLayouting,
    isReady,
    
    // 方法
    initLayoutManager,
    getLayoutManager,
    addNodeWithAutoLayout,
    relayoutAll,
    getNextAvailablePositions,
    expandCanvas,
    clearLayout
  }
}

export default useAutoLayout