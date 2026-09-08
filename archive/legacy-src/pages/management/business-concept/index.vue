<template>
  <div class="business-concept-center">
    <a-tabs v-model:active-key="activeTab" type="card-gutter">
      <a-tab-pane key="domain" title="业务域管理">
        <BusinessDomainList />
      </a-tab-pane>
      <a-tab-pane key="entity" title="业务实体与要素">
        <BusinessEntityList />
      </a-tab-pane>
      <a-tab-pane key="relation" title="业务关系图谱">
        <BusinessRelationGraph />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import BusinessDomainList from './BusinessDomainList.vue';
import BusinessEntityList from './BusinessEntityList.vue';
import BusinessRelationGraph from './BusinessRelationGraph.vue';

const activeTab = ref('domain');
</script>

<style scoped>
.business-concept-center {
  padding: 16px;
  background-color: var(--color-bg-2);
  min-height: 100%;
}
</style>
