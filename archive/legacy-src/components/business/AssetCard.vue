<template>
  <a-card 
    hoverable 
    class="asset-card"
    :bordered="false"
    @click="handleClick"
  >
    <div class="card-header">
      <!-- Icon box removed -->
      <div class="header-info">
        <div class="title-row">
          <span class="asset-name" :title="data.name">{{ data.name }}</span>
        </div>
        <div class="tags-row">
          <a-tag size="mini" :color="typeConfig.tagColor">{{ typeConfig.label }}</a-tag>
          <a-tag size="mini" color="gray" v-if="data.domain">{{ data.domain }}</a-tag>
          <a-tag size="mini" v-for="tag in (data.tags || [])" :key="tag">{{ tag }}</a-tag>
        </div>
      </div>
    </div>
    
    <div class="card-body">
      <p class="description" :title="data.description">{{ data.description || '暂无描述' }}</p>
      <div class="meta-row">
        <span class="meta-item"><icon-user /> {{ data.owner || '未知' }}</span>
        <span class="meta-item"><icon-clock-circle /> {{ data.updateTime }}</span>
      </div>
    </div>
    
    <div class="card-actions" @click.stop>
      <slot name="actions">
        <a-tooltip content="收藏">
          <a-button type="text" size="mini" @click="handleAction('favorite')">
            <template #icon><icon-star /></template>
          </a-button>
        </a-tooltip>
        <a-tooltip content="申请权限">
          <a-button type="text" size="mini" @click="handleAction('permission')">
            <template #icon><icon-lock /></template>
          </a-button>
        </a-tooltip>
        <a-tooltip content="添加到集合">
          <a-button type="text" size="mini" @click="handleAction('collection')">
            <template #icon><icon-folder-add /></template>
          </a-button>
        </a-tooltip>
      </slot>
    </div>
  </a-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  IconFile, IconTrophy, IconCode, IconMindMapping, 
  IconDriveFile, IconApps, IconHistory,
  IconUser, IconClockCircle, IconStar, IconLock, IconFolderAdd
} from '@arco-design/web-vue/es/icon'

const props = defineProps({
  data: {
    type: Object,
    required: true,
    default: () => ({})
  },
  type: {
    type: String,
    default: 'table' // table, metric, variable, feature, file, api, log
  }
})

const emit = defineEmits(['click', 'action'])

// 类型配置映射
const getTypeConfig = (type: string) => {
  const map: Record<string, any> = {
    'table': { icon: IconFile, label: '数据表', colorClass: 'arcoblue', tagColor: 'arcoblue' },
    'metric': { icon: IconTrophy, label: '指标', colorClass: 'orangered', tagColor: 'orangered' },
    'variable': { icon: IconCode, label: '变量', colorClass: 'purple', tagColor: 'purple' },
    'feature': { icon: IconMindMapping, label: '特征', colorClass: 'magenta', tagColor: 'magenta' },
    'file': { icon: IconDriveFile, label: '文件', colorClass: 'gray', tagColor: 'gray' },
    'api': { icon: IconApps, label: 'API', colorClass: 'green', tagColor: 'green' },
    'log': { icon: IconHistory, label: '日志', colorClass: 'cyan', tagColor: 'cyan' },
    // 兼容原有 table 类型细分
    'fact': { icon: IconFile, label: '事实表', colorClass: 'orangered', tagColor: 'orangered' },
    'dim': { icon: IconFile, label: '维度表', colorClass: 'arcoblue', tagColor: 'arcoblue' },
    'dws': { icon: IconFile, label: '汇总表', colorClass: 'green', tagColor: 'green' },
    'dwd': { icon: IconFile, label: '明细表', colorClass: 'cyan', tagColor: 'cyan' }
  }
  
  // 优先使用传入的 type，如果 type 是通用 table 但 data 中有具体 type (如 '维度表')，则尝试匹配 data.type
  let config = map[type]
  
  // 特殊处理 data.type 为中文的情况 (主要针对 TableList 中的逻辑)
  if (type === 'table' && props.data.type) {
    if (props.data.type === '维度表') config = map['dim']
    else if (props.data.type === '事实表') config = map['fact']
    else if (props.data.type === '汇总表') config = map['dws']
    else if (props.data.type === '明细表') config = map['dwd']
  }

  return config || map['table']
}

const typeConfig = computed(() => getTypeConfig(props.type))

const handleClick = () => {
  emit('click', props.data)
}

const handleAction = (action: string) => {
  emit('action', { type: action, data: props.data })
}
</script>

<style scoped>
.asset-card {
  border-radius: 8px;
  transition: all 0.2s;
  background: #fff;
  border: 1px solid #e5e6eb;
  height: 100%;
}

.asset-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: #165DFF;
}

.card-header {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.header-info {
  flex: 1;
  overflow: hidden;
}

.title-row {
  margin-bottom: 4px;
}

.asset-name {
  font-size: 15px;
  font-weight: 600;
  color: #1d2129;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}

.tags-row {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.card-body {
  margin-bottom: 12px;
}

.description {
  color: #86909c;
  font-size: 12px;
  line-height: 1.5;
  height: 36px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 12px;
}

.meta-row {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #86909c;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.card-actions {
  border-top: 1px solid #f2f3f5;
  padding-top: 8px;
  display: flex;
  justify-content: flex-end;
  gap: 4px;
}
</style>