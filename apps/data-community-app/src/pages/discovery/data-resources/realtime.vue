<template>
  <div class="data-resource-realtime-page">
    <a-page-header title="实时数据接入" sub-title="Kafka / CDC 流式接入" :back="false">
      <template #extra>
        <a-button @click="goBack"><template #icon><icon-left /></template>返回</a-button>
        <a-button type="primary"><template #icon><icon-plus /></template>配置实时源</a-button>
      </template>
    </a-page-header>
    <div class="content-wrapper">
      <a-row :gutter="[16, 16]" style="margin-bottom: 16px">
        <a-col :span="6"><a-card :bordered="false"><a-statistic title="实时源数" :value="4" /></a-card></a-col>
        <a-col :span="6"><a-card :bordered="false"><a-statistic title="总吞吐" value="2.1" suffix="MB/s" /></a-card></a-col>
        <a-col :span="6"><a-card :bordered="false"><a-statistic title="平均延迟" value="38" suffix="ms" :value-style="{ color: '#00b42a' }" /></a-card></a-col>
        <a-col :span="6"><a-card :bordered="false"><a-statistic title="可用性" value="99.92" suffix="%" :value-style="{ color: '#00b42a' }" /></a-card></a-col>
      </a-row>
      <a-card :bordered="false">
        <a-table :data="streams" :pagination="false" row-key="id" size="medium">
          <template #columns>
            <a-table-column title="实时源" data-index="name" />
            <a-table-column title="中间件" :width="120">
              <template #cell="{ record }">
                <a-tag color="arcoblue">{{ record.engine }}</a-tag>
              </template>
            </a-table-column>
            <a-table-column title="吞吐" data-index="throughput" :width="120" />
            <a-table-column title="延迟" data-index="latency" :width="100" />
            <a-table-column title="下游" data-index="downstream" />
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
const streams = ref([
  { id: 'S001', name: '交易流水 CDC', engine: 'Kafka', throughput: '0.8 MB/s', latency: '32 ms', downstream: 'dwd_交易_0001', status: 'running' },
  { id: 'S002', name: '客户主档 binlog', engine: 'CDC', throughput: '0.4 MB/s', latency: '45 ms', downstream: 'dws_客户主档', status: 'running' },
  { id: 'S003', name: '风控事件流', engine: 'Kafka', throughput: '0.5 MB/s', latency: '28 ms', downstream: 'dwd_风控_0017', status: 'running' },
  { id: 'S004', name: '营销点击流', engine: 'Kafka', throughput: '0.4 MB/s', latency: '52 ms', downstream: 'ods_营销_0001', status: 'paused' }
])
function goBack() { router.push('discovery/data-resources') }
</script>
<style lang="scss" scoped>
.data-resource-realtime-page { background: #f5f7fa; min-height: 100vh; }
.content-wrapper { padding: 0 24px 24px; }
</style>