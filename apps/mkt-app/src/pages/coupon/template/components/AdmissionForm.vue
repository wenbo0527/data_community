<template>
  <a-card class="section-card">
    <template #title>
      <div class="section-title">
        <div class="title-icon admission-icon"></div>
        <span class="title-text">准入参数</span>
        <a-tooltip position="right">
          <span class="title-help">?</span>
          <template #content>设置优惠券的基本使用条件，包括适用产品、还款方式、期数和金额等限制</template>
        </a-tooltip>
      </div>
    </template>
    <div class="section-desc">配置优惠券的基本使用条件，明确适用范围和限制</div>

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
  </a-card>
</template>

<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  formData: {
    type: Object,
    required: true
  }
})

// 产品选项数据
const productOptions = [
  { label: '个人消费贷款', value: 'PERSONAL_LOAN' },
  { label: '小微经营贷款', value: 'BUSINESS_LOAN' },
  { label: '房屋抵押贷款', value: 'MORTGAGE_LOAN' },
  { label: '汽车消费贷款', value: 'CAR_LOAN' },
  { label: '信用卡分期', value: 'CREDIT_CARD_INSTALLMENT' },
  { label: '教育助学贷款', value: 'EDUCATION_LOAN' },
]
</script>