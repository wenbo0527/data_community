<template>
  <div class="table-management-page">
    <a-page-header title="表管理" class="page-header">
      <template #subtitle>
        <span class="header-subtitle">发现域 - 业务分析师可见的表/数据集列表</span>
      </template>
    </a-page-header>

    <a-card :bordered="false">
      <a-alert type="info" :show-icon="true" style="margin-bottom: 16px">
        本页面为占位实现。完整的表管理入口在
        <router-link to="/home/management/asset-management/listing-management/table-management">管理域 - 表登记</router-link>。
      </a-alert>

      <a-table :data="tables" :pagination="false" :bordered="false">
        <template #columns>
          <a-table-column title="表名" data-index="name">
            <template #cell="{ record }">
              <code>{{ record.name }}</code>
            </template>
          </a-table-column>
          <a-table-column title="所属域" data-index="domain">
            <template #cell="{ record }">
              <a-tag>{{ record.domain }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="敏感级别" data-index="sensitivity" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getColor(record.sensitivity)">{{ record.sensitivity }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="Owner" data-index="owner" :width="100" />
          <a-table-column title="最后更新" data-index="updateTime" :width="180" />
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup>
const tables = [
  { name: 'dim_user', domain: '客户域', sensitivity: 'L2', owner: '张三', updateTime: '2025-08-08 10:00' },
  { name: 'fact_loan_apply', domain: '信贷域', sensitivity: 'L3', owner: '李四', updateTime: '2025-08-07 22:00' },
  { name: 'dws_user_value', domain: '用户价值', sensitivity: 'L2', owner: '王五', updateTime: '2025-08-08 09:00' },
  { name: 'ods_pay', domain: '交易域', sensitivity: 'L1', owner: '李四', updateTime: '2025-08-08 11:00' },
  { name: 'dws_risk_score', domain: '风控域', sensitivity: 'L3', owner: '风控值班', updateTime: '2025-08-07 18:00' }
]

function getColor(level) {
  return { L1: 'green', L2: 'orange', L3: 'red' }[level] || 'gray'
}
</script>

<style scoped>
.table-management-page { padding: 16px; }
.page-header { background: #fff; margin-bottom: 12px; }
.header-subtitle { color: var(--color-text-3); font-size: 13px; }
code {
  background: var(--color-fill-2);
  padding: 2px 6px;
  border-radius: 3px;
  font-family: monospace;
  color: #165dff;
}
</style>