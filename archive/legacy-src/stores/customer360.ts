import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { mockUsers, fetchUserInfo } from '@/mock/customer360'

/**
 * 客户 360 Pinia Store
 *
 * 包装 customer360.ts 静态 mock,提供响应式 + 跨组件共享能力。
 * 接入:
 *   const c360 = useCustomer360Store()
 *   c360.fetch('user_001')
 *   c360.currentUser  // 当前用户
 *   c360.userList     // 所有用户列表
 */
export const useCustomer360Store = defineStore('customer360', () => {
  // 用户字典(userId → 用户数据)
  const usersMap = ref<Record<string, any>>(mockUsers || {})

  // 用户 ID 列表
  const userList = computed(() => Object.keys(usersMap.value).map(id => ({
    id,
    ...usersMap.value[id]
  })))

  // 当前查看的用户
  const currentUser = ref<any>(null)
  const currentUserId = ref<string | null>(null)
  const loading = ref(false)

  const fetch = async (userId: string): Promise<any> => {
    currentUserId.value = userId
    loading.value = true
    try {
      const user = await fetchUserInfo(userId)
      currentUser.value = user
      return user
    } finally {
      loading.value = false
    }
  }

  const fetchSync = (userId: string): any => {
    currentUserId.value = userId
    const user = usersMap.value[userId]
    currentUser.value = user
    return user
  }

  const reset = () => {
    currentUser.value = null
    currentUserId.value = null
  }

  return {
    usersMap,
    userList,
    currentUser,
    currentUserId,
    loading,
    fetch,
    fetchSync,
    reset
  }
})