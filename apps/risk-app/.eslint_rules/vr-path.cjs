/**
 * Vue Router path 格式校验
 *
 * vue-router 4.x 要求：
 * - 根级 route path 必须以 / 开头（除空字符串 '' 索引路由外）
 * - children 内的 route path 应使用相对路径（无前导 /）
 *
 * 检测逻辑：遍历 AST，通过 ObjectExpression → ArrayExpression 嵌套关系
 * 判断 path 属性属于根级路由还是 children 内部。
 */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Vue Router path format validation (root must start with /, children must not)',
      category: 'Possible Errors',
    },
    fixable: null,
    schema: [],
    messages: {
      rootMissingSlash: "Vue Router 根级 path 必须以 / 开头。当前: \"{{ value }}\" → 正确: \"/{{ value }}\"。vue-router 4.x tokenizePath 要求根级路由 path 必须以 / 开头。",
      childHasSlash: "Vue Router children 内的 path 不应以 / 开头（应使用相对路径）。当前: \"/{{ value }}\" → 正确: \"{{ value }}\"。"
    }
  },
  create(context) {
    function findAncestors(node, maxDepth = 10) {
      const ancestors = []
      let current = node.parent
      let depth = 0
      while (current && depth < maxDepth) {
        ancestors.push(current)
        current = current.parent
        depth++
      }
      return ancestors
    }

    function isRootRoute(node) {
      // path: 'xxx' — parent is Property (key=path, value=xxx)
      // parent.parent is the route ObjectExpression
      const prop = node.parent && node.parent.type === 'Property' ? node.parent : null
      if (!prop) return false
      const routeObj = prop.parent
      if (!routeObj || routeObj.type !== 'ObjectExpression') return false

      // 这个 route Object 必须是顶层 routes 数组的直接元素
      // 即 routes[...ArrayElements] 中的某个元素
      // 其 parent 应该是 ArrayExpression
      // 该 ArrayExpression 的 parent 应该是 Program 或某个 VariableDeclarator/Property

      const arrayExpr = routeObj.parent
      if (!arrayExpr || arrayExpr.type !== 'ArrayExpression') return false
      const arrayParent = arrayExpr.parent

      // 顶层情况：Program → VariableDeclaration → VariableDeclarator → init = ArrayExpression
      // 或者直接是 ReturnStatement/ArrowFunctionExpression 的数组
      // 只要这个数组不在另一个 route 对象的 children 属性内就行
      if (arrayParent && arrayParent.type === 'ObjectExpression') {
        // 这个数组可能是某个 route 的 children 数组
        // 检查父 Object 是否是 route（有 path 属性）
        const parentObj = arrayParent
        const parentPathProp = parentObj.properties.find(
          p => p.type === 'Property' && p.key.name === 'path'
        )
        if (parentPathProp) return false // 是 children，不是 root
      }

      return true
    }

    return {
      Property(node) {
        if (node.key.type !== 'Identifier' || node.key.name !== 'path') return
        if (node.value.type !== 'Literal') return
        const value = node.value.value
        if (typeof value !== 'string') return

        const ancestors = findAncestors(node)
        const ancestorsTypes = ancestors.map(a => a.type)

        // children 数组的父 ObjectExpression 是 Route 对象
        // children 数组的父是 Property { key: 'children', value: [...] }
        // children Property 的父是 Route Object
        const inChildren = ancestorsTypes.includes('ObjectExpression') &&
          ancestors.some(a => a.type === 'Property' && a.key.name === 'children')

        if (inChildren) {
          if (value.startsWith('/')) {
            context.report({
              node: node.value,
              messageId: 'childHasSlash',
              data: { value: value.substring(1) }
            })
          }
        } else {
          // 根级路由：必须以 / 开头（'' 是索引路由，允许）
          if (value !== '' && !value.startsWith('/')) {
            context.report({
              node: node.value,
              messageId: 'rootMissingSlash',
              data: { value }
            })
          }
        }
      }
    }
  }
}
