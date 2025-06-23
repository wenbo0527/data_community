<template>
  <div class="asset-overview">
    <!-- 页面标题区域 -->
    <div class="page-header">
      <div class="title-area">
        <h1 class="page-title">
          <icon-dashboard />
          资产总览
        </h1>
        <p class="page-description">全面展示数据资产概况，统一管理各类数据资源</p>
      </div>
      
      <!-- 快速操作按钮 -->
      <div class="quick-actions">
        <a-button type="primary" @click="refreshData">
          <template #icon><icon-refresh /></template>
          刷新数据
        </a-button>
        <a-button @click="showGuide">
          <template #icon><icon-question-circle /></template>
          使用指南
        </a-button>
      </div>
    </div>

    <div class="content-section">
      <!-- 统计概览卡片 -->
      <div class="overview-section">
        <a-row :gutter="24">
          <a-col :span="6">
            <a-card class="stat-card" hoverable @click="navigateTo('table-management')">
              <div class="stat-content">
                <div class="stat-icon table-icon">
                  <icon-storage />
                </div>
                <div class="stat-info">
                  <div class="stat-number">89<span class="stat-unit">个</span></div>
                  <div class="stat-label">数据表</div>
                </div>
              </div>
            </a-card>
          </a-col>
          <a-col :span="6">
            <a-card class="stat-card" hoverable @click="navigateTo('external-data-management')">
              <div class="stat-content">
                <div class="stat-icon external-icon">
                  <icon-link />
                </div>
                <div class="stat-info">
                  <div class="stat-number">22<span class="stat-unit">个</span></div>
                  <div class="stat-label">外部数据</div>
                </div>
              </div>
            </a-card>
          </a-col>
          <a-col :span="6">
            <a-card class="stat-card" hoverable @click="navigateTo('metric-management')">
              <div class="stat-content">
                <div class="stat-icon metric-icon">
                  <icon-bar-chart />
                </div>
                <div class="stat-info">
                  <div class="stat-number">45<span class="stat-unit">个</span></div>
                  <div class="stat-label">变量管理</div>
                </div>
              </div>
            </a-card>
          </a-col>
          <a-col :span="6">
            <a-card class="stat-card" hoverable @click="navigateTo('batch-asset-management')">
              <div class="stat-content">
                <div class="stat-icon batch-icon">
                  <icon-settings />
                </div>
                <div class="stat-info">
                  <div class="stat-number">156<span class="stat-unit">个</span></div>
                  <div class="stat-label">标签地图</div>
                </div>
              </div>
            </a-card>
          </a-col>
        </a-row>
      </div>

      <!-- 关系图展示 -->
      <div class="relation-section">
        <a-card class="relation-diagram-card" title="资产关系图">
          <div class="placeholder-diagram">
            <div>
              <icon-apps style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;" />
              <div>资产关系图将在此处显示</div>
              <div style="font-size: 12px; margin-top: 8px; opacity: 0.7;">展示数据表、指标、外数之间的血缘关系</div>
            </div>
          </div>
        </a-card>
      </div>

      <!-- 图表展示区域 -->
      <div class="charts-section">
        <a-row :gutter="24">
          <a-col :span="12">
            <a-card class="chart-card" title="主题域分布">
              <div class="placeholder-chart">
                <div>
                  <div>主题域分布图表</div>
                </div>
              </div>
            </a-card>
          </a-col>
          <a-col :span="12">
            <a-card class="chart-card" title="数据增长趋势">
              <div class="placeholder-chart">
                <div>
                  <div>数据增长趋势图表</div>
                </div>
              </div>
            </a-card>
          </a-col>
        </a-row>
      </div>

      <!-- 功能模块 -->
      <div class="modules-section">
        <h2 class="section-title">资产管理功能</h2>
        <a-row :gutter="24">
          <a-col :span="12">
            <a-card class="module-card" hoverable @click="navigateTo('table-management')">
              <div class="module-header">
                <div class="module-icon table-icon">
                  <icon-storage />
                </div>
                <div class="module-title">
                  <h3>表管理</h3>
                  <p>管理数据库表资产，包括表结构、字段信息、数据质量等</p>
                </div>
              </div>
              <div class="module-features">
                <a-tag>表结构管理</a-tag>
                <a-tag>数据质量监控</a-tag>
                <a-tag>血缘关系</a-tag>
              </div>
            </a-card>
          </a-col>
          
          <a-col :span="12">
            <a-card class="module-card" hoverable @click="navigateTo('external-data-management')">
              <div class="module-header">
                <div class="module-icon external-icon">
                  <icon-link />
                </div>
                <div class="module-title">
                  <h3>外数管理</h3>
                  <p>管理外部数据源，包括API接口、文件数据、第三方数据库等</p>
                </div>
              </div>
              <div class="module-features">
                <a-tag>数据源配置</a-tag>
                <a-tag>连接测试</a-tag>
                <a-tag>数据同步</a-tag>
              </div>
            </a-card>
          </a-col>
        </a-row>
        
        <a-row :gutter="24" style="margin-top: 24px;">
          <a-col :span="12">
            <a-card class="module-card" hoverable @click="navigateTo('metric-management')">
              <div class="module-header">
                <div class="module-icon metric-icon">
                  <icon-bar-chart />
                </div>
                <div class="module-title">
                  <h3>指标管理</h3>
                  <p>管理业务指标定义、计算规则、监控阈值等</p>
                </div>
              </div>
              <div class="module-features">
                <a-tag>指标定义</a-tag>
                <a-tag>计算规则</a-tag>
                <a-tag>监控告警</a-tag>
              </div>
            </a-card>
          </a-col>
          
          <a-col :span="12">
            <a-card class="module-card" hoverable @click="navigateTo('batch-asset-management')">
              <div class="module-header">
                <div class="module-icon batch-icon">
                  <icon-settings />
                </div>
                <div class="module-title">
                  <h3>资产批量管理</h3>
                  <p>批量导入、导出、更新资产信息，提高管理效率</p>
                </div>
              </div>
              <div class="module-features">
                <a-tag>批量导入</a-tag>
                <a-tag>批量操作</a-tag>
                <a-tag>数据导出</a-tag>
              </div>
            </a-card>
          </a-col>
        </a-row>
      </div>

      <!-- 最近活动 -->
      <div class="activity-section">
        <a-card title="最近活动">
          <a-timeline>
            <a-timeline-item>
              <div class="activity-item">
                <span class="activity-user">张三</span>
                <span class="activity-action">创建了表资产</span>
                <span class="activity-target">user_profile</span>
                <span class="activity-time">2小时前</span>
              </div>
            </a-timeline-item>
            <a-timeline-item>
              <div class="activity-item">
                <span class="activity-user">李四</span>
                <span class="activity-action">更新了指标</span>
                <span class="activity-target">用户活跃度</span>
                <span class="activity-time">4小时前</span>
              </div>
            </a-timeline-item>
            <a-timeline-item>
              <div class="activity-item">
                <span class="activity-user">王五</span>
                <span class="activity-action">配置了外数源</span>
                <span class="activity-target">央行征信数据</span>
                <span class="activity-time">1天前</span>
              </div>
            </a-timeline-item>
          </a-timeline>
        </a-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  IconDashboard,
  IconRefresh,
  IconQuestionCircle,
  IconStorage, 
  IconLink, 
  IconSettings,
  IconApps
} from '@arco-design/web-vue/es/icon'

const router = useRouter()

// 响应式数据
const layoutDimensions = ref({ width: 0, height: 0 })

// 生命周期
onMounted(() => {
  updateLayoutDimensions()
  window.addEventListener('resize', updateLayoutDimensions)
})

// 方法
const updateLayoutDimensions = () => {
  layoutDimensions.value = {
    width: window.innerWidth,
    height: window.innerHeight
  }
  console.log('Layout dimensions updated:', layoutDimensions.value)
}

const refreshData = () => {
  console.log('刷新数据')
  // 这里可以添加刷新数据的逻辑
}

const showGuide = () => {
  console.log('显示使用指南')
  // 这里可以添加显示指南的逻辑
}

const navigateTo = (path: string) => {
  router.push(`/discovery/asset-management/${path}`)
}
</script>

<style scoped>
.asset-overview {
  background: var(--color-bg-1);
  min-height: 100vh;
}

.page-header {
  background: var(--color-bg-2);
  border-bottom: 1px solid var(--color-border-2);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
}

.title-area {
  width: 100%;
  max-width: 1420px;
  margin: 0 auto;
  padding: 24px 0;
  box-sizing: border-box;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text-1);
  margin: 0 0 4px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-description {
  font-size: 16px;
  color: var(--color-text-2);
  margin: 0;
}

.quick-actions {
  display: flex;
  gap: 8px;
}

.content-section {
  margin-top: 16px;
  min-height: calc(100vh - 180px);
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  margin: 0 auto;
  padding: 0 24px;
  box-sizing: border-box;
  max-width: 1420px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text-1);
  margin: 0 0 16px 0;
}

.overview-section {
  margin-bottom: 32px;
}

.stat-card {
  cursor: pointer;
  transition: all 0.2s var(--transition-timing-function-standard);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  height: 132px;
  border-radius: var(--border-radius-medium);
  background: var(--color-bg-2);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px -4px rgba(0, 0, 0, 0.08);
}

.stat-content {
  display: flex;
  align-items: center;
  padding: 16px 24px;
  height: 100%;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 24px;
  color: white;
}

.table-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.external-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.metric-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.batch-icon {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 28px;
  font-weight: 600;
  color: var(--color-text-1);
  line-height: 1;
}

.stat-unit {
  font-size: 14px;
  color: var(--color-text-3);
  margin-left: 4px;
}

.stat-label {
  font-size: 14px;
  color: var(--color-text-2);
  margin-top: 4px;
}

.relation-section {
  margin-bottom: 24px;
}

.relation-diagram-card,
.chart-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.placeholder-diagram {
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-fill-2);
  color: var(--color-text-3);
  border-radius: 8px;
  margin: 16px;
  position: relative;
  text-align: center;
}

.charts-section {
  margin-bottom: 32px;
}

.placeholder-chart {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-fill-2);
  color: var(--color-text-3);
  border-radius: 8px;
  margin: 16px;
  text-align: center;
}

.modules-section {
  margin-bottom: 32px;
}

.module-card {
  cursor: pointer;
  transition: all 0.3s;
  height: 160px;
}

.module-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.module-header {
  display: flex;
  align-items: flex-start;
  margin-bottom: 16px;
}

.module-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-size: 20px;
  color: white;
  flex-shrink: 0;
}

.module-title {
  flex: 1;
}

.module-title h3 {
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-1);
}

.module-title p {
  margin: 0;
  font-size: 14px;
  color: var(--color-text-2);
  line-height: 1.4;
}

.module-features {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.activity-section {
  max-width: 600px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.activity-user {
  font-weight: 600;
  color: var(--color-text-1);
}

.activity-action {
  color: var(--color-text-2);
}

.activity-target {
  color: var(--color-primary-6);
  font-weight: 500;
}

.activity-time {
  color: var(--color-text-3);
  font-size: 12px;
  margin-left: auto;
}
</style>