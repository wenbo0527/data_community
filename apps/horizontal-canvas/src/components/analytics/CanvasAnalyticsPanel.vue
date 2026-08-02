<template>
  <div class="canvas-analytics-panel">
    <div class="analytics-header">
      <h3 class="analytics-title">画布交互埋点 - 归因分析</h3>
      <a-space>
        <a-button size="small" @click="refresh">刷新</a-button>
        <a-button size="small" status="danger" @click="confirmClear">清空数据</a-button>
      </a-space>
    </div>

    <a-divider orientation="left" margin="6px">基础指标</a-divider>
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-label">编辑过的独立任务</div>
        <div class="metric-value">{{ metrics.totalTasks }}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">保存草稿次数</div>
        <div class="metric-value">{{ metrics.totalSaves }}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">发布成功次数</div>
        <div class="metric-value">{{ metrics.totalPublish }}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">校验失败次数</div>
        <div class="metric-value">{{ metrics.validateFailCount }}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">组合节点插入次数</div>
        <div class="metric-value">{{ metrics.comboInsertCount }}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">抽屉配置失败率</div>
        <div class="metric-value">{{ formatPercent(metrics.drawerSaveFailRate) }}</div>
      </div>
    </div>

    <a-divider orientation="left" margin="6px">任务构建漏斗</a-divider>
    <div class="funnel-meta">进入画布会话数：<strong>{{ funnel.totalSessions }}</strong></div>
    <div class="funnel-list">
      <div v-for="(step, idx) in funnel.steps" :key="step.key" class="funnel-row">
        <div class="funnel-row__label">
          <span class="funnel-row__index">{{ idx + 1 }}</span>
          <span>{{ step.label }}</span>
        </div>
        <div class="funnel-row__bar">
          <div class="funnel-row__bar-bg">
            <div class="funnel-row__bar-fill" :style="{ width: barWidth(step.conversion) }"></div>
          </div>
          <span class="funnel-row__pct">{{ formatPercent(step.conversion) }}</span>
        </div>
        <div class="funnel-row__count">{{ step.count }} 独立会话</div>
      </div>
    </div>

    <a-divider orientation="left" margin="6px">流失点（相邻步转化）</a-divider>
    <div class="dropoff-list">
      <div v-for="d in dropoff" :key="`${d.from}_${d.to}`" class="dropoff-row">
        <span class="dropoff-row__from">{{ labelOf(d.from) }}</span>
        <span class="dropoff-row__arrow">→</span>
        <span class="dropoff-row__to">{{ labelOf(d.to) }}</span>
        <span class="dropoff-row__loss">流失 {{ formatPercent(d.dropoff) }}</span>
      </div>
      <div v-if="!dropoff.length" class="dropoff-empty">暂无数据</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { Modal, Message } from '@arco-design/web-vue'
import * as tracker from '../../utils/trackerService.js'
import { computeFunnel, computeFunnelDropoff, computeBasicMetrics, CANVAS_FUNNEL_STEPS } from '../../utils/canvasFunnel.js'

const tick = ref(0)
let unsub = null

const events = computed(() => { tick.value; return tracker.getEvents() })
const metrics = computed(() => computeBasicMetrics(events.value))
const funnel = computed(() => { tick.value; return computeFunnel() })
const dropoff = computed(() => { tick.value; return computeFunnelDropoff() })

const labelMap = Object.fromEntries(CANVAS_FUNNEL_STEPS.map(s => [s.key, s.label]))
const labelOf = (key) => labelMap[key] || key

const formatPercent = (v) => {
  try {
    const n = Number(v)
    if (!Number.isFinite(n)) return '0%'
    return `${Math.round(n * 100)}%`
  } catch { return '0%' }
}

const barWidth = (v) => {
  try {
    const n = Math.max(0, Math.min(1, Number(v) || 0))
    return `${(n * 100).toFixed(1)}%`
  } catch { return '0%' }
}

const refresh = () => { tick.value++ }

const confirmClear = () => {
  Modal.confirm({
    title: '清空埋点数据？',
    content: '将清空所有画布事件与漏斗状态，不可恢复。',
    okText: '清空',
    cancelText: '取消',
    onOk: () => {
      tracker.clearEvents()
      tracker.clearFunnelState()
      tick.value++
      Message.success('已清空埋点数据')
    }
  })
}

onMounted(() => {
  unsub = tracker.subscribe(() => { tick.value++ })
})
onBeforeUnmount(() => { if (typeof unsub === 'function') unsub() })
</script>

<style scoped>
.canvas-analytics-panel { padding: 14px; background: #fbfbfd; }
.analytics-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.analytics-title { margin: 0; font-size: 16px; font-weight: 600; color: #1f2937; }

.metrics-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;
  margin: 8px 0 4px;
}
.metric-card {
  background: #fff; border: 1px solid var(--color-border-2); border-radius: 6px;
  padding: 10px 12px;
}
.metric-label { font-size: 12px; color: #64748b; margin-bottom: 4px; }
.metric-value { font-size: 22px; font-weight: 600; color: #1f2937; line-height: 1.2; }

.funnel-meta { font-size: 12px; color: #64748b; margin: 6px 0 10px; }
.funnel-list { display: flex; flex-direction: column; gap: 8px; }
.funnel-row { display: grid; grid-template-columns: 180px 1fr 120px; align-items: center; gap: 12px; }
.funnel-row__label { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #1f2937; }
.funnel-row__index { display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px; border-radius: 50%; background: #6366f1; color: #fff; font-size: 11px; }
.funnel-row__bar { display: flex; align-items: center; gap: 8px; }
.funnel-row__bar-bg { flex: 1; height: 8px; border-radius: 4px; background: #eef2ff; overflow: hidden; }
.funnel-row__bar-fill { height: 100%; background: linear-gradient(90deg, #6366f1, #818cf8); transition: width .3s; }
.funnel-row__pct { font-size: 12px; color: #475569; min-width: 38px; text-align: right; }
.funnel-row__count { font-size: 12px; color: #64748b; }

.dropoff-list { display: flex; flex-direction: column; gap: 6px; margin: 6px 0; }
.dropoff-row { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #475569; padding: 6px 10px; background: #fff; border: 1px solid var(--color-border-2); border-radius: 4px; }
.dropoff-row__from, .dropoff-row__to { font-weight: 500; color: #1f2937; }
.dropoff-row__arrow { color: #94a3b8; }
.dropoff-row__loss { margin-left: auto; color: #ef4444; }
.dropoff-empty { font-size: 12px; color: #94a3b8; padding: 8px; text-align: center; }
</style>
/*
用途：画布交互埋点归因分析面板
说明：实时汇总 tracker 事件与漏斗状态；展示基础指标 + 漏斗 + 流失点；订阅 tracker 实时刷新。
边界：仅画布交互埋点（tracker.events + tracker.funnelState）；不接远程接口。
*/