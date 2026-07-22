<template>
  <div class="asset-detail-page">
    <a-page-header
      :title="assetData?.assetName || '资产详情'"
      :subtitle="assetData?.description || '数据资产详情'"
      :show-back="true"
      @back="onBack"
    >
      <template #extra>
        <a-space>
          <a-button
            v-if="assetData && canOnShelf(assetData)"
            type="primary"
            size="small"
            status="success"
            @click="onShelf(assetData)"
          >
            上架
          </a-button>
          <a-button
            v-if="assetData && canOffShelf(assetData)"
            type="primary"
            size="small"
            status="warning"
            @click="offShelf(assetData)"
          >
            下架
          </a-button>
          <a-button type="outline" size="small" @click="syncOne" :disabled="!assetData">
            <template #icon><IconSync /></template>
            同步
          </a-button>
          <a-button type="outline" size="small" @click="toggleFavorite">
            <template #icon>
              <IconStar :fill="isFavorite ? '#ffb400' : 'none'" />
            </template>
            {{ isFavorite ? '已收藏' : '收藏' }}
          </a-button>
          <a-button type="primary" size="small" @click="applyPermission">
            <template #icon><IconSafe /></template>
            申请权限
          </a-button>
        </a-space>
      </template>
    </a-page-header>

    <div v-if="assetData" class="asset-content">
      <!-- 基本信息 -->
      <a-card title="基本信息" :bordered="false" class="info-card">
        <a-descriptions :column="3">
          <a-descriptions-item label="资产名称">{{ assetData.assetName }}</a-descriptions-item>
          <a-descriptions-item label="集群类型">
            <a-tag color="arcoblue">{{ assetData.clusterType }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="集群环境">
            {{ assetData.clusterEnv === 'compute' ? '计算集群' : '分析集群' }}
          </a-descriptions-item>
          <a-descriptions-item label="HIVE 库">{{ assetData.hiveDatabase }}</a-descriptions-item>
          <a-descriptions-item label="HIVE 表名" :span="2">
            <span class="hive-table">{{ assetData.hiveDatabase }}.{{ assetData.hiveTableName }}</span>
          </a-descriptions-item>
          <a-descriptions-item label="业务域">{{ assetData.category }}</a-descriptions-item>
          <a-descriptions-item label="负责人">{{ assetData.owner }}</a-descriptions-item>
          <a-descriptions-item label="发布人">{{ assetData.publisher }}</a-descriptions-item>
          <a-descriptions-item label="状态">
            <a-tag :color="statusColor[assetData.status]">
              {{ statusLabel[assetData.status] }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="注册时间">{{ formatDateTime(assetData.registerTime) }}</a-descriptions-item>
          <a-descriptions-item label="上架时间">{{ formatDateTime(assetData.onShelfTime) }}</a-descriptions-item>
          <a-descriptions-item label="下架时间">{{ formatDateTime(assetData.offShelfTime) }}</a-descriptions-item>
          <a-descriptions-item label="最近同步" :span="2">{{ formatDateTime(assetData.lastSyncTime) }}</a-descriptions-item>
          <a-descriptions-item label="描述" :span="3">{{ assetData.description || '—' }}</a-descriptions-item>
        </a-descriptions>
      </a-card>

      <!-- 详情 Tab -->
      <a-card :bordered="false" class="tab-card">
        <a-tabs v-model:active-key="activeTab">
          <!-- 表结构 / 字段信息 -->
          <a-tab-pane v-if="fields.length" key="structure" title="表结构">
            <a-table
              :data="fields"
              :pagination="false"
              :bordered="false"
              :scroll="{ x: '100%' }"
            >
              <template #columns>
                <a-table-column title="字段名" data-index="name">
                  <template #cell="{ record }">
                    <span :class="{ 'relation-field': isRelationField(record.name) }">
                      {{ record.name }}
                    </span>
                  </template>
                </a-table-column>
                <a-table-column title="类型" data-index="type" :width="160" />
                <a-table-column title="是否主键" :width="100">
                  <template #cell="{ record }">
                    <a-tag v-if="record.isPrimary" color="arcoblue" size="small">主键</a-tag>
                    <span v-else>-</span>
                  </template>
                </a-table-column>
                <a-table-column title="描述" data-index="description" />
              </template>
            </a-table>
          </a-tab-pane>

          <!-- 数据预览 -->
          <a-tab-pane v-if="fields.length" key="preview" title="数据预览">
            <a-table
              :data="sampleData"
              :pagination="false"
              :bordered="false"
              :scroll="{ x: '100%' }"
            >
              <template #columns>
                <a-table-column
                  v-for="f in fields"
                  :key="f.name"
                  :title="f.name"
                  :data-index="f.name"
                />
              </template>
            </a-table>
          </a-tab-pane>

          <!-- 关联关系 -->
          <a-tab-pane key="relations" title="关联关系">
            <div class="relation-page">
              <a-row :gutter="16" class="relation-overview">
                <a-col :span="6">
                  <a-card>
                    <a-statistic title="关联表" :value="relations.length" :value-style="{ color: '#165DFF' }">
                      <template #suffix><span style="font-size: 13px; color: #86909c">张表</span></template>
                    </a-statistic>
                  </a-card>
                </a-col>
                <a-col :span="6">
                  <a-card>
                    <a-statistic title="关联 API" :value="5" :value-style="{ color: '#722ED1' }">
                      <template #suffix><span style="font-size: 13px; color: #86909c">个</span></template>
                    </a-statistic>
                  </a-card>
                </a-col>
                <a-col :span="6">
                  <a-card>
                    <a-statistic title="关联指标" :value="8" :value-style="{ color: '#00B42A' }">
                      <template #suffix><span style="font-size: 13px; color: #86909c">个</span></template>
                    </a-statistic>
                  </a-card>
                </a-col>
                <a-col :span="6">
                  <a-card>
                    <a-statistic title="关联报表" :value="3" :value-style="{ color: '#FA8C16' }">
                      <template #suffix><span style="font-size: 13px; color: #86909c">张</span></template>
                    </a-statistic>
                  </a-card>
                </a-col>
              </a-row>

              <a-table
                :data="relations"
                :pagination="false"
                :bordered="false"
                row-key="id"
              >
                <template #columns>
                  <a-table-column title="关联类型" :width="120">
                    <template #cell="{ record }">
                      <a-tag :color="relationTypeColor[record.relationType]">{{ record.relationType }}</a-tag>
                    </template>
                  </a-table-column>
                  <a-table-column title="关联对象" :width="220">
                    <template #cell="{ record }">
                      <span class="link-name" @click="gotoRelationAsset(record)">{{ record.targetName }}</span>
                      <div class="hive-path" v-if="record.targetHivePath">{{ record.targetHivePath }}</div>
                    </template>
                  </a-table-column>
                  <a-table-column title="所属系统/模块" :width="140">
                    <template #cell="{ record }">
                      <a-tag size="small">{{ record.targetSystem }}</a-tag>
                    </template>
                  </a-table-column>
                  <a-table-column title="关联字段" :width="180">
                    <template #cell="{ record }">
                      <span class="relation-field">{{ record.relationField }}</span>
                    </template>
                  </a-table-column>
                  <a-table-column title="关联类型" :width="100">
                    <template #cell="{ record }">
                      <a-tag>{{ record.cardinality }}</a-tag>
                    </template>
                  </a-table-column>
                  <a-table-column title="关联说明">{{ record.description }}</a-table-column>
                </template>
              </a-table>
            </div>
          </a-tab-pane>

          <!-- 血缘关系 -->
          <a-tab-pane key="lineage" title="血缘关系">
            <div class="lineage-page">
              <!-- 概览统计 -->
              <a-row :gutter="16" class="lineage-overview">
                <a-col :span="8">
                  <a-statistic title="上游表" :value="upstreamLineage.length" :value-style="{ color: '#165DFF' }" />
                </a-col>
                <a-col :span="8">
                  <a-statistic title="下游表" :value="downstreamLineage.length" :value-style="{ color: '#00B42A' }" />
                </a-col>
                <a-col :span="8">
                  <a-statistic title="血缘深度" :value="lineageDepth" :value-style="{ color: '#722ED1' }">
                    <template #suffix><span style="font-size: 13px; color: #86909c">层</span></template>
                  </a-statistic>
                </a-col>
              </a-row>

              <a-tabs default-active-key="list" type="rounded">
                <a-tab-pane key="list" title="列表视图">
                  <div class="lineage-section">
                    <div class="lineage-section-title upstream">
                      <IconArrowUp style="color: #165dff" />
                      <span>上游资产（数据来源）</span>
                      <a-tag color="arcoblue" size="small">{{ upstreamLineage.length }} 条</a-tag>
                    </div>
                    <a-table :data="upstreamLineage" :pagination="false" :bordered="false">
                      <template #columns>
                        <a-table-column title="表名" :width="220">
                          <template #cell="{ record }">
                            <span class="link-name" @click="gotoLineageAsset(record)">{{ record.name }}</span>
                            <div class="hive-path">{{ record.hivePath }}</div>
                          </template>
                        </a-table-column>
                        <a-table-column title="所属系统" :width="160">
                          <template #cell="{ record }">
                            <a-tag size="small">{{ record.system }}</a-tag>
                          </template>
                        </a-table-column>
                        <a-table-column title="关系类型" :width="100">
                          <template #cell="{ record }">
                            <a-tag :color="relationTypeColor[record.relationType]">{{ record.relationType }}</a-tag>
                          </template>
                        </a-table-column>
                        <a-table-column title="负责人" data-index="owner" :width="100" />
                        <a-table-column title="转换说明" data-index="description" />
                      </template>
                    </a-table>
                  </div>

                  <a-divider />

                  <div class="lineage-section">
                    <div class="lineage-section-title downstream">
                      <IconArrowDown style="color: #00b42a" />
                      <span>下游资产（数据去向）</span>
                      <a-tag color="arcoblue" size="small">{{ downstreamLineage.length }} 条</a-tag>
                    </div>
                    <a-table :data="downstreamLineage" :pagination="false" :bordered="false">
                      <template #columns>
                        <a-table-column title="表名" :width="220">
                          <template #cell="{ record }">
                            <span class="link-name" @click="gotoLineageAsset(record)">{{ record.name }}</span>
                            <div class="hive-path">{{ record.hivePath }}</div>
                          </template>
                        </a-table-column>
                        <a-table-column title="所属系统" :width="160">
                          <template #cell="{ record }">
                            <a-tag size="small">{{ record.system }}</a-tag>
                          </template>
                        </a-table-column>
                        <a-table-column title="关系类型" :width="100">
                          <template #cell="{ record }">
                            <a-tag :color="relationTypeColor[record.relationType]">{{ record.relationType }}</a-tag>
                          </template>
                        </a-table-column>
                        <a-table-column title="负责人" data-index="owner" :width="100" />
                        <a-table-column title="转换说明" data-index="description" />
                      </template>
                    </a-table>
                  </div>
                </a-tab-pane>

                <a-tab-pane key="graph" title="可视化视图">
                  <a-card>
                    <LineageGraph
                      v-if="assetData"
                      :table-name="assetData.assetName"
                      :layers="1"
                      style="height: 600px; width: 100%"
                    />
                  </a-card>
                </a-tab-pane>
              </a-tabs>
            </div>
          </a-tab-pane>

          <!-- 使用说明 -->
          <a-tab-pane key="usage" title="使用说明">
            <a-alert type="info">
              <template #title>
                <span style="font-size: 16px; font-weight: 500">使用说明</span>
              </template>
              <div style="margin-top: 12px">
                <p>1. 资产名称：<b>{{ assetData.assetName }}</b>，集群类型 {{ assetData.clusterType }}（{{ assetData.clusterEnv === 'compute' ? '计算集群' : '分析集群' }}）。</p>
                <p>2. HIVE 路径：<span class="hive-table">{{ assetData.hiveDatabase }}.{{ assetData.hiveTableName }}</span></p>
                <p>3. 业务域：{{ assetData.category }}，负责人：{{ assetData.owner }}。</p>
                <p>4. 状态：{{ statusLabel[assetData.status] }}，最近同步：{{ formatDateTime(assetData.lastSyncTime) }}。</p>
                <p>5. 资产描述：{{ assetData.description || '暂无' }}</p>
              </div>
            </a-alert>
          </a-tab-pane>

          <!-- 加工逻辑 -->
          <a-tab-pane key="logic" title="加工逻辑">
            <div class="logic-content" style="white-space: pre-wrap; line-height: 1.6; color: var(--color-text-2)">
              {{ processingLogic }}
            </div>

            <a-divider v-if="sqlSnippet" />

            <div v-if="sqlSnippet" class="sql-section">
              <div style="font-size: 14px; font-weight: 500; margin-bottom: 12px">SQL 示例</div>
              <div class="sql-code-block">
                <pre><code>{{ sqlSnippet }}</code></pre>
              </div>
            </div>
          </a-tab-pane>

          <!-- 上下架记录 -->
          <a-tab-pane key="shelf-history" title="上下架记录">
            <a-table
              :data="shelfHistory"
              :pagination="false"
              :bordered="false"
            >
              <template #columns>
                <a-table-column title="动作" data-index="action" :width="120">
                  <template #cell="{ record }">
                    <a-tag :color="record.action === '上架' ? 'green' : record.action === '下架' ? 'orange' : 'gray'">
                      {{ record.action }}
                    </a-tag>
                  </template>
                </a-table-column>
                <a-table-column title="操作人" data-index="operator" :width="140" />
                <a-table-column title="操作时间" data-index="actionTime" :width="200">
                  <template #cell="{ record }">{{ formatDateTime(record.actionTime) }}</template>
                </a-table-column>
                <a-table-column title="备注" data-index="remark" />
              </template>
            </a-table>
          </a-tab-pane>

          <!-- 版本信息 -->
          <a-tab-pane key="versions" title="版本信息">
            <a-table
              :data="versions"
              :pagination="false"
              :bordered="false"
            >
              <template #columns>
                <a-table-column title="版本号" data-index="version" :width="120" />
                <a-table-column title="变更时间" data-index="createTime" :width="200">
                  <template #cell="{ record }">{{ formatDateTime(record.createTime) }}</template>
                </a-table-column>
                <a-table-column title="变更人" data-index="creator" :width="140" />
                <a-table-column title="变更说明" data-index="changeDescription" />
              </template>
            </a-table>
          </a-tab-pane>
        </a-tabs>
      </a-card>
    </div>

    <div v-else class="empty-state">
      <a-empty description="未找到对应资产" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Message, Modal } from '@arco-design/web-vue'
import {
  IconStar,
  IconSafe,
  IconSync,
  IconArrowUp,
  IconArrowDown
} from '@arco-design/web-vue/es/icon'
import { LineageGraph } from '@app/lineage-graph'
import { mockTables } from '@/mock/data-map'
import { listingStore } from '@/mock/listing-store'
import { formatDateTime } from '@/utils/dateUtils'

// 关联/血缘关系类型颜色映射
const relationTypeColor: Record<string, string> = {
  '上游ETL': 'arcoblue',
  '下游聚合': 'green',
  '关联表': 'purple',
  '关联API': 'orange',
  '关联指标': 'cyan',
  '关联报表': 'pinkpurple'
}

type ShelfStatus = 'active' | 'onShelf' | 'offShelf' | 'inactive' | 'archived'

interface AssetDetail {
  assetName: string
  description: string
  category: string
  owner: string
  publisher: string
  status: ShelfStatus
  registerTime: string
  onShelfTime?: string
  offShelfTime?: string
  clusterType: string
  clusterEnv: 'compute' | 'analysis'
  hiveDatabase: string
  hiveTableName: string
  lastSyncTime?: string
  fields: { name: string; type: string; description: string; isPrimary?: boolean }[]
}

interface ShelfHistoryItem {
  action: '上架' | '下架' | '归档' | '激活' | '编辑'
  operator: string
  actionTime: string
  remark?: string
}

interface VersionItem {
  version: string
  createTime: string
  creator: string
  changeDescription: string
}

const statusLabel: Record<ShelfStatus, string> = {
  active: '活跃',
  onShelf: '已上架',
  offShelf: '已下架',
  inactive: '未激活',
  archived: '已归档'
}
const statusColor: Record<ShelfStatus, string> = {
  active: 'green',
  onShelf: 'green',
  offShelf: 'orange',
  inactive: 'gray',
  archived: 'gray'
}

const route = useRoute()
const router = useRouter()

const assetData = ref<AssetDetail | null>(null)
const isFavorite = ref(false)
const activeTab = ref('structure')

// 默认字段模板（mockTables/metrics 本身没有 fields，按 HIVE 资产通用结构生成）
const defaultFields = (tableName: string) => {
  const cleaned = tableName.replace(/^t_/, '').replace(/^metric_/, '')
  return [
    { name: 'id', type: 'bigint', description: '主键 ID', isPrimary: true },
    { name: `${cleaned}_code`, type: 'string', description: '业务编码' },
    { name: 'create_time', type: 'timestamp', description: '创建时间' },
    { name: 'update_time', type: 'timestamp', description: '更新时间' },
    { name: 'owner', type: 'string', description: '负责人' },
    { name: 'status', type: 'string', description: '状态' },
    { name: 'description', type: 'string', description: '描述' }
  ]
}

const parseHivePath = (fullPath: string) => {
  if (!fullPath) return { database: 'default', tableName: fullPath || '' }
  const segs = fullPath.split('.')
  if (segs.length >= 3) return { database: segs[segs.length - 2], tableName: segs[segs.length - 1] }
  return { database: segs[0] || 'default', tableName: segs[segs.length - 1] }
}

const findAsset = (name: string): AssetDetail | null => {
  const decoded = decodeURIComponent(name)

  // 1. 查 mockTables
  const t = mockTables.find(x => x.tableName === decoded)
  if (t) {
    const parsed = parseHivePath(t.computeClusterTable)
    return {
      assetName: t.tableName,
      description: t.description,
      category: t.category,
      owner: t.owner,
      publisher: t.publisher,
      status: t.status,
      registerTime: t.registerTime,
      onShelfTime: t.onShelfTime,
      offShelfTime: t.offShelfTime,
      clusterType: 'HIVE',
      clusterEnv: 'compute',
      hiveDatabase: parsed.database,
      hiveTableName: parsed.tableName,
      lastSyncTime: t.onShelfTime,
      fields: defaultFields(t.tableName)
    }
  }

  // 2. 查 listingStore.metrics
  const m = listingStore.metrics.find(x => x.metricName === decoded || x.metricCode === decoded)
  if (m) {
    return {
      assetName: m.metricName,
      description: m.description,
      category: m.category,
      owner: m.owner,
      publisher: m.publisher,
      status: m.status,
      registerTime: m.registerTime,
      onShelfTime: m.onShelfTime,
      offShelfTime: m.offShelfTime,
      clusterType: 'HIVE',
      clusterEnv: 'analysis',
      hiveDatabase: `metric_${m.category}`,
      hiveTableName: m.metricCode,
      lastSyncTime: m.onShelfTime,
      fields: [
        { name: 'metric_code', type: 'string', description: '指标编码', isPrimary: true },
        { name: 'metric_value', type: 'decimal(20,4)', description: '指标值' },
        { name: 'stat_date', type: 'string', description: '统计日期 (yyyy-MM-dd)' },
        { name: 'dim_key', type: 'string', description: '维度键' },
        { name: 'owner', type: 'string', description: '负责人' },
        { name: 'create_time', type: 'timestamp', description: '创建时间' }
      ]
    }
  }

  return null
}

const fields = computed(() => assetData.value?.fields || [])

const sampleData = computed(() => {
  const fs = fields.value
  if (!fs.length) return []
  return Array.from({ length: 3 }).map((_, i) => {
    const row: Record<string, string> = {}
    fs.forEach(f => {
      if (f.type.includes('timestamp') || f.name.includes('time')) {
        row[f.name] = '2026-07-21 10:00:00'
      } else if (f.type.includes('decimal') || f.type.includes('bigint') || f.type.includes('int')) {
        row[f.name] = String((i + 1) * 1000 + i)
      } else {
        row[f.name] = `${f.name}_${i + 1}`
      }
    })
    return row
  })
})

const shelfHistory = computed<ShelfHistoryItem[]>(() => {
  if (!assetData.value) return []
  const a = assetData.value
  const list: ShelfHistoryItem[] = []
  if (a.onShelfTime) {
    list.push({ action: '上架', operator: a.publisher, actionTime: a.onShelfTime, remark: '资产上架' })
  }
  if (a.offShelfTime) {
    list.push({ action: '下架', operator: a.owner, actionTime: a.offShelfTime, remark: '资产下架' })
  }
  if (a.registerTime) {
    list.push({ action: '编辑', operator: a.owner, actionTime: a.registerTime, remark: '资产注册' })
  }
  if (a.lastSyncTime) {
    list.push({ action: '编辑', operator: a.owner, actionTime: a.lastSyncTime, remark: '元数据同步' })
  }
  return list.sort((x, y) => (y.actionTime || '').localeCompare(x.actionTime || ''))
})

const versions = computed<VersionItem[]>(() => {
  if (!assetData.value) return []
  return [
    {
      version: 'v1.0.0',
      createTime: assetData.value.registerTime,
      creator: assetData.value.owner,
      changeDescription: '资产初始版本'
    },
    {
      version: 'v1.1.0',
      createTime: assetData.value.onShelfTime || assetData.value.registerTime,
      creator: assetData.value.publisher,
      changeDescription: '资产上架发布'
    }
  ]
})

const processingLogic = computed(() => {
  if (!assetData.value) return '暂无加工逻辑说明'
  const a = assetData.value
  return `1. 数据来源：
   - ${a.clusterType} ${a.clusterEnv === 'compute' ? '计算集群' : '分析集群'} ${a.hiveDatabase}.${a.hiveTableName}
   - 业务域：${a.category}

2. 清洗规则：
   - 主键 ${a.fields[0]?.name || 'id'} 非空校验
   - 标准化时间字段
   - 负责人字段必填校验

3. 同步策略：
   - 每日全量覆盖
   - 同步至 ${a.clusterType} 计算/分析集群`
})

const sqlSnippet = computed(() => {
  if (!assetData.value) return ''
  const a = assetData.value
  return `-- 资产 ${a.assetName} 数据加工示例
INSERT OVERWRITE TABLE ${a.hiveDatabase}.${a.hiveTableName}
SELECT
  id,
  owner,
  status,
  description,
  current_timestamp() AS update_time
FROM
  ods.${a.hiveTableName}_ods
WHERE
  dt = '\${biz_date}'
  AND id IS NOT NULL;`
})

const isRelationField = (fieldName: string) => {
  const relationFieldNames = ['id', 'user_id', 'product_id', 'metric_code', 'dim_key']
  return relationFieldNames.includes(fieldName.toLowerCase())
}

// ============ 关联关系 mock ============
interface RelationRow {
  id: string
  relationType: '关联表' | '关联API' | '关联指标' | '关联报表'
  targetName: string
  targetHivePath?: string
  targetSystem: string
  relationField: string
  cardinality: '1:1' | '1:N' | 'N:1' | 'N:N'
  description: string
}

const relations = computed<RelationRow[]>(() => {
  if (!assetData.value) return []
  const a = assetData.value
  // 根据资产类型返回不同的关联关系
  if (a.recordType) {
    // 表格型资产
    return [
      {
        id: 'r1',
        relationType: '关联表',
        targetName: 't_customer_360',
        targetHivePath: 'mysql.cdp.t_customer_360',
        targetSystem: '核心系统',
        relationField: 'id = user_id',
        cardinality: 'N:1',
        description: '用户主数据关联，提供客户基础信息'
      },
      {
        id: 'r2',
        relationType: '关联表',
        targetName: 't_loan_contract',
        targetHivePath: 'mysql.core.t_loan_contract',
        targetSystem: '核心系统',
        relationField: 'id = apply_id',
        cardinality: '1:N',
        description: '贷款合同主表，记录合同详情'
      },
      {
        id: 'r3',
        relationType: '关联API',
        targetName: '资产查询服务',
        targetSystem: '数据服务',
        relationField: 'id',
        cardinality: '1:1',
        description: '提供 RESTful 查询接口'
      },
      {
        id: 'r4',
        relationType: '关联指标',
        targetName: '资产活跃度',
        targetSystem: '数据要素',
        relationField: 'id',
        cardinality: '1:N',
        description: '衍生指标：用户行为活跃程度'
      },
      {
        id: 'r5',
        relationType: '关联报表',
        targetName: '资产运营周报',
        targetSystem: '数据应用',
        relationField: 'id',
        cardinality: 'N:N',
        description: '运营周报的数据源'
      }
    ]
  }
  return []
})

const gotoRelationAsset = (record: RelationRow) => {
  if (record.relationType === '关联表') {
    router.push(`/asset-management/listing-management/asset-management/detail/${encodeURIComponent(record.targetName)}`)
  } else {
    Message.info(`打开「${record.targetName}」详情页（${record.relationType}）`)
  }
}

// ============ 血缘关系 mock ============
interface LineageRow {
  id: string
  name: string
  hivePath: string
  system: string
  relationType: '上游ETL' | '下游聚合'
  owner: string
  description: string
}

const upstreamLineage = computed<LineageRow[]>(() => {
  if (!assetData.value) return []
  return [
    {
      id: 'up1',
      name: `ods_${assetData.value.hiveTableName}`,
      hivePath: `ods.ods_${assetData.value.hiveTableName}`,
      system: 'HIVE 数仓',
      relationType: '上游ETL',
      owner: '数据工程组',
      description: '数据原始层 ODS，每天全量同步'
    },
    {
      id: 'up2',
      name: `dwd_${assetData.value.hiveTableName}_clean`,
      hivePath: `dwd.dwd_${assetData.value.hiveTableName}_clean`,
      system: 'HIVE 数仓',
      relationType: '上游ETL',
      owner: '数据工程组',
      description: '数据清洗层 DWD，去重并校验主键'
    }
  ]
})

const downstreamLineage = computed<LineageRow[]>(() => {
  if (!assetData.value) return []
  return [
    {
      id: 'down1',
      name: `dws_${assetData.value.hiveTableName}_agg`,
      hivePath: `dws.dws_${assetData.value.hiveTableName}_agg`,
      system: 'HIVE 数仓',
      relationType: '下游聚合',
      owner: '数据工程组',
      description: '数据汇总层 DWS，提供聚合视图'
    },
    {
      id: 'down2',
      name: `ads_${assetData.value.hiveTableName}_report`,
      hivePath: `ads.ads_${assetData.value.hiveTableName}_report`,
      system: 'HIVE 数仓',
      relationType: '下游聚合',
      owner: '数据应用组',
      description: '数据应用层 ADS，报表数据源'
    }
  ]
})

const lineageDepth = computed(() => {
  // 上游 + 当前 + 下游
  return upstreamLineage.value.length > 0 || downstreamLineage.value.length > 0 ? 3 : 0
})

const gotoLineageAsset = (record: LineageRow) => {
  router.push(`/asset-management/listing-management/asset-management/detail/${encodeURIComponent(record.name)}`)
}

// 操作
const canOnShelf = (a: AssetDetail) => a.status === 'offShelf' || a.status === 'archived' || a.status === 'inactive'
const canOffShelf = (a: AssetDetail) => a.status === 'onShelf' || a.status === 'active'

const onShelf = (a: AssetDetail) => {
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ')
  a.status = 'onShelf'
  a.onShelfTime = now
  a.offShelfTime = undefined
  Message.success(`${a.assetName} 已上架`)
}
const offShelf = (a: AssetDetail) => {
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ')
  a.status = 'offShelf'
  a.offShelfTime = now
  Message.success(`${a.assetName} 已下架`)
}
const syncOne = () => {
  if (!assetData.value) return
  Message.loading({ content: `正在同步 ${assetData.value.assetName}…`, duration: 600 })
  setTimeout(() => {
    assetData.value!.lastSyncTime = new Date().toISOString().slice(0, 19).replace('T', ' ')
    Message.success(`${assetData.value!.assetName} 同步成功`)
  }, 700)
}

const toggleFavorite = () => {
  isFavorite.value = !isFavorite.value
  Message.success(isFavorite.value ? '已收藏' : '已取消收藏')
}

const applyPermission = () => {
  if (!assetData.value) return
  Modal.confirm({
    title: '申请权限',
    content: `确定要申请资产 "${assetData.value.assetName}" 的访问权限吗？申请将发送至数据负责人 ${assetData.value.owner}。`,
    okText: '确定申请',
    cancelText: '取消',
    onOk: async () => {
      await new Promise(r => setTimeout(r, 600))
      Message.success('权限申请已提交')
    }
  })
}

const onBack = () => {
  if (window.history.length > 1) router.back()
  else router.push('/asset-management/listing-management/asset-management')
}

// 监听路由参数变化
watch(() => route.params.name, (name) => {
  if (typeof name === 'string') {
    assetData.value = findAsset(name)
    if (!assetData.value) {
      Message.error('未找到对应资产')
    }
  }
}, { immediate: true })

onMounted(() => {
  // watch 已处理
})
</script>

<style scoped>
.asset-detail-page {
  padding: 16px 24px;
}

.asset-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-card,
.tab-card {
  margin-bottom: 0;
}

.hive-table {
  font-family: 'JetBrains Mono', Consolas, Menlo, monospace;
  font-size: 12px;
  color: #165dff;
  background: #f0f7ff;
  padding: 2px 6px;
  border-radius: 3px;
}

.relation-field {
  color: #1890ff;
  text-decoration: underline;
  cursor: pointer;
}

.sql-code-block {
  background-color: #f5f7fa;
  padding: 16px;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Consolas', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.5;
  color: #333;
  overflow-x: auto;
  border: 1px solid var(--color-border-2);
}

.sql-code-block pre {
  margin: 0;
  padding: 0;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
}

.logic-content {
  font-size: 13px;
}

/* 关联关系 Tab */
.relation-overview,
.lineage-overview {
  margin-bottom: 16px;
  padding: 12px 0;
}

.link-name {
  color: #165DFF;
  cursor: pointer;
}
.link-name:hover {
  text-decoration: underline;
}

/* 血缘 Tab */
.lineage-page .lineage-overview {
  padding: 12px;
  background: #fafbfc;
  border-radius: 6px;
}

.lineage-section {
  margin-top: 16px;
}

.lineage-section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
}

.lineage-section-title.upstream {
  color: #165dff;
}
.lineage-section-title.downstream {
  color: #00b42a;
}
</style>