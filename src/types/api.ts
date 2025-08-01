export interface ResponseData<T> {
  data: T
  message?: string
  code?: number
}

export interface ErrorType {
  message: string
  code?: number
}