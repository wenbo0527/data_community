<template>
  <a-modal
    :visible="visible"
    :title="mode === 'create' ? '新建库存预警规则' : '编辑库存预警规则'"
    :ok-text="'保存'"
    :cancel-text="'取消'"
    :width="600"
    :ok-loading="submitting"
    @ok="handleSubmit"
    @cancel="handleCancel"
    @update:visible="(v: boolean) => $emit('update:visible', v)"
  >
    <a-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      :label-col-props="{ span: 6 }"
      :wrapper-col-props="{ span: 18 }"
    >
      <!-- 产品（arch §5.1.1：硬编码，不含 SUD001）-->
      <a-form-item field="product_id" label="产品" required>
        <a-select
          v-model="formData.product_id"
          :disabled="mode === 'edit'"
          placeholder="请选择产品"
        >
          <a-option
            v-for="p in ALERT_SUPPORTED_PRODUCTS"
            :key="p.product_id"
            :value="p.product_id"
          >
            {{ p.product_id }} {{ p.product_name }}
          </a-option>
        </a-select>
        <template #extra>
          <span style="color: var(--color-text-3); font-size: 12px">
            SUD001 存量保护：不在此处配置
          </span>
        </template>
      </a-form-item>

      <!-- 阈值（PRD §AC-1.4：1-1,000,000）-->
      <a-form-item field="threshold_value" label="预警阈值" required>
        <a-input-number
          v-model="formData.threshold_value"
          :min="1"
          :max="1000000"
          :step="100"
          placeholder="1 - 1,000,000"
          style="width: 100%"
        />
        <template #extra>
          <span style="color: var(--color-text-3); font-size: 12px">单位：张</span>
        </template>
      </a-form-item>

      <!-- 等级 -->
      <a-form-item field="alert_level" label="预警等级">
        <a-select v-model="formData.alert_level" placeholder="请选择等级">
          <a-option value="info">提示</a-option>
          <a-option value="warning">警告</a-option>
          <a-option value="critical">严重</a-option>
        </a-select>
      </a-form-item>

      <!-- 通知渠道（PRD §AC-1.5：至少 1 个）-->
      <a-form-item field="notify_channel" label="通知渠道" required>
        <a-checkbox-group v-model="formData.notify_channel">
          <a-checkbox value="inbox">站内信</a-checkbox>
          <a-checkbox value="email">邮件</a-checkbox>
        </a-checkbox-group>
      </a-form-item>

      <!-- 通知接收人（PRD §AC-1.5：至少 1 个）-->
      <a-form-item field="notify_users" label="通知接收人" required>
        <a-select
          v-model="formData.notify_users"
          multiple
          placeholder="请选择接收人（至少 1 人）"
        >
          <a-option v-for="u in MOCK_USERS" :key="u.user_id" :value="u.user_id">
            {{ u.user_name }} ({{ u.user_id }})
          </a-option>
        </a-select>
      </a-form-item>

      <!-- 冷却时间（arch §6 Q-03：UI 暂不暴露字段已加，但 v1.2 不展示）-->
      <a-form-item v-if="false" field="cooldown_minutes" label="冷却时间（分钟）">
        <a-input-number v-model="formData.cooldown_minutes" :min="1" :max="1440" />
      </a-form-item>

      <!-- 启用 -->
      <a-form-item field="enabled" label="启用规则">
        <a-switch v-model="formData.enabled" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
/**
 * 库存预警规则新建/编辑表单
 * TASK-20260603-B2A5D2BB
 *
 * 校验（arch §5.1 + PRD §AC-1.4）：
 * - 产品下拉不含 SUD001（存量保护）
 * - 阈值 1 ≤ 值 ≤ 1,000,000
 * - 通知渠道 / 接收人 至少 1 个
 * - 编辑时产品字段锁定
 */
import { ref, watch, reactive } from 'vue'
import { Message } from '@arco-design/web-vue'
import {
  ALERT_SUPPORTED_PRODUCTS,
  DEFAULT_COOLDOWN_MINUTES,
} from '../composables/useAlertRules'
import type {
  InventoryAlertRule,
  InventoryAlertNotifyChannel,
  InventoryAlertLevel,
} from '@/types/api/coupon'

interface Props {
  visible: boolean
  mode: 'create' | 'edit'
  rule: InventoryAlertRule | null
}
const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:visible', v: boolean): void
  (e: 'submit', data: Partial<InventoryAlertRule>): void
}>()

// Mock 接收人列表（生产环境对接 IAM / 运营组）
const MOCK_USERS = [
  { user_id: 'zhangsan', user_name: '张三' },
  { user_id: 'lisi', user_name: '李四' },
  { user_id: 'wangwu', user_name: '王五' },
  { user_id: 'operator01', user_name: '运营-01' },
  { user_id: 'operator02', user_name: '运营-02' },
  { user_id: 'operator03', user_name: '运营-03' },
]

const formRef = ref()
const submitting = ref(false)

const formData = reactive<Partial<InventoryAlertRule>>({
  product_id: undefined,
  product_name: '',
  threshold_value: 1000,
  alert_level: 'warning',
  notify_channel: ['inbox'],
  notify_users: [],
  enabled: true,
  cooldown_minutes: DEFAULT_COOLDOWN_MINUTES,
})

// 监听 props.rule 变化 → 重置表单
watch(
  () => [props.visible, props.rule, props.mode] as const,
  ([vis]) => {
    if (!vis) return
    if (props.mode === 'edit' && props.rule) {
      Object.assign(formData, props.rule)
    } else {
      // 重置
      formData.product_id = undefined
      formData.product_name = ''
      formData.threshold_value = 1000
      formData.alert_level = 'warning'
      formData.notify_channel = ['inbox']
      formData.notify_users = []
      formData.enabled = true
      formData.cooldown_minutes = DEFAULT_COOLDOWN_MINUTES
    }
  },
  { immediate: true }
)

// 表单校验规则
const formRules = {
  product_id: [{ required: true, message: '请选择产品' }],
  threshold_value: [
    { required: true, message: '请输入阈值' },
    {
      validator: (v: number) => v >= 1 && v <= 1000000,
      message: '阈值需在 1 - 1,000,000 之间',
    },
  ],
  notify_channel: [
    {
      validator: (v: InventoryAlertNotifyChannel[]) => Array.isArray(v) && v.length > 0,
      message: '至少选择 1 个通知渠道',
    },
  ],
  notify_users: [
    {
      validator: (v: string[]) => Array.isArray(v) && v.length > 0,
      message: '至少选择 1 名通知接收人',
    },
  ],
}

// 提交
async function handleSubmit() {
  const valid = await formRef.value?.validate()
  if (valid) {
    Message.error('请检查表单填写')
    return
  }
  submitting.value = true
  try {
    // 自动补 product_name
    if (formData.product_id) {
      const p = ALERT_SUPPORTED_PRODUCTS.find((x) => x.product_id === formData.product_id)
      if (p) formData.product_name = p.product_name
    }
    emit('submit', { ...formData })
  } finally {
    submitting.value = false
  }
}

function handleCancel() {
  emit('update:visible', false)
}
</script>
