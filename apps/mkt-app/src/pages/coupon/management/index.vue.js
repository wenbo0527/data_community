/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Message, Modal } from '@arco-design/web-vue';
import { IconPlus, IconInfoCircle } from '@arco-design/web-vue/es/icon';
import { useUserStore } from '@/store';
import { couponMockData, templateMockData } from '@/mock/coupon';
const router = useRouter();
const userStore = useUserStore();
// 表格数据
const tableData = ref([]);
const loading = ref(false);
const searchKeyword = ref('');
const detailModalVisible = ref(false);
const currentDetail = ref([]);
const instanceParams = ref([]);
const baseParams = ref([]);
const interestFreeParams = ref([]);
const discountParams = ref([]);
const lockParams = ref([]);
// 步骤控制
const currentStep = ref(1);
const nextStep = async () => {
    const form = formRef.value;
    if (!form)
        return;
    try {
        // 根据当前步骤验证对应的字段
        const validateFields = currentStep.value === 1
            ? ['templateId', 'name', 'totalCount']
            : ['rules', 'validity'];
        await form.validate(validateFields);
        currentStep.value++;
    }
    catch (error) {
        // 验证失败不跳转
        return false;
    }
};
// 预览数据
const previewData = computed(() => [
    {
        label: '券模版',
        value: templateOptions.value.find(t => t.id === formData.value?.templateId)?.name || '-'
    },
    {
        label: '券名称',
        value: formData.value?.name || '-'
    },
    {
        label: '发放数量',
        value: formData.value?.totalCount || '-'
    },
    {
        label: '使用规则',
        value: formData.value?.rules || '-'
    },
    {
        label: '有效期',
        value: formData.value?.validity?.length
            ? `${formData.value.validity[0]} 至 ${formData.value.validity[1]}`
            : '-'
    }
]);
// 分页配置
const pagination = ref({
    total: 0,
    current: 1,
    pageSize: 10,
    showTotal: true,
    showJumper: true,
    showPageSize: true,
});
// 创建券相关
const showCreateModal = ref(false);
const formRef = ref(null);
const templateOptions = ref([]);
const handleViewDetail = (record) => {
    router.push({
        path: '/marketing/coupon/management/detail',
        query: {
            templateId: record.templateId,
            instanceId: record.id
        }
    });
};
// 审批弹窗
const showApproveModal = ref(false);
const currentApproveRecord = ref({});
const handleApproveModal = (record) => {
    currentApproveRecord.value = record;
    showApproveModal.value = true;
};
const handleApprove = (record) => {
    Modal.confirm({
        title: '确认审批',
        content: `确定要通过审批「${record.name}」吗？`,
        onOk: async () => {
            try {
                // TODO: 调用接口更新状态
                Message.success('审批成功');
                showApproveModal.value = false;
                fetchData();
            }
            catch (error) {
                Message.error('审批失败');
            }
        }
    });
};
// 审核员和录入员选项
const auditorOptions = ref([
    { id: 'A001', name: '张三' },
    { id: 'A002', name: '李四' },
    { id: 'A003', name: '王五' }
]);
const operatorOptions = ref([
    { id: 'O001', name: '赵六' },
    { id: 'O002', name: '钱七' },
    { id: 'O003', name: '孙八' }
]);
// 表单数据
const formData = ref({
    templateId: '',
    name: '',
    totalCount: 1000,
    dailyLimit: 100, // 单日发放上限
    weeklyLimit: 500, // 单周发放上限
    monthlyLimit: 2000, // 单月发放上限
    rules: '',
    validityType: 'absolute', // 有效期类型：absolute-绝对有效期，relative-相对有效期
    validity: [], // 绝对有效期
    relativeDays: 1, // 相对有效期天数
    auditor: '',
    operator: userStore.userInfo.username, // 默认设置为当前登录用户
    validityPeriod: [],
    userLimitDesc: '', // 用户持券限制说明
    usageScenarios: [] // 券使用场景（多选）
});
const rules = {
    templateId: [{ required: true, message: '请选择券模版' }],
    name: [
        { required: true, message: '请输入券名称' },
        { maxLength: 50, message: '名称长度不能超过50个字符' }
    ],
    totalCount: [{ required: true, message: '请输入发放数量' }],
    validityType: [{ required: true, message: '请选择有效期类型' }],
    validity: [{ required: true, message: '请选择有效期' }],
    relativeDays: [{ required: true, message: '请输入相对有效期天数' }],
    auditor: [{ required: true, message: '请选择审核员' }],
    operator: [{ required: true, message: '请选择录入员' }],
    validityPeriod: [{ required: true, message: '请选择有效期' }]
};
// 定时器ID
const timerId = ref(null);
// 清理函数
const cleanup = () => {
    if (timerId.value) {
        clearTimeout(timerId.value);
        timerId.value = null;
    }
};
// 获取表格数据
const fetchData = async () => {
    if (loading.value)
        return;
    loading.value = true;
    cleanup(); // 清理之前的定时器
    const timeoutPromise = new Promise((_, reject) => {
        timerId.value = setTimeout(() => {
            reject(new Error('请求超时'));
        }, 5000); // 5秒超时保护
    });
    try {
        const dataPromise = new Promise(resolve => {
            setTimeout(() => {
                // TODO: 调用接口获取数据
                const mockData = couponMockData;
                resolve(mockData);
            }, 300);
        });
        const data = await Promise.race([dataPromise, timeoutPromise]);
        tableData.value = data;
        pagination.value.total = 100;
    }
    catch (error) {
        Message.error(error.message || '获取数据失败');
    }
    finally {
        loading.value = false;
        cleanup(); // 请求完成后清理定时器
    }
};
// 监听路由参数
const route = useRoute();
onMounted(() => {
    fetchData();
    fetchTemplateOptions();
    // 检查路由参数，显示创建弹窗
    if (route.query.showCreateModal === 'true') {
        showCreateModal.value = true;
        // 如果有模板ID和名称，自动填充
        if (route.query.templateId) {
            formData.value.templateId = route.query.templateId;
            formData.value.name = route.query.templateName;
        }
    }
});
onUnmounted(() => {
    cleanup();
});
// 搜索
const handleSearch = () => {
    pagination.value.current = 1;
    fetchData();
};
// 分页变化
const onPageChange = (current) => {
    pagination.value.current = current;
    fetchData();
};
const onPageSizeChange = (pageSize) => {
    pagination.value.pageSize = pageSize;
    pagination.value.current = 1;
    fetchData();
};
// 获取状态颜色
const getStatusColor = (status) => {
    const colorMap = {
        '草稿': 'gray',
        '待审核': 'blue',
        '生效中': 'green',
        '票劵停发': 'orange',
        '票劵失效': 'gray'
    };
    return colorMap[status] || 'blue';
};
// 获取券模版选项
const fetchTemplateOptions = async () => {
    try {
        // 从mock数据中获取券模版列表
        const { templateMockData } = await import('@/mock/coupon');
        templateOptions.value = templateMockData.map(template => ({
            id: template.id,
            name: template.name
        }));
    }
    catch (error) {
        Message.error('获取券模版失败');
    }
};
// 选择模版后自动填充名称
const handleTemplateChange = (templateId) => {
    const template = templateOptions.value.find(t => t.id === templateId);
    if (template) {
        formData.value.name = `${template.name}-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    }
};
// 重置表单
const resetForm = () => {
    formRef.value?.resetFields();
    showCreateModal.value = false;
};
// 提交表单
const handleSubmit = async () => {
    const { error } = await formRef.value.validate();
    if (error)
        return false;
    try {
        // TODO: 调用接口提交数据
        Message.success('创建成功');
        resetForm();
        fetchData();
        return true;
    }
    catch (error) {
        Message.error('创建失败');
        return false;
    }
};
// 暂停/启用券
const handlePause = (record) => {
    const action = record.status === '已暂停' ? '启用' : '暂停';
    Modal.warning({
        title: `确认${action}`,
        content: `确定要${action}「${record.name}」吗？`,
        onOk: async () => {
            try {
                // TODO: 调用接口更新状态
                Message.success(`${action}成功`);
                fetchData();
            }
            catch (error) {
                Message.error(`${action}失败`);
            }
        }
    });
};
// 编辑券
const handleEdit = (record) => {
    // TODO: 跳转到编辑页面
    router.push(`/marketing/coupon/management/edit/${record.id}`);
};
// 上线券
const handleOnline = (record) => {
    Modal.confirm({
        title: '确认上线',
        content: `
      确定要上线「${record.name}」吗？
        审核人：${auditorOptions.value.find(a => a.id === record.auditor)?.name || '未指定'}
      
    `,
        onOk: async () => {
            try {
                // TODO: 调用上线接口
                Message.success('上线成功');
                fetchData();
            }
            catch (error) {
                Message.error('上线失败');
            }
        }
    });
};
// 撤回审核
const handleWithdraw = (record) => {
    Modal.confirm({
        title: '确认撤回',
        content: `确定要撤回「${record.name}」的审核申请吗？`,
        onOk: async () => {
            try {
                // TODO: 调用撤回接口
                Message.success('撤回成功');
                fetchData();
            }
            catch (error) {
                Message.error('撤回失败');
            }
        }
    });
};
const handleReject = (record) => {
    Modal.confirm({
        title: '确认拒绝',
        content: `确定要拒绝「${record.name}」吗？`,
        okText: '确认拒绝',
        cancelText: '取消',
        onOk: async () => {
            try {
                // TODO: 调用接口更新状态
                Message.success('已拒绝');
                showApproveModal.value = false;
                fetchData();
            }
            catch (error) {
                Message.error('拒绝失败');
            }
        }
    });
};
// 删除券
// 处理行双击事件
const handleRowDblClick = (record) => {
    currentDetail.value = record;
    detailModalVisible.value = true;
    // 获取关联的券模版信息
    const template = templateMockData.find(t => t.id === record.templateId);
    instanceParams.value = [
        { label: '券ID', value: record.id },
        { label: '券名称', value: record.name },
        { label: '券类型', value: record.type },
        { label: '关联模版', value: template?.name || '无' },
        { label: '状态', value: record.status },
        { label: '创建时间', value: record.createTime },
        { label: '录入员', value: record.operator },
        { label: '审核员', value: record.auditor },
        { label: '模版描述', value: template?.description || '无' },
        { label: '适用产品', value: template?.products?.join(', ') || '无' }
    ];
    instanceParams.value = [
        { label: '券ID', value: record.id },
        { label: '券名称', value: record.name },
        { label: '券类型', value: record.type },
        { label: '关联模版', value: template?.name || '无' },
        { label: '状态', value: record.status },
        { label: '创建时间', value: record.createTime },
        { label: '录入员', value: record.operator },
        { label: '审核员', value: record.auditor },
        { label: '模版描述', value: template?.description || '无' },
        { label: '适用产品', value: template?.products?.join(', ') || '无' },
        { label: '还款方式', value: template?.repaymentMethods?.join(', ') || '无' }
    ];
    baseParams.value = [
        { label: '总数量', value: record.totalCount },
        { label: '库存', value: record.stock },
        { label: '未领取', value: record.unclaimed },
        { label: '已领取', value: record.claimed },
        { label: '已锁定', value: record.locked },
        { label: '已核销', value: record.verified },
        { label: '已过期', value: record.expired },
        { label: '已作废', value: record.invalid },
        { label: '使用规则', value: record.rules },
        { label: '有效期', value: `${record.validityStartTime} - ${record.validityEndTime}` }
    ];
    if (record.type === '免息券') {
        interestFreeParams.value = [
            { label: '免息天数', value: record.templateId === 1 ? 30 : 90 },
            { label: '借款金额范围', value: `${record.templateId === 1 ? '10,000-100,000' : '50,000-200,000'}` }
        ];
    }
    else if (record.type === '折扣券') {
        discountParams.value = [
            { label: '折扣率', value: record.templateId === 3 ? '8折' : '7折' },
            { label: '借款金额范围', value: record.templateId === 3 ? '5,000-50,000' : '100,000-500,000' }
        ];
    }
};
const handleDelete = (record) => {
    Modal.confirm({
        title: '确认删除',
        content: `确定要删除券包「${record.name}」吗？`,
        onOk: async () => {
            try {
                // TODO: 调用删除接口
                Message.success('删除成功');
                await fetchData();
            }
            catch (error) {
                Message.error('删除失败');
            }
        }
    });
};
onMounted(() => {
    fetchData();
    fetchTemplateOptions();
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "coupon-container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "header-actions" },
});
const __VLS_0 = {}.ASpace;
/** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ 
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({}));
const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
const __VLS_4 = {}.AInputSearch;
/** @type {[typeof __VLS_components.AInputSearch, typeof __VLS_components.aInputSearch, ]} */ 
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    ...{ 'onSearch': {} },
    modelValue: (__VLS_ctx.searchKeyword),
    placeholder: "搜索券名称",
    ...{ style: {} },
}));
const __VLS_6 = __VLS_5({
    ...{ 'onSearch': {} },
    modelValue: (__VLS_ctx.searchKeyword),
    placeholder: "搜索券名称",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
let __VLS_8;
let __VLS_9;
let __VLS_10;
const __VLS_11 = {
    onSearch: (__VLS_ctx.handleSearch)
};
let __VLS_7;
const __VLS_12 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_14 = __VLS_13({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
let __VLS_16;
let __VLS_17;
let __VLS_18;
const __VLS_19 = {
    onClick: (...[$event]) => {
        __VLS_ctx.showCreateModal = true;
    }
};
__VLS_15.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_15.slots;
    const __VLS_20 = {}.IconPlus;
    /** @type {[typeof __VLS_components.IconPlus, typeof __VLS_components.iconPlus, ]} */ 
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({}));
    const __VLS_22 = __VLS_21({}, ...__VLS_functionalComponentArgsRest(__VLS_21));
}
let __VLS_15;
let __VLS_3;
const __VLS_24 = {}.ATable;
/** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ 
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    ...{ 'onPageChange': {} },
    ...{ 'onPageSizeChange': {} },
    data: (__VLS_ctx.tableData),
    loading: (__VLS_ctx.loading),
    pagination: (__VLS_ctx.pagination),
    bordered: (true),
    stripe: (true),
}));
const __VLS_26 = __VLS_25({
    ...{ 'onPageChange': {} },
    ...{ 'onPageSizeChange': {} },
    data: (__VLS_ctx.tableData),
    loading: (__VLS_ctx.loading),
    pagination: (__VLS_ctx.pagination),
    bordered: (true),
    stripe: (true),
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
let __VLS_28;
let __VLS_29;
let __VLS_30;
const __VLS_31 = {
    onPageChange: (__VLS_ctx.onPageChange)
};
const __VLS_32 = {
    onPageSizeChange: (__VLS_ctx.onPageSizeChange)
};
__VLS_27.slots.default;
{
    const { columns: __VLS_thisSlot } = __VLS_27.slots;
    const __VLS_33 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ 
    // @ts-ignore
    const __VLS_34 = __VLS_asFunctionalComponent(__VLS_33, new __VLS_33({
        title: "券名称",
        dataIndex: "name",
        width: (220),
    }));
    const __VLS_35 = __VLS_34({
        title: "券名称",
        dataIndex: "name",
        width: (220),
    }, ...__VLS_functionalComponentArgsRest(__VLS_34));
    __VLS_36.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_36.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_37 = {}.ATooltip;
        /** @type {[typeof __VLS_components.ATooltip, typeof __VLS_components.aTooltip, typeof __VLS_components.ATooltip, typeof __VLS_components.aTooltip, ]} */ 
        // @ts-ignore
        const __VLS_38 = __VLS_asFunctionalComponent(__VLS_37, new __VLS_37({
            content: (record.name),
            position: "top",
        }));
        const __VLS_39 = __VLS_38({
            content: (record.name),
            position: "top",
        }, ...__VLS_functionalComponentArgsRest(__VLS_38));
        __VLS_40.slots.default;
        const __VLS_41 = {}.ASpace;
        /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ 
        // @ts-ignore
        const __VLS_42 = __VLS_asFunctionalComponent(__VLS_41, new __VLS_41({}));
        const __VLS_43 = __VLS_42({}, ...__VLS_functionalComponentArgsRest(__VLS_42));
        __VLS_44.slots.default;
        const __VLS_45 = {}.ATag;
        /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ 
        // @ts-ignore
        const __VLS_46 = __VLS_asFunctionalComponent(__VLS_45, new __VLS_45({
            color: (record.type === '满减券' ? 'blue' : 'green'),
        }));
        const __VLS_47 = __VLS_46({
            color: (record.type === '满减券' ? 'blue' : 'green'),
        }, ...__VLS_functionalComponentArgsRest(__VLS_46));
        __VLS_48.slots.default;
        (record.type);
        let __VLS_48;
        const __VLS_49 = {}.ALink;
        /** @type {[typeof __VLS_components.ALink, typeof __VLS_components.aLink, typeof __VLS_components.ALink, typeof __VLS_components.aLink, ]} */ 
        // @ts-ignore
        const __VLS_50 = __VLS_asFunctionalComponent(__VLS_49, new __VLS_49({
            ...{ 'onClick': {} },
            ...{ style: {} },
        }));
        const __VLS_51 = __VLS_50({
            ...{ 'onClick': {} },
            ...{ style: {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_50));
        let __VLS_53;
        let __VLS_54;
        let __VLS_55;
        const __VLS_56 = {
            onClick: (...[$event]) => {
                __VLS_ctx.handleViewDetail(record);
            }
        };
        __VLS_52.slots.default;
        (record.name);
        let __VLS_52;
        let __VLS_44;
        let __VLS_40;
    }
    let __VLS_36;
    const __VLS_57 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ 
    // @ts-ignore
    const __VLS_58 = __VLS_asFunctionalComponent(__VLS_57, new __VLS_57({
        title: "状态",
        dataIndex: "status",
        width: (150),
        align: "center",
        filterable: ({ filters: [
                { text: '草稿', value: '草稿' },
                { text: '待审核', value: '待审核' },
                { text: '生效中', value: '生效中' },
                { text: '已暂停', value: '已暂停' },
                { text: '已失效', value: '已失效' }
            ] }),
    }));
    const __VLS_59 = __VLS_58({
        title: "状态",
        dataIndex: "status",
        width: (150),
        align: "center",
        filterable: ({ filters: [
                { text: '草稿', value: '草稿' },
                { text: '待审核', value: '待审核' },
                { text: '生效中', value: '生效中' },
                { text: '已暂停', value: '已暂停' },
                { text: '已失效', value: '已失效' }
            ] }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_58));
    __VLS_60.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_60.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_61 = {}.ATag;
        /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ 
        // @ts-ignore
        const __VLS_62 = __VLS_asFunctionalComponent(__VLS_61, new __VLS_61({
            color: (__VLS_ctx.getStatusColor(record.status)),
        }));
        const __VLS_63 = __VLS_62({
            color: (__VLS_ctx.getStatusColor(record.status)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_62));
        __VLS_64.slots.default;
        (record.status);
        let __VLS_64;
    }
    let __VLS_60;
    const __VLS_65 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ 
    // @ts-ignore
    const __VLS_66 = __VLS_asFunctionalComponent(__VLS_65, new __VLS_65({
        title: "库存",
        dataIndex: "stock",
        width: (120),
        align: "center",
    }));
    const __VLS_67 = __VLS_66({
        title: "库存",
        dataIndex: "stock",
        width: (120),
        align: "center",
    }, ...__VLS_functionalComponentArgsRest(__VLS_66));
    __VLS_68.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_68.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_69 = {}.ATooltip;
        /** @type {[typeof __VLS_components.ATooltip, typeof __VLS_components.aTooltip, typeof __VLS_components.ATooltip, typeof __VLS_components.aTooltip, ]} */ 
        // @ts-ignore
        const __VLS_70 = __VLS_asFunctionalComponent(__VLS_69, new __VLS_69({
            content: (`初始化: ${record.unclaimed || 0}\n已领取: ${record.claimed || 0}\n已锁定: ${record.locked || 0}\n已核销: ${record.used || 0}\n已过期: ${record.expired || 0}\n已作废: ${record.invalid || 0}`),
            position: "top",
            mouseEnterDelay: (100),
            mouseLeaveDelay: (100),
        }));
        const __VLS_71 = __VLS_70({
            content: (`初始化: ${record.unclaimed || 0}\n已领取: ${record.claimed || 0}\n已锁定: ${record.locked || 0}\n已核销: ${record.used || 0}\n已过期: ${record.expired || 0}\n已作废: ${record.invalid || 0}`),
            position: "top",
            mouseEnterDelay: (100),
            mouseLeaveDelay: (100),
        }, ...__VLS_functionalComponentArgsRest(__VLS_70));
        __VLS_72.slots.default;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ style: {} },
        });
        (record.stock);
        let __VLS_72;
    }
    let __VLS_68;
    const __VLS_73 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ 
    // @ts-ignore
    const __VLS_74 = __VLS_asFunctionalComponent(__VLS_73, new __VLS_73({
        title: "下发比例",
        width: (150),
        align: "center",
    }));
    const __VLS_75 = __VLS_74({
        title: "下发比例",
        width: (150),
        align: "center",
    }, ...__VLS_functionalComponentArgsRest(__VLS_74));
    __VLS_76.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_76.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        ((record.claimed / record.stock * 100).toFixed(2));
    }
    let __VLS_76;
    const __VLS_77 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ 
    // @ts-ignore
    const __VLS_78 = __VLS_asFunctionalComponent(__VLS_77, new __VLS_77({
        title: "有效期",
        dataIndex: "validity",
        width: (220),
    }));
    const __VLS_79 = __VLS_78({
        title: "有效期",
        dataIndex: "validity",
        width: (220),
    }, ...__VLS_functionalComponentArgsRest(__VLS_78));
    __VLS_80.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_80.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_81 = {}.ATooltip;
        /** @type {[typeof __VLS_components.ATooltip, typeof __VLS_components.aTooltip, typeof __VLS_components.ATooltip, typeof __VLS_components.aTooltip, ]} */ 
        // @ts-ignore
        const __VLS_82 = __VLS_asFunctionalComponent(__VLS_81, new __VLS_81({
            content: (`${new Date(record.startTime).toISOString().split('T')[0]} - ${new Date(record.endTime).toISOString().split('T')[0]}`),
            position: "top",
        }));
        const __VLS_83 = __VLS_82({
            content: (`${new Date(record.startTime).toISOString().split('T')[0]} - ${new Date(record.endTime).toISOString().split('T')[0]}`),
            position: "top",
        }, ...__VLS_functionalComponentArgsRest(__VLS_82));
        __VLS_84.slots.default;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ style: {} },
        });
        (new Date(record.startTime).toISOString().split('T')[0]);
        (new Date(record.endTime).toISOString().split('T')[0]);
        let __VLS_84;
    }
    let __VLS_80;
    const __VLS_85 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ 
    // @ts-ignore
    const __VLS_86 = __VLS_asFunctionalComponent(__VLS_85, new __VLS_85({
        title: "录入员",
        dataIndex: "operator",
        width: (150),
        filterable: ({ filters: __VLS_ctx.operatorOptions.map(op => ({ text: op.name, value: op.id })) }),
    }));
    const __VLS_87 = __VLS_86({
        title: "录入员",
        dataIndex: "operator",
        width: (150),
        filterable: ({ filters: __VLS_ctx.operatorOptions.map(op => ({ text: op.name, value: op.id })) }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_86));
    __VLS_88.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_88.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        (record.operator);
    }
    let __VLS_88;
    const __VLS_89 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ 
    // @ts-ignore
    const __VLS_90 = __VLS_asFunctionalComponent(__VLS_89, new __VLS_89({
        title: "操作",
        fixed: "right",
        width: (150),
    }));
    const __VLS_91 = __VLS_90({
        title: "操作",
        fixed: "right",
        width: (150),
    }, ...__VLS_functionalComponentArgsRest(__VLS_90));
    __VLS_92.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_92.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_93 = {}.ASpace;
        /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ 
        // @ts-ignore
        const __VLS_94 = __VLS_asFunctionalComponent(__VLS_93, new __VLS_93({}));
        const __VLS_95 = __VLS_94({}, ...__VLS_functionalComponentArgsRest(__VLS_94));
        __VLS_96.slots.default;
        if (record.status === '草稿') {
            const __VLS_97 = {}.AButton;
            /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
            // @ts-ignore
            const __VLS_98 = __VLS_asFunctionalComponent(__VLS_97, new __VLS_97({
                ...{ 'onClick': {} },
                type: "text",
                size: "small",
            }));
            const __VLS_99 = __VLS_98({
                ...{ 'onClick': {} },
                type: "text",
                size: "small",
            }, ...__VLS_functionalComponentArgsRest(__VLS_98));
            let __VLS_101;
            let __VLS_102;
            let __VLS_103;
            const __VLS_104 = {
                onClick: (...[$event]) => {
                    if (!(record.status === '草稿'))
                        return;
                    __VLS_ctx.handleEdit(record);
                }
            };
            __VLS_100.slots.default;
            let __VLS_100;
            const __VLS_105 = {}.AButton;
            /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
            // @ts-ignore
            const __VLS_106 = __VLS_asFunctionalComponent(__VLS_105, new __VLS_105({
                ...{ 'onClick': {} },
                type: "text",
                size: "small",
            }));
            const __VLS_107 = __VLS_106({
                ...{ 'onClick': {} },
                type: "text",
                size: "small",
            }, ...__VLS_functionalComponentArgsRest(__VLS_106));
            let __VLS_109;
            let __VLS_110;
            let __VLS_111;
            const __VLS_112 = {
                onClick: (...[$event]) => {
                    if (!(record.status === '草稿'))
                        return;
                    __VLS_ctx.handleOnline(record);
                }
            };
            __VLS_108.slots.default;
            let __VLS_108;
            const __VLS_113 = {}.AButton;
            /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
            // @ts-ignore
            const __VLS_114 = __VLS_asFunctionalComponent(__VLS_113, new __VLS_113({
                ...{ 'onClick': {} },
                type: "text",
                size: "small",
                status: "danger",
            }));
            const __VLS_115 = __VLS_114({
                ...{ 'onClick': {} },
                type: "text",
                size: "small",
                status: "danger",
            }, ...__VLS_functionalComponentArgsRest(__VLS_114));
            let __VLS_117;
            let __VLS_118;
            let __VLS_119;
            const __VLS_120 = {
                onClick: (...[$event]) => {
                    if (!(record.status === '草稿'))
                        return;
                    __VLS_ctx.handleDelete(record);
                }
            };
            __VLS_116.slots.default;
            let __VLS_116;
        }
        else if (record.status === '待审核') {
            const __VLS_121 = {}.AButton;
            /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
            // @ts-ignore
            const __VLS_122 = __VLS_asFunctionalComponent(__VLS_121, new __VLS_121({
                ...{ 'onClick': {} },
                type: "text",
                size: "small",
            }));
            const __VLS_123 = __VLS_122({
                ...{ 'onClick': {} },
                type: "text",
                size: "small",
            }, ...__VLS_functionalComponentArgsRest(__VLS_122));
            let __VLS_125;
            let __VLS_126;
            let __VLS_127;
            const __VLS_128 = {
                onClick: (...[$event]) => {
                    if (record.status === '草稿')
                        return;
                    if (!(record.status === '待审核'))
                        return;
                    __VLS_ctx.handleWithdraw(record);
                }
            };
            __VLS_124.slots.default;
            let __VLS_124;
        }
        else if (record.status === '生效中') {
            const __VLS_129 = {}.AButton;
            /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
            // @ts-ignore
            const __VLS_130 = __VLS_asFunctionalComponent(__VLS_129, new __VLS_129({
                ...{ 'onClick': {} },
                type: "text",
                size: "small",
            }));
            const __VLS_131 = __VLS_130({
                ...{ 'onClick': {} },
                type: "text",
                size: "small",
            }, ...__VLS_functionalComponentArgsRest(__VLS_130));
            let __VLS_133;
            let __VLS_134;
            let __VLS_135;
            const __VLS_136 = {
                onClick: (...[$event]) => {
                    if (record.status === '草稿')
                        return;
                    if (record.status === '待审核')
                        return;
                    if (!(record.status === '生效中'))
                        return;
                    __VLS_ctx.handleViewDetail(record);
                }
            };
            __VLS_132.slots.default;
            let __VLS_132;
            const __VLS_137 = {}.AButton;
            /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
            // @ts-ignore
            const __VLS_138 = __VLS_asFunctionalComponent(__VLS_137, new __VLS_137({
                ...{ 'onClick': {} },
                type: "text",
                size: "small",
            }));
            const __VLS_139 = __VLS_138({
                ...{ 'onClick': {} },
                type: "text",
                size: "small",
            }, ...__VLS_functionalComponentArgsRest(__VLS_138));
            let __VLS_141;
            let __VLS_142;
            let __VLS_143;
            const __VLS_144 = {
                onClick: (...[$event]) => {
                    if (record.status === '草稿')
                        return;
                    if (record.status === '待审核')
                        return;
                    if (!(record.status === '生效中'))
                        return;
                    __VLS_ctx.handlePause(record);
                }
            };
            __VLS_140.slots.default;
            let __VLS_140;
        }
        let __VLS_96;
    }
    let __VLS_92;
}
let __VLS_27;
const __VLS_145 = {}.AModal;
/** @type {[typeof __VLS_components.AModal, typeof __VLS_components.aModal, typeof __VLS_components.AModal, typeof __VLS_components.aModal, ]} */ 
// @ts-ignore
const __VLS_146 = __VLS_asFunctionalComponent(__VLS_145, new __VLS_145({
    ...{ 'onCancel': {} },
    ...{ 'onBeforeOk': {} },
    visible: (__VLS_ctx.showCreateModal),
    title: "创建券库存",
    footer: (false),
    width: (800),
}));
const __VLS_147 = __VLS_146({
    ...{ 'onCancel': {} },
    ...{ 'onBeforeOk': {} },
    visible: (__VLS_ctx.showCreateModal),
    title: "创建券库存",
    footer: (false),
    width: (800),
}, ...__VLS_functionalComponentArgsRest(__VLS_146));
let __VLS_149;
let __VLS_150;
let __VLS_151;
const __VLS_152 = {
    onCancel: (__VLS_ctx.resetForm)
};
const __VLS_153 = {
    onBeforeOk: (__VLS_ctx.handleSubmit)
};
__VLS_148.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "create-coupon-container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
    ...{ class: "page-title" },
});
const __VLS_154 = {}.AForm;
/** @type {[typeof __VLS_components.AForm, typeof __VLS_components.aForm, typeof __VLS_components.AForm, typeof __VLS_components.aForm, ]} */ 
// @ts-ignore
const __VLS_155 = __VLS_asFunctionalComponent(__VLS_154, new __VLS_154({
    ref: "formRef",
    model: (__VLS_ctx.formData),
    rules: (__VLS_ctx.rules),
    layout: "vertical",
    ...{ style: ({ width: '100%', maxWidth: '720px' }) },
}));
const __VLS_156 = __VLS_155({
    ref: "formRef",
    model: (__VLS_ctx.formData),
    rules: (__VLS_ctx.rules),
    layout: "vertical",
    ...{ style: ({ width: '100%', maxWidth: '720px' }) },
}, ...__VLS_functionalComponentArgsRest(__VLS_155));
/** @type {typeof __VLS_ctx.formRef} */ 
const __VLS_158 = {};
__VLS_157.slots.default;
const __VLS_160 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ 
// @ts-ignore
const __VLS_161 = __VLS_asFunctionalComponent(__VLS_160, new __VLS_160({
    ...{ class: "section-card" },
}));
const __VLS_162 = __VLS_161({
    ...{ class: "section-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_161));
__VLS_163.slots.default;
const __VLS_164 = {}.AGrid;
/** @type {[typeof __VLS_components.AGrid, typeof __VLS_components.aGrid, typeof __VLS_components.AGrid, typeof __VLS_components.aGrid, ]} */ 
// @ts-ignore
const __VLS_165 = __VLS_asFunctionalComponent(__VLS_164, new __VLS_164({
    cols: (2),
    colGap: (16),
    rowGap: (16),
}));
const __VLS_166 = __VLS_165({
    cols: (2),
    colGap: (16),
    rowGap: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_165));
__VLS_167.slots.default;
const __VLS_168 = {}.AGridItem;
/** @type {[typeof __VLS_components.AGridItem, typeof __VLS_components.aGridItem, typeof __VLS_components.AGridItem, typeof __VLS_components.aGridItem, ]} */ 
// @ts-ignore
const __VLS_169 = __VLS_asFunctionalComponent(__VLS_168, new __VLS_168({}));
const __VLS_170 = __VLS_169({}, ...__VLS_functionalComponentArgsRest(__VLS_169));
__VLS_171.slots.default;
const __VLS_172 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_173 = __VLS_asFunctionalComponent(__VLS_172, new __VLS_172({
    field: "templateId",
    label: "券模版",
    required: true,
}));
const __VLS_174 = __VLS_173({
    field: "templateId",
    label: "券模版",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_173));
__VLS_175.slots.default;
{
    const { help: __VLS_thisSlot } = __VLS_175.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "help-text" },
    });
}
const __VLS_176 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ 
// @ts-ignore
const __VLS_177 = __VLS_asFunctionalComponent(__VLS_176, new __VLS_176({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.formData.templateId),
    placeholder: "请选择券模版",
    allowClear: true,
}));
const __VLS_178 = __VLS_177({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.formData.templateId),
    placeholder: "请选择券模版",
    allowClear: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_177));
let __VLS_180;
let __VLS_181;
let __VLS_182;
const __VLS_183 = {
    onChange: (__VLS_ctx.handleTemplateChange)
};
__VLS_179.slots.default;
for (const [template] of __VLS_getVForSourceType((__VLS_ctx.templateOptions))) {
    const __VLS_184 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
    // @ts-ignore
    const __VLS_185 = __VLS_asFunctionalComponent(__VLS_184, new __VLS_184({
        key: (template.id),
        value: (template.id),
    }));
    const __VLS_186 = __VLS_185({
        key: (template.id),
        value: (template.id),
    }, ...__VLS_functionalComponentArgsRest(__VLS_185));
    __VLS_187.slots.default;
    (template.name);
    var __VLS_187;
}
let __VLS_179;
let __VLS_175;
let __VLS_171;
const __VLS_188 = {}.AGridItem;
/** @type {[typeof __VLS_components.AGridItem, typeof __VLS_components.aGridItem, typeof __VLS_components.AGridItem, typeof __VLS_components.aGridItem, ]} */ 
// @ts-ignore
const __VLS_189 = __VLS_asFunctionalComponent(__VLS_188, new __VLS_188({}));
const __VLS_190 = __VLS_189({}, ...__VLS_functionalComponentArgsRest(__VLS_189));
__VLS_191.slots.default;
const __VLS_192 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_193 = __VLS_asFunctionalComponent(__VLS_192, new __VLS_192({
    field: "auditor",
    label: "审核员",
    required: true,
}));
const __VLS_194 = __VLS_193({
    field: "auditor",
    label: "审核员",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_193));
__VLS_195.slots.default;
{
    const { help: __VLS_thisSlot } = __VLS_195.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "help-text" },
    });
}
const __VLS_196 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ 
// @ts-ignore
const __VLS_197 = __VLS_asFunctionalComponent(__VLS_196, new __VLS_196({
    modelValue: (__VLS_ctx.formData.auditor),
    placeholder: "请选择审核员",
    allowClear: true,
}));
const __VLS_198 = __VLS_197({
    modelValue: (__VLS_ctx.formData.auditor),
    placeholder: "请选择审核员",
    allowClear: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_197));
__VLS_199.slots.default;
for (const [user] of __VLS_getVForSourceType((__VLS_ctx.auditorOptions))) {
    const __VLS_200 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
    // @ts-ignore
    const __VLS_201 = __VLS_asFunctionalComponent(__VLS_200, new __VLS_200({
        key: (user.id),
        value: (user.id),
    }));
    const __VLS_202 = __VLS_201({
        key: (user.id),
        value: (user.id),
    }, ...__VLS_functionalComponentArgsRest(__VLS_201));
    __VLS_203.slots.default;
    (user.name);
    var __VLS_203;
}
let __VLS_199;
let __VLS_195;
let __VLS_191;
const __VLS_204 = {}.AGridItem;
/** @type {[typeof __VLS_components.AGridItem, typeof __VLS_components.aGridItem, typeof __VLS_components.AGridItem, typeof __VLS_components.aGridItem, ]} */ 
// @ts-ignore
const __VLS_205 = __VLS_asFunctionalComponent(__VLS_204, new __VLS_204({}));
const __VLS_206 = __VLS_205({}, ...__VLS_functionalComponentArgsRest(__VLS_205));
__VLS_207.slots.default;
const __VLS_208 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_209 = __VLS_asFunctionalComponent(__VLS_208, new __VLS_208({
    field: "operator",
    label: "录入员",
    required: true,
}));
const __VLS_210 = __VLS_209({
    field: "operator",
    label: "录入员",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_209));
__VLS_211.slots.default;
{
    const { help: __VLS_thisSlot } = __VLS_211.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "help-text" },
    });
}
const __VLS_212 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ 
// @ts-ignore
const __VLS_213 = __VLS_asFunctionalComponent(__VLS_212, new __VLS_212({
    modelValue: (__VLS_ctx.formData.operator),
    readonly: true,
    disabled: true,
}));
const __VLS_214 = __VLS_213({
    modelValue: (__VLS_ctx.formData.operator),
    readonly: true,
    disabled: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_213));
let __VLS_211;
let __VLS_207;
const __VLS_216 = {}.AGridItem;
/** @type {[typeof __VLS_components.AGridItem, typeof __VLS_components.aGridItem, typeof __VLS_components.AGridItem, typeof __VLS_components.aGridItem, ]} */ 
// @ts-ignore
const __VLS_217 = __VLS_asFunctionalComponent(__VLS_216, new __VLS_216({}));
const __VLS_218 = __VLS_217({}, ...__VLS_functionalComponentArgsRest(__VLS_217));
__VLS_219.slots.default;
const __VLS_220 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_221 = __VLS_asFunctionalComponent(__VLS_220, new __VLS_220({
    field: "name",
    label: "券名称",
    required: true,
}));
const __VLS_222 = __VLS_221({
    field: "name",
    label: "券名称",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_221));
__VLS_223.slots.default;
{
    const { help: __VLS_thisSlot } = __VLS_223.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "help-text" },
    });
}
const __VLS_224 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ 
// @ts-ignore
const __VLS_225 = __VLS_asFunctionalComponent(__VLS_224, new __VLS_224({
    modelValue: (__VLS_ctx.formData.name),
    placeholder: "请输入券名称",
    allowClear: true,
}));
const __VLS_226 = __VLS_225({
    modelValue: (__VLS_ctx.formData.name),
    placeholder: "请输入券名称",
    allowClear: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_225));
let __VLS_223;
let __VLS_219;
const __VLS_228 = {}.AGridItem;
/** @type {[typeof __VLS_components.AGridItem, typeof __VLS_components.aGridItem, typeof __VLS_components.AGridItem, typeof __VLS_components.aGridItem, ]} */ 
// @ts-ignore
const __VLS_229 = __VLS_asFunctionalComponent(__VLS_228, new __VLS_228({}));
const __VLS_230 = __VLS_229({}, ...__VLS_functionalComponentArgsRest(__VLS_229));
__VLS_231.slots.default;
const __VLS_232 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_233 = __VLS_asFunctionalComponent(__VLS_232, new __VLS_232({
    field: "totalCount",
    label: "发放数量",
    required: true,
}));
const __VLS_234 = __VLS_233({
    field: "totalCount",
    label: "发放数量",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_233));
__VLS_235.slots.default;
{
    const { help: __VLS_thisSlot } = __VLS_235.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "help-text" },
    });
}
const __VLS_236 = {}.AInputNumber;
/** @type {[typeof __VLS_components.AInputNumber, typeof __VLS_components.aInputNumber, ]} */ 
// @ts-ignore
const __VLS_237 = __VLS_asFunctionalComponent(__VLS_236, new __VLS_236({
    modelValue: (__VLS_ctx.formData.totalCount),
    placeholder: "请输入发放数量",
    min: (1),
    max: (999999),
    step: (1),
}));
const __VLS_238 = __VLS_237({
    modelValue: (__VLS_ctx.formData.totalCount),
    placeholder: "请输入发放数量",
    min: (1),
    max: (999999),
    step: (1),
}, ...__VLS_functionalComponentArgsRest(__VLS_237));
let __VLS_235;
let __VLS_231;
const __VLS_240 = {}.AGridItem;
/** @type {[typeof __VLS_components.AGridItem, typeof __VLS_components.aGridItem, typeof __VLS_components.AGridItem, typeof __VLS_components.aGridItem, ]} */ 
// @ts-ignore
const __VLS_241 = __VLS_asFunctionalComponent(__VLS_240, new __VLS_240({}));
const __VLS_242 = __VLS_241({}, ...__VLS_functionalComponentArgsRest(__VLS_241));
__VLS_243.slots.default;
const __VLS_244 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_245 = __VLS_asFunctionalComponent(__VLS_244, new __VLS_244({
    field: "dailyLimit",
    label: "单日发放上限",
}));
const __VLS_246 = __VLS_245({
    field: "dailyLimit",
    label: "单日发放上限",
}, ...__VLS_functionalComponentArgsRest(__VLS_245));
__VLS_247.slots.default;
{
    const { help: __VLS_thisSlot } = __VLS_247.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "help-text" },
    });
}
const __VLS_248 = {}.AInputNumber;
/** @type {[typeof __VLS_components.AInputNumber, typeof __VLS_components.aInputNumber, ]} */ 
// @ts-ignore
const __VLS_249 = __VLS_asFunctionalComponent(__VLS_248, new __VLS_248({
    modelValue: (__VLS_ctx.formData.dailyLimit),
    placeholder: "请输入单日发放上限",
    min: (1),
    max: (__VLS_ctx.formData.totalCount),
    step: (1),
}));
const __VLS_250 = __VLS_249({
    modelValue: (__VLS_ctx.formData.dailyLimit),
    placeholder: "请输入单日发放上限",
    min: (1),
    max: (__VLS_ctx.formData.totalCount),
    step: (1),
}, ...__VLS_functionalComponentArgsRest(__VLS_249));
let __VLS_247;
let __VLS_243;
const __VLS_252 = {}.AGridItem;
/** @type {[typeof __VLS_components.AGridItem, typeof __VLS_components.aGridItem, typeof __VLS_components.AGridItem, typeof __VLS_components.aGridItem, ]} */ 
// @ts-ignore
const __VLS_253 = __VLS_asFunctionalComponent(__VLS_252, new __VLS_252({}));
const __VLS_254 = __VLS_253({}, ...__VLS_functionalComponentArgsRest(__VLS_253));
__VLS_255.slots.default;
const __VLS_256 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_257 = __VLS_asFunctionalComponent(__VLS_256, new __VLS_256({
    field: "weeklyLimit",
    label: "单周发放上限",
}));
const __VLS_258 = __VLS_257({
    field: "weeklyLimit",
    label: "单周发放上限",
}, ...__VLS_functionalComponentArgsRest(__VLS_257));
__VLS_259.slots.default;
{
    const { help: __VLS_thisSlot } = __VLS_259.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "help-text" },
    });
}
const __VLS_260 = {}.AInputNumber;
/** @type {[typeof __VLS_components.AInputNumber, typeof __VLS_components.aInputNumber, ]} */ 
// @ts-ignore
const __VLS_261 = __VLS_asFunctionalComponent(__VLS_260, new __VLS_260({
    modelValue: (__VLS_ctx.formData.weeklyLimit),
    placeholder: "请输入单周发放上限",
    min: (1),
    max: (__VLS_ctx.formData.totalCount),
    step: (1),
}));
const __VLS_262 = __VLS_261({
    modelValue: (__VLS_ctx.formData.weeklyLimit),
    placeholder: "请输入单周发放上限",
    min: (1),
    max: (__VLS_ctx.formData.totalCount),
    step: (1),
}, ...__VLS_functionalComponentArgsRest(__VLS_261));
let __VLS_259;
let __VLS_255;
const __VLS_264 = {}.AGridItem;
/** @type {[typeof __VLS_components.AGridItem, typeof __VLS_components.aGridItem, typeof __VLS_components.AGridItem, typeof __VLS_components.aGridItem, ]} */ 
// @ts-ignore
const __VLS_265 = __VLS_asFunctionalComponent(__VLS_264, new __VLS_264({}));
const __VLS_266 = __VLS_265({}, ...__VLS_functionalComponentArgsRest(__VLS_265));
__VLS_267.slots.default;
const __VLS_268 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_269 = __VLS_asFunctionalComponent(__VLS_268, new __VLS_268({
    field: "monthlyLimit",
    label: "单月发放上限",
}));
const __VLS_270 = __VLS_269({
    field: "monthlyLimit",
    label: "单月发放上限",
}, ...__VLS_functionalComponentArgsRest(__VLS_269));
__VLS_271.slots.default;
{
    const { help: __VLS_thisSlot } = __VLS_271.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "help-text" },
    });
}
const __VLS_272 = {}.AInputNumber;
/** @type {[typeof __VLS_components.AInputNumber, typeof __VLS_components.aInputNumber, ]} */ 
// @ts-ignore
const __VLS_273 = __VLS_asFunctionalComponent(__VLS_272, new __VLS_272({
    modelValue: (__VLS_ctx.formData.monthlyLimit),
    placeholder: "请输入单月发放上限",
    min: (1),
    max: (__VLS_ctx.formData.totalCount),
    step: (1),
}));
const __VLS_274 = __VLS_273({
    modelValue: (__VLS_ctx.formData.monthlyLimit),
    placeholder: "请输入单月发放上限",
    min: (1),
    max: (__VLS_ctx.formData.totalCount),
    step: (1),
}, ...__VLS_functionalComponentArgsRest(__VLS_273));
let __VLS_271;
let __VLS_267;
const __VLS_276 = {}.AGridItem;
/** @type {[typeof __VLS_components.AGridItem, typeof __VLS_components.aGridItem, typeof __VLS_components.AGridItem, typeof __VLS_components.aGridItem, ]} */ 
// @ts-ignore
const __VLS_277 = __VLS_asFunctionalComponent(__VLS_276, new __VLS_276({
    span: (24),
}));
const __VLS_278 = __VLS_277({
    span: (24),
}, ...__VLS_functionalComponentArgsRest(__VLS_277));
__VLS_279.slots.default;
const __VLS_280 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_281 = __VLS_asFunctionalComponent(__VLS_280, new __VLS_280({
    field: "usageScenarios",
    label: "券使用场景",
}));
const __VLS_282 = __VLS_281({
    field: "usageScenarios",
    label: "券使用场景",
}, ...__VLS_functionalComponentArgsRest(__VLS_281));
__VLS_283.slots.default;
{
    const { help: __VLS_thisSlot } = __VLS_283.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "help-text" },
    });
}
const __VLS_284 = {}.ACheckboxGroup;
/** @type {[typeof __VLS_components.ACheckboxGroup, typeof __VLS_components.aCheckboxGroup, typeof __VLS_components.ACheckboxGroup, typeof __VLS_components.aCheckboxGroup, ]} */ 
// @ts-ignore
const __VLS_285 = __VLS_asFunctionalComponent(__VLS_284, new __VLS_284({
    modelValue: (__VLS_ctx.formData.usageScenarios),
}));
const __VLS_286 = __VLS_285({
    modelValue: (__VLS_ctx.formData.usageScenarios),
}, ...__VLS_functionalComponentArgsRest(__VLS_285));
__VLS_287.slots.default;
const __VLS_288 = {}.ACheckbox;
/** @type {[typeof __VLS_components.ACheckbox, typeof __VLS_components.aCheckbox, typeof __VLS_components.ACheckbox, typeof __VLS_components.aCheckbox, ]} */ 
// @ts-ignore
const __VLS_289 = __VLS_asFunctionalComponent(__VLS_288, new __VLS_288({
    value: "batch_distribution",
}));
const __VLS_290 = __VLS_289({
    value: "batch_distribution",
}, ...__VLS_functionalComponentArgsRest(__VLS_289));
__VLS_291.slots.default;
let __VLS_291;
const __VLS_292 = {}.ACheckbox;
/** @type {[typeof __VLS_components.ACheckbox, typeof __VLS_components.aCheckbox, typeof __VLS_components.ACheckbox, typeof __VLS_components.aCheckbox, ]} */ 
// @ts-ignore
const __VLS_293 = __VLS_asFunctionalComponent(__VLS_292, new __VLS_292({
    value: "telemarketing",
}));
const __VLS_294 = __VLS_293({
    value: "telemarketing",
}, ...__VLS_functionalComponentArgsRest(__VLS_293));
__VLS_295.slots.default;
let __VLS_295;
let __VLS_287;
let __VLS_283;
let __VLS_279;
const __VLS_296 = {}.AGridItem;
/** @type {[typeof __VLS_components.AGridItem, typeof __VLS_components.aGridItem, typeof __VLS_components.AGridItem, typeof __VLS_components.aGridItem, ]} */ 
// @ts-ignore
const __VLS_297 = __VLS_asFunctionalComponent(__VLS_296, new __VLS_296({
    span: (24),
}));
const __VLS_298 = __VLS_297({
    span: (24),
}, ...__VLS_functionalComponentArgsRest(__VLS_297));
__VLS_299.slots.default;
const __VLS_300 = {}.AAlert;
/** @type {[typeof __VLS_components.AAlert, typeof __VLS_components.aAlert, typeof __VLS_components.AAlert, typeof __VLS_components.aAlert, ]} */ 
// @ts-ignore
const __VLS_301 = __VLS_asFunctionalComponent(__VLS_300, new __VLS_300({
    type: "info",
}));
const __VLS_302 = __VLS_301({
    type: "info",
}, ...__VLS_functionalComponentArgsRest(__VLS_301));
__VLS_303.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_303.slots;
    const __VLS_304 = {}.IconInfoCircle;
    /** @type {[typeof __VLS_components.IconInfoCircle, typeof __VLS_components.iconInfoCircle, ]} */ 
    // @ts-ignore
    const __VLS_305 = __VLS_asFunctionalComponent(__VLS_304, new __VLS_304({}));
    const __VLS_306 = __VLS_305({}, ...__VLS_functionalComponentArgsRest(__VLS_305));
}
(__VLS_ctx.formData.userLimitDesc);
let __VLS_303;
let __VLS_299;
const __VLS_308 = {}.AGridItem;
/** @type {[typeof __VLS_components.AGridItem, typeof __VLS_components.aGridItem, typeof __VLS_components.AGridItem, typeof __VLS_components.aGridItem, ]} */ 
// @ts-ignore
const __VLS_309 = __VLS_asFunctionalComponent(__VLS_308, new __VLS_308({}));
const __VLS_310 = __VLS_309({}, ...__VLS_functionalComponentArgsRest(__VLS_309));
__VLS_311.slots.default;
const __VLS_312 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_313 = __VLS_asFunctionalComponent(__VLS_312, new __VLS_312({
    field: "validityType",
    label: "有效期类型",
    required: true,
}));
const __VLS_314 = __VLS_313({
    field: "validityType",
    label: "有效期类型",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_313));
__VLS_315.slots.default;
{
    const { help: __VLS_thisSlot } = __VLS_315.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "help-text" },
    });
}
const __VLS_316 = {}.ARadioGroup;
/** @type {[typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, ]} */ 
// @ts-ignore
const __VLS_317 = __VLS_asFunctionalComponent(__VLS_316, new __VLS_316({
    modelValue: (__VLS_ctx.formData.validityType),
}));
const __VLS_318 = __VLS_317({
    modelValue: (__VLS_ctx.formData.validityType),
}, ...__VLS_functionalComponentArgsRest(__VLS_317));
__VLS_319.slots.default;
const __VLS_320 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ 
// @ts-ignore
const __VLS_321 = __VLS_asFunctionalComponent(__VLS_320, new __VLS_320({
    value: "absolute",
}));
const __VLS_322 = __VLS_321({
    value: "absolute",
}, ...__VLS_functionalComponentArgsRest(__VLS_321));
__VLS_323.slots.default;
let __VLS_323;
const __VLS_324 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ 
// @ts-ignore
const __VLS_325 = __VLS_asFunctionalComponent(__VLS_324, new __VLS_324({
    value: "relative",
}));
const __VLS_326 = __VLS_325({
    value: "relative",
}, ...__VLS_functionalComponentArgsRest(__VLS_325));
__VLS_327.slots.default;
let __VLS_327;
let __VLS_319;
let __VLS_315;
const __VLS_328 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_329 = __VLS_asFunctionalComponent(__VLS_328, new __VLS_328({
    field: "validity",
    label: "有效期",
    required: true,
}));
const __VLS_330 = __VLS_329({
    field: "validity",
    label: "有效期",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_329));
__VLS_331.slots.default;
{
    const { help: __VLS_thisSlot } = __VLS_331.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "help-text" },
    });
}
const __VLS_332 = {}.ARangePicker;
/** @type {[typeof __VLS_components.ARangePicker, typeof __VLS_components.aRangePicker, ]} */ 
// @ts-ignore
const __VLS_333 = __VLS_asFunctionalComponent(__VLS_332, new __VLS_332({
    modelValue: (__VLS_ctx.formData.validity),
    showTime: true,
    ...{ style: {} },
}));
const __VLS_334 = __VLS_333({
    modelValue: (__VLS_ctx.formData.validity),
    showTime: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_333));
let __VLS_331;
if (__VLS_ctx.formData.validityType === 'relative') {
    const __VLS_336 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
    // @ts-ignore
    const __VLS_337 = __VLS_asFunctionalComponent(__VLS_336, new __VLS_336({
        field: "relativeDays",
        label: "相对有效期",
        required: true,
    }));
    const __VLS_338 = __VLS_337({
        field: "relativeDays",
        label: "相对有效期",
        required: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_337));
    __VLS_339.slots.default;
    {
        const { help: __VLS_thisSlot } = __VLS_339.slots;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "help-text" },
        });
    }
    const __VLS_340 = {}.AInputNumber;
    /** @type {[typeof __VLS_components.AInputNumber, typeof __VLS_components.aInputNumber, ]} */ 
    // @ts-ignore
    const __VLS_341 = __VLS_asFunctionalComponent(__VLS_340, new __VLS_340({
        modelValue: (__VLS_ctx.formData.relativeDays),
        min: (1),
        max: (45),
        step: (1),
        ...{ style: {} },
    }));
    const __VLS_342 = __VLS_341({
        modelValue: (__VLS_ctx.formData.relativeDays),
        min: (1),
        max: (45),
        step: (1),
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_341));
    let __VLS_339;
}
let __VLS_311;
let __VLS_167;
const __VLS_344 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_345 = __VLS_asFunctionalComponent(__VLS_344, new __VLS_344({
    field: "rules",
    label: "使用规则说明",
}));
const __VLS_346 = __VLS_345({
    field: "rules",
    label: "使用规则说明",
}, ...__VLS_functionalComponentArgsRest(__VLS_345));
__VLS_347.slots.default;
{
    const { help: __VLS_thisSlot } = __VLS_347.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "help-text" },
    });
}
const __VLS_348 = {}.ATextarea;
/** @type {[typeof __VLS_components.ATextarea, typeof __VLS_components.aTextarea, ]} */ 
// @ts-ignore
const __VLS_349 = __VLS_asFunctionalComponent(__VLS_348, new __VLS_348({
    modelValue: (__VLS_ctx.formData.rules),
    placeholder: "请输入使用规则说明",
    maxLength: (200),
    showWordLimit: true,
}));
const __VLS_350 = __VLS_349({
    modelValue: (__VLS_ctx.formData.rules),
    placeholder: "请输入使用规则说明",
    maxLength: (200),
    showWordLimit: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_349));
let __VLS_347;
let __VLS_163;
let __VLS_157;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "form-actions" },
});
const __VLS_352 = {}.ASpace;
/** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ 
// @ts-ignore
const __VLS_353 = __VLS_asFunctionalComponent(__VLS_352, new __VLS_352({}));
const __VLS_354 = __VLS_353({}, ...__VLS_functionalComponentArgsRest(__VLS_353));
__VLS_355.slots.default;
const __VLS_356 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
// @ts-ignore
const __VLS_357 = __VLS_asFunctionalComponent(__VLS_356, new __VLS_356({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_358 = __VLS_357({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_357));
let __VLS_360;
let __VLS_361;
let __VLS_362;
const __VLS_363 = {
    onClick: (__VLS_ctx.handleSubmit)
};
__VLS_359.slots.default;
let __VLS_359;
const __VLS_364 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
// @ts-ignore
const __VLS_365 = __VLS_asFunctionalComponent(__VLS_364, new __VLS_364({
    ...{ 'onClick': {} },
}));
const __VLS_366 = __VLS_365({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_365));
let __VLS_368;
let __VLS_369;
let __VLS_370;
const __VLS_371 = {
    onClick: (__VLS_ctx.resetForm)
};
__VLS_367.slots.default;
let __VLS_367;
let __VLS_355;
let __VLS_148;
/** @type {__VLS_StyleScopedClasses['coupon-container']} */ 
/** @type {__VLS_StyleScopedClasses['header-actions']} */ 
/** @type {__VLS_StyleScopedClasses['create-coupon-container']} */ 
/** @type {__VLS_StyleScopedClasses['page-header']} */ 
/** @type {__VLS_StyleScopedClasses['page-title']} */ 
/** @type {__VLS_StyleScopedClasses['section-card']} */ 
/** @type {__VLS_StyleScopedClasses['help-text']} */ 
/** @type {__VLS_StyleScopedClasses['help-text']} */ 
/** @type {__VLS_StyleScopedClasses['help-text']} */ 
/** @type {__VLS_StyleScopedClasses['help-text']} */ 
/** @type {__VLS_StyleScopedClasses['help-text']} */ 
/** @type {__VLS_StyleScopedClasses['help-text']} */ 
/** @type {__VLS_StyleScopedClasses['help-text']} */ 
/** @type {__VLS_StyleScopedClasses['help-text']} */ 
/** @type {__VLS_StyleScopedClasses['help-text']} */ 
/** @type {__VLS_StyleScopedClasses['help-text']} */ 
/** @type {__VLS_StyleScopedClasses['help-text']} */ 
/** @type {__VLS_StyleScopedClasses['help-text']} */ 
/** @type {__VLS_StyleScopedClasses['help-text']} */ 
/** @type {__VLS_StyleScopedClasses['form-actions']} */ 
// @ts-ignore
const __VLS_159 = __VLS_158;
let __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            IconPlus: IconPlus,
            IconInfoCircle: IconInfoCircle,
            tableData: tableData,
            loading: loading,
            searchKeyword: searchKeyword,
            pagination: pagination,
            showCreateModal: showCreateModal,
            formRef: formRef,
            templateOptions: templateOptions,
            handleViewDetail: handleViewDetail,
            auditorOptions: auditorOptions,
            operatorOptions: operatorOptions,
            formData: formData,
            rules: rules,
            handleSearch: handleSearch,
            onPageChange: onPageChange,
            onPageSizeChange: onPageSizeChange,
            getStatusColor: getStatusColor,
            handleTemplateChange: handleTemplateChange,
            resetForm: resetForm,
            handleSubmit: handleSubmit,
            handlePause: handlePause,
            handleEdit: handleEdit,
            handleOnline: handleOnline,
            handleWithdraw: handleWithdraw,
            handleDelete: handleDelete,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
 /* PartiallyEnd: #4569/main.vue */
