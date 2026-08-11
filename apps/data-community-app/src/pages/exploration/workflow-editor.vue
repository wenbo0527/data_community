<template>
  <PageContainer>
    <PageHeader
      :title="workflow ? `工作流编辑 · ${workflow.name}` : '工作流编辑'"
      sub-title="节点编排、调度配置、运行历史"
    >
      <template #extra>
        <a-button @click="goBack"><template #icon><icon-left /></template>返回列表</a-button>
        <a-button type="outline" status="success" style="margin-left: 8px" @click="onRun" :disabled="!workflow">
          <template #icon><icon-play-circle /></template>试运行
        </a-button>
        <a-button type="primary" status="warning" style="margin-left: 8px" @click="onSave" :disabled="!workflow">
          <template #icon><icon-save /></template>保存草稿
        </a-button>
        <a-button type="primary" style="margin-left: 8px" @click="onPublish" :disabled="!workflow || workflow.status === 'running'">
          <template #icon><icon-send /></template>{{ workflow?.status === 'published' ? '已发布' : '发布上线' }}
        </a-button>
      </template>
    </PageHeader>

    <a-empty v-if="!workflow" description="未找到该工作流">
      <a-button type="primary" @click="goBack">返回列表</a-button>
    </a-empty>

    <a-row v-else :gutter="16">
      <!-- 左侧:基础信息 + 节点列表 -->
      <a-col :span="14">
        <a-card title="基础信息" :bordered="false">
          <a-descriptions :column="2" size="medium">
            <a-descriptions-item label="ID">{{ workflow.id }}</a-descriptions-item>
            <a-descriptions-item label="Owner">{{ workflow.owner }}</a-descriptions-item>
            <a-descriptions-item label="名称" :span="2">{{ workflow.name }}</a-descriptions-item>
            <a-descriptions-item label="描述" :span="2">{{ workflow.description }}</a-descriptions-item>
            <a-descriptions-item label="状态">
              <a-tag :color="statusColor(workflow.status)">{{ statusLabel(workflow.status) }}</a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="最近运行">{{ workflow.lastRunAt || '尚未运行' }}</a-descriptions-item>
          </a-descriptions>
        </a-card>

        <a-card title="节点编排(共 {{ nodes.length }} 个节点)" :bordered="false" style="margin-top: 16px">
          <a-timeline>
            <a-timeline-item v-for="(n, i) in nodes" :key="n.code">
              <template #dot>
                <a-avatar :size="28" :style="{ background: nodeColor(n.type) }">{{ nodeIcon(n.type) }}</a-avatar>
              </template>
              <div class="node-row">
                <div>
                  <strong>{{ n.name }}</strong>
                  <a-tag size="small" style="margin-left: 8px">{{ n.typeLabel }}</a-tag>
                </div>
                <div class="node-meta">{{ n.code }} · {{ n.owner }} · 预计耗时 {{ n.etaMinutes }} 分钟</div>
                <div class="node-desc">{{ n.description }}</div>
              </div>
            </a-timeline-item>
          </a-timeline>
        </a-card>
      </a-col>

      <!-- 右侧:调度 + 运行历史 + 操作日志 -->
      <a-col :span="10">
        <a-card title="调度配置" :bordered="false">
          <a-form :model="schedule" layout="vertical">
            <a-form-item label="调度类型">
              <a-radio-group v-model="schedule.type">
                <a-radio value="cron">Cron 表达式</a-radio>
                <a-radio value="interval">周期</a-radio>
                <a-radio value="manual">手动</a-radio>
              </a-radio-group>
            </a-form-item>
            <a-form-item v-if="schedule.type === 'cron'" label="Cron 表达式">
              <a-input v-model="schedule.cron" placeholder="0 2 * * *" allow-clear />
              <div class="form-tip">示例: <code>0 2 * * *</code> 每天凌晨 2 点</div>
            </a-form-item>
            <a-form-item v-if="schedule.type === 'interval'" label="执行周期(分钟)">
              <a-input-number v-model="schedule.intervalMin" :min="1" :max="1440" />
            </a-form-item>
            <a-form-item label="失败重试次数">
              <a-input-number v-model="schedule.retryCount" :min="0" :max="5" />
            </a-form-item>
            <a-form-item label="失败告警">
              <a-switch v-model="schedule.alertOnFailure" />
              <span class="form-tip">失败时发送告警通知</span>
            </a-form-item>
          </a-form>
        </a-card>

        <a-card title="运行历史" :bordered="false" style="margin-top: 16px">
          <a-list size="small">
            <a-list-item v-for="(r, i) in runHistory" :key="i">
              <a-list-item-meta>
                <template #avatar>
                  <a-tag :color="runColor(r.status)">{{ runShort(r.status) }}</a-tag>
                </template>
                <template #title>{{ r.runAt }} · 耗时 {{ r.duration }}</template>
                <template #description>{{ r.summary }}</template>
              </a-list-item-meta>
            </a-list-item>
          </a-list>
        </a-card>

        <a-card title="操作日志" :bordered="false" style="margin-top: 16px">
          <a-timeline>
            <a-timeline-item v-for="(l, i) in logs" :key="i">
              <div><span class="log-time">{{ l.time }}</span> · {{ l.actor }}</div>
              <div class="log-action">{{ l.action }}</div>
            </a-timeline-item>
          </a-timeline>
        </a-card>
      </a-col>
    </a-row>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import PageContainer from '@/components-dca/common/PageContainer.vue'
import PageHeader from '@/components-dca/common/PageHeader.vue'

const route = useRoute()
const router = useRouter()

const workflowId = computed(() => String(route.params.id || ''))

// 内置工作流注册表(与列表页 onMounted 里的 mock 对齐)
const workflowRegistry: Record<string, any> = {
  W001: { id: 'W001', name: '日活计算工作流', status: 'running', nodes: 8, owner: '王运营', lastRunAt: '今天 02:00', description: '从登录日志聚合计算 DAU/MAU 等指标' },
  W002: { id: 'W002', name: '风险评分计算', status: 'running', nodes: 12, owner: '张风控', lastRunAt: '今天 03:00', description: '基于 XGBoost 模型计算用户风险评分' },
  W003: { id: 'W003', name: '客户标签刷新', status: 'running', nodes: 25, owner: '王运营', lastRunAt: '今天 01:00', description: '刷新 156 个标签' },
  W004: { id: 'W004', name: '逾期监控工作流', status: 'running', nodes: 6, owner: '张风控', lastRunAt: '实时', description: '实时监控逾期事件并触发预警' },
  W005: { id: 'W005', name: '客群圈选 - 高价值理财', status: 'stopped', nodes: 4, owner: '陈营销', lastRunAt: '昨天 14:30', description: '基于 AUM 和活跃度量选' },
  W006: { id: 'W006', name: '数据资产血缘采集', status: 'running', nodes: 10, owner: '李产品', lastRunAt: '每天 00:30', description: '采集所有表的字段血缘' }
}

const workflow = computed(() => workflowRegistry[workflowId.value])

// 节点 mock:按工作流 id 生成不同编排
function buildNodes(wfId: string) {
  if (!wfId) return []
  const seedNum = wfId.replace(/\D/g, '').length || 1
  const templates = [
    { type: 'source', typeLabel: '数据源', icon: 'S', color: '#165dff' },
    { type: 'transform', typeLabel: '转换', icon: 'T', color: '#722ed1' },
    { type: 'compute', typeLabel: '计算', icon: 'C', color: '#0fc6c2' },
    { type: 'filter', typeLabel: '过滤', icon: 'F', color: '#ff7d00' },
    { type: 'sink', typeLabel: '输出', icon: 'K', color: '#00b42a' }
  ]
  const baseNodes = [
    { code: 'N01', name: '读取 ODS 登录日志', type: 'source', typeLabel: '数据源', icon: 'S', color: '#165dff', owner: '王运营', etaMinutes: 2, description: '从 Hive ods_user_login 读取近 1 天增量' },
    { code: 'N02', name: '清洗 + 去重', type: 'transform', typeLabel: '转换', icon: 'T', color: '#722ed1', owner: '王运营', etaMinutes: 3, description: '去除空值 / 重复 user_id' },
    { code: 'N03', name: '聚合计算 DAU/MAU', type: 'compute', typeLabel: '计算', icon: 'C', color: '#0fc6c2', owner: '王运营', etaMinutes: 5, description: '按维度分组聚合' },
    { code: 'N04', name: '过滤有效用户', type: 'filter', typeLabel: '过滤', icon: 'F', color: '#ff7d00', owner: '王运营', etaMinutes: 1, description: '剔除测试账号 / 黑名单用户' },
    { code: 'N05', name: '写入指标库', type: 'sink', typeLabel: '输出', icon: 'K', color: '#00b42a', owner: '王运营', etaMinutes: 2, description: '写入 dws_user_metric' }
  ]
  // 不同工作流展示不同的节点数
  const count = Math.min(seedNum + 4, 8)
  return baseNodes.slice(0, count)
}

const nodes = computed(() => buildNodes(workflowId.value))

// 调度配置(可编辑)
const schedule = ref({
  type: 'cron' as 'cron' | 'interval' | 'manual',
  cron: '0 2 * * *',
  intervalMin: 60,
  retryCount: 2,
  alertOnFailure: true
})

// 运行历史 mock
const runHistory = ref([
  { runAt: '今天 02:00', duration: '12 分 30 秒', status: 'success', summary: '8 节点全部成功,处理 1.2 亿条数据' },
  { runAt: '昨天 02:00', duration: '13 分 05 秒', status: 'success', summary: '8 节点全部成功' },
  { runAt: '前天 02:00', duration: '12 分 50 秒', status: 'success', summary: '8 节点全部成功' },
  { runAt: '3 天前 02:00', duration: '失败 - 已重试', status: 'failed', summary: 'N03 节点超时,已重试 2 次后放弃' }
])

// 操作日志 mock
const logs = ref([
  { time: '今天 02:15', actor: 'system', action: '工作流运行成功' },
  { time: '今天 09:30', actor: '王运营', action: '修改调度 cron 表达式' },
  { time: '昨天 18:00', actor: '王运营', action: '新增节点 N04' },
  { time: '3 天前 02:18', actor: 'system', action: '工作流运行失败(N03 超时)' }
])

function statusColor(s: string) {
  return { running: 'green', stopped: 'gray', failed: 'red', draft: 'orange', published: 'arcoblue' }[s] || 'gray'
}
function statusLabel(s: string) {
  return { running: '运行中', stopped: '已停止', failed: '失败', draft: '草稿', published: '已发布' }[s] || s
}
function nodeColor(t: string) {
  return ({ source: '#165dff', transform: '#722ed1', compute: '#0fc6c2', filter: '#ff7d00', sink: '#00b42a' } as any)[t] || '#86909c'
}
function nodeIcon(t: string) {
  return ({ source: 'S', transform: 'T', compute: 'C', filter: 'F', sink: 'K' } as any)[t] || '?'
}
function runColor(s: string) {
  return { success: 'green', failed: 'red', running: 'arcoblue' }[s] || 'gray'
}
function runShort(s: string) {
  return { success: '成功', failed: '失败', running: '运行中' }[s] || s
}

function goBack() {
  router.push('exploration/workflows')
}

function onRun() {
  Message.success(`工作流「${workflow.value?.name}」已提交试运行`)
}
function onSave() {
  Message.success('已保存草稿')
}
function onPublish() {
  if (!workflow.value) return
  workflow.value.status = 'published'
  Message.success('已发布上线')
}

onMounted(() => {
  if (!workflow.value) {
    Message.warning(`未找到工作流 ${workflowId.value}`)
  }
})
</script>

<style lang="scss" scoped>
/* 2026-08-06 统一:页面背景/高度/最大宽度由 PageContainer 提供 */
.workflow-editor-page {
  padding: 0 24px;

  .node-row {
    .node-meta { color: var(--dca-text-tertiary); font-size: 12px; margin: 4px 0; }
    .node-desc { color: var(--dca-text-secondary); font-size: 13px; }
  }

  .form-tip {
    color: #86909c;
    font-size: 12px;
    margin-top: 4px;
    code {
      background: #f2f3f5;
      padding: 1px 6px;
      border-radius: 2px;
      font-family: monospace;
    }
  }

  .log-time { color: #86909c; font-size: 12px; }
  .log-action { color: #1d2129; font-size: 13px; }
}
</style>