<template>
  <a-card title="短信模板创建" class="sms-template-create-card">
    <template #extra>
      <a-space>
        <a-button @click="handleBack">返回</a-button>
        <a-button type="primary" @click="handleSave">保存</a-button>
      </a-space>
    </template>

    <a-form :model="formData" layout="vertical">
      <a-form-item label="模板ID" required>
        <a-input v-model="formData.templateId" placeholder="请输入模板ID" style="width: 400px" />
      </a-form-item>

      <a-form-item label="短信类型" required>
        <a-select v-model="formData.smsType" placeholder="请选择短信类型" style="width: 400px">
          <a-option value="营销类">营销类</a-option>
          <a-option value="通知类">通知类</a-option>
          <a-option value="验证码">验证码</a-option>
        </a-select>
      </a-form-item>

      <a-form-item label="主要场景">
        <a-input v-model="formData.primaryScene" placeholder="请输入主要场景" style="width: 400px" />
      </a-form-item>

      <a-form-item label="策略标签">
        <a-input v-model="formData.strategyTag" placeholder="请输入策略标签" style="width: 400px" />
      </a-form-item>

      <a-form-item label="标签" required>
        <a-input v-model="formData.label" placeholder="请输入标签" style="width: 400px" />
      </a-form-item>

      <a-form-item label="模板">
        <a-input v-model="formData.template" placeholder="请输入模板名称" style="width: 400px" />
      </a-form-item>

      <a-form-item label="状态">
        <a-select v-model="formData.status" placeholder="请选择状态" style="width: 400px">
          <a-option value="使用中">使用中</a-option>
          <a-option value="待审批">待审批</a-option>
          <a-option value="审批通过">审批通过</a-option>
          <a-option value="审批拒绝">审批拒绝</a-option>
          <a-option value="草稿">草稿</a-option>
          <a-option value="停用">停用</a-option>
        </a-select>
      </a-form-item>
    </a-form>
  </a-card>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Message } from '@arco-design/web-vue'

const router = useRouter()
const route = useRoute()

const formData = reactive({
  templateId: '',
  smsType: '',
  primaryScene: '',
  strategyTag: '',
  label: '',
  template: '',
  status: '草稿'
})

const handleBack = () => {
  router.push('/touch/channel/sms-template')
}

const handleSave = () => {
  if (!formData.templateId || !formData.label) {
    Message.error('请填写必填项')
    return
  }
  Message.success('保存成功')
  router.push('/touch/channel/sms-template')
}
</script>

<style scoped>
.sms-template-create-card {
  max-width: 800px;
}
</style>
