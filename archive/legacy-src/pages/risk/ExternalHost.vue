<template>
  <div class="external-host">
    <iframe v-if="base" class="frame" :src="fullUrl" ref="iframeRef" />
    <div v-else class="error">未配置子应用地址</div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps({
  base: {
    type: String,
    default: import.meta.env.VITE_RISK_EXTERNAL_URL || 'http://localhost:5174'
  },
  subPath: {
    type: String,
    default: ''
  },
  query: {
    type: Object,
    default: () => ({})
  }
})

const route = useRoute()
const iframeRef = ref(null)

const fullUrl = computed(() => {
  const cleanBase = (props.base || '').replace(/\/$/, '')
  const sp = props.subPath ? `/${props.subPath}` : ''
  const qs = new URLSearchParams(props.query || {}).toString()
  return qs ? `${cleanBase}${sp}?${qs}` : `${cleanBase}${sp}`
})

onMounted(() => {
  window.addEventListener('message', (e) => {
    const data = e?.data || {}
    if (data?.type === 'risk-app-ready') {}
    if (data?.type === 'risk-route') {}
  })
})

watch(() => route.fullPath, () => {})
</script>

<style scoped>
.external-host {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}
.frame {
  flex: 1;
  width: 100%;
  border: 0;
}
.error {
  padding: 24px;
  color: #c20;
}
</style>
