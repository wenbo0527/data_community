/**
 * midloan 状态机 composable · 文档 §三 模块 J
 * 阶段 S3-1 · 11 状态机业务逻辑封装
 *
 * 职责：
 * - 状态切换（封装 stateEngine.handleAction）
 * - 角色过滤的操作按钮
 * - 状态变更自动记录（由 stateEngine 内部实现）
 * - 自动重试（5秒×3次，由 stateEngine.scheduleAutoRetry 实现）
 */
import { computed, ref } from 'vue'
import * as MidloanStateEngine from '@/modules/variable-hub/mock/risk-feature/stateEngine'
import { allowedActionsByStatus } from '@/modules/variable-hub/constants/midloanStatusMap'
import { useRolePermissions } from './useRolePermissions'

export function useMidloanState(variableId, currentStatus) {
  // 当前角色（响应式）
  const { role } = useRolePermissions()

  // 提交中状态（防止重复提交）
  const submitting = ref(false)

  /**
   * 执行状态切换操作
   * 自动走抽屉（submit_dev_oa/submit_verify/request_offline/verify_reject）
   * 其他走 stateEngine 直接切换
   */
  async function executeAction(actionKey: string, payload) {
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
    const allActions = allowedActionsByStatus(status) || []

    // 角色过滤
    if (role.value === 'community_admin') return []

    if (role.value === 'risk_data_member') {
      // 风险数据成员：允许大部分操作，但隐藏 retry_dw + manual_batch_retry
      return allActions.filter(a =>
        a.key !== 'retry_dw' && a.key !== 'manual_batch_retry'
      )
    }

    // 风险数据管理员：全部操作
    return allActions
  })

  /**
   * 是否需要抽屉（4 个特殊动作）
   */
  const NEEDS_DRAWER = ['submit_dev_oa', 'submit_verify', 'request_offline', 'verify_reject']
  function needsDrawer(actionKey) {
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