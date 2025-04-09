<template>
  <a-card class="section-card" v-if="formData.type === 'interest_free'">
    <template #title>
      <div class="section-title">
        <div class="title-icon interest-icon"></div>
        <span class="title-text">免息优惠计算参数</span>
        <a-tooltip position="right">
          <span class="title-help">?</span>
          <template #content>配置免息优惠的具体参数，包括免息天数和最大免息金额</template>
        </a-tooltip>
      </div>
    </template>
    <div class="section-desc">设置免息优惠的具体参数，控制免息天数和最大优惠额度</div>

    <a-grid :cols="2" :col-gap="16" :row-gap="16">
      <a-grid-item>
        <a-form-item field="interestFreeDays" label="免息天数" required>
          <a-input-number
            v-model="formData.interestFreeDays"
            :min="0"
            :max="1000"
            :precision="0"
            placeholder="请输入免息天数"
            style="width: 200px"
          />
          <span style="margin-left: 8px">天</span>
        </a-form-item>
      </a-grid-item>

      <a-grid-item>
        <a-form-item field="maxInterestFreeAmount" label="最大免息金额" required>
          <a-input-number
            v-model="formData.maxInterestFreeAmount"
            :min="0"
            :precision="2"
            placeholder="请输入最大免息金额"
            style="width: 200px"
          />
          <span style="margin-left: 8px">元</span>
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
</script>