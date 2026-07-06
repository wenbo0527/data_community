<template>
  <div class="classify-sources-page">
    <DmtPageHeader title="数据分级分类" sub-title="按数据源管理字段的分级分类标签" />

    <!-- 统计卡 -->
    <a-row :gutter="16" class="stats-row">
      <a-col :span="6">
        <a-card>
          <a-statistic title="总表数" :value="stats.totalTables" :value-style="{ color: '#165DFF' }" />
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic title="已分级表数" :value="stats.classifiedTables" :value-style="{ color: '#52C41A' }">
            <template #suffix>
              <span style="font-size: 14px; color: #86909c">/ {{ stats.totalTables }}</span>
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic title="待分级表数" :value="stats.pendingTables" :value-style="{ color: '#FA8C16' }" />
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic title="整体覆盖率" :value="stats.coverageRate" :precision="1">
            <template #suffix>%</template>
          </a-statistic>
        </a-card>
      </a-col>
    </a-row>

    <!-- 数据源卡片 -->
    <div class="section-title">
      <h3>数据源</h3>
      <span class="section-subtitle">点击进入查看表列表与字段分级</span>
    </div>
    <a-row :gutter="[16, 16]">
      <a-col v-for="sys in systems" :key="sys.id" :xs="24" :sm="12" :md="8" :lg="8">
        <a-card hoverable class="system-card" @click="goToTables(sys)">
          <template #title>
            <a-space>
              <component :is="getIcon(sys.icon)" />
              <span class="card-title">{{ sys.name }}</span>
            </a-space>
          </template>
          <a-descriptions :column="1" size="small">
            <a-descriptions-item label="表数量">
              <a-tag color="arcoblue">{{ sys.tableCount }} 张</a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="字段总数">
              <a-tag>{{ sys.fieldCount }}</a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="分级分布">
              <a-space :size="4">
                <a-tag v-for="(cnt, lv) in sys.distribution" :key="lv" :color="SENSITIVITY_COLORS[lv as SensitivityLevel]" size="small">
                  {{ lv }}×{{ cnt }}
                </a-tag>
              </a-space>
            </a-descriptions-item>
            <a-descriptions-item label="说明">{{ sys.description }}</a-descriptions-item>
          </a-descriptions>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import DmtPageHeader from '../../../components/common/DmtPageHeader.vue'
import { classifySystemsData, classifyStats } from '@shared/classify-modules'
import { SENSITIVITY_COLORS } from '@shared/classify-constants'
import type { SensitivityLevel } from '@shared/classify-types'
import {
  IconStorage, IconRobot, IconNotification, IconCustomerService, IconSafe
} from '@arco-design/web-vue/es/icon'

const router = useRouter()
const systems = classifySystemsData
const stats = classifyStats

const iconMap: Record<string, any> = {
  'icon-storage': IconStorage,
  'icon-robot': IconRobot,
  'icon-notification': IconNotification,
  'icon-service': IconCustomerService,
  'icon-safe': IconSafe
}
const getIcon = (name: string) => iconMap[name] || IconStorage

const goToTables = (sys: typeof systems[number]) => {
  router.push(`/metadata/classify/tables/${sys.id}`)
}
</script>

<style scoped>
.classify-sources-page { padding: 16px 24px 24px; }
.stats-row { margin-bottom: 24px; }
.section-title { margin: 8px 0 16px; display: flex; align-items: baseline; gap: 12px; }
.section-title h3 { margin: 0; font-size: 16px; font-weight: 600; }
.section-subtitle { color: #86909c; font-size: 13px; }
.system-card { cursor: pointer; transition: all 0.2s; }
.system-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); }
.card-title { font-size: 15px; font-weight: 600; }
</style>
