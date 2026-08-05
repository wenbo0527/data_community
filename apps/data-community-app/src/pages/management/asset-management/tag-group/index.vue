<template>
  <div class="tag-group-page">
    <a-page-header title="标签分组管理" sub-title="标签分组、申请流程、覆盖统计、使用详情">
      <template #extra>
        <a-button @click="goBack">返回标签管理</a-button>
        <a-button type="primary">
          <template #icon><icon-plus /></template>新建分组
        </a-button>
      </template>
    </a-page-header>

    <!-- 分组卡片网格 -->
    <a-row :gutter="16">
      <a-col v-for="g in groups" :key="g.id" :span="8">
        <a-card :bordered="false" class="group-card" :title="g.name">
          <template #extra>
            <a-tag :color="g.color">{{ g.category }}</a-tag>
          </template>
          <p class="group-desc">{{ g.description }}</p>
          <a-row style="margin-top: 12px">
            <a-col :span="8"><a-statistic title="标签数" :value="g.tagCount" /></a-col>
            <a-col :span="8"><a-statistic title="覆盖率" :value="g.coverage" suffix="%" /></a-col>
            <a-col :span="8"><a-statistic title="应用数" :value="g.applicationCount" /></a-col>
          </a-row>
          <a-divider />
          <a-space>
            <a-link @click="viewGroup(g)">查看标签</a-link>
            <a-link @click="editGroup(g)">编辑</a-link>
            <a-link>复制</a-link>
            <a-link @click="deleteGroup(g)">删除</a-link>
          </a-space>
        </a-card>
      </a-col>
    </a-row>

    <!-- 选中分组的标签列表 -->
    <a-card :bordered="false" v-if="selectedGroup" :title="`${selectedGroup.name} · 标签列表`" style="margin-top: 16px">
      <a-table
        :columns="tagColumns"
        :data="selectedGroup.tags"
        :pagination="{ pageSize: 10 }"
        row-key="code"
        size="medium"
      >
        <template #type="{ record }">
          <a-tag :color="tagTypeColor(record.type)">{{ tagTypeLabel(record.type) }}</a-tag>
        </template>
        <template #coverage="{ record }">
          <a-progress :percent="record.coverage / 100" :stroke-width="6" />
        </template>
        <template #actions="{ record }">
          <a-link>详情</a-link>
          <a-divider direction="vertical" />
          <a-link>申请</a-link>
        </template>
      </a-table>
    </a-card>

    <!-- 申请弹窗 -->
    <a-modal
      v-model:visible="applyVisible"
      title="标签申请"
      :width="600"
      @ok="submitApply"
    >
      <a-form :model="applyForm" layout="vertical">
        <a-form-item label="选择标签">
          <a-select v-model="applyForm.tagCode" placeholder="请选择要申请的标签">
            <a-option v-for="g in groups" :key="g.id" :value="g.id">
              {{ g.name }} - {{ g.tags.length }} 个标签
            </a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="使用场景">
          <a-textarea v-model="applyForm.scenario" :auto-size="{ minRows: 3 }" placeholder="请描述使用场景..." />
        </a-form-item>
        <a-form-item label="使用范围">
          <a-radio-group v-model="applyForm.scope">
            <a-radio value="personal">仅本人</a-radio>
            <a-radio value="team">本人团队</a-radio>
            <a-radio value="department">本部门</a-radio>
            <a-radio value="company">全公司</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="有效期">
          <a-select v-model="applyForm.duration">
            <a-option value="7">7 天</a-option>
            <a-option value="30">30 天</a-option>
            <a-option value="90">90 天</a-option>
            <a-option value="365">1 年</a-option>
            <a-option value="forever">永久</a-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'

const router = useRouter()

const groups = ref<any[]>([])
const selectedGroup = ref<any>(null)
const applyVisible = ref(false)
const applyForm = ref({
  tagCode: '',
  scenario: '',
  scope: 'personal',
  duration: '30'
})

onMounted(() => {
  groups.value = [
    {
      id: 'G001', name: '用户属性分组', category: '人口属性', color: 'arcoblue',
      description: '用户基础人口属性标签(年龄、性别、地域等)', tagCount: 8, coverage: 100, applicationCount: 25,
      tags: [
        { code: 'T001', name: '年龄段', type: 'rule', coverage: 100 },
        { code: 'T002', name: '性别', type: 'rule', coverage: 100 },
        { code: 'T003', name: '地域', type: 'rule', coverage: 98 },
        { code: 'T004', name: 'VIP客户', type: 'rule', coverage: 1.5 },
        { code: 'T005', name: '高净值', type: 'rule', coverage: 0.3 }
      ]
    },
    {
      id: 'G002', name: '行为特征分组', category: '行为', color: 'green',
      description: '用户行为偏好类标签(活跃、登录、访问、转化等)', tagCount: 12, coverage: 85, applicationCount: 18,
      tags: [
        { code: 'T010', name: '近30天活跃', type: 'derived', coverage: 72 },
        { code: 'T011', name: '高频用户', type: 'derived', coverage: 7.1 },
        { code: 'T012', name: '沉睡用户', type: 'derived', coverage: 12.5 }
      ]
    },
    {
      id: 'G003', name: '金融属性分组', category: '金融', color: 'orange',
      description: '用户金融资产类标签(AUM、理财、存款等)', tagCount: 6, coverage: 75, applicationCount: 12,
      tags: [
        { code: 'T020', name: '理财偏好', type: 'rule', coverage: 23.5 },
        { code: 'T021', name: '高信用分', type: 'derived', coverage: 28.0 }
      ]
    },
    {
      id: 'G004', name: '风险特征分组', category: '风险', color: 'red',
      description: '用户风险类标签(逾期、黑名单、欺诈等)', tagCount: 8, coverage: 95, applicationCount: 15,
      tags: [
        { code: 'T030', name: '高风险用户', type: 'derived', coverage: 9.6 },
        { code: 'T031', name: '逾期客户', type: 'event', coverage: 1.2 }
      ]
    },
    {
      id: 'G005', name: '偏好画像分组', category: '偏好', color: 'purple',
      description: '用户偏好画像(内容偏好、品类偏好等)', tagCount: 10, coverage: 65, applicationCount: 8,
      tags: [
        { code: 'T040', name: '内容偏好 - 财经', type: 'ml', coverage: 35.2 }
      ]
    },
    {
      id: 'G006', name: '生命周期分组', category: '生命周期', color: 'cyan',
      description: '用户生命周期阶段(新客、成长期、成熟期、流失等)', tagCount: 5, coverage: 100, applicationCount: 6,
      tags: [
        { code: 'T050', name: '新客(<7天)', type: 'rule', coverage: 0.8 },
        { code: 'T051', name: '成长期', type: 'rule', coverage: 8.5 }
      ]
    }
  ]
})

const tagColumns = [
  { title: '编码', dataIndex: 'code', width: 90 },
  { title: '标签名', dataIndex: 'name' },
  { title: '类型', dataIndex: 'type', slotName: 'type', width: 90 },
  { title: '覆盖率', dataIndex: 'coverage', slotName: 'coverage', width: 150 },
  { title: '操作', dataIndex: 'actions', slotName: 'actions', width: 120 }
]

function viewGroup(g: any) {
  selectedGroup.value = g
}

function editGroup(g: any) {
  Message.info(`编辑分组: ${g.name}`)
}

function deleteGroup(g: any) {
  groups.value = groups.value.filter(x => x.id !== g.id)
  Message.success(`已删除: ${g.name}`)
}

function tagTypeColor(t: string) {
  return { rule: 'arcoblue', derived: 'purple', event: 'orange', ml: 'cyan' }[t] || 'gray'
}
function tagTypeLabel(t: string) {
  return { rule: '规则', derived: '派生', event: '事件', ml: '模型' }[t] || t
}

function submitApply() {
  Message.success('申请已提交,等待审批')
  applyVisible.value = false
}

const goBack = () => router.push('management/asset-management/asset-tags')
const goWorkbench = () => router.push('workbench')
</script>

<style lang="scss" scoped>
.tag-group-page {
  padding: 24px;
  max-width: 1500px;
  margin: 0 auto;
  .group-card {
    .group-desc { color: #86909c; font-size: 13px; min-height: 40px; }
  }
}
</style>