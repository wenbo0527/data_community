<template>
  <div class="table-detail-page">
    <a-page-header 
      :title="tableData?.name || '未命名表'" 
      @back="router.go(-1)"
      class="page-header"
    >
      <template #extra>
        <a-space>
          <a-button type="outline" size="mini" @click="toggleFavorite">
            <template #icon>
              <icon-star :fill="isFavorite ? '#ffb400' : 'none'" />
            </template>
            收藏
          </a-button>
          <a-button type="outline" size="mini" @click="showAddToCollection">
            <template #icon>
              <icon-folder-add />
            </template>
            添加到集合
          </a-button>
          <a-button type="primary" size="mini" @click="applyPermission">
            <template #icon>
              <icon-safe />
            </template>
            申请权限
          </a-button>
        </a-space>
      </template>
    </a-page-header>
    
    <div v-if="tableData" class="table-content">
      <!-- 基本信息卡片 -->
      <a-card class="table-info">
        <a-descriptions :column="2" :data="tableBasicInfo" />
      </a-card>
      
      <!-- 标签页内容 -->
      <a-card class="tab-content">
        <a-tabs default-active-key="details" class="table-content">
      <a-tab-pane key="details" title="明细信息">
        <a-tabs default-active-key="structure">
          <a-tab-pane key="structure" title="表结构">
            <a-card class="table-info" title="基本信息">
              <a-descriptions
                :data="tableBasicInfo"
                :column="3"
                size="medium"
                bordered
              />
            </a-card>
            <a-card class="table-info" title="字段信息">
              <a-table
                :data="tableData?.fields || []"
                :pagination="false"
                :scroll="{ x: '100%' }"
              >
                <template #columns>
                  <a-table-column title="字段名" data-index="name" />
                  <a-table-column title="类型" data-index="type" />
                  <a-table-column title="描述" data-index="description" />
                </template>
              </a-table>
            </a-card>
          </a-tab-pane>
          <a-tab-pane key="preview" title="数据预览">
            <a-card class="table-info">
              <template #title>
                <div class="structure-header">
                  <span>数据预览</span>
                </div>
              </template>
              <a-table
                :data="sampleData"
                :pagination="false"
                :scroll="{ x: '100%' }"
              >
                <template #columns>
                  <a-table-column
                    v-for="field in tableData?.fields"
                    :key="field.name"
                    :title="field.name"
                    :data-index="field.name"
                  />
                </template>
              </a-table>
            </a-card>
          </a-tab-pane>
        </a-tabs>
      </a-tab-pane>
      <a-tab-pane key="relations" title="业务关系">
        <div class="relation-info">
          <a-space direction="vertical" style="width: 100%">
            <a-card>
              <a-tabs v-model:activeKey="relationViewMode" type="rounded">
                <a-tab-pane key="graph" title="可视化">
                  <div ref="relationTreeRef" class="relation-tree-container"></div>
                </a-tab-pane>
                <a-tab-pane key="list" title="列表">
                  <a-table
                    :data="allRelations"
                    :pagination="false"
                    :scroll="{ x: '100%' }"
                  >
                    <template #columns>
                      <a-table-column title="关联表" data-index="targetTable">
                        <template #cell="{ record }">
                          <a-link @click="goToTableByRelation(record)">
                            {{ record.targetTable }}
                          </a-link>
                        </template>
                      </a-table-column>
                      <a-table-column title="关联字段">
                        <template #cell="{ record }">
                          {{ record.relationFields.map(f => `${f.sourceField}=${f.targetField}`).join(', ') }}
                        </template>
                      </a-table-column>
                      <a-table-column title="关联类型" data-index="relationType" />
                      <a-table-column title="关联说明" data-index="relationDescription" />
                    </template>
                  </a-table>
                </a-tab-pane>
              </a-tabs>
            </a-card>
          </a-space>
        </div>
      </a-tab-pane>
      <a-tab-pane key="usage" title="使用说明">
        <a-card class="table-info">
          <a-alert type="info">
            <template #title>
              <div style="font-size: 16px; font-weight: 500">使用说明</div>
            </template>
            <div style="margin-top: 12px">
              <p>1. 该表包含用户相关的维度信息</p>
              <p>2. 主键字段为 id</p>
              <p>3. 常用于与订单表、行为表等进行关联分析</p>
              <p>4. 数据每日更新</p>
            </div>
          </a-alert>
        </a-card>
      </a-tab-pane>
    </a-tabs>
      </a-card>
      

    </div>
    <div v-else class="empty-state">
      <a-empty description="请选择一个数据表查看详情" />
    </div>
    
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick, h } from 'vue'
import type { VNode } from 'vue'
import { 
  IconStar, 
  IconSafe,
  IconFolderAdd,
  IconLink,
  IconInfoCircle,
  IconExclamationCircle
} from '@arco-design/web-vue/es/icon'
import { Modal } from '@arco-design/web-vue'
import { mockTables } from '@/mock/data-map'
import { useRoute, useRouter } from 'vue-router'
import RelationEditor from './components/RelationEditor.vue'
import AddToCollectionModal from './components/AddToCollectionModal.vue'
import * as echarts from 'echarts/core'
import { TreeChart } from 'echarts/charts'
import { CanvasRenderer } from 'echarts/renderers'
import type { EChartsType, CallbackDataParams } from 'echarts/types/dist/shared'

// 注册必须的组件
echarts.use([TreeChart, CanvasRenderer])



// Initialize logger first
const isDev = process.env.NODE_ENV === 'development'
const logger = {
  debug: (tag: string, ...args: any[]) => isDev && console.debug(`[TableDetail] ${tag}:`, ...args),
  info: (tag: string, ...args: any[]) => isDev && tag.includes('关联') && console.log(`[TableDetail] ${tag}:`, ...args),
  warn: (tag: string, ...args: any[]) => tag.includes('关联') && console.warn(`[TableDetail] ${tag}:`, ...args),
  error: (tag: string, ...args: any[]) => console.error(`[TableDetail] ${tag}:`, ...args)
}

interface TableField {
  name: string
  type: string
  description: string
}

interface TableItem {
  name: string
  type: string
  category: string
  domain: string
  updateFrequency: string
  owner: string
  description: string
  fields: TableField[]
  rowCount?: number
  createTime?: string
  lastUpdateTime?: string
  storageSize?: string
  collectionOwner?: string
  relationType?: string
  relationField?: string
  relationDescription?: string
}

interface Relation {
  id?: string
  sourceTable: string
  targetTable: string
  relationFields: { sourceField: string; targetField: string }[]
  relationType: '1:1' | '1:N' | 'N:1' | 'N:N'
  relationDescription: string
}

const route = useRoute()
const router = useRouter()
const tableData = ref<TableItem | undefined>()

// 关联关系相关
const allRelations = ref<Relation[]>([])
const relationTreeRef = ref<HTMLElement | null>(null)
const relationViewMode = ref<'graph' | 'list'>('list') // 默认展示列表视图
let relationChart: echarts.ECharts | null = null

const goToTableDetail = (table: TableItem) => {
  router.push(`/discovery/data-map/table/${encodeURIComponent(table.name)}`)
}

// 通过关联关系跳转到目标表
const goToTableByRelation = (relation: Relation) => {
  router.push(`/discovery/data-map/table/${encodeURIComponent(relation.targetTable)}`)
}
const isFavorite = ref(false)
const sampleData = ref<any[]>([])
const currentField = ref<TableField>()
const activeModalTab = ref('structure') // 控制关联弹窗内的标签页
const relatedTables = ref<TableItem[]>([])
const currentTableName = ref<string>('')

// 监听标签页切换
const handleTabChange = (key: string) => {
  activeModalTab.value = key;
  // 如果切换到关联说明tab，且视图模式为图表，则渲染树图
  if (key === 'relations' && relationViewMode.value === 'graph') {
    nextTick(() => {
      renderRelationTree();
    });
  }
}

// 监听关联关系视图模式切换
watch(relationViewMode, (newMode: 'graph' | 'list') => {
  if (activeModalTab.value === 'relations' && newMode === 'graph') {
    nextTick(() => {
      renderRelationTree();
    });
  }
})

onMounted(() => {
  initRelations();
})

// 基本信息数据 - 提取为计算属性
const tableBasicInfo = computed(() => {
  if (!tableData.value) return []

  const data = tableData.value
  return [
    { label: '表名', value: data.name },
    { label: '类型', value: data.type },
    { label: '分类', value: data.category },
    { label: '领域', value: data.domain },
    { label: '更新频率', value: data.updateFrequency },
    { label: '负责人', value: data.owner },
    { label: '创建时间', value: data.createTime || 'N/A' },
    { label: '最后更新时间', value: data.lastUpdateTime || 'N/A' },
  ]
})


// 获取关联字段 - 提取为顶层计算属性
const relatedFields = computed(() => {
  const fields = tableData.value?.fields?.filter((field: TableField) => 
    ['id', 'user_id', 'product_id'].includes(field.name.toLowerCase())
  ) || []
  logger.debug('关联字段解析', {
    totalFields: tableData.value?.fields?.length || 0,
    matchedFields: fields.map((f: TableField) => f.name)
  })
  return fields
})

// 弹窗标题
const modalTitle = computed(() => {
  if (currentTableName.value) {
    return `当前表 与 ${currentTableName.value} 的关联关系` // 不直接引用tableData.value?.name以避免循环依赖
  }
  return `${currentField?.value?.name || ''} 关联表`
})

// 从路由参数加载表数据
watch(() => route.params, (params) => {
  const tableParam = Array.isArray(params.table) ? params.table[0] : params.table || 
              Array.isArray(params.tableName) ? params.tableName[0] : params.tableName
  logger.debug('路由参数', { tableParam })
  
  if (tableParam) {
    tableData.value = parseTableData(tableParam) || createSafeTableData({})
    logger.debug('解析表数据', { name: tableData.value?.name })
  } else {
    tableData.value = createSafeTableData({})
  }
}, { immediate: true })



function parseTableData(tableStr: string): TableItem | undefined {
  try {
    const decoded = decodeURIComponent(tableStr)
    
    try {
      return JSON.parse(decoded)
    } catch {
      const mockTable = mockTables.find(t => t.name === decoded)
      if (mockTable) {
        // 为dim_user表添加特殊属性
        if (decoded === 'dim_user') {
          return createSafeTableData({
            ...mockTable,
            rowCount: 1000000,
            createTime: '2023-01-01',
            lastUpdateTime: '2024-01-15',
            storageSize: '500MB',
            collectionOwner: '数据治理组',
            type: 'dimension',
            category: '用户数据',
            domain: '用户域',
            updateFrequency: '每日更新',
            owner: '张三'
          })
        }
        return createSafeTableData(mockTable)
      }
      return undefined
    }
  } catch (error) {
    logger.warn('解析表数据失败', error)
    return undefined
  }
}

function createSafeTableData(source: Partial<TableItem>): TableItem {
  return {
    name: '',
    type: '',
    category: '',
    domain: '',
    updateFrequency: '',
    owner: '',
    description: '',
    fields: [],
    ...source,
  }
}






watch(tableData, (currentRefData: TableItem | undefined) => {
  if (!currentRefData || !currentRefData.fields?.length) {
    logger.debug('样本数据重置', '表数据为空或无字段')
    sampleData.value = []
    return
  }
  
  try {
    sampleData.value = Array(2).fill(0).map((_: undefined, i: number) => {
      const row: Record<string, string> = { id: `${i + 1}` }
      currentRefData.fields?.forEach((field: TableField) => {
        if (field?.name) {
          row[field.name] = `mock_${field.name}_${i + 1}`
        }
      })
      return row
    })
    logger.debug('样本数据生成', { count: sampleData.value.length })
  } catch (error) {
    logger.error('样本数据生成失败', error)
    sampleData.value = []
  }
  
  // 当表数据变化时，仅在关联标签页且图表视图模式下重新渲染树图
  if (activeModalTab.value === 'relations' && relationViewMode.value === 'graph') {
    nextTick(() => {
      renderRelationTree()
    })
  }
}, { deep: true })

const toggleFavorite = () => {
  isFavorite.value = !isFavorite.value
}

// 显示关联关系编辑器
const showRelationEditor = () => {
  // 切换到关联说明tab并设置为编辑模式
  activeModalTab.value = 'relations'
  relationViewMode.value = 'list'
}

// 初始化关联关系数据
const initRelations = () => {
  // 模拟关联关系数据
  allRelations.value = [
    {
      id: '1',
      sourceTable: '', // 不直接引用tableData.value?.name以避免循环依赖
      targetTable: 'dim_user',
      relationFields: [{ sourceField: 'user_id', targetField: 'id' }],
      relationType: 'N:1',
      relationDescription: '关联到用户维度表'
    },
    {
      id: '2',
      sourceTable: '', // 不直接引用tableData.value?.name以避免循环依赖
      targetTable: 'fact_order',
      relationFields: [{ sourceField: 'id', targetField: 'user_id' }],
      relationType: '1:N',
      relationDescription: '关联到订单事实表'
    }
  ]
}

// 渲染关联关系图
const renderRelationTree = () => {
  logger.debug('开始渲染关联关系图')
  if (!relationTreeRef.value) {
    logger.warn('relationTreeRef 未找到，无法渲染图表')
    return
  }
  
  // 销毁之前的图表实例
  if (relationChart) {
    logger.debug('销毁之前的图表实例')
    relationChart.dispose()
  }
  
  // 初始化ECharts实例
  logger.debug('初始化ECharts实例')
  relationChart = echarts.init(relationTreeRef.value)
  
  // 构造关系图数据
  logger.debug('构造关系图数据', { allRelations: allRelations.value })
  
  // 构造节点数据 - 优化的三层结构：当前表 -> 目标表 -> 关联详情
  const nodes = [
    {
      name: tableData.value?.name || '当前表',
      itemStyle: {
        color: '#1890ff'
      },
      label: {
        fontWeight: 'bold'
      },
      children: allRelations.value.map((relation: Relation, index: number) => {
        const targetNode = {
          name: relation.targetTable,
          // 添加节点标识用于区分点击行为
          relationId: relation.id || index,
          itemStyle: {
            color: '#52c41a'
          },
          label: {
            fontWeight: 'bold'
          }
        };
        
        return {
          ...targetNode,
          children: [
            {
              name: `关联字段: ${relation.relationFields.map((f: { sourceField: string; targetField: string }) => `${f.sourceField}=${f.targetField}`).join(', ')}`,
              // 添加类型标识用于样式区分
              nodeType: 'field',
              // 添加父节点引用用于tooltip
              parentNode: targetNode,
              itemStyle: {
                color: '#1890ff'
              }
            },
            {
              name: `关联类型: ${relation.relationType}`,
              // 添加类型标识用于样式区分
              nodeType: 'type',
              // 添加父节点引用用于tooltip
              parentNode: targetNode,
              itemStyle: {
                color: '#52c41a'
              }
            }
          ]
        };
      })
    }
  ];
  
  // Tree图的连线数据通过节点的父子关系自动生成，不需要显式定义links数组
  
  logger.debug('构造完成的关系图数据', { nodes });
  
  // 配置项
  const option = {
    title: {
      text: '表关联关系图'
    },
    tooltip: {
      show: true,
      trigger: 'item',
      formatter: (params: any) => {
        const nodeData = params.data;
        // 为字段和类型节点显示详细信息
        if (nodeData && nodeData.nodeType) {
          // 查找父节点（目标表）
          const parentNode = nodeData.parentNode;
          if (parentNode && parentNode.relationId !== undefined) {
            const relation = allRelations.value.find((r: Relation) => 
              r.id === parentNode.relationId || allRelations.value.indexOf(r).toString() === parentNode.relationId
            );
            if (relation) {
              if (nodeData.nodeType === 'field') {
                return `关联字段: ${relation.relationFields.map(f => `${f.sourceField}=${f.targetField}`).join(', ')}<br/>` +
                       `源表: ${tableData.value?.name}<br/>` +
                       `目标表: ${relation.targetTable}`;
              } else if (nodeData.nodeType === 'type') {
                return `关联类型: ${relation.relationType}<br/>` +
                       `关联说明: ${relation.relationDescription || '无'}<br/>` +
                       `源表: ${tableData.value?.name}<br/>` +
                       `目标表: ${relation.targetTable}`;
              }
            }
          }
        }
        // 其他节点显示默认信息
        return params.name;
      }
    },
    animationDurationUpdate: 1500,
    animationEasingUpdate: 'quinticInOut' as const,
    series: [
      {
        type: 'tree',
        layout: 'orthogonal',
        orient: 'LR',
        symbolSize: 10,
        roam: true,
        label: {
          show: true,
          position: 'left',
          verticalAlign: 'middle',
          align: 'right',
          fontSize: 14,
          color: '#333',
          backgroundColor: '#fff',
          borderColor: '#eee',
          borderWidth: 1,
          borderRadius: 4,
          padding: [4, 8],
          // 根据节点类型设置不同样式
          formatter: (params: { data: any; name: string }) => {
            const nodeData = params.data;
            if (nodeData.nodeType === 'field') {
              return `{field|${params.name}}`;
            } else if (nodeData.nodeType === 'type') {
              return `{type|${params.name}}`;
            }
            return params.name;
          },
          // 设置悬停提示信息
          rich: {
            field: {
              color: '#1890ff',
              fontSize: 13,
              fontWeight: 'bold'
            },
            type: {
              color: '#52c41a',
              fontSize: 13,
              fontStyle: 'italic'
            },
            description: {
              color: '#faad14',
              fontSize: 12
            }
          },
        leaves: {
          label: {
            position: 'right',
            verticalAlign: 'middle',
            align: 'left',
            fontSize: 14,
            color: '#333',
            backgroundColor: '#fff',
            borderColor: '#eee',
            borderWidth: 1,
            borderRadius: 4,
            padding: [4, 8],
            formatter: (params: { data: any; name: string }) => {
              const nodeData = params.data;
              if (nodeData.nodeType === 'field') {
                return `{field|${params.name}}`;
              } else if (nodeData.nodeType === 'type') {
                return `{type|${params.name}}`;
              }
              return params.name;
            },
            // 设置悬停提示信息
            rich: {
              field: {
                color: '#1890ff',
                fontSize: 13,
                fontWeight: 'bold'
              },
              type: {
                color: '#52c41a',
                fontSize: 13,
                fontStyle: 'italic'
              },
              description: {
                color: '#faad14',
                fontSize: 12
              }
            }
          }
        },
        data: [nodes[0]], // 根节点
        lineStyle: {
          color: '#ccc',
          width: 1,
          curveness: 0
        }
      }
    ]
  };
  
  // 渲染图表
  logger.debug('设置图表配置项', { option });
  relationChart.setOption(option);
  logger.debug('图表渲染完成');
  
  // 监听节点点击事件
  relationChart.on('click', (params: CallbackDataParams) => {
    logger.debug('节点被点击', { params });
    const data = params.data as { name?: string; relationId?: string; nodeType?: string };
    
    // 只有点击目标表节点时才跳转
    if (data && data.name && data.relationId !== undefined && !data.nodeType) {
      // 查找对应的关联关系
      const relation = allRelations.value.find((r: Relation) => 
        r.id === data.relationId || allRelations.value.indexOf(r).toString() === data.relationId
      );
      if (relation) {
        // 跳转到目标表
        goToTableByRelation(relation);
      }
    }
    // 关联字段和关联类型节点不处理点击事件
  });
}

const collections = ref([
  { label: '常用表集合', value: 'common' },
  { label: '个人收藏', value: 'personal' },
  { label: '项目表集合', value: 'project' },
  { label: '部门表集合', value: 'department' }
])
const selectedCollection = ref('')

const showAddToCollection = () => {
    logger.debug('showAddToCollection called')
    logger.debug('打开添加到集合弹窗', { table: tableData.value?.name })
    logger.debug('集合数据', { collections: collections.value, selectedCollection: selectedCollection.value });

    const handleSelect = (value: string) => {
      logger.debug('handleSelect called', { value });
      if (!value) {
        logger.warn('用户未选择集合', { table: tableData.value?.name })
        Modal.error({ title: '错误', content: '请选择要添加到的集合' })
        return
      }
      
      logger.info('添加到集合', {
        table: tableData.value?.name,
        collection: value,
        collectionLabel: collections.value.find((c: { value: string; label: string }) => c.value === value)?.label || ''
      })
      
      Modal.success({ 
        title: '成功', 
        content: '已添加到集合'
      })
      
      logger.debug('成功添加到集合', {
        table: tableData.value?.name,
        collection: value
      })
      selectedCollection.value = value
    }
    
    Modal.info({
      title: '添加到集合',
      content: () => h(AddToCollectionModal, {
        collections: collections.value,
        initialSelectedCollection: selectedCollection.value,
        'onSelect-collection': handleSelect,
      }),
      onClose: () => {
        logger.debug('用户关闭添加到集合弹窗', { 
          table: tableData.value?.name,
          selected: selectedCollection.value 
        })
      }
    })
}

const applyPermission = () => {
  logger.info('申请权限', tableData.value?.name)
}

const switchToRelationsTab = () => {
  // 切换到关联说明tab
  activeModalTab.value = 'relations'
  relationViewMode.value = 'list'
}
    









</script>

<style scoped>
.table-detail-page {
  padding: 24px;
}

.page-header {
  margin-bottom: 16px;
  background-color: var(--color-bg-2);
}

.table-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.table-info,
.relation-info {
  margin-bottom: 16px;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
}

.relation-diagram {
  margin-top: 8px;
}

.structure-header {
  display: flex;
  justify-content: flex-end;
}

.relations-content {
  min-height: 400px;
}

.relation-tree-container {
  width: 100%;
  height: 400px;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
}
</style>