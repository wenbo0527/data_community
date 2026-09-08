import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useProductStore = defineStore('product', () => {
  // 当前选中的具体产品
  const selectedProduct = ref(null)
  
  // 用户数据
  const userData = ref(null)
  
  // 设置用户数据
  const setUserData = (data) => {
    userData.value = data
    // 当用户数据更新时，重置产品选择
    if (data && data.products && data.products.length > 0) {
      // 默认选择第一个产品
      selectedProduct.value = data.products[0]
    }
  }
  
  // 获取用户拥有的所有产品
  const getUserProducts = () => {
    if (!userData.value || !userData.value.products) return []
    return userData.value.products
  }
  
  // 设置具体产品
  const setProduct = (product) => {
    selectedProduct.value = product
  }
  
  // 计算属性：用户拥有的所有产品
  const userProducts = computed(() => {
    return getUserProducts()
  })
  
  // 计算属性：产品数量统计（所有产品都是信贷产品）
  const productCounts = computed(() => {
    const products = getUserProducts()
    return {
      total: products.length,
      creditProducts: products.length // 所有产品都是信贷产品
    }
  })
  
  // 根据当前选中产品过滤数据的辅助函数
  const filterDataByProduct = (dataArray, productKey = 'productKey') => {
    if (!selectedProduct.value || !dataArray) return dataArray
    
    // 如果数据项有产品关联字段，则过滤
    return dataArray.filter(item => {
      if (item[productKey]) {
        return item[productKey] === selectedProduct.value.productKey
      }
      // 如果没有产品关联字段，返回所有数据
      return true
    })
  }
  
  // 获取当前产品相关的授信记录
  const getCurrentCreditRecords = computed(() => {
    if (!userData.value || !userData.value.creditsList) return []
    return filterDataByProduct(userData.value.creditsList, 'productName')
  })
  
  // 获取当前产品相关的用信记录
  const getCurrentLoanRecords = computed(() => {
    if (!userData.value || !userData.value.loanRecords) return []
    return filterDataByProduct(userData.value.loanRecords, 'productKey')
  })
  
  // 获取当前产品相关的调额历史
  const getCurrentAdjustmentHistory = computed(() => {
    if (!userData.value || !userData.value.quotaAdjustHistory) return []
    // 调额历史可能需要根据产品类型或其他条件过滤
    return userData.value.quotaAdjustHistory
  })
  
  // 获取当前产品相关的催收记录
  const getCurrentCollectionRecords = computed(() => {
    if (!userData.value || !userData.value.collectionRecords) return []
    return filterDataByProduct(userData.value.collectionRecords, 'productKey')
  })
  
  // 获取当前产品相关的征信记录
  const getCurrentCreditReports = computed(() => {
    if (!userData.value || !userData.value.creditReports) return []
    // 征信记录通常是全局的，不按产品过滤
    return userData.value.creditReports
  })
  
  // 获取当前产品相关的营销记录
  const getCurrentMarketingRecords = computed(() => {
    if (!userData.value || !userData.value.marketingRecords) return null
    // 营销记录可能需要根据产品类型过滤
    return userData.value.marketingRecords
  })
  
  // 为了兼容现有代码，添加别名
  const loanRecords = computed(() => getCurrentLoanRecords.value)
  const creditRecords = computed(() => getCurrentCreditRecords.value)
  const collectionRecords = computed(() => getCurrentCollectionRecords.value)
  const quotaAdjustHistory = computed(() => getCurrentAdjustmentHistory.value)
  const creditReports = computed(() => getCurrentCreditReports.value)

  return {
    // 状态
    selectedProduct,
    userData,
    
    // 方法
    setUserData,
    setProduct,
    getUserProducts,
    filterDataByProduct,
    
    // 计算属性
    userProducts,
    productCounts,
    getCurrentCreditRecords,
    getCurrentLoanRecords,
    getCurrentAdjustmentHistory,
    getCurrentCollectionRecords,
    getCurrentCreditReports,
    getCurrentMarketingRecords,
    
    // 兼容性别名
    loanRecords,
    creditRecords,
    collectionRecords,
    quotaAdjustHistory,
    creditReports
  }
})