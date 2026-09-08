<template>
  <div class="user-groups-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">用户组管理</h1>
        <p class="page-description">维护和管理接收通知的用户组，支持基于人员名单的精准推送</p>
      </div>
      <div class="header-right">
        <a-space>
          <a-button type="primary" @click="handleAdd">
            <template #icon><icon-plus /></template>
            新增用户组
          </a-button>
          <a-button @click="handleRefresh">
            <template #icon><icon-refresh /></template>
            刷新
          </a-button>
        </a-space>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <a-card class="search-card" :bordered="false">
      <a-form :model="searchForm" layout="inline" @submit="handleSearch">
        <a-form-item field="name" label="用户组名称">
          <a-input
            v-model="searchForm.name"
            placeholder="请输入名称搜索"
            style="width: 200px"
            allow-clear
          />
        </a-form-item>
        <a-form-item field="notificationType" label="通知类型">
          <a-select
            v-model="searchForm.notificationType"
            placeholder="请选择类型"
            style="width: 160px"
            allow-clear
          >
            <a-option v-for="item in NOTICE_TYPE_OPTIONS" :key="item.value" :value="item.value">
              {{ item.label }}
            </a-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" html-type="submit">搜索</a-button>
            <a-button @click="handleReset">重置</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 数据表格 -->
    <a-card class="table-card" :bordered="false">
      <a-table
        :columns="columns"
        :data="tableData"
        :loading="loading"
        :pagination="pagination"
      >
        <template #notificationTypes="{ record }">
          <a-space wrap>
            <a-tag 
              v-for="type in record.notificationTypes" 
              :key="type" 
              :color="getNoticeTypeColor(type)" 
              size="small"
            >
              {{ getNoticeTypeLabel(type) }}
            </a-tag>
          </a-space>
        </template>
        <template #actions="{ record }">
          <a-space>
            <a-button type="text" size="small" @click="handleEdit(record)">
              <template #icon><icon-edit /></template>
              编辑
            </a-button>
            <a-popconfirm
              content="确定要删除该用户组吗？"
              type="warning"
              @ok="handleDelete(record.id)"
            >
              <a-button type="text" status="danger" size="small">
                <template #icon><icon-delete /></template>
                删除
              </a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </a-table>
    </a-card>

    <!-- 新增/编辑弹窗 -->
    <a-modal
      v-model:visible="modalVisible"
      :title="isEdit ? '编辑用户组' : '新增用户组'"
      width="600px"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
    >
      <a-form :model="formData" :rules="rules" ref="formRef" layout="vertical">
        <a-form-item field="name" label="用户组名称" required>
          <a-input v-model="formData.name" placeholder="请输入用户组名称" />
        </a-form-item>
        
        <a-form-item field="notificationTypes" label="适用通知类型" required>
          <a-select
            v-model="formData.notificationTypes"
            placeholder="请选择适用的通知类型"
            multiple
            allow-clear
          >
            <a-option v-for="item in NOTICE_TYPE_OPTIONS" :key="item.value" :value="item.value">
              {{ item.label }}
            </a-option>
          </a-select>
        </a-form-item>

        <a-form-item field="members" label="组成员" required>
          <a-select
            v-model="formData.members"
            placeholder="请选择组成员"
            multiple
            allow-clear
            allow-search
          >
            <a-option v-for="user in mockUserList" :key="user.id" :value="user.id">
              {{ user.name }} ({{ user.department }})
            </a-option>
          </a-select>
        </a-form-item>

        <a-form-item field="remark" label="备注说明">
          <a-textarea
            v-model="formData.remark"
            placeholder="请输入备注说明"
            :auto-size="{ minRows: 3, maxRows: 5 }"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { Message } from '@arco-design/web-vue'
import { NotificationType } from '@/types/community'
import { NOTICE_TYPE_MAP, NOTICE_TYPE_OPTIONS, getNoticeTypeLabel, getNoticeTypeColor } from '@/constants/notification'
import { mockUserGroups } from '@/mock/community'

// 状态定义
const loading = ref(false)
const modalVisible = ref(false)
const isEdit = ref(false)
const currentId = ref('')
const formRef = ref()

// 搜索表单
const searchForm = reactive({
  name: '',
  notificationType: undefined
})

// 表单数据
const formData = reactive({
  name: '',
  notificationTypes: [] as NotificationType[],
  members: [] as string[],
  remark: ''
})

// 校验规则
const rules = {
  name: [{ required: true, message: '请输入用户组名称' }],
  notificationTypes: [{ required: true, message: '请选择适用通知类型' }],
  members: [{ required: true, message: '请选择组成员' }]
}

// 模拟用户数据（实际应从 API 获取）
const mockUserList = [
  { id: 'user-1', name: '系统管理员', department: '技术部' },
  { id: 'user-2', name: '内容编辑员', department: '运营部' },
  { id: 'user-3', name: '张三', department: '数据部' },
  { id: 'user-4', name: '李四', department: '产品部' },
  { id: 'user-5', name: '王五', department: '销售部' },
  { id: 'user-6', name: '赵六', department: '客服部' },
  { id: 'user-7', name: '钱七', department: '财务部' }
]

// 表格配置
const columns = [
  { title: '用户组名称', dataIndex: 'name', width: 180 },
  { title: '适用通知类型', slotName: 'notificationTypes', width: 250 },
  { title: '创建人', dataIndex: 'creatorName', width: 120 },
  { title: '总人数', dataIndex: 'memberCount', width: 100, align: 'center' },
  { title: '备注说明', dataIndex: 'remark', ellipsis: true, tooltip: true },
  { title: '操作', slotName: 'actions', width: 160, align: 'center', fixed: 'right' }
]

const tableData = ref([...mockUserGroups])
const pagination = reactive({
  total: mockUserGroups.length,
  current: 1,
  pageSize: 10,
  showTotal: true
})

// 方法定义
const handleSearch = () => {
  loading.value = true
  setTimeout(() => {
    tableData.value = mockUserGroups.filter((item: any) => {
      const matchName = !searchForm.name || item.name.includes(searchForm.name)
      const matchType = !searchForm.notificationType || item.notificationTypes.includes(searchForm.notificationType)
      return matchName && matchType
    })
    loading.value = false
  }, 500)
}

const handleReset = () => {
  searchForm.name = ''
  searchForm.notificationType = undefined
  handleSearch()
}

const handleRefresh = () => {
  handleSearch()
}

const handleAdd = () => {
  isEdit.value = false
  currentId.value = ''
  resetForm()
  modalVisible.value = true
}

const handleEdit = (record: any) => {
  isEdit.value = true
  currentId.value = record.id
  formData.name = record.name
  formData.notificationTypes = [...record.notificationTypes]
  formData.members = [...record.members]
  formData.remark = record.remark
  modalVisible.value = true
}

const handleDelete = (id: string) => {
  tableData.value = tableData.value.filter((item: any) => item.id !== id)
  Message.success('删除成功')
}

const handleModalOk = async () => {
  const errors = await formRef.value?.validate()
  if (errors) return

  if (isEdit.value) {
    const index = tableData.value.findIndex(item => item.id === currentId.value)
    if (index !== -1) {
      tableData.value[index] = {
        ...tableData.value[index],
        name: formData.name,
        notificationTypes: [...formData.notificationTypes],
        members: [...formData.members],
        memberCount: formData.members.length,
        remark: formData.remark,
        updatedAt: new Date().toISOString()
      }
    }
    Message.success('更新成功')
  } else {
    const newGroup = {
      id: `group-${Date.now()}`,
      name: formData.name,
      notificationTypes: [...formData.notificationTypes],
      creatorId: 'user-1',
      creatorName: '系统管理员',
      members: [...formData.members],
      memberCount: formData.members.length,
      remark: formData.remark,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    tableData.value.unshift(newGroup)
    Message.success('创建成功')
  }
  modalVisible.value = false
}

const handleModalCancel = () => {
  modalVisible.value = false
}

const resetForm = () => {
  formData.name = ''
  formData.notificationTypes = []
  formData.members = []
  formData.remark = ''
  formRef.value?.resetFields()
}
</script>

<style scoped lang="less">
.user-groups-page {
  padding: 20px;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .page-title {
      margin: 0 0 8px 0;
      font-size: 20px;
      color: var(--color-text-1);
    }

    .page-description {
      margin: 0;
      color: var(--color-text-3);
      font-size: 14px;
    }
  }

  .search-card {
    margin-bottom: 20px;
    background: var(--color-bg-2);
  }

  .table-card {
    background: var(--color-bg-2);
  }

  :deep(.arco-table-th) {
    background-color: var(--color-fill-2);
  }
}
</style>
