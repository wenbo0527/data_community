<template>
  <div class="tags-section">
    <h4>催收标签</h4>
    <div class="tags-grid">
      <a-tag 
        v-for="tag in collectionTags.slice(0, 12)" 
        :key="tag?.name"
        :color="getTagColor(tag?.type)"
        class="collection-tag"
      >
        {{ tag?.name }} ({{ tag?.count ?? 0 }})
      </a-tag>
      <a-tag v-if="collectionTags.length === 0" color="gray">暂无标签</a-tag>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface CollectionRecord {
  collectionMethod?: string
  contactResult?: string
  effectiveScore?: string | number
  overdueAmount?: string | number
}

interface TagItem {
  name: string
  count: number
  type: 'method' | 'result' | 'score' | 'amount'
}

interface Props {
  records: CollectionRecord[]
}

const props = defineProps<Props>()

// 标签颜色映射
const tagColorMap = {
  method: 'blue',
  result: 'green',
  score: 'orange',
  amount: 'purple'
}

// 获取标签颜色
const getTagColor = (type: string) => {
  return tagColorMap[type as keyof typeof tagColorMap] || 'gray'
}

// 标签统计
const collectionTags = computed<TagItem[]>(() => {
  const records = props.records || []
  const methodTags: Record<string, number> = {}
  const resultTags: Record<string, number> = {}
  const scoreTags: Record<string, number> = { '高分(8-10)': 0, '中分(5-7)': 0, '低分(0-4)': 0 }
  const amountTags: Record<string, number> = { '大额(>10万)': 0, '中额(1-10万)': 0, '小额(<1万)': 0 }
  
  records.forEach(record => {
    // 按催收方式统计
    const method = record.collectionMethod
    if (method) {
      methodTags[method] = (methodTags[method] || 0) + 1
    }
    
    // 按联系结果统计
    const result = record.contactResult
    if (result) {
      resultTags[result] = (resultTags[result] || 0) + 1
    }
    
    // 按评分统计
    const score = parseFloat(String(record.effectiveScore))
    if (!isNaN(score)) {
      if (score >= 8) { scoreTags['高分(8-10)']++ }
      else if (score >= 5) { scoreTags['中分(5-7)']++ }
      else { scoreTags['低分(0-4)']++ }
    }
    
    // 按金额统计
    const amount = parseFloat(String(record.overdueAmount))
    if (!isNaN(amount)) {
      if (amount > 100000) { amountTags['大额(>10万)']++ }
      else if (amount > 10000) { amountTags['中额(1-10万)']++ }
      else { amountTags['小额(<1万)']++ }
    }
  })
  
  const allTags: TagItem[] = [
    ...Object.entries(methodTags).map(([name, count]) => ({ name: `方式:${name}`, count, type: 'method' as const })),
    ...Object.entries(resultTags).map(([name, count]) => ({ name: `结果:${name}`, count, type: 'result' as const })),
    ...Object.entries(scoreTags).map(([name, count]) => ({ name: `评分:${name}`, count, type: 'score' as const })),
    ...Object.entries(amountTags).map(([name, count]) => ({ name: `金额:${name}`, count, type: 'amount' as const }))
  ]
  
  return allTags.filter(tag => Number(tag.count) > 0).sort((a, b) => Number(b.count) - Number(a.count))
})
</script>

<style scoped>
.tags-section {
  margin-bottom: 16px;
  padding: 12px 16px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.tags-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.tags-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.collection-tag {
  cursor: default;
  margin: 0;
}
</style>
