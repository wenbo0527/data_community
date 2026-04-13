<template>
  <div class="dex-container">
    <div class="page-header">
      <a-typography-title :heading="1">数据探索域 (DEX)</a-typography-title>
      <a-typography-text>数据探索与分析平台</a-typography-text>
    </div>
    
    <div class="module-grid">
      <a-card 
        v-for="module in modules" 
        :key="module.key"
        class="module-card"
        hoverable
        @click="handleNavigate(module.path)"
      >
        <template #title>
          <div class="card-title">
            <component :is="module.icon" class="module-icon" />
            <span>{{ module.title }}</span>
          </div>
        </template>
        <template #extra>
          <a-tag :color="module.color">{{ module.tag }}</a-tag>
        </template>
        <div class="card-description">{{ module.description }}</div>
        <div class="card-features">
          <a-tag v-for="feat in module.features" :key="feat" size="small">{{ feat }}</a-tag>
        </div>
      </a-card>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import {
  IconUser,
  IconUserAdd,
  IconList,
  IconChart,
  IconWorkflow,
  IconDataSource,
  IconExplore,
  IconSearch
} from '@arco-design/web-vue/es/icon'

const router = useRouter()

const modules = [
  {
    key: 'customer-center',
    title: '客户中心',
    path: '/customer-center',
    icon: IconUser,
    color: 'blue',
    tag: '核心',
    description: '客户数据整合、标签体系与画像分析',
    features: ['客户档案', '标签系统', '事件中心', '数据源管理']
  },
  {
    key: 'indicator-dashboard',
    title: '指标看板',
    path: '/indicator-dashboard',
    icon: IconChart,
    color: 'green',
    tag: '分析',
    description: '业务指标可视化与实时监控',
    features: ['指标配置', '可视化看板', '实时监控']
  },
  {
    key: 'workflows',
    title: '工作流',
    path: '/workflows',
    icon: IconWorkflow,
    color: 'purple',
    tag: '效率',
    description: '数据处理工作流编排与调度',
    features: ['流程编排', '任务调度', '执行监控']
  },
  {
    key: 'external-data-analysis',
    title: '外部数据分析',
    path: '/external-data-analysis',
    icon: IconExplore,
    color: 'cyan',
    tag: '分析',
    description: '外部数据接入与探索分析',
    features: ['数据接入', '探索分析', '可视化报告']
  }
]

const handleNavigate = (path) => {
  router.push(path)
}
</script>

<style scoped>
.dex-container {
  padding: 24px;
  background: #f5f6f7;
  min-height: 100%;
}

.page-header {
  margin-bottom: 24px;
  text-align: center;
}

.page-header .arco-typography {
  margin-bottom: 8px;
}

.module-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.module-card {
  cursor: pointer;
  transition: all 0.3s;
}

.module-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.module-icon {
  font-size: 18px;
  color: #165dff;
}

.card-description {
  color: #86909c;
  font-size: 14px;
  margin: 12px 0;
  line-height: 1.5;
}

.card-features {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

@media (max-width: 1200px) {
  .module-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
