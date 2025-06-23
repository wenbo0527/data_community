<template>
  <div class="coupon-template-create">
    <a-card class="form-card">
      <div class="page-header">
        <h2 class="page-title">{{ mode === 'view' ? '优惠券模板详情' : '创建优惠券模板' }}</h2>
        <a-button v-if="mode === 'view' && !disableOperations" type="outline" @click="router.back()" style="margin-left: auto">
          <template #icon><icon-left /></template>
          返回
        </a-button>
      </div>
      <a-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        layout="vertical"
        :style="{ maxWidth: '800px' }"
        :disabled="mode === 'view' || readonly"
      >
        <a-form-item field="name" label="优惠券名称" required>
          <a-input v-model="formData.name" placeholder="请输入优惠券名称" />
        </a-form-item>

        <a-form-item field="type" label="优惠券类型" required>
          <a-radio-group v-model="formData.type">
            <a-radio value="interest_free">免息券</a-radio>
            <a-radio value="discount">折扣券</a-radio>
          </a-radio-group>
        </a-form-item>

        <interest-free-form v-if="formData.type === 'interest_free'" :form-data="formData" />
        <discount-form v-if="formData.type === 'discount'" :form-data="formData" />

        <a-form-item field="validityPeriodType" label="有效期" required>
          <a-radio-group v-model="formData.validityPeriodType">
            <a-radio value="limited">有期限</a-radio>
            <a-radio value="unlimited">无期限</a-radio>
          </a-radio-group>
          <div v-if="formData.validityPeriodType === 'limited'" style="margin-top: 8px">
            <a-range-picker
              v-model="formData.validityPeriod"
              style="width: 100%"
            />
          </div>
        </a-form-item>

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
            <a-form-item field="stackable" label="是否支持叠加" required>
              <a-radio-group v-model="formData.stackable">
                <a-radio :value="true">是</a-radio>
                <a-radio :value="false">否</a-radio>
              </a-radio-group>
            </a-form-item>
          </a-grid-item>
        </a-grid>

        <a-grid :cols="2" :col-gap="16" :row-gap="16">
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
          <a-grid-item :span="2">
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
            <a-button type="primary" @click="handleSubmit">确定</a-button>
            <a-button type="primary" status="success" @click="handleSubmitAndCreate">上线并创建库存</a-button>
          </a-space>
        </div>
      </a-form>
    </a-card>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  mode: {
    type: String,
    default: 'create'
  },
  id: {
    type: String,
    default: ''
  },
  disableOperations: {
    type: Boolean,
    default: false
  }
})
import { ref, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconLeft } from '@arco-design/web-vue/es/icon'
import { useRouter, useRoute } from 'vue-router'
import InterestFreeForm from './components/InterestFreeForm.vue'
import DiscountForm from './components/DiscountForm.vue'
import LockForm from './components/LockForm.vue'

const router = useRouter()
const route = useRoute()
const mode = ref(route.query.mode || 'create')
const readonly = ref(route.query.readonly === 'true')


const formRef = ref()

// 产品选项
const productOptions = [
  { label: '自营APP', value: 'SELF_APP' }
]

// 表单数据
const formData = ref<{
  id: string
  name: string
  type: string
  description: string
  validityPeriodType: string
  validityPeriod: [Date, Date] | undefined
  firstUseOnly: boolean
  stackable: boolean
  products: string[]
  repaymentMethods: string[]
  loanPeriodType: string
  loanPeriodMin: number | undefined
  loanPeriodMax: number | undefined
  loanPeriodValue: number | undefined
  loanAmountMin: number | undefined
  loanAmountMax: number | undefined
  useChannels: string[]
  creditChannels: string[]
  interestFreeDays: number | undefined
  maxInterestFreeAmount: number | undefined
  discountType: string
  uniformDiscount: number | undefined
  frontPeriods: number | undefined
  frontDiscount: number | undefined
  backPeriods: number | undefined
  backDiscount: number | undefined
  fixedFrontPeriods: number | undefined
  fixedFrontValue: number | undefined
  fixedBackPeriods: number | undefined
  fixedBackDiscount: number | undefined
  limitMinRate: boolean
  minRate: number | undefined
}>({  
  id: '',
  name: '',
  type: '',
  description: '',
  validityPeriodType: 'limited',
  validityPeriod: undefined,
  firstUseOnly: false,
  stackable: false,
  products: [],
  repaymentMethods: [],
  loanPeriodType: 'unlimited',
  loanPeriodMin: undefined,
  loanPeriodMax: undefined,
  loanPeriodValue: undefined,
  loanAmountMin: undefined,
  loanAmountMax: undefined,
  useChannels: [],
  creditChannels: [],
  interestFreeDays: undefined,
  maxInterestFreeAmount: undefined,
  discountType: 'uniform',
  uniformDiscount: undefined,
  frontPeriods: undefined,
  frontDiscount: undefined,
  backPeriods: undefined,
  backDiscount: undefined,
  fixedFrontPeriods: undefined,
  fixedFrontValue: undefined,
  fixedBackPeriods: undefined,
  fixedBackDiscount: undefined,
  limitMinRate: false,
  minRate: undefined
})

// 表单验证规则
const rules = {
  name: [{ required: true, message: '请输入优惠券名称' }],
  type: [{ required: true, message: '请选择优惠券类型' }],
  validityPeriodType: [{ required: true, message: '请选择有效期类型' }],
  validityPeriod: [{ required: true, message: '请选择有效期', trigger: 'change' }],
  products: [{ required: true, message: '请选择贷款产品' }],
  stackable: [{ required: true, message: '请选择是否支持叠加' }],
  repaymentMethods: [{ required: true, message: '请选择还款方式' }],
  useChannels: [{ required: true, message: '请选择使用渠道' }],
  creditChannels: [{ required: true, message: '请选择授信渠道' }],
  // 免息券参数验证
  interestFreeDays: [{
    required: true,
    message: '请输入免息天数',
    trigger: 'blur',
    validator: (value: number | null) => {
      if (value === null) return true;
      return value >= 0 && value <= 1000;
    }
  }],
  maxInterestFreeAmount: [{
    required: true,
    message: '请输入最大免息金额',
    trigger: 'blur',
    validator: (value: number | null) => {
      if (value === null) return true;
      return value >= 0;
    }
  }],
  // 折扣券参数验证
  discountType: [{ required: true, message: '请选择折扣类型' }],
  uniformDiscount: [{
    required: true,
    message: '请输入折扣率',
    trigger: 'blur',
    validator: (value: number | null) => {
      if (value === null) return true;
      return value >= 0 && value <= 1;
    }
  }],
  frontPeriods: [{
    required: true,
    message: '请输入前期期数',
    trigger: 'blur',
    validator: (value: number | null) => {
      if (value === null) return true;
      return value >= 1;
    }
  }],
  frontDiscount: [{
    required: true,
    message: '请输入前期折扣率',
    trigger: 'blur',
    validator: (value: number | null) => {
      if (value === null) return true;
      return value >= 0 && value <= 1;
    }
  }],
  backPeriods: [{
    required: true,
    message: '请输入后期期数',
    trigger: 'blur',
    validator: (value: number | null) => {
      if (value === null) return true;
      return value >= 1;
    }
  }],
  backDiscount: [{
    required: true,
    message: '请输入后期折扣率',
    trigger: 'blur',
    validator: (value: number | null) => {
      if (value === null) return true;
      return value >= 0 && value <= 1;
    }
  }],
  fixedFrontPeriods: [{
    required: true,
    message: '请输入前期期数',
    trigger: 'blur',
    validator: (value: number | null) => {
      if (value === null) return true;
      return value >= 1;
    }
  }],
  fixedFrontRate: [{
    required: true,
    message: '请输入前期固定利率',
    trigger: 'blur',
    validator: (value: number | null) => {
      if (value === null) return true;
      return value >= 0 && value <= 1;
    }
  }],
  fixedBackPeriods: [{
    required: true,
    message: '请输入后期期数',
    trigger: 'blur',
    validator: (value: number | null) => {
      if (value === null) return true;
      return value >= 1;
    }
  }],
  fixedBackDiscount: [{
    required: true,
    message: '请输入后期折扣率',
    trigger: 'blur',
    validator: (value: number | null) => {
      if (value === null) return true;
      return value >= 0 && value <= 1;
    }
  }],
  minRate: [{
    required: true,
    message: '请输入最低利率',
    trigger: 'blur',
    validator: (value: number | null) => {
      if (value === null) return true;
      return value >= 0;
    }
  }]
}

// 取消创建
const handleCancel = () => {
  router.back()
}



// 全选产品
const selectAllProducts = ref(false)
const handleSelectAllProducts = (checked: boolean) => {
  formData.value.products = checked ? productOptions.map(p => p.value) : []
}



// 表单提交处理
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    // TODO: 调用接口提交数据
    Message.success('创建成功')
    router.push('/marketing/coupon/template')
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

// 提交并创建券
const handleSubmitAndCreate = async () => {
  try {
    await formRef.value.validate()
    // TODO: 调用接口提交数据，设置状态为已上线
    const submitData = {
      ...formData.value,
      status: 'online' // 设置状态为已上线
    }
    // TODO: 调用接口提交数据
    Message.success('创建并上线成功')
    // 跳转到库存管理页面并传递参数以触发创建库存弹窗
    router.push({
      path: '/marketing/coupon/management',
      query: {
        createCoupon: 'true',
        templateId: formData.value.id, // 传递模板ID
        templateName: formData.value.name, // 传递模板名称
        showCreateModal: 'true', // 控制创建券库存弹窗的显示
        _t: Date.now() // 添加时间戳确保每次跳转都会触发参数变化
      }
    })
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}
</script>
