<template>
  <div class="coupon-template-detail">
    <coupon-template-create 
      :mode="'view'" 
      :id="route.query.id" 
      :readonly="true"
      disable-operations
      :hide-back-button="false"
    />
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import CouponTemplateCreate from './create.vue'

const route = useRoute()
</script>

<style scoped>
.coupon-template-detail {
  padding: 20px;
}

.back-icon {
  cursor: pointer;
  font-size: 20px;
  margin-right: 8px;
}

.back-icon:hover {
  color: rgb(var(--primary-6));
}
</style>