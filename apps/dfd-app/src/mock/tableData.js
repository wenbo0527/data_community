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
    'ods_log_info',
    'ods_customer_profile',
    'ods_transaction_records',
    'ods_product_catalog'
  ],
  'dwd': [
    'dwd_user_login',
    'dwd_order_detail',
    'dwd_product_click',
    'dwd_payment_record',
    'dwd_user_behavior',
    'dwd_loan_application',
    'dwd_risk_assessment',
    'dwd_fraud_detection'
  ],
  'dws': [
    'dws_user_summary',
    'dws_order_summary',
    'dws_product_summary',
    'dws_user_tag',
    'dws_order_analysis',
    'dws_customer_value',
    'dws_risk_score',
    'dws_fraud_alert'
  ],
  'dim': [
    'dim_user',
    'dim_product',
    'dim_order',
    'dim_time',
    'dim_category',
    'dim_customer',
    'dim_loan_product',
    'dim_geography'
  ],
  'ads': [
    'ads_user_profile',
    'ads_order_analysis',
    'ads_product_hot',
    'ads_user_retention',
    'ads_conversion_rate',
    'ads_customer_segment',
    'ads_loan_approval',
    'ads_fraud_report'
  ],
  'tmp': [
    'tmp_user_analysis',
    'tmp_order_report',
    'tmp_product_stat',
    'tmp_customer_report',
    'tmp_loan_analysis'
  ],
  'backup': [
    'backup_user_2023',
    'backup_order_2023',
    'backup_product_2023',
    'backup_customer_2023',
    'backup_loan_2023'
  ],
  'test': [
    'test_user_data',
    'test_order_data',
    'test_product_data',
    'test_customer_data',
    'test_loan_data'
  ]
};

// Doris表示例数据
export const dorisTables = {
  'doris_ods': [
    'ods_user_info_doris',
    'ods_order_info_doris',
    'ods_product_info_doris',
    'ods_customer_profile_doris',
    'ods_transaction_records_doris',
    'ods_product_catalog_doris'
  ],
  'doris_dwd': [
    'dwd_user_login_doris',
    'dwd_order_detail_doris',
    'dwd_product_click_doris',
    'dwd_payment_record_doris',
    'dwd_user_behavior_doris',
    'dwd_loan_application_doris',
    'dwd_risk_assessment_doris',
    'dwd_fraud_detection_doris'
  ],
  'doris_dws': [
    'dws_user_summary_doris',
    'dws_order_summary_doris',
    'dws_product_summary_doris',
    'dws_user_tag_doris',
    'dws_order_analysis_doris',
    'dws_customer_value_doris',
    'dws_risk_score_doris',
    'dws_fraud_alert_doris'
  ],
  'doris_dim': [
    'dim_user_doris',
    'dim_product_doris',
    'dim_order_doris',
    'dim_time_doris',
    'dim_category_doris',
    'dim_customer_doris',
    'dim_loan_product_doris',
    'dim_geography_doris'
  ],
  'doris_ads': [
    'ads_user_profile_doris',
    'ads_order_analysis_doris',
    'ads_product_hot_doris',
    'ads_user_retention_doris',
    'ads_conversion_rate_doris',
    'ads_customer_segment_doris',
    'ads_loan_approval_doris',
    'ads_fraud_report_doris'
  ],
  'doris_tmp': [
    'tmp_user_analysis_doris',
    'tmp_order_report_doris',
    'tmp_product_stat_doris',
    'tmp_customer_report_doris',
    'tmp_loan_analysis_doris'
  ],
  'doris_test': [
    'test_user_data_doris',
    'test_order_data_doris',
    'test_product_data_doris',
    'test_customer_data_doris',
    'test_loan_data_doris'
  ]
};

// 表管理页面的模拟表数据
// 已移至 data-map.js 文件中统一管理
// export const tableManagementData = [...]
