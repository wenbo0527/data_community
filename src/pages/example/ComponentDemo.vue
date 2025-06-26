<template>
  <div class="component-demo">
    <a-card title="基础组件使用示例" class="demo-card">
      <!-- 表格示例 -->
      <div class="demo-section">
        <h3>BaseTable 组件示例</h3>
        <BaseTable
          :data="tableData"
          :columns="tableColumns"
          :loading="tableLoading"
          :pagination="tablePagination"
          @refresh="handleTableRefresh"
          @page-change="handlePageChange"
          @selection-change="handleSelectionChange"
        >
          <template #toolbar-buttons>
            <a-button type="primary" @click="showAddModal = true">
              <template #icon><icon-plus /></template>
              新增
            </a-button>
            <a-button @click="handleBatchDelete" :disabled="selectedRows.length === 0">
              <template #icon><icon-delete /></template>
              批量删除
            </a-button>
          </template>
          
          <template #status="{ record }">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>
          
          <template #action="{ record }">
            <a-space>
              <a-button type="text" size="small" @click="handleEdit(record)">
                编辑
              </a-button>
              <a-button type="text" size="small" status="danger" @click="handleDelete(record)">
                删除
              </a-button>
            </a-space>
          </template>
        </BaseTable>
      </div>
      
      <!-- 表单模态框示例 -->
      <BaseModal
        v-model:visible="showAddModal"
        title="新增用户"
        width="600"
        :ok-loading="submitLoading"
        @ok="handleSubmit"
        @cancel="handleCancel"
      >
        <BaseForm
          ref="formRef"
          v-model="formData"
          :form-items="formItems"
          :rules="formRules"
        />
      </BaseModal>
      
      <!-- 查询表单示例 -->
      <div class="demo-section">
        <h3>BaseForm 查询表单示例</h3>
        <BaseForm
          v-model="queryForm"
          :form-items="queryFormItems"
          layout="inline"
          :show-reset="true"
          submit-text="查询"
          reset-text="重置"
          @submit="handleQuery"
          @reset="handleReset"
        />
      </div>
    </a-card>
  </div>
</template>

<script>
import { ref, reactive, computed } from 'vue'
import { Card as ACard, Button as AButton, Space as ASpace, Tag as ATag, IconPlus, IconDelete } from '@arco-design/web-vue'
import { BaseTable, BaseForm, BaseModal } from '@/components/common'
import { tableColumnTemplates, formItemTemplates } from '@/components/common'
import { businessMessage } from '@/utils/message'

export default {
  name: 'ComponentDemo',
  components: {
    ACard,
    AButton,
    ASpace,
    ATag,
    IconPlus,
    IconDelete,
    BaseTable,
    BaseForm,
    BaseModal
  },
  setup() {
    // 表格相关
    const tableLoading = ref(false)
    const selectedRows = ref([])
    const tableData = ref([
      {
        id: 1,
        name: '张三',
        email: 'zhangsan@example.com',
        department: '技术部',
        status: 1,
        createTime: '2024-01-01 10:00:00'
      },
      {
        id: 2,
        name: '李四',
        email: 'lisi@example.com',
        department: '产品部',
        status: 0,
        createTime: '2024-01-02 11:00:00'
      },
      {
        id: 3,
        name: '王五',
        email: 'wangwu@example.com',
        department: '运营部',
        status: 1,
        createTime: '2024-01-03 12:00:00'
      }
    ])
    
    const tableColumns = [
      tableColumnTemplates.index(),
      tableColumnTemplates.text('name', '姓名', { width: 120 }),
      tableColumnTemplates.text('email', '邮箱', { width: 200 }),
      tableColumnTemplates.text('department', '部门', { width: 120 }),
      tableColumnTemplates.status('status', { width: 100 }),
      tableColumnTemplates.time('createTime', '创建时间'),
      tableColumnTemplates.action({ width: 150 })
    ]
    
    const tablePagination = {
      current: 1,
      pageSize: 10,
      total: 100,
      showTotal: true,
      showJumper: true,
      showPageSize: true
    }
    
    // 表单相关
    const showAddModal = ref(false)
    const submitLoading = ref(false)
    const formRef = ref()
    const formData = reactive({
      name: '',
      email: '',
      department: '',
      status: 1,
      description: ''
    })
    
    const formItems = [
      formItemTemplates.requiredInput('name', '姓名'),
      formItemTemplates.requiredInput('email', '邮箱', {
        rules: [
          { required: true, message: '邮箱不能为空' },
          { type: 'email', message: '邮箱格式不正确' }
        ]
      }),
      formItemTemplates.requiredSelect('department', '部门', [
        { label: '技术部', value: '技术部' },
        { label: '产品部', value: '产品部' },
        { label: '运营部', value: '运营部' },
        { label: '市场部', value: '市场部' }
      ]),
      formItemTemplates.radio('status', '状态', [
        { label: '启用', value: 1 },
        { label: '禁用', value: 0 }
      ]),
      formItemTemplates.textarea('description', '描述')
    ]
    
    const formRules = {
      name: [{ required: true, message: '姓名不能为空' }],
      email: [
        { required: true, message: '邮箱不能为空' },
        { type: 'email', message: '邮箱格式不正确' }
      ],
      department: [{ required: true, message: '请选择部门' }]
    }
    
    // 查询表单
    const queryForm = reactive({
      keyword: '',
      department: '',
      status: '',
      dateRange: []
    })
    
    const queryFormItems = [
      formItemTemplates.input('keyword', '关键词', {
        placeholder: '请输入姓名或邮箱'
      }),
      formItemTemplates.select('department', '部门', [
        { label: '全部', value: '' },
        { label: '技术部', value: '技术部' },
        { label: '产品部', value: '产品部' },
        { label: '运营部', value: '运营部' },
        { label: '市场部', value: '市场部' }
      ]),
      formItemTemplates.select('status', '状态', [
        { label: '全部', value: '' },
        { label: '启用', value: 1 },
        { label: '禁用', value: 0 }
      ]),
      formItemTemplates.daterange('dateRange', '创建时间')
    ]
    
    // 计算属性
    const getStatusColor = (status) => {
      return status === 1 ? 'green' : 'red'
    }
    
    const getStatusText = (status) => {
      return status === 1 ? '启用' : '禁用'
    }
    
    // 事件处理
    const handleTableRefresh = () => {
      tableLoading.value = true
      setTimeout(() => {
        tableLoading.value = false
        businessMessage.success('刷新成功')
      }, 1000)
    }
    
    const handlePageChange = (page) => {
      tablePagination.current = page
      console.log('Page changed:', page)
    }
    
    const handleSelectionChange = (rowKeys, rowRecords) => {
      selectedRows.value = rowRecords
      console.log('Selection changed:', rowKeys, rowRecords)
    }
    
    const handleEdit = (record) => {
      Object.assign(formData, record)
      showAddModal.value = true
    }
    
    const handleDelete = (record) => {
      businessMessage.confirm('确定要删除这条记录吗？', () => {
        const index = tableData.value.findIndex(item => item.id === record.id)
        if (index > -1) {
          tableData.value.splice(index, 1)
          businessMessage.success('删除成功')
        }
      })
    }
    
    const handleBatchDelete = () => {
      if (selectedRows.value.length === 0) {
        businessMessage.warning('请选择要删除的记录')
        return
      }
      
      businessMessage.confirm(`确定要删除选中的 ${selectedRows.value.length} 条记录吗？`, () => {
        const ids = selectedRows.value.map(row => row.id)
        tableData.value = tableData.value.filter(item => !ids.includes(item.id))
        selectedRows.value = []
        businessMessage.success('批量删除成功')
      })
    }
    
    const handleSubmit = async () => {
      try {
        submitLoading.value = true
        
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        if (formData.id) {
          // 编辑
          const index = tableData.value.findIndex(item => item.id === formData.id)
          if (index > -1) {
            tableData.value[index] = { ...formData }
          }
          businessMessage.success('编辑成功')
        } else {
          // 新增
          const newRecord = {
            ...formData,
            id: Date.now(),
            createTime: new Date().toLocaleString()
          }
          tableData.value.unshift(newRecord)
          businessMessage.success('新增成功')
        }
        
        showAddModal.value = false
        resetForm()
      } catch (error) {
        businessMessage.error('操作失败')
      } finally {
        submitLoading.value = false
      }
    }
    
    const handleCancel = () => {
      showAddModal.value = false
      resetForm()
    }
    
    const resetForm = () => {
      Object.assign(formData, {
        id: undefined,
        name: '',
        email: '',
        department: '',
        status: 1,
        description: ''
      })
      formRef.value?.resetFields()
    }
    
    const handleQuery = (data) => {
      console.log('Query data:', data)
      businessMessage.success('查询成功')
    }
    
    const handleReset = () => {
      Object.assign(queryForm, {
        keyword: '',
        department: '',
        status: '',
        dateRange: []
      })
      businessMessage.info('查询条件已重置')
    }
    
    return {
      // 表格
      tableData,
      tableColumns,
      tableLoading,
      tablePagination,
      selectedRows,
      
      // 表单
      showAddModal,
      submitLoading,
      formRef,
      formData,
      formItems,
      formRules,
      
      // 查询表单
      queryForm,
      queryFormItems,
      
      // 方法
      getStatusColor,
      getStatusText,
      handleTableRefresh,
      handlePageChange,
      handleSelectionChange,
      handleEdit,
      handleDelete,
      handleBatchDelete,
      handleSubmit,
      handleCancel,
      handleQuery,
      handleReset
    }
  }
}
</script>

<style scoped>
.component-demo {
  padding: 24px;
}

.demo-card {
  margin-bottom: 24px;
}

.demo-section {
  margin-bottom: 32px;
}

.demo-section h3 {
  margin-bottom: 16px;
  color: #1d2129;
  font-size: 16px;
  font-weight: 500;
}

.demo-section:last-child {
  margin-bottom: 0;
}
</style>