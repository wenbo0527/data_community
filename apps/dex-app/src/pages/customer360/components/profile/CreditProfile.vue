<template>
  <div class="credit-profile">
    <a-spin :loading="loading">
      <div class="credit-content">
        <!-- 征信报告状态 -->
        <div class="profile-section">
          <h3 class="section-title">征信报告状态</h3>
          <div class="status-info">
            <div class="status-item">
              <span class="label">报告状态:</span>
              <a-tag :color="getStatusColor(creditStatus)">{{ getStatusText(creditStatus) }}</a-tag>
            </div>
            <div class="status-item" v-if="creditStatus === 'available'">
              <span class="label">报告数量:</span>
              <span class="value">{{ creditReports.length }} 份</span>
            </div>
            <div class="status-item" v-if="creditStatus === 'available'">
              <span class="label">最新报告时间:</span>
              <span class="value">{{ latestReportDate }}</span>
            </div>
          </div>
          
          <!-- 状态切换按钮（仅在开发环境显示） -->
          <div class="debug-controls" v-if="showDebugControls">
            <a-divider />
            <div class="debug-title">开发调试控制</div>
            <a-space>
              <a-button size="small" @click="setCreditStatus('no_report')" :type="creditStatus === 'no_report' ? 'primary' : 'default'">无报告</a-button>
              <a-button size="small" @click="setCreditStatus('no_permission')" :type="creditStatus === 'no_permission' ? 'primary' : 'default'">无权限</a-button>
              <a-button size="small" @click="setCreditStatus('available')" :type="creditStatus === 'available' ? 'primary' : 'default'">查得报告</a-button>
            </a-space>
          </div>
        </div>

        <!-- 征信报告内容 -->
        <div v-if="creditStatus === 'available'" class="credit-report">
          <!-- 征信报告列表 -->
          <div class="profile-section">
            <div class="section-header-with-action">
              <h3 class="section-title">征信报告列表</h3>
              <a-space>
                <a-button type="primary" size="small" :disabled="selectedReportIds.length !== 2" @click="openCompareModal">
                  <template #icon><IconList /></template>
                  对比报告
                </a-button>
                <a-button size="small" @click="refreshReports">
                  <template #icon><IconRefresh /></template>
                  刷新
                </a-button>
              </a-space>
            </div>
            
            <a-table :data="creditReports" :row-selection="rowSelection" :pagination="{ pageSize: 5, showTotal: true, showPageSize: true }" size="small" @selection-change="handleSelectionChange">
              <template #columns>
                <a-table-column title="报告编号" data-index="reportId" :width="140">
                  <template #cell="{ record }"><span class="report-id">{{ record.reportId }}</span></template>
                </a-table-column>
                <a-table-column title="查询时间" data-index="queryDate" :width="120">
                  <template #cell="{ record }">{{ formatDate(record.queryDate) }}</template>
                </a-table-column>
                <a-table-column title="报告类型" data-index="reportType" :width="100">
                  <template #cell="{ record }"><a-tag :color="getReportTypeColor(record.reportType)">{{ record.reportType }}</a-tag></template>
                </a-table-column>
                <a-table-column title="查询机构" data-index="queryOrg" :width="150" />
                <a-table-column title="查询原因" data-index="queryReason" :width="100" />
                <a-table-column title="信用评分" data-index="creditScore" :width="100">
                  <template #cell="{ record }"><span :class="getScoreClass(record.creditScore)">{{ record.creditScore || '-' }}</span></template>
                </a-table-column>
                <a-table-column title="信用等级" data-index="creditLevel" :width="80">
                  <template #cell="{ record }"><a-tag :color="getLevelColor(record.creditLevel)">{{ record.creditLevel || '-' }}</a-tag></template>
                </a-table-column>
                <a-table-column title="状态" data-index="status" :width="80">
                  <template #cell="{ record }"><a-tag :color="getStatusTagColor(record.status)">{{ record.status || '正常' }}</a-tag></template>
                </a-table-column>
                <a-table-column title="操作" :width="160" fixed="right">
                  <template #cell="{ record }">
                    <a-space>
                      <a-button type="text" size="small" @click="viewReportDetail(record)"><template #icon><IconEye /></template>查看</a-button>
                      <a-button type="text" size="small" @click="downloadReport(record)"><template #icon><IconDownload /></template></a-button>
                    </a-space>
                  </template>
                </a-table-column>
              </template>
            </a-table>
          </div>

          <!-- 基本信息 -->
          <div class="profile-section">
            <h3 class="section-title">基本信息</h3>
            <a-descriptions :column="2" bordered>
              <a-descriptions-item label="姓名">{{ userInfo?.name || '张三' }}</a-descriptions-item>
              <a-descriptions-item label="身份证号">{{ userInfo?.idCard || '110101199001011234' }}</a-descriptions-item>
              <a-descriptions-item label="查询时间">{{ creditInfo?.queryTime || '2024-01-15' }}</a-descriptions-item>
              <a-descriptions-item label="查询机构">{{ creditInfo?.queryOrg || '某银行股份有限公司' }}</a-descriptions-item>
            </a-descriptions>
          </div>

          <!-- 信贷记录摘要 -->
          <div class="profile-section">
            <h3 class="section-title">信贷记录摘要</h3>
            <div class="grid grid-cols-4 gap-4">
              <div class="summary-item-box">
                <div class="summary-title">信用卡账户数</div>
                <div class="summary-value">{{ creditInfo?.creditCardCount || 5 }}<span class="suffix">个</span></div>
              </div>
              <div class="summary-item-box">
                <div class="summary-title">贷款账户数</div>
                <div class="summary-value">{{ creditInfo?.loanCount || 3 }}<span class="suffix">个</span></div>
              </div>
              <div class="summary-item-box">
                <div class="summary-title">逾期账户数</div>
                <div class="summary-value highlight-red">{{ creditInfo?.overdueCount || 1 }}<span class="suffix">个</span></div>
              </div>
              <div class="summary-item-box">
                <div class="summary-title">最长逾期天数</div>
                <div class="summary-value highlight-red">{{ creditInfo?.maxOverdueDays || 30 }}<span class="suffix">天</span></div>
              </div>
            </div>
          </div>

          <!-- 查询记录 -->
          <div class="profile-section">
            <h3 class="section-title">查询记录</h3>
            <a-table :data="queryRecords" :columns="queryColumns" :pagination="false" size="small" />
          </div>

          <!-- 异议信息 -->
          <div class="profile-section">
            <h3 class="section-title">异议信息</h3>
            <a-empty v-if="!disputeRecords.length" description="暂无异议信息" />
            <a-list v-else :data="disputeRecords" size="small">
              <template #item="{ item }">
                <a-list-item>
                  <div class="dispute-item">
                    <div class="dispute-content">{{ item.content }}</div>
                    <div class="dispute-date">{{ item.date }}</div>
                  </div>
                </a-list-item>
              </template>
            </a-list>
          </div>
        </div>

        <!-- 无报告状态 -->
        <div v-else-if="creditStatus === 'no_report'" class="no-report">
          <a-empty description="暂无征信报告">
            <template #image>
              <IconFile :size="64" style="color: #c9cdd4;" />
            </template>
          </a-empty>
        </div>

        <!-- 无权限状态 -->
        <div v-else-if="creditStatus === 'no_permission'" class="no-permission">
          <a-empty description="暂无查看征信报告的权限">
            <template #image>
              <IconLock :size="64" style="color: #c9cdd4;" />
            </template>
          </a-empty>
        </div>
      </div>
    </a-spin>

    <!-- 征信报告详情弹窗 (XML格式化展示) -->
    <a-modal v-model:visible="detailModalVisible" :title="`征信报告详情 - ${currentReport?.reportId || ''}`" width="90%" :mask-closable="false">
      <template #footer>
        <a-space>
          <a-button @click="closeDetailModal">关闭</a-button>
          <a-button type="primary" @click="copyXmlContent"><template #icon><IconCopy /></template>复制XML</a-button>
          <a-button type="primary" @click="downloadXmlReport"><template #icon><IconDownload /></template>下载XML</a-button>
        </a-space>
      </template>
      
      <div class="report-detail-container">
        <!-- 报告基本信息 -->
        <a-descriptions :column="3" bordered size="small" class="report-meta">
          <a-descriptions-item label="报告编号">{{ currentReport?.reportId }}</a-descriptions-item>
          <a-descriptions-item label="查询时间">{{ formatDate(currentReport?.queryDate) }}</a-descriptions-item>
          <a-descriptions-item label="报告类型"><a-tag :color="getReportTypeColor(currentReport?.reportType)">{{ currentReport?.reportType }}</a-tag></a-descriptions-item>
          <a-descriptions-item label="查询机构">{{ currentReport?.queryOrg }}</a-descriptions-item>
          <a-descriptions-item label="查询原因">{{ currentReport?.queryReason }}</a-descriptions-item>
          <a-descriptions-item label="信用评分"><span :class="getScoreClass(currentReport?.creditScore)">{{ currentReport?.creditScore || '-' }}</span></a-descriptions-item>
        </a-descriptions>

        <!-- XML格式化展示区域 -->
        <div class="xml-section">
          <div class="section-header">
            <h4>XML报告内容</h4>
            <a-space>
              <a-select v-model="xmlViewMode" size="small" style="width: 120px">
                <a-option value="formatted">格式化</a-option>
                <a-option value="raw">原始内容</a-option>
                <a-option value="tree">树形结构</a-option>
              </a-select>
              <a-button size="small" @click="toggleXmlCollapse">{{ xmlCollapsed ? '展开全部' : '折叠' }}</a-button>
            </a-space>
          </div>
          
          <!-- 格式化XML展示 -->
          <div v-if="xmlViewMode === 'formatted'" class="xml-content formatted">
            <pre class="xml-pre" :class="{ 'collapsed': xmlCollapsed }">{{ formattedXml }}</pre>
          </div>
          
          <!-- 原始XML展示 -->
          <div v-else-if="xmlViewMode === 'raw'" class="xml-content raw">
            <pre class="xml-pre raw">{{ currentReport?.xmlContent || sampleXmlContent }}</pre>
          </div>
          
          <!-- 树形结构展示 -->
          <div v-else class="xml-content tree">
            <a-tree :data="xmlTreeData" :virtual-list-props="{ height: 400 }" block-node default-expand-all />
          </div>
        </div>

        <!-- 关键字段提取展示 -->
        <div class="extracted-fields">
          <h4>关键字段提取</h4>
          <a-row :gutter="16">
            <a-col :span="6"><div class="field-card"><div class="field-label">姓名</div><div class="field-value">{{ extractedFields.name }}</div></div></a-col>
            <a-col :span="6"><div class="field-card"><div class="field-label">身份证号</div><div class="field-value">{{ extractedFields.idCard }}</div></div></a-col>
            <a-col :span="6"><div class="field-card"><div class="field-label">信用评分</div><div class="field-value highlight">{{ extractedFields.creditScore }}</div></div></a-col>
            <a-col :span="6"><div class="field-card"><div class="field-label">信用等级</div><div class="field-value"><a-tag :color="getLevelColor(extractedFields.creditLevel)">{{ extractedFields.creditLevel }}</a-tag></div></div></a-col>
          </a-row>
          <a-row :gutter="16" style="margin-top: 16px;">
            <a-col :span="6"><div class="field-card"><div class="field-label">信用卡账户</div><div class="field-value">{{ extractedFields.creditCardCount }} 个</div></div></a-col>
            <a-col :span="6"><div class="field-card"><div class="field-label">贷款账户</div><div class="field-value">{{ extractedFields.loanCount }} 个</div></div></a-col>
            <a-col :span="6"><div class="field-card"><div class="field-label">逾期次数</div><div class="field-value" :class="{ 'danger': extractedFields.overdueCount > 0 }">{{ extractedFields.overdueCount }} 次</div></div></a-col>
            <a-col :span="6"><div class="field-card"><div class="field-label">负债总额</div><div class="field-value">¥ {{ extractedFields.totalDebt?.toLocaleString() }}</div></div></a-col>
          </a-row>
        </div>
      </div>
    </a-modal>

    <!-- 报告对比弹窗 -->
    <a-modal v-model:visible="showCompareModal" title="征信报告对比" width="95%" :mask-closable="false">
      <template #footer>
        <a-button @click="closeCompareModal">关闭</a-button>
      </template>
      
      <div class="compare-container">
        <!-- 对比选择器 -->
        <div class="compare-selector">
          <a-row :gutter="16">
            <a-col :span="12">
              <div class="compare-panel left-panel">
                <h4>报告A: {{ compareReportA?.reportId }}</h4>
                <a-descriptions :column="1" size="small">
                  <a-descriptions-item label="查询时间">{{ formatDate(compareReportA?.queryDate) }}</a-descriptions-item>
                  <a-descriptions-item label="查询机构">{{ compareReportA?.queryOrg }}</a-descriptions-item>
                  <a-descriptions-item label="信用评分">{{ compareReportA?.creditScore || '-' }}</a-descriptions-item>
                </a-descriptions>
              </div>
            </a-col>
            <a-col :span="12">
              <div class="compare-panel right-panel">
                <h4>报告B: {{ compareReportB?.reportId }}</h4>
                <a-descriptions :column="1" size="small">
                  <a-descriptions-item label="查询时间">{{ formatDate(compareReportB?.queryDate) }}</a-descriptions-item>
                  <a-descriptions-item label="查询机构">{{ compareReportB?.queryOrg }}</a-descriptions-item>
                  <a-descriptions-item label="信用评分">{{ compareReportB?.creditScore || '-' }}</a-descriptions-item>
                </a-descriptions>
              </div>
            </a-col>
          </a-row>
        </div>

        <!-- 差异对比表格 -->
        <div class="compare-diff">
          <h4>差异对比</h4>
          <a-table :data="compareDiffData" :pagination="false" size="small" :bordered="true">
            <template #columns>
              <a-table-column title="对比字段" data-index="field" :width="120" />
              <a-table-column title="报告A (旧)" data-index="before" :width="180">
                <template #cell="{ record }"><span class="before-value">{{ record.before }}</span></template>
              </a-table-column>
              <a-table-column title="变化情况" data-index="change" :width="120">
                <template #cell="{ record }"><span :class="record.changeClass">{{ record.change }}</span></template>
              </a-table-column>
              <a-table-column title="报告B (新)" data-index="after" :width="180">
                <template #cell="{ record }"><span class="after-value">{{ record.after }}</span></template>
              </a-table-column>
            </template>
          </a-table>
        </div>

        <!-- XML对比视图 -->
        <div class="compare-xml">
          <h4>XML差异对比</h4>
          <div class="diff-view-mode">
            <a-radio-group v-model="diffViewMode" type="button">
              <a-radio value="side">并排对比</a-radio>
              <a-radio value="unified">统一视图</a-radio>
            </a-radio-group>
          </div>
          
          <div v-if="diffViewMode === 'side'" class="side-by-side">
            <div class="diff-panel left">
              <div class="diff-header">报告A (旧)</div>
              <pre class="diff-content">{{ compareReportA?.xmlContent || sampleXmlContent }}</pre>
            </div>
            <div class="diff-panel right">
              <div class="diff-header">报告B (新)</div>
              <pre class="diff-content">{{ compareReportB?.xmlContent || sampleXmlContent }}</pre>
            </div>
          </div>
          
          <div v-else class="unified-diff">
            <div class="diff-line" v-for="(line, index) in unifiedDiffLines" :key="index" :class="line.type">
              <span class="line-number">{{ line.lineNumber }}</span>
              <span class="line-prefix">{{ line.prefix }}</span>
              <span class="line-content">{{ line.content }}</span>
            </div>
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconFile, IconLock, IconEye, IconDownload, IconCopy, IconRefresh, IconList } from '@arco-design/web-vue/es/icon'

// 🔍 调试日志 - 组件加载时执行
console.log('[CreditProfile] 🔍 组件源码已加载 - 版本: 2026-04-21-09:41')

interface Props {
  userInfo?: any
  creditInfo?: any
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  userInfo: () => ({}),
  creditInfo: () => ({}),
  loading: false
})

// ============ 征信状态 ============
const creditStatus = ref<'no_report' | 'no_permission' | 'available'>('available')

const showDebugControls = computed(() => process.env.NODE_ENV === 'development')

const getStatusColor = (status: string) => ({
  'no_report': 'gray',
  'no_permission': 'orange', 
  'available': 'green'
}[status] || 'gray')

const getStatusText = (status: string) => ({
  'no_report': '无报告',
  'no_permission': '无权限',
  'available': '查得报告'
}[status] || '未知状态')

const setCreditStatus = (status: 'no_report' | 'no_permission' | 'available') => {
  creditStatus.value = status
}

// ============ 征信报告列表相关 ============
const creditReports = ref([
  { reportId: 'CR20240115001', queryDate: '2024-01-15 10:30:00', reportType: '企业征信', queryOrg: '某银行股份有限公司', queryReason: '贷款审批', creditScore: 785, creditLevel: 'AAA', status: '正常', xmlContent: '' },
  { reportId: 'CR20231201001', queryDate: '2023-12-01 14:20:00', reportType: '企业征信', queryOrg: '某消费金融公司', queryReason: '贷后管理', creditScore: 752, creditLevel: 'AA', status: '正常', xmlContent: '' },
  { reportId: 'CR20231115001', queryDate: '2023-11-15 09:00:00', reportType: '企业征信', queryOrg: '某银行股份有限公司', queryReason: '额度审批', creditScore: 680, creditLevel: 'A', status: '正常', xmlContent: '' }
])

// 🔍 调试日志 - 组件挂载时
onMounted(() => {
  console.log('[CreditProfile] 🔍 组件已挂载 - 2026-04-21-09:41')
  console.log('[CreditProfile] 🔍 creditReports 数据:', creditReports.value)
  console.log('[CreditProfile] 🔍 creditReports 数量:', creditReports.value.length)
  console.log('[CreditProfile] 🔍 creditStatus:', creditStatus.value)
  console.log('[CreditProfile] 🔍 creditInfo props:', props.creditInfo)
  console.log('[CreditProfile] 🔍 userInfo props:', props.userInfo)
})

const latestReportDate = computed(() => {
  if (creditReports.value.length === 0) return '-'
  const sorted = [...creditReports.value].sort((a, b) => new Date(b.queryDate).getTime() - new Date(a.queryDate).getTime())
  return formatDate(sorted[0].queryDate)
})

const selectedReportIds = ref<string[]>([])
const rowSelection = { type: 'checkbox', showCheckedAll: true, onlyCurrent: false }

const handleSelectionChange = (keys: string[]) => {
  selectedReportIds.value = keys
  if (keys.length > 2) {
    Message.warning('最多只能选择2份报告进行对比')
    selectedReportIds.value = keys.slice(-2)
  }
}

const refreshReports = () => {
  console.log('[CreditProfile] 🔄 刷新报告列表被调用')
  console.log('[CreditProfile] 🔄 当前creditReports:', creditReports.value)
  Message.success('报告列表已刷新')
}

// 🔍 监听 creditStatus 变化
watch(() => creditStatus.value, (newStatus, oldStatus) => {
  console.log('[CreditProfile] 🔍 creditStatus 变化:', { oldStatus, newStatus })
})

// 🔍 监听 creditReports 变化
watch(() => creditReports.value, (newReports, oldReports) => {
  console.log('[CreditProfile] 🔍 creditReports 变化:', { oldLength: oldReports?.length, newLength: newReports?.length })
}, { deep: true })

const getReportTypeColor = (type: string) => ({ '企业征信': 'blue', '个人征信': 'green', '信用报告': 'orange' }[type] || 'default')

const getScoreClass = (score: number) => {
  if (!score) return ''
  if (score >= 750) return 'score-excellent'
  if (score >= 650) return 'score-good'
  if (score >= 550) return 'score-fair'
  return 'score-poor'
}

const getLevelColor = (level: string) => ({ 'AAA': 'green', 'AA': 'green', 'A': 'blue', 'BBB': 'orange', 'BB': 'orange', 'B': 'red' }[level] || 'default')

const getStatusTagColor = (status: string) => ({ '正常': 'green', '异常': 'red', '待审核': 'orange' }[status] || 'default')

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

// ============ 报告详情弹窗相关 ============
const detailModalVisible = ref(false)
const currentReport = ref<any>(null)
const xmlViewMode = ref('formatted')
const xmlCollapsed = ref(false)

const sampleXmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<CreditReport>
  <Header>
    <ReportId>CR20240115001</ReportId>
    <GenerateTime>2024-01-15T10:30:00</GenerateTime>
    <ReportType>企业征信</ReportType>
  </Header>
  <Subject>
    <Name>某科技有限公司</Name>
    <IDCard>91110000XXXXXXXX</IDCard>
    <CreditScore>785</CreditScore>
    <CreditLevel>AAA</CreditLevel>
  </Subject>
  <CreditSummary>
    <CreditCardAccounts>5</CreditCardAccounts>
    <LoanAccounts>3</LoanAccounts>
    <OverdueCount>1</OverdueCount>
    <MaxOverdueDays>30</MaxOverdueDays>
    <TotalDebt>1500000.00</TotalDebt>
  </CreditSummary>
  <QueryRecords>
    <Query>
      <Date>2024-01-15</Date>
      <Institution>某银行股份有限公司</Institution>
      <Reason>贷款审批</Reason>
    </Query>
  </QueryRecords>
</CreditReport>`

const formattedXml = computed(() => {
  try {
    const xml = currentReport.value?.xmlContent || sampleXmlContent
    let formatted = '', indent = 0
    xml.split(/>\s*</).forEach(node => {
      if (node.match(/^\/\w/)) indent--
      formatted += '  '.repeat(Math.max(0, indent)) + '<' + node + '>\n'
      if (node.match(/^<?\w[^>]*[^/]$/) && !node.startsWith('?')) indent++
    })
    return formatted.substring(0, formatted.length - 1)
  } catch {
    return currentReport.value?.xmlContent || sampleXmlContent
  }
})

const xmlTreeData = computed(() => [
  { title: 'CreditReport', key: '0', children: [
    { title: 'Header', key: '0-0', children: [
      { title: 'ReportId: CR20240115001', key: '0-0-0' },
      { title: 'GenerateTime: 2024-01-15T10:30:00', key: '0-0-1' },
      { title: 'ReportType: 企业征信', key: '0-0-2' }
    ]},
    { title: 'Subject', key: '0-1', children: [
      { title: 'Name: 某科技有限公司', key: '0-1-0' },
      { title: 'IDCard: 91110000XXXXXXXX', key: '0-1-1' },
      { title: 'CreditScore: 785', key: '0-1-2' },
      { title: 'CreditLevel: AAA', key: '0-1-3' }
    ]},
    { title: 'CreditSummary', key: '0-2', children: [
      { title: 'CreditCardAccounts: 5', key: '0-2-0' },
      { title: 'LoanAccounts: 3', key: '0-2-1' },
      { title: 'OverdueCount: 1', key: '0-2-2' },
      { title: 'MaxOverdueDays: 30', key: '0-2-3' },
      { title: 'TotalDebt: 1500000.00', key: '0-2-4' }
    ]}
  ]}
])

const extractedFields = computed(() => {
  const report = currentReport.value || {}
  return {
    name: props.userInfo?.name || '某科技有限公司',
    idCard: props.userInfo?.idCard || '91110000XXXXXXXX',
    creditScore: report.creditScore || 785,
    creditLevel: report.creditLevel || 'AAA',
    creditCardCount: 5,
    loanCount: 3,
    overdueCount: 1,
    totalDebt: 1500000
  }
})

const viewReportDetail = (report: any) => { currentReport.value = report; detailModalVisible.value = true }
const closeDetailModal = () => { detailModalVisible.value = false; currentReport.value = null }
const toggleXmlCollapse = () => { xmlCollapsed.value = !xmlCollapsed.value }

const copyXmlContent = async () => {
  try {
    await navigator.clipboard.writeText(currentReport.value?.xmlContent || sampleXmlContent)
    Message.success('XML内容已复制')
  } catch { Message.error('复制失败') }
}

const downloadReport = (report: any) => {
  const blob = new Blob([report.xmlContent || sampleXmlContent], { type: 'application/xml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = `${report.reportId}.xml`; a.click()
  URL.revokeObjectURL(url)
  Message.success('报告下载成功')
}

const downloadXmlReport = () => downloadReport(currentReport.value)

// ============ 报告对比相关 ============
const showCompareModal = ref(false)
const compareReportA = ref<any>(null)
const compareReportB = ref<any>(null)
const diffViewMode = ref('side')

const openCompareModal = () => {
  if (selectedReportIds.value.length === 2) {
    const reports = creditReports.value.filter(r => selectedReportIds.value.includes(r.reportId))
    reports.sort((a, b) => new Date(a.queryDate).getTime() - new Date(b.queryDate).getTime())
    compareReportA.value = reports[0]
    compareReportB.value = reports[1]
    showCompareModal.value = true
  }
}

const compareDiffData = computed(() => {
  const a = compareReportA.value || {}
  const b = compareReportB.value || {}
  return [
    { field: '信用评分', before: a.creditScore || '-', after: b.creditScore || '-', change: calculateChange(a.creditScore, b.creditScore), changeClass: getChangeClass(a.creditScore, b.creditScore) },
    { field: '信用等级', before: a.creditLevel || '-', after: b.creditLevel || '-', change: a.creditLevel !== b.creditLevel ? '等级变化' : '无变化', changeClass: a.creditLevel !== b.creditLevel ? 'changed' : 'unchanged' },
    { field: '查询时间', before: formatDate(a.queryDate), after: formatDate(b.queryDate), change: '-', changeClass: '' },
    { field: '查询机构', before: a.queryOrg || '-', after: b.queryOrg || '-', change: a.queryOrg !== b.queryOrg ? '机构变化' : '无变化', changeClass: a.queryOrg !== b.queryOrg ? 'changed' : 'unchanged' },
    { field: '查询原因', before: a.queryReason || '-', after: b.queryReason || '-', change: a.queryReason !== b.queryReason ? '原因变化' : '无变化', changeClass: a.queryReason !== b.queryReason ? 'changed' : 'unchanged' }
  ]
})

const unifiedDiffLines = [
  { lineNumber: 1, prefix: ' ', type: 'unchanged', content: '<?xml version="1.0" encoding="UTF-8"?>' },
  { lineNumber: 2, prefix: ' ', type: 'unchanged', content: '<CreditReport>' },
  { lineNumber: 3, prefix: ' ', type: 'unchanged', content: '  <Header>' },
  { lineNumber: 4, prefix: '-', type: 'removed', content: '    <ReportId>CR20231201001</ReportId>' },
  { lineNumber: 5, prefix: '+', type: 'added', content: '    <ReportId>CR20240115001</ReportId>' },
  { lineNumber: 6, prefix: ' ', type: 'unchanged', content: '    <GenerateTime>2024-01-15T10:30:00</GenerateTime>' },
  { lineNumber: 7, prefix: '-', type: 'removed', content: '    <CreditScore>752</CreditScore>' },
  { lineNumber: 8, prefix: '+', type: 'added', content: '    <CreditScore>785</CreditScore>' },
  { lineNumber: 9, prefix: ' ', type: 'unchanged', content: '  </Header>' },
  { lineNumber: 10, prefix: ' ', type: 'unchanged', content: '</CreditReport>' }
]

const calculateChange = (before: number, after: number) => {
  if (!before || !after) return '-'
  const diff = after - before
  if (diff > 0) return `+${diff}`
  if (diff < 0) return `${diff}`
  return '无变化'
}

const getChangeClass = (before: number, after: number) => {
  if (!before || !after) return ''
  if (after > before) return 'improved'
  if (after < before) return 'declined'
  return 'unchanged'
}

const closeCompareModal = () => { showCompareModal.value = false; compareReportA.value = null; compareReportB.value = null }

// ============ 查询记录数据 ============
const queryRecords = ref([
  { date: '2024-01-15', org: '某银行股份有限公司', reason: '贷款审批', type: '机构查询' },
  { date: '2024-01-10', org: '某消费金融公司', reason: '贷后管理', type: '机构查询' },
  { date: '2024-01-05', org: '本人查询', reason: '个人查询', type: '本人查询' }
])

const queryColumns = [
  { title: '查询日期', dataIndex: 'date', width: 120 },
  { title: '查询机构', dataIndex: 'org' },
  { title: '查询原因', dataIndex: 'reason', width: 120 },
  { title: '查询类型', dataIndex: 'type', width: 100 }
]

const disputeRecords = ref([])
</script>

<style scoped>
.credit-profile { padding: 16px; width: 100%; }
.credit-content { width: 100%; max-width: none; }
.profile-section { margin-bottom: 24px; padding: 16px; background: #fafafa; border-radius: 6px; }
.section-title { margin: 0 0 16px 0; font-size: 16px; font-weight: 600; color: var(--subapp-text-primary); padding-bottom: 8px; border-bottom: 1px solid #f0f0f0; }
.section-header-with-action { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.section-header-with-action .section-title { margin: 0; border-bottom: none; padding-bottom: 0; }
.status-info { display: flex; flex-direction: column; gap: 12px; }
.status-item { display: flex; align-items: center; gap: 8px; }
.status-item .label { font-weight: 500; color: #666; min-width: 100px; }
.status-item .value { color: #333; }
.debug-controls { margin-top: 16px; }
.debug-title { font-size: 12px; color: #999; margin-bottom: 8px; }
.report-id { font-family: Monaco, Menlo, monospace; font-size: 12px; color: var(--subapp-primary); }
.score-excellent { color: #52c41a; font-weight: 600; }
.score-good { color: var(--subapp-info); font-weight: 500; }
.score-fair { color: #faad14; font-weight: 500; }
.score-poor { color: var(--subapp-danger); font-weight: 500; }

/* 详情弹窗样式 */
.report-detail-container { display: flex; flex-direction: column; gap: 16px; }
.report-meta { margin-bottom: 16px; }
.xml-section { background: #fafafa; border: 1px solid #e5e6eb; border-radius: 8px; padding: 16px; }
.xml-section .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.xml-section .section-header h4 { margin: 0; font-size: 14px; color: var(--subapp-text-primary); }
.xml-content { max-height: 400px; overflow: auto; }
.xml-pre { margin: 0; padding: 12px; background: var(--subapp-text-primary); color: #d4d4d4; border-radius: 4px; font-family: Monaco, Menlo, monospace; font-size: 12px; line-height: 1.6; white-space: pre-wrap; word-break: break-all; }
.xml-pre.raw { background: #f5f5f5; color: #333; }
.xml-pre.collapsed { max-height: 200px; overflow: hidden; }

/* 关键字段提取 */
.extracted-fields { margin-top: 16px; }
.extracted-fields h4 { margin: 0 0 12px 0; font-size: 14px; color: var(--subapp-text-primary); }
.field-card { background: #fafafa; border: 1px solid #e5e6eb; border-radius: 6px; padding: 12px; }
.field-label { font-size: 12px; color: var(--subapp-text-tertiary); margin-bottom: 4px; }
.field-value { font-size: 14px; color: var(--subapp-text-primary); font-weight: 500; }
.field-value.highlight { color: var(--subapp-primary); font-size: 16px; }
.field-value.danger { color: var(--subapp-danger); }

/* 对比弹窗样式 */
.compare-container { display: flex; flex-direction: column; gap: 20px; }
.compare-selector { background: #fafafa; border-radius: 8px; padding: 16px; }
.compare-panel { background: #fff; border: 1px solid #e5e6eb; border-radius: 8px; padding: 16px; }
.compare-panel.left-panel { border-left: 4px solid var(--subapp-primary); }
.compare-panel.right-panel { border-left: 4px solid #52c41a; }
.compare-panel h4 { margin: 0 0 12px 0; font-size: 14px; color: var(--subapp-text-primary); }
.compare-diff { margin-top: 16px; }
.compare-diff h4 { margin: 0 0 12px 0; font-size: 14px; color: var(--subapp-text-primary); }
.compare-xml { margin-top: 16px; }
.compare-xml h4 { margin: 0 0 12px 0; font-size: 14px; color: var(--subapp-text-primary); }
.diff-view-mode { margin-bottom: 12px; }
.side-by-side { display: flex; gap: 16px; height: 400px; }
.diff-panel { flex: 1; display: flex; flex-direction: column; border: 1px solid #e5e6eb; border-radius: 8px; overflow: hidden; }
.diff-panel.left { border-left: 3px solid var(--subapp-primary); }
.diff-panel.right { border-left: 3px solid #52c41a; }
.diff-header { padding: 8px 12px; background: #f5f5f5; border-bottom: 1px solid #e5e6eb; font-weight: 500; font-size: 13px; }
.diff-content { flex: 1; margin: 0; padding: 12px; overflow: auto; font-family: Monaco, Menlo, monospace; font-size: 12px; line-height: 1.6; background: var(--subapp-text-primary); color: #d4d4d4; white-space: pre-wrap; word-break: break-all; }
.unified-diff { border: 1px solid #e5e6eb; border-radius: 8px; max-height: 400px; overflow: auto; }
.diff-line { display: flex; font-family: Monaco, Menlo, monospace; font-size: 12px; line-height: 1.6; }
.diff-line.unchanged { background: #fff; }
.diff-line.added { background: #f6ffed; }
.diff-line.removed { background: #fff2f0; }
.line-number { min-width: 40px; padding: 0 8px; color: #999; text-align: right; border-right: 1px solid #e5e6eb; }
.line-prefix { min-width: 20px; padding: 0 4px; font-weight: bold; }
.diff-line.added .line-prefix { color: #52c41a; }
.diff-line.removed .line-prefix { color: var(--subapp-danger); }
.line-content { flex: 1; padding: 0 8px; white-space: pre-wrap; word-break: break-all; }
.before-value { color: var(--subapp-text-tertiary); }
.after-value { color: var(--subapp-primary); font-weight: 500; }
.improved { color: #52c41a; font-weight: 500; }
.declined { color: var(--subapp-danger); font-weight: 500; }
.unchanged { color: var(--subapp-text-tertiary); }
.changed { color: #fa8c16; font-weight: 500; }

:deep(.arco-descriptions-item-label) { font-weight: 500; color: #666; }

/* 表格优化 */
:deep(.arco-table-th) { background-color: #f7f8fa; font-weight: 600; }
:deep(.arco-table-td) { border-bottom: 1px solid #f0f0f0; }
:deep(.arco-table-tbody .arco-table-tr:hover .arco-table-td) { background-color: #f7f8fa; }

/* 网格布局 */
.grid { display: grid; }
.grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
.gap-4 { gap: 1rem; }
</style>
