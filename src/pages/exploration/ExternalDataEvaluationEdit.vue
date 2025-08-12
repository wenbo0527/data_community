<template>
  <div class="external-data-evaluation-edit">
    <!-- 编辑头部 -->
    <a-card class="edit-header" :bordered="false">
      <div class="header-content">
        <div class="title-section">
          <h1>编辑报告：{{ reportData.reportName }}</h1>
          <div class="meta-info">
            <a-tag :color="getStatusColor(reportData.status)">{{ reportData.status }}</a-tag>
            <span class="product-info">产品：{{ reportData.productName }}</span>
            <span class="date-info">分析周期：{{ reportData.sampleTimeSpan }}</span>
          </div>
        </div>
        <div class="action-section">
          <a-button type="primary" @click="saveReport" :loading="saving">
            <template #icon><icon-save /></template>
            保存报告
          </a-button>
          <a-button @click="publishReport" :loading="publishing" v-if="reportData.status === '草稿'">
            <template #icon><icon-send /></template>
            发布报告
          </a-button>
          <a-button @click="previewReport">
            <template #icon><icon-eye /></template>
            预览报告
          </a-button>
          <a-button @click="goBack">
            <template #icon><icon-left /></template>
            返回详情
          </a-button>
        </div>
      </div>
    </a-card>

    <a-row :gutter="24">
      <!-- 左侧模块导航 -->
      <a-col :span="6">
        <a-card class="nav-card">
          <div class="nav-title">编辑模块</div>
          <div class="nav-menu">
            <div 
              v-for="module in reportData.modules" 
              :key="module.id"
              class="nav-item"
              :class="{ active: activeModule === module.id }"
              @click="switchModule(module.id)"
            >
              <span class="nav-number">{{ module.id }}</span>
              <span class="nav-text">{{ module.name }}</span>
              <span v-if="hasChanges(module.id)" class="change-indicator">●</span>
              <span class="edit-type">{{ getEditTypeLabel(module) }}</span>
            </div>
          </div>
        </a-card>

        <!-- 编辑说明 -->
        <a-card class="tips-card" title="编辑说明">
          <div class="tips-content">
            <div class="tip-item">
              <span class="tip-label">文字编辑：</span>
              <span class="tip-desc">可修改文字内容</span>
            </div>
            <div class="tip-item">
              <span class="tip-label">表格自动：</span>
              <span class="tip-desc">表格自动生成</span>
            </div>
            <div class="tip-item">
              <span class="tip-label">图片选择：</span>
              <span class="tip-desc">可选择展示图片</span>
            </div>
            <div class="tip-item">
              <span class="tip-label">完全编辑：</span>
              <span class="tip-desc">内容完全可编辑</span>
            </div>
          </div>
        </a-card>
      </a-col>

      <!-- 右侧编辑内容 -->
      <a-col :span="18">
        <a-card class="edit-content-card">
          <div class="edit-sections-container">
            <!-- 根据导航切换模块显示 -->
            <div v-for="module in reportData.modules" :key="module.id" class="edit-section" v-show="activeModule === module.id">
              <div class="module-header">
                <h3>{{ module.name }}</h3>
                <a-tag size="small" :color="getEditPermissionColor(module)">
                  {{ getEditPermissionText(module) }}
                </a-tag>
              </div>
              
              <!-- 测试背景及目的 - 固定模板文本，仅可修改文字内容 -->
              <div v-if="module.id === 1" class="template-text-edit">
                <div class="edit-header-info">
                  <h4>文字描述</h4>
                  <span class="edit-limit">仅可修改文字内容</span>
                </div>
                <a-textarea
                  v-model="module.content"
                  :rows="6"
                  :max-length="module.wordLimit || 500"
                  show-word-limit
                  placeholder="请输入测试背景及目的..."
                  @input="markChanged(module.id)"
                />
                <div class="template-notice">
                  <a-alert
                    message="模板说明"
                    description="此模块使用固定模板格式，您只能修改文字内容，不能调整结构。"
                    type="info"
                    size="small"
                    show-icon
                  />
                </div>
              </div>

              <!-- 产品介绍 - 产品基本信息，仅可修改文字内容 -->
              <div v-else-if="module.id === 2" class="product-info-edit">
                <div class="edit-header-info">
                  <h4>产品基本信息</h4>
                  <span class="edit-limit">仅可修改文字内容</span>
                </div>
                <a-textarea
                  v-model="module.content"
                  :rows="5"
                  :max-length="module.wordLimit || 300"
                  show-word-limit
                  placeholder="请输入产品基本信息..."
                  @input="markChanged(module.id)"
                />
              </div>

              <!-- 样本组成 - 文字+数据表，文字可编辑，表格自动生成 -->
              <div v-else-if="module.id === 3" class="sample-composition-edit">
                <div class="edit-header-info">
                  <h4>文字描述</h4>
                  <span class="edit-limit">文字可编辑，表格自动生成</span>
                </div>
                <a-textarea
                  v-model="module.textContent"
                  :rows="4"
                  :max-length="500"
                  show-word-limit
                  placeholder="请输入样本组成描述..."
                  @input="markChanged(module.id)"
                />
                
                <div class="table-preview">
                  <h4>数据表格 <span class="auto-label">(自动生成)</span></h4>
                  <a-table
                    :columns="getSampleTableColumns()"
                    :data="module.tableData?.rows || []"
                    :pagination="false"
                    size="small"
                    class="readonly-table"
                  />
                  <div class="table-notice">
                    <a-alert
                      message="表格说明"
                      description="此表格根据上传的样本数据自动生成，无法手动编辑。如需修改，请重新上传样本文件。"
                      type="info"
                      size="small"
                      show-icon
                    />
                  </div>
                </div>
              </div>

              <!-- 总样本概况 - 文字+数据表，分为样本饱和度和相关性 -->
              <div v-else-if="module.id === 4" class="sample-overview-edit">
                <div class="edit-header-info">
                  <h4>文字描述</h4>
                  <span class="edit-limit">文字可编辑，表格自动生成</span>
                </div>
                <a-textarea
                  v-model="module.textContent"
                  :rows="4"
                  :max-length="500"
                  show-word-limit
                  placeholder="请输入总样本概况描述..."
                  @input="markChanged(module.id)"
                />
                
                <div class="dual-table-preview">
                  <div class="table-group">
                    <h4>样本饱和度表 <span class="auto-label">(自动生成)</span></h4>
                    <a-table
                      :columns="getSaturationTableColumns()"
                      :data="module.tableData?.saturationTable?.rows || []"
                      :pagination="false"
                      size="small"
                      class="readonly-table"
                    />
                  </div>
                  
                  <div class="table-group">
                    <h4>相关性数据表 <span class="auto-label">(自动生成)</span></h4>
                    <a-table
                      :columns="getCorrelationTableColumns()"
                      :data="module.tableData?.correlationTable?.rows || []"
                      :pagination="false"
                      size="small"
                      class="readonly-table"
                    />
                  </div>
                </div>
              </div>

              <!-- 效果分析-全平台 - 文字+图片，文字可编辑，选择展示图片 -->
              <div v-else-if="module.id === 5" class="platform-analysis-edit">
                <div class="edit-header-info">
                  <h4>文字描述</h4>
                  <span class="edit-limit">文字可编辑，选择展示图片</span>
                </div>
                <a-textarea
                  v-model="module.textContent"
                  :rows="5"
                  :max-length="800"
                  show-word-limit
                  placeholder="请输入全平台效果分析..."
                  @input="markChanged(module.id)"
                />
                
                <div class="chart-selection">
                  <h4>图表展示选择</h4>
                  <a-row :gutter="16">
                    <a-col :span="12">
                      <div class="chart-option">
                        <div 
                          class="chart-thumbnail" 
                          :class="{ selected: module.chartSelection.showFunnel }"
                          @click="toggleChartSelection(module.id, 'showFunnel')"
                        >
                          <img 
                            src="/charts/funnel_chart_platform_all.svg" 
                            alt="转化漏斗图"
                            class="chart-thumbnail-image"
                            @error="handleImageError"
                          />
                          <div class="chart-thumbnail-overlay">
                            <icon-check v-if="module.chartSelection.showFunnel" class="selected-icon" />
                          </div>
                          <div class="chart-thumbnail-label">转化漏斗图</div>
                        </div>
                      </div>
                    </a-col>
                    <a-col :span="12">
                      <div class="chart-option">
                        <div 
                          class="chart-thumbnail" 
                          :class="{ selected: module.chartSelection.showTrend }"
                          @click="toggleChartSelection(module.id, 'showTrend')"
                        >
                          <img 
                            src="/charts/trend_chart_platform_all.svg" 
                            alt="时间趋势图"
                            class="chart-thumbnail-image"
                            @error="handleImageError"
                          />
                          <div class="chart-thumbnail-overlay">
                            <icon-check v-if="module.chartSelection.showTrend" class="selected-icon" />
                          </div>
                          <div class="chart-thumbnail-label">时间趋势图</div>
                        </div>
                      </div>
                    </a-col>
                  </a-row>
                </div>
                
                <!-- 图表预览模态框 -->
                <a-modal 
                  v-model:visible="imagePreviewVisible" 
                  :title="previewImageTitle"
                  :footer="false"
                  width="80%"
                  @cancel="closeImagePreview"
                >
                  <div class="image-preview-container">
                    <img 
                      :src="previewImageUrl" 
                      :alt="previewImageTitle"
                      class="preview-image"
                      @error="handleImageError"
                    />
                  </div>
                </a-modal>
              </div>

              <!-- 效果分析-分平台 - 文字+图片，文字可编辑，选择展示图片 -->
              <div v-else-if="module.id === 6" class="multi-platform-analysis-edit">
                <div class="edit-header-info">
                  <h4>文字描述</h4>
                  <span class="edit-limit">文字可编辑，选择展示图片</span>
                </div>
                <a-textarea
                  v-model="module.textContent"
                  :rows="5"
                  :max-length="800"
                  show-word-limit
                  placeholder="请输入分平台效果分析..."
                  @input="markChanged(module.id)"
                />
                
                <div class="chart-selection">
                  <h4>图表展示选择</h4>
                  <a-row :gutter="16">
                    <a-col :span="12">
                      <div class="chart-option">
                        <div 
                          class="chart-thumbnail" 
                          :class="{ selected: module.chartSelection.showComparison }"
                          @click="toggleChartSelection(module.id, 'showComparison')"
                        >
                          <img 
                            src="/charts/platform_comparison_chart.svg" 
                            alt="平台对比图"
                            class="chart-thumbnail-image"
                            @error="handleImageError"
                          />
                          <div class="chart-thumbnail-overlay">
                            <icon-check v-if="module.chartSelection.showComparison" class="selected-icon" />
                          </div>
                          <div class="chart-thumbnail-label">平台对比图</div>
                        </div>
                      </div>
                    </a-col>
                    <a-col :span="12">
                      <div class="chart-option">
                        <div 
                          class="chart-thumbnail" 
                          :class="{ selected: module.chartSelection.showRadar }"
                          @click="toggleChartSelection(module.id, 'showRadar')"
                        >
                          <img 
                            src="/charts/stability_radar_chart.svg" 
                            alt="稳定性雷达图"
                            class="chart-thumbnail-image"
                            @error="handleImageError"
                          />
                          <div class="chart-thumbnail-overlay">
                            <icon-check v-if="module.chartSelection.showRadar" class="selected-icon" />
                          </div>
                          <div class="chart-thumbnail-label">稳定性雷达图</div>
                        </div>
                      </div>
                    </a-col>
                  </a-row>
                </div>
                
                <!-- 图表预览模态框 -->
                <a-modal 
                  v-model:visible="imagePreviewVisible" 
                  :title="previewImageTitle"
                  :footer="false"
                  width="80%"
                  @cancel="closeImagePreview"
                >
                  <div class="image-preview-container">
                    <img 
                      :src="previewImageUrl" 
                      :alt="previewImageTitle"
                      class="preview-image"
                      @error="handleImageError"
                    />
                  </div>
                </a-modal>
              </div>

              <!-- 数据结论 - 文字总结，完全可编辑 -->
              <div v-else-if="module.id === 7" class="conclusion-edit">
                <div class="edit-header-info">
                  <h4>结论与建议</h4>
                  <span class="edit-limit">完全可编辑</span>
                </div>
                <a-textarea
                  v-model="module.content"
                  :rows="8"
                  :max-length="module.wordLimit || 5000"
                  show-word-limit
                  placeholder="请输入基于分析结果的结论建议..."
                  @input="markChanged(module.id)"
                />
                
                <div class="conclusion-tools">
                  <h4>快速建议模板</h4>
                  <a-space wrap>
                    <a-button 
                      size="small" 
                      type="outline"
                      @click="insertTemplate('platform')"
                    >
                      插入平台建议
                    </a-button>
                    <a-button 
                      size="small" 
                      type="outline"
                      @click="insertTemplate('optimization')"
                    >
                      插入优化建议
                    </a-button>
                    <a-button 
                      size="small" 
                      type="outline"
                      @click="insertTemplate('future')"
                    >
                      插入未来规划
                    </a-button>
                  </a-space>
                </div>
              </div>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Message } from '@arco-design/web-vue';
import {
  Row as ARow,
  Col as ACol,
  Card as ACard,
  Button as AButton,
  Textarea as ATextarea,
  Input as AInput,
  Alert as AAlert,
  Tag as ATag,
  Table as ATable,
  Checkbox as ACheckbox,
  Space as ASpace,
  Modal as AModal
} from '@arco-design/web-vue';
import {
  IconSave,
  IconEye,
  IconLeft,
  IconPlus,
  IconDelete,
  IconSend,
  IconCheck
} from '@arco-design/web-vue/es/icon';

const route = useRoute();
const router = useRouter();

// 响应式数据
const activeModule = ref(1);
const saving = ref(false);
const publishing = ref(false);
const changedModules = ref(new Set());

// 图表预览相关数据
const imagePreviewVisible = ref(false);
const previewImageUrl = ref('');
const previewImageTitle = ref('');

const reportData = reactive({
  reportName: '',
  productName: '',
  status: '',
  sampleTimeSpan: '',
  modules: []
});

/**
 * 图预览方法
 * @param {string} url - 图片URL
 * @param {string} title - 图片标题
 * @returns {void}
 */
const showImagePreview = (url: string, title: string) => {
  previewImageUrl.value = url;
  previewImageTitle.value = title;
  imagePreviewVisible.value = true;
};

const closeImagePreview = () => {
  imagePreviewVisible.value = false;
  previewImageUrl.value = '';
  previewImageTitle.value = '';
};

/**
 * 切换图表选择状态
 * @param {number} moduleId - 模块ID
 * @param {string} chartType - 图表类型
 * @returns {void}
 */
const toggleChartSelection = (moduleId: number, chartType: string) => {
  const module = reportData.modules.find((m: any) => m && m.id === moduleId);
  if (module && module.chartSelection) {
    module.chartSelection[chartType] = !module.chartSelection[chartType];
    markChanged(moduleId);
  }
};

/**
 * 获取报告详情
 * @returns {Promise<void>}
 */
const fetchReportDetail = async () => {
  try {
    const response = await fetch(`/api/external-data-evaluation/detail/${route.params.id}`);
    const result = await response.json();
    
    if (result.code === 200) {
      Object.assign(reportData, result.data);
      // 初始化图表选择状态
      reportData.modules.forEach((module: any) => {
        if (module.id === 5) {
          module.chartSelection = module.chartSelection || {
        showFunnel: true,
        showTrend: true
      };
        } else if (module.id === 6) {
          module.chartSelection = module.chartSelection || {
        showComparison: true,
        showRadar: true
      };
        }
      });
    } else {
      Message.error('获取报告详情失败');
    }
  } catch (error) {
    console.error('获取报告详情失败:', error);
    Message.error('获取报告详情失败');
  }
};

/**
 * 获取状态颜色
 * @param {string} status - 状态
 * @returns {string} 颜色
 */
const getStatusColor = (status: string) => {
  const colorMap = /** @type {Record<string, string>} */ ({
      '草稿': 'orange',
      '已发布': 'green',
      '已归档': 'gray'
    });
  return colorMap[status as '草稿' | '已发布' | '已归档'] || 'blue';
};

/**
 * 获取编辑类型标签
 * @param {Object} module - 模块对象
 * @param {number} module.id - 模块ID
 * @returns {string} 编辑类型标签
 */
const getEditTypeLabel = (module: { id: number }) => {
  const typeMap = /** @type {Record<number, string>} */ ({
      1: '文字',
      2: '文字',
      3: '文字+表格',
      4: '文字+表格',
      5: '文字+图片',
      6: '文字+图片',
      7: '完全编辑'
    });
  return typeMap[module.id as 1 | 2 | 3 | 4 | 5 | 6 | 7] || '文字';
};

/**
 * 获取编辑权限颜色
 * @param {Object} module - 模块对象
 * @param {number} module.id - 模块ID
 * @returns {string} 权限颜色
 */
const getEditPermissionColor = (module: { id: number }) => {
  const colorMap = /** @type {Record<number, string>} */ ({
      1: 'blue',
      2: 'blue',
      3: 'cyan',
      4: 'cyan',
      5: 'purple',
      6: 'purple',
      7: 'green'
    });
  return colorMap[module.id as 1 | 2 | 3 | 4 | 5 | 6 | 7] || 'blue';
};

/**
 * 获取编辑权限文本
 * @param {Object} module - 模块对象
 * @param {number} module.id - 模块ID
 * @returns {string} 权限文本
 */
const getEditPermissionText = (module: { id: number }) => {
  const textMap = /** @type {Record<number, string>} */ ({
      1: '固定模板',
      2: '基本信息',
      3: '文字+自动表格',
      4: '文字+自动表格',
      5: '文字+图表选择',
      6: '文字+图表选择',
      7: '完全可编辑'
    });
  return textMap[module.id as 1 | 2 | 3 | 4 | 5 | 6 | 7] || '可编辑';
};

// 获取样本表格列配置
const getSampleTableColumns = () => [
  { title: '指标', dataIndex: '0', width: 120 },
  { title: '数值', dataIndex: '1', width: 100 },
  { title: '占比', dataIndex: '2', width: 80 }
];

// 获取饱和度表格列配置
const getSaturationTableColumns = () => [
  { title: '指标', dataIndex: '0', width: 120 },
  { title: '数值', dataIndex: '1', width: 100 },
  { title: '说明', dataIndex: '2', width: 150 }
];

// 获取相关性表格列配置
const getCorrelationTableColumns = () => [
  { title: '维度', dataIndex: '0', width: 100 },
  { title: '相关系数', dataIndex: '1', width: 100 },
  { title: '显著性', dataIndex: '2', width: 80 }
];

/**
 * 切换模块
 * @param {number} moduleId - 模块ID
 * @returns {void}
 */
const switchModule = (moduleId: number) => {
  activeModule.value = moduleId;
};

/**
 * 标记模块已修改
 * @param {number} moduleId - 模块ID
 * @returns {void}
 */
const markChanged = (moduleId: number) => {
  changedModules.value.add(moduleId);
};

/**
 * 检查模块是否有修改
 * @param {number} moduleId - 模块ID
 * @returns {boolean} 是否有修改
 */
const hasChanges = (moduleId: number) => {
  return changedModules.value.has(moduleId);
};

/**
 * 添加建议
 * @param {number} moduleId - 模块ID
 * @returns {void}
 */
const addSuggestion = (moduleId: number) => {
  const module = reportData.modules.find((m: any) => m && m.id === moduleId);
  if (module && module.suggestions) {
    module.suggestions.push('');
    markChanged(moduleId);
  }
};

/**
 * 删除建议
 * @param {number} moduleId - 模块ID
 * @param {number} index - 索引
 * @returns {void}
 */
const removeSuggestion = (moduleId: number, index: number) => {
  const module = reportData.modules.find((m: any) => m && m.id === moduleId);
  if (module && module.suggestions) {
    module.suggestions.splice(index, 1);
    markChanged(moduleId);
  }
};

/**
 * 更新图表选择
 * @param {number} moduleId - 模块ID
 * @param {string} chartType - 图表类型
 * @param {boolean} value - 值
 * @returns {void}
 */
const updateChartSelection = (moduleId: number, chartType: string, value: boolean) => {
  const module = reportData.modules.find((m: any) => m && m.id === moduleId);
  if (module && module.chartSelection) {
    module.chartSelection[chartType] = value;
    markChanged(moduleId);
  }
};

/**
 * 保存报告
 * @returns {Promise<void>}
 */
const saveReport = async () => {
  saving.value = true;
  try {
    const response = await fetch(`/api/external-data-evaluation/update/${route.params.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(reportData)
    });
    
    const result = await response.json();
    if (result.code === 200) {
      Message.success('报告保存成功');
      changedModules.value.clear();
    } else {
      Message.error('报告保存失败');
    }
  } catch (error) {
    console.error('保存失败:', error);
    Message.error('报告保存失败');
  } finally {
    saving.value = false;
  }
};

/**
 * 发布报告
 * @returns {Promise<void>}
 */
const publishReport = async () => {
  publishing.value = true;
  try {
    const response = await fetch(`/api/external-data-evaluation/publish/${route.params.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(reportData)
    });
    
    const result = await response.json();
    if (result.code === 200) {
      Message.success('发布成功');
      reportData.status = '已发布';
      changedModules.value.clear();
      // 发布后跳转到详情页
      setTimeout(() => {
        goToDetail();
      }, 1000);
    } else {
      Message.error('发布失败');
    }
  } catch (error) {
    console.error('发布失败:', error);
    Message.error('发布失败');
  } finally {
    publishing.value = false;
  }
};

// 预览报告
const previewReport = () => {
  const routeData = router.resolve({
    name: 'ExternalDataEvaluationDetail',
    params: { id: route.params.id },
    query: { preview: 'true' }
  });
  window.open(routeData.href, '_blank');
};

// 返回详情页
const goToDetail = () => {
  router.push({
    name: 'externalDataEvaluationDetail',
    params: { id: route.params.id }
  });
};

// 返回详情页（带检查）
const goBack = () => {
  if (changedModules.value.size > 0) {
    // 提示用户保存
    Message.warning('您有未保存的修改，请先保存');
    return;
  }
  goToDetail();
};

/**
 * 处理图片加载错误
 * @param {Event} event - 事件对象
 * @returns {void}
 */
const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  if (target) {
    console.error('图片加载失败:', target.src);
    target.src = '/charts/placeholder.svg';
    Message.warning('图片加载失败，已显示占位符');
  }
};

/**
 * 插入模板
 * @param {string} type - 模板类型
 * @returns {void}
 */
const insertTemplate = (type: string) => {
  const module = reportData.modules.find((m: any) => m && m.id === 7);
  if (!module) return;
  
  let template = '';
  switch (type) {
    case 'platform':
      template = '\n\n【平台建议】\n1. 建议在主要平台增加投放预算\n2. 优化次要平台的投放策略\n3. 关注新兴平台的潜力';
      break;
    case 'optimization':
      template = '\n\n【优化建议】\n1. 优化用户画像精准度\n2. 提升数据采集质量\n3. 加强数据安全保护';
      break;
    case 'future':
      template = '\n\n【未来规划】\n1. 拓展更多数据源\n2. 建立实时分析能力\n3. 完善数据治理体系';
      break;
  }
  
  if (module.content) {
    module.content += template;
  } else {
    module.content = template;
  }
  
  markChanged(7);
};

onMounted(() => {
  fetchReportDetail();
});
</script>

<style scoped>
.external-data-evaluation-edit {
  padding: 16px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.edit-header {
  margin-bottom: 16px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.title-section h1 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #1d2129;
}

.meta-info {
  display: flex;
  gap: 16px;
  align-items: center;
  color: #86909c;
  font-size: 14px;
}

.action-section {
  display: flex;
  gap: 8px;
}

.nav-card {
  margin-bottom: 16px;
}

.nav-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #1d2129;
}

.nav-menu {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
  position: relative;
}

.nav-item:hover {
  background-color: #f2f3f5;
}

.nav-item.active {
  background-color: #e6f7ff;
  border-color: #1890ff;
}

.nav-number {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #1890ff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  margin-right: 12px;
}

.nav-text {
  font-weight: 500;
  color: #1d2129;
  flex: 1;
}

.change-indicator {
  color: #f53f3f;
  font-size: 16px;
  margin-left: 8px;
}

.tips-card {
  margin-top: 16px;
}

.tips-content p {
  margin: 8px 0;
  font-size: 12px;
  color: #86909c;
  line-height: 1.4;
}

.edit-content-card {
  height: calc(100vh - 200px);
  overflow-y: auto;
  overflow-x: hidden;
}

.edit-sections-container {
  padding-right: 16px;
}

.edit-section {
  padding: 0;
  margin-bottom: 24px;
}

.edit-section h3 {
  margin: 0 0 24px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1d2129;
}

.content-edit,
.suggestions-edit,
.table-edit-notice,
.charts-edit-notice {
  margin-bottom: 24px;
}

.content-edit h4,
.suggestions-edit h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #1d2129;
}

.suggestion-item {
  margin-bottom: 8px;
}

.chart-selection {
  margin-top: 16px;
}

.chart-selection h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #1d2129;
}

.chart-option {
  margin-bottom: 16px;
}

.chart-thumbnail {
  border: 2px solid #e5e6eb;
  border-radius: 6px;
  overflow: hidden;
  background-color: #fff;
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
  height: 200px;
  display: flex;
  flex-direction: column;
}

.chart-thumbnail:hover {
  border-color: #165dff;
  box-shadow: 0 2px 8px rgba(22, 93, 255, 0.2);
}

.chart-thumbnail.selected {
  border-color: #165dff;
}

.chart-thumbnail-image {
  width: 100%;
  height: 160px;
  object-fit: contain;
  display: block;
}

.chart-thumbnail-overlay {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #165dff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.selected-icon {
  font-size: 16px;
  color: white;
}

.chart-thumbnail-label {
  padding: 8px;
  text-align: center;
  font-size: 12px;
  color: #1d2129;
  background-color: #f5f6f7;
}

.chart-preview {
  margin-top: 8px;
  border: 1px solid #e5e6eb;
  border-radius: 6px;
  overflow: hidden;
  background-color: #fff;
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
}

.chart-preview:hover {
  border-color: #165dff;
  box-shadow: 0 2px 8px rgba(22, 93, 255, 0.2);
}

.chart-preview-image {
  width: 100%;
  height: auto;
  max-height: 200px;
  object-fit: contain;
  display: block;
}

.thumbnail {
  max-height: 150px;
  object-fit: contain;
}

.chart-preview-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.chart-preview:hover .chart-preview-overlay {
  opacity: 1;
}

.preview-icon {
  font-size: 24px;
  color: white;
}

.image-preview-container {
  text-align: center;
}

.preview-image {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
}

@media (max-width: 768px) {
  .external-data-evaluation-edit {
    padding: 8px;
  }
  
  .header-content {
    flex-direction: column;
    gap: 16px;
  }
  
  .action-section {
    width: 100%;
    justify-content: flex-start;
  }
  
  .title-section h1 {
    font-size: 20px;
  }
  
  .meta-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .edit-content-card {
    height: calc(100vh - 150px);
  }
}
</style>