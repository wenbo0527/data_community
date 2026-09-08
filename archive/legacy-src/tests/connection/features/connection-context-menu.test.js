import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ConnectionContextMenu from '../components/ConnectionContextMenu.vue'

// Mock Arco Design icons
vi.mock('@arco-design/web-vue/es/icon', () => ({
  IconDelete: { name: 'IconDelete', template: '<div>delete-icon</div>' },
  IconEdit: { name: 'IconEdit', template: '<div>edit-icon</div>' },
  IconEye: { name: 'IconEye', template: '<div>eye-icon</div>' }
}))

describe('ConnectionContextMenu.vue', () => {
  let wrapper
  let mockConnectionData

  beforeEach(() => {
    mockConnectionData = {
      id: 'conn-1',
      source: 'node-1',
      target: 'node-2',
      type: 'normal'
    }
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    // 清理事件监听器
    document.removeEventListener('click', vi.fn())
    document.removeEventListener('keydown', vi.fn())
  })

  describe('组件渲染', () => {
    it('当visible为false时不显示菜单', () => {
      wrapper = mount(ConnectionContextMenu, {
        props: {
          visible: false,
          position: { x: 100, y: 100 },
          connectionData: mockConnectionData
        }
      })

      expect(wrapper.find('.connection-context-menu').exists()).toBe(false)
    })

    it('当visible为true时显示菜单', () => {
      wrapper = mount(ConnectionContextMenu, {
        props: {
          visible: true,
          position: { x: 100, y: 100 },
          connectionData: mockConnectionData
        }
      })

      expect(wrapper.find('.connection-context-menu').exists()).toBe(true)
    })

    it('正确设置菜单位置', () => {
      const position = { x: 150, y: 200 }
      wrapper = mount(ConnectionContextMenu, {
        props: {
          visible: true,
          position,
          connectionData: mockConnectionData
        }
      })

      const menu = wrapper.find('.connection-context-menu')
      expect(menu.attributes('style')).toContain('left: 150px')
      expect(menu.attributes('style')).toContain('top: 200px')
    })

    it('渲染所有菜单项', () => {
      wrapper = mount(ConnectionContextMenu, {
        props: {
          visible: true,
          position: { x: 100, y: 100 },
          connectionData: mockConnectionData
        }
      })

      const menuItems = wrapper.findAll('.menu-item')
      expect(menuItems).toHaveLength(3)
      expect(menuItems[0].text()).toContain('删除连接线')
      expect(menuItems[1].text()).toContain('编辑连接')
      expect(menuItems[2].text()).toContain('查看详情')
    })
  })

  describe('事件处理', () => {
    beforeEach(() => {
      wrapper = mount(ConnectionContextMenu, {
        props: {
          visible: true,
          position: { x: 100, y: 100 },
          connectionData: mockConnectionData
        }
      })
    })

    it('点击删除连接线触发delete-connection事件', async () => {
      const deleteItem = wrapper.findAll('.menu-item')[0]
      await deleteItem.trigger('click')

      expect(wrapper.emitted('delete-connection')).toBeTruthy()
      expect(wrapper.emitted('delete-connection')[0]).toEqual([mockConnectionData])
      expect(wrapper.emitted('close')).toBeTruthy()
    })

    it('点击编辑连接触发edit-connection事件', async () => {
      const editItem = wrapper.findAll('.menu-item')[1]
      await editItem.trigger('click')

      expect(wrapper.emitted('edit-connection')).toBeTruthy()
      expect(wrapper.emitted('edit-connection')[0]).toEqual([mockConnectionData])
      expect(wrapper.emitted('close')).toBeTruthy()
    })

    it('点击查看详情触发view-details事件', async () => {
      const viewItem = wrapper.findAll('.menu-item')[2]
      await viewItem.trigger('click')

      expect(wrapper.emitted('view-details')).toBeTruthy()
      expect(wrapper.emitted('view-details')[0]).toEqual([mockConnectionData])
      expect(wrapper.emitted('close')).toBeTruthy()
    })

    it('点击菜单本身不触发关闭事件', async () => {
      const menu = wrapper.find('.connection-context-menu')
      await menu.trigger('click')

      expect(wrapper.emitted('close')).toBeFalsy()
    })
  })

  describe('键盘事件', () => {
    it('按ESC键关闭菜单', async () => {
      wrapper = mount(ConnectionContextMenu, {
        props: {
          visible: true,
          position: { x: 100, y: 100 },
          connectionData: mockConnectionData
        }
      })

      // 模拟ESC键按下
      const escEvent = new KeyboardEvent('keydown', { key: 'Escape' })
      document.dispatchEvent(escEvent)

      await wrapper.vm.$nextTick()
      expect(wrapper.emitted('close')).toBeTruthy()
    })

    it('按其他键不关闭菜单', async () => {
      wrapper = mount(ConnectionContextMenu, {
        props: {
          visible: true,
          position: { x: 100, y: 100 },
          connectionData: mockConnectionData
        }
      })

      // 模拟其他键按下
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' })
      document.dispatchEvent(enterEvent)

      await wrapper.vm.$nextTick()
      expect(wrapper.emitted('close')).toBeFalsy()
    })
  })

  describe('外部点击', () => {
    it('点击外部区域关闭菜单', async () => {
      wrapper = mount(ConnectionContextMenu, {
        props: {
          visible: true,
          position: { x: 100, y: 100 },
          connectionData: mockConnectionData
        }
      })

      // 模拟点击外部区域
      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true
      })
      document.dispatchEvent(clickEvent)

      await wrapper.vm.$nextTick()
      expect(wrapper.emitted('close')).toBeTruthy()
    })
  })

  describe('边界情况', () => {
    it('处理空的connectionData', () => {
      wrapper = mount(ConnectionContextMenu, {
        props: {
          visible: true,
          position: { x: 100, y: 100 },
          connectionData: {}
        }
      })

      expect(wrapper.find('.connection-context-menu').exists()).toBe(true)
    })

    it('处理默认position值', () => {
      wrapper = mount(ConnectionContextMenu, {
        props: {
          visible: true,
          connectionData: mockConnectionData
        }
      })

      const menu = wrapper.find('.connection-context-menu')
      expect(menu.attributes('style')).toContain('left: 0px')
      expect(menu.attributes('style')).toContain('top: 0px')
    })

    it('菜单不可见时不响应键盘事件', async () => {
      wrapper = mount(ConnectionContextMenu, {
        props: {
          visible: false,
          position: { x: 100, y: 100 },
          connectionData: mockConnectionData
        }
      })

      // 模拟ESC键按下
      const escEvent = new KeyboardEvent('keydown', { key: 'Escape' })
      document.dispatchEvent(escEvent)

      await wrapper.vm.$nextTick()
      expect(wrapper.emitted('close')).toBeFalsy()
    })
  })

  describe('样式和交互', () => {
    beforeEach(() => {
      wrapper = mount(ConnectionContextMenu, {
        props: {
          visible: true,
          position: { x: 100, y: 100 },
          connectionData: mockConnectionData
        }
      })
    })

    it('菜单项包含正确的CSS类', () => {
      const menuItems = wrapper.findAll('.menu-item')
      menuItems.forEach(item => {
        expect(item.classes()).toContain('menu-item')
      })
    })

    it('包含菜单分隔线', () => {
      expect(wrapper.find('.menu-divider').exists()).toBe(true)
    })

    it('菜单图标正确渲染', () => {
      const menuItems = wrapper.findAll('.menu-item')
      expect(menuItems[0].find('.menu-icon').exists()).toBe(true)
      expect(menuItems[1].find('.menu-icon').exists()).toBe(true)
      expect(menuItems[2].find('.menu-icon').exists()).toBe(true)
    })
  })
})