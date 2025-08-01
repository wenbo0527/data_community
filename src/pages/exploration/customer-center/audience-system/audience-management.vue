<template>
  <div class="audience-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h2 class="page-title">人群管理</h2>
        <p class="page-description">管理用户人群，创建、编辑、删除人群</p>
      </div>
      <div class="header-actions">
        <a-space>
          <a-input 
            v-model="searchForm.audienceName" 
            placeholder="请输入人群名称搜索"
            allow-clear
            style="width: 250px"
            @input="handleSearch"
          >
            <template #prefix><icon-search /></template>
          </a-input>
          <a-dropdown>
            <a-button type="primary">
              <template #icon><icon-plus /></template>
              新增人群
              <template #suffix><icon-down /></template>
            </a-button>
            <template #content>
              <a-doption @click="addAudienceByRule">
                <template #icon><icon-settings /></template>
                自定义规则创建
              </a-doption>
              <a-doption @click="addAudienceByImport">
                <template #icon><icon-import /></template>
                数据导入
              </a-doption>
            </template>
          </a-dropdown>
        </a-space>
      </div>
    </div>

    <!-- 人群列表 -->
    <div class="content-section">
      <a-card class="table-card">
        <template #title>
          <div class="table-header">
            <span class="table-title">人群列表</span>
            <span class="table-count">共 {{ pagination.total }} 条</span>
          </div>
        </template>
        
        <a-table 
          :data="tableData" 
          :loading="loading"
          :pagination="pagination"
          @page-change="handlePageChange"
          @page-size-change="handlePageSizeChange"
          class="audience-table"
          size="small"
          :scroll="{ x: 1600 }"
        >
          <template #columns>
            <a-table-column title="人群名称" data-index="name" :width="150" fixed="left">
              <template #cell="{ record }">
                <a-link @click="goToAudienceDetail(record)">{{ record.name }}</a-link>
              </template>
            </a-table-column>
            <a-table-column title="人群ID" data-index="id" :width="120">
              <template #cell="{ record }">
                <span>{{ record.id }}</span>
              </template>
            </a-table-column>
            <a-table-column title="人群类型" data-index="audienceType" :width="120">
              <template #cell="{ record }">
                <a-tag :color="getAudienceTypeColor(record.audienceType)">
                  {{ getAudienceTypeText(record.audienceType) }}
                </a-tag>
              </template>
            </a-table-column>
            <a-table-column title="人群规模" data-index="size" :width="120">
              <template #cell="{ record }">
                <span>{{ formatNumber(record.size) }}</span>
              </template>
            </a-table-column>
            <a-table-column title="创建方式" data-index="createMethod" :width="120">
              <template #cell="{ record }">
                <a-tag :color="getCreateMethodColor(record.createMethod)">
                  {{ getCreateMethodText(record.createMethod) }}
                </a-tag>
              </template>
            </a-table-column>
            <a-table-column title="状态" data-index="status" :width="100">
              <template #cell="{ record }">
                <a-tag :color="getStatusColor(record.status)">
                  {{ getStatusText(record.status) }}
                </a-tag>
              </template>
            </a-table-column>
            <a-table-column title="共享级别" data-index="shareLevel" :width="120">
              <template #cell="{ record }">
                <a-tag :color="getShareLevelColor(record.shareLevel)">
                  {{ getShareLevelText(record.shareLevel) }}
                </a-tag>
              </template>
            </a-table-column>
            <a-table-column title="创建人" data-index="createUser" :width="120">
              <template #cell="{ record }">
                <span>{{ record.createUser }}</span>
              </template>
            </a-table-column>
            <a-table-column title="创建时间" data-index="createTime" :width="150">
              <template #cell="{ record }">
                <span>{{ record.createTime }}</span>
              </template>
            </a-table-column>
            <a-table-column title="操作" :width="200" fixed="right">
              <template #cell="{ record, rowIndex }">
                <a-space>
                  <a-button 
                    type="text" 
                    size="small" 
                    @click="goToAudienceDetail(record)"
                  >
                    查看
                  </a-button>
                  <a-button 
                    type="text" 
                    size="small" 
                    @click="editAudience(record)"
                  >
                    编辑
                  </a-button>
                  <a-button 
                    type="text" 
                    size="small" 
                    @click="updateAudience(record)"
                  >
                    更新
                  </a-button>
                  <a-button 
                    type="text" 
                    size="small" 
                    status="danger" 
                    @click="removeAudience(rowIndex)"
                  >
                    删除
                  </a-button>
                </a-space>
              </template>
            </a-table-column>
          </template>
        </a-table>
      </a-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  IconSearch,
  IconPlus,
  IconDown,
  IconSettings,
  IconImport
} from '@arco-design/web-vue/es/icon'

const router = useRouter()

// 搜索表单
const searchForm = reactive({
  audienceName: ''
})

// 表格数据
const tableData = ref([])
const loading = ref(false)

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: true,
  showPageSize: true
})

// 人群类型颜色映射
const getAudienceTypeColor = (type) => {
  const colorMap = {
    'static': 'blue',
    'dynamic': 'green',
    'computed': 'orange',
    'rule': 'purple'
  }
  return colorMap[type] || 'gray'
}

// 人群类型文本映射
const getAudienceTypeText = (type) => {
  const textMap = {
    'static': '静态人群',
    'dynamic': '动态人群',
    'computed': '计算人群',
    'rule': '规则人群'
  }
  return textMap[type] || '未知类型'
}

// 创建方式颜色映射
const getCreateMethodColor = (method) => {
  const colorMap = {
    'rule': 'blue',
    'import': 'green',
    'manual': 'orange'
  }
  return colorMap[method] || 'gray'
}

// 创建方式文本映射
const getCreateMethodText = (method) => {
  const textMap = {
    'rule': '规则创建',
    'import': '数据导入',
    'manual': '手动创建'
  }
  return textMap[method] || '未知方式'
}

// 状态颜色映射
const getStatusColor = (status) => {
  const colorMap = {
    'active': 'green',
    'inactive': 'gray',
    'computing': 'blue',
    'error': 'red'
  }
  return colorMap[status] || 'gray'
}

// 状态文本映射
const getStatusText = (status) => {
  const textMap = {
    'active': '活跃',
    'inactive': '非活跃',
    'computing': '计算中',
    'error': '错误'
  }
  return textMap[status] || '未知状态'
}

// 共享级别颜色映射
const getShareLevelColor = (level) => {
  const colorMap = {
    'public': 'green',
    'private': 'orange',
    'team': 'blue'
  }
  return colorMap[level] || 'gray'
}

// 共享级别文本映射
const getShareLevelText = (level) => {
  const textMap = {
    'public': '公开',
    'private': '私有',
    'team': '团队'
  }
  return textMap[level] || '未知级别'
}

// 格式化数字
const formatNumber = (num) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toString()
}

// 搜索处理
const handleSearch = () => {
  loadAudienceData()
}

// 分页处理
const handlePageChange = (page) => {
  pagination.current = page
  loadAudienceData()
}

const handlePageSizeChange = (pageSize) => {
  pagination.pageSize = pageSize
  pagination.current = 1
  loadAudienceData()
}

// 跳转到人群详情页
const goToAudienceDetail = (record) => {
  router.push({
    path: '/exploration/customer-center/audience-system/audience-detail',
    query: { id: record.id }
  })
}

// 编辑人群
const editAudience = (record) => {
  router.push({
    path: '/exploration/customer-center/audience-system/audience-create',
    query: { id: record.id, mode: 'edit' }
  })
}

// 更新人群
const updateAudience = (record) => {
  console.log('更新人群:', record)
  // TODO: 实现更新逻辑
}

// 删除人群
const removeAudience = (index) => {
  console.log('删除人群:', index)
  // TODO: 实现删除逻辑
}

// 自定义规则创建人群
const addAudienceByRule = () => {
  router.push({
    path: '/exploration/customer-center/audience-system/audience-create',
    query: { mode: 'rule' }
  })
}

// 数据导入创建人群
const addAudienceByImport = () => {
  router.push({
    path: '/exploration/customer-center/audience-system/audience-create',
    query: { mode: 'import' }
  })
}

// 加载人群数据
const loadAudienceData = async () => {
  loading.value = true
  try {
    // 模拟数据
    const mockData = [
      {
        id: 'AUD_001',
        name: '高价值客户群',
        audienceType: 'rule',
        size: 125000,
        createMethod: 'rule',
        status: 'active',
        shareLevel: 'public',
        createUser: '张三',
        createTime: '2023-10-15 10:30:00'
      },
      {
        id: 'AUD_002',
        name: '新用户群体',
        audienceType: 'dynamic',
        size: 89000,
        createMethod: 'rule',
        status: 'active',
        shareLevel: 'team',
        createUser: '李四',
        createTime: '2023-10-14 14:20:00'
      },
      {
        id: 'AUD_003',
        name: '流失风险客户',
        audienceType: 'computed',
        size: 45000,
        createMethod: 'rule',
        status: 'computing',
        shareLevel: 'private',
        createUser: '王五',
        createTime: '2023-10-13 09:15:00'
      }
    ]
    
    tableData.value = mockData
    pagination.total = mockData.length
  } catch (error) {
    console.error('加载人群数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadAudienceData()
})
</script>

<style scoped>
.audience-management {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-content {
  flex: 1;
}

.page-title {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #1d2129;
}

.page-description {
  margin: 0;
  color: #86909c;
  font-size: 14px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.content-section {
  margin-bottom: 20px;
}

.table-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-title {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
}

.table-count {
  color: #86909c;
  font-size: 14px;
}

.audience-table {
  margin-top: 16px;
}

.audience-table :deep(.arco-table-th) {
  background-color: #f7f8fa;
  font-weight: 600;
}

.audience-table :deep(.arco-table-td) {
  border-bottom: 1px solid #f2f3f5;
}

.audience-table :deep(.arco-table-tr:hover .arco-table-td) {
  background-color: #f7f8fa;
}
</style>