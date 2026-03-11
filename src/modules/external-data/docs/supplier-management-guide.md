# 供应商管理统一入口系统

## 概述

供应商管理统一入口系统实现了供应商信息的集中管理，作为整个平台的单一数据源。所有模块（包括结算系统）都通过统一的API接口引用供应商信息，确保数据的一致性和完整性。

## 系统架构

### 核心模块

1. **外数档案模块** (`/src/modules/external-data/`)
   - 供应商管理功能
   - 定价档案管理
   - 供应商变更通知机制

2. **结算系统模块** (`/src/modules/budget/`)
   - 供应商字典引用
   - 任务按供应商维度分拆
   - 供应商信息变更监听

### 数据流向

```
外数档案模块（供应商管理）
    ↓（统一API）
结算系统（供应商字典引用）
    ↓（只读引用）
各业务模块使用供应商信息
```

## 核心功能

### 1. 供应商统一管理

#### 数据结构
```typescript
interface Supplier {
  id: string                    // 供应商ID
  code: string                  // 供应商编码
  name: string                  // 供应商名称
  category: string              // 业务分类（LBS/MAP等）
  status: 'active' | 'inactive' // 状态
  contactInfo: ContactInfo      // 联系信息
  billingInfo: BillingInfo      // 结算信息
  description?: string          // 描述
  createdAt: string             // 创建时间
  updatedAt: string             // 更新时间
}
```

#### 管理功能
- 供应商基础信息管理（增删改查）
- 状态管理（启用/停用）
- 信用评级
- 标签管理
- 批量导入导出

### 2. 定价档案管理

#### 定价类型支持
- **固定价格**：按固定单价计费
- **阶梯定价**：按使用量阶梯计费
- **批量折扣**：按总量给予折扣
- **订阅模式**：周期性订阅计费

#### 定价结构
```typescript
interface SupplierPricing {
  id: string
  supplierId: string
  billingType: 'fixed' | 'tiered' | 'volume' | 'subscription'
  billingMode: 'prepaid' | 'postpaid'
  basePrice: number
  currency: string
  tiers?: PricingTier[]
  volumeDiscounts?: VolumeDiscount[]
  effectiveDate: string
  expiryDate?: string
}
```

### 3. 供应商字典API

#### 结算系统专用API
```typescript
// 获取所有可用供应商
getAvailableSuppliers(): Promise<Supplier[]>

// 根据ID获取供应商
getSupplierById(supplierId: string): Promise<Supplier | null>

// 根据编码获取供应商
getSupplierByCode(supplierCode: string): Promise<Supplier | null>

// 批量获取供应商
getSuppliersByIds(supplierIds: string[]): Promise<Supplier[]>

// 获取供应商结算配置
getSupplierSettlementConfig(supplierId: string): Promise<SettlementConfig | null>

// 检查供应商可用性
checkSupplierAvailability(supplierId: string): Promise<boolean>
```

#### 组合式函数
```typescript
const {
  suppliers,                    // 供应商列表
  supplierOptions,              // 选择器选项
  supplierMap,                  // ID映射
  loadSuppliers,                // 加载数据
  getSupplier,                  // 获取供应商
  validateSuppliers,            // 验证供应商
  extractSuppliersFromContracts // 从合同提取
} = useSettlementSupplier()
```

### 4. 变更通知机制

#### 事件类型
- `create`：供应商创建
- `update`：供应商信息更新
- `delete`：供应商删除
- `status_change`：状态变更

#### 监听器注册
```typescript
const listener = {
  id: 'settlement-system',
  name: '结算系统',
  callback: async (event: SupplierChangeEvent) => {
    // 处理供应商变更事件
  },
  filter: {
    eventTypes: ['status_change', 'update'],
    supplierIds: ['SUP-001', 'SUP-002']
  }
}

const unregister = supplierChangeNotifier.registerListener(listener)
```

## 使用指南

### 1. 在结算系统中使用供应商字典

```vue
<template>
  <a-select v-model="selectedSuppliers" multiple>
    <a-option 
      v-for="option in supplierOptions" 
      :key="option.value" 
      :value="option.value"
    >
      {{ option.label }}
    </a-option>
  </a-select>
</template>

<script setup>
import { useSettlementSupplier } from '@/modules/budget/composables/useSettlementSupplier'

const { 
  supplierOptions, 
  loadSuppliers,
  validateSuppliers 
} = useSettlementSupplier()

// 加载供应商数据
await loadSuppliers()

// 验证选择的供应商
const validation = await validateSuppliers(selectedSuppliers.value)
if (!validation.valid) {
  // 处理验证失败
}
</script>
```

### 2. 监听供应商变更

```typescript
import { settlementSystemListener, supplierChangeNotifier } from '@/modules/external-data/utils/supplierChangeNotifier'

// 注册监听器
const unregister = supplierChangeNotifier.registerListener(settlementSystemListener)

// 组件卸载时注销
onUnmounted(() => {
  unregister()
})
```

### 3. 触发供应商变更通知

```typescript
import { notifySupplierChange } from '@/modules/external-data/utils/supplierChangeNotifier'

// 更新供应商信息后发送通知
await notifySupplierChange('update', {
  id: supplier.id,
  code: supplier.code,
  name: supplier.name
}, {
  name: { oldValue: oldName, newValue: newName },
  status: { oldValue: oldStatus, newValue: newStatus }
})
```

## 数据一致性保证

### 1. 只读引用原则
- 结算系统只从外数档案模块读取供应商信息
- 不允许直接修改供应商数据
- 所有变更必须通过外数档案模块进行

### 2. 实时同步机制
- 供应商变更时立即通知相关系统
- 支持批量事件处理
- 提供事件重试机制

### 3. 缓存策略
- 供应商数据可本地缓存
- 变更通知触发缓存更新
- 支持手动刷新缓存

## 测试覆盖

### 单元测试
- 供应商字典API测试
- 组合式函数测试
- 变更通知机制测试

### 集成测试
- 完整供应商管理流程
- 结算系统集成测试
- 变更通知集成测试

### 端到端测试
- 供应商CRUD操作
- 结算任务创建流程
- 供应商变更影响验证

## 最佳实践

### 1. 供应商选择
- 始终使用标准供应商字典
- 验证供应商可用性
- 处理供应商状态变更

### 2. 错误处理
- 处理供应商不存在的情况
- 处理网络异常
- 提供友好的错误提示

### 3. 性能优化
- 批量获取供应商信息
- 合理使用缓存
- 避免重复API调用

## 扩展性

### 1. 新增业务分类
支持通过配置扩展供应商业务分类，无需修改代码。

### 2. 自定义字段
供应商数据结构支持扩展自定义字段，满足不同业务需求。

### 3. 多语言支持
供应商名称和描述支持多语言，便于国际化部署。

## 安全考虑

### 1. 数据权限
- 供应商信息按业务模块隔离
- 敏感信息（如银行账号）需要特殊权限
- 操作日志完整记录

### 2. 审计追踪
- 所有变更都有完整的审计记录
- 支持变更历史查询
- 提供操作统计报表

## 维护指南

### 1. 日常维护
- 定期检查供应商状态
- 更新过期定价信息
- 清理无效供应商数据

### 2. 问题排查
- 查看变更通知日志
- 验证数据一致性
- 检查API调用异常

### 3. 性能监控
- 监控API响应时间
- 跟踪缓存命中率
- 分析系统负载情况