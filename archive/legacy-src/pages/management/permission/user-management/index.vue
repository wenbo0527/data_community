<template>
  <div class="user-management-page">
    <a-card class="general-card">
      <a-tabs v-model:active-key="activeTab">
        <a-tab-pane key="user" title="用户管理">
          <div v-if="viewMode === 'list'">
            <a-row style="margin-bottom: 16px">
              <a-col :span="12">
                <a-space>
                  <a-button type="primary" @click="handleCreate">
                    <template #icon><icon-plus /></template>
                    新建用户
                  </a-button>
                </a-space>
              </a-col>
              <a-col :span="12" style="text-align: right">
                <a-input-search
                  v-model="searchKey"
                  placeholder="搜索工号/姓名/部门"
                  style="width: 300px"
                  allow-clear
                  @search="handleSearch"
                />
              </a-col>
            </a-row>

            <a-table :data="filteredTableData" :pagination="pagination" @page-change="handlePageChange">
              <template #columns>
                <a-table-column title="工号" data-index="employeeId" />
                <a-table-column title="姓名" data-index="realName" />
                <a-table-column title="部门" data-index="department" />
                <a-table-column title="角色" data-index="roles">
                  <template #cell="{ record }">
                    <a-space wrap>
                      <a-tag v-for="role in record.roles" :key="role">{{ role }}</a-tag>
                    </a-space>
                  </template>
                </a-table-column>
                <a-table-column title="状态" data-index="status">
                  <template #cell="{ record }">
                    <a-tag :color="record.status === 'active' ? 'green' : 'red'">
                      {{ record.status === 'active' ? '启用' : '禁用' }}
                    </a-tag>
                  </template>
                </a-table-column>
                <a-table-column title="操作" width="200" align="center">
                  <template #cell="{ record }">
                    <a-space>
                      <a-button type="text" size="small" @click="handleEdit(record)">编辑</a-button>
                      <a-button type="text" size="small" @click="handleResetPwd(record)">重置密码</a-button>
                      <a-button
                        type="text"
                        :status="record.status === 'active' ? 'danger' : 'success'"
                        size="small"
                        @click="handleToggleStatus(record)"
                      >
                        {{ record.status === 'active' ? '禁用' : '启用' }}
                      </a-button>
                    </a-space>
                  </template>
                </a-table-column>
              </template>
            </a-table>
          </div>
          <UserDetail v-else :user="currentUser" @back="() => { viewMode = 'list'; activeTab = 'user'; }" />
        </a-tab-pane>
        
        <a-tab-pane key="organization" title="组织管理">
          <OrganizationManagement />
        </a-tab-pane>
        
        <a-tab-pane key="position" title="职务管理">
          <PositionManagement />
        </a-tab-pane>
      </a-tabs>
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, defineAsyncComponent } from 'vue'
import { Message } from '@arco-design/web-vue'
import UserDetail from './UserDetail.vue'

// 动态导入组件以避免循环依赖或组件不存在的问题
const OrganizationManagement = defineAsyncComponent(() => import('./OrganizationManagement.vue'))
const PositionManagement = defineAsyncComponent(() => import('./PositionManagement.vue'))

const activeTab = ref('user')
const viewMode = ref('list')
const currentUser = ref(null)

const searchKey = ref('')
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 50
})

const tableData = ref([
  {
    id: 1,
    employeeId: 'U001',
    realName: '管理员',
    department: '系统管理部',
    roles: ['SuperAdmin'],
    status: 'active'
  },
  {
    id: 2,
    employeeId: 'U002',
    realName: '张三',
    department: '数据分析部',
    roles: ['DataAnalyst'],
    status: 'active'
  },
  {
    id: 3,
    employeeId: 'U003',
    realName: '李四',
    department: '项目管理部',
    roles: ['ProjectManager'],
    status: 'disabled'
  },
  {
    id: 4,
    employeeId: 'U004',
    realName: '王五',
    department: '技术开发部',
    roles: ['Developer'],
    status: 'active'
  },
  {
    id: 5,
    employeeId: 'U005',
    realName: '赵六',
    department: '市场运营部',
    roles: ['Marketing'],
    status: 'active'
  }
])

const filteredTableData = computed(() => {
  if (!searchKey.value) return tableData.value
  const key = searchKey.value.toLowerCase()
  return tableData.value.filter(item => 
    String(item.employeeId).toLowerCase().includes(key) ||
    item.realName.toLowerCase().includes(key) ||
    item.department.toLowerCase().includes(key)
  )
})

const handleSearch = () => {
  // 搜索已经在computed属性中处理
}

const handlePageChange = (page) => {
  pagination.current = page
}

const handleCreate = () => {
  Message.info('新建用户')
}

const handleEdit = (record) => {
  currentUser.value = { ...record, department: record.department || '技术部/数据中心' }
  viewMode.value = 'detail'
}

const handleResetPwd = (record) => {
  Message.info(`重置密码: ${record.realName}`)
}

const handleToggleStatus = (record) => {
  record.status = record.status === 'active' ? 'disabled' : 'active'
  Message.success(`${record.status === 'active' ? '启用' : '禁用'}成功`)
}
</script>

<style scoped>
.user-management-page {
  padding: 20px;
}
</style>
