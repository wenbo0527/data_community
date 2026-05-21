/**
 * Router 工具函数
 */
import { useRouter } from 'vue-router'

/**
 * 返回上一页
 */
export function goBack(): void {
  const router = useRouter()
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}

export default { goBack }
