<template>
  <div class="tag-system-page">
    <a-page-header title="标签体系" sub-title="用户标签的统一管理、覆盖统计、规则配置">
      <template #extra>
        <a-button @click="goWorkbench">返回工作台</a-button>
        <a-button type="primary" style="margin-left: 8px">
          <template #icon><icon-plus /></template>
          新建标签
        </a-button>
      </template>
    </a-page-header>

    <a-row :gutter="16">
      <a-col :span="6">
        <a-card title="标签分类">
          <a-empty v-if="categories.length === 0" />
          <div v-else>
            <div
              v-for="c in categories" :key="c.code"
              class="category-item"
              :class="{ active: selectedCategory?.code === c.code }"
              @click="selectCategory(c)"
            >
              <strong>{{ c.name }}</strong>
              <a-tag size="small">{{ tagCount(c.code) }}</a-tag>
            </div>
          </div>
        </a-card>
      </a-col>

      <a-col :span="18">
        <a-card :title="selectedCategory ? `${selectedCategory.name} - 标签列表` : '标签列表'">
          <template v-if="selectedCategory">
            <a-table
              :columns="columns"
              :data="filteredTags"
              :pagination="{ pageSize: 10, showTotal: true }"
              row-key="code"
              size="medium"
            >
              <template #name="{ record }">
                <a-link @click="openTag(record)">{{ record.name }}</a-link>
              </template>
              <template #type="{ record }">
                <a-tag :color="typeColor(record.type)">{{ typeLabel(record.type) }}</a-tag>
              </template>
              <template #coverage="{ record }">
                <a-progress :percent="record.coverage / 100" :stroke-width="6" :color="coverageColor(record.coverage)" />
              </template>
              <template #updateFrequency="{ record }">
                <a-tag>{{ record.updateFrequency }}</a-tag>
              </template>
              <template #status="{ record }">
                <a-tag :color="record.status === 'active' ? 'green' : 'gray'">
                  {{ record.status === 'active' ? '启用' : '停用' }}
                </a-tag>
              </template>
            </a-table>
          </template>
          <a-empty v-else description="从左侧选择一个标签分类" />
        </a-card>
      </a-col>
    </a-row>

    <a-drawer
      v-model:visible="detailVisible"
      :title="`标签详情 · ${currentTag?.name || ''}`"
      :width="780"
      :footer="false"
    >
      <template v-if="currentTag">
        <a-descriptions :column="2" bordered size="medium">
          <a-descriptions-item label="标签编码">{{ currentTag.code }}</a-descriptions-item>
          <a-descriptions-item label="标签名">{{ currentTag.name }}</a-descriptions-item>
          <a-descriptions-item label="类型">
            <a-tag :color="typeColor(currentTag.type)">{{ typeLabel(currentTag.type) }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="状态">
            <a-tag :color="currentTag.status === 'active' ? 'green' : 'gray'">
              {{ currentTag.status === 'active' ? '启用' : '停用' }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="覆盖人数">{{ currentTag.coverage.toLocaleString() }}</a-descriptions-item>
          <a-descriptions-item label="覆盖率">{{ currentTag.coverage }}%</a-descriptions-item>
          <a-descriptions-item label="更新频率">{{ currentTag.updateFrequency }}</a-descriptions-item>
          <a-descriptions-item label="Owner">{{ currentTag.owner }}</a-descriptions-item>
          <a-descriptions-item label="计算口径" :span="2">
            <pre class="formula">{{ currentTag.rule }}</pre>
          </a-descriptions-item>
          <a-descriptions-item label="描述" :span="2">{{ currentTag.description }}</a-descriptions-item>
        </a-descriptions>

        <h3 style="margin-top: 24px">最近触发事件 ({{ currentTag.recentEvents?.length || 0 }})</h3>
        <a-list size="small">
          <a-list-item v-for="(e, idx) in currentTag.recentEvents || []" :key="idx">
            <a-list-item-meta>
              <template #title>{{ e.eventName }}</template>
              <template #description>{{ e.time }} · 触发 {{ e.count.toLocaleString() }} 次</template>
            </a-list-item-meta>
          </a-list-item>
        </a-list>
      </template>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const tags = ref<any[]>([])
const categories = ref<any[]>([])

const selectedCategory = ref<any>(null)
const detailVisible = ref(false)
const currentTag = ref<any>(null)

onMounted(() => {
  categories.value = [
    { code: 'user_attr', name: '用户属性' },
    { code: 'behavior', name: '行为特征' },
    { code: 'finance', name: '金融属性' },
    { code: 'risk', name: '风险标签' },
    { code: 'preference', name: '偏好标签' },
    { code: 'lifecycle', name: '生命周期' }
  ]

  tags.value = [
    // 用户属性
    { code: 'T001', name: 'VIP客户', type: 'rule', categoryCode: 'user_attr', coverage: 1.5, status: 'active', updateFrequency: '每日', owner: '王运营', description: '资产 ≥ 50 万的客户', rule: 'AUM >= 500000' },
    { code: 'T002', name: '高净值', type: 'rule', categoryCode: 'user_attr', coverage: 0.3, status: 'active', updateFrequency: '每日', owner: '王运营', description: 'AUM ≥ 500 万', rule: 'AUM >= 5000000' },
    { code: 'T003', name: '私行客户', type: 'rule', categoryCode: 'user_attr', coverage: 0.1, status: 'active', updateFrequency: '每日', owner: '王运营', description: '私行签约客户', rule: 'is_private_client = true' },

    // 行为特征
    { code: 'T010', name: '近30天活跃', type: 'derived', categoryCode: 'behavior', coverage: 72, status: 'active', updateFrequency: '每日', owner: '王运营', description: '近30天有任意活跃行为', rule: 'active_days_30d >= 1' },
    { code: 'T011', name: '高频用户', type: 'derived', categoryCode: 'behavior', coverage: 7.1, status: 'active', updateFrequency: '每日', owner: '王运营', description: '近30天登录 ≥ 50 次', rule: 'login_count_30d >= 50' },
    { code: 'T012', name: '沉睡用户', type: 'derived', categoryCode: 'behavior', coverage: 12.5, status: 'active', updateFrequency: '每日', owner: '王运营', description: '近90天无活跃', rule: 'active_days_90d = 0' },

    // 金融属性
    { code: 'T020', name: '理财偏好', type: 'rule', categoryCode: 'finance', coverage: 23.5, status: 'active', updateFrequency: '每日', owner: '陈营销', description: '近30天浏览/购买理财', rule: 'behavior WHERE product_category = "理财" >= 1' },
    { code: 'T021', name: '高信用分', type: 'derived', categoryCode: 'finance', coverage: 28.0, status: 'active', updateFrequency: '每日', owner: '张风控', description: 'credit_score ≥ 750', rule: 'credit_score >= 750' },

    // 风险标签
    { code: 'T030', name: '高风险用户', type: 'derived', categoryCode: 'risk', coverage: 9.6, status: 'active', updateFrequency: '每日', owner: '张风控', description: 'risk_level = high', rule: 'risk_level = "high"' },
    { code: 'T031', name: '逾期客户', type: 'event', categoryCode: 'risk', coverage: 1.2, status: 'active', updateFrequency: '实时', owner: '张风控', description: '有任意逾期记录', rule: 'overdue_count > 0' },

    // 偏好标签
    { code: 'T040', name: '内容偏好 - 财经', type: 'ml', categoryCode: 'preference', coverage: 35.2, status: 'active', updateFrequency: '每周', owner: '陈营销', description: '基于浏览/阅读内容聚类', rule: 'ML 模型输出 (kmeans, k=10)' },
    { code: 'T041', name: '购买力偏好 - 高', type: 'ml', categoryCode: 'preference', coverage: 18.0, status: 'active', updateFrequency: '每周', owner: '陈营销', description: '基于历史消费', rule: 'ML 模型输出' },

    // 生命周期
    { code: 'T050', name: '新客(<7天)', type: 'rule', categoryCode: 'lifecycle', coverage: 0.8, status: 'active', updateFrequency: '实时', owner: '王运营', description: '注册不超过7天', rule: 'days_since_register < 7' },
    { code: 'T051', name: '成长期', type: 'rule', categoryCode: 'lifecycle', coverage: 8.5, status: 'active', updateFrequency: '实时', owner: '王运营', description: '注册7-30天且有交易', rule: '7 <= days_since_register < 30 AND total_orders > 0' },
    { code: 'T052', name: '成熟期', type: 'rule', categoryCode: 'lifecycle', coverage: 78.0, status: 'active', updateFrequency: '实时', owner: '王运营', description: '注册 ≥ 30天且稳定活跃', rule: 'days_since_register >= 30 AND active_days_30d >= 5' }
  ]
})

const filteredTags = computed(() => {
  if (!selectedCategory.value) return []
  return tags.value.filter(t => t.categoryCode === selectedCategory.value.code)
})

function tagCount(categoryCode: string) {
  return tags.value.filter(t => t.categoryCode === categoryCode).length
}

const columns = [
  { title: '编码', dataIndex: 'code', width: 90 },
  { title: '标签名', dataIndex: 'name', slotName: 'name', width: 160 },
  { title: '类型', dataIndex: 'type', slotName: 'type', width: 90 },
  { title: '覆盖率', dataIndex: 'coverage', slotName: 'coverage', width: 140 },
  { title: '更新频率', dataIndex: 'updateFrequency', slotName: 'updateFrequency', width: 100 },
  { title: 'Owner', dataIndex: 'owner', width: 100 },
  { title: '状态', dataIndex: 'status', slotName: 'status', width: 80 }
]

function typeColor(t: string) {
  return { rule: 'arcoblue', derived: 'purple', event: 'orange', ml: 'cyan' }[t] || 'gray'
}
function typeLabel(t: string) {
  return { rule: '规则', derived: '派生', event: '事件', ml: '模型' }[t] || t
}
function coverageColor(c: number) {
  if (c >= 50) return '#f53f3f'
  if (c >= 10) return '#ff7d00'
  return '#00b42a'
}
function selectCategory(c: any) {
  selectedCategory.value = c
}
function openTag(t: any) {
  currentTag.value = {
    ...t,
    recentEvents: [
      { eventName: '用户进入「VIP 客户」标签', time: '今天 14:30', count: 12 },
      { eventName: '用户离开「VIP 客户」标签', time: '今天 11:20', count: 3 },
      { eventName: '用户进入「VIP 客户」标签', time: '昨天 18:15', count: 8 }
    ]
  }
  detailVisible.value = true
}
const goWorkbench = () => router.push('workbench')
</script>

<style lang="scss" scoped>
.tag-system-page {
  padding: 24px;
  max-width: 1600px;
  margin: 0 auto;

  .category-item {
    padding: 12px;
    border-radius: 4px;
    margin-bottom: 8px;
    cursor: pointer;
    background: #fafbfc;
    border-left: 3px solid transparent;
    display: flex;
    justify-content: space-between;
    align-items: center;
    &:hover { background: #f2f3f5; }
    &.active { background: #e8f3ff; border-left-color: #165dff; }
  }

  .formula {
    background: #f5f7fa;
    padding: 12px;
    border-radius: 4px;
    font-family: 'Menlo', monospace;
    font-size: 13px;
    color: #165dff;
    margin: 0;
  }
}
</style>