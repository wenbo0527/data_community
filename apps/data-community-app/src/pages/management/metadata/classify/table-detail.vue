<template>
  <div class="classify-table-detail-page">
    <!-- 面包屑 -->
    <a-breadcrumb class="breadcrumb">
      <a-breadcrumb-item><a @click="goHome">数据分级</a></a-breadcrumb-item>
      <a-breadcrumb-item><a @click="goToTables">{{ currentSystem?.name }}</a></a-breadcrumb-item>
      <a-breadcrumb-item>{{ tableData?.table_name }}</a-breadcrumb-item>
    </a-breadcrumb>

    <PageHeader :title="tableData?.table_name || '表详情'" :sub-title="tableData?.table_comment || ''">
      <template #extra>
        <a-space>
          <a-button @click="goToTables">返回表列表</a-button>
        </a-space>
      </template>
    </PageHeader>

    <!-- 区域 1：表元信息卡片（表粒度） -->
    <a-card title="表元信息" class="meta-card">
      <a-descriptions :column="2" :data="tableMetaList" />
    </a-card>

    <!-- 区域 2：字段分级列表（字段粒度） -->
    <a-card class="fields-card">
      <template #title>
        <div class="fields-header">
          <span>字段分级分类（{{ tableData?.fields.length || 0 }}）</span>
          <a-space>
            <a-input-search
              v-model="searchKw"
              placeholder="搜索字段名/注释"
              allow-clear
              style="width: 240px"
            />
            <a-select v-model="filterLevel" placeholder="全部级别" allow-clear style="width: 130px">
              <a-option v-for="lv in (['L1', 'L2', 'L3', 'L4'] as const)" :key="lv" :value="lv">
                {{ lv }} {{ SENSITIVITY_NAMES[lv] }}
              </a-option>
            </a-select>
            <a-select v-model="filterBelonging" placeholder="业务属于" allow-clear style="width: 130px">
              <a-option v-for="b in BELONGING_OPTIONS" :key="b" :value="b">{{ b }}</a-option>
            </a-select>
            <a-select v-model="filterGrade" placeholder="分级" allow-clear style="width: 110px">
              <a-option v-for="g in GRADE_OPTIONS" :key="g" :value="g">{{ g }}</a-option>
            </a-select>
          </a-space>
        </div>
      </template>

      <a-tabs v-model:active-key="activeTab">
        <a-tab-pane key="fields" title="字段列表">
          <a-table
            :data="filteredFields"
            :pagination="{ showTotal: true, pageSize: 20 }"
            row-key="field_name"
            :bordered="false"
            :scroll="{ x: '100%' }"
          >
            <template #columns>
              <a-table-column title="字段名" data-index="field_name" :width="140" fixed>
                <template #cell="{ record }">
                  <a-tag color="gray">{{ record.field_name }}</a-tag>
                </template>
              </a-table-column>
              <a-table-column title="字段注释" data-index="field_comment" :width="140" />
              <a-table-column title="业务属于" :width="100">
                <template #cell="{ record }">
                  <a-tag>{{ record.business_belonging }}</a-tag>
                </template>
              </a-table-column>
              <a-table-column title="分级" :width="80">
                <template #cell="{ record }">
                  <a-tag :color="record.grade === '关键' ? 'red' : record.grade === '重要' ? 'orange' : 'gray'">
                    {{ record.grade }}
                  </a-tag>
                </template>
              </a-table-column>
              <a-table-column title="敏感级别" :width="110">
                <template #cell="{ record }">
                  <a-tag :color="SENSITIVITY_COLORS[record.sensitivity_level]">
                    {{ record.sensitivity_level }}
                  </a-tag>
                </template>
              </a-table-column>
              <a-table-column title="一级业务目录" data-index="category_l1" :width="100" />
              <a-table-column title="二级业务目录" data-index="category_l2" :width="120" />
              <a-table-column title="三级业务目录" data-index="category_l3" :width="120" />
              <a-table-column title="四级业务目录" data-index="category_l4" :width="120" />
              <a-table-column title="操作" :width="100" fixed="right">
                <template #cell="{ record }">
                  <a-tooltip v-if="!canEdit" content="仅数据治理员可编辑">
                    <a-button type="text" size="mini" disabled>编辑</a-button>
                  </a-tooltip>
                  <a-button v-else type="text" size="mini" @click="openEdit(record)">编辑</a-button>
                </template>
              </a-table-column>
            </template>
          </a-table>
        </a-tab-pane>

        <a-tab-pane key="history" title="编辑历史">
          <a-table :data="historyList" :pagination="false" row-key="id">
            <template #columns>
              <a-table-column title="修改时间" data-index="modified_at" :width="180" />
              <a-table-column title="修改人" data-index="modified_by" :width="100" />
              <a-table-column title="修改字段" data-index="field_name" :width="120" />
              <a-table-column title="旧值" data-index="old_value" :width="120" />
              <a-table-column title="新值" data-index="new_value" :width="120" />
            </template>
            <template #empty>
              <a-empty description="暂无编辑历史" />
            </template>
          </a-table>
        </a-tab-pane>
      </a-tabs>
    </a-card>

    <!-- 编辑弹窗 -->
    <ClassifyEditModal
      v-model:visible="editVisible"
      :field="editingField"
      :table-key="`${tableData?.schema}.${tableData?.table_name}`"
      @saved="onEditSaved"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageHeader from '@/components-dca/common/PageHeader.vue'
import ClassifyEditModal from './components/ClassifyEditModal.vue'
import { classifySystemsData } from '@/mock-shared/classify-modules'
import { classifyEditHistory } from '@/mock-shared/classify-edit-history'
import { SENSITIVITY_COLORS, SENSITIVITY_NAMES, GRADE_OPTIONS, BELONGING_OPTIONS, MOCK_ROLES } from '@/mock-shared/classify-constants'
import type { ClassifyField, ClassifyTable } from '@/mock-shared/classify-types'

const route = useRoute()
const router = useRouter()

const systemId = computed(() => route.params.systemId as string)
const schema = computed(() => route.params.schema as string)
const tableName = computed(() => route.params.tableName as string)

const currentSystem = computed(() => classifySystemsData.find(s => s.id === systemId.value))
const tableData = computed<ClassifyTable | undefined>(() =>
  currentSystem.value?.tables.find(t => t.schema === schema.value && t.table_name === tableName.value)
)

const goHome = () => router.push('/management/metadata/classify/sources')
const goToTables = () => router.push(`/management/metadata/classify/tables/${systemId.value}`)

// 表元信息（与数据发现域 TableDetailPage 保持 8 项结构 + 2 列布局）
const tableMetaList = computed(() => {
  if (!tableData.value) return []
  const t = tableData.value
  const sys = currentSystem.value
  // 安全级别分布（demo 用，4 段拼接）
  const dist = { L1: 0, L2: 0, L3: 0, L4: 0 }
  t.fields.forEach(f => { dist[f.sensitivity_level]++ })
  const distText = `L1×${dist.L1} / L2×${dist.L2} / L3×${dist.L3} / L4×${dist.L4}`

  return [
    { label: '表名', value: t.table_name },
    { label: '所属系统', value: sys?.name || '—' },
    { label: 'Schema', value: t.schema },
    { label: '类型', value: sys?.name?.includes('HIVE') ? 'HIVE 表' : '业务表' },
    { label: '表注释', value: t.table_comment },
    { label: '字段数', value: String(t.fields.length) },
    { label: '负责人', value: t.owner },
    { label: '分级覆盖率', value: `${t.coverage}%` },
    { label: '敏感级别分布', value: distText },
    { label: '创建时间', value: t.updated_at },
    { label: '最近更新', value: t.updated_at },
    { label: '数据更新时间', value: t.updated_at }
  ]
})

// 字段筛选
const searchKw = ref('')
const filterLevel = ref<string>('')
const filterBelonging = ref<string>('')
const filterGrade = ref<string>('')
const filteredFields = computed(() => {
  if (!tableData.value) return []
  return tableData.value.fields.filter(f => {
    if (searchKw.value && !f.field_name.includes(searchKw.value) && !f.field_comment.includes(searchKw.value)) return false
    if (filterLevel.value && f.sensitivity_level !== filterLevel.value) return false
    if (filterBelonging.value && f.business_belonging !== filterBelonging.value) return false
    if (filterGrade.value && f.grade !== filterGrade.value) return false
    return true
  })
})

// 角色（用于权限 demo）
const canEdit = ref(true) // 默认治理员角色

// Tab
const activeTab = ref('fields')
const historyList = computed(() => classifyEditHistory.filter(h => h.field_key.startsWith(`${tableData.value?.schema}.${tableData.value?.table_name}.`)))

// 编辑
const editVisible = ref(false)
const editingField = ref<ClassifyField | null>(null)
const openEdit = (f: ClassifyField) => { editingField.value = f; editVisible.value = true }
const onEditSaved = (updated: ClassifyField) => {
  if (!tableData.value || !editingField.value) return
  const idx = tableData.value.fields.findIndex(f => f.field_name === updated.field_name)
  if (idx > -1) {
    tableData.value.fields[idx] = { ...updated, updated_at: new Date().toISOString().slice(0, 10) }
  }
  editVisible.value = false
  editingField.value = null
}
</script>

<style scoped>
.classify-table-detail-page { padding: 16px 24px 24px; }
.breadcrumb { margin-bottom: 8px; }
.meta-card { margin-bottom: 16px; }
.fields-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; }
</style>
