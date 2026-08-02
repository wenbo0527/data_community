<template>
  <UnifiedWorkbench
    module="management"
    :shortcuts="shortcuts"
  />
</template>

<script setup lang="ts">
import {
  IconStorage,
  IconSafe,
  IconCommon,
  IconSettings,
  IconDesktop,
  IconLink,
  IconUser
} from '@arco-design/web-vue/es/icon'
import UnifiedWorkbench from '@/components/common/UnifiedWorkbench.vue'

const shortcuts = [
  { key: 'service', title: '数据服务', icon: IconDesktop, desc: 'API 与服务管理', navKey: 'management:service' },
  { key: 'metadata', title: '元数据建模', icon: IconStorage, desc: '管理数据资产元数据', navKey: 'management:metadata-modeling' },
  { key: 'data-permission', title: '数据权限', icon: IconSafe, desc: '字段级权限配置', navKey: 'management:data-permission' },
  { key: 'standard', title: '数据标准', icon: IconCommon, desc: '业务标准治理', navKey: 'management:data-standard' },
  { key: 'business-concept', title: '业务概念', icon: IconLink, desc: '业务域 / 实体 / 图谱', navKey: 'management:business-concept' },
  { key: 'asset', title: '资产管理', icon: IconSettings, desc: '资产上下架', navKey: 'management:service' },
  { key: 'role', title: '角色管理', icon: IconUser, desc: '角色 / 用户', navKey: 'management:data-permission' }
]
</script>