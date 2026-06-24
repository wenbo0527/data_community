<template>
  <div class="basic-info-section">
    <a-divider>基础信息</a-divider>

    <a-grid :cols="{ xs: 1, sm: 2, md: 3, lg: 4, xl: 4, xxl: 6 }" :col-gap="16" :row-gap="12">
      <a-grid-item :span="{ xs: 1, sm: 1, md: 2, lg: 2, xl: 2, xxl: 3 }">
        <a-form-item field="name" label="优惠券名称" required>
          <a-input v-model="formData.name" placeholder="请输入优惠券名称" />
        </a-form-item>
      </a-grid-item>

      <a-grid-item :span="{ xs: 1, sm: 1, md: 1, lg: 2, xl: 2, xxl: 3 }">
        <a-form-item field="type" label="优惠券类型" required>
          <a-radio-group v-model="formData.type">
            <a-radio value="interest_free">免息券</a-radio>
            <a-radio value="discount">折扣券</a-radio>
            <a-radio value="PRICED_DISCOUNT">临价折扣券</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-grid-item>

      <!-- 临价折扣券：产品选择 -->
      <a-grid-item
        v-if="formData.type === 'PRICED_DISCOUNT'"
        :span="{ xs: 1, sm: 1, md: 1, lg: 2, xl: 2, xxl: 3 }"
      >
        <a-form-item field="product_id" label="产品" required>
          <a-select
            v-model="formData.product_id"
            :placeholder="productLocked ? '产品已锁定' : '请选择产品（京东/美团）'"
            :disabled="productLocked"
            :style="{ width: '100%' }"
            @change="handleProductChange"
          >
            <a-option value="JD_001">京东大额低息</a-option>
            <a-option value="MT_001">美团大额低息</a-option>
          </a-select>
        </a-form-item>
      </a-grid-item>
    </a-grid>

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
  </div>
</template>

<script setup lang="ts">
import type { TemplateFormData } from '../types/template'

interface Props {
  formData: TemplateFormData
  productLocked: boolean
  handleProductChange: (value: string) => void
}

defineProps<Props>()
</script>

<style scoped>
.basic-info-section {
  margin-bottom: 16px;
}
</style>
