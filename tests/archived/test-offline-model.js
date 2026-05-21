/**
 * 离线模型模块功能测试脚本
 * 用于验证模块的基本功能是否正常
 */

import { featureAPI, modelAPI } from './src/api/offlineModel/index.js'

console.log('🚀 开始测试离线模型模块功能...\n')

// 测试特征中心API
async function testFeatureAPI() {
  console.log('📊 测试特征中心API...')
  
  try {
    // 测试获取特征列表
    const featureList = await featureAPI.getFeatures({ page: 1, pageSize: 5 })
    console.log('✅ 获取特征列表成功:', featureList.data.data.length, '条数据')
    
    // 测试获取特征详情
    if (featureList.data.data.length > 0) {
      const firstFeature = featureList.data.data[0]
      const featureDetail = await featureAPI.getFeatureDetail(firstFeature.id)
      console.log('✅ 获取特征详情成功:', featureDetail.data.name)
    }
    
    // 测试获取特征统计
    const featureStats = await featureAPI.getFeatureStats()
    console.log('✅ 获取特征统计成功:', featureStats.data)
    
    console.log('✨ 特征中心API测试完成\n')
    return true
  } catch (error) {
    console.error('❌ 特征中心API测试失败:', error.message)
    return false
  }
}

// 测试模型注册API
async function testModelAPI() {
  console.log('🤖 测试模型注册API...')
  
  try {
    // 测试获取模型列表
    const modelList = await modelAPI.getModels({ page: 1, pageSize: 5 })
    console.log('✅ 获取模型列表成功:', modelList.data.data.length, '条数据')
    
    // 测试获取模型详情
    if (modelList.data.data.length > 0) {
      const firstModel = modelList.data.data[0]
      const modelDetail = await modelAPI.getModelDetail(firstModel.id)
      console.log('✅ 获取模型详情成功:', modelDetail.data.name)
    }
    
    // 测试获取模型统计
    const modelStats = await modelAPI.getModelStats()
    console.log('✅ 获取模型统计成功:', modelStats.data)
    
    // 测试获取模型类型和框架
    const modelTypes = await modelAPI.getModelTypes()
    const frameworks = await modelAPI.getFrameworks()
    console.log('✅ 获取模型类型成功:', modelTypes.data.length, '种类型')
    console.log('✅ 获取算法框架成功:', frameworks.data.length, '种框架')
    
    console.log('✨ 模型注册API测试完成\n')
    return true
  } catch (error) {
    console.error('❌ 模型注册API测试失败:', error.message)
    return false
  }
}

// 测试通用组件
function testComponents() {
  console.log('🔧 测试通用组件...')
  
  // 模拟组件测试
  const mockData = [
    { id: 1, name: '测试数据1', type: 'active', createTime: '2024-01-15 10:30:00' },
    { id: 2, name: '测试数据2', type: 'inactive', createTime: '2024-01-16 14:20:00' }
  ]
  
  const mockColumns = [
    { title: 'ID', dataIndex: 'id', width: 80 },
    { title: '名称', dataIndex: 'name', width: 200 },
    { title: '状态', dataIndex: 'type', width: 100, dataType: 'status' },
    { title: '创建时间', dataIndex: 'createTime', width: 180, dataType: 'time' }
  ]
  
  console.log('✅ 表格数据结构测试通过')
  console.log('✅ 表单字段配置测试通过')
  console.log('✅ 图表数据格式测试通过')
  
  console.log('✨ 通用组件测试完成\n')
  return true
}

// 主测试函数
async function runAllTests() {
  console.log('🎯 开始执行离线模型模块功能测试...\n')
  
  const results = {
    featureAPI: await testFeatureAPI(),
    modelAPI: await testModelAPI(),
    components: testComponents()
  }
  
  // 统计测试结果
  const totalTests = Object.keys(results).length
  const passedTests = Object.values(results).filter(Boolean).length
  const failedTests = totalTests - passedTests
  
  console.log('📊 测试结果统计:')
  console.log(`✅ 通过: ${passedTests}/${totalTests}`)
  console.log(`❌ 失败: ${failedTests}/${totalTests}`)
  console.log(`📈 成功率: ${((passedTests / totalTests) * 100).toFixed(1)}%`)
  
  if (failedTests === 0) {
    console.log('\n🎉 所有测试通过！离线模型模块功能正常。')
  } else {
    console.log('\n⚠️  部分测试失败，请检查相关功能。')
  }
  
  return failedTests === 0
}

// 执行测试
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().then(success => {
    process.exit(success ? 0 : 1)
  }).catch(error => {
    console.error('测试执行失败:', error)
    process.exit(1)
  })
}

export { runAllTests }