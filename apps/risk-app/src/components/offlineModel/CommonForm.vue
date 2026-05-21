<template>
  <div class="common-form">
    <a-form :model="model" :layout="layout">
      <a-form-item
        v-for="field in fields"
        :key="field.key"
        :label="field.label"
        :required="field.required"
      >
        <a-input
          v-if="field.type === 'input'"
          v-model="model[field.key]"
          :placeholder="field.placeholder"
        />
        <a-select
          v-else-if="field.type === 'select'"
          v-model="model[field.key]"
          :placeholder="field.placeholder"
        >
          <a-option v-for="opt in field.options" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </a-option>
        </a-select>
      </a-form-item>
      <a-form-item>
        <a-space>
          <a-button type="primary" @click="handleSubmit">提交</a-button>
          <a-button @click="handleReset">重置</a-button>
        </a-space>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

const props = defineProps<{
  fields: any[]
  layout?: 'vertical' | 'horizontal'
}>()

const emit = defineEmits(['submit', 'reset'])

const model = reactive<Record<string, any>>({})

const handleSubmit = () => {
  emit('submit', model)
}

const handleReset = () => {
  emit('reset')
}
</script>

<style scoped>
.common-form {
  width: 100%;
  padding: 16px;
}
</style>