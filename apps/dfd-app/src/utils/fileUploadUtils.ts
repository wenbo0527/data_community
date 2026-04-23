import { ref } from 'vue'
import axios from 'axios'
import * as XLSX from 'xlsx'

export const useFileUpload = () => {
  const isDragover = ref(false)
  const uploadProgress = ref(0)
  const currentFile = ref<File | null>(null)

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    isDragover.value = true
  }

  const handleDragLeave = () => {
    isDragover.value = false
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    isDragover.value = false
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleFileChange = (type: string, event: any, countRef: any) => {
    const file = event.file
    if (file) {
      currentFile.value = file
      console.log(`[${type}上传] 选择的文件:`, file.name, '大小:', file.size, '类型:', file.type)
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer)
          const workbook = XLSX.read(data, { type: 'array' })
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
          const jsonData = XLSX.utils.sheet_to_json(firstSheet)
          console.log(`[${type}上传] 解析成功，共${jsonData.length}条记录`, jsonData.slice(0, 3))
          countRef.value = jsonData.length
        } catch (error) {
          console.error('文件解析失败:', error)
        }
      }
      reader.readAsArrayBuffer(file)
    }
  }

  const handleUpload = async (option: { fileItem: any }, apiUrl: string, countRef: any) => {
    const formData = new FormData()
    formData.append('file', option.fileItem.file as Blob)
    console.log('开始上传文件:', option.fileItem.name)
    try {
      const res = await axios.post<{success: boolean, count: number}>(apiUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      console.log('上传响应:', res.data)
      if (res.data.success) {
        countRef.value = res.data.count
      }
    } catch (error) {
      console.error('上传失败:', error)
    }
    return {
      abort: () => {}
    }
  }

  return {
    isDragover,
    uploadProgress,
    currentFile,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    formatFileSize,
    handleFileChange,
    handleUpload
  }
}

export const downloadTemplate = (type: string) => {
  const link = document.createElement('a')
  link.href = `/templates/metrics-${type}-template.xlsx`
  link.download = `指标${type === 'incremental' ? '增量' : '批量'}导入模板.xlsx`
  link.click()
}