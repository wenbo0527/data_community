// dataModels API
export const getDataModelsList = () => Promise.resolve([])
export const getDataModelDetail = () => Promise.resolve({})
export const createDataModel = () => Promise.resolve({})
export const updateDataModel = () => Promise.resolve({})
export const executeDataModel = () => Promise.resolve({})
export const getExecutionHistory = () => Promise.resolve([])
export const copyDataModel = () => Promise.resolve({})
export const deleteDataModel = () => Promise.resolve({})
export const saveDraft = () => Promise.resolve({})
export default {
  getDataModelsList,
  getDataModelDetail,
  createDataModel,
  updateDataModel,
  executeDataModel,
  getExecutionHistory,
  copyDataModel,
  deleteDataModel,
  saveDraft
}
