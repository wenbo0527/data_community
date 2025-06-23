/// <reference types="../../../../node_modules/.vue-global-types/vue_3.3_0_0_0.d.ts" />
import { IconUndo, IconPlus, IconUpload } from '@arco-design/web-vue/es/icon';
import mockData from '@/mock/touch';
export default (await import('vue')).defineComponent({
    name: 'BlacklistManagement',
    components: {
        IconUndo,
        IconPlus,
        IconUpload
    },
    data() {
        const blacklistData = mockData.blacklist;
        const unbannedData = mockData.unbanned;
        const blacklistColumns = [
            { title: '用户名', dataIndex: 'username', width: 150, ellipsis: true, tooltip: true },
            { title: '手机号', dataIndex: 'phone', width: 160, ellipsis: true, tooltip: true, render: ({ record }) => this.maskPhone(record.phone) },
            { title: '身份证', dataIndex: 'idCard', width: 200, ellipsis: true, tooltip: true, render: ({ record }) => this.maskIdCard(record.idCard) },
            { title: '添加时间', dataIndex: 'addTime', width: 180, ellipsis: true, tooltip: true },
            { title: '禁用时间', dataIndex: 'banTime', width: 180, ellipsis: true, tooltip: true, render: ({ record }) => record.banTime || '永久禁用' },
            { title: '禁用策略', dataIndex: 'policy', width: 150, ellipsis: true, tooltip: true },
            { title: '来源', dataIndex: 'source', width: 150, ellipsis: true, tooltip: true },
            { title: '操作', dataIndex: 'operations', width: 120, fixed: 'right', slotName: 'operations' }
        ];
        const unbannedColumns = [
            { title: '用户名', dataIndex: 'username', width: 150, ellipsis: true, tooltip: true },
            { title: '手机号', dataIndex: 'phone', width: 160, ellipsis: true, tooltip: true, render: ({ record }) => this.maskPhone(record.phone) },
            { title: '身份证', dataIndex: 'idCard', width: 200, ellipsis: true, tooltip: true, render: ({ record }) => this.maskIdCard(record.idCard) },
            { title: '添加时间', dataIndex: 'addTime', width: 180, ellipsis: true, tooltip: true },
            { title: '禁用时间', dataIndex: 'banTime', width: 180, ellipsis: true, tooltip: true },
            { title: '解禁时间', dataIndex: 'unbanTime', width: 180, ellipsis: true, tooltip: true },
            { title: '禁用策略', dataIndex: 'policy', width: 150, ellipsis: true, tooltip: true },
            { title: '来源', dataIndex: 'source', width: 150, ellipsis: true, tooltip: true }
        ];
        console.log('初始化数据状态:', { blacklistData, unbannedData });
        return {
            formState: {
                username: '',
                phone: '',
                idCard: '',
                addTimeRange: [],
                banTimeRange: []
            },
            activeTab: 'blacklist',
            blacklistData,
            unbannedData,
            blacklistColumns,
            unbannedColumns
        };
    },
    mounted() {
        console.log('mounted时blacklistData:', this.blacklistData);
        console.log('mounted时unbannedData:', this.unbannedData);
    },
    watch: {
        blacklistData: {
            handler(val) {
                console.log('blacklistData变更:', val);
            },
            deep: true
        },
        unbannedData: {
            handler(val) {
                console.log('unbannedData变更:', val);
            },
            deep: true
        }
    },
    methods: {
        maskPhone(phone) {
            if (!phone)
                return '';
            return phone.slice(0, 3) + '****' + phone.slice(-4);
        },
        maskIdCard(idCard) {
            if (!idCard)
                return '';
            return idCard.slice(0, 6) + '********' + idCard.slice(-4);
        },
        handleTableScroll() {
            console.log('表格滚动事件触发');
        },
        handleSearch() {
            console.log('搜索条件:', this.formState);
            console.log('原始黑名单数据:', mockData.blacklist);
            this.blacklistData = mockData.blacklist.filter(item => {
                const matchesUsername = !this.formState.username || item.username.includes(this.formState.username);
                const matchesPhone = !this.formState.phone || item.phone.includes(this.formState.phone);
                const matchesIdCard = !this.formState.idCard || item.idCard.includes(this.formState.idCard);
                const matchesAddTime = !this.formState.addTimeRange.length ||
                    (new Date(item.addTime) >= new Date(this.formState.addTimeRange[0]) &&
                        new Date(item.addTime) <= new Date(this.formState.addTimeRange[1]));
                const matchesBanTime = !this.formState.banTimeRange.length ||
                    (new Date(item.banTime) >= new Date(this.formState.banTimeRange[0]) &&
                        new Date(item.banTime) <= new Date(this.formState.banTimeRange[1]));
                const result = matchesUsername && matchesPhone && matchesIdCard && matchesAddTime && matchesBanTime;
                console.log('筛选结果:', { item, result });
                return result;
            });
            console.log('筛选后的黑名单数据:', this.blacklistData);
        },
        handleReset() {
            console.log('重置表单');
            this.formState = {
                username: '',
                phone: '',
                idCard: '',
                addTimeRange: [],
                banTimeRange: []
            };
            this.handleSearch();
        },
        handleCreate() {
            // 实现新建逻辑
        },
        handleImport() {
            // 实现批量导入逻辑
        },
        handleUnban(row) {
            console.log('解禁用户:', row);
            this.unbannedData.push({
                ...row,
                unbanTime: new Date().toLocaleString()
            });
            this.blacklistData = this.blacklistData.filter(item => item !== row);
        }
    }
});
const __VLS_ctx = {};
const __VLS_componentsOption = {
    IconUndo,
    IconPlus,
    IconUpload
};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
const __VLS_0 = {}.ALayout;
/** @type {[typeof __VLS_components.ALayout, typeof __VLS_components.aLayout, typeof __VLS_components.ALayout, typeof __VLS_components.aLayout, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({}));
const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_4 = {};
__VLS_3.slots.default;
const __VLS_5 = {}.ALayoutContent;
/** @type {[typeof __VLS_components.ALayoutContent, typeof __VLS_components.aLayoutContent, typeof __VLS_components.ALayoutContent, typeof __VLS_components.aLayoutContent, ]} */ ;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent(__VLS_5, new __VLS_5({
    ...{ class: "content" },
}));
const __VLS_7 = __VLS_6({
    ...{ class: "content" },
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
__VLS_8.slots.default;
const __VLS_9 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({
    bordered: (false),
}));
const __VLS_11 = __VLS_10({
    bordered: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_10));
__VLS_12.slots.default;
const __VLS_13 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_14 = __VLS_asFunctionalComponent(__VLS_13, new __VLS_13({
    gutter: (16),
    align: "middle",
    ...{ style: {} },
}));
const __VLS_15 = __VLS_14({
    gutter: (16),
    align: "middle",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_14));
__VLS_16.slots.default;
const __VLS_17 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_18 = __VLS_asFunctionalComponent(__VLS_17, new __VLS_17({
    flex: "auto",
}));
const __VLS_19 = __VLS_18({
    flex: "auto",
}, ...__VLS_functionalComponentArgsRest(__VLS_18));
__VLS_20.slots.default;
const __VLS_21 = {}.AForm;
/** @type {[typeof __VLS_components.AForm, typeof __VLS_components.aForm, typeof __VLS_components.AForm, typeof __VLS_components.aForm, ]} */ ;
// @ts-ignore
const __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({
    model: (__VLS_ctx.formState),
    layout: "inline",
    ...{ class: "search-form" },
}));
const __VLS_23 = __VLS_22({
    model: (__VLS_ctx.formState),
    layout: "inline",
    ...{ class: "search-form" },
}, ...__VLS_functionalComponentArgsRest(__VLS_22));
__VLS_24.slots.default;
const __VLS_25 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_26 = __VLS_asFunctionalComponent(__VLS_25, new __VLS_25({
    gutter: (16),
}));
const __VLS_27 = __VLS_26({
    gutter: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_26));
__VLS_28.slots.default;
const __VLS_29 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_30 = __VLS_asFunctionalComponent(__VLS_29, new __VLS_29({
    span: (24),
}));
const __VLS_31 = __VLS_30({
    span: (24),
}, ...__VLS_functionalComponentArgsRest(__VLS_30));
__VLS_32.slots.default;
const __VLS_33 = {}.ASpace;
/** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
// @ts-ignore
const __VLS_34 = __VLS_asFunctionalComponent(__VLS_33, new __VLS_33({
    size: "large",
}));
const __VLS_35 = __VLS_34({
    size: "large",
}, ...__VLS_functionalComponentArgsRest(__VLS_34));
__VLS_36.slots.default;
const __VLS_37 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_38 = __VLS_asFunctionalComponent(__VLS_37, new __VLS_37({
    label: "姓名",
}));
const __VLS_39 = __VLS_38({
    label: "姓名",
}, ...__VLS_functionalComponentArgsRest(__VLS_38));
__VLS_40.slots.default;
const __VLS_41 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
const __VLS_42 = __VLS_asFunctionalComponent(__VLS_41, new __VLS_41({
    modelValue: (__VLS_ctx.formState.username),
    placeholder: "请输入姓名",
    ...{ style: {} },
}));
const __VLS_43 = __VLS_42({
    modelValue: (__VLS_ctx.formState.username),
    placeholder: "请输入姓名",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_42));
var __VLS_40;
const __VLS_45 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_46 = __VLS_asFunctionalComponent(__VLS_45, new __VLS_45({
    label: "手机号",
}));
const __VLS_47 = __VLS_46({
    label: "手机号",
}, ...__VLS_functionalComponentArgsRest(__VLS_46));
__VLS_48.slots.default;
const __VLS_49 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
const __VLS_50 = __VLS_asFunctionalComponent(__VLS_49, new __VLS_49({
    modelValue: (__VLS_ctx.formState.phone),
    placeholder: "请输入手机号",
    ...{ style: {} },
}));
const __VLS_51 = __VLS_50({
    modelValue: (__VLS_ctx.formState.phone),
    placeholder: "请输入手机号",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_50));
var __VLS_48;
const __VLS_53 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_54 = __VLS_asFunctionalComponent(__VLS_53, new __VLS_53({
    label: "身份证号",
}));
const __VLS_55 = __VLS_54({
    label: "身份证号",
}, ...__VLS_functionalComponentArgsRest(__VLS_54));
__VLS_56.slots.default;
const __VLS_57 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
const __VLS_58 = __VLS_asFunctionalComponent(__VLS_57, new __VLS_57({
    modelValue: (__VLS_ctx.formState.idCard),
    placeholder: "请输入身份证号",
    ...{ style: {} },
}));
const __VLS_59 = __VLS_58({
    modelValue: (__VLS_ctx.formState.idCard),
    placeholder: "请输入身份证号",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_58));
var __VLS_56;
var __VLS_36;
var __VLS_32;
var __VLS_28;
const __VLS_61 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_62 = __VLS_asFunctionalComponent(__VLS_61, new __VLS_61({
    gutter: (16),
    ...{ style: {} },
}));
const __VLS_63 = __VLS_62({
    gutter: (16),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_62));
__VLS_64.slots.default;
const __VLS_65 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_66 = __VLS_asFunctionalComponent(__VLS_65, new __VLS_65({
    span: (24),
}));
const __VLS_67 = __VLS_66({
    span: (24),
}, ...__VLS_functionalComponentArgsRest(__VLS_66));
__VLS_68.slots.default;
const __VLS_69 = {}.ASpace;
/** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
// @ts-ignore
const __VLS_70 = __VLS_asFunctionalComponent(__VLS_69, new __VLS_69({
    size: "large",
}));
const __VLS_71 = __VLS_70({
    size: "large",
}, ...__VLS_functionalComponentArgsRest(__VLS_70));
__VLS_72.slots.default;
const __VLS_73 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_74 = __VLS_asFunctionalComponent(__VLS_73, new __VLS_73({
    label: "添加时间",
}));
const __VLS_75 = __VLS_74({
    label: "添加时间",
}, ...__VLS_functionalComponentArgsRest(__VLS_74));
__VLS_76.slots.default;
const __VLS_77 = {}.ARangePicker;
/** @type {[typeof __VLS_components.ARangePicker, typeof __VLS_components.aRangePicker, ]} */ ;
// @ts-ignore
const __VLS_78 = __VLS_asFunctionalComponent(__VLS_77, new __VLS_77({
    modelValue: (__VLS_ctx.formState.addTimeRange),
    ...{ style: {} },
    placeholder: (['开始日期', '结束日期']),
}));
const __VLS_79 = __VLS_78({
    modelValue: (__VLS_ctx.formState.addTimeRange),
    ...{ style: {} },
    placeholder: (['开始日期', '结束日期']),
}, ...__VLS_functionalComponentArgsRest(__VLS_78));
var __VLS_76;
const __VLS_81 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_82 = __VLS_asFunctionalComponent(__VLS_81, new __VLS_81({
    label: "禁用时间",
}));
const __VLS_83 = __VLS_82({
    label: "禁用时间",
}, ...__VLS_functionalComponentArgsRest(__VLS_82));
__VLS_84.slots.default;
const __VLS_85 = {}.ARangePicker;
/** @type {[typeof __VLS_components.ARangePicker, typeof __VLS_components.aRangePicker, ]} */ ;
// @ts-ignore
const __VLS_86 = __VLS_asFunctionalComponent(__VLS_85, new __VLS_85({
    modelValue: (__VLS_ctx.formState.banTimeRange),
    ...{ style: {} },
    placeholder: (['开始日期', '结束日期']),
}));
const __VLS_87 = __VLS_86({
    modelValue: (__VLS_ctx.formState.banTimeRange),
    ...{ style: {} },
    placeholder: (['开始日期', '结束日期']),
}, ...__VLS_functionalComponentArgsRest(__VLS_86));
var __VLS_84;
var __VLS_72;
var __VLS_68;
var __VLS_64;
var __VLS_24;
var __VLS_20;
const __VLS_89 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_90 = __VLS_asFunctionalComponent(__VLS_89, new __VLS_89({}));
const __VLS_91 = __VLS_90({}, ...__VLS_functionalComponentArgsRest(__VLS_90));
__VLS_92.slots.default;
const __VLS_93 = {}.ASpace;
/** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
// @ts-ignore
const __VLS_94 = __VLS_asFunctionalComponent(__VLS_93, new __VLS_93({}));
const __VLS_95 = __VLS_94({}, ...__VLS_functionalComponentArgsRest(__VLS_94));
__VLS_96.slots.default;
const __VLS_97 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_98 = __VLS_asFunctionalComponent(__VLS_97, new __VLS_97({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_99 = __VLS_98({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_98));
let __VLS_101;
let __VLS_102;
let __VLS_103;
const __VLS_104 = {
    onClick: (__VLS_ctx.handleSearch)
};
__VLS_100.slots.default;
var __VLS_100;
const __VLS_105 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_106 = __VLS_asFunctionalComponent(__VLS_105, new __VLS_105({
    ...{ 'onClick': {} },
}));
const __VLS_107 = __VLS_106({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_106));
let __VLS_109;
let __VLS_110;
let __VLS_111;
const __VLS_112 = {
    onClick: (__VLS_ctx.handleReset)
};
__VLS_108.slots.default;
var __VLS_108;
const __VLS_113 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_114 = __VLS_asFunctionalComponent(__VLS_113, new __VLS_113({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_115 = __VLS_114({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_114));
let __VLS_117;
let __VLS_118;
let __VLS_119;
const __VLS_120 = {
    onClick: (__VLS_ctx.handleCreate)
};
__VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.activeTab === 'blacklist') }, null, null);
__VLS_116.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_116.slots;
    const __VLS_121 = {}.IconPlus;
    /** @type {[typeof __VLS_components.IconPlus, typeof __VLS_components.iconPlus, ]} */ ;
    // @ts-ignore
    const __VLS_122 = __VLS_asFunctionalComponent(__VLS_121, new __VLS_121({}));
    const __VLS_123 = __VLS_122({}, ...__VLS_functionalComponentArgsRest(__VLS_122));
}
var __VLS_116;
const __VLS_125 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_126 = __VLS_asFunctionalComponent(__VLS_125, new __VLS_125({
    ...{ 'onClick': {} },
    type: "outline",
}));
const __VLS_127 = __VLS_126({
    ...{ 'onClick': {} },
    type: "outline",
}, ...__VLS_functionalComponentArgsRest(__VLS_126));
let __VLS_129;
let __VLS_130;
let __VLS_131;
const __VLS_132 = {
    onClick: (__VLS_ctx.handleImport)
};
__VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.activeTab === 'blacklist') }, null, null);
__VLS_128.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_128.slots;
    const __VLS_133 = {}.IconUpload;
    /** @type {[typeof __VLS_components.IconUpload, typeof __VLS_components.iconUpload, ]} */ ;
    // @ts-ignore
    const __VLS_134 = __VLS_asFunctionalComponent(__VLS_133, new __VLS_133({}));
    const __VLS_135 = __VLS_134({}, ...__VLS_functionalComponentArgsRest(__VLS_134));
}
var __VLS_128;
var __VLS_96;
var __VLS_92;
var __VLS_16;
const __VLS_137 = {}.ATabs;
/** @type {[typeof __VLS_components.ATabs, typeof __VLS_components.aTabs, typeof __VLS_components.ATabs, typeof __VLS_components.aTabs, ]} */ ;
// @ts-ignore
const __VLS_138 = __VLS_asFunctionalComponent(__VLS_137, new __VLS_137({
    type: "card",
    ...{ class: "blacklist-tabs" },
    activeKey: (__VLS_ctx.activeTab),
}));
const __VLS_139 = __VLS_138({
    type: "card",
    ...{ class: "blacklist-tabs" },
    activeKey: (__VLS_ctx.activeTab),
}, ...__VLS_functionalComponentArgsRest(__VLS_138));
__VLS_140.slots.default;
const __VLS_141 = {}.ATabPane;
/** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ ;
// @ts-ignore
const __VLS_142 = __VLS_asFunctionalComponent(__VLS_141, new __VLS_141({
    key: "blacklist",
    title: "黑名单库",
}));
const __VLS_143 = __VLS_142({
    key: "blacklist",
    title: "黑名单库",
}, ...__VLS_functionalComponentArgsRest(__VLS_142));
__VLS_144.slots.default;
const __VLS_145 = {}.ATable;
/** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ ;
// @ts-ignore
const __VLS_146 = __VLS_asFunctionalComponent(__VLS_145, new __VLS_145({
    ...{ 'onScroll': {} },
    columns: (__VLS_ctx.blacklistColumns),
    data: (__VLS_ctx.blacklistData),
    pagination: ({ pageSize: 10 }),
    scroll: ({ x: '100%', y: '400px' }),
    bordered: ({ wrapper: true, cell: true }),
    rowKey: "idCard",
    ...{ class: "blacklist-table" },
}));
const __VLS_147 = __VLS_146({
    ...{ 'onScroll': {} },
    columns: (__VLS_ctx.blacklistColumns),
    data: (__VLS_ctx.blacklistData),
    pagination: ({ pageSize: 10 }),
    scroll: ({ x: '100%', y: '400px' }),
    bordered: ({ wrapper: true, cell: true }),
    rowKey: "idCard",
    ...{ class: "blacklist-table" },
}, ...__VLS_functionalComponentArgsRest(__VLS_146));
let __VLS_149;
let __VLS_150;
let __VLS_151;
const __VLS_152 = {
    onScroll: (__VLS_ctx.handleTableScroll)
};
__VLS_148.slots.default;
{
    const { operations: __VLS_thisSlot } = __VLS_148.slots;
    const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_153 = {}.ASpace;
    /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
    // @ts-ignore
    const __VLS_154 = __VLS_asFunctionalComponent(__VLS_153, new __VLS_153({}));
    const __VLS_155 = __VLS_154({}, ...__VLS_functionalComponentArgsRest(__VLS_154));
    __VLS_156.slots.default;
    const __VLS_157 = {}.ATooltip;
    /** @type {[typeof __VLS_components.ATooltip, typeof __VLS_components.aTooltip, typeof __VLS_components.ATooltip, typeof __VLS_components.aTooltip, ]} */ ;
    // @ts-ignore
    const __VLS_158 = __VLS_asFunctionalComponent(__VLS_157, new __VLS_157({
        content: "解禁用户",
        mini: true,
    }));
    const __VLS_159 = __VLS_158({
        content: "解禁用户",
        mini: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_158));
    __VLS_160.slots.default;
    const __VLS_161 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_162 = __VLS_asFunctionalComponent(__VLS_161, new __VLS_161({
        ...{ 'onClick': {} },
        type: "outline",
        status: "warning",
        size: "small",
    }));
    const __VLS_163 = __VLS_162({
        ...{ 'onClick': {} },
        type: "outline",
        status: "warning",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_162));
    let __VLS_165;
    let __VLS_166;
    let __VLS_167;
    const __VLS_168 = {
        onClick: (...[$event]) => {
            __VLS_ctx.handleUnban(record);
        }
    };
    __VLS_164.slots.default;
    {
        const { icon: __VLS_thisSlot } = __VLS_164.slots;
        const __VLS_169 = {}.IconUndo;
        /** @type {[typeof __VLS_components.IconUndo, typeof __VLS_components.iconUndo, ]} */ ;
        // @ts-ignore
        const __VLS_170 = __VLS_asFunctionalComponent(__VLS_169, new __VLS_169({}));
        const __VLS_171 = __VLS_170({}, ...__VLS_functionalComponentArgsRest(__VLS_170));
    }
    var __VLS_164;
    var __VLS_160;
    var __VLS_156;
}
var __VLS_148;
var __VLS_144;
const __VLS_173 = {}.ATabPane;
/** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ ;
// @ts-ignore
const __VLS_174 = __VLS_asFunctionalComponent(__VLS_173, new __VLS_173({
    key: "unbanned",
    title: "解禁名单库",
}));
const __VLS_175 = __VLS_174({
    key: "unbanned",
    title: "解禁名单库",
}, ...__VLS_functionalComponentArgsRest(__VLS_174));
__VLS_176.slots.default;
const __VLS_177 = {}.ATable;
/** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ ;
// @ts-ignore
const __VLS_178 = __VLS_asFunctionalComponent(__VLS_177, new __VLS_177({
    ...{ 'onScroll': {} },
    columns: (__VLS_ctx.unbannedColumns),
    data: (__VLS_ctx.unbannedData),
    scroll: ({ x: '100%', y: '400px' }),
    bordered: ({ wrapper: true, cell: true }),
    pagination: ({ pageSize: 10 }),
}));
const __VLS_179 = __VLS_178({
    ...{ 'onScroll': {} },
    columns: (__VLS_ctx.unbannedColumns),
    data: (__VLS_ctx.unbannedData),
    scroll: ({ x: '100%', y: '400px' }),
    bordered: ({ wrapper: true, cell: true }),
    pagination: ({ pageSize: 10 }),
}, ...__VLS_functionalComponentArgsRest(__VLS_178));
let __VLS_181;
let __VLS_182;
let __VLS_183;
const __VLS_184 = {
    onScroll: (__VLS_ctx.handleTableScroll)
};
var __VLS_180;
var __VLS_176;
var __VLS_140;
var __VLS_12;
var __VLS_8;
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['content']} */ ;
/** @type {__VLS_StyleScopedClasses['search-form']} */ ;
/** @type {__VLS_StyleScopedClasses['blacklist-tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['blacklist-table']} */ ;
var __VLS_dollars;
let __VLS_self;
