<template>
  <div class="preview-line-test">
    <h2>预览线系统测试</h2>
    
    <div class="test-controls">
      <button @click="createTestNode" class="btn-primary">创建测试节点</button>
      <button @click="createPreviewLine" class="btn-secondary">创建预览线</button>
      <button @click="clearCanvas" class="btn-danger">清空画布</button>
      <button @click="checkPreviewLines" class="btn-info">检查预览线</button>
    </div>
    
    <div class="test-info">
      <div class="info-section">
        <h3>画布状态</h3>
        <p>节点数量: {{ nodeCount }}</p>
        <p>边数量: {{ edgeCount }}</p>
        <p>预览线数量: {{ previewLineCount }}</p>
      </div>
      
      <div class="info-section">
        <h3>预览线详情</h3>
        <ul>
          <li v-for="line in previewLines" :key="line.id">
            ID: {{ line.id }}, 可见: {{ line.visible }}, 透明度: {{ line.opacity }}
          </li>
        </ul>
      </div>
      
      <div class="info-section">
        <h3>测试日志</h3>
        <div class="log-container">
          <div v-for="(log, index) in logs" :key="index" :class="['log-item', log.type]">
            [{{ log.time }}] {{ log.message }}
          </div>
        </div>
      </div>
    </div>
    
    <div ref="canvasContainer" class="canvas-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Graph, Shape } from '@antv/x6'

const canvasContainer = ref(null)
const graph = ref(null)
const nodeCount = ref(0)
const edgeCount = ref(0)
const previewLineCount = ref(0)
const previewLines = ref([])
const logs = ref([])

let testNodeCounter = 0

// 添加日志
const addLog = (message, type = 'info') => {
  logs.value.push({
    time: new Date().toLocaleTimeString(),
    message,
    type
  })
  console.log(`[PreviewLineTest] ${message}`)
}

// 初始化画布
const initGraph = () => {
  if (!canvasContainer.value) {
    addLog('画布容器未准备就绪', 'error')
    return
  }

  try {
    graph.value = new Graph({
      container: canvasContainer.value,
      width: 800,
      height: 600,
      background: {
        color: '#f5f5f5'
      },
      grid: {
        visible: true,
        type: 'doubleMesh',
        args: [
          {
            color: '#eee',
            thickness: 1
          },
          {
            color: '#ddd',
            thickness: 1,
            factor: 4
          }
        ]
      },
      connecting: {
        router: 'manhattan',
        connector: {
          name: 'rounded',
          args: {
            radius: 8
          }
        },
        anchor: 'center',
        connectionPoint: 'anchor',
        allowBlank: false,
        snap: {
          radius: 20
        },
        createEdge() {
          return new Shape.Edge({
            attrs: {
              line: {
                stroke: '#A2B1C3',
                strokeWidth: 2,
                targetMarker: {
                  name: 'block',
                  width: 12,
                  height: 8
                }
              }
            },
            zIndex: 0
          })
        }
      }
    })

    // 监听图形变化
    graph.value.on('cell:added', updateStats)
    graph.value.on('cell:removed', updateStats)
    
    addLog('画布初始化成功', 'success')
    updateStats()
  } catch (error) {
    addLog(`画布初始化失败: ${error.message}`, 'error')
  }
}

// 创建测试节点
const createTestNode = () => {
  if (!graph.value) {
    addLog('画布未初始化', 'error')
    return
  }

  testNodeCounter++
  const nodeId = `test-node-${testNodeCounter}`
  
  try {
    const node = graph.value.addNode({
      id: nodeId,
      x: 100 + (testNodeCounter - 1) * 150,
      y: 100,
      width: 120,
      height: 60,
      shape: 'rect',
      attrs: {
        body: {
          fill: '#5F95FF',
          stroke: '#5F95FF',
          rx: 6,
          ry: 6
        },
        text: {
          fill: 'white',
          text: `节点${testNodeCounter}`,
          fontSize: 14
        }
      },
      data: {
        type: 'audience-split',
        config: {
          crowdLayers: [
            { id: 'layer1', name: '层级1' },
            { id: 'layer2', name: '层级2' }
          ],
          unmatchBranch: { id: 'unmatch', name: '未匹配' }
        }
      }
    })
    
    addLog(`创建节点成功: ${nodeId}`, 'success')
    updateStats()
  } catch (error) {
    addLog(`创建节点失败: ${error.message}`, 'error')
  }
}

// 创建预览线
const createPreviewLine = () => {
  if (!graph.value) {
    addLog('画布未初始化', 'error')
    return
  }

  const nodes = graph.value.getNodes()
  if (nodes.length === 0) {
    addLog('没有可用的节点创建预览线', 'warn')
    return
  }

  const sourceNode = nodes[0]
  const previewLineId = `preview-line-${Date.now()}`
  
  try {
    // 计算目标位置
    const sourcePos = sourceNode.getPosition()
    const targetPos = {
      x: sourcePos.x + 200,
      y: sourcePos.y
    }
    
    const previewLine = graph.value.addEdge({
      id: previewLineId,
      source: sourceNode.id,
      target: targetPos,
      attrs: {
        line: {
          stroke: '#ff6b6b',
          strokeWidth: 2,
          strokeDasharray: '5,5',
          strokeOpacity: 0.8,
          targetMarker: {
            name: 'block',
            width: 8,
            height: 6,
            fill: '#ff6b6b'
          }
        }
      },
      zIndex: 1000,
      data: {
        isPreview: true,
        type: 'preview'
      }
    })
    
    // 强制设置可见性
    previewLine.setVisible(true)
    previewLine.setZIndex(1000)
    
    addLog(`创建预览线成功: ${previewLineId}`, 'success')
    updateStats()
  } catch (error) {
    addLog(`创建预览线失败: ${error.message}`, 'error')
  }
}

// 检查预览线
const checkPreviewLines = () => {
  if (!graph.value) {
    addLog('画布未初始化', 'error')
    return
  }

  const edges = graph.value.getEdges()
  const previewEdges = edges.filter(edge => {
    const data = edge.getData()
    return data && (data.isPreview || data.type === 'preview')
  })
  
  previewLines.value = previewEdges.map(edge => ({
    id: edge.id,
    visible: edge.isVisible(),
    opacity: edge.getAttrByPath('line/strokeOpacity') || edge.getAttrByPath('line/opacity') || 1,
    zIndex: edge.getZIndex(),
    stroke: edge.getAttrByPath('line/stroke'),
    strokeWidth: edge.getAttrByPath('line/strokeWidth')
  }))
  
  addLog(`检查到 ${previewEdges.length} 条预览线`, 'info')
  
  // 详细检查每条预览线
  previewEdges.forEach(edge => {
    const attrs = edge.getAttrs()
    addLog(`预览线 ${edge.id}: 可见=${edge.isVisible()}, z-index=${edge.getZIndex()}, 透明度=${edge.getAttrByPath('line/strokeOpacity')}`, 'info')
  })
}

// 清空画布
const clearCanvas = () => {
  if (!graph.value) {
    addLog('画布未初始化', 'error')
    return
  }

  graph.value.clearCells()
  testNodeCounter = 0
  previewLines.value = []
  addLog('画布已清空', 'info')
  updateStats()
}

// 更新统计信息
const updateStats = () => {
  if (!graph.value) return
  
  const nodes = graph.value.getNodes()
  const edges = graph.value.getEdges()
  const previewEdges = edges.filter(edge => {
    const data = edge.getData()
    return data && (data.isPreview || data.type === 'preview')
  })
  
  nodeCount.value = nodes.length
  edgeCount.value = edges.length
  previewLineCount.value = previewEdges.length
}

onMounted(() => {
  addLog('组件挂载，开始初始化', 'info')
  initGraph()
})

onUnmounted(() => {
  if (graph.value) {
    graph.value.dispose()
  }
})
</script>

<style scoped>
.preview-line-test {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.test-controls {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.btn-primary, .btn-secondary, .btn-danger, .btn-info {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-primary {
  background-color: #5F95FF;
  color: white;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-info {
  background-color: #17a2b8;
  color: white;
}

.test-info {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.info-section {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 6px;
  border: 1px solid #dee2e6;
}

.info-section h3 {
  margin: 0 0 10px 0;
  font-size: 16px;
  color: #495057;
}

.log-container {
  max-height: 200px;
  overflow-y: auto;
  font-family: monospace;
  font-size: 12px;
}

.log-item {
  padding: 2px 0;
  border-bottom: 1px solid #eee;
}

.log-item.success {
  color: #28a745;
}

.log-item.error {
  color: #dc3545;
}

.log-item.warn {
  color: #ffc107;
}

.log-item.info {
  color: #17a2b8;
}

.canvas-container {
  width: 100%;
  height: 600px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
}
</style>