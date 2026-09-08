<template>
  <div class="real-time-data-container">
    <div class="data-section">
      <h3 class="section-title">实时指标</h3>
      <div class="data-grid">
        <div class="data-card">
          <div class="data-label">当前余额</div>
          <div class="data-value">{{ formatCurrency(currentBalance) }}</div>
          <div class="data-desc">账户实时可用余额</div>
        </div>
        <div class="data-card">
          <div class="data-label">当日放款金额</div>
          <div class="data-value">{{ formatCurrency(dailyDisbursement) }}</div>
          <div class="data-desc">今日累计放款金额</div>
        </div>
        <div class="data-card">
          <div class="data-label">当日还款金额</div>
          <div class="data-value">{{ formatCurrency(dailyRepayment) }}</div>
          <div class="data-desc">今日累计还款金额</div>
        </div>
        <div class="data-card">
          <div class="data-label">实时利率</div>
          <div class="data-value">{{ currentRate }}%</div>
          <div class="data-desc">当前实时利率水平</div>
        </div>
      </div>
    </div>

    <div class="data-section">
      <h3 class="section-title">实时交易流水</h3>
      <div class="transaction-table">
        <a-table 
          :columns="transactionColumns" 
          :data-source="realTimeTransactions" 
          :pagination="{ pageSize: 5 }"
          row-key="id"
        />
      </div>
    </div>

    <div class="data-section">
      <h3 class="section-title">实时风险指标</h3>
      <div class="data-grid">
        <div class="data-card">
          <div class="data-label">风险评分</div>
          <div class="data-value risk-score">{{ riskScore }}</div>
          <div class="data-desc">基于实时行为的风险评估</div>
        </div>
        <div class="data-card">
          <div class="data-label">逾期天数</div>
          <div class="data-value overdue-days">{{ overdueDays }}</div>
          <div class="data-desc">当前逾期天数</div>
        </div>
        <div class="data-card">
          <div class="data-label">预警等级</div>
          <div class="data-value warning-level">{{ warningLevel }}</div>
          <div class="data-desc">实时风险预警等级</div>
        </div>
        <div class="data-card">
          <div class="data-label">可用额度</div>
          <div class="data-value">{{ formatCurrency(availableCredit) }}</div>
          <div class="data-desc">实时可用授信额度</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

interface Transaction {
  id: string;
  transactionTime: string;
  transactionType: string;
  amount: number;
  balanceAfter: number;
  status: string;
  description: string;
}

interface Props {
  productKey?: string;
  productData?: any;
  userRealTimeData?: any;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
});

// 模拟实时数据
const currentBalance = ref<number>(150000);
const dailyDisbursement = ref<number>(250000);
const dailyRepayment = ref<number>(180000);
const currentRate = ref<number>(3.9);
const riskScore = ref<number>(785);
const overdueDays = ref<number>(0);
const warningLevel = ref<string>('低风险');
const availableCredit = ref<number>(50000);

// 实时交易流水数据
const realTimeTransactions = ref<Transaction[]>([
  {
    id: 'RTX001',
    transactionTime: '2024-01-30 14:32:15',
    transactionType: '放款',
    amount: 50000,
    balanceAfter: 200000,
    status: '成功',
    description: 'Su贷-快捷放款'
  },
  {
    id: 'RTX002',
    transactionTime: '2024-01-30 11:20:30',
    transactionType: '还款',
    amount: 3000,
    balanceAfter: 150000,
    status: '成功',
    description: 'Su贷-自动扣款'
  },
  {
    id: 'RTX003',
    transactionTime: '2024-01-30 09:15:45',
    transactionType: '查询',
    amount: 0,
    balanceAfter: 153000,
    status: '成功',
    description: '账户余额查询'
  },
  {
    id: 'RTX004',
    transactionTime: '2024-01-29 16:45:20',
    transactionType: '提现',
    amount: 20000,
    balanceAfter: 156000,
    status: '成功',
    description: 'Su贷-快速提现'
  },
  {
    id: 'RTX005',
    transactionTime: '2024-01-29 10:30:10',
    transactionType: '还款',
    amount: 4500,
    balanceAfter: 176000,
    status: '成功',
    description: 'Su贷-主动还款'
  }
]);

// 交易流水表格列定义
const transactionColumns = [
  {
    title: '交易时间',
    dataIndex: 'transactionTime',
    key: 'transactionTime',
  },
  {
    title: '交易类型',
    dataIndex: 'transactionType',
    key: 'transactionType',
  },
  {
    title: '金额',
    dataIndex: 'amount',
    key: 'amount',
    slots: { customRender: 'amount' },
  },
  {
    title: '交易后余额',
    dataIndex: 'balanceAfter',
    key: 'balanceAfter',
    slots: { customRender: 'balanceAfter' },
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
  },
  {
    title: '描述',
    dataIndex: 'description',
    key: 'description',
  }
];

// 格式化货币
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 2
  }).format(value);
};

// 模拟实时数据更新
let intervalId: number | null = null;

onMounted(() => {
  // 模拟实时数据更新
  intervalId = window.setInterval(() => {
    // 更新一些随机数值来模拟实时变化
    currentBalance.value = currentBalance.value + Math.floor(Math.random() * 100) - 50;
    dailyDisbursement.value = dailyDisbursement.value + Math.floor(Math.random() * 1000);
    dailyRepayment.value = dailyRepayment.value + Math.floor(Math.random() * 500);
    
    // 风险评分轻微波动
    riskScore.value = Math.max(300, Math.min(950, riskScore.value + Math.floor(Math.random() * 10) - 5));
    
    // 随机生成新的交易记录
    if (Math.random() > 0.7) {
      const newTransaction: Transaction = {
        id: `RTX${String(realTimeTransactions.value.length + 1).padStart(3, '0')}`,
        transactionTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
        transactionType: ['放款', '还款', '提现', '查询'][Math.floor(Math.random() * 4)] as string,
        amount: Math.floor(Math.random() * 10000),
        balanceAfter: currentBalance.value,
        status: '成功',
        description: 'Su贷-实时交易'
      };
      
      realTimeTransactions.value.unshift(newTransaction);
      // 只保留最近10条记录
      if (realTimeTransactions.value.length > 10) {
        realTimeTransactions.value.pop();
      }
    }
  }, 5000); // 每5秒更新一次
});

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId);
  }
});
</script>

<style scoped>
.real-time-data-container {
  padding: 16px;
  background: #fafafa;
  min-height: 400px;
}

.data-section {
  margin-bottom: 24px;
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.section-title {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 8px;
}

.data-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.data-card {
  background: white;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  padding: 16px;
  text-align: center;
  transition: box-shadow 0.3s ease;
}

.data-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.data-label {
  font-size: 12px;
  color: #86909c;
  margin-bottom: 4px;
}

.data-value {
  font-size: 20px;
  font-weight: 600;
  color: #1d2129;
  margin-bottom: 4px;
}

.data-value.risk-score {
  color: #52c41a;
}

.data-value.overdue-days {
  color: #fa8c16;
}

.data-value.warning-level {
  color: #fa541c;
}

.data-desc {
  font-size: 12px;
  color: #86909c;
}

.transaction-table {
  margin-top: 16px;
}

:deep(.arco-table) {
  background: white;
}

:deep(.arco-table-tr) {
  background: white;
}

@media (max-width: 768px) {
  .data-grid {
    grid-template-columns: 1fr;
  }
  
  .real-time-data-container {
    padding: 12px;
  }
  
  .data-section {
    padding: 12px;
  }
}
</style>