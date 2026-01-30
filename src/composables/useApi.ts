import { ref } from 'vue'

export function useApi<TParams = any, TResp = any>(requestFn: (params: TParams) => Promise<TResp>) {
  const loading = ref(false)
  const error = ref<any>(null)

  const call = async (params: TParams): Promise<TResp | null> => {
    loading.value = true
    error.value = null
    try {
      const resp = await requestFn(params)
      return resp
    } catch (e) {
      error.value = e
      return null
    } finally {
      loading.value = false
    }
  }

  return { loading, error, call }
}
