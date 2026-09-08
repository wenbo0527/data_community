/**
 * 字段权限工具
 */
export function useFieldPermission() {
  return {
    canRead(field: string, sensitivity: string): boolean {
      if (sensitivity === 'L3') return false
      return true
    },
    canWrite(field: string): boolean {
      return false
    },
    requiresApproval(field: string, sensitivity: string): boolean {
      return sensitivity === 'L3'
    }
  }
}

export default useFieldPermission