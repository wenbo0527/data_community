<template>
  <div class="dmt-stat-group">
    <div v-for="(item, idx) in items" :key="idx" class="stat-item">
      <a-card :bordered="false" class="stat-card" hoverable>
        <a-statistic :title="item.title" :value="item.value" :precision="item.precision">
          <template #prefix>
            <a-tag v-if="item.tag" :color="item.tagColor" size="small">{{ item.tag }}</a-tag>
            <span v-else-if="item.iconText || item.icon" class="stat-icon" :style="{ background: item.iconBg || '#f0f7ff', color: item.iconColor || '#165dff' }">
              {{ item.iconText || item.icon }}
            </span>
          </template>
        </a-statistic>
        <div v-if="hasExtra(item)" class="stat-extra">
          <span class="stat-extra-label">{{ item.extraLabel || '对比' }}</span>
          <span class="stat-extra-value" :style="{ color: item.extraColor || '#4e5969' }">
            {{ item.extraPrefix || '' }}{{ formatExtra(item) }}{{ item.extraSuffix || '' }}
          </span>
        </div>
        <div v-if="item.subtitle" class="stat-subtitle">{{ item.subtitle }}</div>
        <a-link v-if="item.link" :href="item.link" class="stat-link">{{ item.linkText || '查看' }}</a-link>
      </a-card>
    </div>
  </div>
</template>

<script setup>
defineProps({
  items: {
    type: Array,
    required: true
    // 形态：[{ title, value, iconText, iconBg, iconColor, tag, tagColor, subtitle, link, linkText, precision,
    //          extraLabel, extraValue, extraPrefix, extraSuffix, extraPrecision, extraColor }]
  }
})

function hasExtra(item) {
  return item && (item.extraValue !== undefined && item.extraValue !== null && item.extraValue !== '')
}

function formatExtra(item) {
  const value = item.extraValue
  if (typeof value !== 'number') return value
  const precision = typeof item.extraPrecision === 'number' ? item.extraPrecision : 0
  if (precision <= 0) return String(value)
  return value.toFixed(precision)
}
</script>

<style scoped>
.dmt-stat-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
}
.stat-item {
  /* 默认：移动端 1 列 */
  flex: 1 1 100%;
  min-width: 0;
}
.stat-card {
  height: 100%;
  min-height: 100px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  border: 1px solid var(--color-border-2);
  transition: all 0.2s;
}
.stat-card:hover {
  box-shadow: 0 4px 12px rgba(15, 35, 95, 0.08);
  transform: translateY(-1px);
}
.stat-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  font-size: 14px;
  margin-right: 6px;
}
.stat-subtitle {
  color: var(--color-text-3);
  font-size: 12px;
  margin-top: 6px;
}
.stat-extra {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-top: 8px;
  padding: 6px 10px;
  border-radius: 8px;
  background: #f7f8fa;
}
.stat-extra-label {
  font-size: 12px;
  color: var(--color-text-3);
}
.stat-extra-value {
  font-size: 16px;
  font-weight: 600;
  line-height: 1.2;
}
.stat-link {
  display: inline-block;
  margin-top: 6px;
  font-size: 12px;
}

/* sm 及以上：每行 2 列 */
@media (min-width: 576px) {
  .stat-item {
    flex: 1 1 calc(50% - 6px);
  }
}
/* md 及以上：单行均分（任意数量都排成一行） */
@media (min-width: 992px) {
  .stat-item {
    flex: 1 1 0;
    min-width: 180px;
  }
}
</style>