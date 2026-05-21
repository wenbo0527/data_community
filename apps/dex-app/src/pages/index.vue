<template>
  <div class="dex-container">
    <div class="page-header">
      <a-typography-title :heading="1">数据探索域 (DEX)</a-typography-title>
      <a-typography-text>客户360全景能力、指标看板、统一分析工作台</a-typography-text>
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
  IconBarChart,
  IconTool
} from '@arco-design/web-vue/es/icon'

const router = useRouter()

const modules = [
  {
    key: 'customer360',
    title: '客户360',
    path: '/customer360',
    icon: IconUser,
    color: 'blue',
    tag: 'PRD',
    description: '客户全景视图与画像分析',
    features: ['客户搜索', '客户详情', '画像分析']
  },
  {
    key: 'indicator-dashboard',
    title: '指标看板',
    path: '/indicator-dashboard',
    icon: IconBarChart,
    color: 'green',
    tag: 'PRD',
    description: '业务指标可视化与实时监控',
    features: ['指标配置', '可视化看板', '实时监控']
  },
  {
    key: 'analytics-workbench',
    title: '统一分析工作台',
    path: '/analytics-workbench',
    icon: IconTool,
    color: 'purple',
    tag: 'PRD',
    description: '自助分析与数据探索工具',
    features: ['数据查询', '可视化分析', '报表导出']
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
  grid-template-columns: repeat(3, 1fr);
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
  color: var(--subapp-primary);
}

.card-description {
  color: var(--subapp-text-tertiary);
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
