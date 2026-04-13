<template>
  <div class="asset-container">
    <div class="page-header">
      <a-typography-title :heading="1">数据资产域 (DFD)</a-typography-title>
      <a-typography-text>数据资产管理与运营平台</a-typography-text>
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
  IconStorage,
  IconMap,
  IconTable,
  IconDashboard,
  IconTag,
  IconList,
  IconSettings,
  IconSource
} from '@arco-design/web-vue/es/icon'

const router = useRouter()

const modules = [
  {
    key: 'asset-overview',
    title: '资产概览',
    path: '/asset-management/overview',
    icon: IconDashboard,
    color: 'blue',
    tag: '总览',
    description: '数据资产全局视图与统计分析',
    features: ['资产统计', '质量概览', '趋势分析']
  },
  {
    key: 'basic-management',
    title: '基础管理',
    path: '/asset-management/basic-management',
    icon: IconSettings,
    color: 'green',
    tag: '基础',
    description: '数据资产基础配置与管理',
    features: ['元数据采集', '标签管理', '分类管理']
  },
  {
    key: 'listing-management',
    title: '目录管理',
    path: '/asset-management/listing-management',
    icon: IconList,
    color: 'purple',
    tag: '核心',
    description: '数据资产编目、注册与发布',
    features: ['表管理', '指标管理', '变量管理', '元素管理']
  },
  {
    key: 'data-map',
    title: '数据地图',
    path: '/data-map',
    icon: IconMap,
    color: 'cyan',
    tag: '工具',
    description: '数据资产可视化与关系图谱',
    features: ['资产检索', '血缘分析', '影响评估']
  }
]

const handleNavigate = (path) => {
  router.push(path)
}
</script>

<style scoped>
.asset-container {
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
