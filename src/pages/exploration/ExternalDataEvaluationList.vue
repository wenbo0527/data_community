<template>
  <div class="external-data-evaluation-list">
    <a-card class="filter-card">
      <a-row :gutter="24">
        <a-col :span="8">
          <a-form-item label="报告生成日期">
            <a-range-picker
              v-model="dateRange"
              style="width: 100%"
              @change="handleDateChange"
            />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="报告类型">
            <a-select
              v-model="reportType"
              @change="handleTypeChange"
              :default-value="'产品级效果评估'"
            >
              <a-option value="产品级效果评估">产品级效果评估</a-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="状态">
            <a-select
              v-model="statusFilter"
              @change="handleStatusChange"
              placeholder="请选择状态"
              allow-clear
            >
              <a-option value="已提交">已提交</a-option>
              <a-option value="草稿">草稿</a-option>
              <a-option value="已发布">已发布</a-option>
              <a-option value="已归档">已归档</a-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-button
            type="primary"
            @click="handleCreateReport"
            style="float: right"
          >
            新建分析报告
          </a-button>
        </a-col>
      </a-row>
    </a-card>


    <a-card>
      <a-table
        :columns="columns"
        :data="reportList"
        :pagination="pagination"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
      >
        <template #status="{ record }">
          <a-tag
            :color="getStatusColor(record.status)"
            size="small"
          >
            {{ record.status }}
          </a-tag>
        </template>
        <template #reportName="{ record }">
          <a @click="handleReportNameClick(record)">{{ record.reportName }}</a>
        </template>

      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  Card as ACard,
  Row as ARow,
  Col as ACol,
  FormItem as AFormItem,
  RangePicker as ARangePicker,
  Select as ASelect,
  Option as AOption,
  Button as AButton,
  Table as ATable,
  Tag as ATag,
  Message
} from '@arco-design/web-vue';

const router = useRouter();

// 筛选条件
const dateRange = ref([]);
const reportType = ref('产品级效果评估');
const statusFilter = ref('');

/**
 * 处理状态变更
 * @param value - 状态值
 */
/**
 * 处理状态变更
 * @param value - 状态值
 */
const handleStatusChange = (value: string) => {
  statusFilter.value = value;
  console.log('状态筛选值:', value);
  // 重新加载数据
  loadReportList();
};

// 表格数据
const reportList = ref([]);

// 分页配置
interface PaginationConfig {
  current: number;
  pageSize: number;
  total: number;
  showTotal: boolean;
  showJumper: boolean;
  pageSizeOptions: number[];
}

const pagination = reactive<PaginationConfig>({
  current: 1,
  pageSize: 20,
  total: 0,
  showTotal: true,
  showJumper: true,
  pageSizeOptions: [10, 20, 50, 100]
});

// 处理新建报告
const handleCreateReport = () => {
  // 跳转到新建分析报告页面
  router.push({ name: 'createExternalDataEvaluation' });
};

// 表格列定义
const columns = [
  {
    title: '报告名称',
    dataIndex: 'reportName',
    slotName: 'reportName'
  },
  {
    title: '外数产品名称',
    dataIndex: 'productName'
  },
  {
    title: '报告类型',
    dataIndex: 'reportType'
  },
  {
    title: '分析时间跨度',
    dataIndex: 'analysisPeriod'
  },
  {
    title: '报告生成日期',
    dataIndex: 'generateDate'
  },
  {
    title: '状态',
    dataIndex: 'status',
    slotName: 'status'
  }
];

// 状态颜色映射
const getStatusColor = (status: string) => {
  switch (status) {
    case '已提交':
      return 'blue';
    case '草稿':
      return 'orange';
    case '已发布':
      return 'green';
    case '已归档':
      return 'gray';
    default:
      return 'blue';
  }
};

// 处理日期筛选
const handleDateChange = (value: string[]) => {
  console.log('日期筛选:', value);
  if (value && value.length === 2) {
    loadReportList();
  }
};

// 处理类型筛选
const handleTypeChange = (value: string) => {
  console.log('类型筛选:', value);
  loadReportList();
};

// 处理分页
const handlePageChange = (current: number) => {
  pagination.current = current;
  // 重新加载数据
  loadReportList();
};

const handlePageSizeChange = (pageSize: number) => {
  pagination.pageSize = pageSize;
  // 重新加载数据
  loadReportList();
};

// 跳转到详情页
const goToDetail = (id: number) => {
  router.push({ name: 'externalDataEvaluationDetail', params: { id } }).catch(err => {
    console.error('Navigation error:', err);
  });
};

/**
 * 处理报告名称点击事件
 * @param record - 报告记录
 */
const handleReportNameClick = (record: ReportItem) => {
  // 如果状态为'已提交'，跳转到任务进度页面
  if (record.status === '已提交') {
    router.push({ 
      name: 'externalDataEvaluationProgress', 
      query: { 
        taskId: record.id, 
        taskName: record.reportName 
      } 
    }).catch(err => {
      console.error('Navigation error:', err);
    });
  } else {
    // 否则跳转到详情页面
    goToDetail(record.id);
  }
};

/**
 * 发布报告
 * @param id - 报告ID
 */
const handlePublishReport = async (id: number) => {
  try {
    // 调用发布API
    const response = await publishReport(id);
    if (response.data && response.data.code === 200) {
      // 更新本地状态
      const report = reportList.value.find((item: ReportItem) => item.id === id);
      if (report) {
        report.status = '已发布';
      }
      Message.success('发布成功');
    } else {
      Message.error(response.data?.message || '发布失败');
    }
  } catch (error) {
    console.error('发布报告失败:', error);
    Message.error('发布失败');
  }
};

/**
 * 归档报告
 * @param id - 报告ID
 */
const handleArchiveReport = async (id: number) => {
  try {
    // 调用归档API
    const response = await archiveReport(id);
    if (response.data && response.data.code === 200) {
      // 更新本地状态
      const report = reportList.value.find((item: ReportItem) => item.id === id);
      if (report) {
        report.status = '已归档';
      }
      Message.success('归档成功');
    } else {
      Message.error(response.data?.message || '归档失败');
    }
  } catch (error) {
    console.error('归档报告失败:', error);
    Message.error('归档失败');
  }
};


// 定义报告数据类型
interface ReportItem {
  id: number;
  reportName: string;
  productName: string;
  reportType: string;
  analysisPeriod: string;
  generateDate: string;
  status: string;
  progress?: number; // 处理进度百分比
  estimatedTime?: string; // 预计剩余时间
  failReason?: string; // 失败原因
}

// 导入API方法
import { getEvaluationReports, publishReport, archiveReport } from '@/api/external/evaluation';

const loadReportList = async () => {
  try {
    // 调用API获取数据
    // 定义API参数类型接口
    interface GetEvaluationReportsParams {
      page: number;
      pageSize: number;
      startDate: string;
      endDate: string;
      reportType: string;
      status?: string;
    }

    const params: GetEvaluationReportsParams = {
      page: pagination.current,
      pageSize: pagination.pageSize,
      startDate: '',
      endDate: '',
      reportType: reportType.value
    };

    // 只有当statusFilter有值时才添加该参数
    if (statusFilter.value) {
      params.status = statusFilter.value;
    }

    const response = await getEvaluationReports(params);
    console.log('API响应:', response);
    
    if (response.data && response.data.code === 200) {
      // 正确处理API返回的数据结构
      const apiData = response.data.data;
      reportList.value = apiData.list as ReportItem[];
      pagination.total = apiData.total;
      pagination.current = apiData.current;
    } else if (response.data && Array.isArray(response.data)) {
      // 兼容直接返回数组的情况
      reportList.value = response.data as ReportItem[];
      pagination.total = response.data.length;
    } else {
      console.warn('API返回数据格式异常:', response.data);
      reportList.value = [];
      pagination.total = 0;
    }
  } catch (error) {
    console.error('获取报告列表失败:', error);
    // 失败时使用模拟数据
    reportList.value = [
      {
        id: 1,
        reportName: '京东金融-产品级评估-20250101-20250131',
        productName: '京东金融',
        reportType: '产品级效果评估',
        analysisPeriod: '20250101-20250131',
        generateDate: '2025-01-15',
        status: '已完成'
      },
      {
        id: 2,
        reportName: '蚂蚁花呗-产品级评估-20250101-20250131',
        productName: '蚂蚁花呗',
        reportType: '产品级效果评估',
        analysisPeriod: '20250101-20250131',
        generateDate: '2025-01-16',
        status: '处理中'
      },
      {
        id: 3,
        reportName: '腾讯支付-产品级评估-20250101-20250131',
        productName: '腾讯支付',
        reportType: '产品级效果评估',
        analysisPeriod: '20250101-20250131',
        generateDate: '2025-01-17',
        status: '已提交'
      }
    ] as ReportItem[];
    pagination.total = 3;
  }
};

onMounted(() => {
    loadReportList();
  });

  defineExpose({
    goToDetail,
    handleCreateReport,
    handlePublishReport,
    handleArchiveReport,
    handleReportNameClick
  });
</script>

<style scoped>
.external-data-evaluation-list {
  padding: 20px;
}

.filter-card {
  margin-bottom: 20px;
}
</style>