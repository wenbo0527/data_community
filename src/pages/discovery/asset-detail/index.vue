<template>
  <div class="asset-detail-page">
    <!-- 面包屑 + 标题 + 操作 -->
    <a-page-header :title="asset.name" class="asset-header">
      <template #breadcrumb>
        <a-breadcrumb>
          <a-breadcrumb-item>资产目录</a-breadcrumb-item>
          <a-breadcrumb-item>{{ asset.domain || '未分类' }}</a-breadcrumb-item>
          <a-breadcrumb-item>{{ asset.name }}</a-breadcrumb-item>
        </a-breadcrumb>
      </template>
      <template #subtitle>
        <a-space>
          <a-tag :color="getSensitivityColor(asset.sensitivity)" size="medium">
            {{ asset.sensitivity }}
          </a-tag>
          <span class="owner-info">
            <a-avatar :size="20" style="margin-right: 4px">
              {{ (asset.owner || 'S').slice(0, 1) }}
            </a-avatar>
            {{ asset.owner }}
          </span>
          <a-tag v-if="asset.status === 'online'" color="green">已上架</a-tag>
          <a-tag v-else-if="asset.status === 'offline'" color="gray">已下架</a-tag>
          <a-tag v-else color="orange">{{ asset.status }}</a-tag>
        </a-space>
      </template>
      <template #extra>
        <a-space>
          <a-button @click="toggleFavorite">
            <template #icon>
              <IconHeart :style="{ color: isFavorited ? '#f53f3f' : '' }" />
            </template>
            {{ isFavorited ? '已关注' : '关注' }}
          </a-button>
          <a-button type="primary" @click="applyPermission">
            <template #icon><IconSafe /></template>
            申请权限
          </a-button>
          <a-dropdown>
            <a-button>
              <template #icon><IconMore /></template>
              更多
            </a-button>
            <template #content>
              <a-doption @click="goLineage">
                <template #icon><IconLink /></template>
                查看血缘
              </a-doption>
              <a-doption @click="goImpactAnalysis">
                <template #icon><IconExclamationCircle /></template>
                下架前影响分析
              </a-doption>
              <a-doption @click="exportTable">
                <template #icon><IconDownload /></template>
                导出 Schema
              </a-doption>
            </template>
          </a-dropdown>
        </a-space>
      </template>
    </a-page-header>

    <!-- 描述 -->
    <a-card class="description-card" :bordered="false">
      <p class="asset-description">{{ asset.description }}</p>
    </a-card>

    <!-- 5 Tab 主体(文档 §12) -->
    <a-tabs default-active-key="schema" class="detail-tabs">
      <!-- Tab 1: Schema -->
      <a-tab-pane key="schema" title="Schema">
        <a-card :bordered="false">
          <template #extra>
            <a-space>
              <a-input-search
                v-model="schemaSearch"
                placeholder="搜索字段名"
                style="width: 240px"
                allow-clear
              />
              <a-button @click="batchApplyField">
                <template #icon><IconPlus /></template>
                批量申请字段权限
              </a-button>
            </a-space>
          </template>

          <a-table
            :data="filteredFields"
            :pagination="false"
            :bordered="false"
            row-key="name"
          >
            <template #columns>
              <a-table-column title="字段名" data-index="name" :width="180">
                <template #cell="{ record }">
                  <code>{{ record.name }}</code>
                </template>
              </a-table-column>
              <a-table-column title="类型" data-index="type" :width="120">
                <template #cell="{ record }">
                  <a-tag size="small">{{ record.type }}</a-tag>
                </template>
              </a-table-column>
              <a-table-column title="敏感级别" data-index="sensitivity" :width="100">
                <template #cell="{ record }">
                  <a-tag :color="getSensitivityColor(record.sensitivity)" size="small">
                    {{ record.sensitivity }}
                  </a-tag>
                </template>
              </a-table-column>
              <a-table-column title="业务分类" data-index="category" :width="120">
                <template #cell="{ record }">
                  <a-tag v-if="record.category" size="small">{{ record.category }}</a-tag>
                </template>
              </a-table-column>
              <a-table-column title="Owner" data-index="fieldOwner" :width="100">
                <template #cell="{ record }">
                  <span v-if="record.fieldOwner">{{ record.fieldOwner }}</span>
                  <span v-else class="muted">继承表 Owner</span>
                </template>
              </a-table-column>
              <a-table-column title="描述" data-index="description" :ellipsis="true" />
              <a-table-column title="操作" :width="100">
                <template #cell="{ record }">
                  <a-button type="text" size="mini" @click="applyFieldPermission(record)">
                    <template #icon><IconSafe /></template>
                    申请
                  </a-button>
                </template>
              </a-table-column>
            </template>
          </a-table>
        </a-card>
      </a-tab-pane>

      <!-- Tab 2: 血缘(复用 LineageGraph) -->
      <a-tab-pane key="lineage" title="血缘">
        <a-card :bordered="false">
          <template #extra>
            <a-button @click="goLineage">
              <template #icon><IconFullscreen /></template>
              全屏查看
            </a-button>
          </template>
          <LineageGraph
            :table-name="asset.name"
            :layers="2"
            :data-types="['Table', 'Metric', 'Variable', 'API']"
          />
        </a-card>
      </a-tab-pane>

      <!-- Tab 3: 质量 -->
      <a-tab-pane key="quality" title="质量">
        <a-row :gutter="16">
          <a-col :span="6">
            <a-card :bordered="false">
              <a-statistic
                title="综合健康分"
                :value="asset.healthScore"
                :precision="0"
                suffix="/100"
                :value-style="{ color: getScoreColor(asset.healthScore) }"
              />
              <a-progress :percent="asset.healthScore" :show-text="false" />
            </a-card>
          </a-col>
          <a-col :span="6">
            <a-card :bordered="false">
              <a-statistic title="数据完整率" :value="99.5" :precision="1" suffix="%" />
            </a-card>
          </a-col>
          <a-col :span="6">
            <a-card :bordered="false">
              <a-statistic title="及时率" :value="98.2" :precision="1" suffix="%" />
            </a-card>
          </a-col>
          <a-col :span="6">
            <a-card :bordered="false">
              <a-statistic title="规则通过率" :value="95.7" :precision="1" suffix="%" />
            </a-card>
          </a-col>
        </a-row>

        <a-card title="质量规则" :bordered="false" style="margin-top: 16px">
          <a-table :data="qualityRules" :pagination="false" :bordered="false">
            <template #columns>
              <a-table-column title="规则名" data-index="name" />
              <a-table-column title="类型" data-index="type" :width="120">
                <template #cell="{ record }">
                  <a-tag>{{ record.type }}</a-tag>
                </template>
              </a-table-column>
              <a-table-column title="最近一次结果" data-index="lastResult" :width="120">
                <template #cell="{ record }">
                  <a-tag :color="record.lastResult === '通过' ? 'green' : 'red'">
                    {{ record.lastResult }}
                  </a-tag>
                </template>
              </a-table-column>
              <a-table-column title="运行时间" data-index="lastRunTime" :width="180" />
              <a-table-column title="状态" data-index="enabled" :width="80">
                <template #cell="{ record }">
                  <a-tag v-if="record.enabled" color="green" size="small">启用</a-tag>
                  <a-tag v-else color="gray" size="small">停用</a-tag>
                </template>
              </a-table-column>
            </template>
          </a-table>
        </a-card>

        <a-card title="异常记录" :bordered="false" style="margin-top: 16px">
          <a-table :data="qualityIssues" :pagination="{ pageSize: 5 }" :bordered="false">
            <template #columns>
              <a-table-column title="时间" data-index="time" :width="180" />
              <a-table-column title="规则" data-index="rule" />
              <a-table-column title="级别" data-index="severity" :width="100">
                <template #cell="{ record }">
                  <a-tag :color="record.severity === '高' ? 'red' : 'orange'">
                    {{ record.severity }}
                  </a-tag>
                </template>
              </a-table-column>
              <a-table-column title="说明" data-index="description" />
            </template>
          </a-table>
        </a-card>
      </a-tab-pane>

      <!-- Tab 4: 使用统计 -->
      <a-tab-pane key="usage" title="使用统计">
        <a-row :gutter="16">
          <a-col :span="6">
            <a-card :bordered="false">
              <a-statistic title="30天 PV" :value="2847" />
            </a-card>
          </a-col>
          <a-col :span="6">
            <a-card :bordered="false">
              <a-statistic title="30天 UV" :value="186" />
            </a-card>
          </a-col>
          <a-col :span="6">
            <a-card :bordered="false">
              <a-statistic title="关注数" :value="42" />
            </a-card>
          </a-col>
          <a-col :span="6">
            <a-card :bordered="false">
              <a-statistic title="权限申请数" :value="23" />
            </a-card>
          </a-col>
        </a-row>

        <a-card title="使用趋势(最近 30 天)" :bordered="false" style="margin-top: 16px">
          <div class="trend-chart-placeholder">
            <a-empty description="图表占位:实际接入 ECharts 渲染访问趋势" />
          </div>
        </a-card>

        <a-card title="高频使用人 Top10" :bordered="false" style="margin-top: 16px">
          <a-table :data="topUsers" :pagination="false" :bordered="false">
            <template #columns>
              <a-table-column title="排名" data-index="rank" :width="60" />
              <a-table-column title="用户" data-index="name" />
              <a-table-column title="部门" data-index="dept" />
              <a-table-column title="访问次数" data-index="visitCount" :width="120">
                <template #cell="{ record }">
                  <a-statistic :value="record.visitCount" :value-style="{ fontSize: '14px' }" />
                </template>
              </a-table-column>
              <a-table-column title="最后访问" data-index="lastVisit" :width="180" />
            </template>
          </a-table>
        </a-card>
      </a-tab-pane>

      <!-- Tab 5: 协作讨论 -->
      <a-tab-pane key="discussion" title="协作讨论">
        <a-row :gutter="16">
          <a-col :span="16">
            <a-card title="讨论区" :bordered="false">
              <div class="comment-input">
                <a-textarea
                  v-model="newComment"
                  placeholder="发起讨论或问询...支持 @同事"
                  :rows="3"
                />
                <a-space style="margin-top: 8px">
                  <a-button type="primary" @click="postComment" :disabled="!newComment.trim()">
                    <template #icon><IconSend /></template>
                    发送
                  </a-button>
                  <a-button>添加附件</a-button>
                </a-space>
              </div>

              <a-divider />

              <div v-for="comment in comments" :key="comment.id" class="comment-item">
                <a-avatar :size="36" style="margin-right: 8px">
                  {{ comment.user.slice(0, 1) }}
                </a-avatar>
                <div class="comment-content">
                  <div class="comment-header">
                    <span class="comment-user">{{ comment.user }}</span>
                    <span class="comment-time">{{ comment.time }}</span>
                  </div>
                  <p class="comment-text">{{ comment.text }}</p>
                  <div class="comment-actions">
                    <a-button type="text" size="mini">回复</a-button>
                    <a-button type="text" size="mini">点赞 ({{ comment.likes }})</a-button>
                  </div>
                </div>
              </div>
            </a-card>
          </a-col>

          <a-col :span="8">
            <a-card title="公告" :bordered="false">
              <a-alert
                v-for="(notice, idx) in notices"
                :key="idx"
                :type="notice.type"
                :show-icon="true"
                style="margin-bottom: 8px"
              >
                <div class="notice-title">{{ notice.title }}</div>
                <div class="notice-time">{{ notice.time }}</div>
              </a-alert>
            </a-card>

            <a-card title="变更通知" :bordered="false" style="margin-top: 16px">
              <a-timeline>
                <a-timeline-item v-for="change in changes" :key="change.time">
                  <div class="change-title">{{ change.title }}</div>
                  <div class="change-meta">{{ change.user }} · {{ change.time }}</div>
                </a-timeline-item>
              </a-timeline>
            </a-card>
          </a-col>
        </a-row>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup lang="ts">
/**
 * 资产详情页 5 Tab 结构(P1-C)
 *
 * 文档依据:
 *   §12 资产详情页页面结构建议:Schema / 血缘 / 质量 / 使用统计 / 协作讨论
 *
 * @see 文档 §12 Tab 设计
 */
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import LineageGraph from '@/pages/discovery/lineage/components/LineageGraph.vue'
import { FavoriteStore } from '@/mock/shared/favorite-directory'
import {
  IconHeart,
  IconSafe,
  IconMore,
  IconLink,
  IconExclamationCircle,
  IconDownload,
  IconPlus,
  IconFullscreen,
  IconSend
} from '@arco-design/web-vue/es/icon'

const route = useRoute()
const router = useRouter()

// === 路由参数 ===
const tableName = computed(() => typeof route.params.tableName === 'string' ? route.params.tableName : 'dim_user')

// === 资产信息(实际从 store 拉)===
const asset = ref({
  name: tableName.value,
  description: '客户主表,包含客户基本信息、联系方式、标签数据。是客户域的核心实体表。',
  sensitivity: 'L2',
  owner: '张三',
  domain: '客户域',
  status: 'online',
  healthScore: 92
})

// === Schema 字段 ===
const schemaSearch = ref('')
const fields = ref([
  { name: 'user_id', type: 'BIGINT', sensitivity: 'L1', category: '标识', fieldOwner: '', description: '客户唯一标识' },
  { name: 'id_card_no', type: 'VARCHAR(20)', sensitivity: 'L3', category: '个人信息', fieldOwner: '张三', description: '身份证号' },
  { name: 'user_name', type: 'VARCHAR(50)', sensitivity: 'L2', category: '个人信息', fieldOwner: '', description: '客户姓名' },
  { name: 'mobile', type: 'VARCHAR(15)', sensitivity: 'L3', category: '个人信息', fieldOwner: '', description: '手机号' },
  { name: 'address', type: 'VARCHAR(200)', sensitivity: 'L2', category: '个人信息', fieldOwner: '', description: '居住地址' },
  { name: 'birth_date', type: 'DATE', sensitivity: 'L2', category: '个人信息', fieldOwner: '', description: '出生日期' },
  { name: 'gender', type: 'TINYINT', sensitivity: 'L1', category: '个人信息', fieldOwner: '', description: '性别(0未知/1男/2女)' },
  { name: 'balance', type: 'DECIMAL(18,2)', sensitivity: 'L2', category: '商业信息', fieldOwner: '', description: '账户余额' },
  { name: 'credit_score', type: 'INT', sensitivity: 'L2', category: '商业信息', fieldOwner: '张三', description: '信用评分' },
  { name: 'status', type: 'TINYINT', sensitivity: 'L1', category: '一般信息', fieldOwner: '', description: '客户状态' },
  { name: 'create_time', type: 'DATETIME', sensitivity: 'L1', category: '一般信息', fieldOwner: '', description: '创建时间' },
  { name: 'update_time', type: 'DATETIME', sensitivity: 'L1', category: '一般信息', fieldOwner: '', description: '更新时间' }
])

const filteredFields = computed(() => {
  const kw = schemaSearch.value.trim().toLowerCase()
  if (!kw) return fields.value
  return fields.value.filter(f =>
    f.name.toLowerCase().includes(kw) ||
    f.description.toLowerCase().includes(kw)
  )
})

// === 质量 ===
const qualityRules = ref([
  { name: '主键唯一性校验', type: '完整性', lastResult: '通过', lastRunTime: '2025-08-08 10:00', enabled: true },
  { name: '身份证号格式校验', type: '有效性', lastResult: '通过', lastRunTime: '2025-08-08 10:00', enabled: true },
  { name: '手机号非空校验', type: '完整性', lastResult: '失败', lastRunTime: '2025-08-08 10:00', enabled: true },
  { name: '余额 ≥ 0 校验', type: '有效性', lastResult: '通过', lastRunTime: '2025-08-08 10:00', enabled: true },
  { name: '每日更新及时性', type: '及时性', lastResult: '通过', lastRunTime: '2025-08-08 10:00', enabled: true }
])

const qualityIssues = ref([
  { time: '2025-08-08 09:00', rule: '手机号非空校验', severity: '高', description: '发现 23 条记录手机号为空' },
  { time: '2025-08-07 14:00', rule: '身份证号格式校验', severity: '中', description: '发现 2 条记录身份证号格式异常' },
  { time: '2025-08-06 22:00', rule: '余额 ≥ 0 校验', severity: '高', description: '发现 1 条记录余额为负' }
])

// === 使用统计 ===
const topUsers = ref([
  { rank: 1, name: '王运营', dept: '运营部', visitCount: 145, lastVisit: '今天 14:20' },
  { rank: 2, name: '张三', dept: '数据团队', visitCount: 98, lastVisit: '今天 11:30' },
  { rank: 3, name: '李四', dept: '风控中心', visitCount: 87, lastVisit: '昨天 16:00' },
  { rank: 4, name: '赵六', dept: '行为平台', visitCount: 76, lastVisit: '今天 09:15' },
  { rank: 5, name: '王五', dept: '用户价值组', visitCount: 65, lastVisit: '昨天 17:30' }
])

// === 协作讨论 ===
const newComment = ref('')
const comments = ref([
  { id: 'c1', user: '李四', time: '2 小时前', text: '请问这个表的 update_time 字段是入库时间还是业务时间?数据加工时需要明确。', likes: 3 },
  { id: 'c2', user: '张三', time: '1 小时前', text: '@李四 是业务时间,由业务系统在数据变更时更新。文档已补充说明。', likes: 1 },
  { id: 'c3', user: '王五', time: '昨天', text: '建议给 id_card_no 字段加脱敏规则,目前在测试环境看到的是明文。', likes: 5 }
])

const notices = ref([
  { type: 'warning', title: '字段 id_card_no 已升级为 L3,已有权限申请自动重审', time: '2025-08-05' },
  { type: 'info', title: '本表新增字段 create_by / update_by', time: '2025-07-20' }
])

const changes = ref([
  { title: '敏感级别调整:L2 → L3', user: '张三', time: '2025-08-05' },
  { title: '新增字段 birth_date', user: '王五', time: '2025-07-20' },
  { title: 'Owner 变更:李四 → 张三', user: '系统', time: '2025-06-15' }
])

// === 收藏 ===
const isFavorited = computed(() => {
  return FavoriteStore.isFavorited(
    'user-yunying',
    'table',
    tableName.value
  )
})

// === 方法 ===
const toggleFavorite = () => {
  const result = FavoriteStore.toggle({
    userId: 'user-yunying',
    userName: '王运营',
    resourceType: 'table',
    resourceId: tableName.value,
    resourceName: asset.value.name,
    resourcePath: `/discovery/asset-detail/${tableName.value}`,
    description: asset.value.description,
    owner: asset.value.owner,
    domain: asset.value.domain,
    group: 'team',
    tags: ['详情页关注'],
    notification: 'on_change'
  })
  Message.success(result?.added ? '已关注' : '已取消关注')
}

const applyPermission = () => {
  Message.info(`跳转申请 ${asset.value.name} 的权限`)
  router.push('/home/management/permission')
}

const applyFieldPermission = (field: any) => {
  Message.info(`申请字段 ${field.name} 的权限`)
  router.push('/home/management/permission')
}

const batchApplyField = () => {
  Message.info('跳转批量申请字段权限')
  router.push('/home/management/permission')
}

const goLineage = () => {
  router.push({ path: '/home/discovery/lineage', query: { table: tableName.value } })
}

const goImpactAnalysis = () => {
  router.push({ path: '/home/discovery/impact-analysis', query: { table: tableName.value } })
}

const exportTable = () => {
  Message.success('Schema 已导出')
}

const postComment = () => {
  if (!newComment.value.trim()) return
  comments.value.unshift({
    id: 'c' + Date.now(),
    user: '王运营',
    time: '刚刚',
    text: newComment.value,
    likes: 0
  })
  newComment.value = ''
  Message.success('已发送')
}

// === 工具 ===
function getSensitivityColor(level: string): string {
  switch (level) {
    case 'L1': return 'green'
    case 'L2': return 'orange'
    case 'L3': return 'red'
    default: return 'gray'
  }
}

function getScoreColor(score: number): string {
  if (score >= 90) return '#00B42A'
  if (score >= 75) return '#FF7D00'
  return '#F53F3F'
}

onMounted(() => {
  // 实际从 MetadataStore 拉取
  asset.value.name = tableName.value
})
</script>

<style scoped>
.asset-detail-page {
  padding: 16px;
  background: var(--color-fill-1);
  min-height: 100%;
}
.asset-header {
  background: #fff;
  margin-bottom: 12px;
}
.description-card {
  margin-bottom: 16px;
}
.asset-description {
  margin: 0;
  color: var(--color-text-2);
  line-height: 1.6;
}
.detail-tabs {
  background: #fff;
  padding: 0 12px;
  border-radius: 4px;
}
.owner-info {
  display: inline-flex;
  align-items: center;
  color: var(--color-text-2);
  font-size: 13px;
}
.muted {
  color: var(--color-text-4);
  font-size: 12px;
}
.trend-chart-placeholder {
  height: 240px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.comment-input {
  background: var(--color-fill-1);
  padding: 12px;
  border-radius: 4px;
}
.comment-item {
  display: flex;
  padding: 12px 0;
  border-bottom: 1px solid var(--color-border-2);
}
.comment-content {
  flex: 1;
}
.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}
.comment-user {
  font-weight: 500;
  color: var(--color-text-1);
}
.comment-time {
  color: var(--color-text-4);
  font-size: 12px;
}
.comment-text {
  margin: 0 0 4px;
  color: var(--color-text-2);
  line-height: 1.6;
}
.comment-actions {
  margin-top: 4px;
}
.notice-title {
  font-weight: 500;
}
.notice-time {
  font-size: 12px;
  color: var(--color-text-4);
  margin-top: 4px;
}
.change-title {
  font-weight: 500;
  color: var(--color-text-1);
}
.change-meta {
  font-size: 12px;
  color: var(--color-text-4);
  margin-top: 2px;
}
code {
  background: var(--color-fill-2);
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 12px;
  color: #165dff;
}
</style>