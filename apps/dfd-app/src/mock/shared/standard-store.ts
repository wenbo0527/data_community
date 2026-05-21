
export interface DataStandard {
  id: number;
  standardNo: string;
  version: string;
  subject: string;
  chineseName: string;
  englishName: string;
  englishAbbr: string;
  domain: string;
  dataType: string;
  length: number;
  precision: number;
  department: string;
  status: 'published' | 'draft';
  updateTime: string;
}

const standards: DataStandard[] = [
  {
    id: 1,
    standardNo: 'STD_001',
    version: '1.0',
    subject: '客户',
    chineseName: '客户编号',
    englishName: 'Customer ID',
    englishAbbr: 'CUST_ID',
    domain: 'ID_20',
    dataType: 'VARCHAR',
    length: 20,
    precision: 0,
    department: '数据管理部',
    status: 'published',
    updateTime: '2023-10-01 10:00:00'
  },
  {
    id: 2,
    standardNo: 'STD_002',
    subject: '账户',
    chineseName: '账户余额',
    englishName: 'Account Balance',
    englishAbbr: 'ACCT_BAL',
    domain: 'AMT_18_2',
    dataType: 'DECIMAL',
    length: 18,
    precision: 2,
    department: '财务部',
    status: 'published',
    updateTime: '2023-10-02 14:30:00'
  },
  {
    id: 3,
    standardNo: 'STD_003',
    subject: '公共',
    chineseName: '证件类型',
    englishName: 'Certificate Type',
    englishAbbr: 'CERT_TYPE',
    domain: 'CODE_2',
    dataType: 'CHAR',
    length: 2,
    precision: 0,
    department: '数据管理部',
    status: 'draft',
    updateTime: '2023-10-05 09:15:00'
  },
  {
    id: 4,
    standardNo: 'STD_AMT_001',
    version: '1.0',
    subject: '交易',
    chineseName: '申请金额',
    englishName: 'Application Amount',
    englishAbbr: 'APPLY_AMT',
    domain: 'AMT_18_2',
    dataType: 'DECIMAL',
    length: 18,
    precision: 2,
    department: '信贷部',
    status: 'published',
    updateTime: '2023-10-06 10:00:00'
  },
  {
    id: 5,
    standardNo: 'STD_ID_002',
    version: '1.0',
    subject: '客户',
    chineseName: '身份证号',
    englishName: 'ID Card No',
    englishAbbr: 'ID_NO',
    domain: 'ID_18',
    dataType: 'VARCHAR',
    length: 18,
    precision: 0,
    department: '合规部',
    status: 'published',
    updateTime: '2023-10-06 11:00:00'
  },
  {
    id: 6,
    standardNo: 'STD_STS_005',
    version: '1.0',
    subject: '公共',
    chineseName: '审批状态',
    englishName: 'Approval Status',
    englishAbbr: 'APPR_STS',
    domain: 'CODE_10',
    dataType: 'VARCHAR',
    length: 10,
    precision: 0,
    department: '风控部',
    status: 'published',
    updateTime: '2023-10-06 12:00:00'
  },
  {
    id: 7,
    standardNo: 'STD_ID_001',
    version: '1.0',
    subject: '客户',
    chineseName: '用户ID',
    englishName: 'User ID',
    englishAbbr: 'USER_ID',
    domain: 'ID_32',
    dataType: 'VARCHAR',
    length: 32,
    precision: 0,
    department: '数据管理部',
    status: 'published',
    updateTime: '2023-10-07 10:00:00'
  },
  {
    id: 8,
    standardNo: 'STD_AMT_002',
    version: '1.0',
    subject: '交易',
    chineseName: '支用金额',
    englishName: 'Drawdown Amount',
    englishAbbr: 'DRAWDOWN_AMT',
    domain: 'AMT_18_2',
    dataType: 'DECIMAL',
    length: 18,
    precision: 2,
    department: '信贷部',
    status: 'published',
    updateTime: '2023-10-07 11:00:00'
  },
  {
    id: 9,
    standardNo: 'STD_AMT_003',
    version: '1.0',
    subject: '交易',
    chineseName: '应还金额',
    englishName: 'Due Amount',
    englishAbbr: 'DUE_AMT',
    domain: 'AMT_18_2',
    dataType: 'DECIMAL',
    length: 18,
    precision: 2,
    department: '财务部',
    status: 'published',
    updateTime: '2023-10-07 12:00:00'
  },
  {
    id: 10,
    standardNo: 'STD_NUM_001',
    version: '1.0',
    subject: '风控',
    chineseName: '逾期天数',
    englishName: 'Overdue Days',
    englishAbbr: 'OVD_DAYS',
    domain: 'NUM_4',
    dataType: 'INT',
    length: 4,
    precision: 0,
    department: '风控部',
    status: 'published',
    updateTime: '2023-10-07 13:00:00'
  }
];

export const StandardStore = {
  getStandards: () => standards,
  addStandard: (standard: DataStandard) => standards.push(standard),
  updateStandard: (id: number, data: Partial<DataStandard>) => {
    const idx = standards.findIndex(s => s.id === id);
    if (idx > -1) Object.assign(standards[idx], data);
  },
  deleteStandard: (id: number) => {
    const idx = standards.findIndex(s => s.id === id);
    if (idx > -1) standards.splice(idx, 1);
  }
};
