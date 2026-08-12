/**
 * midloan 状态机 composable · 文档 §三 模块 J
 * 阶段 S3-1 · 11 状态机业务逻辑封装
 * 2026-08-10 新增需求提出（A0）和业务验收（D3/D4）节点
 *
 * 职责：
 * - 状态切换（封装 stateEngine.handleAction）
 * - 角色过滤的操作按钮
 * - 状态变更自动记录（由 stateEngine 内部实现）
 * - 自动重试（5秒×3次，由 stateEngine.scheduleAutoRetry 实现）
 */
import { computed, ref, type Ref } from 'vue'
import MidloanStateEngine from '@/modules/variable-hub/mock/risk-feature/stateEngine'
import { allowedActionsByStatus } from '@/modules/variable-hub/constants/midloanStatusMap'
import { useRolePermissions } from './useRolePermissions'

export function useMidloanState(variableId: Ref<string>, currentStatus: Ref<string>) {
  // 当前角色（响应式）
  const { role } = useRolePermissions()

  // 提交中状态（防止重复提交）
  const submitting = ref(false)

  /**
   * 执行状态切换操作
   * 自动走抽屉（submit_dev_oa/business_verify_pass/admin_confirm_pass/submit_production_order）
   * 其他走 stateEngine 直接切换
   */
  async function executeAction(actionKey: string, payload?: any) {
    if (!variableId.value) {
      return { ok: false, reason: '特征ID为空' }
    }
    submitting.value = true
    try {
      return MidloanStateEngine.handleAction(variableId.value, actionKey, payload)
    } finally {
      submitting.value = false
    }
  }

  /**
   * 当前状态 + 当前角色下，可以执行的操作列表
   * 通过 LifecycleTab → "动态操作" 显示
   */
  const allowedActions = computed(() => {
    const status = currentStatus.value || 'registered'
    const allActions = allowedActionsByStatus(status, undefined, role.value) || []

    // 角色过滤
    if (role.value === 'community_admin') return []

    if (role.value === 'risk_data_member') {
      // 风险数据成员：允许大部分操作，但隐藏 retry_dw + manual_batch_retry + submit_requirement（仅管理员可审核需求）
      return allActions.filter(a =>
        a.key !== 'retry_dw' &&
        a.key !== 'manual_batch_retry' &&
        a.key !== 'submit_requirement'
      )
    }

    // 风险数据管理员：全部操作
    return allActions
  })

  /**
   * 是否需要抽屉（6 个特殊动作）
   */
  const NEEDS_DRAWER = ['submit_requirement', 'submit_dev_oa', 'business_verify_pass', 'admin_confirm_pass', 'submit_production_order', 'request_offline']
  function needsDrawer(actionKey: string) {
    return NEEDS_DRAWER.includes(actionKey)
  }

  /**
   * 重置当前特征到 registered 状态（演示用）
   */
  function resetFeature() {
    if (!variableId.value) return { ok: false }
    return MidloanStateEngine.resetFeature(variableId.value)
  }

  return {
    submitting,
    executeAction,
    allowedActions,
    needsDrawer,
    resetFeature
  }
}