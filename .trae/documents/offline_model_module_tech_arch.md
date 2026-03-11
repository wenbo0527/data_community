# 数字风险平台离线模型模块技术架构文档

## 1. 架构设计

### 1.1 整体架构

```mermaid
graph TD
    A[User Browser] --> B[Vue 3 Frontend]
    B --> C[API Gateway]
    C --> D[Backend Services]
    D --> E[Supabase Database]
    D --> F[Redis Cache]
    D --> G[File Storage]
    D --> H[ML Pipeline]

    subgraph "Frontend Layer"
        B
    end

    subgraph "Backend Services"
        D
        H
    end

    subgraph "Data Layer"
        E
        F
        G
    end

    subgraph "ML Infrastructure"
        H --> I[Feature Engineering]
        H --> J[Model Training]
        H --> K[Model Evaluation]
    end
```

### 1.2 微服务架构

```mermaid
graph TD
    A[API Gateway] --> B[Feature Service]
    A --> C[Model Registry Service]
    A --> D[Task Management Service]
    A --> E[Evaluation Service]
    A --> F[Metadata Service]

    B --> G[Feature Store]
    C --> H[Model Storage]
    D --> I[Task Queue]
    E --> J[Metrics Store]
    F --> K[Metadata DB]

    subgraph "Core Services"
        B
        C
        D
        E
        F
    end

    subgraph "Data Stores"
        G
        H
        I
        J
        K
    end
```

## 2. 技术描述

### 2.1 核心技术栈

- **前端框架**: Vue 3 + TypeScript + Vite
- **UI组件库**: Arco Design Vue
- **状态管理**: Vuex 4
- **图表库**: ECharts + AntV G2
- **构建工具**: Vite
- **后端服务**: Node.js + Express + TypeScript
- **数据库**: Supabase (PostgreSQL)
- **缓存**: Redis
- **文件存储**: Supabase Storage
- **机器学习**: Python + scikit-learn + pandas + numpy
- **任务队列**: Bull Queue (Redis-based)
- **容器化**: Docker + Docker Compose

### 2.2 初始化工具

- **前端项目**: `npm create vite@latest offline-model-module --template vue-ts`
- **后端服务**: `npm init -y` + TypeScript配置

## 3. 路由定义

### 3.1 前端路由

| 路由路径 | 页面组件 | 功能描述 |
|----------|----------|----------|
| / | Dashboard | 系统总览首页 |
| /features | FeatureCenter | 特征中心主页面 |
| /features/detail/:id | FeatureDetail | 特征详情页面 |
| /models | ModelRegistry | 模型注册主页面 |
| /models/detail/:id | ModelDetail | 模型详情页面 |
| /models/versions/:id | ModelVersions | 模型版本管理页面 |
| /traceability | ModelTraceability | 模型回溯主页面 |
| /tasks | TaskManagement | 任务管理主页面 |
| /tasks/create | CreateTask | 创建任务页面 |
| /evaluation | ModelEvaluation | 模型评估主页面 |
| /evaluation/report/:id | EvaluationReport | 评估报告页面 |
| /settings | Settings | 系统设置页面 |

### 3.2 API路由

| API端点 | 请求方法 | 功能描述 |
|----------|----------|----------|
| /api/features | GET | 获取特征列表 |
| /api/features | POST | 创建新特征 |
| /api/features/:id | GET | 获取特征详情 |
| /api/features/:id | PUT | 更新特征信息 |
| /api/models | GET | 获取模型列表 |
| /api/models | POST | 注册新模型 |
| /api/models/:id | GET | 获取模型详情 |
| /api/models/:id/versions | GET | 获取模型版本 |
| /api/models/upload | POST | 上传模型文件 |
| /api/tasks | GET | 获取任务列表 |
| /api/tasks | POST | 创建新任务 |
| /api/tasks/:id/status | GET | 获取任务状态 |
| /api/evaluation | POST | 提交评估任务 |
| /api/evaluation/:id | GET | 获取评估结果 |

## 4. API定义

### 4.1 核心数据类型

```typescript
// 特征定义
interface Feature {
  id: string;
  name: string;
  displayName: string;
  description: string;
  type: 'numerical' | 'categorical' | 'text' | 'datetime';
  dataType: string;
  shape: number[];
  version: string;
  tags: string[];
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// 模型定义
interface Model {
  id: string;
  name: string;
  version: string;
  type: 'classification' | 'regression' | 'clustering';
  algorithm: string;
  description: string;
  parameters: Record<string, any>;
  metrics: ModelMetrics;
  status: 'draft' | 'training' | 'evaluating' | 'deployed' | 'archived';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// 任务定义
interface Task {
  id: string;
  name: string;
  type: 'training' | 'evaluation' | 'prediction';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  resourceConfig: ResourceConfig;
  parameters: Record<string, any>;
  progress: number;
  result?: TaskResult;
  error?: string;
  createdBy: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

// 评估结果
interface EvaluationResult {
  id: string;
  modelId: string;
  modelVersion: string;
  datasetId: string;
  metrics: {
    accuracy?: number;
    precision?: number;
    recall?: number;
    f1Score?: number;
    auc?: number;
    ks?: number;
    gini?: number;
    mse?: number;
    rmse?: number;
    mae?: number;
  };
  confusionMatrix?: number[][];
  rocCurve?: Array<{fpr: number; tpr: number}>;
  featureImportance?: Array<{feature: string; importance: number}>;
  createdAt: Date;
}
```

### 4.2 特征中心API

```typescript
// 获取特征列表
GET /api/features
Request Query:
{
  page?: number;
  pageSize?: number;
  type?: string;
  tags?: string[];
  search?: string;
}

Response:
{
  data: Feature[];
  total: number;
  page: number;
  pageSize: number;
}

// 创建特征
POST /api/features
Request Body:
{
  name: string;
  displayName: string;
  description: string;
  type: string;
  dataType: string;
  shape: number[];
  tags: string[];
  metadata: Record<string, any>;
}

Response:
{
  success: boolean;
  data: Feature;
  message?: string;
}
```

### 4.3 模型注册API

```typescript
// 注册模型
POST /api/models
Request Body:
{
  name: string;
  version: string;
  type: string;
  algorithm: string;
  description: string;
  parameters: Record<string, any>;
  file?: File; // 模型文件
}

Response:
{
  success: boolean;
  data: Model;
  message?: string;
}

// 上传模型文件
POST /api/models/upload
Request Body (multipart/form-data):
{
  modelId: string;
  version: string;
  file: File;
}

Response:
{
  success: boolean;
  data: {
    fileId: string;
    url: string;
    size: number;
  };
}
```

### 4.4 任务管理API

```typescript
// 创建训练任务
POST /api/tasks/training
Request Body:
{
  name: string;
  modelId: string;
  datasetId: string;
  algorithm: string;
  parameters: Record<string, any>;
  resourceConfig: {
    cpu: number;
    memory: number;
    gpu?: number;
  };
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

Response:
{
  success: boolean;
  data: Task;
  message?: string;
}

// 获取任务状态
GET /api/tasks/:id/status
Response:
{
  id: string;
  status: string;
  progress: number;
  result?: any;
  error?: string;
  logs?: string[];
}
```

## 5. 服务器架构

### 5.1 后端服务架构

```mermaid
graph TD
    A[API Gateway] --> B[Auth Middleware]
    B --> C[Feature Controller]
    B --> D[Model Controller]
    B --> E[Task Controller]
    B --> F[Evaluation Controller]

    C --> G[Feature Service]
    D --> H[Model Service]
    E --> I[Task Service]
    F --> J[Evaluation Service]

    G --> K[Feature Repository]
    H --> L[Model Repository]
    I --> M[Task Repository]
    J --> N[Evaluation Repository]

    K --> O[(PostgreSQL)]
    L --> O
    M --> O
    N --> O

    subgraph "Controller Layer"
        C
        D
        E
        F
    end

    subgraph "Service Layer"
        G
        H
        I
        J
    end

    subgraph "Repository Layer"
        K
        L
        M
        N
    end

    subgraph "Data Layer"
        O
    end
```

### 5.2 任务调度架构

```mermaid
graph TD
    A[Task Scheduler] --> B[Task Queue]
    B --> C[Worker Pool]
    C --> D[ML Pipeline]
    D --> E[Feature Engineering]
    D --> F[Model Training]
    D --> G[Model Evaluation]

    E --> H[Feature Store]
    F --> I[Model Storage]
    G --> J[Metrics Store]

    subgraph "Task Management"
        A
        B
        C
    end

    subgraph "ML Processing"
        D
        E
        F
        G
    end

    subgraph "Data Storage"
        H
        I
        J
    end
```

## 6. 数据模型

### 6.1 实体关系图

```mermaid
erDiagram
    USER ||--o{ MODEL : creates
    USER ||--o{ TASK : submits
    USER ||--o{ FEATURE : creates
    
    MODEL ||--o{ MODEL_VERSION : has
    MODEL ||--o{ EVALUATION : has
    MODEL_VERSION ||--o{ MODEL_FILE : contains
    
    FEATURE ||--o{ FEATURE_VERSION : has
    FEATURE ||--o{ FEATURE_SET : belongs_to
    
    TASK ||--o{ TASK_LOG : generates
    TASK ||--o{ TASK_RESULT : produces
    
    DATASET ||--o{ FEATURE_SET : contains
    DATASET ||--o{ EVALUATION : used_in
    
    MODEL {
        string id PK
        string name
        string type
        string algorithm
        json parameters
        string status
        string created_by
        timestamp created_at
    }
    
    MODEL_VERSION {
        string id PK
        string model_id FK
        string version
        string description
        json metrics
        string status
        timestamp created_at
    }
    
    FEATURE {
        string id PK
        string name
        string display_name
        string type
        string data_type
        json shape
        json metadata
        string created_by
        timestamp created_at
    }
    
    TASK {
        string id PK
        string name
        string type
        string status
        string priority
        json config
        string created_by
        timestamp created_at
    }
    
    EVALUATION {
        string id PK
        string model_id FK
        string model_version_id FK
        string dataset_id FK
        json metrics
        json results
        timestamp created_at
    }
```

### 6.2 数据库表结构

```sql
-- 用户表
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'analyst',
    department VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 特征表
CREATE TABLE features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(200) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL,
    data_type VARCHAR(50) NOT NULL,
    shape JSONB,
    version VARCHAR(20) NOT NULL,
    tags TEXT[],
    metadata JSONB,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 特征版本表
CREATE TABLE feature_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feature_id UUID REFERENCES features(id),
    version VARCHAR(20) NOT NULL,
    description TEXT,
    statistics JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(feature_id, version)
);

-- 模型表
CREATE TABLE models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    algorithm VARCHAR(100) NOT NULL,
    description TEXT,
    parameters JSONB,
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 模型版本表
CREATE TABLE model_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id UUID REFERENCES models(id),
    version VARCHAR(20) NOT NULL,
    description TEXT,
    metrics JSONB,
    parameters JSONB,
    status VARCHAR(50) NOT NULL,
    file_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(model_id, version)
);

-- 任务表
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    priority VARCHAR(20) NOT NULL DEFAULT 'medium',
    resource_config JSONB,
    parameters JSONB,
    progress FLOAT DEFAULT 0,
    result JSONB,
    error TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 评估结果表
CREATE TABLE evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id UUID REFERENCES models(id),
    model_version_id UUID REFERENCES model_versions(id),
    dataset_id UUID,
    metrics JSONB,
    confusion_matrix JSONB,
    roc_curve JSONB,
    feature_importance JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_features_name ON features(name);
CREATE INDEX idx_features_type ON features(type);
CREATE INDEX idx_features_created_at ON features(created_at DESC);
CREATE INDEX idx_models_name ON models(name);
CREATE INDEX idx_models_status ON models(status);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);
CREATE INDEX idx_evaluations_model_id ON evaluations(model_id);

-- 权限配置
GRANT SELECT ON ALL TABLES TO anon;
GRANT ALL PRIVILEGES ON ALL TABLES TO authenticated;
```

### 6.3 初始化数据

```sql
-- 插入示例特征
INSERT INTO features (name, display_name, description, type, data_type, shape, version, tags, metadata, created_by)
VALUES 
('user_age', '用户年龄', '用户的年龄信息', 'numerical', 'int64', '[1]', 'v1.0', '{"demographic", "basic"}', '{"range": {"min": 18, "max": 80}}', (SELECT id FROM users LIMIT 1)),
('transaction_amount', '交易金额', '用户交易金额', 'numerical', 'float64', '[1]', 'v1.0', '{"transaction", "financial"}', '{"unit": "CNY", "scale": "log"}', (SELECT id FROM users LIMIT 1)),
('credit_score', '信用评分', '用户信用评分', 'numerical', 'int64', '[1]', 'v1.0', '{"credit", "risk"}', '{"range": {"min": 300, "max": 850}}', (SELECT id FROM users LIMIT 1));

-- 插入示例模型
INSERT INTO models (name, type, algorithm, description, parameters, status, created_by)
VALUES 
('RiskScore_v1', 'classification', 'RandomForest', '用户风险评分模型', '{"n_estimators": 100, "max_depth": 10}', 'draft', (SELECT id FROM users LIMIT 1)),
('FraudDetection_v1', 'classification', 'XGBoost', '欺诈检测模型', '{"n_estimators": 200, "learning_rate": 0.1}', 'draft', (SELECT id FROM users LIMIT 1));
```

## 7. 部署架构

### 7.1 容器化部署

```yaml
# docker-compose.yml
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - VITE_API_URL=http://backend:8000
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/offline_model
      - REDIS_URL=redis://redis:6379
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_KEY=${SUPABASE_KEY}
    depends_on:
      - db
      - redis

  ml-pipeline:
    build: ./ml-pipeline
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/offline_model
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis

  db:
    image: postgres:14
    environment:
      - POSTGRES_DB=offline_model
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### 7.2 环境配置

```bash
# .env
# Supabase配置
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# 数据库配置
DATABASE_URL=postgresql://user:password@localhost:5432/offline_model

# Redis配置
REDIS_URL=redis://localhost:6379

# JWT配置
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=24h

# 文件上传配置
MAX_FILE_SIZE=100MB
UPLOAD_DIR=./uploads

# ML Pipeline配置
ML_WORKERS=4
ML_MAX_MEMORY=8GB
```

这个技术架构文档提供了完整的系统设计，包括前后端架构、数据模型、API设计和部署方案。系统采用微服务架构，支持高并发和可扩展性，满足数字风险平台离线模型模块的技术需求。