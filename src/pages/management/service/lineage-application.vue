<template>
  <div class="lineage-application">
    <div class="page-header">
      <div class="title">血缘应用</div>
      <div class="actions">
        <a-space>
          <a-input v-model="form.tableName" placeholder="请输入表名" style="width: 200px" />
          <a-input-number v-model="form.layers" placeholder="层数" :min="1" :max="3" style="width: 100px" />
          <a-button type="primary" @click="handleSearch">
            <template #icon><icon-search /></template>
            查询
          </a-button>
          <a-button @click="goBack">返回</a-button>
        </a-space>
      </div>
    </div>

    <div class="graph-wrapper">
      <LineageGraph :table-name="currentTableName" :layers="currentLayers" />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { IconSearch } from '@arco-design/web-vue/es/icon'
import LineageGraph from './components/LineageGraph.vue'

const router = useRouter()

const form = reactive({
  tableName: 'dim_user',
  layers: 1
})

const currentTableName = ref(form.tableName)
const currentLayers = ref(form.layers)

const goBack = () => {
  router.push('/management/service')
}

const handleSearch = () => {
  currentTableName.value = form.tableName
  currentLayers.value = form.layers
}
</script>

<style scoped>
.lineage-application {
  height: 100vh;
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
