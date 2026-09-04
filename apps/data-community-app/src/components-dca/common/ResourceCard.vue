<template>
  <a-card class="dca-resource-card" hoverable :bordered="false">
    <template #title>
      <a-space>
        <a-tag v-if="tagText" :color="tagColor">{{ tagText }}</a-tag>
        <span class="card-title-text" :title="title">{{ title }}</span>
      </a-space>
    </template>

    <slot />

    <template v-if="$slots.actions" #actions>
      <slot name="actions" />
    </template>
  </a-card>
</template>

<script setup lang="ts">
/**
 * ResourceCard —— DCA 统一「资源列表」卡片
 *
 * 封装 a-card + tag标题 + 默认插槽(描述) + actions插槽(操作按钮)
 *
 * 用于 data-resources 子页面和字典页面:
 *   <ResourceCard :tag-text="f.format" tag-color="arcoblue" :title="f.name">
 *     <a-descriptions :column="1" size="small">
 *       <a-descriptions-item label="大小">{{ f.size }}</a-descriptions-item>
 *     </a-descriptions>
 *     <template #actions>
 *       <a-button type="text" size="small" @click="viewDetail(f)">详情</a-button>
 *     </template>
 *   </ResourceCard>
 */
withDefaults(defineProps<{
  tagText?: string
  tagColor?: string
  title: string
}>(), {
  tagText: '',
  tagColor: 'arcoblue'
})
</script>

<script lang="ts">
export default { name: 'DcaResourceCard' }
</script>

<style scoped>
.dca-resource-card {
  height: 100%;
}

.dca-resource-card :deep(.arco-card-body) {
  height: 100%;
}

.card-title-text {
  font-size: var(--dca-font-xl);
  font-weight: 600;
  color: var(--dca-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dca-resource-card :deep(.arco-descriptions) {
  margin-bottom: 0;
}
</style>
