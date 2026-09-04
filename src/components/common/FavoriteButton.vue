<template>
  <a-tooltip :content="isFavorited ? '取消收藏' : '加入收藏'" mini>
    <a-button
      :type="isFavorited ? 'primary' : 'outline'"
      size="small"
      @click="toggleFavorite"
    >
      <template #icon>
        <IconStar :style="{ color: isFavorited ? '#ffcd36' : undefined }" />
      </template>
      {{ isFavorited ? '已收藏' : '收藏' }}
    </a-button>
  </a-tooltip>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconStar } from '@arco-design/web-vue/es/icon'

const props = defineProps<{
  resourceType: string
  resourceId: string
  resourceName: string
  userId: string
  userName: string
}>()

const STORAGE_KEY = 'favorites'

const isFavorited = ref(false)

function getFavorites(): any[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

function saveFavorites(list: any[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

function checkStatus() {
  const list = getFavorites()
  isFavorited.value = list.some(
    (f) => f.resourceType === props.resourceType && f.resourceId === props.resourceId
  )
}

function toggleFavorite() {
  const list = getFavorites()
  if (isFavorited.value) {
    const idx = list.findIndex(
      (f) => f.resourceType === props.resourceType && f.resourceId === props.resourceId
    )
    if (idx > -1) list.splice(idx, 1)
    saveFavorites(list)
    isFavorited.value = false
    Message.success('已取消收藏')
  } else {
    list.push({
      resourceType: props.resourceType,
      resourceId: props.resourceId,
      resourceName: props.resourceName,
      userId: props.userId,
      userName: props.userName,
      createdAt: new Date().toISOString()
    })
    saveFavorites(list)
    isFavorited.value = true
    Message.success('收藏成功')
  }
}

onMounted(checkStatus)
</script>
