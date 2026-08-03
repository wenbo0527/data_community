<template>
  <div class="discovery-page">
    <a-page-header title="数据发现" sub-title="浏览数据资产、客户360、指标地图">
      <template #extra>
        <a-button type="primary" @click="goWorkbench">
          <template #icon><icon-home /></template>
          返回工作台
        </a-button>
      </template>
    </a-page-header>
    <a-row :gutter="16">
      <a-col :span="8">
        <a-card hoverable @click="goDataMap" class="entry-card">
          <h3>📊 数据地图</h3>
          <p>浏览所有数据资产、表结构、字段血缘</p>
        </a-card>
      </a-col>
      <a-col :span="8">
        <a-card hoverable @click="goCustomer360" class="entry-card">
          <h3>👥 客户 360</h3>
          <p>客户全景视图、字段可见性</p>
        </a-card>
      </a-col>
      <a-col :span="8">
        <a-card hoverable @click="goWorkbench" class="entry-card">
          <h3>📈 指标地图</h3>
          <p>业务指标体系、衍生指标</p>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
const goWorkbench = () => router.push('workbench')
const goDataMap = () => router.push('discovery/data-map')
const goCustomer360 = () => router.push('discovery/customer360')
</script>

<style lang="scss" scoped>
.discovery-page {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;

  .entry-card {
    margin-bottom: 16px;
    cursor: pointer;
    h3 { margin: 0 0 8px; }
    p { color: #86909c; font-size: 13px; margin: 0; }
  }
}
</style>