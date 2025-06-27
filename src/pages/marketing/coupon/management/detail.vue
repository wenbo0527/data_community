<template>
  <div class="coupon-detail-container">
    <a-card class="form-card">
      <div class="page-header">
        <h2 class="page-title">优惠券详情</h2>
        <a-button type="outline" @click="router.back()" style="margin-left: auto">
          <template #icon><icon-left /></template>
          返回
        </a-button>
      </div>

      <a-tabs>
        <a-tab-pane key="template" title="模板参数">
          <template-detail :id="templateId" :readonly="true" disable-operations />
        </a-tab-pane>
        <a-tab-pane key="instance" title="库存参数">
          <a-form :model="instanceFormData" layout="vertical" :style="{ width: '100%', maxWidth: '800px' }" disabled>
            <a-form-item field="name" label="券名称">
              <a-input v-model="instanceFormData.name" />
            </a-form-item>
            
            <a-form-item field="totalCount" label="发放数量">
              <a-input-number v-model="instanceFormData.totalCount" />
            </a-form-item>
            
            <a-form-item field="validity" label="有效期">
              <a-range-picker v-model="instanceFormData.validity" style="width: 100%" />
            </a-form-item>
            
            <a-form-item field="rules" label="使用规则">
              <a-textarea v-model="instanceFormData.rules" />
            </a-form-item>

            <a-form-item field="dailyLimit" label="单日发放上限">
              <a-input-number v-model="instanceFormData.dailyLimit" />
            </a-form-item>

            <a-form-item field="weeklyLimit" label="单周发放上限">
              <a-input-number v-model="instanceFormData.weeklyLimit" />
            </a-form-item>

            <a-form-item field="monthlyLimit" label="单月发放上限">
              <a-input-number v-model="instanceFormData.monthlyLimit" />
            </a-form-item>
          </a-form>
        </a-tab-pane>
      </a-tabs>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { IconLeft } from '@arco-design/web-vue/es/icon'
import TemplateDetail from '../template/detail.vue'

const route = useRoute()
const router = useRouter()

const templateId = ref('')
const instanceFormData = ref({
  name: '',
  totalCount: 0,
  validity: [] as (Date | string)[],
  rules: '',
  dailyLimit: 0,
  weeklyLimit: 0,
  monthlyLimit: 0
})

onMounted(() => {
  // TODO: 根据路由参数获取券实例ID，调用API获取数据
  // 这里假设从路由参数中获取templateId和instanceId
  templateId.value = route.query.templateId as string || ''
  
  // 模拟获取实例数据
  instanceFormData.value = {
    name: '测试券',
    totalCount: 1000,
    validity: [new Date(), new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)],
    rules: '使用规则说明',
    dailyLimit: 100,
    weeklyLimit: 500,
    monthlyLimit: 2000
  }
})
</script>

<style scoped>
.coupon-detail-container {
  padding: 20px;
}

.form-card {
  margin-top: 20px;
}

.page-header {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}
</style>