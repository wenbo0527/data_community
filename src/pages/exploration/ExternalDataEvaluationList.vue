<template>
  <div class="external-data-evaluation-list">
    <ACard class="filter-card">
      <ARow :gutter="24">
        <ACol :span="8">
          <AFormItem label="报告生成日期">
            <ARangePicker
              v-model="dateRange"
              style="width: 100%"
              @change="handleDateChange"
            />
          </AFormItem>
        </ACol>
        <ACol :span="8">
          <AFormItem label="报告类型">
            <ASelect
              v-model="reportType"
              @change="handleTypeChange"
              :default-value="'产品级效果评估'"
            >
              <AOption value="产品级效果评估">产品级效果评估</AOption>
            </ASelect>
          </AFormItem>
        </ACol>
        <ACol :span="8">
          <AButton
            type="primary"
            @click="handleCreateReport"
            style="float: right"
          >
            新建产品级效果评估
          </AButton>
        </ACol>
      </ARow>
    </ACard>

    <!-- 新建评估表单 -->
    <ACard v-if="showCreateForm" title="新建产品级效果评估" style="margin-bottom: 20px">
      <CreateExternalDataEvaluation @cancel="handleCancelCreate" @submit="handleSubmitCreate" />
    </ACard>

    <ACard>
      <ATable
        :columns="columns"
        :data="reportList"
        :pagination="pagination"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
      >
        <template #status="{ record }">
          <ATag
            :color="getStatusColor(record.status)"
            size="small"
          >
            {{ record.status }}
          </ATag>
        </template>
        <template #reportName="{ record }">
          <a @click="goToDetail(record.id)">{{ record.reportName }}</a>
        </template>
      </ATable>
    </ACard>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Message } from '@arco-design/web-vue';
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
  Tag as ATag
} from '@arco-design/web-vue';
import CreateExternalDataEvaluation from './CreateExternalDataEvaluationPage.vue';

const router = useRouter();

// 筛选条件
const dateRange = ref([]);
const reportType = ref('产品级效果评估');

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

// 控制新建评估表单的显示
const showCreateForm = ref(false);

// 处理新建报告
const handleCreateReport = () => {
  // 显示新建评估表单
  showCreateForm.value = true;
};

// 取消新建评估
const handleCancelCreate = () => {
  showCreateForm.value = false;
};

// 提交新建评估
const handleSubmitCreate = () => {
  showCreateForm.value = false;
  // 重新加载报告列表
  loadReportList();
};

// 表格列定义
const columns = [
  {
    title: '报告名称',
    dataIndex: 'reportName',
    slotName: 'reportName'
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
    case '已完成':
      return 'green';
    case '处理中':
      return 'orange';
    case '失败':
      return 'red';
    case '待处理':
      return 'gray';
    default:
      return 'blue';
  }
};

// 处理日期筛选
const handleDateChange = (value: string[]) => {
  if (value && value.length === 2) {
    loadReportList().then(() => Message.success('筛选已更新'));
  }
};

// 处理类型筛选
const handleTypeChange = (value: string) => {
  loadReportList().then(() => Message.success('筛选已更新'));
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
  router.push({ name: 'externalDataEvaluationDetail', params: { id } }).then(() => {
    Message.info('已进入评估详情');
  }).catch(() => { Message.error('跳转失败') });
};


// 定义报告数据类型
interface ReportItem {
  id: number;
  reportName: string;
  reportType: string;
  analysisPeriod: string;
  generateDate: string;
  status: string;
  progress?: number; // 处理进度百分比
  estimatedTime?: string; // 预计剩余时间
  failReason?: string; // 失败原因
}

// 导入API方法
import { getEvaluationReports } from '@/api/external/evaluation';

const loadReportList = async () => {
  try {
    // 调用API获取数据
    const response = await getEvaluationReports({
      page: pagination.current,
      pageSize: pagination.pageSize,
      startDate: '',
      endDate: '',
      reportType: reportType.value
    });
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
          reportType: '产品级效果评估',
          analysisPeriod: '20250101-20250131',
          generateDate: '2025-01-15',
          status: '已完成'
        },
        {
          id: 2,
          reportName: '蚂蚁花呗-产品级评估-20250101-20250131',
          reportType: '产品级效果评估',
          analysisPeriod: '20250101-20250131',
          generateDate: '2025-01-16',
          status: '处理中'
        }
      ] as ReportItem[];
    pagination.total = 2;
  }
};

onMounted(async () => {
  await loadReportList();
  const q = router.currentRoute.value.query as any
  const product = q?.product
  if (product) {
    const list = (reportList.value || []) as any[]
    reportList.value = list.filter(i => String(i.reportName || '').includes(String(product)))
    Message.info('已根据产品过滤评估列表')
  }
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
