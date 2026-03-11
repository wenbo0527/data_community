<template>
  <div class="offline-model-test">
    <h1>离线模型模块测试页面</h1>
    <div class="test-sections">
      <div class="test-section">
        <h3>模块导航测试</h3>
        <a-space direction="vertical" style="width: 100%">
          <a-button type="primary" @click="$router.push('/model-offline-analysis/feature-center')">
            特征中心
          </a-button>
          <a-button type="primary" @click="$router.push('/model-offline-analysis/model-register')">
            模型注册
          </a-button>
          <a-button type="primary" @click="$router.push('/model-offline-analysis/model-backtrack')">
            模型回溯
          </a-button>
          <a-button type="primary" @click="$router.push('/model-offline-analysis/task-management')">
            任务管理
          </a-button>
          <a-button type="primary" @click="$router.push('/model-offline-analysis/model-evaluation')">
            模型评估
          </a-button>
        </a-space>
      </div>
      
      <div class="test-section">
        <h3>API测试</h3>
        <a-space>
          <a-button @click="testFeatureAPI">测试特征API</a-button>
          <a-button @click="testModelAPI">测试模型API</a-button>
        </a-space>
        <div v-if="testResult" class="test-result">
          <h4>测试结果：</h4>
          <pre>{{ JSON.stringify(testResult, null, 2) }}</pre>
        </div>
      </div>
      
      <div class="test-section">
        <h3>组件测试</h3>
        <a-space>
          <a-button @click="showTable = !showTable">{{ showTable ? '隐藏' : '显示' }}表格</a-button>
          <a-button @click="showForm = !showForm">{{ showForm ? '隐藏' : '显示' }}表单</a-button>
          <a-button @click="showChart = !showChart">{{ showChart ? '隐藏' : '显示' }}图表</a-button>
        </a-space>
      </div>
    </div>
    
    <!-- 表格测试 -->
    <div v-if="showTable" class="test-component">
      <h3>通用表格组件测试</h3>
      <CommonTable
        :data="tableData"
        :columns="tableColumns"
        :loading="tableLoading"
        @view="handleView"
        @edit="handleEdit"
        @delete="handleDelete"
      />
    </div>
    
    <!-- 表单测试 -->
    <div v-if="showForm" class="test-component">
      <h3>通用表单组件测试</h3>
      <CommonForm
        ref="formRef"
        :fields="formFields"
        :model="formModel"
        @submit="handleFormSubmit"
        @reset="handleFormReset"
      />
    </div>
    
    <!-- 图表测试 -->
    <div v-if="showChart" class="test-component">
      <h3>通用图表组件测试</h3>
      <CommonChart
        type="line"
        :data="chartData"
        title="测试图表"
        :height="300"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { Message } from '@arco-design/web-vue'
import CommonTable from '@/components/offlineModel/CommonTable.vue'
import CommonForm from '@/components/offlineModel/CommonForm.vue'
import CommonChart from '@/components/offlineModel/CommonChart.vue'
import { featureAPI, modelAPI } from '@/modules/offline-model/api'

// 测试数据
const testResult = ref(null)
const showTable = ref(false)
const showForm = ref(false)
const showChart = ref(false)
const tableLoading = ref(false)

// 表格测试数据
const tableData = ref([
  { id: 1, name: '测试数据1', type: 'active', createTime: '2024-01-15 10:30:00' },
  { id: 2, name: '测试数据2', type: 'inactive', createTime: '2024-01-16 14:20:00' },
  { id: 3, name: '测试数据3', type: 'pending', createTime: '2024-01-17 09:15:00' }
])

const tableColumns = ref([
  { title: 'ID', dataIndex: 'id', width: 80 },
  { title: '名称', dataIndex: 'name', width: 200 },
  { title: '状态', dataIndex: 'type', width: 100, dataType: 'status' },
  { title: '创建时间', dataIndex: 'createTime', width: 180, dataType: 'time' }
])

// 表单测试数据
const formRef = ref()
const formModel = reactive({
  name: '',
  type: '',
  description: '',
  status: true
})

const formFields = ref([
  {
    name: 'name',
    label: '名称',
    type: 'input',
    required: true,
    rules: [{ required: true, message: '请输入名称' }]
  },
  {
    name: 'type',
    label: '类型',
    type: 'select',
    options: [
      { label: '类型1', value: 'type1' },
      { label: '类型2', value: 'type2' }
    ],
    required: true
  },
  {
    name: 'description',
    label: '描述',
    type: 'textarea',
    maxLength: 200
  },
  {
    name: 'status',
    label: '状态',
    type: 'switch'
  }
])

// 图表测试数据
const chartData = ref([
  { name: '一月', value: 120 },
  { name: '二月', value: 200 },
  { name: '三月', value: 150 },
  { name: '四月', value: 80 },
  { name: '五月', value: 70 },
  { name: '六月', value: 110 }
])

// API测试方法
const testFeatureAPI = async () => {
  try {
    const response = await featureAPI.getFeatures({ page: 1, pageSize: 10 })
    testResult.value = response
    if (response.success) {
      Message.success('特征API测试成功')
    } else {
      Message.error('特征API测试失败: ' + response.message)
    }
  } catch (error) {
    Message.error('特征API测试错误: ' + error.message)
    testResult.value = { error: error.message }
  }
}

const testModelAPI = async () => {
  try {
    const response = await modelAPI.getModels({ page: 1, pageSize: 10 })
    testResult.value = response
    if (response.success) {
      Message.success('模型API测试成功')
    } else {
      Message.error('模型API测试失败: ' + response.message)
    }
  } catch (error) {
    Message.error('模型API测试错误: ' + error.message)
    testResult.value = { error: error.message }
  }
}

// 表格事件处理
const handleView = (record) => {
  Message.info('查看: ' + record.name)
}

const handleEdit = (record) => {
  Message.info('编辑: ' + record.name)
}

const handleDelete = (record) => {
  Message.info('删除: ' + record.name)
}

// 表单事件处理
const handleFormSubmit = (formData) => {
  Message.success('表单提交成功: ' + JSON.stringify(formData))
}

const handleFormReset = () => {
  Message.info('表单重置')
}
</script>

<style scoped lang="less">
.offline-model-test {
  padding: 24px;
  
  h1 {
    margin-bottom: 24px;
    color: #333;
  }
  
  .test-sections {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  
  .test-section {
    background: #fff;
    padding: 24px;
    border-radius: 6px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    
    h3 {
      margin-bottom: 16px;
      color: #333;
    }
  }
  
  .test-result {
    margin-top: 16px;
    padding: 16px;
    background: #f5f5f5;
    border-radius: 4px;
    
    pre {
      margin: 0;
      white-space: pre-wrap;
      word-break: break-all;
    }
  }
  
  .test-component {
    margin-top: 24px;
    padding: 24px;
    background: #fff;
    border-radius: 6px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    
    h3 {
      margin-bottom: 16px;
      color: #333;
    }
  }
}
</style>