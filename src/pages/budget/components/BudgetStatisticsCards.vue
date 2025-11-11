<template>
  <div class="budget-statistics-cards">
    <a-row :gutter="16">
      <a-col :span="6">
        <a-card class="stat-card" hoverable>
          <div class="stat-content">
            <div class="stat-icon budget-total">
              <icon-money />
            </div>
            <div class="stat-info">
              <div class="stat-value">¥{{ formatAmount(statistics.totalBudgetAmount) }}</div>
              <div class="stat-label">总预算金额</div>
            </div>
          </div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card class="stat-card" hoverable>
          <div class="stat-content">
            <div class="stat-icon budget-used">
              <icon-arrow-rise />
            </div>
            <div class="stat-info">
              <div class="stat-value">¥{{ formatAmount(statistics.usedBudgetAmount) }}</div>
              <div class="stat-label">已使用金额</div>
            </div>
          </div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card class="stat-card" hoverable>
          <div class="stat-content">
            <div class="stat-icon budget-remaining">
              <icon-wallet />
            </div>
            <div class="stat-info">
              <div class="stat-value">¥{{ formatAmount(statistics.remainingBudgetAmount) }}</div>
              <div class="stat-label">剩余金额</div>
            </div>
          </div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card class="stat-card" hoverable>
          <div class="stat-content">
            <div class="stat-icon execution-rate">
        <icon-bar-chart />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.averageExecutionRate }}%</div>
              <div class="stat-label">平均执行率</div>
              <div class="execution-progress">
                <a-progress 
                  :percent="statistics.averageExecutionRate" 
                  :status="getExecutionRateStatus(statistics.averageExecutionRate)"
                  size="small"
                />
              </div>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
// defineProps 为编译宏，无需显式导入

interface BudgetStatistics {
  totalBudgetAmount: number
  usedBudgetAmount: number
  remainingBudgetAmount: number
  averageExecutionRate: number
  totalBudgetCount: number
  activeBudgetCount: number
}

const props = defineProps<{
  statistics: BudgetStatistics
}>()

const formatAmount = (amount: number | null | undefined): string => {
  const n = Number(amount ?? 0)
  if (Number.isNaN(n)) return '0'
  return n.toLocaleString('zh-CN')
}

const getExecutionRateStatus = (rate: number): 'success' | 'warning' | 'danger' => {
  if (rate >= 90) return 'danger'
  if (rate >= 70) return 'warning'
  return 'success'
}
</script>

<style scoped lang="less">
.budget-statistics-cards {
  margin-bottom: 24px;
  
  .stat-card {
    height: 140px;
    border-radius: 8px;
    
    .stat-content {
      display: flex;
      align-items: center;
      height: 100%;
      padding: 16px;
      
      .stat-icon {
        width: 56px;
        height: 56px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 16px;
        
        .arco-icon {
          font-size: 28px;
          color: #fff;
        }
        
        &.budget-total {
          background: linear-gradient(135deg, #165dff 0%, #0e42d2 100%);
        }
        
        &.budget-used {
          background: linear-gradient(135deg, #00b42a 0%, #009a29 100%);
        }
        
        &.budget-remaining {
          background: linear-gradient(135deg, #ff7d00 0%, #d25f00 100%);
        }
        
        &.execution-rate {
          background: linear-gradient(135deg, #722ed1 0%, #531dab 100%);
        }
      }
      
      .stat-info {
        flex: 1;
        
        .stat-value {
          font-size: 24px;
          font-weight: 600;
          color: #1d2129;
          margin-bottom: 8px;
        }
        
        .stat-label {
          font-size: 14px;
          color: #86909c;
          margin-bottom: 8px;
        }
        
        .execution-progress {
          margin-top: 8px;
        }
      }
    }
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      transition: all 0.3s ease;
    }
  }
}
</style>