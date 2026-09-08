/**
 * 连接配置工厂测试
 */
import { describe, it, expect, beforeEach } from 'vitest'
import {
  createConnectionConfig,
  createLabeledConnectionConfig,
  createBranchConnectionConfig,
  validateConnectionConfig
} from '../utils/connectionConfigFactory.js'

describe('ConnectionConfigFactory', () => {
  describe('createConnectionConfig', () => {
    it('应该创建基础连接配置', () => {
      const source = { cell: 'node1', port: 'out' }
      const target = { cell: 'node2', port: 'in' }
      const config = createConnectionConfig(source, target)
      
      expect(config).toHaveProperty('connector')
      expect(config).toHaveProperty('router')
      expect(config).toHaveProperty('attrs')
      expect(config.connectionPoint).toHaveProperty('name')
    })

    it('应该支持自定义配置', () => {
      const source = { cell: 'node1', port: 'out' }
      const target = { cell: 'node2', port: 'in' }
      const customConfig = {
        connector: { name: 'smooth' },
        router: { name: 'manhattan' }
      }
      
      const config = createConnectionConfig(source, target, customConfig)
      
      expect(config.connector.name).toBe('smooth')
      expect(config.router.name).toBe('manhattan')
    })
  })

  describe('createLabeledConnectionConfig', () => {
    it('应该创建带标签的连接配置', () => {
      const source = { cell: 'node1', port: 'out' }
      const target = { cell: 'node2', port: 'in' }
      const config = createLabeledConnectionConfig(source, target, '测试标签')
      
      expect(config).toHaveProperty('labels')
      expect(config.labels).toHaveLength(1)
      expect(config.labels[0].attrs.labelText.text).toBe('测试标签')
    })

    it('应该支持自定义标签样式', () => {
      const source = { cell: 'node1', port: 'out' }
      const target = { cell: 'node2', port: 'in' }
      const labelStyle = {
        fill: '#ff0000',
        fontSize: 16
      }
      
      const config = createLabeledConnectionConfig(source, target, '测试', labelStyle)
      
      expect(config.labels[0].attrs.labelText.fill).toBe('#ff0000')
      expect(config.labels[0].attrs.labelText.fontSize).toBe(16)
    })
  })

  describe('createBranchConnectionConfig', () => {
    it('应该创建分支连接配置', () => {
      const source = { cell: 'node1', port: 'out' }
      const target = { cell: 'node2', port: 'in' }
      const branchId = 'branch1'
      const branchLabel = '分支1'
      
      const config = createBranchConnectionConfig(source, target, branchId, branchLabel)
      
      expect(config.source.port).toBe('out')
      expect(config.labels).toHaveLength(1)
      expect(config.labels[0].attrs.labelText.text).toBe('分支1')
    })

    it('应该处理默认端口', () => {
      const source = { cell: 'node1', port: 'out' }
      const target = { cell: 'node2', port: 'in' }
      const branchId = 'default'
      
      const config = createBranchConnectionConfig(source, target, branchId)
      
      expect(config.source.port).toBe('out')
      expect(config.branchId).toBe('default')
    })
  })

  describe('validateConnectionConfig', () => {
    it('应该验证有效配置', () => {
      const source = { cell: 'node1', port: 'out' }
      const target = { cell: 'node2', port: 'in' }
      const validConfig = createConnectionConfig(source, target)
      const result = validateConnectionConfig(validConfig)
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('应该检测无效配置', () => {
      const invalidConfig = {}
      const result = validateConnectionConfig(invalidConfig)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('应该检测无效的连接器类型', () => {
      const source = { cell: 'node1', port: 'out' }
      const target = { cell: 'node2', port: 'in' }
      const config = createConnectionConfig(source, target, { 
        connector: { name: 'invalid' } 
      })
      const result = validateConnectionConfig(config)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]).toContain('无效的连接器类型')
    })
  })
})