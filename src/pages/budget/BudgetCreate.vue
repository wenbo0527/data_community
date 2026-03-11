<template>
  <div class="budget-create">
    <a-card title="新建预算">
      <a-form :model="form" layout="vertical" @submit="handleSubmit">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="businessType" label="业务类型" required>
              <a-select v-model="form.businessType" placeholder="选择业务类型">
                <a-option value="助贷">助贷</a-option>
                <a-option value="直贷">直贷</a-option>
                <a-option value="融担">融担</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="platform" label="平台产品" required>
              <a-select v-model="form.platform" :options="platformOptions" placeholder="选择平台" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item field="targetLoan" label="目标贷余" required>
              <a-input-number v-model="form.targetLoan" :min="0" :precision="2" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item field="estimatedLoan" label="预估放款" required>
              <a-input-number v-model="form.estimatedLoan" :min="0" :precision="2" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item field="estimatedCost" label="预估费用" required>
              <a-input-number v-model="form.estimatedCost" :min="0" :precision="2" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="estimatedAnnualCost" label="年化数据成本" required>
              <a-input-number v-model="form.estimatedAnnualCost" :min="0" :max="1" :precision="4" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="estimatedRiskFreeReturn" label="无风险收益" required>
              <a-input-number v-model="form.estimatedRiskFreeReturn" :min="0" :max="1" :precision="4" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item field="granularity" label="预算粒度" required>
              <a-select v-model="form.granularity" placeholder="选择粒度">
                <a-option value="year">年</a-option>
                <a-option value="quarter">季</a-option>
                <a-option value="month">月</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="16">
            <a-form-item field="timeLabel" label="对应时间" required>
              <a-input v-model="form.timeLabel" placeholder="填写 例如 2025 / Q2 / 2025-01" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-space>
          <a-button type="primary" html-type="submit">提交</a-button>
          <a-button @click="handleGoBack">返回</a-button>
        </a-space>
      </a-form>
    </a-card>
  </div>
 </template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { goBack } from '@/router/utils'
import { Message } from '@arco-design/web-vue'
import { budgetApiService } from '../../api/budget'

const router = useRouter()
const form = reactive({
  businessType: '助贷',
  platform: '蚂蚁',
  targetLoan: 900000,
  estimatedLoan: 700000,
  estimatedCost: 50000,
  estimatedAnnualCost: 0.045,
  estimatedRiskFreeReturn: 0.075,
  granularity: 'month' as 'year'|'quarter'|'month',
  timeLabel: `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}`
})

const platformOptions = computed(() => form.businessType === '直贷' ? ['苏贷'] : ['蚂蚁', '字节', '京东'])

const handleSubmit = async () => {
  try {
    await budgetApiService.createBudget({
      businessType: form.businessType,
      platform: form.platform,
      targetLoan: form.targetLoan,
      estimatedLoan: form.estimatedLoan,
      estimatedCost: form.estimatedCost,
      estimatedAnnualCost: form.estimatedAnnualCost,
      estimatedRiskFreeReturn: form.estimatedRiskFreeReturn,
      granularity: form.granularity,
      timeLabel: form.timeLabel
    })
    Message.success('创建成功')
    goBack(router, '/risk/budget/list')
  } catch (err) {
    console.error('创建预算失败', err)
    Message.error('创建失败')
  }
}

const handleGoBack = () => goBack(router, '/risk/budget/list')
</script>

<style scoped>
.budget-create { max-width: 560px; }
</style>
