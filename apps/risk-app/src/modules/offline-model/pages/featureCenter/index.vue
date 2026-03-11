<template>
  <div class="feature-center-page">
    <!-- 页面标题和操作区 -->
    <div class="page-header">
      <div class="page-title">
        <h2>特征中心</h2>
        <span class="page-subtitle">管理和查看所有特征数据</span>
      </div>
      <div class="page-actions">
        <a-space>
          <a-dropdown>
            <a-button type="primary">
              <template #icon><icon-plus /></template>
              新建
              <template #suffix><icon-down /></template>
            </a-button>
            <template #content>
              <a-doption @click="openRegister">
                <template #icon><icon-plus /></template>
                注册特征
              </a-doption>
              <a-doption @click="openQuickRegister">
                <template #icon><icon-plus /></template>
                快速注册
              </a-doption>
              <a-doption @click="openImport">
                <template #icon><icon-upload /></template>
                批量导入
              </a-doption>
            </template>
          </a-dropdown>
        </a-space>
      </div>
    </div>

    <!-- 搜索和筛选区 -->
    <div class="filter-section">
      <a-card>
        <a-form :model="filterForm" layout="inline">
          <a-form-item label="特征名称">
            <a-input
              v-model="filterForm.name"
              placeholder="请输入特征名称"
              allow-clear
              @change="handleFilterChange"
            />
          </a-form-item>
          
          <a-form-item label="特征类型">
            <a-select
              v-model="filterForm.type"
              placeholder="请选择特征类型"
              allow-clear
              @change="handleFilterChange"
            >
              <a-option value="numerical">数值型</a-option>
              <a-option value="categorical">分类型</a-option>
              <a-option value="text">文本型</a-option>
              <a-option value="time">时间型</a-option>
            </a-select>
          </a-form-item>
          
          <a-form-item label="状态">
            <a-select
              v-model="filterForm.status"
              placeholder="请选择状态"
              allow-clear
              @change="handleFilterChange"
            >
              <a-option value="active">上线</a-option>
              <a-option value="inactive">归档</a-option>
              <a-option value="draft">草稿</a-option>
            </a-select>
          </a-form-item>
          
          <a-form-item label="模型类型">
            <a-select
              v-model="filterForm.modelType"
              placeholder="请选择模型类型"
              allow-clear
              @change="handleFilterChange"
            >
              <a-option value="daily">日模型</a-option>
              <a-option value="monthly">月模型</a-option>
              <a-option value="other">其他模型</a-option>
            </a-select>
          </a-form-item>
          
          <a-form-item>
            <a-space>
              <a-button type="primary" @click="handleSearch">
                <template #icon>
                  <icon-search />
                </template>
                搜索
              </a-button>
              <a-button @click="handleReset">重置</a-button>
            </a-space>
          </a-form-item>
        </a-form>
      </a-card>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-section">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon">
                <icon-apps />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.totalFeatures }}</div>
                <div class="stat-label">总特征数</div>
              </div>
            </div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon">
                <icon-check-circle />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.activeFeatures }}</div>
                <div class="stat-label">有效特征</div>
              </div>
            </div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon">
                <icon-clock-circle />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.pendingFeatures }}</div>
                <div class="stat-label">待审核</div>
              </div>
            </div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon">
                <icon-warning />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.expiredFeatures }}</div>
                <div class="stat-label">已过期</div>
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 数据表格 -->
    <div class="table-section">
      <a-card>
        <template #title>
          <div class="table-header">
            <div class="header-left">
              <span>特征列表</span>
              <a-tag v-if="selectedRows.length" color="arcoblue" style="margin-left: 12px">
                已选 {{ selectedRows.length }} 项
              </a-tag>
            </div>
            <div class="header-right">
              <a-space>
                <a-button type="outline" size="small" :disabled="selectedRows.length === 0" @click="handleBatchDelete">
                  批量删除
                </a-button>
                <a-button type="outline" size="small" :disabled="selectedRows.length === 0" @click="handleBatchExport">
                  批量导出
                </a-button>
              </a-space>
            </div>
          </div>
        </template>
        
        <a-table
          :data="featureList"
          :columns="columns"
          :loading="loading"
          :pagination="pagination"
          row-key="id"
          @page-change="handlePageChange"
          @selection-change="handleSelectionChange"
        >
          <template #name="{ record }">
            <a-link @click="handleViewDetail(record)">{{ record.name }}</a-link>
          </template>
          
          <template #code="{ record }">
            <a-typography-text copyable>{{ record.code }}</a-typography-text>
          </template>
          
          <template #type="{ record }">
            <a-tag :color="getTypeColor(record.type)">
              {{ getTypeLabel(record.type) }}
            </a-tag>
          </template>
          
          <template #status="{ record }">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusLabel(record.status) }}
            </a-tag>
          </template>
          
          <template #createTime="{ record }">
            {{ formatDate(record.createTime) }}
          </template>
          
          <template #modelType="{ record }">
            <a-space v-if="Array.isArray(record.modelType)">
              <a-tag v-for="type in record.modelType" :key="type" :color="getModelTypeColor(type)">
                {{ getModelTypeLabel(type) }}
              </a-tag>
            </a-space>
            <a-tag v-else :color="getModelTypeColor(record.modelType)">
              {{ getModelTypeLabel(record.modelType) }}
            </a-tag>
          </template>
          
          <template #actions="{ record }">
            <a-space>
              <a-button type="text" size="small" @click="handleViewDetail(record)">
                查看
              </a-button>
              <a-button type="text" size="small" @click="handleEdit(record)">
                编辑
              </a-button>
              <a-button 
                type="text" 
                size="small" 
                status="danger"
                @click="handleDelete(record)"
              >
                删除
              </a-button>
            </a-space>
          </template>
        </a-table>
      </a-card>
    </div>
  </div>
  
  <!-- 快速注册抽屉 -->
  <a-drawer v-model:visible="createVisible" width="90vw" title="快速注册" @cancel="closeCreate" :mask-closable="false">
    <a-collapse :default-active-key="['basic','fields','confirm']" :bordered="false">
      <a-collapse-item key="basic" header="1. 快速注册基础信息">
        <a-form :model="createForm" layout="vertical" auto-label-width validation-trigger="blur">
          <a-form-item label="选择数据表" required field="table">
            <a-select v-model="createForm.table" placeholder="请选择数据表" allow-search @change="onTableChange">
              <a-option v-for="t in tableList" :key="t.name" :value="t.name">{{ t.name }} ({{ tableTypeLabel(t.type) }})</a-option>
            </a-select>
          </a-form-item>
          <a-form-item label="表类型" required field="tableType">
            <a-radio-group v-model="createForm.tableType">
              <a-radio value="stream">流水表</a-radio>
              <a-radio value="slow_change">拉链表</a-radio>
              <a-radio value="snapshot">分区/快照表</a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item label="主键字段" required field="primaryKey">
            <a-select v-model="createForm.primaryKey" placeholder="请选择主键">
              <a-option v-for="c in tableColumns" :key="c.name" :value="c.name">{{ c.name }} ({{ c.type }})</a-option>
            </a-select>
          </a-form-item>
          <a-form-item label="分区字段" field="partitionFields">
            <a-select v-model="createForm.partitionFields" placeholder="请选择分区字段" multiple allow-search>
              <a-option v-for="c in tableColumns" :key="c.name" :value="c.name">{{ c.name }} ({{ c.type }})</a-option>
            </a-select>
          </a-form-item>
          <a-form-item label="特征描述" field="description">
            <a-textarea v-model="createForm.description" :max-length="200" show-word-limit />
          </a-form-item>
          <a-form-item label="特征分类(大类)" required field="majorCategories">
            <a-select v-model="createForm.majorCategories" multiple placeholder="请选择特征分类">
              <a-option value="credit">征信变量</a-option>
              <a-option value="behavior">行为变量</a-option>
            </a-select>
          </a-form-item>
          <a-space>
            <a-button type="outline" :disabled="!createForm.table" @click="saveMeta">保存元信息(模拟)</a-button>
            <a-tag v-if="metaMsg" color="green">{{ metaMsg }}</a-tag>
          </a-space>
        </a-form>
      </a-collapse-item>
      <a-collapse-item key="fields" header="2. 字段校验与批量注册">
        <a-collapse :bordered="false" :default-active-key="['registered','unregistered']">
          <a-collapse-item key="registered" :header="`已注册字段（${registeredCount}）`">
            <a-card :bordered="false">
              <a-table :data="registeredFields" :columns="registeredColumns" :pagination="false" row-key="name" size="small" />
            </a-card>
          </a-collapse-item>
          <a-collapse-item key="unregistered" :header="`未注册字段（${unregisteredCount}）`">
            <a-card :bordered="false">
              <a-table :data="unregisteredFields" :columns="unregisteredColumns" :pagination="false" row-key="name" size="small">
                <template #selectedCell="{ record }">
                  <a-switch v-model="record.selected" size="small" />
                </template>
                <template #codeCell="{ record }">
                  <a-input v-model="record.code" placeholder="特征编码" />
                </template>
                <template #cnNameCell="{ record }">
                  <a-input v-model="record.cnName" placeholder="中文名" />
                </template>
                <template #dataTypeCell="{ record }">
                  <a-select v-model="record.dataType" placeholder="数据类型">
                    <a-option value="int">int</a-option>
                    <a-option value="double">double</a-option>
                    <a-option value="string">string</a-option>
                    <a-option value="timestamp">timestamp</a-option>
                  </a-select>
                </template>
                <template #defaultValueCell="{ record }">
                  <a-input v-model="record.defaultValue" placeholder="默认值" />
                </template>
              </a-table>
              <a-space style="margin-top: 8px">
                <a-button 
                  type="primary" 
                  size="small" 
                  :disabled="!unregisteredFields.some(f => f.selected)" 
                  @click="registerAll"
                >
                  注册选中
                </a-button>
                <a-button size="small" @click="runFieldValidate">执行校验</a-button>
                <a-tag v-if="fieldMsg" color="green">{{ fieldMsg }}</a-tag>
              </a-space>
            </a-card>
          </a-collapse-item>
        </a-collapse>
      </a-collapse-item>
      <a-collapse-item key="confirm" header="3. 确认提交">
        <a-descriptions bordered :column="1">
          <a-descriptions-item label="数据表">{{ createForm.table }}</a-descriptions-item>
          <a-descriptions-item label="表类型">{{ tableTypeLabel(createForm.tableType) }}</a-descriptions-item>
          <a-descriptions-item label="主键字段">{{ createForm.primaryKey }}</a-descriptions-item>
          <a-descriptions-item label="分区字段">{{ (createForm.partitionFields || []).join(', ') || '-' }}</a-descriptions-item>
          <a-descriptions-item label="特征描述">{{ createForm.description || '-' }}</a-descriptions-item>
          <a-descriptions-item label="本次注册字段">{{ (unregisteredFields.filter(f=>f.selected).map(f=>f.name)).join(', ') || '-' }}</a-descriptions-item>
        </a-descriptions>
      </a-collapse-item>
    </a-collapse>
    <template #footer>
      <a-space>
        <a-button @click="closeCreate">取消</a-button>
        <a-button type="primary" @click="submitCreate">提交</a-button>
      </a-space>
    </template>
  </a-drawer>
  
  <!-- 注册特征抽屉 -->
  <a-drawer v-model:visible="registerVisible" width="90vw" title="注册特征" @cancel="closeRegister" :mask-closable="false">
    <a-form ref="registerFormRef" :model="registerForm" :rules="registerRules" layout="vertical" class="register-form" auto-label-width validation-trigger="blur">
      <a-collapse :default-active-key="['basic', 'source', 'management']" :bordered="false">
        <!-- 第一部分：基础属性与分类 -->
        <a-collapse-item key="basic" header="1. 基础属性与分类">
          <a-row :gutter="24">
            <a-col :span="12">
              <a-form-item label="特征大类" required field="majorCategory">
                <a-radio-group v-model="registerForm.majorCategory" type="button" size="small">
                  <a-radio value="credit">征信变量</a-radio>
                  <a-radio value="behavior">行为变量</a-radio>
                  <a-radio value="model_output">模型输出</a-radio>
                </a-radio-group>
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item label="一级分类" required field="level1">
                <a-select v-model="registerForm.level1" placeholder="请选择" allow-clear size="small">
                  <a-option v-for="opt in effectiveLevel1Options" :key="opt.value" :value="opt.value">{{ opt.label }}</a-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item label="二级分类" field="level2">
                <a-select v-model="registerForm.level2" placeholder="请选择" allow-clear size="small" v-if="registerForm.majorCategory!=='model_output'">
                  <a-option v-for="opt in level2Options(registerForm.level1)" :key="opt.value" :value="opt.value">{{ opt.label }}</a-option>
                </a-select>
                <a-input v-else disabled placeholder="自动关联" size="small" />
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="24">
            <a-col :span="8">
              <a-form-item label="特征编码" required field="code">
                <a-input v-model="registerForm.code" placeholder="如：score_v1" size="small" />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="特征名称" required field="name">
                <a-input v-model="registerForm.name" placeholder="请输入名称" size="small" />
              </a-form-item>
            </a-col>
            <a-col :span="8" v-if="registerForm.majorCategory==='model_output'">
              <a-form-item label="选择模型" required field="modelCode">
                <a-select v-model="registerForm.modelCode" placeholder="请选择已注册模型" allow-search size="small" @change="onModelCodeChange">
                  <a-option v-for="m in modelList" :key="m.code" :value="m.code">{{ m.name }} ({{ m.code }})</a-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="24">
            <a-col :span="8">
              <a-form-item label="数据类型" required field="dataType">
                <a-select v-model="registerForm.dataType" placeholder="请选择" size="small">
                  <a-option value="int">int</a-option>
                  <a-option value="double">double</a-option>
                  <a-option value="string">string</a-option>
                  <a-option value="timestamp">timestamp</a-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="默认值">
                <a-input v-model="registerForm.defaultValue" placeholder="默认值" size="small" />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="模型类型" required field="modelType">
                <a-select v-model="registerForm.modelType" placeholder="可多选" multiple allow-clear size="small">
                  <a-option value="daily">日模型</a-option>
                  <a-option value="monthly">月模型</a-option>
                  <a-option value="other">其他模型</a-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>
        </a-collapse-item>

        <!-- 第二部分：数据来源与加工逻辑 -->
        <a-collapse-item key="source" header="2. 数据来源与加工逻辑">
          <a-row :gutter="24">
            <a-col :span="12">
              <a-form-item label="日模型来源表" v-if="registerForm.modelType.includes('daily') || registerForm.modelType.includes('other') || registerForm.modelType.length === 0" field="sourceTable">
                <a-input v-model="registerForm.sourceTable" placeholder="请输入表名" size="small" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="月模型来源表" v-if="registerForm.modelType.includes('monthly')" field="monthlySourceTable">
                <a-input v-model="registerForm.monthlySourceTable" placeholder="请输入表名" size="small" />
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="24">
            <a-col :span="8">
              <a-form-item label="更新频率" field="updateFrequency">
                <a-select v-model="registerForm.updateFrequency" placeholder="请选择" size="small">
                  <a-option value="实时">实时</a-option>
                  <a-option value="日度">日度</a-option>
                  <a-option value="周度">周度</a-option>
                  <a-option value="月度">月度</a-option>
                  <a-option value="按需">按需</a-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="所属批次" field="batch">
                <a-input v-model="registerForm.batch" placeholder="如：2023Q4" size="small" />
              </a-form-item>
            </a-col>
          </a-row>

          <a-form-item label="加工逻辑" field="processingLogic">
            <a-textarea v-model="registerForm.processingLogic" placeholder="描述特征加工逻辑..." :auto-size="{ minRows: 3, maxRows: 5 }" />
          </a-form-item>

          <a-form-item label="备注说明" field="remark">
            <a-textarea v-model="registerForm.remark" placeholder="其他补充信息" :auto-size="{ minRows: 2, maxRows: 3 }" />
          </a-form-item>

          <a-alert v-if="registerForm.majorCategory==='model_output'" type="info">
            来源自动填充为平台模型输出
          </a-alert>
        </a-collapse-item>

        <!-- 第三部分：管理信息与映射规则 -->
        <a-collapse-item key="management" header="3. 管理信息与映射规则">
          <a-row :gutter="24">
            <a-col :span="6">
              <a-form-item label="需求提出人" field="proposer">
                <a-input v-model="registerForm.proposer" placeholder="姓名" size="small" />
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item label="开发负责人" field="developer">
                <a-input v-model="registerForm.developer" placeholder="姓名" size="small" />
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item label="计划上线时间" field="onlineTime">
                <a-date-picker v-model="registerForm.onlineTime" style="width: 100%" size="small" />
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item label="验收负责人" field="accepter">
                <a-input v-model="registerForm.accepter" placeholder="姓名" size="small" />
              </a-form-item>
            </a-col>
          </a-row>

          <div class="mapping-section" style="margin-top: 16px">
            <div class="section-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <span style="font-weight: 500;">默认值转化映射</span>
              <a-button type="outline" size="mini" @click="addMapping">
                <template #icon><icon-plus /></template>
                添加策略
              </a-button>
            </div>
            
            <div v-if="registerForm.defaultValueMappings.length === 0" class="empty-mapping">
              <a-empty description="暂无映射规则" />
            </div>

            <a-row :gutter="16">
              <a-col :span="12" v-for="(mapping, mIdx) in registerForm.defaultValueMappings" :key="mIdx">
                <div class="mapping-card">
                  <div class="mapping-card-header">
                    <div class="header-left">
                      <a-tag color="arcoblue" size="small">策略 {{ mIdx + 1 }}</a-tag>
                    </div>
                    <div class="header-right">
                      <a-button type="text" status="danger" size="mini" @click="removeMapping(mIdx)">
                        <template #icon><icon-delete /></template>
                      </a-button>
                    </div>
                  </div>
                  
                  <a-row :gutter="12">
                    <a-col :span="12">
                      <a-form-item label="适用模型" required>
                        <a-select v-model="mapping.conditionType" placeholder="类型" size="small">
                          <a-option value="daily">日模型</a-option>
                          <a-option value="monthly">月模型</a-option>
                          <a-option value="all">全量通用</a-option>
                        </a-select>
                      </a-form-item>
                    </a-col>
                    <a-col :span="12">
                      <a-form-item label="规则描述">
                        <a-input v-model="mapping.ruleDesc" placeholder="描述" size="small" />
                      </a-form-item>
                    </a-col>
                  </a-row>

                  <div class="mapping-rule-container">
                    <div class="rules-header">
                      <span class="rules-title">映射明细</span>
                      <a-button type="text" size="mini" @click="addMappingRule(mIdx)">
                        <template #icon><icon-plus /></template>
                        添加
                      </a-button>
                    </div>
                    <div v-for="(rule, rIdx) in mapping.rules" :key="rIdx" class="mapping-rule-row">
                      <a-input v-model="rule.origin" placeholder="原值" size="mini" />
                      <icon-arrow-right style="color: #86909c" />
                      <a-input v-model="rule.target" placeholder="目标值" size="mini" />
                      <a-button type="text" status="danger" size="mini" @click="removeMappingRule(mIdx, rIdx)">
                        <icon-close />
                      </a-button>
                    </div>
                  </div>
                </div>
              </a-col>
            </a-row>
          </div>
        </a-collapse-item>
      </a-collapse>
    </a-form>
    <template #footer>
      <a-space>
        <a-button @click="closeRegister">取消</a-button>
        <a-button type="primary" @click="submitRegister">提交</a-button>
      </a-space>
    </template>
  </a-drawer>
  
  <!-- 批量导入抽屉 -->
  <a-drawer v-model:visible="importVisible" width="90vw" title="批量导入特征">
    <a-space style="margin-bottom: 12px">
      <a-button type="outline" @click="downloadTemplate">模板下载</a-button>
      <a-button type="primary" @click="addImportRow">新增一行</a-button>
      <a-button status="danger" @click="clearImportRows">清空</a-button>
    </a-space>
    <a-table :data="importRows" :columns="importColumns" row-key="__key" :pagination="false" size="small">
      <template #majorCategoryCell="{ record }">
        <a-select v-model="record.majorCategory" placeholder="特征大类">
          <a-option value="credit">征信变量</a-option>
          <a-option value="behavior">行为变量</a-option>
          <a-option value="model_output">模型输出</a-option>
        </a-select>
      </template>
      <template #level1Cell="{ record }">
        <a-select v-model="record.level1" placeholder="一级分类">
          <a-option v-for="opt in level1Options" :key="opt.value" :value="opt.value">{{ opt.label }}</a-option>
        </a-select>
      </template>
      <template #level2Cell="{ record }">
        <a-select v-model="record.level2" placeholder="二级分类">
          <a-option v-for="opt in level2Options(record.level1)" :key="opt.value" :value="opt.value">{{ opt.label }}</a-option>
        </a-select>
      </template>
      <template #codeCell="{ record }">
        <a-input v-model="record.code" placeholder="特征编码" />
      </template>
      <template #nameCell="{ record }">
        <a-input v-model="record.name" placeholder="特征名称" />
      </template>
      <template #sourceTableCell="{ record }">
        <a-input v-model="record.sourceTable" placeholder="日模型来源表" />
      </template>
      <template #processingLogicCell="{ record }">
        <a-input v-model="record.processingLogic" placeholder="加工逻辑" />
      </template>
      <template #dataTypeCell="{ record }">
        <a-select v-model="record.dataType" placeholder="数据类型">
          <a-option value="int">int</a-option>
          <a-option value="double">double</a-option>
          <a-option value="string">string</a-option>
          <a-option value="timestamp">timestamp</a-option>
        </a-select>
      </template>
      <template #batchCell="{ record }">
        <a-input v-model="record.batch" placeholder="批次" />
      </template>
      <template #proposerCell="{ record }">
        <a-input v-model="record.proposer" placeholder="需求提出人" />
      </template>
      <template #developerCell="{ record }">
        <a-input v-model="record.developer" placeholder="开发人" />
      </template>
      <template #onlineTimeCell="{ record }">
        <a-date-picker v-model="record.onlineTime" style="width: 100%" />
      </template>
      <template #accepterCell="{ record }">
        <a-input v-model="record.accepter" placeholder="验收人" />
      </template>
      <template #remarkCell="{ record }">
        <a-input v-model="record.remark" placeholder="备注" />
      </template>
      <template #actionsCell="{ rowIndex }">
        <a-button size="mini" status="danger" @click="removeImportRow(rowIndex)">移除</a-button>
      </template>
    </a-table>
    <template #footer>
      <a-space>
        <a-button @click="closeImport">取消</a-button>
        <a-button type="primary" @click="submitImport">导入</a-button>
      </a-space>
    </template>
  </a-drawer>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useOfflineModelStore } from '@/modules/offline-model/stores'
import { Message } from '@arco-design/web-vue'
import { featureAPI, modelAPI } from '@/modules/offline-model/api'

const router = useRouter()
const store = useOfflineModelStore()

// 响应式数据
const loading = ref(false)
const selectedRows = ref([])

// 创建相关
const createVisible = ref(false)
const registerVisible = ref(false)
const importVisible = ref(false)
const createForm = reactive({ table: '', tableType: '', primaryKey: '', partitionFields: [], description: '', majorCategories: [] })
const tableList = ref([])
const tableColumns = ref([])
const registeredFields = ref([])
const unregisteredFields = ref([])
const registeredCount = computed(() => registeredFields.value.length)
const unregisteredCount = computed(() => unregisteredFields.value.length)
const registeredColumns = [
  { title: '原表字段名', dataIndex: 'name', width: 160 },
  { title: '特征编码', dataIndex: 'code', width: 160 },
  { title: '类型', dataIndex: 'type', width: 140 },
  { title: '中文名', dataIndex: 'cnName', width: 160 },
  { title: '数据类型', dataIndex: 'dataType', width: 140 },
  { title: '默认值', dataIndex: 'defaultValue', width: 140 },
  { title: '来源', dataIndex: 'sourceType', width: 140 },
  { title: '来源标识', dataIndex: 'sourceRefId', width: 180 }
]
const unregisteredColumns = [
  { title: '是否注册', dataIndex: 'selected', slotName: 'selectedCell', width: 100 },
  { title: '原表字段名', dataIndex: 'name', width: 160 },
  { title: '特征编码', dataIndex: 'code', slotName: 'codeCell', width: 160 },
  { title: '类型', dataIndex: 'type', width: 140 },
  { title: '中文名', dataIndex: 'cnName', slotName: 'cnNameCell', width: 160 },
  { title: '数据类型', dataIndex: 'dataType', slotName: 'dataTypeCell', width: 140 },
  { title: '默认值', dataIndex: 'defaultValue', slotName: 'defaultValueCell', width: 140 }
]
const level1Options = [
  { value: 'credit_report', label: '征信报告' },
  { value: 'credit_history', label: '信贷记录' },
  { value: 'transaction_behavior', label: '交易行为' },
  { value: 'activity', label: '活跃度' },
  { value: 'model_outputs', label: '模型输出' }
]
const level2Options = (l1) => {
  const map = {
    credit_report: [
      { value: 'overdue_count', label: '逾期次数' },
      { value: 'query_count', label: '查询次数' }
    ],
    credit_history: [
      { value: 'loan_times', label: '贷款次数' },
      { value: 'repay_ratio', label: '还款比率' }
    ],
    transaction_behavior: [
      { value: 'avg_amount', label: '平均交易额' },
      { value: 'frequency', label: '交易频次' }
    ],
    activity: [
      { value: 'login_days', label: '登录天数' },
      { value: 'session_count', label: '会话次数' }
    ],
    model_outputs: [
      { value: 'score', label: '评分' },
      { value: 'probability', label: '概率' }
    ]
  }
  return map[l1] || []
}

// 批量导入
const importRows = ref([])
const importColumns = [
  { title: '特征大类', dataIndex: 'majorCategory', slotName: 'majorCategoryCell', width: 140 },
  { title: '一级分类', dataIndex: 'level1', slotName: 'level1Cell', width: 140 },
  { title: '二级分类', dataIndex: 'level2', slotName: 'level2Cell', width: 140 },
  { title: '特征编码', dataIndex: 'code', slotName: 'codeCell', width: 160 },
  { title: '特征名称', dataIndex: 'name', slotName: 'nameCell', width: 160 },
  { title: '日模型来源表', dataIndex: 'sourceTable', slotName: 'sourceTableCell', width: 160 },
  { title: '加工逻辑', dataIndex: 'processingLogic', slotName: 'processingLogicCell', width: 200 },
  { title: '数据类型', dataIndex: 'dataType', slotName: 'dataTypeCell', width: 140 },
  { title: '批次', dataIndex: 'batch', slotName: 'batchCell', width: 120 },
  { title: '需求提出人', dataIndex: 'proposer', slotName: 'proposerCell', width: 140 },
  { title: '开发人', dataIndex: 'developer', slotName: 'developerCell', width: 140 },
  { title: '上线时间', dataIndex: 'onlineTime', slotName: 'onlineTimeCell', width: 160 },
  { title: '验收人', dataIndex: 'accepter', slotName: 'accepterCell', width: 140 },
  { title: '备注', dataIndex: 'remark', slotName: 'remarkCell' },
  { title: '操作', dataIndex: 'actions', slotName: 'actionsCell', width: 100, fixed: 'right' }
]

// 注册表单
const modelList = ref([])
const registerFormRef = ref(null)

const registerRules = {
  majorCategory: [{ required: true, message: '请选择特征大类' }],
  level1: [{ required: true, message: '请选择一级分类' }],
  code: [
    { required: true, message: '请输入特征编码' },
    { match: /^[a-zA-Z0-9_]+$/, message: '仅支持字母、数字和下划线' }
  ],
  name: [{ required: true, message: '请输入特征名称' }],
  dataType: [{ required: true, message: '请选择数据类型' }],
  modelType: [{ required: true, message: '请选择模型类型' }],
  modelCode: [{ required: true, message: '请选择模型' }]
}

const registerForm = reactive({
  majorCategory: 'credit', 
  level1: '', 
  level2: '', 
  code: '', 
  name: '', 
  sourceTable: '', 
  monthlySourceTable: '', 
  processingLogic: '', 
  dataType: 'double', 
  defaultValue: '',
  batch: '', 
  proposer: '', 
  developer: '', 
  onlineTime: '', 
  accepter: '', 
  remark: '', 
  modelCode: '', 
  modelType: ['daily'],
  updateFrequency: '按需',
  defaultValueMappings: []
})

const addMapping = () => {
  registerForm.defaultValueMappings.push({ conditionType: 'daily', ruleDesc: '', rules: [{ origin: '', target: '' }] })
}

const removeMapping = (index) => {
  registerForm.defaultValueMappings.splice(index, 1)
}

const addMappingRule = (mIdx) => {
  registerForm.defaultValueMappings[mIdx].rules.push({ origin: '', target: '' })
}

const removeMappingRule = (mIdx, rIdx) => {
  registerForm.defaultValueMappings[mIdx].rules.splice(rIdx, 1)
}

// 筛选表单
const filterForm = reactive({
  name: '',
  type: '',
  status: '',
  modelType: ''
})

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: true,
  showJumper: true,
  showPageSize: true
})

// 表格列配置
const columns = [
  {
    title: '特征名称',
    dataIndex: 'name',
    slotName: 'name',
    width: 200
  },
  {
    title: '特征编码',
    dataIndex: 'code',
    slotName: 'code',
    width: 150
  },
  {
    title: '日模型来源表',
    dataIndex: 'dataSource',
    width: 180
  },
  {
    title: '特征类型',
    dataIndex: 'type',
    slotName: 'type',
    width: 100
  },
  {
    title: '默认值',
    dataIndex: 'defaultValue',
    width: 120
  },
  {
    title: '描述',
    dataIndex: 'description',
    ellipsis: true,
    tooltip: true
  },
  {
    title: '状态',
    dataIndex: 'status',
    slotName: 'status',
    width: 100
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    slotName: 'createTime',
    width: 180
  },
  {
    title: '创建人',
    dataIndex: 'creator',
    width: 120
  },
  {
    title: '模型类型',
    dataIndex: 'modelType',
    slotName: 'modelType',
    width: 120
  },
  {
    title: '操作',
    slotName: 'actions',
    width: 150,
    fixed: 'right'
  }
]

// 计算属性
const featureList = computed(() => store.getFeatures)
const stats = computed(() => ({
  totalFeatures: featureList.value.length,
  activeFeatures: featureList.value.filter(item => item.status === 'active').length,
  pendingFeatures: featureList.value.filter(item => item.status === 'pending').length,
  expiredFeatures: featureList.value.filter(item => item.status === 'expired').length
}))

// 生命周期
onMounted(() => {
  loadData()
})

// 方法
const loadData = async () => {
  loading.value = true
  try {
    let response;
    if (filterForm.modelType) {
      // 如果选择了模型类型，则使用按模型类型获取特征的API
      response = await featureAPI.getFeaturesByModelType(filterForm.modelType, {
        ...filterForm,
        page: pagination.current,
        pageSize: pagination.pageSize
      });
    } else {
      // 否则使用常规获取特征的API
      response = await featureAPI.getFeatures({
        ...filterForm,
        page: pagination.current,
        pageSize: pagination.pageSize
      });
    }
    
    if (response.success) {
      store.setFeatures(response.data.data)
      pagination.total = response.data.total
    } else {
      Message.error({ content: response.message || '加载数据失败', duration: 6000 })
    }
  } catch (error) {
    Message.error({ content: '加载数据失败: ' + error.message, duration: 6000 })
  } finally {
    loading.value = false
  }
}

const handleFilterChange = () => {
  pagination.current = 1
  loadData()
}

const handleSearch = () => {
  loadData()
}

const handleReset = () => {
  filterForm.name = ''
  filterForm.type = ''
  filterForm.status = ''
  loadData()
}

const handlePageChange = (page) => {
  pagination.current = page
  loadData()
}

const handleSelectionChange = (rows) => {
  selectedRows.value = rows
}

const handleBatchDelete = () => {
  if (selectedRows.value.length === 0) return
  Message.info({ content: `批量删除 ${selectedRows.value.length} 个特征 (模拟)`, duration: 3000 })
}

const handleBatchExport = () => {
  if (selectedRows.value.length === 0) return
  Message.info({ content: `批量导出 ${selectedRows.value.length} 个特征 (模拟)`, duration: 3000 })
}

const handleViewDetail = (record) => {
  router.push(`/model-offline-analysis/feature-center/detail/${record.id}`)
}

const handleEdit = (record) => {
  router.push(`/model-offline-analysis/feature-center/edit/${record.id}`)
}

const handleDelete = () => {
  Message.info({ content: '删除功能开发中', duration: 3000 })
}

// 工具方法
const getTypeColor = (type) => {
  const colors = {
    numerical: 'blue',
    categorical: 'green',
    text: 'orange',
    time: 'purple'
  }
  return colors[type] || 'gray'
}

const getTypeLabel = (type) => {
  const labels = {
    numerical: '数值型',
    categorical: '分类型',
    text: '文本型',
    time: '时间型'
  }
  return labels[type] || type
}

const getStatusColor = (status) => {
  const colors = {
    active: 'green',
    inactive: 'red',
    draft: 'orange',
    pending: 'blue'
  }
  return colors[status] || 'gray'
}

const getStatusLabel = (status) => {
  const labels = {
    active: '有效',
    inactive: '无效',
    draft: '草稿',
    pending: '待审核'
  }
  return labels[status] || status
}

const getModelTypeColor = (modelType) => {
  const colors = {
    daily: 'blue',
    monthly: 'green',
    other: 'orange'
  }
  return colors[modelType] || 'gray'
}

const getModelTypeLabel = (modelType) => {
  const labels = {
    daily: '日模型',
    monthly: '月模型',
    other: '其他模型'
  }
  return labels[modelType] || modelType
}

const formatDate = (date) => {
  return new Date(date).toLocaleString('zh-CN')
}

// 快速注册相关方法
const openQuickRegister = async () => {
  createVisible.value = true
  try {
    const res = await featureAPI.listTables()
    tableList.value = Array.isArray(res) ? res : (Array.isArray(res.data) ? res.data : (res.data?.data || []))
    if (tableList.value.length > 0) {
      createForm.table = tableList.value[0].name
      await onTableChange(createForm.table)
    }
  } catch (error) {
    console.error('获取数据表失败:', error)
    Message.error({ content: '获取数据表失败', duration: 6000 })
  }
}

const closeCreate = () => { 
  createVisible.value = false 
}

const tableTypeLabel = (t) => ({ stream: '流水表', slow_change: '拉链表', snapshot: '分区/快照表' }[t] || t)

const onTableChange = async (name) => {
  try {
    const meta = await featureAPI.getTableMeta(name)
    createForm.table = name
    createForm.tableType = meta?.data?.type || meta?.type || ''
    createForm.primaryKey = meta?.data?.primaryKey || meta?.primaryKey || ''
    createForm.description = meta?.data?.description || meta?.description || ''
    createForm.partitionFields = meta?.data?.partitionFields || meta?.partitionFields || []
    
    const colsRes = await featureAPI.getTableColumns(name)
    tableColumns.value = Array.isArray(colsRes) ? colsRes : (Array.isArray(colsRes.data) ? colsRes.data : (colsRes.data?.data || []))
    
    const regRes = await featureAPI.getRegisteredFields(name)
    registeredFields.value = Array.isArray(regRes) ? regRes : (Array.isArray(regRes.data) ? regRes.data : (regRes.data?.data || []))
    
    const unregRes = await featureAPI.getUnregisteredFields(name)
    const rawUnreg = Array.isArray(unregRes) ? unregRes : (Array.isArray(unregRes.data) ? unregRes.data : (unregRes.data?.data || []))
    unregisteredFields.value = rawUnreg.map(c => ({
      name: c.name,
      type: c.type,
      code: c.name,
      cnName: c.name,
      onlineTime: '',
      dataType: c.type,
      defaultValue: '',
      processingLogic: '',
      batch: '',
      remark: '',
      level1: '',
      level2: '',
      selected: true
    }))
  } catch (error) {
    console.error('获取表信息失败:', error)
    Message.error({ content: '获取表信息失败', duration: 6000 })
  }
}

const metaMsg = ref('')
const fieldMsg = ref()

const saveMeta = async () => {
  if (!createForm.table) return
  try {
    const res = await featureAPI.setTableMeta(createForm.table, { 
      type: createForm.tableType, 
      primaryKey: createForm.primaryKey, 
      description: createForm.description, 
      partitionFields: createForm.partitionFields 
    })
    if (res.success) metaMsg.value = '元信息已保存'
  } catch (error) {
    console.error('保存元信息失败:', error)
    Message.error({ content: '保存元信息失败', duration: 6000 })
  }
}

const registerAll = async () => {
  if (!createForm.table) return
  const selected = unregisteredFields.value.filter(f => f.selected)
  if (selected.length === 0) { 
    Message.warning({ content: '请在未注册字段中选择要注册的字段', duration: 3000 }); 
    return 
  }
  try {
    const res = await featureAPI.batchRegisterFields(createForm.table, selected)
    registeredFields.value = Array.isArray(res) ? res : (Array.isArray(res.data) ? res.data : (res.data?.data || []))
    
    const unregRes = await featureAPI.getUnregisteredFields(createForm.table)
    const newUnreg = Array.isArray(unregRes) ? unregRes : (Array.isArray(unregRes.data) ? unregRes.data : (unregRes.data?.data || []))
    unregisteredFields.value = newUnreg.map(c => ({
      name: c.name,
      type: c.type,
      code: c.name,
      cnName: c.name,
      onlineTime: '',
      dataType: c.type,
      defaultValue: '',
      processingLogic: '',
      batch: '',
      remark: '',
      level1: '',
      level2: '',
      selected: true
    }))
  } catch (error) {
    console.error('批量注册字段失败:', error)
    Message.error({ content: '批量注册字段失败', duration: 6000 })
  }
}

const runFieldValidate = () => {
  const ok = unregisteredFields.value.filter(f => f.selected).length > 0
  fieldMsg.value = ok ? '校验通过' : '校验不通过，请选择需注册字段'
}

const submitCreate = async () => {
  if (!createForm.table) { 
    Message.warning({ content: '请选择数据表', duration: 3000 }); 
    return 
  }
  const selected = unregisteredFields.value.filter(f => f.selected)
  if (selected.length === 0) { 
    Message.warning({ content: '请在未注册字段中选择要注册的字段', duration: 3000 }); 
    return 
  }
  try {
    const res = await featureAPI.batchRegisterFields(createForm.table, selected)
    if (Array.isArray(res?.data) || Array.isArray(res)) {
      Message.success({ content: '特征注册完成', duration: 3000 })
      createVisible.value = false
      loadData()
    } else {
      Message.error({ content: res?.message || '注册失败', duration: 6000 })
    }
  } catch (error) {
    console.error('特征注册失败:', error)
    Message.error({ content: '特征注册失败', duration: 6000 })
  }
}

// 特征注册相关方法
const effectiveLevel1Options = computed(() => {
  const cat = registerForm.majorCategory
  if (cat === 'model_output') return level1Options.filter(o => o.value === 'model_outputs')
  if (cat === 'credit') return level1Options.filter(o => o.value === 'credit_report' || o.value === 'credit_history')
  if (cat === 'behavior') return level1Options.filter(o => o.value === 'transaction_behavior' || o.value === 'activity')
  return level1Options
})

watch(() => registerForm.majorCategory, (cat) => {
  if (cat === 'model_output') {
    registerForm.level1 = 'model_outputs'
    registerForm.level2 = ''
    registerForm.sourceTable = ''
  } else if (cat === 'credit') {
    if (registerForm.level1 !== 'credit_report' && registerForm.level1 !== 'credit_history') {
      registerForm.level1 = 'credit_report'
    }
  } else if (cat === 'behavior') {
    if (registerForm.level1 !== 'transaction_behavior' && registerForm.level1 !== 'activity') {
      registerForm.level1 = 'transaction_behavior'
    }
  }
})

const onModelCodeChange = (code) => {
  if (!code) return
  if (!registerForm.name) registerForm.name = '模型分'
  if (!registerForm.dataType) registerForm.dataType = 'double'
}

const openRegister = async () => {
  registerVisible.value = true
  try {
    const res = await modelAPI.getModels({ page: 1, pageSize: 200 })
    modelList.value = Array.isArray(res.data) ? res.data : (res.data?.data || [])
  } catch (err) {
    console.error('获取模型列表失败:', err)
    Message.error({ content: '获取模型列表失败', duration: 6000 })
  }
}

const closeRegister = () => { 
  registerVisible.value = false 
}

const submitRegister = async () => {
  const errors = await registerFormRef.value?.validate()
  if (errors) return

  const typeMap = (dt) => {
    if (dt === 'timestamp') return 'time'
    if (dt === 'string') return 'categorical'
    if (dt === 'int' || dt === 'double') return 'numerical'
    return 'numerical'
  }
  const isModelOutput = registerForm.majorCategory === 'model_output'
  if (isModelOutput && !registerForm.modelCode) {
    Message.error({ content: '请选择已注册的模型', duration: 6000 })
    return
  }

  const selectedModel = isModelOutput ? (modelList.value || []).find(m => m.code === registerForm.modelCode) : null
  const payload = {
    name: registerForm.name,
    code: registerForm.code,
    type: typeMap(registerForm.dataType),
    description: registerForm.processingLogic || '',
    dataSource: (isModelOutput && !registerForm.modelType.includes('daily')) ? '平台模型输出' : (registerForm.sourceTable || ''),
    monthlyDataSource: registerForm.monthlySourceTable || '',
    updateFrequency: registerForm.modelType.includes('monthly') ? '月度' : (registerForm.updateFrequency || '按需'),
    majorCategory: registerForm.majorCategory,
    level1: isModelOutput ? 'model_outputs' : registerForm.level1,
    level2: isModelOutput ? (registerForm.modelCode || '') : registerForm.level2,
    batch: registerForm.batch,
    proposer: registerForm.proposer,
    developer: registerForm.developer,
    onlineTime: registerForm.onlineTime,
    accepter: registerForm.accepter,
    remark: registerForm.remark,
    sourceType: isModelOutput ? 'model_output' : '',
    sourceRefId: isModelOutput ? (registerForm.modelCode || '') : '',
    creator: isModelOutput ? (selectedModel?.creator || '平台模型') : undefined,
    modelType: registerForm.modelType, // 现在是一个数组
    defaultValueMappings: registerForm.defaultValueMappings
  }

  try {
    const res = await featureAPI.createFeature(payload)
    if (res.success) {
      Message.success({ content: res.message || '创建成功', duration: 3000 })
      closeRegister()
      loadData()
    } else {
      Message.error({ content: res.message || '创建失败', duration: 6000 })
    }
  } catch (error) {
    console.error('创建特征失败:', error)
    Message.error({ content: '创建失败', duration: 6000 })
  }
}

// 批量导入相关方法
const openImport = () => {
  importVisible.value = true
  if (importRows.value.length === 0) addImportRow()
}

const closeImport = () => { 
  importVisible.value = false 
}

const addImportRow = () => {
  importRows.value.push({
    __key: Date.now() + Math.random(),
    majorCategory: '', level1: '', level2: '', code: '', name: '', sourceTable: '', processingLogic: '', dataType: '', batch: '', proposer: '', developer: '', onlineTime: '', accepter: '', remark: ''
  })
}

const removeImportRow = (idx) => { 
  importRows.value.splice(idx, 1) 
}

const clearImportRows = () => { 
  importRows.value = [] 
}

const submitImport = async () => {
  if (importRows.value.length === 0) { 
    Message.warning({ content: '请先添加导入数据', duration: 3000 }); 
    return 
  }
  const typeMap = (dt) => {
    if (dt === 'timestamp') return 'time'
    if (dt === 'string') return 'categorical'
    if (dt === 'int' || dt === 'double') return 'numerical'
    return 'numerical'
  }
  const payload = importRows.value.map(r => ({
    name: r.name,
    code: r.code,
    type: typeMap(r.dataType),
    description: r.processingLogic || '',
    dataSource: r.sourceTable || '',
    updateFrequency: '按需',
    majorCategory: r.majorCategory,
    level1: r.level1,
    level2: r.level2,
    batch: r.batch,
    proposer: r.proposer,
    developer: r.developer,
    onlineTime: r.onlineTime,
    accepter: r.accepter,
    remark: r.remark
  }))
  try {
    const res = await featureAPI.importFeatures(payload)
    if (res.success) {
      Message.success({ content: res.message || '批量导入成功', duration: 3000 })
      closeImport()
      loadData()
    } else {
      Message.error({ content: res.message || '批量导入失败', duration: 6000 })
    }
  } catch (error) {
    console.error('批量导入失败:', error)
    Message.error({ content: '批量导入失败', duration: 6000 })
  }
}

const downloadTemplate = () => {
  const headers = ['majorCategory','level1','level2','code','name','sourceTable','processingLogic','dataType','batch','proposer','developer','onlineTime','accepter','remark']
  const csv = headers.join(',') + '\n'
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'feature_import_template.csv'
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<style scoped lang="less">
.feature-center-page {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    
    .page-title {
      h2 {
        margin: 0;
        font-size: 24px;
        font-weight: 500;
      }
      
      .page-subtitle {
        color: #666;
        font-size: 14px;
      }
    }
  }
  
  .filter-section {
    margin-bottom: 24px;
  }
  
  .stats-section {
    margin-bottom: 24px;
    
    .stat-card {
      .stat-content {
        display: flex;
        align-items: center;
        
        .stat-icon {
          font-size: 32px;
          color: #1890ff;
          margin-right: 16px;
        }
        
        .stat-info {
          .stat-value {
            font-size: 24px;
            font-weight: 600;
            color: #333;
          }
          
          .stat-label {
            color: #666;
            font-size: 14px;
          }
        }
      }
    }
  }
  
  .table-section {
    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
}

// 注册表单样式
.register-form {
  padding: 0 4px;

  .form-section {
    margin-bottom: 24px;
    background: #fff;
    
    .section-title {
      font-size: 15px;
      font-weight: 600;
      color: #1d2129;
      margin-bottom: 16px;
      padding-left: 12px;
      position: relative;
      display: flex;
      justify-content: space-between;
      align-items: center;

      &::before {
        content: "";
        position: absolute;
        left: 0;
        top: 3px;
        bottom: 3px;
        width: 3px;
        background: #165dff;
        border-radius: 2px;
      }
    }
  }

  .mb-16 {
    margin-bottom: 16px;
  }

  .mapping-card {
    background: #f7f8fa;
    border-radius: 4px;
    padding: 16px;
    margin-bottom: 16px;
    border: 1px solid #e5e6eb;
    transition: all 0.2s;

    &:hover {
      border-color: #165dff;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    .mapping-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      border-bottom: 1px dashed #e5e6eb;
      padding-bottom: 8px;

      .mapping-index {
        font-weight: 500;
        color: #4e5969;
        font-size: 13px;
      }
    }

    .mapping-sub-title {
      font-size: 13px;
      color: #86909c;
      margin: 12px 0 8px;
    }

    .mapping-rule-row {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
      background: #fff;
      padding: 8px;
      border-radius: 4px;
      border: 1px solid #f2f3f5;
    }
  }

  .empty-mapping {
    text-align: center;
    padding: 32px;
    background: #f7f8fa;
    border-radius: 4px;
    color: #86909c;
    border: 1px dashed #e5e6eb;
  }
}
</style>
