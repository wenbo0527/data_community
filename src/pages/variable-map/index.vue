<template>
  <div class="variable-map-page">
    <div class="page-header">
      <a-breadcrumb>
        <a-breadcrumb-item>变量管理</a-breadcrumb-item>
        <a-breadcrumb-item>变量地图</a-breadcrumb-item>
      </a-breadcrumb>
      <div class="header-content">
        <h1 class="page-title">变量地图</h1>
        
      </div>
    </div>

    <div class="page-content">
      <!-- 控制面板 -->
      <a-card class="control-panel" v-if="false">
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item label="中心变量">
              <a-select
                v-model="centerVariable"
                placeholder="选择中心变量"
                allow-clear
                @change="handleCenterVariableChange"
              >
                <a-option v-for="variable in variableOptions" :key="variable.id" :value="variable.id">
                  {{ variable.name }}
                </a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="关系深度">
              <a-slider
                v-model="depth"
                :min="1"
                :max="5"
                :step="1"
                show-input
                @change="handleDepthChange"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="显示模式">
              <a-radio-group v-model="displayMode" @change="handleDisplayModeChange">
                <a-radio value="all">全部关系</a-radio>
                <a-radio value="upstream">上游依赖</a-radio>
                <a-radio value="downstream">下游依赖</a-radio>
              </a-radio-group>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16" style="margin-top: 16px;">
          <a-col :span="8">
            <a-form-item label="变量类型筛选">
              <a-select
                v-model="selectedTypes"
                placeholder="选择变量类型"
                multiple
                allow-clear
                @change="handleTypeFilterChange"
              >
                <a-option value="numerical">数值型</a-option>
                <a-option value="categorical">分类型</a-option>
                <a-option value="text">文本型</a-option>
                <a-option value="datetime">时间型</a-option>
                <a-option value="boolean">布尔型</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="关系类型">
              <a-checkbox-group v-model="selectedRelations" @change="handleRelationFilterChange">
                <a-checkbox value="dependency">依赖关系</a-checkbox>
                <a-checkbox value="computation">计算关系</a-checkbox>
                <a-checkbox value="derivation">衍生关系</a-checkbox>
              </a-checkbox-group>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-space>
              <a-button type="primary" @click="handleAnalyzePath">
                <template #icon><icon-swap /></template>
                路径分析
              </a-button>
              <a-button @click="handleShowLineage">
                <template #icon><icon-branch /></template>
                血缘追踪
              </a-button>
            </a-space>
          </a-col>
        </a-row>
      </a-card>

      <!-- 关系图谱 -->
      <a-card class="graph-container" v-if="false">
        <div class="graph-header">
          <div class="graph-title">变量关系图谱</div>
          <div class="graph-legend">
            <div class="legend-item">
              <div class="legend-color" style="background-color: #52c41a;"></div>
              <span>数值型</span>
            </div>
            <div class="legend-item">
              <div class="legend-color" style="background-color: #1890ff;"></div>
              <span>分类型</span>
            </div>
            <div class="legend-item">
              <div class="legend-color" style="background-color: #fa8c16;"></div>
              <span>文本型</span>
            </div>
            <div class="legend-item">
              <div class="legend-color" style="background-color: #722ed1;"></div>
              <span>时间型</span>
            </div>
            <div class="legend-item">
              <div class="legend-color" style="background-color: #13c2c2;"></div>
              <span>布尔型</span>
            </div>
          </div>
        </div>
        <div ref="graphContainer" class="graph-content"></div>
      </a-card>

      <!-- 变量列表（征信/行为） -->
      <a-card class="list-container">
        <template #title>
          <div class="graph-title">变量列表</div>
        </template>
        <a-row :gutter="16">
          <a-col :xs="24" :md="6" :lg="6" :xl="6">
            <a-card :bordered="false">
              <a-tree
                :data="categoryTree"
                :field-names="{ key: 'key', title: 'title', children: 'children' }"
                block-node
                @select="onCategorySelect"
              />
            </a-card>
          </a-col>
          <a-col :xs="24" :md="18" :lg="18" :xl="18">
            <a-form :model="featureFilter" layout="inline" style="margin-bottom: 8px">
              <a-form-item label="变量名称">
                <a-input v-model="featureFilter.name" placeholder="输入名称或编码" allow-clear @change="fetchFeatureRows" />
              </a-form-item>
              <a-form-item>
                <a-button type="primary" @click="fetchFeatureRows">
                  <template #icon><icon-search /></template>
                  搜索
                </a-button>
              </a-form-item>
            </a-form>
            <a-table
              :data="displayFeatureRows"
              :columns="featureColumns"
              :loading="featureLoading"
              :pagination="featurePagination"
              @page-change="handleFeaturePageChange"
              row-key="id"
            >
              <template #nameCell="{ record }">
                <a-link @click="openVariableDetail(record)">{{ record.name }}</a-link>
              </template>
              <template #majorCategoryCell="{ record }">
                {{ getMajorCategoryLabel(record.majorCategory) }}
              </template>
              <template #level1Cell="{ record }">
                {{ level1Label(record.level1) }}
              </template>
            </a-table>
          </a-col>
        </a-row>
      </a-card>

      <!-- 节点详情面板 -->
      <a-card v-if="false" class="node-detail-panel">
        <template #title>
          <div class="panel-title">
            <span>节点详情: {{ selectedNode.name }}</span>
            <a-button type="text" size="small" @click="handleCloseDetail">
              <template #icon><icon-close /></template>
            </a-button>
          </div>
        </template>
        <div class="node-detail-content">
          <a-descriptions :data="nodeDetailData" :column="1" bordered />
          <div class="node-actions">
            <a-space>
              <a-button type="primary" size="small" @click="handleViewVariableDetail">
                查看变量详情
              </a-button>
              <a-button size="small" @click="handleCenterOnNode">
                置为中心
              </a-button>
              <a-button size="small" @click="handleShowNodeLineage">
                查看血缘
              </a-button>
            </a-space>
          </div>
        </div>
      </a-card>
    </div>

    <!-- 路径分析对话框 -->
    <a-modal v-if="false" v-model:visible="pathAnalysisVisible" title="路径分析" width="600px">
      <template #default>
        <div class="path-analysis-content">
          <a-form :model="pathAnalysisForm" layout="vertical">
            <a-form-item label="起始变量" required>
              <a-select
                v-model="pathAnalysisForm.sourceId"
                placeholder="选择起始变量"
                allow-clear
              >
                <a-option v-for="variable in variableOptions" :key="variable.id" :value="variable.id">
                  {{ variable.name }}
                </a-option>
              </a-select>
            </a-form-item>
            <a-form-item label="目标变量" required>
              <a-select
                v-model="pathAnalysisForm.targetId"
                placeholder="选择目标变量"
                allow-clear
              >
                <a-option v-for="variable in variableOptions" :key="variable.id" :value="variable.id">
                  {{ variable.name }}
                </a-option>
              </a-select>
            </a-form-item>
            <a-form-item label="最大深度">
              <a-slider
                v-model="pathAnalysisForm.maxDepth"
                :min="1"
                :max="10"
                :step="1"
                show-input
              />
            </a-form-item>
          </a-form>
          <div v-if="pathAnalysisResult" class="path-result">
            <a-divider>分析结果</a-divider>
            <div class="path-info">
              <p><strong>路径长度:</strong> {{ pathAnalysisResult.length }}</p>
              <p><strong>路径节点:</strong></p>
              <div class="path-nodes">
                <span v-for="(node, index) in pathAnalysisResult.nodes" :key="node.id" class="path-node">
                  {{ node.name }}
                  <icon-right v-if="index < pathAnalysisResult.nodes.length - 1" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <a-button @click="pathAnalysisVisible = false">取消</a-button>
        <a-button type="primary" @click="handleExecutePathAnalysis">执行分析</a-button>
      </template>
    </a-modal>

    <!-- 血缘追踪对话框 -->
    <a-modal v-if="false" v-model:visible="lineageVisible" title="血缘追踪" width="800px">
      <template #default>
        <div class="lineage-content">
          <div class="lineage-section">
            <h4>上游依赖</h4>
            <a-tree
              :data="lineageData.upstream"
              :field-names="{ key: 'id', title: 'name' }"
              block-node
            >
              <template #title="nodeData">
                <span class="tree-node">
                  <span class="node-name">{{ nodeData.name }}</span>
                  <span class="node-type">({{ getTypeLabel(nodeData.type) }})</span>
                </span>
              </template>
            </a-tree>
          </div>
          <a-divider />
          <div class="lineage-section">
            <h4>下游使用</h4>
            <a-tree
              :data="lineageData.downstream"
              :field-names="{ key: 'id', title: 'name' }"
              block-node
            >
              <template #title="nodeData">
                <span class="tree-node">
                  <span class="node-name">{{ nodeData.name }}</span>
                  <span class="node-type">({{ getTypeLabel(nodeData.type) }})</span>
                </span>
              </template>
            </a-tree>
          </div>
        </div>
      </template>
      <template #footer>
        <a-button @click="lineageVisible = false">关闭</a-button>
      </template>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Graph } from '@antv/x6'
import { Message } from '@arco-design/web-vue'
import { useVariableStore } from '@/store/modules/variable'
import { featureAPI } from '@/api/offlineModel'
import { IconSearch } from '@arco-design/web-vue/es/icon'

const router = useRouter()
const variableStore = useVariableStore()

// 图形容器
const graphContainer = ref(null)
const graph = ref(null)

// 控制参数
const centerVariable = ref('')
const depth = ref(2)
const displayMode = ref('all')
const selectedTypes = ref([])
const selectedRelations = ref(['dependency', 'derivation', 'reference', 'association'])

// 选项数据
const variableOptions = computed(() => {
  const nodes = (variableStore.variableGraph && Array.isArray(variableStore.variableGraph.nodes))
    ? variableStore.variableGraph.nodes
    : []
  return nodes.map(node => ({ id: node.id, name: (node.name || node.label), type: node.type }))
})

// 选中节点
const selectedNode = ref(null)

// 路径分析
const pathAnalysisVisible = ref(false)
const pathAnalysisForm = reactive({
  sourceId: '',
  targetId: '',
  maxDepth: 5
})
const pathAnalysisResult = ref(null)

// 血缘追踪
const lineageVisible = ref(false)
const lineageData = computed(() => variableStore.variableLineage)

// 类型映射
const typeMap = {
  numerical: { label: '数值型', color: '#52c41a' },
  categorical: { label: '分类型', color: '#1890ff' },
  text: { label: '文本型', color: '#fa8c16' },
  datetime: { label: '时间型', color: '#722ed1' },
  boolean: { label: '布尔型', color: '#13c2c2' }
}

// 变量列表（征信/行为）
const featureLoading = ref(false)
const featureRows = ref([])
const featureFilter = reactive({ name: '', majorCategory: '', level1: '', level2: '' })
const featurePagination = reactive({ current: 1, pageSize: 10, total: 0, showTotal: true, showJumper: true, showPageSize: true })
const featureColumns = [
  { title: '变量名称', dataIndex: 'name', width: 180 },
  { title: '变量编码', dataIndex: 'code', width: 160 },
  { title: '业务类型', dataIndex: 'majorCategory', slotName: 'majorCategoryCell', width: 140 },
  { title: '一级分类', dataIndex: 'level1', slotName: 'level1Cell', width: 140 },
  { title: '二级分类', dataIndex: 'level2', width: 140 },
  { title: '描述', dataIndex: 'description' }
]
const getMajorCategoryLabel = (mc) => ({ credit: '征信变量', behavior: '行为变量' }[mc] || mc || '—')
const level1Label = (l1) => ({
  credit_report: '征信报告',
  credit_history: '信贷记录',
  transaction_behavior: '交易行为',
  activity: '活跃度',
  model_outputs: '模型输出'
}[l1] || l1 || '—')
const categoryTree = computed(() => ([
  {
    key: 'credit', title: '征信变量', children: [
      { key: 'credit_report', title: '征信报告' },
      { key: 'credit_history', title: '信贷记录' }
    ]
  },
  {
    key: 'behavior', title: '行为变量', children: [
      { key: 'transaction_behavior', title: '交易行为' },
      { key: 'activity', title: '活跃度' }
    ]
  }
]))
const sampleRows = [
  { id: 701, name: '征信查询次数', code: 'credit_query_count', description: '征信报告近半年查询次数', majorCategory: 'credit', level1: 'credit_report', level2: 'query_count' },
  { id: 702, name: '征信逾期次数', code: 'credit_overdue_count', description: '征信报告历史逾期次数', majorCategory: 'credit', level1: 'credit_report', level2: 'overdue_count' },
  { id: 703, name: '贷款次数', code: 'loan_times', description: '信贷记录贷款次数', majorCategory: 'credit', level1: 'credit_history', level2: 'loan_times' },
  { id: 704, name: '还款比率', code: 'repay_ratio', description: '信贷记录还款比率', majorCategory: 'credit', level1: 'credit_history', level2: 'repay_ratio' },
  { id: 711, name: '平均交易额', code: 'avg_amount', description: '近三个月平均交易额', majorCategory: 'behavior', level1: 'transaction_behavior', level2: 'avg_amount' },
  { id: 712, name: '交易频次', code: 'frequency', description: '近一周交易次数', majorCategory: 'behavior', level1: 'transaction_behavior', level2: 'frequency' },
  { id: 713, name: '登录天数', code: 'login_days', description: '近一月登录天数', majorCategory: 'behavior', level1: 'activity', level2: 'login_days' },
  { id: 714, name: '会话次数', code: 'session_count', description: '近一周会话次数', majorCategory: 'behavior', level1: 'activity', level2: 'session_count' }
]
const displayFeatureRows = computed(() => {
  const rows = featureRows.value || []
  const filtered = rows.filter(r => r.majorCategory === 'credit' || r.majorCategory === 'behavior')
  const result = filtered.length ? filtered : (rows.length ? rows : sampleRows)
  debugInfo.value = `展示：${result.length}条`
  return result
})
const onCategorySelect = async (keys) => {
  const key = Array.isArray(keys) ? keys[0] : keys
  featureFilter.level1 = ''
  featureFilter.majorCategory = ''
  if (key === 'credit' || key === 'behavior') {
    featureFilter.majorCategory = key
  } else if (key) {
    featureFilter.level1 = key
    featureFilter.majorCategory = ['credit_report', 'credit_history'].includes(key) ? 'credit' : 'behavior'
  }
  featurePagination.current = 1
  await fetchFeatureRows()
}
const fetchFeatureRows = async () => {
  featureLoading.value = true
  try {
    const res = await featureAPI.getFeatures({
      name: featureFilter.name,
      majorCategory: featureFilter.majorCategory,
      level1: featureFilter.level1,
      level2: featureFilter.level2,
      page: featurePagination.current,
      pageSize: featurePagination.pageSize
    })
    const data = Array.isArray(res.data) ? res.data : (res.data?.data || [])
    featureRows.value = (data && data.length) ? data : sampleRows
    featurePagination.total = res.data?.total ?? featureRows.value.length
    debugInfo.value = `加载成功：${featureRows.value.length}条`
    console.log('[VariableMap] getFeatures response:', res)
    console.log('[VariableMap] rows:', featureRows.value)
  } catch (e) {
    featureRows.value = sampleRows
    featurePagination.total = sampleRows.length
    debugInfo.value = '接口异常，已使用样例数据'
    console.error('[VariableMap] 加载失败，使用样例数据：', e)
  } finally {
    featureLoading.value = false
  }
}
const handleFeaturePageChange = async (page) => {
  featurePagination.current = page
  await fetchFeatureRows()
}
const debugInfo = ref('初始化中')

// 获取类型标签
const getTypeLabel = (type) => typeMap[type]?.label || type

// 节点详情数据
const nodeDetailData = ref([])
const openVariableDetail = (record) => {
  const q = {
    name: record.name || '',
    code: record.code || '',
    type: 'numerical',
    status: 'draft',
    dataSourceName: getMajorCategoryLabel(record.majorCategory),
    description: record.description || ''
  }
  router.push({ name: 'VariableMapDetail', params: { id: record.code, mode: 'view' }, query: q })
}

// 初始化图形
const initGraph = () => {
  if (!graphContainer.value) return

  graph.value = new Graph({
    container: graphContainer.value,
    width: graphContainer.value.offsetWidth,
    height: 600,
    background: {
      color: '#f5f5f5'
    },
    grid: {
      size: 10,
      visible: true
    },
    panning: {
      enabled: true,
      modifiers: 'shift'
    },
    mousewheel: {
      enabled: true,
      modifiers: ['ctrl', 'meta']
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
      connectionPoint: 'anchor',
      allowBlank: false,
      snap: {
        radius: 20
      }
    },
    highlighting: {
      magnetAdsorbed: {
        name: 'stroke',
        args: {
          attrs: {
            fill: '#5F95FF',
            stroke: '#5F95FF'
          }
        }
      }
    }
  })

  // 绑定事件
  graph.value.on('node:click', ({ node }) => {
    handleNodeClick(node)
  })

  graph.value.on('blank:click', () => {
    selectedNode.value = null
  })
}

// 获取变量选项 - 现在通过computed自动获取
const fetchVariableOptions = async () => {
  // 变量选项已通过computed属性从store获取
  console.log('变量选项已加载:', variableOptions.value)
}

// 渲染图形数据
const renderGraph = async () => {
  if (!graph.value) return

  // 清空现有数据
  graph.value.clearCells()

  try {
    // 从store获取图形数据
    const graphData = variableStore.variableGraph
    
    if (!graphData || !graphData.nodes || !graphData.edges) {
      console.warn('没有可用的图形数据')
      return
    }

    // 过滤数据
    let filteredNodes = graphData.nodes
    let filteredEdges = graphData.edges

    // 根据中心变量过滤
    if (centerVariable.value) {
      const centerId = centerVariable.value
      const relatedNodeIds = new Set([centerId])
      
      // 根据深度获取相关节点
      for (let i = 0; i < depth.value; i++) {
        filteredEdges.forEach(edge => {
          if (relatedNodeIds.has(edge.source)) {
            relatedNodeIds.add(edge.target)
          }
          if (relatedNodeIds.has(edge.target)) {
            relatedNodeIds.add(edge.source)
          }
        })
      }
      
      filteredNodes = filteredNodes.filter(node => relatedNodeIds.has(node.id))
      filteredEdges = filteredEdges.filter(edge => 
        relatedNodeIds.has(edge.source) && relatedNodeIds.has(edge.target)
      )
    }

    // 根据显示模式过滤
    if (displayMode.value === 'upstream' && centerVariable.value) {
      const upstreamIds = new Set()
      filteredEdges.forEach(edge => {
        if (edge.target === centerVariable.value) {
          upstreamIds.add(edge.source)
        }
      })
      filteredNodes = filteredNodes.filter(node => 
        node.id === centerVariable.value || upstreamIds.has(node.id)
      )
    } else if (displayMode.value === 'downstream' && centerVariable.value) {
      const downstreamIds = new Set()
      filteredEdges.forEach(edge => {
        if (edge.source === centerVariable.value) {
          downstreamIds.add(edge.target)
        }
      })
      filteredNodes = filteredNodes.filter(node => 
        node.id === centerVariable.value || downstreamIds.has(node.id)
      )
    }

    // 根据类型筛选
    if (selectedTypes.value.length > 0) {
      filteredNodes = filteredNodes.filter(node => selectedTypes.value.includes(node.type))
    }

    // 根据关系类型筛选
    if (selectedRelations.value.length > 0) {
      filteredEdges = filteredEdges.filter(edge => selectedRelations.value.includes(edge.type))
    }

    // 创建节点
    const nodePositions = calculateNodePositions(filteredNodes, centerVariable.value)
    filteredNodes.forEach((node, index) => {
      const position = nodePositions[index] || { x: 100 + index * 150, y: 100 + index * 80 }
      const nodeData = {
        id: node.id,
        x: position.x,
        y: position.y,
        width: 120,
        height: 60,
        shape: 'rect',
        attrs: {
          body: {
            fill: typeMap[node.type]?.color || '#52c41a',
            stroke: '#000',
            strokeWidth: 1,
            rx: 8,
            ry: 8
          },
          label: {
            text: (node.name || node.label || node.id),
            fill: '#fff',
            fontSize: 12,
            fontWeight: 'bold',
            textAnchor: 'middle',
            textVerticalAnchor: 'middle'
          }
        },
        data: node
      }
      graph.value.addNode(nodeData)
    })

    // 创建边
    filteredEdges.forEach(edge => {
      const edgeData = {
        source: edge.source,
        target: edge.target,
        shape: 'edge',
        attrs: {
          line: {
            stroke: getRelationColor(edge.type),
            strokeWidth: Math.max(1, ((typeof edge.strength === 'number' ? edge.strength : 0.5) * 3)),
            targetMarker: {
              name: 'classic',
              size: 8
            }
          }
        },
        labels: [{
          attrs: {
            text: {
              text: getRelationLabel(edge.type),
              fontSize: 10,
              fill: '#666'
            }
          }
        }],
        data: edge
      }
      graph.value.addEdge(edgeData)
    })

    // 自动布局
    graph.value.centerContent()

  } catch (error) {
    console.error('渲染图形失败:', error)
    Message.error('渲染图形失败')
  }
}

// 计算节点位置
const calculateNodePositions = (nodes, centerId) => {
  const positions = []
  const centerIndex = nodes.findIndex(node => node.id === centerId)
  
  if (centerIndex === -1) {
    // 没有中心节点，使用网格布局
    return nodes.map((node, index) => ({
      x: 100 + (index % 4) * 200,
      y: 100 + Math.floor(index / 4) * 150
    }))
  }

  // 中心节点在中心位置
  const centerX = 400
  const centerY = 300
  positions[centerIndex] = { x: centerX, y: centerY }

  // 其他节点围绕中心节点分布
  let angle = 0
  const radius = 200
  nodes.forEach((node, index) => {
    if (index !== centerIndex) {
      positions[index] = {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius
      }
      angle += (2 * Math.PI) / (nodes.length - 1)
    }
  })

  return positions
}

// 获取关系颜色
const getRelationColor = (type) => {
  const colorMap = {
    dependency: '#52c41a',
    derivation: '#1890ff',
    reference: '#fa8c16',
    association: '#722ed1'
  }
  return colorMap[type] || '#666'
}

// 获取关系标签
const getRelationLabel = (type) => {
  const labelMap = {
    dependency: '依赖',
    derivation: '衍生',
    reference: '引用',
    association: '关联'
  }
  return labelMap[type] || type
}

// 处理节点点击：跳转变量详情（只读视图）
const handleNodeClick = (node) => {
  const d = node.getData()
  if (d && d.id) {
    router.push({ name: 'VariableMapDetail', params: { id: d.id, mode: 'view' } })
  }
}

// 处理中心变量变化
const handleCenterVariableChange = () => {
  renderGraph()
}

// 处理深度变化
const handleDepthChange = () => {
  renderGraph()
}

// 处理显示模式变化
const handleDisplayModeChange = () => {
  renderGraph()
}

// 处理类型筛选变化
const handleTypeFilterChange = () => {
  renderGraph()
}

// 处理关系筛选变化
const handleRelationFilterChange = () => {
  renderGraph()
}

// 重置布局
const handleResetLayout = () => {
  if (graph.value) {
    graph.value.centerContent()
  }
}

// 导出图片
const handleExportImage = () => {
  if (graph.value) {
    graph.value.toPNG((dataUri) => {
      const link = document.createElement('a')
      link.download = 'variable-map.png'
      link.href = dataUri
      link.click()
    })
  }
}

// 路径分析
const handleAnalyzePath = () => {
  pathAnalysisVisible.value = true
  pathAnalysisResult.value = null
}

// 执行路径分析
const handleExecutePathAnalysis = async () => {
  if (!pathAnalysisForm.sourceId || !pathAnalysisForm.targetId) {
    Message.warning('请选择起始变量和目标变量')
    return
  }

  try {
    // Mock路径分析结果
    const sourceNode = variableOptions.value.find(v => v.id === pathAnalysisForm.sourceId) || { id: (pathAnalysisForm.sourceId || 'source'), name: '起始变量', type: 'numerical' }
    const targetNode = variableOptions.value.find(v => v.id === pathAnalysisForm.targetId) || { id: (pathAnalysisForm.targetId || 'target'), name: '目标变量', type: 'numerical' }
    
    pathAnalysisResult.value = {
      length: 2,
      nodes: [
        sourceNode,
        { id: 'var_005', name: '用户等级', type: 'categorical' },
        targetNode
      ]
    }

    Message.success('路径分析完成')
  } catch (error) {
    console.error('路径分析失败:', error)
    Message.error('路径分析失败')
  }
}

// 显示血缘追踪
const handleShowLineage = () => {
  if (!centerVariable.value) {
    Message.warning('请先选择一个中心变量')
    return
  }
  
  fetchLineageData(centerVariable.value)
  lineageVisible.value = true
}

// 获取血缘数据
const fetchLineageData = async (variableId) => {
  try {
    await variableStore.fetchVariableLineage(variableId)
  } catch (error) {
    console.error('获取血缘数据失败:', error)
    Message.error('获取血缘数据失败')
  }
}

// 关闭详情面板
const handleCloseDetail = () => {
  selectedNode.value = null
}

// 查看变量详情
const handleViewVariableDetail = () => {
  if (selectedNode.value) {
    router.push({ name: 'VariableMapDetail', params: { id: selectedNode.value.id, mode: 'view' } })
  }
}

// 置为中心节点
const handleCenterOnNode = () => {
  if (selectedNode.value) {
    centerVariable.value = selectedNode.value.id
    renderGraph()
  }
}

// 显示节点血缘
const handleShowNodeLineage = () => {
  if (selectedNode.value) {
    fetchLineageData(selectedNode.value.id)
    lineageVisible.value = true
  }
}

// 初始化
onMounted(async () => {
  // 预置样例数据，避免初始空白
  featureRows.value = sampleRows
  featurePagination.total = sampleRows.length
  debugInfo.value = `预置样例：${sampleRows.length}条`
  await fetchFeatureRows()
})

// 清理
onUnmounted(() => {
  if (graph.value) {
    graph.value.dispose()
  }
})
</script>

<style scoped>
.variable-map-page {
  padding: 16px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 16px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1d2129;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.page-content {
  width: 100%;
  margin: 0 auto;
  position: relative;
  padding: 0 12px;
  box-sizing: border-box;
}

.control-panel {
  margin-bottom: 16px;
}

.graph-container {
  margin-bottom: 16px;
}

.list-container {
  margin-bottom: 16px;
}

.graph-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.graph-title {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
}

.graph-legend {
  display: flex;
  gap: 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #86909c;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.graph-content {
  width: 100%;
  height: 600px;
  border: 1px solid #e5e6eb;
  border-radius: 6px;
  background-color: #fff;
}

.node-detail-panel {
  position: absolute;
  top: 200px;
  right: 16px;
  width: 300px;
  z-index: 1000;
}

.panel-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.node-detail-content {
  padding: 16px 0;
}

.node-actions {
  margin-top: 16px;
  text-align: center;
}

.path-analysis-content {
  padding: 16px 0;
}

.path-result {
  margin-top: 16px;
  padding: 16px;
  background-color: #f5f5f5;
  border-radius: 6px;
}

.path-info {
  font-size: 14px;
  color: #1d2129;
}

.path-nodes {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.path-node {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background-color: #e6f7ff;
  border-radius: 4px;
  font-size: 12px;
  color: #1890ff;
}

.lineage-content {
  max-height: 500px;
  overflow-y: auto;
}

.lineage-section {
  margin-bottom: 16px;
}

.lineage-section h4 {
  margin-bottom: 8px;
  font-size: 14px;
  color: #1d2129;
}

.tree-node {
  display: flex;
  align-items: center;
  gap: 4px;
}

.node-name {
  font-weight: 500;
}

.node-type {
  font-size: 12px;
  color: #86909c;
}
</style>
