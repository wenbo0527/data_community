import { useRouter } from 'vue-router'

export function useRouterNav() {
  const router = useRouter()

  const navigateTo = (to: string | Record<string, any>) => {
    try {
      // @ts-ignore
      router.push(to)
    } catch (e) {
      // noop
    }
  }

  const goBack = (fallback?: string) => {
    try {
      router.back()
    } catch (e) {
      if (fallback) navigateTo(fallback)
    }
  }

  const refreshCurrentPage = () => {
    try {
      router.replace({ path: router.currentRoute.value.fullPath, query: router.currentRoute.value.query })
    } catch (e) {
      // noop
    }
  }

  return { navigateTo, goBack, refreshCurrentPage }
}
