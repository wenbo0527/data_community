<template>
  <div class="batch-strategy-config">
    <a-form
      ref="formRef"
      :model="formData"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 16 }"
    >
      <!-- 权限类型配置 -->
      <a-form-item label="权限类型" name="permissionTypes">
        <a-checkbox-group v-model:value="formData.permissionTypes">
          <a-checkbox value="view">查看</a-checkbox>
          <a-checkbox value="edit">编辑</a-checkbox>
          <a-checkbox value="call">调用</a-checkbox>
          <a-checkbox value="subscribe">订阅</a-checkbox>
        </a-checkbox-group>
        <div class="permission-hint">
          <a-alert
            message="批量申请时，所有资源将统一申请选中的权限类型"
            type="info"
            show-icon
            style="margin-top: 8px"
          />
        </div>
      </a-form-item>

      <!-- 申请期限 -->
      <a-form-item label="申请期限" name="duration">
        <a-radio-group v-model:value="formData.duration">
          <a-radio value="permanent">永久</a-radio>
          <a-radio value="temporary">临时</a-radio>
        </a-radio-group>
      </a-form-item>

      <!-- 到期日期（临时权限） -->
      <a-form-item
        v-if="formData.duration === 'temporary'"
        label="到期日期"
        name="expireDate"
      >
        <a-date-picker
          v-model:value="formData.expireDate"
          format="YYYY-MM-DD"
          placeholder="选择到期日期"
          :disabled-date="disabledDate"
        />
      </a-form-item>

      <!-- 申请理由 -->
      <a-form-item label="申请理由" name="reason">
        <div class="reason-section">
          <a-textarea
            v-model:value="formData.reason"
            placeholder="请详细说明批量申请权限的原因和用途..."
            :rows="4"
            :max-length="500"
            show-count
          />
          <div class="reason-templates">
            <span class="templates-label">快速模板：</span>
            <a-space>
              <a-button
                v-for="template in reasonTemplates"
                :key="template.id"
                size="small"
                @click="applyTemplate(template)"
              >
                {{ template.name }}
              </a-button>
            </a-space>
          </div>
        </div>
      </a-form-item>

      <!-- 分组配置 -->
      <a-form-item label="分组配置">
        <div class="group-config">
          <a-radio-group v-model:value="formData.groupConfig">
            <a-radio value="unified">统一配置</a-radio>
            <a-radio value="grouped">按资源类型分组</a-radio>
            <a-radio value="sensitivity">按敏感等级分组</a-radio>
          </a-radio-group>
          
          <div class="group-preview" v-if="formData.groupConfig !== 'unified'">
            <div class="preview-title">分组预览：</div>
            <div class="preview-content">
              <div
                v-for="(group, index) in resourceGroups"
                :key="index"
                class="group-item"
              >
                <div class="group-header">
                  <span class="group-name">{{ group.name }}</span>
                  <span class="group-count">({{ group.resources.length }} 个)</span>
                </div>
                <div class="group-resources">
                  <a-tag
                    v-for="resource in group.resources.slice(0, 3)"
                    :key="resource.id"
                    size="small"
                  >
                    {{ resource.name }}
                  </a-tag>
                  <span v-if="group.resources.length > 3" class="more-count">
                    +{{ group.resources.length - 3 }} 个
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </a-form-item>

      <!-- 紧急程度 -->
      <a-form-item label="紧急程度" name="urgency">
        <a-radio-group v-model:value="formData.urgency">
          <a-radio value="normal">普通</a-radio>
          <a-radio value="urgent">紧急</a-radio>
          <a-radio value="very_urgent">非常紧急</a-radio>
        </a-radio-group>
      </a-form-item>

      <!-- 优先级 -->
      <a-form-item label="优先级" name="priority">
        <a-slider
          v-model:value="formData.priority"
          :min="1"
          :max="5"
          :marks="priorityMarks"
        />
      </a-form-item>

      <!-- 模板保存 -->
      <a-form-item label="保存模板">
        <div class="template-save">
          <a-space>
            <a-input
              v-model:value="templateName"
              placeholder="输入模板名称"
              style="width: 200px"
            />
            <a-button @click="saveTemplate" :disabled="!templateName">
              保存为模板
            </a-button>
            <a-button @click="showTemplateManager = true">
              管理模板
            </a-button>
          </a-space>
        </div>
      </a-form-item>
    </a-form>

    <!-- 模板管理弹窗 -->
    <a-modal
      v-model:visible="showTemplateManager"
      title="模板管理"
      :footer="null"
      width="60%"
    >
      <div class="template-manager">
        <div v-if="savedTemplates.length === 0" class="no-templates">
          <a-empty description="暂无保存的模板" />
        </div>
        <div v-else class="templates-list">
          <div
            v-for="template in savedTemplates"
            :key="template.id"
            class="template-item"
          >
            <div class="template-info">
              <h4>{{ template.name }}</h4>
              <div class="template-meta">
                <span>创建时间：{{ formatTime(template.createdAt) }}</span>
                <span>使用次数：{{ template.usageCount }}</span>
              </div>
              <div class="template-config">
                <a-tag>权限：{{ template.config.permissionTypes.join(', ') }}</a-tag>
                <a-tag>期限：{{ getDurationText(template.config.duration) }}</a-tag>
                <a-tag>紧急度：{{ getUrgencyText(template.config.urgency) }}</a-tag>
              </div>
            </div>
            <div class="template-actions">
              <a-space>
                <a-button size="small" @click="loadTemplate(template)">
                  加载
                </a-button>
                <a-button size="small" danger @click="deleteTemplate(template)">
                  删除
                </a-button>
              </a-space>
            </div>
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script>
import { ref, reactive, computed, watch } from 'vue';
import { message, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';
import { getApplicationReasonTemplates } from '../utils';

export default {
  name: 'BatchStrategyConfig',
  props: {
    resources: {
      type: Array,
      default: () => []
    },
    value: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['update:value', 'template-saved'],
  setup(props, { emit }) {
    const formRef = ref();
    const templateName = ref('');
    const showTemplateManager = ref(false);
    const savedTemplates = ref([]);

    const formData = computed({
      get: () => props.value,
      set: (value) => emit('update:value', value)
    });

    const priorityMarks = {
      1: '低',
      3: '中',
      5: '高'
    };

    const reasonTemplates = ref(getApplicationReasonTemplates());

    // 资源分组
    const resourceGroups = computed(() => {
      if (props.resources.length === 0) return [];

      const groups = [];
      
      if (formData.value.groupConfig === 'grouped') {
        // 按资源类型分组
        const typeGroups = {};
        props.resources.forEach(resource => {
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
      } else if (formData.value.groupConfig === 'sensitivity') {
        // 按敏感等级分组
        const sensitivityGroups = {
          normal: [],
          sensitive: [],
          core: []
        };
        
        props.resources.forEach(resource => {
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

    const disabledDate = (current) => {
      return current && current < dayjs().startOf('day');
    };

    const applyTemplate = (template) => {
      formData.value.reason = template.content;
      message.success(`已应用模板：${template.name}`);
    };

    const saveTemplate = () => {
      if (!templateName.value.trim()) {
        message.warning('请输入模板名称');
        return;
      }

      const template = {
        id: Date.now().toString(),
        name: templateName.value.trim(),
        config: {
          permissionTypes: [...formData.value.permissionTypes],
          duration: formData.value.duration,
          expireDate: formData.value.expireDate,
          reason: formData.value.reason,
          urgency: formData.value.urgency,
          priority: formData.value.priority,
          groupConfig: formData.value.groupConfig
        },
        createdAt: Date.now(),
        usageCount: 0
      };

      savedTemplates.value.push(template);
      localStorage.setItem('batchPermissionTemplates', JSON.stringify(savedTemplates.value));
      
      templateName.value = '';
      message.success('模板保存成功');
      emit('template-saved', template);
    };

    const loadTemplate = (template) => {
      formData.value = {
        ...formData.value,
        ...template.config
      };
      message.success(`已加载模板：${template.name}`);
      showTemplateManager.value = false;
    };

    const deleteTemplate = (template) => {
      Modal.confirm({
        title: '确认删除',
        content: `确定要删除模板 "${template.name}" 吗？`,
        onOk: () => {
          savedTemplates.value = savedTemplates.value.filter(t => t.id !== template.id);
          localStorage.setItem('batchPermissionTemplates', JSON.stringify(savedTemplates.value));
          message.success('模板删除成功');
        }
      });
    };

    const getDurationText = (duration) => {
      const texts = {
        permanent: '永久',
        temporary: '临时'
      };
      return texts[duration] || duration;
    };

    const getUrgencyText = (urgency) => {
      const texts = {
        normal: '普通',
        urgent: '紧急',
        very_urgent: '非常紧急'
      };
      return texts[urgency] || urgency;
    };

    const formatTime = (timestamp) => {
      return dayjs(timestamp).format('YYYY-MM-DD HH:mm');
    };

    // 加载保存的模板
    const loadSavedTemplates = () => {
      const templatesStr = localStorage.getItem('batchPermissionTemplates');
      if (templatesStr) {
        try {
          savedTemplates.value = JSON.parse(templatesStr);
        } catch (error) {
          console.error('加载模板失败:', error);
          savedTemplates.value = [];
        }
      }
    };

    // 初始化
    loadSavedTemplates();

    return {
      formRef,
      formData,
      templateName,
      showTemplateManager,
      savedTemplates,
      priorityMarks,
      reasonTemplates,
      resourceGroups,
      disabledDate,
      applyTemplate,
      saveTemplate,
      loadTemplate,
      deleteTemplate,
      getDurationText,
      getUrgencyText,
      formatTime
    };
  }
};
</script>

<style lang="less" scoped>
.batch-strategy-config {
  padding: 24px;
  background: #fff;
  border-radius: 8px;
}

.permission-hint {
  margin-top: 8px;
}

.reason-section {
  .reason-templates {
    margin-top: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
    
    .templates-label {
      color: #8c8c8c;
      font-size: 12px;
    }
  }
}

.group-config {
  .group-preview {
    margin-top: 16px;
    padding: 16px;
    background: #f5f5f5;
    border-radius: 6px;
    
    .preview-title {
      font-weight: 500;
      margin-bottom: 12px;
      color: #262626;
    }
    
    .preview-content {
      .group-item {
        margin-bottom: 12px;
        padding: 12px;
        background: #fff;
        border-radius: 4px;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        .group-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          
          .group-name {
            font-weight: 500;
            color: #262626;
          }
          
          .group-count {
            color: #8c8c8c;
            font-size: 12px;
          }
        }
        
        .group-resources {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          align-items: center;
          
          .more-count {
            color: #8c8c8c;
            font-size: 12px;
            margin-left: 4px;
          }
        }
      }
    }
  }
}

.template-save {
  display: flex;
  align-items: center;
  gap: 8px;
}

.template-manager {
  .no-templates {
    padding: 48px 0;
  }
  
  .templates-list {
    .template-item {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 16px;
      border: 1px solid #f0f0f0;
      border-radius: 8px;
      margin-bottom: 12px;
      
      .template-info {
        flex: 1;
        
        h4 {
          margin: 0 0 8px 0;
          font-size: 14px;
          font-weight: 500;
        }
        
        .template-meta {
          display: flex;
          gap: 16px;
          margin-bottom: 8px;
          font-size: 12px;
          color: #8c8c8c;
        }
        
        .template-config {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }
      }
      
      .template-actions {
        margin-left: 16px;
      }
    }
  }
}
</style>