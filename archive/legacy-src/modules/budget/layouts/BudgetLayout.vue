<template>
  <div class="budget-layout">
    <div class="budget-content">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.budget-layout {
  display: flex;
  height: 100vh;
}
.budget-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}
</style>
