/**
 * 节点类型验证功能测试
 * 测试NodeTypeValidator和PreviewLineValidator的节点类型验证功能
 */

// 导入测试模块
import { NodeTypeValidator } from './src/utils/preview-line/validators/NodeTypeValidator.js'
import { PreviewLineValidator } from './src/utils/preview-line/core/PreviewLineValidator.js'
import { PreviewLineConnectionValidator } from './src/pages/marketing/tasks/utils/ValidationUtils.js'

console.log('🧪 开始节点类型验证功能测试...\n')

// 测试数据
const testNodes = [
  // 有效节点
  {
    id: 'node1',
    type: 'start',
    data: { type: 'start', name: '开始节点' }
  },
  {
    id: 'node2', 
    type: 'audience-split',
    data: { type: 'audience-split', config: { conditions: [] } }
  },
  {
    id: 'node3',
    type: 'sms',
    data: { type: 'sms', content: '短信内容' }
  },
  // 无效节点
  {
    id: 'node4',
    type: 'invalid-type',
    data: { type: 'invalid-type' }
  },
  {
    id: 'node5',
    type: 'email', // 危险类型
    data: { type: 'email', content: '邮件内容' }
  },
  // 类型不一致的节点
  {
    id: 'node6',
    type: 'start',
    data: { type: 'end' } // 类型不一致
  }
]

// 1. 测试NodeTypeValidator
console.log('1️⃣ 测试NodeTypeValidator...')
const nodeTypeValidator = new NodeTypeValidator()

testNodes.forEach((node, index) => {
  console.log(`\n测试节点 ${index + 1}: ${node.id} (${node.type})`)
  
  try {
    const validation = nodeTypeValidator.validateNodeType(node)
    console.log(`  ✅ 验证结果: ${validation.isValid ? '有效' : '无效'}`)
    console.log(`  📝 节点类型: ${validation.nodeType}`)
    
    if (!validation.isValid) {
      console.log(`  ❌ 错误: ${validation.errors.join(', ')}`)
    }
    
    if (validation.warnings?.length > 0) {
      console.log(`  ⚠️  警告: ${validation.warnings.join(', ')}`)
    }
    
    // 测试分支节点判断
    const isBranch = nodeTypeValidator.isBranchNodeType(validation.nodeType)
    console.log(`  🌿 是否分支节点: ${isBranch}`)
    
  } catch (error) {
    console.log(`  💥 验证异常: ${error.message}`)
  }
})

// 2. 测试PreviewLineValidator的isBranchNode方法
console.log('\n\n2️⃣ 测试PreviewLineValidator.isBranchNode...')
const previewLineValidator = new PreviewLineValidator()

testNodes.forEach((node, index) => {
  console.log(`\n测试节点 ${index + 1}: ${node.id} (${node.type})`)
  
  try {
    const isBranch = previewLineValidator.isBranchNode(node)
    console.log(`  🌿 分支节点判断: ${isBranch}`)
  } catch (error) {
    console.log(`  💥 分支判断异常: ${error.message}`)
  }
})

// 3. 测试PreviewLineConnectionValidator
console.log('\n\n3️⃣ 测试PreviewLineConnectionValidator...')

const connectionTests = [
  { source: testNodes[0], target: testNodes[1], desc: '开始节点 -> 分流节点' },
  { source: testNodes[1], target: testNodes[2], desc: '分流节点 -> 短信节点' },
  { source: testNodes[3], target: testNodes[2], desc: '无效节点 -> 短信节点' },
  { source: testNodes[0], target: testNodes[4], desc: '开始节点 -> 邮件节点(危险)' },
  { source: testNodes[5], target: testNodes[2], desc: '类型不一致节点 -> 短信节点' }
]

connectionTests.forEach(async (test, index) => {
  console.log(`\n连接测试 ${index + 1}: ${test.desc}`)
  
  try {
    const validation = await PreviewLineConnectionValidator.validatePreviewLineConnection(
      test.source, 
      test.target,
      { coordinateTransform: { minDistance: 50, maxDistance: 1000 } }
    )
    
    console.log(`  ✅ 连接有效性: ${validation.isValid ? '有效' : '无效'}`)
    
    if (!validation.isValid) {
      console.log(`  ❌ 错误: ${validation.errors.join(', ')}`)
    }
    
    if (validation.warnings?.length > 0) {
      console.log(`  ⚠️  警告: ${validation.warnings.join(', ')}`)
    }
    
    // 显示详细验证结果
    if (validation.details.sourceNodeValidation) {
      console.log(`  📊 源节点验证: ${validation.details.sourceNodeValidation.isValid ? '通过' : '失败'}`)
    }
    
    if (validation.details.targetNodeValidation) {
      console.log(`  📊 目标节点验证: ${validation.details.targetNodeValidation.isValid ? '通过' : '失败'}`)
    }
    
  } catch (error) {
    console.log(`  💥 连接验证异常: ${error.message}`)
  }
})

// 4. 测试验证统计
console.log('\n\n4️⃣ 测试验证统计...')
try {
  const stats = nodeTypeValidator.getValidationStats()
  console.log('📈 验证统计:')
  console.log(`  总验证次数: ${stats.total}`)
  console.log(`  有效节点: ${stats.valid}`)
  console.log(`  无效节点: ${stats.invalid}`)
  console.log(`  类型错误: ${stats.typeErrors}`)
  console.log(`  一致性错误: ${stats.consistencyErrors}`)
  console.log(`  数据匹配错误: ${stats.dataMatchErrors}`)
} catch (error) {
  console.log(`💥 统计获取异常: ${error.message}`)
}

console.log('\n🎉 节点类型验证功能测试完成!')