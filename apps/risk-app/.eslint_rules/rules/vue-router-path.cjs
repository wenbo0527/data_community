/**
 * 钟离：Vue Router path 格式校验规则
 * vue-router 4.x 要求所有 route path 必须以 / 开头。
 * tokenizePath 在 createRouter 初始化时校验，不符合抛出:
 *   Route paths should start with a "/": "external-data" should be "/external-data"
 */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Vue Router path must start with "/"',
      category: 'Possible Errors',
    },
    fixable: null,
    schema: [],
    messages: {
      invalidPath: "Vue Router path 必须以 / 开头。当前: '{{ value }}'。正确: { path: '/{{ value }}' }。vue-router 4.x tokenizePath 在 createRouter 初始化时会校验此格式。"
    }
  },
  create(context) {
    function checkNode(node) {
      if (node.key.type !== 'Identifier' || node.key.name !== 'path') return
      if (node.value.type !== 'Literal') return
      const value = node.value.value
      if (typeof value !== 'string') return
      if (value === '') return  // path: '' (index child route) is valid
      if (!value.startsWith('/')) {
        context.report({ node: node.value, messageId: 'invalidPath', data: { value } })
      }
    }
    return {
      Property: checkNode
    }
  }
}
