<template>
  <div class="loading-state">
    <!-- 骨架屏加载 -->
    <template v-if="type === 'skeleton'">
      <div class="skeleton-container">
        <!-- 搜索区域骨架屏 -->
        <div v-if="showSearch" class="skeleton-search">
          <a-skeleton>
            <a-skeleton-shape shape="square" :style="{ width: '100%', height: '60px', borderRadius: '8px' }" />
          </a-skeleton>
        </div>
        
        <!-- 标签页骨架屏 -->
        <div v-if="showTabs" class="skeleton-tabs">
          <a-skeleton>
            <div class="skeleton-tab-nav">
              <a-skeleton-shape 
                v-for="i in 3" 
                :key="i"
                shape="square" 
                :style="{ width: '80px', height: '32px', borderRadius: '4px', marginRight: '16px' }" 
              />
            </div>
          </a-skeleton>
        </div>
        
        <!-- 卡片网格骨架屏 -->
        <div v-if="showGrid" class="skeleton-grid">
          <a-row :gutter="[16, 16]">
            <a-col 
              v-for="i in gridCount" 
              :key="i" 
              :xs="24" :sm="12" :md="8" :lg="6"
            >
              <a-skeleton>
                <a-skeleton-shape shape="square" :style="{ width: '100%', height: '200px', borderRadius: '8px' }" />
                <div style="margin-top: 12px;">
                  <a-skeleton-line :rows="2" />
                </div>
              </a-skeleton>
            </a-col>
          </a-row>
        </div>
        
        <!-- 表格骨架屏 -->
        <div v-if="showTable" class="skeleton-table">
          <a-skeleton>
            <a-skeleton-shape shape="square" :style="{ width: '100%', height: '400px', borderRadius: '8px' }" />
          </a-skeleton>
        </div>
        
        <!-- 业务流程骨架屏 -->
        <div v-if="showProcess" class="skeleton-process">
          <a-skeleton>
            <!-- 步骤条骨架 -->
            <div class="skeleton-steps">
              <a-skeleton-shape 
                v-for="i in 4" 
                :key="i"
                shape="circle" 
                :style="{ width: '40px', height: '40px', marginRight: '60px' }" 
              />
            </div>
            <!-- 内容区域骨架 -->
            <div style="margin-top: 24px;">
              <a-skeleton-shape shape="square" :style="{ width: '100%', height: '300px', borderRadius: '8px' }" />
            </div>
          </a-skeleton>
        </div>
      </div>
    </template>
    
    <!-- 加载动画 -->
    <template v-else-if="type === 'spinner'">
      <div class="spinner-container">
        <a-spin :loading="true" :size="spinnerSize" :tip="loadingText">
          <div class="spinner-content">
            <div class="spinner-placeholder"></div>
          </div>
        </a-spin>
      </div>
    </template>
    
    <!-- 点状加载 -->
    <template v-else-if="type === 'dots'">
      <div class="dots-container">
        <div class="loading-dots">
          <div class="dot" v-for="i in 3" :key="i"></div>
        </div>
        <p v-if="loadingText" class="dots-text">{{ loadingText }}</p>
      </div>
    </template>
    
    <!-- 进度条加载 -->
    <template v-else-if="type === 'progress'">
      <div class="progress-container">
        <div class="progress-content">
          <div class="progress-icon">
            <icon-loading class="rotating-icon" />
          </div>
          <div class="progress-info">
            <p class="progress-title">{{ loadingText || '正在加载数据...' }}</p>
            <a-progress 
              :percent="progressPercent" 
              :show-text="false" 
              :stroke-width="4"
              :color="progressColor"
            />
            <p class="progress-detail">{{ progressDetail }}</p>
          </div>
        </div>
      </div>
    </template>
    
    <!-- 脉冲加载 -->
    <template v-else>
      <div class="pulse-container">
        <div class="pulse-wrapper">
          <div class="pulse-circle"></div>
          <div class="pulse-circle pulse-delay-1"></div>
          <div class="pulse-circle pulse-delay-2"></div>
        </div>
        <p v-if="loadingText" class="pulse-text">{{ loadingText }}</p>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { IconLoading } from '@arco-design/web-vue/es/icon'

type LoadingType = 'skeleton' | 'spinner' | 'dots' | 'progress' | 'pulse'
type SpinnerSize = 'mini' | 'small' | 'medium' | 'large'

const props = defineProps<{
  type?: LoadingType
  loadingText?: string
  spinnerSize?: SpinnerSize
  showSearch?: boolean
  showTabs?: boolean
  showGrid?: boolean
  showTable?: boolean
  showProcess?: boolean
  gridCount?: number
  progressPercent?: number
  progressDetail?: string
  progressColor?: string
}>()

const gridCount = computed(() => props.gridCount || 8)
const progressPercent = computed(() => props.progressPercent || 0)
const progressColor = computed(() => props.progressColor || 'rgb(var(--primary-6))')
</script>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  min-height: 200px;
  background: #ffffff;
  border-radius: 4px;
  border: 1px solid #e5e5e5;
}

.loading-spinner {
  margin-bottom: 16px;
}

.loading-spinner :deep(.arco-spin-icon) {
  font-size: 24px;
  color: #1890ff;
}

.loading-text {
  font-size: 14px;
  color: #595959;
  margin-bottom: 6px;
  font-weight: 500;
}

.loading-description {
  font-size: 12px;
  color: #8c8c8c;
  text-align: center;
  line-height: 1.4;
  max-width: 240px;
}

.loading-dots {
  display: inline-flex;
  gap: 3px;
  margin-left: 3px;
}

.loading-dot {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: #1890ff;
  animation: loadingDots 1.2s infinite ease-in-out;
}

.loading-dot:nth-child(1) {
  animation-delay: -0.24s;
}

.loading-dot:nth-child(2) {
  animation-delay: -0.12s;
}

@keyframes loadingDots {
  0%, 80%, 100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  40% {
    opacity: 1;
    transform: scale(1);
  }
}

/* 骨架屏样式 */
.skeleton-container {
  padding: 16px;
}

.skeleton-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.skeleton-avatar {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e6e6e6 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeletonLoading 1.2s infinite;
}

.skeleton-content {
  flex: 1;
}

.skeleton-title {
  height: 16px;
  width: 60%;
  border-radius: 2px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e6e6e6 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeletonLoading 1.2s infinite;
  margin-bottom: 6px;
}

.skeleton-subtitle {
  height: 14px;
  width: 40%;
  border-radius: 2px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e6e6e6 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeletonLoading 1.2s infinite;
}

.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
}

.skeleton-card {
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  overflow: hidden;
}

.skeleton-card-header {
  height: 60px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e6e6e6 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeletonLoading 1.2s infinite;
}

.skeleton-card-body {
  padding: 12px;
}

.skeleton-card-title {
  height: 14px;
  width: 70%;
  border-radius: 2px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e6e6e6 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeletonLoading 1.2s infinite;
  margin-bottom: 8px;
}

.skeleton-card-text {
  height: 12px;
  border-radius: 2px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e6e6e6 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeletonLoading 1.2s infinite;
  margin-bottom: 6px;
}

.skeleton-card-text:nth-child(2) {
  width: 90%;
}

.skeleton-card-text:nth-child(3) {
  width: 60%;
}

@keyframes skeletonLoading {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .loading-container {
    padding: 30px 16px;
    min-height: 160px;
  }
  
  .loading-spinner :deep(.arco-spin-icon) {
    font-size: 20px;
  }
  
  .loading-text {
    font-size: 13px;
  }
  
  .loading-description {
    font-size: 11px;
  }
  
  .skeleton-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  
  .skeleton-container {
    padding: 12px;
  }
}
</style>