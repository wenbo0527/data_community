// src/mock/tableData.js
var hiveDatabases = [
  "ods",
  "dwd",
  "dws",
  "dim",
  "ads",
  "tmp",
  "backup",
  "test"
];
var dorisDatabases = [
  "doris_ods",
  "doris_dwd",
  "doris_dws",
  "doris_dim",
  "doris_ads",
  "doris_tmp",
  "doris_test"
];
var hiveTables = {
  "ods": [
    "ods_user_info",
    "ods_order_info",
    "ods_product_info",
    "ods_payment_info",
    "ods_log_info",
    "ods_customer_profile",
    "ods_transaction_records",
    "ods_product_catalog"
  ],
  "dwd": [
    "dwd_user_login",
    "dwd_order_detail",
    "dwd_product_click",
    "dwd_payment_record",
    "dwd_user_behavior",
    "dwd_loan_application",
    "dwd_risk_assessment",
    "dwd_fraud_detection"
  ],
  "dws": [
    "dws_user_summary",
    "dws_order_summary",
    "dws_product_summary",
    "dws_user_tag",
    "dws_order_analysis",
    "dws_customer_value",
    "dws_risk_score",
    "dws_fraud_alert"
  ],
  "dim": [
    "dim_user",
    "dim_product",
    "dim_order",
    "dim_time",
    "dim_category",
    "dim_customer",
    "dim_loan_product",
    "dim_geography"
  ],
  "ads": [
    "ads_user_profile",
    "ads_order_analysis",
    "ads_product_hot",
    "ads_user_retention",
    "ads_conversion_rate",
    "ads_customer_segment",
    "ads_loan_approval",
    "ads_fraud_report"
  ],
  "tmp": [
    "tmp_user_analysis",
    "tmp_order_report",
    "tmp_product_stat",
    "tmp_customer_report",
    "tmp_loan_analysis"
  ],
  "backup": [
    "backup_user_2023",
    "backup_order_2023",
    "backup_product_2023",
    "backup_customer_2023",
    "backup_loan_2023"
  ],
  "test": [
    "test_user_data",
    "test_order_data",
    "test_product_data",
    "test_customer_data",
    "test_loan_data"
  ]
};
var dorisTables = {
  "doris_ods": [
    "ods_user_info_doris",
    "ods_order_info_doris",
    "ods_product_info_doris",
    "ods_customer_profile_doris",
    "ods_transaction_records_doris",
    "ods_product_catalog_doris"
  ],
  "doris_dwd": [
    "dwd_user_login_doris",
    "dwd_order_detail_doris",
    "dwd_product_click_doris",
    "dwd_payment_record_doris",
    "dwd_user_behavior_doris",
    "dwd_loan_application_doris",
    "dwd_risk_assessment_doris",
    "dwd_fraud_detection_doris"
  ],
  "doris_dws": [
    "dws_user_summary_doris",
    "dws_order_summary_doris",
    "dws_product_summary_doris",
    "dws_user_tag_doris",
    "dws_order_analysis_doris",
    "dws_customer_value_doris",
    "dws_risk_score_doris",
    "dws_fraud_alert_doris"
  ],
  "doris_dim": [
    "dim_user_doris",
    "dim_product_doris",
    "dim_order_doris",
    "dim_time_doris",
    "dim_category_doris",
    "dim_customer_doris",
    "dim_loan_product_doris",
    "dim_geography_doris"
  ],
  "doris_ads": [
    "ads_user_profile_doris",
    "ads_order_analysis_doris",
    "ads_product_hot_doris",
    "ads_user_retention_doris",
    "ads_conversion_rate_doris",
    "ads_customer_segment_doris",
    "ads_loan_approval_doris",
    "ads_fraud_report_doris"
  ],
  "doris_tmp": [
    "tmp_user_analysis_doris",
    "tmp_order_report_doris",
    "tmp_product_stat_doris",
    "tmp_customer_report_doris",
    "tmp_loan_analysis_doris"
  ],
  "doris_test": [
    "test_user_data_doris",
    "test_order_data_doris",
    "test_product_data_doris",
    "test_customer_data_doris",
    "test_loan_data_doris"
  ]
};
export {
  dorisDatabases,
  dorisTables,
  hiveDatabases,
  hiveTables
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL21vY2svdGFibGVEYXRhLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX2luamVjdGVkX2ZpbGVuYW1lX18gPSBcIi9Vc2Vycy9tYWMvbmlzX21vY2svZGF0YV9jb211bml0eS9kYXRhX2NvbXVuaXR5L3NyYy9tb2NrL3RhYmxlRGF0YS5qc1wiO2NvbnN0IF9faW5qZWN0ZWRfZGlybmFtZV9fID0gXCIvVXNlcnMvbWFjL25pc19tb2NrL2RhdGFfY29tdW5pdHkvZGF0YV9jb211bml0eS9zcmMvbW9ja1wiO2NvbnN0IF9faW5qZWN0ZWRfaW1wb3J0X21ldGFfdXJsX18gPSBcImZpbGU6Ly8vVXNlcnMvbWFjL25pc19tb2NrL2RhdGFfY29tdW5pdHkvZGF0YV9jb211bml0eS9zcmMvbW9jay90YWJsZURhdGEuanNcIjsvLyBcdTg4NjhcdTdCQTFcdTc0MDZcdTc2RjhcdTUxNzNcdTc2ODRtb2NrXHU2NTcwXHU2MzZFXG5cbi8vIEhpdmVcdTVFOTNcdTU0MERtb2NrXHU2NTcwXHU2MzZFXG5leHBvcnQgY29uc3QgaGl2ZURhdGFiYXNlcyA9IFtcbiAgJ29kcycsXG4gICdkd2QnLFxuICAnZHdzJyxcbiAgJ2RpbScsXG4gICdhZHMnLFxuICAndG1wJyxcbiAgJ2JhY2t1cCcsXG4gICd0ZXN0J1xuXTtcblxuLy8gRG9yaXNcdTVFOTNcdTU0MERtb2NrXHU2NTcwXHU2MzZFXG5leHBvcnQgY29uc3QgZG9yaXNEYXRhYmFzZXMgPSBbXG4gICdkb3Jpc19vZHMnLFxuICAnZG9yaXNfZHdkJyxcbiAgJ2RvcmlzX2R3cycsXG4gICdkb3Jpc19kaW0nLFxuICAnZG9yaXNfYWRzJyxcbiAgJ2RvcmlzX3RtcCcsXG4gICdkb3Jpc190ZXN0J1xuXTtcblxuLy8gSGl2ZVx1ODg2OFx1NzkzQVx1NEY4Qlx1NjU3MFx1NjM2RVxuZXhwb3J0IGNvbnN0IGhpdmVUYWJsZXMgPSB7XG4gICdvZHMnOiBbXG4gICAgJ29kc191c2VyX2luZm8nLFxuICAgICdvZHNfb3JkZXJfaW5mbycsXG4gICAgJ29kc19wcm9kdWN0X2luZm8nLFxuICAgICdvZHNfcGF5bWVudF9pbmZvJyxcbiAgICAnb2RzX2xvZ19pbmZvJyxcbiAgICAnb2RzX2N1c3RvbWVyX3Byb2ZpbGUnLFxuICAgICdvZHNfdHJhbnNhY3Rpb25fcmVjb3JkcycsXG4gICAgJ29kc19wcm9kdWN0X2NhdGFsb2cnXG4gIF0sXG4gICdkd2QnOiBbXG4gICAgJ2R3ZF91c2VyX2xvZ2luJyxcbiAgICAnZHdkX29yZGVyX2RldGFpbCcsXG4gICAgJ2R3ZF9wcm9kdWN0X2NsaWNrJyxcbiAgICAnZHdkX3BheW1lbnRfcmVjb3JkJyxcbiAgICAnZHdkX3VzZXJfYmVoYXZpb3InLFxuICAgICdkd2RfbG9hbl9hcHBsaWNhdGlvbicsXG4gICAgJ2R3ZF9yaXNrX2Fzc2Vzc21lbnQnLFxuICAgICdkd2RfZnJhdWRfZGV0ZWN0aW9uJ1xuICBdLFxuICAnZHdzJzogW1xuICAgICdkd3NfdXNlcl9zdW1tYXJ5JyxcbiAgICAnZHdzX29yZGVyX3N1bW1hcnknLFxuICAgICdkd3NfcHJvZHVjdF9zdW1tYXJ5JyxcbiAgICAnZHdzX3VzZXJfdGFnJyxcbiAgICAnZHdzX29yZGVyX2FuYWx5c2lzJyxcbiAgICAnZHdzX2N1c3RvbWVyX3ZhbHVlJyxcbiAgICAnZHdzX3Jpc2tfc2NvcmUnLFxuICAgICdkd3NfZnJhdWRfYWxlcnQnXG4gIF0sXG4gICdkaW0nOiBbXG4gICAgJ2RpbV91c2VyJyxcbiAgICAnZGltX3Byb2R1Y3QnLFxuICAgICdkaW1fb3JkZXInLFxuICAgICdkaW1fdGltZScsXG4gICAgJ2RpbV9jYXRlZ29yeScsXG4gICAgJ2RpbV9jdXN0b21lcicsXG4gICAgJ2RpbV9sb2FuX3Byb2R1Y3QnLFxuICAgICdkaW1fZ2VvZ3JhcGh5J1xuICBdLFxuICAnYWRzJzogW1xuICAgICdhZHNfdXNlcl9wcm9maWxlJyxcbiAgICAnYWRzX29yZGVyX2FuYWx5c2lzJyxcbiAgICAnYWRzX3Byb2R1Y3RfaG90JyxcbiAgICAnYWRzX3VzZXJfcmV0ZW50aW9uJyxcbiAgICAnYWRzX2NvbnZlcnNpb25fcmF0ZScsXG4gICAgJ2Fkc19jdXN0b21lcl9zZWdtZW50JyxcbiAgICAnYWRzX2xvYW5fYXBwcm92YWwnLFxuICAgICdhZHNfZnJhdWRfcmVwb3J0J1xuICBdLFxuICAndG1wJzogW1xuICAgICd0bXBfdXNlcl9hbmFseXNpcycsXG4gICAgJ3RtcF9vcmRlcl9yZXBvcnQnLFxuICAgICd0bXBfcHJvZHVjdF9zdGF0JyxcbiAgICAndG1wX2N1c3RvbWVyX3JlcG9ydCcsXG4gICAgJ3RtcF9sb2FuX2FuYWx5c2lzJ1xuICBdLFxuICAnYmFja3VwJzogW1xuICAgICdiYWNrdXBfdXNlcl8yMDIzJyxcbiAgICAnYmFja3VwX29yZGVyXzIwMjMnLFxuICAgICdiYWNrdXBfcHJvZHVjdF8yMDIzJyxcbiAgICAnYmFja3VwX2N1c3RvbWVyXzIwMjMnLFxuICAgICdiYWNrdXBfbG9hbl8yMDIzJ1xuICBdLFxuICAndGVzdCc6IFtcbiAgICAndGVzdF91c2VyX2RhdGEnLFxuICAgICd0ZXN0X29yZGVyX2RhdGEnLFxuICAgICd0ZXN0X3Byb2R1Y3RfZGF0YScsXG4gICAgJ3Rlc3RfY3VzdG9tZXJfZGF0YScsXG4gICAgJ3Rlc3RfbG9hbl9kYXRhJ1xuICBdXG59O1xuXG4vLyBEb3Jpc1x1ODg2OFx1NzkzQVx1NEY4Qlx1NjU3MFx1NjM2RVxuZXhwb3J0IGNvbnN0IGRvcmlzVGFibGVzID0ge1xuICAnZG9yaXNfb2RzJzogW1xuICAgICdvZHNfdXNlcl9pbmZvX2RvcmlzJyxcbiAgICAnb2RzX29yZGVyX2luZm9fZG9yaXMnLFxuICAgICdvZHNfcHJvZHVjdF9pbmZvX2RvcmlzJyxcbiAgICAnb2RzX2N1c3RvbWVyX3Byb2ZpbGVfZG9yaXMnLFxuICAgICdvZHNfdHJhbnNhY3Rpb25fcmVjb3Jkc19kb3JpcycsXG4gICAgJ29kc19wcm9kdWN0X2NhdGFsb2dfZG9yaXMnXG4gIF0sXG4gICdkb3Jpc19kd2QnOiBbXG4gICAgJ2R3ZF91c2VyX2xvZ2luX2RvcmlzJyxcbiAgICAnZHdkX29yZGVyX2RldGFpbF9kb3JpcycsXG4gICAgJ2R3ZF9wcm9kdWN0X2NsaWNrX2RvcmlzJyxcbiAgICAnZHdkX3BheW1lbnRfcmVjb3JkX2RvcmlzJyxcbiAgICAnZHdkX3VzZXJfYmVoYXZpb3JfZG9yaXMnLFxuICAgICdkd2RfbG9hbl9hcHBsaWNhdGlvbl9kb3JpcycsXG4gICAgJ2R3ZF9yaXNrX2Fzc2Vzc21lbnRfZG9yaXMnLFxuICAgICdkd2RfZnJhdWRfZGV0ZWN0aW9uX2RvcmlzJ1xuICBdLFxuICAnZG9yaXNfZHdzJzogW1xuICAgICdkd3NfdXNlcl9zdW1tYXJ5X2RvcmlzJyxcbiAgICAnZHdzX29yZGVyX3N1bW1hcnlfZG9yaXMnLFxuICAgICdkd3NfcHJvZHVjdF9zdW1tYXJ5X2RvcmlzJyxcbiAgICAnZHdzX3VzZXJfdGFnX2RvcmlzJyxcbiAgICAnZHdzX29yZGVyX2FuYWx5c2lzX2RvcmlzJyxcbiAgICAnZHdzX2N1c3RvbWVyX3ZhbHVlX2RvcmlzJyxcbiAgICAnZHdzX3Jpc2tfc2NvcmVfZG9yaXMnLFxuICAgICdkd3NfZnJhdWRfYWxlcnRfZG9yaXMnXG4gIF0sXG4gICdkb3Jpc19kaW0nOiBbXG4gICAgJ2RpbV91c2VyX2RvcmlzJyxcbiAgICAnZGltX3Byb2R1Y3RfZG9yaXMnLFxuICAgICdkaW1fb3JkZXJfZG9yaXMnLFxuICAgICdkaW1fdGltZV9kb3JpcycsXG4gICAgJ2RpbV9jYXRlZ29yeV9kb3JpcycsXG4gICAgJ2RpbV9jdXN0b21lcl9kb3JpcycsXG4gICAgJ2RpbV9sb2FuX3Byb2R1Y3RfZG9yaXMnLFxuICAgICdkaW1fZ2VvZ3JhcGh5X2RvcmlzJ1xuICBdLFxuICAnZG9yaXNfYWRzJzogW1xuICAgICdhZHNfdXNlcl9wcm9maWxlX2RvcmlzJyxcbiAgICAnYWRzX29yZGVyX2FuYWx5c2lzX2RvcmlzJyxcbiAgICAnYWRzX3Byb2R1Y3RfaG90X2RvcmlzJyxcbiAgICAnYWRzX3VzZXJfcmV0ZW50aW9uX2RvcmlzJyxcbiAgICAnYWRzX2NvbnZlcnNpb25fcmF0ZV9kb3JpcycsXG4gICAgJ2Fkc19jdXN0b21lcl9zZWdtZW50X2RvcmlzJyxcbiAgICAnYWRzX2xvYW5fYXBwcm92YWxfZG9yaXMnLFxuICAgICdhZHNfZnJhdWRfcmVwb3J0X2RvcmlzJ1xuICBdLFxuICAnZG9yaXNfdG1wJzogW1xuICAgICd0bXBfdXNlcl9hbmFseXNpc19kb3JpcycsXG4gICAgJ3RtcF9vcmRlcl9yZXBvcnRfZG9yaXMnLFxuICAgICd0bXBfcHJvZHVjdF9zdGF0X2RvcmlzJyxcbiAgICAndG1wX2N1c3RvbWVyX3JlcG9ydF9kb3JpcycsXG4gICAgJ3RtcF9sb2FuX2FuYWx5c2lzX2RvcmlzJ1xuICBdLFxuICAnZG9yaXNfdGVzdCc6IFtcbiAgICAndGVzdF91c2VyX2RhdGFfZG9yaXMnLFxuICAgICd0ZXN0X29yZGVyX2RhdGFfZG9yaXMnLFxuICAgICd0ZXN0X3Byb2R1Y3RfZGF0YV9kb3JpcycsXG4gICAgJ3Rlc3RfY3VzdG9tZXJfZGF0YV9kb3JpcycsXG4gICAgJ3Rlc3RfbG9hbl9kYXRhX2RvcmlzJ1xuICBdXG59O1xuXG4vLyBcdTg4NjhcdTdCQTFcdTc0MDZcdTk4NzVcdTk3NjJcdTc2ODRcdTZBMjFcdTYyREZcdTg4NjhcdTY1NzBcdTYzNkVcbi8vIFx1NURGMlx1NzlGQlx1ODFGMyBkYXRhLW1hcC5qcyBcdTY1ODdcdTRFRjZcdTRFMkRcdTdFREZcdTRFMDBcdTdCQTFcdTc0MDZcbi8vIGV4cG9ydCBjb25zdCB0YWJsZU1hbmFnZW1lbnREYXRhID0gWy4uLl1cbiJdLAogICJtYXBwaW5ncyI6ICI7QUFHTyxJQUFNLGdCQUFnQjtBQUFBLEVBQzNCO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUNGO0FBR08sSUFBTSxpQkFBaUI7QUFBQSxFQUM1QjtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUNGO0FBR08sSUFBTSxhQUFhO0FBQUEsRUFDeEIsT0FBTztBQUFBLElBQ0w7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsRUFDRjtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0w7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsRUFDRjtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0w7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsRUFDRjtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0w7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsRUFDRjtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0w7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsRUFDRjtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0w7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsRUFDRjtBQUFBLEVBQ0EsVUFBVTtBQUFBLElBQ1I7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsRUFDRjtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ047QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsRUFDRjtBQUNGO0FBR08sSUFBTSxjQUFjO0FBQUEsRUFDekIsYUFBYTtBQUFBLElBQ1g7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLEVBQ0Y7QUFBQSxFQUNBLGFBQWE7QUFBQSxJQUNYO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLEVBQ0Y7QUFBQSxFQUNBLGFBQWE7QUFBQSxJQUNYO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLEVBQ0Y7QUFBQSxFQUNBLGFBQWE7QUFBQSxJQUNYO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLEVBQ0Y7QUFBQSxFQUNBLGFBQWE7QUFBQSxJQUNYO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLEVBQ0Y7QUFBQSxFQUNBLGFBQWE7QUFBQSxJQUNYO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLEVBQ0Y7QUFBQSxFQUNBLGNBQWM7QUFBQSxJQUNaO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLEVBQ0Y7QUFDRjsiLAogICJuYW1lcyI6IFtdCn0K
