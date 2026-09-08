// 调试ProductInfo组件的产品表格渲染问题
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import ProductInfo from './src/pages/discovery/customer360/components/ProductInfo.vue'

const pinia = createPinia()

const mockUserInfo = {
  userId: 'test123',
  maxOverdueDays: 15,
  currentOverdueDays: 5,
  overdueAmount: 2000,
  repaymentRate: 85
}

const mockProductData = [
  {
    productKey: 'DEP001',
    name: '新存款产品',
    balance: 50000,
    status: '正常'
  }
]

console.log('=== 调试ProductInfo组件 ===')
console.log('mockUserInfo:', mockUserInfo)
console.log('mockProductData:', mockProductData)

const wrapper = mount(ProductInfo, {
  props: {
    userInfo: mockUserInfo,
    productData: mockProductData
  },
  global: {
    plugins: [pinia]
  }
})

console.log('=== 组件渲染结果 ===')
console.log('wrapper.html():', wrapper.html())
console.log('wrapper.text():', wrapper.text())
console.log('=== 检查产品表格 ===')
console.log('产品表格存在:', wrapper.find('a-table').exists())
console.log('产品信息标题存在:', wrapper.text().includes('产品信息'))
console.log('产品名称存在:', wrapper.text().includes('新存款产品'))