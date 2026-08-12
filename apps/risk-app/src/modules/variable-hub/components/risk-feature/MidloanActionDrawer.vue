<!--
  通用 midloan 状态切换抽屉 · 文档 v2.1 C1 / E0 / E1 / F0 / K1
  - 审核通过+注册（A0）：标准化附件 switch + 审核说明
  - 提开发OA单（C1）：预览特征信息 + 填写 OA 单号 + 说明（接收方=数仓团队，展示但不可改）
  - 业务验证通过（E0·台账内操作）：预览特征信息 + 验证说明（不走OA单）
  - 管理员确认通过（E1·台账内操作）：预览特征信息 + 确认说明（不走OA单）
  - 提投产单（F0）：预览特征信息 + OA投产单号自动生成 + 参数准备提示 + 备注
-->
<template>
  <a-drawer
    :visible="visible"
    :width="540"
    :title="config.title"
    :ok-loading="submitting"
    @cancel="handleCancel"
    @ok="handleSubmit"
  >
    <a-alert v-if="config.alert" :type="config.alertType || 'info'" :show-icon="false" style="margin-bottom: 12px">
      {{ config.alert }}
    </a-alert>

    <!-- 特征信息预览 -->
    <a-card
      v-if="showPreview"
      title="特征信息预览"
      size="small"
      style="margin-bottom: 12px"
    >
      <a-descriptions
        :column="1"
        :data="previewItems"
        :label-style="{ width: '120px', color: 'var(--color-text-2)' }"
        bordered
      />
    </a-card>

    <a-form :model="form" layout="vertical" :disabled="submitting">
      <!-- 需求审核注册（A0：管理员审核通过后进入注册）-->
      <template v-if="actionKey === 'submit_requirement'">
        <a-alert type="info" :show-icon="false" style="margin-bottom: 12px">
          <p style="margin: 0; font-size: 13px;">
            审核通过后将自动完成：重复备案校验 + 参数映射 + 进入「已注册」状态。流程不做回退。
          </p>
        </a-alert>
        <a-form-item label="标准化附件">
          <a-switch v-model="form.standardizedAttachment" />
          <template #extra>
            <span style="color: var(--color-text-3); font-size: 12px;">确认已补充标准化需求附件</span>
          </template>
        </a-form-item>
        <a-form-item label="审核说明（可选）">
          <a-textarea v-model="form.remark" :rows="3" placeholder="补充审核说明" />
        </a-form-item>
      </template>

      <!-- 提开发 OA 单（C1 R02：接收方=数仓团队，展示但不可改）-->
      <template v-if="actionKey === 'submit_dev_oa'">
        <a-form-item label="接收方">
          <a-input :model-value="'数仓团队（dw_team）'" disabled />
        </a-form-item>
        <a-form-item label="业务背景">
          <a-input :model-value="'贷中行为特征上线'" disabled />
        </a-form-item>
        <a-form-item label="OA 开发单号">
          <a-input :model-value="form.generatedOaOrderId || '提交后由 OA 系统自动生成'" disabled />
          <template #extra>
            <span style="color: var(--color-text-3); font-size: 12px;">
              <icon-info-circle /> OA 单号由 OA 系统提交后返回，无需人工填写
            </span>
          </template>
        </a-form-item>
        <a-form-item label="说明（可选）">
          <a-textarea v-model="form.remark" :rows="3" placeholder="补充说明本次提单的需求点" />
        </a-form-item>
      </template>

      <!-- 业务验证通过（E0·台账内操作，不走OA单）-->
      <template v-else-if="actionKey === 'business_verify_pass'">
        <a-alert type="success" :show-icon="false" style="margin-bottom: 12px">
          <p style="margin: 0; font-size: 13px;">
            确认后特征状态将变更为「业务已验证」，等待管理员确认（台账内操作，不走OA单）。
          </p>
        </a-alert>
        <a-form-item label="验证说明（可选）">
          <a-textarea v-model="form.remark" :rows="3" placeholder="可填写验证结论/验证点说明" />
        </a-form-item>
      </template>

      <!-- 管理员确认通过（E1·台账内操作，不走OA单）-->
      <template v-else-if="actionKey === 'admin_confirm_pass'">
        <a-alert type="success" :show-icon="false" style="margin-bottom: 12px">
          <p style="margin: 0; font-size: 13px;">
            确认后特征状态将变更为「管理员已确认」，可提投产单上线（台账内操作，不走OA单）。
          </p>
        </a-alert>
        <a-form-item label="确认说明（可选）">
          <a-textarea v-model="form.remark" :rows="3" placeholder="可填写确认意见/注意事项" />
        </a-form-item>
      </template>

      <!-- 提投产单（F0：OA审批通过→参数准备→内数注册中）-->
      <template v-else-if="actionKey === 'submit_production_order'">
        <a-alert type="warning" :show-icon="false" style="margin-bottom: 12px">
          <p style="margin: 0 0 4px 0; font-weight: 500;">上线确认</p>
          <p style="margin: 0; font-size: 13px;">
            提产后将依次完成：OA投产单审批 → 系统自动参数映射+有效性验证 → 内数API注册（INT-01）→ 变量中心注册（INT-03）。
            请确认数据底表/接口字段已准备就绪。
          </p>
        </a-alert>
        <a-form-item label="OA 投产单号">
          <a-input :model-value="form.generatedOaOrderId || '提交后由 OA 系统自动生成'" disabled />
          <template #extra>
            <span style="color: var(--color-text-3); font-size: 12px;">
              <icon-info-circle /> OA 投产单号由 OA 系统提交后返回，无需人工填写
            </span>
          </template>
        </a-form-item>
        <a-form-item label="备注（可选）">
          <a-textarea v-model="form.remark" :rows="3" placeholder="可填写上线批次/灰度策略等说明" />
        </a-form-item>
      </template>

      <!-- 申请下线（文档 K1：下线是被动接收；这里保留抽屉但仅做演示触发）-->
      <template v-else-if="actionKey === 'request_offline'">
        <a-form-item label="下线原因" required>
          <a-radio-group v-model="form.reason">
            <a-radio value="业务下线">业务下线</a-radio>
            <a-radio value="被新特征替代">被新特征替代</a-radio>
            <a-radio value="数据源下线">数据源下线</a-radio>
            <a-radio value="效果衰减">效果衰减</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="下线日期" required>
          <a-date-picker v-model="form.offlineDate" style="width: 100%" />
        </a-form-item>
        <a-form-item label="影响说明（可选）">
          <a-textarea v-model="form.remark" :rows="3" placeholder="说明对哪些模型/指标/报表有影响" />
        </a-form-item>
      </template>
    </a-form>
  </a-drawer>
</template>

<script setup lang="ts">
import { reactive, ref, watch, computed } from 'vue'
import { Message } from '@arco-design/web-vue'

interface Props {
  visible: boolean
  actionKey: 'submit_requirement' | 'submit_dev_oa' | 'business_verify_pass' | 'admin_confirm_pass' | 'submit_production_order' | 'request_offline'
  /** 当前变量数据（用于预览）*/
  variableData?: any
}

interface Emits {
  (e: 'update:visible', val: boolean): void
  (e: 'submit', payload: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const submitting = ref(false)
const form = reactive<any>({
  oaOrderId: '',
  acceptor: '',
  verifyOaOrderId: '',
  reason: '',
  offlineDate: '',
  remark: '',
  generatedOaOrderId: '',
  standardizedAttachment: true
})

/** 哪些 action 需要预览特征信息 */
const showPreview = computed(() => {
  return ['submit_dev_oa', 'business_verify_pass', 'admin_confirm_pass', 'submit_production_order'].includes(props.actionKey)
})

/** 预览字段映射（文档 E1 R04 明确要求展示的字段）*/
const previewItems = computed(() => {
  const v = props.variableData || {}
  return [
    { label: '特征ID', value: v.id || v.featureId || '-' },
    { label: '特征中文名', value: v.featureCnName || v.name || '-' },
    { label: '特征英文名', value: v.featureEnName || v.code || '-' },
    { label: '数据底表名称', value: v.dataTableName || '（未填写）' },
    { label: '加工逻辑', value: v.processingLogic || '-' },
    { label: '字段类型', value: v.fieldType || '-' },
    { label: '一级分类', value: v.l1Category || '-' },
    { label: '二级分类', value: v.l2Category || '-' }
  ]
})

/** 验收人候选（带默认标记）*/
const acceptorOptions = computed(() => {
  const v = props.variableData || {}
  // 文档 E1 R03：默认取 B1 协作信息中的验收人；B1 未填则默认取创建人
  const defaultAcceptor = v.acceptor || v.creator || '小李'
  const all = [
    { value: '小李', label: '小李（风险数据成员）' },
    { value: '小张', label: '小张（风险数据管理员）' },
    { value: '小王', label: '小王（数字社区管理员）' },
    { value: '数据应用团队', label: '数据应用团队' },
    { value: defaultAcceptor, label: defaultAcceptor }
  ]
  // 去重
  const seen = new Set<string>()
  const unique = all.filter(opt => {
    if (seen.has(opt.value)) return false
    seen.add(opt.value)
    return true
  })
  // 标记默认项
  return unique.map(opt => ({
    ...opt,
    isDefault: opt.value === defaultAcceptor
  }))
})

const defaultAcceptorHint = computed(() => {
  const v = props.variableData || {}
  const defaultAcceptor = v.acceptor || v.creator || '小李'
  if (v.acceptor) {
    return `已自动带入协作信息中的验收人：${defaultAcceptor}`
  }
  if (v.creator) {
    return `协作信息未填写验收人，已默认带入创建人：${defaultAcceptor}`
  }
  return `未配置验收人，默认：${defaultAcceptor}`
})

const config = computed(() => {
  const map: Record<string, { title: string; alert: string; alertType?: string }> = {
    submit_requirement: {
      title: '需求审核注册',
      alert: '审核通过后进入「已注册」状态，流程不做回退。',
      alertType: 'info'
    },
    submit_dev_oa: {
      title: '提开发 OA 单',
      alert: '本操作会向 OA 系统提交开发单（接收方=数仓团队）。提交后系统自动等待「数仓回调」。',
      alertType: 'info'
    },
    business_verify_pass: {
      title: '业务验证通过',
      alert: '台账内操作（不走OA单）。确认后进入「业务已验证」，等待管理员确认。',
      alertType: 'success'
    },
    admin_confirm_pass: {
      title: '管理员确认通过',
      alert: '台账内操作（不走OA单）。确认后进入「管理员已确认」，可提投产单上线。',
      alertType: 'success'
    },
    submit_production_order: {
      title: '提投产单',
      alert: '上线确认：提产后将依次完成 OA审批→参数映射+验证→内数注册→变量中心注册。',
      alertType: 'warning'
    },
    request_offline: {
      title: '申请下线',
      alert: '本操作会触发变量中心被动接收「下线」指令，请填写下线原因。',
      alertType: 'warning'
    }
  }
  return map[props.actionKey] || { title: '操作', alert: '' }
})

// 打开抽屉时重置表单
watch(() => props.visible, (v) => {
  if (v) {
    form.oaOrderId = ''
    form.acceptor = ''
    form.verifyOaOrderId = ''
    form.reason = ''
    form.offlineDate = ''
    form.remark = ''
  }
})

function handleCancel() {
  emit('update:visible', false)
}

async function handleSubmit() {
  if (props.actionKey === 'request_offline' && (!form.reason || !form.offlineDate)) {
    Message.warning('请填写下线原因和下线日期')
    return
  }
  submitting.value = true
  try {
    emit('submit', { ...form })
  } finally {
    submitting.value = false
  }
}
</script>