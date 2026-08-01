import { ref } from 'vue'

const STORAGE_KEY = 'horizontal_canvas_current_user'

const _user = ref(loadFromStorage())

function loadFromStorage() {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v && /^\S+@\S+\.\S+$/.test(v)) return v
  } catch {}
  return generateMockUser()
}

function generateMockUser() {
  const seed = String(Date.now()).slice(-6) || '000000'
  const chars = 'abcdefghijklmnopqrstuvwxyz'
  const suffix = Array.from(seed).map(d => chars[Number(d)] || 'x').join('').slice(0, 6)
  const email = `user_${suffix}@demo.local`
  try { localStorage.setItem(STORAGE_KEY, email) } catch {}
  return email
}

function setUser(email) {
  if (!email || !/^\S+@\S+\.\S+$/.test(String(email).trim())) return false
  _user.value = String(email).trim()
  try { localStorage.setItem(STORAGE_KEY, _user.value) } catch {}
  return true
}

/**
 * 当前用户组合式（mock；从 localStorage 读取/写入）
 * 返回：
 *   { user: Ref<string>, setUser: (email) => boolean }
 * 边界：当前用户身份对所有审批/发布/编辑操作可见；邮箱格式校验通过才能切换。
 */
export function useCurrentUser() {
  return { user: _user, setUser }
}
/*
用途：当前用户组合式（mock）
说明：解决审批流用户硬编码 '当前用户' 的问题；从 localStorage 读取邮箱；首次访问自动生成 mock 邮箱。
边界：仅 mock，未接入真实身份系统；邮箱格式校验通过才能切换用户。
*/