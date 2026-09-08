<template>
  <UnifiedWorkbench
    module="discovery"
    :shortcuts="shortcuts"
  />
</template>

<script setup lang="ts">
import {
  IconStorage,
  IconUserGroup,
  IconBranch,
  IconSearch,
  IconLink,
  IconDesktop
} from '@arco-design/web-vue/es/icon'
import UnifiedWorkbench from '@/components/common/UnifiedWorkbench.vue'

const shortcuts = [
  { key: 'data-map', title: '数据地图', icon: IconStorage, desc: '浏览所有数据资产', navKey: 'discovery:data-map' },
  { key: 'customer360', title: '客户 360', icon: IconUserGroup, desc: '客户全景查询', navKey: 'discovery:customer360' },
  { key: 'metrics-map', title: '指标地图', icon: IconBranch, desc: '业务指标体系', navKey: 'discovery:metrics-map' },
  { key: 'variable-map', title: '变量地图', icon: IconDesktop, desc: '变量与画像管理', navKey: 'discovery:variable-map' },
  { key: 'lineage', title: '数据血缘', icon: IconLink, desc: '上下游血缘追踪', navKey: 'discovery:lineage' },
  { key: 'search', title: '统一搜索', icon: IconSearch, desc: '跨域资产搜索', navKey: 'discovery:search' },
  { key: 'api-market', title: 'API 市场', icon: IconDesktop, desc: '数据 API 服务', navKey: 'discovery:data-map' },
  { key: 'customer360-demo', title: '客户 360 (示例)', icon: IconUserGroup, desc: '查看示例客户', navKey: 'discovery:customer360-detail' }
]
</script>