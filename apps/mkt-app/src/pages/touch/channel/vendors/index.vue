<template>
  <a-card title="供应商管理">
    <a-space>
      <a-button type="primary" @click="$router.push('/touch/channel/vendors/ai')">AI供应商</a-button>
      <a-button @click="$router.push('/touch/channel/vendors/sms')">短信供应商</a-button>
    </a-space>
  </a-card>
</template>
<script setup lang="ts">
</script>
