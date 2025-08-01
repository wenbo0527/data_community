import { computed } from 'vue';
import { IconLoading } from '@arco-design/web-vue/es/icon';
const props = defineProps();
const gridCount = computed(() => props.gridCount || 8);
const progressPercent = computed(() => props.progressPercent || 0);
const progressColor = computed(() => props.progressColor || 'rgb(var(--primary-6))');
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['loading-spinner']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['skeleton-card-text']} */ ;
/** @type {__VLS_StyleScopedClasses['skeleton-card-text']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-container']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-spinner']} */ ;
/** @type {__VLS_StyleScopedClasses['arco-spin-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-text']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-description']} */ ;
/** @type {__VLS_StyleScopedClasses['skeleton-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['skeleton-container']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "loading-state" },
});
if (__VLS_ctx.type === 'skeleton') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "skeleton-container" },
    });
    if (__VLS_ctx.showSearch) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "skeleton-search" },
        });
        const __VLS_0 = {}.ASkeleton;
        /** @type {[typeof __VLS_components.ASkeleton, typeof __VLS_components.aSkeleton, typeof __VLS_components.ASkeleton, typeof __VLS_components.aSkeleton, ]} */ ;
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({}));
        const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
        __VLS_3.slots.default;
        const __VLS_4 = {}.ASkeletonShape;
        /** @type {[typeof __VLS_components.ASkeletonShape, typeof __VLS_components.aSkeletonShape, ]} */ ;
        // @ts-ignore
        const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
            shape: "square",
            ...{ style: ({ width: '100%', height: '60px', borderRadius: '8px' }) },
        }));
        const __VLS_6 = __VLS_5({
            shape: "square",
            ...{ style: ({ width: '100%', height: '60px', borderRadius: '8px' }) },
        }, ...__VLS_functionalComponentArgsRest(__VLS_5));
        var __VLS_3;
    }
    if (__VLS_ctx.showTabs) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "skeleton-tabs" },
        });
        const __VLS_8 = {}.ASkeleton;
        /** @type {[typeof __VLS_components.ASkeleton, typeof __VLS_components.aSkeleton, typeof __VLS_components.ASkeleton, typeof __VLS_components.aSkeleton, ]} */ ;
        // @ts-ignore
        const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({}));
        const __VLS_10 = __VLS_9({}, ...__VLS_functionalComponentArgsRest(__VLS_9));
        __VLS_11.slots.default;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "skeleton-tab-nav" },
        });
        for (const [i] of __VLS_getVForSourceType((3))) {
            const __VLS_12 = {}.ASkeletonShape;
            /** @type {[typeof __VLS_components.ASkeletonShape, typeof __VLS_components.aSkeletonShape, ]} */ ;
            // @ts-ignore
            const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
                key: (i),
                shape: "square",
                ...{ style: ({ width: '80px', height: '32px', borderRadius: '4px', marginRight: '16px' }) },
            }));
            const __VLS_14 = __VLS_13({
                key: (i),
                shape: "square",
                ...{ style: ({ width: '80px', height: '32px', borderRadius: '4px', marginRight: '16px' }) },
            }, ...__VLS_functionalComponentArgsRest(__VLS_13));
        }
        var __VLS_11;
    }
    if (__VLS_ctx.showGrid) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "skeleton-grid" },
        });
        const __VLS_16 = {}.ARow;
        /** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
        // @ts-ignore
        const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
            gutter: ([16, 16]),
        }));
        const __VLS_18 = __VLS_17({
            gutter: ([16, 16]),
        }, ...__VLS_functionalComponentArgsRest(__VLS_17));
        __VLS_19.slots.default;
        for (const [i] of __VLS_getVForSourceType((__VLS_ctx.gridCount))) {
            const __VLS_20 = {}.ACol;
            /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
            // @ts-ignore
            const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
                key: (i),
                xs: (24),
                sm: (12),
                md: (8),
                lg: (6),
            }));
            const __VLS_22 = __VLS_21({
                key: (i),
                xs: (24),
                sm: (12),
                md: (8),
                lg: (6),
            }, ...__VLS_functionalComponentArgsRest(__VLS_21));
            __VLS_23.slots.default;
            const __VLS_24 = {}.ASkeleton;
            /** @type {[typeof __VLS_components.ASkeleton, typeof __VLS_components.aSkeleton, typeof __VLS_components.ASkeleton, typeof __VLS_components.aSkeleton, ]} */ ;
            // @ts-ignore
            const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({}));
            const __VLS_26 = __VLS_25({}, ...__VLS_functionalComponentArgsRest(__VLS_25));
            __VLS_27.slots.default;
            const __VLS_28 = {}.ASkeletonShape;
            /** @type {[typeof __VLS_components.ASkeletonShape, typeof __VLS_components.aSkeletonShape, ]} */ ;
            // @ts-ignore
            const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
                shape: "square",
                ...{ style: ({ width: '100%', height: '200px', borderRadius: '8px' }) },
            }));
            const __VLS_30 = __VLS_29({
                shape: "square",
                ...{ style: ({ width: '100%', height: '200px', borderRadius: '8px' }) },
            }, ...__VLS_functionalComponentArgsRest(__VLS_29));
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ style: {} },
            });
            const __VLS_32 = {}.ASkeletonLine;
            /** @type {[typeof __VLS_components.ASkeletonLine, typeof __VLS_components.aSkeletonLine, ]} */ ;
            // @ts-ignore
            const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
                rows: (2),
            }));
            const __VLS_34 = __VLS_33({
                rows: (2),
            }, ...__VLS_functionalComponentArgsRest(__VLS_33));
            var __VLS_27;
            var __VLS_23;
        }
        var __VLS_19;
    }
    if (__VLS_ctx.showTable) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "skeleton-table" },
        });
        const __VLS_36 = {}.ASkeleton;
        /** @type {[typeof __VLS_components.ASkeleton, typeof __VLS_components.aSkeleton, typeof __VLS_components.ASkeleton, typeof __VLS_components.aSkeleton, ]} */ ;
        // @ts-ignore
        const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({}));
        const __VLS_38 = __VLS_37({}, ...__VLS_functionalComponentArgsRest(__VLS_37));
        __VLS_39.slots.default;
        const __VLS_40 = {}.ASkeletonShape;
        /** @type {[typeof __VLS_components.ASkeletonShape, typeof __VLS_components.aSkeletonShape, ]} */ ;
        // @ts-ignore
        const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
            shape: "square",
            ...{ style: ({ width: '100%', height: '400px', borderRadius: '8px' }) },
        }));
        const __VLS_42 = __VLS_41({
            shape: "square",
            ...{ style: ({ width: '100%', height: '400px', borderRadius: '8px' }) },
        }, ...__VLS_functionalComponentArgsRest(__VLS_41));
        var __VLS_39;
    }
    if (__VLS_ctx.showProcess) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "skeleton-process" },
        });
        const __VLS_44 = {}.ASkeleton;
        /** @type {[typeof __VLS_components.ASkeleton, typeof __VLS_components.aSkeleton, typeof __VLS_components.ASkeleton, typeof __VLS_components.aSkeleton, ]} */ ;
        // @ts-ignore
        const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({}));
        const __VLS_46 = __VLS_45({}, ...__VLS_functionalComponentArgsRest(__VLS_45));
        __VLS_47.slots.default;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "skeleton-steps" },
        });
        for (const [i] of __VLS_getVForSourceType((4))) {
            const __VLS_48 = {}.ASkeletonShape;
            /** @type {[typeof __VLS_components.ASkeletonShape, typeof __VLS_components.aSkeletonShape, ]} */ ;
            // @ts-ignore
            const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
                key: (i),
                shape: "circle",
                ...{ style: ({ width: '40px', height: '40px', marginRight: '60px' }) },
            }));
            const __VLS_50 = __VLS_49({
                key: (i),
                shape: "circle",
                ...{ style: ({ width: '40px', height: '40px', marginRight: '60px' }) },
            }, ...__VLS_functionalComponentArgsRest(__VLS_49));
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ style: {} },
        });
        const __VLS_52 = {}.ASkeletonShape;
        /** @type {[typeof __VLS_components.ASkeletonShape, typeof __VLS_components.aSkeletonShape, ]} */ ;
        // @ts-ignore
        const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
            shape: "square",
            ...{ style: ({ width: '100%', height: '300px', borderRadius: '8px' }) },
        }));
        const __VLS_54 = __VLS_53({
            shape: "square",
            ...{ style: ({ width: '100%', height: '300px', borderRadius: '8px' }) },
        }, ...__VLS_functionalComponentArgsRest(__VLS_53));
        var __VLS_47;
    }
}
else if (__VLS_ctx.type === 'spinner') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "spinner-container" },
    });
    const __VLS_56 = {}.ASpin;
    /** @type {[typeof __VLS_components.ASpin, typeof __VLS_components.aSpin, typeof __VLS_components.ASpin, typeof __VLS_components.aSpin, ]} */ ;
    // @ts-ignore
    const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
        loading: (true),
        size: (__VLS_ctx.spinnerSize),
        tip: (__VLS_ctx.loadingText),
    }));
    const __VLS_58 = __VLS_57({
        loading: (true),
        size: (__VLS_ctx.spinnerSize),
        tip: (__VLS_ctx.loadingText),
    }, ...__VLS_functionalComponentArgsRest(__VLS_57));
    __VLS_59.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "spinner-content" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "spinner-placeholder" },
    });
    var __VLS_59;
}
else if (__VLS_ctx.type === 'dots') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "dots-container" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "loading-dots" },
    });
    for (const [i] of __VLS_getVForSourceType((3))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "dot" },
            key: (i),
        });
    }
    if (__VLS_ctx.loadingText) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "dots-text" },
        });
        (__VLS_ctx.loadingText);
    }
}
else if (__VLS_ctx.type === 'progress') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "progress-container" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "progress-content" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "progress-icon" },
    });
    const __VLS_60 = {}.IconLoading;
    /** @type {[typeof __VLS_components.IconLoading, typeof __VLS_components.iconLoading, ]} */ ;
    // @ts-ignore
    const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
        ...{ class: "rotating-icon" },
    }));
    const __VLS_62 = __VLS_61({
        ...{ class: "rotating-icon" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_61));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "progress-info" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "progress-title" },
    });
    (__VLS_ctx.loadingText || '正在加载数据...');
    const __VLS_64 = {}.AProgress;
    /** @type {[typeof __VLS_components.AProgress, typeof __VLS_components.aProgress, ]} */ ;
    // @ts-ignore
    const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
        percent: (__VLS_ctx.progressPercent),
        showText: (false),
        strokeWidth: (4),
        color: (__VLS_ctx.progressColor),
    }));
    const __VLS_66 = __VLS_65({
        percent: (__VLS_ctx.progressPercent),
        showText: (false),
        strokeWidth: (4),
        color: (__VLS_ctx.progressColor),
    }, ...__VLS_functionalComponentArgsRest(__VLS_65));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "progress-detail" },
    });
    (__VLS_ctx.progressDetail);
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "pulse-container" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "pulse-wrapper" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "pulse-circle" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "pulse-circle pulse-delay-1" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "pulse-circle pulse-delay-2" },
    });
    if (__VLS_ctx.loadingText) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "pulse-text" },
        });
        (__VLS_ctx.loadingText);
    }
}
/** @type {__VLS_StyleScopedClasses['loading-state']} */ ;
/** @type {__VLS_StyleScopedClasses['skeleton-container']} */ ;
/** @type {__VLS_StyleScopedClasses['skeleton-search']} */ ;
/** @type {__VLS_StyleScopedClasses['skeleton-tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['skeleton-tab-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['skeleton-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['skeleton-table']} */ ;
/** @type {__VLS_StyleScopedClasses['skeleton-process']} */ ;
/** @type {__VLS_StyleScopedClasses['skeleton-steps']} */ ;
/** @type {__VLS_StyleScopedClasses['spinner-container']} */ ;
/** @type {__VLS_StyleScopedClasses['spinner-content']} */ ;
/** @type {__VLS_StyleScopedClasses['spinner-placeholder']} */ ;
/** @type {__VLS_StyleScopedClasses['dots-container']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-dots']} */ ;
/** @type {__VLS_StyleScopedClasses['dot']} */ ;
/** @type {__VLS_StyleScopedClasses['dots-text']} */ ;
/** @type {__VLS_StyleScopedClasses['progress-container']} */ ;
/** @type {__VLS_StyleScopedClasses['progress-content']} */ ;
/** @type {__VLS_StyleScopedClasses['progress-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['rotating-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['progress-info']} */ ;
/** @type {__VLS_StyleScopedClasses['progress-title']} */ ;
/** @type {__VLS_StyleScopedClasses['progress-detail']} */ ;
/** @type {__VLS_StyleScopedClasses['pulse-container']} */ ;
/** @type {__VLS_StyleScopedClasses['pulse-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['pulse-circle']} */ ;
/** @type {__VLS_StyleScopedClasses['pulse-circle']} */ ;
/** @type {__VLS_StyleScopedClasses['pulse-delay-1']} */ ;
/** @type {__VLS_StyleScopedClasses['pulse-circle']} */ ;
/** @type {__VLS_StyleScopedClasses['pulse-delay-2']} */ ;
/** @type {__VLS_StyleScopedClasses['pulse-text']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            IconLoading: IconLoading,
            gridCount: gridCount,
            progressPercent: progressPercent,
            progressColor: progressColor,
        };
    },
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
