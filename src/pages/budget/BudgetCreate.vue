<template>
  <div class="budget-create">
    <a-card title="新建预算">
      <template #extra>
        <a-button @click="handleBack">
          <template #icon><icon-arrow-left /></template>
          返回列表
        </a-button>
      </template>

      <a-form
        ref="formRef"
        :model="form"
        :rules="rules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 12 }"
      >
        <a-form-item label="预算名称" field="name">
          <a-input v-model="form.name" placeholder="自动生成：业务类型-平台产品" disabled />
        </a-form-item>

        <a-form-item label="预算年度" field="year">
          <a-select v-model="form.year" placeholder="请选择预算年度">
            <a-option v-for="year in yearOptions" :key="year" :value="year">{{ year }}</a-option>
          </a-select>
        </a-form-item>

        <!-- 移除部门字段 -->

        <a-form-item label="业务类型" field="businessType">
          <a-select v-model="form.businessType" placeholder="请选择业务类型">
            <a-option v-for="type in businessTypes" :key="type.value" :value="type.value">{{ type.label }}</a-option>
          </a-select>
        </a-form-item>

        <a-form-item label="平台产品" field="platformProduct">
          <a-select v-model="form.platformProduct" placeholder="请选择平台产品">
            <a-option v-for="p in platformProducts" :key="p.value" :value="p.value">{{ p.label }}</a-option>
          </a-select>
        </a-form-item>

        <a-form-item label="预算总额(万元)" field="totalAmount">
          <a-input-number
            v-model="form.totalAmount"
            :min="0"
            :precision="2"
            placeholder="请输入预算总额"
            style="width: 100%"
          />
        </a-form-item>

        <a-form-item label="目标贷余(万元)" field="targetLoanBalance">
          <a-input-number v-model="form.targetLoanBalance" :min="0" :precision="2" style="width: 100%" />
        </a-form-item>

        <a-form-item label="预估放款(万元)" field="estimatedLoanAmount">
          <a-input-number v-model="form.estimatedLoanAmount" :min="0" :precision="2" style="width: 100%" />
        </a-form-item>

        <a-form-item label="年化数据成本(万元)" field="annualDataCost">
          <a-input-number v-model="form.annualDataCost" :min="0" :precision="2" style="width: 100%" />
        </a-form-item>

        <a-form-item label="无风险收益(%)" field="riskFreeReturn">
          <a-input-number v-model="form.riskFreeReturn" :min="0" :precision="2" style="width: 100%" />
        </a-form-item>

        <a-form-item label="预算粒度" field="budgetGranularity">
          <a-select v-model="form.budgetGranularity" placeholder="请选择预算粒度">
            <a-option value="yearly">年度</a-option>
            <a-option value="quarterly">季度</a-option>
            <a-option value="monthly">月度</a-option>
          </a-select>
        </a-form-item>

        <a-form-item label="对应时间" field="correspondingTime">
          <a-input v-model="form.correspondingTime" placeholder="例如：2024-Q1 或 2024-05" />
        </a-form-item>

        <a-form-item label="预算描述" field="description">
          <a-textarea v-model="form.description" placeholder="请输入预算描述" :rows="3" />
        </a-form-item>

        <!-- 移除预算科目模块，改为指标字段 -->

        <a-form-item :wrapper-col="{ span: 12, offset: 6 }">
      <a-space>
        <a-button type="primary" html-type="submit" :loading="loading" @click="handleSubmit">
          创建预算
        </a-button>
        <a-button @click="handleReset">重置</a-button>
      </a-space>
    </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { budgetApiService } from '@/api/budget'
import { IconArrowLeft } from '@arco-design/web-vue/es/icon'

const router = useRouter()
const formRef = ref()
const loading = ref(false)

const form = reactive({
  name: '',
  budgetName: '',
  year: '',
  businessType: '',
  platformProduct: '',
  totalAmount: 0,
  targetLoanBalance: 0,
  estimatedLoanAmount: 0,
  annualDataCost: 0,
  riskFreeReturn: 0,
  budgetGranularity: 'monthly',
  correspondingTime: '',
  description: ''
})

const rules = {
  year: [{ required: true, message: '请选择预算年度' }],
  businessType: [{ required: true, message: '请选择业务类型' }],
  platformProduct: [{ required: true, message: '请选择平台产品' }],
  totalAmount: [
    { required: true, message: '请输入预算总额' },
    { type: 'number', min: 0, message: '预算总额必须大于等于0' }
  ]
}

const yearOptions = ref([])
const businessTypes = ref([])
const platformProducts = ref([])

const handleSubmit = async ({ errors }) => {
  if (errors) return
  
  loading.value = true
  try {
    // 保证预算名称规则：业务类型-平台产品
    form.name = `${form.businessType || ''}-${form.platformProduct || ''}`
    form.budgetName = form.name
    await budgetApiService.createBudget({ ...form })
    Message.success('预算创建成功')
    router.push('/budget/overview')
  } catch (error) {
    Message.error('预算创建失败')
    console.error('创建预算失败:', error)
  } finally {
    loading.value = false
  }
}

const handleReset = () => {
  formRef.value.resetFields()
  // 重置
  Object.assign(form, {
    name: '',
    budgetName: '',
    year: '',
    businessType: '',
    platformProduct: '',
    totalAmount: 0,
    targetLoanBalance: 0,
    estimatedLoanAmount: 0,
    annualDataCost: 0,
    riskFreeReturn: 0,
    budgetGranularity: 'monthly',
    correspondingTime: '',
    description: ''
  })
}

const handleBack = () => {
  router.push('/budget/overview')
}

onMounted(async () => {
  // 初始化选项数据
  const currentYear = new Date().getFullYear()
  yearOptions.value = [currentYear - 1, currentYear, currentYear + 1]
  
  businessTypes.value = [
    { value: 'operational', label: '运营费用' },
    { value: 'project', label: '项目费用' },
    { value: 'marketing', label: '市场费用' },
    { value: 'admin', label: '管理费用' }
  ]
  platformProducts.value = [
    { value: '美团', label: '美团' },
    { value: '字节', label: '字节' },
    { value: '京东', label: '京东' }
  ]
})

// 自动生成预算名称
watch([
  () => form.businessType,
  () => form.platformProduct
], () => {
  form.name = `${form.businessType || ''}-${form.platformProduct || ''}`
  form.budgetName = form.name
})
</script>

<style scoped>
.budget-create {
  padding: 20px;
}

.budget-items {
  border: 1px solid #e5e6eb;
  border-radius: 4px;
  padding: 10px;
}
</style>