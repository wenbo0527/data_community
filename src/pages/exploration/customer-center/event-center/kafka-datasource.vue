<template>
  <div class="kafka-datasource">
    <!-- Kafka数据源列表页面 -->
    <div v-if="!showCreateForm" class="datasource-list">
      <!-- 页面头部 -->
      <div class="page-header">
        <div class="header-content">
          <div class="title-area">
            <h2 class="page-title">Kafka数据源</h2>
            <span class="page-description">管理事件注册使用的Kafka数据源配置</span>
          </div>
          <div class="header-actions">
            <a-space size="small">
              <a-input 
                v-model="searchForm.datasourceName" 
                placeholder="搜索数据源名称" 
                allow-clear 
                style="width: 200px"
                @press-enter="handleSearch"
              >
                <template #prefix>
                  <icon-search style="color: var(--color-text-3)" />
                </template>
              </a-input>
              <a-button type="primary" size="small" @click="showCreateDatasource">
                <template #icon><icon-plus /></template>
                新建数据源
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
            class="datasource-table"
            size="small"
            :scroll="{ x: 1200 }"
          >
            <template #columns>
              <a-table-column title="ID" data-index="id" :width="80" fixed="left" />
              <a-table-column title="数据源名称" data-index="datasourceName" :width="160">
                <template #cell="{ record }">
                  <a-link @click="viewDatasourceDetail(record)">{{ record.datasourceName }}</a-link>
                </template>
              </a-table-column>
              <a-table-column title="Broker地址" data-index="brokerAddress" :width="200" />
              <a-table-column title="端口" data-index="port" :width="80" />
              <a-table-column title="认证方式" data-index="authType" :width="100">
                <template #cell="{ record }">
                  <a-tag size="small">{{ record.authType }}</a-tag>
                </template>
              </a-table-column>
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
              <a-table-column title="操作" :width="120" fixed="right">
                <template #cell="{ record }">
                  <a-space size="mini">
                    <a-button type="text" size="mini" @click="editDatasource(record)">
                      <icon-edit />
                    </a-button>
                    <a-button type="text" size="mini" @click="testConnection(record)">
                      <icon-link />
                    </a-button>
                    <a-dropdown trigger="click">
                      <a-button type="text" size="mini">
                        <icon-more />
                      </a-button>
                      <template #content>
                        <a-doption @click="deleteDatasource(record)" class="danger-option">
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

    <!-- 新建/编辑数据源弹窗 -->
    <a-modal 
      v-model:visible="showCreateForm" 
      :title="isEdit ? '编辑Kafka数据源' : '新建Kafka数据源'"
      width="800px"
      @ok="saveDatasource"
      @cancel="cancelCreate"
      :ok-loading="saving"
    >
      <a-form :model="datasourceForm" :rules="datasourceRules" ref="datasourceFormRef" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="datasourceName" label="数据源名称" required>
              <a-input 
                v-model="datasourceForm.datasourceName" 
                placeholder="请输入数据源名称"
                allow-clear
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="owner" label="负责人" required>
              <a-select 
                v-model="datasourceForm.owner" 
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
        
        <a-row :gutter="16">
          <a-col :span="16">
            <a-form-item field="brokerAddress" label="Broker地址" required>
              <a-input 
                v-model="datasourceForm.brokerAddress" 
                placeholder="请输入Kafka Broker地址"
                allow-clear
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item field="port" label="端口" required>
              <a-input-number 
                v-model="datasourceForm.port" 
                placeholder="端口号"
                :min="1"
                :max="65535"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="authType" label="认证方式" required>
              <a-select 
                v-model="datasourceForm.authType" 
                placeholder="请选择认证方式"
              >
                <a-option value="NONE">无认证</a-option>
                <a-option value="SASL_PLAINTEXT">SASL_PLAINTEXT</a-option>
                <a-option value="SASL_SSL">SASL_SSL</a-option>
                <a-option value="SSL">SSL</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="saslMechanism" label="SASL机制" v-if="datasourceForm.authType.includes('SASL')">
              <a-select 
                v-model="datasourceForm.saslMechanism" 
                placeholder="请选择SASL机制"
              >
                <a-option value="PLAIN">PLAIN</a-option>
                <a-option value="SCRAM-SHA-256">SCRAM-SHA-256</a-option>
                <a-option value="SCRAM-SHA-512">SCRAM-SHA-512</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-row :gutter="16" v-if="datasourceForm.authType !== 'NONE'">
          <a-col :span="12">
            <a-form-item field="username" label="用户名">
              <a-input 
                v-model="datasourceForm.username" 
                placeholder="请输入用户名"
                allow-clear
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="password" label="密码">
              <a-input-password 
                v-model="datasourceForm.password" 
                placeholder="请输入密码"
                allow-clear
              />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-form-item field="description" label="描述">
          <a-textarea 
            v-model="datasourceForm.description" 
            placeholder="请输入数据源描述"
            :max-length="200"
            show-word-limit
            :auto-size="{ minRows: 3, maxRows: 5 }"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 连接测试结果弹窗 -->
    <a-modal 
      v-model:visible="showTestResult" 
      title="连接测试结果"
      width="500px"
      :footer="false"
    >
      <div class="test-result">
        <div class="result-icon">
          <icon-check-circle v-if="testSuccess" style="color: #00b42a; font-size: 48px;" />
          <icon-close-circle v-else style="color: #f53f3f; font-size: 48px;" />
        </div>
        <div class="result-text">
          <h3>{{ testSuccess ? '连接成功' : '连接失败' }}</h3>
          <p>{{ testMessage }}</p>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import {
  IconSearch,
  IconPlus,
  IconEdit,
  IconDelete,
  IconMore,
  IconLink,
  IconCheckCircle,
  IconCloseCircle
} from '@arco-design/web-vue/es/icon'

// 页面状态
const loading = ref(false)
const saving = ref(false)
const showCreateForm = ref(false)
const showTestResult = ref(false)
const isEdit = ref(false)
const testSuccess = ref(false)
const testMessage = ref('')

// 搜索表单
const searchForm = reactive({
  datasourceName: ''
})

// 数据源表单
const datasourceForm = reactive({
  id: null,
  datasourceName: '',
  brokerAddress: '',
  port: 9092,
  authType: 'NONE',
  saslMechanism: '',
  username: '',
  password: '',
  description: '',
  owner: ''
})

// 表单验证规则
const datasourceRules = {
  datasourceName: [
    { required: true, message: '请输入数据源名称' }
  ],
  brokerAddress: [
    { required: true, message: '请输入Broker地址' }
  ],
  port: [
    { required: true, message: '请输入端口号' }
  ],
  authType: [
    { required: true, message: '请选择认证方式' }
  ],
  owner: [
    { required: true, message: '请选择负责人' }
  ]
}

// 负责人选项
const owners = ref([
  { id: 'user1', name: '张三' },
  { id: 'user2', name: '李四' },
  { id: 'user3', name: '王五' },
  { id: 'user4', name: '赵六' }
])

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 15,
  total: 0
})

// 数据源接口
interface DatasourceItem {
  id: number
  datasourceName: string
  brokerAddress: string
  port: number
  authType: string
  status: string
  createTime: string
  owner: string
  description: string
}

// 表格数据
const tableData = ref<DatasourceItem[]>([])
const datasourceFormRef = ref()

// 获取状态颜色
const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    '正常': 'green',
    '异常': 'red',
    '未测试': 'gray'
  }
  return colorMap[status] || 'gray'
}

// 生成模拟数据
const generateMockData = () => {
  const mockData = []
  const statuses = ['正常', '异常', '未测试']
  const authTypes = ['NONE', 'SASL_PLAINTEXT', 'SASL_SSL', 'SSL']
  
  for (let i = 1; i <= 50; i++) {
    mockData.push({
      id: i,
      datasourceName: `kafka-datasource-${i.toString().padStart(2, '0')}`,
      brokerAddress: `192.168.1.${100 + (i % 50)}`,
      port: 9092 + (i % 3),
      authType: authTypes[i % authTypes.length],
      status: statuses[i % statuses.length],
      createTime: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleString(),
      owner: owners.value[i % owners.value.length].name,
      description: `Kafka数据源${i}的描述信息`
    })
  }
  return mockData
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    const allData = generateMockData()
    
    // 搜索过滤
    let filteredData = allData
    if (searchForm.datasourceName) {
      filteredData = allData.filter(item => 
        item.datasourceName.toLowerCase().includes(searchForm.datasourceName.toLowerCase())
      )
    }
    
    // 分页
    const start = (pagination.current - 1) * pagination.pageSize
    const end = start + pagination.pageSize
    tableData.value = filteredData.slice(start, end)
    pagination.total = filteredData.length
  } catch (error) {
    Message.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  loadData()
}

// 分页变化
const onPageChange = (page: number) => {
  pagination.current = page
  loadData()
}

const onPageSizeChange = (pageSize: number) => {
  pagination.pageSize = pageSize
  pagination.current = 1
  loadData()
}

// 显示新建数据源
const showCreateDatasource = () => {
  isEdit.value = false
  resetForm()
  showCreateForm.value = true
}

// 编辑数据源
const editDatasource = (record: any) => {
  isEdit.value = true
  Object.assign(datasourceForm, record)
  showCreateForm.value = true
}

// 查看数据源详情
const viewDatasourceDetail = (record: any) => {
  editDatasource(record)
}

// 重置表单
const resetForm = () => {
  Object.assign(datasourceForm, {
    id: null,
    datasourceName: '',
    brokerAddress: '',
    port: 9092,
    authType: 'NONE',
    saslMechanism: '',
    username: '',
    password: '',
    description: '',
    owner: ''
  })
  datasourceFormRef.value?.resetFields()
}

// 取消创建
const cancelCreate = () => {
  showCreateForm.value = false
  resetForm()
}

// 保存数据源
const saveDatasource = async () => {
  try {
    const valid = await datasourceFormRef.value?.validate()
    if (!valid) {
      saving.value = true
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      Message.success(isEdit.value ? '数据源更新成功' : '数据源创建成功')
      showCreateForm.value = false
      resetForm()
      loadData()
    }
  } catch (error) {
    Message.error('保存失败，请检查表单信息')
  } finally {
    saving.value = false
  }
}

// 测试连接
const testConnection = async (record: any) => {
  loading.value = true
  try {
    // 模拟连接测试
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 随机成功或失败
    const success = Math.random() > 0.3
    testSuccess.value = success
    testMessage.value = success 
      ? `成功连接到 ${record.brokerAddress}:${record.port}` 
      : '连接失败，请检查网络配置和认证信息'
    
    showTestResult.value = true
  } catch (error) {
    Message.error('测试连接失败')
  } finally {
    loading.value = false
  }
}

// 删除数据源
const deleteDatasource = (record: any) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除数据源 "${record.datasourceName}" 吗？此操作不可恢复。`,
    onOk: async () => {
      try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 500))
        Message.success('删除成功')
        loadData()
      } catch (error) {
        Message.error('删除失败')
      }
    }
  })
}

// 初始化
onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.kafka-datasource {
  height: 100%;
  display: flex;
  flex-direction: column;
  
  .datasource-list {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  
  .page-header {
    background: #fff;
    border-bottom: 1px solid #f2f3f5;
    padding: 16px 24px;
    
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .title-area {
      .page-title {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #1d2129;
        line-height: 1.5;
      }
      
      .page-description {
        font-size: 13px;
        color: #86909c;
        margin-left: 8px;
      }
    }
  }
  
  .content-card {
    flex: 1;
    margin: 16px 24px;
    
    :deep(.arco-card-body) {
      padding: 0;
      height: 100%;
    }
  }
  
  .table-section {
    height: 100%;
    
    .datasource-table {
      height: 100%;
    }
  }
  
  .test-result {
    text-align: center;
    padding: 20px;
    
    .result-icon {
      margin-bottom: 16px;
    }
    
    .result-text {
      h3 {
        margin: 0 0 8px 0;
        font-size: 16px;
        font-weight: 600;
      }
      
      p {
        margin: 0;
        color: #86909c;
        font-size: 14px;
      }
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

/* 下拉菜单危险选项样式 */
:deep(.danger-option) {
  color: #f53f3f;
}

:deep(.danger-option:hover) {
  background-color: #ffece8;
  color: #f53f3f;
}
</style>