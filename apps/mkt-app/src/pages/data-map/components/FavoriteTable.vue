<template>
  <a-card class="favorite-tables">
    <template #title>
      <a-space>
        <IconStar />
        常用表
      </a-space>
    </template>
    <template #extra>
      <a-button type="primary" size="small" @click="showCreateCollectionDialog">
        <template #icon>
          <IconPlus />
        </template>
        创建场景集合
      </a-button>
    </template>
    <a-row :gutter="[16, 16]">
      <a-col v-for="collection in tableCollections" :key="collection.id" :span="8">
        <a-card class="scene-card" hoverable @click="showCollectionDetail(collection)">
          <template #title>
            <a-space align="center">
              <IconStarFill style="color: #ffb400" />
              <a-typography-title :heading="6">
                {{ collection.name }}
              </a-typography-title>
            </a-space>
          </template>
          <a-typography-paragraph :ellipsis="{ rows: 2 }" type="secondary" class="scene-description">
            {{ collection.description }}
          </a-typography-paragraph>
          <div class="scene-footer">
            <a-space align="center" style="margin-bottom: 8px;">
              <IconFile />
              <span>总表数: </span>
              <a-typography-text strong>{{ collection.tables.length }}</a-typography-text>
            </a-space>
            <a-tag size="small" v-for="table in collection.tables.slice(0, 3)" :key="table.name">
              {{ table.name }}
            </a-tag>
            <a-typography-text type="secondary" v-if="collection.tables.length > 3">
              等{{ collection.tables.length }}个表
            </a-typography-text>
          </div>
        </a-card>
      </a-col>
    </a-row>
  </a-card>

  <!-- 创建表集合对话框 -->
  <a-modal
    v-model:visible="createCollectionVisible"
    title="创建表集合"
    @ok="handleCreateCollection"
  >
    <a-form :model="newCollection">
      <a-form-item field="name" label="集合名称">
        <a-input v-model="newCollection.name" placeholder="请输入集合名称，如：贷前分析常用表" />
      </a-form-item>
      <a-form-item field="description" label="集合描述">
        <a-textarea
          v-model="newCollection.description"
          placeholder="请输入集合描述"
          :auto-size="{ minRows: 2, maxRows: 5 }"
        />
      </a-form-item>
      <div class="dialog-sections">
        <a-input-search
          v-model="searchKeyword"
          placeholder="搜索表名或描述"
          style="margin-bottom: 16px"
        />
        
        <!-- 已选表列表 -->
        <div class="selected-tables" v-if="newCollection.tables.length > 0" style="margin-bottom: 16px">
          <a-typography-title :heading="6">已选表</a-typography-title>
          <a-space wrap>
            <a-tag 
              v-for="table in newCollection.tables" 
              :key="table.name"
              closable
              @close="removeSelectedTable(table)"
              size="small"
            >
              {{ table.name }}
            </a-tag>
          </a-space>
        </div>
        
        <a-table
          :data="filteredTables"
          :columns="tableColumns"
          :pagination="false"
          :row-selection="rowSelection"
          :row-key="'key'"
          size="small"
          class="table-selector"
        >
          <template #columns>
            <a-table-column title="表名" data-index="label" :width="180">
              <template #cell="{ record }">
                <a-typography-text strong>{{ record.label }}</a-typography-text>
              </template>
            </a-table-column>
            <a-table-column title="类型" data-index="type" :width="100">
              <template #cell="{ record }">
                <a-tag size="small" :color="getTypeColor(record.type)">{{ record.type }}</a-tag>
              </template>
            </a-table-column>
            <a-table-column title="描述" data-index="description">
              <template #cell="{ record }">
                <a-typography-paragraph type="secondary" :ellipsis="{ rows: 1 }">
                  {{ record.description }}
                </a-typography-paragraph>
              </template>
            </a-table-column>
          </template>
        </a-table>
      </div>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed, h, watch } from 'vue'
import { IconStar, IconStarFill, IconPlus, IconFile } from '@arco-design/web-vue/es/icon'
import { Message } from '@arco-design/web-vue'

interface TableItem {
  name: string
  type: string
  category: string
  domain: string
  updateFrequency: string
  owner: string
  description: string
  fields: TableField[]
}

interface TableField {
  name: string
  type: string
  description: string
}

interface TableCollection {
  id: string
  name: string
  description: string
  tables: TableItem[]
}

interface FavoriteTableEmits {
  (e: 'remove', table: TableItem): void;
  (e: 'show-detail', table: TableItem): void;
  (e: 'create-collection', collection: Omit<TableCollection, 'id'>): void;
  (e: 'show-collection-detail', collection: TableCollection): void;
}

const props = defineProps<{
  favoriteTables: TableItem[]
  tableCollections: TableCollection[]
}>()

const activeCollection = ref<TableCollection | null>(null)

const emit = defineEmits<FavoriteTableEmits>()

const createCollectionVisible = ref(false)
const searchKeyword = ref('')
const tableLoading = ref(false)
const selectedKeys = ref<string[]>([])

// 监听selectedKeys变化，同步更新newCollection.tables
watch(selectedKeys, (newKeys) => {
  if (!newKeys || !mockTransferData.value) return
  
  console.log('当前选中的key值:', newKeys);
  
  newCollection.value.tables = mockTransferData.value
    .filter(item => item?.key && newKeys.includes(item.key))
    .map(item => {
      console.log('Transfer item 数据:', JSON.stringify(item, null, 2));
      console.log('当前渲染的表项数据:', item);
      return {
        name: item?.name || '',
        type: item?.type || '',
        category: '',
        domain: '',
        updateFrequency: '',
        owner: '',
        description: item?.description || '',
        fields: []
      }
    })
    
  console.log('转换后的表数据:', newCollection.value.tables);
})

const tableColumns = [
  {
    title: '表名',
    dataIndex: 'label',
    width: 180
  },
  {
    title: '类型',
    dataIndex: 'type',
    width: 100
  },
  {
    title: '描述',
    dataIndex: 'description'
  }
]

const rowSelection = {
  type: 'checkbox',
  showCheckedAll: true,
  onlyCurrent: false
}

const filteredTables = computed(() => {
  if (!searchKeyword.value) return mockTransferData.value
  
  const filtered = mockTransferData.value.filter(item => {
    if (!item) return false
    return (
      (item.label && item.label.toLowerCase().includes(searchKeyword.value.toLowerCase())) ||
      (item.description && item.description.toLowerCase().includes(searchKeyword.value.toLowerCase())) ||
      (item.name && item.name.toLowerCase().includes(searchKeyword.value.toLowerCase()))
    )
  })
  
  return filtered.length > 0 ? filtered : [{ 
    key: 'no-data', 
    label: '暂无数据', 
    description: '未找到匹配的表，请尝试其他搜索关键词',
    type: 'empty'
  }]
})

const mockTransferData = ref([
  {
    key: 'table1',
    label: '用户基础信息表(核心)',
    name: '用户基础信息表(核心)',
    type: '维度表',
    description: '存储用户的基本信息，包括ID、姓名、年龄等'
  },
  {
    key: 'table2',
    label: '交易流水表(高频)',
    name: '交易流水表(高频)',
    type: '事实表',
    description: '记录用户的所有交易信息，包括交易时间、金额等'
  },
  {
    key: 'table3',
    label: '产品信息表(基础)',
    name: '产品信息表(基础)',
    type: '维度表',
    description: '存储所有产品的基本信息，包括产品ID、名称、价格等'
  },
  {
    key: 'table4',
    label: '风险评估表(重要)',
    name: '风险评估表(重要)',
    type: '明细表',
    description: '存储用户的风险评估信息，包括信用分数、风险等级等'
  }
]);


const newCollection = ref<{
  name: string
  description: string
  tables: TableItem[]
}>({  
  name: '',
  description: '',
  tables: []
})

const filterMethod = (item: any, query: string) => {
  if (!item || !query) return false;
  return (
    (item.name?.toLowerCase()?.includes(query.toLowerCase()) ||
     item.description?.toLowerCase()?.includes(query.toLowerCase()) ||
     item.type?.toLowerCase()?.includes(query.toLowerCase())) ?? false
  );
}

const toggleTableSelection = (table: TableItem) => {
  const index = newCollection.value.tables.findIndex(t => t.name === table.name)
  if (index >= 0) {
    newCollection.value.tables.splice(index, 1)
  } else {
    newCollection.value.tables.push(table)
  }
}

const removeSelectedTable = (table: TableItem) => {
  const index = newCollection.value.tables.findIndex(t => t.name === table.name)
  if (index >= 0) {
    newCollection.value.tables.splice(index, 1)
    // 同步更新selectedKeys
    const item = mockTransferData.value.find(item => item.name === table.name)
    if (item) {
      selectedKeys.value = selectedKeys.value.filter(key => key !== item.key)
    }
  }
}

const showCreateCollectionDialog = () => {
  createCollectionVisible.value = true
  searchKeyword.value = ''
  newCollection.value = {
    name: '',
    description: '',
    tables: []
  }
}

const handleCreateCollection = () => {
  if (!newCollection.value.name) {
    Message.error('请输入集合名称')
    return
  }
  emit('create-collection', { ...newCollection.value })
  createCollectionVisible.value = false
  newCollection.value = {
    name: '',
    description: '',
    tables: []
  }
}

const getTypeColor = (type?: string) => {
  const colors: Record<string, string> = {
    '维度表': 'blue',
    '事实表': 'green',
    '明细表': 'orange',
    '汇总表': 'purple'
  }
  return type ? colors[type] || 'gray' : 'gray';
}



const removeFavorite = (table: TableItem) => {
  emit('remove', table)
}

const showCollectionDetail = (collection: TableCollection) => {
  console.log('点击的表集合数据:', JSON.stringify(collection, null, 2))
  emit('show-collection-detail', collection)
}

const handleTransferItemClick = (item: any) => {
  // 输出传入的item参数
  console.log('handleTransferItemClick called with item:', item);
  
  // 确保从mockTransferData中获取完整数据
  const fullItem = mockTransferData.value.find(data => data?.key === item?.key) || item;
  console.log('完整的表项数据:', fullItem);
  
  // 确保有有效的key值
  if (!fullItem?.key) {
    console.warn('点击的表项缺少key值:', JSON.stringify(fullItem));
    return;
  }
  
  const tableName = fullItem?.name || '未知表';
  const tableType = fullItem?.type || '未知类型';
  console.log(`Transfer组件点击事件触发，表名: ${tableName}，类型: ${tableType}`);
  
  // 更新选中状态
  const isSelected = selectedKeys.value.includes(fullItem.key)
  selectedKeys.value = isSelected 
    ? selectedKeys.value.filter(key => key !== fullItem.key)
    : [...selectedKeys.value, fullItem.key]
  
  console.log('更新后的selectedKeys:', selectedKeys.value)
}
</script>

<style scoped>
.favorite-tables {
  border-radius: 8px;
  border: 1px solid #e5e6eb;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

.favorite-tables :deep(.arco-card-header) {
  padding: 20px 24px 16px;
  border-bottom: 1px solid #e5e6eb;
}

.favorite-tables :deep(.arco-card-body) {
  padding: 24px;
}

.scene-card {
  border-radius: 8px;
  border: 1px solid #e5e6eb;
  transition: all 0.2s ease;
  cursor: pointer;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

.scene-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: #165dff;
}

.scene-card :deep(.arco-card-header) {
  padding: 16px 20px;
  border-bottom: 1px solid #f2f3f5;
}

.scene-card :deep(.arco-card-body) {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.scene-description {
  margin: 12px 0;
  flex: 1;
  color: #86909c;
  line-height: 1.5;
}

.scene-footer {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: auto;
}

.scene-footer :deep(.arco-tag) {
  background: #f2f3f5;
  color: #4e5969;
  border: 1px solid #e5e6eb;
  border-radius: 4px;
}

.dialog-sections {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.search-section {
  margin-bottom: 20px;
}

.section-title {
  font-weight: 500;
  margin-bottom: 12px;
  color: #1d2129;
  font-size: 14px;
}

.selected-section {
  background-color: #f7f8fa;
  border-radius: 6px;
  padding: 16px;
  border: 1px solid #e5e6eb;
}

.selected-tag {
  transition: all 0.2s ease;
  background: #e8f3ff !important;
  color: #165dff !important;
  border: 1px solid #b8d4ff !important;
}

.selected-tag:hover {
  transform: scale(1.02);
  background: #d4e8ff !important;
}

.available-table {
  border: 1px solid #e5e6eb;
  border-radius: 6px;
}

.available-table :deep(.arco-table-tr.arco-table-tr-checked) {
  background-color: #e8f3ff;
}

.available-table :deep(.arco-table-th) {
  background-color: #f7f8fa;
  color: #4e5969;
  font-weight: 500;
}

.table-transfer {
  width: 100%;
  height: 400px;
}

.transfer-item {
  padding: 16px;
  border-radius: 6px;
  transition: all 0.2s ease;
  border: 1px solid #e5e6eb;
  margin-bottom: 8px;
}

.transfer-item:hover {
  background-color: #f7f8fa;
  border-color: #c9cdd4;
}

.transfer-item-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 16px;
  font-weight: 500;
  color: #1d2129;
  white-space: nowrap;
  overflow: visible;
  text-overflow: unset;
  line-height: 1.4;
}

.transfer-item-description {
  color: #86909c;
  font-size: 13px;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.table-list {
  flex: 1;
  overflow: hidden;
}

.favorite-icon {
  color: #ff7d00;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.favorite-icon:hover {
  color: #ff9a2e;
  transform: scale(1.1);
}
</style>