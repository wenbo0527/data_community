<template>
  <div class="supplier-pricing">
    <div class="page-header">
      <div class="header-content">
        <div class="header-info">
          <h2>供应商定价档案管理</h2>
          <p class="page-description">统一管理供应商产品定价档案，支持多种计费模式和阶梯定价</p>
        </div>
        <div class="header-actions">
          <a-space>
            <a-button type="primary" @click="showCreatePricing = true">
              <template #icon><icon-plus /></template>
              新增定价档案
            </a-button>
            <a-button type="outline" @click="exportPricings">
              <template #icon><icon-download /></template>
              导出数据
            </a-button>
          </a-space>
        </div>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <a-card class="toolbar" :bordered="true">
      <a-form :model="filters" layout="inline">
        <a-form-item field="supplierId" label="供应商">
          <a-select
            v-model="filters.supplierId"
            allow-clear
            placeholder="选择供应商"
            style="width: 200px"
            @change="loadPricings"
          >
            <a-option
              v-for="supplier in suppliers"
              :key="supplier.id"
              :value="supplier.id"
            >
              {{ supplier.supplierName }}
            </a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="productCode" label="产品编码">
          <a-input
            v-model="filters.productCode"
            allow-clear
            placeholder="产品编码"
            style="width: 160px"
            @press-enter="applyFilter"
          />
        </a-form-item>
        <a-form-item field="billingType" label="计费类型">
          <a-select
            v-model="filters.billingType"
            allow-clear
            placeholder="选择类型"
            style="width="140px"
          >
            <a-option value="fixed">固定单价</a-option>
            <a-option value="tiered">阶梯定价</a-option>
            <a-option value="volume">量量折扣</a-option>
            <a-option value="subscription">订阅制</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="status" label="状态">
          <a-select
            v-model="filters.status"
            allow-clear
            placeholder="选择状态"
            style="width: 120px"
          >
            <a-option value="active">生效</a-option>
            <a-option value="inactive">失效</a-option>
            <a-option value="draft">草稿</a-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="applyFilter">
            <template #icon><icon-search /></template>
            查询
          </a-button>
          <a-button style="margin-left: 8px" @click="resetFilter">
            重置
          </a-button>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 定价档案列表 -->
    <a-card title="定价档案列表" :bordered="true" :loading="loading">
      <a-table
        :data="displayedPricings"
        row-key="id"
        :pagination="pagination"
        @page-change="onPageChange"
      >
        <template #columns>
          <a-table-column title="供应商" :width="180">
            <template #cell="{ record }">
              {{ getSupplierName(record.supplierId) }}
            </template>
          </a-table-column>
          <a-table-column title="产品编码" data-index="productCode" :width="120" />
          <a-table-column title="产品名称" data-index="productName" :width="200" />
          <a-table-column title="计费类型" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getBillingTypeColor(record.billingType)">
                {{ getBillingTypeLabel(record.billingType) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="计费模式" :width="100">
            <template #cell="{ record }">
              {{ getBillingModeLabel(record.billingMode) }}
            </template>
          </a-table-column>
          <a-table-column title="基础单价" :width="100">
            <template #cell="{ record }">
              {{ formatCurrency(record.unitPrice) }}
            </template>
          </a-table-column>
          <a-table-column title="币种" data-index="currency" :width="80" />
          <a-table-column title="生效日期" :width="120">
            <template #cell="{ record }">
              {{ formatDate(record.effectiveDate) }}
            </template>
          </a-table-column>
          <a-table-column title="失效日期" :width="120">
            <template #cell="{ record }">
              {{ formatDate(record.expireDate) }}
            </template>
          </a-table-column>
          <a-table-column title="状态" :width="80">
            <template #cell="{ record }">
              <a-tag :status="getStatusStatus(record.status)">
                {{ getStatusLabel(record.status) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="税率" :width="80">
            <template #cell="{ record }">
              {{ record.taxRate ? `${(record.taxRate * 100).toFixed(1)}%` : '-' }}
            </template>
          </a-table-column>
          <a-table-column title="结算周期" :width="100">
            <template #cell="{ record }">
              {{ getSettlementCycleLabel(record.settlementCycle) }}
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="150" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-button size="small" type="text" @click="openDetail(record)">
                  详情
                </a-button>
                <a-button size="small" type="text" @click="openEdit(record)">
                  编辑
                </a-button>
                <a-popconfirm
                  content="确认删除该定价档案？"
                  @ok="deletePricing(record)"
                >
                  <a-button size="small" type="text" status="danger">
                    删除
                  </a-button>
                </a-popconfirm>
              </a-space>
            </template>
          </a-table-column>
        </template>
        <template #empty>
          <a-empty description="暂无定价档案数据" />
        </template>
      </a-table>
    </a-card>

    <!-- 定价档案详情/编辑弹窗 -->
    <a-modal
      v-model:visible="detailVisible"
      :title="editingPricing ? '编辑定价档案' : '定价档案详情'"
      :width="800"
      :ok-text="editingPricing ? '保存' : '关闭'"
      :cancel-text="editingPricing ? '取消' : '关闭'"
      @ok="savePricing"
    >
      <a-form :model="pricingForm" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item
              field="supplierId"
              label="供应商"
              :rules="[{ required: true, message: '请选择供应商' }]"
            >
              <a-select
                v-model="pricingForm.supplierId"
                placeholder="选择供应商"
                :disabled="!editingPricing"
              >
                <a-option
                  v-for="supplier in suppliers"
                  :key="supplier.id"
                  :value="supplier.id"
                >
                  {{ supplier.supplierName }}
                </a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item
              field="productCode"
              label="产品编码"
              :rules="[{ required: true, message: '请输入产品编码' }]"
            >
              <a-input
                v-model="pricingForm.productCode"
                placeholder="请输入产品编码"
                :disabled="!editingPricing"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item
              field="productName"
              label="产品名称"
              :rules="[{ required: true, message: '请输入产品名称' }]"
            >
              <a-input
                v-model="pricingForm.productName"
                placeholder="请输入产品名称"
                :disabled="!editingPricing"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item
              field="billingType"
              label="计费类型"
              :rules="[{ required: true, message: '请选择计费类型' }]"
            >
              <a-select
                v-model="pricingForm.billingType"
                placeholder="选择计费类型"
                :disabled="!editingPricing"
                @change="onBillingTypeChange"
              >
                <a-option value="fixed">固定单价</a-option>
                <a-option value="tiered">阶梯定价</a-option>
                <a-option value="volume">量量折扣</a-option>
                <a-option value="subscription">订阅制</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item
              field="billingMode"
              label="计费模式"
              :rules="[{ required: true, message: '请选择计费模式' }]"
            >
              <a-select
                v-model="pricingForm.billingMode"
                placeholder="选择计费模式"
                :disabled="!editingPricing"
              >
                <a-option value="per_call">按次</a-option>
                <a-option value="per_record">按条</a-option>
                <a-option value="per_gb">按GB</a-option>
                <a-option value="monthly">按月</a-option>
                <a-option value="yearly">按年</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item
              field="unitPrice"
              label="基础单价"
              :rules="[{ required: true, message: '请输入基础单价' }]"
            >
              <a-input-number
                v-model="pricingForm.unitPrice"
                :min="0"
                :precision="4"
                style="width: 100%"
                :disabled="!editingPricing"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item field="currency" label="币种">
              <a-select
                v-model="pricingForm.currency"
                placeholder="选择币种"
                :disabled="!editingPricing"
              >
                <a-option value="CNY">人民币</a-option>
                <a-option value="USD">美元</a-option>
                <a-option value="EUR">欧元</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item field="taxRate" label="税率">
              <a-input-number
                v-model="pricingForm.taxRate"
                :min="0"
                :max="1"
                :precision="4"
                style="width: 100%"
                :disabled="!editingPricing"
              >
                <template #suffix>%</template>
              </a-input-number>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item field="status" label="状态">
              <a-select
                v-model="pricingForm.status"
                placeholder="选择状态"
                :disabled="!editingPricing"
              >
                <a-option value="active">生效</a-option>
                <a-option value="inactive">失效</a-option>
                <a-option value="draft">草稿</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item
              field="effectiveDate"
              label="生效日期"
              :rules="[{ required: true, message: '请选择生效日期' }]"
            >
              <a-date-picker
                v-model="pricingForm.effectiveDate"
                style="width: 100%"
                :disabled="!editingPricing"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item
              field="expireDate"
              label="失效日期"
              :rules="[{ required: true, message: '请选择失效日期' }]"
            >
              <a-date-picker
                v-model="pricingForm.expireDate"
                style="width: 100%"
                :disabled="!editingPricing"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="settlementCycle" label="结算周期">
              <a-select
                v-model="pricingForm.settlementCycle"
                placeholder="选择结算周期"
                :disabled="!editingPricing"
              >
                <a-option value="monthly">月度</a-option>
                <a-option value="quarterly">季度</a-option>
                <a-option value="yearly">年度</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="paymentTerms" label="付款账期（天）">
              <a-input-number
                v-model="pricingForm.paymentTerms"
                :min="0"
                :max="365"
                style="width: 100%"
                :disabled="!editingPricing"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item field="remark" label="备注">
          <a-textarea
            v-model="pricingForm.remark"
            :rows="3"
            placeholder="请输入备注"
            :disabled="!editingPricing"
          />
        </a-form-item>

        <!-- 阶梯定价配置 -->
        <div v-if="pricingForm.billingType === 'tiered' && editingPricing">
          <a-divider orientation="left">阶梯定价配置</a-divider>
          <a-table :data="pricingForm.tiers" :pagination="false">
            <template #columns>
              <a-table-column title="下限" :width="120">
                <template #cell="{ rowIndex }">
                  <a-input-number
                    v-model="pricingForm.tiers[rowIndex].lower"
                    :min="0"
                    style="width: 100%"
                  />
                </template>
              </a-table-column>
              <a-table-column title="上限" :width="120">
                <template #cell="{ rowIndex }">
                  <a-input-number
                    v-model="pricingForm.tiers[rowIndex].upper"
                    :min="pricingForm.tiers[rowIndex].lower"
                    style="width: 100%"
                  />
                </template>
              </a-table-column>
              <a-table-column title="单价" :width="120">
                <template #cell="{ rowIndex }">
                  <a-input-number
                    v-model="pricingForm.tiers[rowIndex].price"
                    :min="0"
                    :precision="4"
                    style="width: 100%"
                  />
                </template>
              </a-table-column>
              <a-table-column title="单位" :width="100">
                <template #cell="{ rowIndex }">
                  <a-input
                    v-model="pricingForm.tiers[rowIndex].unit"
                    placeholder="如：次、条、GB"
                  />
                </template>
              </a-table-column>
              <a-table-column title="操作" :width="80">
                <template #cell="{ rowIndex }">
                  <a-button
                    size="small"
                    type="text"
                    status="danger"
                    @click="removeTier(rowIndex)"
                  >
                    删除
                  </a-button>
                </template>
              </a-table-column>
            </template>
          </a-table>
          <a-button
            type="outline"
            size="small"
            style="margin-top: 8px"
            @click="addTier"
          >
            <template #icon><icon-plus /></template>
            添加阶梯
          </a-button>
        </div>

        <!-- 量量折扣配置 -->
        <div v-if="pricingForm.billingType === 'volume' && editingPricing">
          <a-divider orientation="left">量量折扣配置</a-divider>
          <a-table :data="pricingForm.volumeDiscounts" :pagination="false">
            <template #columns>
              <a-table-column title="最小数量" :width="120">
                <template #cell="{ rowIndex }">
                  <a-input-number
                    v-model="pricingForm.volumeDiscounts[rowIndex].minVolume"
                    :min="0"
                    style="width: 100%"
                  />
                </template>
              </a-table-column>
              <a-table-column title="最大数量" :width="120">
                <template #cell="{ rowIndex }">
                  <a-input-number
                    v-model="pricingForm.volumeDiscounts[rowIndex].maxVolume"
                    :min="pricingForm.volumeDiscounts[rowIndex].minVolume"
                    style="width: 100%"
                  />
                </template>
              </a-table-column>
              <a-table-column title="折扣率" :width="120">
                <template #cell="{ rowIndex }">
                  <a-input-number
                    v-model="pricingForm.volumeDiscounts[rowIndex].discountRate"
                    :min="0"
                    :max="1"
                    :precision="4"
                    style="width: 100%"
                  >
                    <template #suffix>%</template>
                  </a-input-number>
                </template>
              </a-table-column>
              <a-table-column title="折扣类型" :width="120">
                <template #cell="{ rowIndex }">
                  <a-select
                    v-model="pricingForm.volumeDiscounts[rowIndex].discountType"
                    style="width: 100%"
                  >
                    <a-option value="percentage">百分比</a-option>
                    <a-option value="fixed">固定金额</a-option>
                  </a-select>
                </template>
              </a-table-column>
              <a-table-column title="操作" :width="80">
                <template #cell="{ rowIndex }">
                  <a-button
                    size="small"
                    type="text"
                    status="danger"
                    @click="removeVolumeDiscount(rowIndex)"
                  >
                    删除
                  </a-button>
                </template>
              </a-table-column>
            </template>
          </a-table>
          <a-button
            type="outline"
            size="small"
            style="margin-top: 8px"
            @click="addVolumeDiscount"
          >
            <template #icon><icon-plus /></template>
            添加折扣
          </a-button>
        </div>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import type { SupplierPricing, PricingTier, VolumeDiscount } from '../types/supplier'
import type { Supplier } from '../types/supplier'
import {
  getSupplierPricings,
  createSupplierPricing,
  updateSupplierPricing,
  deleteSupplierPricing,
  getSupplierDictionary
} from '../api/supplier'
import { IconPlus, IconDownload, IconSearch } from '@arco-design/web-vue/es/icon'

// 响应式数据
const loading = ref(false)
const pricings = ref<SupplierPricing[]>([])
const suppliers = ref<Supplier[]>([])

// 筛选条件
const filters = reactive({
  supplierId: '',
  productCode: '',
  billingType: '',
  status: '',
  page: 1,
  pageSize: 10
})

// 分页
const pagination = reactive({
  total: 0,
  pageSize: 10,
  current: 1,
  showTotal: true
})

// 弹窗状态
const detailVisible = ref(false)
const editingPricing = ref(false)
const currentPricing = ref<SupplierPricing | null>(null)

// 表单数据
const pricingForm = reactive({
  supplierId: '',
  productCode: '',
  productName: '',
  billingType: 'fixed' as const,
  billingMode: 'per_call' as const,
  currency: 'CNY' as const,
  unitPrice: 0,
  minPrice: undefined as number | undefined,
  maxPrice: undefined as number | undefined,
  effectiveDate: '',
  expireDate: '',
  status: 'active' as const,
  tiers: [] as PricingTier[],
  volumeDiscounts: [] as VolumeDiscount[],
  taxRate: 0.06,
  settlementCycle: 'monthly' as const,
  paymentTerms: 30,
  remark: '',
  createdBy: '管理员',
  updatedBy: '管理员'
})

// 计算属性
const displayedPricings = computed(() => {
  let list = pricings.value

  // 供应商筛选
  if (filters.supplierId) {
    list = list.filter(p => p.supplierId === filters.supplierId)
  }

  // 产品编码筛选
  if (filters.productCode) {
    const code = filters.productCode.toLowerCase()
    list = list.filter(p => p.productCode.toLowerCase().includes(code))
  }

  // 计费类型筛选
  if (filters.billingType) {
    list = list.filter(p => p.billingType === filters.billingType)
  }

  // 状态筛选
  if (filters.status) {
    list = list.filter(p => p.status === filters.status)
  }

  return list
})

const supplierMap = computed(() => {
  const map = new Map<string, string>()
  suppliers.value.forEach(s => {
    map.set(s.id, s.supplierName)
  })
  return map
})

// 方法
const loadPricings = async () => {
  loading.value = true
  try {
    const res = await getSupplierPricings(filters)
    pricings.value = res.list || []
    pagination.total = res.total || 0
    Message.success('定价档案加载成功')
  } catch (error) {
    Message.error('定价档案加载失败')
    console.error('Load pricings error:', error)
  } finally {
    loading.value = false
  }
}

const loadSuppliers = async () => {
  try {
    const res = await getSupplierDictionary()
    suppliers.value = res || []
  } catch (error) {
    Message.error('供应商数据加载失败')
    console.error('Load suppliers error:', error)
  }
}

const applyFilter = () => {
  pagination.current = 1
  loadPricings()
}

const resetFilter = () => {
  filters.supplierId = ''
  filters.productCode = ''
  filters.billingType = ''
  filters.status = ''
  applyFilter()
}

const onPageChange = (page: number) => {
  pagination.current = page
  filters.page = page
  loadPricings()
}

const getSupplierName = (supplierId: string) => {
  return supplierMap.value.get(supplierId) || '-'
}

const openDetail = (pricing: SupplierPricing) => {
  currentPricing.value = pricing
  editingPricing.value = false
  loadPricingForm(pricing)
  detailVisible.value = true
}

const openEdit = (pricing: SupplierPricing) => {
  currentPricing.value = pricing
  editingPricing.value = true
  loadPricingForm(pricing)
  detailVisible.value = true
}

const loadPricingForm = (pricing: SupplierPricing) => {
  Object.assign(pricingForm, {
    supplierId: pricing.supplierId,
    productCode: pricing.productCode,
    productName: pricing.productName,
    billingType: pricing.billingType,
    billingMode: pricing.billingMode,
    currency: pricing.currency,
    unitPrice: pricing.unitPrice,
    minPrice: pricing.minPrice,
    maxPrice: pricing.maxPrice,
    effectiveDate: pricing.effectiveDate,
    expireDate: pricing.expireDate,
    status: pricing.status,
    tiers: pricing.tiers ? [...pricing.tiers] : [],
    volumeDiscounts: pricing.volumeDiscounts ? [...pricing.volumeDiscounts] : [],
    taxRate: pricing.taxRate || 0,
    settlementCycle: pricing.settlementCycle,
    paymentTerms: pricing.paymentTerms,
    remark: pricing.remark || ''
  })
}

const savePricing = async () => {
  if (!editingPricing.value) {
    detailVisible.value = false
    return
  }

  try {
    if (currentPricing.value) {
      // 编辑模式
      await updateSupplierPricing(currentPricing.value.id, pricingForm)
      Message.success('定价档案更新成功')
    } else {
      // 新增模式
      await createSupplierPricing(pricingForm)
      Message.success('定价档案创建成功')
    }
    
    detailVisible.value = false
    resetPricingForm()
    loadPricings()
  } catch (error) {
    Message.error('定价档案保存失败')
    console.error('Save pricing error:', error)
  }
}

const deletePricing = async (pricing: SupplierPricing) => {
  try {
    await deleteSupplierPricing(pricing.id)
    Message.success('定价档案删除成功')
    loadPricings()
  } catch (error) {
    Message.error('定价档案删除失败')
    console.error('Delete pricing error:', error)
  }
}

const onBillingTypeChange = () => {
  if (pricingForm.billingType === 'tiered' && !pricingForm.tiers.length) {
    addTier()
  } else if (pricingForm.billingType === 'volume' && !pricingForm.volumeDiscounts.length) {
    addVolumeDiscount()
  }
}

const addTier = () => {
  pricingForm.tiers.push({
    lower: 0,
    upper: 1000,
    price: pricingForm.unitPrice,
    unit: '次'
  })
}

const removeTier = (index: number) => {
  pricingForm.tiers.splice(index, 1)
}

const addVolumeDiscount = () => {
  pricingForm.volumeDiscounts.push({
    minVolume: 1000,
    maxVolume: 10000,
    discountRate: 0.05,
    discountType: 'percentage'
  })
}

const removeVolumeDiscount = (index: number) => {
  pricingForm.volumeDiscounts.splice(index, 1)
}

const resetPricingForm = () => {
  Object.assign(pricingForm, {
    supplierId: '',
    productCode: '',
    productName: '',
    billingType: 'fixed',
    billingMode: 'per_call',
    currency: 'CNY',
    unitPrice: 0,
    minPrice: undefined,
    maxPrice: undefined,
    effectiveDate: '',
    expireDate: '',
    status: 'active',
    tiers: [],
    volumeDiscounts: [],
    taxRate: 0.06,
    settlementCycle: 'monthly',
    paymentTerms: 30,
    remark: ''
  })
  currentPricing.value = null
  editingPricing.value = false
}

const exportPricings = () => {
  const headers = [
    '供应商', '产品编码', '产品名称', '计费类型', '计费模式',
    '基础单价', '币种', '生效日期', '失效日期', '状态', '税率', '结算周期'
  ]
  const rows = displayedPricings.value.map(p => [
    getSupplierName(p.supplierId),
    p.productCode,
    p.productName,
    getBillingTypeLabel(p.billingType),
    getBillingModeLabel(p.billingMode),
    p.unitPrice,
    p.currency,
    formatDate(p.effectiveDate),
    formatDate(p.expireDate),
    getStatusLabel(p.status),
    p.taxRate ? `${(p.taxRate * 100).toFixed(1)}%` : '-',
    getSettlementCycleLabel(p.settlementCycle)
  ])
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `supplier-pricings-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
  Message.success('定价档案数据导出成功')
}

// 工具函数
const getBillingTypeLabel = (type: string) => {
  const labels = {
    fixed: '固定单价',
    tiered: '阶梯定价',
    volume: '量量折扣',
    subscription: '订阅制'
  }
  return labels[type as keyof typeof labels] || type
}

const getBillingTypeColor = (type: string) => {
  const colors = {
    fixed: 'blue',
    tiered: 'green',
    volume: 'orange',
    subscription: 'purple'
  }
  return colors[type as keyof typeof colors] || 'default'
}

const getBillingModeLabel = (mode: string) => {
  const labels = {
    per_call: '按次',
    per_record: '按条',
    per_gb: '按GB',
    monthly: '按月',
    yearly: '按年'
  }
  return labels[mode as keyof typeof labels] || mode
}

const getStatusLabel = (status: string) => {
  const labels = {
    active: '生效',
    inactive: '失效',
    draft: '草稿'
  }
  return labels[status as keyof typeof labels] || status
}

const getStatusStatus = (status: string) => {
  const statuses = {
    active: 'success',
    inactive: 'default',
    draft: 'warning'
  }
  return statuses[status as keyof typeof statuses] as any || 'default'
}

const getSettlementCycleLabel = (cycle: string) => {
  const labels = {
    monthly: '月度',
    quarterly: '季度',
    yearly: '年度'
  }
  return labels[cycle as keyof typeof labels] || cycle
}

const formatDate = (date: string) => {
  try {
    return new Date(date).toLocaleDateString('zh-CN')
  } catch {
    return '-'
  }
}

const formatCurrency = (amount: number) => {
  try {
    return `¥${amount.toFixed(4)}`
  } catch {
    return '-'
  }
}

// 生命周期
onMounted(() => {
  loadSuppliers()
  loadPricings()
})
</script>

<style scoped>
.supplier-pricing {
  padding: 16px;
}

.page-header {
  margin-bottom: 16px;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-info h2 {
  margin: 0 0 8px;
}

.page-description {
  color: var(--color-text-2);
  margin: 0;
}

.toolbar {
  margin-bottom: 16px;
}
</style>