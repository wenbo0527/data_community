<template>
  <a-layout>
    <a-layout-content class="content">
      <a-row :gutter="[24, 24]">
        <a-col :span="24">
          <a-card title="陪跑计划" :bordered="false">
            <template #extra>
              <a-space>
                <a-input-search
                  v-model="searchText"
                  placeholder="搜索计划"
                  style="width: 200px"
                  @search="handleSearch"
                />
                <a-button type="primary" @click="handleCreate">
                  <template #icon><icon-plus /></template>
                  新建计划
                </a-button>
              </a-space>
            </template>
            <a-table :columns="columns" :data="filteredData" :pagination="{ pageSize: 10 }" :loading="loading">
              <template #planId="{ record }">
                <a-link>{{ record.planId }}</a-link>
              </template>
              <template #status="{ record }">
                <a-tag :color="getStatusColor(record.status)">
                  {{ record.status }}
                </a-tag>
              </template>
              <template #operations="{ record }">
                <a-space>
                  <a-button type="text" size="small" @click="handleViewResult(record)">查看结果</a-button>
                  <a-button type="text" size="small" @click="handleRemark(record)">备注</a-button>
                  <a-popconfirm
                    v-if="record.status === '已启动'"
                    content="确定要终止这个计划吗？"
                    @ok="handleTerminate(record)"
                  >
                    <a-button type="text" size="small" status="danger">终止</a-button>
                  </a-popconfirm>
                </a-space>
              </template>
            </a-table>
          </a-card>
        </a-col>
      </a-row>
    </a-layout-content>
  </a-layout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconPlus } from '@arco-design/web-vue/es/icon'
import { useRouter } from 'vue-router'

const router = useRouter()

const loading = ref(false)
const searchText = ref('')

const columns = [
  {
    title: '计划名称',
    dataIndex: 'planName',
    slotName: 'planName'
  },
  {
    title: '数据产品',
    dataIndex: 'dataProduct'
  },
  {
    title: '信贷产品',
    dataIndex: 'creditProduct'
  },
  {
    title: '场景名称',
    dataIndex: 'sceneName'
  },
  {
    title: '启动日期',
    dataIndex: 'startDate'
  },
  {
    title: '执行批次',
    dataIndex: 'batchNo'
  },
  {
    title: '天数',
    dataIndex: 'days'
  },
  {
    title: '期数',
    dataIndex: 'periods'
  },
  {
    title: '创建人',
    dataIndex: 'creator'
  },
  {
    title: '状态',
    slotName: 'status'
  },
  {
    title: '操作',
    slotName: 'operations',
    width: 240,
    fixed: 'right'
  }
]

const tableData = ref([
  {
    planName: '信用卡陪跑计划A',
    dataProduct: '信用卡数据产品A',
    creditProduct: '信用卡产品B',
    sceneName: '授信申请场景',
    startDate: '2024-01-01',
    batchNo: '15点、21点、23点',
    days: 90,
    periods: 3,
    creator: '张三',
    status: '已启动'
  },
  {
    planName: '消费贷陪跑计划B',
    dataProduct: '消费贷数据产品C',
    creditProduct: '消费贷产品D',
    sceneName: '支用申请场景',
    startDate: '2024-02-01',
    batchNo: '15点、21点、23点',
    days: 30,
    periods: 1,
    creator: '李四',
    status: '已完成'
  }
])

const filteredData = computed(() => {
  if (!searchText.value) return tableData.value
  return tableData.value.filter(item => 
    Object.values(item).some(val => 
      String(val).toLowerCase().includes(searchText.value.toLowerCase())
    )
  )
})

const getStatusColor = (status) => {
  const statusMap = {
    '已启动': 'green',
    '已完成': 'blue'
  }
  return statusMap[status] || 'gray'
}

const handleSearch = (value) => {
  searchText.value = value
}

const handleCreate = () => {
  router.push('/management/accompany/create')
}

const handleViewResult = (record) => {
  router.push({
    path: '/management/accompany/result',
    query: { planName: record.planName }
  })
}

const handleRemark = (record) => {
  // TODO: 实现备注功能
  Message.info(`添加备注：${record.planName}`)
}

const handleTerminate = (record) => {
  // TODO: 实现终止功能
  Message.success(`终止计划：${record.planName}`)
  const index = tableData.value.findIndex(item => item.planName === record.planName)
  if (index !== -1) {
    tableData.value[index].status = '已完成'
  }
}
</script>

<style scoped>
.content {
  padding: 24px;
  background: #f5f6f7;
}
</style>