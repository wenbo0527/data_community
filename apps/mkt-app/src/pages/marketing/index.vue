<template>
  <div class="marketing-center">
    <div class="page-header">
      <a-typography-title :heading="1">营销中心</a-typography-title>
      <a-typography-text>营销活动管理、任务调度与效果分析</a-typography-text>
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
  IconStar,
  IconTag,
  IconBarChart,
  IconList,
  IconSettings,
  IconCheckCircle
} from '@arco-design/web-vue/es/icon'

const router = useRouter()

const modules = [
  {
    key: 'tasks',
    title: '任务中心',
    path: '/marketing/tasks',
    icon: IconList,
    color: 'blue',
    tag: '核心',
    description: '营销任务创建、调度、执行与监控',
    features: ['任务管理', '任务执行', '结果分析']
  },
  {
    key: 'coupon',
    title: '优惠券',
    path: '/marketing/coupon/management',
    icon: IconTag,
    color: 'red',
    tag: '核心',
    description: '优惠券创建、发放、核销全流程管理',
    features: ['优惠券模板', '发放规则', '数据统计', '库存管理']
  },
  {
    key: 'alert',
    title: '告警中心',
    path: '/marketing/alert',
    icon: IconMessage,
    color: 'orange',
    tag: '监控',
    description: '营销业务告警配置与通知',
    features: ['告警规则', '通知配置', '历史记录']
  },
  {
    key: 'benefit',
    title: '权益中心',
    path: '/marketing/benefit',
    icon: IconStar,
    color: 'green',
    tag: '权益',
    description: '用户权益管理、发放与核销',
    features: ['权益包管理', '模板配置', '发放记录']
  },
  {
    key: 'canvas',
    title: '画布工具',
    path: '/marketing/canvas',
    icon: IconBarChart,
    color: 'purple',
    tag: '工具',
    description: '可视化画布设计工具',
    features: ['画布编辑', '组件市场', '预览发布']
  },
  {
    key: 'global',
    title: '全局配置',
    path: '/marketing/global',
    icon: IconSettings,
    color: 'cyan',
    tag: '配置',
    description: '营销全局配置与规则引擎',
    features: ['全局配置', '规则管理', '参数设置']
  }
]

const handleNavigate = (path) => {
  router.push(path)
}
</script>

<style scoped>
.marketing-center {
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

@media (max-width: 900px) {
  .module-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
