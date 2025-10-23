/**
 * 分支分析器测试套件
 * 测试 BranchAnalyzer.js 模块的功能
 */

import { BranchAnalyzer, BranchLabelUtils, createBranchAnalyzer, defaultBranchAnalyzer } from './BranchAnalyzer.js'

/**
 * 分支分析器测试类
 */
class BranchAnalyzerTestSuite {
  constructor() {
    this.testResults = {
      passed: 0,
      failed: 0,
      errors: 0
    }
    
    // 创建测试用的分支分析器实例
    this.analyzer = createBranchAnalyzer({
      enableDebug: true,
      cacheTimeout: 1000 // 短缓存时间便于测试
    })
  }

  /**
   * 运行所有测试
   */
  async runAllTests() {
    console.log('🧪 开始分支分析器测试套件\n')
    
    try {
      // 测试分支标签工具类
      await this.testBranchLabelUtils()
      
      // 测试人群分流分支生成
      await this.testAudienceSplitBranches()
      
      // 测试事件分流分支生成
      await this.testEventSplitBranches()
      
      // 测试AB测试分支生成
      await this.testAbTestBranches()
      
      // 测试缓存机制
      await this.testCacheMechanism()
      
      // 测试配置变化检测
      await this.testConfigChangeDetection()
      
      // 测试存储分支验证
      await this.testStoredBranchValidation()
      
      // 测试工厂函数和默认实例
      await this.testFactoryAndDefaults()
      
    } catch (error) {
      console.error('💥 测试套件执行异常:', error)
      this.testResults.errors++
    }
    
    this.printTestSummary()
  }

  /**
   * 测试分支标签工具类
   */
  async testBranchLabelUtils() {
    console.log('🧪 开始测试: 分支标签工具类')
    
    try {
      // 测试生成默认标签
      const audienceLabel = BranchLabelUtils.generateDefaultLabel('audience_1', 0, 'audience-split')
      console.log('人群分流标签:', audienceLabel)
      this.assert(audienceLabel === '人群1', '人群分流标签生成')
      
      const eventLabel = BranchLabelUtils.generateDefaultLabel('event_yes', 0, 'event-split')
      console.log('事件分流标签:', eventLabel)
      this.assert(eventLabel === '是', '事件分流标签生成')
      
      const abTestLabel = BranchLabelUtils.generateDefaultLabel('group_a', 0, 'ab-test')
      console.log('AB测试标签:', abTestLabel)
      this.assert(abTestLabel === 'A组', 'AB测试标签生成')
      
      // 测试标签验证和修复
      const branch = { id: 'test_branch', label: '', crowdName: '测试人群' }
      const fixedBranch = BranchLabelUtils.validateAndFixBranchLabel(branch, 0, 'audience-split')
      console.log('修复后的分支:', fixedBranch)
      this.assert(fixedBranch.label === '测试人群', '分支标签修复')
      
      console.log('✅ 测试通过: 分支标签工具类\n')
      this.testResults.passed++
      
    } catch (error) {
      console.error('❌ 测试失败: 分支标签工具类', error)
      this.testResults.failed++
    }
  }

  /**
   * 测试人群分流分支生成
   */
  async testAudienceSplitBranches() {
    console.log('🧪 开始测试: 人群分流分支生成')
    
    try {
      // 创建模拟的人群分流节点
      const audienceNode = {
        id: 'audience_node_1',
        getData: () => ({
          type: 'audience-split',
          config: {
            crowdLayers: [
              { id: 'crowd_1', crowdName: '高价值用户', crowdId: 'c1' },
              { id: 'crowd_2', crowdName: '普通用户', crowdId: 'c2' }
            ],
            unmatchBranch: {
              id: 'unmatch_default',
              crowdName: '未命中人群',
              crowdId: null
            }
          }
        })
      }
      
      const branches = this.analyzer.getNodeBranches(audienceNode)
      console.log('人群分流分支:', branches)
      
      this.assert(branches.length === 3, '人群分流分支数量正确')
      this.assert(branches[0].label === '高价值用户', '第一个人群标签正确')
      this.assert(branches[1].label === '普通用户', '第二个人群标签正确')
      this.assert(branches[2].label === '未命中人群', '未命中分支标签正确')
      this.assert(branches[2].isDefault === true, '未命中分支标记正确')
      
      console.log('✅ 测试通过: 人群分流分支生成\n')
      this.testResults.passed++
      
    } catch (error) {
      console.error('❌ 测试失败: 人群分流分支生成', error)
      this.testResults.failed++
    }
  }

  /**
   * 测试事件分流分支生成
   */
  async testEventSplitBranches() {
    console.log('🧪 开始测试: 事件分流分支生成')
    
    try {
      // 创建模拟的事件分流节点
      const eventNode = {
        id: 'event_node_1',
        getData: () => ({
          type: 'event-split',
          config: {
            eventCondition: 'user_login',
            yesLabel: '已登录',
            noLabel: '未登录',
            isConfigured: true
          }
        })
      }
      
      const branches = this.analyzer.getNodeBranches(eventNode)
      console.log('事件分流分支:', branches)
      
      this.assert(branches.length === 2, '事件分流分支数量正确')
      this.assert(branches[0].label === '已登录', '是分支标签正确')
      this.assert(branches[1].label === '未登录', '否分支标签正确')
      this.assert(branches[0].type === 'event', '分支类型正确')
      
      console.log('✅ 测试通过: 事件分流分支生成\n')
      this.testResults.passed++
      
    } catch (error) {
      console.error('❌ 测试失败: 事件分流分支生成', error)
      this.testResults.failed++
    }
  }

  /**
   * 测试AB测试分支生成
   */
  async testAbTestBranches() {
    console.log('🧪 开始测试: AB测试分支生成')
    
    try {
      // 创建模拟的AB测试节点
      const abTestNode = {
        id: 'ab_test_node_1',
        getData: () => ({
          type: 'ab-test',
          config: {
            versions: [
              { id: 'version_a', name: '版本A', ratio: 50 },
              { id: 'version_b', name: '版本B', ratio: 50 }
            ]
          }
        })
      }
      
      const branches = this.analyzer.getNodeBranches(abTestNode)
      console.log('AB测试分支:', branches)
      
      this.assert(branches.length === 2, 'AB测试分支数量正确')
      this.assert(branches[0].label === '版本A', 'A版本标签正确')
      this.assert(branches[1].label === '版本B', 'B版本标签正确')
      this.assert(branches[0].ratio === 50, 'A版本比例正确')
      this.assert(branches[1].ratio === 50, 'B版本比例正确')
      
      console.log('✅ 测试通过: AB测试分支生成\n')
      this.testResults.passed++
      
    } catch (error) {
      console.error('❌ 测试失败: AB测试分支生成', error)
      this.testResults.failed++
    }
  }

  /**
   * 测试缓存机制
   */
  async testCacheMechanism() {
    console.log('🧪 开始测试: 缓存机制')
    
    try {
      const testNode = {
        id: 'cache_test_node',
        getData: () => ({
          type: 'audience-split',
          config: {
            crowdLayers: [
              { id: 'crowd_1', crowdName: '测试人群', crowdId: 'c1' }
            ]
          }
        })
      }
      
      // 第一次调用，应该生成并缓存
      const branches1 = this.analyzer.getNodeBranches(testNode)
      console.log('第一次调用结果:', branches1.length)
      
      // 第二次调用，应该使用缓存
      const branches2 = this.analyzer.getNodeBranches(testNode)
      console.log('第二次调用结果:', branches2.length)
      
      this.assert(branches1.length === branches2.length, '缓存结果一致')
      
      // 强制刷新缓存
      const branches3 = this.analyzer.getNodeBranches(testNode, null, true)
      console.log('强制刷新后结果:', branches3.length)
      
      this.assert(branches3.length === branches1.length, '强制刷新结果正确')
      
      // 测试缓存清理
      this.analyzer.clearNodeCache('cache_test_node')
      console.log('缓存已清理')
      
      console.log('✅ 测试通过: 缓存机制\n')
      this.testResults.passed++
      
    } catch (error) {
      console.error('❌ 测试失败: 缓存机制', error)
      this.testResults.failed++
    }
  }

  /**
   * 测试配置变化检测
   */
  async testConfigChangeDetection() {
    console.log('🧪 开始测试: 配置变化检测')
    
    try {
      const nodeData = {
        type: 'audience-split',
        config: {
          crowdLayers: [
            { id: 'crowd_1', crowdName: '原始人群', crowdId: 'c1' }
          ]
        }
      }
      
      const testNode = {
        id: 'config_change_test_node',
        getData: () => nodeData
      }
      
      // 第一次调用
      const branches1 = this.analyzer.getNodeBranches(testNode)
      console.log('原始配置分支数:', branches1.length)
      
      // 修改配置
      nodeData.config.crowdLayers.push({
        id: 'crowd_2',
        crowdName: '新增人群',
        crowdId: 'c2'
      })
      
      // 再次调用，应该检测到配置变化
      const branches2 = this.analyzer.getNodeBranches(testNode)
      console.log('修改配置后分支数:', branches2.length)
      
      this.assert(branches2.length > branches1.length, '配置变化检测正确')
      
      console.log('✅ 测试通过: 配置变化检测\n')
      this.testResults.passed++
      
    } catch (error) {
      console.error('❌ 测试失败: 配置变化检测', error)
      this.testResults.failed++
    }
  }

  /**
   * 测试存储分支验证
   */
  async testStoredBranchValidation() {
    console.log('🧪 开始测试: 存储分支验证')
    
    try {
      // 测试有效的存储分支
      const validConfig = {
        branches: [
          { id: 'stored_1', label: '存储分支1', type: 'audience', crowdName: '存储人群1' },
          { id: 'stored_2', label: '存储分支2', type: 'audience', crowdName: '存储人群2' }
        ],
        crowdLayers: [
          { id: 'crowd_1', crowdName: '存储人群1', crowdId: 'c1' },
          { id: 'crowd_2', crowdName: '存储人群2', crowdId: 'c2' }
        ]
      }
      
      const isValid = this.analyzer.validateStoredBranches('audience-split', validConfig, 'test_node')
      console.log('有效存储分支验证结果:', isValid)
      this.assert(isValid === true, '有效存储分支验证通过')
      
      // 测试无效的存储分支
      const invalidConfig = {
        branches: [
          { id: 'invalid_1', label: '无效分支', type: 'audience' }
        ]
        // 缺少 crowdLayers 配置
      }
      
      const isInvalid = this.analyzer.validateStoredBranches('audience-split', invalidConfig, 'test_node')
      console.log('无效存储分支验证结果:', isInvalid)
      this.assert(isInvalid === true, '存储分支仍然有效（有分支数据）')
      
      console.log('✅ 测试通过: 存储分支验证\n')
      this.testResults.passed++
      
    } catch (error) {
      console.error('❌ 测试失败: 存储分支验证', error)
      this.testResults.failed++
    }
  }

  /**
   * 测试工厂函数和默认实例
   */
  async testFactoryAndDefaults() {
    console.log('🧪 开始测试: 工厂函数和默认实例')
    
    try {
      // 测试工厂函数
      const customAnalyzer = createBranchAnalyzer({
        enableDebug: false,
        cacheTimeout: 2000
      })
      
      this.assert(customAnalyzer instanceof BranchAnalyzer, '工厂函数创建实例正确')
      this.assert(customAnalyzer.config.cacheTimeout === 2000, '自定义配置生效')
      
      // 测试默认实例
      this.assert(defaultBranchAnalyzer instanceof BranchAnalyzer, '默认实例类型正确')
      this.assert(defaultBranchAnalyzer.config.enableDebug === false, '默认配置正确')
      
      // 清理资源
      customAnalyzer.destroy()
      console.log('自定义分析器已销毁')
      
      console.log('✅ 测试通过: 工厂函数和默认实例\n')
      this.testResults.passed++
      
    } catch (error) {
      console.error('❌ 测试失败: 工厂函数和默认实例', error)
      this.testResults.failed++
    }
  }

  /**
   * 断言辅助方法
   */
  assert(condition, message) {
    if (!condition) {
      throw new Error(`断言失败: ${message}`)
    }
  }

  /**
   * 打印测试总结
   */
  printTestSummary() {
    console.log('\n==================================================')
    console.log('📊 测试总结')
    console.log(`✅ 通过: ${this.testResults.passed}`)
    console.log(`❌ 失败: ${this.testResults.failed}`)
    console.log(`💥 异常: ${this.testResults.errors}`)
    console.log(`📈 总计: ${this.testResults.passed + this.testResults.failed + this.testResults.errors}`)
    
    if (this.testResults.failed === 0 && this.testResults.errors === 0) {
      console.log('\n🎉 分支分析器测试完成!')
    } else {
      console.log('\n⚠️ 部分测试未通过，请检查实现')
    }
    
    // 清理测试资源
    this.analyzer.destroy()
  }
}

// 运行测试
const testSuite = new BranchAnalyzerTestSuite()
testSuite.runAllTests().catch(error => {
  console.error('💥 测试套件执行失败:', error)
})