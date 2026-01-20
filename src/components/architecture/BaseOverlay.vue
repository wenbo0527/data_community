<template>
  <svg class="bases" width="100%" height="100%" preserveAspectRatio="none">
    <defs>
      <filter id="labelShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="1" stdDeviation="1.2" flood-color="rgba(0,0,0,0.25)"/>
      </filter>
    </defs>
    <g v-for="b in polygons" :key="b.layerIndex">
      <path v-if="b.pathD" :d="b.pathD" class="base-shape" />
      <polygon v-else :points="pointsAttr(b.points!)" class="base-shape" />
      <text 
        v-if="b.title" 
        :x="b.label.x" 
        :y="b.label.y" 
        class="base-label" 
        text-anchor="start"
        :transform="`rotate(${b.labelRotate || 0}, ${b.label.x}, ${b.label.y})`"
      >
        {{ b.title }}
      </text>
    </g>
  </svg>
</template>
<script setup lang="ts">
type Pt = { x: number; y: number }
type Poly = { layerIndex: number; points?: Pt[]; pathD?: string; title?: string; label: Pt; labelRotate?: number }
const props = defineProps<{ polygons: Poly[] }>()
function pointsAttr(pts: Pt[]) {
  return pts.map(p => `${p.x},${p.y}`).join(' ')
}
</script>
<style scoped>
.bases { position: absolute; inset: 0; pointer-events: none; z-index: 10 }
.base-shape { fill: rgba(0,0,0,0.03); stroke: #cbd5e1; stroke-width: 1 }
.base-label { 
  font-size: 14px; 
  font-weight: 700; 
  fill: #111827;
  letter-spacing: 0.5px;
  paint-order: stroke fill;
  stroke: rgba(255,255,255,0.85);
  stroke-width: 0.6;
  filter: url(#labelShadow);
}
</style>
