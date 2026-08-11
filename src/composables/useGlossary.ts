/**
 * 术语表工具
 */
export function useGlossary() {
  const GLOSSARY = {
    'DAU': '日活跃用户数(Daily Active Users)',
    'MAU': '月活跃用户数(Monthly Active Users)',
    'GMV': '商品交易总额(Gross Merchandise Volume)',
    'PII': '个人识别信息(Personally Identifiable Information)',
    'L1': '低敏感(一般数据)',
    'L2': '中敏感(商业敏感)',
    'L3': '高敏感(个人隐私/监管)'
  }
  return {
    get(term: string): string | undefined {
      return GLOSSARY[term as keyof typeof GLOSSARY]
    },
    all() { return GLOSSARY }
  }
}

export default useGlossary