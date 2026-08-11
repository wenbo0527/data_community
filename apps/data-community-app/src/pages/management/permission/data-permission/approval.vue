<template>
  <PageContainer>
    <PageHeader title="我的审批" sub-title="待我审批的字段权限申请 · 一键通过/打回">
      <template #extra>
        <a-button @click="goBack">返回工作台</a-button>
      </template>
    </PageHeader>

    <a-row :gutter="16" style="margin-bottom: 16px">
      <a-col :span="6">
        <a-statistic title="待审批" :value="pendingList.length" :value-style="{ color: '#f53f3f' }" />
      </a-col>
      <a-col :span="6">
        <a-statistic title="本月已审批" :value="approvedThisMonth" :value-style="{ color: '#00b42a' }" />
      </a-col>
      <a-col :span="6">
        <a-statistic title="本月拒绝" :value="rejectedThisMonth" :value-style="{ color: '#86909c' }" />
      </a-col>
      <a-col :span="6">
        <a-statistic title="平均审批耗时" :value="avgHours" suffix="小时" :value-style="{ color: '#165dff' }" />
      </a-col>
    </a-row>

    <a-card :bordered="false">
      <template #title>待我审批 ({{ pendingList.length }})</template>
      <a-empty v-if="pendingList.length === 0" description="当前没有待审批的申请" />
      <a-list v-else>
        <a-list-item v-for="p in pendingList" :key="p.id">
          <a-list-item-meta>
            <template #title>
              <a-space>
                <span><strong>{{ p.applicant }}</strong> ({{ p.applicantDept }}) 申请访问</span>
                <a-tag color="cyan">{{ p.tablePath }}.{{ p.fieldName }}</a-tag>
              </a-space>
            </template>
            <template #description>
              <div>用途:{{ purposeLabel(p.purpose) }} · 权限:{{ scopeLabel(p.scope) }} · 有效期 {{ p.validMonths }} 个月</div>
              <div style="color: #1d2129; margin-top: 4px">理由:{{ p.reason }}</div>
              <div style="color: #86909c; margin-top: 4px">提交于 {{ p.createdAt }}</div>
            </template>
          </a-list-item-meta>
          <a-space>
            <a-button type="primary" status="success" @click="onApprove(p)">
              <template #icon><icon-check /></template>通过
            </a-button>
            <a-button status="danger" @click="onReject(p)">
              <template #icon><icon-close /></template>打回
            </a-button>
          </a-space>
        </a-list-item>
      </a-list>
    </a-card>

    <!-- 审批意见抽屉 -->
    <a-drawer v-model:visible="drawerVisible" :title="`${drawerAction === 'approve' ? '审批通过' : '打回草稿'} · ${currentItem?.id}`" :width="500" :footer="false">
      <a-form layout="vertical">
        <a-form-item :label="drawerAction === 'approve' ? '审批意见(可选)' : '打回理由(必填)'">
          <a-textarea v-model="comment" :rows="4" :placeholder="drawerAction === 'approve' ? '可备注使用规范' : '说明打回原因,以便申请人修改'" />
        </a-form-item>
        <a-space style="justify-content: flex-end; display: flex">
          <a-button @click="drawerVisible = false">取消</a-button>
          <a-button type="primary" :status="drawerAction === 'approve' ? 'success' : 'danger'" @click="confirmAction">确认{{ drawerAction === 'approve' ? '通过' : '打回' }}</a-button>
        </a-space>
      </a-form>
    </a-drawer>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import PageContainer from '@/components-dca/common/PageContainer.vue'
import PageHeader from '@/components-dca/common/PageHeader.vue'
import {
  PermissionStore,
  PERMISSION_PURPOSE_LABEL,
  PERMISSION_SCOPE_LABEL,
  type PermissionApply,
  type PermissionApply as T
} from '@/mock-shared/permission-store'

const router = useRouter()

const pendingList = ref<PermissionApply[]>([])
function refresh() { pendingList.value = PermissionStore.pendingForApprover() }
onMounted(refresh)

const approvedThisMonth = computed(() => {
  const ym = new Date().toISOString().slice(0, 7)
  return PermissionStore.getAll().filter(p => p.status === 'approved' && (p.approvedAt || '').startsWith(ym)).length
})
const rejectedThisMonth = computed(() => {
  const ym = new Date().toISOString().slice(0, 7)
  return PermissionStore.getAll().filter(p => p.status === 'rejected' && p.updatedAt.startsWith(ym)).length
})
const avgHours = computed(() => 4) // mock

function purposeLabel(p: T['purpose']) { return PERMISSION_PURPOSE_LABEL[p] }
function scopeLabel(s: T['scope']) { return PERMISSION_SCOPE_LABEL[s] }

// 抽屉
const drawerVisible = ref(false)
const drawerAction = ref<'approve' | 'reject'>('approve')
const currentItem = ref<PermissionApply | null>(null)
const comment = ref('')

function onApprove(p: PermissionApply) { currentItem.value = p; drawerAction.value = 'approve'; comment.value = ''; drawerVisible.value = true }
function onReject(p: PermissionApply) { currentItem.value = p; drawerAction.value = 'reject'; comment.value = ''; drawerVisible.value = true }

function confirmAction() {
  if (!currentItem.value) return
  if (drawerAction.value === 'reject' && !comment.value.trim()) { Message.error('请填写打回理由'); return }
  if (drawerAction.value === 'approve') {
    PermissionStore.approve(currentItem.value.id, comment.value)
    Message.success(`已通过「${currentItem.value.id}」`)
  } else {
    PermissionStore.reject(currentItem.value.id, comment.value)
    Message.warning(`已打回「${currentItem.value.id}」`)
  }
  drawerVisible.value = false
  refresh()
}

const goBack = () => router.push('workbench')
</script>

<style lang="scss" scoped>
/* 2026-08-06 统一:页面背景/高度/最大宽度由 PageContainer 提供 */
</style>