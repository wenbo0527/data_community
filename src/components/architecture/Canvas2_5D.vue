<template>
  <div class="canvas-wrapper" :class="{ 'is-dev': showCoordPicker }">
    <div class="canvas" ref="root" @click="onPick" @wheel="onWheel" @mousemove="onMouseMove">
    <div class="content" :style="autoStyle">
        <img v-if="!flags.hideBg" class="bg-image" src="/2.5d.svg" alt="" />
        <BaseOverlay :polygons="layerPolygons" />
        <svg class="flow" ref="flowEl" v-if="!flags.hideNodes" width="100%" height="100%" preserveAspectRatio="none">
          <FlowOverlay :busLines="busLines" :edgeLines="edgeLines" :nodesPx="nodesPx" :activeNodeId="activeNodeId" />
        </svg>
        
        <!-- Debug/Assist Layer (Visible when ruler is active or showGuides is on) -->
        <svg v-if="ruler.active || flags.showGuides" class="debug-layer" width="100%" height="100%" style="pointer-events: none; position: absolute; inset: 0; z-index: 25;">
          <g v-for="(pos, id) in nodesPx" :key="id">
          <!-- Bounding Box -->
          <rect 
            :x="pos.x - metrics.icon/2" :y="pos.y - metrics.icon/2" 
            :width="metrics.icon" :height="metrics.icon" 
            fill="none" stroke="rgba(255, 0, 0, 0.5)" :stroke-width="metrics.style.edgeStroke" stroke-dasharray="4 4"
          />
          <!-- Center Point -->
          <circle :cx="pos.x" :cy="pos.y" :r="metrics.icon * 0.03" fill="red" />
          <!-- Connection Point (Visual Center) -->
          <circle v-if="nodesContactPx[id]" :cx="nodesContactPx[id].x" :cy="nodesContactPx[id].y" :r="metrics.icon * 0.04" fill="#52c41a" stroke="white" :stroke-width="metrics.style.edgeStroke" />
          <!-- Edge Midpoints -->
          <circle :cx="pos.x" :cy="pos.y - metrics.icon/2" :r="metrics.icon * 0.02" fill="#1890ff" /> <!-- Top -->
          <circle :cx="pos.x" :cy="pos.y + metrics.icon/2" :r="metrics.icon * 0.02" fill="#1890ff" /> <!-- Bottom -->
          <circle :cx="pos.x - metrics.icon/2" :cy="pos.y" :r="metrics.icon * 0.02" fill="#1890ff" /> <!-- Left -->
          <circle :cx="pos.x + metrics.icon/2" :cy="pos.y" :r="metrics.icon * 0.02" fill="#1890ff" /> <!-- Right -->
          <!-- Label for ID (Optional, small) -->
          <text :x="pos.x - metrics.icon/2 + 5" :y="pos.y - metrics.icon/2 + 15" fill="rgba(255,0,0,0.7)" :font-size="metrics.icon * 0.1" font-family="monospace">{{ id }}</text>
        </g>
        </svg>

        <!-- Ruler Overlay -->
        <svg v-if="ruler.active" class="ruler-layer" width="100%" height="100%">
          <defs>
            <marker id="rulerArrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <circle cx="5" cy="5" r="3" fill="red" />
            </marker>
          </defs>
          <line 
            v-if="ruler.step > 0"
            :x1="ruler.p1.x" :y1="ruler.p1.y" 
            :x2="ruler.p2.x" :y2="ruler.p2.y" 
            stroke="red" :stroke-width="metrics.edgeStroke * 1.5" stroke-dasharray="5,5"
            marker-start="url(#rulerArrow)" marker-end="url(#rulerArrow)"
          />
          <text v-if="rulerStats" :x="rulerStats.cx" :y="rulerStats.cy - 10" fill="red" :font-size="metrics.icon * 0.15" font-weight="bold" text-anchor="middle" style="text-shadow: 0 1px 2px white">
            {{ rulerStats.angle.toFixed(1) }}° / {{ rulerStats.len.toFixed(0) }}px
          </text>
        </svg>

        <div class="nodes" v-show="!flags.hideNodes">
          <NodeCard
            v-for="n in nodes"
            :key="n.id"
            :node="n"
            :positionPx="nodesPx[n.id]"
            :size="metrics.icon"
            :active="activeNodeId===n.id"
            :hovered="hoveredNodeId===n.id"
            @mouseenter="onHover(n.id)"
            @mouseleave="onHover(null)"
            @click="onActive(n.id)"
          />
        </div>
        <FocusMask v-if="!flags.hideNodes" :activeRect="activeRect" :visible="!!activeNodeId" />
        <InfoDock v-if="!flags.hideNodes && activeNode" :node="activeNode" :anchorRect="activeRect" :visible="true" @close="onClose" />
      </div>
    </div>
    <!-- 坐标拾取器移动到 wrapper 层，并增加边界处理 -->
    <div v-if="coord.visible" class="coord-overlay" :style="coordStyle">
      <a-card size="mini" :bordered="true" class="coord-card">
        <div class="coord-row">
          <span class="label">ABS:</span>
          <span class="value">{{ coord.abs.x.toFixed(1) }}%, {{ coord.abs.y.toFixed(1) }}%</span>
        </div>
        <div class="coord-row">
          <span class="label">REL:</span>
          <span class="value">{{ coord.rel.x.toFixed(1) }}%, {{ coord.rel.y.toFixed(1) }}%</span>
        </div>
        <div class="actions">
          <a-button size="mini" type="primary" @click.stop="copyCoord">复制 JSON</a-button>
          <a-button size="mini" @click.stop="flags.hideNodes = !flags.hideNodes">
            {{ flags.hideNodes ? '显示节点' : '隐藏' }}
          </a-button>
          <a-button size="mini" @click.stop="flags.hideBg = !flags.hideBg">
            {{ flags.hideBg ? '显示底图' : '屏蔽底图' }}
          </a-button>
          <a-button size="mini" @click.stop="flags.showGuides = !flags.showGuides" :type="flags.showGuides ? 'primary' : 'secondary'">
            {{ flags.showGuides ? '隐藏参考线' : '显示参考线' }}
          </a-button>
          <a-button size="mini" :type="ruler.active ? 'primary' : 'text'" @click.stop="ruler.active = !ruler.active; ruler.step = 0">
            {{ ruler.active ? '关闭尺子' : '测量尺' }}
          </a-button>
          <a-button size="mini" type="text" @click.stop="coord.visible = false">关闭</a-button>
        </div>
      </a-card>
    </div>
    
    <!-- Floating Tool Toggle if Coord Panel is hidden -->
    <div v-if="!coord.visible" class="floating-tools">
      <a-button size="mini" @click="ruler.active = !ruler.active; ruler.step = 0" :type="ruler.active ? 'primary' : 'secondary'">
        {{ ruler.active ? '退出测量' : '测量工具' }}
      </a-button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import NodeCard from './NodeCard.vue'
import FlowOverlay from './FlowOverlay.vue'
import BaseOverlay from './BaseOverlay.vue'
import FocusMask from './FocusMask.vue'
import InfoDock from './InfoDock.vue'
import { computeAbs } from '../../utils/coords'
import type { Layer } from '../../data/architecture/layers'
import type { Node } from '../../data/architecture/nodes'
const props = defineProps<{ layers: Layer[]; nodes: Node[]; opts?: { hideNodes?: boolean; coord?: boolean; hideBg?: boolean } }>()
const root = ref<HTMLElement|null>(null)
const size = ref({ width: 0, height: 0 })
const scale = ref(1)
const contentStyle = computed(() => ({
  transform: `scale(${scale.value})`,
  transformOrigin: 'center center'
}))
const hoveredNodeId = ref<string|null>(null)
const activeNodeId = ref<string|null>(null)
const flags = ref({ hideNodes: false, hideBg: false, showGuides: false })
function toBool(input: any) {
  if (typeof input === 'boolean') return input
  if (input && typeof input === 'object' && 'value' in input) return !!input.value
  return false
}
watch(() => props.opts?.hideBg, (v: unknown) => {
  flags.value.hideBg = toBool(v)
}, { immediate: true })
const showCoordPicker = computed(() => toBool(props.opts?.coord))
 
const autoLayout = computed(() => false)

const metrics = computed(() => {
  // 1. 基础尺寸锚点
  const unit = Math.max(1, Math.min(size.value.width || 0, size.value.height || 0))
  
  // 2. 图标尺寸计算 (原 iconSize 逻辑)
  const rawIcon = unit * 0.12
  const icon = Math.min(160, Math.max(64, rawIcon))
  const iconDiag = icon * Math.SQRT2

  // 3. 2.5D 几何投影参数
  const projectionAngle = -148
  const projectionRad = (projectionAngle * Math.PI) / 180

  // 4. 布局与轮廓参数
  const layer = {
    widthV: Math.min(iconDiag * 1.0, unit * 0.25),
    lenMin: iconDiag * 2,
    lenMax: iconDiag * 6,
    padding: Math.round(icon * 1.2),
    cornerRadius: Math.max(12, Math.round(icon * 0.15)),
    labelInset: Math.max(12, Math.round(icon * 0.1)),
    titleLeftMax: Math.round(icon * 1.5),
    titleExtraMin: Math.round(icon * 0.6),
    titleCharWidthRatio: 0.08, // 标题字符宽度比例
    labelOffsetRatio: 0.2      // 标签偏移比例
  }

  // 5. 视觉样式参数
  const style = {
    margin: Math.round(unit * 0.03),
    edgeStroke: Math.max(1, Math.round(icon * 0.015)),
    busStroke: Math.max(2, Math.round(icon * 0.03)),
    edgeDash: Math.max(4, Math.round(icon * 0.05)),
    busDashA: Math.max(8, Math.round(icon * 0.08)),
    busDashB: Math.max(4, Math.round(icon * 0.04)),
    contactCap: Math.round(icon * 0.1)
  }

  // 6. 交互与工具参数
  const config = {
    zoom: { min: 0.25, max: 2.5, step: 0.1 },
    originNodeId: 'platform',
    refLayerIndex: 1,
    uDefault: { x: 1, y: -0.85 },
    coord: { offset: 12, shiftPct: -105 }
  }

  return { 
    unit, icon, iconDiag, 
    projectionAngle, projectionRad,
    layer, style, config
  }
})

const nodesPx = computed<Record<string,{x:number;y:number}>>(() => {
  const m: Record<string,{x:number;y:number}> = {}
  const byLayer = new Map<number, string[]>()
  const byLayerNodes = new Map<number, Array<Node>>()
  props.nodes.forEach(n => {
    const L = n.layerIndex
    const arr = byLayer.get(L) || []
    arr.push(n.id)
    byLayer.set(L, arr)
    const arrN = byLayerNodes.get(L) || []
    arrN.push(n)
    byLayerNodes.set(L, arrN)
  })
  const gridSnap = true
  if (gridSnap) {
    byLayerNodes.forEach((nodesArr) => {
      const sorted = [...nodesArr].sort((a,b) => a.xPct - b.xPct)
      let xMin = Infinity, xMax = -Infinity
      sorted.forEach(p => { xMin = Math.min(xMin, p.xPct); xMax = Math.max(xMax, p.xPct) })
      const N = sorted.length
      const span = xMax - xMin
      sorted.forEach((n, idx) => {
        const tracks = N > 1 ? (xMin + (span * (idx/(N-1)))) : n.xPct
        const xPct = tracks
        const yPct = n.yPct
        m[n.id] = { x: (xPct/100)*size.value.width, y: (yPct/100)*size.value.height }
      })
    })
  } else {
    props.nodes.forEach(n => {
      let xPct = n.xPct
      let yPct = n.yPct
      if (autoLayout.value) {
        const L = n.layerIndex + 1
        const ids = byLayer.get(n.layerIndex) || []
        const N = ids.indexOf(n.id) + 1
        const abs = computeAbs(L, N)
        xPct = abs.xPct
        yPct = abs.yPct
      }
      m[n.id] = { x: (xPct/100)*size.value.width, y: (yPct/100)*size.value.height }
    })
  }
  console.log('[Canvas2_5D] nodesPx computed', { count: Object.keys(m).length, hideNodes: flags.value.hideNodes })
  return m
})

// Connection points (Visual center adjustment)
const nodesContactPx = computed(() => {
  // Adjust this offset to match the visual center of the 2.5D icons
  // Downward offset (positive Y) based on icon size
  const offset = { x: 0, y: metrics.value.style.contactCap } 
  const m: Record<string, {x:number;y:number}> = {}
  const source = nodesPx.value
  for (const k in source) {
    const p = source[k]
    m[k] = { x: p.x + offset.x, y: p.y + offset.y }
  }
  return m
})

const layoutParams = computed(() => {
  const byLayerIds = new Map<number, string[]>()
  props.nodes.forEach(n => {
    const arr = byLayerIds.get(n.layerIndex) || []
    arr.push(n.id)
    byLayerIds.set(n.layerIndex, arr)
  })
  
  let globalUX = metrics.value.config.uDefault.x, globalUY = metrics.value.config.uDefault.y
  const refLayerIndex = metrics.value.config.refLayerIndex
  const refIds = byLayerIds.get(refLayerIndex)
  if (refIds && refIds.length > 1) {
    const pts = refIds.map(id => nodesContactPx.value[id]).filter(Boolean) as {x:number;y:number}[]
    const sorted = [...pts].sort((a, b) => a.x - b.x)
    const start = sorted[0]!, end = sorted[sorted.length - 1]!
    const dx = end.x - start.x, dy = end.y - start.y
    const dist = Math.hypot(dx, dy)
    if (dist > 0) {
      globalUX = dx / dist
      globalUY = dy / dist
    }
  } else {
    let maxSpan = 0
    byLayerIds.forEach((ids) => {
      const pts = ids.map(id => nodesContactPx.value[id]).filter(Boolean) as {x:number;y:number}[]
      if (pts.length > 1) {
        const sorted = [...pts].sort((a, b) => a.x - b.x)
        const start = sorted[0]!, end = sorted[sorted.length - 1]!
        const dx = end.x - start.x, dy = end.y - start.y
        const dist = Math.hypot(dx, dy)
        if (dist > maxSpan) {
          maxSpan = dist
          globalUX = dx / dist
          globalUY = dy / dist
        }
      }
    })
  }
  
  const u = { x: globalUX, y: globalUY }
  const v = { x: -u.y, y: u.x }
  return { u, v, byLayerIds }
})

const busLines = computed<Array<{ id: string; a: { x: number; y: number }; b: { x: number; y: number } }>>(() => {
  const byLayerPx = new Map<number, Array<{ id: string; x: number; y: number }>>()
  props.nodes.forEach(n => {
    const px = nodesContactPx.value[n.id]
    if (px) {
      const arr = byLayerPx.get(n.layerIndex) || []
      arr.push({ id: n.id, x: px.x, y: px.y })
      byLayerPx.set(n.layerIndex, arr)
    }
  })
  const layerKeys = Array.from(byLayerPx.keys()).sort((a,b)=>a-b)
  const stats = new Map<number, { len: number; center: { x: number; y: number } }>()
  
  const globalU = layoutParams.value.u

  layerKeys.forEach(L => {
    const pts = byLayerPx.get(L) || []
    if (!pts.length) return
    let xMin = Infinity, xMax = -Infinity, yMin = Infinity, yMax = -Infinity
    pts.forEach(p => { xMin = Math.min(xMin, p.x); xMax = Math.max(xMax, p.x); yMin = Math.min(yMin, p.y); yMax = Math.max(yMax, p.y) })
    
    // Project onto Global U axis to calculate length
    let tMin = Infinity, tMax = -Infinity
    pts.forEach(p => {
      const t = p.x * globalU.x + p.y * globalU.y
      tMin = Math.min(tMin, t)
      tMax = Math.max(tMax, t)
    })
    const len = (tMax - tMin) || 100 // default length if single point
    
    const center = { x: (xMin + xMax)/2, y: (yMin + yMax)/2 }
    stats.set(L, { len, center })
  })

  const r: Array<{ id: string; a: { x: number; y: number }; b: { x: number; y: number } }> = []
  for (let i = 0; i < layerKeys.length - 1; i++) {
    const L = layerKeys[i]!
    const L1 = layerKeys[i+1]!
    const s0Maybe = stats.get(L)
    const s1Maybe = stats.get(L1)
    if (!s0Maybe || !s1Maybe) continue
    const s0 = s0Maybe!
    const s1 = s1Maybe!
    const u = globalU
    const len = Math.max(s0.len, s1.len)
    const C = { x: (s0.center.x + s1.center.x)/2, y: (s0.center.y + s1.center.y)/2 }
    const a = { x: C.x - u.x * (len/2), y: C.y - u.y * (len/2) }
    const b = { x: C.x + u.x * (len/2), y: C.y + u.y * (len/2) }
    r.push({ id: `bus_L${L}_L${L1}`, a, b })
  }
  return r
})

const edgeLines = computed<Array<{ id: string; a: { x: number; y: number }; b: { x: number; y: number }; type: 'in' | 'out'; color?: string | undefined }>>(() => {
  const byLayerPx = new Map<number, Array<{ id: string; x: number; y: number; color?: string | undefined }>>()
  props.nodes.forEach(n => {
    const px = nodesContactPx.value[n.id]
    if (px) {
      const arr = byLayerPx.get(n.layerIndex) || []
      arr.push({ id: n.id, x: px.x, y: px.y, color: n.style?.color })
      byLayerPx.set(n.layerIndex, arr)
    }
  })
  const layerKeys = Array.from(byLayerPx.keys()).sort((a,b)=>a-b)
  const busParams = new Map<string, { C: { x: number; y: number }; u: { x: number; y: number } }>()
  const globalU = layoutParams.value.u

  for (let i = 0; i < layerKeys.length - 1; i++) {
    const L = layerKeys[i]!
    const L1 = layerKeys[i+1]!
    const pts0 = byLayerPx.get(L) || []
    const pts1 = byLayerPx.get(L1) || []
    if (!pts0.length || !pts1.length) continue
    
    let xMin0 = Infinity, xMax0 = -Infinity, yMin0 = Infinity, yMax0 = -Infinity
    pts0.forEach(p => { xMin0 = Math.min(xMin0, p.x); xMax0 = Math.max(xMax0, p.x); yMin0 = Math.min(yMin0, p.y); yMax0 = Math.max(yMax0, p.y) })
    
    let xMin1 = Infinity, xMax1 = -Infinity, yMin1 = Infinity, yMax1 = -Infinity
    pts1.forEach(p => { xMin1 = Math.min(xMin1, p.x); xMax1 = Math.max(xMax1, p.x); yMin1 = Math.min(yMin1, p.y); yMax1 = Math.max(yMax1, p.y) })
    
    const C0 = { x: (xMin0 + xMax0)/2, y: (yMin0 + yMax0)/2 }
    const C1 = { x: (xMin1 + xMax1)/2, y: (yMin1 + yMax1)/2 }
    const C = { x: (C0.x + C1.x)/2, y: (C0.y + C1.y)/2 }
    busParams.set(`${L}-${L1}`, { C, u: globalU })
  }
  const res: Array<{ id: string; a: { x: number; y: number }; b: { x: number; y: number }; type: 'in' | 'out'; color?: string | undefined }> = []
  layerKeys.forEach((L, idx) => {
    const pts = byLayerPx.get(L) || []
    const isFirst = idx === 0
    const isLast = idx === layerKeys.length - 1
    pts.forEach(p => {
      if (!isLast) {
        const keyOut = `${L}-${layerKeys[idx+1]}`
        const param = busParams.get(keyOut)
        if (param) {
          const { C, u } = param
          // Calculate intersection by projecting p onto line (C, u) along a fixed projection angle
          const angleRad = metrics.value.projectionRad
          const d = { x: Math.cos(angleRad), y: Math.sin(angleRad) }
          
          // Intersection logic: proj = C + t*u. We want (proj - p) parallel to d.
          // (C + t*u - p) x d = 0 => (C - p) x d + t * (u x d) = 0
          // t = ((p - C) x d) / (u x d)
          // Cross product a x b = a.x * b.y - a.y * b.x
          const w = { x: p.x - C.x, y: p.y - C.y }
          const crossWD = w.x * d.y - w.y * d.x
          const crossUD = u.x * d.y - u.y * d.x
          
          // Avoid division by zero
          const t = Math.abs(crossUD) > 1e-5 ? (crossWD / crossUD) : 0
          
          const proj = { x: C.x + t * u.x, y: C.y + t * u.y }
          res.push({ id: `edge_out_${L}_${p.id}`, a: {x: p.x, y: p.y}, b: proj, type: 'out', color: p.color })
        }
      }
      if (!isFirst) {
        const keyIn = `${layerKeys[idx-1]}-${L}`
        const paramIn = busParams.get(keyIn)
        if (paramIn) {
          const { C, u } = paramIn
          // Same projection for incoming edges
          const angleRad = metrics.value.projectionRad
          const d = { x: Math.cos(angleRad), y: Math.sin(angleRad) }
          
          const w = { x: p.x - C.x, y: p.y - C.y }
          const crossWD = w.x * d.y - w.y * d.x
          const crossUD = u.x * d.y - u.y * d.x
          const t = Math.abs(crossUD) > 1e-5 ? (crossWD / crossUD) : 0
          
          const proj = { x: C.x + t * u.x, y: C.y + t * u.y }
          res.push({ id: `edge_in_${L}_${p.id}`, a: proj, b: {x: p.x, y: p.y}, type: 'in', color: p.color })
        }
      }
    })
  })
  return res
})

const layerPolygons = computed(() => {
  const { byLayerIds, u, v } = layoutParams.value

  const r: Array<{ layerIndex: number; points?: {x:number;y:number}[]; pathD?: string; title?: string; label: {x:number;y:number}; labelRotate: number }> = []
  
  // 轮廓相对于节点中心的扩展半径 (像素)
  const paddingPx = metrics.value.layer.padding

  byLayerIds.forEach((ids: string[], L0: number) => {
      const ptsPx: Array<{x:number;y:number}> = ids.map((id: string) => {
        return nodesContactPx.value[id] || { x: 0, y: 0 }
      })
    
    if (!ptsPx.length) return

    // 投影范围 (像素空间)
    let uMin = Infinity, uMax = -Infinity, vMin = Infinity, vMax = -Infinity
    ptsPx.forEach(p => {
      const du = p.x * u.x + p.y * u.y
      const dv = p.x * v.x + p.y * v.y
      uMin = Math.min(uMin, du); uMax = Math.max(uMax, du)
      vMin = Math.min(vMin, dv); vMax = Math.max(vMax, dv)
    })

    // 应用固定像素内边距
    const minU = uMin - paddingPx
    const maxU = uMax + paddingPx
    const minV = vMin - paddingPx
    const maxV = vMax + paddingPx

    // 计算四个顶点
    // 分层轮廓的侧边（连接线方向）也应该遵循 -148° 的斜率，而不是简单的正交 V 轴
    // 原逻辑: v = {-u.y, u.x} (与 U 轴垂直)
    // 新逻辑: 侧边方向向量 dSide = { cos(-148°), sin(-148°) }
    // 
    // 平行四边形顶点计算：
    // 我们已知 U 轴方向（u）和侧边方向（dSide）。
    // 顶点的定位依然基于投影范围 uMin/uMax 和 vMin/vMax (这里的 vMin/vMax 其实是沿 dSide 方向的投影或距离)
    // 为了保持逻辑改动最小，我们可以保留 v 轴作为“参考宽度轴”（垂直于 U），但在生成矩形顶点时，进行斜切变换。
    // 
    // 或者更简单地，直接定义平行四边形的两个基向量：
    // vectorU = u (总线方向)
    // vectorSide = dSide (连接线方向 -148°)
    
    const angleRad = metrics.value.projectionRad
    const vectorSide = { x: Math.cos(angleRad), y: Math.sin(angleRad) }
    
    // 重新计算边界：
    // 我们需要找到包围所有点的最小平行四边形
    // 1. 在 U 轴上的投影 (点积 u)
    // 2. 在 Side 轴法向量上的投影 (为了确定宽度) -> 既然我们要切变，其实可以用原来的 v (垂直 u) 来确定“厚度”
    
    // 保持原来的 uMin/uMax 计算不变（沿总线方向的范围）
    // 保持原来的 vMin/vMax 计算不变（垂直总线方向的范围，即“厚度”）
    
    // 但是顶点生成时，需要将“矩形”变为“平行四边形”。
    // 矩形顶点是:
    // P = Center + du * u + dv * v
    // 现在我们要让侧边倾斜。意味着 v 方向的移动会附带 u 方向的偏移？
    // 或者更直接地：
    // 设顶点为 P = Origin + a * u + b * vectorSide
    // 这需要解线性方程组来把 p.x, p.y 转换为 a, b 坐标。
    // 
    // 让我们用一种几何直观的方法：
    // 所有的点都在两条平行于 U 轴的线之间（由 vMin, vMax 确定距离）
    // 所有的点都在两条平行于 vectorSide 的线之间（由 sideMin, sideMax 确定）
    
    // 计算点在 vectorSide 法向量上的投影（用于确定 U 轴方向的边界线）
    // vectorSide 的法向量 normalSide = { -vectorSide.y, vectorSide.x }
    const normalSide = { x: -vectorSide.y, y: vectorSide.x }
    
    let uProjMin = Infinity, uProjMax = -Infinity // 投影到 normalSide 上 (决定了两条平行于 vectorSide 的边界)
    let vProjMin = Infinity, vProjMax = -Infinity // 投影到 v (u的法向量) 上 (决定了两条平行于 u 的边界)
    
    // 注意：这里 v = {-u.y, u.x} 依然是 U 的法向量
    
    ptsPx.forEach(p => {
      const du = p.x * normalSide.x + p.y * normalSide.y
      const dv = p.x * v.x + p.y * v.y
      uProjMin = Math.min(uProjMin, du); uProjMax = Math.max(uProjMax, du)
      vProjMin = Math.min(vProjMin, dv); vProjMax = Math.max(vProjMax, dv)
    })
    
    // 控制同层范围的“长度”（沿着与连接线平行的边界线间距）
    // 以点集的跨度为基础，并结合 icon 对角线设定上下限
    const uCenter = (uProjMin + uProjMax) / 2
    const baseSpan = (uProjMax - uProjMin) + paddingPx * 1.6
    const minSpan = metrics.value.layer.lenMin
    const maxSpan = metrics.value.layer.lenMax
    const span = Math.min(maxSpan, Math.max(minSpan, baseSpan))
    const pU_Min = uCenter - span / 2
    const pU_Max = uCenter + span / 2
    
    // 宽度基于图标宽度的百分比计算
    const vCenter = (vProjMin + vProjMax) / 2
    const fixedWidth = metrics.value.layer.widthV
    const pV_Min = vCenter - fixedWidth / 2
    const pV_Max = vCenter + fixedWidth / 2
    
    // 现在我们有四条直线方程：
    // 1. p · normalSide = pU_Min
    // 2. p · normalSide = pU_Max
    // 3. p · v = pV_Min
    // 4. p · v = pV_Max
    
    // 求四个交点：
    // 交点 A (左上): Line 1 & Line 3
    // 交点 B (右上): Line 2 & Line 3
    // 交点 C (右下): Line 2 & Line 4
    // 交点 D (左下): Line 1 & Line 4
    
    function intersect(n1: {x:number,y:number}, c1: number, n2: {x:number,y:number}, c2: number) {
      const det = n1.x * n2.y - n1.y * n2.x
      if (Math.abs(det) < 1e-5) return { x: 0, y: 0 }
      const x = (c1 * n2.y - c2 * n1.y) / det
      const y = (n1.x * c2 - n2.x * c1) / det
      return { x, y }
    }
    
    const A = intersect(normalSide, pU_Min, v, pV_Min)
    const B = intersect(normalSide, pU_Max, v, pV_Min)
    const C = intersect(normalSide, pU_Max, v, pV_Max)
    const D = intersect(normalSide, pU_Min, v, pV_Max)

    // 根据层标题长度水平扩展左侧轮廓 (沿着 U 轴反方向)
    const titleText = props.layers.find(ll => ll.index === L0)?.title || ''
    const { titleCharWidthRatio, titleExtraMin, titleLeftMax } = metrics.value.layer
    const extraLeftPx = Math.min(Math.max(titleText.length * (metrics.value.icon * titleCharWidthRatio), titleExtraMin), titleLeftMax)
    
    const finalA = { x: A.x - u.x * extraLeftPx, y: A.y - u.y * extraLeftPx }
    const finalD = { x: D.x - u.x * extraLeftPx, y: D.y - u.y * extraLeftPx }

    // 生成圆角路径
    let points = [finalA, B, C, finalD]
    const edges = [
      { a: points[0], b: points[1] },
      { a: points[1], b: points[2] },
      { a: points[2], b: points[3] },
      { a: points[3], b: points[0] }
    ]
    
    const rPx = metrics.value.layer.cornerRadius
    const dParts: string[] = []
    
    edges.forEach((edge, i) => {
      const nextEdge = edges[(i + 1) % 4]
      if (!edge?.a || !edge?.b || !nextEdge?.a || !nextEdge?.b) return

      const v1 = { x: edge.b.x - edge.a.x, y: edge.b.y - edge.a.y }
      const l1 = Math.hypot(v1.x, v1.y) || 1
      const u1 = { x: v1.x / l1, y: v1.y / l1 }
      
      const v2 = { x: nextEdge.b.x - nextEdge.a.x, y: nextEdge.b.y - nextEdge.a.y }
      const l2 = Math.hypot(v2.x, v2.y) || 1
      const u2 = { x: v2.x / l2, y: v2.y / l2 }

      const startPoint = i === 0 ? { x: edge.a.x + u1.x * rPx, y: edge.a.y + u1.y * rPx } : null
      if (startPoint) dParts.push(`M ${startPoint.x} ${startPoint.y}`)
      
      dParts.push(`L ${edge.b.x - u1.x * rPx} ${edge.b.y - u1.y * rPx}`)
      dParts.push(`Q ${edge.b.x} ${edge.b.y} ${edge.b.x + u2.x * rPx} ${edge.b.y + u2.y * rPx}`)
    })
    
    const dPath = dParts.join(' ') + ' Z'

    // 标签位置计算
    const labelInset = metrics.value.layer.labelInset
    const bottomEdgeVec = { x: C.x - finalD.x, y: C.y - finalD.y }
    const bottomEdgeLen = Math.hypot(bottomEdgeVec.x, bottomEdgeVec.y) || 1
    const bottomEdgeUnit = { x: bottomEdgeVec.x / bottomEdgeLen, y: bottomEdgeVec.y / bottomEdgeLen }
    
    const labelOffset = Math.round(metrics.value.icon * metrics.value.layer.labelOffsetRatio)
    const label = { 
      x: finalD.x + v.x * (-labelInset) + bottomEdgeUnit.x * labelOffset, 
      y: finalD.y + v.y * (-labelInset) + bottomEdgeUnit.y * labelOffset 
    }
    const labelRotate = Math.atan2(bottomEdgeVec.y, bottomEdgeVec.x) * 180 / Math.PI
    
    r.push({ 
      layerIndex: L0, 
      pathD: dPath, 
      points,
      label, 
      labelRotate,
      title: titleText
    })
  })

  return r.sort((a, b) => a.layerIndex - b.layerIndex)
})
const contentBBox = computed(() => {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  const acc = (p: {x:number;y:number}) => {
    minX = Math.min(minX, p.x); minY = Math.min(minY, p.y)
    maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y)
  }
  const nodeVals = Object.values(nodesPx.value) as Array<{x:number;y:number}>
  nodeVals.forEach((p) => {
    acc({ x: p.x - metrics.value.icon / 2, y: p.y - metrics.value.icon / 2 })
    acc({ x: p.x + metrics.value.icon / 2, y: p.y + metrics.value.icon / 2 })
  })
  busLines.value.forEach((bl: { a: {x:number;y:number}; b: {x:number;y:number} }) => { acc(bl.a); acc(bl.b) })
  edgeLines.value.forEach((el: { a: {x:number;y:number}; b: {x:number;y:number} }) => { acc(el.a); acc(el.b) })
  layerPolygons.value.forEach((poly: { points?: Array<{x:number;y:number}> }) => { (poly.points || []).forEach(acc) })
  const empty = !isFinite(minX) || !isFinite(minY) || !isFinite(maxX) || !isFinite(maxY)
  return { minX, minY, maxX, maxY, empty }
})
const effectiveScale = computed(() => {
  const baseScale = scale.value
  const bbox = contentBBox.value
  if (bbox.empty) return baseScale
  const margin = metrics.value.margin
  const bw = Math.max(1, bbox.maxX - bbox.minX)
  const bh = Math.max(1, bbox.maxY - bbox.minY)
  const cw = Math.max(1, size.value.width)
  const ch = Math.max(1, size.value.height)
  const sFit = Math.min(1, Math.min((cw - margin * 2) / bw, (ch - margin * 2) / bh))
  const s = Math.min(metrics.value.config.zoom.max, Math.max(metrics.value.config.zoom.min, Math.min(baseScale, sFit)))
  return s
})
const autoStyle = computed(() => {
  const bbox = contentBBox.value
  const s = effectiveScale.value
  if (bbox.empty) return { transform: `scale(${s})`, transformOrigin: 'top left' }
  const margin = metrics.value.margin
  const bw = Math.max(1, bbox.maxX - bbox.minX)
  const bh = Math.max(1, bbox.maxY - bbox.minY)
  const cw = Math.max(1, size.value.width)
  const ch = Math.max(1, size.value.height)
  const cx = (bbox.minX + bbox.maxX) / 2
  const cy = (bbox.minY + bbox.maxY) / 2
  const tx = cw / 2 - cx * s
  const ty = ch / 2 - cy * s
  return { transform: `translate(${tx}px, ${ty}px) scale(${s})`, transformOrigin: 'top left', 
    '--edge-stroke': `${metrics.value.edgeStroke}px`,
    '--bus-stroke': `${metrics.value.busStroke}px`,
    '--edge-dash-a': `${metrics.value.edgeDash}px`,
    '--edge-dash-b': `${metrics.value.edgeDash}px`,
    '--bus-dash-a': `${metrics.value.busDashA}px`,
    '--bus-dash-b': `${metrics.value.busDashB}px`
  }
})
const activeNode = computed(() => props.nodes.find(n => n.id===activeNodeId.value) || null)
const activeRect = computed(() => {
  if (!activeNodeId.value) return null
  const p = nodesPx.value[activeNodeId.value]
  if (!p) return null
  const s = metrics.value.icon
  return { x: p.x - s / 2, y: p.y - s / 2, width: s, height: s }
})
function onHover(id: string|null) { hoveredNodeId.value = id }
function onActive(id: string) { activeNodeId.value = id }
function onClose() { activeNodeId.value = null }
const coord = ref({ visible: false, abs: { x: 0, y: 0 }, rel: { x: 0, y: 0 }, px: { x: 0, y: 0 } })
const coordStyle = computed(() => {
  const { x, y } = coord.value.px
  // 简单的边界溢出处理，防止卡片超出屏幕
  const isRightEdge = x > (size.value.width * 0.8)
  const isBottomEdge = y > (size.value.height * 0.8)
  return {
    left: `${x}px`,
    top: `${y}px`,
    transform: `translate(${isRightEdge ? -105 : 12}%, ${isBottomEdge ? -105 : 12}%)`,
    zIndex: 999
  }
})

const ruler = ref({
  active: false,
  step: 0,
  p1: { x: 0, y: 0 },
  p2: { x: 0, y: 0 }
})

const rulerStats = computed(() => {
  if (!ruler.value.active || ruler.value.step === 0) return null
  const dx = ruler.value.p2.x - ruler.value.p1.x
  const dy = ruler.value.p2.y - ruler.value.p1.y
  const len = Math.hypot(dx, dy)
  const angle = Math.atan2(dy, dx) * 180 / Math.PI
  return { len, angle, cx: (ruler.value.p1.x + ruler.value.p2.x)/2, cy: (ruler.value.p1.y + ruler.value.p2.y)/2 }
})

function onMouseMove(e: MouseEvent) {
  if (!ruler.value.active || ruler.value.step !== 1 || !root.value) return
  const rect = root.value.getBoundingClientRect()
  // Need to account for scale/pan if we were using them for rendering, 
  // but here we are drawing on top of everything in screen space?
  // Wait, the ruler SVG is inside .content which has `transform: scale(...)`.
  // So the coordinates for the line must be in the "content" coordinate system (unscaled).
  
  // MouseEvent clientX/Y -> Screen pixels relative to viewport.
  // rect -> Screen pixels of the canvas container.
  // We need to transform mouse coordinates into the Scaled Content space?
  // Actually, <svg class="ruler-layer"> is inside .content.
  // .content has transform scale(scale.value).
  
  // Let's get coordinates relative to .content top-left (which is 0,0 of root).
  // But we need to divide by scale.value to get local coordinates inside .content.
  
  const xPx = e.clientX - rect.left
  const yPx = e.clientY - rect.top
  const s = effectiveScale.value
  
  ruler.value.p2 = { x: xPx / s, y: yPx / s }
}

function onWheel(e: WheelEvent) {
  if (!(e.ctrlKey || e.metaKey)) return
  e.preventDefault()
  e.stopPropagation()
  const { step, min, max } = metrics.value.config.zoom
  const delta = e.deltaY > 0 ? -step : step
  scale.value = Math.min(max, Math.max(min, scale.value + delta))
}

function onPick(e: MouseEvent) {
  if (!root.value) return
  const rect = root.value.getBoundingClientRect()
  const xPx = e.clientX - rect.left
  const yPx = e.clientY - rect.top
  
  if (ruler.value.active) {
    const s = effectiveScale.value
    const p = { x: xPx / s, y: yPx / s }
    if (ruler.value.step === 0 || ruler.value.step === 2) {
      ruler.value.p1 = p
      ruler.value.p2 = p
      ruler.value.step = 1
    } else {
      ruler.value.p2 = p
      ruler.value.step = 2
    }
    return
  }

  if (!showCoordPicker.value) return
  
  // 计算百分比坐标，支持负数和超过 100 的数值（对应画布外）
  const absX = (xPx / rect.width) * 100
  const absY = (yPx / rect.height) * 100
  
  const o = nodesPx.value[metrics.value.config.originNodeId]
  const relX = o ? ((xPx - o.x) / rect.width) * 100 : absX
  const relY = o ? ((yPx - o.y) / rect.height) * 100 : absY
  
  coord.value = { 
    visible: true, 
    abs: { x: absX, y: absY }, 
    rel: { x: relX, y: relY }, 
    px: { x: xPx, y: yPx } 
  }
}
async function copyCoord() {
  const payload = { abs: coord.value.abs, rel: coord.value.rel }
  await navigator.clipboard.writeText(JSON.stringify(payload))
}
onMounted(() => {
  const ro = new ResizeObserver(entries => {
    const r = entries[0]?.contentRect
    if (r) size.value = { width: r.width, height: r.height }
    console.log('[Canvas2_5D] resize', r)
  })
  if (root.value) ro.observe(root.value)
  const propHide = props.opts?.hideNodes
  flags.value.hideNodes = propHide !== undefined ? toBool(propHide) : false
  console.log('[Canvas2_5D] mounted', {
    nodes: props.nodes.length,
    layers: props.layers.length,
    hideNodes: flags.value.hideNodes,
    coord: toBool(props.opts?.coord),
    rootRect: root.value?.getBoundingClientRect()
  })
})
watch(() => [props.opts?.hideNodes, props.opts?.coord], () => {
  const propHide = props.opts?.hideNodes
  flags.value.hideNodes = propHide !== undefined ? toBool(propHide) : false
  console.log('[Canvas2_5D] opts changed', {
    hideNodes: flags.value.hideNodes,
    coord: toBool(props.opts?.coord)
  })
})
watch(() => flags.value.hideNodes, (v: boolean) => {
  console.log('[Canvas2_5D] flags.hideNodes updated', v)
})
</script>
<style scoped>
.canvas-wrapper { position: relative; width: 100%; overflow: visible }
.canvas-wrapper.is-dev { cursor: crosshair }
.canvas { position: relative; width: 100%; background: rgba(0,0,0,0.02); display: block; aspect-ratio: 16 / 9 }
.content { position: absolute; inset: 0; will-change: transform }
.bg-image { display: block; width: 100%; height: 100%; object-fit: contain; pointer-events: none; user-select: none; z-index: 1 }
.nodes { position: absolute; inset: 0; z-index: 30 }
.flow { position: absolute; inset: 0; pointer-events: none; z-index: 20 }
.coord-overlay { position: absolute; pointer-events: none; transition: transform 0.1s ease-out }
.coord-card { pointer-events: auto; width: 200px; box-shadow: 0 4px 12px rgba(0,0,0,0.15) }
.coord-row { display: flex; justify-content: space-between; margin-bottom: 4px; font-family: monospace; font-size: 12px }
.coord-row .label { color: var(--color-text-3) }
.coord-row .value { color: var(--color-text-1); font-weight: bold }
.actions { display: flex; gap: 4px; margin-top: 8px; border-top: 1px solid var(--color-fill-3); padding-top: 8px; flex-wrap: wrap }
.floating-tools { position: absolute; bottom: 16px; right: 16px; z-index: 100 }
</style>
