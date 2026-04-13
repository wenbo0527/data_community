<template>
  <a-tag :color="color">{{ text }}</a-tag>
</template>
<script setup>
defineProps({
  text: { type: String, default: '' },
  color: { type: String, default: 'default' }
})
</script>
