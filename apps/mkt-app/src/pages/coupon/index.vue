<template>
  <div class="coupon-dashboard">
    <div class="page-header">
      <a-typography-title :heading="1">权益中心</a-typography-title>
      <a-typography-text>统一管理优惠券、权益券、券包及数据统计</a-typography-text>
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

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const modules = [
  {
    key: 'template',
    title: '模板管理',
    icon: 'IconTemplate',
    path: '/marketing/benefit/template',
    color: 'blue',
    tag: '核心',
    description: '创建和管理权益模板，包括优惠券、折扣券、兑换券等',
    features: ['模板创建', '规则配置', '批量生成']
  },
  {
    key: 'management',
    title: '券管理',
    icon: 'IconTicket',
    path: '/marketing/benefit/management',
    color: 'green',
    tag: '核心',
    description: '管理所有已生成的权益券，支持查询、发放、回收等操作',
    features: ['券查询', '手动发放', '批量操作']
  },
  {
    key: 'package',
    title: '券包管理',
    icon: 'IconPackage',
    path: '/marketing/benefit/package',
    color: 'purple',
    tag: '常用',
    description: '管理券包，支持将多个权益组合成券包进行发放',
    features: ['券包创建', '组合配置', '发放管理']
  },
  {
    key: 'logs',
    title: '权益日志',
    icon: 'IconRecord',
    path: '/marketing/statistics/logs',
    color: 'orange',
    tag: '数据',
    description: '查看所有权益的发放、使用、退款等操作记录',
    features: ['操作日志', '数据追溯', '统计分析']
  },
  {
    key: 'inventory',
    title: '库存查询',
    icon: 'IconStorage',
    path: '/marketing/statistics/inventory',
    color: 'cyan',
    tag: '数据',
    description: '查询各权益的库存情况，支持批量导入和预警设置',
    features: ['库存查询', '批量导入', '预警配置']
  },
  {
    key: 'rules',
    title: '规则配置',
    icon: 'IconSettings',
    path: '/marketing/global/rules',
    color: 'arcoblue',
    tag: '配置',
    description: '配置权益发放规则、核销规则、有效期规则等',
    features: ['发放规则', '核销规则', '有效期规则']
  }
]

function handleNavigate(path: string) {
  router.push(path)
}
</script>

<style scoped>
.coupon-dashboard {
  padding: 24px;
}

.page-header {
  margin-bottom: 24px;
}

.page-header :deep(.arco-typography-title) {
  margin-bottom: 8px;
}

.module-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 20px;
}

.module-card {
  cursor: pointer;
  transition: all 0.3s;
}

.module-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.card-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.module-icon {
  font-size: 20px;
}

.card-description {
  color: #666;
  font-size: 14px;
  margin-bottom: 12px;
  min-height: 40px;
}

.card-features {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
</style>
