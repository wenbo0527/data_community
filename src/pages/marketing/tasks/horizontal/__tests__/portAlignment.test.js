/**
 * 端口对齐测试用例
 * 验证端口位置与内容行的对齐精度
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { usePortValidation } from '../composables/usePortValidation.js'
import { createHorizontalPortConfig } from '../utils/portConfigFactoryHorizontal.js'

describe('端口对齐验证', () => {
  let portValidation
  
  beforeEach(() => {
    portValidation = usePortValidation()
  })
  
  describe('validatePortPositions', () => {
    it('应该正确验证输入端口位置', () => {
      const portConfig = {
        groups: {
          in: {
            items: [{
              id: 'in',
              args: { dy: 0 } // 节点中心
            }]
          }
        }
      }
      
      const contentLines = ['测试内容']
      const result = portValidation.validatePortPositions(portConfig, contentLines)
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.details.inputPort.isAligned).toBe(true)
    })
    
    it('应该检测输入端口位置偏差', () => {
      const portConfig = {
        groups: {
          in: {
            items: [{
              id: 'in',
              args: { dy: 10 } // 偏离中心
            }]
          }
        }
      }
      
      const contentLines = ['测试内容']
      const result = portValidation.validatePortPositions(portConfig, contentLines)
      
      expect(result.warnings.length).toBeGreaterThan(0)
      expect(result.warnings[0].type).toBe('input_port_alignment')
    })
    
    it('应该正确验证输出端口数量匹配', () => {
      const portConfig = {
        groups: {
          out: {
            items: [
              { id: 'out-0', args: { dy: 2 } },  // 修正为正确的期望值
              { id: 'out-1', args: { dy: 34 } }  // 修正为正确的期望值
            ]
          }
        }
      }
      
      const contentLines = ['第一行', '第二行']
      const result = portValidation.validatePortPositions(portConfig, contentLines)
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.details.outputPorts).toHaveLength(2)
    })
    
    it('应该检测输出端口数量不匹配', () => {
      const portConfig = {
        groups: {
          out: {
            items: [
              { id: 'out-0', args: { dy: -16 } }
            ]
          }
        }
      }
      
      const contentLines = ['第一行', '第二行', '第三行'] // 3行内容
      const result = portValidation.validatePortPositions(portConfig, contentLines)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].type).toBe('port_count_mismatch')
    })
    
    it('应该检测输出端口位置偏差（±2px误差）', () => {
      const portConfig = {
        groups: {
          out: {
            items: [
              { id: 'out-0', args: { dy: 4 } },  // 偏差2px (期望2，实际4)
              { id: 'out-1', args: { dy: 32 } } // 偏差2px (期望34，实际32)
            ]
          }
        }
      }
      
      const contentLines = ['第一行', '第二行']
      const result = portValidation.validatePortPositions(portConfig, contentLines, 2) // ±2px容忍
      
      expect(result.isValid).toBe(true) // 在误差范围内
      expect(result.warnings.length).toBeGreaterThan(0)
    })
    
    it('应该检测超出误差范围的端口位置偏差', () => {
      const portConfig = {
        groups: {
          out: {
            items: [
              { id: 'out-0', args: { dy: -13 } }, // 偏差3px，超出±2px
              { id: 'out-1', args: { dy: 19 } }  // 偏差3px，超出±2px
            ]
          }
        }
      }
      
      const contentLines = ['第一行', '第二行']
      const result = portValidation.validatePortPositions(portConfig, contentLines, 2) // ±2px容忍
      
      expect(result.isValid).toBe(false) // 超出误差范围
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors[0].type).toBe('output_port_alignment')
    })
  })
  
  describe('端口配置工厂集成测试', () => {
    it('应该创建符合规范的端口配置', () => {
      const contentLines = ['第一行', '第二行', '第三行']
      const headerHeight = 36
      const contentPadding = 12
      const rowHeight = 32
      const nodeHeight = headerHeight + contentPadding + contentLines.length * rowHeight + 12
      
      const verticalOffsets = contentLines.map((_, i) => 
        headerHeight + contentPadding + i * rowHeight + Math.floor(rowHeight / 2)
      )
      
      const portConfig = createHorizontalPortConfig(contentLines.length, {
        includeIn: true,
        verticalOffsets,
        nodeHeight,
        inVerticalOffset: headerHeight + contentPadding + (contentLines.length * rowHeight / 2),
        contentLines,
        enableValidation: true,
        tolerance: 2
      })
      
      expect(portConfig).toBeDefined()
      expect(portConfig.groups).toBeDefined()
      expect(portConfig.items).toBeDefined()
      expect(portConfig.items.length).toBe(contentLines.length + 1) // +1 for input port
      
      // 验证端口验证结果
      expect(portConfig._validation).toBeDefined()
      expect(portConfig._validation.isValid).toBe(true)
    })
    
    it('应该处理分流节点的端口配置', () => {
      const nodeTypes = ['crowd-split', 'event-split', 'ab-test']
      
      nodeTypes.forEach(nodeType => {
        const contentLines = ['命中：测试', '未命中']
        const headerHeight = 36
        const contentPadding = 12
        const rowHeight = 32
        const nodeHeight = headerHeight + contentPadding + contentLines.length * rowHeight + 12
        
        const verticalOffsets = contentLines.map((_, i) => 
          headerHeight + contentPadding + i * rowHeight + Math.floor(rowHeight / 2)
        )
        
        const portConfig = createHorizontalPortConfig(contentLines.length, {
          includeIn: true,
          verticalOffsets,
          nodeHeight,
          inVerticalOffset: headerHeight + contentPadding + (contentLines.length * rowHeight / 2),
          contentLines,
          enableValidation: true,
          tolerance: 2
        })
        
        expect(portConfig._validation.isValid).toBe(true)
        expect(portConfig.items.filter(item => item.group === 'out').length).toBe(contentLines.length)
      })
    })
  })
  
  describe('validatePortIds', () => {
    it('应该验证端口ID格式', () => {
      const ports = [
        { id: 'out-0' },
        { id: 'out-1' },
        { id: 'out-2' }
      ]
      
      const result = portValidation.validatePortIds(ports, 'out')
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
    
    it('应该检测错误的端口ID格式', () => {
      const ports = [
        { id: 'out-0' },
        { id: 'out-2' }, // 跳过了out-1
        { id: 'invalid-id' }
      ]
      
      const result = portValidation.validatePortIds(ports, 'out')
      
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })
  })
  
  describe('性能测试', () => {
    it('验证函数应该在合理时间内完成', () => {
      const startTime = performance.now()
      
      // 计算正确的dy值，基于getExpectedOutputPortDy函数
      const headerHeight = 36
      const contentPadding = 12
      const rowHeight = 32
      const totalLines = 10
      const nodeHeight = headerHeight + contentPadding + (totalLines * rowHeight) + 12
      
      const portConfig = {
        groups: {
          in: {
            items: [{ id: 'in', args: { dy: 0 } }]
          },
          out: {
            items: Array.from({ length: 10 }, (_, i) => {
              const verticalOffset = headerHeight + contentPadding + (i * rowHeight) + (rowHeight / 2)
              const expectedDy = verticalOffset - (nodeHeight / 2)
              return {
                id: `out-${i}`,
                args: { dy: expectedDy }
              }
            })
          }
        }
      }
      
      const contentLines = Array.from({ length: 10 }, (_, i) => `第${i + 1}行内容`)
      const result = portValidation.validatePortPositions(portConfig, contentLines)
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      expect(duration).toBeLessThan(10) // 应该在10ms内完成
      expect(result.isValid).toBe(true)
    })
  })
})