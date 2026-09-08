/**
 * F6 消费 API 文档 Mock
 * 3 个 Mock API
 */
import type { ClassifyApiDoc } from './classify-types'

export const classifyApiDocsData: ClassifyApiDoc[] = [
  {
    id: 'API-001',
    name: '查询字段分级分类',
    method: 'GET',
    path: '/api/metadata/classify',
    summary: '根据 schema/table/field 查询字段的分级分类标签',
    request_params: [
      { name: 'schema', type: 'string', required: true, description: '数据库/模式名' },
      { name: 'table_name', type: 'string', required: true, description: '表名' },
      { name: 'field_name', type: 'string', required: true, description: '字段名' }
    ],
    response_params: [
      { name: 'code', type: 'number', description: '响应码，0 表示成功' },
      { name: 'data', type: 'object', description: '分级分类数据' },
      { name: 'data.field_name', type: 'string', description: '字段名' },
      { name: 'data.business_belonging', type: 'string', description: '业务属于' },
      { name: 'data.grade', type: 'string', description: '分级' },
      { name: 'data.sensitivity_level', type: 'string', description: '敏感级别 L1~L4' },
      { name: 'data.category_l1', type: 'string', description: '一级业务目录' },
      { name: 'data.category_l2', type: 'string', description: '二级业务目录' },
      { name: 'data.category_l3', type: 'string', description: '三级业务目录' },
      { name: 'data.category_l4', type: 'string', description: '四级业务目录' }
    ],
    request_example: 'GET /api/metadata/classify?schema=crm_db&table_name=t_user_info&field_name=mobile',
    response_example: `{
  "code": 0,
  "data": {
    "field_name": "mobile",
    "business_belonging": "零售",
    "grade": "重要",
    "sensitivity_level": "L3",
    "category_l1": "客户信息",
    "category_l2": "个人PII",
    "category_l3": "联系方式",
    "category_l4": "手机号"
  }
}`,
    error_codes: [
      { code: '1001', message: '参数缺失' },
      { code: '1002', message: '未找到对应记录' }
    ]
  },
  {
    id: 'API-002',
    name: '批量查询分级分类',
    method: 'POST',
    path: '/api/metadata/classify/batch',
    summary: '批量查询多个字段的分级分类标签',
    request_params: [
      { name: 'fields', type: 'array', required: true, description: '字段列表，每项包含 schema/table_name/field_name' }
    ],
    response_params: [
      { name: 'code', type: 'number', description: '响应码' },
      { name: 'data', type: 'array', description: '分级分类数据列表' }
    ],
    request_example: `POST /api/metadata/classify/batch
{
  "fields": [
    { "schema": "crm_db", "table_name": "t_user_info", "field_name": "mobile" },
    { "schema": "crm_db", "table_name": "t_user_info", "field_name": "id_card" }
  ]
}`,
    response_example: `{
  "code": 0,
  "data": [
    { "field_name": "mobile", "sensitivity_level": "L3", "category_l4": "手机号" },
    { "field_name": "id_card", "sensitivity_level": "L4", "category_l4": "身份证号" }
  ]
}`
  },
  {
    id: 'API-003',
    name: '查询分级统计',
    method: 'GET',
    path: '/api/metadata/classify/stats',
    summary: '按系统模块/安全级别统计分级分布',
    request_params: [
      { name: 'system_id', type: 'string', required: false, description: '数据源 ID，不传则全量' }
    ],
    response_params: [
      { name: 'code', type: 'number', description: '响应码' },
      { name: 'data.total', type: 'number', description: '总字段数' },
      { name: 'data.distribution', type: 'object', description: '分布 { L1, L2, L3, L4 }' }
    ],
    request_example: 'GET /api/metadata/classify/stats?system_id=SYS-001',
    response_example: `{
  "code": 0,
  "data": {
    "total": 17,
    "distribution": { "L1": 4, "L2": 5, "L3": 5, "L4": 3 }
  }
}`
  }
]
