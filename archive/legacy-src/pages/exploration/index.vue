<template>
  <UnifiedWorkbench
    module="exploration"
    :shortcuts="shortcuts"
  />
</template>

<script setup lang="ts">
import {
  IconTags,
  IconCalendar,
  IconUserGroup,
  IconCode,
  IconDashboard,
  IconDesktop,
  IconExperiment,
  IconLink
} from '@arco-design/web-vue/es/icon'
import UnifiedWorkbench from '@/components/common/UnifiedWorkbench.vue'

const shortcuts = [
  { key: 'tag-system', title: '标签体系', icon: IconTags, desc: '标签/标签组管理', navKey: 'exploration:tag-system' },
  { key: 'event-center', title: '事件中心', icon: IconCalendar, desc: '事件/虚拟事件', navKey: 'exploration:event-center' },
  { key: 'audience', title: '人群中心', icon: IconUserGroup, desc: '客群圈选与管理', navKey: 'exploration:audience-management' },
  { key: 'workflows', title: '分析流程', icon: IconCode, desc: '工作流/SQL/Python', navKey: 'exploration:workflows' },
  { key: 'dashboard', title: '指标看板', icon: IconDashboard, desc: '可视化看板', navKey: 'exploration:indicator-dashboard' },
  { key: 'datasource', title: '数据源', icon: IconDesktop, desc: '外部数据源接入', navKey: 'exploration:tag-system' },
  { key: 'model', title: '建模实验', icon: IconExperiment, desc: '模型/特征', navKey: 'exploration:workflows' },
  { key: 'external', title: '外数评估', icon: IconLink, desc: '外部数据评估', navKey: 'exploration:indicator-dashboard' }
]
</script>