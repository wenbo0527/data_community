<template>
  <div class="marketing-center">
    <!-- P0-模板-fail-#2 (qa 15:17 fail) 修复: 加 router-view, 让 marketing 子路由 (benefit/template, benefit/management, statistics/inventory, alert/* 等) 能渲染 -->
    <!-- 模式与 src/pages/benefit/index.vue 一致: dashboard 在根路径显示, 子路由在 router-view 处渲染 -->
    <template v-if="isRootPath">
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
    </template>
    <router-view v-else />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
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
const route = useRoute()

// P0-模板-fail-#2 (qa 15:17 fail) 修复: 根路径是 /marketing 时显示 dashboard, 其他路径 (benefit/template, benefit/management, statistics/inventory 等) 走 router-view
const isRootPath = computed(() => {
  const fullPath = route.path
  // /marketing 或 /marketing/ 视为根路径 (hash 模式: /mkt/#/marketing)
  return fullPath === '/marketing' || fullPath === '/marketing/' || fullPath === '/mkt/marketing' || fullPath === '/mkt/marketing/'
})

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
    path: "/marketing/benefit/management",
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
