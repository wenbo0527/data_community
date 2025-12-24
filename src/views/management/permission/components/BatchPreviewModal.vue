<template>
  <a-modal
    v-model:visible="visible"
    title="批量申请预览"
    :width="1000"
    :footer="null"
    @cancel="handleCancel"
  >
    <div class="batch-preview-modal">
      <!-- 预览头部 -->
      <div class="preview-header">
        <div class="preview-summary">
          <div class="summary-item">
            <span class="label">申请资源：</span>
            <span class="value">{{ resources.length }} 个</span>
          </div>
          <div class="summary-item">
            <span class="label">权限类型：</span>
            <span class="value">{{ strategy.permissionTypes.join(', ') }}</span>
          </div>
          <div class="summary-item">
            <span class="label">申请期限：</span>
            <span class="value">{{ getDurationText(strategy.duration) }}</span>
          </div>
          <div class="summary-item">
            <span class="label">分组方式：</span>
            <span class="value">{{ getGroupConfigText(strategy.groupConfig) }}</span>
          </div>
          <div class="summary-item">
            <span class="label">紧急程度：</span>
            <span class="value">{{ getUrgencyText(strategy.urgency) }}</span>
          </div>
        </div>
      </div>

      <!-- 资源列表 -->
      <div class="preview-content">
        <div class="resource-list-section">
          <div class="section-header">
            <h4>资源列表</h4>
            <div class="list-actions">
              <a-input-search
                v-model:value="searchText"
                placeholder="搜索资源名称"
                style="width: 200px"
                @search="handleSearch"
                allow-clear
              />
              <a-select
                v-model:value="filterType"
                placeholder="筛选类型"
                style="width: 120px"
                allow-clear
              >
                <a-select-option value="table">数据表</a-select-option>
                <a-select-option value="metric">指标</a-select-option>
                <a-select-option value="variable">变量</a-select-option>
                <a-select-option value="external_data">外部数据</a-select-option>
                <a-select-option value="collection">集合</a-select-option>
                <a-select-option value="service">服务</a-select-option>
              </a-select>
              <a-select
                v-model:value="filterSensitivity"
                placeholder="筛选敏感等级"
                style="width: 120px"
                allow-clear
              >
                <a-select-option value="normal">普通</a-select-option>
                <a-select-option value="sensitive">敏感</a-select-option>
                <a-select-option value="core">核心</a-select-option>
              </a-select>
            </div>
          </div>

          <!-- 分组显示 -->
          <div v-if="strategy.groupConfig !== 'unified'" class="grouped-resources">
            <div
              v-for="(group, index) in groupedResources"
              :key="index"
              class="resource-group"
            >
              <div class="group-header">
                <span class="group-title">{{ group.name }}</span>
                <span class="group-count">({{ group.resources.length }} 个)</span>
                <a-tag :color="getGroupColor(group.name)">
                  {{ getApprovalLevelText(group) }}
                </a-tag>
              </div>
              <div class="group-resources">
                <div
                  v-for="resource in group.resources.slice(0, expandedGroups[index] ? undefined : 5)"
                  :key="resource.id"
                  class="resource-item"
                >
                  <div class="resource-info">
                    <span class="resource-name">{{ resource.name }}</span>
                    <div class="resource-meta">
                      <sensitivity-label :level="resource.sensitivityLevel" />
                      <a-tag size="small">{{ getResourceTypeText(resource.type) }}</a-tag>
                      <span class="database-type">{{ resource.databaseType }}</span>
                    </div>
                  </div>
                  <div class="resource-status">
                    <a-tag :color="getStatusColor(resource)">
                      {{ getStatusText(resource) }}
                    </a-tag>
                  </div>
                </div>
                <div
                  v-if="group.resources.length > 5"
                  class="expand-action"
                  @click="toggleGroupExpand(index)"
                >
                  <a-button type="link" size="small">
                    {{ expandedGroups[index] ? '收起' : `展开全部 (${group.resources.length})` }}
                  </a-button>
                </div>
              </div>
            </div>
          </div>

          <!-- 统一显示 -->
          <div v-else class="unified-resources">
            <div class="resource-stats">
              <div class="stat-item">
                <span class="stat-label">普通资源：</span>
                <span class="stat-value">{{ normalResources.length }} 个</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">敏感资源：</span>
                <span class="stat-value">{{ sensitiveResources.length }} 个</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">核心资源：</span>
                <span class="stat-value">{{ coreResources.length }} 个</span>
              </div>
            </div>
            <div class="resources-list">
              <div
                v-for="resource in filteredResources.slice(0, showAllResources ? undefined : 10)"
                :key="resource.id"
                class="resource-item"
              >
                <div class="resource-info">
                  <span class="resource-name">{{ resource.name }}</span>
                  <div class="resource-meta">
                    <sensitivity-label :level="resource.sensitivityLevel" />
                    <a-tag size="small">{{ getResourceTypeText(resource.type) }}</a-tag>
                    <span class="database-type">{{ resource.databaseType }}</span>
                  </div>
                </div>
                <div class="resource-status">
                  <a-tag :color="getStatusColor(resource)">
                    {{ getStatusText(resource) }}
                  </a-tag>
                </div>
              </div>
              <div
                v-if="filteredResources.length > 10"
                class="expand-action"
                @click="showAllResources = !showAllResources"
              >
                <a-button type="link" size="small">
                  {{ showAllResources ? '收起' : `展开全部 (${filteredResources.length})` }}
                </a-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 审批流程预览 -->
      <div class="approval-preview">
        <h4>审批流程预览</h4>
        <div class="approval-flow">
          <div class="approval-levels">
            <div
              v-for="(level, index) in approvalLevels"
              :key="index"
              class="approval-level"
              :class="{ active: level.hasResources }"
            >
              <div class="level-header">
                <span class="level-name">{{ level.name }}</span>
                <span class="level-count">({{ level.count }} 个)</span>
              </div>
              <div class="level-resources">
                <a-tag
                  v-for="resource in level.resources.slice(0, 3)"
                  :key="resource.id"
                  size="small"
                >
                  {{ resource.name }}
                </a-tag>
                <span v-if="level.resources.length > 3" class="more-count">
                  +{{ level.resources.length - 3 }}
                </span>
              </div>
              <div class="level-time">
                预计审批时间：{{ level.estimatedTime }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="preview-actions">
        <a-space>
          <a-button @click="handleExport">
            <template #icon><download-outlined /></template>
            导出清单
          </a-button>
          <a-button @click="handlePrint">
            <template #icon><printer-outlined /></template>
            打印预览
          </a-button>
          <a-button type="primary" @click="handleSubmit">
            确认提交
          </a-button>
          <a-button @click="handleCancel">
            返回修改
          </a-button>
        </a-space>
      </div>
    </div>
  </a-modal>
</template>

<script>
import { ref, reactive, computed, watch } from 'vue';
import { message } from 'ant-design-vue';
import {
  DownloadOutlined,
  PrinterOutlined
} from '@ant-design/icons-vue';
import SensitivityLabel from './SensitivityLabel.vue';
import { getApprovalLevel, formatTimestamp } from '../utils';

export default {
  name: 'BatchPreviewModal',
  components: {
    SensitivityLabel,
    DownloadOutlined,
    PrinterOutlined
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    resources: {
      type: Array,
      default: () => []
    },
    strategy: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['update:visible', 'submit', 'cancel'],
  setup(props, { emit }) {
    const searchText = ref('');
    const filterType = ref(undefined);
    const filterSensitivity = ref(undefined);
    const showAllResources = ref(false);
    const expandedGroups = ref({});

    // 过滤后的资源
    const filteredResources = computed(() => {
      let filtered = [...props.resources];
      
      if (searchText.value) {
        const searchLower = searchText.value.toLowerCase();
        filtered = filtered.filter(resource =>
          resource.name.toLowerCase().includes(searchLower)
        );
      }
      
      if (filterType.value) {
        filtered = filtered.filter(resource => resource.type === filterType.value);
      }
      
      if (filterSensitivity.value) {
        filtered = filtered.filter(resource => resource.sensitivityLevel === filterSensitivity.value);
      }
      
      return filtered;
    });

    // 分组资源
    const groupedResources = computed(() => {
      const groups = [];
      
      if (props.strategy.groupConfig === 'grouped') {
        // 按资源类型分组
        const typeGroups = {};
        filteredResources.value.forEach(resource => {
          if (!typeGroups[resource.type]) {
            typeGroups[resource.type] = [];
          }
          typeGroups[resource.type].push(resource);
        });
        
        Object.entries(typeGroups).forEach(([type, resources]) => {
          const typeNames = {
            table: '数据表',
            metric: '指标',
            variable: '变量',
            external_data: '外部数据',
            collection: '集合',
            service: '服务'
          };
          
          groups.push({
            name: typeNames[type] || type,
            resources: resources
          });
        });
      } else if (props.strategy.groupConfig === 'sensitivity') {
        // 按敏感等级分组
        const sensitivityGroups = {
          normal: [],
          sensitive: [],
          core: []
        };
        
        filteredResources.value.forEach(resource => {
          sensitivityGroups[resource.sensitivityLevel].push(resource);
        });
        
        const sensitivityNames = {
          normal: '普通资源',
          sensitive: '敏感资源',
          core: '核心资源'
        };
        
        Object.entries(sensitivityGroups).forEach(([level, resources]) => {
          if (resources.length > 0) {
            groups.push({
              name: sensitivityNames[level],
              resources: resources
            });
          }
        });
      }
      
      return groups;
    });

    // 按敏感等级分类的资源
    const normalResources = computed(() => {
      return props.resources.filter(r => r.sensitivityLevel === 'normal');
    });

    const sensitiveResources = computed(() => {
      return props.resources.filter(r => r.sensitivityLevel === 'sensitive');
    });

    const coreResources = computed(() => {
      return props.resources.filter(r => r.sensitivityLevel === 'core');
    });

    // 审批级别
    const approvalLevels = computed(() => {
      const levels = [
        { name: '一级审批', level: 1, resources: [], estimatedTime: '1-2个工作日' },
        { name: '二级审批', level: 2, resources: [], estimatedTime: '2-3个工作日' },
        { name: '三级审批', level: 3, resources: [], estimatedTime: '3-5个工作日' },
        { name: '双审批', level: 'dual', resources: [], estimatedTime: '2-3个工作日' }
      ];

      props.resources.forEach(resource => {
        const approvalLevel = getApprovalLevel(resource.sensitivityLevel, resource.type);
        const levelIndex = levels.findIndex(l => l.level === approvalLevel);
        if (levelIndex !== -1) {
          levels[levelIndex].resources.push(resource);
        }
      });

      levels.forEach(level => {
        level.count = level.resources.length;
        level.hasResources = level.count > 0;
      });

      return levels.filter(level => level.hasResources);
    });

    const getResourceTypeText = (type) => {
      const typeMap = {
        table: '数据表',
        metric: '指标',
        variable: '变量',
        external_data: '外部数据',
        collection: '集合',
        service: '服务'
      };
      return typeMap[type] || type;
    };

    const getDurationText = (duration) => {
      const texts = {
        permanent: '永久',
        temporary: '临时'
      };
      return texts[duration] || duration;
    };

    const getGroupConfigText = (config) => {
      const texts = {
        unified: '统一配置',
        grouped: '按资源类型分组',
        sensitivity: '按敏感等级分组'
      };
      return texts[config] || config;
    };

    const getUrgencyText = (urgency) => {
      const texts = {
        normal: '普通',
        urgent: '紧急',
        very_urgent: '非常紧急'
      };
      return texts[urgency] || urgency;
    };

    const getGroupColor = (groupName) => {
      const colors = {
        '普通资源': 'green',
        '敏感资源': 'orange',
        '核心资源': 'red',
        '数据表': 'blue',
        '指标': 'cyan',
        '变量': 'purple',
        '外部数据': 'geekblue',
        '集合': 'gold',
        '服务': 'lime'
      };
      return colors[groupName] || 'default';
    };

    const getApprovalLevelText = (group) => {
      const level = getApprovalLevel(
        group.resources[0]?.sensitivityLevel,
        group.resources[0]?.type
      );
      return getApprovalLevelDescription(level);
    };

    const getApprovalLevelDescription = (level) => {
      const descriptions = {
        1: '一级审批',
        2: '二级审批',
        3: '三级审批',
        dual: '双审批'
      };
      return descriptions[level] || '一级审批';
    };

    const getStatusColor = (resource) => {
      const level = getApprovalLevel(resource.sensitivityLevel, resource.type);
      const colors = {
        1: 'green',
        2: 'orange',
        3: 'red',
        dual: 'blue'
      };
      return colors[level] || 'default';
    };

    const getStatusText = (resource) => {
      const level = getApprovalLevel(resource.sensitivityLevel, resource.type);
      const texts = {
        1: '一级审批',
        2: '二级审批',
        3: '三级审批',
        dual: '双审批'
      };
      return texts[level] || '待审批';
    };

    const toggleGroupExpand = (index) => {
      expandedGroups.value[index] = !expandedGroups.value[index];
    };

    const handleSearch = () => {
      // 搜索逻辑已在 computed 中处理
    };

    const handleExport = () => {
      // 模拟导出功能
      const exportData = {
        resources: filteredResources.value,
        strategy: props.strategy,
        approvalLevels: approvalLevels.value,
        exportTime: new Date().toISOString()
      };
      
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `batch_permission_preview_${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
      
      message.success('导出成功');
    };

    const handlePrint = () => {
      // 模拟打印功能
      message.info('打印功能开发中');
    };

    const handleSubmit = () => {
      emit('submit', {
        resources: filteredResources.value,
        strategy: props.strategy,
        approvalLevels: approvalLevels.value
      });
    };

    const handleCancel = () => {
      emit('cancel');
    };

    const formatTime = (timestamp) => {
      return formatTimestamp(timestamp);
    };

    // 初始化展开状态
    watch(() => groupedResources.value, (newGroups) => {
      newGroups.forEach((_, index) => {
        if (expandedGroups.value[index] === undefined) {
          expandedGroups.value[index] = false;
        }
      });
    }, { immediate: true });

    return {
      searchText,
      filterType,
      filterSensitivity,
      showAllResources,
      expandedGroups,
      filteredResources,
      groupedResources,
      normalResources,
      sensitiveResources,
      coreResources,
      approvalLevels,
      getResourceTypeText,
      getDurationText,
      getGroupConfigText,
      getUrgencyText,
      getGroupColor,
      getApprovalLevelText,
      getApprovalLevelDescription,
      getStatusColor,
      getStatusText,
      toggleGroupExpand,
      handleSearch,
      handleExport,
      handlePrint,
      handleSubmit,
      handleCancel,
      formatTime
    };
  }
};
</script>

<style lang="less" scoped>
.batch-preview-modal {
  max-height: 70vh;
  overflow-y: auto;
}

.preview-header {
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 16px;
}

.preview-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  
  .summary-item {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .label {
      color: #8c8c8c;
    }
    
    .value {
      font-weight: 500;
      color: #262626;
    }
  }
}

.preview-content {
  margin-bottom: 24px;
}

.resource-list-section {
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    
    h4 {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
    }
    
    .list-actions {
      display: flex;
      gap: 8px;
    }
  }
}

.resource-stats {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 6px;
  
  .stat-item {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .stat-label {
      color: #8c8c8c;
    }
    
    .stat-value {
      font-weight: 500;
      color: #262626;
    }
  }
}

.resources-list {
  .resource-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    border: 1px solid #f0f0f0;
    border-radius: 6px;
    margin-bottom: 8px;
    
    .resource-info {
      flex: 1;
      
      .resource-name {
        font-weight: 500;
        color: #262626;
        margin-bottom: 4px;
        display: block;
      }
      
      .resource-meta {
        display: flex;
        align-items: center;
        gap: 8px;
        
        .database-type {
          color: #8c8c8c;
          font-size: 12px;
        }
      }
    }
    
    .resource-status {
      margin-left: 16px;
    }
  }
}

.grouped-resources {
  .resource-group {
    margin-bottom: 16px;
    border: 1px solid #f0f0f0;
    border-radius: 8px;
    
    .group-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px;
      background: #f5f5f5;
      border-bottom: 1px solid #f0f0f0;
      
      .group-title {
        font-weight: 500;
        color: #262626;
      }
      
      .group-count {
        color: #8c8c8c;
        font-size: 12px;
      }
    }
    
    .group-resources {
      padding: 12px;
      
      .resource-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
        border-bottom: 1px solid #f0f0f0;
        
        &:last-child {
          border-bottom: none;
        }
        
        .resource-info {
          flex: 1;
          
          .resource-name {
            font-weight: 500;
            color: #262626;
            margin-bottom: 4px;
            display: block;
          }
          
          .resource-meta {
            display: flex;
            align-items: center;
            gap: 8px;
            
            .database-type {
              color: #8c8c8c;
              font-size: 12px;
            }
          }
        }
        
        .resource-status {
          margin-left: 16px;
        }
      }
    }
  }
}

.expand-action {
  text-align: center;
  margin-top: 8px;
}

.approval-preview {
  margin-bottom: 24px;
  
  h4 {
    margin-bottom: 16px;
    font-size: 16px;
    font-weight: 500;
  }
}

.approval-flow {
  .approval-levels {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .approval-level {
    padding: 16px;
    border: 1px solid #f0f0f0;
    border-radius: 8px;
    background: #fafafa;
    
    &.active {
      border-color: #1890ff;
      background: #f0f9ff;
    }
    
    .level-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      
      .level-name {
        font-weight: 500;
        color: #262626;
      }
      
      .level-count {
        color: #8c8c8c;
        font-size: 12px;
      }
    }
    
    .level-resources {
      margin-bottom: 8px;
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }
    
    .level-time {
      color: #8c8c8c;
      font-size: 12px;
    }
  }
}

.preview-actions {
  display: flex;
  justify-content: center;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}
</style>