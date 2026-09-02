<template>
  <div class="dca-page-banner">
    <div class="banner-content">
      <div class="title-row">
        <h1 class="banner-title">{{ title }}</h1>
        <p v-if="subtitle" class="banner-subtitle">{{ subtitle }}</p>
      </div>

      <div class="search-area">
        <a-input-search
          v-model="searchValue"
          class="main-search-input"
          :placeholder="searchPlaceholder"
          search-button
          size="large"
          allow-clear
          @search="onSearch"
          @clear="onClear"
        >
          <template #button-icon>
            <icon-search />
          </template>
        </a-input-search>

        <div class="search-filters-inline">
          <slot name="filters" />
          <slot name="actions" />
        </div>
      </div>
    </div>

    <div class="banner-decoration" aria-hidden="true">
      <div class="decoration-cube" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { IconSearch } from '@arco-design/web-vue/es/icon'

/**
 * PageBanner —— DCA 统一 Banner(渐变背景 + 大标题 + 圆角搜索 + 筛选/操作区)
 *
 * 用于「分类网格入口页」(数据资源目录 / 资产目录 / 指标目录 / 特征字典 等)
 *
 * 用法:
 *   <PageBanner
 *     title="资产目录"
 *     subtitle="全域数据资产的统一检索入口"
 *     search-placeholder="输入表名 / 字段名 / 描述搜索"
 *     v-model:search="keyword"
 *     @search="handleSearch"
 *     @clear="handleClear"
 *   >
 *     <template #filters>
 *       <a-select v-model="domain" placeholder="业务域" />
 *       <a-select v-model="type" placeholder="资产类型" />
 *     </template>
 *     <template #actions>
 *       <a-button>缺失工单</a-button>
 *     </template>
 *   </PageBanner>
 */
withDefaults(defineProps<{
  title: string
  subtitle?: string
  searchPlaceholder?: string
}>(), {
  subtitle: '',
  searchPlaceholder: '输入关键字搜索'
})

const search = defineModel<string>('search', { default: '' })

// 兼容 v-model:search 双向绑定
const searchValue = computed({
  get: () => search.value,
  set: (v: string) => { search.value = v }
})

const emit = defineEmits<{
  (e: 'search', value: string): void
  (e: 'clear'): void
}>()

function onSearch(value: string) {
  emit('search', value)
}
function onClear() {
  emit('clear')
}
</script>

<style scoped>
.dca-page-banner {
  background: linear-gradient(180deg, #e6f0ff 0%, var(--dca-bg-page-alt) 100%);
  padding: 40px 0;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 280px;
}

.banner-content {
  width: 100%;
  max-width: var(--dca-page-max-width-wide);
  z-index: 2;
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 0 40% 0 40px;
  box-sizing: border-box;
}

.title-row {
  margin-bottom: 32px;
}

.banner-title {
  font-size: 40px;
  font-weight: bold;
  color: var(--dca-text-primary);
  margin: 0 0 16px 0;
  line-height: 1.2;
}

.banner-subtitle {
  font-size: var(--dca-font-base);
  color: var(--dca-text-tertiary);
  margin: 0;
  max-width: 600px;
  line-height: 1.6;
}

.search-area {
  display: flex;
  gap: var(--dca-spacing-md);
  align-items: center;
  width: 100%;
  max-width: 900px;
  flex-wrap: wrap;
}

.main-search-input {
  flex: 1;
  min-width: 400px;
  background: var(--dca-bg-card);
  border-radius: 30px;
  border: 1px solid var(--dca-brand-primary);
  box-shadow: 0 4px 10px rgba(22, 93, 255, 0.1);
}

.main-search-input :deep(.arco-input-wrapper) {
  border-radius: 30px;
  padding-left: 20px;
  background: var(--dca-bg-card);
}

.main-search-input :deep(.arco-input-search-btn) {
  border-radius: 0 30px 30px 0;
  background: transparent;
  color: var(--dca-brand-primary);
  border-left: 1px solid var(--dca-border-light);
}

.search-filters-inline {
  display: flex;
  gap: 12px;
  align-items: center;
}

.banner-decoration {
  position: absolute;
  right: 0;
  top: 0;
  width: 40%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
}

.decoration-cube {
  position: absolute;
  top: 40px;
  right: 100px;
  width: 200px;
  height: 200px;
  background: linear-gradient(135deg, #e8f3ff 0%, #cce4ff 100%);
  transform: rotate(-15deg) skew(-10deg);
  border-radius: 20px;
  box-shadow: -20px 20px 40px rgba(22, 93, 255, 0.1);
}
</style>
