<template>
  <a-card class="classification-viewer" :bordered="false">
    <template #title>
      <div class="card-title">
        <icon-storage class="title-icon" />
        <span>统一分类视图</span>
        <a-tag v-if="tableName" size="small">{{ tableName }}</a-tag>
      </div>
    </template>

    <!-- 表级别合规概览 -->
    <div v-if="overview" class="overview">
      <a-row :gutter="16">
        <a-col :span="12">
          <div class="metric">
            <div class="metric-label">标准合规率</div>
            <div class="metric-value">
              <span class="value-num">{{ overview.complianceRate }}%</span>
              <a-progress
                :percent="overview.complianceRate / 100"
                :show-text="false"
                :stroke-color="overview.complianceRate >= 80 ? '#00b42a' : '#ff7d00'"
                size="small"
              />
            </div>
          </div>
        </a-col>
        <a-col :span="12">
          <div class="metric">
            <div class="metric-label">分级覆盖率</div>
            <div class="metric-value">
              <span class="value-num">{{ overview.classifyCoverage }}%</span>
              <a-progress
                :percent="overview.classifyCoverage / 100"
                :show-text="false"
                :stroke-color="overview.classifyCoverage >= 80 ? '#00b42a' : '#ff7d00'"
                size="small"
              />
            </div>
          </div>
        </a-col>
      </a-row>
    </div>

    <!-- 字段列表 -->
    <a-table
      v-if="fields.length > 0"
      :data="fields"
      :pagination="false"
      size="small"
      row-key="fieldName"
    >
      <template #columns>
        <a-table-column title="字段名" data-index="fieldName" :width="120" />
        <a-table-column title="说明" data-index="fieldComment" :ellipsis="true" />
        <a-table-column title="类型" data-index="fieldType" :width="100">
          <template #cell="{ record }">
            <a-tag size="small">{{ record.fieldType }}</a-tag>
          </template>
        </a-table-column>
        <a-table-column title="数据标准" :width="180">
          <template #cell="{ record }">
            <a-tooltip v-if="record.standard" :content="record.standard.description">
              <a-tag color="arcoblue" size="small">
                {{ record.standard.code }} · {{ record.standard.chineseName }}
              </a-tag>
            </a-tooltip>
            <a-tag v-else size="small" color="gray">未关联</a-tag>
          </template>
        </a-table-column>
        <a-table-column title="敏感级别" :width="100">
          <template #cell="{ record }">
            <a-tag v-if="record.sensitivity" :color="sensitivityColor(record.sensitivity.level)" size="small">
              {{ record.sensitivity.level }} · {{ record.sensitivity.grade }}
            </a-tag>
            <a-tag v-else size="small" color="gray">未分级</a-tag>
          </template>
        </a-table-column>
        <a-table-column title="业务归属" :width="100">
          <template #cell="{ record }">
            <a-tag v-if="record.sensitivity" size="small">{{ record.sensitivity.belonging }}</a-tag>
          </template>
        </a-table-column>
        <a-table-column title="业务要素" :width="180">
          <template #cell="{ record }">
            <a-tag v-if="record.businessElement" color="purple" size="small">
              {{ record.businessElement.name }}
            </a-tag>
          </template>
        </a-table-column>
        <a-table-column title="合规" :width="80">
          <template #cell="{ record }">
            <a-tag v-if="record.compliance === 'compliant'" color="green" size="small">合规</a-tag>
            <a-tag v-else-if="record.compliance === 'deviation'" color="red" size="small">偏离</a-tag>
            <a-tag v-else size="small" color="gray">未知</a-tag>
          </template>
        </a-table-column>
      </template>
    </a-table>

    <a-empty v-else description="该表暂无字段打标信息" />
  </a-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { IconStorage } from '@arco-design/web-vue/es/icon'
import { useAssetClassification } from '@/composables/useAssetClassification'
import type { SensitivityLevel } from '@/mock/shared/classify-types'

const props = defineProps<{
  tableName: string
}>()

const { tableOverview, tableView } = useAssetClassification()

const overview = computed(() => tableOverview(props.tableName))
const fields = computed(() => tableView(props.tableName))

const sensitivityColor = (level: SensitivityLevel) => {
  return {
    L1: 'gray',
    L2: 'arcoblue',
    L3: 'orange',
    L4: 'red'
  }[level] || 'gray'
}
</script>

<style lang="scss" scoped>
.classification-viewer {
  .card-title {
    display: flex;
    align-items: center;
    gap: 8px;

    .title-icon {
      color: #165dff;
      font-size: 18px;
    }
  }

  .overview {
    margin-bottom: 16px;
    padding: 12px;
    background: #f7f8fa;
    border-radius: 6px;

    .metric-label {
      font-size: 12px;
      color: #86909c;
      margin-bottom: 6px;
    }

    .metric-value {
      display: flex;
      align-items: center;
      gap: 8px;

      .value-num {
        font-size: 18px;
        font-weight: 600;
        color: #1d2129;
        min-width: 50px;
      }
    }
  }
}
</style>