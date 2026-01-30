<template>
  <router-view />
</template>

<script setup>
import { onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
const route = useRoute()
onMounted(() => { try { window.parent?.postMessage({ type: 'risk-app-ready' }, '*') } catch {} })
watch(() => route.fullPath, (p) => { try { window.parent?.postMessage({ type: 'risk-route', path: p }, '*') } catch {} })
</script>
