/**
 * 节点端口对齐测试
 * 测试节点样式与端口位置的一致性
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createNodePortConfig } from '../../pages/marketing/tasks/utils/canvas/portConfigFactory.js'
import { getNodeConfig } from '../../utils/nodeTypes.js'

describe('节点端口对齐测试', () => {
  let mockGraph

  beforeEach(() => {
    mockGraph = {
      addNode: vi.fn(),
      getNodes: vi.fn(() => []),
      getCellById: vi.fn(),
      hasCell: vi.fn(() => false)
    }
  })

  describe('开始节点端口配置', () => {
    it('应该正确配置开始节点的输出端口', () => {
      const portConfig = createNodePortConfig('start')
      
      expect(portConfig).toBeDefined()
      expect(portConfig.groups).toBeDefined()
      expect(portConfig.groups.out).toBeDefined()
      expect(portConfig.groups.out.position).toBe('bottom')
      expect(portConfig.groups.out.attrs.circle.visibility).toBe('visible')
    })

    it('开始节点不应该有输入端口', () => {
      const portConfig = createNodePortConfig('start')
      
      expect(portConfig.groups.in).toBeUndefined()
    })

    it('开始节点样式应该与端口位置匹配', () => {
      const nodeConfig = getNodeConfig('start')
      const portConfig = createNodePortConfig('start')
      
      expect(nodeConfig).toBeDefined()
      expect(nodeConfig.color).toBeDefined()
      expect(portConfig.groups.out.position).toBe('bottom')
    })
  })

  describe('结束节点端口配置', () => {
    it('应该正确配置结束节点的输入端口', () => {
      const portConfig = createNodePortConfig('end')
      
      expect(portConfig).toBeDefined()
      expect(portConfig.groups).toBeDefined()
      expect(portConfig.groups.in).toBeDefined()
      expect(portConfig.groups.in.position).toBe('top')
      expect(portConfig.groups.in.attrs.circle.visibility).toBe('visible')
    })

    it('结束节点不应该有输出端口', () => {
      const portConfig = createNodePortConfig('end')
      
      expect(portConfig.groups.out).toBeUndefined()
    })
  })

  describe('分支节点端口配置', () => {
    const branchNodeTypes = ['audience-split', 'event-split', 'ab-test']

    branchNodeTypes.forEach(nodeType => {
      it(`${nodeType} 节点应该同时有输入和输出端口`, () => {
        const portConfig = createNodePortConfig(nodeType)
        
        expect(portConfig).toBeDefined()
        expect(portConfig.groups).toBeDefined()
        expect(portConfig.groups.in).toBeDefined()
        expect(portConfig.groups.out).toBeDefined()
        expect(portConfig.groups.in.position).toBe('top')
        expect(portConfig.groups.out.position).toBe('bottom')
        expect(portConfig.groups.in.attrs.circle.visibility).toBe('visible')
        expect(portConfig.groups.out.attrs.circle.visibility).toBe('visible')
      })
    })
  })

  describe('端口可见性测试', () => {
    const allNodeTypes = ['start', 'end', 'audience-split', 'event-split', 'ab-test', 'sms', 'email']

    allNodeTypes.forEach(nodeType => {
      it(`${nodeType} 节点的所有端口都应该可见`, () => {
        const portConfig = createNodePortConfig(nodeType)
        
        expect(portConfig).toBeDefined()
        expect(portConfig.groups).toBeDefined()

        // 检查输入端口可见性
        if (portConfig.groups.in) {
          expect(portConfig.groups.in.attrs.circle.visibility).toBe('visible')
        }

        // 检查输出端口可见性
        if (portConfig.groups.out) {
          expect(portConfig.groups.out.attrs.circle.visibility).toBe('visible')
        }
      })
    })
  })

  describe('端口位置一致性测试', () => {
    it('所有输入端口都应该在顶部', () => {
      const nodeTypes = ['end', 'audience-split', 'event-split', 'ab-test', 'sms', 'email']
      
      nodeTypes.forEach(nodeType => {
        const portConfig = createNodePortConfig(nodeType)
        if (portConfig.groups.in) {
          expect(portConfig.groups.in.position).toBe('top')
        }
      })
    })

    it('所有输出端口都应该在底部', () => {
      const nodeTypes = ['start', 'audience-split', 'event-split', 'ab-test', 'sms', 'email']
      
      nodeTypes.forEach(nodeType => {
        const portConfig = createNodePortConfig(nodeType)
        if (portConfig.groups.out) {
          expect(portConfig.groups.out.position).toBe('bottom')
        }
      })
    })
  })

  describe('Vue Shape 兼容性测试', () => {
    it('端口配置应该与 vue-shape 兼容', () => {
      const portConfig = createNodePortConfig('start')
      
      // vue-shape 需要的基本结构
      expect(portConfig).toHaveProperty('groups')
      expect(portConfig).toHaveProperty('items')
      
      // 端口组配置应该包含必要的属性
      if (portConfig.groups.out) {
        expect(portConfig.groups.out).toHaveProperty('position')
        expect(portConfig.groups.out).toHaveProperty('attrs')
        expect(portConfig.groups.out.attrs).toHaveProperty('circle')
      }
    })

    it('端口样式应该与节点样式协调', () => {
      const nodeTypes = ['start', 'end', 'audience-split']
      
      nodeTypes.forEach(nodeType => {
        const nodeConfig = getNodeConfig(nodeType)
        const portConfig = createNodePortConfig(nodeType)
        
        expect(nodeConfig).toBeDefined()
        expect(portConfig).toBeDefined()
        
        // 节点有颜色配置
        expect(nodeConfig.color).toBeDefined()
        
        // 端口有可见性配置
        Object.values(portConfig.groups || {}).forEach(group => {
          expect(group.attrs.circle.visibility).toBe('visible')
        })
      })
    })
  })
})