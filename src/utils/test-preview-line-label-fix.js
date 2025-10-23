/**
 * 测试预览线标签修复效果
 * 验证人群分流节点能正确显示人群名称而不是默认的"分支1"、"分支2"
 */

import { PreviewLineSystem } from './preview-line/index.js'

// 模拟图实例（Node.js环境中无法创建真实的X6图实例）
const mockNodes = new Map()
const mockGraph = {
  addNode: (config) => {
    const node = { 
      id: config.id || 'mock-node', 
      ...config,
      getData: () => config.data || {},
      setData: (data) => { config.data = data },
      getPosition: () => ({ x: config.x || 0, y: config.y || 0 }),
      getSize: () => ({ width: config.width || 120, height: config.height || 60 }),
      getBBox: () => ({ x: config.x || 0, y: config.y || 0, width: config.width || 120, height: config.height || 60 }),
      getPorts: () => [],
      isNode: () => true,
      isEdge: () => false,
      getPortPosition: () => ({ x: config.x || 0, y: config.y || 0 }),
      getConnectionPoint: () => ({ x: config.x || 0, y: config.y || 0 })
    }
    mockNodes.set(node.id, node)
    return node
  },
  addEdge: () => ({ id: 'mock-edge' }),
  getNodes: () => Array.from(mockNodes.values()),
  getEdges: () => [],
  getCellById: (id) => mockNodes.get(id) || { id, getData: () => ({}) },
  removeNode: (id) => mockNodes.delete(id),
  hasCell: (id) => mockNodes.has(id),
  on: () => {},
  off: () => {},
  trigger: () => {}
}

// 创建预览线管理器实例
const previewLineSystem = new PreviewLineSystem(mockGraph)

/**
 * 测试人群分流节点的标签生成
 */
function testAudienceSplitNodeLabels() {
  console.log('\n🧪 [测试] 开始测试人群分流节点标签生成...')
  
  // 创建人群分流节点
  const audienceSplitNode = mockGraph.addNode({
    id: 'audience-split-test',
    x: 100,
    y: 100,
    width: 120,
    height: 40,
    data: {
      type: 'audience-split',
      nodeType: 'audience-split',
      isConfigured: true,
      config: {
        crowdLayers: [
          {
            id: 'crowd-1',
            crowdName: '高价值用户',
            crowdId: 'high-value-users',
            order: 1
          },
          {
            id: 'crowd-2', 
            crowdName: '普通用户',
            crowdId: 'normal-users',
            order: 2
          },
          {
            id: 'crowd-3',
            crowdName: '新用户',
            crowdId: 'new-users', 
            order: 3
          }
        ]
      }
    }
  })
  
  console.log('✅ [测试] 人群分流节点已创建:', {
    nodeId: audienceSplitNode.id,
    nodeType: audienceSplitNode.getData().type,
    crowdLayers: audienceSplitNode.getData().config.crowdLayers.length
  })
  
  // 测试getNodeBranches方法
  const branches = previewLineSystem.getNodeBranches(audienceSplitNode)
  
  console.log('📊 [测试] 获取分支信息结果:', {
    branchCount: branches.length,
    branches: branches.map(b => ({
      id: b.id,
      label: b.label,
      crowdName: b.crowdName,
      type: b.type
    }))
  })
  
  // 验证分支标签是否正确
  const expectedLabels = ['高价值用户', '普通用户', '新用户', '未命中']
  let testPassed = true
  
  branches.forEach((branch, index) => {
    const expectedLabel = expectedLabels[index]
    if (branch.label !== expectedLabel) {
      console.error('❌ [测试失败] 分支标签不匹配:', {
        branchIndex: index,
        expected: expectedLabel,
        actual: branch.label
      })
      testPassed = false
    } else {
      console.log('✅ [测试通过] 分支标签正确:', {
        branchIndex: index,
        label: branch.label
      })
    }
  })
  
  // 测试创建分支预览线
  console.log('\n🔧 [测试] 测试创建分支预览线...')
  
  const previewInstances = previewLineSystem.createBranchPreviewLines(
    audienceSplitNode, 
    'INTERACTIVE', 
    { 
      justConfigured: true,
      config: audienceSplitNode.getData().config
    }
  )
  
  console.log('📊 [测试] 分支预览线创建结果:', {
    createdCount: previewInstances ? previewInstances.length : 0,
    instances: previewInstances ? previewInstances.map(instance => ({
      branchId: instance.branchId,
      branchLabel: instance.branchLabel,
      lineId: instance.line ? instance.line.id : null
    })) : []
  })
  
  // 验证预览线标签
  if (previewInstances && previewInstances.length > 0) {
    previewInstances.forEach((instance, index) => {
      const expectedLabel = expectedLabels[index]
      if (instance.branchLabel !== expectedLabel) {
        console.error('❌ [测试失败] 预览线标签不匹配:', {
          instanceIndex: index,
          expected: expectedLabel,
          actual: instance.branchLabel
        })
        testPassed = false
      } else {
        console.log('✅ [测试通过] 预览线标签正确:', {
          instanceIndex: index,
          label: instance.branchLabel
        })
      }
    })
  }
  
  return testPassed
}

/**
 * 测试删除节点后的预览线刷新
 */
function testPreviewLineRefreshAfterNodeDeletion() {
  console.log('\n🧪 [测试] 开始测试删除节点后预览线刷新...')
  
  // 创建两个人群分流节点
  const node1 = mockGraph.addNode({
    id: 'audience-split-1',
    x: 100,
    y: 100,
    width: 120,
    height: 40,
    data: {
      type: 'audience-split',
      nodeType: 'audience-split',
      isConfigured: true,
      config: {
        crowdLayers: [
          {
            id: 'crowd-a1',
            crowdName: 'VIP用户',
            crowdId: 'vip-users',
            order: 1
          },
          {
            id: 'crowd-a2',
            crowdName: '活跃用户',
            crowdId: 'active-users',
            order: 2
          }
        ]
      }
    }
  })
  
  const node2 = mockGraph.addNode({
    id: 'audience-split-2',
    x: 300,
    y: 100,
    width: 120,
    height: 40,
    data: {
      type: 'audience-split',
      nodeType: 'audience-split',
      isConfigured: true,
      config: {
        crowdLayers: [
          {
            id: 'crowd-b1',
            crowdName: '年轻用户',
            crowdId: 'young-users',
            order: 1
          },
          {
            id: 'crowd-b2',
            crowdName: '中年用户',
            crowdId: 'middle-age-users',
            order: 2
          }
        ]
      }
    }
  })
  
  // 为两个节点创建预览线
  previewLineSystem.createBranchPreviewLines(node1, 'INTERACTIVE', { 
    justConfigured: true,
    config: node1.getData().config
  })
  
  previewLineSystem.createBranchPreviewLines(node2, 'INTERACTIVE', { 
    justConfigured: true,
    config: node2.getData().config
  })
  
  console.log('✅ [测试] 两个人群分流节点的预览线已创建')
  
  // 删除第一个节点
  mockGraph.removeNode(node1.id)
  console.log('🗑️ [测试] 已删除第一个节点')
  
  // 刷新所有预览线
  previewLineSystem.manager.refreshAllPreviewLines(true) // isAfterNodeDeletion = true
  
  // 检查第二个节点的预览线是否仍然正确
  const remainingPreview = previewLineSystem.manager.previewLines?.get(node2.id)
  
  if (remainingPreview && Array.isArray(remainingPreview)) {
    console.log('📊 [测试] 剩余节点的预览线状态:', {
      nodeId: node2.id,
      previewCount: remainingPreview.length,
      labels: remainingPreview.map(instance => instance.branchLabel)
    })
    
    // 验证标签是否正确
    const expectedLabels = ['年轻用户', '中年用户', '未命中']
    let testPassed = true
    
    remainingPreview.forEach((instance, index) => {
      const expectedLabel = expectedLabels[index]
      if (instance.branchLabel !== expectedLabel) {
        console.error('❌ [测试失败] 删除节点后预览线标签错误:', {
          instanceIndex: index,
          expected: expectedLabel,
          actual: instance.branchLabel
        })
        testPassed = false
      } else {
        console.log('✅ [测试通过] 删除节点后预览线标签正确:', {
          instanceIndex: index,
          label: instance.branchLabel
        })
      }
    })
    
    return testPassed
  } else {
    console.error('❌ [测试失败] 删除节点后剩余节点的预览线丢失')
    return false
  }
}

/**
 * 运行所有测试
 */
function runAllTests() {
  console.log('🚀 [测试套件] 开始运行预览线标签修复测试...')
  
  const results = {
    audienceSplitLabels: false,
    refreshAfterDeletion: false
  }
  
  try {
    // 测试1: 人群分流节点标签生成
    results.audienceSplitLabels = testAudienceSplitNodeLabels()
    
    // 测试2: 删除节点后预览线刷新
    results.refreshAfterDeletion = testPreviewLineRefreshAfterNodeDeletion()
    
  } catch (error) {
    console.error('❌ [测试套件] 测试执行出错:', error)
  }
  
  // 输出测试结果
  console.log('\n📊 [测试套件] 测试结果汇总:')
  console.log('- 人群分流节点标签生成:', results.audienceSplitLabels ? '✅ 通过' : '❌ 失败')
  console.log('- 删除节点后预览线刷新:', results.refreshAfterDeletion ? '✅ 通过' : '❌ 失败')
  
  const allPassed = Object.values(results).every(result => result === true)
  console.log('\n🎯 [测试套件] 总体结果:', allPassed ? '✅ 全部通过' : '❌ 存在失败')
  
  if (allPassed) {
    console.log('🎉 [测试套件] 预览线标签修复验证成功！人群分流节点现在能正确显示人群名称。')
  } else {
    console.log('⚠️ [测试套件] 部分测试失败，需要进一步检查修复逻辑。')
  }
  
  return allPassed
}

// 如果直接运行此文件，执行测试
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests()
}

export {
  testAudienceSplitNodeLabels,
  testPreviewLineRefreshAfterNodeDeletion,
  runAllTests
}