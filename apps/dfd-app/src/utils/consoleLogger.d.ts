declare module '@/utils/consoleLogger' {
  export const consoleLogger: {
    info: (message: string, ...args: any[]) => void
    warn: (message: string, ...args: any[]) => void
    error: (message: string, ...args: any[]) => void
    debug: (message: string, ...args: any[]) => void
    group: (groupName: string) => void
    groupEnd: () => void
    table: (data: any) => void
  }
}
