<template>
  <div class="data-resources-page">
    <!-- 顶部 Banner 区域 -->
    <div class="banner-section">
      <div class="banner-content">
        <div class="title-row">
          <h1 class="banner-title">数据资源目录 · 业务系统</h1>
        </div>
        <p class="banner-subtitle">业务数据库 / 交易库 / 风险库 等核心交易源系统的注册与元数据同步</p>

        <div class="search-area">
          <a-input-search
            v-model="search"
            class="main-search-input"
            placeholder="输入系统名称、库名或负责人搜索"
            search-button
            size="large"
            allow-clear
          >
            <template #button-icon>
              <icon-search />
            </template>
          </a-input-search>

          <div class="search-filters-inline">
            <a-select
              v-model="systemType"
              placeholder="系统类型"
              allow-clear
              size="large"
              style="width: 160px"
              class="filter-select"
            >
              <a-option value="core">核心交易</a-option>
              <a-option value="risk">风控系统</a-option>
              <a-option value="marketing">营销系统</a-option>
              <a-option value="finance">财务系统</a-option>
            </a-select>
          </div>
        </div>
      </div>
      <div class="banner-decoration">
        <div class="decoration-cube"></div>
      </div>
    </div>

    <!-- 主体内容区域 -->
    <div class="main-content">
      <div class="content-section">
        <a-row :gutter="[16, 16]">
          <a-col v-for="sys in filteredBusinessSystems" :key="sys.id" :xs="24" :sm="12" :md="8" :lg="6">
            <a-card hoverable :bordered="false">
              <template #title>
                <a-space>
                  <a-tag :color="getDbTypeColor(sys.dbType)">{{ sys.dbType?.toUpperCase() }}</a-tag>
                  <span>{{ sys.name }}</span>
                </a-space>
              </template>
              <a-descriptions :column="1" size="small">
                <a-descriptions-item label="系统类型">{{ sys.systemTypeLabel }}</a-descriptions-item>
                <a-descriptions-item label="数据库">{{ sys.database }}</a-descriptions-item>
                <a-descriptions-item label="表数量">{{ sys.tableCount }} 个</a-descriptions-item>
                <a-descriptions-item label="负责人">{{ sys.owner }}</a-descriptions-item>
                <a-descriptions-item label="更新时间">{{ sys.updatedAt }}</a-descriptions-item>
              </a-descriptions>
              <template #actions>
                <a-button type="text" size="small" @click="viewDetail(sys)">详情</a-button>
                <a-button type="text" size="small" @click="syncMeta(sys)">同步元数据</a-button>
              </template>
            </a-card>
          </a-col>
        </a-row>
        <a-empty v-if="filteredBusinessSystems.length === 0" description="暂无业务系统" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconSearch } from '@arco-design/web-vue/es/icon'

const search = ref('')
const systemType = ref<string | undefined>(undefined)

const businessSystems = ref([
  { id: 'BS001', name: '核心交易系统', dbType: 'mysql', systemType: 'core', systemTypeLabel: '核心交易', database: 'core_trade', tableCount: 320, owner: '李开发', updatedAt: '今天 10:30' },
  { id: 'BS002', name: '风控决策引擎', dbType: 'doris', systemType: 'risk', systemTypeLabel: '风控系统', database: 'risk_decision', tableCount: 180, owner: '张风控', updatedAt: '今天 09:15' },
  { id: 'BS003', name: '用户中心', dbType: 'pg', systemType: 'core', systemTypeLabel: '核心交易', database: 'user_center', tableCount: 95, owner: '王运营', updatedAt: '今天 11:20' },
  { id: 'BS004', name: '营销活动平台', dbType: 'hive', systemType: 'marketing', systemTypeLabel: '营销系统', database: 'mkt_platform', tableCount: 420, owner: '陈营销', updatedAt: '今天 08:45' },
  { id: 'BS005', name: '财务核算系统', dbType: 'oracle', systemType: 'finance', systemTypeLabel: '财务系统', database: 'fin_acc', tableCount: 220, owner: '吴财务', updatedAt: '昨天 17:30' },
  { id: 'BS006', name: '数据分析平台', dbType: 'clickhouse', systemType: 'core', systemTypeLabel: '核心交易', database: 'olap', tableCount: 180, owner: '王运营', updatedAt: '今天 14:15' }
])

const filteredBusinessSystems = computed(() => {
  let result = businessSystems.value
  if (search.value) {
    const k = search.value.toLowerCase()
    result = result.filter(s =>
      s.name.toLowerCase().includes(k) ||
      s.database.toLowerCase().includes(k) ||
      s.owner.toLowerCase().includes(k)
    )
  }
  if (systemType.value) {
    result = result.filter(s => s.systemType === systemType.value)
  }
  return result
})

function viewDetail(s: any) {
  Message.info(`查看业务系统: ${s.name}`)
}
function syncMeta(s: any) {
  Message.success(`已触发同步: ${s.name}`)
}
function getDbTypeColor(t: string) {
  return { mysql: 'arcoblue', doris: 'green', pg: 'cyan', hive: 'orange', oracle: 'red', clickhouse: 'purple' }[t] || 'gray'
}
</script>

<style scoped>
.data-resources-page {
  min-height: 100vh;
  background: #f7f8fa;
  position: relative;
  overflow-x: hidden;
}

.banner-section {
  background: linear-gradient(180deg, #E6F0FF 0%, #F7F8FA 100%);
  padding: 40px 0;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 280px;
}

.banner-content {
  width: 100%;
  max-width: 1800px;
  z-index: 2;
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 0 40% 0 40px;
  box-sizing: border-box;
}

.banner-title {
  font-size: 40px;
  font-weight: bold;
  color: #1d2129;
  margin: 0 0 16px 0;
  line-height: 1.2;
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
  max-width: 900px;
  flex-wrap: wrap;
}

.main-search-input {
  flex: 1;
  min-width: 400px;
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

.search-filters-inline {
  display: flex;
  gap: 12px;
}

.filter-select {
  background: #fff;
  border-radius: 4px;
}

.banner-decoration {
  position: absolute;
  right: 0;
  top: 0;
  width: 40%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
}

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

.main-content {
  padding: 0 40px 40px;
  width: 100%;
  max-width: 1800px;
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
</style>