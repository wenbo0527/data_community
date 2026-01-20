<template>
  <div class="policy-template-container">
    <a-card class="search-card" :bordered="false">
      <a-form :model="searchForm" layout="inline">
        <a-form-item label="模板ID">
          <a-input v-model="searchForm.templateId" placeholder="请输入模板ID" />
        </a-form-item>
        <a-form-item label="消息类型">
          <a-select v-model="searchForm.messageType" placeholder="请选择消息类型">
            <a-option value="sms">短信</a-option>
            <a-option value="push">推送</a-option>
            <a-option value="email">邮件</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="消息标题">
          <a-input v-model="searchForm.title" placeholder="请输入消息标题" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="handleSearch">
            <template #icon><icon-search /></template>
            搜索
          </a-button>
          <a-button @click="resetSearch">
            <template #icon><icon-refresh /></template>
            重置
          </a-button>
        </a-form-item>
      </a-form>
    </a-card>

    <a-card class="table-card" :bordered="false">
      <template #extra>
        <a-button type="primary" @click="showCreateModal = true">新建策略模板</a-button>
      </template>

      <a-modal 
        v-model:visible="showCreateModal" 
        title="新建策略模板"
        width="800px"
        @ok="handleCreate"
      >
        <a-form :model="formState" layout="vertical">
          <a-form-item label="标题" required>
            <a-input v-model="formState.title" />
          </a-form-item>
          
          <a-form-item label="消息类型" required>
            <a-radio-group v-model="formState.messageType">
              <a-radio value="sms">短信</a-radio>
              <a-radio value="push">推送</a-radio>
              <a-radio value="email">邮件</a-radio>
            </a-radio-group>
          </a-form-item>
          
          <a-form-item label="一级场景" required>
            <a-select v-model="formState.scene">
              <a-option value="marketing">营销</a-option>
              <a-option value="risk">风控</a-option>
              <a-option value="notification">通知</a-option>
            </a-select>
          </a-form-item>
          
          <a-form-item label="策略Tag" required>
            <a-select v-model="formState.tags" mode="multiple">
              <a-option value="high_priority">高优先级</a-option>
              <a-option value="test">测试</a-option>
              <a-option value="production">生产</a-option>
            </a-select>
          </a-form-item>
          
          <a-form-item label="目标渠道" required>
            <a-select v-model="formState.channel" @change="handleChannelChange">
              <a-option v-for="item in channelOptions" :key="item.value" :value="item.value">
                {{ item.label }}
              </a-option>
            </a-select>
          </a-form-item>
          
          <template v-if="formState.channel === 'sms'">
            <a-form-item label="短信模板">
              <a-select v-model="formState.shortMessageTemplate">
                <a-option value="template1">模板1</a-option>
                <a-option value="template2">模板2</a-option>
              </a-select>
            </a-form-item>
          </template>
          
          <template v-else>
            <a-form-item label="任务ID" required>
              <a-input v-model="formState.taskId" />
            </a-form-item>
            
            <a-form-item label="是否需要挂短">
              <a-switch v-model="formState.needShortMessage" />
            </a-form-item>
            
            <template v-if="formState.needShortMessage">
              <a-form-item label="短信模板">
                <a-select v-model="formState.shortMessageTemplate">
                  <a-option value="template1">模板1</a-option>
                  <a-option value="template2">模板2</a-option>
                </a-select>
              </a-form-item>
            </template>
          </template>
          
          <a-form-item label="发送次数" required>
            <a-input-number v-model="formState.sendCount" :min="1" />
          </a-form-item>
          
          <a-form-item label="发送时间" required>
            <a-date-picker v-model="formState.sendTime" show-time />
          </a-form-item>
        </a-form>
      </a-modal>
      <a-table
        :data="templateList"
        :columns="columns"
        :pagination="pagination"
        :loading="loading"
        @page-change="handlePageChange"
      >
        <template #operations="{ record }">
          <a-space>
            <a-button type="text" size="small" @click="viewDetail(record)">
              <template #icon><icon-eye /></template>
              查看
            </a-button>
            <a-button type="text" size="small" @click="testTemplate(record)">
              <template #icon><icon-experiment /></template>
              测试
            </a-button>
          </a-space>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, h } from 'vue'
type SelectValue = string | number | boolean | Record<string, any> | (string | number | boolean | Record<string, any>)[]
const handleChannelChange = (value: SelectValue) => {}
import { IconSearch, IconRefresh, IconEye, IconExperiment } from '@arco-design/web-vue/es/icon'
import { Tag as ATag } from '@arco-design/web-vue'
const searchForm = reactive({ templateId: '', messageType: '', title: '' })
interface TemplateItem { id: string; messageType: string; scene: string; tags?: string[]; title: string; strategy: string; }
const templateList = ref<TemplateItem[]>([])
const loading = ref(false)
const pagination = reactive({ current: 1, pageSize: 10, total: 0 })
const showCreateModal = ref(false);
const formState = reactive({ title: '', messageType: '', scene: '', tags: [], product: '', channel: '', frequencyControl: '', sendCount: 1, sendTime: '', taskId: '', needShortMessage: false, shortMessageTemplate: '' });
const channelOptions = [
  { label: '短信', value: 'sms' },
  { label: 'AI外呼', value: 'ai_call' },
  { label: '人工外呼', value: 'manual_call' }
];
const handleCreate = () => {};
const columns = [
  { title: '模板ID', dataIndex: 'id', width: 120 },
  { title: '消息类型', dataIndex: 'messageType', width: 100, render: ({ record }: { record: { messageType: string } }) => {
    const typeMap: Record<string, string> = { sms: '短信', push: '推送', email: '邮件' }; return typeMap[record.messageType] || record.messageType;
  }},
  { title: '一级场景', dataIndex: 'scene', width: 120 },
  { title: '策略Tag', dataIndex: 'tags', render: ({ record }: { record: { tags?: string[] } }) => h('div', record.tags?.map((tag: string) => h(ATag, { color: 'blue', style: { marginRight: '4px' } }, () => tag))) },
  { title: '消息标题', dataIndex: 'title', ellipsis: true, tooltip: true },
  { title: '消息策略', dataIndex: 'strategy', ellipsis: true, tooltip: true },
  { title: '操作', slotName: 'operations', width: 150 }
]
const handleSearch = () => { pagination.current = 1; fetchData() }
const resetSearch = () => { (Object.keys(searchForm) as Array<keyof typeof searchForm>).forEach(key => { searchForm[key] = '' }); handleSearch() }
const handlePageChange = (current: number) => { pagination.current = current; fetchData() }
const viewDetail = (record: { id: string }) => { console.log('查看详情', record) }
const testTemplate = (record: { id: string }) => { console.log('测试模板', record) }
const fetchData = async () => {
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    templateList.value = Array.from({ length: 10 }, (_, i) => ({
      id: `TP${1000 + i}`,
      messageType: ['sms', 'push', 'email'][i % 3],
      scene: ['营销', '风控', '通知'][i % 3],
      tags: [['高优先级', '测试', '正式'][i % 3]],
      title: `模板标题${i + 1}`,
      strategy: `策略描述${i + 1}`
    }))
    pagination.total = 30
  } catch (error) {
    console.error('获取模板列表失败', error)
  } finally {
    loading.value = false
  }
}
onMounted(() => { fetchData() })
</script>

<style scoped>
.policy-template-container { padding: 16px; background-color: var(--color-fill-2); }
.search-card { margin-bottom: 16px; }
.table-card { margin-bottom: 16px; }
</style>
