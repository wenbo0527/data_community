<!-- 资产导览页面主容器 -->
<template>
  <!-- 页面容器，包含整个资产导览内容 -->
  <div ref="containerRef" class="asset-guide-container">
  <a-spin :loading="loading" class="spin-container" tip="加载中...">
    <!-- 页面标题 -->
    <div class="header-section">
      <div class="title-area">
        <h2 class="page-title"><icon-data width="24" height="24"/>资产导览</h2>
        <p class="page-description">浏览和管理您的数据资产概览</p>
      </div>
      <div class="quick-actions">
        <a-button type="primary" size="small" @click="refreshData">刷新数据</a-button>
        <a-button size="small" @click="showGuide">使用指南</a-button>
      </div>
    </div>

      <!-- 主要内容区域 -->
      <div class="content-section">
        <!-- 统计卡片区域 -->
        <a-row :gutter="[16, 16]">
          <a-col :span="6">
  <a-card 
    class="stat-card" 
    :bordered="false"
    hoverable
    @click="navigateTo('data-tables')"
  >
    <a-statistic
      title="数据表"
      :value="1268"
      :value-style="{ color: 'rgb(var(--primary-6))', fontSize: '24px', fontWeight: 600 }"
      show-group-separator
    >
      <template #suffix>
        <span class="stat-unit">个</span>
      </template>
    </a-statistic>
  </a-card>
</a-col>
          <a-col :span="6">
            <a-card class="stat-card" :bordered="false">
              <a-statistic
                title="外部数据"
                :value="4985"
                :value-style="{ color: 'rgb(var(--primary-6))', fontSize: '24px', fontWeight: 600 }"
                show-group-separator
              >
                <template #suffix>
                  <span class="stat-unit">个</span>
                </template>
              </a-statistic>
            </a-card>
          </a-col>
          <a-col :span="6">
            <a-card class="stat-card" :bordered="false">
              <a-statistic
                title="变量管理"
                :value="1002"
                :value-style="{ color: 'rgb(var(--primary-6))', fontSize: '24px', fontWeight: 600 }"
                show-group-separator
              >
                <template #suffix>
                  <span class="stat-unit">个</span>
                </template>
              </a-statistic>
            </a-card>
          </a-col>
          <a-col :span="6">
            <a-card class="stat-card" :bordered="false">
              <a-statistic
                title="标签地图"
                :value="168"
                :value-style="{ color: 'rgb(var(--primary-6))', fontSize: '24px', fontWeight: 600 }"
                show-group-separator
              >
                <template #suffix>
                  <span class="stat-unit">个</span>
                </template>
              </a-statistic>
            </a-card>
          </a-col>
        </a-row>

        <!-- 关系图区域 -->
        <a-card title="关系图" class="relation-diagram-card" :bordered="false">
          <div class="placeholder-diagram">关系图区域</div>
        </a-card>

        <!-- 图表区域 -->
        <a-row :gutter="[16, 16]">
          <a-col :xs="24" :md="12">
            <a-card title="主题域分布" class="chart-card" :bordered="false">
              <div class="placeholder-chart">图表区域</div>
            </a-card>
          </a-col>
          <a-col :xs="24" :md="12">
            <a-card title="数据增长趋势" class="chart-card" :bordered="false">
              <div class="placeholder-chart">图表区域</div>
            </a-card>
          </a-col>
        </a-row>
      </div>
    </a-spin>
  </div>
</template>

<!-- 脚本部分，包含页面逻辑 -->
<script setup lang="ts">
import IconDataAnalysis from '@arco-design/web-vue/es/icon';
// 导入Vue组合式API
import { ref, onMounted } from 'vue'
// 导入Vue路由
import { useRouter } from 'vue-router'

// 初始化路由实例
const router = useRouter()
// 加载状态控制
const loading = ref(false)
// 页面容器引用
const containerRef = ref<HTMLElement | null>(null)

/**
 * 记录布局尺寸
 * 输出当前窗口宽度和容器渲染宽度到控制台
 */
const logLayoutDimensions = () => {
  if (containerRef.value) {
    const windowWidth = window.innerWidth
    const containerWidth = containerRef.value.clientWidth
    const headerSection = document.querySelector('.header-section')?.clientWidth
    const contentSection = document.querySelector('.content-section')?.clientWidth
    const statCards = document.querySelectorAll('.stat-card')
    
    console.group('页面布局宽度报告')
    console.log(`窗口宽度: ${windowWidth}px`)
    console.log(`容器渲染宽度: ${containerWidth}px`)
    console.log(`头部区域宽度: ${headerSection}px`)
    console.log(`内容区域宽度: ${contentSection}px`)
    
    statCards.forEach((card, index) => {
      console.log(`统计卡片 ${index + 1} 宽度: ${card.clientWidth}px`)
    })
    
    console.groupEnd()
  }
}

// 组件挂载后执行
onMounted(() => {
  // 初始记录一次尺寸
  logLayoutDimensions()
  // 添加窗口大小变化监听
  window.addEventListener('resize', logLayoutDimensions)
})

/**
 * 刷新数据
 * 模拟数据加载过程
 */
const refreshData = () => {
  loading.value = true
  // 模拟数据加载
  setTimeout(() => {
    loading.value = false
  }, 1000)
}

/**
 * 显示使用指南
 * TODO: 实现指南弹窗逻辑
 */
const showGuide = () => {
  // 显示使用指南
}

/**
 * 路由跳转
 * @param routeName 目标路由名称
 */
const navigateTo = (routeName: string) => {
  router.push({ name: routeName })
}
</script>

<style scoped>
.asset-guide-container {
  padding: 0;
  min-height: calc(100vh - 64px);
  width: 100%;
  max-width: none;
  box-sizing: border-box;
  margin: 0 auto;
  background-color: var(--color-bg-2);
}

.header-section {
  margin-bottom: 24px;
  width: 100%;
  background: linear-gradient(to right, rgb(var(--primary-1)), rgb(var(--primary-2)));
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
}

.title-area {
  width: 100%;
  max-width: 1420px;
  margin: 0 auto;
  padding: 0;
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

.stat-card {
  height: 132px;
  transition: all 0.2s var(--transition-timing-function-standard);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  padding: 16px 24px;
  border-radius: var(--border-radius-medium);
  width: 100%;
  box-sizing: border-box;
  background: var(--color-bg-2);
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px -4px rgba(0, 0, 0, 0.08);
  }
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.stat-unit {
  font-size: 14px;
  color: var(--color-text-3);
  margin-left: 4px;
}

.relation-diagram-card,
.chart-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.relation-diagram-card {
  margin-bottom: 24px;
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
}

.quick-actions {
  display: flex;
  gap: 8px;
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
}
</style>