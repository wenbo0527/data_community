<template>
  <div class="explore-audit-page">
    <div class="page-header">
      <div>
        <h2>决策审计</h2>
        <p>按时间线展示采纳/否决/暂缓决策，并呈现审计字段结构（Demo）。</p>
      </div>
      <a-space>
        <a-button type="outline" @click="router.push('/explore/topics')">课题列表</a-button>
        <a-button type="primary" @click="handleExport">审计导出</a-button>
      </a-space>
    </div>

    <a-card :bordered="false" class="filter-card">
      <a-space wrap size="large">
        <a-select v-model="filters.result" allow-clear placeholder="决策结果" style="width: 180px" :options="resultOptions" />
        <a-input v-model="filters.keyword" allow-clear placeholder="搜索课题ID/依据" style="width: 260px" />
        <a-button @click="resetFilters">重置</a-button>
      </a-space>
    </a-card>

    <a-row :gutter="16" class="content-row">
      <a-col :span="16">
        <a-card :bordered="false" class="panel-card" title="决策时间线">
          <a-empty v-if="filteredDecisions.length === 0" description="暂无决策记录" />
          <a-timeline v-else>
            <a-timeline-item v-for="item in filteredDecisions" :key="item.id">
              <div class="timeline-title">
                <a-space>
                  <a-tag :color="resultColor(item.result)">{{ resultLabel(item.result) }}</a-tag>
                  <a-link @click="router.push(`/explore/topics/${item.topicId}`)">{{ item.topicId }}</a-link>
                </a-space>
              </div>
              <div class="timeline-meta">决策人：{{ item.decider }} · {{ item.decidedAt }}</div>
              <div class="timeline-body">决策依据：{{ item.rationale }}</div>
              <div class="timeline-sign">
                <a-tag color="green">{{ item.signatureStatus === 'mock_verified' ? '电子签名：已验证（Demo）' : '电子签名：待签名' }}</a-tag>
              </div>
            </a-timeline-item>
          </a-timeline>
        </a-card>

        <!-- §6.5.5 审批驳回/部署失败/实际上线通知记录 -->
        <a-card :bordered="false" class="panel-card" title="同步事件通知记录（变量中心 → 探索中心）" style="margin-top: 16px">
          <a-empty v-if="syncNotifications.length === 0" description="暂无同步通知记录" />
          <a-timeline v-else>
            <a-timeline-item v-for="(item, idx) in syncNotifications" :key="idx">
              <div class="sync-notify-row">
                <a-space>
                  <a-tag :color="notifyColor(item.action)">{{ notifyLabel(item.action) }}</a-tag>
                  <a-link @click="router.push(`/explore/topics/${item.topicId}`)">{{ item.topicId }}</a-link>
                </a-space>
              </div>
              <div class="timeline-meta">{{ item.occurredAt }} · {{ item.operator }}</div>
              <div class="timeline-body">{{ item.reason }}</div>
              <div class="sync-notify-fields">
                变更前：<a-tag size="small">{{ item.beforeValue }}</a-tag>
                → 变更后：<a-tag size="small" :color="notifyColor(item.action)">{{ item.afterValue }}</a-tag>
              </div>
            </a-timeline-item>
          </a-timeline>
        </a-card>
      </a-col>

      <a-col :span="8">
        <a-card :bordered="false" class="panel-card" title="审计字段结构（示例）">
          <a-descriptions :column="1" bordered size="small">
            <a-descriptions-item label="操作时间">精确到秒</a-descriptions-item>
            <a-descriptions-item label="操作人">决策人/编辑人</a-descriptions-item>
            <a-descriptions-item label="操作类型">创建/修改/决策/状态变更/同步</a-descriptions-item>
            <a-descriptions-item label="变更字段">例如 transformLogic / result / variableSync.status</a-descriptions-item>
            <a-descriptions-item label="变更前值">字符串化存储</a-descriptions-item>
            <a-descriptions-item label="变更后值">字符串化存储</a-descriptions-item>
            <a-descriptions-item label="变更原因">必须填写</a-descriptions-item>
          </a-descriptions>

          <a-divider />

          <a-alert type="info" :show-icon="false">
            Demo 中的"审计导出"仅展示交互路径，不生成真实 PDF/Excel。
            <div style="margin-top: 8px; font-size: 12px">
              §6.5 同步机制：变量中心状态变更通过事件订阅推送，探索中心只读展示，同步延迟容忍度 1 分钟级。
            </div>
          </a-alert>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { Message } from '@arco-design/web-vue'
import { useRouter } from 'vue-router'
import { ExploreStore, type ExploreDecisionResult } from '@/modules/variable-hub/mock/explore/explore-store'

const router = useRouter()

const filters = reactive({
  result: '' as '' | ExploreDecisionResult,
  keyword: ''
})

const resultOptions = [
  { label: '采纳', value: 'adopted' },
  { label: '否决', value: 'rejected' },
  { label: '暂缓', value: 'paused' }
]

const resultLabel = (value: ExploreDecisionResult) => ({ adopted: '采纳', rejected: '否决', paused: '暂缓' }[value])
const resultColor = (value: ExploreDecisionResult) => ({ adopted: 'green', rejected: 'red', paused: 'orange' }[value])

// §6.5.5 同步事件通知：展示变量中心状态变更事件
// 演示用：1 秒轮询触发响应式更新
const tickRef = ref(0)
let pollTimer: number | undefined
onMounted(() => {
  pollTimer = window.setInterval(() => {
    tickRef.value++
  }, 1000)
})
onUnmounted(() => {
  if (pollTimer) {
    window.clearInterval(pollTimer)
    pollTimer = undefined
  }
})

const notifyLabel = (action: string) => {
  if (action === '同步') return '同步事件'
  if (action === '回退') return '驳回回退'
  return action
}

const notifyColor = (action: string) => {
  if (action === '同步') return 'arcoblue'
  if (action === '回退') return 'red'
  return 'gray'
}

const decisions = computed(() => {
  void tickRef.value
  return ExploreStore.listDecisions()
})

const filteredDecisions = computed(() => {
  let list = [...decisions.value]
  if (filters.result) list = list.filter((item) => item.result === filters.result)
  const keyword = filters.keyword.trim().toLowerCase()
  if (keyword) {
    list = list.filter((item) => item.topicId.toLowerCase().includes(keyword) || item.rationale.toLowerCase().includes(keyword))
  }
  return list
})

/**
 * §6.5.5 同步通知事件（变量中心 → 探索中心）
 * 仅展示 action ∈ {同步, 回退} 的审计事件，对应"变量状态变更"和"审批驳回回退"
 */
const syncNotifications = computed(() => {
  void tickRef.value
  const allTopics = ExploreStore.listTopics()
  const all: Array<{
    topicId: string
    action: string
    operator: string
    occurredAt: string
    beforeValue: string
    afterValue: string
    reason: string
  }> = []
  allTopics.forEach((topic) => {
    const events = ExploreStore.listAuditEventsByTopic(topic.id)
    events.forEach((evt) => {
      if (evt.action === '同步' || evt.action === '回退') {
        all.push(evt)
      }
    })
  })
  return all.sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
})

const resetFilters = () => {
  filters.result = ''
  filters.keyword = ''
}

const handleExport = () => {
  Message.info('Demo：审计导出功能展示路径，实际导出将在后续阶段补齐')
}
</script>

<style scoped>
.explore-audit-page {
  min-height: calc(100vh - 88px);
  background: #f7f8fa;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 16px;
}

.page-header h2 {
  margin: 0;
  font-size: 22px;
  line-height: 30px;
}

.page-header p {
  margin: 8px 0 0;
  color: #4e5969;
}

.filter-card,
.panel-card {
  box-shadow: 0 8px 20px rgba(15, 35, 95, 0.06);
}

.content-row {
  margin-top: 16px;
}

.timeline-title {
  font-weight: 600;
  color: #1d2129;
}

.timeline-meta {
  margin-top: 6px;
  color: #86909c;
  font-size: 12px;
}

.timeline-body {
  margin-top: 8px;
  color: #4e5969;
  line-height: 1.6;
}

.timeline-sign {
  margin-top: 10px;
}

/* §6.5.5 同步通知记录样式 */
.sync-notify-row {
  font-weight: 600;
  color: #1d2129;
}

.sync-notify-fields {
  margin-top: 8px;
  font-size: 12px;
  color: #4e5969;
}

.sync-notify-fields a-tag {
  margin: 0 4px;
}
</style>

