<template>
  <div class="field-management-page">
    <a-page-header title="字段管理" class="page-header">
      <template #subtitle>
        <span class="header-subtitle">发现域 - 字段级敏感级别与业务分类管理</span>
      </template>
    </a-page-header>

    <a-card :bordered="false">
      <a-alert type="info" :show-icon="true" style="margin-bottom: 16px">
        本页面为占位实现。完整的字段登记入口在
        <router-link to="/home/management/asset-management/basic-management/metadata-collection">管理域 - 元数据采集</router-link>。
      </a-alert>

      <a-row :gutter="16" style="margin-bottom: 16px">
        <a-col :span="6">
          <a-card><a-statistic title="总字段数" :value="1284" /></a-card>
        </a-col>
        <a-col :span="6">
          <a-card><a-statistic title="L1 低敏" :value="756" value-style="{ color: '#00B42A' }" /></a-card>
        </a-col>
        <a-col :span="6">
          <a-card><a-statistic title="L2 中敏" :value="423" value-style="{ color: '#FF7D00' }" /></a-card>
        </a-col>
        <a-col :span="6">
          <a-card><a-statistic title="L3 高敏" :value="105" value-style="{ color: '#F53F3F' }" /></a-card>
        </a-col>
      </a-row>

      <a-table :data="fields" :pagination="{ pageSize: 10 }" :bordered="false">
        <template #columns>
          <a-table-column title="字段" data-index="field">
            <template #cell="{ record }">
              <code>{{ record.field }}</code>
            </template>
          </a-table-column>
          <a-table-column title="所属表" data-index="table" />
          <a-table-column title="类型" data-index="type" :width="100">
            <template #cell="{ record }">
              <a-tag size="small">{{ record.type }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="敏感级别" data-index="sensitivity" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getColor(record.sensitivity)" size="small">{{ record.sensitivity }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="业务分类" data-index="category" :width="120">
            <template #cell="{ record }">
              <a-tag size="small">{{ record.category }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="Owner" data-index="owner" />
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup>
const fields = [
  { field: 'id_card_no', table: 'dim_user', type: 'VARCHAR(20)', sensitivity: 'L3', category: '个人信息', owner: '张三' },
  { field: 'mobile', table: 'dim_user', type: 'VARCHAR(15)', sensitivity: 'L3', category: '个人信息', owner: '张三' },
  { field: 'balance', table: 'dim_user', type: 'DECIMAL(18,2)', sensitivity: 'L2', category: '商业信息', owner: '张三' },
  { field: 'apply_amt', table: 'fact_loan_apply', type: 'DECIMAL(18,2)', sensitivity: 'L3', category: '商业信息', owner: '李四' },
  { field: 'credit_score', table: 'dws_risk_score', type: 'INT', sensitivity: 'L2', category: '商业信息', owner: '风控值班' },
  { field: 'status', table: 'dim_user', type: 'TINYINT', sensitivity: 'L1', category: '一般信息', owner: '张三' },
  { field: 'create_time', table: 'dim_user', type: 'DATETIME', sensitivity: 'L1', category: '一般信息', owner: '张三' },
  { field: 'risk_level', table: 'dws_risk_score', type: 'VARCHAR(10)', sensitivity: 'L3', category: '监管信息', owner: '风控值班' }
]

function getColor(level) {
  return { L1: 'green', L2: 'orange', L3: 'red' }[level] || 'gray'
}
</script>

<style scoped>
.field-management-page { padding: 16px; }
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