<!--
  变量基础信息 Tab
  - 基本属性 + 技术属性 + 类型化档案
  - 质量指标 + 变量定义
-->
<template>
  <div class="tab-content">
    <ParamGroup title="基本属性" :items="basicInfo" :columns="3" />
    <ParamGroup title="技术属性" :items="technicalInfo" :columns="3" />
    <ParamGroup :title="typedProfileTitle" :items="typedProfileInfo" :columns="3" />

    <a-card title="变量定义" class="detail-card">
      <div class="definition-content">
        {{ variableData.definition || '暂无定义' }}
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import ParamGroup from '@/modules/variable-hub/components/ParamGroup.vue'

interface Props {
  basicInfo: any[]
  technicalInfo: any[]
  typedProfileInfo: any[]
  typedProfileTitle: string
  variableData: any
}

defineProps<Props>()
</script>

<style scoped>
.definition-content {
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-text-2, #4e5969);
  padding: 4px 0;
}
</style>
