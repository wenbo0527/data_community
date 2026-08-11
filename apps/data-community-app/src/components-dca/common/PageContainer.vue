<template>
  <div class="dca-page" :class="[`dca-page--${size}`, { 'dca-page--with-bg': withBg }]">
    <slot />
  </div>
</template>

<script setup lang="ts">
/**
 * PageContainer —— DCA 页面统一外壳
 *
 * 用法:
 *   <PageContainer>
 *     <PageHeader title="..." sub-title="..." @back="goBack" />
 *     <div class="content-wrapper">...</div>
 *   </PageContainer>
 *
 * Props:
 *   - withBg:  是否套浅灰背景(默认 true)
 *   - size:    'narrow' | 'standard' | 'wide' (默认 standard)
 */
withDefaults(defineProps<{
  withBg?: boolean
  size?: 'narrow' | 'standard' | 'wide'
}>(), {
  withBg: true,
  size: 'standard'
})
</script>

<style scoped>
.dca-page {
  min-height: 100vh;
}
.dca-page--with-bg {
  background: var(--dca-bg-page);
}
.dca-page--narrow   { max-width: var(--dca-page-max-width-narrow);  margin: 0 auto; }
.dca-page--standard { max-width: var(--dca-page-max-width);         margin: 0 auto; }
.dca-page--wide     { max-width: var(--dca-page-max-width-wide);   margin: 0 auto; }
</style>
