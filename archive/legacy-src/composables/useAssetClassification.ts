/**
 * 资产分级分类工具
 */
export function useAssetClassification() {
  return {
    classify(resourceType: string, sensitivity: string): string {
      if (resourceType === 'id_card' || resourceType === 'mobile') return 'PII-L3'
      if (sensitivity === 'L3') return '敏感数据'
      if (sensitivity === 'L2') return '商业敏感'
      return '一般数据'
    }
  }
}

export default useAssetClassification