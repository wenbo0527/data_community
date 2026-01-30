<template>
  <div class="supplier-management">
    <div class="page-header">
      <div class="header-content">
        <div class="header-info">
          <h2>供应商管理</h2>
          <p class="page-description">统一管理外部数据供应商信息，作为供应商信息的唯一真实来源</p>
        </div>
        <div class="header-actions">
          <a-space>
            <a-button type="primary" @click="showCreateSupplier = true">
              <template #icon><IconPlus /></template>
              新增供应商
            </a-button>
            <a-button type="outline" @click="exportSuppliers">
              <template #icon><IconDownload /></template>
              导出数据
            </a-button>
          </a-space>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <a-row :gutter="16" style="margin-bottom: 16px">
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="供应商总数"
            :value="stats.totalSuppliers"
            :precision="0"
            show-group-separator
          >
            <template #prefix><IconUser /></template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="活跃供应商"
            :value="stats.activeSuppliers"
            :precision="0"
            show-group-separator
          >
            <template #prefix><IconCheckCircle /></template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="数据提供商"
            :value="stats.dataProviders"
            :precision="0"
            show-group-separator
          >
            <template #prefix><IconStorage /></template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="平均信用评级"
            :value="stats.avgCreditRating"
            :precision="1"
          >
            <template #prefix><IconStar /></template>
          </a-statistic>
        </a-card>
      </a-col>
    </a-row>

    <!-- 搜索和筛选 -->
    <a-card class="toolbar" :bordered="true">
      <a-form :model="filters" layout="inline">
        <a-form-item field="keyword" label="关键词">
          <a-input
            v-model="filters.keyword"
            allow-clear
            placeholder="供应商名称/编码"
            style="width: 200px"
            @press-enter="applyFilter"
          />
        </a-form-item>
        <a-form-item field="supplierType" label="供应商类型">
          <a-select
            v-model="filters.supplierType"
            allow-clear
            placeholder="选择类型"
            style="width: 160px"
          >
            <a-option value="data_provider">数据提供商</a-option>
            <a-option value="service_provider">服务提供商</a-option>
            <a-option value="platform_provider">平台提供商</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="status" label="状态">
          <a-select
            v-model="filters.status"
            allow-clear
            placeholder="选择状态"
            style="width: 140px"
          >
            <a-option value="active">活跃</a-option>
            <a-option value="inactive">停用</a-option>
            <a-option value="suspended">暂停</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="creditRating" label="信用评级">
          <a-select
            v-model="filters.creditRating"
            allow-clear
            placeholder="选择评级"
            style="width: 140px"
          >
            <a-option :value="5">5星</a-option>
            <a-option :value="4">4星</a-option>
            <a-option :value="3">3星</a-option>
            <a-option :value="2">2星</a-option>
            <a-option :value="1">1星</a-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="applyFilter">
            <template #icon><IconSearch /></template>
            查询
          </a-button>
          <a-button style="margin-left: 8px" @click="resetFilter">
            重置
          </a-button>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 供应商列表 -->
    <a-card title="供应商列表" :bordered="true" :loading="loading">
      <a-table
        :data="displayedSuppliers"
        row-key="id"
        :pagination="pagination"
        @page-change="onPageChange"
      >
        <template #columns>
          <a-table-column title="供应商编码" data-index="supplierCode" :width="140" />
          <a-table-column title="供应商名称" :width="200">
            <template #cell="{ record }">
              <a-button type="text" @click="openDetail(record)">
                {{ record.supplierName }}
              </a-button>
            </template>
          </a-table-column>
          <a-table-column title="类型" :width="120">
            <template #cell="{ record }">
              <a-tag :color="getSupplierTypeColor(record.supplierType)">
                {{ getSupplierTypeLabel(record.supplierType) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="状态" :width="100">
            <template #cell="{ record }">
              <a-tag :status="getStatusStatus(record.status)">
                {{ getStatusLabel(record.status) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="信用评级" :width="120">
            <template #cell="{ record }">
              <a-rate
                :default-value="record.creditRating || 0"
                :count="5"
                allow-half
                readonly
                size="small"
              />
              <span style="margin-left: 8px">{{ record.creditRating || 0 }}</span>
            </template>
          </a-table-column>
          <a-table-column title="联系人" :width="140">
            <template #cell="{ record }">
              {{ record.contactInfo?.contactPerson || '-' }}
            </template>
          </a-table-column>
          <a-table-column title="联系电话" :width="140">
            <template #cell="{ record }">
              {{ record.contactInfo?.phone || '-' }}
            </template>
          </a-table-column>
          <a-table-column title="注册时间" :width="180">
            <template #cell="{ record }">
              {{ formatDate(record.registrationDate) }}
            </template>
          </a-table-column>
          <a-table-column title="标签" :width="200">
            <template #cell="{ record }">
              <a-space wrap>
                <a-tag v-for="tag in record.tags" :key="tag" size="small">
                  {{ tag }}
                </a-tag>
              </a-space>
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="200" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-button size="small" type="text" @click="openPricing(record)">
                  定价档案
                </a-button>
                <a-button size="small" type="text" @click="openEdit(record)">
                  编辑
                </a-button>
                <a-popconfirm
                  :content="`确认${record.status === 'active' ? '停用' : '启用'}该供应商？`"
                  @ok="toggleStatus(record)"
                >
                  <a-button size="small" type="text">
                    {{ record.status === 'active' ? '停用' : '启用' }}
                  </a-button>
                </a-popconfirm>
              </a-space>
            </template>
          </a-table-column>
        </template>
        <template #empty>
          <a-empty description="暂无供应商数据" />
        </template>
      </a-table>
    </a-card>

    <!-- 供应商详情抽屉 -->
    <a-drawer
      v-model:visible="detailVisible"
      :width="800"
      :title="currentSupplier ? `${currentSupplier.supplierName} - 详情` : '供应商详情'"
    >
      <a-space direction="vertical" style="width: 100%">
        <!-- 基础信息 -->
        <a-card title="基础信息">
          <a-descriptions :column="2" :data="detailBaseItems" bordered />
        </a-card>

        <!-- 联系信息 -->
        <a-card title="联系信息">
          <a-descriptions :column="2" :data="detailContactItems" bordered />
        </a-card>

        <!-- 业务信息 -->
        <a-card title="业务信息">
          <a-descriptions :column="2" :data="detailBusinessItems" bordered />
        </a-card>

        <!-- 关联产品 -->
        <a-card title="关联产品">
          <a-table :data="supplierProducts" :pagination="false">
            <template #columns>
              <a-table-column title="产品编码" data-index="productCode" :width="120" />
              <a-table-column title="产品名称" data-index="productName" :width="200" />
              <a-table-column title="分类" data-index="category" :width="120" />
              <a-table-column title="接口数" data-index="interfaceCount" :width="100" />
              <a-table-column title="合同状态" :width="100">
                <template #cell="{ record }">
                  <a-tag :status="record.hasContract ? 'success' : 'default'">
                    {{ record.hasContract ? '已关联' : '未关联' }}
                  </a-tag>
                </template>
              </a-table-column>
              <a-table-column title="状态" :width="100">
                <template #cell="{ record }">
                  <a-tag :status="record.status === 'active' ? 'success' : 'default'">
                    {{ record.status === 'active' ? '活跃' : '停用' }}
                  </a-tag>
                </template>
              </a-table-column>
            </template>
            <template #empty>
              <a-empty description="暂无关联产品" />
            </template>
          </a-table>
        </a-card>

        <!-- 状态变更记录 -->
        <a-card title="状态变更记录">
          <a-timeline>
            <a-timeline-item
              v-for="log in statusLogs"
              :key="log.id"
              :label="formatDateTime(log.createdAt)"
            >
              <div>状态变更：{{ getStatusLabel(log.fromStatus) }} → {{ getStatusLabel(log.toStatus) }}</div>
              <div v-if="log.reason">原因：{{ log.reason }}</div>
              <div>操作人：{{ log.createdBy }}</div>
            </a-timeline-item>
          </a-timeline>
          <a-empty v-if="!statusLogs.length" description="暂无状态变更记录" />
        </a-card>
      </a-space>
    </a-drawer>

    <!-- 新增/编辑供应商弹窗 -->
    <a-modal
      v-model:visible="showCreateSupplier"
      :title="editingSupplier ? '编辑供应商' : '新增供应商'"
      :width="600"
      ok-text="保存"
      cancel-text="取消"
      @ok="saveSupplier"
    >
      <a-form :model="supplierForm" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item
              field="supplierCode"
              label="供应商编码"
              :rules="[{ required: true, message: '请输入供应商编码' }]"
            >
              <a-input v-model="supplierForm.supplierCode" placeholder="请输入编码" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item
              field="supplierName"
              label="供应商名称"
              :rules="[{ required: true, message: '请输入供应商名称' }]"
            >
              <a-input v-model="supplierForm.supplierName" placeholder="请输入名称" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item
              field="supplierType"
              label="供应商类型"
              :rules="[{ required: true, message: '请选择供应商类型' }]"
            >
              <a-select v-model="supplierForm.supplierType" placeholder="选择类型">
                <a-option value="data_provider">数据提供商</a-option>
                <a-option value="service_provider">服务提供商</a-option>
                <a-option value="platform_provider">平台提供商</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="creditRating" label="信用评级">
              <a-rate v-model="supplierForm.creditRating" allow-half :count="5" />
              <span style="margin-left: 8px">{{ supplierForm.creditRating || 0 }}</span>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item
              field="contactInfo.company"
              label="公司名称"
              :rules="[{ required: true, message: '请输入公司名称' }]"
            >
              <a-input v-model="supplierForm.contactInfo.company" placeholder="请输入公司名称" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item
              field="contactInfo.contactPerson"
              label="联系人"
              :rules="[{ required: true, message: '请输入联系人' }]"
            >
              <a-input v-model="supplierForm.contactInfo.contactPerson" placeholder="请输入联系人" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item
              field="contactInfo.email"
              label="邮箱"
              :rules="[{ required: true, message: '请输入邮箱' }]"
            >
              <a-input v-model="supplierForm.contactInfo.email" placeholder="请输入邮箱" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item
              field="contactInfo.phone"
              label="电话"
              :rules="[{ required: true, message: '请输入电话' }]"
            >
              <a-input v-model="supplierForm.contactInfo.phone" placeholder="请输入电话" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item field="contactInfo.address" label="地址">
          <a-textarea v-model="supplierForm.contactInfo.address" :rows="2" placeholder="请输入地址" />
        </a-form-item>
        <a-form-item field="description" label="描述">
          <a-textarea v-model="supplierForm.description" :rows="3" placeholder="请输入描述" />
        </a-form-item>
        <a-form-item field="tags" label="标签">
          <a-input-tag
            v-model="supplierForm.tags"
            allow-clear
            placeholder="输入标签后回车添加"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import type { Supplier, SupplierProduct, SupplierStatusLog } from '../types/supplier'
import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  updateSupplierStatus,
  getSupplierProducts,
  getSupplierStatusLogs,
  getSupplierDictionary
} from '../api/supplier'
import { notifySupplierChange, registerDefaultListeners } from '../utils/supplierChangeNotifier'
import {
  IconPlus,
  IconDownload,
  IconUser,
  IconCheckCircle,
  IconStorage,
  IconStar,
  IconSearch
} from '@arco-design/web-vue/es/icon'
import DateUtils from '@/utils/dateUtils'

// 响应式数据
const loading = ref(false)
const suppliers = ref<Supplier[]>([])
const supplierProducts = ref<SupplierProduct[]>([])
const statusLogs = ref<SupplierStatusLog[]>([])

// 筛选条件
const filters = reactive({
  keyword: '',
  supplierType: '',
  status: '',
  creditRating: undefined as number | undefined,
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

// 统计数据
const stats = reactive({
  totalSuppliers: 0,
  activeSuppliers: 0,
  dataProviders: 0,
  avgCreditRating: 0
})

// 弹窗状态
const showCreateSupplier = ref(false)
const detailVisible = ref(false)
const editingSupplier = ref<Supplier | null>(null)
const currentSupplier = ref<Supplier | null>(null)

// 表单数据
const supplierForm = reactive({
  supplierCode: '',
  supplierName: '',
  supplierType: 'data_provider' as const,
  status: 'active' as const,
  creditRating: 3,
  registrationDate: new Date().toISOString(),
  contactInfo: {
    company: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: ''
  },
  tags: [] as string[],
  description: '',
  createdBy: '管理员',
  updatedBy: '管理员'
})

// 计算属性
const displayedSuppliers = computed(() => {
  let list = suppliers.value

  // 关键词筛选
  if (filters.keyword) {
    const keyword = filters.keyword.toLowerCase()
    list = list.filter(s => 
      s.supplierName.toLowerCase().includes(keyword) ||
      s.supplierCode.toLowerCase().includes(keyword)
    )
  }

  // 类型筛选
  if (filters.supplierType) {
    list = list.filter(s => s.supplierType === filters.supplierType)
  }

  // 状态筛选
  if (filters.status) {
    list = list.filter(s => s.status === filters.status)
  }

  // 信用评级筛选
  if (filters.creditRating) {
    list = list.filter(s => s.creditRating === filters.creditRating)
  }

  return list
})

const detailBaseItems = computed(() => {
  const s = currentSupplier.value
  if (!s) return []
  return [
    { label: '供应商编码', value: s.supplierCode },
    { label: '供应商名称', value: s.supplierName },
    { label: '类型', value: getSupplierTypeLabel(s.supplierType) },
    { label: '状态', value: getStatusLabel(s.status) },
    { label: '信用评级', value: s.creditRating?.toString() || '-' },
    { label: '注册时间', value: formatDate(s.registrationDate) },
    { label: '标签', value: s.tags.join(', ') || '-' },
    { label: '描述', value: s.description || '-' }
  ]
})

const detailContactItems = computed(() => {
  const s = currentSupplier.value
  if (!s?.contactInfo) return []
  return [
    { label: '公司名称', value: s.contactInfo.company },
    { label: '联系人', value: s.contactInfo.contactPerson },
    { label: '邮箱', value: s.contactInfo.email },
    { label: '电话', value: s.contactInfo.phone },
    { label: '地址', value: s.contactInfo.address }
  ]
})

const detailBusinessItems = computed(() => {
  const s = currentSupplier.value
  if (!s) return []
  return [
    { label: '营业执照号', value: s.businessLicense || '-' },
    { label: '税号', value: s.taxId || '-' },
    { label: '银行名称', value: s.bankInfo?.bankName || '-' },
    { label: '银行账号', value: s.bankInfo?.bankAccount || '-' }
  ]
})

// 方法
const loadSuppliers = async () => {
  loading.value = true
  try {
    const res = await getSuppliers(filters)
    suppliers.value = res.list || []
    pagination.total = res.total || 0
    
    // 更新统计数据
    updateStats()
    
    Message.success('供应商数据加载成功')
  } catch (error) {
    Message.error('供应商数据加载失败')
    console.error('Load suppliers error:', error)
  } finally {
    loading.value = false
  }
}

const updateStats = () => {
  stats.totalSuppliers = suppliers.value.length
  stats.activeSuppliers = suppliers.value.filter(s => s.status === 'active').length
  stats.dataProviders = suppliers.value.filter(s => s.supplierType === 'data_provider').length
  
  const ratings = suppliers.value.map(s => s.creditRating || 0).filter(r => r > 0)
  stats.avgCreditRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0
}

const applyFilter = () => {
  pagination.current = 1
  loadSuppliers()
}

const resetFilter = () => {
  filters.keyword = ''
  filters.supplierType = ''
  filters.status = ''
  filters.creditRating = undefined
  applyFilter()
}

const onPageChange = (page: number) => {
  pagination.current = page
  filters.page = page
  loadSuppliers()
}

const openDetail = async (supplier: Supplier) => {
  currentSupplier.value = supplier
  detailVisible.value = true
  
  // 加载关联数据
  try {
    const [products, logs] = await Promise.all([
      getSupplierProducts(supplier.id),
      getSupplierStatusLogs(supplier.id)
    ])
    supplierProducts.value = products
    statusLogs.value = logs
  } catch (error) {
    Message.error('加载供应商详情失败')
    console.error('Load supplier detail error:', error)
  }
}

const openEdit = (supplier: Supplier) => {
  editingSupplier.value = supplier
  Object.assign(supplierForm, {
    supplierCode: supplier.supplierCode,
    supplierName: supplier.supplierName,
    supplierType: supplier.supplierType,
    creditRating: supplier.creditRating || 3,
    contactInfo: { ...supplier.contactInfo },
    tags: [...supplier.tags],
    description: supplier.description || ''
  })
  showCreateSupplier.value = true
}

const openPricing = (supplier: Supplier) => {
  Message.info(`打开供应商 ${supplier.supplierName} 的定价档案管理`)
  // TODO: 跳转到定价管理页面
}

const saveSupplier = async () => {
  try {
    if (editingSupplier.value) {
      // 编辑模式 - 记录变更前数据
      const oldSupplier = { ...editingSupplier.value }
      await updateSupplier(editingSupplier.value.id, supplierForm)
      
      // 发送变更通知
      const changes: Record<string, { oldValue: any; newValue: any }> = {}
      Object.keys(supplierForm).forEach(key => {
        if (key === 'contactInfo') {
          // 特殊处理联系信息
          if (JSON.stringify(oldSupplier[key]) !== JSON.stringify(supplierForm[key])) {
            changes[key] = { oldValue: oldSupplier[key], newValue: supplierForm[key] }
          }
        } else if (oldSupplier[key] !== supplierForm[key]) {
          changes[key] = { oldValue: oldSupplier[key], newValue: supplierForm[key] }
        }
      })
      
      await notifySupplierChange('update', {
        id: editingSupplier.value.id,
        code: editingSupplier.value.supplierCode,
        name: editingSupplier.value.supplierName
      }, changes)
      
      Message.success('供应商更新成功')
    } else {
      // 新增模式
      const newSupplier = await createSupplier(supplierForm)
      
      // 发送创建通知
      await notifySupplierChange('create', {
        id: newSupplier.id,
        code: newSupplier.supplierCode,
        name: newSupplier.supplierName
      })
      
      Message.success('供应商创建成功')
    }
    
    showCreateSupplier.value = false
    resetSupplierForm()
    loadSuppliers()
  } catch (error) {
    Message.error('供应商保存失败')
    console.error('Save supplier error:', error)
  }
}

const toggleStatus = async (supplier: Supplier) => {
  try {
    const newStatus = supplier.status === 'active' ? 'inactive' : 'active'
    await updateSupplierStatus(supplier.id, newStatus, '手动变更状态')
    
    // 发送状态变更通知
    await notifySupplierChange('status_change', {
      id: supplier.id,
      code: supplier.supplierCode,
      name: supplier.supplierName,
      status: newStatus
    }, {
      status: { oldValue: supplier.status, newValue: newStatus }
    })
    
    Message.success(`供应商已${newStatus === 'active' ? '启用' : '停用'}`)
    loadSuppliers()
  } catch (error) {
    Message.error('状态变更失败')
    console.error('Toggle status error:', error)
  }
}

const resetSupplierForm = () => {
  Object.assign(supplierForm, {
    supplierCode: '',
    supplierName: '',
    supplierType: 'data_provider',
    creditRating: 3,
    contactInfo: {
      company: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: ''
    },
    tags: [],
    description: ''
  })
  editingSupplier.value = null
}

const exportSuppliers = () => {
  const headers = [
    '供应商编码', '供应商名称', '类型', '状态', '信用评级',
    '公司名称', '联系人', '邮箱', '电话', '地址', '标签', '描述'
  ]
  const rows = displayedSuppliers.value.map(s => [
    s.supplierCode,
    s.supplierName,
    getSupplierTypeLabel(s.supplierType),
    getStatusLabel(s.status),
    s.creditRating || 0,
    s.contactInfo.company,
    s.contactInfo.contactPerson,
    s.contactInfo.email,
    s.contactInfo.phone,
    s.contactInfo.address,
    s.tags.join(';'),
    s.description || '-'
  ])
  const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `suppliers-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
  Message.success('供应商数据导出成功')
}

// 工具函数
const getSupplierTypeLabel = (type: string) => {
  const labels = {
    data_provider: '数据提供商',
    service_provider: '服务提供商',
    platform_provider: '平台提供商'
  }
  return labels[type as keyof typeof labels] || type
}

const getSupplierTypeColor = (type: string) => {
  const colors = {
    data_provider: 'blue',
    service_provider: 'green',
    platform_provider: 'orange'
  }
  return colors[type as keyof typeof colors] || 'default'
}

const getStatusLabel = (status: string) => {
  const labels = {
    active: '活跃',
    inactive: '停用',
    suspended: '暂停'
  }
  return labels[status as keyof typeof labels] || status
}

const getStatusStatus = (status: string) => {
  const statuses = {
    active: 'success',
    inactive: 'default',
    suspended: 'warning'
  }
  return statuses[status as keyof typeof statuses] as any || 'default'
}

const formatDate = (date: string) => {
  try {
    return DateUtils.formatDate(date)
  } catch {
    return '-'
  }
}

const formatDateTime = (date: string) => {
  try {
    return DateUtils.formatDateTime(date)
  } catch {
    return '-'
  }
}

// 监听弹窗关闭
const handleModalClose = () => {
  if (!showCreateSupplier.value) {
    resetSupplierForm()
  }
}

// 生命周期
onMounted(() => {
  // 注册默认监听器
  registerDefaultListeners()
  loadSuppliers()
})
</script>

<style scoped>
.supplier-management {
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

:deep(.arco-rate) {
  display: inline-block;
  vertical-align: middle;
}
</style>
