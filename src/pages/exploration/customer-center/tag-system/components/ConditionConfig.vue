<template>
  <div class="condition-config">
    <!-- 空状态 -->
    <div v-if="conditionGroups.length === 0" class="empty-condition-state">
      <icon-plus style="font-size: 32px; color: #c9cdd4;" />
      <p>暂无条件组，请创建第一个条件组</p>
      <a-button type="primary" @click="$emit('add-condition-group')">
        <template #icon><icon-plus /></template>
        创建第一个条件组
      </a-button>
    </div>

    <!-- 条件组列表 -->
    <div v-else class="conditions-list">
      <div v-for="(group, groupIndex) in conditionGroups" :key="groupIndex" class="condition-group">
        <!-- 条件组头部 -->
        <div class="condition-group-header">
          <div class="group-info">
            <div class="group-title">
              <span>条件组 {{ groupIndex + 1 }}</span>
              <span class="condition-count">{{ group.conditions.length }} 个条件</span>
            </div>
            <div class="group-logic" v-if="group.conditions.length > 1">
              <span class="logic-label">组内逻辑：</span>
              <div class="logic-indicator" @click="$emit('toggle-group-logic', groupIndex)">
                {{ (group.logic || 'and').toUpperCase() }}
              </div>
            </div>
          </div>
          <div class="group-actions" v-if="editable">
            <a-button type="text" size="small" @click="toggleGroupCollapse(groupIndex)">
              <template #icon>
                <icon-down v-if="!group.collapsed" />
                <icon-right v-else />
              </template>
            </a-button>
            <a-button type="text" size="small" status="danger" @click="$emit('delete-condition-group', groupIndex)">
              <template #icon><icon-delete /></template>
            </a-button>
          </div>
        </div>

        <!-- 条件列表 -->
        <div v-show="!group.collapsed" class="condition-items">
          <div v-for="(condition, conditionIndex) in group.conditions" :key="conditionIndex" class="condition-item">
            <!-- 条件连接点 -->
            <div v-if="conditionIndex > 0" class="condition-connector">
              <div class="connector-line"></div>
              <div class="logic-connector" @click="toggleConditionLogic(groupIndex, conditionIndex)">
                {{ (condition.logic || 'and').toUpperCase() }}
              </div>
            </div>

            <!-- 排除标识 -->
            <div v-if="condition.exclude" class="exclude-indicator">
              <span>排除</span>
            </div>

            <!-- 条件配置表单 -->
            <div class="condition-form">
              <div class="condition-row">
                <div class="condition-group">
                  <label class="condition-label">数据源</label>
                  <a-select 
                    v-model="condition.dataSourceType" 
                    placeholder="选择数据源"
                    :options="dataSourceTypeOptions"
                    @change="onDataSourceTypeChange?.(groupIndex, conditionIndex, $event)"
                  />
                </div>
                <div class="condition-group">
                  <label class="condition-label">字段</label>
                  <a-select 
                    v-model="condition.field" 
                    placeholder="选择字段"
                    :options="getFieldOptions?.(condition.dataSourceType || '')"
                  />
                </div>
                <div class="condition-group">
                  <label class="condition-label">聚合</label>
                  <a-select 
                    v-model="condition.aggregation" 
                    placeholder="选择聚合"
                    :options="getAggregationOptions?.(condition.field || '')"
                  />
                </div>
              </div>
              
              <div class="condition-row">
                <div class="condition-group">
                  <label class="condition-label">条件</label>
                  <a-select 
                    v-model="condition.operator" 
                    placeholder="选择条件"
                    :options="getOperatorOptions?.(condition.field || '')"
                  />
                </div>
                <div class="condition-group" v-if="needValueInput?.(condition.operator || '')">
                  <label class="condition-label">值</label>
                  <a-input 
                    v-model="condition.value" 
                    :placeholder="getValuePlaceholder?.(condition.field || '', condition.operator || '')"
                  />
                </div>
              </div>

              <!-- 时间类型配置 -->
              <div v-if="condition.field?.includes('time') || condition.field?.includes('date')" class="condition-row">
                <div class="condition-group">
                  <label class="condition-label">时间类型</label>
                  <a-select 
                    v-model="condition.dateType" 
                    :options="dateTypeOptions"
                    @change="onDateTypeChange?.(groupIndex, conditionIndex, $event)"
                  />
                </div>
                <div v-if="condition.dateType === 'absolute'" class="condition-group">
                  <label class="condition-label">时间范围</label>
                  <a-input v-model="condition.timeRange" placeholder="选择时间范围" />
                </div>
                <div v-if="condition.dateType === 'relative'" class="condition-group">
                  <label class="condition-label">动态时间</label>
                  <div class="dynamic-time-input">
                    <a-input-number v-model="condition.dynamicValue" placeholder="数值" style="width: 80px;" />
                    <a-select v-model="condition.dynamicUnit" :options="dynamicUnitOptions" style="width: 80px;" />
                  </div>
                </div>
              </div>
            </div>

            <!-- 条件操作按钮 -->
            <div class="condition-actions" v-if="editable">
              <a-button type="text" size="small" status="danger" @click="$emit('remove-condition', groupIndex, conditionIndex)">
                <template #icon><icon-delete /></template>
              </a-button>
            </div>
          </div>

          <!-- 添加条件按钮组 -->
          <div v-if="editable" class="add-condition-buttons">
            <a-button type="dashed" size="small" @click="$emit('add-condition-by-type', groupIndex, 'property')">
              <template #icon><icon-plus /></template>
              添加属性
            </a-button>
            <a-button type="dashed" size="small" @click="$emit('add-condition-by-type', groupIndex, 'behavior')">
              <template #icon><icon-plus /></template>
              添加行为
            </a-button>
            <a-button type="dashed" size="small" @click="$emit('add-condition-by-type', groupIndex, 'detail')">
              <template #icon><icon-plus /></template>
              添加明细数据
            </a-button>
          </div>
        </div>

        <!-- 跨组逻辑连接线 -->
        <div v-if="groupIndex < conditionGroups.length - 1" class="group-logic-line">
          <div class="logic-line"></div>
          <div class="cross-group-logic" @click="$emit('toggle-cross-group-logic')">
            {{ (crossGroupLogic || 'or').toUpperCase() }}
          </div>
          <div class="logic-line"></div>
        </div>
      </div>

      <!-- 添加条件组按钮 -->
      <div v-if="editable" class="add-condition-group">
        <a-button type="dashed" @click="$emit('add-condition-group')" style="width: 100%;">
          <template #icon><icon-plus /></template>
          添加条件组
        </a-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { IconPlus, IconDelete, IconMinus, IconDown, IconRight } from '@arco-design/web-vue/es/icon'

// 类型定义
interface Condition {
  field: string
  operator: string
  value: string
  logic?: string
  type?: string
  dataSourceType?: string
  dateType?: string
  aggregation?: string
  timeRange?: string
  dynamicValue?: number
  dynamicUnit?: string
  exclude?: boolean
}

interface ConditionGroup {
  logic?: string
  conditions: Condition[]
  collapsed?: boolean
}

interface Option {
  label: string
  value: string
}

// Props定义
const props = withDefaults(defineProps<{
  conditionGroups: ConditionGroup[]
  crossGroupLogic?: string
  editable?: boolean
  dataSourceTypeOptions?: Option[]
  dateTypeOptions?: Option[]
  dynamicUnitOptions?: Option[]
  getFieldOptions?: (dataSourceType: string) => Option[]
  getAggregationOptions?: (field: string) => Option[]
  getOperatorOptions?: (field: string) => Option[]
  needValueInput?: (operator: string) => boolean
  getValuePlaceholder?: (field: string, operator: string) => string
  onDataSourceTypeChange?: (groupIndex: number, conditionIndex: number, value: string) => void
  onDateTypeChange?: (groupIndex: number, conditionIndex: number, value: string) => void
}>(), {
  crossGroupLogic: 'or',
  editable: true,
  dataSourceTypeOptions: () => [],
  dateTypeOptions: () => [],
  dynamicUnitOptions: () => [],
  getFieldOptions: () => () => [],
  getAggregationOptions: () => () => [],
  getOperatorOptions: () => () => [],
  needValueInput: () => () => true,
  getValuePlaceholder: () => () => '请输入值',
  onDataSourceTypeChange: () => () => {},
  onDateTypeChange: () => () => {}
})

// Emits定义
defineEmits<{
  'add-condition-group': []
  'delete-condition-group': [groupIndex: number]
  'toggle-group-logic': [groupIndex: number]
  'toggle-cross-group-logic': []
  'add-condition-by-type': [groupIndex: number, type: string]
  'remove-condition': [groupIndex: number, conditionIndex: number]
}>()

// 切换条件组折叠状态
const toggleGroupCollapse = (groupIndex: number) => {
  const group = props.conditionGroups[groupIndex]
  if (group) {
    group.collapsed = !group.collapsed
  }
}

// 切换条件逻辑
const toggleConditionLogic = (groupIndex: number, conditionIndex: number) => {
  const condition = props.conditionGroups[groupIndex]?.conditions[conditionIndex]
  if (condition) {
    condition.logic = condition.logic === 'and' ? 'or' : 'and'
  }
}
</script>

<style scoped>
.condition-config {
  width: 100%;
}

.empty-condition-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: #86909c;
  border: 1px dashed #e5e6eb;
  border-radius: 6px;
}

.empty-condition-state p {
  margin: 16px 0 24px;
  font-size: 14px;
}

.conditions-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.condition-group {
  background: #fff;
  border: 1px solid #e5e6eb;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
  overflow: hidden;
}

.condition-group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f7f8fa;
  border-bottom: 1px solid #e5e6eb;
}

.group-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.group-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  color: #1d2129;
}

.condition-count {
  font-size: 12px;
  color: #86909c;
  background: #f2f3f5;
  padding: 2px 8px;
  border-radius: 10px;
}

.group-logic {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logic-label {
  font-size: 12px;
  color: #86909c;
}

.logic-indicator {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 20px;
  background: #165dff;
  color: white;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.logic-indicator:hover {
  background: #0e42d2;
}

.group-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.condition-items {
  padding: 16px;
}

.condition-item {
  position: relative;
  margin-bottom: 16px;
}

.condition-item:last-child {
  margin-bottom: 0;
}

.condition-connector {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  gap: 8px;
}

.connector-line {
  flex: 1;
  height: 1px;
  background: #e5e6eb;
}

.logic-connector {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 24px;
  background: #165dff;
  color: white;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.logic-connector:hover {
  background: #0e42d2;
}

.exclude-indicator {
  position: absolute;
  top: -8px;
  right: 8px;
  background: #f53f3f;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  z-index: 1;
}

.condition-form {
  background: #f7f8fa;
  border: 1px solid #e5e6eb;
  border-radius: 6px;
  padding: 16px;
}

.condition-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.condition-row:last-child {
  margin-bottom: 0;
}

.condition-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.condition-label {
  font-size: 12px;
  color: #4e5969;
  font-weight: 500;
}

.dynamic-time-input {
  display: flex;
  gap: 8px;
}

.condition-actions {
  position: absolute;
  top: 8px;
  right: 8px;
}

.add-condition-buttons {
  display: flex;
  gap: 8px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px dashed #e5e6eb;
}

.group-logic-line {
  display: flex;
  align-items: center;
  margin: 8px 0;
  gap: 12px;
}

.logic-line {
  flex: 1;
  height: 1px;
  background: #e5e6eb;
}

.cross-group-logic {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 28px;
  background: #00b42a;
  color: white;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.cross-group-logic:hover {
  background: #009a29;
}

.add-condition-group {
  margin-top: 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .condition-row {
    grid-template-columns: 1fr;
  }
  
  .group-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .add-condition-buttons {
    flex-direction: column;
  }
}
</style>