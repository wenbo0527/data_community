<template>
  <a-layout>
    <a-layout-content class="content">
      <a-card title="营销画布（独立应用）" class="card-container">
        <div class="iframe-wrap">
          <iframe :src="iframeSrc" frameborder="0" class="iframe"></iframe>
        </div>
      </a-card>
    </a-layout-content>
  </a-layout>
</template>

<script setup>
import { computed } from 'vue'

const iframeSrc = computed(() => {
  const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost'
  return `http://${host}:5180/`
})
</script>

<style scoped>
.content { padding: 24px; background: var(--color-bg-2) }
.card-container { border-radius: 8px }
.iframe-wrap { height: calc(100vh - 180px); }
.iframe { width: 100%; height: 100%; border: 1px solid var(--color-border-2); border-radius: 8px; background: #fff }
</style>
