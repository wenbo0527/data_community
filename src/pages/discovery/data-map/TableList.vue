<template>
  <div class="table-list-page">
    <div class="page-header">
      <a-breadcrumb>
        <a-breadcrumb-item>数据地图</a-breadcrumb-item>
        <a-breadcrumb-item>数据表</a-breadcrumb-item>
      </a-breadcrumb>
      <h2 class="page-title">数据表</h2>
    </div>

    <a-card>
      <a-row class="search-info" align="center" :gutter="16">
        <a-col :span="16">
          <a-input-search
            v-model="searchKeyword"
            placeholder="搜索表名、字段名或描述"
            search-button
            allow-clear
            @search="handleSearch"
            style="width: 100%"
          />
        </a-col>
        <a-col :span="8">
          <a-space>
            <a-select
              v-model="businessDomain"
              placeholder="业务域"
              allow-clear
              style="width: 140px"
            >
              <a-option value="domain1">业务域1</a-option>
              <a-option value="domain2">业务域2</a-option>
              <a-option value="domain3">业务域3</a-option>
              <a-option value="domain4">业务域4</a-option>
            </a-select>
            <a-select
              v-model="themeDomain"
              placeholder="主题域"
              allow-clear
              style="width: 140px"
            >
              <a-option value="theme1">主题域1</a-option>
              <a-option value="theme2">主题域2</a-option>
              <a-option value="theme3">主题域3</a-option>
              <a-option value="theme4">主题域4</a-option>
            </a-select>
          </a-space>
        </a-col>
      </a-row>

      <a-row :gutter="12">
        <a-col 
          v-for="record in tableData" 
          :key="record.name" 
          :span="8"
          style="margin-bottom: 12px"
        >
          <a-card 
            hoverable 
            @click="showTableDetail(record)"
            class="table-card"
            :bordered="false"
          >
            <div class="card-header">
              <IconFile style="margin-right: 8px" />
              <span class="table-name">{{ record.name }}</span>
              <a-tag 
                v-if="record.type" 
                :color="record.type === '维度表' ? 'arcoblue' : 'orangered'"
                size="small"
                style="margin-left: 8px"
              >
                {{ record.type }}
              </a-tag>
            </div>
            
            <div class="card-content">
              <p class="description" :title="record.description">{{ record.description }}</p>
              <p class="update-time">{{ record.updateTime }}</p>
            </div>
            
            <template #actions>
              <a-space>
                <a-tooltip content="收藏" position="bottom">
                  <a-button type="text" @click.stop="addToFavorite(record)">
                    <template #icon><IconStar /></template>
                  </a-button>
                </a-tooltip>
                <a-tooltip content="申请权限" position="bottom">
                  <a-button type="text" @click.stop="requestPermission(record)">
                    <template #icon><IconLock /></template>
                  </a-button>
                </a-tooltip>
                <a-tooltip content="复制表名" position="bottom">
                  <a-button type="text" @click.stop="copyTableName(record)">
                    <template #icon><IconCopy /></template>
                  </a-button>
                </a-tooltip>
                <a-tooltip content="添加到集合" position="bottom">
                  <a-button type="text" @click.stop="addToCollection(record)">
                    <template #icon><IconFolderAdd /></template>
                  </a-button>
                </a-tooltip>
              </a-space>
            </template>
          </a-card>
        </a-col>
      </a-row>
    </a-card>

    
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import {
  IconFile,
  IconStar,
  IconFolderAdd,
  IconCopy,
  IconLock
} from '@arco-design/web-vue/es/icon'


import { tableMockData } from '@/mock/tableData.ts'
import DateUtils from '@/utils/dateUtils'

interface TableItem {
  name: string
  type: string
  description: string
  updateTime: string
  category?: string
  domain?: string
  updateFrequency?: string
  owner?: string
  fields?: any[]
}

const route = useRoute()
const router = useRouter()
const searchKeyword = ref('')
const businessDomain = ref('')
const themeDomain = ref('')
const loading = ref(false)
const tableData = ref<TableItem[]>([])
const currentTable = ref<TableItem | null>(null)

const pagination = ref({
  total: 0,
  current: 1,
  pageSize: 10,
  showTotal: true,
  showJumper: true,
  showPageSize: true,
})

// 初始化页面数据
onMounted(() => {
  const query = route.query.keyword as string
  if (query) {
    searchKeyword.value = query
    handleSearch()
  }
})

// 处理数据更新
const updateTableData = () => {
  return tableMockData.map(item => ({
    ...item,
    updateTime: DateUtils.smartFormat(item.updateTime || new Date())
  }))
}

// 检查关键字匹配
const checkKeywordMatch = (item: TableItem) => {
  return searchKeyword.value === '' || 
    item.name.includes(searchKeyword.value) || 
    item.description.includes(searchKeyword.value)
}

// 检查业务域匹配
const checkDomainMatch = (item: TableItem) => {
  return businessDomain.value === '' || 
    item.domain === businessDomain.value
}

// 检查主题域匹配
const checkThemeMatch = (item: TableItem & {theme?: string}) => {
  return themeDomain.value === '' || 
    item.theme === themeDomain.value
}

// 搜索处理
const handleSearch = async (value?: string) => {
  loading.value = true
  try {
    // 使用共享mock数据
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 获取更新后的数据
    const updatedData = updateTableData()
    
    // 过滤数据
    tableData.value = updatedData.filter(item => 
      checkKeywordMatch(item) && 
      checkDomainMatch(item) && 
      checkThemeMatch(item)
    )
    
    // 更新分页总数
    pagination.value.total = tableData.value.length
  } catch (error) {
    Message.error('搜索失败')
  } finally {
    loading.value = false
  }
}

// 分页处理
const onPageChange = (current: number) => {
  pagination.value.current = current
  handleSearch()
}

const onPageSizeChange = (pageSize: number) => {
  pagination.value.pageSize = pageSize
  handleSearch()
}

// 构建表详情参数
const buildTableParams = (record: TableItem, fullTableData: any) => {
  return {
    name: record.name,
    type: record.type || '',
    description: record.description || '',
    updateTime: record.updateTime || new Date().toLocaleDateString(),
    fields: fullTableData.fields || [],
    category: fullTableData.category || '',
    domain: fullTableData.domain || '',
    updateFrequency: fullTableData.updateFrequency || '',
    owner: fullTableData.owner || ''
  }
}

// 验证表记录
const validateTableRecord = (record: TableItem) => {
  if (!record?.name) {
    throw new Error('表名不能为空')
  }
  
  const fullTableData = tableMockData.find(item => item.name === record.name)
  if (!fullTableData) {
    throw new Error('未找到表数据')
  }
  
  return fullTableData
}

// 显示表详情
const showTableDetail = (record: TableItem) => {
  try {
    const fullTableData = validateTableRecord(record)
    const tableParams = buildTableParams(record, fullTableData)
    
    router.push({
      name: 'TableDetail',
      params: {
        tableName: record.name
      },
      query: {
        table: JSON.stringify(tableParams)
      }
    })
  } catch (error) {
    Message.error((error as Error).message)
    console.error('跳转表详情页失败:', error)
  }
}

// 申请权限
const requestPermission = async (record: TableItem) => {
  try {
    // TODO: 调用权限申请API
    Message.success('权限申请已提交')
  } catch (error) {
    Message.error('权限申请失败')
  }
}

// 添加到收藏
const addToFavorite = async (record: TableItem) => {
  try {
    // TODO: 调用收藏API
    Message.success('添加收藏成功')
  } catch (error) {
    Message.error('添加收藏失败')
  }
}

// 复制表名
const copyTableName = async (record: TableItem) => {
  try {
    await navigator.clipboard.writeText(record.name)
    Message.success('复制成功')
  } catch (error) {
    Message.error('复制失败')
  }
}

// 添加到集合
const addToCollection = async (record: TableItem) => {
  try {
    const { Modal, Select, Option } = await import('@arco-design/web-vue')
    const { h } = await import('vue')
    
    const selectedCollection = ref('')
    
    Modal.confirm({
      title: '添加到常用表集合',
      content: () => {
        return h('div', [
          h(Select, {
            placeholder: '请选择集合',
            style: { width: '100%' },
            allowClear: true,
            'onUpdate:modelValue': (value: string) => {
              selectedCollection.value = value
            }
          }, () => [
            h(Option, { value: 'collection1' }, () => '常用表集合1'),
            h(Option, { value: 'collection2' }, () => '常用表集合2'),
            h(Option, { value: 'collection3' }, () => '常用表集合3')
          ])
        ])
      },
      onOk: async () => {
        if (!selectedCollection.value) {
          Message.warning('请选择集合')
          return false
        }
        
        try {
          // TODO: 调用添加到集合API
          Message.success(`已添加到${selectedCollection.value}`)
          return true
        } catch (error) {
          Message.error('添加到集合失败')
          return false
        }
      },
      onCancel: () => {
        Message.info('已取消')
      }
    })
  } catch (error) {
    Message.error('弹窗打开失败')
  }
}
</script>

<style scoped>
.table-list-page {
  padding: 20px;
}

.page-header {
  margin-bottom: 16px;
}

.page-title {
  margin: 8px 0;
  font-size: 20px;
  font-weight: 500;
  color: var(--color-text-1);
}

.search-info {
  margin-bottom: 16px;
}

.table-card {
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 4px;
}

.table-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.card-content {
  margin: 16px 0;
}

.description {
  color: var(--color-text-2);
  font-size: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
  line-height: 1.4;
}

.update-time {
  color: var(--color-text-3);
  font-size: 11px;
}

.table-name {
  font-weight: 500;
  font-size: 16px;
}

.card-content {
  margin-bottom: 12px;
}

.card-row {
  display: flex;
  margin-bottom: 8px;
}

.card-label {
  color: var(--color-text-3);
  margin-right: 8px;
  min-width: 80px;
}
</style>
