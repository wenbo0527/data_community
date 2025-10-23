/**
 * 性能优化模块测试
 * 测试 CacheManager 和 PerformanceMonitor 的功能
 */

import CacheManager from './CacheManager.js'
import PerformanceMonitor, { PerformanceUtils } from './PerformanceMonitor.js'

// 测试 CacheManager
function testCacheManager() {
  console.log('\n=== 测试 CacheManager ===\n')
  
  const cacheManager = new CacheManager()
  
  // 测试基本缓存操作
  console.log('1. 测试基本缓存操作:')
  cacheManager.set('branchInfo', 'node1', { branches: ['branch1', 'branch2'] })
  cacheManager.set('position', 'node1', { x: 100, y: 200 })
  
  console.log('   - 设置缓存:', cacheManager.get('branchInfo', 'node1'))
  console.log('   - 获取位置:', cacheManager.get('position', 'node1'))
  console.log('   - 缓存大小:', cacheManager.getSize('branchInfo'))
  
  // 测试缓存命中统计
  console.log('\n2. 测试缓存命中统计:')
  cacheManager.get('branchInfo', 'node1') // 命中
  cacheManager.get('branchInfo', 'node2') // 未命中
  
  const stats = cacheManager.getStats()
  console.log('   - 缓存统计:', stats)
  
  // 测试缓存清理
  console.log('\n3. 测试缓存清理:')
  console.log('   - 清理前大小:', cacheManager.getSize('branchInfo'))
  cacheManager.clear('branchInfo')
  console.log('   - 清理后大小:', cacheManager.getSize('branchInfo'))
  
  // 测试 LRU 缓存行为
  console.log('\n4. 测试 LRU 缓存行为:')
  // 设置多个缓存项来测试LRU行为
  cacheManager.set('position', 'a', { x: 1, y: 1 })
  cacheManager.set('position', 'b', { x: 2, y: 2 })
  cacheManager.set('position', 'c', { x: 3, y: 3 })
  
  // 访问一些项来更新访问顺序
  const valueA = cacheManager.get('position', 'a')
  const valueB = cacheManager.get('position', 'b')
  const valueC = cacheManager.get('position', 'c')
  
  console.log('   - LRU 缓存内容:', {
    a: valueA,
    b: valueB,
    c: valueC,
    size: cacheManager.getSize('position')
  })
  
  console.log('✅ CacheManager 测试完成')
}

// 测试 PerformanceMonitor
function testPerformanceMonitor() {
  console.log('\n=== 测试 PerformanceMonitor ===\n')
  
  const performanceMonitor = new PerformanceMonitor()
  
  // 模拟预览线数据
  const mockPreviewLines = new Map()
  mockPreviewLines.set('node1', {
    line: { id: 'line1' },
    state: 'active',
    sourceNodeId: 'node1'
  })
  mockPreviewLines.set('node2', {
    line: { id: 'line2' },
    state: 'connected',
    sourceNodeId: 'node2'
  })
  
  // 模拟拖拽状态管理器
  const mockDragStateManager = {
    isDragging: true,
    currentDragLine: 'line1',
    dragStartPosition: { x: 100, y: 100 }
  }
  
  // 测试性能任务
  console.log('1. 测试性能任务:')
  performanceMonitor.startTask('test-task', { type: 'calculation' })
  
  // 模拟一些操作
  setTimeout(() => {
    performanceMonitor.startTask('calculation-phase', { phase: 'calculation' })
    
    // 模拟计算延迟
    setTimeout(() => {
      performanceMonitor.endTask('calculation-phase', { success: true })
      
      const result = performanceMonitor.endTask('test-task', { nodes: 10 })
      console.log('   - 任务完成:', result)
      
      // 测试统计更新
      console.log('\n2. 测试统计更新:')
      performanceMonitor.updateStatistics(mockPreviewLines, mockDragStateManager)
      const stats = performanceMonitor.getStatistics()
      console.log('   - 统计信息:', stats)
      
      // 测试阈值检查
      console.log('\n3. 测试阈值检查:')
      const thresholds = performanceMonitor.checkThresholds({
        renderTime: 20,
        memoryUsage: 50 * 1024 * 1024 // 50MB
      })
      console.log('   - 阈值检查:', thresholds)
      
      // 测试内存使用情况
      console.log('\n4. 测试内存使用情况:')
      const memoryUsage = performanceMonitor.getMemoryUsage()
      console.log('   - 内存使用:', memoryUsage)
      
      // 测试 PerformanceUtils
      console.log('\n5. 测试 PerformanceUtils:')
      testPerformanceUtils()
      
      console.log('\n✅ PerformanceMonitor 测试完成')
      
    }, 50)
  }, 10)
}

// 测试 PerformanceUtils
function testPerformanceUtils() {
  // PerformanceUtils 已经单独导入
  
  // 测试防抖
  console.log('   - 测试防抖:')
  let debounceCount = 0
  const debouncedFn = PerformanceUtils.debounce(() => {
    debounceCount++
    console.log('     防抖函数执行，计数:', debounceCount)
  }, 100)
  
  // 快速调用多次
  debouncedFn()
  debouncedFn()
  debouncedFn()
  
  // 测试节流
  console.log('   - 测试节流:')
  let throttleCount = 0
  const throttledFn = PerformanceUtils.throttle(() => {
    throttleCount++
    console.log('     节流函数执行，计数:', throttleCount)
  }, 100)
  
  // 快速调用多次
  throttledFn()
  throttledFn()
  throttledFn()
  
  setTimeout(() => {
    throttledFn()
  }, 150)
}

// 集成测试
function testIntegration() {
  console.log('\n=== 集成测试 ===\n')
  
  const cacheManager = new CacheManager()
  const performanceMonitor = new PerformanceMonitor()
  
  // 关联性能监控器到缓存管理器
  cacheManager.performanceMonitor = performanceMonitor
  
  console.log('1. 测试缓存与性能监控集成:')
  
  // 开始性能任务
  performanceMonitor.startTask('integration-test', { type: 'cache-operations' })
  performanceMonitor.startTask('cache-operations', { phase: 'operations' })
  
  // 执行缓存操作
  for (let i = 0; i < 100; i++) {
    cacheManager.set('position', `node${i}`, { x: i * 10, y: i * 20 })
  }
  
  // 执行缓存查询
  for (let i = 0; i < 50; i++) {
    cacheManager.get('position', `node${i}`)
  }
  
  performanceMonitor.endTask('cache-operations', { success: true })
  
  // 获取缓存统计
  const cacheStats = cacheManager.getStats()
  console.log('   - 缓存统计:', cacheStats)
  
  // 结束性能任务
  const result = performanceMonitor.endTask('integration-test', { operations: 150 })
  console.log('   - 性能结果:', result)
  
  console.log('✅ 集成测试完成')
}

// 运行所有测试
function runAllTests() {
  console.log('🚀 开始性能优化模块测试\n')
  
  try {
    testCacheManager()
    
    setTimeout(() => {
      testPerformanceMonitor()
      
      setTimeout(() => {
        testIntegration()
        
        console.log('\n🎉 所有测试完成！')
      }, 500)
    }, 200)
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error)
  }
}

// 如果直接运行此文件
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests()
}

export {
  testCacheManager,
  testPerformanceMonitor,
  testIntegration,
  runAllTests
}