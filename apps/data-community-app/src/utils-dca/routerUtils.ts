import type { Router } from 'vue-router'

export const goBack = (router: Router, fallbackPath: string = '/') => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push(fallbackPath)
  }
}

export default { goBack }
