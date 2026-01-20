<template>
  <div class="space-y-6">
    <!-- Creation Wizard -->
    <CreationWizard v-if="showWizard" @close="showWizard = false" />
    
    <!-- Main Content -->
    <div v-if="!showWizard">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-semibold text-gray-900">监控目标</h1>
        <div class="flex space-x-2">
          <a-button @click="showWizard = true">
            <template #icon><icon-apps /></template>
            向导创建
          </a-button>
          <a-button type="primary" @click="showCreateModal = true">
            <template #icon><icon-plus /></template>
            新建目标
          </a-button>
          <a-button @click="goToExplore">
            <template #icon><icon-search /></template>
            探索模式
          </a-button>
        </div>
      </div>
    </div>

    <a-card class="bg-white">
      <div v-if="loading" class="text-center py-8">
        <a-spin />
      </div>
      <div v-else-if="targets.length === 0" class="text-center py-8 text-gray-500">
        暂无监控目标，点击上方按钮创建
      </div>
      <div v-else>
        <a-table :data="targets" :columns="columns">
          <template #name="{ record }">
            <div class="flex items-center space-x-2">
              <div
                class="w-2 h-2 rounded-full"
                :class="record.active ? 'bg-green-500' : 'bg-gray-400'"
              />
              <span>{{ record.name }}</span>
            </div>
          </template>
          
          <template #url="{ record }">
            <a-link :href="record.url" target="_blank">
              {{ record.url }}
            </a-link>
          </template>
          
          <template #authType="{ record }">
            <a-tag>{{ getAuthTypeLabel(record.authType) }}</a-tag>
          </template>
          
          <template #status="{ record }">
            <a-switch
              :model-value="record.active"
              @change="(val: boolean) => toggleTargetStatus(record.id, val)"
            />
          </template>
          
          <template #actions="{ record }">
            <div class="flex space-x-2">
              <a-button type="text" size="small" @click="runMonitor(record.id)">
                <template #icon><icon-video-camera /></template>
                运行
              </a-button>
              <a-button type="text" size="small" @click="editTarget(record)">
                <template #icon><icon-edit /></template>
                编辑
              </a-button>
              <a-popconfirm
                content="确定要删除此目标吗？"
                @ok="deleteTarget(record.id)"
              >
                <a-button type="text" size="small" status="danger">
                  <template #icon><icon-delete /></template>
                  删除
                </a-button>
              </a-popconfirm>
            </div>
          </template>
        </a-table>
      </div>
    </a-card>

    <a-modal
      v-model:visible="showCreateModal"
      title="创建监控目标"
      @ok="handleCreate"
      @cancel="resetForm"
    >
      <a-form :model="form" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
        <a-form-item label="名称" field="name" required>
          <a-input v-model="form.name" placeholder="请输入监控目标名称" />
        </a-form-item>
        
        <a-form-item label="URL" field="url" required>
          <a-input v-model="form.url" placeholder="https://example.com" />
        </a-form-item>
        
        <a-form-item label="认证方式" field="authType" required>
          <a-select v-model="form.authType">
            <a-option value="password">密码认证</a-option>
            <a-option value="sso">SSO认证</a-option>
            <a-option value="cookie">Cookie认证</a-option>
            <a-option value="script">自定义脚本</a-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="代理配置" field="proxyProfile">
          <a-input v-model="form.proxyProfile" placeholder="可选：代理配置" />
        </a-form-item>
        
        <a-form-item label="启用状态" field="active">
          <a-switch v-model="form.active" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMonitorStore } from '@/store/monitor'
import type { MonitorTarget } from '@/types/monitor'
import CreationWizard from '@/components/CreationWizard.vue'
import {
  IconPlus,
  IconVideoCamera,
  IconEdit,
  IconDelete,
  IconSearch,
  IconApps
} from '@arco-design/web-vue/es/icon'

const store = useMonitorStore()
const router = useRouter()

const targets = computed(() => store.targets)
const loading = computed(() => store.loading)
const showCreateModal = ref(false)
const showWizard = ref(false)

const form = ref({
  name: '',
  url: '',
  authType: 'password' as 'password' | 'sso' | 'cookie' | 'script',
  proxyProfile: '',
  active: true
})

const columns = [
  { title: '名称', dataIndex: 'name', slotName: 'name' },
  { title: 'URL', dataIndex: 'url', slotName: 'url' },
  { title: '认证方式', dataIndex: 'authType', slotName: 'authType' },
  { title: '状态', dataIndex: 'active', slotName: 'status' },
  { title: '创建时间', dataIndex: 'createdAt' },
  { title: '操作', slotName: 'actions' }
]

const getAuthTypeLabel = (type: string) => {
  const labels = {
    password: '密码认证',
    sso: 'SSO认证',
    cookie: 'Cookie认证',
    script: '自定义脚本'
  }
  return labels[type as keyof typeof labels] || type
}

const handleCreate = async () => {
  if (!form.value.name || !form.value.url) {
    return
  }
  
  try {
    await store.addTarget(form.value)
    showCreateModal.value = false
    resetForm()
  } catch (error) {
    console.error('创建目标失败:', error)
  }
}

const resetForm = () => {
  form.value = {
    name: '',
    url: '',
    authType: 'password',
    proxyProfile: '',
    active: true
  }
}

const toggleTargetStatus = async (id: string, active: boolean) => {
  try {
    await store.updateTarget(id, { active })
  } catch (error) {
    console.error('更新目标状态失败:', error)
  }
}

const runMonitor = async (targetId: string) => {
  try {
    await store.triggerRun(targetId)
    console.log('监控任务已触发')
  } catch (error) {
    console.error('触发监控失败:', error)
  }
}

const editTarget = (target: MonitorTarget) => {
  // 这里可以实现编辑功能
  console.log('编辑目标:', target)
}

const deleteTarget = async (id: string) => {
  try {
    await store.deleteTarget(id)
  } catch (error) {
    console.error('删除目标失败:', error)
  }
}

const goToExplore = () => {
  router.push('/explore')
}

onMounted(() => {
  // 数据已经在App.vue中加载
})
</script>