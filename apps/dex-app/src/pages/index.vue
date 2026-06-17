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
          <span
            v-for="feat in module.features"
            :key="feat.label"
            class="feat-tag"
            :class="{ 'feat-tag-external': feat.external }"
            @click.stop="handleFeatureClick(feat)"
          >{{ feat.label }}</span>
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
  IconTool,
  IconRobot
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
    features: [
      { label: '客户搜索', path: '/customer360' },
      { label: '客户详情', path: '/customer360/detail' },
      { label: '画像分析', path: '/customer360/profile' }
    ]
  },
  {
    key: 'indicator-dashboard',
    title: '指标看板',
    path: '/indicator-dashboard',
    icon: IconBarChart,
    color: 'green',
    tag: 'PRD',
    description: '业务指标可视化与实时监控',
    features: [
      { label: '指标配置', path: '/indicator-dashboard/config' },
      { label: '可视化看板', path: '/indicator-dashboard/board' },
      { label: '实时监控', path: '/indicator-dashboard/monitor' }
    ]
  },
  {
    key: 'analytics-workbench',
    title: '统一分析工作台',
    path: '/analytics-workbench',
    icon: IconTool,
    color: 'purple',
    tag: 'PRD',
    description: '自助分析与数据探索工具',
    features: [
      { label: '数据查询', path: '/analytics-workbench' },
      { label: '可视化分析', path: '/analytics-workbench' },
      { label: '报表导出', path: '/analytics-workbench' },
      { label: '问小数', path: 'https://118.196.79.130:8445/ask-xiaoshu', external: true, icon: IconRobot }
    ]
  }
]

const handleNavigate = (path) => {
  router.push(path)
}

const handleFeatureClick = (feat) => {
  if (feat.external) {
    window.open(feat.path, '_blank')
  } else {
    router.push(feat.path)
  }
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

.feat-tag {
  display: inline-block;
  padding: 2px 10px;
  background: #f2f3f5;
  border-radius: 4px;
  font-size: 12px;
  color: #4e5969;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.feat-tag:hover {
  background: #e8f3ff;
  color: #165dff;
}

.feat-tag-external {
  background: #fff0e8;
  color: #f53f3f;
  border-color: #ffdac1;
}

.feat-tag-external:hover {
  background: #ffe8da;
  color: #d91c1c;
}

@media (max-width: 1200px) {
  .module-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
