import { ref, onMounted, nextTick, watch } from 'vue';
import * as echarts from 'echarts';
import { generateExternalProductData } from '@/mock/external-data';
const props = defineProps({
    visible: Boolean,
    productData: {
        type: Object,
        default: () => ({})
    },
    selectedProducts: {
        type: Array,
        default: () => []
    }
});
const emit = defineEmits(['update:visible', 'update:productData']);
// 编辑状态
const isEditing = ref(false);
const editModalVisible = ref(false);
const editForm = ref({
    dataSourceType: '',
    dataSourceCategory: '',
    supplier: '',
    price: 0,
    description: '',
    tableName: ''
});
// 图表引用
const priceChartRef = ref();
const costChartRef = ref();
const valueChartRef = ref();
const ivChartRef = ref();
const ksChartRef = ref();
const psiChartRef = ref();
let priceChart = null;
let costChart = null;
let valueChart = null;
let ivChart = null;
let ksChart = null;
let psiChart = null;
// 更新图表
const updatePriceChart = (data) => {
    console.log('更新价格图表，数据长度:', data?.length);
    if (priceChartRef.value && priceChart && data?.length) {
        const option = {
            tooltip: {
                trigger: 'axis',
                formatter: (params) => {
                    return params.map(param => {
                        return `${param.seriesName}: ${param.value}元/条`;
                    }).join('<br/>');
                }
            },
            legend: {
                data: ['单次调用价格'],
                bottom: 0
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '10%',
                top: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: data.map(item => item.month),
                axisLabel: {
                    rotate: 45
                }
            },
            yAxis: {
                type: 'value',
                name: '单次调用价格（元/条）'
            },
            series: [
                {
                    name: '单次调用价格',
                    type: 'line',
                    data: data.map(item => item.pricePerCall),
                    itemStyle: {
                        color: '#165DFF'
                    },
                    smooth: true,
                    symbol: 'circle'
                }
            ]
        };
        priceChart.setOption(option);
        priceChart.resize();
    }
};
const updateCostChart = (data) => {
    console.log('更新成本图表，数据长度:', data?.length);
    if (costChartRef.value && costChart && data?.length) {
        const option = {
            tooltip: {
                trigger: 'axis',
                formatter: (params) => {
                    return params.map(param => {
                        return `${param.seriesName}: ${param.value}元`;
                    }).join('<br/>');
                }
            },
            legend: {
                data: ['预算', '实际消耗'],
                bottom: 0
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '10%',
                top: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: data.map(item => item.month),
                axisLabel: {
                    rotate: 45
                }
            },
            yAxis: {
                type: 'value',
                name: '金额（元）'
            },
            series: [
                {
                    name: '预算',
                    type: 'line',
                    data: data.map(item => item.budget),
                    itemStyle: {
                        color: '#14C9C9'
                    },
                    smooth: true,
                    symbol: 'circle'
                },
                {
                    name: '实际消耗',
                    type: 'line',
                    data: data.map(item => item.actualCost),
                    itemStyle: {
                        color: '#722ED1'
                    },
                    smooth: true,
                    symbol: 'circle'
                }
            ]
        };
        costChart.setOption(option);
        costChart.resize();
    }
};
const updateValueChart = (data) => {
    if (valueChartRef.value && valueChart && data?.length) {
        const option = {
            tooltip: {
                trigger: 'axis',
                formatter: (params) => {
                    return params.map(param => {
                        return `${param.seriesName}: ${param.value}`;
                    }).join('<br/>');
                }
            },
            legend: {
                data: ['性价比'],
                bottom: 0
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '10%',
                top: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: data.map(item => item.month),
                axisLabel: {
                    rotate: 45
                }
            },
            yAxis: {
                type: 'value',
                name: 'KS/单价'
            },
            series: [
                {
                    name: '性价比',
                    type: 'line',
                    data: data.map(item => item.valuePerPrice),
                    itemStyle: {
                        color: '#14C9C9'
                    },
                    smooth: true,
                    symbol: 'circle'
                }
            ]
        };
        valueChart.setOption(option);
        valueChart.resize();
    }
};
const updateIvChart = (data) => {
    if (ivChartRef.value && ivChart && data?.length) {
        const option = {
            tooltip: {
                trigger: 'axis',
                formatter: (params) => {
                    return params.map(param => {
                        return `${param.seriesName}: ${param.value}`;
                    }).join('<br/>');
                }
            },
            legend: {
                data: ['IV'],
                bottom: 0
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '10%',
                top: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: data.map(item => item.month),
                axisLabel: {
                    rotate: 45
                }
            },
            yAxis: {
                type: 'value',
                name: 'IV值'
            },
            series: [
                {
                    name: 'IV',
                    type: 'line',
                    data: data.map(item => item.iv),
                    itemStyle: {
                        color: '#722ED1'
                    },
                    smooth: true,
                    symbol: 'circle'
                }
            ]
        };
        ivChart.setOption(option);
        ivChart.resize();
    }
};
const updateKsChart = (data) => {
    if (ksChartRef.value && ksChart && data?.length) {
        const option = {
            tooltip: {
                trigger: 'axis',
                formatter: (params) => {
                    return params.map(param => {
                        return `${param.seriesName}: ${param.value}`;
                    }).join('<br/>');
                }
            },
            legend: {
                data: ['KS'],
                bottom: 0
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '10%',
                top: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: data.map(item => item.month),
                axisLabel: {
                    rotate: 45
                }
            },
            yAxis: {
                type: 'value',
                name: 'KS值'
            },
            series: [
                {
                    name: 'KS',
                    type: 'line',
                    data: data.map(item => item.ks),
                    itemStyle: {
                        color: '#F7BA1E'
                    },
                    smooth: true,
                    symbol: 'circle'
                }
            ]
        };
        ksChart.setOption(option);
        ksChart.resize();
    }
};
const updatePsiChart = (data) => {
    if (psiChartRef.value && psiChart && data?.length) {
        const option = {
            tooltip: {
                trigger: 'axis',
                formatter: (params) => {
                    return params.map(param => {
                        return `${param.seriesName}: ${param.value}`;
                    }).join('<br/>');
                }
            },
            legend: {
                data: ['PSI'],
                bottom: 0
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '10%',
                top: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: data.map(item => item.month),
                axisLabel: {
                    rotate: 45
                }
            },
            yAxis: {
                type: 'value',
                name: 'PSI值'
            },
            series: [
                {
                    name: 'PSI',
                    type: 'line',
                    data: data.map(item => item.psi),
                    itemStyle: {
                        color: '#D91AD9'
                    },
                    smooth: true,
                    symbol: 'circle'
                }
            ]
        };
        psiChart.setOption(option);
        psiChart.resize();
    }
};
// 初始化图表
const initCharts = () => {
    console.log('初始化图表...');
    const checkAndInit = () => {
        if (priceChartRef.value && priceChartRef.value.clientWidth > 0 && priceChartRef.value.clientHeight > 0) {
            console.log('价格图表容器尺寸:', priceChartRef.value.clientWidth, 'x', priceChartRef.value.clientHeight);
            priceChart = echarts.init(priceChartRef.value);
            console.log('价格图表初始化成功');
        }
        if (costChartRef.value && costChartRef.value.clientWidth > 0 && costChartRef.value.clientHeight > 0) {
            console.log('成本图表容器尺寸:', costChartRef.value.clientWidth, 'x', costChartRef.value.clientHeight);
            costChart = echarts.init(costChartRef.value);
            console.log('成本图表初始化成功');
        }
        if (valueChartRef.value && valueChartRef.value.clientWidth > 0 && valueChartRef.value.clientHeight > 0) {
            valueChart = echarts.init(valueChartRef.value);
            console.log('性价比图表初始化成功');
        }
        if (ivChartRef.value && ivChartRef.value.clientWidth > 0 && ivChartRef.value.clientHeight > 0) {
            ivChart = echarts.init(ivChartRef.value);
            console.log('IV图表初始化成功');
        }
        if (ksChartRef.value && ksChartRef.value.clientWidth > 0 && ksChartRef.value.clientHeight > 0) {
            ksChart = echarts.init(ksChartRef.value);
            console.log('KS图表初始化成功');
        }
        if (psiChartRef.value && psiChartRef.value.clientWidth > 0 && psiChartRef.value.clientHeight > 0) {
            psiChart = echarts.init(psiChartRef.value);
            console.log('PSI图表初始化成功');
        }
        if (!priceChart || !costChart || !valueChart || !ivChart || !ksChart || !psiChart) {
            requestAnimationFrame(checkAndInit);
        }
    };
    checkAndInit();
};
const handleCancel = () => {
    emit('update:visible', false);
};
const exportChartData = () => {
    // 导出图表数据逻辑
};
const toggleEditMode = () => {
    if (!isEditing.value) {
        // 进入编辑模式，填充表单数据
        editForm.value = {
            dataSourceType: props.productData.dataSourceType || '',
            dataSourceCategory: props.productData.dataSourceCategory || '',
            supplier: props.productData.supplier || '',
            price: props.productData.price || 0,
            description: props.productData.description || '',
            tableName: props.productData.tableName || ''
        };
        editModalVisible.value = true;
    }
    else {
        // 保存编辑
        handleSave();
    }
    isEditing.value = !isEditing.value;
};
const handleSave = () => {
    // 更新产品数据
    const updatedData = {
        ...props.productData,
        ...editForm.value
    };
    emit('update:productData', updatedData);
    editModalVisible.value = false;
};
const cancelEdit = () => {
    isEditing.value = false;
    editModalVisible.value = false;
};
const getLevelColor = (level) => {
    switch (level) {
        case '高': return 'green';
        case '中': return 'orange';
        case '低': return 'red';
        default: return 'gray';
    }
};
// 监听props变化
watch(() => props.productData, (newVal) => {
    if (newVal) {
        // 模拟数据
        const mockData = props.selectedProducts.length > 1 ?
            props.selectedProducts.map(product => generateExternalProductData(product)).flat() :
            generateExternalProductData(props.productData.product || '产品A');
        console.log('生成的产品数据:', mockData);
        console.log('产品名称:', props.productData.product);
        console.log('selectedProducts:', props.selectedProducts);
        if (!mockData || mockData.length === 0) {
            console.error('生成的产品数据为空!');
            return;
        }
        nextTick(() => {
            initCharts();
            nextTick(() => {
                updatePriceChart(mockData);
                updateCostChart(mockData);
                updateValueChart(mockData);
                updateIvChart(mockData);
                updateKsChart(mockData);
                updatePsiChart(mockData);
            });
        });
    }
}, { immediate: true });
// 初始化
onMounted(() => {
    nextTick(() => {
        initCharts();
    });
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
const __VLS_0 = {}.AModal;
/** @type {[typeof __VLS_components.AModal, typeof __VLS_components.aModal, typeof __VLS_components.AModal, typeof __VLS_components.aModal, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onCancel': {} },
    visible: (__VLS_ctx.visible),
    footer: (false),
    width: "80%",
}));
const __VLS_2 = __VLS_1({
    ...{ 'onCancel': {} },
    visible: (__VLS_ctx.visible),
    footer: (false),
    width: "80%",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onCancel: (__VLS_ctx.handleCancel)
};
var __VLS_8 = {};
__VLS_3.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "product-modal" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
(__VLS_ctx.selectedProducts.length > 1 ? '多产品对比' : __VLS_ctx.productData.product + ' 详细信息');
const __VLS_9 = {}.ATabs;
/** @type {[typeof __VLS_components.ATabs, typeof __VLS_components.aTabs, typeof __VLS_components.ATabs, typeof __VLS_components.aTabs, ]} */ ;
// @ts-ignore
const __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({
    defaultActiveKey: "1",
}));
const __VLS_11 = __VLS_10({
    defaultActiveKey: "1",
}, ...__VLS_functionalComponentArgsRest(__VLS_10));
__VLS_12.slots.default;
const __VLS_13 = {}.ATabPane;
/** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ ;
// @ts-ignore
const __VLS_14 = __VLS_asFunctionalComponent(__VLS_13, new __VLS_13({
    key: "1",
    title: "成本及消耗",
}));
const __VLS_15 = __VLS_14({
    key: "1",
    title: "成本及消耗",
}, ...__VLS_functionalComponentArgsRest(__VLS_14));
__VLS_16.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "modal-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ref: "priceChartRef",
    ...{ style: {} },
});
/** @type {typeof __VLS_ctx.priceChartRef} */ ;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "modal-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ref: "costChartRef",
    ...{ style: {} },
});
/** @type {typeof __VLS_ctx.costChartRef} */ ;
var __VLS_16;
const __VLS_17 = {}.ATabPane;
/** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ ;
// @ts-ignore
const __VLS_18 = __VLS_asFunctionalComponent(__VLS_17, new __VLS_17({
    key: "2",
    title: "性能指标",
}));
const __VLS_19 = __VLS_18({
    key: "2",
    title: "性能指标",
}, ...__VLS_functionalComponentArgsRest(__VLS_18));
__VLS_20.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "modal-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ref: "valueChartRef",
    ...{ style: {} },
});
/** @type {typeof __VLS_ctx.valueChartRef} */ ;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "modal-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ref: "ivChartRef",
    ...{ style: {} },
});
/** @type {typeof __VLS_ctx.ivChartRef} */ ;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "modal-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ref: "ksChartRef",
    ...{ style: {} },
});
/** @type {typeof __VLS_ctx.ksChartRef} */ ;
var __VLS_20;
const __VLS_21 = {}.ATabPane;
/** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ ;
// @ts-ignore
const __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({
    key: "3",
    title: "稳定性指标",
}));
const __VLS_23 = __VLS_22({
    key: "3",
    title: "稳定性指标",
}, ...__VLS_functionalComponentArgsRest(__VLS_22));
__VLS_24.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "modal-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ref: "psiChartRef",
    ...{ style: {} },
});
/** @type {typeof __VLS_ctx.psiChartRef} */ ;
var __VLS_24;
var __VLS_12;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "modal-actions" },
});
const __VLS_25 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_26 = __VLS_asFunctionalComponent(__VLS_25, new __VLS_25({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_27 = __VLS_26({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_26));
let __VLS_29;
let __VLS_30;
let __VLS_31;
const __VLS_32 = {
    onClick: (__VLS_ctx.exportChartData)
};
__VLS_28.slots.default;
var __VLS_28;
const __VLS_33 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_34 = __VLS_asFunctionalComponent(__VLS_33, new __VLS_33({
    ...{ 'onClick': {} },
    type: "primary",
    ...{ style: {} },
}));
const __VLS_35 = __VLS_34({
    ...{ 'onClick': {} },
    type: "primary",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_34));
let __VLS_37;
let __VLS_38;
let __VLS_39;
const __VLS_40 = {
    onClick: (__VLS_ctx.toggleEditMode)
};
__VLS_36.slots.default;
(__VLS_ctx.isEditing ? '保存' : '编辑');
var __VLS_36;
const __VLS_41 = {}.AModal;
/** @type {[typeof __VLS_components.AModal, typeof __VLS_components.aModal, typeof __VLS_components.AModal, typeof __VLS_components.aModal, ]} */ ;
// @ts-ignore
const __VLS_42 = __VLS_asFunctionalComponent(__VLS_41, new __VLS_41({
    ...{ 'onOk': {} },
    ...{ 'onCancel': {} },
    visible: (__VLS_ctx.editModalVisible),
    title: "编辑接口信息",
}));
const __VLS_43 = __VLS_42({
    ...{ 'onOk': {} },
    ...{ 'onCancel': {} },
    visible: (__VLS_ctx.editModalVisible),
    title: "编辑接口信息",
}, ...__VLS_functionalComponentArgsRest(__VLS_42));
let __VLS_45;
let __VLS_46;
let __VLS_47;
const __VLS_48 = {
    onOk: (__VLS_ctx.handleSave)
};
const __VLS_49 = {
    onCancel: (__VLS_ctx.cancelEdit)
};
__VLS_44.slots.default;
const __VLS_50 = {}.AForm;
/** @type {[typeof __VLS_components.AForm, typeof __VLS_components.aForm, typeof __VLS_components.AForm, typeof __VLS_components.aForm, ]} */ ;
// @ts-ignore
const __VLS_51 = __VLS_asFunctionalComponent(__VLS_50, new __VLS_50({
    model: (__VLS_ctx.editForm),
}));
const __VLS_52 = __VLS_51({
    model: (__VLS_ctx.editForm),
}, ...__VLS_functionalComponentArgsRest(__VLS_51));
__VLS_53.slots.default;
const __VLS_54 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_55 = __VLS_asFunctionalComponent(__VLS_54, new __VLS_54({
    label: "数源种类",
}));
const __VLS_56 = __VLS_55({
    label: "数源种类",
}, ...__VLS_functionalComponentArgsRest(__VLS_55));
__VLS_57.slots.default;
const __VLS_58 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
const __VLS_59 = __VLS_asFunctionalComponent(__VLS_58, new __VLS_58({
    modelValue: (__VLS_ctx.editForm.dataSourceType),
}));
const __VLS_60 = __VLS_59({
    modelValue: (__VLS_ctx.editForm.dataSourceType),
}, ...__VLS_functionalComponentArgsRest(__VLS_59));
var __VLS_57;
const __VLS_62 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_63 = __VLS_asFunctionalComponent(__VLS_62, new __VLS_62({
    label: "数源分类",
}));
const __VLS_64 = __VLS_63({
    label: "数源分类",
}, ...__VLS_functionalComponentArgsRest(__VLS_63));
__VLS_65.slots.default;
const __VLS_66 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
const __VLS_67 = __VLS_asFunctionalComponent(__VLS_66, new __VLS_66({
    modelValue: (__VLS_ctx.editForm.dataSourceCategory),
}));
const __VLS_68 = __VLS_67({
    modelValue: (__VLS_ctx.editForm.dataSourceCategory),
}, ...__VLS_functionalComponentArgsRest(__VLS_67));
var __VLS_65;
const __VLS_70 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_71 = __VLS_asFunctionalComponent(__VLS_70, new __VLS_70({
    label: "供应商",
}));
const __VLS_72 = __VLS_71({
    label: "供应商",
}, ...__VLS_functionalComponentArgsRest(__VLS_71));
__VLS_73.slots.default;
const __VLS_74 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
const __VLS_75 = __VLS_asFunctionalComponent(__VLS_74, new __VLS_74({
    modelValue: (__VLS_ctx.editForm.supplier),
}));
const __VLS_76 = __VLS_75({
    modelValue: (__VLS_ctx.editForm.supplier),
}, ...__VLS_functionalComponentArgsRest(__VLS_75));
var __VLS_73;
const __VLS_78 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_79 = __VLS_asFunctionalComponent(__VLS_78, new __VLS_78({
    label: "单价",
}));
const __VLS_80 = __VLS_79({
    label: "单价",
}, ...__VLS_functionalComponentArgsRest(__VLS_79));
__VLS_81.slots.default;
const __VLS_82 = {}.AInputNumber;
/** @type {[typeof __VLS_components.AInputNumber, typeof __VLS_components.aInputNumber, ]} */ ;
// @ts-ignore
const __VLS_83 = __VLS_asFunctionalComponent(__VLS_82, new __VLS_82({
    modelValue: (__VLS_ctx.editForm.price),
}));
const __VLS_84 = __VLS_83({
    modelValue: (__VLS_ctx.editForm.price),
}, ...__VLS_functionalComponentArgsRest(__VLS_83));
var __VLS_81;
const __VLS_86 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_87 = __VLS_asFunctionalComponent(__VLS_86, new __VLS_86({
    label: "产品描述",
}));
const __VLS_88 = __VLS_87({
    label: "产品描述",
}, ...__VLS_functionalComponentArgsRest(__VLS_87));
__VLS_89.slots.default;
const __VLS_90 = {}.ATextarea;
/** @type {[typeof __VLS_components.ATextarea, typeof __VLS_components.aTextarea, ]} */ ;
// @ts-ignore
const __VLS_91 = __VLS_asFunctionalComponent(__VLS_90, new __VLS_90({
    modelValue: (__VLS_ctx.editForm.description),
}));
const __VLS_92 = __VLS_91({
    modelValue: (__VLS_ctx.editForm.description),
}, ...__VLS_functionalComponentArgsRest(__VLS_91));
var __VLS_89;
const __VLS_94 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_95 = __VLS_asFunctionalComponent(__VLS_94, new __VLS_94({
    label: "落库表名",
}));
const __VLS_96 = __VLS_95({
    label: "落库表名",
}, ...__VLS_functionalComponentArgsRest(__VLS_95));
__VLS_97.slots.default;
const __VLS_98 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
const __VLS_99 = __VLS_asFunctionalComponent(__VLS_98, new __VLS_98({
    modelValue: (__VLS_ctx.editForm.tableName),
}));
const __VLS_100 = __VLS_99({
    modelValue: (__VLS_ctx.editForm.tableName),
}, ...__VLS_functionalComponentArgsRest(__VLS_99));
var __VLS_97;
var __VLS_53;
var __VLS_44;
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['product-modal']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-section']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-section']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-section']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-section']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-section']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-section']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-actions']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            isEditing: isEditing,
            editModalVisible: editModalVisible,
            editForm: editForm,
            priceChartRef: priceChartRef,
            costChartRef: costChartRef,
            valueChartRef: valueChartRef,
            ivChartRef: ivChartRef,
            ksChartRef: ksChartRef,
            psiChartRef: psiChartRef,
            handleCancel: handleCancel,
            exportChartData: exportChartData,
            toggleEditMode: toggleEditMode,
            handleSave: handleSave,
            cancelEdit: cancelEdit,
        };
    },
    emits: {},
    props: {
        visible: Boolean,
        productData: {
            type: Object,
            default: () => ({})
        },
        selectedProducts: {
            type: Array,
            default: () => []
        }
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    emits: {},
    props: {
        visible: Boolean,
        productData: {
            type: Object,
            default: () => ({})
        },
        selectedProducts: {
            type: Array,
            default: () => []
        }
    },
});
; /* PartiallyEnd: #4569/main.vue */
