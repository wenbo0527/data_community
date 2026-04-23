<template>
  <div class="system-container">
    <a-card class="section" :bordered="false">
      <template #title>渠道配额与限流</template>
      <a-space>
        <a-statistic title="短信渠道配额" :value="channelsQuota.sms" />
        <a-statistic title="邮件渠道配额" :value="channelsQuota.email" />
      </a-space>
    </a-card>
    <a-card class="section" :bordered="false">
      <template #title>短信签名与模板库</template>
      <a-space>
        <a-tag color="blue" v-for="s in signatures" :key="s">{{ s }}</a-tag>
      </a-space>
    </a-card>
    <a-card class="section" :bordered="false">
      <template #title>任务审核流配置</template>
      <a-descriptions :data="approvalItems" bordered :column="2" />
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getGlobalConfig } from '@/services/systemService'
const channelsQuota = ref({ sms: 0, email: 0 })
const signatures = ref<string[]>([])
const approvalItems = ref<any[]>([])
onMounted(async () => {
  const cfg = await getGlobalConfig()
  channelsQuota.value = { sms: cfg.channels.sms.quota, email: cfg.channels.email.quota }
  signatures.value = cfg.signatures
  approvalItems.value = [
    { label: '是否启用审核', value: cfg.approval.enabled ? '是' : '否' },
    { label: '审核层级', value: String(cfg.approval.levels) }
  ]
})
</script>

<style scoped>
.system-container { padding: 16px; background-color: var(--color-fill-2); min-height: 100vh; }
.section { margin-bottom: 16px; }
</style>
