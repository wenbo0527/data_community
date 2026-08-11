/**
 * dataset.ts —— 数据消费侧的公共 mock 数据集
 *
 * 设计意图:
 *   1. 把 6 类常用 mock(指标 / 变量 / 特征 / 数据表 / API / 监管报表)
 *      集中到一个文件,各页面 import 即用,避免散落硬编码
 *   2. 提供「按 code 查找 / 按关键字过滤 / 按 owner 查找 / 按 domain 查找」通用方法
 *   3. 后续接真实 API 时,只需把这些方法替换为 HTTP 调用,业务代码不动
 *
 * 不依赖任何外部模块,纯数据 + 工具函数
 */

// ───────────────────────────── 1. 指标集(metrics) ─────────────────────────────
export interface MetricItem {
  code: string
  name: string
  layer: 'L1' | 'L2' | 'L3' | 'L4'
  type: 'atomic' | 'derived'
  owner: string
  formula: string
  category: string
  domain: string
  unit?: string
  updateFrequency?: 'daily' | 'hourly' | 'realtime' | 'weekly' | 'monthly'
  tags?: string[]
  description?: string
}

export const METRICS: MetricItem[] = [
  // ── 用户域 ──
  { code: 'M001', name: 'DAU', layer: 'L1', type: 'atomic', owner: '王运营', formula: 'COUNT(DISTINCT user_id) WHERE 活跃=true', category: '用户域', domain: '用户域', unit: '人', updateFrequency: 'daily', tags: ['北极星'], description: '日活跃用户数' },
  { code: 'M002', name: 'MAU', layer: 'L1', type: 'atomic', owner: '王运营', formula: 'COUNT(DISTINCT user_id) WHERE 30天内活跃', category: '用户域', domain: '用户域', unit: '人', updateFrequency: 'daily', description: '月活跃用户数' },
  { code: 'M003', name: '新增用户', layer: 'L1', type: 'atomic', owner: '王运营', formula: 'COUNT(user_id) WHERE 注册日期=今天', category: '用户域', domain: '用户域', unit: '人', updateFrequency: 'daily', description: '当日新增注册用户' },
  { code: 'M004', name: 'DAU/MAU', layer: 'L2', type: 'derived', owner: '王运营', formula: 'DAU / MAU', category: '用户域', domain: '用户域', unit: '%', updateFrequency: 'daily', description: '用户粘性指标' },
  { code: 'M005', name: '次日留存', layer: 'L2', type: 'derived', owner: '王运营', formula: '次日活跃 / 当日新增', category: '用户域', domain: '用户域', unit: '%', updateFrequency: 'daily' },
  { code: 'M006', name: 'VIP用户数', layer: 'L1', type: 'atomic', owner: '王运营', formula: 'COUNT(user_id) WHERE customer_level=VIP', category: '用户域', domain: '用户域', unit: '人', updateFrequency: 'daily' },

  // ── 交易域 ──
  { code: 'M010', name: 'GMV', layer: 'L1', type: 'atomic', owner: '李产品', formula: 'SUM(订单金额) WHERE 订单状态=已支付', category: '交易域', domain: '交易域', unit: '元', updateFrequency: 'daily', tags: ['北极星'], description: '成交总额' },
  { code: 'M011', name: '客单价', layer: 'L2', type: 'derived', owner: '李产品', formula: 'GMV / 订单数', category: '交易域', domain: '交易域', unit: '元', updateFrequency: 'daily' },
  { code: 'M012', name: '订单数', layer: 'L1', type: 'atomic', owner: '李产品', formula: 'COUNT(订单ID)', category: '交易域', domain: '交易域', unit: '单', updateFrequency: 'hourly' },
  { code: 'M013', name: '退款率', layer: 'L2', type: 'derived', owner: '李产品', formula: '退款金额 / GMV', category: '交易域', domain: '交易域', unit: '%', updateFrequency: 'daily' },
  { code: 'M014', name: '复购率', layer: 'L3', type: 'derived', owner: '陈营销', formula: '复购用户 / 总用户', category: '交易域', domain: '交易域', unit: '%', updateFrequency: 'monthly' },

  // ── 风控域 ──
  { code: 'M020', name: '首逾率', layer: 'L3', type: 'derived', owner: '张风控', formula: '首期逾期客户 / 当期放款客户', category: '风控域', domain: '风控域', unit: '%', updateFrequency: 'daily', tags: ['核心风险'], description: '首期逾期率' },
  { code: 'M021', name: 'Vintage 30+', layer: 'L2', type: 'derived', owner: '张风控', formula: 'SUM(逾期30天以上金额) / 期初放款本金', category: '风控域', domain: '风控域', unit: '%', updateFrequency: 'monthly' },
  { code: 'M022', name: '授信通过率', layer: 'L2', type: 'derived', owner: '张风控', formula: '通过笔数 / 申请笔数', category: '风控域', domain: '风控域', unit: '%', updateFrequency: 'daily' },
  { code: 'M023', name: '欺诈识别率', layer: 'L2', type: 'derived', owner: '张风控', formula: '识别的欺诈案件 / 总欺诈案件', category: '风控域', domain: '风控域', unit: '%', updateFrequency: 'daily' },
  { code: 'M024', name: '平均授信额度', layer: 'L1', type: 'atomic', owner: '张风控', formula: 'AVG(授信额度)', category: '风控域', domain: '风控域', unit: '元', updateFrequency: 'daily' },

  // ── 营销域 ──
  { code: 'M030', name: '首单转化率', layer: 'L3', type: 'derived', owner: '陈营销', formula: '首单用户 / 新增用户', category: '营销域', domain: '营销域', unit: '%', updateFrequency: 'daily' },
  { code: 'M031', name: '渠道 ROI', layer: 'L2', type: 'derived', owner: '陈营销', formula: '渠道GMV / 渠道投入', category: '营销域', domain: '营销域', unit: '倍', updateFrequency: 'monthly' },
  { code: 'M032', name: '券核销率', layer: 'L2', type: 'derived', owner: '陈营销', formula: '核销张数 / 发放张数', category: '营销域', domain: '营销域', unit: '%', updateFrequency: 'daily' },
  { code: 'M033', name: '触达成本', layer: 'L1', type: 'atomic', owner: '陈营销', formula: 'SUM(投放成本) / SUM(触达人数)', category: '营销域', domain: '营销域', unit: '元/人', updateFrequency: 'daily' }
]

// ───────────────────────────── 2. 变量集(variables) ─────────────────────────────
export interface VariableItem {
  code: string
  name: string
  type: 'population' | 'behavior' | 'finance' | 'risk'
  dataType: 'enum' | 'string' | 'number' | 'derived'
  coverage: number
  owner: string
  description?: string
  tags?: string[]
}

export const VARIABLES: VariableItem[] = [
  // ── 人口属性 ──
  { code: 'V001', name: '年龄段', type: 'population', dataType: 'enum', coverage: 100, owner: '王运营', description: '18-24 / 25-30 / 31-40 / 41-50 / 51+' },
  { code: 'V002', name: '性别', type: 'population', dataType: 'enum', coverage: 100, owner: '王运营', description: '男 / 女 / 未知' },
  { code: 'V003', name: '地域', type: 'population', dataType: 'string', coverage: 98, owner: '王运营', description: '省份/城市级别' },
  { code: 'V004', name: '婚姻状况', type: 'population', dataType: 'enum', coverage: 75, owner: '王运营', description: '未婚 / 已婚 / 离异 / 丧偶' },
  { code: 'V005', name: '教育程度', type: 'population', dataType: 'enum', coverage: 82, owner: '王运营', description: '高中 / 大专 / 本科 / 硕士 / 博士' },

  // ── 行为变量 ──
  { code: 'V101', name: '近30天活跃天数', type: 'behavior', dataType: 'number', coverage: 92, owner: '王运营', description: '近30天内有活跃行为的天数' },
  { code: 'V102', name: '近30天登录次数', type: 'behavior', dataType: 'number', coverage: 88, owner: '王运营', description: '近30天内登录APP次数' },
  { code: 'V103', name: '最近下单距今', type: 'behavior', dataType: 'number', coverage: 92, owner: '李产品', description: '距离最近一次下单的天数' },
  { code: 'V104', name: '近7天访问深度', type: 'behavior', dataType: 'number', coverage: 85, owner: '王运营', description: '近7天内浏览页面层数总和' },
  { code: 'V105', name: '收藏品类数', type: 'behavior', dataType: 'number', coverage: 78, owner: '陈营销', description: '收藏夹中包含的品类数量' },

  // ── 金融属性 ──
  { code: 'V201', name: 'AUM', type: 'finance', dataType: 'number', coverage: 75, owner: '陈营销', description: '管理资产规模' },
  { code: 'V202', name: '活期余额', type: 'finance', dataType: 'number', coverage: 95, owner: '陈营销', description: '活期账户余额' },
  { code: 'V203', name: '理财余额', type: 'finance', dataType: 'number', coverage: 65, owner: '陈营销', description: '理财账户余额' },
  { code: 'V204', name: '近30天入金', type: 'finance', dataType: 'number', coverage: 88, owner: '陈营销', description: '近30天累计入金金额' },

  // ── 风险变量 ──
  { code: 'V301', name: '信用分', type: 'risk', dataType: 'number', coverage: 78, owner: '张风控', description: '基于XGBoost模型计算' },
  { code: 'V302', name: '风险等级', type: 'risk', dataType: 'enum', coverage: 85, owner: '张风控', description: 'low / medium / high' },
  { code: 'V303', name: '近1年逾期次数', type: 'risk', dataType: 'number', coverage: 100, owner: '张风控', description: '近365天内逾期次数' },
  { code: 'V304', name: '多头借贷指数', type: 'risk', dataType: 'number', coverage: 72, owner: '张风控', description: '近30天在多家机构的申请次数' }
]

// ───────────────────────────── 3. 特征集(features) ─────────────────────────────
export interface FeatureItem {
  code: string
  name: string
  type: 'raw' | 'derived' | 'embedding' | 'cross'
  scenario: 'risk' | 'marketing' | 'churn' | 'fraud'
  importance: number
  status: 'online' | 'offline'
  owner: string
  description?: string
  tags?: string[]
}

export const FEATURES: FeatureItem[] = [
  { code: 'F001', name: '近30天登录频次', type: 'raw', scenario: 'risk', importance: 85.3, status: 'online', owner: '张风控', description: '近30天内用户登录APP的总次数' },
  { code: 'F002', name: 'AUM增长率(3月)', type: 'derived', scenario: 'risk', importance: 78.2, status: 'online', owner: '张风控', description: '过去3个月AUM环比增长率' },
  { code: 'F003', name: '用户RFM分层', type: 'derived', scenario: 'marketing', importance: 92.1, status: 'online', owner: '陈营销', description: '基于最近一次消费/频次/金额的分层结果' },
  { code: 'F004', name: '行为序列 embedding', type: 'embedding', scenario: 'marketing', importance: 88.5, status: 'online', owner: '陈营销', description: '用户行为序列的稠密向量表示' },
  { code: 'F005', name: '设备指纹风险分', type: 'derived', scenario: 'fraud', importance: 95.8, status: 'online', owner: '数美', description: '基于设备指纹的欺诈风险评分' },
  { code: 'F006', name: 'IP地理编码', type: 'raw', scenario: 'fraud', importance: 65.2, status: 'online', owner: '数美', description: 'IP归属地省份/城市编码' },
  { code: 'F007', name: '近7天活跃度衰减', type: 'derived', scenario: 'churn', importance: 88.0, status: 'online', owner: '李产品', description: '活跃度相对上周的衰减幅度' },
  { code: 'F008', name: '客单价分位数', type: 'derived', scenario: 'marketing', importance: 81.5, status: 'online', owner: '陈营销', description: '客单价在同人群中的分位数' },
  { code: 'F009', name: '关系图谱节点度', type: 'raw', scenario: 'fraud', importance: 90.2, status: 'online', owner: '张风控', description: '用户在反欺诈图谱中的连接度' },
  { code: 'F010', name: '近1年投诉次数', type: 'raw', scenario: 'churn', importance: 76.8, status: 'online', owner: '客服', description: '近365天内有效投诉次数' },
  { code: 'F011', name: '收入水平分箱', type: 'derived', scenario: 'risk', importance: 72.4, status: 'offline', owner: '张风控', description: '基于消费/职业等估算的收入分箱' },
  { code: 'F012', name: 'APP使用时长(分)', type: 'raw', scenario: 'churn', importance: 68.5, status: 'online', owner: '王运营', description: '近30天单日均使用时长' }
]

// ───────────────────────────── 4. API 集(apis) ─────────────────────────────
export interface ApiItem {
  id: string
  name: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  path: string
  category: 'user' | 'risk' | 'trade' | 'marketing' | 'asset' | 'common'
  categoryLabel: string
  description: string
  monthlyCalls: number
  rating: number
  latency: number
  successRate: number
  qpsLimit: number
  owner: string
  applied?: boolean
  tags?: string[]
}

export const APIS: ApiItem[] = [
  { id: 'A001', name: '用户画像查询', method: 'GET', path: '/api/v1/user/profile', category: 'user', categoryLabel: '用户域', description: '查询用户的完整画像信息', monthlyCalls: 2500000, rating: 4.8, latency: 45, successRate: 99.95, qpsLimit: 10000, owner: '王运营', tags: ['高频', '核心'] },
  { id: 'A002', name: '授信查询', method: 'GET', path: '/api/v1/credit/score', category: 'risk', categoryLabel: '风控域', description: '查询用户实时授信评分和额度', monthlyCalls: 1800000, rating: 4.9, latency: 78, successRate: 99.80, qpsLimit: 8000, owner: '张风控', tags: ['高频'] },
  { id: 'A003', name: '交易流水查询', method: 'POST', path: '/api/v1/trade/list', category: 'trade', categoryLabel: '交易域', description: '查询用户的交易流水', monthlyCalls: 950000, rating: 4.6, latency: 62, successRate: 99.92, qpsLimit: 5000, owner: '李产品' },
  { id: 'A004', name: '优惠券发放', method: 'POST', path: '/api/v1/coupon/grant', category: 'marketing', categoryLabel: '营销域', description: '向用户发放优惠券', monthlyCalls: 720000, rating: 4.5, latency: 92, successRate: 99.65, qpsLimit: 3000, owner: '陈营销' },
  { id: 'A005', name: '用户标签查询', method: 'GET', path: '/api/v1/user/tags', category: 'user', categoryLabel: '用户域', description: '查询用户的所有标签', monthlyCalls: 3200000, rating: 4.9, latency: 28, successRate: 99.99, qpsLimit: 8000, owner: '王运营', tags: ['高频', '核心'] },
  { id: 'A006', name: '营销活动查询', method: 'GET', path: '/api/v1/marketing/activity', category: 'marketing', categoryLabel: '营销域', description: '查询进行中的营销活动', monthlyCalls: 580000, rating: 4.4, latency: 56, successRate: 99.85, qpsLimit: 4000, owner: '陈营销' },
  { id: 'A007', name: '资产负债查询', method: 'GET', path: '/api/v1/asset/balance', category: 'asset', categoryLabel: '资产域', description: '查询用户的资产负债明细', monthlyCalls: 410000, rating: 4.7, latency: 51, successRate: 99.90, qpsLimit: 6000, owner: '陈营销' },
  { id: 'A008', name: '通用字典查询', method: 'GET', path: '/api/v1/common/dict', category: 'common', categoryLabel: '通用', description: '查询通用数据字典项', monthlyCalls: 1200000, rating: 4.5, latency: 22, successRate: 99.99, qpsLimit: 12000, owner: '系统管理员' }
]

// ───────────────────────────── 5. 监管报表集(regulatory) ─────────────────────────────
export interface RegReportItem {
  id: string
  name: string
  code: string
  org: 'cbrc' | 'pboc' | 'cbirc'
  frequency: '月度' | '季度' | '半年度' | '年度' | '实时'
  fieldCount: number
  method: 'auto' | 'manual'
  status: 'running' | 'paused' | 'draft' | 'failed'
  nextRun: string
  owner: string
  description?: string
}

export const REG_REPORTS: RegReportItem[] = [
  // ── 银保监 ──
  { id: 'R001', name: '银保监 - 1104报表', code: 'CBRC_1104', org: 'cbrc', frequency: '月度', fieldCount: 85, method: 'auto', status: 'running', nextRun: '2026-09-01 02:00', owner: '王运营', description: '银行业非现场监管报表' },
  { id: 'R002', name: '银保监 - EAST5.0', code: 'CBRC_EAST', org: 'cbrc', frequency: '月度', fieldCount: 220, method: 'auto', status: 'running', nextRun: '2026-09-01 03:00', owner: '李产品', description: '银保监 EAST 数据标准化报送' },
  { id: 'R003', name: '银保监 - 客户风险评估', code: 'CBRC_RISK', org: 'cbrc', frequency: '季度', fieldCount: 56, method: 'auto', status: 'paused', nextRun: '2026-10-01 02:00', owner: '张风控' },
  { id: 'R004', name: '银保监 - 普惠金融', code: 'CBRC_INCL', org: 'cbrc', frequency: '季度', fieldCount: 38, method: 'auto', status: 'running', nextRun: '2026-09-15 02:00', owner: '陈营销' },
  { id: 'R005', name: '银保监 - 关联交易', code: 'CBRC_RPT', org: 'cbrc', frequency: '半年度', fieldCount: 42, method: 'manual', status: 'draft', nextRun: '2026-12-31 23:59', owner: '王运营' },

  // ── 人行 ──
  { id: 'R010', name: '人行 - 金融统计', code: 'PBOC_STAT', org: 'pboc', frequency: '月度', fieldCount: 120, method: 'auto', status: 'running', nextRun: '2026-09-05 02:00', owner: '李产品' },
  { id: 'R011', name: '人行 - 信贷收支', code: 'PBOC_CREDIT', org: 'pboc', frequency: '月度', fieldCount: 65, method: 'auto', status: 'running', nextRun: '2026-09-05 02:00', owner: '王运营' },
  { id: 'R012', name: '人行 - 利率报备', code: 'PBOC_RATE', org: 'pboc', frequency: '实时', fieldCount: 18, method: 'auto', status: 'running', nextRun: '实时', owner: '系统管理员' },
  { id: 'R013', name: '人行 - 反洗钱', code: 'PBOC_AML', org: 'pboc', frequency: '季度', fieldCount: 88, method: 'auto', status: 'failed', nextRun: '2026-09-30 02:00', owner: '张风控' },

  // ── 银保监(2) ──
  { id: 'R020', name: '银保监 - 资产质量', code: 'CBRC_QUALITY', org: 'cbirc', frequency: '季度', fieldCount: 72, method: 'auto', status: 'running', nextRun: '2026-09-30 02:00', owner: '张风控' },
  { id: 'R021', name: '银保监 - 资本充足率', code: 'CBRC_CAPITAL', org: 'cbirc', frequency: '季度', fieldCount: 35, method: 'manual', status: 'draft', nextRun: '2026-09-30 23:59', owner: '钱财务' }
]

// ───────────────────────────── 6. 集合(表集合) ─────────────────────────────
export interface CollectionItem {
  id: string
  name: string
  description: string
  type: '业务流程' | '数据域' | '指标' | '合规' | '资产'
  typeColor: string
  owner: string
  tableCount: number
  followers: { name: string; color: string }[]
}

export const COLLECTIONS: CollectionItem[] = [
  { id: '1', name: '贷前分析', description: '贷前准入、评级、授信相关数据', type: '业务流程', typeColor: 'red', owner: '王运营', tableCount: 156, followers: [{ name: '王', color: '#165dff' }, { name: '张', color: '#f53f3f' }, { name: '李', color: '#00b42a' }] },
  { id: '2', name: '风控评估', description: '风控模型、欺诈检测、预警数据', type: '业务流程', typeColor: 'red', owner: '张风控', tableCount: 89, followers: [{ name: '张', color: '#f53f3f' }, { name: '陈', color: '#722ed1' }] },
  { id: '3', name: '反欺诈策略', description: '欺诈规则、关联图谱、案件数据', type: '业务流程', typeColor: 'red', owner: '陈策略', tableCount: 234, followers: [{ name: '陈', color: '#722ed1' }, { name: '林', color: '#165dff' }, { name: '黄', color: '#00b42a' }, { name: '赵', color: '#fa8c16' }] },
  { id: '4', name: '客户主档域', description: '客户基本信息、画像主表', type: '数据域', typeColor: 'arcoblue', owner: '李产品', tableCount: 86, followers: [{ name: '王', color: '#165dff' }, { name: '李', color: '#00b42a' }] },
  { id: '5', name: '用户域核心表', description: '用户主档、画像、标签主表', type: '数据域', typeColor: 'arcoblue', owner: '王运营', tableCount: 128, followers: [{ name: '王', color: '#165dff' }, { name: '钱', color: '#f53f3f' }, { name: '孙', color: '#722ed1' }] },
  { id: '6', name: '交易域核心表', description: '订单、支付、清结算主表', type: '数据域', typeColor: 'arcoblue', owner: '李产品', tableCount: 256, followers: [{ name: '李', color: '#00b42a' }, { name: '周', color: '#165dff' }] },
  { id: '7', name: '指标体系', description: '业务指标、原子指标、衍生指标', type: '指标', typeColor: 'purple', owner: '王运营', tableCount: 312, followers: [{ name: '赵', color: '#fa8c16' }, { name: '吴', color: '#722ed1' }, { name: '郑', color: '#f53f3f' }] },
  { id: '8', name: '监管报送', description: 'EAST、反洗钱、人行报表数据', type: '合规', typeColor: 'orange', owner: '钱财务', tableCount: 47, followers: [{ name: '钱', color: '#f53f3f' }, { name: '冯', color: '#165dff' }] }
]

// ───────────────────────────── 通用工具 ─────────────────────────────
function byCode<T extends { code: string }>(list: T[], code: string): T | undefined {
  return list.find(x => x.code === code)
}
function byName<T extends { name: string }>(list: T[], name: string): T | undefined {
  return list.find(x => x.name === name)
}
function filterByKeyword<T extends Record<string, any>>(list: T[], keyword: string, fields: (keyof T)[]): T[] {
  const k = (keyword || '').trim().toLowerCase()
  if (!k) return list
  return list.filter(item => fields.some(f => {
    const v = item[f]
    return typeof v === 'string' && v.toLowerCase().includes(k)
  }))
}

// 指标
export const MetricStore = {
  all: () => METRICS,
  byCode: (code: string) => byCode(METRICS, code),
  byName: (name: string) => byName(METRICS, name),
  byDomain: (domain: string) => METRICS.filter(m => m.domain === domain),
  byOwner: (owner: string) => METRICS.filter(m => m.owner === owner),
  search: (kw: string) => filterByKeyword(METRICS, kw, ['code', 'name', 'category', 'owner', 'description', 'formula'])
}

// 变量
export const VariableStore = {
  all: () => VARIABLES,
  byCode: (code: string) => byCode(VARIABLES, code),
  byName: (name: string) => byName(VARIABLES, name),
  byType: (t: VariableItem['type']) => VARIABLES.filter(v => v.type === t),
  search: (kw: string) => filterByKeyword(VARIABLES, kw, ['code', 'name', 'owner', 'description'])
}

// 特征
export const FeatureStore = {
  all: () => FEATURES,
  byCode: (code: string) => byCode(FEATURES, code),
  byName: (name: string) => byName(FEATURES, name),
  byScenario: (s: FeatureItem['scenario']) => FEATURES.filter(f => f.scenario === s),
  search: (kw: string) => filterByKeyword(FEATURES, kw, ['code', 'name', 'owner', 'description'])
}

// API
export const ApiStore = {
  all: () => APIS,
  byId: (id: string) => APIS.find(a => a.id === id),
  byCategory: (c: ApiItem['category']) => APIS.filter(a => a.category === c),
  search: (kw: string) => filterByKeyword(APIS, kw, ['id', 'name', 'path', 'categoryLabel', 'owner', 'description'])
}

// 监管报表
export const RegReportStore = {
  all: () => REG_REPORTS,
  byOrg: (org: RegReportItem['org']) => REG_REPORTS.filter(r => r.org === org),
  byId: (id: string) => REG_REPORTS.find(r => r.id === id),
  byCode: (code: string) => REG_REPORTS.find(r => r.code === code),
  search: (kw: string) => filterByKeyword(REG_REPORTS, kw, ['id', 'name', 'code', 'owner', 'description'])
}

// 集合
export const CollectionStore = {
  all: () => COLLECTIONS,
  byId: (id: string) => COLLECTIONS.find(c => c.id === id),
  byOwner: (owner: string) => COLLECTIONS.filter(c => c.owner === owner),
  search: (kw: string) => filterByKeyword(COLLECTIONS, kw, ['id', 'name', 'description', 'owner'])
}