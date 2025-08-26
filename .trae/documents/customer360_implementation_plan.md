# 客户360页面TDD实施计划文档

## 1. 当前实现分析

### 1.1 页面结构分析

**当前页面架构：**
- **搜索页面**：`/src/pages/discovery/customer360/index.vue` - 客户ID搜索入口
- **详情页面**：`/src/pages/discovery/customer360/detail.vue` - 客户详细信息展示
- **组件目录**：`/src/pages/discovery/customer360/components/` - 各功能模块组件

**现有组件结构：**
```
├── BasicInfo.vue              # 基本信息组件
├── UserOwnedProducts.vue      # 用户拥有产品组件
├── CreditList.vue             # 授信列表组件
├── LoanList.vue               # 用信列表组件
├── AdjustmentHistory.vue      # 调额记录组件
├── CollectionRecords.vue      # 催收记录组件
├── CreditRecords.vue          # 征信记录组件
└── HistoryQueryButton.vue     # 历史查询按钮组件
```

**当前数据流：**
1. 路由参数获取用户ID
2. 调用`fetchUserInfo(userId)`获取用户数据
3. 通过计算属性分发数据到各组件
4. 组件内部处理数据展示和交互

### 1.2 组件架构分析

**主页面架构（detail.vue）：**
- **调试系统**：完整的调试面板和日志系统
- **状态管理**：响应式数据管理和组件状态跟踪
- **数据流跟踪**：API调用、数据传递、组件更新的完整跟踪
- **错误处理**：加载状态、错误状态、空数据状态的处理

**当前布局结构：**
```
┌─────────────────────────────────────────┐
│              调试面板（可切换）            │
├─────────────────────────────────────────┤
│              顶部操作栏                  │
├─────────────────────────────────────────┤
│              客户概览卡片                │
├─────────────────────────────────────────┤
│              Tab切换区域                 │
│  基本信息 | 征信记录 | 催收记录           │
├─────────────────────────────────────────┤
│              产品信息区域                │
│         用户拥有的产品展示               │
└─────────────────────────────────────────┘
```

### 1.3 数据结构分析

**Mock数据结构（customer360.ts）：**
- **用户基础信息**：姓名、年龄、身份证、手机号等
- **产品信息**：products数组，包含productKey、productType、productName等
- **授信记录**：creditsList数组，包含授信额度、利率、期限等
- **用信记录**：loanRecords数组，包含还款计划、还款记录等
- **征信记录**：creditReports数组，包含征信评分、报告内容等
- **催收记录**：collectionRecords数组，包含催收方式、结果等
- **营销记录**：marketingRecords对象，包含触达记录、权益记录等

## 2. 需求对比分析

### 2.1 现有功能vs新需求对比

| 功能模块 | 现有实现 | 新需求 | 差距分析 |
|---------|---------|--------|----------|
| 页面布局 | 单层Tab切换 | 两级Tab架构 | 需要重构Tab结构 |
| 用户级信息 | 基本信息、征信、催收 | 新增用户画像模块 | 需要新增用户画像组件 |
| 产品级信息 | 固定展示所有产品 | 一级Tab产品切换 | 需要产品切换器 |
| 业务明细 | Tab切换展示 | 垂直陈列表格展示 | 需要重构展示方式 |
| 支付流程 | 无独立模块 | 签约、放款、还款子模块 | 需要新增支付流程组件 |
| 营销记录 | 无 | 营销记录模块 | 需要新增营销记录组件 |
| 历史查询 | 按钮入口 | 独立页面任务列表 | 需要新增历史查询页面 |

### 2.2 数据结构对比

**887123客户当前数据完整性：**
- ✅ 基本信息：完整
- ✅ 产品信息：1个消费贷款产品
- ✅ 授信记录：2条记录
- ✅ 用信记录：1条记录（含还款计划）
- ✅ 征信记录：1条记录
- ✅ 催收记录：2条记录
- ✅ 营销记录：完整（触达记录、权益记录、效果分析）
- ❌ 用户画像：缺失
- ❌ 调额记录：缺失
- ❌ 支付流程记录：缺失

## 3. TDD开发计划

### 3.1 测试驱动开发策略

**TDD开发流程：**
1. **Red阶段**：编写失败的测试用例
2. **Green阶段**：编写最小可行代码使测试通过
3. **Refactor阶段**：重构代码提高质量

**测试层级：**
- **单元测试**：组件功能测试
- **集成测试**：组件间交互测试
- **端到端测试**：完整用户流程测试

### 3.2 测试用例设计

#### 3.2.1 用户画像模块测试用例

```javascript
// 测试文件：tests/customer360/UserProfile.test.js
describe('用户画像模块', () => {
  test('应该正确渲染用户画像卡片', () => {
    // 测试画像卡片的基本渲染
  })
  
  test('应该显示人口统计特征', () => {
    // 测试年龄段、性别、地域等信息显示
  })
  
  test('应该显示行为特征标签', () => {
    // 测试登录活跃度、使用习惯等标签
  })
  
  test('应该显示风险特征评级', () => {
    // 测试信用等级、风险类型等评级显示
  })
  
  test('应该支持画像数据的复制功能', () => {
    // 测试数据复制功能
  })
})
```

#### 3.2.2 两级Tab架构测试用例

```javascript
// 测试文件：tests/customer360/TwoLevelTabs.test.js
describe('两级Tab架构', () => {
  test('应该正确渲染一级产品Tab', () => {
    // 测试产品切换Tab的渲染
  })
  
  test('应该支持产品Tab切换', () => {
    // 测试产品切换功能
  })
  
  test('应该正确渲染二级信息Tab', () => {
    // 测试信息模块Tab的渲染
  })
  
  test('应该支持信息模块Tab切换', () => {
    // 测试信息模块切换功能
  })
  
  test('应该保持Tab状态记忆', () => {
    // 测试Tab状态的保持功能
  })
})
```

#### 3.2.3 业务核心明细测试用例

```javascript
// 测试文件：tests/customer360/BusinessCoreDetails.test.js
describe('业务核心明细模块', () => {
  test('应该垂直陈列展示所有子模块', () => {
    // 测试垂直布局
  })
  
  test('应该正确展示授信列表表格', () => {
    // 测试授信列表的表格展示
  })
  
  test('应该正确展示用信列表表格', () => {
    // 测试用信列表的表格展示
  })
  
  test('应该支持用信记录查看还款明细', () => {
    // 测试还款记录查看功能
  })
  
  test('应该正确展示调额记录表格', () => {
    // 测试调额记录的表格展示
  })
  
  test('应该正确展示支付流程子模块', () => {
    // 测试支付流程的垂直陈列展示
  })
})
```

#### 3.2.4 数据完整性测试用例

```javascript
// 测试文件：tests/customer360/DataIntegrity.test.js
describe('887123客户数据完整性', () => {
  test('应该包含完整的基本信息', () => {
    // 测试基本信息的完整性
  })
  
  test('应该包含完整的产品信息', () => {
    // 测试产品信息的完整性
  })
  
  test('应该包含完整的用户画像数据', () => {
    // 测试用户画像数据的完整性
  })
  
  test('应该包含完整的支付流程记录', () => {
    // 测试支付流程记录的完整性
  })
  
  test('应该包含完整的调额记录', () => {
    // 测试调额记录的完整性
  })
})
```

### 3.3 开发步骤规划

#### 阶段1：Mock数据补齐（1天）
1. **补齐887123客户用户画像数据**
2. **补齐调额记录数据**
3. **补齐支付流程记录数据**
4. **验证数据结构完整性**

#### 阶段2：用户画像模块开发（2天）
1. **编写用户画像组件测试用例**
2. **开发UserProfile.vue组件**
3. **实现画像数据展示逻辑**
4. **集成到主页面**

#### 阶段3：两级Tab架构重构（3天）
1. **编写Tab架构测试用例**
2. **开发ProductSwitcher.vue组件**
3. **开发InfoModuleTabs.vue组件**
4. **重构主页面布局**
5. **实现状态记忆功能**

#### 阶段4：业务核心明细重构（2天）
1. **编写业务明细测试用例**
2. **重构BusinessCoreDetails.vue组件**
3. **实现垂直陈列布局**
4. **优化表格展示**

#### 阶段5：支付流程模块开发（2天）
1. **编写支付流程测试用例**
2. **开发PaymentProcess.vue组件**
3. **开发签约、放款、还款子组件**
4. **集成到业务明细模块**

#### 阶段6：营销记录模块开发（1天）
1. **编写营销记录测试用例**
2. **开发MarketingRecords.vue组件**
3. **实现营销数据展示**
4. **集成到信息模块Tab**

#### 阶段7：历史查询页面开发（2天）
1. **编写历史查询测试用例**
2. **开发历史查询页面**
3. **实现任务列表功能**
4. **集成到路由系统**

#### 阶段8：集成测试与优化（1天）
1. **执行端到端测试**
2. **性能优化**
3. **用户体验优化**
4. **文档更新**

## 4. Mock数据补齐方案

### 4.1 887123客户数据补齐清单

#### 4.1.1 用户画像数据结构

```typescript
interface UserProfile {
  // 人口统计特征
  demographics: {
    ageGroup: string;        // 年龄段：青年/中年/老年
    genderLabel: string;     // 性别标识
    regionType: string;      // 地域归属：一线城市/二线城市/三线城市
    occupationType: string;  // 职业类别：企业员工/自由职业/退休等
    incomeLevel: string;     // 收入水平：高收入/中等收入/低收入
  };
  
  // 行为特征
  behavior: {
    loginActivity: string;   // 登录活跃度：高活跃/中活跃/低活跃
    usageHabits: string;     // 使用习惯：移动端偏好/PC端偏好/混合使用
    featurePreference: string; // 功能偏好：理财偏好/贷款偏好/支付偏好
    operationPattern: string;  // 操作行为：谨慎型/积极型/观望型
  };
  
  // 消费特征
  consumption: {
    spendingPower: string;   // 消费能力：高消费/中等消费/低消费
    frequency: string;       // 消费频次：高频/中频/低频
    preference: string;      // 消费偏好：品质型/价格型/便利型
    timePattern: string;     // 消费时段：工作日/周末/节假日
  };
  
  // 风险特征
  risk: {
    creditLevel: string;     // 信用等级：优秀/良好/一般/较差
    riskType: string;        // 风险类型：低风险/中风险/高风险
    repaymentCapacity: string; // 还款能力：强/中等/弱
    controlLevel: string;    // 风险控制：严格/一般/宽松
  };
  
  // 产品偏好
  productPreference: {
    holdingTypes: string[];  // 持有产品类型
    activityLevel: string;   // 使用活跃度：高活跃/中活跃/低活跃
    valueContribution: string; // 价值贡献：高价值/中价值/低价值
    preferredChannels: string[]; // 偏好渠道
    servicePreference: string;   // 服务偏好：自助服务/人工服务/混合服务
    lifecycleStage: string;      // 生命周期：新客户/成长期/成熟期/流失风险期
  };
  
  // 营销响应特征
  marketingResponse: {
    sensitivity: string;     // 营销敏感度：高敏感/中敏感/低敏感
    bestContactTime: string; // 最佳触达时间：工作时间/休息时间/任意时间
    effectiveChannels: string[]; // 有效营销渠道
    frequencyPreference: string; // 营销频次偏好：高频/中频/低频
  };
}
```

#### 4.1.2 调额记录数据结构

```typescript
interface QuotaAdjustmentRecord {
  adjustmentId: string;    // 调额记录ID
  productKey: string;      // 产品标识
  adjustmentDate: string;  // 调额日期
  adjustmentType: string;  // 调额类型：提额/降额/恢复
  beforeAmount: number;    // 调额前额度
  afterAmount: number;     // 调额后额度
  adjustmentReason: string; // 调额原因
  approvalStatus: string;  // 审批状态：通过/拒绝/待审批
  operator: string;        // 操作人员
  operatorType: string;    // 操作类型：系统自动/人工审批
  effectiveDate: string;   // 生效日期
  remarks: string;         // 备注信息
}
```

#### 4.1.3 支付流程记录数据结构

```typescript
interface PaymentProcessRecords {
  // 签约记录
  contractRecords: Array<{
    contractId: string;      // 合同ID
    productKey: string;      // 产品标识
    signDate: string;        // 签约日期
    signMethod: string;      // 签约方式：线上签约/线下签约/电子签约
    contractType: string;    // 合同类型：借款合同/担保合同/服务协议
    contractStatus: string;  // 合同状态：有效/失效/终止
    contractAmount: number;  // 合同金额
    contractTerm: number;    // 合同期限（月）
    signLocation: string;    // 签约地点
    documentUrl: string;     // 合同文件链接
  }>;
  
  // 放款记录
  disbursementRecords: Array<{
    disbursementId: string;  // 放款ID
    productKey: string;      // 产品标识
    disbursementDate: string; // 放款日期
    disbursementAmount: number; // 放款金额
    disbursementChannel: string; // 放款渠道：银行转账/第三方支付/现金
    receivingAccount: string;    // 收款账户
    disbursementStatus: string;  // 放款状态：成功/失败/处理中
    transactionId: string;       // 交易流水号
    arrivalTime: string;         // 到账时间
    handlingFee: number;         // 手续费
  }>;
  
  // 还款记录
  repaymentRecords: Array<{
    repaymentId: string;     // 还款ID
    productKey: string;      // 产品标识
    repaymentDate: string;   // 还款日期
    repaymentAmount: number; // 还款金额
    repaymentMethod: string; // 还款方式：自动扣款/主动还款/线下还款
    repaymentChannel: string; // 还款渠道：银行卡/支付宝/微信/现金
    repaymentStatus: string;  // 还款状态：成功/失败/部分还款
    paymentAccount: string;   // 付款账户
    transactionId: string;    // 交易流水号
    principalAmount: number;  // 本金金额
    interestAmount: number;   // 利息金额
    penaltyAmount: number;    // 罚息金额
    remainingBalance: number; // 剩余余额
  }>;
}
```

### 4.2 887123客户完整数据示例

```typescript
const user887123CompleteData = {
  // ... 现有数据保持不变
  
  // 新增用户画像数据
  userProfile: {
    demographics: {
      ageGroup: '中年',
      genderLabel: '男性',
      regionType: '一线城市',
      occupationType: '企业员工',
      incomeLevel: '中等收入'
    },
    behavior: {
      loginActivity: '中活跃',
      usageHabits: '移动端偏好',
      featurePreference: '贷款偏好',
      operationPattern: '谨慎型'
    },
    consumption: {
      spendingPower: '中等消费',
      frequency: '中频',
      preference: '品质型',
      timePattern: '工作日'
    },
    risk: {
      creditLevel: '良好',
      riskType: '低风险',
      repaymentCapacity: '强',
      controlLevel: '一般'
    },
    productPreference: {
      holdingTypes: ['消费贷款', '公积金贷款'],
      activityLevel: '中活跃',
      valueContribution: '中价值',
      preferredChannels: ['手机银行', 'APP'],
      servicePreference: '自助服务',
      lifecycleStage: '成熟期'
    },
    marketingResponse: {
      sensitivity: '中敏感',
      bestContactTime: '工作时间',
      effectiveChannels: ['APP推送', '短信'],
      frequencyPreference: '中频'
    }
  },
  
  // 新增调额记录
  quotaAdjustmentHistory: [
    {
      adjustmentId: 'QA001',
      productKey: 'LN-2024-002',
      adjustmentDate: '2024-01-10',
      adjustmentType: '提额',
      beforeAmount: 30000,
      afterAmount: 50000,
      adjustmentReason: '客户信用评级提升',
      approvalStatus: '通过',
      operator: '系统自动',
      operatorType: '系统自动',
      effectiveDate: '2024-01-11',
      remarks: '基于客户良好还款记录自动提额'
    }
  ],
  
  // 新增支付流程记录
  paymentProcessRecords: {
    contractRecords: [
      {
        contractId: 'CT-20230815-001',
        productKey: 'LN-2024-002',
        signDate: '2023-08-15',
        signMethod: '电子签约',
        contractType: '借款合同',
        contractStatus: '有效',
        contractAmount: 50000,
        contractTerm: 24,
        signLocation: '线上',
        documentUrl: '/contracts/CT-20230815-001.pdf'
      }
    ],
    disbursementRecords: [
      {
        disbursementId: 'DB-20230815-001',
        productKey: 'LN-2024-002',
        disbursementDate: '2023-08-15',
        disbursementAmount: 50000,
        disbursementChannel: '银行转账',
        receivingAccount: '6228****9876',
        disbursementStatus: '成功',
        transactionId: 'TXN-20230815-001',
        arrivalTime: '2023-08-15 15:30:00',
        handlingFee: 0
      }
    ],
    repaymentRecords: [
      {
        repaymentId: 'RP-20230915-001',
        productKey: 'LN-2024-002',
        repaymentDate: '2023-09-15',
        repaymentAmount: 2500,
        repaymentMethod: '自动扣款',
        repaymentChannel: '银行卡',
        repaymentStatus: '成功',
        paymentAccount: '6228****9876',
        transactionId: 'TXN-20230915-001',
        principalAmount: 1800,
        interestAmount: 700,
        penaltyAmount: 0,
        remainingBalance: 48200
      }
    ]
  }
};
```

## 5. 两级Tab架构实施步骤

### 5.1 架构设计

**组件层级结构：**
```
Customer360Detail.vue
├── UserLevelInfo.vue          # 用户级信息区
│   ├── UserProfile.vue        # 用户画像
│   ├── CreditRecords.vue      # 征信记录
│   └── CollectionRecords.vue  # 催收记录
└── ProductLevelInfo.vue       # 产品级信息区
    ├── ProductSwitcher.vue    # 一级Tab：产品切换器
    └── InfoModuleTabs.vue     # 二级Tab：信息模块
        ├── CustomerOverview.vue    # 客户概览
        ├── BusinessCoreDetails.vue # 业务核心明细
        │   ├── CreditList.vue      # 授信列表
        │   ├── LoanList.vue        # 用信列表
        │   ├── AdjustmentHistory.vue # 调额记录
        │   └── PaymentProcess.vue  # 支付流程
        │       ├── ContractRecords.vue    # 签约记录
        │       ├── DisbursementRecords.vue # 放款记录
        │       └── RepaymentRecords.vue    # 还款记录
        └── MarketingRecords.vue    # 营销记录
```

### 5.2 状态管理设计

```typescript
// 状态管理接口
interface Customer360State {
  // 用户级信息
  userLevelInfo: {
    userProfile: UserProfile;
    creditReports: CreditReport[];
    collectionRecords: CollectionRecord[];
  };
  
  // 产品级信息
  productLevelInfo: {
    selectedProductKey: string;  // 当前选中的产品
    selectedInfoModule: string;  // 当前选中的信息模块
    products: Product[];         // 用户拥有的产品列表
    productData: {               // 各产品的详细数据
      [productKey: string]: {
        customerOverview: any;
        businessCoreDetails: {
          creditList: any[];
          loanList: any[];
          adjustmentHistory: any[];
          paymentProcess: PaymentProcessRecords;
        };
        marketingRecords: MarketingRecord;
      };
    };
  };
  
  // UI状态
  uiState: {
    loading: boolean;
    error: string | null;
    tabMemory: {
      [productKey: string]: string; // 记住每个产品的信息模块选择
    };
  };
}
```

### 5.3 实施步骤

#### 步骤1：创建产品切换器组件

```vue
<!-- ProductSwitcher.vue -->
<template>
  <div class="product-switcher">
    <a-tabs 
      v-model:active-key="selectedProductKey" 
      type="card" 
      size="large"
      @change="handleProductChange"
    >
      <a-tab-pane 
        v-for="product in products" 
        :key="product.productKey"
        :title="getProductTabTitle(product)"
      >
        <template #title>
          <div class="product-tab-title">
            <icon-component :type="product.productType" />
            <span class="product-name">{{ product.productName }}</span>
            <a-tag :color="getProductStatusColor(product.status)">
              {{ product.status }}
            </a-tag>
            <div class="product-metrics">
              <span class="metric-item">
                余额: {{ formatAmount(product.balance) }}
              </span>
            </div>
          </div>
        </template>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>
```

#### 步骤2：创建信息模块Tab组件

```vue
<!-- InfoModuleTabs.vue -->
<template>
  <div class="info-module-tabs">
    <a-tabs 
      v-model:active-key="selectedInfoModule" 
      type="line" 
      size="default"
      @change="handleModuleChange"
    >
      <a-tab-pane key="overview" title="客户概览">
        <CustomerOverview 
          :product-key="selectedProductKey"
          :product-data="currentProductData"
        />
      </a-tab-pane>
      
      <a-tab-pane key="business" title="业务核心明细">
        <BusinessCoreDetails 
          :product-key="selectedProductKey"
          :business-data="currentBusinessData"
        />
      </a-tab-pane>
      
      <a-tab-pane key="marketing" title="营销记录">
        <MarketingRecords 
          :product-key="selectedProductKey"
          :marketing-data="currentMarketingData"
        />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>
```

#### 步骤3：重构业务核心明细组件

```vue
<!-- BusinessCoreDetails.vue -->
<template>
  <div class="business-core-details">
    <!-- 垂直陈列展示，不使用Tab -->
    <div class="detail-section">
      <div class="section-header">
        <h4>授信列表</h4>
      </div>
      <CreditList 
        :credit-data="businessData.creditList"
        :product-key="productKey"
      />
    </div>
    
    <div class="detail-section">
      <div class="section-header">
        <h4>用信列表</h4>
      </div>
      <LoanList 
        :loan-data="businessData.loanList"
        :product-key="productKey"
        @view-repayment="handleViewRepayment"
      />
    </div>
    
    <div class="detail-section">
      <div class="section-header">
        <h4>调额记录</h4>
      </div>
      <AdjustmentHistory 
        :adjustment-data="businessData.adjustmentHistory"
        :product-key="productKey"
      />
    </div>
    
    <div class="detail-section">
      <div class="section-header">
        <h4>支付流程</h4>
      </div>
      <PaymentProcess 
        :payment-data="businessData.paymentProcess"
        :product-key="productKey"
      />
    </div>
  </div>
</template>
```

## 6. 用户画像模块实现方案

### 6.1 组件设计

```vue
<!-- UserProfile.vue -->
<template>
  <div class="user-profile">
    <div class="profile-header">
      <h3>用户画像</h3>
      <div class="profile-actions">
        <a-button size="small" @click="copyProfileData">
          <template #icon><icon-copy /></template>
          复制画像
        </a-button>
      </div>
    </div>
    
    <div class="profile-content">
      <!-- 人口统计特征 -->
      <div class="profile-card">
        <div class="card-header">
          <icon-user class="card-icon" />
          <span class="card-title">人口统计特征</span>
        </div>
        <div class="card-content">
          <div class="profile-tags">
            <a-tag color="blue">{{ userProfile.demographics.ageGroup }}</a-tag>
            <a-tag color="pink">{{ userProfile.demographics.genderLabel }}</a-tag>
            <a-tag color="green">{{ userProfile.demographics.regionType }}</a-tag>
            <a-tag color="orange">{{ userProfile.demographics.occupationType }}</a-tag>
            <a-tag color="purple">{{ userProfile.demographics.incomeLevel }}</a-tag>
          </div>
        </div>
      </div>
      
      <!-- 行为特征 -->
      <div class="profile-card">
        <div class="card-header">
          <icon-interaction class="card-icon" />
          <span class="card-title">行为特征</span>
        </div>
        <div class="card-content">
          <div class="behavior-items">
            <div class="behavior-item">
              <span class="label">登录活跃度</span>
              <a-tag :color="getActivityColor(userProfile.behavior.loginActivity)">
                {{ userProfile.behavior.loginActivity }}
              </a-tag>
            </div>
            <div class="behavior-item">
              <span class="label">使用习惯</span>
              <span class="value">{{ userProfile.behavior.usageHabits }}</span>
            </div>
            <div class="behavior-item">
              <span class="label">功能偏好</span>
              <span class="value">{{ userProfile.behavior.featurePreference }}</span>
            </div>
            <div class="behavior-item">
              <span class="label">操作模式</span>
              <span class="value">{{ userProfile.behavior.operationPattern }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 风险特征 -->
      <div class="profile-card">
        <div class="card-header">
          <icon-safe class="card-icon" />
          <span class="card-title">风险特征</span>
        </div>
        <div class="card-content">
          <div class="risk-assessment">
            <div class="risk-item">
              <span class="label">信用等级</span>
              <a-tag :color="getCreditLevelColor(userProfile.risk.creditLevel)">
                {{ userProfile.risk.creditLevel }}
              </a-tag>
            </div>
            <div class="risk-item">
              <span class="label">风险类型</span>
              <a-tag :color="getRiskTypeColor(userProfile.risk.riskType)">
                {{ userProfile.risk.riskType }}
              </a-tag>
            </div>
            <div class="risk-item">
              <span class="label">还款能力</span>
              <span class="value">{{ userProfile.risk.repaymentCapacity }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 产品偏好 -->
      <div class="profile-card">
        <div class="card-header">
          <icon-apps class="card-icon" />
          <span class="card-title">产品偏好</span>
        </div>
        <div class="card-content">
          <div class="preference-items">
            <div class="preference-item">
              <span class="label">持有产品</span>
              <div class="product-tags">
                <a-tag 
                  v-for="type in userProfile.productPreference.holdingTypes" 
                  :key="type"
                  color="cyan"
                >
                  {{ type }}
                </a-tag>
              </div>
            </div>
            <div class="preference-item">
              <span class="label">价值贡献</span>
              <a-tag :color="getValueColor(userProfile.productPreference.valueContribution)">
                {{ userProfile.productPreference.valueContribution }}
              </a-tag>
            </div>
            <div class="preference-item">
              <span class="label">生命周期</span>
              <span class="value">{{ userProfile.productPreference.lifecycleStage }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
```

### 6.2 样式设计

```scss
.user-profile {
  .profile-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    
    h3 {
      margin: 0;
      color: #1d2129;
    }
  }
  
  .profile-content {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 16px;
  }
  
  .profile-card {
    background: #fff;
    border: 1px solid #e5e6eb;
    border-radius: 6px;
    padding: 16px;
    
    .card-header {
      display: flex;
      align-items: center;
      margin-bottom: 12px;
      
      .card-icon {
        margin-right: 8px;
        color: #165dff;
      }
      
      .card-title {
        font-weight: 500;
        color: #1d2129;
      }
    }
    
    .card-content {
      .profile-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      
      .behavior-items,
      .risk-assessment,
      .preference-items {
        .behavior-item,
        .risk-item,
        .preference-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          
          .label {
            color: #86909c;
            font-size: 12px;
          }
          
          .value {
            color: #1d2129;
            font-size: 12px;
          }
          
          .product-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 4px;
          }
        }
      }
    }
  }
}
```

## 7. 业务核心明细表格化展示方案

### 7.1 表格设计规范

**统一表格样式：**
- **表头样式**：灰色背景，加粗字体，居中对齐
- **行高**：40px，提供良好的可读性
- **边框**：细线边框，颜色#e5e6eb
- **斑马纹**：奇偶行不同背景色
- **悬停效果**：鼠标悬停时行背景色变化

**交互功能：**
- **排序**：支持按列排序
- **筛选**：支持快速筛选
- **复制**：支持单行或多行数据复制
- **导出**：支持表格数据导出
- **分页**：大数据量时支持分页

### 7.2 各表格具体实现

#### 7.2.1 授信列表表格

```vue
<!-- CreditList.vue -->
<template>
  <div class="credit-list">
    <div class="table-header">
      <div class="header-actions">
        <a-input-search 
          v-model="searchKeyword" 
          placeholder="搜索授信记录"
          style="width: 200px;"
          @search="handleSearch"
        />
        <a-button @click="exportData">
          <template #icon><icon-download /></template>
          导出
        </a-button>
      </div>
    </div>
    
    <a-table 
      :columns="creditColumns"
      :data="filteredCreditData"
      :pagination="pagination"
      :loading="loading"
      row-key="creditNo"
      @selection-change="handleSelectionChange"
    >
      <template #creditAmount="{ record }">
        <span class="amount-text">
          {{ formatAmount(record.currentAmount) }}
        </span>
      </template>
      
      <template #usageRate="{ record }">
        <a-progress 
          :percent="(record.usedAmount / record.currentAmount) * 100"
          :color="getUsageRateColor(record.usedAmount / record.currentAmount)"
          size="small"
        />
      </template>
      
      <template #riskLevel="{ record }">
        <a-tag :color="getRiskLevelColor(record.riskLevel)">
          {{ record.riskLevel }}
        </a-tag>
      </template>
      
      <template #actions="{ record }">
        <a-button type="text" size="small" @click="viewCreditDetail(record)">
          查看详情
        </a-button>
        <a-button type="text" size="small" @click="copyCreditData(record)">
          复制
        </a-button>
      </template>
    </a-table>
  </div>
</template>

<script setup>
const creditColumns = [
  {
    title: '授信编号',
    dataIndex: 'creditNo',
    width: 120,
    sortable: { sortDirections: ['ascend', 'descend'] }
  },
  {
    title: '授信日期',
    dataIndex: 'creditDate',
    width: 120,
    sortable: { sortDirections: ['ascend', 'descend'] }
  },
  {
    title: '产品名称',
    dataIndex: 'productName',
    width: 150
  },
  {
    title: '授信额度',
    slotName: 'creditAmount',
    width: 120,
    sortable: { sortDirections: ['ascend', 'descend'] }
  },
  {
    title: '已用额度',
    dataIndex: 'usedAmount',
    width: 120,
    render: ({ record }) => formatAmount(record.usedAmount)
  },
  {
    title: '使用率',
    slotName: 'usageRate',
    width: 120
  },
  {
    title: '利率',
    dataIndex: 'rate',
    width: 80,
    render: ({ record }) => `${record.rate}%`
  },
  {
    title: '期限',
    dataIndex: 'period',
    width: 80,
    render: ({ record }) => `${record.period}个月`
  },
  {
    title: '风险等级',
    slotName: 'riskLevel',
    width: 100
  },
  {
    title: '到期日期',
    dataIndex: 'expiryDate',
    width: 120
  },
  {
    title: '操作',
    slotName: 'actions',
    width: 120,
    fixed: 'right'
  }
];
</script>
```

#### 7.2.2 用信列表表格

```vue
<!-- LoanList.vue -->
<template>
  <div class="loan-list">
    <a-table 
      :columns="loanColumns"
      :data="loanData"
      :pagination="pagination"
      :loading="loading"
      row-key="loanNo"
    >
      <template #loanAmount="{ record }">
        <span class="amount-text">
          {{ formatAmount(record.amount) }}
        </span>
      </template>
      
      <template #repaymentProgress="{ record }">
        <div class="repayment-progress">
          <a-progress 
            :percent="(record.paidInstallments / record.installments) * 100"
            size="small"
          />
          <span class="progress-text">
            {{ record.paidInstallments }}/{{ record.installments }}期
          </span>
        </div>
      </template>
      
      <template #status="{ record }">
        <a-tag :color="getLoanStatusColor(record.status)">
          {{ record.status }}
        </a-tag>
      </template>
      
      <template #actions="{ record }">
        <a-button 
          type="text" 
          size="small" 
          @click="viewRepaymentDetail(record)"
        >
          还款记录
        </a-button>
        <a-button type="text" size="small" @click="copyLoanData(record)">
          复制
        </a-button>
      </template>
    </a-table>
    
    <!-- 还款记录弹窗 -->
    <a-modal 
      v-model:visible="repaymentModalVisible"
      title="还款记录详情"
      width="900px"
      :footer="false"
    >
      <RepaymentDetailTable 
        :repayment-data="selectedLoanRepayments"
        :loan-info="selectedLoan"
      />
    </a-modal>
  </div>
</template>

<script setup>
const loanColumns = [
  {
    title: '用信编号',
    dataIndex: 'loanNo',
    width: 120
  },
  {
    title: '用信日期',
    dataIndex: 'loanDate',
    width: 120
  },
  {
    title: '产品名称',
    dataIndex: 'productName',
    width: 150
  },
  {
    title: '用信金额',
    slotName: 'loanAmount',
    width: 120
  },
  {
    title: '剩余余额',
    dataIndex: 'balance',
    width: 120,
    render: ({ record }) => formatAmount(record.balance)
  },
  {
    title: '还款进度',
    slotName: 'repaymentProgress',
    width: 150
  },
  {
    title: '下期还款',
    dataIndex: 'nextPayment',
    width: 120,
    render: ({ record }) => formatAmount(record.nextPayment)
  },
  {
    title: '下期还款日',
    dataIndex: 'nextPaymentDate',
    width: 120
  },
  {
    title: '状态',
    slotName: 'status',
    width: 100
  },
  {
    title: '操作',
    slotName: 'actions',
    width: 150,
    fixed: 'right'
  }
];
</script>
```

#### 7.2.3 支付流程表格组件

```vue
<!-- PaymentProcess.vue -->
<template>
  <div class="payment-process">
    <!-- 签约记录 -->
    <div class="process-section">
      <div class="section-header">
        <h5>签约记录</h5>
      </div>
      <a-table 
        :columns="contractColumns"
        :data="paymentData.contractRecords"
        :pagination="false"
        size="small"
      >
        <template #contractStatus="{ record }">
          <a-tag :color="getContractStatusColor(record.contractStatus)">
            {{ record.contractStatus }}
          </a-tag>
        </template>
        
        <template #actions="{ record }">
          <a-button type="text" size="small" @click="viewContract(record)">
            查看合同
          </a-button>
        </template>
      </a-table>
    </div>
    
    <!-- 放款记录 -->
    <div class="process-section">
      <div class="section-header">
        <h5>放款记录</h5>
      </div>
      <a-table 
        :columns="disbursementColumns"
        :data="paymentData.disbursementRecords"
        :pagination="false"
        size="small"
      >
        <template #disbursementStatus="{ record }">
          <a-tag :color="getDisbursementStatusColor(record.disbursementStatus)">
            {{ record.disbursementStatus }}
          </a-tag>
        </template>
      </a-table>
    </div>
    
    <!-- 还款记录 -->
    <div class="process-section">
      <div class="section-header">
        <h5>还款记录</h5>
      </div>
      <a-table 
        :columns="repaymentColumns"
        :data="paymentData.repaymentRecords"
        :pagination="{ pageSize: 10 }"
        size="small"
      >
        <template #repaymentStatus="{ record }">
          <a-tag :color="getRepaymentStatusColor(record.repaymentStatus)">
            {{ record.repaymentStatus }}
          </a-tag>
        </template>
      </a-table>
    </div>
  </div>
</template>
```

## 8. 验收标准和测试策略

### 8.1 功能验收标准

#### 8.1.1 用户画像模块
- ✅ 正确展示人口统计特征标签
- ✅ 正确展示行为特征描述
- ✅ 正确展示风险特征评级
- ✅ 正确展示产品偏好信息
- ✅ 支持画像数据复制功能
- ✅ 响应式布局适配

#### 8.1.2 两级Tab架构
- ✅ 一级Tab正确显示用户所有产品
- ✅ 产品Tab显示产品状态和关键指标
- ✅ 二级Tab正确显示信息模块
- ✅ Tab切换动画流畅
- ✅ Tab状态记忆功能正常
- ✅ 支持产品横向滚动

#### 8.1.3 业务核心明细
- ✅ 授信列表表格正确展示
- ✅ 用信列表表格正确展示
- ✅ 调额记录表格正确展示
- ✅ 支付流程垂直陈列展示
- ✅ 用信记录支持查看还款明细
- ✅ 表格支持排序、筛选、复制功能

#### 8.1.4 数据完整性
- ✅ 887123客户数据完整
- ✅ 所有模块数据正确关联
- ✅ 数据格式化正确
- ✅ 错误处理机制完善

### 8.2 性能验收标准

- ✅ 页面首次加载时间 < 2秒
- ✅ Tab切换响应时间 < 200ms
- ✅ 表格数据渲染时间 < 500ms
- ✅ 内存使用稳定，无内存泄漏
- ✅ 支持1000+条数据的流畅展示

### 8.3 兼容性验收标准

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ 移动端适配（iPad、手机）

### 8.4 测试策略

#### 8.4.1 单元测试策略

**测试覆盖率目标：90%+**

```javascript
// 测试用例示例
describe('UserProfile Component', () => {
  beforeEach(() => {
    // 设置测试环境
  });
  
  test('should render user profile cards correctly', () => {
    // 测试画像卡片渲染
  });
  
  test('should handle profile data copy', () => {
    // 测试数据复制功能
  });
  
  test('should display correct risk level colors', () => {
    // 测试风险等级颜色显示
  });
});
```

#### 8.4.2 集成测试策略

**测试场景：**
1. 用户搜索 → 页面跳转 → 数据加载 → 组件渲染
2. 产品切换 → 数据更新 → 组件重新渲染
3. 信息模块切换 → 状态保持 → 数据正确展示
4. 还款记录查看 → 弹窗打开 → 数据正确加载

#### 8.4.3 端到端测试策略

```javascript
// E2E测试用例
describe('Customer360 E2E Tests', () => {
  test('complete user journey', async () => {
    // 1. 访问搜索页面
    await page.goto('/discovery/customer360');
    
    // 2. 搜索用户
    await page.fill('input[placeholder*="用户ID"]', '887123');
    await page.click('button[type="submit"]');
    
    // 3. 验证页面跳转
    await expect(page).toHaveURL('/discovery/customer360/887123');
    
    // 4. 验证用户画像显示
    await expect(page.locator('.user-profile')).toBeVisible();
    
    // 5. 测试产品切换
    await page.click('[data-testid="product-tab-LN-2024-002"]');
    
    // 6. 测试信息模块切换
    await page.click('[data-testid="business-details-tab"]');
    
    // 7. 测试还款记录查看
    await page.click('[data-testid="view-repayment-btn"]');
    await expect(page.locator('.repayment-modal')).toBeVisible();
  });
});
```

#### 8.4.4 性能测试策略

```javascript
// 性能测试
describe('Performance Tests', () => {
  test('page load performance', async () => {
    const startTime = Date.now();
    await page.goto('/discovery/customer360/887123');
    await page.waitForSelector('.customer-detail-container');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(2000); // 2秒内加载完成
  });
  
  test('tab switching performance', async () => {
    await page.goto('/discovery/customer360/887123');
    
    const startTime = Date.now();
    await page.click('[data-testid="business-details-tab"]');
    await page.waitForSelector('.business-core-details');
    const switchTime = Date.now() - startTime;
    
    expect(switchTime).toBeLessThan(200); // 200ms内完成切换
  });
});
```

### 8.5 测试数据准备

#### 8.5.1 测试用户数据

```javascript
// 测试数据集
const testUsers = {
  '887123': {
    // 完整数据用户
    name: '张三',
    hasAllModules: true,
    productCount: 2,
    creditRecords: 2,
    loanRecords: 1
  },
  '887124': {
    // 无产品用户
    name: '李四',
    hasAllModules: false,
    productCount: 0,
    creditRecords: 0,
    loanRecords: 0
  },
'887125': {
    // 多产品用户
    name: '王五',
    hasAllModules: true,
    productCount: 5,
    creditRecords: 3,
    loanRecords: 2
  }
};
```

#### 8.5.2 边界测试场景

```javascript
// 边界测试用例
const boundaryTestCases = [
  {
    scenario: '空数据处理',
    userId: '000000',
    expectedBehavior: '显示无数据状态'
  },
  {
    scenario: '大数据量处理',
    userId: '999999',
    dataSize: '1000+条记录',
    expectedBehavior: '分页展示，性能稳定'
  },
  {
    scenario: '网络异常处理',
    userId: '887123',
    networkCondition: '断网',
    expectedBehavior: '显示错误状态，支持重试'
  }
];
```

### 8.6 测试环境配置

#### 8.6.1 测试工具配置

```json
{
  "testFramework": "Jest + Vue Test Utils",
  "e2eFramework": "Playwright",
  "coverage": "Istanbul",
  "mockData": "MSW (Mock Service Worker)",
  "visualTesting": "Percy"
}
```

#### 8.6.2 CI/CD集成

```yaml
# .github/workflows/test.yml
name: Customer360 Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run unit tests
        run: npm run test:unit
      - name: Run integration tests
        run: npm run test:integration
      - name: Run E2E tests
        run: npm run test:e2e
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## 9. 实施时间表

### 9.1 总体时间安排

**项目周期：14个工作日**

| 阶段 | 时间 | 主要任务 | 交付物 |
|------|------|----------|--------|
| 阶段1 | 第1天 | Mock数据补齐 | 完整的887123客户数据 |
| 阶段2 | 第2-3天 | 用户画像模块开发 | UserProfile.vue组件 |
| 阶段3 | 第4-6天 | 两级Tab架构重构 | 产品切换器和信息模块Tab |
| 阶段4 | 第7-8天 | 业务核心明细重构 | 表格化展示组件 |
| 阶段5 | 第9-10天 | 支付流程模块开发 | PaymentProcess.vue组件 |
| 阶段6 | 第11天 | 营销记录模块开发 | MarketingRecords.vue组件 |
| 阶段7 | 第12-13天 | 历史查询页面开发 | 历史查询功能页面 |
| 阶段8 | 第14天 | 集成测试与优化 | 完整功能验收 |

### 9.2 里程碑检查点

- **第3天**：用户画像模块完成，通过单元测试
- **第6天**：两级Tab架构完成，通过集成测试
- **第8天**：业务核心明细重构完成
- **第10天**：支付流程模块完成
- **第13天**：所有功能开发完成
- **第14天**：项目验收通过

## 10. 风险评估与应对

### 10.1 技术风险

| 风险项 | 风险等级 | 影响 | 应对措施 |
|--------|----------|------|----------|
| 组件重构复杂度高 | 中 | 开发延期 | 分阶段重构，保持向后兼容 |
| 数据结构变更影响 | 低 | 数据展示异常 | 充分的数据验证和测试 |
| 性能优化挑战 | 中 | 用户体验下降 | 虚拟滚动、懒加载等优化 |
| 浏览器兼容性 | 低 | 部分功能异常 | 充分的兼容性测试 |

### 10.2 项目风险

| 风险项 | 风险等级 | 影响 | 应对措施 |
|--------|----------|------|----------|
| 需求变更 | 中 | 开发计划调整 | 敏捷开发，快速响应 |
| 测试时间不足 | 中 | 质量风险 | TDD开发，持续测试 |
| 人员配置不足 | 低 | 进度延期 | 合理分工，关键路径优先 |

## 11. 总结

本TDD实施计划文档详细分析了客户360页面的当前实现状态，明确了新需求与现有功能的差距，制定了完整的测试驱动开发计划。

**核心改进点：**
1. **用户画像模块**：新增定性描述为主的用户画像展示
2. **两级Tab架构**：实现产品级信息的层次化展示
3. **业务明细优化**：垂直陈列的表格化展示方式
4. **数据完整性**：补齐887123客户的完整mock数据

**技术保障：**
- 完整的TDD开发流程
- 90%+的测试覆盖率
- 全面的性能和兼容性测试
- 详细的验收标准

**项目成功关键因素：**
- 严格按照TDD流程执行
- 充分的测试用例设计
- 持续的代码质量监控
- 及时的风险识别和应对

通过本实施计划的执行，将确保客户360页面功能的高质量交付，提升用户体验和系统可维护性。