-- 变量管理系统初始数据
-- 插入示例变量数据

-- 插入基础变量
INSERT INTO variables (code, name, description, type, status, data_type, business_category, business_owner, technical_owner, quality_score, usage_count, created_by, updated_by) VALUES
('customer_age', '客户年龄', '客户的年龄信息，用于风险评估和用户画像', 'numerical', 'active', 'INTEGER', '客户信息', '张三', '李四', 95.5, 150, 'system', 'system'),
('customer_gender', '客户性别', '客户的性别信息', 'categorical', 'active', 'VARCHAR(10)', '客户信息', '张三', '李四', 98.2, 145, 'system', 'system'),
('credit_score', '信用评分', '基于客户历史行为计算的信用评分', 'numerical', 'active', 'DECIMAL(10,2)', '风险评估', '王五', '赵六', 92.8, 200, 'system', 'system'),
('loan_amount', '贷款金额', '客户申请的贷款金额', 'numerical', 'active', 'DECIMAL(15,2)', '贷款信息', '王五', '赵六', 99.1, 180, 'system', 'system'),
('application_date', '申请日期', '客户提交申请的日期', 'datetime', 'active', 'TIMESTAMP', '时间信息', '张三', '李四', 100.0, 160, 'system', 'system'),
('is_approved', '是否批准', '贷款申请是否被批准', 'boolean', 'active', 'BOOLEAN', '审批结果', '王五', '赵六', 97.3, 120, 'system', 'system'),
('customer_income', '客户收入', '客户的月收入信息', 'numerical', 'active', 'DECIMAL(12,2)', '财务信息', '张三', '李四', 89.5, 140, 'system', 'system'),
('employment_status', '就业状态', '客户的当前就业状态', 'categorical', 'active', 'VARCHAR(50)', '职业信息', '张三', '李四', 94.7, 135, 'system', 'system'),
('phone_number', '手机号码', '客户的联系手机号码', 'text', 'active', 'VARCHAR(20)', '联系信息', '张三', '李四', 96.8, 125, 'system', 'system'),
('email_address', '邮箱地址', '客户的电子邮箱地址', 'text', 'active', 'VARCHAR(100)', '联系信息', '张三', '李四', 91.2, 110, 'system', 'system'),
('risk_level', '风险等级', '客户的风险评估等级', 'categorical', 'active', 'VARCHAR(20)', '风险评估', '王五', '赵六', 88.9, 190, 'system', 'system'),
('customer_segment', '客户分群', '基于行为特征的客户分群', 'categorical', 'active', 'VARCHAR(50)', '客户分群', '张三', '李四', 85.3, 170, 'system', 'system'),
('monthly_payment', '月还款额', '客户每月需要偿还的金额', 'numerical', 'active', 'DECIMAL(12,2)', '还款信息', '王五', '赵六', 98.5, 155, 'system', 'system'),
('overdue_days', '逾期天数', '客户逾期的天数', 'numerical', 'draft', 'INTEGER', '风险指标', '王五', '赵六', 82.1, 80, 'system', 'system'),
('customer_rating', '客户评级', '综合评级分数', 'numerical', 'deprecated', 'INTEGER', '评级信息', '王五', '赵六', 79.6, 60, 'system', 'system');

-- 插入变量关系数据
INSERT INTO variable_relationships (source_variable_id, target_variable_id, relationship_type, relationship_strength, description, created_by) VALUES
((SELECT id FROM variables WHERE code = 'customer_age'), (SELECT id FROM variables WHERE code = 'credit_score'), 'derives_from', 0.8, '年龄是信用评分的重要因素之一', 'system'),
((SELECT id FROM variables WHERE code = 'customer_income'), (SELECT id FROM variables WHERE code = 'credit_score'), 'derives_from', 0.9, '收入直接影响信用评分', 'system'),
((SELECT id FROM variables WHERE code = 'employment_status'), (SELECT id FROM variables WHERE code = 'customer_income'), 'depends_on', 0.7, '就业状态影响收入水平', 'system'),
((SELECT id FROM variables WHERE code = 'credit_score'), (SELECT id FROM variables WHERE code = 'risk_level'), 'transforms_to', 0.95, '信用评分转换为风险等级', 'system'),
((SELECT id FROM variables WHERE code = 'risk_level'), (SELECT id FROM variables WHERE code = 'is_approved'), 'influences', 0.85, '风险等级影响审批结果', 'system'),
((SELECT id FROM variables WHERE code = 'loan_amount'), (SELECT id FROM variables WHERE code = 'monthly_payment'), 'derives_from', 0.9, '贷款金额决定月还款额', 'system'),
((SELECT id FROM variables WHERE code = 'customer_segment'), (SELECT id FROM variables WHERE code = 'customer_rating'), 'references', 0.6, '客户分群参考综合评级', 'system'),
((SELECT id FROM variables WHERE code = 'overdue_days'), (SELECT id FROM variables WHERE code = 'risk_level'), 'influences', 0.8, '逾期天数影响风险等级评定', 'system');

-- 插入变量数据源数据
INSERT INTO variable_data_sources (variable_id, source_type, source_name, source_table, source_field, refresh_frequency, data_quality_score, is_primary, created_by) VALUES
((SELECT id FROM variables WHERE code = 'customer_age'), 'database', '客户基本信息表', 'customer_profile', 'age', 'daily', 98.5, true, 'system'),
((SELECT id FROM variables WHERE code = 'customer_gender'), 'database', '客户基本信息表', 'customer_profile', 'gender', 'daily', 99.2, true, 'system'),
((SELECT id FROM variables WHERE code = 'credit_score'), 'calculation', '信用评分模型', 'credit_scoring_model', 'score', 'hourly', 92.8, true, 'system'),
((SELECT id FROM variables WHERE code = 'loan_amount'), 'database', '贷款申请表', 'loan_application', 'amount', 'real-time', 100.0, true, 'system'),
((SELECT id FROM variables WHERE code = 'application_date'), 'database', '贷款申请表', 'loan_application', 'apply_date', 'real-time', 100.0, true, 'system'),
((SELECT id FROM variables WHERE code = 'is_approved'), 'database', '审批结果表', 'approval_result', 'is_approved', 'real-time', 97.3, true, 'system'),
((SELECT id FROM variables WHERE code = 'customer_income'), 'database', '客户财务信息表', 'customer_finance', 'monthly_income', 'weekly', 89.5, true, 'system'),
((SELECT id FROM variables WHERE code = 'employment_status'), 'database', '客户职业信息表', 'customer_employment', 'status', 'monthly', 94.7, true, 'system'),
((SELECT id FROM variables WHERE code = 'phone_number'), 'database', '客户联系信息表', 'customer_contact', 'phone', 'daily', 96.8, true, 'system'),
((SELECT id FROM variables WHERE code = 'email_address'), 'database', '客户联系信息表', 'customer_contact', 'email', 'daily', 91.2, true, 'system'),
((SELECT id FROM variables WHERE code = 'risk_level'), 'calculation', '风险评估模型', 'risk_assessment_model', 'risk_level', 'hourly', 88.9, true, 'system'),
((SELECT id FROM variables WHERE code = 'customer_segment'), 'calculation', '客户分群模型', 'customer_segmentation_model', 'segment', 'daily', 85.3, true, 'system'),
((SELECT id FROM variables WHERE code = 'monthly_payment'), 'calculation', '还款计划计算器', 'repayment_calculator', 'monthly_payment', 'daily', 98.5, true, 'system'),
((SELECT id FROM variables WHERE code = 'overdue_days'), 'database', '还款记录表', 'repayment_history', 'overdue_days', 'daily', 82.1, true, 'system');

-- 插入变量使用场景数据
INSERT INTO variable_usage_scenarios (variable_id, scenario_name, scenario_type, application_name, application_owner, usage_frequency, criticality_level, access_count, created_by) VALUES
((SELECT id FROM variables WHERE code = 'customer_age'), '客户年龄分布分析', 'analysis', '客户画像分析系统', '张三', 'daily', 'medium', 45, 'system'),
((SELECT id FROM variables WHERE code = 'credit_score'), '信用评分卡模型', 'model', '信用评分系统', '王五', 'real-time', 'critical', 120, 'system'),
((SELECT id FROM variables WHERE code = 'loan_amount'), '贷款额度审批', 'analysis', '贷款审批系统', '王五', 'real-time', 'critical', 95, 'system'),
((SELECT id FROM variables WHERE code = 'risk_level'), '风险等级评估报告', 'report', '风险管理仪表板', '王五', 'hourly', 'high', 80, 'system'),
((SELECT id FROM variables WHERE code = 'customer_income'), '收入验证流程', 'api', '收入验证服务', '张三', 'real-time', 'high', 65, 'system'),
((SELECT id FROM variables WHERE code = 'customer_segment'), '精准营销推荐', 'model', '营销推荐系统', '张三', 'daily', 'medium', 55, 'system'),
((SELECT id FROM variables WHERE code = 'monthly_payment'), '还款能力评估', 'analysis', '还款能力评估系统', '王五', 'daily', 'high', 70, 'system'),
((SELECT id FROM variables WHERE code = 'overdue_days'), '逾期风险预警', 'alert', '风险预警系统', '王五', 'hourly', 'critical', 40, 'system'),
((SELECT id FROM variables WHERE code = 'application_date'), '申请趋势分析', 'dashboard', '业务趋势仪表板', '张三', 'daily', 'medium', 35, 'system'),
((SELECT id FROM variables WHERE code = 'is_approved'), '审批通过率统计', 'report', '业务统计报告', '王五', 'daily', 'high', 60, 'system');

-- 插入变量版本历史数据
INSERT INTO variable_versions (variable_id, version_number, change_type, change_description, change_data, created_by, is_current) VALUES
((SELECT id FROM variables WHERE code = 'customer_age'), 1, 'create', '初始创建', '{"code": "customer_age", "name": "客户年龄", "type": "numerical", "status": "active"}', 'system', true),
((SELECT id FROM variables WHERE code = 'credit_score'), 1, 'create', '初始创建', '{"code": "credit_score", "name": "信用评分", "type": "numerical", "status": "active"}', 'system', true),
((SELECT id FROM variables WHERE code = 'loan_amount'), 1, 'create', '初始创建', '{"code": "loan_amount", "name": "贷款金额", "type": "numerical", "status": "active"}', 'system', true),
((SELECT id FROM variables WHERE code = 'risk_level'), 1, 'create', '初始创建', '{"code": "risk_level", "name": "风险等级", "type": "categorical", "status": "active"}', 'system', true),
((SELECT id FROM variables WHERE code = 'customer_rating'), 1, 'create', '初始创建', '{"code": "customer_rating", "name": "客户评级", "type": "numerical", "status": "active"}', 'system', false),
((SELECT id FROM variables WHERE code = 'customer_rating'), 2, 'deprecate', '标记为废弃', '{"code": "customer_rating", "name": "客户评级", "type": "numerical", "status": "deprecated"}', 'system', true);

-- 插入变量血缘数据
INSERT INTO variable_lineage (variable_id, lineage_type, related_entity_id, related_entity_name, related_entity_type, transformation_logic, confidence_score, created_by) VALUES
((SELECT id FROM variables WHERE code = 'credit_score'), 'upstream', 'customer_age', '客户年龄', 'variable', '年龄权重系数 * 0.2', 0.85, 'system'),
((SELECT id FROM variables WHERE code = 'credit_score'), 'upstream', 'customer_income', '客户收入', 'variable', '收入权重系数 * 0.3', 0.90, 'system'),
((SELECT id FROM variables WHERE code = 'credit_score'), 'upstream', 'employment_status', '就业状态', 'variable', '就业稳定性权重 * 0.15', 0.75, 'system'),
((SELECT id FROM variables WHERE code = 'risk_level'), 'upstream', 'credit_score', '信用评分', 'variable', '信用评分等级映射', 0.95, 'system'),
((SELECT id FROM variables WHERE code = 'risk_level'), 'upstream', 'overdue_days', '逾期天数', 'variable', '逾期风险权重 * 0.4', 0.80, 'system'),
((SELECT id FROM variables WHERE code = 'monthly_payment'), 'upstream', 'loan_amount', '贷款金额', 'variable', '贷款金额 / 还款期数', 0.90, 'system'),
((SELECT id FROM variables WHERE code = 'is_approved'), 'upstream', 'risk_level', '风险等级', 'variable', '风险等级决策规则', 0.85, 'system'),
((SELECT id FROM variables WHERE code = 'customer_segment'), 'upstream', 'customer_age', '客户年龄', 'variable', '年龄分群规则', 0.70, 'system'),
((SELECT id FROM variables WHERE code = 'customer_segment'), 'upstream', 'customer_income', '客户收入', 'variable', '收入分群规则', 0.75, 'system'),
((SELECT id FROM variables WHERE code = 'customer_age'), 'downstream', 'credit_score', '信用评分', 'variable', '作为信用评分输入', 0.85, 'system'),
((SELECT id FROM variables WHERE code = 'customer_age'), 'downstream', 'customer_segment', '客户分群', 'variable', '作为分群维度', 0.70, 'system'),
((SELECT id FROM variables WHERE code = 'credit_score'), 'downstream', 'risk_level', '风险等级', 'variable', '转换为风险等级', 0.95, 'system'),
((SELECT id FROM variables WHERE code = 'risk_level'), 'downstream', 'is_approved', '是否批准', 'variable', '影响审批决策', 0.85, 'system'),
((SELECT id FROM variables WHERE code = 'loan_amount'), 'downstream', 'monthly_payment', '月还款额', 'variable', '计算还款金额', 0.90, 'system'),
((SELECT id FROM variables WHERE code = 'customer_income'), 'downstream', 'credit_score', '信用评分', 'variable', '作为评分因素', 0.90, 'system'),
((SELECT id FROM variables WHERE code = 'customer_income'), 'downstream', 'customer_segment', '客户分群', 'variable', '作为分群维度', 0.75, 'system');

-- 插入变量质量监控数据
INSERT INTO variable_quality_metrics (variable_id, metric_date, completeness_score, accuracy_score, consistency_score, timeliness_score, validity_score, uniqueness_score, overall_score, total_records, null_records, duplicate_records, invalid_records, created_by) VALUES
((SELECT id FROM variables WHERE code = 'customer_age'), CURRENT_DATE, 99.5, 98.2, 97.8, 96.5, 99.1, 100.0, 98.5, 10000, 50, 0, 120, 'system'),
((SELECT id FROM variables WHERE code = 'credit_score'), CURRENT_DATE, 95.8, 92.1, 94.3, 89.7, 96.2, 100.0, 94.7, 8500, 357, 25, 280, 'system'),
((SELECT id FROM variables WHERE code = 'loan_amount'), CURRENT_DATE, 100.0, 99.5, 98.9, 97.8, 100.0, 100.0, 99.2, 3200, 0, 5, 15, 'system'),
((SELECT id FROM variables WHERE code = 'risk_level'), CURRENT_DATE, 92.3, 88.7, 91.5, 85.2, 93.1, 98.5, 90.2, 8500, 654, 180, 420, 'system'),
((SELECT id FROM variables WHERE code = 'customer_income'), CURRENT_DATE, 89.5, 87.3, 85.9, 82.1, 91.7, 95.8, 88.7, 9800, 1029, 85, 650, 'system'),
((SELECT id FROM variables WHERE code = 'employment_status'), CURRENT_DATE, 94.7, 93.2, 92.8, 89.5, 95.3, 97.2, 95.4, 9800, 519, 35, 280, 'system'),
((SELECT id FROM variables WHERE code = 'phone_number'), CURRENT_DATE, 96.8, 95.4, 94.1, 91.7, 97.2, 99.5, 95.8, 10000, 320, 45, 180, 'system'),
((SELECT id FROM variables WHERE code = 'email_address'), CURRENT_DATE, 91.2, 89.8, 88.5, 85.3, 92.7, 98.9, 91.2, 9500, 836, 125, 420, 'system'),
((SELECT id FROM variables WHERE code = 'monthly_payment'), CURRENT_DATE, 98.5, 97.8, 96.9, 94.2, 99.1, 100.0, 97.7, 2800, 42, 8, 65, 'system'),
((SELECT id FROM variables WHERE code = 'overdue_days'), CURRENT_DATE, 82.1, 79.8, 81.2, 76.5, 84.3, 92.1, 82.6, 1200, 215, 65, 180, 'system');

-- 创建有用的视图
CREATE VIEW variable_overview AS
SELECT 
    v.id,
    v.code,
    v.name,
    v.description,
    v.type,
    v.status,
    v.quality_score,
    v.usage_count,
    v.created_at,
    v.updated_at,
    COUNT(DISTINCT vs.id) as usage_scenario_count,
    COUNT(DISTINCT ds.id) as data_source_count,
    COUNT(DISTINCT vr.id) as relationship_count
FROM variables v
LEFT JOIN variable_usage_scenarios vs ON v.id = vs.variable_id
LEFT JOIN variable_data_sources ds ON v.id = ds.variable_id
LEFT JOIN variable_relationships vr ON v.id = vr.source_variable_id OR v.id = vr.target_variable_id
GROUP BY v.id, v.code, v.name, v.description, v.type, v.status, v.quality_score, v.usage_count, v.created_at, v.updated_at;

CREATE VIEW variable_quality_summary AS
SELECT 
    v.id,
    v.code,
    v.name,
    AVG(qm.completeness_score) as avg_completeness,
    AVG(qm.accuracy_score) as avg_accuracy,
    AVG(qm.consistency_score) as avg_consistency,
    AVG(qm.timeliness_score) as avg_timeliness,
    AVG(qm.validity_score) as avg_validity,
    AVG(qm.uniqueness_score) as avg_uniqueness,
    AVG(qm.overall_score) as avg_overall_score,
    MAX(qm.metric_date) as last_assessed
FROM variables v
LEFT JOIN variable_quality_metrics qm ON v.id = qm.variable_id
GROUP BY v.id, v.code, v.name;

CREATE VIEW variable_lineage_summary AS
SELECT 
    v.id,
    v.code,
    v.name,
    COUNT(CASE WHEN vl.lineage_type = 'upstream' THEN 1 END) as upstream_count,
    COUNT(CASE WHEN vl.lineage_type = 'downstream' THEN 1 END) as downstream_count,
    AVG(CASE WHEN vl.lineage_type = 'upstream' THEN vl.confidence_score END) as avg_upstream_confidence,
    AVG(CASE WHEN vl.lineage_type = 'downstream' THEN vl.confidence_score END) as avg_downstream_confidence
FROM variables v
LEFT JOIN variable_lineage vl ON v.id = vl.variable_id
GROUP BY v.id, v.code, v.name;