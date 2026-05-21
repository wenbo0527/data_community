/**
 * 钟离：Vue Router path 格式校验规则
 * 
 * vue-router 4.x 要求所有 route path 必须以 / 开头。
 * tokenizePath 会在 createRouter 初始化时校验，不符合会抛出:
 *   Route paths should start with a "/": "external-data" should be "/external-data"
 * 
 * 此规则检查 router/** 目录下的所有 .ts 文件中的 path 属性。
 */
export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Vue Router path must start with "/"',
      category: 'Possible Errors',
    },
    fixable: null,
    schema: [],
    messages: {
      invalid: "Vue Router path 必须以 / 开头。当前值: '{{ value }}'。正确写法: { path: '/{{ value }}' }。vue-router 4.x tokenizePath 在 createRouter 初始化时会校验，不以 / 开头的 path 会抛出: Route paths should start with a \"/\"."
    }
  },
  create(context) {
    return {
      'Property[key.name="path"]'(node) {
        if (node.value.type !== 'Literal') return
        const value = node.value.value
        if (typeof value !== 'string') return
        // path: '' (empty string, e.g. index route children) is valid
        if (value === '') return
        if (!value.startsWith('/')) {
          context.report({
            node: node.value,
            messageId: 'invalid',
            data: { value }
          })
        }
      }
    }
  }
}
