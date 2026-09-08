<template>
  <div class="filter-bar">
    <a-card>
      <a-form :model="localValue" layout="inline">
        <template v-for="field in fields" :key="field.key">
          <a-form-item :label="field.label">
            <a-input
              v-if="field.type === 'input'"
              v-model="localValue[field.key]"
              :placeholder="field.placeholder || ''"
              allow-clear
              @change="emitChange"
            />
            <a-select
              v-else-if="field.type === 'select'"
              v-model="localValue[field.key]"
              :placeholder="field.placeholder || ''"
              allow-clear
              @change="emitChange"
            >
              <a-option v-for="opt in field.options || []" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </a-option>
            </a-select>
            <a-range-picker
              v-else-if="field.type === 'range'"
              v-model="localValue[field.key]"
              style="width: 240px"
              @change="emitChange"
            />
          </a-form-item>
        </template>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="emitSearch">
              <template #icon>
                <icon-search />
              </template>
              {{ searchText }}
            </a-button>
            <a-button @click="emitReset">{{ resetText }}</a-button>
            <slot name="extra" />
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: Object, required: true },
  fields: { type: Array, required: true },
  searchText: { type: String, default: '搜索' },
  resetText: { type: String, default: '重置' }
})

const emit = defineEmits(['update:modelValue', 'search', 'reset', 'change'])

const localValue = computed({
  get() {
    return props.modelValue
  },
  set(val) {
    emit('update:modelValue', val)
  }
})

const emitSearch = () => emit('search')
const emitReset = () => emit('reset')
const emitChange = () => emit('change')
</script>

<style scoped lang="less">
.filter-bar {
  margin-bottom: 24px;
}
</style>
