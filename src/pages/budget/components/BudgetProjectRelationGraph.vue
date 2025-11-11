<template>
  <div class="budget-project-relation-graph">
    <a-card title="预算-项目关联关系图" :bordered="false">
      <template #extra>
        <a-space>
          <a-button type="text" size="small" @click="handleZoomIn">
            <template #icon>
              <icon-zoom-in />
            </template>
            放大
          </a-button>
          <a-button type="text" size="small" @click="handleZoomOut">
            <template #icon>
              <icon-zoom-out />
            </template>
            缩小
          </a-button>
          <a-button type="text" size="small" @click="handleFitView">
            <template #icon>
              <icon-expand />
            </template>
            适应视图
          </a-button>
          <a-button type="text" size="small" @click="handleRefresh">
            <template #icon>
              <icon-refresh />
            </template>
            刷新
          </a-button>
        </a-space>
      </template>
      
      <div ref="graphContainer" class="graph-container"></div>
      
      <!-- 图例 -->
      <div class="graph-legend">
        <div class="legend-item">
          <div class="legend-icon budget-node"></div>
          <span class="legend-text">预算节点</span>
        </div>
        <div class="legend-item">
          <div class="legend-icon project-node"></div>
          <span class="legend-text">项目节点</span>
        </div>
        <div class="legend-item">
          <div class="legend-icon verification-edge"></div>
          <span class="legend-text">核销关系</span>
        </div>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { Graph } from '@antv/x6'
import { Message } from '@arco-design/web-vue'
import { 
  IconZoomIn, 
  IconZoomOut, 
  IconExpand, 
  IconRefresh 
} from '@arco-design/web-vue/es/icon'
import { budgetApiService } from '@/api/budget'

// 响应式数据
const graphContainer = ref<HTMLElement>()
const graph = ref<Graph | null>(null)
const loading = ref(false)

// 生命周期
onMounted(async () => {
  await nextTick()
  initGraph()
  await loadRelationData()
})

onUnmounted(() => {
  if (graph.value) {
    graph.value.dispose()
  }
})

// 方法
const initGraph = () => {
  if (!graphContainer.value) return
  
  graph.value = new Graph({
    container: graphContainer.value,
    width: graphContainer.value.clientWidth,
    height: 400,
    background: {
      color: '#f5f7fa'
    },
    grid: {
      size: 10,
      visible: true,
      type: 'dot',
      args: {
        color: '#e0e6ed',
        thickness: 1
      }
    },
    mousewheel: {
      enabled: true,
      modifiers: ['ctrl', 'meta']
    },
    panning: {
      enabled: true,
      modifiers: 'shift'
    },
    connecting: {
      router: {
        name: 'manhattan',
        args: {
          padding: 20
        }
      },
      connector: {
        name: 'rounded',
        args: {
          radius: 8
        }
      },
      anchor: 'center',
      connectionPoint: 'anchor'
    }
  })
  
  // 注册自定义节点
  registerCustomNodes()
  
  // 监听节点点击事件
  graph.value.on('node:click', ({ node }) => {
    const nodeData = node.getData()
    if (nodeData.type === 'budget') {
      // 跳转到预算详情
      window.open(`/budget/detail/${nodeData.id}`, '_blank')
    } else if (nodeData.type === 'project') {
      // 跳转到项目详情
      Message.info(`查看项目详情: ${nodeData.projectName}`)
    }
  })
  
  // 监听边点击事件
  graph.value.on('edge:click', ({ edge }) => {
    const edgeData = edge.getData()
    Message.info(`核销金额: ¥${formatAmount(edgeData.verificationAmount)}`)
  })
}

const registerCustomNodes = () => {
  if (!graph.value) return
  
  // 预算节点
  Graph.registerNode('budget-node', {
    inherit: 'rect',
    width: 120,
    height: 80,
    attrs: {
      body: {
        fill: 'linear-gradient(135deg, #165dff 0%, #0e42d2 100%)',
        stroke: '#0e42d2',
        strokeWidth: 2,
        rx: 8,
        ry: 8
      },
      label: {
        fill: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        textAnchor: 'middle',
        textVerticalAnchor: 'middle'
      }
    },
    ports: {
      groups: {
        top: {
          position: 'top',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#0e42d2',
              strokeWidth: 2,
              fill: '#fff'
            }
          }
        },
        bottom: {
          position: 'bottom',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#0e42d2',
              strokeWidth: 2,
              fill: '#fff'
            }
          }
        }
      },
      items: [
        { id: 'top', group: 'top' },
        { id: 'bottom', group: 'bottom' }
      ]
    }
  })
  
  // 项目节点
  Graph.registerNode('project-node', {
    inherit: 'rect',
    width: 120,
    height: 80,
    attrs: {
      body: {
        fill: 'linear-gradient(135deg, #00b42a 0%, #009a29 100%)',
        stroke: '#009a29',
        strokeWidth: 2,
        rx: 8,
        ry: 8
      },
      label: {
        fill: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        textAnchor: 'middle',
        textVerticalAnchor: 'middle'
      }
    },
    ports: {
      groups: {
        top: {
          position: 'top',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#009a29',
              strokeWidth: 2,
              fill: '#fff'
            }
          }
        },
        bottom: {
          position: 'bottom',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#009a29',
              strokeWidth: 2,
              fill: '#fff'
            }
          }
        }
      },
      items: [
        { id: 'top', group: 'top' },
        { id: 'bottom', group: 'bottom' }
      ]
    }
  })
  
  // 核销边
  Graph.registerEdge('verification-edge', {
    inherit: 'edge',
    attrs: {
      line: {
        stroke: '#ff7d00',
        strokeWidth: 2,
        strokeDasharray: '5,5',
        targetMarker: {
          name: 'block',
          width: 8,
          height: 8
        }
      }
    },
    label: {
      attrs: {
        label: {
          fill: '#ff7d00',
          fontSize: 12,
          fontWeight: 'bold'
        }
      }
    }
  })
}

const loadRelationData = async () => {
  if (!graph.value) return
  
  try {
    loading.value = true
    
    // 获取预算和项目关联数据
    const relationData = await budgetApiService.getBudgetProjectRelations()
    
    // 清空现有数据
    graph.value.clearCells()
    
    // 添加预算节点
    const budgetNodes = relationData.budgets.map((budget, index) => ({
      id: `budget-${budget.id}`,
      shape: 'budget-node',
      x: 100 + (index % 3) * 200,
      y: 100 + Math.floor(index / 3) * 150,
      label: budget.budgetName,
      data: {
        type: 'budget',
        ...budget
      }
    }))
    
    // 添加项目节点
    const projectNodes = relationData.projects.map((project, index) => ({
      id: `project-${project.id}`,
      shape: 'project-node',
      x: 300 + (index % 3) * 200,
      y: 250 + Math.floor(index / 3) * 150,
      label: project.projectName,
      data: {
        type: 'project',
        ...project
      }
    }))
    
    // 添加核销边
    const verificationEdges = relationData.relations.map((relation) => ({
      shape: 'verification-edge',
      source: `budget-${relation.budgetId}`,
      target: `project-${relation.projectId}`,
      labels: [`¥${formatAmount(relation.verificationAmount)}`],
      data: relation
    }))
    
    // 批量添加节点和边
    graph.value.addCells([...budgetNodes, ...projectNodes, ...verificationEdges])
    
    // 自动布局
    graph.value.zoomToFit({ padding: 20 })
    
  } catch (error) {
    Message.error('加载关系数据失败')
    console.error('加载关系数据失败:', error)
  } finally {
    loading.value = false
  }
}

const handleZoomIn = () => {
  if (graph.value) {
    graph.value.zoom(0.1)
  }
}

const handleZoomOut = () => {
  if (graph.value) {
    graph.value.zoom(-0.1)
  }
}

const handleFitView = () => {
  if (graph.value) {
    graph.value.zoomToFit({ padding: 20 })
  }
}

const handleRefresh = async () => {
  await loadRelationData()
  Message.success('关系图已刷新')
}

// 工具函数
const formatAmount = (amount: number | null | undefined): string => {
  const n = Number(amount ?? 0)
  if (Number.isNaN(n)) return '0'
  return n.toLocaleString('zh-CN')
}
</script>

<style scoped lang="less">
.budget-project-relation-graph {
  margin-bottom: 24px;
  
  .graph-container {
    width: 100%;
    height: 400px;
    border: 1px solid #e0e6ed;
    border-radius: 8px;
    background: #f5f7fa;
  }
  
  .graph-legend {
    display: flex;
    justify-content: center;
    gap: 24px;
    margin-top: 16px;
    padding: 12px;
    background: #f5f7fa;
    border-radius: 8px;
    
    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      
      .legend-icon {
        width: 16px;
        height: 16px;
        border-radius: 4px;
        
        &.budget-node {
          background: linear-gradient(135deg, #165dff 0%, #0e42d2 100%);
        }
        
        &.project-node {
          background: linear-gradient(135deg, #00b42a 0%, #009a29 100%);
        }
        
        &.verification-edge {
          background: #ff7d00;
          border-radius: 0;
          height: 2px;
          margin: 7px 0;
        }
      }
      
      .legend-text {
        font-size: 12px;
        color: #86909c;
      }
    }
  }
}
</style>