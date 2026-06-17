#!/usr/bin/env node
// mock ↔ column 一致性校验工具
// 任务：TASK-20260602-80A9EB0C（防 5/26 教训复发 + MVP-4 防御工事）
// 用法：
//   node scripts/verify-mock-column-consistency.js                           # 全仓扫（默认）
//   node scripts/verify-mock-column-consistency.js --vue-dir <dir>           # 指定 vue 目录
//   node scripts/verify-mock-column-consistency.js --mock-dir <dir>          # 指定 mock 目录
//   node scripts/verify-mock-column-consistency.js <mock-file>               # 校验单个 mock
//   node scripts/verify-mock-column-consistency.js --json                    # JSON 输出
//
// 规则：
//   1. 扫描 vue 目录（含子目录）下 *.vue 中的 columns 数组
//   2. 提取所有 dataIndex 字段
//   3. 对照 mock 目录中 *.ts/*.js 查字段
//   4. 输出：缺失字段（mock 缺） / 孤儿字段（mock 有但无 column）

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DEFAULT_VUE_DIR = path.join(ROOT, 'src', 'pages', 'marketing');
const DEFAULT_MOCK_DIR = path.join(ROOT, 'src', 'mock');

// ---------- 工具 ----------
function walk(dir, ext) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p, ext));
    else if (e.name.endsWith(ext)) out.push(p);
  }
  return out;
}

function extractDataIndexes(vueContent) {
  // 匹配 dataIndex: 'xxx' 或 dataIndex: "xxx"
  const re = /dataIndex\s*:\s*['"]([^'"]+)['"]/g;
  const set = new Set();
  let m;
  while ((m = re.exec(vueContent)) !== null) {
    set.add(m[1]);
  }
  return [...set];
}

function extractMockFields(mockContent) {
  // 简单提取所有 key: value 中的 key（仅顶层）
  const re = /^\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/gm;
  const set = new Set();
  let m;
  while ((m = re.exec(mockContent)) !== null) {
    set.add(m[1]);
  }
  return [...set];
}

function inferMockFile(vueFile, vueDir, mockDir) {
  // 根据路径推断对应 mock 文件
  // 例: pages/marketing/coupon/inventory/index.vue → mock/coupon.ts
  // 例: pages/customer360/profile/index.vue → mock/customer360.ts
  const rel = path.relative(vueDir, vueFile);
  const parts = rel.split(path.sep);
  const module = parts[0]; // coupon / alert / customer360 / ...
  const candidates = [
    path.join(mockDir, `${module}.ts`),
    path.join(mockDir, `${module}.js`),
    path.join(mockDir, 'businessProcessData.ts'),
    path.join(mockDir, 'tableData.ts'),
  ];
  return candidates.find(p => fs.existsSync(p)) || null;
}

// ---------- 参数解析 ----------
function parseArgs(args) {
  const opts = { json: false, vueDir: null, mockDir: null, targetMock: null };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--json') opts.json = true;
    else if (a === '--vue-dir') opts.vueDir = args[++i];
    else if (a === '--mock-dir') opts.mockDir = args[++i];
    else opts.targetMock = a;
  }
  return opts;
}

// ---------- 主流程 ----------
function main() {
  const opts = parseArgs(process.argv.slice(2));
  const VUE_DIR = opts.vueDir ? path.resolve(opts.vueDir) : DEFAULT_VUE_DIR;
  const MOCK_DIR = opts.mockDir ? path.resolve(opts.mockDir) : DEFAULT_MOCK_DIR;
  const targetMock = opts.targetMock;
  const jsonMode = opts.json;

  if (!jsonMode) {
    console.log('🔍 mock ↔ column 一致性校验\n');
    console.log('Vue 扫描目录:', VUE_DIR);
    console.log('Mock 目录:', MOCK_DIR);
    if (targetMock) console.log('指定 mock:', targetMock);
    if (!opts.vueDir && !opts.mockDir && !targetMock) {
      console.log('💡 全仓扫描模式：可加 --vue-dir/--mock-dir 参数化');
    }
    console.log('---');
  }

  const vueFiles = walk(VUE_DIR, '.vue');
  const mockFiles = targetMock
    ? [path.resolve(targetMock)]
    : walk(MOCK_DIR, '.ts').concat(walk(MOCK_DIR, '.js'));

  // 预加载所有 mock 字段
  const mockFieldMap = {}; // mockFile → Set
  for (const mf of mockFiles) {
    try {
      const content = fs.readFileSync(mf, 'utf8');
      mockFieldMap[mf] = new Set(extractMockFields(content));
    } catch (e) {
      console.warn(`⚠️  读取 mock 失败: ${mf}: ${e.message}`);
    }
  }

  const report = []; // { vue, mock, missing, orphan }
  let totalMissing = 0;
  let totalChecked = 0;

  for (const vf of vueFiles) {
    const content = fs.readFileSync(vf, 'utf8');
    const indexes = extractDataIndexes(content);
    if (indexes.length === 0) continue;

    const mockFile = inferMockFile(vf, VUE_DIR, MOCK_DIR);
    if (!mockFile || !mockFieldMap[mockFile]) {
      // 找不到 mock 文件，记录警告
      report.push({ vue: vf, mock: null, indexes, missing: indexes, orphan: [] });
      continue;
    }

    const mockFields = mockFieldMap[mockFile];
    const missing = indexes.filter(i => !mockFields.has(i));
    if (missing.length > 0) {
      totalMissing += missing.length;
      totalChecked += indexes.length;
      report.push({ vue: vf, mock: mockFile, indexes, missing, orphan: [] });
    } else {
      totalChecked += indexes.length;
    }
  }

  // 输出
  if (jsonMode) {
    console.log(JSON.stringify({ summary: { totalChecked, totalMissing, reportCount: report.length }, report }, null, 2));
  } else {
    if (report.length === 0) {
      console.log('✅ 全部通过：' + totalChecked + ' 个 dataIndex 字段与 mock 一致');
    } else {
      console.log(`❌ 发现 ${report.length} 个文件有字段缺失（共 ${totalMissing} 个缺失字段）\n`);
      for (const r of report) {
        console.log(`📄 ${path.relative(ROOT, r.vue)}`);
        console.log(`   ↳ mock: ${r.mock ? path.relative(ROOT, r.mock) : '❌ 未找到对应 mock'}`);
        console.log(`   ↳ 缺失: ${r.missing.join(', ')}`);
        console.log('');
      }
    }
  }

  // 退出码：有缺失 = 1（可接入 CI）
  process.exit(totalMissing > 0 ? 1 : 0);
}

main();
