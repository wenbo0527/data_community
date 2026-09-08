<template>
  <div class="offline-model-layout">
    <a-layout style="min-height: 100vh">
      <a-layout-content class="layout-content">
        <div class="content-wrapper">
          <router-view />
        </div>
      </a-layout-content>
    </a-layout>
  </div>
</template>

<script setup>
</script>

<style scoped lang="less">
.offline-model-layout {
  height: 100vh;
  .layout-content {
    margin: 24px;
    padding: 24px;
    background: #fff;
    border-radius: 6px;
    .content-wrapper {
      height: 100%;
      overflow: auto;
    }
  }
}
</style>
