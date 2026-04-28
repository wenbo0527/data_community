/**
 * 钟离：Vue Router path 格式校验规则
 * 
 * vue-router 4.x 要求：
 * - 根级 route path 必须以 / 开头（如 { path: '/external-data' }）
 * - children 内的 route path 应使用相对路径（无前导 /）
 * 
 * 错误示例（根级缺 /）: { path: 'external-data' }
 * 正确示例（根级有 /）: { path: '/external-data' }
 */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Vue Router path must start with "/" for root routes',
      category: 'Possible Errors',
    },
    fixable: null,
    schema: [],
    messages: {
      rootPathMissingSlash: "Vue Router 根级 path 必须以 / 开头。当前: \"{{ value }}\"。正确: { path: \"/{{ value }}\" }。vue-router 4.x tokenizePath 要求根级路由 path 必须以 / 开头。",
      childPathHasSlash: "Vue Router children 内的 path 不应以 / 开头（应使用相对路径）。当前: \"{{ value }}\"。正确: { path: \"{{ relValue }}\" }。"
    }
  },
  create(context) {
    return {
      Property(node) {
        if (node.key.type !== 'Identifier' || node.key.name !== 'path') return
        if (node.value.type !== 'Literal') return
        const value = node.value.value
        if (typeof value !== 'string') return

        // Determine if this path is at root level (direct child of routes array)
        // or inside a children array
        function isInChildren(node) {
          let obj = node.parent
          while (obj) {
            if (obj.type === 'ArrayExpression') {
              // Check if this array is the 'children' property of a route object
              const arrayParent = obj.parent
              if (arrayParent && arrayParent.type === 'ObjectExpression') {
                const prop = arrayParent.properties.find(
                  p => p.type === 'Property' && p.key.name === 'children'
                )
                if (prop && prop.value === obj) return true
              }
            }
            obj = obj.parent
          }
          return false
        }

        const inChildren = isInChildren(node)

        if (inChildren) {
          // children 内的 path 不应以 / 开头
          if (value.startsWith('/')) {
            context.report({
              node: node.value,
              messageId: 'childPathHasSlash',
              data: { value, relValue: value.substring(1) }
            })
          }
        } else {
          // 根级 path 必须以 / 开头
          if (value !== '' && !value.startsWith('/')) {
            context.report({
              node: node.value,
              messageId: 'rootPathMissingSlash',
              data: { value }
            })
          }
        }
      }
    }
  }
}
