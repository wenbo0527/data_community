import { getStatusMeta } from '@/constants/status'

export function useStatusMap(dictKey: string) {
  const getColor = (status: string) => getStatusMeta(dictKey, status).color
  const getLabel = (status: string) => getStatusMeta(dictKey, status).label
  const getMeta = (status: string) => getStatusMeta(dictKey, status)
  return { getColor, getLabel, getMeta }
}
