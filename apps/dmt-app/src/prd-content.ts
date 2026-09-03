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
  | 'notifications'         // 通知管理
  | 'user-groups'           // 用户组管理
  | 'accompany'             // 陪跑计划
  | 'classify-api-docs'     // 分级分类 API 文档
  // L2 sub-PRD（按子页面独立拆分）
  | 'asset-listing.data-sources'           // 数据资产上下架（按来源系统分组）
  | 'asset-listing.detail'                 // 资产详情
  | 'asset-listing.resource.system'        // 系统级资源（system-tables）
  | 'asset-listing.resource.business-system' // 业务系统台账
  | 'asset-listing.metric'                 // 指标台账
  | 'task-list'                            // 元数据 - 任务列表
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
  content: `# 数据资产管理（L1 兜底层）

> 本页面为 listing-management 路径下未匹配到 L2 子页 PRD 时的**默认总览文档**。
> 真实子页面 PRD 见：数据资产上下架 / 系统资产列表 / 业务系统 / 指标台账 / 资产详情。

## 用户旅程

1. 创建元数据采集任务（Doris / Hive / Oracle），采集后入库
2. 进入「数据资产管理」按数据源 / 业务系统 / 指标维度浏览资产，对每条资产**上架 / 下架 / 同步**
3. 点击资产名查看详情（表结构、关联关系、血缘、加工逻辑、版本、上下架记录）
4. 数据服务、数据应用等下游模块通过申请权限消费上架资产

## 核心交互

- **数据源分组**：按 HIVE / MySQL / Oracle 等数据源分组的卡片矩阵 + 系统下资产列表
- **业务系统分组**：按核心 / 催收 / 客服 / 风控的业务系统台账（统一跨系统视图）
- **指标台账**：业务指标上下架
- **资产详情**：8 个 Tab（表结构 / 数据预览 / 关联关系 / 血缘关系 / 使用说明 / 加工逻辑 / 上下架记录 / 版本信息）

## 功能列表

- 资产上下架（数据资产：按数据源分组）→ 见「数据资产上下架」PRD
- 资产上下架（数据资源：按业务系统分组）→ 见「业务系统」PRD
- 资产上下架（数据要素：指标台账）→ 见「指标台账」PRD
- 元数据采集任务提交与同步
- 资产详情（含使用说明、字段变更对比、血缘）
- 与元数据管理 / 数据标准治理 / 数据服务管理联动`
}

const metadataPrd: PrdInfo = {
  id: 'DMT-PRD-L1-002',
  level: 'L1',
  owner: '元数据产品组',
  updatedAt: '2026-07-22',
  status: 'released',
  content: `# 元数据管理

## 用户旅程

1. 数据工程师新建**采集任务**，选择数据源 / 数据库 / Schema
2. 任务状态自动刷新（pending → running → success | failed）
3. 任务成功后自动登记到资产 listing 框架
4. 数据治理员在「业务实体」把新采集的表绑定到业务实体（如「贷款申请」「客户画像」）
5. 通过「血缘构建」建立表间上下游关系
6. 通过「标准映射」校验字段合规性（GB/T 行业标准）

## 核心交互

- **任务列表**：状态色标 + 1s 自动刷新 + 单任务运行 / 重跑 / 删除
- **创建任务**：表单录入 + 快速创建（基于已接数据源）两种方式
- **业务实体列表**：物理表 → 业务实体绑定（卡片选择）
- **血缘构建**：表间上下游手动添加，@app/lineage-graph 可视化
- **标准映射**：物理字段 ↔ 数据标准字段，对比校验

## 功能列表

- 元数据采集任务管理（创建 / 运行 / 重跑 / 删除）
- 数据源管理（新增 HIVE / MySQL / Oracle / 测试连接）
- 业务实体管理（物理表 ↔ 业务实体绑定）
- 血缘构建（手动添加上下游关系）
- 标准映射与合规校验`
}

const metadataCollectionPrd: PrdInfo = {
  id: 'DMT-PRD-L1-003',
  level: 'L1',
  owner: '采集产品组',
  updatedAt: '2026-07-22',
  status: 'released',
  content: `# 元数据采集

## 用户旅程

1. 数据工程师新增**数据源**（HIVE / MySQL / Oracle），触发连接测试确认健康
2. 在「元数据采集 → 创建任务」配置采集规则（任务名 / 资产类型 / 数据源），提交后自动运行
3. 任务列表 1s 自动刷新，状态变化可见（pending → running → success | failed）
4. 任务成功后自动登记产物：表 → listing，业务指标 / API / 特征 → listing metrics
5. 在业务系统台账点「同步元数据」会反向触发采集任务（triggeredBy='shelf'）
6. 进入任务列表查看来源资产、触发人、错误信息

## 核心交互

- **数据源管理**：新建 / 编辑 / 删除数据源；测试连接；查看健康状态（在线 / 告警 / 离线 / 延迟）
- **创建任务**：表单录入 + 快速创建（基于已接数据源）两种方式
- **任务列表**：单任务运行 / 重跑 / 删除；标签显示触发来源（人工 / 上下架同步）
- **联动机制**：任务成功 → 自动登记到 listing；上下架 / 数据源"同步" → 触发采集任务

## 功能列表

- 数据源管理（连接信息 / 连接测试 / 健康状态）
- 采集任务创建（表单 / 快速创建）
- 采集任务列表（运行 / 重跑 / 删除）
- 任务状态自动刷新（1s）
- 任务成功自动登记到 listing 框架
- 上下架同步反向触发采集任务`
}

const dataStandardPrd: PrdInfo = {
  id: 'DMT-PRD-L1-004',
  level: 'L1',
  owner: '标准产品组',
  updatedAt: '2026-07-15',
  status: 'released',
  content: `# 数据标准管理

## 用户旅程

1. 数据架构师新建**数据域**（如客户 / 交易 / 产品 / 合同），作为业务对象归类层级
2. 在数据域下维护**标准项**，定义字段级标准（如「身份证号」格式 + 取值范围）
3. 通过**词根**（t / cdp / loan 等可复用命名元素）+ **编码**（枚举值规范）约束命名
4. 标准项 / 编码进入**审核**流程，评审通过后发布
5. 上游：业务数据目录绑定业务实体时引用；下游：元数据管理（标准映射）做合规校验

## 核心交互

- **数据域**：树形目录管理（CRUD + 拖拽排序）
- **标准项**：表格 + 表单双栏，新建时引用词根与编码
- **词根 / 编码**：列表维护，支持批量导入
- **审核流**：草稿 → 评审中 → 发布 / 驳回，附带评审意见

## 功能列表

- 数据域管理（树形结构 / CRUD / 排序）
- 数据标准项管理（CRUD / 关联词根与编码）
- 词根管理（CRUD / 批量导入）
- 编码管理（CRUD / 批量导入）
- 标准审核工作流（草稿 / 评审中 / 发布 / 驳回）`
}

const classifyPrd: PrdInfo = {
  id: 'DMT-PRD-L1-005',
  level: 'L1',
  owner: '安全产品组',
  updatedAt: '2026-07-15',
  status: 'released',
  content: `# 数据分级分类

## 用户旅程

1. 安全治理员选择业务系统，列出全部源表后批量**标注分级**（公开 / 内部 / 机密 / 高敏）
2. 通过**分级矩阵**总览全量分级条目（30+），识别高敏数据分布
3. 离线批量分级时提交**分级任务**，任务列表跟踪运行状态
4. 业务系统对接**分级 API** 自动打标，调用方式见「分级 API 文档」
5. 定期复评，分级变更触发资产 owner 重新审批

## 核心交互

- **数据源 / 数据表列表**：按系统筛选，对每个表行批量设置分级
- **分级矩阵**：表格 + 筛选条件（系统 / 部门 / 分级），快速定位高敏资产
- **分级任务列表**：显示运行状态和分级产物
- **分级 API 文档**：接口列表 / 调用示例 / 限流策略

## 功能列表

- 数据源分级标注（按业务系统 / 数据表）
- 分级矩阵（多维筛选 / 导出）
- 分级任务（离线批量 / 定时复评）
- 分级 API 对外暴露（自动推断 / 人工指定 / 矩阵拉取 / 任务提交）`
}

const servicePrd: PrdInfo = {
  id: 'DMT-PRD-L1-006',
  level: 'L1',
  owner: '服务产品组',
  updatedAt: '2026-07-15',
  status: 'released',
  content: `# 服务首页

## 用户旅程

1. 服务开发者通过**服务向导**注册新 API（输入基础信息 → 选择入参出参 → 绑定数据资产 → 生成 API 元数据）
2. 服务消费者在「API 服务管理」搜索、申请、调用已发布的 API
3. 服务运维通过「服务监控」观察调用量、失败率、慢响应等指标
4. 风控 / 财务通过「资金回查」对金融字段做回溯查询（按业务 ID 拉历史）

## 核心交互

- **API 服务管理**：列表 + 详情；按路径 / 标签筛选
- **服务向导**：分步骤表单 + 字段绑定数据资产
- **服务监控**：折线图（调用量 / 失败率）+ 明细表（按 API）
- **资金回查**：单条查询 + 批量回查

## 功能列表

- API 服务注册 / 编辑 / 下线
- 可视化 API 向导
- 服务调用监控（调用量 / 失败率 / 慢响应）
- 资金回查（单条 / 批量）`
}

const businessConceptPrd: PrdInfo = {
  id: 'DMT-PRD-L1-007',
  level: 'L1',
  owner: '业务建模组',
  updatedAt: '2026-07-15',
  status: 'released',
  content: `# 业务数据目录（业务概念）

## 用户旅程

1. 业务架构师划分**业务域**（如客户 / 交易 / 产品 / 合同），作为业务对象归类层级
2. 在业务域下维护**业务实体**清单（如「贷款申请」「客户画像」），用于后续在元数据管理侧做物理表绑定
3. 通过**业务关系图谱**查看实体间的关系（1:N / N:M），支持拖拽布局
4. 业务实体沉淀后供下游消费：数据服务、上架治理、数据应用

## 核心交互

- **业务域**：树形目录（CRUD）
- **业务实体列表**：列表 + 详情；按域 / 状态 / 负责人筛选
- **业务关系图谱**：节点-边图谱，缩放 / 拖拽 / 选中查看详情

## 功能列表

- 业务域管理（树形结构）
- 业务实体管理（CRUD / 关联字段）
- 业务关系图谱（可视化 / 编辑关系）`
}

const dataModelsPrd: PrdInfo = {
  id: 'DMT-PRD-L1-008',
  level: 'L1',
  owner: '建模组',
  updatedAt: '2026-07-15',
  status: 'released',
  content: `# 数据服务模型管理

## 用户旅程

1. 数据架构师在「数据模型列表」分三层管理：概念模型 / 逻辑模型 / 物理模型
2. 进入任意一层点击「详情」查看表结构、关联关系、模型版本
3. 点击「新建 / 编辑」通过表单设计器调整字段（含类型 / 主键 / 索引）
4. 模型发布后→被业务实体绑定 → 沉淀到元数据管理 → 指导采集与上下架

## 核心交互

- **建模列表**：三层分组（概念 / 逻辑 / 物理），每层独立列表
- **详情页**：表结构 + 关联关系 + 版本
- **表单**：字段编辑器（类型 / 主键 / 索引）

## 功能列表

- 概念模型管理
- 逻辑模型管理
- 物理模型管理
- 模型版本管理
- 模型设计器（表单编辑）`
}

const tagManagementPrd: PrdInfo = {
  id: 'DMT-PRD-L1-009',
  level: 'L1',
  owner: '标签产品组',
  updatedAt: '2026-07-15',
  status: 'released',
  content: `# 标签管理

## 用户旅程

1. 数据治理员新建**标签组**（TagGroup），定义标签名、值、颜色、适用范围
2. 普通用户在使用中申请新增标签或修改标签值，提交**申请工单**
3. 治理员在工单列表**审核**通过 → 标签生效
4. 数据治理员在资产上下架时为资产**打标签**，用于检索和筛选

## 核心交互

- **标签组列表**：CRUD + 适用范围筛选
- **标签申请**：单条 / 批量提交工单，附业务说明
- **审批列表**：治理员视角，逐条审批（通过 / 驳回）
- **资产打标**：在资产详情中选标签

## 功能列表

- 标签组创建 / 维护
- 标签申请工单提交
- 标签审批工作流
- 资产打标签（关联业务实体 / 资产）`
}

const notificationsPrd: PrdInfo = {
  id: 'DMT-PRD-L1-010',
  level: 'L1',
  owner: '平台产品组',
  updatedAt: '2026-07-15',
  status: 'draft',
  content: `# 通知管理

## 用户旅程

1. 平台 / 业务用户组成员进入通知列表查看站内消息
2. 系统事件触发（如资产上架 / 下架 / 同步失败 / 标准审核 / 任务完成）自动推送通知
3. 治理员在通知模板配置中心按事件类型维护消息文案与接收方
4. 用户可一键切换通知渠道偏好（站内信 / 邮件 / 企业 IM）

## 核心交互

- **通知列表**：按用户组 / 角色筛选，已读 / 未读筛选
- **通知模板管理**：按事件类型配置模板（标题 + 正文 + 占位符）
- **渠道偏好**：站内 / 邮件 / IM 三选一 / 多选

## 功能列表

- 通知列表（站内消息）
- 通知模板配置
- 渠道偏好设置
- 多渠道推送（站内信 / 邮件 / 企业 IM）`
}

const userGroupsPrd: PrdInfo = {
  id: 'DMT-PRD-L1-011',
  level: 'L1',
  owner: '平台产品组',
  updatedAt: '2026-07-22',
  status: 'released',
  content: `# 用户组管理

## 用户旅程

1. 平台 / 治理员新建**用户组**（名称 + 描述），用于后续精准触达
2. 在用户组成员管理中**批量添加成员**：从已有用户 / 角色 / 组织树选取
3. 组成员在通知管理 / 数据权限 / 资产订阅等场景被引用
4. 当用户组被删除时，二次确认；有关联资源（通知订阅 / 权限组）时禁止删除

## 核心交互

- **用户组列表**：名称 / 描述 / 成员数 / 创建时间
- **新增 / 编辑**：表单录入 + 成员多选
- **删除**：二次确认 + 引用检查

## 功能列表

- 用户组创建 / 维护 / 删除
- 组成员管理（人员 / 角色 / 组织树批量选择）
- 与通知 / 数据权限 / 资产订阅联动（被引用时禁用）`
}

const accompanyPrd: PrdInfo = {
  id: 'DMT-PRD-L1-012',
  level: 'L1',
  owner: '业务治理组',
  updatedAt: '2026-07-22',
  status: 'released',
  content: `# 陪跑计划

## 用户旅程

1. 业务治理员为新上线的业务系统创建**陪跑计划**（选择业务系统 + 治理范围 + 时间表 + 负责人）
2. 计划进入「进行中」状态，组员按里程碑跟进：采集 → 建模 → 标准映射 → 上下架
3. 计划过程中遇到阻塞可标记「暂停」
4. 陪跑完成产出**治理完成度评估报告**，列出已覆盖 / 待补项
5. 状态机：草稿 → 进行中 → 完成；途中可暂停

## 核心交互

- **陪跑计划列表**：按业务系统 / 状态 / 时间筛选
- **创建计划**：表单（系统 + 范围 + 时间表 + 负责人）
- **陪跑结果**：报告式页面（完成度评估 + 待补项）
- **状态切换**：草稿 / 进行中 / 暂停 / 完成

## 功能列表

- 陪跑计划创建 / 编辑 / 删除
- 里程碑跟进（采集 / 建模 / 标准映射 / 上下架）
- 陪跑结果报告
- 计划状态流转`
}

const classifyApiDocsPrd: PrdInfo = {
  id: 'DMT-PRD-L1-013',
  level: 'L1',
  owner: '安全治理组',
  updatedAt: '2026-07-22',
  status: 'released',
  content: `# 分级分类 API 文档

## 用户旅程

1. 业务系统对接方打开「分级分类 API 文档」查看接口列表
2. 通过授权的 access_token 调用分级 API 完成自动打标 / 人工指定 / 矩阵拉取
3. 提交分级扫描任务后，定期轮询任务状态获取分级结果
4. 分级 API 由分级分类页面后台配置 + 审计，统一对外暴露

## 核心交互

- **API 列表**：展示接口路径 / 用途 / 入参 / 出参 / 限流策略
- **调用示例**：在线测试（请求体可视化）+ 一键复制到代码
- **鉴权说明**：access_token 获取 + Header 注入方式

## 功能列表

- API 列表展示（路径 / 用途 / 入参 / 出参）
- 调用示例文档
- 在线测试
- 鉴权说明（access_token / Header）`
}

// ============================================================
// L2 sub-PRD
// ============================================================

const assetListingDataSourcesPrd: PrdInfo = {
  id: 'DMT-PRD-L2-010',
  level: 'L2',
  owner: '资产产品组',
  updatedAt: '2026-07-23',
  status: 'released',
  content: `# 数据资产上下架

## 用户旅程

1. 数据管理员进入「数据资产管理」分类目录，查看按来源系统分组的卡片矩阵
2. 点击来源系统卡片（HIVE / MySQL / Oracle 等）进入该系统下的资产列表
3. 在资产列表对每条资产进行**上架 / 下架 / 同步元数据 / 查看详情**
4. 点击资产名跳转资产详情，查看表结构、关联关系、血缘等
5. 上架资产在详情页生成上下架记录，下架后从消费者侧自动屏蔽

## 核心交互

- **系统卡片矩阵**：按来源系统（HIVE / MySQL / Oracle）分组，每个卡片展示资产总数 / 已上架 / 已下架
- **资产列表（系统下表）**：单条上架 / 下架 / 同步元数据操作，支持状态筛选（已上架 / 已下架）
- **同步元数据**：触发采集任务，回填同步时间
- **资产名跳转**：点击资产名跳转资产详情

## 功能列表

- 按来源系统分组的资产卡片矩阵
- 系统下资产列表（多状态筛选 / 批量操作）
- 资产上架 / 下架
- 同步元数据（触发采集任务）
- 跳转资产详情`
}

const assetListingDetailPrd: PrdInfo = {
  id: 'DMT-PRD-L2-001',
  level: 'L2',
  owner: '资产产品组',
  updatedAt: '2026-07-22',
  status: 'released',
  content: `# 资产详情

## 用户旅程

1. 数据分析师 / 开发者从上下架列表点击资产名进入详情，了解表结构与用途
2. 通过**使用说明**子模块快速判断表是否符合分析需求（Story 1-1）
3. 在排查字段来源或变更历史时，通过**字段级变更对比**定位版本差异影响（Story 1-2）
4. 点击「查看完整字段变更日志」打开抽屉，按时间倒序查看完整记录（Story 1-3）
5. 通过**关联关系**跳转到关联的表 / API / 指标 / 报表详情
6. 通过**血缘关系**上下游定位数据加工链路
7. 通过**加工逻辑**复制 SQL 示例代码用于业务实现

## 核心交互

- **8 个 Tab**：表结构 / 数据预览 / 关联关系 / 血缘关系 / 使用说明 / 加工逻辑 / 上下架记录 / 版本信息
- **使用说明折叠面板**：表级（使用说明 + 常用场景 + 更新周期）+ 字段级（字段说明 / 变更对比双视图，支持 v2.4.0 / v2.3.0 / v2.2.0 / v2.1.0 版本切换）
- **字段变更日志抽屉**：480px，timeline 倒序，旧值红底 / 新值绿底
- **血缘可视化**：嵌入 @app/lineage-graph workspace 组件
- **字段标识符**：主键 / 分区键 / 加密字段有专属标识
- **关联跳转**：表名 / API 名 / 指标名 可点击跳转到对应详情

## 功能列表

- 表结构展示（字段定义 + 主键 / 分区 / 加密标识）
- 数据预览（3 行示例数据）
- 关联关系（表 / API / 指标 / 报表）
- 血缘关系（上下游列表 + 可视化）
- 使用说明 Story 1-1/1-2/1-3（折叠面板 + 抽屉）
- 加工逻辑（文字 + SQL 示例）
- 上下架记录（时间轴）
- 版本信息（v1.0.0 等版本列表）`
}

const assetListingResourceSystemPrd: PrdInfo = {
  id: 'DMT-PRD-L2-002',
  level: 'L2',
  owner: '资源产品组',
  updatedAt: '2026-07-22',
  status: 'released',
  content: `# 系统资产列表

## 用户旅程

1. 用户从「数据资产上下架」卡片矩阵点击某个数据源（如 HIVE / MySQL / Oracle）进入该数据源下的资产二级列表
2. 通过筛选（状态 / 集群类型）定位目标资产
3. 单条 / 批量对资产进行上架 / 下架 / 同步元数据 / 查看详情
4. 触发「同步元数据」后，metadata-bus 创建采集任务，回填同步时间
5. 点击资产名跳转资产详情

## 核心交互

- **表格视图**：源表 / 指标 / API 列表
- **筛选**：状态（已上架 / 已下架 / 活跃）、集群类型（HIVE / MySQL / Oracle）
- **操作**：上架 / 下架 / 同步元数据 / 详情
- **同步联动**：点击同步 → 创建采集任务 → 1.2s 后回填同步时间

## 功能列表

- 列表展示（按数据源分组）
- 状态 / 集群类型筛选
- 资产上架 / 下架
- 同步元数据（触发采集任务）
- 跳转资产详情`
}

const assetListingResourceBusinessSystemPrd: PrdInfo = {
  id: 'DMT-PRD-L2-003',
  level: 'L2',
  owner: '资源产品组',
  updatedAt: '2026-07-22',
  status: 'released',
  content: `# 数据资源上下架

## 用户旅程

1. 进入「数据资源上下架」卡片矩阵，按业务系统（核心 / 催收 / 客服 / 风控）分组浏览
2. 点击业务系统卡片进入该系统的统一台账
3. 在统一台账跨业务系统视图查看源表 + 指标
4. 通过筛选（关键词 / 业务系统 / 集群类型）定位目标资产
5. 批量同步：选范围（全部 / 仅过期 / 当前筛选）+ 目标集群（计算 / 分析），触发采集任务
6. 点击资产名跳转详情

## 核心交互

- **系统卡片矩阵**：按业务系统分组展示，每个卡片展示资产总数 / 已上架 / 已下架
- **统一台账（业务系统）**：跨业务系统统一表格视图
- **批量同步**：弹窗选范围 + 目标集群 → 触发采集任务
- **筛选**：关键词 / 业务系统 / 集群类型

## 功能列表

- 按业务系统分组的卡片矩阵
- 跨业务系统统一台账
- 多维筛选（关键词 / 系统 / 集群）
- 批量同步元数据
- 跳转资产详情`
}

const assetListingMetricPrd: PrdInfo = {
  id: 'DMT-PRD-L2-004',
  level: 'L2',
  owner: '要素产品组',
  updatedAt: '2026-07-22',
  status: 'released',
  content: `# 指标台账

## 用户旅程

1. 进入指标台账，列出全部业务指标（数据要素）
2. 通过筛选（业务域 / 系统 / 负责人）定位目标指标
3. 查看指标状态、所属系统、集群类型、注册时间
4. 点击指标名跳转详情

## 核心交互

- **表格**：指标名 / 业务域 / 系统 / 集群类型 / 状态 / 负责人 / 注册时间
- **筛选**：业务域 / 系统 / 负责人
- **操作**：上架 / 下架（归档按钮已下线）
- **跳转**：指标详情

## 功能列表

- 指标列表（数据要素台账）
- 多维筛选（业务域 / 系统 / 负责人）
- 指标状态查看
- 指标上架 / 下架`
}

const taskListPrd: PrdInfo = {
  id: 'DMT-PRD-L2-005',
  level: 'L2',
  owner: '元数据产品组',
  updatedAt: '2026-07-22',
  status: 'released',
  content: `# 任务列表

## 用户旅程

1. 数据工程师进入「数据资产管理 → 元数据采集 → 任务列表」
2. 在任务列表查看所有采集任务（全部 / 当前用户的 / 来源于上下架同步的）
3. 通过筛选（关键字 / 数据源 / 对象类型）定位目标任务
4. 点击「创建任务」跳转到创建任务表单
5. 单任务可运行 / 重跑 / 删除，状态自动刷新
6. 任务成功后产物自动登记到 listing-store

## 核心交互

- **任务列表**：状态色标（pending / running / success / failed）+ 1s 自动刷新
- **筛选**：关键字 / 数据源 / 对象类型（指标 / API / 特征 / 表）
- **触发来源标签**：人工触发（triggeredBy='user'）/ 上下架同步（triggeredBy='shelf'）
- **单任务操作**：运行 / 重跑 / 删除

## 功能列表

- 元数据采集任务列表展示
- 关键字 / 数据源 / 对象类型筛选
- 单任务运行 / 重跑 / 删除
- 任务状态自动刷新
- 触发来源识别（用户 / 上下架同步）`
}

const metadataEntityPrd: PrdInfo = {
  id: 'DMT-PRD-L2-006',
  level: 'L2',
  owner: '元数据产品组',
  updatedAt: '2026-07-22',
  status: 'released',
  content: `# 业务实体 Tab

## 用户旅程

1. 数据治理员进入元数据管理 → **实体** Tab
2. 通过**实体绑定**把物理表绑定到业务对象（一对多）
3. 通过**血缘构建**手动添加表间上下游关系
4. 通过**数据标准映射**校验物理字段 → 数据标准合规
5. 业务实体不直接由采集任务自动写入，由治理员手动维护

## 核心交互

- **实体绑定**：物理表 → 业务对象（一对多）卡片选择
- **血缘构建**：表间上下游手动添加 + @app/lineage-graph 可视化
- **数据标准映射**：物理字段 ↔ 数据标准字段对比

## 功能列表

- 业务实体绑定（物理表 ↔ 业务对象）
- 血缘构建（手动添加上下游）
- 数据标准映射（合规校验）`
}

const classifyMatrixPrd: PrdInfo = {
  id: 'DMT-PRD-L2-007',
  level: 'L2',
  owner: '安全产品组',
  updatedAt: '2026-07-22',
  status: 'released',
  content: `# 分级分类列表

## 用户旅程

1. 安全治理员进入分级分类 → **分级矩阵** Tab
2. 选择视图：矩阵视图（默认）或树形视图
3. 在矩阵视图浏览全量分级条目：横向分级维度（公开 / 内部 / 机密 / 高敏） × 纵向数据类别（客户 / 交易 / 风控 / 营销）
4. 点击单元格下钻查看分级定义说明 + 关联资产 / 业务用途 / 负责人

## 核心交互

- **矩阵视图**（默认）：横向分级维度 × 纵向数据类别
- **树形视图**：按业务系统 → 表 → 字段 分层
- **下钻**：单元格点击 → 显示分级定义 + 关联信息

## 功能列表

- 分级矩阵总览（多维筛选）
- 矩阵视图 / 树形视图切换
- 单元格下钻（分级定义 + 关联资产）`
}

const classifyTasksPrd: PrdInfo = {
  id: 'DMT-PRD-L2-008',
  level: 'L2',
  owner: '安全产品组',
  updatedAt: '2026-07-22',
  status: 'released',
  content: `# 分级分类任务

## 用户旅程

1. 安全治理员在分级分类 → **分级任务** Tab 查看批量分级任务的列表
2. 提交离线 / 定时批量跑分级算法的任务
3. 任务状态自动刷新：pending → running → success | failed
4. 任务完成后查看分级产物（新分级条目 / 变更项）

## 核心交互

- **任务列表**：状态色标 + 自动刷新（沿用 metadata-bus 采集任务模块）
- **提交任务**：选择数据源 + 调度策略（立即 / 定时）
- **触发来源**：triggeredBy='user'

## 功能列表

- 分级任务列表展示
- 离线 / 定时批量分级提交
- 任务状态自动刷新
- 分级产物查看`
}

const serviceApiPrd: PrdInfo = {
  id: 'DMT-PRD-L2-009',
  level: 'L2',
  owner: '服务产品组',
  updatedAt: '2026-07-22',
  status: 'released',
  content: `# API管理

## 用户旅程

1. 服务开发者通过**API 创建向导**注册新服务（基础信息 → 入参出参 → 绑定数据资产 → 生成元数据）
2. 服务消费方通过**API 列表**搜索、申请、调用已发布的服务
3. 服务运维通过**调用监控**观察 QPS / 失败率 / 延迟等指标
4. 治理员配置鉴权（access_token）和限流策略
5. 服务迭代时通过版本管理保证兼容性

## 核心交互

- **API 列表**：按路径 / 标签筛选；查看详情（含入参出参）
- **API 创建向导**：分步骤表单，绑定数据资产
- **调用监控**：折线图（QPS / 失败率 / 延迟）+ 明细表（按 API）
- **版本管理**：多版本共存 + 流量分配

## 功能列表

- API 元数据注册 / 编辑
- 服务路由配置
- 鉴权（access_token）+ 限流配置
- API 版本管理
- 调用监控（QPS / 失败率 / 延迟）`
}

const defaultPrd: PrdInfo = {
  id: 'DMT-PRD-DEFAULT',
  level: 'L1',
  owner: '产品通用',
  updatedAt: '2026-07-22',
  status: 'released',
  content: `# 数据管理域总览（默认 PRD）

## 用户旅程

1. 各业务角色（数据工程师 / 数据治理员 / 业务用户 / 数据管理员）按需进入不同模块
2. 数据工程师负责采集任务、建模
3. 数据治理员负责业务实体绑定、标准合规
4. 数据管理员负责资产上下架治理
5. 业务用户通过数据资产门户检索、消费数据

## 核心交互

- 数据资产管理（采集、建模、上下架、详情）
- 元数据管理（采集任务 / 业务实体 / 血缘 / 数据标准）
- 数据标准治理（标准化字段映射）
- 数据分级分类（按数据敏感度分级）
- 数据服务管理（API / 数据查询 / 权限申请）

## 功能列表

- 数据资产管理模块
- 元数据管理模块
- 数据标准治理模块
- 数据分级分类模块
- 数据服务管理模块

> 此页面暂无专属 PRD，已落在此总览的默认文档中。如需专属 PRD，请联系产品经理补 PR。
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
  'notifications': notificationsPrd,
  'user-groups': userGroupsPrd,
  'accompany': accompanyPrd,
  'classify-api-docs': classifyApiDocsPrd,
  // L2
  'asset-listing.data-sources': assetListingDataSourcesPrd,
  'asset-listing.detail': assetListingDetailPrd,
  'asset-listing.resource.system': assetListingResourceSystemPrd,
  'asset-listing.resource.business-system': assetListingResourceBusinessSystemPrd,
  'asset-listing.metric': assetListingMetricPrd,
  'task-list': taskListPrd,
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
  // 越具体的路径越靠前
  { prefix: '/asset-management/listing-management/asset-management/detail', key: 'asset-listing.detail' },
  { prefix: '/asset-management/listing-management/asset-management/system', key: 'asset-listing.resource.system' },
  // 入口页：按来源系统分组的卡片矩阵（数据资产上下架）
  { prefix: '/asset-management/listing-management/asset-management', key: 'asset-listing.data-sources' },
  { prefix: '/asset-management/listing-management/data-source/business-system', key: 'asset-listing.resource.business-system' },
  { prefix: '/asset-management/listing-management/data-source/system', key: 'asset-listing.resource.system' },
  // /data-source 入口（business-system.vue）→ business-system PRD
  { prefix: '/asset-management/listing-management/data-source', key: 'asset-listing.resource.business-system' },
  { prefix: '/asset-management/listing-management/metric-management', key: 'asset-listing.metric' },
  { prefix: '/asset-management/listing-management', key: 'asset-listing' },

  // ========= 元数据管理 L1 =========
  // 分级分类 API 文档是独立 PRD（要早于 /metadata/classify）
  { prefix: '/metadata/classify-api-docs', key: 'classify-api-docs' },
  { prefix: '/metadata/classify/matrix', key: 'classify.matrix' },
  { prefix: '/metadata/classify/tasks', key: 'classify.tasks' },
  { prefix: '/metadata/classify', key: 'classify' },
  { prefix: '/metadata', key: 'metadata' },

  // ========= 元数据采集 L1 =========
  { prefix: '/asset-management/basic-management/metadata-collection/task-list', key: 'metadata-collection' },
  { prefix: '/asset-management/basic-management/metadata-collection', key: 'metadata-collection' },
  { prefix: '/asset-management/basic-management/data-source', key: 'metadata-collection' },

  // ========= 数据标准治理 L1 =========
  { prefix: '/data-standard', key: 'data-standard' },

  // ========= 数据服务管理 L1 + L2 =========
  { prefix: '/service/api-management', key: 'service.api' },
  { prefix: '/service', key: 'service' },

  // ========= 业务数据目录 L1 =========
  { prefix: '/business-concept', key: 'business-concept' },

  // ========= 数据模型 L1 =========
  { prefix: '/data-models', key: 'data-models' },

  // ========= 标签管理 L1 =========
  { prefix: '/asset-management/basic-management/tag-management', key: 'tag-management' },

  // ========= 通知管理 L1 =========
  { prefix: '/notifications', key: 'notifications' },

  // ========= 用户组管理 L1 =========
  { prefix: '/user-groups', key: 'user-groups' },

  // ========= 陪跑计划 L1 =========
  { prefix: '/accompany', key: 'accompany' }
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

// ============================================================
// 用户覆盖（localStorage）
// ============================================================

const OVERRIDE_STORAGE_PREFIX = 'dmt.prd.override.'

/** 读取某个 key 的覆盖内容（如果有） */
function loadPrdOverride(key: PrdKey): PrdInfo | null {
  try {
    const raw = localStorage.getItem(OVERRIDE_STORAGE_PREFIX + key)
    if (!raw) return null
    return JSON.parse(raw) as PrdInfo
  } catch {
    return null
  }
}

/** 保存用户对 PRD 的覆盖 */
export function savePrdOverride(key: PrdKey, info: PrdInfo): void {
  try {
    localStorage.setItem(OVERRIDE_STORAGE_PREFIX + key, JSON.stringify(info))
  } catch {
    // localStorage 不可用时静默失败
  }
}

/** 清除某个 key 的覆盖，恢复到内置版本 */
export function resetPrdOverride(key: PrdKey): void {
  try {
    localStorage.removeItem(OVERRIDE_STORAGE_PREFIX + key)
  } catch {
    // ignore
  }
}

/** 清除所有覆盖 */
export function resetAllPrdOverrides(): void {
  try {
    const keys: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && k.startsWith(OVERRIDE_STORAGE_PREFIX)) keys.push(k)
    }
    keys.forEach(k => localStorage.removeItem(k))
  } catch {
    // ignore
  }
}

/** 列出所有被覆盖过的 key */
export function listOverrideKeys(): PrdKey[] {
  try {
    const out: PrdKey[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && k.startsWith(OVERRIDE_STORAGE_PREFIX)) {
        out.push(k.substring(OVERRIDE_STORAGE_PREFIX.length) as PrdKey)
      }
    }
    return out
  } catch {
    return []
  }
}

/** 检查某 key 是否被覆盖 */
export function isPrdOverridden(key: PrdKey): boolean {
  return loadPrdOverride(key) !== null
}

/**
 * 取"有效"的 PRD：用户覆盖优先，否则取内置
 * 这是产品说明抽屉实际应该调用的入口（替代 getPrdForRoute）
 */
export function getEffectivePrdForRoute(routePath: string): { info: PrdInfo; isOverridden: boolean; key: PrdKey } {
  const key = getPrdKeyForRoute(routePath)
  const builtin = prdDict[key]
  const override = loadPrdOverride(key)
  return {
    key,
    info: override ?? builtin,
    isOverridden: override !== null
  }
}

/** 列所有 PRD（带 override 标记） */
export function listAllPrds(): Array<{ key: PrdKey; level: string; title: string; owner: string; status: string; isOverridden: boolean }> {
  return (Object.keys(prdDict) as PrdKey[]).map(key => {
    const p = prdDict[key]
    return {
      key,
      level: p.level,
      title: getPrdTitle(p.content),
      owner: p.owner,
      status: p.status,
      isOverridden: isPrdOverridden(key)
    }
  })
}
