// 简化版SVG矩阵与CTM的polyfill，供X6在jsdom环境下运行
// 仅用于测试环境，不能用于生产

const identityMatrix = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }

// createSVGMatrix polyfill
;(window as any).SVGSVGElement = (window as any).SVGSVGElement || (window as any).SVGElement || (window as any).Element
if (!(window as any).SVGSVGElement.prototype.createSVGMatrix) {
  (window as any).SVGSVGElement.prototype.createSVGMatrix = function () {
    return { ...identityMatrix }
  }
}

// getCTM polyfill
(window as any).SVGGraphicsElement = (window as any).SVGGraphicsElement || (window as any).SVGElement || (window as any).Element
if (!(window as any).SVGGraphicsElement.prototype.getCTM) {
  (window as any).SVGGraphicsElement.prototype.getCTM = function () {
    return { ...identityMatrix }
  }
}

// 兼容直接访问 viewport.getCTM 的场景
(window as any).SVGElement = (window as any).SVGElement || (window as any).Element
if (!(window as any).SVGElement.prototype.getCTM) {
  (window as any).SVGElement.prototype.getCTM = function () {
    return { ...identityMatrix }
  }
}