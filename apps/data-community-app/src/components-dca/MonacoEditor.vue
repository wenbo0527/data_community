<template>
  <div class="monaco-editor-container" :style="{ height: typeof height === 'string' ? height : height + 'px' }">
    <textarea
      v-model="model"
      class="monaco-textarea"
      :placeholder="placeholder"
      @input="onInput"
    ></textarea>
  </div>
</template>

<script setup lang="ts">
const model = defineModel<string>({ default: '' })
const props = withDefaults(defineProps<{
  height?: string | number
  placeholder?: string
  language?: string
  theme?: string
  options?: Record<string, any>
}>(), {
  height: 300,
  placeholder: '请输入代码...'
})

const emit = defineEmits<{
  change: [value: string]
}>()

const onInput = () => {
  emit('change', model.value)
}
</script>

<style scoped>
.monaco-editor-container {
  width: 100%;
  border: 1px solid var(--color-border-2);
  border-radius: 4px;
  overflow: hidden;
  display: flex;
}
.monaco-textarea {
  width: 100%;
  border: none;
  outline: none;
  padding: 12px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.5;
  resize: none;
  background: #1e1e1e;
  color: #d4d4d4;
  box-sizing: border-box;
  flex: 1;
}
</style>
