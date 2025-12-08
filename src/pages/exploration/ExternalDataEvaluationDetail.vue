<template>
  <div class="external-data-evaluation-detail">
    <!-- 报告头部信息 -->
    <a-card class="report-header" :bordered="false">
      <div class="header-content">
        <div class="title-section">
          <h1>{{ reportData.reportName }}</h1>
          <div class="meta-info">
            <a-tag :color="getStatusColor(reportData.status)">{{ reportData.status }}</a-tag>
            <span class="product-info">产品：{{ reportData.productName }}</span>
            <span class="date-info">分析周期：{{ reportData.analysisPeriod }}</span>
          </div>
        </div>
        <div class="action-section">
          
          <a-button @click="toggleEditMode" v-if="reportData.editable && !isEditMode">
            <template #icon><icon-edit /></template>
            编辑报告
          </a-button>
          <a-button type="primary" @click="saveReport" :loading="saving" v-if="isEditMode">
            <template #icon><icon-save /></template>
            保存报告
          </a-button>
          <a-button @click="publishReport" :loading="publishing" v-if="isEditMode && reportData.status === '草稿'">
            <template #icon><icon-send /></template>
            发布报告
          </a-button>
          <a-button type="primary" status="danger" @click="deleteReport" v-if="!isEditMode && reportData.status === '草稿'">
            <template #icon><icon-delete /></template>
            删除报告
          </a-button>
          <a-button @click="cancelEdit" v-if="isEditMode">
            <template #icon><icon-close /></template>
            取消编辑
          </a-button>
          <a-button @click="handleBack" v-if="!isEditMode">
            <template #icon><icon-left /></template>
            返回列表
          </a-button>
          <a-button type="primary" status="warning" @click="archiveReport" v-if="!isEditMode && reportData.status === '已发布'">
            <template #icon><icon-archive /></template>
            归档报告
          </a-button>
        </div>
      </div>
    </a-card>

    <a-row :gutter="24">
      <a-col :span="24">
        <a-card>
          <!-- 基础信息栏 -->
          <a-descriptions
            :data="basicInfo"
            :column="2"
            bordered
            size="medium"
            style="margin-bottom: 24px"
          />

          <!-- 分析进度（仅在分析中状态显示） -->
          <a-card v-if="reportData.status === '分析中'" class="progress-card" title="分析进度" style="margin-bottom: 24px;">
            <a-progress 
              :percent="reportData.progress" 
              :status="reportData.progress === 100 ? 'success' : 'active'"
            />
            <div class="progress-text">
              <p>当前步骤：{{ getCurrentStepName() }}</p>
              <p v-if="reportData.estimatedCompletion">预计完成：{{ reportData.estimatedCompletion }}</p>
            </div>
          </a-card>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="24">
      <a-col :span="24">
        <a-card>
          <!-- 动态渲染模块内容 -->
          <div v-for="module in reportData.modules" :key="module.id" class="content-section">
            <div class="module-header">
              <h3>{{ module.name }}</h3>
              <div v-if="isEditMode" class="edit-status">
                <a-tag :color="getEditPermissionColor(module.id)">
                  {{ getEditTypeLabel(module.id) }}
                </a-tag>
                <span class="edit-hint">{{ getEditPermissionText(module.id) }}</span>
              </div>
            </div>
              
              <!-- 文字内容 -->
              <div class="text-content">
                <div v-if="!isEditMode || !canEditText(module.id)">
                  <p>{{ module.content || module.textContent }}</p>
                </div>
                <div v-else-if="isEditMode && canEditText(module.id)" class="edit-text">
                  <a-textarea
                    v-model="editData[module.id].textContent"
                    :placeholder="`请输入${module.name}内容`"
                    :auto-size="{ minRows: 4, maxRows: 10 }"
                    :max-length="getWordLimit(module.id)"
                    show-word-limit
                    @change="markAsModified(module.id)"
                  />
                </div>
              </div>

              <!-- 表格内容（样本组成、总样本概况） -->
              <div v-if="module.table || module.tableData" class="table-content">
                <h4>{{ module.table?.title || module.tableData?.title }}</h4>
                <div v-if="isEditMode && !canEditTable(module.id)" class="edit-notice">
                  <a-alert type="info" message="此表格为系统自动生成，不支持编辑" show-icon />
                </div>
                <a-table
                  :columns="getTableColumns(module.table || module.tableData)"
                  :data="(module.table || module.tableData)?.data || getTableRows(module.table || module.tableData)"
                  :pagination="false"
                  size="small"
                />
              </div>

              <!-- 多表格内容（总样本概况） -->
              <div v-if="module.tables || module.tableData?.saturationTable" class="tables-content">
                <div v-if="module.tables">
                  <div v-for="table in module.tables" :key="table.title" class="table-section">
                    <h4>{{ table.title }}</h4>
                    <div v-if="isEditMode && !canEditTable(module.id)" class="edit-notice">
                      <a-alert type="info" message="此表格为系统自动生成，不支持编辑" show-icon />
                    </div>
                    <a-table
                      :columns="getTableColumns(table)"
                      :data="table.data || getTableRows(table)"
                      :pagination="false"
                      size="small"
                    />
                  </div>
                </div>
                <div v-else-if="module.tableData?.saturationTable">
                  <div class="table-section">
                    <h4>{{ module.tableData.saturationTable.title }}</h4>
                    <div v-if="isEditMode && !canEditTable(module.id)" class="edit-notice">
                      <a-alert type="info" message="此表格为系统自动生成，不支持编辑" show-icon />
                    </div>
                    <a-table
                      :columns="getTableColumns(module.tableData.saturationTable)"
                      :data="getTableRows(module.tableData.saturationTable)"
                      :pagination="false"
                      size="small"
                    />
                  </div>
                  <div class="table-section">
                    <h4>{{ module.tableData.correlationTable.title }}</h4>
                    <div v-if="isEditMode && !canEditTable(module.id)" class="edit-notice">
                      <a-alert type="info" message="此表格为系统自动生成，不支持编辑" show-icon />
                    </div>
                    <a-table
                      :columns="getTableColumns(module.tableData.correlationTable)"
                      :data="getTableRows(module.tableData.correlationTable)"
                      :pagination="false"
                      size="small"
                    />
                  </div>
                </div>
              </div>

              <!-- 图表内容（效果分析） -->
              <div v-if="module.charts || module.chartData" class="charts-content">
                <div v-if="isEditMode && canSelectChart(module.id)" class="chart-selection">
                  <h4>图表选择</h4>
                  <a-space wrap>
                    <a-checkbox
                      v-for="(chart, index) in getAvailableCharts(module)"
                      :key="index"
                      v-model="editData[module.id].selectedCharts[index]"
                      @change="markAsModified(module.id)"
                    >
                      {{ chart.title }}
                    </a-checkbox>
                  </a-space>
                </div>
                <div v-if="module.charts">
                  <div v-for="chart in module.charts" :key="chart.title" class="chart-section">
                    <h4>{{ chart.title }}</h4>
                    <div class="chart-container">
                      <div v-if="chart.type === 'image'" class="chart-image-container">
                        <img 
                          :src="chart.imagePath || '/charts/placeholder.svg'" 
                          :alt="chart.title"
                          class="chart-image"
                          @error="handleImageError"
                        />
                        <p v-if="chart.description" class="chart-description">{{ chart.description }}</p>
                      </div>
                      <div v-else
                        :id="`chart-${module.id}-${chart.type}`"
                        class="chart"
                        style="width: 100%; height: 400px;"
                      ></div>
                    </div>
                  </div>
                </div>
                <div v-else-if="module.chartData">
                  <div v-for="(chart, key) in module.chartData" :key="key" class="chart-section">
                    <h4>{{ chart.title }}</h4>
                    <div class="chart-container">
                      <div v-if="chart.type === 'image'" class="chart-image-container">
                        <img 
                          :src="chart.imagePath || '/charts/placeholder.svg'" 
                          :alt="chart.title"
                          class="chart-image"
                          @error="handleImageError"
                        />
                        <p v-if="chart.description" class="chart-description">{{ chart.description }}</p>
                      </div>
                      <div v-else
                        :id="`chart-${module.id}-${key}`"
                        class="chart"
                        style="width: 100%; height: 400px;"
                      ></div>
                    </div>
                  </div>
                </div>

              <!-- 改进建议（数据结论） -->
              <div v-if="module.suggestions" class="suggestions-content">
                <h4>改进建议</h4>
                <ul class="suggestions-list">
                  <li v-for="suggestion in module.suggestions" :key="suggestion">
                    {{ suggestion }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Message } from '@arco-design/web-vue';
import * as echarts from 'echarts';
import { safeInitECharts, safeDisposeChart } from '@/utils/echartsUtils';
import {
  Row as ARow,
  Col as ACol,
  Card as ACard,
  Descriptions as ADescriptions,
  Table as ATable,
  Button as AButton,
  Tag as ATag,
  Progress as AProgress,
  Textarea as ATextarea,
  Alert as AAlert,
  Space as ASpace,
  Checkbox as ACheckbox,
  Modal as AModal
} from '@arco-design/web-vue';
import {
  IconDownload,
  IconEdit,
  IconLeft,
  IconSave,
  IconSend,
  IconClose,
  IconArchive,
  IconDelete
} from '@arco-design/web-vue/es/icon';

// 定义报告数据类型
interface ReportData {
  reportName: string;
  productName: string;
  analysisPeriod: string;
  status: string;
  progress: number;
  estimatedCompletion?: string;
  editable: boolean;
  modules: Array<{
    id: number;
    name: string;
    content: string;
    type: string;
    table?: any;
    tables?: any[];
    charts?: any[];
    suggestions?: string[];
  }>;
  analysisWorkflow?: {
    currentStep: number;
    steps: Array<{
      id: number;
      name: string;
    }>;
  };
}

const router = useRouter();
const route = useRoute();

// 响应式数据
const exporting = ref(false);
const isEditMode = ref(false);
const saving = ref(false);
const publishing = ref(false);
const editData = ref<Record<number, { textContent?: string; selectedCharts?: boolean[]; }>>({});
const modifiedModules = ref<Set<number>>(new Set());

const reportData = reactive<ReportData>({
  reportName: '',
  productName: '',
  analysisPeriod: '',
  status: '',
  progress: 0,
  editable: false,
  modules: []
});

// 获取报告详情
const fetchReportDetail = async () => {
  try {
    const response = await fetch(`/api/external-data-evaluation/detail/${route.params.id}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('API响应数据:', result);
    
    if (result.code === 200 && result.data) {
      Object.assign(reportData, result.data);
      console.log('报告数据已更新:', reportData);
      
      // 渲染图表
      nextTick(() => {
        renderCharts();
      });
    } else {
      Message.error(result.message || '获取报告详情失败');
    }
  } catch (error) {
    console.error('获取报告详情失败:', error);
    Message.error('获取报告详情失败');
    
    // 提供模拟数据作为后备
    const mockData = {
      id: route.params.id,
      productName: '京东金融',
      reportType: '效果分析',
      analysisPeriod: '2024-12-01 至 2024-12-31',
      generateDate: '2024-12-19',
      status: '已完成',
      progress: 100,
      editable: true,
      modules: [
        {
          id: 1,
          name: '数据概览',
          description: '展示核心指标和趋势',
          status: '已完成',
          content: '本次分析涵盖了京东金融在2024年12月的完整数据表现...'
        }
      ]
    };
    Object.assign(reportData, mockData);
  }
};

// 获取状态颜色
const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    '已完成': 'green',
    '分析中': 'blue',
    '失败': 'red',
    '待处理': 'orange',
    '草稿': 'gray'
  };
  return colorMap[status] || 'gray';
};

// 获取当前步骤名称
const getCurrentStepName = () => {
  if (!reportData.analysisWorkflow) return '';
  const currentStep = reportData.analysisWorkflow.currentStep;
  const step = reportData.analysisWorkflow.steps.find((s: { id: number; }) => s.id === currentStep);
  return step ? step.name : '';
};

// 获取表格列配置
const getTableColumns = (table: { headers?: string[]; data?: Array<{ field?: string; description?: string; correlation?: string; significance?: string; }> }) => {
  if (!table) return [];
  
  // 如果有headers字段，直接使用
  if (table.headers) {
    return table.headers.map((header: string, index: number) => ({
      title: header,
      dataIndex: `col${index}`,
      key: `col${index}`
    }));
  }
  
  // 兼容旧格式
  if (table.data && table.data.length > 0) {
    const firstRow = table.data[0];
    const columns = [];
    
    if (firstRow.field) {
      columns.push({ title: '指标', dataIndex: 'field', key: 'field' });
      columns.push({ title: '数值', dataIndex: 'value', key: 'value' });
      if (firstRow.description) {
        columns.push({ title: '说明', dataIndex: 'description', key: 'description' });
      }
      if (firstRow.correlation) {
        columns.push({ title: '相关系数', dataIndex: 'correlation', key: 'correlation' });
        columns.push({ title: '显著性', dataIndex: 'significance', key: 'significance' });
      }
    }
    
    return columns;
  }
  
  return [];
};

// 获取表格行数据
const getTableRows = (table: { rows?: string[][]; data?: any[] }) => {
  if (!table) return [];
  
  // 如果有rows字段，转换为对象格式
  if (table.rows) {
    return table.rows.map((row: string[], index: number) => {
      const rowData: Record<string, string> = { key: index.toString() };
      row.forEach((cell, cellIndex) => {
        rowData[`col${cellIndex}`] = cell;
      });
      return rowData;
    });
  }
  
  // 兼容旧格式
  if (table.data) {
    return table.data;
  }
  
  return [];
};

// 渲染图表
const renderCharts = async () => {
  for (const module of reportData.modules) {
    if (module.charts) {
      for (const chart of module.charts) {
        const chartDom = document.getElementById(`chart-${module.id}-${chart.type}`);
        if (chartDom) {
          try {
            const myChart = await safeInitECharts(chartDom);
            const option = getChartOption(chart);
            myChart.setOption(option);
          } catch (error) {
            console.error('图表初始化失败:', error);
          }
        }
      }
    }
  }
};

// 获取图表配置
const getChartOption = (chart: { type: string; title?: string; data?: any }) => {
  switch (chart.type) {
    case 'funnel':
      return {
        title: { text: chart.title },
        tooltip: { trigger: 'item', formatter: '{a} <br/>{b} : {c}' },
        series: [{
          name: '转化漏斗',
          type: 'funnel',
          left: '10%',
          top: 60,
          width: '80%',
          height: '80%',
          data: chart.data
        }]
      };
    
    case 'line':
      return {
        title: { text: chart.title },
        tooltip: { trigger: 'axis' },
        legend: { data: chart.data.series.map((s: { name: string; }) => s.name) },
        xAxis: { type: 'category', data: chart.data.dates },
        yAxis: { type: 'value' },
        series: chart.data.series.map((s: { name: string; data: any[]; }) => ({
          name: s.name,
          type: 'line',
          data: s.data
        }))
      };
    
    case 'bar':
      return {
        title: { text: chart.title },
        tooltip: { trigger: 'axis' },
        legend: { data: chart.data.metrics.map((m: { name: string; }) => m.name) },
        xAxis: { type: 'category', data: chart.data.platforms },
        yAxis: { type: 'value' },
        series: chart.data.metrics.map((m: { name: string; data: any[]; }) => ({
          name: m.name,
          type: 'bar',
          data: m.data
        }))
      };
    
    case 'radar':
      return {
        title: { text: chart.title },
        tooltip: {},
        legend: { data: chart.data.series.map((s: { name: string; }) => s.name) },
        radar: {
          indicator: chart.data.indicators.map((name: string) => ({ name, max: 100 }))
        },
        series: [{
          type: 'radar',
          data: chart.data.series
        }]
      };
    
    default:
      return {};
  }
};

// 图片加载错误处理
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  console.error('图片加载失败:', img.src);
  img.src = '/charts/placeholder.svg'; // 使用占位符图片
  Message.warning('图片加载失败，显示占位符');
};

 

// 编辑模式切换
const toggleEditMode = () => {
  // 如果是草稿状态，跳转到编辑页
  if (reportData.status === '草稿') {
    router.push({
      name: 'externalDataEvaluationEdit',
      params: { id: route.params.id }
    });
  } else {
    isEditMode.value = true;
    initEditData();
  }
};

// 取消编辑
const cancelEdit = () => {
  isEditMode.value = false;
  modifiedModules.value.clear();
  editData.value = {};
};
// 初始化编辑数据
const initEditData = () => {
  reportData.modules.forEach((module: { id: number; content?: string; textContent?: string; charts?: any[]; chartData?: Record<string, any>; }) => {
    editData.value[module.id] = {
      textContent: module.content || module.textContent || '',
      selectedCharts: getAvailableCharts(module).map(() => true)
    };
  });
};

// 标记为已修改
const markAsModified = (moduleId: number) => {
  modifiedModules.value.add(moduleId);
};

// 获取编辑类型标签
const getEditTypeLabel = (moduleId: number) => {
  const typeMap: Record<number, string> = {
    1: '文字编辑',
    2: '文字编辑', 
    3: '表格自动生成',
    4: '表格自动生成',
    5: '文字+图片选择',
    6: '文字+图片选择',
    7: '完全编辑'
  };
  return typeMap[moduleId] || '只读';
};

// 获取编辑权限颜色
const getEditPermissionColor = (moduleId: number) => {
  const colorMap: Record<number, string> = {
    1: 'blue',
    2: 'blue',
    3: 'orange', 
    4: 'orange',
    5: 'green',
    6: 'green',
    7: 'purple'
  };
  return colorMap[moduleId] || 'gray';
};

// 获取编辑权限文本
const getEditPermissionText = (moduleId: number) => {
  const textMap: Record<number, string> = {
    1: '可编辑文字内容',
    2: '可编辑文字内容',
    3: '表格由系统自动生成',
    4: '表格由系统自动生成', 
    5: '可编辑文字和选择图表',
    6: '可编辑文字和选择图表',
    7: '可完全编辑所有内容'
  };
  return textMap[moduleId] || '只读模式';
};

// 检查是否可以编辑文字
const canEditText = (moduleId: number) => {
  return [1, 2, 5, 6, 7].includes(moduleId);
};

// 检查是否可以编辑表格
const canEditTable = (moduleId: number) => {
  return [7].includes(moduleId);
};

// 检查是否可以选择图表
const canSelectChart = (moduleId: number) => {
  return [5, 6, 7].includes(moduleId);
};

// 获取字数限制
const getWordLimit = (moduleId: number) => {
  const limitMap: Record<number, number> = {
    1: 1000,
    2: 1000,
    5: 2000,
    6: 2000,
    7: 5000
  };
  return limitMap[moduleId] || 1000;
};

// 获取可用图表
function getAvailableCharts(module: { charts?: any[]; chartData?: Record<string, any>; }) {
  if (module.charts) return module.charts;
  if (module.chartData) {
    return Object.values(module.chartData);
  }
  return [];
}

// 保存报告
const saveReport = async () => {
  saving.value = true;
  try {
    const response = await fetch(`/api/external-data-evaluation/update/${route.params.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        reportName: reportData.reportName,
        status: reportData.status,
        modules: editData.value
      })
    });

    const result = await response.json();
    if (result.code === 200) {
      Message.success('报告保存成功');
      modifiedModules.value.clear();
      // 更新原始数据
      reportData.modules.forEach((module: { id: number; content?: string; textContent?: string; }) => {
        if (editData.value[module.id]) {
          if (module.content !== undefined) {
            module.content = editData.value[module.id].textContent;
          }
          if (module.textContent !== undefined) {
            module.textContent = editData.value[module.id].textContent;
          }
        }
      });
    } else {
      Message.error(result.message || '保存失败');
    }
  } catch (error) {
    console.error('保存报告失败:', error);
    Message.error('保存报告失败');
  } finally {
    saving.value = false;
  }
};

// 发布报告
const publishReport = async () => {
  publishing.value = true;
  try {
    const response = await fetch(`/api/external-data-evaluation/publish/${route.params.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        reportName: reportData.reportName
      })
    });

    const result = await response.json();
    if (result.code === 200) {
      Message.success('报告发布成功');
      reportData.status = '已发布';
      isEditMode.value = false;
      modifiedModules.value.clear();
    } else {
      Message.error(result.message || '发布失败');
    }
  } catch (error) {
    console.error('发布报告失败:', error);
    Message.error('发布报告失败');
  } finally {
    publishing.value = false;
  }
};

// 基础信息
const basicInfo: Array<{ label: string; value: string; }> = [
  {
    label: '外数产品',
    value: reportData.productName
  },
  {
    label: '分析时间段',
    value: reportData.analysisPeriod
  },
  {
    label: '样本量',
    value: '10000'
  },
  {
    label: '报告生成时间',
    value: '2025-02-01 10:30:00'
  }
];

// 移除导航点击处理函数

// 返回上一页
const handleBack = () => {
  router.push('/exploration/external-data-evaluation');
};

// 归档报告
/**
 * 归档报告功能
 * @description 点击归档按钮后，显示确认提示框，提示归档后所有用户将不可见
 */
const archiveReport = () => {
  AModal.confirm({
    title: '确认归档',
    content: '归档后所有用户将不可见，确定要归档该报告吗？',
    okText: '确认归档',
    cancelText: '取消',
    onOk: async () => {
      try {
        const response = await fetch(`/api/external-data-evaluation/archive/${route.params.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const result = await response.json();
        if (result.code === 200) {
          Message.success('报告归档成功');
          // 可以选择跳转到列表页或更新报告状态
          router.push('/exploration/external-data-evaluation');
        } else {
          Message.error(result.message || '归档失败');
        }
      } catch (error) {
        console.error('归档报告失败:', error);
        Message.error('归档报告失败');
      }
    }
  });
};

// 删除报告
/**
 * 删除报告功能
 * @description 点击删除按钮后，显示确认提示框，提示删除后无法恢复
 */
const deleteReport = () => {
  AModal.confirm({
    title: '确认删除',
    content: '删除后无法恢复，确定要删除该报告吗？',
    okText: '确认删除',
    cancelText: '取消',
    onOk: async () => {
      try {
        const response = await fetch(`/api/external-data-evaluation/delete/${route.params.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const result = await response.json();
        if (result.code === 200) {
          Message.success('报告删除成功');
          // 跳转到报告列表页
          router.push('/exploration/external-data-evaluation');
        } else {
          Message.error(result.message || '删除失败');
        }
      } catch (error) {
        console.error('删除报告失败:', error);
        Message.error('删除报告失败');
      }
    }
  });
};

onMounted(() => {
  fetchReportDetail();
});
</script>

<style scoped>
.external-data-evaluation-detail {
  padding: 16px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.report-header {
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
  height: fit-content;
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

.nav-item.active .nav-number {
  background-color: #1890ff;
}

.nav-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-text {
  font-weight: 500;
  color: #1d2129;
}

.edit-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.edit-permission {
  font-size: 11px;
  color: #86909c;
  line-height: 1.2;
}

.progress-card {
  margin-top: 16px;
}

.progress-text {
  margin-top: 12px;
  font-size: 12px;
  color: #86909c;
}

.progress-text p {
  margin: 4px 0;
}

.content-section {
  padding: 0;
}

.module-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.module-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1d2129;
}

.edit-status {
  display: flex;
  align-items: center;
  gap: 8px;
}

.edit-hint {
  font-size: 12px;
  color: #86909c;
}

.text-content {
  margin-bottom: 16px;
}

.text-content p {
  line-height: 1.6;
  color: #4e5969;
  margin: 0;
}

.table-content,
.table-section {
  margin-top: 16px;
}

.table-content h4,
.table-section h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
}

.tables-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.charts-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.chart-section h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
}

.chart-container {
  border: 1px solid #e5e6eb;
  border-radius: 6px;
  padding: 16px;
  background-color: white;
}

.chart {
  width: 100%;
  height: 400px;
}

.suggestions-content h4 {
  margin: 16px 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
}

.suggestions-list {
  margin: 0;
  padding-left: 20px;
}

.suggestions-list li {
  margin-bottom: 8px;
  line-height: 1.5;
  color: #4e5969;
}

.table-container {
  margin: 16px 0;
}

.table-edit-container {
  position: relative;
}

.table-edit-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.chart-edit-container {
  margin: 16px 0;
}

.chart-selector {
  margin-bottom: 16px;
  padding: 12px;
  background: #f7f8fa;
  border-radius: 6px;
}

@media (max-width: 768px) {
  .external-data-evaluation-detail {
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
}
</style>
