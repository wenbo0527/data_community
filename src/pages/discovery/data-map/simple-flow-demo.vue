<template>
  <div class="simple-flow-demo">
    <div class="demo-header">
      <h2>业务流程概览演示</h2>
      <p>展示新的业务流程概览组件</p>
    </div>
    
    <div class="demo-content">
      <ProcessFlowOverview />
    </div>
  </div>
</template>

<script setup lang="ts">
import ProcessFlowOverview from '../../../components/business-process/ProcessFlowOverview.vue'
</script>

<style scoped>
.simple-flow-demo {
  padding: 24px;
  background: #f7f8fa;
  min-height: 100vh;
}

.demo-header {
  margin-bottom: 24px;
  text-align: center;
}

.demo-header h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  color: #1d2129;
}

.demo-header p {
  margin: 0;
  color: #4e5969;
}

.demo-content {
  background: white;
  border-radius: 8px;
  overflow: hidden;
}
</style>