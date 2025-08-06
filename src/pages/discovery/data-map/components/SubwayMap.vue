<template>
  <div class="subway-map-container">
    <div ref="container" class="subway-canvas"></div>
    <a-drawer 
      v-model:visible="showDrawer" 
      width="420"
      title="指标详情"
      placement="right"
    >
      <IndicatorDetail :node="activeData" />
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Graph } from '@antv/x6'
import { registerStationNode } from './nodes/StationNode'
import IndicatorDetail from './IndicatorDetail.vue'

const container = ref<HTMLDivElement>()
const showDrawer = ref(false)
const activeData = ref()

let graph: Graph

onMounted(() => {
  registerStationNode()
  
  graph = new Graph({
    container: container.value!,
    grid: {
      visible: true,
      type: 'mesh',
      args: {
        color: '#e8e8e8',
        thickness: 1
      }
    },
    panning: {
      enabled: true,
      eventTypes: ['leftMouseDown', 'mouseWheel']
    },
    mousewheel: {
      enabled: true,
      modifiers: 'ctrl',
      factor: 1.1,
      maxScale: 3,
      minScale: 0.5
    },
    background: {
      color: '#f8f9fa'
    }
  })

  // 载入节点数据
  const nodes = [
    // 规模线 (青绿色 #00B2A9)
    { 
      id: 'S1', 
      data: { 
        label: '授信审批', 
        level: 2, 
        lineColor: '#00B2A9', 
        miniTrend: [1, 2, 3, 2],
        kpis: ['通过率', '平均审批时长'],
        value: '85.6%',
        unit: '',
        definition: '信贷业务中对客户申请进行风险评估和审批决策的核心环节',
        description: '用于监控授信审批效率和质量，支持风险管控决策',
        isTransfer: false
      }, 
      x: 50, 
      y: 100 
    },
    { 
      id: 'S2', 
      data: { 
        label: '放款', 
        level: 1, 
        lineColor: '#00B2A9', 
        miniTrend: [3, 3, 4, 5],
        kpis: ['日放款额', '放款成功率'],
        value: '1,250万元',
        unit: '',
        definition: '完成授信审批后实际向客户发放资金的业务环节',
        description: '用于监控放款规模和成功率，支持业务增长决策',
        isTransfer: true
      }, 
      x: 180, 
      y: 100 
    },
    { 
      id: 'S3', 
      data: { 
        label: '用信监控', 
        level: 3, 
        lineColor: '#00B2A9', 
        miniTrend: [2, 1, 2, 3],
        kpis: ['支用率', '循环率'],
        value: '78.4%',
        unit: '',
        definition: '对已放款客户的资金使用情况进行持续监控',
        description: '用于监控资金使用效率，支持额度管理决策',
        isTransfer: false
      }, 
      x: 310, 
      y: 100 
    },
    
    // 质量线 (深蓝色 #2475FC)
    { 
      id: 'Q1', 
      data: { 
        label: '放款', 
        level: 1, 
        lineColor: '#2475FC', 
        miniTrend: [3, 3, 4, 5],
        kpis: ['放款额'],
        value: '1,250万元',
        unit: '',
        definition: '完成授信审批后实际向客户发放资金的业务环节',
        description: '用于监控放款规模，支持业务质量管控',
        isTransfer: true
      }, 
      x: 180, 
      y: 220 
    },
    { 
      id: 'Q2', 
      data: { 
        label: '资产分级', 
        level: 2, 
        lineColor: '#2475FC', 
        miniTrend: [2, 2, 1, 2],
        kpis: ['优质资产占比', 'FPD30+'],
        value: '76.8%',
        unit: '',
        definition: '根据风险程度对放款资产进行分类管理',
        description: '用于监控资产质量结构，支持风险管理决策',
        isTransfer: false
      }, 
      x: 310, 
      y: 220 
    },
    { 
      id: 'Q3', 
      data: { 
        label: '30+逾期', 
        level: 1, 
        lineColor: '#2475FC', 
        miniTrend: [0.8, 1, 1.2, 0.9],
        kpis: ['30+逾期率', '余额'],
        value: '2.8%',
        unit: '',
        definition: '逾期超过30天的贷款资产监控指标',
        description: '用于监控早期风险信号，支持风险预警决策',
        isTransfer: true
      }, 
      x: 440, 
      y: 220 
    },
    { 
      id: 'Q4', 
      data: { 
        label: '不良率', 
        level: 1, 
        lineColor: '#2475FC', 
        miniTrend: [1.5, 1.2, 1.0, 0.8],
        kpis: ['不良率', '拨备覆盖率'],
        value: '1.2%',
        unit: '',
        definition: '不能按期收回本息的贷款占总贷款的比例',
        description: '用于监控资产质量底线，支持风险处置决策',
        isTransfer: false
      }, 
      x: 570, 
      y: 220 
    }
  ]

  // 添加节点
  nodes.forEach(n => {
    graph.addNode({
      id: n.id,
      x: n.x,
      y: n.y,
      shape: 'station-node',
      data: n.data
    })
  })

  // 添加线路连接
  const edges = [
    // 规模线连接
    { source: 'S1', target: 'S2' },
    { source: 'S2', target: 'S3' },
    
    // 质量线连接
    { source: 'Q1', target: 'Q2' },
    { source: 'Q2', target: 'Q3' },
    { source: 'Q3', target: 'Q4' }
  ]

  edges.forEach(edge => {
    const sourceNode = graph.getCellById(edge.source)
    const targetNode = graph.getCellById(edge.target)
    const sourceData = sourceNode?.getData()
    
    graph.addEdge({
      source: edge.source,
      target: edge.target,
      attrs: {
        line: {
          stroke: sourceData?.lineColor || '#666',
          strokeWidth: 4,
          strokeLinecap: 'round'
        }
      },
      connector: {
        name: 'rounded'
      }
    })
  })

  // 处理换乘站特殊样式
  graph.getNodes().forEach(node => {
    const data = node.getData()
    if (data.isTransfer) {
      node.attr('body/stroke', '#FFD04B')
      node.attr('body/strokeWidth', 3)
    }
  })

  // 点击节点打开抽屉
  graph.on('node:click', ({ node }) => {
    activeData.value = node.getData()
    showDrawer.value = true
  })

  // 节点悬停效果
  graph.on('node:mouseenter', ({ node }) => {
    node.attr('body/filter', 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))')
  })

  graph.on('node:mouseleave', ({ node }) => {
    node.attr('body/filter', '')
  })
})
</script>

<style scoped>
.subway-map-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.subway-canvas {
  width: 100%;
  height: 600px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  background: #f8f9fa;
}
</style>