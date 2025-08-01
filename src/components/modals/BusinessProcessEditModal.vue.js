import { ref, computed, watch } from 'vue';
import { Message } from '@arco-design/web-vue';
import { IconPlus, IconUp, IconDown, IconDelete, IconClose, IconFile, IconBarChart } from '@arco-design/web-vue/es/icon';
const props = defineProps();
const emit = defineEmits();
// 响应式数据
const visible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
});
const formData = ref({
    businessType: '',
    productType: '',
    steps: []
});
// 级联选择器相关数据
const cascaderValue = ref(['self', 'general']);
const cascaderOptions = ref([
    {
        value: 'self',
        label: '自营',
        children: [
            { value: 'general', label: '通用' },
            { value: 'personal', label: '个人贷' },
            { value: 'business', label: '企业贷' },
            { value: 'mortgage', label: '房贷' },
            { value: 'car', label: '车贷' }
        ]
    },
    {
        value: 'supermarket',
        label: '贷超',
        children: [
            { value: 'general', label: '通用' },
            { value: 'personal', label: '个人贷' },
            { value: 'business', label: '企业贷' }
        ]
    },
    {
        value: 'assist',
        label: '助贷',
        children: [
            { value: 'general', label: '通用' },
            { value: 'personal', label: '个人贷' },
            { value: 'mortgage', label: '房贷' }
        ]
    }
]);
// 数据表选择相关
const tableSelectVisible = ref(false);
const currentStepIndex = ref(-1);
const tableSearchKeyword = ref('');
const selectedTableKeys = ref([]);
// 指标选择相关
const metricSelectVisible = ref(false);
const metricSearchKeyword = ref('');
const selectedMetricKeys = ref([]);
// 模拟数据表数据
const allTables = ref([
    { name: 'user_register', description: '用户注册信息表', type: 'table', owner: '张三' },
    { name: 'user_device', description: '用户设备信息表', type: 'table', owner: '李四' },
    { name: 'user_auth', description: '用户实名认证表', type: 'table', owner: '王五' },
    { name: 'user_bankcard', description: '用户银行卡信息表', type: 'table', owner: '赵六' },
    { name: 'credit_apply', description: '授信申请记录表', type: 'table', owner: '钱七' },
    { name: 'credit_result', description: '授信结果表', type: 'table', owner: '孙八' }
]);
// 模拟指标数据
const allMetrics = ref([
    { name: '日注册量', description: '每日新增注册用户数', unit: '人', formula: 'count(distinct user_id)' },
    { name: '渠道转化率', description: '各渠道注册成功率', unit: '%', formula: 'count(success)/count(total)' },
    { name: '实名认证率', description: '完成实名认证的用户占比', unit: '%', formula: 'count(distinct auth_user)/count(distinct total_user)' },
    { name: '认证通过率', description: '实名认证通过的比例', unit: '%', formula: 'count(success)/count(total)' },
    { name: '授信申请率', description: '注册用户中申请授信的比例', unit: '%', formula: 'count(distinct apply_user)/count(distinct register_user)' },
    { name: '平均申请金额', description: '授信申请平均金额', unit: '元', formula: 'avg(apply_amount)' }
]);
// 计算属性
const filteredTables = computed(() => {
    if (!tableSearchKeyword.value)
        return allTables.value;
    return allTables.value.filter(table => table.name.includes(tableSearchKeyword.value) ||
        table.description.includes(tableSearchKeyword.value));
});
const filteredMetrics = computed(() => {
    if (!metricSearchKeyword.value)
        return allMetrics.value;
    return allMetrics.value.filter(metric => metric.name.includes(metricSearchKeyword.value) ||
        metric.description.includes(metricSearchKeyword.value));
});
// 表格列定义
const tableSelectColumns = [
    { title: '表名', dataIndex: 'name', width: 200 },
    { title: '描述', dataIndex: 'description' },
    { title: '类型', dataIndex: 'type', width: 100 },
    { title: '负责人', dataIndex: 'owner', width: 100 }
];
const metricSelectColumns = [
    { title: '指标名', dataIndex: 'name', width: 200 },
    { title: '描述', dataIndex: 'description' },
    { title: '单位', dataIndex: 'unit', width: 80 },
    { title: '计算公式', dataIndex: 'formula', width: 200 }
];
// 监听初始数据变化
watch(() => props.initialData, (newData) => {
    if (newData) {
        formData.value = JSON.parse(JSON.stringify(newData));
        // 同步更新级联选择器的值
        cascaderValue.value = [newData.businessType || 'self', newData.productType || 'general'];
    }
}, { immediate: true });
// 监听弹窗显示状态
watch(() => props.visible, (newVisible) => {
    if (newVisible && !props.initialData) {
        // 重置表单数据
        formData.value = {
            businessType: '',
            productType: '',
            steps: []
        };
        // 重置级联选择器的值
        cascaderValue.value = ['self', 'general'];
    }
});
// 步骤管理方法
const addStep = () => {
    const newStep = {
        id: `step_${Date.now()}`,
        name: '',
        description: '',
        tables: [],
        metrics: []
    };
    formData.value.steps.push(newStep);
};
const removeStep = (index) => {
    formData.value.steps.splice(index, 1);
};
const moveStep = (index, direction) => {
    const steps = formData.value.steps;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < steps.length) {
        const temp = steps[index];
        steps[index] = steps[targetIndex];
        steps[targetIndex] = temp;
    }
};
// 数据表选择方法
const selectTables = (stepIndex) => {
    currentStepIndex.value = stepIndex;
    const currentStep = formData.value.steps[stepIndex];
    selectedTableKeys.value = currentStep.tables.map(table => table.name);
    tableSelectVisible.value = true;
};
const onTableSelectionChange = (selectedKeys) => {
    selectedTableKeys.value = selectedKeys;
};
const confirmTableSelection = () => {
    const selectedTables = allTables.value.filter(table => selectedTableKeys.value.includes(table.name));
    formData.value.steps[currentStepIndex.value].tables = selectedTables;
    tableSelectVisible.value = false;
};
const removeTable = (stepIndex, tableName) => {
    const step = formData.value.steps[stepIndex];
    step.tables = step.tables.filter(table => table.name !== tableName);
};
// 指标选择方法
const selectMetrics = (stepIndex) => {
    currentStepIndex.value = stepIndex;
    const currentStep = formData.value.steps[stepIndex];
    selectedMetricKeys.value = currentStep.metrics.map(metric => metric.name);
    metricSelectVisible.value = true;
};
const onMetricSelectionChange = (selectedKeys) => {
    selectedMetricKeys.value = selectedKeys;
};
const confirmMetricSelection = () => {
    const selectedMetrics = allMetrics.value.filter(metric => selectedMetricKeys.value.includes(metric.name));
    formData.value.steps[currentStepIndex.value].metrics = selectedMetrics;
    metricSelectVisible.value = false;
};
const removeMetric = (stepIndex, metricName) => {
    const step = formData.value.steps[stepIndex];
    step.metrics = step.metrics.filter(metric => metric.name !== metricName);
};
// 级联选择器变更处理
const onCascaderChange = (value) => {
    if (value && value.length === 2) {
        formData.value.businessType = value[0];
        formData.value.productType = value[1];
        console.log('业务类型变化:', value[0], '产品类型变化:', value[1]);
        Message.info(`已选择${getBusinessTypeName(value[0])}模式 - ${getProductTypeName(value[1])}产品`);
    }
};
// 获取业务类型名称
const getBusinessTypeName = (type) => {
    const typeMap = {
        'self': '自营',
        'supermarket': '贷超',
        'assist': '助贷'
    };
    return typeMap[type] || type;
};
// 获取产品类型名称
const getProductTypeName = (type) => {
    const typeMap = {
        'general': '通用',
        'personal': '个人贷',
        'business': '企业贷',
        'mortgage': '房贷',
        'car': '车贷'
    };
    return typeMap[type] || type;
};
// 弹窗操作方法
const handleSave = () => {
    // 验证表单
    if (!formData.value.businessType) {
        Message.error('请选择业务类型');
        return;
    }
    if (!formData.value.productType) {
        Message.error('请选择产品类型');
        return;
    }
    if (formData.value.steps.length === 0) {
        Message.error('请至少添加一个业务步骤');
        return;
    }
    // 验证步骤信息
    for (let i = 0; i < formData.value.steps.length; i++) {
        const step = formData.value.steps[i];
        if (!step.name) {
            Message.error(`第${i + 1}个步骤的名称不能为空`);
            return;
        }
        if (!step.description) {
            Message.error(`第${i + 1}个步骤的说明不能为空`);
            return;
        }
    }
    emit('save', formData.value);
    visible.value = false;
    Message.success('保存成功');
};
const handleCancel = () => {
    visible.value = false;
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['steps-header']} */ ;
// CSS variable injection 
// CSS variable injection end 
const __VLS_0 = {}.AModal;
/** @type {[typeof __VLS_components.AModal, typeof __VLS_components.aModal, typeof __VLS_components.AModal, typeof __VLS_components.aModal, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onOk': {} },
    ...{ 'onCancel': {} },
    visible: (__VLS_ctx.visible),
    title: "编辑业务流程",
    width: "1200px",
    maskClosable: (false),
}));
const __VLS_2 = __VLS_1({
    ...{ 'onOk': {} },
    ...{ 'onCancel': {} },
    visible: (__VLS_ctx.visible),
    title: "编辑业务流程",
    width: "1200px",
    maskClosable: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onOk: (__VLS_ctx.handleSave)
};
const __VLS_8 = {
    onCancel: (__VLS_ctx.handleCancel)
};
var __VLS_9 = {};
__VLS_3.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "business-process-edit" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "basic-config" },
});
const __VLS_10 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_11 = __VLS_asFunctionalComponent(__VLS_10, new __VLS_10({
    gutter: (16),
}));
const __VLS_12 = __VLS_11({
    gutter: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_11));
__VLS_13.slots.default;
const __VLS_14 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_15 = __VLS_asFunctionalComponent(__VLS_14, new __VLS_14({
    span: (24),
}));
const __VLS_16 = __VLS_15({
    span: (24),
}, ...__VLS_functionalComponentArgsRest(__VLS_15));
__VLS_17.slots.default;
const __VLS_18 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_19 = __VLS_asFunctionalComponent(__VLS_18, new __VLS_18({
    label: "业务产品",
    required: true,
}));
const __VLS_20 = __VLS_19({
    label: "业务产品",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_19));
__VLS_21.slots.default;
const __VLS_22 = {}.ACascader;
/** @type {[typeof __VLS_components.ACascader, typeof __VLS_components.aCascader, ]} */ ;
// @ts-ignore
const __VLS_23 = __VLS_asFunctionalComponent(__VLS_22, new __VLS_22({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.cascaderValue),
    options: (__VLS_ctx.cascaderOptions),
    placeholder: "请选择业务类型和产品类型",
    ...{ style: ({ width: '300px' }) },
    allowSearch: true,
    expandTrigger: "hover",
}));
const __VLS_24 = __VLS_23({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.cascaderValue),
    options: (__VLS_ctx.cascaderOptions),
    placeholder: "请选择业务类型和产品类型",
    ...{ style: ({ width: '300px' }) },
    allowSearch: true,
    expandTrigger: "hover",
}, ...__VLS_functionalComponentArgsRest(__VLS_23));
let __VLS_26;
let __VLS_27;
let __VLS_28;
const __VLS_29 = {
    onChange: (__VLS_ctx.onCascaderChange)
};
var __VLS_25;
var __VLS_21;
var __VLS_17;
var __VLS_13;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "steps-config" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "steps-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
const __VLS_30 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_31 = __VLS_asFunctionalComponent(__VLS_30, new __VLS_30({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_32 = __VLS_31({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_31));
let __VLS_34;
let __VLS_35;
let __VLS_36;
const __VLS_37 = {
    onClick: (__VLS_ctx.addStep)
};
__VLS_33.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_33.slots;
    const __VLS_38 = {}.IconPlus;
    /** @type {[typeof __VLS_components.IconPlus, typeof __VLS_components.iconPlus, ]} */ ;
    // @ts-ignore
    const __VLS_39 = __VLS_asFunctionalComponent(__VLS_38, new __VLS_38({}));
    const __VLS_40 = __VLS_39({}, ...__VLS_functionalComponentArgsRest(__VLS_39));
}
var __VLS_33;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "steps-list" },
});
for (const [step, index] of __VLS_getVForSourceType((__VLS_ctx.formData.steps))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (step.id),
        ...{ class: "step-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "step-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "step-order" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "step-number" },
    });
    (index + 1);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "step-actions" },
    });
    if (index > 0) {
        const __VLS_42 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
        // @ts-ignore
        const __VLS_43 = __VLS_asFunctionalComponent(__VLS_42, new __VLS_42({
            ...{ 'onClick': {} },
            type: "text",
            size: "mini",
        }));
        const __VLS_44 = __VLS_43({
            ...{ 'onClick': {} },
            type: "text",
            size: "mini",
        }, ...__VLS_functionalComponentArgsRest(__VLS_43));
        let __VLS_46;
        let __VLS_47;
        let __VLS_48;
        const __VLS_49 = {
            onClick: (...[$event]) => {
                if (!(index > 0))
                    return;
                __VLS_ctx.moveStep(index, 'up');
            }
        };
        __VLS_45.slots.default;
        {
            const { icon: __VLS_thisSlot } = __VLS_45.slots;
            const __VLS_50 = {}.IconUp;
            /** @type {[typeof __VLS_components.IconUp, typeof __VLS_components.iconUp, ]} */ ;
            // @ts-ignore
            const __VLS_51 = __VLS_asFunctionalComponent(__VLS_50, new __VLS_50({}));
            const __VLS_52 = __VLS_51({}, ...__VLS_functionalComponentArgsRest(__VLS_51));
        }
        var __VLS_45;
    }
    if (index < __VLS_ctx.formData.steps.length - 1) {
        const __VLS_54 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
        // @ts-ignore
        const __VLS_55 = __VLS_asFunctionalComponent(__VLS_54, new __VLS_54({
            ...{ 'onClick': {} },
            type: "text",
            size: "mini",
        }));
        const __VLS_56 = __VLS_55({
            ...{ 'onClick': {} },
            type: "text",
            size: "mini",
        }, ...__VLS_functionalComponentArgsRest(__VLS_55));
        let __VLS_58;
        let __VLS_59;
        let __VLS_60;
        const __VLS_61 = {
            onClick: (...[$event]) => {
                if (!(index < __VLS_ctx.formData.steps.length - 1))
                    return;
                __VLS_ctx.moveStep(index, 'down');
            }
        };
        __VLS_57.slots.default;
        {
            const { icon: __VLS_thisSlot } = __VLS_57.slots;
            const __VLS_62 = {}.IconDown;
            /** @type {[typeof __VLS_components.IconDown, typeof __VLS_components.iconDown, ]} */ ;
            // @ts-ignore
            const __VLS_63 = __VLS_asFunctionalComponent(__VLS_62, new __VLS_62({}));
            const __VLS_64 = __VLS_63({}, ...__VLS_functionalComponentArgsRest(__VLS_63));
        }
        var __VLS_57;
    }
    const __VLS_66 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_67 = __VLS_asFunctionalComponent(__VLS_66, new __VLS_66({
        ...{ 'onClick': {} },
        type: "text",
        size: "mini",
        status: "danger",
    }));
    const __VLS_68 = __VLS_67({
        ...{ 'onClick': {} },
        type: "text",
        size: "mini",
        status: "danger",
    }, ...__VLS_functionalComponentArgsRest(__VLS_67));
    let __VLS_70;
    let __VLS_71;
    let __VLS_72;
    const __VLS_73 = {
        onClick: (...[$event]) => {
            __VLS_ctx.removeStep(index);
        }
    };
    __VLS_69.slots.default;
    {
        const { icon: __VLS_thisSlot } = __VLS_69.slots;
        const __VLS_74 = {}.IconDelete;
        /** @type {[typeof __VLS_components.IconDelete, typeof __VLS_components.iconDelete, ]} */ ;
        // @ts-ignore
        const __VLS_75 = __VLS_asFunctionalComponent(__VLS_74, new __VLS_74({}));
        const __VLS_76 = __VLS_75({}, ...__VLS_functionalComponentArgsRest(__VLS_75));
    }
    var __VLS_69;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "step-basic-info" },
    });
    const __VLS_78 = {}.ARow;
    /** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
    // @ts-ignore
    const __VLS_79 = __VLS_asFunctionalComponent(__VLS_78, new __VLS_78({
        gutter: (16),
    }));
    const __VLS_80 = __VLS_79({
        gutter: (16),
    }, ...__VLS_functionalComponentArgsRest(__VLS_79));
    __VLS_81.slots.default;
    const __VLS_82 = {}.ACol;
    /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
    // @ts-ignore
    const __VLS_83 = __VLS_asFunctionalComponent(__VLS_82, new __VLS_82({
        span: (12),
    }));
    const __VLS_84 = __VLS_83({
        span: (12),
    }, ...__VLS_functionalComponentArgsRest(__VLS_83));
    __VLS_85.slots.default;
    const __VLS_86 = {}.AInput;
    /** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
    // @ts-ignore
    const __VLS_87 = __VLS_asFunctionalComponent(__VLS_86, new __VLS_86({
        modelValue: (step.name),
        placeholder: "请输入步骤名称",
        size: "small",
    }));
    const __VLS_88 = __VLS_87({
        modelValue: (step.name),
        placeholder: "请输入步骤名称",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_87));
    var __VLS_85;
    const __VLS_90 = {}.ACol;
    /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
    // @ts-ignore
    const __VLS_91 = __VLS_asFunctionalComponent(__VLS_90, new __VLS_90({
        span: (12),
    }));
    const __VLS_92 = __VLS_91({
        span: (12),
    }, ...__VLS_functionalComponentArgsRest(__VLS_91));
    __VLS_93.slots.default;
    const __VLS_94 = {}.AInput;
    /** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
    // @ts-ignore
    const __VLS_95 = __VLS_asFunctionalComponent(__VLS_94, new __VLS_94({
        modelValue: (step.description),
        placeholder: "请输入步骤说明",
        size: "small",
    }));
    const __VLS_96 = __VLS_95({
        modelValue: (step.description),
        placeholder: "请输入步骤说明",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_95));
    var __VLS_93;
    var __VLS_81;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "step-content" },
    });
    const __VLS_98 = {}.ATabs;
    /** @type {[typeof __VLS_components.ATabs, typeof __VLS_components.aTabs, typeof __VLS_components.ATabs, typeof __VLS_components.aTabs, ]} */ ;
    // @ts-ignore
    const __VLS_99 = __VLS_asFunctionalComponent(__VLS_98, new __VLS_98({
        defaultActiveKey: "tables",
    }));
    const __VLS_100 = __VLS_99({
        defaultActiveKey: "tables",
    }, ...__VLS_functionalComponentArgsRest(__VLS_99));
    __VLS_101.slots.default;
    const __VLS_102 = {}.ATabPane;
    /** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ ;
    // @ts-ignore
    const __VLS_103 = __VLS_asFunctionalComponent(__VLS_102, new __VLS_102({
        key: "tables",
        title: "关联数据表",
    }));
    const __VLS_104 = __VLS_103({
        key: "tables",
        title: "关联数据表",
    }, ...__VLS_functionalComponentArgsRest(__VLS_103));
    __VLS_105.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "association-section" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "section-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (step.tables.length);
    const __VLS_106 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_107 = __VLS_asFunctionalComponent(__VLS_106, new __VLS_106({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
    }));
    const __VLS_108 = __VLS_107({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_107));
    let __VLS_110;
    let __VLS_111;
    let __VLS_112;
    const __VLS_113 = {
        onClick: (...[$event]) => {
            __VLS_ctx.selectTables(index);
        }
    };
    __VLS_109.slots.default;
    {
        const { icon: __VLS_thisSlot } = __VLS_109.slots;
        const __VLS_114 = {}.IconPlus;
        /** @type {[typeof __VLS_components.IconPlus, typeof __VLS_components.iconPlus, ]} */ ;
        // @ts-ignore
        const __VLS_115 = __VLS_asFunctionalComponent(__VLS_114, new __VLS_114({}));
        const __VLS_116 = __VLS_115({}, ...__VLS_functionalComponentArgsRest(__VLS_115));
    }
    var __VLS_109;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "associated-items" },
    });
    for (const [table] of __VLS_getVForSourceType((step.tables))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (table.name),
            ...{ class: "associated-item" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "item-info" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "item-name" },
        });
        (table.name);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "item-desc" },
        });
        (table.description);
        const __VLS_118 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
        // @ts-ignore
        const __VLS_119 = __VLS_asFunctionalComponent(__VLS_118, new __VLS_118({
            ...{ 'onClick': {} },
            type: "text",
            size: "mini",
            status: "danger",
        }));
        const __VLS_120 = __VLS_119({
            ...{ 'onClick': {} },
            type: "text",
            size: "mini",
            status: "danger",
        }, ...__VLS_functionalComponentArgsRest(__VLS_119));
        let __VLS_122;
        let __VLS_123;
        let __VLS_124;
        const __VLS_125 = {
            onClick: (...[$event]) => {
                __VLS_ctx.removeTable(index, table.name);
            }
        };
        __VLS_121.slots.default;
        {
            const { icon: __VLS_thisSlot } = __VLS_121.slots;
            const __VLS_126 = {}.IconClose;
            /** @type {[typeof __VLS_components.IconClose, typeof __VLS_components.iconClose, ]} */ ;
            // @ts-ignore
            const __VLS_127 = __VLS_asFunctionalComponent(__VLS_126, new __VLS_126({}));
            const __VLS_128 = __VLS_127({}, ...__VLS_functionalComponentArgsRest(__VLS_127));
        }
        var __VLS_121;
    }
    if (step.tables.length === 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "empty-state" },
        });
        const __VLS_130 = {}.IconFile;
        /** @type {[typeof __VLS_components.IconFile, typeof __VLS_components.iconFile, ]} */ ;
        // @ts-ignore
        const __VLS_131 = __VLS_asFunctionalComponent(__VLS_130, new __VLS_130({
            ...{ class: "empty-icon" },
        }));
        const __VLS_132 = __VLS_131({
            ...{ class: "empty-icon" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_131));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    }
    var __VLS_105;
    const __VLS_134 = {}.ATabPane;
    /** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ ;
    // @ts-ignore
    const __VLS_135 = __VLS_asFunctionalComponent(__VLS_134, new __VLS_134({
        key: "metrics",
        title: "关联指标",
    }));
    const __VLS_136 = __VLS_135({
        key: "metrics",
        title: "关联指标",
    }, ...__VLS_functionalComponentArgsRest(__VLS_135));
    __VLS_137.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "association-section" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "section-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (step.metrics.length);
    const __VLS_138 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_139 = __VLS_asFunctionalComponent(__VLS_138, new __VLS_138({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
    }));
    const __VLS_140 = __VLS_139({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_139));
    let __VLS_142;
    let __VLS_143;
    let __VLS_144;
    const __VLS_145 = {
        onClick: (...[$event]) => {
            __VLS_ctx.selectMetrics(index);
        }
    };
    __VLS_141.slots.default;
    {
        const { icon: __VLS_thisSlot } = __VLS_141.slots;
        const __VLS_146 = {}.IconPlus;
        /** @type {[typeof __VLS_components.IconPlus, typeof __VLS_components.iconPlus, ]} */ ;
        // @ts-ignore
        const __VLS_147 = __VLS_asFunctionalComponent(__VLS_146, new __VLS_146({}));
        const __VLS_148 = __VLS_147({}, ...__VLS_functionalComponentArgsRest(__VLS_147));
    }
    var __VLS_141;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "associated-items" },
    });
    for (const [metric] of __VLS_getVForSourceType((step.metrics))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (metric.name),
            ...{ class: "associated-item" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "item-info" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "item-name" },
        });
        (metric.name);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "item-desc" },
        });
        (metric.description);
        const __VLS_150 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
        // @ts-ignore
        const __VLS_151 = __VLS_asFunctionalComponent(__VLS_150, new __VLS_150({
            ...{ 'onClick': {} },
            type: "text",
            size: "mini",
            status: "danger",
        }));
        const __VLS_152 = __VLS_151({
            ...{ 'onClick': {} },
            type: "text",
            size: "mini",
            status: "danger",
        }, ...__VLS_functionalComponentArgsRest(__VLS_151));
        let __VLS_154;
        let __VLS_155;
        let __VLS_156;
        const __VLS_157 = {
            onClick: (...[$event]) => {
                __VLS_ctx.removeMetric(index, metric.name);
            }
        };
        __VLS_153.slots.default;
        {
            const { icon: __VLS_thisSlot } = __VLS_153.slots;
            const __VLS_158 = {}.IconClose;
            /** @type {[typeof __VLS_components.IconClose, typeof __VLS_components.iconClose, ]} */ ;
            // @ts-ignore
            const __VLS_159 = __VLS_asFunctionalComponent(__VLS_158, new __VLS_158({}));
            const __VLS_160 = __VLS_159({}, ...__VLS_functionalComponentArgsRest(__VLS_159));
        }
        var __VLS_153;
    }
    if (step.metrics.length === 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "empty-state" },
        });
        const __VLS_162 = {}.IconBarChart;
        /** @type {[typeof __VLS_components.IconBarChart, typeof __VLS_components.iconBarChart, ]} */ ;
        // @ts-ignore
        const __VLS_163 = __VLS_asFunctionalComponent(__VLS_162, new __VLS_162({
            ...{ class: "empty-icon" },
        }));
        const __VLS_164 = __VLS_163({
            ...{ class: "empty-icon" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_163));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    }
    var __VLS_137;
    var __VLS_101;
}
if (__VLS_ctx.formData.steps.length === 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "empty-steps" },
    });
    const __VLS_166 = {}.IconPlus;
    /** @type {[typeof __VLS_components.IconPlus, typeof __VLS_components.iconPlus, ]} */ ;
    // @ts-ignore
    const __VLS_167 = __VLS_asFunctionalComponent(__VLS_166, new __VLS_166({
        ...{ class: "empty-icon" },
    }));
    const __VLS_168 = __VLS_167({
        ...{ class: "empty-icon" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_167));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
}
const __VLS_170 = {}.AModal;
/** @type {[typeof __VLS_components.AModal, typeof __VLS_components.aModal, typeof __VLS_components.AModal, typeof __VLS_components.aModal, ]} */ ;
// @ts-ignore
const __VLS_171 = __VLS_asFunctionalComponent(__VLS_170, new __VLS_170({
    ...{ 'onOk': {} },
    ...{ 'onCancel': {} },
    visible: (__VLS_ctx.tableSelectVisible),
    title: "选择数据表",
    width: "800px",
}));
const __VLS_172 = __VLS_171({
    ...{ 'onOk': {} },
    ...{ 'onCancel': {} },
    visible: (__VLS_ctx.tableSelectVisible),
    title: "选择数据表",
    width: "800px",
}, ...__VLS_functionalComponentArgsRest(__VLS_171));
let __VLS_174;
let __VLS_175;
let __VLS_176;
const __VLS_177 = {
    onOk: (__VLS_ctx.confirmTableSelection)
};
const __VLS_178 = {
    onCancel: (...[$event]) => {
        __VLS_ctx.tableSelectVisible = false;
    }
};
__VLS_173.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "table-select-content" },
});
const __VLS_179 = {}.AInputSearch;
/** @type {[typeof __VLS_components.AInputSearch, typeof __VLS_components.aInputSearch, ]} */ ;
// @ts-ignore
const __VLS_180 = __VLS_asFunctionalComponent(__VLS_179, new __VLS_179({
    modelValue: (__VLS_ctx.tableSearchKeyword),
    placeholder: "搜索数据表",
    ...{ style: {} },
}));
const __VLS_181 = __VLS_180({
    modelValue: (__VLS_ctx.tableSearchKeyword),
    placeholder: "搜索数据表",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_180));
const __VLS_183 = {}.ATable;
/** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ ;
// @ts-ignore
const __VLS_184 = __VLS_asFunctionalComponent(__VLS_183, new __VLS_183({
    data: (__VLS_ctx.filteredTables),
    columns: (__VLS_ctx.tableSelectColumns),
    rowSelection: ({
        type: 'checkbox',
        selectedRowKeys: __VLS_ctx.selectedTableKeys,
        onSelectionChange: __VLS_ctx.onTableSelectionChange
    }),
    pagination: ({ pageSize: 10 }),
    size: "small",
}));
const __VLS_185 = __VLS_184({
    data: (__VLS_ctx.filteredTables),
    columns: (__VLS_ctx.tableSelectColumns),
    rowSelection: ({
        type: 'checkbox',
        selectedRowKeys: __VLS_ctx.selectedTableKeys,
        onSelectionChange: __VLS_ctx.onTableSelectionChange
    }),
    pagination: ({ pageSize: 10 }),
    size: "small",
}, ...__VLS_functionalComponentArgsRest(__VLS_184));
var __VLS_173;
const __VLS_187 = {}.AModal;
/** @type {[typeof __VLS_components.AModal, typeof __VLS_components.aModal, typeof __VLS_components.AModal, typeof __VLS_components.aModal, ]} */ ;
// @ts-ignore
const __VLS_188 = __VLS_asFunctionalComponent(__VLS_187, new __VLS_187({
    ...{ 'onOk': {} },
    ...{ 'onCancel': {} },
    visible: (__VLS_ctx.metricSelectVisible),
    title: "选择指标",
    width: "800px",
}));
const __VLS_189 = __VLS_188({
    ...{ 'onOk': {} },
    ...{ 'onCancel': {} },
    visible: (__VLS_ctx.metricSelectVisible),
    title: "选择指标",
    width: "800px",
}, ...__VLS_functionalComponentArgsRest(__VLS_188));
let __VLS_191;
let __VLS_192;
let __VLS_193;
const __VLS_194 = {
    onOk: (__VLS_ctx.confirmMetricSelection)
};
const __VLS_195 = {
    onCancel: (...[$event]) => {
        __VLS_ctx.metricSelectVisible = false;
    }
};
__VLS_190.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "metric-select-content" },
});
const __VLS_196 = {}.AInputSearch;
/** @type {[typeof __VLS_components.AInputSearch, typeof __VLS_components.aInputSearch, ]} */ ;
// @ts-ignore
const __VLS_197 = __VLS_asFunctionalComponent(__VLS_196, new __VLS_196({
    modelValue: (__VLS_ctx.metricSearchKeyword),
    placeholder: "搜索指标",
    ...{ style: {} },
}));
const __VLS_198 = __VLS_197({
    modelValue: (__VLS_ctx.metricSearchKeyword),
    placeholder: "搜索指标",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_197));
const __VLS_200 = {}.ATable;
/** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ ;
// @ts-ignore
const __VLS_201 = __VLS_asFunctionalComponent(__VLS_200, new __VLS_200({
    data: (__VLS_ctx.filteredMetrics),
    columns: (__VLS_ctx.metricSelectColumns),
    rowSelection: ({
        type: 'checkbox',
        selectedRowKeys: __VLS_ctx.selectedMetricKeys,
        onSelectionChange: __VLS_ctx.onMetricSelectionChange
    }),
    pagination: ({ pageSize: 10 }),
    size: "small",
}));
const __VLS_202 = __VLS_201({
    data: (__VLS_ctx.filteredMetrics),
    columns: (__VLS_ctx.metricSelectColumns),
    rowSelection: ({
        type: 'checkbox',
        selectedRowKeys: __VLS_ctx.selectedMetricKeys,
        onSelectionChange: __VLS_ctx.onMetricSelectionChange
    }),
    pagination: ({ pageSize: 10 }),
    size: "small",
}, ...__VLS_functionalComponentArgsRest(__VLS_201));
var __VLS_190;
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['business-process-edit']} */ ;
/** @type {__VLS_StyleScopedClasses['basic-config']} */ ;
/** @type {__VLS_StyleScopedClasses['steps-config']} */ ;
/** @type {__VLS_StyleScopedClasses['steps-header']} */ ;
/** @type {__VLS_StyleScopedClasses['steps-list']} */ ;
/** @type {__VLS_StyleScopedClasses['step-item']} */ ;
/** @type {__VLS_StyleScopedClasses['step-header']} */ ;
/** @type {__VLS_StyleScopedClasses['step-order']} */ ;
/** @type {__VLS_StyleScopedClasses['step-number']} */ ;
/** @type {__VLS_StyleScopedClasses['step-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['step-basic-info']} */ ;
/** @type {__VLS_StyleScopedClasses['step-content']} */ ;
/** @type {__VLS_StyleScopedClasses['association-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['associated-items']} */ ;
/** @type {__VLS_StyleScopedClasses['associated-item']} */ ;
/** @type {__VLS_StyleScopedClasses['item-info']} */ ;
/** @type {__VLS_StyleScopedClasses['item-name']} */ ;
/** @type {__VLS_StyleScopedClasses['item-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['association-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['associated-items']} */ ;
/** @type {__VLS_StyleScopedClasses['associated-item']} */ ;
/** @type {__VLS_StyleScopedClasses['item-info']} */ ;
/** @type {__VLS_StyleScopedClasses['item-name']} */ ;
/** @type {__VLS_StyleScopedClasses['item-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-steps']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['table-select-content']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-select-content']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            IconPlus: IconPlus,
            IconUp: IconUp,
            IconDown: IconDown,
            IconDelete: IconDelete,
            IconClose: IconClose,
            IconFile: IconFile,
            IconBarChart: IconBarChart,
            visible: visible,
            formData: formData,
            cascaderValue: cascaderValue,
            cascaderOptions: cascaderOptions,
            tableSelectVisible: tableSelectVisible,
            tableSearchKeyword: tableSearchKeyword,
            selectedTableKeys: selectedTableKeys,
            metricSelectVisible: metricSelectVisible,
            metricSearchKeyword: metricSearchKeyword,
            selectedMetricKeys: selectedMetricKeys,
            filteredTables: filteredTables,
            filteredMetrics: filteredMetrics,
            tableSelectColumns: tableSelectColumns,
            metricSelectColumns: metricSelectColumns,
            addStep: addStep,
            removeStep: removeStep,
            moveStep: moveStep,
            selectTables: selectTables,
            onTableSelectionChange: onTableSelectionChange,
            confirmTableSelection: confirmTableSelection,
            removeTable: removeTable,
            selectMetrics: selectMetrics,
            onMetricSelectionChange: onMetricSelectionChange,
            confirmMetricSelection: confirmMetricSelection,
            removeMetric: removeMetric,
            onCascaderChange: onCascaderChange,
            handleSave: handleSave,
            handleCancel: handleCancel,
        };
    },
    __typeEmits: {},
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeEmits: {},
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
