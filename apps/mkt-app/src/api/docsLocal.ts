import { marked } from 'marked'

type Frontmatter = { 
  title?: string; 
  description?: string; 
  contentFormat?: 'markdown' | 'html';
  [k: string]: any 
}

const files = (import.meta as any).glob('../../.trae/documents/**/*.md', { as: 'raw', eager: true }) as Record<string, string>

const dynamicDocs = new Map<string, string>()

// Pre-populate with some mock data if empty for demonstration
const initMockData = () => {
  if (dynamicDocs.size > 0) return
  
  const mockDocs = [
    {
      slug: 'indicator-system-overview',
      title: '指标体系建设概览',
      category: '资产管理/指标体系',
      description: '介绍如何构建企业级的指标体系',
      content: '# 指标体系建设概览\n\n指标体系是衡量业务发展的重要工具...'
    },
    {
      slug: 'data-standard-guide',
      title: '数据标准制定指南',
      category: '资产管理/数据标准',
      description: '数据标准化的基本流程与规范',
      content: '# 数据标准制定指南\n\n规范化的数据标准能够有效降低沟通成本...'
    },
    {
      slug: 'security-policy-2026',
      title: '2026年度安全审计规范',
      category: '安全合规/审计规范',
      description: '最新的年度安全审计要求',
      content: '# 2026年度安全审计规范\n\n请各部门按照以下规范进行自查...'
    }
  ]

  mockDocs.forEach(doc => {
    const fm = [
      '---',
      `title: "${doc.title}"`,
      `category: "${doc.category}"`,
      `description: "${doc.description}"`,
      'contentFormat: "markdown"',
      '---',
      '',
      doc.content
    ].join('\n')
    dynamicDocs.set(doc.slug, fm)
  })
}

try {
  const saved = localStorage.getItem('mock_dynamic_docs')
  if (saved) {
    const parsed = JSON.parse(saved)
    Object.keys(parsed).forEach(k => dynamicDocs.set(k, parsed[k]))
  }
  initMockData()
} catch (e) { console.error(e) }

const persist = () => {
  try {
    const obj = Object.fromEntries(dynamicDocs)
    localStorage.setItem('mock_dynamic_docs', JSON.stringify(obj))
  } catch (e) { console.error(e) }
}

const slugify = (s: string) => s.toLowerCase().trim()

const parseFrontmatter = (md: string): { fm: Frontmatter; body: string } => {
  if (md.startsWith('---')) {
    const end = md.indexOf('\n---', 3)
    if (end !== -1) {
      const raw = md.slice(3, end).trim()
      const body = md.slice(end + 4)
      const fm: Frontmatter = {}
      raw.split('\n').forEach((line) => {
        const idx = line.indexOf(':')
        if (idx > 0) {
          const key = line.slice(0, idx).trim()
          const val = line.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '')
          fm[key] = val
        }
      })
      return { fm, body }
    }
  }
  return { fm: {}, body: md }
}

export type DocSummary = { 
  slug: string; 
  title: string; 
  description?: string;
  categoryPath?: string[];
}

export type CategoryNode = {
  title: string;
  value: string;
  key: string;
  children?: CategoryNode[];
}

export const listDocs = async (): Promise<DocSummary[]> => {
  const map = new Map<string, DocSummary>()

  // 1. Static files
  Object.keys(files).forEach((p) => {
    // Extract path relative to documents root
    // p is like '../../.trae/documents/subfolder/file.md'
    const parts = p.split('/')
    const docRootIdx = parts.indexOf('documents')
    let categoryPath: string[] = []
    if (docRootIdx !== -1 && parts.length > docRootIdx + 2) {
      categoryPath = parts.slice(docRootIdx + 1, parts.length - 1)
    }

    const name = (parts.pop() || '').replace(/\.md$/i, '')
    const content = files[p] || ''
    const { fm, body } = parseFrontmatter(content)
    let title = fm.title || ''
    if (!title) {
      const firstLine = body.split('\n')[0] || ''
      if (firstLine.startsWith('# ')) title = firstLine.slice(2).trim()
      else title = name
    }
    const s = slugify(name)
    const item: DocSummary = { slug: s, title, categoryPath }
    if (typeof fm.description === 'string') {
      item.description = fm.description
    }
    map.set(s, item)
  })

  // 2. Dynamic docs
  dynamicDocs.forEach((content, slug) => {
    const { fm, body } = parseFrontmatter(content)
    let title = fm.title || ''
    if (!title) {
      const firstLine = body.split('\n')[0] || ''
      if (firstLine.startsWith('# ')) title = firstLine.slice(2).trim()
      else title = slug
    }
    
    let categoryPath: string[] = []
    if (fm.categoryPath && Array.isArray(fm.categoryPath)) {
      categoryPath = fm.categoryPath
    } else if (fm.category) {
      categoryPath = String(fm.category).split('/')
    }

    const item: DocSummary = { slug, title, categoryPath }
    if (typeof fm.description === 'string') {
      item.description = fm.description
    }
    map.set(slug, item)
  })

  const res = Array.from(map.values())
  res.sort((a, b) => a.title.localeCompare(b.title))
  return res
}

export const getDocBySlug = async (slug: string): Promise<{ 
  html: string; 
  md: string; 
  fm: Frontmatter; 
  title: string;
  contentFormat: 'markdown' | 'html';
}> => {
  const s = slugify(slug)
  let raw = ''

  if (dynamicDocs.has(s)) {
    raw = dynamicDocs.get(s)!
  } else {
    const entry = Object.keys(files).find((p) => {
      const name = (p.split('/').pop() || '').replace(/\.md$/i, '')
      return slugify(name) === s
    })
    if (entry) raw = files[entry]!
  }
  
  const { fm, body } = parseFrontmatter(raw || '')
  let title = fm.title || ''
  if (!title) {
    const firstLine = body.split('\n')[0] || ''
    if (firstLine.startsWith('# ')) title = firstLine.slice(2).trim()
    else title = slug
  }

  const contentFormat = fm.contentFormat || 'markdown'
  const html = contentFormat === 'html' ? body : marked.parse(body) as unknown as string
  
  return { html, md: body, fm, title, contentFormat }
}

export const saveDoc = async (slug: string, content: string) => {
  dynamicDocs.set(slugify(slug), content)
  persist()
}

export const deleteDoc = async (slug: string) => {
  dynamicDocs.delete(slugify(slug))
  persist()
}

export const searchDocs = async (keyword: string): Promise<DocSummary[]> => {
  const list = await listDocs()
  const kw = keyword.toLowerCase()
  return list.filter((d) => d.title.toLowerCase().includes(kw) || (d.description || '').toLowerCase().includes(kw))
}

export const getCategoryTree = async (): Promise<CategoryNode[]> => {
  const docs = await listDocs()
  const root: CategoryNode[] = []

  docs.forEach((doc) => {
    if (!doc.categoryPath || doc.categoryPath.length === 0) return
    
    let currentLevel = root
    doc.categoryPath.forEach((folder, index) => {
      const path = doc.categoryPath!.slice(0, index + 1).join('/')
      let node = currentLevel.find((n) => n.title === folder)
      if (!node) {
        node = {
          title: folder,
          value: path,
          key: path,
          children: []
        }
        currentLevel.push(node)
      }
      currentLevel = node.children!
    })
  })

  // Sort categories alphabetically
  const sortNodes = (nodes: CategoryNode[]) => {
    nodes.sort((a, b) => a.title.localeCompare(b.title))
    nodes.forEach((n) => {
      if (n.children && n.children.length > 0) {
        sortNodes(n.children)
      } else {
        delete n.children
      }
    })
  }
  sortNodes(root)

  return root
}
