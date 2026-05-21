<template>
  <div class="data-resources-page">
    <div class="page-header">
      <h2>数据资源目录</h2>
    </div>

    <!-- 数据源类型切换 -->
    <a-radio-group v-model="activeType" type="button" style="margin-bottom: 16px">
      <a-radio value="business">业务系统</a-radio>
      <a-radio value="external">外部数据</a-radio>
      <a-radio value="file">文件导入</a-radio>
      <a-radio value="log">日志数据</a-radio>
      <a-radio value="realtime">实时数据</a-radio>
    </a-radio-group>

    <!-- 业务系统 -->
    <div v-if="activeType === 'business'" class="tab-content">
      <!-- Banner -->
      <div class="banner-section">
        <div class="banner-content">
          <h1 class="banner-title">业务系统</h1>
          <p class="banner-subtitle">业务系统元数据采集与管理中心，支持对核心业务库表的自动发现与血缘追踪。</p>
          <div class="search-area">
            <a-input-search v-model="bsSearch" class="main-search-input" placeholder="输入系统名称、库名或负责人进行搜索" search-button size="large" allow-clear @search="bsHandleSearch" />
            <a-select v-model="bsType" placeholder="系统类型" allow-clear size="large" style="width: 160px" @change="bsHandleFilter">
              <a-option value="core">核心交易</a-option>
              <a-option value="risk">风控系统</a-option>
              <a-option value="marketing">营销系统</a-option>
              <a-option value="finance">财务系统</a-option>
            </a-select>
          </div>
        </div>
        <div class="banner-decoration"><div class="decoration-cube"></div></div>
      </div>

      <div class="main-content">
        <a-spin :loading="loading">
          <a-row :gutter="[16, 16]">
            <a-col v-for="sys in bsDisplayList" :key="sys.id" :xs="24" :sm="12" :md="8" :lg="6">
              <a-card hoverable class="data-card">
                <template #title>
                  <a-space>
                    <a-tag :color="getDbTypeColor(sys.dbType)">{{ sys.dbType?.toUpperCase() }}</a-tag>
                    <span class="card-title">{{ sys.name }}</span>
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
        </a-spin>
      </div>
    </div>

    <!-- 外部数据 -->
    <div v-else-if="activeType === 'external'" class="tab-content">
      <div class="banner-section">
        <div class="banner-content">
          <h1 class="banner-title">外部数据源</h1>
          <p class="banner-subtitle">外部数据资源的统一接入与管理，包括征信、运营商、三方数据等。</p>
          <div class="search-area">
            <a-input-search v-model="extSearch" class="main-search-input" placeholder="输入数据源名称、供应商或负责人进行搜索" search-button size="large" allow-clear @search="extHandleSearch" />
            <a-select v-model="extType" placeholder="数据类型" allow-clear size="large" style="width: 160px" @change="extHandleFilter">
              <a-option value="credit">征信数据</a-option>
              <a-option value="telecom">运营商数据</a-option>
              <a-option value="business">工商数据</a-option>
              <a-option value="other">其他三方</a-option>
            </a-select>
          </div>
        </div>
        <div class="banner-decoration"><div class="decoration-cube"></div></div>
      </div>

      <div class="main-content">
        <a-row :gutter="[16, 16]">
          <a-col v-for="ext in extDisplayList" :key="ext.id" :xs="24" :sm="12" :md="8" :lg="6">
            <a-card hoverable class="data-card">
              <template #title><span class="card-title">{{ ext.name }}</span></template>
              <a-descriptions :column="1" size="small">
                <a-descriptions-item label="供应商">{{ ext.provider }}</a-descriptions-item>
                <a-descriptions-item label="数据类型">{{ ext.dataType }}</a-descriptions-item>
                <a-descriptions-item label="更新频率">{{ ext.updateFreq }}</a-descriptions-item>
                <a-descriptions-item label="覆盖量级">{{ ext.recordCount }}</a-descriptions-item>
                <a-descriptions-item label="状态">
                  <a-tag :color="ext.status === 'active' ? 'green' : 'orange'">{{ ext.status === 'active' ? '已接入' : '待接入' }}</a-tag>
                </a-descriptions-item>
              </a-descriptions>
              <template #actions>
                <a-button type="text" size="small" @click="viewDetail(ext)">详情</a-button>
                <a-button type="text" size="small" @click="testConnection(ext)">测试连接</a-button>
              </template>
            </a-card>
          </a-col>
        </a-row>
      </div>
    </div>

    <!-- 文件导入 -->
    <div v-else-if="activeType === 'file'" class="tab-content">
      <div class="banner-section">
        <div class="banner-content">
          <h1 class="banner-title">文件导入</h1>
          <p class="banner-subtitle">支持Excel、CSV等多种格式数据文件的上传、解析与标准化处理，快速实现线下数据线上化。</p>
          <div class="search-area">
            <a-input-search v-model="fileSearch" class="main-search-input" placeholder="输入文件名称或描述进行搜索" search-button size="large" allow-clear @search="fileHandleSearch" />
            <a-select v-model="fileType" placeholder="文件类型" allow-clear size="large" style="width: 140px" @change="fileHandleFilter">
              <a-option value="excel">Excel</a-option>
              <a-option value="csv">CSV</a-option>
              <a-option value="txt">TXT</a-option>
            </a-select>
          </div>
        </div>
        <div class="banner-decoration"><div class="decoration-cube"></div></div>
      </div>

      <div class="main-content">
        <a-table :data="fileDisplayList" :columns="fileColumns" :pagination="{ showTotal: true, showPageSize: true }" row-key="id" @page-change="filePageChange">
          <template #name="{ record }"><a-link @click="viewDetail(record)">{{ record.name }}</a-link></template>
          <template #status="{ record }">
            <a-tag :color="record.status === 'active' ? 'green' : (record.status === 'pending' ? 'orange' : 'gray')">{{ record.statusLabel }}</a-tag>
          </template>
          <template #actions="{ record }">
            <a-space>
              <a-button type="text" size="small" @click="viewDetail(record)">详情</a-button>
              <a-button type="text" size="small" @click="downloadFile(record)">下载</a-button>
            </a-space>
          </template>
          <template #empty>
            <div class="table-empty"><icon-empty :size="40" class="empty-icon" /><span>暂无文件导入数据</span></div>
          </template>
        </a-table>
      </div>
    </div>

    <!-- 日志数据 -->
    <div v-else-if="activeType === 'log'" class="tab-content">
      <div class="banner-section">
        <div class="banner-content">
          <h1 class="banner-title">日志数据源</h1>
          <p class="banner-subtitle">系统日志、业务埋点、审计日志等非结构化/半结构化数据的统一采集与发现。</p>
          <div class="search-area">
            <a-input-search v-model="logSearch" class="main-search-input" placeholder="输入日志名称、应用名或负责人进行搜索" search-button size="large" allow-clear @search="logHandleSearch" />
            <a-select v-model="logType" placeholder="日志类型" allow-clear size="large" style="width: 140px" @change="logHandleFilter">
              <a-option value="system">系统日志</a-option>
              <a-option value="business">业务埋点</a-option>
              <a-option value="audit">审计日志</a-option>
              <a-option value="network">网络日志</a-option>
            </a-select>
          </div>
        </div>
        <div class="banner-decoration"><div class="decoration-cube"></div></div>
      </div>

      <div class="main-content">
        <a-table :data="logDisplayList" :columns="logColumns" :pagination="{ showTotal: true, showPageSize: true }" row-key="id" @page-change="logPageChange">
          <template #name="{ record }"><a-link @click="viewDetail(record)">{{ record.name }}</a-link></template>
          <template #status="{ record }">
            <a-tag :color="record.status === 'active' ? 'green' : 'orange'">{{ record.status === 'active' ? '采集中' : '已停止' }}</a-tag>
          </template>
          <template #empty>
            <div class="table-empty"><icon-empty :size="40" class="empty-icon" /><span>暂无日志数据</span></div>
          </template>
        </a-table>
      </div>
    </div>

    <!-- 实时数据 -->
    <div v-else-if="activeType === 'realtime'" class="tab-content">
      <div class="banner-section">
        <div class="banner-content">
          <h1 class="banner-title">实时数据源</h1>
          <p class="banner-subtitle">实时数据资源的注册与监控，支持Kafka、MQ等消息队列及流式数据的统一管理。</p>
          <div class="search-area">
            <a-input-search v-model="rtSearch" class="main-search-input" placeholder="输入Topic名称、集群或负责人进行搜索" search-button size="large" allow-clear @search="rtHandleSearch" />
            <a-select v-model="rtEngine" placeholder="引擎类型" allow-clear size="large" style="width: 140px" @change="rtHandleFilter">
              <a-option value="kafka">Kafka</a-option>
              <a-option value="rocketmq">RocketMQ</a-option>
              <a-option value="rabbitmq">RabbitMQ</a-option>
              <a-option value="flink">Flink</a-option>
            </a-select>
          </div>
        </div>
        <div class="banner-decoration"><div class="decoration-cube"></div></div>
      </div>

      <div class="main-content">
        <a-table :data="rtDisplayList" :columns="rtColumns" :pagination="{ showTotal: true, showPageSize: true }" row-key="id" @page-change="rtPageChange">
          <template #name="{ record }"><a-link @click="viewDetail(record)">{{ record.name }}</a-link></template>
          <template #status="{ record }">
            <a-tag :color="record.status === 'active' ? 'green' : 'red'">{{ record.status === 'active' ? '运行中' : '已停止' }}</a-tag>
          </template>
          <template #empty>
            <div class="table-empty"><icon-empty :size="40" class="empty-icon" /><span>暂无实时数据</span></div>
          </template>
        </a-table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Message } from '@arco-design/web-vue'

const activeType = ref('business')
const loading = ref(false)

// ============= 业务系统 =============
const bsSearch = ref('')
const bsType = ref('')
const bsList = ref([
  { id: 1, name: '核心交易系统', dbType: 'oracle', systemType: 'core', systemTypeLabel: '核心交易', database: 'ORCL_TRADE', tableCount: 342, owner: '王建', updatedAt: '2024-04-15' },
  { id: 2, name: '风控决策引擎', dbType: 'mysql', systemType: 'risk', systemTypeLabel: '风控系统', database: 'RISK_DB', tableCount: 128, owner: '刘强', updatedAt: '2024-04-14' },
  { id: 3, name: '营销活动平台', dbType: 'mysql', systemType: 'marketing', systemTypeLabel: '营销系统', database: 'MKT_DB', tableCount: 86, owner: '陈明', updatedAt: '2024-04-13' },
  { id: 4, name: '财务核算系统', dbType: 'oracle', systemType: 'finance', systemTypeLabel: '财务系统', database: 'FIN_DB', tableCount: 215, owner: '赵丽', updatedAt: '2024-04-12' },
  { id: 5, name: '客户关系管理', dbType: 'mysql', systemType: 'core', systemTypeLabel: '核心交易', database: 'CRM_DB', tableCount: 198, owner: '孙伟', updatedAt: '2024-04-11' },
  { id: 6, name: '反欺诈系统', dbType: 'mysql', systemType: 'risk', systemTypeLabel: '风控系统', database: 'FRAUD_DB', tableCount: 67, owner: '周杰', updatedAt: '2024-04-10' }
])
const bsDisplayList = ref([...bsList.value])
const bsHandleSearch = () => bsApplyFilter()
const bsHandleFilter = () => bsApplyFilter()
const bsApplyFilter = () => {
  bsDisplayList.value = bsList.value.filter(s => {
    const matchSearch = !bsSearch.value || s.name.includes(bsSearch.value) || s.database.includes(bsSearch.value)
    const matchType = !bsType.value || s.systemType === bsType.value
    return matchSearch && matchType
  })
}

// ============= 外部数据 =============
const extSearch = ref('')
const extType = ref('')
const extList = ref([
  { id: 1, name: '央行征信', provider: '央行征信中心', dataType: '征信数据', updateFreq: 'T+1', recordCount: '5000万+', status: 'active' },
  { id: 2, name: '运营商数据', provider: '中国移动', dataType: '运营商数据', updateFreq: '实时', recordCount: '1亿+', status: 'active' },
  { id: 3, name: '工商信息', provider: '企查查', dataType: '工商数据', updateFreq: 'T+3', recordCount: '8000万+', status: 'active' },
  { id: 4, name: '司法记录', provider: '最高法', dataType: '其他三方', updateFreq: 'T+7', recordCount: '2000万+', status: 'pending' },
  { id: 5, name: '电商数据', provider: '京东金融', dataType: '其他三方', updateFreq: 'T+1', recordCount: '2亿+', status: 'active' }
])
const extDisplayList = ref([...extList.value])
const extHandleSearch = () => extApplyFilter()
const extHandleFilter = () => extApplyFilter()
const extApplyFilter = () => {
  extDisplayList.value = extList.value.filter(e => {
    const matchSearch = !extSearch.value || e.name.includes(extSearch.value) || e.provider.includes(extSearch.value)
    const matchType = !extType.value || e.dataType.toLowerCase().includes(extType.value)
    return matchSearch && matchType
  })
}

// ============= 文件导入 =============
const fileSearch = ref('')
const fileType = ref('')
const fileList = ref([
  { id: 1, name: '客户台账_2024Q1.xlsx', type: 'excel', size: '2.3MB', records: 15832, uploader: '张三', uploadTime: '2024-04-01', status: 'active', statusLabel: '已处理' },
  { id: 2, name: '交易明细_202403.csv', type: 'csv', size: '15.6MB', records: 286421, uploader: '李四', uploadTime: '2024-03-31', status: 'active', statusLabel: '已处理' },
  { id: 3, name: '物料清单模板.txt', type: 'txt', size: '128KB', records: 2341, uploader: '王五', uploadTime: '2024-03-28', status: 'pending', statusLabel: '处理中' },
  { id: 4, name: '财务报表_202403.xlsx', type: 'excel', size: '5.7MB', records: 8567, uploader: '赵六', uploadTime: '2024-04-05', status: 'active', statusLabel: '已处理' }
])
const fileDisplayList = ref([...fileList.value])
const fileColumns = [
  { title: '文件名称', dataIndex: 'name', slotName: 'name', width: 300 },
  { title: '类型', dataIndex: 'type', width: 80 },
  { title: '大小', dataIndex: 'size', width: 100 },
  { title: '记录数', dataIndex: 'records', width: 100 },
  { title: '上传人', dataIndex: 'uploader', width: 100 },
  { title: '上传时间', dataIndex: 'uploadTime', width: 120 },
  { title: '状态', dataIndex: 'status', slotName: 'status', width: 100 },
  { title: '操作', dataIndex: 'actions', slotName: 'actions', width: 150 }
]
const fileHandleSearch = () => fileApplyFilter()
const fileHandleFilter = () => fileApplyFilter()
const fileApplyFilter = () => {
  fileDisplayList.value = fileList.value.filter(f => {
    const matchSearch = !fileSearch.value || f.name.includes(fileSearch.value)
    const matchType = !fileType.value || f.type === fileType.value
    return matchSearch && matchType
  })
}
const filePageChange = () => {}

// ============= 日志数据 =============
const logSearch = ref('')
const logType = ref('')
const logList = ref([
  { id: 1, name: '交易系统日志', type: 'system', engine: 'ELK', topic: 'trade-log', recordCount: '500GB/天', owner: '运维组', status: 'active' },
  { id: 2, name: '用户行为埋点', type: 'business', engine: 'Kafka', topic: 'user-behavior', recordCount: '1TB/天', owner: '产品组', status: 'active' },
  { id: 3, name: '操作审计日志', type: 'audit', engine: 'ELK', topic: 'audit-log', recordCount: '50GB/天', owner: '安全组', status: 'active' },
  { id: 4, name: '网关访问日志', type: 'network', engine: 'ClickHouse', topic: 'gateway-access', recordCount: '200GB/天', owner: '运维组', status: 'active' }
])
const logDisplayList = ref([...logList.value])
const logColumns = [
  { title: '日志名称', dataIndex: 'name', slotName: 'name', width: 200 },
  { title: '类型', dataIndex: 'type', width: 100 },
  { title: '引擎', dataIndex: 'engine', width: 100 },
  { title: 'Topic', dataIndex: 'topic', width: 180 },
  { title: '数据量', dataIndex: 'recordCount', width: 120 },
  { title: '负责人', dataIndex: 'owner', width: 100 },
  { title: '状态', dataIndex: 'status', slotName: 'status', width: 100 }
]
const logHandleSearch = () => logApplyFilter()
const logHandleFilter = () => logApplyFilter()
const logApplyFilter = () => {
  logDisplayList.value = logList.value.filter(l => {
    const matchSearch = !logSearch.value || l.name.includes(logSearch.value)
    const matchType = !logType.value || l.type === logType.value
    return matchSearch && matchType
  })
}
const logPageChange = () => {}

// ============= 实时数据 =============
const rtSearch = ref('')
const rtEngine = ref('')
const rtList = ref([
  { id: 1, name: '交易事件流', engine: 'kafka', cluster: 'prod-kafka-1', topic: 'trade-event', partitions: 12, owner: '数据平台组', status: 'active', lag: '0' },
  { id: 2, name: '用户行为流', engine: 'kafka', cluster: 'prod-kafka-1', topic: 'user-behavior', partitions: 24, owner: '数据平台组', status: 'active', lag: '120' },
  { id: 3, name: '风控事件流', engine: 'rocketmq', cluster: 'prod-rmq-1', topic: 'risk-event', partitions: 8, owner: '风控组', status: 'active', lag: '0' },
  { id: 4, name: '实时特征流', engine: 'flink', cluster: 'prod-flink-1', jobName: 'FeatureCompute', owner: '算法组', status: 'active', lag: '50' }
])
const rtDisplayList = ref([...rtList.value])
const rtColumns = [
  { title: '名称', dataIndex: 'name', slotName: 'name', width: 200 },
  { title: '引擎', dataIndex: 'engine', width: 100 },
  { title: '集群/Job', dataIndex: 'cluster', width: 150 },
  { title: 'Topic/任务', dataIndex: 'topic', width: 150 },
  { title: '分区', dataIndex: 'partitions', width: 80 },
  { title: '负责人', dataIndex: 'owner', width: 100 },
  { title: '状态', dataIndex: 'status', slotName: 'status', width: 100 },
  { title: 'Lag', dataIndex: 'lag', width: 80 }
]
const rtHandleSearch = () => rtApplyFilter()
const rtHandleFilter = () => rtApplyFilter()
const rtApplyFilter = () => {
  rtDisplayList.value = rtList.value.filter(r => {
    const matchSearch = !rtSearch.value || r.name.includes(rtSearch.value)
    const matchType = !rtEngine.value || r.engine === rtEngine.value
    return matchSearch && matchType
  })
}
const rtPageChange = () => {}

// ============= 通用 =============
const getDbTypeColor = (dbType: string) => {
  const map: Record<string, string> = { oracle: 'red', mysql: 'blue', postgresql: 'green', mongodb: 'cyan' }
  return map[dbType] || 'gray'
}
const viewDetail = (item: any) => Message.info(`查看详情：${item.name}（Demo模式）`)
const syncMeta = (item: any) => Message.success(`元数据同步已触发：${item.name}`)
const testConnection = (item: any) => Message.success(`连接测试成功：${item.name}`)
const downloadFile = (item: any) => Message.info(`下载文件：${item.name}（Demo模式）`)
</script>

<style scoped>
.data-resources-page { min-height: 100vh; background: #f7f8fa; padding-bottom: 40px; }
.page-header { padding: 20px 40px 0; }
.page-header h2 { margin: 0; font-size: 20px; font-weight: 600; color: #1d2129; }
.tab-content { padding: 0; }

.banner-section { background: linear-gradient(180deg, #E6F0FF 0%, #F7F8FA 100%); padding: 40px 0; position: relative; display: flex; justify-content: center; align-items: center; min-height: 240px; }
.banner-content { width: 100%; max-width: 1800px; z-index: 2; position: relative; padding: 0 40% 0 40px; box-sizing: border-box; }
.banner-title { font-size: 36px; font-weight: bold; color: #1d2129; margin: 0 0 12px 0; }
.banner-subtitle { font-size: 14px; color: #86909c; margin-bottom: 24px; max-width: 600px; line-height: 1.6; }
.search-area { display: flex; gap: 12px; align-items: center; max-width: 800px; }
.main-search-input { flex: 1; background: #fff; border-radius: 30px; border: 1px solid #165DFF; box-shadow: 0 4px 10px rgba(22,93,255,0.1); }
.main-search-input :deep(.arco-input-wrapper) { border-radius: 30px; padding-left: 20px; background: #fff; }
.main-search-input :deep(.arco-input-search-btn) { border-radius: 0 30px 30px 0; background: transparent; color: #165DFF; }
.banner-decoration { position: absolute; right: 0; top: 0; width: 40%; height: 100%; overflow: hidden; pointer-events: none; }
.decoration-cube { position: absolute; top: 40px; right: 100px; width: 180px; height: 180px; background: linear-gradient(135deg, #e8f3ff 0%, #cce4ff 100%); transform: rotate(-15deg) skew(-10deg); border-radius: 20px; }

.main-content { padding: 0 40px; width: 100%; max-width: 1800px; margin: 0 auto; }

.data-card { border-radius: 8px; border: 1px solid #e5e6eb; transition: all 0.2s; }
.data-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.08); border-color: #165dff; }
.data-card :deep(.arco-card-body) { padding: 16px; }
.card-title { font-size: 15px; font-weight: 600; color: #1d2129; }
.table-empty { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 32px 0; color: var(--color-text-3); }
.table-empty .empty-icon { color: var(--color-fill-3); }
</style>
