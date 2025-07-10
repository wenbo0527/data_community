<template>
  <div class="condition-config-component">
    <!-- 条件组配置 -->
    <div class="condition-groups-section">
      <div class="section-header">
        <div class="section-info">
          <h4>条件配置</h4>
          <span class="condition-count">共 {{ conditionGroups.length }} 个条件组</span>
        </div>
      </div>
      
      <!-- 空状态 -->
      <div v-if="conditionGroups.length === 0" class="empty-condition-state">
        <icon-plus style="font-size: 32px; color: #c9cdd4;" />
        <p>暂无条件组，请创建第一个条件组</p>
        <a-button type="primary" @click="addConditionGroup" :disabled="!editable">
          <template #icon><icon-plus /></template>
          创建第一个条件组
        </a-button>
      </div>
      
      <!-- 条件组列表 -->
      <div v-else class="condition-groups-workspace">
        <div class="workspace-container">
          <!-- 左侧垂直逻辑连接线 -->
          <div v-if="conditionGroups.length > 1" class="vertical-logic-line">
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
          
          <!-- 条件组列表 -->
          <div class="condition-groups-list">
            <div 
              v-for="(group, groupIndex) in conditionGroups" 
              :key="group.id || groupIndex" 
              class="condition-group-card"
            >
              <!-- 条件组标题 -->
              <div class="condition-group-header">
                <div class="group-title">
                  <span class="group-name">{{ group.name || `条件组 ${groupIndex + 1}` }}</span>
                  <span class="group-count">({{ group.conditions.length }})</span>
                </div>
                <div class="group-actions">
                  <a-button 
                    type="text" 
                    size="mini" 
                    @click="deleteConditionGroup(groupIndex)" 
                    class="delete-group-btn"
                    :disabled="!editable"
                  >
                    <template #icon>
                      <IconDelete />
                    </template>
                  </a-button>
                  <a-button type="text" size="mini" @click="group.collapsed = !group.collapsed">
                    <template #icon>
                      <IconDown :class="{ 'rotate-180': group.collapsed }" />
                    </template>
                  </a-button>
                </div>
              </div>
              
              <!-- 条件列表 -->
              <div class="conditions-list" v-show="!group.collapsed">
                <!-- 逻辑连接线（覆盖整个条件组） -->
                <div v-if="group.conditions.length > 1" class="group-logic-line">
                  <div class="logic-line"></div>
                  <div 
                    class="logic-indicator" 
                    :class="{ 
                      'and': group.logic === 'and', 
                      'or': group.logic === 'or',
                      'clickable': editable
                    }"
                    @click="editable && toggleGroupLogic(group)"
                  >
                    <span class="logic-text">{{ group.logic === 'and' ? '且' : '或' }}</span>
                  </div>
                </div>
                
                <div 
                  v-for="(condition, conditionIndex) in group.conditions" 
                  :key="condition.id || conditionIndex"
                  class="condition-item"
                  :class="{ 'excluded': condition.isExclude }"
                >
                  <!-- 简化的条件连接点 -->
                  <div class="condition-connector" v-if="condition.dataSourceType !== 'attribute'">
                    <div class="condition-dot"></div>
                  </div>
                  <!-- 属性条件的占位空间 -->
                  <div class="condition-connector attribute-spacer" v-else></div>
                    
                  <!-- 条件配置区域 -->
                  <div class="condition-config">
                    <!-- 排除标识 -->
                    <div v-if="condition.isExclude" class="exclude-indicator">
                      <span class="exclude-label">排除条件</span>
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
                  
                  <!-- 条件操作按钮 -->
                  <div class="condition-actions" v-if="editable">
                    <a-tooltip content="删除条件">
                      <a-button 
                        type="text" 
                        size="small" 
                        @click="removeCondition(group, conditionIndex)" 
                        class="action-btn danger"
                      >
                        <IconDelete />
                      </a-button>
                    </a-tooltip>
                  </div>
                </div>
                  
                <!-- 添加条件按钮组 -->
                <div class="add-condition-area" v-if="editable">
                  <div class="add-condition-buttons">
                    <a-button type="dashed" size="small" @click="addConditionByType(group, 'tag')" class="add-condition-btn">
                      <template #icon><IconPlus /></template>
                      添加属性
                    </a-button>
                    <a-button type="dashed" size="small" @click="addConditionByType(group, 'behavior')" class="add-condition-btn">
                      <template #icon><IconPlus /></template>
                      添加行为
                    </a-button>
                    <a-button type="dashed" size="small" @click="addConditionByType(group, 'detail')" class="add-condition-btn">
                      <template #icon><IconPlus /></template>
                      添加明细数据
                    </a-button>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 添加条件组按钮 -->
            <div class="add-condition-group-area" v-if="editable">
              <a-button type="dashed" @click="addConditionGroup" style="width: 100%;">
                <template #icon><IconPlus /></template>
                添加条件组
              </a-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IconPlus, IconDelete, IconDown } from '@arco-design/web-vue/es/icon'

// 类型定义
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
}

interface ConditionGroup {
  id?: string
  name?: string
  logic?: string
  collapsed?: boolean
  conditions: Condition[]
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
  onDateTypeChange: null
})

// Emits
const emit = defineEmits<{
  addConditionGroup: []
  deleteConditionGroup: [groupIndex: number]
  toggleGroupLogic: [group: ConditionGroup]
  toggleCrossGroupLogic: []
  addConditionByType: [group: ConditionGroup, type: string]
  removeCondition: [group: ConditionGroup, conditionIndex: number]
}>()

// 方法
const addConditionGroup = () => {
  emit('addConditionGroup')
}

const deleteConditionGroup = (groupIndex: number) => {
  emit('deleteConditionGroup', groupIndex)
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
</script>

<style scoped>
/* 从tag-detail.vue复制的样式 */
.condition-config-component {
  width: 100%;
}

.condition-groups-section {
  margin-top: 24px;
}

.section-header {
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e6eb;
}

.section-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.condition-count {
  font-size: 12px;
  color: #86909c;
  background: #f2f3f5;
  padding: 2px 8px;
  border-radius: 10px;
}

.empty-condition-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 20px;
  text-align: center;
  color: #86909c;
  border: 1px dashed #e5e6eb;
  border-radius: 6px;
  margin-top: 16px;
}

.empty-condition-state p {
  margin: 8px 0 16px 0;
  font-size: 14px;
}

.condition-groups-workspace {
  position: relative;
  margin-top: 16px;
}

.workspace-container {
  position: relative;
  display: flex;
  gap: 24px;
  align-items: flex-start;
  min-height: 200px;
}

.vertical-logic-line {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 3;
}

.logic-line-vertical {
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(to bottom, #165dff 0%, #165dff 100%);
  transform: translateX(-50%);
  z-index: 3;
}

.cross-group-logic-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 48px;
  height: 32px;
  border: 2px solid #165dff;
  border-radius: 16px;
  background: white;
  font-size: 12px;
  font-weight: 600;
  color: #165dff;
  z-index: 4;
  transition: all 0.3s ease;
}

.cross-group-logic-indicator.clickable {
  cursor: pointer;
}

.cross-group-logic-indicator.clickable:hover {
  background: #f2f3ff;
  transform: translateY(-50%) scale(1.05);
  box-shadow: 0 4px 12px rgba(22, 93, 255, 0.3);
}

.cross-group-logic-indicator.and {
  border-color: #165dff;
  background: #f0f5ff;
}

.cross-group-logic-indicator.or {
  border-color: #ff7d00;
  background: #fff7e6;
  color: #ff7d00;
}

.condition-groups-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
  position: relative;
  z-index: 2;
  margin-left: 48px; /* 为跨组连接线留出空间 */
}

.condition-group-card {
  background: white;
  border: 1px solid #e5e6eb;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
}

.condition-group-card:hover {
  border-color: #d4edda;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.condition-group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #f7f8fa;
  border-bottom: 1px solid #e5e6eb;
}

.group-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.group-name {
  font-weight: 600;
  color: #1d2129;
  font-size: 14px;
}

.group-count {
  font-size: 12px;
  color: #86909c;
  background: #f2f3f5;
  padding: 2px 8px;
  border-radius: 10px;
}

.group-actions {
  display: flex;
  gap: 8px;
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
  padding: 20px;
  padding-left: 60px; /* 增加左侧padding为连接线留出空间 */
}

.group-logic-line {
  position: absolute;
  left: 24px; /* 调整位置避免与condition-connector重叠 */
  top: 20px;
  bottom: 20px;
  width: 2px;
  z-index: 1;
}

.logic-line {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(to bottom, #165dff 0%, #165dff 100%);
}

.logic-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 28px;
  border: 2px solid #165dff;
  border-radius: 14px;
  background: white;
  font-size: 12px;
  font-weight: 600;
  color: #165dff;
  z-index: 2;
  transition: all 0.3s ease;
}

.logic-indicator.clickable {
  cursor: pointer;
}

.logic-indicator.clickable:hover {
  background: #f2f3ff;
  transform: translate(-50%, -50%) scale(1.1);
  box-shadow: 0 4px 12px rgba(22, 93, 255, 0.3);
}

.logic-indicator.and {
  border-color: #165dff;
  background: #f0f5ff;
}

.logic-indicator.or {
  border-color: #ff7d00;
  background: #fff7e6;
  color: #ff7d00;
}

.logic-text {
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
}

.condition-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  position: relative;
  z-index: 3;
  margin-bottom: 16px;
}

.condition-item:last-child {
  margin-bottom: 0;
}

.condition-item.excluded {
  opacity: 0.7;
}

.condition-item.excluded .condition-config {
  background: #fff2f0;
  border-left: 3px solid #ff4d4f;
}

.condition-connector {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 48px;
  padding-top: 8px;
  margin-left: -40px; /* 负边距使连接点向左偏移，避免与组内连接线重叠 */
}

.condition-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: white;
  border: 3px solid #165dff;
  box-shadow: 0 2px 6px rgba(22, 93, 255, 0.3);
  position: relative;
  z-index: 4;
}

.attribute-spacer {
  /* 属性条件的占位空间，保持布局一致但不显示圆形点 */
 visibility: hidden;
}

.condition-config {
  flex: 1;
  background: white;
  border: 1px solid #e5e6eb;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
}

.condition-config:hover {
  border-color: #d4edda;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.exclude-indicator {
  margin-bottom: 12px;
}

.exclude-label {
  display: inline-block;
  padding: 4px 8px;
  background: #fff2f0;
  color: #ff4d4f;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
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
  border-bottom: 1px solid #f2f3f5;
  padding-bottom: 12px;
}

.form-row.secondary {
  padding-top: 8px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
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
  color: #86909c;
  font-weight: 500;
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
  gap: 8px;
  padding-top: 8px;
  flex-shrink: 0;
}

.action-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e5e6eb;
  background: white;
  color: #86909c;
  transition: all 0.2s ease;
  cursor: pointer;
}

.action-btn:hover {
  border-color: #165dff;
  color: #165dff;
  background: #f2f3ff;
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(22, 93, 255, 0.2);
}

.action-btn.danger:hover {
  border-color: #f53f3f;
  color: #f53f3f;
  background: #ffece8;
}

.add-condition-area {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px dashed #e5e6eb;
}

.add-condition-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.add-condition-btn {
  border: 1px dashed #d4edda;
  background: #f6ffed;
  color: #52c41a;
  transition: all 0.3s ease;
}

.add-condition-btn:hover {
  border-color: #52c41a;
  background: #f6ffed;
  color: #52c41a;
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(82, 196, 26, 0.2);
}

.add-condition-group-area {
  margin-top: 16px;
}
</style>