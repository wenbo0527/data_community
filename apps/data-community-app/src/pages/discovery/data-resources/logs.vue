<template>
  <div class="data-resource-logs-page">
    <a-page-header title="日志数据" sub-title="埋点 / 应用 / 操作日志" :back="false">
      <template #extra>
        <a-button @click="goBack"><template #icon><icon-left /></template>返回</a-button>
        <a-button type="primary"><template #icon><icon-plus /></template>配置日志源</a-button>
      </template>
    </a-page-header>
    <div class="content-wrapper">
      <a-row :gutter="[16, 16]" style="margin-bottom: 16px">
        <a-col :span="6"><a-card :bordered="false"><a-statistic title="日志源数" :value="3" /></a-card></a-col>
        <a-col :span="6"><a-card :bordered="false"><a-statistic title="日均增量" value="12.3" suffix="GB" /></a-card></a-col>
        <a-col :span="6"><a-card :bordered="false"><a-statistic title="近 7 天事件" value="8.2" suffix="亿" /></a-card></a-col>
        <a-col :span="6"><a-card :bordered="false"><a-statistic title="异常事件率" :value="0.42" suffix="%" :value-style="{ color: '#00b42a' }" /></a-card></a-col>
      </a-row>
      <a-card :bordered="false">
        <a-table :data="sources" :pagination="false" row-key="id" size="medium">
          <template #columns>
            <a-table-column title="日志源" data-index="name" />
            <a-table-column title="类型" :width="100">
              <template #cell="{ record }">
                <a-tag color="purple">{{ record.type }}</a-tag>
              </template>
            </a-table-column>
            <a-table-column title="日均事件" data-index="dailyEvents" :width="140" />
            <a-table-column title="保留" data-index="retention" :width="100" />
            <a-table-column title="Owner" data-index="owner" :width="100" />
            <a-table-column title="状态" :width="100">
              <template #cell="{ record }">
                <a-tag :color="record.status === 'running' ? 'green' : 'gray'">{{ record.status === 'running' ? '采集中' : '已停' }}</a-tag>
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
const sources = ref([
  { id: 'L001', name: '客户端埋点日志', type: '埋点', dailyEvents: '3.5 亿', retention: '90 天', owner: '王运营', status: 'running' },
  { id: 'L002', name: '应用系统操作日志', type: '操作', dailyEvents: '4.2 亿', retention: '180 天', owner: '吴工程', status: 'running' },
  { id: 'L003', name: '服务调用日志', type: '调用', dailyEvents: '0.5 亿', retention: '30 天', owner: '吴工程', status: 'paused' }
])
function goBack() { router.push('discovery/data-resources') }
</script>
<style lang="scss" scoped>
.data-resource-logs-page { background: #f5f7fa; min-height: 100vh; }
.content-wrapper { padding: 0 24px 24px; }
</style>