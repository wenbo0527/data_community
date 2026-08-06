<!--
  血缘与使用 Tab · 文档 §三 模块 G/H
  适配原 detail.vue 数据结构
-->
<template>
  <div class="tab-content">
    <a-card title="数据血缘（来源 · 上游链路）" class="detail-card">
      <LineageGraph
        class="lineage-graph"
        :table-name="variableCode || variableName || '变量'"
        :layers="2"
        :data-types="['Variable', 'Table', 'Metric', 'API']"
        :upstream="upstreamLineage"
        :downstream="downstreamLineage"
      />
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { LineageGraph } from '@app/lineage-graph'

/**
 * 数据血缘 Tab（用户反馈：只保留数据血缘）
 * 之前包含：数据源信息 / 外数关联 / 字段映射 / 使用统计 / 使用场景列表
 * 现在仅保留：数据血缘（来源 · 上游链路）+ 下游消费方（在同一图中展示）
 */
interface Props {
  upstreamLineage: any[]
  downstreamLineage: any[]
  variableCode?: string
  variableName?: string
}

defineProps<Props>()
</script>

<style scoped>
.lineage-graph {
  min-height: 400px;
}
</style>
