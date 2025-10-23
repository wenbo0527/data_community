<template>
  <div class="categories-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <a-breadcrumb>
          <a-breadcrumb-item @click="$router.push('/admin/notifications')">
            通知管理
          </a-breadcrumb-item>
          <a-breadcrumb-item>分类管理</a-breadcrumb-item>
        </a-breadcrumb>
        <h1 class="page-title">分类管理</h1>
        <p class="page-description">管理通知分类，用于组织和筛选通知内容</p>
      </div>
      <div class="header-right">
        <a-space>
          <a-button type="primary" @click="handleCreate">
            <template #icon><icon-plus /></template>
            新建分类
          </a-button>
          <a-button @click="handleRefresh">
            <template #icon><icon-refresh /></template>
            刷新
          </a-button>
        </a-space>
      </div>
    </div>

    <!-- 分类列表 -->
    <a-card class="categories-card">
      <template #title>
        <span>分类列表</span>
      </template>

      <a-table
        :columns="columns"
        :data="tableData"
        :loading="loading"
        :pagination="false"
      >
        <template #name="{ record }">
          <a-space>
            <a-tag :color="record.color" size="small">
              {{ record.name }}
            </a-tag>
          </a-space>
        </template>

        <template #color="{ record }">
          <div class="color-display">
            <div
              class="color-circle"
              :style="{ backgroundColor: getColorValue(record.color) }"
            ></div>
            <span>{{ record.color }}</span>
          </div>
        </template>

        <template #notificationCount="{ record }">
          <a-link @click="viewCategoryNotifications(record.id)">
            {{ record.notificationCount || 0 }} 条通知
          </a-link>
        </template>

        <template #actions="{ record }">
          <a-space>
            <a-button type="text" size="small" @click="handleEdit(record)">
              编辑
            </a-button>
            <a-button
              type="text"
              size="small"
              status="danger"
              @click="handleDelete(record)"
              :disabled="(record.notificationCount || 0) > 0"
            >
              删除
            </a-button>
          </a-space>
        </template>
      </a-table>
    </a-card>

    <!-- 创建/编辑分类弹窗 -->
    <a-modal
      v-model:visible="modalVisible"
      :title="isEdit ? '编辑分类' : '新建分类'"
      @ok="handleSubmit"
      @cancel="handleCancel"
      :ok-loading="submitting"
    >
      <a-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        layout="vertical"
      >
        <a-form-item field="name" label="分类名称" required>
          <a-input
            v-model="formData.name"
            placeholder="请输入分类名称"
            :max-length="20"
            show-word-limit
          />
        </a-form-item>

        <a-form-item field="color" label="分类颜色" required>
          <div class="color-selector">
            <div class="color-options">
              <div
                v-for="color in colorOptions"
                :key="color.value"
                class="color-option"
                :class="{ active: formData.color === color.value }"
                @click="formData.color = color.value"
              >
                <div
                  class="color-preview"
                  :style="{ backgroundColor: color.color }"
                ></div>
                <span class="color-name">{{ color.label }}</span>
              </div>
            </div>
          </div>
        </a-form-item>

        <a-form-item field="description" label="分类描述">
          <a-textarea
            v-model="formData.description"
            placeholder="请输入分类描述"
            :max-length="100"
            :auto-size="{ minRows: 2, maxRows: 4 }"
            show-word-limit
          />
        </a-form-item>
      </a-form>

      <!-- 预览 -->
      <div class="preview-section">
        <h4>预览效果</h4>
        <div class="preview-tag">
          <a-tag :color="formData.color || 'blue'" size="small">
            {{ formData.name || '分类名称' }}
          </a-tag>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Message, Modal } from '@arco-design/web-vue'
import {
  IconPlus,
  IconRefresh
} from '@arco-design/web-vue/es/icon'
import { NotificationAPI } from '../../../api/notification'

const router = useRouter()
const notificationAPI = new NotificationAPI()

// 响应式数据
const loading = ref(false)
const tableData = ref([])
const modalVisible = ref(false)
const submitting = ref(false)
const formRef = ref()

// 表单数据
const formData = reactive({
  id: null,
  name: '',
  color: 'blue',
  description: ''
})

// 判断是否为编辑模式
const isEdit = computed(() => !!formData.id)

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入分类名称' },
    { minLength: 2, message: '分类名称至少2个字符' },
    { maxLength: 20, message: '分类名称不能超过20个字符' }
  ],
  color: [
    { required: true, message: '请选择分类颜色' }
  ]
}

// 颜色选项
const colorOptions = [
  { value: 'blue', label: '蓝色', color: '#165dff' },
  { value: 'green', label: '绿色', color: '#00b42a' },
  { value: 'orange', label: '橙色', color: '#ff7d00' },
  { value: 'red', label: '红色', color: '#f53f3f' },
  { value: 'purple', label: '紫色', color: '#722ed1' },
  { value: 'cyan', label: '青色', color: '#14c9c9' },
  { value: 'magenta', label: '品红', color: '#f5319d' },
  { value: 'lime', label: '青柠', color: '#7bc616' },
  { value: 'gold', label: '金色', color: '#f7ba1e' },
  { value: 'gray', label: '灰色', color: '#86909c' }
]

// 表格列配置
const columns = [
  {
    title: '分类名称',
    dataIndex: 'name',
    slotName: 'name',
    width: 150
  },
  {
    title: '颜色',
    dataIndex: 'color',
    slotName: 'color',
    width: 120
  },
  {
    title: '描述',
    dataIndex: 'description',
    ellipsis: true,
    tooltip: true
  },
  {
    title: '通知数量',
    dataIndex: 'notificationCount',
    slotName: 'notificationCount',
    width: 120
  },
  {
    title: '操作',
    slotName: 'actions',
    width: 120,
    fixed: 'right'
  }
]

// 方法定义
const fetchData = async () => {
  loading.value = true
  try {
    const response = await notificationAPI.getCategories()
    if (response.success) {
      // 获取每个分类的通知数量
      const categoriesWithCount = await Promise.all(
        response.data.map(async (category) => {
          try {
            const notificationResponse = await notificationAPI.getNotifications({
              categoryId: category.id,
              pageSize: 1
            })
            return {
              ...category,
              notificationCount: notificationResponse.success ? notificationResponse.data.total : 0
            }
          } catch (error) {
            return {
              ...category,
              notificationCount: 0
            }
          }
        })
      )
      tableData.value = categoriesWithCount
    }
  } catch (error) {
    console.error('获取分类列表失败:', error)
    Message.error('获取分类列表失败')
  } finally {
    loading.value = false
  }
}

const handleRefresh = () => {
  fetchData()
}

const handleCreate = () => {
  resetForm()
  modalVisible.value = true
}

const handleEdit = (record) => {
  formData.id = record.id
  formData.name = record.name
  formData.color = record.color
  formData.description = record.description || ''
  modalVisible.value = true
}

const handleDelete = (record) => {
  if ((record.notificationCount || 0) > 0) {
    Message.warning('该分类下还有通知，无法删除')
    return
  }

  Modal.confirm({
    title: '确认删除',
    content: `确定要删除分类"${record.name}"吗？此操作不可恢复。`,
    onOk: async () => {
      try {
        const response = await notificationAPI.deleteCategory(record.id)
        if (response.success) {
          Message.success('删除成功')
          fetchData()
        } else {
          Message.error(response.message || '删除失败')
        }
      } catch (error) {
        console.error('删除分类失败:', error)
        Message.error('删除失败')
      }
    }
  })
}

const handleSubmit = async () => {
  try {
    await formRef.value.validate()
  } catch (error) {
    return
  }

  submitting.value = true
  try {
    const submitData = {
      name: formData.name,
      color: formData.color,
      description: formData.description
    }

    let response
    if (isEdit.value) {
      response = await notificationAPI.updateCategory(formData.id, submitData)
    } else {
      response = await notificationAPI.createCategory(submitData)
    }

    if (response.success) {
      Message.success(isEdit.value ? '更新成功' : '创建成功')
      modalVisible.value = false
      fetchData()
    } else {
      Message.error(response.message || (isEdit.value ? '更新失败' : '创建失败'))
    }
  } catch (error) {
    console.error('提交失败:', error)
    Message.error(isEdit.value ? '更新失败' : '创建失败')
  } finally {
    submitting.value = false
  }
}

const handleCancel = () => {
  modalVisible.value = false
  resetForm()
}

const resetForm = () => {
  formData.id = null
  formData.name = ''
  formData.color = 'blue'
  formData.description = ''
}

const viewCategoryNotifications = (categoryId) => {
  router.push({
    path: '/admin/notifications',
    query: { categoryId }
  })
}

// 工具方法
const getColorValue = (colorName) => {
  const colorOption = colorOptions.find(option => option.value === colorName)
  return colorOption?.color || '#165dff'
}

// 生命周期
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.categories-page {
  padding: 16px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-left {
  flex: 1;
}

.page-title {
  margin: 8px 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #1d2129;
}

.page-description {
  margin: 0;
  color: #86909c;
  font-size: 14px;
}

.header-right {
  flex-shrink: 0;
}

.categories-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.color-display {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-circle {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1px solid #e5e6eb;
}

.color-selector {
  margin-top: 8px;
}

.color-options {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
}

.color-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.color-option:hover {
  background-color: #f7f8fa;
}

.color-option.active {
  border-color: #165dff;
  background-color: #f2f3ff;
}

.color-preview {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  margin-bottom: 6px;
  border: 1px solid #e5e6eb;
}

.color-name {
  font-size: 12px;
  color: #4e5969;
  text-align: center;
}

.preview-section {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.preview-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #1d2129;
}

.preview-tag {
  display: flex;
  align-items: center;
}

:deep(.arco-card-header) {
  border-bottom: 1px solid #f0f0f0;
  padding: 16px 20px;
}

:deep(.arco-card-body) {
  padding: 20px;
}

:deep(.arco-breadcrumb-item-link) {
  color: #165dff;
  cursor: pointer;
}

:deep(.arco-breadcrumb-item-link:hover) {
  color: #0e42d2;
}

:deep(.arco-table-th) {
  background-color: #f7f8fa;
  font-weight: 600;
}

:deep(.arco-table-td) {
  border-bottom: 1px solid #f0f0f0;
}

:deep(.arco-table-tr:hover .arco-table-td) {
  background-color: #f7f8fa;
}

:deep(.arco-modal-body) {
  max-height: 70vh;
  overflow-y: auto;
}
</style>