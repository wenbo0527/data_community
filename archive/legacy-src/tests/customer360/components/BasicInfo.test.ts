import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import BasicInfo from '@/pages/discovery/customer360/components/BasicInfo.vue'
import { createMockUserData } from '../setup'

describe('BasicInfo Component', () => {
  let wrapper: any
  let mockUserData: any
  
  beforeEach(() => {
    mockUserData = createMockUserData()
    const pinia = createPinia()
    
    wrapper = mount(BasicInfo, {
      props: {
        userInfo: mockUserData
      },
      global: {
        plugins: [pinia]
      }
    })
  })
  
  describe('组件渲染', () => {
    it('应该正确渲染基本信息组件', () => {
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.basic-info').exists()).toBe(true)
    })
    
    it('应该显示用户基本信息描述列表', () => {
      expect(wrapper.find('.a-descriptions').exists()).toBe(true)
    })
    
    it('应该显示骨架屏当无数据时', async () => {
      await wrapper.setProps({ userInfo: null })
      expect(wrapper.find('.a-skeleton').exists()).toBe(true)
    })
  })
  
  describe('数据展示测试', () => {
    it('应该正确显示用户姓名', () => {
      expect(wrapper.text()).toContain(mockUserData.basicInfo.name)
    })
    
    it('应该正确显示年龄', () => {
      expect(wrapper.text()).toContain(mockUserData.basicInfo.age.toString())
    })
    
    it('应该正确显示性别', () => {
      expect(wrapper.text()).toContain(mockUserData.basicInfo.gender)
    })
    
    it('应该正确显示手机号码', () => {
      expect(wrapper.text()).toContain(mockUserData.basicInfo.phone)
    })
    
    it('应该正确显示客户号', () => {
      expect(wrapper.text()).toContain(mockUserData.basicInfo.customerNo)
    })
    
    it('应该正确显示地址', () => {
      expect(wrapper.text()).toContain(mockUserData.basicInfo.address)
    })
    
    it('应该正确显示身份证号', () => {
      expect(wrapper.text()).toContain(mockUserData.basicInfo.idCard)
    })
    
    it('应该正确显示身份证有效期', () => {
      expect(wrapper.text()).toContain(mockUserData.basicInfo.idExpiry)
    })
    
    it('应该正确显示用户状态', () => {
      expect(wrapper.text()).toContain(mockUserData.basicInfo.status)
    })
    
    it('应该正确显示活体相似度', () => {
      expect(wrapper.text()).toContain(mockUserData.basicInfo.similarity.toString())
    })
    
    it('应该正确显示相似度阈值', () => {
      expect(wrapper.text()).toContain(mockUserData.basicInfo.threshold.toString())
    })
  })
  

  
  describe('空数据处理测试', () => {
    it('当用户信息为空时应该显示骨架屏', async () => {
      await wrapper.setProps({ userInfo: null })
      
      const skeleton = wrapper.find('.a-skeleton')
      expect(skeleton.exists()).toBe(true)
    })
    
    it('当用户信息为空对象时应该显示描述列表', async () => {
      await wrapper.setProps({ userInfo: {} })
      
      // 空对象是truthy值，所以应该显示descriptions而不是skeleton
      const skeleton = wrapper.find('.a-skeleton')
      expect(skeleton.exists()).toBe(false)
      
      // 应该显示descriptions组件
      expect(wrapper.find('.basic-info').exists()).toBe(true)
      // 空对象时应该显示默认值 '-'
      expect(wrapper.text()).toContain('-')
    })
  })
  
  describe('响应式显示测试', () => {
    it('在小屏幕上应该正确显示', async () => {
      // 模拟小屏幕
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      })
      
      window.dispatchEvent(new Event('resize'))
      await wrapper.vm.$nextTick()
      
      expect(wrapper.find('.basic-info').exists()).toBe(true)
    })
    
    it('在大屏幕上应该正确显示', async () => {
      // 模拟大屏幕
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      })
      
      window.dispatchEvent(new Event('resize'))
      await wrapper.vm.$nextTick()
      
      expect(wrapper.find('.basic-info').exists()).toBe(true)
    })
  })
  
  describe('数据更新测试', () => {
    it('应该响应用户信息的变化', async () => {
      const newUserData = {
        ...mockUserData,
        basicInfo: {
          ...mockUserData.basicInfo,
          name: '新用户名',
          status: '正常'
        }
      }
      
      await wrapper.setProps({ userInfo: newUserData })
      
      expect(wrapper.text()).toContain('新用户名')
      expect(wrapper.text()).toContain('正常')
    })
    
    it('应该正确处理数据类型转换', async () => {
      const dataWithStringAge = {
        ...mockUserData,
        basicInfo: {
          ...mockUserData.basicInfo,
          age: '30' // 字符串类型的年龄
        }
      }
      
      await wrapper.setProps({ userInfo: dataWithStringAge })
      expect(wrapper.text()).toContain('30')
    })
  })
  
  describe('错误处理测试', () => {
    it('应该处理无效的身份证有效期格式', async () => {
      const invalidDateData = {
        ...mockUserData,
        basicInfo: {
          ...mockUserData.basicInfo,
          idExpiry: 'invalid-date'
        }
      }
      
      await wrapper.setProps({ userInfo: invalidDateData })
      expect(wrapper.exists()).toBe(true)
    })
    
    it('应该处理特殊字符', async () => {
      const specialCharData = {
        ...mockUserData,
        basicInfo: {
          ...mockUserData.basicInfo,
          name: '<script>alert("test")</script>',
          address: '地址包含&特殊字符<>"'
        }
      }
      
      await wrapper.setProps({ userInfo: specialCharData })
      expect(wrapper.exists()).toBe(true)
    })
  })
})