<template>
  <div class="virtual-event-detail">
    <VirtualEventForm 
      :event-data="eventData"
      :real-events="realEvents"
      @submit="handleSubmit"
      @cancel="handleCancel"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { mockEventAPI } from '@/mock/event'
import VirtualEventForm from './components/VirtualEventForm.vue'

const router = useRouter()
const route = useRoute()

const eventData = ref(null)
const realEvents = ref([])
const loading = ref(false)

const isEdit = computed(() => !!route.params.id)

import { computed } from 'vue'

onMounted(async () => {
  loading.value = true
  try {
    // 加载真实事件列表
    realEvents.value = await mockEventAPI.getEvents()
    
    // 如果是编辑模式，加载详情
    if (isEdit.value) {
      const allVirtualEvents = await mockEventAPI.getVirtualEvents(realEvents.value)
      const target = allVirtualEvents.find(e => e.id === route.params.id)
      if (target) {
        eventData.value = target
      } else {
        Message.error('未找到该虚拟事件')
        router.push('/exploration/customer-center/event-center/virtual-events')
      }
    }
  } catch (error) {
    console.error('加载数据失败:', error)
    Message.error('加载数据失败')
  } finally {
    loading.value = false
  }
})

const handleSubmit = async (formData) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    Message.success(isEdit.value ? '更新成功' : '创建成功')
    router.push('/exploration/customer-center/event-center/virtual-events')
  } catch (error) {
    Message.error('操作失败')
  }
}

const handleCancel = () => {
  router.back()
}
</script>

<style scoped>
.virtual-event-detail {
  height: 100%;
  background: #F2F3F5;
}
</style>