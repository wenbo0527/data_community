<template>
  <div class="marketing-records">
    <div class="section-header">
      <h4>{{ productType === 'self' ? '自营产品营销记录' : '助贷产品营销记录' }}</h4>
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
    
    <a-tabs v-model:active-key="activeTab" type="card" class="marketing-tabs">
      <!-- 触达记录 -->
      <a-tab-pane key="reach" title="触达记录">
        <a-table 
          :data="reachRecords" 
          :loading="loading"
          :row-selection="rowSelection"
          :pagination="pagination"
          size="small"
          @selection-change="handleSelectionChange"
        >
          <template #columns>
            <a-table-column title="触达编号" data-index="id" :width="120">
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
            <a-table-column title="触达时间" data-index="reachTime" :width="140">
              <template #cell="{ record }">
                <span class="copyable" @click="copyText(record.reachTime)">{{ record.reachTime }}</span>
              </template>
            </a-table-column>
            <a-table-column title="触达方式" data-index="reachType" :width="120">
              <template #cell="{ record }">
                <a-tag :color="getReachTypeColor(record.reachType)">
                  {{ record.reachType }}
                </a-tag>
              </template>
            </a-table-column>
            <a-table-column title="触达内容" data-index="content" :width="200">
              <template #cell="{ record }">
                <div class="content-cell">
                  <span class="content-text" :title="record.content">{{ record.content }}</span>
                  <a-button 
                    type="text" 
                    size="mini" 
                    @click="viewContent(record.content)"
                    v-if="record.content && record.content.length > 20"
                  >
                    查看详情
                  </a-button>
                </div>
              </template>
            </a-table-column>
            <a-table-column title="触达结果" data-index="result" :width="100">
              <template #cell="{ record }">
                <a-tag :color="getResultColor(record.result)">{{ record.result }}</a-tag>
              </template>
            </a-table-column>
            <a-table-column title="执行人员" data-index="operator" :width="120">
              <template #cell="{ record }">
                <div class="flex items-center gap-2">
                  <a-avatar :size="24" class="bg-blue-500">
                    {{ record.operator.charAt(0) }}
                  </a-avatar>
                  <span>{{ record.operator }}</span>
                </div>
              </template>
            </a-table-column>
            <a-table-column title="备注" data-index="notes" :width="150">
              <template #cell="{ record }">
                <span class="copyable" @click="copyText(record.notes || '')" v-if="record.notes">
                  {{ record.notes }}
                </span>
                <span v-else class="text-placeholder">-</span>
              </template>
            </a-table-column>
          </template>
          
          <template #empty>
            <a-empty description="暂无触达记录" />
          </template>
        </a-table>
      </a-tab-pane>
      
      <!-- 权益发放记录 -->
      <a-tab-pane key="benefit" title="权益发放记录">
        <a-table 
          :data="benefitRecords" 
          :loading="loading"
          :row-selection="rowSelection"
          :pagination="pagination"
          size="small"
          @selection-change="handleSelectionChange"
        >
          <template #columns>
            <a-table-column title="发放编号" data-index="id" :width="120">
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
            <a-table-column title="发放时间" data-index="grantTime" :width="140">
              <template #cell="{ record }">
                <span class="copyable" @click="copyText(record.grantTime)">{{ record.grantTime }}</span>
              </template>
            </a-table-column>
            <a-table-column title="权益类型" data-index="benefitType" :width="120">
              <template #cell="{ record }">
                <a-tag :color="getBenefitTypeColor(record.benefitType)">
                  {{ record.benefitType }}
                </a-tag>
              </template>
            </a-table-column>
            <a-table-column title="权益名称" data-index="benefitName" :width="180">
              <template #cell="{ record }">
                <span class="copyable" @click="copyText(record.benefitName)">{{ record.benefitName }}</span>
              </template>
            </a-table-column>
            <a-table-column title="权益价值" data-index="benefitValue" :width="120">
              <template #cell="{ record }">
                <span class="benefit-value">{{ record.benefitValue }}</span>
              </template>
            </a-table-column>
            <a-table-column title="使用状态" data-index="status" :width="100">
              <template #cell="{ record }">
                <a-tag :color="getBenefitStatusColor(record.status)">{{ record.status }}</a-tag>
              </template>
            </a-table-column>
            <a-table-column title="有效期" data-index="validPeriod" :width="140">
              <template #cell="{ record }">
                <span class="copyable" @click="copyText(record.validPeriod)">{{ record.validPeriod }}</span>
              </template>
            </a-table-column>
            <a-table-column title="使用时间" data-index="useTime" :width="140">
              <template #cell="{ record }">
                <span class="copyable" @click="copyText(record.useTime || '')" v-if="record.useTime">
                  {{ record.useTime }}
                </span>
                <span v-else class="text-placeholder">-</span>
              </template>
            </a-table-column>
          </template>
          
          <template #empty>
            <a-empty description="暂无权益发放记录" />
          </template>
        </a-table>
      </a-tab-pane>
    </a-tabs>
    
    <!-- 内容详情弹窗 -->
    <a-modal 
      v-model:visible="contentVisible" 
      title="触达内容详情" 
      width="600px"
      :footer="false"
    >
      <div class="content-detail">
        <div class="content-actions">
          <a-button size="small" @click="copyText(currentContent)">
            <template #icon><icon-copy /></template>
            复制内容
          </a-button>
        </div>
        <div class="content-text-detail">
          {{ currentContent }}
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconCopy } from '@arco-design/web-vue/es/icon'
import { copyToClipboard } from '../../../../utils/copy'

// Props
const props = defineProps({
  productType: {
    type: String,
    required: true
  },
  marketingData: {
    type: Object,
    default: () => ({ reachRecords: [], benefitRecords: [] })
  }
})

// 响应式数据
const loading = ref(false)
const selectedRows = ref([])
const activeTab = ref('reach')
const contentVisible = ref(false)
const currentContent = ref('')

// 计算属性
const reachRecords = computed(() => props.marketingData.reachRecords || [])
const benefitRecords = computed(() => props.marketingData.benefitRecords || [])

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

// 获取触达方式颜色
const getReachTypeColor = (type) => {
  const colorMap = {
    'AI外呼': 'blue',
    '短信': 'green',
    '人工外呼': 'orange',
    '邮件': 'purple',
    'APP推送': 'cyan',
    '微信': 'lime'
  }
  return colorMap[type] || 'default'
}

// 获取触达结果颜色
const getResultColor = (result) => {
  const colorMap = {
    '成功': 'green',
    '失败': 'red',
    '部分成功': 'orange',
    '待处理': 'blue'
  }
  return colorMap[result] || 'default'
}

// 获取权益状态颜色
const getBenefitStatusColor = (status) => {
  const colorMap = {
    '已使用': 'green',
    '未使用': 'blue',
    '已过期': 'red',
    '已失效': 'gray'
  }
  return colorMap[status] || 'default'
}

// 查看内容详情
const viewContent = (content) => {
  currentContent.value = content
  contentVisible.value = true
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
    let headers = []
    
    if (activeTab.value === 'reach') {
      headers = ['触达编号', '触达时间', '触达方式', '触达内容', '触达结果', '执行人员', '备注']
      if (type === 'selected') {
        dataToCopy = reachRecords.value.filter((_, index) => selectedRows.value.includes(index))
      } else {
        dataToCopy = reachRecords.value
      }
    } else {
      headers = ['发放编号', '发放时间', '权益类型', '权益名称', '权益价值', '使用状态', '有效期', '使用时间']
      if (type === 'selected') {
        dataToCopy = benefitRecords.value.filter((_, index) => selectedRows.value.includes(index))
      } else {
        dataToCopy = benefitRecords.value
      }
    }
    
    if (dataToCopy.length === 0) {
      Message.warning('没有数据可复制')
      return
    }
    
    // 转换为CSV格式
    const csvContent = [headers.join(',')]
    
    dataToCopy.forEach(item => {
      let row = []
      if (activeTab.value === 'reach') {
        row = [
          item.id,
          item.reachTime,
          item.reachType,
          item.content,
          item.result,
          item.operator,
          item.notes || ''
        ]
      } else {
        row = [
          item.id,
          item.grantTime,
          item.benefitType,
          item.benefitName,
          item.benefitValue,
          item.status,
          item.validPeriod,
          item.useTime || ''
        ]
      }
      csvContent.push(row.join(','))
    })
    
    await copyToClipboard(csvContent.join('\n'))
    const recordType = activeTab.value === 'reach' ? '触达记录' : '权益发放记录'
    Message.success(`已复制${dataToCopy.length}条${recordType}`)
  } catch (error) {
    Message.error('复制失败')
  }
}
</script>

<style scoped>
.marketing-records {
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

.marketing-tabs {
  width: 100%;
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

.content-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.content-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 150px;
}

.benefit-value {
  font-weight: 600;
  color: #f53f3f;
}

.content-detail {
  width: 100%;
}

.content-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}

.content-text-detail {
  padding: 16px;
  background-color: #f7f8fa;
  border-radius: 6px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
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

:deep(.arco-tabs-content) {
  padding-top: 16px;
}
</style>