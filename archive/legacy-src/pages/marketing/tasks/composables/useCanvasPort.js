import { nextTick } from 'vue'
import { useGraphInstance } from './useGraphInstance.js'

/**
 * 统一注册左右端口组及连接规则
 * 仅适用于横版流程，out 端口固定在右，in 端口固定在左
 */
export function useCanvasPort() {
  const { graph } = useGraphInstance()

  const registerPortLayout = () => {
    if (!graph.value) return
    // 右侧 out 端口组
    graph.value.addPortLayout('fixed-right-y', {
      position: 'right',
      args: { dy: 0 } // 由组件 DOM 中心自动推导，dy 不再手工计算
    })
    // 左侧 in 端口组
    graph.value.addPortLayout('fixed-left-y', {
      position: 'left',
      args: { dy: 0 }
    })
  }

  const registerConnectionValidation = () => {
    if (!graph.value) return
    graph.value.setConnectionValidator(({ sourcePort, targetPort }) => {
      // 仅允许 out→in 方向连接，且禁止自环
      const srcGroup = sourcePort?.group
      const tgtGroup = targetPort?.group
      const srcNode = sourcePort?.cell
      const tgtNode = targetPort?.cell
      return srcGroup === 'out' && tgtGroup === 'in' && srcNode !== tgtNode
    })
  }

  /**
   * 将业务节点数据转换为 X6 节点项，自动挂载左右端口
   * @param {Array} nodes 原始节点数组
   * @returns {Array} X6 节点项数组
   */
  const buildX6Items = (nodes) => {
    return nodes.map(n => {
      const ports = []
      // in 端口：除开始节点外，统一在左侧
      if (n.type !== 'start') {
        ports.push({
          id: `${n.id}--in`,
          group: 'in',
          args: { x: 0, y: 0 } // 具体坐标由 InPort 组件 DOM 中心覆盖
        })
      }
      // out 端口：除结果节点外，根据分支数量在右侧自上而下排列
      if (n.type !== 'result' && n.branches?.length) {
        n.branches.forEach((b, i) => {
          ports.push({
            id: `${n.id}--out--${i}`,
            group: 'out',
            args: { x: 0, y: 0 } // 具体坐标由 OutPort 组件 DOM 中心覆盖
          })
        })
      }
      return {
        id: n.id,
        shape: 'vue-shape',
        component: 'BaseNode', // 统一外壳
        x: n.x ?? 0,
        y: n.y ?? 0,
        width: 180,
        height: 120, // 先给默认，后续可动态测量
        ports
      }
    })
  }

  /**
   * 等待 DOM 渲染完成后，重新计算所有端口中心并同步到 X6
   * 供画布初始化或节点增删后调用
   */
  const refreshPortPositions = async () => {
    await nextTick()
    if (!graph.value) return
    const nodes = graph.value.getNodes()
    nodes.forEach(node => {
      const ports = node.getPorts()
      ports.forEach(p => {
        const el = document.querySelector(`[data-port-id="${p.id}"]`)
        if (!el) return
        const { x, y, width, height } = el.getBoundingClientRect()
        node.setPortProp(p.id, 'args', {
          x: x + width / 2,
          y: y + height / 2
        })
      })
    })
  }

  return {
    registerPortLayout,
    registerConnectionValidation,
    buildX6Items,
    refreshPortPositions
  }
}