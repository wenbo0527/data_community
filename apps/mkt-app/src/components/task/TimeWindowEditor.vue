<template>
  <div class="time-window-editor">
    <!-- 触发器：tag 形式展示当前选择 -->
    <a-dropdown trigger="click" position="bl">
      <a-tag
        :color="getTagColor()"
        class="tw-trigger"
        :closable="hasValue"
        @close="(e: MouseEvent) => { e.stopPropagation(); handleClear() }"
      >
        <IconClockCircle class="tw-icon" />
        <span class="tw-text">{{ getDisplayLabel() }}</span>
        <span class="tw-caret">▾</span>
      </a-tag>

      <template #content>
        <!-- 预设列表 -->
        <div v-if="mergedPresets.length > 0" class="tw-section">
          <div class="tw-section-title">常用预设</div>
          <a-doption
            v-for="preset in mergedPresets"
            :key="preset.key"
            @click="applyPreset(preset)"
          >
            <span class="tw-preset-label">{{ preset.label }}</span>
            <span v-if="preset.description" class="tw-preset-desc">
              {{ preset.description }}
            </span>
          </a-doption>
        </div>

        <a-divider v-if="mergedPresets.length > 0 && allowCustomNumber" style="margin: 4px 0;" />

        <!-- 自定义：数值 + 单位 -->
        <div v-if="allowCustomNumber" class="tw-custom-area">
          <div class="tw-section-title">自定义时长</div>
          <a-input-number
            v-model="localCustomValue"
            :min="1"
            :max="9999"
            size="mini"
            placeholder="数值"
            class="tw-custom-input"
          />
          <a-select v-model="localCustomUnit" size="mini" class="tw-custom-unit">
            <a-option value="day">天</a-option>
            <a-option value="hour">小时</a-option>
            <a-option value="minute">分钟</a-option>
          </a-select>
          <a-button type="primary" size="mini" @click="handleApplyCustom">
            确定
          </a-button>
        </div>

        <a-divider v-if="allowCustomRange" style="margin: 4px 0;" />

        <!-- 自定义日期范围 -->
        <div v-if="allowCustomRange" class="tw-custom-range">
          <a-button
            type="outline"
            size="mini"
            long
            @click="handleOpenCustomRange"
          >
            <template #icon><IconCalendar /></template>
            自定义日期范围
          </a-button>
        </div>
      </template>
    </a-dropdown>

    <!-- 自定义日期范围：内嵌 popover（简化：点击按钮后立刻打开 range picker） -->
    <a-popover
      v-if="allowCustomRange"
      v-model:visible="rangePickerVisible"
      trigger="click"
      position="bl"
      :show-arrow="false"
    >
      <template #content>
        <div class="tw-range-popover">
          <div class="tw-section-title">选择起止日期</div>
          <a-range-picker
            v-model:model-value="localRange"
            size="small"
            @change="handleRangeChange"
          />
          <div class="tw-range-actions">
            <a-button size="mini" @click="rangePickerVisible = false">取消</a-button>
            <a-button
              type="primary"
              size="mini"
              :disabled="!localRange || localRange.length < 2"
              @click="handleApplyRange"
            >
              确定
            </a-button>
          </div>
        </div>
      </template>
      <span ref="rangeTriggerRef" class="tw-hidden-trigger" />
    </a-popover>
  </div>
</template>

<script setup lang="ts">
/**
 * 时间窗口编辑器 - 可独立复用的动态组件
 *
 * 支持：
 * - 外部传入预设列表（props.presets）
 * - 自定义数值 + 时间单位
 * - 自定义日期范围
 *
 * 双向绑定：
 * - v-model:timeMode      ('last_n' | 'range' | null)
 * - v-model:timeValue     (number | null)
 * - v-model:timeUnit      ('day' | 'hour' | 'minute' | null)
 * - v-model:timeWindowCustom (string[] | null)
 */
import { computed, ref, watch } from 'vue'
import { IconClockCircle, IconCalendar } from '@arco-design/web-vue/es/icon'

type TimeMode = 'last_n' | 'range' | null
type TimeUnit = 'day' | 'hour' | 'minute' | null

export interface TimePreset {
  key: string
  label: string
  value: number
  unit: NonNullable<TimeUnit>
  description?: string
  builtin?: boolean  // 标识内置预设（用于未来扩展：自定义预设排在后面）
}

// ============ 默认预设（使用方未指定时内置） ============
const DEFAULT_PRESETS: TimePreset[] = [
  { key: 'today',     label: '今天',       value: 1,  unit: 'day',   description: '近 1 天',  builtin: true },
  { key: '7d',        label: '近 7 天',    value: 7,  unit: 'day',   builtin: true },
  { key: '14d',       label: '近 14 天',   value: 14, unit: 'day',   builtin: true },
  { key: '30d',       label: '近 30 天',   value: 30, unit: 'day',   builtin: true },
  { key: '90d',       label: '近 90 天',   value: 90, unit: 'day',   description: '季度分析', builtin: true },
  { key: '24h',       label: '近 24 小时', value: 24, unit: 'hour',  description: '实时活动', builtin: true },
  { key: '1h',        label: '近 1 小时',  value: 1,  unit: 'hour',  builtin: true },
  { key: '60min',     label: '近 60 分钟', value: 60, unit: 'minute', builtin: true },
]

// ============ Props ============
interface Props {
  timeMode?: TimeMode
  timeValue?: number | null
  timeUnit?: TimeUnit
  timeWindowCustom?: any
  presets?: TimePreset[]
  allowCustomNumber?: boolean
  allowCustomRange?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  timeMode: null,
  timeValue: null,
  timeUnit: null,
  timeWindowCustom: null,
  presets: () => [],
  allowCustomNumber: true,
  allowCustomRange: true,
})

// ============ Emits (v-model) ============
const emit = defineEmits<{
  'update:timeMode': [val: TimeMode]
  'update:timeValue': [val: number | null]
  'update:timeUnit': [val: TimeUnit]
  'update:timeWindowCustom': [val: any]
  'change': [payload: { mode: TimeMode; value: number | null; unit: TimeUnit; range: any }]
}>()

// ============ 合并预设（外部传入优先，未传入则用默认） ============
const mergedPresets = computed<TimePreset[]>(() => {
  if (props.presets && props.presets.length > 0) {
    return props.presets
  }
  return DEFAULT_PRESETS
})

// ============ 内部状态 ============
const localCustomValue = ref<number | undefined>(undefined)
const localCustomUnit = ref<NonNullable<TimeUnit>>('day')
const localRange = ref<any>(props.timeWindowCustom)
const rangePickerVisible = ref(false)

// 监听外部变化
watch(() => props.timeWindowCustom, (val) => {
  localRange.value = val
})
watch(() => props.timeValue, (val) => {
  if (val && !localCustomValue.value) {
    localCustomValue.value = val
  }
})

// ============ 计算属性 ============
const hasValue = computed(() => props.timeMode !== null)

// 时间单位中文
const timeUnitMap: Record<string, string> = {
  day: '天',
  hour: '小时',
  minute: '分钟',
}

// 当前值显示文本
const getDisplayLabel = (): string => {
  if (props.timeMode === 'range' && props.timeWindowCustom) {
    const arr = props.timeWindowCustom
    if (Array.isArray(arr) && arr.length >= 2) {
      return `${arr[0]} 至 ${arr[1]}`
    }
    return '自定义日期范围'
  }
  if (props.timeValue && props.timeUnit) {
    return `近 ${props.timeValue} ${timeUnitMap[props.timeUnit] || ''}内`
  }
  return '请选择时间'
}

// Tag 颜色
const getTagColor = (): string => {
  if (!hasValue.value) return 'gray'
  if (props.timeMode === 'range') return 'purple'
  return 'arcoblue'
}

// ============ 操作 ============
// 应用预设
const applyPreset = (preset: TimePreset) => {
  emit('update:timeMode', 'last_n')
  emit('update:timeValue', preset.value)
  emit('update:timeUnit', preset.unit)
  emit('update:timeWindowCustom', null)
  emit('change', { mode: 'last_n', value: preset.value, unit: preset.unit, range: null })
}

// 应用自定义数值
const handleApplyCustom = () => {
  if (!localCustomValue.value || localCustomValue.value < 1) return
  emit('update:timeMode', 'last_n')
  emit('update:timeValue', localCustomValue.value)
  emit('update:timeUnit', localCustomUnit.value)
  emit('update:timeWindowCustom', null)
  emit('change', { mode: 'last_n', value: localCustomValue.value, unit: localCustomUnit.value, range: null })
}

// 打开自定义日期范围
const handleOpenCustomRange = () => {
  rangePickerVisible.value = true
}

const handleRangeChange = (val: any) => {
  localRange.value = val
}

const handleApplyRange = () => {
  if (!localRange.value || (Array.isArray(localRange.value) && localRange.value.length < 2)) {
    return
  }
  emit('update:timeMode', 'range')
  emit('update:timeValue', null)
  emit('update:timeUnit', null)
  emit('update:timeWindowCustom', localRange.value)
  emit('change', { mode: 'range', value: null, unit: null, range: localRange.value })
  rangePickerVisible.value = false
}

// 清空
const handleClear = () => {
  emit('update:timeMode', null)
  emit('update:timeValue', null)
  emit('update:timeUnit', null)
  emit('update:timeWindowCustom', null)
  emit('change', { mode: null, value: null, unit: null, range: null })
}
</script>

<style scoped>
.time-window-editor {
  display: inline-block;
}

.tw-trigger {
  cursor: pointer;
  user-select: none;
  font-size: 13px;
  padding: 2px 10px;
  border-radius: 14px;
  height: 26px;
  line-height: 22px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: 500;
  transition: all 0.2s;
}

.tw-trigger:hover {
  transform: scale(1.02);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.tw-icon {
  font-size: 12px;
  margin-right: 2px;
}

.tw-text {
  white-space: nowrap;
}

.tw-caret {
  font-size: 10px;
  margin-left: 4px;
  opacity: 0.6;
}

.tw-section {
  padding: 4px 0;
  min-width: 200px;
}

.tw-section-title {
  padding: 4px 12px;
  font-size: 12px;
  color: #86909c;
  font-weight: 500;
}

.tw-preset-label {
  font-weight: 500;
}

.tw-preset-desc {
  font-size: 11px;
  color: #86909c;
  margin-left: 4px;
}

.tw-custom-area {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  min-width: 240px;
}

.tw-custom-input {
  width: 90px;
}

.tw-custom-unit {
  width: 80px;
}

.tw-custom-range {
  padding: 8px 12px;
  min-width: 180px;
}

.tw-range-popover {
  padding: 8px 4px;
  min-width: 280px;
}

.tw-range-actions {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
  margin-top: 12px;
  padding: 0 4px 4px;
}

/* 隐藏 popover 触发点 */
.tw-hidden-trigger {
  display: inline-block;
  width: 0;
  height: 0;
  position: absolute;
  pointer-events: none;
}

/* 移除 tag 默认 × 按钮的 hover 变色 */
.tw-trigger :deep(.arco-tag-close-btn) {
  color: inherit;
  opacity: 0.5;
  margin-left: 2px;
}

.tw-trigger :deep(.arco-tag-close-btn:hover) {
  opacity: 1;
  color: #f53f3f;
}

/* arco doption 中的内容居中 */
:deep(.arco-dropdown-option) {
  padding: 6px 12px;
}
</style>
