/** 基础信息接口，用于配置数据产品的基本参数
 * @interface BasicInfo
 * @property {string} name - 数据产品名称
 * @property {string} cacheTime - 缓存时间
 * @property {number | null} days - 总天数
 * @property {number | null} periods - 总期数
 * @property {string} description - 产品描述
 * @property {number[]} periodDays - 各期天数配置
 */
export interface BasicInfo {
  name: string;
  cacheTime: string;
  days: number | null;
  periods: number | null;
  description: string;
  periodDays: number[];
}

/** 场景配置接口，用于定义数据产品在不同场景下的使用情况
 * @interface Scene
 * @property {string} sceneValue - 场景唯一标识
 * @property {string} sceneName - 场景显示名称
 * @property {number} amount - 场景分配条数
 * @property {number} ratio - 场景分配比例
 * @property {number} totalAmount - 场景总可分配条数
 * @property {number} allocatedAmount - 已分配条数
 * @property {number} remainingAmount - 剩余可分配条数
 * @property {number} weeklyAvgAmount - 近7天日均样本量
 * @property {string} weeklyAvgRatio - 近7天日均样本占比
 * @property {string} submissionRatio - 进件占比
 * @property {CreditProductAllocation[]} creditProducts - 信贷产品分配配置
 */
export interface Scene {
  sceneValue: string;
  sceneName: string;
  amount: number;
  ratio: number;
  totalAmount: number;
  allocatedAmount: number;
  remainingAmount: number;
  weeklyAvgAmount: number;
  weeklyAvgRatio: string;
  submissionRatio: string;
  creditProducts?: CreditProductAllocation[];
}

/** 信贷配置接口，用于管理信贷产品及其场景配置
 * @interface CreditConfig
 * @property {string} creditProduct - 信贷产品标识
 * @property {Scene[]} scenes - 场景配置列表
 */
export interface CreditConfig {
  creditProduct: string;
  scenes: Scene[];
}

/** 信贷产品分配接口，用于定义信贷产品在特定场景的分配情况
 * @interface CreditProductAllocation
 * @property {string} creditProductValue - 信贷产品唯一标识
 * @property {string} creditProductName - 信贷产品名称
 * @property {number} amount - 分配条数
 * @property {number} recommendedAmount - 推荐分配条数
 * @property {number} weeklyRatio - 近7天日均样本占比
 * @property {number} submissionRatio - 进件占比
 * @property {number} totalRatio - 陪跑总量占比
 * @property {string} dataProductId - 数据产品ID
 * @property {string} sceneValue - 场景标识
 */
export interface CreditProductAllocation {
  creditProductValue: string;
  creditProductName: string;
  amount: number;
  recommendedAmount: number;
  weeklyRatio: number;
  submissionRatio: number;
  totalRatio: number;
  dataProductId: string;
  sceneValue: string;
  sceneValueAmount?: number;
}

/** 期数配置接口，用于定义数据产品的分期信息
 * @interface Period
 * @property {number} days - 天数
 * @property {number} count - 数量
 * @property {number} ratio - 比率
 * @property {number} dailyAmount - 日均金额
 * @property {Object} discount - 折扣信息
 * @property {('none' | 'discount' | 'free')} discount.type - 折扣类型
 * @property {number} discount.value - 折扣值
 * @property {number} cost - 成本
 */
export interface Period {
  days: number;
  count: number;
  ratio: number;
  dailyAmount: number;
  discount: {
    type: 'none' | 'discount' | 'free';
    value: number;
  };
  cost: number;
}

/** 数据产品接口，用于定义完整的数据产品信息
 * @interface DataProduct
 * @property {string} id - 数据产品ID
 * @property {string} name - 数据产品名称
 * @property {number} totalAmount - 总金额
 * @property {Record<string, number>} sceneRatios - 场景比率配置
 * @property {Period[]} periods - 期数配置列表
 * @property {Scene[]} scenes - 场景配置列表
 */
export interface DataProduct {
  id: string;
  name: string;
  totalAmount: number;
  sceneRatios: Record<string, number>;
  periods: Period[];
  scenes?: Scene[];
}

/** 表单数据接口，用于管理整体配置信息
 * @interface FormData
 * @property {string} workId - 工作ID
 * @property {BasicInfo} basic - 基础信息
 * @property {string[]} creditProducts - 信贷产品列表
 * @property {DataProduct[]} dataProducts - 数据产品列表
 */
export interface FormData {
  workId: string;
  basic: BasicInfo;
  creditProducts: string[];
  dataProducts: DataProduct[];
}
