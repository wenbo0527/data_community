<template>
  <div class="variable-management-page">
    <DmtPageHeader title="风险特征台账" subtitle="贷中行为/外数/征信多品类特征统一管理，全生命周期闭环" :show-back="false">
      <template #extra>
        <a-input
          v-model="globalKeyword"
          class="header-search"
          size="large"
          allow-clear
          placeholder="全局搜索：名称 / 编码 / 描述 / 责任人"
          @input="handleGlobalSearch"
          @clear="handleGlobalSearch"
        >
          <template #prefix><icon-search /></template>
        </a-input>
        <a-dropdown trigger="click" @select="handleCreateMenuSelect">
          <a-button type="primary">
            <template #icon><icon-plus /></template>
            新建特征
          </a-button>
          <template #content>
            <a-doption value="add">注册为变量</a-doption>
            <a-doption value="incremental">导入更新</a-doption>
          </template>
        </a-dropdown>
        <a-button @click="handleExport">
          <template #icon><icon-download /></template>
          导出
        </a-button>
      </template>
    </DmtPageHeader>

  <div class="page-content">
      <!-- Tab 切换：特征台账 / 衍生需求 -->
      <a-tabs v-model:active-key="activeTab" size="large" class="risk-feature-tabs">
        <a-tab-pane key="features">
          <template #title><a-space :size="6"><icon-apps />特征台账</a-space></template>
        </a-tab-pane>
        <a-tab-pane key="derivations">
          <template #title><a-space :size="6"><icon-file />衍生需求</a-space></template>
        </a-tab-pane>
      </a-tabs>

      <!-- 贷中行为 9 状态机分布概览（仅选中品类时显示） -->
      <a-card v-if="filterForm.riskCategory === 'midloan_behavior' && activeTab === 'features'" class="midloan-overview-card">
        <template #title>
          <a-space>
            <span>贷中行为特征 · 9 状态机分布（9 正常 + 4 异常 = 13 态，严格对齐文档 D.4）</span>
            <a-tag color="arcoblue" size="small">MIDLOAN-FEAT-*</a-tag>
          </a-space>
        </template>
        <a-row :gutter="12">
          <a-col :span="4"><div class="mo-cell mo-total"><div class="mo-num">{{ midloanStats.total }}</div><div class="mo-label">贷中行为特征总数</div></div></a-col>
          <a-col :span="4"><div class="mo-cell mo-online"><div class="mo-num">{{ midloanStats.online }}</div><div class="mo-label">已上线（含灰度）</div></div></a-col>
          <a-col :span="4"><div class="mo-cell mo-syncing"><div class="mo-num">{{ midloanStats.syncing }}</div><div class="mo-label">同步中（内数+变量中心）</div></div></a-col>
          <a-col :span="4"><div class="mo-cell mo-developing"><div class="mo-num">{{ midloanStats.developing }}</div><div class="mo-label">开发/验收/上线流程</div></div></a-col>
          <a-col :span="4"><div class="mo-cell mo-failed"><div class="mo-num">{{ midloanStats.failed }}</div><div class="mo-label">同步失败（需重试）</div></div></a-col>
        </a-row>
      </a-card>

      <DmtStatGroup v-if="activeTab === 'features'" :items="statItems" />

      <div v-if="activeTab === 'features'" class="view-mode-bar">
        <a-radio-group
          v-model="viewMode"
          type="button"
          size="large"
          @change="handleViewModeChange"
        >
          <a-radio value="all">全部视图</a-radio>
          <a-radio value="effect">效果视角</a-radio>
          <a-radio value="cost">成本视角</a-radio>
        </a-radio-group>
        <div class="view-mode-hint">
          <template v-if="viewMode === 'effect'">
            按 IV（信息价值）降序排列，关注变量区分度
          </template>
          <template v-else-if="viewMode === 'cost'">
            按月均成本降序排列，关注高成本变量
          </template>
          <template v-else>
            完整列表视图，按更新时间倒序
          </template>
        </div>
      </div>

      <!-- 状态过滤已合并到筛选区 <a-form-item label="状态">下拉，无需重复实现 -->

      <a-card v-if="activeTab === 'features'" class="filter-card">
        <a-form :model="filterForm" layout="inline">
          <a-form-item label="品类">
            <a-select
              v-model="filterForm.riskCategory"
              placeholder="全部品类"
              allow-clear
              @change="handleSearch"
            >
              <a-option v-for="opt in RISK_CATEGORY_OPTIONS" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </a-option>
            </a-select>
          </a-form-item>
          <a-form-item label="变量类型">
            <a-select
              v-model="filterForm.type"
              placeholder="全部类型"
              allow-clear
              @change="handleSearch"
            >
              <a-option value="numerical">数值型</a-option>
              <a-option value="categorical">分类型</a-option>
              <a-option value="text">文本型</a-option>
              <a-option value="datetime">时间型</a-option>
              <a-option value="boolean">布尔型</a-option>
            </a-select>
          </a-form-item>
          <a-form-item label="状态">
            <a-select
              v-model="filterForm.status"
              placeholder="全部状态"
              allow-clear
              @change="handleSearch"
            >
              <a-option v-for="opt in MIDLOAN_STATUS_FILTER_OPTIONS" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </a-option>
            </a-select>
          </a-form-item>
          <a-form-item label="一级分类">
            <a-select
              v-model="filterForm.l1Category"
              placeholder="全部一级分类"
              allow-clear
              @change="onL1CategoryChange"
            >
              <a-option v-for="opt in MIDLOAN_L1_CATEGORIES" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </a-option>
            </a-select>
          </a-form-item>
          <a-form-item label="二级分类">
            <a-select
              v-model="filterForm.l2Category"
              placeholder="全部二级分类"
              allow-clear
              :disabled="!filterForm.l1Category"
              @change="handleSearch"
            >
              <a-option v-for="opt in l2CategoryOptionsForFilter" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </a-option>
            </a-select>
          </a-form-item>
          <a-form-item>
            <a-button @click="handleReset">重置</a-button>
            <a-button style="margin-left: 8px" @click="openSaveViewModal">保存视图</a-button>
            <a-dropdown trigger="click" @select="handleSelectSavedView">
              <a-link style="margin-left: 12px">已保存视图（{{ savedViews.length }}）</a-link>
              <template #content>
                <a-doption v-if="!savedViews.length" value="__empty" disabled>暂无保存的视图</a-doption>
                <a-doption v-for="item in savedViews" :key="item.id" :value="item.id">
                  {{ item.name }} ({{ item.filters.type || '全部' }} / {{ item.filters.status || '全部' }})
                </a-doption>
              </template>
            </a-dropdown>
            <a-link style="margin-left: 12px" @click="router.push('/explore/taxonomy')">管理变量类型/分类</a-link>
          </a-form-item>
        </a-form>
      </a-card>

      <a-card v-if="activeTab === 'features'" class="table-card">
        <a-space class="batch-toolbar" align="center" wrap>
          <a-space wrap>
            <a-tag :color="overSelectionLimit ? 'red' : 'arcoblue'">
              已选 {{ selectedRowKeys.length }} / {{ SELECTION_LIMIT }} 个变量{{ overSelectionLimit ? '（超过上限）' : '' }}
            </a-tag>
            <a-alert v-if="overSelectionLimit" type="warning" :show-icon="false">
              建议分批（单次 ≤ 200），可在「保存视图」后分次执行批量动作
            </a-alert>
            <span class="batch-hint" v-else>可勾选变量发起探索课题或评估任务。</span>
          </a-space>
          <a-space>
            <!-- ========== 批量入口已合并到下方「批量操作」dropdown（用户反馈）============ -->
          </a-space>
        </a-space>

        <a-modal
          v-model:visible="incrementalModalVisible"
          title="导入更新变量"
          width="600px"
          @ok="confirmIncrementalUpload"
          @cancel="incrementalModalVisible = false"
        >
          <a-upload :auto-upload="false" :limit="1" :accept="'.xlsx,.xls'" @change="handleIncrementalFileChange">
            <a-button>选择Excel文件</a-button>
          </a-upload>
          <div style="margin-top: 12px">已解析记录数：{{ incrementalFileCount }}</div>
        </a-modal>

    <!-- ============ 新增变量（B1 完整注册表单 / 即「注册为变量」入口）============ -->
    <VariableRegisterDrawer
      v-model:visible="registerDrawerVisible"
      :existing-names="existingFeatureNames"
      :existing-cn-names="existingFeatureCnNames"
      @submit="handleRegisterSubmit"
      @save-draft="handleRegisterSaveDraft"
    />

    <!-- ============ 列表页通用 Action 抽屉（提交OA/发起验收/验收驳回）============ -->
    <MidloanActionDrawer
      :visible="actionDrawerVisible"
      :action-key="actionDrawerKey"
      :variable-data="actionDrawerRecord"
      @update:visible="actionDrawerVisible = $event"
      @submit="handleActionDrawerSubmit"
    />

    <!-- 保存视图弹窗 -->
    <a-modal
      v-model:visible="saveViewVisible"
      title="保存当前筛选视图"
      ok-text="保存"
      cancel-text="取消"
      @ok="confirmSaveView"
    >
      <a-form :model="saveViewForm" layout="vertical">
        <a-form-item label="视图名称" required>
          <a-input v-model="saveViewForm.name" placeholder="例如：风控外数待评估" />
        </a-form-item>
        <a-form-item label="说明">
          <a-textarea v-model="saveViewForm.description" :max-length="100" show-word-limit placeholder="可选：用途说明" />
        </a-form-item>
        <a-alert type="info" :show-icon="false">
          保存当前筛选条件：关键词 / 类型 / 状态 / 数据源。后续可在「已保存视图」快速恢复。
        </a-alert>
      </a-form>
    </a-modal>

        <a-modal
          v-model:visible="batchTopicVisible"
          title="批量发起探索课题"
          ok-text="创建课题"
          cancel-text="取消"
          @ok="submitBatchTopic"
        >
          <a-form :model="batchTopicForm" layout="vertical">
            <a-alert class="batch-modal-alert" :show-icon="false">
              将基于已选 {{ selectedRows.length }} 个变量创建 1 个探索课题，并自动挂接数据源与关联变量。
            </a-alert>
            <a-form-item label="课题名称">
              <a-input v-model="batchTopicForm.name" placeholder="例如：行为变量批量探索_202606" />
            </a-form-item>
            <a-form-item label="业务问题">
              <a-textarea v-model="batchTopicForm.businessProblem" :max-length="120" show-word-limit />
            </a-form-item>
            <a-form-item label="变量假设">
              <a-textarea v-model="batchTopicForm.hypothesis" :max-length="120" show-word-limit />
            </a-form-item>
            <a-form-item label="业务域">
              <a-select v-model="batchTopicForm.domain" :options="domainOptions" />
            </a-form-item>
            <a-form-item label="目标变量类型">
              <a-select v-model="batchTopicForm.variableTypeId" allow-clear :options="variableTypeOptions" placeholder="可选，混合变量时可暂不指定" />
            </a-form-item>
            <a-form-item label="探索分类">
              <a-select v-model="batchTopicForm.exploreCategoryId" allow-clear :options="categoryOptions" placeholder="按变量类型选择探索分类" />
            </a-form-item>
            <a-form-item label="可见性">
              <a-select v-model="batchTopicForm.visibility" :options="visibilityOptions" />
            </a-form-item>
          </a-form>
        </a-modal>

        <a-modal
          v-model:visible="batchEvaluationVisible"
          title="批量发起评估"
          ok-text="创建任务"
          cancel-text="取消"
          @ok="submitBatchEvaluation"
        >
          <a-form :model="batchEvaluationForm" layout="vertical">
            <a-alert class="batch-modal-alert" :show-icon="false">
              任务将进入“评估任务中心”，可继续执行 mock 运行并查看覆盖率、IV、KS 等结果摘要。
            </a-alert>
            <a-form-item label="任务名称">
              <a-input v-model="batchEvaluationForm.name" placeholder="例如：外数变量批量准入评估" />
            </a-form-item>
            <a-form-item label="任务类型">
              <a-select v-model="batchEvaluationForm.taskType" :options="taskTypeOptions" />
            </a-form-item>
            <a-form-item label="任务说明">
              <a-textarea v-model="batchEvaluationForm.description" :max-length="120" show-word-limit />
            </a-form-item>
          </a-form>
        </a-modal>

        <!-- ========== 批量操作栏（移到表格上方 · 用户反馈）============ -->
        <div v-if="selectedRows.length > 0" class="batch-action-bar batch-action-bar-top">
          <a-space>
            <span class="batch-count">
              <icon-check-circle /> 已选 <strong>{{ selectedRows.length }}</strong> 项
            </span>
            <a-divider direction="vertical" />
            <span class="batch-status-summary">
              状态分布：
              <a-tag v-for="(count, status) in selectedStatusSummary" :key="status" :color="getMidloanStatusColor(status)" size="small">
                {{ getMidloanStatusLabel(status) }} × {{ count }}
              </a-tag>
            </span>
            <a-divider direction="vertical" />
            <a-dropdown trigger="click">
              <a-button type="primary" size="small" :disabled="!selectedRows.length">
                批量操作
                <icon-down />
              </a-button>
              <template #content>
                <!-- ========== 综合批量操作（合并探索课题/评估/状态机）============ -->
                <!-- 探索课题（≥2 项可发起）-->
                <a-doption
                  :disabled="selectedRows.length < 2"
                  @click="openBatchTopicModal"
                >
                  <icon-link /> 批量发起探索课题
                  <a-tag v-if="selectedRows.length < 2" color="gray" size="mini" style="margin-left: 8px">需 ≥2 项</a-tag>
                  <a-tag v-else size="mini" style="margin-left: 8px">（{{ selectedRows.length }} 项）</a-tag>
                </a-doption>
                <!-- 评估任务（≥2 项可发起）-->
                <a-doption
                  :disabled="selectedRows.length < 2"
                  @click="openBatchEvaluationModal"
                >
                  <icon-chart /> 批量发起评估
                  <a-tag v-if="selectedRows.length < 2" color="gray" size="mini" style="margin-left: 8px">需 ≥2 项</a-tag>
                  <a-tag v-else size="mini" style="margin-left: 8px">（{{ selectedRows.length }} 项）</a-tag>
                </a-doption>
                <a-divider style="margin: 4px 0" />
                <!-- 状态机动态操作 -->
                <template v-for="batchAction in getBatchAvailableActions()" :key="batchAction.key">
                  <a-doption @click="handleBatchAction(batchAction)">
                    <icon-right /> {{ batchAction.label }}
                    <span style="margin-left: 8px; color: var(--color-text-3); font-size: 12px;">
                      ({{ batchAction.matchCount }} 条)
                    </span>
                  </a-doption>
                </template>
                <a-doption v-if="getBatchAvailableActions().length === 0" disabled>
                  当前选中的变量无状态机批量操作
                </a-doption>
              </template>
            </a-dropdown>
            <a-button size="small" @click="clearSelection">取消选择</a-button>
          </a-space>
        </div>

        <a-table
          :data="displayList"
          :columns="columns"
          :loading="loading"
          :pagination="pagination"
          :row-selection="rowSelection"
          row-key="id"
          @selection-change="handleSelectionChange"
          @page-change="handlePageChange"
        >
          <template #name="{ record }">
            <a-link @click="handleViewDetail(record)">{{ record.name }}</a-link>
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
          <template #categoryCell="{ record }">
            <a-tag :color="getRiskCategoryColor(record.category)">
              {{ getRiskCategoryLabel(record.category) }}
            </a-tag>
          </template>
          <template #midloanStatusCell="{ record }">
            <a-space :size="4" wrap>
              <a-tag :color="getMidloanStatusColor(record.midloanStatus || record.status)" size="small">
                {{ getMidloanStatusLabel(record.midloanStatus || record.status) }}
              </a-tag>
              <!-- 有 main 操作：金色 tag（点击跳转详情）-->
              <a-tooltip v-if="record.actionHint" :content="`去详情页执行：${record.actionHint}`">
                <a-tag color="gold" size="mini" style="cursor: pointer" @click="handleQuickAction(record)">
                  <icon-right /> {{ record.actionHint }}
                </a-tag>
              </a-tooltip>
              <!-- 无操作：灰色占位（明确表达"无操作"）-->
              <a-tag v-else color="gray" size="mini" style="opacity: 0.65">
                {{ getStatusDescription(record.midloanStatus || record.status) }}
              </a-tag>
            </a-space>
          </template>
          <template #l1CategoryCell="{ record }">
            <a-tag color="arcoblue" size="small">{{ l1CategoryLabel(record.l1Category) }}</a-tag>
          </template>
          <template #l2CategoryCell="{ record }">
            <span>{{ record.l2Category || '—' }}</span>
          </template>

          <!-- 效果视角列渲染 -->
          <template #ivCell="{ record }">
            <span class="effect-number">{{ record.effectMetrics?.iv?.toFixed(2) ?? '—' }}</span>
            <span v-if="getEffectLevel(record.effectMetrics?.iv, 'iv')" class="effect-badge" :class="`effect-${getEffectLevel(record.effectMetrics?.iv, 'iv')}`">
              {{ getEffectLevelLabel(record.effectMetrics?.iv, 'iv') }}
            </span>
          </template>
          <template #ksCell="{ record }">
            <span class="effect-number">{{ record.effectMetrics?.ks?.toFixed(2) ?? '—' }}</span>
          </template>
          <template #aucCell="{ record }">
            <span class="effect-number">{{ record.effectMetrics?.auc?.toFixed(2) ?? '—' }}</span>
          </template>
          <template #coverageCell="{ record }">
            <span class="effect-number">{{ ((record.effectMetrics?.coverage || 0) * 100).toFixed(0) }}%</span>
          </template>
          <template #liftCell="{ record }">
            <span v-if="record.effectMetrics?.lift != null" :class="['lift', record.effectMetrics.lift >= 0 ? 'lift-up' : 'lift-down']">
              {{ record.effectMetrics.lift >= 0 ? '+' : '' }}{{ record.effectMetrics.lift }}%
            </span>
            <span v-else>—</span>
          </template>

          <!-- 成本视角列渲染 -->
          <template #priceCell="{ record }">
            <span v-if="record.costMetrics?.pricePerCall > 0">¥{{ record.costMetrics.pricePerCall.toFixed(2) }}</span>
            <a-tag v-else color="green" size="small">内部数据</a-tag>
          </template>
          <template #callsCell="{ record }">
            <span>{{ formatNumber(record.costMetrics?.monthlyCalls) }}</span>
          </template>
          <template #monthlyCostCell="{ record }">
            <span v-if="record.costMetrics?.monthlyCost > 0" class="cost-highlight">¥{{ formatNumber(record.costMetrics.monthlyCost) }}</span>
            <span v-else class="cost-zero">¥0</span>
          </template>
          <template #trendCell="{ record }">
            <a-tag v-if="record.costMetrics?.costTrend === 'up'" color="red" size="small">↑ 上升</a-tag>
            <a-tag v-else-if="record.costMetrics?.costTrend === 'down'" color="green" size="small">↓ 下降</a-tag>
            <a-tag v-else color="gray" size="small">— 平稳</a-tag>
          </template>

          <template #actions="{ record }">
            <a-space wrap>
              <!-- ========== 顶层快捷按钮（用户反馈：操作×状态映射） ========== -->
              <template v-for="action in getTableTopActions(record)" :key="action.key">
                <a-tooltip
                  v-if="action.key === 'edit'"
                  :content="canEdit(record.midloanStatus || record.status)
                    ? '编辑变量信息'
                    : `编辑受限：${getEditLockReason(record.midloanStatus || record.status)}`"
                >
                  <a-button
                    type="text"
                    size="small"
                    :disabled="!canEdit(record.midloanStatus || record.status)"
                    @click="handleTableAction(record, action)"
                  >
                    {{ action.label }}
                  </a-button>
                </a-tooltip>
                <a-button
                  v-else
                  type="text"
                  size="small"
                  :status="action.type === 'warning' ? 'warning' : (action.type === 'danger' ? 'danger' : 'normal')"
                  @click="handleTableAction(record, action)"
                >
                  {{ action.label }}
                </a-button>
              </template>

              <!-- ========== 主流程操作 dropdown（用户反馈：动态操作下沉到列表页） ========== -->
              <a-dropdown
                v-if="getTableMainActions(record).length > 0"
                trigger="click"
              >
                <a-button type="text" size="small">
                  更多操作
                  <icon-down />
                </a-button>
                <template #content>
                  <a-doption
                    v-for="mainAction in getTableMainActions(record)"
                    :key="mainAction.key"
                    @click="handleMainFlowAction(record, mainAction)"
                  >
                    {{ mainAction.label }}
                  </a-doption>
                </template>
              </a-dropdown>
            </a-space>
          </template>
        </a-table>
    </a-card>

      <!-- ========== 衍生需求 Tab 内容 ========== -->
      <a-card v-if="activeTab === 'derivations'" class="derivation-card">
        <a-space class="derivation-toolbar" align="center" wrap>
          <a-space wrap>
            <span class="derivation-tip">
              <icon-info-circle /> 衍生需求是特征台账的入口。一期聚焦「贷中行为」品类，需求流转：
              <a-tag color="gray" size="small">待开发</a-tag>
              <icon-right />
              <a-tag color="blue" size="small">开发中</a-tag>
              <icon-right />
              <a-tag color="arcoblue" size="small">待注册</a-tag>
              <icon-right />
              <a-tag color="green-light" size="small">已注册</a-tag>
            </span>
          </a-space>
          <a-space>
            <a-button @click="openBulkImport">
              <template #icon><icon-upload /></template>
              批量导入
            </a-button>
            <a-button type="primary" @click="openDerivationCreate">
              <template #icon><icon-plus /></template>
              新建衍生需求
            </a-button>
          </a-space>
        </a-space>

        <a-form :model="derivationFilter" layout="inline" class="derivation-filter">
          <a-form-item label="关键词">
            <a-input v-model="derivationFilter.keyword" placeholder="需求ID / 名称 / 特征名" allow-clear @input="refreshDerivations" />
          </a-form-item>
          <a-form-item label="状态">
            <a-select v-model="derivationFilter.status" allow-clear placeholder="全部状态" @change="refreshDerivations">
              <a-option value="pending_dev">待开发</a-option>
              <a-option value="developing">开发中</a-option>
              <a-option value="pending_register">待注册</a-option>
              <a-option value="registered">已注册</a-option>
            </a-select>
          </a-form-item>
          <a-form-item>
            <a-button @click="resetDerivationFilter">重置</a-button>
          </a-form-item>
        </a-form>

        <a-table
          :data="derivationList"
          :columns="derivationColumns"
          :pagination="derivationPagination"
          row-key="id"
          @page-change="(p) => { derivationPagination.current = p }"
        >
          <template #idCell="{ record }">
            <a-link @click="openDerivationDetail(record)">{{ record.id }}</a-link>
          </template>
          <template #statusCell="{ record }">
            <a-tag :color="getDerivationStatusColor(record.status)">
              {{ getDerivationStatusLabel(record.status) }}
            </a-tag>
          </template>
          <template #featureIdCell="{ record }">
            <a-link v-if="record.featureId" @click="goFeatureDetail(record.featureId)">{{ record.featureId }}</a-link>
            <span v-else class="placeholder">—</span>
          </template>
          <template #actions="{ record }">
            <a-space>
              <a-button type="text" size="small" @click="openDerivationDetail(record)">详情</a-button>
              <a-button
                v-if="record.status === 'pending_dev'"
                type="text"
                size="small"
                status="success"
                @click="devTransition(record)"
              >开始开发</a-button>
              <a-button
                v-if="record.status === 'developing'"
                type="text"
                size="small"
                status="success"
                @click="completeDevTransition(record)"
              >完成开发</a-button>
              <a-button
                v-if="record.status === 'pending_register'"
                type="primary"
                size="small"
                @click="goRegister(record)"
              >去注册</a-button>
              <a-button
                v-if="record.status === 'registered' && record.featureId"
                type="text"
                size="small"
                @click="goFeatureDetail(record.featureId)"
              >查看特征</a-button>
            </a-space>
          </template>
        </a-table>
      </a-card>

      <!-- 衍生需求详情抽屉 -->
      <a-drawer
        :visible="derivationDetailVisible"
        :width="720"
        :title="derivationDetail ? `衍生需求详情 · ${derivationDetail.id}` : '衍生需求详情'"
        @cancel="derivationDetailVisible = false"
      >
        <template v-if="derivationDetail">
          <a-descriptions :column="2" :data="derivationDetailDesc" title="基础信息" />
          <a-divider />
          <a-descriptions :column="1" :data="derivationDetailFeatureDesc" title="特征核心属性" />
          <a-divider />
          <a-descriptions :column="2" :data="derivationDetailRegisterDesc" title="注册信息（B1）" />
          <a-divider />
          <a-descriptions :column="1" :data="derivationDetailTimeline" title="状态时间轴" />
        </template>
      </a-drawer>

      <!-- 新建衍生需求弹窗 -->
      <DerivationCreateModal
        v-if="derivationCreateVisible"
        :visible="derivationCreateVisible"
        @ok="onDerivationCreated"
        @cancel="derivationCreateVisible = false"
      />

      <!-- 批量导入衍生需求弹窗（A1 R19） -->
      <BulkImportDerivationModal
        v-if="bulkImportVisible"
        :visible="bulkImportVisible"
        @ok="onBulkImport"
        @cancel="bulkImportVisible = false"
      />

      <!-- B1 注册弹窗（旅程 2 关键） -->
      <DerivationRegisterModal
        v-if="derivationRegisterVisible && derivationRegisterTarget"
        :visible="derivationRegisterVisible"
        :derivation="derivationRegisterTarget"
        @ok="onDerivationRegisterSubmit"
        @cancel="derivationRegisterVisible = false"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Message, Modal } from '@arco-design/web-vue'
import { useVariableStore } from '@/modules/variable-hub/store/variable'
import UserContext from '@/modules/variable-hub/mock/risk-feature/permissions'
import MidloanStateEngine from '@/modules/variable-hub/mock/risk-feature/stateEngine'
import { incrementalImportVariables, getDataSources } from '@/modules/variable-hub/api/variable-management'
import * as XLSX from 'xlsx'
import { buildRiskAppUrl } from '@/utils/appLinks'
import { VariableDraftStore } from '@/modules/variable-hub/mock/variable-management/variable-draft-store'
import { VariableStatusStore } from '@/modules/variable-hub/mock/variable-management/variable-status-store'
import { variableStatus } from '@/modules/variable-hub/constants/statusMap'
import DmtPageHeader from '@/modules/variable-hub/components/PageHeader.vue'
import DmtStatGroup from '@/modules/variable-hub/components/StatGroup.vue'
import { ExploreStore } from '@/modules/variable-hub/mock/explore/explore-store'
import { RISK_CATEGORY_OPTIONS, MIDLOAN_L1_CATEGORIES } from '@/modules/variable-hub/constants/riskCategoryMap'
import { midloanStatusLabel, midloanStatusColor, allowedActionsByStatus, canEdit, getEditLockReason, tableActionsByStatus } from '@/modules/variable-hub/constants/midloanStatusMap'
import { riskCategoryLabel, riskCategoryColor } from '@/modules/variable-hub/constants/riskCategoryMap'
import DerivationStore from '@/modules/variable-hub/mock/risk-feature/derivations'
import DerivationCreateModal from '@/modules/variable-hub/components/risk-feature/DerivationCreateModal.vue'
import BulkImportDerivationModal from '@/modules/variable-hub/components/risk-feature/BulkImportDerivationModal.vue'
import DerivationRegisterModal from '@/modules/variable-hub/components/risk-feature/DerivationRegisterModal.vue'
import VariableRegisterDrawer from '@/modules/variable-hub/components/risk-feature/VariableRegisterDrawer.vue'
import MidloanActionDrawer from '@/modules/variable-hub/components/risk-feature/MidloanActionDrawer.vue'
import { ExploreTaxonomyStore } from '@/modules/variable-hub/mock/explore/explore-taxonomy-store'
import EvaluationTaskStore from '@/modules/variable-hub/mock/evaluation/evaluation-task-store'

const router = useRouter()
const route = useRoute()

// ============ 处理从课题页跳转的 query.action=create_derivation ============
// 关键修复：mount 时同步处理 + nextTick 推后到 modal 渲染后再清理 query
let derivationActionHandled = false
const handleDerivationAction = () => {
  if (route.query.action === 'create_derivation' && !derivationActionHandled) {
    derivationActionHandled = true
    nextTick(() => {
      derivationCreateVisible.value = true
      // modal 弹出后再清理 query
      nextTick(() => {
        router.replace({ path: route.path, query: {} })
      })
    })
  }
}
// 在 onMounted 中调用（不在 watch immediate 中）
// 同时保留 watch 响应后续导航（比如用户从其他页面再带这个 query 进来）
const variableStore = useVariableStore()

// 当前 Tab
const activeTab = ref('features')

const stats = computed(() => variableStore.variableStats)

const statItems = computed(() => [
  { title: '变量总数', value: stats.value.total, iconText: '#', iconBg: '#f0f7ff', iconColor: '#165dff', subtitle: '当前台账' },
  { title: '活跃变量', value: stats.value.active, tag: 'active', tagColor: 'green', iconText: '✓', iconBg: '#e8ffea', iconColor: '#00b42a', subtitle: '已发布可用' },
  { title: '待审核', value: stats.value.pending, tag: 'pending', tagColor: 'orange', iconText: '!', iconBg: '#fff7e8', iconColor: '#ff7d00', subtitle: '审批中' },
  { title: '已停用', value: stats.value.inactive, iconText: '×', iconBg: '#fff1f0', iconColor: '#f53f3f', subtitle: '已停用/归档' }
])

// 贷中行为品类 9 状态机统计（仅当选择"贷中行为"时显示）
const midloanStats = computed(() => {
  const list = (variableStore.variableList || []).filter((v) => v.category === 'midloan_behavior')
  const groups = {}
  list.forEach((v) => {
    const k = v.midloanStatus || 'unknown'
    groups[k] = (groups[k] || 0) + 1
  })
  return {
    total: list.length,
    // 已上线
    online: groups.online || 0,
    syncing: (groups.syncing_internal || 0) + (groups.syncing_variable || 0),
    failed: (groups.internal_sync_failed || 0) + (groups.variable_sync_failed || 0) + (groups.dw_online_failed || 0) + (groups.offline_failed || 0),
    developing: (groups.registered || 0) + (groups.developing_oa || 0) + (groups.dw_online || 0) + (groups.pending_verify || 0) + (groups.verified || 0)
  }
})

const filterForm = reactive({
  keyword: '',
  riskCategory: '',
  type: '',
  status: '',
  l1Category: '',
  l2Category: ''
})

// 视图模式：all / effect / cost
const viewMode = ref('all')

const dataSources = ref([])
const variableList = computed(() => {
  let list = variableStore.filteredVariables || []
  // 品类过滤（在前端层面叠加，不动 store 以保持最小改动）
  if (filterForm.riskCategory) {
    list = list.filter((item) => {
      // 旧数据 category 与新 midloan_behavior 的映射
      if (filterForm.riskCategory === 'midloan_behavior') {
        return item.category === 'midloan_behavior' || item.category === 'behavior'
      }
      return item.category === filterForm.riskCategory
    })
  }
  // 一级分类过滤
  if (filterForm.l1Category) {
    list = list.filter((item) => item.l1Category === filterForm.l1Category)
  }
  // 二级分类过滤
  if (filterForm.l2Category) {
    list = list.filter((item) => item.l2Category === filterForm.l2Category)
  }
  if (viewMode.value === 'effect') {
    return [...list].sort((a, b) => (b.effectMetrics?.iv || 0) - (a.effectMetrics?.iv || 0))
  }
  if (viewMode.value === 'cost') {
    return [...list].sort((a, b) => (b.costMetrics?.monthlyCost || 0) - (a.costMetrics?.monthlyCost || 0))
  }
  return list
})
const loading = computed(() => variableStore.variableLoading)

const selectedRowKeys = ref([])
const selectedRows = ref([])

const handleViewModeChange = () => {
  // 切换视图时清空已选，避免跨视图选择混淆
  selectedRowKeys.value = []
  selectedRows.value = []
}

// 全局搜索（顶部常驻）
const globalKeyword = ref('')
const handleGlobalSearch = () => {
  filterForm.keyword = globalKeyword.value
  pagination.current = 1
  fetchVariableList()
}

// 多选上限：单次最多 200，超出提示并自动截断
const SELECTION_LIMIT = 200
const overSelectionLimit = computed(() => selectedRowKeys.value.length > SELECTION_LIMIT)

// 已保存视图
const savedViews = ref([])
const VIEW_STORAGE_KEY = 'variable.management.savedViews'
const loadSavedViews = () => {
  try {
    const raw = localStorage.getItem(VIEW_STORAGE_KEY)
    savedViews.value = raw ? JSON.parse(raw) : []
  } catch {
    savedViews.value = []
  }
}
loadSavedViews()

const saveViewVisible = ref(false)
const saveViewForm = reactive({ name: '', description: '' })

const openSaveViewModal = () => {
  saveViewForm.name = ''
  saveViewForm.description = ''
  saveViewVisible.value = true
}

const confirmSaveView = () => {
  if (!saveViewForm.name.trim()) {
    Message.warning('请输入视图名称')
    return false
  }
  const view = {
    id: `VIEW-${Date.now()}`,
    name: saveViewForm.name.trim(),
    description: saveViewForm.description.trim(),
    filters: { ...filterForm, keyword: globalKeyword.value }, // 不再保存 dataSource
    createdAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
  }
  savedViews.value = [view, ...savedViews.value]
  localStorage.setItem(VIEW_STORAGE_KEY, JSON.stringify(savedViews.value))
  Message.success(`已保存视图：${view.name}`)
  return true
}

const handleSelectSavedView = (val) => {
  if (val === '__empty') return
  const view = savedViews.value.find((v) => v.id === val)
  if (!view) return
  globalKeyword.value = view.filters.keyword || ''
  filterForm.keyword = view.filters.keyword || ''
  filterForm.type = view.filters.type || ''
  filterForm.status = view.filters.status || ''
  filterForm.l1Category = view.filters.l1Category || ''
  filterForm.l2Category = view.filters.l2Category || ''
  pagination.current = 1
  fetchVariableList()
  Message.success(`已应用视图：${view.name}`)
}

const rowSelection = computed(() => ({
  type: 'checkbox',
  showCheckedAll: true,
  selectedRowKeys: selectedRowKeys.value
}))

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: true,
  showJumper: true,
  showPageSize: true
})

watch(
  () => variableStore.pagination,
  (p) => {
    pagination.current = p.page
    pagination.pageSize = p.pageSize
    pagination.total = p.total
  },
  { deep: true, immediate: true }
)

const columnsAll = [
  { title: '变量名称', dataIndex: 'name', slotName: 'name', width: 200 },
  { title: '变量编码', dataIndex: 'code', width: 180 },
  { title: '品类', dataIndex: 'category', slotName: 'categoryCell', width: 110 },
  { title: '类型', dataIndex: 'type', slotName: 'type', width: 100 },
  { title: '状态', dataIndex: 'midloanStatus', slotName: 'midloanStatusCell', width: 180 },
  { title: '一级分类', dataIndex: 'l1Category', slotName: 'l1CategoryCell', width: 110 },
  { title: '二级分类', dataIndex: 'l2Category', slotName: 'l2CategoryCell', width: 130 },
  { title: '创建人', dataIndex: 'creator', width: 120 },
  { title: '创建时间', dataIndex: 'createdAt', width: 180 },
  { title: '操作', dataIndex: 'actions', slotName: 'actions', width: 180, fixed: 'right' }
]

const columnsEffect = [
  { title: '变量名称', dataIndex: 'name', slotName: 'name', width: 200 },
  { title: '类型', dataIndex: 'type', slotName: 'type', width: 100 },
  { title: '状态', dataIndex: 'midloanStatus', slotName: 'midloanStatusCell', width: 160 },
  { title: 'IV', dataIndex: 'effectMetrics', slotName: 'ivCell', width: 100, align: 'right' },
  { title: 'KS', dataIndex: 'effectMetrics', slotName: 'ksCell', width: 100, align: 'right' },
  { title: 'AUC', dataIndex: 'effectMetrics', slotName: 'aucCell', width: 100, align: 'right' },
  { title: '覆盖率', dataIndex: 'effectMetrics', slotName: 'coverageCell', width: 100, align: 'right' },
  { title: '提升度', dataIndex: 'effectMetrics', slotName: 'liftCell', width: 100, align: 'right' },
  { title: '操作', dataIndex: 'actions', slotName: 'actions', width: 180, fixed: 'right' }
]

const columnsCost = [
  { title: '变量名称', dataIndex: 'name', slotName: 'name', width: 200 },
  { title: '类型', dataIndex: 'type', slotName: 'type', width: 100 },
  { title: '状态', dataIndex: 'midloanStatus', slotName: 'midloanStatusCell', width: 160 },
  { title: '单价(元/次)', dataIndex: 'costMetrics', slotName: 'priceCell', width: 120, align: 'right' },
  { title: '月均调用', dataIndex: 'costMetrics', slotName: 'callsCell', width: 130, align: 'right' },
  { title: '月均成本', dataIndex: 'costMetrics', slotName: 'monthlyCostCell', width: 140, align: 'right' },
  { title: '趋势', dataIndex: 'costMetrics', slotName: 'trendCell', width: 90 },
  { title: '操作', dataIndex: 'actions', slotName: 'actions', width: 180, fixed: 'right' }
]

const columns = computed(() => {
  if (viewMode.value === 'effect') return columnsEffect
  if (viewMode.value === 'cost') return columnsCost
  return columnsAll
})

const typeMap = {
  numerical: { label: '数值型', color: 'blue' },
  categorical: { label: '分类型', color: 'green' },
  text: { label: '文本型', color: 'orange' },
  datetime: { label: '时间型', color: 'purple' },
  boolean: { label: '布尔型', color: 'cyan' }
}

/**
 * IV 等级：
 *  - < 0.02 弱
 *  - 0.02~0.1 中
 *  - 0.1~0.3 强
 *  - >= 0.3 极强
 */
const getEffectLevel = (value, key) => {
  if (value == null) return ''
  if (key === 'iv') {
    if (value >= 0.3) return 'strong'
    if (value >= 0.1) return 'medium'
    if (value >= 0.02) return 'weak'
    return 'low'
  }
  return ''
}

const getEffectLevelLabel = (value, key) => {
  const level = getEffectLevel(value, key)
  if (key === 'iv') {
    return { strong: '强', medium: '中', weak: '弱', low: '低' }[level] || ''
  }
  return ''
}

/**
 * 数字千分位格式化
 */
const formatNumber = (value) => {
  if (value == null) return '—'
  return Number(value).toLocaleString('zh-CN')
}

// 当前角色（每次渲染读取，不做响应式追踪，避免 Layout 循环）
// 切换角色会触发 DemoConsole 的 user-context-changed 事件
// 我们直接读取 UserContext.get().role 而不订阅，避免循环
const displayList = computed(() => {
  const list = variableList.value || []
  const role = UserContext.get().role
  return list.map(record => {
    const status = record.midloanStatus || record.status
    const all = allowedActionsByStatus(status, record, role)
    const mainActions = all.filter(a => a.category !== 'demo')

    // 去重：若顶层按钮已展示该 action（如 online 的「申请下线」），
    // 则不在状态 tag 上重复显示 hint，避免视觉冗余
    const { topActions } = tableActionsByStatus(status, record, role)
    const topKeys = new Set(topActions.map(a => a.key))
    const dedupedMain = mainActions.filter(a => !topKeys.has(a.key))

    return {
      ...record,
      actionHint: dedupedMain.length > 0 ? dedupedMain[0].label : ''
    }
  })
})

/**
 * 获取状态的简短描述（用于无操作时的灰色占位标签）
 */
const getStatusDescription = (status) => {
  const map = {
    developing_oa: '数仓开发中',
    pending_verify: '验收人处理中',
    syncing_internal: '同步内数中',
    syncing_variable: '同步变量中心中',
    offline: '已归档（终态）'
  }
  return map[status] || '无操作'
}

/**
 * 表格内的状态列快捷操作处理
 * 直接跳转详情页（详情页已有完整操作按钮）
 */
const handleQuickAction = (record) => {
  handleViewDetail(record)
}

/**
 * 获取某行变量在当前状态+角色下的顶层快捷操作
 * （用户反馈：操作×状态映射）
 */
const getTableTopActions = (record) => {
  const status = record.midloanStatus || record.status
  const role = UserContext.get().role
  const { topActions } = tableActionsByStatus(status, record, role)
  return topActions
}

/**
 * 获取某行变量在当前状态+角色下的主流程操作（dropdown）
 * （用户反馈：动态操作下沉到列表页）
 */
const getTableMainActions = (record) => {
  const status = record.midloanStatus || record.status
  const role = UserContext.get().role
  const { mainActions } = tableActionsByStatus(status, record, role)
  return mainActions
}

/**
 * 主流程操作点击处理（在列表页直接弹出抽屉/直接执行）
 */
const handleMainFlowAction = (record, action) => {
  // 主流程操作（submit_dev_oa/submit_verify/verify_pass/verify_reject/
  // start_online/retry_dw/manual_batch_retry）直接在列表页触发
  triggerTableAction(record, action)
}

/**
 * 操作按钮点击处理
 */
const handleTableAction = (record, action) => {
  triggerTableAction(record, action)
}

/**
 * 统一的表格 action 触发入口
 * 1. 需要抽屉的 action（submit_dev_oa / submit_verify / verify_reject）→ 弹 MidloanActionDrawer
 * 2. 直接执行的 action（verify_pass / start_online / retry_sync / retry_dw / manual_batch_retry / simulate_*）→ 直接调用 stateEngine
 * 3. 详情 / 编辑 / 补充数据底表 / 外数档案 / 评估 / 血缘 / 变更记录 → 跳转到详情页对应 Tab
 */
const triggerTableAction = (record, action) => {
  const status = record.midloanStatus || record.status
  const drawerActions = ['submit_dev_oa', 'submit_verify', 'verify_reject']

  if (drawerActions.includes(action.key)) {
    // 在列表页直接弹抽屉
    actionDrawerRecord.value = record
    actionDrawerKey.value = action.key
    actionDrawerVisible.value = true
    return
  }

  // 直接执行类操作
  const directActions = {
    verify_pass: () => Message.success('验收通过已记录'),
    start_online: () => Message.success('已发起上线流程'),
    retry_sync: () => Message.success('已触发重新同步'),
    retry_dw: () => Message.success('已触发重新触发数仓任务'),
    manual_batch_retry: () => Message.success('已触发手动批次重试'),
    simulate_dw_success: () => Message.success('已模拟数仓成功'),
    simulate_dw_success_dw: () => Message.success('已模拟数仓成功（DW回调）'),
    simulate_dw_failed: () => Message.success('已模拟数仓失败')
  }

  if (directActions[action.key]) {
    const result = MidloanStateEngine.handleAction(record.id, action.key, {
      operator: UserContext.get().name || '小李'
    })
    if (result?.ok) {
      directActions[action.key]()
      fetchVariableList()
    } else {
      Message.error(result?.reason || '执行失败')
    }
    return
  }

  // 跳转类操作
  switch (action.key) {
    case 'view_detail':
      handleViewDetail(record)
      break
    case 'edit':
      handleEdit(record)
      break
    case 'supplement_table':
      // 跳详情页补充数据底表（带 query，详情页自动定位）
      handleViewDetail(record, { tab: 'basic', focusField: 'dataTableName' })
      Message.info('请到变量详情页补充数据底表')
      break
    case 'external_archive':
      openExternalArchive(record)
      break
    case 'line_usage':
      handleViewDetail(record, { tab: 'lineage' })
      Message.info('查看血缘与使用场景')
      break
    case 'evaluation':
      handleViewDetail(record, { tab: 'evaluation' })
      Message.info('查看变量评估报告')
      break
    case 'view_change_record':
      handleViewDetail(record, { tab: 'versions' })
      Message.info('查看变更记录')
      break
    default:
      handleViewDetail(record)
  }
}

/**
 * 从表格触发重试（异常态，保留兼容）
 */
const handleRetryFromTable = (record) => {
  const status = record.midloanStatus || record.status
  const map = {
    internal_sync_failed: 'retry_sync',
    variable_sync_failed: 'retry_sync',
    dw_online_failed: 'retry_dw',
    offline_failed: 'manual_batch_retry'
  }
  const actionKey = map[status]
  if (!actionKey) return
  triggerTableAction(record, { key: actionKey })
}

// ============ 列表页通用 Action 抽屉 ============
const actionDrawerVisible = ref(false)
const actionDrawerRecord = ref(null)
const actionDrawerKey = ref('')
const actionDrawerSubmitting = ref(false)

const handleActionDrawerSubmit = (payload) => {
  if (!actionDrawerRecord.value) return
  actionDrawerSubmitting.value = true
  try {
    const result = MidloanStateEngine.handleAction(
      actionDrawerRecord.value.id,
      actionDrawerKey.value,
      { operator: UserContext.get().name || '小李', ...payload }
    )
    if (result?.ok) {
      Message.success('操作成功，状态已更新')
      actionDrawerVisible.value = false
      fetchVariableList()
    } else {
      Message.error(result?.reason || '操作失败')
    }
  } finally {
    actionDrawerSubmitting.value = false
  }
}

const statusMap = {
  draft: { label: '草稿', color: 'gray' },
  pending: { label: '待审核', color: 'orange' },
  active: { label: '已发布', color: 'green' },
  inactive: { label: '已停用', color: 'red' },
  expired: { label: '已过期', color: 'lightgray' }
}

const sourceTypeMap = {
  external: { label: '外数', color: 'arcoblue' },
  internal: { label: '内数', color: 'blue' },
  credit: { label: '征信', color: 'purple' }
}

const domainOptions = [
  { label: '风控', value: '风控' },
  { label: '营销', value: '营销' },
  { label: '反欺诈', value: '反欺诈' },
  { label: '客户画像', value: '客户画像' }
]

const visibilityOptions = [
  { label: '团队内', value: 'team' },
  { label: '全公司可见', value: 'company' },
  { label: '仅审计可见', value: 'audit' }
]

const taskTypeOptions = [
  { label: '准入评估', value: 'access' },
  { label: '复评任务', value: 'recheck' },
  { label: '对比评估', value: 'comparison' }
]

const variableTypeOptions = computed(() =>
  ExploreTaxonomyStore.listTypes().map((item) => ({ label: item.title, value: item.id }))
)

const incrementalModalVisible = ref(false)
const incrementalFileCount = ref(0)
const incrementalRecords = ref([])

const batchTopicVisible = ref(false)
const batchTopicForm = reactive({
  name: '',
  businessProblem: '',
  hypothesis: '',
  domain: '风控',
  visibility: 'team',
  variableTypeId: '',
  exploreCategoryId: ''
})

watch(
  () => batchTopicForm.variableTypeId,
  () => {
    batchTopicForm.exploreCategoryId = ''
  }
)

const categoryOptions = computed(() => {
  if (!batchTopicForm.variableTypeId) return []
  return ExploreTaxonomyStore.listLeafCategories(batchTopicForm.variableTypeId).map((item) => ({
    label: item.title,
    value: item.id
  }))
})

const batchEvaluationVisible = ref(false)
const batchEvaluationForm = reactive({
  name: '',
  taskType: 'access',
  description: ''
})

const getTypeLabel = (type) => typeMap[type]?.label || type
const getTypeColor = (type) => typeMap[type]?.color || 'gray'
const getStatusLabel = (status) => statusMap[status]?.label || status
const getStatusColor = (status) => statusMap[status]?.color || 'gray'
const getSourceTypeLabel = (sourceType) => sourceTypeMap[sourceType]?.label || (sourceType || '—')
const getSourceTypeColor = (sourceType) => sourceTypeMap[sourceType]?.color || 'gray'
// 11 状态机 + 品类辅助函数
const getRiskCategoryLabel = (cat) => riskCategoryLabel(cat)
const getRiskCategoryColor = (cat) => riskCategoryColor(cat)
const getMidloanStatusLabel = (s) => midloanStatusLabel(s)
const getMidloanStatusColor = (s) => midloanStatusColor(s)

// 一级分类标签
const l1CategoryLabel = (key) => {
  const found = MIDLOAN_L1_CATEGORIES.find((c) => c.value === key)
  return found ? found.label : (key || '—')
}

// 状态筛选下拉选项（用 9 状态机常量，严格对齐文档 D.4）
const MIDLOAN_STATUS_FILTER_OPTIONS = [
  { value: 'registered',          label: '已注册',         color: 'blue' },
  { value: 'developing_oa',       label: '数仓开发中',     color: 'purple' },
  { value: 'dw_online',           label: '数仓开发完成',   color: 'cyan-dark' },
  { value: 'pending_verify',      label: '待验收',         color: 'gold' },
  { value: 'verified',            label: '已验收',         color: 'green-light' },
  { value: 'syncing_internal',    label: '内数同步中',     color: 'cyan' },
  { value: 'syncing_variable',    label: '变量中心同步中', color: 'cyan' },
  { value: 'online',              label: '已上线',         color: 'green' },
  { value: 'offline',             label: '已下线',         color: 'darkgray' },
  { value: 'internal_sync_failed', label: '内数同步失败',  color: 'red' },
  { value: 'variable_sync_failed', label: '变量中心同步失败', color: 'red' },
  { value: 'dw_online_failed',    label: '数仓开发失败',   color: 'red' },
  { value: 'offline_failed',      label: '下线接收失败' }
]

// 二级分类动态选项（从现有变量 l2Category 去重）
const l2CategoryOptionsForFilter = computed(() => {
  const set = new Set()
  const all = variableStore.variableList || []
  all.forEach((v) => {
    if (filterForm.l1Category && v.l1Category !== filterForm.l1Category) return
    if (v.l2Category) set.add(v.l2Category)
  })
  return Array.from(set).sort().map((v) => ({ value: v, label: v }))
})

// 切换一级分类时清空二级分类
function onL1CategoryChange() {
  filterForm.l2Category = ''
  handleSearch()
}

function clearSelection() {
  selectedRowKeys.value = []
  selectedRows.value = []
}

function inferVariableTypeId(rows) {
  const mapped = rows
    .map((item) => item.category || (item.sourceType === 'credit' ? 'credit' : item.sourceType === 'external' ? 'external' : 'behavior'))
    .filter(Boolean)
  const unique = [...new Set(mapped)]
  return unique.length === 1 ? unique[0] : ''
}

function buildBatchTopicPrefill() {
  const inferredTypeId = inferVariableTypeId(selectedRows.value)
  const dsLabel = selectedDataSourceLabel.value || '变量'
  batchTopicForm.name = `${dsLabel}_批量探索_${new Date().toISOString().slice(0, 10)}`
  batchTopicForm.businessProblem = `当前从变量台账中选中了 ${selectedRows.value.length} 个变量，需统一评估变量口径、可复用性与补充空间。`
  batchTopicForm.hypothesis = '已选变量可进一步形成组合方案或衍生规则，需在课题内沉淀实验与决策证据链。'
  batchTopicForm.domain = '风控'
  batchTopicForm.visibility = 'team'
  batchTopicForm.variableTypeId = inferredTypeId
  batchTopicForm.exploreCategoryId = ''
}

function buildBatchEvaluationPrefill() {
  batchEvaluationForm.name = `变量批量评估_${new Date().toISOString().slice(0, 10)}`
  batchEvaluationForm.taskType = 'access'
  batchEvaluationForm.description = `基于变量台账已选 ${selectedRows.value.length} 个变量创建 mock 评估任务，后续在任务中心执行并沉淀评估结果。`
}

// 数据源过滤已移除：保留 dataSources 仅用于关联变量来源信息展示
const fetchDataSources = async () => {
  // 兼容性保留：未来如需保留数据源概念，可重新启用
  // try {
  //   const res = await getDataSources()
  //   if (res.code === 200) dataSources.value = res.data || []
  // } catch (e) {}
}

const fetchVariableList = async () => {
  try {
    await variableStore.fetchVariableList({
      page: pagination.current,
      pageSize: pagination.pageSize,
      keyword: filterForm.keyword,
      type: filterForm.type,
      status: filterForm.status
    })
  } catch (error) {
    console.error('获取变量列表失败:', error)
    Message.error('获取变量列表失败')
  }
}

const handleSearch = () => {
  variableStore.updateFilters({
    keyword: filterForm.keyword,
    type: filterForm.type,
    status: filterForm.status
  })
  pagination.current = 1
  clearSelection()
  fetchVariableList()
}

const handleReset = () => {
  filterForm.keyword = ''
  filterForm.type = ''
  filterForm.status = ''
  filterForm.l1Category = ''
  filterForm.l2Category = ''
  variableStore.resetFilters()
  clearSelection()
  handleSearch()
}

const handlePageChange = (page) => {
  pagination.current = page
  clearSelection()
  fetchVariableList()
}

const handleSelectionChange = (keys) => {
  if (keys.length > SELECTION_LIMIT) {
    // 截断：仅保留前 SELECTION_LIMIT 条，提示用户
    const limited = keys.slice(0, SELECTION_LIMIT)
    Message.warning(`单次最多批量操作 ${SELECTION_LIMIT} 个变量，已自动截断超出部分。请保存视图后分批执行。`)
    selectedRowKeys.value = limited
    selectedRows.value = variableList.value.filter((item) => limited.includes(item.id))
    return
  }
  selectedRowKeys.value = keys
  selectedRows.value = variableList.value.filter((item) => keys.includes(item.id))
}

// ============ 批量操作（用户反馈：动态操作是否可以批量提交）============

/**
 * 当前选中记录的状态分布（用于批量操作栏展示）
 */
const selectedStatusSummary = computed(() => {
  const map = {}
  selectedRows.value.forEach(r => {
    const s = r.midloanStatus || r.status
    if (!map[s]) map[s] = 0
    map[s]++
  })
  return map
})

/**
 * 获取当前选中记录可执行的批量操作列表
 * - 遍历 allowedActionsByStatus 找出所有匹配项
 * - 同一个 action key 在不同状态下可能都支持
 * - 过滤白名单（仅主流程+重试类）
 */
const getBatchAvailableActions = () => {
  if (selectedRows.value.length === 0) return []

  const role = UserContext.get().role
  // 文档 K1 明确下线是被动接收（变量中心发起），台账无主动申请下线，故移除 request_offline
  const allowedKeys = [
    'submit_dev_oa',
    'submit_verify',
    'verify_pass',
    'verify_reject',
    'start_online',
    'retry_sync',
    'retry_dw',
    'manual_batch_retry'
  ]

  // 统计每个 action 在选中数据中匹配的状态
  const actionMap = {}
  selectedRows.value.forEach(record => {
    const status = record.midloanStatus || record.status
    const actions = allowedActionsByStatus(status, record, role)
    actions.forEach(a => {
      if (!allowedKeys.includes(a.key)) return
      if (a.category === 'demo') return  // 演示按钮不批量
      if (!actionMap[a.key]) {
        actionMap[a.key] = { key: a.key, label: a.label, category: a.category, matchCount: 0, records: [] }
      }
      actionMap[a.key].matchCount++
      actionMap[a.key].records.push(record.id)
    })
  })

  return Object.values(actionMap).sort((a, b) => b.matchCount - a.matchCount)
}

/**
 * 批量操作点击处理
 *
 * 注意：批量场景下用户不会逐条填写抽屉表单（如 OA 单号/验收人/下线原因等），
 * 引擎会自动生成 OA 单号/使用默认验收人/使用默认下线原因。
 * 因此需要在确认弹窗中明确告知用户。
 */
const NEED_DRAWER_PAYLOAD_ACTIONS = new Set([
  'submit_dev_oa',     // 需要 OA 开发单号
  'submit_verify',     // 需要验收人 + OA 验收单号
  'verify_reject'      // 需要驳回原因 + 说明
])

const handleBatchAction = (batchAction) => {
  const ids = batchAction.records
  if (!ids || ids.length === 0) {
    Message.warning('无可执行记录')
    return
  }

  // 提示信息：若该 action 原本需要抽屉填参，明确告知自动生成
  const needDrawer = NEED_DRAWER_PAYLOAD_ACTIONS.has(batchAction.key)
  const drawerHint = needDrawer
    ? `<br/><br/><span style="color: var(--color-text-3); font-size: 12px;">该操作在详情页需填写表单（OA单号/验收人/下线原因等），批量场景下将自动生成 OA 单号或使用默认值。详细参数可在「状态变更记录」中追溯。</span>`
    : ''

  Modal.confirm({
    title: `确认批量操作`,
    content: `<div>将对 <strong>${ids.length}</strong> 个变量执行「<strong>${batchAction.label}</strong>」操作，是否继续？${drawerHint}</div>`,
    okText: '确认提交',
    cancelText: '取消',
    onOk: () => {
      try {
        const result = MidloanStateEngine.batchExecute(ids, batchAction.key)
        if (result.failed === 0) {
          Message.success(`批量操作完成：成功 ${result.succeeded} 条`)
        } else {
          Message.warning(`批量操作完成：成功 ${result.succeeded} 条，失败 ${result.failed} 条`)
        }
        // 刷新列表
        fetchVariableList()
        clearSelection()
      } catch (e) {
        Message.error(`批量操作失败：${e?.message || '未知错误'}`)
      }
    }
  })
}

const handleViewDetail = (record) => {
  router.push({ name: 'VariableAssetDetail', params: { id: record.id, mode: 'view' } })
}

const openExternalArchive = (record) => {
  const id = record?.sourceRefs?.externalArchiveId
  if (!id) return
  window.open(buildRiskAppUrl(`/risk/external-data/archive/${id}`), '_blank')
}

const handleEdit = (record) => {
  router.push({ name: 'VariableAssetDetail', params: { id: record.id, mode: 'edit' } })
}

const handleToggleStatus = async (record) => {
  try {
    const isActive = record.status === 'active'
    if (!isActive) {
      // 启用：跳转到详情页"提交上线申请"
      Message.info('请到变量详情页提交上线申请')
      router.push({ name: 'VariableAssetDetail', params: { id: record.id, mode: 'view' } })
      return
    }
    Modal.confirm({
      title: '确认停用',
      content: `确定要停用变量"${record.name}"吗？停用后变量将不再对外提供，可重新启用。`,
      onOk: async () => {
        VariableStatusStore.setStatus(String(record.id), 'inactive', 'Demo 用户', '台账直接停用')
        Message.success('变量已停用')
        fetchVariableList()
      }
    })
  } catch (error) {
    Message.error('状态更新失败')
  }
}

const handleExport = () => {
  Message.info('导出功能开发中...')
}

const showIncrementalModal = () => {
  incrementalModalVisible.value = true
  incrementalFileCount.value = 0
  incrementalRecords.value = []
}

const handleCreateMenuSelect = (val) => {
  if (val === 'add' || val === 'create') {
    // 「注册为变量」=「新增」= 打开完整注册表单抽屉（B1 文档）
    registerDrawerVisible.value = true
    return
  }
  if (val === 'incremental') {
    showIncrementalModal()
  }
}

// ============ 新增：完整注册表单（B1 文档）============
const registerDrawerVisible = ref(false)

// 已存在的英文名/中文名（用于去重校验）
const existingFeatureNames = computed(() =>
  (variableStore.variableList || []).map((v) => v.code || v.name || '').filter(Boolean)
)
const existingFeatureCnNames = computed(() =>
  (variableStore.variableList || []).map((v) => v.featureCnName || v.name || '').filter(Boolean)
)

const handleRegisterSubmit = (payload) => {
  const draft = VariableDraftStore.addDraft(payload)
  Message.success(`已创建特征：${draft.name}（${draft.id}），状态：已注册`)
  registerDrawerVisible.value = false
  // 刷新台账数据 + 跳转到详情页（B1 R21）
  fetchVariableList()
  router.push({ name: 'VariableAssetDetail', params: { id: draft.id } })
}

const handleRegisterSaveDraft = (payload) => {
  // 保存草稿：status=draft，midloanStatus 留空以避免污染 midloan 统计
  VariableDraftStore.addDraft({
    ...payload,
    name: payload.name || `DRAFT_${Date.now()}`,
    featureCnName: payload.featureCnName || '（未命名草稿）'
  })
  Message.success('草稿已保存到「变量台账」底部，可在台账列表中查看')
}

const openBatchTopicModal = () => {
  if (!selectedRows.value.length) {
    Message.warning('请先勾选变量')
    return
  }
  if (selectedRows.value.length > 50) {
    Modal.confirm({
      title: '批量发起确认',
      content: `已选 ${selectedRows.value.length} 个变量，过程信息将汇总在 1 个探索课题中。是否继续？`,
      okText: '继续',
      onOk: () => {
        buildBatchTopicPrefill()
        batchTopicVisible.value = true
      }
    })
    return
  }
  buildBatchTopicPrefill()
  batchTopicVisible.value = true
}

const openBatchEvaluationModal = () => {
  if (!selectedRows.value.length) {
    Message.warning('请先勾选变量')
    return
  }
  if (selectedRows.value.length > 50) {
    Modal.confirm({
      title: '批量评估确认',
      content: `已选 ${selectedRows.value.length} 个变量，评估执行可能需要较长时间。是否继续？`,
      okText: '继续',
      onOk: () => {
        buildBatchEvaluationPrefill()
        batchEvaluationVisible.value = true
      }
    })
    return
  }
  buildBatchEvaluationPrefill()
  batchEvaluationVisible.value = true
}

const submitBatchTopic = () => {
  if (!batchTopicForm.name.trim()) {
    Message.warning('请填写课题名称')
    return
  }
  const type = batchTopicForm.variableTypeId ? ExploreTaxonomyStore.getTypeById(batchTopicForm.variableTypeId) : undefined
  const category = batchTopicForm.variableTypeId
    ? ExploreTaxonomyStore.listLeafCategories(batchTopicForm.variableTypeId).find((item) => item.id === batchTopicForm.exploreCategoryId)
    : undefined
  const relatedResources = []
  selectedRows.value.forEach((item) => {
    relatedResources.push({ type: 'variable', name: item.id, displayName: `变量：${item.name}` })
  })
  const topic = ExploreStore.addTopic({
    name: batchTopicForm.name.trim(),
    businessProblem: batchTopicForm.businessProblem.trim(),
    hypothesis: batchTopicForm.hypothesis.trim(),
    domain: batchTopicForm.domain,
    visibility: batchTopicForm.visibility,
    variableTypeId: batchTopicForm.variableTypeId || undefined,
    variableTypeTags: type ? [type.title] : [],
    exploreCategoryId: batchTopicForm.exploreCategoryId || undefined,
    exploreCategoryTitle: category?.title,
    relatedVariableIds: selectedRows.value.map((item) => item.id),
    relatedResources
  })
  Message.success(`已基于 ${selectedRows.value.length} 个变量发起探索课题`)
  batchTopicVisible.value = false
  clearSelection()
  router.push(`/explore/topics/${topic.id}`)
}

const submitBatchEvaluation = () => {
  if (!batchEvaluationForm.name.trim()) {
    Message.warning('请填写任务名称')
    return
  }
  const ds = selectedDataSourceMeta.value
  const variableTypeId = inferVariableTypeId(selectedRows.value)
  const type = variableTypeId ? ExploreTaxonomyStore.getTypeById(variableTypeId) : null
  const task = EvaluationTaskStore.addTask({
    name: batchEvaluationForm.name.trim(),
    taskType: batchEvaluationForm.taskType,
    sourceType: 'variable_batch',
    sourceIds: selectedRows.value.map((item) => item.id),
    sourceNames: selectedRows.value.map((item) => item.name),
    description: batchEvaluationForm.description.trim(),
    variableTypeId: variableTypeId || undefined,
    variableTypeName: type?.title,
    targets: selectedRows.value.map((item) => ({
      id: item.id,
      name: item.name,
      code: item.code,
      sourceType: item.sourceType,
      dataSourceName: item.dataSourceName
    }))
  })
  Message.success(`已创建评估任务 ${task.id}`)
  batchEvaluationVisible.value = false
  clearSelection()
  router.push('/evaluation/tasks')
}

const parseExcelFile = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        if (!sheetName) return resolve([])
        const sheet = workbook.Sheets[sheetName]
        const json = XLSX.utils.sheet_to_json(sheet)
        const records = json.map((r) => ({
          name: r.name || r.变量名称 || '',
          code: r.code || r.变量编码 || '',
          type: r.type || r.类型 || '',
          status: r.status || r.状态 || 'draft',
          dataSource: r.dataSource || r.数据源 || '',
          usageCount: Number(r.usageCount ?? r.使用次数 ?? 0),
          sourceField: r.sourceField ?? r.来源字段 ?? '',
          updateFrequency: r.updateFrequency ?? r.更新频率 ?? '',
          definition: r.definition ?? r.定义说明 ?? '',
          description: r.description ?? r.描述 ?? ''
        }))
        resolve(records)
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsArrayBuffer(file)
  })
}

const handleIncrementalFileChange = async (info) => {
  const file = info.file?.file
  if (!file) return
  try {
    const records = await parseExcelFile(file)
    incrementalRecords.value = records
    incrementalFileCount.value = records.length
  } catch (e) {
    Message.error('解析文件失败')
  }
}

const confirmIncrementalUpload = async () => {
  try {
    const res = await incrementalImportVariables(incrementalRecords.value)
    if (res.code === 200) {
      Message.success(`导入更新成功 ${res.data?.count || 0} 条`)
      incrementalModalVisible.value = false
      await fetchVariableList()
    }
  } catch (e) {
    Message.error('导入更新失败')
  }
}

onMounted(() => {
  fetchDataSources()
  fetchVariableList()
  // 处理从课题页「新建衍生需求」跳转的 query
  handleDerivationAction()
})

// ============ 衍生需求 Tab 数据 ============
const derivationStatusMap = {
  pending_dev:       { label: '待开发', color: 'gray' },
  developing:        { label: '开发中', color: 'blue' },
  pending_register:  { label: '待注册', color: 'arcoblue' },
  registered:        { label: '已注册', color: 'green-light' }
}
const getDerivationStatusLabel = (s) => derivationStatusMap[s]?.label || s
const getDerivationStatusColor = (s) => derivationStatusMap[s]?.color || 'gray'

const derivationFilter = reactive({ keyword: '', status: '' })
const derivationList = ref([])
const derivationPagination = reactive({ current: 1, pageSize: 10, total: 0, showTotal: true, showJumper: true })

const derivationColumns = [
  { title: '需求ID', dataIndex: 'id', slotName: 'idCell', width: 170 },
  { title: '需求名称', dataIndex: 'name', width: 220 },
  { title: '业务场景', dataIndex: 'businessScene', width: 80 },
  { title: '特征名', dataIndex: 'featureCnName', width: 200, ellipsis: true },
  { title: '状态', dataIndex: 'status', slotName: 'statusCell', width: 100 },
  { title: '关联特征ID', dataIndex: 'featureId', slotName: 'featureIdCell', width: 180 },
  { title: '创建人', dataIndex: 'creator', width: 100 },
  { title: '创建时间', dataIndex: 'createdAt', width: 170 },
  { title: '操作', dataIndex: 'actions', slotName: 'actions', width: 200, fixed: 'right' }
]

function refreshDerivations() {
  const list = DerivationStore.list(derivationFilter)
  derivationList.value = list
  derivationPagination.total = list.length
}

function resetDerivationFilter() {
  derivationFilter.keyword = ''
  derivationFilter.status = ''
  refreshDerivations()
}

// 流转动作
function devTransition(record) {
  DerivationStore.updateStatus(record.id, 'developing')
  Message.success(`需求 ${record.id} 已进入「开发中」`)
  refreshDerivations()
}

function completeDevTransition(record) {
  DerivationStore.updateStatus(record.id, 'pending_register')
  Message.success(`需求 ${record.id} 已完成开发，请补充注册信息`)
  refreshDerivations()
}

function goRegister(record) {
  derivationRegisterTarget.value = DerivationStore.get(record.id) || record
  derivationRegisterVisible.value = true
}

function onDerivationRegisterSubmit(payload) {
  const target = derivationRegisterTarget.value
  if (!target) return
  const rec = DerivationStore.register(target.id, payload)
  if (rec) {
    Message.success(`已注册特征 ${rec.featureId}，状态：已注册`)
    derivationRegisterVisible.value = false
    refreshDerivations()
  }
}

function goFeatureDetail(featureId) {
  router.push({ name: 'VariableAssetDetail', params: { id: featureId, mode: 'view' } })
}

// 新建衍生需求
const derivationCreateVisible = ref(false)
function openDerivationCreate() {
  derivationCreateVisible.value = true
}

// 批量导入（A1 R19）
const bulkImportVisible = ref(false)
function openBulkImport() {
  bulkImportVisible.value = true
}
function onBulkImport(rows) {
  if (!rows || rows.length === 0) {
    Message.warning('没有可导入的数据')
    return
  }
  let successCount = 0
  let failedCount = 0
  rows.forEach((row) => {
    try {
      DerivationStore.create(row, '批量导入')
      successCount++
    } catch (err) {
      failedCount++
    }
  })
  bulkImportVisible.value = false
  if (successCount > 0) {
    Message.success(`成功导入 ${successCount} 条${failedCount > 0 ? `，失败 ${failedCount} 条` : ''}`)
  } else {
    Message.error('导入失败')
  }
  // 刷新列表（如有）
  fetchVariableList()
}
function onDerivationCreated(payload) {
  const rec = DerivationStore.create(payload, '小李')
  Message.success(`已创建衍生需求 ${rec.id}，状态：待开发`)
  derivationCreateVisible.value = false
  refreshDerivations()
}

// B1 注册弹窗
const derivationRegisterVisible = ref(false)
const derivationRegisterTarget = ref(null)

// 详情抽屉
const derivationDetailVisible = ref(false)
const derivationDetail = ref(null)
const derivationDetailDesc = computed(() => derivationDetail.value ? [
  { label: '需求ID', value: derivationDetail.value.id },
  { label: '需求名称', value: derivationDetail.value.name },
  { label: '业务场景', value: derivationDetail.value.businessScene },
  { label: '预期效果', value: derivationDetail.value.expectedEffect },
  { label: '品类', value: '贷中行为' },
  { label: '数据源', value: derivationDetail.value.dataSource },
  { label: '开发人员', value: derivationDetail.value.developer },
  { label: '创建人', value: derivationDetail.value.creator },
  { label: '创建时间', value: derivationDetail.value.createdAt }
] : [])
const derivationDetailFeatureDesc = computed(() => derivationDetail.value ? [
  { label: '特征英文名', value: derivationDetail.value.featureEnName },
  { label: '中文名', value: derivationDetail.value.featureCnName },
  { label: '字段类型', value: derivationDetail.value.fieldType },
  { label: '默认值', value: derivationDetail.value.defaultValue || '—' },
  { label: '加工逻辑', value: derivationDetail.value.processingLogic },
  { label: '一级分类', value: derivationDetail.value.l1Category },
  { label: '二级分类', value: derivationDetail.value.l2Category },
  { label: '数据时效', value: derivationDetail.value.dataFreshness || '—' },
  { label: '标准化后来源表', value: derivationDetail.value.sourceTableAfter || '—' },
  { label: '标准化前来源表', value: derivationDetail.value.sourceTableBefore || '—' }
] : [])
const derivationDetailRegisterDesc = computed(() => derivationDetail.value ? [
  { label: '数据底表名称', value: derivationDetail.value.dataTableName || '暂未补充' },
  { label: '数仓任务ID', value: derivationDetail.value.dwTaskId || '—' },
  { label: '产品范围', value: derivationDetail.value.productScope || '—' },
  { label: '名单类型', value: derivationDetail.value.listType || '—' },
  { label: '批次', value: derivationDetail.value.batch || '—' },
  { label: '验收人', value: derivationDetail.value.acceptor || '—' },
  { label: '备注', value: derivationDetail.value.remark || '—' },
  { label: '关联特征ID', value: derivationDetail.value.featureId || '尚未注册' }
] : [])
const derivationDetailTimeline = computed(() => derivationDetail.value ? [
  { label: '创建时间', value: derivationDetail.value.createdAt + '  创建人：' + derivationDetail.value.creator },
  { label: '最近更新', value: derivationDetail.value.updatedAt },
  { label: '当前状态', value: getDerivationStatusLabel(derivationDetail.value.status) }
] : [])

function openDerivationDetail(record) {
  derivationDetail.value = DerivationStore.get(record.id)
  derivationDetailVisible.value = true
}

// 进入页面时初始化衍生需求列表
refreshDerivations()
</script>

<style scoped>
.variable-management-page {
  padding: 16px;
  background-color: var(--subapp-bg-secondary);
  min-height: 100vh;
}

.page-header {
  margin-bottom: 16px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--subapp-text-primary);
}

.header-actions {
  display: flex;
  gap: 8px;
}

.global-search {
  flex: 1;
  min-width: 280px;
  max-width: 480px;
  margin: 0 16px;
}

.page-content {
  max-width: 1400px;
  margin: 0 auto;
}

.stats-row {
  margin-bottom: 16px;
}

.stat-card {
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.stat-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-number {
  font-size: 32px;
  font-weight: 600;
  color: var(--subapp-text-primary);
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: var(--subapp-text-tertiary);
}

.filter-card {
  margin-bottom: 16px;
}

.table-card {
  margin-bottom: 16px;
}

.batch-toolbar {
  width: 100%;
  justify-content: space-between;
  margin-bottom: 16px;
}

.batch-hint {
  color: var(--color-text-3);
}

.batch-modal-alert {
  margin-bottom: 12px;
}

/* ========== 批量操作栏（用户反馈：移到表格上方）============ */
.batch-action-bar {
  margin-bottom: 12px;
  padding: 12px 16px;
  background: var(--color-primary-light-1, #e8f3ff);
  border: 1px solid var(--color-primary-light-3, #bedaff);
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(22, 93, 255, 0.08);
}
/* 上方栏的特殊样式（无 sticky）*/
.batch-action-bar-top {
  position: relative;
}
.batch-count {
  font-size: 14px;
  color: var(--color-text-1, #1d2129);
}
.batch-count strong {
  color: var(--color-primary, #165dff);
  font-size: 16px;
  margin: 0 4px;
}
.batch-status-summary {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

/* 视图模式 Segmented 控件 */
.view-mode-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 20px 0 16px;
  padding: 12px 16px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid var(--color-border-2);
}

.view-mode-hint {
  font-size: 12px;
  color: #86909c;
}

/* 效果列样式 */
.effect-number {
  font-variant-numeric: tabular-nums;
  font-weight: 500;
  color: #1d2129;
  margin-right: 6px;
}

.effect-badge {
  display: inline-block;
  padding: 1px 6px;
  font-size: 11px;
  border-radius: 3px;
  font-weight: 500;
}

.effect-strong {
  background: #fff1f0;
  color: #f53f3f;
}

.effect-medium {
  background: #fff7e8;
  color: #ff7d00;
}

.effect-weak {
  background: #e6fffb;
  color: #0fc6c2;
}

.effect-low {
  background: #f2f3f5;
  color: #86909c;
}

/* 提升度 */
.lift {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.lift-up {
  color: #00b42a;
}

.lift-down {
  color: #f53f3f;
}

/* 成本列样式 */
.cost-highlight {
  font-weight: 600;
  color: #f53f3f;
  font-variant-numeric: tabular-nums;
}

.cost-zero {
  color: #c9cdd4;
}

/* 贷中行为 11 状态机分布概览 */
.midloan-overview-card {
  margin-bottom: 16px;
}
.mo-cell {
  padding: 12px 16px;
  border-radius: 6px;
  text-align: center;
  background: var(--color-fill-2, #f7f8fa);
}
.mo-num {
  font-size: 22px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  margin-bottom: 4px;
}
.mo-label {
  font-size: 12px;
  color: var(--color-text-3, #86909c);
}
.mo-total    .mo-num { color: #165dff; }
.mo-online   .mo-num { color: #00b42a; }
.mo-syncing  .mo-num { color: #0fc6c2; }
.mo-developing .mo-num { color: #722ed1; }
.mo-failed   .mo-num { color: #f53f3f; }

/* 风险特征 Tab */
.risk-feature-tabs {
  margin-bottom: 16px;
}
.derivation-card {
  margin-top: 0;
}
.derivation-toolbar {
  width: 100%;
  justify-content: space-between;
  margin-bottom: 12px;
}
.derivation-tip {
  color: var(--color-text-2, #4e5969);
  font-size: 13px;
}
.derivation-filter {
  margin-bottom: 12px;
}
.placeholder {
  color: var(--color-text-4, #c9cdd4);
}
</style>
