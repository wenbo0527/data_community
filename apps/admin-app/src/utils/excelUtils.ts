// Excel utility functions
export function exportToExcel(data: any[], filename: string): void {
  console.log('Export to Excel:', filename, data.length)
}

export function importFromExcel(file: File): Promise<any[]> {
  return Promise.resolve([])
}

export function generateExcelTemplate(category: string): void {
  console.log('Generate Excel template for:', category)
}

export default { exportToExcel, importFromExcel, generateExcelTemplate }
