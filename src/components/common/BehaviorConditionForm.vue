<template>
  <div class="behavior-condition-form">
    <!-- 行为条件行 - 水平布局 -->
    <div class="behavior-condition-row">
      <div class="behavior-config">
        <div class="form-group">
          <label class="form-label">行为</label>
          <a-select 
            v-model="localCondition.eventName" 
            class="form-control"
            placeholder="选择行为"
            :options="eventOptions"
            :disabled="!editable"
            @change="onEventChange"
          />
        </div>

        <div class="form-group">
          <label class="form-label">操作符</label>
          <a-select 
            v-model="localCondition.operator" 
            class="form-control"
            placeholder="选择操作符"
            :options="operatorOptions"
            :disabled="!editable || !localCondition.eventName"
            @change="onOperatorChange"
          />
        </div>

        <div v-if="needValueInput" class="form-group">
          <label class="form-label">值</label>
          <a-input-number 
            v-model="localCondition.value" 
            class="form-control"
            :placeholder="valuePlaceholder"
            :min="0"
            :disabled="!editable"
            @change="onValueChange"
          />
        </div>
      </div>

      <div class="behavior-actions">
        <a-button 
          v-if="editable" 
          type="text" 
          size="mini" 
          class="action-btn delete-btn"
          @click="$emit('removeCondition')"
        >
          <template #icon>
            <IconMinus />
          </template>
        </a-button>
      </div>
    </div>

    <!-- 高级配置 - 时间范围 -->
    <div v-if="localCondition.eventName && showAdvancedConfig" class="advanced-config">
      <div class="form-group time-config">
        <label class="form-label">时间类型</label>
        <a-select 
          v-model="localCondition.dateType" 
          class="form-control"
          :options="dateTypeOptions"
          :disabled="!editable"
          @change="onDateTypeChange"
        />
      </div>

      <div v-if="localCondition.dateType === 'dynamic'" class="form-group dynamic-time-config">
        <label class="form-label">动态时间</label>
        <div class="dynamic-time-wrapper">
          <span class="dynamic-prefix">最近</span>
          <a-input-number 
            v-model="localCondition.dynamicValue" 
            class="dynamic-value form-control"
            :min="1"
            :max="999"
            :disabled="!editable"
            @change="onDynamicValueChange"
          />
          <a-select 
            v-model="localCondition.dynamicUnit" 
            class="dynamic-unit form-control"
            :options="dynamicUnitOptions"
            :disabled="!editable"
            @change="onDynamicUnitChange"
          />
        </div>
      </div>

      <div v-if="localCondition.dateType === 'fixed'" class="form-group fixed-time-config">
        <label class="form-label">时间范围</label>
        <a-range-picker 
          v-model="localCondition.dateRange" 
          class="form-control"
          :disabled="!editable"
          @change="onDateRangeChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { IconThunderbolt, IconMinus, IconPlus } from '@arco-design/web-vue/es/icon'

// 类型定义
interface EventProperty {
  name?: string
  operator?: string
  value?: string | number
}

interface Condition {
  id?: string
  dataSourceType?: string
  eventName?: string
  operator?: string
  value?: number
  eventProperties?: EventProperty[]
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
  getEventOptions?: (() => Option[]) | null
  getBehaviorOperatorOptions?: (() => Option[]) | null
  getEventPropertyOptions?: ((eventName: string) => Option[]) | null
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
const eventOptionsLoading = ref(false)
const isEditing = ref(false)

// 计算属性
const eventOptions = computed(() => {
  return props.getEventOptions?.() || [
    { label: '页面浏览', value: 'page_view' },
    { label: '按钮点击', value: 'button_click' },
    { label: '商品购买', value: 'purchase' },
    { label: '用户注册', value: 'register' },
    { label: '用户登录', value: 'login' },
    { label: '搜索', value: 'search' },
    { label: '分享', value: 'share' }
  ]
})

const operatorOptions = computed(() => {
  return props.getBehaviorOperatorOptions?.() || [
    { label: '发生过', value: 'occurred' },
    { label: '未发生过', value: 'not_occurred' },
    { label: '发生次数等于', value: 'count_eq' },
    { label: '发生次数大于', value: 'count_gt' },
    { label: '发生次数大于等于', value: 'count_gte' },
    { label: '发生次数小于', value: 'count_lt' },
    { label: '发生次数小于等于', value: 'count_lte' }
  ]
})

const propertyOperatorOptions = computed(() => [
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
])

const needValueInput = computed(() => {
  const operator = localCondition.value.operator
  return operator && ['count_eq', 'count_gt', 'count_gte', 'count_lt', 'count_lte'].includes(operator)
})

const valueLabel = computed(() => {
  const operator = localCondition.value.operator
  if (operator?.startsWith('count_')) {
    return '次数'
  }
  return '值'
})

const valuePlaceholder = computed(() => {
  const operator = localCondition.value.operator
  if (operator?.startsWith('count_')) {
    return '请输入次数'
  }
  return '请输入值'
})

const showTimeConfig = computed(() => {
  return localCondition.value.eventName && localCondition.value.operator
})

const showAdvancedConfig = computed(() => {
  return localCondition.value.eventName && localCondition.value.operator
})

const showTimeRangeText = computed(() => {
  return localCondition.value.dateType && (localCondition.value.dateRange || (localCondition.value.dynamicValue && localCondition.value.dynamicUnit))
})

// 方法
const getEventPropertyOptions = (eventName: string): Option[] => {
  if (props.getEventPropertyOptions) {
    return props.getEventPropertyOptions(eventName)
  }
  
  // 默认事件属性选项
  const defaultOptions: Record<string, Option[]> = {
    page_view: [
      { label: '页面URL', value: 'page_url' },
      { label: '页面标题', value: 'page_title' },
      { label: '停留时长', value: 'duration' }
    ],
    button_click: [
      { label: '按钮文本', value: 'button_text' },
      { label: '按钮ID', value: 'button_id' },
      { label: '页面URL', value: 'page_url' }
    ],
    purchase: [
      { label: '商品ID', value: 'product_id' },
      { label: '商品名称', value: 'product_name' },
      { label: '购买金额', value: 'amount' },
      { label: '购买数量', value: 'quantity' }
    ],
    register: [
      { label: '注册渠道', value: 'channel' },
      { label: '注册方式', value: 'method' }
    ],
    login: [
      { label: '登录方式', value: 'method' },
      { label: '登录设备', value: 'device' }
    ],
    search: [
      { label: '搜索关键词', value: 'keyword' },
      { label: '搜索结果数', value: 'result_count' }
    ],
    share: [
      { label: '分享平台', value: 'platform' },
      { label: '分享内容', value: 'content' }
    ]
  }
  
  return defaultOptions[eventName] || []
}

const needPropertyValueInput = (property: EventProperty): boolean => {
  return property.operator && !['is_null', 'is_not_null'].includes(property.operator)
}

const getPropertyValueType = (property: EventProperty): string => {
  const numericProperties = ['duration', 'amount', 'quantity', 'result_count']
  return numericProperties.includes(property.name || '') ? 'number' : 'text'
}

const getEventDisplayName = (): string => {
  if (!localCondition.value.eventName) return '请选择行为'
  const option = eventOptions.value.find(opt => opt.value === localCondition.value.eventName)
  return option?.label || localCondition.value.eventName
}

const getOperatorDisplayName = (): string => {
  if (!localCondition.value.operator) return ''
  const option = operatorOptions.value.find(opt => opt.value === localCondition.value.operator)
  return option?.label || localCondition.value.operator
}

const getValueDisplayText = (): string => {
  if (!needValueInput.value || localCondition.value.value === undefined) return ''
  return `${localCondition.value.value}次`
}

const getTimeRangeDisplayText = (): string => {
  if (!localCondition.value.dateType) return ''
  
  if (localCondition.value.dateType === 'dynamic' && localCondition.value.dynamicValue && localCondition.value.dynamicUnit) {
    const unitMap: Record<string, string> = {
      'days': '天',
      'weeks': '周', 
      'months': '月'
    }
    return `最近${localCondition.value.dynamicValue}${unitMap[localCondition.value.dynamicUnit] || localCondition.value.dynamicUnit}`
  }
  
  if (localCondition.value.dateType === 'fixed' && localCondition.value.dateRange) {
    return `${localCondition.value.dateRange[0]} 至 ${localCondition.value.dateRange[1]}`
  }
  
  return ''
}

const onEventChange = (value: string) => {
  localCondition.value.eventName = value
  // 清空操作符、值和事件属性
  localCondition.value.operator = undefined
  localCondition.value.value = undefined
  localCondition.value.eventProperties = []
  emitUpdate()
}

const onOperatorChange = (value: string) => {
  localCondition.value.operator = value
  // 如果不需要值输入，清空值
  if (!needValueInput.value) {
    localCondition.value.value = undefined
  }
  emitUpdate()
}

const onValueChange = (value: number) => {
  localCondition.value.value = value
  emitUpdate()
}

const addEventProperty = () => {
  if (!localCondition.value.eventProperties) {
    localCondition.value.eventProperties = []
  }
  localCondition.value.eventProperties.push({
    name: undefined,
    operator: undefined,
    value: undefined
  })
  emitUpdate()
}

const removeEventProperty = (index: number) => {
  if (localCondition.value.eventProperties) {
    localCondition.value.eventProperties.splice(index, 1)
    emitUpdate()
  }
}

const onEventPropertyChange = (index: number) => {
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

// 初始化
onMounted(() => {
  // 设置默认数据源类型
  if (!localCondition.value.dataSourceType) {
    localCondition.value.dataSourceType = 'behavior'
  }
  // 初始化事件属性数组
  if (!localCondition.value.eventProperties) {
    localCondition.value.eventProperties = []
  }
})
</script>

<style scoped>
/* 行为条件行 - 水平布局 */
.behavior-condition-row {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 8px 12px;
  background: #fafafa;
  border-radius: 4px;
  margin-bottom: 4px;
}

.behavior-config {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  flex: 1;
  min-width: 0; /* 防止flex子项溢出 */
}

.behavior-config .form-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.behavior-config .form-group:nth-child(1) {
  flex: 0 0 35%; /* 行为选择器 */
}

.behavior-config .form-group:nth-child(2) {
  flex: 0 0 20%; /* 操作符 */
}

.behavior-config .form-group:nth-child(3) {
  flex: 0 0 30%; /* 值输入框 */
}

.behavior-actions {
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

.form-section {
  border-top: 1px solid var(--color-border-2);
  padding-top: 16px;
  margin-top: 8px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.section-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-1);
}

.add-property-btn {
  color: #1890ff;
  font-size: 12px;
}

.event-properties-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.event-property-item {
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  padding: 8px;
  background: #fafafa;
}

.property-form-row {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  flex-wrap: wrap;
}

.property-actions {
  display: flex;
  align-items: flex-end;
}

.remove-property-btn {
  color: #f53f3f;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-properties {
  text-align: center;
  padding: 16px;
  color: #86909c;
}

.empty-text {
  font-size: 12px;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .behavior-condition-row {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  
  .behavior-config {
    flex-direction: column;
    gap: 8px;
  }
  
  .behavior-config .form-group {
    flex: 1;
  }
  
  .behavior-actions {
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
  .behavior-condition-row {
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