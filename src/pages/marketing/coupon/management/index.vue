<template>
  <div class="coupon-container">
      <h2>券库存管理</h2>
    <div class="header-actions">
      <a-space>
        <a-input-search v-model="searchKeyword" placeholder="搜索券名称" style="width: 300px" @search="handleSearch" />
        <a-button type="primary" @click="showCreateModal = true">
          <template #icon>
            <icon-plus />
          </template>


          新建券
        </a-button>
      </a-space>
    </div>

    <a-table :data="tableData" :loading="loading" :pagination="pagination" @page-change="onPageChange"
      @page-size-change="onPageSizeChange">
      <template #columns>
        <a-table-column title="券库存ID" data-index="id" />
        <a-table-column title="券名称" data-index="name">
          <template #cell="{ record }">
            <a-link @click="handleViewDetail(record)" style="color: rgb(var(--primary-6))">
              {{ record.name }}
            </a-link>
          </template>
        </a-table-column>
        <a-table-column title="券类型" data-index="type">
          <template #cell="{ record }">
            <a-tag :color="record.type === '满减券' ? 'blue' : 'green'">
              {{ record.type }}
            </a-tag>
          </template>
        </a-table-column>
        <a-table-column title="库存" data-index="stock" />
        <a-table-column title="未领取" data-index="unclaimed" />
        <a-table-column title="已领取" data-index="claimed" />
        <a-table-column title="已锁定" data-index="locked" />
        <a-table-column title="已核销" data-index="verified" />
        <a-table-column title="已过期" data-index="expired" />
        <a-table-column title="已作废" data-index="invalid" />
        <a-table-column title="有效期" data-index="validity">
          <template #cell="{ record }">
            {{ new Date(record.startTime).toISOString().split('T')[0] }} - {{ new Date(record.endTime).toISOString().split('T')[0] }}
          </template>
        </a-table-column>
        <a-table-column title="状态" data-index="status">
          <template #cell="{ record }">
            <a-tag :color="getStatusColor(record.status)">
              {{ record.status }}
            </a-tag>
          </template>
        </a-table-column>

        <a-table-column title="录入员" data-index="operator">
          <template #cell="{ record }">
            {{ record.operator }}
          </template>
        </a-table-column>
        <a-table-column title="操作" fixed="right" :width="150">
          <template #cell="{ record }">
            <a-space>
              <template v-if="record.status === '草稿'">
                <a-button type="text" size="small" @click="handleEdit(record)">编辑</a-button>
                <a-button type="text" size="small" @click="handleOnline(record)">上线</a-button>
                <a-button type="text" size="small" status="danger" @click="handleDelete(record)">删除</a-button>
              </template>
              <template v-else-if="record.status === '待审核'">
                <a-button type="text" size="small" @click="handleWithdraw(record)">撤回</a-button>
              </template>
              <template v-else-if="record.status === '生效中'">
                <a-button type="text" size="small" @click="handleViewDetail(record)">详情</a-button>
                <a-button type="text" size="small" @click="handlePause(record)">暂停</a-button>
              </template>
            </a-space>
          </template>


        </a-table-column>
      </template>


    </a-table>


    
    <!-- 创建券弹窗 -->
    <a-modal v-model:visible="showCreateModal" title="创建券库存" @cancel="resetForm" @before-ok="handleSubmit" :footer="false"
      :width="800">
      <div class="create-coupon-container">
        <div class="page-header">
          <h2 class="page-title">创建券库存</h2>
        </div>

        <a-form ref="formRef" :model="formData" :rules="rules" layout="vertical" :style="{ maxWidth: '720px' }">
          <a-card class="section-card">
            <a-grid :cols="2" :col-gap="16" :row-gap="16">
              <a-grid-item>
                <a-form-item field="templateId" label="券模版" required>
                  <template #help>
                    <span class="help-text">选择合适的券模版作为基础配置</span>
                  </template>
                  <a-select v-model="formData.templateId" placeholder="请选择券模版" allow-clear
                    @change="handleTemplateChange">
                    <a-option v-for="template in templateOptions" :key="template.id" :value="template.id">
                      {{ template.name }}
                    </a-option>
                  </a-select>
                </a-form-item>
              </a-grid-item>

              <a-grid-item>
                <a-form-item field="auditor" label="审核员" required>
                  <template #help>
                    <span class="help-text">选择负责审核该券的人员</span>
                  </template>
                  <a-select v-model="formData.auditor" placeholder="请选择审核员" allow-clear>
                    <a-option v-for="user in auditorOptions" :key="user.id" :value="user.id">
                      {{ user.name }}
                    </a-option>
                  </a-select>
                </a-form-item>
              </a-grid-item>

              <a-grid-item>
                <a-form-item field="operator" label="录入员" required>
                  <template #help>
                    <span class="help-text">当前登录用户</span>
                  </template>
                  <a-input v-model="formData.operator" readonly disabled />
                </a-form-item>
              </a-grid-item>

              <a-grid-item>
                <a-form-item field="name" label="券名称" required>
                  <template #help>
                    <span class="help-text">设置便于识别的券名称，最多50个字符</span>
                  </template>
                  <a-input v-model="formData.name" placeholder="请输入券名称" allow-clear />
                </a-form-item>
              </a-grid-item>

              <a-grid-item>
                <a-form-item field="totalCount" label="发放数量" required>
                  <template #help>
                    <span class="help-text">设置本次创建的券的发放数量</span>
                  </template>
                  <a-input-number v-model="formData.totalCount" placeholder="请输入发放数量" :min="1" :max="999999"
                    :step="1" />
                </a-form-item>
              </a-grid-item>
              <a-grid-item>
                <a-form-item field="dailyLimit" label="单日发放上限">
                  <template #help>
                    <span class="help-text">选填项：设置每日最大发放数量</span>
                  </template>
                  <a-input-number v-model="formData.dailyLimit" placeholder="请输入单日发放上限" :min="1"
                    :max="formData.totalCount" :step="1" />
                </a-form-item>
              </a-grid-item>
              <a-grid-item>
                <a-form-item field="weeklyLimit" label="单周发放上限">
                  <template #help>
                    <span class="help-text">选填项：设置每周最大发放数量</span>
                  </template>
                  <a-input-number v-model="formData.weeklyLimit" placeholder="请输入单周发放上限" :min="1"
                    :max="formData.totalCount" :step="1" />
                </a-form-item>
              </a-grid-item>
              <a-grid-item>
                <a-form-item field="monthlyLimit" label="单月发放上限">
                  <template #help>
                    <span class="help-text">选填项：设置每月最大发放数量</span>
                  </template>
                  <a-input-number v-model="formData.monthlyLimit" placeholder="请输入单月发放上限" :min="1"
                    :max="formData.totalCount" :step="1" />
                </a-form-item>
              </a-grid-item>
              <a-grid-item :span="24">
                <a-alert type="info">
                  <template #icon>
                    <icon-info-circle />
                    【规则提示】相同名称的优惠券每个用户仅可领取一次
                  </template>
                  {{ formData.userLimitDesc }}
                </a-alert>
              </a-grid-item>

              <a-grid-item>
                <a-form-item field="validityType" label="有效期类型" required>
                  <template #help>
                    <span class="help-text">选择券的有效期类型</span>
                  </template>
                  <a-radio-group v-model="formData.validityType">
                    <a-radio value="absolute">绝对有效期</a-radio>
                    <a-radio value="relative">相对有效期</a-radio>
                  </a-radio-group>
                </a-form-item>
                <a-form-item field="validity" label="有效期" required>
                  <template #help>
                    <span class="help-text">设置券的可用时间范围</span>
                  </template>
                  <a-range-picker v-model="formData.validity" show-time style="width: 100%" />
                </a-form-item>
                <a-form-item v-if="formData.validityType === 'relative'" field="relativeDays" label="相对有效期" required>
                  <template #help>
                    <span class="help-text">设置券的相对有效期天数，最长不超过45天</span>
                  </template>
                  <a-input-number v-model="formData.relativeDays" :min="1" :max="45" :step="1" style="width: 100%" />
                </a-form-item>
              </a-grid-item>
            </a-grid>

            <a-form-item field="rules" label="使用规则说明">
              <template #help>
                <span class="help-text">详细描述券的使用条件和限制，便于用户理解</span>
              </template>
              <a-textarea v-model="formData.rules" placeholder="请输入使用规则说明" :max-length="200" show-word-limit />
            </a-form-item>
          </a-card>
        </a-form>

        <div class="form-actions">
          <a-space>
            <a-button type="primary" @click="handleSubmit">确认创建</a-button>
            <a-button @click="resetForm">取消</a-button>
          </a-space>
        </div>
      </div>
    </a-modal>
  </div>
</template>



<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Message, Modal } from '@arco-design/web-vue'
import { IconPlus, IconInfoCircle } from '@arco-design/web-vue/es/icon'
import { useUserStore } from '@/store'
import { couponMockData, templateMockData } from '@/mock/coupon'

const router = useRouter()
const userStore = useUserStore()

// 表格数据
const tableData = ref([])
const loading = ref(false)
const searchKeyword = ref('')
const detailModalVisible = ref(false)
const currentDetail = ref([])
const instanceParams = ref([])
const baseParams = ref([])
const interestFreeParams = ref([])
const discountParams = ref([])
const lockParams = ref([])

// 步骤控制
const currentStep = ref(1)
const nextStep = async () => {
  const form = formRef.value
  if (!form) return

  try {
    // 根据当前步骤验证对应的字段
    const validateFields = currentStep.value === 1
      ? ['templateId', 'name', 'totalCount']
      : ['rules', 'validity']

    await form.validate(validateFields)
    currentStep.value++
  } catch (error) {
    // 验证失败不跳转
    return false
  }
}

// 预览数据
const previewData = computed(() => [
  {
    label: '券模版',
    value: templateOptions.value.find(t => t.id === formData.value?.templateId)?.name || '-'
  },
  {
    label: '券名称',
    value: formData.value?.name || '-'
  },
  {
    label: '发放数量',
    value: formData.value?.totalCount || '-'
  },
  {
    label: '使用规则',
    value: formData.value?.rules || '-'
  },
  {
    label: '有效期',
    value: formData.value?.validity?.length
      ? `${formData.value.validity[0]} 至 ${formData.value.validity[1]}`
      : '-'
  }
])

// 分页配置
const pagination = ref({
  total: 0,
  current: 1,
  pageSize: 10,
  showTotal: true,
  showJumper: true,
  showPageSize: true,
})

// 创建券相关
const showCreateModal = ref(false)
const formRef = ref(null)
const templateOptions = ref([])

const handleViewDetail = (record) => {
  router.push({
    path: '/marketing/coupon/management/detail',
    query: {
      templateId: record.templateId,
      instanceId: record.id
    }
  })
}

// 审批弹窗
const showApproveModal = ref(false)
const currentApproveRecord = ref({})

const handleApproveModal = (record) => {
  currentApproveRecord.value = record
  showApproveModal.value = true
}

const handleApprove = (record) => {
  Modal.confirm({
    title: '确认审批',
    content: `确定要通过审批「${record.name}」吗？`,
    onOk: async () => {
      try {
        // TODO: 调用接口更新状态
        Message.success('审批成功')
        showApproveModal.value = false
        fetchData()
      } catch (error) {
        Message.error('审批失败')
      }
    }
  })
}

// 审核员和录入员选项
const auditorOptions = ref([
  { id: 'A001', name: '张三' },
  { id: 'A002', name: '李四' },
  { id: 'A003', name: '王五' }
])

const operatorOptions = ref([
  { id: 'O001', name: '赵六' },
  { id: 'O002', name: '钱七' },
  { id: 'O003', name: '孙八' }
])

// 表单数据
const formData = ref({
  templateId: '',
  name: '',
  totalCount: 1000,
  dailyLimit: 100, // 单日发放上限
  weeklyLimit: 500, // 单周发放上限
  monthlyLimit: 2000, // 单月发放上限
  rules: '',
  validityType: 'absolute', // 有效期类型：absolute-绝对有效期，relative-相对有效期
  validity: [], // 绝对有效期
  relativeDays: 1, // 相对有效期天数
  auditor: '',
  operator: userStore.userInfo.username, // 默认设置为当前登录用户
  validityPeriod: [],
  userLimitDesc: '' // 用户持券限制说明
})

const rules = {
  templateId: [{ required: true, message: '请选择券模版' }],
  name: [
    { required: true, message: '请输入券名称' },
    { maxLength: 50, message: '名称长度不能超过50个字符' }
  ],
  totalCount: [{ required: true, message: '请输入发放数量' }],
  validityType: [{ required: true, message: '请选择有效期类型' }],
  validity: [{ required: true, message: '请选择有效期' }],
  relativeDays: [{ required: true, message: '请输入相对有效期天数' }],
  auditor: [{ required: true, message: '请选择审核员' }],
  operator: [{ required: true, message: '请选择录入员' }],
  validityPeriod: [{ required: true, message: '请选择有效期' }]
}

// 定时器ID
const timerId = ref(null)

// 清理函数
const cleanup = () => {
  if (timerId.value) {
    clearTimeout(timerId.value)
    timerId.value = null
  }
}

// 获取表格数据
const fetchData = async () => {
  if (loading.value) return
  loading.value = true
  cleanup() // 清理之前的定时器

  const timeoutPromise = new Promise((_, reject) => {
    timerId.value = setTimeout(() => {
      reject(new Error('请求超时'))
    }, 5000) // 5秒超时保护
  })

  try {
    const dataPromise = new Promise(resolve => {
      setTimeout(() => {
        // TODO: 调用接口获取数据
        const mockData = couponMockData
        resolve(mockData)
      }, 300)
    })

    const data = await Promise.race([dataPromise, timeoutPromise])
    tableData.value = data
    pagination.value.total = 100
  } catch (error) {
    Message.error(error.message || '获取数据失败')
  } finally {
    loading.value = false
    cleanup() // 请求完成后清理定时器
  }
}

onMounted(() => {
  fetchData()
  fetchTemplateOptions()
})

onUnmounted(() => {
  cleanup()
})

// 搜索
const handleSearch = () => {
  pagination.value.current = 1
  fetchData()
}

// 分页变化
const onPageChange = (current) => {
  pagination.value.current = current
  fetchData()
}

const onPageSizeChange = (pageSize) => {
  pagination.value.pageSize = pageSize
  pagination.value.current = 1
  fetchData()
}

// 获取状态颜色
const getStatusColor = (status) => {
  const colorMap = {
    '草稿': 'gray',
    '待审核': 'blue',
    '生效中': 'green',
    '票劵停发': 'orange',
    '票劵失效': 'gray'
  }
  return colorMap[status] || 'blue'
}

// 获取券模版选项
const fetchTemplateOptions = async () => {
  try {
    // 从mock数据中获取券模版列表
    const { templateMockData } = await import('@/mock/coupon')
    templateOptions.value = templateMockData.map(template => ({
      id: template.id,
      name: template.name
    }))
  } catch (error) {
    Message.error('获取券模版失败')
  }
}

// 选择模版后自动填充名称
const handleTemplateChange = (templateId) => {
  const template = templateOptions.value.find(t => t.id === templateId)
  if (template) {
    formData.value.name = `${template.name}-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}`
  }
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
    Message.success('创建成功')
    resetForm()
    fetchData()
    return true
  } catch (error) {
    Message.error('创建失败')
    return false
  }
}

// 暂停/启用券
const handlePause = (record) => {
  const action = record.status === '已暂停' ? '启用' : '暂停'
  Modal.warning({
    title: `确认${action}`,
    content: `确定要${action}「${record.name}」吗？`,
    onOk: async () => {
      try {
        // TODO: 调用接口更新状态
        Message.success(`${action}成功`)
        fetchData()
      } catch (error) {
        Message.error(`${action}失败`)
      }
    }
  })
}

// 编辑券
const handleEdit = (record) => {
  // TODO: 跳转到编辑页面
  router.push(`/marketing/coupon/management/edit/${record.id}`);
};

// 上线券
const handleOnline = (record) => {
  Modal.confirm({
    title: '确认上线',
    content: `
      确定要上线「${record.name}」吗？
        审核人：${auditorOptions.value.find(a => a.id === record.auditor)?.name || '未指定'}
      
    `,
    onOk: async () => {
      try {
        // TODO: 调用上线接口
        Message.success('上线成功');
        fetchData();
      } catch (error) {
        Message.error('上线失败');
      }
    }
  });
};

// 撤回审核
const handleWithdraw = (record) => {
  Modal.confirm({
    title: '确认撤回',
    content: `确定要撤回「${record.name}」的审核申请吗？`,
    onOk: async () => {
      try {
        // TODO: 调用撤回接口
        Message.success('撤回成功');
        fetchData();
      } catch (error) {
        Message.error('撤回失败');
      }
    }
  });
};


const handleReject = (record) => {
  Modal.confirm({
    title: '确认拒绝',
    content: `确定要拒绝「${record.name}」吗？`,
    okText: '确认拒绝',
    cancelText: '取消',
    onOk: async () => {
      try {
        // TODO: 调用接口更新状态
        Message.success('已拒绝')
        showApproveModal.value = false
        fetchData()
      } catch (error) {
        Message.error('拒绝失败')
      }
    }
  })
}

// 删除券
// 处理行双击事件
const handleRowDblClick = (record) => {
  currentDetail.value = record
  detailModalVisible.value = true
  
  // 获取关联的券模版信息
  const template = templateMockData.find(t => t.id === record.templateId)
  
  instanceParams.value = [
    { label: '券ID', value: record.id },
    { label: '券名称', value: record.name },
    { label: '券类型', value: record.type },
    { label: '关联模版', value: template?.name || '无' },
    { label: '状态', value: record.status },
    { label: '创建时间', value: record.createTime },
    { label: '录入员', value: record.operator },
    { label: '审核员', value: record.auditor },
    { label: '模版描述', value: template?.description || '无' },
    { label: '适用产品', value: template?.products?.join(', ') || '无' }
  ]
  
  instanceParams.value = [
    { label: '券ID', value: record.id },
    { label: '券名称', value: record.name },
    { label: '券类型', value: record.type },
    { label: '关联模版', value: template?.name || '无' },
    { label: '状态', value: record.status },
    { label: '创建时间', value: record.createTime },
    { label: '录入员', value: record.operator },
    { label: '审核员', value: record.auditor },
    { label: '模版描述', value: template?.description || '无' },
    { label: '适用产品', value: template?.products?.join(', ') || '无' },
    { label: '还款方式', value: template?.repaymentMethods?.join(', ') || '无' }
  ]
  
  baseParams.value = [
    { label: '总数量', value: record.totalCount },
    { label: '库存', value: record.stock },
    { label: '未领取', value: record.unclaimed },
    { label: '已领取', value: record.claimed },
    { label: '已锁定', value: record.locked },
    { label: '已核销', value: record.verified },
    { label: '已过期', value: record.expired },
    { label: '已作废', value: record.invalid },
    { label: '使用规则', value: record.rules },
    { label: '有效期', value: `${record.validityStartTime} - ${record.validityEndTime}` }
  ]
  
  if (record.type === '免息券') {
    interestFreeParams.value = [
      { label: '免息天数', value: record.templateId === 1 ? 30 : 90 },
      { label: '借款金额范围', value: `${record.templateId === 1 ? '10,000-100,000' : '50,000-200,000'}` }
    ]
  } else if (record.type === '折扣券') {
    discountParams.value = [
      { label: '折扣率', value: record.templateId === 3 ? '8折' : '7折' },
      { label: '借款金额范围', value: record.templateId === 3 ? '5,000-50,000' : '100,000-500,000' }
    ]
  }
}

const handleDelete = (record) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除券包「${record.name}」吗？`,
    onOk: async () => {
      try {
        // TODO: 调用删除接口
        Message.success('删除成功');
        await fetchData();
      } catch (error) {
        Message.error('删除失败');
      }
    }
  });
};

onMounted(() => {
  fetchData();
  fetchTemplateOptions();
})
</script>

<style scoped>
.coupon-package-container {
  padding: 20px;
}

.header-actions {
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
}
</style>