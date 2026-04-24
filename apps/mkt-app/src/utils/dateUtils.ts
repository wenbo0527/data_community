// Re-export from shared-utils (覆盖原实现，保留接口兼容)
import { DateUtils, dateUtils } from '@app/shared-utils'
export { DateUtils, dateUtils }
// @ts-ignore - default export for backward compatibility
const dateUtilsDefault = DateUtils
export default dateUtilsDefault
