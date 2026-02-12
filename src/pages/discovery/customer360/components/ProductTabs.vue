<template>
  <div class="product-tabs">
    <a-tabs v-model:activeKey="activeKey">
      <a-tab-pane 
        v-for="product in products"
        :key="product?.key || product?.name"
        :tab="`${product?.name || '未知产品'} (${product?.count ?? 0})`"
      >
        <a-list item-layout="horizontal" :data-source="product.list">
          <template #renderItem="{ item }">
            <a-list-item>
              <a-list-item-meta :description="item.description" />
            </a-list-item>
          </template>
        </a-list>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup>
import { ref } from 'vue';

defineProps({
  products: {
    type: Array,
    default: () => []
  },
  loading: Boolean
});

const activeKey = ref('deposit');
</script>

<style scoped>
.product-tabs {
  margin-top: 20px;
}
</style>