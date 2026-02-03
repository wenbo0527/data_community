<template>
  <div class="contract-create">
    <a-page-header title="新建合同">
      <template #extra><a-button @click="goBack">返回</a-button></template>
      <template #content><div class="header-sub">单页表单，包含合同上传与外数信息配置</div></template>
    </a-page-header>
    <a-row :gutter="12">
      <a-col :span="24">
        <a-form ref="formRef" :model="form" :rules="rules" layout="vertical" :size="'large'">
          <a-collapse :bordered="false">
            <a-collapse-item key="contract" header="合同信息与上传">
                <a-row :gutter="12">
                  <a-col :span="24">
                    <a-form-item field="contractType" label="合同类型" required>
                      <a-select v-model="form.contractType" placeholder="选择类型">
                        <a-option value="framework">框架合同</a-option>
                        <a-option value="supplement">补充协议</a-option>
                      </a-select>
                    </a-form-item>
                  </a-col>
                </a-row>
                <a-row :gutter="12">
                  <a-col :span="24">
                    <a-form-item field="fileList" label="上传合同文件" :required="!skipUploadSelected">
                      <a-upload drag :show-file-list="true" v-model:file-list="form.fileList" :auto-upload="false" accept=".pdf,.doc,.docx" :before-upload="beforeUpload" class="upload-area">
                        <div class="upload-content">
                          <IconUpload class="upload-icon" />
                          <p class="upload-text">拖拽文件到此处或<span class="upload-highlight"> 点击上传</span></p>
                          <p class="upload-hint">支持PDF、Word格式，单个文件不超过10MB</p>
                          <a-progress v-if="uploadProgress > 0" :percent="uploadProgress" :show-text="false" />
                        </div>
                      </a-upload>
                    </a-form-item>
                  </a-col>
                </a-row>
                <a-row :gutter="12">
                  <a-col :span="12"><a-form-item field="shortName" label="合同简称" required><a-input v-model="form.shortName" placeholder="简洁标识合同" /></a-form-item></a-col>
                  <a-col :span="12"><a-form-item field="contractNo" label="合同编号"><a-input v-model="form.contractNo" placeholder="HT-2025-001" /></a-form-item></a-col>
                </a-row>
                <a-row :gutter="12">
                  <a-col :span="24"><a-form-item field="fullName" label="合同全称" required><a-input v-model="form.fullName" placeholder="完整规范名称，需与上传文件一致" /></a-form-item></a-col>
                </a-row>
                <a-row :gutter="12">
                  <a-col :span="8"><a-form-item field="amount" label="合同总金额" required><a-input-number v-model="form.amount" :min="0" :step="1000" style="width:100%" /></a-form-item></a-col>
                  <a-col :span="8"><a-form-item field="signDate" label="签订日期" required><a-date-picker v-model="form.signDate" style="width:100%" /></a-form-item></a-col>
                  <a-col :span="8"><a-form-item field="isGroupPurchase" label="总行代采" required><a-switch v-model="form.isGroupPurchase" /></a-form-item></a-col>
                </a-row>
                <a-row :gutter="12">
                  <a-col :span="12">
                    <a-form-item field="supplier" label="征信机构" required>
                      <a-select v-model="form.supplier" allow-create allow-clear placeholder="选择或输入征信机构，如 学信网 / 百行 / 朴道 / 钱塘">
                        <a-option v-for="s in supplierOptions" :key="s.value" :value="s.value">{{ s.label }}</a-option>
                      </a-select>
                    </a-form-item>
                  </a-col>
                  <a-col :span="12" v-if="form.contractType === 'supplement'">
                    <a-form-item field="frameworkIds" label="关联框架合同" required>
                      <a-select v-model="form.frameworkIds" multiple :disabled="!form.supplier" placeholder="先选择征信机构后展示其有效框架合同">
                        <a-option v-for="f in filteredFrameworkOptions" :key="f.value" :value="f.value">{{ f.label }}</a-option>
                      </a-select>
                    </a-form-item>
                  </a-col>
                  <a-col :span="12" v-if="form.contractType === 'framework'">
                    <a-form-item field="supplementIds" label="关联补充协议">
                      <a-select v-model="form.supplementIds" multiple :disabled="!form.supplier" placeholder="可选：关联已有的补充协议">
                        <a-option v-for="s in filteredSupplementOptions" :key="s.value" :value="s.value">{{ s.label }}</a-option>
                      </a-select>
                    </a-form-item>
                  </a-col>
                </a-row>
                <a-form-item label="已有外数">
                  <a-space direction="vertical" style="width: 100%">
                    <a-space>
                       <a-button size="mini" @click="forceRefreshProducts">刷新外数列表</a-button>
                       <span style="font-size: 12px; color: #86909c">当前外数总数: {{ products.length }}</span>
                    </a-space>
                    <a-select v-model="selectedExternalIds" multiple allow-clear allow-search :options="externalOptions" placeholder="选择一个或多个外数" style="width: 100%" />
                  </a-space>
                </a-form-item>
                <div class="step-actions"><a-space><a-button @click="skipUpload">跳过上传</a-button></a-space></div>
            </a-collapse-item>
          </a-collapse>
          <a-collapse :bordered="false">
            <a-collapse-item key="external" header="外数信息配置">
              <a-alert type="info" content="已选择外数后，在此维护价格体系与备注。" style="margin-bottom:8px" />
              <a-divider orientation="left">按外数维护价格与备注</a-divider>
              <template v-if="selectedExternalIds.length">
                <a-tabs v-model:active-key="activeExternalId">
                  <a-tab-pane v-for="extId in selectedExternalIds" :key="String(extId)" :title="externalLabel(extId)">
                    <a-row :gutter="12">
                      <a-col :span="12"><a-form-item label="计费方式" required><a-select v-model="externalConfigs[String(extId)].billingMode"><a-option value="查得计费">查得计费</a-option><a-option value="查询计费">查询计费</a-option></a-select></a-form-item></a-col>
                      <a-col :span="12"><a-form-item label="计费类型" required><a-select v-model="externalConfigs[String(extId)].billingType" @change="onBillingTypeChange(String(extId))"><a-option value="fixed">固定单价计费</a-option><a-option value="tiered">阶梯条件计费</a-option><a-option value="special">特殊计费</a-option></a-select></a-form-item></a-col>
                    </a-row>
                    <a-row :gutter="12">
                      <a-col :span="12"><a-form-item label="基础单价" v-if="externalConfigs[String(extId)].billingType === 'fixed'" required><a-input-number v-model="externalConfigs[String(extId)].basePrice" :min="0" :precision="4" style="width:100%" /></a-form-item></a-col>
                    </a-row>
                    <a-row :gutter="12">
                      <a-col :span="12"><a-form-item label="免费调用次数"><a-input-number v-model="externalConfigs[String(extId)].freeQuotaValue" :min="0" style="width:100%" /></a-form-item></a-col>
                      <a-col :span="12"><a-form-item label="免费量有效期"><a-range-picker v-model="externalConfigs[String(extId)].freeQuotaRange" style="width:100%" /></a-form-item></a-col>
                    </a-row>
                    <a-row :gutter="12" v-if="externalConfigs[String(extId)].billingType === 'tiered'">
                      <a-col :span="24">
                        <a-space style="margin-bottom:8px">
                          <a-button type="outline" @click="addTier(String(extId))">新增用量区间</a-button>
                    <a-dropdown @select="onTierMenuSelect(String(extId), $event)">
                            <a-button type="text">更多</a-button>
                            <template #content><a-doption value="copyPrev">复制上一行</a-doption><a-doption value="batch">批量添加</a-doption><a-doption value="clear">清空所有</a-doption></template>
                          </a-dropdown>
                          <a-divider direction="vertical" />
                          <span style="color: var(--color-text-3); font-size: 12px;">阶梯计费区间为闭区间不重叠，格式 [下限, 上限]，下一行下限=上一行上限+1</span>
                        </a-space>
                        <a-table :data="externalConfigs[String(extId)].tiers || []" :pagination="false" row-key="idx">
                          <template #columns>
                            <a-table-column title="下限（含）" :width="140">
                              <template #cell="{ record, rowIndex }">
                                <a-input-number 
                                  v-model="record.lower" 
                                  :disabled="true"
                                  style="width:100%" 
                                  placeholder="自动计算" />
                              </template>
                            </a-table-column>
                            <a-table-column title="上限（含）" :width="140">
                              <template #cell="{ record, rowIndex }">
                                <template v-if="rowIndex === (externalConfigs[String(extId)].tiers?.length || 0) - 1">
                                  <a-input value="∞" disabled style="width:100%; text-align: center;" />
                                </template>
                                <template v-else>
                                  <a-input-number 
                                    v-model="record.upper" 
                                    :min="record.lower + 1" 
                                    style="width:100%" 
                                    @change="updateTierLimits(String(extId))" />
                                </template>
                              </template>
                            </a-table-column>
                            <a-table-column title="区间范围" :width="160">
                              <template #cell="{ record, rowIndex }">
                                <span style="color: var(--color-text-2); font-size: 12px;">
                                  {{ formatTierRange(record, rowIndex === (externalConfigs[String(extId)].tiers?.length || 0) - 1) }}
                                </span>
                              </template>
                            </a-table-column>
                            <a-table-column title="单价" :width="120"><template #cell="{ record }"><a-input-number v-model="record.price" :min="0" :precision="4" style="width:100%" /></template></a-table-column>
                            <a-table-column title="操作" :width="100">
                              <template #cell="{ rowIndex }">
                                <a-button size="mini" status="danger" @click="removeTier(String(extId), rowIndex)" :disabled="getTierCount(String(extId)) <= 2">删除</a-button>
                              </template>
                            </a-table-column>
                          </template>
                        </a-table>
                        <a-alert type="warning" v-if="!tierValid(externalConfigs[String(extId)].tiers)" content="阶梯计费至少需要2个区间，请确保每个区间单价有效" style="margin-top:8px" />
                      </a-col>
                    </a-row>
                    <a-form-item label="备注补充"><a-textarea v-model="externalConfigs[String(extId)].remark" :rows="3" placeholder="合同特殊说明、例外条款、计费口径补充等" /></a-form-item>
                  </a-tab-pane>
                </a-tabs>
              </template>
              <template v-else><a-empty description="暂无外数，请在上方选择已有外数后进行配置" /></template>
              <div class="step-actions"><a-space><a-button type="primary" @click="submit">保存并创建合同</a-button></a-space></div>
            </a-collapse-item>
          </a-collapse>
        </a-form>
        <a-modal v-model:visible="batchVisible" title="批量生成用量区间" :width="520" @ok="applyBatch" @cancel="batchVisible=false">
          <a-form :model="batchParams" layout="vertical">
            <a-row :gutter="12">
              <a-col :span="12"><a-form-item label="起始下限" field="startLower" required><a-input-number v-model="batchParams.startLower" :min="0" style="width:100%" /></a-form-item></a-col>
              <a-col :span="12"><a-form-item label="区间宽度" field="width" required><a-input-number v-model="batchParams.width" :min="1" style="width:100%" /></a-form-item></a-col>
            </a-row>
            <a-row :gutter="12">
              <a-col :span="12"><a-form-item label="段数" field="count" required><a-input-number v-model="batchParams.count" :min="1" :max="50" style="width:100%" /></a-form-item></a-col>
              <a-col :span="6"><a-form-item label="基础单价" field="basePrice" required><a-input-number v-model="batchParams.basePrice" :min="0" :precision="4" style="width:100%" /></a-form-item></a-col>
              <a-col :span="6"><a-form-item label="每段递增" field="priceDelta"><a-input-number v-model="batchParams.priceDelta" :min="0" :precision="4" style="width:100%" /></a-form-item></a-col>
            </a-row>
          </a-form>
        </a-modal>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { IconUpload } from '@arco-design/web-vue/es/icon'
import { useContractStore } from '@/modules/budget/stores/contract'
import { useExternalDataStore } from '@/modules/external-data/stores/external-data'

const router = useRouter()
const store = useContractStore()
const externalStore = useExternalDataStore()
const formRef = ref()
const uploadProgress = ref(0)
const skipUploadSelected = ref(false)

const forceRefreshProducts = async () => {
  console.log('[Debug] 手动触发刷新外数列表')
  await externalStore.fetchProducts()
  console.log('[Debug] 手动刷新完成，当前 Store 长度:', externalStore.products.length)
}

watch(() => externalStore.products, (val) => {
  console.log('[Debug] Component Watcher: Store products changed, new length:', val?.length)
}, { deep: true })

const frameworkOptions = computed(() => store.frameworkOptions)
const supplementOptions = computed(() => store.supplementOptions || [])
const supplierOptions = computed(() => {
  // 1. 优先从 Store 的产品列表中提取所有去重的 supplier
  const s1 = (products.value || []).map((p: any) => String(p.supplier || '')).filter(Boolean)
  
  // 2. 结合 Contract Store 里的现有合同 supplier
  const s2 = (store.list || []).map((c: any) => String(c.supplier || '')).filter(Boolean)
  
  // 3. 去重并排序
  const uniqueSuppliers = Array.from(new Set([...s1, ...s2])).sort()
  
  // 4. 仅当没有任何数据时才使用 fallback，避免干扰
  const fallback = ['百行','朴道','钱塘','学信网']
  const base = uniqueSuppliers.length ? uniqueSuppliers : fallback
  
  return base.map(s => ({ label: s, value: s }))
})
const filteredFrameworkOptions = computed(() => {
  const sup = String(form.supplier || '')
  return (frameworkOptions.value || []).filter((f: any) => !sup || String(f.supplier || '') === sup)
})
const filteredSupplementOptions = computed(() => {
  const sup = String(form.supplier || '')
  return (supplementOptions.value || []).filter((s: any) => !sup || String(s.supplier || '') === sup)
})
const products = computed(() => externalStore.products || [])
const externalOptions = computed(() => {
  const sup = String(form.supplier || '').trim()
  const allProducts = products.value || []
  console.log('[Debug] 重新计算 externalOptions')
  console.log('[Debug] 当前选择的征信机构 (sup):', `"${sup}"`)
  console.log('[Debug] Store 中的产品总数 (allProducts.length):', allProducts.length)
  
  if (allProducts.length > 0) {
    const firstProd = allProducts[0]
    console.log('[Debug] 第一个产品样本:', {
      name: firstProd.name,
      supplier: `"${firstProd.supplier}"`,
      supplierType: typeof firstProd.supplier
    })
  }

  const base = allProducts.filter((p: any) => {
    const pSup = String(p.supplier || '').trim()
    const match = !sup || pSup === sup
    if (sup && !match && allProducts.indexOf(p) < 3) {
       console.log(`[Debug] 过滤排除: 产品供应商 "${pSup}" != 目标 "${sup}"`)
    }
    return match
  })
  
  console.log('[Debug] 过滤后的可选产品数 (base.length):', base.length)
  
  return base.map((p: any) => ({
    label: `${p.name}（${p.supplier || '—'}/${p.channel || '—'}）`,
    value: p.id
  }))
})
const selectedExternalIds = ref<Array<string | number>>([])
const activeExternalId = ref<string | number | undefined>(undefined)
const externalConfigs = reactive<Record<string, any>>({})
const externalLabel = (id: string | number) => { const p = products.value.find((x: any) => String(x.id) === String(id)); return p ? `${p.name}（${p.supplier || '—'}/${p.channel || '—'}）` : String(id) }

const form = reactive<any>({
  contractType: 'framework',
  fileList: [],
  shortName: '',
  fullName: '',
  contractNo: '',
  amount: undefined,
  signDate: undefined,
  isGroupPurchase: false,
  supplier: '',
  frameworkIds: [] as Array<string>,
  supplementIds: [] as Array<string>
})

const rules = {
  contractType: [{ required: true, message: '请选择合同类型' }],
  fileList: [{ validator: (_: any, val: any, cb: any) => { if (skipUploadSelected.value) return cb(); if (!Array.isArray(val) || !val.length) return cb('请上传合同文件'); cb() } }],
  shortName: [{ required: true, message: '请输入合同简称' }],
  fullName: [{ required: true, message: '请输入合同全称' }],
  amount: [{ required: true, message: '请输入合同总金额' }],
  signDate: [{ required: true, message: '请选择签订日期' }],
  supplier: [{ required: true, message: '请输入征信机构' }],
  frameworkIds: [{ validator: (_: any, val: any, cb: any) => { if (form.contractType === 'supplement' && (!Array.isArray(val) || val.length === 0)) return cb('请选择关联框架合同'); cb() } }]
}

const goBack = () => router.push('/budget/contracts')
const skipUpload = () => { Message.info('已跳过上传'); skipUploadSelected.value = true }
// 供应商变更后，联动清空关联数据
watch(() => form.supplier, (val) => {
  if (Array.isArray(form.frameworkIds)) form.frameworkIds = []
  if (Array.isArray(form.supplementIds)) form.supplementIds = []
  selectedExternalIds.value = []
  activeExternalId.value = undefined
  Object.keys(externalConfigs).forEach(k => { delete externalConfigs[k] })
})
// 计费类型变更时的处理
const onBillingTypeChange = (extKey: string) => {
  const cfg = externalConfigs[extKey]
  if (!cfg) return
  
  // 切换到阶梯计费时，确保至少有2行
  if (cfg.billingType === 'tiered' && (!Array.isArray(cfg.tiers) || cfg.tiers.length < 2)) {
    cfg.tiers = [
      { lower: 0, upper: 1000, price: cfg.basePrice || 0 },
      { lower: 1001, upper: Infinity, price: cfg.basePrice || 0 }
    ]
  }
}

function ensureConfigFor(extKey: string) {
  const p = products.value.find((x: any) => String(x.id) === String(extKey))
  const cfg = externalConfigs[extKey] || (externalConfigs[extKey] = {})
  if (!cfg.billingMode) cfg.billingMode = (p?.channel === '文件批量') ? '查得计费' : '查询计费'
  if (!cfg.billingType) cfg.billingType = 'fixed'
  if (cfg.basePrice == null && typeof p?.unitPrice === 'number') cfg.basePrice = Number(p.unitPrice)
  if (!Array.isArray(cfg.tiers)) cfg.tiers = []
  if (!cfg.remark) cfg.remark = ''
  
  // 如果是阶梯计费且没有区间，初始化2行
  if (cfg.billingType === 'tiered' && cfg.tiers.length === 0) {
    cfg.tiers = [
      { lower: 0, upper: 1000, price: 0 },
      { lower: 1000, upper: Infinity, price: 0 }
    ]
  }
}
watch(selectedExternalIds, (ids) => {
  const selProducts = ids.map(id => products.value.find((p: any) => String(p.id) === String(id))).filter(Boolean) as any[]
  const selSuppliers = Array.from(new Set(selProducts.map(p => String(p.supplier || '')))).filter(Boolean)
  if (!form.supplier) {
    if (selSuppliers.length === 1) {
      form.supplier = selSuppliers[0]
      Message.success(`已自动将征信机构设为：${form.supplier}`)
    } else if (selSuppliers.length > 1) {
      Message.warning('所选外数包含多个征信机构，请先选择统一的征信机构')
    }
  } else {
    const filtered = ids.filter(id => {
      const p = products.value.find((x: any) => String(x.id) === String(id))
      return !p || String(p.supplier || '') === String(form.supplier || '')
    })
    if (filtered.length !== ids.length) {
      selectedExternalIds.value = filtered
      Message.warning('已过滤与当前征信机构不一致的外数')
    }
  }
  selectedExternalIds.value.forEach(id => ensureConfigFor(String(id)))
  if (!selectedExternalIds.value.length) {
    activeExternalId.value = undefined
  } else if (!activeExternalId.value || !selectedExternalIds.value.some(id => String(id) === String(activeExternalId.value))) {
    activeExternalId.value = selectedExternalIds.value[0]
  }
})

const addTier = (extKey: string) => {
  const cfg = externalConfigs[extKey] || (externalConfigs[extKey] = { billingMode: '', billingType: '', basePrice: undefined, tiers: [], remark: '' })
  if (!Array.isArray(cfg.tiers)) cfg.tiers = []
  
  // 确保至少有2行
  if (cfg.tiers.length === 0) {
    // 添加第一行: 0 - 1000
    cfg.tiers.push({ lower: 0, upper: 1000, price: 0 })
    // 添加第二行: 1001 - Infinity
    cfg.tiers.push({ lower: 1001, upper: Infinity, price: 0 })
  } else {
    // 在倒数第二行后插入新行
    const lastIdx = cfg.tiers.length - 1
    const prevUpper = lastIdx > 0 ? cfg.tiers[lastIdx - 1].upper : 0
    const newLower = prevUpper + 1
    const newUpper = newLower + 1000
    cfg.tiers.splice(lastIdx, 0, { lower: newLower, upper: newUpper, price: 0 })
    // 更新最后一行的下限
    cfg.tiers[cfg.tiers.length - 1].lower = newUpper + 1
  }
  updateTierLimits(extKey)
}

const removeTier = (extKey: string, idx: number) => {
  const cfg = externalConfigs[extKey]
  if (cfg && Array.isArray(cfg.tiers) && cfg.tiers.length > 2) {
    cfg.tiers.splice(idx, 1)
    updateTierLimits(extKey)
  }
}

// 更新所有区间的上下限，确保连续
const updateTierLimits = (extKey: string) => {
  const cfg = externalConfigs[extKey]
  if (!cfg || !Array.isArray(cfg.tiers) || cfg.tiers.length === 0) return
  
  // 首行下限固定为0
  cfg.tiers[0].lower = 0
  
  // 确保区间连续：下一行的下限 = 上一行的上限 + 1
  for (let i = 1; i < cfg.tiers.length; i++) {
    cfg.tiers[i].lower = cfg.tiers[i - 1].upper + 1
  }
  
  // 末行上限为无穷大
  cfg.tiers[cfg.tiers.length - 1].upper = Infinity
}

// 获取区间数量
const getTierCount = (extKey: string) => {
  const tiers = externalConfigs[extKey]?.tiers
  return Array.isArray(tiers) ? tiers.length : 0
}

// 格式化区间范围显示（闭区间）
const formatTierRange = (record: any, isLast: boolean) => {
  const lower = record.lower
  const upper = isLast ? '∞' : record.upper
  return `[${lower}, ${upper}]`
}
const onTierMenuSelect = (extKey: string, key: string | number) => {
  const t = externalConfigs[extKey]?.tiers || (externalConfigs[extKey].tiers = [])
  if (key === 'copyPrev') {
    // 在倒数第二行后插入新行
    if (t.length < 2) {
      addTier(extKey)
    } else {
      const lastIdx = t.length - 1
      const prevTier = t[lastIdx - 1]
      const newUpper = prevTier.upper + 1000
      t.splice(lastIdx, 0, { lower: prevTier.upper, upper: newUpper, price: prevTier.price })
      updateTierLimits(extKey)
    }
  } else if (key === 'batch') {
    batchTargetExt.value = extKey
    batchVisible.value = true
  } else if (key === 'clear') {
    // 清空时至少保留2行
    externalConfigs[extKey].tiers = []
    addTier(extKey)
  }
}

const tierValid = (tiers: Array<any>) => {
  if (!Array.isArray(tiers) || tiers.length < 2) return false
  // 检查每个区间的单价是否有效
  return tiers.every((r: any) => typeof r.price === 'number' && r.price >= 0)
}
const batchVisible = ref(false)
const batchTargetExt = ref<string>('')
const batchParams = reactive<{ startLower: number; width: number; count: number; basePrice: number; priceDelta: number }>({ startLower: 0, width: 1000, count: 3, basePrice: 0, priceDelta: 0 })
const applyBatch = () => {
  const key = batchTargetExt.value
  const cfg = externalConfigs[key]
  if (!cfg) {
    batchVisible.value = false
    return
  }
  
  const list: any[] = []
  const count = Math.max(2, Number(batchParams.count || 2)) // 至少2个区间
  
  for (let i = 0; i < count - 1; i++) {
    const lower = i === 0 ? Number(batchParams.startLower) : (Number(batchParams.startLower) + i * Number(batchParams.width) + i)
    const upper = lower + Number(batchParams.width)
    const price = Number(batchParams.basePrice) + i * Number(batchParams.priceDelta || 0)
    list.push({ lower, upper, price })
  }
  
  // 最后一行：上限为无穷大
  const lastLower = list[list.length - 1].upper + 1
  const lastPrice = Number(batchParams.basePrice) + (count - 1) * Number(batchParams.priceDelta || 0)
  list.push({ lower: lastLower, upper: Infinity, price: lastPrice })
  
  cfg.tiers = list
  updateTierLimits(key)
  batchVisible.value = false
}

const normalizeTiers = (extKey: string) => {
  const cfg = externalConfigs[extKey]
  if (!cfg || !Array.isArray(cfg.tiers) || cfg.tiers.length === 0) return
  
  // 确保至少2行
  if (cfg.tiers.length < 2) {
    while (cfg.tiers.length < 2) {
      const lastUpper = cfg.tiers.length > 0 ? cfg.tiers[cfg.tiers.length - 1].upper : 0
      cfg.tiers.push({ lower: lastUpper, upper: lastUpper + 1000, price: 0 })
    }
  }
  
  // 过滤并排序
  cfg.tiers = cfg.tiers
    .filter((r: any) => typeof r.price === 'number')
    .map((r: any) => ({
      lower: Number(r.lower) || 0,
      upper: r.upper === Infinity ? Infinity : (Number(r.upper) || 0),
      price: Number(r.price) || 0
    }))
    .sort((a: any, b: any) => a.lower - b.lower)
  
  // 强制连续区间
  updateTierLimits(extKey)
}

const submit = async () => {
  try { await formRef.value?.validate() } catch { return }
  if (!selectedExternalIds.value.length) { Message.error('请至少选择一个外数进行关联'); return }
  // 校验征信机构一致性
  const mismatched = selectedExternalIds.value.some((id) => {
    const p = products.value.find((x: any) => String(x.id) === String(id))
    return p && String(p.supplier || '') !== String(form.supplier || '')
  })
  if (mismatched) { Message.error('所选外数与当前征信机构不一致，请调整'); return }
  
  // 存储外数价格配置到 Store
  selectedExternalIds.value.forEach((id: string | number) => {
    const key = String(id)
    normalizeTiers(key)
    store.updatePricing(id, externalConfigs[key])
  })

  const payload = {
    id: `C-${Date.now()}`,
    contractType: form.contractType,
    contractNo: form.contractNo,
    contractName: form.fullName,
    supplier: form.supplier,
    amount: Number(form.amount || 0),
    startDate: new Date(form.signDate || Date.now()).toISOString(),
    endDate: new Date(Date.now() + 180*86400000).toISOString(),
    status: 'active' as const,
    frameworkId: form.contractType === 'supplement' ? (form.frameworkIds?.[0] ?? null) : null,
    supplementIds: form.contractType === 'framework' ? (form.supplementIds || []) : []
  }
  const ok = await store.createContract(payload)
  if (ok) { Message.success('合同已创建'); router.push('/budget/contracts') } else { Message.error('创建合同失败') }
}

onMounted(async () => {
  // 加载合同列表（用于关联框架合同和补充协议）
  await store.fetchContractList()
  // 加载外数产品列表
  if (!externalStore.products.length) {
    await externalStore.fetchProducts()
  }
})
const beforeUpload = (file: any) => { const okType = ['application/pdf','application/msword'].includes(file.type) || /\.docx?$|\.pdf$/i.test(file.name); const okSize = file.size <= 10 * 1024 * 1024; if (!okType) { Message.error('仅支持 PDF / Word 文件'); return false } if (!okSize) { Message.error('文件大小应不超过 10MB'); return false } return true }
</script>

<style scoped>
.contract-create { width: 100%; max-width: none; padding: 0 16px; }
.page-header { margin-bottom: 12px; }
.header-sub { color: var(--color-text-2); }
.actions { margin-top: 12px; text-align: right; }
.upload-area { height: 160px; }
.upload-content { display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; }
.upload-icon { font-size: 32px; margin-bottom: 8px; }
.upload-text { font-size: 14px; }
.upload-highlight { color: var(--color-primary); font-weight: 600; }
.upload-hint { color: var(--color-text-3); font-size: 12px; }
.step-actions { margin-top: 8px; text-align: right; }
</style>
