export const getRiskAppOrigin = () => {
  const envUrl = (import.meta as any)?.env?.VITE_RISK_APP_URL
  if (typeof envUrl === 'string' && envUrl.trim()) return envUrl.replace(/\/+$/, '')
  return 'http://localhost:5176'
}

export const buildRiskAppUrl = (path: string) => {
  const origin = getRiskAppOrigin()
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${origin}${normalizedPath}`
}

