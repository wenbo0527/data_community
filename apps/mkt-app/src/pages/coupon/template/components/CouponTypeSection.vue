<template>
  <div class="coupon-type-section">
    <!-- 优惠券参数配置（PRICED_DISCOUNT 隐藏） -->
    <template v-if="formData.type !== 'PRICED_DISCOUNT'">
      <a-divider>优惠券参数配置</a-divider>
      <InterestFreeForm v-if="formData.type === 'interest_free'" :form-data="formData" />
      <DiscountForm v-if="formData.type === 'discount'" :form-data="formData" />
    </template>

    <!-- 临价折扣券参数配置 -->
    <div v-if="formData.type === 'PRICED_DISCOUNT'" class="priced-discount-form">
      <a-divider>临价折扣券参数</a-divider>
      <a-grid :cols="{ xs: 1, sm: 2, md: 3, lg: 4, xl: 4, xxl: 6 }" :col-gap="16" :row-gap="12">
        <a-grid-item :span="{ xs: 1, sm: 1, md: 2, lg: 2, xl: 2, xxl: 3 }">
          <a-form-item field="discount_value" label="折扣值" required>
            <a-input-number
              v-model="formData.discount_value"
              :min="1"
              :max="100"
              :precision="2"
              placeholder="如: 80 表示8折"
              style="width: 100%"
            />
          </a-form-item>
        </a-grid-item>
      </a-grid>
      <div style="margin-top: 12px; color: var(--color-text-3); font-size: 12px">
        <span style="color: var(--color-warning);">⚠️ 正常扣减库存(控总成本) / 无核销 / 同用户同时间 1 张「未使用」状态唯一</span>
        <div style="margin-top: 4px">
          📌 库存用于控制发放总成本(跟其他券类型一致),同用户同产品再次新发时旧券自动「已作废」
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TemplateFormData } from '../types/template'
import InterestFreeForm from './InterestFreeForm.vue'
import DiscountForm from './DiscountForm.vue'

interface Props {
  formData: TemplateFormData
}

defineProps<Props>()
</script>

<style scoped>
.coupon-type-section {
  margin-bottom: 16px;
}

.priced-discount-form {
  margin-bottom: 16px;
}
</style>
