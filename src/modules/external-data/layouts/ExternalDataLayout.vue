<template>
  <div class="external-data-layout">
    <div class="external-data-content">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.external-data-layout {
  display: flex;
  height: 100vh;
}
.external-data-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}
</style>
