<template>
  <div class="external-page">
    <a-page-header title="外部数据" sub-title="外部数据源接入 · 查询 · 消费分析" :back="false">
      <template #extra>
        <a-button @click="goBack"><template #icon><icon-left /></template>返回</a-button>
        <a-button type="primary"><template #icon><icon-plus /></template>接入新数据源</a-button>
      </template>
    </a-page-header>

    <div class="content-wrapper">
      <a-row :gutter="16" style="margin-bottom: 16px">
        <a-col :span="6"><a-card :bordered="false"><a-statistic title="已接入数据源" :value="sources.length" /></a-card></a-col>
        <a-col :span="6"><a-card :bordered="false"><a-statistic title="本月查询次数" :value="12580" /></a-card></a-col>
        <a-col :span="6"><a-card :bordered="false"><a-statistic title="命中率" :value="92.5" suffix="%" /></a-card></a-col>
        <a-col :span="6"><a-card :bordered="false"><a-statistic title="本月费用" :value="85000" prefix="¥" /></a-card></a-col>
      </a-row>

      <a-card :bordered="false">
        <a-table :data="sources" :pagination="{ pageSize: 10 }" row-key="id" size="medium">
          <template #columns>
            <a-table-column title="ID" data-index="id" :width="100" />
            <a-table-column title="数据源名" data-index="name" />
            <a-table-column title="类型" data-index="type" :width="100">
              <template #cell="{ record }">
                <a-tag :color="typeColor(record.type)">{{ typeLabel(record.type) }}</a-tag>
              </template>
            </a-table-column>
            <a-table-column title="供应商" data-index="provider" :width="130" />
            <a-table-column title="状态" data-index="status" :width="100">
              <template #cell="{ record }">
                <a-tag :color="record.status === 'online' ? 'green' : 'gray'">
                  {{ record.status === 'online' ? '已上线' : '未上线' }}
                </a-tag>
              </template>
            </a-table-column>
            <a-table-column title="调用次数" data-index="monthlyCalls" :width="130">
              <template #cell="{ record }">{{ record.monthlyCalls.toLocaleString() }}</template>
            </a-table-column>
            <a-table-column title="费用" data-index="monthlyCost" :width="120">
              <template #cell="{ record }">¥{{ record.monthlyCost.toLocaleString() }}</template>
            </a-table-column>
            <a-table-column title="操作" :width="120">
              <template #cell>
                <a-button type="text" size="small">查看</a-button>
                <a-button type="text" size="small">申请</a-button>
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
  { id: 'EXT001', name: '运营商三要素', type: 'identity', provider: '银联', status: 'online', monthlyCalls: 12500, monthlyCost: 15000 },
  { id: 'EXT002', name: '法院失信', type: 'risk', provider: '司法数据', status: 'online', monthlyCalls: 8500, monthlyCost: 8000 },
  { id: 'EXT003', name: '学历查询', type: 'identity', provider: '学信网', status: 'online', monthlyCalls: 3200, monthlyCost: 4000 },
  { id: 'EXT004', name: '企业工商信息', type: 'company', provider: '天眼查', status: 'online', monthlyCalls: 1200, monthlyCost: 12000 },
  { id: 'EXT005', name: '车辆信息', type: 'asset', provider: '交管局', status: 'online', monthlyCalls: 680, monthlyCost: 3000 },
  { id: 'EXT006', name: '多头借贷', type: 'risk', provider: '同盾', status: 'online', monthlyCalls: 15200, monthlyCost: 12000 },
  { id: 'EXT007', name: '反欺诈', type: 'risk', provider: '数美', status: 'online', monthlyCalls: 1850, monthlyCost: 13000 }
])

function typeColor(t: string) { return { identity: 'arcoblue', risk: 'red', company: 'purple', asset: 'orange' }[t] || 'gray' }
function typeLabel(t: string) { return { identity: '身份', risk: '风险', company: '企业', asset: '资产' }[t] || t }

const goBack = () => router.push('discovery')
</script>

<style lang="scss" scoped>
.external-page { background: #f5f7fa; min-height: 100vh; }
.content-wrapper { padding: 0 24px 24px; }
</style>
