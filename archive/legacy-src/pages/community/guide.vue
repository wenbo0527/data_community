<template>
  <CommunityResource 
    :category="ResourceCategory.GUIDE"
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
  console.log('编辑文档:', item)
  // 可以跳转到编辑页面
}

const handleView = (item) => {
  console.log('查看文档:', item)
  // 可以跳转到详情页面或打开PDF查看器
}

</script>