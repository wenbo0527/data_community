<template>
  <div class="api-market">
    <!-- 顶部标题 -->
    <div class="market-header">
      <div class="market-title">
        <IconApps /> API集市
      </div>
    </div>

    <div class="market-content">
      <!-- 左侧业务场景树 -->
      <div class="left-sidebar">
        <div class="sidebar-title">业务场景</div>
        <a-input-search placeholder="输入关键字搜索" class="tree-search" size="small" />
        <div class="tree-container">
          <a-tree
            :data="treeData"
            show-line
            block-node
            :default-expanded-keys="['all']"
          >
            <template #extra="{ node }">
              <span class="node-count">({{ node.count || 0 }})</span>
            </template>
          </a-tree>
        </div>
      </div>

      <!-- 右侧主内容区 -->
      <div class="main-container">
        <!-- 搜索栏 -->
        <div class="search-bar">
          <a-input-search
            v-model="searchQuery"
            placeholder="多个关键字请以空格分割，未使用空格将视为单个词汇进行搜索"
            style="width: 600px"
            search-button
          >
            <template #button-default>
              搜索
            </template>
          </a-input-search>
          <a-space size="large" class="search-options">
            <a-select defaultValue="all" style="width: 120px" size="small">
              <a-option value="all">搜索范围</a-option>
            </a-select>
            <a-checkbox>我有权限的</a-checkbox>
          </a-space>
        </div>

        <!-- 统计信息 -->
        <div class="stats-info">
          共 {{ filteredList.length }} 个API
        </div>

        <!-- API列表 (表格展示) -->
        <div class="api-table-container">
          <a-table 
            :data="filteredList" 
            :pagination="false" 
            :bordered="false"
            hoverable
            class="market-table"
          >
            <template #columns>
              <a-table-column title="API名称" data-index="name">
                <template #cell="{ record }">
                  <div class="api-name-cell" @click="goToDetail(record.id)">
                    <IconCommon style="margin-right: 8px; color: #165dff;" />
                    <span class="name-text">{{ record.name }}</span>
                  </div>
                </template>
              </a-table-column>
              <a-table-column title="所属项目" data-index="project">
                <template #cell="{ record }">
                  <a-tag size="small" color="arcoblue">{{ record.project || 'QA_test2' }}</a-tag>
                </template>
              </a-table-column>
              <a-table-column title="负责人" data-index="owner">
                <template #cell="{ record }">
                  {{ record.owner || '管理员' }}
                </template>
              </a-table-column>
              <a-table-column title="最大QPS" data-index="maxQps" :width="100">
                <template #cell="{ record }">
                  {{ record.maxQps || 1 }}
                </template>
              </a-table-column>
              <a-table-column title="更新时间" data-index="updateTime" :width="180">
                <template #cell="{ record }">
                  <span style="color: #86909c;">{{ record.updateTime }}</span>
                </template>
              </a-table-column>
            </template>
          </a-table>
        </div>

        <!-- 分页 -->
        <div class="pagination-container">
          <a-pagination :total="filteredList.length" show-total show-jumper show-page-size />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  IconApps,
  IconCommon
} from '@arco-design/web-vue/es/icon'

const router = useRouter()
const searchQuery = ref('')

// 业务场景树数据
const treeData = [
  {
    title: '全部',
    key: 'all',
    count: 8,
    children: [
      { title: 'fdsdsdawd', key: '1', count: 0 },
      { title: 'delete_4', key: '2', count: 0 },
      { title: 'business_test', key: '3', count: 0 },
      { title: 'QA_test', key: '4', count: 7 },
      { title: 'delete_test', key: '5', count: 0 }
    ]
  }
]

// API列表数据
const apiList = ref<any[]>([])
const STORAGE_KEY = 'api.management.list'

const loadList = () => {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw) {
    apiList.value = JSON.parse(raw)
  }
}

const filteredList = computed(() => {
  if (!searchQuery.value) return apiList.value
  return apiList.value.filter((item: any) => 
    item.name.includes(searchQuery.value) || 
    (item.project && item.project.includes(searchQuery.value))
  )
})

const goToDetail = (id: string) => {
  router.push(`/discovery/api-market/detail/${id}`)
}

onMounted(() => {
  loadList()
})
</script>

<style scoped>
.api-market {
  padding: 0;
  background: #f4f7f9;
  min-height: calc(100vh - 64px);
  display: flex;
  flex-direction: column;
}

.market-header {
  background: #fff;
  padding: 10px 20px 0;
  border-bottom: 1px solid #e5e6eb;
}

.market-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.left-sidebar {
  width: 240px;
  background: #fff;
  border-right: 1px solid #e5e6eb;
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.sidebar-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
}

.tree-search {
  margin-bottom: 16px;
}

.tree-container {
  flex: 1;
  overflow-y: auto;
}

.node-count {
  color: #86909c;
  font-size: 12px;
  margin-left: 4px;
}

.main-container {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.search-options {
  margin-left: auto;
}

.stats-info {
  margin-bottom: 16px;
  color: #4e5969;
  font-size: 13px;
}

.api-table-container {
  background: #fff;
  padding: 16px;
  border-radius: 4px;
}

.market-table :deep(.arco-table-th) {
  background-color: #f7f8fa;
  font-weight: 600;
  color: #1d2129;
}

.api-name-cell {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #165dff;
}

.api-name-cell:hover .name-text {
  text-decoration: underline;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
