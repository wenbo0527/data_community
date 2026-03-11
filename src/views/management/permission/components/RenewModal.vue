<template>
  <a-modal
    v-model:visible="visible"
    title="权限续期"
    :width="500"
    @ok="handleConfirm"
    @cancel="handleCancel"
  >
    <div class="renew-modal">
      <a-form :model="formData" layout="vertical">
        <!-- 权限信息预览 -->
        <a-form-item label="权限信息">
          <div class="permission-preview">
            <div class="preview-item">
              <span class="label">资源名称：</span>
              <span class="value">{{ permission?.resourceName }}</span>
            </div>
            <div class="preview-item">
              <span class="label">权限类型：</span>
              <span class="value">{{ getPermissionTypeText(permission?.permissionType) }}</span>
            </div>
            <div class="preview-item">
              <span class="label">当前有效期：</span>
              <span class="value">{{ formatCurrentExpiry