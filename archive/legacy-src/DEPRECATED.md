# DEPRECATED.md - src/ 主应用冻结声明（草稿）

> **状态**: ✅ 已执行归档（2026-09-08）→ `archive/legacy-src/`
> **决策时间**: 2026-08-10 09:24 GMT+8
> **决策方**: 文博拍板（PM 推荐方案 A，用户确认"按推荐走"）
> **派单**: TASK-PENDING（PM 派单 doc 接手）
> **执行 commit**: `chore(repo): P0-3 主应用冻结 - src/ → archive/legacy-src/`

---

## ⚠️ 主应用源码已停止维护

本目录（`src/`）下的主应用 Vue 3 源码已于 **2026-08-10** 起停止新功能开发。

---

## 📦 线上生产实际架构

线上部署已迁移到**微前端 Portal + iframe 沙箱**模式：

| 角色 | 实现 | 路径 |
|:--|:--|:--|
| 主入口 | `portal-shell`（1.5M，Vue 3 + Arco） | `/var/www/html/portal-shell/` |
| 子应用 | 12 个独立静态构建 | `/var/www/html/{risk,mkt,dex,dfd,dmt,admin,asset,canvas,call,community,touch,horizontal-canvas}/` |
| 加载方式 | iframe 嵌入（`https://118.196.79.130:8443/${key}/`） | — |

**重要**：线上 `main/` 目录不存在，生产环境从未部署过 `src/` 编译产物。

---

## 📂 src/ 现有角色

src/ 现仅承担以下职责：

1. **本地开发调试**（开发者本地 `npm run dev` 用）
2. **qiankun 微前端 shell 参考**（实际生产用 portal-shell 替代）
3. **历史兼容 fallback**（如果 portal-shell 出问题可临时回退）

---

## 🚫 新功能开发规约

**自 2026-08-10 起，所有新功能开发只能落在以下位置：**

| 类型 | 落地位置 | 派单渠道 |
|:--|:--|:--|
| 业务功能 | `apps/<子应用>/src/` | 派单 doc / dev |
| 主应用 shell | `portal-shell/` 工程（独立仓库，待 PM 调研） | 派蒙协调 |
| 业务修复 | `apps/<子应用>/src/` | 派单 doc / dev |
| src/ 修改 | ❌ 不允许，除非获得 C 级拍板 | 派蒙中转 + 文博拍板 |

---

## 🗂️ src/ 未来清理路径（待文博拍板）

以下模块在 src/pages/ 中已**无对应生产子应用**，需要决策处置方式：

| 模块 | 文件数 | 现状 | 建议 |
|:--|:--|:--|:--|
| `src/pages/discovery/` | 92 | ❌ 无子应用对应 | 评估保留/删除 |
| `src/pages/exploration/` | 61 | ❌ 无子应用对应 | 评估保留/删除 |
| `src/pages/management/` | 58 | ⚠️ 部分迁移 admin-app | 清理主应用副本 |
| `src/pages/offlineModel/` | 17 | ❌ 无子应用对应 | 评估保留/删除 |
| `src/pages/community/` | 6 | ⚠️ 有 community 子应用 | 合并 |
| `src/pages/data-analysis/` | 4 | ⚠️ 有 dfd-app | 清理 |
| `src/pages/digital-marketing/` | 1 | ❌ 无子应用对应 | 删除 |
| `src/pages/external-data-v1/` | 3 | ❌ V1 已废弃 | 删除 |
| `src/pages/login/` | 2 | ⚠️ 主应用 shell 职责 | 保留在主应用 |

**完整列表见 PM 工作区对照表（`memory/changelog/2026-08-10-deprecated-src-mapping.md`）**

---

## 📋 落地步骤

- [ ] **Step 1**: PM 起草本 DEPRECATED.md ✅（已完成）
- [ ] **Step 2**: PM 派单 doc 接手
  - doc 把本文件复制到 `/Users/wenbo/Documents/project/data_community/src/DEPRECATED.md`
  - doc 在 `package.json` 加 `"deprecated": "已迁移到 portal-shell + apps/* 子应用架构，详见 src/DEPRECATED.md"` 字段
  - doc 提交 commit: `chore(src): 添加 DEPRECATED.md 标记主应用停止维护`
  - doc 提 PR 走正常 review 流程
- [ ] **Step 3**: PM 跟踪 doc 完成情况
- [ ] **Step 4**: PM 通知派蒙（CC 备案）
- [ ] **Step 5**: PM 派单 doc 更新 ARCHITECTURE.md 反映新架构
- [ ] **Step 6**: PM 派单 qa 验证：portal-shell 主入口仍能正常加载所有子应用

---

## 📜 决策依据

本次冻结决策基于：

1. **PM 线上部署分析**（2026-08-10）：12 个子应用完整部署，src/ 完全未部署
2. **PM 拆分模式分析**：apps/* 与 src/* 是两套并行演进的应用，apps/* 已替代
3. **PM 拆分路径对照**：src/pages/* 17 个未迁移模块无明确所有者，已成技术债
4. **方案对比**：
   - 方案 A（冻结 src/）✅ PM 自治可立刻执行
   - 方案 B（剥离 src/）❌ C 级，文博拍板后由 arch 主导
5. **风险评估**：方案 A 不阻塞任何事，回滚成本 0

---

## 🔗 相关文档

- **PM 工作区分析**：
  - `memory/changelog/2026-08-10-main-app-vs-subapps.md`（拆分模式分析）
  - `memory/changelog/2026-08-10-main-vs-subapps-mapping.md`（主应用 vs 子应用对照表）
  - `memory/changelog/2026-08-10-production-deployment-analysis.md`（线上部署分析）
  - `memory/changelog/2026-08-10-freeze-vs-strip-comparison.md`（冻结 vs 剥离对比）
- **AGENTS.md**：v1.9.2 3 级授权（C 级决策流程）
- **MEMORY.md**：诚实度优先级 + v1.9.2 边界

---

*PM 📋 · 2026-08-10 09:24 GMT+8 · 方案 A 冻结 · 文博拍板 · 待派单 doc 落地*
