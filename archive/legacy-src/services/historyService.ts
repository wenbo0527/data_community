import { Message } from '@arco-design/web-vue'

/**
 * 历史数据服务
 * 提供历史切片查询和对比功能
 */
class HistoryService {
  /**
   * 查询历史切片列表
   */
  async getHistorySlices(customerId: string, options: {
    startDate?: string
    endDate?: string
    dataType?: string
    limit?: number
  } = {}): Promise<any[]> {
    try {
      // 模拟API调用
      await this.delay(500)
      
      const { startDate, endDate, dataType, limit = 50 } = options
      
      // 模拟历史切片数据
      const slices = [
        {
          id: 'slice_001',
          customerId,
          snapshotTime: '2024-01-15 10:30:00',
          dataType: 'basic_info',
          version: '1.0',
          changes: [
            { field: 'phone', oldValue: '138****1234', newValue: '139****5678' },
            { field: 'address', oldValue: '北京市朝阳区', newValue: '上海市浦东新区' }
          ],
          operator: 'system',
          reason: '客户信息更新'
        },
        {
          id: 'slice_002',
          customerId,
          snapshotTime: '2024-01-10 14:20:00',
          dataType: 'product_info',
          version: '1.1',
          changes: [
            { field: 'creditLimit', oldValue: 50000, newValue: 80000 },
            { field: 'riskLevel', oldValue: 'medium', newValue: 'low' }
          ],
          operator: 'admin',
          reason: '额度调整'
        },
        {
          id: 'slice_003',
          customerId,
          snapshotTime: '2024-01-05 09:15:00',
          dataType: 'loan_info',
          version: '2.0',
          changes: [
            { field: 'loanStatus', oldValue: 'active', newValue: 'settled' },
            { field: 'remainingAmount', oldValue: 15000, newValue: 0 }
          ],
          operator: 'system',
          reason: '贷款结清'
        }
      ]
      
      // 应用筛选条件
      let filteredSlices = slices
      
      if (startDate) {
        filteredSlices = filteredSlices.filter(slice => 
          slice.snapshotTime >= startDate
        )
      }
      
      if (endDate) {
        filteredSlices = filteredSlices.filter(slice => 
          slice.snapshotTime <= endDate
        )
      }
      
      if (dataType) {
        filteredSlices = filteredSlices.filter(slice => 
          slice.dataType === dataType
        )
      }
      
      return filteredSlices.slice(0, limit)
    } catch (error) {
      console.error('查询历史切片失败:', error)
      Message.error('查询历史切片失败')
      throw error
    }
  }

  /**
   * 获取历史切片详情
   */
  async getHistorySliceDetail(sliceId: string): Promise<any> {
    try {
      await this.delay(300)
      
      // 模拟详细的历史切片数据
      return {
        id: sliceId,
        customerId: 'customer_001',
        snapshotTime: '2024-01-15 10:30:00',
        dataType: 'basic_info',
        version: '1.0',
        fullData: {
          basicInfo: {
            name: '张三',
            idCard: '110101199001011234',
            phone: '139****5678',
            email: 'zhangsan@example.com',
            address: '上海市浦东新区'
          },
          productInfo: {
            deposits: [
              { productName: '活期存款', balance: 50000 }
            ],
            loans: [
              { productName: '个人信用贷', balance: 100000 }
            ]
          }
        },
        changes: [
          {
            field: 'phone',
            fieldName: '手机号码',
            oldValue: '138****1234',
            newValue: '139****5678',
            changeType: 'update'
          },
          {
            field: 'address',
            fieldName: '联系地址',
            oldValue: '北京市朝阳区',
            newValue: '上海市浦东新区',
            changeType: 'update'
          }
        ],
        operator: 'system',
        operatorName: '系统自动',
        reason: '客户信息更新',
        metadata: {
          source: 'customer_portal',
          ip: '192.168.1.100',
          userAgent: 'Mozilla/5.0...'
        }
      }
    } catch (error) {
      console.error('获取历史切片详情失败:', error)
      Message.error('获取历史切片详情失败')
      throw error
    }
  }

  /**
   * 对比两个历史切片
   */
  async compareSlices(sliceId1: string, sliceId2: string): Promise<any> {
    try {
      await this.delay(400)
      
      const slice1 = await this.getHistorySliceDetail(sliceId1)
      const slice2 = await this.getHistorySliceDetail(sliceId2)
      
      // 模拟对比结果
      return {
        slice1: {
          id: sliceId1,
          snapshotTime: slice1.snapshotTime,
          version: slice1.version
        },
        slice2: {
          id: sliceId2,
          snapshotTime: slice2.snapshotTime,
          version: slice2.version
        },
        differences: [
          {
            field: 'phone',
            fieldName: '手机号码',
            value1: '138****1234',
            value2: '139****5678',
            changeType: 'modified'
          },
          {
            field: 'creditLimit',
            fieldName: '信用额度',
            value1: 50000,
            value2: 80000,
            changeType: 'modified'
          },
          {
            field: 'newField',
            fieldName: '新增字段',
            value1: null,
            value2: 'new_value',
            changeType: 'added'
          }
        ],
        summary: {
          totalChanges: 3,
          addedFields: 1,
          modifiedFields: 2,
          removedFields: 0
        }
      }
    } catch (error) {
      console.error('对比历史切片失败:', error)
      Message.error('对比历史切片失败')
      throw error
    }
  }

  /**
   * 获取数据变更统计
   */
  async getChangeStatistics(customerId: string, options: {
    startDate?: string
    endDate?: string
    groupBy?: 'day' | 'week' | 'month'
  } = {}): Promise<any> {
    try {
      await this.delay(600)
      
      const { groupBy = 'day' } = options
      
      // 模拟统计数据
      return {
        totalChanges: 156,
        changesByType: {
          'basic_info': 45,
          'product_info': 67,
          'loan_info': 34,
          'credit_info': 10
        },
        changesByOperator: {
          'system': 89,
          'admin': 45,
          'customer': 22
        },
        timeline: [
          { date: '2024-01-01', changes: 12 },
          { date: '2024-01-02', changes: 8 },
          { date: '2024-01-03', changes: 15 },
          { date: '2024-01-04', changes: 6 },
          { date: '2024-01-05', changes: 20 }
        ],
        topChangedFields: [
          { field: 'phone', fieldName: '手机号码', count: 25 },
          { field: 'address', fieldName: '联系地址', count: 18 },
          { field: 'creditLimit', fieldName: '信用额度', count: 15 },
          { field: 'riskLevel', fieldName: '风险等级', count: 12 }
        ]
      }
    } catch (error) {
      console.error('获取变更统计失败:', error)
      Message.error('获取变更统计失败')
      throw error
    }
  }

  /**
   * 恢复到历史版本
   */
  async restoreToSlice(sliceId: string, reason: string): Promise<boolean> {
    try {
      await this.delay(800)
      
      // 模拟恢复操作
      console.log(`恢复到历史版本: ${sliceId}, 原因: ${reason}`)
      
      Message.success('数据恢复成功')
      return true
    } catch (error) {
      console.error('数据恢复失败:', error)
      Message.error('数据恢复失败')
      return false
    }
  }

  /**
   * 搜索历史记录
   */
  async searchHistory(customerId: string, query: {
    keyword?: string
    field?: string
    operator?: string
    changeType?: string
    startDate?: string
    endDate?: string
  }): Promise<any[]> {
    try {
      await this.delay(400)
      
      // 模拟搜索结果
      return [
        {
          id: 'slice_search_001',
          customerId,
          snapshotTime: '2024-01-15 10:30:00',
          field: 'phone',
          fieldName: '手机号码',
          oldValue: '138****1234',
          newValue: '139****5678',
          operator: 'system',
          reason: '客户信息更新',
          matchType: 'field_name'
        },
        {
          id: 'slice_search_002',
          customerId,
          snapshotTime: '2024-01-10 14:20:00',
          field: 'creditLimit',
          fieldName: '信用额度',
          oldValue: 50000,
          newValue: 80000,
          operator: 'admin',
          reason: '额度调整',
          matchType: 'value'
        }
      ]
    } catch (error) {
      console.error('搜索历史记录失败:', error)
      Message.error('搜索历史记录失败')
      throw error
    }
  }

  /**
   * 获取可用的数据类型
   */
  getAvailableDataTypes(): Array<{ value: string; label: string }> {
    return [
      { value: 'basic_info', label: '基本信息' },
      { value: 'product_info', label: '产品信息' },
      { value: 'loan_info', label: '贷款信息' },
      { value: 'credit_info', label: '征信信息' },
      { value: 'collection_info', label: '催收信息' },
      { value: 'marketing_info', label: '营销信息' }
    ]
  }

  /**
   * 获取变更类型
   */
  getChangeTypes(): Array<{ value: string; label: string }> {
    return [
      { value: 'added', label: '新增' },
      { value: 'modified', label: '修改' },
      { value: 'removed', label: '删除' }
    ]
  }

  /**
   * 延迟函数（模拟网络请求）
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 格式化变更描述
   */
  formatChangeDescription(change: any): string {
    const { field, fieldName, oldValue, newValue, changeType } = change
    
    switch (changeType) {
      case 'added':
        return `新增 ${fieldName}: ${newValue}`
      case 'removed':
        return `删除 ${fieldName}: ${oldValue}`
      case 'modified':
      default:
        return `修改 ${fieldName}: ${oldValue} → ${newValue}`
    }
  }

  /**
   * 验证切片ID
   */
  isValidSliceId(sliceId: string): boolean {
    return /^slice_\w+$/.test(sliceId)
  }
}

export default new HistoryService()