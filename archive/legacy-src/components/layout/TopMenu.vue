<template>
  <div class="top-menu-bar">
    <a-menu 
      mode="horizontal" 
      :selected-keys="selectedKeys" 
      @menu-item-click="handleMenuClick"
      class="top-menu"
    >
      <a-menu-item 
        v-for="menuKey in topMenuOrder" 
        :key="menuKey"
        :class="{ 'menu-item-active': selectedKeys.includes(menuKey) }"
      >
        {{ menuConfig[menuKey].title }}
      </a-menu-item>
    </a-menu>
    <div class="menu-actions">
      <a-dropdown trigger="click" position="br">
        <a-button type="outline" size="small">
          帮助
        </a-button>
        <template #content>
          <a-doption @click="goToDocs">产品文档</a-doption>
          <a-doption @click="openTicket">提交工单</a-doption>
        </template>
      </a-dropdown>
    </div>
  </div>
  <a-modal v-model:visible="ticketVisible" title="提交工单" :width="520" @ok="submitTicket" @cancel="closeTicket">
    <a-form :model="ticketForm" layout="vertical">
      <a-form-item label="工单标题" field="title" :rules="[{ required: true, message: '请输入工单标题' }]">
        <a-input v-model="ticketForm.title" placeholder="请输入问题标题" />
      </a-form-item>
      <a-form-item label="所属模块" field="module">
        <a-select v-model="ticketForm.module" placeholder="请选择模块">
          <a-option v-for="m in topMenuOrder" :key="m" :value="m">{{ menuConfig[m].title }}</a-option>
        </a-select>
      </a-form-item>
      <a-form-item label="问题描述" field="description" :rules="[{ required: true, message: '请输入问题描述' }]">
        <a-textarea v-model="ticketForm.description" :rows="4" placeholder="请简要描述问题与期望" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { MENU_CONFIG, TOP_MENU_ORDER, getModuleDefaultPath, getMenuItemByRouteName } from '../../config/menuConfig'
import { navigateTo } from '../../router/utils'
import { Message } from '@arco-design/web-vue'

const router = useRouter()
const route = useRoute()

const menuConfig = MENU_CONFIG
const topMenuOrder = TOP_MENU_ORDER

const selectedKeys = ref([])

const emit = defineEmits(['menu-change'])

const updateSelectedFromRoute = (shouldEmit = true) => {
  const byName = getMenuItemByRouteName(route.name)
  if (byName) {
    const newSelectedKeys = [byName.module]
    if (JSON.stringify(selectedKeys.value) !== JSON.stringify(newSelectedKeys)) {
      selectedKeys.value = newSelectedKeys
      if (shouldEmit) {
        emit('menu-change', byName.module)
      }
    }
    return
  }
  const p = route.path || ''
  let defaultKey = 'home'
  if (p.startsWith('/home')) defaultKey = 'home'
  else if (p.startsWith('/discovery')) defaultKey = 'discovery'
  else if (p.startsWith('/exploration')) defaultKey = 'exploration'
  else if (p.startsWith('/management')) defaultKey = 'management'
  else if (p.startsWith('/marketing')) defaultKey = 'marketing'
  else if (p.startsWith('/risk')) defaultKey = 'risk'
  else if (p.startsWith('/touch')) defaultKey = 'touch'
  if (!selectedKeys.value.includes(defaultKey)) {
    selectedKeys.value = [defaultKey]
    if (shouldEmit) {
      emit('menu-change', defaultKey)
    }
  }
}

const handleMenuClick = (key) => {
  try {
    selectedKeys.value = [key]
    emit('menu-change', key)
    
    if (key === 'home') {
      navigateTo(router, menuConfig.home.path)
    } else {
      const defaultPath = getModuleDefaultPath(key)
      if (defaultPath) {
        navigateTo(router, defaultPath)
      }
    }
  } catch (error) {
    console.error('顶部菜单点击错误:', error)
  }
}

watch(
  () => route.path,
  () => {
    updateSelectedFromRoute()
  },
  { immediate: true }
)

defineExpose({
  setActiveMenu: (menuKey) => {
    if (!selectedKeys.value.includes(menuKey)) {
      selectedKeys.value = [menuKey]
    }
  }
})

const ticketVisible = ref(false)
const ticketForm = ref({
  title: '',
  module: '',
  description: ''
})
const goToDocs = () => {
  router.push('/community/guide')
}
const openTicket = () => {
  ticketForm.value.module = selectedKeys.value[0] || ''
  ticketVisible.value = true
}
const closeTicket = () => {
  ticketVisible.value = false
}
const submitTicket = () => {
  if (!ticketForm.value.title || !ticketForm.value.description) {
    Message.warning('请填写标题与描述')
    return
  }
  const raw = localStorage.getItem('support.tickets')
  const list = raw ? JSON.parse(raw) : []
  list.push({
    id: Date.now(),
    ...ticketForm.value,
    time: new Date().toISOString()
  })
  localStorage.setItem('support.tickets', JSON.stringify(list))
  Message.success('工单已提交')
  ticketVisible.value = false
  ticketForm.value = { title: '', module: '', description: '' }
}
</script>

<style scoped>
.top-menu-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 48px;
}
.top-menu {
  background: #f8f9fa;
  border-bottom: 1px solid #e5e6eb;
  height: 48px;
}

.menu-item-active {
  color: rgb(var(--primary-6)) !important;
  font-weight: 600;
}

:deep(.arco-menu-horizontal .arco-menu-item) {
  padding: 0 20px;
  height: 48px;
  line-height: 48px;
  font-size: 14px;
}

:deep(.arco-menu-horizontal .arco-menu-item:hover) {
  background-color: var(--color-fill-2);
}
.menu-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 12px;
}
</style>
