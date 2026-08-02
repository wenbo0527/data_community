#!/usr/bin/env node
/**
 * 自定义 lint:any 检查
 * 用途：扫描 src/ 下 `: any` / `<any>` / `as any` 用法
 * 退出码：
 *   - 0：仅 types/graph.ts 内部使用（≤2 处）
 *   - 1：业务代码中出现 `: any` 用法
 * 排除：types/*.ts（基础设施）、注释行
 * 边界：纯正则匹配；不做语法解析；CI 可调用
 */

import { readdirSync, statSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('../src', import.meta.url))
const EXCLUDE = new Set(['types'])
const ALLOWED_PATH_PATTERNS = [/types\/graph\.ts$/]
const COMMENT_LINE = /^\s*(\/\/|\*)/

const anyRe = /(?<![A-Za-z_$0-9])(: any\b|<any>|as any\b)/g

function walk(dir) {
  const out = []
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    const st = statSync(p)
    if (st.isDirectory()) {
      if (!EXCLUDE.has(name)) out.push(...walk(p))
    } else if (/\.(ts|tsx|js|vue)$/.test(name)) {
      out.push(p)
    }
  }
  return out
}

const files = walk(ROOT)
let total = 0
const hits = []

for (const f of files) {
  const rel = relative(ROOT, f)
  const src = readFileSync(f, 'utf8')
  const lines = src.split('\n')
  lines.forEach((line, i) => {
    if (COMMENT_LINE.test(line)) return
    if (!anyRe.test(line)) return
    if (ALLOWED_PATH_PATTERNS.some(p => p.test(rel))) return
    total++
    hits.push(`${rel}:${i + 1}: ${line.trim()}`)
    anyRe.lastIndex = 0
  })
}

console.log(`[lint:any] scanned ${files.length} files`)
console.log(`[lint:any] business ': any' usages: ${total}`)
if (hits.length) {
  for (const h of hits) console.log('  ' + h)
}
process.exit(total > 0 ? 1 : 0)
/*
用途：自定义 lint:any 脚本
说明：扫描 src 下非 types 文件中的 `: any / <any> / as any` 用法；CI 可调用。
边界：仅作为 CI 提示工具；不解析 AST；不区分业务代码与基础设施（types 目录排除）。
*/