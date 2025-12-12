<template>
  <div class="condition-group-card" :class="{ embedded }">
    <div v-if="!embedded" class="condition-group-header">
      <div class="tree-connector">
        <div class="connector-line"></div>
      </div>
      <div class="group-name-wrapper">
        <div v-if="!group.isEditingName" class="group-name" @click="startEditGroupName(group)">
          {{ group.name || '条件组' }}
          <span v-if="group.isExclude" class="exclude-indicator">排除</span>
        </div>
        <a-input 
          v-else
          v-model="group.editingName"
          class="group-name-input"
          size="small"
          @blur="saveGroupName(group)"
          @keyup.enter="saveGroupName(group)"
          @keyup.esc="cancelEditGroupName(group)"
        />
      </div>
      <div class="global-logic-control">
        <div class="unified-logic-switcher">
          <a-button 
            type="text" 
            size="small" 
            @click="emit('toggleGroupLogic', group)"
            :title="getLogicDescription(group.logic || 'and')"
          >
            <template #icon>
              <span class="logic-text">{{ group.logic === 'or' ? '或' : '且' }}</span>
            </template>
          </a-button>
        </div>
        <div class="condition-group-actions">
          <a-button 
            v-if="editable"
            type="text" 
            size="small" 
            @click="emit('deleteConditionGroup')"
            :title="'删除条件组'"
          >
            <template #icon>
              <IconMinus />
            </template>
          </a-button>
        </div>
      </div>
    </div>
    <div class="conditions-list" :class="{ embedded, flat }">
      <!-- 扁平模式：直接按原顺序渲染所有条件，无类型分组容器 -->
      <template v-if="flat">
        <div v-for="(condition, index) in group.conditions" :key="condition.id || `c-${index}`" class="condition-item-wrapper flat-item">
          <component
            :is="getConditionComponent(condition)"
            :condition="condition"
            :editable="editable"
            :tag-options="getTagOptions?.()"
            :operator-options="isTagCondition(condition) ? getTagOperatorOptions?.() : getPropertyOperatorOptions?.()"
            :event-options="getEventOptions?.()"
            :property-options="getEventPropertyOptions"
            :data-source-type-options="dataSourceTypeOptions"
            :field-options="getFieldOptions"
            :aggregation-options="getAggregationOptions"
            :date-type-options="dateTypeOptions"
            :dynamic-unit-options="dynamicUnitOptions"
            :need-value-input="needValueInput"
            :value-placeholder="getValuePlaceholder"
            @update-condition="updateCondition"
            @remove-condition="removeConditionByIndex(condition)"
            @add-event-property="emit('addEventProperty', condition)"
            @remove-event-property="(propertyIndex: number) => emit('removeEventProperty', condition, propertyIndex)"
          />
        </div>
      </template>
      <!-- 分组模式：原有按类型分组的渲染 -->
      <template v-else>
        <div v-if="group.conditions && group.conditions.length > 0" class="grouped-conditions-list">
          <div v-if="tagConditions.length > 0" class="condition-type-group">
            <div class="type-group-header">
              <div class="type-badge type-tag">
                <IconTag class="type-icon" />
                <span class="type-text">标签条件 ({{ tagConditions.length }})</span>
              </div>
            </div>
            <div class="type-group-content">
              <div 
                v-for="(condition, index) in tagConditions" 
                :key="condition.id || `tag-${index}`"
                class="condition-item-wrapper"
              >
                <TagConditionForm
                  :condition="condition"
                  :editable="editable"
                  :tag-options="getTagOptions?.()"
                  :operator-options="getTagOperatorOptions?.()"
                  :need-value-input="needTagValueInput"
                  :value-placeholder="getTagValuePlaceholder"
                  @update-condition="updateCondition"
                  @remove-condition="removeConditionByIndex(condition)"
                />
              </div>
            </div>
          </div>
          
          <div v-if="behaviorConditions.length > 0" class="condition-type-group">
            <div class="type-group-header">
              <div class="type-badge type-behavior">
                <IconInteraction class="type-icon" />
                <span class="type-text">行为条件 ({{ behaviorConditions.length }})</span>
              </div>
            </div>
            <div class="type-group-content">
              <div 
                v-for="(condition, index) in behaviorConditions" 
                :key="condition.id || `behavior-${index}`"
                class="condition-item-wrapper"
              >
                <BehaviorConditionForm
                  :condition="condition"
                  :editable="editable"
                  :event-options="getEventOptions?.()"
                  :property-options="getEventPropertyOptions"
                  :operator-options="getPropertyOperatorOptions?.()"
                  :date-type-options="dateTypeOptions"
                  :dynamic-unit-options="dynamicUnitOptions"
                  @update-condition="updateCondition"
                  @remove-condition="removeConditionByIndex(condition)"
                  @add-event-property="emit('addEventProperty', condition)"
                  @remove-event-property="(propertyIndex: number) => emit('removeEventProperty', condition, propertyIndex)"
                />
              </div>
            </div>
          </div>
          
          <div v-if="detailConditions.length > 0" class="condition-type-group">
            <div class="type-group-header">
              <div class="type-badge type-detail">
                <IconStorage class="type-icon" />
                <span class="type-text">明细数据条件 ({{ detailConditions.length }})</span>
              </div>
            </div>
            <div class="type-group-content">
              <div 
                v-for="(condition, index) in detailConditions" 
                :key="condition.id || `detail-${index}`"
                class="condition-item-wrapper"
              >
                <DetailConditionForm
                  :condition="condition"
                  :editable="editable"
                  :data-source-type-options="dataSourceTypeOptions"
                  :field-options="getFieldOptions"
                  :aggregation-options="getAggregationOptions"
                  :operator-options="getOperatorOptions"
                  :date-type-options="dateTypeOptions"
                  :dynamic-unit-options="dynamicUnitOptions"
                  :need-value-input="needValueInput"
                  :value-placeholder="getValuePlaceholder"
                  @update-condition="updateCondition"
                  @remove-condition="removeConditionByIndex(condition)"
                />
              </div>
            </div>
          </div>
        </div>
      </template>
      
      <!-- 空状态 -->
      <div v-if="(!group.conditions || group.conditions.length === 0) && editable" class="empty-condition-state">
        <p>暂无条件，请添加条件</p>
        <!-- 添加条件按钮组 -->
        <div class="add-condition-buttons">
          <a-button 
            type="outline" 
            size="small" 
            @click="emit('addConditionByType', 'tag')"
          >
            <template #icon>
              <IconPlus />
            </template>
            添加标签
          </a-button>
          <a-button 
            type="outline" 
            size="small" 
            @click="emit('addConditionByType', 'behavior')"
          >
            <template #icon>
              <IconPlus />
            </template>
            添加行为
          </a-button>
          <a-button 
            type="outline" 
            size="small" 
            @click="emit('addConditionByType', 'detail')"
          >
            <template #icon>
              <IconPlus />
            </template>
            添加明细数据
          </a-button>
        </div>
      </div>
      
      <!-- 添加条件按钮 (当有条件时显示) -->
      <div v-if="editable && group.conditions && group.conditions.length > 0" class="add-more-conditions">
        <a-dropdown>
          <a-button type="dashed" size="small">
            <template #icon>
              <IconPlus />
            </template>
            添加条件
          </a-button>
          <template #content>
            <a-doption @click="emit('addConditionByType', 'tag')">
              <template #icon>
                <IconTag />
              </template>
              添加标签条件
            </a-doption>
            <a-doption @click="emit('addConditionByType', 'behavior')">
              <template #icon>
                <IconInteraction />
              </template>
              添加行为条件
            </a-doption>
            <a-doption @click="emit('addConditionByType', 'detail')">
              <template #icon>
                <IconStorage />
              </template>
              添加明细数据条件
            </a-doption>
          </template>
        </a-dropdown>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, nextTick } from 'vue'
import { IconPlus, IconMinus, IconTag, IconInteraction, IconStorage } from '@arco-design/web-vue/es/icon'
import TagConditionForm from './TagConditionForm.vue'
import BehaviorConditionForm from './BehaviorConditionForm.vue'
import DetailConditionForm from './DetailConditionForm.vue'

// 类型定义
interface EventProperty {
  name?: string
  operator?: string
  value?: string
}

interface Condition {
  id?: string
  dataSourceType?: string
  fieldName?: string
  aggregationType?: string
  operator?: string
  value?: string
  dateType?: string
  dateRange?: [string, string]
  dynamicValue?: number
  dynamicUnit?: string
  isExclude?: boolean
  // 标签相关字段
  tagPath?: string[]
  // 事件相关字段
  eventName?: string
  eventProperties?: EventProperty[]
}

interface ConditionGroup {
  id?: string
  name?: string
  logic?: string
  collapsed?: boolean
  isExclude?: boolean
  conditions: Condition[]
  isEditingName?: boolean
  editingName?: string
}

interface Option {
  label: string
  value: string
}

// Props
const props = withDefaults(defineProps<{
  group: ConditionGroup
  editable?: boolean
  embedded?: boolean
  flat?: boolean
  dataSourceTypeOptions?: Option[]
  dateTypeOptions?: Option[]
  dynamicUnitOptions?: Option[]
  getFieldOptions?: ((dataSourceType: string) => Option[]) | null
  getAggregationOptions?: ((dataSourceType: string) => Option[]) | null
  getOperatorOptions?: ((condition: Condition) => Option[]) | null
  needValueInput?: ((condition: Condition) => boolean) | null
  getValuePlaceholder?: ((condition: Condition) => string) | null
  onDataSourceTypeChange?: ((condition: Condition) => void) | null
  onDateTypeChange?: ((condition: Condition) => void) | null
  // 标签相关props
  getTagOptions?: (() => Option[]) | null
  getTagOperatorOptions?: (() => Option[]) | null
  needTagValueInput?: ((condition: Condition) => boolean) | null
  getTagValuePlaceholder?: ((condition: Condition) => string) | null
  // 事件相关props
  getEventOptions?: (() => Option[]) | null
  getEventPropertyOptions?: ((eventName: string) => Option[]) | null
  getPropertyOperatorOptions?: (() => Option[]) | null
}>(), {
  editable: true,
  embedded: false,
  flat: false,
  dataSourceTypeOptions: () => [
    { label: '明细数据', value: 'detail' },
    { label: '行为数据', value: 'behavior' },
    { label: '属性数据', value: 'attribute' }
  ],
  dateTypeOptions: () => [
    { label: '动态时间', value: 'dynamic' },
    { label: '固定时间', value: 'fixed' }
  ],
  dynamicUnitOptions: () => [
    { label: '天', value: 'days' },
    { label: '周', value: 'weeks' },
    { label: '月', value: 'months' }
  ],
  getFieldOptions: null,
  getAggregationOptions: null,
  getOperatorOptions: null,
  needValueInput: null,
  getValuePlaceholder: null,
  onDataSourceTypeChange: null,
  onDateTypeChange: null,
  // 标签相关默认值
  getTagOptions: null,
  getTagOperatorOptions: null,
  needTagValueInput: null,
  getTagValuePlaceholder: null,
  // 事件相关默认值
  getEventOptions: null,
  getEventPropertyOptions: null,
  getPropertyOperatorOptions: null
})

// Emits
const emit = defineEmits<{
  deleteConditionGroup: []
  toggleGroupLogic: [group: ConditionGroup]
  addConditionByType: [type: string]
  removeCondition: [conditionIndex: number]
  addEventProperty: [condition: Condition]
  removeEventProperty: [condition: Condition, propertyIndex: number]
  updateGroupName: [group: ConditionGroup, newName: string]
  updateCondition: [condition: Condition]
}>()

// 条件类型判断方法
const isTagCondition = (condition: Condition) => {
  return condition.dataSourceType === 'attribute' || condition.dataSourceType === 'tag'
}

const isBehaviorCondition = (condition: Condition) => {
  return condition.dataSourceType === 'behavior' || condition.dataSourceType === 'event'
}

const isDetailCondition = (condition: Condition) => {
  return condition.dataSourceType === 'detail'
}

// 按类型分组的计算属性
const tagConditions = computed(() => {
  return props.group.conditions?.filter(condition => isTagCondition(condition)) || []
})

const behaviorConditions = computed(() => {
  return props.group.conditions?.filter(condition => isBehaviorCondition(condition)) || []
})

const detailConditions = computed(() => {
  return props.group.conditions?.filter(condition => isDetailCondition(condition)) || []
})

// 获取条件类型相关信息
const getConditionTypeText = (condition: Condition) => {
  if (isTagCondition(condition)) return '标签'
  if (isBehaviorCondition(condition)) return '行为'
  if (isDetailCondition(condition)) return '明细'
  return '未知'
}

const getConditionTypeIcon = (condition: Condition) => {
  if (isTagCondition(condition)) return IconTag
  if (isBehaviorCondition(condition)) return IconInteraction
  if (isDetailCondition(condition)) return IconStorage
  return IconTag
}

const getConditionTypeClass = (condition: Condition) => {
  if (isTagCondition(condition)) return 'type-tag'
  if (isBehaviorCondition(condition)) return 'type-behavior'
  if (isDetailCondition(condition)) return 'type-detail'
  return 'type-default'
}

// 方法
const removeConditionByIndex = (condition: Condition) => {
  const conditionIndex = props.group.conditions.findIndex(c => c.id === condition.id || c === condition)
  if (conditionIndex !== -1) {
    emit('removeCondition', conditionIndex)
  }
}

// 条件组名称编辑相关方法
const startEditGroupName = (group: ConditionGroup) => {
  if (!props.editable) return
  
  group.isEditingName = true
  group.editingName = group.name || ''
  
  // 使用 nextTick 确保输入框已渲染
  nextTick(() => {
    const input = document.querySelector('.group-name-input input') as HTMLInputElement
    if (input) {
      input.focus()
      input.select()
    }
  })
}

const saveGroupName = (group: ConditionGroup) => {
  if (group.editingName && group.editingName.trim()) {
    emit('updateGroupName', group, group.editingName.trim())
  }
  group.isEditingName = false
  group.editingName = ''
}

const cancelEditGroupName = (group: ConditionGroup) => {
  group.isEditingName = false
  group.editingName = ''
}

// 获取逻辑描述
const getLogicDescription = (logic: string) => {
  return logic === 'and' ? '所有条件都必须满足' : '任一条件满足即可'
}

// 更新条件
const updateCondition = (updatedCondition: Condition) => {
  emit('updateCondition', updatedCondition)
}

// 根据条件返回对应表单组件
const getConditionComponent = (condition: Condition) => {
  if (isTagCondition(condition)) return TagConditionForm
  if (isBehaviorCondition(condition)) return BehaviorConditionForm
  if (isDetailCondition(condition)) return DetailConditionForm
  return TagConditionForm
}
</script>

<style scoped>
.condition-group-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #ffffff;
  margin-bottom: 16px;
  overflow: hidden;
}
.condition-group-card.embedded {
  border: none;
  border-radius: 0;
  background: transparent;
  margin-bottom: 0;
}

.condition-group-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  gap: 12px;
}

.conditions-list {
  padding: 16px;
}
.conditions-list.embedded {
  padding: 0;
}
.conditions-list.flat .condition-item-wrapper {
  border: none;
  padding: 0;
  margin: 8px 0;
}

.connector-line {
  width: 2px;
  height: 100%;
  background: #d1d5db;
  margin: 0 auto;
}

.group-name-wrapper {
  flex: 1;
}

.group-name {
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

.group-name:hover {
  color: #1f2937;
}

.exclude-indicator {
  background: #fef3c7;
  color: #92400e;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.group-name-input {
  max-width: 200px;
}

.global-logic-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logic-text {
  font-weight: 500;
  color: #374151;
}

.conditions-list {
  padding: 16px;
}

.grouped-conditions-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.condition-type-group {
  border: 1px solid var(--color-border-2);
  border-radius: 8px;
  overflow: hidden;
}

.type-group-header {
  background: var(--color-fill-1);
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border-2);
}

.type-group-content {
  background: var(--color-bg-2);
}

.condition-item-wrapper {
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border-3);
}

.condition-item-wrapper:last-child {
  border-bottom: none;
}

.condition-type-indicator {
  flex-shrink: 0;
  margin-top: 4px;
}

.type-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.type-badge.type-tag {
  background: linear-gradient(135deg, #eff6ff 0%, #f0f9ff 100%);
  color: #1d4ed8;
  border: 1px solid #dbeafe;
}

.type-badge.type-behavior {
  background: linear-gradient(135deg, #f0fdf4 0%, #f9fff6 100%);
  color: #166534;
  border: 1px solid #dcfce7;
}

.type-badge.type-detail {
  background: linear-gradient(135deg, #fef3c7 0%, #fffaf5 100%);
  color: #92400e;
  border: 1px solid #fde68a;
}

.type-badge.type-default {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #e5e7eb;
}

.type-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.type-text {
  font-size: 13px;
  font-weight: 600;
}

.condition-form-wrapper {
  flex: 1;
  min-width: 0;
}

.add-more-conditions {
  margin-top: 16px;
  text-align: center;
}

.empty-condition-state {
  text-align: center;
  padding: 24px;
  color: #6b7280;
}

.empty-condition-state p {
  margin: 0 0 16px 0;
}

.add-condition-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
}

.add-condition-buttons .arco-btn {
  min-width: 100px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .condition-group {
    padding: 12px;
  }
  
  .group-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .group-title {
    font-size: 14px;
  }
  
  .group-actions {
    width: 100%;
    justify-content: flex-start;
  }
  
  .grouped-conditions-list {
    gap: 16px;
  }
  
  .type-group-header {
    padding: 10px 12px;
  }
  
  .condition-item-wrapper {
    padding: 10px 12px;
  }
  
  .type-badge {
    padding: 4px 8px;
    font-size: 12px;
    gap: 6px;
  }
  
  .type-icon {
    font-size: 14px;
  }
  
  .type-text {
    font-size: 12px;
  }
}
</style>
