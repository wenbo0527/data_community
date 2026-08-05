<template>
  <div class="event-center-page">
    <a-page-header title="虚拟事件" sub-title="业务事件的虚拟化定义与触发追踪">
      <template #extra>
        <a-button @click="goWorkbench">返回工作台</a-button>
        <a-button type="primary" style="margin-left: 8px">
          <template #icon><icon-plus /></template>
          新建事件
        </a-button>
      </template>
    </a-page-header>

    <a-row :gutter="16" style="margin-bottom: 16px">
      <a-col :span="6"><a-statistic title="事件总数" :value="events.length" /></a-col>
      <a-col :span="6"><a-statistic title="今日触发" :value="totalToday" /></a-col>
      <a-col :span="6"><a-statistic title="活跃事件" :value="activeCount" /></a-col>
      <a-col :span="6"><a-statistic title="平均延迟" :value="avgLatency" suffix="ms" /></a-col>
    </a-row>

    <a-card>
      <a-table
        :columns="columns"
        :data="events"
        :pagination="{ pageSize: 10, showTotal: true }"
        row-key="code"
        stripe
        size="medium"
      >
        <template #name="{ record }">
          <a-link @click="openEvent(record)">{{ record.name }}</a-link>
        </template>
        <template #status="{ record }">
          <a-tag :color="record.status === 'active' ? 'green' : 'gray'">
            {{ record.status === 'active' ? '启用' : '停用' }}
          </a-tag>
        </template>
        <template #todayTriggers="{ record }">{{ record.todayTriggers.toLocaleString() }}</template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const events = ref<any[]>([])
const openEvent = (e: any) => {}

onMounted(() => {
  events.value = [
    { code: 'E001', name: '登录成功', status: 'active', type: '用户行为', todayTriggers: 1250830, source: 'fact_user_login', owner: '王运营' },
    { code: 'E002', name: '注册成功', status: 'active', type: '用户行为', todayTriggers: 3280, source: 'fact_user_register', owner: '王运营' },
    { code: 'E003', name: '首单完成', status: 'active', type: '交易', todayTriggers: 1820, source: 'fact_order_pay', owner: '李产品' },
    { code: 'E004', name: '贷款申请提交', status: 'active', type: '风控', todayTriggers: 580, source: 'fact_loan_apply', owner: '张风控' },
    { code: 'E005', name: '理财购买', status: 'active', type: '交易', todayTriggers: 950, source: 'fact_invest', owner: '陈营销' },
    { code: 'E006', name: '页面浏览', status: 'active', type: '用户行为', todayTriggers: 3820500, source: 'fact_page_view', owner: '王运营' },
    { code: 'E007', name: '优惠券核销', status: 'active', type: '营销', todayTriggers: 1280, source: 'fact_coupon_use', owner: '陈营销' },
    { code: 'E008', name: '逾期发生', status: 'active', type: '风控', todayTriggers: 35, source: 'fact_overdue', owner: '张风控' },
    { code: 'E009', name: 'KYC 完成', status: 'inactive', type: '合规', todayTriggers: 0, source: 'fact_kyc', owner: '合规团队' },
    { code: 'E010', name: 'VIP 升级', status: 'active', type: '用户行为', todayTriggers: 12, source: 'fact_vip_upgrade', owner: '王运营' }
  ]
})

const totalToday = computed(() => events.value.reduce((s, e) => s + e.todayTriggers, 0))
const activeCount = computed(() => events.value.filter(e => e.status === 'active').length)
const avgLatency = computed(() => 85)

const columns = [
  { title: '编码', dataIndex: 'code', width: 90 },
  { title: '事件名', dataIndex: 'name', slotName: 'name', width: 180 },
  { title: '类型', dataIndex: 'type', width: 100 },
  { title: '状态', dataIndex: 'status', slotName: 'status', width: 90 },
  { title: '今日触发', dataIndex: 'todayTriggers', slotName: 'todayTriggers', width: 130 },
  { title: '来源表', dataIndex: 'source', width: 200 },
  { title: 'Owner', dataIndex: 'owner', width: 100 }
]

const goWorkbench = () => router.push('workbench')
</script>

<style lang="scss" scoped>
.event-center-page {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}
</style>