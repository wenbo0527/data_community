<template>
  <div class="param-group">
    <div v-if="title" class="param-group-title">{{ title }}</div>
    <div class="param-group-grid" :style="{ columnCount: columns, columnGap: gap + 'px' }">
      <div v-for="(item, idx) in items" :key="idx" class="param-group-item">
        <div class="param-label">{{ item.label }}</div>
        <div class="param-value">
          <slot :name="`item-${idx}`" :item="item">
            {{ item.value }}
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  /** 分组标题 */
  title: {
    type: String,
    default: ''
  },
  /** 字段列表：[{ label, value }] */
  items: {
    type: Array,
    default: () => []
  },
  /** 列数 */
  columns: {
    type: Number,
    default: 3
  },
  /** 列间距 */
  gap: {
    type: Number,
    default: 32
  }
})
</script>

<style scoped>
.param-group {
  margin-bottom: 4px;
}

.param-group:not(:last-child) {
  margin-bottom: 20px;
}

.param-group-title {
  font-size: 13px;
  font-weight: 600;
  color: #1d2129;
  margin-bottom: 12px;
  padding-left: 8px;
  border-left: 3px solid #165dff;
}

.param-group-grid {
  width: 100%;
  break-inside: avoid;
}

.param-group-item {
  margin-bottom: 14px;
  break-inside: avoid;
  page-break-inside: avoid;
}

.param-label {
  font-size: 12px;
  color: #86909c;
  margin-bottom: 4px;
  line-height: 1.5;
}

.param-value {
  font-size: 14px;
  font-weight: 500;
  color: #1d2129;
  line-height: 1.5;
  word-break: break-all;
}
</style>