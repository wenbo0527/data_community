<template>
  <a-tag :color="color" size="small" class="uq-ds-badge" :title="label">
    {{ mode === 'badge' ? badge : label }}
  </a-tag>
</template>

<script setup lang="ts">
/**
 * 数据源标识(F19)
 *
 * Doris → DR(arcoblue)、Hive → HC(orange),
 * badge 模式用于树节点/Tab 标题右侧的窄展示,full 模式用于列表列。
 */
import { computed } from 'vue'
import { DATASOURCE_BADGE, DATASOURCE_COLOR, DATASOURCE_LABEL } from '@/mock/unified-query/database'
import type { DataSourceKey } from '@/mock/unified-query/types'

const props = withDefaults(defineProps<{ datasource: DataSourceKey; mode?: 'badge' | 'full' }>(), {
  mode: 'badge'
})

const badge = computed(() => DATASOURCE_BADGE[props.datasource])
const label = computed(() => DATASOURCE_LABEL[props.datasource])
const color = computed(() => DATASOURCE_COLOR[props.datasource])
</script>

<style scoped>
.uq-ds-badge {
  font-family: 'SFMono-Regular', Consolas, monospace;
  letter-spacing: 0.5px;
}
</style>
