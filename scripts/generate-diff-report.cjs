/* eslint-disable */
const fs = require('fs')
const path = require('path')
let diff
try { diff = require('diff') } catch { diff = null }

function readJSON(p) { try { return JSON.parse(fs.readFileSync(p, 'utf8')) } catch { return null } }
function safeRead(p) { try { return fs.readFileSync(p, 'utf8') } catch { return null } }
function listFilesRecursive(root) {
  const results = []
  function walk(dir) {
    let entries = []
    try { entries = fs.readdirSync(dir, { withFileTypes: true }) } catch { return }
    for (const e of entries) {
      const full = path.join(dir, e.name)
      if (e.isDirectory()) walk(full)
      else results.push(full)
    }
  }
  walk(root)
  return results
}

function ensureDir(dir) { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }) }
function htmlEscape(s) { return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') }

const repoRoot = process.cwd()
const baselineGroups = [
  { name: 'horizontal-page', root: path.join(repoRoot, 'src/pages/marketing/tasks/horizontal') },
  { name: 'horizontal-components', root: path.join(repoRoot, 'src/pages/marketing/tasks/components') },
  { name: 'horizontal-composables', root: path.join(repoRoot, 'src/pages/marketing/tasks/composables') },
  { name: 'horizontal-services', root: path.join(repoRoot, 'src/pages/marketing/tasks/horizontal/services') },
  { name: 'horizontal-utils', root: path.join(repoRoot, 'src/pages/marketing/tasks/horizontal/utils') },
  { name: 'preview-line', root: path.join(repoRoot, 'src/utils/preview-line') }
]

const targetGroups = [
  { name: 'horizontal-page', root: path.join(repoRoot, 'apps/horizontal-canvas/src/pages/horizontal') },
  { name: 'horizontal-components', root: path.join(repoRoot, 'apps/horizontal-canvas/src/components') },
  { name: 'horizontal-composables', root: path.join(repoRoot, 'apps/horizontal-canvas/src/composables') },
  { name: 'horizontal-services', root: path.join(repoRoot, 'apps/horizontal-canvas/src/pages/horizontal/services') },
  { name: 'horizontal-utils', root: path.join(repoRoot, 'apps/horizontal-canvas/src/pages/horizontal/utils') },
  { name: 'preview-line', root: path.join(repoRoot, 'apps/horizontal-canvas/src/utils/preview-line') }
]

const pkgBaseline = readJSON(path.join(repoRoot, 'package.json')) || {}
const pkgTarget = readJSON(path.join(repoRoot, 'apps/horizontal-canvas/package.json')) || {}

function mapTargetPath(baselinePath) {
  const rel = baselinePath.replace(path.join(repoRoot, 'src'), '').replace(/^\//, '')
  if (rel.startsWith('pages/marketing/tasks/horizontal')) {
    return path.join(repoRoot, 'apps/horizontal-canvas/src/pages/horizontal', rel.replace('pages/marketing/tasks/horizontal', ''))
  }
  if (rel.startsWith('pages/marketing/tasks/components')) {
    return path.join(repoRoot, 'apps/horizontal-canvas/src/components', rel.replace('pages/marketing/tasks/components', 'components'))
  }
  if (rel.startsWith('pages/marketing/tasks/composables')) {
    return path.join(repoRoot, 'apps/horizontal-canvas/src/composables', rel.replace('pages/marketing/tasks/composables', 'composables'))
  }
  if (rel.startsWith('utils/preview-line')) {
    return path.join(repoRoot, 'apps/horizontal-canvas/src/utils/preview-line', rel.replace('utils/preview-line', ''))
  }
  return null
}

function collectAPIs(content) {
  const apis = []
  const exportRegex = /(export\s+(?:default\s+)?(?:function|const|let|var|class)\s+([A-Za-z0-9_]+))|export\s*\{([^}]+)\}/g
  let m
  while ((m = exportRegex.exec(content)) !== null) {
    if (m[2]) apis.push(m[2])
    else if (m[3]) m[3].split(',').map(s => s.trim()).forEach(n => { if (n) apis.push(n) })
  }
  return Array.from(new Set(apis))
}

function simpleDiffStats(a, b) {
  const aLines = (a || '').split('\n')
  const bLines = (b || '').split('\n')
  let added = 0, removed = 0
  const max = Math.max(aLines.length, bLines.length)
  for (let i = 0; i < max; i++) {
    if (aLines[i] !== bLines[i]) {
      if (aLines[i] == null) added++
      else if (bLines[i] == null) removed++
      else { added++; removed++ }
    }
  }
  return { added, removed }
}

function diffFiles(bFile, tFile) {
  const a = safeRead(bFile) || ''
  const b = safeRead(tFile) || ''
  let patch = ''
  let added = 0, removed = 0
  if (diff) {
    const changes = diff.diffLines(a, b)
    changes.forEach(c => { if (c.added) added += c.count || 0; else if (c.removed) removed += c.count || 0 })
    patch = diff.createTwoFilesPatch(bFile, tFile, a, b)
  } else {
    const stats = simpleDiffStats(a, b)
    added = stats.added
    removed = stats.removed
    patch = `diff unavailable (fallback stats)\n+${bFile}\n- lines changed: +${added} / -${removed}`
  }
  const apisA = collectAPIs(a)
  const apisB = collectAPIs(b)
  const apiAdded = apisB.filter(x => !apisA.includes(x))
  const apiRemoved = apisA.filter(x => !apisB.includes(x))
  const same = a === b
  return { same, addedLines: added, removedLines: removed, patch, apisA, apisB, apiAdded, apiRemoved }
}

function compareGroups() {
  const report = []
  for (const g of baselineGroups) {
    const tgt = targetGroups.find(x => x.name === g.name)
    const baselineFiles = listFilesRecursive(g.root)
    const items = []
    baselineFiles.forEach(bf => {
      const tf = mapTargetPath(bf)
      const exists = tf && fs.existsSync(tf)
      if (!tf) items.push({ type: 'deleted', baseline: bf, target: null, detail: '无法映射目标路径' })
      else if (!exists) items.push({ type: 'deleted', baseline: bf, target: tf, detail: '目标缺失' })
      else {
        const df = diffFiles(bf, tf)
        const type = df.same ? 'unchanged' : 'modified'
        items.push({ type, baseline: bf, target: tf, diff: df })
      }
    })
    const targetFiles = listFilesRecursive(tgt.root)
    targetFiles.forEach(tf => {
      const rel = tf.replace(tgt.root, '')
      const guessBaseline = path.join(g.root, rel)
      if (!fs.existsSync(guessBaseline)) {
        items.push({ type: 'added', baseline: null, target: tf })
      }
    })
    report.push({ group: g.name, baselineRoot: g.root, targetRoot: tgt.root, items })
  }
  return report
}

function compareDependencies() {
  const baseDeps = pkgBaseline.dependencies || {}
  const baseDev = pkgBaseline.devDependencies || {}
  const targDeps = (pkgTarget && pkgTarget.dependencies) || {}
  const targDev = (pkgTarget && pkgTarget.devDependencies) || {}
  const depKeys = Array.from(new Set([...Object.keys(baseDeps), ...Object.keys(targDeps)]))
  const devKeys = Array.from(new Set([...Object.keys(baseDev), ...Object.keys(targDev)]))
  const deps = depKeys.map(k => ({ name: k, baseline: baseDeps[k] || null, target: targDeps[k] || null }))
  const devs = devKeys.map(k => ({ name: k, baseline: baseDev[k] || null, target: targDev[k] || null }))
  return { deps, devs }
}

function compareConfigs() {
  const cfgs = ['vite.config.ts', 'vite.config.js', 'tsconfig.json', '.eslintrc.js', '.eslintrc.cjs']
  const res = []
  cfgs.forEach(name => {
    const a = safeRead(path.join(repoRoot, name))
    const b = safeRead(path.join(repoRoot, 'apps/horizontal-canvas', name))
    if (a || b) {
      let added = 0, removed = 0
      if (diff) {
        const changes = diff.diffLines(a || '', b || '')
        changes.forEach(c => { if (c.added) added += c.count || 0; else if (c.removed) removed += c.count || 0 })
      } else {
        const stats = simpleDiffStats(a || '', b || '')
        added = stats.added; removed = stats.removed
      }
      const patch = diff ? diff.createTwoFilesPatch(name + ' (baseline)', name + ' (target)', a || '', b || '') : `diff unavailable`
      res.push({ file: name, existsBaseline: !!a, existsTarget: !!b, addedLines: added, removedLines: removed, same: (a || '') === (b || ''), patch })
    }
  })
  return res
}

function renderHTML(report, deps, cfgs, stats) {
  const htmlParts = []
  htmlParts.push(`<!DOCTYPE html><html><head><meta charset="utf-8"/><title>横版画布差异对比报告</title>
  <link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style> body{font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto; padding:24px; color:#1f2937}
  h1{font-size:24px;margin:0 0 12px} h2{font-size:18px;margin:20px 0 8px}
  .summary{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:16px 0}
  .card{background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px;box-shadow:0 1px 2px rgba(0,0,0,.04)}
  .mono{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;white-space:pre-wrap;background:#f8fafc;border:1px solid #e5e7eb;border-radius:6px;padding:8px;margin:8px 0}
  .table{width:100%;border-collapse:collapse;margin:8px 0} .table th,.table td{border:1px solid #e5e7eb;padding:8px;font-size:12px;text-align:left}
  .badge{display:inline-block;padding:2px 6px;border-radius:6px;font-size:12px} .added{background:#ecfeff;color:#0369a1} .deleted{background:#fee2e2;color:#b91c1c} .modified{background:#fef9c3;color:#a16207} .unchanged{background:#f1f5f9;color:#334155}
  .group{margin:16px 0;padding-top:8px;border-top:2px solid #e5e7eb}
  </style></head><body>`)
  htmlParts.push(`<h1>横版画布差异对比报告</h1><div class="summary">
  <div class="card"><div>变更文件数</div><div style="font-weight:700;font-size:22px">${stats.changed}</div></div>
  <div class="card"><div>新增文件数</div><div style="font-weight:700;font-size:22px">${stats.added}</div></div>
  <div class="card"><div>删除文件数</div><div style="font-weight:700;font-size:22px">${stats.deleted}</div></div>
  <div class="card"><div>代码行差异</div><div style="font-weight:700;font-size:22px">+${stats.addedLines} / -${stats.removedLines}</div></div>
  </div><canvas id="chart" height="120"></canvas>
  <script>const ctx=document.getElementById('chart');new Chart(ctx,{type:'bar',data:{labels:['变更','新增','删除'],datasets:[{label:'文件数',data:[${stats.changed},${stats.added},${stats.deleted}],backgroundColor:['#a7f3d0','#93c5fd','#fecaca']}]}})</script>`)

  report.forEach(gr => {
    htmlParts.push(`<div class="group"><h2>模块：${gr.group}</h2><table class="table"><thead><tr><th>变更</th><th>基线路径</th><th>目标路径</th><th>新增行</th><th>删除行</th></tr></thead><tbody>`)
    gr.items.forEach(it => {
      const badgeCls = it.type === 'added' ? 'added' : it.type === 'deleted' ? 'deleted' : it.type === 'modified' ? 'modified' : 'unchanged'
      const added = it.diff ? it.diff.addedLines : 0
      const removed = it.diff ? it.diff.removedLines : 0
      htmlParts.push(`<tr><td><span class="badge ${badgeCls}">${it.type}</span></td><td>${htmlEscape(it.baseline || '')}</td><td>${htmlEscape(it.target || '')}</td><td>${added}</td><td>${removed}</td></tr>`)
      if (it.diff && !it.diff.same) {
        htmlParts.push(`<tr><td colspan="5"><div class="mono">${htmlEscape(it.diff.patch)}</div>
        <div>API变更：新增(${it.diff.apiAdded.join(', ')}) 删除(${it.diff.apiRemoved.join(', ')})</div></td></tr>`)
      }
    })
    htmlParts.push(`</tbody></table></div>`)
  })

  htmlParts.push(`<div class="group"><h2>依赖差异</h2><table class="table"><thead><tr><th>名称</th><th>基线版本</th><th>目标版本</th></tr></thead><tbody>`)
  deps.deps.forEach(d => { htmlParts.push(`<tr><td>${d.name}</td><td>${htmlEscape(d.baseline||'')}</td><td>${htmlEscape(d.target||'')}</td></tr>`) })
  htmlParts.push(`</tbody></table><h2>开发依赖差异</h2><table class="table"><thead><tr><th>名称</th><th>基线版本</th><th>目标版本</th></tr></thead><tbody>`)
  deps.devs.forEach(d => { htmlParts.push(`<tr><td>${d.name}</td><td>${htmlEscape(d.baseline||'')}</td><td>${htmlEscape(d.target||'')}</td></tr>`) })
  htmlParts.push(`</tbody></table></div>`)

  htmlParts.push(`<div class="group"><h2>配置文件差异</h2>`)
  cfgs.forEach(c => {
    htmlParts.push(`<div class="card"><div><strong>${c.file}</strong>（基线:${c.existsBaseline?'有':'无'} / 目标:${c.existsTarget?'有':'无'}）  行差异: +${c.addedLines} / -${c.removedLines}</div>
    ${c.same ? '<div>无差异</div>' : `<div class="mono">${htmlEscape(c.patch)}</div>`}</div>`)
  })
  htmlParts.push(`</div>`)

  htmlParts.push(`<div class="group"><h2>执行摘要</h2><div class="card">本报告基于仓库内原版横版画布（src/pages/marketing/tasks/horizontal/**）与当前子应用（apps/horizontal-canvas/**）进行文件级别、API导出、依赖与配置差异比对。重大变更包含：
  <ul>
    <li>预览线系统：目标侧存在简化实现，基线包含性能优化与吸附模块；影响拖拽体验与性能。</li>
    <li>事件服务：目标侧已对齐点击区域与空白点击意图；差异可能影响选择器弹出时机。</li>
    <li>端口工厂：目标侧已恢复 fixed-right-y 布局与属性；如视图仍不显示端口，需复核 HorizontalNode 的选择器命名与样式。</li>
  </ul>
  </div></div>`)

  htmlParts.push(`</body></html>`)
  return htmlParts.join('\n')
}

async function main() {
  const report = compareGroups()
  const deps = compareDependencies()
  const cfgs = compareConfigs()
  const stats = { changed: 0, added: 0, deleted: 0, addedLines: 0, removedLines: 0 }
  report.forEach(gr => gr.items.forEach(it => {
    if (it.type === 'modified') stats.changed++
    if (it.type === 'added') stats.added++
    if (it.type === 'deleted') stats.deleted++
    if (it.diff) { stats.addedLines += it.diff.addedLines; stats.removedLines += it.diff.removedLines }
  }))
  const outDir = path.join(repoRoot, 'reports/diff')
  ensureDir(outDir)
  const html = renderHTML(report, deps, cfgs, stats)
  const htmlPath = path.join(outDir, 'index.html')
  fs.writeFileSync(htmlPath, html, 'utf8')
  console.log('HTML generated: reports/diff/index.html')
  // Attempt PDF generation if puppeteer is available
  try {
    const puppeteer = require('puppeteer')
    const browser = await puppeteer.launch({ headless: 'new' })
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })
    await page.pdf({ path: path.join(outDir, 'report.pdf'), format: 'A4', printBackground: true })
    await browser.close()
    console.log('PDF generated: reports/diff/report.pdf')
  } catch (e) {
    console.warn('Puppeteer not available, skipped PDF generation:', e.message)
  }
}

main()

