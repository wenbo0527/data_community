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
              <a-radio value="custom">自定义</a-radio>
            </a-radio-group>
            <div v-if="formData.operationMode !== 'custom'" style="margin-top:12px">
              <a-space wrap>
                <a-tag v-for="op in operationSummary" :key="op">{{ op }}</a-tag>
              </a-space>
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
            <div v-if="isSensitiveOperation" class="sensitive-section">
              <a-checkbox v-model:checked="formData.sensitiveRequested">申请敏感权限</a-checkbox>
              <a-input v-if="formData.sensitiveRequested" v-model="formData.sensitiveReason" placeholder="填写敏感权限说明" style="margin-top:8px" />
            </div>
            <div class="helper-text">
              {{ formData.permissionCategory === 'application' ? '基础使用包含 查看 与 使用；管理配置包含 编辑 与 管理；自定义可自由勾选。' : '数据分析默认仅包含 SELECT 与 DESCRIBE；数据开发包含常用写入与DDL操作；自定义可自由勾选。' }}
            </div>
          </div>
        </a-form-item>
      </a-card>

      <!-- 申请期限 -->
      <a-form-item label="申请期限" name="duration">
        <a-radio-group v-model="formData.duration">
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
        <a-space>
          <a-date-picker v-model:value="formData.startDate" format="YYYY-MM-DD" placeholder="开始日期" :disabled-date="disabledStartDate" />
          <a-date-picker v-model:value="formData.expireDate" format="YYYY-MM-DD" placeholder="结束日期" :disabled-date="disabledEndDate" />
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
      startDate: null,
      expireDate: null,
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
    formData.operationTypes = { generic: ['SELECT'], specific: [] };
    formData.tablesByDb = {};
    formData.schemasByDb = {};
    formData.sensitiveRequested = false;
    formData.sensitiveReason = '';
    formData.operationMode = 'analysis';

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
      return [...(formData.operationTypes.generic || []), ...(formData.operationTypes.specific || [])];
    });
    watch(() => formData.operationMode, (mode) => {
      if (formData.permissionCategory === 'application') {
        if (mode === 'analysis') {
          formData.operationTypes = { generic: ['VIEW', 'USE'], specific: [] };
        } else if (mode === 'dev') {
          formData.operationTypes = { generic: ['VIEW', 'USE', 'EDIT', 'MANAGE'], specific: [] };
        }
      } else {
        if (mode === 'analysis') {
          formData.operationTypes = { generic: ['SELECT','DESCRIBE'], specific: [] };
        } else if (mode === 'dev') {
          formData.operationTypes = { generic: ['SELECT','DESCRIBE','INSERT','UPDATE','DELETE','CREATE','ALTER','DROP'], specific: dbSpecificOps.value };
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
    const mockTables = {
      Hive: [
        { id: 'h_user', name: 'user_profile', sensitivityLevel: 'normal', owner: '数据平台' },
        { id: 'h_order', name: 'order_detail', sensitivityLevel: 'sensitive', owner: '电商数据' },
        { id: 'h_click', name: 'click_stream', sensitivityLevel: 'normal', owner: '埋点' },
        { id: 'h_dim_prod', name: 'dim_product', sensitivityLevel: 'normal', owner: '商品中心' }
      ],
      Doris: [
        { id: 'd_metric', name: 'metric_daily', sensitivityLevel: 'normal', owner: '指标团队' },
        { id: 'd_view', name: 'sales_view', sensitivityLevel: 'sensitive', owner: '销售分析' },
        { id: 'd_fact', name: 'fact_orders', sensitivityLevel: 'normal', owner: '电商数据' }
      ],
      MySQL: [
        { id: 'm_cust', name: 'customers', sensitivityLevel: 'core', owner: 'CRM' },
        { id: 'm_prod', name: 'products', sensitivityLevel: 'normal', owner: '商品中心' },
        { id: 'm_order', name: 'orders', sensitivityLevel: 'sensitive', owner: '电商数据' }
      ],
      PostgreSQL: [
        { id: 'p_fin', name: 'finance_tx', sensitivityLevel: 'sensitive', owner: '财务' },
        { id: 'p_geo', name: 'geo_points', sensitivityLevel: 'normal', owner: 'GIS' },
        { id: 'p_kpi', name: 'kpi_monthly', sensitivityLevel: 'normal', owner: '指标中心' }
      ],
      ClickHouse: [
        { id: 'c_event', name: 'events_stream', sensitivityLevel: 'normal', owner: '埋点' },
        { id: 'c_agg', name: 'agg_sessions', sensitivityLevel: 'sensitive', owner: '行为分析' },
        { id: 'c_visit', name: 'visit_logs', sensitivityLevel: 'normal', owner: '埋点' }
      ]
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
      expireDate: [
        { 
          required: true, 
          message: '请选择到期日期', 
          trigger: 'change',
          validator: (rule, value) => {
            if (formData.duration === 'temporary' && !value) {
              return Promise.reject('请选择到期日期');
            }
            return Promise.resolve();
          }
        }
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

    const disabledStartDate = (current) => {
      return current && current < dayjs().startOf('day');
    };
    const disabledEndDate = (current) => {
      if (!formData.startDate) return current && current < dayjs().startOf('day');
      const maxEnd = dayjs(formData.startDate).add(1, 'year').endOf('day');
      return current && (current < dayjs(formData.startDate).startOf('day') || current > maxEnd);
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
          if (formData.resourceLevel === 'table') {
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
            if (!formData.startDate || !formData.expireDate) {
              Message.warning('临时权限需选择起止时间');
              return;
            }
            const diff = dayjs(formData.expireDate).diff(dayjs(formData.startDate), 'day');
            if (diff < 0 || diff > 366) {
              Message.warning('临时权限时长不超过1年');
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

        const selectedTablesPayload = Object.entries(formData.tablesByDb || {}).flatMap(([dbName, ids]) => {
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
          startDate: formData.startDate ? dayjs(formData.startDate).format('YYYY-MM-DD') : null,
          expireDate: formData.expireDate ? dayjs(formData.expireDate).format('YYYY-MM-DD') : null,
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
      formData.expireDate = null;
      formData.reason = '';
      emit('reset');
    };

    const handleSaveDraft = () => {
      const draftData = {
        resources: props.selectedResources,
        permissionCategory: formData.permissionCategory,
        permissionTypes: formData.permissionTypes,
        duration: formData.duration,
        expireDate: formData.expireDate,
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
          formData.expireDate = draft.expireDate ? dayjs(draft.expireDate) : null;
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

    return {
      formRef,
      formData,
      rules,
      reasonTemplates,
      hasSensitiveResource,
      approvalLevel,
      PermissionType,
      DataPermissionType,
      disabledStartDate,
      disabledEndDate,
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
      confirmBatch
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
  border: 1px solid #f0f0f0;
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
  border: 1px solid #f0f0f0;
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
      color: #262626;
      font-weight: 500;
    }
  }
}
</style>
