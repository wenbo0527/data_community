<template>
  <g>
    <defs>
      <linearGradient id="edgeGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#3B82F6"/>
        <stop offset="100%" stop-color="#60A5FA"/>
      </linearGradient>
      <marker id="arrowEnd" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="8" markerHeight="8" orient="auto">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#3B82F6"/>
      </marker>
    </defs>
    <path 
      v-for="bl in busLines" 
      :key="bl.id" 
      :d="pathDAnchor(bl.a, bl.b)" 
      stroke="rgba(99,102,241,0.6)" 
      fill="none" 
      :style="{ strokeWidth: 'var(--bus-stroke)', strokeDasharray: `var(--bus-dash-a) var(--bus-dash-b)` }"
      class="bus-line"
    />
    <path 
      v-for="el in edgeLines" 
      :key="el.id" 
      :d="pathDAnchor(el.a, el.b)" 
      :stroke="el.color || (el.type==='in' ? 'rgba(16,185,129,0.5)' : 'rgba(234,88,12,0.5)')" 
      fill="none" 
      :style="{ strokeWidth: 'var(--edge-stroke)', strokeDasharray: `var(--edge-dash-a) var(--edge-dash-b)` }"
      class="edge-line"
    />
  </g>
</template>

<script setup lang="ts">
type BusLine = { id: string; a: { x: number; y: number }; b: { x: number; y: number } }
type EdgeLine = { id: string; a: { x: number; y: number }; b: { x: number; y: number }; type: 'in' | 'out'; color?: string }
type Props = { nodesPx: Record<string,{x:number;y:number}>; activeNodeId: string|null; busLines?: BusLine[]; edgeLines?: EdgeLine[] }
const props = defineProps<Props>()

function pathDAnchor(a: { x: number; y: number }, b: { x: number; y: number }) {
  return `M ${a.x} ${a.y} L ${b.x} ${b.y}`
}
</script>

<style scoped>
.bus-line {
  opacity: 0.8;
  animation: flow 3s linear infinite;
}
.edge-line {
  opacity: 1;
  animation: flow 1s linear infinite;
}

@keyframes flow {
  to {
    stroke-dashoffset: -24;
  }
}
</style>
