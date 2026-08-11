<!--
  下线批次结果概览 · 文档 K2 R03
  - 总批次条目 / 成功 / 失败 / 单条重试
  - 仅 midloan_behavior 特征显示
-->
<template>
  <a-card title="下线批次结果（K2 R03）" class="detail-card">
    <a-row :gutter="16">
      <a-col :span="6">
        <div class="batch-stat">
          <div class="batch-num">{{ summary.total }}</div>
          <div class="batch-label">总批次条目</div>
        </div>
      </a-col>
      <a-col :span="6">
        <div class="batch-stat success">
          <div class="batch-num">{{ summary.success }}</div>
          <div class="batch-label">成功</div>
        </div>
      </a-col>
      <a-col :span="6">
        <div class="batch-stat failed">
          <div class="batch-num">{{ summary.failed }}</div>
          <div class="batch-label">失败</div>
        </div>
      </a-col>
      <a-col :span="6">
        <div class="batch-stat">
          <div class="batch-num">{{ summary.failed > 0 ? '支持' : '—' }}</div>
          <div class="batch-label">单条重试</div>
        </div>
      </a-col>
    </a-row>
  </a-card>
</template>

<script setup lang="ts">
interface Summary {
  total: number
  success: number
  failed: number
}

interface Props {
  summary: Summary
}

withDefaults(defineProps<Props>(), {
  summary: () => ({ total: 0, success: 0, failed: 0 })
})
</script>

<style scoped>
.batch-stat {
  text-align: center;
  padding: 16px 0;
  border-radius: 6px;
  background: #f7f8fa;
}
.batch-num {
  font-size: 28px;
  font-weight: 600;
  color: var(--color-text-1, #1d2129);
}
.batch-stat.success .batch-num {
  color: #00b42a;
}
.batch-stat.failed .batch-num {
  color: #f53f3f;
}
.batch-label {
  font-size: 13px;
  color: var(--color-text-3, #86909c);
  margin-top: 4px;
}
</style>
