/**
 * PreviewLineManager 测试套件
 * 测试预览线管理器的DOM清理功能
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { PreviewLineManager } from '../../core/PreviewLineManager.js'
import { ResourceManager } from '../../core/ResourceManager.js'

describe('PreviewLineManager', () => {
  let previewLineManager
  let resourceManager
  let mockContainer
  let mockSvgElement

  beforeEach(() => {
    // 创建模拟DOM环境
    document.body.innerHTML = ''
    
    // 创建模拟容器
    mockContainer = document.createElement('div')
    mockContainer.id = 'test-container'
    document.body.appendChild(mockContainer)

    // 创建模拟SVG元素
    mockSvgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    mockSvgElement.id = 'test-svg'
    mockContainer.appendChild(mockSvgElement)

    // 创建资源管理器
    resourceManager = new ResourceManager()
    
    // 创建预览线管理器
    previewLineManager = new PreviewLineManager(resourceManager, mockContainer)
  })

  afterEach(() => {
    // 清理
    if (previewLineManager && !previewLineManager.isDestroyed()) {
      previewLineManager.destroy()
    }
    if (resourceManager && !resourceManager.isDestroyed()) {
      resourceManager.destroy()
    }
    document.body.innerHTML = ''
  })

  describe('构造函数和初始化', () => {
    it('应该正确创建PreviewLineManager实例', () => {
      expect(previewLineManager).toBeDefined()
      expect(previewLineManager.isDestroyed()).toBe(false)
      expect(previewLineManager.getContainer()).toBe(mockContainer)
    })

    it('应该在ResourceManager中注册自身', () => {
      expect(resourceManager.getResourceCount()).toBeGreaterThan(0)
    })

    it('应该处理无效的容器参数', () => {
      const invalidManager = new PreviewLineManager(resourceManager, null)
      expect(invalidManager.getContainer()).toBeNull()
    })
  })

  describe('预览线创建和管理', () => {
    it('应该正确创建预览线元素', () => {
      const lineId = previewLineManager.createPreviewLine({
        x1: 10, y1: 10, x2: 100, y2: 100,
        stroke: '#ff0000', strokeWidth: 2
      })

      expect(lineId).toBeDefined()
      expect(typeof lineId).toBe('string')
      expect(previewLineManager.hasPreviewLine(lineId)).toBe(true)
      expect(previewLineManager.getPreviewLineCount()).toBe(1)
    })

    it('应该支持不同的预览线样式', () => {
      const lineId1 = previewLineManager.createPreviewLine({
        x1: 0, y1: 0, x2: 50, y2: 50,
        stroke: '#00ff00', strokeWidth: 1, strokeDasharray: '5,5'
      })

      const lineId2 = previewLineManager.createPreviewLine({
        x1: 50, y1: 50, x2: 100, y2: 100,
        stroke: '#0000ff', strokeWidth: 3, opacity: 0.5
      })

      expect(previewLineManager.getPreviewLineCount()).toBe(2)
      expect(previewLineManager.hasPreviewLine(lineId1)).toBe(true)
      expect(previewLineManager.hasPreviewLine(lineId2)).toBe(true)
    })

    it('应该正确更新预览线位置', () => {
      const lineId = previewLineManager.createPreviewLine({
        x1: 10, y1: 10, x2: 100, y2: 100
      })

      const success = previewLineManager.updatePreviewLine(lineId, {
        x1: 20, y1: 20, x2: 120, y2: 120
      })

      expect(success).toBe(true)
    })

    it('应该处理更新不存在的预览线', () => {
      const success = previewLineManager.updatePreviewLine('non-existent', {
        x1: 0, y1: 0, x2: 100, y2: 100
      })

      expect(success).toBe(false)
    })
  })

  describe('预览线移除和清理', () => {
    it('应该正确移除单个预览线', () => {
      const lineId = previewLineManager.createPreviewLine({
        x1: 10, y1: 10, x2: 100, y2: 100
      })

      expect(previewLineManager.hasPreviewLine(lineId)).toBe(true)
      
      const success = previewLineManager.removePreviewLine(lineId)
      expect(success).toBe(true)
      expect(previewLineManager.hasPreviewLine(lineId)).toBe(false)
      expect(previewLineManager.getPreviewLineCount()).toBe(0)
    })

    it('应该正确清理所有预览线', () => {
      // 创建多个预览线
      previewLineManager.createPreviewLine({ x1: 0, y1: 0, x2: 50, y2: 50 })
      previewLineManager.createPreviewLine({ x1: 50, y1: 50, x2: 100, y2: 100 })
      previewLineManager.createPreviewLine({ x1: 100, y1: 0, x2: 0, y2: 100 })

      expect(previewLineManager.getPreviewLineCount()).toBe(3)

      const success = previewLineManager.clearAllPreviewLines()
      expect(success).toBe(true)
      expect(previewLineManager.getPreviewLineCount()).toBe(0)
    })

    it('应该处理移除不存在的预览线', () => {
      const success = previewLineManager.removePreviewLine('non-existent')
      expect(success).toBe(false)
    })
  })

  describe('DOM清理完整性', () => {
    it('应该确保DOM元素被完全移除', () => {
      const lineId = previewLineManager.createPreviewLine({
        x1: 10, y1: 10, x2: 100, y2: 100
      })

      // 验证DOM元素存在
      const element = mockContainer.querySelector(`[data-preview-line-id="${lineId}"]`)
      expect(element).toBeTruthy()

      // 移除预览线
      previewLineManager.removePreviewLine(lineId)

      // 验证DOM元素被移除
      const removedElement = mockContainer.querySelector(`[data-preview-line-id="${lineId}"]`)
      expect(removedElement).toBeNull()
    })

    it('应该清理所有相关的DOM节点', () => {
      // 创建多个预览线
      const lineIds = []
      for (let i = 0; i < 5; i++) {
        const lineId = previewLineManager.createPreviewLine({
          x1: i * 10, y1: i * 10, x2: (i + 1) * 50, y2: (i + 1) * 50
        })
        lineIds.push(lineId)
      }

      // 验证DOM元素存在
      expect(mockContainer.querySelectorAll('[data-preview-line-id]').length).toBe(5)

      // 清理所有预览线
      previewLineManager.clearAllPreviewLines()

      // 验证所有DOM元素被移除
      expect(mockContainer.querySelectorAll('[data-preview-line-id]').length).toBe(0)
    })

    it('应该清理孤立的DOM节点', () => {
      // 手动添加一些孤立的预览线元素
      const orphanElement1 = document.createElementNS('http://www.w3.org/2000/svg', 'line')
      orphanElement1.setAttribute('data-preview-line-id', 'orphan-1')
      mockSvgElement.appendChild(orphanElement1)

      const orphanElement2 = document.createElementNS('http://www.w3.org/2000/svg', 'line')
      orphanElement2.setAttribute('data-preview-line-id', 'orphan-2')
      mockSvgElement.appendChild(orphanElement2)

      expect(mockContainer.querySelectorAll('[data-preview-line-id]').length).toBe(2)

      // 清理孤立节点
      const cleanedCount = previewLineManager.cleanupOrphanedElements()
      expect(cleanedCount).toBe(2)
      expect(mockContainer.querySelectorAll('[data-preview-line-id]').length).toBe(0)
    })
  })

  describe('内存泄漏防护', () => {
    it('应该在destroy时清理所有预览线和DOM元素', () => {
      // 创建多个预览线
      previewLineManager.createPreviewLine({ x1: 0, y1: 0, x2: 50, y2: 50 })
      previewLineManager.createPreviewLine({ x1: 50, y1: 50, x2: 100, y2: 100 })

      expect(previewLineManager.getPreviewLineCount()).toBe(2)
      expect(mockContainer.querySelectorAll('[data-preview-line-id]').length).toBe(2)

      // 销毁管理器
      previewLineManager.destroy()

      expect(previewLineManager.isDestroyed()).toBe(true)
      expect(previewLineManager.getPreviewLineCount()).toBe(0)
      expect(mockContainer.querySelectorAll('[data-preview-line-id]').length).toBe(0)
    })

    it('应该防止在销毁后创建新的预览线', () => {
      previewLineManager.destroy()

      const lineId = previewLineManager.createPreviewLine({
        x1: 10, y1: 10, x2: 100, y2: 100
      })

      expect(lineId).toBeNull()
      expect(previewLineManager.getPreviewLineCount()).toBe(0)
    })

    it('应该防止在销毁后操作预览线', () => {
      const lineId = previewLineManager.createPreviewLine({
        x1: 10, y1: 10, x2: 100, y2: 100
      })

      previewLineManager.destroy()

      const updateSuccess = previewLineManager.updatePreviewLine(lineId, {
        x1: 20, y1: 20, x2: 120, y2: 120
      })
      const removeSuccess = previewLineManager.removePreviewLine(lineId)

      expect(updateSuccess).toBe(false)
      expect(removeSuccess).toBe(false)
    })
  })

  describe('错误处理', () => {
    it('应该处理无效的预览线配置', () => {
      const lineId1 = previewLineManager.createPreviewLine(null)
      const lineId2 = previewLineManager.createPreviewLine({})
      const lineId3 = previewLineManager.createPreviewLine({ x1: 'invalid' })

      expect(lineId1).toBeNull()
      expect(lineId2).toBeNull()
      expect(lineId3).toBeNull()
      expect(previewLineManager.getPreviewLineCount()).toBe(0)
    })

    it('应该处理DOM操作异常', () => {
      // 模拟DOM操作异常
      const originalAppendChild = mockSvgElement.appendChild
      mockSvgElement.appendChild = vi.fn(() => {
        throw new Error('DOM operation failed')
      })

      const lineId = previewLineManager.createPreviewLine({
        x1: 10, y1: 10, x2: 100, y2: 100
      })

      expect(lineId).toBeNull()
      expect(previewLineManager.getPreviewLineCount()).toBe(0)

      // 恢复原始方法
      mockSvgElement.appendChild = originalAppendChild
    })

    it('应该处理容器不存在的情况', () => {
      const managerWithoutContainer = new PreviewLineManager(resourceManager, null)
      
      const lineId = managerWithoutContainer.createPreviewLine({
        x1: 10, y1: 10, x2: 100, y2: 100
      })

      expect(lineId).toBeNull()
      expect(managerWithoutContainer.getPreviewLineCount()).toBe(0)
    })
  })

  describe('查询和统计', () => {
    it('应该正确获取预览线数量', () => {
      expect(previewLineManager.getPreviewLineCount()).toBe(0)

      previewLineManager.createPreviewLine({ x1: 0, y1: 0, x2: 50, y2: 50 })
      expect(previewLineManager.getPreviewLineCount()).toBe(1)

      previewLineManager.createPreviewLine({ x1: 50, y1: 50, x2: 100, y2: 100 })
      expect(previewLineManager.getPreviewLineCount()).toBe(2)
    })

    it('应该正确获取所有预览线ID', () => {
      const lineId1 = previewLineManager.createPreviewLine({ x1: 0, y1: 0, x2: 50, y2: 50 })
      const lineId2 = previewLineManager.createPreviewLine({ x1: 50, y1: 50, x2: 100, y2: 100 })

      const allIds = previewLineManager.getAllPreviewLineIds()
      expect(allIds).toContain(lineId1)
      expect(allIds).toContain(lineId2)
      expect(allIds.length).toBe(2)
    })

    it('应该提供详细的统计信息', () => {
      previewLineManager.createPreviewLine({ x1: 0, y1: 0, x2: 50, y2: 50 })
      previewLineManager.createPreviewLine({ x1: 50, y1: 50, x2: 100, y2: 100 })

      const stats = previewLineManager.getStats()
      expect(stats.totalLines).toBe(2)
      expect(stats.isDestroyed).toBe(false)
      expect(stats.hasContainer).toBe(true)
      expect(typeof stats.domElementCount).toBe('number')
    })

    it('应该在销毁后返回正确的统计信息', () => {
      previewLineManager.createPreviewLine({ x1: 0, y1: 0, x2: 50, y2: 50 })
      previewLineManager.destroy()

      const stats = previewLineManager.getStats()
      expect(stats.totalLines).toBe(0)
      expect(stats.isDestroyed).toBe(true)
    })
  })

  describe('性能和内存监控', () => {
    it('应该监控内存使用情况', () => {
      // 创建大量预览线
      for (let i = 0; i < 100; i++) {
        previewLineManager.createPreviewLine({
          x1: i, y1: i, x2: i + 50, y2: i + 50
        })
      }

      const stats = previewLineManager.getStats()
      expect(stats.totalLines).toBe(100)
      expect(stats.domElementCount).toBe(100)

      // 清理并验证内存释放
      previewLineManager.clearAllPreviewLines()
      
      const cleanStats = previewLineManager.getStats()
      expect(cleanStats.totalLines).toBe(0)
      expect(cleanStats.domElementCount).toBe(0)
    })

    it('应该处理大量预览线的创建和销毁', () => {
      const startTime = performance.now()
      
      // 创建大量预览线
      const lineIds = []
      for (let i = 0; i < 1000; i++) {
        const lineId = previewLineManager.createPreviewLine({
          x1: Math.random() * 1000,
          y1: Math.random() * 1000,
          x2: Math.random() * 1000,
          y2: Math.random() * 1000
        })
        lineIds.push(lineId)
      }

      // 批量移除
      for (const lineId of lineIds) {
        previewLineManager.removePreviewLine(lineId)
      }

      const endTime = performance.now()
      const duration = endTime - startTime

      expect(previewLineManager.getPreviewLineCount()).toBe(0)
      expect(duration).toBeLessThan(5000) // 应该在5秒内完成
    })
  })
})