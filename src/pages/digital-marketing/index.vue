<template>
  <a-layout>
    <a-layout-content class="content">
      <a-card :bordered="false" class="main-info">
        <a-row :gutter="24">
          <a-col :span="24">
            <a-space direction="vertical" fill>
              <div class="title-section">
                <a-space align="center">
                  <h2 class="data-title">数字营销</h2>
                </a-space>
              </div>
              
              <a-descriptions :column="2" size="large" class="basic-info">
                <a-descriptions-item label="模块状态">开发中</a-descriptions-item>
                <a-descriptions-item label="预计上线时间">2024年Q2</a-descriptions-item>
                <a-descriptions-item label="功能描述" :span="2">
                  数字营销模块将提供全方位的营销数据分析和管理功能，包括营销活动管理、效果分析、客户画像等功能。
                </a-descriptions-item>
              </a-descriptions>
            </a-space>
          </a-col>
        </a-row>
      </a-card>
    </a-layout-content>
  </a-layout>
</template>

<script setup>
import { ref } from 'vue'
</script>

<style scoped>
.content {
  padding: 24px;
  background: var(--color-bg-2);
}

.main-info {
  margin-bottom: 24px;
}

.title-section {
  margin-bottom: 24px;
}

.data-title {
  margin: 0;
  font-size: 24px;
  font-weight: 500;
  color: var(--color-text-1);
}

.basic-info :deep(.arco-descriptions-item-label) {
  font-weight: 500;
}
</style>