# 数据源管理 + 采集任务 - 产品需求

## 1. 背景

dmt-app 的**采集链路**此前存在断点：
- 数据源连接信息散落在采集任务表单
- 采集结果与上下架台账无关联
- 上下架的"同步元数据"按钮是模拟假数据

本次重构打通了「数据源 → 采集任务 → 上下架台账」的**完整用户旅程**。

## 2. 核心目标

1. 引入**数据源**统一管理（连接信息、连接测试、健康状态）
2. 采集任务与数据源双向关联
3. 采集成功**自动登记到 listing**（数据资源/资产/要素台账）
4. 上下架"同步"按钮**反向触发采集任务**

## 3. 核心功能

### 3.1 数据源管理

统一管理所有数据源连接信息：
- 名称 / 集群类型（HIVE/MySQL/Oracle）
- 主机地址 / 端口
- 数据库 / Schema / 用户名 / 密码
- 关联业务系统（与 ASSET_SYSTEMS 对应）
- 健康状态（在线 / 告警 / 离线 / 延迟）
- 最近同步时间
- 批量连接测试

操作：新增 / 编辑 / 删除 / 单条连接测试 / 一键同步（创建采集任务）。

### 3.2 采集任务

任务列表支持：
- 关键字 / 数据源 / 对象类型筛选
- 状态（待执行 / 进行中 / 成功 / 失败）
- 触发来源（人工 / 上下架同步）
- 来源资产名（triggeredBy === 'shelf' 时显示）
- 操作：运行 / 重跑 / 删除

创建任务支持两种入口：
- **完整表单**：业务元数据信息（连接 / 数据登记 / 关联 / 血缘 / 业务），访问 `/asset-management/basic-management/metadata-collection`
- **快速创建**：仅需任务名 / 数据源 / 对象类型，列表页 modal 触发

### 3.3 联动机制 - 核心

| 触发 | 行为 | 后果 |
|---|---|---|
| 任务成功 | 自动登记产物 | 表 → mockTables，指标/API/变量 → listingStore.metrics |
| 上下架"同步元数据" | 创建采集任务（triggeredBy='shelf'） | 任务列表新增一条，可在「元数据管理→任务」看到 |
| 数据源"同步"按钮 | 创建采集任务 | 同上 |
| 上下架"批量同步" | 创建汇总任务 | 同上，单条失败概率 20% |

## 4. 数据模型

```
interface MetadataTask {
  id: string
  taskName: string
  dataSourceType: 'Doris' | 'Hive' | 'Oracle' | 'MySQL'
  assetType: '指标' | 'API' | '变量' | '表'
  status: 'pending' | 'running' | 'success' | 'failed'
  triggeredBy: 'user' | 'shelf'
  sourceAssetName?: string
  createdAt: string
  finishedAt?: string
  products?: Array<{ name: string; category: string; systemId: AssetSystemId; clusterType: ClusterType }>
  errorMessage?: string
}
```

## 5. 用户旅程

### 5.1 数据工程师视角

1. 进入「元数据采集 → 数据源管理」
2. 新增数据源（填连接信息 + 关联业务系统）
3. 触发连接测试，确认健康
4. 进入「元数据采集 → 创建任务」，选数据源 + 配置采集规则
5. 提交任务 → 自动运行
6. 任务列表 1s 自动刷新，看到状态变化
7. 成功后 → 数据已自动登记到「数据资源/资产上下架」台账

### 5.2 数据管理员视角

1. 在「数据资源 / 业务系统」台账看到一条下架资产
2. 点击「同步元数据」按钮
3. 看到 toast：「已创建采集任务 T-XXX，可在元数据管理 → 任务中查看」
4. 进入任务列表 → 看到 triggeredBy 标签是「上下架同步」、sourceAssetName 字段是该资产名
5. 1-2s 后任务运行成功 → 同步时间更新到台账表上

## 6. 后续规划

- 接入真实采集调度引擎（Oozie / Airflow）
- 跨页 Vuex/Pinia 全局状态（替代 localStorage 模拟）
- 采集产物自动去重 / 字段推断
- 数据源密码 KMS 加密存储
- 任务失败智能诊断（基于错误信息）
