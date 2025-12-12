<template>
  <div class="logic-tree-config">
    <!-- 包含逻辑树 -->
    <div class="logic-tree-section">
      <div class="logic-root-card include">
        <div class="logic-root-header">
          <div class="title">包含逻辑</div>
          <div class="controls" v-if="editable">
            <span class="label">跨组逻辑</span>
            <a-radio-group size="small" :model-value="crossGroupLogic" @change="onSetCrossGroupLogic">
              <a-radio value="and">且</a-radio>
              <a-radio value="or">或</a-radio>
            </a-radio-group>
          </div>
        </div>
        <div class="logic-root-content">
          <div v-if="regularGroups.length === 0" class="empty-state">
            <p>暂无包含条件组</p>
          </div>
          <div v-else class="group-list">
            <div
              v-for="(group, groupIndex) in regularGroups"
              :key="group.id || groupIndex"
              class="group-node"
            >
              <div class="group-node-header">
                <div class="group-title">
                  <span class="group-name" @click="startEditGroupName(group)" :class="{ editable }">{{ group.name || `条件组${groupIndex + 1}` }}</span>
                  <span class="group-count">{{ group.conditions?.length || 0 }} 项</span>
                </div>
                <div class="group-actions">
                  <a-button type="text" size="small" @click="emit('toggleGroupLogic', group)" :title="getLogicDescription(group.logic || 'and')">
                    <template #icon><span class="logic-badge">{{ group.logic === 'or' ? '或' : '且' }}</span></template>
                  </a-button>
                  <a-button v-if="editable" type="text" size="small" @click="emit('deleteConditionGroup', groupIndex)" title="删除条件组">
                    <template #icon><IconMinus /></template>
                  </a-button>
                </div>
              </div>

              <!-- 条件编辑（扁平化） -->
              <div class="group-node-content">
                <div v-if="group.conditions && group.conditions.length > 0" class="flat-conditions-list">
                  <div
                    v-for="(condition, cIndex) in group.conditions"
                    :key="condition.id || `c-${cIndex}`"
                    class="condition-item-flat"
                  >
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
                      @update-condition="handleUpdateCondition"
                      @remove-condition="emit('removeCondition', group, cIndex)"
                      @add-event-property="(cond: any) => emit('addEventProperty', cond)"
                      @remove-event-property="(cond: any, propertyIndex: number) => emit('removeEventProperty', cond, propertyIndex)"
                    />
                  </div>
                </div>
                <div class="add-condition-type-area" v-if="editable">
                  <a-button size="small" type="dashed" @click="emit('addConditionByType', group, 'tag')">
                    <template #icon><IconTag /></template>
                    添加标签条件
                  </a-button>
                  <a-button size="small" type="dashed" @click="emit('addConditionByType', group, 'behavior')">
                    <template #icon><IconInteraction /></template>
                    添加行为条件
                  </a-button>
                </div>
              </div>
            </div>

            <div class="add-group-area" v-if="editable"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 排除逻辑树 -->
    <div class="logic-tree-section">
      <div class="logic-root-card exclude">
        <div class="logic-root-header">
          <div class="title">排除逻辑</div>
          <div class="controls" v-if="editable">
            <span class="label">跨组逻辑</span>
            <a-radio-group size="small" :model-value="excludeCrossGroupLogicLocal" @change="onSetExcludeCrossGroupLogic">
              <a-radio value="and">且</a-radio>
              <a-radio value="or">或</a-radio>
            </a-radio-group>
          </div>
        </div>
        <div class="logic-root-content">
          <div class="exclude-toggle">
            <span class="label">启用排除条件组</span>
            <a-switch v-model="enableExcludeGroups" size="small" />
          </div>

          <div v-if="!enableExcludeGroups">
            <div class="empty-state muted">未启用排除条件组</div>
          </div>
          <div v-else>
            <div v-if="excludeGroups.length === 0" class="empty-state">
              <p>暂无排除条件组</p>
              <a-button type="primary" size="small" @click="addExcludeConditionGroup" :disabled="!editable">
                <template #icon><IconPlus /></template>
                添加排除条件组
              </a-button>
            </div>
            <div v-else class="group-list">
              <div
                v-for="(group, groupIndex) in excludeGroups"
                :key="group.id || groupIndex"
                class="group-node"
              >
                <div class="group-node-header">
                  <div class="group-title">
                    <span class="group-name" @click="startEditGroupName(group)" :class="{ editable }">{{ group.name || `排除组${groupIndex + 1}` }}</span>
                    <span class="group-count">{{ group.conditions?.length || 0 }} 项</span>
                  </div>
                  <div class="group-actions">
                    <a-button type="text" size="small" @click="emit('toggleGroupLogic', group)" :title="getLogicDescription(group.logic || 'and')">
                      <template #icon><span class="logic-badge">{{ group.logic === 'or' ? '或' : '且' }}</span></template>
                    </a-button>
                    <a-button v-if="editable" type="text" size="small" @click="emit('deleteExcludeConditionGroup', groupIndex)" title="删除排除条件组">
                      <template #icon><IconMinus /></template>
                    </a-button>
                  </div>
                </div>

                <div class="group-node-content">
                  <div v-if="group.conditions && group.conditions.length > 0" class="flat-conditions-list">
                    <div
                      v-for="(condition, cIndex) in group.conditions"
                      :key="condition.id || `c-${cIndex}`"
                      class="condition-item-flat"
                    >
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
                        @update-condition="handleUpdateCondition"
                        @remove-condition="emit('removeCondition', group, cIndex)"
                        @add-event-property="(cond: any) => emit('addEventProperty', cond)"
                        @remove-event-property="(cond: any, propertyIndex: number) => emit('removeEventProperty', cond, propertyIndex)"
                      />
                    </div>
                  </div>
                  <div class="add-condition-type-area" v-if="editable">
                    <a-button size="small" type="dashed" @click="emit('addConditionByType', group, 'tag')">
                      <template #icon><IconTag /></template>
                      添加标签条件
                    </a-button>
                    <a-button size="small" type="dashed" @click="emit('addConditionByType', group, 'behavior')">
                      <template #icon><IconInteraction /></template>
                      添加行为条件
                    </a-button>
                  </div>
                </div>
              </div>
              <div class="add-group-area" v-if="editable">
                <a-button type="dashed" size="small" @click="addExcludeConditionGroup">
                  <template #icon><IconPlus /></template>
                  添加排除条件组
                </a-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { IconPlus, IconMinus, IconTag, IconInteraction, IconStorage } from '@arco-design/web-vue/es/icon'
import TagConditionForm from './TagConditionForm.vue'
import BehaviorConditionForm from './BehaviorConditionForm.vue'
import DetailConditionForm from './DetailConditionForm.vue'

interface EventProperty { name?: string; operator?: string; value?: string }
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
  tagPath?: string[]
  eventName?: string
  eventProperties?: EventProperty[]
}
interface ConditionGroupType {
  id?: string
  name?: string
  logic?: string
  collapsed?: boolean
  isExclude?: boolean
  conditions: Condition[]
  isEditingName?: boolean
  editingName?: string
}
interface Option { label: string; value: string }

const props = withDefaults(defineProps<{
  conditionGroups: ConditionGroupType[]
  crossGroupLogic?: string
  excludeCrossGroupLogic?: string
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
  getTagOptions?: (() => Option[]) | null
  getTagOperatorOptions?: (() => Option[]) | null
  needTagValueInput?: ((condition: Condition) => boolean) | null
  getTagValuePlaceholder?: ((condition: Condition) => string) | null
  getEventOptions?: (() => Option[]) | null
  getEventPropertyOptions?: ((eventName: string) => Option[]) | null
  getPropertyOperatorOptions?: (() => Option[]) | null
}>(), {
  crossGroupLogic: 'or',
  excludeCrossGroupLogic: 'or',
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
  getTagOptions: null,
  getTagOperatorOptions: null,
  needTagValueInput: null,
  getTagValuePlaceholder: null,
  getEventOptions: null,
  getEventPropertyOptions: null,
  getPropertyOperatorOptions: null
})

const emit = defineEmits<{
  addConditionGroup: []
  addExcludeConditionGroup: []
  deleteConditionGroup: [groupIndex: number]
  deleteExcludeConditionGroup: [groupIndex: number]
  toggleGroupLogic: [group: ConditionGroupType]
  setCrossGroupLogic: [value: string]
  setExcludeCrossGroupLogic: [value: string]
  addConditionByType: [group: ConditionGroupType, type: string]
  removeCondition: [group: ConditionGroupType, conditionIndex: number]
  addEventProperty: [condition: Condition]
  removeEventProperty: [condition: Condition, propertyIndex: number]
  updateGroupName: [group: ConditionGroupType, newName: string]
  updateCondition: [condition: Condition]
}>()

const enableExcludeGroups = ref(false)
const excludeCrossGroupLogicLocal = ref(props.excludeCrossGroupLogic || 'or')

const regularGroups = computed(() => props.conditionGroups.filter(g => !g.isExclude))
const excludeGroups = computed(() => props.conditionGroups.filter(g => g.isExclude))

const addConditionGroup = () => emit('addConditionGroup')
const addExcludeConditionGroup = () => emit('addExcludeConditionGroup')
const onSetCrossGroupLogic = (value: string | number | boolean) => emit('setCrossGroupLogic', String(value))
const onSetExcludeCrossGroupLogic = (value: string | number | boolean) => {
  excludeCrossGroupLogicLocal.value = String(value)
  emit('setExcludeCrossGroupLogic', String(value))
}

const startEditGroupName = (group: ConditionGroupType) => {
  if (!props.editable) return
  group.isEditingName = true
  group.editingName = group.name || ''
}

const handleUpdateGroupName = (group: ConditionGroupType, newName: string) => {
  group.name = newName
  group.isEditingName = false
  group.editingName = ''
  emit('updateGroupName', group, newName)
}

const handleUpdateCondition = (condition: Condition) => {
  emit('updateCondition', condition)
}

const getLogicDescription = (logic: string) => (logic === 'and' ? '所有条件都必须满足' : '任一条件满足即可')

// 条件类型判断与组件选择（扁平渲染）
const isTagCondition = (condition: Condition) => condition?.dataSourceType === 'attribute' || condition?.dataSourceType === 'tag'
const isBehaviorCondition = (condition: Condition) => condition?.dataSourceType === 'behavior' || condition?.dataSourceType === 'event'
const isDetailCondition = (condition: Condition) => condition?.dataSourceType === 'detail'

const getConditionComponent = (condition: Condition) => {
  if (isTagCondition(condition)) return TagConditionForm
  if (isBehaviorCondition(condition)) return BehaviorConditionForm
  if (isDetailCondition(condition)) return DetailConditionForm
  return TagConditionForm
}
</script>

<style scoped>
.logic-tree-config {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}


.logic-root-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #ffffff;
}

.logic-root-card.include .logic-root-header {
  background: #f8fafc;
}

.logic-root-card.exclude .logic-root-header {
  background: #fff5f5;
}

.logic-root-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
}

.title { font-weight: 600; color: #1d2129; }
.controls { display: inline-flex; align-items: center; gap: 8px; }
.label { font-size: 12px; color: #86909c; }

.logic-root-content { padding: 12px 16px; }

.empty-state { text-align: center; color: #6b7280; padding: 12px; }
.empty-state.muted { color: #a3a3a3; }

.group-list { display: flex; flex-direction: column; gap: 12px; }

.group-node { border: 1px solid var(--color-border-2); border-radius: 8px; overflow: hidden; }
.group-node-header { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; background: var(--color-fill-1); border-bottom: 1px solid var(--color-border-2); }
.group-title { display: flex; align-items: center; gap: 8px; }
.group-name { font-weight: 500; color: #374151; }
.group-name.editable { cursor: pointer; }
.group-count { font-size: 12px; color: #86909c; background: #f0f0f0; padding: 1px 6px; border-radius: 8px; }
.group-actions { display: inline-flex; gap: 4px; }
.logic-badge { display: inline-block; min-width: 28px; text-align: center; border: 1px solid #d9d9d9; border-radius: 10px; font-size: 11px; color: #666; padding: 0 6px; background: #fff; }

.group-node-content { background: var(--color-bg-2); padding: 12px 12px; }

.flat-conditions-list { display: flex; flex-direction: column; gap: 8px; }
.condition-item-flat { background: transparent; border: none; padding: 0; }

.add-condition-type-area { display: flex; gap: 8px; margin-top: 8px; }

.add-group-area { text-align: center; }

.exclude-toggle { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }

/* 始终使用上下结构布局 */
</style>
