<template>
  <div class="mkt-container">
    <div class="page-header">
      <a-typography-title :heading="1">营销域 (MKT)</a-typography-title>
      <a-typography-text>数字营销全场景解决方案</a-typography-text>
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
  IconApps,
  IconMessage,
  IconTag,
  IconStar,
  IconList,
  IconBarChart
} from '@arco-design/web-vue/es/icon'

const router = useRouter()

// 仅保留 mkt-app 自身路由（已通过 router/modules/ 定义）
const modules = [
  {
    key: 'benefit',
    title: '权益中心',
    path: '/benefit',
    icon: IconStar,
    color: 'orange',
    tag: '核心',
    description: '用户权益管理、优惠券发放、会员积分体系',
    features: ['权益包管理', '模板配置', '发放记录']
  },
  {
    key: 'coupon',
    title: '优惠券',
    path: '/coupon/management',
    icon: IconTag,
    color: 'red',
    tag: '核心',
    description: '优惠券创建、发放、核销全流程管理',
    features: ['优惠券模板', '发放规则', '数据统计']
  },
  {
    key: 'marketing',
    title: '营销中心',
    path: '/marketing',
    icon: IconApps,
    color: 'blue',
    tag: '核心',
    description: '营销活动策划、执行、效果分析',
    features: ['活动管理', '任务管理', '效果分析']
  },
  {
    key: 'canvas',
    title: '横向画布',
    path: '/canvas',
    icon: IconBarChart,
    color: 'green',
    tag: '工具',
    description: '可视化营销画布设计工具',
    features: ['画布编辑', '组件市场', '预览发布']
  },
  {
    key: 'alert',
    title: '告警中心',
    path: '/alert',
    icon: IconMessage,
    color: 'red',
    tag: '监控',
    description: '营销业务告警配置与通知',
    features: ['告警规则', '通知配置', '历史记录']
  },
  {
    key: 'tasks',
    title: '任务中心',
    path: '/tasks',
    icon: IconList,
    color: 'green',
    tag: '效率',
    description: '营销任务创建、分配、执行',
    features: ['任务管理', '执行监控', '结果分析']
  }
]

const handleNavigate = (path) => {
  router.push(path)
}
</script>

<style scoped>
.mkt-container {
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
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 900px) {
  .module-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
