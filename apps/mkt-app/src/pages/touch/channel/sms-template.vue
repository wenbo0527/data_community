<template>
  <div class="sms-template-container">
    <a-card :bordered="false" title="短信管理" class="search-card">
      <template #extra>
        <a-space>
          <a-button type="primary" status="success" @click="handleBatchSubmit">
            <template #icon><IconSend /></template>
            批量提交
          </a-button>
          <a-button type="primary" @click="handleCreate">
            <template #icon><IconPlus /></template>
            短信模板新建
          </a-button>
        </a-space>
      </template>
      
      <a-form :model="searchForm" layout="inline" class="search-form">
        <a-form-item label="模板ID" class="form-item">
          <a-input v-model="searchForm.templateId" placeholder="请输入模板ID" allow-clear style="width: 160px;" />
        </a-form-item>
        
        <a-form-item label="短信类型" class="form-item">
          <a-select v-model="searchForm.smsType" placeholder="请选择短信类型" allow-clear style="width: 160px;">
            <a-option value="">全部</a-option>
            <a-option value="营销类">营销类</a-option>
            <a-option value="通知类">通知类</a-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="短信模板" class="form-item">
          <a-input v-model="searchForm.template" placeholder="请输入短信模板" allow-clear style="width: 160px;" />
        </a-form-item>
        
        <a-form-item label="短信标项" class="form-item">
          <a-input v-model="searchForm.label" placeholder="请输入短信标项" allow-clear style="width: 160px;" />
        </a-form-item>
        
        <a-form-item label="内容" class="form-item">
          <a-input v-model="searchForm.content" placeholder="请输入内容" allow-clear style="width: 200px;" />
        </a-form-item>
        
        <a-form-item class="form-item-buttons">
          <a-space>
            <a-button type="primary" @click="handleSearch">
              <template #icon><IconSearch /></template>
              查询
            </a-button>
            <a-button @click="handleReset">
              <template #icon><IconRefresh /></template>
              重置
            </a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 表格区域 -->
    <a-card :bordered="false" class="table-card">
      <a-table 
        :columns="columns" 
        :data="filteredList" 
        :loading="loading"
        :pagination="pagination"
        row-key="id"
        v-model:selected-keys="selectedKeys"
        :row-selection="rowSelection"
        @page-change="onPageChange"
      >
        <template #status="{ record }">
          <a-tag v-if="record.status === '使用中'" color="green">使用中</a-tag>
          <a-tag v-else-if="record.status === '草稿'" color="orange">草稿</a-tag>
          <a-tag v-else-if="record.status === '待审批'" color="blue">待审批</a-tag>
          <a-tag v-else-if="record.status === '审批通过'" color="green">审批通过</a-tag>
          <a-tag v-else-if="record.status === '审批拒绝'" color="red">审批拒绝</a-tag>
          <a-tag v-else color="gray">{{ record.status || '停用' }}</a-tag>
        </template>
        
        <template #action="{ record }">
          <a-space>
            <a-button 
              v-if="record.status === '草稿' || record.status === '审批拒绝'"
              type="text" 
              size="small" 
              status="success"
              @click="handleSubmitApproval(record)"
            >
              <template #icon><IconSend /></template>
              提交审批
            </a-button>
            <a-button 
              v-if="record.status === '待审批'"
              type="text" 
              size="small" 
              status="warning"
              @click="handleApproval(record)"
            >
              <template #icon><IconCheckCircle /></template>
              审批
            </a-button>
            <a-button type="text" size="small" @click="handleView(record)">
              <template #icon><IconEye /></template>
              查看
            </a-button>
            <a-button type="text" size="small" @click="handleEdit(record)">
              <template #icon><IconEdit /></template>
              编辑
            </a-button>
            <a-button type="text" size="small" status="danger" @click="handleDelete(record)">
              <template #icon><IconDelete /></template>
              删除
            </a-button>
            <a-button type="text" size="small" @click="handleCopy(record)">
              <template #icon><IconCopy /></template>
              复制
            </a-button>
          </a-space>
        </template>
      </a-table>
    </a-card>

    <!-- 审批弹窗 -->
    <a-modal
      v-model:visible="approvalModal.visible"
      title="审批处理"
      width="500px"
    >
      <div v-if="approvalModal.record">
        <p>确认对模板 <strong>{{ approvalModal.record.templateId }}</strong> 进行审批操作吗？</p>
        <p>内容：{{ approvalModal.record.content }}</p>
      </div>
      <template #footer>
        <a-space>
          <a-button @click="approvalModal.visible = false">取消</a-button>
          <a-button type="primary" status="danger" @click="handleApproveReject">拒绝</a-button>
          <a-button type="primary" status="success" @click="handleApprovePass">通过</a-button>
        </a-space>
      </template>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { IconPlus, IconSearch, IconRefresh, IconEye, IconEdit, IconDelete, IconCopy, IconCheckCircle, IconSend } from '@arco-design/web-vue/es/icon'
import { listSmsTemplates, updateSmsTemplateStatus } from '@/services/channelService'
import { Modal } from '@arco-design/web-vue'

const router = useRouter()
const list = ref<any[]>([])
const loading = ref(false)
const selectedKeys = ref([])

const rowSelection = {
  type: 'checkbox',
  showCheckedAll: true,
  onlyCurrent: false
}

const searchForm = reactive({
  templateId: '',
  smsType: '',
  template: '',
  label: '',
  content: ''
})

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

const columns = [
  { title: '模板ID', dataIndex: 'templateId', width: 180 },
  { title: '短信类型', dataIndex: 'smsType', width: 120 },
  { title: '一级场景', dataIndex: 'primaryScene', width: 150 },
  { title: '策略tag', dataIndex: 'strategyTag', width: 200 },
  { title: '短信标项', dataIndex: 'label', width: 200 },
  { title: '短信模板', dataIndex: 'template', width: 200 },
  { title: '内容', dataIndex: 'content', ellipsis: true, tooltip: true, width: 300 },
  { title: '状态', dataIndex: 'status', slotName: 'status', width: 100 },
  { title: '操作', slotName: 'action', width: 280, fixed: 'right' }
]

const filteredList = computed(() => {
  let result = [...list.value]
  
  if (searchForm.templateId) {
    result = result.filter(item => item.templateId?.includes(searchForm.templateId))
  }
  if (searchForm.smsType) {
    result = result.filter(item => item.smsType === searchForm.smsType)
  }
  if (searchForm.template) {
    result = result.filter(item => item.template?.includes(searchForm.template))
  }
  if (searchForm.label) {
    result = result.filter(item => item.label?.includes(searchForm.label))
  }
  if (searchForm.content) {
    result = result.filter(item => item.content?.includes(searchForm.content))
  }
  
  pagination.total = result.length
  const start = (pagination.current - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  return result.slice(start, end)
})

async function load() {
  loading.value = true
  try {
    list.value = await listSmsTemplates()
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pagination.current = 1
}

function handleReset() {
  searchForm.templateId = ''
  searchForm.smsType = ''
  searchForm.template = ''
  searchForm.label = ''
  searchForm.content = ''
  pagination.current = 1
}

function onPageChange(page: number) {
  pagination.current = page
}

function handleCreate() {
  router.push('/touch/channel/sms-template/create')
}

function handleView(record: any) {
  Message.info(`查看模板：${record.templateId}`)
}

function handleEdit(record: any) {
  router.push(`/touch/channel/sms-template/edit/${record.id}`)
}

function handleDelete(record: any) {
  Message.info(`删除模板：${record.templateId}`)
}

function handleCopy(record: any) {
  router.push({
    path: '/touch/channel/sms-template/create',
    query: { copyFrom: record.id }
  })
}

async function handleBatchSubmit() {
  if (selectedKeys.value.length === 0) {
    Message.warning('请至少选择一项')
    return
  }
  
  Modal.confirm({
    title: '批量提交',
    content: `确定要提交选中的 ${selectedKeys.value.length} 个模板进行审批吗？`,
    onOk: async () => {
      await updateSmsTemplateStatus(selectedKeys.value as number[], '待审批')
      Message.success('提交成功')
      selectedKeys.value = []
      load()
    }
  })
}

async function handleSubmitApproval(record: any) {
  Modal.confirm({
    title: '提交审批',
    content: `确定要提交模板 ${record.templateId} 进行审批吗？`,
    onOk: async () => {
      await updateSmsTemplateStatus([record.id], '待审批')
      Message.success('提交成功')
      load()
    }
  })
}

function handleApproval(record: any) {
  approvalModal.record = record
  approvalModal.visible = true
}

const approvalModal = reactive({
  visible: false,
  record: null as any,
  comment: ''
})

async function handleApprovePass() {
  if (!approvalModal.record) {return}
  await updateSmsTemplateStatus([approvalModal.record.id], '使用中')
  Message.success('审批通过')
  approvalModal.visible = false
  load()
}

async function handleApproveReject() {
  if (!approvalModal.record) {return}
  await updateSmsTemplateStatus([approvalModal.record.id], '审批拒绝')
  Message.success('审批已拒绝')
  approvalModal.visible = false
  load()
}

load()
</script>

<style scoped>
.sms-template-container {
  padding: 20px;
  background: var(--subapp-bg-secondary);
  min-height: 100vh;
}

.search-card {
  margin-bottom: 16px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 16px 0;
}

.form-item {
  margin-right: 24px;
  margin-bottom: 0;
}

.form-item :deep(.arco-form-item-label) {
  width: 84px;
  text-align: right;
  padding-right: 12px;
}

.form-item-buttons {
  margin-left: auto;
  margin-bottom: 0;
}

.table-card {
  background: #fff;
}

:deep(.arco-table-th) {
  background-color: #f7f8fa;
  font-weight: 600;
}

:deep(.arco-table) {
  font-size: 14px;
}

:deep(.arco-pagination) {
  margin-top: 16px;
  justify-content: flex-end;
}
</style>
