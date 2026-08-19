/**
 * Feature Center 公共常量和工具函数
 * 消除 index.vue / edit.vue / create.vue / detail.vue 间的重复代码
 */

// ============ 数据类型映射 ============

/** 数据类型(dataType) → 特征类型(featureType) */
export const typeMap = (dt) => {
  if (dt === 'timestamp') return 'time'
  if (dt === 'string') return 'categorical'
  if (dt === 'int' || dt === 'double') return 'numerical'
  return 'numerical'
}

/** 特征类型(featureType) → 数据类型(dataType) 反向映射 */
export const reverseTypeMap = (type) => {
  if (type === 'time') return 'timestamp'
  if (type === 'categorical') return 'string'
  if (type === 'numerical') return 'double'
  return 'string'
}

// ============ 标签与颜色映射 ============

export const getTypeColor = (type) => {
  const colors = { numerical: 'blue', categorical: 'green', text: 'orange', time: 'purple' }
  return colors[type] || 'gray'
}

export const getTypeLabel = (type) => {
  const labels = { numerical: '数值型', categorical: '分类型', text: '文本型', time: '时间型' }
  return labels[type] || type
}

export const getStatusColor = (status) => {
  const colors = { active: 'green', inactive: 'red', draft: 'orange', pending: 'blue', expired: 'gray' }
  return colors[status] || 'gray'
}

export const getStatusLabel = (status) => {
  const labels = { active: '有效', inactive: '无效', draft: '草稿', pending: '待审核', expired: '已过期' }
  return labels[status] || status
}

export const getModelTypeColor = (modelType) => {
  const colors = { daily: 'blue', monthly: 'green', other: 'orange' }
  return colors[modelType] || 'gray'
}

export const getModelTypeLabel = (modelType) => {
  const labels = { daily: '日模型', monthly: '月模型', other: '其他模型' }
  return labels[modelType] || modelType
}

export const tableTypeLabel = (t) => ({ stream: '流水表', slow_change: '拉链表', snapshot: '分区/快照表' }[t] || t)

// ============ 日期格式化 ============

export const formatDate = (date) => {
  return new Date(date).toLocaleString('zh-CN')
}

// ============ 分类选项 ============

export const level1Options = [
  { value: 'credit_report', label: '征信报告' },
  { value: 'credit_history', label: '信贷记录' },
  { value: 'transaction_behavior', label: '交易行为' },
  { value: 'activity', label: '活跃度' },
  { value: 'model_outputs', label: '模型输出' }
]

export const level2Options = (l1) => {
  const map = {
    credit_report: [
      { value: 'overdue_count', label: '逾期次数' },
      { value: 'query_count', label: '查询次数' }
    ],
    credit_history: [
      { value: 'loan_times', label: '贷款次数' },
      { value: 'repay_ratio', label: '还款比率' }
    ],
    transaction_behavior: [
      { value: 'avg_amount', label: '平均交易额' },
      { value: 'frequency', label: '交易频次' }
    ],
    activity: [
      { value: 'login_days', label: '登录天数' },
      { value: 'session_count', label: '会话次数' }
    ],
    model_outputs: [
      { value: 'score', label: '评分' },
      { value: 'probability', label: '概率' }
    ]
  }
  return map[l1] || []
}

/** 根据特征大类过滤可用的一级分类选项 */
export const getEffectiveLevel1Options = (majorCategory) => {
  if (majorCategory === 'model_output') return level1Options.filter(o => o.value === 'model_outputs')
  if (majorCategory === 'credit') return level1Options.filter(o => o.value === 'credit_report' || o.value === 'credit_history')
  if (majorCategory === 'behavior') return level1Options.filter(o => o.value === 'transaction_behavior' || o.value === 'activity')
  return level1Options
}

// ============ 注册表单校验规则 ============

export const registerRules = {
  majorCategory: [{ required: true, message: '请选择特征大类' }],
  code: [
    { required: true, message: '请输入特征编码' },
    { match: /^[a-zA-Z0-9_]+$/, message: '仅支持字母、数字和下划线' }
  ],
  name: [{ required: true, message: '请输入特征名称' }],
  dataType: [{ required: true, message: '请选择数据类型' }],
  modelType: [{ required: true, message: '请选择模型类型' }]
}

// ============ 表格列定义 ============

export const registeredColumns = [
  { title: '原表字段名', dataIndex: 'name', width: 160 },
  { title: '特征编码', dataIndex: 'code', width: 160 },
  { title: '类型', dataIndex: 'type', width: 140 },
  { title: '中文名', dataIndex: 'cnName', width: 160 },
  { title: '数据类型', dataIndex: 'dataType', width: 140 },
  { title: '默认值', dataIndex: 'defaultValue', width: 140 },
  { title: '来源', dataIndex: 'sourceType', width: 140 },
  { title: '来源标识', dataIndex: 'sourceRefId', width: 180 }
]

export const unregisteredColumns = [
  { title: '是否注册', dataIndex: 'selected', slotName: 'selectedCell', width: 100 },
  { title: '原表字段名', dataIndex: 'name', width: 160 },
  { title: '特征编码', dataIndex: 'code', slotName: 'codeCell', width: 160 },
  { title: '类型', dataIndex: 'type', width: 140 },
  { title: '中文名', dataIndex: 'cnName', slotName: 'cnNameCell', width: 160 },
  { title: '数据类型', dataIndex: 'dataType', slotName: 'dataTypeCell', width: 140 },
  { title: '默认值', dataIndex: 'defaultValue', slotName: 'defaultValueCell', width: 140 }
]
