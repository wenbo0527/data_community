<template>
  <div class="budget-edit">
    <a-card title="编辑预算">
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
          <a-button type="primary" html-type="submit">保存</a-button>
          <a-button @click="goBack">返回</a-button>
        </a-space>
      </a-form>
    </a-card>
  </div>
 </template>

<script setup lang="ts">
import { reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { budgetApiService } from '@/api/budget'

const route = useRoute()
const router = useRouter()
const form = reactive({
  businessType: '助贷',
  platform: '蚂蚁',
  targetLoan: 0,
  estimatedLoan: 0,
  estimatedCost: 0,
  estimatedAnnualCost: 0,
  estimatedRiskFreeReturn: 0,
  granularity: 'month' as 'year'|'quarter'|'month',
  timeLabel: ''
})
const platformOptions = computed(() => form.businessType === '直贷' ? ['苏贷'] : ['蚂蚁', '字节', '京东'])

onMounted(async () => {
  try {
    const id = String(route.params.id)
    const data = await budgetApiService.getBudget(id)
    form.businessType = (data as any).businessType || '助贷'
    form.platform = (data as any).platform || '蚂蚁'
    form.targetLoan = Number((data as any).targetLoan) || 0
    form.estimatedLoan = Number((data as any).estimatedLoan) || 0
    form.estimatedCost = Number((data as any).estimatedCost) || 0
    form.estimatedAnnualCost = Number((data as any).estimatedAnnualCost) || 0
    form.estimatedRiskFreeReturn = Number((data as any).estimatedRiskFreeReturn) || 0
    form.granularity = (data as any).granularity || 'month'
    form.timeLabel = (data as any).timeLabel || `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}`
  } catch (err) {
    console.error('加载预算失败', err)
    Message.error('加载预算失败')
  }
})

const handleSubmit = async () => {
  try {
    const id = String(route.params.id)
    await budgetApiService.updateBudget(id, {
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
    Message.success('保存成功')
    router.back()
  } catch (err) {
    console.error('保存失败', err)
    Message.error('保存失败')
  }
}

const goBack = () => router.back()
</script>

<style scoped>
.budget-edit { max-width: 560px; }
</style>
