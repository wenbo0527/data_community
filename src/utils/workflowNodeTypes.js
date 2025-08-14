import { IconFile, IconCode, IconExport } from '@arco-design/web-vue/es/icon';

// 节点类型枚举
export const NodeType = {
  INPUT: 'INPUT',         // 数据输入
  PROCESSING: 'PROCESSING', // 数据处理
  OUTPUT: 'OUTPUT'        // 数据输出
};

// 数据处理子类型
export const ProcessingSubType = {
  PYTHON: 'PYTHON',  // Python处理
  SQL: 'SQL'         // SQL处理
};

// 节点图标映射
export const NODE_TYPE_ICON_MAP = {
  [NodeType.INPUT]: IconFile,
  [NodeType.PROCESSING]: IconCode,
  [NodeType.OUTPUT]: IconExport
};

// 元素校验状态
export const CellStatus = {
  DEFAULT: 'default',
  SUCCESS: 'success',
  ERROR: 'error'
};

// 加工类型列表
export const PROCESSING_TYPE_LIST = [
  {
    type: NodeType.INPUT,
    name: '数据输入',
    description: '数据源输入节点',
    icon: 'IconFile',
    color: '#1890ff'
  },
  {
    type: NodeType.PROCESSING,
    subType: ProcessingSubType.PYTHON,
    name: 'Python处理',
    description: '使用Python脚本处理数据',
    icon: 'IconCode',
    color: '#52c41a'
  },
  {
    type: NodeType.PROCESSING,
    subType: ProcessingSubType.SQL,
    name: 'SQL处理',
    description: '使用SQL语句处理数据',
    icon: 'IconCode',
    color: '#fa8c16'
  },
  {
    type: NodeType.OUTPUT,
    name: '数据输出',
    description: '数据结果输出和保存',
    icon: 'IconExport',
    color: '#f5222d'
  }
];

// 不同节点类型的图标URL（使用本地图标或CDN）
export const NODE_TYPE_LOGO = {
  [NodeType.INPUT]: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=data%20input%20icon%20blue%20database%20symbol&image_size=square',
  [NodeType.PROCESSING]: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=data%20processing%20icon%20green%20code%20symbol&image_size=square',
  [NodeType.OUTPUT]: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=output%20icon%20red%20export%20symbol&image_size=square'
};

// 数据处理子类型图标URL
export const PROCESSING_SUBTYPE_LOGO = {
  [ProcessingSubType.PYTHON]: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=python%20programming%20language%20icon%20green%20snake%20symbol&image_size=square',
  [ProcessingSubType.SQL]: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=sql%20database%20query%20icon%20orange%20table%20symbol&image_size=square'
};

/**
 * 根据节点类型获取端口配置
 * @param {string} type 节点类型
 * @param {string} nodeId 节点ID
 * @returns {Array} 端口配置数组
 */
export const getPortsByType = (type, nodeId) => {
  let ports = [];
  
  switch (type) {
    case NodeType.INPUT:
      ports = [
        {
          id: `${nodeId}-out`,
          group: 'out'
        }
      ];
      break;
    case NodeType.OUTPUT:
      ports = [
        {
          id: `${nodeId}-in`,
          group: 'in'
        }
      ];
      break;
    default:
      ports = [
        {
          id: `${nodeId}-in`,
          group: 'in'
        },
        {
          id: `${nodeId}-out`,
          group: 'out'
        }
      ];
      break;
  }
  
  return ports;
};

/**
 * 获取节点类型的显示名称
 * @param {string} type 节点类型
 * @param {string} subType 子类型（可选）
 * @returns {string} 显示名称
 */
export const getNodeTypeName = (type, subType = null) => {
  if (type === NodeType.PROCESSING && subType) {
    const subTypeConfig = getProcessingSubTypeConfig(subType);
    return subTypeConfig.name;
  }
  
  const typeConfig = PROCESSING_TYPE_LIST.find(item => item.type === type && !item.subType);
  return typeConfig?.name || type;
};

/**
 * 获取节点类型的颜色
 * @param {string} type 节点类型
 * @param {string} subType 子类型（可选）
 * @returns {string} 颜色值
 */
export const getNodeTypeColor = (type, subType = null) => {
  if (type === NodeType.PROCESSING && subType) {
    const subTypeConfig = getProcessingSubTypeConfig(subType);
    return subTypeConfig.color;
  }
  
  const typeConfig = PROCESSING_TYPE_LIST.find(item => item.type === type && !item.subType);
  return typeConfig?.color || '#1890ff';
};

/**
 * 获取节点类型的图标组件
 * @param {string} type 节点类型
 * @returns {Component} 图标组件
 */
export const getNodeTypeIcon = (type) => {
  return NODE_TYPE_ICON_MAP[type] || NODE_TYPE_ICON_MAP[NodeType.INPUT];
};

/**
 * 获取节点类型图标名称（用于CSS类名）
 * @param {string} type 节点类型
 * @param {string} subType 子类型（可选）
 * @returns {string} 图标名称
 */
export const getNodeTypeIconName = (type, subType = null) => {
  if (type === NodeType.PROCESSING && subType) {
    const subTypeIconMap = {
      [ProcessingSubType.PYTHON]: 'icon-python',
      [ProcessingSubType.SQL]: 'icon-sql'
    };
    return subTypeIconMap[subType] || 'icon-code';
  }
  
  const iconMap = {
    [NodeType.INPUT]: 'icon-database',
    [NodeType.PROCESSING]: 'icon-code',
    [NodeType.OUTPUT]: 'icon-export'
  };
  return iconMap[type] || 'icon-database';
};

/**
 * 获取数据处理节点的子类型配置
 * @param {string} subType 子类型
 * @returns {Object} 子类型配置
 */
export const getProcessingSubTypeConfig = (subType) => {
  const configs = {
    [ProcessingSubType.PYTHON]: {
      name: 'Python处理',
      description: '使用Python脚本处理数据',
      color: '#52c41a',
      defaultCode: '# Python数据处理代码\n# 输入数据: input_data\n# 输出数据: output_data\n\noutput_data = input_data'
    },
    [ProcessingSubType.SQL]: {
      name: 'SQL处理',
      description: '使用SQL语句处理数据',
      color: '#fa8c16',
      defaultCode: '-- SQL数据处理语句\n-- 输入表: input_table\n-- 输出表: output_table\n\nSELECT * FROM input_table;'
    }
  };
  return configs[subType] || configs[ProcessingSubType.PYTHON];
};