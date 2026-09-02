<template>
  <a-card class="dca-asset-card" hoverable @click="onClick">
    <div class="card-content">
      <div class="card-title">
        <div class="title-left">
          <a-tag v-if="resolvedType" size="small" :color="resolvedTypeColor">{{ resolvedType }}</a-tag>
          <h4 class="title-text" :title="title">{{ title }}</h4>
        </div>

        <div class="title-right">
          <slot name="actions">
            <div
              v-if="themeColor || icon"
              class="theme-icon-box"
              :class="themeColorClass"
            >
              <component :is="iconComponent" v-if="iconComponent" />
            </div>
          </slot>
        </div>
      </div>

      <!-- 额外 tags(可多个,用于搜索结果中领域/分类/责任人 等) -->
      <div v-if="tags && tags.length" class="card-tags">
        <a-tag
          v-for="t in tags"
          :key="t.label + (t.value || '')"
          size="small"
          :color="t.color || 'gray'"
        >
          {{ t.label }}<template v-if="t.value">: {{ t.value }}</template>
        </a-tag>
      </div>

      <div v-if="meta || (metaLines && metaLines.length) || count !== undefined" class="card-meta">
        <slot name="meta">
          <span class="table-count">
            <template v-if="count !== undefined">
              {{ count }} {{ countLabel || '资产' }}
            </template>
            <template v-else-if="meta">
              {{ meta }}
            </template>
          </span>
          <ul v-if="metaLines && metaLines.length" class="meta-lines">
            <li v-for="(line, i) in metaLines" :key="i">{{ line }}</li>
          </ul>
        </slot>
      </div>

      <p v-if="description" class="card-description" :title="description">
        {{ description }}
      </p>

      <slot name="footer" />
    </div>
  </a-card>
</template>

<script setup lang="ts">
import { computed, markRaw } from 'vue'
import {
  IconUserGroup, IconBranch, IconCommon, IconNotification,
  IconSafe, IconPublic, IconLock, IconStar,
  IconStorage, IconDesktop, IconTags
} from '@arco-design/web-vue/es/icon'

/**
 * AssetCard —— DCA 统一「分类 / 资产 / 搜索结果」卡片
 *
 * 用于分类网格入口页 / 全局搜索结果 / 任何「数据对象」列表
 *
 * 用法(基础):
 *   <AssetCard
 *     title="核心交易系统"
 *     type="MySQL"
 *     count="320"
 *     description="核心交易相关数据资产集合"
 *     @click="goToDetail"
 *   />
 *
 * 用法(搜索结果,多 tag + 多行 meta):
 *   <AssetCard
 *     title="dwd_trade_order"
 *     type="table"
 *     :tags="[{ label: '业务域', value: '交易域', color: 'arcoblue' }]"
 *     :meta-lines="['责任人: 数据平台组', '更新时间: 2024-04-15']"
 *     description="交易订单明细宽表"
 *   />
 */
export interface MetaTag {
  label: string
  value?: string
  color?: string
}

const props = withDefaults(defineProps<{
  /** 卡片主标题 */
  title: string
  /** 类型 tag 文本 */
  type?: string
  /** 类型 tag 颜色,内置自动映射:table/metric/concept/dashboard/... */
  typeColor?: string
  /** 数量 */
  count?: number | string
  /** 数量单位 */
  countLabel?: string
  /** 一行 meta 文本(优先级低于 metaLines 和 count) */
  meta?: string
  /** 多行 meta(用于搜索结果:责任人/更新时间等) */
  metaLines?: string[]
  /** 描述文本(2 行截断) */
  description?: string
  /** 额外 tag 列表,如 [{ label:'业务域', value:'交易域' }] */
  tags?: MetaTag[]
  /** 主题色 key: blue / green / orange / red / purple / cyan / arcoblue / gray */
  themeColor?: 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'cyan' | 'arcoblue' | 'gray'
  /** arco icon 组件 或 字符串 key */
  icon?: any
}>(), {
  typeColor: '',
  countLabel: '资产',
  metaLines: () => [],
  tags: () => []
})

const emit = defineEmits<{
  (e: 'click', evt: MouseEvent): void
}>()

// type -> 默认颜色 映射(搜索结果按 type 自动适配)
const TYPE_COLOR_MAP: Record<string, string> = {
  table: 'arcoblue',
  metric: 'green',
  metrics: 'green',
  tag: 'orange',
  tags: 'orange',
  concept: 'purple',
  concepts: 'purple',
  dashboard: 'cyan',
  dashboards: 'cyan',
  intent: 'red'
}

const resolvedType = computed(() => props.type || '')
const resolvedTypeColor = computed(() => {
  if (props.typeColor) return props.typeColor
  const k = (props.type || '').toLowerCase()
  return TYPE_COLOR_MAP[k] || 'arcoblue'
})

const iconMap: Record<string, any> = {
  'icon-user-group': IconUserGroup,
  'icon-branch': IconBranch,
  'icon-common': IconCommon,
  'icon-notification': IconNotification,
  'icon-safe': IconSafe,
  'icon-public': IconPublic,
  'icon-lock': IconLock,
  'icon-star': IconStar,
  'icon-storage': IconStorage,
  'icon-desktop': IconDesktop,
  'icon-tags': IconTags
}
// 用 markRaw 避免 Vue 把组件实例变成 reactive(性能 + 警告)
for (const k of Object.keys(iconMap)) iconMap[k] = markRaw(iconMap[k])

const iconComponent = computed(() => {
  if (!props.icon) return null
  if (typeof props.icon !== 'string') return props.icon
  return iconMap[props.icon] || markRaw(IconCommon)
})

const themeColorClass = computed(() => {
  return props.themeColor ? `theme-${props.themeColor}` : ''
})

function onClick(e: MouseEvent) {
  emit('click', e)
}
</script>

<script lang="ts">
export default { name: 'DcaAssetCard' }
</script>

<style scoped>
.dca-asset-card {
  position: relative;
  border-radius: var(--dca-radius-lg);
  border: 1px solid var(--dca-border-default);
  transition: all 0.2s ease;
  cursor: pointer;
  height: 100%;
  min-height: 240px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: var(--dca-shadow-sm);
}

.dca-asset-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--dca-shadow-lg);
  border-color: var(--dca-brand-primary);
}

.dca-asset-card :deep(.arco-card-body) {
  padding: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card-content {
  padding: var(--dca-spacing-lg);
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-title {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--dca-spacing-md);
  gap: 12px;
}

.title-left {
  display: flex;
  align-items: center;
  gap: var(--dca-spacing-sm);
  flex: 1;
  min-width: 0;
}

.title-text {
  font-size: var(--dca-font-xl);
  font-weight: 600;
  color: var(--dca-text-primary);
  margin: 0;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.title-right {
  display: flex;
  gap: var(--dca-spacing-xs);
  flex-shrink: 0;
}

.title-right :deep(.arco-btn) {
  padding: var(--dca-spacing-xs);
  width: 28px;
  height: 28px;
  border-radius: var(--dca-radius-md);
  color: var(--dca-text-tertiary);
  border: 1px solid var(--dca-border-default);
}

.title-right :deep(.arco-btn:hover) {
  color: var(--dca-brand-primary);
  border-color: var(--dca-brand-primary);
  background: var(--dca-bg-emphasis);
}

.theme-icon-box {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--dca-font-base);
  color: #fff;
}

.theme-blue     { background: linear-gradient(135deg, var(--dca-brand-primary) 0%, var(--dca-brand-primary-light) 100%); }
.theme-green    { background: linear-gradient(135deg, var(--dca-success) 0%, #23c343 100%); }
.theme-orange   { background: linear-gradient(135deg, var(--dca-warning) 0%, #ff9a2e 100%); }
.theme-red      { background: linear-gradient(135deg, var(--dca-danger) 0%, #f76560 100%); }
.theme-purple   { background: linear-gradient(135deg, var(--dca-brand-secondary) 0%, #9f5fee 100%); }
.theme-cyan     { background: linear-gradient(135deg, var(--dca-brand-tertiary) 0%, #44e6e2 100%); }
.theme-arcoblue { background: linear-gradient(135deg, var(--dca-brand-primary) 0%, var(--dca-brand-primary-light) 100%); }
.theme-gray     { background: linear-gradient(135deg, var(--dca-text-tertiary) 0%, #a9b3c1 100%); }

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}

.card-tags :deep(.arco-tag) {
  font-size: var(--dca-font-sm);
  padding: 2px 8px;
  border-radius: var(--dca-radius-md);
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.card-meta :deep(.arco-tag) {
  font-size: var(--dca-font-sm);
  padding: var(--dca-spacing-xs) var(--dca-spacing-sm);
  border-radius: var(--dca-radius-md);
}

.meta-lines {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: var(--dca-font-md);
  color: var(--dca-text-tertiary);
  width: 100%;
}

.table-count {
  font-size: var(--dca-font-md);
  font-weight: 500;
  color: var(--dca-text-tertiary);
}

.card-description {
  font-size: var(--dca-font-base);
  color: var(--dca-text-tertiary);
  line-height: 1.57;
  margin: 0 0 var(--dca-spacing-lg) 0;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  min-height: 44px;
}
</style>
