<template>
  <div class="indicator-dict-page">
    <div class="page-header">
      <h2>指标字典</h2>
    </div>

    <!-- 搜索筛选 -->
    <a-card class="filter-card">
      <a-form :model="filterForm" layout="inline">
        <a-form-item label="指标名称">
          <a-input v-model="filterForm.name" placeholder="搜索指标名称" allow-clear @press-enter="handleSearch" />
        </a-form-item>
        <a-form-item label="指标类型">
          <a-select v-model="filterForm.type" placeholder="全部类型" allow-clear style="width: 120px" @change="handleSearch">
            <a-option value="regulatory">监管指标</a-option>
            <a-option value="business_core">业务指标</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="监管分类">
          <a-select v-model="filterForm.regulatoryCategory" placeholder="全部" allow-clear style="width: 200px" @change="handleSearch">
            <a-option value="cbirc_banking">银保监会-银监报表</a-option>
            <a-option value="pboc_centralized">人行-大集中报表</a-option>
            <a-option value="pboc_financial_base">人行-金融基础数据</a-option>
            <a-option value="pboc_interest_rate">人行-利率报备检测</a-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="handleSearch">搜索</a-button>
            <a-button @click="handleReset">重置</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 指标列表 -->
    <a-card class="table-card">
      <template #extra>
        <a-tag color="arcoblue">{{ displayList.length }} 个指标</a-tag>
      </template>
      <a-table
        :data="displayList"
        :columns="columns"
        :loading="loading"
        :pagination="{ showTotal: true, showPageSize: true, total: displayList.length }"
        row-key="id"
        @page-change="onPageChange"
        :scroll="{ x: 1400 }"
      >
        <template #name="{ record }">
          <a-link @click="showDetail(record)">{{ record.name }}</a-link>
        </template>
        <template #type="{ record }">
          <a-tag :color="record.type === 'regulatory' ? 'orange' : 'blue'">
            {{ record.type === 'regulatory' ? '监管指标' : '业务指标' }}
          </a-tag>
        </template>
        <template #category="{ record }">
          {{ getCategoryLabel(record) }}
        </template>
        <template #actions="{ record }">
          <a-space>
            <a-button type="text" size="small" @click="showDetail(record)">详情</a-button>
            <a-button type="text" size="small" @click="handleApply(record)">申请权限</a-button>
          </a-space>
        </template>
        <template #empty>
          <div class="table-empty"><icon-empty :size="40" class="empty-icon" /><span>暂无指标数据</span></div>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'

// 筛选表单
const filterForm = ref({
  name: '',
  type: '',
  regulatoryCategory: ''
})

const loading = ref(false)

// 指标数据（完整 Mock）
const allIndicators = ref([
  // 监管指标 - 资本监管
  { id: 'm001', name: '核心一级资本充足率', type: 'regulatory', regulatoryCategory: 'cbirc_banking', reportName: '资本充足率报告', businessDefinition: '核心一级资本与风险加权资产的比例，反映银行最低资本要求', statisticalPeriod: '月度', businessOwner: '风险管理部', technicalOwner: '数据平台组' },
  { id: 'm002', name: '一级资本充足率', type: 'regulatory', regulatoryCategory: 'cbirc_banking', reportName: '资本充足率报告', businessDefinition: '一级资本与风险加权资产的比例', statisticalPeriod: '月度', businessOwner: '风险管理部', technicalOwner: '数据平台组' },
  { id: 'm003', name: '资本充足率', type: 'regulatory', regulatoryCategory: 'cbirc_banking', reportName: '资本充足率报告', businessDefinition: '总资本与风险加权资产的比例', statisticalPeriod: '月度', businessOwner: '风险管理部', technicalOwner: '数据平台组' },
  { id: 'm004', name: '杠杆率', type: 'regulatory', regulatoryCategory: 'cbirc_banking', reportName: '杠杆率报告', businessDefinition: '一级资本与总资产的比例', statisticalPeriod: '季度', businessOwner: '风险管理部', technicalOwner: '数据平台组' },
  // 监管指标 - 流动性监管
  { id: 'm005', name: '流动性覆盖率', type: 'regulatory', regulatoryCategory: 'pboc_centralized', reportName: '流动性风险监管报告', businessDefinition: '优质流动性资产与未来30天净现金流出量的比例', statisticalPeriod: '月度', businessOwner: '资产负债管理部', technicalOwner: '数据平台组' },
  { id: 'm006', name: '净稳定资金比例', type: 'regulatory', regulatoryCategory: 'pboc_centralized', reportName: '净稳定资金比例报告', businessDefinition: '可用稳定资金与所需稳定资金的比例', statisticalPeriod: '季度', businessOwner: '资产负债管理部', technicalOwner: '数据平台组' },
  { id: 'm007', name: '流动性比例', type: 'regulatory', regulatoryCategory: 'pboc_centralized', reportName: '流动性比例月报', businessDefinition: '流动资产与流动负债的比例', statisticalPeriod: '月度', businessOwner: '资产负债管理部', technicalOwner: '数据平台组' },
  // 监管指标 - 信贷风险
  { id: 'm008', name: '不良贷款率', type: 'regulatory', regulatoryCategory: 'pboc_financial_base', reportName: '信贷资产质量报告', businessDefinition: '不良贷款余额与贷款总额的比例', statisticalPeriod: '季度', businessOwner: '信贷管理部', technicalOwner: '数据平台组' },
  { id: 'm009', name: '不良贷款余额', type: 'regulatory', regulatoryCategory: 'pboc_financial_base', reportName: '信贷资产质量报告', businessDefinition: '五级分类中次级、可疑、损失类贷款余额合计', statisticalPeriod: '季度', businessOwner: '信贷管理部', technicalOwner: '数据平台组' },
  { id: 'm010', name: '最大十户贷款占比', type: 'regulatory', regulatoryCategory: 'pboc_financial_base', reportName: '大额风险暴露报告', businessDefinition: '最大十户贷款余额与资本净额的的比例', statisticalPeriod: '季度', businessOwner: '信贷管理部', technicalOwner: '数据平台组' },
  { id: 'm011', name: '拨备覆盖率', type: 'regulatory', regulatoryCategory: 'pboc_financial_base', reportName: '贷款拨备率报表', businessDefinition: '贷款损失准备与不良贷款的比例', statisticalPeriod: '季度', businessOwner: '信贷管理部', technicalOwner: '数据平台组' },
  // 监管指标 - 利率报备
  { id: 'm012', name: '加权平均利率-对公贷款', type: 'regulatory', regulatoryCategory: 'pboc_interest_rate', reportName: '利率报备检测分析', businessDefinition: '对公贷款加权平均利率', statisticalPeriod: '月度', businessOwner: '资产负债管理部', technicalOwner: '数据平台组' },
  { id: 'm013', name: '加权平均利率-个人贷款', type: 'regulatory', regulatoryCategory: 'pboc_interest_rate', reportName: '利率报备检测分析', businessDefinition: '个人贷款加权平均利率', statisticalPeriod: '月度', businessOwner: '资产负债管理部', technicalOwner: '数据平台组' },
  { id: 'm014', name: '加权平均利率-信用卡', type: 'regulatory', regulatoryCategory: 'pboc_interest_rate', reportName: '利率报备检测分析', businessDefinition: '信用卡透支加权平均利率', statisticalPeriod: '月度', businessOwner: '信用卡中心', technicalOwner: '数据平台组' },
  // 业务指标
  { id: 'm015', name: '月活跃用户数', type: 'business_core', regulatoryCategory: 'pboc_interest_rate', reportName: '产品运营报告', businessDefinition: '当月有交易或登录行为的去重用户数', statisticalPeriod: '月度', businessOwner: '产品运营部', technicalOwner: '数据平台组' },
  { id: 'm016', name: '交易额', type: 'business_core', regulatoryCategory: 'pboc_interest_rate', reportName: '产品运营报告', businessDefinition: '统计周期内所有成功交易的金额总和', statisticalPeriod: '日度', businessOwner: '产品运营部', technicalOwner: '数据平台组' },
  { id: 'm017', name: '新增注册用户数', type: 'business_core', regulatoryCategory: 'pboc_interest_rate', reportName: '产品运营报告', businessDefinition: '统计周期内新增注册用户数量', statisticalPeriod: '日度', businessOwner: '产品运营部', technicalOwner: '数据平台组' },
  { id: 'm018', name: '授信通过率', type: 'business_core', regulatoryCategory: 'pboc_interest_rate', reportName: '风控运营报告', businessDefinition: '授信申请通过数量与申请总量的比例', statisticalPeriod: '月度', businessOwner: '风控运营部', technicalOwner: '数据平台组' },
  { id: 'm019', name: '不良率-信用卡', type: 'business_core', regulatoryCategory: 'pboc_interest_rate', reportName: '信用卡运营报告', businessDefinition: '信用卡不良资产与在账余额的比例', statisticalPeriod: '月度', businessOwner: '信用卡中心', technicalOwner: '数据平台组' },
  { id: 'm020', name: '件均保费', type: 'business_core', regulatoryCategory: 'pboc_interest_rate', reportName: '保险运营报告', businessDefinition: '保费总额与保单件数的比值', statisticalPeriod: '月度', businessOwner: '保险合作部', technicalOwner: '数据平台组' }
])

const displayList = computed(() => {
  return allIndicators.value.filter(item => {
    const nameMatch = !filterForm.value.name || item.name.includes(filterForm.value.name)
    const typeMatch = !filterForm.value.type || item.type === filterForm.value.type
    const catMatch = !filterForm.value.regulatoryCategory || item.regulatoryCategory === filterForm.value.regulatoryCategory
    return nameMatch && typeMatch && catMatch
  })
})

// 表格列
const columns = [
  { title: '指标名称', dataIndex: 'name', slotName: 'name', width: 220, fixed: 'left' },
  { title: '类型', dataIndex: 'type', slotName: 'type', width: 100 },
  { title: '监管分类', dataIndex: 'regulatoryCategory', slotName: 'category', width: 180 },
  { title: '归属场景', dataIndex: 'reportName', width: 180 },
  { title: '业务定义', dataIndex: 'businessDefinition', width: 250 },
  { title: '更新频率', dataIndex: 'statisticalPeriod', width: 100 },
  { title: '业务负责人', dataIndex: 'businessOwner', width: 120 },
  { title: '技术负责人', dataIndex: 'technicalOwner', width: 120 },
  { title: '操作', dataIndex: 'actions', slotName: 'actions', width: 150, fixed: 'right' }
]

const CATEGORY_LABELS: Record<string, string> = {
  cbirc_banking: '银保监会-银监报表',
  pboc_centralized: '人行-大集中报表',
  pboc_financial_base: '人行-金融基础数据',
  pboc_interest_rate: '人行-利率报备检测分析'
}

const getCategoryLabel = (record: any) => {
  return CATEGORY_LABELS[record.regulatoryCategory] || record.regulatoryCategory || '—'
}

const handleSearch = () => {
  // 筛选在 computed 中自动处理
}

const handleReset = () => {
  filterForm.value = { name: '', type: '', regulatoryCategory: '' }
}

const onPageChange = () => {}

const showDetail = (record: any) => {
  Message.info(`指标详情：${record.name}（Demo模式）`)
}

const handleApply = (record: any) => {
  Message.success(`已提交「${record.name}」的权限申请`)
}

onMounted(() => {
  // Mock 数据已初始化
})
</script>

<style scoped>
.indicator-dict-page { padding: 20px; background: #f5f5f5; min-height: 100vh; }
.page-header { margin-bottom: 20px; }
.page-header h2 { margin: 0; font-size: 20px; font-weight: 600; color: #1d2129; }
.filter-card { margin-bottom: 16px; }
.table-card { margin-bottom: 16px; }
.table-empty { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 32px 0; color: var(--color-text-3); }
.table-empty .empty-icon { color: var(--color-fill-3); }
</style>
