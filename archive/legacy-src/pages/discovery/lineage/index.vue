<template>
  <div class="lineage-application">
    <div class="page-header">
      <div class="title">血缘分析</div>
      <div class="actions">
        <a-space>
          <a-input v-model="form.tableName" placeholder="请输入表名" style="width: 200px" />
          <a-select v-model="form.dataTypes" placeholder="数据类型" multiple style="width: 200px">
            <a-option value="Table">数据表</a-option>
            <a-option value="Metric">指标</a-option>
            <a-option value="API">API</a-option>
            <a-option value="Variable">变量</a-option>
          </a-select>
          <a-input-number v-model="form.layers" placeholder="层数" :min="1" :max="3" style="width: 100px" />
          <a-checkbox v-model="form.onlyFailed">仅显示异常</a-checkbox>
          <a-button type="primary" @click="handleSearch">
            <template #icon><IconSearch /></template>
            查询
          </a-button>
          <a-button status="warning" @click="goImpactAnalysis">
            <template #icon><IconAlert /></template>
            切换到影响分析
          </a-button>
          <a-button @click="goBack">返回</a-button>
        </a-space>
      </div>
    </div>

    <div class="graph-wrapper">
      <LineageGraph
        :table-name="currentTableName"
        :layers="currentLayers"
        :data-types="currentDataTypes"
        :only-failed="currentOnlyFailed"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { IconSearch, IconExclamationCircle as IconAlert } from '@arco-design/web-vue/es/icon'
import LineageGraph from './components/LineageGraph.vue'

const router = useRouter()
const route = useRoute()

const form = reactive({
  tableName: typeof route.query.table === 'string' ? route.query.table : 'dim_user',
  layers: 1,
  dataTypes: [],
  onlyFailed: false
})

const currentTableName = ref(form.tableName)
const currentLayers = ref(form.layers)
const currentDataTypes = ref(form.dataTypes)
const currentOnlyFailed = ref(form.onlyFailed)

const goBack = () => {
  router.push('/home/discovery')
}

/** 跳转到影响分析页面(P0-E:模块互通) */
const goImpactAnalysis = () => {
  router.push({ path: '/home/discovery/impact-analysis', query: { table: currentTableName.value } })
}

const handleSearch = () => {
  currentTableName.value = form.tableName
  currentLayers.value = form.layers
  currentDataTypes.value = form.dataTypes
  currentOnlyFailed.value = form.onlyFailed
}

onMounted(() => {
  // 支持从 ?table=xxx 跳转过来
  if (typeof route.query.table === 'string' && route.query.table) {
    currentTableName.value = route.query.table
    form.tableName = route.query.table
  }
})
</script>

<style scoped>
.lineage-application {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.page-header {
  padding: 16px 24px;
  background: #fff;
  border-bottom: 1px solid #e5e6eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-size: 20px;
  font-weight: 600;
  color: #1d2129;
}

.graph-wrapper {
  flex: 1;
  overflow: hidden;
}
</style>
