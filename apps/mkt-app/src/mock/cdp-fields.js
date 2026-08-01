/**
 * CDP Rule Builder Mock Data
 * 用途：CDP 规则构建器字段池（标签文本/标签数值/事件 三大类）
 * 来源：覆盖 dmt-app CDP 规则引擎
 * 消费方：@/pages/tasks/components/task/CDPRuleBuilderForm.vue
 * 边界：纯前端 demo；字段池层级结构（group/subGroup/fields）
 */

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

// 事件属性公共字典
const _commonCategoryValues = [
  { label: '美妆', value: 'beauty' },
  { label: '服饰', value: 'fashion' },
  { label: '数码', value: 'digital' },
  { label: '食品', value: 'food' },
  { label: '家居', value: 'home' },
]
const _commonChannelValues = [
  { label: '微信小程序', value: 'wechat_mp' },
  { label: '微信公众号', value: 'wechat_official' },
  { label: 'H5', value: 'h5' },
  { label: 'APP', value: 'app' },
  { label: 'PC', value: 'pc' },
]
const _commonDeviceValues = [
  { label: 'iOS', value: 'ios' },
  { label: 'Android', value: 'android' },
  { label: 'Web', value: 'web' },
]

export const eventFields = [
  {
    id: 'e1',
    name: '加购',
    eventKey: 'add_to_cart',
    properties: [
      { id: 'e1_p1', name: '商品类目', subType: 'text', values: _commonCategoryValues },
      { id: 'e1_p2', name: '商品价格', subType: 'number' },
      { id: 'e1_p3', name: '加购件数', subType: 'number' },
      { id: 'e1_p4', name: '来源渠道', subType: 'text', values: _commonChannelValues },
    ],
  },
  {
    id: 'e2',
    name: '提交订单',
    eventKey: 'submit_order',
    properties: [
      { id: 'e2_p1', name: '订单金额', subType: 'number' },
      { id: 'e2_p2', name: '商品类目', subType: 'text', values: _commonCategoryValues },
      { id: 'e2_p3', name: '是否首单', subType: 'text', values: [
        { label: '是', value: 'yes' }, { label: '否', value: 'no' },
      ]},
      { id: 'e2_p4', name: '使用优惠券', subType: 'text', values: [
        { label: '是', value: 'yes' }, { label: '否', value: 'no' },
      ]},
      { id: 'e2_p5', name: '来源渠道', subType: 'text', values: _commonChannelValues },
    ],
  },
  {
    id: 'e3',
    name: '完成支付',
    eventKey: 'complete_payment',
    properties: [
      { id: 'e3_p1', name: '支付金额', subType: 'number' },
      { id: 'e3_p2', name: '支付方式', subType: 'text', values: [
        { label: '微信支付', value: 'wechat_pay' },
        { label: '支付宝', value: 'alipay' },
        { label: '银行卡', value: 'bank_card' },
        { label: '余额', value: 'balance' },
      ]},
      { id: 'e3_p3', name: '商品类目', subType: 'text', values: _commonCategoryValues },
      { id: 'e3_p4', name: '是否新客', subType: 'text', values: [
        { label: '是', value: 'yes' }, { label: '否', value: 'no' },
      ]},
    ],
  },
  {
    id: 'e4',
    name: '打开小程序',
    eventKey: 'open_mini_program',
    properties: [
      { id: 'e4_p1', name: '设备类型', subType: 'text', values: _commonDeviceValues },
      { id: 'e4_p2', name: '来源场景', subType: 'text', values: [
        { label: '搜索', value: 'search' },
        { label: '扫码', value: 'scan' },
        { label: '分享', value: 'share' },
        { label: '对话', value: 'chat' },
      ]},
      { id: 'e4_p3', name: '页面路径', subType: 'text' },
    ],
  },
  {
    id: 'e5',
    name: '发起退款',
    eventKey: 'request_refund',
    properties: [
      { id: 'e5_p1', name: '退款金额', subType: 'number' },
      { id: 'e5_p2', name: '退款原因', subType: 'text', values: [
        { label: '质量问题', value: 'quality' },
        { label: '不想要了', value: 'no_longer_want' },
        { label: '价格问题', value: 'price' },
        { label: '其他', value: 'other' },
      ]},
      { id: 'e5_p3', name: '商品类目', subType: 'text', values: _commonCategoryValues },
    ],
  },
  {
    id: 'e6',
    name: '完成退款',
    eventKey: 'complete_refund',
    properties: [
      { id: 'e6_p1', name: '退款金额', subType: 'number' },
      { id: 'e6_p2', name: '退款方式', subType: 'text', values: [
        { label: '原路退回', value: 'original' },
        { label: '余额', value: 'balance' },
      ]},
      { id: 'e6_p3', name: '处理时长(天)', subType: 'number' },
    ],
  },
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