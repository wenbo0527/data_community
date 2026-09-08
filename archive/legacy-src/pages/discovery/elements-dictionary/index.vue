<template>
  <div class="elements-dictionary">
    <a-page-header title="要素字典" class="page-header">
      <template #subtitle>
        <span class="header-subtitle">
          统一查看指标 / 变量 / 特征三类要素的定义、口径、Owner 与敏感级别
        </span>
      </template>
      <template #extra>
        <a-space>
          <a-radio-group v-model="elementType" type="button" size="small">
            <a-radio-button value="all">
              全部 ({{ stats.total }})
            </a-radio-button>
            <a-radio-button value="metric">
              指标 ({{ stats.metric }})
            </a-radio-button>
            <a-radio-button value="variable">
              变量 ({{ stats.variable }})
            </a-radio-button>
            <a-radio-button value="feature">
              特征 ({{ stats.feature }})
            </a-radio-button>
          </a-radio-group>
          <a-button @click="exportData">
            <template #icon><IconDownload /></template>
            导出
          </a-button>
        </a-space>
      </template>
    </a-page-header>

    <!-- 筛选区 -->
    <a-card class="filter-card">
      <a-row :gutter="16">
        <a-col :span="8">
          <a-input-search
            v-model="searchKeyword"
            placeholder="搜索要素名称、编码或描述"
            allow-clear
            @search="handleSearch"
          />
        </a-col>
        <a-col :span="5">
          <a-select v-model="filterDomain" placeholder="业务域" allow-clear @change="handleSearch">
            <a-option v-for="d in domains" :key="d" :value="d">{{ d }}</a-option>
          </a-select>
        </a-col>
        <a-col :span="5">
          <a-select v-model="filterSensitivity" placeholder="敏感级别" allow-clear @change="handleSearch">
            <a-option value="L1">L1 低敏</a-option>
            <a-option value="L2">L2 中敏</a-option>
            <a-option value="L3">L3 高敏</a-option>
            <a-option value="NONE">未分级</a-option>
          </a-select>
        </a-col>
        <a-col :span="6">
          <a-space>
            <a-button @click="resetFilter">重置</a-button>
          </a-space>
        </a-col>
      </a-row>
    </a-card>

    <!-- 主体:左侧分类树 + 右侧列表 -->
    <a-row :gutter="16">
      <a-col :span="6">
        <a-card title="分类导航" :bordered="false">
          <a-tree
            v-model:selected-keys="selectedKeys"
            :data="treeData"
            :show-line="true"
            block-node
            @select="onTreeSelect"
          >
            <template #title="node">
              <span>{{ node.title }}</span>
              <a-tag v-if="node.tag" :color="node.tagColor" size="mini" style="margin-left: 8px">
                {{ node.tag }}
              </a-tag>
            </template>
          </a-tree>
        </a-card>

        <!-- 维度统计 -->
        <a-card title="维度统计" :bordered="false" style="margin-top: 16px">
          <a-statistic title="总要素数" :value="stats.total" />
          <a-divider />
          <a-descriptions :column="1" size="small">
            <a-descriptions-item label="业务核心指标">{{ stats.metric }}</a-descriptions-item>
            <a-descriptions-item label="变量">{{ stats.variable }}</a-descriptions-item>
            <a-descriptions-item label="特征">{{ stats.feature }}</a-descriptions-item>
            <a-descriptions-item label="已分级">
              {{ stats.graded }} ({{ stats.gradedPercent }}%)
            </a-descriptions-item>
          </a-descriptions>
        </a-card>
      </a-col>

      <a-col :span="18">
        <a-card :bordered="false">
          <template #title>
            <a-space>
              <span>要素列表</span>
              <a-tag>{{ filteredElements.length }} 条</a-tag>
            </a-space>
          </template>

          <a-empty v-if="filteredElements.length === 0" description="没有匹配的要素" />

          <a-table
            v-else
            :data="filteredElements"
            :pagination="{ pageSize: 15 }"
            :bordered="false"
            row-key="code"
            @row-click="handleRowClick"
          >
            <template #columns>
              <a-table-column title="类型" data-index="elementType" :width="80">
                <template #cell="{ record }">
                  <a-tag :color="getElementColor(record.elementType)">
                    {{ getElementLabel(record.elementType) }}
                  </a-tag>
                </template>
              </a-table-column>
              <a-table-column title="名称" data-index="name" :width="160">
                <template #cell="{ record }">
                  <a-link @click="viewDetail(record)">{{ record.name }}</a-link>
                </template>
              </a-table-column>
              <a-table-column title="编码" data-index="code" :width="200">
                <template #cell="{ record }">
                  <code>{{ record.code }}</code>
                </template>
              </a-table-column>
              <a-table-column title="业务域" data-index="businessBelonging" :width="90">
                <template #cell="{ record }">
                  <a-tag size="small">{{ record.businessBelonging }}</a-tag>
                </template>
              </a-table-column>
              <a-table-column title="敏感级别" data-index="defaultSensitivity" :width="90">
                <template #cell="{ record }">
                  <a-tag v-if="record.defaultSensitivity" :color="getSensitivityColor(record.defaultSensitivity)">
                    {{ record.defaultSensitivity }}
                  </a-tag>
                  <a-tag v-else color="gray" size="small">未分级</a-tag>
                </template>
              </a-table-column>
              <a-table-column title="Owner" data-index="ownerName" :width="100">
                <template #cell="{ record }">
                  <a-avatar :size="20" style="margin-right: 4px">{{ record.ownerName.slice(0, 1) }}</a-avatar>
                  {{ record.ownerName }}
                </template>
              </a-table-column>
              <a-table-column title="描述" data-index="description" :ellipsis="true" />
              <a-table-column title="操作" :width="120">
                <template #cell="{ record }">
                  <a-space>
                    <a-button type="text" size="mini" @click.stop="viewDetail(record)">
                      <template #icon><IconEye /></template>
                      详情
                    </a-button>
                    <a-button type="text" size="mini" @click.stop="goLineage(record)">
                      <template #icon><IconLink /></template>
                      血缘
                    </a-button>
                  </a-space>
                </template>
              </a-table-column>
            </template>
          </a-table>
        </a-card>
      </a-col>
    </a-row>

    <!-- 详情抽屉 -->
    <a-drawer
      v-model:visible="detailVisible"
      :title="detailData?.name"
      :width="560"
      :footer="false"
    >
      <template v-if="detailData">
        <a-descriptions :column="1" bordered size="small">
          <a-descriptions-item label="类型">
            <a-tag :color="getElementColor(detailData.elementType)">
              {{ getElementLabel(detailData.elementType) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="编码">
            <code>{{ detailData.code }}</code>
          </a-descriptions-item>
          <a-descriptions-item label="业务归属">{{ detailData.businessBelonging }}</a-descriptions-item>
          <a-descriptions-item label="敏感级别">
            <a-tag v-if="detailData.defaultSensitivity" :color="getSensitivityColor(detailData.defaultSensitivity)">
              {{ detailData.defaultSensitivity }}
            </a-tag>
            <a-tag v-else color="gray">未分级</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="数据标准">
            <a-tag v-if="detailData.standardCode" color="arcoblue">{{ detailData.standardCode }}</a-tag>
            <span v-else class="muted">无关联标准</span>
          </a-descriptions-item>
          <a-descriptions-item label="Owner">{{ detailData.ownerName }}</a-descriptions-item>
          <a-descriptions-item label="描述">{{ detailData.description }}</a-descriptions-item>
        </a-descriptions>

        <a-divider>操作</a-divider>
        <a-space>
          <a-button type="primary" @click="goLineage(detailData)">
            <template #icon><IconLink /></template>
            查看血缘
          </a-button>
          <a-button @click="applyPermission(detailData)">
            <template #icon><IconSafe /></template>
            申请权限
          </a-button>
          <a-button @click="addToFavorites(detailData)">
            <template #icon><IconStar /></template>
            关注
          </a-button>
        </a-space>
      </template>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
/**
 * 要素字典 - 统一入口(P1-A)
 *
 * 文档依据:
 *   §2.3 数据要素:指标 / 变量 / 特征 三类
 *   §7.1 风控建模师常用入口:指标字典、变量字典、特征字典
 *   §11.1 搜索框类型下拉:指标 / 变量 / 特征
 *
 * 数据源:TaxonomyStore(节点类型为 element 的统一要素)
 */
import { ref, computed, h } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { TaxonomyStore, type TaxonomyNode } from '@/mock/shared/classification-taxonomy'
import { FavoriteStore } from '@/mock/shared/favorite-directory'
import {
  IconDownload,
  IconEye,
  IconLink,
  IconSafe,
  IconStar
} from '@arco-design/web-vue/es/icon'

const router = useRouter()

// === 状态 ===
const searchKeyword = ref('')
const elementType = ref<'all' | 'metric' | 'variable' | 'feature'>('all')
const filterDomain = ref<string | undefined>(undefined)
const filterSensitivity = ref<string | undefined>(undefined)
const selectedKeys = ref<string[]>([])
const detailVisible = ref(false)
const detailData = ref<TaxonomyNode | null>(null)

// === 要素分类推断(基于要素名/编码启发式)===
/**
 * 从要素名/编码启发式判断类型:
 *   - 指标:含 率/额/数/活跃/DAU/MAU/转化 等关键字
 *   - 变量:含 年龄/收入/性别/逾期天 等关键字
 *   - 特征:含 频次/设备数/活跃 X 天/近 X 天 等关键字
 *
 * 实际项目应由数据库字段 `elementType` 标注
 */
function inferElementType(node: TaxonomyNode): 'metric' | 'variable' | 'feature' {
  const text = (node.name + node.code).toLowerCase()
  if (/近\d+天|\d+天|频次|设备|访问/.test(text)) return 'feature'
  if (/年龄|收入|性别|逾期天|额度|余额/.test(text)) return 'variable'
  return 'metric'
}

// === 增强节点(加 elementType)===
const allElements = computed(() => {
  return TaxonomyStore.byNodeType('element').map(n => ({
    ...n,
    elementType: inferElementType(n)
  }))
})

// === 统计 ===
const stats = computed(() => {
  const all = allElements.value
  return {
    total: all.length,
    metric: all.filter(e => e.elementType === 'metric').length,
    variable: all.filter(e => e.elementType === 'variable').length,
    feature: all.filter(e => e.elementType === 'feature').length,
    graded: all.filter(e => e.defaultSensitivity).length,
    gradedPercent: Math.round((all.filter(e => e.defaultSensitivity).length / all.length) * 100)
  }
})

// === 业务域(去重)===
const domains = computed(() => {
  return Array.from(new Set(allElements.value.map(e => e.businessBelonging)))
})

// === 过滤 ===
const filteredElements = computed(() => {
  let result = allElements.value

  // 类型筛选
  if (elementType.value !== 'all') {
    result = result.filter(e => e.elementType === elementType.value)
  }

  // 业务域
  if (filterDomain.value) {
    result = result.filter(e => e.businessBelonging === filterDomain.value)
  }

  // 敏感级别
  if (filterSensitivity.value) {
    if (filterSensitivity.value === 'NONE') {
      result = result.filter(e => !e.defaultSensitivity)
    } else {
      result = result.filter(e => e.defaultSensitivity === filterSensitivity.value)
    }
  }

  // 关键词
  const kw = searchKeyword.value.trim().toLowerCase()
  if (kw) {
    result = result.filter(e =>
      e.name.toLowerCase().includes(kw) ||
      e.code.toLowerCase().includes(kw) ||
      e.description.toLowerCase().includes(kw)
    )
  }

  return result
})

// === 左侧树(基于 taxonomy 的 7 大域)===
const treeData = computed(() => {
  const domains = TaxonomyStore.byLevel(1)
  return domains.map(d => {
    const children = TaxonomyStore.byParent(d.code).filter(c => c.nodeType === 'entity')
    return {
      key: d.code,
      title: d.name,
      tag: String(TaxonomyStore.byParent(d.code).filter(c => c.nodeType === 'element').length),
      tagColor: 'arcoblue',
      children: children.length > 0 ? children.map(c => {
        const elements = TaxonomyStore.byParent(c.code).filter(n => n.nodeType === 'element')
        return {
          key: c.code,
          title: c.name,
          tag: String(elements.length),
          tagColor: 'green',
          children: elements.length > 0 ? elements.map(e => ({
            key: e.code,
            title: e.name,
            tag: e.elementType,
            tagColor: getElementColor(e.elementType)
          })) : undefined
        }
      }) : undefined
    }
  })
})

// === 方法 ===
const handleSearch = () => {
  // 触发 computed 重算
}

const resetFilter = () => {
  searchKeyword.value = ''
  filterDomain.value = undefined
  filterSensitivity.value = undefined
  elementType.value = 'all'
  selectedKeys.value = []
}

const onTreeSelect = (keys: string[]) => {
  // 选中节点的元素过滤
  if (keys.length > 0) {
    const code = keys[0]
    const node = TaxonomyStore.byCode(code)
    if (node && node.nodeType === 'element') {
      searchKeyword.value = node.name
    } else if (node && node.level === 2) {
      // 选中 L2 实体时,显示其所有要素
      filterDomain.value = node.businessBelonging
    } else if (node && node.level === 1) {
      filterDomain.value = node.businessBelonging
    }
  }
}

const handleRowClick = (record: TaxonomyNode & { elementType: string }) => {
  viewDetail(record)
}

const viewDetail = (record: TaxonomyNode & { elementType: string }) => {
  detailData.value = record
  detailVisible.value = true
}

const goLineage = (record: TaxonomyNode) => {
  router.push({ path: '/home/discovery/lineage', query: { table: record.code } })
}

const applyPermission = (record: TaxonomyNode) => {
  // 跳转权限申请(简化)
  Message.info(`申请 ${record.name} 的字段权限`)
  router.push('/home/management/permission')
}

const addToFavorites = (record: TaxonomyNode) => {
  const result = FavoriteStore.toggle({
    userId: 'user-yunying',
    userName: '王运营',
    resourceType: record.elementType || 'metric',
    resourceId: record.code,
    resourceName: record.name,
    resourcePath: '/home/discovery/elements-dictionary',
    description: record.description,
    owner: record.ownerName,
    domain: record.businessBelonging,
    group: 'personal',
    tags: ['要素'],
    notification: 'on_change'
  })
  Message.success(result?.added ? `已关注 ${record.name}` : `已取消关注 ${record.name}`)
}

const exportData = () => {
  const csv = [
    ['类型', '编码', '名称', '业务域', '敏感级别', 'Owner', '描述'].join(','),
    ...filteredElements.value.map(e => [
      getElementLabel(e.elementType),
      e.code,
      e.name,
      e.businessBelonging,
      e.defaultSensitivity || '未分级',
      e.ownerName,
      `"${e.description.replace(/"/g, '""')}"`
    ].join(','))
  ].join('\n')

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `要素字典_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
  Message.success('已导出 CSV')
}

// === 工具 ===
function getElementColor(type: string): string {
  switch (type) {
    case 'metric': return '#00B42A'
    case 'variable': return '#722ED1'
    case 'feature': return '#FF7D00'
    default: return '#86909C'
  }
}

function getElementLabel(type: string): string {
  switch (type) {
    case 'metric': return '指标'
    case 'variable': return '变量'
    case 'feature': return '特征'
    default: return '其他'
  }
}

function getSensitivityColor(level: string): string {
  switch (level) {
    case 'L1': return 'green'
    case 'L2': return 'orange'
    case 'L3': return 'red'
    default: return 'gray'
  }
}
</script>

<style scoped>
.elements-dictionary {
  padding: 16px;
}
.page-header {
  margin-bottom: 12px;
  background: #fff;
}
.header-subtitle {
  color: var(--color-text-3);
  font-size: 13px;
}
.filter-card {
  margin-bottom: 16px;
}
.muted {
  color: var(--color-text-4);
  font-size: 12px;
}
code {
  background: var(--color-fill-2);
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 12px;
}
</style>