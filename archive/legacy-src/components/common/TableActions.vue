<template>
  <a-space>
    <template v-for="action in visibleActions" :key="action.key">
      <a-button
        :type="action.type || 'text'"
        :size="action.size || 'small'"
        :status="action.status"
        :disabled="action.disabled"
        @click="onClick(action)"
      >
        <template v-if="action.icon" #icon>
          <component :is="action.icon" />
        </template>
        {{ action.label }}
      </a-button>
    </template>
  </a-space>
  </template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  actions: { type: Array, required: true },
  row: { type: Object, required: true }
})
const emit = defineEmits(['action'])

const visibleActions = computed(() =>
  (props.actions || []).filter(a => {
    if (typeof a.showIf === 'function') return !!a.showIf(props.row)
    return true
  })
)

const onClick = (action) => {
  emit('action', { key: action.key, row: props.row })
}
</script>
