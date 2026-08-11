<template>
  <div class="data-resources-page">
    <!-- 顶部 Banner 区域 -->
    <div class="banner-section">
      <div class="banner-content">
        <div class="title-row">
          <h1 class="banner-title">数据资源目录 · 文件导入</h1>
        </div>
        <p class="banner-subtitle">Excel / CSV / Parquet 线下数据</p>

        <div class="search-area">
          <a-input-search
            v-model="search"
            class="main-search-input"
            placeholder="输入文件名、格式或上传人搜索"
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
              v-model="format"
              placeholder="文件格式"
              allow-clear
              size="large"
              style="width: 160px"
              class="filter-select"
            >
              <a-option value="CSV">CSV</a-option>
              <a-option value="XLSX">XLSX</a-option>
              <a-option value="Parquet">Parquet</a-option>
              <a-option value="GeoJSON">GeoJSON</a-option>
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
          <a-col v-for="f in filteredFiles" :key="f.id" :xs="24" :sm="12" :md="8" :lg="6">
            <a-card hoverable :bordered="false">
              <template #title>
                <a-space>
                  <a-tag color="arcoblue">{{ f.format }}</a-tag>
                  <span>{{ f.name }}</span>
                </a-space>
              </template>
              <a-descriptions :column="1" size="small">
                <a-descriptions-item label="大小">{{ f.size }}</a-descriptions-item>
                <a-descriptions-item label="行数">{{ f.rowCount.toLocaleString() }}</a-descriptions-item>
                <a-descriptions-item label="上传人">{{ f.uploader }}</a-descriptions-item>
                <a-descriptions-item label="关联资产">{{ f.linkedAsset }}</a-descriptions-item>
                <a-descriptions-item label="状态">
                  <a-tag :color="statusColor(f.status)">{{ statusLabel(f.status) }}</a-tag>
                </a-descriptions-item>
                <a-descriptions-item label="导入时间">{{ f.importedAt }}</a-descriptions-item>
              </a-descriptions>
              <template #actions>
                <a-button type="text" size="small" @click="viewDetail(f)">详情</a-button>
                <a-button type="text" size="small" @click="relink(f)">重新关联</a-button>
              </template>
            </a-card>
          </a-col>
        </a-row>
        <a-empty v-if="filteredFiles.length === 0" description="暂无文件" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconSearch } from '@arco-design/web-vue/es/icon'

const search = ref('')
const format = ref<string | undefined>(undefined)

const files = ref([
  { id: 'F001', name: '客户名单 2024Q4', format: 'CSV', size: '125 MB', rowCount: 1280000, uploader: '王运营', linkedAsset: '客户主档域', status: 'linked', importedAt: '2024-12-15 10:30' },
  { id: 'F002', name: '交易流水 11月', format: 'Parquet', size: '2.3 GB', rowCount: 25000000, uploader: '李开发', linkedAsset: '交易域', status: 'linked', importedAt: '2024-12-01 02:00' },
  { id: 'F003', name: '合作伙伴 2024', format: 'XLSX', size: '8.5 MB', rowCount: 3500, uploader: '陈营销', linkedAsset: '-', status: 'unlinked', importedAt: '今天 14:20' },
  { id: 'F004', name: '区域分布数据', format: 'GeoJSON', size: '15 MB', rowCount: 0, uploader: '吴工程', linkedAsset: '地理域', status: 'linked', importedAt: '2024-11-20 16:00' },
  { id: 'F005', name: '黑名单 2026', format: 'XLSX', size: '512 KB', rowCount: 4200, uploader: '张风控', linkedAsset: '风控评估', status: 'linked', importedAt: '2026-07-28 09:15' }
])

const filteredFiles = computed(() => {
  let result = files.value
  if (search.value) {
    const k = search.value.toLowerCase()
    result = result.filter(s =>
      s.name.toLowerCase().includes(k) ||
      s.format.toLowerCase().includes(k) ||
      s.uploader.toLowerCase().includes(k)
    )
  }
  if (format.value) {
    result = result.filter(s => s.format === format.value)
  }
  return result
})

function statusColor(s: string) {
  return { linked: 'green', unlinked: 'orange', failed: 'red' }[s] || 'gray'
}
function statusLabel(s: string) {
  return { linked: '已关联', unlinked: '未关联', failed: '失败' }[s] || s
}
function viewDetail(f: any) {
  Message.info(`查看文件: ${f.name}`)
}
function relink(f: any) {
  Message.success(`已发起重新关联: ${f.name}`)
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