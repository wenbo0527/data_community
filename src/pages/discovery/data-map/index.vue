<template>
  <div class="data-map-container">
    <!-- 顶部 Banner 区域 -->
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
            placeholder="输入关键词进行查询，支持各业务/标签/分组/指标等多个关键字，或尝试执行路径定义搜索"
            search-button
            size="large"
            @search="handleSearch"
          >
            <template #button-icon>
              <icon-search />
            </template>
          </a-input-search>
          <a-button 
            class="action-btn" 
            size="large"
            @click="toggleAdvancedFilter"
            :type="showAdvancedFilter ? 'primary' : 'secondary'"
          >
            <template #icon><icon-filter /></template>
            高级
          </a-button>
          <a-button class="action-btn" size="large" @click="handleFollow">
            <template #icon><icon-heart /></template>
            关注
          </a-button>
        </div>

        <!-- 高级筛选面板 -->
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
        <!-- 装饰背景，使用 CSS 或 SVG -->
        <div class="decoration-circle"></div>
        <div class="decoration-cube"></div>
      </div>
    </div>

    <!-- 主体内容区域 -->
    <div class="main-content">
      <!-- 常用表集合 -->
      <div class="content-section">
        <div class="section-header">
          <h3 class="section-title">常用表集合</h3>
          <a-link class="more-link" @click="router.push('/discovery/data-map/collections')">查看更多 <icon-right /></a-link>
        </div>
        
        <TableCollectionGrid
          :collections="collections"
          :show-header="false"
          :page-size="8"
          @collection-click="handleCollectionClick"
        />
      </div>

      <!-- 数据体系全景 (合并了原侧边栏内容) -->
      <div class="content-section" style="margin-top: 24px;">
        <div class="section-header">
          <h3 class="section-title">数据体系全景</h3>
        </div>
        
        <div class="data-map-wrapper">
             <div class="data-flow-container">
               <!-- 数据资源 -->
               <div class="system-column">
                 <div class="relationship-card">
                   <div class="card-icon resource-bg">
                     <icon-apps />
                   </div>
                   <div class="card-info">
                     <h4>数据资源</h4>
                     <p>原始数据的汇聚与接入，包含各类业务系统产生的源数据、API接口及外部数据源。</p>
                   </div>
                 </div>
                 <div class="column-list">
                    <a-list :bordered="false" class="asset-list">
                      <a-list-item 
                        v-for="(item, index) in dataResources" 
                        :key="index" 
                        class="asset-item clickable-item"
                        @click="handleResourceClick(item)"
                      >
                        <div class="asset-content">
                          <icon-apps class="asset-icon" v-if="item.icon === 'icon-apps'" />
                          <icon-history class="asset-icon" v-else-if="item.icon === 'icon-history'" />
                          <icon-file class="asset-icon" v-else-if="item.icon === 'icon-file'" />
                          <icon-cloud class="asset-icon" v-else-if="item.icon === 'icon-cloud'" />
                          <div class="resource-info">
                            <span class="asset-name">{{ item.name }}</span>
                            <span v-if="item.description" class="resource-desc" :title="item.description">{{ item.description }}</span>
                          </div>
                        </div>
                        <span class="asset-count">{{ item.count }}</span>
                        <!-- 悬浮详情 -->
                        <div class="hover-details" v-if="item.details && item.details.length">
                          <div class="detail-item" v-for="(detail, dIndex) in item.details" :key="dIndex">
                            • {{ detail }}
                          </div>
                        </div>
                      </a-list-item>
                    </a-list>
                 </div>
               </div>
               
               <div class="arrow-connector">
                 <icon-right />
               </div>
    
               <!-- 数据资产 -->
               <div class="system-column">
                 <div class="relationship-card">
                   <div class="card-icon asset-bg">
                     <icon-storage />
                   </div>
                   <div class="card-info">
                     <h4>数据资产</h4>
                     <p>经过治理、加工和标准化的数据集合，按业务域分层组织，具备明确的业务价值。</p>
                   </div>
                 </div>
                 <div class="column-list">
                    <a-list :bordered="false" class="asset-list">
                      <a-list-item 
                        v-for="(item, index) in dataAssets" 
                        :key="index" 
                        class="asset-item clickable-item"
                        @click="handleAssetClick(item)"
                      >
                        <div class="asset-content">
                          <icon-user-group class="asset-icon" v-if="item.icon === 'icon-user-group'" />
                          <icon-branch class="asset-icon" v-else-if="item.icon === 'icon-transaction'" />
                          <icon-common class="asset-icon" v-else-if="item.icon === 'icon-common'" />
                          <icon-notification class="asset-icon" v-else-if="item.icon === 'icon-notification'" />
                          <icon-safe class="asset-icon" v-else-if="item.icon === 'icon-shield'" />
                          <icon-safe class="asset-icon" v-else-if="item.icon === 'icon-safe'" />
                          <icon-branch class="asset-icon" v-else-if="item.icon === 'icon-branch'" />
                          <icon-public class="asset-icon" v-else-if="item.icon === 'icon-public'" />
                          <icon-storage class="asset-icon" v-else />
                          <span class="asset-name">{{ item.name }}</span>
                        </div>
                        <span class="asset-count">{{ item.count }}</span>
                      </a-list-item>
                    </a-list>
                 </div>
               </div>
    
               <div class="arrow-connector">
                 <icon-right />
               </div>
    
               <!-- 数据要素 -->
               <div class="system-column">
                 <div class="relationship-card">
                   <div class="card-icon element-bg">
                     <icon-bulb />
                   </div>
                   <div class="card-info">
                     <h4>数据要素</h4>
                     <p>面向业务场景的高价值数据形态，如核心指标、业务标签，直接赋能业务决策。</p>
                   </div>
                 </div>
                 <div class="column-list">
                    <a-list :bordered="false" class="asset-list">
                      <a-list-item 
                        v-for="(item, index) in dataElements" 
                        :key="index" 
                        class="asset-item clickable-item"
                        @click="handleElementClick(item)"
                      >
                        <div class="asset-content">
                          <icon-trophy class="asset-icon" v-if="item.icon === 'icon-trophy'" />
                          <icon-tag class="asset-icon" v-else-if="item.icon === 'icon-tag'" />
                          <icon-code class="asset-icon" v-else-if="item.icon === 'icon-code'" />
                          <icon-mind-mapping class="asset-icon" v-else-if="item.icon === 'icon-mind-mapping'" />
                          <icon-bulb class="asset-icon" v-else />
                          <span class="asset-name">{{ item.name }}</span>
                        </div>
                        <span class="asset-count">{{ item.count }}</span>
                      </a-list-item>
                    </a-list>
                 </div>
               </div>
             </div>

             <!-- 数据治理 (Foundation Layer) -->
             <div class="governance-foundation">
               <div class="foundation-header">
                 <div class="card-icon governance-bg">
                   <icon-settings />
                 </div>
                 <div class="card-info">
                   <h4>数据治理</h4>
                   <p>贯穿全生命周期的标准规范与质量保障体系</p>
                 </div>
               </div>
               <div class="foundation-content">
                  <div class="governance-grid">
                    <div 
                      v-for="(item, index) in dataGovernance" 
                      :key="index" 
                      class="governance-item"
                    >
                      <div class="asset-content">
                        <icon-book class="asset-icon" v-if="item.icon === 'icon-book'" />
                        <icon-check-circle class="asset-icon" v-else-if="item.icon === 'icon-check-circle'" />
                        <icon-lock class="asset-icon" v-else-if="item.icon === 'icon-lock'" />
                        <icon-mind-mapping class="asset-icon" v-else-if="item.icon === 'icon-mind-mapping'" />
                        <icon-settings class="asset-icon" v-else />
                        <span class="asset-name">{{ item.name }}</span>
                      </div>
                      <span class="asset-count">{{ item.count }}</span>
                    </div>
                  </div>
               </div>
             </div>
        </div>
      </div>
    </div>

    <!-- 悬浮按钮 -->
    <div class="floating-btn">
      <icon-notification />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  IconSearch, IconStar, IconSort, IconEye, IconRight, 
  IconFire, IconStorage, IconFolder, IconDriveFile,
  IconApps, IconBulb, IconNotification, IconFilter,
  IconCloud, IconTrophy, IconTag, IconCode, IconMindMapping,
  IconSafe, IconUserGroup, IconCommon, IconBranch, IconPublic, IconSettings, IconBook, IconCheckCircle, IconLock,
  IconHeart, IconHistory, IconFile
} from '@arco-design/web-vue/es/icon'
import { Message, Modal } from '@arco-design/web-vue'
import TableCollectionGrid from './components/TableCollectionGrid.vue'
import { 
  mockRecentlyViewed, 
  mockDataAssets, 
  mockDataResources, 
  mockDataElements, 
  mockBusinessRecommendations,
  mockDataGovernance 
} from '@/mock/data-map.ts'
import mockData from '@/mock/data-map.ts'

const router = useRouter()

console.log('DataMap: mockData loaded', mockData);
if (mockData && mockData.collections) {
    console.log('DataMap: collections count', mockData.collections.length);
} else {
    console.error('DataMap: mockData.collections is missing!', mockData);
}

// 状态管理
const searchForm = ref({
  keyword: '',
  include: '',
  exclude: '',
  module: ''
})
const showAdvancedFilter = ref(false)

// 从 Mock 数据中获取
const recentlyViewed = ref(mockRecentlyViewed || [])
const dataAssets = ref(mockDataAssets || [])
const dataResources = ref(mockDataResources || [])
const dataElements = ref(mockDataElements || [])
const dataGovernance = ref(mockDataGovernance || [])
const collections = ref(mockData.collections || [])

// 关注功能
const handleFollow = () => {
  // 检查是否是首次关注（这里用 localStorage 模拟）
  const hasFollowedBefore = localStorage.getItem('has_followed_assets')
  
  if (!hasFollowedBefore) {
    Modal.info({
      title: '关注提示',
      content: '关注资产后，您将通过数字社区首页和数据服务公众号收到资产变更相关的通知。',
      okText: '知道了',
      onOk: () => {
        localStorage.setItem('has_followed_assets', 'true')
        Message.success('关注成功')
      }
    })
  } else {
    Message.success('关注成功')
  }
}

// 搜索处理
const handleSearch = () => {
  if (!searchForm.value.keyword && !showAdvancedFilter.value) {
    Message.warning('请输入搜索关键词')
    return
  }
  
  // 模拟搜索跳转
  router.push({
    path: '/discovery/search',
    query: {
      q: searchForm.value.keyword,
      include: searchForm.value.include,
      exclude: searchForm.value.exclude,
      module: searchForm.value.module
    }
  })
}

const toggleAdvancedFilter = () => {
  showAdvancedFilter.value = !showAdvancedFilter.value
}

const resetSearch = () => {
  searchForm.value = {
    keyword: '',
    include: '',
    exclude: '',
    module: ''
  }
}

// 路由跳转处理
const handleAssetClick = (item: any) => {
  // 数据资产点击 - 按业务域筛选数据表
  router.push({ 
    path: '/discovery/search', 
    query: { 
      type: 'table',
      domain: item.name // 将名称（如'用户域'）作为业务域筛选
    } 
  })
}

const handleResourceClick = (item: any) => {
  // 数据资源点击 - 统一跳转搜索页，作为关键词或来源筛选
  // 提取描述中的关键词作为搜索词，例如 "核心系统"
  let keyword = ''
  if (item.description) {
    const parts = item.description.split('、')
    if (parts.length > 0) keyword = parts[0]
  }
  
  router.push({ 
    path: '/discovery/search', 
    query: { 
      q: keyword || item.name,
      type: 'table' // 资源最终是看表
    } 
  })
}

const handleElementClick = (item: any) => {
  if (item.name === '核心指标') {
    router.push({ path: '/discovery/unified-metrics' })
  } else if (item.name === '业务标签') {
    router.push({ path: '/discovery/customer360' })
  } else if (item.name === '数据变量') {
    router.push({ path: '/variables/map' })
  } else if (item.name === '模型特征') {
    // 跳转到特征中心
    router.push({ path: '/risk/model-offline-analysis/feature-center' })
  } else {
    // 默认跳搜索
    router.push({ 
      path: '/discovery/search', 
      query: { q: item.name } 
    })
  }
}

// 集合点击处理
const handleCollectionClick = (collection: any) => {
  // 跳转到集合详情页
  router.push(`/discovery/data-map/collection/${collection.id}`)
}

</script>

<style scoped>
.data-map-container {
  min-height: 100vh;
  background: #f7f8fa;
  position: relative;
  overflow-x: hidden;
}

/* Banner Section */
.banner-section {
  background: linear-gradient(180deg, #E6F0FF 0%, #F7F8FA 100%);
  padding: 40px 0; /* Remove horizontal padding from wrapper */
  position: relative;
  display: flex;
  justify-content: center; /* Center the content wrapper */
  align-items: center;
  min-height: 320px;
  height: auto;
}

.banner-content {
  width: 100%;
  max-width: 1800px; /* Align with main-content max-width */
  z-index: 2;
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 0 40% 0 40px; /* Top, Right(decoration space), Bottom, Left(alignment) */
  box-sizing: border-box;
}

.search-area {
  display: flex;
  gap: 16px;
  align-items: center;
  width: 100%;
  max-width: 800px;
  position: relative;
}

.advanced-filter-panel {
  margin-top: 16px;
  padding: 24px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  width: 100%;
  max-width: 800px;
  border: 1px solid #e5e6eb;
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
}

.action-btn {
  background: #fff;
  border: 1px solid #a9c5ff;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  color: #165DFF;
}

.action-btn:hover {
  background: #f2f3f5;
  color: #165DFF;
  border-color: #165DFF;
}

.action-btn[type="primary"] {
  background: #e8f3ff;
  border-color: #165DFF;
  color: #165DFF;
}

.banner-title {
  font-size: 44px;
  font-weight: bold;
  color: #1d2129;
  margin: 0;
  line-height: 1.2;
}

.version-tag {
  font-size: 36px;
  font-weight: 600;
  background: linear-gradient(90deg, #165DFF 0%, #00B42A 100%);
  -webkit-background-clip: text;
  color: transparent;
  margin-left: 12px;
}

.banner-subtitle {
  font-size: 14px;
  color: #86909c;
  margin-bottom: 32px;
  max-width: 600px;
  line-height: 1.6;
}

.search-area {
  display: flex;
  gap: 16px;
  align-items: center;
  width: 100%;
  max-width: 800px;
}

.main-search-input {
  flex: 1;
  background: #fff;
  border-radius: 30px;
  border: 1px solid #165DFF;
  box-shadow: 0 4px 10px rgba(22, 93, 255, 0.1);
}

.main-search-input :deep(.arco-input-wrapper) {
  border-radius: 30px;
  padding-left: 20px;
  background: #fff;
}

.main-search-input :deep(.arco-input-search-btn) {
  border-radius: 0 30px 30px 0;
  background: transparent;
  color: #165DFF;
  border-left: 1px solid #f2f3f5;
}

.favorite-btn {
  background: #fff;
  color: #165DFF;
  border: 1px solid #a9c5ff;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

/* Decoration */
.banner-decoration {
  position: absolute;
  right: 0;
  top: 0;
  width: 40%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
}
/* 这里可以使用背景图，为了简单模拟效果，用CSS画几个图形 */
.decoration-cube {
  position: absolute;
  top: 40px;
  right: 100px;
  width: 200px;
  height: 200px;
  background: linear-gradient(135deg, #e8f3ff 0%, #cce4ff 100%);
  transform: rotate(-15deg) skew(-10deg);
  border-radius: 20px;
  box-shadow: -20px 20px 40px rgba(22, 93, 255, 0.1);
}

/* Main Content */
.main-content {
  padding: 0 40px 40px;
  width: 100%;
  max-width: 1800px; /* Increased from 1600px for larger screens */
  margin: -40px auto 0;
  position: relative;
  z-index: 3;
}

.content-section {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
  margin: 0;
}

.sort-options {
  font-size: 12px;
  color: #86909c;
  display: flex;
  align-items: center;
  gap: 8px;
}

.sort-item {
  cursor: pointer;
}
.sort-item.active {
  color: #165DFF;
  font-weight: 500;
}

/* Recent List */
.recent-item {
  padding: 12px 0;
  border-bottom: 1px solid #f2f3f5;
}
.recent-item:last-child {
  border-bottom: none;
}

.recent-item-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.item-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: bold;
  font-size: 14px;
}

.item-name {
  font-size: 14px;
  color: #1d2129;
}

.action-item {
  color: #86909c;
  font-size: 12px;
  margin-left: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Recommendation Grid */
.recommendation-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.recommend-card {
  border-radius: 8px;
  border: 1px solid #e5e6eb;
  background: #fff;
  transition: all 0.3s;
}
.recommend-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.recommend-card :deep(.arco-card-body) {
  padding: 16px;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: #1d2129;
  margin-bottom: 4px;
}

.card-subtitle {
  font-size: 12px;
  color: #86909c;
  margin-bottom: 12px;
}

.card-stats {
  display: flex;
  gap: 12px;
}

.stat-item {
  font-size: 12px;
  color: #4e5969;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Sidebar */
.sidebar-section {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.sidebar-title {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
  margin: 0 0 16px 0;
}

.asset-item {
  padding: 10px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative; /* Added relative positioning for hover context */
}

.hover-details {
  display: none;
  position: absolute;
  left: 100%;
  top: 0;
  background: #fff;
  border: 1px solid #e5e6eb;
  border-radius: 4px;
  padding: 12px;
  width: 240px; /* Wider for details */
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  z-index: 100; /* Ensure it's above other elements */
  pointer-events: none; /* Allow clicking through if needed, but usually fine */
  margin-left: 10px; /* Space from item */
}

.asset-item:hover .hover-details {
  display: block;
}

.detail-item {
  font-size: 12px;
  color: #4e5969; /* Darker text for readability */
  line-height: 1.6;
  margin-bottom: 4px;
}

.clickable-item {
  cursor: pointer;
  transition: background-color 0.2s;
  padding: 10px 8px;
  margin: 0 -8px;
  border-radius: 4px;
}

.clickable-item:hover {
  background-color: #f2f3f5;
}

.asset-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.asset-icon {
  color: #165DFF;
  font-size: 16px;
}

.resource-info {
  display: flex;
  flex-direction: column;
  margin-left: 8px;
}

.resource-desc {
  font-size: 10px;
  color: #86909c;
  margin-top: 2px;
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.asset-name {
  font-size: 14px;
  color: #4e5969;
  font-weight: 500;
}

.asset-count {
  font-size: 12px;
  color: #86909c;
}

.new-tag {
  margin-left: 4px;
  font-size: 10px;
  transform: scale(0.9);
}

/* Floating Button */
.floating-btn {
  position: fixed;
  bottom: 40px;
  right: 40px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #722ED1 0%, #165DFF 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 24px;
  box-shadow: 0 4px 12px rgba(114, 46, 209, 0.4);
  cursor: pointer;
  z-index: 100;
  transition: transform 0.3s;
}
.floating-btn:hover {
  transform: scale(1.1);
}

/* Responsive */
@media (max-width: 1200px) {
  .banner-content {
    max-width: 80%;
  }
}

@media (max-width: 768px) {
  .banner-section {
    padding: 20px;
    height: auto;
    flex-direction: column;
    align-items: flex-start;
  }
  
  .banner-content {
    max-width: 100%;
  }
  
  .main-content {
    padding: 20px;
    margin-top: 0;
  }
  
  .recommendation-grid {
    grid-template-columns: 1fr;
  }
}

/* Data Relationship Section */
.data-map-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px 0;
}

.data-flow-container {
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  gap: 24px;
}

.system-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f7f8fa;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e5e6eb;
}

/* ... existing styles ... */
.governance-foundation {
  display: flex;
  align-items: center;
  /* background: linear-gradient(90deg, #fff0f0 0%, #fff 100%); */
  background: #fff;
  border: 1px solid #ffccc7; /* Keep the red border hint */
  border-left: 4px solid #F53F3F; /* Stronger indicator */
  border-radius: 4px;
  padding: 20px 24px;
  margin-top: 16px; /* Increased margin */
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);
}

.foundation-header {
  display: flex;
  align-items: center;
  width: 280px;
  flex-shrink: 0;
  border-right: 1px solid #e5e6eb; /* Cleaner separator */
  padding-right: 32px;
  margin-right: 32px;
}

.foundation-content {
  flex: 1;
}

.governance-grid {
  display: grid; /* Use Grid for better control */
  grid-template-columns: repeat(4, 1fr); /* 4 columns */
  gap: 20px;
}

.governance-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f9f9f9; /* Slight background for items */
  padding: 16px;
  border-radius: 6px;
  border: 1px solid transparent;
  transition: all 0.2s;
}

.governance-item:hover {
  background: #fff;
  border-color: #ffccc7;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  transform: translateY(-2px);
}
/* ... existing styles ... */

.relationship-card {
  /* Remove flex:1 since it's now inside a column */
  display: flex;
  align-items: center;
  /* background: #f7f8fa; Removed background, let column handle it or keep for header effect */
  background: #fff; /* Make header distinct */
  padding: 20px;
  border-bottom: 1px solid #e5e6eb;
  /* border-radius: 8px; Removed */
  transition: all 0.3s;
}

.relationship-card:hover {
  /* background: #fff; */
  /* box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); Removed hover effect on header only */
  /* transform: translateY(-2px); Removed */
}

.column-list {
  padding: 16px 20px;
  flex: 1; /* Take remaining height */
  background: #fff; /* White background for list */
}

.asset-list .asset-item {
  padding: 12px 0;
  border-bottom: 1px solid #f2f3f5;
}

.asset-list .asset-item:last-child {
  border-bottom: none;
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-right: 16px;
  color: #fff;
  flex-shrink: 0;
}

.resource-bg {
  background: linear-gradient(135deg, #165DFF 0%, #722ED1 100%);
}

.asset-bg {
  background: linear-gradient(135deg, #00B42A 0%, #00D25C 100%);
}

.element-bg {
  background: linear-gradient(135deg, #FF7D00 0%, #FF9A2E 100%);
}

.governance-bg {
  background: linear-gradient(135deg, #F53F3F 0%, #F76560 100%);
}

.card-info h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
}

.card-info p {
  margin: 0;
  font-size: 12px;
  color: #86909c;
  line-height: 1.5;
}

.arrow-connector {
  margin: 0; /* Remove margin since gap handles it */
  color: #c9cdd4;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>