<template>
  <div class="unified-metrics-page">
    <a-page-header title="统一指标" sub-title="多维分析 · 趋势监控" :back="false">
      <template #extra>
        <a-button @click="goBack"><template #icon><icon-left /></template>返回</a-button>
      </template>
    </a-page-header>
    <div class="content-wrapper">
      <a-card :bordered="false" style="margin-bottom: 16px">
        <a-row :gutter="16">
          <a-col :span="6">
            <a-form-item label="指标"><a-select v-model="metric" size="large"><a-option v-for="m in metrics" :key="m.code" :value="m.code">{{ m.name }}</a-option></a-select></a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="时间范围"><a-select v-model="range" size="large"><a-option value="7d">近 7 天</a-option><a-option value="30d">近 30 天</a-option><a-option value="90d">近 90 天</a-option></a-select></a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="对比"><a-select v-model="compare" size="large"><a-option value="mom">环比</a-option><a-option value="yoy">同比</a-option></a-select></a-form-item>
          </a-col>
        </a-row>
      </a-card>

      <a-row :gutter="16">
        <a-col :span="6"><a-card :bordered="false"><a-statistic title="当前值" :value="580000" /></a-card></a-col>
        <a-col :span="6"><a-card :bordered="false"><a-statistic title="最大值" :value="620000" /></a-card></a-col>
        <a-col :span="6"><a-card :bordered="false"><a-statistic title="最小值" :value="540000" /></a-card></a-col>
        <a-col :span="6"><a-card :bordered="false"><a-statistic title="平均值" :value="580000" /></a-card></a-col>
      </a-row>

      <a-row :gutter="16" style="margin-top: 16px">
        <a-col :span="12">
          <a-card :bordered="false" title="按地区分析">
            <a-table :data="geoData" :pagination="false" row-key="region" size="small">
              <template #columns>
                <a-table-column title="地区" data-index="region" />
                <a-table-column title="DAU" data-index="dau" />
                <a-table-column title="占比" data-index="share" :width="100" />
              </template>
            </a-table>
          </a-card>
        </a-col>
        <a-col :span="12">
          <a-card :bordered="false" title="按年龄段分析">
            <a-table :data="ageData" :pagination="false" row-key="age" size="small">
              <template #columns>
                <a-table-column title="年龄段" data-index="age" />
                <a-table-column title="DAU" data-index="dau" />
                <a-table-column title="占比" data-index="share" :width="100" />
              </template>
            </a-table>
          </a-card>
        </a-col>
      </a-row>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
const metric = ref('M001')
const range = ref('30d')
const compare = ref('mom')
const metrics = ref([
  { code: 'M001', name: 'DAU' },
  { code: 'M002', name: 'MAU' },
  { code: 'M003', name: 'GMV' }
])
const geoData = ref([
  { region: '华东', dau: 185000, share: '32%' },
  { region: '华南', dau: 145000, share: '25%' },
  { region: '华北', dau: 110000, share: '19%' },
  { region: '西南', dau: 75000, share: '13%' },
  { region: '其他', dau: 65000, share: '11%' }
])
const ageData = ref([
  { age: '18-24', dau: 145000, share: '25%' },
  { age: '25-30', dau: 174000, share: '30%' },
  { age: '31-40', dau: 162000, share: '28%' },
  { age: '41-50', dau: 69000, share: '12%' },
  { age: '51+', dau: 30000, share: '5%' }
])
const goBack = () => router.push('discovery')
</script>
<style lang="scss" scoped>
.unified-metrics-page { background: #f5f7fa; min-height: 100vh; }
.content-wrapper { padding: 0 24px 24px; }
</style>
