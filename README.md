# Fintech Data Portal

> 企业级数据门户 Demo · 文博作品集

[![Vue](https://img.shields.io/badge/Vue-3-4FC08D)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6)]()
[![Vite](https://img.shields.io/badge/Vite-5-646CFF)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()

## 📌 这是什么

面向金融业务团队的**数据资产一体化门户**，覆盖**数据发现 → 数据管理 → 数据探索 → ChatBI 问数**完整闭环。

解决：
- 找数难：分散在多个系统，找一个指标要问 5 个人
- 口径乱：同一指标 5 个定义，"活跃用户"数据打架
- 用数门槛高：业务方自助分析能力弱，依赖数据团队取数
- 复用率低：同样指标被重复计算，资产浪费

## ✨ 核心能力

| 模块 | 能力 |
|:---|:---|
| **数据发现** | 语义搜索、标签推荐、血缘关系、使用排行 |
| **数据管理** | 元数据管理、指标统一、权限控制、质量监控 |
| **数据探索** | 统一查询、Jupyter Hub、智慧报表、ChatBI |
| **画布编排** | 营销策略画布（DAG）、预览线、AB 实验 |

## 🏗️ 技术栈

- **前端**：Vue 3 + TypeScript + Vite + Pinia + Arco Design
- **画布**：自研 DAG 编辑器（支持 30+ 策略并行）
- **后端**：Supabase（Postgres + Auth）
- **测试**：Vitest + Playwright
- **包管理**：pnpm workspace（monorepo）

## 📂 目录结构

```
fintech-data-portal/
├── apps/                      # 子应用（monorepo 入口）
├── packages/                  # 共享包
├── src/                       # 主应用源码
│   ├── api/                   # API 调用层
│   ├── assets/                # 静态资源
│   ├── components/            # 通用组件
│   ├── composables/           # 组合式函数
│   ├── views/                 # 页面级组件
│   └── router/                # 路由配置
├── scripts/                   # 工具脚本
├── tests/                     # 单元测试
├── vite-plugins/              # 自定义 Vite 插件
├── public/                    # 公共静态资源
├── docs/                      # 项目文档
├── .github/                   # GitHub Actions 配置
└── supabase/                  # 数据库迁移 + Edge Functions
```

## 🚀 快速开始

```bash
# 1. 克隆
git clone https://github.com/wenbo0527/fintech-data-portal.git

# 2. 安装依赖（pnpm workspace）
pnpm install

# 3. 启动开发服务
pnpm dev

# 4. 访问 http://localhost:5173
```

## 📊 量化成果

| 指标 | 数值 |
|:---|:---|
| 数据表统一管理 | 3000+ 张 |
| 指标统一口径 | 100+ 个 |
| 变量 / 特征 | 10000+ 个 |
| 同时运行策略 | 30+ 个 |
| 链路吞吐 | 百万级/小时 |
| 配置周期 | 周级 → 小时级 |

## 📝 相关文档

- [`docs/数据标准与元数据管理功能说明.md`](docs/数据标准与元数据管理功能说明.md)
- [`docs/详情页信息清单.md`](docs/详情页信息清单.md)

## 👤 作者

**文博** · AI+ 数据产品负责人
- GitHub: [@wenbo0527](https://github.com/wenbo0527)
- 知乎: [@wenbo-67-38](https://www.zhihu.com/people/wenbo-67-38)
- Email: wzhai0527@163.com

---

⭐ Star 本仓库如果对你的工作有帮助！