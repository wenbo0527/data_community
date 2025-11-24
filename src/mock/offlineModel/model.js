/**
 * 模型注册Mock数据服务
 */

// 模型类型定义
const MODEL_TYPES = {
  CLASSIFICATION: 'classification',
  REGRESSION: 'regression',
  CLUSTERING: 'clustering',
  DEEP_LEARNING: 'deep_learning'
}

// 算法框架定义
const FRAMEWORKS = {
  SKLEARN: 'sklearn',
  TENSORFLOW: 'tensorflow',
  PYTORCH: 'pytorch',
  XGBOOST: 'xgboost'
}

// 模型状态定义
const MODEL_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  TRAINING: 'training',
  FAILED: 'failed'
}

// 模拟模型数据
const mockModels = [
  {
    id: 1,
    name: '信用评分模型',
    code: 'credit_score_model',
    type: MODEL_TYPES.CLASSIFICATION,
    framework: FRAMEWORKS.XGBOOST,
    accuracy: 85.6,
    precision: 82.3,
    recall: 78.9,
    f1Score: 80.5,
    version: 'v1.0.0',
    description: '基于用户行为数据的信用评分预测模型',
    status: MODEL_STATUS.ACTIVE,
    createTime: '2024-01-15 10:30:00',
    creator: '张三',
    trainingDataSize: 50000,
    modelSize: '25.6MB',
    trainingTime: '2小时30分钟',
    hyperparameters: {
      max_depth: 6,
      learning_rate: 0.1,
      n_estimators: 100
    },
    features: ['user_age', 'user_income', 'credit_history', 'employment_status'],
    modelPath: '/models/credit_score_model.pkl',
    lastUpdateTime: '2024-01-15 10:30:00'
  },
  {
    id: 2,
    name: '风险预测模型',
    code: 'risk_prediction_model',
    type: MODEL_TYPES.REGRESSION,
    framework: FRAMEWORKS.SKLEARN,
    accuracy: 78.9,
    precision: 76.2,
    recall: 81.4,
    f1Score: 78.7,
    version: 'v1.0.1',
    description: '用户违约风险预测模型',
    status: MODEL_STATUS.TRAINING,
    createTime: '2024-01-16 14:20:00',
    creator: '李四',
    trainingDataSize: 35000,
    modelSize: '18.3MB',
    trainingTime: '1小时45分钟',
    hyperparameters: {
      C: 1.0,
      kernel: 'rbf',
      gamma: 'scale'
    },
    features: ['user_age', 'user_income', 'loan_amount', 'credit_score'],
    modelPath: '/models/risk_prediction_model.pkl',
    lastUpdateTime: '2024-01-16 14:20:00'
  },
  {
    id: 3,
    name: '客户分群模型',
    code: 'customer_clustering_model',
    type: MODEL_TYPES.CLUSTERING,
    framework: FRAMEWORKS.SKLEARN,
    accuracy: 92.1,
    precision: 89.7,
    recall: 91.3,
    f1Score: 90.5,
    version: 'v1.0.0',
    description: '基于用户行为的客户分群模型',
    status: MODEL_STATUS.ACTIVE,
    createTime: '2024-01-17 09:15:00',
    creator: '王五',
    trainingDataSize: 80000,
    modelSize: '32.1MB',
    trainingTime: '3小时15分钟',
    hyperparameters: {
      n_clusters: 5,
      max_iter: 300,
      n_init: 10
    },
    features: ['user_age', 'user_income', 'purchase_frequency', 'avg_order_value'],
    modelPath: '/models/customer_clustering_model.pkl',
    lastUpdateTime: '2024-01-17 09:15:00'
  },
  {
    id: 4,
    name: '图像识别模型',
    code: 'image_recognition_model',
    type: MODEL_TYPES.DEEP_LEARNING,
    framework: FRAMEWORKS.TENSORFLOW,
    accuracy: 94.7,
    precision: 93.2,
    recall: 95.1,
    f1Score: 94.1,
    version: 'v1.0.0',
    description: '基于深度学习的图像识别模型',
    status: MODEL_STATUS.FAILED,
    createTime: '2024-01-18 16:45:00',
    creator: '赵六',
    trainingDataSize: 120000,
    modelSize: '156.8MB',
    trainingTime: '8小时30分钟',
    hyperparameters: {
      learning_rate: 0.001,
      batch_size: 32,
      epochs: 50,
      dropout_rate: 0.3
    },
    features: ['image_pixels', 'image_channels', 'image_size'],
    modelPath: '/models/image_recognition_model.h5',
    lastUpdateTime: '2024-01-18 16:45:00',
    errorMessage: '训练过程中出现内存不足错误'
  },
  {
    id: 5,
    name: '文本分类模型',
    code: 'text_classification_model',
    type: MODEL_TYPES.CLASSIFICATION,
    framework: FRAMEWORKS.PYTORCH,
    accuracy: 88.3,
    precision: 86.9,
    recall: 89.7,
    f1Score: 88.3,
    version: 'v1.0.2',
    description: '基于BERT的文本分类模型',
    status: MODEL_STATUS.ACTIVE,
    createTime: '2024-01-19 11:30:00',
    creator: '钱七',
    trainingDataSize: 25000,
    modelSize: '89.4MB',
    trainingTime: '5小时20分钟',
    hyperparameters: {
      learning_rate: 2e-5,
      batch_size: 16,
      epochs: 3,
      max_length: 512
    },
    features: ['text_content', 'text_length', 'word_count'],
    modelPath: '/models/text_classification_model.pt',
    lastUpdateTime: '2024-01-19 11:30:00'
  }
]

// 模型统计信息
const modelStats = {
  totalModels: mockModels.length,
  activeModels: mockModels.filter(m => m.status === MODEL_STATUS.ACTIVE).length,
  trainingModels: mockModels.filter(m => m.status === MODEL_STATUS.TRAINING).length,
  failedModels: mockModels.filter(m => m.status === MODEL_STATUS.FAILED).length,
  byType: {
    classification: mockModels.filter(m => m.type === MODEL_TYPES.CLASSIFICATION).length,
    regression: mockModels.filter(m => m.type === MODEL_TYPES.REGRESSION).length,
    clustering: mockModels.filter(m => m.type === MODEL_TYPES.CLUSTERING).length,
    deep_learning: mockModels.filter(m => m.type === MODEL_TYPES.DEEP_LEARNING).length
  },
  byFramework: {
    sklearn: mockModels.filter(m => m.framework === FRAMEWORKS.SKLEARN).length,
    tensorflow: mockModels.filter(m => m.framework === FRAMEWORKS.TENSORFLOW).length,
    pytorch: mockModels.filter(m => m.framework === FRAMEWORKS.PYTORCH).length,
    xgboost: mockModels.filter(m => m.framework === FRAMEWORKS.XGBOOST).length
  }
}

/**
 * 获取模型列表
 */
export function getModels(params = {}) {
  const { name = '', type = '', framework = '', status = '', page = 1, pageSize = 10 } = params
  
  let filteredModels = [...mockModels]
  
  // 按名称筛选
  if (name) {
    filteredModels = filteredModels.filter(m => 
      m.name.toLowerCase().includes(name.toLowerCase()) ||
      m.code.toLowerCase().includes(name.toLowerCase())
    )
  }
  
  // 按类型筛选
  if (type) {
    filteredModels = filteredModels.filter(m => m.type === type)
  }
  
  // 按框架筛选
  if (framework) {
    filteredModels = filteredModels.filter(m => m.framework === framework)
  }
  
  // 按状态筛选
  if (status) {
    filteredModels = filteredModels.filter(m => m.status === status)
  }
  
  // 分页
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const paginatedModels = filteredModels.slice(start, end)
  
  return {
    data: paginatedModels,
    total: filteredModels.length,
    page,
    pageSize
  }
}

/**
 * 获取模型详情
 */
export function getModelDetail(id) {
  return mockModels.find(m => m.id === parseInt(id))
}

/**
 * 创建新模型
 */
export function createModel(modelData) {
  const newModel = {
    id: mockModels.length + 1,
    ...modelData,
    createTime: new Date().toLocaleString('zh-CN'),
    creator: '当前用户',
    status: MODEL_STATUS.DRAFT,
    version: 'v1.0.0',
    lastUpdateTime: new Date().toLocaleString('zh-CN')
  }
  mockModels.push(newModel)
  return newModel
}

/**
 * 更新模型
 */
export function updateModel(id, modelData) {
  const index = mockModels.findIndex(m => m.id === parseInt(id))
  if (index !== -1) {
    mockModels[index] = { 
      ...mockModels[index], 
      ...modelData,
      lastUpdateTime: new Date().toLocaleString('zh-CN')
    }
    return mockModels[index]
  }
  return null
}

/**
 * 删除模型
 */
export function deleteModel(id) {
  const index = mockModels.findIndex(m => m.id === parseInt(id))
  if (index !== -1) {
    const deleted = mockModels.splice(index, 1)[0]
    return deleted
  }
  return null
}

/**
 * 获取模型统计信息
 */
export function getModelStats() {
  return modelStats
}

/**
 * 批量导入模型
 */
export function importModels(modelsData) {
  const importedModels = modelsData.map((model, index) => ({
    id: mockModels.length + index + 1,
    ...model,
    createTime: new Date().toLocaleString('zh-CN'),
    creator: '批量导入',
    status: MODEL_STATUS.DRAFT,
    version: 'v1.0.0',
    lastUpdateTime: new Date().toLocaleString('zh-CN')
  }))
  
  mockModels.push(...importedModels)
  return importedModels
}

/**
 * 导出模型数据
 */
export function exportModels(params = {}) {
  const { data } = getModels(params)
  return data.map(model => ({
    模型名称: model.name,
    模型编码: model.code,
    模型类型: model.type,
    算法框架: model.framework,
    准确率: model.accuracy + '%',
    版本: model.version,
    描述: model.description,
    状态: model.status,
    创建时间: model.createTime,
    创建人: model.creator,
    训练数据量: model.trainingDataSize,
    模型大小: model.modelSize,
    训练时间: model.trainingTime
  }))
}

/**
 * 获取模型类型列表
 */
export function getModelTypes() {
  return [
    { value: MODEL_TYPES.CLASSIFICATION, label: '分类模型' },
    { value: MODEL_TYPES.REGRESSION, label: '回归模型' },
    { value: MODEL_TYPES.CLUSTERING, label: '聚类模型' },
    { value: MODEL_TYPES.DEEP_LEARNING, label: '深度学习' }
  ]
}

/**
 * 获取算法框架列表
 */
export function getFrameworks() {
  return [
    { value: FRAMEWORKS.SKLEARN, label: 'Scikit-learn' },
    { value: FRAMEWORKS.TENSORFLOW, label: 'TensorFlow' },
    { value: FRAMEWORKS.PYTORCH, label: 'PyTorch' },
    { value: FRAMEWORKS.XGBOOST, label: 'XGBoost' }
  ]
}

/**
 * 获取模型状态列表
 */
export function getModelStatus() {
  return [
    { value: MODEL_STATUS.ACTIVE, label: '有效' },
    { value: MODEL_STATUS.INACTIVE, label: '无效' },
    { value: MODEL_STATUS.TRAINING, label: '训练中' },
    { value: MODEL_STATUS.FAILED, label: '训练失败' }
  ]
}

/**
 * 重新训练模型
 */
export function retrainModel(id) {
  const model = mockModels.find(m => m.id === parseInt(id))
  if (model) {
    model.status = MODEL_STATUS.TRAINING
    model.lastUpdateTime = new Date().toLocaleString('zh-CN')
    
    // 模拟训练过程
    setTimeout(() => {
      // 随机决定训练结果
      const success = Math.random() > 0.2 // 80%成功率
      model.status = success ? MODEL_STATUS.ACTIVE : MODEL_STATUS.FAILED
      if (success) {
        // 随机提升准确率
        model.accuracy = Math.min(99.9, model.accuracy + (Math.random() * 2 - 0.5))
      } else {
        model.errorMessage = '重新训练过程中出现错误'
      }
    }, 5000) // 5秒后完成
    
    return model
  }
  return null
}

export default {
  getModels,
  getModelDetail,
  createModel,
  updateModel,
  deleteModel,
  getModelStats,
  importModels,
  exportModels,
  getModelTypes,
  getFrameworks,
  getModelStatus,
  retrainModel
}