<template>
  <div class="impact-analysis-page">
    <a-page-header
      title="变更影响分析"
      sub-title="评估数据表 / 字段变更对上下游业务的影响范围"
      :back="false"
    >
      <template #extra>
        <a-space>
          <a-button @click="goBack">
            <template #icon><icon-left /></template>
            返回数据地图
          </a-button>
        </a-space>
      </template>
    </a-page-header>

    <div class="content-wrapper">
      <a-row :gutter="24">
        <!-- 左侧：输入 + 上游影响 -->
        <a-col :span="12">
          <a-card :bordered="false" title="输入变更信息">
            <a-form :model="form" layout="vertical">
              <a-form-item label="变更类型">
                <a-select v-model="form.changeType" size="large">
                  <a-option value="column_delete">删除字段</a-option>
                  <a-option value="column_modify">修改字段</a-option>
                  <a-option value="column_add">新增字段</a-option>
                  <a-option value="table_delete">删除表</a-option>
                  <a-option value="table_rename">重命名表</a-option>
                </a-select>
              </a-form-item>
              <a-form-item label="数据源">
                <a-select v-model="form.dataSource" placeholder="选择数据源" allow-clear size="large">
                  <a-option value="core_trade">核心交易系统 (MySQL)</a-option>
                  <a-option value="risk_db">风控决策引擎 (Doris)</a-option>
                  <a-option value="mkt_db">营销活动平台 (Hive)</a-option>
                  <a-option value="user_db">用户中心 (PG)</a-option>
                </a-select>
              </a-form-item>
              <a-form-item label="表名">
                <a-input v-model="form.tableName" placeholder="例如：fact_loan_apply" allow-clear size="large" />
              </a-form-item>
              <a-form-item label="字段名(可选)">
                <a-input v-model="form.columnName" placeholder="例如：credit_score" allow-clear size="large" />
              </a-form-item>
              <a-form-item>
                <a-space>
                  <a-button type="primary" size="large" @click="analyzeUpstream">
                    <template #icon><icon-up /></template>
                    分析上游影响
                  </a-button>
                  <a-button size="large" @click="analyzeDownstream">
                    <template #icon><icon-down /></template>
                    分析下游影响
                  </a-button>
                  <a-button size="large" @click="analyzeBoth">
                    <template #icon><icon-swap /></template>
                    上下游全量
                  </a-button>
                </a-space>
              </a-form-item>
            </a-form>
          </a-card>

          <!-- 影响结果 -->
          <a-card
            v-if="impactResult"
            :bordered="false"
            title="影响分析结果"
            style="margin-top: 16px"
          >
            <a-result
              :status="impactResult.level === 'high' ? 'error' : (impactResult.level === 'medium' ? 'warning' : 'success')"
              :title="impactResult.message"
              :sub-title="`影响 ${impactResult.count} 个对象`"
            >
              <template #icon>
                <icon-exclamation-circle-fill v-if="impactResult.level === 'high'" :style="iconStyleHigh" />
                <icon-exclamation-circle-fill v-else-if="impactResult.level === 'medium'" :style="iconStyleMedium" />
                <icon-check-circle-fill v-else :style="iconStyleLow" />
              </template>
              <template #extra>
                <a-row :gutter="16" style="margin-top: 16px">
                  <a-col :span="8">
                    <a-statistic title="直接影响" :value="impactResult.directCount" :value-style="statStyleHigh" />
                  </a-col>
                  <a-col :span="8">
                    <a-statistic title="间接影响" :value="impactResult.indirectCount" :value-style="statStyleMedium" />
                  </a-col>
                  <a-col :span="8">
                    <a-statistic title="影响报表" :value="impactResult.reportCount" :value-style="statStyleBlue" />
                  </a-col>
                </a-row>
              </template>
            </a-result>
          </a-card>
        </a-col>

        <!-- 右侧：影响范围可视化 -->
        <a-col :span="12">
          <a-card :bordered="false" title="影响范围预览" style="min-height: 480px">
            <template v-if="!impactResult">
              <a-empty description="请填写变更信息并点击分析" />
            </template>
            <template v-else>
              <div class="impact-graph">
                <!-- 中心节点 -->
                <div class="center-node">
                  <div class="center-icon">
                    <icon-storage />
                  </div>
                  <div class="center-name">{{ form.tableName || '未命名表' }}</div>
                  <div class="center-col" v-if="form.columnName">字段: {{ form.columnName }}</div>
                </div>

                <!-- 上游影响(指向中心) -->
                <div v-if="impactResult.upstreamNodes.length > 0" class="upstream-area">
                  <div class="area-label">↑ 上游影响</div>
                  <div
                    v-for="(node, i) in impactResult.upstreamNodes"
                    :key="`u-${i}`"
                    class="impact-node upstream"
                  >
                    <a-tag :color="node.type === 'table' ? 'arcoblue' : 'green'">{{ node.type === 'table' ? '表' : '字段' }}</a-tag>
                    <span>{{ node.name }}</span>
                  </div>
                </div>

                <!-- 下游影响(中心指向) -->
                <div v-if="impactResult.downstreamNodes.length > 0" class="downstream-area">
                  <div class="area-label">↓ 下游影响</div>
                  <div
                    v-for="(node, i) in impactResult.downstreamNodes"
                    :key="`d-${i}`"
                    class="impact-node downstream"
                  >
                    <a-tag :color="node.type === 'report' ? 'purple' : (node.type === 'metric' ? 'red' : 'orange')">
                      {{ typeLabel(node.type) }}
                    </a-tag>
                    <span>{{ node.name }}</span>
                    <a-tooltip v-if="node.severity === 'critical'" content="严重依赖">
                      <icon-exclamation-circle-fill :style="{ color: '#f53f3f' }" />
                    </a-tooltip>
                  </div>
                </div>
              </div>
            </template>
          </a-card>

          <!-- 阻断建议 -->
          <a-card v-if="impactResult" :bordered="false" title="阻断建议" style="margin-top: 16px">
            <a-alert
              :type="impactResult.level === 'high' ? 'error' : (impactResult.level === 'medium' ? 'warning' : 'success')"
              :show-icon="true"
            >
              <template #title>{{ impactResult.suggestionTitle }}</template>
              <div>{{ impactResult.suggestion }}</div>
            </a-alert>
            <a-divider style="margin: 12px 0" />
            <a-list size="small">
              <a-list-item v-for="(step, i) in impactResult.steps" :key="i">
                <a-list-item-meta>
                  <template #avatar>
                    <a-avatar :style="{ background: step.color }">{{ i + 1 }}</a-avatar>
                  </template>
                  <template #title>{{ step.title }}</template>
                  <template #description>{{ step.desc }}</template>
                </a-list-item-meta>
              </a-list-item>
            </a-list>
          </a-card>
        </a-col>
      </a-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'

const router = useRouter()

const form = ref({
  changeType: 'column_delete',
  dataSource: undefined,
  tableName: '',
  columnName: ''
})

const impactResult = ref<any>(null)

// 颜色 style 对象(避开 template 里的 # 解析问题)
const iconStyleHigh = { color: '#f53f3f' }
const iconStyleMedium = { color: '#ff7d00' }
const iconStyleLow = { color: '#00b42a' }
const statStyleHigh = { color: '#f53f3f' }
const statStyleMedium = { color: '#ff7d00' }
const statStyleBlue = { color: '#165dff' }

function analyzeUpstream() {
  if (!form.value.tableName) {
    Message.warning('请输入表名')
    return
  }
  // 模拟上游分析
  const upstreamCount = Math.floor(Math.random() * 5) + 2
  const upstreamNodes = []
  for (let i = 0; i < upstreamCount; i++) {
    upstreamNodes.push({
      type: i % 2 === 0 ? 'table' : 'field',
      name: i % 2 === 0
        ? `${form.value.tableName}_src_${i + 1}`
        : `field_${i + 1}`,
      severity: i === 0 ? 'critical' : 'normal'
    })
  }
  impactResult.value = {
    level: 'medium',
    message: '变更将影响 ' + upstreamCount + ' 个上游对象',
    count: upstreamCount,
    directCount: upstreamCount,
    indirectCount: 0,
    reportCount: 0,
    upstreamNodes,
    downstreamNodes: [],
    suggestionTitle: '建议在变更前通知上游 Owner',
    suggestion: '上游表有直接依赖,变更会导致上游数据无法写入,需要协调',
    steps: [
      { color: '#165dff', title: '通知上游 Owner', desc: '邮件 / IM 通知所有上游 Owner' },
      { color: '#ff7d00', title: '创建变更单', desc: '走标准变更流程,记录变更原因' },
      { color: '#00b42a', title: '变更后回归', desc: '下游依赖回归测试' }
    ]
  }
  Message.success('上游影响分析完成')
}

function analyzeDownstream() {
  if (!form.value.tableName) {
    Message.warning('请输入表名')
    return
  }
  // 模拟下游分析
  const downstreamCount = Math.floor(Math.random() * 10) + 5
  const reportCount = Math.floor(Math.random() * 8) + 2
  const directCount = Math.floor(downstreamCount / 2)
  const indirectCount = downstreamCount - directCount
  const criticalCount = Math.floor(Math.random() * 3)
  const level = criticalCount > 1 ? 'high' : (downstreamCount > 10 ? 'medium' : 'low')

  const downstreamNodes = []
  for (let i = 0; i < downstreamCount; i++) {
    const type = i < 3 ? 'metric' : (i < 6 ? 'report' : 'api')
    downstreamNodes.push({
      type,
      name: type === 'metric' ? `metric_${i + 1}` : (type === 'report' ? `report_${i + 1}` : `api_${i + 1}`),
      severity: i < criticalCount ? 'critical' : 'normal'
    })
  }
  impactResult.value = {
    level,
    message: level === 'high'
      ? '严重变更!影响 ' + downstreamCount + ' 个下游对象,' + criticalCount + ' 个关键依赖'
      : '变更将影响 ' + downstreamCount + ' 个下游对象',
    count: downstreamCount,
    directCount,
    indirectCount,
    reportCount,
    upstreamNodes: [],
    downstreamNodes,
    suggestionTitle: level === 'high'
      ? '高风险变更!建议分阶段上线'
      : '需要协调下游影响',
    suggestion: level === 'high'
      ? '存在关键指标/报表直接依赖,变更会导致指标计算异常或报表数据错误'
      : '部分下游依赖,需要协调',
    steps: [
      { color: '#f53f3f', title: '紧急评审', desc: '组织下游 Owner 紧急评审' },
      { color: '#ff7d00', title: '灰度发布', desc: '先在测试环境验证,再分批灰度' },
      { color: '#165dff', title: '回滚预案', desc: '准备回滚 SQL 和数据恢复方案' },
      { color: '#00b42a', title: '变更通知', desc: '变更完成后全量通知下游' }
    ]
  }
  Message.success('下游影响分析完成')
}

function analyzeBoth() {
  analyzeUpstream()
  setTimeout(() => {
    const u = impactResult.value
    analyzeDownstream()
    impactResult.value = {
      ...impactResult.value,
      upstreamNodes: u.upstreamNodes,
      count: impactResult.value.count + u.count,
      message: '完整影响分析:上游 ' + u.count + ' 个 + 下游 ' + impactResult.value.count + ' 个'
    }
  }, 100)
}

function typeLabel(t: string) {
  return { report: '报表', metric: '指标', api: 'API' }[t] || t
}

const goBack = () => router.push('discovery/data-map')
</script>

<style lang="scss" scoped>
.impact-analysis-page {
  background: #f5f7fa;
  min-height: 100vh;
}

.content-wrapper {
  padding: 0 24px 24px;
}

.impact-graph {
  position: relative;
  min-height: 400px;
  padding: 16px;

  .center-node {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: linear-gradient(135deg, #165dff, #0e42d2);
    color: white;
    padding: 16px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(22, 93, 255, 0.3);
    text-align: center;
    z-index: 10;
    min-width: 180px;

    .center-icon {
      font-size: 28px;
      margin-bottom: 8px;
    }
    .center-name {
      font-size: 16px;
      font-weight: 600;
    }
    .center-col {
      font-size: 12px;
      opacity: 0.85;
      margin-top: 4px;
    }
  }

  .upstream-area,
  .downstream-area {
    padding: 12px;
    background: #fafbfc;
    border-radius: 6px;
    min-height: 60px;

    .area-label {
      font-size: 12px;
      color: #86909c;
      margin-bottom: 8px;
      font-weight: 500;
    }
  }

  .upstream-area {
    margin-bottom: 200px;
  }

  .downstream-area {
    margin-top: 200px;
  }

  .impact-node {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    margin: 4px;
    background: white;
    border: 1px solid #e5e6eb;
    border-radius: 4px;
    font-size: 13px;

    &.upstream {
      border-left: 3px solid #165dff;
    }
    &.downstream {
      border-left: 3px solid #ff7d00;
    }
  }
}
</style>