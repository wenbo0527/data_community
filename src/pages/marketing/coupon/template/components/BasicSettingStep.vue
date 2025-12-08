<template>
  <div class="basic-setting-step">
    <a-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      layout="vertical"
      :style="{ width: '100%' }"
    >
      <admission-form :form-data="formData" />

      <a-grid :cols="2" :col-gap="16" :row-gap="16">
        <a-grid-item>
          <a-form-item field="firstUseOnly" label="是否仅限首次支用" required>
            <a-radio-group v-model="formData.firstUseOnly">
              <a-radio :value="true">是</a-radio>
              <a-radio :value="false">否</a-radio>
            </a-radio-group>
          </a-form-item>
        </a-grid-item>

        <a-grid-item>
          <a-form-item field="products" label="贷款产品" required>
            <a-select
              v-model="formData.products"
              placeholder="请选择贷款产品"
              multiple
              allow-clear
              style="width: 100%"
            >
              <a-option
                v-for="product in productOptions"
                :key="product.value"
                :value="product.value"
              >{{ product.label }}</a-option>
            </a-select>
          </a-form-item>
        </a-grid-item>
      </a-grid>

      <a-grid :cols="2" :col-gap="16" :row-gap="16">
        <a-grid-item span="2">
          <a-form-item field="repaymentMethods" label="还款方式" required>
            <a-select
              v-model="formData.repaymentMethods"
              placeholder="请选择还款方式"
              multiple
              allow-clear
              style="width: 100%"
            >
              <a-option value="unlimited">不限</a-option>
              <a-option value="equal_principal">等额本金</a-option>
              <a-option value="equal_installment">等额本息</a-option>
              <a-option value="interest_first">先息后本</a-option>
              <a-option value="one_time">一次性还本付息</a-option>
              <a-option value="flexible">随借随还</a-option>
            </a-select>
          </a-form-item>
        </a-grid-item>
      </a-grid>

      <a-grid :cols="2" :col-gap="16" :row-gap="16">
        <a-grid-item>
          <a-form-item field="loanPeriod" label="借款期数" required>
            <a-radio-group v-model="formData.loanPeriodType">
              <a-radio value="unlimited">不限</a-radio>
              <a-radio value="gte">≥</a-radio>
              <a-radio value="lte">≤</a-radio>
              <a-radio value="range">区间</a-radio>
            </a-radio-group>
            <div v-if="formData.loanPeriodType !== 'unlimited'" style="margin-top: 8px">
              <a-space v-if="formData.loanPeriodType === 'range'">
                <a-input-number
                  v-model="formData.loanPeriodMin"
                  :min="1"
                  placeholder="最小期数"
                  style="width: 120px"
                />
                <span>-</span>
                <a-input-number
                  v-model="formData.loanPeriodMax"
                  :min="formData.loanPeriodMin || 1"
                  placeholder="最大期数"
                  style="width: 120px"
                />
              </a-space>
              <a-input-number
                v-else
                v-model="formData.loanPeriodValue"
                :min="1"
                placeholder="期数"
                style="width: 120px"
              />
              <span style="margin-left: 8px">期</span>
            </div>
          </a-form-item>
        </a-grid-item>

        <a-grid-item>
          <a-form-item field="loanAmount" label="适用金额" required>
            <template #help>
              <span class="help-text">请设置优惠券可使用的借款金额范围</span>
            </template>
            <a-space>
              <a-input-number
                v-model="formData.loanAmountMin"
                :min="0"
                :precision="0"
                placeholder="最低金额"
                style="width: 120px"
              />
              <span>-</span>
              <a-input-number
                v-model="formData.loanAmountMax"
                :min="formData.loanAmountMin || 0"
                :precision="0"
                placeholder="最高金额"
                style="width: 120px"
              />
              <span>元</span>
            </a-space>
          </a-form-item>
        </a-grid-item>
      </a-grid>

      <a-grid :cols="2" :col-gap="16" :row-gap="16">
        <a-grid-item>
          <a-form-item field="useChannels" label="使用渠道" required>
            <template #help>
              <span class="help-text">选择优惠券可以使用的渠道，可多选</span>
            </template>
            <a-select
              v-model="formData.useChannels"
              placeholder="请选择使用渠道"
              multiple
              allow-clear
              style="width: 100%"
            >
              <a-option value="unlimited">不限</a-option>
              <a-option value="app">APP</a-option>
              <a-option value="miniprogram">微信小程序</a-option>
              <a-option value="alipay_miniprogram">支付宝小程序</a-option>
              <a-option value="h5">H5页面</a-option>
              <a-option value="web">PC网页</a-option>
              <a-option value="offline">线下网点</a-option>
            </a-select>
          </a-form-item>
        </a-grid-item>

        <a-grid-item>
          <a-form-item field="creditChannels" label="授信渠道" required>
            <template #help>
              <span class="help-text">选择优惠券可以授信的渠道，可多选</span>
            </template>
            <a-select
              v-model="formData.creditChannels"
              placeholder="请选择授信渠道"
              multiple
              allow-clear
              style="width: 100%"
            >
              <a-option value="unlimited">不限</a-option>
              <a-option value="app">APP</a-option>
              <a-option value="miniprogram">微信小程序</a-option>
              <a-option value="alipay_miniprogram">支付宝小程序</a-option>
              <a-option value="h5">H5页面</a-option>
              <a-option value="web">PC网页</a-option>
              <a-option value="offline">线下网点</a-option>
              <a-option value="third_party">第三方渠道</a-option>
            </a-select>
          </a-form-item>
        </a-grid-item>
      </a-grid>

      <interest-free-form :form-data="formData" />
      <discount-form :form-data="formData" />
      <lock-form :form-data="formData" />

      <div class="footer-actions">
        <a-space>
          <a-button @click="handleCancel">取消</a-button>
          <a-button type="primary" @click="handleNext">下一步</a-button>
        </a-space>
      </div>
    </a-form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Message } from '@arco-design/web-vue'
import { useRouter } from 'vue-router'
import { goBack } from '@/router/utils'
import AdmissionForm from './AdmissionForm.vue'
import InterestFreeForm from './InterestFreeForm.vue'
import DiscountForm from './DiscountForm.vue'
import LockForm from './LockForm.vue'

const router = useRouter()
const emit = defineEmits(['next', 'cancel'])

// 表单引用
const formRef = ref(null)

// 产品选项数据
const productOptions = [
  { label: '个人消费贷款', value: 'PERSONAL_LOAN' },
  { label: '小微经营贷款', value: 'BUSINESS_LOAN' },
  { label: '房屋抵押贷款', value: 'MORTGAGE_LOAN' },
  { label: '汽车消费贷款', value: 'CAR_LOAN' },
  { label: '信用卡分期', value: 'CREDIT_CARD_INSTALLMENT' },
  { label: '教育助学贷款', value: 'EDUCATION_LOAN' },
]

// Props
const props = defineProps({
  formData: {
    type: Object,
    required: true
  }
})

// 表单验证规则
const rules = {
  products: [{ required: true, message: '请选择贷款产品' }],
  repaymentMethods: [{ required: true, message: '请选择还款方式' }],
  loanAmountMin: [{ required: true, message: '请输入最低金额' }],
  loanAmountMax: [{ required: true, message: '请输入最高金额' }],
  useChannels: [{ required: true, message: '请选择使用渠道' }],
  creditChannels: [{ required: true, message: '请选择授信渠道' }],
  interestFreeDays: [{ required: true, message: '请输入免息天数' }],
  maxInterestFreeAmount: [{ required: true, message: '请输入最大免息金额' }],
  uniformDiscount: [{ 
    required: true, 
    message: '请输入折扣率',
    validator: (value) => props.formData.discountType !== 'uniform' || value !== null
  }],
  frontPeriods: [{
    required: true,
    message: '请输入前期期数',
    validator: (value) => props.formData.discountType !== 'different' || value !== null
  }],
  frontDiscount: [{
    required: true,
    message: '请输入前期折扣率',
    validator: (value) => props.formData.discountType !== 'different' || value !== null
  }],
  backPeriods: [{
    required: true,
    message: '请输入后期期数',
    validator: (value) => props.formData.discountType !== 'different' || value !== null
  }],
  backDiscount: [{
    required: true,
    message: '请输入后期折扣率',
    validator: (value) => props.formData.discountType !== 'different' || value !== null
  }],
  fixedFrontPeriods: [{
    required: true,
    message: '请输入前期期数',
    validator: (value) => props.formData.discountType !== 'fixed' || value !== null
  }],
  fixedFrontValue: [{
    required: true,
    message: '请输入前期固定值',
    validator: (value) => props.formData.discountType !== 'fixed' || value !== null
  }]
}

// 表单提交处理
const handleNext = async () => {
  try {
    await formRef.value.validate()
    emit('next')
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

// 取消处理
const handleCancel = () => {
  emit('cancel')
  goBack(router, '/marketing/coupon/template')
}
</script>
