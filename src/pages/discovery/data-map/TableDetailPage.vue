<template>
  <div class="table-detail-page">
    <a-page-header 
      :title="tableData?.name || '未命名表'" 
      @back="onBack"
      class="page-header"
    >
      <template #extra>
        <a-space>
          <a-button type="outline" size="mini" @click="editTable">
            <template #icon>
              <icon-edit />
            </template>
            编辑
          </a-button>
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
        <a-tabs v-model:active-key="activeMainTab" class="table-content" @change="handleMainTabChange">
      <a-tab-pane key="details" title="明细信息">
        <a-tabs default-active-key="structure">
          <a-tab-pane key="structure" title="表结构">
            <a-card class="table-info" title="字段信息">
              <a-table
                :data="tableData?.fields || []"
                :pagination="false"
                :scroll="{ x: '100%' }"
                :bordered="false"
                class="table-borderless table-compact"
              >
                <template #columns>
                  <a-table-column title="字段名" data-index="name">
                    <template #cell="{ record }">
                      <span 
                        :class="{ 'relation-field': isRelationField(record.name) }"
                        @click="isRelationField(record.name) ? switchToRelationsTab() : null"
                        :style="{ cursor: isRelationField(record.name) ? 'pointer' : 'default' }"
                      >
                        {{ record.name }}
                      </span>
                    </template>
                  </a-table-column>
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
                :bordered="false"
                class="table-borderless table-compact"
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
      <a-tab-pane key="relations" title="数据关系">
        <div class="relation-info">
          <a-space direction="vertical" style="width: 100%">
            <a-card>
              <a-tabs v-model:active-key="relationCategory" type="rounded">
                <a-tab-pane key="association" title="关联关系">
                  <a-tabs v-model:active-key="relationViewMode" type="rounded" @change="onRelationViewModeChange">
                    <a-tab-pane key="graph" title="关联关系可视化">
                      <div ref="relationTreeRef" class="relation-tree-container"></div>
                    </a-tab-pane>
                    <a-tab-pane key="list" title="关联关系列表">
                      <a-table
                        :data="allRelations"
                        :pagination="false"
                        :scroll="{ x: '100%' }"
                        :bordered="false"
                        class="table-borderless table-compact"
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
                              {{ formatRelationFields(record.relationFields) }}
                            </template>
                          </a-table-column>
                          <a-table-column title="关联类型" data-index="relationType" />
                          <a-table-column title="业务模块">
                            <template #cell="{ record }">
                              <a-tag>{{ getModuleByTable(record.targetTable) }}</a-tag>
                            </template>
                          </a-table-column>
                          <a-table-column title="关联说明" data-index="relationDescription" />
                        </template>
                      </a-table>
                    </a-tab-pane>
                  </a-tabs>
                </a-tab-pane>
                <a-tab-pane key="lineage" title="血缘关系">
                  <!-- <div ref="lineageTreeRef" class="relation-tree-container"></div> -->
                   <LineageGraph 
                    v-if="tableData?.name"
                    :table-name="tableData.name" 
                    :layers="1" 
                    style="height: 600px; width: 100%" 
                   />
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
      <a-tab-pane key="logic" title="加工逻辑">
        <a-card class="table-info">
          <template #title>
            <div style="font-size: 16px; font-weight: 500">加工逻辑</div>
          </template>
          <div style="margin-top: 12px">
            <div class="logic-content" style="white-space: pre-wrap; line-height: 1.6; color: var(--color-text-2)">
              {{ tableData?.processingLogic || '暂无加工逻辑说明' }}
            </div>
            
            <a-divider v-if="tableData?.sql" />
            
            <div v-if="tableData?.sql" class="sql-section">
              <div style="font-size: 14px; font-weight: 500; margin-bottom: 12px">SQL 代码</div>
              <div class="sql-code-block">
                <pre><code>{{ tableData.sql }}</code></pre>
              </div>
            </div>
          </div>
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
import { 
  IconStar, 
  IconSafe,
  IconFolderAdd,
  IconLink,
  IconInfoCircle,
  IconExclamationCircle,
  IconEdit
} from '@arco-design/web-vue/es/icon'
import { Modal } from '@arco-design/web-vue'
import { mockTables } from '@/mock/data-map.ts'
import { useRoute, useRouter } from 'vue-router'
import { goBack } from '@/router/utils'
import RelationEditor from './components/RelationEditor.vue'
import AddToCollectionModal from './components/AddToCollectionModal.vue'
import * as echarts from 'echarts/core'
import { TreeChart } from 'echarts/charts'
import { CanvasRenderer } from 'echarts/renderers'
import { TitleComponent, TooltipComponent } from 'echarts/components'
import type { EChartsType, CallbackDataParams } from 'echarts/types/dist/shared'
import { safeInitECharts, safeDisposeChart } from '@/utils/echartsUtils'
import dataMapMock from '@/mock/data-map.ts'
import LineageGraph from '@/pages/management/service/components/LineageGraph.vue'

// 注册必须的组件
echarts.use([TreeChart, CanvasRenderer, TitleComponent, TooltipComponent])



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
  fieldRelations?: Relation[]
  rowCount?: number
  createTime?: string
  lastUpdateTime?: string
  storageSize?: string
  collectionOwner?: string
  relationType?: string
  relationField?: string
  relationDescription?: string
  processingLogic?: string
  sql?: string
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
let relationChart: any = null
// 关系类别：关联关系 / 血缘关系
const relationCategory = ref<'association' | 'lineage'>('association')
// 血缘图相关
const lineageTreeRef = ref<HTMLElement | null>(null)
let lineageChart: any = null
const relationViewModeLineage = ref<'graph' | 'list'>('graph')

interface LineageItem {
  sourceTable: string
  targetTable: string
  relationFields: string[]
  relationType: 'one_to_one' | 'one_to_many' | 'many_to_many' | string
  dataFlow: 'upstream' | 'downstream' | 'bidirectional' | string
  transformationLogic?: string
  updateFrequency?: string
}

const lineageAll = computed<LineageItem[]>(() => {
  const dl = (dataMapMock as any)?.dataLineage || []
  return dl as LineageItem[]
})

const expandedNodes = ref<Set<string>>(new Set())

const goToTableDetail = (table: TableItem) => {
  router.push(`/discovery/data-map/table/${encodeURIComponent(table.name)}`)
}

// 通过关联关系跳转到目标表
const goToTableByRelation = (relation: Relation) => {
  router.push(`/discovery/data-map/table/${encodeURIComponent(relation.targetTable)}`)
}
const onBack = () => goBack(router, '/discovery/data-map/table-list')
const formatRelationFields = (pairs: { sourceField: string; targetField: string }[]) => {
  if (!pairs || pairs.length === 0) return ''
  return pairs.map(p => `${p.sourceField}=${p.targetField}`).join(', ')
}
const isFavorite = ref(false)
const sampleData = ref<any[]>([])
const currentField = ref<TableField>()
const activeModalTab = ref('structure') // 控制关联弹窗内的标签页
const activeMainTab = ref('details') // 控制主标签页
const relatedTables = ref<TableItem[]>([])
const currentTableName = ref<string>('')

const getModuleByTable = (tableName: string) => {
  // 简单映射：根据常见表名返回业务模块/场景
  if (tableName === 'dim_user' || tableName === 'dim_user_profile') return '业务核心数据/用户画像'
  if (tableName === 'fact_loan_apply') return '授信场景'
  if (tableName === 'dws_risk_score') return '风控评分'
  return '数据部'
}

// 监听主标签页切换
const handleMainTabChange = (key: string) => {
  activeMainTab.value = key;
  // 如果切换到关联说明tab，且视图模式为图表，则渲染树图
  if (key === 'relations' && relationViewMode.value === 'graph') {
    nextTick(() => {
      renderRelationTree();
    });
  }
}

// 监听标签页切换（保留原有函数以防其他地方使用）
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
  if (activeMainTab.value === 'relations' && newMode === 'graph') {
    nextTick(() => {
      renderRelationTree();
    });
  }
})

// onMounted(() => {
//   initRelations();
// })

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
    { label: '数据更新时间', value: data.lastUpdateTime || 'N/A' },
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

// 判断是否为关联字段
const isRelationField = (fieldName: string) => {
  const relationFieldNames = ['id', 'user_id', 'product_id']
  return relationFieldNames.includes(fieldName.toLowerCase())
}

// 初始化关联关系数据
const initRelations = () => {
  logger.debug('初始化关联关系数据', { tableName: tableData.value?.name });
  
  // 根据表名动态生成关联关系数据
  if (tableData.value?.name === 'dim_user') {
    allRelations.value = [
      {
        id: '1',
        sourceTable: 'dim_user',
        targetTable: 'dim_user_profile',
        relationFields: [{ sourceField: 'id', targetField: 'user_id' }],
        relationType: '1:1',
        relationDescription: '关联到用户画像维度表'
      },
      {
        id: '2',
        sourceTable: 'dim_user',
        targetTable: 'fact_loan_apply',
        relationFields: [{ sourceField: 'id', targetField: 'user_id' }],
        relationType: '1:N',
        relationDescription: '关联到贷款申请事实表'
      }
    ];
  } else if (tableData.value?.name === 'fact_loan_apply') {
    allRelations.value = [
      {
        id: '1',
        sourceTable: 'fact_loan_apply',
        targetTable: 'dim_user',
        relationFields: [{ sourceField: 'user_id', targetField: 'id' }],
        relationType: 'N:1',
        relationDescription: '关联到用户维度表'
      }
    ];
  } else {
    // 默认的关联关系数据
    allRelations.value = [
      {
        id: '1',
        sourceTable: tableData.value?.name || '',
        targetTable: 'dim_user',
        relationFields: [{ sourceField: 'user_id', targetField: 'id' }],
        relationType: 'N:1',
        relationDescription: '关联到用户维度表'
      },
      {
        id: '2',
        sourceTable: tableData.value?.name || '',
        targetTable: 'fact_loan_apply',
        relationFields: [{ sourceField: 'id', targetField: 'user_id' }],
        relationType: '1:N',
        relationDescription: '关联到贷款申请事实表'
      }
    ];
  }
  
  logger.debug('关联关系数据初始化完成', { relations: allRelations.value });
  
  // 如果当前在关联说明tab且视图模式为图表，则渲染树图
  logger.debug('初始化关联关系数据完成，检查是否需要渲染树图', { 
    activeTab: activeMainTab.value, 
    viewMode: relationViewMode.value,
    shouldRender: activeMainTab.value === 'relations' && relationViewMode.value === 'graph'
  });
  if (activeMainTab.value === 'relations' && relationViewMode.value === 'graph') {
    nextTick(() => {
      logger.debug('准备渲染关系树图');
      renderRelationTree();
    });
  } else {
    logger.debug('条件不满足，跳过渲染');
  }
}

// 弹窗标题
const modalTitle = computed(() => {
  if (currentTableName.value) {
    return `当前表 与 ${currentTableName.value} 的关联关系` // 不直接引用tableData.value?.name以避免循环依赖
  }
  return `${currentField?.value?.name || ''} 关联表`
})

// 从路由参数加载表数据
watch(() => route.params, (params: { [key: string]: string | string[] }) => {
  const tableParam = Array.isArray(params.table) ? params.table[0] : params.table || 
              Array.isArray(params.tableName) ? params.tableName[0] : params.tableName
  logger.debug('路由参数', { tableParam })
  
  if (tableParam) {
    tableData.value = parseTableData(tableParam) || createSafeTableData({})
    logger.debug('解析表数据', { name: tableData.value?.name })
    // 初始化关联关系数据
    initRelations()
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
              owner: '张三',
              processingLogic: `1. 数据来源：
   - ODS层 user_info 表
   - ODS层 user_extra 表

2. 清洗规则：
   - 过滤 user_id 为空的记录
   - 手机号格式标准化
   - 注册时间转换为标准时间戳

3. 聚合逻辑：
    - 每日全量覆盖
    - 根据 user_id 关联扩展信息`,
               sql: `-- 每日全量覆盖
INSERT OVERWRITE TABLE dim_user
SELECT 
  t1.user_id,
  t1.mobile,
  t1.register_time,
  t2.age,
  t2.gender,
  t2.city,
  t2.vip_level
FROM 
  (SELECT * FROM ods_user_info WHERE user_id IS NOT NULL) t1
LEFT JOIN 
  ods_user_extra t2
ON 
  t1.user_id = t2.user_id;`
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
    processingLogic: '',
    sql: '',
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
  logger.debug('表数据变化，检查是否需要重新渲染树图', { 
    activeTab: activeModalTab.value, 
    viewMode: relationViewMode.value,
    shouldRender: activeModalTab.value === 'relations' && relationViewMode.value === 'graph'
  });
  if (activeModalTab.value === 'relations' && relationViewMode.value === 'graph') {
    nextTick(() => {
      logger.debug('准备渲染关系树图');
      renderRelationTree();
    });
  } else {
    logger.debug('条件不满足，跳过渲染');
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

// 处理关系视图模式变化
const onRelationViewModeChange = (value: string) => {
  logger.debug('关系视图模式变化', { value, activeTab: activeModalTab.value });
  if (value === 'graph' && activeModalTab.value === 'relations') {
    nextTick(() => {
      logger.debug('切换到可视化视图，准备渲染关系树图');
      renderRelationTree();
    });
  }
}

// 监听活动标签页变化
watch(activeModalTab, (newTab: string, oldTab: string) => {
  logger.debug('活动标签页变化', { oldTab, newTab, viewMode: relationViewMode.value });
  // 当切换到关联说明tab且视图模式为图表时，渲染树图
  if (newTab === 'relations' && relationViewMode.value === 'graph') {
    nextTick(() => {
      logger.debug('切换到关联标签页且为图表模式，准备渲染关系树图');
      renderRelationTree();
    });
  }
});

// 渲染关联关系图
const renderRelationTree = async () => {
  logger.debug('开始渲染关联关系图')
  if (!relationTreeRef.value) {
    logger.warn('relationTreeRef 未找到，无法渲染图表')
    return
  }
  
  // 检查容器元素的尺寸
  const container = relationTreeRef.value;
  logger.debug('图表容器元素', { 
    offsetWidth: container.offsetWidth, 
    offsetHeight: container.offsetHeight,
    clientWidth: container.clientWidth,
    clientHeight: container.clientHeight
  });
  
  // 检查是否有关联关系数据
  logger.debug('检查关联关系数据', { 
    hasRelations: allRelations.value && allRelations.value.length > 0,
    relationCount: allRelations.value?.length,
    tableData: tableData.value?.name
  });
  
  // 如果没有关联关系数据，则不渲染图表
  if (!allRelations.value || allRelations.value.length === 0) {
    logger.warn('没有关联关系数据，跳过图表渲染');
    return;
  }
  
  // 销毁之前的图表实例
  if (relationChart) {
    logger.debug('销毁之前的图表实例')
    relationChart.dispose()
  }
  
  // 初始化ECharts实例
  logger.debug('开始安全初始化关联关系图表')
  try {
    relationChart = await safeInitECharts(relationTreeRef.value, {
      theme: 'default',
      width: 800,
      height: 600,
      renderer: 'canvas'
    })
    logger.debug('关联关系图表初始化成功', { chart: !!relationChart });
  } catch (error) {
    logger.error('关联关系图表初始化失败', error);
    return;
  }
  
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
            // 检查关联关系数据完整性
            logger.debug('处理关联关系', { 
              index, 
              relation, 
              hasTargetTable: !!relation.targetTable,
              hasRelationFields: !!relation.relationFields && relation.relationFields.length > 0
            });
            
            // 如果关联关系数据不完整，跳过该关系
            if (!relation.targetTable || !relation.relationFields || relation.relationFields.length === 0) {
              logger.warn('关联关系数据不完整，跳过该关系', { index, relation });
              return null;
            }
            
            const targetNode = {
              name: relation.targetTable,
              // 添加节点标识用于区分点击行为
              relationId: relation.id || index,
              itemStyle: {
                color: '#52c41a'
              },
              label: {
                fontWeight: 'bold'
              },
              // 为tooltip添加额外信息
              description: `关联字段: ${relation.relationFields.map((f: { sourceField: string; targetField: string }) => `${f.sourceField}=${f.targetField}`).join(', ')}
关联类型: ${relation.relationType}
关联说明: ${relation.relationDescription || '无'}`
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
      }).filter((node: any) => node !== null) // 过滤掉空节点
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
    position: 'top',
    formatter: (params: CallbackDataParams) => {
        const nodeData = params.data as { 
          nodeType?: string; 
          parentNode?: { relationId?: string; name?: string; description?: string }; 
          name?: string;
          relationId?: string;
          description?: string;
        };
        
        // 根据节点类型显示不同的tooltip内容
        if (nodeData.nodeType === 'field' && nodeData.parentNode && nodeData.name) {
          return `关联表: ${nodeData.parentNode.name}<br/>关联字段: ${nodeData.name.replace('关联字段: ', '')}`;
        } else if (nodeData.nodeType === 'type' && nodeData.parentNode && nodeData.name) {
          return `关联表: ${nodeData.parentNode.name}<br/>关联类型: ${nodeData.name.replace('关联类型: ', '')}`;
        } else if (nodeData.description && nodeData.name) {
          // 对于目标表节点，显示完整的关联信息，分行展示
          const lines = nodeData.description.split('\n');
          return `${nodeData.name}<br/>${lines.join('<br/>')}`;
        }
        
        // 默认显示节点名称
        return nodeData.name || '';
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
            const nodeData = params.data as { nodeType?: string; name?: string };
            if (nodeData.nodeType === 'field') {
              return `{field|${params.name}}`;
            } else if (nodeData.nodeType === 'type') {
              return `{type|${params.name}}`;
            } else if (nodeData.nodeType === 'task') {
              return `{task|${params.name}}`;
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
            task: {
              color: '#722ed1',
              fontSize: 12,
              fontStyle: 'italic'
            },
            description: {
              color: '#faad14',
              fontSize: 12
            }
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
              const nodeData = params.data as { nodeType?: string; name?: string };
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
  try {
    relationChart.setOption(option);
  } catch (error) {
    logger.error('图表渲染失败', error);
    return;
  }
  
  // 监听节点点击事件
  try {
  relationChart.on('click', (params: CallbackDataParams) => {
      const data = params.data as { name?: string; relationId?: string; nodeType?: string; description?: string };
      
      // 只有点击目标表节点时才跳转
      if (data && data.name && data.relationId !== undefined && !data.nodeType) {
        // 使用更准确的方式查找relation
        const relation = allRelations.value.find((r: Relation) => r.id === data.relationId) || 
                        allRelations.value[Number(data.relationId)];
        if (relation) {
          // 跳转到目标表
          goToTableByRelation(relation);
        }
      }
      // 关联字段和关联类型节点不处理点击事件
    });
  } catch (error) {
    logger.error('设置节点点击事件监听器失败', error);
  }
}

const renderLineageTree = async () => {
  if (!lineageTreeRef.value) return
  if (lineageChart) lineageChart.dispose()
  try {
    lineageChart = await safeInitECharts(lineageTreeRef.value, {
      theme: 'default',
      width: 800,
      height: 600,
      renderer: 'canvas'
    })
  } catch {
    return
  }
  const tableName = tableData.value?.name || '当前表'
  const getUpChildren = (name: string) =>
    lineageAll.value.filter((i: LineageItem) => i.targetTable?.toLowerCase() === name.toLowerCase()).map((i: LineageItem) => ({ name: i.sourceTable, task: i.transformationLogic }))
  const getDownChildren = (name: string) =>
    lineageAll.value.filter((i: LineageItem) => i.sourceTable?.toLowerCase() === name.toLowerCase()).map((i: LineageItem) => ({ name: i.targetTable, task: i.transformationLogic }))
  const buildNode = (name: string, direction: 'upstream' | 'downstream' | 'both' = 'both', visited: Set<string> = new Set()) => {
    const key = name.toLowerCase()
    if (visited.has(key)) {
      return {
        name,
        itemStyle: { color: name === tableName ? '#1890ff' : '#8c8c8c' },
        label: { fontWeight: 'bold' },
        children: []
      }
    }
    visited.add(key)
    const node: any = {
      name,
      itemStyle: { color: name === tableName ? '#1890ff' : '#8c8c8c' },
      label: { fontWeight: 'bold' }
    }
    
    let upChildren: { name: string; task: string }[] = []
    let downChildren: { name: string; task: string }[] = []
    
    // 根据方向获取子节点
    if (direction === 'upstream' || direction === 'both') {
      upChildren = getUpChildren(name)
    }
    if (direction === 'downstream' || direction === 'both') {
      downChildren = getDownChildren(name)
    }

    // 处理向上游展开的节点
    const upNodes = upChildren.map(child => {
      const childNode: any = {
        name: child.name,
        itemStyle: { color: '#fa8c16' }, // 上游颜色
        label: { fontWeight: 'bold' },
        nodeType: 'table',
        direction: 'upstream',
        edgeLabel: {
          show: true,
          formatter: child.task || '加工任务',
          fontSize: 10,
          color: '#666',
          backgroundColor: '#fff',
          padding: [2, 4]
        }
      }
      if (expandedNodes.value.has(child.name.toLowerCase())) {
        const nextVisited = new Set(visited)
        childNode.children = buildNode(child.name, 'upstream', nextVisited).children || []
      }
      return childNode
    })

    // 处理向下游展开的节点
    const downNodes = downChildren.map(child => {
      const childNode: any = {
        name: child.name,
        itemStyle: { color: '#13c2c2' }, // 下游颜色
        label: { fontWeight: 'bold' },
        nodeType: 'table',
        direction: 'downstream',
        edgeLabel: {
          show: true,
          formatter: child.task || '加工任务',
          fontSize: 10,
          color: '#666',
          backgroundColor: '#fff',
          padding: [2, 4]
        }
      }
      if (expandedNodes.value.has(child.name.toLowerCase())) {
        const nextVisited = new Set(visited)
        childNode.children = buildNode(child.name, 'downstream', nextVisited).children || []
      }
      return childNode
    })

    node.children = [...upNodes, ...downNodes]
    return node
  }
  const nodes = [buildNode(tableName, 'both', new Set())]
  const option = {
    title: { text: '数据血缘关系图' },
    tooltip: {
      show: true,
      trigger: 'item',
      position: 'top',
      formatter: (params: CallbackDataParams) => {
        const nodeData = params.data as { name?: string }
        return nodeData.name || ''
      }
    },
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
          formatter: (p: { name: string }) => p.name
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
            formatter: (p: { name: string }) => p.name
          }
        },
        data: [nodes[0]],
        lineStyle: { color: '#ccc', width: 1, curveness: 0 }
      }
    ]
  }
  try {
    lineageChart.setOption(option)
  } catch {
    return
  }
  try {
    lineageChart.on('click', (params: CallbackDataParams) => {
      const data = params.data as { name?: string }
      if (!data || !data.name) return
      const name = String(data.name).toLowerCase()
      if (expandedNodes.value.has(name)) {
        expandedNodes.value.delete(name)
      } else {
        expandedNodes.value.add(name)
      }
      renderLineageTree()
    })
  } catch {}
}

const onLineageViewModeChange = (value: string) => {
  if (value === 'graph' && activeMainTab.value === 'relations' && relationCategory.value === 'lineage') {
    nextTick(() => {
      renderLineageTree()
    })
  }
}

watch(relationCategory, (cat: 'association' | 'lineage') => {
  if (cat === 'lineage' && activeMainTab.value === 'relations' && relationViewModeLineage.value === 'graph') {
    nextTick(() => {
      renderLineageTree()
    })
  }
})

watch(relationViewModeLineage, (newMode: 'graph' | 'list') => {
  if (newMode === 'graph' && activeMainTab.value === 'relations' && relationCategory.value === 'lineage') {
    nextTick(() => {
      renderLineageTree()
    })
  }
})

const editTable = () => {
  // 重定向到注册表单页面，并传递编辑模式和数据
  if (tableData.value?.name) {
    router.push({
      path: '/discovery/asset-management/table-management/register',
      query: { 
        mode: 'edit',
        id: tableData.value.name // 使用表名作为ID
      }
    })
  }
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
  // 切换到主标签页的数据关系tab
  activeMainTab.value = 'relations'
  relationViewMode.value = 'list'
}

// 组件挂载时检查是否需要渲染关系图
onMounted(() => {
  logger.debug('组件挂载完成', { 
    activeTab: activeMainTab.value, 
    viewMode: relationViewMode.value,
    hasRelations: allRelations.value && allRelations.value.length > 0
  });
  
  // 如果当前在关联说明tab且视图模式为图表，则渲染树图
  if (activeMainTab.value === 'relations' && relationViewMode.value === 'graph') {
    nextTick(() => {
      logger.debug('组件挂载后准备渲染关系树图');
      renderRelationTree();
    });
  }
});
    









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
  height: 500px;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  margin-top: 16px;
  position: static;
  z-index: 1000;
}

.relation-field {
  color: #1890ff;
  text-decoration: underline;
}

.sql-code-block {
  background-color: #f5f7fa;
  padding: 16px;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Consolas', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.5;
  color: #333;
  overflow-x: auto;
  border: 1px solid var(--color-border-2);
}

.sql-code-block pre {
  margin: 0;
  padding: 0;
}
</style>
