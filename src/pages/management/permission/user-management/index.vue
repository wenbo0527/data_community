<template>
  <div class="user-management-page">
    <div v-if="viewMode === 'list'">
      <a-card class="general-card" title="用户管理">
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
              placeholder="搜索用户名称/邮箱"
              style="width: 300px"
              allow-clear
              @search="handleSearch"
            />
          </a-col>
        </a-row>

        <a-table :data="tableData" :pagination="pagination" @page-change="handlePageChange">
          <template #columns>
            <a-table-column title="用户名" data-index="username" />
            <a-table-column title="姓名" data-index="realName" />
            <a-table-column title="邮箱" data-index="email" />
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
      </a-card>
    </div>
    <user-detail v-else :user="currentUser" @back="viewMode = 'list'" />
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { Message } from '@arco-design/web-vue'
import UserDetail from './UserDetail.vue'

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
    username: 'admin',
    realName: '管理员',
    email: 'admin@example.com',
    roles: ['SuperAdmin'],
    status: 'active'
  },
  {
    id: 2,
    username: 'zhangsan',
    realName: '张三',
    email: 'zhangsan@example.com',
    roles: ['DataAnalyst'],
    status: 'active'
  },
  {
    id: 3,
    username: 'lisi',
    realName: '李四',
    email: 'lisi@example.com',
    roles: ['ProjectManager'],
    status: 'disabled'
  }
])

const handleSearch = () => {
  // Implement search
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
  Message.info(`重置密码: ${record.username}`)
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
