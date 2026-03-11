<template>
  <div class="detail-condition-form">
    <!-- 明细数据条件行 - 水平布局 -->
    <div class="detail-condition-row">
      <div class="detail-config">
        <div class="form-group">
          <label class="form-label">数据源</label>
          <a-select 
            v-model="localCondition.dataSource" 
            class="form-control"
            placeholder="选择数据源"
            :options="dataSourceOptions"
            :disabled="!editable"
            size="small"
            @change="onDataSourceChange"
          />
        </div>

        <div class="form-group">
          <label class="form-label">字段</label>
          <a-select 
            v-model="localCondition.field" 
            class="form-control"
            placeholder="选择字段"
            :options="fieldOptions"
            :loading="fieldOptionsLoading"
            :disabled="!editable || !localCondition.dataSource"
            allow-search
            allow-clear
            size="small"
            @change="onFieldChange"
          />
        </div>

        <div class="form-group">
          <label class="form-label">操作符</label>
          <a-select 
            v-model="localCondition.operator" 
            class="form-control"
            placeholder="选择操作符"
            :options="operatorOptions"
            :disabled="!editable"
            size="small"
            @change="onOperatorChange"
          />
        </div>

        <div v-if="needValueInput" class="form-group">
          <label class="form-label">值</label>
          <a-input 
            v-if="valueInputType === 'text'"
            v-model="localCondition.value" 
            class="form-control"
            :placeholder="valuePlaceholder"
            :disabled="!editable"
            size="small"
            @change="onValueChange"
          />
          <a-input-number 
            v-else-if="valueInputType === 'number'"
            v-model="localCondition.value" 
            class="form-control"
            :placeholder="valuePlaceholder"
            :disabled="!editable"
            size="small"
            @change="onValueChange"
          />
          <a-select 
            v-else-if="valueInputType === 'select'"
            v-model="localCondition.value" 
            class="form-control"
            :placeholder="valuePlaceholder"
            :options="valueOptions"
            :disabled="!editable"
            allow-search
            allow-clear
            size="small"
            @change="onValueChange"
          />
        </div>
      </div>

      <div class="detail-actions">
        <a-button 
          v-if="editable" 
          type="text" 
          size="mini" 
          class="action-btn delete-btn"
          @click="$emit('removeCondition')"
        >
          <template #icon><IconMinus /></template>
        </a-button>
      </div>
    </div>

    <!-- 高级配置 - 时间范围 -->
    <div v-if="showTimeConfig" class="advanced-config">
      <div class="form-group time-config">
        <label class="form-label">时间类型</label>
        <a-select 
          v-model="localCondition.dateType" 
          class="form-control"
          placeholder="请选择时间类型"
          :options="dateTypeOptions"
          :disabled="!editable"
          size="small"
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
            size="small"
            :disabled="!editable"
            @change="onDynamicValueChange"
          />
          <a-select 
            v-model="localCondition.dynamicUnit" 
            class="dynamic-unit form-control"
            :options="dynamicUnitOptions"
            size="small"
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
          size="small"
          @change="onDateRangeChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { IconStorage, IconMinus, IconPlus } from '@arco-design/web-vue/es/icon'

// 类型定义
interface Filter {
  field?: string
  operator?: string
  value?: string | number
}

interface Condition {
  id?: string
  dataSourceType?: string
  dataSource?: string
  field?: string
  aggregation?: string
  operator?: string
  value?: string | number
  filters?: Filter[]
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
  getDataSourceOptions?: (() => Option[]) | null
  getFieldOptions?: ((dataSource: string) => Option[]) | null
  getAggregationOptions?: ((field: string) => Option[]) | null
  getDetailOperatorOptions?: (() => Option[]) | null
  getDetailValueOptions?: ((condition: Condition) => Option[]) | null
  needDetailValueInput?: ((condition: Condition) => boolean) | null
  getDetailValuePlaceholder?: ((condition: Condition) => string) | null
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
const dataSourceOptionsLoading = ref(false)
const fieldOptionsLoading = ref(false)
const isEditing = ref(false)

// 计算属性
const dataSourceOptions = computed(() => {
  return props.getDataSourceOptions?.() || [
    { label: '用户表', value: 'users' },
    { label: '订单表', value: 'orders' },
    { label: '商品表', value: 'products' },
    { label: '行为日志表', value: 'behavior_logs' },
    { label: '会员表', value: 'members' }
  ]
})

const fieldOptions = computed(() => {
  if (!localCondition.value.dataSource) return []
  
  if (props.getFieldOptions) {
    return props.getFieldOptions(localCondition.value.dataSource)
  }
  
  // 默认字段选项
  const defaultFields: Record<string, Option[]> = {
    users: [
      { label: '用户ID', value: 'user_id' },
      { label: '用户名', value: 'username' },
      { label: '年龄', value: 'age' },
      { label: '性别', value: 'gender' },
      { label: '城市', value: 'city' },
      { label: '注册时间', value: 'created_at' },
      { label: '最后登录时间', value: 'last_login_at' }
    ],
    orders: [
      { label: '订单ID', value: 'order_id' },
      { label: '用户ID', value: 'user_id' },
      { label: '订单金额', value: 'amount' },
      { label: '订单状态', value: 'status' },
      { label: '创建时间', value: 'created_at' },
      { label: '支付时间', value: 'paid_at' }
    ],
    products: [
      { label: '商品ID', value: 'product_id' },
      { label: '商品名称', value: 'name' },
      { label: '价格', value: 'price' },
      { label: '分类', value: 'category' },
      { label: '库存', value: 'stock' }
    ],
    behavior_logs: [
      { label: '事件名称', value: 'event_name' },
      { label: '用户ID', value: 'user_id' },
      { label: '页面URL', value: 'page_url' },
      { label: '事件时间', value: 'event_time' },
      { label: '设备类型', value: 'device_type' }
    ],
    members: [
      { label: '会员ID', value: 'member_id' },
      { label: '会员等级', value: 'level' },
      { label: '积分', value: 'points' },
      { label: '开通时间', value: 'created_at' },
      { label: '到期时间', value: 'expired_at' }
    ]
  }
  
  return defaultFields[localCondition.value.dataSource] || []
})

const showAggregation = computed(() => {
  // 数值类型字段显示聚合选项
  const numericFields = ['age', 'amount', 'price', 'stock', 'points']
  return localCondition.value.field && numericFields.includes(localCondition.value.field)
})

const aggregationOptions = computed(() => {
  if (props.getAggregationOptions && localCondition.value.field) {
    return props.getAggregationOptions(localCondition.value.field)
  }
  
  return [
    { label: '求和', value: 'sum' },
    { label: '平均值', value: 'avg' },
    { label: '最大值', value: 'max' },
    { label: '最小值', value: 'min' },
    { label: '计数', value: 'count' },
    { label: '去重计数', value: 'count_distinct' }
  ]
})

const operatorOptions = computed(() => {
  return props.getDetailOperatorOptions?.() || [
    { label: '等于', value: 'eq' },
    { label: '不等于', value: 'ne' },
    { label: '大于', value: 'gt' },
    { label: '大于等于', value: 'gte' },
    { label: '小于', value: 'lt' },
    { label: '小于等于', value: 'lte' },
    { label: '包含', value: 'contains' },
    { label: '不包含', value: 'not_contains' },
    { label: '为空', value: 'is_null' },
    { label: '不为空', value: 'is_not_null' },
    { label: '在范围内', value: 'in' },
    { label: '不在范围内', value: 'not_in' }
  ]
})

const filterOperatorOptions = computed(() => [
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
  if (props.needDetailValueInput) {
    return props.needDetailValueInput(localCondition.value)
  }
  return !['is_null', 'is_not_null'].includes(localCondition.value.operator || '')
})

const valuePlaceholder = computed(() => {
  if (props.getDetailValuePlaceholder) {
    return props.getDetailValuePlaceholder(localCondition.value)
  }
  return '请输入值'
})

const valueInputType = computed(() => {
  const field = localCondition.value.field
  if (!field) return 'text'
  
  const numericFields = ['age', 'amount', 'price', 'stock', 'points']
  const dateFields = ['created_at', 'last_login_at', 'paid_at', 'event_time', 'expired_at']
  const selectFields = ['gender', 'status', 'category', 'level', 'device_type']
  
  if (numericFields.includes(field)) return 'number'
  if (dateFields.includes(field)) return 'date'
  if (selectFields.includes(field)) return 'select'
  return 'text'
})

const valueOptions = computed(() => {
  if (props.getDetailValueOptions) {
    return props.getDetailValueOptions(localCondition.value)
  }
  
  const field = localCondition.value.field
  if (!field) return []
  
  const defaultOptions: Record<string, Option[]> = {
    gender: [
      { label: '男', value: 'male' },
      { label: '女', value: 'female' }
    ],
    status: [
      { label: '待支付', value: 'pending' },
      { label: '已支付', value: 'paid' },
      { label: '已发货', value: 'shipped' },
      { label: '已完成', value: 'completed' },
      { label: '已取消', value: 'cancelled' }
    ],
    category: [
      { label: '电子产品', value: 'electronics' },
      { label: '服装', value: 'clothing' },
      { label: '食品', value: 'food' },
      { label: '图书', value: 'books' }
    ],
    level: [
      { label: '普通会员', value: 'normal' },
      { label: '银卡会员', value: 'silver' },
      { label: '金卡会员', value: 'gold' },
      { label: '钻石会员', value: 'diamond' }
    ],
    device_type: [
      { label: 'PC', value: 'pc' },
      { label: '移动端', value: 'mobile' },
      { label: '平板', value: 'tablet' }
    ]
  }
  
  return defaultOptions[field] || []
})

const showFilters = computed(() => {
  return localCondition.value.dataSource && localCondition.value.field
})

const showTimeConfig = computed(() => {
  return localCondition.value.dataSource && localCondition.value.field && localCondition.value.operator
})

const showTimeRangeText = computed(() => {
  return localCondition.value.dateType && (
    (localCondition.value.dateType === 'dynamic' && localCondition.value.dynamicValue && localCondition.value.dynamicUnit) ||
    (localCondition.value.dateType === 'fixed' && localCondition.value.dateRange)
  )
})

// 方法
const getDataSourceDisplayName = () => {
  if (!localCondition.value.dataSource) return ''
  const option = dataSourceOptions.value.find(opt => opt.value === localCondition.value.dataSource)
  return option ? option.label : localCondition.value.dataSource
}

const getFieldDisplayName = () => {
  if (!localCondition.value.field) return ''
  const option = fieldOptions.value.find(opt => opt.value === localCondition.value.field)
  return option ? option.label : localCondition.value.field
}

const getOperatorDisplayName = () => {
  if (!localCondition.value.operator) return ''
  const option = operatorOptions.value.find(opt => opt.value === localCondition.value.operator)
  return option ? option.label : localCondition.value.operator
}

const getValueDisplayText = () => {
  if (localCondition.value.value === undefined || localCondition.value.value === null || localCondition.value.value === '') return ''
  
  if (valueInputType.value === 'select') {
    const option = valueOptions.value.find(opt => opt.value === localCondition.value.value)
    return option ? option.label : String(localCondition.value.value)
  }
  
  return String(localCondition.value.value)
}

const getTimeRangeDisplayText = () => {
  if (localCondition.value.dateType === 'dynamic' && localCondition.value.dynamicValue && localCondition.value.dynamicUnit) {
    const unitOption = props.dynamicUnitOptions.find(opt => opt.value === localCondition.value.dynamicUnit)
    const unitLabel = unitOption ? unitOption.label : localCondition.value.dynamicUnit
    return `最近${localCondition.value.dynamicValue}${unitLabel}`
  }
  
  if (localCondition.value.dateType === 'fixed' && localCondition.value.dateRange) {
    return `${localCondition.value.dateRange[0]} 至 ${localCondition.value.dateRange[1]}`
  }
  
  return ''
}

const onDataSourceChange = (value: string) => {
  localCondition.value.dataSource = value
  // 清空字段、聚合、操作符、值和过滤条件
  localCondition.value.field = undefined
  localCondition.value.aggregation = undefined
  localCondition.value.operator = undefined
  localCondition.value.value = undefined
  localCondition.value.filters = []
  emitUpdate()
}

const onFieldChange = (value: string) => {
  localCondition.value.field = value
  // 清空聚合、操作符和值
  localCondition.value.aggregation = undefined
  localCondition.value.operator = undefined
  localCondition.value.value = undefined
  emitUpdate()
}

const onAggregationChange = (value: string) => {
  localCondition.value.aggregation = value
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
  localCondition.value.value = value
  emitUpdate()
}

const addFilter = () => {
  if (!localCondition.value.filters) {
    localCondition.value.filters = []
  }
  localCondition.value.filters.push({
    field: undefined,
    operator: undefined,
    value: undefined
  })
  emitUpdate()
}

const removeFilter = (index: number) => {
  if (localCondition.value.filters) {
    localCondition.value.filters.splice(index, 1)
    emitUpdate()
  }
}

const onFilterChange = (index: number) => {
  emitUpdate()
}

const needFilterValueInput = (filter: Filter): boolean => {
  return filter.operator && !['is_null', 'is_not_null'].includes(filter.operator)
}

const getFilterValueType = (filter: Filter): string => {
  const field = filter.field
  if (!field) return 'text'
  
  const numericFields = ['age', 'amount', 'price', 'stock', 'points']
  const dateFields = ['created_at', 'last_login_at', 'paid_at', 'event_time', 'expired_at']
  
  if (numericFields.includes(field)) return 'number'
  if (dateFields.includes(field)) return 'date'
  return 'text'
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
    localCondition.value.dataSourceType = 'detail'
  }
  // 初始化过滤条件数组
  if (!localCondition.value.filters) {
    localCondition.value.filters = []
  }
})
</script>

<style scoped>
/* 明细数据条件行 - 水平布局 */
.detail-condition-row {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 8px 12px;
  background: #fafafa;
  border-radius: 4px;
  margin-bottom: 4px;
}

.detail-config {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  flex: 1;
  min-width: 0; /* 防止flex子项溢出 */
}

.detail-config .form-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.detail-config .form-group:nth-child(1) {
  flex: 0 0 25%; /* 数据源选择器 */
}

.detail-config .form-group:nth-child(2) {
  flex: 0 0 25%; /* 字段选择器 */
}

.detail-config .form-group:nth-child(3) {
  flex: 0 0 20%; /* 操作符 */
}

.detail-config .form-group:nth-child(4) {
  flex: 0 0 25%; /* 值输入框 */
}

.detail-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 0 0 5%;
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

/* 高级配置区域 */
.advanced-config {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 8px 12px;
  background: #f5f5f5;
  border-radius: 4px;
  margin-top: 4px;
}

.advanced-config .form-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

/* 时间配置区域 */
.time-config {
  flex: 0 0 25%;
}

.dynamic-time-config,
.fixed-time-config {
  flex: 1;
}

.dynamic-time-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.dynamic-prefix {
  font-size: 12px;
  color: var(--color-text-2);
  white-space: nowrap;
}

.dynamic-value {
  width: 60px;
}

.dynamic-unit {
  width: 80px;
}

.hidden-form {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  padding: 8px;
  border: 1px solid var(--color-border-2);
  border-radius: 6px;
  background: var(--color-bg-1);
  margin-top: 8px;
}

.hidden-time-form {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  padding: 8px;
  border: 1px solid var(--color-border-3);
  border-radius: 6px;
  background: var(--color-bg-2);
  margin-top: 8px;
}

.inline-form-group {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: fit-content;
}

.inline-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-2);
  white-space: nowrap;
  min-width: fit-content;
}

.inline-select {
  min-width: 120px;
  max-width: 160px;
}

.inline-input {
  min-width: 100px;
  max-width: 140px;
}

.dynamic-time-inline {
  display: flex;
  align-items: center;
  gap: 6px;
}

.inline-date-picker {
  min-width: 200px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .condition-text {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .data-source-name,
  .field-name,
  .operator-text,
  .value-text {
    font-size: 13px;
  }
  
  .time-range-text {
    font-size: 11px;
  }
  
  .text-delete-btn {
    padding: 1px 3px;
    font-size: 12px;
  }
  
  .hidden-form,
  .hidden-time-form {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    padding: 6px;
  }
  
  .inline-form-group {
    width: 100%;
    justify-content: space-between;
  }
  
  .inline-select,
  .inline-input {
    min-width: 140px;
    max-width: none;
    flex: 1;
  }
  
  .dynamic-time-inline {
    flex-wrap: wrap;
    gap: 4px;
  }
  
  .inline-date-picker {
    min-width: 180px;
  }
}
</style>