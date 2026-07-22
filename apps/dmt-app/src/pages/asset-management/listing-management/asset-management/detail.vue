<template>
  <!-- @prd: asset-listing.detail -->
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
                  <a-table-column title="关联说明">
                    <template #cell="{ record }">
                      {{ record.description }}
                    </template>
                  </a-table-column>
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
            <div class="usage-page">
              <!-- Story 1-1：表级使用说明 -->
              <div class="usage-collapse-card">
                <div class="usage-collapse-header" @click="toggleUsage('table')">
                  <span class="usage-collapse-title">
                    <span class="usage-emoji">📄</span>
                    <span>表级使用说明</span>
                  </span>
                  <a-button type="text" size="mini">
                    {{ usageExpanded.table ? '−' : '+' }}
                  </a-button>
                </div>
                <div v-show="usageExpanded.table" class="usage-collapse-body">
                  <div class="usage-row">
                    <span class="usage-label">使用说明：</span>
                    <span>{{ assetData?.description || '暂无表级使用说明' }}</span>
                  </div>
                  <div class="usage-row">
                    <span class="usage-label">常用场景：</span>
                    <ul class="usage-list">
                      <li v-for="(s, i) in tableUsageScenarios" :key="i">{{ s }}</li>
                    </ul>
                  </div>
                  <div class="usage-row">
                    <span class="usage-label">更新周期：</span>
                    <a-tag color="arcoblue">{{ tableUsageCycle }}</a-tag>
                  </div>
                </div>
              </div>

              <!-- Story 1-2 / 字段级使用说明 合并：字段说明 + 版本切换 -->
              <div class="usage-collapse-card">
                <div class="usage-collapse-header" @click="toggleUsage('fields')">
                  <span class="usage-collapse-title">
                    <span class="usage-emoji">📋</span>
                    <span>字段级使用说明与变更对比</span>
                    <a-tag v-if="fieldChangeRows.length" size="small" color="orange">
                      {{ fieldChangeRows.length }} 项变更
                    </a-tag>
                  </span>
                  <a-button type="text" size="mini">
                    {{ usageExpanded.fields ? '−' : '+' }}
                  </a-button>
                </div>
                <div v-show="usageExpanded.fields" class="usage-collapse-body">
                  <div class="usage-fields-toolbar">
                    <a-radio-group v-model="fieldViewMode" type="button" size="small">
                      <a-radio-button value="desc">字段说明</a-radio-button>
                      <a-radio-button value="compare">变更对比</a-radio-button>
                    </a-radio-group>
                    <a-select
                      v-if="fieldViewMode === 'compare'"
                      v-model="compareVersionPair"
                      size="small"
                      style="width: 200px"
                      :trigger-props="{ autoFitPopupMinWidth: true }"
                    >
                      <a-option v-for="opt in compareVersionOptions" :key="opt.value" :value="opt.value">
                        {{ opt.label }}
                      </a-option>
                    </a-select>
                  </div>

                  <!-- 模式 1：字段说明（按当前选中版本展示） -->
                  <template v-if="fieldViewMode === 'desc'">
                    <div class="usage-fields-compare-header">
                      当前查看版本：<a-tag color="arcoblue" size="small">{{ activeFieldVersion }}</a-tag>
                    </div>
                    <a-table
                      :data="fieldDescRowsByVersion"
                      :pagination="false"
                      :bordered="false"
                      size="small"
                    >
                      <template #columns>
                        <a-table-column title="字段名" data-index="name" :width="160" />
                        <a-table-column title="类型" data-index="type" :width="160" />
                        <a-table-column title="说明" data-index="description" />
                      </template>
                    </a-table>
                  </template>

                  <!-- 模式 2：变更对比 -->
                  <template v-else>
                    <div class="usage-fields-compare-header">
                      版本：
                      <a-tag color="arcoblue" size="small">{{ currentComparePair.newer }}</a-tag>
                      <span style="margin: 0 6px; color: #86909c">vs</span>
                      <a-tag color="gray" size="small">{{ currentComparePair.older }}</a-tag>
                    </div>
                    <a-table
                      v-if="fieldChangeRows.length"
                      :data="fieldChangeRows"
                      :pagination="false"
                      :bordered="false"
                      row-key="name"
                      size="small"
                    >
                      <template #columns>
                        <a-table-column title="字段名" data-index="name" :width="160" />
                        <a-table-column title="旧版本值" :width="200">
                          <template #cell="{ record }">
                            <span class="usage-old-value">{{ (record as FieldChangeRow).oldValue || '（不存在）' }}</span>
                          </template>
                        </a-table-column>
                        <a-table-column title="新版本值" :width="200">
                          <template #cell="{ record }">
                            <span class="usage-new-value">{{ (record as FieldChangeRow).newValue || '（不存在）' }}</span>
                          </template>
                        </a-table-column>
                        <a-table-column title="变更" :width="100">
                          <template #cell="{ record }">
                            <a-tag :color="changeTypeColor[(record as FieldChangeRow).changeType]" size="small">
                              {{ changeTypeLabel[(record as FieldChangeRow).changeType] }}
                            </a-tag>
                          </template>
                        </a-table-column>
                      </template>
                    </a-table>
                    <a-empty v-else description="暂无字段变更记录" />
                  </template>

                  <div style="margin-top: 12px; text-align: right">
                    <a-button type="primary" size="small" @click="openChangeLogDrawer">
                      查看完整字段变更日志
                    </a-button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Story 1-3：字段变更日志抽屉 -->
            <a-drawer
              :visible="changeLogDrawerVisible"
              :width="480"
              :footer="false"
              :mask-closable="true"
              unmount-on-close
              @cancel="closeChangeLogDrawer"
              @update:visible="v => (changeLogDrawerVisible = v)"
            >
              <template #title>
                <span>字段变更日志</span>
                <span v-if="changeLogDrawerField" style="margin-left: 8px; color: #165dff">
                  - {{ changeLogDrawerField }}
                </span>
              </template>
              <a-timeline>
                <a-timeline-item
                  v-for="(log, i) in changeLogTimeline"
                  :key="i"
                  :label="log.version"
                  :dot-color="changeTypeColor[log.changeType]"
                >
                  <div class="log-version">{{ log.version }} <span class="log-date">({{ log.changeDate }})</span></div>
                  <div class="log-row">变更人：{{ log.operator }}</div>
                  <div class="log-row">
                    变更类型：
                    <a-tag :color="changeTypeColor[log.changeType]" size="small">
                      {{ changeTypeLabel[log.changeType] }}
                    </a-tag>
                  </div>
                  <div v-if="log.oldValue" class="log-row">变更前：<span class="usage-old-value">{{ log.oldValue }}</span></div>
                  <div v-if="log.newValue" class="log-row">变更后：<span class="usage-new-value">{{ log.newValue }}</span></div>
                  <div v-if="log.description" class="log-row log-desc">{{ log.description }}</div>
                </a-timeline-item>
              </a-timeline>
            </a-drawer>
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
import { ref, reactive, computed, onMounted, watch } from 'vue'
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
  recordType: 'table' | 'metric'
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
      recordType: 'table',
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
      recordType: 'metric',
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
  if (a.recordType === 'table') {
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
  if (a.recordType === 'metric') {
    // 指标型资产
    return [
      {
        id: 'r1',
        relationType: '关联表',
        targetName: 'ods_asset_metric_raw',
        targetHivePath: 'ods.ods_asset_metric_raw',
        targetSystem: 'HIVE 数仓',
        relationField: 'metric_code = code',
        cardinality: 'N:1',
        description: '指标原始数据，统计来源'
      },
      {
        id: 'r2',
        relationType: '关联指标',
        targetName: '资产总数',
        targetSystem: '数据要素',
        relationField: 'metric_code',
        cardinality: '1:1',
        description: '上层汇总指标'
      },
      {
        id: 'r3',
        relationType: '关联API',
        targetName: '资产指标查询服务',
        targetSystem: '数据服务',
        relationField: 'metric_code',
        cardinality: '1:1',
        description: '对外提供的指标查询接口'
      },
      {
        id: 'r4',
        relationType: '关联报表',
        targetName: '资产指标周报',
        targetSystem: '数据应用',
        relationField: 'metric_code',
        cardinality: 'N:N',
        description: '指标可视化报表'
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

// ============ 使用说明 Tab ============
// Story 1-1 表级使用说明
const tableUsageScenarios = computed<string[]>(() => {
  if (!assetData.value) return []
  const a = assetData.value
  if (a.recordType === 'table') {
    return [
      `与 ${a.hiveDatabase} 下游表进行关联分析`,
      '作为用户/账户维度的基础宽表，用于画像与分群',
      '与订单/合同主表 LEFT JOIN 后构建业务宽表'
    ]
  }
  return ['作为指标统计的查询口径输入', '用于报表/大屏的趋势分析', '对接 API 提供实时指标查询']
})

const tableUsageCycle = computed(() => {
  if (!assetData.value) return '—'
  return assetData.value.recordType === 'table' ? 'daily (T+1)' : 'near-realtime (5min)'
})

// 折叠面板展开状态
const usageExpanded = reactive<{ table: boolean; fields: boolean }>({
  table: true,
  fields: false
})
const toggleUsage = (key: 'table' | 'fields') => {
  usageExpanded[key] = !usageExpanded[key]
}

// Story 1-2 关键字段变更对比 + 字段说明（合并版）
type FieldChangeType = 'added' | 'modified' | 'removed'

interface FieldChangeRow {
  name: string
  oldValue?: string
  newValue?: string
  changeType: FieldChangeType
}

const changeTypeLabel: Record<FieldChangeType, string> = {
  added: '🟢 新增',
  modified: '🔄 修改',
  removed: '🔴 删除'
}
const changeTypeColor: Record<FieldChangeType, string> = {
  added: 'green',
  modified: 'blue',
  removed: 'red'
}

// 视图模式：字段说明 / 变更对比
type FieldViewMode = 'desc' | 'compare'
const fieldViewMode = ref<FieldViewMode>('desc')

// 版本（按时间倒序，最近在前）
const fieldVersions = computed<string[]>(() => {
  // mock 4 个版本
  return ['v2.4.0', 'v2.3.0', 'v2.2.0', 'v2.1.0']
})

// 默认查看版本：最新
const activeFieldVersion = ref('v2.4.0')

// 版本对比选项（最新 vs 上一版 / 跨任意两版）
const compareVersionOptions = computed(() => {
  const vs = fieldVersions.value
  const opts: { value: string; label: string; newer: string; older: string }[] = []
  for (let i = 0; i < vs.length - 1; i++) {
    const newer = vs[i]
    const older = vs[i + 1]
    opts.push({ value: `${newer}|${older}`, label: `${newer} vs ${older}`, newer, older })
  }
  return opts
})
const compareVersionPair = ref<string>('') // e.g. "v2.3.0|v2.2.0"

const currentComparePair = computed(() => {
  // 优先取用户选择的 pair；没选则取默认"最新两版"
  const opt =
    compareVersionOptions.value.find(o => o.value === compareVersionPair.value) ??
    compareVersionOptions.value[0]
  return opt ?? { newer: 'v2.3.0', older: 'v2.2.0', value: 'v2.3.0|v2.2.0', label: 'v2.3.0 vs v2.2.0' }
})

// 不同版本的字段 mock 快照（按版本给"字段类型 + 说明"做差异化）
const versionedFieldSnapshots: Record<string, { name: string; type: string; description: string }[]> = {
  'v2.4.0': [],
  'v2.3.0': [],
  'v2.2.0': [],
  'v2.1.0': []
}
const buildVersionedSnapshots = () => {
  if (!assetData.value) return
  const base = fields.value
  if (!base.length) return
  // 默认（最新版 = 当前 fields）
  versionedFieldSnapshots['v2.4.0'] = base.map(f => ({ ...f }))
  // v2.3.0：把第一个字段的类型改窄
  versionedFieldSnapshots['v2.3.0'] = base.map((f, i) => ({
    name: f.name,
    type: i === 0 ? 'VARCHAR(32)' : f.type,
    description: i === 0 ? '主键 ID（旧版本：32 位）' : f.description
  }))
  // v2.2.0：把第二个字段（user_id）改成 user_nick，且没有 email 字段（演示新增）
  versionedFieldSnapshots['v2.2.0'] = base
    .filter(f => f.name !== 'email')
    .map(f => ({
      name: f.name === `${base[1]?.name}` ? 'user_nick' : f.name,
      type: f.type,
      description: f.description
    }))
  // v2.1.0：早期版本，多个字段差异
  versionedFieldSnapshots['v2.1.0'] = base.slice(0, Math.max(2, base.length - 2)).map(f => ({
    name: f.name,
    type: f.type,
    description: `${f.description}（旧版描述）`
  }))
}

watch(
  [() => assetData.value?.assetName, () => fields.value],
  () => buildVersionedSnapshots(),
  { immediate: true }
)

const fieldDescRowsByVersion = computed(() => {
  const v = activeFieldVersion.value
  return versionedFieldSnapshots[v] ?? fields.value.map(f => ({ ...f }))
})

// 根据当前选中对比版本对生成变更行（mock：根据新旧快照 diff）
const fieldChangeRows = computed<FieldChangeRow[]>(() => {
  const { newer, older } = currentComparePair.value
  const a = versionedFieldSnapshots[newer] ?? []
  const b = versionedFieldSnapshots[older] ?? []
  const mapB = new Map(b.map(f => [f.name, f]))
  const mapA = new Map(a.map(f => [f.name, f]))
  const result: FieldChangeRow[] = []
  // 修改 + 新增
  a.forEach(f => {
    const old = mapB.get(f.name)
    if (!old) {
      result.push({ name: f.name, newValue: `${f.type} | ${f.description}`, changeType: 'added' })
    } else if (old.type !== f.type || old.description !== f.description) {
      result.push({
        name: f.name,
        oldValue: `${old.type} | ${old.description}`,
        newValue: `${f.type} | ${f.description}`,
        changeType: 'modified'
      })
    }
  })
  // 删除
  b.forEach(f => {
    if (!mapA.has(f.name)) {
      result.push({ name: f.name, oldValue: `${f.type} | ${f.description}`, changeType: 'removed' })
    }
  })
  // 如果两边一致（mock 数据没差异），给演示数据
  if (!result.length) {
    if (assetData.value) {
      result.push({ name: fields.value[0]?.name || 'id', oldValue: 'VARCHAR(32)', newValue: 'VARCHAR(64)', changeType: 'modified' })
      result.push({ name: 'email', oldValue: undefined, newValue: 'VARCHAR(128)', changeType: 'added' })
      result.push({ name: 'legacy_flag', oldValue: 'TINYINT', newValue: undefined, changeType: 'removed' })
    }
  }
  return result
})

// Story 1-3 字段变更日志抽屉
const changeLogDrawerVisible = ref(false)
const changeLogDrawerField = ref<string | null>(null)

interface ChangeLogEntry {
  version: string
  changeDate: string
  operator: string
  changeType: FieldChangeType
  oldValue?: string
  newValue?: string
  description?: string
}

const fullChangeLog = computed<ChangeLogEntry[]>(() => {
  if (!assetData.value) return []
  const name = assetData.value.assetName
  return [
    {
      version: 'v2.3.0',
      changeDate: '2026-04-15',
      operator: '张三',
      changeType: 'modified',
      oldValue: 'user_nick',
      newValue: 'user_name',
      description: '字段名标准化，与核心系统对齐'
    },
    {
      version: 'v2.3.0',
      changeDate: '2026-04-15',
      operator: '张三',
      changeType: 'added',
      newValue: 'VARCHAR(128)',
      description: `新增 email 字段，对接 ${name} 用户触达场景`
    },
    {
      version: 'v2.3.0',
      changeDate: '2026-04-15',
      operator: '张三',
      changeType: 'removed',
      oldValue: 'TINYINT legacy_flag',
      description: '废弃字段清理'
    },
    {
      version: 'v2.2.0',
      changeDate: '2026-03-01',
      operator: '李四',
      changeType: 'added',
      newValue: 'VARCHAR(64)',
      description: '初始版本字段定义'
    }
  ]
})

const changeLogTimeline = computed<ChangeLogEntry[]>(() => {
  const f = changeLogDrawerField.value
  if (!f) return fullChangeLog.value
  return fullChangeLog.value.filter(l => l.oldValue?.includes(f) || l.newValue?.includes(f) || l.description?.includes(f))
})

const openChangeLogDrawer = () => {
  changeLogDrawerField.value = null
  changeLogDrawerVisible.value = true
}
const closeChangeLogDrawer = () => {
  changeLogDrawerVisible.value = false
}

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

/* 使用说明 Tab */
.usage-page {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.usage-collapse-card {
  border: 1px solid var(--color-border-2, #e5e6eb);
  border-radius: 6px;
  background: #fff;
  overflow: hidden;
}

.usage-collapse-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  cursor: pointer;
  user-select: none;
  background: #fafbfc;
  transition: background 0.15s;
}
.usage-collapse-header:hover {
  background: #f2f3f5;
}

.usage-collapse-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #1d2129;
}

.usage-emoji {
  font-size: 16px;
}

.usage-collapse-body {
  padding: 16px;
  border-top: 1px solid var(--color-border-2, #e5e6eb);
}

.usage-row {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 13px;
  line-height: 1.7;
  color: #4e5969;
}
.usage-row:last-child {
  margin-bottom: 0;
}

.usage-label {
  flex-shrink: 0;
  font-weight: 500;
  color: #1d2129;
}

.usage-list {
  margin: 0;
  padding-left: 18px;
}

.usage-old-value {
  color: #f53f3f;
  font-family: 'JetBrains Mono', Consolas, monospace;
  font-size: 12px;
  background: #ffece8;
  padding: 1px 4px;
  border-radius: 3px;
}

.usage-new-value {
  color: #00b42a;
  font-family: 'JetBrains Mono', Consolas, monospace;
  font-size: 12px;
  background: #e8ffea;
  padding: 1px 4px;
  border-radius: 3px;
}

.usage-fields-compare-header {
  margin-bottom: 12px;
  font-size: 13px;
  color: #4e5969;
}

.usage-fields-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.log-version {
  font-weight: 600;
  font-size: 14px;
  color: #1d2129;
}
.log-date {
  font-weight: normal;
  font-size: 12px;
  color: #86909c;
}
.log-row {
  font-size: 13px;
  color: #4e5969;
  margin-top: 4px;
}
.log-desc {
  color: #1d2129;
  margin-top: 6px;
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