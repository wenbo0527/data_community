<template>
  <div class="asset-tags-page">
    <a-page-header
      title="资产标签管理"
      sub-title="给表/字段/指标/服务打标签 — 独立于数据标签,反映资产的能力、合规、成本、生命周期等属性"
      :back="false"
    >
      <template #extra>
        <a-button type="primary" @click="showAddBinding = true">
          <template #icon><icon-plus /></template>
          应用标签
        </a-button>
      </template>
    </a-page-header>

    <!-- 统计 -->
    <a-row :gutter="16" class="stats-row">
      <a-col :span="6">
        <a-statistic title="标签定义" :value="stats.totalDefinitions" />
      </a-col>
      <a-col :span="6">
        <a-statistic title="标签绑定" :value="stats.totalBindings" />
      </a-col>
      <a-col :span="6">
        <a-statistic title="覆盖资源" :value="coveredResources" />
      </a-col>
      <a-col :span="6">
        <a-statistic title="自定义标签" :value="customTagCount" />
      </a-col>
    </a-row>

    <a-row :gutter="16" class="content-row">
      <!-- 左:标签定义 -->
      <a-col :span="14">
        <a-card title="标签定义" :bordered="false">
          <template #extra>
            <a-segmented
              v-model="activeCategory"
              :options="categoryOptions"
              size="small"
            />
          </template>

          <a-list
            :data="filteredDefinitions"
            :grid="{ gutter: 12, xs: 1, sm: 1, md: 2 }"
            size="small"
          >
            <template #item="item">
              <a-list-item>
                <div class="tag-definition-card">
                  <div class="tag-card-header">
                    <a-tag :color="item.item.color" size="medium">
                      {{ item.item.name }}
                    </a-tag>
                    <a-tag v-if="!item.item.isSystem" size="small" color="purple">自定义</a-tag>
                  </div>
                  <div class="tag-card-desc">{{ item.item.description }}</div>
                  <div class="tag-card-footer">
                    <span class="binding-count">{{ bindingCountOf(item.item.id) }} 个绑定</span>
                    <a-button
                      type="text"
                      size="mini"
                      :disabled="item.item.isSystem"
                      @click="onDeleteDefinition(item.item)"
                    >
                      删除
                    </a-button>
                  </div>
                </div>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
      </a-col>

      <!-- 右:标签绑定 -->
      <a-col :span="10">
        <a-card title="最近绑定" :bordered="false">
          <a-list :data="recentBindings" size="small" :pagination-props="false">
            <template #item="item">
              <a-list-item>
                <a-list-item-meta>
                  <template #title>
                    <div class="binding-title">
                      <a-tag :color="getTagColor(item.item.tagId)" size="small">
                        {{ getTagName(item.item.tagId) }}
                      </a-tag>
                      <a-link>{{ item.item.resourceName }}</a-link>
                    </div>
                  </template>
                  <template #description>
                    <div class="binding-meta">
                      <a-tag size="small">{{ resourceTypeName(item.item.resourceType) }}</a-tag>
                      <span class="binding-time">{{ item.item.appliedAt }}</span>
                      <span class="binding-by">{{ item.item.appliedByName }}</span>
                    </div>
                    <div v-if="item.item.note" class="binding-note">{{ item.item.note }}</div>
                  </template>
                </a-list-item-meta>
                <template #actions>
                  <a-button
                    type="text"
                    size="mini"
                    status="danger"
                    @click="onUnbind(item.item.id)"
                  >
                    取消
                  </a-button>
                </template>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
      </a-col>
    </a-row>

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
          <a-select v-model="newBinding.tagId" placeholder="选择标签" :options="definitions" :field-names="{ label: 'name', value: 'id' }" />
        </a-form-item>

        <a-form-item label="备注">
          <a-textarea v-model="newBinding.note" placeholder="选填" :max-length="100" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconPlus } from '@arco-design/web-vue/es/icon'
import { AssetTagStore } from '@/mock/shared/asset-tags'

const definitions = computed(() => AssetTagStore.definitions())
const stats = computed(() => AssetTagStore.stats())
const allBindings = computed(() => AssetTagStore.bindings())

const activeCategory = ref<'all' | 'quality' | 'compliance' | 'cost' | 'usage' | 'lifecycle' | 'custom'>('all')

const categoryOptions = [
  { label: '全部', value: 'all' },
  { label: '质量', value: 'quality' },
  { label: '合规', value: 'compliance' },
  { label: '成本', value: 'cost' },
  { label: '使用', value: 'usage' },
  { label: '生命周期', value: 'lifecycle' },
  { label: '自定义', value: 'custom' }
]

const filteredDefinitions = computed(() => {
  if (activeCategory.value === 'all') return definitions.value
  return definitions.value.filter(d => d.category === activeCategory.value)
})

const recentBindings = computed(() =>
  [...allBindings.value].sort((a, b) =>
    String(b.appliedAt).localeCompare(String(a.appliedAt))
  ).slice(0, 10)
)

const coveredResources = computed(() => {
  const set = new Set<string>()
  allBindings.value.forEach(b => set.add(`${b.resourceType}:${b.resourceId}`))
  return set.size
})

const customTagCount = computed(() => definitions.value.filter(d => !d.isSystem).length)

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
.asset-tags-page {
  padding: 16px;

  .stats-row {
    margin-bottom: 16px;
  }

  .content-row {
    margin-bottom: 16px;
  }

  .tag-definition-card {
    padding: 12px;
    background: #f7f8fa;
    border-radius: 6px;
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