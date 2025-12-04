<template>
  <div class="rule-basic-info">
    <a-form
      ref="formRef"
      :model="formData"
      :rules="validationRules"
      label-align="left"
      label-col-props="{ span: 4 }"
      wrapper-col-props="{ span: 20 }"
    >
      <a-form-item
        label="规则名称"
        field="name"
        required
      >
        <a-input
          v-model="formData.name"
          placeholder="请输入规则名称"
          :max-length="50"
          show-word-limit
          allow-clear
        />
        <template #extra>
          <div class="form-extra">规则名称用于标识和搜索，建议简洁明了</div>
        </template>
      </a-form-item>

      <a-form-item
        label="监控类型"
        field="type"
        required
      >
        <a-radio-group v-model="formData.type" type="button">
          <a-radio value="inventory">库存监控</a-radio>
          <a-radio value="expiry">过期监控</a-radio>
          <a-radio value="failure">失败率监控</a-radio>
        </a-radio-group>
        <template #extra>
          <div class="form-extra">选择不同的监控类型将影响后续的条件配置选项</div>
        </template>
      </a-form-item>

      <a-form-item
        label="规则描述"
        field="description"
      >
        <a-textarea
          v-model="formData.description"
          placeholder="请输入规则描述（可选）"
          :max-length="200"
          show-word-limit
          :auto-size="{ minRows: 3, maxRows: 5 }"
          allow-clear
        />
        <template #extra>
          <div class="form-extra">详细描述规则的作用和使用场景，便于其他用户理解</div>
        </template>
      </a-form-item>

      <a-form-item
        label="标签"
        field="tags"
      >
        <a-input-tag
          v-model="formData.tags"
          placeholder="请输入标签，按回车确认"
          :max-tag-count="5"
          allow-clear
        />
        <template #extra>
          <div class="form-extra">标签可用于分类和快速搜索，最多添加5个</div>
        </template>
      </a-form-item>

      <a-form-item
        label="优先级"
        field="priority"
      >
        <a-select
          v-model="formData.priority"
          placeholder="请选择优先级"
          style="width: 200px"
        >
          <a-option value="high">高</a-option>
          <a-option value="medium">中</a-option>
          <a-option value="low">低</a-option>
        </a-select>
        <template #extra>
          <div class="form-extra">优先级将影响通知的紧急程度和处理顺序</div>
        </template>
      </a-form-item>

      <a-form-item
        label="生效时间"
        field="effectiveTime"
      >
        <a-range-picker
          v-model="formData.effectiveTime"
          style="width: 300px"
          :placeholder="['开始时间', '结束时间']"
        />
        <template #extra>
          <div class="form-extra">设置规则的有效期，为空表示永久生效</div>
        </template>
      </a-form-item>

      <a-form-item
        label="备注"
        field="remark"
      >
        <a-textarea
          v-model="formData.remark"
          placeholder="请输入备注信息（可选）"
          :max-length="500"
          show-word-limit
          :auto-size="{ minRows: 2, maxRows: 4 }"
          allow-clear
        />
        <template #extra>
          <div class="form-extra">内部备注信息，仅管理员可见</div>
        </template>
      </a-form-item>
    </a-form>

    <!-- 快速预览 -->
    <div class="quick-preview">
      <a-divider orientation="left">快速预览</a-divider>
      <div class="preview-info">
        <a-descriptions :data="previewData" :column="2" size="small" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({})
  },
  rules: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:modelValue'])

const formRef = ref()

// 表单数据
const formData = reactive({
  name: '',
  type: 'inventory',
  description: '',
  tags: [],
  priority: 'medium',
  effectiveTime: [],
  remark: ''
})

// 验证规则
const validationRules = computed(() => ({
  name: [
    { required: true, message: '请输入规则名称' },
    { minLength: 2, maxLength: 50, message: '规则名称长度应在2-50个字符之间' }
  ],
  type: [{ required: true, message: '请选择监控类型' }],
  description: [
    { maxLength: 200, message: '规则描述不能超过200个字符' }
  ],
  tags: [
    { maxLength: 5, message: '最多添加5个标签' }
  ],
  priority: [{ required: true, message: '请选择优先级' }],
  remark: [
    { maxLength: 500, message: '备注不能超过500个字符' }
  ]
}))

// 预览数据
const previewData = computed(() => [
  {
    label: '规则名称',
    value: formData.name || '未设置'
  },
  {
    label: '监控类型',
    value: getTypeLabel(formData.type)
  },
  {
    label: '优先级',
    value: getPriorityLabel(formData.priority)
  },
  {
    label: '标签',
    value: formData.tags.length > 0 ? formData.tags.join(', ') : '无'
  }
])

// 监控类型标签
const getTypeLabel = (type) => {
  const labels = {
    inventory: '库存监控',
    expiry: '过期监控',
    failure: '失败率监控'
  }
  return labels[type] || type
}

// 优先级标签
const getPriorityLabel = (priority) => {
  const labels = {
    high: '高',
    medium: '中',
    low: '低'
  }
  return labels[priority] || priority
}

// 监听数据变化
watch(() => props.modelValue, (newValue) => {
  Object.assign(formData, newValue)
}, { immediate: true, deep: true })

watch(formData, (newValue) => {
  emit('update:modelValue', newValue)
}, { deep: true })

// 验证方法
const validate = async () => {
  try {
    await formRef.value.validate()
    return true
  } catch (error) {
    return false
  }
}

// 重置方法
const reset = () => {
  Object.assign(formData, {
    name: '',
    type: 'inventory',
    description: '',
    tags: [],
    priority: 'medium',
    effectiveTime: [],
    remark: ''
  })
}

// 暴露方法
defineExpose({
  validate,
  reset
})
</script>

<style scoped lang="less">
.rule-basic-info {
  padding: 24px 0;
}

.form-extra {
  font-size: 12px;
  color: #86909c;
  margin-top: 4px;
}

.quick-preview {
  margin-top: 32px;
  
  .preview-info {
    background: #f7f8fa;
    border-radius: 6px;
    padding: 16px;
  }
}
</style>