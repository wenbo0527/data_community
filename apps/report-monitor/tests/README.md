# report-monitor · 测试目录

> **状态**：📋 占位（P1-9 落地 · 2026-09-08）

按文档 §2.1.1 子应用统一目录结构预留。

## 用法

```bash
pnpm --filter report-monitor test:unit
pnpm --filter report-monitor test:e2e
```

## 说明

- 若子应用已有 co-located 测试（`src/**/__tests__/`），保留
- CI 中 ci.yml 会自动扫描本目录
