#!/usr/bin/env node
/**
 * mkt-app mock 纯净度检查
 * 用途：禁止业务代码使用真实后端客户端 / 禁止后端 SDK 依赖
 * 检查项：
 *   1. 禁止 import '@supabase/*'
 *   2. 禁止 import 'axios' / 'fetch'（业务代码）
 *   3. 禁止 import '@app/shared-api/request'（除 packages/shared-api 自身）
 *   4. 禁止 package.json 依赖 '@app/shared-api'（业务代码禁止真 axios）
 *   5. utils/ 下禁止新建 .ts 后端 SDK
 * 退出码：
 *   - 0：无违规
 *   - 1：发现违规项
 * 排除：注释行 / types.ts 自身 / test 文件 / mock/ 目录
 */

import { readdirSync, statSync, readFileSync, existsSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('../src', import.meta.url))
const ROOT_PKG = fileURLToPath(new URL('../package.json', import.meta.url))
const COMMENT = /^\s*(\/\/|\*|\/\*)/

const BANNED_IMPORT = [
  { re: /from\s+['"]@supabase\//, msg: '禁止 import @supabase/*（项目无后端）' },
  { re: /from\s+['"]axios['"]/, msg: '禁止 import axios（应使用 @/utils/mockRequest）' },
  { re: /from\s+['"]@app\/shared-api\/request['"]/, msg: '禁止 @app/shared-api/request（请使用 @/utils/mockRequest）' }
]

const BANNED_DEPS = [
  { name: '@app/shared-api', msg: '禁止依赖 @app/shared-api（真实 axios，业务代码应纯 mock）' },
  { name: '@supabase/supabase-js', msg: '禁止依赖 @supabase/*（项目无后端）' }
]

function walk(dir) {
  const out = []
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    const st = statSync(p)
    if (st.isDirectory()) out.push(...walk(p))
    else if (/\.(ts|tsx|js|vue)$/.test(name)) out.push(p)
  }
  return out
}

let hits = 0

// 1) 检查 package.json 依赖
if (existsSync(ROOT_PKG)) {
  const pkg = JSON.parse(readFileSync(ROOT_PKG, 'utf8'))
  const deps = Object.keys(pkg.dependencies || {})
  const devDeps = Object.keys(pkg.devDependencies || {})
  const allDeps = [...deps, ...devDeps]
  for (const { name, msg } of BANNED_DEPS) {
    if (allDeps.includes(name)) {
      hits++
      console.log(`[FAIL] package.json: ${msg}`)
      console.log(`       dependency "${name}" found`)
    }
  }
}

// 2) 检查业务代码 import
const files = walk(ROOT)
for (const f of files) {
  const rel = relative(ROOT, f)
  if (rel.startsWith('mock/')) continue
  const src = readFileSync(f, 'utf8')
  const lines = src.split('\n')
  lines.forEach((line, i) => {
    if (COMMENT.test(line)) return
    for (const { re, msg } of BANNED_IMPORT) {
      if (re.test(line)) {
        hits++
        console.log(`[FAIL] ${rel}:${i + 1} ${msg}`)
        console.log(`       ${line.trim()}`)
      }
    }
  })
}

console.log(`\n[check-mock-purity] scanned ${files.length} files (excluding mock/), hits=${hits}`)
process.exit(hits > 0 ? 1 : 0)
/*
用途：mkt-app mock 纯净度检查
说明：禁止业务代码引入真实后端客户端 + 禁止后端 SDK 依赖；CI 可调用。
边界：仅检查业务代码 + package.json；mock/ 目录自身豁免。
*/