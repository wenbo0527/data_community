<template>
  <div class="external-data-archive">
    <div class="page-header">
      <div class="header-content">
        <div class="header-info">
          <h2>外数档案管理</h2>
          <p class="page-description">外部数据的生命周期档案管理，统一管理数据产品、接口信息和供应商信息</p>
        </div>
        <div class="header-actions">
          <a-space>
            <a-button type="primary">
              <template #icon><IconPlus /></template>
              新增数据产品
            </a-button>
            <a-button type="outline">
              <template #icon><IconUpload /></template>
              批量导入
            </a-button>
            <a-button type="outline">
              <template #icon><IconDownload /></template>
              导出数据
            </a-button>
          </a-space>
        </div>
      </div>
    </div>

    <a-row :gutter="[24, 24]">
      <a-col :span="12">
        <a-card class="module-card" hoverable>
          <template #title>
            <div class="module-header">
              <icon-folder class="module-icon" />
              <span>外数档案</span>
              <a-tag color="blue" size="small">功能中枢</a-tag>
            </div>
          </template>
          <div class="module-content">
            <p class="module-description">外部数据的生命周期档案管理，包含数据产品管理、接口详情、状态跟踪等功能</p>
            <div class="module-stats">
              <div class="stat-item">
                <span class="stat-label">数据产品</span>
                <span class="stat-value">{{ stats.archive.products }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">接口数量</span>
                <span class="stat-value">{{ stats.archive.interfaces }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">供应商</span>
                <span class="stat-value">{{ stats.archive.suppliers }}</span>
              </div>
            </div>
            <div class="module-actions">
              <a-button type="primary" size="small">
                <template #icon><icon-right /></template>
                进入管理
              </a-button>
              <a-button type="outline" size="small">
                <template #icon><icon-plus /></template>
                快速新增
              </a-button>
            </div>
          </div>
        </a-card>
      </a-col>
      <a-col :span="12">
        <a-card title="档案概览" hoverable>
          <a-descriptions :data="overview" :column="2" :label-style="{ width: '120px' }" />
        </a-card>
      </a-col>
    </a-row>
  </div>
  
</template>

<script setup>
import { reactive } from 'vue'

const stats = reactive({
  archive: {
    products: 0,
    interfaces: 0,
    suppliers: 0
  }
})

const overview = [
  { label: '上线产品数', value: 0 },
  { label: '维护中产品数', value: 0 },
  { label: '待评估产品数', value: 0 },
  { label: '预算使用率', value: '—' }
]
</script>

<style scoped>
.page-header {
  margin-bottom: 16px;
}
.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.header-info h2 {
  margin: 0 0 8px;
}
.page-description {
  color: var(--color-text-2);
}
.module-header {
  display: flex;
  align-items: center;
  gap: 8px;
}
.module-icon {
  font-size: 18px;
}
.module-stats {
  display: flex;
  gap: 24px;
  margin-top: 8px;
}
.stat-item {
  display: flex;
  flex-direction: column;
}
.stat-label {
  color: var(--color-text-2);
}
.stat-value {
  font-weight: 600;
}
</style>