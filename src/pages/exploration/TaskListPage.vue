<template>
  <div class="task-list-page">
    <ACard class="filter-card">
      <ARow :gutter="24">
        <ACol :span="8">
          <AFormItem label="任务创建日期">
            <ARangePicker
              v-model="dateRange"
              style="width: 100%"
              @change="handleDateChange"
            />
          </AFormItem>
        </ACol>
        <ACol :span="8">
          <AFormItem label="任务状态">
            <ASelect
              v-model="statusFilter"
              @change="handleStatusChange"
              placeholder="请选择状态"
              allow-clear
            >
              <AOption value="进行中">进行中</AOption>
              <AOption value="已完成">已完成</AOption>
              <AOption value="已失败">已失败</AOption>
            </ASelect>
          </AFormItem>
        </ACol>
      </ARow>
    </ACard>


    <ACard>
      <ATable
        :columns="columns"
        :data="taskList"
        :pagination="pagination"
        :bordered="false"
        class="table-borderless table-compact"
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
        <template #action="{ record }">
          <AButton @click="viewTask(record.id, record.taskName)">查看详情</AButton>
        </template>
      </ATable>
    </ACard>
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

// 导入任务API服务
import { getTasks } from '@/api/external/task.ts';

const router = useRouter();

// 筛选条件
const dateRange = ref([]);
const statusFilter = ref('');

/**
 * 处理状态变更
 * @param value - 状态值
 */
const handleStatusChange = (value: string) => {
  statusFilter.value = value;
  // 重新加载数据
  loadTaskList();
};

/**
 * 处理日期变更
 * @param value - 日期范围
 */
const handleDateChange = (value: string[]) => {
  if (value && value.length === 2) {
    loadTaskList();
  }
};

// 表格数据
const taskList = ref([]);

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

// 处理新建任务
const handleCreateTask = () => {
  // 跳转到新建分析报告页面
  router.push({ name: 'createExternalDataEvaluation' });
};

// 表格列定义
const columns = [
  {
    title: '任务ID',
    dataIndex: 'id'
  },
  {
    title: '任务名称',
    dataIndex: 'taskName'
  },
  {
    title: '创建时间',
    dataIndex: 'createTime'
  },
  {
    title: '状态',
    dataIndex: 'status',
    slotName: 'status'
  },
  {
    title: '操作',
    slotName: 'action',
    width: 120
  }
];

// 状态颜色映射
const getStatusColor = (status: string) => {
  switch (status) {
    case '进行中':
      return 'blue';
    case '已完成':
      return 'green';
    case '已失败':
      return 'red';
    default:
      return 'blue';
  }
};

// 处理分页
const handlePageChange = (current: number) => {
  pagination.current = current;
  // 重新加载数据
  loadTaskList();
};

const handlePageSizeChange = (pageSize: number) => {
  pagination.pageSize = pageSize;
  // 重新加载数据
  loadTaskList();
};

/**
 * 查看任务详情
 * @param id - 任务ID
 * @param taskName - 任务名称
 */
const viewTask = (id: number, taskName: string) => {
  router.push({
    name: 'externalDataEvaluationProgress',
    query: {
      taskId: id,
      taskName: taskName
    }
  }).catch(err => {
    console.error('Navigation error:', err);
  });
};

// 定义任务数据类型
interface TaskConfig {
  productName: string;
  reportType: string;
  analysisPeriod: string;
}

interface TaskItem {
  id: number;
  taskName: string;
  createTime: string;
  estimatedTime: string;
  status: string;
  progress: number;
  config: TaskConfig;
}

/**
 * 加载任务列表数据
 */
const loadTaskList = async () => {
  try {
    // 准备请求参数
    const params = {
      page: pagination.current,
      pageSize: pagination.pageSize,
      status: statusFilter.value || undefined
    };

    // 调用API获取任务列表
    const response = await getTasks(params);
    if (response && response.code === 200 && response.data) {
      taskList.value = response.data.list as TaskItem[];
      pagination.total = response.data.total || 0;
    } else {
      Message.error('获取任务列表失败: 未知错误');
    }
  } catch (error) {
    console.error('获取任务列表失败:', error);
    Message.error('网络异常，获取任务列表失败');
  }
};

onMounted(() => {
  loadTaskList();
});
</script>

<style scoped>
.task-list-page {
  padding: 20px;
  background-color: var(--color-fill-2);
  min-height: calc(100vh - 60px);
}

.filter-card {
  margin-bottom: 20px;
}
</style>