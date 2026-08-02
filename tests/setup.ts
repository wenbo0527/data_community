/**
 * 组件/E2E 测试全局 setup
 */
import { setActivePinia, createPinia } from 'pinia'
import { vi, beforeEach } from 'vitest'

beforeEach(() => {
  // 重置 Pinia
  setActivePinia(createPinia())
})

// Mock Arco icons(组件测试中避免 ESM 问题)
vi.mock('@arco-design/web-vue/es/icon', () => ({
  default: {},
  IconStorage: { name: 'IconStorage', render: () => null },
  IconUserGroup: { name: 'IconUserGroup', render: () => null },
  IconLink: { name: 'IconLink', render: () => null },
  IconStar: { name: 'IconStar', render: () => null },
  IconUp: { name: 'IconUp', render: () => null },
  IconDown: { name: 'IconDown', render: () => null },
  IconEye: { name: 'IconEye', render: () => null },
  IconEyeInvisible: { name: 'IconEyeInvisible', render: () => null },
  IconClose: { name: 'IconClose', render: () => null },
  IconRefresh: { name: 'IconRefresh', render: () => null },
  IconRight: { name: 'IconRight', render: () => null },
  IconSafe: { name: 'IconSafe', render: () => null },
  IconPlus: { name: 'IconPlus', render: () => null }
}))