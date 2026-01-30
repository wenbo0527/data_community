<template>
  <div class="policy-template-create">
    <a-card :bordered="false" title="新建策略模板">
      <a-form :model="formState" layout="vertical">
        <a-form-item label="标题" required>
          <a-input v-model="formState.title" placeholder="请输入标题" />
        </a-form-item>
        <a-form-item label="消息类型" required>
          <a-select v-model="formState.messageType" placeholder="请选择消息类型">
            <a-option value="sms">短信</a-option>
            <a-option value="push">推送</a-option>
            <a-option value="email">邮件</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="一级场景" required>
          <a-select v-model="formState.scene" placeholder="请选择一级场景">
            <a-option value="marketing">营销类</a-option>
            <a-option value="risk">风控类</a-option>
            <a-option value="notification">通知类</a-option>
            <a-option value="history">历史存量</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="策略tag" required>
          <a-select v-model="formState.tags" mode="multiple" placeholder="请选择策略tag">
            <a-option value="high_priority">高优先级</a-option>
            <a-option value="test">测试</a-option>
            <a-option value="production">生产</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="产品">
          <a-select v-model="formState.product" placeholder="请选择产品">
            <a-option value="su">Su音</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="目标渠道" required>
          <a-select v-model="formState.channel" placeholder="请选择目标渠道">
            <a-option v-for="item in channelOptions" :key="item.value" :value="item.value">
              {{ item.label }}
            </a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="常用频控" help="发送次数可设置2-5次">
          <a-select v-model="formState.frequencyControl" placeholder="请选择频控次数">
            <a-option value="2">2次</a-option>
            <a-option value="3">3次</a-option>
            <a-option value="4">4次</a-option>
            <a-option value="5">5次</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="发送次数" required>
          <a-input-number v-model="formState.sendCount" :min="1" />
        </a-form-item>
        <a-form-item label="发送时间">
          <div class="time-range">
            <span class="time-range-label">每日发送时间段</span>
            <a-time-picker v-model="formState.timeStart" format="HH:mm:ss" style="width: 160px" />
            <span class="time-range-sep">-</span>
            <a-time-picker v-model="formState.timeEnd" format="HH:mm:ss" style="width: 160px" />
          </div>
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="handleSubmit">确定</a-button>
            <a-button @click="handleCancel">取消</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
const router = useRouter()
const route = useRoute()
const formState = reactive({ title: '', messageType: '', scene: '', tags: [] as string[], product: '', channel: '', frequencyControl: '', sendCount: 5, timeStart: '', timeEnd: '' })
const channelOptions = [
  { label: '短信', value: 'sms' },
  { label: 'AI外呼', value: 'ai_call' },
  { label: '人工外呼', value: 'manual_call' }
]
if (route.query && route.query.mode === 'copy') {
  formState.title = String(route.query.title || '')
  formState.messageType = String(route.query.messageType || '')
  formState.scene = String(route.query.scene || '')
  try {
    const parsed = JSON.parse(String(route.query.tags || '[]'))
    formState.tags = Array.isArray(parsed) ? parsed : []
  } catch {
    formState.tags = []
  }
}
const handleSubmit = () => { router.push('/touch/policy/template') }
const handleCancel = () => { router.push('/touch/policy/template') }
</script>

<style scoped>
.policy-template-create { padding: 16px; }
.time-range { display: flex; align-items: center; gap: 8px; }
.time-range-label { color: var(--color-text-2); margin-right: 8px; }
.time-range-sep { color: var(--color-text-2); }
</style>
