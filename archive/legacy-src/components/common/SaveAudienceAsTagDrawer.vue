<template>
  <a-drawer
    v-model:visible="visible"
    title="保存圈选结果为标签"
    :width="560"
    :footer="false"
  >
    <a-alert type="info" :show-icon="false" style="margin-bottom: 20px;">
      将 "{{ audienceName }}" 固化为标签,可在客户 360 / 标签体系 / 圈选规则中复用
    </a-alert>

    <a-form :model="form" layout="vertical">
      <a-form-item label="标签名称" required>
        <a-input v-model="form.name" placeholder="如:高价值活跃用户" />
      </a-form-item>

      <a-form-item label="所属标签组" required>
        <a-select
          v-model="form.groupId"
          placeholder="选择标签组"
          :options="tagGroupOptions"
          allow-search
        />
      </a-form-item>

      <a-form-item label="业务含义">
        <a-textarea
          v-model="form.description"
          placeholder="说明这个标签的业务含义,会显示在客户 360"
          :max-length="200"
          show-word-limit
        />
      </a-form-item>

      <a-form-item label="圈选规则(自动带入)">
        <div class="rule-preview">
          <a-tag v-for="r in mockRules" :key="r.key" :color="r.color">
            {{ r.label }}
          </a-tag>
          <span class="rule-tip">ⓘ 此规则来自 "{{ audienceName }}" 的圈选条件</span>
        </div>
      </a-form-item>

      <a-form-item label="刷新频率">
        <a-radio-group v-model="form.refreshType">
          <a-radio value="static">一次性</a-radio>
          <a-radio value="daily">每日</a-radio>
          <a-radio value="weekly">每周</a-radio>
          <a-radio value="realtime">实时</a-radio>
        </a-radio-group>
      </a-form-item>

      <a-form-item label="可见范围">
        <a-radio-group v-model="form.visibility">
          <a-radio value="public">全公司可见</a-radio>
          <a-radio value="department">本部门可见</a-radio>
          <a-radio value="private">仅自己</a-radio>
        </a-radio-group>
      </a-form-item>
    </a-form>

    <div class="footer-actions">
      <a-button @click="visible = false">取消</a-button>
      <a-button type="primary" :loading="submitting" @click="handleSave">
        保存为标签
      </a-button>
    </div>
  </a-drawer>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { Message } from '@arco-design/web-vue'

const props = defineProps<{
  modelValue: boolean
  audienceId?: string
  audienceName?: string
  audienceSize?: number
}>()

const emit = defineEmits<{
  'update:modelValue': [v: boolean]
  saved: [tagId: string]
}>()

const visible = ref(props.modelValue)
watch(() => props.modelValue, v => (visible.value = v))
watch(visible, v => emit('update:modelValue', v))

const submitting = ref(false)

const form = reactive({
  name: '',
  groupId: undefined as string | undefined,
  description: '',
  refreshType: 'daily',
  visibility: 'department'
})

const tagGroupOptions = [
  { label: '用户基础属性', value: 'grp_basic' },
  { label: '用户行为偏好', value: 'grp_behavior' },
  { label: '用户价值分层', value: 'grp_value' },
  { label: '风险标签', value: 'grp_risk' },
  { label: '营销响应', value: 'grp_marketing' }
]

const mockRules = [
  { key: 'r1', label: '近 30 天有登录', color: 'arcoblue' },
  { key: 'r2', label: '授信余额 > 10000', color: 'green' },
  { key: 'r3', label: '未逾期', color: 'gray' }
]

const handleSave = async () => {
  if (!form.name.trim()) {
    Message.warning('请填写标签名称')
    return
  }
  if (!form.groupId) {
    Message.warning('请选择标签组')
    return
  }
  submitting.value = true
  try {
    await new Promise(r => setTimeout(r, 600))
    const tagId = `TAG-${Date.now()}`
    Message.success(`标签 "${form.name}" 已创建,圈选规则自动带入`)
    emit('saved', tagId)
    visible.value = false
    // 重置
    form.name = ''
    form.groupId = undefined
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="scss" scoped>
.footer-actions {
  position: sticky;
  bottom: 0;
  background: #fff;
  padding: 16px 0;
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  border-top: 1px solid #f2f3f5;
}

.rule-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px;
  background: #f7f8fa;
  border-radius: 4px;

  .rule-tip {
    width: 100%;
    font-size: 12px;
    color: #86909c;
    margin-top: 4px;
  }
}
</style>