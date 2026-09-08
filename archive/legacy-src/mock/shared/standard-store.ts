/**
 * 数据标准 Store(简化版,用于渲染测试)
 *
 * 提供数据标准/标准字典/标准稽核等数据
 * @see 文档 §4 数据标准
 */

export interface DataStandard {
  code: string
  name: string
  category: 'word' | 'code' | 'domain'
  description: string
  sensitivity: 'L1' | 'L2' | 'L3'
  owner: string
  usageCount: number
  updateTime: string
}

export const StandardStore = {
  /** 别名:返回标准列表(兼容旧调用) */
  getStandards(): DataStandard[] { return this.list() },

  list(): DataStandard[] {
    return [
      { code: 'STD_USER_ID', name: '客户ID', category: 'word', description: '客户唯一标识,全局统一', sensitivity: 'L1', owner: '张三', usageCount: 128, updateTime: '2025-08-01' },
      { code: 'STD_ID_CARD', name: '身份证号', category: 'word', description: '身份证号标准格式', sensitivity: 'L3', owner: '张三', usageCount: 56, updateTime: '2025-08-01' },
      { code: 'STD_MOBILE', name: '手机号', category: 'word', description: '11位手机号', sensitivity: 'L3', owner: '张三', usageCount: 89, updateTime: '2025-08-01' },
      { code: 'STD_AGE', name: '年龄', category: 'word', description: '客户年龄', sensitivity: 'L2', owner: '张三', usageCount: 45, updateTime: '2025-08-01' },
      { code: 'STD_INCOME', name: '客户收入', category: 'word', description: '月收入', sensitivity: 'L3', owner: '张三', usageCount: 23, updateTime: '2025-08-01' },
      { code: 'STD_DAU', name: '日活', category: 'word', description: '日活跃用户数', sensitivity: 'L1', owner: '营销经理', usageCount: 12, updateTime: '2025-07-20' },
      { code: 'STD_GMV', name: 'GMV', category: 'word', description: '成交总额', sensitivity: 'L1', owner: '营销经理', usageCount: 8, updateTime: '2025-07-20' },
      { code: 'STD_STATUS', name: '状态码', category: 'code', description: '通用状态码字典', sensitivity: 'L1', owner: '张三', usageCount: 256, updateTime: '2025-08-01' },
      { code: 'STD_RISK_LEVEL', name: '风险等级', category: 'code', description: 'low/medium/high 三级风险', sensitivity: 'L2', owner: '风控值班', usageCount: 67, updateTime: '2025-08-01' },
      { code: 'STD_LOAN_TYPE', name: '贷款类型', category: 'code', description: '信贷产品类型字典', sensitivity: 'L1', owner: '信贷经理', usageCount: 34, updateTime: '2025-07-15' },
      { code: 'STD_GEO', name: '行政区划', category: 'domain', description: '国家行政区划编码', sensitivity: 'L1', owner: '系统', usageCount: 178, updateTime: '2025-08-01' },
      { code: 'STD_CREDIT_SCORE', name: '信用评分', category: 'word', description: '信用评分字段', sensitivity: 'L2', owner: '风控值班', usageCount: 34, updateTime: '2025-08-01' }
    ]
  },

  byCode(code: string) {
    return this.list().find(s => s.code === code)
  },

  byCategory(category: string) {
    return this.list().filter(s => s.category === category)
  },

  bySensitivity(level: string) {
    return this.list().filter(s => s.sensitivity === level)
  },

  byOwner(owner: string) {
    return this.list().filter(s => s.owner === owner)
  },

  stats() {
    const list = this.list()
    return {
      total: list.length,
      byCategory: {
        word: list.filter(s => s.category === 'word').length,
        code: list.filter(s => s.category === 'code').length,
        domain: list.filter(s => s.category === 'domain').length
      },
      bySensitivity: {
        L1: list.filter(s => s.sensitivity === 'L1').length,
        L2: list.filter(s => s.sensitivity === 'L2').length,
        L3: list.filter(s => s.sensitivity === 'L3').length
      },
      totalUsage: list.reduce((sum, s) => sum + s.usageCount, 0)
    }
  }
}

export default StandardStore