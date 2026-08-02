import StartNodeConfigDrawer from './StartNodeConfigDrawer.vue'
import CrowdSplitNodeConfigDrawer from './CrowdSplitNodeConfigDrawer.vue'
import EventSplitNodeConfigDrawer from './EventSplitNodeConfigDrawer.vue'
import ABTestNodeConfigDrawer from './ABTestNodeConfigDrawer.vue'
import AICallNodeConfigDrawer from './AICallNodeConfigDrawer.vue'
import AppPushNodeConfigDrawer from './AppPushNodeConfigDrawer.vue'
import WechatPushNodeConfigDrawer from './WechatPushNodeConfigDrawer.vue'
import SMSNodeConfigDrawer from './SMSNodeConfigDrawer.vue'
import ManualCallNodeConfigDrawer from './ManualCallNodeConfigDrawer.vue'
import WaitNodeConfigDrawer from './WaitNodeConfigDrawer.vue'
import BenefitNodeConfigDrawer from './BenefitNodeConfigDrawer.vue'

export type DrawerKey =
  | 'start' | 'crowd-split' | 'event-split' | 'ab-test'
  | 'ai-call' | 'sms' | 'manual-call' | 'app-push' | 'wechat-push'
  | 'wait' | 'benefit'

// 节点类型 → 配置抽屉组件（新增节点类型时只需在此登记）
export const CONFIG_DRAWER_REGISTRY: Record<DrawerKey, any> = {
  start: StartNodeConfigDrawer,
  'crowd-split': CrowdSplitNodeConfigDrawer,
  'event-split': EventSplitNodeConfigDrawer,
  'ab-test': ABTestNodeConfigDrawer,
  'ai-call': AICallNodeConfigDrawer,
  sms: SMSNodeConfigDrawer,
  'manual-call': ManualCallNodeConfigDrawer,
  'app-push': AppPushNodeConfigDrawer,
  'wechat-push': WechatPushNodeConfigDrawer,
  wait: WaitNodeConfigDrawer,
  benefit: BenefitNodeConfigDrawer
}

export const DRAWER_KEYS = Object.keys(CONFIG_DRAWER_REGISTRY) as DrawerKey[]
/*
用途：抽屉注册表（节点类型 → 配置抽屉组件）
说明：新增节点类型时，只需在 CONFIG_DRAWER_REGISTRY 增加一条记录；TaskFlowConfigDrawers 会自动渲染对应抽屉。
边界：不包含抽屉的打开/关闭状态；状态由 useConfigDrawers 的 drawerStates 管理，键集合需与 DRAWER_KEYS 保持一致。
*/