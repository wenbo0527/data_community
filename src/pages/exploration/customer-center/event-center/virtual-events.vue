<template>
  <div class="virtual-events">
    <!-- 虚拟事件列表页面 -->
    <div class="event-list">
      <!-- 页面头部 -->
      <div class="page-header">
        <div class="header-content">
          <div class="title-area">
            <h2 class="page-title">虚拟事件</h2>
            <span class="page-description">管理虚拟事件，模拟和测试事件场景</span>
          </div>
          <div class="header-actions">
            <a-space size="small">
              <a-input 
                v-model="searchForm.eventName" 
                placeholder="搜索虚拟事件名称" 
                allow-clear 
                style="width: 200px"
                @press-enter="handleSearch"
              >
                <template #prefix>
                  <icon-search style="color: var(--color-text-3)" />
                </template>
              </a-input>
              <a-button type="outline" size="small" @click="importFromEventCenter">
                <template #icon><icon-import /></template>
                从事件中心导入
              </a-button>
              <a-button 
                type="outline" 
                size="small" 
                @click="batchSyncToEventCenter"
                :loading="syncLoading"
                :disabled="selectedEvents.length === 0"
              >
                <template #icon><icon-sync /></template>
                批量同步
              </a-button>
              <a-button type="primary" size="small" @click="showCreateEvent">
                <template #icon><icon-plus /></template>
                新建
              </a-button>
            </a-space>
          </div>
        </div>
      </div>
      
      <!-- 表格区域 -->
      <a-card class="content-card" :bordered="false">
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
            :scroll="{ x: 1400 }"
            :row-selection="{
              type: 'checkbox',
              selectedRowKeys: selectedEvents,
              onSelect: (rowKeys: string[]) => { selectedEvents = rowKeys; },
              onSelectAll: (selected: boolean, selectedRows: EventData[], changeRows: EventData[]) => {
                if (selected) {
                  selectedEvents = tableData.map(item => item.id);
                } else {
                  selectedEvents = [];
                }
              }
            }"
          >
            <template #columns>
              <a-table-column title="虚拟事件名称" data-index="eventName" :width="200">
                <template #cell="{ record }">
                  <a-link @click="viewEventDetail(record)">{{ record.eventName }}</a-link>
                </template>
              </a-table-column>
              <a-table-column title="虚拟事件ID" data-index="eventId" :width="120" />
              <a-table-column title="使用场景" data-index="scenario" :width="120" />
              <a-table-column title="更新人" data-index="updater" :width="100" />
              <a-table-column title="最近更新时间" data-index="updateTime" :width="160">
                <template #cell="{ record }">
                  <span style="font-size: 12px;">{{ record.updateTime }}</span>
                </template>
              </a-table-column>
              <a-table-column title="状态" data-index="status" :width="80">
                <template #cell="{ record }">
                  <a-tag :color="getStatusColor(record.status)" size="small">{{ record.status }}</a-tag>
                </template>
              </a-table-column>
              <a-table-column title="同步状态" data-index="syncStatus" :width="100">
                <template #cell="{ record }">
                  <a-tag :color="getSyncStatusColor(record.syncStatus)" size="small">
                    {{ getSyncStatusText(record.syncStatus) }}
                  </a-tag>
                </template>
              </a-table-column>
              <a-table-column title="操作" :width="180" fixed="right">
                <template #cell="{ record }">
                  <a-space size="mini">
                    <a-button 
                      type="text" 
                      size="mini" 
                      @click="syncToEventCenter(record)"
                      :disabled="record.syncStatus === 'synced'"
                      :loading="syncLoading"
                    >
                      同步
                    </a-button>
                    <a-button type="text" size="mini" @click="editEvent(record)">
                      编辑
                    </a-button>
                    <a-button type="text" size="mini" @click="copyEvent(record)">
                      复制
                    </a-button>
                    <a-button type="text" size="mini" @click="deleteEvent(record)" class="danger-btn">
                      删除
                    </a-button>
                  </a-space>
                </template>
              </a-table-column>
            </template>
          </a-table>
        </div>
      </a-card>
    </div>

    <!-- 新建虚拟事件模态框 -->
    <a-modal
      v-model:visible="createModalVisible"
      title="新建虚拟事件"
      width="800px"
      @ok="saveVirtualEvent"
      @cancel="cancelCreate"
      ok-text="保存"
      cancel-text="取消"
    >
      <a-form :model="createForm" layout="vertical" class="create-form">
        <!-- 基础信息 -->
        <div class="form-section">
          <h4 class="section-title">基础信息</h4>
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="虚拟事件名称" required>
                <a-input 
                  v-model="createForm.eventName" 
                  placeholder="请输入虚拟事件名称"
                  allow-clear
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="虚拟事件ID" required>
                <a-input 
                  v-model="createForm.eventId" 
                  placeholder="请输入虚拟事件ID"
                  allow-clear
                />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="使用场景" required>
                <a-select 
                  v-model="createForm.scenario" 
                  placeholder="请选择使用场景"
                  allow-clear
                >
                  <a-option 
                    v-for="option in scenarioOptions" 
                    :key="option.value" 
                    :value="option.value"
                  >
                    {{ option.label }}
                  </a-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="描述">
                <a-input 
                  v-model="createForm.description" 
                  placeholder="请输入描述信息"
                  allow-clear
                />
              </a-form-item>
            </a-col>
          </a-row>
        </div>

        <!-- 条件设置 -->
        <div class="form-section">
          <div class="section-header">
            <h4 class="section-title">01.创建规则</h4>
            <div class="header-actions">
              <a-button type="outline" size="small" @click="addConditionGroup">
                <template #icon><icon-plus /></template>
                添加组条件
              </a-button>
            </div>
          </div>
          
          <!-- 逻辑关系选择 -->
          <div class="logic-relation-selector">
            <span class="relation-label">条件关系：</span>
            <a-radio-group v-model="createForm.logicRelation" size="small">
              <a-radio value="AND">且</a-radio>
              <a-radio value="OR">或</a-radio>
            </a-radio-group>
          </div>
          
          <div class="conditions-container">
            <div 
              v-for="(group, groupIndex) in createForm.conditionGroups" 
              :key="group.id" 
              class="condition-group"
            >
              <!-- 条件组标识 -->
              <div class="group-header">
                <div class="group-label">
                  <span class="group-number">{{ groupIndex + 1 }}</span>
                  <span class="group-icon">🔗</span>
                </div>
                <div class="group-actions">
                  <a-button 
                    type="text" 
                    size="small" 
                    @click="addCondition(groupIndex)"
                    class="add-condition-btn"
                  >
                    <template #icon><icon-plus /></template>
                    添加条件
                  </a-button>
                  <a-button 
                    type="text" 
                    size="small" 
                    @click="removeConditionGroup(groupIndex)"
                    :disabled="createForm.conditionGroups.length === 1"
                    class="remove-group-btn"
                  >
                    删除组
                  </a-button>
                </div>
              </div>
              
              <!-- 条件列表 -->
              <div class="group-conditions">
                <div 
                  v-for="(condition, conditionIndex) in group.conditions" 
                  :key="conditionIndex" 
                  class="condition-item"
                >
                  <div class="condition-row">
                    <div class="condition-field">
                      <label>事件名</label>
                      <a-select 
                        v-model="condition.field" 
                        placeholder="APP注册"
                        size="small"
                      >
                        <a-option 
                          v-for="option in fieldOptions" 
                          :key="option.value" 
                          :value="option.value"
                        >
                          {{ option.label }}
                        </a-option>
                      </a-select>
                    </div>
                    
                    <div class="condition-operator">
                      <label>属性</label>
                      <a-select 
                        v-model="condition.operator" 
                        placeholder="身份证号"
                        size="small"
                      >
                        <a-option 
                          v-for="option in operatorOptions" 
                          :key="option.value" 
                          :value="option.value"
                        >
                          {{ option.label }}
                        </a-option>
                      </a-select>
                    </div>
                    
                    <div class="condition-logic">
                      <label>操作</label>
                      <a-select 
                        v-model="condition.logic" 
                        size="small"
                      >
                        <a-option 
                          v-for="option in logicOptions" 
                          :key="option.value" 
                          :value="option.value"
                        >
                          {{ option.label }}
                        </a-option>
                      </a-select>
                    </div>
                    
                    <div class="condition-value">
                      <a-input 
                        v-model="condition.value" 
                        placeholder="123"
                        size="small"
                      />
                    </div>
                    
                    <div class="condition-actions">
                      <a-button 
                        type="text" 
                        size="small" 
                        @click="removeCondition(groupIndex, conditionIndex)"
                        :disabled="group.conditions.length === 1 && createForm.conditionGroups.length === 1"
                        class="remove-btn"
                      >
                        删除
                      </a-button>
                    </div>
                  </div>
                  
                  <!-- 组内条件连接符 -->
                  <div v-if="conditionIndex < group.conditions.length - 1" class="condition-connector">
                    <span class="connector-text">且</span>
                  </div>
                </div>
              </div>
              
              <!-- 组间连接符 -->
              <div v-if="groupIndex < createForm.conditionGroups.length - 1" class="group-connector">
                <div class="connector-line"></div>
                <span class="connector-text group-connector-text">
                  {{ createForm.logicRelation === 'AND' ? '且' : '或' }}
                </span>
                <div class="connector-line"></div>
              </div>
            </div>
          </div>
        </div>
      </a-form>
    </a-modal>

    <!-- 从事件中心导入模态框 -->
    <a-modal
      v-model:visible="importModalVisible"
      title="从事件中心导入事件"
      width="1000px"
      @ok="confirmImportEvents"
      @cancel="() => { importModalVisible = false; selectedEvents = []; }"
      ok-text="导入选中事件"
      cancel-text="取消"
    >
      <div class="import-content">
        <div class="import-header">
          <span class="import-description">选择要导入的事件，系统将基于这些事件创建对应的虚拟事件</span>
        </div>
        
        <a-table 
          :data="eventCenterData" 
          :loading="loading" 
          :pagination="{
            current: 1,
            pageSize: 10,
            total: eventCenterData.length,
            showTotal: true,
            size: 'small'
          }"
          class="import-table"
          size="small"
          :scroll="{ x: 800, y: 400 }"
          :row-selection="{
            type: 'checkbox',
            selectedRowKeys: selectedEvents,
            onSelect: (rowKeys: string[]) => { selectedEvents = rowKeys; },
            onSelectAll: (selected: boolean, selectedRows: EventData[], changeRows: EventData[]) => {
              if (selected) {
                selectedEvents = eventCenterData.map(item => item.id);
              } else {
                selectedEvents = [];
              }
            }
          }"
        >
          <template #columns>
            <a-table-column title="事件名称" data-index="eventName" :width="200" />
            <a-table-column title="事件类型" data-index="eventType" :width="120" />
            <a-table-column title="事件来源" data-index="eventSource" :width="120" />
            <a-table-column title="负责人" data-index="owner" :width="100" />
            <a-table-column title="状态" data-index="status" :width="80">
              <template #cell="{ record }">
                <a-tag :color="record.status === '上线' ? 'green' : 'red'" size="small">
                  {{ record.status }}
                </a-tag>
              </template>
            </a-table-column>
            <a-table-column title="创建时间" data-index="createTime" :width="160">
              <template #cell="{ record }">
                <span style="font-size: 12px;">{{ record.createTime }}</span>
              </template>
            </a-table-column>
          </template>
        </a-table>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconSearch, IconPlus, IconSync, IconImport } from '@arco-design/web-vue/es/icon'
import { generateVirtualEventData, generateEventData } from '@/mock/event'

// 类型定义
interface EventData {
  id: string
  eventName: string
  eventId?: string
  eventType?: string
  eventSource?: string
  scenario?: string
  status: string
  updater?: string
  owner?: string
  updateTime: string
  createTime: string
  description?: string
  logicRelation?: string
  conditionGroups?: ConditionGroup[]
  realEventId?: string | null
  syncStatus?: string
  registryKey?: string
  triggerCondition?: string
}

interface ConditionGroup {
  id: number
  conditions: Condition[]
}

interface Condition {
  field: string
  operator: string
  value: string
  logic: string
}

interface SearchForm {
  eventName: string
}

interface CreateForm {
  eventName: string
  eventId: string
  scenario: string
  description: string
  logicRelation: string
  conditionGroups: ConditionGroup[]
}

// 搜索表单
const searchForm = reactive<SearchForm>({
  eventName: ''
})

// 表格数据
const tableData = ref<EventData[]>([])

// 事件中心数据（用于同步）
const eventCenterData = ref<EventData[]>([])

// 同步相关状态
const syncModalVisible = ref(false)
const importModalVisible = ref(false)
const syncLoading = ref(false)
const selectedEvents = ref<string[]>([])

// 加载状态
const loading = ref(false)

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 15,
  total: 0,
  showTotal: true,
  showPageSize: true
})

// 初始化数据
const initData = () => {
  // 生成虚拟事件数据
  const virtualEvents = generateVirtualEventData(25)
  tableData.value = virtualEvents
  pagination.total = virtualEvents.length
  
  // 生成事件中心数据
  eventCenterData.value = generateEventData(50)
}

// 获取状态颜色
const getStatusColor = (status: string) => {
  switch (status) {
    case '已上线':
      return 'green'
    case '已下线':
      return 'red'
    case '草稿':
      return 'gray'
    default:
      return 'blue'
  }
}

// 获取同步状态颜色
const getSyncStatusColor = (status: string) => {
  switch (status) {
    case 'synced':
      return 'green'
    case 'pending':
      return 'orange'
    case 'failed':
      return 'red'
    default:
      return 'gray'
  }
}

// 获取同步状态文本
const getSyncStatusText = (status: string) => {
  switch (status) {
    case 'synced':
      return '已同步'
    case 'pending':
      return '待同步'
    case 'failed':
      return '同步失败'
    default:
      return '未同步'
  }
}

// 搜索处理
const handleSearch = () => {
  console.log('搜索:', searchForm.eventName)
  // 这里添加搜索逻辑
}

// 从事件中心导入事件
const importFromEventCenter = () => {
  importModalVisible.value = true
}

// 同步虚拟事件到事件中心
const syncToEventCenter = (record: EventData) => {
  syncLoading.value = true
  
  // 模拟同步过程
  setTimeout(() => {
    // 更新虚拟事件的同步状态
    const index = tableData.value.findIndex((item: EventData) => item.id === record.id)
    if (index !== -1) {
      tableData.value[index].syncStatus = 'synced'
    }
    
    syncLoading.value = false
    Message.success(`虚拟事件"${record.eventName}"已成功同步到事件中心`)
  }, 2000)
}

// 批量同步选中的虚拟事件
const batchSyncToEventCenter = () => {
  if (selectedEvents.value.length === 0) {
    Message.warning('请选择要同步的虚拟事件')
    return
  }
  
  syncLoading.value = true
  let syncedCount = 0
  
  selectedEvents.value.forEach((eventId: string, index: number) => {
    setTimeout(() => {
      const record = tableData.value.find((item: EventData) => item.id === eventId)
      if (record && record.syncStatus !== 'synced') {
        record.syncStatus = 'synced'
        syncedCount++
      }
      
      if (index === selectedEvents.value.length - 1) {
        setTimeout(() => {
          syncLoading.value = false
          Message.success(`成功同步${syncedCount}个虚拟事件到事件中心`)
          selectedEvents.value = []
        }, 1000)
      }
    }, index * 500)
  })
}

// 确认导入选中的事件
const confirmImportEvents = () => {
  if (selectedEvents.value.length === 0) {
    Message.warning('请选择要导入的事件')
    return
  }
  
  selectedEvents.value.forEach((eventId: string) => {
    const realEvent = eventCenterData.value.find((item: EventData) => item.id === eventId)
    if (realEvent) {
      // 创建基于真实事件的虚拟事件
      const virtualEvent: EventData = {
        id: `VE${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        eventName: `${realEvent.eventName}虚拟事件`,
        eventId: `virtual_${realEvent.id.toLowerCase()}`,
        scenario: '营销触达',
        status: '草稿',
        updater: '当前用户',
        updateTime: new Date().toLocaleString('zh-CN'),
        createTime: new Date().toLocaleString('zh-CN'),
        description: `基于事件中心"${realEvent.eventName}"创建的虚拟事件`,
        logicRelation: 'AND',
        conditionGroups: [
          {
            id: 1,
            conditions: [
              {
                field: realEvent.eventName,
                operator: '用户ID',
                value: '',
                logic: '等于'
              }
            ]
          }
        ],
        realEventId: realEvent.id,
        syncStatus: 'synced'
      }
      
      tableData.value.unshift(virtualEvent)
      pagination.total += 1
    }
  })
  
  Message.success(`成功导入${selectedEvents.value.length}个事件`)
  importModalVisible.value = false
  selectedEvents.value = []
}

// 新建事件模态框状态
const createModalVisible = ref(false)

// 新建事件表单
const createForm = reactive<CreateForm>({
  eventName: '',
  eventId: '',
  scenario: '',
  description: '',
  logicRelation: 'AND', // 条件间的逻辑关系：AND 或 OR
  conditionGroups: [
    {
      id: 1,
      conditions: [
        {
          field: 'APP注册',
          operator: '身份证号',
          value: '123',
          logic: '等于'
        }
      ]
    }
  ]
})

// 使用场景选项
const scenarioOptions = [
  { label: '营销触达', value: '营销触达' },
  { label: '风险控制', value: '风险控制' },
  { label: '用户分析', value: '用户分析' },
  { label: '行为监控', value: '行为监控' }
]

// 条件字段选项
const fieldOptions = [
  { label: 'APP注册', value: 'APP注册' },
  { label: '用户登录', value: '用户登录' },
  { label: '订单支付', value: '订单支付' },
  { label: '页面访问', value: '页面访问' }
]

// 操作符选项
const operatorOptions = [
  { label: '身份证号', value: '身份证号' },
  { label: '手机号', value: '手机号' },
  { label: '用户ID', value: '用户ID' },
  { label: '设备ID', value: '设备ID' }
]

// 逻辑操作符选项
const logicOptions = [
  { label: '等于', value: '等于' },
  { label: '不等于', value: '不等于' },
  { label: '包含', value: '包含' },
  { label: '不包含', value: '不包含' }
]

// 新建事件
const showCreateEvent = () => {
  createModalVisible.value = true
}

// 添加条件组
const addConditionGroup = () => {
  const newId = Math.max(...createForm.conditionGroups.map(g => g.id)) + 1
  createForm.conditionGroups.push({
    id: newId,
    conditions: [
      {
        field: '',
        operator: '',
        value: '',
        logic: '等于'
      }
    ]
  })
}

// 添加条件到指定组
const addCondition = (groupIndex: number) => {
  createForm.conditionGroups[groupIndex].conditions.push({
    field: '',
    operator: '',
    value: '',
    logic: '等于'
  })
}

// 删除条件
const removeCondition = (groupIndex: number, conditionIndex: number) => {
  const group = createForm.conditionGroups[groupIndex]
  if (group.conditions.length > 1) {
    group.conditions.splice(conditionIndex, 1)
  } else if (createForm.conditionGroups.length > 1) {
    // 如果组内只有一个条件且有多个组，删除整个组
    createForm.conditionGroups.splice(groupIndex, 1)
  }
}

// 删除条件组
const removeConditionGroup = (groupIndex: number) => {
  if (createForm.conditionGroups.length > 1) {
    createForm.conditionGroups.splice(groupIndex, 1)
  }
}

// 保存虚拟事件
const saveVirtualEvent = () => {
  // 表单验证
  if (!createForm.eventName) {
    Message.error('请输入虚拟事件名称')
    return
  }
  if (!createForm.eventId) {
    Message.error('请输入虚拟事件ID')
    return
  }
  if (!createForm.scenario) {
    Message.error('请选择使用场景')
    return
  }

  // 模拟保存
  const newEvent = {
    id: `VE${Date.now()}`,
    eventName: createForm.eventName,
    eventId: createForm.eventId,
    scenario: createForm.scenario,
    updater: '当前用户',
    updateTime: new Date().toLocaleString('zh-CN'),
    createTime: new Date().toLocaleString('zh-CN'),
    status: '草稿'
  }
  
  tableData.value.unshift(newEvent)
  pagination.total += 1
  
  Message.success('虚拟事件创建成功')
  createModalVisible.value = false
  resetCreateForm()
}

// 重置表单
const resetCreateForm = () => {
  createForm.eventName = ''
  createForm.eventId = ''
  createForm.scenario = ''
  createForm.description = ''
  createForm.logicRelation = 'AND'
  createForm.conditionGroups = [
    {
      id: 1,
      conditions: [
        {
          field: 'APP注册',
          operator: '身份证号',
          value: '123',
          logic: '等于'
        }
      ]
    }
  ]
}

// 取消创建
const cancelCreate = () => {
  createModalVisible.value = false
  resetCreateForm()
}

// 查看事件详情
const viewEventDetail = (record: EventData) => {
  console.log('查看详情:', record)
  Message.info('查看详情功能开发中...')
}

// 编辑事件
const editEvent = (record: EventData) => {
  console.log('编辑事件:', record)
  Message.info('编辑功能开发中...')
}

// 复制事件
const copyEvent = (record: EventData) => {
  console.log('复制事件:', record)
  Message.success('复制成功')
}

// 删除事件
const deleteEvent = (record: EventData) => {
  console.log('删除事件:', record)
  Message.warning('删除功能开发中...')
}

// 分页变化
const onPageChange = (page: number) => {
  pagination.current = page
  console.log('页码变化:', page)
}

const onPageSizeChange = (pageSize: number) => {
  pagination.pageSize = pageSize
  pagination.current = 1
  console.log('页大小变化:', pageSize)
}

// 组件挂载
onMounted(() => {
  initData()
})
</script>

<style scoped>
.virtual-events {
  padding: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.event-list {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* 页面头部样式 */
.page-header {
  background: #fff;
  border-bottom: 1px solid #f2f3f5;
  padding: 16px 24px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-area {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1d2129;
}

.page-description {
  font-size: 14px;
  color: #86909c;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 内容卡片样式 */
.content-card {
  flex: 1;
  margin: 16px 24px;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.table-section {
  padding: 0;
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

/* 按钮样式 */
:deep(.arco-btn-primary) {
  background-color: #165dff;
  border-color: #165dff;
}

:deep(.arco-btn-primary:hover) {
  background-color: #4080ff;
  border-color: #4080ff;
}

.danger-btn {
  color: #f53f3f;
}

.danger-btn:hover {
  background-color: #ffece8;
  color: #f53f3f;
}

/* 输入框样式 */
:deep(.arco-input) {
  border-radius: 4px;
}

:deep(.arco-input:focus) {
  border-color: #165dff;
  box-shadow: 0 0 0 2px rgba(22, 93, 255, 0.1);
}

/* 新建虚拟事件模态框样式 */
.create-form {
  padding: 0 10px;
}

.section-title {
  font-size: 15px;
  font-weight: 500;
  margin-bottom: 16px;
  color: #1d2129;
}

.form-section {
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.logic-relation-selector {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding: 12px;
  background: #f2f3f5;
  border-radius: 6px;
}

.relation-label {
  font-size: 14px;
  color: #4e5969;
  font-weight: 500;
}

.conditions-container {
  border: 1px solid #e5e6eb;
  border-radius: 8px;
  padding: 20px;
  background: #fafbfc;
}

.condition-group {
  margin-bottom: 20px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  background: white;
  overflow: hidden;
}

.condition-group:last-child {
  margin-bottom: 0;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f7f8fa;
  border-bottom: 1px solid #e5e6eb;
}

.group-label {
  display: flex;
  align-items: center;
  gap: 8px;
}

.group-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: #165dff;
  color: white;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 600;
}

.group-icon {
  font-size: 16px;
}

.group-actions {
  display: flex;
  gap: 8px;
}

.add-condition-btn {
  color: #165dff;
}

.remove-group-btn {
  color: #f53f3f;
}

.group-conditions {
  padding: 16px;
}

.condition-item {
  margin-bottom: 12px;
}

.condition-item:last-child {
  margin-bottom: 0;
}

.condition-row {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  padding: 12px;
  background: #f9f9f9;
  border: 1px solid #e5e6eb;
  border-radius: 6px;
}

.condition-field,
.condition-operator,
.condition-logic {
  flex: 1;
  min-width: 120px;
}

.condition-value {
  flex: 1.5;
  min-width: 150px;
}

.condition-actions {
  flex-shrink: 0;
}

.condition-field label,
.condition-operator label,
.condition-logic label {
  display: block;
  margin-bottom: 4px;
  font-size: 12px;
  color: #86909c;
  font-weight: 500;
}

.condition-connector {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 24px;
  margin: 8px 0;
}

.group-connector {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 16px 0;
  position: relative;
}

.connector-line {
  flex: 1;
  height: 1px;
  background: #d9d9d9;
}

.connector-text {
  background: #165dff;
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.group-connector-text {
  background: #00b42a;
  margin: 0 16px;
  padding: 6px 16px;
  font-size: 14px;
  font-weight: 600;
}

.remove-btn {
  color: #f53f3f;
}

.remove-btn:hover {
  background: #ffece8;
  color: #f53f3f;
}

:deep(.arco-modal-header) {
  border-bottom: 1px solid #f2f3f5;
  padding: 16px 20px;
}

:deep(.arco-modal-footer) {
  border-top: 1px solid #f2f3f5;
  padding: 12px 20px;
}

:deep(.arco-modal-title) {
  font-size: 16px;
  font-weight: 600;
}

:deep(.arco-form-item-label) {
  font-weight: 500;
}

:deep(.arco-select-view) {
  border-radius: 4px;
}

:deep(.arco-btn-primary) {
  background-color: #165dff;
  border-color: #165dff;
}

:deep(.arco-btn-primary:hover) {
  background-color: #4080ff;
  border-color: #4080ff;
}

/* 导入模态框样式 */
.import-content {
  padding: 0;
}

.import-header {
  margin-bottom: 16px;
  padding: 12px 16px;
  background: #f7f8fa;
  border-radius: 6px;
  border-left: 3px solid #165dff;
}

.import-description {
  font-size: 14px;
  color: #4e5969;
  line-height: 1.5;
}

.import-table {
  border: 1px solid #e5e6eb;
  border-radius: 6px;
}

:deep(.import-table .arco-table-th) {
  background: #f7f8fa;
  font-weight: 600;
}

:deep(.import-table .arco-table-td) {
  border-bottom: 1px solid #f2f3f5;
}

:deep(.import-table .arco-table-tr:hover .arco-table-td) {
  background: #f7f8fa;
}
</style>