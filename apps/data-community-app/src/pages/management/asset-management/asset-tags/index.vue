<template>
  <PageContainer>
    <PageHeader
      title="资产标签管理"
      sub-title="给表/字段/指标/服务打标签 — 独立于数据标签,反映资产的能力、合规、成本、生命周期等属性"
    >
      <template #extra>
        <a-button type="primary" @click="showAddBinding = true">
          <template #icon><icon-plus /></template>
          应用标签
        </a-button>
      </template>
    </PageHeader>

    <a-card title="标签定义">
      <ul>
        <li v-for="d in definitions" :key="d.id">
          {{ d.name }} ({{ d.category }}) - {{ d.description }}
        </li>
      </ul>
    </a-card>

    <a-card title="最近绑定">
      <ul>
        <li v-for="b in recentBindings" :key="b.assetId">
          {{ b.assetName }} - {{ b.tagName }} ({{ b.boundAt }})
        </li>
      </ul>
    </a-card>

    <!-- 应用标签对话框 -->
    <a-modal
      v-model:visible="showAddBinding"
      title="应用资产标签"
      :width="560"
      @ok="handleApply"
      @cancel="showAddBinding = false"
    >
      <a-form :model="newBinding" layout="vertical">
        <a-form-item label="资源类型" required>
          <a-radio-group v-model="newBinding.resourceType">
            <a-radio value="table">表</a-radio>
            <a-radio value="field">字段</a-radio>
            <a-radio value="metric">指标</a-radio>
            <a-radio value="service">服务</a-radio>
            <a-radio value="api">API</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item label="资源 ID" required>
          <a-input v-model="newBinding.resourceId" placeholder="如 dim_user / fact_loan_apply.id_card_no" />
        </a-form-item>

        <a-form-item label="资源名称" required>
          <a-input v-model="newBinding.resourceName" placeholder="展示用的资源名称" />
        </a-form-item>

        <a-form-item label="选择标签" required>
          <a-select v-model="newBinding.tagId" placeholder="选择标签" :options="definitions" :field-names="selectFieldNames" />
        </a-form-item>

        <a-form-item label="备注">
          <a-textarea v-model="newBinding.note" placeholder="选填" :max-length="100" />
        </a-form-item>
      </a-form>
    </a-modal>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconPlus } from '@arco-design/web-vue/es/icon'
import PageContainer from '@/components-dca/common/PageContainer.vue'
import PageHeader from '@/components-dca/common/PageHeader.vue'
import { AssetTagStore } from '@/mock-shared/asset-tags'

// 避免每次创建新 array 触发下游 reactive 链
const definitions = ref(AssetTagStore.definitions())
const stats = ref(AssetTagStore.stats())
const allBindings = ref(AssetTagStore.bindings())

const activeCategory = ref<'all' | 'quality' | 'compliance' | 'cost' | 'usage' | 'lifecycle' | 'custom'>('all')

// a-table columns 静态定义,避免 inline array literal 每次 render 触发新引用
const definitionColumns = [
  { title: '标签', dataIndex: 'name' },
  { title: '类别', dataIndex: 'category' },
  { title: '说明', dataIndex: 'description' },
  { title: '绑定数', dataIndex: 'bindingCount' },
  { title: '操作', dataIndex: 'actions' }
]
const bindingColumns = [
  { title: '资产', dataIndex: 'assetName' },
  { title: '标签', dataIndex: 'tagName' },
  { title: '绑定时间', dataIndex: 'boundAt' }
]
// a-select field-names 也用静态对象
const selectFieldNames = { label: 'name', value: 'id' }

const categoryOptions = [
  { label: '全部', value: 'all' },
  { label: '质量', value: 'quality' },
  { label: '合规', value: 'compliance' },
  { label: '成本', value: 'cost' },
  { label: '使用', value: 'usage' },
  { label: '生命周期', value: 'lifecycle' },
  { label: '自定义', value: 'custom' }
]

// 用 ref + 手动 watch 替代 computed,避免每次 render 触发新 array
const filteredDefinitions = ref<any[]>(definitions.value as any)
watch([activeCategory, definitions], () => {
  filteredDefinitions.value = activeCategory.value === 'all'
    ? (definitions.value as any)
    : (definitions.value as any).filter((d: any) => d.category === activeCategory.value)
}, { immediate: true })

// 用 ref + watch 替代 computed,避免每次 render 返回新 array
const recentBindings = ref<any[]>([])
const coveredResources = ref(0)
const customTagCount = ref(0)
watch([allBindings, definitions], () => {
  const bindings = allBindings.value as any[]
  recentBindings.value = [...bindings]
    .sort((a, b) => String((b as any).appliedAt).localeCompare(String((a as any).appliedAt)))
    .slice(0, 10)
  const set = new Set<string>()
  bindings.forEach(b => set.add(`${(b as any).resourceType}:${(b as any).resourceId}`))
  coveredResources.value = set.size
  customTagCount.value = (definitions.value as any[]).filter(d => !d.isSystem).length
}, { immediate: true })

const bindingCountOf = (tagId: string) =>
  allBindings.value.filter(b => b.tagId === tagId).length

const getTagColor = (tagId: string) =>
  definitions.value.find(d => d.id === tagId)?.color || 'gray'

const getTagName = (tagId: string) =>
  definitions.value.find(d => d.id === tagId)?.name || tagId

const resourceTypeName = (type: string) => ({
  table: '表',
  field: '字段',
  metric: '指标',
  service: '服务',
  api: 'API'
}[type] || type)

// === 应用新标签 ===
const showAddBinding = ref(false)
const newBinding = reactive({
  resourceType: 'table' as 'table' | 'field' | 'metric' | 'service' | 'api',
  resourceId: '',
  resourceName: '',
  tagId: '',
  note: '',
  appliedBy: 'user-zhangsan',
  appliedByName: '张三'
})

const handleApply = () => {
  if (!newBinding.resourceId.trim() || !newBinding.resourceName.trim() || !newBinding.tagId) {
    Message.warning('请填写完整')
    return
  }
  AssetTagStore.apply(
    newBinding.tagId,
    newBinding.resourceType,
    newBinding.resourceId,
    newBinding.appliedBy,
    newBinding.appliedByName,
    newBinding.note
  )
  Message.success('标签应用成功')
  showAddBinding.value = false
  // 重置
  newBinding.resourceId = ''
  newBinding.resourceName = ''
  newBinding.tagId = ''
  newBinding.note = ''
}

const onUnbind = (bindingId: string) => {
  const ok = AssetTagStore.unapply(bindingId)
  if (ok) Message.success('已取消标签')
}

const onDeleteDefinition = (tag: any) => {
  if (tag.isSystem) {
    Message.warning('系统预置标签不可删除')
    return
  }
  Message.info(`自定义标签 ${tag.name} 删除功能待后端实现`)
}
</script>

<style lang="scss" scoped>
/* 2026-08-06 统一:页面背景/高度/最大宽度由 PageContainer 提供 */
.asset-tags-page {
  padding: 0 16px;

  .stats-row {
    margin-bottom: 16px;
  }

  .content-row {
    margin-bottom: 16px;
  }

  .tag-definition-card {
    padding: 12px;
    background: var(--dca-bg-page-alt);
    border-radius: var(--dca-radius-md);
    height: 100%;

    .tag-card-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }

    .tag-card-desc {
      font-size: 13px;
      color: #4e5969;
      line-height: 1.5;
      margin-bottom: 8px;
      min-height: 40px;
    }

    .tag-card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 8px;
      border-top: 1px solid #e5e6eb;

      .binding-count {
        font-size: 12px;
        color: #86909c;
      }
    }
  }

  .binding-title {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .binding-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 4px;
    font-size: 12px;
    color: #86909c;
  }

  .binding-note {
    margin-top: 4px;
    padding: 4px 8px;
    background: #f7f8fa;
    border-radius: 3px;
    font-size: 12px;
    color: #4e5969;
  }
}
</style>