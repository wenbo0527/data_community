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
        <div class="sidebar-title">API分类</div>
        <a-input-search placeholder="输入关键字搜索" class="tree-search" size="small" />
        <div class="tree-container">
          <a-tree
            :data="treeData"
            show-line
            block-node
            :default-expanded-keys="['all', 'internal', 'external']"
            v-model:selected-keys="selectedKeys"
            @select="onSelect"
          >
            <template #extra="{ node }">
              <span v-if="node" class="node-count">({{ node.count || 0 }})</span>
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
                    <a-tag v-if="record.status === 'maintenance'" size="small" color="orange" style="margin-left: 8px">维护中</a-tag>
                  </div>
                </template>
              </a-table-column>
              
              <a-table-column v-if="currentFilter.key === 'external' || currentFilter.key === 'all'" title="数据提供方" data-index="provider">
                <template #cell="{ record }">
                  <span v-if="record.source === 'external'"><a-tag size="small" color="purple">{{ record.provider || '未知' }}</a-tag></span>
                  <span v-else>-</span>
                </template>
              </a-table-column>
              
              <a-table-column title="所属项目" data-index="project">
                <template #cell="{ record }">
                  <a-tag size="small" color="arcoblue">{{ record.project || '默认项目' }}</a-tag>
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
const selectedKeys = ref(['all'])
const currentFilter = ref({ type: 'all', key: 'all' })

// 业务场景树数据
const treeData = [
  {
    title: '全部',
    key: 'all',
    count: 10,
    children: [
      {
        title: '内部数据',
        key: 'internal',
        count: 6,
        children: [
          { title: '核心交易', key: 'core', count: 3 },
          { title: '信贷风控', key: 'risk', count: 2 },
          { title: '营销中心', key: 'marketing', count: 1 }
        ]
      },
      {
        title: '外部数据',
        key: 'external',
        count: 4,
        children: [
          { title: '外部征信', key: 'credit', count: 2 },
          { title: '运营商数据', key: 'carrier', count: 1 },
          { title: '学信网', key: 'chsi', count: 1 }
        ]
      }
    ]
  }
]

// API列表数据
const apiList = ref<any[]>([])
const STORAGE_KEY = 'api.management.list'

const loadList = () => {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw) {
    apiList.value = JSON.parse(raw).map((item: any) => ({
      ...item,
      source: item.source || 'internal' // 兼容旧数据
    }))
  } else {
    // 模拟数据
    apiList.value = [
      // 内部API
      { id: '1', name: '查询用户基础信息', project: '核心交易', owner: '张三', maxQps: 1000, updateTime: '2023-11-01', source: 'internal', status: 'online', category: 'core' },
      { id: '2', name: '获取账户余额', project: '核心交易', owner: '李四', maxQps: 2000, updateTime: '2023-11-02', source: 'internal', status: 'online', category: 'core' },
      { id: '3', name: '查询近三个月流水', project: '核心交易', owner: '王五', maxQps: 500, updateTime: '2023-10-25', source: 'internal', status: 'maintenance', category: 'core' },
      { id: '4', name: '用户风险等级评估', project: '信贷风控', owner: '赵六', maxQps: 200, updateTime: '2023-11-05', source: 'internal', status: 'online', category: 'risk' },
      { id: '5', name: '授信额度试算', project: '信贷风控', owner: '赵六', maxQps: 150, updateTime: '2023-11-06', source: 'internal', status: 'online', category: 'risk' },
      { id: '6', name: '营销活动资格校验', project: '营销中心', owner: '孙七', maxQps: 3000, updateTime: '2023-11-08', source: 'internal', status: 'online', category: 'marketing' },
      
      // 外部API
      { id: '101', name: '企业工商信息查询', project: '外部征信', owner: '外部数据组', maxQps: 50, updateTime: '2023-11-10', source: 'external', status: 'online', provider: '企查查', category: 'credit' },
      { id: '102', name: '个人反欺诈黑名单', project: '外部征信', owner: '外部数据组', maxQps: 100, updateTime: '2023-11-12', source: 'external', status: 'online', provider: '同盾科技', category: 'credit' },
      { id: '103', name: '手机号在网时长查询', project: '运营商数据', owner: '外部数据组', maxQps: 200, updateTime: '2023-11-09', source: 'external', status: 'online', provider: '移动/联通/电信', category: 'carrier' },
      { id: '104', name: '学历学籍核验', project: '学信网', owner: '外部数据组', maxQps: 20, updateTime: '2023-10-30', source: 'external', status: 'maintenance', provider: '学信网', category: 'chsi' }
    ]
  }
}

const onSelect = (newSelectedKeys: string[], data: any) => {
  if (newSelectedKeys.length > 0) {
    const key = newSelectedKeys[0]
    // 判断选中节点类型
    if (key === 'all') {
      currentFilter.value = { type: 'all', key: 'all' }
    } else if (key === 'internal' || key === 'external') {
      currentFilter.value = { type: 'source', key: key }
    } else {
      // 假设其他都是具体分类
      currentFilter.value = { type: 'category', key: key }
    }
  }
}

const filteredList = computed(() => {
  let list = apiList.value
  
  // 树筛选
  if (currentFilter.value.type === 'source') {
    list = list.filter((item: any) => item.source === currentFilter.value.key)
  } else if (currentFilter.value.type === 'category') {
    list = list.filter((item: any) => item.category === currentFilter.value.key)
  }
  
  // 搜索框筛选
  if (searchQuery.value) {
      const keywords = searchQuery.value.trim().split(/\s+/)
      list = list.filter((item: any) => {
        return keywords.every((keyword: string) => 
          item.name.includes(keyword) || 
          (item.project && item.project.includes(keyword))
        )
      })
    }
  return list
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

.source-tabs {
  margin-bottom: 20px;
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
