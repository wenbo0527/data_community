/**
 * 营销画布系统类型定义入口文件
 * 统一导出所有类型定义，方便其他模块使用
 */

// 核心类型
export * from './core'

// 服务接口
export * from './services'

// 事件类型
export * from './events'

// 配置类型
export * from './config'

// 重新导出常用类型的别名
export type {
  // 核心数据类型
  BaseNode as Node,
  Connection as Edge,
  Position as Point,
  Rectangle as Rect,
  Size as Dimensions,
  
  // 画布相关
  CanvasState as Canvas,
  Viewport as View,
  Selection as Select,
  
  // 事件相关
  CanvasEvent as Event,
  NodeEvent,
  ConnectionEvent as EdgeEvent,
  SelectionEvent as SelectEvent,
  
  // 服务相关
  NodeService,
  ConnectionService as EdgeService,
  CanvasService,
  
  // 配置相关
  AppConfig as Config,
  CanvasConfig,
  ThemeConfig as Theme
} from './core'

export type {
  EventHandler,
  EventEmitter,
  EventBus
} from './events'

export type {
  NodeTypeConfig,
  WorkflowConfig
} from './config'

/**
 * 通用工具类型
 */
export type Nullable<T> = T | null
export type Optional<T> = T | undefined
export type Maybe<T> = T | null | undefined

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P]
}

export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P]
}

export type Mutable<T> = {
  -readonly [P in keyof T]: T[P]
}

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>

export type ValueOf<T> = T[keyof T]

export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never
}[keyof T]

export type NonNullable<T> = T extends null | undefined ? never : T

export type Awaited<T> = T extends PromiseLike<infer U> ? U : T

/**
 * 函数类型工具
 */
export type AnyFunction = (...args: any[]) => any

export type AsyncFunction<T extends any[] = any[], R = any> = (...args: T) => Promise<R>

export type SyncFunction<T extends any[] = any[], R = any> = (...args: T) => R

export type EventCallback<T = any> = (event: T) => void | Promise<void>

export type Predicate<T = any> = (value: T) => boolean

export type Comparator<T = any> = (a: T, b: T) => number

export type Transformer<T = any, R = any> = (value: T) => R

export type Reducer<T = any, R = any> = (accumulator: R, current: T, index: number, array: T[]) => R

/**
 * 对象类型工具
 */
export type PlainObject<T = any> = Record<string, T>

export type StringRecord = Record<string, string>

export type NumberRecord = Record<string, number>

export type BooleanRecord = Record<string, boolean>

/**
 * 数组类型工具
 */
export type NonEmptyArray<T> = [T, ...T[]]

export type ReadonlyNonEmptyArray<T> = readonly [T, ...T[]]

export type ArrayElement<T> = T extends readonly (infer U)[] ? U : never

export type Tuple<T, N extends number> = N extends N ? number extends N ? T[] : _TupleOf<T, N, []> : never

type _TupleOf<T, N extends number, R extends unknown[]> = R['length'] extends N ? R : _TupleOf<T, N, [...R, T]>

/**
 * 字符串类型工具
 */
export type StringLiteral<T> = T extends string ? string extends T ? never : T : never

export type Join<T extends string[], D extends string = ','>
  = T extends readonly [infer F, ...infer R]
    ? F extends string
      ? R extends readonly string[]
        ? R['length'] extends 0
          ? F
          : `${F}${D}${Join<R, D>}`
        : never
      : never
    : ''

export type Split<S extends string, D extends string>
  = S extends `${infer T}${D}${infer U}`
    ? [T, ...Split<U, D>]
    : [S]

/**
 * 条件类型工具
 */
export type If<C extends boolean, T, F> = C extends true ? T : F

export type Not<C extends boolean> = C extends true ? false : true

export type And<A extends boolean, B extends boolean> = A extends true ? B : false

export type Or<A extends boolean, B extends boolean> = A extends true ? true : B

/**
 * 联合类型工具
 */
export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never

export type UnionToTuple<T> = UnionToIntersection<T extends any ? () => T : never> extends () => infer W ? [...UnionToTuple<Exclude<T, W>>, W] : []

export type LastOfUnion<T> = UnionToIntersection<T extends any ? () => T : never> extends () => infer R ? R : never

/**
 * 品牌类型（Branded Types）
 */
export type Brand<T, B> = T & { __brand: B }

export type NodeId = Brand<string, 'NodeId'>
export type ConnectionId = Brand<string, 'ConnectionId'>
export type CanvasId = Brand<string, 'CanvasId'>
export type WorkflowId = Brand<string, 'WorkflowId'>
export type UserId = Brand<string, 'UserId'>
export type Timestamp = Brand<number, 'Timestamp'>
export type Percentage = Brand<number, 'Percentage'>
export type Degree = Brand<number, 'Degree'>
export type Pixel = Brand<number, 'Pixel'>

/**
 * 创建品牌类型的工具函数
 */
export function createNodeId(id: string): NodeId {
  return id as NodeId
}

export function createConnectionId(id: string): ConnectionId {
  return id as ConnectionId
}

export function createCanvasId(id: string): CanvasId {
  return id as CanvasId
}

export function createWorkflowId(id: string): WorkflowId {
  return id as WorkflowId
}

export function createUserId(id: string): UserId {
  return id as UserId
}

export function createTimestamp(time: number): Timestamp {
  return time as Timestamp
}

export function createPercentage(value: number): Percentage {
  return Math.max(0, Math.min(100, value)) as Percentage
}

export function createDegree(value: number): Degree {
  return (value % 360) as Degree
}

export function createPixel(value: number): Pixel {
  return value as Pixel
}

/**
 * 类型断言工具
 */
export function assertIsNode(value: any): asserts value is BaseNode {
  if (!value || typeof value.id !== 'string' || typeof value.type !== 'string') {
    throw new Error('Value is not a valid Node')
  }
}

export function assertIsConnection(value: any): asserts value is Connection {
  if (!value || typeof value.id !== 'string' || typeof value.source !== 'string' || typeof value.target !== 'string') {
    throw new Error('Value is not a valid Connection')
  }
}

export function assertIsPosition(value: any): asserts value is Position {
  if (!value || typeof value.x !== 'number' || typeof value.y !== 'number') {
    throw new Error('Value is not a valid Position')
  }
}

export function assertIsRectangle(value: any): asserts value is Rectangle {
  if (!value || typeof value.x !== 'number' || typeof value.y !== 'number' || 
      typeof value.width !== 'number' || typeof value.height !== 'number') {
    throw new Error('Value is not a valid Rectangle')
  }
}

/**
 * 类型检查工具
 */
export function isString(value: any): value is string {
  return typeof value === 'string'
}

export function isNumber(value: any): value is number {
  return typeof value === 'number' && !isNaN(value)
}

export function isBoolean(value: any): value is boolean {
  return typeof value === 'boolean'
}

export function isObject(value: any): value is object {
  return value !== null && typeof value === 'object'
}

export function isArray<T = any>(value: any): value is T[] {
  return Array.isArray(value)
}

export function isFunction(value: any): value is AnyFunction {
  return typeof value === 'function'
}

export function isPromise<T = any>(value: any): value is Promise<T> {
  return value && typeof value.then === 'function'
}

export function isDate(value: any): value is Date {
  return value instanceof Date
}

export function isRegExp(value: any): value is RegExp {
  return value instanceof RegExp
}

export function isError(value: any): value is Error {
  return value instanceof Error
}

export function isNull(value: any): value is null {
  return value === null
}

export function isUndefined(value: any): value is undefined {
  return value === undefined
}

export function isNullish(value: any): value is null | undefined {
  return value == null
}

export function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined
}

export function isNotNull<T>(value: T | null): value is T {
  return value !== null
}

export function isNotNullish<T>(value: T | null | undefined): value is T {
  return value != null
}

export function isEmpty(value: any): boolean {
  if (isNullish(value)) return true
  if (isString(value) || isArray(value)) return value.length === 0
  if (isObject(value)) return Object.keys(value).length === 0
  return false
}

export function isNotEmpty(value: any): boolean {
  return !isEmpty(value)
}

/**
 * 深度比较工具
 */
export function deepEqual(a: any, b: any): boolean {
  if (a === b) return true
  
  if (a == null || b == null) return a === b
  
  if (typeof a !== typeof b) return false
  
  if (typeof a !== 'object') return a === b
  
  if (Array.isArray(a) !== Array.isArray(b)) return false
  
  if (Array.isArray(a)) {
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false
    }
    return true
  }
  
  const keysA = Object.keys(a)
  const keysB = Object.keys(b)
  
  if (keysA.length !== keysB.length) return false
  
  for (const key of keysA) {
    if (!keysB.includes(key)) return false
    if (!deepEqual(a[key], b[key])) return false
  }
  
  return true
}

/**
 * 深度克隆工具
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj
  
  if (obj instanceof Date) return new Date(obj.getTime()) as T
  
  if (obj instanceof RegExp) return new RegExp(obj) as T
  
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item)) as T
  }
  
  const cloned = {} as T
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key])
    }
  }
  
  return cloned
}

/**
 * 对象合并工具
 */
export function deepMerge<T extends object, U extends object>(target: T, source: U): T & U {
  const result = { ...target } as T & U
  
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      const sourceValue = source[key]
      const targetValue = (result as any)[key]
      
      if (isObject(sourceValue) && isObject(targetValue) && !Array.isArray(sourceValue) && !Array.isArray(targetValue)) {
        (result as any)[key] = deepMerge(targetValue, sourceValue)
      } else {
        (result as any)[key] = sourceValue
      }
    }
  }
  
  return result
}

/**
 * 路径访问工具
 */
export function get<T = any>(obj: any, path: string | string[], defaultValue?: T): T {
  const keys = Array.isArray(path) ? path : path.split('.')
  let result = obj
  
  for (const key of keys) {
    if (result == null || typeof result !== 'object') {
      return defaultValue as T
    }
    result = result[key]
  }
  
  return result === undefined ? defaultValue as T : result
}

export function set(obj: any, path: string | string[], value: any): void {
  const keys = Array.isArray(path) ? path : path.split('.')
  let current = obj
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    if (current[key] == null || typeof current[key] !== 'object') {
      current[key] = {}
    }
    current = current[key]
  }
  
  current[keys[keys.length - 1]] = value
}

export function has(obj: any, path: string | string[]): boolean {
  const keys = Array.isArray(path) ? path : path.split('.')
  let current = obj
  
  for (const key of keys) {
    if (current == null || typeof current !== 'object' || !(key in current)) {
      return false
    }
    current = current[key]
  }
  
  return true
}

export function unset(obj: any, path: string | string[]): boolean {
  const keys = Array.isArray(path) ? path : path.split('.')
  let current = obj
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    if (current == null || typeof current !== 'object' || !(key in current)) {
      return false
    }
    current = current[key]
  }
  
  const lastKey = keys[keys.length - 1]
  if (current != null && typeof current === 'object' && lastKey in current) {
    delete current[lastKey]
    return true
  }
  
  return false
}