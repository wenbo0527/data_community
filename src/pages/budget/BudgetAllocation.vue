<template>
  <div class="budget-allocation">
    <a-card title="预算分配">
      <template #extra>
        <a-space>
          <a-button type="primary" @click="handleAddAllocation">
            <template #icon><icon-plus /></template>
            新增分配
          </a-button>
          <a-button @click="handleRefresh">
            <template #icon><icon-refresh /></template>
            刷新
          </a-button>
          <a-button @click="handleBack">
            <template #icon><icon-arrow-left /></template>
            返回
          </a-button>
        </a-space>
      </template>

      <!-- 预算概览 -->
      <a-row :gutter="16" style="margin-bottom: 20px">
        <a-col :span="8">
          <a-statistic
            title="总预算"
            :value="budgetOverview.totalAmount"
            :precision="2"
            :value-from="0"
            animation
          >
            <template #prefix>¥</template>
          </a-statistic>
        </a-col>
        <a-col :span="8">
          <a-statistic
            title="已分配"
            :value="budgetOverview.allocatedAmount"
            :precision="2"
            :value-from="0"
            animation
          >
            <template #prefix>¥</template>
          </a-statistic>
        </a-col>
        <a-col :span="8">
          <a-statistic
            title="剩余可分配"
            :value="budgetOverview.remainingAmount"
            :precision="2"
            :value-from="0"
            animation
          >
            <template #prefix>¥</template>
          </a-statistic>
        </a-col>
      </a-row>

      <!-- 分配列表 -->
      <a-table
        :data="allocationData"
        :columns="allocationColumns"
        :pagination="paginationConfig"
        :loading="loading"
        row-key="id"
      >
        <template #amount="{ record }">
          ¥{{ record.amount.toLocaleString() }}
        </template>
        <template #usedAmount="{ record }">
          ¥{{ record.usedAmount.toLocaleString() }}
        </template>
        <template #remainingAmount="{ record }">
          ¥{{ record.remainingAmount.toLocaleString() }}
        </template>
        <template #status="{ record }">
          <a-tag :color="getStatusColor(record.status)">
            {{ getStatusText(record.status) }}
          </a-tag>
        </template>
        <template #action="{ record }">
          <a-space>
            <a-button type="text" @click="handleEdit(record)">
              <template #icon><icon-edit /></template>
              编辑
            </a-button>
            <a-button type="text" status="danger" @click="handleDelete(record)">
              <template #icon><icon-delete /></template>
              删除
            </a-button>
          </a-space>
        </template>
      </a-table>
    </a-card>

    <!-- 新增/编辑分配对话框 -->
    <a-modal
      v-model:visible="allocationModal.visible"
      :title="allocationModal.title"
      @ok="handleAllocationSubmit"
      @cancel="handleAllocationCancel"
    >
      <a-form
        ref="allocationFormRef"
        :model="allocationModal.form"
        :rules="allocationModal.rules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 16 }"
      >
        <a-form-item label="分配对象" field="target">
          <a-select v-model="allocationModal.form.target" placeholder="请选择分配对象">
            <a-option v-for="target in allocationTargets" :key="target.value" :value="target.value">
              {{ target.label }}
            </a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="分配金额" field="amount">
          <a-input-number
            v-model="allocationModal.form.amount"
            :min="0"
            :precision="2"
            placeholder="请输入分配金额"
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item label="分配说明" field="description">
          <a-textarea v-model="allocationModal.form.description" placeholder="请输入分配说明" :rows="3" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { budgetApiService } from '@/api/budget'

const router = useRouter()
const route = useRoute()

const budgetId = route.params.id
const loading = ref(false)

const budgetOverview = reactive({
  totalAmount: 0,
  allocatedAmount: 0,
  remainingAmount: 0
})

const allocationData = ref([])

const allocationColumns = [
  { title: '分配对象', dataIndex: 'target', width: 150 },
  { title: '分配金额', dataIndex: 'amount', slotName: 'amount', width: 120 },
  { title: '已使用', dataIndex: 'usedAmount', slotName: 'usedAmount', width: 120 },
  { title: '剩余', dataIndex: 'remainingAmount', slotName: 'remainingAmount', width: 120 },
  { title: '状态', dataIndex: 'status', slotName: 'status', width: 100 },
  { title: '分配时间', dataIndex: 'createdAt', width: 160 },
  { title: '操作', slotName: 'action', width: 120 }
]

const paginationConfig = {
  pageSize: 10,
  showTotal: true,
  showJumper: true,
  showPageSize: true
}

const allocationModal = reactive({
  visible: false,
  title: '新增分配',
  form: {
    target: '',
    amount: 0,
    description: ''
  },
  rules: {
    target: [{ required: true, message: '请选择分配对象' }],
    amount: [
      { required: true, message: '请输入分配金额' },
      { type: 'number', min: 0, message: '分配金额必须大于等于0' }
    ]
  },
  isEdit: false,
  editId: null
})

const allocationTargets = ref([
  { value: 'dept_tech', label: '技术部' },
  { value: 'dept_sales', label: '销售部' },
  { value: 'dept_marketing', label: '市场部' },
  { value: 'dept_hr', label: '人事部' },
  { value: 'project_a', label: '项目A' },
  { value: 'project_b', label: '项目B' }
])

const getStatusColor = (status) => {
  const colors = {
    'active': 'green',
    'warning': 'orange',
    'exceeded': 'red',
    'closed': 'gray'
  }
  return colors[status] || 'blue'
}

const getStatusText = (status) => {
  const texts = {
    'active': '正常',
    'warning': '预警',
    'exceeded': '超支',
    'closed': '关闭'
  }
  return texts[status] || '未知'
}

const handleAddAllocation = () => {
  allocationModal.visible = true
  allocationModal.title = '新增分配'
  allocationModal.isEdit = false
  allocationModal.form = {
    target: '',
    amount: 0,
    description: ''
  }
}

const handleEdit = (record) => {
  allocationModal.visible = true
  allocationModal.title = '编辑分配'
  allocationModal.isEdit = true
  allocationModal.editId = record.id
  allocationModal.form = {
    target: record.target,
    amount: record.amount,
    description: record.description
  }
}

const handleDelete = async (record) => {
  try {
    await budgetApiService.deleteBudgetAllocation(record.id)
    await loadAllocationData()
  } catch (error) {
    console.error('删除分配失败:', error)
  }
}

const handleAllocationSubmit = async () => {
  try {
    if (allocationModal.isEdit) {
      await budgetApiService.updateBudgetAllocation(allocationModal.editId, allocationModal.form)
    } else {
      await budgetApiService.createBudgetAllocation(budgetId, allocationModal.form)
    }
    allocationModal.visible = false
    await loadAllocationData()
  } catch (error) {
    console.error('保存分配失败:', error)
  }
}

const handleAllocationCancel = () => {
  allocationModal.visible = false
}

const handleRefresh = () => {
  loadAllocationData()
}

const handleBack = () => {
  router.push('/budget/overview')
}

const loadAllocationData = async () => {
  loading.value = true
  try {
    const budget = await budgetApiService.getBudgetById(budgetId)
    const allocations = await budgetApiService.getBudgetAllocations(budgetId)
    
    budgetOverview.totalAmount = budget.totalAmount
    budgetOverview.allocatedAmount = allocations.reduce((sum, item) => sum + item.amount, 0)
    budgetOverview.remainingAmount = budgetOverview.totalAmount - budgetOverview.allocatedAmount
    
    allocationData.value = allocations
  } catch (error) {
    console.error('加载分配数据失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadAllocationData()
})
</script>

<style scoped>
.budget-allocation {
  padding: 20px;
}
</style>