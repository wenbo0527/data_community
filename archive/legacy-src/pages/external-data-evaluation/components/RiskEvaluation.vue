<template>
  <a-card title="风险评估" hoverable>
    <a-list :bordered="false">
      <a-list-item v-for="item in risks" :key="item.key">
        <a-space>
          <a-tag :color="item.levelColor">{{ item.level }}</a-tag>
          <span>{{ item.title }}</span>
          <span style="color: var(--color-text-3)">—— {{ item.desc }}</span>
        </a-space>
      </a-list-item>
    </a-list>
  </a-card>
</template>

<script setup>
const risks = [
  { key: 'privacy', title: '隐私风险', desc: '涉及个人敏感信息', level: '高', levelColor: 'red' },
  { key: 'quality', title: '质量风险', desc: '数据可靠性不足', level: '中', levelColor: 'orange' },
  { key: 'usage', title: '使用风险', desc: '范围超出授权', level: '低', levelColor: 'blue' }
]
</script>