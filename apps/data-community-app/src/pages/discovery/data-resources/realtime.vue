<template>
  <div class="data-resources-page">
    <!-- 顶部 Banner 区域 -->
    <div class="banner-section">
      <div class="banner-content">
        <div class="title-row">
          <h1 class="banner-title">数据资源目录 · 实时数据接入</h1>
        </div>
        <p class="banner-subtitle">Kafka / CDC 流式接入</p>

        <div class="search-area">
          <a-input-search
            v-model="search"
            class="main-search-input"
            placeholder="输入实时源、下游表或负责人搜索"
            search-button
            size="large"
            allow-clear
          >
            <template #button-icon>
              <icon-search />
            </template>
          </a-input-search>

          <div class="search-filters-inline">
            <a-select
              v-model="engine"
              placeholder="中间件"
              allow-clear
              size="large"
              style="width: 160px"
              class="filter-select"
            >
              <a-option value="Kafka">Kafka</a-option>
              <a-option value="CDC">CDC</a-option>
            </a-select>
          </div>
        </div>
      </div>
      <div class="banner-decoration">
        <div class="decoration-cube"></div>
      </div>
    </div>

    <!-- 主体内容区域 -->
    <div class="main-content">
      <div class="content-section">
        <a-row :gutter="[16, 16]">
          <a-col v-for="r in filteredStreams" :key="r.id" :xs="24" :sm="12" :md="8" :lg="6">
            <a-card hoverable :bordered="false">
              <template #title>
                <a-space>
                  <a-tag :color="engineColor(r.engine)">{{ r.engine }}</a-tag>
                  <span>{{ r.name }}</span>
                </a-space>
              </template>
              <a-descriptions :column="1" size="small">
                <a-descriptions-item label="吞吐">{{ r.throughputLabel }}</a-descriptions-item>
                <a-descriptions-item label="延迟">{{ r.latencyLabel }}</a-descriptions-item>
                <a-descriptions-item label="下游表">{{ r.downstream }}</a-descriptions-item>
                <a-descriptions-item label="负责人">{{ r.owner }}</a-descriptions-item>
                <a-descriptions-item label="状态">
                  <a-tag :color="statusColor(r.status)">{{ statusLabel(r.status) }}</a-tag>
                </a-descriptions-item>
              </a-descriptions>
              <template #actions>
                <a-button type="text" size="small" @click="viewDetail(r)">详情</a-button>
                <a-button type="text" size="small" @click="configStream(r)">采集配置</a-button>
              </template>
            </a-card>
          </a-col>
        </a-row>
        <a-empty v-if="filteredStreams.length === 0" description="暂无实时源" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconSearch } from '@arco-design/web-vue/es/icon'

const search = ref('')
const engine = ref<string | undefined>(undefined)

const streams = ref([
  { id: 'S001', name: '交易流水 CDC', engine: 'Kafka', throughputLabel: '0.8 MB/s', latencyLabel: '32 ms', downstream: 'dwd_交易_0001', owner: '李开发', status: 'running' },
  { id: 'S002', name: '客户主档 binlog', engine: 'CDC', throughputLabel: '0.4 MB/s', latencyLabel: '45 ms', downstream: 'dws_客户主档', owner: '王运营', status: 'running' },
  { id: 'S003', name: '风控事件流', engine: 'Kafka', throughputLabel: '0.5 MB/s', latencyLabel: '28 ms', downstream: 'dwd_风控_0017', owner: '张风控', status: 'running' },
  { id: 'S004', name: '营销点击流', engine: 'Kafka', throughputLabel: '0.4 MB/s', latencyLabel: '52 ms', downstream: 'ods_营销_0001', owner: '陈营销', status: 'paused' }
])

const filteredStreams = computed(() => {
  let result = streams.value
  if (search.value) {
    const k = search.value.toLowerCase()
    result = result.filter(s =>
      s.name.toLowerCase().includes(k) ||
      s.downstream.toLowerCase().includes(k) ||
      s.owner.toLowerCase().includes(k)
    )
  }
  if (engine.value) {
    result = result.filter(s => s.engine === engine.value)
  }
  return result
})

function engineColor(e: string) {
  return { Kafka: 'arcoblue', CDC: 'purple' }[e] || 'gray'
}
function statusColor(s: string) {
  return s === 'running' ? 'green' : 'gray'
}
function statusLabel(s: string) {
  return s === 'running' ? '采集中' : '已停'
}
function viewDetail(r: any) {
  Message.info(`查看实时源: ${r.name}`)
}
function configStream(r: any) {
  Message.success(`已打开采集配置: ${r.name}`)
}
</script>

<style scoped>
.data-resources-page {
  min-height: 100vh;
  background: #f7f8fa;
  position: relative;
  overflow-x: hidden;
}
.banner-section {
  background: linear-gradient(180deg, #E6F0FF 0%, #F7F8FA 100%);
  padding: 40px 0;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 280px;
}
.banner-content {
  width: 100%;
  max-width: 1800px;
  z-index: 2;
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 0 40% 0 40px;
  box-sizing: border-box;
}
.banner-title {
  font-size: 40px;
  font-weight: bold;
  color: #1d2129;
  margin: 0 0 16px 0;
  line-height: 1.2;
}
.banner-subtitle {
  font-size: 14px;
  color: #86909c;
  margin-bottom: 32px;
  max-width: 600px;
  line-height: 1.6;
}
.search-area {
  display: flex;
  gap: 16px;
  align-items: center;
  width: 100%;
  max-width: 900px;
  flex-wrap: wrap;
}
.main-search-input {
  flex: 1;
  min-width: 400px;
  background: #fff;
  border-radius: 30px;
  border: 1px solid #165DFF;
  box-shadow: 0 4px 10px rgba(22, 93, 255, 0.1);
}
.main-search-input :deep(.arco-input-wrapper) {
  border-radius: 30px;
  padding-left: 20px;
  background: #fff;
}
.main-search-input :deep(.arco-input-search-btn) {
  border-radius: 0 30px 30px 0;
  background: transparent;
  color: #165DFF;
  border-left: 1px solid #f2f3f5;
}
.search-filters-inline {
  display: flex;
  gap: 12px;
}
.filter-select {
  background: #fff;
  border-radius: 4px;
}
.banner-decoration {
  position: absolute;
  right: 0;
  top: 0;
  width: 40%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
}
.decoration-cube {
  position: absolute;
  top: 40px;
  right: 100px;
  width: 200px;
  height: 200px;
  background: linear-gradient(135deg, #e8f3ff 0%, #cce4ff 100%);
  transform: rotate(-15deg) skew(-10deg);
  border-radius: 20px;
  box-shadow: -20px 20px 40px rgba(22, 93, 255, 0.1);
}
.main-content {
  padding: 0 40px 40px;
  width: 100%;
  max-width: 1800px;
  margin: -40px auto 0;
  position: relative;
  z-index: 3;
}
.content-section {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
</style>