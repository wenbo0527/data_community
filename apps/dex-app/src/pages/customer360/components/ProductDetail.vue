<template>
  <div class="product-detail">
    <h3>{{ product.name }}</h3>
    <div class="detail-row">
      <span>Balance:</span>
      <span>{{ product.balance }} {{ product.currency }}</span>
    </div>
    <div class="detail-row">
      <span>Status:</span>
      <span :class="'status-' + product.status.toLowerCase()">{{ product.status }}</span>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  product: {
    type: Object,
    required: true
  }
});
</script>

<style scoped>
.product-detail {
  padding: 16px;
  border: 1px solid #eee;
  border-radius: 4px;
}
.detail-row {
  display: flex;
  justify-content: space-between;
  margin: 8px 0;
}
.status-normal {
  color: green;
}
.status-warning {
  color: orange;
}
.status-error {
  color: red;
}
</style>