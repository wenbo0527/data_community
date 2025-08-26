<template>
  <div class="credit-records">
    <div class="section-header">
      <h4>信贷产品征信记录</h4>
      <div class="copy-actions">
        <a-button size="small" @click="copyData('selected')" :disabled="selectedRows.length === 0">
          <template #icon><icon-copy /></template>
          复制选中
        </a-button>
        <a-button size="small" @click="copyData('all')">
          <template #icon><icon-copy /></template>
          复制全部
        </a-button>
      </div>
    </div>
    
    <a-table 
      :data="creditData" 
      :loading="loading"
      :row-selection="rowSelection"
      :pagination="pagination"
      size="small"
      @selection-change="handleSelectionChange"
    >
      <template #columns>
        <a-table-column title="记录编号" data-index="id" :width="120">
          <template #cell="{ record }">
            <div class="flex items-center gap-2">
              <span>{{ record.id }}</span>
              <icon-copy 
                class="cursor-pointer text-gray-400 hover:text-blue-500" 
                @click="copyToClipboard(record.id)"
              />
            </div>
          </template>
        </a-table-column>
        <a-table-column title="查询时间" data-index="queryDate" :width="120">
          <template #cell="{ record }">
            <span class="text-gray-600">
              {{ record.queryDate }}
            </span>
          </template>
        </a-table-column>
        <a-table-column title="报告类型" data-index="reportType" :width="150">
          <template #cell="{ record }">
            <a-tag color="blue">{{ record.reportType }}</a-tag>
          </template>
        </a-table-column>
        <a-table-column title="征信报告" data-index="reportUrl" :width="200">
          <template #cell="{ record }">
            <div class="report-actions">
              <a-button 
                type="text" 
                size="small" 
                @click="viewReport(record.reportUrl)"
                :disabled="!record.reportUrl"
              >
                <template #icon><icon-eye /></template>
                查看报告
              </a-button>
              <a-button 
                type="text" 
                size="small" 
                @click="copyText(record.reportUrl)"
                :disabled="!record.reportUrl"
              >
                <template #icon><icon-copy /></template>
                复制链接
              </a-button>
            </div>
          </template>
        </a-table-column>
        <a-table-column title="状态" data-index="status" :width="100">
          <template #cell="{ record }">
            <a-tag :color="getStatusColor(record.status || '正常')">{{ record.status || '正常' }}</a-tag>
          </template>
        </a-table-column>
        <a-table-column title="备注" data-index="notes" :width="200">
          <template #cell="{ record }">
            <span class="copyable" @click="copyText(record.notes || '')" v-if="record.notes">
              {{ record.notes }}
            </span>
            <span v-else class="text-placeholder">-</span>
          </template>
        </a-table-column>
      </template>
      
      <template #empty>
        <a-empty description="暂无征信记录" />
      </template>
    </a-table>
    
    <!-- 征信报告预览弹窗 -->
    <a-modal 
      v-model:visible="previewVisible" 
      title="征信报告预览" 
      width="80%"
      :footer="false"
      :body-style="{ padding: 0 }"
    >
      <div class="report-preview">
        <div class="preview-header">
          <div class="preview-info">
            <span>征信报告链接：</span>
            <a-link :href="currentReportUrl" target="_blank">{{ currentReportUrl }}</a-link>
          </div>
          <div class="preview-actions">
            <a-button size="small" @click="copyText(currentReportUrl)">
              <template #icon><icon-copy /></template>
              复制链接
            </a-button>
            <a-button size="small" type="primary" @click="openReport">
              <template #icon><icon-link /></template>
              新窗口打开
            </a-button>
          </div>
        </div>
        <div class="preview-content">
          <iframe 
            :src="currentReportUrl" 
            frameborder="0" 
            width="100%" 
            height="600px"
            @error="handleIframeError"
          ></iframe>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconCopy, IconEye, IconLink } from '@arco-design/web-vue/es/icon'
import { copyToClipboard } from '../../../../utils/copy'

// Props
const props = defineProps({
  productType: {
    type: String,
    required: true
  },
  creditData: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['debug-info'])

// 发送调试信息到父组件
const sendDebugInfo = (type, message, data = null) => {
  emit('debug-info', {
    component: 'CreditRecords',
    type,
    message,
    data,
    timestamp: new Date().toISOString()
  })
}

// 组件初始化调试
sendDebugInfo('init', 'CreditRecords 组件初始化', {
  productType: props.productType,
  hasCreditData: !!props.creditData,
  creditDataType: typeof props.creditData,
  isArray: Array.isArray(props.creditData),
  length: props.creditData ? props.creditData.length : 0
})

// 监听 props 变化
watch(() => props.productType, (newType, oldType) => {
  sendDebugInfo('props-change', 'productType 变化', { oldType, newType })
}, { immediate: true })

watch(() => props.creditData, (newData, oldData) => {
  sendDebugInfo('props-change', 'creditData 数据变化', {
    oldLength: oldData ? oldData.length : 0,
    newLength: newData ? newData.length : 0,
    newType: typeof newData,
    isArray: Array.isArray(newData),
    renderCondition: !newData || newData.length === 0 ? '显示空状态' : '显示表格'
  })
}, { immediate: true, deep: true })

// 组件挂载时的调试
onMounted(() => {
  sendDebugInfo('mounted', 'CreditRecords 组件已挂载', {
    productType: props.productType,
    hasCreditData: !!props.creditData,
    length: props.creditData ? props.creditData.length : 0
  })
})

// 响应式数据
const loading = ref(false)
const selectedRows = ref([])
const previewVisible = ref(false)
const currentReportUrl = ref('')

// 分页配置
const pagination = {
  pageSize: 10,
  showTotal: true,
  showPageSize: true
}

// 表格行选择配置
const rowSelection = {
  type: 'checkbox',
  showCheckedAll: true
}

// 处理行选择变化
const handleSelectionChange = (selectedRowKeys) => {
  selectedRows.value = selectedRowKeys
}

// 获取状态颜色
const getStatusColor = (status) => {
  const colorMap = {
    '正常': 'green',
    '异常': 'red',
    '待审核': 'orange',
    '已过期': 'gray'
  }
  return colorMap[status] || 'default'
}

// 查看征信报告
const viewReport = (reportUrl) => {
  if (!reportUrl) {
    Message.warning('征信报告链接不存在')
    return
  }
  currentReportUrl.value = reportUrl
  previewVisible.value = true
}

// 新窗口打开报告
const openReport = () => {
  if (currentReportUrl.value) {
    window.open(currentReportUrl.value, '_blank')
  }
}

// 处理iframe加载错误
const handleIframeError = () => {
  Message.error('征信报告加载失败，请检查链接是否有效')
}

// 复制单个文本
const copyText = async (text) => {
  if (!text) {
    Message.warning('没有内容可复制')
    return
  }
  try {
    await copyToClipboard(text)
    Message.success('复制成功')
  } catch (error) {
    Message.error('复制失败')
  }
}

// 复制数据
const copyData = async (type) => {
  try {
    let dataToCopy = []
    
    if (type === 'selected') {
      dataToCopy = props.creditData.filter((_, index) => selectedRows.value.includes(index))
    } else {
      dataToCopy = props.creditData
    }
    
    if (dataToCopy.length === 0) {
      Message.warning('没有数据可复制')
      return
    }
    
    // 转换为CSV格式
    const headers = ['记录编号', '查询时间', '报告类型', '征信报告链接', '状态', '备注']
    const csvContent = [headers.join(',')]
    
    dataToCopy.forEach(item => {
      const row = [
        item.id,
        item.queryDate,
        item.reportType,
        item.reportUrl || '',
        item.status || '正常',
        item.notes || ''
      ]
      csvContent.push(row.join(','))
    })
    
    await copyToClipboard(csvContent.join('\n'))
    Message.success(`已复制${dataToCopy.length}条征信记录`)
  } catch (error) {
    Message.error('复制失败')
  }
}
</script>

<style scoped>
.credit-records {
  width: 100%;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
}

.copy-actions {
  display: flex;
  gap: 8px;
}

.copyable {
  cursor: pointer;
  transition: color 0.2s;
}

.copyable:hover {
  color: #1890ff;
}

.text-placeholder {
  color: #c9cdd4;
  font-style: italic;
}

.report-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.report-preview {
  width: 100%;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #e5e6eb;
  background-color: #f7f8fa;
}

.preview-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.preview-actions {
  display: flex;
  gap: 8px;
}

.preview-content {
  width: 100%;
  height: 600px;
  overflow: hidden;
}

:deep(.arco-table-th) {
  background-color: #f7f8fa;
  font-weight: 600;
}

:deep(.arco-table-td) {
  padding: 12px 16px;
}

:deep(.arco-table-tbody .arco-table-tr:hover .arco-table-td) {
  background-color: #f7f8fa;
}

:deep(.arco-modal-body) {
  padding: 0;
}
</style>