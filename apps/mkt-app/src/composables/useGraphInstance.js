export const provideGraphInstance = (graph) => {
  window.__HORIZONTAL_GRAPH__ = graph
}
export const getGraphInstance = () => window.__HORIZONTAL_GRAPH__
