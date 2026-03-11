<template>
  <div class="rule-conditions">
    <a-form
      ref="formRef"
      :model="formData"
      :rules="validationRules"
      label-align="left"
      label-col-props="{ span: 6 }"
      wrapper-col-props="{ span: 18 }"
    >
      <!-- 监控类型说明 -->
      <a-alert :type="getAlertType(ruleType)" class="type-alert">
        <template #title>{{ getTypeTitle(ruleType) }}</template>
        {{ getTypeDescription(ruleType) }}
      </a-alert>

      <!-- 通用条件配置 -->
      <a-divider orientation="left">基础条件</a-divider>
      
      <a-form-item
        label="阈值类型"
        field="thresholdType"
        required
      >
        <a-radio-group v-model="formData.thresholdType" type="button">
          <a-radio value="absolute">绝对值</a-radio>
          <a-radio value="percentage">百分比</a-radio>
        </a-radio-group>
        <template #extra>
          <div class="form-extra">
            绝对值：使用具体数值作为阈值\n百分比：使用百分比作为阈值
          </div>
        </template>
      </a-form-item>

      <a-form-item
        label="触发阈值"
        field="threshold"
        required
      >
        <a-input-number
          v-model="formData.threshold"
          :min="0"
          :precision="ruleType === 'failure' ? 2 : 0"
          :placeholder="getThresholdPlaceholder(ruleType)"
          style="width: 200px"
        />
        <template #suffix>
          <span class="input-suffix">{{ getThresholdUnit(ruleType, formData.thresholdType) }}</span>
        </template>
        <template #extra>
          <div class="form-extra">{{ getThresholdExtra(ruleType, formData.thresholdType) }}</div>
        </template>
      </a-form-item>

      <!-- 特定类型条件配置 -->
      <template v-if="ruleType === 'inventory'">
        <a-divider orientation="left">库存监控配置</a-divider>
        
        <a-form-item
          label="库存类型"
          field="inventoryType"
        >
          <a-select
            v-model="formData.inventoryType"
            placeholder="请选择库存类型"
            style="width: 200px"
            allow-clear
          >
            <a-option value="coupon">优惠券</a-option>
            <a-option value="gift">礼品</a-option>
            <a-option value="product">商品</a-option>
            <a-option value="other">其他</a-option>
          </a-select>
        </a-form-item>

        <a-form-item
          label="监控范围"
          field="inventoryScope"
        >
          <a-radio-group v-model="formData.inventoryScope" type="button">
            <a-radio value="all">全部库存</a-radio>
            <a-radio value="specific">指定库存</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item
          v-if="formData.inventoryScope === 'specific'"
          label="指定库存"
          field="specificInventories"
        >
          <a-select
            v-model="formData.specificInventories"
            placeholder="请选择要监控的库存"
            multiple
            style="width: 100%"
            allow-clear
          >
            <a-option value="inventory1">优惠券A - 1000个</a-option>
            <a-option value="inventory2">优惠券B - 500个</a-option>
            <a-option value="inventory3">礼品C - 200个</a-option>
          </a-select>
        </a-form-item>
      </template>

      <template v-if="ruleType === 'expiry'">
        <a-divider orientation="left">过期监控配置</a-divider>
        
        <a-form-item
          label="提前天数"
          field="expiryDays"
          required
        >
          <a-input-number
            v-model="formData.expiryDays"
            :min="1"
            :max="365"
            placeholder="请输入提前提醒天数"
            style="width: 200px"
          />
          <template #suffix>
            <span class="input-suffix">天</span>
          </template>
          <template #extra>
            <div class="form-extra">在优惠券过期前多少天开始提醒</div>
          </template>
        </a-form-item>

        <a-form-item
          label="提醒频率"
          field="reminderFrequency"
        >
          <a-select
            v-model="formData.reminderFrequency"
            placeholder="请选择提醒频率"
            style="width: 200px"
          >
            <a-option value="once">仅提醒一次</a-option>
            <a-option value="daily">每天提醒</a-option>
            <a-option value="weekly">每周提醒</a-option>
          </a-select>
        </a-form-item>

        <a-form-item
          label="监控对象"
          field="expiryTarget"
        >
          <a-radio-group v-model="formData.expiryTarget" type="button">
            <a-radio value="all">全部券</a-radio>
            <a-radio value="specific">指定券</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item
          v-if="formData.expiryTarget === 'specific'"
          label="指定券"
          field="specificCoupons"
        >
          <a-select
            v-model="formData.specificCoupons"
            placeholder="请选择要监控的券"
            multiple
            style="width: 100%"
            allow-clear
          >
            <a-option value="coupon1">春节优惠券A</a-option>
            <a-option value="coupon2">新年礼品券B</a-option>
            <a-option value="coupon3">生日特惠券C</a-option>
          </a-select>
        </a-form-item>
      </template>

      <template v-if="ruleType === 'failure'">
        <a-divider orientation="left">失败率监控配置</a-divider>
        
        <a-form-item
          label="统计窗口"
          field="timeWindow"
          required
        >
          <a-select
            v-model="formData.timeWindow"
            placeholder="请选择统计时间窗口"
            style="width: 200px"
          >
            <a-option value="5m">5分钟</a-option>
            <a-option value="10m">10分钟</a-option>
            <a-option value="30m">30分钟</a-option>
            <a-option value="1h">1小时</a-option>
            <a-option value="6h">6小时</a-option>
            <a-option value="24h">24小时</a-option>
          </a-select>
          <template #extra>
            <div class="form-extra">统计失败率的时间范围</div>
          </template>
        </a-form-item>

        <a-form-item
          label="最小样本数"
          field="minSampleSize"
        >
          <a-input-number
            v-model="formData.minSampleSize"
            :min="1"
            :max="1000"
            placeholder="请输入最小样本数"
            style="width: 200px"
          />
          <template #extra>
            <div class="form-extra">触发预警的最小样本数量，避免小样本误判</div>
          </template>
        </a-form-item>

        <a-form-item
          label="监控业务"
          field="businessType"
        >
          <a-select
            v-model="formData.businessType"
            placeholder="请选择业务类型"
            style="width: 200px"
            allow-clear
          >
            <a-option value="coupon">优惠券发放</a-option>
            <a-option value="gift">礼品发放</a-option>
            <a-option value="points">积分兑换</a-option>
            <a-option value="other">其他业务</a-option>
          </a-select>
        </a-form-item>
      </template>

      <!-- 通用高级配置 -->
      <a-divider orientation="left">高级配置</a-divider>
      
      <a-form-item
        label="检查频率"
        field="checkInterval"
        required
      >
        <a-select
          v-model="formData.checkInterval"
          placeholder="请选择检查频率"
          style="width: 200px"
        >
          <a-option value="1m">1分钟</a-option>
          <a-option value="5m">5分钟</a-option>
          <a-option value="10m">10分钟</a-option>
          <a-option value="30m">30分钟</a-option>
          <a-option value="1h">1小时</a-option>
          <a-option value="6h">6小时</a-option>
          <a-option value="24h">24小时</a-option>
        </a-select>
        <template #extra>
          <div class="form-extra">系统检查指标数据的频率</div>
        </template>
      </a-form-item>

      <a-form-item
        label="连续触发次数"
        field="consecutiveCount"
      >
        <a-input-number
          v-model="formData.consecutiveCount"
          :min="1"
          :max="10"
          placeholder="请输入连续触发次数"
          style="width: 200px"
        />
        <template #extra>
          <div class="form-extra">连续多少次触发条件才发送通知，避免偶发性误报</div>
        </template>
      </a-form-item>

      <a-form-item
        label="静默期"
        field="silentPeriod"
      >
        <a-input-number
          v-model="formData.silentPeriod"
          :min="0"
          :max="1440"
          placeholder="请输入静默期（分钟）"
          style="width: 200px"
        />
        <template #suffix>
          <span class="input-suffix">分钟</span>
        </template>
        <template #extra>
          <div class="form-extra">同一规则触发后，在静默期内不再重复发送通知</div>
        </template>
      </a-form-item>

      <a-form-item
        label="生效时段"
        field="effectiveTimeRange"
      >
        <a-time-picker-range
          v-model="formData.effectiveTimeRange"
          style="width: 240px"
          :placeholder="['开始时间', '结束时间']"
        />
        <template #extra>
          <div class="form-extra">规则仅在指定时间段内生效，为空表示全天生效</div>
        </template>
      </a-form-item>
    </a-form>

    <!-- 条件预览 -->
    <div class="condition-preview">
      <a-divider orientation="left">条件预览</a-divider>
      <div class="preview-content">
        <a-descriptions :data="previewData" :column="1" size="small" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({})
  },
  ruleType: {
    type: String,
    default: 'inventory'
  },
  rules: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:modelValue'])

const formRef = ref()

// 表单数据
const formData = reactive({
  type: 'inventory',
  threshold: 100,
  thresholdType: 'absolute',
  timeWindow: '1h',
  checkInterval: '5m',
  consecutiveCount: 1,
  // 库存监控特定字段
  inventoryType: '',
  inventoryScope: 'all',
  specificInventories: [],
  // 过期监控特定字段
  expiryDays: 7,
  reminderFrequency: 'once',
  expiryTarget: 'all',
  specificCoupons: [],
  // 失败率监控特定字段
  minSampleSize: 10,
  businessType: '',
  // 通用字段
  silentPeriod: 30,
  effectiveTimeRange: []
})

// 验证规则
const validationRules = computed(() => ({
  threshold: [
    { required: true, message: '请输入触发阈值' },
    { min: 0, message: '阈值不能小于0' }
  ],
  thresholdType: [{ required: true, message: '请选择阈值类型' }],
  checkInterval: [{ required: true, message: '请选择检查频率' }],
  consecutiveCount: [
    { required: true, message: '请输入连续触发次数' },
    { min: 1, max: 10, message: '连续触发次数应在1-10之间' }
  ],
  // 库存监控验证
  ...(props.ruleType === 'inventory' && {
    inventoryType: [{ required: false }],
    specificInventories: [
      { 
        validator: (value, callback) => {
          if (formData.inventoryScope === 'specific' && (!value || value.length === 0)) {
            callback('请选择要监控的库存')
          } else {
            callback()
          }
        }
      }
    ]
  }),
  // 过期监控验证
  ...(props.ruleType === 'expiry' && {
    expiryDays: [
      { required: true, message: '请输入提前天数' },
      { min: 1, max: 365, message: '提前天数应在1-365之间' }
    ],
    specificCoupons: [
      { 
        validator: (value, callback) => {
          if (formData.expiryTarget === 'specific' && (!value || value.length === 0)) {
            callback('请选择要监控的券')
          } else {
            callback()
          }
        }
      }
    ]
  }),
  // 失败率监控验证
  ...(props.ruleType === 'failure' && {
    timeWindow: [{ required: true, message: '请选择统计窗口' }],
    minSampleSize: [
      { required: true, message: '请输入最小样本数' },
      { min: 1, max: 1000, message: '最小样本数应在1-1000之间' }
    ]
  })
}))

// 获取警告类型
const getAlertType = (type) => {
  const types = {
    inventory: 'info',
    expiry: 'warning',
    failure: 'error'
  }
  return types[type] || 'info'
}

// 获取类型标题
const getTypeTitle = (type) => {
  const titles = {
    inventory: '库存监控',
    expiry: '过期监控',
    failure: '失败率监控'
  }
  return titles[type] || '监控'
}

// 获取类型描述
const getTypeDescription = (type) => {
  const descriptions = {
    inventory: '监控库存数量变化，当库存低于设定阈值时触发预警',
    expiry: '监控优惠券即将过期情况，提前通知相关人员处理',
    failure: '监控业务失败率，当失败率超过设定阈值时触发预警'
  }
  return descriptions[type] || '监控业务指标变化'
}

// 获取阈值占位符
const getThresholdPlaceholder = (type) => {
  const placeholders = {
    inventory: '请输入库存阈值',
    expiry: '请输入提前天数',
    failure: '请输入失败率阈值'
  }
  return placeholders[type] || '请输入阈值'
}

// 获取阈值单位
const getThresholdUnit = (type, thresholdType) => {
  if (thresholdType === 'percentage') {
    return '%'
  }
  
  const units = {
    inventory: '个',
    expiry: '天',
    failure: '%'
  }
  return units[type] || ''
}

// 获取阈值额外说明
const getThresholdExtra = (type, thresholdType) => {
  if (thresholdType === 'percentage') {
    return '当指标超过此百分比时触发预警'
  }
  
  const extras = {
    inventory: '当库存低于此数值时触发预警',
    expiry: '在优惠券过期前此天数开始提醒',
    failure: '当失败次数超过此数值时触发预警'
  }
  return extras[type] || '当指标达到此数值时触发预警'
}

// 预览数据
const previewData = computed(() => {
  const data = [
    {
      label: '监控类型',
      value: getTypeTitle(props.ruleType)
    },
    {
      label: '阈值类型',
      value: formData.thresholdType === 'absolute' ? '绝对值' : '百分比'
    },
    {
      label: '触发阈值',
      value: `${formData.threshold}${getThresholdUnit(props.ruleType, formData.thresholdType)}`
    },
    {
      label: '检查频率',
      value: formatCheckInterval(formData.checkInterval)
    }
  ]

  // 添加特定类型的预览信息
  if (props.ruleType === 'inventory') {
    data.push({
      label: '监控范围',
      value: formData.inventoryScope === 'specific' ? '指定库存' : '全部库存'
    })
  } else if (props.ruleType === 'expiry') {
    data.push({
      label: '提前天数',
      value: `${formData.expiryDays}天`
    })
  } else if (props.ruleType === 'failure') {
    data.push({
      label: '统计窗口',
      value: formatTimeWindow(formData.timeWindow)
    })
  }

  if (formData.consecutiveCount > 1) {
    data.push({
      label: '连续触发',
      value: `${formData.consecutiveCount}次`
    })
  }

  if (formData.silentPeriod > 0) {
    data.push({
      label: '静默期',
      value: `${formData.silentPeriod}分钟`
    })
  }

  return data
})

// 格式化检查间隔
const formatCheckInterval = (interval) => {
  const map = {
    '1m': '1分钟',
    '5m': '5分钟',
    '10m': '10分钟',
    '30m': '30分钟',
    '1h': '1小时',
    '6h': '6小时',
    '24h': '24小时'
  }
  return map[interval] || interval
}

// 格式化时间窗口
const formatTimeWindow = (window) => {
  const map = {
    '5m': '5分钟',
    '10m': '10分钟',
    '30m': '30分钟',
    '1h': '1小时',
    '6h': '6小时',
    '24h': '24小时'
  }
  return map[window] || window
}

// 监听数据变化
watch(() => props.modelValue, (newValue) => {
  Object.assign(formData, newValue)
}, { immediate: true, deep: true })

watch(formData, (newValue) => {
  emit('update:modelValue', newValue)
}, { deep: true })

// 监听规则类型变化，重置特定字段
watch(() => props.ruleType, (newType) => {
  formData.type = newType
  
  // 根据类型设置默认值
  if (newType === 'inventory') {
    formData.threshold = 100
    formData.inventoryScope = 'all'
    formData.specificInventories = []
  } else if (newType === 'expiry') {
    formData.threshold = 7
    formData.expiryDays = 7
    formData.expiryTarget = 'all'
    formData.specificCoupons = []
  } else if (newType === 'failure') {
    formData.threshold = 5
    formData.thresholdType = 'percentage'
    formData.timeWindow = '10m'
    formData.minSampleSize = 10
  }
})

// 验证方法
const validate = async () => {
  try {
    await formRef.value.validate()
    return true
  } catch (error) {
    return false
  }
}

// 重置方法
const reset = () => {
  Object.assign(formData, {
    type: props.ruleType,
    threshold: 100,
    thresholdType: 'absolute',
    timeWindow: '1h',
    checkInterval: '5m',
    consecutiveCount: 1,
    inventoryType: '',
    inventoryScope: 'all',
    specificInventories: [],
    expiryDays: 7,
    reminderFrequency: 'once',
    expiryTarget: 'all',
    specificCoupons: [],
    minSampleSize: 10,
    businessType: '',
    silentPeriod: 30,
    effectiveTimeRange: []
  })
}

// 暴露方法
defineExpose({
  validate,
  reset
})
</script>

<style scoped lang="less">
.rule-conditions {
  padding: 24px 0;
}

.type-alert {
  margin-bottom: 24px;
}

.form-extra {
  font-size: 12px;
  color: #86909c;
  margin-top: 4px;
  white-space: pre-wrap;
}

.input-suffix {
  color: #86909c;
  font-size: 12px;
  margin-left: 8px;
}

.condition-preview {
  margin-top: 32px;
  
  .preview-content {
    background: #f7f8fa;
    border-radius: 6px;
    padding: 16px;
  }
}
</style>