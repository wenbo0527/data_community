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
        <!-- 条件组头部 - 统一逻辑控制 -->
        <div class="condition-group-header">
          <div class="group-info">
            <div class="group-title">
              <span>条件组 {{ groupIndex + 1 }}</span>
              <span class="condition-count">{{ group.conditions.length }} 个条件</span>
            </div>
            <!-- 统一逻辑控制器 -->
            <div class="unified-logic-controller" v-if="group.conditions.length > 1">
              <div class="logic-toggle-group">
                <button 
                  :class="['logic-btn', { active: (group.logic || 'and').toLowerCase() === 'and' }]"
                  @click="toggleGroupLogic(groupIndex, 'AND')"
                  :disabled="!editable"
                >
                  且(AND)
                </button>
                <button 
                  :class="['logic-btn', { active: (group.logic || 'and').toLowerCase() === 'or' }]"
                  @click="toggleGroupLogic(groupIndex, 'OR')"
                  :disabled="!editable"
                >
                  或(OR)
                </button>
              </div>
              <div class="logic-indicator">
                <span class="logic-status">{{ (group.logic || 'and').toLowerCase() === 'and' ? '所有条件都满足' : '任一条件满足' }}</span>
              </div>
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
            <!-- 树状结构连接线 -->
            <div class="tree-structure">
              <div class="tree-line-container">
                <!-- 垂直连接线 -->
                <div v-if="conditionIndex > 0" class="vertical-line"></div>
                <!-- 水平连接线 -->
                <div class="horizontal-line"></div>
                <!-- 节点指示器 -->
                <div class="tree-node">
                  <div class="node-circle"></div>
                  <div class="node-number">{{ conditionIndex + 1 }}</div>
                </div>
              </div>
              <!-- 逻辑连接符 -->
              <div v-if="conditionIndex > 0" class="logic-connector">
                <span class="logic-text">{{ (group.logic || 'and').toUpperCase() }}</span>
              </div>
            </div>

            <!-- 排除标识 -->
            <div v-if="condition.exclude" class="exclude-indicator">
              <span>排除</span>
            </div>

            <!-- 条件内容 -->
            <div class="condition-content">

            <!-- 条件配置表单 - 水平布局优化 -->
            <div class="condition-form">
              <!-- 标签条件行 - 水平布局 -->
              <div class="tag-condition-row">
                <div class="tag-config">
                  <div class="form-group">
                    <label class="form-label">数据源</label>
                    <a-select 
                      v-model="condition.dataSourceType" 
                      placeholder="选择数据源"
                      :options="dataSourceTypeOptions"
                      @change="onDataSourceTypeChange?.(groupIndex, conditionIndex, $event)"
                      class="form-control"
                      size="small"
                    />
                  </div>
                  <div class="form-group">
                    <label class="form-label">字段</label>
                    <a-select 
                      v-model="condition.field" 
                      placeholder="选择字段"
                      :options="getFieldOptions?.(condition.dataSourceType || '')"
                      class="form-control"
                      size="small"
                    />
                  </div>
                  <div class="form-group">
                    <label class="form-label">聚合</label>
                    <a-select 
                      v-model="condition.aggregation" 
                      placeholder="选择聚合"
                      :options="getAggregationOptions?.(condition.field || '')"
                      class="form-control"
                      size="small"
                    />
                  </div>
                  <div class="form-group">
                    <label class="form-label">条件</label>
                    <a-select 
                      v-model="condition.operator" 
                      placeholder="选择条件"
                      :options="getOperatorOptions?.(condition.field || '')"
                      class="form-control"
                      size="small"
                    />
                  </div>
                  <div class="form-group" v-if="needValueInput?.(condition.operator || '')">
                    <label class="form-label">值</label>
                    <a-input 
                      v-model="condition.value" 
                      :placeholder="getValuePlaceholder?.(condition.field || '', condition.operator || '')"
                      class="form-control"
                      size="small"
                    />
                  </div>
                </div>
                <div class="tag-actions">
                  <a-button type="text" size="mini" status="danger" @click="$emit('remove-condition', groupIndex, conditionIndex)">
                    <template #icon><icon-delete /></template>
                  </a-button>
                </div>
              </div>

              <!-- 事件属性配置 - 水平布局 -->
              <div v-if="condition.dataSourceType === 'event'" class="event-config-row">
                <div class="form-group">
                  <label class="form-label">事件名称</label>
                  <a-select 
                    v-model="condition.eventName" 
                    :options="eventOptions"
                    placeholder="选择事件"
                    class="form-control"
                    size="small"
                  />
                </div>
                <div class="form-group">
                  <label class="form-label">属性名称</label>
                  <a-select 
                    v-model="condition.propertyName" 
                    :options="propertyOptions"
                    placeholder="选择属性"
                    class="form-control"
                    size="small"
                  />
                </div>
                <div class="form-group">
                  <label class="form-label">聚合方式</label>
                  <a-select 
                    v-model="condition.aggregation" 
                    :options="getAggregationOptions?.(condition.dataSourceType) || []"
                    class="form-control"
                    size="small"
                  />
                </div>
              </div>

              <!-- 时间类型配置 - 水平布局 -->
              <div v-if="condition.field?.includes('time') || condition.field?.includes('date')" class="time-config-row">
                <div class="form-group">
                  <label class="form-label">时间类型</label>
                  <a-select 
                    v-model="condition.dateType" 
                    :options="dateTypeOptions"
                    @change="onDateTypeChange?.(groupIndex, conditionIndex, $event)"
                    class="form-control"
                    size="small"
                  />
                </div>
                <div v-if="condition.dateType === 'absolute'" class="form-group">
                  <label class="form-label">时间范围</label>
                  <a-input v-model="condition.timeRange" placeholder="选择时间范围" class="form-control" size="small" />
                </div>
                <div v-if="condition.dateType === 'relative'" class="form-group">
                  <label class="form-label">动态时间</label>
                  <div class="dynamic-time-input">
                    <a-input-number v-model="condition.dynamicValue" placeholder="数值" class="form-control" size="small" style="width: 80px;" />
                    <a-select v-model="condition.dynamicUnit" :options="dynamicUnitOptions" class="form-control" size="small" style="width: 80px;" />
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

// 切换条件组逻辑
const toggleGroupLogic = (groupIndex: number, logic?: string) => {
  if (logic) {
    emit('toggle-group-logic', groupIndex, logic)
  } else {
    emit('toggle-group-logic', groupIndex)
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
  flex: 1;
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

/* 统一逻辑控制器样式 */
.unified-logic-controller {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
}

.logic-toggle-group {
  display: flex;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
  background: #ffffff;
}

.logic-btn {
  padding: 6px 12px;
  border: none;
  background: #ffffff;
  color: #6b7280;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border-right: 1px solid #e5e7eb;
}

.logic-btn:last-child {
  border-right: none;
}

.logic-btn:hover:not(:disabled) {
  background: #f9fafb;
  color: #374151;
}

.logic-btn.active {
  background: #3b82f6;
  color: #ffffff;
}

.logic-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.logic-indicator {
  display: flex;
  align-items: center;
}

.logic-status {
  font-size: 11px;
  color: #6b7280;
  padding: 4px 8px;
  background: #f3f4f6;
  border-radius: 4px;
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

.group-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.condition-items {
  padding: 16px;
}

/* 条件项样式 */
.condition-item {
  position: relative;
  display: flex;
  align-items: flex-start;
  padding: 16px;
  margin-bottom: 12px;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;
}

/* 树状结构样式 */
.tree-structure {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 16px;
  min-width: 40px;
}

.tree-line-container {
  position: relative;
  display: flex;
  align-items: center;
  height: 24px;
}

.vertical-line {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  width: 2px;
  height: 12px;
  background: #d1d5db;
}

.horizontal-line {
  width: 20px;
  height: 2px;
  background: #d1d5db;
  margin-right: 8px;
}

.tree-node {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.node-circle {
  width: 16px;
  height: 16px;
  border: 2px solid #3b82f6;
  border-radius: 50%;
  background: #ffffff;
  position: relative;
  z-index: 2;
}

.node-number {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 10px;
  color: #6b7280;
  font-weight: 500;
  background: #ffffff;
  padding: 2px 4px;
  border-radius: 2px;
  z-index: 3;
}

.logic-connector {
  margin-top: 4px;
  padding: 2px 6px;
  background: #e0e7ff;
  border-radius: 4px;
  border: 1px solid #c7d2fe;
}

.logic-text {
  font-size: 10px;
  color: #3730a3;
  font-weight: 600;
}

/* 条件内容区域 */
.condition-content {
  flex: 1;
  min-width: 0;
}

.condition-item:hover {
  border-color: #3b82f6;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
}

.condition-item.excluded {
  background: #fef2f2;
  border-color: #fca5a5;
}

.condition-item.excluded:hover {
  border-color: #ef4444;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.1);
}

.condition-item:last-child {
  margin-bottom: 0;
}

/* 水平布局样式 */
.tag-condition-row,
.event-config-row,
.time-config-row {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.form-group {
  display: flex;
  flex-direction: column;
  min-width: 120px;
  flex: 1;
}

.form-label {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
  font-weight: 500;
}

.form-control {
  min-width: 100px;
}

.tag-actions {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  margin-left: auto;
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
  align-items: center;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .tag-condition-row,
  .event-config-row,
  .time-config-row {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  
  .form-group {
    min-width: auto;
  }
  
  .tag-actions {
    margin-left: 0;
    justify-content: flex-end;
    margin-top: 8px;
  }
  
  .dynamic-time-input {
    flex-direction: column;
    align-items: stretch;
  }
  
  .dynamic-time-input .form-control {
    width: 100% !important;
  }
  
  /* 统一逻辑控制器响应式 */
  .unified-logic-controller {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    margin-left: 0;
    margin-top: 8px;
  }
  
  .logic-toggle-group {
    width: 100%;
  }
  
  .logic-btn {
    flex: 1;
    text-align: center;
  }
  
  /* 树状结构响应式 */
  .tree-structure {
    display: none;
  }
  
  .condition-item {
    flex-direction: column;
  }
  
  .condition-content {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .condition-item {
    padding: 12px;
  }
  
  .form-label {
    font-size: 11px;
  }
  
  .tag-actions {
    gap: 4px;
  }
  
  .condition-group-header {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .group-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .logic-status {
    font-size: 10px;
  }
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