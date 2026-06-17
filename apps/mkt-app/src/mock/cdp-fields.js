// CDP 规则构建器 Mock 数据
// 字段类型：标签（文本型/数值型）、事件

export const tagFields = [
  {
    id: 'f1',
    name: '城市',
    fieldKey: 'city',
    type: 'tag',
    subType: 'text',
    values: [
      { label: '厦门', value: 'xiamen' },
      { label: '北京', value: 'beijing' },
      { label: '上海', value: 'shanghai' },
      { label: '广州', value: 'guangzhou' },
      { label: '深圳', value: 'shenzhen' },
      { label: '杭州', value: 'hangzhou' },
      { label: '成都', value: 'chengdu' },
      { label: '南京', value: 'nanjing' },
    ],
  },
  {
    id: 'f2',
    name: '性别',
    fieldKey: 'gender',
    type: 'tag',
    subType: 'text',
    values: [
      { label: '男', value: 'male' },
      { label: '女', value: 'female' },
    ],
  },
  {
    id: 'f3',
    name: '用户等级',
    fieldKey: 'user_level',
    type: 'tag',
    subType: 'text',
    values: [
      { label: 'VIP', value: 'vip' },
      { label: '普通', value: 'normal' },
      { label: '新用户', value: 'new' },
    ],
  },
  {
    id: 'f4',
    name: '预测值',
    fieldKey: 'predicted_value',
    type: 'tag',
    subType: 'number',
  },
  {
    id: 'f5',
    name: '年龄',
    fieldKey: 'age',
    type: 'tag',
    subType: 'number',
  },
  {
    id: 'f6',
    name: '注册天数',
    fieldKey: 'register_days',
    type: 'tag',
    subType: 'number',
  },
]

export const eventFields = [
  { id: 'e1', name: '加购', eventKey: 'add_to_cart' },
  { id: 'e2', name: '提交订单', eventKey: 'submit_order' },
  { id: 'e3', name: '完成支付', eventKey: 'complete_payment' },
  { id: 'e4', name: '打开小程序', eventKey: 'open_mini_program' },
  { id: 'e5', name: '发起退款', eventKey: 'request_refund' },
  { id: 'e6', name: '完成退款', eventKey: 'complete_refund' },
]

export const operators = {
  text: [
    { label: '包含', value: 'in' },
    { label: '不包含', value: 'not_in' },
    { label: '为空', value: 'is_null' },
    { label: '不为空', value: 'is_not_null' },
    { label: 'like', value: 'like' },
  ],
  number: [
    { label: '=', value: '=' },
    { label: '>', value: '>' },
    { label: '≥', value: '>=' },
    { label: '<', value: '<' },
    { label: '≤', value: '<=' },
    { label: '!=', value: '!=' },
  ],
  event: [
    { label: '发生过', value: 'happened' },
    { label: '未发生过', value: 'not_happened' },
    { label: '发生过至少N次', value: 'at_least_n' },
  ],
}

export function getOperatorsForField(field) {
  if (field.type === 'tag') {
    return operators[field.subType]
  }
  return operators.event
}

export function mockPreviewCount(ruleData) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ count: Math.floor(Math.random() * 5000) + 2000 })
    }, 300)
  })
}