<template>
  <div class="alert-config-page">
    <a-card>
      <template #title>
        <a-space>
          <span>库存预警配置</span>
          <a-tag color="arcoblue">完整版 v1.2</a-tag>
        </a-space>
      </template>

      <template #extra>
        <a-button type="primary" @click="handleCreate">
          <template #icon><icon-plus /></template>
          新建预警
        </a-button>
      </template>

      <!-- 存量保护说明（arch §5.1.3）-->
      <LegacyProtectionNotice style="margin-bottom: 16px" />

      <!-- 规则列表 -->
      <AlertRuleList
        :rules="rules"
        :loading="loading"
        @edit="handleEdit"
        @delete="handleDelete"
        @toggle="handleToggle"
        @view-audit="handleViewAudit"
      />
    </a-card>

    <!-- 新建/编辑对话框（arch §3.2 AlertConfigForm）-->
    <AlertConfigForm
      v-model:visible="formVisible"
      :mode="formMode"
      :rule="editingRule"
      @submit="handleFormSubmit"
    />

    <!-- 审计日志抽屉（arch §3.2 AlertRuleAuditDrawer）-->
    <AlertRuleAuditDrawer
      v-model:visible="auditVisible"
      :rule-id="auditRuleId"
      :audit-logs="auditLogs"
    />
  </div>
</template>

<script setup lang="ts">
/**
 * 库存预警配置页 - 主页
 * TASK-20260603-B2A5D2BB (S403)
 * arch: /Users/wenbo/.openclaw/workspace-agents/data_community_pm/tmp/arch-S402-alert-config-design.md
 */
import { ref, onMounted } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import { IconPlus } from '@arco-design/web-vue/es/icon'
import type { InventoryAlertRule } from '@/types/api/coupon'

import AlertRuleList from './components/AlertRuleList.vue'
import AlertConfigForm from './components/AlertConfigForm.vue'
import AlertRuleAuditDrawer from './components/AlertRuleAuditDrawer.vue'
import LegacyProtectionNotice from './components/LegacyProtectionNotice.vue'
import { useAlertRules } from './composables/useAlertRules'

const {
  rules,
  auditLogs,
  loading,
  loadAll,
  createRule,
  updateRule,
  toggleRule,
  deleteRule,
} = useAlertRules()

// 表单状态
const formVisible = ref(false)
const formMode = ref<'create' | 'edit'>('create')
const editingRule = ref<InventoryAlertRule | null>(null)

// 审计抽屉状态
const auditVisible = ref(false)
const auditRuleId = ref<string>('')

// ==================== 生命周期 ====================
onMounted(async () => {
  await loadAll()
})

// ==================== 事件处理 ====================
function handleCreate() {
  formMode.value = 'create'
  editingRule.value = null
  formVisible.value = true
}

function handleEdit(rule: InventoryAlertRule) {
  formMode.value = 'edit'
  editingRule.value = rule
  formVisible.value = true
}

async function handleFormSubmit(data: Partial<InventoryAlertRule>) {
  if (formMode.value === 'create') {
    await createRule(data)
  } else if (editingRule.value) {
    await updateRule(editingRule.value.id, data)
  }
  formVisible.value = false
  editingRule.value = null
}

async function handleToggle(rule: InventoryAlertRule, enabled: boolean) {
  await toggleRule(rule.id, enabled)
}

async function handleDelete(rule: InventoryAlertRule) {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除「${rule.product_name}」的预警规则吗？删除后该规则将停用并记录到审计日志。`,
    okText: '确认删除',
    cancelText: '取消',
    onOk: async () => {
      await deleteRule(rule.id)
    },
  })
}

function handleViewAudit(rule: InventoryAlertRule) {
  auditRuleId.value = rule.id
  auditVisible.value = true
}
</script>

<style scoped>
.alert-config-page {
  padding: 16px;
}
</style>
