<template>
  <div class="business-concept-page">
    <a-page-header title="业务概念" sub-title="业务域 / 业务实体 / 业务关系 / 数据要素映射">
      <template #extra>
        <a-button @click="goWorkbench">返回工作台</a-button>
      </template>
    </a-page-header>

    <a-row :gutter="16">
      <a-col :span="6">
        <a-card :bordered="false" title="业务域">
          <a-empty v-if="domains.length === 0" />
          <div v-else class="domain-list">
            <div
              v-for="d in domains" :key="d.code"
              class="domain-item"
              :class="{ active: selectedDomain?.code === d.code }"
              @click="selectDomain(d)"
            >
              <strong>{{ d.name }}</strong>
              <a-tag size="small">{{ d.code }}</a-tag>
              <div class="meta">{{ entities.filter(e => e.domainCode === d.code).length }} 个实体</div>
            </div>
          </div>
        </a-card>
      </a-col>

      <a-col :span="10">
        <a-card :bordered="false" :title="selectedDomain ? `${selectedDomain.name} - 业务实体` : '业务实体'">
          <template v-if="selectedDomain">
            <a-empty v-if="filteredEntities.length === 0" />
            <a-table
              v-else
              :columns="entityColumns"
              :data="filteredEntities"
              :pagination="{ pageSize: 8, showTotal: true }"
              row-key="code"
              size="medium"
            >
              <template #name="{ record }">
                <a-link @click="selectEntity(record)">{{ record.name }}</a-link>
              </template>
              <template #code="{ record }">{{ record.code }}</template>
            </a-table>
          </template>
          <a-empty v-else description="从左侧选择一个业务域" />
        </a-card>
      </a-col>

      <a-col :span="8">
        <a-card :bordered="false" :title="selectedEntity ? `${selectedEntity.name} - 数据要素` : '数据要素'">
          <template v-if="selectedEntity">
            <a-descriptions :column="1" bordered size="small">
              <a-descriptions-item label="实体编码">{{ selectedEntity.code }}</a-descriptions-item>
              <a-descriptions-item label="实体名称">{{ selectedEntity.name }}</a-descriptions-item>
              <a-descriptions-item label="业务域">{{ selectedEntity.domainName }}</a-descriptions-item>
              <a-descriptions-item label="Owner">{{ selectedEntity.owner }}</a-descriptions-item>
              <a-descriptions-item label="描述">{{ selectedEntity.description }}</a-descriptions-item>
            </a-descriptions>

            <h3 style="margin-top: 16px">关联数据要素 ({{ relatedElements.length }})</h3>
            <a-table
              :columns="elementColumns"
              :data="relatedElements"
              :pagination="false"
              row-key="code"
              size="small"
            >
              <template #relatedResource="{ record }">
                <a-tag color="arcoblue">{{ record.relatedResource?.table }}.{{ record.relatedResource?.field }}</a-tag>
              </template>
            </a-table>

            <h3 style="margin-top: 16px">关联物理表 ({{ relatedTables.length }})</h3>
            <a-empty v-if="relatedTables.length === 0" description="无关联表" />
            <a-list v-else size="small">
              <a-list-item v-for="t in relatedTables" :key="t.name">
                <a-list-item-meta>
                  <template #title>
                    <a-link>{{ t.name }}</a-link>
                  </template>
                  <template #description>{{ t.description }}</template>
                </a-list-item-meta>
              </a-list-item>
            </a-list>
          </template>
          <a-empty v-else description="从中间选择一个实体" />
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { BusinessConceptStore } from '@/mock/shared/business-concept-store'

const router = useRouter()

const domains = ref<any[]>([])
const entities = ref<any[]>([])
const relations = ref<any[]>([])
const elements = ref<any[]>([])

const selectedDomain = ref<any>(null)
const selectedEntity = ref<any>(null)

onMounted(() => {
  domains.value = BusinessConceptStore.getDomains()
  entities.value = BusinessConceptStore.getEntities()
  relations.value = BusinessConceptStore.getRelations()
  elements.value = BusinessConceptStore.getElements()
})

const filteredEntities = computed(() => {
  if (!selectedDomain.value) return []
  return entities.value.filter(e => e.domainCode === selectedDomain.value.code)
})

const relatedElements = computed(() => {
  if (!selectedEntity.value) return []
  return elements.value.filter(e => e.relatedEntityCode === selectedEntity.value.code)
})

const relatedTables = computed(() => {
  if (!selectedEntity.value) return []
  return BusinessConceptStore.getEntityRelatedTables(selectedEntity.value.code)
})

const entityColumns = [
  { title: '编码', dataIndex: 'code', slotName: 'code', width: 100 },
  { title: '实体名', dataIndex: 'name', slotName: 'name' },
  { title: 'Owner', dataIndex: 'owner', width: 100 }
]

const elementColumns = [
  { title: '编码', dataIndex: 'code', width: 90 },
  { title: '要素名', dataIndex: 'name' },
  { title: '类型', dataIndex: 'type', width: 100 },
  { title: '关联字段', dataIndex: 'relatedResource', slotName: 'relatedResource', width: 200 }
]

function selectDomain(d: any) {
  selectedDomain.value = d
  selectedEntity.value = null
}
function selectEntity(e: any) {
  selectedEntity.value = e
}
const goWorkbench = () => router.push('workbench')
</script>

<style lang="scss" scoped>
.business-concept-page {
  padding: 24px;
  max-width: 1600px;
  margin: 0 auto;

  .domain-list {
    .domain-item {
      padding: 12px;
      border-radius: 4px;
      margin-bottom: 8px;
      cursor: pointer;
      background: #fafbfc;
      border-left: 3px solid transparent;
      transition: all 0.2s;
      &:hover { background: #f2f3f5; }
      &.active { background: #e8f3ff; border-left-color: #165dff; }
      .meta { font-size: 12px; color: #86909c; margin-top: 4px; }
    }
  }
}
</style>