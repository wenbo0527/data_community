/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Message, Modal } from '@arco-design/web-vue';
import { IconPlus } from '@arco-design/web-vue/es/icon';
const router = useRouter();
// 表格数据
const tableData = ref([]);
const loading = ref(false);
// 分页配置
const pagination = ref({
    total: 0,
    current: 1,
    pageSize: 10,
    showTotal: true,
    showJumper: true,
    showPageSize: true,
});
import { templateMockData } from '@/mock/coupon';
// 获取表格数据
const fetchData = async () => {
    loading.value = true;
    try {
        // 使用mock数据
        tableData.value = templateMockData;
        pagination.value.total = templateMockData.length;
    }
    catch (error) {
        Message.error('获取数据失败');
    }
    finally {
        loading.value = false;
    }
};
// 表格筛选变化
const handleFilterChange = (dataIndex, values) => {
    if (!values || values.length === 0)
        return;
    const filteredData = templateMockData.filter(item => {
        if (dataIndex === 'status') {
            return values.includes(item[dataIndex]);
        }
        else {
            return item[dataIndex].toLowerCase().includes(values[0].toLowerCase());
        }
    });
    tableData.value = filteredData;
    pagination.value.total = filteredData.length;
    pagination.value.current = 1;
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
// 新建券模版
const handleCreate = () => {
    router.push('/marketing/coupon/create');
};
// 处理上线/下线
const handleStatusChange = (record) => {
    if (record.status === '生效中') {
        Modal.warning({
            title: '确认下线',
            content: `确定要下线模版「${record.name}」吗？`,
            onOk: () => {
                // TODO: 调用下线接口
                record.status = '已失效';
                Message.success('下线成功');
                fetchData();
            }
        });
    }
    else {
        // TODO: 调用上线接口
        record.status = '生效中';
        Message.success('上线成功');
        fetchData();
    }
};
// 复制券模版
const handleCopy = (record) => {
    const newTemplate = { ...record };
    newTemplate.id = Date.now().toString(); // 临时ID，实际应由后端生成
    newTemplate.name = `${record.name}_副本`;
    newTemplate.status = '草稿';
    newTemplate.createTime = new Date().toLocaleString();
    tableData.value.unshift(newTemplate);
    Message.success('复制成功');
};
// 删除券模版
// 处理点击查看详情
const handleRowDblClick = (record) => {
    router.push({
        path: '/marketing/coupon/template/detail',
        query: {
            id: record.id,
            mode: 'view' // 添加mode参数标识为查看模式
        }
    });
};
const handleDelete = (record) => {
    Modal.warning({
        title: '确认删除',
        content: `确定要删除模版「${record.name}」吗？`,
        onOk: () => {
            // TODO: 调用删除接口
            Message.success('删除成功');
            fetchData();
        }
    });
};
onMounted(() => {
    fetchData();
});
const searchKeyword = ref('');
// 处理搜索
const handleSearch = (value) => {
    if (!value) {
        fetchData();
        return;
    }
    const filteredData = templateMockData.filter(item => item.type === value);
    tableData.value = filteredData;
    pagination.value.total = filteredData.length;
    pagination.value.current = 1;
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['time-row']} */ ;
/** @type {__VLS_StyleScopedClasses['time-label']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "coupon-template-container" },
});
const __VLS_0 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ class: "header-card" },
}));
const __VLS_2 = __VLS_1({
    ...{ class: "header-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "header-actions" },
});
const __VLS_4 = {}.ASpace;
/** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({}));
const __VLS_6 = __VLS_5({}, ...__VLS_functionalComponentArgsRest(__VLS_5));
__VLS_7.slots.default;
const __VLS_8 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.searchKeyword),
    placeholder: "选择模版类型",
    ...{ style: {} },
    allowClear: true,
}));
const __VLS_10 = __VLS_9({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.searchKeyword),
    placeholder: "选择模版类型",
    ...{ style: {} },
    allowClear: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
let __VLS_12;
let __VLS_13;
let __VLS_14;
const __VLS_15 = {
    onChange: (__VLS_ctx.handleSearch)
};
__VLS_11.slots.default;
const __VLS_16 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    value: "interest_free",
}));
const __VLS_18 = __VLS_17({
    value: "interest_free",
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_19.slots.default;
var __VLS_19;
const __VLS_20 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    value: "discount",
}));
const __VLS_22 = __VLS_21({
    value: "discount",
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
__VLS_23.slots.default;
var __VLS_23;
var __VLS_11;
const __VLS_24 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_26 = __VLS_25({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
let __VLS_28;
let __VLS_29;
let __VLS_30;
const __VLS_31 = {
    onClick: (__VLS_ctx.handleCreate)
};
__VLS_27.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_27.slots;
    const __VLS_32 = {}.IconPlus;
    /** @type {[typeof __VLS_components.IconPlus, typeof __VLS_components.iconPlus, ]} */ ;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({}));
    const __VLS_34 = __VLS_33({}, ...__VLS_functionalComponentArgsRest(__VLS_33));
}
var __VLS_27;
var __VLS_7;
var __VLS_3;
const __VLS_36 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
    ...{ class: "table-card" },
}));
const __VLS_38 = __VLS_37({
    ...{ class: "table-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
__VLS_39.slots.default;
const __VLS_40 = {}.ATable;
/** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    ...{ 'onPageChange': {} },
    ...{ 'onPageSizeChange': {} },
    ...{ 'onFilterChange': {} },
    data: (__VLS_ctx.tableData),
    loading: (__VLS_ctx.loading),
    pagination: (__VLS_ctx.pagination),
    bordered: (false),
    stripe: (true),
}));
const __VLS_42 = __VLS_41({
    ...{ 'onPageChange': {} },
    ...{ 'onPageSizeChange': {} },
    ...{ 'onFilterChange': {} },
    data: (__VLS_ctx.tableData),
    loading: (__VLS_ctx.loading),
    pagination: (__VLS_ctx.pagination),
    bordered: (false),
    stripe: (true),
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
let __VLS_44;
let __VLS_45;
let __VLS_46;
const __VLS_47 = {
    onPageChange: (__VLS_ctx.onPageChange)
};
const __VLS_48 = {
    onPageSizeChange: (__VLS_ctx.onPageSizeChange)
};
const __VLS_49 = {
    onFilterChange: (__VLS_ctx.handleFilterChange)
};
__VLS_43.slots.default;
{
    const { columns: __VLS_thisSlot } = __VLS_43.slots;
    const __VLS_50 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_51 = __VLS_asFunctionalComponent(__VLS_50, new __VLS_50({
        title: "模版名称",
        dataIndex: "name",
        width: (200),
        filterable: ({ filterSearch: true }),
    }));
    const __VLS_52 = __VLS_51({
        title: "模版名称",
        dataIndex: "name",
        width: (200),
        filterable: ({ filterSearch: true }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_51));
    __VLS_53.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_53.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_54 = {}.ASpace;
        /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
        // @ts-ignore
        const __VLS_55 = __VLS_asFunctionalComponent(__VLS_54, new __VLS_54({}));
        const __VLS_56 = __VLS_55({}, ...__VLS_functionalComponentArgsRest(__VLS_55));
        __VLS_57.slots.default;
        const __VLS_58 = {}.ATag;
        /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
        // @ts-ignore
        const __VLS_59 = __VLS_asFunctionalComponent(__VLS_58, new __VLS_58({
            color: (record.type === 'interest_free' ? 'arcoblue' : 'green'),
        }));
        const __VLS_60 = __VLS_59({
            color: (record.type === 'interest_free' ? 'arcoblue' : 'green'),
        }, ...__VLS_functionalComponentArgsRest(__VLS_59));
        __VLS_61.slots.default;
        (record.type === 'interest_free' ? '免息券' : '折扣券');
        var __VLS_61;
        const __VLS_62 = {}.ALink;
        /** @type {[typeof __VLS_components.ALink, typeof __VLS_components.aLink, typeof __VLS_components.ALink, typeof __VLS_components.aLink, ]} */ ;
        // @ts-ignore
        const __VLS_63 = __VLS_asFunctionalComponent(__VLS_62, new __VLS_62({
            ...{ 'onClick': {} },
        }));
        const __VLS_64 = __VLS_63({
            ...{ 'onClick': {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_63));
        let __VLS_66;
        let __VLS_67;
        let __VLS_68;
        const __VLS_69 = {
            onClick: (...[$event]) => {
                __VLS_ctx.handleRowDblClick(record);
            }
        };
        __VLS_65.slots.default;
        (record.name);
        var __VLS_65;
        var __VLS_57;
    }
    var __VLS_53;
    const __VLS_70 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_71 = __VLS_asFunctionalComponent(__VLS_70, new __VLS_70({
        title: "适用范围",
        dataIndex: "scope",
        width: (160),
    }));
    const __VLS_72 = __VLS_71({
        title: "适用范围",
        dataIndex: "scope",
        width: (160),
    }, ...__VLS_functionalComponentArgsRest(__VLS_71));
    __VLS_73.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_73.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "scope-row" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "scope-label" },
        });
        const __VLS_74 = {}.ASpace;
        /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
        // @ts-ignore
        const __VLS_75 = __VLS_asFunctionalComponent(__VLS_74, new __VLS_74({
            size: "mini",
        }));
        const __VLS_76 = __VLS_75({
            size: "mini",
        }, ...__VLS_functionalComponentArgsRest(__VLS_75));
        __VLS_77.slots.default;
        for (const [product] of __VLS_getVForSourceType((record.products))) {
            const __VLS_78 = {}.ATag;
            /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
            // @ts-ignore
            const __VLS_79 = __VLS_asFunctionalComponent(__VLS_78, new __VLS_78({
                key: (product),
                size: "small",
            }));
            const __VLS_80 = __VLS_79({
                key: (product),
                size: "small",
            }, ...__VLS_functionalComponentArgsRest(__VLS_79));
            __VLS_81.slots.default;
            (product === 'personal_loan' ? '个人贷款' : '企业贷款');
            var __VLS_81;
        }
        var __VLS_77;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "scope-row" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "scope-label" },
        });
        const __VLS_82 = {}.ASpace;
        /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
        // @ts-ignore
        const __VLS_83 = __VLS_asFunctionalComponent(__VLS_82, new __VLS_82({
            size: "mini",
        }));
        const __VLS_84 = __VLS_83({
            size: "mini",
        }, ...__VLS_functionalComponentArgsRest(__VLS_83));
        __VLS_85.slots.default;
        for (const [channel] of __VLS_getVForSourceType((record.useChannels))) {
            const __VLS_86 = {}.ATag;
            /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
            // @ts-ignore
            const __VLS_87 = __VLS_asFunctionalComponent(__VLS_86, new __VLS_86({
                key: (channel),
                size: "small",
            }));
            const __VLS_88 = __VLS_87({
                key: (channel),
                size: "small",
            }, ...__VLS_functionalComponentArgsRest(__VLS_87));
            __VLS_89.slots.default;
            (channel === 'app' ? 'APP' : channel === 'miniprogram' ? '小程序' : 'H5');
            var __VLS_89;
        }
        var __VLS_85;
    }
    var __VLS_73;
    const __VLS_90 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_91 = __VLS_asFunctionalComponent(__VLS_90, new __VLS_90({
        title: "有效期",
        dataIndex: "validityPeriod",
        width: (160),
    }));
    const __VLS_92 = __VLS_91({
        title: "有效期",
        dataIndex: "validityPeriod",
        width: (160),
    }, ...__VLS_functionalComponentArgsRest(__VLS_91));
    __VLS_93.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_93.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        (record.validityPeriodType === 'unlimited' ? '长期有效' : `${record.validityPeriod[0].split(' ')[0]} 至 ${record.validityPeriod[1].split(' ')[0]}`);
    }
    var __VLS_93;
    const __VLS_94 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_95 = __VLS_asFunctionalComponent(__VLS_94, new __VLS_94({
        title: "属主",
        dataIndex: "creator",
        width: (100),
        filterable: ({ filterSearch: true }),
    }));
    const __VLS_96 = __VLS_95({
        title: "属主",
        dataIndex: "creator",
        width: (100),
        filterable: ({ filterSearch: true }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_95));
    const __VLS_98 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_99 = __VLS_asFunctionalComponent(__VLS_98, new __VLS_98({
        title: "状态",
        dataIndex: "status",
        width: (80),
        align: "center",
        filterable: ({ filterMultiple: false }),
        filters: ([{ text: '生效中', value: '生效中' }, { text: '已失效', value: '已失效' }, { text: '草稿', value: '草稿' }]),
    }));
    const __VLS_100 = __VLS_99({
        title: "状态",
        dataIndex: "status",
        width: (80),
        align: "center",
        filterable: ({ filterMultiple: false }),
        filters: ([{ text: '生效中', value: '生效中' }, { text: '已失效', value: '已失效' }, { text: '草稿', value: '草稿' }]),
    }, ...__VLS_functionalComponentArgsRest(__VLS_99));
    __VLS_101.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_101.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_102 = {}.ATag;
        /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
        // @ts-ignore
        const __VLS_103 = __VLS_asFunctionalComponent(__VLS_102, new __VLS_102({
            color: (record.status === '生效中' ? 'green' : 'gray'),
        }));
        const __VLS_104 = __VLS_103({
            color: (record.status === '生效中' ? 'green' : 'gray'),
        }, ...__VLS_functionalComponentArgsRest(__VLS_103));
        __VLS_105.slots.default;
        (record.status);
        var __VLS_105;
    }
    var __VLS_101;
    const __VLS_106 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_107 = __VLS_asFunctionalComponent(__VLS_106, new __VLS_106({
        title: "操作",
        width: (100),
        align: "center",
    }));
    const __VLS_108 = __VLS_107({
        title: "操作",
        width: (100),
        align: "center",
    }, ...__VLS_functionalComponentArgsRest(__VLS_107));
    __VLS_109.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_109.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_110 = {}.ASpace;
        /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
        // @ts-ignore
        const __VLS_111 = __VLS_asFunctionalComponent(__VLS_110, new __VLS_110({
            size: "mini",
        }));
        const __VLS_112 = __VLS_111({
            size: "mini",
        }, ...__VLS_functionalComponentArgsRest(__VLS_111));
        __VLS_113.slots.default;
        const __VLS_114 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
        // @ts-ignore
        const __VLS_115 = __VLS_asFunctionalComponent(__VLS_114, new __VLS_114({
            ...{ 'onClick': {} },
            type: "text",
            size: "small",
            status: (record.status === '生效中' ? 'danger' : 'success'),
        }));
        const __VLS_116 = __VLS_115({
            ...{ 'onClick': {} },
            type: "text",
            size: "small",
            status: (record.status === '生效中' ? 'danger' : 'success'),
        }, ...__VLS_functionalComponentArgsRest(__VLS_115));
        let __VLS_118;
        let __VLS_119;
        let __VLS_120;
        const __VLS_121 = {
            onClick: (...[$event]) => {
                __VLS_ctx.handleStatusChange(record);
            }
        };
        __VLS_117.slots.default;
        (record.status === '生效中' ? '下线' : '上线');
        var __VLS_117;
        const __VLS_122 = {}.ADivider;
        /** @type {[typeof __VLS_components.ADivider, typeof __VLS_components.aDivider, ]} */ ;
        // @ts-ignore
        const __VLS_123 = __VLS_asFunctionalComponent(__VLS_122, new __VLS_122({
            direction: "vertical",
        }));
        const __VLS_124 = __VLS_123({
            direction: "vertical",
        }, ...__VLS_functionalComponentArgsRest(__VLS_123));
        if (record.status === '草稿') {
            const __VLS_126 = {}.AButton;
            /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
            // @ts-ignore
            const __VLS_127 = __VLS_asFunctionalComponent(__VLS_126, new __VLS_126({
                ...{ 'onClick': {} },
                type: "text",
                size: "small",
                status: "danger",
            }));
            const __VLS_128 = __VLS_127({
                ...{ 'onClick': {} },
                type: "text",
                size: "small",
                status: "danger",
            }, ...__VLS_functionalComponentArgsRest(__VLS_127));
            let __VLS_130;
            let __VLS_131;
            let __VLS_132;
            const __VLS_133 = {
                onClick: (...[$event]) => {
                    if (!(record.status === '草稿'))
                        return;
                    __VLS_ctx.handleDelete(record);
                }
            };
            __VLS_129.slots.default;
            var __VLS_129;
        }
        const __VLS_134 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
        // @ts-ignore
        const __VLS_135 = __VLS_asFunctionalComponent(__VLS_134, new __VLS_134({
            ...{ 'onClick': {} },
            type: "text",
            size: "small",
        }));
        const __VLS_136 = __VLS_135({
            ...{ 'onClick': {} },
            type: "text",
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_135));
        let __VLS_138;
        let __VLS_139;
        let __VLS_140;
        const __VLS_141 = {
            onClick: (...[$event]) => {
                __VLS_ctx.handleCopy(record);
            }
        };
        __VLS_137.slots.default;
        var __VLS_137;
        var __VLS_113;
    }
    var __VLS_109;
}
var __VLS_43;
var __VLS_39;
/** @type {__VLS_StyleScopedClasses['coupon-template-container']} */ ;
/** @type {__VLS_StyleScopedClasses['header-card']} */ ;
/** @type {__VLS_StyleScopedClasses['header-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['table-card']} */ ;
/** @type {__VLS_StyleScopedClasses['scope-row']} */ ;
/** @type {__VLS_StyleScopedClasses['scope-label']} */ ;
/** @type {__VLS_StyleScopedClasses['scope-row']} */ ;
/** @type {__VLS_StyleScopedClasses['scope-label']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            IconPlus: IconPlus,
            tableData: tableData,
            loading: loading,
            pagination: pagination,
            handleFilterChange: handleFilterChange,
            onPageChange: onPageChange,
            onPageSizeChange: onPageSizeChange,
            handleCreate: handleCreate,
            handleStatusChange: handleStatusChange,
            handleCopy: handleCopy,
            handleRowDblClick: handleRowDblClick,
            handleDelete: handleDelete,
            searchKeyword: searchKeyword,
            handleSearch: handleSearch,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
