// Docs local API
export const getDocBySlug = (slug: string) => Promise.resolve({})
export const saveDoc = (data: any) => Promise.resolve({})
export const getCategoryTree = () => Promise.resolve([])
export const listDocs = () => Promise.resolve({ list: [], total: 0 })
export const deleteDoc = (id: string) => Promise.resolve({})

export type CategoryNode = { id: string; name: string; children?: CategoryNode[] }
