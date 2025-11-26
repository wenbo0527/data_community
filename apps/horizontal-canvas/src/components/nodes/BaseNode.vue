<template>
  <div class="base-node" :class="[nodeType, { disabled, selected, hover }]" @mouseenter="onMouseEnter" @mouseleave="onMouseLeave" data-selector="node-root">
    <header class="node-header" :style="headerStyle" data-selector="header">
      <div class="node-icon" :style="iconStyle" data-selector="header-icon">
        <slot name="icon">
          <span class="node-icon-text" data-selector="header-icon-text">{{ iconText }}</span>
        </slot>
      </div>
      <span class="node-title" data-selector="header-title">{{ title }}</span>
      <div class="node-menu" v-if="showMenu" @click.stop="$emit('menu')" data-selector="header-menu">
        <span class="dot" data-selector="menu-dot-0"></span><span class="dot" data-selector="menu-dot-1"></span><span class="dot" data-selector="menu-dot-2"></span>
      </div>
    </header>
    <main class="node-content" data-selector="content-area"><slot /></main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { getNodeConfig } from '@/utils/nodeTypes.js'

const props = defineProps({
  nodeType:   { type: String, required: true },
  title:      { type: String, default: '' },
  iconText:   { type: String, default: '' },
  disabled:   { type: Boolean, default: false },
  selected:   { type: Boolean, default: false },
  hover:      { type: Boolean, default: false },
  showMenu:   { type: Boolean, default: true }
})

const emit = defineEmits(['menu', 'hover-change'])
const nodeConfig = computed(() => getNodeConfig(props.nodeType))

const headerStyle = computed(() => {
  const baseColor = nodeConfig.value?.color || '#2563eb'
  return {
    background: `linear-gradient(135deg, ${baseColor} 0%, ${baseColor} 70%, rgba(255,255,255,0.15) 100%)`,
    borderBottom: '1px solid rgba(255,255,255,0.2)',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
    height: '36px'
  }
})
const iconStyle = computed(() => {
  const baseColor = nodeConfig.value?.color || '#2563eb'
  return {
    background: 'rgba(255, 255, 255, 0.95)',
    color: baseColor,
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.08)',
    width: '24px', height: '24px', borderRadius: '8px'
  }
})

function onMouseEnter ()  { emit('hover-change', true) }
function onMouseLeave ()  { emit('hover-change', false) }
</script>

<style scoped>
.base-node { position: relative; width: 100%; height: 100%; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; display: flex; flex-direction: column; box-shadow: 0 1px 3px rgba(0,0,0,.08), 0 1px 2px rgba(0,0,0,.06); transition: all .2s cubic-bezier(.4,0,.2,1); cursor: grab; overflow: hidden }
.base-node:hover { border-color: #9ca3af; box-shadow: 0 4px 6px rgba(0,0,0,.1), 0 2px 4px rgba(0,0,0,.06); transform: translateY(-1px) }
.base-node.selected { border-color: #a855f7; box-shadow: 0 4px 6px rgba(168,85,247,.15), 0 2px 4px rgba(168,85,247,.1) }
.base-node.disabled { opacity: .55; pointer-events: none }
.node-header { display: flex; align-items: center; height: 32px; padding: 0 16px; color: #fff; font-size: 14px; font-weight: 600; border-radius: 12px 12px 0 0; flex-shrink: 0 }
.node-icon { width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border-radius: 8px; margin-right: 12px }
.node-title { flex: 1; font-size: 14px; color: #fff; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-shadow: 0 1px 1px rgba(0,0,0,.15) }
.node-menu { display: flex; gap: 2px; cursor: pointer; padding: 4px; margin-left: 8px }
.node-menu .dot { width: 3px; height: 3px; border-radius: 50%; background: rgba(255,255,255,.9) }
.node-content { flex: 1; display: flex; flex-direction: column; padding: 12px; gap: 0; overflow: hidden }
</style>
