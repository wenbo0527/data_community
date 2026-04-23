<template>
  <div class="business-node" :class="nodeClass">
    <div class="node-header" :style="{ backgroundColor: domainColor }">
      <component :is="iconComponent" class="node-icon" />
      <span class="node-title" :title="nodeData.name">{{ nodeData.name }}</span>
      <span class="layer-tag" :class="layerClass">{{ nodeData.layerName }}</span>
    </div>
    <div class="node-content">
      <div class="info-row">
        <span class="label">编码:</span>
        <span class="value">{{ nodeData.code }}</span>
      </div>
      <div class="info-row">
        <span class="label">业务域:</span>
        <span class="value">{{ nodeData.domainName }}</span>
      </div>
      <div class="info-row" v-if="nodeData.description">
        <span class="label">描述:</span>
        <span class="value" :title="nodeData.description">{{ nodeData.description }}</span>
      </div>
      <div class="attributes-preview" v-if="nodeData.attributes && nodeData.attributes.length">
        <div class="attr-tag" v-for="attr in nodeData.attributes.slice(0, 3)" :key="attr.code">
          {{ attr.name }}
        </div>
        <div v-if="nodeData.attributes.length > 3" class="more-attrs">...</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, inject, onMounted, ref } from 'vue'
import { IconUser, IconFile, IconStorage, IconCommon, IconApps, IconSafe } from '@arco-design/web-vue/es/icon'

const props = defineProps({
  node: {
    type: Object,
    required: true
  }
})

// 获取节点数据
const getNodeData = () => {
  return props.node.getData() || {}
}

const nodeData = ref(getNodeData())

// 监听数据变化
onMounted(() => {
  props.node.on('change:data', () => {
    nodeData.value = getNodeData()
  })
})

const nodeClass = computed(() => {
  return {
    'is-selected': props.node.isSelected?.()
  }
})

const iconComponent = computed(() => {
  // 根据业务域简单映射图标
  const domainCode = nodeData.value.domainCode || ''
  if (domainCode.includes('DOM001')) return IconUser // 客户
  if (domainCode.includes('DOM002')) return IconStorage // 账户
  if (domainCode.includes('DOM003')) return IconFile // 授信
  if (domainCode.includes('DOM004')) return IconApps // 支用
  if (domainCode.includes('DOM005')) return IconCommon // 还款
  if (domainCode.includes('DOM006')) return IconSafe // 贷后
  return IconFile
})

const layerClass = computed(() => {
  const layer = nodeData.value.layer
  if (layer === 'client') return 'layer-client'
  if (layer === 'account') return 'layer-account'
  return 'layer-business'
})

const domainColor = computed(() => {
  const domainCode = nodeData.value.domainCode || ''
  // 为不同域分配不同颜色背景（淡色）
  if (domainCode === 'DOM001') return '#e8f3ff' // 蓝
  if (domainCode === 'DOM002') return '#e8ffea' // 绿
  if (domainCode === 'DOM003') return '#fff7e6' // 橙
  if (domainCode === 'DOM004') return '#f9f0ff' // 紫
  if (domainCode === 'DOM005') return '#e8fffb' // 青
  if (domainCode === 'DOM006') return '#fff0f6' // 红
  return 'var(--subapp-bg-secondary)'
})

</script>

<style scoped>
.business-node {
  width: 100%;
  height: 100%;
  background: #fff;
  border-radius: 8px;
  border: 1px solid var(--subapp-border);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  transition: all 0.2s;
  overflow: hidden;
}

.business-node:hover {
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
  border-color: var(--primary-6);
}

.business-node.is-selected {
  border-color: var(--primary-6);
  box-shadow: 0 0 0 2px rgba(var(--primary-6), 0.2);
}

.node-header {
  padding: 8px 12px;
  border-bottom: 1px solid var(--subapp-border);
  display: flex;
  align-items: center;
  gap: 8px;
}

.node-icon {
  font-size: 16px;
  color: var(--color-text-2);
}

.node-title {
  font-weight: 600;
  color: var(--color-text-1);
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.layer-tag {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 10px;
  white-space: nowrap;
  font-weight: 500;
}

.layer-client {
  color: var(--subapp-primary);
  background: #E8F3FF;
  border: 1px solid #BEDAFF;
}

.layer-account {
  color: var(--subapp-success);
  background: #E8FFEA;
  border: 1px solid #AFF0B5;
}

.layer-business {
  color: var(--subapp-warning);
  background: #FFF7E6;
  border: 1px solid #FFD591;
}

.node-content {
  flex: 1;
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-height: 80px;
}

.info-row {
  display: flex;
  font-size: 12px;
  line-height: 1.5;
}

.label {
  color: var(--color-text-3);
  min-width: 48px;
  flex-shrink: 0;
}

.value {
  color: var(--color-text-2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.attributes-preview {
  margin-top: 4px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.attr-tag {
  font-size: 10px;
  background: var(--color-fill-2);
  color: var(--color-text-2);
  padding: 1px 6px;
  border-radius: 4px;
}

.more-attrs {
  font-size: 10px;
  color: var(--color-text-3);
  padding-top: 2px;
}
</style>
