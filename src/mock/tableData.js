// 表管理相关的mock数据

// Hive库名mock数据
export const hiveDatabases = [
  'ods',
  'dwd',
  'dws',
  'dim',
  'ads',
  'tmp',
  'backup',
  'test'
];

// Doris库名mock数据
export const dorisDatabases = [
  'doris_ods',
  'doris_dwd',
  'doris_dws',
  'doris_dim',
  'doris_ads',
  'doris_tmp',
  'doris_test'
];

// Hive表示例数据
export const hiveTables = {
  'ods': [
    'ods_user_info',
    'ods_order_info',
    'ods_product_info',
    'ods_payment_info',
    'ods_log_info'
  ],
  'dwd': [
    'dwd_user_login',
    'dwd_order_detail',
    'dwd_product_click',
    'dwd_payment_record',
    'dwd_user_behavior'
  ],
  'dws': [
    'dws_user_summary',
    'dws_order_summary',
    'dws_product_summary',
    'dws_user_tag',
    'dws_order_analysis'
  ],
  'dim': [
    'dim_user',
    'dim_product',
    'dim_order',
    'dim_time',
    'dim_category'
  ],
  'ads': [
    'ads_user_profile',
    'ads_order_analysis',
    'ads_product_hot',
    'ads_user_retention',
    'ads_conversion_rate'
  ],
  'tmp': [
    'tmp_user_analysis',
    'tmp_order_report',
    'tmp_product_stat'
  ],
  'backup': [
    'backup_user_2023',
    'backup_order_2023',
    'backup_product_2023'
  ],
  'test': [
    'test_user_data',
    'test_order_data',
    'test_product_data'
  ]
};

// Doris表示例数据
export const dorisTables = {
  'doris_ods': [
    'ods_user_info_doris',
    'ods_order_info_doris',
    'ods_product_info_doris'
  ],
  'doris_dwd': [
    'dwd_user_login_doris',
    'dwd_order_detail_doris',
    'dwd_product_click_doris'
  ],
  'doris_dws': [
    'dws_user_summary_doris',
    'dws_order_summary_doris',
    'dws_product_summary_doris'
  ],
  'doris_dim': [
    'dim_user_doris',
    'dim_product_doris',
    'dim_order_doris'
  ],
  'doris_ads': [
    'ads_user_profile_doris',
    'ads_order_analysis_doris',
    'ads_product_hot_doris'
  ],
  'doris_tmp': [
    'tmp_user_analysis_doris',
    'tmp_order_report_doris'
  ],
  'doris_test': [
    'test_user_data_doris',
    'test_order_data_doris'
  ]
};
