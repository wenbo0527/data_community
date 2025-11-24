# 横版画布统计信息查询功能技术架构文档

## 1. 架构设计

```mermaid
graph TD
    A[Vue 3 Frontend] --> B[Statistics Panel Component]
    A --> C[Canvas View Component]
    B --> D[Statistics API Service]
    C --> D
    D --> E[Supabase Backend]
    D --> F[Chart.js/ECharts]
    
    subgraph "Frontend Layer"
        B
        C
        F
    end
    
