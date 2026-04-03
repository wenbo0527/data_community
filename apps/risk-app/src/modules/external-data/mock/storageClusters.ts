export interface StorageCluster {
  id: string
  name: string
  type: 'doris' | 'hive'
  description: string
  status: 'active' | 'inactive'
}

export interface Database {
  id: string
  clusterId: string
  name: string
  description: string
  tableCount: number
  createdAt: string
}

export interface OperationType {
  id: string
  name: string
  code: string
  description: string
  applicableStorage: ('doris' | 'hive')[]
}

export const storageClustersMock: StorageCluster[] = [
  {
    id: 'cluster-doris-01',
    name: 'Doris-Prod-01',
    type: 'doris',
    description: 'Doris 生产集群 01',
    status: 'active'
  },
  {
    id: 'cluster-doris-02',
    name: 'Doris-Prod-02',
    type: 'doris',
    description: 'Doris 生产集群 02',
    status: 'active'
  },
  {
    id: 'cluster-doris-03',
    name: 'Doris-Dev',
    type: 'doris',
    description: 'Doris 开发集群',
    status: 'active'
  },
  {
    id: 'cluster-hive-01',
    name: 'Hive-DataWarehouse',
    type: 'hive',
    description: 'Hive 数仓集群',
    status: 'active'
  },
  {
    id: 'cluster-hive-02',
    name: 'Hive-Staging',
    type: 'hive',
    description: 'Hive staging 集群',
    status: 'active'
  },
  {
    id: 'cluster-hive-03',
    name: 'Hive-Archive',
    type: 'hive',
    description: 'Hive 归档集群',
    status: 'inactive'
  }
]

export const databasesMock: Database[] = [
  {
    id: 'db-doris-01',
    clusterId: 'cluster-doris-01',
    name: 'risk_db',
    description: '风险数据集市',
    tableCount: 45,
    createdAt: '2025-01-15 10:00:00'
  },
  {
    id: 'db-doris-02',
    clusterId: 'cluster-doris-01',
    name: 'credit_db',
    description: '信贷数据集市',
    tableCount: 38,
    createdAt: '2025-02-20 14:30:00'
  },
  {
    id: 'db-doris-03',
    clusterId: 'cluster-doris-01',
    name: 'marketing_db',
    description: '营销数据集市',
    tableCount: 22,
    createdAt: '2025-03-10 09:15:00'
  },
  {
    id: 'db-doris-04',
    clusterId: 'cluster-doris-02',
    name: 'risk_prod_db',
    description: '风险生产数据库',
    tableCount: 56,
    createdAt: '2024-11-01 08:00:00'
  },
  {
    id: 'db-doris-05',
    clusterId: 'cluster-doris-02',
    name: 'analysis_db',
    description: '分析数据库',
    tableCount: 29,
    createdAt: '2024-12-15 11:20:00'
  },
  {
    id: 'db-doris-06',
    clusterId: 'cluster-doris-03',
    name: 'dev_risk_db',
    description: '风险开发数据库',
    tableCount: 15,
    createdAt: '2025-01-05 16:45:00'
  },
  {
    id: 'db-doris-07',
    clusterId: 'cluster-doris-03',
    name: 'dev_test_db',
    description: '测试开发数据库',
    tableCount: 8,
    createdAt: '2025-02-01 13:30:00'
  },
  {
    id: 'db-hive-01',
    clusterId: 'cluster-hive-01',
    name: 'dw_staging',
    description: '数仓 staging 层',
    tableCount: 120,
    createdAt: '2024-06-01 09:00:00'
  },
  {
    id: 'db-hive-02',
    clusterId: 'cluster-hive-01',
    name: 'dw_ods',
    description: '数仓 ODS 层',
    tableCount: 85,
    createdAt: '2024-06-01 09:05:00'
  },
  {
    id: 'db-hive-03',
    clusterId: 'cluster-hive-01',
    name: 'dw_dwd',
    description: '数仓 DWD 层',
    tableCount: 156,
    createdAt: '2024-06-01 09:10:00'
  },
  {
    id: 'db-hive-04',
    clusterId: 'cluster-hive-01',
    name: 'dw_dws',
    description: '数仓 DWS 层',
    tableCount: 42,
    createdAt: '2024-06-01 09:15:00'
  },
  {
    id: 'db-hive-05',
    clusterId: 'cluster-hive-01',
    name: 'dw_ads',
    description: '数仓 ADS 层',
    tableCount: 28,
    createdAt: '2024-06-01 09:20:00'
  },
  {
    id: 'db-hive-06',
    clusterId: 'cluster-hive-02',
    name: 'staging_temp',
    description: '临时 staging',
    tableCount: 18,
    createdAt: '2024-09-10 10:00:00'
  },
  {
    id: 'db-hive-07',
    clusterId: 'cluster-hive-02',
    name: 'staging_archive',
    description: '归档暂存区',
    tableCount: 12,
    createdAt: '2024-10-20 14:00:00'
  }
]

export const operationTypesMock: OperationType[] = [
  {
    id: 'op-select',
    name: '查询 SELECT',
    code: 'SELECT',
    description: '从表中查询数据',
    applicableStorage: ['doris', 'hive']
  },
  {
    id: 'op-insert',
    name: '插入 INSERT',
    code: 'INSERT',
    description: '向表中插入数据',
    applicableStorage: ['doris', 'hive']
  },
  {
    id: 'op-insert-overwrite',
    name: '覆盖插入 INSERT OVERWRITE',
    code: 'INSERT_OVERWRITE',
    description: '覆盖表中数据',
    applicableStorage: ['hive']
  },
  {
    id: 'op-create',
    name: '创建表 CREATE TABLE',
    code: 'CREATE_TABLE',
    description: '创建新表',
    applicableStorage: ['doris', 'hive']
  },
  {
    id: 'op-ctas',
    name: '创建表并插入 CREATE TABLE AS SELECT',
    code: 'CTAS',
    description: '创建新表并插入查询结果',
    applicableStorage: ['doris', 'hive']
  },
  {
    id: 'op-add-partition',
    name: '添加分区 ADD PARTITION',
    code: 'ADD_PARTITION',
    description: '为表添加新分区',
    applicableStorage: ['hive']
  },
  {
    id: 'op-refresh-partition',
    name: '刷新分区 RECOVER PARTITIONS',
    code: 'RECOVER_PARTITIONS',
    description: '恢复丢失的分区',
    applicableStorage: ['hive']
  }
]

export async function getStorageClustersByType(type: 'doris' | 'hive' | 'all'): Promise<StorageCluster[]> {
  if (type === 'all') {
    return Promise.resolve(storageClustersMock.filter(c => c.status === 'active'))
  }
  return Promise.resolve(storageClustersMock.filter(c => c.type === type && c.status === 'active'))
}

export async function getDatabasesByCluster(clusterId: string): Promise<Database[]> {
  return Promise.resolve(databasesMock.filter(d => d.clusterId === clusterId))
}

export async function getOperationTypesByStorage(storageType: string): Promise<OperationType[]> {
  if (storageType === 'all') {
    return Promise.resolve(operationTypesMock)
  }
  return Promise.resolve(operationTypesMock.filter(op => 
    op.applicableStorage.includes(storageType as 'doris' | 'hive')
  ))
}

export function getClusterDatabaseMap(): Record<string, Database[]> {
  const map: Record<string, Database[]> = {}
  for (const db of databasesMock) {
    (map[db.clusterId] ||= []).push(db)
  }
  return map
}