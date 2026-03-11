<template>
  <div class="tag-center-header">
    <div class="header-content">
      <h1 class="page-title">标签表注册中心</h1>
      <p class="page-description">管理和注册标签表，配置数据源与IDMapping规则</p>
    </div>
    <div class="header-actions">
      <a-space>
        <a-button @click="$emit('refresh')">
          <template #icon><IconRefresh /></template>
          刷新
        </a-button>
        <a-dropdown @select="handleCreateSelect">
          <a-button type="primary">
            <template #icon><IconPlus /></template>
            新建
            <template #suffix><IconDown /></template>
          </a-button>
          <template #content>
            <a-doption value="quick">
              <template #icon><IconThunderbolt /></template>
              快速注册
            </a-doption>
            <a-doption value="form">
              <template #icon><IconEdit /></template>
              表单注册
            </a-doption>
            <a-doption value="import">
              <template #icon><IconUpload /></template>
              批量导入
            </a-doption>
          </template>
        </a-dropdown>
      </a-space>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IconPlus, IconDown, IconThunderbolt, IconEdit, IconUpload, IconRefresh } from '@arco-design/web-vue/es/icon'

// 事件定义
const emit = defineEmits<{
  quickRegister: []
  formRegister: []
  batchImport: []
  refresh: []
}>()

// 方法
const handleCreateSelect = (value: string) => {
  switch (value) {
    case 'quick':
      emit('quickRegister')
      break
    case 'form':
      emit('formRegister')
      break
    case 'import':
      emit('batchImport')
      break
  }
}
</script>

<style scoped lang="less">
.tag-center-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding: 24px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.header-content {
  flex: 1;
}

.page-title {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #1d2129;
}

.page-description {
  margin: 0;
  color: #86909c;
  font-size: 14px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

// 响应式设计
@media (max-width: 768px) {
  .tag-center-header {
    flex-direction: column;
    gap: 16px;
  }
  
  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>