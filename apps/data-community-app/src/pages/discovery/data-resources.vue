<template>
  <div class="data-resources-page">
    <PageBanner
      v-model:search="search"
      title="数据资源目录"
      subtitle="业务数据库 / 交易库 / 风险库 等核心交易源系统的注册与元数据同步"
      search-placeholder="输入系统名称、库名或负责人搜索"
      @search="onSearch"
      @clear="onClear"
    >
      <template #filters>
        <a-select
          v-model="systemType"
          placeholder="系统类型"
          allow-clear
          size="large"
          style="width: 160px"
          class="filter-select"
          @change="onSearch()"
        >
          <a-option value="core">核心交易</a-option>
          <a-option value="risk">风控系统</a-option>
          <a-option value="marketing">营销系统</a-option>
          <a-option value="finance">财务系统</a-option>
        </a-select>
      </template>
      <template #actions>
        <a-button class="action-btn" size="large" @click="showMissingTicket({ assetType: 'table', pageSource: '数据资源目录' })">
          <template #icon><icon-plus /></template>
          缺失工单
        </a-button>
      </template>
    </PageBanner>

    <div class="main-content">
      <div class="content-section">
        <div class="section-header">
          <div class="header-left">
            <h3 class="section-title">业务系统</h3>
            <span class="section-subtitle">共 {{ filteredBusinessSystems.length }} 个核心交易源系统</span>
          </div>
        </div>

        <a-spin :loading="loading" style="width: 100%">
          <a-empty v-if="!loading && filteredBusinessSystems.length === 0" description="暂无业务系统" />
          <a-row v-else :gutter="[16, 16]">
            <a-col v-for="sys in pagedSystems" :key="sys.id" :xs="24" :sm="12" :md="8" :lg="6">
              <AssetCard
                :title="sys.name"
                :type="sys.dbType.toUpperCase()"
                :type-color="getDbTypeColor(sys.dbType)"
                :meta="`${sys.tableCount} 个表 · ${sys.owner}`"
                :description="`${sys.database} · ${sys.systemTypeLabel} · ${sys.updatedAt}`"
                @click="goToTables(sys)"
              />
            </a-col>
          </a-row>

          <div v-if="filteredBusinessSystems.length > pagination.pageSize" class="pagination-wrapper">
            <a-pagination
              :total="filteredBusinessSystems.length"
              :current="pagination.current"
              :page-size="pagination.pageSize"
              show-total
              show-jumper
              @change="onPageChange"
              @page-size-change="onPageSizeChange"
            />
          </div>
        </a-spin>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { IconPlus } from '@arco-design/web-vue/es/icon'
import PageBanner from '@/components-dca/common/PageBanner.vue'
import AssetCard from '@/components-dca/common/AssetCard.vue'
import MissingTicketModal from '@/pages/search/MissingTicketModal.vue'
import { useMissingTicket } from '@/composables/useMissingTicket'

const { showMissingTicketModal, ticketContext, showMissingTicket, handleMissingTicketConfirm } = useMissingTicket()

const router = useRouter()
const search = ref('')
const systemType = ref<string | undefined>(undefined)
const loading = ref(false)

const businessSystems = ref([
  { id: 'BS001', name: '核心交易系统', dbType: 'mysql', systemType: 'core', systemTypeLabel: '核心交易', database: 'core_trade', tableCount: 320, owner: '李开发', updatedAt: '今天 10:30', classifyId: 'SYS-002' },
  { id: 'BS002', name: '风控决策引擎', dbType: 'doris', systemType: 'risk', systemTypeLabel: '风控系统', database: 'risk_decision', tableCount: 180, owner: '张风控', updatedAt: '今天 09:15', classifyId: 'SYS-001' },
  { id: 'BS003', name: '用户中心', dbType: 'pg', systemType: 'core', systemTypeLabel: '核心交易', database: 'user_center', tableCount: 95, owner: '王运营', updatedAt: '今天 11:20', classifyId: 'SYS-002' },
  { id: 'BS004', name: '营销活动平台', dbType: 'hive', systemType: 'marketing', systemTypeLabel: '营销系统', database: 'mkt_platform', tableCount: 420, owner: '陈营销', updatedAt: '今天 08:45', classifyId: 'SYS-001' },
  { id: 'BS005', name: '财务核算系统', dbType: 'oracle', systemType: 'finance', systemTypeLabel: '财务系统', database: 'fin_acc', tableCount: 220, owner: '吴财务', updatedAt: '昨天 17:30', classifyId: 'SYS-002' },
  { id: 'BS006', name: '数据分析平台', dbType: 'clickhouse', systemType: 'core', systemTypeLabel: '核心交易', database: 'olap', tableCount: 180, owner: '王运营', updatedAt: '今天 14:15', classifyId: 'SYS-001' }
])

const pagination = ref({ current: 1, pageSize: 12 })

const filteredBusinessSystems = computed(() => {
  let result = businessSystems.value
  if (search.value) {
    const k = search.value.toLowerCase()
    result = result.filter(s =>
      s.name.toLowerCase().includes(k) ||
      s.database.toLowerCase().includes(k) ||
      s.owner.toLowerCase().includes(k)
    )
  }
  if (systemType.value) {
    result = result.filter(s => s.systemType === systemType.value)
  }
  return result
})

const pagedSystems = computed(() => {
  const start = (pagination.value.current - 1) * pagination.value.pageSize
  return filteredBusinessSystems.value.slice(start, start + pagination.value.pageSize)
})

// 筛选变化时回到第 1 页
watch([search, systemType], () => { pagination.value.current = 1 })

function onSearch() {
  // 触发 loading 闪一下,体验与 asset-catalog 一致
  loading.value = true
  setTimeout(() => { loading.value = false }, 200)
}
function onClear() {
  search.value = ''
  onSearch()
}
function onPageChange(c: number) { pagination.value.current = c }
function onPageSizeChange(s: number) { pagination.value.pageSize = s; pagination.value.current = 1 }

function goToTables(s: any) {
  router.push(`/management/metadata/classify/tables/${s.classifyId}`)
}
function getDbTypeColor(t: string) {
  return ({ mysql: 'arcoblue', doris: 'green', pg: 'cyan', hive: 'orange', oracle: 'red', clickhouse: 'purple' }[t]) || 'gray'
}
</script>

<style scoped>
.data-resources-page {
  min-height: 100vh;
  background: var(--dca-bg-page-alt);
  position: relative;
  overflow-x: hidden;
}

.filter-select {
  background: var(--dca-bg-card);
  border-radius: var(--dca-radius-md);
}

.action-btn {
  white-space: nowrap;
}

.main-content {
  padding: 0 40px var(--dca-spacing-2xl);
  width: 100%;
  max-width: var(--dca-page-max-width-wide);
  margin: -40px auto 0;
  position: relative;
  z-index: 3;
}

.content-section {
  background: var(--dca-bg-card);
  border-radius: var(--dca-radius-xl);
  padding: var(--dca-spacing-lg);
  box-shadow: var(--dca-shadow-md);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--dca-spacing-lg);
}

.header-left {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.section-title {
  font-size: var(--dca-font-2xl);
  font-weight: 600;
  color: var(--dca-text-primary);
  margin: 0;
}

.section-subtitle {
  font-size: var(--dca-font-md);
  color: var(--dca-text-tertiary);
  font-weight: normal;
}

.pagination-wrapper {
  margin-top: var(--dca-spacing-lg);
  display: flex;
  justify-content: flex-end;
}
</style>
