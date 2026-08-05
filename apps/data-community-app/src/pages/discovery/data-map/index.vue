<template>
  <div class="data-map-page">
    <a-page-header title="数据地图" sub-title="浏览所有数据资产 · 字段血缘 · 表级关系" :back="false">
      <template #extra>
        <a-space>
          <a-button @click="goBack">
            <template #icon><icon-left /></template>
            返回
          </a-button>
          <a-button type="primary" @click="openCollectionMgr">
            <template #icon><icon-star /></template>
            收藏管理
          </a-button>
        </a-space>
      </template>
    </a-page-header>

    <div class="content-wrapper">
      <a-row :gutter="16" class="stats-row">
        <a-col :span="6"><a-card :bordered="false"><a-statistic title="资产总数" :value="allTables.length" /></a-card></a-col>
        <a-col :span="6"><a-card :bordered="false"><a-statistic title="高质量资产" :value="highQualityCount" /></a-card></a-col>
        <a-col :span="6"><a-card :bordered="false"><a-statistic title="已建模字段" :value="modeledCount" /></a-card></a-col>
        <a-col :span="6"><a-card :bordered="false"><a-statistic title="已收藏" :value="favorited.size" /></a-card></a-col>
      </a-row>

      <a-row :gutter="16">
        <a-col :span="9">
          <a-card :bordered="false" title="筛选条件" class="filter-card">
            <a-input-search v-model="keyword" placeholder="搜索表名/字段/标签/责任人/标准" size="large" allow-clear />

            <!-- 搜索范围(6 维) -->
            <div class="filter-section" style="margin-top: 12px">
              <a-checkbox-group v-model="searchScopes" size="small">
                <a-checkbox value="name">表名</a-checkbox>
                <a-checkbox value="desc">描述</a-checkbox>
                <a-checkbox value="field">字段</a-checkbox>
                <a-checkbox value="tag">标签</a-checkbox>
                <a-checkbox value="owner">责任人</a-checkbox>
                <a-checkbox value="standard">数据标准</a-checkbox>
              </a-checkbox-group>
            </div>

            <a-divider />
            <div class="filter-section">
              <div class="filter-label">业务域</div>
              <a-checkbox-group v-model="filterDomains">
                <a-checkbox v-for="d in domains" :key="d" :value="d">{{ d }}</a-checkbox>
              </a-checkbox-group>
            </div>
            <a-divider />
            <div class="filter-section">
              <div class="filter-label">表类型</div>
              <a-segmented
                v-model="filterType"
                :options="[
                  { label: '全部', value: '' },
                  { label: 'DIM', value: 'dim' },
                  { label: 'DWD', value: 'dwd' },
                  { label: 'DWS', value: 'dws' },
                  { label: 'ADS', value: 'ads' }
                ]"
                size="small"
                block
              />
            </div>
          </a-card>

          <a-card :bordered="false" class="table-list-card" style="margin-top: 16px">
            <template #title>
              资产列表
              <a-tag size="small" style="margin-left: 8px">{{ filteredTables.length }}</a-tag>
            </template>
            <a-empty v-if="filteredTables.length === 0" description="无匹配表" />
            <div
              v-for="t in filteredTables" :key="t.name"
              class="table-item"
              :class="{ active: selectedTable?.name === t.name }"
              @click="selectTable(t)"
            >
              <div class="table-header">
                <a-tag :color="typeColor(t.type)">{{ t.type?.toUpperCase() }}</a-tag>
                <strong>{{ t.name }}</strong>
                <icon-star v-if="isFavorited(t.name)" class="fav-icon" :style="favIconStyle" />
              </div>
              <div class="table-desc">{{ t.description }}</div>
              <div class="table-meta">
                <a-tag size="small" color="arcoblue">{{ t.domain }}</a-tag>
                <span class="quality">
                  <a-progress :percent="t.qualityScore / 100" :stroke-width="4" :color="qualityColor(t.qualityScore)" />
                  <span class="quality-text">{{ t.qualityScore }}</span>
                </span>
              </div>
            </div>
          </a-card>
        </a-col>

        <a-col :span="15">
          <a-card :bordered="false" v-if="selectedTable">
            <template #title>
              <div class="detail-title">
                <a-tag :color="typeColor(selectedTable.type)" size="large">{{ selectedTable.type?.toUpperCase() }}</a-tag>
                <span style="font-size: 18px; margin-left: 8px">{{ selectedTable.name }}</span>
              </div>
            </template>
            <template #extra>
              <a-space>
                <a-button
                  size="small"
                  :type="isFavorited(selectedTable.name) ? 'primary' : 'outline'"
                  @click="toggleFav(selectedTable)"
                >
                  <template #icon><icon-star /></template>
                  {{ isFavorited(selectedTable.name) ? '已收藏' : '收藏' }}
                </a-button>
                <a-button size="small" @click="goLineage">
                  <template #icon><icon-share-alt /></template>
                  血缘
                </a-button>
                <a-button size="small" @click="goImpact">
                  <template #icon><icon-experiment /></template>
                  影响分析
                </a-button>
              </a-space>
            </template>

            <a-tabs default-active-key="overview">
              <a-tab-pane key="overview" title="概览">
                <a-descriptions :column="3" :bordered="true" size="medium">
                  <a-descriptions-item label="业务域">{{ selectedTable.domain }}</a-descriptions-item>
                  <a-descriptions-item label="Owner">{{ selectedTable.owner }}</a-descriptions-item>
                  <a-descriptions-item label="记录数">{{ formatNumber(selectedTable.recordCount) }}</a-descriptions-item>
                  <a-descriptions-item label="存储大小">{{ selectedTable.storageSize }}</a-descriptions-item>
                  <a-descriptions-item label="更新频率">{{ selectedTable.updateFrequency }}</a-descriptions-item>
                  <a-descriptions-item label="质量分">
                    <a-progress :percent="selectedTable.qualityScore / 100" :stroke-width="6" :color="qualityColor(selectedTable.qualityScore)" />
                  </a-descriptions-item>
                  <a-descriptions-item label="数据标准" :span="3">
                    <a-tag v-if="selectedTable.standardCode" color="purple">
                      {{ selectedTable.standardCode }} · {{ selectedTable.standardName }}
                    </a-tag>
                    <span v-else class="muted">未关联标准</span>
                  </a-descriptions-item>
                  <a-descriptions-item label="描述" :span="3">{{ selectedTable.description }}</a-descriptions-item>
                  <a-descriptions-item label="标签" :span="3">
                    <a-tag v-for="t in (selectedTable.tags || [])" :key="t" color="arcoblue">{{ t }}</a-tag>
                  </a-descriptions-item>
                </a-descriptions>

                <a-divider />
                <h3 class="subsection-title">数据健康度</h3>
                <a-row :gutter="16">
                  <a-col :span="6"><a-statistic title="完整度" :value="92.5" :precision="1" suffix="%" /></a-col>
                  <a-col :span="6"><a-statistic title="唯一性" :value="88.3" :precision="1" suffix="%" /></a-col>
                  <a-col :span="6"><a-statistic title="一致性" :value="76.2" :precision="1" suffix="%" /></a-col>
                  <a-col :span="6"><a-statistic title="及时性" :value="95.8" :precision="1" suffix="%" /></a-col>
                </a-row>
              </a-tab-pane>

              <a-tab-pane key="fields" :title="`字段(${selectedTable.fields?.length || 0})`">
                <a-table :data="selectedTable.fields || []" :pagination="{ pageSize: 15 }" row-key="name" size="small">
                  <template #columns>
                    <a-table-column title="字段名" data-index="name" :width="180" />
                    <a-table-column title="类型" data-index="type" :width="100" />
                    <a-table-column title="重要性" data-index="businessImportance" :width="110">
                      <template #cell="{ record }">
                        <a-tag :color="record.businessImportance === 'critical' ? 'red' : 'arcoblue'">{{ record.businessImportance }}</a-tag>
                      </template>
                    </a-table-column>
                    <a-table-column title="质量" data-index="qualityLevel" :width="100">
                      <template #cell="{ record }">
                        <a-tag :color="record.qualityLevel === 'high' ? 'green' : (record.qualityLevel === 'low' ? 'red' : 'orange')">{{ record.qualityLevel }}</a-tag>
                      </template>
                    </a-table-column>
                    <a-table-column title="敏感级" data-index="sensitivity" :width="100">
                      <template #cell="{ record }">
                        <a-tag :color="record.sensitivity === 'restricted' ? 'red' : (record.sensitivity === 'confidential' ? 'orange' : 'green')">{{ sensitivityLabel(record.sensitivity) }}</a-tag>
                      </template>
                    </a-table-column>
                    <a-table-column title="描述" data-index="description" />
                  </template>
                </a-table>
              </a-tab-pane>

              <a-tab-pane key="favorites" title="收藏情况">
                <a-empty v-if="favoritedBy.length === 0" description="该资产尚未被收藏" />
                <a-list v-else>
                  <a-list-item v-for="(f, idx) in favoritedBy" :key="idx">
                    <a-list-item-meta>
                      <template #avatar><a-avatar :style="{ background: f.color }">{{ f.initial }}</a-avatar></template>
                      <template #title><strong>{{ f.userName }}</strong><a-tag size="small" style="margin-left: 8px">{{ f.collection }}</a-tag></template>
                      <template #description>{{ f.time }} · {{ f.note }}</template>
                    </a-list-item-meta>
                  </a-list-item>
                </a-list>
              </a-tab-pane>
            </a-tabs>
          </a-card>
          <a-card :bordered="false" v-else>
            <a-empty description="从左侧选择一个资产查看详情" />
          </a-card>
        </a-col>
      </a-row>
    </div>

    <a-drawer v-model:visible="collectionDrawerVisible" title="收藏管理" :width="780" :footer="false">
      <a-button type="primary" @click="openCreateCollection" style="margin-bottom: 16px">
        <template #icon><icon-plus /></template>新建收藏集
      </a-button>
      <a-list :data="collections">
        <template #item="item">
          <a-list-item>
            <a-list-item-meta>
              <template #avatar><a-avatar :style="{ background: item.item.color }"><icon-star /></a-avatar></template>
              <template #title><strong>{{ item.item.name }}</strong><a-tag size="small" style="margin-left: 8px">{{ item.item.itemCount }} 张表</a-tag></template>
              <template #description>{{ item.item.description }}</template>
            </a-list-item-meta>
            <template #actions>
              <a-button type="text" size="small" @click="viewCollection(item.item)">查看</a-button>
              <a-popconfirm content="确定删除此收藏集?" @ok="deleteCollection(item.item)">
                <a-button type="text" status="danger" size="small">删除</a-button>
              </a-popconfirm>
            </template>
          </a-list-item>
        </template>
      </a-list>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
// @/mock 在 vite.config 中指向 dfd-app 的 src/mock(包含 shared/ 子目录)
import { MetadataStore } from '@/mock/shared/metadata-store'

const router = useRouter()
const route = useRoute()

const allTables = ref<any[]>([])
const keyword = ref('')
const filterDomains = ref<string[]>([])
// 6 维搜索范围,默认全开
const searchScopes = ref<string[]>(['name', 'desc', 'field', 'tag', 'owner', 'standard'])
const filterType = ref<string>('')
const selectedTable = ref<any>(null)
const collections = ref<any[]>([
  { id: 'C001', name: '核心用户表', description: '分析师常用的核心用户维表', color: '#165dff', itemCount: 8 },
  { id: 'C002', name: '风控相关', description: '风控团队关注的表', color: '#f53f3f', itemCount: 12 },
  { id: 'C003', name: '营销集市', description: '营销活动常用的集市表', color: '#ff7d00', itemCount: 6 }
])
const favorited = ref<Set<string>>(new Set())
const collectionDrawerVisible = ref(false)

// 颜色 style 对象(避开 template 里的 # 解析)
const favIconStyle = { color: '#ff7d00' }

onMounted(() => {
  // 支持从 query 预填筛选(如 /dca/discovery/data-map?domain=用户域)
  const q = route.query
  if (q.domain) {
    const domains = Array.isArray(q.domain) ? q.domain : [q.domain]
    filterDomains.value = domains.map(d => String(d))
  }
  if (q.type) {
    filterType.value = String(q.type)
  }

  allTables.value = MetadataStore.getTables()
  // P0-1:为每张表补 owner / standardCode / standardName(从表名+字段名启发式),让多维搜索能命中
  allTables.value.forEach((t: any) => {
    if (!t.owner) {
      // 按域分配不同的责任人
      const ownerMap: Record<string, string> = {
        '用户域': '王运营', '交易域': '李交易', '风控域': '张风控',
        '营销域': '赵营销', '财务域': '钱财务', '产品域': '孙产品'
      }
      t.owner = ownerMap[t.domain] || '系统管理员'
    }
    // 业务标准(根据表名启发)
    if (!t.standardCode) {
      if (t.name?.includes('user')) { t.standardCode = 'STD-USER-001'; t.standardName = '用户基础信息标准' }
      else if (t.name?.includes('loan')) { t.standardCode = 'STD-LOAN-001'; t.standardName = '借据信息标准' }
      else if (t.name?.includes('order') || t.name?.includes('pay')) { t.standardCode = 'STD-ORDER-001'; t.standardName = '订单交易标准' }
      else if (t.name?.includes('risk')) { t.standardCode = 'STD-RISK-001'; t.standardName = '风控评分标准' }
      else if (t.name?.includes('product')) { t.standardCode = 'STD-PROD-001'; t.standardName = '产品信息标准' }
      else { t.standardCode = 'STD-COMMON-001'; t.standardName = '通用数据标准' }
    }
  })
  if (allTables.value.length > 0) {
    selectedTable.value = allTables.value[0]
  }
  favorited.value = new Set(['dim_user', 'fact_loan_apply', 'dws_risk_score'])
})

const domains = computed(() => Array.from(new Set(allTables.value.map(t => t.domain).filter(Boolean))).sort())

const highQualityCount = computed(() => allTables.value.filter(t => (t.qualityScore || 0) >= 90).length)
const modeledCount = computed(() => allTables.value.reduce((s, t) => s + ((t.fields || []).filter((f: any) => f.modeledLevel >= 80).length), 0))

const filteredTables = computed(() => {
  const k = keyword.value.trim().toLowerCase()
  const scopes = searchScopes.value
  return allTables.value.filter(t => {
    if (k) {
      // 6 维匹配,按用户勾选范围检索
      const checks: Record<string, boolean> = {
        name: t.name?.toLowerCase().includes(k),
        desc: t.description?.toLowerCase().includes(k),
        tag: (t.tags || []).some((tag: string) => tag.toLowerCase().includes(k)),
        field: (t.fields || []).some((f: any) => f.name?.toLowerCase().includes(k)),
        owner: (t.owner || '').toLowerCase().includes(k),
        standard: (t.standardCode || '').toLowerCase().includes(k) ||
                  (t.standardName || '').toLowerCase().includes(k)
      }
      // 至少一个勾选维度命中
      const hit = scopes.some(s => checks[s])
      if (!hit) return false
    }
    if (filterDomains.value.length > 0 && !filterDomains.value.includes(t.domain)) return false
    if (filterType.value && t.type !== filterType.value) return false
    return true
  })
})

const favoritedBy = computed(() => {
  if (!selectedTable.value || !favorited.value.has(selectedTable.value.name)) return []
  return [
    { initial: '王', color: '#165dff', userName: '王运营', collection: '核心用户表', time: '今天 10:30', note: '日常分析必看' },
    { initial: '张', color: '#f53f3f', userName: '张风控', collection: '风控相关', time: '昨天 16:45', note: '风控模型特征' }
  ]
})

function selectTable(t: any) { selectedTable.value = t }
function isFavorited(name: string) { return favorited.value.has(name) }
function toggleFav(t: any) {
  if (favorited.value.has(t.name)) {
    favorited.value.delete(t.name)
    Message.info(`已取消收藏: ${t.name}`)
  } else {
    favorited.value.add(t.name)
    Message.success(`已收藏: ${t.name}`)
  }
}
function goLineage() { router.push({ name: 'lineage', query: { table: selectedTable.value?.name } }) }
function goImpact() { Message.info(`影响分析: ${selectedTable.value?.name}`) }
function openCollectionMgr() { collectionDrawerVisible.value = true }
function openCreateCollection() { Message.info('新建收藏集向导(简化演示)') }
function viewCollection(c: any) { Message.info(`查看收藏集: ${c.name}`); collectionDrawerVisible.value = false }
function deleteCollection(c: any) { collections.value = collections.value.filter(x => x.id !== c.id); Message.success(`已删除: ${c.name}`) }

function typeColor(type: string) {
  const map: Record<string, string> = { dim: 'arcoblue', dwd: 'green', dws: 'orange', ads: 'purple', fact: 'cyan' }
  return map[type?.toLowerCase()] || 'gray'
}
function qualityColor(score: number) {
  if (score >= 90) return '#00b42a'
  if (score >= 60) return '#ff7d00'
  return '#f53f3f'
}
function sensitivityLabel(s: string) {
  return { public: '公开', internal: '内部', confidential: '机密', restricted: '受限' }[s] || s
}
function formatNumber(n: number) {
  if (!n) return '0'
  if (n >= 10000) return (n / 10000).toFixed(1) + '万'
  return n.toLocaleString()
}

const goBack = () => router.push('discovery')
</script>

<style lang="scss" scoped>
.data-map-page {
  background: #f5f7fa;
  min-height: 100vh;
}
.content-wrapper {
  padding: 0 24px 24px;
}
.stats-row { margin-bottom: 16px; }
.filter-card {
  .filter-section { margin-bottom: 0; }
  .filter-label { font-size: 13px; color: #86909c; margin-bottom: 8px; font-weight: 500; }
}
.table-list-card {
  :deep(.arco-card-body) {
    padding: 12px;
    max-height: calc(100vh - 380px);
    overflow-y: auto;
  }
}
.table-item {
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 8px;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s;
  background: #fafbfc;
  &:hover { background: #f2f3f5; }
  &.active { background: #e8f3ff; border-color: #165dff; }

  .table-header {
    display: flex; align-items: center; gap: 8px; margin-bottom: 6px;
    .fav-icon { margin-left: auto; font-size: 16px; }
  }
  .table-desc {
    font-size: 12px; color: #86909c; margin-bottom: 6px;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .table-meta {
    display: flex; align-items: center; gap: 8px;
    .quality {
      display: flex; align-items: center; gap: 4px; flex: 1;
      :deep(.arco-progress) { flex: 1; }
      .quality-text { font-size: 11px; color: #4e5969; font-weight: 600; }
    }
  }
}
.detail-title { display: flex; align-items: center; gap: 8px; }
.subsection-title { font-size: 14px; font-weight: 600; color: #1d2129; margin: 16px 0 12px; }
</style>