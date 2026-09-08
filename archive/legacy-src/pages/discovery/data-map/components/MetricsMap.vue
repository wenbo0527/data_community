<template>
  <div class="metrics-map-container">
    <!-- 顶部导航栏 -->
    <div class="top-navigation">
      <div class="nav-left">
        <a-space>
          <a-select v-model="selectedView" placeholder="选择视图" style="width: 120px">
            <a-option value="strategic">战略视图</a-option>
            <a-option value="domain">域视图</a-option>
            <a-option value="campaign">活动视图</a-option>
          </a-select>
          <a-input-search
            v-model="searchKeyword"
            placeholder="搜索指标..."
            style="width: 300px"
            @search="handleSearch"
          />
        </a-space>
      </div>
      <div class="nav-right">
        <a-space>
          <a-button @click="resetView">
            <template #icon><IconRefresh /></template>
            重置视图
          </a-button>
          <a-button type="primary" @click="toggleFullscreen">
            <template #icon><IconFullscreen /></template>
            全屏
          </a-button>
        </a-space>
      </div>
    </div>

    <!-- 画布区域 -->
    <div class="canvas-container" ref="canvasContainer">
      <div class="subway-map" ref="subwayMap">
        <!-- 模拟地铁线路图 -->
        <div class="metro-lines">
          <!-- 业务域线路 -->
          <div v-for="line in metroLines" :key="line.id" class="metro-line" :style="{ backgroundColor: line.color }">
            <div class="line-name">{{ line.name }}</div>
            <!-- 指标站点 -->
            <div v-for="station in line.stations" :key="station.id" 
                 class="metro-station" 
                 :class="{ active: station.id === selectedStationId }"
                 @click="selectStation(station)">
              <div class="station-badge" :class="station.status">
                <span class="station-value">{{ station.value }}</span>
              </div>
              <div class="station-name">{{ station.name }}</div>
            </div>
          </div>
        </div>
        
        <!-- 连接线 -->
        <svg class="connection-lines" width="100%" height="100%">
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" 
                    refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#86909c" />
            </marker>
          </defs>
          <line v-for="connection in connections" :key="connection.id"
                :x1="connection.x1" :y1="connection.y1"
                :x2="connection.x2" :y2="connection.y2"
                stroke="#86909c" stroke-width="2" 
                marker-end="url(#arrowhead)" />
        </svg>
      </div>
    </div>

    <!-- 指标详情抽屉 -->
    <a-drawer
      v-model:visible="drawerVisible"
      :title="selectedStation?.name || '指标详情'"
      width="700px"
      placement="right"
      :footer="false"
      :mask-closable="true"
      :esc-to-close="true"
    >
      <IndicatorDetail :node="selectedStationNode" />
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { IconRefresh, IconFullscreen } from '@arco-design/web-vue/es/icon'
import IndicatorDetail from './IndicatorDetail.vue'

// 响应式数据
const selectedView = ref('strategic')
const searchKeyword = ref('')
const selectedStationId = ref<string | null>(null)
const drawerVisible = ref(false)
const canvasContainer = ref<HTMLElement>()
const subwayMap = ref<HTMLElement>()

// 模拟地铁线路数据
const metroLines = ref([
  {
    id: 'business-line',
    name: '业务指标线',
    color: '#165DFF',
    stations: [
      { id: 'revenue', name: '营收', value: '1.2亿', status: 'active' },
      { id: 'users', name: '用户数', value: '50万', status: 'active' },
      { id: 'orders', name: '订单量', value: '10万', status: 'warning' },
      { id: 'conversion', name: '转化率', value: '3.2%', status: 'active' }
    ]
  },
  {
    id: 'product-line',
    name: '产品指标线',
    color: '#00B42A',
    stations: [
      { id: 'dau', name: 'DAU', value: '8万', status: 'active' },
      { id: 'retention', name: '留存率', value: '65%', status: 'active' },
      { id: 'engagement', name: '参与度', value: '4.5', status: 'warning' }
    ]
  },
  {
    id: 'marketing-line',
    name: '营销指标线',
    color: '#FF7D00',
    stations: [
      { id: 'cac', name: '获客成本', value: '120元', status: 'error' },
      { id: 'ltv', name: '用户价值', value: '800元', status: 'active' },
      { id: 'roi', name: 'ROI', value: '2.5', status: 'active' }
    ]
  }
])

// 连接线数据
const connections = ref([
  { id: 'conn1', x1: 100, y1: 100, x2: 200, y2: 150 },
  { id: 'conn2', x1: 200, y1: 150, x2: 300, y2: 100 }
])

// 选中的站点
const selectedStation = computed(() => {
  if (!selectedStationId.value) return null
  for (const line of metroLines.value) {
    const station = line.stations.find(s => s.id === selectedStationId.value)
    if (station) return station
  }
  return null
})

// 转换为指标详情组件需要的节点格式
const selectedStationNode = computed(() => {
  if (!selectedStation.value) return null
  
  return {
    data: {
      id: selectedStation.value.id,
      label: selectedStation.value.name,
      value: selectedStation.value.value,
      status: selectedStation.value.status,
      businessDomain: '核心业务',
      owner: '数据团队',
      category: '业务指标',
      definition: `${selectedStation.value.name}是衡量业务表现的重要指标`,
      description: '用于监控业务核心指标，支持决策分析',
      dataSource: 'dw.fact_business_metrics',
      calculation: `SELECT ${selectedStation.value.id} FROM business_metrics WHERE date = current_date`,
      updateFrequency: '每日',
      sql: `SELECT 
  ${selectedStation.value.id},
  date,
  business_unit
FROM dw.fact_business_metrics 
WHERE date >= date_sub(current_date, 30)
ORDER BY date DESC`
    }
  }
})

// 方法
const handleSearch = (value: string) => {
  console.log('搜索指标:', value)
}

const resetView = () => {
  selectedStationId.value = null
  drawerVisible.value = false
}

const toggleFullscreen = () => {
  if (document.fullscreenElement) {
    document.exitFullscreen()
  } else {
    canvasContainer.value?.requestFullscreen()
  }
}

const selectStation = (station: any) => {
  selectedStationId.value = station.id
  drawerVisible.value = true
}

onMounted(() => {
  // 初始化画布
  console.log('指标地图组件已挂载')
})
</script>

<style scoped>
.metrics-map-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f7f8fa;
}

.top-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: white;
  border-bottom: 1px solid #e5e6eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.canvas-container {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.subway-map {
  width: 100%;
  height: 100%;
  position: relative;
  background: linear-gradient(135deg, #f0f2f5 0%, #e8f4fd 100%);
  padding: 40px;
}

.metro-lines {
  display: flex;
  flex-direction: column;
  gap: 80px;
  height: 100%;
}

.metro-line {
  position: relative;
  height: 60px;
  border-radius: 30px;
  display: flex;
  align-items: center;
  padding: 0 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  
  .line-name {
    position: absolute;
    left: -120px;
    top: 50%;
    transform: translateY(-50%);
    font-weight: 600;
    color: #1d2129;
    font-size: 14px;
    white-space: nowrap;
  }
}

.metro-station {
  position: relative;
  margin: 0 40px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.1);
  }
  
  &.active {
    transform: scale(1.2);
    
    .station-badge {
      box-shadow: 0 0 20px rgba(22, 93, 255, 0.4);
    }
  }
  
  .station-badge {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: white;
    border: 4px solid #165dff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 12px;
    color: #165dff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transition: all 0.3s ease;
    
    &.warning {
      border-color: #ff7d00;
      color: #ff7d00;
    }
    
    &.error {
      border-color: #f53f3f;
      color: #f53f3f;
    }
    
    .station-value {
      font-size: 10px;
      text-align: center;
      line-height: 1.2;
    }
  }
  
  .station-name {
    position: absolute;
    top: 70px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 12px;
    font-weight: 500;
    color: #1d2129;
    white-space: nowrap;
    background: rgba(255, 255, 255, 0.9);
    padding: 4px 8px;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
}

.connection-lines {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 1;
}

:deep(.arco-drawer-header) {
  border-bottom: 1px solid #f2f3f5;
}

:deep(.arco-drawer-body) {
  padding: 0;
}
</style>