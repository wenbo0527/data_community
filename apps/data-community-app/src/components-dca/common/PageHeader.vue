<template>
  <a-page-header :title="title" :sub-title="subTitle" class="dca-page-header">
    <template v-if="$slots.extra || showBack" #extra>
      <a-button v-if="showBack" @click="onBack">
        <template #icon><icon-left /></template>
        {{ backText }}
      </a-button>
      <slot name="extra" />
    </template>
  </a-page-header>
</template>

<script setup lang="ts">
/**
 * PageHeader —— DCA 统一页头
 *
 * 用法:
 *   <PageHeader
 *     title="数据地图"
 *     sub-title="所有业务表 / 集合 / 字段的统一目录"
 *     show-back
 *     back-text="返回工作台"
 *     @back="goBack"
 *   />
 *
 *   <PageHeader title="数据标准" sub-title="...">
 *     <template #extra>
 *       <a-button type="primary">新建</a-button>
 *     </template>
 *   </PageHeader>
 */
withDefaults(defineProps<{
  title: string
  subTitle?: string
  /** 是否显示返回按钮 */
  showBack?: boolean
  /** 返回按钮文案 */
  backText?: string
}>(), {
  subTitle: '',
  showBack: false,
  backText: '返回'
})

const emit = defineEmits<{ (e: 'back'): void }>()
function onBack() { emit('back') }
</script>

<style scoped>
.dca-page-header {
  background: transparent;
  padding: 24px 24px 0;
}
</style>
