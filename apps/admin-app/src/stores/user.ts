import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref({
    id: 1,
    name: '管理员',
    roles: ['SuperAdmin']
  })

  function computeEffectivePermissions() {
    // stub
  }

  return {
    userInfo,
    computeEffectivePermissions
  }
})
