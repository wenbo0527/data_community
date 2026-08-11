<template>
  <PageContainer>
    <PageHeader title="申请管理" sub-title="全量字段权限申请 · 批量操作 · 续期 · 撤回">
      <template #extra>
        <a-button @click="goBack">返回工作台</a-button>
      </template>
    </PageHeader>

    <a-row :gutter="16" style="margin-bottom: 16px">
      <a-col :span="6"><a-statistic title="总申请" :value="all.length" /></a-col>
      <a-col :span="6"><a-statistic title="待审批" :value="countByStatus.pending" :value-style="{ color: '#f53f3f' }" /></a-col>
      <a-col :span="6"><a-statistic title="已通过" :value="countByStatus.approved" :value-style="{ color: '#00b42a' }" /></a-col>
      <a-col :span="6"><a-statistic title="已拒绝" :value="countByStatus.rejected" :value-style="{ color: '#86909c' }" /></a-col>
    </a-row>

    <a-card :bordered="false">
      <a-row :gutter="12" style="margin-bottom: 12px">
        <a-col :span="6">
          <a-input v-model="keyword" placeholder="搜索申请人 / 字段" allow-clear>
            <template #prefix><icon-search /></template>
          </a-input>
        </a-col>
        <a-col :span="5">
          <a-select v-model="filterStatus" placeholder="状态" allow-clear>
            <a-option v-for="s in statuses" :key="s.value" :value="s.value">{{ s.label }}</a-option>
          </a-select>
        </a-col>
        <a-col :span="5">
          <a-select v-model="filterPurpose" placeholder="用途" allow-clear>
            <a-option v-for="(label, key) in purposeLabels" :key="key" :value="key">{{ label }}</a-option>
          </a-select>
        </a-col>
        <a-col :span="8" style="text-align: right">
          <a-button @click="resetFilter">重置</a-button>
        </a-col>
      </a-row>

      <a-table
        :columns="columns"
        :data="filtered"
        row-key="id"
        :pagination="{ pageSize: 10, showTotal: true }"
        stripe
      >
        <template #status="{ record }">
          <a-tag :color="statusColor(record.status)">{{ statusLabel(record.status) }}</a-tag>
        </template>
        <template #purpose="{ record }">
          <a-tag color="arcoblue">{{ purposeLabel(record.purpose) }}</a-tag>
        </template>
        <template #scope="{ record }">
          <a-tag :color="record.scope === 'write' ? 'red' : 'gray'">{{ scopeLabel(record.scope) }}</a-tag>
        </template>
        <template #actions="{ record }">
          <a-space>
            <a-link @click="openDetail(record)">详情</a-link>
            <template v-if="record.status === 'pending'">
              <a-link status="success" @click="quickApprove(record)">通过</a-link>
              <a-link status="danger" @click="quickReject(record)">拒绝</a-link>
            </template>
            <template v-else-if="record.status === 'approved'">
              <a-link status="warning" @click="onRenew(record)">续期</a-link>
              <a-link status="danger" @click="onExpire(record)">撤销</a-link>
            </template>
          </a-space>
        </template>
      </a-table>
    </a-card>

    <!-- 详情抽屉 -->
    <a-drawer v-model:visible="detailVisible" :title="`申请详情 · ${current?.id}`" :width="720" :footer="false">
      <template v-if="current">
        <a-descriptions :column="2" bordered>
          <a-descriptions-item label="申请编号">{{ current.id }}</a-descriptions-item>
          <a-descriptions-item label="状态">
            <a-tag :color="statusColor(current.status)">{{ statusLabel(current.status) }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="申请人">{{ current.applicant }}</a-descriptions-item>
          <a-descriptions-item label="申请人部门">{{ current.applicantDept }}</a-descriptions-item>
          <a-descriptions-item label="字段路径" :span="2">
            <a-tag color="cyan">{{ current.tablePath }}.{{ current.fieldName }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="字段描述" :span="2">{{ current.fieldDesc || '-' }}</a-descriptions-item>
          <a-descriptions-item label="用途">{{ purposeLabel(current.purpose) }}</a-descriptions-item>
          <a-descriptions-item label="权限">{{ scopeLabel(current.scope) }} · 有效期 {{ current.validMonths }} 月</a-descriptions-item>
          <a-descriptions-item label="理由" :span="2">{{ current.reason }}</a-descriptions-item>
          <a-descriptions-item label="审批人">{{ current.approver || '-' }}</a-descriptions-item>
          <a-descriptions-item label="审批意见">{{ current.approvalComment || '-' }}</a-descriptions-item>
          <a-descriptions-item label="提交时间">{{ current.createdAt }}</a-descriptions-item>
          <a-descriptions-item label="最后更新">{{ current.updatedAt }}</a-descriptions-item>
        </a-descriptions>

        <h3 style="margin-top: 24px">流转历史</h3>
        <a-timeline>
          <a-timeline-item v-for="(h, i) in current.history" :key="i">
            <div>
              <strong>{{ h.action }}</strong>
              <a-tag size="small" style="margin-left: 8px">{{ statusLabel(h.from) }} → {{ statusLabel(h.to) }}</a-tag>
            </div>
            <div style="color: #86909c; font-size: 12px; margin-top: 2px">{{ h.ts }} · {{ h.actor }}</div>
            <div v-if="h.comment" style="margin-top: 4px">意见:{{ h.comment }}</div>
          </a-timeline-item>
        </a-timeline>
      </template>
    </a-drawer>
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
  PERMISSION_STATUSES,
  PERMISSION_STATUS_LABEL,
  PERMISSION_STATUS_COLOR,
  PERMISSION_PURPOSE_LABEL,
  PERMISSION_SCOPE_LABEL,
  type PermissionApply,
  type PermissionStatus,
  type PermissionApply as T
} from '@/mock-shared/permission-store'

const router = useRouter()

const all = ref<PermissionApply[]>([])
function refresh() { all.value = PermissionStore.manageList() }
onMounted(refresh)

const keyword = ref('')
const filterStatus = ref<PermissionStatus | undefined>()
const filterPurpose = ref<string | undefined>()
const statuses = PERMISSION_STATUSES.map(s => ({ value: s, label: PERMISSION_STATUS_LABEL[s] }))
const purposeLabels = PERMISSION_PURPOSE_LABEL

const filtered = computed(() => all.value.filter(p => {
  if (keyword.value && !p.applicant.includes(keyword.value) && !p.fieldName.includes(keyword.value) && !p.tablePath.includes(keyword.value)) return false
  if (filterStatus.value && p.status !== filterStatus.value) return false
  if (filterPurpose.value && p.purpose !== filterPurpose.value) return false
  return true
}))

const countByStatus = computed(() => {
  const m: Record<string, number> = { draft: 0, pending: 0, approved: 0, rejected: 0, expired: 0 }
  all.value.forEach(p => { m[p.status] = (m[p.status] || 0) + 1 })
  return m
})

const columns = [
  { title: '编号', dataIndex: 'id', width: 90 },
  { title: '申请人', dataIndex: 'applicant', width: 90 },
  { title: '字段', dataIndex: 'fieldName', width: 160 },
  { title: '用途', dataIndex: 'purpose', slotName: 'purpose', width: 100 },
  { title: '权限', dataIndex: 'scope', slotName: 'scope', width: 80 },
  { title: '状态', dataIndex: 'status', slotName: 'status', width: 90 },
  { title: '提交时间', dataIndex: 'createdAt', width: 140 },
  { title: '操作', slotName: 'actions', width: 220, fixed: 'right' }
]

function statusColor(s: PermissionStatus) { return PERMISSION_STATUS_COLOR[s] }
function statusLabel(s: PermissionStatus) { return PERMISSION_STATUS_LABEL[s] }
function purposeLabel(p: T['purpose']) { return PERMISSION_PURPOSE_LABEL[p] }
function scopeLabel(s: T['scope']) { return PERMISSION_SCOPE_LABEL[s] }

function resetFilter() { keyword.value = ''; filterStatus.value = undefined; filterPurpose.value = undefined }

const detailVisible = ref(false)
const current = ref<PermissionApply | null>(null)
function openDetail(p: PermissionApply) { current.value = p; detailVisible.value = true }

function quickApprove(p: PermissionApply) { PermissionStore.approve(p.id); refresh(); Message.success(`已通过「${p.id}」`) }
function quickReject(p: PermissionApply) { Modal.confirm({ title: '确认拒绝', content: `确定要拒绝「${p.id}」吗?`, okText: '确认拒绝', cancelText: '取消', onOk: () => { PermissionStore.reject(p.id, '审批拒绝'); refresh(); Message.warning(`已拒绝「${p.id}」`) } }) }
function onRenew(p: PermissionApply) {
  Modal.confirm({ title: '续期', content: `为「${p.id}」续期 12 个月?`, okText: '确认续期', cancelText: '取消', onOk: () => { PermissionStore.approve(p.id, '续期通过'); refresh(); Message.success(`已续期「${p.id}」`) } })
}
function onExpire(p: PermissionApply) {
  Modal.confirm({ title: '撤销权限', content: `撤销「${p.id}」的字段权限?申请人将立即失去访问。`, okText: '确认撤销', cancelText: '取消', onOk: () => { PermissionStore.expire(p.id); refresh(); Message.warning(`已撤销「${p.id}」`) } })
}

const goBack = () => router.push('workbench')
</script>

<style lang="scss" scoped>
/* 2026-08-06 统一:页面背景/高度/最大宽度由 PageContainer 提供 */
</style>