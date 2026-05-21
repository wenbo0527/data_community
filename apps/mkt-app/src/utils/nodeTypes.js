export const nodeTypes = {
  start: { label: '开始', color: '#2563eb' },
  end: { label: '结束', color: '#475569' },
  'crowd-split': { label: '人群分流', color: '#dc2626' },
  'event-split': { label: '事件分流', color: '#ef4444' },
  'ab-test': { label: 'AB实验', color: '#b91c1c' },
  sms: { label: '短信', color: '#059669' },
  'ai-call': { label: 'AI外呼', color: '#047857' },
  'manual-call': { label: '人工外呼', color: '#047857' },
  'app-push': { label: 'APP PUSH', color: '#10b981' },
  'wechat-push': { label: '公众号推送', color: '#059669' },
  benefit: { label: '权益', color: '#ea580c' },
  wait: { label: '等待', color: '#7c3aed' }
}

export const getNodeConfig = (t) => nodeTypes[t] || null
export const getNodeLabel = (t) => (nodeTypes[t]?.label || t || '节点')
export const getAllNodeTypes = () => Object.keys(nodeTypes)
