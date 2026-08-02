<template>
  <a-button
    :type="favorited ? 'primary' : 'outline'"
    :status="favorited ? 'warning' : 'default'"
    size="small"
    @click="onToggle"
  >
    <template #icon>
      <icon-star :class="{ 'star-filled': favorited }" />
    </template>
    {{ favorited ? '已收藏' : '收藏' }}
    <a-tag v-if="favoriteCount > 0" size="mini" color="orange" style="margin-left: 4px;">
      {{ favoriteCount }}
    </a-tag>
  </a-button>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { IconStar } from '@arco-design/web-vue/es/icon'
import { Message } from '@arco-design/web-vue'
import { FavoriteStore } from '@/mock/shared/favorite-directory'

const props = defineProps<{
  resourceType: 'table' | 'field' | 'metric' | 'tag' | 'audience' | 'dashboard' | 'service' | 'api' | 'report'
  resourceId: string
  resourceName: string
  userId: string
  userName: string
}>()

const favorited = ref(false)
const favoriteCount = ref(0)

const check = () => {
  favorited.value = FavoriteStore.isFavorited(props.userId, props.resourceType, props.resourceId)
  favoriteCount.value = FavoriteStore.byResource(props.resourceType, props.resourceId).length
}

const onToggle = () => {
  const result = FavoriteStore.toggle({
    userId: props.userId,
    userName: props.userName,
    resourceType: props.resourceType,
    resourceId: props.resourceId,
    resourceName: props.resourceName,
    group: 'personal',
    tags: [],
    notification: 'none'
  })
  if (result?.added) {
    Message.success(`已收藏「${props.resourceName}」`)
  } else {
    Message.info(`已取消收藏`)
  }
  check()
}

onMounted(check)
</script>

<style lang="scss" scoped>
.star-filled {
  color: #ff7d00 !important;
}
</style>