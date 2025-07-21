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
      const config = createConnectionConfig()
      
      expect(config).toHaveProperty('connector')
      expect(config).toHaveProperty('router')
      expect(config).toHaveProperty('attrs')
      expect(config.connectionPoint).toBe('anchor')
    })

    it('应该支持自定义配置', () => {
      const customConfig = {
        connector: 'smooth',
        router: 'manhattan'
      }
      
      const config = createConnectionConfig(customConfig)
      
      expect(config.connector).toBe('smooth')
      expect(config.router).toBe('manhattan')
    })
  })

  describe('createLabeledConnectionConfig', () => {
    it('应该创建带标签的连接配置', () => {
      const config = createLabeledConnectionConfig('测试标签')
      
      expect(config).toHaveProperty('labels')
      expect(config.labels).toHaveLength(1)
      expect(config.labels[0].attrs.text.text).toBe('测试标签')
    })

    it('应该支持自定义标签样式', () => {
      const labelStyle = {
        fill: '#ff0000',
        fontSize: 16
      }
      
      const config = createLabeledConnectionConfig('测试', labelStyle)
      
      expect(config.labels[0].attrs.text.fill).toBe('#ff0000')
      expect(config.labels[0].attrs.text.fontSize).toBe(16)
    })
  })

  describe('createBranchConnectionConfig', () => {
    it('应该创建分支连接配置', () => {
      const params = {
        sourcePort: 'out-branch1',
        branchId: 'branch1',
        branchLabel: '分支1'
      }
      
      const config = createBranchConnectionConfig(params)
      
      expect(config.sourcePort).toBe('out-branch1')
      expect(config.labels).toHaveLength(1)
      expect(config.labels[0].attrs.text.text).toBe('分支1')
    })

    it('应该处理默认端口', () => {
      const params = {
        branchId: 'default'
      }
      
      const config = createBranchConnectionConfig(params)
      
      expect(config.sourcePort).toBe('out')
    })
  })

  describe('validateConnectionConfig', () => {
    it('应该验证有效配置', () => {
      const validConfig = createConnectionConfig()
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
      const config = createConnectionConfig({ connector: 'invalid' })
      const result = validateConnectionConfig(config)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.some(error => error.includes('connector'))).toBe(true)
    })
  })
})