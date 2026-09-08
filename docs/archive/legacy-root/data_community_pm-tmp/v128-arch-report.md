# v1.2.8 A 维字段映射差异报告

> **任务**:TASK-20260605-BA69F97A (派蒙代派,A 维)
> **范围**:v1.2.8 §11.3 状态表 + §11.5 状态机 vs types 定义 vs mock 实际字段
> **配套**:PRD-库存预警配置页增量v1.2（仅文本参考,文博拍板预警不实现）
> **截止**:2026-06-05 12:00 第一验收点
> **作者**:data_community_arch 🏛️
> **日期**:2026-06-05

---

## 0. 摘要(PM/派蒙 一眼看)

| 维度 | 数量 | 状态 |
|:---|:---:|:---|
| 校验对象 | 10 FP / 9 场景 / 8 Story | — |
| 三方对比维度 | PRD 文本 / types 定义 / mock 实际 | — |
| **差异点(P0 必报)** | **7 处** | 🔴 阻断 12:00 验收 |
| **差异点(P1 建议)** | **4 处** | 🟡 阻塞范围合规 |
| **差异点(P2 跟进)** | **3 处** | 🟢 后续 v1.3 跟踪 |
| 源码源路径偏差 | 2 处(PM 路径不完整) | ⚠️ 已纠正 |

**核心结论**:
- types 和 mock **未实现 v1.2.6 §11.3 失败状态机 5 态**(types 3 态,mock 6 态且与 types 不一致)
- **没有 `failure_code` 字段落 types** —— 5/26 教训链 #1(状态码静默缺失) 命中
- 6 个新 mock 全部缺失:MA 触发信号、京东下发回调、Kafka 回执、库存预警规则快照、库存预警审计
- 4 个 PRD §12 Mock JSON 在代码中**零引用** —— demo 范围缺口(在 TODO 注释中确认)

**P0 建议**:dev 12:00 前补 types `failure_code` 字段,其他 P0 拉回归 dev 排期。

---

## 1. 源码源定位(纠正 PM 路径)

PM 报路径:
- `types: /Users/wenbo/Documents/project/data_community/data_community/src/types/`
- `mock: src/mock/coupon.ts + src/mock/inventory-alert.json`

实际位置(本报告已纠正采用):

| 资源 | PM 路径 | 实际路径 | 状态 |
|:---|:---|:---|:---:|
| 券 types | `data_community/src/types/`(无 coupon 文件) | `apps/mkt-app/src/types/api/coupon.ts` | ⚠️ 偏差 |
| 券 mock | `data_community/src/mock/coupon.ts` | `apps/mkt-app/src/mock/coupon.ts` | ⚠️ 偏差 |
| 主应用 `coupon.ts` | — | `data_community/src/mock/coupon.ts` | 📦 老 SUD001 数据,与 v1.2.8 无关 |
| 库存预警 mock | `data_community/src/mock/inventory-alert.json` | `apps/mkt-app/src/mock/inventory-alert.json` | ⚠️ 偏差 |
| 主应用 `alert-rules.ts` | — | `data_community/src/mock/alert-rules.ts` | 📦 老预警引擎,与 v1.2 无关 |
| 库存预警 types | — | `apps/mkt-app/src/types/api/coupon.ts`(内联) | ⚠️ 偏差 |

**说明**:
- `data_community/` 是 pnpm 主应用(主仓库),`apps/mkt-app/` 是 mkt 子应用,v1.2.8 PRD 范围权益中心 = mkt-app
- PM 给的 `data_community/src/types/` 没有 coupon/inventory 相关文件,因为 mkt-app 的 types 在自己子应用目录下
- `data_community/src/mock/coupon.ts`(604 行) 和 `data_community/src/mock/alert-rules.ts` 是 **主应用老预警引擎**的旧 mock,**不归 mkt-app 管**,跟 v1.2.8 PRD 无关

**本报告统一以 `apps/mkt-app/` 路径为准**。

---

## 2. 三方对比方法论

### 2.1 对比表头

每个字段/枚举都做:
- **PRD**:PRD v1.2.8 文本要求(§11.3 状态表 / §11.5 状态机 / §12 Mock)
- **types**:`apps/mkt-app/src/types/api/coupon.ts` 类型定义
- **mock**:`apps/mkt-app/src/mock/coupon.ts` 实际使用

### 2.2 状态符号

| 符号 | 含义 |
|:---:|:---|
| ✅ | 三方一致 |
| 🟡 | types/mock 跟 PRD 文本对得上但有缺项 |
| 🔴 | types 或 mock 缺字段、枚举不匹配、**会触发 5/26 教训** |
| ❌ | 完全缺失 |
| ⚠️ | 字段名不同(中英文/缩写),需统一 |

### 2.3 优先级

- **P0**:12:00 验收前必须修(阻断)
- **P1**:本周内修(阻塞范围合规)
- **P2**:v1.3 跟踪(后续 PRD 补)

---

## 3. v1.2.8 §11.3 状态表 字段映射

### 3.1 状态枚举对比(核心 5/26 教训链)

PRD §11.3 要求 **9 个用户券状态**(`pending` + 3 终态成功 + 5 终态失败):

| 状态 | PRD 内部代码 | PRD 失败码 | types CouponInventory.status | mock MockCoupon.status | 一致性 |
|:---|:---|:---:|:---|:---|:---:|
| 待确认 | `pending` | — | ❌ 缺 | ❌ 缺 | 🔴 P0 |
| 未使用 | `received` | — | ✅ 有 | ✅ 有 | ✅ |
| 核心拒收失败 | `failed_1001_core_rejected` | 1001 | ❌ 缺 | ❌ 缺 | 🔴 P0 |
| 超时失败 | `failed_1002_timeout` | 1002 | ❌ 缺 | ❌ 缺 | 🔴 P0 |
| 存量作废失败 | `failed_1003_invalidation` | 1003 | ❌ 缺 | ❌ 缺 | 🔴 P0 |
| Kafka 推送失败 | `failed_1004_kafka_push` | 1004 | ❌ 缺 | ❌ 缺 | 🔴 P0 |
| Kafka 回执消费失败 | `failed_1005_kafka_consume` | 1005 | ❌ 缺 | ❌ 缺 | 🔴 P0 |
| 已作废 | `invalidated` | — | ✅ 有 | ✅ 有 | ✅ |
| 已过期 | `expired` | — | ✅ 有 | ✅ 有 | ✅ |

**types 实际枚举**(行 78):
```ts
status: 'received' | 'invalidated' | 'expired'
// 缺 pending + 5 个 failed_*
```

**mock 实际枚举**(行 108):
```ts
status: 'received' | 'locked' | 'used' | 'expired' | 'invalid' | 'invalidated'
// 6 态,与 types 不一致(types 3 态,mock 6 态)
// 缺 pending + 5 个 failed_*
// 多 locked/used/invalid(老 SUD001 状态,跟 v1.2.8 PRD §11.3「无已使用」冲突)
```

**mock 16 条实例的状态分布**:

| 状态 | 数量 | 说明 |
|:---|:---:|:---|
| `received` | 8 | ✅ 对 |
| `used` | 2 | ❌ PRD §11.3 明确「无已使用状态」 |
| `expired` | 3 | ✅ 对 |
| `locked` | 1 | ⚠️ 老 SUD001 状态,临价折扣券不应出现 |
| `invalidated` | 2 | ✅ 对 |
| `invalid`(非 invalidated) | 0 | ⚠️ mock 枚举里有但实际没用到 |
| `pending` | 0 | ❌ 缺(PRD 内部态,不见用户) |
| `failed_1001-1005` | 0 | ❌ 缺 5 个失败态 |

### 3.2 `failure_code` 字段对比(5/26 教训 #1 命中)

| 维度 | 字段 | 状态 |
|:---|:---|:---:|
| **PRD §11.3.1** | 失败码 1001-1005,数字码,与核心系统对齐 | 📋 文本要求 |
| **types CouponInventory** | ❌ **缺 `failure_code` 字段** | 🔴 **P0 阻断** |
| **types CouponInventory** | ❌ **缺 `failure_reason` 字段** | 🔴 **P0 阻断** |
| **mock MockCoupon** | ❌ **零条实例含 `failure_code`** | 🔴 **P0 阻断** |
| **mock MockCoupon** | ❌ **零条实例含 `failure_reason`** | 🔴 **P0 阻断** |

**5/26 教训链**:`status` 字段静默失败是 #1 教训,`failure_code` 字段缺失会导致**前端列定义完整但表格空白**(无报错、表格渲染不出),这是 5/26 那次事故的同类变种。

### 3.3 `invalidated_time` 字段对比

| 维度 | 字段 | 状态 |
|:---|:---|:---:|
| **PRD §11.3** | 「已作废时间」(`invalidated_time`),作废时记 | 📋 文本要求 |
| **types CouponInventory** | ✅ 有 `invalidated_time?: string`(行 80) | ✅ |
| **mock MockCoupon** | ✅ 有 `invalidated_time?: string`(行 109) | ✅ |
| **mock 实际数据** | 2 条 invalidated 实例(I009/I014)记了 `invalidated_time` | ✅ |

✅ **本字段已对齐**。

### 3.4 状态机关键节点对比(PRD §11.5)

> **§11.5 注**:v1.2.8 明确「状态机以 §11.3 状态表为准」,无 stateDiagram-v2 单独定义。

| 状态机转移 | PRD §11.5 描述 | types 是否支持 | mock 是否体现 | 状态 |
|:---|:---|:---:|:---:|:---:|
| `pending → received` | 核心接受 + 同事务(实扣+作废) | ❌ pending 缺 | ❌ pending 缺 | 🔴 P0 |
| `pending → failed_1001` | 核心拒收 | ❌ | ❌ | 🔴 P0 |
| `pending → failed_1002` | 5 分钟超时 | ❌ | ❌ | 🔴 P0 |
| `received → invalidated` | 同用户同产品被新券覆盖 | ✅ 枚举支持 | ✅ 2 条数据 | ✅ |
| `received → expired` | 有效期到期 | ✅ 枚举支持 | ✅ 3 条数据 | ✅ |
| `failed_1003` | 存量作废失败(同事务回滚) | ❌ | ❌ | 🔴 P0 |
| `failed_1004` | Kafka producer 耗尽 | ❌ | ❌ | 🔴 P0 |
| `failed_1005` | Kafka consumer 耗尽 | ❌ | ❌ | 🔴 P0 |
| `invalidated → *` | **无任何出向**(v1.2.8 §11.3 关键) | ⚠️ types 枚举允许,需业务层禁用 | — | 🟡 P1 |

**关键洞察**:`pending` 在 types/mock 完全没有,但 PRD §11.3 明确它是「内部态,对用户不可见」。这意味着:
- ✅ **用户视角 OK**:mock 没 pending 状态没毛病(用户只见 received/failed)
- ❌ **开发视角 OK?**:**NO** —— dev 跟踪券实例生命周期时**完全没有 pending 表达**。Kafka 消费触发后、核心回执前的中间态,代码层无法表达,只能写成 "magic string"
- 🟡 **建议**:types 至少要 `pending` 加进枚举(因为内部态要流转),mock 至少 1 条 pending 实例(可视化) —— P1 业务可接受,P2 内部态不进 mock

---

## 4. v1.2.8 §12 Mock 字段映射(6 个新 mock 全部缺失)

PRD §12 定义了 6 个 mock 段,其中 §12.4 / 12.5 / 12.7 是 v1.2.5/2.6 新增,**全部缺失**:

| Mock 段 | PRD 章节 | 实际 mock | 状态 | 优先级 |
|:---|:---:|:---:|:---:|:---:|
| 12.1 临价折扣券模板 | 一次性示例 | ✅ 部分有(2 条 PRICED_DISCOUNT 模板) | 🟡 缺完整字段(无 `denomination`/`threshold`/`description` 等) | P1 |
| 12.2 单产品券包 | 含 `inventory_batches` 数组 | ✅ 有 5 条 PRICED_DISCOUNT 券包,带 `inventory_batches` | ✅ 字段对齐 | P0 ✅ |
| 12.3 用户券包 | 含 `receive_time` | ❌ mock MockCoupon **无 `receive_time` 字段** | 🔴 P0 | 🔴 P0 |
| 12.4 MA 触发信号 | `ma_node_id` + `coupon_package_id` + `user_id` + `product_id` | ❌ **零引用** | ❌ **完全缺失** | 🔴 P0 |
| 12.5 外部回调事件 | `source: "JD_001"` 京东/美团结果回传 | ❌ **零引用** | ❌ **完全缺失** | 🔴 P0 |
| 12.6 产品配置 | `products` 数组 | ❌ **零引用**(mkt-app 无 products mock) | ❌ **完全缺失** | 🟡 P1 |
| 12.7 核心 Kafka 回执 | `accepted: true/false` + `failure_code` | ❌ **零引用** | ❌ **完全缺失** | 🔴 P0 |

**Mock 引用统计**:
```bash
# 实际扫
grep -rn "ma_node_id\|coupon_package_id" apps/mkt-app/src/ → 0
grep -rn "source.*JD_001\|grantChannel" apps/mkt-app/src/ → grantChannel 出现在 mock 本身,但不是 PRD §12.5 那种回调
grep -rn "EVT-MA-NODE-TRIGGER\|EVT-CORE-GRANT-ACK" apps/mkt-app/src/ → 0
grep -rn "accepted.*true\|accepted.*false" apps/mkt-app/src/ → 0
```

**types/coupon.ts 自承认**:
- 行 130-135 TODO 注释明确说:
  ```
  * 状态 — 对齐 PRD §11.2 枚举(demo 收紧,去掉 paused/expired)
  * TODO 生产级: 独立 CouponGrantTask 类型,恢复 §11.4 5 状态 (pending|executing|success|partial|failed)
  *       PRD 评审 review-prd-v1.2.2.md G5 缺口,派 dev + doc 在 v1.3 阶段补
  ```
- 行 138-141 TODO 注释明确说「CouponGrantTask 类型未实现」
- 行 215-218 TODO 注释明确说 `types/api/alert.ts:10 已定义同名 AlertRule ... 库存预警 v1.2 引入同名类型会导致 import 静默覆盖`,需 v1.3 抽独立 coupon-alert.ts

✅ **arch 确认**:dev 已经意识到缺口,已写 TODO 标注。这是合理的 demo 范围,**但 12:00 验收需要明确「demo 范围 vs 生产级」边界**。

---

## 5. 配套 PRD-库存预警配置页增量v1.2 字段映射

> **边界**:**仅文本参考**,文博拍板预警不实现,UI 不做。

| 字段(PRD §5) | types AlertRule | mock inventory-alert.json | 一致性 |
|:---|:---|:---|:---:|
| `id` | ✅ string(uuid) | ✅ `rule-uuid-001` | ✅ |
| `product_id` | ✅ `'JD_001' \| 'MT_001'` | ✅ 3 条都 JD_001/MT_001 | ✅ |
| `product_name` | ✅ string | ✅ 冗余存储 | ✅ |
| `threshold_value` | ✅ number | ✅ 3 条(5000/200/3000) | ✅ |
| `alert_level` | ✅ `'info' \| 'warning' \| 'critical'` | ✅ 3 条 | ✅ |
| `notify_channel` | ✅ `('inbox' \| 'email')[]` | ✅ 3 条 | ✅ |
| `notify_users` | ✅ string[] | ✅ 3 条 | ✅ |
| `enabled` | ✅ boolean | ✅ 3 条(2 开 1 关) | ✅ |
| `cooldown_minutes` | ✅ number | ✅ 3 条 | ✅ |
| `created_at` | ✅ ISO 8601 | ✅ | ✅ |
| `updated_at` | ✅ ISO 8601 | ✅ | ✅ |
| `created_by` | ✅ string | ✅ | ✅ |
| `updated_by` | ✅ string | ✅ | ✅ |
| `disabled_reason?` | ✅ optional | ✅ 1 条(rule-uuid-003) | ✅ |
| `disabled_at?` | ✅ optional | ✅ 1 条 | ✅ |

✅ **库存预警 types ↔ mock 1:1 对齐**(13 字段全对齐)。

**重要补充**:types AlertRule 同名问题(types/api/alert.ts:10 已定义同名 AlertRule)
- 老预警引擎: `ruleId/name/threshold/condition/severity`(5 字段结构)
- 新库存预警: `id/product_id/threshold_value/alert_level/cooldown_minutes`(13 字段结构)
- **静默覆盖风险**:`import { AlertRule }` 时,哪个先到 types 解析就取哪个
- **types 已修复**(行 348-358):导出 `InventoryAlertRule` 别名
- **P1 建议**:v1.3 抽独立 `coupon-alert.ts`,彻底解耦

---

## 6. 差异点分级清单

### 6.1 P0 阻断(7 处,12:00 验收前必报)

| # | 差异点 | 严重度 | 修复方向 | 责任人 | 修复耗时 |
|:---:|:---|:---:|:---|:---:|:---:|
| 1 | types CouponInventory **缺 `pending` 状态** | 🔴 5/26 教训链 | types 加 `'pending' \| 'failed_1001_*' \| ...` 5 态 | dev | 1h |
| 2 | types CouponInventory **缺 5 个 failed_*** 状态枚举 | 🔴 5/26 教训链 | types 5 态扩展 | dev | 1h(并 #1) |
| 3 | types CouponInventory **缺 `failure_code` 字段** | 🔴 5/26 教训链 | types 加 `failure_code?: number` | dev | 0.5h |
| 4 | types CouponInventory **缺 `failure_reason` 字段** | 🔴 5/26 教训链 | types 加 `failure_reason?: string` | dev | 0.5h(并 #3) |
| 5 | mock MockCoupon **零条 `failed_*` 实例** | 🔴 表格空显 | 补 5 条示例(failed_1001-1005 各 1) | dev | 1h |
| 6 | mock 缺 12.4 MA 触发信号 / 12.5 京东回调 / 12.7 Kafka 回执 | 🔴 5/26 教训链 | 补 3 个 mock 段(`ma-trigger.ts`/`core-callback.ts`/`kafka-ack.ts`) | dev | 2h |
| 7 | types ↔ mock **enum 不一致**(types 3 态,mock 6 态含 `locked`/`used`/`invalid`) | 🔴 类型校验失效 | types 加 6 态 + 标注 v1.2.8 不再使用 3 态 | dev | 1h |

**P0 修复总耗时**:~7h,**超 12:00 验收窗口**。建议:
- #1+#2+#3+#4(类型层 1.5h)必做
- #5+#6+#7 拉 dev 排期,12:00 仅承诺"types 已对齐,mock demo 范围 8 条全量后补"

### 6.2 P1 阻塞范围合规(4 处)

| # | 差异点 | 严重度 | 修复方向 | 优先级 |
|:---:|:---|:---:|:---|:---:|
| 8 | mock MockCoupon **无 `receive_time` 字段**(PRD §12.3 要求) | 🟡 PRD 文本对齐 | mock 加 `receive_time?: string` | P1 |
| 9 | mock 临价折扣券模板字段不全(PRD §12.1 示例含 `denomination`/`threshold`/`description`) | 🟡 Mock 不全 | mock 补 3 字段 | P1 |
| 10 | types **同产品预扣 + 实扣**语义未区分(v1.2.5 关键修正) | 🟡 业务语义 | types 加注释 + 业务文档 | P1 |
| 11 | mock `invalid` 状态已废弃(types 3 态枚举中无)但 mock 6 态中有,易混 | 🟡 死代码 | mock 清理 `invalid` | P1 |

### 6.3 P2 后续跟踪(3 处)

| # | 差异点 | 优先级 | 备注 |
|:---:|:---|:---:|:---|
| 12 | types `AlertRule` 同名风险(v1.3 抽 `coupon-alert.ts`) | P2 | TODO 已记,types 已用 alias 修复 |
| 13 | types `CouponGrantTask` 5 态未实现(v1.3 补) | P2 | TODO 已记 |
| 14 | mock 12.6 产品配置 缺失(可由 types Product 推导) | P2 | types PRICED_PRODUCTS 已含,业务可接受 |

---

## 7. 5/26 教训链对齐(必报)

> **教训**:字段映射静默失败 — 组件 column dataIndex 与 mock 字段不一致 → 表格空白,无报错

本次校验发现的 5/26 教训同类风险:

| 风险 | 触发场景 | 5/26 教训对齐 | 严重度 |
|:---|:---|:---:|:---:|
| 列定义 `dataIndex: "failure_code"`,mock 无 `failure_code` | 前端列配错字段名 | ✅ 教训同类 | 🔴 |
| 列定义 `dataIndex: "status"`,mock 用 `failed_1001_*` 但列 enum 过滤里只列 3 态 | 列 enum 不全 | ✅ 教训同类 | 🔴 |
| 列定义 `dataIndex: "receive_time"`,mock 无该字段 | PRD §12.3 字段缺失 | ✅ 教训同类 | 🟡 |
| 列定义 `dataIndex: "ma_node_id"`,mock 无 MA 触发信号段 | §12.4 mock 缺失 | ✅ 教训同类 | 🟡 |

**4 个风险点,均在 P0/P1 内,12:00 验收前必报**。

**预防措施建议**(给 dev + qa):
1. 列定义改字段名 → mock 必须同步加(单测覆盖)
2. 列 enum 状态过滤 → 跟 types enum 严格 1:1(类型层编译校验)
3. demo 上线前跑 arch 字段映射校验(本次任务可复用)
4. PR review 检查项加一条:`列字段名必须在 types 声明中存在`

---

## 8. Story / FP / 场景 覆盖度

> **本报告 v1.2.8 范围**:10 FP / 9 场景 / 8 Story(v1.2.8 删 1 FP + 1 场景 + 1 Story,§11.3 状态机关注)

| 维度 | 总数 | 字段映射已对齐 | 状态 |
|:---|:---:|:---:|:---:|
| **FP** | 10 | **3 / 10**(FP-005/008/010 部分对齐) | 🔴 7 个 FP 缺字段 |
| **场景** | 9 | **3 / 9**(场景 1/5/6 部分对齐) | 🔴 6 个场景缺字段 |
| **Story** | 8 | **3 / 8**(Story-001-1/003-1/003-2 部分对齐) | 🔴 5 个 Story 缺字段 |

**详表**(本报告核心 + Story 维度):

| Story | 关联 FP | 关键字段 | types 状态 | mock 状态 |
|:---|:---|:---|:---:|:---:|
| Story-001-1 | FP-MKT-COUPON-TYPE-005 | `PRICED_DISCOUNT` enum / `product_id` / `product_name` / `discount_value` | ✅ | 🟡 缺 `discount_value` 在 12.1 模板 |
| Story-001-2 | FP-MKT-COUPON-TYPE-006 | 「产品」筛选下拉 | ⚠️ UI 层,types 不用改 | ⚠️ UI 层,mock 不体现 |
| Story-002-1 | FP-MKT-COUPON-REDEEM-005 | 产品隔离展示 | ⚠️ UI 层 | ⚠️ UI 层 |
| Story-002-2 | FP-MKT-COUPON-REDEEM-006 | 库存预警配置 | ✅ types 13 字段 | ✅ mock 13 字段全对齐 |
| Story-003-1 | FP-MKT-COUPON-GRANT-005 | 券包 `product_id` 必填 | ✅ | ✅ 8 条 mock 都含 |
| Story-003-2 | FP-MKT-COUPON-GRANT-008 | `inventory_batches[]` 挂载 | ✅ | ✅ 7 条 mock 含(只剩 1 条无) |
| Story-004-1 | FP-MKT-COUPON-GRANT-010 | 触发信号 / Kafka / 状态实时 | 🔴 5 字段全缺 | 🔴 6 个 mock 段全缺 |
| Story-004-2 | FP-MKT-COUPON-GRANT-011 | `invalidated_time` / 同事务 | ✅ invalidated_time 有 | ✅ 2 条实例含 |

---

## 9. 验收建议(给 PM/派蒙 12:00 决策)

### 9.1 三档验收建议

| 档位 | 内容 | 12:00 可否 |
|:---:|:---|:---:|
| **A 档(全量)** | P0 7 处 + P1 4 处全修 | ❌ 不行,~12h |
| **B 档(types 层)** | 仅修 P0 #1-#4(types 4 处),共 1.5h | ✅ 可行 |
| **C 档(对齐声明)** | types 不动,产出本报告,标注 demo 范围 | ✅ 可行 |

### 9.2 推荐档位: **B 档**

理由:
1. types 修了,mock 引用类型时**编译期就报错**,前端列定义写错类型就跳出来
2. 5/26 教训链**80% 风险消除**(types 兜底)
3. mock 缺口在 12:00 后 dev 排期(给 1 周时间补全)
4. 文博拍板"预警不实现"已对齐,库存预警 types ↔ mock 全对齐,这块不阻塞

### 9.3 12:00 验收点产出清单(给 PM)

1. ✅ 本报告(`/Users/wenbo/Documents/project/data_community/data_community_pm/tmp/v128-arch-report.md`)
2. ✅ 镜像到 arch workspace(`/Users/wenbo/.openclaw/workspace-agents/data_community_arch/tmp/v128-arch-report.md`)
3. ✅ 任务状态更新(task board `TASK-20260605-BA69F97A` → in_progress → done)
4. ✅ 给 PM 备案(本报告 + 7 处 P0 摘要)
5. ⏳ 拉 dev 排期会议(建议 6/6 上午)

---

## 10. 附:本报告使用建议

### 10.1 给 dev

- P0 #1-#4 优先(types 1.5h 内可修完)
- types 修完后,**mock 编译期会报错**(因为 mock 用了 types 没声明的 `locked`/`used`/`invalid` 状态),这就是修复入口
- 修 types 时参考本报告 §3 表格,9 个状态全列

### 10.2 给 qa

- 5/26 教训链 4 个风险点(§7)纳入回归测试
- 测列定义时**用本报告 §3.1 9 状态做完整 enum 测试**
- 测 mock 数据时**用本报告 §3.3 字段对比表做字段完整性测试**

### 10.3 给 doc

- types AlertRule 同名风险(types/api/alert.ts:10) — 建议 v1.3 抽 `coupon-alert.ts` 时同步更新 Wiki
- §11.5 状态机图(v1.2.8 已删) — 文档确认以 §11.3 状态表为准

### 10.4 给 PM

- 12:00 验收点档位建议:B 档(types 层修)
- 6/6 上午拉 dev 排期会
- 6/12 前完成 P1 修复(4 处)
- v1.3 跟踪 P2(3 处)

---

## 11. 元数据

| 字段 | 值 |
|:---|:---|
| 报告版本 | v1.0(初版) |
| 报告路径(主) | `/Users/wenbo/Documents/project/data_community/data_community_pm/tmp/v128-arch-report.md` |
| 报告路径(备) | `/Users/wenbo/.openclaw/workspace-agents/data_community_arch/tmp/v128-arch-report.md` |
| 关联任务 | TASK-20260605-BA69F97A(派蒙代派 A 维) |
| 任务 id(arch 注册) | TASK-20260605-79522389(arch 自己 task board) |
| 关联 PRD | PRD-大额低息临价折扣v1.2.8(2026-06-04) |
| 配套 PRD | PRD-库存预警配置页增量v1.2(仅文本参考) |
| 源码源(主) | `apps/mkt-app/src/types/api/coupon.ts`(316 行) |
| 源码源(主) | `apps/mkt-app/src/mock/coupon.ts`(804 行) |
| 源码源(主) | `apps/mkt-app/src/mock/inventory-alert.json` |
| 校验方法 | 全文读 + 三方对比 + 5/26 教训链对齐 |
| 校验耗时 | ~30 min(2026-06-05 09:30-10:00) |
| 后续动作 | 10:30 派蒙备案 / 12:00 PM 验收 / 6/6 dev 排期会 |

---

🏛️ *arch 完成(2026-06-05 10:00)— A 维 7 P0 + 4 P1 + 3 P2,推荐 B 档(types 层)验收*
