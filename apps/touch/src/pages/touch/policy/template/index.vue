<template>
  <div class="policy-template-container">
    <a-card class="search-card" :bordered="false">
      <a-form :model="searchForm" layout="inline">
        <a-form-item label="模板ID" field="templateId">
          <a-input v-model="searchForm.templateId" placeholder="请输入模板ID" style="width: 160px" />
        </a-form-item>
        <a-form-item label="消息类型" field="messageType">
          <a-select v-model="searchForm.messageType" placeholder="请选择消息类型" style="width: 160px" allow-clear>
            <a-option value="sms">短信</a-option>
            <a-option value="push">推送</a-option>
            <a-option value="email">邮件</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="消息标题" field="title">
          <a-input v-model="searchForm.title" placeholder="请输入消息标题" style="width: 200px" />
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="handleSearch">
              <template #icon><icon-search /></template>
              搜索
            </a-button>
            <a-button @click="resetSearch">
              <template #icon><icon-refresh /></template>
              重置
            </a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>

    <a-card class="table-card" :bordered="false">
      <template #extra>
        <a-button type="primary" @click="handleOpenCreateModal">新建策略模板</a-button>
      </template>

      <a-modal 
        v-model:visible="showCreateModal" 
        :title="modalTitle"
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
          <a-space :size="0">
            <a-button type="text" size="small" style="padding: 0 4px" @click="viewDetail(record)">
              <template #icon><icon-eye /></template>
              查看
            </a-button>
            <a-button type="text" size="small" style="padding: 0 4px" @click="copyTemplate(record)">
              <template #icon><icon-copy /></template>
              复制
            </a-button>
            <a-button type="text" size="small" style="padding: 0 4px" @click="testTemplate(record)">
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
import { useRouter } from 'vue-router'
const router = useRouter()
type SelectValue = string | number | boolean | Record<string, any> | (string | number | boolean | Record<string, any>)[]
const handleChannelChange = (value: SelectValue) => {}
import { IconSearch, IconRefresh, IconEye, IconExperiment, IconCopy } from '@arco-design/web-vue/es/icon'
import { Tag as ATag } from '@arco-design/web-vue'
const searchForm = reactive({ templateId: '', messageType: '', title: '' })
interface TemplateItem { id: string; messageType: string; vendor?: string; scene: string; tags?: string[]; title: string; strategy: string; }
const templateList = ref<TemplateItem[]>([])
const loading = ref(false)
const pagination = reactive({ current: 1, pageSize: 10, total: 0 })
const showCreateModal = ref(false);
const modalTitle = ref('新建策略模板');
const formState = reactive({ title: '', messageType: '', scene: '', tags: [], product: '', channel: '', frequencyControl: '', sendCount: 1, sendTime: '', taskId: '', needShortMessage: false, shortMessageTemplate: '' });
const channelOptions = [
  { label: '短信', value: 'sms' },
  { label: 'AI外呼', value: 'ai_call' },
  { label: '人工外呼', value: 'manual_call' }
];
const handleCreate = () => {};
const columns = [
  { title: '模板ID', dataIndex: 'id', width: 90 },
  { title: '消息类型', dataIndex: 'messageType', width: 90, render: ({ record }: { record: { messageType: string } }) => {
    const typeMap: Record<string, string> = { sms: '短信', push: '推送', email: '邮件' }; return typeMap[record.messageType] || record.messageType;
  }},
  { title: '厂商', dataIndex: 'vendor', width: 120, render: ({ record }: { record: { vendor: string } }) => {
    const vendorMap: Record<string, string> = { 
      aliyun: '阿里云短信', 
      tencent: '腾讯云短信', 
      baiying: '百应', 
      jiusi: '九四', 
      manual: '人工坐席' 
    }; 
    return vendorMap[record.vendor] || record.vendor || '-';
  }},
  { title: '一级场景', dataIndex: 'scene', width: 90 },
  { title: '策略Tag', dataIndex: 'tags', width: 120, render: ({ record }: { record: { tags?: string[] } }) => h('div', record.tags?.map((tag: string) => h(ATag, { color: 'blue', size: 'small', style: { marginRight: '4px' } }, () => tag))) },
  { title: '消息标题', dataIndex: 'title', width: 200, ellipsis: true, tooltip: true },
  { title: '消息策略', dataIndex: 'strategy', ellipsis: true, tooltip: true },
  { title: '操作', slotName: 'operations', width: 200 }
]
const handleSearch = () => { pagination.current = 1; fetchData() }
const resetSearch = () => { (Object.keys(searchForm) as Array<keyof typeof searchForm>).forEach(key => { searchForm[key] = '' }); handleSearch() }
const handlePageChange = (current: number) => { pagination.current = current; fetchData() }

const resetFormState = () => {
  formState.title = '';
  formState.messageType = '';
  formState.scene = '';
  formState.tags = [];
  formState.product = '';
  formState.channel = '';
  formState.frequencyControl = '';
  formState.sendCount = 1;
  formState.sendTime = '';
  formState.taskId = '';
  formState.needShortMessage = false;
  formState.shortMessageTemplate = '';
};

const handleOpenCreateModal = () => {
  router.push('/touch/policy/template/create')
};

const copyTemplate = (record: TemplateItem) => {
  const sceneMap: Record<string, string> = { '营销': 'marketing', '风控': 'risk', '通知': 'notification', '历史存量': 'history' };
  const scene = sceneMap[record.scene] || record.scene;
  const tags = JSON.stringify(record.tags || []);
  router.push({ 
    path: '/touch/policy/template/create', 
    query: { 
      mode: 'copy', 
      title: `${record.title}_副本`, 
      messageType: record.messageType, 
      scene, 
      tags,
      vendor: record.vendor
    } 
  })
};

const viewDetail = (record: { id: string }) => { console.log('查看详情', record) }
const testTemplate = (record: { id: string }) => { console.log('测试模板', record) }
const fetchData = async () => {
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    const scenes = ['营销', '风控', '通知', '历史存量']
    const titles = [
      '模板标题1 - 用于验证复制功能与回填逻辑',
      '模板标题2 - 标题较长以测试省略与布局表现，包含更多描述信息',
      '模板标题3 - 短标题',
      '模板标题4 - 促销活动阶段短信策略模板',
      '模板标题5 - 风控告警策略示例',
      '模板标题6 - 通知类模板（含变更提醒与系统告警）'
    ]
    const strategies = [
      '这是一个较长的策略描述，用于测试复制和展示的完整性，以及在不同屏幕宽度下的省略表现。',
      '策略描述较短。',
      '包含多渠道策略：短信+AI外呼+邮件，按频控规则分时段发送。',
      '用于营销活动期间的触达，带有节假日频控和渠道优先级。',
      '风控预警触发后分级通知，严重等级需要人工外呼确认。',
      '系统通知模板，覆盖版本发布、升级维护、异常提醒等场景。'
    ]
    templateList.value = Array.from({ length: 12 }, (_, i) => ({
      id: `TP${1000 + i}`,
      messageType: ['sms', 'push', 'email'][i % 3],
      vendor: ['aliyun', 'baiying', 'jiusi', 'tencent', 'manual'][i % 5],
      scene: scenes[i % scenes.length],
      tags: [['高优先级', '测试', '正式'][i % 3]],
      title: titles[i % titles.length],
      strategy: strategies[i % strategies.length]
    }))
    pagination.total = 36
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
.search-card :deep(.arco-card-body) { padding: 16px; }
.table-card { margin-bottom: 16px; }
</style>
