import { describe, it, expect, beforeEach } from 'vitest'
import {
  submitApproval, approveVersions, withdrawApproval
} from '../../src/utils/approvalService.js'

const STORAGE_KEY = 'horizontal_canvas_tasks'

function readAll() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}
function writeAll(list) { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)) }
function makeTask(id, version, status = 'draft', approvalStatus = null, flow = []) {
  return {
    id: String(id),
    name: `task-${id}`,
    version: Number(version),
    status,
    versions: [{
      version: Number(version),
      status,
      approvalStatus,
      approvalFlow: flow.slice(),
      canvasData: { nodes: [], connections: [] }
    }]
  }
}

describe('approvalService', () => {
  beforeEach(() => { writeAll([]) })

  it('submitApproval: 任务不存在返回 false', () => {
    expect(submitApproval('missing', 1, 'u1')).toBe(false)
  })

  it('submitApproval: 版本不存在返回 false', () => {
    writeAll([makeTask(1, 1)])
    expect(submitApproval('1', 99, 'u1')).toBe(false)
  })

  it('submitApproval: 成功后写入 pending_approval + 任务 status 同步', () => {
    writeAll([makeTask(1, 1)])
    const ok = submitApproval('1', 1, 'user_a', 'initial submission')
    expect(ok).toBe(true)
    const t = readAll()[0]
    expect(t.status).toBe('pending_approval')
    expect(t.versions[0].approvalStatus).toBe('pending_approval')
    const flow = t.versions[0].approvalFlow
    expect(flow.length).toBe(1)
    expect(flow[0]).toMatchObject({ action: 'submit', by: 'user_a', remark: 'initial submission' })
    expect(typeof flow[0].at).toBe('string')
  })

  it('approveVersions: approve 时状态改为 approved', () => {
    writeAll([makeTask(1, 1, 'draft', 'pending_approval', [{ action: 'submit', by: 'u1', at: 't', remark: '' }])])
    const res = approveVersions([{ id: '1', version: 1 }], 'approve', 'reviewer', 'ok')
    expect(res[0].status).toBe('success')
    const t = readAll()[0]
    expect(t.versions[0].approvalStatus).toBe('approved')
    expect(t.status).toBe('approved')
    const last = t.versions[0].approvalFlow[t.versions[0].approvalFlow.length - 1]
    expect(last.action).toBe('approve')
    expect(last.by).toBe('reviewer')
  })

  it('approveVersions: reject 时状态改为 rejected', () => {
    writeAll([makeTask(1, 1, 'draft', 'pending_approval')])
    const res = approveVersions([{ id: '1', version: 1 }], 'reject', 'reviewer', 'no')
    expect(res[0].status).toBe('success')
    const t = readAll()[0]
    expect(t.versions[0].approvalStatus).toBe('rejected')
  })

  it('approveVersions: 非 pending_approval 的项返回 not_pending', () => {
    writeAll([makeTask(1, 1, 'draft', null)])
    const res = approveVersions([{ id: '1', version: 1 }], 'approve', 'r', '')
    expect(res[0].status).toBe('error')
    expect(res[0].message).toBe('not_pending')
  })

  it('approveVersions: 不存在的 id/version 返回错误', () => {
    writeAll([makeTask(1, 1, 'draft', 'pending_approval')])
    const r1 = approveVersions([{ id: 'missing', version: 1 }], 'approve', 'r', '')
    expect(r1[0]).toMatchObject({ status: 'error', message: 'not_found' })
    const r2 = approveVersions([{ id: '1', version: 9 }], 'approve', 'r', '')
    expect(r2[0]).toMatchObject({ status: 'error', message: 'version_not_found' })
  })

  it('approveVersions: 批量部分成功', () => {
    writeAll([makeTask(1, 1, 'draft', 'pending_approval'), makeTask(2, 1, 'draft', 'pending_approval')])
    const res = approveVersions([{ id: '1', version: 1 }, { id: '2', version: 99 }], 'approve', 'r', '')
    expect(res.length).toBe(2)
    expect(res[0].status).toBe('success')
    expect(res[1].status).toBe('error')
  })

  it('withdrawApproval: 清空 approvalStatus 并追加 withdraw 记录', () => {
    writeAll([makeTask(1, 1, 'pending_approval', 'pending_approval', [{ action: 'submit', by: 'u', at: 't', remark: '' }])])
    const ok = withdrawApproval('1', 1, 'u', 'withdraw reason')
    expect(ok).toBe(true)
    const t = readAll()[0]
    expect(t.versions[0].approvalStatus).toBeNull()
    const flow = t.versions[0].approvalFlow
    expect(flow[flow.length - 1]).toMatchObject({ action: 'withdraw', by: 'u', remark: 'withdraw reason' })
  })

  it('withdrawApproval: 任务/版本缺失返回 false', () => {
    writeAll([makeTask(1, 1)])
    expect(withdrawApproval('missing', 1, 'u')).toBe(false)
    expect(withdrawApproval('1', 99, 'u')).toBe(false)
  })
})
/*
用途：approvalService 单元测试
说明：覆盖 submit / approve / withdraw 主路径与错误分支；测试隔离用 writeAll([]) 重置。
边界：直接读写 localStorage 与 TaskStorage 同一份；不测 UI 状态联动。
*/