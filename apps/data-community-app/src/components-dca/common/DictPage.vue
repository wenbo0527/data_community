<template>
  <PageContainer>
    <PageHeader :title="title" :sub-title="subTitle" show-back back-text="返回工作台" @back="onBack">
      <template v-if="$slots.extra" #extra>
        <slot name="extra" />
      </template>
    </PageHeader>

    <div class="content-wrapper">
      <!-- 顶部统计(可选) -->
      <a-row v-if="$slots.stats" :gutter="16" style="margin-bottom: 16px">
        <slot name="stats" />
      </a-row>

      <!-- Tabs 区域(可选) -->
      <a-tabs v-if="tabs && tabs.length" :default-active-key="tabs[0].key" class="dict-tabs">
        <a-tab-pane v-for="t in tabs" :key="t.key" :title="t.title">
          <slot :name="`tab-${t.key}`" />
        </a-tab-pane>
      </a-tabs>

      <!-- 默认内容 -->
      <slot v-else />
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
/**
 * DictPage —— 字典/地图类页面通用模板
 *
 * 用法 1(简单):
 *   <DictPage title="指标字典" sub-title="..." @back="goBack">
 *     <div>正文内容</div>
 *   </DictPage>
 *
 * 用法 2(Tabs):
 *   <DictPage
 *     title="指标字典" sub-title="..."
 *     :tabs="[{ key: 'dict', title: '字典视图' }, { key: 'map', title: '地图视图' }]"
 *     @back="goBack"
 *   >
 *     <template #tab-dict>字典内容</template>
 *     <template #tab-map>地图内容</template>
 *   </DictPage>
 *
 * 用法 3(顶部统计 + Tabs + 工具按钮):
 *   <DictPage title="..." sub-title="..." :tabs="..." @back="goBack">
 *     <template #extra>
 *       <a-button>新增</a-button>
 *     </template>
 *     <template #stats>
 *       <a-col :span="6"><a-statistic title="..." :value="100" /></a-col>
 *     </template>
 *     <template #tab-list>列表</template>
 *   </DictPage>
 */
import { useRouter } from 'vue-router'
import PageContainer from './PageContainer.vue'
import PageHeader from './PageHeader.vue'

const props = defineProps<{
  title: string
  subTitle?: string
  /** Tabs 配置 */
  tabs?: { key: string; title: string }[]
}>()

const emit = defineEmits<{ (e: 'back'): void }>()
const router = useRouter()

function onBack() {
  emit('back')
  // 默认回工作台
  router.push('workbench')
}
</script>

<style scoped>
.content-wrapper {
  padding: 0 24px 24px;
}
.dict-tabs {
  background: var(--dca-bg-card);
  border-radius: var(--dca-radius-lg);
  padding: 8px 16px;
  margin-bottom: 16px;
}
</style>
