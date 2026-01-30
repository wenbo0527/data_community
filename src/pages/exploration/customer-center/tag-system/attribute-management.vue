<template>
  <div class="attribute-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h2 class="page-title">属性管理</h2>
        <p class="page-description">管理标签属性，定义标签的各种属性和规则</p>
      </div>
      <div class="header-actions">
        <a-space>
          <a-input 
            v-model="searchForm.attributeName" 
            placeholder="请输入属性名称搜索"
            allow-clear
            style="width: 250px"
            @input="handleSearch"
          >
            <template #prefix><IconSearch /></template>
          </a-input>
          <a-button type="primary" @click="addAttribute">
            <template #icon><IconPlus /></template>
            新增属性
          </a-button>
        </a-space>
      </div>
    </div>

    <!-- 属性列表 -->
    <div class="content-section">
      <a-card class="table-card">
        <template #title>
          <div class="table-header">
            <span class="table-title">属性列表</span>
            <span class="table-count">共 {{ pagination.total }} 条</span>
          </div>
        </template>
        
        <a-table 
          :data="tableData" 
          :loading="loading"
          :pagination="pagination"
          @page-change="handlePageChange"
          @page-size-change="handlePageSizeChange"
          class="attribute-table"
          size="small"
        >
          <template #columns>
            <a-table-column title="属性名称" data-index="name" :width="150">
              <template #cell="{ record }">
                <span>{{ record.name }}</span>
              </template>
            </a-table-column>
            <a-table-column title="属性ID" data-index="id" :width="120">
              <template #cell="{ record }">
                <span>{{ record.id }}</span>
              </template>
            </a-table-column>
            <a-table-column title="属性类型" data-index="attributeType" :width="120">
              <template #cell="{ record }">
                <StatusTag :status="record.attributeType" dictKey="attributeType" />
              </template>
            </a-table-column>
            <a-table-column title="维度类型" data-index="dimensionType" :width="120">
              <template #cell="{ record }">
                <StatusTag :status="record.dimensionType" dictKey="dimensionType" />
              </template>
            </a-table-column>
            <a-table-column title="维度主键" data-index="dimensionKey" :width="150">
              <template #cell="{ record }">
                <span>{{ record.dimensionKey }}</span>
              </template>
            </a-table-column>
            <a-table-column title="IDMapping支持" data-index="mappingSupport" :width="120">
              <template #cell="{ record }">
                <StatusTag :status="record.mappingSupport ? '支持' : '不支持'" dictKey="mappingSupport" />
              </template>
            </a-table-column>
            <a-table-column title="创建时间" data-index="createTime" :width="180">
              <template #cell="{ record }">
                {{ DateUtils.formatDateTime(record.createTime) }}
              </template>
            </a-table-column>
            <a-table-column title="创建人" data-index="createUser" :width="120">
              <template #cell="{ record }">
                <span>{{ record.createUser }}</span>
              </template>
            </a-table-column>
            <a-table-column title="操作" :width="200" fixed="right">
              <template #cell="{ record, rowIndex }">
                <a-space>
                  <a-button 
                    type="text" 
                    size="small" 
                    @click="editAttribute(record)"
                  >
                    编辑
                  </a-button>
                  <a-button 
                    type="text" 
                    size="small" 
                    @click="updateAttribute(record)"
                  >
                    更新
                  </a-button>
                  <a-button 
                    type="text" 
                    size="small" 
                    status="danger" 
                    @click="removeAttribute(rowIndex)"
                  >
                    删除
                  </a-button>
                </a-space>
              </template>
            </a-table-column>
          </template>
        </a-table>
      </a-card>
    </div>



    <!-- 属性编辑模态框 -->
    <a-modal 
      v-model:visible="editModalVisible" 
      :title="editIndex === -1 ? '新增属性' : '编辑属性'"
      width="600px"
      @ok="saveAttribute"
      @cancel="cancelEdit"
    >
      <a-form :model="editForm" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="属性ID" required>
              <a-input v-model="editForm.id" placeholder="请输入属性ID" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="属性名称" required>
              <a-input v-model="editForm.name" placeholder="请输入属性名称" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="属性类型" required>
              <a-select v-model="editForm.attributeType" placeholder="请选择属性类型">
                <a-option value="numeric">数值型</a-option>
                <a-option value="string">字符型</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="维度类型" required>
              <a-select v-model="editForm.dimensionType" placeholder="请选择维度类型">
                <a-option value="customer">客户级</a-option>
                <a-option value="product-customer">产品客户级</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="维度主键" required>
          <a-input v-model="editForm.dimensionKey" placeholder="请输入维度主键" />
        </a-form-item>
        <a-form-item label="创建人">
          <a-input v-model="editForm.createUser" placeholder="请输入创建人" />
        </a-form-item>
        <a-form-item label="描述">
          <a-textarea v-model="editForm.description" placeholder="请输入属性描述" :rows="3" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconPlus, IconSearch, IconRefresh, IconDelete } from '@arco-design/web-vue/es/icon'
import StatusTag from '@/components/common/StatusTag.vue'
import DateUtils from '@/utils/dateUtils'

// 属性数据接口
interface AttributeItem {
  id: string
  name: string
  attributeType: string // 属性类型
  dimensionType: string // 维度类型
  dimensionKey: string // 维度主键
  createTime: string
  createUser: string // 创建人
  status: 'active' | 'inactive'
  description?: string
  mappingSupport?: boolean // 是否支持IDMapping
}

// 搜索表单
const searchForm = reactive({
  attributeName: ''
})

// 表格数据
const tableData = ref<AttributeItem[]>([])
const loading = ref(false)

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: true,
  showPageSize: true,
  pageSizeOptions: [10, 20, 50, 100]
})



// 属性编辑
const editModalVisible = ref(false)
const editForm = ref<AttributeItem>({
  id: '',
  name: '',
  attributeType: 'numeric',
  dimensionType: 'customer',
  dimensionKey: '',
  createTime: '',
  createUser: '',
  status: 'active',
  description: ''
})
const editIndex = ref(-1)

// 生成模拟数据
const generateAttributeData = (count: number): AttributeItem[] => {
  const attributeTypes = ['numeric', 'string']
  const dimensionTypes = ['customer', 'product-customer']
  const statuses: ('active' | 'inactive')[] = ['active', 'inactive']
  const mappingSupportOptions = [true, false]
  const users = ['张三', '李四', '王五', '赵六', '钱七']
  
  return Array.from({ length: count }, (_, index) => ({
    id: `ATTR_${String(index + 1).padStart(3, '0')}`,
    name: `属性${index + 1}`,
    attributeType: attributeTypes[Math.floor(Math.random() * attributeTypes.length)],
    dimensionType: dimensionTypes[Math.floor(Math.random() * dimensionTypes.length)],
    dimensionKey: `dim_key_${index + 1}`,
    createTime: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    createUser: users[Math.floor(Math.random() * users.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    description: `这是属性${index + 1}的描述信息`,
    mappingSupport: mappingSupportOptions[Math.floor(Math.random() * mappingSupportOptions.length)]
  }))
}

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    // 模拟API请求
    setTimeout(() => {
      const data = generateAttributeData(50)
      
      // 根据搜索条件筛选
      let filteredData = data
      if (searchForm.attributeName) {
        filteredData = filteredData.filter(item => 
          item.name.includes(searchForm.attributeName) ||
          item.id.includes(searchForm.attributeName)
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
    console.error('获取属性数据失败:', error)
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  fetchData()
}

// 重置搜索
const handleReset = () => {
  searchForm.attributeName = ''
  pagination.current = 1
  fetchData()
}

// 分页变化
const handlePageChange = (page: number) => {
  pagination.current = page
  fetchData()
}

const handlePageSizeChange = (pageSize: number) => {
  pagination.pageSize = pageSize
  pagination.current = 1
  fetchData()
}

// 添加属性
const addAttribute = () => {
  editForm.value = {
    id: '',
    name: '',
    attributeType: 'numeric',
    dimensionType: 'customer',
    dimensionKey: '',
    createTime: new Date().toISOString(),
    createUser: '当前用户',
    status: 'active',
    description: ''
  }
  editIndex.value = -1
  editModalVisible.value = true
}

// 删除属性
const removeAttribute = (index: number) => {
  tableData.value.splice(index, 1)
  Message.success('删除成功')
}

// 验证属性ID唯一性
const validateAttributeId = (record: AttributeItem, index: number) => {
  if (!record.id) return
  
  const duplicateIndex = tableData.value.findIndex((attr, i) => 
    i !== index && attr.id === record.id
  )
  
  if (duplicateIndex !== -1) {
    Message.error('属性ID不能重复')
    record.id = ''
  }
}

// 编辑属性 - 进入详情页编辑
const editAttribute = (record: AttributeItem) => {
  editForm.value = { ...record }
  editIndex.value = tableData.value.findIndex(item => item.id === record.id)
  editModalVisible.value = true
}

// 更新属性
const updateAttribute = (record: AttributeItem) => {
  Message.info('属性更新功能开发中...')
}

// 保存属性
const saveAttribute = () => {
  if (editIndex.value >= 0) {
    // 编辑现有属性
    tableData.value[editIndex.value] = { ...editForm.value }
    Message.success('属性更新成功')
  } else {
    // 新增属性
    const newAttribute = {
      ...editForm.value,
      createTime: new Date().toISOString()
    }
    tableData.value.unshift(newAttribute)
    Message.success('属性创建成功')
  }
  editModalVisible.value = false
}

// 取消编辑
const cancelEdit = () => {
  editModalVisible.value = false
  editIndex.value = -1
}



// 获取状态颜色
const getStatusColor = (status: string) => {
  return status === 'active' ? 'green' : 'red'
}

// 获取状态文本
const getStatusText = (status: string) => {
  return status === 'active' ? '启用' : '禁用'
}

 

// 初始化
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.attribute-management {
  padding: 20px;
  background: #f5f5f5;
  min-height: 100vh;
}

/* 页面头部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-content {
  flex: 1;
}

.page-title {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #1d2129;
}

.page-description {
  margin: 0;
  color: #86909c;
  font-size: 14px;
}

.header-actions {
  flex-shrink: 0;
}

/* 搜索区域 */
.search-section {
  margin-bottom: 20px;
}

.search-card {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.search-form {
  margin: 0;
}

/* 内容区域 */
.content-section {
  margin-bottom: 20px;
}

.table-card {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-title {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
}

.table-count {
  color: #86909c;
  font-size: 14px;
}

.attribute-table {
  margin-top: 16px;
}



/* 响应式设计 */
@media (max-width: 768px) {
  .attribute-management {
    padding: 12px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
  }
  
  .header-actions {
    width: 100%;
  }
  
  .search-form {
    flex-direction: column;
  }
  
  .search-form .arco-form-item {
    margin-right: 0;
    margin-bottom: 12px;
  }
}
</style>
