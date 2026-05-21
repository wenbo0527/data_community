export const processSteps = [
    {
        name: '注册',
        description: '用户首次进入系统，完成基本信息注册',
        icon: 'icon-user-add',
        tables: [
            {
                name: 'user_register',
                description: '用户注册信息表',
                usage: '用于记录用户注册信息，可分析注册渠道转化率和用户增长趋势。',
                type: 'table',
                owner: '张三',
                fields: [
                    { name: 'user_id', type: 'string', description: '用户ID', usage: '用户唯一标识' },
                    { name: 'register_time', type: 'timestamp', description: '注册时间', usage: '记录用户注册时间' },
                    { name: 'register_channel', type: 'string', description: '注册渠道', usage: '记录用户注册来源渠道' },
                    { name: 'invite_code', type: 'string', description: '邀请码', usage: '记录用户邀请码信息' }
                ],
                metrics: [
                    { name: '日注册量', description: '每日新增注册用户数', formula: 'count(distinct user_id)', unit: '人', owner: '张三' },
                    { name: '渠道转化率', description: '各渠道注册成功率', formula: 'count(success)/count(total)', unit: '%', owner: '张三' }
                ]
            },
            {
                name: 'user_device',
                description: '用户设备信息表',
                usage: '存储用户设备信息，可用于分析用户设备分布和版本兼容性。',
                type: 'table',
                owner: '李四',
                fields: [
                    { name: 'device_id', type: 'string', description: '设备ID', usage: '用户设备唯一标识' },
                    { name: 'device_type', type: 'string', description: '设备类型', usage: '记录用户设备类型' },
                    { name: 'os_version', type: 'string', description: '操作系统版本', usage: '记录设备操作系统版本' },
                    { name: 'app_version', type: 'string', description: 'APP版本', usage: '记录APP版本号' }
                ],
                metrics: [
                    { name: '设备类型分布', description: '各设备类型用户占比', formula: 'count(device_type)/count(total)', unit: '%', owner: '李四' },
                    { name: 'APP版本覆盖率', description: '最新版本APP使用率', formula: 'count(latest_version)/count(total)', unit: '%', owner: '李四' }
                ]
            }
        ]
    },
    {
        name: '实名',
        description: '用户完成身份认证和银行卡绑定',
        icon: 'icon-idcard',
        tables: [
            {
                name: 'user_auth',
                description: '用户实名认证表',
                usage: '用于记录用户实名认证信息，可分析实名认证转化率和通过率。',
                type: 'table',
                owner: '王五',
                fields: [
                    { name: 'user_id', type: 'string', description: '用户ID', usage: '用户唯一标识' },
                    { name: 'real_name', type: 'string', description: '真实姓名', usage: '用户实名认证姓名' },
                    { name: 'id_card', type: 'string', description: '身份证号', usage: '用户身份证号码' },
                    { name: 'auth_time', type: 'timestamp', description: '认证时间', usage: '记录实名认证时间' }
                ],
                metrics: [
                    { name: '实名认证率', description: '完成实名认证的用户占比', formula: 'count(distinct auth_user)/count(distinct total_user)', unit: '%', owner: '王五' },
                    { name: '认证通过率', description: '实名认证通过的比例', formula: 'count(success)/count(total)', unit: '%', owner: '王五' }
                ]
            },
            {
                name: 'user_bankcard',
                description: '用户银行卡信息表',
                usage: '存储用户银行卡绑定信息，可用于分析银行卡绑定率和银行分布。',
                type: 'table',
                owner: '赵六',
                fields: [
                    { name: 'card_id', type: 'string', description: '银行卡ID', usage: '银行卡唯一标识' },
                    { name: 'bank_name', type: 'string', description: '银行名称', usage: '记录银行名称' },
                    { name: 'card_type', type: 'string', description: '卡类型', usage: '记录银行卡类型' },
                    { name: 'bind_time', type: 'timestamp', description: '绑定时间', usage: '记录银行卡绑定时间' }
                ],
                metrics: [
                    { name: '银行卡绑定率', description: '完成银行卡绑定的用户占比', formula: 'count(distinct bind_user)/count(distinct total_user)', unit: '%', owner: '赵六' },
                    { name: '主流银行占比', description: '主要银行卡绑定占比', formula: 'count(main_banks)/count(total_cards)', unit: '%', owner: '赵六' }
                ]
            }
        ]
    },
    {
        name: '授信',
        description: '评估用户资质，确定授信额度',
        icon: 'icon-file-protection',
        tables: [
            {
                name: 'credit_apply',
                description: '授信申请记录表',
                usage: '用于记录用户授信申请信息，可分析授信申请转化率和申请金额分布。',
                type: 'table',
                owner: '孙七',
                fields: [
                    { name: 'apply_id', type: 'string', description: '申请ID', usage: '授信申请唯一标识' },
                    { name: 'user_id', type: 'string', description: '用户ID', usage: '用户唯一标识' },
                    { name: 'apply_amount', type: 'decimal', description: '申请金额', usage: '记录授信申请金额' },
                    { name: 'apply_time', type: 'timestamp', description: '申请时间', usage: '记录授信申请时间' }
                ],
                metrics: [
                    { name: '授信申请率', description: '注册用户中申请授信的比例', formula: 'count(distinct apply_user)/count(distinct register_user)', unit: '%', owner: '孙七' },
                    { name: '平均申请金额', description: '授信申请平均金额', formula: 'avg(apply_amount)', unit: '元', owner: '孙七' }
                ]
            },
            {
                name: 'credit_result',
                description: '授信结果表',
                usage: '用于记录用户授信审批结果，可分析授信通过率和额度分布。',
                type: 'table',
                owner: '周八',
                fields: [
                    { name: 'apply_id', type: 'string', description: '申请ID', usage: '授信申请唯一标识' },
                    { name: 'credit_score', type: 'integer', description: '信用评分', usage: '记录用户信用评分' },
                    { name: 'credit_limit', type: 'decimal', description: '授信额度', usage: '记录用户授信额度' },
                    { name: 'result_time', type: 'timestamp', description: '审批时间', usage: '记录授信审批时间' }
                ],
                metrics: [
                    { name: '授信通过率', description: '授信申请通过的比例', formula: 'count(approved)/count(total_apply)', unit: '%', owner: '周八' },
                    { name: '平均授信额度', description: '授信通过用户的平均额度', formula: 'avg(credit_limit)', unit: '元', owner: '周八' }
                ]
            }
        ]
    },
    {
        name: '支用',
        description: '用户申请借款，签订借款合同',
        icon: 'icon-money',
        tables: [
            {
                name: 'loan_apply',
                description: '借款申请记录表',
                usage: '用于记录用户借款申请信息，可分析借款申请转化率和金额分布。',
                type: 'table',
                fields: [
                    { name: 'loan_id', type: 'string', description: '借款ID', usage: '借款唯一标识' },
                    { name: 'user_id', type: 'string', description: '用户ID', usage: '用户唯一标识' },
                    { name: 'loan_amount', type: 'decimal', description: '借款金额', usage: '记录借款金额' },
                    { name: 'loan_term', type: 'integer', description: '借款期限', usage: '记录借款期限' }
                ],
                metrics: [
                    { name: '支用转化率', description: '授信用户中申请借款的比例', formula: 'count(distinct loan_user)/count(distinct credit_user)', unit: '%', owner: '李四' },
                    { name: '平均借款金额', description: '借款申请平均金额', formula: 'avg(loan_amount)', unit: '元', owner: '李四' }
                ]
            },
            {
                name: 'loan_contract',
                description: '借款合同表',
                usage: '用于记录用户借款合同信息，可分析合同签约率和条款分布。',
                type: 'table',
                owner: '吴九',
                fields: [
                    { name: 'contract_id', type: 'string', description: '合同ID', usage: '借款合同唯一标识' },
                    { name: 'loan_id', type: 'string', description: '借款ID', usage: '借款唯一标识' },
                    { name: 'interest_rate', type: 'decimal', description: '利率', usage: '记录借款利率' },
                    { name: 'sign_time', type: 'timestamp', description: '签约时间', usage: '记录合同签约时间' }
                ],
                metrics: [
                    { name: '合同签约率', description: '借款申请中完成签约的比例', formula: 'count(signed)/count(loan_apply)', unit: '%', owner: '吴九' },
                    { name: '平均利率', description: '借款合同平均利率', formula: 'avg(interest_rate)', unit: '%', owner: '吴九' }
                ]
            }
        ]
    },
    {
        name: '还款',
        description: '用户按期还款，维护还款计划',
        icon: 'icon-calendar',
        tables: [
            {
                name: 'repayment_plan',
                description: '还款计划表',
                usage: '用于记录用户还款计划信息，可分析还款计划和实际还款情况。',
                type: 'table',
                fields: [
                    { name: 'plan_id', type: 'string', description: '计划ID', usage: '还款计划唯一标识' },
                    { name: 'loan_id', type: 'string', description: '借款ID', usage: '借款唯一标识' },
                    { name: 'due_amount', type: 'decimal', description: '应还金额', usage: '记录应还金额' },
                    { name: 'due_date', type: 'date', description: '应还日期', usage: '记录应还日期' }
                ],
                metrics: [
                    { name: '按期还款率', description: '按期还款的比例', formula: 'count(ontime_repay)/count(total_repay)', unit: '%', owner: '李四' },
                    { name: '提前还款率', description: '提前还款的比例', formula: 'count(early_repay)/count(total_repay)', unit: '%', owner: '李四' }
                ]
            },
            {
                name: 'repayment_record',
                description: '还款记录表',
                usage: '用于记录用户实际还款信息，可分析还款及时率和逾期情况。',
                type: 'table',
                owner: '郑十',
                fields: [
                    { name: 'record_id', type: 'string', description: '记录ID', usage: '还款记录唯一标识' },
                    { name: 'plan_id', type: 'string', description: '计划ID', usage: '还款计划唯一标识' },
                    { name: 'paid_amount', type: 'decimal', description: '实还金额', usage: '记录实际还款金额' },
                    { name: 'paid_time', type: 'timestamp', description: '实还时间', usage: '记录实际还款时间' }
                ],
                metrics: [
                    { name: '实际还款率', description: '完成还款的计划占比', formula: 'count(paid_plans)/count(total_plans)', unit: '%', owner: '郑十' },
                    { name: '平均还款金额', description: '实际还款平均金额', formula: 'avg(paid_amount)', unit: '元', owner: '郑十' }
                ]
            }
        ]
    },
    {
        name: '贷后管理',
        description: '管理逾期账户，进行催收工作',
        icon: 'icon-alert',
        tables: [
            {
                name: 'loan_overdue',
                description: '逾期记录表',
                usage: '用于记录用户逾期信息，可分析逾期率和催收效果。',
                type: 'table',
                fields: [
                    { name: 'overdue_id', type: 'string', description: '逾期ID', usage: '逾期记录唯一标识' },
                    { name: 'loan_id', type: 'string', description: '借款ID', usage: '借款唯一标识' },
                    { name: 'overdue_days', type: 'integer', description: '逾期天数', usage: '记录逾期天数' },
                    { name: 'overdue_amount', type: 'decimal', description: '逾期金额', usage: '记录逾期金额' }
                ],
                metrics: [
                    { name: '逾期率', description: '逾期账户占比', formula: 'count(distinct overdue_loan)/count(distinct total_loan)', unit: '%', owner: '李四' },
                    { name: '逾期金额占比', description: '逾期金额占总放款金额比例', formula: 'sum(overdue_amount)/sum(loan_amount)', unit: '%', owner: '李四' }
                ]
            },
            {
                name: 'collection_record',
                description: '催收记录表',
                usage: '用于记录催收操作信息，可分析催收效果和回款率。',
                type: 'table',
                owner: '钱十一',
                fields: [
                    { name: 'collection_id', type: 'string', description: '催收ID', usage: '催收记录唯一标识' },
                    { name: 'overdue_id', type: 'string', description: '逾期ID', usage: '逾期记录唯一标识' },
                    { name: 'collector', type: 'string', description: '催收员', usage: '记录催收人员' },
                    { name: 'collection_result', type: 'string', description: '催收结果', usage: '记录催收结果' }
                ],
                metrics: [
                    { name: '催收成功率', description: '催收成功的案例占比', formula: 'count(success_collection)/count(total_collection)', unit: '%', owner: '钱十一' },
                    { name: '催收回款率', description: '通过催收回收的金额占比', formula: 'sum(recovered_amount)/sum(overdue_amount)', unit: '%', owner: '钱十一' }
                ]
            }
        ]
    }
];
export const commonTables = [
    {
        name: 'user_info',
        description: '用户基础信息表',
        usage: '存储用户基础信息，可用于分析用户画像和行为特征。',
        owner: '数据管理员',
        fields: [
            { name: 'user_id', type: 'string', description: '用户ID' },
            { name: 'mobile', type: 'string', description: '手机号', usage: '用户手机号码' },
            { name: 'email', type: 'string', description: '邮箱', usage: '用户电子邮箱' },
            { name: 'create_time', type: 'timestamp', description: '创建时间', usage: '记录创建时间' }
        ]
    },
    {
        name: 'product_info',
        description: '产品信息表',
        usage: '存储产品基础信息，可用于分析产品类型分布和状态监控。',
        owner: '产品经理',
        fields: [
            { name: 'product_id', type: 'string', description: '产品ID', usage: '产品唯一标识' },
            { name: 'product_name', type: 'string', description: '产品名称', usage: '记录产品名称' },
            { name: 'product_type', type: 'string', description: '产品类型', usage: '记录产品类型' },
            { name: 'status', type: 'string', description: '产品状态', usage: '记录产品状态' }
        ]
    },
    {
        name: 'transaction_log',
        description: '交易流水表',
        usage: '用于记录用户交易流水信息，可分析交易量和交易类型分布。',
        owner: '财务分析师',
        fields: [
            { name: 'transaction_id', type: 'string', description: '交易ID', usage: '交易记录唯一标识' },
            { name: 'user_id', type: 'string', description: '用户ID' },
            { name: 'amount', type: 'decimal', description: '交易金额', usage: '记录交易金额' },
            { name: 'transaction_type', type: 'string', description: '交易类型', usage: '记录交易类型' }
        ]
    },
    {
        name: 'risk_control',
        description: '风控指标表',
        usage: '用于记录用户风险评估信息，可分析风险分布和风控效果。',
        owner: '风控专员',
        fields: [
            { name: 'user_id', type: 'string', description: '用户ID' },
            { name: 'risk_score', type: 'integer', description: '风险评分', usage: '记录风险评分' },
            { name: 'risk_level', type: 'string', description: '风险等级', usage: '记录风险等级' },
            { name: 'update_time', type: 'timestamp', description: '更新时间', usage: '记录更新时间' }
        ]
    },
    {
        name: 'customer_service',
        description: '客服记录表',
        usage: '用于记录客服服务信息，可分析服务质量和用户满意度。',
        owner: '客服主管',
        fields: [
            { name: 'service_id', type: 'string', description: '服务ID', usage: '客服记录唯一标识' },
            { name: 'user_id', type: 'string', description: '用户ID' },
            { name: 'service_type', type: 'string', description: '服务类型', usage: '记录服务类型' },
            { name: 'content', type: 'string', description: '服务内容', usage: '记录服务内容' }
        ]
    }
];
export const tableColumns = [
    { title: '表名', dataIndex: 'name' },
    { title: '负责人', dataIndex: 'owner', render: ({ record }) => (record.owner || '未指定') },
    { title: '描述', dataIndex: 'description' },
    { title: '使用说明', dataIndex: 'usage', render: ({ record }) => (record.usage || '暂无说明') }
];
