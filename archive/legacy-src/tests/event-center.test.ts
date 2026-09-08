// 事件中心模块测试
import { describe, it, expect } from 'vitest'
import { mockEventAPI } from '../mock/event'

describe('事件中心模块', () => {
  describe('事件管理', () => {
    it('应该能获取事件列表', async () => {
      const events = await mockEventAPI.getEvents()
      expect(Array.isArray(events)).toBe(true)
      expect(events.length).toBeGreaterThan(0)
    })

    it('应该能创建事件', async () => {
      const newEvent = {
        eventName: '测试事件',
        eventType: '系统事件',
        eventSource: '系统',
        triggerCondition: '用户点击测试按钮',
        status: '下线',
        owner: '测试用户',
        description: '这是一个测试事件'
      }
      
      const result = await mockEventAPI.createEvent(newEvent)
      expect(result).toHaveProperty('id')
      expect(result.eventName).toBe('测试事件')
    })

    it('应该能更新事件', async () => {
      const updateData = {
        status: '上线',
        description: '更新后的描述'
      }
      
      const result = await mockEventAPI.updateEvent('EVT123456', updateData)
      expect(result.status).toBe('上线')
      expect(result.description).toBe('更新后的描述')
    })

    it('应该能删除事件', async () => {
      const result = await mockEventAPI.deleteEvent('EVT123456')
      expect(result).toEqual({ success: true })
    })
  })

  describe('样本统计', () => {
    it('应该能获取样本统计数据', async () => {
      const stats = await mockEventAPI.getSampleStats('EVT123456')
      expect(stats).toHaveProperty('eventId')
      expect(stats).toHaveProperty('totalClicks')
      expect(stats).toHaveProperty('conversionRate')
      expect(stats).toHaveProperty('avgResponseTime')
      expect(stats).toHaveProperty('errorRate')
      expect(stats).toHaveProperty('hourlyStats')
      expect(stats).toHaveProperty('dailyStats')
      expect(stats).toHaveProperty('weeklyStats')
      expect(stats).toHaveProperty('userPath')
      expect(stats).toHaveProperty('anomalies')
    })
  })

  describe('虚拟事件', () => {
    it('应该能获取虚拟事件列表', async () => {
      const realEvents = await mockEventAPI.getEvents()
      const virtualEvents = await mockEventAPI.getVirtualEvents(realEvents)
      expect(Array.isArray(virtualEvents)).toBe(true)
      expect(virtualEvents.length).toBeGreaterThan(0)
    })
  })

  describe('Kafka数据源', () => {
    it('应该能获取Kafka数据源', async () => {
      const datasources = await mockEventAPI.getKafkaDatasources()
      expect(Array.isArray(datasources)).toBe(true)
      expect(datasources.length).toBeGreaterThan(0)
    })
  })
})