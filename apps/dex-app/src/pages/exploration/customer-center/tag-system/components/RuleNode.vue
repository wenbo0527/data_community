<template>
  <div class="rule-node" :class="[node.type, { 'is-root': isRoot }]">
    <!-- 逻辑节点 -->
    <div v-if="node.type === 'logic'" class="logic-node">
      <div class="logic-header">
        <div class="logic-info">
          <a-button 
            type="text" 
            size="mini" 
            @click="$emit('toggle-node', node)"
            class="toggle-btn"
          >
            <IconDown v-if="!node.collapsed" />
            <IconRight v-else />
          </a-button>
          <a-tag 
            :color="node.operator === 'and' ? 'blue' : 'orange'"
            @click="$emit('toggle-logic-operator', node)"
            class="logic-operator"
          >
            {{ node.operator === 'and' ? '且' : '或' }}
          </a-tag>
          <span class="node-count">({{ node.children?.length || 0 }}个子项)</span>
        </div>
        <div class="logic-actions">
          <a-button size="mini" type="dashed" @click="$emit('add-condition-group', node)">添加条件组</a-button>
          <a-button size="mini" type="dashed" @click="$emit('add-logic-node', node, 'and')">添加且组</a-button>
          <a-button size="mini" type="dashed" @click="$emit('add-logic-node', node, 'or')">添加或组</a-button>
          <a-button v-if="!isRoot" size="mini" type="text" status="danger" @click="$emit('remove-node', node.id)">删除</a-button>
        </div>
      </div>
      
      <div v-if="!node.collapsed" class="logic-content">
        <div v-for="(child, index) in node.children" :key="child.id" class="child-node">
          <RuleNode 
            :node="child"
            :is-root="false"
            :data-source-type-options="dataSourceTypeOptions"
            :date-type-options="dateTypeOptions"
            :dynamic-unit-options="dynamicUnitOptions"
            :get-aggregation-options="getAggregationOptions"
            :get-operator-options="getOperatorOptions"
            :need-value-input="needValueInput"
            :get-value-placeholder="getValuePlaceholder"
            @add-logic-node="(...args) => $emit('add-logic-node', ...args)"
            @add-condition-group="(...args) => $emit('add-condition-group', ...args)"
            @add-condition="(...args) => $emit('add-condition', ...args)"
            @add-exclude-condition="(...args) => $emit('add-exclude-condition', ...args)"
            @toggle-node="(...args) => $emit('toggle-node', ...args)"
            @toggle-logic-operator="(...args) => $emit('toggle-logic-operator', ...args)"
            @remove-node="(...args) => $emit('remove-node', ...args)"
            @edit-group-name="(...args) => $emit('edit-group-name', ...args)"
            @duplicate-condition="(...args) => $emit('duplicate-condition', ...args)"
            @remove-condition="(...args) => $emit('remove-condition', ...args)"
            @data-source-type-change="(...args) => $emit('data-source-type-change', ...args)"
            @date-type-change="(...args) => $emit('date-type-change', ...args)"
            @configure-sequence="(...args) => $emit('configure-sequence', ...args)"
          />
          <div v-if="index < node.children.length - 1" class="logic-connector">
            <a-tag size="small" :color="node.operator === 'and' ? 'blue' : 'orange'">
              {{ node.operator === 'and' ? '且' : '或' }}
            </a-tag>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 条件组节点 -->
    <div v-else-if="node.type === 'group'" class="condition-group">
      <div class="group-header">
        <div class="group-info">
          <a-button 
            type="text" 
            size="mini" 
            @click="$emit('toggle-node', node)"
            class="toggle-btn"
          >
            <IconDown v-if="!node.collapsed" />
            <IconRight v-else />
          </a-button>
          <span class="group-name" @click="$emit('edit-group-name', node)">{{ node.name }}</span>
          <span class="condition-count">({{ node.conditions?.length || 0 }}个条件)</span>
        </div>
        <div class="group-actions">
          <a-button size="mini" type="dashed" @click="$emit('add-condition', node)">添加条件</a-button>
          <a-button size="mini" type="dashed" @click="$emit('add-exclude-condition', node)">添加排除条件</a-button>
          <a-button size="mini" type="text" status="danger" @click="$emit('remove-node', node.id)">删除</a-button>
        </div>
      </div>
      
      <div v-if="!node.collapsed" class="group-content">
        <div 
          v-for="(condition, conditionIndex) in node.conditions" 
          :key="condition.id"
          class="condition-item"
          :class="{ 'exclude-condition': condition.isExclude }"
        >
          <div class="condition-content">
            <!-- 排除标识 -->
            <div v-if="condition.isExclude" class="exclude-label">
              <a-tag color="red" size="small">排除</a-tag>
            </div>
            
            <!-- 数据源类型选择 -->
            <a-select 
              v-model="condition.dataSourceType" 
              size="small" 
              style="width: 100px;"
              :options="dataSourceTypeOptions"
              @change="$emit('data-source-type-change', condition)"
            />
            
            <!-- 字段名称 -->
            <a-input 
              v-model="condition.fieldName" 
              size="small" 
              style="width: 120px;"
              placeholder="字段名称"
            />
            
            <!-- 聚合类型（明细数据和行为数据） -->
            <a-select 
              v-if="condition.dataSourceType === 'detail' || condition.dataSourceType === 'behavior'"
              v-model="condition.aggregationType" 
              size="small" 
              style="width: 100px;"
              :options="getAggregationOptions(condition.dataSourceType)"
            />
            
            <!-- 操作符 -->
            <a-select 
              v-model="condition.operator" 
              size="small" 
              style="width: 100px;"
              :options="getOperatorOptions(condition)"
            />
            
            <!-- 值输入 -->
            <a-input 
              v-if="needValueInput(condition)"
              v-model="condition.value" 
              size="small" 
              style="width: 120px;"
              :placeholder="getValuePlaceholder(condition)"
            />
            
            <!-- 日期范围选择 -->
            <div v-if="condition.dataSourceType !== 'attribute'" class="date-range-section">
              <a-select 
                v-model="condition.dateType" 
                size="small" 
                style="width: 100px;"
                :options="dateTypeOptions"
                @change="$emit('date-type-change', condition)"
              />
              
              <!-- 固定日期范围 -->
              <a-range-picker 
                v-if="condition.dateType === 'fixed'"
                v-model="condition.dateRange" 
                size="small" 
                style="width: 200px;"
              />
              
              <!-- 动态日期 -->
              <div v-else-if="condition.dateType === 'dynamic'" class="dynamic-date">
                <a-input-number 
                  v-model="condition.dynamicValue" 
                  size="small" 
                  style="width: 60px;"
                  :min="1"
                />
                <a-select 
                  v-model="condition.dynamicUnit" 
                  size="small" 
                  style="width: 80px;"
                  :options="dynamicUnitOptions"
                />
              </div>
              
              <!-- 单个日期 -->
              <a-date-picker 
                v-else-if="condition.dateType === 'single'"
                v-model="condition.singleDate" 
                size="small" 
                style="width: 150px;"
                show-time
              />
            </div>
            
            <!-- 行为路径配置（仅行为数据） -->
            <div v-if="condition.dataSourceType === 'behavior'" class="sequence-section">
              <a-checkbox v-model="condition.enableSequence" size="small">启用行为路径</a-checkbox>
              <a-button 
                v-if="condition.enableSequence" 
                size="mini" 
                type="text" 
                @click="$emit('configure-sequence', condition)"
              >
                配置路径
              </a-button>
            </div>
          </div>
          
          <div class="condition-actions">
            <a-button size="mini" type="text" @click="$emit('duplicate-condition', node, condition)">复制</a-button>
            <a-button 
              size="mini" 
              type="text" 
              status="danger" 
              @click="$emit('remove-condition', node, conditionIndex)"
            >
              <IconDelete />
            </a-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { IconDown, IconRight, IconDelete } from '@arco-design/web-vue/es/icon'

// Props
defineProps({
  node: {
    type: Object,
    required: true
  },
  isRoot: {
    type: Boolean,
    default: false
  },
  dataSourceTypeOptions: {
    type: Array,
    required: true
  },
  dateTypeOptions: {
    type: Array,
    required: true
  },
  dynamicUnitOptions: {
    type: Array,
    required: true
  },
  getAggregationOptions: {
    type: Function,
    required: true
  },
  getOperatorOptions: {
    type: Function,
    required: true
  },
  needValueInput: {
    type: Function,
    required: true
  },
  getValuePlaceholder: {
    type: Function,
    required: true
  }
})

// Emits
defineEmits([
  'add-logic-node', 'add-condition-group', 'add-condition', 'add-exclude-condition',
  'toggle-node', 'toggle-logic-operator', 'remove-node', 'edit-group-name',
  'duplicate-condition', 'remove-condition', 'data-source-type-change',
  'date-type-change', 'configure-sequence'
])
</script>

<style scoped>
/* 规则节点样式 */
.rule-node {
  margin-bottom: 16px;
}

.rule-node.logic {
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  background: #fafafa;
}

.rule-node.group {
  border: 1px solid #e5e6eb;
  border-radius: 6px;
  background: white;
}

.logic-node .logic-header {
  padding: 12px 16px;
  border-bottom: 1px solid #e5e6eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f2f3f5;
}

.logic-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toggle-btn {
  padding: 0;
  width: 20px;
  height: 20px;
}

.logic-operator {
  cursor: pointer;
  user-select: none;
}

.node-count {
  color: #86909c;
  font-size: 12px;
}

.logic-actions {
  display: flex;
  gap: 8px;
}

.logic-content {
  padding: 16px;
}

.child-node {
  margin-bottom: 12px;
}

.logic-connector {
  display: flex;
  justify-content: center;
  margin: 8px 0;
}

.group-header {
  padding: 12px 16px;
  border-bottom: 1px solid #e5e6eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f9f9f9;
}

.group-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.group-name {
  font-weight: 500;
  cursor: pointer;
  color: #1d2129;
}

.condition-count {
  color: #86909c;
  font-size: 12px;
}

.group-content {
  padding: 16px;
}

.condition-item {
  padding: 12px;
  border: 1px solid #e5e6eb;
  border-radius: 4px;
  margin-bottom: 8px;
  background: #fafafa;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.condition-item.exclude-condition {
  border-color: #ff4d4f;
  background: #fff2f0;
}

.condition-content {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.exclude-label {
  margin-right: 8px;
}

.date-range-section {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 8px;
}

.dynamic-date {
  display: flex;
  align-items: center;
  gap: 4px;
}

.sequence-section {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 8px;
}

.condition-actions {
  display: flex;
  gap: 4px;
  margin-left: 8px;
}
</style>