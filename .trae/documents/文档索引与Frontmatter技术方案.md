# 文档索引与 Frontmatter 技术方案

## 目的
- 为社区产品文档中心提供统一的文档索引（搜索/导航/推荐）与元数据规范
- 保证 Markdown 渲染安全、目录生成准确、深链与复制锚点可靠

## 索引文件（docs-index.json）
- 生成方式
  - 启动或构建时扫描 .trae/documents 下 *.md
  - 用 gray-matter 解析 Frontmatter，提取标题、标签、更新时间与分类
  - 用正则扫描 H2/H3，生成 headings 数组
- 文件结构
  - [{ 
      id: string, 
      slug: string, 
      title: string, 
      tags: string[], 
      category: string, 
      updatedAt: string, 
      headings: [{ id: string, text: string, level: 2|3 }] 
    }]
- 使用场景
  - 左侧导航树构建（分组与文档）
  - 全局搜索（标题/描述/heading/标签）
  - 相关推荐（按标签与相似度）

## Frontmatter 规范
- 字段约定
  - title: 文档标题（必填）
  - slug: 唯一标识（必填，路由友好）
  - tags: 标签数组（选填，推荐）
  - category: 操作指南|政策法规|通知|其他（必填）
  - updatedAt: YYYY-MM-DD（必填）
  - author: 作者（选填）
  - description: 文档摘要（选填）
- 示例
  ```
  ---
  title: 权限配置指引
  slug: guide-permission-config
  tags: [指南, 权限, 配置]
  category: 操作指南
  updatedAt: 2026-01-06
  author: 产品团队
  description: 如何在系统内进行权限角色配置与审批流设置
  ---
  ```

## Markdown 渲染安全
- 使用 DOMPurify 清洗 marked 输出 HTML，避免 XSS
- 外链 target=_blank + rel="noopener"
- 图片与资源路径白名单

## 目录与锚点
- 目录生成
  - 扫描 H2/H3 标题，生成 TOC；右侧 Anchor 固定定位
- 锚点规范
  - 标题转 slug（小写、空格转连字符、移除特殊字符）
  - URL hash 作为深链定位；提供“复制锚点链接”按钮

## 搜索策略
- 轻量：基于 docs-index.json 的前端匹配（标题/描述/heading/标签）
- 重型（可选）：lunr.js 构建全文索引，提升大规模文档检索体验

## 迁移与校验
- 在 PR 或构建时校验 Frontmatter 必填字段与 slug 唯一性
- 新增文档统一放入 .trae/documents；图示放入 .trae/documents/diagrams

