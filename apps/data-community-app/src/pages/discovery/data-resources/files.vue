<template>
  <div class="data-resource-files-page">
    <a-page-header title="文件导入" sub-title="Excel / CSV 线下数据" :back="false">
      <template #extra>
        <a-button @click="goBack"><template #icon><icon-left /></template>返回</a-button>
        <a-button type="primary"><template #icon><icon-upload /></template>上传文件</a-button>
      </template>
    </a-page-header>
    <div class="content-wrapper">
      <a-card :bordered="false">
        <a-table :data="files" :pagination="{ pageSize: 10, showTotal: true }" row-key="id" size="medium">
          <template #columns>
            <a-table-column title="文件名" data-index="name" />
            <a-table-column title="类型" :width="80">
              <template #cell="{ record }">
                <a-tag color="arcoblue">{{ record.type }}</a-tag>
              </template>
            </a-table-column>
            <a-table-column title="大小" data-index="size" :width="120" />
            <a-table-column title="上传人" data-index="uploader" :width="120" />
            <a-table-column title="上传时间" data-index="uploadedAt" :width="160" />
            <a-table-column title="关联资产" data-index="linkedAsset" />
            <a-table-column title="状态" :width="100">
              <template #cell="{ record }">
                <a-tag :color="statusColor(record.status)">{{ record.status }}</a-tag>
              </template>
            </a-table-column>
          </template>
        </a-table>
      </a-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
const files = ref([
  { id: 'F001', name: '2026Q2_客户标签_补充.csv', type: 'CSV', size: '2.3 MB', uploader: '王运营', uploadedAt: '2026-07-30 14:21', linkedAsset: '客户主档域', status: '已关联' },
  { id: 'F002', name: '黑名单2026.xlsx', type: 'XLSX', size: '512 KB', uploader: '张风控', uploadedAt: '2026-07-28 09:15', linkedAsset: '风控评估', status: '已关联' },
  { id: 'F003', name: '门店清单2026.xlsx', type: 'XLSX', size: '128 KB', uploader: '陈营销', uploadedAt: '2026-07-25 11:33', linkedAsset: '-', status: '未关联' },
  { id: 'F004', name: '监管字段说明.csv', type: 'CSV', size: '32 KB', uploader: '钱财务', uploadedAt: '2026-07-20 16:00', linkedAsset: '监管报送', status: '已关联' },
  { id: 'F005', name: '渠道投放历史.xlsx', type: 'XLSX', size: '1.2 MB', uploader: '陈营销', uploadedAt: '2026-07-18 10:45', linkedAsset: '营销域', status: '已关联' }
])
function statusColor(s: string) { return { 已关联: 'green', 未关联: 'orange', 失败: 'red' }[s] || 'gray' }
function goBack() { router.push('discovery/data-resources') }
</script>
<style lang="scss" scoped>
.data-resource-files-page { background: #f5f7fa; min-height: 100vh; }
.content-wrapper { padding: 0 24px 24px; }
</style>