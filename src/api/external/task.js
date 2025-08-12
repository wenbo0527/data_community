// 任务管理API服务
import { Message } from '@arco-design/web-vue';

// 定义任务类型接口
/**
 * 任务配置接口
 * @interface TaskConfig
 * @property {string} productName - 产品名称
 * @property {string} reportType - 报告类型
 * @property {string} analysisPeriod - 分析周期
 */
interface TaskConfig {
  productName: string;
  reportType: string;
  analysisPeriod: string;
}

/**
 * 任务接口
 * @interface Task
 * @property {number} id - 任务ID
 * @property {string} taskName - 任务名称
 * @property {string} createTime - 创建时间
 * @property {string} estimatedTime - 预计完成时间
 * @property {string} status - 任务状态
 * @property {number} progress - 任务进度
 * @property {TaskConfig} config - 任务配置
 */
interface Task {
  id: number;
  taskName: string;
  createTime: string;
  estimatedTime: string;
  status: '已完成' | '进行中' | '已失败';
  progress: number;
  config: TaskConfig;
}

// 模拟任务数据存储
// 模拟任务数据存储，包含配置信息
let tasks: Task[] = [
  {
    id: 1,
    taskName: '京东金融-产品级评估',
    createTime: '2025-01-15 10:30:00',
    estimatedTime: '2025-01-15 12:30:00',
    status: '已完成',
    progress: 100,
    config: {
      productName: '京东金融',
      reportType: '产品级效果评估',
      analysisPeriod: '20250101-20250131'
    }
  },
  {
    id: 2,
    taskName: '蚂蚁花呗-产品级评估',
    createTime: '2025-01-16 09:15:00',
    estimatedTime: '2025-01-16 11:15:00',
    status: '进行中',
    progress: 60,
    config: {
      productName: '蚂蚁花呗',
      reportType: '产品级效果评估',
      analysisPeriod: '20250101-20250131'
    }
  },
  {
    id: 3,
    taskName: '腾讯支付-产品级评估',
    createTime: '2025-01-17 14:00:00',
    estimatedTime: '2025-01-17 16:00:00',
    status: '进行中',
    progress: 30,
    config: {
      productName: '腾讯支付',
      reportType: '产品级效果评估',
      analysisPeriod: '20250101-20250131'
    }
  },
  {
    id: 4,
    taskName: '百度钱包-产品级评估',
    createTime: '2025-01-14 16:45:00',
    estimatedTime: '2025-01-14 18:45:00',
    status: '已失败',
    progress: 45,
    config: {
      productName: '百度钱包',
      reportType: '产品级效果评估',
      analysisPeriod: '20250101-20250131'
    }
  }
];

/**
 * 获取任务列表
 * @param {Object} params - 查询参数
 * @param {string} [params.status] - 任务状态筛选
 * @param {number} [params.page=1] - 页码
 * @param {number} [params.pageSize=20] - 每页条数
 * @returns {Promise<{ code: number; data: { list: Task[]; total: number; current: number } }>}
 */
export const getTasks = (params: { status?: string; page?: number; pageSize?: number }) => {
  return new Promise<{ code: number; data: { list: Task[]; total: number; current: number } }>((resolve) => {
    // 模拟API延迟
    setTimeout(() => {
      let filteredTasks = [...tasks];

      // 应用筛选条件
      if (params.status) {
        filteredTasks = filteredTasks.filter(task => task.status === params.status);
      }

      // 模拟分页
      const { page = 1, pageSize = 20 } = params;
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedTasks = filteredTasks.slice(startIndex, endIndex);

      resolve({
        code: 200,
        data: {
          list: paginatedTasks,
          total: filteredTasks.length,
          current: page
        }
      });
    }, 500);
  });
};

/**
 * 获取任务详情
 * @param {number} taskId - 任务ID
 * @returns {Promise<{ code: number; data?: Task; message?: string }>}
 */
export const getTaskDetail = (taskId: number) => {
  return new Promise<{ code: number; data?: Task; message?: string }>((resolve) => {
    // 模拟API延迟
    setTimeout(() => {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        resolve({
          code: 200,
          data: task
        });
      } else {
        resolve({
          code: 404,
          message: '任务不存在'
        });
      }
    }, 500);
  });
};

/**
 * 创建新任务
 * @param {Object} taskData - 任务数据
 * @param {string} taskData.taskName - 任务名称
 * @param {TaskConfig} [taskData.config] - 任务配置
 * @returns {Promise<{ code: number; data: Task }>}
 */
export const createTask = (taskData: { taskName: string; config?: Partial<TaskConfig> }) => {
  return new Promise<{ code: number; data: Task }>((resolve) => {
    // 模拟API延迟
    setTimeout(() => {
      // 生成新任务ID
      const newId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;

      // 创建新任务
      const newTask: Task = {
        id: newId,
        taskName: taskData.taskName,
        createTime: new Date().toLocaleString(),
        estimatedTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toLocaleString(),
        status: '进行中',
        progress: 0,
        config: taskData.config || {
          productName: '',
          reportType: '',
          analysisPeriod: ''
        }
      };

      // 添加到任务列表
      tasks.push(newTask);

      Message.success('任务创建成功');
      resolve({
        code: 200,
        data: newTask
      });
    }, 500);
  });
};

/**
 * 更新任务进度
 * @param {number} id - 任务ID
 * @param {number} progress - 进度百分比
 * @returns {Promise<{ code: number; data?: Task; message?: string }>}
 */
export const updateTaskProgress = (id: number, progress: number) => {
  return new Promise<{ code: number; data?: Task; message?: string }>((resolve) => {
    // 模拟API延迟
    setTimeout(() => {
      const taskIndex = tasks.findIndex(t => t.id === id);
      if (taskIndex !== -1) {
        tasks[taskIndex].progress = progress;

        // 更新状态
        if (progress === 100) {
          tasks[taskIndex].status = '已完成';
        } else if (progress > 0 && tasks[taskIndex].status !== '已失败') {
          tasks[taskIndex].status = '进行中';
        }

        resolve({
          code: 200,
          data: tasks[taskIndex]
        });
      } else {
        resolve({
          code: 404,
          message: '任务不存在'
        });
      }
    }, 300);
  });
};