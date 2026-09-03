<template>
  <div class="data-resources-page">
    <div class="banner-section">
      <div class="banner-content">
        <div class="title-row"><h1 class="banner-title">指标字典</h1></div>
        <p class="banner-subtitle">监管指标与业务指标的统一定义、口径与归属场景</p>
        <div class="search-area">
          <a-input-search v-model="search" class="main-search-input" placeholder="输入指标名称搜索" search-button size="large" allow-clear>
            <template #button-icon><icon-search /></template>
          </a-input-search>
          <div class="search-filters-inline">
            <a-select v-model="indicatorType" placeholder="指标类型" allow-clear size="large" style="width: 160px" class="filter-select">
              <a-option value="regulatory">监管指标</a-option>
              <a-option value="business_core">业务指标</a-option>
            </a-select>
            <a-select v-model="regCategory" placeholder="监管分类" allow-clear size="large" style="width: 180px" class="filter-select">
              <a-option value="cbirc_banking">银保监会-银监报表</a-option>
              <a-option value="pboc_centralized">人行-大集中报表</a-option>
              <a-option value="pboc_financial_base">人行-金融基础数据</a-option>
              <a-option value="pboc_interest_rate">人行-利率报备检测</a-option>
            </a-select>
            <a-button class="action-btn" size="large" @click="showMissingTicket({ assetType: 'metric', pageSource: '指标字典' })">
              <template #icon><icon-plus /></template>缺失工单
            </a-button>
          </div>
        </div>
      </div>
      <div class="banner-decoration"><div class="decoration-cube"></div></div>
    </div>
    <div class="main-content">
      <div class="content-section">
        <a-row :gutter="[16, 16]">
          <a-col v-for="m in filteredList" :key="m.id" :xs="24" :sm="12" :md="8" :lg="6">
            <a-card hoverable :bordered="false">
              <template #title>
                <a-space>
                  <a-tag :color="m.type === 'regulatory' ? 'orange' : 'blue'">{{ m.type === 'regulatory' ? '监管指标' : '业务指标' }}</a-tag>
                  <span>{{ m.name }}</span>
                </a-space>
              </template>
              <a-descriptions :column="1" size="small">
                <a-descriptions-item label="监管分类">{{ CATEGORY_LABELS[m.regulatoryCategory] || '—' }}</a-descriptions-item>
                <a-descriptions-item label="归属场景">{{ m.reportName }}</a-descriptions-item>
                <a-descriptions-item label="业务定义">{{ m.businessDefinition }}</a-descriptions-item>
                <a-descriptions-item label="统计频率">{{ m.statisticalPeriod }}</a-descriptions-item>
                <a-descriptions-item label="业务负责人">{{ m.businessOwner }}</a-descriptions-item>
                <a-descriptions-item label="技术负责人">{{ m.technicalOwner }}</a-descriptions-item>
              </a-descriptions>
              <template #actions>
                <a-button type="text" size="small" @click="viewDetail(m)">详情</a-button>
                <a-button type="text" size="small" @click="applyPermission(m)">申请权限</a-button>
              </template>
            </a-card>
          </a-col>
        </a-row>
        <a-empty v-if="filteredList.length === 0" description="暂无指标数据" />
      </div>
    </div>

    <!-- 缺失工单弹窗 -->
    <MissingTicketModal
      v-model:visible="showMissingTicketModal"
      :context="ticketContext"
      @confirm="handleMissingTicketConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconSearch, IconPlus } from '@arco-design/web-vue/es/icon'
import MissingTicketModal from '@/pages/search/MissingTicketModal.vue'
import { useMissingTicket } from '@/composables/useMissingTicket'

const { showMissingTicketModal, ticketContext, showMissingTicket, handleMissingTicketConfirm } = useMissingTicket()

const search = ref('')
const indicatorType = ref<string | undefined>(undefined)
const regCategory = ref<string | undefined>(undefined)

const CATEGORY_LABELS: Record<string, string> = {
  cbirc_banking: '银保监会-银监报表',
  pboc_centralized: '人行-大集中报表',
  pboc_financial_base: '人行-金融基础数据',
  pboc_interest_rate: '人行-利率报备检测'
}

const allIndicators = ref([
  { id: 'm001', name: '核心一级资本充足率', type: 'regulatory', regulatoryCategory: 'cbirc_banking', reportName: '资本充足率报告', businessDefinition: '核心一级资本与风险加权资产的比例', statisticalPeriod: '月度', businessOwner: '风险管理部', technicalOwner: '数据平台组' },
  { id: 'm002', name: '一级资本充足率', type: 'regulatory', regulatoryCategory: 'cbirc_banking', reportName: '资本充足率报告', businessDefinition: '一级资本与风险加权资产的比例', statisticalPeriod: '月度', businessOwner: '风险管理部', technicalOwner: '数据平台组' },
  { id: 'm003', name: '资本充足率', type: 'regulatory', regulatoryCategory: 'cbirc_banking', reportName: '资本充足率报告', businessDefinition: '总资本与风险加权资产的比例', statisticalPeriod: '月度', businessOwner: '风险管理部', technicalOwner: '数据平台组' },
  { id: 'm004', name: '杠杆率', type: 'regulatory', regulatoryCategory: 'cbirc_banking', reportName: '杠杆率报告', businessDefinition: '一级资本与总资产的比例', statisticalPeriod: '季度', businessOwner: '风险管理部', technicalOwner: '数据平台组' },
  { id: 'm005', name: '流动性覆盖率', type: 'regulatory', regulatoryCategory: 'pboc_centralized', reportName: '流动性风险监管报告', businessDefinition: '优质流动性资产与未来30天净现金流出量的比例', statisticalPeriod: '月度', businessOwner: '资产负债管理部', technicalOwner: '数据平台组' },
  { id: 'm006', name: '净稳定资金比例', type: 'regulatory', regulatoryCategory: 'pboc_centralized', reportName: '净稳定资金比例报告', businessDefinition: '可用稳定资金与所需稳定资金的比例', statisticalPeriod: '季度', businessOwner: '资产负债管理部', technicalOwner: '数据平台组' },
  { id: 'm008', name: '不良贷款率', type: 'regulatory', regulatoryCategory: 'pboc_financial_base', reportName: '信贷资产质量报告', businessDefinition: '不良贷款余额与贷款总额的比例', statisticalPeriod: '季度', businessOwner: '信贷管理部', technicalOwner: '数据平台组' },
  { id: 'm011', name: '拨备覆盖率', type: 'regulatory', regulatoryCategory: 'pboc_financial_base', reportName: '贷款拨备率报表', businessDefinition: '贷款损失准备与不良贷款的比例', statisticalPeriod: '季度', businessOwner: '信贷管理部', technicalOwner: '数据平台组' },
  { id: 'm012', name: '加权平均利率-对公贷款', type: 'regulatory', regulatoryCategory: 'pboc_interest_rate', reportName: '利率报备检测分析', businessDefinition: '对公贷款加权平均利率', statisticalPeriod: '月度', businessOwner: '资产负债管理部', technicalOwner: '数据平台组' },
  { id: 'm015', name: '月活跃用户数', type: 'business_core', regulatoryCategory: '', reportName: '产品运营报告', businessDefinition: '当月有交易或登录行为的去重用户数', statisticalPeriod: '月度', businessOwner: '产品运营部', technicalOwner: '数据平台组' },
  { id: 'm016', name: '交易额', type: 'business_core', regulatoryCategory: '', reportName: '产品运营报告', businessDefinition: '统计周期内所有成功交易的金额总和', statisticalPeriod: '日度', businessOwner: '产品运营部', technicalOwner: '数据平台组' },
  { id: 'm018', name: '授信通过率', type: 'business_core', regulatoryCategory: '', reportName: '风控运营报告', businessDefinition: '授信申请通过数量与申请总量的比例', statisticalPeriod: '月度', businessOwner: '风控运营部', technicalOwner: '数据平台组' }
])

const filteredList = computed(() => {
  let result = allIndicators.value
  if (search.value) {
    const k = search.value.toLowerCase()
    result = result.filter(m => m.name.toLowerCase().includes(k) || m.businessDefinition.toLowerCase().includes(k))
  }
  if (indicatorType.value) result = result.filter(m => m.type === indicatorType.value)
  if (regCategory.value) result = result.filter(m => m.regulatoryCategory === regCategory.value)
  return result
})

function viewDetail(m: any) { Message.info(`查看指标: ${m.name}`) }
function applyPermission(m: any) { Message.success(`已提交权限申请: ${m.name}`) }
</script>

<style scoped>
.data-resources-page { min-height: 100vh; background: #f7f8fa; position: relative; overflow-x: hidden; }
.banner-section { background: linear-gradient(180deg, #E6F0FF 0%, #F7F8FA 100%); padding: 40px 0; position: relative; display: flex; justify-content: center; align-items: center; min-height: 280px; }
.banner-content { width: 100%; max-width: 1800px; z-index: 2; position: relative; display: flex; flex-direction: column; padding: 0 40% 0 40px; box-sizing: border-box; }
.banner-title { font-size: 40px; font-weight: bold; color: #1d2129; margin: 0 0 16px 0; line-height: 1.2; }
.banner-subtitle { font-size: 14px; color: #86909c; margin-bottom: 32px; max-width: 600px; line-height: 1.6; }
.search-area { display: flex; gap: 16px; align-items: center; width: 100%; max-width: 900px; flex-wrap: wrap; }
.main-search-input { flex: 1; min-width: 400px; background: #fff; border-radius: 30px; border: 1px solid #165DFF; box-shadow: 0 4px 10px rgba(22, 93, 255, 0.1); }
.main-search-input :deep(.arco-input-wrapper) { border-radius: 30px; padding-left: 20px; background: #fff; }
.main-search-input :deep(.arco-input-search-btn) { border-radius: 0 30px 30px 0; background: transparent; color: #165DFF; border-left: 1px solid #f2f3f5; }
.search-filters-inline { display: flex; gap: 12px; }
.filter-select { background: #fff; border-radius: 4px; }
.banner-decoration { position: absolute; right: 0; top: 0; width: 40%; height: 100%; overflow: hidden; pointer-events: none; }
.decoration-cube { position: absolute; top: 40px; right: 100px; width: 200px; height: 200px; background: linear-gradient(135deg, #e8f3ff 0%, #cce4ff 100%); transform: rotate(-15deg) skew(-10deg); border-radius: 20px; box-shadow: -20px 20px 40px rgba(22, 93, 255, 0.1); }
.main-content { padding: 0 40px 40px; width: 100%; max-width: 1800px; margin: -40px auto 0; position: relative; z-index: 3; }
.content-section { background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04); }
</style>