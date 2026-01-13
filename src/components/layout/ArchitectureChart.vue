<template>
  <div class="architecture-container">
    <img src="/2.5d.svg" alt="社区架构图" class="architecture-image" />
    <div class="hotspot" style="top:20%;left:15%;width:18%;height:14%" @mouseenter="onEnter('ingest')" @mouseleave="onLeave" @click="openActions('ingest')"></div>
    <div class="hotspot" style="top:45%;left:40%;width:20%;height:16%" @mouseenter="onEnter('process')" @mouseleave="onLeave" @click="openActions('process')"></div>
    <a-popover v-model:popup-visible="visible" position="tl">
      <template #content>
        <div class="actions">
          <a-button type="primary" size="mini" @click="handleAction('/discovery/external', '数据接入')">立即上传</a-button>
          <a-button size="mini" @click="handleAction('/management/service', '数据管理')">查看日志</a-button>
        </div>
      </template>
      <span class="anchor" :style="{ top: anchor.y + 'px', left: anchor.x + 'px' }"></span>
    </a-popover>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Message } from '@arco-design/web-vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const visible = ref(false)
const anchor = ref({ x: 10, y: 10 })

const onEnter = (key) => {}
const onLeave = () => {}

const handleAction = (path, label) => {
  if (path) {
    Message.success({
      content: `正在前往${label}...`,
      duration: 3000
    })
    router.push(path)
  } else {
    Message.error({
      content: '操作配置无效，请稍后再试',
      duration: 6000
    })
  }
}

const openActions = (key) => { visible.value = true }
</script>

<style scoped>
.architecture-container {
  position: relative;
  width: 100%;
  height: 400px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--color-bg-1);
  border-radius: 8px;
}

.architecture-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 0.3s ease;
}

.architecture-image:hover {
  transform: scale(1.02);
}

.hotspot {
  position: absolute;
  cursor: pointer;
  border-radius: 8px;
  background: rgba(22,93,255,0.08);
  opacity: 0;
  transition: opacity .2s;
}

.hotspot:hover { opacity: 1; }

.anchor { position: absolute; width: 1px; height: 1px; }

.actions { display: flex; gap: 8px; }
</style>
