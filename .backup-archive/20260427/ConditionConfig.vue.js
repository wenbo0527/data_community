import { IconPlus, IconDelete, IconDown, IconRight } from '@arco-design/web-vue/es/icon';
const props = withDefaults(defineProps(), {
    crossGroupLogic: 'or',
    editable: true,
    dataSourceTypeOptions: () => [],
    dateTypeOptions: () => [],
    dynamicUnitOptions: () => [],
    getFieldOptions: () => () => [],
    getAggregationOptions: () => () => [],
    getOperatorOptions: () => () => [],
    needValueInput: () => () => true,
    getValuePlaceholder: () => () => '请输入值',
    onDataSourceTypeChange: () => () => { },
    onDateTypeChange: () => () => { }
});
const __VLS_emit = defineEmits();
// 切换条件组折叠状态
const toggleGroupCollapse = (groupIndex) => {
    const group = props.conditionGroups[groupIndex];
    if (group) {
        group.collapsed = !group.collapsed;
    }
};
// 切换条件逻辑
const toggleConditionLogic = (groupIndex, conditionIndex) => {
    const condition = props.conditionGroups[groupIndex]?.conditions[conditionIndex];
    if (condition) {
        condition.logic = condition.logic === 'and' ? 'or' : 'and';
    }
};
const __VLS_withDefaultsArg = (function (t) { return t; })({
    crossGroupLogic: 'or',
    editable: true,
    dataSourceTypeOptions: () => [],
    dateTypeOptions: () => [],
    dynamicUnitOptions: () => [],
    getFieldOptions: () => () => [],
    getAggregationOptions: () => () => [],
    getOperatorOptions: () => () => [],
    needValueInput: () => () => true,
    getValuePlaceholder: () => () => '请输入值',
    onDataSourceTypeChange: () => () => { },
    onDateTypeChange: () => () => { }
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['empty-condition-state']} */ 
/** @type {__VLS_StyleScopedClasses['logic-indicator']} */ 
/** @type {__VLS_StyleScopedClasses['condition-item']} */ 
/** @type {__VLS_StyleScopedClasses['logic-connector']} */ 
/** @type {__VLS_StyleScopedClasses['condition-row']} */ 
/** @type {__VLS_StyleScopedClasses['condition-group']} */ 
/** @type {__VLS_StyleScopedClasses['cross-group-logic']} */ 
/** @type {__VLS_StyleScopedClasses['condition-row']} */ 
/** @type {__VLS_StyleScopedClasses['group-info']} */ 
/** @type {__VLS_StyleScopedClasses['add-condition-buttons']} */ 
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "condition-config" },
});
if (__VLS_ctx.conditionGroups.length === 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "empty-condition-state" },
    });
    const __VLS_0 = {}.IconPlus;
    /** @type {[typeof __VLS_components.IconPlus, typeof __VLS_components.iconPlus, ]} */ 
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        ...{ style: {} },
    }));
    const __VLS_2 = __VLS_1({
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    const __VLS_4 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
    // @ts-ignore
    const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_6 = __VLS_5({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_5));
    let __VLS_8;
    let __VLS_9;
    let __VLS_10;
    const __VLS_11 = {
        onClick: (...[$event]) => {
            if (!(__VLS_ctx.conditionGroups.length === 0))
                return;
            __VLS_ctx.$emit('add-condition-group');
        }
    };
    __VLS_7.slots.default;
    {
        const { icon: __VLS_thisSlot } = __VLS_7.slots;
        const __VLS_12 = {}.IconPlus;
        /** @type {[typeof __VLS_components.IconPlus, typeof __VLS_components.iconPlus, ]} */ 
        // @ts-ignore
        const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({}));
        const __VLS_14 = __VLS_13({}, ...__VLS_functionalComponentArgsRest(__VLS_13));
    }
    let __VLS_7;
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "conditions-list" },
    });
    for (const [group, groupIndex] of __VLS_getVForSourceType((__VLS_ctx.conditionGroups))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (groupIndex),
            ...{ class: "condition-group" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "condition-group-header" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "group-info" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "group-title" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (groupIndex + 1);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "condition-count" },
        });
        (group.conditions.length);
        if (group.conditions.length > 1) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "group-logic" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "logic-label" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ onClick: (...[$event]) => {
                        if (__VLS_ctx.conditionGroups.length === 0)
                            return;
                        if (!(group.conditions.length > 1))
                            return;
                        __VLS_ctx.$emit('toggle-group-logic', groupIndex);
                    } },
                ...{ class: "logic-indicator" },
            });
            ((group.logic || 'and').toUpperCase());
        }
        if (__VLS_ctx.editable) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "group-actions" },
            });
            const __VLS_16 = {}.AButton;
            /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
            // @ts-ignore
            const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
                ...{ 'onClick': {} },
                type: "text",
                size: "small",
            }));
            const __VLS_18 = __VLS_17({
                ...{ 'onClick': {} },
                type: "text",
                size: "small",
            }, ...__VLS_functionalComponentArgsRest(__VLS_17));
            let __VLS_20;
            let __VLS_21;
            let __VLS_22;
            const __VLS_23 = {
                onClick: (...[$event]) => {
                    if (__VLS_ctx.conditionGroups.length === 0)
                        return;
                    if (!(__VLS_ctx.editable))
                        return;
                    __VLS_ctx.toggleGroupCollapse(groupIndex);
                }
            };
            __VLS_19.slots.default;
            {
                const { icon: __VLS_thisSlot } = __VLS_19.slots;
                if (!group.collapsed) {
                    const __VLS_24 = {}.IconDown;
                    /** @type {[typeof __VLS_components.IconDown, typeof __VLS_components.iconDown, ]} */ 
                    // @ts-ignore
                    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({}));
                    const __VLS_26 = __VLS_25({}, ...__VLS_functionalComponentArgsRest(__VLS_25));
                }
                else {
                    const __VLS_28 = {}.IconRight;
                    /** @type {[typeof __VLS_components.IconRight, typeof __VLS_components.iconRight, ]} */ 
                    // @ts-ignore
                    const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({}));
                    const __VLS_30 = __VLS_29({}, ...__VLS_functionalComponentArgsRest(__VLS_29));
                }
            }
            var __VLS_19;
            const __VLS_32 = {}.AButton;
            /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
            // @ts-ignore
            const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
                ...{ 'onClick': {} },
                type: "text",
                size: "small",
                status: "danger",
            }));
            const __VLS_34 = __VLS_33({
                ...{ 'onClick': {} },
                type: "text",
                size: "small",
                status: "danger",
            }, ...__VLS_functionalComponentArgsRest(__VLS_33));
            let __VLS_36;
            let __VLS_37;
            let __VLS_38;
            const __VLS_39 = {
                onClick: (...[$event]) => {
                    if (__VLS_ctx.conditionGroups.length === 0)
                        return;
                    if (!(__VLS_ctx.editable))
                        return;
                    __VLS_ctx.$emit('delete-condition-group', groupIndex);
                }
            };
            __VLS_35.slots.default;
            {
                const { icon: __VLS_thisSlot } = __VLS_35.slots;
                const __VLS_40 = {}.IconDelete;
                /** @type {[typeof __VLS_components.IconDelete, typeof __VLS_components.iconDelete, ]} */ 
                // @ts-ignore
                const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({}));
                const __VLS_42 = __VLS_41({}, ...__VLS_functionalComponentArgsRest(__VLS_41));
            }
            var __VLS_35;
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "condition-items" },
        });
        __VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, value: (!group.collapsed) }, null, null);
        for (const [condition, conditionIndex] of __VLS_getVForSourceType((group.conditions))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                key: (conditionIndex),
                ...{ class: "condition-item" },
            });
            if (conditionIndex > 0) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "condition-connector" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "connector-line" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ onClick: (...[$event]) => {
                            if (__VLS_ctx.conditionGroups.length === 0)
                                return;
                            if (!(conditionIndex > 0))
                                return;
                            __VLS_ctx.toggleConditionLogic(groupIndex, conditionIndex);
                        } },
                    ...{ class: "logic-connector" },
                });
                ((condition.logic || 'and').toUpperCase());
            }
            if (condition.exclude) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "exclude-indicator" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
            }
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "condition-form" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "condition-row" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "condition-group" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
                ...{ class: "condition-label" },
            });
            const __VLS_44 = {}.ASelect;
            /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ 
            // @ts-ignore
            const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
                ...{ 'onChange': {} },
                modelValue: (condition.dataSourceType),
                placeholder: "选择数据源",
                options: (__VLS_ctx.dataSourceTypeOptions),
            }));
            const __VLS_46 = __VLS_45({
                ...{ 'onChange': {} },
                modelValue: (condition.dataSourceType),
                placeholder: "选择数据源",
                options: (__VLS_ctx.dataSourceTypeOptions),
            }, ...__VLS_functionalComponentArgsRest(__VLS_45));
            let __VLS_48;
            let __VLS_49;
            let __VLS_50;
            const __VLS_51 = {
                onChange: (...[$event]) => {
                    if (__VLS_ctx.conditionGroups.length === 0)
                        return;
                    __VLS_ctx.onDataSourceTypeChange?.(groupIndex, conditionIndex, $event);
                }
            };
            var __VLS_47;
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "condition-group" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
                ...{ class: "condition-label" },
            });
            const __VLS_52 = {}.ASelect;
            /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ 
            // @ts-ignore
            const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
                modelValue: (condition.field),
                placeholder: "选择字段",
                options: (__VLS_ctx.getFieldOptions?.(condition.dataSourceType || '')),
            }));
            const __VLS_54 = __VLS_53({
                modelValue: (condition.field),
                placeholder: "选择字段",
                options: (__VLS_ctx.getFieldOptions?.(condition.dataSourceType || '')),
            }, ...__VLS_functionalComponentArgsRest(__VLS_53));
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "condition-group" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
                ...{ class: "condition-label" },
            });
            const __VLS_56 = {}.ASelect;
            /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ 
            // @ts-ignore
            const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
                modelValue: (condition.aggregation),
                placeholder: "选择聚合",
                options: (__VLS_ctx.getAggregationOptions?.(condition.field || '')),
            }));
            const __VLS_58 = __VLS_57({
                modelValue: (condition.aggregation),
                placeholder: "选择聚合",
                options: (__VLS_ctx.getAggregationOptions?.(condition.field || '')),
            }, ...__VLS_functionalComponentArgsRest(__VLS_57));
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "condition-row" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "condition-group" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
                ...{ class: "condition-label" },
            });
            const __VLS_60 = {}.ASelect;
            /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ 
            // @ts-ignore
            const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
                modelValue: (condition.operator),
                placeholder: "选择条件",
                options: (__VLS_ctx.getOperatorOptions?.(condition.field || '')),
            }));
            const __VLS_62 = __VLS_61({
                modelValue: (condition.operator),
                placeholder: "选择条件",
                options: (__VLS_ctx.getOperatorOptions?.(condition.field || '')),
            }, ...__VLS_functionalComponentArgsRest(__VLS_61));
            if (__VLS_ctx.needValueInput?.(condition.operator || '')) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "condition-group" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
                    ...{ class: "condition-label" },
                });
                const __VLS_64 = {}.AInput;
                /** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ 
                // @ts-ignore
                const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
                    modelValue: (condition.value),
                    placeholder: (__VLS_ctx.getValuePlaceholder?.(condition.field || '', condition.operator || '')),
                }));
                const __VLS_66 = __VLS_65({
                    modelValue: (condition.value),
                    placeholder: (__VLS_ctx.getValuePlaceholder?.(condition.field || '', condition.operator || '')),
                }, ...__VLS_functionalComponentArgsRest(__VLS_65));
            }
            if (condition.field?.includes('time') || condition.field?.includes('date')) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "condition-row" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "condition-group" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
                    ...{ class: "condition-label" },
                });
                const __VLS_68 = {}.ASelect;
                /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ 
                // @ts-ignore
                const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
                    ...{ 'onChange': {} },
                    modelValue: (condition.dateType),
                    options: (__VLS_ctx.dateTypeOptions),
                }));
                const __VLS_70 = __VLS_69({
                    ...{ 'onChange': {} },
                    modelValue: (condition.dateType),
                    options: (__VLS_ctx.dateTypeOptions),
                }, ...__VLS_functionalComponentArgsRest(__VLS_69));
                let __VLS_72;
                let __VLS_73;
                let __VLS_74;
                const __VLS_75 = {
                    onChange: (...[$event]) => {
                        if (__VLS_ctx.conditionGroups.length === 0)
                            return;
                        if (!(condition.field?.includes('time') || condition.field?.includes('date')))
                            return;
                        __VLS_ctx.onDateTypeChange?.(groupIndex, conditionIndex, $event);
                    }
                };
                var __VLS_71;
                if (condition.dateType === 'absolute') {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "condition-group" },
                    });
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
                        ...{ class: "condition-label" },
                    });
                    const __VLS_76 = {}.AInput;
                    /** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ 
                    // @ts-ignore
                    const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
                        modelValue: (condition.timeRange),
                        placeholder: "选择时间范围",
                    }));
                    const __VLS_78 = __VLS_77({
                        modelValue: (condition.timeRange),
                        placeholder: "选择时间范围",
                    }, ...__VLS_functionalComponentArgsRest(__VLS_77));
                }
                if (condition.dateType === 'relative') {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "condition-group" },
                    });
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
                        ...{ class: "condition-label" },
                    });
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "dynamic-time-input" },
                    });
                    const __VLS_80 = {}.AInputNumber;
                    /** @type {[typeof __VLS_components.AInputNumber, typeof __VLS_components.aInputNumber, ]} */ 
                    // @ts-ignore
                    const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
                        modelValue: (condition.dynamicValue),
                        placeholder: "数值",
                        ...{ style: {} },
                    }));
                    const __VLS_82 = __VLS_81({
                        modelValue: (condition.dynamicValue),
                        placeholder: "数值",
                        ...{ style: {} },
                    }, ...__VLS_functionalComponentArgsRest(__VLS_81));
                    const __VLS_84 = {}.ASelect;
                    /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ 
                    // @ts-ignore
                    const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
                        modelValue: (condition.dynamicUnit),
                        options: (__VLS_ctx.dynamicUnitOptions),
                        ...{ style: {} },
                    }));
                    const __VLS_86 = __VLS_85({
                        modelValue: (condition.dynamicUnit),
                        options: (__VLS_ctx.dynamicUnitOptions),
                        ...{ style: {} },
                    }, ...__VLS_functionalComponentArgsRest(__VLS_85));
                }
            }
            if (__VLS_ctx.editable) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "condition-actions" },
                });
                const __VLS_88 = {}.AButton;
                /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
                // @ts-ignore
                const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
                    ...{ 'onClick': {} },
                    type: "text",
                    size: "small",
                    status: "danger",
                }));
                const __VLS_90 = __VLS_89({
                    ...{ 'onClick': {} },
                    type: "text",
                    size: "small",
                    status: "danger",
                }, ...__VLS_functionalComponentArgsRest(__VLS_89));
                let __VLS_92;
                let __VLS_93;
                let __VLS_94;
                const __VLS_95 = {
                    onClick: (...[$event]) => {
                        if (__VLS_ctx.conditionGroups.length === 0)
                            return;
                        if (!(__VLS_ctx.editable))
                            return;
                        __VLS_ctx.$emit('remove-condition', groupIndex, conditionIndex);
                    }
                };
                __VLS_91.slots.default;
                {
                    const { icon: __VLS_thisSlot } = __VLS_91.slots;
                    const __VLS_96 = {}.IconDelete;
                    /** @type {[typeof __VLS_components.IconDelete, typeof __VLS_components.iconDelete, ]} */ 
                    // @ts-ignore
                    const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({}));
                    const __VLS_98 = __VLS_97({}, ...__VLS_functionalComponentArgsRest(__VLS_97));
                }
                var __VLS_91;
            }
        }
        if (__VLS_ctx.editable) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "add-condition-buttons" },
            });
            const __VLS_100 = {}.AButton;
            /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
            // @ts-ignore
            const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
                ...{ 'onClick': {} },
                type: "dashed",
                size: "small",
            }));
            const __VLS_102 = __VLS_101({
                ...{ 'onClick': {} },
                type: "dashed",
                size: "small",
            }, ...__VLS_functionalComponentArgsRest(__VLS_101));
            let __VLS_104;
            let __VLS_105;
            let __VLS_106;
            const __VLS_107 = {
                onClick: (...[$event]) => {
                    if (__VLS_ctx.conditionGroups.length === 0)
                        return;
                    if (!(__VLS_ctx.editable))
                        return;
                    __VLS_ctx.$emit('add-condition-by-type', groupIndex, 'property');
                }
            };
            __VLS_103.slots.default;
            {
                const { icon: __VLS_thisSlot } = __VLS_103.slots;
                const __VLS_108 = {}.IconPlus;
                /** @type {[typeof __VLS_components.IconPlus, typeof __VLS_components.iconPlus, ]} */ 
                // @ts-ignore
                const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({}));
                const __VLS_110 = __VLS_109({}, ...__VLS_functionalComponentArgsRest(__VLS_109));
            }
            var __VLS_103;
            const __VLS_112 = {}.AButton;
            /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
            // @ts-ignore
            const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({
                ...{ 'onClick': {} },
                type: "dashed",
                size: "small",
            }));
            const __VLS_114 = __VLS_113({
                ...{ 'onClick': {} },
                type: "dashed",
                size: "small",
            }, ...__VLS_functionalComponentArgsRest(__VLS_113));
            let __VLS_116;
            let __VLS_117;
            let __VLS_118;
            const __VLS_119 = {
                onClick: (...[$event]) => {
                    if (__VLS_ctx.conditionGroups.length === 0)
                        return;
                    if (!(__VLS_ctx.editable))
                        return;
                    __VLS_ctx.$emit('add-condition-by-type', groupIndex, 'behavior');
                }
            };
            __VLS_115.slots.default;
            {
                const { icon: __VLS_thisSlot } = __VLS_115.slots;
                const __VLS_120 = {}.IconPlus;
                /** @type {[typeof __VLS_components.IconPlus, typeof __VLS_components.iconPlus, ]} */ 
                // @ts-ignore
                const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({}));
                const __VLS_122 = __VLS_121({}, ...__VLS_functionalComponentArgsRest(__VLS_121));
            }
            var __VLS_115;
            const __VLS_124 = {}.AButton;
            /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
            // @ts-ignore
            const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({
                ...{ 'onClick': {} },
                type: "dashed",
                size: "small",
            }));
            const __VLS_126 = __VLS_125({
                ...{ 'onClick': {} },
                type: "dashed",
                size: "small",
            }, ...__VLS_functionalComponentArgsRest(__VLS_125));
            let __VLS_128;
            let __VLS_129;
            let __VLS_130;
            const __VLS_131 = {
                onClick: (...[$event]) => {
                    if (__VLS_ctx.conditionGroups.length === 0)
                        return;
                    if (!(__VLS_ctx.editable))
                        return;
                    __VLS_ctx.$emit('add-condition-by-type', groupIndex, 'detail');
                }
            };
            __VLS_127.slots.default;
            {
                const { icon: __VLS_thisSlot } = __VLS_127.slots;
                const __VLS_132 = {}.IconPlus;
                /** @type {[typeof __VLS_components.IconPlus, typeof __VLS_components.iconPlus, ]} */ 
                // @ts-ignore
                const __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132({}));
                const __VLS_134 = __VLS_133({}, ...__VLS_functionalComponentArgsRest(__VLS_133));
            }
            var __VLS_127;
        }
        if (groupIndex < __VLS_ctx.conditionGroups.length - 1) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "group-logic-line" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "logic-line" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ onClick: (...[$event]) => {
                        if (__VLS_ctx.conditionGroups.length === 0)
                            return;
                        if (!(groupIndex < __VLS_ctx.conditionGroups.length - 1))
                            return;
                        __VLS_ctx.$emit('toggle-cross-group-logic');
                    } },
                ...{ class: "cross-group-logic" },
            });
            ((__VLS_ctx.crossGroupLogic || 'or').toUpperCase());
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "logic-line" },
            });
        }
    }
    if (__VLS_ctx.editable) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "add-condition-group" },
        });
        const __VLS_136 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
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
            onClick: (...[$event]) => {
                if (__VLS_ctx.conditionGroups.length === 0)
                    return;
                if (!(__VLS_ctx.editable))
                    return;
                __VLS_ctx.$emit('add-condition-group');
            }
        };
        __VLS_139.slots.default;
        {
            const { icon: __VLS_thisSlot } = __VLS_139.slots;
            const __VLS_144 = {}.IconPlus;
            /** @type {[typeof __VLS_components.IconPlus, typeof __VLS_components.iconPlus, ]} */ 
            // @ts-ignore
            const __VLS_145 = __VLS_asFunctionalComponent(__VLS_144, new __VLS_144({}));
            const __VLS_146 = __VLS_145({}, ...__VLS_functionalComponentArgsRest(__VLS_145));
        }
        let __VLS_139;
    }
}
/** @type {__VLS_StyleScopedClasses['condition-config']} */ 
/** @type {__VLS_StyleScopedClasses['empty-condition-state']} */ 
/** @type {__VLS_StyleScopedClasses['conditions-list']} */ 
/** @type {__VLS_StyleScopedClasses['condition-group']} */ 
/** @type {__VLS_StyleScopedClasses['condition-group-header']} */ 
/** @type {__VLS_StyleScopedClasses['group-info']} */ 
/** @type {__VLS_StyleScopedClasses['group-title']} */ 
/** @type {__VLS_StyleScopedClasses['condition-count']} */ 
/** @type {__VLS_StyleScopedClasses['group-logic']} */ 
/** @type {__VLS_StyleScopedClasses['logic-label']} */ 
/** @type {__VLS_StyleScopedClasses['logic-indicator']} */ 
/** @type {__VLS_StyleScopedClasses['group-actions']} */ 
/** @type {__VLS_StyleScopedClasses['condition-items']} */ 
/** @type {__VLS_StyleScopedClasses['condition-item']} */ 
/** @type {__VLS_StyleScopedClasses['condition-connector']} */ 
/** @type {__VLS_StyleScopedClasses['connector-line']} */ 
/** @type {__VLS_StyleScopedClasses['logic-connector']} */ 
/** @type {__VLS_StyleScopedClasses['exclude-indicator']} */ 
/** @type {__VLS_StyleScopedClasses['condition-form']} */ 
/** @type {__VLS_StyleScopedClasses['condition-row']} */ 
/** @type {__VLS_StyleScopedClasses['condition-group']} */ 
/** @type {__VLS_StyleScopedClasses['condition-label']} */ 
/** @type {__VLS_StyleScopedClasses['condition-group']} */ 
/** @type {__VLS_StyleScopedClasses['condition-label']} */ 
/** @type {__VLS_StyleScopedClasses['condition-group']} */ 
/** @type {__VLS_StyleScopedClasses['condition-label']} */ 
/** @type {__VLS_StyleScopedClasses['condition-row']} */ 
/** @type {__VLS_StyleScopedClasses['condition-group']} */ 
/** @type {__VLS_StyleScopedClasses['condition-label']} */ 
/** @type {__VLS_StyleScopedClasses['condition-group']} */ 
/** @type {__VLS_StyleScopedClasses['condition-label']} */ 
/** @type {__VLS_StyleScopedClasses['condition-row']} */ 
/** @type {__VLS_StyleScopedClasses['condition-group']} */ 
/** @type {__VLS_StyleScopedClasses['condition-label']} */ 
/** @type {__VLS_StyleScopedClasses['condition-group']} */ 
/** @type {__VLS_StyleScopedClasses['condition-label']} */ 
/** @type {__VLS_StyleScopedClasses['condition-group']} */ 
/** @type {__VLS_StyleScopedClasses['condition-label']} */ 
/** @type {__VLS_StyleScopedClasses['dynamic-time-input']} */ 
/** @type {__VLS_StyleScopedClasses['condition-actions']} */ 
/** @type {__VLS_StyleScopedClasses['add-condition-buttons']} */ 
/** @type {__VLS_StyleScopedClasses['group-logic-line']} */ 
/** @type {__VLS_StyleScopedClasses['logic-line']} */ 
/** @type {__VLS_StyleScopedClasses['cross-group-logic']} */ 
/** @type {__VLS_StyleScopedClasses['logic-line']} */ 
/** @type {__VLS_StyleScopedClasses['add-condition-group']} */ 
let __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            IconPlus: IconPlus,
            IconDelete: IconDelete,
            IconDown: IconDown,
            IconRight: IconRight,
            toggleGroupCollapse: toggleGroupCollapse,
            toggleConditionLogic: toggleConditionLogic,
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
 /* PartiallyEnd: #4569/main.vue */
