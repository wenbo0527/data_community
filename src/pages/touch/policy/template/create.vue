<template>
  <div class="policy-template-create">
    <a-page-header title="新建策略模板" :extra="[h(AButton, { onClick: handleBack }, '返回')]">
      <template #breadcrumb>
        <a-breadcrumb>
          <a-breadcrumb-item>触达管理</a-breadcrumb-item>
          <a-breadcrumb-item>策略模板</a-breadcrumb-item>
          <a-breadcrumb-item>新建模板</a-breadcrumb-item>
        </a-breadcrumb>
      </template>
    </a-page-header>

    <a-form :model="formState" @submit="handleSubmit" label-width="120">
      <!-- 标题 -->
      <a-form-item label="标题" required>
        <a-input v-model="formState.title" placeholder="请输入策略模板标题" />
      </a-form-item>

      <!-- 消息类型 -->
      <a-form-item label="消息类型" required>
        <a-select v-model="formState.messageType">
          <a-option value="sms">短信</a-option>
          <a-option value="call">外呼</a-option>
        </a-select>
      </a-form-item>

      <!-- 其他表单字段（同原模态框内容） -->
      <!-- ... 省略其他表单字段，保持与原模态框一致 ... -->

      <a-form-item>
        <a-button type="primary" html-type="submit">提交</a-button>
        <a-button style="margin-left: 16px" @click="handleBack">取消</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { h, ref } from 'vue'
import { Button as AButton } from '@arco-design/web-vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const formState = ref({ title: '', messageType: '' })

const handleSubmit = () => {
  // 提交逻辑
  console.log('提交数据:', formState.value)
  router.back()
}

const handleBack = () => {
  router.back()
}
</script>

<style scoped>
.policy-template-create {
  padding: 24px;
  background: #fff;
}
</style>