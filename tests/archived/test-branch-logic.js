/**
 * 人群分流节点分支逻辑测试脚本
 * 专门测试分支信息获取和处理逻辑
 */

// 测试用例数据
const testCases = {
  // 正确配置的人群分流节点
  validAudienceSplit: {
    nodeType: 'audience-split',
    nodeConfig: {
      crowdLayers: [
        { id: 'crowd-1', crowdName: '高价值用户', crowdId: 'c001', order: 1 },
        { id: 'crowd-2', crowdName: '普通用户', crowdId: 'c002', order: 2 }
      ],
      unmatchBranch: {
        id: 'unmatch',
        name: '未命中人群',
        crowdName: '未命中人群',
        crowdId: null,
        order: 3
      }
    },
    nodeId: 'test-audience-split-1'
  },
  
  // 无配置的人群分流节点
  emptyAudienceSplit: {
    nodeType: 'audience-split',
    nodeConfig: {},
    nodeId: 'test-audience-split-2'
  },
  
  // 只有crowdLayers没有unmatchBranch的节点
  partialAudienceSplit: {
    nodeType: 'audience-split',
    nodeConfig: {
      crowdLayers: [
        { id: 'crowd-1', crowdName: '测试人群', crowdId: 'c001' }
      ]
    },
    nodeId: 'test-audience-split-3'
  },
  
  // crowdLayers为空数组的节点
  emptyCrowdLayers: {
    nodeType: 'audience-split',
    nodeConfig: {
      crowdLayers: []
    },
    nodeId: 'test-audience-split-4'
  },
  
  // crowdLayers不是数组的节点
  invalidCrowdLayers: {
    nodeType: 'audience-split',
    nodeConfig: {
      crowdLayers: 'invalid'
    },
    nodeId: 'test-audience-split-5'
  }
};

// 模拟UnifiedPreviewLineManager的关键方法
class MockPreviewLineManager {
  constructor() {
    this.debugMode = true;
  }
  
  /**
   * 验证存储的分支数据是否基于有效配置
   */
  validateStoredBranches(nodeType, nodeConfig, nodeId) {
    console.log(`\n🔍 验证分支数据 - 节点: ${nodeId}, 类型: ${nodeType}`);
    console.log('配置:', JSON.stringify(nodeConfig, null, 2));
    
    switch (nodeType) {
      case 'audience-split':
        const isValid = nodeConfig.crowdLayers && 
               Array.isArray(nodeConfig.crowdLayers) && 
               nodeConfig.crowdLayers.length > 0;
        
        console.log(`验证结果: ${isValid ? '✅ 有效' : '❌ 无效'}`);
        if (!isValid) {
          if (!nodeConfig.crowdLayers) {
            console.log('原因: 缺少 crowdLayers 配置');
          } else if (!Array.isArray(nodeConfig.crowdLayers)) {
            console.log('原因: crowdLayers 不是数组');
          } else if (nodeConfig.crowdLayers.length === 0) {
            console.log('原因: crowdLayers 为空数组');
          }
        }
        return isValid;
        
      case 'event-split':
        return !!(nodeConfig.eventCondition || 
                 nodeConfig.yesLabel || 
                 nodeConfig.noLabel);
        
      case 'ab-test':
        return !!(
          (nodeConfig.versions && Array.isArray(nodeConfig.versions) && nodeConfig.versions.length > 0) ||
          nodeConfig.groupALabel || 
          nodeConfig.groupBLabel || 
          nodeConfig.groupARatio || 
          nodeConfig.groupBRatio
        );
        
      default:
        return true;
    }
  }
  
  /**
   * 根据节点类型生成分支信息
   */
  generateBranchesByType(nodeType, nodeConfig, nodeId) {
    console.log(`\n🌿 生成分支信息 - 节点: ${nodeId}, 类型: ${nodeType}`);
    console.log('配置:', JSON.stringify(nodeConfig, null, 2));
    
    switch (nodeType) {
      case 'audience-split':
        // 人群分流：根据配置的人群层数生成分支
        if (nodeConfig.crowdLayers && Array.isArray(nodeConfig.crowdLayers)) {
          const branches = nodeConfig.crowdLayers.map((layer, index) => ({
            id: layer.id || `audience_${index}`,
            label: layer.crowdName || `人群${index + 1}`,
            crowdName: layer.crowdName || `人群${index + 1}`,
            type: 'audience',
            crowdId: layer.crowdId,
            order: layer.order || index + 1
          }));
          
          // 从配置中读取未命中分支信息
          if (nodeConfig.unmatchBranch) {
            branches.push({
              id: nodeConfig.unmatchBranch.id || 'unmatch_default',
              label: nodeConfig.unmatchBranch.name || '未命中人群',
              crowdName: nodeConfig.unmatchBranch.crowdName || nodeConfig.unmatchBranch.name || '未命中人群',
              type: 'audience',
              crowdId: nodeConfig.unmatchBranch.crowdId || null,
              order: nodeConfig.unmatchBranch.order || branches.length + 1,
              isDefault: true
            });
          }
          
          console.log(`✅ 生成 ${branches.length} 个分支:`);
          branches.forEach((branch, index) => {
            console.log(`  ${index + 1}. ${branch.label} (ID: ${branch.id}, 类型: ${branch.type})`);
          });
          
          return branches;
        }
        
        // 如果没有配置人群层，返回空数组，不创建默认分支
        console.log('⏭️ 人群分流节点未配置，不生成默认分支');
        return [];
        
      case 'event-split':
        // 事件分流：只有在有配置时才生成分支
        if (nodeConfig.eventCondition || nodeConfig.yesLabel || nodeConfig.noLabel) {
          const eventBranches = [
            { id: 'event_yes', label: nodeConfig.yesLabel || '是', type: 'event' },
            { id: 'event_no', label: nodeConfig.noLabel || '否', type: 'event' }
          ];
          
          return eventBranches;
        }
        return [];
        
      case 'ab-test':
        // AB测试：根据配置的版本数生成分支
        if (nodeConfig.versions && Array.isArray(nodeConfig.versions)) {
          return nodeConfig.versions.map((version, index) => ({
            id: version.id || `version_${index}`,
            label: version.name || `版本${index + 1}`,
            type: 'ab-test',
            ratio: version.ratio
          }));
        }
        
        // 如果有AB测试的基本配置，生成默认分支
        if (nodeConfig.groupALabel || nodeConfig.groupBLabel || nodeConfig.groupARatio || nodeConfig.groupBRatio) {
          return [
            { id: 'group_a', label: nodeConfig.groupALabel || 'A组', type: 'ab-test', ratio: nodeConfig.groupARatio || 50 },
            { id: 'group_b', label: nodeConfig.groupBLabel || 'B组', type: 'ab-test', ratio: nodeConfig.groupBRatio || 50 }
          ];
        }
        return [];
        
      default:
        return [];
    }
  }
}

// 运行测试
function runBranchLogicTests() {
  console.log('🎯 人群分流节点分支逻辑测试开始');
  console.log('='.repeat(60));
  
  const manager = new MockPreviewLineManager();
  let totalTests = 0;
  let passedTests = 0;
  
  // 测试每个用例
  Object.entries(testCases).forEach(([testName, testCase]) => {
    console.log(`\n📋 测试用例: ${testName}`);
    console.log('-'.repeat(40));
    
    totalTests += 2; // 每个用例测试验证和生成两个方法
    
    // 测试验证方法
    try {
      const isValid = manager.validateStoredBranches(
        testCase.nodeType, 
        testCase.nodeConfig, 
        testCase.nodeId
      );
      
      // 根据测试用例名称判断期望结果
      const shouldBeValid = testName === 'validAudienceSplit' || testName === 'partialAudienceSplit';
      
      if (isValid === shouldBeValid) {
        console.log('✅ validateStoredBranches 测试通过');
        passedTests++;
      } else {
        console.log(`❌ validateStoredBranches 测试失败 - 期望: ${shouldBeValid}, 实际: ${isValid}`);
      }
    } catch (error) {
      console.log(`❌ validateStoredBranches 测试异常: ${error.message}`);
    }
    
    // 测试生成方法
    try {
      const branches = manager.generateBranchesByType(
        testCase.nodeType, 
        testCase.nodeConfig, 
        testCase.nodeId
      );
      
      // 根据测试用例判断期望的分支数量
      let expectedBranchCount = 0;
      if (testName === 'validAudienceSplit') {
        expectedBranchCount = 3; // 2个人群 + 1个未命中
      } else if (testName === 'partialAudienceSplit') {
        expectedBranchCount = 1; // 1个人群，没有未命中分支
      } else {
        expectedBranchCount = 0; // 其他情况应该返回空数组
      }
      
      if (branches.length === expectedBranchCount) {
        console.log('✅ generateBranchesByType 测试通过');
        passedTests++;
      } else {
        console.log(`❌ generateBranchesByType 测试失败 - 期望分支数: ${expectedBranchCount}, 实际分支数: ${branches.length}`);
      }
    } catch (error) {
      console.log(`❌ generateBranchesByType 测试异常: ${error.message}`);
    }
  });
  
  // 输出测试总结
  console.log('\n' + '='.repeat(60));
  console.log('📊 测试总结:');
  console.log(`总测试数: ${totalTests}`);
  console.log(`通过测试: ${passedTests}`);
  console.log(`失败测试: ${totalTests - passedTests}`);
  console.log(`通过率: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  if (passedTests === totalTests) {
    console.log('🎉 所有测试通过！分支逻辑工作正常');
  } else {
    console.log('⚠️ 部分测试失败，需要检查分支逻辑');
    provideBranchFixSuggestions();
  }
}

// 提供分支逻辑修复建议
function provideBranchFixSuggestions() {
  console.log('\n💡 分支逻辑修复建议:');
  console.log('1. 确保 crowdLayers 配置正确且为非空数组');
  console.log('2. 检查 unmatchBranch 配置是否正确添加到分支列表');
  console.log('3. 验证分支ID和标签的生成逻辑');
  console.log('4. 确保分支类型和顺序正确设置');
  console.log('5. 检查空配置情况下的处理逻辑');
  console.log('6. 验证分支数据结构的完整性');
}

// 如果在Node.js环境中运行
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    runBranchLogicTests,
    testCases,
    MockPreviewLineManager
  };
}

// 如果在浏览器环境中运行
if (typeof window !== 'undefined') {
  window.runBranchLogicTests = runBranchLogicTests;
  window.testCases = testCases;
  window.MockPreviewLineManager = MockPreviewLineManager;
}

// 自动运行测试
runBranchLogicTests();