<template>
  <a-empty :description="description" class="dmt-empty">
    <template v-if="$slots.default" #image>
      <slot name="icon" />
    </template>
    <a-space :size="8">
      <slot />
    </a-space>
  </a-empty>
</template>

<script setup>
defineProps({
  description: { type: String, default: '暂无数据' }
})
</script>

<style scoped>
.dmt-empty {
  padding: 24px 0;
}
</style>
