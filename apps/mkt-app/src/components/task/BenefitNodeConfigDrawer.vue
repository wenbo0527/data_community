<template>
  <BaseDrawer
    :visible="visible"
    :form-data="formData"
    :form-rules="formRules"
    :is-submitting="isSubmitting"
    :is-form-valid="isFormValid"
    title="权益节点配置"
    width="520px"
    :read-only="readOnly"
    @update:visible="visible = $event"
    @confirm="handleSubmit"
    @cancel="handleCancel"
  >
    <template #form>
      <a-form-item label="节点名称" field="nodeName" required>
        <a-input v-model="formData.nodeName" placeholder="请输入节点名称" :max-length="50" show-word-limit />
      </a-form-item>
      <a-form-item label="权益类型" field="benefitType" required>
        <a-select v-model="formData.benefitType" placeholder="请选择权益类型" allow-clear>
          <a-option value="coupon">优惠券</a-option>
          <a-option value="points">积分</a-option>
          <a-option value="gift">礼品</a-option>
          <a-option value="discount">折扣</a-option>
          <a-option value="cashback">返现</a-option>
        </a-select>
      </a-form-item>
      <a-form-item label="权益名称" field="benefitName" required>
        <a-input v-model="formData.benefitName" placeholder="请输入权益名称" :max-length="100" show-word-limit />
      </a-form-item>
      <a-form-item label="权益描述" field="benefitDescription">
        <a-textarea v-model="formData.benefitDescription" placeholder="请输入权益描述" :max-length="500" show-word-limit :auto-size="{ minRows: 3, maxRows: 6 }" />
      </a-form-item>
      <a-form-item label="权益金额/数量" field="benefitAmount">
        <a-input-number v-model="formData.benefitAmount" placeholder="请输入金额或数量" :min="0" :precision="2" style="width: 100%" />
      </a-form-item>
      <a-form-item label="有效期设置" field="validityType">
        <a-radio-group v-model="formData.validityType">
          <a-radio value="permanent">永久有效</a-radio>
          <a-radio value="days">指定天数</a-radio>
          <a-radio value="date">指定日期</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item v-if="formData.validityType === 'days'" label="有效天数" field="validityDays">
        <a-input-number v-model="formData.validityDays" placeholder="请输入有效天数" :min="1" :max="365" style="width: 100%" />
      </a-form-item>
      <a-form-item v-if="formData.validityType === 'date'" label="有效日期" field="validityDate">
        <a-date-picker v-model="formData.validityDate" placeholder="请选择有效日期" style="width: 100%" />
      </a-form-item>
      <a-form-item label="发放条件" field="grantCondition">
        <a-textarea v-model="formData.grantCondition" placeholder="请输入发放条件（可选）" :max-length="300" show-word-limit :auto-size="{ minRows: 2, maxRows: 4 }" />
      </a-form-item>
      <a-form-item label="使用说明" field="usageInstructions">
        <a-textarea v-model="formData.usageInstructions" placeholder="请输入使用说明（可选）" :max-length="300" show-word-limit :auto-size="{ minRows: 2, maxRows: 4 }" />
      </a-form-item>
    </template>
  </BaseDrawer>
</template>
<script setup>
import { ref, computed, watch } from 'vue'
import BaseDrawer from './BaseDrawer.vue'
const props = defineProps({ visible: { type: Boolean, default: false }, nodeData: { type: Object, default: () => ({}) }, readOnly: { type: Boolean, default: false } })
const emit = defineEmits(['update:visible','confirm','cancel'])
const formData = ref({ nodeName: '', benefitType: '', benefitName: '', benefitDescription: '', benefitAmount: null, validityType: 'permanent', validityDays: null, validityDate: null, grantCondition: '', usageInstructions: '' })
const formRules = ref({ nodeName: [ { required: true, message: '请输入节点名称' }, { max: 50, message: '节点名称不能超过50个字符' } ], benefitType: [ { required: true, message: '请选择权益类型' } ], benefitName: [ { required: true, message: '请输入权益名称' }, { max: 100, message: '权益名称不能超过100个字符' } ], benefitDescription: [ { max: 500, message: '权益描述不能超过500个字符' } ], validityDays: [ { validator: (value, callback) => { if (formData.value.validityType === 'days' && (!value || value < 1)) { callback('请输入有效天数') } else { callback() } } } ], validityDate: [ { validator: (value, callback) => { if (formData.value.validityType === 'date' && !value) { callback('请选择有效日期') } else { callback() } } } ], grantCondition: [ { max: 300, message: '发放条件不能超过300个字符' } ], usageInstructions: [ { max: 300, message: '使用说明不能超过300个字符' } ] })
const isSubmitting = ref(false)
const isFormValid = computed(() => { const { nodeName, benefitType, benefitName } = formData.value; let valid = nodeName && benefitType && benefitName; if (formData.value.validityType === 'days') { valid = valid && formData.value.validityDays && formData.value.validityDays > 0 } else if (formData.value.validityType === 'date') { valid = valid && formData.value.validityDate } return valid })
watch(() => props.nodeData, (newData) => { if (newData && Object.keys(newData).length > 0) { Object.assign(formData.value, { nodeName: newData.nodeName || '', benefitType: newData.benefitType || '', benefitName: newData.benefitName || '', benefitDescription: newData.benefitDescription || '', benefitAmount: newData.benefitAmount || null, validityType: newData.validityType || 'permanent', validityDays: newData.validityDays || null, validityDate: newData.validityDate || null, grantCondition: newData.grantCondition || '', usageInstructions: newData.usageInstructions || '' }) } else { Object.assign(formData.value, { nodeName: '', benefitType: '', benefitName: '', benefitDescription: '', benefitAmount: null, validityType: 'permanent', validityDays: null, validityDate: null, grantCondition: '', usageInstructions: '' }) } }, { immediate: true, deep: true })
const handleSubmit = async () => { if (!isFormValid.value) { return } isSubmitting.value = true; try { emit('confirm', { ...formData.value }) } finally { isSubmitting.value = false } }
const handleCancel = () => { emit('cancel') }
</script>
<style scoped>
</style>
