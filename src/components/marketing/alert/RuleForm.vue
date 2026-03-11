<template>
  <a-form ref="formRef" :model="form" layout="vertical">
    <div v-if="showBasicMonitor && !hideBasic" class="section-header" id="basic-info">
      <h4 class="section-title">基础信息</h4>
      <p class="section-subtitle">填写规则名称与监控类型</p>
    </div>
    <a-row v-if="showBasicMonitor && !hideBasic" :gutter="16">
      <a-col :span="12">
        <a-form-item label="规则名称" required>
          <a-input v-model="form.name" placeholder="请输入规则名称" />
        </a-form-item>
      </a-col>
      <a-col :span="12">
        <a-form-item label="监控类型" required>
          <a-select v-model="form.type" placeholder="请选择监控类型" @change="onTypeChange">
            <a-option value="inventory">库存监控</a-option>
            <a-option value="expiry">过期监控</a-option>
            <a-option value="failure">失败率监控</a-option>
          </a-select>
        </a-form-item>
      </a-col>
    </a-row>

    <div v-if="showBasicMonitor" class="condition-form">
      <div class="section-header" id="monitor-config">
        <h4 class="section-title">监控配置</h4>
        <p class="section-subtitle">选择监控粒度、指标与阈值</p>
      </div>

      <a-row :gutter="16">
        <a-col v-if="typeInConfig || hideBasic" :xs="24" :md="12" :lg="8">
          <a-form-item label="监控类型" required>
            <a-select v-model="form.type" placeholder="请选择监控类型" @change="onTypeChange">
              <a-option value="inventory">库存监控</a-option>
              <a-option value="expiry">过期监控</a-option>
              <a-option value="failure">失败率监控</a-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :xs="24" :md="12" :lg="8">
          <a-form-item label="监控粒度" required>
            <a-select v-model="form.conditions.granularity" placeholder="请选择监控粒度" @change="onGranularityChange">
              <a-option v-for="g in granularities" :key="g.value" :value="g.value">{{ g.label }}</a-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :xs="24" :md="24" :lg="8">
          <a-form-item label="监控范围" required>
            <a-select v-model="form.conditions.scope" mode="multiple" placeholder="请选择监控范围" style="width: 100%">
              <a-option v-for="s in scopes" :key="s.value" :value="s.value">
                <span>{{ s.label }}</span>
              </a-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>

      <a-row v-if="form.conditions.granularity === 'coupon_stock' && Array.isArray(form.conditions.scope) && form.conditions.scope.includes('custom_stock')" :gutter="16">
        <a-col :span="24">
          <a-form-item label="指定券库存" required>
            <a-select v-model="form.conditions.selectedInventories" mode="multiple" allow-search :loading="loadingInventory" placeholder="请选择要监控的券库存" style="width: 100%" @dropdown-visible-change="onInventoryDropdown">
              <a-option v-for="inv in inventoryList" :key="inv.id" :value="inv.id">
                <div class="option-content">
                  <div class="option-label">{{ inv.couponName }}</div>
                  <div class="option-description">类型: {{ inv.couponType }} | 状态: {{ inv.status }} | 模板ID: {{ inv.templateId }}</div>
                </div>
              </a-option>
            </a-select>
            <div class="form-tip"><IconInfoCircle /> 选择要监控的具体券库存，支持多选</div>
          </a-form-item>
        </a-col>
      </a-row>
      <a-row v-if="form.conditions.granularity === 'coupon_package' && Array.isArray(form.conditions.scope) && form.conditions.scope.includes('custom_packages')" :gutter="16">
        <a-col :span="24">
          <a-form-item label="指定券包" required>
            <a-select v-model="form.conditions.selectedPackages" mode="multiple" allow-search :loading="loadingPackages" placeholder="请选择要监控的券包" style="width: 100%" @dropdown-visible-change="onPackageDropdown">
              <a-option v-for="pkg in packageList" :key="pkg.id" :value="pkg.id">
                <div class="option-content">
                  <div class="option-label">{{ pkg.name }}</div>
                  <div class="option-description">类型: {{ pkg.type }} | 状态: {{ pkg.status }} | 总数: {{ pkg.totalCount }} | 库存: {{ pkg.stock }}</div>
                </div>
              </a-option>
            </a-select>
            <div class="form-tip"><IconInfoCircle /> 选择要监控的具体券包，支持多选</div>
          </a-form-item>
        </a-col>
      </a-row>

      <a-row v-if="form.type && form.conditions.granularity" :gutter="16">
        <a-col :span="24">
          <a-form-item label="监控指标与阈值" required>
            <div class="metric-config-list">
              <a-row class="metric-table-header" :gutter="12">
                <a-col :xs="24" :md="10" :lg="anyNeedsWindow ? 8 : 10"><div class="header-cell">指标</div></a-col>
                <a-col :xs="24" :md="6" :lg="6"><div class="header-cell">操作符</div></a-col>
                <a-col :xs="24" :md="anyNeedsWindow ? 6 : 8" :lg="anyNeedsWindow ? 8 : 8"><div class="header-cell">阈值</div></a-col>
                <a-col v-if="anyNeedsWindow" :xs="24" :md="2" :lg="2"><div class="header-cell">窗口</div></a-col>
              </a-row>
              <div v-for="(cfg, idx) in form.conditions.metricConfigs" :key="cfg.metric || idx" class="metric-config-item">
                <a-row :gutter="12" align="middle">
                  <a-col :xs="24" :md="10" :lg="anyNeedsWindow ? 8 : 10">
                    <div class="inline-field">
                      <a-select v-model="cfg.metric" placeholder="请选择指标" @change="(val)=>onMetricSelect(cfg, val)" style="width: 100%" :render-format="renderSelectedLabel">
                        <a-option v-for="m in availableMetricOptions(cfg.metric)" :key="m.value" :value="m.value" :label="m.label">
                          <div class="option-content">
                            <div class="option-label">{{ m.label }}</div>
                            <div class="option-description">{{ m.description }}</div>
                          </div>
                        </a-option>
                      </a-select>
                    </div>
                  </a-col>
                  <a-col :xs="24" :md="6" :lg="6">
                    <div class="inline-field">
                      <a-select v-model="cfg.operator" placeholder="请选择" style="width: 100%">
                        <a-option value="greater_than">大于</a-option>
                        <a-option value="less_than">小于</a-option>
                        <a-option value="equal">等于</a-option>
                        <a-option value="greater_equal">大于等于</a-option>
                        <a-option value="less_equal">小于等于</a-option>
                      </a-select>
                    </div>
                  </a-col>
                  <a-col :xs="24" :md="anyNeedsWindow ? 6 : 8" :lg="anyNeedsWindow ? 8 : 8">
                    <div class="inline-field value-field">
                      <div class="value-input">
                        <a-input-number v-model="cfg.threshold" :min="0" :precision="2" style="width: 100%" :placeholder="metricInfoMap[cfg.metric]?.defaultThreshold || '请输入'" />
                        <span v-if="metricUnitType(cfg.metric) === 'percentage'" class="unit-suffix">%</span>
                      </div>
                    </div>
                  </a-col>
                  <a-col v-if="anyNeedsWindow" :xs="24" :md="2" :lg="2">
                    <div class="inline-field">
                      <template v-if="needsWindow(cfg.metric)">
                        <a-select v-model="cfg.window" placeholder="请选择窗口" style="width: 100%">
                          <a-option value="today">当日</a-option>
                          <a-option value="24h">最近24小时</a-option>
                          <a-option value="7d">最近7天</a-option>
                        </a-select>
                      </template>
                      <template v-else>
                        <span class="no-window-placeholder" aria-hidden="true"></span>
                      </template>
                    </div>
                  </a-col>
                  
                </a-row>
              </div>
              
            </div>
          </a-form-item>
        </a-col>
      </a-row>

      
    </div>

    <div v-if="showNotifyContent" class="section-header" id="notification-settings">
      <h4 class="section-title">通知设置</h4>
      <p class="section-subtitle">选择渠道并配置接收人与通知文案</p>
    </div>
    <a-form-item v-if="showNotifyContent" label="通知渠道" required>
      <a-checkbox-group v-model="channelSelection">
        <a-checkbox value="wechat">企业微信</a-checkbox>
        <a-checkbox value="sms">短信</a-checkbox>
      </a-checkbox-group>
    </a-form-item>

    <a-form-item v-if="showNotifyContent">
      <template #label>
        <span>通知对象</span>
        <a-button type="text" size="small" @click="openRecipientsModal">通知人列表</a-button>
      </template>
      <a-card :bordered="false" class="recipients-card" style="width: 100%">
        <div class="inline-field">
          <span class="inline-label">选择接收人（多选）</span>
          <a-select
            v-model="form.recipientsUnified"
            mode="multiple"
            allow-search
            allow-create
            @create="onCreateRecipient"
            :options="recipientOptions"
            placeholder="请选择或新建接收人"
            style="width: 100%"
          />
        </div>
      </a-card>
    </a-form-item>

    <a-modal v-model:visible="recipientsModalVisible" title="通知人列表" :width="600" @ok="closeRecipientsModal" @cancel="closeRecipientsModal">
      <a-space style="margin-bottom:8px">
        <a-button type="primary" size="small" @click="addRecipient">+ 添加通知人</a-button>
      </a-space>
      <div class="recipient-list">
        <div v-for="(c, i) in form.recipients.smsContacts" :key="i" class="recipient-item">
          <a-space>
            <a-input v-model="c.name" placeholder="姓名" style="width: 220px" />
            <a-input v-model="c.phone" placeholder="手机号" style="width: 220px" @blur="validatePhone(c.phone, i)" />
            <a-button type="text" status="danger" @click="removeSmsContact(i)">删除</a-button>
          </a-space>
          <div v-if="c.phoneError" class="error-text">{{ c.phoneError }}</div>
        </div>
      </div>
    </a-modal>

    <a-form-item v-if="showNotifyContent">
      <template #label>
        <span>是否需要处理</span>
        <a-tooltip position="right">
          <template #content>
            <div>关闭：预警仅通知</div>
            <div>开启：需用户标记“已处理”</div>
          </template>
          <IconQuestionCircle style="margin-left:6px;color:#86909c;cursor:pointer" />
        </a-tooltip>
      </template>
      <a-switch v-model="form.needProcessing" />
    </a-form-item>

    <div v-if="showNotifyContent" id="content-template">
      <a-form-item label="通知文案" required>
        <a-card :bordered="false" class="content-card" style="width: 100%">
          <div class="metric-content-list">
            <template v-if="form.conditions.metricConfigs && form.conditions.metricConfigs.length > 0">
              <div v-for="(cfg, idx) in form.conditions.metricConfigs" :key="cfg.metric || idx" class="metric-content-item">
                <div class="metric-content-header">
                  <a-tag v-if="cfg.metric">{{ metricInfoMap[cfg.metric]?.label || cfg.metric }}</a-tag>
                  <span class="metric-expression muted" v-else>未选择指标</span>
                  <a-space style="margin-left:auto">
                    <a-button size="mini" type="text" @click="fillDefaultForMetric(cfg)">用默认模板填充</a-button>
                  </a-space>
                </div>
                <a-textarea
                  v-model="cfg.content"
                  :rows="2"
                  :max-length="200"
                  show-word-limit
                  placeholder="请输入该指标的通知文案，支持 {{规则名称}} {{监控类型}} {{监控粒度}} {{监控范围}} {{统计窗口}} {{指标名称}} {{指标值}} {{操作符}} {{预警阈值}} {{单位}} {{券库存名称}} {{券包名称}} {{对象数量}} {{对象清单}}"
                />
                <a-space size="mini" style="margin-top:6px">
                  <a-select :options="placeholderOptions" placeholder="插入占位符" @change="(p)=>insertPlaceholder(cfg, p)" style="width:160px" allow-clear />
                  <a-input v-model="cfg._extraKey" placeholder="自定义参数键" style="width:140px" />
                  <a-input v-model="cfg._extraValue" placeholder="值" style="width:140px" />
                  <a-button size="mini" @click="addExtraVarForMetric(cfg)">添加参数</a-button>
                </a-space>
              </div>
            </template>
            <template v-else>
              <div class="metric-content-item">
                <div class="metric-content-header">
                  <span class="metric-expression muted">暂无指标，请在上方添加后配置文案</span>
                </div>
              </div>
            </template>
            <a-collapse :default-active-key="[]" style="margin-top:8px">
              <a-collapse-item key="placeholders" header="占位符说明">
                <div v-pre>可用占位符： {{规则名称}} {{监控类型}} {{监控粒度}} {{监控范围}} {{统计窗口}} {{指标名称}} {{指标值}} {{操作符}} {{预警阈值}} {{单位}} {{券库存名称}} {{券包名称}} {{对象数量}} {{对象清单}}</div>
              </a-collapse-item>
            </a-collapse>
          </div>
        </a-card>
      </a-form-item>
      
    </div>

    <a-form-item v-if="showBasicMonitor && !hideDescription" label="规则描述">
      <a-textarea v-model="form.description" placeholder="请输入规则描述" :rows="3" />
    </a-form-item>
  </a-form>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import { ALERT_METRICS_BY_GRANULARITY, ALERT_METRICS_BY_TYPE_AND_GRANULARITY } from '@/mock/alertMetrics'
import { IconInfoCircle, IconQuestionCircle } from '@arco-design/web-vue/es/icon'

const props = defineProps({
  modelValue: { type: Object, default: () => ({}) },
  inventoryList: { type: Array, default: () => [] },
  packageList: { type: Array, default: () => [] },
  loadingInventory: { type: Boolean, default: false },
  loadingPackages: { type: Boolean, default: false },
  onLoadInventories: { type: Function, default: null },
  onLoadPackages: { type: Function, default: null },
  hideDescription: { type: Boolean, default: false },
  hideBasic: { type: Boolean, default: false },
  showBasicMonitor: { type: Boolean, default: true },
  showNotifyContent: { type: Boolean, default: true },
  typeInConfig: { type: Boolean, default: false }
})

const emits = defineEmits(['update:modelValue'])

const formRef = ref()
let updatingFromParent = false

const defaultForm = () => ({
  name: '',
  type: '',
  description: '',
  conditions: {
    granularity: '',
    metrics: [],
    metricConfigs: [],
    scope: [],
    selectedInventories: [],
    selectedPackages: [],
    instanceConfig: 'general'
  },
  notificationConfigs: [],
  content: { wechat: '', sms: '' },
  contentUnified: '',
  extraVars: {},
  _extraKey: '',
  _extraValue: '',
  recipients: {
    wechatUsers: [],
    smsContacts: []
  },
  recipientsUnified: [],
  needProcessing: false
})

const form = reactive(defaultForm())

const recipientOptions = ref([])
const recipientsModalVisible = ref(false)
const openRecipientsModal = () => { recipientsModalVisible.value = true }
const closeRecipientsModal = () => { recipientsModalVisible.value = false }
const addRecipient = () => { addSmsContact() }

watch(() => props.modelValue, (val) => {
  updatingFromParent = true
  const next = val ? JSON.parse(JSON.stringify(val)) : defaultForm()
  Object.assign(form, defaultForm(), next)
  if (!form.conditions) form.conditions = defaultForm().conditions
  if (!Array.isArray(form.conditions.metricConfigs)) form.conditions.metricConfigs = []
  if (!Array.isArray(form.notificationConfigs)) form.notificationConfigs = []
  if (!form.recipients) form.recipients = { wechatUsers: [], smsContacts: [] }
  if (!Array.isArray(form.recipients.wechatUsers)) form.recipients.wechatUsers = []
  if (!Array.isArray(form.recipients.smsContacts)) form.recipients.smsContacts = []
  nextTick(() => { updatingFromParent = false })
}, { immediate: true, deep: true })

watch(form, (val) => {
  if (updatingFromParent) return
  emits('update:modelValue', JSON.parse(JSON.stringify(val)))
}, { deep: true, flush: 'post' })

const granularities = computed(() => {
  const map = {
    inventory: [
      { value: 'coupon_stock', label: '券库存粒度' },
      { value: 'coupon_package', label: '券包粒度' }
    ],
    expiry: [
      { value: 'coupon_stock', label: '券库存粒度' },
      { value: 'coupon_package', label: '券包粒度' }
    ],
    failure: [
      { value: 'coupon_package', label: '券包粒度' },
      { value: 'coupon_instance_lifecycle', label: '券实例生命周期粒度' }
    ]
  }
  return map[form.type] || []
})

watch(() => form.conditions.metricConfigs, (list) => {
  if (!Array.isArray(list)) return
  list.forEach(cfg => {
    if (!cfg) return
    ensureContentTemplate(cfg)
    if (cfg._lastPreset && cfg.content && cfg.content.trim() && cfg.content !== cfg._lastPreset) {
      cfg._autoContent = false
    }
  })
}, { deep: true })

const metrics = computed(() => {
  const type = form.type
  const g = form.conditions.granularity
  const byType = ALERT_METRICS_BY_TYPE_AND_GRANULARITY[type]?.[g]
  if (byType && byType.length > 0) return byType
  return ALERT_METRICS_BY_GRANULARITY[g] || []
})

const scopes = computed(() => {
  const type = form.type
  const g = form.conditions.granularity
  if (type === 'inventory') {
    const S = {
      coupon_stock: [
        { value: 'all_stock', label: '全部券库存' },
        { value: 'custom_stock', label: '指定券库存' }
      ],
      coupon_package: [
        { value: 'all_packages', label: '全部券包' },
        { value: 'custom_packages', label: '指定券包' }
      ],
      coupon_instance_lifecycle: [
        { value: 'all_instances', label: '全部券实例' }
      ]
    }
    return S[g] || []
  }
  if (type === 'expiry') {
    const S = {
      coupon_stock: [ { value: 'all_stock', label: '全部券库存' } ],
      coupon_package: [ { value: 'all_packages', label: '全部券包' } ]
    }
    return S[g] || []
  }
  if (type === 'failure') {
    return [ { value: 'all_lifecycle', label: '全部生命周期' } ]
  }
  return []
})

const metricInfoMap = computed(() => {
  const map = {}
  for (const m of metrics.value) map[m.value] = m
  return map
})

const onTypeChange = (val) => {
  const next = defaultForm().conditions
  form.conditions = next
  form.conditions.metricConfigs = [{ metric: null, threshold: null, operator: '', content: '', _autoContent: true, _lastPreset: '', extraVars: {}, _extraKey: '', _extraValue: '' }]
}

const onGranularityChange = () => {
  form.conditions.metricConfigs = [{ metric: null, threshold: null, operator: '', content: '', _autoContent: true, _lastPreset: '', extraVars: {}, _extraKey: '', _extraValue: '' }]
  form.conditions.scope = []
  form.conditions.selectedInventories = []
  form.conditions.selectedPackages = []
}

const addMetricConfig = () => {
  form.conditions.metricConfigs.push({ metric: null, threshold: null, operator: '', content: '', _autoContent: true, _lastPreset: '', extraVars: {}, _extraKey: '', _extraValue: '' })
  emits('update:modelValue', JSON.parse(JSON.stringify(form)))
}
const removeMetricConfig = (idx) => {
  form.conditions.metricConfigs.splice(idx, 1)
  emits('update:modelValue', JSON.parse(JSON.stringify(form)))
}
const metricUnitType = (metric) => metricInfoMap.value[metric]?.unitType === 'percentage' ? 'percentage' : 'absolute'
const operatorText = (op) => ({
  greater_than: '大于',
  less_than: '小于',
  equal: '等于',
  greater_equal: '大于等于',
  less_equal: '小于等于'
  })[op] || ''
  const formatMetricExpression = (cfg) => {
    if (!cfg || !cfg.metric || (cfg.threshold === null || cfg.threshold === undefined) || !cfg.operator) return ''
    const label = metricInfoMap.value[cfg.metric]?.label || cfg.metric
    const unit = metricUnitType(cfg.metric) === 'percentage' ? '%' : ''
    return `${label} ${operatorText(cfg.operator)} ${cfg.threshold}${unit}`
  }
const renderSelectedLabel = (label) => label
const ensureContentTemplate = (cfg) => {
  if (!cfg.content || !cfg.content.trim()) {
    const preset = metricInfoMap.value[cfg.metric]?.presetNotice || ''
    if (preset) {
      cfg.content = preset
        .replace(/【券库存名称】/g, '{{券库存名称}}')
        .replace(/【券包名称】/g, '{{券包名称}}')
        .replace(/【指标值】/g, '{{指标值}}')
    } else {
      cfg.content = '【{{指标名称}}】在【{{监控粒度}}】监控触发：当前值{{指标值}}，{{操作符}}阈值{{预警阈值}}，请关注。'
    }
  }
}
const defaultOperatorForMetric = (metric) => {
  const map = {
    remaining_stock_count: 'less_than',
    remaining_stock_ratio: 'less_than',
    remaining_valid_days: 'less_than',
    package_remaining_days: 'less_than',
    package_valid_stock: 'less_than',
    daily_distribution_success_rate: 'less_than',
    redemption_failure_ratio: 'greater_than',
    distribution_failure_rate: 'greater_than'
  }
  return map[metric] || 'less_than'
}
const onMetricSelect = (cfg, metric) => {
  // 去重：同一指标仅允许出现一次
  const exists = form.conditions.metricConfigs.filter(c => c !== cfg).some(c => c.metric === metric)
  if (exists) {
    Message.warning('该指标已选择')
    cfg.metric = null
    return
  }
  cfg.metric = metric
  cfg.operator = defaultOperatorForMetric(metric)
  cfg.threshold = null
  ensureContentTemplate(cfg)
  emits('update:modelValue', JSON.parse(JSON.stringify(form)))
}

const fillDefaultForMetric = (cfg) => {
  ensureContentTemplate(cfg)
  emits('update:modelValue', JSON.parse(JSON.stringify(form)))
}

const copyPrevMetricConfig = (idx) => {
  if (idx <= 0) return
  const prev = form.conditions.metricConfigs[idx - 1]
  if (!prev) return
  const copy = JSON.parse(JSON.stringify(prev))
  form.conditions.metricConfigs.splice(idx + 1, 0, copy)
  emits('update:modelValue', JSON.parse(JSON.stringify(form)))
}

const onInventoryDropdown = (visible) => {
  if (visible && typeof props.onLoadInventories === 'function') props.onLoadInventories()
}

const onPackageDropdown = (visible) => {
  if (visible && typeof props.onLoadPackages === 'function') props.onLoadPackages()
}

const validate = async () => {
  // 基本校验
  if (!form.name.trim()) { Message.error('请输入规则名称'); return false }
  if (!form.type) { Message.error('请选择监控类型'); return false }
  if (!form.conditions.granularity) { Message.error('请选择监控粒度'); return false }
  if (!form.conditions.metricConfigs || form.conditions.metricConfigs.length === 0) { Message.error('请添加监控指标'); return false }
  for (const cfg of form.conditions.metricConfigs) {
    if (!cfg.metric) { Message.error('请选择指标'); return false }
    if (cfg.threshold === null || cfg.threshold === undefined) { Message.error('请填写数值'); return false }
    if (!cfg.operator) { Message.error('请选择操作符'); return false }
    if (metricUnitType(cfg.metric) === 'percentage' && (cfg.threshold < 0 || cfg.threshold > 100)) { Message.error('百分比需在0-100'); return false }
  }
  for (const cfg of form.conditions.metricConfigs) {
    if (cfg.threshold === null || cfg.threshold === undefined) { Message.error('请填写阈值'); return false }
    if (!cfg.operator) { Message.error('请选择操作'); return false }
    if (metricUnitType(cfg.metric) === 'percentage' && (cfg.threshold < 0 || cfg.threshold > 100)) { Message.error('百分比阈值需在0-100'); return false }
    if (needsWindow(cfg.metric) && !cfg.window) { Message.error('请选择统计窗口'); return false }
  }
  if (!form.notificationConfigs || form.notificationConfigs.length === 0) { Message.error('请至少选择一个通知渠道'); return false }
  for (const cfg of form.conditions.metricConfigs) {
    if (!cfg.content || !cfg.content.trim()) { Message.error('请为每个指标填写通知文案'); return false }
  }
  if (!Array.isArray(form.recipientsUnified) || form.recipientsUnified.length === 0) { Message.error('请至少添加一个通知对象'); return false }
  for (const user of form.recipients.wechatUsers) { if (!user.userId || !user.userId.trim()) { Message.error('企业微信用户ID不能为空'); return false } }
  const phoneRegex = /^1[3-9]\d{9}$/
  for (const contact of form.recipients.smsContacts) {
    if (!contact.phone || !contact.phone.trim()) { Message.error('短信联系人手机号不能为空'); return false }
    if (!phoneRegex.test(contact.phone)) { Message.error('请输入正确的手机号码格式'); return false }
  }

  // 粒度专项校验
  if (form.conditions.granularity === 'coupon_stock' && form.conditions.selectedInventories.length === 0 && Array.isArray(form.conditions.scope) && form.conditions.scope.includes('custom_stock')) {
    Message.error('请选择要监控的券库存'); return false
  }
  if (form.conditions.granularity === 'coupon_package' && form.conditions.selectedPackages.length === 0 && Array.isArray(form.conditions.scope) && form.conditions.scope.includes('custom_packages')) {
    Message.error('请选择要监控的券包'); return false
  }

  return JSON.parse(JSON.stringify(form))
}

defineExpose({ validate })
const selectedChannels = computed(() => Array.from(new Set((form.notificationConfigs || []).map(nc => nc.channel).filter(Boolean))))
const channelSelection = computed({
  get() {
    return selectedChannels.value
  },
  set(vals) {
    form.notificationConfigs = (vals || []).map(v => ({ channel: v }))
  }
})
// 渠道选择通过 channelSelection 维护，无需添加/删除入口

const availableMetricOptions = (currentMetric) => {
  const used = new Set((form.conditions.metricConfigs || []).map(c => c.metric).filter(Boolean))
  return metrics.value.filter(m => !used.has(m.value) || m.value === currentMetric)
}

const needsWindow = (metric) => {
  return ['redemption_failure_ratio', 'daily_distribution_success_rate', 'distribution_failure_rate'].includes(metric)
}

const anyNeedsWindow = computed(() => {
  return (form.conditions.metricConfigs || []).some(c => needsWindow(c.metric))
})

onMounted(() => {
  if (!Array.isArray(form.notificationConfigs)) form.notificationConfigs = []
  if (form.notificationConfigs.length === 0) {
    form.notificationConfigs.push({ channel: 'wechat' })
  }
  if (!Array.isArray(form.conditions.metricConfigs)) form.conditions.metricConfigs = []
  if (form.conditions.metricConfigs.length === 0) {
    form.conditions.metricConfigs.push({ metric: null, threshold: null, operator: '', content: '', _autoContent: true, _lastPreset: '', extraVars: {}, _extraKey: '', _extraValue: '' })
  } else {
    form.conditions.metricConfigs = [JSON.parse(JSON.stringify(form.conditions.metricConfigs[0]))]
  }
})

// 监听来自父级的类型/粒度变化，确保内部重置逻辑生效
watch(() => form.type, (val, oldVal) => {
  if (updatingFromParent) return
  if (!props.showBasicMonitor) return
  onTypeChange(val)
})
watch(() => form.conditions.granularity, (val, oldVal) => {
  if (updatingFromParent) return
  if (!props.showBasicMonitor) return
  onGranularityChange()
})
const addWechatUser = () => { form.recipients.wechatUsers.push({ userId: '', userName: '', department: '' }) }
const removeWechatUser = (index) => { form.recipients.wechatUsers.splice(index, 1) }
const addSmsContact = () => { form.recipients.smsContacts.push({ phone: '', name: '', role: '', phoneError: '' }) }
const removeSmsContact = (index) => { form.recipients.smsContacts.splice(index, 1) }
const validatePhone = (phone, index) => {
  const phoneRegex = /^1[3-9]\d{9}$/
  if (phone && !phoneRegex.test(phone)) form.recipients.smsContacts[index].phoneError = '请输入正确的手机号码格式'
  else form.recipients.smsContacts[index].phoneError = ''
}
const wechatBatchInput = ref('')
const smsBatchInput = ref('')
const batchAddWechatUsers = () => {
  if (!wechatBatchInput.value.trim()) return
  const userIds = wechatBatchInput.value.split(/[\n,]/).map(s => s.trim()).filter(Boolean)
  userIds.forEach(id => {
    if (!form.recipients.wechatUsers.find(u => u.userId === id)) {
      form.recipients.wechatUsers.push({ userId: id, userName: '', department: '' })
    }
  })
  wechatBatchInput.value = ''
  Message.success(`批量添加了 ${userIds.length} 个企业微信用户`)
}
const batchAddSmsContacts = () => {
  if (!smsBatchInput.value.trim()) return
  const phones = smsBatchInput.value.split(/[\n,]/).map(s => s.trim()).filter(Boolean)
  const phoneRegex = /^1[3-9]\d{9}$/
  const valid = phones.filter(p => phoneRegex.test(p))
  const invalid = phones.filter(p => !phoneRegex.test(p))
  valid.forEach(p => {
    if (!form.recipients.smsContacts.find(c => c.phone === p)) {
      form.recipients.smsContacts.push({ phone: p, name: '', role: '', phoneError: '' })
    }
  })
  smsBatchInput.value = ''
  if (valid.length) Message.success(`批量添加了 ${valid.length} 个短信联系人`)
  if (invalid.length) Message.warning(`${invalid.length} 个手机号格式不正确，已跳过`)
}

// 通知文案占位符选项
const placeholderOptions = [
  { label: '规则名称', value: '规则名称' },
  { label: '监控类型', value: '监控类型' },
  { label: '监控粒度', value: '监控粒度' },
  { label: '监控范围', value: '监控范围' },
  { label: '统计窗口', value: '统计窗口' },
  { label: '指标名称', value: '指标名称' },
  { label: '指标值', value: '指标值' },
  { label: '操作符', value: '操作符' },
  { label: '预警阈值', value: '预警阈值' },
  { label: '单位', value: '单位' },
  { label: '券库存名称', value: '券库存名称' },
  { label: '券包名称', value: '券包名称' },
  { label: '对象数量', value: '对象数量' },
  { label: '对象清单', value: '对象清单' }
]

// 插入占位符到文案
const insertPlaceholder = (cfg, p) => {
  const key = String(p || '').trim()
  if (!cfg) return
  if (!key) return
  const token = `{{${key}}}`
  cfg.content = (cfg.content || '') + (cfg.content ? ' ' : '') + token
}

// 创建接收人（支持“姓名 手机号”或仅手机号”）
const onCreateRecipient = (input) => {
  const text = String(input || '').trim()
  if (!text) return
  const phoneRegex = /^1[3-9]\d{9}$/
  const m = text.match(/^(.+?)[,\s]+(1[3-9]\d{9})$/)
  if (m) {
    const name = m[1].trim()
    const phone = m[2].trim()
    if (!recipientOptions.value.find(o => o.value === phone)) {
      recipientOptions.value.push({ label: `${name}(${phone})`, value: phone })
    }
    if (!form.recipientsUnified.includes(phone)) {
      form.recipientsUnified.push(phone)
    }
    if (!form.recipients.smsContacts.find(c => c.phone === phone)) {
      form.recipients.smsContacts.push({ phone, name, role: '', phoneError: '' })
    }
    return
  }
  if (phoneRegex.test(text)) {
    const phone = text
    if (!recipientOptions.value.find(o => o.value === phone)) {
      recipientOptions.value.push({ label: phone, value: phone })
    }
    if (!form.recipientsUnified.includes(phone)) {
      form.recipientsUnified.push(phone)
    }
    if (!form.recipients.smsContacts.find(c => c.phone === phone)) {
      form.recipients.smsContacts.push({ phone, name: '', role: '', phoneError: '' })
    }
    return
  }
  Message.warning('请使用“姓名 手机号”或“手机号”格式')
}
</script>

<style scoped>
.option-content { display: flex; flex-direction: column; }
.option-label { font-weight: 500; }
.option-description { color: #86909c; font-size: 12px; }
.threshold-tip { background: #f8f9fa; padding: 12px; border-radius: 6px; margin-bottom: 12px; display: flex; flex-direction: column; gap: 6px; }
.threshold-default { font-weight: 500; }
.business-meaning { color: #666; font-size: 13px; line-height: 1.4; }
.form-tip { display: flex; align-items: center; gap: 6px; color: #86909c; font-size: 12px; margin-top: 8px; }
.content-card { background-color: #f7f8fa; }
.no-channel-selected { padding: 16px 8px; }
.section-header { display: flex; flex-direction: column; gap: 4px; margin: 12px 0 8px; }
.section-title { margin: 0; font-size: 15px; font-weight: 600; color: #1d2129; }
.section-subtitle { margin: 0; font-size: 13px; color: #86909c; }
.summary-block { margin-top: 8px; }
.summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.summary-item { display: flex; justify-content: space-between; background: #f7f8fa; border: 1px solid #e5e6eb; border-radius: 6px; padding: 8px 10px; }
.summary-label { color: #4e5969; font-size: 13px; }
.summary-value { color: #1d2129; font-weight: 500; }
.metric-config-list { display: flex; flex-direction: column; gap: 8px; }
.metric-config-item { background: transparent; border: none; border-radius: 0; padding: 4px 10px; }
.metric-header { display: none; }
.metric-expression { color: #4e5969; font-size: 13px; }
.metric-expression.muted { color: #86909c; }
.metric-table-header { padding: 0 10px; margin-bottom: 8px; }
.header-cell { font-size: 13px; color: #4e5969; font-weight: 600; }
.no-window-placeholder { display: inline-block; width: 100%; height: 1px; }
.condition-form { padding: 8px 0; }
.inline-field { display: flex; flex-direction: column; gap: 6px; }
.inline-label { font-size: 13px; color: #4e5969; }
.value-input { display: flex; align-items: center; gap: 6px; }
.unit-suffix { color: #4e5969; }
.summary-label { color: #86909c; font-size: 12px; }
.recipients-card { background-color: #f7f8fa; margin-top: 8px; }
.panel-card { background-color: #f7f8fa; margin-top: 8px; }
.recipients-card h4 { margin: 0 0 8px 0; color: #1d2129; font-size: 14px; font-weight: 500; }
.recipient-list { margin-top: 8px; }
.recipient-item { margin-bottom: 8px; padding: 12px; background: white; border-radius: 6px; border: 1px solid #e5e6eb; }
.error-text { color: #f53f3f; font-size: 12px; margin-top: 4px; }
.batch-input { margin-top: 12px; padding: 12px; background: white; border-radius: 6px; border: 1px solid #e5e6eb; }
</style>
