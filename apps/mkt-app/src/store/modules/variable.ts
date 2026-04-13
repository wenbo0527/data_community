import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useVariableStore = defineStore('variable', () => {
  const variables = ref([])
  const loading = ref(false)
  
  return { variables, loading }
})
