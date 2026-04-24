<template>
  <a-tabs v-model:activeKey="activeTab">
    <a-tab-pane key="ai" title="AI供应商">
      <AiVendors />
    </a-tab-pane>
    <a-tab-pane key="sms" title="短信供应商">
      <SmsVendors />
    </a-tab-pane>
  </a-tabs>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AiVendors from './ai.vue'
import SmsVendors from './sms.vue'

const activeTab = ref('ai')
</script>
