import { storeToRefs } from 'pinia'
import { useTableRegistrationStore } from '@/stores/tagSystem/tableRegistration'

export const useTableRegistration = () => {
  const store = useTableRegistrationStore()
  const { tableSchema, validation, loading } = storeToRefs(store)

  const loadTableSchema = (dataSourceId: string, tableName: string) => store.loadTableSchema(dataSourceId, tableName)
  const checkPrimaryKey = (fields: string[]) => store.checkPrimaryKey(fields)
  const registerTable = (payload: any) => store.registerTable(payload)

  return { tableSchema, validation, loading, loadTableSchema, checkPrimaryKey, registerTable }
}

