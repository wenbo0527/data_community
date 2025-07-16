<template>
  <div class="condition-group-card" :class="{ 'exclude-group': group.isExclude }">
    <!-- 条件组头部 -->
    <div class="condition-group-header">
      <div class="group-info">
        <div class="group-title-section">
          <div class="group-name-wrapper">
            <span 
              v-if="!group.isEditingName"
              class="group-title"
              :class="{ 'editable': editable }"
              @dblclick="editable && startEditGroupName(group)"
              :title="editable ? '双击编辑名称' : ''"
            >
              {{ group.name || '条件组' }}
            </span>
            <a-input 
              v-else
              v-model="group.editingName"
              size="small"
              class="group-name-input"
              @blur="saveGroupName(group)"
              @keyup.enter="saveGroupName(group)"
              @keyup.esc="cancelEditGroupName(group)"
              ref="groupNameInput"
            />
          </div>
          <span class="condition-count">({{ group.conditions?.length || 0 }})</span>
        </div>
        
        <!-- 排除条件标识 -->
        <div v-if="group.isExclude" class="exclude-indicator">
          <span class="exclude-label">排除条件</span>
        </div>
      </div>
      
      <div class="group-actions" v-if="editable">
        <a-tooltip content="切换逻辑">
          <a-button 
            type="text" 
            size="small" 
            @click="$emit('toggleGroupLogic', group)" 
            class="logic-btn"
          >
            {{ group.logic === 'and' ? 'AND' : 'OR' }}
          </a-button>
        </a-tooltip>
        
        <a-tooltip content="删除条件组">
          <a-button 
            type="text" 
            size="small" 
            @click="$emit('deleteConditionGroup')" 
            class="action-btn danger"
          >
            <IconMinus />
          </a-button>
        </a-tooltip>
      </div>
    </div>
    
    <!-- 条件组内容 -->
    <div class="condition-group-content">
      <!-- 空状态 -->
      <div v-if="!group.conditions || group.conditions.length === 0" class="empty-conditions">
        <p>暂无条件，请添加条件</p>
      </div>
      
      <!-- 条件列表 -->
      <div v-else class="conditions-list">
        <!-- 标签条件组 -->
        <div v-if="tagConditions.length > 0" class="condition-type-group">
          <div class="condition-type-header" @click="toggleSectionCollapse('tag')">
            <div class="condition-type-header-with-actions">
              <div class="condition-type-title-section">
                <div class="condition-type-buttons">
                  <a-button 
                    type="text" 
                    size="mini" 
                    @click.stop="toggleSectionCollapse('tag')" 
                    class="collapse-btn"
                  >
                    <IconDown v-if="!collapsedSections.tag" />
                    <IconRight v-else />
                  </a-button>
                </div>
                <span class="condition-type-title">标签条件</span>
                <span class="condition-type-count">({{ tagConditions.length }})</span>
              </div>
              
              <div v-if="editable" class="condition-type-actions">
                <a-tooltip content="添加标签条件">
                  <a-button 
                    type="text" 
                    size="mini" 
                    @click.stop="$emit('addConditionByType', 'tag')" 
                    class="condition-type-add-btn"
                  >
                    <IconPlus />
                  </a-button>
                </a-tooltip>
              </div>
            </div>
          </div>
          
          <div v-if="!collapsedSections.tag" class="condition-type-content">
            <template v-for="(condition, conditionIndex) in tagConditions" :key="condition.id || conditionIndex">
              <!-- 条件间逻辑连接符 -->
              <div v-if="conditionIndex > 0" class="condition-logic-connector">
                <div class="logic-line"></div>
                <span class="logic-text">{{ group.logic === 'and' ? '且' : '或' }}</span>
                <div class="logic-line"></div>
              </div>
              
              <div class="condition-item-wrapper">
              <!-- 条件项头部 -->
              <div class="condition-item-header">
                <div class="condition-item-info">
                  <span class="condition-index">{{ conditionIndex + 1 }}</span>
                </div>
                
                <div class="condition-item-actions" v-if="editable">
                  <a-tooltip content="删除条件">
                    <a-button 
                      type="text" 
                      size="mini" 
                      @click="removeConditionByIndex(condition)" 
                      class="condition-remove-btn"
                    >
                      <IconMinus />
                    </a-button>
                  </a-tooltip>
                </div>
              </div>
              
              <!-- 标签条件配置 -->
              <div class="tag-condition-row">
                <div class="tag-config">
                  <div class="form-group">
                    <label class="form-label">标签</label>
                    <a-select 
                      v-model="condition.tagPath" 
                      size="small" 
                      class="form-control"
                      placeholder="选择标签"
                      :options="getTagOptions && getTagOptions() || []"
                      allow-search
                      :disabled="!editable"
                    />
                  </div>
                  
                  <div class="form-group">
                    <label class="form-label">操作符</label>
                    <a-select 
                      v-model="condition.operator" 
                      size="small" 
                      class="form-control"
                      :options="getTagOperatorOptions && getTagOperatorOptions() || []"
                      :disabled="!editable"
                    />
                  </div>
                  
                  <!-- 标签值输入框 -->
                  <div v-if="needTagValueInput && needTagValueInput(condition)" class="form-group">
                    <label class="form-label">值</label>
                    <a-input 
                      v-model="condition.value" 
                      size="small" 
                      class="form-control"
                      :placeholder="getTagValuePlaceholder && getTagValuePlaceholder(condition) || '请输入值'"
                      :disabled="!editable"
                    />
                  </div>
                </div>
                
                <!-- 标签行内加减号 -->
                <div v-if="editable" class="tag-actions">
                  <a-tooltip content="添加标签条件">
                    <a-button 
                      type="text" 
                      size="mini" 
                      @click="$emit('addConditionByType', 'tag')" 
                      class="tag-action-btn add-btn"
                    >
                      <IconPlus />
                    </a-button>
                  </a-tooltip>
                  
                  <a-tooltip content="删除标签条件">
                    <a-button 
                      type="text" 
                      size="mini" 
                      @click="removeConditionByIndex(condition)" 
                      class="tag-action-btn remove-btn"
                    >
                      <IconMinus />
                    </a-button>
                  </a-tooltip>
                </div>
              </div>
              </div>
            </template>
          </div>
        </div>
        
        <!-- 行为条件组 -->
        <div v-if="behaviorConditions.length > 0" class="condition-type-group">
          <div class="condition-type-header" @click="toggleSectionCollapse('behavior')">
            <div class="condition-type-header-with-actions">
              <div class="condition-type-title-section">
                <div class="condition-type-buttons">
                  <a-button 
                    type="text" 
                    size="mini" 
                    @click.stop="toggleSectionCollapse('behavior')" 
                    class="collapse-btn"
                  >
                    <IconDown v-if="!collapsedSections.behavior" />
                    <IconRight v-else />
                  </a-button>
                </div>
                <span class="condition-type-title">行为条件</span>
                <span class="condition-type-count">({{ behaviorConditions.length }})</span>
              </div>
              
              <div v-if="editable" class="condition-type-actions">
                <a-tooltip content="添加行为条件">
                  <a-button 
                    type="text" 
                    size="mini" 
                    @click.stop="$emit('addConditionByType', 'behavior')" 
                    class="condition-type-add-btn"
                  >
                    <IconPlus />
                  </a-button>
                </a-tooltip>
              </div>
            </div>
          </div>
          
          <div v-if="!collapsedSections.behavior" class="condition-type-content">
            <template v-for="(condition, conditionIndex) in behaviorConditions" :key="condition.id || conditionIndex">
              <!-- 条件间逻辑连接符 -->
              <div v-if="conditionIndex > 0" class="condition-logic-connector">
                <div class="logic-line"></div>
                <span class="logic-text">{{ group.logic === 'and' ? '且' : '或' }}</span>
                <div class="logic-line"></div>
              </div>
              
              <div class="condition-item-wrapper">
              <!-- 条件项头部 -->
              <div class="condition-item-header">
                <div class="condition-item-info">
                  <span class="condition-index">{{ conditionIndex + 1 }}</span>
                </div>
                
                <div class="condition-item-actions" v-if="editable">
                  <a-tooltip content="删除条件">
                    <a-button 
                      type="text" 
                      size="mini" 
                      @click="removeConditionByIndex(condition)" 
                      class="condition-remove-btn"
                    >
                      <IconMinus />
                    </a-button>
                  </a-tooltip>
                </div>
              </div>
              
              <!-- 事件配置 -->
              <div class="event-config">
                <div class="form-group">
                  <label class="form-label">事件名称</label>
                  <a-select 
                    v-model="condition.eventName" 
                    size="small" 
                    class="form-control"
                    placeholder="选择事件"
                    :options="getEventOptions && getEventOptions() || []"
                    allow-search
                    :disabled="!editable"
                  />
                </div>
                
                <!-- 事件属性配置 -->
                <div v-if="condition.eventProperties && condition.eventProperties.length > 0" class="event-properties">
                  <div class="event-properties-header">
                    <label class="form-label">事件属性</label>
                  </div>
                  
                  <div class="event-properties-list">
                    <div 
                      v-for="(property, propertyIndex) in condition.eventProperties" 
                      :key="propertyIndex"
                      class="event-property-item"
                    >
                      <a-select 
                        v-model="property.name" 
                        size="small" 
                        class="property-name"
                        placeholder="属性名"
                        :options="getEventPropertyOptions && condition.eventName ? getEventPropertyOptions(condition.eventName) : []"
                        allow-search
                        :disabled="!editable"
                      />
                      
                      <a-select 
                        v-model="property.operator" 
                        size="small" 
                        class="property-operator"
                        :options="getPropertyOperatorOptions && getPropertyOperatorOptions() || []"
                        :disabled="!editable"
                      />
                      
                      <a-input 
                        v-model="property.value" 
                        size="small" 
                        class="property-value"
                        placeholder="属性值"
                        :disabled="!editable"
                      />
                      
                      <a-button 
                        v-if="editable"
                        type="text" 
                        size="mini" 
                        @click="$emit('removeEventProperty', condition, propertyIndex)" 
                        class="remove-property-btn"
                      >
                        <IconMinus />
                      </a-button>
                    </div>
                  </div>
                  
                  <a-button 
                    v-if="editable"
                    type="dashed" 
                    size="small" 
                    @click="$emit('addEventProperty', condition)" 
                    class="add-property-btn"
                  >
                    <template #icon><IconPlus /></template>
                    添加属性
                  </a-button>
                </div>
              </div>
              </div>
            </template>
          </div>
        </div>
        
        <!-- 明细数据条件组 -->
        <div v-if="detailConditions.length > 0" class="condition-type-group">
          <div class="condition-type-header" @click="toggleSectionCollapse('detail')">
            <div class="condition-type-header-with-actions">
              <div class="condition-type-title-section">
                <div class="condition-type-buttons">
                  <a-button 
                    type="text" 
                    size="mini" 
                    @click.stop="toggleSectionCollapse('detail')" 
                    class="collapse-btn"
                  >
                    <IconDown v-if="!collapsedSections.detail" />
                    <IconRight v-else />
                  </a-button>
                </div>
                <span class="condition-type-title">明细数据条件</span>
                <span class="condition-type-count">({{ detailConditions.length }})</span>
              </div>
              
              <div v-if="editable" class="condition-type-actions">
                <a-tooltip content="添加明细数据条件">
                  <a-button 
                    type="text" 
                    size="mini" 
                    @click.stop="$emit('addConditionByType', 'detail')" 
                    class="condition-type-add-btn"
                  >
                    <IconPlus />
                  </a-button>
                </a-tooltip>
              </div>
            </div>
          </div>
          
          <div v-if="!collapsedSections.detail" class="condition-type-content">
            <template v-for="(condition, conditionIndex) in detailConditions" :key="condition.id || conditionIndex">
              <!-- 条件间逻辑连接符 -->
              <div v-if="conditionIndex > 0" class="condition-logic-connector">
                <div class="logic-line"></div>
                <span class="logic-text">{{ group.logic === 'and' ? '且' : '或' }}</span>
                <div class="logic-line"></div>
              </div>
              
              <div class="condition-item-wrapper">
              <!-- 条件项头部 -->
              <div class="condition-item-header">
                <div class="condition-item-info">
                  <span class="condition-index">{{ conditionIndex + 1 }}</span>
                </div>
                
                <div class="condition-item-actions" v-if="editable">
                  <a-tooltip content="删除条件">
                    <a-button 
                      type="text" 
                      size="mini" 
                      @click="removeConditionByIndex(condition)" 
                      class="condition-remove-btn"
                    >
                      <IconMinus />
                    </a-button>
                  </a-tooltip>
                </div>
              </div>
              
              <!-- 条件配置表单 -->
              <div class="condition-form">
                <div class="form-row primary">
                  <div class="form-group">
                    <label class="form-label">数据源</label>
                    <a-select 
                      v-model="condition.dataSourceType" 
                      size="small" 
                      class="form-control"
                      :options="dataSourceTypeOptions"
                      @change="onDataSourceTypeChange && onDataSourceTypeChange(condition)"
                      :disabled="!editable"
                    />
                  </div>
                  
                  <div class="form-group">
                    <label class="form-label">字段</label>
                    <a-select 
                      v-model="condition.fieldName" 
                      size="small" 
                      class="form-control wide"
                      placeholder="选择字段"
                      :options="getFieldOptions && condition.dataSourceType ? getFieldOptions(condition.dataSourceType) : []"
                      allow-search
                      :disabled="!editable"
                    />
                  </div>
                  
                  <div v-if="condition.dataSourceType === 'detail' || condition.dataSourceType === 'behavior'" class="form-group">
                    <label class="form-label">聚合</label>
                    <a-select 
                      v-model="condition.aggregationType" 
                      size="small" 
                      class="form-control"
                      :options="getAggregationOptions && condition.dataSourceType ? getAggregationOptions(condition.dataSourceType) : []"
                      :disabled="!editable"
                    />
                  </div>
                  
                  <div class="form-group">
                    <label class="form-label">条件</label>
                    <a-select 
                      v-model="condition.operator" 
                      size="small" 
                      class="form-control"
                      :options="getOperatorOptions && getOperatorOptions(condition) || []"
                      :disabled="!editable"
                    />
                  </div>
                  
                  <div v-if="needValueInput && needValueInput(condition)" class="form-group">
                    <label class="form-label">值</label>
                    <a-input 
                      v-model="condition.value" 
                      size="small" 
                      class="form-control"
                      :placeholder="getValuePlaceholder && getValuePlaceholder(condition) || '请输入值'"
                      :disabled="!editable"
                    />
                  </div>
                </div>
                
                <!-- 时间配置行 -->
                <div v-if="condition.dataSourceType !== 'attribute'" class="form-row secondary">
                  <div class="form-group">
                    <label class="form-label">时间类型</label>
                    <a-select 
                      v-model="condition.dateType" 
                      size="small" 
                      class="form-control"
                      :options="dateTypeOptions"
                      @change="onDateTypeChange && onDateTypeChange(condition)"
                      :disabled="!editable"
                    />
                  </div>
                  
                  <div v-if="condition.dateType === 'fixed'" class="form-group wide">
                    <label class="form-label">时间范围</label>
                    <a-range-picker 
                      v-model="condition.dateRange" 
                      size="small" 
                      class="form-control"
                      format="YYYY-MM-DD"
                      :disabled="!editable"
                    />
                  </div>
                  
                  <div v-else-if="condition.dateType === 'dynamic'" class="form-group dynamic-time">
                    <label class="form-label">动态时间</label>
                    <div class="dynamic-time-inputs">
                      <span class="dynamic-prefix">近</span>
                      <a-input-number 
                        v-model="condition.dynamicValue" 
                        size="small" 
                        class="dynamic-value"
                        :min="1"
                        :disabled="!editable"
                      />
                      <a-select 
                        v-model="condition.dynamicUnit" 
                        size="small" 
                        class="dynamic-unit"
                        :options="dynamicUnitOptions"
                        :disabled="!editable"
                      />
                    </div>
                  </div>
                </div>
              </div>
              </div>
            </template>
          </div>
        </div>
      </div>
      
      <!-- 添加条件按钮组 -->
      <div class="add-condition-area" v-if="editable">
        <div class="add-condition-buttons">
          <a-button type="dashed" size="small" @click="$emit('addConditionByType', 'tag')" class="add-condition-btn">
            <template #icon><IconPlus /></template>
            添加属性
          </a-button>
          <a-button type="dashed" size="small" @click="$emit('addConditionByType', 'behavior')" class="add-condition-btn">
            <template #icon><IconPlus /></template>
            添加行为
          </a-button>
          <a-button type="dashed" size="small" @click="$emit('addConditionByType', 'detail')" class="add-condition-btn">
            <template #icon><IconPlus /></template>
            添加明细数据
          </a-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, nextTick } from 'vue'
import { IconPlus, IconDown, IconRight, IconMinus } from '@arco-design/web-vue/es/icon'

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
}>()

// 响应式状态
const collapsedSections = ref({
  tag: false,
  behavior: false,
  detail: false
})

// 计算属性 - 按类型分组条件
const tagConditions = computed(() => {
  if (!props.group.conditions) return []
  return props.group.conditions.filter(condition => 
    condition.dataSourceType === 'attribute' || condition.dataSourceType === 'tag'
  )
})

const behaviorConditions = computed(() => {
  if (!props.group.conditions) return []
  return props.group.conditions.filter(condition => 
    condition.dataSourceType === 'behavior' || condition.dataSourceType === 'event'
  )
})

const detailConditions = computed(() => {
  if (!props.group.conditions) return []
  return props.group.conditions.filter(condition => 
    condition.dataSourceType !== 'attribute' && 
    condition.dataSourceType !== 'tag' && 
    condition.dataSourceType !== 'behavior' && 
    condition.dataSourceType !== 'event'
  )
})

// 方法
const toggleSectionCollapse = (type: 'tag' | 'behavior' | 'detail') => {
  collapsedSections.value[type] = !collapsedSections.value[type]
}

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
</script>

<style scoped>
/* 条件组卡片样式 */
.condition-group-card {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background: white;
  margin-bottom: 12px;
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
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
}

.group-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.group-title-section {
  display: flex;
  align-items: center;
  gap: 6px;
}

.group-title {
  font-size: 14px;
  font-weight: 500;
  color: #1d2129;
}

.condition-count {
  font-size: 11px;
  color: #86909c;
  background: #f0f0f0;
  padding: 1px 4px;
  border-radius: 6px;
}

.exclude-indicator {
  display: inline-flex;
  align-items: center;
}

.exclude-label {
  display: inline-block;
  padding: 2px 6px;
  background: #fff5f5;
  color: #ff4d4f;
  border-radius: 3px;
  font-size: 11px;
}

.group-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.logic-btn {
  font-size: 10px;
  font-weight: 500;
  color: #165dff;
  border: 1px solid #165dff;
  border-radius: 6px;
  padding: 2px 6px;
  height: auto;
  min-width: 32px;
  transition: all 0.2s ease;
}

.logic-btn:hover {
  background: #e8f3ff;
}

.action-btn {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 1px solid #d0d0d0;
  color: #666;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  border-color: #165dff;
  color: #165dff;
}

.action-btn.danger:hover {
  border-color: #f53f3f;
  color: #f53f3f;
}

.condition-group-content {
  padding: 16px;
}

.empty-conditions {
  text-align: center;
  padding: 24px;
  color: #86909c;
  font-size: 13px;
}

.empty-conditions p {
  margin: 0;
}

/* 条件类型分组样式 */
.condition-type-group {
  margin-bottom: 16px;
}

.condition-type-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 8px;
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.condition-type-header:hover {
  background: #f0f0f0;
}

.condition-type-header-with-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.condition-type-title-section {
  display: flex;
  align-items: center;
  gap: 4px;
}

.condition-type-buttons {
  display: flex;
  align-items: center;
}

.condition-type-title {
  font-size: 12px;
  font-weight: 500;
  color: #1d2129;
}

.condition-type-count {
  font-size: 10px;
  color: #86909c;
  background: #f0f0f0;
  padding: 1px 4px;
  border-radius: 6px;
}

.condition-type-actions {
  display: flex;
  align-items: center;
}

.condition-type-add-btn {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  color: #165dff;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.condition-type-add-btn:hover {
  background: #e8f3ff;
}

.collapse-btn {
  width: 24px;
  height: 24px;
  color: #666;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.collapse-btn:hover {
  color: #165dff;
}

.condition-type-content {
  padding: 8px 0 0 0;
}

/* 条件项样式 */
.condition-item-wrapper {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  margin-bottom: 8px;
  background: white;
}

.condition-item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
}

.condition-item-info {
  display: flex;
  align-items: center;
  gap: 6px;
}

.condition-index {
  font-size: 10px;
  color: #86909c;
  background: #f0f0f0;
  padding: 1px 4px;
  border-radius: 6px;
  min-width: 16px;
  text-align: center;
}

.condition-item-actions {
  display: flex;
  align-items: center;
}

.condition-remove-btn {
  width: 24px;
  height: 24px;
  color: #f53f3f;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.condition-remove-btn:hover {
  background: #ffece8;
}

/* 标签条件样式 */
.tag-condition-row {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 12px;
}

.tag-config {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  flex: 1;
}

.tag-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: 8px;
}

.tag-action-btn {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tag-action-btn.add-btn {
  color: #165dff;
  background: transparent;
  border: 1px solid #165dff;
}

.tag-action-btn.add-btn:hover {
  background: #e8f3ff;
  border-color: #165dff;
}

.tag-action-btn.remove-btn {
  color: #f53f3f;
  background: transparent;
  border: 1px solid #f53f3f;
}

.tag-action-btn.remove-btn:hover {
  background: #ffece8;
  border-color: #f53f3f;
}

/* 事件配置样式 */
.event-config {
  padding: 12px;
}

.event-properties {
  border-top: 1px solid #f0f0f0;
  padding-top: 8px;
  margin-top: 8px;
}

.event-properties-header {
  margin-bottom: 6px;
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
  background: #fafafa;
  border-radius: 4px;
  border: 1px solid #f0f0f0;
}

.property-name {
  flex: 2;
}

.property-operator {
  flex: 1;
}

.property-value {
  flex: 2;
}

.remove-property-btn {
  color: #f53f3f;
  padding: 0;
  min-width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-property-btn:hover {
  background: #ffece8;
  color: #f53f3f;
}

.add-property-btn {
  margin-top: 6px;
  font-size: 11px;
}

/* 表单样式 */
.condition-form {
  padding: 12px;
}

.form-row {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  margin-bottom: 8px;
}

.form-row.secondary {
  border-top: 1px solid #f0f0f0;
  padding-top: 8px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 100px;
}

.form-group.wide {
  flex: 2;
}

.form-group.dynamic-time {
  flex: 2;
}

.form-label {
  font-size: 11px;
  color: #666;
  margin: 0;
}

.form-control {
  font-size: 12px;
}

.dynamic-time-inputs {
  display: flex;
  align-items: center;
  gap: 4px;
}

.dynamic-prefix {
  font-size: 12px;
  color: #666;
}

.dynamic-value {
  width: 60px;
}

.dynamic-unit {
  width: 60px;
}

/* 添加条件区域样式 */
.add-condition-area {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.add-condition-buttons {
  display: flex;
  gap: 8px;
}

.add-condition-btn {
  font-size: 11px;
  border: 1px solid #d0d0d0;
  transition: all 0.2s ease;
}

/* 条件间逻辑连接符样式 */
.condition-logic-connector {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 8px 0;
  gap: 8px;
}

.logic-line {
  flex: 1;
  height: 1px;
  background: #e0e0e0;
}

.logic-text {
  font-size: 11px;
  color: #666;
  background: #f8f9fa;
  padding: 2px 8px;
  border-radius: 10px;
  border: 1px solid #e0e0e0;
  white-space: nowrap;
}

.add-condition-btn:hover {
  border-color: #165dff;
  color: #165dff;
}
</style>