<template>
  <div class="tag-condition-row" ref="conditionRef">
    <!-- 水平布局表单 -->
    <div class="tag-config">
      <!-- 标签选择器 -->
      <div class="form-group">
        <label class="form-label">标签</label>
        <a-cascader 
          v-model="localCondition.tagPath" 
          placeholder="请选择标签"
          :options="tagOptions"
          :loading="tagOptionsLoading"
          allow-search
          allow-clear
          :disabled="!editable"
          size="small"
          class="form-control"
          @change="onTagChange"
        />
      </div>
      
      <!-- 操作符选择器 -->
      <div class="form-group">
        <label class="form-label">操作符</label>
        <a-select 
          v-model="localCondition.operator" 
          placeholder="请选择操作符"
          :options="operatorOptions"
          :disabled="!editable || !localCondition.tagPath"
          size="small"
          class="form-control"
          @change="onOperatorChange"
        />
      </div>
      
      <!-- 值输入框 -->
      <div class="form-group" v-if="needValueInput">
        <label class="form-label">值</label>
        <a-input 
          v-if="valueInputType === 'text'"
          v-model="localCondition.value" 
          :placeholder="valuePlaceholder"
          :disabled="!editable"
          size="small"
          class="form-control"
          @change="onValueChange"
        />
        <a-input-number 
          v-else-if="valueInputType === 'number'"
          v-model="localCondition.value" 
          :placeholder="valuePlaceholder"
          :disabled="!editable"
          size="small"
          class="form-control"
          @change="onValueChange"
        />
        <a-select 
          v-else-if="valueInputType === 'select'"
          v-model="localCondition.value" 
          :placeholder="valuePlaceholder"
          :options="valueOptions"
          :disabled="!editable"
          allow-search
          allow-clear
          size="small"
          class="form-control"
          @change="onValueChange"
        />
      </div>
    </div>
    
    <!-- 操作按钮区域 -->
    <div class="tag-actions">
      <a-button 
        v-if="editable"
        type="text" 
        size="mini" 
        @click="$emit('removeCondition')" 
        class="action-btn delete-btn"
      >
        <template #icon><IconMinus /></template>
      </a-button>
    </div>
      
    
    
    <!-- 高级配置：时间范围 -->
    <div class="advanced-config" v-if="showAdvancedConfig">
      <div class="form-group time-config">
        <label class="form-label">时间范围</label>
        <a-select 
          v-model="localCondition.dateType" 
          placeholder="请选择时间类型"
          :options="dateTypeOptions"
          :disabled="!editable"
          size="small"
          class="form-control"
          @change="onDateTypeChange"
        />
      </div>
      
      <!-- 动态时间配置 -->
      <div class="form-group dynamic-time-config" v-if="localCondition.dateType === 'dynamic'">
        <label class="form-label">动态时间</label>
        <div class="dynamic-time-wrapper">
          <span class="dynamic-prefix">最近</span>
          <a-input-number 
            v-model="localCondition.dynamicValue" 
            :min="1"
            :max="999"
            size="small"
            class="dynamic-value"
            :disabled="!editable"
            @change="onDynamicValueChange"
          />
          <a-select 
            v-model="localCondition.dynamicUnit" 
            :options="dynamicUnitOptions"
            size="small"
            class="dynamic-unit"
            :disabled="!editable"
            @change="onDynamicUnitChange"
          />
        </div>
      </div>
      
      <!-- 固定时间配置 -->
      <div class="form-group fixed-time-config" v-else-if="localCondition.dateType === 'fixed'">
        <label class="form-label">时间范围</label>
        <a-range-picker 
          v-model="localCondition.dateRange" 
          :disabled="!editable"
          size="small"
          class="form-control"
          @change="onDateRangeChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { IconTag, IconMinus } from '@arco-design/web-vue/es/icon'

// 类型定义
interface Condition {
  id?: string
  dataSourceType?: string
  tagPath?: string[]
  operator?: string
  value?: string
  dateType?: string
  dateRange?: [string, string]
  dynamicValue?: number
  dynamicUnit?: string
  isExclude?: boolean
}

interface Option {
  label: string
  value: string
  children?: Option[]
}

// Props
const props = withDefaults(defineProps<{
  condition: Condition
  editable?: boolean
  getTagOptions?: (() => Option[]) | null
  getTagOperatorOptions?: (() => Option[]) | null
  needTagValueInput?: ((condition: Condition) => boolean) | null
  getTagValuePlaceholder?: ((condition: Condition) => string) | null
  getTagValueOptions?: ((condition: Condition) => Option[]) | null
  dateTypeOptions?: Option[]
  dynamicUnitOptions?: Option[]
}>(), {
  editable: true,
  dateTypeOptions: () => [
    { label: '动态时间', value: 'dynamic' },
    { label: '固定时间', value: 'fixed' }
  ],
  dynamicUnitOptions: () => [
    { label: '天', value: 'days' },
    { label: '周', value: 'weeks' },
    { label: '月', value: 'months' }
  ]
})

// Emits
const emit = defineEmits<{
  removeCondition: []
  updateCondition: [condition: Condition]
}>()

// 响应式数据
const localCondition = ref<Condition>({ ...props.condition })
const tagOptionsLoading = ref(false)
const isEditing = ref(false)
const conditionRef = ref<HTMLElement>()

// 计算属性
const tagOptions = computed(() => {
  return props.getTagOptions?.() || [
    { label: '用户属性', value: 'user', children: [
      { label: '年龄', value: 'age' },
      { label: '性别', value: 'gender' },
      { label: '城市', value: 'city' }
    ]},
    { label: '行为属性', value: 'behavior', children: [
      { label: '访问次数', value: 'visit_count' },
      { label: '购买金额', value: 'purchase_amount' }
    ]}
  ]
})

const operatorOptions = computed(() => {
  return props.getTagOperatorOptions?.() || [
    { label: '等于', value: 'eq' },
    { label: '不等于', value: 'ne' },
    { label: '大于', value: 'gt' },
    { label: '大于等于', value: 'gte' },
    { label: '小于', value: 'lt' },
    { label: '小于等于', value: 'lte' },
    { label: '包含', value: 'contains' },
    { label: '不包含', value: 'not_contains' },
    { label: '为空', value: 'is_null' },
    { label: '不为空', value: 'is_not_null' }
  ]
})

const needValueInput = computed(() => {
  if (props.needTagValueInput) {
    return props.needTagValueInput(localCondition.value)
  }
  // 默认逻辑：为空和不为空操作符不需要值输入
  return !['is_null', 'is_not_null'].includes(localCondition.value.operator || '')
})

const valuePlaceholder = computed(() => {
  if (props.getTagValuePlaceholder) {
    return props.getTagValuePlaceholder(localCondition.value)
  }
  return '请输入值'
})

const valueInputType = computed(() => {
  // 根据标签类型和操作符确定输入类型
  const tagPath = localCondition.value.tagPath
  if (!tagPath || tagPath.length === 0) return 'text'
  
  const lastTag = tagPath[tagPath.length - 1]
  if (['age', 'visit_count', 'purchase_amount'].includes(lastTag)) {
    return 'number'
  }
  if (['gender', 'city'].includes(lastTag)) {
    return 'select'
  }
  return 'text'
})

const valueOptions = computed(() => {
  if (props.getTagValueOptions) {
    return props.getTagValueOptions(localCondition.value)
  }
  
  // 默认选项
  const tagPath = localCondition.value.tagPath
  if (!tagPath || tagPath.length === 0) return []
  
  const lastTag = tagPath[tagPath.length - 1]
  if (lastTag === 'gender') {
    return [
      { label: '男', value: 'male' },
      { label: '女', value: 'female' }
    ]
  }
  if (lastTag === 'city') {
    return [
      { label: '北京', value: 'beijing' },
      { label: '上海', value: 'shanghai' },
      { label: '广州', value: 'guangzhou' },
      { label: '深圳', value: 'shenzhen' }
    ]
  }
  return []
})

const showAdvancedConfig = computed(() => {
  // 当选择了标签和操作符后显示高级配置
  return localCondition.value.tagPath && localCondition.value.operator
})

const showTimeRangeText = computed(() => {
  return localCondition.value.dateType && (localCondition.value.dateRange || (localCondition.value.dynamicValue && localCondition.value.dynamicUnit))
})

// 显示文本方法
const getTagDisplayName = () => {
  if (!localCondition.value.tagPath || localCondition.value.tagPath.length === 0) {
    return '请选择标签'
  }
  const tagPath = localCondition.value.tagPath
  const lastTag = tagPath[tagPath.length - 1]
  
  // 根据标签路径生成显示名称
  const tagMap: Record<string, string> = {
    'age': '年龄',
    'gender': '性别', 
    'city': '城市',
    'visit_count': '访问次数',
    'purchase_amount': '购买金额'
  }
  
  return tagMap[lastTag] || lastTag
}

const getOperatorDisplayName = () => {
  if (!localCondition.value.operator) {
    return ''
  }
  
  const operatorMap: Record<string, string> = {
    'eq': '等于',
    'ne': '不等于',
    'gt': '大于',
    'gte': '大于等于',
    'lt': '小于',
    'lte': '小于等于',
    'contains': '包含',
    'not_contains': '不包含',
    'is_null': '为空',
    'is_not_null': '不为空'
  }
  
  return operatorMap[localCondition.value.operator] || localCondition.value.operator
}

const getValueDisplayText = () => {
  if (!localCondition.value.value) {
    return ''
  }
  
  // 如果是选择类型，显示对应的标签
  if (valueInputType.value === 'select') {
    const option = valueOptions.value.find(opt => opt.value === localCondition.value.value)
    return option ? option.label : localCondition.value.value
  }
  
  return localCondition.value.value
}

const getTimeRangeDisplayText = () => {
  if (localCondition.value.dateType === 'dynamic' && localCondition.value.dynamicValue && localCondition.value.dynamicUnit) {
    const unitMap: Record<string, string> = {
      'days': '天',
      'weeks': '周', 
      'months': '月'
    }
    return `（最近${localCondition.value.dynamicValue}${unitMap[localCondition.value.dynamicUnit] || localCondition.value.dynamicUnit}）`
  }
  
  if (localCondition.value.dateType === 'fixed' && localCondition.value.dateRange) {
    return `（${localCondition.value.dateRange[0]} 至 ${localCondition.value.dateRange[1]}）`
  }
  
  return ''
}

// 方法
const toggleEditing = () => {
  if (props.editable) {
    isEditing.value = !isEditing.value
  }
}

const onTagChange = (value: string[]) => {
  localCondition.value.tagPath = value
  // 清空操作符和值
  localCondition.value.operator = undefined
  localCondition.value.value = undefined
  emitUpdate()
}

const onOperatorChange = (value: string) => {
  localCondition.value.operator = value
  // 如果是为空或不为空操作符，清空值
  if (['is_null', 'is_not_null'].includes(value)) {
    localCondition.value.value = undefined
  }
  emitUpdate()
}

const onValueChange = (value: string | number) => {
  localCondition.value.value = String(value)
  emitUpdate()
}

const onDateTypeChange = (value: string) => {
  localCondition.value.dateType = value
  // 清空相关配置
  if (value === 'dynamic') {
    localCondition.value.dateRange = undefined
  } else if (value === 'fixed') {
    localCondition.value.dynamicValue = undefined
    localCondition.value.dynamicUnit = undefined
  }
  emitUpdate()
}

const onDynamicValueChange = (value: number) => {
  localCondition.value.dynamicValue = value
  emitUpdate()
}

const onDynamicUnitChange = (value: string) => {
  localCondition.value.dynamicUnit = value
  emitUpdate()
}

const onDateRangeChange = (value: [string, string]) => {
  localCondition.value.dateRange = value
  emitUpdate()
}

const emitUpdate = () => {
  emit('updateCondition', { ...localCondition.value })
}

// 监听props变化
watch(() => props.condition, (newCondition) => {
  localCondition.value = { ...newCondition }
}, { deep: true })

// 点击外部关闭编辑模式
const handleClickOutside = (event: MouseEvent) => {
  if (conditionRef.value && !conditionRef.value.contains(event.target as Node)) {
    isEditing.value = false
  }
}

// 初始化
onMounted(() => {
  // 设置默认数据源类型
  if (!localCondition.value.dataSourceType) {
    localCondition.value.dataSourceType = 'attribute'
  }
  
  // 添加点击外部事件监听
  document.addEventListener('click', handleClickOutside)
})

// 清理事件监听器
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* 标签条件行 - 水平布局 */
.tag-condition-row {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 8px 12px;
  background: #fafafa;
  border-radius: 4px;
  margin-bottom: 4px;
}

.tag-config {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  flex: 1;
  min-width: 0; /* 防止flex子项溢出 */
}

.tag-config .form-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.tag-config .form-group:nth-child(1) {
  flex: 0 0 35%; /* 标签选择器 */
}

.tag-config .form-group:nth-child(2) {
  flex: 0 0 20%; /* 操作符 */
}

.tag-config .form-group:nth-child(3) {
  flex: 0 0 30%; /* 值输入框 */
}

.tag-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 0 0 15%;
  justify-content: flex-end;
}

/* 表单标签优化 */
.form-label {
  font-size: 10px;
  color: #666;
  margin: 0 0 2px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 表单控件优化 */
.form-control {
  font-size: 12px;
  min-width: 0;
}

/* 操作按钮样式 */
.action-btn {
  padding: 0;
  width: 20px;
  height: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-3);
  opacity: 0.7;
  transition: all 0.2s;
}

.delete-btn:hover {
  color: var(--color-danger-6);
  opacity: 1;
  background: var(--color-danger-1);
}

/* 高级配置样式 */
.advanced-config {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  margin-top: 8px;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 4px;
  border: 1px solid #e9ecef;
}

.time-config {
  flex: 0 0 25%;
}

.dynamic-time-config,
.fixed-time-config {
  flex: 0 0 40%;
}

.dynamic-time-wrapper {
  display: flex;
  align-items: center;
  gap: 4px;
}

.dynamic-prefix {
  font-size: 12px;
  color: var(--color-text-2);
  white-space: nowrap;
}

.dynamic-value {
  width: 80px;
}

.dynamic-unit {
  width: 60px;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .tag-condition-row {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  
  .tag-config {
    flex-direction: column;
    gap: 8px;
  }
  
  .tag-config .form-group {
    flex: 1;
  }
  
  .tag-actions {
    flex: none;
    justify-content: center;
  }
  
  .advanced-config {
    flex-direction: column;
    gap: 8px;
  }
  
  .time-config,
  .dynamic-time-config,
  .fixed-time-config {
    flex: 1;
  }
  
  .dynamic-time-wrapper {
    flex-direction: column;
    gap: 4px;
  }
  
  .dynamic-value,
  .dynamic-unit {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .tag-condition-row {
    padding: 6px 8px;
  }
  
  .form-label {
    font-size: 9px;
  }
  
  .form-control {
    font-size: 11px;
  }
  
  .action-btn {
    width: 18px;
    height: 18px;
  }
}
</style>