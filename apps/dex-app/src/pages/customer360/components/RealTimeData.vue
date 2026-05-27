<template>
  <div class="real-time-data-container">

    <!-- 额度指标卡 -->
    <div class="data-section">
      <div class="quota-grid">
        <div class="quota-card">
          <div class="quota-label">授信额度</div>
          <div class="quota-value">{{ formatCurrency(totalCreditLimit) }}</div>
          <div class="quota-desc">总授信额度</div>
        </div>
        <div class="quota-card">
          <div class="quota-label">可用额度</div>
          <div class="quota-value available">{{ formatCurrency(availableCredit) }}</div>
          <div class="quota-desc">当前可用额度</div>
        </div>
      </div>
    </div>

    <!-- 授信列表 -->
    <div class="data-section">
      <h3 class="section-title">授信列表</h3>
      <a-table :data="creditList" :columns="creditColumns" :pagination="false" size="small" :bordered="true">
        <template #creditAmount="{ record }">
          {{ formatCurrency(record.creditAmount) }}
        </template>
        <template #creditStatus="{ record }">
          <a-tag :color="getCreditStatusColor(record.creditStatus)">{{ record.creditStatus }}</a-tag>
        </template>
      </a-table>
    </div>

    <!-- 用信列表 -->
    <div class="data-section">
      <h3 class="section-title">用信列表</h3>
      <a-table :data="loanList" :columns="loanColumns" :pagination="false" size="small" :bordered="true">
        <template #loanAmount="{ record }">
          {{ formatCurrency(record.loanAmount) }}
        </template>
        <template #balance="{ record }">
          {{ formatCurrency(record.balance) }}
        </template>
        <template #loanStatus="{ record }">
          <a-tag :color="getLoanStatusColor(record.loanStatus)">{{ record.loanStatus }}</a-tag>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface CreditRecord {
  id: string;
  productName: string;
  creditTime: string;
  creditAmount: number;
  creditStatus: string;
  source: string;
}

interface LoanRecord {
  id: string;
  productName: string;
  loanTime: string;
  loanAmount: number;
  balance: number;
  loanStatus: string;
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

// 授信额度汇总（来自 mock userInfo.realTimeData）
const totalCreditLimit = computed(() => {
  if (props.userRealTimeData?.totalCreditLimit) return props.userRealTimeData.totalCreditLimit;
  if (props.productData?.currentTotalCreditAmount) return props.productData.currentTotalCreditAmount;
  return 250000;
});


// 可用额度
const availableCredit = computed(() => {
  if (props.userRealTimeData?.availableCredit !== undefined) return props.userRealTimeData.availableCredit;
  if (props.productData) {
    const total = props.productData.currentTotalCreditAmount || 0;
    const used = props.productData.currentTotalLoanBalance || 0;
    return Math.max(0, total - used);
  }
  return props.userRealTimeData?.usedCredit ? props.userRealTimeData.totalCreditLimit - props.userRealTimeData.usedCredit : 50000;
});


// 授信列表（来自 mock，必须用 computed 保持响应性）
const creditList = computed(() =>
  props.userRealTimeData?.creditList?.length
    ? props.userRealTimeData.creditList as CreditRecord[]
    : [
        { id: 'CR001', productName: 'Su贷-极速版', creditTime: '2026-05-01', creditAmount: 100000, creditStatus: '正常', source: '自动' },
        { id: 'CR002', productName: 'Su贷-标准版', creditTime: '2026-04-15', creditAmount: 50000, creditStatus: '正常', source: '自动' },
        { id: 'CR003', productName: 'Su贷-极速版', creditTime: '2026-03-01', creditAmount: 100000, creditStatus: '冻结', source: '人工' },
        { id: 'CR004', productName: 'Su贷-标准版', creditTime: '2026-01-10', creditAmount: 80000, creditStatus: '销户', source: '自动' }
      ]
);

// 用信列表（来自 mock，必须用 computed 保持响应性）
const loanList = computed(() =>
  props.userRealTimeData?.loanList?.length
    ? props.userRealTimeData.loanList as LoanRecord[]
    : [
        { id: 'LN001', productName: 'Su贷-极速版', loanTime: '2026-05-01', loanAmount: 50000, balance: 45000, loanStatus: '正常' },
        { id: 'LN002', productName: 'Su贷-标准版', loanTime: '2026-04-20', loanAmount: 30000, balance: 0, loanStatus: '结清' },
        { id: 'LN003', productName: 'Su贷-极速版', loanTime: '2026-03-15', loanAmount: 20000, balance: 8500, loanStatus: '正常' },
        { id: 'LN004', productName: 'Su贷-标准版', loanTime: '2026-02-28', loanAmount: 15000, balance: 0, loanStatus: '结清' },
        { id: 'LN005', productName: 'Su贷-极速版', loanTime: '2026-01-10', loanAmount: 80000, balance: 32000, loanStatus: '逾期' },
        { id: 'LN006', productName: 'Su贷-标准版', loanTime: '2025-12-05', loanAmount: 50000, balance: 0, loanStatus: '结清' }
      ]
);

// 授信列表列定义
const creditColumns = [
  { title: '产品名称', dataIndex: 'productName', slotName: 'productName' },
  { title: '授信时间', dataIndex: 'creditTime', slotName: 'creditTime' },
  { title: '授信额度', dataIndex: 'creditAmount', slotName: 'creditAmount' },
  { title: '授信状态', dataIndex: 'creditStatus', slotName: 'creditStatus' },
  { title: '来源', dataIndex: 'source', slotName: 'source' }
];

// 用信列表列定义（无三方借据号）
const loanColumns = [
  { title: '产品名称', dataIndex: 'productName', slotName: 'productName' },
  { title: '用信时间', dataIndex: 'loanTime', slotName: 'loanTime' },
  { title: '借款金额', dataIndex: 'loanAmount', slotName: 'loanAmount' },
  { title: '余额', dataIndex: 'balance', slotName: 'balance' },
  { title: '状态', dataIndex: 'loanStatus', slotName: 'loanStatus' }
];

// 格式化货币
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 2
  }).format(value);
};

// 授信状态颜色
const getCreditStatusColor = (status: string): string => {
  const map: Record<string, string> = {
    '正常': 'green',
    '冻结': 'orange',
    '销户': 'gray'
  };
  return map[status] || 'gray';
};

// 用信状态颜色
const getLoanStatusColor = (status: string): string => {
  const map: Record<string, string> = {
    '正常': 'green',
    '逾期': 'red',
    '结清': 'gray'
  };
  return map[status] || 'gray';
};
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
  color: var(--subapp-text-primary, #1f2329);
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 8px;
}

/* 额度指标卡 */
.quota-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.quota-card {
  background: #f8f9fb;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 20px 24px;
  text-align: center;
}

.quota-label {
  font-size: 14px;
  color: var(--subapp-text-tertiary, #89929a);
  margin-bottom: 8px;
}

.quota-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--subapp-text-primary, #1f2329);
  margin-bottom: 4px;
}

.quota-value.available {
  color: rgb(var(--green-6));
}

.quota-desc {
  font-size: 12px;
  color: var(--subapp-text-tertiary, #89929a);
}

@media (max-width: 768px) {
  .quota-grid {
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