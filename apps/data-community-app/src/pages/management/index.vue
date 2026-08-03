<template>
  <div class="management-page">
    <a-page-header title="数据管理" sub-title="元数据建模 / 数据标准 / 资产标签 / 字段权限">
      <template #extra>
        <a-button type="primary" @click="goWorkbench">
          <template #icon><icon-home /></template>
          返回工作台
        </a-button>
      </template>
    </a-page-header>
    <a-row :gutter="16">
      <a-col :span="8">
        <a-card hoverable @click="goAssetTags" class="entry-card">
          <h3>🏷️ 资产标签</h3>
          <p>16 预置标签 + 5 类资源</p>
        </a-card>
      </a-col>
      <a-col :span="8">
        <a-card hoverable @click="goFavorites" class="entry-card">
          <h3>⭐ 我的收藏</h3>
          <p>个人 / 团队 / 共享收藏</p>
        </a-card>
      </a-col>
      <a-col :span="8">
        <a-card hoverable @click="goPermissionApply" class="entry-card">
          <h3>🔐 字段权限申请</h3>
          <p>3 步骤申请流程</p>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
const goWorkbench = () => router.push('/dca/workbench')
const goAssetTags = () => router.push('/dca/management/asset-management/asset-tags')
const goFavorites = () => router.push('/dca/management/favorites')
const goPermissionApply = () => router.push('/dca/management/permission/data-permission/apply')
</script>

<style lang="scss" scoped>
.management-page {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;

  .entry-card {
    margin-bottom: 16px;
    cursor: pointer;
    h3 { margin: 0 0 8px; }
    p { color: #86909c; font-size: 13px; margin: 0; }
  }
}
</style>