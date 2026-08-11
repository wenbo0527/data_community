/**
 * 客户 Directory 补齐(Mock 数据缺口 P0)
 *
 * 原 customer360.ts 仅有 8 个用户,无法支撑客户 360 全场景展示。
 * 本文件补充 50 个用户,覆盖各种画像:
 *   - 新客 / 老客 / 流失风险
 *   - 高价值 / 中价值 / 低价值
 *   - 风控优 / 风控良 / 风控差
 *   - 不同地域 / 性别 / 年龄段
 *
 * 与原 customer360.ts 兼容(同样的 UserData 形状)。
 */

import type { MockMethod } from 'vite-plugin-mock'

// 模拟 UserData 形状(与 customer360.ts 兼容)
export interface CustomerProfileSummary {
  userId: string
  name: string
  mobile: string
  gender: 'M' | 'F'
  age: number
  region: string
  occupation: string
  registerDate: string
  totalCredit: number
  usedCredit: number
  availableCredit: number
  creditScore: number
  riskLevel: 'low' | 'medium' | 'high'
  valueLevel: 'A' | 'B' | 'C' | 'D'
  lifecycleStage: 'new' | 'growing' | 'mature' | 'churn_risk'
  activeDays: number
  tags: string[]
}

// 50 个客户的精简画像(供列表/搜索使用)
export const CUSTOMER_DIRECTORY: CustomerProfileSummary[] = [
  // === 新客(8 个) ===
  { userId: 'C001', name: '张明', mobile: '13800001001', gender: 'M', age: 28, region: '上海', occupation: '互联网工程师', registerDate: '2025-06-15', totalCredit: 50000, usedCredit: 0, availableCredit: 50000, creditScore: 720, riskLevel: 'low', valueLevel: 'B', lifecycleStage: 'new', activeDays: 5, tags: ['新客', '互联网'] },
  { userId: 'C002', name: '李芳', mobile: '13800001002', gender: 'F', age: 32, region: '北京', occupation: '产品经理', registerDate: '2025-07-01', totalCredit: 80000, usedCredit: 12000, availableCredit: 68000, creditScore: 750, riskLevel: 'low', valueLevel: 'B', lifecycleStage: 'new', activeDays: 12, tags: ['新客', '高学历'] },
  { userId: 'C003', name: '王强', mobile: '13800001003', gender: 'M', age: 25, region: '广州', occupation: '销售', registerDate: '2025-05-20', totalCredit: 30000, usedCredit: 5000, availableCredit: 25000, creditScore: 680, riskLevel: 'medium', valueLevel: 'C', lifecycleStage: 'new', activeDays: 8, tags: ['新客', '销售'] },
  { userId: 'C004', name: '刘静', mobile: '13800001004', gender: 'F', age: 29, region: '深圳', occupation: '设计师', registerDate: '2025-04-10', totalCredit: 60000, usedCredit: 8000, availableCredit: 52000, creditScore: 730, riskLevel: 'low', valueLevel: 'B', lifecycleStage: 'new', activeDays: 15, tags: ['新客', '设计'] },
  { userId: 'C005', name: '陈军', mobile: '13800001005', gender: 'M', age: 35, region: '杭州', occupation: '运营', registerDate: '2025-08-05', totalCredit: 100000, usedCredit: 0, availableCredit: 100000, creditScore: 760, riskLevel: 'low', valueLevel: 'A', lifecycleStage: 'new', activeDays: 3, tags: ['新客', '高价值潜力'] },
  { userId: 'C006', name: '杨柳', mobile: '13800001006', gender: 'F', age: 26, region: '成都', occupation: '教师', registerDate: '2025-06-28', totalCredit: 40000, usedCredit: 2000, availableCredit: 38000, creditScore: 700, riskLevel: 'low', valueLevel: 'B', lifecycleStage: 'new', activeDays: 7, tags: ['新客', '稳定职业'] },
  { userId: 'C007', name: '赵亮', mobile: '13800001007', gender: 'M', age: 31, region: '武汉', occupation: '医生', registerDate: '2025-07-12', totalCredit: 150000, usedCredit: 30000, availableCredit: 120000, creditScore: 780, riskLevel: 'low', valueLevel: 'A', lifecycleStage: 'new', activeDays: 10, tags: ['新客', '高收入'] },
  { userId: 'C008', name: '孙婷', mobile: '13800001008', gender: 'F', age: 24, region: '南京', occupation: '学生', registerDate: '2025-09-01', totalCredit: 20000, usedCredit: 0, availableCredit: 20000, creditScore: 650, riskLevel: 'medium', valueLevel: 'C', lifecycleStage: 'new', activeDays: 2, tags: ['新客', '学生'] },

  // === 成长期(12 个) ===
  { userId: 'C009', name: '周健', mobile: '13800001009', gender: 'M', age: 33, region: '上海', occupation: '金融分析师', registerDate: '2024-12-10', totalCredit: 200000, usedCredit: 80000, availableCredit: 120000, creditScore: 800, riskLevel: 'low', valueLevel: 'A', lifecycleStage: 'growing', activeDays: 45, tags: ['高价值', '金融'] },
  { userId: 'C010', name: '吴敏', mobile: '13800001010', gender: 'F', age: 30, region: '北京', occupation: '律师', registerDate: '2024-11-05', totalCredit: 150000, usedCredit: 50000, availableCredit: 100000, creditScore: 770, riskLevel: 'low', valueLevel: 'A', lifecycleStage: 'growing', activeDays: 50, tags: ['高价值', '专业'] },
  { userId: 'C011', name: '徐磊', mobile: '13800001011', gender: 'M', age: 40, region: '深圳', occupation: '创业公司CEO', registerDate: '2024-10-15', totalCredit: 300000, usedCredit: 180000, availableCredit: 120000, creditScore: 820, riskLevel: 'low', valueLevel: 'A', lifecycleStage: 'growing', activeDays: 60, tags: ['高价值', '企业主'] },
  { userId: 'C012', name: '黄丽', mobile: '13800001012', gender: 'F', age: 36, region: '广州', occupation: 'HR总监', registerDate: '2024-09-20', totalCredit: 120000, usedCredit: 40000, availableCredit: 80000, creditScore: 760, riskLevel: 'low', valueLevel: 'A', lifecycleStage: 'growing', activeDays: 55, tags: ['稳定', '中产'] },
  { userId: 'C013', name: '马超', mobile: '13800001013', gender: 'M', age: 27, region: '杭州', occupation: '前端开发', registerDate: '2024-08-15', totalCredit: 80000, usedCredit: 25000, availableCredit: 55000, creditScore: 730, riskLevel: 'low', valueLevel: 'B', lifecycleStage: 'growing', activeDays: 40, tags: ['互联网'] },
  { userId: 'C014', name: '罗晓', mobile: '13800001014', gender: 'F', age: 34, region: '上海', occupation: '市场总监', registerDate: '2024-07-30', totalCredit: 180000, usedCredit: 60000, availableCredit: 120000, creditScore: 790, riskLevel: 'low', valueLevel: 'A', lifecycleStage: 'growing', activeDays: 65, tags: ['高价值'] },
  { userId: 'C015', name: '高峰', mobile: '13800001015', gender: 'M', age: 38, region: '北京', occupation: '投资经理', registerDate: '2024-06-12', totalCredit: 250000, usedCredit: 100000, availableCredit: 150000, creditScore: 810, riskLevel: 'low', valueLevel: 'A', lifecycleStage: 'growing', activeDays: 75, tags: ['高价值', '投资'] },
  { userId: 'C016', name: '林娜', mobile: '13800001016', gender: 'F', age: 29, region: '成都', occupation: '数据分析师', registerDate: '2024-05-25', totalCredit: 90000, usedCredit: 35000, availableCredit: 55000, creditScore: 740, riskLevel: 'low', valueLevel: 'B', lifecycleStage: 'growing', activeDays: 50, tags: ['稳定'] },
  { userId: 'C017', name: '梁宇', mobile: '13800001017', gender: 'M', age: 31, region: '广州', occupation: '财务经理', registerDate: '2024-04-18', totalCredit: 130000, usedCredit: 45000, availableCredit: 85000, creditScore: 770, riskLevel: 'low', valueLevel: 'A', lifecycleStage: 'growing', activeDays: 60, tags: ['稳定'] },
  { userId: 'C018', name: '宋丹', mobile: '13800001018', gender: 'F', age: 42, region: '深圳', occupation: '注册会计师', registerDate: '2024-03-10', totalCredit: 160000, usedCredit: 55000, availableCredit: 105000, creditScore: 780, riskLevel: 'low', valueLevel: 'A', lifecycleStage: 'growing', activeDays: 80, tags: ['高价值'] },
  { userId: 'C019', name: '韩磊', mobile: '13800001019', gender: 'M', age: 26, region: '北京', occupation: '产品助理', registerDate: '2024-02-22', totalCredit: 60000, usedCredit: 22000, availableCredit: 38000, creditScore: 700, riskLevel: 'low', valueLevel: 'B', lifecycleStage: 'growing', activeDays: 35, tags: ['互联网'] },
  { userId: 'C020', name: '冯莹', mobile: '13800001020', gender: 'F', age: 32, region: '上海', occupation: '咨询顾问', registerDate: '2024-01-30', totalCredit: 140000, usedCredit: 48000, availableCredit: 92000, creditScore: 760, riskLevel: 'low', valueLevel: 'A', lifecycleStage: 'growing', activeDays: 70, tags: ['高价值'] },

  // === 成熟期(15 个) ===
  { userId: 'C021', name: '邓辉', mobile: '13800001021', gender: 'M', age: 45, region: '北京', occupation: '公司高管', registerDate: '2023-06-15', totalCredit: 500000, usedCredit: 200000, availableCredit: 300000, creditScore: 850, riskLevel: 'low', valueLevel: 'A', lifecycleStage: 'mature', activeDays: 200, tags: ['VIP', '高价值', '稳定'] },
  { userId: 'C022', name: '曹颖', mobile: '13800001022', gender: 'F', age: 38, region: '上海', occupation: '医生', registerDate: '2023-05-20', totalCredit: 300000, usedCredit: 120000, availableCredit: 180000, creditScore: 820, riskLevel: 'low', valueLevel: 'A', lifecycleStage: 'mature', activeDays: 180, tags: ['VIP', '高收入'] },
  { userId: 'C023', name: '彭飞', mobile: '13800001023', gender: 'M', age: 41, region: '深圳', occupation: '企业主', registerDate: '2023-04-10', totalCredit: 600000, usedCredit: 280000, availableCredit: 320000, creditScore: 840, riskLevel: 'low', valueLevel: 'A', lifecycleStage: 'mature', activeDays: 220, tags: ['VIP', '高价值'] },
  { userId: 'C024', name: '于娟', mobile: '13800001024', gender: 'F', age: 35, region: '广州', occupation: '律师合伙人', registerDate: '2023-03-15', totalCredit: 280000, usedCredit: 100000, availableCredit: 180000, creditScore: 810, riskLevel: 'low', valueLevel: 'A', lifecycleStage: 'mature', activeDays: 190, tags: ['VIP'] },
  { userId: 'C025', name: '蒋峰', mobile: '13800001025', gender: 'M', age: 39, region: '杭州', occupation: '投资总监', registerDate: '2023-02-28', totalCredit: 400000, usedCredit: 150000, availableCredit: 250000, creditScore: 830, riskLevel: 'low', valueLevel: 'A', lifecycleStage: 'mature', activeDays: 210, tags: ['VIP', '高价值'] },
  { userId: 'C026', name: '贺玲', mobile: '13800001026', gender: 'F', age: 37, region: '成都', occupation: '医院科室主任', registerDate: '2023-01-12', totalCredit: 250000, usedCredit: 90000, availableCredit: 160000, creditScore: 800, riskLevel: 'low', valueLevel: 'A', lifecycleStage: 'mature', activeDays: 170, tags: ['VIP'] },
  { userId: 'C027', name: '田涛', mobile: '13800001027', gender: 'M', age: 44, region: '北京', occupation: '合伙人', registerDate: '2022-12-20', totalCredit: 450000, usedCredit: 180000, availableCredit: 270000, creditScore: 840, riskLevel: 'low', valueLevel: 'A', lifecycleStage: 'mature', activeDays: 250, tags: ['VIP'] },
  { userId: 'C028', name: '丁美', mobile: '13800001028', gender: 'F', age: 36, region: '上海', occupation: '资深 HR', registerDate: '2022-11-08', totalCredit: 200000, usedCredit: 80000, availableCredit: 120000, creditScore: 790, riskLevel: 'low', valueLevel: 'A', lifecycleStage: 'mature', activeDays: 200, tags: ['稳定'] },
  { userId: 'C029', name: '杜军', mobile: '13800001029', gender: 'M', age: 43, region: '深圳', occupation: '工厂主', registerDate: '2022-10-15', totalCredit: 350000, usedCredit: 140000, availableCredit: 210000, creditScore: 820, riskLevel: 'low', valueLevel: 'A', lifecycleStage: 'mature', activeDays: 230, tags: ['高价值'] },
  { userId: 'C030', name: '程琳', mobile: '13800001030', gender: 'F', age: 34, region: '广州', occupation: '银行支行行长', registerDate: '2022-09-22', totalCredit: 320000, usedCredit: 130000, availableCredit: 190000, creditScore: 820, riskLevel: 'low', valueLevel: 'A', lifecycleStage: 'mature', activeDays: 240, tags: ['VIP'] },
  { userId: 'C031', name: '卢静', mobile: '13800001031', gender: 'F', age: 33, region: '上海', occupation: '咨询合伙人', registerDate: '2022-08-18', totalCredit: 240000, usedCredit: 95000, availableCredit: 145000, creditScore: 800, riskLevel: 'low', valueLevel: 'A', lifecycleStage: 'mature', activeDays: 220, tags: ['高价值'] },
  { userId: 'C032', name: '戴伟', mobile: '13800001032', gender: 'M', age: 42, region: '北京', occupation: '上市公司CFO', registerDate: '2022-07-10', totalCredit: 500000, usedCredit: 200000, availableCredit: 300000, creditScore: 850, riskLevel: 'low', valueLevel: 'A', lifecycleStage: 'mature', activeDays: 260, tags: ['VIP', '顶级'] },
  { userId: 'C033', name: '夏雪', mobile: '13800001033', gender: 'F', age: 35, region: '深圳', occupation: '基金公司副总', registerDate: '2022-06-25', totalCredit: 380000, usedCredit: 150000, availableCredit: 230000, creditScore: 830, riskLevel: 'low', valueLevel: 'A', lifecycleStage: 'mature', activeDays: 250, tags: ['VIP'] },
  { userId: 'C034', name: '范刚', mobile: '13800001034', gender: 'M', age: 40, region: '杭州', occupation: '互联网公司CTO', registerDate: '2022-05-12', totalCredit: 420000, usedCredit: 160000, availableCredit: 260000, creditScore: 840, riskLevel: 'low', valueLevel: 'A', lifecycleStage: 'mature', activeDays: 260, tags: ['VIP', '互联网'] },
  { userId: 'C035', name: '方静', mobile: '13800001035', gender: 'F', age: 32, region: '上海', occupation: '投行VP', registerDate: '2022-04-08', totalCredit: 300000, usedCredit: 120000, availableCredit: 180000, creditScore: 820, riskLevel: 'low', valueLevel: 'A', lifecycleStage: 'mature', activeDays: 240, tags: ['VIP'] },

  // === 流失风险(10 个) ===
  { userId: 'C036', name: '邹林', mobile: '13800001036', gender: 'M', age: 35, region: '北京', occupation: '外企中层', registerDate: '2022-03-15', totalCredit: 100000, usedCredit: 65000, availableCredit: 35000, creditScore: 650, riskLevel: 'medium', valueLevel: 'C', lifecycleStage: 'churn_risk', activeDays: 120, tags: ['流失风险', '逾期预警'] },
  { userId: 'C037', name: '石玉', mobile: '13800001037', gender: 'F', age: 30, region: '广州', occupation: '小企业主', registerDate: '2022-02-20', totalCredit: 80000, usedCredit: 55000, availableCredit: 25000, creditScore: 600, riskLevel: 'high', valueLevel: 'C', lifecycleStage: 'churn_risk', activeDays: 90, tags: ['逾期', '风险高'] },
  { userId: 'C038', name: '龙飞', mobile: '13800001038', gender: 'M', age: 40, region: '上海', occupation: '自由职业', registerDate: '2021-12-08', totalCredit: 120000, usedCredit: 95000, availableCredit: 25000, creditScore: 580, riskLevel: 'high', valueLevel: 'D', lifecycleStage: 'churn_risk', activeDays: 150, tags: ['严重逾期', '催收'] },
  { userId: 'C039', name: '白洁', mobile: '13800001039', gender: 'F', age: 28, region: '深圳', occupation: '销售经理', registerDate: '2021-10-12', totalCredit: 70000, usedCredit: 42000, availableCredit: 28000, creditScore: 620, riskLevel: 'medium', valueLevel: 'C', lifecycleStage: 'churn_risk', activeDays: 100, tags: ['低活跃', '流失风险'] },
  { userId: 'C040', name: '孟浩', mobile: '13800001040', gender: 'M', age: 38, region: '成都', occupation: '工程承包', registerDate: '2021-08-25', totalCredit: 150000, usedCredit: 110000, availableCredit: 40000, creditScore: 610, riskLevel: 'high', valueLevel: 'D', lifecycleStage: 'churn_risk', activeDays: 80, tags: ['严重逾期', '法律追偿'] },
  { userId: 'C041', name: '梅芳', mobile: '13800001041', gender: 'F', age: 33, region: '武汉', occupation: '个体户', registerDate: '2021-06-18', totalCredit: 90000, usedCredit: 60000, availableCredit: 30000, creditScore: 630, riskLevel: 'medium', valueLevel: 'C', lifecycleStage: 'churn_risk', activeDays: 110, tags: ['逾期'] },
  { userId: 'C042', name: '熊健', mobile: '13800001042', gender: 'M', age: 42, region: '北京', occupation: '私营业主', registerDate: '2021-05-20', totalCredit: 180000, usedCredit: 140000, availableCredit: 40000, creditScore: 590, riskLevel: 'high', valueLevel: 'D', lifecycleStage: 'churn_risk', activeDays: 130, tags: ['失信', '严重逾期'] },
  { userId: 'C043', name: '邱丽', mobile: '13800001043', gender: 'F', age: 36, region: '上海', occupation: '代理商', registerDate: '2021-04-15', totalCredit: 130000, usedCredit: 85000, availableCredit: 45000, creditScore: 640, riskLevel: 'medium', valueLevel: 'C', lifecycleStage: 'churn_risk', activeDays: 140, tags: ['低活跃'] },
  { userId: 'C044', name: '秦涛', mobile: '13800001044', gender: 'M', age: 31, region: '深圳', occupation: '电商运营', registerDate: '2021-03-10', totalCredit: 85000, usedCredit: 52000, availableCredit: 33000, creditScore: 660, riskLevel: 'medium', valueLevel: 'C', lifecycleStage: 'churn_risk', activeDays: 95, tags: ['低活跃'] },
  { userId: 'C045', name: '尹静', mobile: '13800001045', gender: 'F', age: 29, region: '广州', occupation: '业务员', registerDate: '2021-02-22', totalCredit: 65000, usedCredit: 38000, availableCredit: 27000, creditScore: 670, riskLevel: 'medium', valueLevel: 'C', lifecycleStage: 'churn_risk', activeDays: 105, tags: ['低活跃', '流失风险'] },

  // === 已流失(5 个) ===
  { userId: 'C046', name: '韦刚', mobile: '13800001046', gender: 'M', age: 45, region: '北京', occupation: '物流公司', registerDate: '2020-06-10', totalCredit: 100000, usedCredit: 95000, availableCredit: 5000, creditScore: 540, riskLevel: 'high', valueLevel: 'D', lifecycleStage: 'churn_risk', activeDays: 30, tags: ['已流失', '严重逾期'] },
  { userId: 'C047', name: '苏梅', mobile: '13800001047', gender: 'F', age: 38, region: '上海', occupation: '美容店主', registerDate: '2020-04-15', totalCredit: 80000, usedCredit: 75000, availableCredit: 5000, creditScore: 550, riskLevel: 'high', valueLevel: 'D', lifecycleStage: 'churn_risk', activeDays: 20, tags: ['已流失'] },
  { userId: 'C048', name: '潘亮', mobile: '13800001048', gender: 'M', age: 41, region: '广州', occupation: '餐饮店主', registerDate: '2020-03-20', totalCredit: 120000, usedCredit: 110000, availableCredit: 10000, creditScore: 530, riskLevel: 'high', valueLevel: 'D', lifecycleStage: 'churn_risk', activeDays: 15, tags: ['已流失', '法律追偿'] },
  { userId: 'C049', name: '顾静', mobile: '13800001049', gender: 'F', age: 32, region: '深圳', occupation: '代购', registerDate: '2020-02-08', totalCredit: 70000, usedCredit: 65000, availableCredit: 5000, creditScore: 560, riskLevel: 'high', valueLevel: 'D', lifecycleStage: 'churn_risk', activeDays: 25, tags: ['已流失'] },
  { userId: 'C050', name: '段磊', mobile: '13800001050', gender: 'M', age: 36, region: '成都', occupation: '装修工', registerDate: '2020-01-15', totalCredit: 90000, usedCredit: 85000, availableCredit: 5000, creditScore: 520, riskLevel: 'high', valueLevel: 'D', lifecycleStage: 'churn_risk', activeDays: 18, tags: ['已流失', '严重逾期'] }
]

/**
 * 客户 Store
 */
export const CustomerDirectoryStore = {
  list(): CustomerProfileSummary[] {
    return CUSTOMER_DIRECTORY
  },

  byId(userId: string): CustomerProfileSummary | undefined {
    return CUSTOMER_DIRECTORY.find(c => c.userId === userId)
  },

  /** 按生命周期阶段 */
  byStage(stage: string): CustomerProfileSummary[] {
    return CUSTOMER_DIRECTORY.filter(c => c.lifecycleStage === stage)
  },

  /** 按价值层级 */
  byValueLevel(level: string): CustomerProfileSummary[] {
    return CUSTOMER_DIRECTORY.filter(c => c.valueLevel === level)
  },

  /** 按风险等级 */
  byRisk(risk: string): CustomerProfileSummary[] {
    return CUSTOMER_DIRECTORY.filter(c => c.riskLevel === risk)
  },

  /** 按地域 */
  byRegion(region: string): CustomerProfileSummary[] {
    return CUSTOMER_DIRECTORY.filter(c => c.region === region)
  },

  /** 搜索(姓名/手机/标签) */
  search(keyword: string): CustomerProfileSummary[] {
    const lower = keyword.toLowerCase()
    return CUSTOMER_DIRECTORY.filter(c =>
      c.name.toLowerCase().includes(lower) ||
      c.mobile.includes(keyword) ||
      c.userId.toLowerCase().includes(lower) ||
      c.tags.some(t => t.includes(keyword))
    )
  },

  /** 统计 */
  stats() {
    const total = CUSTOMER_DIRECTORY.length
    const stageCount: Record<string, number> = {}
    const valueCount: Record<string, number> = {}
    let totalCredit = 0
    let totalUsed = 0

    CUSTOMER_DIRECTORY.forEach(c => {
      stageCount[c.lifecycleStage] = (stageCount[c.lifecycleStage] || 0) + 1
      valueCount[c.valueLevel] = (valueCount[c.valueLevel] || 0) + 1
      totalCredit += c.totalCredit
      totalUsed += c.usedCredit
    })

    return {
      total,
      stageCount,
      valueCount,
      totalCredit,
      totalUsed,
      creditUsageRate: totalCredit > 0 ? totalUsed / totalCredit : 0
    }
  }
}

// 提供 HTTP mock(供 search-api 集成)
export const customerDirectoryMocks: MockMethod[] = [
  {
    url: '/api/customer-directory/list',
    method: 'get',
    response: ({ query }: { query: { stage?: string; value?: string; risk?: string; keyword?: string } }) => {
      let result = CUSTOMER_DIRECTORY
      if (query.stage) result = result.filter(c => c.lifecycleStage === query.stage)
      if (query.value) result = result.filter(c => c.valueLevel === query.value)
      if (query.risk) result = result.filter(c => c.riskLevel === query.risk)
      if (query.keyword) {
        const lower = query.keyword.toLowerCase()
        result = result.filter(c =>
          c.name.toLowerCase().includes(lower) ||
          c.mobile.includes(query.keyword!) ||
          c.tags.some(t => t.includes(query.keyword!))
        )
      }
      return { code: 0, data: result, total: result.length }
    }
  },
  {
    url: '/api/customer-directory/stats',
    method: 'get',
    response: () => ({ code: 0, data: CustomerDirectoryStore.stats() })
  },
  {
    url: '/api/customer-directory/:userId',
    method: 'get',
    response: ({ url }: { url: string }) => {
      const userId = url.split('/').pop() || ''
      const user = CustomerDirectoryStore.byId(userId)
      if (!user) return { code: 404, message: '用户不存在' }
      return { code: 0, data: user }
    }
  }
]