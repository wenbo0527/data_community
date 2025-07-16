# TypeScript 类型安全改进指南

## 🎯 已修复的问题

### ✅ TargetAudienceType 导入问题
- **问题**: `useStartNodeForm.ts` 中使用了 `TargetAudienceType` 但未导入
- **解决**: 添加了正确的类型导入
```typescript
import type { StartNodeConfig, TargetAudienceType } from '../types/startNodeConfig'
```

## 🚀 进一步的类型安全改进建议

### 1. 增强 tsconfig.json 配置

```json
{
  "compilerOptions": {
    "target": "esnext",
    "module": "esnext",
    "moduleResolution": "node",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true,
    "jsx": "preserve",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

### 2. 创建全局类型定义文件

```typescript
// src/types/global.d.ts
declare global {
  interface Window {
    __VUE_DEVTOOLS_GLOBAL_HOOK__?: any
  }
}

// 扩展 Vue 组件类型
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $message: typeof import('@arco-design/web-vue')['Message']
  }
}

export {}
```

### 3. 严格的事件类型定义

```typescript
// src/types/events.ts
export interface NodeEvent {
  type: 'node:click' | 'node:dblclick' | 'node:delete'
  nodeId: string
  nodeData: NodeData
  timestamp: number
}

export interface CanvasEvent {
  type: 'canvas:ready' | 'canvas:clear' | 'canvas:export'
  data?: any
  timestamp: number
}

export type TaskFlowEvent = NodeEvent | CanvasEvent
```

### 4. 表单验证类型增强

```typescript
// src/types/validation.ts
export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
}

export interface ValidationError {
  field: string
  message: string
  code: string
}

export type ValidatorFunction<T = any> = (
  value: T,
  callback: (error?: string) => void
) => void

export interface FormRule {
  required?: boolean
  message?: string
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object'
  min?: number
  max?: number
  pattern?: RegExp
  validator?: ValidatorFunction
}
```

### 5. API 响应类型定义

```typescript
// src/types/api.ts
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  success: boolean
  timestamp: number
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    current: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export interface ErrorResponse extends ApiResponse<null> {
  error: {
    code: string
    details?: Record<string, any>
  }
}
```

### 6. 组件 Props 类型严格化

```typescript
// src/types/components.ts
export interface BaseComponentProps {
  id?: string
  className?: string
  style?: Record<string, any>
}

export interface DrawerProps extends BaseComponentProps {
  visible: boolean
  title?: string
  width?: number | string
  placement?: 'left' | 'right' | 'top' | 'bottom'
  maskClosable?: boolean
}

export interface NodeConfigDrawerProps extends DrawerProps {
  nodeData: NodeData
  readonly?: boolean
}
```

## 🔍 类型检查最佳实践

### 1. 使用类型断言时要谨慎

```typescript
// ❌ 避免
const data = response as StartNodeConfig

// ✅ 推荐
const data = response as StartNodeConfig
if (!isValidStartNodeConfig(data)) {
  throw new Error('Invalid start node config')
}

// 或使用类型守卫
function isValidStartNodeConfig(data: any): data is StartNodeConfig {
  return (
    typeof data === 'object' &&
    typeof data.taskType === 'string' &&
    typeof data.entryDate === 'string' &&
    Array.isArray(data.targetAudience)
  )
}
```

### 2. 使用联合类型而不是 any

```typescript
// ❌ 避免
const handleEvent = (event: any) => {
  // ...
}

// ✅ 推荐
const handleEvent = (event: NodeEvent | CanvasEvent) => {
  switch (event.type) {
    case 'node:click':
      // TypeScript 知道这是 NodeEvent
      console.log(event.nodeId)
      break
    case 'canvas:ready':
      // TypeScript 知道这是 CanvasEvent
      console.log(event.data)
      break
  }
}
```

### 3. 使用泛型提高复用性

```typescript
// src/composables/useApi.ts
export function useApi<T>() {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const data = ref<T | null>(null)

  const request = async (url: string): Promise<T> => {
    loading.value = true
    error.value = null
    
    try {
      const response = await fetch(url)
      const result = await response.json() as ApiResponse<T>
      
      if (result.success) {
        data.value = result.data
        return result.data
      } else {
        throw new Error(result.message)
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    loading: readonly(loading),
    error: readonly(error),
    data: readonly(data),
    request
  }
}
```

### 4. 环境变量类型定义

```typescript
// src/types/env.d.ts
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_VERSION: string
  readonly VITE_ENABLE_MOCK: 'true' | 'false'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

## 🛠️ 开发工具配置

### 1. VS Code 设置

```json
// .vscode/settings.json
{
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "typescript.suggest.autoImports": true,
  "typescript.updateImportsOnFileMove.enabled": "always",
  "editor.codeActionsOnSave": {
    "source.organizeImports": true,
    "source.fixAll.eslint": true
  }
}
```

### 2. ESLint TypeScript 规则

```javascript
// .eslintrc.js
module.exports = {
  extends: [
    '@vue/typescript/recommended'
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error'
  }
}
```

## 📊 类型覆盖率监控

### 使用 type-coverage 工具

```bash
npm install -D type-coverage

# 检查类型覆盖率
npx type-coverage --detail

# 设置最低覆盖率要求
npx type-coverage --at-least 95
```

### 在 CI/CD 中集成类型检查

```yaml
# .github/workflows/type-check.yml
name: Type Check

on: [push, pull_request]

jobs:
  type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run type-check
      - run: npx type-coverage --at-least 90
```