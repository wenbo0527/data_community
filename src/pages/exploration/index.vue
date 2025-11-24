<template>
  <div class="home-container">
    <div class="hero">
      <div class="hero-content">
        <div class="hero-title">数字社区 · 数据探索</div>
        <div class="hero-subtitle">统一入口，快速抵达关键业务模块</div>
        <a-space>
          <a-button type="primary" size="large" @click="goDiscovery">
            <template #icon><icon-search /></template>
            探索数据
          </a-button>
          <a-button status="success" size="large" @click="goMarketing">
            <template #icon><icon-dashboard /></template>
            营销画布
          </a-button>
          <a-button size="large" @click="goExternal">
            <template #icon><icon-unordered-list /></template>
            外部数据
          </a-button>
          <a-button size="large" @click="goManagement">
            <template #icon><icon-apps /></template>
            资源管理
          </a-button>
        </a-space>
      </div>
    </div>

    <div class="modules">
      <a-row :gutter="[16, 16]">
        <a-col :span="6" v-for="card in cards" :key="card.key">
          <a-card :title="card.title" hoverable class="module-card" @click="navigate(card.path)">
            <div class="card-desc">{{ card.desc }}</div>
            <a-space style="margin-top: 8px">
              <a-button type="text" @click.stop="navigate(card.path)">
                <template #icon><icon-right /></template>
                进入
              </a-button>
            </a-space>
          </a-card>
        </a-col>
      </a-row>
    </div>
  </div>
  </template>

<script setup>
import { useRouter } from 'vue-router'
import { 
  IconSearch, 
  IconDashboard, 
  IconUnorderedList, 
  IconApps,
  IconRight
} from '@arco-design/web-vue/es/icon'

const router = useRouter()
const navigate = (path) => router.push(path)

const goDiscovery = () => router.push('/discovery/index')
const goMarketing = () => router.push('/marketing/index')
const goExternal = () => router.push('/external-data-v1/index')
const goManagement = () => router.push('/management/index')

const cards = [
  { key: 'discovery', title: '数据发现', path: '/discovery/index', desc: '指标地图、搜索、数据关系与可视化' },
  { key: 'marketing', title: '营销画布', path: '/marketing/index', desc: '任务流编辑、业务流程与执行统计' },
  { key: 'external', title: '外部数据', path: '/external-data-v1/index', desc: '外部数据导入、评估与档案管理' },
  { key: 'management', title: '资源管理', path: '/management/index', desc: '数据模型、权限与服务管理' }
]
</script>

<style scoped>
.home-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.hero {
  border-radius: 12px;
  background: linear-gradient(135deg, #e0f2fe 0%, #f1f5f9 50%, #ffffff 100%);
  padding: 32px 24px;
}

.hero-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.hero-title {
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #0f172a;
}

.hero-subtitle {
  font-size: 14px;
  color: #475569;
}

.modules {
  display: flex;
  flex-direction: column;
}

.module-card {
  cursor: pointer;
}

.card-desc {
  font-size: 13px;
  color: #64748b;
}

@media (max-width: 1200px) {
  .hero-title { font-size: 22px; }
  .hero-subtitle { font-size: 13px; }
}

@media (max-width: 992px) {
  .hero { padding: 24px 16px; }
}
</style>