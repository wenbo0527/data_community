<template>
  <div class="accompany-service">
    <!-- 搜索筛选 -->
    <a-card class="search-card">
      <a-row :gutter="16">
        <a-col :span="8">
          <a-input v-model="searchForm.serviceId" placeholder="陪跑服务编号" allow-clear />
        </a-col>
        <a-col :span="8">
          <a-input v-model="searchForm.customerName" placeholder="客户名称" allow-clear />
        </a-col>
        <a-col :span="8">
          <a-select v-model="searchForm.serviceType" placeholder="服务类型" allow-clear>
            <a-option value="">全部</a-option>
            <a-option value="data-implementation">数据实施</a-option>
            <a-option value="technical-support">技术支持</a-option>
            <a-option value="business-consulting">业务咨询</a-option>
            <a-option value="training-service">培训服务</a-option>
          </a-select>
        </a-col>
      </a-row>
      <a-row :gutter="16" style="margin-top: 16px;">
        <a-col :span="8">
          <a-select v-model="searchForm.servicePhase" placeholder="服务阶段" allow-clear>
            <a-option value="">全部</a-option>
            <a-option value="requirement">需求调研</a-option>
            <a-option value="design">方案设计</a-option>
            <a-option value="implementation">实施部署</a-option>
            <a-option value="testing">测试验收</a-option>
            <a-option value="maintenance">运维支持</a-option>
          </a-select>
        </a-col>
        <a-col :span="8">
          <a-select v-model="searchForm.status" placeholder="服务状态" allow-clear>
            <a-option value="">全部</a-option>
            <a-option value="planning">规划中</a-option>
            <a-option value="in-progress">进行中</a-option>
            <a-option value="completed">已完成</a-option>
            <a-option value="suspended">已暂停</a-option>
          </a-select>
        </a-col>
        <a-col :span="8">
          <a-space>
            <a-button type="primary" @click="handleSearch">
              <template #icon><icon-search /></template>
              查询
            </a-button>
            <a-button @click="handleReset">
              <template #icon><icon-refresh /></template>
              重置
            </a-button>
          </a-space>
        </a-col>
      </a-row>
    </a-card>

    <!-- 陪跑服务列表 -->
    <a-card class="list-card">
      <div class="list-header">
        <h3>陪跑服务列表</h3>
        <a-space>
          <a-button type="outline" @click="showCreateModal = true">
            <template #icon><icon-plus /></template>
            新建服务
          </a-button>
          <a-button type="outline" @click="batchExport">
            <template #icon><icon-download /></template>
            导出服务
          </a-button>
        </a-space>
      </div>
      
      <a-table
        :data="serviceList"
        :loading="loading"
        :pagination="pagination"
        @page-change="handlePageChange"
      >
        <template #columns>
          <a-table-column title="服务编号" data-index="serviceId" width="120">
            <template #cell="{ record }">
              <a-link @click="showDetail(record)">{{ record.serviceId }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="客户名称" data-index="customerName" width="150" />
          <a-table-column title="服务类型" data-index="serviceType" width="120">
            <template #cell="{ record }">
              <a-tag :color="getServiceTypeColor(record.serviceType)">
                {{ getServiceTypeText(record.serviceType) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="服务阶段" data-index="servicePhase" width="120">
            <template #cell="{ record }">
              <a-tag :color="getServicePhaseColor(record.servicePhase)">
                {{ getServicePhaseText(record.servicePhase) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="服务状态" data-index="status" width="100">
            <template #cell="{ record }">
              <a-tag :color="getStatusColor(record.status)">
                {{ getStatusText(record.status) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="服务负责人" data-index="serviceManager" width="120" />
          <a-table-column title="开始时间" data-index="startTime" width="160" />
          <a-table-column title="预计结束" data-index="expectedEndTime" width="160" />
          <a-table-column title="完成进度" data-index="progress" width="120">
            <template #cell="{ record }">
              <a-progress 
                :percent="record.progress" 
                :status="getProgressStatus(record.status)"
                size="small"
              />
            </template>
          </a-table-column>
          <a-table-column title="服务评分" data-index="rating" width="100">
            <template #cell="{ record }">
              <a-rate :model-value="record.rating" readonly allow-half />
            </template>
          </a-table-column>
          <a-table-column title="操作" width="200" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="showDetail(record)">
                  详情
                </a-button>
                <a-button 
                  v-if="record.status === 'in-progress'" 
                  type="text" 
                  size="small" 
                  @click="updateProgress(record)"
                >
                  更新进度
                </a-button>
                <a-button 
                  v-if="record.status === 'in-progress'" 
                  type="text" 
                  size="small" 
                  @click="completeService(record)"
                >
                  完成服务
                </a-button>
                <a-button 
                  v-if="record.status === 'in-progress'" 
                  type="text" 
                  size="small" 
                  @click="suspendService(record)"
                >
                  暂停服务
                </a-button>
                <a-button 
                  v-if="record.status === 'suspended'" 
                  type="text" 
                  size="small" 
                  @click="resumeService(record)"
                >
                  恢复服务
                </a-button>
                <a-button 
                  type="text" 
                  status="danger" 
                  size="small" 
                  @click="deleteService(record)"
                >
                  删除
                </a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <!-- 新建服务弹窗 -->
    <a-modal
      v-model:visible="showCreateModal"
      title="新建陪跑服务"
      width="800px"
      @ok="handleCreateSubmit"
      @cancel="handleCreateCancel"
    >
      <a-form :model="createForm" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="customerName" label="客户名称" required>
              <a-input v-model="createForm.customerName" placeholder="请输入客户名称" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="serviceType" label="服务类型" required>
              <a-select v-model="createForm.serviceType" placeholder="请选择服务类型">
                <a-option value="data-implementation">数据实施</a-option>
                <a-option value="technical-support">技术支持</a-option>
                <a-option value="business-consulting">业务咨询</a-option>
                <a-option value="training-service">培训服务</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="servicePhase" label="服务阶段" required>
              <a-select v-model="createForm.servicePhase" placeholder="请选择服务阶段">
                <a-option value="requirement">需求调研</a-option>
                <a-option value="design">方案设计</a-option>
                <a-option value="implementation">实施部署</a-option>
                <a-option value="testing">测试验收</a-option>
                <a-option value="maintenance">运维支持</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="serviceManager" label="服务负责人" required>
              <a-input v-model="createForm.serviceManager" placeholder="请输入服务负责人" />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="startTime" label="开始时间" required>
              <a-date-picker 
                v-model="createForm.startTime" 
                style="width: 100%"
                placeholder="请选择开始时间"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="expectedEndTime" label="预计结束时间" required>
              <a-date-picker 
                v-model="createForm.expectedEndTime" 
                style="width: 100%"
                placeholder="请选择预计结束时间"
              />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-form-item field="serviceContent" label="服务内容" required>
          <a-textarea
            v-model="createForm.serviceContent"
            placeholder="请详细描述服务内容和目标"
            :rows="4"
          />
        </a-form-item>
        
        <a-form-item field="requirements" label="客户需求">
          <a-textarea
            v-model="createForm.requirements"
            placeholder="请输入客户的具体需求"
            :rows="3"
          />
        </a-form-item>
        
        <a-form-item field="notes" label="备注说明">
          <a-textarea
            v-model="createForm.notes"
            placeholder="请输入其他备注说明"
            :rows="2"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 服务详情弹窗 -->
    <a-modal
      v-model:visible="showDetailModal"
      title="陪跑服务详情"
      width="800px"
      :footer="false"
    >
      <div class="detail-content" v-if="currentRecord">
        <a-descriptions :data="detailData" :column="2" bordered />
        
        <div class="service-progress" style="margin-top: 24px;">
          <h4>服务进度</h4>
          <a-timeline>
            <a-timeline-item 
              v-for="(item, index) in serviceProgress" 
              :key="index"
              :label="item.time"
              :dot-color="getProgressDotColor(item.status)"
            >
              <div class="progress-item">
                <div class="progress-title">{{ item.title }}</div>
                <div class="progress-content">{{ item.content }}</div>
                <div class="progress-status" :style="{ color: getProgressStatusColor(item.status) }">
                  {{ getProgressStatusText(item.status) }}
                </div>
              </div>
            </a-timeline-item>
          </a-timeline>
        </div>
        
        <div class="detail-actions" style="margin-top: 24px; text-align: center;">
          <a-space>
            <a-button 
              v-if="currentRecord.status === 'in-progress'" 
              type="primary" 
              @click="updateProgress(currentRecord)"
            >
              更新进度
            </a-button>
            <a-button 
              v-if="currentRecord.status === 'in-progress'" 
              @click="completeService(currentRecord)"
            >
              完成服务
            </a-button>
            <a-button @click="showDetailModal = false">
              关闭
            </a-button>
          </a-space>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import {
  IconSearch,
  IconRefresh,
  IconPlus,
  IconDownload
} from '@arco-design/web-vue/es/icon'

// 搜索表单
const searchForm = reactive({
  serviceId: '',
  customerName: '',
  serviceType: '',
  servicePhase: '',
  status: ''
})

// 表格数据
const loading = ref(false)
const serviceList = ref([
  {
    id: '1',
    serviceId: 'SERVICE2024001',
    customerName: 'ABC科技有限公司',
    serviceType: 'data-implementation',
    servicePhase: 'implementation',
    status: 'in-progress',
    serviceManager: '张经理',
    startTime: '2024-01-01 09:00:00',
    expectedEndTime: '2024-03-31 18:00:00',
    progress: 65,
    rating: 4.5,
    serviceContent: '数据平台实施部署服务，包括数据接入、处理、分析等全流程支持',
    requirements: '需要支持实时数据处理，提供可视化分析界面',
    notes: '客户对实施进度比较满意'
  },
  {
    id: '2',
    serviceId: 'SERVICE2024002',
    customerName: 'XYZ金融集团',
    serviceType: 'technical-support',
    servicePhase: 'maintenance',
    status: 'in-progress',
    serviceManager: '李工程师',
    startTime: '2024-01-15 09:00:00',
    expectedEndTime: '2024-12-31 18:00:00',
    progress: 30,
    rating: 4.8,
    serviceContent: '技术支持服务，包括系统维护、故障处理、性能优化等',
    requirements: '需要提供7x24小时技术支持服务',
    notes: '客户满意度较高'
  },
  {
    id: '3',
    serviceId: 'SERVICE2024003',
    customerName: 'DEF制造企业',
    serviceType: 'business-consulting',
    servicePhase: 'design',
    status: 'completed',
    serviceManager: '王顾问',
    startTime: '2023-11-01 09:00:00',
    expectedEndTime: '2024-01-31 18:00:00',
    progress: 100,
    rating: 4.2,
    serviceContent: '业务咨询服务，帮助客户制定数据化转型方案',
    requirements: '需要深入了解业务流程，提供定制化解决方案',
    notes: '项目按时完成，客户反馈良好'
  },
  {
    id: '4',
    serviceId: 'SERVICE2024004',
    customerName: 'GHI零售连锁',
    serviceType: 'training-service',
    servicePhase: 'requirement',
    status: 'planning',
    serviceManager: '赵培训师',
    startTime: '2024-02-01 09:00:00',
    expectedEndTime: '2024-02-28 18:00:00',
    progress: 0,
    rating: 0,
    serviceContent: '员工数据技能培训服务',
    requirements: '需要针对不同岗位提供定制化培训课程',
    notes: '正在准备培训材料'
  },
  {
    id: '5',
    serviceId: 'SERVICE2024005',
    customerName: 'JKL医疗集团',
    serviceType: 'data-implementation',
    servicePhase: 'testing',
    status: 'suspended',
    serviceManager: '陈工程师',
    startTime: '2024-01-10 09:00:00',
    expectedEndTime: '2024-04-30 18:00:00',
    progress: 80,
    rating: 4.0,
    serviceContent: '医疗数据平台实施',
    requirements: '需要符合医疗行业数据安全标准',
    notes: '因客户需求变更暂停服务'
  }
])

// 分页配置
const pagination = reactive({
  total: 5,
  current: 1,
  pageSize: 10,
  showTotal: true,
  showJumper: true,
  showPageSize: true
})

// 弹窗状态
const showCreateModal = ref(false)
const showDetailModal = ref(false)
const currentRecord = ref(null)

// 创建表单
const createForm = reactive({
  customerName: '',
  serviceType: '',
  servicePhase: '',
  serviceManager: '',
  startTime: '',
  expectedEndTime: '',
  serviceContent: '',
  requirements: '',
  notes: ''
})

// 服务进度数据
const serviceProgress = ref([
  {
    title: '需求调研',
    content: '深入了解客户需求，制定服务方案',
    time: '2024-01-01 09:00:00',
    status: 'completed'
  },
  {
    title: '方案设计',
    content: '根据需求设计详细的技术方案',
    time: '2024-01-15 14:00:00',
    status: 'completed'
  },
  {
    title: '实施部署',
    content: '按照方案进行系统实施和部署',
    time: '2024-02-01 10:00:00',
    status: 'in-progress'
  },
  {
    title: '测试验收',
    content: '系统功能测试和用户验收',
    time: '2024-03-15 15:00:00',
    status: 'pending'
  },
  {
    title: '运维支持',
    content: '提供持续的运维支持服务',
    time: '2024-03-20 09:00:00',
    status: 'pending'
  }
])

// 详情数据
const detailData = computed(() => {
  if (!currentRecord.value) return []
  return [
    { label: '服务编号', value: currentRecord.value.serviceId },
    { label: '客户名称', value: currentRecord.value.customerName },
    { label: '服务类型', value: getServiceTypeText(currentRecord.value.serviceType) },
    { label: '服务阶段', value: getServicePhaseText(currentRecord.value.servicePhase) },
    { label: '服务状态', value: getStatusText(currentRecord.value.status) },
    { label: '服务负责人', value: currentRecord.value.serviceManager },
    { label: '开始时间', value: currentRecord.value.startTime },
    { label: '预计结束', value: currentRecord.value.expectedEndTime },
    { label: '完成进度', value: `${currentRecord.value.progress}%` },
    { label: '服务评分', value: currentRecord.value.rating || '暂无评分' },
    { label: '服务内容', value: currentRecord.value.serviceContent },
    { label: '客户需求', value: currentRecord.value.requirements },
    { label: '备注说明', value: currentRecord.value.notes }
  ]
})

// 搜索方法
const handleSearch = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    Message.success('搜索完成')
  }, 1000)
}

const handleReset = () => {
  Object.assign(searchForm, {
    serviceId: '',
    customerName: '',
    serviceType: '',
    servicePhase: '',
    status: ''
  })
  handleSearch()
}

// 分页处理
const handlePageChange = (page) => {
  pagination.current = page
}

// 显示详情
const showDetail = (record) => {
  currentRecord.value = record
  showDetailModal.value = true
}

// 更新进度
const updateProgress = (record) => {
  Modal.confirm({
    title: '更新服务进度',
    content: `确定要将服务 ${record.serviceId} 的进度更新到 ${record.progress + 5}% 吗？`,
    onOk: () => {
      record.progress = Math.min(100, record.progress + 5)
      Message.success('服务进度更新成功')
    }
  })
}

// 完成服务
const completeService = (record) => {
  Modal.confirm({
    title: '完成服务',
    content: `确定要完成服务 ${record.serviceId} 吗？`,
    onOk: () => {
      record.status = 'completed'
      record.progress = 100
      Message.success('服务已完成')
    }
  })
}

// 暂停服务
const suspendService = (record) => {
  Modal.confirm({
    title: '暂停服务',
    content: `确定要暂停服务 ${record.serviceId} 吗？`,
    onOk: () => {
      record.status = 'suspended'
      Message.success('服务已暂停')
    }
  })
}

// 恢复服务
const resumeService = (record) => {
  record.status = 'in-progress'
  Message.success('服务已恢复')
}

// 删除服务
const deleteService = (record) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除服务 ${record.serviceId} 吗？`,
    onOk: () => {
      const index = serviceList.value.findIndex(item => item.id === record.id)
      if (index > -1) {
        serviceList.value.splice(index, 1)
      }
      Message.success('服务已删除')
    }
  })
}

// 批量导出
const batchExport = () => {
  Message.success('陪跑服务导出成功')
}

// 创建服务
const handleCreateSubmit = () => {
  if (!createForm.customerName || !createForm.serviceType || !createForm.servicePhase) {
    Message.error('请填写完整的服务信息')
    return
  }
  
  const newService = {
    id: Date.now().toString(),
    serviceId: `SERVICE${Date.now()}`,
    customerName: createForm.customerName,
    serviceType: createForm.serviceType,
    servicePhase: createForm.servicePhase,
    status: 'planning',
    serviceManager: createForm.serviceManager,
    startTime: createForm.startTime,
    expectedEndTime: createForm.expectedEndTime,
    progress: 0,
    rating: 0,
    serviceContent: createForm.serviceContent,
    requirements: createForm.requirements,
    notes: createForm.notes
  }
  
  serviceList.value.unshift(newService)
  showCreateModal.value = false
  Message.success('陪跑服务创建成功')
  
  // 重置表单
  Object.assign(createForm, {
    customerName: '',
    serviceType: '',
    servicePhase: '',
    serviceManager: '',
    startTime: '',
    expectedEndTime: '',
    serviceContent: '',
    requirements: '',
    notes: ''
  })
}

const handleCreateCancel = () => {
  showCreateModal.value = false
}

// 辅助函数
const getServiceTypeColor = (type) => {
  const colors = {
    'data-implementation': 'blue',
    'technical-support': 'green',
    'business-consulting': 'purple',
    'training-service': 'orange'
  }
  return colors[type] || 'gray'
}

const getServiceTypeText = (type) => {
  const texts = {
    'data-implementation': '数据实施',
    'technical-support': '技术支持',
    'business-consulting': '业务咨询',
    'training-service': '培训服务'
  }
  return texts[type] || type
}

const getServicePhaseColor = (phase) => {
  const colors = {
    'requirement': 'orange',
    'design': 'blue',
    'implementation': 'green',
    'testing': 'purple',
    'maintenance': 'cyan'
  }
  return colors[phase] || 'gray'
}

const getServicePhaseText = (phase) => {
  const texts = {
    'requirement': '需求调研',
    'design': '方案设计',
    'implementation': '实施部署',
    'testing': '测试验收',
    'maintenance': '运维支持'
  }
  return texts[phase] || phase
}

const getStatusColor = (status) => {
  const colors = {
    'planning': 'orange',
    'in-progress': 'blue',
    'completed': 'green',
    'suspended': 'red'
  }
  return colors[status] || 'gray'
}

const getStatusText = (status) => {
  const texts = {
    'planning': '规划中',
    'in-progress': '进行中',
    'completed': '已完成',
    'suspended': '已暂停'
  }
  return texts[status] || status
}

const getProgressStatus = (status) => {
  const statuses = {
    'in-progress': 'normal',
    'completed': 'success',
    'suspended': 'exception'
  }
  return statuses[status] || 'normal'
}

const getProgressDotColor = (status) => {
  const colors = {
    'completed': 'green',
    'in-progress': 'blue',
    'pending': 'gray'
  }
  return colors[status] || 'gray'
}

const getProgressStatusColor = (status) => {
  const colors = {
    'completed': '#00b42a',
    'in-progress': '#165dff',
    'pending': '#86909c'
  }
  return colors[status] || '#86909c'
}

const getProgressStatusText = (status) => {
  const texts = {
    'completed': '已完成',
    'in-progress': '进行中',
    'pending': '待开始'
  }
  return texts[status] || status
}
</script>

<style scoped lang="less">
.accompany-service {
  .search-card {
    margin-bottom: 16px;
    border-radius: 8px;
  }
  
  .list-card {
    border-radius: 8px;
    
    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      
      h3 {
        margin: 0;
        font-size: 16px;
        color: var(--color-text-1);
      }
    }
  }
  
  .detail-content {
    .service-progress {
      margin-top: 24px;
      
      h4 {
        margin-bottom: 16px;
        color: var(--color-text-1);
      }
      
      .progress-item {
        .progress-title {
          font-weight: 500;
          margin-bottom: 4px;
        }
        
        .progress-content {
          color: var(--color-text-3);
          margin-bottom: 4px;
        }
        
        .progress-status {
          font-size: 12px;
          font-weight: 500;
        }
      }
    }
    
    .detail-actions {
      margin-top: 24px;
      text-align: center;
    }
  }
}
</style>