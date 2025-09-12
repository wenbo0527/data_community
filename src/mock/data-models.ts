import * as Mock from 'mockjs';

// 数据模型状态枚举
export const DataModelStatus = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  ARCHIVED: 'ARCHIVED'
} as const;

// 语言类型枚举
export const LanguageType = {
  SQL: 'SQL',
  PYTHON: 'PYTHON'
} as const;

// 使用场景枚举
export const UseCase = {
  CREDIT_ANALYSIS: 'CREDIT_ANALYSIS',
  RISK_ASSESSMENT: 'RISK_ASSESSMENT',
  EXPERIMENT_REVIEW: 'EXPERIMENT_REVIEW',
  CUSTOMER_SEGMENTATION: 'CUSTOMER_SEGMENTATION',
  FRAUD_DETECTION: 'FRAUD_DETECTION',
  PORTFOLIO_ANALYSIS: 'PORTFOLIO_ANALYSIS',
  DETAIL_DATA_QUERY: 'DETAIL_DATA_QUERY'
} as const;

// 数据模型接口定义
export interface DataModel {
  id: string;
  name: string;
  useCase: keyof typeof UseCase;
  language: keyof typeof LanguageType;
  manager: string;
  status: keyof typeof DataModelStatus;
  version: string;
  description: string;
  code: string;
  parameters: ModelParameter[];
  executionConfig: ExecutionConfig;
  createdAt: string;
  updatedAt: string;
  executionHistory: ExecutionRecord[];
  executionStats: ExecutionStats;
  creditStatusSlices?: CreditStatusSlice[];
}

// 模型参数接口
export interface ModelParameter {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date';
  defaultValue: string | number | boolean | Date;
  required: boolean;
  description: string;
  isFixed?: boolean;
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
  parameters?: Record<string, any>;
  error?: string;
}

// 执行统计接口
export interface ExecutionStats {
  totalExecutions: number;
  successRate: number;
  avgDuration: number;
  lastExecutedAt: string;
}

// 版本管理工具函数
const generateNextVersion = (currentVersion: string): string => {
  const versionMatch = currentVersion.match(/^v(\d+)\.(\d+)\.(\d+)$/);
  if (!versionMatch) {
    return 'v1.0.0';
  }
  
  const [, major, minor, patch] = versionMatch;
  const newMinor = parseInt(minor) + 1;
  return `v${major}.${newMinor}.0`;
};

const getVersionHistory = (modelId: string): string[] => {
  // 模拟版本历史记录
  const histories: { [key: string]: string[] } = {
    'dm_001': ['v1.0.0', 'v1.1.0', 'v1.2.0', 'v1.3.0'],
    'dm_002': ['v1.0.0', 'v1.1.0', 'v1.2.0'],
    'dm_003': ['v1.0.0', 'v1.1.0'],
    'dm_004': ['v1.0.0']
  };
  return histories[modelId] || ['v1.0.0'];
};

// 客户授信状态切片数据接口
export interface CreditStatusSlice {
  sliceId: string;
  customerId: string;
  customerName: string;
  idNumber: string;
  sliceDate: string;
  creditLimit: number;
  usedAmount: number;
  availableAmount: number;
  utilizationRate: number;
  overdueAmount: number;
  overdueDays: number;
  overdueCount: number;
  riskLevel: 'A' | 'B' | 'C' | 'D';
  creditScore: number;
  accountStatus: 'NORMAL' | 'OVERDUE' | 'FROZEN' | 'CLOSED';
  creditType: 'PERSONAL' | 'BUSINESS' | 'MORTGAGE' | 'CREDIT_CARD';
  repaymentRecord: RepaymentRecord[];
  changeHistory: CreditChangeHistory[];
}

// 还款记录接口
export interface RepaymentRecord {
  recordId: string;
  repaymentDate: string;
  repaymentAmount: number;
  principalAmount: number;
  interestAmount: number;
  penaltyAmount: number;
  repaymentStatus: 'ON_TIME' | 'LATE' | 'PARTIAL' | 'MISSED';
  daysLate: number;
}

// 授信变更历史接口
export interface CreditChangeHistory {
  changeId: string;
  changeDate: string;
  changeType: 'LIMIT_INCREASE' | 'LIMIT_DECREASE' | 'STATUS_CHANGE' | 'RISK_ADJUSTMENT';
  oldValue: string | number;
  newValue: string | number;
  changeReason: string;
  operator: string;
  approver?: string;
}

// 生成客户授信状态切片mock数据
const generateCreditStatusSlices = (): CreditStatusSlice[] => {
  const customers = [
    { id: 'CUST_001', name: '张伟', idNumber: '110101199001011234' },
    { id: 'CUST_002', name: '李娜', idNumber: '110101199002022345' },
    { id: 'CUST_003', name: '王强', idNumber: '110101199003033456' },
    { id: 'CUST_004', name: '刘敏', idNumber: '110101199004044567' },
    { id: 'CUST_005', name: '陈杰', idNumber: '110101199005055678' }
  ];

  const slices: CreditStatusSlice[] = [];
  
  customers.forEach((customer, index) => {
    // 为每个客户生成3-5个历史切片
    const sliceCount = 3 + index;
    for (let i = 0; i < sliceCount; i++) {
      const baseDate = new Date('2024-01-01');
      baseDate.setMonth(baseDate.getMonth() + i * 2);
      
      const creditLimit = 50000 + index * 20000 + i * 5000;
      const usedAmount = creditLimit * (0.3 + Math.random() * 0.5);
      const overdueDays = i > 2 ? Math.floor(Math.random() * 30) : 0;
      
      slices.push({
        sliceId: `SLICE_${customer.id}_${i + 1}`,
        customerId: customer.id,
        customerName: customer.name,
        idNumber: customer.idNumber,
        sliceDate: baseDate.toISOString().split('T')[0],
        creditLimit,
        usedAmount: Math.round(usedAmount),
        availableAmount: Math.round(creditLimit - usedAmount),
        utilizationRate: Math.round((usedAmount / creditLimit) * 100 * 100) / 100,
        overdueAmount: overdueDays > 0 ? Math.round(usedAmount * 0.1) : 0,
        overdueDays,
        overdueCount: overdueDays > 0 ? Math.floor(Math.random() * 3) + 1 : 0,
        riskLevel: overdueDays === 0 ? 'A' : overdueDays <= 15 ? 'B' : overdueDays <= 30 ? 'C' : 'D',
        creditScore: 800 - overdueDays * 5 - index * 20,
        accountStatus: overdueDays === 0 ? 'NORMAL' : overdueDays <= 30 ? 'OVERDUE' : 'FROZEN',
        creditType: (['PERSONAL', 'BUSINESS', 'MORTGAGE', 'CREDIT_CARD'] as const)[index % 4],
        repaymentRecord: generateRepaymentRecords(customer.id, i),
        changeHistory: generateChangeHistory(customer.id, i)
      });
    }
  });
  
  return slices;
};

// 生成还款记录
const generateRepaymentRecords = (customerId: string, sliceIndex: number): RepaymentRecord[] => {
  const records: RepaymentRecord[] = [];
  const recordCount = 2 + sliceIndex;
  
  for (let i = 0; i < recordCount; i++) {
    const repaymentDate = new Date('2024-01-01');
    repaymentDate.setMonth(repaymentDate.getMonth() + sliceIndex * 2 + i);
    
    const isLate = Math.random() > 0.8;
    const daysLate = isLate ? Math.floor(Math.random() * 15) : 0;
    
    records.push({
      recordId: `REP_${customerId}_${sliceIndex}_${i}`,
      repaymentDate: repaymentDate.toISOString().split('T')[0],
      repaymentAmount: 2000 + Math.floor(Math.random() * 3000),
      principalAmount: 1500 + Math.floor(Math.random() * 2000),
      interestAmount: 300 + Math.floor(Math.random() * 500),
      penaltyAmount: daysLate > 0 ? 50 + Math.floor(Math.random() * 200) : 0,
      repaymentStatus: daysLate === 0 ? 'ON_TIME' : daysLate <= 7 ? 'LATE' : 'PARTIAL',
      daysLate
    });
  }
  
  return records;
};

// 生成变更历史
const generateChangeHistory = (customerId: string, sliceIndex: number): CreditChangeHistory[] => {
  const changes: CreditChangeHistory[] = [];
  
  if (sliceIndex > 0) {
    const changeDate = new Date('2024-01-01');
    changeDate.setMonth(changeDate.getMonth() + sliceIndex * 2 - 1);
    
    const changeTypes = ['LIMIT_INCREASE', 'LIMIT_DECREASE', 'STATUS_CHANGE', 'RISK_ADJUSTMENT'];
    const changeType = changeTypes[sliceIndex % changeTypes.length];
    
    changes.push({
      changeId: `CHG_${customerId}_${sliceIndex}`,
      changeDate: changeDate.toISOString().split('T')[0],
      changeType: changeType as 'LIMIT_INCREASE' | 'LIMIT_DECREASE' | 'STATUS_CHANGE' | 'RISK_ADJUSTMENT',
      oldValue: changeType.includes('LIMIT') ? 45000 + sliceIndex * 5000 : 'B',
      newValue: changeType.includes('LIMIT') ? 50000 + sliceIndex * 5000 : 'A',
      changeReason: changeType === 'LIMIT_INCREASE' ? '信用记录良好，主动提额' : 
                   changeType === 'LIMIT_DECREASE' ? '风险评估调整' :
                   changeType === 'STATUS_CHANGE' ? '账户状态更新' : '风险等级调整',
      operator: ['张三', '李四', '王五'][sliceIndex % 3],
      approver: ['审批员A', '审批员B', '审批员C'][sliceIndex % 3]
    });
  }
  
  return changes;
};

// 生成mock数据
const generateMockDataModels = (): DataModel[] => {
  return [
    {
      id: 'dm_001',
      name: '客户级历史授信状态切片',
      useCase: UseCase.CREDIT_ANALYSIS,
      language: LanguageType.SQL,
      manager: '张三',
      status: DataModelStatus.ACTIVE,
      version: '1.2.0',
      description: '分析客户历史授信状态变化，包括授信额度、使用率、逾期情况等关键风险指标，支持客户风险评级、授信类型、还款记录等多维度分析',
      creditStatusSlices: generateCreditStatusSlices(),
      code: `SELECT 
    cch.customer_id,
    cch.credit_limit,
    cch.used_amount,
    ROUND(cch.used_amount / cch.credit_limit * 100, 2) as utilization_rate,
    cch.overdue_days,
    cch.risk_level,
    cch.last_update_date,
    c.id_card,
    c.customer_name,
    CASE 
        WHEN cch.overdue_days = 0 THEN '正常'
        WHEN cch.overdue_days <= 30 THEN '轻微逾期'
        WHEN cch.overdue_days <= 90 THEN '中度逾期'
        ELSE '严重逾期'
    END as overdue_status
FROM customer_credit_history cch
LEFT JOIN customers c ON cch.customer_id = c.customer_id
WHERE cch.last_update_date >= '{start_date}'
    AND cch.last_update_date <= '{end_date}'
    AND c.id_card = '{id_card}'
    AND cch.credit_limit >= {min_credit_limit}
ORDER BY cch.utilization_rate DESC, cch.overdue_days DESC
LIMIT {limit};`,
      parameters: [
        {
          id: 'p1',
          name: 'cust_no',
          type: 'string',
          defaultValue: 'CUST001',
          required: true,
          description: '客户编号',
          isFixed: true
        },
        {
          id: 'p2',
          name: 'start_date',
          type: 'date',
          defaultValue: '2024-01-01',
          required: true,
          description: '授信分析开始日期'
        },
        {
          id: 'p3',
          name: 'end_date',
          type: 'date',
          defaultValue: '2024-12-31',
          required: true,
          description: '授信分析结束日期'
        },
        {
          id: 'p4',
          name: 'id_card',
          type: 'string',
          defaultValue: '110101199001011234',
          required: false,
          description: '客户身份证号'
        },
        {
          id: 'p5',
          name: 'min_credit_limit',
          type: 'number',
          defaultValue: 10000,
          required: false,
          description: '最小授信额度过滤条件'
        },
        {
          id: 'p6',
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
      name: '客户授信明细数据查询',
      useCase: UseCase.DETAIL_DATA_QUERY,
      language: LanguageType.SQL,
      manager: '王五',
      status: DataModelStatus.ACTIVE,
      version: '1.0.0',
      description: '查询客户授信明细数据，包括授信申请记录、审批流程、额度变更历史等详细信息',
      code: `SELECT 
    ca.application_id,
    ca.customer_id,
    cp.customer_name,
    ca.application_date,
    ca.requested_amount,
    ca.approved_amount,
    ca.application_status,
    ca.approval_date,
    ca.credit_officer,
    -- 审批流程信息
    ap.process_step,
    ap.step_status,
    ap.step_date,
    ap.reviewer,
    ap.comments,
    -- 额度变更历史
    ch.change_date,
    ch.old_limit,
    ch.new_limit,
    ch.change_reason,
    ch.changed_by,
    -- 当前授信状态
    cc.current_limit,
    cc.used_amount,
    cc.available_amount,
    ROUND(cc.used_amount / cc.current_limit * 100, 2) as utilization_rate,
    cc.last_transaction_date
FROM credit_applications ca
LEFT JOIN customer_profile cp ON ca.customer_id = cp.customer_id
LEFT JOIN approval_process ap ON ca.application_id = ap.application_id
LEFT JOIN credit_history ch ON ca.customer_id = ch.customer_id
LEFT JOIN current_credit cc ON ca.customer_id = cc.customer_id
WHERE ca.application_date >= '{start_date}'
    AND ca.application_date <= '{end_date}'
    AND cp.id_card = '{id_card}'
    AND ('{customer_id}' = '' OR ca.customer_id = '{customer_id}')
    AND ('{status}' = '' OR ca.application_status = '{status}')
ORDER BY ca.application_date DESC, ap.step_date DESC
LIMIT {limit};`,
      parameters: [
        {
          id: 'p1',
          name: 'start_date',
          type: 'date',
          defaultValue: '2024-01-01',
          required: true,
          description: '查询开始日期'
        },
        {
          id: 'p2',
          name: 'end_date',
          type: 'date',
          defaultValue: '2024-12-31',
          required: true,
          description: '查询结束日期'
        },
        {
          id: 'p3',
          name: 'id_card',
          type: 'string',
          defaultValue: '110101199001011234',
          required: true,
          description: '客户身份证号'
        },
        {
          id: 'p4',
          name: 'customer_id',
          type: 'string',
          defaultValue: '',
          required: false,
          description: '客户ID过滤条件（可选）'
        },
        {
          id: 'p5',
          name: 'status',
          type: 'string',
          defaultValue: '',
          required: false,
          description: '申请状态过滤条件（可选）'
        },
        {
          id: 'p6',
          name: 'limit',
          type: 'number',
          defaultValue: 1000,
          required: false,
          description: '返回结果数量限制'
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
      name: '客户授信状态切片明细',
      useCase: UseCase.DETAIL_DATA_QUERY,
      language: LanguageType.SQL,
      manager: '赵六',
      status: DataModelStatus.ACTIVE,
      version: '1.0.0',
      description: '查询客户授信状态的历史切片数据，包括不同时间点的授信额度、使用情况、风险等级变化',
      code: `SELECT 
    cs.snapshot_id,
    cs.customer_id,
    cp.customer_name,
    cs.snapshot_date,
    cs.credit_limit,
    cs.used_amount,
    cs.available_amount,
    ROUND(cs.used_amount / cs.credit_limit * 100, 2) as utilization_rate,
    cs.overdue_amount,
    cs.overdue_days,
    cs.risk_level,
    cs.credit_score,
    cs.account_status,
    -- 与上一个切片的对比
    LAG(cs.credit_limit) OVER (PARTITION BY cs.customer_id ORDER BY cs.snapshot_date) as prev_credit_limit,
    LAG(cs.used_amount) OVER (PARTITION BY cs.customer_id ORDER BY cs.snapshot_date) as prev_used_amount,
    LAG(cs.risk_level) OVER (PARTITION BY cs.customer_id ORDER BY cs.snapshot_date) as prev_risk_level,
    -- 变化计算
    cs.credit_limit - LAG(cs.credit_limit) OVER (PARTITION BY cs.customer_id ORDER BY cs.snapshot_date) as limit_change,
    cs.used_amount - LAG(cs.used_amount) OVER (PARTITION BY cs.customer_id ORDER BY cs.snapshot_date) as usage_change,
    -- 状态分类
    CASE 
        WHEN cs.overdue_days = 0 THEN '正常'
        WHEN cs.overdue_days <= 30 THEN '轻微逾期'
        WHEN cs.overdue_days <= 90 THEN '中度逾期'
        ELSE '严重逾期'
    END as overdue_status,
    -- 风险等级描述
    CASE 
        WHEN cs.risk_level = 'A' THEN '低风险'
        WHEN cs.risk_level = 'B' THEN '中低风险'
        WHEN cs.risk_level = 'C' THEN '中高风险'
        ELSE '高风险'
    END as risk_description
FROM credit_snapshots cs
LEFT JOIN customer_profile cp ON cs.customer_id = cp.customer_id
WHERE cs.snapshot_date >= '{start_date}'
    AND cs.snapshot_date <= '{end_date}'
    AND cp.id_card = '{id_card}'
    AND ('{customer_id}' = '' OR cs.customer_id = '{customer_id}')
    AND ('{risk_level}' = '' OR cs.risk_level = '{risk_level}')
ORDER BY cs.customer_id, cs.snapshot_date DESC
LIMIT {limit};`,
      parameters: [
        {
          id: 'p1',
          name: 'start_date',
          type: 'date',
          defaultValue: '2024-01-01',
          required: true,
          description: '切片查询开始日期'
        },
        {
          id: 'p2',
          name: 'end_date',
          type: 'date',
          defaultValue: '2024-12-31',
          required: true,
          description: '切片查询结束日期'
        },
        {
          id: 'p3',
          name: 'id_card',
          type: 'string',
          defaultValue: '110101199001011234',
          required: true,
          description: '客户身份证号'
        },
        {
          id: 'p4',
          name: 'customer_id',
          type: 'string',
          defaultValue: '',
          required: false,
          description: '客户ID过滤条件（可选）'
        },
        {
          id: 'p5',
          name: 'risk_level',
          type: 'string',
          defaultValue: '',
          required: false,
          description: '风险等级过滤条件（可选）'
        },
        {
          id: 'p6',
          name: 'limit',
          type: 'number',
          defaultValue: 1000,
          required: false,
          description: '返回结果数量限制'
        }
      ],
      executionConfig: {
        timeout: 180,
        maxMemory: 1024
      },
      createdAt: '2024-03-01T12:00:00Z',
      updatedAt: '2024-03-15T10:20:00Z',
      executionHistory: [
        {
          id: 'exec_001',
          executedAt: '2024-03-15T14:30:00Z',
          status: 'success',
          duration: 85,
          resultRows: 1250,
          executedBy: '张三',
          parameters: {
            start_date: '2024-01-01',
            end_date: '2024-03-15',
            customer_id: 'CUST001',
            risk_level: 'B'
          }
        },
        {
          id: 'exec_002',
          executedAt: '2024-03-10T09:15:00Z',
          status: 'success',
          duration: 92,
          resultRows: 980,
          executedBy: '李四',
          parameters: {
            start_date: '2024-02-01',
            end_date: '2024-03-10',
            customer_id: '',
            risk_level: 'C'
          }
        },
        {
          id: 'exec_003',
          executedAt: '2024-03-05T16:45:00Z',
          status: 'failed',
          duration: 45,
          resultRows: 0,
          executedBy: '王五',
          error: '数据库连接超时',
          parameters: {
            start_date: '2024-01-01',
            end_date: '2024-03-05',
            customer_id: 'CUST002',
            risk_level: 'A'
          }
        }
      ],
      executionStats: {
        totalExecutions: 15,
        successRate: 86.7,
        avgDuration: 88.5,
        lastExecutedAt: '2024-03-15T14:30:00Z'
      }
    },
    {
        id: 'dm_004',
        name: '授信历史变更明细',
        useCase: UseCase.DETAIL_DATA_QUERY,
        language: LanguageType.SQL,
        manager: '陈七',
        status: DataModelStatus.ACTIVE,
        version: '3.0.0',
        description: '查询客户授信历史变更的详细记录，包括额度调整、状态变更、操作人员等信息',
      code: `SELECT 
    ch.change_id,
    ch.customer_id,
    cp.customer_name,
    ch.change_date,
    ch.change_type,
    ch.old_credit_limit,
    ch.new_credit_limit,
    ch.new_credit_limit - ch.old_credit_limit as limit_change_amount,
    ROUND((ch.new_credit_limit - ch.old_credit_limit) / ch.old_credit_limit * 100, 2) as limit_change_percent,
    ch.old_status,
    ch.new_status,
    ch.change_reason,
    ch.operator_id,
    op.operator_name,
    ch.approval_status,
    ch.approval_date,
    ch.approver_id,
    ap.approver_name,
    ch.comments,
    -- 变更类型分类
    CASE 
        WHEN ch.change_type = 'LIMIT_INCREASE' THEN '额度提升'
        WHEN ch.change_type = 'LIMIT_DECREASE' THEN '额度降低'
        WHEN ch.change_type = 'STATUS_CHANGE' THEN '状态变更'
        WHEN ch.change_type = 'RISK_ADJUSTMENT' THEN '风险调整'
        ELSE '其他变更'
    END as change_type_desc,
    -- 变更影响评估
    CASE 
        WHEN ch.new_credit_limit > ch.old_credit_limit THEN '正面影响'
        WHEN ch.new_credit_limit < ch.old_credit_limit THEN '负面影响'
        ELSE '无额度影响'
    END as impact_assessment,
    -- 审批状态描述
    CASE 
        WHEN ch.approval_status = 'APPROVED' THEN '已批准'
        WHEN ch.approval_status = 'REJECTED' THEN '已拒绝'
        WHEN ch.approval_status = 'PENDING' THEN '待审批'
        ELSE '未知状态'
    END as approval_status_desc
FROM credit_history ch
LEFT JOIN customer_profile cp ON ch.customer_id = cp.customer_id
LEFT JOIN operators op ON ch.operator_id = op.operator_id
LEFT JOIN operators ap ON ch.approver_id = ap.operator_id
WHERE ch.change_date >= '{start_date}'
    AND ch.change_date <= '{end_date}'
    AND ('{customer_id}' = '' OR ch.customer_id = '{customer_id}')
    AND ('{change_type}' = '' OR ch.change_type = '{change_type}')
    AND ('{approval_status}' = '' OR ch.approval_status = '{approval_status}')
ORDER BY ch.change_date DESC, ch.customer_id
LIMIT {limit};`,
      parameters: [
        {
          id: 'p1',
          name: 'start_date',
          type: 'date',
          defaultValue: '2024-01-01',
          required: true,
          description: '查询开始日期'
        },
        {
          id: 'p2',
          name: 'end_date',
          type: 'date',
          defaultValue: '2024-12-31',
          required: true,
          description: '查询结束日期'
        },
        {
          id: 'p3',
          name: 'customer_id',
          type: 'string',
          defaultValue: '',
          required: false,
          description: '客户ID（可选）'
        },
        {
          id: 'p4',
          name: 'change_type',
          type: 'string',
          defaultValue: '',
          required: false,
          description: '变更类型（LIMIT_INCREASE/LIMIT_DECREASE/STATUS_CHANGE/RISK_ADJUSTMENT）'
        },
        {
          id: 'p5',
          name: 'approval_status',
          type: 'string',
          defaultValue: '',
          required: false,
          description: '审批状态（APPROVED/REJECTED/PENDING）'
        },
        {
          id: 'p6',
          name: 'limit',
          type: 'number',
          defaultValue: 100,
          required: false,
          description: '返回记录数限制'
        }
      ],
      executionConfig: {
        timeout: 900,
        maxMemory: 8192
      },
      createdAt: '2024-01-20T09:00:00Z',
      updatedAt: '2024-03-22T11:15:00Z',
      executionHistory: [
        {
          id: 'exec_004',
          executedAt: '2024-03-22T11:15:00Z',
          status: 'success',
          duration: 180,
          resultRows: 1,
          executedBy: '陈七'
        },
        {
          id: 'exec_005',
          executedAt: '2024-03-21T15:30:00Z',
          status: 'success',
          duration: 175,
          resultRows: 1,
          executedBy: '陈七'
        }
      ],
      executionStats: {
        totalExecutions: 15,
        successRate: 93.3,
        avgDuration: 178.5,
        lastExecutedAt: '2024-03-22T11:15:00Z'
      }
    },
    {
      id: 'dm_005',
      name: '实验复盘分析明细',
      useCase: UseCase.DETAIL_DATA_QUERY,
      language: LanguageType.SQL,
      manager: '孙八',
      status: DataModelStatus.DRAFT,
      version: '2.0.0',
      description: '查询风控实验的详细复盘数据，包括实验配置、执行结果、效果评估等信息',
      code: `SELECT 
    er.experiment_id,
    er.experiment_name,
    er.experiment_type,
    er.start_date,
    er.end_date,
    er.status,
    er.hypothesis,
    er.target_metric,
    er.sample_size,
    er.control_group_size,
    er.treatment_group_size,
    -- 实验结果指标
    er.control_conversion_rate,
    er.treatment_conversion_rate,
    er.lift_percentage,
    er.statistical_significance,
    er.confidence_level,
    er.p_value,
    -- 业务影响评估
    er.estimated_revenue_impact,
    er.cost_per_acquisition_change,
    er.risk_score_improvement,
    -- 实验配置详情
    ec.feature_flag,
    ec.traffic_allocation,
    ec.targeting_criteria,
    ec.exclusion_rules,
    -- 复盘分析
    er.lessons_learned,
    er.next_steps,
    er.recommendation,
    er.reviewer_id,
    rv.reviewer_name,
    er.review_date,
    er.approval_status,
    -- 实验分类
    CASE 
        WHEN er.experiment_type = 'AB_TEST' THEN 'A/B测试'
        WHEN er.experiment_type = 'MULTIVARIATE' THEN '多变量测试'
        WHEN er.experiment_type = 'FEATURE_FLAG' THEN '功能开关测试'
        WHEN er.experiment_type = 'GRADUAL_ROLLOUT' THEN '灰度发布'
        ELSE '其他类型'
    END as experiment_type_desc,
    -- 结果评估
    CASE 
        WHEN er.statistical_significance >= 0.95 AND er.lift_percentage > 0 THEN '显著正向'
        WHEN er.statistical_significance >= 0.95 AND er.lift_percentage < 0 THEN '显著负向'
        WHEN er.statistical_significance < 0.95 THEN '无显著差异'
        ELSE '待评估'
    END as result_assessment,
    -- 实验状态描述
    CASE 
        WHEN er.status = 'COMPLETED' THEN '已完成'
        WHEN er.status = 'RUNNING' THEN '进行中'
        WHEN er.status = 'PAUSED' THEN '已暂停'
        WHEN er.status = 'CANCELLED' THEN '已取消'
        ELSE '未知状态'
    END as status_desc
FROM experiment_results er
LEFT JOIN experiment_config ec ON er.experiment_id = ec.experiment_id
LEFT JOIN reviewers rv ON er.reviewer_id = rv.reviewer_id
WHERE er.start_date >= '{start_date}'
    AND er.end_date <= '{end_date}'
    AND ('{experiment_type}' = '' OR er.experiment_type = '{experiment_type}')
    AND ('{status}' = '' OR er.status = '{status}')
    AND ('{reviewer_id}' = '' OR er.reviewer_id = '{reviewer_id}')
ORDER BY er.end_date DESC, er.statistical_significance DESC
LIMIT {limit};`,
      parameters: [
          {
            id: 'p1',
            name: 'start_date',
            type: 'date',
            defaultValue: '2024-01-01',
            required: true,
            description: '实验开始日期'
          },
          {
            id: 'p2',
            name: 'end_date',
            type: 'date',
            defaultValue: '2024-12-31',
            required: true,
            description: '实验结束日期'
          },
          {
            id: 'p3',
            name: 'experiment_type',
            type: 'string',
            defaultValue: '',
            required: false,
            description: '实验类型（AB_TEST/MULTIVARIATE/FEATURE_FLAG/GRADUAL_ROLLOUT）'
          },
          {
            id: 'p4',
            name: 'status',
            type: 'string',
            defaultValue: '',
            required: false,
            description: '实验状态（COMPLETED/RUNNING/PAUSED/CANCELLED）'
          },
          {
            id: 'p5',
            name: 'reviewer_id',
            type: 'string',
            defaultValue: '',
            required: false,
            description: '复盘评审人ID（可选）'
          },
          {
            id: 'p6',
            name: 'limit',
            type: 'number',
            defaultValue: 50,
            required: false,
            description: '返回记录数限制'
          }
        ],
      executionConfig: {
        timeout: 240,
        maxMemory: 3072
      },
      createdAt: '2024-02-01T14:20:00Z',
      updatedAt: '2024-03-25T10:45:00Z',
      executionHistory: [
        {
          id: 'exec_006',
          executedAt: '2024-03-25T10:45:00Z',
          status: 'success',
          duration: 95,
          resultRows: 450,
          executedBy: '孙八'
        }
      ],
      executionStats: {
        totalExecutions: 12,
        successRate: 100.0,
        avgDuration: 92.3,
        lastExecutedAt: '2024-03-25T10:45:00Z'
      }
    },
    {
      id: 'dm_006',
      name: '授信风险评估明细',
      useCase: UseCase.DETAIL_DATA_QUERY,
      language: LanguageType.SQL,
      manager: '周九',
      status: DataModelStatus.DRAFT,
      version: '1.2.0',
      description: '查询客户授信风险评估的详细数据，包括风险指标、评分模型、决策因子等信息',
      code: `-- 授信风险评估明细查询
-- 查询客户授信风险评估的详细数据，包括风险指标、评分模型、决策因子等信息
SELECT 
    ra.assessment_id,
    ra.customer_id,
    c.customer_name,
    c.customer_type,
    ra.assessment_date,
    ra.assessment_type,
    ra.risk_level,
    ra.risk_score,
    ra.pd_score,
    ra.lgd_score,
    ra.ead_amount,
    ra.final_rating,
    
    -- 风险指标明细
    ri.financial_score,
    ri.credit_history_score,
    ri.industry_risk_score,
    ri.collateral_score,
    ri.management_score,
    ri.market_position_score,
    
    -- 决策因子
    df.debt_ratio,
    df.liquidity_ratio,
    df.profitability_ratio,
    df.growth_rate,
    df.market_share,
    df.years_in_business,
    
    -- 评估结果
    ra.recommended_limit,
    ra.approved_limit,
    ra.interest_rate,
    ra.guarantee_requirement,
    ra.special_conditions,
    ra.assessment_status,
    ra.assessor_id,
    u.assessor_name,
    ra.review_date,
    ra.next_review_date,
    
    -- 计算字段
    CASE 
        WHEN ra.risk_score >= 800 THEN 'AAA级'
        WHEN ra.risk_score >= 700 THEN 'AA级'
        WHEN ra.risk_score >= 600 THEN 'A级'
        WHEN ra.risk_score >= 500 THEN 'BBB级'
        WHEN ra.risk_score >= 400 THEN 'BB级'
        ELSE 'B级及以下'
    END AS risk_grade_desc,
    
    ROUND((ra.approved_limit / ra.recommended_limit) * 100, 2) AS approval_ratio,
    
    DATEDIFF(ra.next_review_date, CURRENT_DATE) AS days_to_next_review
    
FROM risk_assessments ra
LEFT JOIN customers c ON ra.customer_id = c.customer_id
LEFT JOIN risk_indicators ri ON ra.assessment_id = ri.assessment_id
LEFT JOIN decision_factors df ON ra.assessment_id = df.assessment_id
LEFT JOIN users u ON ra.assessor_id = u.user_id
WHERE ra.assessment_date >= '{start_date}'
  AND ra.assessment_date <= '{end_date}'
  AND c.id_card = '{id_card}'
  AND ('{customer_id}' = '' OR ra.customer_id = '{customer_id}')
  AND ('{risk_level}' = '' OR ra.risk_level = '{risk_level}')
  AND ('{assessment_status}' = '' OR ra.assessment_status = '{assessment_status}')
ORDER BY ra.assessment_date DESC, ra.risk_score DESC
LIMIT {limit};`,
      parameters: [
          {
            id: 'p1',
            name: 'start_date',
            type: 'date',
            defaultValue: '2024-01-01',
            required: true,
            description: '评估开始日期'
          },
          {
            id: 'p2',
            name: 'end_date',
            type: 'date',
            defaultValue: '2024-12-31',
            required: true,
            description: '评估结束日期'
          },
          {
            id: 'p3',
            name: 'id_card',
            type: 'string',
            defaultValue: '110101199001011234',
            required: true,
            description: '客户身份证号'
          },
          {
            id: 'p4',
            name: 'customer_id',
            type: 'string',
            defaultValue: '',
            required: false,
            description: '客户ID（可选）'
          },
          {
            id: 'p5',
            name: 'risk_level',
            type: 'string',
            defaultValue: '',
            required: false,
            description: '风险等级（HIGH/MEDIUM/LOW）'
          },
          {
            id: 'p6',
            name: 'assessment_status',
            type: 'string',
            defaultValue: '',
            required: false,
            description: '评估状态（COMPLETED/PENDING/REVIEWING）'
          },
          {
            id: 'p7',
            name: 'limit',
            type: 'number',
            defaultValue: 100,
            required: false,
            description: '返回记录数限制'
          }
        ],
      executionConfig: {
        timeout: 300,
        maxMemory: 2048
      },
      createdAt: '2024-03-10T16:30:00Z',
      updatedAt: '2024-03-20T09:15:00Z',
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
  // 获取客户授信状态切片数据
  {
    url: '/api/credit-status-slices',
    method: 'get',
    response: ({ query }: any) => {
      const { customerId, startDate, endDate, riskLevel, page = 1, pageSize = 10 } = query;
      let slices = generateCreditStatusSlices();
      
      // 过滤条件
      if (customerId) {
        slices = slices.filter(slice => slice.customerId === customerId);
      }
      if (startDate) {
        slices = slices.filter(slice => slice.sliceDate >= startDate);
      }
      if (endDate) {
        slices = slices.filter(slice => slice.sliceDate <= endDate);
      }
      if (riskLevel) {
        slices = slices.filter(slice => slice.riskLevel === riskLevel);
      }
      
      // 分页
      const total = slices.length;
      const start = (page - 1) * pageSize;
      const end = start + parseInt(pageSize);
      const list = slices.slice(start, end);
      
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
  
  // 获取单个客户的授信状态切片详情
  {
    url: '/api/credit-status-slices/:sliceId',
    method: 'get',
    response: ({ url }: any) => {
      const sliceId = url.split('/').pop();
      const slices = generateCreditStatusSlices();
      const slice = slices.find(s => s.sliceId === sliceId);
      
      if (!slice) {
        return {
          code: 404,
          message: '授信状态切片不存在'
        };
      }
      
      return {
        code: 200,
        message: 'success',
        data: slice
      };
    }
  },
  
  // 获取客户列表（用于下拉选择）
  {
    url: '/api/customers',
    method: 'get',
    response: () => {
      const customers = [
        { id: 'CUST_001', name: '张伟', idNumber: '110101199001011234' },
        { id: 'CUST_002', name: '李娜', idNumber: '110101199002022345' },
        { id: 'CUST_003', name: '王强', idNumber: '110101199003033456' },
        { id: 'CUST_004', name: '刘敏', idNumber: '110101199004044567' },
        { id: 'CUST_005', name: '陈杰', idNumber: '110101199005055678' }
      ];
      
      return {
        code: 200,
        message: 'success',
        data: customers
      };
    }
  },
  
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
        models = models.filter(model => model.language === languageType);
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
      
      // 如果是重大更新，自动递增版本号
      const shouldIncrementVersion = body.code !== model.code || body.parameters !== model.parameters;
      const newVersion = shouldIncrementVersion ? generateNextVersion(model.version) : model.version;
      
      const updatedModel = {
        ...model,
        ...body,
        version: newVersion,
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
  
  // 上线数据模型
  {
    url: '/api/data-models/:id/publish',
    method: 'post',
    response: ({ url }: any) => {
      const id = url.split('/')[3]; // /api/data-models/:id/publish
      const models = generateMockDataModels();
      const model = models.find(m => m.id === id);
      
      if (!model) {
        return {
          code: 404,
          message: '数据模型不存在'
        };
      }
      
      if (model.status !== DataModelStatus.DRAFT) {
        return {
          code: 400,
          message: '只有草稿状态的模型才能上线'
        };
      }
      
      const publishedModel = {
        ...model,
        status: DataModelStatus.ACTIVE,
        updatedAt: new Date().toISOString()
      };
      
      return {
        code: 200,
        message: '上线成功',
        data: publishedModel
      };
    }
  },
  
  // 归档数据模型
  {
    url: '/api/data-models/:id/archive',
    method: 'post',
    response: ({ url }: any) => {
      const id = url.split('/')[3]; // /api/data-models/:id/archive
      const models = generateMockDataModels();
      const model = models.find(m => m.id === id);
      
      if (!model) {
        return {
          code: 404,
          message: '数据模型不存在'
        };
      }
      
      const archivedModel = {
        ...model,
        status: DataModelStatus.ARCHIVED,
        updatedAt: new Date().toISOString()
      };
      
      return {
        code: 200,
        message: '归档成功',
        data: archivedModel
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
  },
  
  // 获取版本历史
  {
    url: '/api/data-models/:id/versions',
    method: 'get',
    response: ({ url }: any) => {
      const id = url.split('/')[3]; // /api/data-models/:id/versions
      const versionHistory = getVersionHistory(id);
      
      const versions = versionHistory.map((version, index) => ({
        version,
        createdAt: new Date(Date.now() - (versionHistory.length - index) * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: ['张三', '李四', '王五'][index % 3],
        description: `版本 ${version} 更新`,
        isCurrent: index === versionHistory.length - 1
      }));
      
      return {
        code: 200,
        message: 'success',
        data: versions
      };
    }
  },
  
  // 创建新版本
  {
    url: '/api/data-models/:id/versions',
    method: 'post',
    response: ({ url, body }: any) => {
      const id = url.split('/')[3];
      const models = generateMockDataModels();
      const model = models.find(m => m.id === id);
      
      if (!model) {
        return {
          code: 404,
          message: '数据模型不存在'
        };
      }
      
      const newVersion = generateNextVersion(model.version);
      const updatedModel = {
        ...model,
        ...body,
        version: newVersion,
        updatedAt: new Date().toISOString()
      };
      
      return {
        code: 200,
        message: '版本创建成功',
        data: updatedModel
      };
    }
  },
  
  // 版本回滚
  {
    url: '/api/data-models/:id/versions/:version/rollback',
    method: 'post',
    response: ({ url }: any) => {
      const pathParts = url.split('/');
      const id = pathParts[3];
      const targetVersion = pathParts[5];
      
      const models = generateMockDataModels();
      const model = models.find(m => m.id === id);
      
      if (!model) {
        return {
          code: 404,
          message: '数据模型不存在'
        };
      }
      
      const versionHistory = getVersionHistory(id);
      if (!versionHistory.includes(targetVersion)) {
        return {
          code: 400,
          message: '目标版本不存在'
        };
      }
      
      const rolledBackModel = {
        ...model,
        version: targetVersion,
        updatedAt: new Date().toISOString()
      };
      
      return {
        code: 200,
        message: '版本回滚成功',
        data: rolledBackModel
      };
    }
  },
  
  // 版本对比
  {
    url: '/api/data-models/:id/versions/compare',
    method: 'get',
    response: ({ url, query }: any) => {
      const id = url.split('/')[3];
      const { left, right } = query;
      
      if (!left || !right) {
        return {
          code: 400,
          message: '请提供要对比的版本号'
        };
      }
      
      const models = generateMockDataModels();
      const model = models.find(m => m.id === id);
      
      if (!model) {
        return {
          code: 404,
          message: '数据模型不存在'
        };
      }
      
      // 模拟不同版本的代码内容
      const getVersionCode = (version: string) => {
        const baseCode = model.code;
        if (version === 'v1.0.0') {
          return baseCode;
        } else if (version === 'v1.1.0') {
          return baseCode.replace('SELECT', 'SELECT DISTINCT').replace('LIMIT {limit}', 'LIMIT {limit}\nOFFSET {offset}');
        } else if (version === 'v1.2.0') {
          return baseCode.replace('ORDER BY utilization_rate DESC', 'ORDER BY utilization_rate DESC, customer_id ASC');
        }
        return baseCode;
      };
      
      const comparisonData = {
        left: getVersionCode(left),
        right: getVersionCode(right),
        differences: [
          {
            type: 'added',
            line: 5,
            content: 'DISTINCT keyword added'
          },
          {
            type: 'modified',
            line: 15,
            content: 'ORDER BY clause updated'
          }
        ]
      };
      
      return {
        code: 200,
        message: 'success',
        data: comparisonData
      };
    }
  }
] as MockMethod[];

// 导出 mock 数据
export const mockDataModels = generateMockDataModels();

// Mock API 方法类型定义
interface MockMethod {
  url: string;
  method: string;
  response: (params: any) => any;
}

// 导出 mock API 配置 - 确保正确导出给vite-plugin-mock使用
export default mockApiConfig;