<template>
  <div class="permission-form">
    <div class="form-header">
      <h3>{{ formData.permissionCategory === 'application' ? '应用权限申请' : '数据权限申请' }}</h3>
      <p class="sub">请填写申请主体、资源配置{{ formData.permissionCategory === 'data' ? '、操作类型' : '' }}与期限理由</p>
    </div>
    <a-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 16 }"
    >
      <!-- 单页表单，无申请资源摘要 -->

      <a-divider />
      <a-card class="section-card">
          <div class="section-title">申请主体</div>
          <a-form-item label="主体类型" name="subjectType">
            <a-radio-group v-model="formData.subjectType">
              <a-radio value="user">用户</a-radio>
              <a-radio value="group">虚拟组</a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item v-if="formData.subjectType === 'user'" label="选择用户" name="selectedUsers">
            <a-select v-model="formData.selectedUsers" multiple allow-search :options="userOptions" placeholder="搜索并选择用户" />
            <div class="section-actions">
              <span class="helper-text">支持搜索下拉多选用户</span>
            </div>
          </a-form-item>

          <a-form-item v-if="formData.subjectType === 'group'" label="选择虚拟组" name="selectedGroups">
            <a-select v-model="formData.selectedGroups" multiple allow-search :options="groupOptions" placeholder="搜索并选择虚拟组" />
            <div class="section-actions">
              <span class="helper-text">支持下拉或多选虚拟组</span>
            </div>
          </a-form-item>
      </a-card>
      <a-card class="section-card">
          <div class="section-title">资源选择</div>
          <a-form-item v-if="formData.permissionCategory === 'data'" :label="formData.permissionCategory === 'application' ? '权限层级选择' : '资源层级选择'" name="resourceLevel">
          <a-radio-group v-model="formData.resourceLevel">
            <a-radio value="database">{{ formData.permissionCategory === 'application' ? '应用级申请' : '库级申请' }}</a-radio>
            <a-radio value="table">{{ formData.permissionCategory === 'application' ? '模块级申请' : '表级申请' }}</a-radio>
          </a-radio-group>
        </a-form-item>

        <!-- 表申请：引擎选择 + 表名匹配 -->
        <template v-if="formData.permissionCategory === 'data' && formData.resourceLevel === 'table'">
          <a-form-item label="选择引擎" name="engineType">
            <a-radio-group v-model="formData.engineType">
              <a-radio value="inceptor">Inceptor</a-radio>
              <a-radio value="doris">Doris</a-radio>
            </a-radio-group>
          </a-form-item>

          <a-form-item label="表名匹配" name="tableNameInput">
            <a-textarea
              v-model="formData.tableNameInput"
              placeholder="请输入表名，支持多个表名用逗号、换行或空格分隔&#10;例如：user_info, order_detail&#10;或：&#10;user_info&#10;order_detail"
              :rows="4"
              allow-clear
            />
            <div class="helper-text" style="margin-top: 8px;">
              支持模糊匹配，输入表名后点击"查询匹配"按钮进行搜索
            </div>
          </a-form-item>

          <a-form-item :wrapper-col="{ offset: 6 }">
            <a-space>
              <a-button type="primary" @click="searchTables" :loading="tableSearchLoading">
                <template #icon><icon-search /></template>
                查询匹配
              </a-button>
              <a-button @click="clearTableSearch">清空</a-button>
            </a-space>
          </a-form-item>

          <!-- 匹配结果展示 -->
          <a-form-item v-if="tableSearchResults.length > 0" label="匹配结果">
            <div class="table-match-results">
              <a-table
                :data="tableSearchResults"
                :pagination="{ pageSize: 5 }"
                row-key="id"
              >
                <template #columns>
                  <a-table-column title="表名" data-index="name" />
                  <a-table-column title="数据库" data-index="database" />
                  <a-table-column title="类型" data-index="type" />
                  <a-table-column title="敏感级别" data-index="sensitivityLevel">
                    <template #cell="{ record }">
                      <a-tag :color="getSensitivityColor(record.sensitivityLevel)">
                        {{ record.sensitivityLevel }}
                      </a-tag>
                    </template>
                  </a-table-column>
                  <a-table-column title="操作" width="80">
                    <template #cell="{ record }">
                      <a-button
                        type="text"
                        size="small"
                        :disabled="isTableSelected(record)"
                        @click="addTableToSelection(record)"
                      >
                        {{ isTableSelected(record) ? '已添加' : '添加' }}
                      </a-button>
                    </template>
                  </a-table-column>
                </template>
              </a-table>
            </div>
          </a-form-item>

          <!-- 已选表展示 -->
          <a-form-item v-if="selectedTableList.length > 0" label="已选资源">
            <div class="selected-tables-section">
              <a-space wrap>
                <a-tag
                  v-for="table in selectedTableList"
                  :key="table.id"
                  closable
                  @close="removeTableFromSelection(table)"
                  color="blue"
                >
                  {{ table.database }}.{{ table.name }}
                </a-tag>
              </a-space>
              <div style="margin-top: 8px;">
                <a-button type="text" size="small" @click="clearAllSelectedTables">
                  清空全部
                </a-button>
              </div>
            </div>
          </a-form-item>

          <!-- 操作类型配置 -->
          <a-form-item label="操作类型">
            <a-radio-group v-model="formData.operationMode">
              <a-radio value="analysis">数据分析</a-radio>
              <a-radio value="dev">数据开发</a-radio>
              <a-radio value="ops">运维 / DBA</a-radio>
              <a-radio value="custom">自定义</a-radio>
            </a-radio-group>
            <!-- 权限详情展示 -->
            <div v-if="formData.operationMode !== 'custom'" style="margin-top:16px">
              <a-alert v-if="formData.operationMode === 'ops'" type="warning" show-icon>
                <template #title>运维/DBA权限已锁定</template>
                将赋予全部权限，包含 GRANT、ADMIN 等高危权限，请谨慎操作
              </a-alert>
              <template v-else>
                <div class="permission-detail-card">
                  <div class="permission-detail-header">
                    <span class="permission-detail-title">{{ getOperationModeTitle(formData.operationMode) }}</span>
                  </div>
                  <div class="permission-detail-content">
                    <div class="permission-tags">
                      <a-tag v-for="op in operationSummary" :key="op" color="blue">{{ op }}</a-tag>
                    </div>
                    <div class="permission-desc">{{ getOperationModeDesc(formData.operationMode) }}</div>
                  </div>
                </div>
              </template>
            </div>
          </a-form-item>

          <!-- 自定义权限 -->
          <template v-if="formData.operationMode === 'custom'">
            <a-form-item label="通用操作类型">
              <a-checkbox-group v-model="formData.operationTypes.generic">
                <a-checkbox value="SELECT">SELECT</a-checkbox>
                <a-checkbox value="DESCRIBE">DESCRIBE</a-checkbox>
                <a-checkbox value="INSERT">INSERT</a-checkbox>
                <a-checkbox value="UPDATE">UPDATE</a-checkbox>
                <a-checkbox value="DELETE">DELETE</a-checkbox>
                <a-checkbox value="ALTER">ALTER</a-checkbox>
                <a-checkbox value="DROP">DROP</a-checkbox>
                <a-checkbox value="CREATE">CREATE</a-checkbox>
              </a-checkbox-group>
            </a-form-item>
            <a-form-item label="数据库专属操作">
              <a-checkbox-group v-model="formData.operationTypes.specific">
                <a-checkbox v-for="op in dbSpecificOps" :key="op" :value="op">{{ op }}</a-checkbox>
              </a-checkbox-group>
            </a-form-item>
          </template>
        </template>

        <!-- 库申请：保持原有的树形选择 -->
        <template v-if="formData.permissionCategory !== 'data' || formData.resourceLevel !== 'table' || !formData.engineType">
        <a-form-item :label="formData.permissionCategory === 'application' ? '权限浏览与选择' : '资源浏览与选择'" name="resourceTree">
          <div class="resource-tree-section">
            <div class="tree-toolbar">
              <a-space>
                <a-input-search v-model="treeSearch" :placeholder="formData.permissionCategory === 'application' ? '模糊搜索应用 / 模块' : '模糊搜索库 / schema / 表'" allow-clear />
                <a-select v-model="statusFilter" :options="statusOptions" placeholder="筛选状态" style="width: 140px" />
                <a-button @click="expandAll">展开全部</a-button>
                <a-button @click="collapseAll">折叠全部</a-button>
              </a-space>
            </div>
            <a-spin :loading="treeLoading">
              <a-tree
                :data="treeDataFiltered"
                checkable
                :check-strictly="false"
                lazy
                :load-data="loadTreeNode"
                :virtual-list-props="{ height: 420 }"
                v-model:checked-keys="treeCheckedKeys"
                v-model:expanded-keys="treeExpandedKeys"
              />
            </a-spin>
            <div class="helper-text">
              {{ formData.permissionCategory === 'application' ? '支持模糊搜索与状态筛选。' : '库级：选择 schema 节点；表级：选择表节点。支持模糊搜索与状态筛选。' }}
            </div>
            <div class="global-selected-summary" v-if="formData.permissionCategory === 'application' || (formData.resourceLevel === 'database' && totalSelectedSchemas > 0) || (formData.resourceLevel === 'table' && totalSelectedTables > 0)">
              <template v-if="formData.permissionCategory === 'application'">
                <div v-if="formData.selectedDatabases.length > 0">
                  已选应用 {{ formData.selectedDatabases.length }} 个
                </div>
              </template>
              <template v-else>
                <div v-if="formData.resourceLevel === 'database'">
                  库 {{ formData.selectedDatabases.length }} 个；
                  schema {{ totalSelectedSchemas }}
                </div>
                <div v-else>
                  库 {{ formData.selectedDatabases.length }} 个；
                  表 {{ totalSelectedTables }} / 200
                </div>
              </template>
              <div class="section-actions">
                <a-button type="text" status="danger" @click="clearAllSelection">清空选择</a-button>
              </div>
            </div>
            <div class="selected-preview" v-if="formData.selectedDatabases.length || totalSelectedTables">
              <div class="section-title">已选资源预览</div>
              <a-collapse>
                <a-collapse-item v-for="db in formData.selectedDatabases" :key="db" :header="db">
                  <a-list size="small" :bordered="false">
                    <a-list-item v-for="sch in (formData.schemasByDb[db] || [])" v-if="formData.resourceLevel === 'database'" :key="db + ':schema:' + sch">
                      <a-space>
                        <a-tag color="blue">{{ formData.permissionCategory === 'application' ? '模块' : 'schema' }}</a-tag>
                        <span>{{ sch }}</span>
                      </a-space>
                    </a-list-item>
                    <a-list-item v-for="tid in (formData.tablesByDb[db] || [])" :key="db + ':' + tid">
                      <a-space>
                        <span>{{ getTableLabel(db, tid) }}</span>
                        <a-tag size="small">{{ dbTypeByName[db] }}</a-tag>
                        <a-button type="text" status="danger" @click="removeTable(db, tid)">移除</a-button>
                      </a-space>
                    </a-list-item>
                  </a-list>
                </a-collapse-item>
              </a-collapse>
            </div>
          </div>
        </a-form-item>
        <a-form-item v-if="formData.permissionCategory === 'data'" label="操作类型配置" name="operationTypes">
          <div class="ops-section">
            <div class="ops-title">选择模式</div>
            <a-radio-group v-model="formData.operationMode">
              <a-radio value="analysis">{{ formData.permissionCategory === 'application' ? '基础使用' : '数据分析' }}</a-radio>
              <a-radio value="dev">{{ formData.permissionCategory === 'application' ? '管理配置' : '数据开发' }}</a-radio>
              <a-radio value="ops">运维 / DBA</a-radio>
              <a-radio value="custom">自定义</a-radio>
            </a-radio-group>
            <div v-if="formData.operationMode !== 'custom'" style="margin-top:12px">
              <a-alert v-if="formData.operationMode === 'ops'" type="warning" show-icon>
                运维/DBA模板将赋予全部权限，自定义权限区将禁用
              </a-alert>
              <a-space wrap v-else>
                <a-tag v-for="op in operationSummary" :key="op">{{ op }}</a-tag>
              </a-space>
            </div>
            <template v-else>
              <!-- 运维/DBA模式：禁止修改权限 -->
              <div v-if="formData.operationMode === 'ops'" class="ops-disabled">
                <a-result status="warning" title="运维/DBA权限已锁定">
                  <template #subtitle>
                    当前权限模板已锁定所有权限，无需也无法修改
                  </template>
                </a-result>
              </div>
              <template v-else>
                <div class="ops-title">{{ formData.permissionCategory === 'application' ? '通用权限类型' : '通用操作类型' }}</div>
                <a-checkbox-group v-model:value="formData.operationTypes.generic">
                  <template v-if="formData.permissionCategory === 'application'">
                    <a-checkbox value="VIEW">查看</a-checkbox>
                    <a-checkbox value="USE">使用</a-checkbox>
                    <a-checkbox value="EDIT">编辑</a-checkbox>
                    <a-checkbox value="MANAGE">管理</a-checkbox>
                    <a-checkbox value="GRANT">授权</a-checkbox>
                  </template>
                  <template v-else>
                    <a-checkbox value="SELECT">SELECT</a-checkbox>
                    <a-checkbox value="DESCRIBE">DESCRIBE</a-checkbox>
                    <a-checkbox value="INSERT">INSERT</a-checkbox>
                    <a-checkbox value="UPDATE">UPDATE</a-checkbox>
                    <a-checkbox value="DELETE">DELETE</a-checkbox>
                    <a-checkbox value="ALTER">ALTER</a-checkbox>
                    <a-checkbox value="DROP">DROP</a-checkbox>
                    <a-checkbox value="CREATE">CREATE</a-checkbox>
                  </template>
                </a-checkbox-group>
                <div class="ops-title">{{ formData.permissionCategory === 'application' ? '应用专属权限' : '数据库专属操作' }}</div>
                <a-checkbox-group v-model:value="formData.operationTypes.specific">
                  <a-checkbox v-for="op in dbSpecificOps" :key="op" :value="op">{{ op }}</a-checkbox>
                </a-checkbox-group>
              </template>
            </template>
            <div v-if="isSensitiveOperation" class="sensitive-section">
              <a-checkbox v-model:checked="formData.sensitiveRequested">申请敏感权限</a-checkbox>
              <a-input v-if="formData.sensitiveRequested" v-model="formData.sensitiveReason" placeholder="填写敏感权限说明" style="margin-top:8px" />
            </div>
            <div class="helper-text">
              {{ formData.permissionCategory === 'application' ? '基础使用包含 查看 与 使用；管理配置包含 编辑 与 管理；自定义可自由勾选。' : '数据分析默认仅包含 SELECT 与 DESCRIBE；数据开发包含常用写入与DDL操作；自定义可自由勾选。' }}
            </div>
          </div>
        </a-form-item>
        </template>
        </a-card>

      <!-- 申请期限 -->
      <a-form-item label="申请期限" name="duration">
        <a-radio-group v-model="formData.duration">
          <a-radio value="permanent">永久</a-radio>
          <a-radio value="temporary">临时</a-radio>
        </a-radio-group>
      </a-form-item>

      <!-- 临时权限天数选择 -->
      <a-form-item
        v-if="formData.duration === 'temporary'"
        label="授权天数"
        name="tempDays"
      >
        <a-space direction="vertical">
          <a-radio-group v-model="tempDaysPreset">
            <a-radio value="30">30 天（1个月）</a-radio>
            <a-radio value="60">60 天（2个月）</a-radio>
            <a-radio value="180">180 天（半年）</a-radio>
            <a-radio value="custom">自定义</a-radio>
          </a-radio-group>
          <a-input-number
            v-if="tempDaysPreset === 'custom'"
            v-model="formData.customDays"
            :min="1"
            :max="365"
            placeholder="请输入天数"
            style="width: 150px; margin-top: 8px;"
          />
          <div v-if="formData.duration === 'temporary' && tempDaysPreset !== 'custom'" class="temp-hint">
            <icon-info-circle /> 临时权限最长不超过 1 年，到期后需重新申请
          </div>
        </a-space>
      </a-form-item>

      <!-- 申请理由 -->
      <a-form-item label="申请理由" name="reason">
        <div class="reason-section">
          <a-textarea
            v-model:value="formData.reason"
            placeholder="请详细说明申请权限的原因和用途..."
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

      <!-- 审批信息 -->
      <a-form-item v-if="formData.permissionCategory === 'data'" label="审批信息">
        <div class="approval-info">
          <div class="info-item">
            <span class="label">审批级别：</span>
            <span class="value">{{ getApprovalLevelDescription() }}</span>
          </div>
          <div class="info-item">
            <span class="label">预计审批时长：</span>
            <span class="value">{{ getEstimatedApprovalTime() }}</span>
          </div>
        </div>
      </a-form-item>

      <!-- 提交按钮 -->
      <a-form-item :wrapper-col="{ span: 16, offset: 6 }" class="form-actions">
        <a-space align="end">
          <a-button v-if="isBatchApplication" type="secondary" @click="openBatchModal">
            批量申请
          </a-button>
          <a-button type="primary" @click="handleSubmit" :loading="submitting">
            提交申请
          </a-button>
          <a-button @click="handleReset">
            重置
          </a-button>
          <a-button @click="handleSaveDraft">
            保存草稿
          </a-button>
        </a-space>
      </a-form-item>
      <a-modal v-model:visible="batchModalVisible" title="批量申请确认">
        <a-space direction="vertical" fill>
          <div>
            申请主体：
            <a-tag>{{ subjectTypeLabel }}</a-tag>
            <a-tag>{{ subjectCount }} 项</a-tag>
          </div>
          <div v-if="formData.resourceLevel === 'database'">
            资源（schema）：<a-tag>{{ totalSelectedSchemas }}</a-tag>
          </div>
          <div v-else>
            资源（表）：<a-tag>{{ totalSelectedTables }}</a-tag>
          </div>
          <div>
            操作模式：<a-tag>{{ operationModeLabel }}</a-tag>
          </div>
        </a-space>
        <template #footer>
          <a-space>
            <a-button @click="batchModalVisible = false">取消</a-button>
            <a-button type="primary" @click="confirmBatch">确认提交</a-button>
          </a-space>
        </template>
      </a-modal>
    </a-form>
  </div>
</template>

<script>
import { ref, reactive, computed, watch } from 'vue';
import { Message } from '@arco-design/web-vue';
import dayjs from 'dayjs';
import { IconInfoCircle } from '@arco-design/web-vue/es/icon';
import SensitivityLabel from './SensitivityLabel.vue';
import { 
  getApprovalLevel, 
  getApprovalLevelDescription as getApprovalLevelDescriptionFromUtils, 
  validateApplicationReason,
  getApplicationReasonTemplates,
  mapAppPermissionToDataPermission,
  mapDataPermissionToAppPermission 
} from '../utils';
import { PermissionType, DataPermissionType } from '../types';

import { MetadataStore } from '@/mock/shared/metadata-store';

  export default {
    name: 'PermissionForm',
  components: {
    SensitivityLabel
  },
  props: {
    selectedResources: {
      type: Array,
      default: () => []
    },
    submitting: {
      type: Boolean,
      default: false
    },
    defaultCategory: {
      type: String,
      default: 'application'
    }
  },
  emits: ['submit', 'reset', 'save-draft', 'select-resources'],
  setup(props, { emit }) {
    const formRef = ref();
    const batchModalVisible = ref(false);
    
    const formData = reactive({
      permissionCategory: 'application', // application | data
      permissionTypes: ['view'], // 应用权限或数据权限根据类别渲染
      duration: 'permanent',
      customDays: 30,
      reason: ''
    });
    formData.permissionCategory = (props.defaultCategory === 'data' ? 'data' : 'application');
    formData.subjectType = 'user';
    formData.selectedUsers = [];
    formData.selectedDepartments = [];
    formData.selectedGroups = [];
    formData.resourceLevel = 'database';
    formData.selectedDatabases = [];
    formData.includeFutureTables = false;
    formData.engineType = 'inceptor';
    formData.tableNameInput = '';
    formData.operationMode = 'analysis';
    formData.operationTypes = { generic: ['SELECT'], specific: [] };
    formData.tablesByDb = {};
    formData.schemasByDb = {};
    formData.sensitiveRequested = false;
    formData.sensitiveReason = '';
    formData.operationMode = 'analysis';
    formData.engineType = '';
    formData.tableNameInput = '';

    const tempDaysPreset = ref('30');

    const reasonTemplates = ref(getApplicationReasonTemplates());

    const hasSensitiveResource = computed(() => {
      return props.selectedResources.some(resource => 
        resource.sensitivityLevel === 'sensitive' || resource.sensitivityLevel === 'core'
      );
    });

    const approvalLevel = computed(() => {
      if (props.selectedResources.length === 0) return 1;
      
      const maxLevel = Math.max(...props.selectedResources.map(resource => {
        const level = getApprovalLevel(resource.sensitivityLevel, resource.type);
        return typeof level === 'number' ? level : 2; // DUAL 按2级处理
      }));
      
      return maxLevel;
    });

    const resourceTypes = computed(() => new Set(props.selectedResources.map(r => r.type)));
    const mappedDataPermissions = computed(() => {
      if (formData.permissionCategory === 'application') {
        const list = formData.permissionTypes.flatMap(p => mapAppPermissionToDataPermission(p));
        return Array.from(new Set(list));
      }
      return formData.permissionTypes;
    });
    const mappedAppPermission = computed(() => {
      if (formData.permissionCategory === 'data') {
        return mapDataPermissionToAppPermission(formData.permissionTypes);
      }
      return null;
    });
    const compatWarnings = computed(() => {
      const warns = [];
      const hasService = resourceTypes.value.has('service');
      const hasNonService = ['table','metric','variable','external_data','collection'].some(t => resourceTypes.value.has(t));
      if (hasService && formData.permissionCategory === 'data') {
        const invalid = formData.permissionTypes.some(p => [DataPermissionType.SELECT, DataPermissionType.UPDATE, DataPermissionType.INSERT, DataPermissionType.DELETE].includes(p));
        if (invalid) warns.push('服务资源建议仅申请 EXECUTE（调用）数据权限');
      }
      if (hasNonService && formData.permissionCategory === 'application') {
        if (formData.permissionTypes.includes(PermissionType.CALL)) {
          warns.push('非服务类资源通常不涉及“调用”应用权限');
        }
      }
      return warns;
    });
    const isSensitiveOperation = computed(() => {
      const ops = new Set([...(formData.operationTypes.generic || []), ...(formData.operationTypes.specific || [])].map(String));
      return ops.has('DELETE') || ops.has('ALTER') || ops.has('DROP');
    });
    const operationSummary = computed(() => {
      // 运维/DBA 模式显示全部权限
      if (formData.operationMode === 'ops') {
        if (formData.permissionCategory === 'application') {
          return ['VIEW', 'USE', 'EDIT', 'MANAGE', 'GRANT'];
        }
        return ['SELECT', 'DESCRIBE', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'ALTER', 'DROP', 'GRANT', 'ADMIN'];
      }
      return [...(formData.operationTypes.generic || []), ...(formData.operationTypes.specific || [])];
    });
    watch(() => formData.operationMode, (mode) => {
      if (formData.permissionCategory === 'application') {
        if (mode === 'analysis') {
          formData.operationTypes = { generic: ['VIEW', 'USE'], specific: [] };
        } else if (mode === 'dev') {
          formData.operationTypes = { generic: ['VIEW', 'USE', 'EDIT', 'MANAGE'], specific: [] };
        } else if (mode === 'ops') {
          formData.operationTypes = { generic: ['VIEW', 'USE', 'EDIT', 'MANAGE', 'GRANT'], specific: [] };
        }
      } else {
        if (mode === 'analysis') {
          formData.operationTypes = { generic: ['SELECT','DESCRIBE'], specific: [] };
        } else if (mode === 'dev') {
          formData.operationTypes = { generic: ['SELECT','DESCRIBE','INSERT','UPDATE','DELETE','CREATE','ALTER','DROP'], specific: dbSpecificOps.value };
        } else if (mode === 'ops') {
          // 运维/DBA：赋予全部权限
          formData.operationTypes = { 
            generic: ['SELECT','DESCRIBE','INSERT','UPDATE','DELETE','CREATE','ALTER','DROP','GRANT','ADMIN'], 
            specific: [] 
          };
        }
      }
    }, { immediate: true });
    const visibleGroups = ref([
      { id: 'group-analytics', name: '数据分析虚拟组' },
      { id: 'group-dev', name: '数据开发虚拟组' }
    ]);
    const userOptions = ref([
      { label: '张三 · 001 · 数据治理部', value: 'u_001' },
      { label: '李四 · 002 · 电商数据部', value: 'u_002' },
      { label: '王五 · 003 · 指标中心', value: 'u_003' }
    ]);
    const departmentOptions = ref([
      { label: '数据治理部', value: 'dept_data_governance' },
      { label: '电商数据部', value: 'dept_ecommerce_data' },
      { label: '指标中心', value: 'dept_metrics_center' }
    ]);
    const groupOptions = computed(() => visibleGroups.value.map(g => ({ label: g.name, value: g.id })));
    const dbCatalog = ref([
      { name: 'hive_sales', type: 'Hive' },
      { name: 'hive_dw', type: 'Hive' },
      { name: 'doris_ods', type: 'Doris' },
      { name: 'mysql_crm', type: 'MySQL' },
      { name: 'pg_fin', type: 'PostgreSQL' },
      { name: 'ck_events', type: 'ClickHouse' },
      { name: 'hive_marketing', type: 'Hive' },
      { name: 'mysql_erp', type: 'MySQL' },
      { name: 'pg_analytics', type: 'PostgreSQL' }
    ]);
    const availableDatabases = computed(() => dbCatalog.value.map(d => ({ value: d.name, label: d.name })));
    const dbTypeByName = computed(() => {
      const map = {};
      dbCatalog.value.forEach(d => { map[d.name] = d.type; });
      appCatalog.value.forEach(a => { map[a.name] = a.type; });
      return map;
    });
    
    const allMockTables = MetadataStore.getTables();
    const mockTables = {
      Hive: allMockTables.filter(t => t.type === 'Hive' || t.type === 'hive'),
      Doris: allMockTables.filter(t => t.type === 'Doris' || t.type === 'doris'),
      MySQL: allMockTables.filter(t => t.type === 'MySQL' || t.type === 'mysql'),
      PostgreSQL: allMockTables.filter(t => t.type === 'PostgreSQL' || t.type === 'postgresql'),
      ClickHouse: allMockTables.filter(t => t.type === 'ClickHouse' || t.type === 'clickhouse')
    };
    const getTablesOptions = (dbName) => {
      const type = dbTypeByName.value[dbName] || 'MySQL';
      const list = mockTables[type] || [];
      return list.map(t => ({ label: t.name, value: t.id, ...t }));
    };
    const treeSearch = ref('');
    const treeExpandedKeys = ref([]);
    const treeCheckedKeys = ref([]);
    const treeLoading = ref(false);
    const statusOptions = [
      { label: '已上线', value: 'online' },
      { label: '测试中', value: 'test' },
      { label: '废弃', value: 'discard' }
    ];
    const statusFilter = ref('online');
    const appCatalog = ref([
      { name: '统一查询平台', type: 'App' },
      { name: '指标管理系统', type: 'App' },
      { name: '数据地图', type: 'App' },
      { name: '大屏可视化', type: 'App' }
    ]);

    const mockModules = {
      App: [
        { id: 'm_query', name: 'SQL查询模块', sensitivityLevel: 'normal', owner: '平台组' },
        { id: 'm_save', name: '查询保存功能', sensitivityLevel: 'normal', owner: '平台组' },
        { id: 'm_export', name: '结果导出功能', sensitivityLevel: 'sensitive', owner: '安全组' },
        { id: 'm_admin', name: '管理后台', sensitivityLevel: 'core', owner: '管理员' }
      ]
    };

    const buildTreeData = computed(() => {
      if (formData.permissionCategory === 'application') {
        return appCatalog.value.map(app => {
          const modules = ['核心功能', '辅助功能', '系统管理'];
          return {
            key: `db:${app.name}`,
            title: app.name,
            status: 'online',
            children: modules.map(m => ({
              key: `db:${app.name}|schema:${m}`,
              title: m,
              status: 'online',
              children: (mockModules[app.type] || []).map(t => ({
                key: `db:${app.name}|schema:${m}|table:${t.id}`,
                title: t.name,
                status: t.sensitivityLevel === 'sensitive' ? 'test' : 'online',
                tmeta: { id: t.id, name: t.name, sensitivityLevel: t.sensitivityLevel, owner: t.owner, db: app.name, dbType: app.type, schema: m }
              }))
            }))
          };
        });
      }
      const schemasByType = {
        Hive: ['ods', 'dwd', 'dim'],
        Doris: ['ods', 'dwd'],
        MySQL: ['public'],
        PostgreSQL: ['public'],
        ClickHouse: ['default']
      };
      return dbCatalog.value.map(db => {
        const schemas = schemasByType[db.type] || ['default'];
        return {
          key: `db:${db.name}`,
          title: db.name,
          status: 'online',
          children: schemas.map(s => ({
            key: `db:${db.name}|schema:${s}`,
            title: s,
            status: 'online',
            children: (mockTables[db.type] || []).map(t => ({
              key: `db:${db.name}|schema:${s}|table:${t.id}`,
              title: t.name,
              status: t.sensitivityLevel === 'sensitive' ? 'test' : 'online',
              tmeta: { id: t.id, name: t.name, sensitivityLevel: t.sensitivityLevel, owner: t.owner, db: db.name, dbType: db.type, schema: s }
            }))
          }))
        };
      });
    });
    const filterTree = (nodes, q) => {
      if (!q) return nodes;
      const res = [];
      for (const n of nodes) {
        const match = String(n.title).toLowerCase().includes(q);
        const children = n.children ? filterTree(n.children, q) : [];
        if (match || children.length) {
          res.push({ ...n, children });
        }
      }
      return res;
    };
    const filterByStatus = (nodes, status) => {
      if (!status) return nodes;
      const res = [];
      for (const n of nodes) {
        const children = n.children ? filterByStatus(n.children, status) : [];
        const match = n.status === status;
        if (match || children.length) {
          res.push({ ...n, children });
        }
      }
      return res;
    };
    const treeDataFiltered = computed(() => {
      const q = treeSearch.value.trim().toLowerCase();
      const status = statusFilter.value;
      const byStatus = filterByStatus(buildTreeData.value, status);
      return filterTree(byStatus, q);
    });
    const expandAll = () => {
      const keys = [];
      const walk = (nodes) => nodes.forEach(n => { keys.push(n.key); if (n.children) walk(n.children); });
      walk(buildTreeData.value);
      treeExpandedKeys.value = keys;
    };
    const collapseAll = () => {
      treeExpandedKeys.value = [];
    };
    const loadTreeNode = async (nodeData) => {
      // mock 懒加载（当前使用本地数据，无需实际请求）
      treeLoading.value = true;
      await new Promise(r => setTimeout(r, 300));
      treeLoading.value = false;
      return [];
    };
    const dbSpecificOps = computed(() => {
      const selectedDbTypes = new Set(
        (formData.selectedDatabases || []).map(n => String(dbTypeByName.value[n] || '').toLowerCase())
      );
      const types = Array.from(selectedDbTypes);
      const set = new Set();
      if (types.includes('hive')) {
        set.add('LOAD');
        set.add('EXPORT');
      }
      if (types.includes('doris')) {
        set.add('LOAD DATA');
        set.add('CREATE VIEW');
      }
      return Array.from(set);
    });
    const syncSelectionFromTree = () => {
      const keys = new Set(treeCheckedKeys.value || []);
      const dbs = new Set();
      const tablesByDb = {};
      const schemasByDb = {};
      keys.forEach(k => {
        if (k.includes('|schema:') && !k.includes('|table:')) {
          const [dbPart, schemaPart] = k.split('|');
          const dbName = dbPart.replace('db:', '');
          const schemaName = schemaPart.replace('schema:', '');
          if (!schemasByDb[dbName]) schemasByDb[dbName] = [];
          if (!schemasByDb[dbName].includes(schemaName)) schemasByDb[dbName].push(schemaName);
          dbs.add(dbName);
        } else if (k.includes('|table:')) {
          const dbName = k.split('|')[0].replace('db:', '');
          const tableId = k.split('|table:')[1];
          if (!tablesByDb[dbName]) tablesByDb[dbName] = [];
          if (!tablesByDb[dbName].includes(tableId)) tablesByDb[dbName].push(tableId);
          dbs.add(dbName);
        }
      });
      const dbList = Array.from(dbs);
      formData.selectedDatabases = dbList;
      if (formData.permissionCategory === 'application') {
        formData.schemasByDb = schemasByDb;
        formData.tablesByDb = tablesByDb;
      } else if (formData.resourceLevel === 'database') {
        formData.schemasByDb = schemasByDb;
      } else {
        formData.tablesByDb = tablesByDb;
      }
    };
    watch(() => treeCheckedKeys.value, () => {
      syncSelectionFromTree();
    });
    watch(() => formData.resourceLevel, () => {
      syncSelectionFromTree();
    });
    const totalSelectedTables = computed(() => {
      return Object.values(formData.tablesByDb || {}).reduce((acc, arr) => acc + (arr?.length || 0), 0);
    });
    const totalSelectedSchemas = computed(() => {
      return Object.values(formData.schemasByDb || {}).reduce((acc, arr) => acc + (arr?.length || 0), 0);
    });
    const subjectCount = computed(() => {
      if (formData.subjectType === 'user') return (formData.selectedUsers || []).length;
      if (formData.subjectType === 'department') return (formData.selectedDepartments || []).length;
      if (formData.subjectType === 'group') return (formData.selectedGroups || []).length;
      return 0;
    });
    const isBatchApplication = computed(() => {
      let resourceCount = 0;
      if (formData.permissionCategory === 'application') {
        resourceCount = totalSelectedSchemas.value + totalSelectedTables.value;
      } else {
        resourceCount = formData.resourceLevel === 'database' ? totalSelectedSchemas.value : totalSelectedTables.value;
      }
      return subjectCount.value > 1 || resourceCount > 1;
    });
    const subjectTypeLabel = computed(() => {
  const map = { user: '用户', department: '部门', group: '虚拟组' }
  return map[formData.subjectType] || '主体'
})

const operationModeLabel = computed(() => {
  const map = {
    analysis: formData.permissionCategory === 'application' ? '基础使用' : '数据分析',
    dev: formData.permissionCategory === 'application' ? '管理配置' : '数据开发',
    custom: '自定义'
  }
  return map[formData.operationMode] || '自定义'
})

const openBatchModal = () => {
  batchModalVisible.value = true
}

const confirmBatch = async () => {
  batchModalVisible.value = false
  await handleSubmit()
}
    const clearAllSelection = () => {
      treeCheckedKeys.value = [];
      formData.selectedDatabases = [];
      formData.tablesByDb = {};
      formData.schemasByDb = {};
    };

    const rules = {
      permissionTypes: [
        { required: true, message: '请选择权限类型', trigger: 'change' }
      ],
      duration: [
        { required: true, message: '请选择申请期限', trigger: 'change' }
      ],
      reason: [
        { 
          required: true, 
          message: '请填写申请理由', 
          trigger: 'blur',
          validator: (rule, value) => {
            const validation = validateApplicationReason(value);
            if (!validation.valid) {
              return Promise.reject(validation.message);
            }
            return Promise.resolve();
          }
        }
      ]
    };

    const applyTemplate = (template) => {
      formData.reason = template.content;
      Message.success(`已应用模板：${template.name}`);
    };

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

    const getApprovalLevelDescription = () => {
      return getApprovalLevelDescriptionFromUtils(approvalLevel.value);
    };

    const getEstimatedApprovalTime = () => {
      const timeMap = {
        1: '1-2个工作日',
        2: '2-3个工作日',
        3: '3-5个工作日',
        dual: '2-3个工作日'
      };
      return timeMap[approvalLevel.value] || '1-2个工作日';
    };

    const handleSubmit = async () => {
      try {
        await formRef.value.validate();
        
        // 资源校验：表级需选择表；库级需选择数据库
        if (formData.permissionCategory === 'data') {
          // 表申请：引擎+表名匹配模式
          if (formData.resourceLevel === 'table' && formData.engineType) {
            if (selectedTableList.value.length === 0) {
              Message.warning('请至少添加一个表到已选资源');
              return;
            }
          }
          // 表申请：树形选择模式
          if (formData.resourceLevel === 'table' && !formData.engineType) {
            if (!formData.selectedDatabases || formData.selectedDatabases.length === 0) {
              Message.warning('请先选择至少一个数据库');
              return;
            }
            const totalTables = Object.values(formData.tablesByDb).reduce((acc, arr) => acc + (arr?.length || 0), 0);
            if (totalTables === 0) {
              Message.warning('请在所选数据库内至少选择一张数据表');
              return;
            }
            if (totalTables > 200) {
              Message.warning('单次最多选择200张数据表');
              return;
            }
          }
          // 库申请
          if (formData.resourceLevel === 'database') {
            const totalSchemas = Object.values(formData.schemasByDb).reduce((acc, arr) => acc + (arr?.length || 0), 0);
            if (totalSchemas === 0) {
              Message.warning('库级申请需选择至少一个 schema');
              return;
            }
          }
        }
        if (isSensitiveOperation.value) {
          if (!formData.sensitiveRequested) {
            Message.warning('请勾选“申请敏感权限”并填写说明');
            return;
          }
          if (!formData.sensitiveReason || formData.sensitiveReason.trim().length < 10) {
            Message.warning('敏感权限说明不少于10字');
            return;
          }
        }
        if (formData.permissionCategory === 'data') {
          if (formData.subjectType === 'user') {
            if (!formData.selectedUsers || formData.selectedUsers.length === 0) {
              Message.warning('请至少选择1个用户');
              return;
            }
            if (formData.selectedUsers.length > 100) {
              Message.warning('单次最多支持选择100个用户');
              return;
            }
          }
          if (formData.subjectType === 'group') {
            if (!formData.selectedGroups || formData.selectedGroups.length === 0) {
              Message.warning('请至少选择1个虚拟组');
              return;
            }
          }
          if (formData.duration === 'temporary') {
            const days = tempDaysPreset.value === 'custom' ? formData.customDays : parseInt(tempDaysPreset.value);
            if (!days || days <= 0) {
              Message.warning('请选择临时权限天数');
              return;
            }
            if (days > 365) {
              Message.warning('临时权限时长不超过1年（365天）');
              return;
            }
          }
        }
        // 应用权限申请验证
        if (formData.permissionCategory === 'application') {
          if (formData.subjectType === 'department') {
            Message.warning('应用权限申请不支持按部门授权');
            return;
          }
        }
        // 对于应用权限，验证必须选择至少一个应用
        if (formData.permissionCategory === 'application') {
          if (!formData.selectedDatabases || formData.selectedDatabases.length === 0) {
            Message.warning('请至少选择一个应用');
            return;
          }
        }

        // 计算映射权限
        const appPermissions = formData.permissionCategory === 'application' 
          ? formData.permissionTypes 
          : [mapDataPermissionToAppPermission(formData.permissionTypes)];
        const dataPermissions = formData.permissionCategory === 'data'
          ? formData.permissionTypes
          : formData.permissionTypes.flatMap(p => mapAppPermissionToDataPermission(p));

        // 树形选择的表
        const selectedTablesFromTree = Object.entries(formData.tablesByDb || {}).flatMap(([dbName, ids]) => {
          const opts = getTablesOptions(dbName);
          return (ids || []).map(id => {
            const found = opts.find(t => t.id === id || t.value === id);
            return {
              id: found?.id || id,
              name: found?.name || found?.label || id,
              database: dbName,
              databaseType: dbTypeByName.value[dbName],
              sensitivityLevel: found?.sensitivityLevel,
              owner: found?.owner
            };
          });
        });

        // 引擎+表名匹配选择的表
        const selectedTablesFromMatch = selectedTableList.value.map(table => ({
          id: table.id,
          name: table.name,
          database: table.database,
          databaseType: table.type,
          sensitivityLevel: table.sensitivityLevel,
          owner: table.owner
        }));

        // 合并两种方式的表
        const selectedTablesPayload = [...selectedTablesFromTree, ...selectedTablesFromMatch];

        const submitData = {
          resources: props.selectedResources,
          permissionCategory: formData.permissionCategory,
          permissionTypes: formData.permissionTypes,
          applicationPermissions: appPermissions,
          dataPermissions: Array.from(new Set(dataPermissions)),
          subjectType: formData.subjectType,
          subjects: formData.subjectType === 'user' ? formData.selectedUsers
            : formData.subjectType === 'department' ? formData.selectedDepartments
            : formData.selectedGroups,
          subjectDetail: {
            users: formData.selectedUsers,
            departments: formData.selectedDepartments,
            groups: formData.selectedGroups
          },
          resourceLevel: formData.resourceLevel,
          selectedDatabases: formData.selectedDatabases,
          selectedSchemas: Object.entries(formData.schemasByDb || {}).flatMap(([db, schemas]) => schemas.map(s => ({ database: db, schema: s }))),
          includeFutureTables: formData.includeFutureTables,
          selectedTables: selectedTablesPayload,
          operationTypes: formData.permissionCategory === 'data' ? {
            generic: formData.operationTypes.generic,
            specific: formData.operationTypes.specific
          } : undefined,
          sensitiveRequested: formData.sensitiveRequested,
          sensitiveReason: formData.sensitiveReason,
          duration: formData.duration,
          tempDays: formData.duration === 'temporary' 
            ? (tempDaysPreset.value === 'custom' ? formData.customDays : parseInt(tempDaysPreset.value))
            : null,
          reason: formData.reason.trim(),
          approvalLevel: approvalLevel.value
        };

        emit('submit', submitData);
      } catch (error) {
        console.error('表单验证失败:', error);
      }
    };

    const handleReset = () => {
      formRef.value.resetFields();
      formData.permissionTypes = ['view'];
      formData.duration = 'permanent';
      formData.customDays = 30;
      tempDaysPreset.value = '30';
      formData.reason = '';
      emit('reset');
    };

    const handleSaveDraft = () => {
      const draftData = {
        resources: props.selectedResources,
        permissionCategory: formData.permissionCategory,
        permissionTypes: formData.permissionTypes,
        duration: formData.duration,
        customDays: formData.customDays,
        reason: formData.reason
      };
      
      localStorage.setItem('permissionApplicationDraft', JSON.stringify(draftData));
      Message.success('草稿已保存');
      emit('save-draft', draftData);
    };

    // 加载草稿
    const loadDraft = () => {
      const draftStr = localStorage.getItem('permissionApplicationDraft');
      if (draftStr) {
        try {
          const draft = JSON.parse(draftStr);
          formData.permissionCategory = draft.permissionCategory || 'application';
          formData.permissionTypes = draft.permissionTypes || ['view'];
          formData.duration = draft.duration || 'permanent';
          formData.customDays = draft.customDays || 30;
          if (formData.duration === 'temporary') {
            const days = formData.customDays;
            if (days <= 30) tempDaysPreset.value = '30';
            else if (days <= 60) tempDaysPreset.value = '60';
            else if (days <= 180) tempDaysPreset.value = '180';
            else tempDaysPreset.value = 'custom';
          }
          formData.reason = draft.reason || '';
          return draft;
        } catch (error) {
          console.error('加载草稿失败:', error);
        }
      }
      return null;
    };

    // 监听资源变化，自动设置权限类型
    watch(() => props.selectedResources, (newResources) => {
      if (newResources.length > 0) {
        // 根据资源类型自动推荐权限类型
        const hasService = newResources.some(r => r.type === 'service');
        const hasExternalData = newResources.some(r => r.type === 'external_data');
        
        if (hasService && !formData.permissionTypes.includes('call')) {
          formData.permissionTypes = [...formData.permissionTypes, 'call'];
        }
        if (hasExternalData && !formData.permissionTypes.includes('subscribe')) {
          formData.permissionTypes = [...formData.permissionTypes, 'subscribe'];
        }
      }
    });
    // 监听默认类别变更
    watch(() => props.defaultCategory, (cat) => {
      formData.permissionCategory = (cat === 'data' ? 'data' : 'application');
      formData.permissionTypes = cat === 'data' ? [DataPermissionType.SELECT] : [PermissionType.VIEW];
    });

    // ========== 表申请相关逻辑 ==========
    const tableSearchLoading = ref(false);
    const tableSearchResults = ref([]);
    const selectedTableList = ref([]);

    // 模拟表数据
    const mockTableDatabase = [
      // Inceptor (Hive) tables
      { id: 'h1', name: 'user_info', database: 'hive_ods', type: 'Inceptor', sensitivityLevel: 'normal', owner: '数据平台组' },
      { id: 'h2', name: 'user_profile', database: 'hive_ods', type: 'Inceptor', sensitivityLevel: 'sensitive', owner: '数据平台组' },
      { id: 'h3', name: 'order_detail', database: 'hive_dwd', type: 'Inceptor', sensitivityLevel: 'sensitive', owner: '电商业务部' },
      { id: 'h4', name: 'order_summary', database: 'hive_dwd', type: 'Inceptor', sensitivityLevel: 'normal', owner: '电商业务部' },
      { id: 'h5', name: 'product_info', database: 'hive_ods', type: 'Inceptor', sensitivityLevel: 'normal', owner: '商品运营组' },
      { id: 'h6', name: 'product_category', database: 'hive_dim', type: 'Inceptor', sensitivityLevel: 'normal', owner: '商品运营组' },
      { id: 'h7', name: 'user_behavior_log', database: 'hive_dwd', type: 'Inceptor', sensitivityLevel: 'core', owner: '数据平台组' },
      { id: 'h8', name: 'click_stream', database: 'hive_dwd', type: 'Inceptor', sensitivityLevel: 'normal', owner: '数据平台组' },
      { id: 'h9', name: 'payment_transactions', database: 'hive_dwd', type: 'Inceptor', sensitivityLevel: 'core', owner: '财务部' },
      { id: 'h10', name: 'inventory_stock', database: 'hive_ods', type: 'Inceptor', sensitivityLevel: 'normal', owner: '供应链组' },
      { id: 'h11', name: 'warehouse_log', database: 'hive_dwd', type: 'Inceptor', sensitivityLevel: 'normal', owner: '供应链组' },
      { id: 'h12', name: 'customer_service_record', database: 'hive_dwd', type: 'Inceptor', sensitivityLevel: 'sensitive', owner: '客服部' },
      { id: 'h13', name: 'marketing_campaign', database: 'hive_dm', type: 'Inceptor', sensitivityLevel: 'normal', owner: '市场部' },
      { id: 'h14', name: 'ad_click_stats', database: 'hive_dm', type: 'Inceptor', sensitivityLevel: 'normal', owner: '市场部' },
      { id: 'h15', name: 'risk_control_log', database: 'hive_dwd', type: 'Inceptor', sensitivityLevel: 'core', owner: '风控部' },
      { id: 'h16', name: 'credit_score', database: 'hive_dim', type: 'Inceptor', sensitivityLevel: 'core', owner: '风控部' },
      { id: 'h17', name: 'driver_location', database: 'hive_dwd', type: 'Inceptor', sensitivityLevel: 'core', owner: '配送运营组' },
      { id: 'h18', name: 'delivery_order', database: 'hive_dwd', type: 'Inceptor', sensitivityLevel: 'sensitive', owner: '配送运营组' },
      { id: 'h19', name: 'employee_info', database: 'hive_dim', type: 'Inceptor', sensitivityLevel: 'sensitive', owner: '人力行政部' },
      { id: 'h20', name: 'salary_payout', database: 'hive_dwd', type: 'Inceptor', sensitivityLevel: 'core', owner: '人力行政部' },

      // Doris tables
      { id: 'd1', name: 'customerOverview', database: 'doris_ads', type: 'Doris', sensitivityLevel: 'normal', owner: '数据分析组' },
      { id: 'd2', name: 'salesDashboard', database: 'doris_ads', type: 'Doris', sensitivityLevel: 'normal', owner: '数据分析组' },
      { id: 'd3', name: 'realtimeOrderStat', database: 'doris_ads', type: 'Doris', sensitivityLevel: 'normal', owner: '运营中心' },
      { id: 'd4', name: 'inventoryAlert', database: 'doris_ads', type: 'Doris', sensitivityLevel: 'sensitive', owner: '供应链组' },
      { id: 'd5', name: 'userPortraitTag', database: 'doris_ads', type: 'Doris', sensitivityLevel: 'sensitive', owner: '数据产品组' },
      { id: 'd6', name: 'funnelConversion', database: 'doris_ads', type: 'Doris', sensitivityLevel: 'normal', owner: '数据产品组' },
      { id: 'd7', name: 'retentionCohort', database: 'doris_ads', type: 'Doris', sensitivityLevel: 'normal', owner: '数据产品组' },
      { id: 'd8', name: 'abTestResult', database: 'doris_ads', type: 'Doris', sensitivityLevel: 'normal', owner: '产品增长组' },
      { id: 'd9', name: 'dailyRevenue', database: 'doris_ads', type: 'Doris', sensitivityLevel: 'normal', owner: '财务部' },
      { id: 'd10', name: 'profitLossReport', database: 'doris_ads', type: 'Doris', sensitivityLevel: 'sensitive', owner: '财务部' },
      { id: 'd11', name: 'activeUserMetric', database: 'doris_ads', type: 'Doris', sensitivityLevel: 'normal', owner: '数据分析组' },
      { id: 'd12', name: 'gmvTrend', database: 'doris_ads', type: 'Doris', sensitivityLevel: 'normal', owner: '运营中心' },
      { id: 'd13', name: 'regionalSales', database: 'doris_ads', type: 'Doris', sensitivityLevel: 'normal', owner: '区域销售组' },
      { id: 'd14', name: 'customerChurnPrediction', database: 'doris_ads', type: 'Doris', sensitivityLevel: 'core', owner: '客户运营组' },
      { id: 'd15', name: 'creditRiskScore', database: 'doris_ads', type: 'Doris', sensitivityLevel: 'core', owner: '风控部' },
      { id: 'd16', name: 'loanApprovalStat', database: 'doris_ads', type: 'Doris', sensitivityLevel: 'core', owner: '风控部' },
      { id: 'd17', name: 'fraudDetectionLog', database: 'doris_ads', type: 'Doris', sensitivityLevel: 'core', owner: '风控部' },
      { id: 'd18', name: 'deviceFingerprint', database: 'doris_ads', type: 'Doris', sensitivityLevel: 'core', owner: '安全合规组' },
      { id: 'd19', name: 'loginAudit', database: 'doris_ads', type: 'Doris', sensitivityLevel: 'sensitive', owner: '安全合规组' },
      { id: 'd20', name: 'systemHealthCheck', database: 'doris_ads', type: 'Doris', sensitivityLevel: 'normal', owner: '技术运维组' },
    ];

    // 搜索表
    const searchTables = async () => {
      const input = formData.tableNameInput?.trim();
      if (!input) {
        Message.warning('请输入表名进行搜索');
        return;
      }
      if (!formData.engineType) {
        Message.warning('请先选择引擎类型');
        return;
      }

      tableSearchLoading.value = true;

      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 800));

      // 解析输入的表名（支持逗号、换行、空格分隔）
      const searchNames = input
        .split(/[,，\s\n]+/)
        .map(name => name.trim().toLowerCase())
        .filter(name => name.length > 0);

      // 过滤匹配的数据
      const results = mockTableDatabase.filter(table => {
        // 引擎类型匹配
        const engineMatch = table.type.toLowerCase() === formData.engineType.toLowerCase();
        // 表名模糊匹配
        const nameMatch = searchNames.some(searchName =>
          table.name.toLowerCase().includes(searchName) ||
          `${table.database}.${table.name}`.toLowerCase().includes(searchName)
        );
        return engineMatch && nameMatch;
      });

      tableSearchResults.value = results;
      tableSearchLoading.value = false;

      if (results.length === 0) {
        Message.info('未找到匹配的表，请检查表名或引擎类型');
      } else {
        Message.success(`找到 ${results.length} 个匹配的表`);
      }
    };

    // 清空搜索
    const clearTableSearch = () => {
      formData.tableNameInput = '';
      tableSearchResults.value = [];
    };

    // 添加表到已选
    const addTableToSelection = (table) => {
      if (!selectedTableList.value.find(t => t.id === table.id)) {
        selectedTableList.value.push(table);
        Message.success(`已添加：${table.database}.${table.name}`);
      }
    };

    // 从已选中移除表
    const removeTableFromSelection = (table) => {
      const index = selectedTableList.value.findIndex(t => t.id === table.id);
      if (index > -1) {
        selectedTableList.value.splice(index, 1);
      }
    };

    // 清空所有已选表
    const clearAllSelectedTables = () => {
      selectedTableList.value = [];
    };

    // 检查表是否已选中
    const isTableSelected = (table) => {
      return selectedTableList.value.some(t => t.id === table.id);
    };

    // 获取敏感级别颜色
    const getSensitivityColor = (level) => {
      const colorMap = {
        normal: 'green',
        sensitive: 'orange',
        core: 'red'
      };
      return colorMap[level] || 'default';
    };

    // 获取操作模式标题
    const getOperationModeTitle = (mode) => {
      const titles = {
        analysis: '数据分析权限',
        dev: '数据开发权限',
        ops: '运维/DBA权限'
      };
      return titles[mode] || '';
    };

    // 获取操作模式描述
    const getOperationModeDesc = (mode) => {
      const descs = {
        analysis: '适用于数据分析师，仅开放只读权限（SELECT, DESCRIBE），可申请追加 INSERT, LOAD',
        dev: '适用于数据开发人员，开放增删改查及表结构变更权限，不可申请高危权限',
        ops: '适用于运维/DBA，拥有全部权限，包含 GRANT、ADMIN 等高危操作权限'
      };
      return descs[mode] || '';
    };

    return {
      formRef,
      formData,
      rules,
      reasonTemplates,
      hasSensitiveResource,
      approvalLevel,
      PermissionType,
      DataPermissionType,
      tempDaysPreset,
      applyTemplate,
      getResourceTypeText,
      getApprovalLevelDescription,
      getEstimatedApprovalTime,
      mappedDataPermissions,
      mappedAppPermission,
      compatWarnings,
      visibleGroups,
      userOptions,
      departmentOptions,
      groupOptions,
      availableDatabases,
      treeDataFiltered,
      treeSearch,
      treeExpandedKeys,
      treeCheckedKeys,
      dbSpecificOps,
      clearAllSelection,
      handleSubmit,
      handleReset,
      loadDraft,
      isBatchApplication,
      subjectTypeLabel,
      operationModeLabel,
      openBatchModal,
      confirmBatch,
      // 表申请相关
      tableSearchLoading,
      tableSearchResults,
      selectedTableList,
      searchTables,
      clearTableSearch,
      addTableToSelection,
      removeTableFromSelection,
      clearAllSelectedTables,
      isTableSelected,
      getSensitivityColor,
      getOperationModeTitle,
      getOperationModeDesc,
      IconInfoCircle
    };
  }
};
</script>

<style lang="less" scoped>
.permission-form {
  padding: 24px;
  background: #fff;
  border-radius: 8px;
  min-height: 80vh;
}
.form-header {
  margin-bottom: 12px;
  h3 {
    margin: 0 0 4px 0;
    font-size: 18px;
    font-weight: 600;
  }
  .sub {
    margin: 0;
    color: #6b7280;
    font-size: 12px;
  }
}
.probe-input {
  width: 100%;
  max-width: 320px;
}
.section-card {
  margin-bottom: 16px;
}
.section-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
}
.section-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
}
.form-actions {
  text-align: right;
}
.db-table-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}
.db-table-item {
  border: 1px solid var(--subapp-border);
  border-radius: 8px;
  padding: 12px;
}
.db-name {
  margin-bottom: 8px;
  font-weight: 600;
}
.db-selected-summary {
  margin-top: 8px;
}
.global-selected-summary {
  margin-top: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.resource-tree-section {
  border: 1px solid var(--subapp-border);
  border-radius: 8px;
  padding: 12px;
}
.resource-panels {
  display: block;
}
.tree-panel {
  border: 1px solid #f5f5f5;
  border-radius: 8px;
  padding: 12px;
  background: #fff;
}
.tree-toolbar {
  margin-bottom: 12px;
}
.selected-preview {
  margin-top: 12px;
}
.sensitive-section {
  margin-top: 8px;
  padding: 8px;
  background: #fff7f7;
  border: 1px solid #ffccc7;
  border-radius: 6px;
}

.ops-disabled {
  padding: 16px;
  background: #fafafa;
  border-radius: 6px;
  text-align: center;
}

.permission-detail-card {
  background: #f7f8fa;
  border: 1px solid #e5e6e8;
  border-radius: 6px;
  padding: 16px;
}

.permission-detail-header {
  margin-bottom: 12px;
}

.permission-detail-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--subapp-text-primary);
}

.permission-tags {
  margin-bottom: 8px;
}

.permission-desc {
  font-size: 12px;
  color: var(--subapp-text-tertiary);
  line-height: 1.5;
}

.temp-hint {
  margin-top: 8px;
  color: var(--subapp-text-tertiary);
  font-size: 12px;
}

.selected-resources {
  .no-resources {
    text-align: center;
    padding: 20px;
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
  }
  
  .resources-list {
    .resources-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    
    .resources-content {
      .resource-item {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
        padding: 8px;
        background: #f5f5f5;
        border-radius: 4px;
        
        .resource-name {
          flex: 1;
          font-weight: 500;
        }
      }
      
      .more-resources {
        color: #8c8c8c;
        font-size: 12px;
        margin-top: 8px;
      }
    }
  }
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

.approval-info {
  padding: 12px;
  background: #f5f5f5;
  border-radius: 6px;

  .info-item {
    display: flex;
    margin-bottom: 8px;

    &:last-child {
      margin-bottom: 0;
    }

    .label {
      color: #595959;
      width: 100px;
      flex-shrink: 0;
    }

    .value {
      color: var(--subapp-text-primary);
      font-weight: 500;
    }
  }
}

/* 表申请样式 */
.table-match-results {
  border: 1px solid var(--subapp-border);
  border-radius: 8px;
  padding: 12px;
  background: #fafafa;
}

.selected-tables-section {
  border: 1px solid #e6f7ff;
  border-radius: 8px;
  padding: 12px;
  background: #f0f5ff;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .permission-form {
    padding: 12px;
  }

  .section-card {
    margin-bottom: 12px;
  }
}
</style>
