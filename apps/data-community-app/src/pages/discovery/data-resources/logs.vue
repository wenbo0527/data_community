<template>
  <div class="data-resources-page">
    <!-- 顶部 Banner 区域 -->
    <div class="banner-section">
      <div class="banner-content">
        <div class="title-row">
          <h1 class="banner-title">数据资源目录 · 日志数据</h1>
        </div>
        <p class="banner-subtitle">埋点 / 应用 / 操作 / 调用 日志</p>

        <div class="search-area">
          <a-input-search
            v-model="search"
            class="main-search-input"
            placeholder="输入日志源、类型或负责人搜索"
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
              v-model="logType"
              placeholder="日志类型"
              allow-clear
              size="large"
              style="width: 160px"
              class="filter-select"
            >
              <a-option value="埋点">埋点</a-option>
              <a-option value="操作">操作</a-option>
              <a-option value="调用">调用</a-option>
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
          <a-col v-for="l in filteredLogs" :key="l.id" :xs="24" :sm="12" :md="8" :lg="6">
            <a-card hoverable :bordered="false">
              <template #title>
                <a-space>
                  <a-tag color="purple">{{ l.type }}</a-tag>
                  <span>{{ l.name }}</span>
                </a-space>
              </template>
              <a-descriptions :column="1" size="small">
                <a-descriptions-item label="日均事件">{{ l.dailyEvents }}</a-descriptions-item>
                <a-descriptions-item label="保留期">{{ l.retention }}</a-descriptions-item>
                <a-descriptions-item label="负责人">{{ l.owner }}</a-descriptions-item>
                <a-descriptions-item label="状态">
                  <a-tag :color="statusColor(l.status)">{{ statusLabel(l.status) }}</a-tag>
                </a-descriptions-item>
                <a-descriptions-item label="更新时间">{{ l.updatedAt }}</a-descriptions-item>
              </a-descriptions>
              <template #actions>
                <a-button type="text" size="small" @click="viewDetail(l)">详情</a-button>
                <a-button type="text" size="small" @click="configLog(l)">采集配置</a-button>
              </template>
            </a-card>
          </a-col>
        </a-row>
        <a-empty v-if="filteredLogs.length === 0" description="暂无日志源" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconSearch } from '@arco-design/web-vue/es/icon'

const search = ref('')
const logType = ref<string | undefined>(undefined)

const sources = ref([
  { id: 'L001', name: '客户端埋点日志', type: '埋点', dailyEvents: '3.5 亿', retention: '90 天', owner: '王运营', status: 'running', updatedAt: '今天 09:00' },
  { id: 'L002', name: '应用系统操作日志', type: '操作', dailyEvents: '4.2 亿', retention: '180 天', owner: '吴工程', status: 'running', updatedAt: '今天 09:00' },
  { id: 'L003', name: '服务调用日志', type: '调用', dailyEvents: '0.5 亿', retention: '30 天', owner: '吴工程', status: 'paused', updatedAt: '昨天 18:00' },
  { id: 'L004', name: '数据库慢查询', type: '操作', dailyEvents: '2,300', retention: '180 天', owner: '李开发', status: 'running', updatedAt: '今天 06:00' }
])

const filteredLogs = computed(() => {
  let result = sources.value
  if (search.value) {
    const k = search.value.toLowerCase()
    result = result.filter(s =>
      s.name.toLowerCase().includes(k) ||
      s.type.toLowerCase().includes(k) ||
      s.owner.toLowerCase().includes(k)
    )
  }
  if (logType.value) {
    result = result.filter(s => s.type === logType.value)
  }
  return result
})

function statusColor(s: string) {
  return s === 'running' ? 'green' : 'gray'
}
function statusLabel(s: string) {
  return s === 'running' ? '采集中' : '已停'
}
function viewDetail(l: any) {
  Message.info(`查看日志源: ${l.name}`)
}
function configLog(l: any) {
  Message.success(`已打开采集配置: ${l.name}`)
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