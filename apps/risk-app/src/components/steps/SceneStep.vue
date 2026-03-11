<template>
  <div>
    <a-form layout="vertical">
      <a-form-item label="应用场景" field="scenes">
        <a-input-tag v-model="scenes" placeholder="输入场景后回车添加" />
      </a-form-item>
    </a-form>
    <a-space style="margin-top:12px">
      <a-button @click="$emit('prev')">上一步</a-button>
      <a-button type="primary" @click="$emit('next')">下一步</a-button>
    </a-space>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
const props = defineProps({ modelValue: { type: Object, default: () => ({ scenes: [] }) } })
const emit = defineEmits(['next','prev','update:modelValue'])
const scenes = ref(props.modelValue?.scenes || [])
watch(scenes, () => emit('update:modelValue', { scenes: scenes.value }), { deep: true })
</script>
