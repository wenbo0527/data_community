/**
 * 标签 Directory 补齐(Mock 数据缺口 P0)
 *
 * 原探索侧的 tag-system 内置 mock,但没有跨模块共享。
 * 本文件建立 30+ 个标签,3 个标签组。
 */

import type { MockMethod } from 'vite-plugin-mock'

export type TagDataType = 'boolean' | 'enum' | 'numeric' | 'date' | 'string'
export type TagRefreshType = 'static' | 'daily' | 'weekly' | 'realtime'

export interface TagDefinition {
  id: string
  name: string
  code: string
  groupId: string
  groupName: string
  description: string
  dataType: TagDataType
  enumValues?: Array<{ value: string; label: string }> // 枚举型标签
  refreshType: TagRefreshType
  visibility: 'public' | 'department' | 'private'
  ownerId: string
  ownerName: string
  sourceTable: string
  createTime: string
  updateTime: string
  active: boolean
  userCount: number // 命中用户数
}

export interface TagGroup {
  id: string
  name: string
  description: string
  ownerId: string
  ownerName: string
  tagCount: number
}

export const TAG_GROUPS: TagGroup[] = [
  { id: 'grp_basic', name: '用户基础属性', description: '用户的人口统计学属性', ownerId: 'user-zhangsan', ownerName: '张三', tagCount: 10 },
  { id: 'grp_behavior', name: '用户行为偏好', description: '用户的操作行为与产品偏好', ownerId: 'user-zhaosi', ownerName: '赵六', tagCount: 12 },
  { id: 'grp_value', name: '用户价值分层', description: '基于消费/资产的价值分层', ownerId: 'user-wangwu', ownerName: '王五', tagCount: 8 },
  { id: 'grp_risk', name: '风险标签', description: '基于风控模型的风险标记', ownerId: 'user-fengkong', ownerName: '风控值班', tagCount: 10 }
]

export const TAGS: TagDefinition[] = [
  // === 用户基础属性(10 个) ===
  {
    id: 'tag_001', name: '是否新客', code: 'is_new_user', groupId: 'grp_basic', groupName: '用户基础属性',
    description: '注册时间 < 30 天的用户', dataType: 'boolean',
    refreshType: 'daily', visibility: 'public', ownerId: 'user-zhangsan', ownerName: '张三',
    sourceTable: 'dim_user', createTime: '2024-01-01', updateTime: '2025-07-01',
    active: true, userCount: 8
  },
  {
    id: 'tag_002', name: '性别', code: 'gender', groupId: 'grp_basic', groupName: '用户基础属性',
    description: '用户性别', dataType: 'enum',
    enumValues: [
      { value: 'M', label: '男' },
      { value: 'F', label: '女' }
    ],
    refreshType: 'daily', visibility: 'public', ownerId: 'user-zhangsan', ownerName: '张三',
    sourceTable: 'dim_user', createTime: '2024-01-01', updateTime: '2025-07-01',
    active: true, userCount: 50
  },
  {
    id: 'tag_003', name: '年龄段', code: 'age_group', groupId: 'grp_basic', groupName: '用户基础属性',
    description: '用户年龄段分层', dataType: 'enum',
    enumValues: [
      { value: '18-25', label: '青年(18-25)' },
      { value: '26-35', label: '青壮年(26-35)' },
      { value: '36-45', label: '中年(36-45)' },
      { value: '46+', label: '中老年(46+)' }
    ],
    refreshType: 'daily', visibility: 'public', ownerId: 'user-zhangsan', ownerName: '张三',
    sourceTable: 'dim_user', createTime: '2024-01-01', updateTime: '2025-07-01',
    active: true, userCount: 50
  },
  {
    id: 'tag_004', name: '地域(一线)', code: 'is_top1_city', groupId: 'grp_basic', groupName: '用户基础属性',
    description: '是否居住在一线城市(北上广深)', dataType: 'boolean',
    refreshType: 'daily', visibility: 'public', ownerId: 'user-zhangsan', ownerName: '张三',
    sourceTable: 'dim_user', createTime: '2024-01-01', updateTime: '2025-07-01',
    active: true, userCount: 32
  },
  {
    id: 'tag_005', name: 'VIP 用户', code: 'is_vip', groupId: 'grp_basic', groupName: '用户基础属性',
    description: '总授信 > 30 万的用户', dataType: 'boolean',
    refreshType: 'daily', visibility: 'public', ownerId: 'user-zhangsan', ownerName: '张三',
    sourceTable: 'dim_user', createTime: '2024-01-01', updateTime: '2025-07-01',
    active: true, userCount: 14
  },
  {
    id: 'tag_006', name: '学历(本科以上)', code: 'is_high_edu', groupId: 'grp_basic', groupName: '用户基础属性',
    description: '学历为本科以上的用户', dataType: 'boolean',
    refreshType: 'daily', visibility: 'public', ownerId: 'user-zhangsan', ownerName: '张三',
    sourceTable: 'dim_user', createTime: '2024-01-01', updateTime: '2025-07-01',
    active: true, userCount: 35
  },
  {
    id: 'tag_007', name: '职业稳定性', code: 'job_stability', groupId: 'grp_basic', groupName: '用户基础属性',
    description: '职业稳定性评分(高/中/低)', dataType: 'enum',
    enumValues: [
      { value: 'high', label: '高' },
      { value: 'medium', label: '中' },
      { value: 'low', label: '低' }
    ],
    refreshType: 'weekly', visibility: 'public', ownerId: 'user-zhangsan', ownerName: '张三',
    sourceTable: 'dim_user', createTime: '2024-01-01', updateTime: '2025-07-01',
    active: true, userCount: 50
  },
  {
    id: 'tag_008', name: '已婚', code: 'is_married', groupId: 'grp_basic', groupName: '用户基础属性',
    description: '婚姻状态为已婚', dataType: 'boolean',
    refreshType: 'weekly', visibility: 'public', ownerId: 'user-zhangsan', ownerName: '张三',
    sourceTable: 'dim_user', createTime: '2024-01-01', updateTime: '2025-07-01',
    active: true, userCount: 30
  },
  {
    id: 'tag_009', name: '有车', code: 'has_car', groupId: 'grp_basic', groupName: '用户基础属性',
    description: '拥有车辆', dataType: 'boolean',
    refreshType: 'weekly', visibility: 'public', ownerId: 'user-zhangsan', ownerName: '张三',
    sourceTable: 'dim_user', createTime: '2024-01-01', updateTime: '2025-07-01',
    active: true, userCount: 20
  },
  {
    id: 'tag_010', name: '有房', code: 'has_house', groupId: 'grp_basic', groupName: '用户基础属性',
    description: '拥有房产', dataType: 'boolean',
    refreshType: 'weekly', visibility: 'public', ownerId: 'user-zhangsan', ownerName: '张三',
    sourceTable: 'dim_user', createTime: '2024-01-01', updateTime: '2025-07-01',
    active: true, userCount: 25
  },

  // === 用户行为偏好(12 个) ===
  {
    id: 'tag_011', name: '近 7 天活跃', code: 'active_7d', groupId: 'grp_behavior', groupName: '用户行为偏好',
    description: '近 7 天有登录或操作', dataType: 'boolean',
    refreshType: 'realtime', visibility: 'public', ownerId: 'user-zhaosi', ownerName: '赵六',
    sourceTable: 'fact_user_event', createTime: '2024-01-01', updateTime: '2025-07-01',
    active: true, userCount: 38
  },
  {
    id: 'tag_012', name: '近 30 天活跃', code: 'active_30d', groupId: 'grp_behavior', groupName: '用户行为偏好',
    description: '近 30 天有登录或操作', dataType: 'boolean',
    refreshType: 'realtime', visibility: 'public', ownerId: 'user-zhaosi', ownerName: '赵六',
    sourceTable: 'fact_user_event', createTime: '2024-01-01', updateTime: '2025-07-01',
    active: true, userCount: 45
  },
  {
    id: 'tag_013', name: '移动端偏好', code: 'prefer_mobile', groupId: 'grp_behavior', groupName: '用户行为偏好',
    description: '主要在移动端操作', dataType: 'boolean',
    refreshType: 'daily', visibility: 'public', ownerId: 'user-zhaosi', ownerName: '赵六',
    sourceTable: 'fact_user_event', createTime: '2024-01-01', updateTime: '2025-07-01',
    active: true, userCount: 40
  },
  {
    id: 'tag_014', name: 'PC 端偏好', code: 'prefer_pc', groupId: 'grp_behavior', groupName: '用户行为偏好',
    description: '主要在 PC 端操作', dataType: 'boolean',
    refreshType: 'daily', visibility: 'public', ownerId: 'user-zhaosi', ownerName: '赵六',
    sourceTable: 'fact_user_event', createTime: '2024-01-01', updateTime: '2025-07-01',
    active: true, userCount: 10
  },
  {
    id: 'tag_015', name: '近 30 天消费金额', code: 'consume_30d_amt', groupId: 'grp_behavior', groupName: '用户行为偏好',
    description: '近 30 天累计消费金额', dataType: 'numeric',
    refreshType: 'daily', visibility: 'department', ownerId: 'user-zhaosi', ownerName: '赵六',
    sourceTable: 'fact_user_event', createTime: '2024-01-01', updateTime: '2025-07-01',
    active: true, userCount: 50
  },
  {
    id: 'tag_016', name: '近 30 天消费频次', code: 'consume_30d_freq', groupId: 'grp_behavior', groupName: '用户行为偏好',
    description: '近 30 天消费次数', dataType: 'numeric',
    refreshType: 'daily', visibility: 'department', ownerId: 'user-zhaosi', ownerName: '赵六',
    sourceTable: 'fact_user_event', createTime: '2024-01-01', updateTime: '2025-07-01',
    active: true, userCount: 50
  },
  {
    id: 'tag_017', name: '高客单价用户', code: 'high_aov_user', groupId: 'grp_behavior', groupName: '用户行为偏好',
    description: '近 30 天客单价 > 5000', dataType: 'boolean',
    refreshType: 'daily', visibility: 'department', ownerId: 'user-zhaosi', ownerName: '赵六',
    sourceTable: 'fact_user_event', createTime: '2024-01-01', updateTime: '2025-07-01',
    active: true, userCount: 12
  },
  {
    id: 'tag_018', name: '价格敏感型', code: 'price_sensitive', groupId: 'grp_behavior', groupName: '用户行为偏好',
    description: '消费偏好价格型(优惠敏感)', dataType: 'boolean',
    refreshType: 'weekly', visibility: 'public', ownerId: 'user-zhaosi', ownerName: '赵六',
    sourceTable: 'fact_user_event', createTime: '2024-01-01', updateTime: '2025-07-01',
    active: true, userCount: 28
  },
  {
    id: 'tag_019', name: '品质型用户', code: 'quality_user', groupId: 'grp_behavior', groupName: '用户行为偏好',
    description: '消费偏好品质型', dataType: 'boolean',
    refreshType: 'weekly', visibility: 'public', ownerId: 'user-zhaosi', ownerName: '赵六',
    sourceTable: 'fact_user_event', createTime: '2024-01-01', updateTime: '2025-07-01',
    active: true, userCount: 22
  },
  {
    id: 'tag_020', name: '理财偏好', code: 'prefer_finance', groupId: 'grp_behavior', groupName: '用户行为偏好',
    description: '经常使用理财产品', dataType: 'boolean',
    refreshType: 'daily', visibility: 'public', ownerId: 'user-zhaosi', ownerName: '赵六',
    sourceTable: 'fact_user_event', createTime: '2024-01-01', updateTime: '2025-07-01',
    active: true, userCount: 20
  },
  {
    id: 'tag_021', name: '贷款偏好', code: 'prefer_loan', groupId: 'grp_behavior', groupName: '用户行为偏好',
    description: '经常使用贷款产品', dataType: 'boolean',
    refreshType: 'daily', visibility: 'public', ownerId: 'user-zhaosi', ownerName: '赵六',
    sourceTable: 'fact_user_event', createTime: '2024-01-01', updateTime: '2025-07-01',
    active: true, userCount: 25
  },
  {
    id: 'tag_022', name: '支付偏好', code: 'prefer_payment', groupId: 'grp_behavior', groupName: '用户行为偏好',
    description: '经常使用支付产品', dataType: 'boolean',
    refreshType: 'daily', visibility: 'public', ownerId: 'user-zhaosi', ownerName: '赵六',
    sourceTable: 'fact_user_event', createTime: '2024-01-01', updateTime: '2025-07-01',
    active: true, userCount: 35
  },

  // === 用户价值分层(8 个) ===
  {
    id: 'tag_023', name: '价值层级', code: 'value_level', groupId: 'grp_value', groupName: '用户价值分层',
    description: '用户价值分层 A/B/C/D', dataType: 'enum',
    enumValues: [
      { value: 'A', label: 'A 级(高价值)' },
      { value: 'B', label: 'B 级(中高价值)' },
      { value: 'C', label: 'C 级(中价值)' },
      { value: 'D', label: 'D 级(低价值)' }
    ],
    refreshType: 'daily', visibility: 'public', ownerId: 'user-wangwu', ownerName: '王五',
    sourceTable: 'dws_user_value', createTime: '2024-01-01', updateTime: '2025-07-01',
    active: true, userCount: 50
  },
  {
    id: 'tag_024', name: 'RFM 客户类型', code: 'rfm_type', groupId: 'grp_value', groupName: '用户价值分层',
    description: '基于 RFM 模型的客户分类', dataType: 'enum',
    enumValues: [
      { value: 'champion', label: '冠军客户' },
      { value: 'loyal', label: '忠诚客户' },
      { value: 'potential', label: '潜力客户' },
      { value: 'at_risk', label: '流失风险' },
      { value: 'hibernating', label: '休眠客户' }
    ],
    refreshType: 'weekly', visibility: 'department', ownerId: 'user-wangwu', ownerName: '王五',
    sourceTable: 'dws_user_value', createTime: '2024-01-01', updateTime: '2025-07-01',
    active: true, userCount: 50
  },
  {
    id: 'tag_025', name: '累计消费金额', code: 'total_consume', groupId: 'grp_value', groupName: '用户价值分层',
    description: '累计消费总金额', dataType: 'numeric',
    refreshType: 'daily', visibility: 'department', ownerId: 'user-wangwu', ownerName: '王五',
    sourceTable: 'dws_user_value', createTime: '2024-01-01', updateTime: '2025-07-01',
    active: true, userCount: 50
  },
  {
    id: 'tag_026', name: '高价值潜力用户', code: 'high_potential', groupId: 'grp_value', groupName: '用户价值分层',
    description: '年龄 25-35 + 一线城市 + 本科以上', dataType: 'boolean',
    refreshType: 'daily', visibility: 'department', ownerId: 'user-wangwu', ownerName: '王五',
    sourceTable: 'dws_user_value', createTime: '2024-01-01', updateTime: '2025-07-01',
    active: true, userCount: 18
  },
  {
    id: 'tag_027', name: '生命周期', code: 'lifecycle_stage', groupId: 'grp_value', groupName: '用户价值分层',
    description: '用户生命周期阶段', dataType: 'enum',
    enumValues: [
      { value: 'new', label: '新客' },
      { value: 'growing', label: '成长期' },
      { value: 'mature', label: '成熟期' },
      { value: 'churn_risk', label: '流失风险' }
    ],
    refreshType: 'weekly', visibility: 'public', ownerId: 'user-wangwu', ownerName: '王五',
    sourceTable: 'dws_user_value', createTime: '2024-01-01', updateTime: '2025-07-01',
    active: true, userCount: 50
  },
  {
    id: 'tag_028', name: '授信总额', code: 'total_credit', groupId: 'grp_value', groupName: '用户价值分层',
    description: '授信总额', dataType: 'numeric',
    refreshType: 'daily', visibility: 'department', ownerId: 'user-wangwu', ownerName: '王五',
    sourceTable: 'dws_user_credit', createTime: '2024-01-01', updateTime: '2025-07-01',
    active: true, userCount: 50
  },
  {
    id: 'tag_029', name: '高净值用户', code: 'is_hnw', groupId: 'grp_value', groupName: '用户价值分层',
    description: '总授信 > 100 万', dataType: 'boolean',
    refreshType: 'daily', visibility: 'private', ownerId: 'user-wangwu', ownerName: '王五',
    sourceTable: 'dws_user_credit', createTime: '2024-01-01', updateTime: '2025-07-01',
    active: true, userCount: 6
  },
  {
    id: 'tag_030', name: '客单价', code: 'aov', groupId: 'grp_value', groupName: '用户价值分层',
    description: '平均客单价', dataType: 'numeric',
    refreshType: 'daily', visibility: 'department', ownerId: 'user-wangwu', ownerName: '王五',
    sourceTable: 'dws_user_value', createTime: '2024-01-01', updateTime: '2025-07-01',
    active: true, userCount: 50
  },

  // === 风险标签(10 个) ===
  {
    id: 'tag_031', name: '信用等级', code: 'credit_level', groupId: 'grp_risk', groupName: '风险标签',
    description: '用户信用等级', dataType: 'enum',
    enumValues: [
      { value: 'excellent', label: '优秀' },
      { value: 'good', label: '良好' },
      { value: 'normal', label: '一般' },
      { value: 'poor', label: '较差' }
    ],
    refreshType: 'daily', visibility: 'department', ownerId: 'user-fengkong', ownerName: '风控值班',
    sourceTable: 'dws_risk_score', createTime: '2024-01-01', updateTime: '2025-07-01',
    active: true, userCount: 50
  },
  {
    id: 'tag_032', name: '信用评分', code: 'credit_score', groupId: 'grp_risk', groupName: '风险标签',
    description: '用户信用评分(0-1000)', dataType: 'numeric',
    refreshType: 'daily', visibility: 'private', ownerId: 'user-fengkong', ownerName: '风控值班',
    sourceTable: 'dws_risk_score', createTime: '2024-01-01', updateTime: '2025-07-01',
    active: true, userCount: 50
  },
  {
    id: 'tag_033', name: '欺诈风险', code: 'fraud_risk', groupId: 'grp_risk', groupName: '风险标签',
    description: '是否存在欺诈风险', dataType: 'enum',
    enumValues: [
      { value: 'low', label: '低' },
      { value: 'medium', label: '中' },
      { value: 'high', label: '高' }
    ],
    refreshType: 'realtime', visibility: 'private', ownerId: 'user-fengkong', ownerName: '风控值班',
    sourceTable: 'dwd_fraud_alert', createTime: '2024-01-01', updateTime: '2025-07-01',
    active: true, userCount: 50
  },
  {
    id: 'tag_034', name: '逾期用户', code: 'is_overdue', groupId: 'grp_risk', groupName: '风险标签',
    description: '当前存在逾期的用户', dataType: 'boolean',
    refreshType: 'daily', visibility: 'department', ownerId: 'user-fengkong', ownerName: '风控值班',
    sourceTable: 'dws_repayment_plan', createTime: '2024-01-01', updateTime: '2025-07-01',
    active: true, userCount: 8
  },
  {
    id: 'tag_035', name: '逾期天数', code: 'overdue_days', groupId: 'grp_risk', groupName: '风险标签',
    description: '当前逾期天数', dataType: 'numeric',
    refreshType: 'daily', visibility: 'private', ownerId: 'user-fengkong', ownerName: '风控值班',
    sourceTable: 'dws_post_loan_monitor', createTime: '2024-01-01', updateTime: '2025-07-01',
    active: true, userCount: 8
  },
  {
    id: 'tag_036', name: '严重逾期', code: 'is_severe_overdue', groupId: 'grp_risk', groupName: '风险标签',
    description: '逾期天数 > 30 天', dataType: 'boolean',
    refreshType: 'daily', visibility: 'department', ownerId: 'user-fengkong', ownerName: '风控值班',
    sourceTable: 'dws_post_loan_monitor', createTime: '2024-01-01', updateTime: '2025-07-01',
    active: true, userCount: 5
  },
  {
    id: 'tag_037', name: '失信人', code: 'is_dishonest', groupId: 'grp_risk', groupName: '风险标签',
    description: '是否失信被执行人', dataType: 'boolean',
    refreshType: 'weekly', visibility: 'private', ownerId: 'user-fengkong', ownerName: '风控值班',
    sourceTable: 'dws_risk_score', createTime: '2024-01-01', updateTime: '2025-07-01',
    active: true, userCount: 2
  },
  {
    id: 'tag_038', name: '多头借贷', code: 'multi_borrow', groupId: 'grp_risk', groupName: '风险标签',
    description: '在多个平台有借贷', dataType: 'boolean',
    refreshType: 'weekly', visibility: 'private', ownerId: 'user-fengkong', ownerName: '风控值班',
    sourceTable: 'dws_risk_score', createTime: '2024-01-01', updateTime: '2025-07-01',
    active: true, userCount: 6
  },
  {
    id: 'tag_039', name: '催收中', code: 'is_collection', groupId: 'grp_risk', groupName: '风险标签',
    description: '是否在催收中', dataType: 'boolean',
    refreshType: 'realtime', visibility: 'private', ownerId: 'user-fengkong', ownerName: '风控值班',
    sourceTable: 'dws_post_loan_monitor', createTime: '2024-01-01', updateTime: '2025-07-01',
    active: true, userCount: 4
  },
  {
    id: 'tag_040', name: '流失风险', code: 'churn_risk', groupId: 'grp_risk', groupName: '风险标签',
    description: '基于行为预测的流失风险', dataType: 'enum',
    enumValues: [
      { value: 'low', label: '低风险' },
      { value: 'medium', label: '中风险' },
      { value: 'high', label: '高风险' }
    ],
    refreshType: 'weekly', visibility: 'department', ownerId: 'user-fengkong', ownerName: '风控值班',
    sourceTable: 'dws_user_value', createTime: '2024-01-01', updateTime: '2025-07-01',
    active: true, userCount: 50
  }
]

export const TagDirectoryStore = {
  list(): TagDefinition[] {
    return TAGS
  },

  byId(id: string): TagDefinition | undefined {
    return TAGS.find(t => t.id === id)
  },

  byCode(code: string): TagDefinition | undefined {
    return TAGS.find(t => t.code === code)
  },

  byGroup(groupId: string): TagDefinition[] {
    return TAGS.filter(t => t.groupId === groupId)
  },

  byOwner(ownerId: string): TagDefinition[] {
    return TAGS.filter(t => t.ownerId === ownerId)
  },

  byDataType(dataType: string): TagDefinition[] {
    return TAGS.filter(t => t.dataType === dataType)
  },

  groups(): TagGroup[] {
    return TAG_GROUPS
  },

  groupById(id: string): TagGroup | undefined {
    return TAG_GROUPS.find(g => g.id === id)
  },

  search(keyword: string): TagDefinition[] {
    const lower = keyword.toLowerCase()
    return TAGS.filter(t =>
      t.name.toLowerCase().includes(lower) ||
      t.code.toLowerCase().includes(lower) ||
      t.description.toLowerCase().includes(lower)
    )
  },

  stats() {
    return {
      total: TAGS.length,
      activeCount: TAGS.filter(t => t.active).length,
      byGroup: TAG_GROUPS.map(g => ({
        groupId: g.id,
        groupName: g.name,
        count: this.byGroup(g.id).length
      })),
      byDataType: {
        boolean: this.byDataType('boolean').length,
        enum: this.byDataType('enum').length,
        numeric: this.byDataType('numeric').length,
        date: this.byDataType('date').length,
        string: this.byDataType('string').length
      }
    }
  }
}

export const tagDirectoryMocks: MockMethod[] = [
  {
    url: '/api/tag-directory/list',
    method: 'get',
    response: ({ query }: { query: { groupId?: string; dataType?: string; keyword?: string } }) => {
      let result = TAGS
      if (query.groupId) result = result.filter(t => t.groupId === query.groupId)
      if (query.dataType) result = result.filter(t => t.dataType === query.dataType)
      if (query.keyword) {
        const lower = query.keyword.toLowerCase()
        result = result.filter(t =>
          t.name.toLowerCase().includes(lower) ||
          t.code.toLowerCase().includes(lower)
        )
      }
      return { code: 0, data: result, total: result.length }
    }
  },
  {
    url: '/api/tag-directory/groups',
    method: 'get',
    response: () => ({ code: 0, data: TAG_GROUPS })
  },
  {
    url: '/api/tag-directory/stats',
    method: 'get',
    response: () => ({ code: 0, data: TagDirectoryStore.stats() })
  }
]