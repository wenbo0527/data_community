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
              <span class="label">报告生成时间:</span>
              <span class="value">{{ creditInfo?.reportDate || '2024-01-15 10:30:00' }}</span>
            </div>
            <div class="status-item" v-if="creditStatus === 'available'">
              <span class="label">报告有效期:</span>
              <span class="value">{{ creditInfo?.validUntil || '2024-04-15' }}</span>
            </div>
          </div>
          
          <!-- 状态切换按钮（仅在开发环境显示） -->
          <div class="debug-controls" v-if="showDebugControls">
            <a-divider />
            <div class="debug-title">开发调试控制</div>
            <a-space>
              <a-button 
                size="small" 
                @click="setCreditStatus('no_report')"
                :type="creditStatus === 'no_report' ? 'primary' : 'default'"
              >
                无报告
              </a-button>
              <a-button 
                size="small" 
                @click="setCreditStatus('no_permission')"
                :type="creditStatus === 'no_permission' ? 'primary' : 'default'"
              >
                无权限
              </a-button>
              <a-button 
                size="small" 
                @click="setCreditStatus('available')"
                :type="creditStatus === 'available' ? 'primary' : 'default'"
              >
                查得报告
              </a-button>
            </a-space>
          </div>
        </div>

        <!-- 征信报告内容 -->
        <div v-if="creditStatus === 'available'" class="credit-report">
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
            <a-table 
              :data="queryRecords" 
              :columns="queryColumns"
              :pagination="false"
              size="small"
            />
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { IconFile, IconLock } from '@arco-design/web-vue/es/icon'

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

// 征信状态：no_report(无报告), no_permission(无权限), available(查得报告)
const creditStatus = ref<'no_report' | 'no_permission' | 'available'>('available')

// 开发环境显示调试控制
const showDebugControls = computed(() => {
  return process.env.NODE_ENV === 'development'
})

// 状态相关方法
const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    'no_report': 'gray',
    'no_permission': 'orange', 
    'available': 'green'
  }
  return colorMap[status] || 'gray'
}

const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    'no_report': '无报告',
    'no_permission': '无权限',
    'available': '查得报告'
  }
  return textMap[status] || '未知状态'
}

const setCreditStatus = (status: 'no_report' | 'no_permission' | 'available') => {
  creditStatus.value = status
}

// 查询记录数据
const queryRecords = ref([
  {
    date: '2024-01-15',
    org: '某银行股份有限公司',
    reason: '贷款审批',
    type: '机构查询'
  },
  {
    date: '2024-01-10', 
    org: '某消费金融公司',
    reason: '贷后管理',
    type: '机构查询'
  },
  {
    date: '2024-01-05',
    org: '本人查询',
    reason: '个人查询',
    type: '本人查询'
  }
])

const queryColumns = [
  {
    title: '查询日期',
    dataIndex: 'date',
    width: 120
  },
  {
    title: '查询机构',
    dataIndex: 'org'
  },
  {
    title: '查询原因',
    dataIndex: 'reason',
    width: 120
  },
  {
    title: '查询类型',
    dataIndex: 'type',
    width: 100
  }
]

// 异议记录数据
const disputeRecords = ref([])
</script>

<style scoped>
.credit-profile {
  padding: 16px;
  width: 100%;
}

.credit-content {
  width: 100%;
  max-width: none;
}

.profile-section {
  margin-bottom: 24px;
  padding: 16px;
  background: #fafafa;
  border-radius: 6px;
}

.section-title {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--subapp-text-primary);
  padding-bottom: 8px;
  border-bottom: 1px solid var(--subapp-border);
}

.status-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-item .label {
  font-weight: 500;
  color: #666;
  min-width: 100px;
}

.status-item .value {
  color: #333;
}

.debug-controls {
  margin-top: 16px;
}

.debug-title {
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
}

.summary-item-box {
  background: #fff;
  padding: 16px;
  border-radius: 6px;
  border: 1px solid #e8e8e8;
}

.summary-title {
  color: #666;
  font-size: 13px;
  margin-bottom: 8px;
}

.summary-value {
  color: #333;
  font-size: 24px;
  font-weight: 600;
  font-family: 'DIN Alternate', 'Helvetica Neue', Arial, sans-serif;
}

.summary-value .suffix {
  font-size: 13px;
  margin-left: 4px;
  font-weight: normal;
  color: var(--subapp-text-tertiary);
}

.highlight-red {
  color: #f5222d !important;
}

.no-report,
.no-permission {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  background: #fafafa;
  border-radius: 6px;
}

.dispute-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.dispute-content {
  flex: 1;
  color: #333;
}

.dispute-date {
  color: #999;
  font-size: 12px;
}

:deep(.arco-descriptions-item-label) {
  font-weight: 500;
  color: #666;
}

/* 表格优化 */
:deep(.arco-table-th) {
  background-color: #f7f8fa;
  font-weight: 600;
}

:deep(.arco-table-td) {
  border-bottom: 1px solid var(--subapp-border);
}

:deep(.arco-table-tbody .arco-table-tr:hover .arco-table-td) {
  background-color: #f7f8fa;
}
</style>