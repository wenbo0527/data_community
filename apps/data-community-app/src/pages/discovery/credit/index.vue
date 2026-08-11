<template>
  <PageContainer>
    <PageHeader title="征信查询" sub-title="个人/企业征信 · 风险评估">
      <template #extra>
        <a-button @click="goBack"><template #icon><icon-left /></template>返回</a-button>
      </template>
    </PageHeader>

    <div class="content-wrapper">
      <a-card :bordered="false" style="margin-bottom: 16px">
        <a-row :gutter="16">
          <a-col :span="6"><a-input v-model="idCard" placeholder="身份证号" size="large" /></a-col>
          <a-col :span="6"><a-input v-model="name" placeholder="姓名" size="large" /></a-col>
          <a-col :span="6"><a-select v-model="queryType" size="large"><a-option value="personal">个人</a-option><a-option value="company">企业</a-option></a-select></a-col>
          <a-col :span="6"><a-button type="primary" long size="large" @click="doQuery">立即查询</a-button></a-col>
        </a-row>
      </a-card>

      <a-row :gutter="16" v-if="result">
        <a-col :span="16">
          <a-card :bordered="false" title="查询结果">
            <a-descriptions :column="2" :bordered="true">
              <a-descriptions-item label="姓名">{{ result.name }}</a-descriptions-item>
              <a-descriptions-item label="身份证">{{ result.idCard }}</a-descriptions-item>
              <a-descriptions-item label="信用评分" :span="2">
                <a-progress :percent="result.score / 850" :stroke-width="8" :color="scoreColor(result.score)" />
                <strong style="margin-left: 8px; font-size: 16px">{{ result.score }}</strong>
              </a-descriptions-item>
              <a-descriptions-item label="贷款记录数">{{ result.loanCount }}</a-descriptions-item>
              <a-descriptions-item label="逾期次数">{{ result.overdueCount }}</a-descriptions-item>
              <a-descriptions-item label="近6月查询次数">{{ result.queryCount6m }}</a-descriptions-item>
              <a-descriptions-item label="黑名单">
                <a-tag :color="result.blacklistHit ? 'red' : 'green'">{{ result.blacklistHit ? '命中' : '未命中' }}</a-tag>
              </a-descriptions-item>
            </a-descriptions>

            <h3 style="margin: 24px 0 12px; font-size: 14px">贷款记录明细</h3>
            <a-table :data="result.loans" :pagination="false" row-key="id" size="small">
              <template #columns>
                <a-table-column title="编号" data-index="id" :width="90" />
                <a-table-column title="银行" data-index="bank" :width="110" />
                <a-table-column title="金额" data-index="amount" :width="110" />
                <a-table-column title="放款日" data-index="date" :width="120" />
                <a-table-column title="状态" data-index="status" :width="90">
                  <template #cell="{ record }">
                    <a-tag :color="record.status === 'overdue' ? 'red' : (record.status === 'paid' ? 'green' : 'orange')">
                      {{ record.status === 'overdue' ? '逾期' : (record.status === 'paid' ? '已结清' : '正常') }}
                    </a-tag>
                  </template>
                </a-table-column>
              </template>
            </a-table>
          </a-card>
        </a-col>

        <a-col :span="8">
          <a-card :bordered="false" title="查询记录">
            <a-list :data="history" size="small">
              <template #item="item">
                <a-list-item>
                  <a-list-item-meta>
                    <template #title>{{ item.idCard }} - {{ item.type }}</template>
                    <template #description>{{ item.time }} · {{ item.user }}</template>
                  </a-list-item-meta>
                </a-list-item>
              </template>
            </a-list>
          </a-card>
        </a-col>
      </a-row>
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import PageContainer from '@/components-dca/common/PageContainer.vue'
import PageHeader from '@/components-dca/common/PageHeader.vue'
import { Message } from '@arco-design/web-vue'

const router = useRouter()

const idCard = ref('')
const name = ref('')
const queryType = ref('personal')
const result = ref<any>(null)
const history = ref([
  { idCard: '110101****1234', type: '个人征信', time: '今天 14:30', user: '张风控' },
  { idCard: '110102****5678', type: '个人征信', time: '今天 11:20', user: '李审批' }
])

function doQuery() {
  if (!idCard.value) {
    Message.warning('请输入身份证号')
    return
  }
  result.value = {
    name: name.value || '张明',
    idCard: idCard.value,
    score: 720,
    loanCount: 3,
    overdueCount: 0,
    queryCount6m: 5,
    blacklistHit: false,
    loans: [
      { id: 'LN001', bank: '工商银行', amount: 50000, date: '2024-12-10', status: 'normal' },
      { id: 'LN002', bank: '招商银行', amount: 120000, date: '2024-08-15', status: 'normal' },
      { id: 'LN003', bank: '建设银行', amount: 80000, date: '2023-12-20', status: 'paid' }
    ]
  }
  Message.success('查询完成')
}

function scoreColor(score: number) {
  if (score >= 750) return '#00b42a'
  if (score >= 650) return '#ff7d00'
  return '#f53f3f'
}

const goBack = () => router.push('discovery')
</script>

<style lang="scss" scoped>
/* 2026-08-06 统一:页面背景/高度由 PageContainer 提供 */
.content-wrapper { padding: 0 24px 24px; }
</style>
