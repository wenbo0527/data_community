<template>
  <div class="notification-detail-content" v-html="content" />
</template>
<script setup>
defineProps({ content: { type: String, default: '' } })
</script>
