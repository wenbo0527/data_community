<template>
  <div class="event-management">
    <!-- 事件列表页面 -->
    <div v-if="!showCreateForm" class="event-list">
      <!-- 简化的页面头部 -->
      <div class="page-header">
        <div class="header-content">
          <div class="title-area">
            <h2 class="page-title">事件管理</h2>
            <span class="page-description">管理系统事件配置</span>
          </div>
          <div class="header-actions">
            <a-space size="small">
              <a-input 
                v-model="searchForm.eventName" 
                placeholder="搜索事件名称" 
                allow-clear 
                style="width: 200px"
                @press-enter="handleSearch"
              >
                <template #prefix>
                  <icon-search style="color: var(--color-text-3)" />
                </template>
              </a-input>
              <a-button type="primary" size="small" @click="showCreateEvent">
                <template #icon><icon-plus /></template>
                新建事件
              </a-button>
            </a-space>
          </div>
        </div>
      </div>
      
      <!-- 表格区域 -->
      <a-card class="content-card" :bordered="false">
        
        <!-- 优化的表格区域 -->
        <div class="table-section">
          <a-table 
            :data="tableData" 
            :loading="loading" 
            :pagination="{
              ...pagination,
              showTotal: true,
              showPageSize: true,
              pageSizeOptions: ['15', '30', '50', '100'],
              size: 'small'
            }"
            @page-change="onPageChange"
            @page-size-change="onPageSizeChange"
            class="event-table"
            size="small"
            :scroll="{ x: 1200 }"
          >
            <template #columns>
              <a-table-column title="ID" data-index="id" :width="80" fixed="left" />
              <a-table-column title="事件名称" data-index="eventName" :width="160">
                <template #cell="{ record }">
                  <a-link @click="viewEventDetail(record)">{{ record.eventName }}</a-link>
                </template>
              </a-table-column>
              <a-table-column title="来源" data-index="eventSource" :width="100" />
              <a-table-column title="状态" data-index="status" :width="80">
                <template #cell="{ record }">
                  <a-tag :color="getStatusColor(record.status)" size="small">{{ record.status }}</a-tag>
                </template>
              </a-table-column>
              <a-table-column title="创建时间" data-index="createTime" :width="140">
                <template #cell="{ record }">
                  <span style="font-size: 12px;">{{ record.createTime }}</span>
                </template>
              </a-table-column>
              <a-table-column title="负责人" data-index="owner" :width="80" />
              <a-table-column title="操作" :width="100" fixed="right">
                <template #cell="{ record }">
                  <a-space size="mini">
                    <a-button type="text" size="mini" @click="editEvent(record)">
                      <icon-edit />
                    </a-button>
                    <a-dropdown trigger="click">
                      <a-button type="text" size="mini">
                        <icon-more />
                      </a-button>
                      <template #content>
                        <a-doption @click="viewSampleStats(record)">
                          <icon-bar-chart />
                          抽样统计
                        </a-doption>
                        <a-doption @click="deleteEvent(record)" class="danger-option">
                          <icon-delete />
                          删除
                        </a-doption>
                      </template>
                    </a-dropdown>
                  </a-space>
                </template>
              </a-table-column>
            </template>
          </a-table>
        </div>
      </a-card>
    </div>

    <!-- 新建/编辑事件页面 -->
    <div v-else class="event-create">
      <!-- 简化的页面头部 -->
      <div class="page-header">
        <div class="header-content">
          <div class="title-area">
            <h2 class="page-title">{{ isEdit ? '编辑事件' : '新建事件' }}</h2>
            <span class="page-description">配置事件基础信息、数据源和属性管理</span>
          </div>
          <div class="header-actions">
            <a-space size="small">
              <a-button size="small" @click="cancelCreate">
                <template #icon><icon-arrow-left /></template>
                返回
              </a-button>
              <a-button type="primary" size="small" @click="saveEvent" :loading="saving">
                <template #icon><icon-save /></template>
                保存
              </a-button>
            </a-space>
          </div>
        </div>
      </div>
      
      <a-card class="content-card" :bordered="false">

        <!-- 事件基础信息配置 -->
        <div class="form-section">
          <a-card title="事件基础信息" class="section-card" size="small">
            <a-form :model="eventForm" :rules="eventRules" ref="eventFormRef" layout="vertical">
              <a-row :gutter="24">
                <a-col :span="8">
                  <a-form-item field="eventName" label="事件名称" required>
                    <a-input 
                      v-model="eventForm.eventName" 
                      placeholder="请输入事件名称"
                      allow-clear
                    />
                  </a-form-item>
                </a-col>
                <a-col :span="8">
                  <a-form-item field="sourceSystem" label="来源系统" required>
                    <a-select 
                      v-model="eventForm.sourceSystem" 
                      placeholder="请选择来源系统"
                      allow-clear
                    >
                      <a-option v-for="system in sourceSystems" :key="system" :value="system">
                        {{ system }}
                      </a-option>
                    </a-select>
                  </a-form-item>
                </a-col>
                <a-col :span="8">
                  <a-form-item field="owner" label="事件负责人" required>
                    <a-select 
                      v-model="eventForm.owner" 
                      placeholder="请选择负责人"
                      allow-search
                      allow-clear
                    >
                      <a-option v-for="owner in owners" :key="owner.id" :value="owner.id">
                        {{ owner.name }}
                      </a-option>
                    </a-select>
                  </a-form-item>
                </a-col>
              </a-row>
              <a-row :gutter="24">
                <a-col :span="8">
                  <a-form-item field="collectionType" label="获取方式" required>
                    <a-select 
                      v-model="eventForm.collectionType" 
                      placeholder="请选择获取方式"
                    >
                      <a-option value="realtime">实时采集</a-option>
                      <a-option value="sampling">采样</a-option>
                      <a-option value="batch">批量处理</a-option>
                    </a-select>
                  </a-form-item>
                </a-col>
                <a-col :span="8">
                  <a-form-item field="samplingRate" label="采样率" v-if="eventForm.collectionType === 'sampling'">
                    <a-input-number 
                      v-model="eventForm.samplingRate" 
                      placeholder="请输入采样率"
                      :min="0"
                      :max="100"
                      suffix="%"
                    />
                  </a-form-item>
                </a-col>
                <a-col :span="8">
                  <a-form-item>
                    <template #label>
                      <span>采样控制</span>
                    </template>
                    <a-button 
                      v-if="eventForm.collectionType === 'sampling'" 
                      @click="triggerSampling"
                      :loading="sampling"
                    >
                      <template #icon><icon-play-arrow /></template>
                      触发采样
                    </a-button>
                  </a-form-item>
                </a-col>
              </a-row>
            </a-form>
          </a-card>
        </div>

        <!-- 数据源配置 -->
        <div class="form-section">
          <a-card title="数据源配置" class="section-card" size="small">
            <a-form :model="dataSourceForm" layout="vertical">
              <a-row :gutter="24">
                <a-col :span="12">
                  <a-form-item field="dataSourceType" label="数据源类型">
                    <a-select 
                      v-model="dataSourceForm.dataSourceType" 
                      placeholder="请选择数据源类型"
                      disabled
                    >
                      <a-option value="kafka">Kafka数据源</a-option>
                      <a-option value="mysql">MySQL数据源</a-option>
                      <a-option value="redis">Redis数据源</a-option>
                    </a-select>
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item field="topic" label="Topic">
                    <a-select 
                      v-model="dataSourceForm.topic" 
                      placeholder="请选择或创建Topic"
                      allow-search
                      allow-create
                    >
                      <a-option v-for="topic in topics" :key="topic" :value="topic">
                        {{ topic }}
                      </a-option>
                    </a-select>
                  </a-form-item>
                </a-col>
              </a-row>
            </a-form>
          </a-card>
        </div>

        <!-- 属性管理 -->
        <div class="form-section">
          <a-card class="section-card" size="small">
            <template #title>
              <div class="card-title-with-action">
                <span>属性管理</span>
                <a-button type="primary" size="small" @click="addAttribute">
                  <template #icon><icon-plus /></template>
                  新增属性
                </a-button>
              </div>
            </template>
            
            <a-table 
              :data="attributes" 
              :pagination="false"
              class="attribute-table"
              size="small"
            >
              <template #columns>
                <a-table-column title="属性ID" data-index="id" :width="120">
                  <template #cell="{ record, rowIndex }">
                    <a-input 
                      v-model="record.id" 
                      placeholder="请输入属性ID"
                      @blur="validateAttributeId(record, rowIndex)"
                    />
                  </template>
                </a-table-column>
                <a-table-column title="展示名称" data-index="displayName" :width="150">
                  <template #cell="{ record }">
                    <a-input 
                      v-model="record.displayName" 
                      placeholder="请输入展示名称"
                    />
                  </template>
                </a-table-column>
                <a-table-column title="数据类型" data-index="dataType" :width="120">
                  <template #cell="{ record }">
                    <a-select v-model="record.dataType" placeholder="选择类型">
                      <a-option value="string">字符串</a-option>
                      <a-option value="number">数字</a-option>
                      <a-option value="boolean">布尔</a-option>
                      <a-option value="date">日期</a-option>
                      <a-option value="array">数组</a-option>
                      <a-option value="object">对象</a-option>
                    </a-select>
                  </template>
                </a-table-column>
                <a-table-column title="关联ID" data-index="relationId" :width="120">
                  <template #cell="{ record }">
                    <a-select v-model="record.relationId" placeholder="选择关联ID" allow-clear>
                      <a-option value="UID">UID</a-option>
                      <a-option value="CUSTID">CUSTID</a-option>
                      <a-option value="CUSTNO">CUSTNO</a-option>
                    </a-select>
                  </template>
                </a-table-column>
                <a-table-column title="用户唯一标识" :width="120" align="center">
                  <template #cell="{ record }">
                    <a-switch 
                      v-model="record.isUniqueId" 
                      @change="handleUniqueIdChange(record)"
                    />
                  </template>
                </a-table-column>
                <a-table-column title="事件产生时间" :width="120" align="center">
                  <template #cell="{ record }">
                    <a-switch 
                      v-model="record.isEventTime" 
                      @change="handleEventTimeChange(record)"
                    />
                  </template>
                </a-table-column>
                <a-table-column title="枚举" :width="80" align="center">
                  <template #cell="{ record }">
                    <a-switch v-model="record.isEnum" />
                  </template>
                </a-table-column>
                <a-table-column title="操作" :width="150" fixed="right">
                  <template #cell="{ record, rowIndex }">
                    <a-space>
                      <a-button 
                        v-if="record.isEnum" 
                        type="text" 
                        size="small" 
                        @click="editEnumDict(record)"
                      >
                        修改字典
                      </a-button>
                      <a-button 
                        type="text" 
                        size="small" 
                        status="danger" 
                        @click="removeAttribute(rowIndex)"
                      >
                        <template #icon><icon-delete /></template>
                        删除
                      </a-button>
                    </a-space>
                  </template>
                </a-table-column>
              </template>
            </a-table>
          </a-card>
        </div>
      </a-card>
    </div>

    <!-- 枚举字典编辑弹窗 -->
    <a-modal 
      v-model:visible="enumModalVisible" 
      title="编辑枚举字典"
      @ok="saveEnumDict"
      @cancel="cancelEnumDict"
      width="600px"
    >
      <div class="enum-dict-editor">
        <div class="enum-header">
          <span>属性：{{ currentEnumAttribute?.displayName }}</span>
          <a-button type="primary" size="small" @click="addEnumItem">
            <template #icon><icon-plus /></template>
            添加选项
          </a-button>
        </div>
        <div class="enum-list">
          <div 
            v-for="(item, index) in enumItems" 
            :key="index" 
            class="enum-item"
          >
            <a-input 
              v-model="item.value" 
              placeholder="枚举值"
              style="width: 200px; margin-right: 12px;"
            />
            <a-input 
              v-model="item.label" 
              placeholder="显示名称"
              style="width: 200px; margin-right: 12px;"
            />
            <a-button 
              type="text" 
              status="danger" 
              @click="removeEnumItem(index)"
            >
              <template #icon><icon-delete /></template>
            </a-button>
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Message, Modal } from '@arco-design/web-vue'
import { 
  IconSearch, 
  IconRefresh, 
  IconPlus, 
  IconUpload, 
  IconDownload, 
  IconEdit, 
  IconDelete,
  IconCopy,
  IconArrowLeft,
  IconSave,
  IconPlayArrow,
  IconMore,
  IconBarChart
} from '@arco-design/web-vue/es/icon'
import { generateEventData, EventData } from '@/mock/event'

// 页面状态
const showCreateForm = ref(false)
const isEdit = ref(false)
const saving = ref(false)
const sampling = ref(false)

// 路由实例
const router = useRouter()

// 事件类型选项
const eventTypes = ['系统事件', '业务事件', '用户事件', '营销事件', '风控事件']
// 状态选项
const statusOptions = ['上线', '下线']
// 来源系统选项
const sourceSystems = ['用户中心', '订单系统', '支付系统', '营销系统', '风控系统', '数据平台']
// 负责人选项
const owners = [
  { id: '1', name: '张三' },
  { id: '2', name: '李四' },
  { id: '3', name: '王五' },
  { id: '4', name: '赵六' },
  { id: '5', name: '系统管理员' }
]
// Topic选项
const topics = [
  'user-behavior-topic',
  'order-event-topic',
  'payment-event-topic',
  'marketing-event-topic',
  'risk-event-topic'
]

// 搜索表单
const searchForm = reactive({
  eventName: '',
  eventType: '',
  status: ''
})

// 表格数据
const tableData = ref<EventData[]>([])
const loading = ref(false)

// 分页配置
const pagination = reactive({
  total: 0,
  current: 1,
  pageSize: 15,
  showTotal: true,
  showJumper: true,
  pageSizeOptions: [10, 20, 50, 100],
  showPageSize: true
})

// 事件表单
const eventForm = reactive({
  eventName: '',
  sourceSystem: '',
  owner: '',
  collectionType: 'realtime',
  samplingRate: 10
})

// 数据源表单
const dataSourceForm = reactive({
  dataSourceType: 'kafka',
  topic: ''
})

// 属性列表
interface AttributeItem {
  id: string
  displayName: string
  dataType: string
  isUniqueId: boolean
  isEventTime: boolean
  isEnum: boolean
  enumDict?: { value: string; label: string }[]
}

const attributes = ref<AttributeItem[]>([
  {
    id: 'KE82KD',
    displayName: '客户姓名',
    dataType: 'string',
    isUniqueId: true,
    isEventTime: false,
    isEnum: false
  },
  {
    id: 'phone',
    displayName: '联系电话',
    dataType: 'number',
    isUniqueId: true,
    isEventTime: false,
    isEnum: false
  },
  {
    id: 'gender',
    displayName: '性别',
    dataType: 'number',
    isUniqueId: false,
    isEventTime: false,
    isEnum: true,
    enumDict: [
      { value: '1', label: '男' },
      { value: '2', label: '女' }
    ]
  }
])

// 表单验证规则
const eventRules = {
  eventName: [
    { required: true, message: '请输入事件名称' },
    { minLength: 2, maxLength: 50, message: '事件名称长度为2-50个字符' }
  ],
  sourceSystem: [
    { required: true, message: '请选择来源系统' }
  ],
  owner: [
    { required: true, message: '请选择事件负责人' }
  ],
  collectionType: [
    { required: true, message: '请选择获取方式' }
  ]
}

const eventFormRef = ref()

// 枚举字典编辑
const enumModalVisible = ref(false)
const currentEnumAttribute = ref<AttributeItem | null>(null)
const enumItems = ref<{ value: string; label: string }[]>([])

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    // 模拟API请求
    setTimeout(() => {
      const data = generateEventData(50)
      
      // 根据搜索条件筛选
      let filteredData = data
      if (searchForm.eventName) {
        filteredData = filteredData.filter(item => 
          item.eventName.includes(searchForm.eventName)
        )
      }
      if (searchForm.eventType) {
        filteredData = filteredData.filter(item => 
          item.eventType === searchForm.eventType
        )
      }
      if (searchForm.status) {
        filteredData = filteredData.filter(item => 
          item.status === searchForm.status
        )
      }
      
      // 更新表格数据和分页信息
      pagination.total = filteredData.length
      const start = (pagination.current - 1) * pagination.pageSize
      const end = start + pagination.pageSize
      tableData.value = filteredData.slice(start, end)
      
      loading.value = false
    }, 500)
  } catch (error) {
    console.error('获取事件数据失败:', error)
    loading.value = false
    Message.error('获取事件数据失败')
  }
}

// 页码变化
const onPageChange = (page: number) => {
  pagination.current = page
  fetchData()
}

// 每页条数变化
const onPageSizeChange = (pageSize: number) => {
  pagination.pageSize = pageSize
  fetchData()
}

// 查询
const handleSearch = () => {
  pagination.current = 1
  fetchData()
}

// 重置查询条件
const resetSearch = () => {
  searchForm.eventName = ''
  pagination.current = 1
  fetchData()
}

// 显示新建事件页面
const showCreateEvent = () => {
  showCreateForm.value = true
  isEdit.value = false
  resetEventForm()
}

// 取消新建/编辑
const cancelCreate = () => {
  showCreateForm.value = false
  isEdit.value = false
  resetEventForm()
}

// 重置事件表单
const resetEventForm = () => {
  eventForm.eventName = ''
  eventForm.sourceSystem = ''
  eventForm.owner = ''
  eventForm.collectionType = 'realtime'
  eventForm.samplingRate = 10
  dataSourceForm.dataSourceType = 'kafka'
  dataSourceForm.topic = ''
  attributes.value = [
    {
      id: 'KE82KD',
      displayName: '客户姓名',
      dataType: 'string',
      relationId: 'UID',
      isUniqueId: true,
      isEventTime: false,
      isEnum: false
    },
    {
      id: 'phone',
      displayName: '联系电话',
      dataType: 'number',
      relationId: 'CUSTID',
      isUniqueId: true,
      isEventTime: false,
      isEnum: false
    },
    {
      id: 'gender',
      displayName: '性别',
      dataType: 'number',
      relationId: '',
      isUniqueId: false,
      isEventTime: false,
      isEnum: true,
      enumDict: [
        { value: '1', label: '男' },
        { value: '2', label: '女' }
      ]
    }
  ]
}

// 保存事件
const saveEvent = async () => {
  try {
    const valid = await eventFormRef.value?.validate()
    if (!valid) {
      saving.value = true
      
      // 验证属性配置
      if (attributes.value.length === 0) {
        Message.error('请至少添加一个属性')
        saving.value = false
        return
      }
      
      // 检查是否有用户唯一标识
      const hasUniqueId = attributes.value.some(attr => attr.isUniqueId)
      if (!hasUniqueId) {
        Message.warning('建议至少设置一个用户唯一标识属性')
      }
      
      // 检查是否有事件时间
      const hasEventTime = attributes.value.some(attr => attr.isEventTime)
      if (!hasEventTime) {
        Message.warning('建议设置一个事件产生时间属性')
      }
      
      // 模拟保存API调用
      setTimeout(() => {
        Message.success(isEdit.value ? '事件更新成功' : '事件创建成功')
        saving.value = false
        showCreateForm.value = false
        fetchData()
      }, 1000)
    }
  } catch (error) {
    console.error('表单验证失败:', error)
    saving.value = false
  }
}

// 触发采样
const triggerSampling = () => {
  sampling.value = true
  setTimeout(() => {
    sampling.value = false
    Message.success('采样已触发')
  }, 2000)
}

// 添加属性
const addAttribute = () => {
  attributes.value.push({
    id: '',
    displayName: '',
    dataType: 'string',
    relationId: '',
    isUniqueId: false,
    isEventTime: false,
    isEnum: false
  })
}

// 删除属性
const removeAttribute = (index: number) => {
  attributes.value.splice(index, 1)
}

// 验证属性ID唯一性
const validateAttributeId = (record: AttributeItem, index: number) => {
  if (!record.id) return
  
  const duplicateIndex = attributes.value.findIndex((attr, i) => 
    i !== index && attr.id === record.id
  )
  
  if (duplicateIndex !== -1) {
    Message.error('属性ID不能重复')
    record.id = ''
  }
}

// 处理用户唯一标识变化
const handleUniqueIdChange = (record: AttributeItem) => {
  // 可以在这里添加业务逻辑，比如限制唯一标识的数量
}

// 处理事件时间变化
const handleEventTimeChange = (record: AttributeItem) => {
  if (record.isEventTime) {
    // 确保只有一个事件时间属性
    attributes.value.forEach(attr => {
      if (attr !== record) {
        attr.isEventTime = false
      }
    })
  }
}

// 编辑枚举字典
const editEnumDict = (record: AttributeItem) => {
  currentEnumAttribute.value = record
  enumItems.value = record.enumDict ? [...record.enumDict] : []
  enumModalVisible.value = true
}

// 添加枚举项
const addEnumItem = () => {
  enumItems.value.push({ value: '', label: '' })
}

// 删除枚举项
const removeEnumItem = (index: number) => {
  enumItems.value.splice(index, 1)
}

// 保存枚举字典
const saveEnumDict = () => {
  if (currentEnumAttribute.value) {
    currentEnumAttribute.value.enumDict = [...enumItems.value]
    Message.success('枚举字典保存成功')
  }
  enumModalVisible.value = false
}

// 取消枚举字典编辑
const cancelEnumDict = () => {
  enumModalVisible.value = false
  enumItems.value = []
  currentEnumAttribute.value = null
}

// 查看事件详情
const viewEventDetail = (record: EventData) => {
  Message.info(`查看事件详情: ${record.eventName}`)
}

// 编辑事件
const editEvent = (record: EventData) => {
  isEdit.value = true
  showCreateForm.value = true
  
  // 填充表单数据
  eventForm.eventName = record.eventName
  eventForm.sourceSystem = record.eventSource
  eventForm.owner = record.owner
  
  Message.info(`编辑事件: ${record.eventName}`)
}

// 查看抽样统计
const viewSampleStats = (record: EventData) => {
  router.push({
    path: '/exploration/customer-center/event-center/sample-stats',
    query: {
      eventId: record.id,
      eventName: record.eventName
    }
  })
}

// 删除事件
const deleteEvent = (record: EventData) => {
  Modal.warning({
    title: '确认删除',
    content: `确定要删除事件 ${record.eventName}？此操作不可恢复。`,
    okText: '确认删除',
    cancelText: '取消',
    onOk: () => {
      Message.success(`已删除事件: ${record.eventName}`)
      fetchData()
    }
  })
}

// 获取状态颜色
const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    '上线': 'green',
    '下线': 'red'
  }
  return colorMap[status] || 'blue'
}

// 页面加载时获取数据
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.event-management {
  padding: 12px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  background: white;
  padding: 12px 20px;
  border-radius: 6px;
  margin-bottom: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-area {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #1d2129;
  margin: 0;
  line-height: 1.33;
}

.page-description {
  font-size: 13px;
  color: #86909c;
  margin: 0;
  line-height: 1.57;
}

.content-card {
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

.content-card :deep(.arco-card-body) {
  padding: 16px 20px;
}

.filter-section {
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f2f3f5;
}

.search-form {
  margin: 0;
}

.search-form :deep(.arco-form-item) {
  margin-bottom: 0;
  margin-right: 12px;
}

.search-form :deep(.arco-form-item:last-child) {
  margin-right: 0;
}

.table-section {
  margin: 0;
}

.event-table {
  border-radius: 6px;
}

.event-table :deep(.arco-table-th) {
  background-color: #fafafa;
  font-weight: 500;
  font-size: 13px;
  padding: 8px 12px;
}

.event-table :deep(.arco-table-td) {
  padding: 8px 12px;
  font-size: 13px;
}

.event-table :deep(.arco-table-tbody .arco-table-tr:hover .arco-table-td) {
  background-color: #f7f8fa;
}

.create-form {
  background: white;
  border-radius: 6px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  overflow: hidden;
}

.form-header {
  padding: 16px 24px;
  border-bottom: 1px solid #e5e6eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fafafa;
}

.form-title {
  font-size: 18px;
  font-weight: 500;
  color: #1d2129;
  margin: 0;
}

.form-content {
  padding: 24px;
}

.form-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  color: #1d2129;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #165dff;
  display: inline-block;
}

.sampling-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.attributes-section {
  margin-top: 24px;
}

.attributes-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.form-actions {
  padding: 16px 24px;
  border-top: 1px solid #e5e6eb;
  background: #fafafa;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.enum-modal .arco-modal-body {
  padding: 0;
}

.enum-content {
  padding: 24px;
}

.enum-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.enum-title {
  font-size: 16px;
  font-weight: 500;
  color: #1d2129;
  margin: 0;
}

.enum-item {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
}

.enum-item:last-child {
  margin-bottom: 0;
}

.enum-actions {
  padding: 16px 24px;
  border-top: 1px solid #e5e6eb;
  background: #fafafa;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .event-management {
    padding: 8px;
  }
  
  .search-form,
  .form-content {
    padding: 16px;
  }
  
  .page-header,
  .table-header,
  .form-header {
    padding: 12px 16px;
  }
}

/* 新建事件页面样式优化 */
.event-create {
  .form-section {
    margin-bottom: 16px;
  }
  
  .section-card {
    margin-bottom: 0;
  }
  
  :deep(.arco-card-header) {
    padding: 12px 16px;
    border-bottom: 1px solid #f2f3f5;
  }
  
  :deep(.arco-card-body) {
    padding: 16px;
  }
  
  .card-title-with-action {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }
  
  .attribute-table {
    :deep(.arco-table-th) {
      padding: 8px 12px;
      font-size: 13px;
    }
    
    :deep(.arco-table-td) {
      padding: 8px 12px;
    }
  }
}

/* 表格样式优化 */
:deep(.arco-table-th) {
  background-color: #f7f8fa;
  font-weight: 500;
  padding: 10px 12px;
  font-size: 13px;
}

:deep(.arco-table-td) {
  border-bottom: 1px solid #f2f3f5;
  padding: 10px 12px;
}

:deep(.arco-table-tbody .arco-table-tr:hover .arco-table-td) {
  background-color: #f7f8fa;
}

/* 表单样式优化 */
:deep(.arco-form-item-label) {
  font-weight: 500;
  color: #1d2129;
}

:deep(.arco-input),
:deep(.arco-select-view),
:deep(.arco-textarea) {
  border-radius: 4px;
}

:deep(.arco-input:focus),
:deep(.arco-select-view-focus),
:deep(.arco-textarea:focus) {
  border-color: #165dff;
  box-shadow: 0 0 0 2px rgba(22, 93, 255, 0.1);
}

/* 按钮样式优化 */
:deep(.arco-btn-primary) {
  background-color: #165dff;
  border-color: #165dff;
}

:deep(.arco-btn-primary:hover) {
  background-color: #4080ff;
  border-color: #4080ff;
}

/* 开关样式优化 */
:deep(.arco-switch-checked) {
  background-color: #00b42a;
}

/* 标签样式 */
.status-tag {
  border-radius: 4px;
  font-size: 12px;
  padding: 2px 8px;
}

/* 操作按钮样式 */
.action-btn {
  padding: 4px 8px;
  font-size: 12px;
  border-radius: 4px;
}

/* 下拉菜单危险选项样式 */
:deep(.danger-option) {
  color: #f53f3f;
}

:deep(.danger-option:hover) {
  background-color: #ffece8;
  color: #f53f3f;
}
</style>