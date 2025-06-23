<template>
  <div>
    <ASelect
      :model-value="selectedCollection"
      placeholder="请选择集合"
      style="width: 100%;"
      allow-clear
      @change="handleSelect"
    >
      <AOption
        v-for="item in collections"
        :key="item.value"
        :value="item.value"
        :label="item.label"
      >
        {{ item.label }}
      </AOption>
    </ASelect>
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import { defineProps, defineEmits } from 'vue';
import { Select as ASelect, Option as AOption } from '@arco-design/web-vue';


interface CollectionItem {
  label: string;
  value: string;
}

const props = defineProps<{
  collections: CollectionItem[];
  initialSelectedCollection: string;
}>();

const emit = defineEmits(['select-collection']);

const selectedCollection = ref(props.initialSelectedCollection);

watchEffect(() => {
  selectedCollection.value = props.initialSelectedCollection;
});

const handleSelect = (value: string) => {
  selectedCollection.value = value;
  emit('select-collection', value);
};
</script>

<style scoped>
/* Add any specific styles here if needed */
</style>