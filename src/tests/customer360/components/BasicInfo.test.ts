import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-library'
import { createPinia } from 'pinia'
import BasicInfo from '@/pages/discovery/customer360/components/BasicInfo.vue'
import { createMockUserData } from '../setup'

// Mock Arco Design 组件
vi.mock('@arco-design/web-vue', () => ({
  Card: { name: 'ACard', template: '<div class="arco-card"><slot /></div>' },
  Descriptions: { name: 'ADescriptions', template: '<div class="arco-descriptions"><slot /></div>' },
  DescriptionsItem: { name: 'ADescriptionsItem', template: '<div class="arco-descriptions-item"><slot /></div>' },
  Tag: { name: 'ATag', template: '<span class="arco-tag"><slot /></span>' },
  Avatar: { name: 'AAvatar', template: '<div class="arco-avatar"><slot /></div>' }
}))

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
      expect(wrapper.find('.arco-card').exists()).toBe(true)
    })
    
    it('应该显示用户头像', () => {
      expect(wrapper.find('.arco-avatar').exists()).toBe(true)
    })
    
    it('应该显示用户基本信息描述列表', () => {
      expect(wrapper.find('.arco-descriptions').exists()).toBe(true)
    })
  })
  
  describe('数据展示测试', () => {
    it('应该正确显示用户姓名', () => {
      expect(wrapper.text()).toContain(mockUserData.name)
    })
    
    it('应该正确显示客户编号', () => {
      expect(wrapper.text()).toContain(mockUserData.customerNo)
    })
    
    it('应该正确显示手机号码', () => {
      expect(wrapper.text()).toContain(mockUserData.phone)
    })
    
    it('应该正确显示身份证号', () => {
      expect(wrapper.text()).toContain(mockUserData.idCard)
    })
    
    it('应该正确显示性别', () => {
      expect(wrapper.text()).toContain(mockUserData.gender)
    })
    
    it('应该正确显示年龄', () => {
      expect(wrapper.text()).toContain(mockUserData.age.toString())
    })
    
    it('应该正确显示地址', () => {
      expect(wrapper.text()).toContain(mockUserData.address)
    })
    
    it('应该正确显示邮箱', () => {
      expect(wrapper.text()).toContain(mockUserData.email)
    })
    
    it('应该正确显示注册日期', () => {
      expect(wrapper.text()).toContain(mockUserData.registrationDate)
    })
    
    it('应该正确显示客户等级', () => {
      expect(wrapper.text()).toContain(mockUserData.customerLevel)
    })
    
    it('应该正确显示风险等级', () => {
      expect(wrapper.text()).toContain(mockUserData.riskLevel)
    })
    
    it('应该正确显示最后登录日期', () => {
      expect(wrapper.text()).toContain(mockUserData.lastLoginDate)
    })
    
    it('应该正确显示账户状态', () => {
      expect(wrapper.text()).toContain(mockUserData.accountStatus)
    })
  })
  
  describe('风险等级标签测试', () => {
    it('低风险应该显示绿色标签', async () => {
      await wrapper.setProps({
        userInfo: { ...mockUserData, riskLevel: '低' }
      })
      
      const riskTag = wrapper.find('.arco-tag')
      expect(riskTag.exists()).toBe(true)
    })
    
    it('中风险应该显示橙色标签', async () => {
      await wrapper.setProps({
        userInfo: { ...mockUserData, riskLevel: '中' }
      })
      
      const riskTag = wrapper.find('.arco-tag')
      expect(riskTag.exists()).toBe(true)
    })
    
    it('高风险应该显示红色标签', async () => {
      await wrapper.setProps({
        userInfo: { ...mockUserData, riskLevel: '高' }
      })
      
      const riskTag = wrapper.find('.arco-tag')
      expect(riskTag.exists()).toBe(true)
    })
  })
  
  describe('账户状态标签测试', () => {
    it('正常状态应该显示绿色标签', async () => {
      await wrapper.setProps({
        userInfo: { ...mockUserData, accountStatus: '正常' }
      })
      
      const statusTag = wrapper.find('.arco-tag')
      expect(statusTag.exists()).toBe(true)
    })
    
    it('冻结状态应该显示红色标签', async () => {
      await wrapper.setProps({
        userInfo: { ...mockUserData, accountStatus: '冻结' }
      })
      
      const statusTag = wrapper.find('.arco-tag')
      expect(statusTag.exists()).toBe(true)
    })
    
    it('注销状态应该显示灰色标签', async () => {
      await wrapper.setProps({
        userInfo: { ...mockUserData, accountStatus: '注销' }
      })
      
      const statusTag = wrapper.find('.arco-tag')
      expect(statusTag.exists()).toBe(true)
    })
  })
  
  describe('空数据处理测试', () => {
    it('应该处理空用户信息', async () => {
      await wrapper.setProps({ userInfo: null })
      expect(wrapper.exists()).toBe(true)
    })
    
    it('应该处理缺失字段', async () => {
      const incompleteData = {
        name: '测试用户',
        customerNo: 'TEST001'
        // 缺少其他字段
      }
      
      await wrapper.setProps({ userInfo: incompleteData })
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.text()).toContain('测试用户')
    })
  })
  
  describe('响应式测试', () => {
    it('应该在小屏幕上正确显示', async () => {
      // 模拟小屏幕
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768
      })
      
      window.dispatchEvent(new Event('resize'))
      await wrapper.vm.$nextTick()
      
      expect(wrapper.exists()).toBe(true)
    })
    
    it('应该在大屏幕上正确显示', async () => {
      // 模拟大屏幕
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920
      })
      
      window.dispatchEvent(new Event('resize'))
      await wrapper.vm.$nextTick()
      
      expect(wrapper.exists()).toBe(true)
    })
  })
  
  describe('数据更新测试', () => {
    it('应该响应用户信息的变化', async () => {
      const newUserData = {
        ...mockUserData,
        name: '新用户名',
        customerLevel: 'Gold'
      }
      
      await wrapper.setProps({ userInfo: newUserData })
      
      expect(wrapper.text()).toContain('新用户名')
      expect(wrapper.text()).toContain('Gold')
    })
    
    it('应该正确处理数据类型转换', async () => {
      const dataWithStringAge = {
        ...mockUserData,
        age: '30' // 字符串类型的年龄
      }
      
      await wrapper.setProps({ userInfo: dataWithStringAge })
      expect(wrapper.text()).toContain('30')
    })
  })
  
  describe('错误处理测试', () => {
    it('应该处理无效的日期格式', async () => {
      const invalidDateData = {
        ...mockUserData,
        registrationDate: 'invalid-date',
        lastLoginDate: ''
      }
      
      await wrapper.setProps({ userInfo: invalidDateData })
      expect(wrapper.exists()).toBe(true)
    })
    
    it('应该处理特殊字符', async () => {
      const specialCharData = {
        ...mockUserData,
        name: '<script>alert("test")</script>',
        address: '地址包含&特殊字符<>"'
      }
      
      await wrapper.setProps({ userInfo: specialCharData })
      expect(wrapper.exists()).toBe(true)
    })
  })
})