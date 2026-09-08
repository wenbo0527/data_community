<template>
  <div class="preview-step">
    <a-card class="preview-card">
      <template #title>
        <div class="section-title">
          <div class="title-icon preview-icon"></div>
          <span class="title-text">优惠券预览</span>
          <a-tooltip position="right">
            <span class="title-help">?</span>
            <template #content>预览优惠券的最终效果，确认无误后提交创建</template>
          </a-tooltip>
        </div>
      </template>

      <div class="preview-content">
        <a-descriptions :data="previewData" layout="inline-vertical" bordered />
      </div>

      <div class="footer-actions">
        <a-space>
          <a-button @click="handlePrev">上一步</a-button>
          <a-button type="primary" @click="handleSubmit">确定</a-button>
        </a-space>
      </div>
    </a-card>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Message } from '@arco-design/web-vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const emit = defineEmits(['prev'])

const props = defineProps({
  formData: {
    type: Object,
    required: true
  }
})

// 预览数据
const previewData = computed(() => {
  const data = [
    {
      label: '准入参数',
      value: [
        { label: '首次支用限制', value: props.formData.firstUseOnly ? '是' : '否' },
        { label: '贷款产品', value: props.formData.products.join('、') || '未选择' },
        { label: '还款方式', value: props.formData.repaymentMethods.join('、') || '未选择' },
        {
          label: '借款期数',
          value: formatLoanPeriod(props.formData)
        },
        {
          label: '适用金额',
          value: `${props.formData.loanAmountMin || 0} - ${props.formData.loanAmountMax || 0}元`
        },
        { label: '使用渠道', value: props.formData.useChannels.join('、') || '未选择' },
        { label: '授信渠道', value: props.formData.creditChannels.join('、') || '未选择' }
      ]
    },
    {
      label: '免息优惠',
      value: [
        { label: '免息天数', value: `${props.formData.interestFreeDays || 0}天` },
        { label: '最大免息金额', value: `${props.formData.maxInterestFreeAmount || 0}元` }
      ]
    },
    {
      label: '折扣优惠',
      value: formatDiscountInfo(props.formData)
    },
    {
      label: '锁定规则',
      value: formatLockInfo(props.formData)
    }
  ]

  return data
})

// 格式化借款期数显示
const formatLoanPeriod = (data) => {
  if (data.loanPeriodType === 'unlimited') return '不限'
  if (data.loanPeriodType === 'gte') return `≥${data.loanPeriodValue}期`
  if (data.loanPeriodType === 'lte') return `≤${data.loanPeriodValue}期`
  if (data.loanPeriodType === 'range') {
    return `${data.loanPeriodMin || 0} - ${data.loanPeriodMax || 0}期`
  }
  return '未设置'
}

// 格式化折扣信息显示
const formatDiscountInfo = (data) => {
  const info = []
  if (data.discountType === 'uniform') {
    info.push({ label: '统一折扣', value: `${data.uniformDiscount || 0}%` })
  } else if (data.discountType === 'different') {
    info.push(
      { label: '前期期数', value: `${data.frontPeriods || 0}期` },
      { label: '前期折扣', value: `${data.frontDiscount || 0}%` },
      { label: '后期期数', value: `${data.backPeriods || 0}期` },
      { label: '后期折扣', value: `${data.backDiscount || 0}%` }
    )
  } else if (data.discountType === 'fixed') {
    info.push(
      { label: '前期期数', value: `${data.fixedFrontPeriods || 0}期` },
      { label: '前期固定值', value: `${data.fixedFrontValue || 0}元` },
      { label: '后期期数', value: `${data.fixedBackPeriods || 0}期` },
      { label: '后期折扣', value: `${data.fixedBackDiscount || 0}%` }
    )
  }
  if (data.limitMinRate) {
    info.push({ label: '最低利率', value: `${data.minRate || 0}%` })
  }
  return info
}

// 格式化锁定规则显示
const formatLockInfo = (data) => {
  if (!data.hasLockPeriod) return [{ label: '是否锁定', value: '否' }]
  
  return [
    { label: '是否锁定', value: '是' },
    { label: '锁定类型', value: data.lockPeriodType === 'period' ? '期数' : '天数' },
    { label: '锁定值', value: `${data.lockPeriodValue || 0}${data.lockPeriodType === 'period' ? '期' : '天'}` },
    { label: '限制类型', value: data.lockLimitType === 'repayment' ? '还款' : '支用' }
  ]
}

// 返回上一步
const handlePrev = () => {
  emit('prev')
}

// 提交表单
const handleSubmit = async () => {
  try {
    // TODO: 实现表单提交逻辑
    Message.success('创建成功')
    router.push('/marketing/coupon/template')
  } catch (error) {
    console.error('提交失败:', error)
  }
}
</script>

<style scoped>
.preview-card {
  margin-bottom: 16px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-icon {
  width: 20px;
  height: 20px;
  background-color: var(--color-primary-light-4);
  border-radius: 4px;
}

.title-help {
  color: var(--color-text-3);
  cursor: help;
}

.preview-content {
  margin: 16px 0;
}

.footer-actions {
  margin-top: 24px;
  text-align: center;
}
</style>