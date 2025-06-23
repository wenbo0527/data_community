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
        <a-tabs type="rounded" v-model:active-key="activeModalTab">
          <a-tab-pane key="structure" title="表结构">
            <!-- <a-button type="primary" size="mini" style="margin-bottom: 16px;" @click="showRelationEditor">编辑关联关系</a-button> -->
            <a-table :data="tableData.fields || []" :bordered="false" :pagination="false">
              <template #columns>
                <a-table-column title="字段名" dataIndex="name">
                  <template #cell="{ record }">
                    <a-link v-if="['id', 'user_id'].includes(record.name.toLowerCase())" @click="showRelatedTables(record)">
                      {{ record.name }}
                    </a-link>
                    <span v-else>{{ record.name }}</span>
                  </template>
                </a-table-column>
                <a-table-column title="类型" dataIndex="type" />
                <a-table-column title="描述" dataIndex="description" />
                <a-table-column title="操作">
                  <template #cell="{ record }">
                    <a-button type="text" size="mini" @click="editFieldRelations(record)">编辑关联关系</a-button>
                  </template>
                </a-table-column>
              </template>
            </a-table>
          </a-tab-pane>
          
          <a-tab-pane key="preview" title="数据预览">
            <a-table :data="sampleData" :bordered="false" :pagination="false">
              <template #columns>
                <a-table-column 
                  v-for="field in tableData.fields" 
                  :key="field.name" 
                  :title="field.name" 
                  :dataIndex="field.name" 
                />
              </template>
            </a-table>
          </a-tab-pane>
          
          <a-tab-pane key="usage" title="使用说明">
            <a-typography-paragraph>
              {{ tableData.description || '暂无使用说明' }}
              <a-link copyable>
                /discovery/data-map/table/dim_user
              </a-link>
              <a-button type="primary" size="small" style="margin-left: 8px" @click="router.push('/discovery/data-map/table/dim_user')">
                <template #icon>
                  <icon-link />
                </template>
                访问示例
              </a-button>
            </a-typography-paragraph>
            <a-typography-paragraph>
              <a-alert type="info">
                <template #icon><icon-info-circle /></template>
                <template #message>
                  您可以将表名替换为任意有效的表名，例如：
                  <a-space>
                    <a-tag color="#165DFF" style="cursor: pointer" @click="router.push('/discovery/data-map/table/fact_loan_apply')">fact_loan_apply</a-tag>
                    <a-tag color="#722ED1" style="cursor: pointer" @click="router.push('/discovery/data-map/table/dwd_fraud_alert')">dwd_fraud_alert</a-tag>
                    <a-tag color="#0FC6C2" style="cursor: pointer" @click="router.push('/discovery/data-map/table/dws_risk_score')">dws_risk_score</a-tag>
                  </a-space>
                </template>
              </a-alert>
            </a-typography-paragraph>
            <a-typography-paragraph>
              <a-alert type="warning">
                <template #icon><icon-exclamation-circle /></template>
                <template #message>
                  注意：请确保您有访问相应表的权限。如果没有权限，您可以点击页面右上角的"申请权限"按钮。
                </template>
              </a-alert>
            </a-typography-paragraph>
          </a-tab-pane>
        </a-tabs>
      </a-card>
      
      <!-- 关联关系弹窗 -->
      <a-modal 
        v-model:visible="relationModalVisible" 
        :title="modalTitle"
        width="800px"
      >
        <div v-if="activeModalTab === 'view'">
          <a-table :data="relatedTables" :bordered="false">
            <template #columns>
              <a-table-column title="表名" dataIndex="name">
                <template #cell="{ record }">
                  <a-link @click="goToTableDetail(record)">{{ record.name }}</a-link>
                </template>
              </a-table-column>
              <a-table-column title="类型" dataIndex="type">
                <template #cell="{ record }">
                  <a-tag :color="getTypeColor(record.type)">{{ record.type }}</a-tag>
                </template>
              </a-table-column>
              <a-table-column title="关联字段" dataIndex="relationField">
                <template #cell="{ record }">
                  {{ currentField?.name || 'user_id' }}
                </template>
              </a-table-column>
              <a-table-column title="关联类型" dataIndex="relationType">
                <template #cell="{ record }">
                  {{ record.relationType || '主表关联' }}
                </template>
              </a-table-column>
              <a-table-column title="关联说明" dataIndex="relationDescription">
                <template #cell="{ record }">
                  {{ record.relationDescription || '提供数据关联' }}
                </template>
              </a-table-column>
            </template>
          </a-table>
        </div>
        
        <div v-if="activeModalTab === 'edit'">
          <RelationEditorPanel
            :field-name="editingField?.name || ''"
            :initial-relations="fieldRelations"
            @save-relations="handleSaveRelations"
          />
        </div>
      </a-modal>
    </div>
    <div v-else class="empty-state">
      <a-empty description="请选择一个数据表查看详情" />
    </div>
    
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, watchEffect, h } from 'vue'
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
import RelationEditorPanel from './components/RelationEditorPanel.vue'
import AddToCollectionModal from './components/AddToCollectionModal.vue'



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

const route = useRoute()
const router = useRouter()
const tableData = ref<TableItem | undefined>()

const goToTableDetail = (table: TableItem) => {
  router.push(`/discovery/data-map/table/${encodeURIComponent(table.name)}`)
}
const isFavorite = ref(false)
const relationModalVisible = ref(false)
const sampleData = ref<any[]>([])
const currentField = ref<TableField>()
const activeModalTab = ref('structure') // 控制关联弹窗内的标签页
const relatedTables = ref<TableItem[]>([])
const currentTableName = ref<string>('')

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
  const fields = tableData.value?.fields?.filter(field => 
    ['id', 'user_id', 'product_id'].includes(field.name.toLowerCase())
  ) || []
  logger.debug('关联字段解析', {
    totalFields: tableData.value?.fields?.length || 0,
    matchedFields: fields.map(f => f.name)
  })
  return fields
})

// 弹窗标题
const modalTitle = computed(() => {
  if (currentTableName.value) {
    return `${tableData.value?.name} 与 ${currentTableName.value} 的关联关系`
  }
  return `${currentField?.value?.name || ''} 关联表`
})

// 从路由参数加载表数据
watchEffect(() => {
  const tableParam = Array.isArray(route.params.table) ? route.params.table[0] : route.params.table || 
              Array.isArray(route.params.tableName) ? route.params.tableName[0] : route.params.tableName
  logger.debug('路由参数', { tableParam })
  
  if (tableParam) {
    tableData.value = parseTableData(tableParam) || createSafeTableData({})
    logger.debug('解析表数据', { name: tableData.value?.name })
  } else {
    tableData.value = createSafeTableData({})
  }
})



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






watch(tableData, (currentRefData) => {
  if (!currentRefData || !currentRefData.fields?.length) {
    logger.debug('样本数据重置', '表数据为空或无字段')
    sampleData.value = []
    return
  }
  
  try {
    sampleData.value = Array(2).fill(0).map((_, i) => {
      const row = { id: i + 1 }
      currentRefData.fields.forEach(field => {
        if (field?.name) {
          (row as Record<string, any>)[field.name] = `mock_${field.name}_${i + 1}`
        }
      })
      return row
    })
    logger.debug('样本数据生成', { count: sampleData.value.length })
  } catch (error) {
    logger.error('样本数据生成失败', error)
    sampleData.value = []
  }
}, { immediate: true, deep: true })

const toggleFavorite = () => {
  isFavorite.value = !isFavorite.value
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
        collectionLabel: collections.value.find(c => c.value === value)?.label || ''
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

const showRelatedTables = (field: TableField) => {
  console.group('关联字段处理')
  logger.debug('开始处理关联字段', { 
    field: field.name, 
    fieldType: field.type,
    currentTable: tableData.value?.name 
  })
  
  currentField.value = field
  currentTableName.value = ''
  const tables = getRelatedTables(field)
  
  logger.debug('获取关联表结果', {
    fieldName: field.name,
    matchedTables: tables.map(t => t.name),
    totalCount: tables.length
  })
  
  // 为关联表添加更多信息
  relatedTables.value = tables.map(table => {
    const relationType = getRelationType(tableData.value?.name || '', table.name)
    const relationDescription = getRelationDescription(tableData.value?.name || '', table.name, field.name)
    
    logger.debug('处理关联表信息', {
      tableName: table.name,
      relationType,
      relationDescription
    })
    
    return {
      ...table,
      relationField: field.name,
      relationType,
      relationDescription
    }
  })
  
  relationModalVisible.value = true
  activeModalTab.value = 'view'

  // 记录最终处理结果
  logger.info('关联表查询完成', { 
    field: field.name, 
    count: tables.length,
    relations: relatedTables.value.map(t => `${t.name}(${t.relationType})`)
  })
  console.groupEnd()
}
    
// 通过表名查看关联表
const showRelatedTablesByName = (tableName: string) => {
  currentTableName.value = tableName
  const targetTable = mockTables.find(t => t.name === tableName)
  
  if (targetTable) {
    // 查找关联字段，默认为user_id
    const relationField = targetTable.fields?.find(f => f.name.toLowerCase() === 'user_id') || {
      name: 'user_id',
      type: 'string',
      description: '用户ID'
    }
    
    const relationType = getRelationType(tableData.value?.name || '', tableName)
    const relationDescription = getRelationDescription(tableData.value?.name || '', tableName, 'user_id')
    
    relatedTables.value = [{
      ...targetTable,
      relationField: relationField.name,
      relationType,
      relationDescription
    }]
    
    logger.debug('关联表信息更新', {
      tableName,
      relationField: relationField.name,
      relationType,
      relationDescription
    })
    
    relationModalVisible.value = true
    activeModalTab.value = 'view'
  }
}

// 获取关联表信息
const getRelatedTables = (field: TableField) => {
  console.group('获取关联表')
  logger.debug('开始查找关联表', { 
    fieldName: field.name,
    isRelationField: ['id', 'user_id'].includes(field.name.toLowerCase())
  })
  
  let result: TableItem[] = []
  if (['id', 'user_id'].includes(field.name.toLowerCase())) {
    // 返回与当前表关联的表
    result = mockTables.filter(t => {
      const hasMatchingField = t.fields?.some(f => f.name.toLowerCase() === field.name.toLowerCase())
      logger.debug('检查表字段匹配', {
        tableName: t.name,
        hasMatchingField,
        matchedField: field.name
      })
      return hasMatchingField
    })
  }
  
  logger.debug('关联表查找完成', {
    fieldName: field.name,
    matchedTables: result.map(t => t.name),
    totalMatches: result.length
  })
  console.groupEnd()
  return result
}

// 获取表类型对应的颜色
const getTypeColor = (type: string) => {
  const typeColors = {
    'dim': '#165DFF',
    'fact': '#FF7D00',
    'dwd': '#722ED1',
    'dws': '#0FC6C2',
    'ads': '#F5319D'
  }
  const typeKey = type.toLowerCase() as keyof typeof typeColors;
  return typeColors[typeKey] || '#86909C'
}

const editingField = ref<TableField | null>(null)
const fieldRelations = ref<Relation[]>([]) // State to hold relations for the currently edited field

interface Relation {
  targetTable: string
  relationField: string
  relationType?: string
  relationDescription?: string
}

const editFieldRelations = (field: TableField) => {
  logger.debug('编辑字段关联关系', { fieldName: field.name })
  editingField.value = field
  // Load existing relations for this field (mock data or from API)
  fieldRelations.value = getMockRelationsForField(field.name) // Implement this function to fetch real data
  relationModalVisible.value = true
  activeModalTab.value = 'edit'
}

const handleSaveRelations = (relations: Relation[]) => {
  logger.info('保存关联关系', { field: editingField.value?.name, relations })
  // Here you would typically save the relations to your backend or state management
  // For this mock, we'll just log it.
  // You might want to update a local state that stores relations per field.
  // Example: updateFieldRelations(editingField.value.name, relations)
}

// Mock function to get existing relations for a field
const getMockRelationsForField = (fieldName: string): Relation[] => {
  // This is a placeholder. In a real app, fetch this data.
  if (fieldName.toLowerCase() === 'user_id') {
    return [
      { targetTable: 'fact_loan_apply', relationField: 'user_id', relationType: '维度-事实关联', relationDescription: '提供申请人基础信息' },
      { targetTable: 'dws_risk_score', relationField: 'user_id', relationType: '维度-汇总关联', relationDescription: '提供用户基础画像数据' },
    ]
  } else if (fieldName.toLowerCase() === 'id') {
     return [
      { targetTable: 'dim_product', relationField: 'product_id', relationType: '字段关联', relationDescription: '关联产品信息' },
    ]
  }
  return []
}

// 获取关联类型
const getRelationType = (sourceTable: string, targetTable: string) => {
  if (!sourceTable || !targetTable) return '字段关联'
  
  const sourceType = mockTables.find(t => t.name === sourceTable)?.type?.toLowerCase() || ''
  const targetType = mockTables.find(t => t.name === targetTable)?.type?.toLowerCase() || ''
  
  if (sourceType === 'dim' && targetType.startsWith('fact')) {
    return '维度-事实关联'
  } else if (sourceType === 'dim' && (targetType.startsWith('dwd') || targetType.startsWith('dws'))) {
    return '维度-汇总关联'
  } else if (sourceType.startsWith('fact') && targetType === 'dim') {
    return '事实-维度关联'
  } else if ((sourceType.startsWith('dwd') || sourceType.startsWith('dws')) && targetType === 'dim') {
    return '汇总-维度关联'
  }
  
  return '字段关联'
}

// 获取关联说明
const getRelationDescription = (sourceTable: string, targetTable: string, fieldName: string) => {
  if (sourceTable === 'dim_user') {
    if (targetTable === 'fact_loan_apply') {
      return '提供申请人基础信息'
    } else if (targetTable === 'dws_risk_score') {
      return '提供用户基础画像数据'
    } else if (targetTable === 'dwd_fraud_alert') {
      return '提供欺诈风险信息'
    }
  } else if (targetTable === 'dim_user') {
    return '获取用户基础信息'
  }
  return '数据关联'  
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
</style>