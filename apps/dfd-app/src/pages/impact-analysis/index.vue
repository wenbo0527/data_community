<template>
  <div class="impact-analysis-page">
    <div class="page-header">
      <h2>变更影响分析</h2>
      <p class="page-desc">评估数据表/字段变更对下游业务的影响范围</p>
    </div>

    <a-row :gutter="24">
      <!-- 左侧：输入 + 上游影响 -->
      <a-col :span="12">
        <a-card title="输入变更信息" :bordered="false">
          <a-form :model="form" layout="vertical">
            <a-form-item label="变更类型">
              <a-select v-model="form.changeType">
                <a-option value="column_delete">删除字段</a-option>
                <a-option value="column_modify">修改字段</a-option>
                <a-option value="column_add">新增字段</a-option>
                <a-option value="table_delete">删除表</a-option>
              </a-select>
            </a-form-item>
            <a-form-item label="数据源">
              <a-select v-model="form.dataSource" placeholder="选择数据源">
                <a-option value="core_trade">核心交易系统</a-option>
                <a-option value="risk_db">风控决策引擎</a-option>
                <a-option value="mkt_db">营销活动平台</a-option>
              </a-select>
            </a-form-item>
            <a-form-item label="表名">
              <a-input v-model="form.tableName" placeholder="例如：user_info" allow-clear />
            </a-form-item>
            <a-form-item label="字段名（可选）">
              <a-input v-model="form.columnName" placeholder="例如：mobile_no" allow-clear />
            </a-form-item>
            <a-form-item>
              <a-space>
                <a-button type="primary" @click="analyzeUpstream">
                  <template #icon><icon-search /></template>
                  分析上游影响
                </a-button>
                <a-button @click="analyzeDownstream">
                  <template #icon><icon-export /></template>
                  分析下游影响
                </a-button>
              </a-space>
            </a-form-item>
          </a-form>
        </a-card>

        <!-- 影响结果 -->
        <a-card title="影响分析结果" :bordered="false" style="margin-top: 16px" v-if="impactResult">
          <a-result
            :status="impactResult.level === 'high' ? 'error' : impactResult.level === 'medium' ? 'warning' : 'success'"
            :title="impactResult.message"
            :sub-title="`影响 ${impactResult.count} 个对象`"
          >
            <template #content>
              <a-descriptions :column="2" size="small">
                <a-descriptions-item label="直接影响">
                  <a-tag color="red">{{ impactResult.directCount }} 个</a-tag>
                </a-descriptions-item>
                <a-descriptions-item label="间接影响">
                  <a-tag color="orange">{{ impactResult.indirectCount }} 个</a-tag>
                </a-descriptions-item>
                <a-descriptions-item label="涉及指标">
                  <a-tag color="blue">{{ impactResult.metricCount }} 个</a-tag>
                </a-descriptions-item>
                <a-descriptions-item label="涉及任务">
                  <a-tag color="green">{{ impactResult.jobCount }} 个</a-tag>
                </a-descriptions-item>
              </a-descriptions>
            </template>
            <template #extra>
              <a-button type="primary" @click="generateReport">生成评估报告</a-button>
            </template>
          </a-result>
        </a-card>
      </a-col>

      <!-- 右侧：影响拓扑树 -->
      <a-col :span="12">
        <a-card title="影响拓扑图" :bordered="false">
          <a-tree
            :data="impactTree"
            :show-line="true"
            :default-expand-all="true"
            block-node
          >
            <template #title="{ title, type, count }">
              <a-space>
                <a-tag :color="getTypeColor(type)" size="small">{{ type }}</a-tag>
                <span>{{ title }}</span>
                <a-tag size="small" v-if="count">{{ count }}下游</a-tag>
              </a-space>
            </template>
          </a-tree>
          <a-empty v-if="!impactTree.length" description="输入变更信息后点击分析">
            <template #image>
              <icon-mind-mapping :size="48" style="color: var(--color-text-3)" />
            </template>
          </a-empty>
        </a-card>

        <!-- 受影响对象列表 -->
        <a-card title="受影响对象详情" :bordered="false" style="margin-top: 16px" v-if="impactResult">
          <a-table :data="affectedObjects" :pagination="{ pageSize: 5 }" size="small" row-key="id">
            <a-table-column title="对象名称" data-index="name" />
            <a-table-column title="类型" data-index="type">
              <template #cell="{ record }">
                <a-tag :color="getTypeColor(record.type)" size="small">{{ record.type }}</a-tag>
              </template>
            </a-table-column>
            <a-table-column title="影响方式" data-index="impact" />
            <a-table-column title="负责人" data-index="owner" />
          </a-table>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { Message } from '@arco-design/web-vue'

const form = reactive({
  changeType: 'column_delete',
  dataSource: '',
  tableName: '',
  columnName: ''
})

const impactResult = ref(null)
const impactTree = ref([])

// 受影响对象样例数据
const affectedObjects = ref([])

const getTypeColor = (type) => ({
  '表': 'blue',
  '字段': 'cyan',
  '指标': 'orange',
  '任务': 'green',
  '报表': 'purple',
  '应用': 'magenta'
}[type] || 'gray')

// 分析上游影响
const analyzeUpstream = () => {
  if (!form.tableName) {
    Message.warning('请输入表名')
    return
  }
  impactResult.value = {
    level: 'medium',
    message: '该表被 8 个下游对象依赖',
    count: 8,
    directCount: 3,
    indirectCount: 5,
    metricCount: 4,
    jobCount: 6
  }
  impactTree.value = [
    {
      title: `${form.tableName || 'user_info'}（当前表）`,
      type: '表',
      children: [
        { title: 'rpt_user_profile（用户画像报表）', type: '报表', count: 2 },
        { title: 'dw_user_features（用户特征表）', type: '表', children: [
          { title: 'ml_score_input（模型入参）', type: '任务' },
          { title: 'risk_features（风控特征）', type: '指标' }
        ]},
        { title: 'api_user_center（用户中心服务）', type: '应用', count: 1 }
      ]
    }
  ]
  affectedObjects.value = [
    { id: 1, name: 'rpt_user_profile', type: '报表', impact: '字段引用', owner: '数据分析部' },
    { id: 2, name: 'dw_user_features', type: '表', impact: 'ETL依赖', owner: '数据工程部' },
    { id: 3, name: 'ml_score_input', type: '任务', impact: '任务入参', owner: '算法组' },
    { id: 4, name: 'risk_features', type: '指标', impact: '指标计算', owner: '风控部' },
    { id: 5, name: 'api_user_center', type: '应用', impact: 'API调用', owner: '中台组' }
  ]
  Message.success('上游影响分析完成')
}

// 分析下游影响
const analyzeDownstream = () => {
  analyzeUpstream()
}

// 生成评估报告
const generateReport = () => {
  Message.success('评估报告已生成（Demo模式）')
}
</script>

<style scoped>
.impact-analysis-page {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.page-desc {
  margin: 4px 0 0;
  color: var(--color-text-3);
  font-size: 14px;
}
</style>
