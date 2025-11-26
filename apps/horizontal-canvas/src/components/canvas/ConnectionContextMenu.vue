<template>
  <div v-if="visible" class="menu" :style="{ left: position.x + 'px', top: position.y + 'px' }">
    <div class="menu-item" @click="$emit('delete-connection')">删除连接</div>
    <div class="menu-item" @click="$emit('restore-preview-line')">恢复预览线</div>
    <div class="menu-item" @click="$emit('close')">关闭</div>
  </div>
</template>

<script setup>
defineProps({
  visible: { type: Boolean, default: false },
  position: { type: Object, default: () => ({ x: 0, y: 0 }) },
  edge: { type: Object, default: null },
  graph: { type: Object, default: null }
})
</script>

<style scoped>
.menu { position: absolute; background: #fff; border: 1px solid #e5e6eb; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,.08); width: 160px; z-index: 10 }
.menu-item { padding: 8px 12px; cursor: pointer }
.menu-item:hover { background: #f7f8fa }
</style>
