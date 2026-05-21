# Fintech Data Portal

**数据产品经理作品集 | 金融科技**

> 🎯 定位：企业级数据门户Demo，覆盖数据门户 + 营销套件 + 归因分析完整链路

[![Vue 3](https://img.shields.io/badge/Vue%203-✓-4FC08D?style=flat-square&logo=vue.js)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-✓-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Arco Design](https://img.shields.io/badge/Arco%20Design-✓-0079FF?style=flat-square)](https://arco.design/)

---

## 📦 核心模块

### 1. 数据门户
企业级数据资产可视化入口，提供数据架构图、节点管理、资产概览等功能。

| 功能 | 说明 |
|------|------|
| 架构图可视化 | 交互式数据架构图，支持拖拽和缩放 |
| 节点管理 | 数据节点增删改查 |
| 资产概览 | 数据资产分布与统计 |

### 2. 营销套件
完整的营销能力平台，支持权益管理、客群分群、营销编排、多渠道触达。

| 功能 | 说明 |
|------|------|
| 权益中心 | 优惠券、积分、卡券管理 |
| 客群管理 | RFM/CLV/Churn智能分群 |
| 营销画布 | 可视化流程编排 |
| 触达管理 | App Push / SMS 多渠道触达 |

### 3. 归因分析
多维度营销归因分析，量化渠道效果，优化预算分配。

| 模型 | 适用场景 |
|------|---------|
| First-click | 强调拉新，归因起点 |
| Last-click | 强调转化，归因终点 |
| Linear | 均衡权重，平均分配 |

### 4. 风控数据
外数生命周期管理与离线模型回溯。

| 功能 | 说明 |
|------|------|
| 外数生命周期 | 外部数据全流程管理 |
| 离线模型 | 模型回溯与验证 |

### 5. 数据管理
元数据管理与数据标准规范。

| 功能 | 说明 |
|------|------|
| 元数据管理 | 数据血缘追踪 |
| 数据标准 | 规范定义与管理 |
| 资产目录 | 数据资产清单 |

---

## 🏗️ 技术架构

```
┌─────────────────────────────────────────────────────────┐
│                      前端展示层                          │
├─────────────────────────────────────────────────────────┤
│  Vue 3 + TypeScript + Vite + Arco Design + X6 Graph    │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                      数据模拟层                          │
├─────────────────────────────────────────────────────────┤
│  Mock.js │ LocalStorage │ IndexedDB                    │
└─────────────────────────────────────────────────────────┘
```

---

## 🛠️ 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Vue 3 (Composition API) |
| 构建 | Vite |
| 语言 | TypeScript |
| UI组件 | Arco Design |
| 图表/图形 | X6 Graph |
| 状态管理 | Pinia |
| 路由 | Vue Router |

---

## 🚀 快速开始

```bash
# 克隆项目
git clone https://github.com/wenbo0527/fintech-data-portal.git
cd fintech-data-portal

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:3000
```

---

## 📂 目录结构

```
data_community/
├── apps/                    # 子应用模块
│   ├── mkt-app/            # 营销套件
│   ├── risk-app/           # 风控数据
│   ├── dex-app/            # 数据探索
│   ├── dmt-app/            # 数据管理
│   ├── admin-app/          # 系统管理
│   ├── touch/              # 营销画布
│   └── horizontal-canvas/  # 画布引擎
├── data_community/         # 主门户
│   └── src/                # 核心源码
├── src/                    # 主应用入口
├── public/                 # 静态资源
└── README.md
```

---

## 📊 核心功能演示

### 数据门户首页
![数据门户](public/screenshots/portal.png)

### 营销画布
![营销画布](public/screenshots/canvas.png)

### 客群分群
![客群分群](public/screenshots/audience.png)

---

## ⚠️ 声明

所有数据均为**合成/脱敏数据**，仅用于Portfolio展示，不涉及真实用户信息。

---

## 👤 作者

**wenbo**

数据产品经理 | 数据门户 | 营销套件 | 归因分析

- GitHub: [@wenbo0527](https://github.com/wenbo0527)
- Portfolio: [data-community-two.vercel.app](https://data-community-two.vercel.app)

---

*⭐ Stars and forks are welcome!*
