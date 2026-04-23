<template>
  <div class="channel-page">
    <a-tabs default-active-key="sms">
      <a-tab-pane key="sms" title="短信渠道">
        <sms-template />
      </a-tab-pane>
      <a-tab-pane key="ai-call" title="AI外呼渠道">
        <ai-call-template />
      </a-tab-pane>
      <a-tab-pane key="manual-call" title="人工外呼渠道">
        <manual-call-template />
      </a-tab-pane>
      <a-tab-pane key="blacklist" title="黑名单管理">
        <blacklist />
      </a-tab-pane>
      <a-tab-pane key="rate-limit" title="频控配置">
        <rate-limit />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup lang="ts">
import smsTemplate from './sms-template.vue'
import aiCallTemplate from './ai-call-template.vue'
import manualCallTemplate from './manual-call-template.vue'
import blacklist from './blacklist.vue'
import rateLimit from './rate-limit.vue'
</script>

<style scoped>
.channel-page {
  padding: 16px;
}
</style>
