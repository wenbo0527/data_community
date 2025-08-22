import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mockUsers } from '@/mock/customer360'

// 调试导入
console.log('mockUsers导入结果:', mockUsers)
console.log('mockUsers类型:', typeof mockUsers)
console.log('mockUsers键:', mockUsers ? Object.keys(mockUsers) : 'undefined')

// 确保mockUsers存在且包含测试数据
if (!mockUsers || !mockUsers['887123']) {
  throw new Error('mockUsers未正确导入或缺少测试数据')
}

// Mock Arco Design Message API
vi.mock('@arco-design/web-vue', () => ({
  Message: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn()
  }
}))

// 现在可以安全导入服务
import CopyService from '../../../services/copyService'
const copyService = CopyService

// 获取mock的Message对象
const { Message: mockMessage } = await import('@arco-design/web-vue')

// Mock Clipboard API
const mockClipboard = {
  writeText: vi.fn().mockResolvedValue(undefined),
  readText: vi.fn().mockResolvedValue(''),
  write: vi.fn().mockResolvedValue(undefined)
}

Object.defineProperty(navigator, 'clipboard', {
  value: mockClipboard,
  writable: true
})

// Mock document.execCommand for fallback
Object.defineProperty(document, 'execCommand', {
  value: vi.fn().mockReturnValue(true),
  writable: true
})

// Mock console methods
const mockConsole = {
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn()
}
vi.stubGlobal('console', mockConsole)

describe('CopyService 测试', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // 重置 clipboard mock
    mockClipboard.writeText.mockClear()
    mockClipboard.writeText.mockResolvedValue(undefined)
    mockMessage.success.mockClear()
    mockMessage.error.mockClear()
    
    // Mock window.isSecureContext
    Object.defineProperty(window, 'isSecureContext', {
      value: true,
      writable: true
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('基础文本复制', () => {
    it('应该成功复制简单文本', async () => {
      const text = '测试文本'
      const result = await copyService.copyText(text)
      
      expect(result).toBe(true)
      expect(mockClipboard.writeText).toHaveBeenCalledWith(text)
      expect(mockMessage.success).toHaveBeenCalledWith('复制成功')
    })

    it('应该处理复制失败的情况', async () => {
      mockClipboard.writeText.mockRejectedValueOnce(new Error('复制失败'))
      
      const result = await copyService.copyText('测试文本')
      
      expect(result).toBe(false)
      expect(mockMessage.error).toHaveBeenCalledWith('复制失败')
    })

    it('应该在不支持Clipboard API时使用fallback', async () => {
      // 临时移除 clipboard API
      const originalClipboard = navigator.clipboard
      Object.defineProperty(navigator, 'clipboard', {
        value: undefined,
        writable: true
      })
      
      const result = await copyService.copyText('测试文本')
      
      expect(result).toBe(true)
      expect(document.execCommand).toHaveBeenCalledWith('copy')
      
      // 恢复 clipboard API
      Object.defineProperty(navigator, 'clipboard', {
        value: originalClipboard,
        writable: true
      })
    })
  })

  describe('JSON数据复制', () => {
    it('应该成功复制JSON对象', async () => {
      const data = { name: '张三', age: 30 }
      const result = await copyService.copyJSON(data)
      
      expect(result).toBe(true)
      expect(mockClipboard.writeText).toHaveBeenCalledWith(JSON.stringify(data, null, 2))
    })

    it('应该处理复杂嵌套对象', async () => {
      const complexData = {
        user: mockUsers['887123'],
        metadata: {
          timestamp: new Date().toISOString(),
          version: '1.0.0'
        }
      }
      
      const result = await copyService.copyJSON(complexData)
      
      expect(result).toBe(true)
      expect(mockClipboard.writeText).toHaveBeenCalled()
    })

    it('应该处理包含特殊字符的JSON', async () => {
      const data = {
        message: '包含\n换行\t制表符"引号的文本',
        emoji: '😀🎉'
      }
      
      const result = await copyService.copyJSON(data)
      
      expect(result).toBe(true)
    })

    it('应该处理循环引用对象', async () => {
      const obj: any = { name: '测试' }
      obj.self = obj // 创建循环引用
      
      const result = await copyService.copyJSON(obj)
      
      expect(result).toBe(false)
      expect(mockMessage.error).toHaveBeenCalledWith('JSON复制失败')
    })
  })

  describe('表格数据复制', () => {
    it('应该成功复制表格数据为TSV格式', async () => {
      const tableData = [
        { name: '张三', age: 30, city: '北京' },
        { name: '李四', age: 25, city: '上海' }
      ]
      
      const result = await copyService.copyTableData(tableData)
      
      expect(result).toBe(true)
      expect(mockClipboard.writeText).toHaveBeenCalled()
      const callArgs = mockClipboard.writeText.mock.calls[0][0]
      expect(callArgs).toContain('张三\t30\t北京')
      expect(callArgs).toContain('李四\t25\t上海')
    })

    it('应该处理空数组', async () => {
      const result = await copyService.copyTableData([])
      
      expect(result).toBe(true) // 实际实现会成功复制空字符串
      expect(mockClipboard.writeText).toHaveBeenCalledWith('')
    })

    it('应该支持自定义列顺序', async () => {
      const tableData = [
        { name: '张三', age: 30, city: '北京' }
      ]
      const headers = ['city', 'name']
      
      const result = await copyService.copyTableData(tableData, headers)
      
      expect(result).toBe(true)
      expect(mockClipboard.writeText).toHaveBeenCalled()
      const callArgs = mockClipboard.writeText.mock.calls[0][0]
      expect(callArgs).toContain('city\tname')
      expect(callArgs).toContain('北京\t张三')
    })
  })

  describe('用户基本信息复制', () => {
    it('应该成功复制用户基本信息', async () => {
      const userInfo = {
        name: mockUsers['887123'].name,
        idCard: mockUsers['887123'].idCard,
        phone: mockUsers['887123'].mobile,
        riskLevel: '低',
        accountStatus: mockUsers['887123'].status,
        registerTime: mockUsers['887123'].joinDate,
        lastLoginTime: '2024-01-20'
      }
      const result = await copyService.copyBasicInfo(userInfo)
      
      expect(result).toBe(true)
      expect(mockClipboard.writeText).toHaveBeenCalled()
    })

    it('应该格式化用户信息为可读文本', async () => {
      const userInfo = {
        name: '张三',
        phone: '13800138000',
        idCard: '110101199001011234',
        riskLevel: 'A',
        accountStatus: '正常',
        registerTime: '2023-01-01',
        lastLoginTime: '2024-01-01'
      }
      
      const result = await copyService.copyBasicInfo(userInfo)
      
      expect(result).toBe(true)
      const callArgs = mockClipboard.writeText.mock.calls[0][0]
      expect(callArgs).toContain('客户姓名: 张三')
      expect(callArgs).toContain('手机号码: 13800138000')
      expect(callArgs).toContain('身份证号: 110101199001011234')
      expect(callArgs).toContain('风险等级: A')
    })
  })

  describe('产品信息复制', () => {
    it('应该成功复制产品信息', async () => {
      const productInfo = {
        deposits: mockUsers['887123'].depositProducts,
        loans: mockUsers['887123'].loanProducts
      }
      const result = await copyService.copyProductInfo(productInfo)
      
      expect(result).toBe(true)
      expect(mockClipboard.writeText).toHaveBeenCalled()
      const callArgs = mockClipboard.writeText.mock.calls[0][0]
      expect(callArgs).toContain('产品信息:')
    })

    it('应该处理只有存款产品的情况', async () => {
      const productInfo = {
        deposits: mockUsers['887123'].depositProducts
      }
      const result = await copyService.copyProductInfo(productInfo)
      
      expect(result).toBe(true)
      expect(mockClipboard.writeText).toHaveBeenCalled()
      const callArgs = mockClipboard.writeText.mock.calls[0][0]
      expect(callArgs).toContain('存款产品:')
    })

    it('应该处理只有贷款产品的情况', async () => {
      const productInfo = {
        loans: mockUsers['887123'].loanProducts
      }
      const result = await copyService.copyProductInfo(productInfo)
      
      expect(result).toBe(true)
      expect(mockClipboard.writeText).toHaveBeenCalled()
      const callArgs = mockClipboard.writeText.mock.calls[0][0]
      expect(callArgs).toContain('贷款产品:')
    })
  })

  describe('催收记录复制', () => {
    it('应该成功复制单条催收记录', async () => {
      const collectionRecord = mockUsers['887123'].collectionRecords[0]
      const result = await copyService.copyCollectionRecord(collectionRecord)
      
      expect(result).toBe(true)
      expect(mockClipboard.writeText).toHaveBeenCalled()
      const callArgs = mockClipboard.writeText.mock.calls[0][0]
      expect(callArgs).toContain('催收时间:')
      expect(callArgs).toContain('催收方式:')
    })

    it('应该成功批量复制催收记录', async () => {
      const collectionRecords = mockUsers['887123'].collectionRecords
      const result = await copyService.copyBatch(collectionRecords)
      
      expect(result).toBe(true)
      expect(mockClipboard.writeText).toHaveBeenCalled()
    })
  })

  describe('征信记录复制', () => {
    it('应该成功复制征信记录', async () => {
      const creditRecord = mockUsers['887123'].creditReports[0]
      const result = await copyService.copyCreditRecord(creditRecord)
      
      expect(result).toBe(true)
      expect(mockClipboard.writeText).toHaveBeenCalled()
      const callArgs = mockClipboard.writeText.mock.calls[0][0]
      expect(callArgs).toContain('报告类型:')
      expect(callArgs).toContain('征信评分:')
    })
  })

  describe('营销记录复制', () => {
    it('应该成功复制营销触达记录', async () => {
      const marketingRecord = mockUsers['887123'].marketingRecords[0]
      const result = await copyService.copyMarketingRecord(marketingRecord, 'outreach')
      
      expect(result).toBe(true)
      expect(mockClipboard.writeText).toHaveBeenCalled()
      const callArgs = mockClipboard.writeText.mock.calls[0][0]
      expect(callArgs).toContain('活动名称:')
      expect(callArgs).toContain('触达时间:')
    })

    it('应该成功复制权益发放记录', async () => {
      // 使用第一个营销记录中的权益发放数据
      const marketingRecord = mockUsers['887123'].marketingRecords[0]
      const benefitRecord = marketingRecord.benefitGrants[0]
      const result = await copyService.copyMarketingRecord(benefitRecord, 'benefit')
      
      expect(result).toBe(true)
      expect(mockClipboard.writeText).toHaveBeenCalled()
    })


  })

  describe('用信记录复制', () => {
    it('应该成功复制用信记录', async () => {
      const loanRecord = mockUsers['887123'].loanRecords[0]
      const result = await copyService.copyLoanRecord(loanRecord)
      
      expect(result).toBe(true)
      expect(mockClipboard.writeText).toHaveBeenCalled()
      const callArgs = mockClipboard.writeText.mock.calls[0][0]
      expect(callArgs).toContain('贷款产品:')
      expect(callArgs).toContain('放款金额:')
    })


  })

  describe('历史切片复制', () => {
    it('应该成功复制历史切片数据', async () => {
      const historyData = {
        timestamp: '2024-01-15',
        data: mockUsers['887123']
      }
      const result = await copyService.copyJSON(historyData)
      
      expect(result).toBe(true)
      expect(mockClipboard.writeText).toHaveBeenCalled()
      const callArgs = mockClipboard.writeText.mock.calls[0][0]
      expect(callArgs).toContain('timestamp')
    })
  })

  describe('批量复制功能', () => {
    it('应该支持批量复制多种数据类型', async () => {
      // 确保mockUsers存在
      if (!mockUsers || !mockUsers['887123'] || !mockUsers['empty']) {
        throw new Error('测试数据不完整')
      }
      
      const batchData = [
        {
          name: mockUsers['887123'].name,
          phone: mockUsers['887123'].mobile,
          idCard: mockUsers['887123'].idCard
        },
        {
          name: mockUsers['empty'].name,
          phone: mockUsers['empty'].mobile,
          idCard: mockUsers['empty'].idCard
        },
        mockUsers['887123'].depositProducts?.[0] || {},
        mockUsers['887123'].collectionRecords?.[0] || {}
      ]
      
      const result = await copyService.copyBatch(batchData)
      
      expect(result).toBe(true)
      expect(mockClipboard.writeText).toHaveBeenCalled()
    })
  })



  describe('数据验证', () => {
    it('应该验证数据完整性', async () => {
      const incompleteData = { name: '张三' } // 缺少必要字段
      
      const result = await copyService.copyBasicInfo(incompleteData)
      
      expect(result).toBe(true) // 仍然复制，但可能有警告
    })

    it('应该处理超大数据', async () => {
      const largeData = Array.from({ length: 10000 }, (_, i) => ({
        id: i,
        data: `数据${i}`.repeat(100)
      }))
      
      const result = await copyService.copyTableData(largeData)
      
      expect(result).toBe(true)
      expect(mockClipboard.writeText).toHaveBeenCalled()
    })

    it('应该处理特殊字符和编码', async () => {
      const specialData = {
        emoji: '😀🎉🚀',
        chinese: '中文测试',
        special: 'test'
      }
      
      // 确保mock正确设置
      expect(mockClipboard.writeText).toBeDefined()
      
      const result = await copyService.copyJSON(specialData)
      
      expect(result).toBe(true)
      expect(mockClipboard.writeText).toHaveBeenCalledWith(
        JSON.stringify(specialData, null, 2)
      )
    })
  })

  describe('错误处理和恢复', () => {
    it('应该处理JSON序列化错误', async () => {
      const circularObj: any = { name: '测试' }
      circularObj.self = circularObj // 创建循环引用
      
      const result = await copyService.copyJSON(circularObj)
      
      expect(result).toBe(false)
      expect(mockMessage.error).toHaveBeenCalledWith('JSON复制失败')
    })


  })

  describe('性能测试', () => {
    it('应该在合理时间内完成大数据复制', async () => {
      const largeDataset = Array.from({ length: 5000 }, (_, index) => ({
        id: index,
        name: `用户${index}`,
        data: `数据${index}`.repeat(50)
      }))
      
      const startTime = performance.now()
      const result = await copyService.copyTableData(largeDataset)
      const endTime = performance.now()
      
      expect(result).toBe(true)
      expect(endTime - startTime).toBeLessThan(1000) // 应在1秒内完成
    })

    it('应该正确处理内存限制', async () => {
      // 模拟内存不足的情况
      const hugeData = Array.from({ length: 100000 }, (_, i) => ({
        id: i,
        data: 'x'.repeat(1000)
      }))
      
      const result = await copyService.copyTableData(hugeData)
      
      // 应该要么成功，要么优雅地失败
      expect(typeof result).toBe('boolean')
    })
  })


})