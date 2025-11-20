<template>
  <div class="base-node" :class="[nodeType, { disabled, selected, hover }]" @mouseenter="onMouseEnter" @mouseleave="onMouseLeave">
    <!-- 标题区 -->
    <header class="node-header" :style="headerStyle">
      <div class="node-icon" :style="iconStyle">
        <slot name="icon">
          <span class="node-icon-text">{{ iconText }}</span>
        </slot>
      </div>
      <span class="node-title">{{ title }}</span>
      <div class="node-menu" v-if="showMenu" @click.stop="$emit('menu')">
        <span class="dot"></span><span class="dot"></span><span class="dot"></span>
      </div>
    </header>

    <!-- 内容区：插槽用于放置 InPort / OutPort 组件 -->
    <main class="node-content">
      <slot />
    </main>
  </div>
</template>

<script setup>
/* BaseNode: 标题区 + 内容区 节点外壳
 * 统一外壳样式、交互态、菜单入口
 * 内容区由父组件通过插槽动态渲染 InPort / OutPort
 */
import { computed } from 'vue'
import { getNodeConfig } from '../../utils/nodeTypes.js'

const props = defineProps({
  nodeType:   { type: String, required: true },                 // 节点类型，用于样式映射
  title:      { type: String, default: '' },                   // 标题文字
  iconText:   { type: String, default: '' },                  // 节点图标（单字符）
  disabled:   { type: Boolean, default: false },              // 禁用态
  selected:   { type: Boolean, default: false },              // 选中态
  hover:      { type: Boolean, default: false },               // 悬停态（可外部控制）
  showMenu:   { type: Boolean, default: true }                // 是否显示右上角菜单
})

const emit = defineEmits(['menu', 'hover-change'])

// 获取节点配置
const nodeConfig = computed(() => getNodeConfig(props.nodeType))

// 计算标题区样式 - 🎨 参考图片风格，简洁现代渐变
const headerStyle = computed(() => {
  const baseColor = nodeConfig.value?.color || '#4C78FF'
  // 创建简洁的渐变效果，从纯色到轻微透明
  return {
    background: `linear-gradient(to bottom, 
      ${baseColor} 0%, 
      ${baseColor} 75%, 
      rgba(255, 255, 255, 0.1) 100%
    )`,
    borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.15)'
  }
})

// 计算图标样式 - 🎨 参考图片风格，简洁图标
const iconStyle = computed(() => {
  const baseColor = nodeConfig.value?.color || '#4C78FF'
  return {
    background: 'rgba(255, 255, 255, 0.95)',
    color: baseColor,
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.08)'
  }
})

// 颜色变亮函数
function lightenColor(color, percent) {
  const num = parseInt(color.replace("#", ""), 16)
  const amt = Math.round(2.55 * percent)
  const R = (num >> 16) + amt
  const G = (num >> 8 & 0x00FF) + amt
  const B = (num & 0x0000FF) + amt
  return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1)
}

function onMouseEnter ()  { emit('hover-change', true)  }
function onMouseLeave ()  { emit('hover-change', false) }
</script>

<style scoped>
.base-node {
  position: relative;
  width: 100%;
  height: 100%;
  background: #ffffff;
  border: 1px solid #d1d5db;  /* 🎨 参考图片风格 - 浅灰色边框 */
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06);  /* 🎨 更柔和的阴影 */
  transition: all .2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: grab;
  overflow: hidden;
}
.base-node:hover          { 
  border-color: #9ca3af;  /* 🎨 悬停时稍深的灰色 */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06);
  transform: translateY(-1px);  /* 🎨 更细微的提升 */
}
.base-node.selected       { 
  border-color: #a855f7;  /* 🎨 参考图片的紫色边框 */
  box-shadow: 0 4px 6px rgba(168, 85, 247, 0.15), 0 2px 4px rgba(168, 85, 247, 0.1);
}
.base-node.disabled       { opacity: .55; pointer-events: none; }

.node-header {
  display: flex;
  align-items: center;
  height: 40px;
  padding: 0 16px;
  border-radius: 12px 12px 0 0;
  flex-shrink: 0;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
.node-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  margin-right: 10px;
  flex-shrink: 0;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
.node-icon-text {
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
}
.node-title {
  flex: 1;
  font-size: 14px;
  color: #fff;
  font-weight: 500;  /* 🎨 参考图片风格 - 中等字重 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.15);  /* 🎨 更柔和的阴影 */
  letter-spacing: 0.01em;  /* 🎨 轻微字间距优化 */
}
.node-menu {
  display: flex;
  gap: 2px;
  cursor: pointer;
  padding: 4px;
  margin-left: 8px;
}
.node-menu .dot {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);  /* 🎨 更明亮的点 */
  transition: all 0.2s ease;
}
.node-menu:hover .dot { 
  background: rgba(255, 255, 255, 1);
  transform: scale(1.1);  /* 🎨 更细微的放大 */
}

.node-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px;
  gap: 0;
  overflow: hidden;
}

/* 🎨 参考图片风格 - 节点类型边框色调统一 */
.base-node.crowd-split { border-color: rgba(168, 85, 247, 0.15); }
.base-node.event-split { border-color: rgba(168, 85, 247, 0.15); }
.base-node.ab-test { border-color: rgba(168, 85, 247, 0.15); }
.base-node.sms { border-color: rgba(168, 85, 247, 0.15); }
.base-node.ai-call { border-color: rgba(168, 85, 247, 0.15); }
.base-node.manual-call { border-color: rgba(168, 85, 247, 0.15); }
.base-node.benefit { border-color: rgba(168, 85, 247, 0.15); }
.base-node.wait { border-color: rgba(168, 85, 247, 0.15); }
.base-node.end { border-color: rgba(168, 85, 247, 0.15); }
</style>