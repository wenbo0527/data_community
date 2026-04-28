<template>
  <div ref="containerRef" class="asset-guide-container">
    <a-spin :loading="loading" tip="加载中...">
      <!-- 页面标题 -->
      <div class="header-section">
        <div class="title-area">
          <h2 class="page-title">
            <icon-apps width="24" height="24" />
            资产导览
          </h2>
          <p class="page-description">浏览和管理您的数据资产概览</p>
        </div>
        <div class="quick-actions">
          <a-button type="primary" size="small" @click="refreshData">
            <template #icon><icon-refresh /></template>
            刷新数据
          </a-button>
          <a-button size="small" @click="showGuide">
            <template #icon><icon-info-circle /></template>
            使用指南
          </a-button>
        </div>
      </div>

      <!-- 主要内容区域 -->
      <div class="content-section">
        <!-- 统计卡片区域 -->
        <a-row :gutter="[16, 16]">
          <a-col :span="6">
            <a-card class="stat-card" :bordered="false" hoverable @click="navigateTo('data-map')">
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
              <template #extra>
                <icon-table style="color: var(--color-text-3)" />
              </template>
            </a-card>
          </a-col>
          <a-col :span="6">
            <a-card class="stat-card" :bordered="false" hoverable>
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
              <template #extra>
                <icon-cloud style="color: var(--color-text-3)" />
              </template>
            </a-card>
          </a-col>
          <a-col :span="6">
            <a-card class="stat-card" :bordered="false" hoverable @click="navigateTo('variable-dict')">
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
              <template #extra>
                <icon-settings style="color: var(--color-text-3)" />
              </template>
            </a-card>
          </a-col>
          <a-col :span="6">
            <a-card class="stat-card" :bordered="false" hoverable>
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
              <template #extra>
                <icon-tag style="color: var(--color-text-3)" />
              </template>
            </a-card>
          </a-col>
        </a-row>

        <!-- 关系图区域 -->
        <a-card title="资产关系图" class="relation-diagram-card" :bordered="false">
          <div class="diagram-container">
            <a-empty description="资产关系图展示区域（Demo模式）">
              <template #image>
                <icon-mind-mapping :size="48" style="color: var(--color-text-3)" />
              </template>
            </a-empty>
            <a-row :gutter="16" justify="center" style="margin-top: 16px">
              <a-col>
                <a-button type="outline" size="small" @click="navigateTo('data-map')">查看数据表</a-button>
              </a-col>
              <a-col>
                <a-button type="outline" size="small" @click="navigateTo('lineage')">查看数据血缘</a-button>
              </a-col>
              <a-col>
                <a-button type="outline" size="small" @click="navigateTo('impact-analysis')">影响分析</a-button>
              </a-col>
            </a-row>
          </div>
        </a-card>

        <!-- 图表区域 -->
        <a-row :gutter="[16, 16]">
          <a-col :xs="24" :md="12">
            <a-card title="主题域分布" class="chart-card" :bordered="false">
              <a-table :data="domainData" :pagination="false" size="small">
                <a-table-column title="主题域" data-index="domain" />
                <a-table-column title="表数量" data-index="count" />
                <a-table-column title="占比" data-index="ratio">
                  <template #cell="{ record }">
                    <a-progress :percent="record.ratio" :color="'rgb(var(--primary-6))'" size="small" />
                  </template>
                </a-table-column>
              </a-table>
            </a-card>
          </a-col>
          <a-col :xs="24" :md="12">
            <a-card title="本周数据更新" class="chart-card" :bordered="false">
              <a-list :data="updateLog" size="small">
                <template #item="{ item }">
                  <a-list-item>
                    <a-list-item-meta :title="item.title" :description="item.time" />
                    <template #extra>
                      <a-tag :color="item.type === '新增' ? 'green' : 'arcoblue'">{{ item.type }}</a-tag>
                    </template>
                  </a-list-item>
                </template>
              </a-list>
            </a-card>
          </a-col>
        </a-row>
      </div>
    </a-spin>

    <!-- 使用指南弹窗 -->
    <a-modal v-model:visible="guideVisible" title="资产导览使用指南" :footer="false" width="560px">
      <a-typography>
        <a-typography-title :heading="4">欢迎使用数据资产导览</a-typography-title>
        <a-typography-paragraph>
          本页面提供数据资产的全局概览，帮助您快速了解现有资产分布情况。
        </a-typography-paragraph>
        <a-typography-title :heading="5">功能说明</a-typography-title>
        <a-typography-list>
          <a-typography-list-item>点击统计卡片可直接跳转至对应模块</a-typography-list-item>
          <a-typography-list-item>资产关系图展示表与表之间的关联</a-typography-list-item>
          <a-typography-list-item>主题域分布展示各业务域的资产占比</a-typography-list-item>
          <a-typography-list-item>本周数据更新记录最近一周的资产变更</a-typography-list-item>
        </a-typography-list>
      </a-typography>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'

const router = useRouter()
const loading = ref(false)
const guideVisible = ref(false)
const containerRef = ref(null)

// 主题域分布数据
const domainData = [
  { domain: '客户域', count: 356, ratio: 28 },
  { domain: '交易域', count: 298, ratio: 24 },
  { domain: '风险域', count: 245, ratio: 19 },
  { domain: '财务域', count: 189, ratio: 15 },
  { domain: '营销域', count: 180, ratio: 14 }
]

// 本周更新日志
const updateLog = [
  { title: '用户基础信息表结构变更', time: '2026-04-28 10:30', type: '更新' },
  { title: '新增订单流水表 user_orders_202604', time: '2026-04-27 16:45', type: '新增' },
  { title: '新增客户画像变量 35 个', time: '2026-04-26 11:20', type: '新增' },
  { title: '交易域指标口径调整', time: '2026-04-25 09:00', type: '更新' },
  { title: '接入外部工商数据源', time: '2026-04-24 14:30', type: '新增' }
]

const refreshData = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    Message.success('数据已刷新')
  }, 1000)
}

const showGuide = () => {
  guideVisible.value = true
}

const navigateTo = (routeName) => {
  router.push({ name: routeName })
}

onMounted(() => {

})
</script>

<style scoped>
.asset-guide-container {
  padding: 0;
  min-height: calc(100vh - 64px);
  width: 100%;
  background-color: var(--color-bg-2);
}

.header-section {
  margin-bottom: 24px;
  width: 100%;
  background: linear-gradient(to right, rgb(var(--primary-1)), rgb(var(--primary-2)));
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
}

.title-area {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text-1);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-description {
  font-size: 14px;
  color: var(--color-text-3);
  margin: 0;
}

.quick-actions {
  display: flex;
  gap: 8px;
}

.content-section {
  padding: 0 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stat-card {
  height: 132px;
  transition: all 0.2s;
  cursor: pointer;
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

.diagram-container {
  padding: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.chart-card {
  min-height: 280px;
}
</style>
