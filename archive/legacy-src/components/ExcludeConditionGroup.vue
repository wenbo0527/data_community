<template>
  <div class="exclude-condition-group" :data-testid="`exclude-group-${groupIndex}`">
    <!-- 剔除条件组标题 -->
    <div class="group-header">
      <a-space>
        <span class="group-title">剔除条件组 {{ groupIndex + 1 }}</span>
        <a-button 
          v-if="group.conditions.length > 1"
          type="text" 
          size="small"
          :data-testid="'exclude-logic-toggle'"
          @click="toggleLogic"
        >
          {{ group.logic === 'and' ? '且' : '或' }}
        </a-button>
        <a-button 
          type="text" 
          size="small" 
          danger
          :data-testid="'delete-exclude-group'"
          @click="deleteGroup"
        >
          <template #icon>
            <IconDelete />
          </template>
          删除组
        </a-button>
      </a-space>
    </div>

    <!-- 条件列表 -->
    <div class="conditions-list">
      <div 
        v-for="(condition, conditionIndex) in group.conditions" 
        :key="conditionIndex"
        class="condition-item"
        :data-testid="`exclude-condition-${conditionIndex}`"
      >
        <a-space>
          <!-- 条件配置 -->
          <ConditionConfig
            :condition="condition"
            :condition-groups="conditionGroups"
            @update:condition="updateCondition(conditionIndex, $event)"
          />
          
          <!-- 删除条件按钮 -->
          <a-button 
            v-if="group.conditions.length > 1"
            type="text" 
            size="small" 
            danger
            :data-testid="`delete-exclude-condition-${conditionIndex}`"
            @click="deleteCondition(conditionIndex)"
          >
            <template #icon>
              <IconDelete />
            </template>
          </a-button>
        </a-space>
      </div>
      
      <!-- 空状态 -->
      <a-empty v-if="group.conditions.length === 0" description="暂无剔除条件" />
    </div>

    <!-- 添加条件按钮 -->
    <div class="add-condition">
      <a-button 
        type="dashed" 
        :data-testid="'add-exclude-condition'"
        @click="addCondition"
      >
        <template #icon>
          <IconPlus />
        </template>
        添加剔除条件
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { IconDelete, IconPlus } from '@arco-design/web-vue/es/icon'
import ConditionConfig from './ConditionConfig.vue'

interface Condition {
  field: string
  operator: string
  value: any
  type: 'include' | 'exclude'
}

interface ConditionGroup {
  id: string
  type: 'include' | 'exclude'
  logic: 'and' | 'or'
  conditions: Condition[]
}

interface Props {
  group: ConditionGroup
  groupIndex: number
  conditionGroups: ConditionGroup[]
}

interface Emits {
  'update:group': [group: ConditionGroup]
  'delete-group': [groupIndex: number]
  'toggle-logic': [groupIndex: number]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 计算属性
const isExclude = computed(() => props.group.type === 'exclude')

// 方法
const toggleLogic = () => {
  const newLogic = props.group.logic === 'and' ? 'or' : 'and'
  const updatedGroup = {
    ...props.group,
    logic: newLogic
  }
  emit('update:group', updatedGroup)
  emit('toggle-logic', props.groupIndex)
}

const deleteGroup = () => {
  emit('delete-group', props.groupIndex)
}

const addCondition = () => {
  const newCondition: Condition = {
    field: '',
    operator: 'equals',
    value: '',
    type: 'exclude'
  }
  
  const updatedGroup = {
    ...props.group,
    conditions: [...props.group.conditions, newCondition]
  }
  
  emit('update:group', updatedGroup)
}

const deleteCondition = (conditionIndex: number) => {
  const updatedConditions = props.group.conditions.filter((_, index) => index !== conditionIndex)
  const updatedGroup = {
    ...props.group,
    conditions: updatedConditions
  }
  
  emit('update:group', updatedGroup)
}

const updateCondition = (conditionIndex: number, updatedCondition: Condition) => {
  const updatedConditions = [...props.group.conditions]
  updatedConditions[conditionIndex] = updatedCondition
  
  const updatedGroup = {
    ...props.group,
    conditions: updatedConditions
  }
  
  emit('update:group', updatedGroup)
}
</script>

<style scoped>
.exclude-condition-group {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  background-color: #fef2f2;
}

.group-header {
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #fecaca;
}

.group-title {
  font-weight: 500;
  color: #dc2626;
}

.conditions-list {
  margin-bottom: 12px;
}

.condition-item {
  margin-bottom: 8px;
  padding: 8px;
  background-color: #ffffff;
  border-radius: 4px;
  border: 1px solid #fecaca;
}

.condition-item:last-child {
  margin-bottom: 0;
}

.add-condition {
  text-align: center;
}
</style>