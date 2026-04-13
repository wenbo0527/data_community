<template>
  <div class="dmt-container">
    <div class="page-header">
      <a-typography-title :heading="1">数据管理域 (DMT)</a-typography-title>
      <a-typography-text>数据治理与标准化管理平台</a-typography-text>
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
  IconBooks,
  IconStorage,
  IconSettings,
  IconBranch,
  IconFile,
  IconTable,
  IconCheckCircle,
  IconSearch
} from '@arco-design/web-vue/es/icon'

const router = useRouter()

const modules = [
  {
    key: 'data-standard',
    title: '数据标准',
    path: '/data-standard',
    icon: IconBooks,
    color: 'blue',
    tag: '核心',
    description: '数据标准体系设计与执行',
    features: ['标准管理', '标准词', '代码管理', '域管理', '审计']
  },
  {
    key: 'metadata',
    title: '元数据',
    path: '/metadata',
    icon: IconStorage,
    color: 'green',
    tag: '基础',
    description: '元数据建模与查询管理',
    features: ['建模管理', '查询管理', '版本控制']
  },
  {
    key: 'business-concept',
    title: '业务概念',
    path: '/business-concept',
    icon: IconBranch,
    color: 'purple',
    tag: '治理',
    description: '业务术语与概念定义管理',
    features: ['概念定义', '关系管理', '版本追踪']
  }
]

const handleNavigate = (path) => {
  router.push(path)
}
</script>

<style scoped>
.dmt-container {
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

@media (max-width: 900px) {
  .module-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
