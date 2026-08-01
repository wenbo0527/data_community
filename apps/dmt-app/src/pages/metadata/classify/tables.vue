<template>
  <div class="classify-tables-page">
    <!-- 面包屑 -->
    <a-breadcrumb class="breadcrumb">
      <a-breadcrumb-item><a @click="goHome">数据分级</a></a-breadcrumb-item>
      <a-breadcrumb-item>{{ currentSystem?.name }}</a-breadcrumb-item>
    </a-breadcrumb>

    <DmtPageHeader :title="`${currentSystem?.name || '数据源'} · 表列表`" :sub-title="`共 ${tables.length} 张表，${currentSystem?.description || ''}`">
      <template #extra>
        <a-space>
          <a-button @click="goHome">返回数据源</a-button>
          <a-button @click="downloadTemplate">
            <template #icon><icon-download /></template>
            下载模板
          </a-button>
          <a-button type="primary" @click="openUpload">
            <template #icon><icon-upload /></template>
            批量上传分级分类
          </a-button>
        </a-space>
      </template>
    </DmtPageHeader>

    <!-- 统计概览 -->
    <a-row :gutter="16" class="stats-row">
      <a-col :span="6">
        <a-card>
          <a-statistic title="总表数" :value="tables.length" :value-style="{ color: '#165DFF' }" />
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic title="已分级" :value="tables.filter(t => t.coverage === 100).length" :value-style="{ color: '#52C41A' }">
            <template #suffix>
              <span style="font-size: 14px; color: #86909c">/ {{ tables.length }}</span>
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic title="待分级" :value="tables.filter(t => t.coverage < 100).length" :value-style="{ color: '#FA8C16' }" />
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="平均覆盖率"
            :value="avgCoverage"
            :precision="1"
            :value-style="{ color: avgCoverage >= 80 ? '#52C41A' : '#FA8C16' }"
          >
            <template #suffix>%</template>
          </a-statistic>
        </a-card>
      </a-col>
    </a-row>

    <!-- 筛选区 -->
    <a-card class="filter-card">
      <a-form layout="inline" :model="filterForm">
        <a-form-item label="搜索">
          <a-input v-model="filterForm.searchKw" placeholder="按表名/注释搜索" allow-clear style="width: 240px" />
        </a-form-item>
        <a-form-item label="分级状态">
          <a-select v-model="filterForm.statusFilter" placeholder="全部" allow-clear style="width: 140px" @change="applyFilter">
            <a-option value="all">全部</a-option>
            <a-option value="done">已分级</a-option>
            <a-option value="pending">未完成</a-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <span class="filter-tip">共 {{ filteredTables.length }} 张</span>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 表列表 -->
    <a-card>
      <a-table :data="filteredTables" :pagination="{ showTotal: true, pageSize: 20 }" row-key="table_name">
        <template #columns>
          <a-table-column title="表名" :width="220">
            <template #cell="{ record }">
              <a-link @click="goToDetail(record)">{{ record.table_name }}</a-link>
              <div class="schema-sub">{{ record.schema }}</div>
            </template>
          </a-table-column>
          <a-table-column title="表注释" data-index="table_comment" :width="220">
            <template #cell="{ record }">
              <a-tooltip :content="record.table_comment">
                <span class="comment-cell">{{ record.table_comment }}</span>
              </a-tooltip>
            </template>
          </a-table-column>
          <a-table-column title="字段数" :width="100">
            <template #cell="{ record }">
              <a-tag>{{ record.fields.length }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="分级覆盖率" :width="180">
            <template #cell="{ record }">
              <a-progress
                :percent="record.coverage / 100"
                :stroke-color="record.coverage === 100 ? '#52C41A' : '#FA8C16'"
                :show-text="true"
                :format="(p: number) => `${Math.round(p * 100)}%`"
              />
            </template>
          </a-table-column>
          <a-table-column title="分级分布" :width="260">
            <template #cell="{ record }">
              <a-space :size="4" wrap>
                <a-tag
                  v-for="lv in (['L1', 'L2', 'L3', 'L4'] as const)"
                  :key="lv"
                  :color="SENSITIVITY_COLORS[lv]"
                  size="small"
                >
                  {{ lv }} × {{ countByLevel(record, lv) }}
                </a-tag>
              </a-space>
            </template>
          </a-table-column>
          <a-table-column title="负责人" data-index="owner" :width="100">
            <template #cell="{ record }">
              <a-avatar :size="22" style="background: #165DFF">{{ record.owner?.charAt(0) }}</a-avatar>
              <span style="margin-left: 6px">{{ record.owner }}</span>
            </template>
          </a-table-column>
          <a-table-column title="最近更新" data-index="updated_at" :width="120" />
          <a-table-column title="操作" :width="200" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-tooltip content="查看表详情与字段分级">
                  <a-button type="text" size="small" @click="goToDetail(record)">查看</a-button>
                </a-tooltip>
                <a-tooltip content="编辑字段分级（需治理员权限）">
                  <a-button type="text" size="small" @click="goToDetail(record)">编辑</a-button>
                </a-tooltip>
                <a-tooltip content="导出该表的所有字段分级">
                  <a-button type="text" size="small" @click="exportTable(record)">导出</a-button>
                </a-tooltip>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <!-- 批量上传弹窗 -->
    <ClassifyUploadModal v-model:visible="uploadVisible" :table-name="uploadTableName" @success="onUploadSuccess" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import DmtPageHeader from '../../../components/common/DmtPageHeader.vue'
import ClassifyUploadModal from './components/ClassifyUploadModal.vue'
import { classifySystemsData } from '@shared/classify-modules'
import { SENSITIVITY_COLORS } from '@shared/classify-constants'
import type { ClassifyField, ClassifyTable, SensitivityLevel } from '@shared/classify-types'
import { IconUpload, IconDownload } from '@arco-design/web-vue/es/icon'

const route = useRoute()
const router = useRouter()
const systemId = computed(() => route.params.systemId as string)
const currentSystem = computed(() => classifySystemsData.find(s => s.id === systemId.value))
const tables = computed(() => currentSystem.value?.tables || [])

// 统计
const avgCoverage = computed(() => {
  if (tables.value.length === 0) return 0
  const total = tables.value.reduce((s, t) => s + t.coverage, 0)
  return Math.round((total / tables.value.length) * 10) / 10
})

const filterForm = reactive({
  searchKw: '',
  statusFilter: '' as '' | 'all' | 'done' | 'pending'
})
const searchKw = ref('')
const statusFilter = ref<'all' | 'done' | 'pending' | ''>('')
const filteredTables = computed(() => {
  return tables.value.filter(t => {
    const kw = filterForm.searchKw || searchKw.value
    const sf = filterForm.statusFilter || statusFilter.value
    const matchKw = !kw || t.table_name.includes(kw) || t.table_comment.includes(kw)
    const matchStatus = !sf || sf === 'all' ||
      (sf === 'done' && t.coverage === 100) ||
      (sf === 'pending' && t.coverage < 100)
    return matchKw && matchStatus
  })
})
const applyFilter = () => { /* 触发 computed */ }

const countByLevel = (t: ClassifyTable, lv: SensitivityLevel) => t.fields.filter(f => f.sensitivity_level === lv).length

const goHome = () => router.push('/metadata/classify/sources')
const goToDetail = (t: ClassifyTable) => {
  router.push(`/metadata/classify/table/${systemId.value}/${t.schema}/${t.table_name}`)
}

// 上传
const uploadVisible = ref(false)
const uploadTableName = ref('')
const openUpload = () => { uploadTableName.value = ''; uploadVisible.value = true }
const onUploadSuccess = (count: number) => {
  Message.success(`解析成功，共 ${count} 字段`)
  uploadVisible.value = false
}

// 导出（按表）
const exportTable = (t: ClassifyTable) => {
  // Demo 模式：仅 Toast 提示，不生成真实 Excel 文件
  Message.info(`Demo 模式：已生成「${t.schema}.${t.table_name}」共 ${t.fields.length} 个字段的分级导出（实际部署时生成 xlsx）`)
}

// 下载模板
const downloadTemplate = () => {
  // Demo 模式：仅提示
  Message.info('Demo 模式：模板下载功能已预留，实际部署时生成 Excel 模板')
}
</script>

<style scoped>
.classify-tables-page { padding: 16px 24px 24px; }
.breadcrumb { margin-bottom: 8px; }
.stats-row { margin-bottom: 16px; }
.filter-card { margin-bottom: 16px; }
.filter-tip { color: #86909c; font-size: 13px; }
.schema-sub { font-size: 11px; color: #86909c; margin-top: 2px; font-family: monospace; }
.comment-cell { display: inline-block; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; vertical-align: middle; }
</style>
