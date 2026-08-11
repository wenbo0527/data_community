<template>
  <PageContainer>
    <PageHeader title="血缘构建" sub-title="表级血缘 · 字段血缘 · 上下游追溯">
      <template #extra>
        <a-button @click="goBack"><template #icon><icon-left /></template>返回</a-button>
      </template>
    </PageHeader>

    <div class="content-wrapper">
      <a-card :bordered="false">
        <a-row :gutter="16" style="margin-bottom: 16px">
          <a-col :span="8">
            <a-input-search v-model="tableName" placeholder="输入表名" size="large" enter-button="查询" @search="queryLineage" />
          </a-col>
          <a-col :span="6">
            <a-radio-group v-model="viewMode" type="button" size="large">
              <a-radio-button value="upstream">上游</a-radio-button>
              <a-radio-button value="downstream">下游</a-radio-button>
              <a-radio-button value="both">全部</a-radio-button>
            </a-radio-group>
          </a-col>
        </a-row>

        <div v-if="lineageData.length > 0">
          <h3 style="margin: 16px 0 12px; font-size: 14px">血缘链 ({{ lineageData.length }} 个节点)</h3>
          <div class="lineage-chain">
            <div
              v-for="(node, i) in lineageData" :key="node.name"
              class="lineage-node"
              :class="['level-' + node.level, { current: node.isCurrent }]"
            >
              <a-tag :color="nodeColor(node.type)">{{ node.type?.toUpperCase() }}</a-tag>
              <strong>{{ node.name }}</strong>
              <span class="node-owner">{{ node.owner }}</span>
              <a-icon v-if="i < lineageData.length - 1" class="arrow"><icon-right /></a-icon>
            </div>
          </div>

          <h3 style="margin: 24px 0 12px; font-size: 14px">节点详情</h3>
          <a-table :data="lineageData" :pagination="false" row-key="name" size="small">
            <template #columns>
              <a-table-column title="表名" data-index="name" :width="200" />
              <a-table-column title="层级" data-index="level" :width="100">
                <template #cell="{ record }">L{{ record.level }}</template>
              </a-table-column>
              <a-table-column title="类型" data-index="type" :width="100">
                <template #cell="{ record }">
                  <a-tag :color="nodeColor(record.type)">{{ record.type?.toUpperCase() }}</a-tag>
                </template>
              </a-table-column>
              <a-table-column title="Owner" data-index="owner" :width="120" />
              <a-table-column title="关系" data-index="relation" :width="120" />
              <a-table-column title="记录数" data-index="recordCount" :width="130" />
            </template>
          </a-table>
        </div>
        <a-empty v-else description="输入表名查询血缘关系" />
      </a-card>
    </div>
  </div>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import PageContainer from '@/components-dca/common/PageContainer.vue'
import PageHeader from '@/components-dca/common/PageHeader.vue'

const router = useRouter()
const route = useRoute()
const tableName = ref(route.query.table as string || 'dws_risk_score')
const viewMode = ref<'upstream' | 'downstream' | 'both'>('both')
const lineageData = ref<any[]>([])

function queryLineage() {
  if (!tableName.value) {
    Message.warning('请输入表名')
    return
  }
  const t = tableName.value
  lineageData.value = [
    { name: t, level: 0, type: 'dws', owner: '王运营', relation: '当前表', recordCount: 120000, isCurrent: true },
    { name: 'dwd_risk_detail', level: 1, type: 'dwd', owner: '王运营', relation: '上游', recordCount: 800000 },
    { name: 'ods_user_action', level: 2, type: 'dim', owner: '王运营', relation: '上游', recordCount: 5000000 },
    { name: 'dws_user_active_day', level: 1, type: 'dws', owner: '王运营', relation: '下游', recordCount: 800000 },
    { name: 'dws_risk_score', level: 1, type: 'dws', owner: '王运营', relation: '下游', recordCount: 120000 },
    { name: 'ads_risk_dashboard', level: 2, type: 'ads', owner: '张风控', relation: '下游', recordCount: 120000 },
    { name: 'api_risk_query', level: 2, type: 'api', owner: '王运营', relation: '下游', recordCount: 0 }
  ]
  if (viewMode.value === 'upstream') lineageData.value = lineageData.value.filter(n => n.level <= 0 || n.relation === '上游')
  if (viewMode.value === 'downstream') lineageData.value = lineageData.value.filter(n => n.level <= 0 || n.relation === '下游')
  Message.success(`找到 ${lineageData.value.length} 个血缘节点`)
}

function nodeColor(t: string) { return { dim: 'arcoblue', dwd: 'green', dws: 'orange', ads: 'purple', api: 'cyan' }[t] || 'gray' }
const goBack = () => router.push('discovery')
queryLineage()
</script>

<style lang="scss" scoped>
/* 2026-08-06 统一:页面背景/高度由 PageContainer 提供 */
.content-wrapper { padding: 0 24px 24px; }
.lineage-chain {
  display: flex; flex-wrap: wrap; align-items: center; gap: 12px;
  padding: 16px; background: #fafbfc; border-radius: 4px;
}
.lineage-node {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 12px; background: white; border-radius: 4px;
  border: 1px solid #e5e6eb;
  &.current { border-color: #165dff; background: #e8f3ff; font-weight: 600; }
  .node-owner { color: #86909c; font-size: 12px; }
  .arrow { color: #c9cdd4; margin-left: 12px; }
}
</style>
