<template>
  <div class="fund-usage-query">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>风险合规外数查询</h2>
      <p class="page-description">查询客户风险合规相关外部数据，支持身份证号查询和批量回溯两种模式</p>
    </div>

    <!-- 查询步骤 -->
    <div class="query-steps">
      <a-steps :current="currentStep" size="small">
        <a-step v-if="queryType === 'idQuery'" title="输入查询条件" description="选择查询类型并输入查询条件" />
        <a-step v-if="queryType === 'idQuery'" title="选择借据" description="从查询结果中选择需要查询的借据" />
        <a-step v-if="queryType === 'idQuery'" title="确认查询" description="确认查询信息并提交申请" />
        
        <a-step v-if="queryType === 'batchBacktrack'" title="选择查询类型" description="选择查询类型和外部数据选项" />
        <a-step v-if="queryType === 'batchBacktrack'" title="添加样本" description="输入样本数据库和样本表信息" />
        <a-step v-if="queryType === 'batchBacktrack'" title="绑定参数列" description="配置参数列映射关系" />
      </a-steps>
    </div>

    <!-- 步骤内容 -->
    <a-card class="step-content">
      <!-- 步骤1: 选择查询类型和条件 -->
      <div v-if="currentStep === 0" class="step-container">
        <h3>选择查询类型</h3>
        <p class="step-description">请选择查询类型和外部数据选项</p>
        
        <!-- 查询类型选择 -->
        <a-form :model="queryForm" layout="vertical">
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="外部数据选项" required>
                <a-select v-model="queryForm.externalDataOption" placeholder="请选择外部数据选项">
                  <a-option value="fundUsage">资金用途</a-option>
                </a-select>
                <div class="form-tip">默认为资金用途，暂无其他选项</div>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="查询类型" field="queryType">
                <a-radio-group v-model="queryType" type="button" @change="handleQueryTypeChange">
                  <a-radio value="idQuery">身份证号查询</a-radio>
                  <a-radio value="batchBacktrack">批量回溯</a-radio>
                </a-radio-group>
              </a-form-item>
            </a-col>
          </a-row>
          
          <!-- 身份证号查询条件 -->
          <div v-if="queryType === 'idQuery'">
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="客户身份证号" required>
                  <a-textarea 
                    v-model="queryForm.idNumbers" 
                    placeholder="请输入客户身份证号，多个身份证号请换行输入"
                    :auto-size="{ minRows: 4, maxRows: 6 }"
                    :max-length="1000"
                    show-word-limit
                  />
                  <div class="form-tip">支持批量输入，每行一个身份证号</div>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="支用时间范围">
                  <a-range-picker 
                    v-model="queryForm.usageTimeRange" 
                    style="width: 100%"
                    :placeholder="['开始时间', '结束时间']"
                  />
                </a-form-item>
                <a-form-item label="借据状态">
                  <a-select v-model="queryForm.loanStatus" placeholder="请选择借据状态" allow-clear>
                    <a-option value="active">正常</a-option>
                    <a-option value="overdue">逾期</a-option>
                    <a-option value="settled">已结清</a-option>
                    <a-option value="written-off">已核销</a-option>
                  </a-select>
                </a-form-item>
              </a-col>
            </a-row>
            <a-form-item>
              <a-button type="primary" @click="searchLoans" :loading="loanLoading">
                查询借据
              </a-button>
            </a-form-item>
          </div>
          
          <!-- 批量回溯直接进入下一步 -->
          <div v-if="queryType === 'batchBacktrack'">
            <a-form-item>
              <a-button type="primary" @click="nextStep">
                下一步
              </a-button>
            </a-form-item>
          </div>
        </a-form>

        <div class="step-actions" v-if="queryType === 'idQuery' && loanData.length > 0">
          <a-button @click="prevStep" :disabled="currentStep === 0">
            上一步
          </a-button>
          <a-button 
            type="primary" 
            @click="nextStep" 
            :disabled="loanData.length === 0"
            style="margin-left: 8px"
          >
            下一步
          </a-button>
        </div>
      </div>

      <!-- 步骤2: 选择借据信息 (身份证号查询模式) -->
      <div v-if="currentStep === 1 && queryType === 'idQuery'" class="step-container">
        <h3>选择借据信息</h3>
        <p class="step-description">查询到的借据信息如下，请选择需要查询用途的借据</p>
        
        <!-- 借据筛选 -->
        <div class="filter-section" v-if="loanData.length > 0">
          <a-row :gutter="16">
            <a-col :span="8">
              <a-input 
                v-model="loanFilter.keyword" 
                placeholder="搜索客户姓名或身份证号"
                @input="handleLoanFilter"
                allow-clear
              />
            </a-col>
            <a-col :span="6">
              <a-select 
                v-model="loanFilter.status" 
                placeholder="筛选状态"
                @change="handleLoanFilter"
                allow-clear
              >
                <a-option value="active">正常</a-option>
                <a-option value="overdue">逾期</a-option>
                <a-option value="settled">已结清</a-option>
                <a-option value="written-off">已核销</a-option>
              </a-select>
            </a-col>
            <a-col :span="6">
              <a-button @click="resetLoanFilter">重置筛选</a-button>
            </a-col>
          </a-row>
        </div>

        <!-- 借据列表 -->
        <a-table 
          v-if="loanData.length > 0"
          :columns="loanColumns"
          :data="filteredLoanData"
          :loading="loanLoading"
          :pagination="{
            current: loanPagination.current,
            pageSize: loanPagination.pageSize,
            total: loanPagination.total,
            showTotal: true,
            showPageSize: true,
            onChange: handleLoanPageChange
          }"
          :row-selection="{
            type: 'checkbox',
            selectedRowKeys: selectedLoanKeys,
            onChange: handleLoanSelection
          }"
          row-key="id"
        >
          <template #customerName="{ record }">
            <div>
              <div class="customer-name">{{ record.customerName }}</div>
              <div class="customer-id">{{ record.idNumber }}</div>
            </div>
          </template>
          
          <template #loanAmount="{ record }">
            {{ (record.loanAmount / 10000).toFixed(2) }}万
          </template>
          
          <template #status="{ record }">
            <a-tag :color="getLoanStatusColor(record.status)">
              {{ getLoanStatusText(record.status) }}
            </a-tag>
          </template>
        </a-table>


        
        <div class="step-actions">
          <a-button style="margin-right: 8px" @click="prevStep">上一步</a-button>
          <a-button type="primary" :disabled="selectedLoanKeys.length === 0" @click="nextStep">
            下一步 (已选择{{ selectedLoanKeys.length }}条)
          </a-button>
        </div>
      </div>

      <!-- 步骤2: 添加样本 (批量回溯模式) -->
      <div v-if="currentStep === 1 && queryType === 'batchBacktrack'" class="step-container">
        <h3>添加样本</h3>
        <p class="step-description">请输入样本数据库和样本表信息</p>
        
        <a-form :model="sampleForm" layout="vertical">
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="样本数据库" required>
                <a-input v-model="sampleForm.database" placeholder="请输入样本数据库名称" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="样本表" required>
                <a-input v-model="sampleForm.table" placeholder="请输入样本表名称" />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="16">
            <a-col :span="24">
              <a-form-item label="样本描述">
                <a-textarea 
                  v-model="sampleForm.description" 
                  placeholder="请输入样本描述信息（可选）"
                  :auto-size="{ minRows: 3, maxRows: 5 }"
                />
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
        
        <div class="step-actions">
          <a-button @click="prevStep">上一步</a-button>
          <a-button 
            type="primary" 
            @click="nextStep" 
            :disabled="!sampleForm.database || !sampleForm.table"
            style="margin-left: 8px"
          >
            下一步
          </a-button>
        </div>
      </div>
      
      <!-- 步骤3: 绑定参数列 (批量回溯模式) -->
      <div v-if="currentStep === 2 && queryType === 'batchBacktrack'" class="step-container">
        <h3>绑定参数列</h3>
        <p class="step-description">请配置参数列映射关系</p>
        
        <div class="parameter-mapping">
          <a-table
            :columns="parameterColumns"
            :data="parameterMappings"
            :pagination="false"
            size="small"
          >
            <template #targetColumn="{ record, rowIndex }">
              <a-select 
                v-model="parameterMappings[rowIndex].targetColumn"
                placeholder="选择目标列"
                style="width: 100%"
              >
                <a-option value="customer_id">客户ID</a-option>
                <a-option value="loan_id">借据ID</a-option>
                <a-option value="amount">金额</a-option>
                <a-option value="date">日期</a-option>
                <a-option value="status">状态</a-option>
              </a-select>
            </template>
            <template #required="{ record }">
              <a-tag :color="record.required ? 'red' : 'blue'">
                {{ record.required ? '必填' : '可选' }}
              </a-tag>
            </template>
          </a-table>
        </div>
        
        <div class="step-actions">
          <a-button @click="prevStep">上一步</a-button>
          <a-button type="primary" @click="confirmBatchQuery">确认发起审批</a-button>
        </div>
      </div>

      <!-- 步骤3: 确认查询列表 (身份证号查询模式) -->
      <div v-if="currentStep === 2 && queryType === 'idQuery'" class="step-container">
        <h3>确认查询列表</h3>
        <p class="step-description">请确认以下查询内容，点击确认后将发起审批流程</p>
        
        <!-- 查询摘要 -->
        <div class="query-summary">
          <a-descriptions :column="2" bordered>
            <a-descriptions-item label="查询客户数">{{ uniqueCustomers.length }}人</a-descriptions-item>
            <a-descriptions-item label="查询借据数">{{ selectedLoans.length }}笔</a-descriptions-item>
            <a-descriptions-item label="查询时间范围">
              {{ queryForm.usageTimeRange ? 
                `${queryForm.usageTimeRange[0]} 至 ${queryForm.usageTimeRange[1]}` : 
                '不限制' 
              }}
            </a-descriptions-item>
            <a-descriptions-item label="借据状态筛选">
              {{ queryForm.loanStatus ? getLoanStatusText(queryForm.loanStatus) : '不限制' }}
            </a-descriptions-item>
          </a-descriptions>
        </div>

        <!-- 选中的借据列表 -->
        <div class="selected-loans">
          <h4>选中的借据列表</h4>
          <a-table
            :columns="summaryColumns"
            :data="selectedLoans"
            :pagination="false"
            size="small"
          >
            <template #customerName="{ record }">
              <div>
                <div class="customer-name">{{ record.customerName }}</div>
                <div class="customer-id">{{ record.idNumber }}</div>
              </div>
            </template>
            
            <template #loanAmount="{ record }">
              {{ (record.loanAmount / 10000).toFixed(2) }}万
            </template>
            
            <template #status="{ record }">
              <a-tag :color="getLoanStatusColor(record.status)" size="small">
                {{ getLoanStatusText(record.status) }}
              </a-tag>
            </template>
          </a-table>
        </div>

        <div class="step-actions">
          <a-button style="margin-right: 8px" @click="prevStep">上一步</a-button>
          <a-button type="primary" @click="confirmQuery">确认发起审批</a-button>
        </div>
      </div>
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 步骤控制
const currentStep = ref(0)
const nextStep = () => {
  if (currentStep.value < 2) {
    currentStep.value++
  }
}
const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

// 查询类型
const queryType = ref('idQuery')

// 查询表单
const queryForm = reactive({
  externalDataOption: 'fundUsage',
  idNumbers: '',
  usageTimeRange: null,
  loanStatus: ''
})

// 样本表单
const sampleForm = reactive({
  database: '',
  table: '',
  description: ''
})

// 参数映射
const parameterMappings = ref([
  { sourceColumn: 'column1', targetColumn: '', required: true, description: '源列1' },
  { sourceColumn: 'column2', targetColumn: '', required: false, description: '源列2' },
  { sourceColumn: 'column3', targetColumn: '', required: false, description: '源列3' }
])

// 参数列表格配置
const parameterColumns = [
  {
    title: '源列名',
    dataIndex: 'sourceColumn',
    width: 120
  },
  {
    title: '目标列',
    dataIndex: 'targetColumn',
    slotName: 'targetColumn',
    width: 200
  },
  {
    title: '是否必填',
    dataIndex: 'required',
    slotName: 'required',
    width: 100
  },
  {
    title: '描述',
    dataIndex: 'description',
    width: 150
  }
]

// 借据筛选
const loanFilter = reactive({
  keyword: '',
  status: ''
})

// 借据数据
const loanData = ref([])
const loanLoading = ref(false)
const selectedLoanKeys = ref([])
const selectedLoans = ref([])

// 借据分页
const loanPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: true,
  showPageSize: true
})

// 借据表格列配置
const loanColumns = [
  {
    title: '客户信息',
    dataIndex: 'customerName',
    slotName: 'customerName',
    width: 180
  },
  {
    title: '借据编号',
    dataIndex: 'loanNumber',
    width: 150
  },
  {
    title: '借款金额',
    dataIndex: 'loanAmount',
    slotName: 'loanAmount',
    width: 120
  },
  {
    title: '支用时间',
    dataIndex: 'usageTime',
    width: 120
  },
  {
    title: '到期时间',
    dataIndex: 'dueTime',
    width: 120
  },
  {
    title: '借据状态',
    dataIndex: 'status',
    slotName: 'status',
    width: 100
  },
  {
    title: '资金用途',
    dataIndex: 'fundPurpose',
    width: 150
  }
]

// 摘要表格列配置
const summaryColumns = [
  {
    title: '客户信息',
    dataIndex: 'customerName',
    slotName: 'customerName',
    width: 150
  },
  {
    title: '借据编号',
    dataIndex: 'loanNumber',
    width: 130
  },
  {
    title: '借款金额',
    dataIndex: 'loanAmount',
    slotName: 'loanAmount',
    width: 100
  },
  {
    title: '支用时间',
    dataIndex: 'usageTime',
    width: 100
  },
  {
    title: '状态',
    dataIndex: 'status',
    slotName: 'status',
    width: 80
  },
  {
    title: '资金用途',
    dataIndex: 'fundPurpose',
    width: 120
  }
]

// 筛选后的借据数据
const filteredLoanData = computed(() => {
  let result = [...loanData.value]
  
  if (loanFilter.keyword) {
    result = result.filter(item => 
      item.customerName.includes(loanFilter.keyword) ||
      item.idNumber.includes(loanFilter.keyword)
    )
  }
  
  if (loanFilter.status) {
    result = result.filter(item => item.status === loanFilter.status)
  }
  
  loanPagination.total = result.length
  return result
})

// 唯一客户数
const uniqueCustomers = computed(() => {
  const customerMap = new Map()
  selectedLoans.value.forEach(loan => {
    customerMap.set(loan.idNumber, {
      name: loan.customerName,
      idNumber: loan.idNumber
    })
  })
  return Array.from(customerMap.values())
})

// 查询借据
const searchLoans = () => {
  loanLoading.value = true
  
  // 解析身份证号
  const idNumbers = queryForm.idNumbers
    .split('\n')
    .map(id => id.trim())
    .filter(id => id.length > 0)
  
  if (idNumbers.length === 0) {
    Message.error('请输入至少一个身份证号')
    loanLoading.value = false
    return
  }
  
  // 模拟查询借据数据
  setTimeout(() => {
    const mockLoans = []
    const customerNames = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十']
    const fundPurposes = ['经营周转', '设备采购', '原材料采购', '流动资金', '技术改造', '扩大生产']
    const statuses = ['active', 'overdue', 'settled', 'written-off']
    
    idNumbers.forEach((idNumber, customerIndex) => {
      // 为身份证号111的用户提供特定的mock数据
      if (idNumber === '111') {
        const specificLoans = [
          {
            id: 'loan-111-1',
            customerName: '测试用户',
            idNumber: '111',
            loanNumber: 'JJ111001',
            loanAmount: 500000,
            usageTime: '2024-01-15',
            dueTime: '2025-01-15',
            status: 'active',
            fundPurpose: '经营周转'
          },
          {
            id: 'loan-111-2',
            customerName: '测试用户',
            idNumber: '111',
            loanNumber: 'JJ111002',
            loanAmount: 300000,
            usageTime: '2024-03-20',
            dueTime: '2025-03-20',
            status: 'active',
            fundPurpose: '设备采购'
          },
          {
            id: 'loan-111-3',
            customerName: '测试用户',
            idNumber: '111',
            loanNumber: 'JJ111003',
            loanAmount: 200000,
            usageTime: '2023-12-10',
            dueTime: '2024-12-10',
            status: 'settled',
            fundPurpose: '流动资金'
          }
        ]
        mockLoans.push(...specificLoans)
      } else {
        // 其他用户生成随机数据
        const loanCount = Math.floor(Math.random() * 3) + 1
        for (let i = 0; i < loanCount; i++) {
          const usageDate = new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
          const dueDate = new Date(usageDate.getTime() + (Math.floor(Math.random() * 365) + 30) * 24 * 60 * 60 * 1000)
          
          mockLoans.push({
            id: `loan-${customerIndex}-${i}`,
            customerName: customerNames[customerIndex % customerNames.length],
            idNumber: idNumber,
            loanNumber: `JJ${String(customerIndex + 1).padStart(3, '0')}${String(i + 1).padStart(3, '0')}`,
            loanAmount: Math.floor(Math.random() * 1000000) + 50000,
            usageTime: usageDate.toISOString().split('T')[0],
            dueTime: dueDate.toISOString().split('T')[0],
            status: statuses[Math.floor(Math.random() * statuses.length)],
            fundPurpose: fundPurposes[Math.floor(Math.random() * fundPurposes.length)]
          })
        }
      }
    })
    
    // 按支用时间倒序排列
    mockLoans.sort((a, b) => new Date(b.usageTime) - new Date(a.usageTime))
    
    // 应用时间范围筛选
    let filteredLoans = mockLoans
    if (queryForm.usageTimeRange && queryForm.usageTimeRange.length === 2) {
      const startDate = new Date(queryForm.usageTimeRange[0])
      const endDate = new Date(queryForm.usageTimeRange[1])
      filteredLoans = mockLoans.filter(loan => {
        const loanDate = new Date(loan.usageTime)
        return loanDate >= startDate && loanDate <= endDate
      })
    }
    
    // 应用状态筛选
    if (queryForm.loanStatus) {
      filteredLoans = filteredLoans.filter(loan => loan.status === queryForm.loanStatus)
    }
    
    loanData.value = filteredLoans
    loanPagination.total = filteredLoans.length
    loanLoading.value = false
    

    
    if (filteredLoans.length > 0) {
      Message.success(`查询到${filteredLoans.length}笔借据，请点击"下一步"继续`)
    } else {
      Message.warning('未查询到符合条件的借据')
    }
  }, 1000)
}

// 借据筛选
const handleLoanFilter = () => {
  loanPagination.current = 1
}

const resetLoanFilter = () => {
  loanFilter.keyword = ''
  loanFilter.status = ''
  loanPagination.current = 1
}

// 借据分页
const handleLoanPageChange = (page) => {
  loanPagination.current = page
}

// 借据选择
const handleLoanSelection = (rowKeys, rows) => {
  selectedLoanKeys.value = rowKeys
  selectedLoans.value = rows
}

// 状态相关方法
const getLoanStatusColor = (status) => {
  const colorMap = {
    active: 'green',
    overdue: 'red',
    settled: 'blue',
    'written-off': 'orange'
  }
  return colorMap[status] || 'gray'
}

const getLoanStatusText = (status) => {
  const textMap = {
    active: '正常',
    overdue: '逾期',
    settled: '已结清',
    'written-off': '已核销'
  }
  return textMap[status] || '未知'
}

// 处理查询类型变化
const handleQueryTypeChange = (value) => {
  currentStep.value = 0
  // 重置相关数据
  if (value === 'batchBacktrack') {
    loanData.value = []
    selectedLoanKeys.value = []
    selectedLoans.value = []
  }
}

// 确认查询 (身份证号查询模式)
const confirmQuery = () => {
  Message.success('查询申请已提交，等待审批')
  router.push('/management/service')
}

// 确认批量查询 (批量回溯模式)
const confirmBatchQuery = () => {
  // 验证参数映射
  const requiredMappings = parameterMappings.value.filter(item => item.required)
  const hasEmptyRequired = requiredMappings.some(item => !item.targetColumn)
  
  if (hasEmptyRequired) {
    Message.error('请完成所有必填参数的映射配置')
    return
  }
  
  Message.success('批量回溯申请已提交，等待审批')
  router.push('/management/service')
}

onMounted(() => {
  // 初始化
})
</script>

<style scoped>
.fund-usage-query {
  padding: 16px;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h2 {
  margin-bottom: 8px;
}

.page-description {
  color: var(--color-text-3);
}

.query-steps {
  margin-bottom: 24px;
}

.step-content {
  margin-bottom: 24px;
}

.step-container {
  padding: 16px 0;
}

.step-container h3 {
  margin-bottom: 8px;
  font-size: 18px;
  font-weight: 600;
}

.step-description {
  color: var(--color-text-3);
  margin-bottom: 24px;
}

.form-tip {
  font-size: 12px;
  color: var(--color-text-3);
  margin-top: 4px;
}

.filter-section {
  margin-bottom: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 6px;
}

.customer-name {
  font-weight: 500;
}

.customer-id {
  font-size: 12px;
  color: var(--color-text-3);
}

.query-summary {
  margin-bottom: 24px;
}

.selected-loans {
  margin-bottom: 24px;
}

.selected-loans h4 {
  margin-bottom: 12px;
  font-size: 16px;
  font-weight: 600;
}

.step-actions {
  margin-top: 24px;
  text-align: center;
}

.step-actions .arco-btn {
  min-width: 100px;
}
</style>