<template>
  <div class="batch-create-container">
    <a-page-header title="批量创建券库存" subtitle="P0-路由-#4 新建空壳 (文博 16:16 反馈空白页)">
      <template #breadcrumb>
        <a-breadcrumb>
          <a-breadcrumb-item>营销中心</a-breadcrumb-item>
          <a-breadcrumb-item>券管理</a-breadcrumb-item>
          <a-breadcrumb-item>批量创建</a-breadcrumb-item>
        </a-breadcrumb>
      </template>
    </a-page-header>

    <a-card :bordered="false" style="margin-top: 16px">
      <!-- P0-路由-#4 5 列骨架: 模板选择 / 数量 / 渠道 / 有效期 / 提交 -->
      <a-form :model="formData" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item field="templateId" label="券模板" required>
              <a-select v-model="formData.templateId" placeholder="请选择券模板" allow-clear>
                <a-option v-for="t in templateOptions" :key="t.id" :value="t.id">
                  {{ t.name }}
                </a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item field="totalCount" label="创建数量" required>
              <a-input-number v-model="formData.totalCount" :min="1" :max="100000" :step="100" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item field="channel" label="发放渠道" required>
              <a-select v-model="formData.channel" placeholder="请选择渠道" allow-clear>
                <a-option value="app">APP</a-option>
                <a-option value="miniprogram">小程序</a-option>
                <a-option value="manual">人工发放</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="validFrom" label="有效期起" required>
              <a-date-picker v-model="formData.validFrom" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="validTo" label="有效期止" required>
              <a-date-picker v-model="formData.validTo" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="handleSubmit">提交</a-button>
            <a-button @click="goBack">取消</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>

<script setup>
/**
 * P0-路由-#4 新建 management/batch-create.vue 空壳 (5 列骨架)
 * 背景: 文博 16:16 反馈 /marketing/benefit/management/batch-create 空白页
 * 根因: 路由未注册 + 文件不存在
 * 修法: P0-#4 新建空壳 + P0-#3 注册路由
 * 5 列: 模板 / 数量 / 渠道 / 有效期起 / 有效期止
 */
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { templateMockData } from '@/mock/coupon'

const router = useRouter()

const formData = reactive({
  templateId: '',
  totalCount: 1000,
  channel: 'app',
  validFrom: '',
  validTo: '',
})

const templateOptions = ref([])

onMounted(() => {
  // 从 mock 数据中获取券模板选项
  templateOptions.value = templateMockData.map(t => ({
    id: t.id,
    name: t.name,
  }))
})

const handleSubmit = () => {
  if (!formData.templateId) {
    Message.error('请选择券模板')
    return
  }
  if (!formData.validFrom || !formData.validTo) {
    Message.error('请选择有效期')
    return
  }
  // TODO: 调 inventoryAPI.batchCreate
  Message.success('提交成功 (空壳 demo)')
  router.push('/marketing/benefit/management')
}

const goBack = () => {
  router.push('/marketing/benefit/management')
}
</script>

<style scoped>
.batch-create-container {
  padding: 24px;
  background-color: var(--color-bg-2);
  min-height: calc(100vh - 60px);
}
</style>
