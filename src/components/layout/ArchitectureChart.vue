<template>
  <div class="architecture-container">
    <img src="/2.5d.svg" alt="社区架构图" class="architecture-image" />
  </div>
</template>

<script setup>
// 组件逻辑
</script>

<style scoped>
.architecture-container {
  position: relative;
  width: 100%;
  height: 400px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--color-bg-1);
  border-radius: 8px;
}

.architecture-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 0.3s ease;
}

.architecture-image:hover {
  transform: scale(1.02);
}
</style>