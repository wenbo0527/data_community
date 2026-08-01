/**
 * 任务审批流（提交 / 审批 / 撤回）
 * 说明：所有写入直接落到 localStorage 中与 TaskStorage 同一份列表；保持单一数据源。
 * 边界：审批通过不改变任务 status（仅维护 approvalStatus/approvalFlow）；publishTask 用于发布。
 */

const KEY = 'horizontal_canvas_tasks'

function readAll() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '[]')
    return Array.isArray(raw) ? raw : []
  } catch { return [] }
}
function writeAll(list) {
  localStorage.setItem(KEY, JSON.stringify(list))
}

/**
 * 提交审批
 * 入参：id、version、user、remark
 * 返回：boolean 是否成功
 * 副作用：版本 approvalStatus=pending_approval；任务 status=pending_approval；approvalFlow 追加一条 submit
 */
export function submitApproval(id, version, user, remark) {
  const list = readAll()
  const idx = list.findIndex(t => String(t.id) === String(id))
  if (idx < 0) return false
  const t = list[idx]
  const vIdx = (t.versions || []).findIndex(v => Number(v.version) === Number(version))
  if (vIdx < 0) return false
  const v = t.versions[vIdx]
  const flow = Array.isArray(v.approvalFlow) ? v.approvalFlow.slice() : []
  flow.push({ action: 'submit', by: String(user || ''), at: new Date().toISOString(), remark: String(remark || '') })
  t.versions[vIdx] = { ...v, approvalStatus: 'pending_approval', approvalFlow: flow }
  t.status = 'pending_approval'
  writeAll(list)
  return true
}

/**
 * 批量审批
 * 入参：items([{id,version}]), decision('approve'|'reject'), user, remark
 * 返回：Array<{ id, version, status: 'success'|'error', message? }>
 * 副作用：每个版本 approvalStatus=approved/rejected；任务 status 同步；approvalFlow 追加一条
 */
export function approveVersions(items, decision, user, remark) {
  const list = readAll()
  const dec = decision === 'reject' ? 'rejected' : 'approved'
  const res = []
  items.forEach(it => {
    const idx = list.findIndex(t => String(t.id) === String(it.id))
    if (idx < 0) { res.push({ id: it.id, version: it.version, status: 'error', message: 'not_found' }); return }
    const t = list[idx]
    const vIdx = (t.versions || []).findIndex(v => Number(v.version) === Number(it.version))
    if (vIdx < 0) { res.push({ id: it.id, version: it.version, status: 'error', message: 'version_not_found' }); return }
    const v = t.versions[vIdx]
    if (v.approvalStatus !== 'pending_approval') { res.push({ id: it.id, version: it.version, status: 'error', message: 'not_pending' }); return }
    const flow = Array.isArray(v.approvalFlow) ? v.approvalFlow.slice() : []
    flow.push({ action: dec === 'approved' ? 'approve' : 'reject', by: String(user || ''), at: new Date().toISOString(), remark: String(remark || '') })
    t.versions[vIdx] = { ...v, approvalStatus: dec, approvalFlow: flow }
    t.status = dec
    res.push({ id: it.id, version: it.version, status: 'success' })
  })
  writeAll(list)
  return res
}

/**
 * 撤回审批
 * 入参：id、version、user、remark
 * 返回：boolean 是否成功
 * 副作用：版本 approvalStatus=null；approvalFlow 追加一条 withdraw
 */
export function withdrawApproval(id, version, user, remark) {
  const list = readAll()
  const idx = list.findIndex(t => String(t.id) === String(id))
  if (idx < 0) return false
  const t = list[idx]
  const vIdx = (t.versions || []).findIndex(v => Number(v.version) === Number(version))
  if (vIdx < 0) return false
  const v = t.versions[vIdx]
  const flow = Array.isArray(v.approvalFlow) ? v.approvalFlow.slice() : []
  flow.push({ action: 'withdraw', by: String(user || ''), at: new Date().toISOString(), remark: String(remark || '') })
  t.versions[vIdx] = { ...v, approvalStatus: null, approvalFlow: flow }
  writeAll(list)
  return true
}
/*
用途：任务审批流（提交 / 审批 / 撤回）
说明：从原 taskStorage.js 拆分；保持直接读写 localStorage 与 TaskStorage 同一份数据。
边界：审批通过不会自动发布；发布请走 TaskStorage.publishTask；本服务不校验角色权限。
*/