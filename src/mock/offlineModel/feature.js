/**
 * 特征中心Mock数据服务
 */

// 特征类型定义
const FEATURE_TYPES = {
  NUMERICAL: 'numerical',
  CATEGORICAL: 'categorical',
  TEXT: 'text',
  TIME: 'time'
}

// 特征状态定义
const FEATURE_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  DRAFT: 'draft',
  PENDING: 'pending',
  EXPIRED: 'expired'
}

// 模拟特征数据
const mockFeatures = [
  {
    id: 1,
    name: '用户年龄',
    code: 'user_age',
    type: FEATURE_TYPES.NUMERICAL,
    description: '用户的年龄信息',
    status: FEATURE_STATUS.ACTIVE,
    createTime: '2024-01-15 10:30:00',
    creator: '张三',
    dataSource: '用户注册信息',
    updateFrequency: '每日',
    dataQuality: 95.2,
    missingRate: 0.8,
    uniqueValueCount: 1200
  },
  {
    id: 2,
    name: '用户性别',
    code: 'user_gender',
    type: FEATURE_TYPES.CATEGORICAL,
    description: '用户的性别信息',
    status: FEATURE_STATUS.ACTIVE,
    createTime: '2024-01-16 14:20:00',
    creator: '李四',
    dataSource: '用户注册信息',
    updateFrequency: '一次性',
    dataQuality: 99.1,
    missingRate: 0.2,
    uniqueValueCount: 3
  },
  {
    id: 3,
    name: '用户收入',
    code: 'user_income',
    type: FEATURE_TYPES.NUMERICAL,
    description: '用户的月收入信息',
    status: FEATURE_STATUS.PENDING,
    createTime: '2024-01-17 09:15:00',
    creator: '王五',
    dataSource: '用户调查问卷',
    updateFrequency: '每月',
    dataQuality: 87.5,
    missingRate: 15.3,
    uniqueValueCount: 850
  },
  {
    id: 4,
    name: '用户职业',
    code: 'user_occupation',
    type: FEATURE_TYPES.CATEGORICAL,
    description: '用户的职业类别',
    status: FEATURE_STATUS.ACTIVE,
    createTime: '2024-01-18 16:45:00',
    creator: '赵六',
    dataSource: '用户注册信息',
    updateFrequency: '按需',
    dataQuality: 92.8,
    missingRate: 5.2,
    uniqueValueCount: 25
  },
  {
    id: 5,
    name: '用户评论内容',
    code: 'user_review_text',
    type: FEATURE_TYPES.TEXT,
    description: '用户的产品评论内容',
    status: FEATURE_STATUS.DRAFT,
    createTime: '2024-01-19 11:30:00',
    creator: '钱七',
    dataSource: '用户评论系统',
    updateFrequency: '实时',
    dataQuality: 88.9,
    missingRate: 25.6,
    uniqueValueCount: 15000
  }
]

// 特征统计信息
const featureStats = {
  totalFeatures: mockFeatures.length,
  activeFeatures: mockFeatures.filter(f => f.status === FEATURE_STATUS.ACTIVE).length,
  pendingFeatures: mockFeatures.filter(f => f.status === FEATURE_STATUS.PENDING).length,
  expiredFeatures: mockFeatures.filter(f => f.status === FEATURE_STATUS.EXPIRED).length,
  byType: {
    numerical: mockFeatures.filter(f => f.type === FEATURE_TYPES.NUMERICAL).length,
    categorical: mockFeatures.filter(f => f.type === FEATURE_TYPES.CATEGORICAL).length,
    text: mockFeatures.filter(f => f.type === FEATURE_TYPES.TEXT).length,
    time: mockFeatures.filter(f => f.type === FEATURE_TYPES.TIME).length
  }
}

/**
 * 获取特征列表
 */
export function getFeatures(params = {}) {
  const { name = '', type = '', status = '', page = 1, pageSize = 10 } = params
  
  let filteredFeatures = [...mockFeatures]
  
  // 按名称筛选
  if (name) {
    filteredFeatures = filteredFeatures.filter(f => 
      f.name.toLowerCase().includes(name.toLowerCase()) ||
      f.code.toLowerCase().includes(name.toLowerCase())
    )
  }
  
  // 按类型筛选
  if (type) {
    filteredFeatures = filteredFeatures.filter(f => f.type === type)
  }
  
  // 按状态筛选
  if (status) {
    filteredFeatures = filteredFeatures.filter(f => f.status === status)
  }
  
  // 分页
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const paginatedFeatures = filteredFeatures.slice(start, end)
  
  return {
    data: paginatedFeatures,
    total: filteredFeatures.length,
    page,
    pageSize
  }
}

/**
 * 获取特征详情
 */
export function getFeatureDetail(id) {
  return mockFeatures.find(f => f.id === parseInt(id))
}

/**
 * 创建新特征
 */
export function createFeature(featureData) {
  const newFeature = {
    id: mockFeatures.length + 1,
    ...featureData,
    createTime: new Date().toLocaleString('zh-CN'),
    creator: '当前用户',
    status: FEATURE_STATUS.DRAFT
  }
  mockFeatures.push(newFeature)
  return newFeature
}

/**
 * 更新特征
 */
export function updateFeature(id, featureData) {
  const index = mockFeatures.findIndex(f => f.id === parseInt(id))
  if (index !== -1) {
    mockFeatures[index] = { ...mockFeatures[index], ...featureData }
    return mockFeatures[index]
  }
  return null
}

/**
 * 删除特征
 */
export function deleteFeature(id) {
  const index = mockFeatures.findIndex(f => f.id === parseInt(id))
  if (index !== -1) {
    const deleted = mockFeatures.splice(index, 1)[0]
    return deleted
  }
  return null
}

/**
 * 获取特征统计信息
 */
export function getFeatureStats() {
  return featureStats
}

/**
 * 批量导入特征
 */
export function importFeatures(featuresData) {
  const importedFeatures = featuresData.map((feature, index) => ({
    id: mockFeatures.length + index + 1,
    ...feature,
    createTime: new Date().toLocaleString('zh-CN'),
    creator: '批量导入',
    status: FEATURE_STATUS.DRAFT
  }))
  
  mockFeatures.push(...importedFeatures)
  return importedFeatures
}

/**
 * 导出特征数据
 */
export function exportFeatures(params = {}) {
  const { data } = getFeatures(params)
  return data.map(feature => ({
    特征名称: feature.name,
    特征编码: feature.code,
    特征类型: feature.type,
    描述: feature.description,
    状态: feature.status,
    创建时间: feature.createTime,
    创建人: feature.creator,
    数据源: feature.dataSource,
    更新频率: feature.updateFrequency,
    数据质量: feature.dataQuality,
    缺失率: feature.missingRate,
    唯一值数量: feature.uniqueValueCount
  }))
}

/**
 * 获取特征类型列表
 */
export function getFeatureTypes() {
  return [
    { value: FEATURE_TYPES.NUMERICAL, label: '数值型' },
    { value: FEATURE_TYPES.CATEGORICAL, label: '分类型' },
    { value: FEATURE_TYPES.TEXT, label: '文本型' },
    { value: FEATURE_TYPES.TIME, label: '时间型' }
  ]
}

/**
 * 获取特征状态列表
 */
export function getFeatureStatus() {
  return [
    { value: FEATURE_STATUS.ACTIVE, label: '有效' },
    { value: FEATURE_STATUS.INACTIVE, label: '无效' },
    { value: FEATURE_STATUS.DRAFT, label: '草稿' },
    { value: FEATURE_STATUS.PENDING, label: '待审核' },
    { value: FEATURE_STATUS.EXPIRED, label: '已过期' }
  ]
}

export default {
  getFeatures,
  getFeatureDetail,
  createFeature,
  updateFeature,
  deleteFeature,
  getFeatureStats,
  importFeatures,
  exportFeatures,
  getFeatureTypes,
  getFeatureStatus
}