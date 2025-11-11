<template>
  <div class="result-display">
    <!-- 搜索筛选 -->
    <a-card class="search-card">
      <a-row :gutter="16">
        <a-col :span="8">
          <a-input v-model="searchForm.resultId" placeholder="结果编号" allow-clear />
        </a-col>
        <a-col :span="8">
          <a-input v-model="searchForm.taskId" placeholder="关联任务编号" allow-clear />
        </a-col>
        <a-col :span="8">
          <a-select v-model="searchForm.resultType" placeholder="结果类型" allow-clear>
            <a-option value="">全部</a-option>
            <a-option value="data">数据结果</a-option>
            <a-option value="report">报表结果</a-option>
            <a-option value="chart">图表结果</a-option>
            <a-option value="file">文件结果</a-option>
          </a-select>
        </a-col>
      </a-row>
      <a-row :gutter="16" style="margin-top: 16px;">
        <a-col :span="8">
          <a-select v-model="searchForm.status" placeholder="结果状态" allow-clear>
            <a-option value="">全部</a-option>
            <a-option value="generating">生成中</a-option>
            <a-option value="completed">已完成</a-option>
            <a-option value="failed">生成失败</a-option>
          </a-select>
        </a-col>
        <a-col :span="8">
          <a-range-picker v-model="searchForm.dateRange" style="width: 100%" />
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

    <!-- 结果列表 -->
    <a-card class="list-card">
      <div class="list-header">
        <h3>结果展示列表</h3>
        <a-space>
          <a-button type="outline" @click="batchDownload">
            <template #icon><icon-download /></template>
            批量下载
          </a-button>
          <a-button type="outline" @click="batchShare">
            <template #icon><icon-share-alt /></template>
            批量分享
          </a-button>
          <a-button type="outline" @click="batchDelete">
            <template #icon><icon-delete /></template>
            批量删除
          </a-button>
        </a-space>
      </div>
      
      <a-table
        :data="resultList"
        :loading="loading"
        :row-selection="rowSelection"
        :pagination="pagination"
        @page-change="handlePageChange"
      >
        <template #columns>
          <a-table-column title="结果编号" data-index="resultId" width="120">
            <template #cell="{ record }">
              <a-link @click="showDetail(record)">{{ record.resultId }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="关联任务" data-index="taskId" width="120">
            <template #cell="{ record }">
              <a-link @click="showTaskDetail(record)">{{ record.taskId }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="结果类型" data-index="resultType" width="100">
            <template #cell="{ record }">
              <a-tag :color="getResultTypeColor(record.resultType)">
                {{ getResultTypeText(record.resultType) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="结果名称" data-index="resultName" width="150" />
          <a-table-column title="结果描述" data-index="description" ellipsis />
          <a-table-column title="文件大小" data-index="fileSize" width="100">
            <template #cell="{ record }">
              <span>{{ formatFileSize(record.fileSize) }}</span>
            </template>
          </a-table-column>
          <a-table-column title="结果状态" data-index="status" width="100">
            <template #cell="{ record }">
              <a-tag :color="getStatusColor(record.status)">
                {{ getStatusText(record.status) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="生成时间" data-index="generateTime" width="160" />
          <a-table-column title="过期时间" data-index="expireTime" width="160">
            <template #cell="{ record }">
              <span :style="{ color: getExpireColor(record.expireTime) }">
                {{ record.expireTime }}
              </span>
            </template>
          </a-table-column>
          <a-table-column title="操作" width="200" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-button 
                  v-if="record.status === 'completed'" 
                  type="text" 
                  size="small" 
                  @click="previewResult(record)"
                >
                  预览
                </a-button>
                <a-button 
                  v-if="record.status === 'completed'" 
                  type="text" 
                  size="small" 
                  @click="downloadResult(record)"
                >
                  下载
                </a-button>
                <a-button 
                  v-if="record.status === 'completed'" 
                  type="text" 
                  size="small" 
                  @click="shareResult(record)"
                >
                  分享
                </a-button>
                <a-button 
                  v-if="record.status === 'failed'" 
                  type="text" 
                  size="small" 
                  @click="regenerateResult(record)"
                >
                  重新生成
                </a-button>
                <a-button type="text" size="small" @click="showDetail(record)">
                  详情
                </a-button>
                <a-button 
                  type="text" 
                  status="danger" 
                  size="small" 
                  @click="deleteResult(record)"
                >
                  删除
                </a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <!-- 结果详情弹窗 -->
    <a-modal
      v-model:visible="showDetailModal"
      title="结果详情"
      width="800px"
      :footer="false"
    >
      <div class="detail-content" v-if="currentRecord">
        <a-descriptions :data="detailData" :column="2" bordered />
        
        <div class="result-preview" v-if="currentRecord.status === 'completed'">
          <h4>结果预览</h4>
          <div class="preview-container">
            <div v-if="currentRecord.resultType === 'data'" class="data-preview">
              <a-table :data="previewData" size="small">
                <template #columns>
                  <a-table-column title="字段1" data-index="field1" />
                  <a-table-column title="字段2" data-index="field2" />
                  <a-table-column title="字段3" data-index="field3" />
                </template>
              </a-table>
            </div>
            <div v-else-if="currentRecord.resultType === 'chart'" class="chart-preview">
              <div class="chart-placeholder">
                <icon-bar-chart style="font-size: 48px; color: var(--color-text-3);" />
                <p>图表预览</p>
              </div>
            </div>
            <div v-else class="file-preview">
              <div class="file-placeholder">
                <icon-file style="font-size: 48px; color: var(--color-text-3);" />
                <p>{{ currentRecord.resultName }}</p>
                <p>{{ formatFileSize(currentRecord.fileSize) }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="detail-actions" style="margin-top: 24px; text-align: center;">
          <a-space>
            <a-button 
              v-if="currentRecord.status === 'completed'" 
              type="primary" 
              @click="downloadResult(currentRecord)"
            >
              下载结果
            </a-button>
            <a-button 
              v-if="currentRecord.status === 'completed'" 
              @click="shareResult(currentRecord)"
            >
              分享结果
            </a-button>
            <a-button 
              v-if="currentRecord.status === 'failed'" 
              @click="regenerateResult(currentRecord)"
            >
              重新生成
            </a-button>
            <a-button @click="showDetailModal = false">
              关闭
            </a-button>
          </a-space>
        </div>
      </div>
    </a-modal>

    <!-- 分享弹窗 -->
    <a-modal
      v-model:visible="showShareModal"
      title="分享结果"
      width="500px"
      @ok="handleShareSubmit"
      @cancel="handleShareCancel"
    >
      <a-form :model="shareForm" layout="vertical">
        <a-form-item field="shareType" label="分享类型" required>
          <a-radio-group v-model="shareForm.shareType">
            <a-radio value="link">链接分享</a-radio>
            <a-radio value="email">邮件分享</a-radio>
          </a-radio-group>
        </a-form-item>
        
        <a-form-item v-if="shareForm.shareType === 'email'" field="email" label="接收邮箱" required>
          <a-input v-model="shareForm.email" placeholder="请输入接收邮箱地址" />
        </a-form-item>
        
        <a-form-item field="expiryDays" label="有效期（天）" required>
          <a-input-number 
            v-model="shareForm.expiryDays" 
            :min="1" 
            :max="30" 
            style="width: 100%"
          />
        </a-form-item>
        
        <a-form-item field="remarks" label="备注说明">
          <a-textarea
            v-model="shareForm.remarks"
            placeholder="请输入分享备注说明"
            :rows="3"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import {
  IconSearch,
  IconRefresh,
  IconDownload,
  IconShareAlt,
  IconDelete,
  IconBarChart,
  IconFile
} from '@arco-design/web-vue/es/icon'

// 搜索表单
const searchForm = reactive({
  resultId: '',
  taskId: '',
  resultType: '',
  status: '',
  dateRange: []
})

// 表格数据
const loading = ref(false)
const resultList = ref([
  {
    id: '1',
    resultId: 'RES2024001',
    taskId: 'TASK2024001',
    resultType: 'data',
    resultName: '用户行为数据.xlsx',
    description: '包含用户访问、点击、购买等行为数据的完整数据集',
    fileSize: 2560000,
    status: 'completed',
    generateTime: '2024-01-15 11:30:00',
    expireTime: '2024-01-22 11:30:00',
    filePath: '/results/user_behavior_data.xlsx',
    checksum: 'a1b2c3d4e5f6'
  },
  {
    id: '2',
    resultId: 'RES2024002',
    taskId: 'TASK2024002',
    resultType: 'report',
    resultName: '月度交易报表.pdf',
    description: '2024年1月份交易数据统计分析报告',
    fileSize: 1024000,
    status: 'completed',
    generateTime: '2024-01-14 14:45:00',
    expireTime: '2024-01-21 14:45:00',
    filePath: '/results/monthly_trade_report.pdf',
    checksum: 'b2c3d4e5f6g7'
  },
  {
    id: '3',
    resultId: 'RES2024003',
    taskId: 'TASK2024003',
    resultType: 'chart',
    resultName: '用户留存分析图表.png',
    description: '用户留存率趋势分析图表',
    fileSize: 512000,
    status: 'failed',
    generateTime: '2024-01-13 09:15:00',
    expireTime: '2024-01-20 09:15:00',
    filePath: '',
    checksum: '',
    errorMessage: '数据源连接失败'
  },
  {
    id: '4',
    resultId: 'RES2024004',
    taskId: 'TASK2024004',
    resultType: 'file',
    resultName: '运营分析报告.zip',
    description: '包含多个分析报告的压缩文件',
    fileSize: 5120000,
    status: 'completed',
    generateTime: '2024-01-12 16:30:00',
    expireTime: '2024-01-19 16:30:00',
    filePath: '/results/operation_analysis_report.zip',
    checksum: 'c3d4e5f6g7h8'
  },
  {
    id: '5',
    resultId: 'RES2024005',
    taskId: 'TASK2024005',
    resultType: 'data',
    resultName: '供应商数据.csv',
    description: '供应商基础信息和交易数据',
    fileSize: 1280000,
    status: 'generating',
    generateTime: '2024-01-11 15:20:00',
    expireTime: '2024-01-18 15:20:00',
    filePath: '',
    checksum: ''
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

// 行选择
const selectedRows = ref([])
const rowSelection = reactive({
  type: 'checkbox',
  showCheckedAll: true,
  onSelect: (rowKeys) => {
    selectedRows.value = rowKeys
  }
})

// 详情弹窗
const showDetailModal = ref(false)
const currentRecord = ref(null)

// 分享弹窗
const showShareModal = ref(false)
const shareForm = reactive({
  shareType: 'link',
  email: '',
  expiryDays: 7,
  remarks: ''
})

// 详情数据
const detailData = computed(() => {
  if (!currentRecord.value) return []
  return [
    { label: '结果编号', value: currentRecord.value.resultId },
    { label: '关联任务', value: currentRecord.value.taskId },
    { label: '结果类型', value: getResultTypeText(currentRecord.value.resultType) },
    { label: '结果名称', value: currentRecord.value.resultName },
    { label: '结果描述', value: currentRecord.value.description },
    { label: '文件大小', value: formatFileSize(currentRecord.value.fileSize) },
    { label: '结果状态', value: getStatusText(currentRecord.value.status) },
    { label: '生成时间', value: currentRecord.value.generateTime },
    { label: '过期时间', value: currentRecord.value.expireTime },
    { label: '文件路径', value: currentRecord.value.filePath },
    { label: '校验码', value: currentRecord.value.checksum || '无' }
  ]
})

// 预览数据
const previewData = ref([
  { field1: '数据1', field2: '数据2', field3: '数据3' },
  { field1: '数据4', field2: '数据5', field3: '数据6' },
  { field1: '数据7', field2: '数据8', field3: '数据9' }
])

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
    resultId: '',
    taskId: '',
    resultType: '',
    status: '',
    dateRange: []
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

// 显示任务详情
const showTaskDetail = (record) => {
  Message.info(`查看任务详情: ${record.taskId}`)
}

// 预览结果
const previewResult = (record) => {
  Message.success(`预览结果: ${record.resultName}`)
}

// 下载结果
const downloadResult = (record) => {
  Message.success(`下载结果: ${record.resultName}`)
}

// 分享结果
const shareResult = (record) => {
  currentRecord.value = record
  showShareModal.value = true
}

// 重新生成结果
const regenerateResult = (record) => {
  record.status = 'generating'
  Message.success('开始重新生成结果')
  
  setTimeout(() => {
    record.status = 'completed'
    record.generateTime = new Date().toLocaleString()
    record.expireTime = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleString()
    Message.success('结果重新生成成功')
  }, 3000)
}

// 删除结果
const deleteResult = (record) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除结果 ${record.resultId} 吗？`,
    onOk: () => {
      const index = resultList.value.findIndex(item => item.id === record.id)
      if (index > -1) {
        resultList.value.splice(index, 1)
      }
      Message.success('结果已删除')
    }
  })
}

// 批量操作
const batchDownload = () => {
  if (selectedRows.value.length === 0) {
    Message.warning('请选择要下载的结果')
    return
  }
  Message.success(`批量下载 ${selectedRows.value.length} 个结果成功`)
}

const batchShare = () => {
  if (selectedRows.value.length === 0) {
    Message.warning('请选择要分享的结果')
    return
  }
  Message.success(`批量分享 ${selectedRows.value.length} 个结果成功`)
}

const batchDelete = () => {
  if (selectedRows.value.length === 0) {
    Message.warning('请选择要删除的结果')
    return
  }
  Modal.confirm({
    title: '确认批量删除',
    content: `确定要删除选中的 ${selectedRows.value.length} 个结果吗？`,
    onOk: () => {
      Message.success('批量删除成功')
      selectedRows.value = []
    }
  })
}

// 分享处理
const handleShareSubmit = () => {
  if (shareForm.shareType === 'email' && !shareForm.email) {
    Message.error('请输入接收邮箱地址')
    return
  }
  
  Message.success('结果分享成功')
  showShareModal.value = false
  
  // 重置分享表单
  Object.assign(shareForm, {
    shareType: 'link',
    email: '',
    expiryDays: 7,
    remarks: ''
  })
}

const handleShareCancel = () => {
  showShareModal.value = false
}

// 辅助函数
const getResultTypeColor = (type) => {
  const colors = {
    'data': 'blue',
    'report': 'green',
    'chart': 'purple',
    'file': 'orange'
  }
  return colors[type] || 'gray'
}

const getResultTypeText = (type) => {
  const texts = {
    'data': '数据结果',
    'report': '报表结果',
    'chart': '图表结果',
    'file': '文件结果'
  }
  return texts[type] || type
}

const getStatusColor = (status) => {
  const colors = {
    'generating': 'blue',
    'completed': 'green',
    'failed': 'red'
  }
  return colors[status] || 'gray'
}

const getStatusText = (status) => {
  const texts = {
    'generating': '生成中',
    'completed': '已完成',
    'failed': '生成失败'
  }
  return texts[status] || status
}

const getExpireColor = (expireTime) => {
  const expireDate = new Date(expireTime)
  const now = new Date()
  const diffDays = Math.ceil((expireDate - now) / (1000 * 60 * 60 * 24))
  
  if (diffDays <= 1) return '#f53f3f'
  if (diffDays <= 3) return '#ff7d00'
  return '#00b42a'
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>

<style scoped lang="less">
.result-display {
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
    .result-preview {
      margin-top: 24px;
      
      h4 {
        margin-bottom: 16px;
        color: var(--color-text-1);
      }
      
      .preview-container {
        background-color: var(--color-fill-2);
        padding: 24px;
        border-radius: 8px;
        min-height: 200px;
        
        .data-preview {
          background: white;
          border-radius: 4px;
          overflow: hidden;
        }
        
        .chart-preview,
        .file-preview {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 200px;
          
          p {
            margin-top: 16px;
            color: var(--color-text-3);
          }
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