import { IconPlus, IconDelete, IconDown } from '@arco-design/web-vue/es/icon';
const props = withDefaults(defineProps(), {
    crossGroupLogic: 'or',
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
    onDateTypeChange: null
});
const emit = defineEmits();
// 方法
const addConditionGroup = () => {
    emit('addConditionGroup');
};
const deleteConditionGroup = (groupIndex) => {
    emit('deleteConditionGroup', groupIndex);
};
const toggleGroupLogic = (group) => {
    emit('toggleGroupLogic', group);
};
const toggleCrossGroupLogic = () => {
    emit('toggleCrossGroupLogic');
};
const addConditionByType = (group, type) => {
    emit('addConditionByType', group, type);
};
const removeCondition = (group, conditionIndex) => {
    emit('removeCondition', group, conditionIndex);
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    crossGroupLogic: 'or',
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
    onDateTypeChange: null
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['empty-condition-state']} */ ;
/** @type {__VLS_StyleScopedClasses['cross-group-logic-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['cross-group-logic-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['clickable']} */ ;
/** @type {__VLS_StyleScopedClasses['cross-group-logic-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['cross-group-logic-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-group-card']} */ ;
/** @type {__VLS_StyleScopedClasses['delete-group-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['logic-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['clickable']} */ ;
/** @type {__VLS_StyleScopedClasses['logic-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['clickable']} */ ;
/** @type {__VLS_StyleScopedClasses['logic-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['and']} */ ;
/** @type {__VLS_StyleScopedClasses['logic-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['or']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-item']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-item']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-item']} */ ;
/** @type {__VLS_StyleScopedClasses['excluded']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-config']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-config']} */ ;
/** @type {__VLS_StyleScopedClasses['form-row']} */ ;
/** @type {__VLS_StyleScopedClasses['form-row']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-control']} */ ;
/** @type {__VLS_StyleScopedClasses['wide']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['add-condition-btn']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "condition-config-component" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "condition-groups-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-info" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "condition-count" },
});
(__VLS_ctx.conditionGroups.length);
if (__VLS_ctx.conditionGroups.length === 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "empty-condition-state" },
    });
    const __VLS_0 = {}.IconPlus;
    /** @type {[typeof __VLS_components.IconPlus, typeof __VLS_components.iconPlus, ]} */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        ...{ style: {} },
    }));
    const __VLS_2 = __VLS_1({
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    const __VLS_4 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
        ...{ 'onClick': {} },
        type: "primary",
        disabled: (!__VLS_ctx.editable),
    }));
    const __VLS_6 = __VLS_5({
        ...{ 'onClick': {} },
        type: "primary",
        disabled: (!__VLS_ctx.editable),
    }, ...__VLS_functionalComponentArgsRest(__VLS_5));
    let __VLS_8;
    let __VLS_9;
    let __VLS_10;
    const __VLS_11 = {
        onClick: (__VLS_ctx.addConditionGroup)
    };
    __VLS_7.slots.default;
    {
        const { icon: __VLS_thisSlot } = __VLS_7.slots;
        const __VLS_12 = {}.IconPlus;
        /** @type {[typeof __VLS_components.IconPlus, typeof __VLS_components.iconPlus, ]} */ ;
        // @ts-ignore
        const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({}));
        const __VLS_14 = __VLS_13({}, ...__VLS_functionalComponentArgsRest(__VLS_13));
    }
    var __VLS_7;
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "condition-groups-workspace" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "workspace-container" },
    });
    if (__VLS_ctx.conditionGroups.length > 1) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "vertical-logic-line" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "logic-line-vertical" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.conditionGroups.length === 0))
                        return;
                    if (!(__VLS_ctx.conditionGroups.length > 1))
                        return;
                    __VLS_ctx.editable && __VLS_ctx.toggleCrossGroupLogic();
                } },
            ...{ class: "cross-group-logic-indicator" },
            ...{ class: ({
                    'and': __VLS_ctx.crossGroupLogic === 'and',
                    'or': __VLS_ctx.crossGroupLogic === 'or',
                    'clickable': __VLS_ctx.editable
                }) },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "logic-text" },
        });
        (__VLS_ctx.crossGroupLogic === 'and' ? '且' : '或');
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "condition-groups-list" },
    });
    for (const [group, groupIndex] of __VLS_getVForSourceType((__VLS_ctx.conditionGroups))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (group.id || groupIndex),
            ...{ class: "condition-group-card" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "condition-group-header" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "group-title" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "group-name" },
        });
        (group.name || `条件组 ${groupIndex + 1}`);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "group-count" },
        });
        (group.conditions.length);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "group-actions" },
        });
        const __VLS_16 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
        // @ts-ignore
        const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
            ...{ 'onClick': {} },
            type: "text",
            size: "mini",
            ...{ class: "delete-group-btn" },
            disabled: (!__VLS_ctx.editable),
        }));
        const __VLS_18 = __VLS_17({
            ...{ 'onClick': {} },
            type: "text",
            size: "mini",
            ...{ class: "delete-group-btn" },
            disabled: (!__VLS_ctx.editable),
        }, ...__VLS_functionalComponentArgsRest(__VLS_17));
        let __VLS_20;
        let __VLS_21;
        let __VLS_22;
        const __VLS_23 = {
            onClick: (...[$event]) => {
                if (!!(__VLS_ctx.conditionGroups.length === 0))
                    return;
                __VLS_ctx.deleteConditionGroup(groupIndex);
            }
        };
        __VLS_19.slots.default;
        {
            const { icon: __VLS_thisSlot } = __VLS_19.slots;
            const __VLS_24 = {}.IconDelete;
            /** @type {[typeof __VLS_components.IconDelete, ]} */ ;
            // @ts-ignore
            const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({}));
            const __VLS_26 = __VLS_25({}, ...__VLS_functionalComponentArgsRest(__VLS_25));
        }
        var __VLS_19;
        const __VLS_28 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
        // @ts-ignore
        const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
            ...{ 'onClick': {} },
            type: "text",
            size: "mini",
        }));
        const __VLS_30 = __VLS_29({
            ...{ 'onClick': {} },
            type: "text",
            size: "mini",
        }, ...__VLS_functionalComponentArgsRest(__VLS_29));
        let __VLS_32;
        let __VLS_33;
        let __VLS_34;
        const __VLS_35 = {
            onClick: (...[$event]) => {
                if (!!(__VLS_ctx.conditionGroups.length === 0))
                    return;
                group.collapsed = !group.collapsed;
            }
        };
        __VLS_31.slots.default;
        {
            const { icon: __VLS_thisSlot } = __VLS_31.slots;
            const __VLS_36 = {}.IconDown;
            /** @type {[typeof __VLS_components.IconDown, ]} */ ;
            // @ts-ignore
            const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
                ...{ class: ({ 'rotate-180': group.collapsed }) },
            }));
            const __VLS_38 = __VLS_37({
                ...{ class: ({ 'rotate-180': group.collapsed }) },
            }, ...__VLS_functionalComponentArgsRest(__VLS_37));
        }
        var __VLS_31;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "conditions-list" },
        });
        __VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, value: (!group.collapsed) }, null, null);
        if (group.conditions.length > 1) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "group-logic-line" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "logic-line" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.conditionGroups.length === 0))
                            return;
                        if (!(group.conditions.length > 1))
                            return;
                        __VLS_ctx.editable && __VLS_ctx.toggleGroupLogic(group);
                    } },
                ...{ class: "logic-indicator" },
                ...{ class: ({
                        'and': group.logic === 'and',
                        'or': group.logic === 'or',
                        'clickable': __VLS_ctx.editable
                    }) },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "logic-text" },
            });
            (group.logic === 'and' ? '且' : '或');
        }
        for (const [condition, conditionIndex] of __VLS_getVForSourceType((group.conditions))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                key: (condition.id || conditionIndex),
                ...{ class: "condition-item" },
                ...{ class: ({ 'excluded': condition.isExclude }) },
            });
            if (condition.dataSourceType !== 'attribute') {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "condition-connector" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "condition-dot" },
                });
            }
            else {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "condition-connector attribute-spacer" },
                });
            }
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "condition-config" },
            });
            if (condition.isExclude) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "exclude-indicator" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    ...{ class: "exclude-label" },
                });
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
            const __VLS_40 = {}.ASelect;
            /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
            // @ts-ignore
            const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
                ...{ 'onChange': {} },
                modelValue: (condition.dataSourceType),
                size: "small",
                ...{ class: "form-control" },
                options: (__VLS_ctx.dataSourceTypeOptions),
                disabled: (!__VLS_ctx.editable),
            }));
            const __VLS_42 = __VLS_41({
                ...{ 'onChange': {} },
                modelValue: (condition.dataSourceType),
                size: "small",
                ...{ class: "form-control" },
                options: (__VLS_ctx.dataSourceTypeOptions),
                disabled: (!__VLS_ctx.editable),
            }, ...__VLS_functionalComponentArgsRest(__VLS_41));
            let __VLS_44;
            let __VLS_45;
            let __VLS_46;
            const __VLS_47 = {
                onChange: (...[$event]) => {
                    if (!!(__VLS_ctx.conditionGroups.length === 0))
                        return;
                    __VLS_ctx.onDataSourceTypeChange && __VLS_ctx.onDataSourceTypeChange(condition);
                }
            };
            var __VLS_43;
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "form-group" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
                ...{ class: "form-label" },
            });
            const __VLS_48 = {}.ASelect;
            /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
            // @ts-ignore
            const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
                modelValue: (condition.fieldName),
                size: "small",
                ...{ class: "form-control wide" },
                placeholder: "选择字段",
                options: (__VLS_ctx.getFieldOptions && condition.dataSourceType ? __VLS_ctx.getFieldOptions(condition.dataSourceType) : []),
                allowSearch: true,
                disabled: (!__VLS_ctx.editable),
            }));
            const __VLS_50 = __VLS_49({
                modelValue: (condition.fieldName),
                size: "small",
                ...{ class: "form-control wide" },
                placeholder: "选择字段",
                options: (__VLS_ctx.getFieldOptions && condition.dataSourceType ? __VLS_ctx.getFieldOptions(condition.dataSourceType) : []),
                allowSearch: true,
                disabled: (!__VLS_ctx.editable),
            }, ...__VLS_functionalComponentArgsRest(__VLS_49));
            if (condition.dataSourceType === 'detail' || condition.dataSourceType === 'behavior') {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "form-group" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
                    ...{ class: "form-label" },
                });
                const __VLS_52 = {}.ASelect;
                /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
                // @ts-ignore
                const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
                    modelValue: (condition.aggregationType),
                    size: "small",
                    ...{ class: "form-control" },
                    options: (__VLS_ctx.getAggregationOptions && condition.dataSourceType ? __VLS_ctx.getAggregationOptions(condition.dataSourceType) : []),
                    disabled: (!__VLS_ctx.editable),
                }));
                const __VLS_54 = __VLS_53({
                    modelValue: (condition.aggregationType),
                    size: "small",
                    ...{ class: "form-control" },
                    options: (__VLS_ctx.getAggregationOptions && condition.dataSourceType ? __VLS_ctx.getAggregationOptions(condition.dataSourceType) : []),
                    disabled: (!__VLS_ctx.editable),
                }, ...__VLS_functionalComponentArgsRest(__VLS_53));
            }
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "form-group" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
                ...{ class: "form-label" },
            });
            const __VLS_56 = {}.ASelect;
            /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
            // @ts-ignore
            const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
                modelValue: (condition.operator),
                size: "small",
                ...{ class: "form-control" },
                options: (__VLS_ctx.getOperatorOptions && __VLS_ctx.getOperatorOptions(condition) || []),
                disabled: (!__VLS_ctx.editable),
            }));
            const __VLS_58 = __VLS_57({
                modelValue: (condition.operator),
                size: "small",
                ...{ class: "form-control" },
                options: (__VLS_ctx.getOperatorOptions && __VLS_ctx.getOperatorOptions(condition) || []),
                disabled: (!__VLS_ctx.editable),
            }, ...__VLS_functionalComponentArgsRest(__VLS_57));
            if (__VLS_ctx.needValueInput && __VLS_ctx.needValueInput(condition)) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "form-group" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
                    ...{ class: "form-label" },
                });
                const __VLS_60 = {}.AInput;
                /** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
                // @ts-ignore
                const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
                    modelValue: (condition.value),
                    size: "small",
                    ...{ class: "form-control" },
                    placeholder: (__VLS_ctx.getValuePlaceholder && __VLS_ctx.getValuePlaceholder(condition) || '请输入值'),
                    disabled: (!__VLS_ctx.editable),
                }));
                const __VLS_62 = __VLS_61({
                    modelValue: (condition.value),
                    size: "small",
                    ...{ class: "form-control" },
                    placeholder: (__VLS_ctx.getValuePlaceholder && __VLS_ctx.getValuePlaceholder(condition) || '请输入值'),
                    disabled: (!__VLS_ctx.editable),
                }, ...__VLS_functionalComponentArgsRest(__VLS_61));
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
                const __VLS_64 = {}.ASelect;
                /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
                // @ts-ignore
                const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
                    ...{ 'onChange': {} },
                    modelValue: (condition.dateType),
                    size: "small",
                    ...{ class: "form-control" },
                    options: (__VLS_ctx.dateTypeOptions),
                    disabled: (!__VLS_ctx.editable),
                }));
                const __VLS_66 = __VLS_65({
                    ...{ 'onChange': {} },
                    modelValue: (condition.dateType),
                    size: "small",
                    ...{ class: "form-control" },
                    options: (__VLS_ctx.dateTypeOptions),
                    disabled: (!__VLS_ctx.editable),
                }, ...__VLS_functionalComponentArgsRest(__VLS_65));
                let __VLS_68;
                let __VLS_69;
                let __VLS_70;
                const __VLS_71 = {
                    onChange: (...[$event]) => {
                        if (!!(__VLS_ctx.conditionGroups.length === 0))
                            return;
                        if (!(condition.dataSourceType !== 'attribute'))
                            return;
                        __VLS_ctx.onDateTypeChange && __VLS_ctx.onDateTypeChange(condition);
                    }
                };
                var __VLS_67;
                if (condition.dateType === 'fixed') {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "form-group wide" },
                    });
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
                        ...{ class: "form-label" },
                    });
                    const __VLS_72 = {}.ARangePicker;
                    /** @type {[typeof __VLS_components.ARangePicker, typeof __VLS_components.aRangePicker, ]} */ ;
                    // @ts-ignore
                    const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
                        modelValue: (condition.dateRange),
                        size: "small",
                        ...{ class: "form-control" },
                        format: "YYYY-MM-DD",
                        disabled: (!__VLS_ctx.editable),
                    }));
                    const __VLS_74 = __VLS_73({
                        modelValue: (condition.dateRange),
                        size: "small",
                        ...{ class: "form-control" },
                        format: "YYYY-MM-DD",
                        disabled: (!__VLS_ctx.editable),
                    }, ...__VLS_functionalComponentArgsRest(__VLS_73));
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
                    const __VLS_76 = {}.AInputNumber;
                    /** @type {[typeof __VLS_components.AInputNumber, typeof __VLS_components.aInputNumber, ]} */ ;
                    // @ts-ignore
                    const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
                        modelValue: (condition.dynamicValue),
                        size: "small",
                        ...{ class: "dynamic-value" },
                        min: (1),
                        disabled: (!__VLS_ctx.editable),
                    }));
                    const __VLS_78 = __VLS_77({
                        modelValue: (condition.dynamicValue),
                        size: "small",
                        ...{ class: "dynamic-value" },
                        min: (1),
                        disabled: (!__VLS_ctx.editable),
                    }, ...__VLS_functionalComponentArgsRest(__VLS_77));
                    const __VLS_80 = {}.ASelect;
                    /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
                    // @ts-ignore
                    const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
                        modelValue: (condition.dynamicUnit),
                        size: "small",
                        ...{ class: "dynamic-unit" },
                        options: (__VLS_ctx.dynamicUnitOptions),
                        disabled: (!__VLS_ctx.editable),
                    }));
                    const __VLS_82 = __VLS_81({
                        modelValue: (condition.dynamicUnit),
                        size: "small",
                        ...{ class: "dynamic-unit" },
                        options: (__VLS_ctx.dynamicUnitOptions),
                        disabled: (!__VLS_ctx.editable),
                    }, ...__VLS_functionalComponentArgsRest(__VLS_81));
                }
            }
            if (__VLS_ctx.editable) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "condition-actions" },
                });
                const __VLS_84 = {}.ATooltip;
                /** @type {[typeof __VLS_components.ATooltip, typeof __VLS_components.aTooltip, typeof __VLS_components.ATooltip, typeof __VLS_components.aTooltip, ]} */ ;
                // @ts-ignore
                const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
                    content: "删除条件",
                }));
                const __VLS_86 = __VLS_85({
                    content: "删除条件",
                }, ...__VLS_functionalComponentArgsRest(__VLS_85));
                __VLS_87.slots.default;
                const __VLS_88 = {}.AButton;
                /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
                // @ts-ignore
                const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
                    ...{ 'onClick': {} },
                    type: "text",
                    size: "small",
                    ...{ class: "action-btn danger" },
                }));
                const __VLS_90 = __VLS_89({
                    ...{ 'onClick': {} },
                    type: "text",
                    size: "small",
                    ...{ class: "action-btn danger" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_89));
                let __VLS_92;
                let __VLS_93;
                let __VLS_94;
                const __VLS_95 = {
                    onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.conditionGroups.length === 0))
                            return;
                        if (!(__VLS_ctx.editable))
                            return;
                        __VLS_ctx.removeCondition(group, conditionIndex);
                    }
                };
                __VLS_91.slots.default;
                const __VLS_96 = {}.IconDelete;
                /** @type {[typeof __VLS_components.IconDelete, ]} */ ;
                // @ts-ignore
                const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({}));
                const __VLS_98 = __VLS_97({}, ...__VLS_functionalComponentArgsRest(__VLS_97));
                var __VLS_91;
                var __VLS_87;
            }
        }
        if (__VLS_ctx.editable) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "add-condition-area" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "add-condition-buttons" },
            });
            const __VLS_100 = {}.AButton;
            /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
            // @ts-ignore
            const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
                ...{ 'onClick': {} },
                type: "dashed",
                size: "small",
                ...{ class: "add-condition-btn" },
            }));
            const __VLS_102 = __VLS_101({
                ...{ 'onClick': {} },
                type: "dashed",
                size: "small",
                ...{ class: "add-condition-btn" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_101));
            let __VLS_104;
            let __VLS_105;
            let __VLS_106;
            const __VLS_107 = {
                onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.conditionGroups.length === 0))
                        return;
                    if (!(__VLS_ctx.editable))
                        return;
                    __VLS_ctx.addConditionByType(group, 'tag');
                }
            };
            __VLS_103.slots.default;
            {
                const { icon: __VLS_thisSlot } = __VLS_103.slots;
                const __VLS_108 = {}.IconPlus;
                /** @type {[typeof __VLS_components.IconPlus, ]} */ ;
                // @ts-ignore
                const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({}));
                const __VLS_110 = __VLS_109({}, ...__VLS_functionalComponentArgsRest(__VLS_109));
            }
            var __VLS_103;
            const __VLS_112 = {}.AButton;
            /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
            // @ts-ignore
            const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({
                ...{ 'onClick': {} },
                type: "dashed",
                size: "small",
                ...{ class: "add-condition-btn" },
            }));
            const __VLS_114 = __VLS_113({
                ...{ 'onClick': {} },
                type: "dashed",
                size: "small",
                ...{ class: "add-condition-btn" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_113));
            let __VLS_116;
            let __VLS_117;
            let __VLS_118;
            const __VLS_119 = {
                onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.conditionGroups.length === 0))
                        return;
                    if (!(__VLS_ctx.editable))
                        return;
                    __VLS_ctx.addConditionByType(group, 'behavior');
                }
            };
            __VLS_115.slots.default;
            {
                const { icon: __VLS_thisSlot } = __VLS_115.slots;
                const __VLS_120 = {}.IconPlus;
                /** @type {[typeof __VLS_components.IconPlus, ]} */ ;
                // @ts-ignore
                const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({}));
                const __VLS_122 = __VLS_121({}, ...__VLS_functionalComponentArgsRest(__VLS_121));
            }
            var __VLS_115;
            const __VLS_124 = {}.AButton;
            /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
            // @ts-ignore
            const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({
                ...{ 'onClick': {} },
                type: "dashed",
                size: "small",
                ...{ class: "add-condition-btn" },
            }));
            const __VLS_126 = __VLS_125({
                ...{ 'onClick': {} },
                type: "dashed",
                size: "small",
                ...{ class: "add-condition-btn" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_125));
            let __VLS_128;
            let __VLS_129;
            let __VLS_130;
            const __VLS_131 = {
                onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.conditionGroups.length === 0))
                        return;
                    if (!(__VLS_ctx.editable))
                        return;
                    __VLS_ctx.addConditionByType(group, 'detail');
                }
            };
            __VLS_127.slots.default;
            {
                const { icon: __VLS_thisSlot } = __VLS_127.slots;
                const __VLS_132 = {}.IconPlus;
                /** @type {[typeof __VLS_components.IconPlus, ]} */ ;
                // @ts-ignore
                const __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132({}));
                const __VLS_134 = __VLS_133({}, ...__VLS_functionalComponentArgsRest(__VLS_133));
            }
            var __VLS_127;
        }
    }
    if (__VLS_ctx.editable) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "add-condition-group-area" },
        });
        const __VLS_136 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
        // @ts-ignore
        const __VLS_137 = __VLS_asFunctionalComponent(__VLS_136, new __VLS_136({
            ...{ 'onClick': {} },
            type: "dashed",
            ...{ style: {} },
        }));
        const __VLS_138 = __VLS_137({
            ...{ 'onClick': {} },
            type: "dashed",
            ...{ style: {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_137));
        let __VLS_140;
        let __VLS_141;
        let __VLS_142;
        const __VLS_143 = {
            onClick: (__VLS_ctx.addConditionGroup)
        };
        __VLS_139.slots.default;
        {
            const { icon: __VLS_thisSlot } = __VLS_139.slots;
            const __VLS_144 = {}.IconPlus;
            /** @type {[typeof __VLS_components.IconPlus, ]} */ ;
            // @ts-ignore
            const __VLS_145 = __VLS_asFunctionalComponent(__VLS_144, new __VLS_144({}));
            const __VLS_146 = __VLS_145({}, ...__VLS_functionalComponentArgsRest(__VLS_145));
        }
        var __VLS_139;
    }
}
/** @type {__VLS_StyleScopedClasses['condition-config-component']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-groups-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['section-info']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-count']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-condition-state']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-groups-workspace']} */ ;
/** @type {__VLS_StyleScopedClasses['workspace-container']} */ ;
/** @type {__VLS_StyleScopedClasses['vertical-logic-line']} */ ;
/** @type {__VLS_StyleScopedClasses['logic-line-vertical']} */ ;
/** @type {__VLS_StyleScopedClasses['cross-group-logic-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['and']} */ ;
/** @type {__VLS_StyleScopedClasses['or']} */ ;
/** @type {__VLS_StyleScopedClasses['clickable']} */ ;
/** @type {__VLS_StyleScopedClasses['logic-text']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-groups-list']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-group-card']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-group-header']} */ ;
/** @type {__VLS_StyleScopedClasses['group-title']} */ ;
/** @type {__VLS_StyleScopedClasses['group-name']} */ ;
/** @type {__VLS_StyleScopedClasses['group-count']} */ ;
/** @type {__VLS_StyleScopedClasses['group-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['delete-group-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['rotate-180']} */ ;
/** @type {__VLS_StyleScopedClasses['conditions-list']} */ ;
/** @type {__VLS_StyleScopedClasses['group-logic-line']} */ ;
/** @type {__VLS_StyleScopedClasses['logic-line']} */ ;
/** @type {__VLS_StyleScopedClasses['logic-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['and']} */ ;
/** @type {__VLS_StyleScopedClasses['or']} */ ;
/** @type {__VLS_StyleScopedClasses['clickable']} */ ;
/** @type {__VLS_StyleScopedClasses['logic-text']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-item']} */ ;
/** @type {__VLS_StyleScopedClasses['excluded']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-connector']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-connector']} */ ;
/** @type {__VLS_StyleScopedClasses['attribute-spacer']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-config']} */ ;
/** @type {__VLS_StyleScopedClasses['exclude-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['exclude-label']} */ ;
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
/** @type {__VLS_StyleScopedClasses['condition-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['danger']} */ ;
/** @type {__VLS_StyleScopedClasses['add-condition-area']} */ ;
/** @type {__VLS_StyleScopedClasses['add-condition-buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['add-condition-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['add-condition-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['add-condition-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['add-condition-group-area']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            IconPlus: IconPlus,
            IconDelete: IconDelete,
            IconDown: IconDown,
            addConditionGroup: addConditionGroup,
            deleteConditionGroup: deleteConditionGroup,
            toggleGroupLogic: toggleGroupLogic,
            toggleCrossGroupLogic: toggleCrossGroupLogic,
            addConditionByType: addConditionByType,
            removeCondition: removeCondition,
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
