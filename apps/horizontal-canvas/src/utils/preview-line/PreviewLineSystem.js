export class PreviewLineSystem {
  constructor(opts = {}) {
    this.graph = opts.graph || null
  }
  async init() {
    return true
  }
  updateLayoutDirection() {}
}
export default PreviewLineSystem
