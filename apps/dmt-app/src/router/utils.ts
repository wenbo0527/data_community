// router utils
import { useRouter } from 'vue-router'

export const goBack = () => {
  const router = useRouter()
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}

export default { goBack }
