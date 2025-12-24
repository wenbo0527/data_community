<template>
  <div class="contract-create">
    <a-page-header
      title="新建合同"
      :breadcrumb="{ routes: [{ path: '/risk/budget-overview', breadcrumbName: '预算管理' }, { path: '/risk/budget/contracts', breadcrumbName: '合同管理' }, { path: '', breadcrumbName: '新建合同' }] }"
    >
      <template #extra>
        <a-button @click="goBack">返回</a-button>
      </template>
      <template #content>
        <div class="header-sub">参考企业后台规范：分步表单、明确校验与固定操作栏</div>
      </template>
    </a-page-header>
    

    <a-row :gutter="12">
      <a-col :span="24">
      <a-form ref="formRef" :model="form" :rules="rules" layout="vertical" :size="'large'" :validate-on-change="true">
        <a-collapse :bordered="false">
          <a-collapse-item key="contract" header="合同信息与上传">
        

        <template v-if="currentStep === 0">
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
                <a-upload drag
                  :show-file-list="true"
                  v-model:file-list="form.fileList"
                  :auto-upload="false"
                  accept=".pdf,.doc,.docx"
                  :before-upload="beforeUpload"
                  class="upload-area"
                >
                  <div class="upload-content">
                    <icon-upload class="upload-icon" />
                    <p class="upload-text">拖拽文件到此处或<span class="upload-highlight"> 点击上传</span></p>
                    <p class="upload-hint">支持PDF、Word格式，单个文件不超过10MB</p>
                    <a-progress v-if="uploadProgress > 0" :percent="uploadProgress" :show-text="false" />
                  </div>
                </a-upload>
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="12">
            <a-col :span="12">
              <a-form-item field="shortName" label="合同简称" required>
                <a-input v-model="form.shortName" placeholder="简洁标识合同" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item field="contractNo" label="合同编号">
                <a-input v-model="form.contractNo" placeholder="HT-2025-001" />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="12">
            <a-col :span="24">
              <a-form-item field="fullName" label="合同全称" required>
                <a-input v-model="form.fullName" placeholder="完整规范名称，需与上传文件一致" />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="12">
            <a-col :span="8">
              <a-form-item field="amount" label="合同总金额" required>
                <a-input-number v-model="form.amount" :min="0" :step="1000" style="width:100%" />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item field="signDate" label="签订日期" required>
                <a-date-picker v-model="form.signDate" style="width:100%" />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item field="isGroupPurchase" label="总行代采" required>
                <a-switch v-model="form.isGroupPurchase" />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="12">
            <a-col :span="12">
              <a-form-item field="supplier" label="对接渠道" required>
                <a-input v-model="form.supplier" placeholder="例如：美团 / 蚂蚁" />
              </a-form-item>
            </a-col>
            <a-col :span="12" v-if="form.contractType === 'supplement'">
              <a-form-item field="frameworkIds" label="关联框架合同" required>
                <a-select v-model="form.frameworkIds" multiple placeholder="选择一个或多个框架合同">
                  <a-option v-for="f in frameworkOptions" :key="f.value" :value="f.value">{{ f.label }}</a-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>
        </template>
          </a-collapse-item>
        </a-collapse>

        <a-collapse :bordered="false">
          <a-collapse-item key="external" header="外数信息配置">
          <a-alert type="info" content="选择或新建外数，并维护价格体系与备注。以上信息均归属单一外数。" style="margin-bottom:8px" />
          <a-card class="filter-card" title="选择已有外数">
          <a-form :model="externalFilter" layout="inline">
            <a-form-item field="keyword" label="关键词">
                <a-input v-model="externalFilter.keyword" allow-clear placeholder="名称/对接渠道" />
            </a-form-item>
              <a-form-item>
                <a-button type="primary" @click="filterProducts">筛选</a-button>
                <a-button style="margin-left:8px" @click="resetProducts">重置</a-button>
              </a-form-item>
            </a-form>
            <a-form-item label="已有外数">
              <a-select v-model="selectedExternalIds" multiple allow-clear placeholder="选择一个或多个外数" style="width: 100%">
                <a-option v-for="p in filteredProducts" :key="p.id" :value="p.id">{{ p.name }}（{{ p.supplier || p.provider || '—' }}）</a-option>
              </a-select>
            </a-form-item>
            <a-alert v-if="selectedExternalIds.length" type="success" content="已选择外数，价格体系与备注将按外数逐一维护" />
            <a-alert v-if="!selectedExternalIds.length" type="warning" content="请至少选择一个外数进行关联" />
          </a-card>
          <!-- 新建外数不支持，简化为仅选择已有外数 -->

          <a-divider orientation="left">按外数维护价格与备注</a-divider>
          <template v-if="selectedExternalIds.length">
            <a-tabs v-model:active-key="activeExternalId">
              <a-tab-pane v-for="extId in selectedExternalIds" :key="String(extId)" :title="externalLabel(extId)">
              <a-row :gutter="12">
                <a-col :span="12">
                  <a-form-item label="计费方式" required>
                    <a-select v-model="externalConfigs[String(extId)].billingMode" placeholder="选择计费方式">
                      <a-option value="查得计费">查得计费</a-option>
                      <a-option value="查询计费">查询计费</a-option>
                    </a-select>
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="计费类型" required>
                    <a-select v-model="externalConfigs[String(extId)].billingType" placeholder="选择计费类型">
                      <a-option value="fixed">固定单价计费</a-option>
                      <a-option value="tiered">阶梯条件计费</a-option>
                      <a-option value="special">特殊计费</a-option>
                    </a-select>
                  </a-form-item>
                </a-col>
              </a-row>
              <a-row :gutter="12">
                <a-col :span="12">
                  <a-form-item label="基础单价" v-if="externalConfigs[String(extId)].billingType === 'fixed'" required>
                    <a-input-number v-model="externalConfigs[String(extId)].basePrice" :min="0" :precision="4" style="width:100%" />
                  </a-form-item>
                </a-col>
              </a-row>
              <a-row :gutter="12">
                <a-col :span="12">
                  <a-form-item label="免费调用次数">
                    <a-input-number v-model="externalConfigs[String(extId)].freeQuotaValue" :min="0" style="width:100%" />
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="免费量有效期">
                    <a-range-picker v-model="externalConfigs[String(extId)].freeQuotaRange" style="width:100%" />
                  </a-form-item>
                </a-col>
              </a-row>
              <a-row :gutter="12" v-if="externalConfigs[String(extId)].billingType === 'tiered'">
                <a-col :span="24">
                  <a-space style="margin-bottom:8px">
                    <a-button type="outline" @click="addTier(String(extId))">新增用量区间</a-button>
                    <a-dropdown @select="(k)=>onTierMenuSelect(String(extId), k)">
                      <a-button type="text">更多</a-button>
                      <template #content>
                        <a-doption value="copyPrev">复制上一行</a-doption>
                        <a-doption value="batch">批量添加</a-doption>
                        <a-doption value="clear">清空所有</a-doption>
                      </template>
                    </a-dropdown>
                    <a-divider direction="vertical" />
                    <span>连续区间</span>
                    <a-switch v-model="externalConfigs[String(extId)].tierContinuous" />
                  </a-space>
                  <a-table :data="externalConfigs[String(extId)].tiers || []" :pagination="false" row-key="idx">
                    <template #columns>
                      <a-table-column title="下限" :width="160">
                        <template #cell="{ record }">
                          <a-input-number v-model="record.lower" :min="0" style="width:100%" />
                        </template>
                      </a-table-column>
                      <a-table-column title="上限" :width="160">
                        <template #cell="{ record }">
                          <a-input-number v-model="record.upper" :min="0" style="width:100%" />
                        </template>
                      </a-table-column>
                      <a-table-column title="单价" :width="160">
                        <template #cell="{ record }">
                          <a-input-number v-model="record.price" :min="0" :precision="4" style="width:100%" />
                        </template>
                      </a-table-column>
                      <a-table-column title="操作" :width="200">
                        <template #cell="{ rowIndex }">
                          <a-space>
                            <a-button size="mini" @click="moveTier(String(extId), rowIndex, -1)">上移</a-button>
                            <a-button size="mini" @click="moveTier(String(extId), rowIndex, 1)">下移</a-button>
                            <a-button size="mini" status="danger" @click="removeTier(String(extId), rowIndex)">删除</a-button>
                          </a-space>
                        </template>
                      </a-table-column>
                    </template>
                  </a-table>
                  <a-alert type="warning" v-if="!tierValid(externalConfigs[String(extId)].tiers)" content="请确保每个区间上限大于下限，且单价有效" style="margin-top:8px" />
                  <a-descriptions :column="3" :data="tierPreview(String(extId))" style="margin-top:8px" />
                </a-col>
              </a-row>
              
              <a-form-item label="备注补充">
                <a-textarea v-model="externalConfigs[String(extId)].remark" :rows="3" placeholder="合同特殊说明、例外条款、计费口径补充等" />
              </a-form-item>
              </a-tab-pane>
            </a-tabs>
          </template>
          <template v-else>
            <a-empty description="暂无外数，请在上方选择已有外数后进行配置" />
          </template>
          </a-collapse-item>
        </a-collapse>
      </a-form>
      <a-modal v-model:visible="batchVisible" title="批量生成用量区间" :width="520" @ok="applyBatch" @cancel="batchVisible=false">
        <a-form :model="batchParams" layout="vertical">
          <a-row :gutter="12">
            <a-col :span="12">
              <a-form-item label="起始下限" field="startLower" required>
                <a-input-number v-model="batchParams.startLower" :min="0" style="width:100%" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="区间宽度" field="width" required>
                <a-input-number v-model="batchParams.width" :min="1" style="width:100%" />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="12">
            <a-col :span="12">
              <a-form-item label="段数" field="count" required>
                <a-input-number v-model="batchParams.count" :min="1" :max="50" style="width:100%" />
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item label="基础单价" field="basePrice" required>
                <a-input-number v-model="batchParams.basePrice" :min="0" :precision="4" style="width:100%" />
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item label="每段递增" field="priceDelta">
                <a-input-number v-model="batchParams.priceDelta" :min="0" :precision="4" style="width:100%" />
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </a-modal>
      </a-col>
    </a-row>

    <div class="actions sticky">
      <a-space>
        <a-button @click="goBack">取消</a-button>
        <a-button type="primary" @click="submit">保存并创建合同</a-button>
      </a-space>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useRouter, onBeforeRouteLeave } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { useContractStore } from '@/modules/budget/stores/contract'
import { useExternalDataStore } from '@/modules/external-data/stores/external-data'
import { IconUpload } from '@arco-design/web-vue/es/icon'
import { Modal } from '@arco-design/web-vue'

const router = useRouter()
const store = useContractStore()
const externalStore = useExternalDataStore()
const currentStep = ref(0)
const formRef = ref()
const acceptTypes = 'application/pdf,application/msword,.doc,.docx'
const uploadProgress = ref(0)
const skipUploadSelected = ref(false)
const newExternalList: any[] = []

const frameworkOptions = computed(() => store.frameworkOptions)
const products = computed(() => externalStore.products || [])
const externalFilter = reactive({ keyword: '' })
const filteredProducts = computed(() => {
  const k = externalFilter.keyword.trim().toLowerCase()
  const list = products.value
  if (!k) return list
  return list.filter((p: any) => String(p.name||'').toLowerCase().includes(k) || String(p.supplier||p.provider||'').toLowerCase().includes(k))
})
const selectedExternalIds = ref<Array<string | number>>([])
const activeExternalId = ref<string | number | undefined>(undefined)
const externalConfigs = reactive<Record<string, any>>({})
// 仅支持选择已有外数
const filterProducts = () => {}
const resetProducts = () => { externalFilter.keyword = '' }
  watch(selectedExternalIds, (ids: Array<string | number>) => { if (ids.length && !activeExternalId.value) activeExternalId.value = String(ids[0]); ids.forEach((id: string | number) => { const key = String(id); if (!externalConfigs[key]) externalConfigs[key] = { billingMode: '', billingType: '', basePrice: undefined, tiers: [] as Array<{ lower: number; upper: number; price: number }>, remark: '', freeQuotaValue: undefined, freeQuotaRange: [] as Array<string | Date> } }) })
const externalLabel = (id: string | number) => { const p = products.value.find((x: any) => String(x.id) === String(id)); return p ? `${p.name}（${p.supplier || p.provider || '—'}）` : String(id) }
  // 标签标题直接使用已有外数信息
  // 右侧进度与检查清单已移除

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
  external: {
    name: '',
    billingMode: '',
    billingType: '',
    basePrice: undefined,
    tierLower: undefined,
    tierUpper: undefined,
    hasDiscount: false,
    discountPrice: undefined,
    discountCount: undefined,
    discountStart: undefined,
    discountEnd: undefined,
    remark: ''
  }
})

const rules = {
  contractType: [{ required: true, message: '请选择合同类型' }],
  fileList: [{ validator: (_: any, val: any, cb: any) => { if (!Array.isArray(val) || !val.length) return cb('请上传合同文件'); cb() } }],
  shortName: [{ required: true, message: '请输入合同简称' }],
  fullName: [{ required: true, message: '请输入合同全称' }],
  contractNo: [],
  amount: [{ required: true, message: '请输入合同总金额' }],
  signDate: [{ required: true, message: '请选择签订日期' }],
  supplier: [{ required: true, message: '请输入对接渠道' }],
  frameworkIds: [{ validator: (_: any, val: any, cb: any) => { if (form.contractType === 'supplement' && (!Array.isArray(val) || val.length === 0)) return cb('请选择关联框架合同'); cb() } }],
  'external.name': [{ required: true, message: '请输入外数协议名称' }],
  'external.billingMode': [{ required: true, message: '请选择计费方式' }],
  'external.billingType': [{ required: true, message: '请选择计费类型' }],
  'external.basePrice': [{ required: true, message: '请输入基础单价' }],
  'external.tierLower': [{ required: true, message: '请输入阶梯下限' }],
  'external.tierUpper': [{ required: true, message: '请输入阶梯上限' }],
  'external.discountPrice': [{ validator: (_: any, v: any, cb: any) => { if (form.external.hasDiscount && (v === undefined || v === null)) return cb('请输入优惠单价'); cb() } }],
  'external.discountCount': [{ validator: (_: any, v: any, cb: any) => { if (form.external.hasDiscount && (v === undefined || v === null)) return cb('请输入优惠条数'); cb() } }],
  'external.discountStart': [{ validator: (_: any, v: any, cb: any) => { if (form.external.hasDiscount && !v) return cb('请选择优惠开始日期'); cb() } }],
  'external.discountEnd': [{ validator: (_: any, v: any, cb: any) => { if (form.external.hasDiscount && !v) return cb('请选择优惠结束日期'); if (form.external.discountStart && v && new Date(v).getTime() <= new Date(form.external.discountStart).getTime()) return cb('结束日期需晚于开始日期'); cb() } }]
}

const stepTitle = computed(() => ['合同信息与上传','外数信息配置'][currentStep.value])

const validateCurrentStep = async () => {
  if (currentStep.value === 0) {
    try { await formRef.value?.validateField(['contractType'] as any) } catch { return false }
    if (!(skipUploadSelected && Array.isArray(form.fileList))) {
      try { await formRef.value?.validateField(['fileList'] as any) } catch { return false }
    }
    try { await formRef.value?.validateField(['shortName','fullName','amount','signDate','supplier', ...(form.contractType === 'supplement' ? ['frameworkId'] : [])] as any) } catch { return false }
    return true
  }
  if (currentStep.value === 1) {
    const hasExisting = selectedExternalIds.value.length > 0
    const hasNew = newExternalList.length > 0
    if (!hasExisting && !hasNew) {
      try { await formRef.value?.validateField(['external.name','external.billingMode','external.billingType'] as any) } catch { return false }
      const c = form.external
      if (c.billingType === 'fixed') { if (typeof c.basePrice !== 'number') return false }
      if (c.billingType === 'tiered') { return false }
      if (c.billingType === 'special') { if (!String(c.remark||'').length) return false }
      return true
    }
    if (hasExisting) {
      const okExisting = selectedExternalIds.value.every((id) => {
        const c = externalConfigs[String(id)] || {}
        if (!c.billingMode || !c.billingType) return false
        if (c.billingType === 'fixed') {
          if (typeof c.basePrice !== 'number') return false
        }
        if (c.billingType === 'tiered') {
          const tiers = Array.isArray(c.tiers) ? c.tiers : []
          if (!tiers.length) return false
          return tiers.every(t => typeof t.lower === 'number' && typeof t.upper === 'number' && typeof t.price === 'number' && t.upper > t.lower)
        }
        if (c.billingType === 'special') {
          if (!String(c.remark || '').length) return false
        }
        const range = c.freeQuotaRange
        if (Array.isArray(range) && range.length === 2 && range[0] && range[1]) {
          if (new Date(range[1]).getTime() <= new Date(range[0]).getTime()) return false
        }
        return true
      })
      if (!okExisting) return false
    }
    if (hasNew) {
      const okNewBase = newExternalList.every((n) => !!n.name && !!n.billingMode && !!n.billingType)
      if (!okNewBase) return false
      const okNewPrice = newExternalList.every((n) => {
        const c = externalConfigs[n.id] || {}
        if (n.billingType === 'fixed') {
          if (typeof c.basePrice !== 'number') return false
        }
        if (n.billingType === 'tiered') {
          const tiers = Array.isArray(c.tiers) ? c.tiers : []
          if (!tiers.length) return false
          if (!tiers.every(t => typeof t.lower === 'number' && typeof t.upper === 'number' && typeof t.price === 'number' && t.upper > t.lower)) return false
        }
        if (n.billingType === 'special') {
          if (!String(c.remark || '').length) return false
        }
        return true
      })
      if (!okNewPrice) return false
    }
    return true
    return true
  }
  return true
}
const nextStep = async () => { const ok = await validateCurrentStep(); if (ok) currentStep.value = Math.min(1, currentStep.value + 1) }
const prevStep = () => { currentStep.value = Math.max(0, currentStep.value - 1) }
const goBack = () => router.push('/risk/budget/contracts')
const skipUpload = () => { Message.info('已跳过上传'); skipUploadSelected.value = true }
const addTier = (extKey: string) => { const cfg = externalConfigs[extKey] || (externalConfigs[extKey] = { billingMode: '', billingType: '', basePrice: undefined, tiers: [], remark: '' }); if (!Array.isArray(cfg.tiers)) cfg.tiers = []; cfg.tiers.push({ lower: 0, upper: 0, price: 0 }) }
const removeTier = (extKey: string, idx: number) => { const cfg = externalConfigs[extKey]; if (cfg && Array.isArray(cfg.tiers)) cfg.tiers.splice(idx, 1) }
const moveTier = (extKey: string, idx: number, delta: number) => { const t = externalConfigs[extKey]?.tiers; if (!Array.isArray(t)) return; const ni = idx + delta; if (ni < 0 || ni >= t.length) return; const tmp = t[idx]; t[idx] = t[ni]; t[ni] = tmp }
const onTierMenuSelect = (extKey: string, key: string | number) => { const t = externalConfigs[extKey]?.tiers || (externalConfigs[extKey].tiers = []); if (key === 'copyPrev') { const last = t[t.length - 1]; const lower = last ? Number(last.upper) : 0; const upper = lower + 1000; const price = last ? Number(last.price) : 0; t.push({ lower, upper, price }) } else if (key === 'batch') { batchTargetExt.value = extKey; batchVisible.value = true } else if (key === 'clear') { externalConfigs[extKey].tiers = [] } }
const tierValid = (tiers: Array<any>) => Array.isArray(tiers) && tiers.length > 0 && tiers.every((r: any) => typeof r.lower === 'number' && typeof r.upper === 'number' && typeof r.price === 'number' && r.upper > r.lower)
const batchVisible = ref(false)
const batchTargetExt = ref<string>('')
const batchParams = reactive<{ startLower: number; width: number; count: number; basePrice: number; priceDelta: number }>({ startLower: 0, width: 1000, count: 3, basePrice: 0, priceDelta: 0 })
const applyBatch = () => { const key = batchTargetExt.value; const cfg = externalConfigs[key]; if (!cfg) { batchVisible.value = false; return } const list: any[] = []; for (let i = 0; i < Math.max(1, Number(batchParams.count || 1)); i++) { const lower = Number(batchParams.startLower) + i * Number(batchParams.width); const upper = lower + Number(batchParams.width); const price = Number(batchParams.basePrice) + i * Number(batchParams.priceDelta || 0); list.push({ lower, upper, price }) } cfg.tiers = [...(cfg.tiers || []), ...list]; batchVisible.value = false }
const tierPreview = (extKey: string) => { const t = externalConfigs[extKey]?.tiers || []; const cnt = t.length; const minP = t.reduce((m: any, r: any) => Math.min(m, Number(r.price||Infinity)), Infinity); const maxP = t.reduce((m: any, r: any) => Math.max(m, Number(r.price||0)), 0); return [{ label: '区间数量', value: String(cnt) }, { label: '最低单价', value: minP===Infinity ? '—' : String(minP) }, { label: '最高单价', value: cnt? String(maxP) : '—' }] }
const normalizeTiers = (extKey: string) => { const cfg = externalConfigs[extKey]; if (!cfg || !Array.isArray(cfg.tiers)) return; cfg.tiers = cfg.tiers.filter((r: any) => Number(r.upper) > Number(r.lower)).map((r: any) => ({ lower: Number(r.lower), upper: Number(r.upper), price: Number(r.price) })).sort((a: any, b: any) => a.lower - b.lower); if (cfg.tierContinuous) { for (let i = 1; i < cfg.tiers.length; i++) { cfg.tiers[i].lower = cfg.tiers[i-1].upper } } }

const submit = async () => {
  const ok = await formRef.value?.validate()
  if (!ok) return
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
    frameworkIds: form.contractType === 'supplement' ? (form.frameworkIds ?? []) : []
  }
  if (!selectedExternalIds.value.length) {
    Message.error('请至少选择一个外数进行关联')
    return
  }
  // 提交前对各外数的阶梯区间做规范化处理
  selectedExternalIds.value.forEach((id: string | number) => normalizeTiers(String(id)))
  const okCreate = await store.createContract(payload)
  if (okCreate) {
    const assoc = [] as Array<{ id: string }>
    selectedExternalIds.value.forEach((id: string | number) => {
      assoc.push({ id: String(id) })
      const cfg = externalConfigs[String(id)] || {}
      const start = Array.isArray(cfg.freeQuotaRange) && cfg.freeQuotaRange[0] ? new Date(cfg.freeQuotaRange[0]).toISOString() : undefined
      const end = Array.isArray(cfg.freeQuotaRange) && cfg.freeQuotaRange[1] ? new Date(cfg.freeQuotaRange[1]).toISOString() : undefined
      store.updatePricing(String(id), { billingMode: cfg.billingMode, billingType: cfg.billingType, basePrice: cfg.basePrice, tiers: cfg.tiers, remark: cfg.remark, freeQuotaValue: cfg.freeQuotaValue, freeQuotaStart: start, freeQuotaEnd: end })
    })
    if (!assoc.length) {
      Message.error('外数关联缺失，请选择或新增外数后再保存')
      return
    }
    store.updateAssociations(payload.id, assoc)
    Message.success('合同已创建')
    router.push('/risk/budget/contracts')
  } else {
    Message.error('创建合同失败')
  }
}

externalStore.fetchProducts().catch(() => {})
const beforeUpload = (file: any) => { const okType = ['application/pdf','application/msword'].includes(file.type) || /\.docx?$|\.pdf$/i.test(file.name); const okSize = file.size <= 10 * 1024 * 1024; if (!okType) { Message.error('仅支持 PDF / Word 文件'); return false } if (!okSize) { Message.error('文件大小应不超过 10MB'); return false } return true }
onBeforeRouteLeave((to, from, next) => { const hasChanges = !!form.contractNo || (form.fileList||[]).length>0 || !!form.shortName || !!form.external.name; if (hasChanges) { Modal.confirm({ title: '确认离开？', content: '当前填写内容尚未保存，离开将丢失修改', onOk: () => next(), onCancel: () => next(false) }) } else { next() } })
</script>

<style scoped>
.contract-create { width: 100%; max-width: none; padding: 0 16px; }
.page-header { margin-bottom: 12px; }
.header-sub { color: var(--color-text-2); }
.desc { color: var(--color-text-2); }
.help-text { color: var(--color-text-2); font-size: 12px; margin-top: 6px; }
.actions { margin-top: 12px; text-align: right; }
.actions.sticky { position: sticky; bottom: 0; background: var(--color-bg-2); padding: 8px 12px; border-top: 1px solid var(--color-border); }
.upload-area { height: 160px; }
.upload-content { display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; }
.upload-icon { font-size: 32px; margin-bottom: 8px; }
.upload-text { font-size: 14px; }
.upload-highlight { color: var(--color-primary); font-weight: 600; }
.upload-hint { color: var(--color-text-3); font-size: 12px; }
.step-actions { margin-top: 8px; }
</style>
