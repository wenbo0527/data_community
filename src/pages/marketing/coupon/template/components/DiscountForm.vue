<template>
  <a-card class="section-card" v-if="formData.type === 'discount'">
    <template #title>
      <div class="section-title">
        <div class="title-icon discount-icon"></div>
        <span class="title-text">折扣优惠参数</span>
        <a-tooltip position="right">
          <span class="title-help">?</span>
          <template #content>设置分期还款的折扣方案，可选择统一折扣、差异化折扣或固定值折扣方式</template>
        </a-tooltip>
      </div>
    </template>
    <div class="section-desc">配置分期还款的折扣方案，灵活设置不同期数的优惠力度</div>

    <a-form-item field="discountType" label="每期折扣" required>
      <a-radio-group v-model="formData.discountType">
        <a-radio value="uniform">统一折扣</a-radio>
        <a-radio value="different">前N期折扣</a-radio>
        <a-radio value="fixed">后M期折扣</a-radio>
      </a-radio-group>

      <div style="margin-top: 16px">
        <template v-if="formData.discountType === 'uniform'">
          <a-input-number
            v-model="formData.uniformDiscount"
            :min="0"
            :max="1"
            :precision="2"
            placeholder="请输入折扣率"
            style="width: 200px"
          />
        </template>

        <template v-if="formData.discountType === 'different'">
          <a-space>
            前
            <a-input-number
              v-model="formData.frontPeriods"
              :min="1"
              :precision="0"
              style="width: 100px"
            />
            期，折扣率
            <a-input-number
              v-model="formData.frontDiscount"
              :min="0"
              :max="1"
              :precision="2"
              style="width: 100px"
            />
          </a-space>
        </template>

        <template v-if="formData.discountType === 'fixed'">
          <a-space>
            后
            <a-input-number
              v-model="formData.fixedBackPeriods"
              :min="1"
              :precision="0"
              style="width: 100px"
            />
            期，折扣率
            <a-input-number
              v-model="formData.fixedBackDiscount"
              :min="0"
              :max="1"
              :precision="2"
              style="width: 100px"
            />
          </a-space>
        </template>
      </div>
    </a-form-item>

    <a-form-item field="limitMinRate" label="是否限制最低利率" required>
      <a-radio-group v-model="formData.limitMinRate">
        <a-radio :value="true">是</a-radio>
        <a-radio :value="false">否</a-radio>
      </a-radio-group>
    </a-form-item>

    <a-form-item
      v-if="formData.limitMinRate"
      field="minRate"
      label="最低利率"
      required
    >
      <a-input-number
        v-model="formData.minRate"
        :min="0"
        :precision="4"
        placeholder="请输入最低利率"
        style="width: 200px"
      />
      <span style="margin-left: 8px">%/天</span>
    </a-form-item>
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
</script>