<template>
  <div class="credit-profile">
    <a-spin :loading="loading">
      <div class="credit-content">
        <!-- 征信报告状态 -->
        <a-card title="征信报告状态" class="status-card">
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
        </a-card>

        <!-- 征信报告内容 -->
        <div v-if="creditStatus === 'available'" class="credit-report">
          <!-- 基本信息 -->
          <a-card title="基本信息" class="info-card">
            <a-descriptions :column="2" bordered>
              <a-descriptions-item label="姓名">{{ userInfo?.name || '张三' }}</a-descriptions-item>
              <a-descriptions-item label="身份证号">{{ userInfo?.idCard || '110101199001011234' }}</a-descriptions-item>
              <a-descriptions-item label="查询时间">{{ creditInfo?.queryTime || '2024-01-15' }}</a-descriptions-item>
              <a-descriptions-item label="查询机构">{{ creditInfo?.queryOrg || '某银行股份有限公司' }}</a-descriptions-item>
            </a-descriptions>
          </a-card>

          <!-- 信贷记录摘要 -->
          <a-card title="信贷记录摘要" class="summary-card">
            <a-row :gutter="16">
              <a-col :span="6">
                <a-statistic title="信用卡账户数" :value="creditInfo?.creditCardCount || 5" suffix="个" />
              </a-col>
              <a-col :span="6">
                <a-statistic title="贷款账户数" :value="creditInfo?.loanCount || 3" suffix="个" />
              </a-col>
              <a-col :span="6">
                <a-statistic title="逾期账户数" :value="creditInfo?.overdueCount || 1" suffix="个" />
              </a-col>
              <a-col :span="6">
                <a-statistic title="最长逾期天数" :value="creditInfo?.maxOverdueDays || 30" suffix="天" />
              </a-col>
            </a-row>
          </a-card>

          <!-- 查询记录 -->
          <a-card title="查询记录" class="query-card">
            <a-table 
              :data="queryRecords" 
              :columns="queryColumns"
              :pagination="false"
              size="small"
            />
          </a-card>

          <!-- 异议信息 -->
          <a-card title="异议信息" class="dispute-card">
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
          </a-card>
        </div>

        <!-- 无报告状态 -->
        <div v-else-if="creditStatus === 'no_report'" class="no-report">
          <a-empty description="暂无征信报告">
            <template #image>
              <icon-file :size="64" style="color: #c9cdd4;" />
            </template>
          </a-empty>
        </div>

        <!-- 无权限状态 -->
        <div v-else-if="creditStatus === 'no_permission'" class="no-permission">
          <a-empty description="暂无查看征信报告的权限">
            <template #image>
              <icon-lock :size="64" style="color: #c9cdd4;" />
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
  background: #f5f5f5;
  min-height: 500px;
}

.credit-content {
  max-width: 1200px;
  margin: 0 auto;
}

.status-card {
  margin-bottom: 16px;
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

.info-card,
.summary-card,
.query-card,
.dispute-card {
  margin-bottom: 16px;
}

.no-report,
.no-permission {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
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

:deep(.arco-card-header) {
  border-bottom: 1px solid #e8e8e8;
  padding: 16px 20px;
}

:deep(.arco-card-body) {
  padding: 20px;
}

:deep(.arco-descriptions-item-label) {
  font-weight: 500;
  color: #666;
}

:deep(.arco-statistic-title) {
  color: #666;
  font-size: 12px;
}

:deep(.arco-statistic-content) {
  color: #333;
  font-weight: 600;
}
</style>