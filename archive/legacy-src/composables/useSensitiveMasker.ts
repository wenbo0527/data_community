/**
 * 敏感数据脱敏工具
 */
export function maskIdCard(idCard: string): string {
  if (!idCard || idCard.length < 8) return idCard
  return idCard.slice(0, 4) + '**********' + idCard.slice(-4)
}

export function maskMobile(mobile: string): string {
  if (!mobile || mobile.length < 7) return mobile
  return mobile.slice(0, 3) + '****' + mobile.slice(-4)
}

export function maskName(name: string): string {
  if (!name) return ''
  if (name.length === 1) return name
  if (name.length === 2) return name[0] + '*'
  return name[0] + '*'.repeat(name.length - 2) + name[name.length - 1]
}

export function useSensitiveMasker() {
  return { maskIdCard, maskMobile, maskName }
}

export default useSensitiveMasker