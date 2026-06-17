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
      </div>
    </div>

    <!-- 客群逻辑 容器 -->
    <div class="rule-section">
      <div class="section-header">
        <span class="section-title">客群逻辑</span>
      </div>

      <!-- 组间且或 + 所有条件组 -->
      <div class="cross-group-wrapper">
        <!-- 组间且或（仅多组时显示） -->
        <div v-if="ruleData.ruleGroups.length > 1" class="cross-group-operator">
          <div class="cross-group-line" />
          <div class="cross-group-badge">
            <a-select
              v-model="ruleData.crossGroupOperator"
              :style="{ width: '56px' }"
              size="small"
            >
              <a-option value="AND">且</a-option>
              <a-option value="OR">或</a-option>
            </a-select>
          </div>
          <div class="cross-group-line" />
        </div>

        <!-- 条件组列表 -->
        <div
          v-for="(group, groupIndex) in ruleData.ruleGroups"
          :key="group.id"
          class="rule-group-card"
        >
          <!-- 组头部 -->
          <div class="group-header">
            <a-input
              v-model="group.name"
              class="group-name-input"
              placeholder="条件组名称"
              size="small"
            />
            <a-button
              type="text"
              status="danger"
              size="small"
              title="删除条件组"
              @click="removeGroup(groupIndex)"
            >
              <template #icon><IconDelete /></template>
            </a-button>
          </div>

          <!-- 条件组内容区 -->
          <div class="group-content">
            <!-- 组内且或（左侧） -->
            <div v-if="group.conditions.length > 0" class="group-operator">
              <div class="group-operator-line" />
              <div class="group-operator-badge">
                <a-select
                  v-model="group.groupOperator"
                  :style="{ width: '72px' }"
                  size="small"
                >
                  <a-option value="AND">且</a-option>
                  <a-option value="OR">或</a-option>
                </a-select>
              </div>
            </div>

            <!-- 条件列表（居右） -->
            <div class="conditions-list" :class="{ 'has-border': group.conditions.length > 0 }">
              <div
                v-for="(condition, condIndex) in group.conditions"
                :key="condition.id"
                class="condition-row"
              >
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
                    <a-option
                      v-for="op in getOperatorsForCondition(groupIndex, condIndex)"
                      :key="op.value"
                      :value="op.value"
                    >
                      {{ op.label }}
                    </a-option>
                  </a-select>
                </div>

                <!-- 值输入 -->
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
                    <!-- 时间窗口 -->
                    <a-select
                      v-model="condition.timeWindowType"
                      :style="{ width: '90px', marginLeft: '6px' }"
                      placeholder="时间范围"
                      size="small"
                      @change="(val) => onTimeWindowTypeChange(condition, val)"
                    >
                      <a-option value="recent7">近7天</a-option>
                      <a-option value="recent30">近30天</a-option>
                      <a-option value="recent90">近90天</a-option>
                      <a-option value="custom">自定义</a-option>
                    </a-select>
                    <template v-if="condition.timeWindowType === 'custom'">
                      <a-range-picker
                        v-model:model-value="condition.timeWindowCustom"
                        :style="{ width: '220px', marginLeft: '6px' }"
                        size="small"
                      />
                    </template>
                  </template>
                  <template v-else-if="isTextField(condition.fieldId)">
                    <a-select
                      v-model="condition.values"
                      :style="{ minWidth: '160px' }"
                      multiple
                      placeholder="选择值"
                      size="small"
                    >
                      <a-option
                        v-for="v in getFieldValues(condition.fieldId)"
                        :key="v.value"
                        :value="v.value"
                      >
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

                <!-- 删除条件 -->
                <div class="condition-delete">
                  <a-button
                    type="text"
                    status="danger"
                    size="small"
                    @click="removeCondition(groupIndex, condIndex)"
                  >
                    <template #icon><IconClose /></template>
                  </a-button>
                </div>
              </div>

              <!-- 添加条件按钮 -->
              <div class="add-condition-row">
                <a-button type="outline" size="small" @click="addTagCondition(groupIndex)">
                  <template #icon><IconPlus /></template>
                  添加标签
                </a-button>
                <a-button type="outline" size="small" @click="addEventCondition(groupIndex)">
                  <template #icon><IconPlus /></template>
                  添加事件
                </a-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 添加条件组 -->
      <div class="add-group-row">
        <a-button type="outline" size="small" @click="addGroup">
          <template #icon><IconPlus /></template>
          添加条件组
        </a-button>
      </div>
    </div>

    <!-- 排除逻辑 容器 -->
    <div class="rule-section exclude-section">
      <div class="section-header">
        <span class="section-title">排除逻辑</span>
      </div>

      <!-- 排除组间且或 -->
      <div class="cross-group-wrapper">
        <div v-if="ruleData.excludeGroups.length > 1" class="cross-group-operator exclude-cross">
          <div class="cross-group-line" />
          <div class="cross-group-badge">
            <a-select
              v-model="ruleData.crossExcludeGroupOperator"
              :style="{ width: '56px' }"
              size="small"
            >
              <a-option value="AND">且</a-option>
              <a-option value="OR">或</a-option>
            </a-select>
          </div>
          <div class="cross-group-line" />
        </div>

        <!-- 排除条件组 -->
        <div
          v-for="(group, groupIndex) in ruleData.excludeGroups"
          :key="group.id"
          class="rule-group-card exclude-card"
        >
          <div class="group-header">
            <a-input
              v-model="group.name"
              class="group-name-input"
              placeholder="排除条件组"
              size="small"
            />
            <a-button
              type="text"
              status="danger"
              size="small"
              @click="removeExcludeGroup(groupIndex)"
            >
              <template #icon><IconDelete /></template>
            </a-button>
          </div>

          <div class="group-content">
            <div class="group-operator">
              <div class="group-operator-line" />
              <div class="group-operator-badge">
                <a-select
                  v-model="group.groupOperator"
                  :style="{ width: '56px' }"
                  size="small"
                >
                  <a-option value="AND">且</a-option>
                  <a-option value="OR">或</a-option>
                </a-select>
              </div>
            </div>

            <div class="conditions-list">
              <div
                v-for="(condition, condIndex) in group.conditions"
                :key="condition.id"
                class="condition-row"
              >
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
                    <a-option
                      v-for="op in getOperatorsForExcludeCondition(groupIndex, condIndex)"
                      :key="op.value"
                      :value="op.value"
                    >
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
                    <a-select
                      v-model="condition.timeWindowType"
                      :style="{ width: '90px', marginLeft: '6px' }"
                      placeholder="时间范围"
                      size="small"
                    >
                      <a-option value="recent7">近7天</a-option>
                      <a-option value="recent30">近30天</a-option>
                      <a-option value="recent90">近90天</a-option>
                      <a-option value="custom">自定义</a-option>
                    </a-select>
                  </template>
                  <template v-else-if="isTextField(condition.fieldId)">
                    <a-select
                      v-model="condition.values"
                      :style="{ minWidth: '160px' }"
                      multiple
                      placeholder="选择值"
                      size="small"
                    >
                      <a-option
                        v-for="v in getFieldValues(condition.fieldId)"
                        :key="v.value"
                        :value="v.value"
                      >
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
                    type="text"
                    status="danger"
                    size="small"
                    @click="removeExcludeCondition(groupIndex, condIndex)"
                  >
                    <template #icon><IconClose /></template>
                  </a-button>
                </div>
              </div>

              <div class="add-condition-row">
                <a-button type="outline" size="small" @click="addExcludeTagCondition(groupIndex)">
                  <template #icon><IconPlus /></template>
                  添加标签
                </a-button>
                <a-button type="outline" size="small" @click="addExcludeEventCondition(groupIndex)">
                  <template #icon><IconPlus /></template>
                  添加事件
                </a-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="add-group-row">
        <a-button type="outline" size="small" @click="addExcludeGroup">
          <template #icon><IconPlus /></template>
          添加排除条件组
        </a-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'

// ============ 字段数据（内联，避免alias问题） ============
const tagFields = [
  { id: 'f1', name: '城市', subType: 'text', values: [{ label: '北京', value: 'beijing' }, { label: '上海', value: 'shanghai' }] },
  { id: 'f2', name: '性别', subType: 'text', values: [{ label: '男', value: 'male' }, { label: '女', value: 'female' }] },
  { id: 'f3', name: '年龄', subType: 'number' },
  { id: 'f4', name: 'VIP等级', subType: 'number' },
  { id: 'f5', name: '注册渠道', subType: 'text', values: [{ label: 'App', value: 'app' }, { label: 'H5', value: 'h5' }] },
]

const eventFields = [
  { id: 'e1', name: '加购', subType: 'event' },
  { id: 'e2', name: '下单', subType: 'event' },
  { id: 'e3', name: '支付', subType: 'event' },
  { id: 'e4', name: '退款', subType: 'event' },
  { id: 'e5', name: '登录', subType: 'event' },
]

// ============ 顶层数据结构 ============
const ruleData = reactive({
  ruleGroups: [],
  excludeGroups: [],
  crossGroupOperator: 'AND',
  crossExcludeGroupOperator: 'OR',
})

// ============ 初始化 ============
const initGroup = (isExclude = false) => ({
  id: `group_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
  name: isExclude ? '排除条件组' : '条件组',
  conditions: [],
  groupOperator: 'AND',
})

// 初始化
ruleData.ruleGroups = [initGroup()]
ruleData.excludeGroups = [initGroup(true)]

// ============ ID生成 ============
const genId = () => `cond_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`

// ============ 初始化条件 ============
const initCondition = (fieldId = null, operator = null) => ({
  id: genId(),
  fieldId,
  operator,
  values: [],
  value: null,
  timeWindowType: null,
  timeWindowCustom: null,
})

// ============ 字段变化时重置 ============
const onFieldChange = (groupIndex, condIndex, fieldId) => {
  const condition = ruleData.ruleGroups[groupIndex].conditions[condIndex]
  condition.values = []
  condition.value = null
  condition.operator = null
  condition.timeWindowType = null
  condition.timeWindowCustom = null
}

const onExcludeFieldChange = (groupIndex, condIndex, fieldId) => {
  const condition = ruleData.excludeGroups[groupIndex].conditions[condIndex]
  condition.values = []
  condition.value = null
  condition.operator = null
  condition.timeWindowType = null
  condition.timeWindowCustom = null
}

// ============ 时间窗口 ============
const onTimeWindowTypeChange = (condition, type) => {
  if (type !== 'custom') {
    condition.timeWindowCustom = null
  }
}

// ============ 添加条件组 ============
const addGroup = () => {
  ruleData.ruleGroups.push(initGroup())
}

const addExcludeGroup = () => {
  ruleData.excludeGroups.push(initGroup(true))
}

// ============ 删除条件组 ============
const removeGroup = (groupIndex) => {
  ruleData.ruleGroups.splice(groupIndex, 1)
  if (ruleData.ruleGroups.length === 0) {
    ruleData.ruleGroups.push(initGroup())
  }
}

const removeExcludeGroup = (groupIndex) => {
  ruleData.excludeGroups.splice(groupIndex, 1)
  if (ruleData.excludeGroups.length === 0) {
    ruleData.excludeGroups.push(initGroup(true))
  }
}

// ============ 添加条件（按类型） ============
const addTagCondition = (groupIndex) => {
  const group = ruleData.ruleGroups[groupIndex]
  const field = tagFields[0]
  if (field) {
    const ops = getTagOperators(field)
    group.conditions.push(initCondition(field.id, ops[0]?.value || null))
  } else {
    group.conditions.push(initCondition())
  }
}

const addEventCondition = (groupIndex) => {
  const group = ruleData.ruleGroups[groupIndex]
  const field = eventFields[0]
  if (field) {
    const ops = getEventOperators()
    group.conditions.push(initCondition(field.id, ops[0]?.value || null))
  } else {
    group.conditions.push(initCondition())
  }
}

const addExcludeTagCondition = (groupIndex) => {
  const group = ruleData.excludeGroups[groupIndex]
  const field = tagFields[0]
  if (field) {
    const ops = getTagOperators(field)
    group.conditions.push(initCondition(field.id, ops[0]?.value || null))
  } else {
    group.conditions.push(initCondition())
  }
}

const addExcludeEventCondition = (groupIndex) => {
  const group = ruleData.excludeGroups[groupIndex]
  const field = eventFields[0]
  if (field) {
    const ops = getEventOperators()
    group.conditions.push(initCondition(field.id, ops[0]?.value || null))
  } else {
    group.conditions.push(initCondition())
  }
}

// ============ 删除条件 ============
const removeCondition = (groupIndex, condIndex) => {
  ruleData.ruleGroups[groupIndex].conditions.splice(condIndex, 1)
  if (ruleData.ruleGroups[groupIndex].conditions.length === 0) {
    ruleData.ruleGroups[groupIndex].conditions.push(initCondition())
  }
}

const removeExcludeCondition = (groupIndex, condIndex) => {
  ruleData.excludeGroups[groupIndex].conditions.splice(condIndex, 1)
  if (ruleData.excludeGroups[groupIndex].conditions.length === 0) {
    ruleData.excludeGroups[groupIndex].conditions.push(initCondition())
  }
}

// ============ 操作符获取 ============
const getTagOperators = (field) => {
  const ops = {
    text: [
      { value: 'contains', label: '包含' },
      { value: 'not_contains', label: '不包含' },
      { value: 'equals', label: '等于' },
      { value: 'not_equals', label: '不等于' },
      { value: 'is_null', label: '为空' },
      { value: 'not_null', label: '不为空' },
    ],
    number: [
      { value: '=', label: '=' },
      { value: '>', label: '>' },
      { value: '>=', label: '≥' },
      { value: '<', label: '<' },
      { value: '<=', label: '≤' },
      { value: '!=', label: '!=' },
    ],
  }
  return ops[field.subType] || ops.text
}

const getEventOperators = () => [
  { value: 'happened', label: '发生过' },
  { value: 'not_happened', label: '未发生' },
  { value: 'at_least_n', label: '至少N次' },
]

const getOperatorsForCondition = (groupIndex, condIndex) => {
  const condition = ruleData.ruleGroups[groupIndex].conditions[condIndex]
  if (!condition.fieldId) return []
  const field = tagFields.find(f => f.id === condition.fieldId) || eventFields.find(e => e.id === condition.fieldId)
  if (!field) return []
  if (field.subType === 'event') return getEventOperators()
  return getTagOperators(field)
}

const getOperatorsForExcludeCondition = (groupIndex, condIndex) => {
  const condition = ruleData.excludeGroups[groupIndex].conditions[condIndex]
  if (!condition.fieldId) return []
  const field = tagFields.find(f => f.id === condition.fieldId) || eventFields.find(e => e.id === condition.fieldId)
  if (!field) return []
  if (field.subType === 'event') return getEventOperators()
  return getTagOperators(field)
}

// ============ 字段类型判断 ============
const isTextField = (fieldId) => {
  if (!fieldId) return false
  const field = tagFields.find(f => f.id === fieldId)
  return field?.subType === 'text'
}

const isEventField = (fieldId) => {
  if (!fieldId) return false
  const field = eventFields.find(e => e.id === fieldId)
  return !!field
}

const getFieldValues = (fieldId) => {
  if (!fieldId) return []
  const field = tagFields.find(f => f.id === fieldId)
  return field?.values || []
}

// ============ 预估人数 ============
const estimatedCount = computed(() => {
  return Math.floor(Math.random() * 5000) + 2000
})

// ============ 逻辑摘要 ============
const logicSummary = computed(() => {
  const parts = []
  const crossOp = ruleData.crossGroupOperator === 'AND' ? '且' : '或'
  const excludeCrossOp = ruleData.crossExcludeGroupOperator === 'AND' ? '且' : '或'

  ruleData.ruleGroups.forEach((group) => {
    if (group.conditions.length === 0) return
    const condParts = []
    group.conditions.forEach((cond) => {
      const field = tagFields.find(f => f.id === cond.fieldId) || eventFields.find(e => e.id === cond.fieldId)
      const fieldName = field?.name || '未选'
      const ops = field?.subType === 'event' ? getEventOperators() : getTagOperators(field)
      const opLabel = ops.find(o => o.value === cond.operator)?.label || cond.operator
      condParts.push(`${fieldName} ${opLabel}`)
    })
    if (condParts.length > 0) {
      parts.push(`(${condParts.join(' ' + (group.groupOperator === 'AND' ? '且' : '或') + ' ')})`)
    }
  })

  ruleData.excludeGroups.forEach((group) => {
    if (group.conditions.length === 0) return
    const condParts = []
    group.conditions.forEach((cond) => {
      const field = tagFields.find(f => f.id === cond.fieldId) || eventFields.find(e => e.id === cond.fieldId)
      const fieldName = field?.name || '未选'
      const ops = field?.subType === 'event' ? getEventOperators() : getTagOperators(field)
      const opLabel = ops.find(o => o.value === cond.operator)?.label || cond.operator
      condParts.push(`${fieldName} ${opLabel}`)
    })
    if (condParts.length > 0) {
      parts.push(`排除:(${condParts.join(' ' + (group.groupOperator === 'AND' ? '且' : '或') + ' ')})`)
    }
  })

  if (ruleData.ruleGroups.length > 1) {
    return parts.join(` ${crossOp} `)
  }
  return parts.join(` ${excludeCrossOp} `) || '请配置条件'
})

// ============ Props & Emits ============
const props = defineProps<{
  modelValue?: any
}>()

const emit = defineEmits(['update:modelValue'])

// 监听变化同步到父组件
// (略去watch逻辑，可根据需要添加)
</script>

<style scoped>
.cdp-rule-builder {
  padding: 16px;
  font-size: 14px;
}

/* 顶部汇总区 */
.summary-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f7f8fa;
  border-radius: 4px;
  margin-bottom: 16px;
}

.logic-summary {
  display: flex;
  align-items: center;
  gap: 8px;
}

.summary-label {
  color: #646a73;
}

.summary-text {
  color: #1d2129;
  font-weight: 500;
}

.estimate-count {
  display: flex;
  align-items: center;
  gap: 4px;
}

.estimate-label {
  color: #646a73;
}

.estimate-value {
  color: #0fc6c2;
  font-weight: 600;
}

/* 容器区域 */
.rule-section {
  margin-bottom: 24px;
}

.section-header {
  margin-bottom: 12px;
}

.section-title {
  font-weight: 600;
  font-size: 15px;
  color: #1d2129;
}

/* 组间且或 */
.cross-group-wrapper {
  position: relative;
  padding-left: 80px;
}

.cross-group-operator {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 70px;
  display: flex;
  align-items: center;
  z-index: 10;
}

.cross-group-operator.exclude-cross {
  /* 排除组间样式 */
}

.cross-group-line {
  flex: 1;
  height: 2px;
  background: #c9cdd4;
}

.cross-group-badge {
  padding: 0 4px;
  background: #fff;
}

/* 条件组卡片 */
.rule-group-card {
  background: #fff;
  border: 1px solid #e5e6e8;
  border-radius: 4px;
  margin-bottom: 12px;
  overflow: hidden;
}

.rule-group-card.exclude-card {
  border-color: #fac8c8;
}

/* 组头部 */
.group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: #f2f3f5;
  border-bottom: 1px solid #e5e6e8;
}

.group-name-input {
  flex: 1;
  max-width: 200px;
}

/* 组内容区 */
.group-content {
  display: flex;
  padding: 12px;
  gap: 0;
}

/* 组内且或 */
.group-operator {
  position: relative;
  width: 70px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.group-operator-line {
  position: absolute;
  left: 24px;
  right: 0;
  top: 50%;
  height: 2px;
  background: #c9cdd4;
  transform: translateY(-50%);
}

.group-operator-badge {
  position: relative;
  z-index: 1;
  background: #fff;
  padding: 0 4px;
  min-width: 72px;
}

/* 条件列表 */
.conditions-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-left: 12px;
  border-left: 1px solid #e5e6e8;
}

.conditions-list.has-border {
  border: 1px solid #e5e6e8;
  border-radius: 4px;
  padding: 8px;
  background: #fafafa;
}

/* 条件行 */
.condition-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
}

.condition-field,
.condition-operator,
.condition-value {
  display: flex;
  align-items: center;
}

.condition-delete {
  flex-shrink: 0;
}

.event-hint {
  color: #646a73;
  font-size: 12px;
}

/* 添加条件按钮行 */
.add-condition-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  margin-top: 4px;
}

/* 添加条件组按钮 */
.add-group-row {
  padding: 8px 0;
  padding-left: 80px;
}
</style>