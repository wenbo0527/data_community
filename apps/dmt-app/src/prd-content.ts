/**
 * 产品需求文档（PRD）内容中心
 *
 * 设计：
 *   1. **页面层 @prd 注解**：每个 .vue 文件顶部加 <!-- @prd: <key> --> 注解
 *      例子：<!-- @prd: asset-listing -->
 *   2. **路由路径 → @prd key 映射**：本文件提供 getPrdForRoute(path)
 *   3. **多页面独立 PRD**：按 key 索引，每个独立子页都可以有自己专属 PRD
 *   4. **回退**：找不到 key 回退到 `_default` 总览
 *
 * 新增子页 PRD 的步骤：
 *   1. 在 PRD 字典里新增一个 key（常量 + 字符串内容）
 *   2. 在下方 prdRouteMap 里把路由前缀映射到这个 key
 *   3. 在子页面的 .vue 文件顶部加 <!-- @prd: <key> --> 注解（详见 prd-meta.ts）
 */

// ============================================================
// 类型
// ============================================================

export type PrdKey =
  // L1 域主 PRD
  | 'asset-listing'         // 数据资产管理（含上下架）
  | 'metadata'              // 元数据管理
  | 'metadata-collection'   // 元数据采集（含任务 / 数据源 / 创建任务）
  | 'data-standard'         // 数据标准治理
  | 'classify'              // 数据分级分类
  | 'service'               // 数据服务管理
  | 'business-concept'      // 业务数据目录
  | 'data-models'           // 数据模型
  | 'tag-management'        // 标签管理
  // L2 sub-PRD（按子页面独立拆分）
  | 'asset-listing.detail'                 // 资产详情
  | 'asset-listing.resource.system'        // 系统级资源（system-tables）
  | 'asset-listing.resource.business-system' // 业务系统台账
  | 'asset-listing.metric'                 // 指标台账
  | 'metadata.task'                        // 元数据 - 任务 Tab
  | 'metadata.entity'                      // 元数据 - 业务实体 Tab
  | 'data-standard.domains'                // 数据标准 - 数据域
  | 'data-standard.standards'              // 数据标准 - 标准项
  | 'data-standard.audit'                  // 数据标准 - 审核
  | 'classify.matrix'                      // 分级矩阵表
  | 'classify.tasks'                       // 分级任务
  | 'service.api'                          // 服务 - API 注册
  // 默认（兜底）
  | '_default'

export interface PrdInfo {
  /** 文档 ID（DMT-PRD-XXX） */
  id: string
  /** 文档层级：L0 总章程 / L1 域主 / L2 sub / L3 Spec */
  level: 'L0' | 'L1' | 'L2' | 'L3' | 'SPEC'
  /** 文档负责人（产品） */
  owner: string
  /** 最后更新日期 */
  updatedAt: string
  /** 文档状态 */
  status: 'draft' | 'review' | 'released' | 'deprecated'
  /** 渲染的 markdown 内容 */
  content: string
}

// ============================================================
// L1 域主 PRD
// ============================================================

const assetListingPrd: PrdInfo = {
  id: 'DMT-PRD-L1-001',
  level: 'L1',
  owner: '资产产品组',
  updatedAt: '2026-07-22',
  status: 'released',
  content: `# 数据资产管理 - 产品需求

## 1. 背景

数据资产管理模块是数据管理域子应用（dmt-app）的核心模块，承担**数据资产的发现、建模、上下架治理**全链路职责。

## 2. 业务目标

- 通过统一元数据采集 → 元数据建模 → 资产上下架 3 阶段，把分散在各业务系统的数据资产进行治理和发布
- 提供**业务用户友好**的资产检索门户
- 打通「采集-建模-发布-消费」全链路

## 3. 核心功能

### 3.1 数据资产上下架（按来源系统分组）

按来源系统分组，以**卡片矩阵**形式展示。每个系统卡片展示：

- 资产数量
- 已上架 / 已下架 / 未激活或归档 数量
- 系统说明

点击卡片进入系统下资产表，支持：

- 上架 / 下架 操作
- 元数据同步（单条 / 批量）
- 详情查看

### 3.2 数据资源上下架（业务系统）

数据资源 = 各业务系统的源表。

- 业务系统台账页：跨系统统一台账
- 按业务系统分组列表：核心 / 催收 / 客服 / 风控

### 3.3 数据要素上下架（指标台账）

数据要素 = 业务指标。

- 指标台账：列出全部指标 + 状态

## 4. 数据模型

\`\`\`
clusterType   → HIVE / MySQL / Oracle
clusterEnv    → compute / analysis
systemId      → hive / core / collection / service / risk
assetType     → table / metric
status        → onShelf / offShelf / active / inactive / archived
\`\`\`

## 5. 用户旅程

1. **采集**：创建采集任务（Doris / Hive / Oracle），采集产出元数据
2. **建模**：在「元数据管理 - 业务实体」中绑定业务实体、构建血缘、映射数据标准
3. **上下架**：在「数据资产上下架」分类目录中按系统浏览，对每条资产进行上架 / 下架 / 同步
4. **详情**：点击资产名查看详情（含字段结构、关联关系、血缘、加工逻辑、版本、上下架记录）
5. **消费**：其他模块（数据服务、数据应用）通过申请权限消费资产

## 6. 后续规划

- 接入真实采集任务调度（Oozie / Airflow）
- 血缘自动解析增强
- 资产标签 / 评分体系`
}

const metadataPrd: PrdInfo = {
  id: 'DMT-PRD-L1-002',
  level: 'L1',
  owner: '元数据产品组',
  updatedAt: '2026-07-22',
  status: 'released',
  content: `# 元数据管理 - 产品需求

## 1. 背景

元数据是数据治理的基石，涵盖数据从采集到消费全生命周期的元信息。
本模块提供**采集任务 + 业务实体**两大主功能，承担元数据治理的核心职责。

## 2. 核心目标

- 统一管理所有数据源的元数据采集任务
- 把物理表绑定到业务语义，构建数据治理的基础映射
- 提供数据标准映射与合规校验
- 自动血缘构建与可视化

## 3. 核心功能

### 3.1 任务管理（采集任务）

**任务状态机**：
\`\`\`
pending → running → (success | failed)
                    ↓ (重跑)
                  pending
\`\`\`

支持：任务列表 / 创建任务（表单 / 快速创建）/ 单任务运行 / 重跑 / 删除

### 3.2 业务实体

**实体绑定**：物理表 → 业务实体（如「贷款申请」「客户画像」）
**血缘构建**：表与表之间的上下游关系（手动添加）
**标准映射**：物理字段 → 数据标准（GB/T 行业标准）

## 4. 关键指标

- 任务成功率 ≥ **95%**
- 实体绑定覆盖率 ≥ **80%**
- 标准合规率持续提升

## 5. 用户旅程

1. 数据工程师进入「元数据管理 → 任务」新建采集任务
2. 任务列表 1s 自动刷新，显示状态变化
3. 任务成功 → 自动登记到 listing 框架
4. 数据治理员在「业务实体」把新采集的表绑定到业务实体
5. 通过「血缘构建」建立表间关系
6. 通过「标准映射」校验字段合规性

## 6. 后续规划

- 自动血缘解析（基于 SQL 解析）
- 标准智能推荐
- 任务失败智能诊断`
}

const metadataCollectionPrd: PrdInfo = {
  id: 'DMT-PRD-L1-003',
  level: 'L1',
  owner: '采集产品组',
  updatedAt: '2026-07-22',
  status: 'released',
  content: `# 数据源管理 + 采集任务 - 产品需求

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
- 关联业务系统
- 健康状态（在线 / 告警 / 离线 / 延迟）

### 3.2 采集任务

子页面：任务列表 / 创建任务（完整表单）/ 创建任务（快速创建）。

**任务字段**：

\`\`\`
- ID          任务唯一编号
- taskName    任务名称
- dataSourceType  Doris / Hive / Oracle / MySQL
- assetType   指标 / API / 变量 / 表
- status      pending / running / success / failed
- triggeredBy user / shelf       // 触发来源（人工 / 上下架同步）
- sourceAssetName                // 上下架同步时的来源资产
- createdAt    创建时间
- finishedAt   完成时间
- products     采集产物
- errorMessage 失败原因
\`\`\`

### 3.3 联动机制 - 核心

| 触发 | 行为 | 后果 |
|---|---|---|
| 任务成功 | 自动登记产物 | 表 → mockTables，指标/API/变量 → listingStore.metrics |
| 上下架"同步元数据" | 创建采集任务（triggeredBy='shelf'） | 任务列表新增一条 |
| 数据源"同步"按钮 | 创建采集任务 | 同上 |

## 4. 用户旅程

### 4.1 数据工程师视角

1. 进入「元数据采集 → 数据源管理」
2. 新增数据源 → 触发连接测试，确认健康
3. 进入「元数据采集 → 创建任务」，配置采集规则
4. 提交任务 → 自动运行
5. 任务列表 1s 自动刷新，状态变化可见
6. 成功后 → 数据自动登记到 listing 框架

### 4.2 数据管理员视角

1. 在业务系统台账点「同步元数据」
2. 进入任务列表 → 看到 triggeredBy 标签「上下架同步」、sourceAssetName 字段是该资产名

## 5. 后续规划

- 接入真实采集调度引擎（Oozie / Airflow）
- 跨页 Pinia 全局状态（替代 localStorage 模拟）
- 采集产物自动去重 / 字段推断
- 数据源密码 KMS 加密存储
- 任务失败智能诊断`
}

const dataStandardPrd: PrdInfo = {
  id: 'DMT-PRD-L1-004',
  level: 'L1',
  owner: '标准产品组',
  updatedAt: '2026-07-15',
  status: 'released',
  content: `# 数据标准治理 - 产品需求

## 1. 背景

数据标准是数据治理的规范层。本模块承担数据域 / 数据标准项 / 标准审核 / 词根 / 编码 等标准化能力。

## 2. 核心子页

- **数据域**：业务对象的归类层级（客户/交易/产品/合同）
- **标准项**：字段级标准（如「身份证号」格式、取值范围、关联词根）
- **词根**：可复用的命名元素（t、cdp、loan 等）
- **编码**：枚举值的统一编码规范
- **审核**：标准发布前的评审流程

## 3. 与其他模块的关联

- 上游：业务数据目录（管理业务实体）
- 下游：元数据管理（标准映射）
- 输出：API 服务、报表
`
}

const classifyPrd: PrdInfo = {
  id: 'DMT-PRD-L1-005',
  level: 'L1',
  owner: '安全产品组',
  updatedAt: '2026-07-15',
  status: 'released',
  content: `# 数据分级分类 - 产品需求

## 1. 背景

按数据敏感度（公开 / 内部 / 机密 / 高敏）对数据资产分级，本模块提供分级清单维护、定期复评与下钻跟踪。

## 2. 核心子页

- **数据源**：对每个业务系统的源做分级
- **数据表列表**：选择系统 → 列出所有表 → 标注分级
- **分级矩阵**：全量分级条目矩阵视图（30+条目）
- **分级任务**：离线批量分级的任务列表
- **分级 API 文档**：自动生成的 API 文档
`
}

const servicePrd: PrdInfo = {
  id: 'DMT-PRD-L1-006',
  level: 'L1',
  owner: '服务产品组',
  updatedAt: '2026-07-15',
  status: 'released',
  content: `# 数据服务管理 - 产品需求

## 1. 核心子页

- **API 服务管理**：注册 API 服务的元数据 + 路由
- **服务向导**：可视化 API 创建向导
- **服务监控**：API 调用情况 / 失败率
- **资金回查**：金融字段的回溯查询
`
}

const businessConceptPrd: PrdInfo = {
  id: 'DMT-PRD-L1-007',
  level: 'L1',
  owner: '业务建模组',
  updatedAt: '2026-07-15',
  status: 'released',
  content: `# 业务数据目录 - 产品需求

## 1. 背景

业务数据目录承接"业务域 → 业务对象 → 字段"的金字塔，与物理模型对应。

## 2. 核心子页

- **业务域**：主题域划分
- **业务实体列表**：实体列表
- **业务关系图谱**：实体关系可视化
`
}

const dataModelsPrd: PrdInfo = {
  id: 'DMT-PRD-L1-008',
  level: 'L1',
  owner: '建模组',
  updatedAt: '2026-07-15',
  status: 'released',
  content: `# 数据模型 - 产品需求

## 1. 核心子页

- **建模列表**：概念模型 / 逻辑模型 / 物理模型 三层列表
- **详情**：表结构 + 关联关系 + 模型版本
- **表单**：模型设计器
`
}

const tagManagementPrd: PrdInfo = {
  id: 'DMT-PRD-L1-009',
  level: 'L1',
  owner: '标签产品组',
  updatedAt: '2026-07-15',
  status: 'released',
  content: `# 标签管理 - 产品需求

## 1. 核心能力

- 标签组（TagGroup）创建 / 维护 / 申请 / 审批
- 标签申请：用户申请标签，治理员审核
- 标签应用：资产打标签
`
}

// ============================================================
// L2 sub-PRD
// ============================================================

const assetListingDetailPrd: PrdInfo = {
  id: 'DMT-PRD-L2-001',
  level: 'L2',
  owner: '资产产品组',
  updatedAt: '2026-07-22',
  status: 'released',
  content: `# 资产详情页 - 产品需求

## 1. 背景

资产详情是上下架链路最末端页面，承担「认知资产 + 应用资产」的两端职责。

## 2. Tab 列表（8 个）

| Tab | 职责 |
|---|---|
| **表结构** | 物理字段定义 + 主键标识 + 关联字段链接 |
| **数据预览** | 3 行示例数据 |
| **关联关系** | 5 类关联：表 / API / 指标 / 报表，列表展示 + 跳转 |
| **血缘关系** | 上下游列表 + 嵌入 LineageGraph 可视化 |
| **使用说明** | 5 段使用要点 |
| **加工逻辑** | 文字说明 + SQL 示例代码块 |
| **上下架记录** | 上架 / 下架 / 编辑历史时间轴 |
| **版本信息** | v1.0.0 / v1.1.0 / vN 等版本变更列表 |

## 3. 关键交互

- 字段标识符：主键 / 分区键 / 加密字段有专属标识
- 关联跳转：表名 / API 名 / 指标名 可点击跳转到对应详情
- 血缘可视化：嵌入 \`@app/lineage-graph\` workspace 组件

## 4. 与其他模块关联

- 关联关系 → 业务数据目录 / 服务管理
- 血缘关系 → 元数据管理（建模）
- 加工逻辑 → 元数据管理（实体）
`
}

const assetListingResourceSystemPrd: PrdInfo = {
  id: 'DMT-PRD-L2-002',
  level: 'L2',
  owner: '资源产品组',
  updatedAt: '2026-07-22',
  status: 'released',
  content: `# 系统资源列表 - 产品需求

## 1. 背景

按业务系统分组的资产二级列表页。从卡片矩阵点击进入。

## 2. 关键功能

- **表格视图**：源表 / 指标 / API 列表
- **筛选**：按状态、集群类型
- **操作**：上架 / 下架 / 同步元数据 / 查看详情
- **同步**：触发采集任务（创建任务后回填）

## 3. 联动机制

点「同步元数据」：调用 metadata-bus 创建采集任务 → 任务列表新增 → 1.2s 后回填同步时间
`
}

const assetListingResourceBusinessSystemPrd: PrdInfo = {
  id: 'DMT-PRD-L2-003',
  level: 'L2',
  owner: '资源产品组',
  updatedAt: '2026-07-22',
  status: 'released',
  content: `# 业务系统台账 - 产品需求

## 1. 背景

业务系统台账（业务资源上下架）是把 mockTables + listingStore.metrics 聚合到一个跨系统的统一表格视角。

## 2. 关键功能

- **表格列**：源表名 / 业务系统 / 集群类型 / 业务域 / 负责人 / 状态 / 注册时间 / 最近同步 / 操作
- **筛选**：关键词 / 业务系统 / 集群类型
- **批量同步**：弹窗选范围（全部 / 仅过期 / 当前筛选）+ 目标集群（计算 / 分析）
- **联动**：同步触发采集任务

## 3. 与 listing 框架的关系

业务系统台账 → 列出"源表 + 指标"的统一视角
listing 框架（卡片矩阵） → 按业务系统分组的卡片入口

两个页面是同一内容的"两种视角"
`
}

const assetListingMetricPrd: PrdInfo = {
  id: 'DMT-PRD-L2-004',
  level: 'L2',
  owner: '要素产品组',
  updatedAt: '2026-07-22',
  status: 'released',
  content: `# 指标台账 - 产品需求

## 1. 背景

指标台账承担"数据要素 = 业务指标"的台账管理。

## 2. 关键功能

- 列出全部指标
- 显示指标状态、所属系统、集群类型、注册时间
- 按业务域 / 系统 / 负责人筛选
- 点击跳转指标详情
`
}

const metadataTaskPrd: PrdInfo = {
  id: 'DMT-PRD-L2-005',
  level: 'L2',
  owner: '元数据产品组',
  updatedAt: '2026-07-22',
  status: 'released',
  content: `# 采集任务管理 Tab - 产品需求

## 1. Tab 职责

元数据管理首页的两个 Tab 之一：**任务** Tab。聚合 metadata-collection/index.vue 表单 + List.vue 列表。

## 2. 子模块

- **任务列表**：查看所有采集任务，支持筛选（关键字 / 数据源 / 对象类型）
- **创建任务**：配置任务基础信息（任务名 / 数据源类型 / 采集对象）+ 数据登记 + 血缘登记

## 3. 状态机

\`\`\`
pending → running → success   ✓ 自动登记 listing-store
                  ↘ failed   ✗ 错误信息记录到 errorMessage
\`\`\`
`
}

const metadataEntityPrd: PrdInfo = {
  id: 'DMT-PRD-L2-006',
  level: 'L2',
  owner: '元数据产品组',
  updatedAt: '2026-07-22',
  status: 'released',
  content: `# 业务实体 Tab - 产品需求

## 1. Tab 职责

元数据管理首页的两个 Tab 之一：**实体** Tab。

## 2. 子模块

- **实体绑定**：物理表 → 业务对象（一对多）
- **血缘构建**：表与表之间的上下游关系
- **数据标准映射**：物理字段 → 数据标准

## 3. 与采集联动

业务实体不直接由采集任务自动写入，而是治理员在 Tab 内手动维护。
`
}

const classifyMatrixPrd: PrdInfo = {
  id: 'DMT-PRD-L2-007',
  level: 'L2',
  owner: '安全产品组',
  updatedAt: '2026-07-22',
  status: 'released',
  content: `# 数据安全分级矩阵表 - 产品需求

## 1. 背景

将全部分级条目以矩阵视图集中展示，支持快速检索与详细分级信息下钻。

## 2. 视图

- **矩阵视图**（默认）：横向为分级维度（公开 / 内部 / 机密 / 高敏），纵向为数据类别（客户 / 交易 / 风控 / 营销）
- **树形视图**：按业务系统 → 表 → 字段 分层

## 3. 关键能力

- 单元格点击 → 显示分级定义说明
- 关联资产 / 业务用途 / 负责人信息
`
}

const classifyTasksPrd: PrdInfo = {
  id: 'DMT-PRD-L2-008',
  level: 'L2',
  owner: '安全产品组',
  updatedAt: '2026-07-22',
  status: 'released',
  content: `# 分级分类任务 - 产品需求

## 1. 背景

离线 / 定时批量跑分级算法的任务列表页。

## 2. 状态机

pending / running / success / failed

## 3. 与采集任务联动

沿用 metadata-bus 的采集任务模块，triggeredBy='user' 时为分级任务。
`
}

const serviceApiPrd: PrdInfo = {
  id: 'DMT-PRD-L2-009',
  level: 'L2',
  owner: '服务产品组',
  updatedAt: '2026-07-22',
  status: 'released',
  content: `# API 服务管理 - 产品需求

## 1. 核心功能

- API 元数据注册
- 服务路由配置
- 鉴权与限流
- 版本管理

## 2. 子模块

- API 列表：所有已注册服务的表格
- API 创建向导：可视化引导
- API 调用监控：QPS / 失败率 / 延迟
`
}

const defaultPrd: PrdInfo = {
  id: 'DMT-PRD-DEFAULT',
  level: 'L1',
  owner: '产品通用',
  updatedAt: '2026-07-22',
  status: 'released',
  content: `# 数据管理域（dmt-app）- 产品总览

## 1. 背景

dmt-app 是数据管理域子应用，承担数据资产管理 / 元数据治理 / 数据标准 / 数据分级分类 / 数据服务 等业务域。

## 2. 业务范围

- 数据资产管理：采集、建模、上下架、详情
- 元数据管理：采集任务、业务实体、血缘、数据标准
- 数据标准治理：标准化字段映射
- 数据分级分类：按数据敏感度分级
- 数据服务管理：API、数据查询、权限申请

## 3. 用户角色

- **数据工程师**：负责采集任务、建模
- **数据治理员**：负责业务实体绑定、标准合规
- **业务用户**：通过数据资产门户检索、消费数据
- **数据管理员**：负责资产上下架治理

## 4. 后续规划

- 与 dq-app（数据质量）打通
- 与 risk-app（风险数据）打通
- 完善血缘图谱可视化

## 5. 备注

**此页面暂无专属 PRD**，已落在此总览的 L1 默认文档中。如需补专属 PRD，请联系产品经理。
`
}

// ============================================================
// 字典 + 路由映射
// ============================================================

const prdDict: Record<PrdKey, PrdInfo> = {
  // L1
  'asset-listing': assetListingPrd,
  'metadata': metadataPrd,
  'metadata-collection': metadataCollectionPrd,
  'data-standard': dataStandardPrd,
  'classify': classifyPrd,
  'service': servicePrd,
  'business-concept': businessConceptPrd,
  'data-models': dataModelsPrd,
  'tag-management': tagManagementPrd,
  // L2
  'asset-listing.detail': assetListingDetailPrd,
  'asset-listing.resource.system': assetListingResourceSystemPrd,
  'asset-listing.resource.business-system': assetListingResourceBusinessSystemPrd,
  'asset-listing.metric': assetListingMetricPrd,
  'metadata.task': metadataTaskPrd,
  'metadata.entity': metadataEntityPrd,
  'classify.matrix': classifyMatrixPrd,
  'classify.tasks': classifyTasksPrd,
  'service.api': serviceApiPrd,
  // Default
  '_default': defaultPrd
}

/**
 * 路由前缀 → PrdKey 映射
 *
 * 匹配规则：从完整路由开始，逐级去掉最后一段，直到匹配上
 * 顺序很重要：越具体越靠前
 */
const prdRouteMap: Array<{ prefix: string; key: PrdKey; owner?: string }> = [
  // ========= 数据资产上下架 L1 + L2 =========
  { prefix: '/asset-management/listing-management/asset-management/detail', key: 'asset-listing.detail' },
  { prefix: '/asset-management/listing-management/data-source/business-system', key: 'asset-listing.resource.business-system' },
  { prefix: '/asset-management/listing-management/data-source/system', key: 'asset-listing.resource.system' },
  { prefix: '/asset-management/listing-management/metric-management', key: 'asset-listing.metric' },
  { prefix: '/asset-management/listing-management', key: 'asset-listing' },

  // ========= 元数据管理 L1 =========
  { prefix: '/metadata', key: 'metadata' },

  // ========= 元数据采集 L1 =========
  { prefix: '/asset-management/basic-management/metadata-collection/task-list', key: 'metadata-collection' },
  { prefix: '/asset-management/basic-management/metadata-collection', key: 'metadata-collection' },
  { prefix: '/asset-management/basic-management/data-source', key: 'metadata-collection' },

  // ========= 数据标准治理 L1 =========
  { prefix: '/data-standard', key: 'data-standard' },

  // ========= 数据分级分类 L1 + L2 =========
  { prefix: '/metadata/classify/matrix', key: 'classify.matrix' },
  { prefix: '/metadata/classify/tasks', key: 'classify.tasks' },
  { prefix: '/metadata/classify', key: 'classify' },

  // ========= 数据服务管理 L1 =========
  { prefix: '/service', key: 'service' },

  // ========= 业务数据目录 L1 =========
  { prefix: '/business-concept', key: 'business-concept' },

  // ========= 数据模型 L1 =========
  { prefix: '/data-models', key: 'data-models' },

  // ========= 标签管理 L1 =========
  { prefix: '/asset-management/basic-management/tag-management', key: 'tag-management' }
]

// ============================================================
// 公开 API
// ============================================================

/**
 * 根据当前路由返回最匹配的 PRD key
 * - 先尝试完整前缀
 * - 再逐级去掉最后一段
 * - 都没匹配则用 _default
 */
export function getPrdKeyForRoute(routePath: string): PrdKey {
  // 去掉 query / hash
  const path = routePath.split('?')[0].split('#')[0]
  // 精确前缀优先
  for (const m of prdRouteMap) {
    if (path.startsWith(m.prefix)) return m.key
  }
  return '_default'
}

/** 取 PRD 详细信息 */
export function getPrdForRoute(routePath: string): PrdInfo {
  return prdDict[getPrdKeyForRoute(routePath)]
}

/** 取 PRD 内容（字符串） */
export function getPrdContentForRoute(routePath: string): string {
  return getPrdForRoute(routePath).content
}

/** 取 PRD 标题（取第一个 # 一级标题） */
export function getPrdTitle(content: string): string {
  const m = /^#\s+(.+)/m.exec(content)
  return m ? m[1].trim() : '产品说明'
}

/** 取 PRD key 的目录结构 path - 用 '.' 分割 */
export function getPrdCategory(key: PrdKey): string[] {
  if (key === '_default') return ['总览']
  return key.split('.')
}

/**
 * 从 .vue 文件内容中提取 @prd 注解（用于源码层验证）
 * 格式：<!-- @prd: <key> -->
 */
export function extractPrdAnnotationFromVueSource(vueSource: string): string | null {
  const m = /<!--\s*@prd:\s*([a-zA-Z0-9-_\.]+)\s*-->/.exec(vueSource)
  return m ? m[1] : null
}

/**
 * 列出所有可用 PRD（调试 / 元数据面板用）
 */
export function listAllPrds(): Array<{ key: PrdKey; level: string; title: string; owner: string; status: string }> {
  return (Object.keys(prdDict) as PrdKey[]).map(key => {
    const p = prdDict[key]
    return {
      key,
      level: p.level,
      title: getPrdTitle(p.content),
      owner: p.owner,
      status: p.status
    }
  })
}
