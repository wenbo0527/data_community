<template>
  <a-layout>
    <a-layout-content class="content">
      <!-- 数据概览区域 -->
      <a-card title="营销数据概览" class="card-container">
        <a-row :gutter="16" class="metric-cards">
          <a-col :span="6" v-for="metric in metrics" :key="metric.title">
            <a-card class="metric-card">
              <div class="metric-content">
                <a-statistic
                  :title="metric.title"
                  :value="metric.value"
                  :precision="2"
                  show-group-separator
                  :value-style="{ color: metric.color }"
                >
                  <template #prefix>
                    <icon-arrow-rise v-if="metric.trend === 'up'" style="color: #0fbf60" />
                    <icon-arrow-fall v-else style="color: #f53f3f" />
                  </template>
                </a-statistic>
                <div class="comparison-data">
                  <span class="comparison-item">同比：<span :style="{ color: metric.yoy >= 0 ? '#0fbf60' : '#f53f3f' }">{{ metric.yoy >= 0 ? '+' : '' }}{{ metric.yoy }}%</span></span>
                  <span class="comparison-item">环比：<span :style="{ color: metric.mom >= 0 ? '#0fbf60' : '#f53f3f' }">{{ metric.mom >= 0 ? '+' : '' }}{{ metric.mom }}%</span></span>
                </div>
              </div>
            </a-card>
          </a-col>
        </a-row>
      </a-card>

      <!-- 数据分析图表区域 -->
      <a-row :gutter="16">
        <a-col :span="12">
          <a-card title="营销转化漏斗" class="card-container">
            <div class="chart-container">
              <!-- 后续集成图表组件 -->
            </div>
          </a-card>
        </a-col>
        <a-col :span="12">
          <a-card title="营销效果趋势" class="card-container">
            <div class="chart-container">
              <!-- 后续集成图表组件 -->
            </div>
          </a-card>
        </a-col>
      </a-row>

      <!-- 数据列表区域 -->
      <a-card title="营销活动列表" class="card-container">
        <a-table :data="campaignList" :columns="columns" :pagination="pagination">
          <template #status="{ record }">
            <a-tag :color="getStatusColor(record.status)">{{ record.status }}</a-tag>
          </template>
          <template #operations="{ record }">
            <a-space>
              <a-button type="text" size="small">查看</a-button>
              <a-button type="text" size="small">编辑</a-button>
            </a-space>
          </template>
        </a-table>
      </a-card>
    </a-layout-content>
  </a-layout>
</template>

<script setup>
import { ref } from 'vue'
import { IconArrowRise, IconArrowFall } from '@arco-design/web-vue/es/icon'

// 数据概览指标
const metrics = ref([
  {
    title: '营销投入',
    value: 156.78,
    trend: 'up',
    color: '#0fbf60',
    yoy: 15.2,
    mom: 5.8
  },
  {
    title: '转化金额',
    value: 89.45,
    trend: 'up',
    color: '#0fbf60',
    yoy: 12.3,
    mom: 4.2
  },
  {
    title: '获客成本',
    value: 234.56,
    trend: 'down',
    color: '#f53f3f',
    yoy: -8.5,
    mom: -3.2
  },
  {
    title: '投入产出比',
    value: 3.45,
    trend: 'up',
    color: '#0fbf60',
    yoy: 6.8,
    mom: 2.1
  }
])

// 营销活动列表数据
const columns = [
  { title: '活动名称', dataIndex: 'name' },
  { title: '活动类型', dataIndex: 'type' },
  { title: '开始时间', dataIndex: 'startTime' },
  { title: '结束时间', dataIndex: 'endTime' },
  { title: '预算', dataIndex: 'budget' },
  { title: '状态', dataIndex: 'status', slotName: 'status' },
  { title: '操作', slotName: 'operations' }
]

const campaignList = ref([
  {
    id: 1,
    name: '618促销活动',
    type: '节日营销',
    startTime: '2024-06-01',
    endTime: '2024-06-18',
    budget: '100,000',
    status: '进行中'
  },
  {
    id: 2,
    name: '年末回馈',
    type: '促销活动',
    startTime: '2024-12-01',
    endTime: '2024-12-31',
    budget: '150,000',
    status: '未开始'
  },
  {
    id: 3,
    name: '新春特惠',
    type: '节日营销',
    startTime: '2024-01-15',
    endTime: '2024-02-15',
    budget: '200,000',
    status: '已结束'
  },
  {
    id: 4,
    name: '会员专享日',
    type: '会员活动',
    startTime: '2024-03-01',
    endTime: '2024-03-31',
    budget: '80,000',
    status: '进行中'
  },
  {
    id: 5,
    name: '五一特惠',
    type: '节日营销',
    startTime: '2024-04-28',
    endTime: '2024-05-05',
    budget: '120,000',
    status: '未开始'
  },
  {
    id: 6,
    name: '新品首发',
    type: '产品推广',
    startTime: '2024-04-01',
    endTime: '2024-04-15',
    budget: '90,000',
    status: '进行中'
  },
  {
    id: 7,
    name: '品牌周年庆',
    type: '品牌活动',
    startTime: '2024-07-01',
    endTime: '2024-07-07',
    budget: '300,000',
    status: '未开始'
  },
  {
    id: 8,
    name: '开学季促销',
    type: '促销活动',
    startTime: '2024-08-15',
    endTime: '2024-09-15',
    budget: '150,000',
    status: '未开始'
  }
])

const pagination = {
  total: 8,
  current: 1,
  pageSize: 10
}

// 获取状态对应的颜色
const getStatusColor = (status) => {
  const colorMap = {
    '进行中': 'green',
    '未开始': 'blue',
    '已结束': 'gray'
  }
  return colorMap[status] || 'blue'
}
</script>

<style scoped>
.content {
  padding: 24px;
  background: var(--color-bg-2);
}

.card-container {
  margin-bottom: 16px;
  border-radius: 8px;
  transition: all 0.3s;
}

.card-container:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.metric-cards {
  margin-bottom: 16px;
}

.metric-card {
  height: 120px;
  transition: all 0.3s;
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.metric-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.comparison-data {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--color-text-2);
}

.comparison-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.chart-container {
  height: 300px;
}
</style>