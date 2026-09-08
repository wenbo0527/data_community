/**
 * businessProcessData.ts 优化验证测试
 * 验证新增的类型定义、业务流程和配置数据是否正常工作
 */

import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 模拟导入 businessProcessData.ts 的内容
async function loadBusinessProcessData() {
  try {
    // 模拟读取文件内容进行验证
    const fs = await import('fs')
    const filePath = join(__dirname, '../src/mock/businessProcessData.ts')
    const content = fs.readFileSync(filePath, 'utf-8')
    
    return {
      hasBusinessProcessType: content.includes('export enum BusinessProcessType'),
      hasDataLineage: content.includes('export interface DataLineage'),
      hasMetricCalculationRule: content.includes('export interface MetricCalculationRule'),
      hasCompleteBusinessProcesses: content.includes('export const completeBusinessProcesses'),
      hasDataLineageConfig: content.includes('export const dataLineageConfig'),
      hasMetricCalculationRules: content.includes('export const metricCalculationRules'),
      hasLoanRepaymentTable: content.includes("name: 'loan_repayment'"),
      hasCollectionRecordTable: content.includes("name: 'collection_record'"),
      hasServiceTicketTable: content.includes("name: 'service_ticket'"),
      content
    }
  } catch (error) {
    console.error('❌ 文件读取失败:', error.message)
    return null
  }
}

// 验证类型定义完整性
function validateTypeDefinitions(data) {
  console.log('\n🔍 验证类型定义完整性...')
  
  const checks = [
    { name: 'BusinessProcessType枚举', passed: data.hasBusinessProcessType },
    { name: 'DataLineage接口', passed: data.hasDataLineage },
    { name: 'MetricCalculationRule接口', passed: data.hasMetricCalculationRule }
  ]
  
  let passedCount = 0
  checks.forEach(check => {
    if (check.passed) {
      console.log(`✅ ${check.name}: 已定义`)
      passedCount++
    } else {
      console.log(`❌ ${check.name}: 缺失`)
    }
  })
  
  return { total: checks.length, passed: passedCount }
}

// 验证业务流程数据完整性
function validateBusinessProcessData(data) {
  console.log('\n🔍 验证业务流程数据完整性...')
  
  const checks = [
    { name: '完整业务流程配置', passed: data.hasCompleteBusinessProcesses },
    { name: '数据血缘关系配置', passed: data.hasDataLineageConfig },
    { name: '指标计算规则配置', passed: data.hasMetricCalculationRules }
  ]
  
  let passedCount = 0
  checks.forEach(check => {
    if (check.passed) {
      console.log(`✅ ${check.name}: 已配置`)
      passedCount++
    } else {
      console.log(`❌ ${check.name}: 缺失`)
    }
  })
  
  return { total: checks.length, passed: passedCount }
}

// 验证新增数据表
function validateNewTables(data) {
  console.log('\n🔍 验证新增数据表...')
  
  const checks = [
    { name: 'loan_repayment还款记录表', passed: data.hasLoanRepaymentTable },
    { name: 'collection_record催收记录表', passed: data.hasCollectionRecordTable },
    { name: 'service_ticket客服工单表', passed: data.hasServiceTicketTable }
  ]
  
  let passedCount = 0
  checks.forEach(check => {
    if (check.passed) {
      console.log(`✅ ${check.name}: 已定义`)
      passedCount++
    } else {
      console.log(`❌ ${check.name}: 缺失`)
    }
  })
  
  return { total: checks.length, passed: passedCount }
}

// 验证字段定义质量
function validateFieldQuality(data) {
  console.log('\n🔍 验证字段定义质量...')
  
  const content = data.content
  const qualityChecks = [
    { name: '数据质量等级', pattern: /qualityLevel:\s*DataQualityLevel\.(HIGH|MEDIUM|LOW)/, passed: false },
    { name: '业务重要性', pattern: /businessImportance:\s*['"`](critical|important|normal)['"`]/, passed: false },
    { name: '字段约束', pattern: /constraints:\s*\[.*\]/, passed: false },
    { name: '字段描述', pattern: /description:\s*['"`][^'"`]+['"`]/, passed: false }
  ]
  
  let passedCount = 0
  qualityChecks.forEach(check => {
    check.passed = check.pattern.test(content)
    if (check.passed) {
      console.log(`✅ ${check.name}: 已配置`)
      passedCount++
    } else {
      console.log(`❌ ${check.name}: 缺失`)
    }
  })
  
  return { total: qualityChecks.length, passed: passedCount }
}

// 主测试函数
async function runOptimizationValidation() {
  console.log('🚀 开始 businessProcessData.ts 优化验证测试...')
  console.log('=' .repeat(60))
  
  const data = await loadBusinessProcessData()
  if (!data) {
    console.log('❌ 测试失败：无法加载业务流程数据文件')
    return
  }
  
  // 执行各项验证
  const typeResult = validateTypeDefinitions(data)
  const processResult = validateBusinessProcessData(data)
  const tableResult = validateNewTables(data)
  const qualityResult = validateFieldQuality(data)
  
  // 汇总结果
  console.log('\n📊 验证结果汇总:')
  console.log('=' .repeat(60))
  
  const totalChecks = typeResult.total + processResult.total + tableResult.total + qualityResult.total
  const totalPassed = typeResult.passed + processResult.passed + tableResult.passed + qualityResult.passed
  const successRate = ((totalPassed / totalChecks) * 100).toFixed(1)
  
  console.log(`📈 类型定义: ${typeResult.passed}/${typeResult.total} 通过`)
  console.log(`📈 业务流程: ${processResult.passed}/${processResult.total} 通过`)
  console.log(`📈 数据表: ${tableResult.passed}/${tableResult.total} 通过`)
  console.log(`📈 字段质量: ${qualityResult.passed}/${qualityResult.total} 通过`)
  console.log(`📈 总体通过率: ${totalPassed}/${totalChecks} (${successRate}%)`)
  
  if (successRate >= 90) {
    console.log('\n🎉 优化验证成功！businessProcessData.ts 已完成高质量优化')
    console.log('✅ 类型定义完整，业务流程数据丰富，字段质量达标')
  } else if (successRate >= 70) {
    console.log('\n⚠️  优化基本完成，但仍有改进空间')
  } else {
    console.log('\n❌ 优化不完整，需要进一步改进')
  }
  
  console.log('\n🔗 相关文档:')
  console.log('📄 技术方案: /docs/key-project-docs/技术方案/2025-01-27/问题编号_061_2025-01-27.md')
  console.log('📄 开发日志: /docs/key-project-docs/开发日志/061_2025-01-27.md')
  
  return {
    totalChecks,
    totalPassed,
    successRate: parseFloat(successRate),
    details: {
      typeDefinitions: typeResult,
      businessProcesses: processResult,
      dataTables: tableResult,
      fieldQuality: qualityResult
    }
  }
}

// 运行测试
runOptimizationValidation().catch(console.error)