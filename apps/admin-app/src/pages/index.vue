<template>
  <div class="admin-container">
    <div class="page-header">
      <a-typography-title :heading="1">通用域 (COM)</a-typography-title>
      <a-typography-text>企业通用数据能力与治理平台</a-typography-text>
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
  IconStorage,
  IconRelation,
  IconMap,
  IconFiles,
  IconSettings,
  IconSafe,
  IconBranch,
  IconTable
} from '@arco-design/web-vue/es/icon'

const router = useRouter()

const modules = [
  {
    key: 'accompany',
    title: '伴随数据',
    path: '/accompany',
    icon: IconUser,
    color: 'blue',
    tag: '核心',
    description: '用户行为数据采集、存储与分析',
    features: ['数据采集', '行为分析', '用户画像']
  },
  {
    key: 'data-models',
    title: '数据模型',
    path: '/data-models',
    icon: IconTable,
    color: 'green',
    tag: '核心',
    description: '数据模型设计、定义与管理',
    features: ['模型设计', '字段管理', '版本控制']
  },
  {
    key: 'data-standard',
    title: '数据标准',
    path: '/data-standard',
    icon: IconFiles,
    color: 'purple',
    tag: '治理',
    description: '数据标准定义、发布与执行',
    features: ['标准定义', '标准发布', '标准检查']
  },
  {
    key: 'data-map',
    title: '数据地图',
    path: '/data-map',
    icon: IconMap,
    color: 'cyan',
    tag: '数据',
    description: '全局数据资产可视化与检索',
    features: ['资产目录', '智能检索', '血缘分析']
  },
  {
    key: 'metadata',
    title: '元数据',
    path: '/metadata',
    icon: IconStorage,
    color: 'orange',
    tag: '基础',
    description: '元数据采集、治理与检索',
    features: ['元数据采集', '质量管理', '生命周期']
  },
  {
    key: 'permission',
    title: '权限管理',
    path: '/permission',
    icon: IconSafe,
    color: 'red',
    tag: '安全',
    description: '数据权限申请、审批与管控',
    features: ['权限申请', '审批流程', '权限审计']
  },
  {
    key: 'service',
    title: '服务管理',
    path: '/service',
    icon: IconRelation,
    color: 'geekblue',
    tag: '服务',
    description: '数据服务注册、发布与调用',
    features: ['服务注册', '服务发布', '调用监控']
  },
  {
    key: 'business-concept',
    title: '业务概念',
    path: '/business-concept',
    icon: IconBranch,
    color: 'magenta',
    tag: '治理',
    description: '业务术语定义与标准化管理',
    features: ['概念定义', '关系管理', '版本追踪']
  },
  {
    key: 'asset-management',
    title: '资产管理',
    path: '/asset-management',
    icon: IconStorage,
    color: 'gold',
    tag: '资产',
    description: '数据资产盘点、分类与估值',
    features: ['资产盘点', '分类管理', '价值评估']
  }
]

const handleNavigate = (path) => {
  router.push(path)
}
</script>

<style scoped>
.admin-container {
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
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 900px) {
  .module-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
