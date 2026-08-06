<!--
  通用 midloan 状态切换抽屉 · 文档 C1 R02 / E1 R02 / F1 R02 / K1 R01
  - 提开发 OA 单（C1）：预览特征信息 + 填写 OA 单号 + 说明（接收方=数仓团队，展示但不可改）
  - 发起验收（E1）：预览特征信息 + 选择验收人（默认带入协作信息中的验收人）+ OA 验收单号 + 说明
  - 发起上线流程（F1）：预览特征信息 + 提示"上线后将调用内数+变量中心+OA投产单同步" + 取消/确认
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

    <!-- 特征信息预览（提交开发单 / 发起验收 / 发起上线流程 都需要预览）-->
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

      <!-- 发起验收（E1 R03：接收方默认取 B1 协作信息中的验收人；E1 R04：预览特征信息）-->
      <template v-else-if="actionKey === 'submit_verify'">
        <a-form-item label="验收人" required>
          <a-select
            v-model="form.acceptor"
            placeholder="请选择验收人"
            allow-clear
          >
            <a-option
              v-for="opt in acceptorOptions"
              :key="opt.value"
              :value="opt.value"
            >
              {{ opt.label }}
              <span v-if="opt.isDefault" style="color: var(--color-text-3); font-size: 12px;">（默认）</span>
            </a-option>
          </a-select>
          <template #extra v-if="defaultAcceptorHint">
            <span style="color: var(--color-text-3); font-size: 12px;">{{ defaultAcceptorHint }}</span>
          </template>
        </a-form-item>
        <a-form-item label="OA 验收单号">
          <a-input :model-value="form.generatedOaOrderId || '提交后由 OA 系统自动生成'" disabled />
          <template #extra>
            <span style="color: var(--color-text-3); font-size: 12px;">
              <icon-info-circle /> OA 验收单号由 OA 系统提交后返回，无需人工填写
            </span>
          </template>
        </a-form-item>
        <a-form-item label="验收标准（可选）">
          <a-textarea v-model="form.remark" :rows="3" placeholder="可列出验收标准/验证点" />
        </a-form-item>
      </template>

      <!-- 发起上线流程（F1 R02：确认抽屉 + 提示，无需填表单字段）-->
      <template v-else-if="actionKey === 'start_online'">
        <a-alert type="warning" :show-icon="false" style="margin-bottom: 12px">
          <p style="margin: 0 0 4px 0; font-weight: 500;">⚠️ 确认操作</p>
          <p style="margin: 0; font-size: 13px;">
            确认后将自动调用：内数 INT-01 API（注册/变更接口）+ 变量中心 INT-03（注册接口）+ INT-09 OA 投产单（告知内数与变量中心）。
            请确认数据底表/接口字段已准备就绪。
          </p>
        </a-alert>
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

      <!-- 验收驳回（E3）-->
      <template v-else-if="actionKey === 'verify_reject'">
        <a-form-item label="驳回原因" required>
          <a-radio-group v-model="form.reason">
            <a-radio value="数据不符合预期">数据不符合预期</a-radio>
            <a-radio value="代码质量不合格">代码质量不合格</a-radio>
            <a-radio value="性能不达标">性能不达标</a-radio>
            <a-radio value="文档不完整">文档不完整</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="详细说明" required>
          <a-textarea v-model="form.remark" :rows="3" placeholder="请详细说明驳回原因，便于开发人员修改" />
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
  actionKey: 'submit_dev_oa' | 'submit_verify' | 'start_online' | 'request_offline' | 'verify_reject'
  /** 当前变量数据（用于预览与自动带入验收人）*/
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
  generatedOaOrderId: ''
})

/** 哪些 action 需要预览特征信息（文档 C1 R02 / E1 R04 / F1 R02）*/
const showPreview = computed(() => {
  return ['submit_dev_oa', 'submit_verify', 'start_online'].includes(props.actionKey)
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
  const map = {
    submit_dev_oa: {
      title: '提开发 OA 单',
      alert: '本操作会向 OA 系统提交开发单（接收方=数仓团队）。提交后系统自动等待「数仓回调」。',
      alertType: 'info'
    },
    submit_verify: {
      title: '发起验收',
      alert: '本操作会向 OA 系统提交验收单，请确认验收人和验收标准。',
      alertType: 'info'
    },
    start_online: {
      title: '发起上线流程',
      alert: '上线流程确认：将依次调用内数 INT-01 + 变量中心 INT-03 + OA 投产单 INT-09。',
      alertType: 'warning'
    },
    request_offline: {
      title: '申请下线',
      alert: '本操作会触发变量中心被动接收「下线」指令，请填写下线原因。',
      alertType: 'warning'
    },
    verify_reject: {
      title: '验收驳回',
      alert: '驳回后将通知开发人员修改并重新提单。',
      alertType: 'error'
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
    // 默认带入验收人（文档 E1 R03）
    if (props.actionKey === 'submit_verify') {
      const variable = props.variableData || {}
      form.acceptor = variable.acceptor || variable.creator || '小李'
    }
  }
})

function handleCancel() {
  emit('update:visible', false)
}

async function handleSubmit() {
  // 校验（OA 单号由 OA 系统自动生成，无需校验）
  if (props.actionKey === 'submit_verify' && !form.acceptor) {
    Message.warning('请选择验收人')
    return
  }
  if (props.actionKey === 'request_offline' && (!form.reason || !form.offlineDate)) {
    Message.warning('请填写下线原因和下线日期')
    return
  }
  if (props.actionKey === 'verify_reject' && (!form.reason || !form.remark)) {
    Message.warning('请填写驳回原因和详细说明')
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