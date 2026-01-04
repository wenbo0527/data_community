<template>
  <div class="app-permission-page">
    <a-card class="general-card" title="应用权限管理">
      <a-row style="margin-bottom: 16px">
        <a-col :span="12">
          <a-space>
            <a-button type="primary" @click="handleGrant">
              <template #icon><icon-plus /></template>
              授予应用权限
            </a-button>
          </a-space>
        </a-col>
        <a-col :span="12" style="text-align: right">
          <a-input-search
            v-model="searchKey"
            placeholder="搜索权限名称/用户"
            style="width: 300px"
            allow-clear
            @search="handleSearch"
          />
        </a-col>
      </a-row>

      <a-table :data="tableData" :pagination="pagination" @page-change="handlePageChange">
        <template #columns>
          <a-table-column title="权限" data-index="name" />
          <a-table-column title="描述" data-index="description" />
          <a-table-column title="授予角色" data-index="roles">
            <template #cell="{ record }">
              <a-space wrap>
                <a-tag v-for="role in record.roles" :key="role" size="small" color="blue">{{ role }}</a-tag>
              </a-space>
            </template>
          </a-table-column>
          <a-table-column title="已授予用户" data-index="users">
            <template #cell="{ record }">
              <a-space wrap>
                <a-tag v-for="user in record.users" :key="user" size="small" color="green">{{ user }}</a-tag>
              </a-space>
            </template>
          </a-table-column>
          <a-table-column title="操作" width="150" align="center">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="handleEdit(record)">编辑</a-button>
                <a-button type="text" status="danger" size="small" @click="handleRevoke(record)">回收</a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <!-- 配置资源抽屉 -->
    <a-drawer
      v-model:visible="drawerVisible"
      title="配置资源"
      width="1000px"
      @ok="handleSave"
      @cancel="drawerVisible = false"
      unmount-on-close
    >
      <div class="drawer-content">
        <div class="config-header">
          <div class="header-item">
            权限名称：
            <a-select v-if="isNew" v-model="currentConfig.appName" placeholder="选择权限" style="width: 200px">
              <a-option>统一查询</a-option>
              <a-option>报表中心</a-option>
              <a-option>系统管理</a-option>
            </a-select>
            <span v-else>{{ currentConfig.appName }}</span>
          </div>
          <div class="header-item">
            角色名称：
            <a-select v-if="isNew" v-model="currentConfig.roleName" placeholder="选择角色" style="width: 200px">
              <a-option>业务人员</a-option>
              <a-option>数据分析师</a-option>
              <a-option>管理层</a-option>
            </a-select>
            <span v-else>{{ currentConfig.roleName }}</span>
          </div>
        </div>
        
        <div class="resource-table-wrapper">
          <a-table
            :data="resourceData"
            :pagination="false"
            :show-header="true"
            row-key="id"
            :indent-size="20"
            default-expand-all-rows
          >
            <template #columns>
              <a-table-column title="页面路由" data-index="name">
                <template #cell="{ record }">
                  <a-checkbox v-model="record.selected">{{ record.name }}</a-checkbox>
                </template>
              </a-table-column>
              <a-table-column title="页面操作">
                <template #cell="{ record }">
                  <a-space v-if="record.actions && record.actions.length">
                    <a-checkbox 
                      v-for="action in record.actions" 
                      :key="action.id"
                      v-model="action.selected"
                    >
                      {{ action.name }}
                    </a-checkbox>
                  </a-space>
                </template>
              </a-table-column>
            </template>
          </a-table>
        </div>
      </div>
      <template #footer>
        <div style="display: flex; justify-content: space-between; width: 100%;">
          <a-button @click="drawerVisible = false">取消</a-button>
          <a-button type="primary" @click="handleSave">保存</a-button>
        </div>
      </template>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { Message } from '@arco-design/web-vue'

const searchKey = ref('')
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 30
})

const tableData = ref([
  {
    id: 1,
    name: '统一查询',
    description: '提供统一的数据查询和导出功能',
    roles: ['业务人员', '数据分析师'],
    users: ['张三', '李四']
  },
  {
    id: 2,
    name: '报表中心',
    description: '企业级报表展示与管理',
    roles: ['管理层', '运营人员'],
    users: ['王五']
  },
  {
    id: 3,
    name: '系统管理',
    description: '系统基础配置与权限控制',
    roles: ['系统管理员'],
    users: ['Admin']
  }
])

// 抽屉相关
const drawerVisible = ref(false)
const isNew = ref(false)
const currentConfig = reactive({
  appName: '',
  roleName: ''
})

const resourceData = ref([
  {
    id: '1',
    name: '业务查询',
    selected: true,
    children: [
      {
        id: '1-1',
        name: 'SQL查询',
        selected: true,
        actions: [
          { id: '1-1-1', name: 'SQL查询', selected: true },
          { id: '1-1-2', name: '自助取数', selected: true }
        ]
      },
      {
        id: '1-2',
        name: '自助取数',
        selected: false,
        actions: []
      }
    ]
  },
  {
    id: '2',
    name: '数据分析',
    selected: true,
    children: [
      {
        id: '2-1',
        name: '电子表格',
        selected: true,
        actions: [
          { id: '2-1-1', name: '电子表格', selected: true }
        ]
      }
    ]
  },
  {
    id: '3',
    name: '数据安全',
    selected: false,
    children: []
  },
  {
    id: '4',
    name: '平台管理',
    selected: false,
    children: []
  }
])

const handleSearch = () => {
  // Implement search
}

const handlePageChange = (page) => {
  pagination.current = page
}

const handleGrant = () => {
  isNew.value = true
  currentConfig.appName = ''
  currentConfig.roleName = ''
  drawerVisible.value = true
}

const handleEdit = (record) => {
  isNew.value = false
  currentConfig.appName = record.name
  currentConfig.roleName = record.roles[0] || '默认角色'
  drawerVisible.value = true
}

const handleRevoke = (record) => {
  Message.success(`已回收权限: ${record.name}`)
}

const handleSave = () => {
  Message.success('保存成功')
  drawerVisible.value = false
}
</script>

<style scoped>
.app-permission-page {
  padding: 20px;
}
.drawer-content {
  padding: 0;
}
.config-header {
  display: flex;
  gap: 100px;
  padding: 16px 20px;
  background-color: #f7f8fa;
  margin-bottom: 20px;
  border-radius: 4px;
}
.header-item {
  color: #4e5969;
  font-size: 14px;
}
.header-item span {
  color: #1d2129;
  font-weight: 500;
  margin-left: 8px;
}
.resource-table-wrapper {
  border: 1px solid #f2f3f5;
  border-radius: 4px;
}
:deep(.arco-table-th) {
  background-color: #f7f8fa;
  font-weight: 600;
}
:deep(.arco-table-td) {
  padding-top: 12px;
  padding-bottom: 12px;
}
</style>
