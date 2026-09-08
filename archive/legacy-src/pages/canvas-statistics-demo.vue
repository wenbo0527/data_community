<template>
  <div class="canvas-statistics-demo">
    <!-- 演示页面标题 -->
    <div class="demo-header">
      <div class="demo-title">
        <icon-line-chart />
        <span>横版画布统计信息查询功能演示</span>
      </div>
      <div class="demo-controls">
        <a-space>
          <a-button @click="toggleStatisticsPanel">
        <span class="icon-placeholder" />
            {{ showStatistics ? '隐藏统计面板' : '显示统计面板' }}
          </a-button>
          <a-button @click="simulateDataUpdate">
            <span class="icon-placeholder" />
            模拟数据更新
          </a-button>
          <a-button @click="resetDemo">
            <span class="icon-placeholder" />
            重置演示
          </a-button>
        </a-space>
      </div>
    </div>

    <!-- 画布区域 -->
    <div class="canvas-container">
      <div class="canvas-area">
        <div class="canvas-placeholder">
          <div class="placeholder-content">
            <span class="icon-placeholder" />
            <h3>横版画布区域</h3>
            <p>这里显示实际的横版画布内容</p>
            <p>包含节点、连接线、用户路径等</p>
          </div>
        </div>
      </div>

      <!-- 统计信息面板 -->
      <transition name="slide-right">
        <CanvasStatisticsPanel
          v-if="showStatistics"
          :canvas-id="demoCanvasId"
          @close="showStatistics = false"
        />
      </transition>
    </div>

    <!-- 演示说明 -->
    <div class="demo-description">
      <a-card title="功能说明" :bordered="false">
        <a-space direction="vertical" :size="16" fill>
          <div class="feature-item">
            <div class="feature-title">
              <span class="icon-placeholder" />
              <span>统计概览</span>
            </div>
            <div class="feature-desc">
              显示画布的整体统计数据，包括总访问量、总转化数、活跃用户、平均停留时长等关键指标
            </div>
          </div>

          <div class="feature-item">
            <div class="feature-title">
              <span class="icon-placeholder" />
              <span>数据筛选</span>
            </div>
            <div class="feature-desc">
              支持按时间范围、节点类型、用户群体等条件筛选统计数据，实时更新展示结果
            </div>
          </div>

          <div class="feature-item">
            <div class="feature-title">
              <span class="icon-placeholder" />
              <span>用户路径分析</span>
            </div>
            <div class="feature-desc">
              输入用户ID可查看该用户的完整行为路径，支持路径动画回放和节点高亮显示
            </div>
          </div>

          <div class="feature-item">
            <div class="feature-title">
              <span class="icon-placeholder" />
              <span>数据可视化</span>
            </div>
            <div class="feature-desc">
              提供多种图表类型展示数据，包括柱状图、折线图、饼图、桑基图等，支持图表联动
            </div>
          </div>

          <div class="feature-item">
            <div class="feature-title">
              <span class="icon-placeholder" />
              <span>数据导出</span>
            </div>
            <div class="feature-desc">
              支持将统计数据导出为CSV、Excel、JSON格式，可自定义导出字段和格式
            </div>
          </div>

          <div class="feature-item">
            <div class="feature-title">
              <span class="icon-placeholder" />
              <span>桌面端优化</span>
            </div>
            <div class="feature-desc">
              专为桌面端设计，支持面板宽度拖拽调整、键盘快捷键、右键菜单等交互优化
            </div>
          </div>
        </a-space>
      </a-card>
    </div>

    <!-- 技术特性 -->
    <div class="demo-tech">
      <a-card title="技术特性" :bordered="false">
        <a-row :gutter="16">
          <a-col :span="8">
            <div class="tech-item">
              <div class="tech-icon">
                <icon-dashboard />
              </div>
              <div class="tech-content">
                <div class="tech-title">实时数据更新</div>
                <div class="tech-desc">基于Supabase实时订阅，数据变化即时响应</div>
              </div>
            </div>
          </a-col>
          <a-col :span="8">
            <div class="tech-item">
              <div class="tech-icon">
                <icon-dashboard />
              </div>
              <div class="tech-content">
                <div class="tech-title">数据安全</div>
                <div class="tech-desc">用户ID脱敏处理，权限控制严格</div>
              </div>
            </div>
          </a-col>
          <a-col :span="8">
            <div class="tech-item">
              <div class="tech-icon">
                <icon-dashboard />
              </div>
              <div class="tech-content">
                <div class="tech-title">高性能</div>
                <div class="tech-desc">虚拟滚动、分页加载、图表优化</div>
              </div>
            </div>
          </a-col>
        </a-row>
      </a-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import CanvasStatisticsPanel from '@/components/canvas-statistics/CanvasStatisticsPanel.vue'

// 演示状态
const showStatistics = ref(false)
const demoCanvasId = ref('demo_canvas_123')

// 切换统计面板
const toggleStatisticsPanel = () => {
  showStatistics.value = !showStatistics.value
}

// 模拟数据更新
const simulateDataUpdate = () => {
  // 这里可以触发统计数据的更新
  console.log('模拟数据更新')
}

// 重置演示
const resetDemo = () => {
  showStatistics.value = false
  console.log('重置演示状态')
}

// 监听键盘快捷键
const handleKeyDown = (event) => {
  // Ctrl + E 导出数据
  if (event.ctrlKey && event.key === 'e') {
    event.preventDefault()
    console.log('快捷键：导出数据')
  }
  
  // Ctrl + R 刷新统计
  if (event.ctrlKey && event.key === 'r') {
    event.preventDefault()
    console.log('快捷键：刷新统计')
  }
  
  // 空格键 暂停/播放动画
  if (event.key === ' ' && showStatistics.value) {
    event.preventDefault()
    console.log('快捷键：暂停/播放动画')
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped lang="scss">
.canvas-statistics-demo {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 24px;
}

.demo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.demo-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 24px;
  font-weight: 600;
  color: #262626;
  
  .arco-icon {
    font-size: 28px;
    color: #1890ff;
  }
}

.demo-controls {
  display: flex;
  gap: 12px;
}

.canvas-container {
  position: relative;
  height: 600px;
  margin-bottom: 24px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.canvas-area {
  width: 100%;
  height: 100%;
  background: #fff;
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

.demo-description {
  margin-bottom: 24px;
}

.feature-item {
  padding: 16px;
  background: #fff;
  border-radius: 6px;
  border: 1px solid #f0f0f0;
  
  .feature-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 600;
    color: #262626;
    margin-bottom: 8px;
    
    .arco-icon {
      font-size: 20px;
      color: #1890ff;
    }
  }
  
  .feature-desc {
    font-size: 14px;
    color: #595959;
    line-height: 1.6;
  }
}

.demo-tech {
  .tech-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    background: #fff;
    border-radius: 6px;
    border: 1px solid #f0f0f0;
    height: 100%;
    
    .tech-icon {
      .arco-icon {
        font-size: 32px;
        color: #52c41a;
      }
    }
    
    .tech-content {
      flex: 1;
      
      .tech-title {
        font-size: 16px;
        font-weight: 600;
        color: #262626;
        margin-bottom: 4px;
      }
      
      .tech-desc {
        font-size: 14px;
        color: #595959;
      }
    }
  }
}

// 动画效果
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s ease;
}

.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
}

.slide-right-enter-to,
.slide-right-leave-from {
  transform: translateX(0);
}

// 响应式设计
@media (max-width: 768px) {
  .canvas-statistics-demo {
    padding: 16px;
  }
  
  .demo-header {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
  
  .demo-title {
    font-size: 20px;
  }
  
  .canvas-container {
    height: 400px;
  }
}
</style>
