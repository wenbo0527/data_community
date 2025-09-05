<template>
  <div class="condition-config">
    <a-space>
      <!-- 字段选择 -->
      <a-select
        v-model="localCondition.field"
        placeholder="选择字段"
        style="width: 120px"
        :data-testid="'condition-field-select'"
        @change="updateCondition"
      >
        <a-option value="age">年龄</a-option>
        <a-option value="gender">性别</a-option>
        <a-option value="city">城市</a-option>
        <a-option value="income">收入</a-option>
        <a-option value="education">学历</a-option>
      </a-select>

      <!-- 操作符选择 -->
      <a-select
        v-model="localCondition.operator"
        placeholder="选择操作符"
        style="width: 100px"
        :data-testid="'condition-operator-select'"
        @change="updateCondition"
      >
        <a-option value="equals">等于</a-option>
        <a-option value="not_equals">不等于</a-option>
        <a-option value="greater_than">大于</a-option>
        <a-option value="less_than">小于</a-option>
        <a-option value="contains">包含</a-option>
        <a-option value="not_contains">不包含</a-option>
      </a-select>

      <!-- 值输入 -->
      <a-input
        v-model="localCondition.value"
        placeholder="输入值"
        style="width: 120px"
        :data-testid="'condition-value-input'"
        @input="updateCondition"
      />
    </a-space>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Condition {
  field: string
  operator: string
  value: any
  type: 'include' | 'exclude'
}

interface ConditionGroup {
  id: string
  type: 'include' | 'exclude'
  logic: 'and' | 'or'
  conditions: Condition[]
}

interface Props {
  condition: Condition
  conditionGroups?: ConditionGroup[]
}

interface Emits {
  'update:condition': [condition: Condition]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 本地状态
const localCondition = ref<Condition>({ ...props.condition })

// 监听 props 变化
watch(
  () => props.condition,
  (newCondition) => {
    localCondition.value = { ...newCondition }
  },
  { deep: true }
)

// 更新条件
const updateCondition = () => {
  emit('update:condition', { ...localCondition.value })
}
</script>

<style scoped>
.condition-config {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>