/**
 * PositionCalculator 模块测试文件
 * 测试位置计算器的各项功能
 */

import { PositionCalculator } from './PositionCalculator.js'

// 模拟节点数据
function createMockNode(id, x, y, width = 120, height = 60) {
  return {
    id: id,
    position: { x, y },
    size: { width, height },
    getBBox: () => ({ x, y, width, height }),
    getPosition: () => ({ x, y }),
    getSize: () => ({ width, height }),
    getPortProp: (port, prop) => {
      if (port === 'out' && prop === 'position') {
        return { x: x + width / 2, y: y + height }
      }
      if (port === 'in' && prop === 'position') {
        return { x: x + width / 2, y: y }
      }
      return null
    }
  }
}

// 模拟预览线数据
function createMockPreviewLine(id, sourceNode, targetNode) {
  return {
    id: id,
    sourceNode: sourceNode,
    targetNode: targetNode,
    source: { cell: sourceNode.id, port: 'out' },
    target: { cell: targetNode.id, port: 'in' },
    router: {
      name: 'manhattan',
      args: {
        padding: 20,
        step: 10,
        offset: 0,
        excludeEnds: ['source']
      }
    },
    attrs: {
      line: {
        stroke: '#1890ff',
        strokeWidth: 2
      }
    }
  }
}

// 模拟DOM元素
function createMockDOMElement(x, y, width, height) {
  return {
    getBoundingClientRect: () => ({
      x: x,
      y: y,
      width: width,
      height: height,
      left: x,
      top: y,
      right: x + width,
      bottom: y + height
    }),
    offsetLeft: x,
    offsetTop: y,
    offsetWidth: width,
    offsetHeight: height
  }
}

// 模拟图形实例
function createMockGraph() {
  const nodes = new Map()
  
  return {
    getCellById: (id) => {
      return nodes.get(id) || null
    },
    addNode: (node) => {
      nodes.set(node.id, node)
    },
    findViewByCell: (node) => {
      // 模拟节点视图
      return {
        el: createMockDOMElement(
          node.position.x, 
          node.position.y, 
          node.size.width, 
          node.size.height
        )
      }
    },
    container: {
      getBoundingClientRect: () => ({
        left: 0,
        top: 0,
        width: 1000,
        height: 800
      })
    },
    clientToGraph: (x, y) => ({ x, y })
  }
}

// 测试位置计算器功能
function testPositionCalculator() {
  console.log('🧪 开始测试 PositionCalculator 模块...')
  
  // 创建模拟图形实例
  const mockGraph = createMockGraph()
  
  // 创建位置计算器实例
  const calculator = new PositionCalculator(mockGraph, {
    enableDebug: true,
    syncThreshold: 5,
    correctionThreshold: 10
  })
  
  console.log('✅ 位置计算器实例创建成功')
  
  // 测试1: 节点中心位置计算
  console.log('\n📍 测试1: 节点中心位置计算')
  const node1 = createMockNode('node1', 100, 200, 120, 60)
  const node2 = createMockNode('node2', 300, 200, 120, 60)
  
  // 将节点添加到模拟图形实例
  mockGraph.addNode(node1)
  mockGraph.addNode(node2)
  
  // 模拟DOM查询
  global.document = {
    querySelector: (selector) => {
      if (selector.includes('node1')) {
        return createMockDOMElement(100, 200, 120, 60)
      }
      if (selector.includes('node2')) {
        return createMockDOMElement(300, 200, 120, 60)
      }
      return null
    }
  }
  
  const center1 = calculator.getActualNodeCenter(node1)
  console.log('节点中心位置:', center1)
  console.log('预期中心位置: { x: 160, y: 230 }')
  
  // 测试2: 端口位置计算
  console.log('\n🔌 测试2: 端口位置计算')
  const outPortPos = calculator.calculateOutPortPosition(node1)
  const inPortPos = calculator.calculateInPortPosition(node1)
  
  console.log('出口端口位置:', outPortPos)
  console.log('入口端口位置:', inPortPos)
  
  // 测试3: 预览线位置同步
  console.log('\n🔄 测试3: 预览线位置同步')
  const previewLine = createMockPreviewLine('line1', node1, node2)
  
  // 模拟预览线实例
  const mockPreviewInstance = {
    line: {
      getSourcePoint: () => ({ x: 160, y: 260 }),
      setSource: (source) => {
        console.log('设置预览线源:', source)
      },
      prop: (key, value) => {
        console.log(`设置预览线属性 ${key}:`, value)
      }
    },
    sourceNode: node1
  }
  
  const syncResult = calculator.syncPreviewLinePosition(mockPreviewInstance)
  console.log('同步结果:', syncResult)
  
  // 测试4: 坐标校验和修正
  console.log('\n🔧 测试4: 坐标校验和修正')
  const invalidPreviewLine = {
    ...previewLine,
    source: {
      ...previewLine.source,
      x: 50,  // 错误的x坐标
      y: 150  // 错误的y坐标
    }
  }
  
  const mockInvalidInstance = {
    line: {
      getSourcePoint: () => ({ x: 50, y: 150 }),
      setSource: (source) => {
        console.log('修正预览线源:', source)
        // 模拟设置成功后的getSourcePoint返回值
        this.getSourcePoint = () => source
      }
    },
    sourceNode: node1
  }
  
  const correctionResult = calculator.validateAndCorrectPreviewLineCoordinates(mockInvalidInstance)
  console.log('校验修正结果:', correctionResult)
  
  // 测试5: 距离计算
  console.log('\n📏 测试5: 距离计算')
  const point1 = { x: 0, y: 0 }
  const point2 = { x: 3, y: 4 }
  const distance = calculator.calculatePositionDifference(point1, point2)
  console.log(`点 ${JSON.stringify(point1)} 到点 ${JSON.stringify(point2)} 的距离:`, distance)
  console.log('预期距离: 5')
  
  // 测试6: 批量同步测试
  console.log('\n🔄 测试6: 批量同步测试')
  const batchInstances = [mockPreviewInstance]
  const batchResult = calculator.batchSyncPositions(batchInstances)
  console.log('批量同步结果:', batchResult)
  
  // 测试7: 获取统计信息
  console.log('\n📊 测试7: 获取统计信息')
  const stats = calculator.getCalculationStatistics()
  console.log('计算器统计信息:', stats)
  
  // 测试8: 更新选项
  console.log('\n⚙️ 测试8: 更新选项')
  calculator.updateOptions({ coordinateThreshold: 15 })
  const newStats = calculator.getCalculationStatistics()
  console.log('更新后的统计信息:', newStats)
  
  // 测试9: 销毁计算器
  console.log('\n🗑️ 测试9: 销毁计算器')
  calculator.destroy()
  console.log('计算器已销毁')
  
  console.log('\n🎉 PositionCalculator 模块测试完成！')
}

// 运行测试
testPositionCalculator()