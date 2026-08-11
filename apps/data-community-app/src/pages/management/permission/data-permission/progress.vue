<template>
  <PageContainer>
    <PageHeader title="我的进度" sub-title="我提交的字段权限申请 · 实时进度 · 流转历史">
      <template #extra>
        <a-button type="primary" @click="goApply">
          <template #icon><icon-plus /></template>
          新申请
        </a-button>
        <a-button style="margin-left: 8px" @click="goBack">返回工作台</a-button>
      </template>
    </PageHeader>

    <a-row :gutter="16" style="margin-bottom: 16px">
      <a-col :span="6"><a-statistic title="总提交" :value="progressList.length" /></a-col>
      <a-col :span="6"><a-statistic title="待审批" :value="countByStatus.pending" :value-style="{ color: '#f53f3f' }" /></a-col>
      <a-col :span="6"><a-statistic title="已通过" :value="countByStatus.approved" :value-style="{ color: '#00b42a' }" /></a-col>
      <a-col :span="6"><a-statistic title="已拒绝" :value="countByStatus.rejected" :value-style="{ color: '#86909c' }" /></a-col>
    </a-row>

    <a-empty v-if="progressList.length === 0" description="还没有提交过申请">
      <a-button type="primary" @click="goApply">立即申请</a-button>
    </a-empty>

    <a-row v-else :gutter="16">
      <a-col v-for="p in progressList" :key="p.id" :span="12">
        <a-card :bordered="false" class="progress-card">
          <template #title>
            <a-space>
              <span>{{ p.id }}</span>
              <a-tag :color="statusColor(p.status)">{{ statusLabel(p.status) }}</a-tag>
            </a-space>
          </template>
          <template #extra>
            <a-space>
              <a-link v-if="p.status === 'draft' || p.status === 'pending'" status="warning" @click="onWithdraw(p)">撤回</a-link>
            </a-space>
          </template>

          <div class="progress-summary">
            <div><strong>{{ p.applicant }}</strong> 申请访问 <a-tag color="cyan">{{ p.tablePath }}.{{ p.fieldName }}</a-tag></div>
            <div style="color: #86909c; margin-top: 4px">用途:{{ purposeLabel(p.purpose) }} · {{ scopeLabel(p.scope) }} · {{ p.validMonths }} 个月 · 提交于 {{ p.createdAt }}</div>
          </div>

          <!-- 进度条(按状态机进度) -->
          <a-steps :current="stepIndex(p.status)" size="small" class="progress-steps">
            <a-step title="草稿" />
            <a-step title="待审批" />
            <a-step title="已通过" />
            <a-step title="已过期" />
          </a-steps>

          <a-divider style="margin: 12px 0" />

          <div class="history-list">
            <div v-for="(h, i) in p.history" :key="i" class="history-item">
              <span class="dot"></span>
              <div>
                <div>{{ h.action }}<a-tag size="small" style="margin-left: 6px">{{ statusLabel(h.from) }} → {{ statusLabel(h.to) }}</a-tag></div>
                <div style="color: #86909c; font-size: 12px">{{ h.ts }} · {{ h.actor }}</div>
                <div v-if="h.comment" style="color: #1d2129; margin-top: 2px">意见:{{ h.comment }}</div>
              </div>
            </div>
          </div>

          <div v-if="p.approvalComment" class="approval-comment">
            <strong>审批意见:</strong> {{ p.approvalComment }}
          </div>
        </a-card>
      </a-col>
    </a-row>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Message, Modal } from '@arco-design/web-vue'
import PageContainer from '@/components-dca/common/PageContainer.vue'
import PageHeader from '@/components-dca/common/PageHeader.vue'
import {
  PermissionStore,
  PERMISSION_STATUS_COLOR,
  PERMISSION_STATUS_LABEL,
  PERMISSION_PURPOSE_LABEL,
  PERMISSION_SCOPE_LABEL,
  type PermissionApply,
  type PermissionStatus,
  type PermissionApply as T
} from '@/mock-shared/permission-store'

const router = useRouter()

const progressList = ref<PermissionApply[]>([])
function refresh() { progressList.value = PermissionStore.progress() }
onMounted(refresh)

const countByStatus = computed(() => {
  const m: Record<string, number> = { draft: 0, pending: 0, approved: 0, rejected: 0, expired: 0 }
  progressList.value.forEach(p => { m[p.status] = (m[p.status] || 0) + 1 })
  return m
})

function stepIndex(s: PermissionStatus) {
  const map: Record<PermissionStatus, number> = { draft: 0, pending: 1, approved: 2, rejected: 2, expired: 3 }
  return map[s]
}
function statusColor(s: PermissionStatus) { return PERMISSION_STATUS_COLOR[s] }
function statusLabel(s: PermissionStatus) { return PERMISSION_STATUS_LABEL[s] }
function purposeLabel(p: T['purpose']) { return PERMISSION_PURPOSE_LABEL[p] }
function scopeLabel(s: T['scope']) { return PERMISSION_SCOPE_LABEL[s] }

function onWithdraw(p: PermissionApply) {
  Modal.confirm({ title: '撤回申请', content: `确定要撤回「${p.id}」吗?`, okText: '确认撤回', cancelText: '取消', onOk: () => { PermissionStore.withdraw(p.id); refresh(); Message.warning(`已撤回「${p.id}」`) } })
}

function goApply() { router.push('management/permission/data-permission/apply') }
const goBack = () => router.push('workbench')
</script>

<style lang="scss" scoped>
/* 2026-08-06 统一:页面背景/高度/最大宽度由 PageContainer 提供 */
.progress-card { margin-bottom: 16px; }
.progress-summary { font-size: 13px; line-height: 1.8; }
.progress-steps { margin-top: 12px; }
.history-list {
  max-height: 200px;
  overflow-y: auto;
  font-size: 13px;
  .history-item {
    display: flex;
    align-items: flex-start;
    margin: 6px 0;
    .dot {
      width: 8px;
      height: 8px;
      background: var(--dca-brand-primary);
      border-radius: 50%;
      margin: 6px 8px 0 0;
      flex-shrink: 0;
    }
  }
}
.approval-comment {
  background: var(--dca-bg-page-alt);
  padding: 8px 12px;
  border-radius: var(--dca-radius-md);
  margin-top: 12px;
  font-size: 13px;
  color: var(--dca-text-primary);
}
</style>