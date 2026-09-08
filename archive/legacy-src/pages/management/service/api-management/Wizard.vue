<template>
  <div class="api-wizard-container">
    <!-- 顶部状态栏 -->
    <div class="api-header">
      <div class="header-left">
        <a-button type="text" @click="goBack" class="back-btn">
          <template #icon><IconLeft /></template>
        </a-button>
        <div class="api-title">
          <IconStorage class="title-icon" />
          <span class="title-text">向导式{{ form.dbType || 'mysql' }}</span>
          <IconEdit class="edit-icon" />
        </div>
        <div class="api-meta">
          <div class="meta-item">
            <span class="label">API ID:</span>
            <span class="value">{{ form.id || '-' }}</span>
            <IconCopy class="copy-icon" />
          </div>
          <div class="meta-item">
            <span class="label">数据源类型:</span>
            <span class="value"><IconApps /> MySQL</span>
          </div>
          <div class="meta-item">
            <span class="label">版本:</span>
            <a-select v-model="form.version" size="mini" :bordered="false" style="width: 60px">
              <a-option>V1</a-option>
              <a-option>V2</a-option>
            </a-select>
          </div>
          <div class="meta-item">
            <span class="label">状态:</span>
            <a-tag color="orange" size="small">测试环境</a-tag>
            <a-tag color="green" size="small">线上</a-tag>
          </div>
          <div class="meta-item">
            <span class="label">负责人:</span>
            <span class="value">admin</span>
          </div>
        </div>
      </div>
      <div class="header-right">
        <a-space>
          <a-dropdown-button type="primary" @click="saveApi">
            保存
            <template #content>
              <a-doption>保存并测试</a-doption>
              <a-doption>另存为</a-doption>
            </template>
          </a-dropdown-button>
          <a-button type="primary" status="success" @click="testApi">测试</a-button>
          <a-button type="primary" status="success" @click="publishApi">发布</a-button>
          <a-button type="text"><IconMoreVertical /></a-button>
        </a-space>
      </div>
    </div>

    <div class="api-content-wrapper">
      <!-- 主要内容区 -->
      <div class="api-main-content" ref="scrollContainer">
        <!-- 数据源选择 -->
        <section id="base-config" class="config-section">
          <div class="section-header">数据源选择</div>
          <div class="section-body">
            <a-form :model="form" layout="horizontal" :label-col-props="{ span: 4 }" :wrapper-col-props="{ span: 16 }">
              <a-form-item label="数据库" required>
                <a-select v-model="form.database" placeholder="请选择数据库" allow-clear @change="onDatabaseChange">
                  <a-option v-for="db in databases" :key="db" :value="db">{{ db }}</a-option>
                </a-select>
              </a-form-item>
              <a-form-item label="数据表" required>
                <a-select v-model="form.table" placeholder="请选择数据表" allow-clear @change="onTableChange">
                  <a-option v-for="t in filteredTables" :key="t.name" :value="t.name">{{ t.name }}</a-option>
                </a-select>
                <div class="item-tip">💡 向导式创建API，仅支持选择1张物理表</div>
              </a-form-item>
            </a-form>
          </div>
        </section>

        <!-- 参数设置 -->
        <section id="param-config" class="config-section">
          <div class="section-header">参数设置</div>
          <div class="section-body">
            <a-tabs v-model:active-key="activeTab" type="capsule" size="small">
              <a-tab-pane key="request" title="请求参数">
                <div class="param-toolbar">
                  <a-space>
                    <a-button type="primary" size="small" @click="addRequestParam">
                      <template #icon><IconPlus /></template>添加
                    </a-button>
                    <a-button type="outline" size="small" @click="batchAddRequest">
                      <template #icon><IconPlusCircle /></template>批量添加
                    </a-button>
                    <a-button type="text" size="small" @click="clearRequestParams">
                      <template #icon><IconDelete /></template>清空参数
                    </a-button>
                  </a-space>
                </div>

                <!-- 公共请求参数 -->
                <div v-if="form.advanced.enablePagination" class="common-params-info">
                  <div class="info-title">公共请求参数</div>
                  <a-descriptions :column="2" size="small" bordered>
                    <a-descriptions-item label="pageNum">当前页号 (Integer, 必填)</a-descriptions-item>
                    <a-descriptions-item label="pageSize">页面大小 (Integer, 必填)</a-descriptions-item>
                  </a-descriptions>
                </div>

                <a-table :data="form.requestParams" :pagination="false" size="small" :bordered="{ cell: true }">
                  <template #columns>
                    <a-table-column title="参数名称" data-index="name">
                      <template #cell="{ record }">
                        <a-input v-model="record.name" placeholder="id" size="small" />
                      </template>
                    </a-table-column>
                    <a-table-column title="绑定数据表字段" data-index="bindField">
                      <template #cell="{ record }">
                        <a-select v-model="record.bindField" placeholder="id" size="small" @change="syncParamType(record)">
                          <a-option v-for="f in currentTableFields" :key="f.name" :value="f.name">{{ f.name }}</a-option>
                        </a-select>
                      </template>
                    </a-table-column>
                    <a-table-column title="参数类型" data-index="type" :width="100">
                      <template #cell="{ record }">
                        <a-select v-model="record.type" size="small">
                          <a-option>int</a-option>
                          <a-option>varchar</a-option>
                          <a-option>datetime</a-option>
                          <a-option>decimal</a-option>
                        </a-select>
                      </template>
                    </a-table-column>
                    <a-table-column title="操作符" data-index="operator" :width="100">
                      <template #cell="{ record }">
                        <a-select v-model="record.operator" size="small">
                          <a-option value="=">等于</a-option>
                          <a-option value=">">大于</a-option>
                          <a-option value="<">小于</a-option>
                          <a-option value=">=">大于等于</a-option>
                          <a-option value="<=">小于等于</a-option>
                          <a-option value="LIKE">包含</a-option>
                          <a-option value="IN">在范围内</a-option>
                        </a-select>
                      </template>
                    </a-table-column>
                    <a-table-column title="是否必须" data-index="required" :width="80">
                      <template #cell="{ record }">
                        <a-checkbox v-model="record.required" />
                      </template>
                    </a-table-column>
                    <a-table-column title="示例值" data-index="example">
                      <template #cell="{ record }">
                        <a-input v-model="record.example" placeholder="请输入" size="small" />
                      </template>
                    </a-table-column>
                    <a-table-column title="缺省值" data-index="defaultValue">
                      <template #cell="{ record }">
                        <a-input v-model="record.defaultValue" placeholder="请输入" size="small" />
                      </template>
                    </a-table-column>
                    <a-table-column title="操作" :width="80" align="center">
                      <template #cell="{ rowIndex }">
                        <a-space>
                          <IconCopy class="action-icon" />
                          <IconDelete class="action-icon danger" @click="removeRequestParam(rowIndex)" />
                        </a-space>
                      </template>
                    </a-table-column>
                  </template>
                </a-table>
              </a-tab-pane>
              <a-tab-pane key="response" title="返回参数">
                <div class="param-toolbar">
                  <a-space>
                    <a-button type="primary" size="small" @click="addResponseParam">
                      <template #icon><IconPlus /></template>添加
                    </a-button>
                    <a-button type="outline" size="small" @click="batchAddResponse">
                      <template #icon><IconPlusCircle /></template>批量添加
                    </a-button>
                  </a-space>
                </div>

                <!-- 公共返回参数 -->
                <div v-if="form.advanced.enablePagination" class="common-params-info">
                  <div class="info-title">公共返回参数</div>
                  <a-descriptions :column="form.advanced.withTotal ? 3 : 2" size="small" bordered>
                    <a-descriptions-item label="pageNum">当前页号</a-descriptions-item>
                    <a-descriptions-item label="pageSize">页面大小</a-descriptions-item>
                    <a-descriptions-item v-if="form.advanced.withTotal" label="TotalCnt">总记录数</a-descriptions-item>
                  </a-descriptions>
                </div>

                <a-table :data="form.responseParams" :pagination="false" size="small" :bordered="{ cell: true }">
                  <template #columns>
                    <a-table-column title="参数名称" data-index="name">
                      <template #cell="{ record }">
                        <a-input v-model="record.name" placeholder="请输入" size="small" />
                      </template>
                    </a-table-column>
                    <a-table-column title="绑定数据表字段" data-index="bindField">
                      <template #cell="{ record }">
                        <a-select v-model="record.bindField" placeholder="选择字段" size="small" @change="syncRespType(record)">
                          <a-option v-for="f in currentTableFields" :key="f.name" :value="f.name">{{ f.name }}</a-option>
                        </a-select>
                      </template>
                    </a-table-column>
                    <a-table-column title="参数类型" data-index="type" :width="100">
                      <template #cell="{ record }">
                        <a-input v-model="record.type" disabled size="small" />
                      </template>
                    </a-table-column>
                    <a-table-column title="是否排序参数" :width="130">
                      <template #cell="{ record }">
                        <a-space>
                          <a-checkbox v-model="record.isSort" />
                          <a-select v-if="record.isSort" v-model="record.sortOrder" size="mini" style="width: 70px">
                            <a-option value="ASC">升序</a-option>
                            <a-option value="DESC">降序</a-option>
                          </a-select>
                        </a-space>
                      </template>
                    </a-table-column>
                    <a-table-column title="是否必选" :width="80" align="center">
                      <template #cell="{ record }">
                        <a-checkbox v-model="record.required" />
                      </template>
                    </a-table-column>
                    <a-table-column title="示例值">
                      <template #cell="{ record }">
                        <a-input v-model="record.example" placeholder="用于消费者理解" size="small" />
                      </template>
                    </a-table-column>
                    <a-table-column title="缺省值">
                      <template #cell="{ record }">
                        <a-input v-model="record.defaultValue" placeholder="默认返回内容" size="small" />
                      </template>
                    </a-table-column>
                    <a-table-column title="安全等级" :width="100">
                      <template #cell="{ record }">
                        <a-select v-model="record.securityLevel" size="small">
                          <a-option value="L1">L1-公开</a-option>
                          <a-option value="L2">L2-内部</a-option>
                          <a-option value="L3">L3-秘密</a-option>
                          <a-option value="L4">L4-机密</a-option>
                        </a-select>
                      </template>
                    </a-table-column>
                    <a-table-column title="参数描述">
                      <template #cell="{ record }">
                        <a-input v-model="record.description" placeholder="参数说明" size="small" />
                      </template>
                    </a-table-column>
                    <a-table-column title="操作" :width="80" align="center">
                      <template #cell="{ rowIndex }">
                        <a-space>
                          <IconCopy class="action-icon" @click="copyResponseParam(rowIndex)" />
                          <IconDelete class="action-icon danger" @click="removeResponseParam(rowIndex)" />
                        </a-space>
                      </template>
                    </a-table-column>
                  </template>
                </a-table>
              </a-tab-pane>
            </a-tabs>
          </div>
        </section>

        <!-- 高级配置 -->
        <section id="advanced-config" class="config-section">
          <a-collapse :default-active-key="['advanced']" :bordered="false">
            <a-collapse-item key="advanced" header="高级配置">
              <div class="advanced-form">
                <a-form :model="form.advanced" layout="horizontal" :label-col-props="{ span: 4 }" :wrapper-col-props="{ span: 16 }">
                  <a-form-item label="数据缓存时间">
                    <a-radio-group v-model="form.advanced.cacheStrategy" type="button" size="small">
                      <a-radio value="system">系统策略</a-radio>
                      <a-radio value="custom">自定义</a-radio>
                      <a-radio value="off">关闭</a-radio>
                    </a-radio-group>
                    <a-input-number v-if="form.advanced.cacheStrategy === 'custom'" v-model="form.advanced.cacheSeconds" size="small" style="width: 120px; margin-left: 12px" />
                  </a-form-item>
                  <a-form-item label="返回结果格式">
                    <a-radio-group v-model="form.advanced.returnFormat" size="small">
                      <a-radio value="JSON">JSON</a-radio>
                      <a-radio value="JSONCompact">JSONCompact</a-radio>
                    </a-radio-group>
                  </a-form-item>
                  <a-form-item label="开启分页">
                    <a-space size="large">
                      <a-switch v-model="form.advanced.enablePagination" size="small" />
                      <template v-if="form.advanced.enablePagination">
                        <span style="font-size: 13px; color: #4e5969">返回总记录数 (TotalCnt)</span>
                        <a-switch v-model="form.advanced.withTotal" size="small" />
                      </template>
                    </a-space>
                    <div v-if="form.advanced.enablePagination" class="item-tip" style="margin-top: 8px">
                      开启后将自动添加公共参数：pageNum, pageSize
                      <span v-if="form.advanced.withTotal">及 TotalCnt</span>
                    </div>
                  </a-form-item>
                </a-form>
              </div>
            </a-collapse-item>
          </a-collapse>
        </section>

        <!-- SQL预览 (底部可见) -->
        <section id="api-preview" class="config-section sql-preview-section">
          <div class="section-header">SQL预览</div>
          <div class="section-body">
            <div class="sql-code-wrapper">
              <pre><code>{{ sqlPreview || '请先配置参数...' }}</code></pre>
              <a-button type="text" size="small" class="copy-sql-btn" @click="generateSql">
                <template #icon><IconRefresh /></template>更新预览
              </a-button>
            </div>
          </div>
        </section>
      </div>

      <!-- 右侧导航栏 -->
      <div class="api-sidebar">
        <div 
          v-for="nav in navs" 
          :key="nav.id" 
          class="sidebar-item" 
          :class="{ active: activeNav === nav.id }"
          @click="scrollToSection(nav.id)"
        >
          {{ nav.label }}
        </div>
      </div>
    </div>

    <!-- API 测试抽屉 -->
    <a-drawer
      v-model:visible="testVisible"
      title="API 测试"
      width="800px"
      unmount-on-close
      :footer="false"
      class="api-test-drawer"
    >
      <div class="test-container">
        <!-- 顶部工具栏 -->
        <div class="test-toolbar">
          <a-space size="large">
            <a-checkbox v-model="testConfig.dryRun">dryRun (只返回 SQL 逻辑，不执行)</a-checkbox>
            <div class="param-format">
              <span class="label">请求参数格式：</span>
              <a-radio-group v-model="testConfig.paramFormat" type="button" size="small">
                <a-radio value="form">Form</a-radio>
                <a-radio value="json">JSON</a-radio>
              </a-radio-group>
            </div>
          </a-space>
        </div>

        <!-- 参数配置区 -->
        <div class="test-section">
          <div class="section-title">配置请求参数</div>
          <div v-if="testConfig.paramFormat === 'form'" class="test-form">
            <a-table :data="testParams" :pagination="false" size="small" :bordered="{ cell: true }">
              <template #columns>
                <a-table-column title="参数名称" data-index="name" :width="150" />
                <a-table-column title="参数值">
                  <template #cell="{ record }">
                    <a-input v-model="record.value" :placeholder="getParamPlaceholder(record)" size="small">
                      <template #append v-if="record.type === 'varchar'">
                        <a-checkbox v-model="record.isNull">null</a-checkbox>
                      </template>
                    </a-input>
                  </template>
                </a-table-column>
                <a-table-column title="参数类型" data-index="type" :width="100" />
                <a-table-column title="是否必选" :width="80" align="center">
                  <template #cell="{ record }">
                    <a-tag :color="record.required ? 'red' : 'gray'" size="small">
                      {{ record.required ? '是' : '否' }}
                    </a-tag>
                  </template>
                </a-table-column>
              </template>
            </a-table>
          </div>
          <div v-else class="test-json-editor">
            <a-textarea 
              v-model="testConfig.jsonParams" 
              :auto-size="{ minRows: 4, maxRows: 8 }" 
              placeholder='请输入 JSON 格式参数，例如: {"id": 1}'
            />
          </div>
        </div>

        <!-- 测试执行按钮 -->
        <div class="test-actions">
          <a-button type="primary" :loading="testing" @click="runApiTest">
            <template #icon><IconPlayArrow /></template>开始测试
          </a-button>
        </div>

        <!-- 测试结果区 -->
        <div v-if="testResult" class="test-result-section">
          <div class="result-status-bar">
            <a-space size="large">
              <div class="status-item">
                状态：<a-tag :color="testResult.success ? 'green' : 'red'">{{ testResult.success ? '成功' : '失败' }}</a-tag>
              </div>
              <div class="status-item">耗时：<span class="value">{{ testResult.duration }}ms</span></div>
              <div class="status-item">大小：<span class="value">{{ testResult.size }}</span></div>
            </a-space>
          </div>

          <a-tabs default-active-key="result" type="capsule" size="small">
            <a-tab-pane key="result" title="结果信息">
              <div class="result-toolbar">
                <a-radio-group v-model="resultViewMode" type="button" size="mini">
                  <a-radio value="table">表格</a-radio>
                  <a-radio value="json">JSON</a-radio>
                </a-radio-group>
                <a-space v-if="resultViewMode === 'table'">
                  <a-button size="mini"><template #icon><IconDownload /></template>导出 Excel</a-button>
                  <a-input-search size="mini" placeholder="搜索结果" style="width: 160px" />
                </a-space>
              </div>
              <div class="result-content">
                <template v-if="resultViewMode === 'table'">
                  <a-table 
                    :data="displayTableData" 
                    :columns="displayTableColumns"
                    size="small" 
                    :pagination="{ pageSize: 5 }" 
                  />
                </template>
                <pre v-else class="json-preview"><code>{{ JSON.stringify(testResult.data, null, 2) }}</code></pre>
              </div>
            </a-tab-pane>
            <a-tab-pane key="log" title="请求日志">
              <div class="log-content">
                <pre><code>{{ testResult.log }}</code></pre>
                <a-button type="text" size="mini" class="full-log-btn"><IconFullscreen /></a-button>
              </div>
            </a-tab-pane>
            <a-tab-pane key="body" title="请求参数体">
              <pre class="json-preview"><code>{{ JSON.stringify(testResult.requestBody, null, 2) }}</code></pre>
            </a-tab-pane>
          </a-tabs>

          <div class="result-footer">
            <a-button type="outline" size="small" @click="syncParamsToCallInfo">
              同步参数至调用信息
            </a-button>
          </div>
        </div>
      </div>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import {
  IconLeft, IconStorage, IconEdit, IconCopy, IconApps, IconMoreVertical,
  IconPlus, IconPlusCircle, IconDelete, IconRefresh, IconPlayArrow,
  IconDownload, IconFullscreen
} from '@arco-design/web-vue/es/icon'

interface TableField { name: string; type: string; comment?: string }
interface LogicalTable { name: string; database: string; fields: TableField[]; primaryKey?: string }
interface RequestParam { name: string; bindField: string; type: string; operator: string; example?: string | number; defaultValue?: string | number; required: boolean }
interface ResponseParam { 
  name: string;          // 参数名称
  bindField: string;     // 绑定逻辑表字段
  type: string;          // 参数类型
  isSort: boolean;       // 是否排序参数
  sortOrder: 'ASC' | 'DESC'; // 排序方式
  required: boolean;     // 是否必选
  example: string;       // 示例值
  defaultValue: string;  // 缺省值
  securityLevel: string; // 安全等级
  description: string;   // 参数描述
}
interface AdvancedConfig { returnFormat: 'JSON' | 'JSONCompact'; cacheStrategy: 'system' | 'custom' | 'off'; cacheSeconds?: number; enablePagination: boolean; withTotal: boolean }
interface ApiForm { id?: number | string; name: string; database: string; table: string; dbType: string; version: string; requestParams: RequestParam[]; responseParams: ResponseParam[]; advanced: AdvancedConfig }

const router = useRouter()
const route = useRoute()

// 状态定义
const isEdit = computed(() => !!route.params.id)
const apiId = computed(() => route.params.id as string)

const activeTab = ref('request')
const sqlPreview = ref('')
const STORAGE_KEY = 'api.management.list'
const scrollContainer = ref<HTMLElement | null>(null)
const activeNav = ref('base-config')

// 测试相关状态
const testVisible = ref(false)
const testing = ref(false)
const resultViewMode = ref('table')
const testConfig = reactive({
  dryRun: false,
  paramFormat: 'form' as 'form' | 'json',
  jsonParams: '{}'
})
const testParams = ref<any[]>([])
const testResult = ref<any>(null)

// 适配不同格式的表格数据展示
const displayTableData = computed(() => {
  if (!testResult.value || !testResult.value.data) return []
  if (form.advanced.returnFormat === 'JSONCompact') {
    const { columns, data } = testResult.value.data
    return data.map((row: any[]) => {
      const obj: any = {}
      columns.forEach((col: string, index: number) => {
        obj[col] = row[index]
      })
      return obj
    })
  }
  return testResult.value.data
})

const displayTableColumns = computed(() => {
  if (!testResult.value || !testResult.value.data) return []
  let columns: string[] = []
  if (form.advanced.returnFormat === 'JSONCompact') {
    columns = testResult.value.data.columns
  } else if (testResult.value.data.length > 0) {
    columns = Object.keys(testResult.value.data[0])
  }
  return columns.map(col => ({ title: col, dataIndex: col }))
})

const navs = [
  { id: 'base-config', label: '基本配置' },
  { id: 'param-config', label: '参数设置' },
  { id: 'advanced-config', label: '高级配置' },
  { id: 'api-preview', label: 'API预览' }
]

const scrollToSection = (id: string) => {
  activeNav.value = id
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

const databases = ['db_order', 'db_user', 'db_inventory']
const allTables = ref<LogicalTable[]>([
  {
    database: 'db_user',
    name: 'user_config',
    primaryKey: 'id',
    fields: [
      { name: 'id', type: 'int', comment: '主键ID' },
      { name: 'user_id', type: 'varchar', comment: '用户ID' },
      { name: 'config_key', type: 'varchar', comment: '配置键' },
      { name: 'config_value', type: 'varchar', comment: '配置值' },
      { name: 'status', type: 'int', comment: '状态' },
      { name: 'update_time', type: 'timestamp', comment: '更新时间' }
    ]
  },
  {
    database: 'db_order',
    name: 'order_detail',
    primaryKey: 'order_id',
    fields: [
      { name: 'order_id', type: 'varchar', comment: '订单ID' },
      { name: 'user_id', type: 'varchar', comment: '用户ID' },
      { name: 'amount', type: 'decimal', comment: '订单金额' },
      { name: 'pay_status', type: 'int', comment: '支付状态' },
      { name: 'create_time', type: 'timestamp', comment: '创建时间' }
    ]
  }
])

const form = reactive<ApiForm>({
  id: undefined,
  name: '',
  database: 'db_user',
  table: '',
  dbType: 'MySQL',
  version: 'V1',
  requestParams: [],
  responseParams: [],
  advanced: { returnFormat: 'JSON', cacheStrategy: 'system', cacheSeconds: 600, enablePagination: false, withTotal: false }
})

const filteredTables = computed(() => {
  return allTables.value.filter((t: LogicalTable) => t.database === form.database)
})

const currentTable = computed(() => {
  return allTables.value.find((t: LogicalTable) => t.database === form.database && t.name === form.table)
})

const currentTableFields = computed(() => {
  return currentTable.value?.fields || []
})

const goBack = () => router.push('/home/management/service/api-management')

const onDatabaseChange = () => {
  form.table = ''
  form.requestParams = []
  form.responseParams = []
}

const onTableChange = () => {
  form.requestParams = []
  form.responseParams = []
}

const addRequestParam = () => {
  form.requestParams.push({ name: '', bindField: '', type: 'varchar', operator: '=', required: false })
}

const removeRequestParam = (index: number) => {
  form.requestParams.splice(index, 1)
}

const clearRequestParams = () => {
  form.requestParams = []
}

const batchAddRequest = () => {
  if (!currentTable.value) {
    Message.warning('请先选择数据表')
    return
  }
  const remaining = currentTable.value.fields.filter((f: TableField) => !form.requestParams.some((p: RequestParam) => p.bindField === f.name))
  for (const f of remaining) {
    form.requestParams.push({ name: f.name, bindField: f.name, type: f.type, operator: '=', required: false })
  }
}

const syncParamType = (record: RequestParam) => {
  const f = currentTableFields.value.find((x: TableField) => x.name === record.bindField)
  if (f) {
    record.type = f.type
    if (!record.name) record.name = f.name
  }
}

const addResponseParam = () => {
  form.responseParams.push({
    name: '',
    bindField: '',
    type: 'varchar',
    isSort: false,
    sortOrder: 'ASC',
    required: false,
    example: '',
    defaultValue: '',
    securityLevel: 'L1',
    description: ''
  })
}

const removeResponseParam = (index: number) => {
  form.responseParams.splice(index, 1)
}

const copyResponseParam = (index: number) => {
  const param = form.responseParams[index]
  form.responseParams.splice(index + 1, 0, { ...param })
}

const batchAddResponse = () => {
  if (!currentTable.value) {
    Message.warning('请先选择数据表')
    return
  }
  const remaining = currentTable.value.fields.filter((f: TableField) => !form.responseParams.some((p: ResponseParam) => p.bindField === f.name))
  for (const f of remaining) {
    form.responseParams.push({
      name: f.name,
      bindField: f.name,
      type: f.type,
      isSort: false,
      sortOrder: 'ASC',
      required: false,
      example: '',
      defaultValue: '',
      securityLevel: 'L1',
      description: f.comment || ''
    })
  }
}

const syncRespType = (record: ResponseParam) => {
  const f = currentTableFields.value.find((x: TableField) => x.name === record.bindField)
  if (f) {
    record.type = f.type
    if (!record.name) record.name = f.name
    if (!record.description) record.description = f.comment || ''
  }
}

const generateSql = () => {
  if (!form.table) {
    sqlPreview.value = ''
    return ''
  }
  const select = form.responseParams.length
    ? form.responseParams.map((r: ResponseParam) => r.name !== r.bindField ? `${r.bindField} AS ${r.name}` : r.bindField).join(', ')
    : '*'
  
  const where = form.requestParams.length
    ? ' WHERE ' + form.requestParams.map((p: RequestParam) => `${p.bindField} ${p.operator} :${p.name}`).join(' AND ')
    : ''
  
  const orderByParams = form.responseParams.filter((p: ResponseParam) => p.isSort)
  const orderBy = orderByParams.length
      ? '\nORDER BY ' + orderByParams.map((p: ResponseParam) => `${p.name} ${p.sortOrder}`).join(', ')
      : ''
  
   let limit = ''
   if (form.advanced.enablePagination) {
     limit = `\nLIMIT :pageSize OFFSET (:pageNum - 1) * :pageSize`
   }

   if (form.advanced.enablePagination && form.advanced.withTotal) {
     const totalSql = `SELECT COUNT(*) AS TotalCnt FROM ${form.table}${where};`
     sqlPreview.value = `-- Total Count Query\n${totalSql}\n\n-- Data Query\nSELECT ${select}\nFROM ${form.table}${where}${orderBy}${limit}`
     return sqlPreview.value
   }

   const sql = `SELECT ${select}\nFROM ${form.table}${where}${orderBy}${limit}`
   sqlPreview.value = sql
   return sql
 }

watch(() => [form.table, form.requestParams, form.responseParams, form.advanced], () => {
  generateSql()
}, { deep: true })

const loadApiDetail = () => {
  if (!isEdit.value) return
  
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const list = raw ? JSON.parse(raw) : []
    const detail = list.find((item: any) => String(item.id) === apiId.value)
    
    if (detail) {
      Object.assign(form, detail)
      // 触发 SQL 生成预览
      nextTick(() => {
        generateSql()
      })
    } else {
      Message.error('未找到 API 详情')
      router.back()
    }
  } catch (e) {
    Message.error('加载详情失败')
  }
}

const saveApi = () => {
  if (!form.name || !form.table) {
    Message.warning('请完善基本配置')
    return
  }
  
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const list = raw ? JSON.parse(raw) : []
    
    const apiData = {
      ...form,
      id: isEdit.value ? apiId.value : `api_${Date.now()}`,
      sql: sqlPreview.value,
      updateTime: new Date().toISOString()
    }
    
    if (isEdit.value) {
      const index = list.findIndex((item: any) => String(item.id) === apiId.value)
      if (index > -1) {
        list[index] = apiData
      }
    } else {
      list.push(apiData)
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
    Message.success('保存成功')
    router.push('/home/management/service/api-management')
  } catch (e) {
    Message.error('保存失败')
  }
}

const testApi = () => {
  if (!generateSql()) {
    Message.warning('请先配置API')
    return
  }
  
  // 初始化测试参数
  testParams.value = form.requestParams.map((p: RequestParam) => ({
    name: p.name,
    type: p.type,
    required: p.required,
    value: p.example || '',
    isNull: false
  }))
  
  // 如果开启分页，添加公共分页参数
  if (form.advanced.enablePagination) {
    testParams.value.push(
      { name: 'pageNum', type: 'int', required: true, value: 1 },
      { name: 'pageSize', type: 'int', required: true, value: 10 }
    )
  }
  
  testVisible.value = true
}

const getParamPlaceholder = (record: any) => {
  if (record.type === 'int') return '请输入数字'
  if (record.type === 'boolean') return 'true/false'
  return '请输入内容'
}

const runApiTest = () => {
  testing.value = true
  
  // 模拟 API 请求过程
  setTimeout(() => {
    const requestData: any = {}
    if (testConfig.paramFormat === 'form') {
      testParams.value.forEach((p: any) => {
        requestData[p.name] = p.isNull ? null : p.value
      })
    } else {
      try {
        Object.assign(requestData, JSON.parse(testConfig.jsonParams))
      } catch (e) {
        Message.error('JSON 格式错误')
        testing.value = false
        return
      }
    }

    // 模拟不同格式的数据
    let mockData: any = []
    const rawData = [
      { id: 1, name: '测试数据 1', status: 1, update_time: '2023-10-01' },
      { id: 2, name: '测试数据 2', status: 0, update_time: '2023-10-02' }
    ]

    if (form.advanced.returnFormat === 'JSONCompact') {
      mockData = {
        columns: ['id', 'name', 'status', 'update_time'],
        data: rawData.map(item => [item.id, item.name, item.status, item.update_time])
      }
    } else {
      mockData = rawData
    }

    testResult.value = {
      success: true,
      duration: Math.floor(Math.random() * 500) + 50,
      size: '1.2KB',
      data: testConfig.dryRun ? (form.advanced.returnFormat === 'JSONCompact' ? { columns: [], data: [] } : []) : mockData,
      log: testConfig.dryRun 
        ? `-- dryRun mode (${form.advanced.returnFormat})\n${sqlPreview.value}` 
        : `[INFO] Executing SQL...\n[DEBUG] Format: ${form.advanced.returnFormat}\n[DEBUG] Params: ${JSON.stringify(requestData)}\n[SUCCESS] Query completed.`,
      requestBody: requestData
    }
    
    testing.value = false
    Message.success('测试完成')
  }, 800)
}

const syncParamsToCallInfo = () => {
  // 模拟同步逻辑
  Message.success('已将当前测试参数同步至 API 调用示例')
}

const publishApi = () => {
  saveApi()
}

onMounted(() => {
  loadApiDetail()
})
</script>

<style scoped>
.api-wizard-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f2f3f5;
}

/* 顶部状态栏 */
.api-header {
  height: 56px;
  background: #fff;
  border-bottom: 1px solid #e5e6eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.api-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  font-size: 16px;
  color: #1d2129;
}

.title-icon { color: #165dff; }
.edit-icon { color: #86909c; cursor: pointer; font-size: 14px; }

.api-meta {
  display: flex;
  align-items: center;
  gap: 24px;
  font-size: 12px;
  color: #86909c;
  margin-left: 24px;
  border-left: 1px solid #e5e6eb;
  padding-left: 24px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.copy-icon { cursor: pointer; margin-left: 2px; }

/* 内容布局 */
.api-content-wrapper {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.api-main-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 配置卡片 */
.config-section {
  background: #fff;
  border-radius: 4px;
  border: 1px solid #e5e6eb;
}

.section-header {
  padding: 12px 16px;
  font-weight: 500;
  font-size: 14px;
  color: #1d2129;
  border-bottom: 1px solid #f2f3f5;
  background-color: #fafafa;
}

.section-body {
  padding: 16px;
}

.common-params-info {
  margin-bottom: 16px;
  padding: 12px;
  background-color: #f7f8fa;
  border-radius: 4px;
}

.info-title {
  font-size: 13px;
  font-weight: 500;
  color: #1d2129;
  margin-bottom: 8px;
}

.item-tip {
  font-size: 12px;
  color: #ffb400;
  margin-top: 4px;
}

.param-toolbar {
  margin-bottom: 12px;
}

.action-icon {
  cursor: pointer;
  font-size: 16px;
  color: #4e5969;
}

.action-icon.danger:hover { color: #f53f3f; }

/* 测试抽屉样式 */
.test-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.test-toolbar {
  padding-bottom: 16px;
  border-bottom: 1px solid #f2f3f5;
}

.param-format {
  display: flex;
  align-items: center;
  gap: 8px;
}

.test-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-title {
  font-weight: 500;
  font-size: 14px;
  color: #1d2129;
}

.test-actions {
  display: flex;
  justify-content: center;
  padding: 16px 0;
}

.test-result-section {
  border-top: 1px solid #f2f3f5;
  padding-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.result-status-bar {
  background-color: #f7f8fa;
  padding: 12px 16px;
  border-radius: 4px;
  font-size: 13px;
}

.result-status-bar .value {
  color: #1d2129;
  font-weight: 500;
}

.result-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.result-content {
  min-height: 200px;
  border: 1px solid #e5e6eb;
  border-radius: 4px;
}

.json-preview, .log-content {
  margin: 0;
  padding: 12px;
  background-color: #f8f9fa;
  font-family: monospace;
  font-size: 12px;
  overflow: auto;
  max-height: 400px;
}

.log-content {
  position: relative;
}

.full-log-btn {
  position: absolute;
  top: 8px;
  right: 8px;
}

.result-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: 16px;
}

:deep(.api-test-drawer .arco-drawer-body) {
  padding: 20px 24px;
}

.advanced-form {
  padding: 8px 0;
}

/* SQL预览 */
.sql-code-wrapper {
  background: #f8f9fa;
  border: 1px solid #e5e6eb;
  border-radius: 4px;
  padding: 12px;
  position: relative;
  min-height: 100px;
}

.sql-code-wrapper pre {
  margin: 0;
  font-family: monospace;
  color: #273444;
  white-space: pre-wrap;
}

.copy-sql-btn {
  position: absolute;
  top: 8px;
  right: 8px;
}

/* 右侧边栏 */
.api-sidebar {
  width: 40px;
  background: #fff;
  border-left: 1px solid #e5e6eb;
  display: flex;
  flex-direction: column;
  padding-top: 16px;
}

.sidebar-item {
  writing-mode: vertical-rl;
  padding: 16px 8px;
  font-size: 12px;
  color: #4e5969;
  cursor: pointer;
  border-right: 2px solid transparent;
  transition: all 0.2s;
}

.sidebar-item:hover {
  background-color: #f2f3f5;
  color: #165dff;
}

.sidebar-item.active {
  color: #165dff;
  border-right-color: #165dff;
  background-color: #e8f3ff;
}

:deep(.arco-collapse-item-header) {
  background-color: #fafafa;
  font-weight: 500;
}
</style>
