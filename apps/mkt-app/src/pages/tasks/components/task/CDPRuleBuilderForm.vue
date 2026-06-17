<template>
  <div class="cdp-rule-builder">
    <!-- 顶部汇总区 -->
    <div class="summary-bar">
      <div class="logic-summary">
        <span class="summary-label">逻辑摘要：</span>
        <span class="summary-text">{{ logicSummary }}</span>
      </div>
      <div class="summary-actions">
        <div class="estimate-count">
          <span class="estimate-label">预估：</span>
          <span class="estimate-value">{{ estimatedCount.toLocaleString() }} 人</span>
        </div>
        <a-button type="primary" size="small" :loading="saving" @click="handleSave">保存</a-button>
      </div>
    </div>

    <!-- 主条件组 -->
    <div class="rule-groups">
      <div v-for="(group, groupIndex) in ruleGroups" :key="group.id" class="rule-group-card">
        <!-- 组标题栏 -->
        <div class="group-header">
          <div class="group-title-area">
            <a-input
              v-model="group.name"
              class="group-name-input"
              placeholder="条件组名称"
              size="small"
            />
          </div>
          <div class="group-actions">
            <a-button type="text" size="small" title="复制">
              <template #icon><icon-copy /></template>
            </a-button>
            <a-button
              v-if="ruleGroups.length > 1"
              type="text"
              status="danger"
              size="small"
              title="删除"
              @click="removeGroup(groupIndex)"
            >
              <template #icon><icon-delete /></template>
            </a-button>
          </div>
        </div>

        <!-- 条件列表 -->
        <div class="conditions-container">
          <div
            v-for="(condition, condIndex) in group.conditions"
            :key="condition.id"
            class="condition-row"
          >
            <!-- 操作符：非第一个条件显示在左侧 -->
            <div v-if="condIndex > 0" class="operator-toggle">
              <a-select
                v-model="group.conditions[condIndex - 1].nextOperator"
                :style="{ width: '60px' }"
                size="small"
              >
                <a-option value="AND">且</a-option>
                <a-option value="OR">或</a-option>
              </a-select>
            </div>
            <div v-else class="operator-toggle" />

            <!-- 字段选择 -->
            <div class="condition-field">
              <a-select
                v-model="condition.fieldId"
                :style="{ width: '120px' }"
                placeholder="字段"
                size="small"
                @change="(val) => onFieldChange(groupIndex, condIndex, val)"
              >
                <a-option-group label="标签">
                  <a-option v-for="f in tagFields" :key="f.id" :value="f.id">
                    {{ f.name }}
                  </a-option>
                </a-option-group>
                <a-option-group label="事件">
                  <a-option v-for="e in eventFields" :key="e.id" :value="e.id">
                    {{ e.name }}
                  </a-option>
                </a-option-group>
              </a-select>
            </div>

            <!-- 关系选择 -->
            <div class="condition-operator">
              <a-select
                v-model="condition.operator"
                :style="{ width: '100px' }"
                placeholder="关系"
                size="small"
              >
                <a-option v-for="op in getOperatorsForCondition(groupIndex, condIndex)" :key="op.value" :value="op.value">
                  {{ op.label }}
                </a-option>
              </a-select>
            </div>

            <!-- 值输入 -->
            <div class="condition-value">
              <template v-if="isEventField(condition.fieldId)">
                <!-- 事件：发生过至少N次 显示数字输入 -->
                <a-input-number
                  v-if="condition.operator === 'at_least_n'"
                  v-model="condition.value"
                  :min="1"
                  :style="{ width: '80px' }"
                  size="small"
                  placeholder="次数"
                />
                <span v-else class="event-hint">是/否</span>
              </template>
              <template v-else-if="isTextField(condition.fieldId)">
                <!-- 文本型：多选chip -->
                <a-select
                  v-model="condition.values"
                  :style="{ minWidth: '160px' }"
                  multiple
                  placeholder="选择值"
                  size="small"
                  allow-create
                >
                  <a-option v-for="v in getFieldValues(condition.fieldId)" :key="v.value" :value="v.value">
                    {{ v.label }}
                  </a-option>
                </a-select>
              </template>
              <template v-else>
                <!-- 数值型：数字输入 -->
                <a-input-number
                  v-model="condition.value"
                  :style="{ width: '100px' }"
                  size="small"
                  placeholder="数值"
                />
              </template>
            </div>

            <!-- 删除条件 -->
            <div class="condition-delete">
              <a-button
                v-if="group.conditions.length > 1"
                type="text"
                status="danger"
                size="small"
                @click="removeCondition(groupIndex, condIndex)"
              >
                <template #icon><icon-close /></template>
              </a-button>
            </div>
          </div>

          <!-- 添加条件 -->
          <div class="add-condition-row">
            <a-button type="text" size="small" @click="addCondition(groupIndex)">
              <template #icon><icon-plus /></template>
              添加条件
            </a-button>
          </div>
        </div>
      </div>

      <!-- 添加条件组按钮 -->
      <div class="add-group-row">
        <a-button type="outline" size="small" @click="addGroup">
          <template #icon><icon-plus /></template>
          添加条件组
        </a-button>
      </div>
    </div>

    <!-- 排除条件组 -->
    <div class="exclude-section">
      <div class="section-title">
        <span>排除条件</span>
      </div>
      <div v-for="(group, groupIndex) in excludeGroups" :key="group.id" class="rule-group-card exclude-group">
        <div class="group-header">
          <div class="group-title-area">
            <a-input
              v-model="group.name"
              class="group-name-input"
              placeholder="排除条件名称"
              size="small"
            />
          </div>
          <div class="group-actions">
            <a-button
              v-if="excludeGroups.length > 1"
              type="text"
              status="danger"
              size="small"
              @click="removeExcludeGroup(groupIndex)"
            >
              <template #icon><icon-delete /></template>
            </a-button>
          </div>
        </div>

        <div class="conditions-container">
          <div
            v-for="(condition, condIndex) in group.conditions"
            :key="condition.id"
            class="condition-row"
          >
            <div v-if="condIndex > 0" class="operator-toggle">
              <a-select
                v-model="group.conditions[condIndex - 1].nextOperator"
                :style="{ width: '60px' }"
                size="small"
              >
                <a-option value="AND">且</a-option>
                <a-option value="OR">或</a-option>
              </a-select>
            </div>
            <div v-else class="operator-toggle" />

            <div class="condition-field">
              <a-select
                v-model="condition.fieldId"
                :style="{ width: '120px' }"
                placeholder="字段"
                size="small"
                @change="(val) => onExcludeFieldChange(groupIndex, condIndex, val)"
              >
                <a-option-group label="标签">
                  <a-option v-for="f in tagFields" :key="f.id" :value="f.id">
                    {{ f.name }}
                  </a-option>
                </a-option-group>
                <a-option-group label="事件">
                  <a-option v-for="e in eventFields" :key="e.id" :value="e.id">
                    {{ e.name }}
                  </a-option>
                </a-option-group>
              </a-select>
            </div>

            <div class="condition-operator">
              <a-select
                v-model="condition.operator"
                :style="{ width: '100px' }"
                placeholder="关系"
                size="small"
              >
                <a-option v-for="op in getOperatorsForExcludeCondition(groupIndex, condIndex)" :key="op.value" :value="op.value">
                  {{ op.label }}
                </a-option>
              </a-select>
            </div>

            <div class="condition-value">
              <template v-if="isEventField(condition.fieldId)">
                <a-input-number
                  v-if="condition.operator === 'at_least_n'"
                  v-model="condition.value"
                  :min="1"
                  :style="{ width: '80px' }"
                  size="small"
                  placeholder="次数"
                />
                <span v-else class="event-hint">是/否</span>
              </template>
              <template v-else-if="isTextField(condition.fieldId)">
                <a-select
                  v-model="condition.values"
                  :style="{ minWidth: '160px' }"
                  multiple
                  placeholder="选择值"
                  size="small"
                  allow-create
                >
                  <a-option v-for="v in getFieldValues(condition.fieldId)" :key="v.value" :value="v.value">
                    {{ v.label }}
                  </a-option>
                </a-select>
              </template>
              <template v-else>
                <a-input-number
                  v-model="condition.value"
                  :style="{ width: '100px' }"
                  size="small"
                  placeholder="数值"
                />
              </template>
            </div>

            <div class="condition-delete">
              <a-button
                v-if="group.conditions.length > 1"
                type="text"
                status="danger"
                size="small"
                @click="removeExcludeCondition(groupIndex, condIndex)"
              >
                <template #icon><icon-close /></template>
              </a-button>
            </div>
          </div>

          <div class="add-condition-row">
            <a-button type="text" size="small" @click="addExcludeCondition(groupIndex)">
              <template #icon><icon-plus /></template>
              添加条件
            </a-button>
          </div>
        </div>
      </div>

      <div class="add-exclude-group-row">
        <a-button type="outline" size="small" @click="addExcludeGroup">
          <template #icon><icon-plus /></template>
          添加排除条件
        </a-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import {
  IconCopy, IconDelete, IconPlus, IconClose,
  IconPlusCircle, IconMinusCircle
} from '@arco-design/web-vue/es/icon'
import { tagFields, eventFields, operators, getOperatorsForField, mockPreviewCount } from '@/mock/cdp-fields.js'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:modelValue', 'save'])

const saving = ref(false)
const estimatedCount = ref(0)

// 生成唯一ID
const genId = () => Date.now().toString(36) + Math.random().toString(36).substr(2, 9)

// 初始化条件
const initCondition = (fieldId = null, operator = null) => ({
  id: genId(),
  fieldId,
  operator,
  values: [],
  value: null,
  nextOperator: 'AND',
})

// 初始化条件组
const initGroup = (isExclude = false) => ({
  id: genId(),
  name: isExclude ? '排除条件' : '条件组',
  isExclude,
  conditions: [initCondition()],
})

// 双向绑定数据
const ruleGroups = reactive(
  props.modelValue?.ruleGroups?.length
    ? JSON.parse(JSON.stringify(props.modelValue.ruleGroups))
    : [initGroup()]
)

const excludeGroups = reactive(
  props.modelValue?.excludeGroups?.length
    ? JSON.parse(JSON.stringify(props.modelValue.excludeGroups))
    : [initGroup(true)]
)

// 判断字段类型
const isTextField = (fieldId) => {
  const field = tagFields.find(f => f.id === fieldId)
  return field?.subType === 'text'
}

const isEventField = (fieldId) => {
  return eventFields.some(e => e.id === fieldId)
}

const getFieldValues = (fieldId) => {
  const field = tagFields.find(f => f.id === fieldId)
  return field?.values || []
}

// 获取字段可选操作符
const getOperatorsForCondition = (groupIndex, condIndex) => {
  const condition = ruleGroups[groupIndex]?.conditions[condIndex]
  if (!condition?.fieldId) return []
  const field = tagFields.find(f => f.id === condition.fieldId)
  if (field) return operators[field.subType]
  const event = eventFields.find(e => e.id === condition.fieldId)
  if (event) return operators.event
  return []
}

const getOperatorsForExcludeCondition = (groupIndex, condIndex) => {
  const condition = excludeGroups[groupIndex]?.conditions[condIndex]
  if (!condition?.fieldId) return []
  const field = tagFields.find(f => f.id === condition.fieldId)
  if (field) return operators[field.subType]
  const event = eventFields.find(e => e.id === condition.fieldId)
  if (event) return operators.event
  return []
}

// 字段变化时重置操作符和值
const onFieldChange = (groupIndex, condIndex, fieldId) => {
  const condition = ruleGroups[groupIndex].conditions[condIndex]
  condition.values = []
  condition.value = null
  condition.operator = null
}

const onExcludeFieldChange = (groupIndex, condIndex, fieldId) => {
  const condition = excludeGroups[groupIndex].conditions[condIndex]
  condition.values = []
  condition.value = null
  condition.operator = null
}

// 条件组操作
const addGroup = () => {
  ruleGroups.push(initGroup())
}

const removeGroup = (index) => {
  ruleGroups.splice(index, 1)
}

// 条件操作
const addCondition = (groupIndex) => {
  ruleGroups[groupIndex].conditions.push(initCondition())
}

const removeCondition = (groupIndex, condIndex) => {
  ruleGroups[groupIndex].conditions.splice(condIndex, 1)
}

// 排除条件组操作
const addExcludeGroup = () => {
  excludeGroups.push(initGroup(true))
}

const removeExcludeGroup = (index) => {
  excludeGroups.splice(index, 1)
}

const addExcludeCondition = (groupIndex) => {
  excludeGroups[groupIndex].conditions.push(initCondition())
}

const removeExcludeCondition = (groupIndex, condIndex) => {
  excludeGroups[groupIndex].conditions.splice(condIndex, 1)
}

// 逻辑摘要生成
const logicSummary = computed(() => {
  const parts = []

  ruleGroups.forEach((group, gi) => {
    if (group.conditions.length === 0) return
    const condParts = []
    group.conditions.forEach((cond, ci) => {
      const field = tagFields.find(f => f.id === cond.fieldId) || eventFields.find(e => e.id === cond.fieldId)
      const fieldName = field?.name || '未选'
      const opLabel = getOperatorsForCondition(gi, ci).find(o => o.value === cond.operator)?.label || cond.operator
      const condStr = `${fieldName} ${opLabel}`
      condParts.push(condStr)
    })
    if (condParts.length > 0) {
      parts.push(`(${condParts.join(' ' + (group.conditions[0]?.nextOperator || '且') + ' ')})`)
    }
  })

  excludeGroups.forEach(group => {
    if (group.conditions.length === 0) return
    const condParts = []
    group.conditions.forEach(cond => {
      const field = tagFields.find(f => f.id === cond.fieldId) || eventFields.find(e => e.id === cond.fieldId)
      const fieldName = field?.name || '未选'
      condParts.push(`${fieldName} ${cond.operator}`)
    })
    if (condParts.length > 0) {
      parts.push(`排除:(${condParts.join(' ')})`)
    }
  })

  return parts.join(' AND ') || '请配置条件'
})

// 预估人数
const updateEstimate = async () => {
  const data = { ruleGroups, excludeGroups }
  const result = await mockPreviewCount(data)
  estimatedCount.value = result.count
}

// 保存
const handleSave = async () => {
  saving.value = true
  try {
    const data = {
      ruleGroups: JSON.parse(JSON.stringify(ruleGroups)),
      excludeGroups: JSON.parse(JSON.stringify(excludeGroups)),
    }
    emit('update:modelValue', data)
    emit('save', data)
  } finally {
    saving.value = false
  }
}

// 初始化预估
updateEstimate()

// 监听数据变化重新预估
watch([ruleGroups, excludeGroups], () => {
  updateEstimate()
}, { deep: true })
</script>

<style scoped>
.cdp-rule-builder {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 顶部汇总区 */
.summary-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #f2f3f5;
  border-radius: 8px;
  font-size: 13px;
}

.summary-label {
  color: #666;
}

.summary-text {
  color: #333;
  font-weight: 500;
}

.summary-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.estimate-count {
  display: flex;
  align-items: center;
  gap: 4px;
}

.estimate-label {
  color: #666;
}

.estimate-value {
  color: #165cef;
  font-weight: 600;
}

/* 条件组卡片 */
.rule-group-card {
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  overflow: hidden;
}

.exclude-group {
  border-color: #ffd4d4;
  background: #fff8f8;
}

.group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: #fafafa;
  border-bottom: 1px solid #e5e5e5;
}

.exclude-group .group-header {
  background: #fff0f0;
  border-bottom-color: #ffd4d4;
}

.group-title-area {
  flex: 1;
}

.group-name-input {
  max-width: 200px;
  font-weight: 500;
}

.group-actions {
  display: flex;
  gap: 4px;
}

/* 条件列表 */
.conditions-container {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.condition-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.operator-toggle {
  width: 60px;
  flex-shrink: 0;
}

.condition-field,
.condition-operator,
.condition-value {
  flex-shrink: 0;
}

.condition-delete {
  flex-shrink: 0;
}

.add-condition-row {
  padding-top: 8px;
  border-top: 1px dashed #e5e5e5;
  margin-top: 4px;
}

.add-group-row {
  padding: 12px;
  text-align: center;
}

/* 排除条件区 */
.exclude-section {
  padding-top: 16px;
  border-top: 2px dashed #ffd4d4;
}

.section-title {
  font-size: 14px;
  font-weight: 500;
  color: #ff4d4f;
  margin-bottom: 12px;
}

.add-exclude-group-row {
  padding: 12px;
  text-align: center;
}

.event-hint {
  font-size: 12px;
  color: #999;
}
</style>