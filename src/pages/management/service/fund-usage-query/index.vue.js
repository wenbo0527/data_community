/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { Table as ATable, TableColumn as ATableColumn, Button as AButton, Input as AInput, Textarea as ATextarea, Select as ASelect, Option as AOption, Form as AForm, FormItem as AFormItem, Card as ACard, Steps as ASteps, Step as AStep, Row as ARow, Col as ACol, RadioGroup as ARadioGroup, Radio as ARadio, RangePicker as ARangePicker, Tag as ATag, Descriptions as ADescriptions, DescriptionsItem as ADescriptionsItem, Message } from '@arco-design/web-vue';
import { useRouter } from 'vue-router';
const router = useRouter();
// 步骤控制
const currentStep = ref(0);
const nextStep = () => {
    console.log('=== nextStep 函数调用 ===', {
        timestamp: new Date().toLocaleTimeString(),
        currentStep: currentStep.value,
        selectedLoanKeys: selectedLoanKeys.value,
        selectedLoanKeysLength: selectedLoanKeys.value?.length || 0,
        isNextButtonDisabled: isNextButtonDisabled.value
    });
    if (currentStep.value < 2) {
        currentStep.value++;
        console.log('步骤已更新到:', currentStep.value);
    }
};
const prevStep = () => {
    if (currentStep.value > 0) {
        currentStep.value--;
    }
};
// 查询类型
const queryType = ref('idQuery');
// 查询表单
const queryForm = reactive({
    externalDataOption: 'fundUsage',
    idNumbers: '',
    usageTimeRange: null,
    loanStatus: ''
});
// 样本表单
const sampleForm = reactive({
    database: '',
    table: '',
    description: ''
});
// 参数映射
const parameterMappings = ref([
    { sourceColumn: 'column1', targetColumn: '', required: true, description: '源列1' },
    { sourceColumn: 'column2', targetColumn: '', required: false, description: '源列2' },
    { sourceColumn: 'column3', targetColumn: '', required: false, description: '源列3' }
]);
// 参数列表格配置
const parameterColumns = [
    {
        title: '源列名',
        dataIndex: 'sourceColumn',
        width: 120
    },
    {
        title: '目标列',
        dataIndex: 'targetColumn',
        slotName: 'targetColumn',
        width: 200
    },
    {
        title: '是否必填',
        dataIndex: 'required',
        slotName: 'required',
        width: 100
    },
    {
        title: '描述',
        dataIndex: 'description',
        width: 150
    }
];
// 借据筛选
const loanFilter = reactive({
    keyword: '',
    status: ''
});
// 借据数据
const loanData = ref([]);
const loanLoading = ref(false);
const selectedLoanKeys = ref([]);
const selectedLoans = ref([]);
// 确保 selectedLoanKeys 正确初始化
// 借据分页
const loanPagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
    showTotal: true,
    showPageSize: true
});
// 借据表格列配置
const loanColumns = [
    {
        title: '客户信息',
        dataIndex: 'customerName',
        slotName: 'customerName',
        width: 180
    },
    {
        title: '借据编号',
        dataIndex: 'loanNumber',
        width: 150
    },
    {
        title: '借款金额',
        dataIndex: 'loanAmount',
        slotName: 'loanAmount',
        width: 120
    },
    {
        title: '支用时间',
        dataIndex: 'usageTime',
        width: 120
    },
    {
        title: '到期时间',
        dataIndex: 'dueTime',
        width: 120
    },
    {
        title: '借据状态',
        dataIndex: 'status',
        slotName: 'status',
        width: 100
    },
    {
        title: '资金用途',
        dataIndex: 'fundPurpose',
        width: 150
    }
];
// 摘要表格列配置
const summaryColumns = [
    {
        title: '客户信息',
        dataIndex: 'customerName',
        slotName: 'customerName',
        width: 150
    },
    {
        title: '借据编号',
        dataIndex: 'loanNumber',
        width: 130
    },
    {
        title: '借款金额',
        dataIndex: 'loanAmount',
        slotName: 'loanAmount',
        width: 100
    },
    {
        title: '支用时间',
        dataIndex: 'usageTime',
        width: 100
    },
    {
        title: '状态',
        dataIndex: 'status',
        slotName: 'status',
        width: 80
    },
    {
        title: '资金用途',
        dataIndex: 'fundPurpose',
        width: 120
    }
];
// 筛选后的借据数据
const filteredLoanData = computed(() => {
    let result = [...loanData.value];
    console.log('=== filteredLoanData 计算属性执行 ===', {
        timestamp: new Date().toLocaleTimeString(),
        originalDataLength: loanData.value?.length || 0,
        loanFilter: loanFilter,
        hasKeywordFilter: !!loanFilter.keyword,
        hasStatusFilter: !!loanFilter.status
    });
    if (loanFilter.keyword) {
        result = result.filter(item => item.customerName.includes(loanFilter.keyword) ||
            item.idNumber.includes(loanFilter.keyword));
        console.log('关键词筛选后数据长度:', result.length);
    }
    if (loanFilter.status) {
        result = result.filter(item => item.status === loanFilter.status);
        console.log('状态筛选后数据长度:', result.length);
    }
    loanPagination.total = result.length;
    console.log('=== filteredLoanData 最终结果 ===', {
        filteredLength: result.length,
        firstFewItems: result.slice(0, 3).map(item => ({ id: item.id, customerName: item.customerName }))
    });
    return result;
});
// 唯一客户数
const uniqueCustomers = computed(() => {
    const customerMap = new Map();
    selectedLoans.value.forEach(loan => {
        customerMap.set(loan.idNumber, {
            name: loan.customerName,
            idNumber: loan.idNumber
        });
    });
    return Array.from(customerMap.values());
});
// 按钮禁用状态计算属性
const isNextButtonDisabled = computed(() => {
    const disabled = !selectedLoanKeys.value || selectedLoanKeys.value.length === 0;
    console.log('=== 按钮禁用状态计算 ===', {
        timestamp: new Date().toLocaleTimeString(),
        selectedLoanKeys: selectedLoanKeys.value,
        selectedLoanKeysLength: selectedLoanKeys.value?.length || 0,
        disabled: disabled
    });
    return disabled;
});
// 处理表格选择变化
const onLoanSelectionChange = (selectedKeys) => {
    console.log('🎯 === onLoanSelectionChange 事件触发 ===', {
        timestamp: new Date().toLocaleTimeString(),
        selectedKeys: selectedKeys,
        selectedKeysLength: selectedKeys?.length || 0,
        selectedKeysType: typeof selectedKeys,
        currentSelectedLoanKeys: selectedLoanKeys.value,
        currentSelectedLoanKeysLength: selectedLoanKeys.value?.length || 0,
        filteredLoanDataLength: filteredLoanData.value?.length || 0,
        availableIds: filteredLoanData.value?.map(item => item.id) || []
    });
    // 根据选中的 keys 获取对应的行数据
    const selectedRows = filteredLoanData.value.filter(row => selectedKeys.includes(row.id));
    console.log('🎯 === onLoanSelectionChange 调用 handleLoanSelection ===', {
        selectedKeys: selectedKeys,
        selectedRows: selectedRows,
        selectedRowsLength: selectedRows?.length || 0,
        selectedRowsDetails: selectedRows.map(row => ({ id: row.id, customerName: row.customerName }))
    });
    handleLoanSelection(selectedKeys, selectedRows);
};
// 表格行选择配置
const rowSelection = computed(() => ({
    type: 'checkbox',
    selectedRowKeys: selectedLoanKeys.value,
    onSelectionChange: onLoanSelectionChange
}));
// 查询借据
const searchLoans = () => {
    console.log('=== searchLoans 函数开始执行 ===', {
        timestamp: new Date().toLocaleTimeString(),
        currentLoanDataLength: loanData.value?.length || 0,
        queryForm: queryForm
    });
    loanLoading.value = true;
    // 解析身份证号
    const idNumbers = queryForm.idNumbers
        .split('\n')
        .map(id => id.trim())
        .filter(id => id.length > 0);
    console.log('=== 身份证号解析结果 ===', {
        originalInput: queryForm.idNumbers,
        parsedIdNumbers: idNumbers,
        count: idNumbers.length
    });
    if (idNumbers.length === 0) {
        Message.error('请输入至少一个身份证号');
        loanLoading.value = false;
        return;
    }
    // 模拟查询借据数据
    setTimeout(() => {
        console.log('=== 开始生成模拟借据数据 ===', {
            timestamp: new Date().toLocaleTimeString()
        });
        const mockLoans = [];
        const customerNames = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十'];
        const fundPurposes = ['经营周转', '设备采购', '原材料采购', '流动资金', '技术改造', '扩大生产'];
        const statuses = ['active', 'overdue', 'settled', 'written-off'];
        idNumbers.forEach((idNumber, customerIndex) => {
            // 为身份证号111的用户提供特定的mock数据
            if (idNumber === '111') {
                const specificLoans = [
                    {
                        id: 'loan-111-1',
                        customerName: '测试用户',
                        idNumber: '111',
                        loanNumber: 'JJ111001',
                        loanAmount: 500000,
                        usageTime: '2024-01-15',
                        dueTime: '2025-01-15',
                        status: 'active',
                        fundPurpose: '经营周转'
                    },
                    {
                        id: 'loan-111-2',
                        customerName: '测试用户',
                        idNumber: '111',
                        loanNumber: 'JJ111002',
                        loanAmount: 300000,
                        usageTime: '2024-03-20',
                        dueTime: '2025-03-20',
                        status: 'active',
                        fundPurpose: '设备采购'
                    },
                    {
                        id: 'loan-111-3',
                        customerName: '测试用户',
                        idNumber: '111',
                        loanNumber: 'JJ111003',
                        loanAmount: 200000,
                        usageTime: '2023-12-10',
                        dueTime: '2024-12-10',
                        status: 'settled',
                        fundPurpose: '流动资金'
                    }
                ];
                mockLoans.push(...specificLoans);
                console.log('=== 为身份证号111生成特定数据 ===', {
                    count: specificLoans.length,
                    loans: specificLoans
                });
            }
            else {
                // 其他用户生成随机数据
                const loanCount = Math.floor(Math.random() * 3) + 1;
                for (let i = 0; i < loanCount; i++) {
                    const usageDate = new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
                    const dueDate = new Date(usageDate.getTime() + (Math.floor(Math.random() * 365) + 30) * 24 * 60 * 60 * 1000);
                    mockLoans.push({
                        id: `loan-${customerIndex}-${i}`,
                        customerName: customerNames[customerIndex % customerNames.length],
                        idNumber: idNumber,
                        loanNumber: `JJ${String(customerIndex + 1).padStart(3, '0')}${String(i + 1).padStart(3, '0')}`,
                        loanAmount: Math.floor(Math.random() * 1000000) + 50000,
                        usageTime: usageDate.toISOString().split('T')[0],
                        dueTime: dueDate.toISOString().split('T')[0],
                        status: statuses[Math.floor(Math.random() * statuses.length)],
                        fundPurpose: fundPurposes[Math.floor(Math.random() * fundPurposes.length)]
                    });
                }
                console.log(`=== 为身份证号${idNumber}生成随机数据 ===`, {
                    idNumber: idNumber,
                    loanCount: loanCount
                });
            }
        });
        console.log('=== 原始模拟数据生成完成 ===', {
            totalCount: mockLoans.length,
            firstFewItems: mockLoans.slice(0, 3).map(item => ({ id: item.id, customerName: item.customerName }))
        });
        // 按支用时间倒序排列
        mockLoans.sort((a, b) => new Date(b.usageTime) - new Date(a.usageTime));
        // 应用时间范围筛选
        let filteredLoans = mockLoans;
        if (queryForm.usageTimeRange && queryForm.usageTimeRange.length === 2) {
            const startDate = new Date(queryForm.usageTimeRange[0]);
            const endDate = new Date(queryForm.usageTimeRange[1]);
            filteredLoans = mockLoans.filter(loan => {
                const loanDate = new Date(loan.usageTime);
                return loanDate >= startDate && loanDate <= endDate;
            });
            console.log('=== 时间范围筛选 ===', {
                timeRange: queryForm.usageTimeRange,
                beforeFilter: mockLoans.length,
                afterFilter: filteredLoans.length
            });
        }
        // 应用状态筛选
        if (queryForm.loanStatus) {
            filteredLoans = filteredLoans.filter(loan => loan.status === queryForm.loanStatus);
            console.log('=== 状态筛选 ===', {
                status: queryForm.loanStatus,
                afterFilter: filteredLoans.length
            });
        }
        console.log('=== 最终筛选结果 ===', {
            finalCount: filteredLoans.length,
            finalItems: filteredLoans.slice(0, 3).map(item => ({ id: item.id, customerName: item.customerName }))
        });
        loanData.value = filteredLoans;
        loanPagination.total = filteredLoans.length;
        loanLoading.value = false;
        console.log('=== loanData 更新完成 ===', {
            loanDataLength: loanData.value.length,
            paginationTotal: loanPagination.total,
            loading: loanLoading.value
        });
        if (filteredLoans.length > 0) {
            Message.success(`查询到${filteredLoans.length}笔借据，请点击"下一步"继续`);
        }
        else {
            Message.warning('未查询到符合条件的借据');
        }
        console.log('=== searchLoans 函数执行完成 ===', {
            timestamp: new Date().toLocaleTimeString()
        });
    }, 1000);
};
// 借据筛选
const handleLoanFilter = () => {
    loanPagination.current = 1;
};
const resetLoanFilter = () => {
    loanFilter.keyword = '';
    loanFilter.status = '';
    loanPagination.current = 1;
};
// 借据分页
const handleLoanPageChange = (page) => {
    loanPagination.current = page;
};
// 借据选择
const handleLoanSelection = (rowKeys, rows) => {
    console.log('=== handleLoanSelection 函数调用 ===', {
        timestamp: new Date().toLocaleTimeString(),
        inputRowKeys: rowKeys,
        inputRows: rows,
        inputRowKeysLength: rowKeys?.length || 0,
        beforeUpdate: {
            selectedLoanKeys: selectedLoanKeys.value,
            selectedLoans: selectedLoans.value
        }
    });
    selectedLoanKeys.value = rowKeys;
    selectedLoans.value = rows;
    console.log('=== handleLoanSelection 更新后 ===', {
        afterUpdate: {
            selectedLoanKeys: selectedLoanKeys.value,
            selectedLoans: selectedLoans.value,
            selectedLoanKeysLength: selectedLoanKeys.value?.length || 0
        }
    });
};
// 状态相关方法
const getLoanStatusColor = (status) => {
    const colorMap = {
        active: 'green',
        overdue: 'red',
        settled: 'blue',
        'written-off': 'orange'
    };
    return colorMap[status] || 'gray';
};
const getLoanStatusText = (status) => {
    const textMap = {
        active: '正常',
        overdue: '逾期',
        settled: '已结清',
        'written-off': '已核销'
    };
    return textMap[status] || '未知';
};
// 处理查询类型变化
const handleQueryTypeChange = (value) => {
    currentStep.value = 0;
    // 重置相关数据
    if (value === 'batchBacktrack') {
        loanData.value = [];
        selectedLoanKeys.value = [];
        selectedLoans.value = [];
    }
};
// 确认查询 (身份证号查询模式)
const confirmQuery = () => {
    Message.success('查询申请已提交，等待审批');
    router.push('/management/service');
};
// 确认批量查询 (批量回溯模式)
const confirmBatchQuery = () => {
    // 验证参数映射
    const requiredMappings = parameterMappings.value.filter(item => item.required);
    const hasEmptyRequired = requiredMappings.some(item => !item.targetColumn);
    if (hasEmptyRequired) {
        Message.error('请完成所有必填参数的映射配置');
        return;
    }
    Message.success('批量回溯申请已提交，等待审批');
    router.push('/management/service');
};
// 监听selectedLoanKeys变化
watch(selectedLoanKeys, (newValue, oldValue) => {
    console.log('=== selectedLoanKeys 监听器触发 ===', {
        timestamp: new Date().toLocaleTimeString(),
        oldValue: oldValue,
        newValue: newValue,
        oldLength: oldValue?.length || 0,
        newLength: newValue?.length || 0
    });
}, { deep: true });
// 监听selectedLoans变化
watch(selectedLoans, (newValue, oldValue) => {
    console.log('=== selectedLoans 监听器触发 ===', {
        timestamp: new Date().toLocaleTimeString(),
        oldLength: oldValue?.length || 0,
        newLength: newValue?.length || 0
    });
}, { deep: true });
// 监听filteredLoanData变化
watch(filteredLoanData, (newValue, oldValue) => {
    console.log('=== filteredLoanData 监听器触发 ===', {
        timestamp: new Date().toLocaleTimeString(),
        oldLength: oldValue?.length || 0,
        newLength: newValue?.length || 0,
        hasData: newValue && newValue.length > 0,
        firstItem: newValue && newValue.length > 0 ? { id: newValue[0].id, customerName: newValue[0].customerName } : null
    });
}, { deep: true });
onMounted(() => {
    console.log('=== 组件挂载完成 ===', {
        timestamp: new Date().toLocaleTimeString(),
        currentStep: currentStep.value,
        queryType: queryType.value,
        loanDataLength: loanData.value?.length || 0,
        selectedLoanKeysLength: selectedLoanKeys.value?.length || 0
    });
    // 组件初始化逻辑
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['step-container']} */ ;
/** @type {__VLS_StyleScopedClasses['selected-loans']} */ ;
/** @type {__VLS_StyleScopedClasses['step-actions']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "fund-usage-query" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "page-description" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "query-steps" },
});
const __VLS_0 = {}.ASteps;
/** @type {[typeof __VLS_components.ASteps, typeof __VLS_components.aSteps, typeof __VLS_components.ASteps, typeof __VLS_components.aSteps, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    current: (__VLS_ctx.currentStep),
    size: "small",
}));
const __VLS_2 = __VLS_1({
    current: (__VLS_ctx.currentStep),
    size: "small",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
if (__VLS_ctx.queryType === 'idQuery') {
    const __VLS_4 = {}.AStep;
    /** @type {[typeof __VLS_components.AStep, typeof __VLS_components.aStep, ]} */ ;
    // @ts-ignore
    const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
        title: "输入查询条件",
        description: "选择查询类型并输入查询条件",
    }));
    const __VLS_6 = __VLS_5({
        title: "输入查询条件",
        description: "选择查询类型并输入查询条件",
    }, ...__VLS_functionalComponentArgsRest(__VLS_5));
}
if (__VLS_ctx.queryType === 'idQuery') {
    const __VLS_8 = {}.AStep;
    /** @type {[typeof __VLS_components.AStep, typeof __VLS_components.aStep, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        title: "选择借据",
        description: "从查询结果中选择需要查询的借据",
    }));
    const __VLS_10 = __VLS_9({
        title: "选择借据",
        description: "从查询结果中选择需要查询的借据",
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
}
if (__VLS_ctx.queryType === 'idQuery') {
    const __VLS_12 = {}.AStep;
    /** @type {[typeof __VLS_components.AStep, typeof __VLS_components.aStep, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
        title: "确认查询",
        description: "确认查询信息并提交申请",
    }));
    const __VLS_14 = __VLS_13({
        title: "确认查询",
        description: "确认查询信息并提交申请",
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
}
if (__VLS_ctx.queryType === 'batchBacktrack') {
    const __VLS_16 = {}.AStep;
    /** @type {[typeof __VLS_components.AStep, typeof __VLS_components.aStep, ]} */ ;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
        title: "选择查询类型",
        description: "选择查询类型和外部数据选项",
    }));
    const __VLS_18 = __VLS_17({
        title: "选择查询类型",
        description: "选择查询类型和外部数据选项",
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
}
if (__VLS_ctx.queryType === 'batchBacktrack') {
    const __VLS_20 = {}.AStep;
    /** @type {[typeof __VLS_components.AStep, typeof __VLS_components.aStep, ]} */ ;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
        title: "添加样本",
        description: "输入样本数据库和样本表信息",
    }));
    const __VLS_22 = __VLS_21({
        title: "添加样本",
        description: "输入样本数据库和样本表信息",
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
}
if (__VLS_ctx.queryType === 'batchBacktrack') {
    const __VLS_24 = {}.AStep;
    /** @type {[typeof __VLS_components.AStep, typeof __VLS_components.aStep, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
        title: "绑定参数列",
        description: "配置参数列映射关系",
    }));
    const __VLS_26 = __VLS_25({
        title: "绑定参数列",
        description: "配置参数列映射关系",
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
}
var __VLS_3;
const __VLS_28 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    ...{ class: "step-content" },
}));
const __VLS_30 = __VLS_29({
    ...{ class: "step-content" },
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
__VLS_31.slots.default;
if (__VLS_ctx.currentStep === 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "step-container" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "step-description" },
    });
    const __VLS_32 = {}.AForm;
    /** @type {[typeof __VLS_components.AForm, typeof __VLS_components.aForm, typeof __VLS_components.AForm, typeof __VLS_components.aForm, ]} */ ;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
        model: (__VLS_ctx.queryForm),
        layout: "vertical",
    }));
    const __VLS_34 = __VLS_33({
        model: (__VLS_ctx.queryForm),
        layout: "vertical",
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    __VLS_35.slots.default;
    const __VLS_36 = {}.ARow;
    /** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
        gutter: (16),
    }));
    const __VLS_38 = __VLS_37({
        gutter: (16),
    }, ...__VLS_functionalComponentArgsRest(__VLS_37));
    __VLS_39.slots.default;
    const __VLS_40 = {}.ACol;
    /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
    // @ts-ignore
    const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
        span: (12),
    }));
    const __VLS_42 = __VLS_41({
        span: (12),
    }, ...__VLS_functionalComponentArgsRest(__VLS_41));
    __VLS_43.slots.default;
    const __VLS_44 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
        label: "外部数据选项",
        required: true,
    }));
    const __VLS_46 = __VLS_45({
        label: "外部数据选项",
        required: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_45));
    __VLS_47.slots.default;
    const __VLS_48 = {}.ASelect;
    /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
    // @ts-ignore
    const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
        modelValue: (__VLS_ctx.queryForm.externalDataOption),
        placeholder: "请选择外部数据选项",
    }));
    const __VLS_50 = __VLS_49({
        modelValue: (__VLS_ctx.queryForm.externalDataOption),
        placeholder: "请选择外部数据选项",
    }, ...__VLS_functionalComponentArgsRest(__VLS_49));
    __VLS_51.slots.default;
    const __VLS_52 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
    // @ts-ignore
    const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
        value: "fundUsage",
    }));
    const __VLS_54 = __VLS_53({
        value: "fundUsage",
    }, ...__VLS_functionalComponentArgsRest(__VLS_53));
    __VLS_55.slots.default;
    var __VLS_55;
    var __VLS_51;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-tip" },
    });
    var __VLS_47;
    var __VLS_43;
    const __VLS_56 = {}.ACol;
    /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
    // @ts-ignore
    const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
        span: (12),
    }));
    const __VLS_58 = __VLS_57({
        span: (12),
    }, ...__VLS_functionalComponentArgsRest(__VLS_57));
    __VLS_59.slots.default;
    const __VLS_60 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
        label: "查询类型",
        field: "queryType",
    }));
    const __VLS_62 = __VLS_61({
        label: "查询类型",
        field: "queryType",
    }, ...__VLS_functionalComponentArgsRest(__VLS_61));
    __VLS_63.slots.default;
    const __VLS_64 = {}.ARadioGroup;
    /** @type {[typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, ]} */ ;
    // @ts-ignore
    const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.queryType),
        type: "button",
    }));
    const __VLS_66 = __VLS_65({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.queryType),
        type: "button",
    }, ...__VLS_functionalComponentArgsRest(__VLS_65));
    let __VLS_68;
    let __VLS_69;
    let __VLS_70;
    const __VLS_71 = {
        onChange: (__VLS_ctx.handleQueryTypeChange)
    };
    __VLS_67.slots.default;
    const __VLS_72 = {}.ARadio;
    /** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
    // @ts-ignore
    const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
        value: "idQuery",
    }));
    const __VLS_74 = __VLS_73({
        value: "idQuery",
    }, ...__VLS_functionalComponentArgsRest(__VLS_73));
    __VLS_75.slots.default;
    var __VLS_75;
    const __VLS_76 = {}.ARadio;
    /** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
    // @ts-ignore
    const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
        value: "batchBacktrack",
    }));
    const __VLS_78 = __VLS_77({
        value: "batchBacktrack",
    }, ...__VLS_functionalComponentArgsRest(__VLS_77));
    __VLS_79.slots.default;
    var __VLS_79;
    var __VLS_67;
    var __VLS_63;
    var __VLS_59;
    var __VLS_39;
    if (__VLS_ctx.queryType === 'idQuery') {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        const __VLS_80 = {}.ARow;
        /** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
        // @ts-ignore
        const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
            gutter: (16),
        }));
        const __VLS_82 = __VLS_81({
            gutter: (16),
        }, ...__VLS_functionalComponentArgsRest(__VLS_81));
        __VLS_83.slots.default;
        const __VLS_84 = {}.ACol;
        /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
        // @ts-ignore
        const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
            span: (12),
        }));
        const __VLS_86 = __VLS_85({
            span: (12),
        }, ...__VLS_functionalComponentArgsRest(__VLS_85));
        __VLS_87.slots.default;
        const __VLS_88 = {}.AFormItem;
        /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
        // @ts-ignore
        const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
            label: "客户身份证号",
            required: true,
        }));
        const __VLS_90 = __VLS_89({
            label: "客户身份证号",
            required: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_89));
        __VLS_91.slots.default;
        const __VLS_92 = {}.ATextarea;
        /** @type {[typeof __VLS_components.ATextarea, typeof __VLS_components.aTextarea, ]} */ ;
        // @ts-ignore
        const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
            modelValue: (__VLS_ctx.queryForm.idNumbers),
            placeholder: "请输入客户身份证号，多个身份证号请换行输入",
            autoSize: ({ minRows: 4, maxRows: 6 }),
            maxLength: (1000),
            showWordLimit: true,
        }));
        const __VLS_94 = __VLS_93({
            modelValue: (__VLS_ctx.queryForm.idNumbers),
            placeholder: "请输入客户身份证号，多个身份证号请换行输入",
            autoSize: ({ minRows: 4, maxRows: 6 }),
            maxLength: (1000),
            showWordLimit: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_93));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "form-tip" },
        });
        var __VLS_91;
        var __VLS_87;
        const __VLS_96 = {}.ACol;
        /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
        // @ts-ignore
        const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
            span: (12),
        }));
        const __VLS_98 = __VLS_97({
            span: (12),
        }, ...__VLS_functionalComponentArgsRest(__VLS_97));
        __VLS_99.slots.default;
        const __VLS_100 = {}.AFormItem;
        /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
        // @ts-ignore
        const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
            label: "支用时间范围",
        }));
        const __VLS_102 = __VLS_101({
            label: "支用时间范围",
        }, ...__VLS_functionalComponentArgsRest(__VLS_101));
        __VLS_103.slots.default;
        const __VLS_104 = {}.ARangePicker;
        /** @type {[typeof __VLS_components.ARangePicker, typeof __VLS_components.aRangePicker, ]} */ ;
        // @ts-ignore
        const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({
            modelValue: (__VLS_ctx.queryForm.usageTimeRange),
            ...{ style: {} },
            placeholder: (['开始时间', '结束时间']),
        }));
        const __VLS_106 = __VLS_105({
            modelValue: (__VLS_ctx.queryForm.usageTimeRange),
            ...{ style: {} },
            placeholder: (['开始时间', '结束时间']),
        }, ...__VLS_functionalComponentArgsRest(__VLS_105));
        var __VLS_103;
        const __VLS_108 = {}.AFormItem;
        /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
        // @ts-ignore
        const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({
            label: "借据状态",
        }));
        const __VLS_110 = __VLS_109({
            label: "借据状态",
        }, ...__VLS_functionalComponentArgsRest(__VLS_109));
        __VLS_111.slots.default;
        const __VLS_112 = {}.ASelect;
        /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
        // @ts-ignore
        const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({
            modelValue: (__VLS_ctx.queryForm.loanStatus),
            placeholder: "请选择借据状态",
            allowClear: true,
        }));
        const __VLS_114 = __VLS_113({
            modelValue: (__VLS_ctx.queryForm.loanStatus),
            placeholder: "请选择借据状态",
            allowClear: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_113));
        __VLS_115.slots.default;
        const __VLS_116 = {}.AOption;
        /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
        // @ts-ignore
        const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({
            value: "active",
        }));
        const __VLS_118 = __VLS_117({
            value: "active",
        }, ...__VLS_functionalComponentArgsRest(__VLS_117));
        __VLS_119.slots.default;
        var __VLS_119;
        const __VLS_120 = {}.AOption;
        /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
        // @ts-ignore
        const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({
            value: "overdue",
        }));
        const __VLS_122 = __VLS_121({
            value: "overdue",
        }, ...__VLS_functionalComponentArgsRest(__VLS_121));
        __VLS_123.slots.default;
        var __VLS_123;
        const __VLS_124 = {}.AOption;
        /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
        // @ts-ignore
        const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({
            value: "settled",
        }));
        const __VLS_126 = __VLS_125({
            value: "settled",
        }, ...__VLS_functionalComponentArgsRest(__VLS_125));
        __VLS_127.slots.default;
        var __VLS_127;
        const __VLS_128 = {}.AOption;
        /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
        // @ts-ignore
        const __VLS_129 = __VLS_asFunctionalComponent(__VLS_128, new __VLS_128({
            value: "written-off",
        }));
        const __VLS_130 = __VLS_129({
            value: "written-off",
        }, ...__VLS_functionalComponentArgsRest(__VLS_129));
        __VLS_131.slots.default;
        var __VLS_131;
        var __VLS_115;
        var __VLS_111;
        var __VLS_99;
        var __VLS_83;
        const __VLS_132 = {}.AFormItem;
        /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
        // @ts-ignore
        const __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132({}));
        const __VLS_134 = __VLS_133({}, ...__VLS_functionalComponentArgsRest(__VLS_133));
        __VLS_135.slots.default;
        const __VLS_136 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
        // @ts-ignore
        const __VLS_137 = __VLS_asFunctionalComponent(__VLS_136, new __VLS_136({
            ...{ 'onClick': {} },
            type: "primary",
            loading: (__VLS_ctx.loanLoading),
        }));
        const __VLS_138 = __VLS_137({
            ...{ 'onClick': {} },
            type: "primary",
            loading: (__VLS_ctx.loanLoading),
        }, ...__VLS_functionalComponentArgsRest(__VLS_137));
        let __VLS_140;
        let __VLS_141;
        let __VLS_142;
        const __VLS_143 = {
            onClick: (__VLS_ctx.searchLoans)
        };
        __VLS_139.slots.default;
        var __VLS_139;
        var __VLS_135;
    }
    if (__VLS_ctx.queryType === 'batchBacktrack') {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        const __VLS_144 = {}.AFormItem;
        /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
        // @ts-ignore
        const __VLS_145 = __VLS_asFunctionalComponent(__VLS_144, new __VLS_144({}));
        const __VLS_146 = __VLS_145({}, ...__VLS_functionalComponentArgsRest(__VLS_145));
        __VLS_147.slots.default;
        const __VLS_148 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
        // @ts-ignore
        const __VLS_149 = __VLS_asFunctionalComponent(__VLS_148, new __VLS_148({
            ...{ 'onClick': {} },
            type: "primary",
        }));
        const __VLS_150 = __VLS_149({
            ...{ 'onClick': {} },
            type: "primary",
        }, ...__VLS_functionalComponentArgsRest(__VLS_149));
        let __VLS_152;
        let __VLS_153;
        let __VLS_154;
        const __VLS_155 = {
            onClick: (__VLS_ctx.nextStep)
        };
        __VLS_151.slots.default;
        var __VLS_151;
        var __VLS_147;
    }
    var __VLS_35;
    if (__VLS_ctx.queryType === 'idQuery' && __VLS_ctx.loanData.length > 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "step-actions" },
        });
        const __VLS_156 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
        // @ts-ignore
        const __VLS_157 = __VLS_asFunctionalComponent(__VLS_156, new __VLS_156({
            ...{ 'onClick': {} },
            disabled: (__VLS_ctx.currentStep === 0),
        }));
        const __VLS_158 = __VLS_157({
            ...{ 'onClick': {} },
            disabled: (__VLS_ctx.currentStep === 0),
        }, ...__VLS_functionalComponentArgsRest(__VLS_157));
        let __VLS_160;
        let __VLS_161;
        let __VLS_162;
        const __VLS_163 = {
            onClick: (__VLS_ctx.prevStep)
        };
        __VLS_159.slots.default;
        var __VLS_159;
        const __VLS_164 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
        // @ts-ignore
        const __VLS_165 = __VLS_asFunctionalComponent(__VLS_164, new __VLS_164({
            ...{ 'onClick': {} },
            type: "primary",
            disabled: (__VLS_ctx.loanData.length === 0),
            ...{ style: {} },
        }));
        const __VLS_166 = __VLS_165({
            ...{ 'onClick': {} },
            type: "primary",
            disabled: (__VLS_ctx.loanData.length === 0),
            ...{ style: {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_165));
        let __VLS_168;
        let __VLS_169;
        let __VLS_170;
        const __VLS_171 = {
            onClick: (__VLS_ctx.nextStep)
        };
        __VLS_167.slots.default;
        var __VLS_167;
    }
}
if (__VLS_ctx.currentStep === 1 && __VLS_ctx.queryType === 'idQuery') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "step-container" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "step-description" },
    });
    if (__VLS_ctx.loanData.length > 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "filter-section" },
        });
        const __VLS_172 = {}.ARow;
        /** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
        // @ts-ignore
        const __VLS_173 = __VLS_asFunctionalComponent(__VLS_172, new __VLS_172({
            gutter: (16),
        }));
        const __VLS_174 = __VLS_173({
            gutter: (16),
        }, ...__VLS_functionalComponentArgsRest(__VLS_173));
        __VLS_175.slots.default;
        const __VLS_176 = {}.ACol;
        /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
        // @ts-ignore
        const __VLS_177 = __VLS_asFunctionalComponent(__VLS_176, new __VLS_176({
            span: (8),
        }));
        const __VLS_178 = __VLS_177({
            span: (8),
        }, ...__VLS_functionalComponentArgsRest(__VLS_177));
        __VLS_179.slots.default;
        const __VLS_180 = {}.AInput;
        /** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
        // @ts-ignore
        const __VLS_181 = __VLS_asFunctionalComponent(__VLS_180, new __VLS_180({
            ...{ 'onInput': {} },
            modelValue: (__VLS_ctx.loanFilter.keyword),
            placeholder: "搜索客户姓名或身份证号",
            allowClear: true,
        }));
        const __VLS_182 = __VLS_181({
            ...{ 'onInput': {} },
            modelValue: (__VLS_ctx.loanFilter.keyword),
            placeholder: "搜索客户姓名或身份证号",
            allowClear: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_181));
        let __VLS_184;
        let __VLS_185;
        let __VLS_186;
        const __VLS_187 = {
            onInput: (__VLS_ctx.handleLoanFilter)
        };
        var __VLS_183;
        var __VLS_179;
        const __VLS_188 = {}.ACol;
        /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
        // @ts-ignore
        const __VLS_189 = __VLS_asFunctionalComponent(__VLS_188, new __VLS_188({
            span: (6),
        }));
        const __VLS_190 = __VLS_189({
            span: (6),
        }, ...__VLS_functionalComponentArgsRest(__VLS_189));
        __VLS_191.slots.default;
        const __VLS_192 = {}.ASelect;
        /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
        // @ts-ignore
        const __VLS_193 = __VLS_asFunctionalComponent(__VLS_192, new __VLS_192({
            ...{ 'onChange': {} },
            modelValue: (__VLS_ctx.loanFilter.status),
            placeholder: "筛选状态",
            allowClear: true,
        }));
        const __VLS_194 = __VLS_193({
            ...{ 'onChange': {} },
            modelValue: (__VLS_ctx.loanFilter.status),
            placeholder: "筛选状态",
            allowClear: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_193));
        let __VLS_196;
        let __VLS_197;
        let __VLS_198;
        const __VLS_199 = {
            onChange: (__VLS_ctx.handleLoanFilter)
        };
        __VLS_195.slots.default;
        const __VLS_200 = {}.AOption;
        /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
        // @ts-ignore
        const __VLS_201 = __VLS_asFunctionalComponent(__VLS_200, new __VLS_200({
            value: "active",
        }));
        const __VLS_202 = __VLS_201({
            value: "active",
        }, ...__VLS_functionalComponentArgsRest(__VLS_201));
        __VLS_203.slots.default;
        var __VLS_203;
        const __VLS_204 = {}.AOption;
        /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
        // @ts-ignore
        const __VLS_205 = __VLS_asFunctionalComponent(__VLS_204, new __VLS_204({
            value: "overdue",
        }));
        const __VLS_206 = __VLS_205({
            value: "overdue",
        }, ...__VLS_functionalComponentArgsRest(__VLS_205));
        __VLS_207.slots.default;
        var __VLS_207;
        const __VLS_208 = {}.AOption;
        /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
        // @ts-ignore
        const __VLS_209 = __VLS_asFunctionalComponent(__VLS_208, new __VLS_208({
            value: "settled",
        }));
        const __VLS_210 = __VLS_209({
            value: "settled",
        }, ...__VLS_functionalComponentArgsRest(__VLS_209));
        __VLS_211.slots.default;
        var __VLS_211;
        const __VLS_212 = {}.AOption;
        /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
        // @ts-ignore
        const __VLS_213 = __VLS_asFunctionalComponent(__VLS_212, new __VLS_212({
            value: "written-off",
        }));
        const __VLS_214 = __VLS_213({
            value: "written-off",
        }, ...__VLS_functionalComponentArgsRest(__VLS_213));
        __VLS_215.slots.default;
        var __VLS_215;
        var __VLS_195;
        var __VLS_191;
        const __VLS_216 = {}.ACol;
        /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
        // @ts-ignore
        const __VLS_217 = __VLS_asFunctionalComponent(__VLS_216, new __VLS_216({
            span: (6),
        }));
        const __VLS_218 = __VLS_217({
            span: (6),
        }, ...__VLS_functionalComponentArgsRest(__VLS_217));
        __VLS_219.slots.default;
        const __VLS_220 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
        // @ts-ignore
        const __VLS_221 = __VLS_asFunctionalComponent(__VLS_220, new __VLS_220({
            ...{ 'onClick': {} },
        }));
        const __VLS_222 = __VLS_221({
            ...{ 'onClick': {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_221));
        let __VLS_224;
        let __VLS_225;
        let __VLS_226;
        const __VLS_227 = {
            onClick: (__VLS_ctx.resetLoanFilter)
        };
        __VLS_223.slots.default;
        var __VLS_223;
        var __VLS_219;
        var __VLS_175;
    }
    const __VLS_228 = {}.ATable;
    /** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ ;
    // @ts-ignore
    const __VLS_229 = __VLS_asFunctionalComponent(__VLS_228, new __VLS_228({
        ...{ 'onRowClick': {} },
        data: (__VLS_ctx.filteredLoanData),
        columns: (__VLS_ctx.loanColumns),
        loading: (__VLS_ctx.loanLoading),
        pagination: ({
            current: __VLS_ctx.loanPagination.current,
            pageSize: __VLS_ctx.loanPagination.pageSize,
            total: __VLS_ctx.loanPagination.total,
            showTotal: true,
            showPageSize: true,
            onChange: __VLS_ctx.handleLoanPageChange
        }),
        rowSelection: (__VLS_ctx.rowSelection),
        rowKey: "id",
    }));
    const __VLS_230 = __VLS_229({
        ...{ 'onRowClick': {} },
        data: (__VLS_ctx.filteredLoanData),
        columns: (__VLS_ctx.loanColumns),
        loading: (__VLS_ctx.loanLoading),
        pagination: ({
            current: __VLS_ctx.loanPagination.current,
            pageSize: __VLS_ctx.loanPagination.pageSize,
            total: __VLS_ctx.loanPagination.total,
            showTotal: true,
            showPageSize: true,
            onChange: __VLS_ctx.handleLoanPageChange
        }),
        rowSelection: (__VLS_ctx.rowSelection),
        rowKey: "id",
    }, ...__VLS_functionalComponentArgsRest(__VLS_229));
    let __VLS_232;
    let __VLS_233;
    let __VLS_234;
    const __VLS_235 = {
        onRowClick: ((record) => {
            console.log('=== 表格行点击事件 ===', {
                timestamp: new Date().toLocaleTimeString(),
                clickedRecord: record,
                recordId: record.id,
                currentSelectedKeys: __VLS_ctx.selectedLoanKeys
            });
            // 手动处理行选择逻辑
            const currentKeys = [...(__VLS_ctx.selectedLoanKeys || [])];
            const recordId = record.id;
            if (currentKeys.includes(recordId)) {
                // 如果已选中，则取消选中
                const newKeys = currentKeys.filter(key => key !== recordId);
                console.log('🔄 === 取消选中行 ===', {
                    recordId: recordId,
                    oldKeys: currentKeys,
                    newKeys: newKeys
                });
                __VLS_ctx.onLoanSelectionChange(newKeys);
            }
            else {
                // 如果未选中，则选中
                const newKeys = [...currentKeys, recordId];
                console.log('✅ === 选中行 ===', {
                    recordId: recordId,
                    oldKeys: currentKeys,
                    newKeys: newKeys
                });
                __VLS_ctx.onLoanSelectionChange(newKeys);
            }
        })
    };
    __VLS_231.slots.default;
    {
        const { customerName: __VLS_thisSlot } = __VLS_231.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "customer-name" },
        });
        (record.customerName);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "customer-id" },
        });
        (record.idNumber);
    }
    {
        const { loanAmount: __VLS_thisSlot } = __VLS_231.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        ((record.loanAmount / 10000).toFixed(2));
    }
    {
        const { status: __VLS_thisSlot } = __VLS_231.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_236 = {}.ATag;
        /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
        // @ts-ignore
        const __VLS_237 = __VLS_asFunctionalComponent(__VLS_236, new __VLS_236({
            color: (__VLS_ctx.getLoanStatusColor(record.status)),
        }));
        const __VLS_238 = __VLS_237({
            color: (__VLS_ctx.getLoanStatusColor(record.status)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_237));
        __VLS_239.slots.default;
        (__VLS_ctx.getLoanStatusText(record.status));
        var __VLS_239;
    }
    var __VLS_231;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "step-actions" },
    });
    const __VLS_240 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_241 = __VLS_asFunctionalComponent(__VLS_240, new __VLS_240({
        ...{ 'onClick': {} },
        ...{ style: {} },
    }));
    const __VLS_242 = __VLS_241({
        ...{ 'onClick': {} },
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_241));
    let __VLS_244;
    let __VLS_245;
    let __VLS_246;
    const __VLS_247 = {
        onClick: (__VLS_ctx.prevStep)
    };
    __VLS_243.slots.default;
    var __VLS_243;
    const __VLS_248 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_249 = __VLS_asFunctionalComponent(__VLS_248, new __VLS_248({
        ...{ 'onClick': {} },
        type: "primary",
        disabled: (__VLS_ctx.isNextButtonDisabled),
    }));
    const __VLS_250 = __VLS_249({
        ...{ 'onClick': {} },
        type: "primary",
        disabled: (__VLS_ctx.isNextButtonDisabled),
    }, ...__VLS_functionalComponentArgsRest(__VLS_249));
    let __VLS_252;
    let __VLS_253;
    let __VLS_254;
    const __VLS_255 = {
        onClick: (__VLS_ctx.nextStep)
    };
    __VLS_251.slots.default;
    (__VLS_ctx.selectedLoanKeys.length || 0);
    var __VLS_251;
}
if (__VLS_ctx.currentStep === 1 && __VLS_ctx.queryType === 'batchBacktrack') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "step-container" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "step-description" },
    });
    const __VLS_256 = {}.AForm;
    /** @type {[typeof __VLS_components.AForm, typeof __VLS_components.aForm, typeof __VLS_components.AForm, typeof __VLS_components.aForm, ]} */ ;
    // @ts-ignore
    const __VLS_257 = __VLS_asFunctionalComponent(__VLS_256, new __VLS_256({
        model: (__VLS_ctx.sampleForm),
        layout: "vertical",
    }));
    const __VLS_258 = __VLS_257({
        model: (__VLS_ctx.sampleForm),
        layout: "vertical",
    }, ...__VLS_functionalComponentArgsRest(__VLS_257));
    __VLS_259.slots.default;
    const __VLS_260 = {}.ARow;
    /** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
    // @ts-ignore
    const __VLS_261 = __VLS_asFunctionalComponent(__VLS_260, new __VLS_260({
        gutter: (16),
    }));
    const __VLS_262 = __VLS_261({
        gutter: (16),
    }, ...__VLS_functionalComponentArgsRest(__VLS_261));
    __VLS_263.slots.default;
    const __VLS_264 = {}.ACol;
    /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
    // @ts-ignore
    const __VLS_265 = __VLS_asFunctionalComponent(__VLS_264, new __VLS_264({
        span: (12),
    }));
    const __VLS_266 = __VLS_265({
        span: (12),
    }, ...__VLS_functionalComponentArgsRest(__VLS_265));
    __VLS_267.slots.default;
    const __VLS_268 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_269 = __VLS_asFunctionalComponent(__VLS_268, new __VLS_268({
        label: "样本数据库",
        required: true,
    }));
    const __VLS_270 = __VLS_269({
        label: "样本数据库",
        required: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_269));
    __VLS_271.slots.default;
    const __VLS_272 = {}.AInput;
    /** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
    // @ts-ignore
    const __VLS_273 = __VLS_asFunctionalComponent(__VLS_272, new __VLS_272({
        modelValue: (__VLS_ctx.sampleForm.database),
        placeholder: "请输入样本数据库名称",
    }));
    const __VLS_274 = __VLS_273({
        modelValue: (__VLS_ctx.sampleForm.database),
        placeholder: "请输入样本数据库名称",
    }, ...__VLS_functionalComponentArgsRest(__VLS_273));
    var __VLS_271;
    var __VLS_267;
    const __VLS_276 = {}.ACol;
    /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
    // @ts-ignore
    const __VLS_277 = __VLS_asFunctionalComponent(__VLS_276, new __VLS_276({
        span: (12),
    }));
    const __VLS_278 = __VLS_277({
        span: (12),
    }, ...__VLS_functionalComponentArgsRest(__VLS_277));
    __VLS_279.slots.default;
    const __VLS_280 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_281 = __VLS_asFunctionalComponent(__VLS_280, new __VLS_280({
        label: "样本表",
        required: true,
    }));
    const __VLS_282 = __VLS_281({
        label: "样本表",
        required: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_281));
    __VLS_283.slots.default;
    const __VLS_284 = {}.AInput;
    /** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
    // @ts-ignore
    const __VLS_285 = __VLS_asFunctionalComponent(__VLS_284, new __VLS_284({
        modelValue: (__VLS_ctx.sampleForm.table),
        placeholder: "请输入样本表名称",
    }));
    const __VLS_286 = __VLS_285({
        modelValue: (__VLS_ctx.sampleForm.table),
        placeholder: "请输入样本表名称",
    }, ...__VLS_functionalComponentArgsRest(__VLS_285));
    var __VLS_283;
    var __VLS_279;
    var __VLS_263;
    const __VLS_288 = {}.ARow;
    /** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
    // @ts-ignore
    const __VLS_289 = __VLS_asFunctionalComponent(__VLS_288, new __VLS_288({
        gutter: (16),
    }));
    const __VLS_290 = __VLS_289({
        gutter: (16),
    }, ...__VLS_functionalComponentArgsRest(__VLS_289));
    __VLS_291.slots.default;
    const __VLS_292 = {}.ACol;
    /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
    // @ts-ignore
    const __VLS_293 = __VLS_asFunctionalComponent(__VLS_292, new __VLS_292({
        span: (24),
    }));
    const __VLS_294 = __VLS_293({
        span: (24),
    }, ...__VLS_functionalComponentArgsRest(__VLS_293));
    __VLS_295.slots.default;
    const __VLS_296 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_297 = __VLS_asFunctionalComponent(__VLS_296, new __VLS_296({
        label: "样本描述",
    }));
    const __VLS_298 = __VLS_297({
        label: "样本描述",
    }, ...__VLS_functionalComponentArgsRest(__VLS_297));
    __VLS_299.slots.default;
    const __VLS_300 = {}.ATextarea;
    /** @type {[typeof __VLS_components.ATextarea, typeof __VLS_components.aTextarea, ]} */ ;
    // @ts-ignore
    const __VLS_301 = __VLS_asFunctionalComponent(__VLS_300, new __VLS_300({
        modelValue: (__VLS_ctx.sampleForm.description),
        placeholder: "请输入样本描述信息（可选）",
        autoSize: ({ minRows: 3, maxRows: 5 }),
    }));
    const __VLS_302 = __VLS_301({
        modelValue: (__VLS_ctx.sampleForm.description),
        placeholder: "请输入样本描述信息（可选）",
        autoSize: ({ minRows: 3, maxRows: 5 }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_301));
    var __VLS_299;
    var __VLS_295;
    var __VLS_291;
    var __VLS_259;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "step-actions" },
    });
    const __VLS_304 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_305 = __VLS_asFunctionalComponent(__VLS_304, new __VLS_304({
        ...{ 'onClick': {} },
    }));
    const __VLS_306 = __VLS_305({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_305));
    let __VLS_308;
    let __VLS_309;
    let __VLS_310;
    const __VLS_311 = {
        onClick: (__VLS_ctx.prevStep)
    };
    __VLS_307.slots.default;
    var __VLS_307;
    const __VLS_312 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_313 = __VLS_asFunctionalComponent(__VLS_312, new __VLS_312({
        ...{ 'onClick': {} },
        type: "primary",
        disabled: (!__VLS_ctx.sampleForm.database || !__VLS_ctx.sampleForm.table),
        ...{ style: {} },
    }));
    const __VLS_314 = __VLS_313({
        ...{ 'onClick': {} },
        type: "primary",
        disabled: (!__VLS_ctx.sampleForm.database || !__VLS_ctx.sampleForm.table),
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_313));
    let __VLS_316;
    let __VLS_317;
    let __VLS_318;
    const __VLS_319 = {
        onClick: (__VLS_ctx.nextStep)
    };
    __VLS_315.slots.default;
    var __VLS_315;
}
if (__VLS_ctx.currentStep === 2 && __VLS_ctx.queryType === 'batchBacktrack') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "step-container" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "step-description" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "parameter-mapping" },
    });
    const __VLS_320 = {}.ATable;
    /** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ ;
    // @ts-ignore
    const __VLS_321 = __VLS_asFunctionalComponent(__VLS_320, new __VLS_320({
        columns: (__VLS_ctx.parameterColumns),
        data: (__VLS_ctx.parameterMappings),
        pagination: (false),
        size: "small",
    }));
    const __VLS_322 = __VLS_321({
        columns: (__VLS_ctx.parameterColumns),
        data: (__VLS_ctx.parameterMappings),
        pagination: (false),
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_321));
    __VLS_323.slots.default;
    {
        const { targetColumn: __VLS_thisSlot } = __VLS_323.slots;
        const [{ record, rowIndex }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_324 = {}.ASelect;
        /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
        // @ts-ignore
        const __VLS_325 = __VLS_asFunctionalComponent(__VLS_324, new __VLS_324({
            modelValue: (__VLS_ctx.parameterMappings[rowIndex].targetColumn),
            placeholder: "选择目标列",
            ...{ style: {} },
        }));
        const __VLS_326 = __VLS_325({
            modelValue: (__VLS_ctx.parameterMappings[rowIndex].targetColumn),
            placeholder: "选择目标列",
            ...{ style: {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_325));
        __VLS_327.slots.default;
        const __VLS_328 = {}.AOption;
        /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
        // @ts-ignore
        const __VLS_329 = __VLS_asFunctionalComponent(__VLS_328, new __VLS_328({
            value: "customer_id",
        }));
        const __VLS_330 = __VLS_329({
            value: "customer_id",
        }, ...__VLS_functionalComponentArgsRest(__VLS_329));
        __VLS_331.slots.default;
        var __VLS_331;
        const __VLS_332 = {}.AOption;
        /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
        // @ts-ignore
        const __VLS_333 = __VLS_asFunctionalComponent(__VLS_332, new __VLS_332({
            value: "loan_id",
        }));
        const __VLS_334 = __VLS_333({
            value: "loan_id",
        }, ...__VLS_functionalComponentArgsRest(__VLS_333));
        __VLS_335.slots.default;
        var __VLS_335;
        const __VLS_336 = {}.AOption;
        /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
        // @ts-ignore
        const __VLS_337 = __VLS_asFunctionalComponent(__VLS_336, new __VLS_336({
            value: "amount",
        }));
        const __VLS_338 = __VLS_337({
            value: "amount",
        }, ...__VLS_functionalComponentArgsRest(__VLS_337));
        __VLS_339.slots.default;
        var __VLS_339;
        const __VLS_340 = {}.AOption;
        /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
        // @ts-ignore
        const __VLS_341 = __VLS_asFunctionalComponent(__VLS_340, new __VLS_340({
            value: "date",
        }));
        const __VLS_342 = __VLS_341({
            value: "date",
        }, ...__VLS_functionalComponentArgsRest(__VLS_341));
        __VLS_343.slots.default;
        var __VLS_343;
        const __VLS_344 = {}.AOption;
        /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
        // @ts-ignore
        const __VLS_345 = __VLS_asFunctionalComponent(__VLS_344, new __VLS_344({
            value: "status",
        }));
        const __VLS_346 = __VLS_345({
            value: "status",
        }, ...__VLS_functionalComponentArgsRest(__VLS_345));
        __VLS_347.slots.default;
        var __VLS_347;
        var __VLS_327;
    }
    {
        const { required: __VLS_thisSlot } = __VLS_323.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_348 = {}.ATag;
        /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
        // @ts-ignore
        const __VLS_349 = __VLS_asFunctionalComponent(__VLS_348, new __VLS_348({
            color: (record.required ? 'red' : 'blue'),
        }));
        const __VLS_350 = __VLS_349({
            color: (record.required ? 'red' : 'blue'),
        }, ...__VLS_functionalComponentArgsRest(__VLS_349));
        __VLS_351.slots.default;
        (record.required ? '必填' : '可选');
        var __VLS_351;
    }
    var __VLS_323;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "step-actions" },
    });
    const __VLS_352 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_353 = __VLS_asFunctionalComponent(__VLS_352, new __VLS_352({
        ...{ 'onClick': {} },
    }));
    const __VLS_354 = __VLS_353({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_353));
    let __VLS_356;
    let __VLS_357;
    let __VLS_358;
    const __VLS_359 = {
        onClick: (__VLS_ctx.prevStep)
    };
    __VLS_355.slots.default;
    var __VLS_355;
    const __VLS_360 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_361 = __VLS_asFunctionalComponent(__VLS_360, new __VLS_360({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_362 = __VLS_361({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_361));
    let __VLS_364;
    let __VLS_365;
    let __VLS_366;
    const __VLS_367 = {
        onClick: (__VLS_ctx.confirmBatchQuery)
    };
    __VLS_363.slots.default;
    var __VLS_363;
}
if (__VLS_ctx.currentStep === 2 && __VLS_ctx.queryType === 'idQuery') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "step-container" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "step-description" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "query-summary" },
    });
    const __VLS_368 = {}.ADescriptions;
    /** @type {[typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, ]} */ ;
    // @ts-ignore
    const __VLS_369 = __VLS_asFunctionalComponent(__VLS_368, new __VLS_368({
        column: (2),
        bordered: true,
    }));
    const __VLS_370 = __VLS_369({
        column: (2),
        bordered: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_369));
    __VLS_371.slots.default;
    const __VLS_372 = {}.ADescriptionsItem;
    /** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_373 = __VLS_asFunctionalComponent(__VLS_372, new __VLS_372({
        label: "查询客户数",
    }));
    const __VLS_374 = __VLS_373({
        label: "查询客户数",
    }, ...__VLS_functionalComponentArgsRest(__VLS_373));
    __VLS_375.slots.default;
    (__VLS_ctx.uniqueCustomers.length || 0);
    var __VLS_375;
    const __VLS_376 = {}.ADescriptionsItem;
    /** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_377 = __VLS_asFunctionalComponent(__VLS_376, new __VLS_376({
        label: "查询借据数",
    }));
    const __VLS_378 = __VLS_377({
        label: "查询借据数",
    }, ...__VLS_functionalComponentArgsRest(__VLS_377));
    __VLS_379.slots.default;
    (__VLS_ctx.selectedLoans.length || 0);
    var __VLS_379;
    const __VLS_380 = {}.ADescriptionsItem;
    /** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_381 = __VLS_asFunctionalComponent(__VLS_380, new __VLS_380({
        label: "查询时间范围",
    }));
    const __VLS_382 = __VLS_381({
        label: "查询时间范围",
    }, ...__VLS_functionalComponentArgsRest(__VLS_381));
    __VLS_383.slots.default;
    (__VLS_ctx.queryForm.usageTimeRange ?
        `${__VLS_ctx.queryForm.usageTimeRange[0]} 至 ${__VLS_ctx.queryForm.usageTimeRange[1]}` :
        '不限制');
    var __VLS_383;
    const __VLS_384 = {}.ADescriptionsItem;
    /** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_385 = __VLS_asFunctionalComponent(__VLS_384, new __VLS_384({
        label: "借据状态筛选",
    }));
    const __VLS_386 = __VLS_385({
        label: "借据状态筛选",
    }, ...__VLS_functionalComponentArgsRest(__VLS_385));
    __VLS_387.slots.default;
    (__VLS_ctx.queryForm.loanStatus ? __VLS_ctx.getLoanStatusText(__VLS_ctx.queryForm.loanStatus) : '不限制');
    var __VLS_387;
    var __VLS_371;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "selected-loans" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
    const __VLS_388 = {}.ATable;
    /** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ ;
    // @ts-ignore
    const __VLS_389 = __VLS_asFunctionalComponent(__VLS_388, new __VLS_388({
        columns: (__VLS_ctx.summaryColumns),
        data: (__VLS_ctx.selectedLoans),
        pagination: (false),
        size: "small",
    }));
    const __VLS_390 = __VLS_389({
        columns: (__VLS_ctx.summaryColumns),
        data: (__VLS_ctx.selectedLoans),
        pagination: (false),
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_389));
    __VLS_391.slots.default;
    {
        const { customerName: __VLS_thisSlot } = __VLS_391.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "customer-name" },
        });
        (record.customerName);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "customer-id" },
        });
        (record.idNumber);
    }
    {
        const { loanAmount: __VLS_thisSlot } = __VLS_391.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        ((record.loanAmount / 10000).toFixed(2));
    }
    {
        const { status: __VLS_thisSlot } = __VLS_391.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_392 = {}.ATag;
        /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
        // @ts-ignore
        const __VLS_393 = __VLS_asFunctionalComponent(__VLS_392, new __VLS_392({
            color: (__VLS_ctx.getLoanStatusColor(record.status)),
            size: "small",
        }));
        const __VLS_394 = __VLS_393({
            color: (__VLS_ctx.getLoanStatusColor(record.status)),
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_393));
        __VLS_395.slots.default;
        (__VLS_ctx.getLoanStatusText(record.status));
        var __VLS_395;
    }
    var __VLS_391;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "step-actions" },
    });
    const __VLS_396 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_397 = __VLS_asFunctionalComponent(__VLS_396, new __VLS_396({
        ...{ 'onClick': {} },
        ...{ style: {} },
    }));
    const __VLS_398 = __VLS_397({
        ...{ 'onClick': {} },
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_397));
    let __VLS_400;
    let __VLS_401;
    let __VLS_402;
    const __VLS_403 = {
        onClick: (__VLS_ctx.prevStep)
    };
    __VLS_399.slots.default;
    var __VLS_399;
    const __VLS_404 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_405 = __VLS_asFunctionalComponent(__VLS_404, new __VLS_404({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_406 = __VLS_405({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_405));
    let __VLS_408;
    let __VLS_409;
    let __VLS_410;
    const __VLS_411 = {
        onClick: (__VLS_ctx.confirmQuery)
    };
    __VLS_407.slots.default;
    var __VLS_407;
}
var __VLS_31;
/** @type {__VLS_StyleScopedClasses['fund-usage-query']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['page-description']} */ ;
/** @type {__VLS_StyleScopedClasses['query-steps']} */ ;
/** @type {__VLS_StyleScopedClasses['step-content']} */ ;
/** @type {__VLS_StyleScopedClasses['step-container']} */ ;
/** @type {__VLS_StyleScopedClasses['step-description']} */ ;
/** @type {__VLS_StyleScopedClasses['form-tip']} */ ;
/** @type {__VLS_StyleScopedClasses['form-tip']} */ ;
/** @type {__VLS_StyleScopedClasses['step-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['step-container']} */ ;
/** @type {__VLS_StyleScopedClasses['step-description']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-section']} */ ;
/** @type {__VLS_StyleScopedClasses['customer-name']} */ ;
/** @type {__VLS_StyleScopedClasses['customer-id']} */ ;
/** @type {__VLS_StyleScopedClasses['step-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['step-container']} */ ;
/** @type {__VLS_StyleScopedClasses['step-description']} */ ;
/** @type {__VLS_StyleScopedClasses['step-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['step-container']} */ ;
/** @type {__VLS_StyleScopedClasses['step-description']} */ ;
/** @type {__VLS_StyleScopedClasses['parameter-mapping']} */ ;
/** @type {__VLS_StyleScopedClasses['step-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['step-container']} */ ;
/** @type {__VLS_StyleScopedClasses['step-description']} */ ;
/** @type {__VLS_StyleScopedClasses['query-summary']} */ ;
/** @type {__VLS_StyleScopedClasses['selected-loans']} */ ;
/** @type {__VLS_StyleScopedClasses['customer-name']} */ ;
/** @type {__VLS_StyleScopedClasses['customer-id']} */ ;
/** @type {__VLS_StyleScopedClasses['step-actions']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            ATable: ATable,
            AButton: AButton,
            AInput: AInput,
            ATextarea: ATextarea,
            ASelect: ASelect,
            AOption: AOption,
            AForm: AForm,
            AFormItem: AFormItem,
            ACard: ACard,
            ASteps: ASteps,
            AStep: AStep,
            ARow: ARow,
            ACol: ACol,
            ARadioGroup: ARadioGroup,
            ARadio: ARadio,
            ARangePicker: ARangePicker,
            ATag: ATag,
            ADescriptions: ADescriptions,
            ADescriptionsItem: ADescriptionsItem,
            currentStep: currentStep,
            nextStep: nextStep,
            prevStep: prevStep,
            queryType: queryType,
            queryForm: queryForm,
            sampleForm: sampleForm,
            parameterMappings: parameterMappings,
            parameterColumns: parameterColumns,
            loanFilter: loanFilter,
            loanData: loanData,
            loanLoading: loanLoading,
            selectedLoanKeys: selectedLoanKeys,
            selectedLoans: selectedLoans,
            loanPagination: loanPagination,
            loanColumns: loanColumns,
            summaryColumns: summaryColumns,
            filteredLoanData: filteredLoanData,
            uniqueCustomers: uniqueCustomers,
            isNextButtonDisabled: isNextButtonDisabled,
            onLoanSelectionChange: onLoanSelectionChange,
            rowSelection: rowSelection,
            searchLoans: searchLoans,
            handleLoanFilter: handleLoanFilter,
            resetLoanFilter: resetLoanFilter,
            handleLoanPageChange: handleLoanPageChange,
            getLoanStatusColor: getLoanStatusColor,
            getLoanStatusText: getLoanStatusText,
            handleQueryTypeChange: handleQueryTypeChange,
            confirmQuery: confirmQuery,
            confirmBatchQuery: confirmBatchQuery,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
