import { MockMethod } from 'vite-plugin-mock';
import Mock from 'mockjs';

// 数据模型状态枚举
export enum DataModelStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived'
}

// 语言类型枚举
export enum LanguageType {
  SQL = 'sql',
  PYTHON = 'python'
}

// 使用场景枚举
export enum UseCase {
  DATA_ANALYSIS = 'data_analysis',
  DATA_CLEANING = 'data_cleaning',
  FEATURE_ENGINEERING = 'feature_engineering',
  MODEL_TRAINING = 'model_training',
  REPORT_GENERATION = 'report_generation',
  DATA_VALIDATION = 'data_validation'
}

// 数据模型接口定义
export interface DataModel {
  id: string;
  name: string;
  useCase: UseCase;
  languageType: LanguageType;
  manager: string;
  status: DataModelStatus;
  version: string;
  description: string;
  code: string;
  parameters: ModelParameter[];
  executionConfig: ExecutionConfig;
  createdAt: string;
  updatedAt: string;
  executionHistory: ExecutionRecord[];
  executionStats: ExecutionStats;
}

// 模型参数接口
export interface ModelParameter {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date';
  defaultValue: any;
  required: boolean;
  description: string;
}

// 执行配置接口
export interface ExecutionConfig {
  timeout: number; // 超时时间(秒)
  maxMemory: number; // 最大内存(MB)
}

// 执行记录接口
export interface ExecutionRecord {
  id: string;
  executedAt: string;
  status: 'success' | 'failed' | 'running';
  duration: number; // 执行时长(秒)
  resultRows: number;
  errorMessage?: string;
  executedBy: string;
}

// 执行统计接口
export interface ExecutionStats {
  totalExecutions: number;
  successRate: number;
  avgDuration: number;
  lastExecutedAt: string;
}

// 生成mock数据
const generateMockDataModels = (): DataModel[] => {
  return [
    {
      id: 'dm_001',
      name: '用户行为分析模型',
      useCase: UseCase.DATA_ANALYSIS,
      languageType: LanguageType.SQL,
      manager: '张三',
      status: DataModelStatus.ACTIVE,
      version: 'v1.2.0',
      description: '分析用户在平台上的行为模式，包括访问频率、停留时间、转化路径等关键指标',
      code: `SELECT 
    user_id,
    COUNT(*) as visit_count,
    AVG(session_duration) as avg_duration,
    SUM(page_views) as total_page_views,
    MAX(last_visit_date) as last_visit
FROM user_behavior_log 
WHERE visit_date >= '{start_date}'
    AND visit_date <= '{end_date}'
GROUP BY user_id
HAVING visit_count >= {min_visits}
ORDER BY total_page_views DESC
LIMIT {limit};`,
      parameters: [
        {
          id: 'p1',
          name: 'start_date',
          type: 'date',
          defaultValue: '2024-01-01',
          required: true,
          description: '分析开始日期'
        },
        {
          id: 'p2',
          name: 'end_date',
          type: 'date',
          defaultValue: '2024-12-31',
          required: true,
          description: '分析结束日期'
        },
        {
          id: 'p3',
          name: 'min_visits',
          type: 'number',
          defaultValue: 5,
          required: false,
          description: '最小访问次数过滤条件'
        },
        {
          id: 'p4',
          name: 'limit',
          type: 'number',
          defaultValue: 1000,
          required: false,
          description: '返回结果数量限制'
        }
      ],
      executionConfig: {
        timeout: 300,
        maxMemory: 2048
      },
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-03-20T14:45:00Z',
      executionHistory: [
        {
          id: 'exec_001',
          executedAt: '2024-03-20T14:45:00Z',
          status: 'success',
          duration: 45,
          resultRows: 1250,
          executedBy: '李四'
        },
        {
          id: 'exec_002',
          executedAt: '2024-03-19T09:20:00Z',
          status: 'success',
          duration: 52,
          resultRows: 1180,
          executedBy: '张三'
        }
      ],
      executionStats: {
        totalExecutions: 45,
        successRate: 95.6,
        avgDuration: 48.5,
        lastExecutedAt: '2024-03-20T14:45:00Z'
      }
    },
    {
      id: 'dm_002',
      name: '数据清洗处理脚本',
      useCase: UseCase.DATA_CLEANING,
      languageType: LanguageType.PYTHON,
      manager: '王五',
      status: DataModelStatus.ACTIVE,
      version: 'v2.1.0',
      description: '对原始数据进行清洗和预处理，包括缺失值处理、异常值检测、数据格式标准化等',
      code: `import pandas as pd
import numpy as np
from datetime import datetime

def clean_data(input_file, output_file, missing_threshold=0.3):
    """
    数据清洗主函数
    
    Args:
        input_file: 输入文件路径
        output_file: 输出文件路径
        missing_threshold: 缺失值阈值
    """
    # 读取数据
    df = pd.read_csv(input_file)
    
    # 删除缺失值过多的列
    missing_ratio = df.isnull().sum() / len(df)
    df = df.drop(columns=missing_ratio[missing_ratio > missing_threshold].index)
    
    # 处理数值型缺失值
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    df[numeric_cols] = df[numeric_cols].fillna(df[numeric_cols].median())
    
    # 处理分类型缺失值
    categorical_cols = df.select_dtypes(include=['object']).columns
    df[categorical_cols] = df[categorical_cols].fillna(df[categorical_cols].mode().iloc[0])
    
    # 异常值检测和处理
    for col in numeric_cols:
        Q1 = df[col].quantile(0.25)
        Q3 = df[col].quantile(0.75)
        IQR = Q3 - Q1
        lower_bound = Q1 - 1.5 * IQR
        upper_bound = Q3 + 1.5 * IQR
        df[col] = df[col].clip(lower_bound, upper_bound)
    
    # 保存清洗后的数据
    df.to_csv(output_file, index=False)
    
    return {
        'total_rows': len(df),
        'total_columns': len(df.columns),
        'cleaned_at': datetime.now().isoformat()
    }

# 执行清洗
if __name__ == "__main__":
    result = clean_data('{input_file}', '{output_file}', {missing_threshold})
    print(f"数据清洗完成: {result}")`,
      parameters: [
        {
          id: 'p1',
          name: 'input_file',
          type: 'string',
          defaultValue: '/data/raw/input.csv',
          required: true,
          description: '输入数据文件路径'
        },
        {
          id: 'p2',
          name: 'output_file',
          type: 'string',
          defaultValue: '/data/cleaned/output.csv',
          required: true,
          description: '输出数据文件路径'
        },
        {
          id: 'p3',
          name: 'missing_threshold',
          type: 'number',
          defaultValue: 0.3,
          required: false,
          description: '缺失值阈值(0-1之间)'
        }
      ],
      executionConfig: {
        timeout: 600,
        maxMemory: 4096
      },
      createdAt: '2024-02-10T08:15:00Z',
      updatedAt: '2024-03-18T16:30:00Z',
      executionHistory: [
        {
          id: 'exec_003',
          executedAt: '2024-03-18T16:30:00Z',
          status: 'success',
          duration: 120,
          resultRows: 50000,
          executedBy: '王五'
        }
      ],
      executionStats: {
        totalExecutions: 28,
        successRate: 92.9,
        avgDuration: 115.2,
        lastExecutedAt: '2024-03-18T16:30:00Z'
      }
    },
    {
      id: 'dm_003',
      name: '特征工程模型',
      useCase: UseCase.FEATURE_ENGINEERING,
      languageType: LanguageType.SQL,
      manager: '赵六',
      status: DataModelStatus.DRAFT,
      version: 'v0.8.0',
      description: '从原始数据中提取和构造机器学习所需的特征变量',
      code: `-- 特征工程SQL脚本
WITH user_features AS (
    SELECT 
        user_id,
        -- 基础特征
        age,
        gender,
        city,
        -- 行为特征
        COUNT(DISTINCT order_id) as order_count_30d,
        SUM(order_amount) as total_amount_30d,
        AVG(order_amount) as avg_order_amount,
        -- 时间特征
        EXTRACT(HOUR FROM first_order_time) as first_order_hour,
        EXTRACT(DOW FROM first_order_time) as first_order_dow,
        -- 偏好特征
        MODE() WITHIN GROUP (ORDER BY category) as preferred_category
    FROM user_orders 
    WHERE order_date >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY user_id, age, gender, city, first_order_time
),
rfm_features AS (
    SELECT 
        user_id,
        -- RFM特征
        CURRENT_DATE - MAX(order_date) as recency,
        COUNT(*) as frequency,
        SUM(order_amount) as monetary
    FROM user_orders
    GROUP BY user_id
)
SELECT 
    uf.*,
    rf.recency,
    rf.frequency,
    rf.monetary,
    -- 组合特征
    CASE 
        WHEN rf.recency <= 7 AND rf.frequency >= 5 THEN 'high_value'
        WHEN rf.recency <= 30 AND rf.frequency >= 2 THEN 'medium_value'
        ELSE 'low_value'
    END as user_segment
FROM user_features uf
JOIN rfm_features rf ON uf.user_id = rf.user_id;`,
      parameters: [],
      executionConfig: {
        timeout: 180,
        maxMemory: 1024
      },
      createdAt: '2024-03-01T12:00:00Z',
      updatedAt: '2024-03-15T10:20:00Z',
      executionHistory: [],
      executionStats: {
        totalExecutions: 0,
        successRate: 0,
        avgDuration: 0,
        lastExecutedAt: ''
      }
    }
  ];
};

// Mock API 配置
const mockApiConfig = [
  // 获取数据模型列表
  {
    url: '/api/data-models',
    method: 'get',
    response: ({ query }: any) => {
      const { page = 1, pageSize = 10, name, useCase, status, languageType } = query;
      let models = generateMockDataModels();
      
      // 过滤
      if (name) {
        models = models.filter(model => model.name.includes(name));
      }
      if (useCase) {
        models = models.filter(model => model.useCase === useCase);
      }
      if (status) {
        models = models.filter(model => model.status === status);
      }
      if (languageType) {
        models = models.filter(model => model.languageType === languageType);
      }
      
      // 分页
      const total = models.length;
      const start = (page - 1) * pageSize;
      const end = start + parseInt(pageSize);
      const list = models.slice(start, end);
      
      return {
        code: 200,
        message: 'success',
        data: {
          list,
          total,
          page: parseInt(page),
          pageSize: parseInt(pageSize)
        }
      };
    }
  },
  
  // 获取数据模型详情
  {
    url: '/api/data-models/:id',
    method: 'get',
    response: ({ url }: any) => {
      const id = url.split('/').pop();
      const models = generateMockDataModels();
      const model = models.find(m => m.id === id);
      
      if (!model) {
        return {
          code: 404,
          message: '数据模型不存在'
        };
      }
      
      return {
        code: 200,
        message: 'success',
        data: model
      };
    }
  },
  
  // 创建数据模型
  {
    url: '/api/data-models',
    method: 'post',
    response: ({ body }: any) => {
      const newModel = {
        id: `dm_${Date.now()}`,
        ...body,
        version: 'v1.0.0',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        executionHistory: [],
        executionStats: {
          totalExecutions: 0,
          successRate: 0,
          avgDuration: 0,
          lastExecutedAt: ''
        }
      };
      
      return {
        code: 200,
        message: '创建成功',
        data: newModel
      };
    }
  },
  
  // 更新数据模型
  {
    url: '/api/data-models/:id',
    method: 'put',
    response: ({ url, body }: any) => {
      const id = url.split('/').pop();
      const models = generateMockDataModels();
      const model = models.find(m => m.id === id);
      
      if (!model) {
        return {
          code: 404,
          message: '数据模型不存在'
        };
      }
      
      const updatedModel = {
        ...model,
        ...body,
        updatedAt: new Date().toISOString()
      };
      
      return {
        code: 200,
        message: '更新成功',
        data: updatedModel
      };
    }
  },
  
  // 删除数据模型
  {
    url: '/api/data-models/:id',
    method: 'delete',
    response: ({ url }: any) => {
      const id = url.split('/').pop();
      
      return {
        code: 200,
        message: '删除成功'
      };
    }
  },
  
  // 复制数据模型
  {
    url: '/api/data-models/:id/copy',
    method: 'post',
    response: ({ url }: any) => {
      const id = url.split('/').pop();
      const models = generateMockDataModels();
      const model = models.find(m => m.id === id);
      
      if (!model) {
        return {
          code: 404,
          message: '数据模型不存在'
        };
      }
      
      const copiedModel = {
        ...model,
        id: `dm_${Date.now()}`,
        name: `${model.name}_副本`,
        status: DataModelStatus.DRAFT,
        version: 'v1.0.0',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        executionHistory: [],
        executionStats: {
          totalExecutions: 0,
          successRate: 0,
          avgDuration: 0,
          lastExecutedAt: ''
        }
      };
      
      return {
        code: 200,
        message: '复制成功',
        data: copiedModel
      };
    }
  },
  
  // 执行数据模型
  {
    url: '/api/data-models/:id/execute',
    method: 'post',
    response: ({ url, body }: any) => {
      const id = url.split('/').pop();
      const { parameters = {} } = body;
      
      // 模拟执行过程
      const executionResult = {
        id: `exec_${Date.now()}`,
        modelId: id,
        status: 'success',
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 30000).toISOString(),
        duration: 30,
        resultRows: Mock.Random.integer(100, 10000),
        parameters,
        result: {
          columns: ['user_id', 'visit_count', 'avg_duration', 'total_page_views'],
          data: Mock.mock({
            'list|10': [{
              'user_id': '@id',
              'visit_count': '@integer(1, 100)',
              'avg_duration': '@float(10, 300, 2, 2)',
              'total_page_views': '@integer(5, 500)'
            }]
          }).list
        }
      };
      
      return {
        code: 200,
        message: '执行成功',
        data: executionResult
      };
    }
  },
  
  // 获取执行历史
  {
    url: '/api/data-models/:id/executions',
    method: 'get',
    response: ({ url, query }: any) => {
      const id = url.split('/')[3]; // /api/data-models/:id/executions
      const { page = 1, pageSize = 10 } = query;
      
      const models = generateMockDataModels();
      const model = models.find(m => m.id === id);
      
      if (!model) {
        return {
          code: 404,
          message: '数据模型不存在'
        };
      }
      
      const total = model.executionHistory.length;
      const start = (page - 1) * pageSize;
      const end = start + parseInt(pageSize);
      const list = model.executionHistory.slice(start, end);
      
      return {
        code: 200,
        message: 'success',
        data: {
          list,
          total,
          page: parseInt(page),
          pageSize: parseInt(pageSize)
        }
      };
    }
  }
] as MockMethod[];

// 导出 mock 数据
export const mockDataModels = generateMockDataModels();

// 导出 mock API 配置
export default mockApiConfig;