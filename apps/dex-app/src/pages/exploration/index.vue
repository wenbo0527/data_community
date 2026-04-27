<template>
  <div class="workbench-container">
    <!-- 1. 全局探索区 (Hero & Search) -->
    <div class="hero-section">
      <div class="hero-wrapper">
        <div class="greeting-area">
          <div class="greeting-title">早安，分析师</div>
          <div class="greeting-subtitle">准备好开始今天的洞察了吗？</div>
        </div>
        <div class="search-area">
          <a-input-search
            placeholder="搜索表、指标、报表或仪表盘..."
            size="large"
            button-text="搜索"
            search-button
            class="global-search"
          />
          <div class="search-tags">
            <span>热门搜索：</span>
            <a-tag size="small" class="search-tag">用户留存</a-tag>
            <a-tag size="small" class="search-tag">Q1销售</a-tag>
            <a-tag size="small" class="search-tag">活跃度指标</a-tag>
          </div>
        </div>
      </div>
    </div>

    <div class="main-content">
      <!-- 2. 快捷作业区 (Quick Actions) -->
      <div class="section-container">
        <div class="section-header">
          <div class="section-title">快捷作业</div>
          <div class="section-subtitle">高频分析工具一键直达</div>
        </div>
        <a-row :gutter="[16, 16]">
          <a-col :span="6" v-for="tool in analysisTools" :key="tool.key">
            <div class="tool-card" @click="handleAnalysisClick(tool)">
              <div class="tool-icon" :style="{ background: tool.bgColor }">
                <component :is="tool.icon" size="24" :style="{ color: tool.color }" />
              </div>
              <div class="tool-info">
                <div class="tool-name">{{ tool.title }}</div>
                <div class="tool-desc">{{ tool.desc }}</div>
              </div>
              <div class="tool-action">
                <IconRight />
              </div>
            </div>
          </a-col>
        </a-row>
      </div>

      <!-- 3. 动态资产区 (My Workspace) -->
      <div class="workspace-section">
        <a-row :gutter="24">
          <!-- 左侧：最近访问 -->
          <a-col :span="16">
            <a-card class="workspace-card" :bordered="false">
              <template #title>
                <div class="card-header">
                  <span class="header-title">最近访问</span>
                  <a-link>查看全部</a-link>
                </div>
              </template>
              <a-list :data="recentVisits" :bordered="false">
                <template #item="{ item }">
                  <a-list-item class="visit-item">
                    <a-list-item-meta>
                      <template #avatar>
                        <div class="visit-icon" :class="item.type">
                          <component :is="item.icon" />
                        </div>
                      </template>
                      <template #title>
                        <span class="visit-title">{{ item.title }}</span>
                      </template>
                      <template #description>
                        <span class="visit-time">{{ item.time }}</span>
                        <span class="visit-desc">{{ item.desc }}</span>
                      </template>
                    </a-list-item-meta>
                    <template #actions>
                      <a-button type="text" size="small">继续</a-button>
                    </template>
                  </a-list-item>
                </template>
              </a-list>
            </a-card>
          </a-col>
          
          <!-- 右侧：数据资产收藏 -->
          <a-col :span="8">
            <a-card class="workspace-card" :bordered="false">
              <template #title>
                <div class="card-header">
                  <span class="header-title">数据资产收藏</span>
                  <a-button type="text" size="mini"><template #icon><IconPlus /></template></a-button>
                </div>
              </template>
              <div class="favorites-list">
                <div v-for="fav in favorites" :key="fav.id" class="favorite-item">
                  <div class="fav-icon" :class="fav.type">
                    <component :is="fav.icon" />
                  </div>
                  <div class="fav-content">
                    <div class="fav-title">{{ fav.title }}</div>
                    <div class="fav-type">{{ fav.typeLabel }}</div>
                  </div>
                  <div class="fav-action">
                    <a-button type="text" size="mini" class="copy-btn">
                      <template #icon><IconCopy /></template>
                    </a-button>
                  </div>
                </div>
              </div>
            </a-card>
          </a-col>
        </a-row>
      </div>

      <!-- 4. 快捷报表区 (Quick Reports) -->
      <div class="section-container quick-access-section">
        <div class="section-header">
          <div class="section-title">快捷报表</div>
        </div>
        <div class="quick-access-list">
          <a-card 
            v-for="link in quickReports" 
            :key="link.key" 
            class="quick-link-card"
            hoverable
            @click="navigate(link.path)"
          >
            <div class="quick-link-content">
              <div class="quick-link-icon" :style="{ color: link.color, background: link.bgColor }">
                <component :is="link.icon" size="20" />
              </div>
              <div class="quick-link-text">{{ link.title }}</div>
            </div>
          </a-card>
          
          <a-button type="dashed" class="add-quick-link-btn" @click="showAddModal = true">
            <template #icon><IconPlus /></template>
            添加报表
          </a-button>
        </div>
      </div>

      <!-- 5. 常用工具区 (Frequent Tools) -->
      <div class="section-container tool-access-section">
        <div class="section-header">
          <div class="section-title">常用工具</div>
        </div>
        <div class="quick-access-list">
          <a-card 
            v-for="tool in frequentTools" 
            :key="tool.key" 
            class="quick-link-card"
            hoverable
            @click="navigate(tool.path)"
          >
            <div class="quick-link-content">
              <div class="quick-link-icon" :style="{ color: tool.color, background: tool.bgColor }">
                <component :is="tool.icon" size="20" />
              </div>
              <div class="quick-link-text">{{ tool.title }}</div>
            </div>
          </a-card>
        </div>
      </div>
    </div>

    <!-- 添加快捷访问弹窗 -->
    <a-modal v-model:visible="showAddModal" title="添加快捷报表" @ok="handleAddQuickLink">
      <a-form :model="addForm">
        <a-form-item field="type" label="类型" initial-value="report">
          <a-radio-group v-model="addForm.type" type="button">
            <a-radio value="report">报表</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item field="target" label="选择报表">
          <a-select v-model="addForm.target" placeholder="请选择要添加的报表" allow-search>
            <a-option v-for="report in availableReports" :key="report.id" :value="report.id">
              {{ report.name }}
            </a-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { 
  IconSearch, 
  IconDashboard, 
  IconUnorderedList, 
  IconApps,
  IconRight,
  IconCode,
  IconExperiment,
  IconBarChart,
  IconFile,
  IconPlus,
  IconStarFill,
  IconCommon,
  IconStorage,
  IconUserGroup,
  IconCopy,
  IconThunderbolt
} from '@arco-design/web-vue/es/icon'

const router = useRouter()
const navigate = (path) => router.push(path)
const showAddModal = ref(false)
const addForm = reactive({
  type: 'report',
  target: ''
})

// 模拟可添加的报表数据
const availableReports = [
  { id: 'r1', name: 'Q1 季度销售报表', path: '/report/q1-sales' },
  { id: 'r2', name: '用户留存分析日报', path: '/report/retention-daily' },
  { id: 'r3', name: '产品活跃度周报', path: '/report/activity-weekly' },
  { id: 'r4', name: '渠道转化效果监控', path: '/report/channel-conversion' }
]

const goDiscovery = () => router.push('/discovery/index')
const goMarketing = () => router.push('/marketing/index')
const goExternal = () => router.push('/external-data-v1/index')
const goManagement = () => router.push('/management/index')

// 快捷作业工具
const analysisTools = [
  { key: 'adhoc', title: '统一查询', icon: IconCode, desc: 'Ad-hoc SQL即席查询工具', color: '#165DFF', bgColor: '#e8f3ff' },
  { key: 'jupyter', title: 'JupyterHub', icon: IconExperiment, desc: '交互式数据科学开发环境', color: '#722ED1', bgColor: '#f9f0ff' },
  { key: 'report', title: '智慧报表', icon: IconBarChart, desc: '拖拽式可视化报表生成', color: '#00B42A', bgColor: '#e8ffea' },
  { key: 'detail', title: '明细查询', icon: IconFile, desc: '海量底层明细数据检索', color: '#FF7D00', bgColor: '#fff7e8' }
]

const handleAnalysisClick = (tool) => {
  Message.info(`正在前往 ${tool.title} ...`)
}

// 最近访问 Mock 数据
const recentVisits = [
  { id: 1, title: '用户留存分析_20240520', type: 'sql', icon: IconCode, time: '昨天 14:30', desc: 'SQL 查询' },
  { id: 2, title: 'Q1 销售业绩复盘', type: 'report', icon: IconBarChart, time: '今天 09:15', desc: '智慧报表' },
  { id: 3, title: '流量监控大屏', type: 'dashboard', icon: IconDashboard, time: '2小时前', desc: '仪表盘' },
  { id: 4, title: 'VIP客户名单导出', type: 'file', icon: IconFile, time: '3天前', desc: '明细导出' },
]

// 数据资产收藏 Mock 数据
const favorites = [
  { id: 1, title: 'ods_user_log_di', typeLabel: '核心流水表', type: 'table', icon: IconFile },
  { id: 2, title: 'dim_user_info_df', typeLabel: '用户维表', type: 'table', icon: IconFile },
  { id: 3, title: 'active_user_daily', typeLabel: '日活指标', type: 'metric', icon: IconThunderbolt },
]

// 快捷报表链接
const quickReports = ref([
  { key: 'ceo_board', title: 'CEO 经营看板', path: '/marketing/index', icon: IconDashboard, color: '#165DFF', bgColor: '#e8f3ff' }
])

// 常用工具链接
const frequentTools = [
  { key: 'data_import', title: '数据导入', path: '/external-data-v1/index', icon: IconUnorderedList, color: '#00B42A', bgColor: '#e8ffea' },
  { key: 'permission', title: '权限申请', path: '/management/index', icon: IconApps, color: '#FF7D00', bgColor: '#fff7e8' },
  { key: 'audience', title: '人群圈选', path: '/marketing/audience', icon: IconUserGroup, color: '#722ED1', bgColor: '#f9f0ff' }
]

const handleAddQuickLink = () => {
  if (!addForm.target) {
    Message.warning('请选择报表')
    return
  }
  
  const report = availableReports.find(r => r.id === addForm.target)
  if (report) {
    // 检查是否已存在
    if (quickReports.value.some(link => link.title === report.name)) {
      Message.warning('该报表已在快捷访问列表中')
      return
    }

    quickReports.value.push({
      key: `report_${Date.now()}`,
      title: report.name,
      path: report.path,
      icon: IconBarChart, // 统一使用报表图标
      color: '#165DFF', // 使用统一的主题色
      bgColor: '#e8f3ff'
    })
    Message.success('添加成功')
    showAddModal.value = false
    // 重置表单
    addForm.target = ''
  }
}
</script>

<style scoped>
.workbench-container {
  width: 100%;
  height: 100%;
  background-color: #f2f3f5;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

/* Hero Section */
.hero-section {
  background: linear-gradient(180deg, #e0f2fe 0%, #f2f3f5 100%);
  padding: 40px 24px 24px;
}

.hero-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 40px;
}

.greeting-title {
  font-size: 28px;
  font-weight: 700;
  color: #1d2129;
  margin-bottom: 8px;
}

.greeting-subtitle {
  font-size: 16px;
  color: #4e5969;
}

.search-area {
  flex: 1;
  max-width: 600px;
}

.global-search {
  width: 100%;
  background: #fff;
  border-radius: 4px;
}

.search-tags {
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #86909c;
}

.search-tag {
  cursor: pointer;
  background-color: rgba(255,255,255,0.6);
}

/* Main Content */
.main-content {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 0 24px 40px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Section Common */
.section-header {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 16px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1d2129;
}

.section-subtitle {
  font-size: 13px;
  color: #86909c;
}

/* Tool Cards */
.tool-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.tool-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  border-color: #e5e6eb;
}

.tool-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.tool-info {
  flex: 1;
  overflow: hidden;
}

.tool-name {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
  margin-bottom: 4px;
}

.tool-desc {
  font-size: 12px;
  color: #86909c;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tool-action {
  color: #c9cdd4;
}

/* Workspace */
.workspace-card {
  background: #fff;
  border-radius: 8px;
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
}

/* Visit List */
.visit-item {
  padding: 12px 0;
  cursor: pointer;
}

.visit-item:hover {
  background-color: #f7f8fa;
}

.visit-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #f2f3f5;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4e5969;
}

.visit-icon.sql { color: #165DFF; background: #e8f3ff; }
.visit-icon.report { color: #00B42A; background: #e8ffea; }
.visit-icon.dashboard { color: #722ED1; background: #f9f0ff; }

.visit-title {
  font-size: 14px;
  font-weight: 500;
  color: #1d2129;
}

.visit-time {
  font-size: 12px;
  color: #86909c;
  margin-right: 8px;
}

.visit-desc {
  font-size: 12px;
  color: #c9cdd4;
}

/* Favorites */
.favorites-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.favorite-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f7f8fa;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.favorite-item:hover {
  background: #f2f3f5;
}

.fav-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  font-size: 16px;
}

.fav-icon.table { color: #165DFF; background: #e8f3ff; }
.fav-icon.metric { color: #FF7D00; background: #fff7e8; }

.fav-content {
  flex: 1;
  min-width: 0;
}

.fav-title {
  font-size: 14px;
  color: #1d2129;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.fav-type {
  font-size: 12px;
  color: #86909c;
}

.copy-btn {
  color: #86909c;
}

.copy-btn:hover {
  color: #165DFF;
  background: transparent;
}

/* Quick Access */
.quick-access-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.quick-link-card {
  width: 200px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.quick-link-card:hover {
  transform: translateY(-2px);
}

.quick-link-card :deep(.arco-card-body) {
  padding: 16px;
}

.quick-link-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.quick-link-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quick-link-text {
  font-size: 14px;
  font-weight: 500;
  color: #1d2129;
}

.add-quick-link-btn {
  height: 68px;
  width: 140px;
  border-style: dashed;
  border-color: #c9cdd4;
  color: #86909c;
}

/* Responsive */
@media (max-width: 992px) {
  .hero-wrapper {
    flex-direction: column;
    align-items: flex-start;
    gap: 24px;
  }
  
  .search-area {
    width: 100%;
    max-width: none;
  }
}
</style>