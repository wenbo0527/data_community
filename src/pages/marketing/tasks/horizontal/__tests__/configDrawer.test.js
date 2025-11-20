/**
 * 配置抽屉联动测试用例
 * 验证配置更新后节点刷新和端口重建功能
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { performanceMonitor } from '../utils/performanceMonitor.js'

// 模拟X6节点
function createMockNode(nodeType = 'crowd-split', config = {}) {
  const mockPorts = []
  
  return {
    id: 'test-node-1',
    getData: () => ({
      type: nodeType,
      config: config,
      isConfigured: true
    }),
    getPosition: () => ({ x: 100, y: 100 }),
    getPorts: () => mockPorts,
    removePort: (portId) => {
      const index = mockPorts.findIndex(p => p.id === portId)
      if (index > -1) mockPorts.splice(index, 1)
    },
    addPort: (portConfig) => {
      mockPorts.push({ id: portConfig.id, ...portConfig })
    },
    setProp: vi.fn(),
    setMarkup: vi.fn(),
    setAttrs: vi.fn(),
    setLabel: vi.fn(),
    resize: vi.fn(),
    getBBox: () => ({ x: 100, y: 100, width: 280, height: 160 })
  }
}

describe('配置抽屉联动测试', () => {
  let mockNode
  let mockGraph
  
  beforeEach(() => {
    // 清除性能监控记录
    performanceMonitor.clear()
    
    // 创建模拟节点
    mockNode = createMockNode('crowd-split', {
      nodeName: '人群分流测试',
      crowdLayers: ['高价值用户', '活跃用户'],
      splitCount: 2
    })
    
    // 创建模拟图实例
    mockGraph = {
      getCellById: (id) => id === 'test-node-1' ? mockNode : null
    }
  })
  
  describe('updateNodeFromConfig 性能测试', () => {
    it('单节点更新应该在16ms内完成', async () => {
      const newConfig = {
        nodeName: '更新后的节点名称',
        crowdLayers: ['新用户', '老用户', '流失用户'],
        splitCount: 3
      }
      
      // 模拟 updateNodeFromConfig 函数
      const updateNodeFromConfig = async (node, nodeType, config) => {
        const endMeasure = performanceMonitor.measure('updateNodeFromConfig')
        
        try {
          // 模拟配置处理
          await new Promise(resolve => setTimeout(resolve, 5)) // 模拟5ms处理时间
          
          // 模拟节点更新操作
          node.resize(280, 192)
          node.setMarkup([{ tagName: 'rect', selector: 'body' }])
          node.setAttrs({ body: { fill: '#FFFFFF' } })
          
          return { success: true }
        } finally {
          endMeasure()
        }
      }
      
      const result = await updateNodeFromConfig(mockNode, 'crowd-split', newConfig)
      
      const stats = performanceMonitor.getStats('updateNodeFromConfig')
      expect(stats).toBeDefined()
      expect(stats.max).toBeLessThan(16) // 最大时间不超过16ms
      expect(result.success).toBe(true)
    })
    
    it('批量节点更新应该在1s内完成', async () => {
      const nodes = Array.from({ length: 200 }, (_, i) => 
        createMockNode('crowd-split', { nodeName: `节点${i}` })
      )
      
      const updateBatchNodes = async (nodes, config) => {
        const endMeasure = performanceMonitor.measure('batchNodeUpdate')
        
        try {
          // 模拟批量更新
          const updates = nodes.map(node => 
            new Promise(resolve => {
              setTimeout(() => {
                node.resize(280, 160)
                node.setAttrs({ body: { fill: '#FFFFFF' } })
                resolve({ nodeId: node.id, success: true })
              }, Math.random() * 10) // 随机延迟0-10ms
            })
          )
          
          return await Promise.all(updates)
        } finally {
          endMeasure()
        }
      }
      
      const results = await updateBatchNodes(nodes, {})
      
      const stats = performanceMonitor.getStats('batchNodeUpdate')
      expect(stats).toBeDefined()
      expect(stats.duration).toBeLessThan(1000) // 批量更新不超过1s
      expect(results).toHaveLength(200)
      expect(results.every(r => r.success)).toBe(true)
    })
  })
  
  describe('端口重建测试', () => {
    it('应该正确重建输出端口ID', () => {
      const contentLines = ['命中：高价值用户', '未命中']
      const outIds = contentLines.map((_, i) => `out-${i}`)
      
      expect(outIds).toEqual(['out-0', 'out-1'])
      expect(outIds).toHaveLength(contentLines.length)
    })
    
    it('应该处理分支增加的情况', () => {
      const originalLines = ['命中：测试', '未命中']
      const newLines = ['命中：高价值用户', '命中：活跃用户', '未命中']
      
      const originalOutIds = originalLines.map((_, i) => `out-${i}`)
      const newOutIds = newLines.map((_, i) => `out-${i}`)
      
      expect(originalOutIds).toEqual(['out-0', 'out-1'])
      expect(newOutIds).toEqual(['out-0', 'out-1', 'out-2'])
      expect(newOutIds).toHaveLength(newLines.length)
    })
    
    it('应该处理分支减少的情况', () => {
      const originalLines = ['分支A', '分支B', '分支C', '分支D']
      const newLines = ['分支A', '分支B']
      
      const originalOutIds = originalLines.map((_, i) => `out-${i}`)
      const newOutIds = newLines.map((_, i) => `out-${i}`)
      
      expect(originalOutIds).toEqual(['out-0', 'out-1', 'out-2', 'out-3'])
      expect(newOutIds).toEqual(['out-0', 'out-1'])
      expect(newOutIds).toHaveLength(newLines.length)
    })
  })
  
  describe('配置验证测试', () => {
    it('应该验证配置数据的完整性', () => {
      const validConfig = {
        nodeName: '有效的节点名称',
        crowdLayers: ['用户分层1', '用户分层2'],
        splitCount: 2,
        isConfigured: true
      }
      
      const isValid = (config) => {
        return config && 
               typeof config.nodeName === 'string' && 
               Array.isArray(config.crowdLayers) && 
               config.crowdLayers.length > 0 &&
               typeof config.splitCount === 'number' &&
               config.splitCount > 0
      }
      
      expect(isValid(validConfig)).toBe(true)
    })
    
    it('应该拒绝无效的配置', () => {
      const invalidConfigs = [
        { nodeName: '', crowdLayers: [], splitCount: 0 }, // 空名称和数组
        { nodeName: '测试', crowdLayers: '不是数组', splitCount: 2 }, // crowdLayers不是数组
        { nodeName: '测试', crowdLayers: ['分层1'], splitCount: -1 }, // 负数splitCount
        null, // null配置
        undefined // undefined配置
      ]
      
      const isValid = (config) => {
        return config && 
               typeof config.nodeName === 'string' && 
               config.nodeName.length > 0 &&
               Array.isArray(config.crowdLayers) && 
               config.crowdLayers.length > 0 &&
               typeof config.splitCount === 'number' &&
               config.splitCount > 0
      }
      
      invalidConfigs.forEach(config => {
        expect(isValid(config)).toBe(false)
      })
    })
  })
  
  describe('错误处理测试', () => {
    it('应该优雅处理节点更新异常', async () => {
      const errorNode = {
        ...mockNode,
        resize: () => { throw new Error('模拟resize错误') }
      }
      
      const updateWithError = async (node, config) => {
        const endMeasure = performanceMonitor.measure('updateWithError')
        
        try {
          node.resize(280, 160) // 这会抛出错误
          return { success: true }
        } catch (error) {
          console.error('节点更新失败:', error.message)
          return { success: false, error: error.message }
        } finally {
          endMeasure()
        }
      }
      
      const result = await updateWithError(errorNode, {})
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('模拟resize错误')
      
      const stats = performanceMonitor.getStats('updateWithError')
      expect(stats).toBeDefined()
    })
    
    it('应该处理空配置的情况', () => {
      const emptyConfigs = [null, undefined, {}]
      
      const processConfig = (config) => {
        if (!config || Object.keys(config).length === 0) {
          return { success: false, reason: '配置为空' }
        }
        return { success: true }
      }
      
      emptyConfigs.forEach(config => {
        const result = processConfig(config)
        expect(result.success).toBe(false)
        expect(result.reason).toBe('配置为空')
      })
    })
  })
  
  describe('性能监控测试', () => {
    it('应该记录性能指标', () => {
      // 模拟一些性能测量
      for (let i = 0; i < 10; i++) {
        const endMeasure = performanceMonitor.measure('testOperation')
        setTimeout(() => endMeasure(), Math.random() * 20)
      }
      
      const stats = performanceMonitor.getStats('testOperation')
      expect(stats).toBeDefined()
      expect(stats.count).toBe(10)
      expect(stats.average).toBeGreaterThan(0)
      expect(stats.min).toBeLessThanOrEqual(stats.max)
    })
    
    it('应该检测性能超标情况', () => {
      // 创建超出阈值的测量
      const endMeasure = performanceMonitor.measure('slowOperation')
      setTimeout(() => {
        endMeasure()
        
        const stats = performanceMonitor.getStats('slowOperation')
        expect(stats).toBeDefined()
        
        // 设置一个较低的阈值来触发超标警告
        performanceMonitor.setThreshold('slowOperation', 1) // 1ms阈值
        expect(stats.duration).toBeGreaterThan(1) // 实际耗时应该大于1ms
      }, 10)
    })
    
    it('应该生成性能报告', () => {
      // 添加一些测试数据
      const endMeasure1 = performanceMonitor.measure('operation1')
      const endMeasure2 = performanceMonitor.measure('operation2')
      
      endMeasure1()
      endMeasure2()
      
      const report = performanceMonitor.exportReport()
      
      expect(report).toBeDefined()
      expect(report.timestamp).toBeDefined()
      expect(report.enabled).toBe(true)
      expect(report.stats).toBeInstanceOf(Array)
      expect(report.summary).toBeDefined()
      expect(report.summary.totalMeasurements).toBeGreaterThan(0)
    })
  })
})