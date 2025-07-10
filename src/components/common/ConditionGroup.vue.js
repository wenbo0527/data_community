import { computed, ref } from 'vue';
import { IconPlus, IconDown, IconRight, IconMinus } from '@arco-design/web-vue/es/icon';
const props = withDefaults(defineProps(), {
    editable: true,
    dataSourceTypeOptions: () => [
        { label: '明细数据', value: 'detail' },
        { label: '行为数据', value: 'behavior' },
        { label: '属性数据', value: 'attribute' }
    ],
    dateTypeOptions: () => [
        { label: '动态时间', value: 'dynamic' },
        { label: '固定时间', value: 'fixed' }
    ],
    dynamicUnitOptions: () => [
        { label: '天', value: 'days' },
        { label: '周', value: 'weeks' },
        { label: '月', value: 'months' }
    ],
    getFieldOptions: null,
    getAggregationOptions: null,
    getOperatorOptions: null,
    needValueInput: null,
    getValuePlaceholder: null,
    onDataSourceTypeChange: null,
    onDateTypeChange: null,
    // 标签相关默认值
    getTagOptions: null,
    getTagOperatorOptions: null,
    needTagValueInput: null,
    getTagValuePlaceholder: null,
    // 事件相关默认值
    getEventOptions: null,
    getEventPropertyOptions: null,
    getPropertyOperatorOptions: null
});
const emit = defineEmits();
// 响应式状态
const collapsedSections = ref({
    tag: false,
    behavior: false,
    detail: false
});
// 计算属性 - 按类型分组条件
const tagConditions = computed(() => {
    if (!props.group.conditions)
        return [];
    return props.group.conditions.filter(condition => condition.dataSourceType === 'attribute' || condition.dataSourceType === 'tag');
});
const behaviorConditions = computed(() => {
    if (!props.group.conditions)
        return [];
    return props.group.conditions.filter(condition => condition.dataSourceType === 'behavior' || condition.dataSourceType === 'event');
});
const detailConditions = computed(() => {
    if (!props.group.conditions)
        return [];
    return props.group.conditions.filter(condition => condition.dataSourceType !== 'attribute' &&
        condition.dataSourceType !== 'tag' &&
        condition.dataSourceType !== 'behavior' &&
        condition.dataSourceType !== 'event');
});
// 方法
const toggleSectionCollapse = (type) => {
    collapsedSections.value[type] = !collapsedSections.value[type];
};
const removeConditionByIndex = (condition) => {
    const conditionIndex = props.group.conditions.findIndex(c => c.id === condition.id || c === condition);
    if (conditionIndex !== -1) {
        emit('removeCondition', conditionIndex);
    }
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    editable: true,
    dataSourceTypeOptions: () => [
        { label: '明细数据', value: 'detail' },
        { label: '行为数据', value: 'behavior' },
        { label: '属性数据', value: 'attribute' }
    ],
    dateTypeOptions: () => [
        { label: '动态时间', value: 'dynamic' },
        { label: '固定时间', value: 'fixed' }
    ],
    dynamicUnitOptions: () => [
        { label: '天', value: 'days' },
        { label: '周', value: 'weeks' },
        { label: '月', value: 'months' }
    ],
    getFieldOptions: null,
    getAggregationOptions: null,
    getOperatorOptions: null,
    needValueInput: null,
    getValuePlaceholder: null,
    onDataSourceTypeChange: null,
    onDateTypeChange: null,
    // 标签相关默认值
    getTagOptions: null,
    getTagOperatorOptions: null,
    needTagValueInput: null,
    getTagValuePlaceholder: null,
    // 事件相关默认值
    getEventOptions: null,
    getEventPropertyOptions: null,
    getPropertyOperatorOptions: null
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['condition-group-card']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-group-card']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-group-card']} */ ;
/** @type {__VLS_StyleScopedClasses['exclude-group']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-group-card']} */ ;
/** @type {__VLS_StyleScopedClasses['exclude-group']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-group-header']} */ ;
/** @type {__VLS_StyleScopedClasses['logic-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-conditions']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-type-header']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-type-add-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['collapse-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-remove-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['add-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['remove-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['remove-property-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['form-row']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['add-condition-btn']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "condition-group-card" },
    ...{ class: ({ 'exclude-group': __VLS_ctx.group.isExclude }) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "condition-group-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "group-info" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "group-title-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "group-title" },
});
(__VLS_ctx.group.name || '条件组');
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "condition-count" },
});
(__VLS_ctx.group.conditions?.length || 0);
if (__VLS_ctx.group.isExclude) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "exclude-indicator" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "exclude-label" },
    });
}
if (__VLS_ctx.editable) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "group-actions" },
    });
    const __VLS_0 = {}.ATooltip;
    /** @type {[typeof __VLS_components.ATooltip, typeof __VLS_components.aTooltip, typeof __VLS_components.ATooltip, typeof __VLS_components.aTooltip, ]} */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        content: "切换逻辑",
    }));
    const __VLS_2 = __VLS_1({
        content: "切换逻辑",
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_3.slots.default;
    const __VLS_4 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
        ...{ class: "logic-btn" },
    }));
    const __VLS_6 = __VLS_5({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
        ...{ class: "logic-btn" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_5));
    let __VLS_8;
    let __VLS_9;
    let __VLS_10;
    const __VLS_11 = {
        onClick: (...[$event]) => {
            if (!(__VLS_ctx.editable))
                return;
            __VLS_ctx.$emit('toggleGroupLogic', __VLS_ctx.group);
        }
    };
    __VLS_7.slots.default;
    (__VLS_ctx.group.logic === 'and' ? 'AND' : 'OR');
    var __VLS_7;
    var __VLS_3;
    const __VLS_12 = {}.ATooltip;
    /** @type {[typeof __VLS_components.ATooltip, typeof __VLS_components.aTooltip, typeof __VLS_components.ATooltip, typeof __VLS_components.aTooltip, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
        content: "删除条件组",
    }));
    const __VLS_14 = __VLS_13({
        content: "删除条件组",
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    __VLS_15.slots.default;
    const __VLS_16 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
        ...{ class: "action-btn danger" },
    }));
    const __VLS_18 = __VLS_17({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
        ...{ class: "action-btn danger" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    let __VLS_20;
    let __VLS_21;
    let __VLS_22;
    const __VLS_23 = {
        onClick: (...[$event]) => {
            if (!(__VLS_ctx.editable))
                return;
            __VLS_ctx.$emit('deleteConditionGroup');
        }
    };
    __VLS_19.slots.default;
    const __VLS_24 = {}.IconMinus;
    /** @type {[typeof __VLS_components.IconMinus, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({}));
    const __VLS_26 = __VLS_25({}, ...__VLS_functionalComponentArgsRest(__VLS_25));
    var __VLS_19;
    var __VLS_15;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "condition-group-content" },
});
if (!__VLS_ctx.group.conditions || __VLS_ctx.group.conditions.length === 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "empty-conditions" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "conditions-list" },
    });
    if (__VLS_ctx.tagConditions.length > 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "condition-type-group" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ onClick: (...[$event]) => {
                    if (!!(!__VLS_ctx.group.conditions || __VLS_ctx.group.conditions.length === 0))
                        return;
                    if (!(__VLS_ctx.tagConditions.length > 0))
                        return;
                    __VLS_ctx.toggleSectionCollapse('tag');
                } },
            ...{ class: "condition-type-header" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "condition-type-header-with-actions" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "condition-type-title-section" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "condition-type-buttons" },
        });
        const __VLS_28 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
        // @ts-ignore
        const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
            ...{ 'onClick': {} },
            type: "text",
            size: "mini",
            ...{ class: "collapse-btn" },
        }));
        const __VLS_30 = __VLS_29({
            ...{ 'onClick': {} },
            type: "text",
            size: "mini",
            ...{ class: "collapse-btn" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_29));
        let __VLS_32;
        let __VLS_33;
        let __VLS_34;
        const __VLS_35 = {
            onClick: (...[$event]) => {
                if (!!(!__VLS_ctx.group.conditions || __VLS_ctx.group.conditions.length === 0))
                    return;
                if (!(__VLS_ctx.tagConditions.length > 0))
                    return;
                __VLS_ctx.toggleSectionCollapse('tag');
            }
        };
        __VLS_31.slots.default;
        if (!__VLS_ctx.collapsedSections.tag) {
            const __VLS_36 = {}.IconDown;
            /** @type {[typeof __VLS_components.IconDown, ]} */ ;
            // @ts-ignore
            const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({}));
            const __VLS_38 = __VLS_37({}, ...__VLS_functionalComponentArgsRest(__VLS_37));
        }
        else {
            const __VLS_40 = {}.IconRight;
            /** @type {[typeof __VLS_components.IconRight, ]} */ ;
            // @ts-ignore
            const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({}));
            const __VLS_42 = __VLS_41({}, ...__VLS_functionalComponentArgsRest(__VLS_41));
        }
        var __VLS_31;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "condition-type-title" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "condition-type-count" },
        });
        (__VLS_ctx.tagConditions.length);
        if (__VLS_ctx.editable) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "condition-type-actions" },
            });
            const __VLS_44 = {}.ATooltip;
            /** @type {[typeof __VLS_components.ATooltip, typeof __VLS_components.aTooltip, typeof __VLS_components.ATooltip, typeof __VLS_components.aTooltip, ]} */ ;
            // @ts-ignore
            const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
                content: "添加标签条件",
            }));
            const __VLS_46 = __VLS_45({
                content: "添加标签条件",
            }, ...__VLS_functionalComponentArgsRest(__VLS_45));
            __VLS_47.slots.default;
            const __VLS_48 = {}.AButton;
            /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
            // @ts-ignore
            const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
                ...{ 'onClick': {} },
                type: "text",
                size: "mini",
                ...{ class: "condition-type-add-btn" },
            }));
            const __VLS_50 = __VLS_49({
                ...{ 'onClick': {} },
                type: "text",
                size: "mini",
                ...{ class: "condition-type-add-btn" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_49));
            let __VLS_52;
            let __VLS_53;
            let __VLS_54;
            const __VLS_55 = {
                onClick: (...[$event]) => {
                    if (!!(!__VLS_ctx.group.conditions || __VLS_ctx.group.conditions.length === 0))
                        return;
                    if (!(__VLS_ctx.tagConditions.length > 0))
                        return;
                    if (!(__VLS_ctx.editable))
                        return;
                    __VLS_ctx.$emit('addConditionByType', 'tag');
                }
            };
            __VLS_51.slots.default;
            const __VLS_56 = {}.IconPlus;
            /** @type {[typeof __VLS_components.IconPlus, ]} */ ;
            // @ts-ignore
            const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({}));
            const __VLS_58 = __VLS_57({}, ...__VLS_functionalComponentArgsRest(__VLS_57));
            var __VLS_51;
            var __VLS_47;
        }
        if (!__VLS_ctx.collapsedSections.tag) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "condition-type-content" },
            });
            for (const [condition, conditionIndex] of __VLS_getVForSourceType((__VLS_ctx.tagConditions))) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    key: (condition.id || conditionIndex),
                    ...{ class: "condition-item-wrapper" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "condition-item-header" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "condition-item-info" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    ...{ class: "condition-index" },
                });
                (conditionIndex + 1);
                if (__VLS_ctx.editable) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "condition-item-actions" },
                    });
                    const __VLS_60 = {}.ATooltip;
                    /** @type {[typeof __VLS_components.ATooltip, typeof __VLS_components.aTooltip, typeof __VLS_components.ATooltip, typeof __VLS_components.aTooltip, ]} */ ;
                    // @ts-ignore
                    const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
                        content: "删除条件",
                    }));
                    const __VLS_62 = __VLS_61({
                        content: "删除条件",
                    }, ...__VLS_functionalComponentArgsRest(__VLS_61));
                    __VLS_63.slots.default;
                    const __VLS_64 = {}.AButton;
                    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
                    // @ts-ignore
                    const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
                        ...{ 'onClick': {} },
                        type: "text",
                        size: "mini",
                        ...{ class: "condition-remove-btn" },
                    }));
                    const __VLS_66 = __VLS_65({
                        ...{ 'onClick': {} },
                        type: "text",
                        size: "mini",
                        ...{ class: "condition-remove-btn" },
                    }, ...__VLS_functionalComponentArgsRest(__VLS_65));
                    let __VLS_68;
                    let __VLS_69;
                    let __VLS_70;
                    const __VLS_71 = {
                        onClick: (...[$event]) => {
                            if (!!(!__VLS_ctx.group.conditions || __VLS_ctx.group.conditions.length === 0))
                                return;
                            if (!(__VLS_ctx.tagConditions.length > 0))
                                return;
                            if (!(!__VLS_ctx.collapsedSections.tag))
                                return;
                            if (!(__VLS_ctx.editable))
                                return;
                            __VLS_ctx.removeConditionByIndex(condition);
                        }
                    };
                    __VLS_67.slots.default;
                    const __VLS_72 = {}.IconMinus;
                    /** @type {[typeof __VLS_components.IconMinus, ]} */ ;
                    // @ts-ignore
                    const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({}));
                    const __VLS_74 = __VLS_73({}, ...__VLS_functionalComponentArgsRest(__VLS_73));
                    var __VLS_67;
                    var __VLS_63;
                }
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "tag-condition-row" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "tag-config" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "form-group" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
                    ...{ class: "form-label" },
                });
                const __VLS_76 = {}.ASelect;
                /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
                // @ts-ignore
                const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
                    modelValue: (condition.tagPath),
                    size: "small",
                    ...{ class: "form-control" },
                    placeholder: "选择标签",
                    options: (__VLS_ctx.getTagOptions && __VLS_ctx.getTagOptions() || []),
                    allowSearch: true,
                    disabled: (!__VLS_ctx.editable),
                }));
                const __VLS_78 = __VLS_77({
                    modelValue: (condition.tagPath),
                    size: "small",
                    ...{ class: "form-control" },
                    placeholder: "选择标签",
                    options: (__VLS_ctx.getTagOptions && __VLS_ctx.getTagOptions() || []),
                    allowSearch: true,
                    disabled: (!__VLS_ctx.editable),
                }, ...__VLS_functionalComponentArgsRest(__VLS_77));
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "form-group" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
                    ...{ class: "form-label" },
                });
                const __VLS_80 = {}.ASelect;
                /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
                // @ts-ignore
                const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
                    modelValue: (condition.operator),
                    size: "small",
                    ...{ class: "form-control" },
                    options: (__VLS_ctx.getTagOperatorOptions && __VLS_ctx.getTagOperatorOptions() || []),
                    disabled: (!__VLS_ctx.editable),
                }));
                const __VLS_82 = __VLS_81({
                    modelValue: (condition.operator),
                    size: "small",
                    ...{ class: "form-control" },
                    options: (__VLS_ctx.getTagOperatorOptions && __VLS_ctx.getTagOperatorOptions() || []),
                    disabled: (!__VLS_ctx.editable),
                }, ...__VLS_functionalComponentArgsRest(__VLS_81));
                if (__VLS_ctx.needTagValueInput && __VLS_ctx.needTagValueInput(condition)) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "form-group" },
                    });
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
                        ...{ class: "form-label" },
                    });
                    const __VLS_84 = {}.AInput;
                    /** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
                    // @ts-ignore
                    const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
                        modelValue: (condition.value),
                        size: "small",
                        ...{ class: "form-control" },
                        placeholder: (__VLS_ctx.getTagValuePlaceholder && __VLS_ctx.getTagValuePlaceholder(condition) || '请输入值'),
                        disabled: (!__VLS_ctx.editable),
                    }));
                    const __VLS_86 = __VLS_85({
                        modelValue: (condition.value),
                        size: "small",
                        ...{ class: "form-control" },
                        placeholder: (__VLS_ctx.getTagValuePlaceholder && __VLS_ctx.getTagValuePlaceholder(condition) || '请输入值'),
                        disabled: (!__VLS_ctx.editable),
                    }, ...__VLS_functionalComponentArgsRest(__VLS_85));
                }
                if (__VLS_ctx.editable) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "tag-actions" },
                    });
                    const __VLS_88 = {}.ATooltip;
                    /** @type {[typeof __VLS_components.ATooltip, typeof __VLS_components.aTooltip, typeof __VLS_components.ATooltip, typeof __VLS_components.aTooltip, ]} */ ;
                    // @ts-ignore
                    const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
                        content: "添加标签条件",
                    }));
                    const __VLS_90 = __VLS_89({
                        content: "添加标签条件",
                    }, ...__VLS_functionalComponentArgsRest(__VLS_89));
                    __VLS_91.slots.default;
                    const __VLS_92 = {}.AButton;
                    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
                    // @ts-ignore
                    const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
                        ...{ 'onClick': {} },
                        type: "text",
                        size: "mini",
                        ...{ class: "tag-action-btn add-btn" },
                    }));
                    const __VLS_94 = __VLS_93({
                        ...{ 'onClick': {} },
                        type: "text",
                        size: "mini",
                        ...{ class: "tag-action-btn add-btn" },
                    }, ...__VLS_functionalComponentArgsRest(__VLS_93));
                    let __VLS_96;
                    let __VLS_97;
                    let __VLS_98;
                    const __VLS_99 = {
                        onClick: (...[$event]) => {
                            if (!!(!__VLS_ctx.group.conditions || __VLS_ctx.group.conditions.length === 0))
                                return;
                            if (!(__VLS_ctx.tagConditions.length > 0))
                                return;
                            if (!(!__VLS_ctx.collapsedSections.tag))
                                return;
                            if (!(__VLS_ctx.editable))
                                return;
                            __VLS_ctx.$emit('addConditionByType', 'tag');
                        }
                    };
                    __VLS_95.slots.default;
                    const __VLS_100 = {}.IconPlus;
                    /** @type {[typeof __VLS_components.IconPlus, ]} */ ;
                    // @ts-ignore
                    const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({}));
                    const __VLS_102 = __VLS_101({}, ...__VLS_functionalComponentArgsRest(__VLS_101));
                    var __VLS_95;
                    var __VLS_91;
                    const __VLS_104 = {}.ATooltip;
                    /** @type {[typeof __VLS_components.ATooltip, typeof __VLS_components.aTooltip, typeof __VLS_components.ATooltip, typeof __VLS_components.aTooltip, ]} */ ;
                    // @ts-ignore
                    const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({
                        content: "删除标签条件",
                    }));
                    const __VLS_106 = __VLS_105({
                        content: "删除标签条件",
                    }, ...__VLS_functionalComponentArgsRest(__VLS_105));
                    __VLS_107.slots.default;
                    const __VLS_108 = {}.AButton;
                    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
                    // @ts-ignore
                    const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({
                        ...{ 'onClick': {} },
                        type: "text",
                        size: "mini",
                        ...{ class: "tag-action-btn remove-btn" },
                    }));
                    const __VLS_110 = __VLS_109({
                        ...{ 'onClick': {} },
                        type: "text",
                        size: "mini",
                        ...{ class: "tag-action-btn remove-btn" },
                    }, ...__VLS_functionalComponentArgsRest(__VLS_109));
                    let __VLS_112;
                    let __VLS_113;
                    let __VLS_114;
                    const __VLS_115 = {
                        onClick: (...[$event]) => {
                            if (!!(!__VLS_ctx.group.conditions || __VLS_ctx.group.conditions.length === 0))
                                return;
                            if (!(__VLS_ctx.tagConditions.length > 0))
                                return;
                            if (!(!__VLS_ctx.collapsedSections.tag))
                                return;
                            if (!(__VLS_ctx.editable))
                                return;
                            __VLS_ctx.removeConditionByIndex(condition);
                        }
                    };
                    __VLS_111.slots.default;
                    const __VLS_116 = {}.IconMinus;
                    /** @type {[typeof __VLS_components.IconMinus, ]} */ ;
                    // @ts-ignore
                    const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({}));
                    const __VLS_118 = __VLS_117({}, ...__VLS_functionalComponentArgsRest(__VLS_117));
                    var __VLS_111;
                    var __VLS_107;
                }
            }
        }
    }
    if (__VLS_ctx.behaviorConditions.length > 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "condition-type-group" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ onClick: (...[$event]) => {
                    if (!!(!__VLS_ctx.group.conditions || __VLS_ctx.group.conditions.length === 0))
                        return;
                    if (!(__VLS_ctx.behaviorConditions.length > 0))
                        return;
                    __VLS_ctx.toggleSectionCollapse('behavior');
                } },
            ...{ class: "condition-type-header" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "condition-type-header-with-actions" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "condition-type-title-section" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "condition-type-buttons" },
        });
        const __VLS_120 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
        // @ts-ignore
        const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({
            ...{ 'onClick': {} },
            type: "text",
            size: "mini",
            ...{ class: "collapse-btn" },
        }));
        const __VLS_122 = __VLS_121({
            ...{ 'onClick': {} },
            type: "text",
            size: "mini",
            ...{ class: "collapse-btn" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_121));
        let __VLS_124;
        let __VLS_125;
        let __VLS_126;
        const __VLS_127 = {
            onClick: (...[$event]) => {
                if (!!(!__VLS_ctx.group.conditions || __VLS_ctx.group.conditions.length === 0))
                    return;
                if (!(__VLS_ctx.behaviorConditions.length > 0))
                    return;
                __VLS_ctx.toggleSectionCollapse('behavior');
            }
        };
        __VLS_123.slots.default;
        if (!__VLS_ctx.collapsedSections.behavior) {
            const __VLS_128 = {}.IconDown;
            /** @type {[typeof __VLS_components.IconDown, ]} */ ;
            // @ts-ignore
            const __VLS_129 = __VLS_asFunctionalComponent(__VLS_128, new __VLS_128({}));
            const __VLS_130 = __VLS_129({}, ...__VLS_functionalComponentArgsRest(__VLS_129));
        }
        else {
            const __VLS_132 = {}.IconRight;
            /** @type {[typeof __VLS_components.IconRight, ]} */ ;
            // @ts-ignore
            const __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132({}));
            const __VLS_134 = __VLS_133({}, ...__VLS_functionalComponentArgsRest(__VLS_133));
        }
        var __VLS_123;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "condition-type-title" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "condition-type-count" },
        });
        (__VLS_ctx.behaviorConditions.length);
        if (__VLS_ctx.editable) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "condition-type-actions" },
            });
            const __VLS_136 = {}.ATooltip;
            /** @type {[typeof __VLS_components.ATooltip, typeof __VLS_components.aTooltip, typeof __VLS_components.ATooltip, typeof __VLS_components.aTooltip, ]} */ ;
            // @ts-ignore
            const __VLS_137 = __VLS_asFunctionalComponent(__VLS_136, new __VLS_136({
                content: "添加行为条件",
            }));
            const __VLS_138 = __VLS_137({
                content: "添加行为条件",
            }, ...__VLS_functionalComponentArgsRest(__VLS_137));
            __VLS_139.slots.default;
            const __VLS_140 = {}.AButton;
            /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
            // @ts-ignore
            const __VLS_141 = __VLS_asFunctionalComponent(__VLS_140, new __VLS_140({
                ...{ 'onClick': {} },
                type: "text",
                size: "mini",
                ...{ class: "condition-type-add-btn" },
            }));
            const __VLS_142 = __VLS_141({
                ...{ 'onClick': {} },
                type: "text",
                size: "mini",
                ...{ class: "condition-type-add-btn" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_141));
            let __VLS_144;
            let __VLS_145;
            let __VLS_146;
            const __VLS_147 = {
                onClick: (...[$event]) => {
                    if (!!(!__VLS_ctx.group.conditions || __VLS_ctx.group.conditions.length === 0))
                        return;
                    if (!(__VLS_ctx.behaviorConditions.length > 0))
                        return;
                    if (!(__VLS_ctx.editable))
                        return;
                    __VLS_ctx.$emit('addConditionByType', 'behavior');
                }
            };
            __VLS_143.slots.default;
            const __VLS_148 = {}.IconPlus;
            /** @type {[typeof __VLS_components.IconPlus, ]} */ ;
            // @ts-ignore
            const __VLS_149 = __VLS_asFunctionalComponent(__VLS_148, new __VLS_148({}));
            const __VLS_150 = __VLS_149({}, ...__VLS_functionalComponentArgsRest(__VLS_149));
            var __VLS_143;
            var __VLS_139;
        }
        if (!__VLS_ctx.collapsedSections.behavior) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "condition-type-content" },
            });
            for (const [condition, conditionIndex] of __VLS_getVForSourceType((__VLS_ctx.behaviorConditions))) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    key: (condition.id || conditionIndex),
                    ...{ class: "condition-item-wrapper" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "condition-item-header" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "condition-item-info" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    ...{ class: "condition-index" },
                });
                (conditionIndex + 1);
                if (__VLS_ctx.editable) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "condition-item-actions" },
                    });
                    const __VLS_152 = {}.ATooltip;
                    /** @type {[typeof __VLS_components.ATooltip, typeof __VLS_components.aTooltip, typeof __VLS_components.ATooltip, typeof __VLS_components.aTooltip, ]} */ ;
                    // @ts-ignore
                    const __VLS_153 = __VLS_asFunctionalComponent(__VLS_152, new __VLS_152({
                        content: "删除条件",
                    }));
                    const __VLS_154 = __VLS_153({
                        content: "删除条件",
                    }, ...__VLS_functionalComponentArgsRest(__VLS_153));
                    __VLS_155.slots.default;
                    const __VLS_156 = {}.AButton;
                    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
                    // @ts-ignore
                    const __VLS_157 = __VLS_asFunctionalComponent(__VLS_156, new __VLS_156({
                        ...{ 'onClick': {} },
                        type: "text",
                        size: "mini",
                        ...{ class: "condition-remove-btn" },
                    }));
                    const __VLS_158 = __VLS_157({
                        ...{ 'onClick': {} },
                        type: "text",
                        size: "mini",
                        ...{ class: "condition-remove-btn" },
                    }, ...__VLS_functionalComponentArgsRest(__VLS_157));
                    let __VLS_160;
                    let __VLS_161;
                    let __VLS_162;
                    const __VLS_163 = {
                        onClick: (...[$event]) => {
                            if (!!(!__VLS_ctx.group.conditions || __VLS_ctx.group.conditions.length === 0))
                                return;
                            if (!(__VLS_ctx.behaviorConditions.length > 0))
                                return;
                            if (!(!__VLS_ctx.collapsedSections.behavior))
                                return;
                            if (!(__VLS_ctx.editable))
                                return;
                            __VLS_ctx.removeConditionByIndex(condition);
                        }
                    };
                    __VLS_159.slots.default;
                    const __VLS_164 = {}.IconMinus;
                    /** @type {[typeof __VLS_components.IconMinus, ]} */ ;
                    // @ts-ignore
                    const __VLS_165 = __VLS_asFunctionalComponent(__VLS_164, new __VLS_164({}));
                    const __VLS_166 = __VLS_165({}, ...__VLS_functionalComponentArgsRest(__VLS_165));
                    var __VLS_159;
                    var __VLS_155;
                }
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "event-config" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "form-group" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
                    ...{ class: "form-label" },
                });
                const __VLS_168 = {}.ASelect;
                /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
                // @ts-ignore
                const __VLS_169 = __VLS_asFunctionalComponent(__VLS_168, new __VLS_168({
                    modelValue: (condition.eventName),
                    size: "small",
                    ...{ class: "form-control" },
                    placeholder: "选择事件",
                    options: (__VLS_ctx.getEventOptions && __VLS_ctx.getEventOptions() || []),
                    allowSearch: true,
                    disabled: (!__VLS_ctx.editable),
                }));
                const __VLS_170 = __VLS_169({
                    modelValue: (condition.eventName),
                    size: "small",
                    ...{ class: "form-control" },
                    placeholder: "选择事件",
                    options: (__VLS_ctx.getEventOptions && __VLS_ctx.getEventOptions() || []),
                    allowSearch: true,
                    disabled: (!__VLS_ctx.editable),
                }, ...__VLS_functionalComponentArgsRest(__VLS_169));
                if (condition.eventProperties && condition.eventProperties.length > 0) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "event-properties" },
                    });
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "event-properties-header" },
                    });
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
                        ...{ class: "form-label" },
                    });
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "event-properties-list" },
                    });
                    for (const [property, propertyIndex] of __VLS_getVForSourceType((condition.eventProperties))) {
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                            key: (propertyIndex),
                            ...{ class: "event-property-item" },
                        });
                        const __VLS_172 = {}.ASelect;
                        /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
                        // @ts-ignore
                        const __VLS_173 = __VLS_asFunctionalComponent(__VLS_172, new __VLS_172({
                            modelValue: (property.name),
                            size: "small",
                            ...{ class: "property-name" },
                            placeholder: "属性名",
                            options: (__VLS_ctx.getEventPropertyOptions && condition.eventName ? __VLS_ctx.getEventPropertyOptions(condition.eventName) : []),
                            allowSearch: true,
                            disabled: (!__VLS_ctx.editable),
                        }));
                        const __VLS_174 = __VLS_173({
                            modelValue: (property.name),
                            size: "small",
                            ...{ class: "property-name" },
                            placeholder: "属性名",
                            options: (__VLS_ctx.getEventPropertyOptions && condition.eventName ? __VLS_ctx.getEventPropertyOptions(condition.eventName) : []),
                            allowSearch: true,
                            disabled: (!__VLS_ctx.editable),
                        }, ...__VLS_functionalComponentArgsRest(__VLS_173));
                        const __VLS_176 = {}.ASelect;
                        /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
                        // @ts-ignore
                        const __VLS_177 = __VLS_asFunctionalComponent(__VLS_176, new __VLS_176({
                            modelValue: (property.operator),
                            size: "small",
                            ...{ class: "property-operator" },
                            options: (__VLS_ctx.getPropertyOperatorOptions && __VLS_ctx.getPropertyOperatorOptions() || []),
                            disabled: (!__VLS_ctx.editable),
                        }));
                        const __VLS_178 = __VLS_177({
                            modelValue: (property.operator),
                            size: "small",
                            ...{ class: "property-operator" },
                            options: (__VLS_ctx.getPropertyOperatorOptions && __VLS_ctx.getPropertyOperatorOptions() || []),
                            disabled: (!__VLS_ctx.editable),
                        }, ...__VLS_functionalComponentArgsRest(__VLS_177));
                        const __VLS_180 = {}.AInput;
                        /** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
                        // @ts-ignore
                        const __VLS_181 = __VLS_asFunctionalComponent(__VLS_180, new __VLS_180({
                            modelValue: (property.value),
                            size: "small",
                            ...{ class: "property-value" },
                            placeholder: "属性值",
                            disabled: (!__VLS_ctx.editable),
                        }));
                        const __VLS_182 = __VLS_181({
                            modelValue: (property.value),
                            size: "small",
                            ...{ class: "property-value" },
                            placeholder: "属性值",
                            disabled: (!__VLS_ctx.editable),
                        }, ...__VLS_functionalComponentArgsRest(__VLS_181));
                        if (__VLS_ctx.editable) {
                            const __VLS_184 = {}.AButton;
                            /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
                            // @ts-ignore
                            const __VLS_185 = __VLS_asFunctionalComponent(__VLS_184, new __VLS_184({
                                ...{ 'onClick': {} },
                                type: "text",
                                size: "mini",
                                ...{ class: "remove-property-btn" },
                            }));
                            const __VLS_186 = __VLS_185({
                                ...{ 'onClick': {} },
                                type: "text",
                                size: "mini",
                                ...{ class: "remove-property-btn" },
                            }, ...__VLS_functionalComponentArgsRest(__VLS_185));
                            let __VLS_188;
                            let __VLS_189;
                            let __VLS_190;
                            const __VLS_191 = {
                                onClick: (...[$event]) => {
                                    if (!!(!__VLS_ctx.group.conditions || __VLS_ctx.group.conditions.length === 0))
                                        return;
                                    if (!(__VLS_ctx.behaviorConditions.length > 0))
                                        return;
                                    if (!(!__VLS_ctx.collapsedSections.behavior))
                                        return;
                                    if (!(condition.eventProperties && condition.eventProperties.length > 0))
                                        return;
                                    if (!(__VLS_ctx.editable))
                                        return;
                                    __VLS_ctx.$emit('removeEventProperty', condition, propertyIndex);
                                }
                            };
                            __VLS_187.slots.default;
                            const __VLS_192 = {}.IconMinus;
                            /** @type {[typeof __VLS_components.IconMinus, ]} */ ;
                            // @ts-ignore
                            const __VLS_193 = __VLS_asFunctionalComponent(__VLS_192, new __VLS_192({}));
                            const __VLS_194 = __VLS_193({}, ...__VLS_functionalComponentArgsRest(__VLS_193));
                            var __VLS_187;
                        }
                    }
                    if (__VLS_ctx.editable) {
                        const __VLS_196 = {}.AButton;
                        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
                        // @ts-ignore
                        const __VLS_197 = __VLS_asFunctionalComponent(__VLS_196, new __VLS_196({
                            ...{ 'onClick': {} },
                            type: "dashed",
                            size: "small",
                            ...{ class: "add-property-btn" },
                        }));
                        const __VLS_198 = __VLS_197({
                            ...{ 'onClick': {} },
                            type: "dashed",
                            size: "small",
                            ...{ class: "add-property-btn" },
                        }, ...__VLS_functionalComponentArgsRest(__VLS_197));
                        let __VLS_200;
                        let __VLS_201;
                        let __VLS_202;
                        const __VLS_203 = {
                            onClick: (...[$event]) => {
                                if (!!(!__VLS_ctx.group.conditions || __VLS_ctx.group.conditions.length === 0))
                                    return;
                                if (!(__VLS_ctx.behaviorConditions.length > 0))
                                    return;
                                if (!(!__VLS_ctx.collapsedSections.behavior))
                                    return;
                                if (!(condition.eventProperties && condition.eventProperties.length > 0))
                                    return;
                                if (!(__VLS_ctx.editable))
                                    return;
                                __VLS_ctx.$emit('addEventProperty', condition);
                            }
                        };
                        __VLS_199.slots.default;
                        {
                            const { icon: __VLS_thisSlot } = __VLS_199.slots;
                            const __VLS_204 = {}.IconPlus;
                            /** @type {[typeof __VLS_components.IconPlus, ]} */ ;
                            // @ts-ignore
                            const __VLS_205 = __VLS_asFunctionalComponent(__VLS_204, new __VLS_204({}));
                            const __VLS_206 = __VLS_205({}, ...__VLS_functionalComponentArgsRest(__VLS_205));
                        }
                        var __VLS_199;
                    }
                }
            }
        }
    }
    if (__VLS_ctx.detailConditions.length > 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "condition-type-group" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ onClick: (...[$event]) => {
                    if (!!(!__VLS_ctx.group.conditions || __VLS_ctx.group.conditions.length === 0))
                        return;
                    if (!(__VLS_ctx.detailConditions.length > 0))
                        return;
                    __VLS_ctx.toggleSectionCollapse('detail');
                } },
            ...{ class: "condition-type-header" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "condition-type-header-with-actions" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "condition-type-title-section" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "condition-type-buttons" },
        });
        const __VLS_208 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
        // @ts-ignore
        const __VLS_209 = __VLS_asFunctionalComponent(__VLS_208, new __VLS_208({
            ...{ 'onClick': {} },
            type: "text",
            size: "mini",
            ...{ class: "collapse-btn" },
        }));
        const __VLS_210 = __VLS_209({
            ...{ 'onClick': {} },
            type: "text",
            size: "mini",
            ...{ class: "collapse-btn" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_209));
        let __VLS_212;
        let __VLS_213;
        let __VLS_214;
        const __VLS_215 = {
            onClick: (...[$event]) => {
                if (!!(!__VLS_ctx.group.conditions || __VLS_ctx.group.conditions.length === 0))
                    return;
                if (!(__VLS_ctx.detailConditions.length > 0))
                    return;
                __VLS_ctx.toggleSectionCollapse('detail');
            }
        };
        __VLS_211.slots.default;
        if (!__VLS_ctx.collapsedSections.detail) {
            const __VLS_216 = {}.IconDown;
            /** @type {[typeof __VLS_components.IconDown, ]} */ ;
            // @ts-ignore
            const __VLS_217 = __VLS_asFunctionalComponent(__VLS_216, new __VLS_216({}));
            const __VLS_218 = __VLS_217({}, ...__VLS_functionalComponentArgsRest(__VLS_217));
        }
        else {
            const __VLS_220 = {}.IconRight;
            /** @type {[typeof __VLS_components.IconRight, ]} */ ;
            // @ts-ignore
            const __VLS_221 = __VLS_asFunctionalComponent(__VLS_220, new __VLS_220({}));
            const __VLS_222 = __VLS_221({}, ...__VLS_functionalComponentArgsRest(__VLS_221));
        }
        var __VLS_211;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "condition-type-title" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "condition-type-count" },
        });
        (__VLS_ctx.detailConditions.length);
        if (__VLS_ctx.editable) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "condition-type-actions" },
            });
            const __VLS_224 = {}.ATooltip;
            /** @type {[typeof __VLS_components.ATooltip, typeof __VLS_components.aTooltip, typeof __VLS_components.ATooltip, typeof __VLS_components.aTooltip, ]} */ ;
            // @ts-ignore
            const __VLS_225 = __VLS_asFunctionalComponent(__VLS_224, new __VLS_224({
                content: "添加明细数据条件",
            }));
            const __VLS_226 = __VLS_225({
                content: "添加明细数据条件",
            }, ...__VLS_functionalComponentArgsRest(__VLS_225));
            __VLS_227.slots.default;
            const __VLS_228 = {}.AButton;
            /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
            // @ts-ignore
            const __VLS_229 = __VLS_asFunctionalComponent(__VLS_228, new __VLS_228({
                ...{ 'onClick': {} },
                type: "text",
                size: "mini",
                ...{ class: "condition-type-add-btn" },
            }));
            const __VLS_230 = __VLS_229({
                ...{ 'onClick': {} },
                type: "text",
                size: "mini",
                ...{ class: "condition-type-add-btn" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_229));
            let __VLS_232;
            let __VLS_233;
            let __VLS_234;
            const __VLS_235 = {
                onClick: (...[$event]) => {
                    if (!!(!__VLS_ctx.group.conditions || __VLS_ctx.group.conditions.length === 0))
                        return;
                    if (!(__VLS_ctx.detailConditions.length > 0))
                        return;
                    if (!(__VLS_ctx.editable))
                        return;
                    __VLS_ctx.$emit('addConditionByType', 'detail');
                }
            };
            __VLS_231.slots.default;
            const __VLS_236 = {}.IconPlus;
            /** @type {[typeof __VLS_components.IconPlus, ]} */ ;
            // @ts-ignore
            const __VLS_237 = __VLS_asFunctionalComponent(__VLS_236, new __VLS_236({}));
            const __VLS_238 = __VLS_237({}, ...__VLS_functionalComponentArgsRest(__VLS_237));
            var __VLS_231;
            var __VLS_227;
        }
        if (!__VLS_ctx.collapsedSections.detail) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "condition-type-content" },
            });
            for (const [condition, conditionIndex] of __VLS_getVForSourceType((__VLS_ctx.detailConditions))) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    key: (condition.id || conditionIndex),
                    ...{ class: "condition-item-wrapper" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "condition-item-header" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "condition-item-info" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    ...{ class: "condition-index" },
                });
                (conditionIndex + 1);
                if (__VLS_ctx.editable) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "condition-item-actions" },
                    });
                    const __VLS_240 = {}.ATooltip;
                    /** @type {[typeof __VLS_components.ATooltip, typeof __VLS_components.aTooltip, typeof __VLS_components.ATooltip, typeof __VLS_components.aTooltip, ]} */ ;
                    // @ts-ignore
                    const __VLS_241 = __VLS_asFunctionalComponent(__VLS_240, new __VLS_240({
                        content: "删除条件",
                    }));
                    const __VLS_242 = __VLS_241({
                        content: "删除条件",
                    }, ...__VLS_functionalComponentArgsRest(__VLS_241));
                    __VLS_243.slots.default;
                    const __VLS_244 = {}.AButton;
                    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
                    // @ts-ignore
                    const __VLS_245 = __VLS_asFunctionalComponent(__VLS_244, new __VLS_244({
                        ...{ 'onClick': {} },
                        type: "text",
                        size: "mini",
                        ...{ class: "condition-remove-btn" },
                    }));
                    const __VLS_246 = __VLS_245({
                        ...{ 'onClick': {} },
                        type: "text",
                        size: "mini",
                        ...{ class: "condition-remove-btn" },
                    }, ...__VLS_functionalComponentArgsRest(__VLS_245));
                    let __VLS_248;
                    let __VLS_249;
                    let __VLS_250;
                    const __VLS_251 = {
                        onClick: (...[$event]) => {
                            if (!!(!__VLS_ctx.group.conditions || __VLS_ctx.group.conditions.length === 0))
                                return;
                            if (!(__VLS_ctx.detailConditions.length > 0))
                                return;
                            if (!(!__VLS_ctx.collapsedSections.detail))
                                return;
                            if (!(__VLS_ctx.editable))
                                return;
                            __VLS_ctx.removeConditionByIndex(condition);
                        }
                    };
                    __VLS_247.slots.default;
                    const __VLS_252 = {}.IconMinus;
                    /** @type {[typeof __VLS_components.IconMinus, ]} */ ;
                    // @ts-ignore
                    const __VLS_253 = __VLS_asFunctionalComponent(__VLS_252, new __VLS_252({}));
                    const __VLS_254 = __VLS_253({}, ...__VLS_functionalComponentArgsRest(__VLS_253));
                    var __VLS_247;
                    var __VLS_243;
                }
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "condition-form" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "form-row primary" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "form-group" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
                    ...{ class: "form-label" },
                });
                const __VLS_256 = {}.ASelect;
                /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
                // @ts-ignore
                const __VLS_257 = __VLS_asFunctionalComponent(__VLS_256, new __VLS_256({
                    ...{ 'onChange': {} },
                    modelValue: (condition.dataSourceType),
                    size: "small",
                    ...{ class: "form-control" },
                    options: (__VLS_ctx.dataSourceTypeOptions),
                    disabled: (!__VLS_ctx.editable),
                }));
                const __VLS_258 = __VLS_257({
                    ...{ 'onChange': {} },
                    modelValue: (condition.dataSourceType),
                    size: "small",
                    ...{ class: "form-control" },
                    options: (__VLS_ctx.dataSourceTypeOptions),
                    disabled: (!__VLS_ctx.editable),
                }, ...__VLS_functionalComponentArgsRest(__VLS_257));
                let __VLS_260;
                let __VLS_261;
                let __VLS_262;
                const __VLS_263 = {
                    onChange: (...[$event]) => {
                        if (!!(!__VLS_ctx.group.conditions || __VLS_ctx.group.conditions.length === 0))
                            return;
                        if (!(__VLS_ctx.detailConditions.length > 0))
                            return;
                        if (!(!__VLS_ctx.collapsedSections.detail))
                            return;
                        __VLS_ctx.onDataSourceTypeChange && __VLS_ctx.onDataSourceTypeChange(condition);
                    }
                };
                var __VLS_259;
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "form-group" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
                    ...{ class: "form-label" },
                });
                const __VLS_264 = {}.ASelect;
                /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
                // @ts-ignore
                const __VLS_265 = __VLS_asFunctionalComponent(__VLS_264, new __VLS_264({
                    modelValue: (condition.fieldName),
                    size: "small",
                    ...{ class: "form-control wide" },
                    placeholder: "选择字段",
                    options: (__VLS_ctx.getFieldOptions && condition.dataSourceType ? __VLS_ctx.getFieldOptions(condition.dataSourceType) : []),
                    allowSearch: true,
                    disabled: (!__VLS_ctx.editable),
                }));
                const __VLS_266 = __VLS_265({
                    modelValue: (condition.fieldName),
                    size: "small",
                    ...{ class: "form-control wide" },
                    placeholder: "选择字段",
                    options: (__VLS_ctx.getFieldOptions && condition.dataSourceType ? __VLS_ctx.getFieldOptions(condition.dataSourceType) : []),
                    allowSearch: true,
                    disabled: (!__VLS_ctx.editable),
                }, ...__VLS_functionalComponentArgsRest(__VLS_265));
                if (condition.dataSourceType === 'detail' || condition.dataSourceType === 'behavior') {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "form-group" },
                    });
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
                        ...{ class: "form-label" },
                    });
                    const __VLS_268 = {}.ASelect;
                    /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
                    // @ts-ignore
                    const __VLS_269 = __VLS_asFunctionalComponent(__VLS_268, new __VLS_268({
                        modelValue: (condition.aggregationType),
                        size: "small",
                        ...{ class: "form-control" },
                        options: (__VLS_ctx.getAggregationOptions && condition.dataSourceType ? __VLS_ctx.getAggregationOptions(condition.dataSourceType) : []),
                        disabled: (!__VLS_ctx.editable),
                    }));
                    const __VLS_270 = __VLS_269({
                        modelValue: (condition.aggregationType),
                        size: "small",
                        ...{ class: "form-control" },
                        options: (__VLS_ctx.getAggregationOptions && condition.dataSourceType ? __VLS_ctx.getAggregationOptions(condition.dataSourceType) : []),
                        disabled: (!__VLS_ctx.editable),
                    }, ...__VLS_functionalComponentArgsRest(__VLS_269));
                }
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "form-group" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
                    ...{ class: "form-label" },
                });
                const __VLS_272 = {}.ASelect;
                /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
                // @ts-ignore
                const __VLS_273 = __VLS_asFunctionalComponent(__VLS_272, new __VLS_272({
                    modelValue: (condition.operator),
                    size: "small",
                    ...{ class: "form-control" },
                    options: (__VLS_ctx.getOperatorOptions && __VLS_ctx.getOperatorOptions(condition) || []),
                    disabled: (!__VLS_ctx.editable),
                }));
                const __VLS_274 = __VLS_273({
                    modelValue: (condition.operator),
                    size: "small",
                    ...{ class: "form-control" },
                    options: (__VLS_ctx.getOperatorOptions && __VLS_ctx.getOperatorOptions(condition) || []),
                    disabled: (!__VLS_ctx.editable),
                }, ...__VLS_functionalComponentArgsRest(__VLS_273));
                if (__VLS_ctx.needValueInput && __VLS_ctx.needValueInput(condition)) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "form-group" },
                    });
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
                        ...{ class: "form-label" },
                    });
                    const __VLS_276 = {}.AInput;
                    /** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
                    // @ts-ignore
                    const __VLS_277 = __VLS_asFunctionalComponent(__VLS_276, new __VLS_276({
                        modelValue: (condition.value),
                        size: "small",
                        ...{ class: "form-control" },
                        placeholder: (__VLS_ctx.getValuePlaceholder && __VLS_ctx.getValuePlaceholder(condition) || '请输入值'),
                        disabled: (!__VLS_ctx.editable),
                    }));
                    const __VLS_278 = __VLS_277({
                        modelValue: (condition.value),
                        size: "small",
                        ...{ class: "form-control" },
                        placeholder: (__VLS_ctx.getValuePlaceholder && __VLS_ctx.getValuePlaceholder(condition) || '请输入值'),
                        disabled: (!__VLS_ctx.editable),
                    }, ...__VLS_functionalComponentArgsRest(__VLS_277));
                }
                if (condition.dataSourceType !== 'attribute') {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "form-row secondary" },
                    });
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "form-group" },
                    });
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
                        ...{ class: "form-label" },
                    });
                    const __VLS_280 = {}.ASelect;
                    /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
                    // @ts-ignore
                    const __VLS_281 = __VLS_asFunctionalComponent(__VLS_280, new __VLS_280({
                        ...{ 'onChange': {} },
                        modelValue: (condition.dateType),
                        size: "small",
                        ...{ class: "form-control" },
                        options: (__VLS_ctx.dateTypeOptions),
                        disabled: (!__VLS_ctx.editable),
                    }));
                    const __VLS_282 = __VLS_281({
                        ...{ 'onChange': {} },
                        modelValue: (condition.dateType),
                        size: "small",
                        ...{ class: "form-control" },
                        options: (__VLS_ctx.dateTypeOptions),
                        disabled: (!__VLS_ctx.editable),
                    }, ...__VLS_functionalComponentArgsRest(__VLS_281));
                    let __VLS_284;
                    let __VLS_285;
                    let __VLS_286;
                    const __VLS_287 = {
                        onChange: (...[$event]) => {
                            if (!!(!__VLS_ctx.group.conditions || __VLS_ctx.group.conditions.length === 0))
                                return;
                            if (!(__VLS_ctx.detailConditions.length > 0))
                                return;
                            if (!(!__VLS_ctx.collapsedSections.detail))
                                return;
                            if (!(condition.dataSourceType !== 'attribute'))
                                return;
                            __VLS_ctx.onDateTypeChange && __VLS_ctx.onDateTypeChange(condition);
                        }
                    };
                    var __VLS_283;
                    if (condition.dateType === 'fixed') {
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                            ...{ class: "form-group wide" },
                        });
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
                            ...{ class: "form-label" },
                        });
                        const __VLS_288 = {}.ARangePicker;
                        /** @type {[typeof __VLS_components.ARangePicker, typeof __VLS_components.aRangePicker, ]} */ ;
                        // @ts-ignore
                        const __VLS_289 = __VLS_asFunctionalComponent(__VLS_288, new __VLS_288({
                            modelValue: (condition.dateRange),
                            size: "small",
                            ...{ class: "form-control" },
                            format: "YYYY-MM-DD",
                            disabled: (!__VLS_ctx.editable),
                        }));
                        const __VLS_290 = __VLS_289({
                            modelValue: (condition.dateRange),
                            size: "small",
                            ...{ class: "form-control" },
                            format: "YYYY-MM-DD",
                            disabled: (!__VLS_ctx.editable),
                        }, ...__VLS_functionalComponentArgsRest(__VLS_289));
                    }
                    else if (condition.dateType === 'dynamic') {
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                            ...{ class: "form-group dynamic-time" },
                        });
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
                            ...{ class: "form-label" },
                        });
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                            ...{ class: "dynamic-time-inputs" },
                        });
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                            ...{ class: "dynamic-prefix" },
                        });
                        const __VLS_292 = {}.AInputNumber;
                        /** @type {[typeof __VLS_components.AInputNumber, typeof __VLS_components.aInputNumber, ]} */ ;
                        // @ts-ignore
                        const __VLS_293 = __VLS_asFunctionalComponent(__VLS_292, new __VLS_292({
                            modelValue: (condition.dynamicValue),
                            size: "small",
                            ...{ class: "dynamic-value" },
                            min: (1),
                            disabled: (!__VLS_ctx.editable),
                        }));
                        const __VLS_294 = __VLS_293({
                            modelValue: (condition.dynamicValue),
                            size: "small",
                            ...{ class: "dynamic-value" },
                            min: (1),
                            disabled: (!__VLS_ctx.editable),
                        }, ...__VLS_functionalComponentArgsRest(__VLS_293));
                        const __VLS_296 = {}.ASelect;
                        /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
                        // @ts-ignore
                        const __VLS_297 = __VLS_asFunctionalComponent(__VLS_296, new __VLS_296({
                            modelValue: (condition.dynamicUnit),
                            size: "small",
                            ...{ class: "dynamic-unit" },
                            options: (__VLS_ctx.dynamicUnitOptions),
                            disabled: (!__VLS_ctx.editable),
                        }));
                        const __VLS_298 = __VLS_297({
                            modelValue: (condition.dynamicUnit),
                            size: "small",
                            ...{ class: "dynamic-unit" },
                            options: (__VLS_ctx.dynamicUnitOptions),
                            disabled: (!__VLS_ctx.editable),
                        }, ...__VLS_functionalComponentArgsRest(__VLS_297));
                    }
                }
            }
        }
    }
}
if (__VLS_ctx.editable) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "add-condition-area" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "add-condition-buttons" },
    });
    const __VLS_300 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_301 = __VLS_asFunctionalComponent(__VLS_300, new __VLS_300({
        ...{ 'onClick': {} },
        type: "dashed",
        size: "small",
        ...{ class: "add-condition-btn" },
    }));
    const __VLS_302 = __VLS_301({
        ...{ 'onClick': {} },
        type: "dashed",
        size: "small",
        ...{ class: "add-condition-btn" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_301));
    let __VLS_304;
    let __VLS_305;
    let __VLS_306;
    const __VLS_307 = {
        onClick: (...[$event]) => {
            if (!(__VLS_ctx.editable))
                return;
            __VLS_ctx.$emit('addConditionByType', 'tag');
        }
    };
    __VLS_303.slots.default;
    {
        const { icon: __VLS_thisSlot } = __VLS_303.slots;
        const __VLS_308 = {}.IconPlus;
        /** @type {[typeof __VLS_components.IconPlus, ]} */ ;
        // @ts-ignore
        const __VLS_309 = __VLS_asFunctionalComponent(__VLS_308, new __VLS_308({}));
        const __VLS_310 = __VLS_309({}, ...__VLS_functionalComponentArgsRest(__VLS_309));
    }
    var __VLS_303;
    const __VLS_312 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_313 = __VLS_asFunctionalComponent(__VLS_312, new __VLS_312({
        ...{ 'onClick': {} },
        type: "dashed",
        size: "small",
        ...{ class: "add-condition-btn" },
    }));
    const __VLS_314 = __VLS_313({
        ...{ 'onClick': {} },
        type: "dashed",
        size: "small",
        ...{ class: "add-condition-btn" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_313));
    let __VLS_316;
    let __VLS_317;
    let __VLS_318;
    const __VLS_319 = {
        onClick: (...[$event]) => {
            if (!(__VLS_ctx.editable))
                return;
            __VLS_ctx.$emit('addConditionByType', 'behavior');
        }
    };
    __VLS_315.slots.default;
    {
        const { icon: __VLS_thisSlot } = __VLS_315.slots;
        const __VLS_320 = {}.IconPlus;
        /** @type {[typeof __VLS_components.IconPlus, ]} */ ;
        // @ts-ignore
        const __VLS_321 = __VLS_asFunctionalComponent(__VLS_320, new __VLS_320({}));
        const __VLS_322 = __VLS_321({}, ...__VLS_functionalComponentArgsRest(__VLS_321));
    }
    var __VLS_315;
    const __VLS_324 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_325 = __VLS_asFunctionalComponent(__VLS_324, new __VLS_324({
        ...{ 'onClick': {} },
        type: "dashed",
        size: "small",
        ...{ class: "add-condition-btn" },
    }));
    const __VLS_326 = __VLS_325({
        ...{ 'onClick': {} },
        type: "dashed",
        size: "small",
        ...{ class: "add-condition-btn" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_325));
    let __VLS_328;
    let __VLS_329;
    let __VLS_330;
    const __VLS_331 = {
        onClick: (...[$event]) => {
            if (!(__VLS_ctx.editable))
                return;
            __VLS_ctx.$emit('addConditionByType', 'detail');
        }
    };
    __VLS_327.slots.default;
    {
        const { icon: __VLS_thisSlot } = __VLS_327.slots;
        const __VLS_332 = {}.IconPlus;
        /** @type {[typeof __VLS_components.IconPlus, ]} */ ;
        // @ts-ignore
        const __VLS_333 = __VLS_asFunctionalComponent(__VLS_332, new __VLS_332({}));
        const __VLS_334 = __VLS_333({}, ...__VLS_functionalComponentArgsRest(__VLS_333));
    }
    var __VLS_327;
}
/** @type {__VLS_StyleScopedClasses['condition-group-card']} */ ;
/** @type {__VLS_StyleScopedClasses['exclude-group']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-group-header']} */ ;
/** @type {__VLS_StyleScopedClasses['group-info']} */ ;
/** @type {__VLS_StyleScopedClasses['group-title-section']} */ ;
/** @type {__VLS_StyleScopedClasses['group-title']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-count']} */ ;
/** @type {__VLS_StyleScopedClasses['exclude-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['exclude-label']} */ ;
/** @type {__VLS_StyleScopedClasses['group-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['logic-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['danger']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-group-content']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-conditions']} */ ;
/** @type {__VLS_StyleScopedClasses['conditions-list']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-type-group']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-type-header']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-type-header-with-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-type-title-section']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-type-buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['collapse-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-type-title']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-type-count']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-type-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-type-add-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-type-content']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-item-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-item-header']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-item-info']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-index']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-item-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-remove-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-condition-row']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-config']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-label']} */ ;
/** @type {__VLS_StyleScopedClasses['form-control']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-label']} */ ;
/** @type {__VLS_StyleScopedClasses['form-control']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-label']} */ ;
/** @type {__VLS_StyleScopedClasses['form-control']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['add-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['remove-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-type-group']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-type-header']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-type-header-with-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-type-title-section']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-type-buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['collapse-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-type-title']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-type-count']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-type-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-type-add-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-type-content']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-item-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-item-header']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-item-info']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-index']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-item-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-remove-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['event-config']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-label']} */ ;
/** @type {__VLS_StyleScopedClasses['form-control']} */ ;
/** @type {__VLS_StyleScopedClasses['event-properties']} */ ;
/** @type {__VLS_StyleScopedClasses['event-properties-header']} */ ;
/** @type {__VLS_StyleScopedClasses['form-label']} */ ;
/** @type {__VLS_StyleScopedClasses['event-properties-list']} */ ;
/** @type {__VLS_StyleScopedClasses['event-property-item']} */ ;
/** @type {__VLS_StyleScopedClasses['property-name']} */ ;
/** @type {__VLS_StyleScopedClasses['property-operator']} */ ;
/** @type {__VLS_StyleScopedClasses['property-value']} */ ;
/** @type {__VLS_StyleScopedClasses['remove-property-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['add-property-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-type-group']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-type-header']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-type-header-with-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-type-title-section']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-type-buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['collapse-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-type-title']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-type-count']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-type-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-type-add-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-type-content']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-item-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-item-header']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-item-info']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-index']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-item-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-remove-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-form']} */ ;
/** @type {__VLS_StyleScopedClasses['form-row']} */ ;
/** @type {__VLS_StyleScopedClasses['primary']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-label']} */ ;
/** @type {__VLS_StyleScopedClasses['form-control']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-label']} */ ;
/** @type {__VLS_StyleScopedClasses['form-control']} */ ;
/** @type {__VLS_StyleScopedClasses['wide']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-label']} */ ;
/** @type {__VLS_StyleScopedClasses['form-control']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-label']} */ ;
/** @type {__VLS_StyleScopedClasses['form-control']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-label']} */ ;
/** @type {__VLS_StyleScopedClasses['form-control']} */ ;
/** @type {__VLS_StyleScopedClasses['form-row']} */ ;
/** @type {__VLS_StyleScopedClasses['secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-label']} */ ;
/** @type {__VLS_StyleScopedClasses['form-control']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['wide']} */ ;
/** @type {__VLS_StyleScopedClasses['form-label']} */ ;
/** @type {__VLS_StyleScopedClasses['form-control']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['dynamic-time']} */ ;
/** @type {__VLS_StyleScopedClasses['form-label']} */ ;
/** @type {__VLS_StyleScopedClasses['dynamic-time-inputs']} */ ;
/** @type {__VLS_StyleScopedClasses['dynamic-prefix']} */ ;
/** @type {__VLS_StyleScopedClasses['dynamic-value']} */ ;
/** @type {__VLS_StyleScopedClasses['dynamic-unit']} */ ;
/** @type {__VLS_StyleScopedClasses['add-condition-area']} */ ;
/** @type {__VLS_StyleScopedClasses['add-condition-buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['add-condition-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['add-condition-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['add-condition-btn']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            IconPlus: IconPlus,
            IconDown: IconDown,
            IconRight: IconRight,
            IconMinus: IconMinus,
            collapsedSections: collapsedSections,
            tagConditions: tagConditions,
            behaviorConditions: behaviorConditions,
            detailConditions: detailConditions,
            toggleSectionCollapse: toggleSectionCollapse,
            removeConditionByIndex: removeConditionByIndex,
        };
    },
    __typeEmits: {},
    __typeProps: {},
    props: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeEmits: {},
    __typeProps: {},
    props: {},
});
; /* PartiallyEnd: #4569/main.vue */
