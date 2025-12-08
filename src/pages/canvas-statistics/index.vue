<template>
  <div class="canvas-statistics-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="page-title">
        <icon-chart-line />
        <span>画布统计信息</span>
      </div>
      <div class="page-actions">
        <a-space>
          <a-button @click="goBack">
            <icon-arrow-left />
            返回
          </a-button>
          <a-button @click="refreshData">
            <icon-refresh />
            刷新
          </a-button>
        </a-space>
      </div>
    </div>

    <!-- 画布内容区域 -->
    <div class="canvas-content">
      <div class="canvas-viewer">
        <div class="canvas-placeholder">
          <div class="placeholder-content">
            <icon-picture />
            <h3>画布内容区域</h3>
            <p>这里显示实际的横版画布内容</p>
            <p>画布ID: {{ canvasId }}</p>
          </div>
        </div>
      </div>

      <!-- 统计信息面板 -->
      <canvas-statistics-panel
        :canvas-id="canvasId"
        @node-select="handleNodeSelect"
        @path-highlight="handlePathHighlight"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  IconChartLine, 
  IconArrowLeft, 
  IconRefresh, 
  IconDownload,
  IconPicture
} from '@arco-design/web-vue/es/icon'
import CanvasStatisticsPanel from '@/components/canvas-statistics/CanvasStatisticsPanel.vue'

const route = useRoute()
const router = useRouter()

// 获取画布ID
const canvasId = ref(route.params.id)

// 返回上一页
import { goBack as goBackUtil } from '@/router/utils'
const goBack = () => {
  goBackUtil(router, '/canvas')
}

// 刷新数据
const refreshData = () => {
  console.log('刷新统计数据')
}

 

// 处理节点选择
const handleNodeSelect = (nodeIds) => {
  console.log('选中节点:', nodeIds)
}

// 处理路径高亮
const handlePathHighlight = (pathData) => {
  console.log('路径高亮:', pathData)
}

onMounted(() => {
  console.log('画布统计页面加载，画布ID:', canvasId.value)
})
</script>

<style scoped lang="scss">
.canvas-statistics-page {
  min-height: 100vh;
  background: #f5f5f5;
  position: relative;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 100;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
  font-weight: 600;
  color: #262626;
  
  .arco-icon {
    font-size: 24px;
    color: #1890ff;
  }
}

.page-actions {
  display: flex;
  gap: 12px;
}

.canvas-content {
  display: flex;
  height: calc(100vh - 73px);
  position: relative;
}

.canvas-viewer {
  flex: 1;
  background: #fff;
  position: relative;
  overflow: hidden;
}

.canvas-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f6ffed 0%, #e6f7ff 100%);
}

.placeholder-content {
  text-align: center;
  color: #8c8c8c;
  
  .arco-icon {
    font-size: 64px;
    margin-bottom: 16px;
    color: #d9d9d9;
  }
  
  h3 {
    font-size: 20px;
    font-weight: 500;
    margin-bottom: 8px;
    color: #595959;
  }
  
  p {
    font-size: 14px;
    margin: 4px 0;
  }
}
</style>
