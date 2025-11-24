# 标签系统IDMapping需求文档

## 1. 产品背景与目标

### 1.1 业务背景
随着企业数据规模增长，用户身份识别成为数据治理的核心挑战。现有标签系统缺乏统一的身份识别机制，导致：
- 同一用户在不同业务系统中的数据无法关联
- 标签计算结果存在重复或遗漏
- 跨系统数据整合困难
- 用户画像构建不完整

### 1.2 产品目标
构建基于IDMapping的统一标签管理体系，实现：
- **身份统一识别**：建立用户全生命周期身份映射关系
- **标签精准投放**：确保标签准确关联到正确用户
- **数据质量提升**：减少重复计算，提高标签准确性
- **跨系统协同**：支持多源数据融合和标签共享

## 2. 需求范围

### 2.1 功能范围
- 标签表注册与管理
- IDMapping规则配置
- 主键选择与映射
- 标签数据质量监控
- 身份冲突解决机制

### 2.2 非功能需求
- **性能**：支持千万级用户身份映射
- **准确性**：身份识别准确率≥99.5%
- **实时性**：标签更新延迟<5分钟
- **可用性**：系统可用性≥99.9%

## 3. 详细功能需求

### 3.1 标签表注册功能

#### 3.1.1 表注册流程
```
数据源接入 → 表结构解析 → 主键识别 → 映射配置 → 质量校验 → 注册完成
```

#### 3.1.2 功能需求

**表信息录入**
- 支持多种数据源类型（MySQL、PostgreSQL、Oracle、Hive等）
- 自动解析表结构和字段类型
- 支持表备注和字段备注导入
- 提供表分类和标签功能

**主键选择与配置**
- 自动识别候选主键字段
- 支持复合主键配置
- 主键唯一性校验
- 主键变更历史记录

**IDMapping规则配置**
- 支持多种映射类型：
  - 一对一映射（手机号、邮箱等）
  - 一对多映射（设备ID、Cookie等）
  - 多对一映射（家庭成员、企业账号等）
- 映射优先级设置
- 映射有效期管理
- 冲突解决策略

**数据质量监控**
- 主键重复率监控
- 映射完整性检查
- 数据一致性校验
- 异常数据告警

#### 3.1.3 界面设计

**表注册向导**
```
第一步：基础信息
┌─────────────────────────────────────┐
│ 表名称：*[输入框]*                  │
│ 数据源：*[下拉选择]*                │
│ 数据库：*[下拉选择]*                │
│ 表分类：*[标签选择器]*              │
│ 表描述：*[文本域]*                  │
└─────────────────────────────────────┘

第二步：主键配置
┌─────────────────────────────────────┐
│ 候选主键：[字段列表]                │
│ 选择主键：*[多选框]*                │
│ 主键类型：*[单选]*                   │
│ └─ 自然人ID ├─ 设备ID ├─ 企业ID      │
│ 唯一性校验：[按钮]                  │
│ 重复率：xx% [图表]                  │
└─────────────────────────────────────┘

第三步：映射规则
┌─────────────────────────────────────┐
│ 映射类型：[下拉选择]                 │
│ 优先级：[数字输入]                   │
│ 有效期：[日期选择]                   │
│ 冲突策略：[下拉选择]                 │
│ └─ 覆盖 ├─ 忽略 ├─ 人工处理          │
└─────────────────────────────────────┘
```

### 3.2 标签管理优化

#### 3.2.1 标签创建流程优化
结合IDMapping的标签创建流程：
```
选择标签表 → 配置IDMapping → 定义标签规则 → 设置计算策略 → 发布标签
```

#### 3.2.2 标签类型扩展

**基于身份的标签**
- 自然人标签：基于身份证号、手机号等
- 设备标签：基于设备ID、IMEI等
- 企业标签：基于企业注册号、统一社会信用代码等
- 家庭标签：基于家庭ID、地址等

**标签继承机制**
- 子身份继承父身份标签
- 标签权重计算
- 标签冲突解决
- 标签有效期管理

#### 3.2.3 标签计算策略

**计算方式**
- 实时计算：基于流式数据实时更新
- 批量计算：定时批量处理历史数据
- 增量计算：仅处理变更数据
- 混合计算：结合实时和批量

**数据范围**
- 全量数据：基于所有历史数据
- 时间窗口：基于指定时间范围
- 行为序列：基于用户行为轨迹
- 关联数据：基于关联对象数据

### 3.3 属性管理增强

#### 3.3.1 属性分类体系
```
基础属性
├─ 人口统计学属性（年龄、性别、地域等）
├─ 社会属性（职业、教育、收入等）
└─ 联系属性（手机、邮箱、地址等）

行为属性
├─ 交易行为（购买、支付、退款等）
├─ 浏览行为（点击、停留、跳出等）
└─ 社交行为（分享、评论、点赞等）

衍生属性
├─ 计算属性（RFM、活跃度、价值等）
├─ 预测属性（流失概率、购买意向等）
└─ 分群属性（生命周期、价值分层等）
```

#### 3.3.2 属性映射规则
- 属性来源映射：多源数据字段映射
- 属性转换规则：数据清洗和转换
- 属性合并策略：冲突解决和合并
- 属性更新机制：更新频率和触发条件

### 3.4 数据质量管理

#### 3.4.1 质量指标体系
```
完整性指标
├─ 数据缺失率：≤5%
├─ 映射覆盖率：≥95%
└─ 标签覆盖率：≥90%

准确性指标
├─ 身份识别准确率：≥99.5%
├─ 标签准确率：≥95%
└─ 属性准确率：≥98%

一致性指标
├─ 跨系统一致性：≥99%
├─ 时间一致性：≥98%
└─ 逻辑一致性：≥97%
```

#### 3.4.2 质量监控功能
- **实时监控**：关键指标实时展示
- **异常检测**：自动识别数据异常
- **质量报告**：定期生成质量报告
- **问题追踪**：质量问题定位和修复

### 3.5 系统集成需求

#### 3.5.1 外部系统对接
- **CRM系统**：客户主数据同步
- **营销系统**：标签数据推送
- **分析系统**：标签数据导出
- **数据仓库**：历史数据归档

#### 3.5.2 数据同步机制
- **实时同步**：基于消息队列的实时同步
- **定时同步**：定时批量数据同步
- **增量同步**：仅同步变更数据
- **全量同步**：定期全量数据校验

## 4. 技术架构要求

### 4.1 系统架构

```
┌─────────────────────────────────────────┐
│            应用层                        │
├─────────────────────────────────────────┤
│  标签管理  │  属性管理  │  质量监控  │  │
├─────────────────────────────────────────┤
│            服务层                        │
├─────────────────────────────────────────┤
│  IDMapping │  标签计算  │  数据质量  │  │
├─────────────────────────────────────────┤
│            数据层                        │
├─────────────────────────────────────────┤
│  标签库  │  映射库  │  质量库  │日志库│
└─────────────────────────────────────────┘
```

### 4.2 数据模型设计

#### 4.2.1 核心实体

**用户身份表（user_identity）**
```sql
CREATE TABLE user_identity (
    identity_id BIGINT PRIMARY KEY,
    identity_type VARCHAR(50) NOT NULL,  -- PERSON/DEVICE/ENTERPRISE
    identity_value VARCHAR(200) NOT NULL,
    identity_hash VARCHAR(64) NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_identity (identity_type, identity_value)
);
```

**身份映射表（identity_mapping）**
```sql
CREATE TABLE identity_mapping (
    mapping_id BIGINT PRIMARY KEY,
    master_identity_id BIGINT NOT NULL,
    slave_identity_id BIGINT NOT NULL,
    mapping_type VARCHAR(50) NOT NULL,     -- ONE_TO_ONE/ONE_TO_MANY
    priority INT DEFAULT 0,
    effective_date DATE NOT NULL,
    expiry_date DATE,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (master_identity_id) REFERENCES user_identity(identity_id),
    FOREIGN KEY (slave_identity_id) REFERENCES user_identity(identity_id),
    INDEX idx_master (master_identity_id),
    INDEX idx_slave (slave_identity_id)
);
```

**标签定义表（tag_definition）**
```sql
CREATE TABLE tag_definition (
    tag_id BIGINT PRIMARY KEY,
    tag_name VARCHAR(100) NOT NULL,
    tag_code VARCHAR(50) NOT NULL UNIQUE,
    tag_type VARCHAR(50) NOT NULL,         -- RULE/IMPORT/CALCULATE
    identity_type VARCHAR(50) NOT NULL,    -- 绑定身份类型
    calculation_rule TEXT,                 -- 计算规则JSON
    data_source VARCHAR(200),              -- 数据来源
    update_frequency VARCHAR(50),          -- 更新频率
    status VARCHAR(20) DEFAULT 'DRAFT',
    creator VARCHAR(50),
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**标签值表（tag_value）**
```sql
CREATE TABLE tag_value (
    value_id BIGINT PRIMARY KEY,
    tag_id BIGINT NOT NULL,
    identity_id BIGINT NOT NULL,
    tag_value VARCHAR(500),
    value_type VARCHAR(50),                -- STRING/NUMBER/DATE
    confidence DECIMAL(5,4) DEFAULT 1.0,   -- 置信度
    effective_date DATE NOT NULL,
    expiry_date DATE,
    calculation_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    FOREIGN KEY (tag_id) REFERENCES tag_definition(tag_id),
    FOREIGN KEY (identity_id) REFERENCES user_identity(identity_id),
    INDEX idx_tag_identity (tag_id, identity_id),
    INDEX idx_identity (identity_id)
);
```

### 4.3 接口设计规范

#### 4.3.1 标签表注册接口
```typescript
// 请求
interface RegisterTagTableRequest {
    tableName: string;
    dataSourceId: string;
    databaseName: string;
    tableSchema: TableSchema;
    primaryKeys: PrimaryKeyConfig[];
    mappingRules: MappingRule[];
    qualityConfig: QualityConfig;
}

// 响应
interface RegisterTagTableResponse {
    tableId: string;
    registrationStatus: 'SUCCESS' | 'FAILED' | 'PARTIAL';
    validationResults: ValidationResult[];
    mappingResults: MappingResult[];
    qualityScore: number;
}
```

#### 4.3.2 身份解析接口
```typescript
// 请求
interface IdentityResolutionRequest {
    identityType: string;
    identityValue: string;
    resolutionType: 'EXACT' | 'FUZZY';
    context?: ResolutionContext;
}

// 响应
interface IdentityResolutionResponse {
    masterIdentityId: string;
    identityChain: IdentityNode[];
    confidenceScore: number;
    mappingPath: MappingEdge[];
    relatedIdentities: RelatedIdentity[];
}
```

## 5. 非功能性需求

### 5.1 性能要求
- **并发处理**：支持1000并发用户
- **响应时间**：API响应时间<500ms
- **数据处理能力**：日处理1亿条身份映射记录
- **存储容量**：支持10年历史数据存储

### 5.2 安全要求
- **数据加密**：敏感数据加密存储和传输
- **访问控制**：基于角色的权限管理
- **审计日志**：完整的操作审计轨迹
- **数据脱敏**：支持数据脱敏展示

### 5.3 可用性要求
- **系统可用性**：99.9%以上
- **数据备份**：实时数据备份和恢复
- **容灾能力**：支持异地容灾部署
- **监控告警**：7×24小时监控告警

## 6. 实施计划

### 6.1 阶段划分

**第一阶段（基础框架）- 4周**
- 标签表注册功能开发
- IDMapping核心算法实现
- 基础数据模型设计
- 身份映射引擎开发

**第二阶段（功能完善）- 6周**
- 标签管理功能集成IDMapping
- 属性管理功能增强
- 数据质量管理功能
- 可视化界面开发

**第三阶段（系统集成）- 4周**
- 外部系统对接
- 性能优化和调优
- 安全加固和测试
- 上线部署和培训

### 6.2 资源需求
- **开发团队**：8-10人（前端3人，后端4人，测试2人）
- **硬件资源**：服务器10台，存储50TB
- **软件许可**：数据库、中间件等许可
- **项目周期**：14周

## 7. 风险评估与应对

### 7.1 技术风险
- **数据质量风险**：建立数据质量监控机制
- **性能风险**：提前进行性能测试和优化
- **兼容性风险**：制定详细的兼容性测试计划

### 7.2 业务风险
- **数据安全风险**：加强数据安全防护措施
- **用户接受度风险**：提前进行用户培训和试用
- **业务连续性风险**：制定详细的切换和回退方案

## 8. 成功指标

### 8.1 技术指标
- 身份识别准确率≥99.5%
- 标签计算性能提升50%
- 数据质量问题减少80%
- 系统响应时间<500ms

### 8.2 业务指标
- 标签使用覆盖率提升30%
- 营销活动转化率提升15%
- 数据一致性投诉减少90%
- 跨系统数据整合效率提升60%

## 9. 后续规划

### 9.1 功能扩展
- AI驱动的身份识别算法
- 实时标签计算引擎
- 跨域身份映射支持
- 图计算关系发现

### 9.2 技术升级
- 云原生架构改造
- 大数据处理平台升级
- 机器学习模型集成
- 区块链身份验证

---

**文档版本**：v1.0
**创建时间**：2024年11月21日
**作者**：产品团队
**评审状态**：待评审