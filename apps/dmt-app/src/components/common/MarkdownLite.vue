<template>
  <div class="markdown-lite">
    <template v-for="(node, idx) in parsed" :key="idx">
      <!-- 标题 -->
      <h1 v-if="node.type === 'h1'" class="md-h1">{{ node.text }}</h1>
      <h2 v-else-if="node.type === 'h2'" class="md-h2">{{ node.text }}</h2>
      <h3 v-else-if="node.type === 'h3'" class="md-h3">{{ node.text }}</h3>
      <h4 v-else-if="node.type === 'h4'" class="md-h4">{{ node.text }}</h4>

      <!-- 代码块 -->
      <pre v-else-if="node.type === 'code'" class="md-code">{{ node.text }}</pre>

      <!-- 列表 -->
      <ul v-else-if="node.type === 'ul'" class="md-ul">
        <li v-for="(item, i) in node.items" :key="i">{{ item }}</li>
      </ul>

      <!-- 段落（包含 inline 标记） -->
      <p
        v-else-if="node.type === 'p'"
        class="md-p"
        v-html="renderInline(node.text)"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
/**
 * 极简 Markdown 渲染器
 * 支持：标题 (# ## ### ####)、段落、列表 (- xxxx)、代码块 (```)
 * 行内：加粗 (**...**)、行内代码 (`...`)
 * 不支持：表格、链接、图片（够用即可）
 */
import { computed } from 'vue'

const props = defineProps<{ source: string }>()

type Node =
  | { type: 'h1' | 'h2' | 'h3' | 'h4'; text: string }
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'code'; text: string }

const parsed = computed<Node[]>(() => {
  const lines = props.source.replace(/\r\n/g, '\n').split('\n')
  const result: Node[] = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]

    // 跳过空行
    if (!line.trim()) {
      i += 1
      continue
    }

    // 代码块（```...```）
    if (/^```/.test(line)) {
      const codeLines: string[] = []
      i += 1
      while (i < lines.length && !/^```/.test(lines[i])) {
        codeLines.push(lines[i])
        i += 1
      }
      i += 1 // 跳过结尾 ```
      result.push({ type: 'code', text: codeLines.join('\n') })
      continue
    }

    // 标题
    const h4 = /^####\s+(.+)/.exec(line)
    const h3 = /^###\s+(.+)/.exec(line)
    const h2 = /^##\s+(.+)/.exec(line)
    const h1 = /^#\s+(.+)/.exec(line)
    if (h1) { result.push({ type: 'h1', text: h1[1] }); i += 1; continue }
    if (h2) { result.push({ type: 'h2', text: h2[1] }); i += 1; continue }
    if (h3) { result.push({ type: 'h3', text: h3[1] }); i += 1; continue }
    if (h4) { result.push({ type: 'h4', text: h4[1] }); i += 1; continue }

    // 列表（以 - 开头）
    if (/^- /.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^- /.test(lines[i])) {
        items.push(lines[i].replace(/^- /, ''))
        i += 1
      }
      result.push({ type: 'ul', items })
      continue
    }

    // 段落：累积相邻非空、非特殊起始的行
    const buf: string[] = [line]
    i += 1
    while (i < lines.length && lines[i].trim() && !/^(#{1,4}\s|```|- |\s*$)/.test(lines[i])) {
      buf.push(lines[i])
      i += 1
    }
    result.push({ type: 'p', text: buf.join(' ') })
  }
  return result
})

/**
 * 行内标记：
 * - **xxx** → <strong>
 * - `xxx` → <code>
 */
const renderInline = (text: string) => {
  const escape = (s: string) => s.replace(/</g, '&lt;').replace(/>/g, '&gt;')
  let html = escape(text)
  // **text**
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  // `text`
  html = html.replace(/`([^`]+)`/g, '<code class="md-inline-code">$1</code>')
  return html
}
</script>

<style scoped>
.markdown-lite {
  color: var(--color-text-1);
  font-size: 14px;
  line-height: 1.7;
}
.md-h1 {
  font-size: 22px;
  font-weight: 600;
  margin: 16px 0 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--color-border-2);
}
.md-h2 {
  font-size: 18px;
  font-weight: 600;
  margin: 24px 0 10px;
}
.md-h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 18px 0 8px;
}
.md-h4 {
  font-size: 14px;
  font-weight: 600;
  margin: 14px 0 6px;
  color: var(--color-text-2);
}
.md-p {
  margin: 8px 0;
}
.md-p:first-child {
  margin-top: 0;
}
.md-ul {
  padding-left: 22px;
  margin: 8px 0;
  list-style-type: disc;
}
.md-ul li {
  margin: 4px 0;
}
.md-code {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 12px 16px;
  border-radius: 4px;
  font-family: 'JetBrains Mono', Consolas, Menlo, monospace;
  font-size: 12.5px;
  line-height: 1.5;
  overflow-x: auto;
  margin: 10px 0;
  white-space: pre-wrap;
}
:deep(.md-inline-code) {
  background: #f2f3f5;
  color: #5b5c63;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'JetBrains Mono', Consolas, Menlo, monospace;
  font-size: 12.5px;
}
:deep(strong) {
  color: #165dff;
  font-weight: 600;
}
</style>
