<template>
  <div class="dock" :style="style">
    <a-card size="small" :title="node.name" :bordered="true">
      <div class="brief">{{ node.brief }}</div>
      <div v-if="node.details.metrics" class="metrics">
        <a-tag v-for="m in node.details.metrics" :key="m.label">{{ m.label }}：{{ m.value }}</a-tag>
      </div>
      <div v-if="node.details.links" class="links">
        <a-button v-for="l in node.details.links" :key="l.text" type="text" @click="go(l)">{{ l.text }}</a-button>
      </div>
      <a-button type="text" @click="$emit('close')">关闭</a-button>
    </a-card>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
const props = defineProps<{ node: any; anchorRect: { x:number;y:number;width:number;height:number }; visible: boolean }>()
const style = computed(() => ({
  transform: `translate(${props.anchorRect.x + props.anchorRect.width + 12}px, ${props.anchorRect.y}px)`
}))
function go(l: { route?: string; url?: string }) {
  if (l.route) router.push(l.route)
  if (l.url) window.open(l.url, '_blank')
}
</script>
<style scoped>
.dock { position: absolute; z-index: 50 }
.brief { margin-bottom: 8px }
.metrics { display: flex; gap: 6px; margin-bottom: 8px }
.links { display: flex; gap: 6px; margin-bottom: 8px }
</style>
