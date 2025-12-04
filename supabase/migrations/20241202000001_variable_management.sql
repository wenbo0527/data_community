-- 变量管理数据库表结构
-- 创建变量主表
CREATE TABLE variables (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    type VARCHAR(20) NOT NULL CHECK (type IN ('numerical', 'categorical', 'text', 'datetime', 'boolean')),
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('active', 'deprecated', 'draft')),
    data_type VARCHAR(50),
    length INTEGER,
    precision INTEGER,
    scale INTEGER,
    nullable BOOLEAN DEFAULT true,
    default_value TEXT,
    validation_rule TEXT,
    transformation_rule TEXT,
    business_category VARCHAR(100),
    business_owner VARCHAR(100),
    technical_owner VARCHAR(100),
    quality_score DECIMAL(5,2) DEFAULT 0,
    usage_count INTEGER DEFAULT 0,
    version INTEGER DEFAULT 1,
    parent_id UUID REFERENCES variables(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

-- 创建变量关系表
CREATE TABLE variable_relationships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    source_variable_id UUID NOT NULL REFERENCES variables(id) ON DELETE CASCADE,
    target_variable_id UUID NOT NULL REFERENCES variables(id) ON DELETE CASCADE,
    relationship_type VARCHAR(30) NOT NULL CHECK (relationship_type IN ('depends_on', 'derives_from', 'references', 'transforms_to')),
    relationship_strength DECIMAL(3,2) DEFAULT 1.0,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(100),
    UNIQUE(source_variable_id, target_variable_id, relationship_type)
);

-- 创建变量数据源表
CREATE TABLE variable_data_sources (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    variable_id UUID NOT NULL REFERENCES variables(id) ON DELETE CASCADE,
    source_type VARCHAR(50) NOT NULL CHECK (source_type IN ('database', 'api', 'file', 'stream', 'calculation')),
    source_name VARCHAR(200) NOT NULL,
    source_connection TEXT,
    source_table VARCHAR(200),
    source_field VARCHAR(200),
    source_query TEXT,
    refresh_frequency VARCHAR(20) CHECK (refresh_frequency IN ('real-time', 'hourly', 'daily', 'weekly', 'monthly')),
    last_refresh TIMESTAMP WITH TIME ZONE,
    next_refresh TIMESTAMP WITH TIME ZONE,
    data_quality_score DECIMAL(5,2) DEFAULT 0,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建变量使用场景表
CREATE TABLE variable_usage_scenarios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    variable_id UUID NOT NULL REFERENCES variables(id) ON DELETE CASCADE,
    scenario_name VARCHAR(200) NOT NULL,
    scenario_type VARCHAR(50) NOT NULL CHECK (scenario_type IN ('report', 'dashboard', 'model', 'api', 'analysis', 'alert')),
    scenario_description TEXT,
    application_name VARCHAR(200),
    application_owner VARCHAR(100),
    usage_frequency VARCHAR(20) CHECK (usage_frequency IN ('real-time', 'hourly', 'daily', 'weekly', 'monthly')),
    criticality_level VARCHAR(20) CHECK (criticality_level IN ('low', 'medium', 'high', 'critical')),
    last_accessed TIMESTAMP WITH TIME ZONE,
    access_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建变量版本历史表
CREATE TABLE variable_versions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    variable_id UUID NOT NULL REFERENCES variables(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    change_type VARCHAR(50) NOT NULL CHECK (change_type IN ('create', 'update', 'delete', 'deprecate', 'restore')),
    change_description TEXT,
    change_data JSONB,
    previous_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(100),
    is_current BOOLEAN DEFAULT false
);

-- 创建变量血缘关系表
CREATE TABLE variable_lineage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    variable_id UUID NOT NULL REFERENCES variables(id) ON DELETE CASCADE,
    lineage_type VARCHAR(20) NOT NULL CHECK (lineage_type IN ('upstream', 'downstream')),
    related_entity_id VARCHAR(100) NOT NULL,
    related_entity_name VARCHAR(200),
    related_entity_type VARCHAR(50) CHECK (related_entity_type IN ('variable', 'table', 'calculation', 'aggregation', 'report', 'dashboard', 'model')),
    transformation_logic TEXT,
    confidence_score DECIMAL(3,2) DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建变量质量监控表
CREATE TABLE variable_quality_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    variable_id UUID NOT NULL REFERENCES variables(id) ON DELETE CASCADE,
    metric_date DATE NOT NULL,
    completeness_score DECIMAL(5,2) DEFAULT 0,
    accuracy_score DECIMAL(5,2) DEFAULT 0,
    consistency_score DECIMAL(5,2) DEFAULT 0,
    timeliness_score DECIMAL(5,2) DEFAULT 0,
    validity_score DECIMAL(5,2) DEFAULT 0,
    uniqueness_score DECIMAL(5,2) DEFAULT 0,
    overall_score DECIMAL(5,2) DEFAULT 0,
    total_records BIGINT DEFAULT 0,
    null_records BIGINT DEFAULT 0,
    duplicate_records BIGINT DEFAULT 0,
    invalid_records BIGINT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX idx_variables_code ON variables(code);
CREATE INDEX idx_variables_name ON variables(name);
CREATE INDEX idx_variables_type ON variables(type);
CREATE INDEX idx_variables_status ON variables(status);
CREATE INDEX idx_variables_business_category ON variables(business_category);
CREATE INDEX idx_variables_created_at ON variables(created_at);
CREATE INDEX idx_variables_quality_score ON variables(quality_score);

CREATE INDEX idx_variable_relationships_source ON variable_relationships(source_variable_id);
CREATE INDEX idx_variable_relationships_target ON variable_relationships(target_variable_id);
CREATE INDEX idx_variable_relationships_type ON variable_relationships(relationship_type);

CREATE INDEX idx_variable_data_sources_variable ON variable_data_sources(variable_id);
CREATE INDEX idx_variable_data_sources_type ON variable_data_sources(source_type);

CREATE INDEX idx_variable_usage_scenarios_variable ON variable_usage_scenarios(variable_id);
CREATE INDEX idx_variable_usage_scenarios_type ON variable_usage_scenarios(scenario_type);

CREATE INDEX idx_variable_versions_variable ON variable_versions(variable_id);
CREATE INDEX idx_variable_versions_version ON variable_versions(version_number);
CREATE INDEX idx_variable_versions_created_at ON variable_versions(created_at);

CREATE INDEX idx_variable_lineage_variable ON variable_lineage(variable_id);
CREATE INDEX idx_variable_lineage_type ON variable_lineage(lineage_type);

CREATE INDEX idx_variable_quality_metrics_variable ON variable_quality_metrics(variable_id);
CREATE INDEX idx_variable_quality_metrics_date ON variable_quality_metrics(metric_date);
CREATE INDEX idx_variable_quality_metrics_overall_score ON variable_quality_metrics(overall_score);

-- 创建更新时间的触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为相关表创建更新时间触发器
CREATE TRIGGER update_variables_updated_at BEFORE UPDATE ON variables
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_variable_data_sources_updated_at BEFORE UPDATE ON variable_data_sources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_variable_usage_scenarios_updated_at BEFORE UPDATE ON variable_usage_scenarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_variable_lineage_updated_at BEFORE UPDATE ON variable_lineage
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 创建变量版本管理的触发器函数
CREATE OR REPLACE FUNCTION create_variable_version()
RETURNS TRIGGER AS $$
BEGIN
    -- 获取当前最大版本号
    DECLARE
        max_version INTEGER;
    BEGIN
        SELECT COALESCE(MAX(version_number), 0) INTO max_version
        FROM variable_versions
        WHERE variable_id = NEW.id;
        
        -- 插入新版本记录
        INSERT INTO variable_versions (
            variable_id,
            version_number,
            change_type,
            change_description,
            change_data,
            previous_data,
            created_by,
            is_current
        ) VALUES (
            NEW.id,
            max_version + 1,
            'update',
            '变量更新',
            row_to_json(NEW),
            CASE WHEN max_version > 0 THEN row_to_json(OLD) ELSE NULL END,
            NEW.updated_by,
            true
        );
        
        -- 将之前的版本标记为非当前版本
        UPDATE variable_versions
        SET is_current = false
        WHERE variable_id = NEW.id AND id != (SELECT MAX(id) FROM variable_versions WHERE variable_id = NEW.id);
    END;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为变量表创建版本管理触发器
CREATE TRIGGER create_variable_version_trigger AFTER UPDATE ON variables
    FOR EACH ROW EXECUTE FUNCTION create_variable_version();

-- 设置行级安全策略（RLS）
ALTER TABLE variables ENABLE ROW LEVEL SECURITY;
ALTER TABLE variable_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE variable_data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE variable_usage_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE variable_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE variable_lineage ENABLE ROW LEVEL SECURITY;
ALTER TABLE variable_quality_metrics ENABLE ROW LEVEL SECURITY;

-- 创建基础权限策略
-- 匿名用户（未登录）只能查看活跃的变量
CREATE POLICY "anon_can_view_active_variables" ON variables
    FOR SELECT USING (status = 'active');

-- 认证用户可以查看所有变量
CREATE POLICY "auth_can_view_all_variables" ON variables
    FOR SELECT USING (true);

-- 认证用户可以创建变量
CREATE POLICY "auth_can_create_variables" ON variables
    FOR INSERT WITH CHECK (true);

-- 用户只能更新自己创建的变量（除非有管理员权限）
CREATE POLICY "auth_can_update_own_variables" ON variables
    FOR UPDATE USING (created_by = current_user);

-- 用户只能删除自己创建的变量（除非有管理员权限）
CREATE POLICY "auth_can_delete_own_variables" ON variables
    FOR DELETE USING (created_by = current_user);

-- 为其他表创建类似的权限策略
CREATE POLICY "anon_can_view_active_relationships" ON variable_relationships
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM variables 
            WHERE variables.id = variable_relationships.source_variable_id 
            AND variables.status = 'active'
        )
    );

CREATE POLICY "auth_can_view_all_relationships" ON variable_relationships
    FOR SELECT USING (true);

CREATE POLICY "auth_can_manage_relationships" ON variable_relationships
    FOR ALL USING (true);

-- 授予表权限
GRANT SELECT ON variables TO anon;
GRANT SELECT ON variables TO authenticated;
GRANT INSERT ON variables TO authenticated;
GRANT UPDATE ON variables TO authenticated;
GRANT DELETE ON variables TO authenticated;

GRANT SELECT ON variable_relationships TO anon;
GRANT SELECT ON variable_relationships TO authenticated;
GRANT INSERT ON variable_relationships TO authenticated;
GRANT UPDATE ON variable_relationships TO authenticated;
GRANT DELETE ON variable_relationships TO authenticated;

GRANT SELECT ON variable_data_sources TO anon;
GRANT SELECT ON variable_data_sources TO authenticated;
GRANT INSERT ON variable_data_sources TO authenticated;
GRANT UPDATE ON variable_data_sources TO authenticated;
GRANT DELETE ON variable_data_sources TO authenticated;

GRANT SELECT ON variable_usage_scenarios TO anon;
GRANT SELECT ON variable_usage_scenarios TO authenticated;
GRANT INSERT ON variable_usage_scenarios TO authenticated;
GRANT UPDATE ON variable_usage_scenarios TO authenticated;
GRANT DELETE ON variable_usage_scenarios TO authenticated;

GRANT SELECT ON variable_versions TO anon;
GRANT SELECT ON variable_versions TO authenticated;
GRANT INSERT ON variable_versions TO authenticated;

GRANT SELECT ON variable_lineage TO anon;
GRANT SELECT ON variable_lineage TO authenticated;
GRANT INSERT ON variable_lineage TO authenticated;
GRANT UPDATE ON variable_lineage TO authenticated;
GRANT DELETE ON variable_lineage TO authenticated;

GRANT SELECT ON variable_quality_metrics TO anon;
GRANT SELECT ON variable_quality_metrics TO authenticated;
GRANT INSERT ON variable_quality_metrics TO authenticated;
GRANT UPDATE ON variable_quality_metrics TO authenticated;
GRANT DELETE ON variable_quality_metrics TO authenticated;