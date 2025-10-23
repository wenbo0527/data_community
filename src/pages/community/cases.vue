<template>
  <CommunityResource 
    :category="ResourceCategory.CASES"
    :can-manage="canManage"
    @add="handleAdd"
    @edit="handleEdit"
    @view="handleView"
  />
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import CommunityResource from '@/components/community/CommunityResource.vue'
import { ResourceCategory } from '@/types/community'

const router = useRouter()

// 管理权限
const canManage = ref(true)

// 事件处理
const handleAdd = () => {
  router.push('/notification/create')
}

const handleEdit = (item) => {
  console.log('编辑文档:', item)
  // 可以跳转到编辑页面
}

const handleView = (item) => {
  console.log('查看文档:', item)
  // 可以跳转到详情页面或打开PDF查看器
}
</script>

<style scoped>
.cases-layout {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.community-sider {
  background-color: #fff;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
}

.sider-header {
  padding: 16px;
  border-bottom: 1px solid #e5e6eb;
}

.sider-header h3 {
  margin: 0;
  color: #1d2129;
  font-size: 16px;
  font-weight: 600;
}

.tree-container {
  padding: 16px;
  height: calc(100vh - 120px);
  overflow-y: auto;
}

.tree-node-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.node-count {
  color: #86909c;
  font-size: 12px;
}

.cases-content {
  padding: 24px;
}

.content-header {
  margin-bottom: 24px;
}

.content-header h2 {
  margin: 8px 0 4px 0;
  color: #1d2129;
  font-size: 24px;
  font-weight: 600;
}

.header-description {
  margin: 0;
  color: #86909c;
  font-size: 14px;
}

.content-body {
  background-color: #fff;
  border-radius: 6px;
  padding: 24px;
}

.filter-card {
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.content-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.document-list {
  background: transparent;
}

.document-item {
  background: #fff;
  border-radius: 8px;
  margin-bottom: 16px;
  padding: 16px;
  border: 1px solid #e5e6eb;
  cursor: pointer;
  transition: all 0.3s ease;
}

.document-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #165dff;
}

.document-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.document-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.document-title span {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
}

.document-description p {
  margin: 0 0 12px 0;
  color: #4e5969;
  font-size: 14px;
  line-height: 1.5;
}

.pdf-info {
  background: #f7f8fa;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #e5e6eb;
  margin-bottom: 12px;
}

.file-size {
  color: #86909c;
  font-size: 12px;
}

.document-meta {
  color: #86909c;
  font-size: 12px;
}
</style>