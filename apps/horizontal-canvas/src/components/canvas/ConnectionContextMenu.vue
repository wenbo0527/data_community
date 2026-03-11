<template>
  <div v-if="visible" class="menu" :style="{ left: position.x + 'px', top: position.y + 'px' }">
    <div class="menu-item" @click="$emit('delete-connection')">删除连接</div>
    <div class="menu-item" @click="$emit('close')">关闭</div>
  </div>
</template>

<script setup>
/*
用途：连接右键菜单（删除/关闭）
说明：仅发出删除与关闭事件；查看模式由父组件控制屏蔽删除行为。
边界：不直接移除边；位置与当前选中边由父组件传入。
*/
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
