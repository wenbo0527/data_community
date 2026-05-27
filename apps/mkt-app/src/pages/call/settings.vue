<template>
  <div class="call-settings-page">
    <a-form :model="settingsForm" layout="vertical" :style="{ maxWidth: '600px' }">
      <a-form-item label="自动外呼">
        <a-switch v-model="settingsForm.autoCall" />
      </a-form-item>
      <a-form-item label="最大并发数">
        <a-input-number v-model="settingsForm.maxConcurrent" :min="1" :max="50" />
      </a-form-item>
      <a-form-item label="通话超时时间（秒）">
        <a-input-number v-model="settingsForm.callTimeout" :min="10" :max="300" />
      </a-form-item>
      <a-form-item label="呼叫间隔（秒）">
        <a-input-number v-model="settingsForm.callInterval" :min="0" :max="60" />
      </a-form-item>
      <a-form-item>
        <a-space>
          <a-button type="primary" @click="handleSave">保存设置</a-button>
          <a-button @click="handleReset">重置</a-button>
        </a-space>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

const settingsForm = reactive({
  autoCall: true,
  maxConcurrent: 10,
  callTimeout: 120,
  callInterval: 5
})

const handleSave = () => console.log('保存设置:', settingsForm)
const handleReset = () => {
  settingsForm.autoCall = true
  settingsForm.maxConcurrent = 10
  settingsForm.callTimeout = 120
  settingsForm.callInterval = 5
}
</script>

<style scoped>
.call-settings-page {
  padding: 20px;
}
</style>