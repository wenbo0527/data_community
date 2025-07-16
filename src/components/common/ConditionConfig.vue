<template>
  <div class="condition-config-component">
    <!-- 条件组配置 -->
    <div class="condition-groups-section">
      <div class="section-header">
        <div class="section-info">
          <h4>条件配置</h4>
          <span class="condition-count">共 {{ regularGroups.length + excludeGroups.length }} 个条件组</span>
        </div>
      </div>
      
      <!-- 空状态 -->
      <div v-if="regularGroups.length === 0 && excludeGroups.length === 0" class="empty-condition-state">
        <IconPlus style="font-size: 32px; color: #c9cdd4;" />
        <p>暂无条件组，请创建第一个条件组</p>
        <a-button type="primary" @click="addConditionGroup" :disabled="!editable">
          <template #icon><IconPlus /></template>
          创建第一个条件组
        </a-button>
      </div>
      
      <!-- 条件组列表 -->
      <div v-else class="condition-groups-workspace">
        <!-- 常规条件组区域 -->
        <div v-if="regularGroups.length > 0" class="regular-groups-section">
          <div class="section-title">包含条件组</div>
          
          <!-- 常规条件组列表 -->
          <div class="condition-groups-list">
            <!-- 包含条件组之间的逻辑连接线（仅覆盖包含条件组） -->
            <div v-if="regularGroups.length > 1" class="vertical-logic-line">
              <div class="logic-line-vertical"></div>
              <div 
                class="cross-group-logic-indicator"
                :class="{ 
                  'and': crossGroupLogic === 'and', 
                  'or': crossGroupLogic === 'or',
                  'clickable': editable
                }"
                @click="editable && toggleCrossGroupLogic()"
              >
                <span class="logic-text">{{ crossGroupLogic === 'and' ? '且' : '或' }}</span>
              </div>
            </div>
            
            <ConditionGroup
              v-for="(group, groupIndex) in regularGroups"
              :key="group.id || groupIndex"
              :group="group"
              :group-index="groupIndex"
              :is-exclude="false"
              :editable="editable"
              :data-source-type-options="dataSourceTypeOptions"
              :date-type-options="dateTypeOptions"
              :dynamic-unit-options="dynamicUnitOptions"
              :get-field-options="getFieldOptions"
              :get-aggregation-options="getAggregationOptions"
              :get-operator-options="getOperatorOptions"
              :need-value-input="needValueInput"
              :get-value-placeholder="getValuePlaceholder"
              :on-data-source-type-change="onDataSourceTypeChange"
              :on-date-type-change="onDateTypeChange"
              :get-tag-options="getTagOptions"
              :get-tag-operator-options="getTagOperatorOptions"
              :need-tag-value-input="needTagValueInput"
              :get-tag-value-placeholder="getTagValuePlaceholder"
              :get-event-options="getEventOptions"
              :get-event-property-options="getEventPropertyOptions"
              :get-property-operator-options="getPropertyOperatorOptions"
              @delete-condition-group="deleteConditionGroup(groupIndex)"
              @toggle-group-logic="toggleGroupLogic"
              @add-condition-by-type="(type) => addConditionByType(group, type)"
              @remove-condition="(conditionIndex: number) => removeCondition(group, conditionIndex)"
              @add-tag-to-condition="(conditionIndex: number) => addTagToCondition(group, conditionIndex)"
              @remove-tag-from-condition="(conditionIndex: number) => removeTagFromCondition(group, conditionIndex)"
              @add-event-property="addEventProperty"
              @remove-event-property="(condition, propertyIndex) => removeEventProperty(condition, propertyIndex)"
              @update-group-name="handleUpdateGroupName"
            />

              
              <!-- 添加常规条件组按钮 -->
              <div class="add-condition-group-area" v-if="editable">
                <div class="add-group-buttons">
                  <a-button type="dashed" @click="addConditionGroup" class="add-group-btn">
                    <template #icon><IconPlus /></template>
                    添加条件组
                  </a-button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 排除条件组开关控制 -->
          <div v-if="editable" class="exclude-control-section">
            <div class="exclude-control-header">
              <span class="exclude-control-label">排除条件组</span>
              <a-switch 
                v-model="enableExcludeGroups" 
                size="small"
                @change="onExcludeGroupsToggle"
              />
            </div>
            <div v-if="enableExcludeGroups" class="exclude-control-description">
              开启后可以添加排除条件组，用于排除不符合条件的用户
            </div>
          </div>
          
          <!-- 排除条件组区域 -->
          <div v-if="enableExcludeGroups && excludeGroups.length > 0" class="exclude-groups-section">
            <div class="section-title exclude-title">排除条件组</div>
            
            <!-- 排除条件组列表 -->
            <div class="condition-groups-list">
              <ConditionGroup
                v-for="(group, groupIndex) in excludeGroups"
                :key="group.id || groupIndex"
                :group="group"
                :group-index="groupIndex"
                :is-exclude="true"
                :editable="editable"
                :data-source-type-options="dataSourceTypeOptions"
                :date-type-options="dateTypeOptions"
                :dynamic-unit-options="dynamicUnitOptions"
                :get-field-options="getFieldOptions"
                :get-aggregation-options="getAggregationOptions"
                :get-operator-options="getOperatorOptions"
                :need-value-input="needValueInput"
                :get-value-placeholder="getValuePlaceholder"
                :on-data-source-type-change="onDataSourceTypeChange"
                :on-date-type-change="onDateTypeChange"
                :get-tag-options="getTagOptions"
                :get-tag-operator-options="getTagOperatorOptions"
                :need-tag-value-input="needTagValueInput"
                :get-tag-value-placeholder="getTagValuePlaceholder"
                :get-event-options="getEventOptions"
                :get-event-property-options="getEventPropertyOptions"
                :get-property-operator-options="getPropertyOperatorOptions"
                @delete-condition-group="deleteExcludeConditionGroup(groupIndex)"
                @toggle-group-logic="toggleGroupLogic"
                @add-condition-by-type="(type) => addConditionByType(group, type)"
                @remove-condition="(conditionIndex: number) => removeCondition(group, conditionIndex)"
                @add-tag-to-condition="(conditionIndex: number) => addTagToCondition(group, conditionIndex)"
                @remove-tag-from-condition="(conditionIndex: number) => removeTagFromCondition(group, conditionIndex)"
                @add-event-property="addEventProperty"
                @remove-event-property="(condition, propertyIndex) => removeEventProperty(condition, propertyIndex)"
                @update-group-name="handleUpdateGroupName"
              />
            </div>
          </div>
          
          <!-- 添加排除条件组按钮 -->
          <div v-if="editable && enableExcludeGroups && excludeGroups.length === 0" class="add-exclude-group-area">
            <div class="add-group-buttons">
              <a-button type="dashed" @click="addExcludeConditionGroup" class="add-exclude-group-btn">
                <template #icon><IconPlus /></template>
                添加排除条件组
              </a-button>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, nextTick } from 'vue'
import { IconPlus, IconDown, IconRight, IconMinus } from '@arco-design/web-vue/es/icon'
import ConditionGroup from './ConditionGroup.vue'

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
  conditionGroups: ConditionGroup[]
  crossGroupLogic?: string
  editable?: boolean
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
  crossGroupLogic: 'or',
  editable: true,
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
  addConditionGroup: []
  addExcludeConditionGroup: []
  deleteConditionGroup: [groupIndex: number]
  deleteExcludeConditionGroup: [groupIndex: number]
  toggleGroupLogic: [group: ConditionGroup]
  toggleCrossGroupLogic: []
  addConditionByType: [group: ConditionGroup, type: string]
  removeCondition: [group: ConditionGroup, conditionIndex: number]
  addTagToCondition: [group: ConditionGroup, conditionIndex: number]
  removeTagFromCondition: [group: ConditionGroup, conditionIndex: number]
  addEventProperty: [condition: Condition]
  removeEventProperty: [condition: Condition, propertyIndex: number]
  updateGroupName: [group: ConditionGroup, newName: string]
}>()

// 响应式数据
const enableExcludeGroups = ref(false)

// 响应式状态
const collapsedSections = ref({
  tag: false,
  behavior: false,
  detail: false
})

// 计算属性
const regularGroups = computed(() => {
  return props.conditionGroups.filter(group => !group.isExclude)
})

const excludeGroups = computed(() => {
  return props.conditionGroups.filter(group => group.isExclude)
})

// 监听排除条件组的变化，如果有排除条件组则自动开启开关
const updateExcludeGroupsSwitch = () => {
  if (excludeGroups.value.length > 0) {
    enableExcludeGroups.value = true
  }
}

// 初始化时检查是否有排除条件组
updateExcludeGroupsSwitch()

// 方法
const addConditionGroup = () => {
  emit('addConditionGroup')
}

const addExcludeConditionGroup = () => {
  emit('addExcludeConditionGroup')
}

const deleteConditionGroup = (groupIndex: number) => {
  emit('deleteConditionGroup', groupIndex)
}

const deleteExcludeConditionGroup = (groupIndex: number) => {
  emit('deleteExcludeConditionGroup', groupIndex)
}

const toggleGroupLogic = (group: ConditionGroup) => {
  emit('toggleGroupLogic', group)
}

const toggleCrossGroupLogic = () => {
  emit('toggleCrossGroupLogic')
}

const addConditionByType = (group: ConditionGroup, type: string) => {
  emit('addConditionByType', group, type)
}

const removeCondition = (group: ConditionGroup, conditionIndex: number) => {
  emit('removeCondition', group, conditionIndex)
}

// 标签相关方法
const addTagToCondition = (group: ConditionGroup, conditionIndex: number) => {
  emit('addTagToCondition', group, conditionIndex)
}

const removeTagFromCondition = (group: ConditionGroup, conditionIndex: number) => {
  emit('removeTagFromCondition', group, conditionIndex)
}

// 事件相关方法
const addEventProperty = (condition: Condition) => {
  emit('addEventProperty', condition)
}

const removeEventProperty = (condition: Condition, propertyIndex: number) => {
  emit('removeEventProperty', condition, propertyIndex)
}

// 按类型获取条件
const getConditionsByType = (group: ConditionGroup, type: string) => {
  if (!group.conditions) return []
  
  switch (type) {
    case 'tag':
      return group.conditions.filter(condition => 
        condition.dataSourceType === 'attribute' || condition.dataSourceType === 'tag'
      )
    case 'behavior':
      return group.conditions.filter(condition => 
        condition.dataSourceType === 'behavior' || condition.dataSourceType === 'event'
      )
    case 'detail':
      return group.conditions.filter(condition => 
        condition.dataSourceType !== 'attribute' && 
        condition.dataSourceType !== 'tag' && 
        condition.dataSourceType !== 'behavior' && 
        condition.dataSourceType !== 'event'
      )
    default:
      return []
  }
}

// 从条件组中移除指定条件
const removeConditionFromGroup = (group: ConditionGroup, condition: Condition) => {
  const conditionIndex = group.conditions.findIndex(c => c.id === condition.id || c === condition)
  if (conditionIndex !== -1) {
    emit('removeCondition', group, conditionIndex)
  }
}

// 移除指定类型的最后一个条件
const removeLastConditionByType = (group: ConditionGroup, type: string) => {
  const conditionsOfType = getConditionsByType(group, type)
  if (conditionsOfType.length > 0) {
    const lastCondition = conditionsOfType[conditionsOfType.length - 1]
    removeConditionFromGroup(group, lastCondition)
  }
}

// 切换条件类型组的展开收起状态
const toggleSectionCollapse = (type: 'tag' | 'behavior' | 'detail') => {
  collapsedSections.value[type] = !collapsedSections.value[type]
}

// 为标签条件添加单个条件的加减号功能
const addTagConditionItem = (group: ConditionGroup, condition: Condition) => {
  emit('addConditionByType', group, 'tag')
}

const removeTagConditionItem = (group: ConditionGroup, condition: Condition) => {
  removeConditionFromGroup(group, condition)
}

// 排除条件组开关切换处理
const onExcludeGroupsToggle = (value: string | number | boolean) => {
  const boolValue = Boolean(value)
  if (!boolValue && excludeGroups.value.length > 0) {
    // 如果关闭开关且存在排除条件组，需要删除所有排除条件组
    // 这里可以添加确认对话框
    console.warn('关闭排除条件组功能将删除所有已创建的排除条件组')
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

// 处理条件组名称更新
const handleUpdateGroupName = (group: ConditionGroup, newName: string) => {
  group.name = newName
  group.isEditingName = false
  group.editingName = ''
}
</script>

<style scoped>
/* 简化的条件配置组件样式 */
.condition-config-component {
  width: 100%;
}

.condition-groups-section {
  margin-top: 16px;
}

.section-header {
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.section-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-info h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #1d2129;
}

.condition-count {
  font-size: 12px;
  color: #86909c;
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 8px;
}

.empty-condition-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  text-align: center;
  color: #86909c;
  border: 1px dashed #e0e0e0;
  border-radius: 4px;
  margin-top: 12px;
}

.empty-condition-state p {
  margin: 8px 0 12px 0;
  font-size: 13px;
}

.condition-groups-workspace {
  position: relative;
  margin-top: 12px;
}

.vertical-logic-line {
  position: absolute;
  left: -12px;
  top: 8px;
  width: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 3;
  height: calc(100% - 16px);
}

.logic-line-vertical {
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 1px;
  background: #d0d0d0;
  transform: translateX(-50%);
  z-index: 3;
  height: 100%;
}

.cross-group-logic-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 20px;
  border: 1px solid #d0d0d0;
  border-radius: 10px;
  background: white;
  font-size: 10px;
  font-weight: 500;
  color: #666;
  z-index: 4;
  transition: all 0.2s ease;
}

.cross-group-logic-indicator.clickable {
  cursor: pointer;
}

.cross-group-logic-indicator.clickable:hover {
  border-color: #165dff;
  color: #165dff;
}

.cross-group-logic-indicator.and {
  border-color: #165dff;
  color: #165dff;
}

.cross-group-logic-indicator.or {
  border-color: #ff7d00;
  color: #ff7d00;
}

.regular-groups-section,
.exclude-groups-section {
  margin-bottom: 16px;
}

.section-title {
  font-size: 14px;
  font-weight: 500;
  color: #1d2129;
  margin-bottom: 12px;
  padding: 6px 0;
  border-bottom: 1px solid #f0f0f0;
}

.section-title.exclude-title {
  color: #f53f3f;
}

.exclude-control-section {
  margin: 16px 0;
  padding: 12px;
  background: #fafafa;
  border-radius: 4px;
  border: 1px solid #f0f0f0;
}

.exclude-control-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.exclude-control-label {
  font-size: 13px;
  font-weight: 500;
  color: #1d2129;
}

.exclude-control-description {
  font-size: 11px;
  color: #86909c;
  line-height: 1.4;
}

.condition-groups-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
  z-index: 2;
}

.regular-groups-section .condition-groups-list {
  margin-left: 24px;
  padding: 8px 0;
}

.exclude-groups-section .condition-groups-list {
  margin-left: 0;
  padding: 0;
}

.add-exclude-group-area {
  margin-top: 16px;
  text-align: center;
}

.add-exclude-group-area .add-group-buttons {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.condition-group-card {
  background: white;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  overflow: hidden;
  transition: border-color 0.2s ease;
}

.condition-group-card:hover {
  border-color: #d0d0d0;
}

.condition-group-card.exclude-group {
  border-color: #ffccc7;
  background: #fffafa;
}

.condition-group-card.exclude-group:hover {
  border-color: #ff7875;
}

.condition-group-card.exclude-group .condition-group-header {
  background: #fff5f5;
  border-bottom-color: #ffe0e0;
}

.condition-group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
}

.group-title {
  display: flex;
  align-items: center;
  gap: 6px;
}

.group-title-content {
  display: flex;
  align-items: center;
  gap: 6px;
}

.group-name {
  font-weight: 500;
  color: #1d2129;
  font-size: 14px;
}

.exclude-group-label {
  display: inline-block;
  padding: 1px 4px;
  background: #ff4d4f;
  color: white;
  border-radius: 2px;
  font-size: 10px;
}

.group-count {
  font-size: 12px;
  color: #86909c;
  background: #f0f0f0;
  padding: 1px 6px;
  border-radius: 8px;
}

.group-actions {
  display: flex;
  gap: 4px;
}

.delete-group-btn {
  color: #f53f3f;
}

.delete-group-btn:hover {
  background: #ffece8;
  border-color: #f53f3f;
}

.rotate-180 {
  transform: rotate(180deg);
}

.conditions-list {
  position: relative;
  padding: 16px;
  padding-left: 48px;
}

.group-logic-line {
  position: absolute;
  left: 20px;
  top: 16px;
  width: 1px;
  z-index: 1;
  height: calc(100% - 32px - 48px);
}

.logic-line {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 1px;
  background: #d9d9d9;
}

.logic-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 20px;
  border: 1px solid #d9d9d9;
  border-radius: 10px;
  background: white;
  font-size: 11px;
  font-weight: 500;
  color: #666;
  z-index: 2;
  transition: border-color 0.2s ease;
}

.logic-indicator.clickable {
  cursor: pointer;
}

.logic-indicator.clickable:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.logic-indicator.and {
  border-color: #1890ff;
  color: #1890ff;
}

.logic-indicator.or {
  border-color: #fa8c16;
  color: #fa8c16;
}

.logic-text {
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
}

.condition-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  position: relative;
  z-index: 3;
  margin-bottom: 12px;
}

.condition-item:last-child {
  margin-bottom: 0;
}

.condition-item.excluded {
  opacity: 0.7;
}

.condition-item.excluded .condition-config {
  background: #fff5f5;
  border-left: 2px solid #ff4d4f;
}

.condition-connector {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  padding-top: 6px;
  margin-left: -32px;
  align-self: flex-start;
}

.condition-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: white;
  border: 2px solid #1890ff;
  position: relative;
  z-index: 4;
}

.attribute-spacer {
  visibility: hidden;
}

.condition-config {
  flex: 1;
  background: white;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  padding: 12px;
  transition: border-color 0.2s ease;
}

.condition-config:hover {
  border-color: #d0d0d0;
}

.exclude-indicator {
  margin-bottom: 8px;
}

.exclude-label {
  display: inline-block;
  padding: 2px 6px;
  background: #fff5f5;
  color: #ff4d4f;
  border-radius: 3px;
  font-size: 11px;
}

.condition-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-row {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  flex-wrap: wrap;
}

.form-row.primary {
  border-bottom: 1px solid #f5f5f5;
  padding-bottom: 8px;
}

.form-row.secondary {
  padding-top: 6px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 120px;
}

.form-group.wide {
  min-width: 200px;
}

.form-group.dynamic-time {
  min-width: 240px;
}

.form-label {
  font-size: 12px;
  color: #999;
  white-space: nowrap;
}

.form-control {
  min-width: 120px;
}

.form-control.wide {
  min-width: 180px;
}

.dynamic-time-inputs {
  display: flex;
  align-items: center;
  gap: 6px;
}

.dynamic-prefix {
  font-size: 12px;
  color: #86909c;
  white-space: nowrap;
}

.dynamic-value {
  width: 60px;
}

.dynamic-unit {
  width: 60px;
}

.condition-actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-top: 6px;
  flex-shrink: 0;
}

.action-btn {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e8e8e8;
  background: white;
  color: #999;
  transition: border-color 0.2s ease;
  cursor: pointer;
}

.action-btn:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.action-btn.danger:hover {
  border-color: #ff4d4f;
  color: #ff4d4f;
}

.add-condition-area {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed #f0f0f0;
}

.add-condition-buttons {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.add-condition-btn {
  border: 1px dashed #d9f7be;
  background: #f6ffed;
  color: #52c41a;
  transition: border-color 0.2s ease;
}

.add-condition-btn:hover {
  border-color: #52c41a;
}

.add-condition-type-area {
  margin: 12px 0;
  padding: 8px;
  background: #fafafa;
  border-radius: 4px;
  border: 1px dashed #e8e8e8;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.add-condition-type-btn {
  border: 1px dashed #d9f7be;
  background: #f6ffed;
  color: #52c41a;
  transition: border-color 0.2s ease;
}

.add-condition-type-btn:hover {
  border-color: #52c41a;
}

.add-condition-group-area {
  margin-top: 12px;
}

.add-group-buttons {
  display: flex;
  gap: 8px;
}

.add-group-btn {
  flex: 1;
  border: 1px dashed #d9f7be;
  background: #f6ffed;
  color: #52c41a;
  transition: border-color 0.2s ease;
}

.add-group-btn:hover {
  border-color: #52c41a;
}

.add-exclude-group-btn {
  flex: 1;
  border: 1px dashed #ffccc7;
  background: #fff5f5;
  color: #ff4d4f;
  transition: border-color 0.2s ease;
}

.add-exclude-group-btn:hover {
  border-color: #ff4d4f;
}

/* 标签类型特殊样式 */
.tag-config {
  position: relative;
}

.tag-actions {
  display: flex;
  align-items: center;
  gap: 3px;
  margin-left: 6px;
}

.tag-action-btn {
  width: 20px;
  height: 20px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
}

.tag-action-btn.add {
  color: #52c41a;
  background-color: #f6ffed;
  border: 1px solid #d9f7be;
}

.tag-action-btn.add:hover {
  border-color: #52c41a;
}

.tag-action-btn.remove {
  color: #ff4d4f;
  background-color: #fff5f5;
  border: 1px solid #ffccc7;
}

.tag-action-btn.remove:hover {
  border-color: #ff4d4f;
}

/* 事件类型特殊样式 */
.event-config {
  margin-bottom: 8px;
}

.event-properties {
  border-top: 1px solid #f0f0f0;
  padding-top: 8px;
  margin-top: 8px;
}

.condition-group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.group-name-wrapper {
  display: flex;
  align-items: center;
}

.group-name {
  font-weight: 500;
  color: #1d2129;
  cursor: default;
  padding: 2px 4px;
  border-radius: 3px;
  transition: background-color 0.2s ease;
}

.group-name.editable {
  cursor: pointer;
}

.group-name.editable:hover {
  background-color: #f5f5f5;
}

.group-name-input {
  min-width: 120px;
  max-width: 200px;
}

.event-properties-header .form-label {
  margin: 0;
}

.event-properties-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.event-property-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px;
  background-color: #fafafa;
  border-radius: 3px;
  border: 1px solid #f0f0f0;
}

.event-property-item .form-group {
  margin: 0;
  flex: 1;
}

.event-property-item .form-group:first-child {
  flex: 1.2;
}

.event-property-item .form-group:last-of-type {
  flex: 1.5;
}

.remove-property-btn {
  color: #ff4d4f;
  padding: 3px;
  min-width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.remove-property-btn:hover {
  background-color: #fff5f5;
  color: #ff4d4f;
}

/* 条件类型分组样式 */
.condition-type-group {
  margin-bottom: 12px;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  background: #fafafa;
}

.condition-type-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: #f5f5f5;
  border-bottom: 1px solid #f0f0f0;
  border-radius: 4px 4px 0 0;
}

.condition-type-header-with-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.condition-type-title-section {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;
}

.condition-type-buttons {
  display: flex;
  align-items: center;
  gap: 3px;
}

.condition-type-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
  color: #1d2129;
}

.condition-type-icon {
  width: 14px;
  height: 14px;
  color: #999;
}

.condition-type-count {
  font-size: 11px;
  color: #999;
  background: #f0f0f0;
  padding: 1px 4px;
  border-radius: 6px;
  margin-left: 3px;
}

.condition-type-actions {
  display: flex;
  align-items: center;
  gap: 3px;
}

.condition-type-add-btn {
  width: 20px;
  height: 20px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  color: #52c41a;
  background-color: #f6ffed;
  border: 1px solid #d9f7be;
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.condition-type-add-btn:hover {
  border-color: #52c41a;
}

.condition-type-content {
  padding: 12px;
}

.condition-type-empty {
  text-align: center;
  color: #999;
  font-size: 13px;
  padding: 16px;
  border: 1px dashed #f0f0f0;
  border-radius: 3px;
  background: white;
}

.condition-item-wrapper {
  margin-bottom: 8px;
  padding: 8px;
  background: white;
  border: 1px solid #f0f0f0;
  border-radius: 3px;
  position: relative;
}

.condition-item-wrapper:last-child {
  margin-bottom: 0;
}

.condition-item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.condition-item-actions {
  display: flex;
  align-items: center;
  gap: 3px;
}

.condition-remove-btn {
  width: 18px;
  height: 18px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 2px;
  color: #ff4d4f;
  background-color: #fff5f5;
  border: 1px solid #ffccc7;
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.condition-remove-btn:hover {
  border-color: #ff4d4f;
}

/* 展开收起按钮样式 */
.collapse-btn {
  width: 18px;
  height: 18px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: #999;
  cursor: pointer;
  transition: color 0.2s ease;
}

.collapse-btn:hover {
  color: #1890ff;
}

.condition-type-header {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.condition-type-header:hover {
  background-color: #f0f0f0;
}

/* 标签条件行内加减号按钮样式 */
.tag-actions {
  display: flex;
  align-items: center;
  gap: 3px;
  margin-left: 6px;
}

.tag-action-btn {
  width: 18px;
  height: 18px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 2px;
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.tag-action-btn.add-btn {
  color: #52c41a;
  background-color: #f6ffed;
  border: 1px solid #d9f7be;
}

.tag-action-btn.add-btn:hover {
  border-color: #52c41a;
}

.tag-action-btn.remove-btn {
  color: #ff4d4f;
  background-color: #fff5f5;
  border: 1px solid #ffccc7;
}

.tag-action-btn.remove-btn:hover {
  border-color: #ff4d4f;
}
</style>