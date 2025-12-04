<template>
  <div class="risk-feature-center">
    <!-- 页面标题和操作区 -->
    <PageHeader title="特征中心">
      <template #actions>
        <a-dropdown>
          <a-button type="primary">
            <template #icon><icon-plus /></template>
            新建
            <template #suffix><icon-down /></template>
          </a-button>
          <template #content>
            <a-doption @click="openRegister">
              <template #icon><icon-plus /></template>
              注册特征
            </a-doption>
            <a-doption @click="openQuickRegister">
              <template #icon><icon-plus /></template>
              快速注册
            </a-doption>
            <a-doption @click="openImport">
              <template #icon><icon-upload /></template>
              批量导入
            </a-doption>
          </template>
        </a-dropdown>
        <a-button @click="handleExport">
          <template #icon>
            <icon-download />
          </template>
          导出
        </a-button>
        <a-button @click="loadData">
          <template #icon>
            <icon-refresh />
          </template>
          刷新
        </a-button>
      </template>
    </PageHeader>

    <!-- 搜索和筛选 -->
    <a-card class="filter-card">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-form-item label="特征名称">
            <a-input
              v-model="filterForm.name"
              placeholder="请输入特征名称"
              allow-clear
              @change="handleSearch"
            />
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item label="特征类型">
            <a-select
              v-model="filterForm.type"
              placeholder="请选择特征类型"
              allow-clear
              @change="handleSearch"
            >
              <a-option value="">全部</a-option>
              <a-option value="numerical">数值型</a-option>
              <a-option value="categorical">分类型</a-option>
              <a-option value="text">文本型</a-option>
              <a-option value="time">时间型</a-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item label="特征状态">
            <a-select
              v-model="filterForm.status"
              placeholder="请选择特征状态"
              allow-clear
              @change="handleSearch"
            >
              <a-option value="">全部</a-option>
              <a-option value="active">有效</a-option>
              <a-option value="inactive">无效</a-option>
              <a-option value="pending">待审核</a-option>
              <a-option value="expired">已过期</a-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item>
            <a-space>
              <a-button type="primary" @click="handleSearch">
                <template #icon>
                  <icon-search />
                </template>
                搜索
              </a-button>
              <a-button @click="handleReset">
                <template #icon>
                  <icon-refresh />
                </template>
                重置
              </a-button>
            </a-space>
          </a-form-item>
        </a-col>
      </a-row>
    </a-card>

    <!-- 统计卡片 -->
    <a-row :gutter="16" class="stats-row">
      <a-col :span="6">
        <a-card hoverable>
          <template #title>
            <icon-apps />
            总特征数
          </template>
          <div class="stat-value">{{ stats.totalFeatures }}</div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card hoverable>
          <template #title>
            <icon-check-circle />
            有效特征
          </template>
          <div class="stat-value">{{ stats.activeFeatures }}</div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card hoverable>
          <template #title>
            <icon-clock-circle />
            待审核
          </template>
          <div class="stat-value">{{ stats.pendingFeatures }}</div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card hoverable>
          <template #title>
            <icon-close-circle />
            已过期
          </template>
          <div class="stat-value">{{ stats.expiredFeatures }}</div>
        </a-card>
      </a-col>
    </a-row>

    

    <!-- 数据表格 -->
    <div class="table-section">
      <a-card>
        <template #title>
          <div class="table-header">
            <h3 class="table-title">特征列表</h3>
            <div class="table-actions">
              <span>共 {{ pagination.total }} 条数据</span>
            </div>
          </div>
        </template>
        
        <a-table
          :data="featureList"
          :columns="columns"
          :loading="loading"
          :pagination="pagination"
          row-key="id"
          @page-change="handlePageChange"
          @selection-change="handleSelectionChange"
        >
          <template #name="{ record }">
            <a-link @click="handleViewDetail(record)">{{ record.name }}</a-link>
          </template>
          
          <template #type="{ record }">
            <a-tag :color="getBizTypeColor(record)">
              {{ getBizTypeLabel(record) }}
            </a-tag>
          </template>
          
          <template #status="{ record }">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusLabel(record.status) }}
            </a-tag>
          </template>
          
          <template #createTime="{ record }">
            {{ formatDate(record.createTime) }}
          </template>
          
          <template #actions="{ record }">
            <a-space>
              <a-button type="text" size="small" @click="handleViewDetail(record)">
                查看
              </a-button>
              <a-button type="text" size="small" @click="handleEdit(record)">
                编辑
              </a-button>
              <a-button 
                type="text" 
                size="small" 
                status="danger"
                @click="handleDelete(record)"
              >
                删除
              </a-button>
            </a-space>
          </template>
        </a-table>
      </a-card>
    </div>
  </div>
  <a-drawer v-model:visible="createVisible" width="720" title="快速注册">
    <a-collapse :default-active-key="['basic','fields','confirm']" :bordered="false">
      <a-collapse-item key="basic" header="1. 快速注册基础信息">
        <a-form :model="createForm" layout="vertical">
          <a-form-item label="选择数据表" required>
            <a-select v-model="createForm.table" placeholder="请选择数据表" allow-search @change="onTableChange">
              <a-option v-for="t in tableList" :key="t.name" :value="t.name">{{ t.name }} ({{ tableTypeLabel(t.type) }})</a-option>
            </a-select>
          </a-form-item>
          <a-form-item label="表类型" required>
            <a-radio-group v-model="createForm.tableType">
              <a-radio value="stream">流水表</a-radio>
              <a-radio value="slow_change">拉链表</a-radio>
              <a-radio value="snapshot">分区/快照表</a-radio>
            </a-radio-group>
          </a-form-item>
        <a-form-item label="主键字段" required>
          <a-select v-model="createForm.primaryKey" placeholder="请选择主键">
            <a-option v-for="c in tableColumns" :key="c.name" :value="c.name">{{ c.name }} ({{ c.type }})</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="分区字段">
          <a-select v-model="createForm.partitionFields" placeholder="请选择分区字段" multiple allow-search>
            <a-option v-for="c in tableColumns" :key="c.name" :value="c.name">{{ c.name }} ({{ c.type }})</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="特征描述">
          <a-textarea v-model="createForm.description" :max-length="200" show-word-limit />
        </a-form-item>
        <a-form-item label="特征分类(大类)" required>
          <a-select v-model="createForm.majorCategories" multiple placeholder="请选择特征分类">
            <a-option value="credit">征信变量</a-option>
            <a-option value="behavior">行为变量</a-option>
          </a-select>
        </a-form-item>
        <a-space>
          <a-button type="outline" :disabled="!createForm.table" @click="saveMeta">保存元信息(模拟)</a-button>
          <a-tag v-if="metaMsg" color="green">{{ metaMsg }}</a-tag>
        </a-space>
      </a-form>
      </a-collapse-item>
      <a-collapse-item key="fields" header="2. 字段校验与批量注册">
        <a-collapse :bordered="false" :default-active-key="['registered','unregistered']">
          <a-collapse-item key="registered" :header="`已注册字段（${registeredCount}）`">
            <a-card :bordered="false">
              <a-table :data="registeredFields" :columns="registeredColumns" :pagination="false" row-key="name" size="small" />
            </a-card>
          </a-collapse-item>
          <a-collapse-item key="unregistered" :header="`未注册字段（${unregisteredCount}）`">
            <a-card :bordered="false">
              <a-table :data="unregisteredFields" :columns="unregisteredColumns" :pagination="false" row-key="name" size="small">
                <template #codeCell="{ record }">
                  <a-input v-model="record.code" placeholder="特征编码" />
                </template>
                <template #cnNameCell="{ record }">
                  <a-input v-model="record.cnName" placeholder="中文名" />
                </template>
                <template #dataTypeCell="{ record }">
                  <a-select v-model="record.dataType" placeholder="数据类型">
                    <a-option value="int">int</a-option>
                    <a-option value="double">double</a-option>
                    <a-option value="string">string</a-option>
                    <a-option value="timestamp">timestamp</a-option>
                  </a-select>
                </template>
                <template #defaultValueCell="{ record }">
                  <a-input v-model="record.defaultValue" placeholder="默认值" />
                </template>
              </a-table>
              <a-space style="margin-top: 8px">
                <a-button type="primary" size="small" :disabled="unregisteredFields.length===0" @click="registerAll">全部注册</a-button>
                <a-button size="small" @click="runFieldValidate">执行校验</a-button>
                <a-tag v-if="fieldMsg" color="green">{{ fieldMsg }}</a-tag>
              </a-space>
            </a-card>
          </a-collapse-item>
        </a-collapse>
      </a-collapse-item>
      <a-collapse-item key="confirm" header="3. 确认提交">
        <a-descriptions bordered :column="1">
          <a-descriptions-item label="数据表">{{ createForm.table }}</a-descriptions-item>
          <a-descriptions-item label="表类型">{{ tableTypeLabel(createForm.tableType) }}</a-descriptions-item>
          <a-descriptions-item label="主键字段">{{ createForm.primaryKey }}</a-descriptions-item>
          <a-descriptions-item label="分区字段">{{ (createForm.partitionFields || []).join(', ') || '-' }}</a-descriptions-item>
          <a-descriptions-item label="特征描述">{{ createForm.description || '-' }}</a-descriptions-item>
          <a-descriptions-item label="已注册字段">{{ registeredFields.map(f=>f.name).join(', ') || '-' }}</a-descriptions-item>
        </a-descriptions>
      </a-collapse-item>
    </a-collapse>
    <template #footer>
      <a-space>
        <a-button @click="closeCreate">取消</a-button>
        <a-button type="primary" @click="submitCreate">提交</a-button>
      </a-space>
    </template>
  </a-drawer>
  
  <a-drawer v-model:visible="registerVisible" width="720" title="注册特征（表单）">
    <a-form :model="registerForm" layout="vertical">
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="特征大类" required>
            <a-radio-group v-model="registerForm.majorCategory" type="button">
              <a-radio value="credit">征信变量</a-radio>
              <a-radio value="behavior">行为变量</a-radio>
              <a-radio value="model_output">模型输出</a-radio>
            </a-radio-group>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="一级分类">
            <a-select v-model="registerForm.level1" placeholder="请选择">
              <a-option v-for="opt in effectiveLevel1Options" :key="opt.value" :value="opt.value">{{ opt.label }}</a-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>
      <a-alert v-if="registerForm.majorCategory==='model_output'" type="info" style="margin-bottom: 8px">来源自动填充为平台模型输出，创建人为模型归属人</a-alert>
      <a-alert v-else-if="registerForm.majorCategory==='credit'" type="info" style="margin-bottom: 8px">征信大类需填写来源表与征信分类（一级/二级）</a-alert>
      <a-alert v-else-if="registerForm.majorCategory==='behavior'" type="info" style="margin-bottom: 8px">贷中行为需填写来源表与行为分类（一级/二级）</a-alert>
      <a-row :gutter="16" v-if="registerForm.majorCategory==='model_output'">
        <a-col :span="24">
          <a-form-item label="选择模型" required>
            <a-select v-model="registerForm.modelCode" placeholder="请选择已注册模型" allow-search @change="onModelCodeChange">
              <a-option v-for="m in modelList" :key="m.code" :value="m.code">{{ m.name }} ({{ m.code }})</a-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="二级分类">
            <a-select v-model="registerForm.level2" placeholder="请选择" v-if="registerForm.majorCategory!=='model_output'">
              <a-option v-for="opt in level2Options(registerForm.level1)" :key="opt.value" :value="opt.value">{{ opt.label }}</a-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="来源表">
            <a-input v-model="registerForm.sourceTable" placeholder="请输入来源表" v-if="registerForm.majorCategory!=='model_output'" />
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="特征编码" required>
            <a-input v-model="registerForm.code" placeholder="请输入编码" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="特征名称" required>
            <a-input v-model="registerForm.name" placeholder="请输入名称" />
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="数据类型" required>
            <a-select v-model="registerForm.dataType" placeholder="请选择">
              <a-option value="int">int</a-option>
              <a-option value="double">double</a-option>
              <a-option value="string">string</a-option>
              <a-option value="timestamp">timestamp</a-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="批次">
            <a-input v-model="registerForm.batch" placeholder="请输入批次" />
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="需求提出人">
            <a-input v-model="registerForm.proposer" placeholder="请输入" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="开发人">
            <a-input v-model="registerForm.developer" placeholder="请输入" />
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="上线时间">
            <a-date-picker v-model="registerForm.onlineTime" style="width: 100%" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="验收人">
            <a-input v-model="registerForm.accepter" placeholder="请输入" />
          </a-form-item>
        </a-col>
      </a-row>
      <a-form-item label="加工逻辑">
        <a-input v-model="registerForm.processingLogic" placeholder="请输入加工逻辑" />
      </a-form-item>
      <a-form-item label="备注">
        <a-input v-model="registerForm.remark" placeholder="备注" />
      </a-form-item>
    </a-form>
    <template #footer>
      <a-space>
        <a-button @click="closeRegister">取消</a-button>
        <a-button type="primary" @click="submitRegister">提交</a-button>
      </a-space>
    </template>
  </a-drawer>
  <a-drawer v-model:visible="importVisible" width="900" title="批量导入特征">
    <a-space style="margin-bottom: 12px">
      <a-button type="outline" @click="downloadTemplate">模板下载</a-button>
      <a-button type="primary" @click="addImportRow">新增一行</a-button>
      <a-button status="danger" @click="clearImportRows">清空</a-button>
    </a-space>
    <a-table :data="importRows" :columns="importColumns" row-key="__key" :pagination="false" size="small">
      <template #majorCategoryCell="{ record }">
        <a-select v-model="record.majorCategory" placeholder="特征大类">
          <a-option value="credit">征信变量</a-option>
          <a-option value="behavior">行为变量</a-option>
          <a-option value="model_output">模型输出</a-option>
        </a-select>
      </template>
      <template #level1Cell="{ record }">
        <a-select v-model="record.level1" placeholder="一级分类">
          <a-option v-for="opt in level1Options" :key="opt.value" :value="opt.value">{{ opt.label }}</a-option>
        </a-select>
      </template>
      <template #level2Cell="{ record }">
        <a-select v-model="record.level2" placeholder="二级分类">
          <a-option v-for="opt in level2Options(record.level1)" :key="opt.value" :value="opt.value">{{ opt.label }}</a-option>
        </a-select>
      </template>
      <template #codeCell="{ record }">
        <a-input v-model="record.code" placeholder="特征编码" />
      </template>
      <template #nameCell="{ record }">
        <a-input v-model="record.name" placeholder="特征名称" />
      </template>
      <template #sourceTableCell="{ record }">
        <a-input v-model="record.sourceTable" placeholder="来源表" />
      </template>
      <template #processingLogicCell="{ record }">
        <a-input v-model="record.processingLogic" placeholder="加工逻辑" />
      </template>
      <template #dataTypeCell="{ record }">
        <a-select v-model="record.dataType" placeholder="数据类型">
          <a-option value="int">int</a-option>
          <a-option value="double">double</a-option>
          <a-option value="string">string</a-option>
          <a-option value="timestamp">timestamp</a-option>
        </a-select>
      </template>
      <template #batchCell="{ record }">
        <a-input v-model="record.batch" placeholder="批次" />
      </template>
      <template #proposerCell="{ record }">
        <a-input v-model="record.proposer" placeholder="需求提出人" />
      </template>
      <template #developerCell="{ record }">
        <a-input v-model="record.developer" placeholder="开发人" />
      </template>
      <template #onlineTimeCell="{ record }">
        <a-date-picker v-model="record.onlineTime" style="width: 100%" />
      </template>
      <template #accepterCell="{ record }">
        <a-input v-model="record.accepter" placeholder="验收人" />
      </template>
      <template #remarkCell="{ record }">
        <a-input v-model="record.remark" placeholder="备注" />
      </template>
      <template #actionsCell="{ rowIndex }">
        <a-button size="mini" status="danger" @click="removeImportRow(rowIndex)">移除</a-button>
      </template>
    </a-table>
    <template #footer>
      <a-space>
        <a-button @click="closeImport">取消</a-button>
        <a-button type="primary" @click="submitImport">导入</a-button>
      </a-space>
    </template>
  </a-drawer>
</template>

<script setup>
import PageHeader from '../components/PageHeader.vue'
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useFeatureStore } from '@/store/modules/model-offline'
import { Message } from '@arco-design/web-vue'
import {
  IconSearch,
  IconRefresh,
  IconPlus,
  IconUpload,
  IconDownload,
  IconApps,
  IconCheckCircle,
  IconClockCircle,
  IconCloseCircle
} from '@arco-design/web-vue/es/icon'
import { featureAPI } from '@/api/offlineModel'
import { modelAPI } from '@/api/offlineModel'

const router = useRouter()
const store = useFeatureStore()

// 响应式数据
const loading = ref(false)
const selectedRows = ref([])

// 筛选表单
const filterForm = reactive({
  name: '',
  type: '',
  status: ''
})

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: true,
  showJumper: true,
  showPageSize: true
})

// 表格列配置
const columns = [
  {
    title: '特征名称',
    dataIndex: 'name',
    slotName: 'name',
    width: 200
  },
  {
    title: '特征编码',
    dataIndex: 'code',
    width: 150
  },
  {
    title: '特征类型',
    dataIndex: 'type',
    slotName: 'type',
    width: 100
  },
  {
    title: '描述',
    dataIndex: 'description',
    ellipsis: true,
    tooltip: true
  },
  {
    title: '状态',
    dataIndex: 'status',
    slotName: 'status',
    width: 100
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    slotName: 'createTime',
    width: 180
  },
  {
    title: '创建人',
    dataIndex: 'creator',
    width: 120
  },
  {
    title: '操作',
    slotName: 'actions',
    width: 150,
    fixed: 'right'
  }
]

// 计算属性
const featureList = computed(() => store.getFeatures)
const stats = computed(() => ({
  totalFeatures: featureList.value.length,
  activeFeatures: featureList.value.filter(item => item.status === 'active').length,
  pendingFeatures: featureList.value.filter(item => item.status === 'pending').length,
  expiredFeatures: featureList.value.filter(item => item.status === 'expired').length
}))

// 生命周期
onMounted(() => {
  loadData()
})

// 方法
const loadData = async () => {
  loading.value = true
  try {
    const response = await featureAPI.getFeatures({
      ...filterForm,
      page: pagination.current,
      pageSize: pagination.pageSize
    })
    
    if (response.success) {
      store.setFeatures(response.data.data)
      pagination.total = response.data.total
    } else {
      Message.error(response.message || '加载数据失败')
    }
  } catch (error) {
    Message.error('加载数据失败: ' + error.message)
  } finally {
    loading.value = false
  }
}

const handleFilterChange = () => {
  pagination.current = 1
  loadData()
}

const handleSearch = () => {
  loadData()
}

const handleReset = () => {
  filterForm.name = ''
  filterForm.type = ''
  filterForm.status = ''
  loadData()
}

const handlePageChange = (page) => {
  pagination.current = page
  loadData()
}

const handleSelectionChange = (rows) => {
  selectedRows.value = rows
}

const handleCreate = () => {
  router.push('/offline-model/feature-center/create')
}
const createVisible = ref(false)
const registerVisible = ref(false)
const importVisible = ref(false)
const createForm = reactive({ table: '', tableType: '', primaryKey: '', partitionFields: [], description: '', majorCategories: [] })
const tableList = ref([])
const tableColumns = ref([])
const registeredFields = ref([])
const unregisteredFields = ref([])
const registeredCount = computed(() => registeredFields.value.length)
const unregisteredCount = computed(() => unregisteredFields.value.length)
const registeredColumns = [
  { title: '原表字段名', dataIndex: 'name', width: 160 },
  { title: '特征编码', dataIndex: 'code', width: 160 },
  { title: '类型', dataIndex: 'type', width: 140 },
  { title: '中文名', dataIndex: 'cnName', width: 160 },
  { title: '数据类型', dataIndex: 'dataType', width: 140 },
  { title: '默认值', dataIndex: 'defaultValue', width: 140 },
  { title: '来源', dataIndex: 'sourceType', width: 140 },
  { title: '来源标识', dataIndex: 'sourceRefId', width: 180 }
]
const unregisteredColumns = [
  { title: '原表字段名', dataIndex: 'name', width: 160 },
  { title: '特征编码', dataIndex: 'code', slotName: 'codeCell', width: 160 },
  { title: '类型', dataIndex: 'type', width: 140 },
  { title: '中文名', dataIndex: 'cnName', slotName: 'cnNameCell', width: 160 },
  { title: '数据类型', dataIndex: 'dataType', slotName: 'dataTypeCell', width: 140 },
  { title: '默认值', dataIndex: 'defaultValue', slotName: 'defaultValueCell', width: 140 }
]
const level1Options = [
  { value: 'credit_report', label: '征信报告' },
  { value: 'credit_history', label: '信贷记录' },
  { value: 'transaction_behavior', label: '交易行为' },
  { value: 'activity', label: '活跃度' },
  { value: 'model_outputs', label: '模型输出' }
]
const level2Options = (l1) => {
  const map = {
    credit_report: [
      { value: 'overdue_count', label: '逾期次数' },
      { value: 'query_count', label: '查询次数' }
    ],
    credit_history: [
      { value: 'loan_times', label: '贷款次数' },
      { value: 'repay_ratio', label: '还款比率' }
    ],
    transaction_behavior: [
      { value: 'avg_amount', label: '平均交易额' },
      { value: 'frequency', label: '交易频次' }
    ],
    activity: [
      { value: 'login_days', label: '登录天数' },
      { value: 'session_count', label: '会话次数' }
    ]
  }
  return map[l1] || []
}
const openQuickRegister = async () => {
  createVisible.value = true
  const res = await featureAPI.listTables()
  tableList.value = Array.isArray(res) ? res : (Array.isArray(res.data) ? res.data : (res.data?.data || []))
  if (tableList.value.length > 0) {
    createForm.table = tableList.value[0].name
    await onTableChange(createForm.table)
  }
}
const closeCreate = () => { createVisible.value = false }
const tableTypeLabel = (t) => ({ stream: '流水表', slow_change: '拉链表', snapshot: '分区/快照表' }[t] || t)
const onTableChange = async (name) => {
  const meta = await featureAPI.getTableMeta(name)
  createForm.table = name
  createForm.tableType = meta?.data?.type || meta?.type || ''
  createForm.primaryKey = meta?.data?.primaryKey || meta?.primaryKey || ''
  createForm.description = meta?.data?.description || meta?.description || ''
  createForm.partitionFields = meta?.data?.partitionFields || meta?.partitionFields || []
  const colsRes = await featureAPI.getTableColumns(name)
  tableColumns.value = Array.isArray(colsRes) ? colsRes : (Array.isArray(colsRes.data) ? colsRes.data : (colsRes.data?.data || []))
  const regRes = await featureAPI.getRegisteredFields(name)
  registeredFields.value = Array.isArray(regRes) ? regRes : (Array.isArray(regRes.data) ? regRes.data : (regRes.data?.data || []))
  const unregRes = await featureAPI.getUnregisteredFields(name)
  const rawUnreg = Array.isArray(unregRes) ? unregRes : (Array.isArray(unregRes.data) ? unregRes.data : (unregRes.data?.data || []))
  unregisteredFields.value = rawUnreg.map(c => ({
    name: c.name,
    type: c.type,
    code: c.name,
    cnName: c.name,
    onlineTime: '',
    dataType: c.type,
    defaultValue: '',
    processingLogic: '',
    batch: '',
    remark: '',
    level1: '',
    level2: ''
  }))
}
const metaMsg = ref('')
const fieldMsg = ref('')
const saveMeta = async () => {
  if (!createForm.table) return
  const res = await featureAPI.setTableMeta(createForm.table, { type: createForm.tableType, primaryKey: createForm.primaryKey, description: createForm.description, partitionFields: createForm.partitionFields })
  if (res.success) metaMsg.value = '元信息已保存'
}
const registerAll = async () => {
  if (!createForm.table || unregisteredFields.value.length === 0) return
  const res = await featureAPI.batchRegisterFields(createForm.table, unregisteredFields.value)
  registeredFields.value = Array.isArray(res) ? res : (Array.isArray(res.data) ? res.data : (res.data?.data || []))
  const unregRes = await featureAPI.getUnregisteredFields(createForm.table)
  const newUnreg = Array.isArray(unregRes) ? unregRes : (Array.isArray(unregRes.data) ? unregRes.data : (unregRes.data?.data || []))
  unregisteredFields.value = newUnreg.map(c => ({
    name: c.name,
    type: c.type,
    code: c.name,
    cnName: c.name,
    onlineTime: '',
    dataType: c.type,
    defaultValue: '',
    processingLogic: '',
    batch: '',
    remark: '',
    level1: '',
    level2: ''
  }))
}
const runFieldValidate = () => {
  const ok = registeredFields.value.length > 0
  fieldMsg.value = ok ? '校验通过' : '校验不通过，请先注册字段'
}
const submitCreate = async () => {
  Message.success('特征注册完成')
  createVisible.value = false
  loadData()
}

const handleImport = () => {
  Message.info('批量导入功能开发中')
}

const handleExport = () => {
  Message.info('导出功能开发中')
}

const handleBatchOperation = () => {
  if (selectedRows.value.length === 0) {
    Message.warning('请先选择要操作的记录')
    return
  }
  Message.info('批量操作功能开发中')
}

const handleTableSetting = () => {
  Message.info('表格设置功能开发中')
}

const handleViewDetail = (record) => {
  router.push(`/offline-model/feature-center/detail/${record.id}`)
}

const handleEdit = (record) => {
  router.push(`/offline-model/feature-center/edit/${record.id}`)
}

const handleDelete = (record) => {
  Message.info('删除功能开发中')
}

// 工具方法
const getBizTypeLabel = (record) => {
  if (record?.majorCategory === 'model_output') return '模型分'
  if (record?.level1 === 'model_outputs') return '模型分'
  if (record?.majorCategory === 'behavior') return '贷中行为特征'
  if (record?.majorCategory === 'credit') return '征信衍生特征'
  if (record?.level1 === 'credit_report' || record?.level1 === 'credit_history') return '征信衍生特征'
  if (record?.level1 === 'transaction_behavior' || record?.level1 === 'activity') return '贷中行为特征'
  return '未分类'
}

const getBizTypeColor = (record) => {
  const label = getBizTypeLabel(record)
  const colors = {
    '模型分': 'purple',
    '贷中行为特征': 'blue',
    '征信衍生特征': 'green',
    '未分类': 'gray'
  }
  return colors[label] || 'gray'
}

const getStatusColor = (status) => {
  const colors = {
    active: 'green',
    inactive: 'red',
    draft: 'orange',
    pending: 'blue'
  }
  return colors[status] || 'gray'
}

const getStatusLabel = (status) => {
  const labels = {
    active: '有效',
    inactive: '无效',
    draft: '草稿',
    pending: '待审核'
  }
  return labels[status] || status
}

const formatDate = (date) => {
  return new Date(date).toLocaleString('zh-CN')
}

// 批量导入
const importRows = ref([])
const importColumns = [
  { title: '特征大类', dataIndex: 'majorCategory', slotName: 'majorCategoryCell', width: 140 },
  { title: '一级分类', dataIndex: 'level1', slotName: 'level1Cell', width: 140 },
  { title: '二级分类', dataIndex: 'level2', slotName: 'level2Cell', width: 140 },
  { title: '特征编码', dataIndex: 'code', slotName: 'codeCell', width: 160 },
  { title: '特征名称', dataIndex: 'name', slotName: 'nameCell', width: 160 },
  { title: '来源表', dataIndex: 'sourceTable', slotName: 'sourceTableCell', width: 160 },
  { title: '加工逻辑', dataIndex: 'processingLogic', slotName: 'processingLogicCell', width: 200 },
  { title: '数据类型', dataIndex: 'dataType', slotName: 'dataTypeCell', width: 140 },
  { title: '批次', dataIndex: 'batch', slotName: 'batchCell', width: 120 },
  { title: '需求提出人', dataIndex: 'proposer', slotName: 'proposerCell', width: 140 },
  { title: '开发人', dataIndex: 'developer', slotName: 'developerCell', width: 140 },
  { title: '上线时间', dataIndex: 'onlineTime', slotName: 'onlineTimeCell', width: 160 },
  { title: '验收人', dataIndex: 'accepter', slotName: 'accepterCell', width: 140 },
  { title: '备注', dataIndex: 'remark', slotName: 'remarkCell' },
  { title: '操作', dataIndex: 'actions', slotName: 'actionsCell', width: 100, fixed: 'right' }
]
const openImport = () => {
  importVisible.value = true
  if (importRows.value.length === 0) addImportRow()
}
const closeImport = () => { importVisible.value = false }
const addImportRow = () => {
  importRows.value.push({
    __key: Date.now() + Math.random(),
    majorCategory: '', level1: '', level2: '', code: '', name: '', sourceTable: '', processingLogic: '', dataType: '', batch: '', proposer: '', developer: '', onlineTime: '', accepter: '', remark: ''
  })
}
const removeImportRow = (idx) => { importRows.value.splice(idx, 1) }
const clearImportRows = () => { importRows.value = [] }
const submitImport = async () => {
  if (importRows.value.length === 0) { Message.warning('请先添加导入数据'); return }
  const typeMap = (dt) => {
    if (dt === 'timestamp') return 'time'
    if (dt === 'string') return 'categorical'
    if (dt === 'int' || dt === 'double') return 'numerical'
    return 'numerical'
  }
  const payload = importRows.value.map(r => ({
    name: r.name,
    code: r.code,
    type: typeMap(r.dataType),
    description: r.processingLogic || '',
    dataSource: r.sourceTable || '',
    updateFrequency: '按需',
    majorCategory: r.majorCategory,
    level1: r.level1,
    level2: r.level2,
    batch: r.batch,
    proposer: r.proposer,
    developer: r.developer,
    onlineTime: r.onlineTime,
    accepter: r.accepter,
    remark: r.remark
  }))
  const res = await featureAPI.importFeatures(payload)
  if (res.success) {
    Message.success(res.message || '批量导入成功')
    closeImport()
    loadData()
  } else {
    Message.error(res.message || '批量导入失败')
  }
}
const downloadTemplate = () => {
  const headers = ['majorCategory','level1','level2','code','name','sourceTable','processingLogic','dataType','batch','proposer','developer','onlineTime','accepter','remark']
  const csv = headers.join(',') + '\n'
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'feature_import_template.csv'
  a.click()
  URL.revokeObjectURL(url)
}

// 新建方式选择
const modelList = ref([])
const openRegister = async () => {
  registerVisible.value = true
  try {
    const res = await modelAPI.getModels({ page: 1, pageSize: 200 })
    modelList.value = Array.isArray(res.data) ? res.data : (res.data?.data || [])
  } catch {}
}
const closeRegister = () => { registerVisible.value = false }
const registerForm = reactive({
  majorCategory: '', level1: '', level2: '', code: '', name: '', sourceTable: '', processingLogic: '', dataType: '', batch: '', proposer: '', developer: '', onlineTime: '', accepter: '', remark: '', modelCode: ''
})
const effectiveLevel1Options = computed(() => {
  const cat = registerForm.majorCategory
  if (cat === 'model_output') return level1Options.filter(o => o.value === 'model_outputs')
  if (cat === 'credit') return level1Options.filter(o => o.value === 'credit_report' || o.value === 'credit_history')
  if (cat === 'behavior') return level1Options.filter(o => o.value === 'transaction_behavior' || o.value === 'activity')
  return level1Options
})
watch(() => registerForm.majorCategory, (cat) => {
  if (cat === 'model_output') {
    registerForm.level1 = 'model_outputs'
    registerForm.level2 = ''
    registerForm.sourceTable = ''
  } else if (cat === 'credit') {
    if (registerForm.level1 !== 'credit_report' && registerForm.level1 !== 'credit_history') {
      registerForm.level1 = 'credit_report'
    }
  } else if (cat === 'behavior') {
    if (registerForm.level1 !== 'transaction_behavior' && registerForm.level1 !== 'activity') {
      registerForm.level1 = 'transaction_behavior'
    }
  }
})
const onModelCodeChange = (code) => {
  if (!code) return
  if (!registerForm.name) registerForm.name = '模型分'
  if (!registerForm.dataType) registerForm.dataType = 'double'
}
const submitRegister = async () => {
  const typeMap = (dt) => {
    if (dt === 'timestamp') return 'time'
    if (dt === 'string') return 'categorical'
    if (dt === 'int' || dt === 'double') return 'numerical'
    return 'numerical'
  }
  const isModelOutput = registerForm.majorCategory === 'model_output'
  const selectedModel = isModelOutput ? (modelList.value || []).find(m => m.code === registerForm.modelCode) : null
  const payload = {
    name: registerForm.name,
    code: registerForm.code,
    type: typeMap(registerForm.dataType),
    description: registerForm.processingLogic || '',
    dataSource: isModelOutput ? '平台模型输出' : (registerForm.sourceTable || ''),
    updateFrequency: '按需',
    majorCategory: registerForm.majorCategory,
    level1: isModelOutput ? 'model_outputs' : registerForm.level1,
    level2: isModelOutput ? (registerForm.modelCode || '') : registerForm.level2,
    batch: registerForm.batch,
    proposer: registerForm.proposer,
    developer: registerForm.developer,
    onlineTime: registerForm.onlineTime,
    accepter: registerForm.accepter,
    remark: registerForm.remark,
    sourceType: isModelOutput ? 'model_output' : '',
    sourceRefId: isModelOutput ? (registerForm.modelCode || '') : '',
    creator: isModelOutput ? (selectedModel?.creator || '平台模型') : undefined
  }
  if (isModelOutput && !registerForm.modelCode) {
    Message.error('请选择已注册的模型')
    return
  }
  const res = await featureAPI.createFeature(payload)
  if (res.success) {
    Message.success(res.message || '创建成功')
    closeRegister()
    loadData()
  } else {
    Message.error(res.message || '创建失败')
  }
}
</script>

<style scoped>
.risk-feature-center {
  padding: 24px;
}

.page-header {
  margin-bottom: 16px;
}

.page-header h2 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 20px;
}



.stats-row {
  margin-bottom: 16px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #1890ff;
  text-align: center;
  margin-top: 8px;
}

.filter-card {
  margin-bottom: 16px;
}

.page-actions {
  margin-bottom: 16px;
}

.table-section {
  background: #fff;
  border-radius: 6px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.table-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin: 0;
}

.table-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}
</style>
