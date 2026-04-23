/**
 * 产品 Store (Pinia)
 * 用于管理客户360中的产品和用户数据
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface Product {
  productKey: string
  productName: string
  [key: string]: any
}

interface UserData {
  userId: string
  basicInfo?: any
  products?: Product[]
  creditsList?: any[]
  loanRecords?: any[]
  quotaAdjustHistory?: any[]
  collectionRecords?: any[]
  creditReports?: any[]
  marketingRecords?: any[]
  [key: string]: any
}

export const useProductStore = defineStore('product', () => {
  // 当前选中的具体产品
  const selectedProduct = ref<Product | null>(null)
  
  // 用户数据
  const userData = ref<UserData | null>(null)
  
  // 设置用户数据
  const setUserData = (data: UserData) => {
    userData.value = data
    // 当用户数据更新时，重置产品选择
    if (data && data.products && data.products.length > 0) {
      // 默认选择第一个产品
      selectedProduct.value = data.products[0]
    }
  }
  
  // 获取用户拥有的所有产品
  const getUserProducts = (): Product[] => {
    if (!userData.value || !userData.value.products) return []
    return userData.value.products
  }
  
  // 设置具体产品
  const setProduct = (product: Product) => {
    selectedProduct.value = product
  }
  
  // 计算属性：用户拥有的所有产品
  const userProducts = computed(() => {
    return getUserProducts()
  })
  
  // 计算属性：产品数量统计
  const productCounts = computed(() => {
    const products = getUserProducts()
    return {
      total: products.length,
      creditProducts: products.length
    }
  })
  
  // 根据当前选中产品过滤数据
  const filterDataByProduct = <T extends Record<string, any>>(dataArray: T[], productKey = 'productKey'): T[] => {
    if (!selectedProduct.value || !dataArray) return dataArray
    
    return dataArray.filter(item => {
      if (item[productKey]) {
        return item[productKey] === selectedProduct.value![productKey as keyof Product]
      }
      return true
    })
  }
  
  // 获取当前产品相关的授信记录
  const creditRecords = computed(() => {
    if (!userData.value || !userData.value.creditsList) return []
    return filterDataByProduct(userData.value.creditsList, 'productName')
  })
  
  // 获取当前产品相关的用信记录
  const loanRecords = computed(() => {
    if (!userData.value || !userData.value.loanRecords) return []
    return filterDataByProduct(userData.value.loanRecords, 'productKey')
  })
  
  // 获取当前产品相关的调额历史
  const quotaAdjustHistory = computed(() => {
    if (!userData.value || !userData.value.quotaAdjustHistory) return []
    return userData.value.quotaAdjustHistory
  })
  
  // 获取当前产品相关的催收记录
  const collectionRecords = computed(() => {
    if (!userData.value || !userData.value.collectionRecords) return []
    return filterDataByProduct(userData.value.collectionRecords, 'productKey')
  })
  
  // 获取当前产品相关的征信记录
  const creditReports = computed(() => {
    if (!userData.value || !userData.value.creditReports) return []
    return userData.value.creditReports
  })
  
  return {
    selectedProduct,
    userData,
    setUserData,
    setProduct,
    userProducts,
    productCounts,
    creditRecords,
    loanRecords,
    quotaAdjustHistory,
    collectionRecords,
    creditReports
  }
})
