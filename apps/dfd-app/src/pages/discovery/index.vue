<template>
  <div class="data-map-container">
    <!-- 顶部 Banner -->
    <div class="banner-section">
      <div class="banner-content">
        <div class="title-row">
          <h1 class="banner-title">数据消费新体验</h1>
          <span class="version-tag">2.0</span>
        </div>
        <p class="banner-subtitle">全新版本数据地图，包含查数、找数、用数等场景升级；为用户解决找数难，理解数据难的难点。</p>
        
        <div class="search-area">
          <a-input-search 
            v-model="searchForm.keyword"
            class="main-search-input"
            placeholder="输入关键词进行查询，支持各业务/标签/分组/指标等多个关键字"
            search-button
            size="large"
            @search="handleSearch"
          >
            <template #button-icon><icon-search /></template>
          </a-input-search>
          <a-button class="action-btn" size="large" @click="toggleAdvancedFilter" :type="showAdvancedFilter ? 'primary' : 'secondary'">
            <template #icon><icon-filter /></template>高级
          </a-button>
          <a-button class="action-btn" size="large" @click="handleFollow">
            <template #icon><icon-heart /></template>关注
          </a-button>
        </div>

        <div v-if="showAdvancedFilter" class="advanced-filter-panel">
          <a-row :gutter="16">
            <a-col :span="8">
              <a-form-item label="包含关键词" label-col-flex="80px">
                <a-input v-model="searchForm.include" placeholder="输入包含的关键词" allow-clear />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="排除关键词" label-col-flex="80px">
                <a-input v-model="searchForm.exclude" placeholder="输入排除的关键词" allow-clear />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="业务模块" label-col-flex="80px">
                <a-select v-model="searchForm.module" placeholder="选择业务模块" allow-clear>
                  <a-option>贷前分析</a-option>
                  <a-option>风控评估</a-option>
                  <a-option>反欺诈</a-option>
                  <a-option>自营业务</a-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>
          <div class="filter-actions">
            <a-button type="primary" size="small" @click="handleSearch">应用筛选</a-button>
            <a-button size="small" @click="resetSearch">重置</a-button>
          </div>
        </div>
      </div>
      <div class="banner-decoration">
        <div class="decoration-cube"></div>
      </div>
    </div>

    <!-- 主体内容 -->
    <div class="main-content">
      <!-- 常用表集合 -->
      <div class="content-section">
        <div class="section-header">
          <h3 class="section-title">常用表集合</h3>
          <a-link class="more-link">查看更多 <icon-right /></a-link>
        </div>
        <a-row :gutter="[16, 16]">
          <a-col v-for="col in collections" :key="col.id" :xs="24" :sm="12" :md="8" :lg="6">
            <a-card class="collection-card" hoverable @click="handleCollectionClick(col)">
              <div class="card-content">
                <div class="card-icon-box">
                  <icon-apps />
                </div>
                <h4 class="collection-name">{{ col.name }}</h4>
                <p class="collection-desc">{{ col.description }}</p>
                <div class="collection-meta">
                  <a-tag size="small" :color="col.type === '业务流程' ? 'red' : 'arcoblue'">{{ col.type }}</a-tag>
                  <span class="table-count">{{ col.count }} 张表</span>
                </div>
              </div>
            </a-card>
          </a-col>
        </a-row>
      </div>

      <!-- 数据体系全景 -->
      <div class="content-section" style="margin-top: 24px;">
        <div class="section-header">
          <h3 class="section-title">数据体系全景</h3>
        </div>
        
        <div class="data-flow-container">
          <!-- 数据资源 -->
          <div class="system-column">
            <div class="relationship-card">
              <div class="card-icon resource-bg"><icon-apps /></div>
              <div class="card-info">
                <h4>数据资源</h4>
                <p>原始数据的汇聚与接入</p>
              </div>
            </div>
            <div class="column-list">
              <div v-for="(item, index) in dataResources" :key="index" class="asset-item clickable-item" @click="handleResourceClick(item)">
                <div class="asset-content">
                  <icon-cloud class="asset-icon" />
                  <span class="asset-name">{{ item.name }}</span>
                </div>
                <span class="asset-count">{{ item.count }}</span>
              </div>
            </div>
          </div>

          <div class="arrow-connector"><icon-right /></div>

          <!-- 数据资产 -->
          <div class="system-column">
            <div class="relationship-card">
              <div class="card-icon asset-bg"><icon-storage /></div>
              <div class="card-info">
                <h4>数据资产</h4>
                <p>经过治理、加工和标准化的数据</p>
              </div>
            </div>
            <div class="column-list">
              <div v-for="(item, index) in dataAssets" :key="index" class="asset-item clickable-item" @click="handleAssetClick(item)">
                <div class="asset-content">
                  <icon-user-group class="asset-icon" />
                  <span class="asset-name">{{ item.name }}</span>
                </div>
                <span class="asset-count">{{ item.count }}</span>
              </div>
            </div>
          </div>

          <div class="arrow-connector"><icon-right /></div>

          <!-- 数据要素 -->
          <div class="system-column">
            <div class="relationship-card">
              <div class="card-icon element-bg"><icon-bulb /></div>
              <div class="card-info">
                <h4>数据要素</h4>
                <p>面向业务场景的高价值数据形态</p>
              </div>
            </div>
            <div class="column-list">
              <div v-for="(item, index) in dataElements" :key="index" class="asset-item clickable-item" @click="handleElementClick(item)">
                <div class="asset-content">
                  <icon-trophy class="asset-icon" />
                  <span class="asset-name">{{ item.name }}</span>
                </div>
                <span class="asset-count">{{ item.count }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 数据治理 -->
        <div class="governance-foundation">
          <div class="foundation-header">
            <div class="card-icon governance-bg"><icon-settings /></div>
            <div class="card-info">
              <h4>数据治理</h4>
              <p>贯穿全生命周期的标准规范与质量保障体系</p>
            </div>
          </div>
          <div class="governance-grid">
            <div v-for="(item, index) in dataGovernance" :key="index" class="governance-item">
              <div class="asset-content">
                <icon-book class="asset-icon" />
                <span class="asset-name">{{ item.name }}</span>
              </div>
              <span class="asset-count">{{ item.count }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Message, Modal } from '@arco-design/web-vue'
import { 
  IconSearch, IconRight, IconHeart, IconFilter,
  IconApps, IconCloud, IconStorage, IconUserGroup, IconBulb,
  IconTrophy, IconSettings, IconBook
} from '@arco-design/web-vue/es/icon'

const router = useRouter()

const searchForm = ref({ keyword: '', include: '', exclude: '', module: '' })
const showAdvancedFilter = ref(false)

const collections = ref([
  { id: 1, name: '贷前分析', description: '贷前准入、评级、授信相关数据', type: '业务流程', count: 156 },
  { id: 2, name: '风控评估', description: '风控模型、欺诈检测、预警数据', type: '业务流程', count: 89 },
  { id: 3, name: '反欺诈策略', description: '欺诈规则、关联图谱、案件数据', type: '业务流程', count: 234 },
  { id: 4, name: '自营业务', description: '自营产品、运营活动、用户行为数据', type: '业务流程', count: 412 }
])

const dataResources = ref([
  { name: '业务系统', count: 12, description: '核心系统' },
  { name: '外部数据', count: 8, description: '三方数据' },
  { name: '文件导入', count: 5, description: '线下数据' },
  { name: '日志数据', count: 6, description: '埋点日志' }
])

const dataAssets = ref([
  { name: '用户域', count: 128 },
  { name: '交易域', count: 256 },
  { name: '商品域', count: 84 },
  { name: '风控域', count: 95 }
])

const dataElements = ref([
  { name: '核心指标', count: 48 },
  { name: '业务标签', count: 156 },
  { name: '数据变量', count: 312 },
  { name: '模型特征', count: 89 }
])

const dataGovernance = ref([
  { name: '元数据管理', count: 0 },
  { name: '数据标准', count: 0 },
  { name: '数据质量', count: 0 },
  { name: '数据安全', count: 0 }
])

const handleSearch = () => {
  if (!searchForm.value.keyword) {
    Message.warning('请输入搜索关键词')
    return
  }
  router.push({ path: '/dfd/search', query: { q: searchForm.value.keyword } })
}

const toggleAdvancedFilter = () => {
  showAdvancedFilter.value = !showAdvancedFilter.value
}

const resetSearch = () => {
  searchForm.value = { keyword: '', include: '', exclude: '', module: '' }
}

const handleFollow = () => {
  Modal.info({
    title: '关注提示',
    content: '关注资产后，您将收到资产变更相关的通知。',
    okText: '知道了'
  })
}

const handleCollectionClick = (col: any) => {
  Message.info('集合详情：' + col.name + '（Demo模式）')
}

const handleAssetClick = (item: any) => {
  Message.info('数据资产：' + item.name + '（Demo模式）')
}

const handleResourceClick = (item: any) => {
  Message.info('数据资源：' + item.name + '（Demo模式）')
}

const handleElementClick = (item: any) => {
  Message.info('数据要素：' + item.name + '（Demo模式）')
}
</script>

<style scoped>
.data-map-container { min-height: 100vh; background: #f7f8fa; }

.banner-section {
  background: linear-gradient(180deg, #E6F0FF 0%, #F7F8FA 100%);
  padding: 40px 0; position: relative; display: flex; justify-content: center;
  align-items: center; min-height: 320px;
}

.banner-content {
  width: 100%; max-width: 1800px; z-index: 2; position: relative;
  display: flex; flex-direction: column; padding: 0 40% 0 40px; box-sizing: border-box;
}

.banner-title { font-size: 44px; font-weight: bold; color: #1d2129; margin: 0 0 16px 0; line-height: 1.2; }
.version-tag { font-size: 36px; font-weight: 600; background: linear-gradient(90deg, #165DFF 0%, #00B42A 100%); -webkit-background-clip: text; color: transparent; margin-left: 12px; }
.banner-subtitle { font-size: 14px; color: #86909c; margin-bottom: 32px; max-width: 600px; line-height: 1.6; }

.search-area { display: flex; gap: 16px; align-items: center; width: 100%; max-width: 800px; }
.main-search-input { flex: 1; background: #fff; border-radius: 30px; border: 1px solid #165DFF; box-shadow: 0 4px 10px rgba(22,93,255,0.1); }
.main-search-input :deep(.arco-input-wrapper) { border-radius: 30px; padding-left: 20px; background: #fff; }
.main-search-input :deep(.arco-input-search-btn) { border-radius: 0 30px 30px 0; background: transparent; color: #165DFF; border-left: 1px solid #f2f3f5; }
.action-btn { background: #fff; border: 1px solid #a9c5ff; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); color: #165DFF; }

.advanced-filter-panel { margin-top: 16px; padding: 24px; background: #fff; border-radius: 8px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); width: 100%; max-width: 800px; border: 1px solid #e5e6eb; }
.filter-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }

.banner-decoration { position: absolute; right: 0; top: 0; width: 40%; height: 100%; overflow: hidden; pointer-events: none; }
.decoration-cube { position: absolute; top: 40px; right: 100px; width: 200px; height: 200px; background: linear-gradient(135deg, #e8f3ff 0%, #cce4ff 100%); transform: rotate(-15deg) skew(-10deg); border-radius: 20px; box-shadow: -20px 20px 40px rgba(22,93,255,0.1); }

.main-content { padding: 0 40px 40px; width: 100%; max-width: 1800px; margin: -40px auto 0; position: relative; z-index: 3; }

.content-section { background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.section-title { font-size: 16px; font-weight: 600; color: #1d2129; margin: 0; }
.more-link { font-size: 13px; }

.collection-card { border-radius: 8px; border: 1px solid #e5e6eb; cursor: pointer; transition: all 0.2s; }
.collection-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.08); border-color: #165dff; }
.collection-card :deep(.arco-card-body) { padding: 20px; }
.card-content { display: flex; flex-direction: column; }
.card-icon-box { width: 40px; height: 40px; border-radius: 8px; background: linear-gradient(135deg, #165DFF, #722ED1); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 20px; margin-bottom: 12px; }
.collection-name { font-size: 15px; font-weight: 600; color: #1d2129; margin: 0 0 8px 0; }
.collection-desc { font-size: 13px; color: #86909c; margin: 0 0 12px 0; }
.collection-meta { display: flex; align-items: center; gap: 12px; }
.table-count { font-size: 13px; color: #86909c; }

.data-flow-container { display: flex; justify-content: space-between; align-items: stretch; gap: 24px; margin-top: 16px; }
.system-column { flex: 1; display: flex; flex-direction: column; background: #f7f8fa; border-radius: 8px; overflow: hidden; border: 1px solid #e5e6eb; }
.relationship-card { display: flex; align-items: center; background: #fff; padding: 20px; border-bottom: 1px solid #e5e6eb; }
.column-list { padding: 16px 20px; background: #fff; }
.asset-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #f2f3f5; cursor: pointer; transition: background-color 0.2s; }
.asset-item:hover { background-color: #f2f3f5; padding: 10px 8px; margin: 0 -8px; border-radius: 4px; }
.asset-item:last-child { border-bottom: none; }
.asset-content { display: flex; align-items: center; gap: 8px; }
.asset-icon { color: #165DFF; font-size: 16px; }
.asset-name { font-size: 14px; color: #4e5969; font-weight: 500; }
.asset-count { font-size: 12px; color: #86909c; }
.arrow-connector { color: #c9cdd4; font-size: 24px; display: flex; align-items: center; }

.card-icon { width: 48px; height: 48px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 24px; margin-right: 16px; color: #fff; flex-shrink: 0; }
.resource-bg { background: linear-gradient(135deg, #165DFF 0%, #722ED1 100%); }
.asset-bg { background: linear-gradient(135deg, #00B42A 0%, #00D25C 100%); }
.element-bg { background: linear-gradient(135deg, #FF7D00 0%, #FF9A2E 100%); }
.governance-bg { background: linear-gradient(135deg, #F53F3F 0%, #F76560 100%); }
.card-info h4 { margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1d2129; }
.card-info p { margin: 0; font-size: 12px; color: #86909c; line-height: 1.5; }

.governance-foundation { display: flex; align-items: center; background: #fff; border: 1px solid #ffccc7; border-left: 4px solid #F53F3F; border-radius: 4px; padding: 20px 24px; margin-top: 16px; }
.foundation-header { display: flex; align-items: center; width: 280px; flex-shrink: 0; border-right: 1px solid #e5e6eb; padding-right: 32px; margin-right: 32px; }
.foundation-content { flex: 1; }
.governance-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
.governance-item { display: flex; align-items: center; justify-content: space-between; background: #f9f9f9; padding: 16px; border-radius: 6px; transition: all 0.2s; }
.governance-item:hover { background: #fff; border-color: #ffccc7; box-shadow: 0 4px 12px rgba(0,0,0,0.05); transform: translateY(-2px); }
</style>
