<template>
  <a-layout>
    <a-layout-content class="content">
      <a-row :gutter="[24, 24]">
        <a-col :span="24">
          <a-card>
            <template #title>
              <a-space>
                <icon-safe />
                权限服务
              </a-space>
            </template>
            <template #extra>
              <a-space>
                <a-input-search v-model="searchKeyword" placeholder="搜索权限名称" style="width: 300px" @search="handleSearch" />
                <a-button type="primary" @click="showCreateModal = true">
                  <template #icon>
                    <icon-plus />
                  </template>
                  申请权限
                </a-button>
              </a-space>
            </template>
            
            <a-row :gutter="[24, 24]">
              <a-col :span="6" v-for="item in tableData" :key="item.id">
                <a-card hoverable>
                  <template #title>
                    <a-link @click="handleViewDetail(item)" style="color: rgb(var(--primary-6))">
                      {{ item.name }}
                    </a-link>
                  </template>
                  <template #extra>
                    <a-tag :color="item.type === '数据权限' ? 'blue' : 'green'">
                      {{ item.type }}
                    </a-tag>
                  </template>
                  <div>申请时间: {{ item.applyTime }}</div>
                  <div>状态: 
                    <a-tag :color="item.status === '已通过' ? 'green' : item.status === '已拒绝' ? 'red' : 'orange'">
                      {{ item.status }}
                    </a-tag>
                  </div>
                  <a-divider />
                  <a-space>
                    <a-button type="text" size="small">查看</a-button>
                    <a-button type="text" size="small" status="warning">撤销</a-button>
                  </a-space>
                </a-card>
              </a-col>
            </a-row>
          </a-card>
        </a-col>
      </a-row>
    </a-layout-content>
    
    <!-- 申请权限弹窗 -->
    <a-modal v-model:visible="showCreateModal" title="申请权限" @cancel="resetForm" @before-ok="handleSubmit" :footer="false"
      :width="800">
      <div class="create-permission-container">
        <div class="page-header">
          <h2 class="page-title">申请权限</h2>
        </div>

        <a-form ref="formRef" :model="formData" :rules="rules" layout="vertical" :style="{ width: '100%', maxWidth: '720px' }">
          <a-card class="section-card">
            <a-grid :cols="2" :col-gap="16" :row-gap="16">
              <a-grid-item>
                <a-form-item field="type" label="权限类型" required>
                  <a-radio-group v-model="formData.type">
                    <a-radio value="数据权限">数据权限</a-radio>
                    <a-radio value="应用权限">应用权限</a-radio>
                  </a-radio-group>
                </a-form-item>
              </a-grid-item>
              <a-grid-item>
                <a-form-item field="name" label="权限名称" required>
                  <a-input v-model="formData.name" placeholder="请输入权限名称" allow-clear />
                </a-form-item>
              </a-grid-item>
              <a-grid-item :span="24">
                <a-form-item field="reason" label="申请理由" required>
                  <a-textarea v-model="formData.reason" placeholder="请输入申请理由" :max-length="200" show-word-limit />
                </a-form-item>
              </a-grid-item>
            </a-grid>
          </a-card>
        </a-form>

        <div class="form-actions">
          <a-space>
            <a-button type="primary" @click="handleSubmit">提交申请</a-button>
            <a-button @click="resetForm">取消</a-button>
          </a-space>
        </div>
      </div>
    </a-modal>
  </a-layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconPlus, IconSafe } from '@arco-design/web-vue/es/icon'

interface PermissionItem {
  id: string
  name: string
  type: '数据权限' | '应用权限'
  applyTime: string
  status: '待审批' | '已通过' | '已拒绝'
}

// 表格数据
const tableData = ref<PermissionItem[]>([])
const loading = ref(false)
const searchKeyword = ref('')
const showCreateModal = ref(false)
const formRef = ref()

// 分页配置
const pagination = ref({
  total: 0,
  current: 1,
  pageSize: 10,
  showTotal: true,
  showJumper: true,
  showPageSize: true,
})

// 表单数据
const formData = ref({
  type: '数据权限',
  name: '',
  reason: ''
})

const rules = {
  type: [{ required: true, message: '请选择权限类型' }],
  name: [{ required: true, message: '请输入权限名称' }],
  reason: [{ required: true, message: '请输入申请理由' }]
}

// 获取状态颜色
const getStatusColor = (status: PermissionItem['status']): string => {
  const colorMap = {
    '待审批': 'blue',
    '已通过': 'green',
    '已拒绝': 'red'
  }
  return colorMap[status] || 'blue'
}

// 获取表格数据
const fetchData = async () => {
  loading.value = true
  try {
    // TODO: 调用接口获取数据
    tableData.value = [
      { id: 'P001', name: '客户数据访问权限', type: '数据权限', applyTime: '2023-05-10', status: '已通过' },
      { id: 'P002', name: '报表系统访问权限', type: '应用权限', applyTime: '2023-05-15', status: '待审批' }
    ]
    pagination.value.total = 2
  } catch (error) {
    Message.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = (): void => {
  pagination.value.current = 1
  fetchData()
}

// 分页变化
const onPageChange = (current: number) => {
  pagination.value.current = current
  fetchData()
}

const onPageSizeChange = (pageSize: number) => {
  pagination.value.pageSize = pageSize
  pagination.value.current = 1
  fetchData()
}

// 查看详情
const handleViewDetail = (record: PermissionItem): void => {
  // TODO: 实现详情查看逻辑
  Message.info(`查看权限详情: ${record.name}`)
}

// 撤回申请
const handleWithdraw = (record: PermissionItem): void => {
  // TODO: 实现撤回逻辑
  Message.success(`已撤回权限申请: ${record.name}`)
  fetchData()
}

// 重置表单
const resetForm = () => {
  formRef.value?.resetFields()
  showCreateModal.value = false
}

// 提交表单
const handleSubmit = async () => {
  const { error } = await formRef.value.validate()
  if (error) return false

  try {
    // TODO: 调用接口提交数据
    Message.success('申请成功')
    resetForm()
    fetchData()
    return true
  } catch (error) {
    Message.error('申请失败')
    return false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.permission-container {
  padding: 20px;
}

.header-actions {
  margin-bottom: 20px;
}

.create-permission-container {
  padding: 20px;
}

.page-title {
  margin-bottom: 20px;
}

.section-card {
  margin-bottom: 20px;
}

.form-actions {
  margin-top: 20px;
  text-align: right;
}
</style>