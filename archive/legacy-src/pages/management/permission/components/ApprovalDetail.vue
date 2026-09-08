<template>
  <div class="approval-detail">
    <a-spin :spinning="loading">
      <div class="detail-content">
        <!-- 申请信息 -->
        <div class="section">
          <h3>申请信息</h3>
          <a-descriptions :column="2" bordered>
            <a-descriptions-item label="申请编号">
              {{ application.applicationNumber }}
            </a-descriptions-item>
            <a-descriptions-item label="申请人">
              {{ application.applicantName }}
            </a-descriptions-item>
            <a-descriptions-item label="申请时间">
              {{ formatTime(application.createdAt) }}
            </a-descriptions-item>
            <a-descriptions-item label="申请状态">
              <StatusLabel :status="application.status" />
            </a-descriptions-item>
            <a-descriptions-item label="权限类型">
              <a-space>
                <a-tag v-for="(type, index) in application.permissionTypes" :key="index">
                  {{ getPermissionTypeText(type) }}
                </a-tag>
              </a-space>
            </a-descriptions-item>
            <a-descriptions-item label="申请期限">
              {{ getDurationText(application.duration) }}
            </a-descriptions-item>
            <a-descriptions-item label="审批级别" :span="2">
              {{ getApprovalLevelDescription(application.approvalLevel) }}
            </a-descriptions-item>
            <a-descriptions-item label="申请理由" :span="2">
              {{ application.reason }}
            </a-descriptions-item>
          </a-descriptions>
        </div>

        <!-- 资源详情 -->
        <div class="section">
          <h3>申请资源</h3>
          <div class="resources-grid">
            <div
              v-for="resource in application.resources"
              :key="resource.id"
              class="resource-card"
            >
              <div class="resource-header">
                <h4>{{ resource.name }}</h4>
                <SensitivityLabel :level="resource.sensitivityLevel" />
              </div>
              <div class="resource-info">
                <div class="info-item">
                  <span class="label">类型：</span>
                  <span class="value">{{ getResourceTypeText(resource.type) }}</span>
                </div>
                <div class="info-item">
                  <span class="label">数据库：</span>
                  <span class="value">{{ resource.databaseType || '-' }}</span>
                </div>
                <div class="info-item">
                  <span class="label">业务模块：</span>
                  <span class="value">{{ resource.businessModule || '-' }}</span>
                </div>
                <div class="info-item" v-if="resource.businessTerms && resource.businessTerms.length > 0">
                  <span class="label">业务术语：</span>
                  <span class="value">
                    <a-space>
                      <a-tag
                        v-for="term in resource.businessTerms"
                        :key="term"
                        size="small"
                      >
                        {{ term }}
                      </a-tag>
                    </a-space>
                  </span>
                </div>
              </div>
              <div class="resource-description" v-if="resource.description">
                {{ resource.description }}
              </div>
            </div>
          </div>
        </div>

        <!-- 血缘关系 -->
        <div class="section" v-if="lineageData.length > 0">
          <h3>血缘关系</h3>
          <div class="lineage-container">
            <a-tree
              :tree-data="lineageData"
              :field-names="{ children: 'children', title: 'name', key: 'id' }"
              default-expand-all
            >
              <template #title="{ name, type, sensitivityLevel }">
                <span class="tree-node">
                  <span class="node-name">{{ name }}</span>
                  <a-tag size="small" class="node-type">{{ getResourceTypeText(type) }}</a-tag>
                  <SensitivityLabel :level="sensitivityLevel" />
                </span>
              </template>
            </a-tree>
          </div>
        </div>

        <!-- 审批历史 -->
        <div class="section" v-if="application.approvalHistory && application.approvalHistory.length > 0">
          <h3>审批历史</h3>
          <a-timeline>
            <a-timeline-item
              v-for="(record, index) in application.approvalHistory"
              :key="record.id"
              :lineType="index === application.approvalHistory.length - 1 ? 'dashed' : 'solid'"
              :color="getTimelineColor(record.action)"
            >
              <div class="timeline-content">
                <div class="timeline-header">
                  <span class="approver">{{ record.approverName }}</span>
                  <span class="role">({{ record.approverRole }})</span>
                  <span class="action" :class="record.action">{{ getActionText(record.action) }}</span>
                  <span class="time">{{ formatTime(record.createdAt) }}</span>
                </div>
                <div class="timeline-comment" v-if="record.comment">
                  {{ record.comment }}
                </div>
              </div>
            </a-timeline-item>
          </a-timeline>
        </div>

        <!-- 审批操作 -->
        <div class="section" v-if="canApprove">
          <h3>审批操作</h3>
          <a-form
            ref="formRef"
            :model="approvalForm"
            :label-col="{ span: 4 }"
            :wrapper-col="{ span: 16 }"
          >
            <a-form-item label="审批意见" name="comment">
              <a-textarea
                v-model:value="approvalForm.comment"
                placeholder="请输入审批意见..."
                :rows="4"
                :max-length="500"
                show-count
              />
            </a-form-item>
            <a-form-item label="转发审批" name="forward">
              <a-checkbox v-model:checked="approvalForm.forward">
                需要转发给其他审批人
              </a-checkbox>
            </a-form-item>
            <a-form-item
              v-if="approvalForm.forward"
              label="转发给"
              name="forwardTo"
              :rules="[{ required: true, message: '请选择转发对象' }]"
            >
              <a-select
                v-model:value="approvalForm.forwardTo"
                placeholder="选择转发对象"
                style="width: 200px"
              >
                <a-select-option value="data_admin">数据管理员</a-select-option>
                <a-select-option value="business_owner">业务负责人</a-select-option>
                <a-select-option value="tech_owner">技术负责人</a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item :wrapper-col="{ span: 16, offset: 4 }">
              <a-space>
                <a-button
                  type="primary"
                  @click="handleApprove('approved')"
                  :loading="approving"
                >
                  通过
                </a-button>
                <a-button
                  danger
                  @click="handleApprove('rejected')"
                  :loading="approving"
                >
                  拒绝
                </a-button>
                <a-button @click="handleCancel">
                  取消
                </a-button>
              </a-space>
            </a-form-item>
          </a-form>
        </div>
      </div>
    </a-spin>
  </div>
</template>

<script>
import { ref, reactive } from 'vue';
import { Message, Modal } from '@arco-design/web-vue';
import SensitivityLabel from './SensitivityLabel.vue';
import StatusLabel from './StatusLabel.vue';
import { 
  getApprovalLevelDescription, 
  formatTimestamp,
  getPermissionTypeText,
  getResourceTypeText,
  getDurationText,
  getActionText 
} from '../utils';

export default {
  name: 'ApprovalDetail',
  components: {
    SensitivityLabel,
    StatusLabel
  },
  props: {
    application: {
      type: Object,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    },
    canApprove: {
      type: Boolean,
      default: false
    }
  },
  emits: ['approve', 'cancel'],
  setup(props, { emit }) {
    const formRef = ref();
    
    const approvalForm = reactive({
      comment: '',
      forward: false,
      forwardTo: undefined
    });

    const approving = ref(false);

    // 模拟血缘数据
    const lineageData = ref([
      {
        id: '1',
        name: '用户行为数据表',
        type: 'table',
        sensitivityLevel: 'normal',
        children: [
          {
            id: '1-1',
            name: '用户基础信息表',
            type: 'table',
            sensitivityLevel: 'sensitive',
            children: [
              {
                id: '1-1-1',
                name: '用户注册表',
                type: 'table',
                sensitivityLevel: 'core'
              }
            ]
          },
          {
            id: '1-2',
            name: '用户操作日志表',
            type: 'table',
            sensitivityLevel: 'normal'
          }
        ]
      }
    ]);

    const handleApprove = (action) => {
      Modal.confirm({
        title: `确认${action === 'approved' ? '通过' : '拒绝'}申请`,
        content: `确定要${action === 'approved' ? '通过' : '拒绝'}该权限申请吗？`,
        onOk: async () => {
          try {
            await formRef.value.validate();
            approving.value = true;
            
            // 模拟审批过程
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const approvalData = {
              action,
              comment: approvalForm.comment,
              forward: approvalForm.forward,
              forwardTo: approvalForm.forwardTo
            };
            
            emit('approve', approvalData);
            Message.success(`申请已${action === 'approved' ? '通过' : '拒绝'}`);
            
            // 重置表单
            approvalForm.comment = '';
            approvalForm.forward = false;
            approvalForm.forwardTo = undefined;
            
          } catch (error) {
            console.error('审批失败:', error);
            Message.error('审批失败，请重试');
          } finally {
            approving.value = false;
          }
        }
      });
    };

    const handleCancel = () => {
      emit('cancel');
    };

    const getTimelineColor = (action) => {
      const colors = {
        approved: 'green',
        rejected: 'red',
        processing: 'blue'
      };
      return colors[action] || 'gray';
    };

    return {
      formRef,
      approvalForm,
      approving,
      lineageData,
      handleApprove,
      handleCancel,
      getTimelineColor,
      formatTime: formatTimestamp,
      getApprovalLevelDescription,
      getPermissionTypeText,
      getResourceTypeText,
      getDurationText,
      getActionText
    };
  }
};
</script>

<style lang="less" scoped>
.approval-detail {
  padding: 24px;
  background: #fff;
  border-radius: 8px;
}

.detail-content {
  .section {
    margin-bottom: 32px;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    h3 {
      margin-bottom: 16px;
      font-size: 16px;
      font-weight: 500;
      color: #262626;
    }
  }
}

.resources-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.resource-card {
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 16px;
  
  .resource-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
    
    h4 {
      margin: 0;
      font-size: 14px;
      font-weight: 500;
    }
  }
  
  .resource-info {
    .info-item {
      display: flex;
      margin-bottom: 8px;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .label {
        color: #8c8c8c;
        width: 80px;
        flex-shrink: 0;
      }
      
      .value {
        color: #262626;
        flex: 1;
      }
    }
  }
  
  .resource-description {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #f0f0f0;
    color: #595959;
    font-size: 12px;
    line-height: 1.5;
  }
}

.lineage-container {
  padding: 16px;
  background: #f5f5f5;
  border-radius: 6px;
  
  .tree-node {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .node-name {
      font-weight: 500;
    }
    
    .node-type {
      font-size: 10px;
    }
  }
}

.timeline-content {
  .timeline-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    
    .approver {
      font-weight: 500;
      color: #262626;
    }
    
    .role {
      color: #8c8c8c;
      font-size: 12px;
    }
    
    .action {
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 12px;
      
      &.approved {
        background: #f6ffed;
        color: #52c41a;
        border: 1px solid #b7eb8f;
      }
      
      &.rejected {
        background: #fff1f0;
        color: #ff4d4f;
        border: 1px solid #ffa39e;
      }
      
      &.processing {
        background: #e6f7ff;
        color: #1890ff;
        border: 1px solid #91d5ff;
      }
    }
    
    .time {
      color: #8c8c8c;
      font-size: 12px;
      margin-left: auto;
    }
  }
  
  .timeline-comment {
    color: #595959;
    font-size: 12px;
    line-height: 1.5;
    padding: 8px;
    background: #fafafa;
    border-radius: 4px;
  }
}
</style>
