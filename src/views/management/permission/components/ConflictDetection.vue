<template>
  <div class="conflict-detection">
    <div class="detection-header">
      <h3>冲突检测</h3>
      <a-button 
        type="primary" 
        @click="runDetection"
        :loading="detecting"
        :disabled="resources.length === 0"
      >
        开始检测
      </a-button>
    </div>

    <!-- 检测结果 -->
    <div v-if="conflicts.length > 0" class="conflict-results">
      <a-alert
        :message="`检测到 ${conflicts.length} 个冲突，请处理后再提交申请`"
        type="warning"
        show-icon
        closable
        class="conflict-summary"
      />

      <div class="conflict-list">
        <div
          v-for="(conflict, index) in conflicts"
          :key="index"
          class="conflict-item"
          :class="getConflictTypeClass(conflict.type)"
        >
          <div class="conflict-icon">
            <warning-outlined v-if="conflict.type === 'duplicate'" />
            <info-circle-outlined v-else-if="conflict.type === 'already_has_permission'" />
            <close-circle-outlined v-else />
          </div>
          <div class="conflict-content">
            <div class="conflict-title">
              <span class="resource-name">{{ conflict.resourceName }}</span>
              <a-tag :color="getConflictTypeColor(conflict.type)">
                {{ getConflictTypeText(conflict.type) }}
              </a-tag>
            </div>
            <div class="conflict-reason">
              {{ conflict.conflictReason }}
            </div>
            <div class="conflict-suggestion">
              建议：{{ conflict.suggestion }}
            </div>
          </div>
          <div class="conflict-actions">
            <a-space>
              <a-button
                size="small"
                @click="handleConflictAction(conflict, 'ignore')"
                v-if="canIgnore(conflict.type)"
              >
                忽略
              </a-button>
              <a-button
                size="small"
                type="primary"
                @click="handleConflictAction(conflict, 'resolve')"
                v-if="canResolve(conflict.type)"
              >
                解决
              </a-button>
              <a-button
                size="small"
                danger
                @click="handleConflictAction(conflict, 'remove')"
              >
                移除
              </a-button>
            </a-space>
          </div>
        </div>
      </div>

      <div class="batch-actions">
        <a-space>
          <a-button @click="ignoreAllConflicts" v-if="hasIgnorableConflicts">
            全部忽略
          </a-button>
          <a-button @click="resolveAllConflicts" v-if="hasResolvableConflicts" type="primary">
            全部解决
          </a-button>
          <a-button danger @click="removeAllConflicts">
            全部移除
          </a-button>
        </a-space>
      </div>
    </div>

    <!-- 无冲突 -->
    <div v-else-if="detectionCompleted && conflicts.length === 0" class="no-conflicts">
      <a-result
        status="success"
        title="未检测到冲突"
        sub-title="所有资源都可以正常申请"
      >
        <template #icon>
          <check-circle-outlined />
        </template>
      </a-result>
    </div>

    <!-- 检测中 -->
    <div v-else-if="detecting" class="detecting">
      <a-spin size="large" tip="正在检测冲突..." />
    </div>

    <!-- 未检测 -->
    <div v-else class="no-detection">
      <a-empty description="请先选择资源，然后点击开始检测" />
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, watch } from 'vue';
import { message, Modal } from 'ant-design-vue';
import {
  WarningOutlined,
  InfoCircleOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons-vue';
import { detectPermissionConflicts } from '../utils';

export default {
  name: 'ConflictDetection',
  components: {
    WarningOutlined,
    InfoCircleOutlined,
    CloseCircleOutlined,
    CheckCircleOutlined
  },
  props: {
    resources: {
      type: Array,
      default: () => []
    },
    existingPermissions: {
      type: Array,
      default: () => []
    }
  },
  emits: ['conflict-detected', 'conflict-resolved', 'conflict-ignored'],
  setup(props, { emit }) {
    const detecting = ref(false);
    const detectionCompleted = ref(false);
    const conflicts = ref([]);
    const resolvedConflicts = ref(new Set());
    const ignoredConflicts = ref(new Set());

    const hasIgnorableConflicts = computed(() => {
      return conflicts.value.some(conflict => canIgnore(conflict.type));
    });

    const hasResolvableConflicts = computed(() => {
      return conflicts.value.some(conflict => canResolve(conflict.type));
    });

    const canIgnore = (type) => {
      return ['duplicate', 'permission_conflict'].includes(type);
    };

    const canResolve = (type) => {
      return ['duplicate'].includes(type);
    };

    const getConflictTypeClass = (type) => {
      return `conflict-${type}`;
    };

    const getConflictTypeColor = (type) => {
      const colors = {
        duplicate: 'orange',
        already_has_permission: 'blue',
        permission_conflict: 'red',
        resource_not_exist: 'red'
      };
      return colors[type] || 'default';
    };

    const getConflictTypeText = (type) => {
      const texts = {
        duplicate: '重复申请',
        already_has_permission: '已有权限',
        permission_conflict: '权限冲突',
        resource_not_exist: '资源不存在'
      };
      return texts[type] || '未知冲突';
    };

    const runDetection = async () => {
      if (props.resources.length === 0) {
        message.warning('请先选择资源');
        return;
      }

      detecting.value = true;
      detectionCompleted.value = false;

      try {
        // 模拟检测过程
        await new Promise(resolve => setTimeout(resolve, 1500));

        // 执行冲突检测
        const detectedConflicts = detectPermissionConflicts(
          props.resources,
          props.existingPermissions
        );

        // 过滤掉已解决的冲突
        conflicts.value = detectedConflicts.filter(conflict => 
          !resolvedConflicts.value.has(conflict.resourceId)
        );

        detectionCompleted.value = true;
        
        if (conflicts.value.length > 0) {
          message.warning(`检测到 ${conflicts.value.length} 个冲突，请处理`);
        } else {
          message.success('未检测到冲突，可以继续提交申请');
        }

        emit('conflict-detected', conflicts.value);
      } catch (error) {
        message.error('冲突检测失败');
        console.error('冲突检测失败:', error);
      } finally {
        detecting.value = false;
      }
    };

    const handleConflictAction = (conflict, action) => {
      switch (action) {
        case 'ignore':
          ignoreConflict(conflict);
          break;
        case 'resolve':
          resolveConflict(conflict);
          break;
        case 'remove':
          removeConflict(conflict);
          break;
      }
    };

    const ignoreConflict = (conflict) => {
      ignoredConflicts.value.add(conflict.resourceId);
      removeConflictFromList(conflict);
      message.info(`已忽略冲突：${conflict.resourceName}`);
      emit('conflict-ignored', conflict);
    };

    const resolveConflict = (conflict) => {
      if (conflict.type === 'duplicate') {
        // 对于重复申请，保留第一个，移除其他的
        const firstOccurrence = props.resources.find(r => r.id === conflict.resourceId);
        if (firstOccurrence) {
          // 移除重复的资源
          const updatedResources = props.resources.filter((r, index) => {
            const firstIndex = props.resources.findIndex(item => item.id === conflict.resourceId);
            return index === firstIndex;
          });
          
          // 这里需要通知父组件更新资源列表
          message.success(`已解决重复冲突：${conflict.resourceName}`);
          resolvedConflicts.value.add(conflict.resourceId);
          removeConflictFromList(conflict);
          emit('conflict-resolved', { conflict, action: 'remove_duplicates' });
        }
      }
    };

    const removeConflict = (conflict) => {
      Modal.confirm({
        title: '确认移除',
        content: `确定要从申请列表中移除 "${conflict.resourceName}" 吗？`,
        onOk: () => {
          // 从资源列表中移除
          const updatedResources = props.resources.filter(r => r.id !== conflict.resourceId);
          // 通知父组件更新资源列表
          emit('conflict-resolved', { conflict, action: 'remove_resource', updatedResources });
          removeConflictFromList(conflict);
          message.success(`已移除资源：${conflict.resourceName}`);
        }
      });
    };

    const removeConflictFromList = (conflict) => {
      conflicts.value = conflicts.value.filter(c => c !== conflict);
    };

    const ignoreAllConflicts = () => {
      Modal.confirm({
        title: '确认忽略所有冲突',
        content: '确定要忽略所有可忽略的冲突吗？忽略后的冲突将不再显示。',
        onOk: () => {
          const ignorableConflicts = conflicts.value.filter(conflict => canIgnore(conflict.type));
          ignorableConflicts.forEach(conflict => {
            ignoredConflicts.value.add(conflict.resourceId);
            removeConflictFromList(conflict);
            emit('conflict-ignored', conflict);
          });
          message.success(`已忽略 ${ignorableConflicts.length} 个冲突`);
        }
      });
    };

    const resolveAllConflicts = () => {
      Modal.confirm({
        title: '确认解决所有冲突',
        content: '确定要解决所有可解决的冲突吗？',
        onOk: () => {
          const resolvableConflicts = conflicts.value.filter(conflict => canResolve(conflict.type));
          resolvableConflicts.forEach(conflict => {
            resolveConflict(conflict);
          });
          message.success(`已解决 ${resolvableConflicts.length} 个冲突`);
        }
      });
    };

    const removeAllConflicts = () => {
      Modal.confirm({
        title: '确认移除所有冲突',
        content: '确定要移除所有存在冲突的资源吗？这将会从申请列表中删除这些资源。',
        onOk: () => {
          const conflictResourceIds = conflicts.value.map(c => c.resourceId);
          // 从资源列表中移除所有冲突资源
          const updatedResources = props.resources.filter(r => !conflictResourceIds.includes(r.id));
          emit('conflict-resolved', { 
            conflicts: conflicts.value, 
            action: 'remove_all_conflicts', 
            updatedResources 
          });
          conflicts.value = [];
          message.success('已移除所有冲突资源');
        }
      });
    };

    // 监听资源变化，自动重新检测
    watch(() => props.resources, (newResources) => {
      if (detectionCompleted.value && newResources.length > 0) {
        // 延迟重新检测，避免频繁检测
        setTimeout(() => {
          runDetection();
        }, 500);
      }
    });

    return {
      detecting,
      detectionCompleted,
      conflicts,
      hasIgnorableConflicts,
      hasResolvableConflicts,
      canIgnore,
      canResolve,
      getConflictTypeClass,
      getConflictTypeColor,
      getConflictTypeText,
      runDetection,
      handleConflictAction,
      ignoreAllConflicts,
      resolveAllConflicts,
      removeAllConflicts
    };
  }
};
</script>

<style lang="less" scoped>
.conflict-detection {
  padding: 24px;
  background: #fff;
  border-radius: 8px;
}

.detection-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  
  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 500;
  }
}

.conflict-summary {
  margin-bottom: 16px;
}

.conflict-list {
  margin-bottom: 16px;
}

.conflict-item {
  display: flex;
  align-items: flex-start;
  padding: 16px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  margin-bottom: 12px;
  background: #fafafa;
  
  &.conflict-duplicate {
    border-left: 4px solid #faad14;
  }
  
  &.conflict-already_has_permission {
    border-left: 4px solid #1890ff;
  }
  
  &.conflict-permission_conflict {
    border-left: 4px solid #ff4d4f;
  }
  
  &.conflict-resource_not_exist {
    border-left: 4px solid #ff4d4f;
  }
}

.conflict-icon {
  margin-right: 12px;
  font-size: 20px;
  color: #faad14;
  margin-top: 2px;
}

.conflict-content {
  flex: 1;
  
  .conflict-title {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    
    .resource-name {
      font-weight: 500;
      color: #262626;
    }
  }
  
  .conflict-reason {
    color: #595959;
    margin-bottom: 4px;
    font-size: 14px;
  }
  
  .conflict-suggestion {
    color: #8c8c8c;
    font-size: 12px;
  }
}

.conflict-actions {
  margin-left: 16px;
}

.batch-actions {
  display: flex;
  justify-content: center;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.no-conflicts {
  padding: 48px 0;
}

.detecting {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.no-detection {
  padding: 48px 0;
}
</style>