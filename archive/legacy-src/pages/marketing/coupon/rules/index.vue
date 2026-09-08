<template>
  <div class="coupon-rules-container">
    <div class="header-actions">
      <a-space>
        <a-button type="primary" @click="showCreateModal = true">
          <template #icon>
            <IconPlus />
          </template>
          新建规则
        </a-button>
      </a-space>
    </div>

    <a-table
      :data="tableData"
      :loading="loading"
      :pagination="pagination"
      @page-change="onPageChange"
      @page-size-change="onPageSizeChange"
    >
      <template #columns>
        <a-table-column title="规则名称" data-index="name" />
        <a-table-column title="规则描述" data-index="description" />
        <a-table-column title="规则类型" data-index="limitType">
          <template #cell="{ record }">
            {{ {
              user: '单用户上限',
              daily: '单日上限',
              weekly: '单周上限',
              monthly: '单月上限'
            }[record.limitType] }}
          </template>
        </a-table-column>
        <a-table-column title="限制值" data-index="limitValue" />
        <a-table-column title="标签" data-index="tags" :width="200">
          <template #cell="{ record }">
            <a-select
              v-model="record.tags"
              :options="tagOptions"
              multiple
              placeholder="选择标签"
              :max-tag-count="2"
              size="small"
              @change="(value) => handleTagChange(record, value)"
            >
              <template #label="{ data }">
                <a-tag :color="data.color" size="small">{{ data.label }}</a-tag>
              </template>
            </a-select>
          </template>
        </a-table-column>
        <a-table-column title="状态" data-index="status">
          <template #cell="{ record }">
            <a-switch
              v-model="record.status"
              :loading="record.statusLoading"
              @change="(value) => handleStatusChange(record, value)"
            />
          </template>
        </a-table-column>
        <a-table-column title="创建时间" data-index="createTime" />
        <a-table-column title="操作" fixed="right" :width="150">
          <template #cell="{ record }">
            <a-space>
              <a-button 
                type="text" 
                size="small"
                @click="handleEdit(record)"
              >编辑</a-button>
              <a-button 
                type="text" 
                size="small" 
                status="danger"
                @click="handleDelete(record)"
              >删除</a-button>
            </a-space>
          </template>
        </a-table-column>
      </template>
    </a-table>

    <!-- 创建/编辑规则弹窗 -->
    <a-modal
      v-model:visible="showCreateModal"
      :title="editingRule ? '编辑规则' : '创建规则'"
      @cancel="resetForm"
      @before-ok="handleSubmit"
    >
      <a-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        layout="vertical"
      >
        <a-form-item field="name" label="规则名称" required>
          <a-input
            v-model="formData.name"
            placeholder="请输入规则名称"
            allow-clear
          />
        </a-form-item>

        <a-form-item field="description" label="规则描述" required>
          <a-textarea
            v-model="formData.description"
            placeholder="请输入规则描述"
            :max-length="200"
            show-word-limit
          />
        </a-form-item>

        <a-form-item field="limitType" label="规则类型" required>
          <a-select
            v-model="formData.limitType"
            placeholder="请选择规则类型"
          >
            <a-option value="user">单用户上限</a-option>
            <a-option value="daily">单日上限</a-option>
            <a-option value="weekly">单周上限</a-option>
            <a-option value="monthly">单月上限</a-option>
          </a-select>
        </a-form-item>

        <a-form-item field="limitValue" label="限制值" required>
          <a-input-number
            v-model="formData.limitValue"
            :placeholder="`请输入${{
              user: '单用户',
              daily: '单用户单日',
              weekly: '单用户单周',
              monthly: '单用户单月'
            }[formData.limitType]}可获取的最大数量`"
            :min="1"
            :max="999999"
            :step="1"
          />
        </a-form-item>

        <a-form-item field="tags" label="标签">
          <a-select
            v-model="formData.tags"
            :options="tagOptions"
            multiple
            placeholder="选择标签"
            allow-clear
          >
            <template #label="{ data }">
              <a-tag :color="data.color" size="small">{{ data.label }}</a-tag>
            </template>
          </a-select>
        </a-form-item>

        <a-form-item field="status" label="是否生效">
          <a-switch v-model="formData.status" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import { IconPlus } from '@arco-design/web-vue/es/icon'

// 表格数据
const tableData = ref([])
const loading = ref(false)

// 分页配置
const pagination = ref({
  total: 0,
  current: 1,
  pageSize: 10,
  showTotal: true,
  showJumper: true,
  showPageSize: true,
})

// 表单相关
const showCreateModal = ref(false)
const formRef = ref(null)
const editingRule = ref(null)

const formData = ref({
  name: '',
  description: '',
  limitType: 'user', // 'user' | 'daily' | 'weekly' | 'monthly'
  limitValue: 1,
  tags: [],
  status: true
})

// 标签选项数据
const tagOptions = ref([
  { value: 'hot', label: '热门', color: 'red' },
  { value: 'new', label: '新品', color: 'green' },
  { value: 'limited', label: '限时', color: 'orange' },
  { value: 'vip', label: 'VIP专享', color: 'purple' },
  { value: 'discount', label: '折扣', color: 'blue' },
  { value: 'gift', label: '赠品', color: 'cyan' },
  { value: 'festival', label: '节日', color: 'magenta' },
  { value: 'member', label: '会员', color: 'gold' }
])

const rules = {
  name: [{ required: true, message: '请输入规则名称' }],
  description: [{ required: true, message: '请输入规则描述' }],
  limitValue: [{ required: true, message: '请输入限制值' }]
}

// 获取表格数据
const fetchData = async () => {
  if (loading.value) return
  loading.value = true

  try {
    // TODO: 调用接口获取数据
    const mockData = [
      {
        id: 1,
        name: '单用户限制',
        description: '限制单个用户领券数量',
        limitType: 'user',
        limitValue: 10,
        tags: ['hot', 'vip'],
        status: true,
        createTime: '2024-01-01 12:00:00'
      },
      {
        id: 2,
        name: '单用户单日限制',
        description: '限制每日领券总数量',
        limitType: 'daily',
        limitValue: 3,
        tags: ['new', 'limited'],
        status: true,
        createTime: '2024-01-01 12:00:00'
      },
      {
        id: 3,
        name: '单用户单周限制',
        description: '限制每周领券总数量',
        limitType: 'weekly',
        limitValue: 10,
        tags: ['discount'],
        status: true,
        createTime: '2024-01-01 12:00:00'
      },
      {
        id: 4,
        name: '单用户单月限制',
        description: '限制每月领券总数量',
        limitType: 'monthly',
        limitValue: 30,
        tags: ['member', 'festival'],
        status: true,
        createTime: '2024-01-01 12:00:00'
      }
    ]
    tableData.value = mockData
    pagination.value.total = 1
  } catch (error) {
    Message.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

// 分页变化
const onPageChange = (current) => {
  pagination.value.current = current
  fetchData()
}

const onPageSizeChange = (pageSize) => {
  pagination.value.pageSize = pageSize
  pagination.value.current = 1
  fetchData()
}

// 重置表单
const resetForm = () => {
  formRef.value?.resetFields()
  formData.value = {
    name: '',
    description: '',
    limitType: 'user',
    limitValue: 1,
    tags: [],
    status: true
  }
  editingRule.value = null
  showCreateModal.value = false
}

// 提交表单
const handleSubmit = async () => {
  const { error } = await formRef.value.validate()
  if (error) return false

  try {
    // TODO: 调用接口提交数据
    Message.success(editingRule.value ? '更新成功' : '创建成功')
    resetForm()
    fetchData()
    return true
  } catch (error) {
    Message.error(editingRule.value ? '更新失败' : '创建失败')
    return false
  }
}

// 编辑规则
const handleEdit = (record) => {
  editingRule.value = record
  formData.value = { ...record }
  showCreateModal.value = true
}

// 删除规则
const handleDelete = (record) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除规则「${record.name}」吗？`,
    onOk: async () => {
      try {
        // TODO: 调用删除接口
        Message.success('删除成功')
        await fetchData()
      } catch (error) {
        Message.error('删除失败')
      }
    }
  })
}

// 更新规则状态
const handleStatusChange = async (record, value) => {
  record.statusLoading = true
  try {
    // TODO: 调用接口更新状态
    record.status = value
    Message.success('状态更新成功')
  } catch (error) {
    record.status = !value // 恢复状态
    Message.error('状态更新失败')
  } finally {
    record.statusLoading = false
  }
}

// 处理标签变更
const handleTagChange = async (record, tags) => {
  const originalTags = [...record.tags]
  record.tags = tags
  
  try {
    // TODO: 调用接口保存标签
    Message.success('标签更新成功')
  } catch (error) {
    record.tags = originalTags // 恢复原标签
    Message.error('标签更新失败')
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.coupon-rules-container {
  padding: 20px;
}

.header-actions {
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
}
</style>