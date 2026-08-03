<template>
  <a-card class="column-lineage-viewer" :bordered="false">
    <template #title>
      <div class="card-title">
        <icon-share class="title-icon" />
        <span>字段级血缘</span>
        <a-tag v-if="table" size="small" color="arcoblue">{{ table }}.{{ field }}</a-tag>
      </div>
    </template>
    <template #extra>
      <a-segmented
        v-model="viewMode"
        :options="[
          { label: '关系图', value: 'graph' },
          { label: '上游/下游', value: 'list' },
          { label: '影响分析', value: 'impact' }
        ]"
        size="small"
      />
    </template>

    <!-- 输入区 -->
    <div class="input-row">
      <a-select
        v-model="table"
        placeholder="选择表"
        :options="tableOptions"
        :loading="loadingTables"
        allow-search
        style="width: 220px;"
        @change="onTableChange"
      />
      <a-select
        v-model="field"
        placeholder="选择字段"
        :options="fieldOptions"
        :disabled="!table"
        allow-search
        style="width: 220px;"
      />
      <a-button @click="onApplyMask" type="primary" :disabled="!table || !field">
        <template #icon><icon-eye /></template>
        模拟脱敏预览
      </a-button>
    </div>

    <!-- 统计 -->
    <a-row :gutter="16" class="stats-row">
      <a-col :span="6">
        <a-statistic
          title="上游"
          :value="stats.upstream"
          :value-style="{ color: '#722ed1' }"
        >
          <template #suffix>
            <icon-up />
          </template>
        </a-statistic>
      </a-col>
      <a-col :span="6">
        <a-statistic
          title="下游"
          :value="stats.downstream"
          :value-style="{ color: '#165dff' }"
        >
          <template #suffix>
            <icon-down />
          </template>
        </a-statistic>
      </a-col>
      <a-col :span="6">
        <a-statistic
          title="影响范围"
          :value="stats.impact"
          :value-style="{ color: '#fa541c' }"
        >
          <template #suffix>
            <icon-link />
          </template>
        </a-statistic>
      </a-col>
      <a-col :span="6">
        <a-statistic
          title="是否被引用"
          :value="stats.referenced ? '是' : '否'"
          :value-style="{ color: stats.referenced ? '#00b42a' : '#c9cdd4' }"
        />
      </a-col>
    </a-row>

    <!-- 视图切换 -->
    <div class="content">
      <!-- 关系图模式 -->
      <div v-if="viewMode === 'graph'" class="graph-view">
        <div v-if="lineageChain" class="chain-display">
          <pre>{{ lineageChain }}</pre>
        </div>
        <a-empty v-else description="选择表+字段以查看血缘关系" />
      </div>

      <!-- 上下游列表模式 -->
      <div v-if="viewMode === 'list'" class="list-view">
        <a-row :gutter="16">
          <a-col :span="12">
            <h4 class="list-title">⬆ 上游来源</h4>
            <a-empty v-if="upstream.length === 0" description="无上游字段" />
            <a-list v-else :data="upstream" :bordered="false" size="small">
              <template #item="item">
                <a-list-item>
                  <a-list-item-meta>
                    <template #title>
                      <a-link @click="onJumpToEdge(item.item)">
                        {{ item.item.sourceTable }}.{{ item.item.sourceColumn }}
                      </a-link>
                    </template>
                    <template #description>
                      <a-tag size="small" :color="item.item.isDirect ? 'green' : 'orange'">
                        {{ item.item.isDirect ? '直接' : '衍生' }}
                      </a-tag>
                      <span class="transform-text">{{ item.item.transform }}</span>
                    </template>
                  </a-list-item-meta>
                </a-list-item>
              </template>
            </a-list>
          </a-col>

          <a-col :span="12">
            <h4 class="list-title">⬇ 下游去向</h4>
            <a-empty v-if="downstream.length === 0" description="无下游字段" />
            <a-list v-else :data="downstream" :bordered="false" size="small">
              <template #item="item">
                <a-list-item>
                  <a-list-item-meta>
                    <template #title>
                      <a-link @click="onJumpToEdge(item.item)">
                        {{ item.item.targetTable }}.{{ item.item.targetColumn }}
                      </a-link>
                    </template>
                    <template #description>
                      <a-tag size="small" :color="item.item.isDirect ? 'green' : 'orange'">
                        {{ item.item.isDirect ? '直接' : '衍生' }}
                      </a-tag>
                      <span class="transform-text">{{ item.item.transform }}</span>
                    </template>
                  </a-list-item-meta>
                </a-list-item>
              </template>
            </a-list>
          </a-col>
        </a-row>
      </div>

      <!-- 影响分析模式 -->
      <div v-if="viewMode === 'impact'" class="impact-view">
        <a-alert type="warning" :show-icon="false" style="margin-bottom: 16px;">
          <div v-if="impact.length === 0">
            <strong>✅ 该字段无下游影响</strong> — 修改该字段不影响其他字段
          </div>
          <div v-else>
            <strong>⚠️ 该字段被 {{ impact.length }} 个下游字段引用</strong> — 修改该字段需评估下游影响
          </div>
        </a-alert>
        <a-list v-if="impact.length > 0" :data="impact" :bordered="false" size="small">
          <template #item="item">
            <a-list-item>
              <a-list-item-meta>
                <template #title>
                  <a-link>{{ item.item.table }}.{{ item.item.column }}</a-link>
                </template>
                <template #description>
                  <a-tag color="red" size="small">下游影响</a-tag>
                </template>
              </a-list-item-meta>
            </a-list-item>
          </template>
        </a-list>
      </div>
    </div>

    <!-- 脱敏预览 Modal -->
    <a-modal
      v-model:visible="maskModalVisible"
      title="字段脱敏预览"
      :footer="false"
      :width="640"
    >
      <a-alert type="info" :show-icon="false" style="margin-bottom: 16px;">
        基于字段敏感级别自动应用脱敏策略(脱敏引擎:useSensitiveMasker)
      </a-alert>
      <a-table :data="maskSamples" :pagination="false" size="small">
        <template #columns>
          <a-table-column title="类型" data-index="label" :width="120" />
          <a-table-column title="原始" data-index="raw">
            <template #cell="{ record }">
              <code>{{ record.raw }}</code>
            </template>
          </a-table-column>
          <a-table-column title="脱敏后" data-index="masked">
            <template #cell="{ record }">
              <code class="masked-text">{{ record.masked }}</code>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-modal>
  </a-card>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import {
  IconShare,
  IconUp,
  IconDown,
  IconLink,
  IconEye
} from '@arco-design/web-vue/es/icon'
import { useColumnLineage } from '@/composables/useColumnLineage'
import { useSensitiveMasker, MASKING_SAMPLES } from '@/composables/useSensitiveMasker'
import { MetadataStore } from '@/mock/shared/metadata-store'
import { LineageGraphStore } from '@/mock/shared/lineage-graph'

const { upstream: getUpstream, downstream: getDownstream, impact: getImpact, hasLineage, chainOf } = useColumnLineage()
const { maskValue, autoMaskBySensitivity } = useSensitiveMasker()

const table = ref<string>('')
const field = ref<string>('')
const viewMode = ref<'graph' | 'list' | 'impact'>('graph')
const loadingTables = ref(false)
const maskModalVisible = ref(false)
const maskSamples = ref(MASKING_SAMPLES)

const tableOptions = ref<{ label: string; value: string }[]>([])
const fieldOptions = ref<{ label: string; value: string }[]>([])

const upstream = computed(() =>
  table.value && field.value ? getUpstream(table.value, field.value) : []
)

const downstream = computed(() =>
  table.value && field.value ? getDownstream(table.value, field.value) : []
)

const impact = computed(() =>
  table.value && field.value ? getImpact(table.value, field.value) : []
)

const lineageChain = computed(() => {
  if (!table.value || !field.value) return ''
  return LineageGraphStore.chainOf(table.value, field.value)
})

const stats = computed(() => ({
  upstream: upstream.value.length,
  downstream: downstream.value.length,
  impact: impact.value.length,
  referenced: table.value && field.value ? hasLineage(table.value, field.value) : false
}))

const onTableChange = () => {
  field.value = ''
  if (!table.value) {
    fieldOptions.value = []
    return
  }
  const t = MetadataStore.getTables().find((tt: any) => (tt.tableName || tt.name) === table.value)
  if (t?.fields) {
    fieldOptions.value = t.fields.map((f: any) => ({
      label: `${f.name} (${f.type})`,
      value: f.name
    }))
  } else {
    fieldOptions.value = []
  }
}

const onJumpToEdge = (edge: any) => {
  // 简单跳转:切换表+字段
  if (edge.sourceTable) {
    table.value = edge.sourceTable
    field.value = edge.sourceColumn
    onTableChange()
  } else if (edge.targetTable) {
    table.value = edge.targetTable
    field.value = edge.targetColumn
    onTableChange()
  }
}

const onApplyMask = () => {
  // 取当前字段的敏感级别(如有)
  const sampleValue = sampleOfField(field.value)
  maskSamples.value = MASKING_SAMPLES.map(s => ({
    label: s.label,
    raw: sampleValue || s.raw,
    masked: maskValue(sampleValue || s.raw, s.raw.includes('@') ? 'email' : s.label.includes('身份证') ? 'id_card' : 'mobile')
  })).slice(0, 4)
  maskModalVisible.value = true
}

const sampleOfField = (fieldName: string): string => {
  const n = fieldName.toLowerCase()
  if (n.includes('id_card') || n.includes('idcard')) return '110101199001011234'
  if (n.includes('mobile') || n.includes('phone')) return '13800001234'
  if (n.includes('email')) return 'zhangsan@company.com'
  if (n.includes('bank') || n.includes('card')) return '6222600012345678'
  if (n.includes('name')) return '张三'
  return ''
}

onMounted(() => {
  loadingTables.value = true
  // 从 MetadataStore 取所有表
  setTimeout(() => {
    const tables = MetadataStore.getTables()
    tableOptions.value = tables.map((t: any) => ({
      label: (t.tableName || t.name) + (t.description ? ` · ${t.description}` : ''),
      value: t.tableName || t.name
    }))
    loadingTables.value = false
  }, 100)
})

watch([table, field], () => {
  // 自动触发链路摘要更新(通过 computed)
})
</script>

<style lang="scss" scoped>
.column-lineage-viewer {
  .card-title {
    display: flex;
    align-items: center;
    gap: 8px;

    .title-icon {
      color: #722ed1;
      font-size: 18px;
    }
  }

  .input-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #f2f3f5;
  }

  .stats-row {
    margin-bottom: 16px;
  }

  .list-title {
    font-size: 14px;
    font-weight: 600;
    color: #1d2129;
    margin: 0 0 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid #f2f3f5;
  }

  .transform-text {
    margin-left: 8px;
    font-family: monospace;
    font-size: 12px;
    color: #4e5969;
    background: #f7f8fa;
    padding: 2px 6px;
    border-radius: 3px;
  }

  .chain-display {
    background: #f7f8fa;
    border-radius: 6px;
    padding: 16px;
    overflow-x: auto;

    pre {
      margin: 0;
      font-family: monospace;
      font-size: 13px;
      color: #1d2129;
      line-height: 1.8;
      white-space: pre-wrap;
    }
  }

  .masked-text {
    color: #fa541c;
    background: #fff7e8;
    padding: 2px 4px;
    border-radius: 3px;
  }
}
</style>