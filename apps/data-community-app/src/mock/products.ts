// 产品维表 Mock
// 用于客户360"产品授信时间查询"功能
// 注意：products.ts 必须保持为独立模块，不能被 tree-shaking 内联

export interface Product {
  productCode: string
  productName: string
  productFullName?: string
}

export const PRODUCT_LIST: Product[] = [
  { productCode: 'P001', productName: 'Su贷', productFullName: 'Su贷(P001)' },
  { productCode: 'P002', productName: '蚂蚁借呗', productFullName: '蚂蚁借呗(P002)' },
  { productCode: 'P003', productName: '京东白条', productFullName: '京东白条(P003)' },
  { productCode: 'P004', productName: '个人信用贷款', productFullName: '个人信用贷款(P004)' },
  { productCode: 'P005', productName: '消费分期', productFullName: '消费分期(P005)' },
  { productCode: 'P006', productName: '房屋抵押贷款', productFullName: '房屋抵押贷款(P006)' },
  { productCode: 'P007', productName: '汽车贷款', productFullName: '汽车贷款(P007)' },
]

/**
 * 按产品代码查找产品
 * @deprecated 请直接使用 PRODUCT_LIST.find()
 */
export function findProductByCode(code: string): Product | undefined {
  return PRODUCT_LIST.find(p => p.productCode === code)
}

/**
 * 按关键词搜索产品列表
 * @deprecated 请直接使用 PRODUCT_LIST.filter()
 */
export function searchProducts(keyword: string): Product[] {
  if (!keyword) return PRODUCT_LIST
  const lower = keyword.toLowerCase()
  return PRODUCT_LIST.filter(p =>
    p.productName.toLowerCase().includes(lower) ||
    p.productCode.toLowerCase().includes(lower)
  )
}

// ─────────────────────────────────────────────────────────────
// 【钟离修复】防止 tree-shaking 将本模块内联的副作用标记
// Vite 会保留带有函数调用的模块，确保 @/mock/products import 正常解析
// ─────────────────────────────────────────────────────────────
let __productsModuleMarker = false
export function __markProductsModuleLoaded() {
  __productsModuleMarker = true
}
// 在模块加载时自动标记（副作用）
if (typeof window !== 'undefined') {
  __markProductsModuleLoaded()
}