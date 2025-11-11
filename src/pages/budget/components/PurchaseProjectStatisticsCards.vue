<template>
  <div class="purchase-project-statistics-cards">
    <a-row :gutter="16">
      <a-col :span="6">
        <a-card class="stat-card" hoverable>
          <div class="stat-content">
            <div class="stat-icon project-total">
              <icon-folder />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.totalProjectCount }}</div>
              <div class="stat-label">项目总数</div>
            </div>
          </div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card class="stat-card" hoverable>
          <div class="stat-content">
            <div class="stat-icon project-active">
              <icon-play-circle />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.activeProjectCount }}</div>
              <div class="stat-label">进行中项目</div>
            </div>
          </div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card class="stat-card" hoverable>
          <div class="stat-content">
            <div class="stat-icon project-completed">
              <icon-check-circle />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.completedProjectCount }}</div>
              <div class="stat-label">已完成项目</div>
            </div>
          </div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card class="stat-card" hoverable>
          <div class="stat-content">
            <div class="stat-icon project-amount">
              <icon-calendar />
            </div>
            <div class="stat-info">
              <div class="stat-value">¥{{ formatAmount(statistics.totalProjectAmount) }}</div>
              <div class="stat-label">项目总金额</div>
              <div class="project-distribution">
                <div class="distribution-item">
                  <span class="distribution-label">进行中:</span>
                  <span class="distribution-value">¥{{ formatAmount(statistics.activeProjectAmount) }}</span>
                </div>
                <div class="distribution-item">
                  <span class="distribution-label">已完成:</span>
                  <span class="distribution-value">¥{{ formatAmount(statistics.completedProjectAmount) }}</span>
                </div>
              </div>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
import { IconFolder, IconPlayCircle, IconCheckCircle, IconCalendar } from '@arco-design/web-vue/es/icon'

interface ProjectStatistics {
  totalProjectCount: number
  activeProjectCount: number
  completedProjectCount: number
  cancelledProjectCount: number
  totalProjectAmount: number
  activeProjectAmount: number
  completedProjectAmount: number
  cancelledProjectAmount: number
}

const props = defineProps<{
  statistics: ProjectStatistics
}>()

const formatAmount = (amount: number | null | undefined): string => {
  const n = Number(amount ?? 0)
  if (Number.isNaN(n)) return '0'
  return n.toLocaleString('zh-CN')
}
</script>

<style scoped lang="less">
.purchase-project-statistics-cards {
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
        
        &.project-total {
          background: linear-gradient(135deg, #14c9c9 0%, #0d9d9d 100%);
        }
        
        &.project-active {
          background: linear-gradient(135deg, #3491fa 0%, #165dff 100%);
        }
        
        &.project-completed {
          background: linear-gradient(135deg, #00b42a 0%, #009a29 100%);
        }
        
        &.project-amount {
          background: linear-gradient(135deg, #ff7d00 0%, #d25f00 100%);
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
        
        .project-distribution {
          margin-top: 8px;
          
          .distribution-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12px;
            margin-bottom: 4px;
            
            &:last-child {
              margin-bottom: 0;
            }
            
            .distribution-label {
              color: #86909c;
            }
            
            .distribution-value {
              color: #1d2129;
              font-weight: 500;
            }
          }
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