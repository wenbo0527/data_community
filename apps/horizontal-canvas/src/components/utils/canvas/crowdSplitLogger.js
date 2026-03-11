class CrowdSplitLogger {
  constructor() { this.logs = []; this.sessionId = String(Date.now()) }
  _push(level, category, message, extra) { this.logs.push({ level, category, message: typeof message==='string'?message:JSON.stringify(message), extra, timestamp: Date.now() }) }
  debug(c, m, e) { this._push('debug', c, m, e) }
  info(c, m, e) { this._push('info', c, m, e) }
  warn(c, m, e) { this._push('warn', c, m, e) }
  error(c, m, e) { this._push('error', c, m, e) }
  logValidation(isValid, errors, formData) { this._push(isValid?'info':'warn', 'VALIDATION', isValid ? 'valid' : (errors||[]).join(', '), { formData }) }
  logApiCall(url, method, status, time) { this._push('info','API_CALL', `${method} ${url} [${status}]`, { time }) }
  logFormDataChange(title, data) { this._push('debug','FORM_CHANGE', title, { data }) }
  logCrowdSelection(index, id, name) { this._push('info','CROWD_SELECT', `index=${index} id=${id} name=${name}`) }
  logLayerOperation(op, index, extra) { this._push('info','LAYER_OP', `${op} index=${index}`, extra) }
  exportLogs() { return { sessionId: this.sessionId, logs: this.logs } }
  clearLogs() { this.logs = [] }
  getLogSummary() { const s={ debug:0, info:0, warn:0, error:0 }; this.logs.forEach(l=>{ s[l.level]=(s[l.level]||0)+1 }); return { totalLogs: this.logs.length, logsByLevel: s } }
}
export default new CrowdSplitLogger()
