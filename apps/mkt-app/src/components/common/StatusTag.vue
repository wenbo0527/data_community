<template>
  <a-tag :color="meta?.color || 'default'">{{ meta?.label || status || '—' }}</a-tag>
</template>

<script setup>
/**
 * P0-管理-#1 BUG-A 修复: StatusTag 之前只接 text+color props, 11 个页面传 status+dictKey 错配 → 状态列空白
 * 现在接 status+dictKey, 内部查 STATUS_DICTIONARY 返回 {label, color}
 * 兼容: 仍接 text+color (向后兼容)
 */
import { computed } from 'vue'
import { STATUS_DICTIONARY } from '@/constants/status'

const props = defineProps({
  // 新接口 (P0-管理-#1)
  status: { type: [String, Number, Boolean], default: '' },
  dictKey: { type: String, default: '' },
  // 旧接口 (向后兼容, 不传 dictKey 时)
  text: { type: String, default: '' },
  color: { type: String, default: 'default' }
})

const meta = computed(() => {
  // 新接口: status+dictKey
  if (props.dictKey && STATUS_DICTIONARY[props.dictKey]) {
    const dict = STATUS_DICTIONARY[props.dictKey]
    // 处理 boolean/number 转 string key
    const key = String(props.status)
    return dict[key] || null
  }
  // 旧接口兼容: 直接显示 text+color
  if (props.text) {
    return { label: props.text, color: props.color }
  }
  // status 无 dictKey 也无 text
  return { label: String(props.status || ''), color: 'default' }
})
</script>
