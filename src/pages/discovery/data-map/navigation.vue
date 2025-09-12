<template>
  <div class="data-map-navigation">
    <div class="navigation-header">
      <h1 class="page-title">数据地图导航</h1>
      <p class="page-description">选择您要访问的数据地图功能模块</p>
    </div>

    <div class="navigation-grid">
      <!-- 原始数据地图 -->
      <div class="nav-card" @click="navigateTo('/discovery/data-map')">
        <div class="card-icon">
          <icon-search />
        </div>
        <h3 class="card-title">数据搜索</h3>
        <p class="card-description">原始的数据地图搜索功能</p>
        <div class="card-footer">
          <a-tag color="blue">当前版本</a-tag>
        </div>
      </div>

      <!-- 流程概览演示页面 -->
      <div class="nav-card featured" @click="navigateTo('/discovery/data-map/simple-flow-demo')">
        <div class="card-icon">
          <icon-eye />
        </div>
        <h3 class="card-title">业务流程概览</h3>
        <p class="card-description">全新的业务流程全貌展示，支持12个步骤的友好展示，点击查看详细数据表和指标</p>
        <div class="card-footer">
          <a-tag color="green">最新版本</a-tag>
          <a-tag color="orange">推荐</a-tag>
        </div>
      </div>

      <!-- 侧边栏布局演示 - 方案三 -->
      <div class="nav-card" @click="navigateTo('/discovery/data-map/sidebar-layout-demo')">
        <div class="card-icon">
          <icon-layout />
        </div>
        <h3 class="card-title">侧边栏布局演示 - 方案三</h3>
        <p class="card-description">左侧步骤列表 + 右侧详情面板，完美解决12个步骤的展示拥挤问题</p>
        <div class="card-footer">
          <a-tag color="purple">方案三</a-tag>
          <a-tag color="red">新方案</a-tag>
        </div>
      </div>

      <!-- 表格列表 -->
      <div class="nav-card" @click="navigateTo('/discovery/data-map/table-list')">
        <div class="card-icon">
          <icon-file />
        </div>
        <h3 class="card-title">表格列表</h3>
        <p class="card-description">查看和管理数据表信息</p>
        <div class="card-footer">
          <a-tag color="blue">数据管理</a-tag>
        </div>
      </div>
    </div>

    <!-- 功能特性说明 -->
    <div class="features-section">
      <h2 class="section-title">优化方案特性</h2>
      <div class="features-grid">
        <div class="feature-item">
          <icon-layout class="feature-icon" />
          <h4 class="feature-title">双布局方案</h4>
          <p class="feature-desc">横向和纵向两种业务流程布局，适应不同场景需求</p>
        </div>
        <div class="feature-item">
          <icon-mobile class="feature-icon" />
          <h4 class="feature-title">响应式设计</h4>
          <p class="feature-desc">完美适配桌面端、平板和移动设备</p>
        </div>
        <div class="feature-item">
          <icon-palette class="feature-icon" />
          <h4 class="feature-title">简洁配色</h4>
          <p class="feature-desc">基于Arco Design的企业级设计语言</p>
        </div>
        <div class="feature-item">
          <icon-settings class="feature-icon" />
          <h4 class="feature-title">可视化编辑</h4>
          <p class="feature-desc">支持业务流程的可视化配置和编辑</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import {
  IconSearch,
  IconLayout,
  IconFile,
  IconMobile,
  IconPalette,
  IconSettings,
  IconEye
} from '@arco-design/web-vue/es/icon'

const router = useRouter()

const navigateTo = (path: string) => {
  router.push(path)
}
</script>

<style scoped>
.data-map-navigation {
  padding: 24px;
  background: #f7f8fa;
  min-height: 100vh;
}

/* 导航头部 */
.navigation-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-title {
  margin: 0 0 12px 0;
  font-size: 32px;
  font-weight: 600;
  color: var(--color-text-1);
}

.page-description {
  margin: 0;
  font-size: 16px;
  color: var(--color-text-3);
}

/* 导航网格 */
.navigation-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
  margin-bottom: 60px;
}

.nav-card {
  padding: 32px 24px;
  background: white;
  border-radius: 12px;
  border: 1px solid var(--color-border-2);
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.nav-card:hover {
  border-color: var(--color-primary-light-4);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transform: translateY(-4px);
}

.nav-card.featured {
  border-color: var(--color-primary-light-4);
  background: linear-gradient(135deg, #fff 0%, var(--color-primary-light-1) 100%);
}

.nav-card.featured:hover {
  border-color: var(--color-primary-6);
  box-shadow: 0 12px 32px rgba(var(--arcoblue-6), 0.2);
}

.card-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 20px;
  background: var(--color-primary-light-1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: var(--color-primary-6);
}

.nav-card.featured .card-icon {
  background: var(--color-primary-6);
  color: white;
  box-shadow: 0 4px 16px rgba(var(--arcoblue-6), 0.3);
}

.card-title {
  margin: 0 0 12px 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text-1);
}

.card-description {
  margin: 0 0 20px 0;
  font-size: 14px;
  color: var(--color-text-2);
  line-height: 1.5;
}

.card-footer {
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

/* 功能特性说明 */
.features-section {
  background: white;
  padding: 40px;
  border-radius: 12px;
  border: 1px solid var(--color-border-2);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.section-title {
  margin: 0 0 32px 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text-1);
  text-align: center;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
}

.feature-item {
  text-align: center;
  padding: 24px 16px;
  background: var(--color-fill-1);
  border-radius: 8px;
  border: 1px solid var(--color-border-1);
}

.feature-icon {
  font-size: 32px;
  color: var(--color-primary-6);
  margin-bottom: 16px;
}

.feature-title {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-1);
}

.feature-desc {
  margin: 0;
  font-size: 14px;
  color: var(--color-text-3);
  line-height: 1.4;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .data-map-navigation {
    padding: 16px;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .navigation-grid {
    grid-template-columns: 1fr;
    gap: 16px;
    margin-bottom: 40px;
  }
  
  .nav-card {
    padding: 24px 20px;
  }
  
  .features-section {
    padding: 24px 20px;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}
</style>