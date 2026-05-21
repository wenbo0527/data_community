<template>
  <div class="feature-map-page">
    <div class="page-header">
      <h2>特征地图</h2>
    </div>

    <!-- 搜索筛选 -->
    <div class="search-section">
      <a-row :gutter="16" justify="end">
        <a-col :span="6">
          <a-input
            v-model="featureFilter.name"
            placeholder="搜索特征名称"
            allow-clear
            @press-enter="fetchFeatureRows"
          >
            <template #prefix>
              <icon-search />
            </template>
          </a-input>
        </a-col>
        <a-col :span="3">
          <a-button type="primary" @click="fetchFeatureRows">
            <template #icon><icon-search /></template>
            搜索
          </a-button>
        </a-col>
      </a-row>
    </div>

    <a-row :gutter="24">
      <!-- 左侧导航树 -->
      <a-col :span="6">
        <a-card title="特征树" :bordered="false">
          <a-tree
            :data="categoryTree"
            :field-names="{ key: 'key', title: 'title', children: 'children' }"
            :show-line="true"
            @select="onCategorySelect"
          />
        </a-card>
      </a-col>

      <!-- 右侧特征列表 -->
      <a-col :span="18">
        <a-card :bordered="false">
          <template #extra>
            <a-tag color="arcoblue">{{ featurePagination.total }} 个特征</a-tag>
          </template>
          <a-table
            :data="displayFeatureRows"
            :columns="featureColumns"
            :loading="featureLoading"
            :pagination="featurePagination"
            @page-change="handleFeaturePageChange"
            row-key="id"
          >
            <template #nameCell="{ record }">
              <a-link @click="openFeatureDetail(record)">{{ record.name }}</a-link>
            </template>
            <template #majorCategoryCell="{ record }">
              <a-tag :color="record.majorCategory === 'credit' ? 'blue' : 'green'">
                {{ getMajorCategoryLabel(record.majorCategory) }}
              </a-tag>
            </template>
            <template #level1Cell="{ record }">
              {{ level1Label(record.level1) }}
            </template>
            <template #statusCell="{ record }">
              <a-tag :color="getStatusColor(record.status)">
                {{ getStatusLabel(record.status) }}
              </a-tag>
            </template>
            <template #empty>
              <div class="table-empty"><icon-empty :size="40" class="empty-icon" /><span>暂无特征数据</span></div>
            </template>
          </a-table>
        </a-card>
      </a-col>
    </a-row>

    <!-- 特征详情弹窗 -->
    <a-modal
      v-model:visible="detailVisible"
      :title="currentFeature?.name || '特征详情'"
      width="640px"
      :footer="false"
    >
      <a-descriptions :column="2" bordered size="small" v-if="currentFeature">
        <a-descriptions-item label="特征编码">{{ currentFeature.code }}</a-descriptions-item>
        <a-descriptions-item label="类型">
          <a-tag :color="getTypeColor(currentFeature.type)">
            {{ getTypeLabel(currentFeature.type) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="业务分类">
          {{ currentFeature.majorCategoryLabel }}
        </a-descriptions-item>
        <a-descriptions-item label="一级分类">
          {{ currentFeature.level1Label }}
        </a-descriptions-item>
        <a-descriptions-item label="二级分类">{{ currentFeature.level2 }}</a-descriptions-item>
        <a-descriptions-item label="数据质量">
          <a-progress :percent="currentFeature.quality" :color="getQualityColor(currentFeature.quality)" />
        </a-descriptions-item>
        <a-descriptions-item label="描述" :span="2">{{ currentFeature.description }}</a-descriptions-item>
        <a-descriptions-item label="创建人">{{ currentFeature.creator }}</a-descriptions-item>
        <a-descriptions-item label="创建时间">{{ currentFeature.createdAt }}</a-descriptions-item>
      </a-descriptions>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { Message } from '@arco-design/web-vue'

// 特征列表
const featureLoading = ref(false)
const featureRows = ref([])
const featureFilter = reactive({ name: '', majorCategory: '', level1: '', level2: '' })
const featurePagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: true,
  showJumper: true,
  showPageSize: true
})

// 详情弹窗
const detailVisible = ref(false)
const currentFeature = ref(null)

// 特征列配置
const featureColumns = [
  { title: '特征名称', dataIndex: 'name', width: 180, slotName: 'nameCell' },
  { title: '特征编码', dataIndex: 'code', width: 200 },
  { title: '业务类型', dataIndex: 'majorCategory', slotName: 'majorCategoryCell', width: 100 },
  { title: '一级分类', dataIndex: 'level1', slotName: 'level1Cell', width: 120 },
  { title: '二级分类', dataIndex: 'level2', width: 120 },
  { title: '状态', dataIndex: 'status', slotName: 'statusCell', width: 80 },
  { title: '描述', dataIndex: 'description' }
]

// 状态映射
const statusMap = {
  active: { label: '已发布', color: 'green' },
  pending: { label: '待审核', color: 'orange' },
  draft: { label: '草稿', color: 'gray' }
}
const getStatusLabel = (s) => statusMap[s]?.label || s
const getStatusColor = (s) => statusMap[s]?.color || 'gray'

// 类型映射
const typeMap = {
  numerical: { label: '数值型', color: 'blue' },
  categorical: { label: '分类型', color: 'green' },
  text: { label: '文本型', color: 'orange' }
}
const getTypeLabel = (type) => typeMap[type]?.label || type
const getTypeColor = (type) => typeMap[type]?.color || 'gray'

// 分类映射
const getMajorCategoryLabel = (mc) => ({ credit: '征信变量', behavior: '行为变量' }[mc] || mc || '—')
const level1Label = (l1) => ({
  credit_report: '征信报告',
  credit_history: '信贷记录',
  transaction_behavior: '交易行为',
  activity: '活跃度',
  model_outputs: '模型输出'
}[l1] || l1 || '—')

// 质量颜色
const getQualityColor = (q) => q >= 90 ? 'green' : q >= 70 ? 'orange' : 'red'

// 分类树
const categoryTree = [
  {
    key: 'credit',
    title: '征信变量',
    children: [
      { key: 'credit_report', title: '征信报告' },
      { key: 'credit_history', title: '信贷记录' }
    ]
  },
  {
    key: 'behavior',
    title: '行为变量',
    children: [
      { key: 'transaction_behavior', title: '交易行为' },
      { key: 'activity', title: '活跃度' }
    ]
  }
]

// 样例数据
const sampleRows = [
  { id: 'feat_0701', name: '征信查询次数', code: 'credit_credit_report_query_count', description: '征信报告近半年查询次数', majorCategory: 'credit', majorCategoryLabel: '征信变量', level1: 'credit_report', level1Label: '征信报告', level2: 'query_count', type: 'numerical', status: 'active', dataSource: '用户基础信息表', creator: '李明', createdAt: '2026-03-01 10:00:00', quality: 95.5 },
  { id: 'feat_0702', name: '征信逾期次数', code: 'credit_credit_report_overdue_count', description: '征信报告历史逾期次数', majorCategory: 'credit', majorCategoryLabel: '征信变量', level1: 'credit_report', level1Label: '征信报告', level2: 'overdue_count', type: 'numerical', status: 'active', dataSource: '用户基础信息表', creator: '李明', createdAt: '2026-03-01 10:00:00', quality: 92.0 },
  { id: 'feat_0703', name: '贷款次数', code: 'credit_credit_history_loan_times', description: '信贷记录贷款次数', majorCategory: 'credit', majorCategoryLabel: '征信变量', level1: 'credit_history', level1Label: '信贷记录', level2: 'loan_times', type: 'numerical', status: 'active', dataSource: '订单数据表', creator: '王芳', createdAt: '2026-03-02 11:00:00', quality: 88.5 },
  { id: 'feat_0704', name: '还款比率', code: 'credit_credit_history_repay_ratio', description: '信贷记录还款比率', majorCategory: 'credit', majorCategoryLabel: '征信变量', level1: 'credit_history', level1Label: '信贷记录', level2: 'repay_ratio', type: 'numerical', status: 'pending', dataSource: '订单数据表', creator: '王芳', createdAt: '2026-03-02 11:00:00', quality: 85.0 },
  { id: 'feat_0711', name: '平均交易额', code: 'behavior_transaction_avg_amount', description: '近三个月平均交易额', majorCategory: 'behavior', majorCategoryLabel: '行为变量', level1: 'transaction_behavior', level1Label: '交易行为', level2: 'avg_amount', type: 'numerical', status: 'active', dataSource: '行为日志表', creator: '张伟', createdAt: '2026-03-03 09:00:00', quality: 91.0 },
  { id: 'feat_0712', name: '交易频次', code: 'behavior_transaction_frequency', description: '近一周交易次数', majorCategory: 'behavior', majorCategoryLabel: '行为变量', level1: 'transaction_behavior', level1Label: '交易行为', level2: 'frequency', type: 'numerical', status: 'active', dataSource: '行为日志表', creator: '张伟', createdAt: '2026-03-03 09:00:00', quality: 93.5 },
  { id: 'feat_0713', name: '登录天数', code: 'behavior_activity_login_days', description: '近一月登录天数', majorCategory: 'behavior', majorCategoryLabel: '行为变量', level1: 'activity', level1Label: '活跃度', level2: 'login_days', type: 'numerical', status: 'draft', dataSource: '行为日志表', creator: '赵丽', createdAt: '2026-03-04 14:00:00', quality: 78.0 },
  { id: 'feat_0714', name: '会话次数', code: 'behavior_activity_session_count', description: '近一周会话次数', majorCategory: 'behavior', majorCategoryLabel: '行为变量', level1: 'activity', level1Label: '活跃度', level2: 'session_count', type: 'numerical', status: 'active', dataSource: '行为日志表', creator: '赵丽', createdAt: '2026-03-04 14:00:00', quality: 89.0 }
]

// 展示数据
const displayFeatureRows = computed(() => {
  const rows = featureRows.value
  const filtered = rows.filter(r => r.majorCategory === 'credit' || r.majorCategory === 'behavior')
  return filtered.length ? filtered : sampleRows
})

// 树节点选择
const onCategorySelect = async (keys) => {
  const key = Array.isArray(keys) ? keys[0] : keys
  featureFilter.level1 = ''
  featureFilter.majorCategory = ''
  if (key === 'credit' || key === 'behavior') {
    featureFilter.majorCategory = key
  } else if (key) {
    featureFilter.level1 = key
    featureFilter.majorCategory = ['credit_report', 'credit_history'].includes(key) ? 'credit' : 'behavior'
  }
  featurePagination.current = 1
  await fetchFeatureRows()
}

// 获取特征列表
const fetchFeatureRows = async () => {
  featureLoading.value = true
  try {
    const params = {
      name: featureFilter.name,
      majorCategory: featureFilter.majorCategory,
      level1: featureFilter.level1,
      page: featurePagination.current,
      pageSize: featurePagination.pageSize
    }
    const res = await fetch('/api/features?' + new URLSearchParams(params).toString())
    const json = await res.json()
    const data = json.data?.list || []
    featureRows.value = data.length ? data : sampleRows
    featurePagination.total = json.data?.total ?? featureRows.value.length
  } catch (e) {
    featureRows.value = sampleRows
    featurePagination.total = sampleRows.length

  } finally {
    featureLoading.value = false
  }
}

// 分页
const handleFeaturePageChange = async (page) => {
  featurePagination.current = page
  await fetchFeatureRows()
}

// 打开详情
const openFeatureDetail = (record) => {
  currentFeature.value = record
  detailVisible.value = true
}

// 初始化
onMounted(async () => {
  featureRows.value = sampleRows
  featurePagination.total = sampleRows.length
  await fetchFeatureRows()
})
</script>

<style scoped>
.feature-map-page {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.search-section {
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 6px;
}
.table-empty { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 32px 0; color: var(--color-text-3); }
.table-empty .empty-icon { color: var(--color-fill-3); }
</style>
