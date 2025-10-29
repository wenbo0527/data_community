/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { IconSearch, IconPlus, IconDown, IconSettings, IconImport } from '@arco-design/web-vue/es/icon';
const router = useRouter();
// 搜索表单
const searchForm = reactive({
    audienceName: ''
});
// 表格数据
const tableData = ref([]);
const loading = ref(false);
// 分页配置
const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
    showTotal: true,
    showPageSize: true
});
// 人群类型颜色映射
const getAudienceTypeColor = (type) => {
    const colorMap = {
        'static': 'blue',
        'dynamic': 'green',
        'computed': 'orange',
        'rule': 'purple'
    };
    return colorMap[type] || 'gray';
};
// 人群类型文本映射
const getAudienceTypeText = (type) => {
    const textMap = {
        'static': '静态人群',
        'dynamic': '动态人群',
        'computed': '计算人群',
        'rule': '规则人群'
    };
    return textMap[type] || '未知类型';
};
// 创建方式颜色映射
const getCreateMethodColor = (method) => {
    const colorMap = {
        'rule': 'blue',
        'import': 'green',
        'manual': 'orange'
    };
    return colorMap[method] || 'gray';
};
// 创建方式文本映射
const getCreateMethodText = (method) => {
    const textMap = {
        'rule': '规则创建',
        'import': '数据导入',
        'manual': '手动创建'
    };
    return textMap[method] || '未知方式';
};
// 状态颜色映射
const getStatusColor = (status) => {
    const colorMap = {
        'active': 'green',
        'inactive': 'gray',
        'computing': 'blue',
        'error': 'red'
    };
    return colorMap[status] || 'gray';
};
// 状态文本映射
const getStatusText = (status) => {
    const textMap = {
        'active': '活跃',
        'inactive': '非活跃',
        'computing': '计算中',
        'error': '错误'
    };
    return textMap[status] || '未知状态';
};
// 共享级别颜色映射
const getShareLevelColor = (level) => {
    const colorMap = {
        'public': 'green',
        'private': 'orange',
        'team': 'blue'
    };
    return colorMap[level] || 'gray';
};
// 共享级别文本映射
const getShareLevelText = (level) => {
    const textMap = {
        'public': '公开',
        'private': '私有',
        'team': '团队'
    };
    return textMap[level] || '未知级别';
};
// 格式化数字
const formatNumber = (num) => {
    if (num >= 10000) {
        return (num / 10000).toFixed(1) + '万';
    }
    return num.toString();
};
// 搜索处理
const handleSearch = () => {
    loadAudienceData();
};
// 分页处理
const handlePageChange = (page) => {
    pagination.current = page;
    loadAudienceData();
};
const handlePageSizeChange = (pageSize) => {
    pagination.pageSize = pageSize;
    pagination.current = 1;
    loadAudienceData();
};
// 跳转到人群详情页
const goToAudienceDetail = (record) => {
    router.push({
        path: '/exploration/customer-center/audience-system/audience-detail',
        query: { id: record.id }
    });
};
// 编辑人群
const editAudience = (record) => {
    router.push({
        path: '/exploration/customer-center/audience-system/audience-create',
        query: { id: record.id, mode: 'edit' }
    });
};
// 更新人群
const updateAudience = (record) => {
    console.log('更新人群:', record);
    // TODO: 实现更新逻辑
};
// 删除人群
const removeAudience = (index) => {
    console.log('删除人群:', index);
    // TODO: 实现删除逻辑
};
// 自定义规则创建人群
const addAudienceByRule = () => {
    router.push({
        path: '/exploration/customer-center/audience-system/audience-create',
        query: { mode: 'rule' }
    });
};
// 数据导入创建人群
const addAudienceByImport = () => {
    router.push({
        path: '/exploration/customer-center/audience-system/audience-create',
        query: { mode: 'import' }
    });
};
// 加载人群数据
const loadAudienceData = async () => {
    loading.value = true;
    try {
        // 模拟数据
        const mockData = [
            {
                id: 'AUD_001',
                name: '高价值客户群',
                audienceType: 'rule',
                size: 125000,
                createMethod: 'rule',
                status: 'active',
                shareLevel: 'public',
                createUser: '张三',
                createTime: '2023-10-15 10:30:00'
            },
            {
                id: 'AUD_002',
                name: '新用户群体',
                audienceType: 'dynamic',
                size: 89000,
                createMethod: 'rule',
                status: 'active',
                shareLevel: 'team',
                createUser: '李四',
                createTime: '2023-10-14 14:20:00'
            },
            {
                id: 'AUD_003',
                name: '流失风险客户',
                audienceType: 'computed',
                size: 45000,
                createMethod: 'rule',
                status: 'computing',
                shareLevel: 'private',
                createUser: '王五',
                createTime: '2023-10-13 09:15:00'
            }
        ];
        tableData.value = mockData;
        pagination.total = mockData.length;
    }
    catch (error) {
        console.error('加载人群数据失败:', error);
    }
    finally {
        loading.value = false;
    }
};
// 组件挂载时加载数据
onMounted(() => {
    loadAudienceData();
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['audience-table']} */ ;
/** @type {__VLS_StyleScopedClasses['audience-table']} */ ;
/** @type {__VLS_StyleScopedClasses['audience-table']} */ ;
/** @type {__VLS_StyleScopedClasses['arco-table-td']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "audience-management" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "header-content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
    ...{ class: "page-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "page-description" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "header-actions" },
});
const __VLS_0 = {}.ASpace;
/** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({}));
const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
const __VLS_4 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    ...{ 'onInput': {} },
    modelValue: (__VLS_ctx.searchForm.audienceName),
    placeholder: "请输入人群名称搜索",
    allowClear: true,
    ...{ style: {} },
}));
const __VLS_6 = __VLS_5({
    ...{ 'onInput': {} },
    modelValue: (__VLS_ctx.searchForm.audienceName),
    placeholder: "请输入人群名称搜索",
    allowClear: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
let __VLS_8;
let __VLS_9;
let __VLS_10;
const __VLS_11 = {
    onInput: (__VLS_ctx.handleSearch)
};
__VLS_7.slots.default;
{
    const { prefix: __VLS_thisSlot } = __VLS_7.slots;
    const __VLS_12 = {}.IconSearch;
    /** @type {[typeof __VLS_components.IconSearch, typeof __VLS_components.iconSearch, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({}));
    const __VLS_14 = __VLS_13({}, ...__VLS_functionalComponentArgsRest(__VLS_13));
}
var __VLS_7;
const __VLS_16 = {}.ADropdown;
/** @type {[typeof __VLS_components.ADropdown, typeof __VLS_components.aDropdown, typeof __VLS_components.ADropdown, typeof __VLS_components.aDropdown, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({}));
const __VLS_18 = __VLS_17({}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_19.slots.default;
const __VLS_20 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    type: "primary",
}));
const __VLS_22 = __VLS_21({
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
__VLS_23.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_23.slots;
    const __VLS_24 = {}.IconPlus;
    /** @type {[typeof __VLS_components.IconPlus, typeof __VLS_components.iconPlus, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({}));
    const __VLS_26 = __VLS_25({}, ...__VLS_functionalComponentArgsRest(__VLS_25));
}
{
    const { suffix: __VLS_thisSlot } = __VLS_23.slots;
    const __VLS_28 = {}.IconDown;
    /** @type {[typeof __VLS_components.IconDown, typeof __VLS_components.iconDown, ]} */ ;
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({}));
    const __VLS_30 = __VLS_29({}, ...__VLS_functionalComponentArgsRest(__VLS_29));
}
var __VLS_23;
{
    const { content: __VLS_thisSlot } = __VLS_19.slots;
    const __VLS_32 = {}.ADoption;
    /** @type {[typeof __VLS_components.ADoption, typeof __VLS_components.aDoption, typeof __VLS_components.ADoption, typeof __VLS_components.aDoption, ]} */ ;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
        ...{ 'onClick': {} },
    }));
    const __VLS_34 = __VLS_33({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    let __VLS_36;
    let __VLS_37;
    let __VLS_38;
    const __VLS_39 = {
        onClick: (__VLS_ctx.addAudienceByRule)
    };
    __VLS_35.slots.default;
    {
        const { icon: __VLS_thisSlot } = __VLS_35.slots;
        const __VLS_40 = {}.IconSettings;
        /** @type {[typeof __VLS_components.IconSettings, typeof __VLS_components.iconSettings, ]} */ ;
        // @ts-ignore
        const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({}));
        const __VLS_42 = __VLS_41({}, ...__VLS_functionalComponentArgsRest(__VLS_41));
    }
    var __VLS_35;
    const __VLS_44 = {}.ADoption;
    /** @type {[typeof __VLS_components.ADoption, typeof __VLS_components.aDoption, typeof __VLS_components.ADoption, typeof __VLS_components.aDoption, ]} */ ;
    // @ts-ignore
    const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
        ...{ 'onClick': {} },
    }));
    const __VLS_46 = __VLS_45({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_45));
    let __VLS_48;
    let __VLS_49;
    let __VLS_50;
    const __VLS_51 = {
        onClick: (__VLS_ctx.addAudienceByImport)
    };
    __VLS_47.slots.default;
    {
        const { icon: __VLS_thisSlot } = __VLS_47.slots;
        const __VLS_52 = {}.IconImport;
        /** @type {[typeof __VLS_components.IconImport, typeof __VLS_components.iconImport, ]} */ ;
        // @ts-ignore
        const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({}));
        const __VLS_54 = __VLS_53({}, ...__VLS_functionalComponentArgsRest(__VLS_53));
    }
    var __VLS_47;
}
var __VLS_19;
var __VLS_3;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "content-section" },
});
const __VLS_56 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
    ...{ class: "table-card" },
}));
const __VLS_58 = __VLS_57({
    ...{ class: "table-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
__VLS_59.slots.default;
{
    const { title: __VLS_thisSlot } = __VLS_59.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "table-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "table-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "table-count" },
    });
    (__VLS_ctx.pagination.total);
}
const __VLS_60 = {}.ATable;
/** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ ;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
    ...{ 'onPageChange': {} },
    ...{ 'onPageSizeChange': {} },
    data: (__VLS_ctx.tableData),
    loading: (__VLS_ctx.loading),
    pagination: (__VLS_ctx.pagination),
    ...{ class: "audience-table" },
    size: "small",
    scroll: ({ x: 1600 }),
}));
const __VLS_62 = __VLS_61({
    ...{ 'onPageChange': {} },
    ...{ 'onPageSizeChange': {} },
    data: (__VLS_ctx.tableData),
    loading: (__VLS_ctx.loading),
    pagination: (__VLS_ctx.pagination),
    ...{ class: "audience-table" },
    size: "small",
    scroll: ({ x: 1600 }),
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
let __VLS_64;
let __VLS_65;
let __VLS_66;
const __VLS_67 = {
    onPageChange: (__VLS_ctx.handlePageChange)
};
const __VLS_68 = {
    onPageSizeChange: (__VLS_ctx.handlePageSizeChange)
};
__VLS_63.slots.default;
{
    const { columns: __VLS_thisSlot } = __VLS_63.slots;
    const __VLS_69 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_70 = __VLS_asFunctionalComponent(__VLS_69, new __VLS_69({
        title: "人群名称",
        dataIndex: "name",
        width: (150),
        fixed: "left",
    }));
    const __VLS_71 = __VLS_70({
        title: "人群名称",
        dataIndex: "name",
        width: (150),
        fixed: "left",
    }, ...__VLS_functionalComponentArgsRest(__VLS_70));
    __VLS_72.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_72.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_73 = {}.ALink;
        /** @type {[typeof __VLS_components.ALink, typeof __VLS_components.aLink, typeof __VLS_components.ALink, typeof __VLS_components.aLink, ]} */ ;
        // @ts-ignore
        const __VLS_74 = __VLS_asFunctionalComponent(__VLS_73, new __VLS_73({
            ...{ 'onClick': {} },
        }));
        const __VLS_75 = __VLS_74({
            ...{ 'onClick': {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_74));
        let __VLS_77;
        let __VLS_78;
        let __VLS_79;
        const __VLS_80 = {
            onClick: (...[$event]) => {
                __VLS_ctx.goToAudienceDetail(record);
            }
        };
        __VLS_76.slots.default;
        (record.name);
        var __VLS_76;
    }
    var __VLS_72;
    const __VLS_81 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_82 = __VLS_asFunctionalComponent(__VLS_81, new __VLS_81({
        title: "人群ID",
        dataIndex: "id",
        width: (120),
    }));
    const __VLS_83 = __VLS_82({
        title: "人群ID",
        dataIndex: "id",
        width: (120),
    }, ...__VLS_functionalComponentArgsRest(__VLS_82));
    __VLS_84.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_84.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (record.id);
    }
    var __VLS_84;
    const __VLS_85 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_86 = __VLS_asFunctionalComponent(__VLS_85, new __VLS_85({
        title: "人群类型",
        dataIndex: "audienceType",
        width: (120),
    }));
    const __VLS_87 = __VLS_86({
        title: "人群类型",
        dataIndex: "audienceType",
        width: (120),
    }, ...__VLS_functionalComponentArgsRest(__VLS_86));
    __VLS_88.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_88.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_89 = {}.ATag;
        /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
        // @ts-ignore
        const __VLS_90 = __VLS_asFunctionalComponent(__VLS_89, new __VLS_89({
            color: (__VLS_ctx.getAudienceTypeColor(record.audienceType)),
        }));
        const __VLS_91 = __VLS_90({
            color: (__VLS_ctx.getAudienceTypeColor(record.audienceType)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_90));
        __VLS_92.slots.default;
        (__VLS_ctx.getAudienceTypeText(record.audienceType));
        var __VLS_92;
    }
    var __VLS_88;
    const __VLS_93 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_94 = __VLS_asFunctionalComponent(__VLS_93, new __VLS_93({
        title: "人群规模",
        dataIndex: "size",
        width: (120),
    }));
    const __VLS_95 = __VLS_94({
        title: "人群规模",
        dataIndex: "size",
        width: (120),
    }, ...__VLS_functionalComponentArgsRest(__VLS_94));
    __VLS_96.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_96.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (__VLS_ctx.formatNumber(record.size));
    }
    var __VLS_96;
    const __VLS_97 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_98 = __VLS_asFunctionalComponent(__VLS_97, new __VLS_97({
        title: "创建方式",
        dataIndex: "createMethod",
        width: (120),
    }));
    const __VLS_99 = __VLS_98({
        title: "创建方式",
        dataIndex: "createMethod",
        width: (120),
    }, ...__VLS_functionalComponentArgsRest(__VLS_98));
    __VLS_100.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_100.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_101 = {}.ATag;
        /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
        // @ts-ignore
        const __VLS_102 = __VLS_asFunctionalComponent(__VLS_101, new __VLS_101({
            color: (__VLS_ctx.getCreateMethodColor(record.createMethod)),
        }));
        const __VLS_103 = __VLS_102({
            color: (__VLS_ctx.getCreateMethodColor(record.createMethod)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_102));
        __VLS_104.slots.default;
        (__VLS_ctx.getCreateMethodText(record.createMethod));
        var __VLS_104;
    }
    var __VLS_100;
    const __VLS_105 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_106 = __VLS_asFunctionalComponent(__VLS_105, new __VLS_105({
        title: "状态",
        dataIndex: "status",
        width: (100),
    }));
    const __VLS_107 = __VLS_106({
        title: "状态",
        dataIndex: "status",
        width: (100),
    }, ...__VLS_functionalComponentArgsRest(__VLS_106));
    __VLS_108.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_108.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_109 = {}.ATag;
        /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
        // @ts-ignore
        const __VLS_110 = __VLS_asFunctionalComponent(__VLS_109, new __VLS_109({
            color: (__VLS_ctx.getStatusColor(record.status)),
        }));
        const __VLS_111 = __VLS_110({
            color: (__VLS_ctx.getStatusColor(record.status)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_110));
        __VLS_112.slots.default;
        (__VLS_ctx.getStatusText(record.status));
        var __VLS_112;
    }
    var __VLS_108;
    const __VLS_113 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_114 = __VLS_asFunctionalComponent(__VLS_113, new __VLS_113({
        title: "共享级别",
        dataIndex: "shareLevel",
        width: (120),
    }));
    const __VLS_115 = __VLS_114({
        title: "共享级别",
        dataIndex: "shareLevel",
        width: (120),
    }, ...__VLS_functionalComponentArgsRest(__VLS_114));
    __VLS_116.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_116.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_117 = {}.ATag;
        /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
        // @ts-ignore
        const __VLS_118 = __VLS_asFunctionalComponent(__VLS_117, new __VLS_117({
            color: (__VLS_ctx.getShareLevelColor(record.shareLevel)),
        }));
        const __VLS_119 = __VLS_118({
            color: (__VLS_ctx.getShareLevelColor(record.shareLevel)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_118));
        __VLS_120.slots.default;
        (__VLS_ctx.getShareLevelText(record.shareLevel));
        var __VLS_120;
    }
    var __VLS_116;
    const __VLS_121 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_122 = __VLS_asFunctionalComponent(__VLS_121, new __VLS_121({
        title: "创建人",
        dataIndex: "createUser",
        width: (120),
    }));
    const __VLS_123 = __VLS_122({
        title: "创建人",
        dataIndex: "createUser",
        width: (120),
    }, ...__VLS_functionalComponentArgsRest(__VLS_122));
    __VLS_124.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_124.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (record.createUser);
    }
    var __VLS_124;
    const __VLS_125 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_126 = __VLS_asFunctionalComponent(__VLS_125, new __VLS_125({
        title: "创建时间",
        dataIndex: "createTime",
        width: (150),
    }));
    const __VLS_127 = __VLS_126({
        title: "创建时间",
        dataIndex: "createTime",
        width: (150),
    }, ...__VLS_functionalComponentArgsRest(__VLS_126));
    __VLS_128.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_128.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (record.createTime);
    }
    var __VLS_128;
    const __VLS_129 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_130 = __VLS_asFunctionalComponent(__VLS_129, new __VLS_129({
        title: "操作",
        width: (200),
        fixed: "right",
    }));
    const __VLS_131 = __VLS_130({
        title: "操作",
        width: (200),
        fixed: "right",
    }, ...__VLS_functionalComponentArgsRest(__VLS_130));
    __VLS_132.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_132.slots;
        const [{ record, rowIndex }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_133 = {}.ASpace;
        /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
        // @ts-ignore
        const __VLS_134 = __VLS_asFunctionalComponent(__VLS_133, new __VLS_133({}));
        const __VLS_135 = __VLS_134({}, ...__VLS_functionalComponentArgsRest(__VLS_134));
        __VLS_136.slots.default;
        const __VLS_137 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
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
                __VLS_ctx.goToAudienceDetail(record);
            }
        };
        __VLS_140.slots.default;
        var __VLS_140;
        const __VLS_145 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
        // @ts-ignore
        const __VLS_146 = __VLS_asFunctionalComponent(__VLS_145, new __VLS_145({
            ...{ 'onClick': {} },
            type: "text",
            size: "small",
        }));
        const __VLS_147 = __VLS_146({
            ...{ 'onClick': {} },
            type: "text",
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_146));
        let __VLS_149;
        let __VLS_150;
        let __VLS_151;
        const __VLS_152 = {
            onClick: (...[$event]) => {
                __VLS_ctx.editAudience(record);
            }
        };
        __VLS_148.slots.default;
        var __VLS_148;
        const __VLS_153 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
        // @ts-ignore
        const __VLS_154 = __VLS_asFunctionalComponent(__VLS_153, new __VLS_153({
            ...{ 'onClick': {} },
            type: "text",
            size: "small",
        }));
        const __VLS_155 = __VLS_154({
            ...{ 'onClick': {} },
            type: "text",
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_154));
        let __VLS_157;
        let __VLS_158;
        let __VLS_159;
        const __VLS_160 = {
            onClick: (...[$event]) => {
                __VLS_ctx.updateAudience(record);
            }
        };
        __VLS_156.slots.default;
        var __VLS_156;
        const __VLS_161 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
        // @ts-ignore
        const __VLS_162 = __VLS_asFunctionalComponent(__VLS_161, new __VLS_161({
            ...{ 'onClick': {} },
            type: "text",
            size: "small",
            status: "danger",
        }));
        const __VLS_163 = __VLS_162({
            ...{ 'onClick': {} },
            type: "text",
            size: "small",
            status: "danger",
        }, ...__VLS_functionalComponentArgsRest(__VLS_162));
        let __VLS_165;
        let __VLS_166;
        let __VLS_167;
        const __VLS_168 = {
            onClick: (...[$event]) => {
                __VLS_ctx.removeAudience(rowIndex);
            }
        };
        __VLS_164.slots.default;
        var __VLS_164;
        var __VLS_136;
    }
    var __VLS_132;
}
var __VLS_63;
var __VLS_59;
/** @type {__VLS_StyleScopedClasses['audience-management']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['header-content']} */ ;
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
/** @type {__VLS_StyleScopedClasses['page-description']} */ ;
/** @type {__VLS_StyleScopedClasses['header-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['content-section']} */ ;
/** @type {__VLS_StyleScopedClasses['table-card']} */ ;
/** @type {__VLS_StyleScopedClasses['table-header']} */ ;
/** @type {__VLS_StyleScopedClasses['table-title']} */ ;
/** @type {__VLS_StyleScopedClasses['table-count']} */ ;
/** @type {__VLS_StyleScopedClasses['audience-table']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            IconSearch: IconSearch,
            IconPlus: IconPlus,
            IconDown: IconDown,
            IconSettings: IconSettings,
            IconImport: IconImport,
            searchForm: searchForm,
            tableData: tableData,
            loading: loading,
            pagination: pagination,
            getAudienceTypeColor: getAudienceTypeColor,
            getAudienceTypeText: getAudienceTypeText,
            getCreateMethodColor: getCreateMethodColor,
            getCreateMethodText: getCreateMethodText,
            getStatusColor: getStatusColor,
            getStatusText: getStatusText,
            getShareLevelColor: getShareLevelColor,
            getShareLevelText: getShareLevelText,
            formatNumber: formatNumber,
            handleSearch: handleSearch,
            handlePageChange: handlePageChange,
            handlePageSizeChange: handlePageSizeChange,
            goToAudienceDetail: goToAudienceDetail,
            editAudience: editAudience,
            updateAudience: updateAudience,
            removeAudience: removeAudience,
            addAudienceByRule: addAudienceByRule,
            addAudienceByImport: addAudienceByImport,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
