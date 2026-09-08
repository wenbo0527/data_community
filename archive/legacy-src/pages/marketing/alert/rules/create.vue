<template>
  <div class="rule-create-page marketing-page">
    <div class="page-header">
      <a-breadcrumb>
        <a-breadcrumb-item to="/marketing/alert/management">预警管理</a-breadcrumb-item>
        <a-breadcrumb-item>{{ pageTitle }}</a-breadcrumb-item>
      </a-breadcrumb>
      <h1 class="page-title">{{ pageTitle }}</h1>
    </div>

    <div class="page-content">
      <a-card :bordered="false" class="panel-card">
        <a-row :gutter="16">
          <a-col :span="24">
            <a-form-item label="规则名称" required>
              <a-input v-model="form.name" :disabled="!isEditingSingleRule" placeholder="规则名称自动生成" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-card>
      <a-collapse :default-active-key="['rule-config','notify-config']" :bordered="false">
        <a-collapse-item key="rule-config" header="规则配置">
          <RuleForm
            v-model="form"
            :inventory-list="inventoryList"
            :package-list="packageList"
            :loading-inventory="loadingInventory"
            :loading-packages="loadingPackages"
            :on-load-inventories="loadCouponInventories"
            :on-load-packages="loadCouponPackages"
            :hide-description="true"
            :show-basic-monitor="true"
            :hide-basic="true"
            :type-in-config="true"
            :show-notify-content="false"
            ref="formRef"
          />
        </a-collapse-item>

        <a-collapse-item key="notify-config" header="通知与文案">
          <a-row :gutter="16">
            <a-col :span="12">
              <a-card title="通知文案预览" :bordered="false" class="panel-card">
                <div class="preview-block">
                  <h4>预览示例</h4>
                  <pre class="preview-content">{{ renderedUnifiedPreview }}</pre>
                </div>
                <a-divider />
              </a-card>
            </a-col>
            <a-col :span="12">
              <RuleForm
                v-model="form"
                :inventory-list="inventoryList"
                :package-list="packageList"
                :loading-inventory="loadingInventory"
                :loading-packages="loadingPackages"
                :on-load-inventories="loadCouponInventories"
                :on-load-packages="loadCouponPackages"
                :show-basic-monitor="false"
                :show-notify-content="true"
              />
            </a-col>
          </a-row>
        </a-collapse-item>

      </a-collapse>
    </div>

    <div class="actions-bar">
      <div class="actions-inner">
        <a-button @click="handleCancel">返回</a-button>
        <a-button type="outline" @click="handleTest">发送测试</a-button>
        <a-button type="primary" :disabled="!allDone" @click="handleSubmit">{{ pageTitle === '编辑预警规则' ? '更新规则' : '创建规则' }}</a-button>
      </div>
    </div>
  </div>

  <a-modal v-model:visible="testVisible" title="发送测试" :width="600" @ok="confirmTest" @cancel="closeTest">
    <div>
      <a-descriptions :column="1" bordered>
        <a-descriptions-item label="渠道">
          <a-space>
            <a-tag v-for="ch in selectedChannels" :key="ch">{{ channelText(ch) }}</a-tag>
          </a-space>
        </a-descriptions-item>
        <a-descriptions-item label="接收人">
          <a-space wrap>
            <a-tag v-for="r in form.recipientsUnified" :key="r">{{ r }}</a-tag>
          </a-space>
        </a-descriptions-item>
        <a-descriptions-item label="预览内容">
          <pre class="preview-content">{{ renderedUnifiedPreview }}</pre>
        </a-descriptions-item>
      </a-descriptions>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import { useRouter, useRoute } from 'vue-router'
import RuleForm from '@/components/marketing/alert/RuleForm.vue'
import { renderAlertPreview } from '@/utils/notificationRenderer'
import { addAlertRule, updateAlertRule, getRuleById } from '@/api/alertRules'
import { createAlertRule } from '@/api/alertRulesService'

const router = useRouter()
const route = useRoute()
const editingId = computed(() => route.query.id || '')
const pageTitle = computed(() => editingId.value ? '编辑预警规则' : '新建预警规则')
const isEditingSingleRule = computed(() => !!editingId.value)

import { reactive } from 'vue'

const form = reactive({
  name: '',
  type: '',
  description: '',
  conditions: {
    granularity: '',
    metricConfigs: [],
    scope: [],
    selectedInventories: [],
    selectedPackages: [],
    instanceConfig: 'general'
  },
  notificationConfigs: [{ channel: 'wechat' }],
  content: { wechat: '', sms: '' },
  contentUnified: '',
  recipients: { wechatUsers: [], smsContacts: [] },
  recipientsUnified: [],
  needProcessing: false
})

const formRef = ref(null)

// mock 数据加载（复用管理页方法签名）
const inventoryList = ref([])
const packageList = ref([])
const loadingInventory = ref(false)
const loadingPackages = ref(false)
const loadCouponInventories = async () => { /* 可接入真实API */ }
const loadCouponPackages = async () => { /* 可接入真实API */ }

const operatorText = (op) => ({
  greater_than: '大于',
  less_than: '小于',
  equal: '等于',
  greater_equal: '大于等于',
  less_equal: '小于等于'
})[op] || ''

const metricUnitType = (metric) => {
  // 简化：与 RuleForm 保持一致，通过内部映射判断单位
  const u = {
    remaining_stock_ratio: 'percentage',
    daily_distribution_success_rate: 'percentage',
    redemption_failure_ratio: 'percentage',
    conversion_funnel_rate: 'percentage',
    lifecycle_stock_trend: 'percentage'
  }
  return u[metric] === 'percentage' ? '%' : ''
}

const formatMetricExpression = (cfg) => {
  if (!cfg || !cfg.metric || (cfg.threshold === null || cfg.threshold === undefined) || !cfg.operator) return ''
  const unit = metricUnitType(cfg.metric)
  return `${cfg.metric} ${operatorText(cfg.operator)} ${cfg.threshold}${unit}`
}

const renderedPreview = computed(() => {
  const lines = []
  lines.push(`【预警通知】规则：${form.name || '未命名规则'}`)
  for (const cfg of form.conditions.metricConfigs || []) {
    const exp = formatMetricExpression(cfg)
    if (exp) lines.push(`命中指标：${exp}`)
  }
  if (form.content.wechat && (form.notificationConfigs || []).some(n => n.channel === 'wechat')) {
    lines.push('— 企业微信文案 —')
    lines.push(form.content.wechat)
  }
  if (form.content.sms && (form.notificationConfigs || []).some(n => n.channel === 'sms')) {
    lines.push('— 短信文案 —')
    lines.push(form.content.sms)
  }
  return lines.join('\n')
})

const selectedChannels = computed(() => Array.from(new Set((form.notificationConfigs || []).map(nc => nc.channel).filter(Boolean))))
const channelText = (channel) => ({ wechat: '企业微信', sms: '短信' }[channel] || channel)
const renderedUnifiedPreview = computed(() => {
  return renderAlertPreview({
    name: form.name,
    metricConfigs: form.conditions.metricConfigs || [],
    granularity: form.conditions.granularity || 'coupon_stock',
    contentUnified: form.contentUnified,
    scope: form.conditions.scope || [],
    type: form.type || '',
    selectedInventories: form.conditions.selectedInventories || [],
    selectedPackages: form.conditions.selectedPackages || []
  })
})

const typeText = (t) => ({ inventory: '库存监控', expiry: '过期监控', failure: '失败监控' })[t] || ''
const granularityText = (g) => ({ coupon_stock: '券库存粒度', coupon_package: '券包粒度', coupon_instance_lifecycle: '券实例生命周期粒度' })[g] || ''
const scopeText = computed(() => {
  const t = form.type
  const g = form.conditions.granularity
  const s = form.conditions.scope || []
  if (t === 'inventory') {
    if (g === 'coupon_stock') return s.includes('custom_stock') ? '指定券库存' : '全部券库存'
    if (g === 'coupon_package') return s.includes('custom_packages') ? '指定券包' : '全部券包'
    if (g === 'coupon_instance_lifecycle') return '全部生命周期'
  }
  if (t === 'expiry') {
    if (g === 'coupon_stock') return '全部券库存'
    if (g === 'coupon_package') return '全部券包'
  }
  if (t === 'failure') return '全部生命周期'
  return ''
})
const autoRuleName = computed(() => {
  const a = scopeText.value
  const b = granularityText(form.conditions.granularity)
  const c = typeText(form.type)
  if (!a || !b || !c) return ''
  return `${a}的${b}${c}`
})
watch([() => form.type, () => form.conditions.granularity, () => form.conditions.scope], () => { form.name = autoRuleName.value }, { deep: true })

const basicDone = computed(() => !!form.name && !!form.type)
const monitorDone = computed(() => {
  const cond = form.conditions || {}
  const list = cond.metricConfigs || []
  if (!cond.granularity || list.length === 0) return false
  return list.every(cfg => cfg && cfg.metric && cfg.operator && (cfg.threshold !== null && cfg.threshold !== undefined))
})
const notifyDone = computed(() => {
  const channels = selectedChannels.value
  if (channels.length === 0) return false
  const metrics = form.conditions.metricConfigs || []
  if (metrics.length === 0) return false
  if (!metrics.every(cfg => cfg && cfg.content && cfg.content.trim())) return false
  if (!Array.isArray(form.recipientsUnified) || form.recipientsUnified.length === 0) return false
  return true
})
const allDone = computed(() => basicDone.value && monitorDone.value && notifyDone.value)

// 加载已有规则（编辑模式）
const loadExistingRule = () => {
  const id = editingId.value
  if (!id) return
  const rule = getRuleById(id)
  if (!rule) return
  Object.assign(form, {
    name: rule.name || '',
    type: rule.type || '',
    description: rule.description || '',
    conditions: {
      granularity: rule.conditions?.granularity || '',
      metricConfigs: rule.conditions?.metricConfigs && rule.conditions.metricConfigs.length > 0
        ? [JSON.parse(JSON.stringify(rule.conditions.metricConfigs[0]))]
        : [],
      scope: rule.conditions?.scope || [],
      selectedInventories: rule.conditions?.selectedInventories || [],
      selectedPackages: rule.conditions?.selectedPackages || [],
      instanceConfig: rule.conditions?.instanceConfig || 'general'
    },
    notificationConfigs: (rule.channels || []).map(ch => ({ channel: ch })),
    contentUnified: rule.contentUnified || '',
    recipientsUnified: rule.recipientsUnified || [],
    needProcessing: !!rule.needProcessing
  })
}
// 初次加载与路由变化时加载
loadExistingRule()
watch(editingId, () => loadExistingRule())

const handleCancel = () => {
  router.push('/marketing/alert/management')
}

const handleSubmit = async () => {
  if (!allDone.value) {
    Message.warning('请先完成所有必填配置')
    return
  }
  const validated = await formRef.value?.validate()
  if (!validated) return
  try {
    const channels = Array.from(new Set((validated.notificationConfigs || []).map(nc => nc.channel).filter(Boolean)))
    const groupId = `group_${Date.now()}`
    const metricList = Array.isArray(validated.conditions?.metricConfigs) ? validated.conditions.metricConfigs : []
    if (editingId.value) {
      const singleCfg = metricList[0] || null
      const singlePayload = {
        name: validated.name,
        type: validated.type,
        description: validated.description,
        conditions: { ...validated.conditions, metricConfigs: singleCfg ? [singleCfg] : [] },
        channels,
        contentUnified: validated.contentUnified,
        recipientsUnified: validated.recipientsUnified,
        needProcessing: validated.needProcessing,
        enabled: true
      }
      updateAlertRule(editingId.value, singlePayload)
      Message.success('规则更新成功')
      router.push('/marketing/alert/management')
    } else {
      if (metricList.length === 0) {
        Message.error('请至少添加一个指标')
        return
      }
      const cfg = metricList[0]
      const singleRule = {
        name: validated.name,
        type: validated.type,
        description: validated.description,
        conditions: { ...validated.conditions, metricConfigs: [cfg] },
        channels,
        contentUnified: validated.contentUnified,
        recipientsUnified: validated.recipientsUnified,
        needProcessing: validated.needProcessing,
        enabled: true
      }
      addAlertRule(singleRule)
      Message.success('规则创建成功')
      router.push('/marketing/alert/management')
    }
  } catch (e) {
    Message.error('创建失败')
    console.error(e)
  }
}

const testVisible = ref(false)
const handleTest = () => { testVisible.value = true }
const closeTest = () => { testVisible.value = false }
const confirmTest = () => {
  testVisible.value = false
  Message.success('已发送测试通知（模拟）')
}
</script>

<style scoped>
.marketing-page { padding: 16px; background-color: #fff; }
.page-header { margin-bottom: 12px; }
.page-title { margin: 0; font-size: 18px; font-weight: 600; }
.page-description { margin: 2px 0 0; color: #86909c; }
.page-content { max-width: 1200px; margin: 0 auto; }
.content-left, .content-right { display: flex; flex-direction: column; gap: 12px; }
.panel-card { margin-top: 12px; }
.side-panel { position: sticky; top: 16px; }
.preview-block { margin-bottom: 12px; }
.preview-content { background: #f7f8fa; border: 1px solid #e5e6eb; border-radius: 6px; padding: 10px; white-space: pre-wrap; }
.actions-bar { position: sticky; bottom: 0; background: rgba(255,255,255,0.95); border-top: 1px solid #e5e6eb; padding: 10px 0; margin-top: 12px; }
.actions-inner { display: flex; gap: 8px; justify-content: flex-end; max-width: 1200px; margin: 0 auto; padding: 0 8px; }
</style>
const isEditingSingleRule = computed(() => !!editingId.value)
