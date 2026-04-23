<template>
  <a-card class="basic-info-card" :bordered="false">
    <template #title>
      <div class="card-title">
        <IconEdit />
        基本信息
        <span class="required-mark">*</span>
      </div>
    </template>
    
    <!-- 内容类型选择 -->
    <a-form-item 
      field="contentType" 
      label="内容类型"
      :rules="[{ required: true, message: '请选择内容类型' }]"
      class="content-type-field"
    >
      <a-radio-group 
        v-model="formData.contentType" 
        type="button"
        class="content-type-selector"
        @change="handleContentTypeChange"
      >
        <a-radio value="document" class="type-option">
          <div class="radio-content">
            <IconFile class="radio-icon" />
            <div class="radio-text">
              <div class="radio-title">仅上传文档</div>
              <div class="radio-desc">上传文档到社区资源库</div>
            </div>
          </div>
        </a-radio>
        <a-radio value="notification" class="type-option">
          <div class="radio-content">
            <IconNotification class="radio-icon" />
            <div class="radio-text">
              <div class="radio-title">发送通知</div>
              <div class="radio-desc">发布通知消息给用户</div>
            </div>
          </div>
        </a-radio>
      </a-radio-group>
    </a-form-item>

    <!-- 文档来源选择 (仅文档模式显示) -->
    <a-form-item
      v-if="formData.contentType === 'document'"
      field="docSource"
      label="文档来源"
      class="doc-source-field"
    >
      <a-radio-group v-model="formData.docSource" type="button">
        <a-radio value="upload">本地上传</a-radio>
        <a-radio value="system">关联系统文档</a-radio>
      </a-radio-group>
    </a-form-item>

    <!-- 模式提示 -->
    <a-alert 
      v-if="formData.contentType === 'document'"
      type="info" 
      class="mode-alert"
      show-icon
    >
      文档模式：专注于文档上传和管理，支持多种文件格式
    </a-alert>
    <a-alert 
      v-else-if="formData.contentType === 'notification'"
      type="success" 
      class="mode-alert"
      show-icon
    >
      通知模式：发布重要通知和公告，支持富文本编辑
    </a-alert>

    <!-- 标题 -->
    <a-form-item 
      v-if="formData.contentType === 'notification'"
      field="title" 
      label="通知标题"
      :rules="[{ required: true, message: '请输入通知标题' }]"
    >
      <a-input
        v-model="formData.title"
        placeholder="请输入通知标题"
        :max-length="100"
        show-word-limit
      />
    </a-form-item>

    <!-- 通知对象 (仅通知模式显示) -->
    <a-form-item v-if="formData.contentType === 'notification'" field="target" label="通知对象" required>
      <a-radio-group v-model="formData.targetType">
        <a-radio value="all">全部用户</a-radio>
        <a-radio value="userGroup">指定用户组</a-radio>
        <a-radio value="department">指定部门</a-radio>
      </a-radio-group>
      <div v-if="formData.targetType === 'userGroup'" class="target-selector">
        <a-select
          v-model="formData.targetUserGroup"
          placeholder="请选择用户组"
          style="width: 200px; margin-right: 8px"
        >
          <a-option v-for="group in userGroups" :key="group.id" :value="group.id">
            {{ group.name }}
          </a-option>
        </a-select>
        <a-button type="text" @click="goToUserGroupManagement">
          <IconSettings /> 管理用户组
        </a-button>
      </div>
      <div v-if="formData.targetType === 'department'" class="target-selector">
        <a-cascader
          v-model="formData.targetDepartment"
          :options="departmentOptions"
          placeholder="请选择部门"
          style="width: 300px"
        />
      </div>
    </a-form-item>

    <!-- 数据资产变更 (仅通知模式显示) -->
    <a-form-item v-if="showDataServiceFields" field="dataAssets" label="变更数据资产" required>
      <a-select
        v-model="formData.dataAssets"
        multiple
        placeholder="请选择变更的数据资产"
        style="width: 100%"
      >
        <a-option v-for="asset in dataAssetOptions" :key="asset.value" :value="asset.value">
          {{ asset.label }}
        </a-option>
      </a-select>
      <template #extra>
        <div class="field-tip">
          选择此次变更影响的数据资产，用户将收到相关通知
        </div>
      </template>
    </a-form-item>
  </a-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { IconEdit, IconFile, IconNotification, IconSettings } from '@arco-design/web-vue/es/icon'

interface FormData {
  contentType: 'document' | 'notification'
  docSource?: 'upload' | 'system'
  title?: string
  targetType?: 'all' | 'userGroup' | 'department'
  targetUserGroup?: string
  targetDepartment?: string[]
  dataAssets?: string[]
  categoryPath?: string[]
}

interface UserGroup {
  id: string
  name: string
}

interface DataAssetOption {
  label: string
  value: string
}

const props = defineProps<{
  formData: FormData
  userGroups: UserGroup[]
  dataAssetOptions: DataAssetOption[]
  departmentOptions: any[]
}>()

const emit = defineEmits<{
  (e: 'update:formData', value: FormData): void
  (e: 'content-type-change', value: string): void
  (e: 'go-to-user-group'): void
}>()

// 是否显示数据服务特有字段
const showDataServiceFields = computed(() => {
  const path = props.formData.categoryPath
  const isDataAssetChange = Array.isArray(path) && path.length > 0
  return isDataAssetChange
})

const handleContentTypeChange = (value: string) => {
  emit('content-type-change', value)
}

const goToUserGroupManagement = () => {
  emit('go-to-user-group')
}
</script>

<style scoped>
.basic-info-card {
  margin-bottom: 16px;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.required-mark {
  color: #f53f3f;
  margin-left: 4px;
}

.content-type-selector {
  display: flex;
  gap: 16px;
}

.type-option {
  padding: 12px 16px;
  border: 1px solid var(--subapp-border);
  border-radius: 8px;
  cursor: pointer;
}

.radio-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.radio-icon {
  font-size: 24px;
  color: #1650d8;
}

.radio-text {
  text-align: left;
}

.radio-title {
  font-weight: 600;
  color: var(--subapp-text-primary);
}

.radio-desc {
  font-size: 12px;
  color: var(--subapp-text-tertiary);
}

.mode-alert {
  margin: 16px 0;
}

.target-selector {
  margin-top: 12px;
  display: flex;
  align-items: center;
}

.field-tip {
  font-size: 12px;
  color: var(--subapp-text-tertiary);
  margin-top: 4px;
}
</style>
