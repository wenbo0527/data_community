<template>
  <CommunityResource 
    :category="ResourceCategory.NEWS"
    :can-manage="canManage"
    @add="handleAdd"
    @edit="handleEdit"
    @view="handleView"
  />
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import CommunityResource from '@/components/community/CommunityResource.vue'
import { ResourceCategory } from '@/types/community'

const router = useRouter()

// 管理权限
const canManage = ref(true)

// 事件处理
const handleAdd = () => {
  router.push('/notification/create')
}

const handleEdit = (item) => {
  router.push(`/notification/edit/${item.id}`)
}

const handleView = (item) => {
  // 查看文档详情
  console.log('查看文档:', item)
}
</script>