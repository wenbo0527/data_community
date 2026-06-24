<template>
  <div class="discount-config-section">
    <slot :form-data="formData">
      <!-- 锁定期配置 -->
      <LockForm v-if="formData.type !== 'PRICED_DISCOUNT'" :form-data="formData" />
    </slot>
  </div>
</template>

<script setup lang="ts">
import type { TemplateFormData } from '../types/template'
import LockForm from './LockForm.vue'

interface Props {
  formData: TemplateFormData
}

defineProps<Props>()
</script>

<style scoped>
.discount-config-section {
  margin-bottom: 16px;
}
</style>
