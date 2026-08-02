<template>
  <div class="virtual-event-combine">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">虚拟事件组合 · 创建</h1>
        <span class="subtitle">基于多个事件按 {{ combineType }} 关系组合形成新的虚拟事件</span>
      </div>
      <div class="header-right">
        <a-button @click="handleCancel">
          <template #icon><IconClose /></template>
          取消
        </a-button>
        <a-button type="primary" :loading="submitting" @click="handleSubmit">
          <template #icon><IconCheck /></template>
          创建组合事件
        </a-button>
      </div>
    </div>

    <!-- 组合基本信息 -->
    <a-card class="form-card" title="基本信息">
      <a-row :gutter="24">
        <a-col :span="12">
          <a-form-item label="组合事件名称">
            <a-input
              v-model="form.combineName"
              placeholder="例如：用户激活 + 首单 或 用户激活套餐"
              allow-clear
              :max-length="40"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="应用场景">
            <a-select
              v-model="form.scenarios"
              multiple
              placeholder="选择应用场景"
              style="width: 100%"
            >
              <a-option value="营销通知">营销通知</a-option>
              <a-option value="电销出池">电销出池</a-option>
              <a-option value="RFM分析">RFM分析</a-option>
              <a-option value="画像标签">画像标签</a-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="24">
          <a-form-item label="组合说明">
            <a-textarea
              v-model="form.description"
              :auto-size="{ minRows: 2, maxRows: 4 }"
              placeholder="说明该组合事件的业务含义、计算频率、生效时间等"
            />
          </a-form-item>
        </a-col>
      </a-row>
    </a-card>

    <!-- 组合关系配置 -->
    <a-card class="form-card" title="组合关系">
      <div class="combine-meta">
        <span class="label">组合方式</span>
        <a-radio-group v-model="combineType" type="button">
          <a-radio value="OR">事件 A 或 B 或 C（满足任一）</a-radio>
          <a-radio value="AND">事件 A 且 B 且 C（全部满足）</a-radio>
        </a-radio-group>
        <span class="hint">
          <IconQuestionCircle />
          {{ combineType === 'OR' ? '用户触发任一事件均触发本虚拟事件' : '用户需同时触发所有事件才触发本虚拟事件' }}
        </span>
      </div>

      <div class="events-list">
        <div class="events-list-header">
          <span>参与组合的事件</span>
          <span class="events-list-count">共 {{ form.combineEvents.length }} 个</span>
        </div>

        <!-- 事件组合链表 -->
        <div
          v-for="(ev, idx) in form.combineEvents"
          :key="idx"
          class="event-row"
        >
          <span class="event-prefix">
            <a-tag v-if="idx === 0" color="arcoblue" size="small">事件</a-tag>
            <a-tag v-else color="gray" size="small">{{ combineType }}</a-tag>
          </span>
          <span class="event-name">事件{{ letterLabel(idx) }}</span>
          <a-select
            v-model="form.combineEvents[idx]"
            :style="{ flex: 1, minWidth: '260px' }"
            placeholder="选择事件（可输入关键字搜索）"
            filterable
            :show-extra-options="false"
            allow-clear
          >
            <a-option
              v-for="opt in availableEventOptions"
              :key="opt.value"
              :value="opt.value"
              :disabled="isEventAlreadySelected(opt.value, idx)"
            >
              {{ opt.label }}
            </a-option>
          </a-select>
          <span class="event-meta">
            {{ form.combineEvents[idx] ? getEventNameById(form.combineEvents[idx]) : '—' }}
          </span>
          <a-button
            type="text"
            status="danger"
            size="mini"
            @click="removeEvent(idx)"
          >
            <template #icon><IconDelete /></template>
            移除
          </a-button>
        </div>

        <!-- 添加按钮 -->
        <div class="event-add-row">
          <a-button type="dashed" long @click="addEvent">
            <template #icon><IconPlus /></template>
            添加事件
          </a-button>
        </div>

        <!-- 预览 -->
        <div v-if="form.combineEvents.length > 0" class="combine-preview">
          <span class="preview-label">条件表达式预览：</span>
          <a-tag color="arcoblue" size="large">
            {{ previewExpression }}
          </a-tag>
        </div>
      </div>
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import {
  IconClose,
  IconCheck,
  IconPlus,
  IconDelete,
  IconQuestionCircle
} from '@arco-design/web-vue/es/icon'
import { mockEventAPI } from '@/mock/event'

const router = useRouter()

// 组合方式
const combineType = ref('OR')

// 表单数据
const form = reactive({
  combineName: '',
  scenarios: [],
  description: '',
  combineEvents: ['']  // 至少 1 行
})

// 真实事件列表（mock）
const realEvents = ref([])

// 计算可选项（同时排除已选项）
const availableEventOptions = computed(() => {
  return (realEvents.value || []).map((e) => ({
    value: e.id,
    label: `${e.eventName}（${e.id}）`
  }))
})

// 计算预览
const previewExpression = computed(() => {
  const filled = form.combineEvents.filter(Boolean)
  if (filled.length === 0) return ''
  if (filled.length === 1) return '事件 A'
  const labels = filled.map((_, i) => letterLabel(i))
  return labels.join(` ${combineType.value} `)
})

// 字母标签 A/B/C/D...
function letterLabel(i) {
  return String.fromCharCode(65 + i)
}

// 事件是否已被选择（除自身索引外）
function isEventAlreadySelected(eventId, selfIdx) {
  if (!eventId) return false
  return form.combineEvents.some((id, idx) => idx !== selfIdx && id === eventId)
}

// 从 ID 取名称（用于右侧元信息展示）
function getEventNameById(id) {
  const ev = realEvents.value.find((e) => e.id === id)
  return ev ? ev.eventName : ''
}

// 增加事件
function addEvent() {
  form.combineEvents.push('')
}

// 移除事件
function removeEvent(idx) {
  if (form.combineEvents.length === 1) {
    // 最后一格保留但清空
    form.combineEvents[0] = ''
    return
  }
  form.combineEvents.splice(idx, 1)
}

// 取消
function handleCancel() {
  router.push({ name: 'VirtualEvents' })
}

// 提交
const submitting = ref(false)
async function handleSubmit() {
  // 校验
  if (!form.combineName || !form.combineName.trim()) {
    Message.error('请输入组合事件名称')
    return
  }
  const filledEvents = form.combineEvents.filter(Boolean)
  if (filledEvents.length < 2) {
    Message.error('组合至少需要 2 个事件')
    return
  }
  if (form.scenarios.length === 0) {
    Message.error('请至少选择一个应用场景')
    return
  }

  submitting.value = true
  try {
    // 调用 mock API 创建
    const created = await mockEventAPI.createCombineVirtualEvent({
      name: form.combineName.trim(),
      description: form.description.trim(),
      scenarios: form.scenarios,
      combineType: combineType.value,
      events: filledEvents.map((id) => ({
        id,
        name: getEventNameById(id)
      }))
    })
    Message.success(`组合事件创建成功：${created.id}`)
    router.push({ name: 'VirtualEvents' })
  } catch (e) {
    console.error('[combine] submit failed:', e)
    Message.error('组合事件创建失败')
  } finally {
    submitting.value = false
  }
}

// 加载真实事件
onMounted(async () => {
  try {
    const list = await mockEventAPI.getEvents()
    realEvents.value = list || []
  } catch (e) {
    console.error('[combine] load events failed:', e)
  }
})
</script>

<style scoped>
.virtual-event-combine {
  padding: 24px;
  background: #F2F3F5;
  min-height: 100%;
}

.page-header {
  background: white;
  padding: 20px 24px;
  border-radius: 8px;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
.header-left {
  display: flex;
  align-items: baseline;
  gap: 16px;
}
.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #1D2129;
  margin: 0;
}
.subtitle {
  color: #86909c;
  font-size: 13px;
}
.header-right {
  display: flex;
  gap: 12px;
}

.form-card {
  margin-bottom: 24px;
  border-radius: 8px;
}

.combine-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 20px;
  padding: 12px 16px;
  background: #f7f8fa;
  border-radius: 6px;
}
.combine-meta .label {
  font-weight: 500;
  color: #1D2129;
}
.combine-meta .hint {
  color: #86909c;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.events-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-weight: 500;
  color: #1D2129;
}
.events-list-count {
  font-weight: normal;
  font-size: 12px;
  color: #86909c;
}

.event-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  padding: 10px 12px;
  background: #fafbfc;
  border-radius: 6px;
}
.event-prefix {
  width: 60px;
  flex-shrink: 0;
}
.event-name {
  font-weight: 500;
  color: #4E5969;
  white-space: nowrap;
  width: 50px;
  flex-shrink: 0;
}
.event-meta {
  color: #1D2129;
  min-width: 100px;
  max-width: 260px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
}

.event-add-row {
  margin-top: 8px;
}

.combine-preview {
  margin-top: 16px;
  padding: 12px 16px;
  background: #f7f8fa;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.preview-label {
  color: #86909c;
  font-size: 13px;
}

:deep(.arco-btn-text.arco-btn-size-mini) {
  padding: 0 8px;
}
</style>
