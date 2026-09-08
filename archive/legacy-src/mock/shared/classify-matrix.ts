/**
 * F1 数据安全分级矩阵表 Mock
 * 30 条规范定义条目
 */
import type { ClassifyMatrixItem } from './classify-types'

export const classifyMatrixData: ClassifyMatrixItem[] = [
  // 客户信息
  { id: 'M001', category_l1: '客户信息', category_l2: '个人PII', category_l3: '身份信息', category_l4: '身份证号', sensitivity_level: 'L4', usage_count: 24, description: '中华人民共和国居民身份证号' },
  { id: 'M002', category_l1: '客户信息', category_l2: '个人PII', category_l3: '身份信息', category_l4: '护照号', sensitivity_level: 'L4', usage_count: 6 },
  { id: 'M003', category_l1: '客户信息', category_l2: '个人PII', category_l3: '联系方式', category_l4: '手机号', sensitivity_level: 'L3', usage_count: 38 },
  { id: 'M004', category_l1: '客户信息', category_l2: '个人PII', category_l3: '联系方式', category_l4: '邮箱', sensitivity_level: 'L3', usage_count: 22 },
  { id: 'M005', category_l1: '客户信息', category_l2: '个人PII', category_l3: '联系方式', category_l4: '家庭住址', sensitivity_level: 'L3', usage_count: 12 },
  { id: 'M006', category_l1: '客户信息', category_l2: '个人PII', category_l3: '生物特征', category_l4: '指纹', sensitivity_level: 'L4', usage_count: 3 },
  { id: 'M007', category_l1: '客户信息', category_l2: '个人PII', category_l3: '生物特征', category_l4: '人脸图像', sensitivity_level: 'L4', usage_count: 5 },
  { id: 'M008', category_l1: '客户信息', category_l2: '基础属性', category_l3: '用户标识', category_l4: '用户ID', sensitivity_level: 'L2', usage_count: 56 },
  { id: 'M009', category_l1: '客户信息', category_l2: '基础属性', category_l3: '用户标识', category_l4: '客户编号', sensitivity_level: 'L2', usage_count: 30 },
  // 业务交易
  { id: 'M010', category_l1: '业务交易', category_l2: '订单', category_l3: '订单信息', category_l4: '订单号', sensitivity_level: 'L2', usage_count: 28 },
  { id: 'M011', category_l1: '业务交易', category_l2: '订单', category_l3: '支付信息', category_l4: '支付金额', sensitivity_level: 'L3', usage_count: 18 },
  { id: 'M012', category_l1: '业务交易', category_l2: '订单', category_l3: '支付信息', category_l4: '银行卡号', sensitivity_level: 'L4', usage_count: 14 },
  { id: 'M013', category_l1: '业务交易', category_l2: '订单', category_l3: '支付信息', category_l4: 'CVV', sensitivity_level: 'L4', usage_count: 2 },
  { id: 'M014', category_l1: '业务交易', category_l2: '订单', category_l3: '交易明细', category_l4: '交易时间', sensitivity_level: 'L1', usage_count: 60 },
  { id: 'M015', category_l1: '业务交易', category_l2: '订单', category_l3: '交易明细', category_l4: '交易状态', sensitivity_level: 'L1', usage_count: 48 },
  // 财务
  { id: 'M016', category_l1: '财务', category_l2: '账户', category_l3: '余额信息', category_l4: '账户余额', sensitivity_level: 'L4', usage_count: 18 },
  { id: 'M017', category_l1: '财务', category_l2: '账户', category_l3: '余额信息', category_l4: '可用余额', sensitivity_level: 'L4', usage_count: 12 },
  { id: 'M018', category_l1: '财务', category_l2: '账户', category_l3: '账户信息', category_l4: '账户号', sensitivity_level: 'L4', usage_count: 22 },
  { id: 'M019', category_l1: '财务', category_l2: '账单', category_l3: '账单信息', category_l4: '账单金额', sensitivity_level: 'L3', usage_count: 16 },
  { id: 'M020', category_l1: '财务', category_l2: '账单', category_l3: '账单信息', category_l4: '账单周期', sensitivity_level: 'L1', usage_count: 14 },
  // 风控
  { id: 'M021', category_l1: '风控', category_l2: '模型输入', category_l3: '评分特征', category_l4: '信用评分', sensitivity_level: 'L3', usage_count: 26 },
  { id: 'M022', category_l1: '风控', category_l2: '模型输入', category_l3: '评分特征', category_l4: '欺诈评分', sensitivity_level: 'L3', usage_count: 18 },
  { id: 'M023', category_l1: '风控', category_l2: '模型输出', category_l3: '决策结果', category_l4: '授信额度', sensitivity_level: 'L4', usage_count: 8 },
  { id: 'M024', category_l1: '风控', category_l2: '模型输出', category_l3: '决策结果', category_l4: '利率', sensitivity_level: 'L3', usage_count: 8 },
  // 运营
  { id: 'M025', category_l1: '运营', category_l2: '营销触达', category_l3: '客户标签', category_l4: '营销偏好', sensitivity_level: 'L2', usage_count: 32 },
  { id: 'M026', category_l1: '运营', category_l2: '营销触达', category_l3: '客户标签', category_l4: 'RFM分层', sensitivity_level: 'L2', usage_count: 20 },
  { id: 'M027', category_l1: '运营', category_l2: '营销触达', category_l3: '渠道', category_l4: '渠道来源', sensitivity_level: 'L1', usage_count: 26 },
  { id: 'M028', category_l1: '运营', category_l2: '行为', category_l3: '行为埋点', category_l4: '页面浏览', sensitivity_level: 'L1', usage_count: 40 },
  { id: 'M029', category_l1: '运营', category_l2: '行为', category_l3: '行为埋点', category_l4: '点击事件', sensitivity_level: 'L1', usage_count: 35 },
  { id: 'M030', category_l1: '运营', category_l2: '客户标签', category_l3: '人口属性', category_l4: '年龄段', sensitivity_level: 'L2', usage_count: 15 }
]

/** 一级分类列表（去重） */
export const matrixL1List = Array.from(new Set(classifyMatrixData.map(i => i.category_l1)))
