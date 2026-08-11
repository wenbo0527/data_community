<template>
  <div class="impact-analysis-container">
    <!-- 顶部操作区 -->
    <a-card class="search-card" :bordered="false">
      <div class="search-bar">
        <a-space>
          <a-input
            v-model="tableName"
            placeholder="请输入要分析的表名(如 dim_user)"
            style="width: 280px"
            allow-clear
            @press-enter="runAnalysis"
            @clear="reset"
          >
            <template #prefix>
              <IconStorage />
            </template>
          </a-input>
          <a-button type="primary" @click="runAnalysis" :loading="analyzing">
            <template #icon><IconSearch /></template>
            分析影响
          </a-button>
          <a-button @click="goToLineage">
            <template #icon><IconLink /></template>
            查看完整血缘
          </a-button>
        </a-space>
      </div>
    </a-card>

    <!-- 分析结果区 -->
    <a-empty v-if="!analysisResult" description="请输入表名后点击「分析影响」" />

    <a-row v-else :gutter="16">
      <!-- 左侧:严重程度 + 摘要 -->
      <a-col :span="8">
        <a-card title="影响概览" :bordered="false">
          <template #extra>
            <a-tag :color="severityColor" size="large">
              {{ severityLabel }}
            </a-tag>
          </template>

          <a-statistic
            title="受影响下游表(全链路)"
            :value="analysisResult.allDownstreamTables.length"
            :value-style="{ color: severityColor }"
          />
          <a-divider />
          <a-statistic
            title="直接下游表(1 阶)"
            :value="analysisResult.directDownstreamTables.length"
          />
          <a-divider />
          <a-statistic
            title="受影响字段"
            :value="analysisResult.affectedColumns.length"
          />

          <a-divider />

          <a-alert :type="severityAlertType" :show-icon="true">
            {{ analysisResult.summary }}
          </a-alert>
        </a-card>

        <!-- 下架操作区 -->
        <a-card title="下架操作" :bordered="false" style="margin-top: 16px">
          <a-form :model="offlineForm" layout="vertical">
            <a-form-item label="下架原因(必填)" required>
              <a-textarea
                v-model="offlineForm.reason"
                placeholder="例如:数据源系统下线 / 字段不再准确 / 重复表合并..."
                :rows="3"
                :max-length="200"
                show-word-limit
              />
            </a-form-item>
            <a-form-item label="通知 Owner">
              <a-checkbox-group v-model="offlineForm.notifyTargets">
                <a-checkbox value="owner">数据 Owner</a-checkbox>
                <a-checkbox value="downstream">下游消费方</a-checkbox>
                <a-checkbox value="admin">数据治理组</a-checkbox>
              </a-checkbox-group>
            </a-form-item>
            <a-form-item label="生效时间">
              <a-radio-group v-model="offlineForm.effectiveType">
                <a-radio value="immediate">立即生效</a-radio>
                <a-radio value="delayed">延后 7 天</a-radio>
              </a-radio-group>
            </a-form-item>

            <a-button
              type="primary"
              status="danger"
              long
              :disabled="!canOffline"
              @click="confirmOffline"
            >
              <template #icon><IconCloseCircle /></template>
              确认下架 {{ tableName }}
            </a-button>

            <div class="offline-hint">
              <a-tag v-if="analysisResult.severity === 'critical'" color="red">
                🔴 严重:必须治理委员会审批
              </a-tag>
              <a-tag v-else-if="analysisResult.severity === 'high'" color="orange">
                🟠 高:需通知 Owner 后操作
              </a-tag>
              <a-tag v-else color="green">
                🟢 可直接下架
              </a-tag>
            </div>
          </a-form>
        </a-card>
      </a-col>

      <!-- 右侧:详细影响清单 -->
      <a-col :span="16">
        <!-- 完整血缘图(复用 lineage 模块的组件) -->
        <a-card title="血缘拓扑图" :bordered="false">
          <template #extra>
            <a-tag>基于字段级血缘 BFS 遍历</a-tag>
          </template>
          <LineageGraph
            :table-name="tableName"
            :layers="2"
            :data-types="['Table']"
          />
        </a-card>

        <!-- 受影响下游表 -->
        <a-card title="受影响的下游表" :bordered="false" style="margin-top: 16px">
          <a-empty v-if="analysisResult.allDownstreamTables.length === 0" description="无下游影响" />
          <a-table
            v-else
            :data="downstreamTableRows"
            :pagination="false"
            :bordered="false"
            row-key="tableName"
          >
            <template #columns>
              <a-table-column title="下游表" data-index="tableName">
                <template #cell="{ record }">
                  <a-tag color="arcoblue">{{ record.tableName }}</a-tag>
                </template>
              </a-table-column>
              <a-table-column title="关系" data-index="level">
                <template #cell="{ record }">
                  <a-tag :color="record.level === 1 ? 'red' : 'orange'">
                    {{ record.level === 1 ? '直接下游' : `${record.level} 阶下游` }}
                  </a-tag>
                </template>
              </a-table-column>
              <a-table-column title="受影响字段数" data-index="columnCount" :width="120">
                <template #cell="{ record }">
                  <a-statistic :value="record.columnCount" :value-style="{ fontSize: '14px' }" />
                </template>
              </a-table-column>
              <a-table-column title="操作" :width="120">
                <template #cell="{ record }">
                  <a-button type="text" size="mini" @click="viewDownstream(record.tableName)">
                    <template #icon><IconLaunch /></template>
                    查看详情
                  </a-button>
                </template>
              </a-table-column>
            </template>
          </a-table>
        </a-card>

        <!-- 受影响字段 -->
        <a-card title="受影响的字段明细" :bordered="false" style="margin-top: 16px">
          <a-empty v-if="analysisResult.affectedColumns.length === 0" description="无字段影响" />
          <a-table
            v-else
            :data="analysisResult.affectedColumns"
            :pagination="{ pageSize: 10 }"
            :bordered="false"
          >
            <template #columns>
              <a-table-column title="目标表" data-index="table">
                <template #cell="{ record }">
                  <a-tag>{{ record.table }}</a-tag>
                </template>
              </a-table-column>
              <a-table-column title="目标字段" data-index="column">
                <template #cell="{ record }">
                  <code>{{ record.column }}</code>
                </template>
              </a-table-column>
            </template>
          </a-table>
        </a-card>
      </a-col>
    </a-row>

    <!-- 下架确认弹窗 -->
    <a-modal
      v-model:visible="confirmVisible"
      title="确认下架"
      :ok-text="`确认下架 ${tableName}`"
      ok-button-props="{ status: 'danger' }"
      @ok="executeOffline"
      @cancel="confirmVisible = false"
    >
      <a-alert
        v-if="analysisResult"
        :type="severityAlertType"
        :show-icon="true"
        style="margin-bottom: 16px"
      >
        {{ analysisResult.summary }}
      </a-alert>

      <a-descriptions :column="1" bordered>
        <a-descriptions-item label="资源">{{ tableName }}</a-descriptions-item>
        <a-descriptions-item label="严重程度">
          <a-tag :color="severityColor">{{ severityLabel }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="影响下游表数">
          {{ analysisResult?.allDownstreamTables.length || 0 }}
        </a-descriptions-item>
        <a-descriptions-item label="影响字段数">
          {{ analysisResult?.affectedColumns.length || 0 }}
        </a-descriptions-item>
        <a-descriptions-item label="下架原因">
          {{ offlineForm.reason }}
        </a-descriptions-item>
        <a-descriptions-item label="通知对象">
          {{ offlineForm.notifyTargets.join('、') || '无' }}
        </a-descriptions-item>
        <a-descriptions-item label="生效时间">
          {{ offlineForm.effectiveType === 'immediate' ? '立即生效' : '延后 7 天生效' }}
        </a-descriptions-item>
      </a-descriptions>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
/**
 * 上下架影响分析(P0-A)
 *
 * 输入:表名
 * 输出:基于字段级血缘 BFS 遍历的所有下游资产/要素
 *
 * @see 文档 §3.5 上下架状态机 - 关键差距
 * @see 文档 §13.2 落地路径
 */
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { ColumnLineageStore } from '@/mock/shared/column-lineage'
import LineageGraph from '@/pages/discovery/lineage/components/LineageGraph.vue'
import {
  IconSearch,
  IconStorage,
  IconLink,
  IconCloseCircle,
  IconLaunch
} from '@arco-design/web-vue/es/icon'

// === 路由 ===
const route = useRoute()
const router = useRouter()

// === 表单 ===
const tableName = ref(typeof route.query.table === 'string' ? route.query.table : 'dim_user')
const analyzing = ref(false)
const analysisResult = ref<ReturnType<typeof ColumnLineageStore.impactOfTable> | null>(null)

const offlineForm = ref({
  reason: '',
  notifyTargets: ['owner', 'downstream'] as string[],
  effectiveType: 'delayed' as 'immediate' | 'delayed'
})

const confirmVisible = ref(false)

// === 计算属性 ===
const severityColor = computed(() => {
  switch (analysisResult.value?.severity) {
    case 'low': return '#00B42A'
    case 'medium': return '#FF7D00'
    case 'high': return '#F53F3F'
    case 'critical': return '#A30014'
    default: return '#86909C'
  }
})

const severityLabel = computed(() => {
  switch (analysisResult.value?.severity) {
    case 'low': return '低风险'
    case 'medium': return '中等风险'
    case 'high': return '高风险'
    case 'critical': return '严重'
    default: return '未分析'
  }
})

const severityAlertType = computed<'info' | 'success' | 'warning' | 'error'>(() => {
  switch (analysisResult.value?.severity) {
    case 'low': return 'success'
    case 'medium': return 'warning'
    case 'high': return 'warning'
    case 'critical': return 'error'
    default: return 'info'
  }
})

const canOffline = computed(() => {
  if (!analysisResult.value) return false
  if (!offlineForm.value.reason.trim()) return false
  // critical 必须勾选 admin
  if (analysisResult.value.severity === 'critical' && !offlineForm.value.notifyTargets.includes('admin')) {
    return false
  }
  return true
})

/** 下游表 + 关系深度 + 字段数 */
const downstreamTableRows = computed(() => {
  if (!analysisResult.value) return []
  const rows: { tableName: string; level: number; columnCount: number }[] = []

  analysisResult.value.directDownstreamTables.forEach(t => {
    const cols = analysisResult.value!.affectedColumns.filter(c => c.table === t)
    rows.push({ tableName: t, level: 1, columnCount: cols.length })
  })

  // 间接下游(不在 direct 里的)
  analysisResult.value.allDownstreamTables.forEach(t => {
    if (!analysisResult.value!.directDownstreamTables.includes(t)) {
      const cols = analysisResult.value!.affectedColumns.filter(c => c.table === t)
      rows.push({ tableName: t, level: 2, columnCount: cols.length })
    }
  })

  return rows
})

// === 方法 ===
const runAnalysis = () => {
  if (!tableName.value.trim()) {
    Message.warning('请输入表名')
    return
  }
  analyzing.value = true
  // 模拟分析耗时
  setTimeout(() => {
    analysisResult.value = ColumnLineageStore.impactOfTable(tableName.value.trim())
    analyzing.value = false
    if (analysisResult.value) {
      Message.success(`分析完成:${analysisResult.value.summary}`)
    }
  }, 300)
}

const reset = () => {
  analysisResult.value = null
  offlineForm.value.reason = ''
}

const confirmOffline = () => {
  if (!canOffline.value) {
    Message.warning('请填写下架原因')
    return
  }
  confirmVisible.value = true
}

const executeOffline = () => {
  // mock:实际调用 API
  Message.success(`${tableName.value} 已提交下架申请,治理组将审核`)
  confirmVisible.value = false
  // 实际场景:router.push('/home/management/asset-management?status=offlining')
}

const goToLineage = () => {
  router.push({ path: '/home/discovery/lineage', query: { table: tableName.value } })
}

const viewDownstream = (table: string) => {
  router.push({ path: '/home/discovery/lineage', query: { table } })
}

onMounted(() => {
  if (tableName.value) {
    runAnalysis()
  }
})
</script>

<style scoped>
.impact-analysis-container {
  padding: 16px;
}
.search-card {
  margin-bottom: 16px;
}
.search-bar {
  display: flex;
  align-items: center;
}
.offline-hint {
  margin-top: 12px;
  text-align: center;
}
code {
  background: var(--color-fill-2);
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 13px;
}
</style>