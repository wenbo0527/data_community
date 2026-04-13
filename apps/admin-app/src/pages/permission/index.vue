<template>
  <a-layout>
    <a-layout-content class="content">
      <a-row :gutter="[24, 24]">
        <a-col :span="24">
          <a-card>
            <template #title>
              <a-space>
                <IconSafe />
                权限服务
              </a-space>
            </template>
            <div class="page-intro">
              <div class="intro-title">选择申请类型</div>
              <div class="intro-subtitle">根据需要进入不同的权限申请流程</div>
            </div>
            <a-row :gutter="[24, 24]">
              <a-col :xs="24" :sm="12">
                <a-card hoverable class="entry-card" @click="goToDataApply">
                  <a-space size="large" direction="vertical" fill>
                    <a-space align="center" size="small">
                      <IconStorage />
                      <span class="entry-title">数据权限申请</span>
                    </a-space>
                    <div class="entry-desc">申请 SELECT/UPDATE/INSERT/DELETE/EXECUTE 等数据权限</div>
                    <a-button type="primary" long @click.stop="goToDataApply">进入数据权限申请</a-button>
                  </a-space>
                </a-card>
              </a-col>
              <a-col :xs="24" :sm="12">
                <a-card hoverable class="entry-card" @click="goToAppApply">
                  <a-space size="large" direction="vertical" fill>
                    <a-space align="center" size="small">
                      <IconApps />
                      <span class="entry-title">应用权限申请</span>
                    </a-space>
                    <div class="entry-desc">申请 查看/编辑/调用/订阅 等应用权限</div>
                    <a-button type="primary" long @click.stop="goToAppApply">进入应用权限申请</a-button>
                  </a-space>
                </a-card>
              </a-col>
            </a-row>
          </a-card>
        </a-col>
      </a-row>
    </a-layout-content>
  </a-layout>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { IconSafe, IconStorage, IconApps } from '@arco-design/web-vue/es/icon'

const router = useRouter()

const goToDataApply = () => {
  router.push('/management/permission/apply/data')
}
const goToAppApply = () => {
  router.push('/management/permission/apply/application')
}
</script>

<style scoped>
.permission-container {
  padding: 20px;
}

.header-actions {
  margin-bottom: 20px;
}

.create-permission-container {
  padding: 20px;
}

.page-title {
  margin-bottom: 20px;
}

.section-card {
  margin-bottom: 20px;
}

.form-actions {
  margin-top: 20px;
  text-align: right;
}

.content {
  padding: 24px;
  background: #f5f6fa;
  min-height: 100vh;
}
.entry-card {
  min-height: 180px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.page-intro {
  margin-bottom: 12px;
  padding: 8px 4px;
}
.intro-title {
  font-size: 18px;
  font-weight: 600;
}
.intro-subtitle {
  color: #6b7280;
  font-size: 13px;
}
.entry-title {
  font-size: 16px;
  font-weight: 600;
}
.entry-desc {
  color: #6b7280;
}
</style>
