import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useProductStore = defineStore('product', () => {
  // 当前选中的产品类型
  const selectedProductType = ref('self')
  
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
      const firstProduct = data.products[0]
      selectedProduct.value = firstProduct
      selectedProductType.value = getProductTypeFromProduct(firstProduct)
    }
  }
  
  // 根据产品判断产品类型
  const getProductTypeFromProduct = (product) => {
    if (!product) return 'self'
    // 根据产品类型判断是自营还是助贷
    const selfProductTypes = ['活期存款', '定期存款', '理财产品']
    const loanProductTypes = ['消费贷款', '住房贷款', '信用贷款', '个人消费贷款']
    
    if (selfProductTypes.includes(product.productType) || selfProductTypes.includes(product.productName)) {
      return 'self'
    } else if (loanProductTypes.includes(product.productType) || loanProductTypes.includes(product.productName)) {
      return 'loan'
    }
    return 'self'
  }
  
  // 设置产品类型
  const setProductType = (type) => {
    selectedProductType.value = type
    // 当产品类型改变时，选择该类型下的第一个产品
    const productsOfType = getProductsByType(type)
    if (productsOfType.length > 0) {
      selectedProduct.value = productsOfType[0]
    } else {
      selectedProduct.value = null
    }
  }
  
  // 设置具体产品
  const setProduct = (product) => {
    selectedProduct.value = product
    if (product) {
      selectedProductType.value = getProductTypeFromProduct(product)
    }
  }
  
  // 获取指定类型的产品列表
  const getProductsByType = (type) => {
    if (!userData.value || !userData.value.products) return []
    
    return userData.value.products.filter(product => {
      const productType = getProductTypeFromProduct(product)
      return productType === type
    })
  }
  
  // 计算属性：当前产品类型的产品列表
  const currentTypeProducts = computed(() => {
    return getProductsByType(selectedProductType.value)
  })
  
  // 计算属性：自营产品列表
  const selfProducts = computed(() => {
    return getProductsByType('self')
  })
  
  // 计算属性：助贷产品列表
  const loanProducts = computed(() => {
    return getProductsByType('loan')
  })
  
  // 计算属性：产品数量统计
  const productCounts = computed(() => {
    return {
      self: selfProducts.value.length,
      loan: loanProducts.value.length
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
    return filterDataByProduct(userData.value.loanRecords, 'productName')
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
  
  return {
    // 状态
    selectedProductType,
    selectedProduct,
    userData,
    
    // 方法
    setUserData,
    setProductType,
    setProduct,
    getProductsByType,
    filterDataByProduct,
    
    // 计算属性
    currentTypeProducts,
    selfProducts,
    loanProducts,
    productCounts,
    getCurrentCreditRecords,
    getCurrentLoanRecords,
    getCurrentAdjustmentHistory,
    getCurrentCollectionRecords,
    getCurrentCreditReports,
    getCurrentMarketingRecords
  }
})