<template>
  <a-layout>
    <a-layout-content class="content">
      <a-card title="陪跑计划结果" :bordered="false">
        <!-- 筛选区域 -->
        <a-form :model="filterForm" layout="inline">
          <a-form-item field="dataProduct" label="数据产品">
            <a-select v-model="filterForm.dataProduct" placeholder="请选择数据产品" style="width: 200px">
              <a-option v-for="product in dataProducts" :key="product" :value="product">{{ product }}</a-option>
            </a-select>
          </a-form-item>
          <a-form-item field="creditProduct" label="信贷产品">
            <a-select v-model="filterForm.creditProduct" placeholder="请选择信贷产品" style="width: 200px">
              <a-option v-for="product in creditProducts" :key="product" :value="product">{{ product }}</a-option>
            </a-select>
          </a-form-item>
          <a-form-item field="scene" label="场景">
            <a-select v-model="filterForm.scene" placeholder="请选择场景" style="width: 200px">
              <a-option v-for="scene in scenes" :key="scene" :value="scene">{{ scene }}</a-option>
            </a-select>
          </a-form-item>
          <a-form-item field="period" label="期数">
            <a-select v-model="filterForm.period" placeholder="请选择期数" style="width: 200px">
              <a-option v-for="period in periods" :key="period" :value="period">{{ period }}</a-option>
            </a-select>
          </a-form-item>
          <a-form-item field="dateRange" label="陪跑日期">
            <a-range-picker v-model="filterForm.dateRange" style="width: 300px" />
          </a-form-item>
          <a-form-item field="status" label="当前状态">
            <a-select v-model="filterForm.status" placeholder="请选择状态" style="width: 200px">
              <a-option v-for="status in statuses" :key="status" :value="status">{{ status }}</a-option>
            </a-select>
          </a-form-item>
          <a-form-item>
            <a-space>
              <a-button type="primary" @click="handleSearch">查询</a-button>
              <a-button @click="handleReset">重置</a-button>
              <a-button type="outline" @click="handleExport">导出</a-button>
              <a-button type="primary" status="warning" @click="handleRerun">重跑</a-button>
              <a-button type="primary" status="danger" @click="handleTerminate" :disabled="!selectedRowKeys.length" :title="!selectedRowKeys.length ? '请选择要终止的记录' : ''">终止</a-button>
            </a-space>
          </a-form-item>
        </a-form>

        <!-- 数据表格 -->
        <a-table :columns="columns" :data="filteredData" :pagination="{ pageSize: 10 }" :loading="loading"
          row-key="batchNo" :row-selection="{ type: 'checkbox', selectedRowKeys, showCheckedAll: true }"
          @selection-change="handleSelectionChange">
          <template #operations="{ record }">
            <a-button type="text" size="small" @click="handleRerunItem(record)">重跑</a-button>
          </template>
        </a-table>

      <!-- 终止确认弹窗 -->
      <a-modal v-model:visible="visibleTerminateModal" title="确认终止" @ok="confirmTerminate" @cancel="visibleTerminateModal = false">
        <div>
  <p>确定要终止以下 {{ selectedRowKeys.length }} 条记录吗？</p>
  <a-list size="small" :data="selectedRows.map(row => row.batchNo + ' - ' + row.dataProduct)" />
</div>
      </a-modal>
      </a-card>
    </a-layout-content>
  </a-layout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Message } from '@arco-design/web-vue'

const props = defineProps({
  planName: {
    type: String,
    required: true
  }
})

// 筛选表单
const filterForm = ref({
  dataProduct: '',
  creditProduct: '',
  scene: '',
  period: '',
  dateRange: [],
  status: ''
})

// 选项数据
const dataProducts = ref(['数据产品A', '数据产品B', '数据产品C'])
const creditProducts = ref(['信贷产品A', '信贷产品B', '信贷产品C'])
const scenes = ref(['场景A', '场景B', '场景C'])
const periods = ref(['1', '3', '6', '12'])
const statuses = ref(['已启动', '已完成', '已终止'])

// 表格数据
const tableData = ref([
  {
    dataProduct: '数据产品A',
    creditProduct: '信贷产品B',
    scene: '场景A',
    condition: '条件1',
    period: '3',
    batchNo: '批次001',
    plannedAmount: 1000,
    actualAmount: 980,
    acquisitionRate: '98%',
    successRate: '95%',
    progress: '90%',
    status: '已启动',
    finishTime: '2024-01-01 15:00:00'
  },
  {
    dataProduct: '数据产品B',
    creditProduct: '信贷产品C',
    scene: '场景B',
    condition: '条件2',
    period: '1',
    batchNo: '批次002',
    plannedAmount: 2000,
    actualAmount: 1950,
    acquisitionRate: '97.5%',
    successRate: '96%',
    progress: '100%',
    status: '已完成',
    finishTime: '2024-01-02 21:00:00'
  }
])

// 表格列定义
const columns = [
  { title: '数据产品', dataIndex: 'dataProduct' },
  { title: '信贷产品', dataIndex: 'creditProduct' },
  { title: '场景', dataIndex: 'scene' },
  { title: '条件', dataIndex: 'condition' },
  { title: '期数', dataIndex: 'period' },
  { title: '陪跑批次', dataIndex: 'batchNo' },
  { title: '计划陪跑量', dataIndex: 'plannedAmount' },
  { title: '实际陪跑量', dataIndex: 'actualAmount' },
  { title: '取得率', dataIndex: 'acquisitionRate' },
  { title: '成功率', dataIndex: 'successRate' },
  { title: '跑批进度', dataIndex: 'progress' },
  { title: '当前状态', dataIndex: 'status' },
  { title: '实际完成时间', dataIndex: 'finishTime' },
  { title: '操作', slotName: 'operations' }
]

// 加载状态
const loading = ref(false)
const selectedRowKeys = ref([])
const selectedRows = ref([])
const visibleTerminateModal = ref(false)

// 筛选后的数据
const filteredData = computed(() => {
  return tableData.value.filter(item => {
    return (
      (!filterForm.value.dataProduct || item.dataProduct === filterForm.value.dataProduct) &&
      (!filterForm.value.creditProduct || item.creditProduct === filterForm.value.creditProduct) &&
      (!filterForm.value.scene || item.scene === filterForm.value.scene) &&
      (!filterForm.value.period || item.period === filterForm.value.period) &&
      (!filterForm.value.status || item.status === filterForm.value.status)
    )
  })
})

// 查询
const handleSearch = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 500)
}

// 重置
const handleReset = () => {
  filterForm.value = {
    dataProduct: '',
    creditProduct: '',
    scene: '',
    period: '',
    dateRange: [],
    status: ''
  }
}

// 导出
const handleExport = () => {
  Message.success('导出成功')
}

// 重跑
const handleRerun = () => {
  Message.info('重跑操作已触发')
}

// 重跑单条
const handleRerunItem = (record) => {
  Message.info(`重跑陪跑批次：${record.batchNo}`)
}

// 多选变化
const handleSelectionChange = (rowKeys, rows) => {
  selectedRowKeys.value = rowKeys
  selectedRows.value = rows.filter(row => ['已启动', '未执行'].includes(row.status))
}

// 终止操作
const handleTerminate = () => {
  if (!selectedRowKeys.value.length) {
    Message.warning('请选择要终止的记录')
    return
  }
  visibleTerminateModal.value = true
}

// 确认终止
const confirmTerminate = () => {
  selectedRows.value.forEach(row => {
    row.status = '已终止'
    row._animate = true
    setTimeout(() => {
      row._animate = false
    }, 1000)
  })
  Message.success({
    content: '终止操作成功',
    duration: 2000
  })
  visibleTerminateModal.value = false
}
</script>

<style scoped>
.content {
  padding: 24px;
  background: #f5f6f7;
}
</style>