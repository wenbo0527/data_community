<!--
  变量基础信息 Tab
  - 基本属性 + 技术属性 + 长文本（描述/口径）+ 类型化档案
  - 质量指标 + 变量定义
-->
<template>
  <div class="tab-content">
    <ParamGroup title="基本属性" :items="basicInfo" :columns="3" />
    <ParamGroup title="技术属性" :items="technicalInfo" :columns="3" />

    <!-- 长文本区域：描述 + 口径（独立整行展示） -->
    <div v-if="longTextInfo && longTextInfo.length" class="longtext-section">
      <div v-for="item in longTextInfo" :key="item.label" class="longtext-item">
        <div class="longtext-label">{{ item.label }}</div>
        <div class="longtext-value">{{ item.value }}</div>
      </div>
    </div>

    <ParamGroup :title="typedProfileTitle" :items="typedProfileInfo" :columns="3" />
  </div>
</template>

<script setup lang="ts">
import ParamGroup from '@/modules/variable-hub/components/ParamGroup.vue'

interface Props {
  basicInfo: any[]
  technicalInfo: any[]
  longTextInfo?: any[]
  typedProfileInfo: any[]
  typedProfileTitle: string
  variableData: any
}

withDefaults(defineProps<Props>(), {
  longTextInfo: () => [],
  typedProfileTitle: '补充属性'
})
</script>

<style scoped>
.longtext-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.longtext-item {
  background: var(--color-fill-1, #f7f8fa);
  border-radius: 4px;
  padding: 12px 16px;
}

.longtext-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-3, #86909c);
  margin-bottom: 6px;
}

.longtext-value {
  font-size: 14px;
  line-height: 1.8;
  color: var(--color-text-1, #1d2129);
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
