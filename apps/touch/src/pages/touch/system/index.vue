<template>
  <a-layout>
    <a-layout-content class="content">
      <a-row :gutter="16" style="margin-bottom: 16px">
        <a-col :span="12">
          <a-card title="渠道配额" :bordered="false">
            <a-space direction="vertical" size="large" style="width: 100%">
              <a-statistic title="短信渠道配额" :value="channelsQuota.sms" suffix="条" />
              <a-statistic title="邮件渠道配额" :value="channelsQuota.email" suffix="条" />
            </a-space>
          </a-card>
        </a-col>
        <a-col :span="12">
          <a-card title="短信签名与模板库" :bordered="false">
            <a-space wrap>
              <a-tag v-for="s in signatures" :key="s" color="blue">{{ s }}</a-tag>
            </a-space>
          </a-card>
        </a-col>
      </a-row>
      <a-row :gutter="16" style="margin-bottom: 16px">
        <a-col :span="24">
          <a-card title="任务审核流配置" :bordered="false">
            <a-descriptions :data="approvalItems" bordered :column="2" />
          </a-card>
        </a-col>
      </a-row>
    </a-layout-content>
  </a-layout>
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
.content {
  padding: 16px;
  height: calc(100vh - 60px);
}
</style>
