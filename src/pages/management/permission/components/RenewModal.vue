<template>
  <a-modal
    :visible="visible"
    title="续期权限"
    :width="500"
    @ok="handleConfirm"
    @cancel="handleCancel"
    @update:visible="$emit('update:visible', $event)"
  >
    <div v-if="permission" class="renew-preview">
      <div class="preview-item">
        <span class="label">资源名称：</span>
        <span class="value">{{ permission.resourceName }}</span>
      </div>
      <div class="preview-item">
        <span class="label">权限类型：</span>
        <span class="value">{{ getPermissionTypeText(permission.permissionType) }}</span>
      </div>
      <div class="preview-item">
        <span class="label">当前有效期：</span>
        <span class="value">{{ formatCurrentExpiry(permission) }}</span>
      </div>
    </div>

    <a-form layout="vertical" :model="form" style="margin-top: 16px">
      <a-form-item label="续期时长" required>
        <a-radio-group v-model="form.months">
          <a-radio :value="3">3 个月</a-radio>
          <a-radio :value="6">6 个月</a-radio>
          <a-radio :value="12">12 个月</a-radio>
          <a-radio :value="24">24 个月</a-radio>
        </a-radio-group>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup>
/**
 * 续期权限弹窗 - 完整版
 */
import { ref, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import { getPermissionTypeText } from '../utils'

const props = defineProps({
  visible: { type: Boolean, default: false },
  permission: { type: Object, default: null }
})
const emit = defineEmits(['update:visible', 'confirm'])

const form = ref({ months: 6 })

watch(() => props.visible, (v) => {
  if (v) form.value = { months: 6 }
})

function formatCurrentExpiry(p) {
  if (!p) return '-'
  return `${p.validFrom} ~ ${p.validTo}`
}

function handleConfirm() {
  emit('confirm', { permission: props.permission, months: form.value.months })
  Message.success('已提交续期申请')
  emit('update:visible', false)
}

function handleCancel() {
  emit('update:visible', false)
}
</script>

<style scoped>
.renew-preview {
  background: var(--color-fill-1);
  padding: 16px;
  border-radius: 4px;
}
.preview-item {
  display: flex;
  padding: 6px 0;
  font-size: 13px;
}
.preview-item .label {
  width: 100px;
  color: var(--color-text-3);
}
.preview-item .value {
  color: var(--color-text-1);
  font-weight: 500;
}
</style>