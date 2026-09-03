/**
 * 演示控制台开关
 * 关闭某个开关 → stateEngine 对应动作会注入失败
 *
 * 通过 DemoFlags.set({ oaDown: true }) 注入失败
 */

const STORAGE_KEY = 'MIDLOAN_DEMO_FLAGS'

let flags: any = {}

function load() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (raw) flags = JSON.parse(raw)
    else flags = {}
  } catch (_) {
    flags = {}
  }
}

function persist() {
  try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(flags)) } catch (_) {}
}

load()

export const DemoFlags = {
  get() {
    return {
      oaDown: flags.oaDown ?? false,
      internalDown: flags.internalDown ?? false,
      variableDown: flags.variableDown ?? false,
      dwDown: flags.dwDown ?? false
    }
  },
  set(patch: any) {
    flags = { ...flags, ...patch }
    persist()
  },
  /** 检测：OA 系统是否故障 */
  isOADown: () => flags.oaDown ?? false,
  /** 检测：内数 API 是否故障 */
  isInternalDown: () => flags.internalDown ?? false,
  /** 检测：特征中心是否故障 */
  isVariableDown: () => flags.variableDown ?? false,
  /** 检测：数仓任务是否故障 */
  isDwDown: () => flags.dwDown ?? false
}