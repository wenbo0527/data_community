/// <reference types="../../../../node_modules/.vue-global-types/vue_3.3_0_0_0.d.ts" />
import { useRouter } from 'vue-router';
import { IconStorage, IconLink, IconBarChart, IconSettings } from '@arco-design/web-vue/es/icon';
const router = useRouter();
const navigateTo = (path) => {
    router.push(`/discovery/asset-management/${path}`);
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['module-card']} */ ;
/** @type {__VLS_StyleScopedClasses['module-title']} */ ;
/** @type {__VLS_StyleScopedClasses['module-title']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "asset-management" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "page-description" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "overview-section" },
});
const __VLS_0 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    gutter: (24),
}));
const __VLS_2 = __VLS_1({
    gutter: (24),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
const __VLS_4 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    span: (6),
}));
const __VLS_6 = __VLS_5({
    span: (6),
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
__VLS_7.slots.default;
const __VLS_8 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    ...{ 'onClick': {} },
    ...{ class: "stat-card" },
    hoverable: true,
}));
const __VLS_10 = __VLS_9({
    ...{ 'onClick': {} },
    ...{ class: "stat-card" },
    hoverable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
let __VLS_12;
let __VLS_13;
let __VLS_14;
const __VLS_15 = {
    onClick: (...[$event]) => {
        __VLS_ctx.navigateTo('table-management');
    }
};
__VLS_11.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-icon table-icon" },
});
const __VLS_16 = {}.IconStorage;
/** @type {[typeof __VLS_components.IconStorage, typeof __VLS_components.iconStorage, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({}));
const __VLS_18 = __VLS_17({}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-info" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-number" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-label" },
});
var __VLS_11;
var __VLS_7;
const __VLS_20 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    span: (6),
}));
const __VLS_22 = __VLS_21({
    span: (6),
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
__VLS_23.slots.default;
const __VLS_24 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    ...{ 'onClick': {} },
    ...{ class: "stat-card" },
    hoverable: true,
}));
const __VLS_26 = __VLS_25({
    ...{ 'onClick': {} },
    ...{ class: "stat-card" },
    hoverable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
let __VLS_28;
let __VLS_29;
let __VLS_30;
const __VLS_31 = {
    onClick: (...[$event]) => {
        __VLS_ctx.navigateTo('external-data-management');
    }
};
__VLS_27.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-icon external-icon" },
});
const __VLS_32 = {}.IconLink;
/** @type {[typeof __VLS_components.IconLink, typeof __VLS_components.iconLink, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({}));
const __VLS_34 = __VLS_33({}, ...__VLS_functionalComponentArgsRest(__VLS_33));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-info" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-number" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-label" },
});
var __VLS_27;
var __VLS_23;
const __VLS_36 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
    span: (6),
}));
const __VLS_38 = __VLS_37({
    span: (6),
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
__VLS_39.slots.default;
const __VLS_40 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    ...{ 'onClick': {} },
    ...{ class: "stat-card" },
    hoverable: true,
}));
const __VLS_42 = __VLS_41({
    ...{ 'onClick': {} },
    ...{ class: "stat-card" },
    hoverable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
let __VLS_44;
let __VLS_45;
let __VLS_46;
const __VLS_47 = {
    onClick: (...[$event]) => {
        __VLS_ctx.navigateTo('metric-management');
    }
};
__VLS_43.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-icon metric-icon" },
});
const __VLS_48 = {}.IconBarChart;
/** @type {[typeof __VLS_components.IconBarChart, typeof __VLS_components.iconBarChart, ]} */ ;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({}));
const __VLS_50 = __VLS_49({}, ...__VLS_functionalComponentArgsRest(__VLS_49));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-info" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-number" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-label" },
});
var __VLS_43;
var __VLS_39;
const __VLS_52 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    span: (6),
}));
const __VLS_54 = __VLS_53({
    span: (6),
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
__VLS_55.slots.default;
const __VLS_56 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
    ...{ 'onClick': {} },
    ...{ class: "stat-card" },
    hoverable: true,
}));
const __VLS_58 = __VLS_57({
    ...{ 'onClick': {} },
    ...{ class: "stat-card" },
    hoverable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
let __VLS_60;
let __VLS_61;
let __VLS_62;
const __VLS_63 = {
    onClick: (...[$event]) => {
        __VLS_ctx.navigateTo('batch-asset-management');
    }
};
__VLS_59.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-icon batch-icon" },
});
const __VLS_64 = {}.IconSettings;
/** @type {[typeof __VLS_components.IconSettings, typeof __VLS_components.iconSettings, ]} */ ;
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({}));
const __VLS_66 = __VLS_65({}, ...__VLS_functionalComponentArgsRest(__VLS_65));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-info" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-number" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-label" },
});
var __VLS_59;
var __VLS_55;
var __VLS_3;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "modules-section" },
});
const __VLS_68 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
    gutter: (24),
}));
const __VLS_70 = __VLS_69({
    gutter: (24),
}, ...__VLS_functionalComponentArgsRest(__VLS_69));
__VLS_71.slots.default;
const __VLS_72 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
    span: (12),
}));
const __VLS_74 = __VLS_73({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_73));
__VLS_75.slots.default;
const __VLS_76 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
    ...{ 'onClick': {} },
    ...{ class: "module-card" },
    hoverable: true,
}));
const __VLS_78 = __VLS_77({
    ...{ 'onClick': {} },
    ...{ class: "module-card" },
    hoverable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_77));
let __VLS_80;
let __VLS_81;
let __VLS_82;
const __VLS_83 = {
    onClick: (...[$event]) => {
        __VLS_ctx.navigateTo('table-management');
    }
};
__VLS_79.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "module-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "module-icon table-icon" },
});
const __VLS_84 = {}.IconStorage;
/** @type {[typeof __VLS_components.IconStorage, typeof __VLS_components.iconStorage, ]} */ ;
// @ts-ignore
const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({}));
const __VLS_86 = __VLS_85({}, ...__VLS_functionalComponentArgsRest(__VLS_85));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "module-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "module-features" },
});
const __VLS_88 = {}.ATag;
/** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
// @ts-ignore
const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({}));
const __VLS_90 = __VLS_89({}, ...__VLS_functionalComponentArgsRest(__VLS_89));
__VLS_91.slots.default;
var __VLS_91;
const __VLS_92 = {}.ATag;
/** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
// @ts-ignore
const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({}));
const __VLS_94 = __VLS_93({}, ...__VLS_functionalComponentArgsRest(__VLS_93));
__VLS_95.slots.default;
var __VLS_95;
const __VLS_96 = {}.ATag;
/** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
// @ts-ignore
const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({}));
const __VLS_98 = __VLS_97({}, ...__VLS_functionalComponentArgsRest(__VLS_97));
__VLS_99.slots.default;
var __VLS_99;
var __VLS_79;
var __VLS_75;
const __VLS_100 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
    span: (12),
}));
const __VLS_102 = __VLS_101({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_101));
__VLS_103.slots.default;
const __VLS_104 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({
    ...{ 'onClick': {} },
    ...{ class: "module-card" },
    hoverable: true,
}));
const __VLS_106 = __VLS_105({
    ...{ 'onClick': {} },
    ...{ class: "module-card" },
    hoverable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_105));
let __VLS_108;
let __VLS_109;
let __VLS_110;
const __VLS_111 = {
    onClick: (...[$event]) => {
        __VLS_ctx.navigateTo('external-data-management');
    }
};
__VLS_107.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "module-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "module-icon external-icon" },
});
const __VLS_112 = {}.IconLink;
/** @type {[typeof __VLS_components.IconLink, typeof __VLS_components.iconLink, ]} */ ;
// @ts-ignore
const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({}));
const __VLS_114 = __VLS_113({}, ...__VLS_functionalComponentArgsRest(__VLS_113));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "module-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "module-features" },
});
const __VLS_116 = {}.ATag;
/** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
// @ts-ignore
const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({}));
const __VLS_118 = __VLS_117({}, ...__VLS_functionalComponentArgsRest(__VLS_117));
__VLS_119.slots.default;
var __VLS_119;
const __VLS_120 = {}.ATag;
/** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
// @ts-ignore
const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({}));
const __VLS_122 = __VLS_121({}, ...__VLS_functionalComponentArgsRest(__VLS_121));
__VLS_123.slots.default;
var __VLS_123;
const __VLS_124 = {}.ATag;
/** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
// @ts-ignore
const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({}));
const __VLS_126 = __VLS_125({}, ...__VLS_functionalComponentArgsRest(__VLS_125));
__VLS_127.slots.default;
var __VLS_127;
var __VLS_107;
var __VLS_103;
var __VLS_71;
const __VLS_128 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_129 = __VLS_asFunctionalComponent(__VLS_128, new __VLS_128({
    gutter: (24),
    ...{ style: {} },
}));
const __VLS_130 = __VLS_129({
    gutter: (24),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_129));
__VLS_131.slots.default;
const __VLS_132 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132({
    span: (12),
}));
const __VLS_134 = __VLS_133({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_133));
__VLS_135.slots.default;
const __VLS_136 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_137 = __VLS_asFunctionalComponent(__VLS_136, new __VLS_136({
    ...{ 'onClick': {} },
    ...{ class: "module-card" },
    hoverable: true,
}));
const __VLS_138 = __VLS_137({
    ...{ 'onClick': {} },
    ...{ class: "module-card" },
    hoverable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_137));
let __VLS_140;
let __VLS_141;
let __VLS_142;
const __VLS_143 = {
    onClick: (...[$event]) => {
        __VLS_ctx.navigateTo('metric-management');
    }
};
__VLS_139.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "module-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "module-icon metric-icon" },
});
const __VLS_144 = {}.IconBarChart;
/** @type {[typeof __VLS_components.IconBarChart, typeof __VLS_components.iconBarChart, ]} */ ;
// @ts-ignore
const __VLS_145 = __VLS_asFunctionalComponent(__VLS_144, new __VLS_144({}));
const __VLS_146 = __VLS_145({}, ...__VLS_functionalComponentArgsRest(__VLS_145));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "module-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "module-features" },
});
const __VLS_148 = {}.ATag;
/** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
// @ts-ignore
const __VLS_149 = __VLS_asFunctionalComponent(__VLS_148, new __VLS_148({}));
const __VLS_150 = __VLS_149({}, ...__VLS_functionalComponentArgsRest(__VLS_149));
__VLS_151.slots.default;
var __VLS_151;
const __VLS_152 = {}.ATag;
/** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
// @ts-ignore
const __VLS_153 = __VLS_asFunctionalComponent(__VLS_152, new __VLS_152({}));
const __VLS_154 = __VLS_153({}, ...__VLS_functionalComponentArgsRest(__VLS_153));
__VLS_155.slots.default;
var __VLS_155;
const __VLS_156 = {}.ATag;
/** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
// @ts-ignore
const __VLS_157 = __VLS_asFunctionalComponent(__VLS_156, new __VLS_156({}));
const __VLS_158 = __VLS_157({}, ...__VLS_functionalComponentArgsRest(__VLS_157));
__VLS_159.slots.default;
var __VLS_159;
var __VLS_139;
var __VLS_135;
const __VLS_160 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_161 = __VLS_asFunctionalComponent(__VLS_160, new __VLS_160({
    span: (12),
}));
const __VLS_162 = __VLS_161({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_161));
__VLS_163.slots.default;
const __VLS_164 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_165 = __VLS_asFunctionalComponent(__VLS_164, new __VLS_164({
    ...{ 'onClick': {} },
    ...{ class: "module-card" },
    hoverable: true,
}));
const __VLS_166 = __VLS_165({
    ...{ 'onClick': {} },
    ...{ class: "module-card" },
    hoverable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_165));
let __VLS_168;
let __VLS_169;
let __VLS_170;
const __VLS_171 = {
    onClick: (...[$event]) => {
        __VLS_ctx.navigateTo('batch-asset-management');
    }
};
__VLS_167.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "module-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "module-icon batch-icon" },
});
const __VLS_172 = {}.IconSettings;
/** @type {[typeof __VLS_components.IconSettings, typeof __VLS_components.iconSettings, ]} */ ;
// @ts-ignore
const __VLS_173 = __VLS_asFunctionalComponent(__VLS_172, new __VLS_172({}));
const __VLS_174 = __VLS_173({}, ...__VLS_functionalComponentArgsRest(__VLS_173));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "module-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "module-features" },
});
const __VLS_176 = {}.ATag;
/** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
// @ts-ignore
const __VLS_177 = __VLS_asFunctionalComponent(__VLS_176, new __VLS_176({}));
const __VLS_178 = __VLS_177({}, ...__VLS_functionalComponentArgsRest(__VLS_177));
__VLS_179.slots.default;
var __VLS_179;
const __VLS_180 = {}.ATag;
/** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
// @ts-ignore
const __VLS_181 = __VLS_asFunctionalComponent(__VLS_180, new __VLS_180({}));
const __VLS_182 = __VLS_181({}, ...__VLS_functionalComponentArgsRest(__VLS_181));
__VLS_183.slots.default;
var __VLS_183;
const __VLS_184 = {}.ATag;
/** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
// @ts-ignore
const __VLS_185 = __VLS_asFunctionalComponent(__VLS_184, new __VLS_184({}));
const __VLS_186 = __VLS_185({}, ...__VLS_functionalComponentArgsRest(__VLS_185));
__VLS_187.slots.default;
var __VLS_187;
var __VLS_167;
var __VLS_163;
var __VLS_131;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "activity-section" },
});
const __VLS_188 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_189 = __VLS_asFunctionalComponent(__VLS_188, new __VLS_188({
    title: "最近活动",
}));
const __VLS_190 = __VLS_189({
    title: "最近活动",
}, ...__VLS_functionalComponentArgsRest(__VLS_189));
__VLS_191.slots.default;
const __VLS_192 = {}.ATimeline;
/** @type {[typeof __VLS_components.ATimeline, typeof __VLS_components.aTimeline, typeof __VLS_components.ATimeline, typeof __VLS_components.aTimeline, ]} */ ;
// @ts-ignore
const __VLS_193 = __VLS_asFunctionalComponent(__VLS_192, new __VLS_192({}));
const __VLS_194 = __VLS_193({}, ...__VLS_functionalComponentArgsRest(__VLS_193));
__VLS_195.slots.default;
const __VLS_196 = {}.ATimelineItem;
/** @type {[typeof __VLS_components.ATimelineItem, typeof __VLS_components.aTimelineItem, typeof __VLS_components.ATimelineItem, typeof __VLS_components.aTimelineItem, ]} */ ;
// @ts-ignore
const __VLS_197 = __VLS_asFunctionalComponent(__VLS_196, new __VLS_196({}));
const __VLS_198 = __VLS_197({}, ...__VLS_functionalComponentArgsRest(__VLS_197));
__VLS_199.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "activity-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "activity-user" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "activity-action" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "activity-target" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "activity-time" },
});
var __VLS_199;
const __VLS_200 = {}.ATimelineItem;
/** @type {[typeof __VLS_components.ATimelineItem, typeof __VLS_components.aTimelineItem, typeof __VLS_components.ATimelineItem, typeof __VLS_components.aTimelineItem, ]} */ ;
// @ts-ignore
const __VLS_201 = __VLS_asFunctionalComponent(__VLS_200, new __VLS_200({}));
const __VLS_202 = __VLS_201({}, ...__VLS_functionalComponentArgsRest(__VLS_201));
__VLS_203.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "activity-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "activity-user" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "activity-action" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "activity-target" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "activity-time" },
});
var __VLS_203;
const __VLS_204 = {}.ATimelineItem;
/** @type {[typeof __VLS_components.ATimelineItem, typeof __VLS_components.aTimelineItem, typeof __VLS_components.ATimelineItem, typeof __VLS_components.aTimelineItem, ]} */ ;
// @ts-ignore
const __VLS_205 = __VLS_asFunctionalComponent(__VLS_204, new __VLS_204({}));
const __VLS_206 = __VLS_205({}, ...__VLS_functionalComponentArgsRest(__VLS_205));
__VLS_207.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "activity-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "activity-user" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "activity-action" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "activity-target" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "activity-time" },
});
var __VLS_207;
var __VLS_195;
var __VLS_191;
/** @type {__VLS_StyleScopedClasses['asset-management']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['page-description']} */ ;
/** @type {__VLS_StyleScopedClasses['overview-section']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-content']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['table-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-info']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-number']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-content']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['external-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-info']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-number']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-content']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-info']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-number']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-content']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['batch-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-info']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-number']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['modules-section']} */ ;
/** @type {__VLS_StyleScopedClasses['module-card']} */ ;
/** @type {__VLS_StyleScopedClasses['module-header']} */ ;
/** @type {__VLS_StyleScopedClasses['module-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['table-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['module-title']} */ ;
/** @type {__VLS_StyleScopedClasses['module-features']} */ ;
/** @type {__VLS_StyleScopedClasses['module-card']} */ ;
/** @type {__VLS_StyleScopedClasses['module-header']} */ ;
/** @type {__VLS_StyleScopedClasses['module-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['external-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['module-title']} */ ;
/** @type {__VLS_StyleScopedClasses['module-features']} */ ;
/** @type {__VLS_StyleScopedClasses['module-card']} */ ;
/** @type {__VLS_StyleScopedClasses['module-header']} */ ;
/** @type {__VLS_StyleScopedClasses['module-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['module-title']} */ ;
/** @type {__VLS_StyleScopedClasses['module-features']} */ ;
/** @type {__VLS_StyleScopedClasses['module-card']} */ ;
/** @type {__VLS_StyleScopedClasses['module-header']} */ ;
/** @type {__VLS_StyleScopedClasses['module-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['batch-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['module-title']} */ ;
/** @type {__VLS_StyleScopedClasses['module-features']} */ ;
/** @type {__VLS_StyleScopedClasses['activity-section']} */ ;
/** @type {__VLS_StyleScopedClasses['activity-item']} */ ;
/** @type {__VLS_StyleScopedClasses['activity-user']} */ ;
/** @type {__VLS_StyleScopedClasses['activity-action']} */ ;
/** @type {__VLS_StyleScopedClasses['activity-target']} */ ;
/** @type {__VLS_StyleScopedClasses['activity-time']} */ ;
/** @type {__VLS_StyleScopedClasses['activity-item']} */ ;
/** @type {__VLS_StyleScopedClasses['activity-user']} */ ;
/** @type {__VLS_StyleScopedClasses['activity-action']} */ ;
/** @type {__VLS_StyleScopedClasses['activity-target']} */ ;
/** @type {__VLS_StyleScopedClasses['activity-time']} */ ;
/** @type {__VLS_StyleScopedClasses['activity-item']} */ ;
/** @type {__VLS_StyleScopedClasses['activity-user']} */ ;
/** @type {__VLS_StyleScopedClasses['activity-action']} */ ;
/** @type {__VLS_StyleScopedClasses['activity-target']} */ ;
/** @type {__VLS_StyleScopedClasses['activity-time']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            IconStorage: IconStorage,
            IconLink: IconLink,
            IconBarChart: IconBarChart,
            IconSettings: IconSettings,
            navigateTo: navigateTo,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
