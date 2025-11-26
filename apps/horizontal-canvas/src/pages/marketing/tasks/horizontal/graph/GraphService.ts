export type GraphLike = any

export function create(container: HTMLElement, options: any): GraphLike {
  return null
}

export function zoomIn(graph: GraphLike): void {}
export function zoomOut(graph: GraphLike): void {}
export function zoomTo(graph: GraphLike, scale: number): void {}
export function centerContent(graph: GraphLike): void {}
export function toggleMinimap(graph: GraphLike, container: HTMLElement | null, visible: boolean, options: any = {}): void {}

export function addNode(graph: GraphLike, spec: any): any { return null }
export function removeNode(graph: GraphLike, id: string): void {}
export function addEdge(graph: GraphLike, spec: any): any { return null }
export function removeEdge(graph: GraphLike, id: string): void {}
export function deleteNodeCascade(graph: GraphLike, id: string): void {}
export function bindConnectionPolicies(graph: GraphLike, policies: any): void {}

