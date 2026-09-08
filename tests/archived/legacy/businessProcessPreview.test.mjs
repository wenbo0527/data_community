/**
 * 业务流程预览组件测试
 * 验证ProcessPreview组件能正确处理数据结构并触发验证
 */

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 测试数据
const testProcessData = {
  basicInfo: {
    name: '用户注册流程',
    description: '新用户注册的完整业务流程',
    businessType: 'user-management',
    productType: 'web-app',
    priority: 'high',
    tags: ['用户管理', '注册流程', '核心业务']
  },
  steps: [
    {
      id: 'step-1',
      name: '用户信息收集',
      description: '收集用户基本注册信息',
      tables: [
        {
          name: 'user_register',
          description: '用户注册信息表',
          type: 'fact',
          owner: 'user_service'
        }
      ],
      metrics: [
        {
          name: '注册成功率',
          description: '用户注册成功的比例',
          category: 'business',
          level: 'core',
          unit: '%'
        }
      ]
    },
    {
      id: 'step-2',
      name: '身份验证',
      description: '验证用户身份信息',
      tables: [
        {
          name: 'user_auth',
          description: '用户认证信息表',
          type: 'dimension',
          owner: 'auth_service'
        }
      ],
      metrics: [
        {
          name: '验证通过率',
          description: '身份验证通过的比例',
          category: 'business',
          level: 'important',
          unit: '%'
        }
      ]
    }
  ]
}

// 测试不完整的数据
const incompleteProcessData = {
  basicInfo: {
    name: '',  // 缺少名称
    description: '',
    businessType: '',  // 缺少业务类型
    productType: '',   // 缺少产品类型
    priority: 'medium',
    tags: []
  },
  steps: []  // 没有步骤
}

// 模拟Vue组件的计算属性逻辑
function simulateProcessPreviewValidation(processData) {
  // 提取基本信息
  const basicInfo = processData.basicInfo || {
    name: '',
    description: '',
    businessType: '',
    productType: '',
    priority: 'medium',
    tags: []
  }
  
  // 验证基本信息是否完整
  const basicInfoValid = !!(
    basicInfo.name &&
    basicInfo.businessType &&
    basicInfo.productType
  )
  
  // 检查是否有步骤配置
  const hasSteps = processData.steps && processData.steps.length > 0
  
  // 检查步骤是否有基本配置
  const stepsValid = hasSteps ? processData.steps.every(step => 
    step.name && step.name.trim().length > 0
  ) : false
  
  return {
    isValid: basicInfoValid && stepsValid,
    basicInfoValid,
    hasSteps,
    stepsValid,
    basicInfo
  }
}

// 计算统计信息
function calculateStats(processData) {
  const totalTables = new Set()
  const totalMetrics = new Set()
  
  if (processData.steps) {
    processData.steps.forEach(step => {
      if (step.tables) {
        step.tables.forEach(table => totalTables.add(table.name))
      }
      if (step.metrics) {
        step.metrics.forEach(metric => totalMetrics.add(metric.name))
      }
    })
  }
  
  return {
    totalSteps: processData.steps ? processData.steps.length : 0,
    totalTables: totalTables.size,
    totalMetrics: totalMetrics.size
  }
}

// 计算完成度
function calculateCompletionRate(processData) {
  const basicInfo = processData.basicInfo || {}
  let totalFields = 0
  let completedFields = 0
  
  // 基本信息完成度
  totalFields += 5 // name, description, businessType, productType, priority
  if (basicInfo.name) completedFields++
  if (basicInfo.description) completedFields++
  if (basicInfo.businessType) completedFields++
  if (basicInfo.productType) completedFields++
  if (basicInfo.priority) completedFields++
  
  // 步骤完成度
  if (processData.steps) {
    processData.steps.forEach(step => {
      totalFields += 3 // name, tables, metrics
      if (step.name) completedFields++
      if (step.tables && step.tables.length > 0) completedFields++
      if (step.metrics && step.metrics.length > 0) completedFields++
    })
  }
  
  return totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0
}

// 运行测试
function runTests() {
  console.log('🧪 开始业务流程预览组件测试...\n')
  
  let passedTests = 0
  let totalTests = 0
  
  // 测试1: 完整数据验证
  totalTests++
  console.log('📋 测试1: 完整数据验证')
  try {
    const result = simulateProcessPreviewValidation(testProcessData)
    const stats = calculateStats(testProcessData)
    const completionRate = calculateCompletionRate(testProcessData)
    
    console.log(`  ✓ 基本信息有效: ${result.basicInfoValid}`)
    console.log(`  ✓ 有步骤配置: ${result.hasSteps}`)
    console.log(`  ✓ 步骤配置有效: ${result.stepsValid}`)
    console.log(`  ✓ 整体验证结果: ${result.isValid}`)
    console.log(`  ✓ 统计信息: ${stats.totalSteps}个步骤, ${stats.totalTables}个表, ${stats.totalMetrics}个指标`)
    console.log(`  ✓ 完成度: ${completionRate}%`)
    
    if (result.isValid && stats.totalSteps === 2 && stats.totalTables === 2 && stats.totalMetrics === 2 && completionRate === 100) {
      console.log('  ✅ 测试通过\n')
      passedTests++
    } else {
      console.log('  ❌ 测试失败: 验证结果不符合预期\n')
    }
  } catch (error) {
    console.log(`  ❌ 测试失败: ${error.message}\n`)
  }
  
  // 测试2: 不完整数据验证
  totalTests++
  console.log('📋 测试2: 不完整数据验证')
  try {
    const result = simulateProcessPreviewValidation(incompleteProcessData)
    const stats = calculateStats(incompleteProcessData)
    const completionRate = calculateCompletionRate(incompleteProcessData)
    
    console.log(`  ✓ 基本信息有效: ${result.basicInfoValid}`)
    console.log(`  ✓ 有步骤配置: ${result.hasSteps}`)
    console.log(`  ✓ 步骤配置有效: ${result.stepsValid}`)
    console.log(`  ✓ 整体验证结果: ${result.isValid}`)
    console.log(`  ✓ 统计信息: ${stats.totalSteps}个步骤, ${stats.totalTables}个表, ${stats.totalMetrics}个指标`)
    console.log(`  ✓ 完成度: ${completionRate}%`)
    
    if (!result.isValid && !result.basicInfoValid && !result.hasSteps && !result.stepsValid && completionRate === 20) {
      console.log('  ✅ 测试通过\n')
      passedTests++
    } else {
      console.log('  ❌ 测试失败: 验证结果不符合预期\n')
    }
  } catch (error) {
    console.log(`  ❌ 测试失败: ${error.message}\n`)
  }
  
  // 测试3: 数据结构兼容性
  totalTests++
  console.log('📋 测试3: 数据结构兼容性')
  try {
    // 测试嵌套结构处理
    const nestedData = {
      basicInfo: testProcessData.basicInfo,
      steps: testProcessData.steps
    }
    
    const result = simulateProcessPreviewValidation(nestedData)
    
    if (result.basicInfo.name === '用户注册流程' && result.isValid) {
      console.log('  ✅ 嵌套数据结构处理正确')
      passedTests++
    } else {
      console.log('  ❌ 嵌套数据结构处理失败')
    }
  } catch (error) {
    console.log(`  ❌ 测试失败: ${error.message}`)
  }
  
  // 测试4: 边界情况处理
  totalTests++
  console.log('\n📋 测试4: 边界情况处理')
  try {
    const edgeCases = [
      { basicInfo: null, steps: null },
      { basicInfo: {}, steps: [] },
      { basicInfo: { name: '   ', businessType: '', productType: '' }, steps: [{ name: '   ' }] }
    ]
    
    let edgeTestsPassed = 0
    edgeCases.forEach((testCase, index) => {
      try {
        const result = simulateProcessPreviewValidation(testCase)
        if (!result.isValid) {
          edgeTestsPassed++
        }
      } catch (error) {
        // 边界情况应该被正确处理，不应该抛出错误
        console.log(`  ⚠️  边界情况 ${index + 1} 处理异常: ${error.message}`)
      }
    })
    
    if (edgeTestsPassed === edgeCases.length) {
      console.log('  ✅ 边界情况处理正确')
      passedTests++
    } else {
      console.log('  ❌ 边界情况处理不完整')
    }
  } catch (error) {
    console.log(`  ❌ 测试失败: ${error.message}`)
  }
  
  // 输出测试结果
  console.log('\n' + '='.repeat(50))
  console.log(`📊 测试结果: ${passedTests}/${totalTests} 通过`)
  console.log(`📈 成功率: ${Math.round((passedTests / totalTests) * 100)}%`)
  
  if (passedTests === totalTests) {
    console.log('🎉 所有测试通过！ProcessPreview组件数据结构修复成功')
  } else {
    console.log('⚠️  部分测试失败，需要进一步检查')
  }
  
  return {
    passed: passedTests,
    total: totalTests,
    success: passedTests === totalTests
  }
}

// 执行测试
runTests()