<template>
  <div class="uq-result">
    <a-spin :loading="loading" class="uq-result__spin" tip="查询执行中…">
      <div v-if="status === 'running' && !rows.length" class="uq-result__placeholder">
        正在执行,请稍候…
      </div>
      <div v-else-if="status === 'error'" class="uq-result__placeholder is-error">
        <icon-close-circle-fill />
        <span>查询执行失败,请切换到「日志」查看原因</span>
      </div>
      <div v-else-if="status === 'aborted'" class="uq-result__placeholder is-warn">
        <icon-exclamation-circle-fill />
        <span>查询已终止,未返回结果集</span>
      </div>
      <div v-else-if="!rows.length" class="uq-result__placeholder">
        <icon-storage />
        <span>暂无数据</span>
      </div>
      <a-table
        v-else
        :columns="arcoColumns"
        :data="sortedRows"
        :pagination="pagination"
        :scroll="{ x: '100%', y: 300 }"
        size="small"
        borderless
        row-key="__idx"
        @sorter-change="onSorterChange"
      />
    </a-spin>

    <div class="uq-result__footer">
      <span>耗时: <b>{{ duration || '-' }}</b></span>
      <a-divider direction="vertical" />
      <span>返回行数: <b>{{ rowCount }}</b></span>
      <template v-if="sortState.key">
        <a-divider direction="vertical" />
        <span class="uq-result__sorted">
          已按「{{ sortTitle }}」{{ sortState.order === 'ascend' ? '升序' : '降序' }}
          <a-link size="mini" @click="clearSort">取消排序</a-link>
        </span>
      </template>
      <span class="uq-result__spacer" />
      <a-button v-if="rowCount > 0" size="mini" type="text" @click="exportCSV">
        <template #icon><icon-download /></template>
        导出 CSV
      </a-button>
      <a-button v-if="rowCount > 0" size="mini" type="text" @click="exportExcel">
        <template #icon><icon-download /></template>
        导出 Excel
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 查询结果表格(F08)
 *
 * 数值列右对齐并按数值排序,文本列按字典序排序;
 * 排序状态由组件内部管理,Arco 只负责表头交互回调。
 */
import { computed, ref, watch } from 'vue'
import type { TableColumnData } from '@arco-design/web-vue'
import type { ExecStatus, QueryResult, ResultColumn } from '@/mock/unified-query/types'

const props = withDefaults(
  defineProps<{ result: QueryResult | null; loading?: boolean; status: ExecStatus }>(),
  { loading: false }
)

const columns = computed<ResultColumn[]>(() => props.result?.columns ?? [])
const rows = computed<Record<string, string | number>[]>(() =>
  (props.result?.rows ?? []).map((r, i) => ({ ...r, __idx: i }))
)
const duration = computed(() => props.result?.duration ?? '')
const rowCount = computed(() => props.result?.rowCount ?? 0)

const sortState = ref<{ key: string; order: 'ascend' | 'descend' | '' }>({ key: '', order: '' })

const pagination = computed(() =>
  rows.value.length > 10 ? { pageSize: 10, size: 'mini' as const, showTotal: true } : false
)

const arcoColumns = computed<TableColumnData[]>(() =>
  columns.value.map(c => ({
    title: c.title,
    dataIndex: c.dataIndex,
    width: c.width,
    sortable: { sortDirections: ['ascend', 'descend'] },
    align: c.numeric ? ('right' as const) : ('left' as const),
    ellipsis: true,
    tooltip: true
  }))
)

const sortTitle = computed(
  () => columns.value.find(c => c.dataIndex === sortState.value.key)?.title ?? ''
)

const sortedRows = computed(() => {
  const { key, order } = sortState.value
  if (!key || !order) return rows.value
  const numeric = columns.value.find(c => c.dataIndex === key)?.numeric
  const dir = order === 'ascend' ? 1 : -1
  return [...rows.value].sort((a, b) => {
    const av = a[key]
    const bv = b[key]
    if (numeric) return ((Number(av) || 0) - (Number(bv) || 0)) * dir
    return String(av ?? '').localeCompare(String(bv ?? ''), 'zh-CN') * dir
  })
})

function onSorterChange(dataIndex: string, direction: string) {
  sortState.value = {
    key: direction ? dataIndex : '',
    order: direction === 'ascend' || direction === 'descend' ? (direction as 'ascend' | 'descend') : ''
  }
}

function clearSort() {
  sortState.value = { key: '', order: '' }
}

// 换了查询结果就重置排序,避免残留的排序键落到新列上
watch(() => props.result, clearSort)

/** F10:导出 CSV */
function exportCSV() {
  const cols = columns.value
  const header = cols.map(c => c.title).join(',')
  const lines = sortedRows.value.map(r =>
    cols.map(c => {
      const v = r[c.dataIndex] ?? ''
      const s = String(v)
      // 含逗号/引号/换行的用双引号包裹
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
    }).join(',')
  )
  const csv = '\uFEFF' + [header, ...lines].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `查询结果_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

/** F10:导出 Excel(HTML 表格 .xls 格式) */
function exportExcel() {
  const cols = columns.value
  const header = cols.map(c => `<th>${c.title}</th>`).join('')
  const rows = sortedRows.value.map(r =>
    `<tr>${cols.map(c => `<td>${r[c.dataIndex] ?? ''}</td>`).join('')}</tr>`
  ).join('')
  const html = `<table border="1"><thead><tr>${header}</tr></thead><tbody>${rows}</tbody></table>`
  const blob = new Blob(['\uFEFF' + html], { type: 'application/vnd.ms-excel' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `查询结果_${new Date().toISOString().slice(0, 10)}.xls`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<style lang="scss" scoped>
.uq-result {
  height: 100%;
  display: flex;
  flex-direction: column;

  &__spin {
    flex: 1;
    min-height: 120px;
    display: block;
  }

  &__placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 120px;
    color: var(--color-text-3);
    font-size: 13px;

    &.is-error { color: rgb(var(--danger-6)); }
    &.is-warn { color: rgb(var(--warning-6)); }
  }

  &__footer {
    flex: none;
    display: flex;
    align-items: center;
    padding: 6px 12px;
    border-top: 1px solid var(--color-border-2);
    font-size: 12px;
    color: var(--color-text-3);
  }

  &__sorted {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  &__spacer {
    flex: 1;
  }
}
</style>
