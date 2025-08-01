import { computed, ref, nextTick } from 'vue';
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
// 条件组名称编辑相关方法
const startEditGroupName = (group) => {
    if (!props.editable)
        return;
    group.isEditingName = true;
    group.editingName = group.name || '';
    // 使用 nextTick 确保输入框已渲染
    nextTick(() => {
        const input = document.querySelector('.group-name-input input');
        if (input) {
            input.focus();
            input.select();
        }
    });
};
const saveGroupName = (group) => {
    if (group.editingName && group.editingName.trim()) {
        emit('updateGroupName', group, group.editingName.trim());
    }
    group.isEditingName = false;
    group.editingName = '';
};
const cancelEditGroupName = (group) => {
    group.isEditingName = false;
    group.editingName = '';
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
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "group-name-wrapper" },
});
if (!__VLS_ctx.group.isEditingName) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ onDblclick: (...[$event]) => {
                if (!(!__VLS_ctx.group.isEditingName))
                    return;
                __VLS_ctx.editable && __VLS_ctx.startEditGroupName(__VLS_ctx.group);
            } },
        ...{ class: "group-title" },
        ...{ class: ({ 'editable': __VLS_ctx.editable }) },
        title: (__VLS_ctx.editable ? '双击编辑名称' : ''),
    });
    (__VLS_ctx.group.name || '条件组');
}
else {
    const __VLS_0 = {}.AInput;
    /** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        ...{ 'onBlur': {} },
        ...{ 'onKeyup': {} },
        ...{ 'onKeyup': {} },
        modelValue: (__VLS_ctx.group.editingName),
        size: "small",
        ...{ class: "group-name-input" },
        ref: "groupNameInput",
    }));
    const __VLS_2 = __VLS_1({
        ...{ 'onBlur': {} },
        ...{ 'onKeyup': {} },
        ...{ 'onKeyup': {} },
        modelValue: (__VLS_ctx.group.editingName),
        size: "small",
        ...{ class: "group-name-input" },
        ref: "groupNameInput",
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    let __VLS_4;
    let __VLS_5;
    let __VLS_6;
    const __VLS_7 = {
        onBlur: (...[$event]) => {
            if (!!(!__VLS_ctx.group.isEditingName))
                return;
            __VLS_ctx.saveGroupName(__VLS_ctx.group);
        }
    };
    const __VLS_8 = {
        onKeyup: (...[$event]) => {
            if (!!(!__VLS_ctx.group.isEditingName))
                return;
            __VLS_ctx.saveGroupName(__VLS_ctx.group);
        }
    };
    const __VLS_9 = {
        onKeyup: (...[$event]) => {
            if (!!(!__VLS_ctx.group.isEditingName))
                return;
            __VLS_ctx.cancelEditGroupName(__VLS_ctx.group);
        }
    };
    /** @type {typeof __VLS_ctx.groupNameInput} */ ;
    var __VLS_10 = {};
    var __VLS_3;
}
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
    const __VLS_12 = {}.ATooltip;
    /** @type {[typeof __VLS_components.ATooltip, typeof __VLS_components.aTooltip, typeof __VLS_components.ATooltip, typeof __VLS_components.aTooltip, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
        content: "切换逻辑",
    }));
    const __VLS_14 = __VLS_13({
        content: "切换逻辑",
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    __VLS_15.slots.default;
    const __VLS_16 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
        ...{ class: "logic-btn" },
    }));
    const __VLS_18 = __VLS_17({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
        ...{ class: "logic-btn" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    let __VLS_20;
    let __VLS_21;
    let __VLS_22;
    const __VLS_23 = {
        onClick: (...[$event]) => {
            if (!(__VLS_ctx.editable))
                return;
            __VLS_ctx.$emit('toggleGroupLogic', __VLS_ctx.group);
        }
    };
    __VLS_19.slots.default;
    (__VLS_ctx.group.logic === 'and' ? 'AND' : 'OR');
    var __VLS_19;
    var __VLS_15;
    const __VLS_24 = {}.ATooltip;
    /** @type {[typeof __VLS_components.ATooltip, typeof __VLS_components.aTooltip, typeof __VLS_components.ATooltip, typeof __VLS_components.aTooltip, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
        content: "删除条件组",
    }));
    const __VLS_26 = __VLS_25({
        content: "删除条件组",
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    __VLS_27.slots.default;
    const __VLS_28 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
        ...{ class: "action-btn danger" },
    }));
    const __VLS_30 = __VLS_29({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
        ...{ class: "action-btn danger" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_29));
    let __VLS_32;
    let __VLS_33;
    let __VLS_34;
    const __VLS_35 = {
        onClick: (...[$event]) => {
            if (!(__VLS_ctx.editable))
                return;
            __VLS_ctx.$emit('deleteConditionGroup');
        }
    };
    __VLS_31.slots.default;
    const __VLS_36 = {}.IconMinus;
    /** @type {[typeof __VLS_components.IconMinus, ]} */ ;
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({}));
    const __VLS_38 = __VLS_37({}, ...__VLS_functionalComponentArgsRest(__VLS_37));
    var __VLS_31;
    var __VLS_27;
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
        const __VLS_40 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
        // @ts-ignore
        const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
            ...{ 'onClick': {} },
            type: "text",
            size: "mini",
            ...{ class: "collapse-btn" },
        }));
        const __VLS_42 = __VLS_41({
            ...{ 'onClick': {} },
            type: "text",
            size: "mini",
            ...{ class: "collapse-btn" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_41));
        let __VLS_44;
        let __VLS_45;
        let __VLS_46;
        const __VLS_47 = {
            onClick: (...[$event]) => {
                if (!!(!__VLS_ctx.group.conditions || __VLS_ctx.group.conditions.length === 0))
                    return;
                if (!(__VLS_ctx.tagConditions.length > 0))
                    return;
                __VLS_ctx.toggleSectionCollapse('tag');
            }
        };
        __VLS_43.slots.default;
        if (!__VLS_ctx.collapsedSections.tag) {
            const __VLS_48 = {}.IconDown;
            /** @type {[typeof __VLS_components.IconDown, ]} */ ;
            // @ts-ignore
            const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({}));
            const __VLS_50 = __VLS_49({}, ...__VLS_functionalComponentArgsRest(__VLS_49));
        }
        else {
            const __VLS_52 = {}.IconRight;
            /** @type {[typeof __VLS_components.IconRight, ]} */ ;
            // @ts-ignore
            const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({}));
            const __VLS_54 = __VLS_53({}, ...__VLS_functionalComponentArgsRest(__VLS_53));
        }
        var __VLS_43;
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
            const __VLS_56 = {}.ATooltip;
            /** @type {[typeof __VLS_components.ATooltip, typeof __VLS_components.aTooltip, typeof __VLS_components.ATooltip, typeof __VLS_components.aTooltip, ]} */ ;
            // @ts-ignore
            const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
                content: "添加标签条件",
            }));
            const __VLS_58 = __VLS_57({
                content: "添加标签条件",
            }, ...__VLS_functionalComponentArgsRest(__VLS_57));
            __VLS_59.slots.default;
            const __VLS_60 = {}.AButton;
            /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
            // @ts-ignore
            const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
                ...{ 'onClick': {} },
                type: "text",
                size: "mini",
                ...{ class: "condition-type-add-btn" },
            }));
            const __VLS_62 = __VLS_61({
                ...{ 'onClick': {} },
                type: "text",
                size: "mini",
                ...{ class: "condition-type-add-btn" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_61));
            let __VLS_64;
            let __VLS_65;
            let __VLS_66;
            const __VLS_67 = {
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
            __VLS_63.slots.default;
            const __VLS_68 = {}.IconPlus;
            /** @type {[typeof __VLS_components.IconPlus, ]} */ ;
            // @ts-ignore
            const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({}));
            const __VLS_70 = __VLS_69({}, ...__VLS_functionalComponentArgsRest(__VLS_69));
            var __VLS_63;
            var __VLS_59;
        }
        if (!__VLS_ctx.collapsedSections.tag) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "condition-type-content" },
            });
            for (const [condition, conditionIndex] of __VLS_getVForSourceType((__VLS_ctx.tagConditions))) {
                (condition.id || conditionIndex);
                if (conditionIndex > 0) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "condition-logic-connector" },
                    });
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "logic-line" },
                    });
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                        ...{ class: "logic-text" },
                    });
                    (__VLS_ctx.group.logic === 'and' ? '且' : '或');
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "logic-line" },
                    });
                }
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
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
                    const __VLS_72 = {}.ATooltip;
                    /** @type {[typeof __VLS_components.ATooltip, typeof __VLS_components.aTooltip, typeof __VLS_components.ATooltip, typeof __VLS_components.aTooltip, ]} */ ;
                    // @ts-ignore
                    const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
                        content: "删除条件",
                    }));
                    const __VLS_74 = __VLS_73({
                        content: "删除条件",
                    }, ...__VLS_functionalComponentArgsRest(__VLS_73));
                    __VLS_75.slots.default;
                    const __VLS_76 = {}.AButton;
                    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
                    // @ts-ignore
                    const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
                        ...{ 'onClick': {} },
                        type: "text",
                        size: "mini",
                        ...{ class: "condition-remove-btn" },
                    }));
                    const __VLS_78 = __VLS_77({
                        ...{ 'onClick': {} },
                        type: "text",
                        size: "mini",
                        ...{ class: "condition-remove-btn" },
                    }, ...__VLS_functionalComponentArgsRest(__VLS_77));
                    let __VLS_80;
                    let __VLS_81;
                    let __VLS_82;
                    const __VLS_83 = {
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
                    __VLS_79.slots.default;
                    const __VLS_84 = {}.IconMinus;
                    /** @type {[typeof __VLS_components.IconMinus, ]} */ ;
                    // @ts-ignore
                    const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({}));
                    const __VLS_86 = __VLS_85({}, ...__VLS_functionalComponentArgsRest(__VLS_85));
                    var __VLS_79;
                    var __VLS_75;
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
                const __VLS_88 = {}.ASelect;
                /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
                // @ts-ignore
                const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
                    modelValue: (condition.tagPath),
                    size: "small",
                    ...{ class: "form-control" },
                    placeholder: "选择标签",
                    options: (__VLS_ctx.getTagOptions && __VLS_ctx.getTagOptions() || []),
                    allowSearch: true,
                    disabled: (!__VLS_ctx.editable),
                }));
                const __VLS_90 = __VLS_89({
                    modelValue: (condition.tagPath),
                    size: "small",
                    ...{ class: "form-control" },
                    placeholder: "选择标签",
                    options: (__VLS_ctx.getTagOptions && __VLS_ctx.getTagOptions() || []),
                    allowSearch: true,
                    disabled: (!__VLS_ctx.editable),
                }, ...__VLS_functionalComponentArgsRest(__VLS_89));
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "form-group" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
                    ...{ class: "form-label" },
                });
                const __VLS_92 = {}.ASelect;
                /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
                // @ts-ignore
                const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
                    modelValue: (condition.operator),
                    size: "small",
                    ...{ class: "form-control" },
                    options: (__VLS_ctx.getTagOperatorOptions && __VLS_ctx.getTagOperatorOptions() || []),
                    disabled: (!__VLS_ctx.editable),
                }));
                const __VLS_94 = __VLS_93({
                    modelValue: (condition.operator),
                    size: "small",
                    ...{ class: "form-control" },
                    options: (__VLS_ctx.getTagOperatorOptions && __VLS_ctx.getTagOperatorOptions() || []),
                    disabled: (!__VLS_ctx.editable),
                }, ...__VLS_functionalComponentArgsRest(__VLS_93));
                if (__VLS_ctx.needTagValueInput && __VLS_ctx.needTagValueInput(condition)) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "form-group" },
                    });
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
                        ...{ class: "form-label" },
                    });
                    const __VLS_96 = {}.AInput;
                    /** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
                    // @ts-ignore
                    const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
                        modelValue: (condition.value),
                        size: "small",
                        ...{ class: "form-control" },
                        placeholder: (__VLS_ctx.getTagValuePlaceholder && __VLS_ctx.getTagValuePlaceholder(condition) || '请输入值'),
                        disabled: (!__VLS_ctx.editable),
                    }));
                    const __VLS_98 = __VLS_97({
                        modelValue: (condition.value),
                        size: "small",
                        ...{ class: "form-control" },
                        placeholder: (__VLS_ctx.getTagValuePlaceholder && __VLS_ctx.getTagValuePlaceholder(condition) || '请输入值'),
                        disabled: (!__VLS_ctx.editable),
                    }, ...__VLS_functionalComponentArgsRest(__VLS_97));
                }
                if (__VLS_ctx.editable) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "tag-actions" },
                    });
                    const __VLS_100 = {}.ATooltip;
                    /** @type {[typeof __VLS_components.ATooltip, typeof __VLS_components.aTooltip, typeof __VLS_components.ATooltip, typeof __VLS_components.aTooltip, ]} */ ;
                    // @ts-ignore
                    const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
                        content: "添加标签条件",
                    }));
                    const __VLS_102 = __VLS_101({
                        content: "添加标签条件",
                    }, ...__VLS_functionalComponentArgsRest(__VLS_101));
                    __VLS_103.slots.default;
                    const __VLS_104 = {}.AButton;
                    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
                    // @ts-ignore
                    const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({
                        ...{ 'onClick': {} },
                        type: "text",
                        size: "mini",
                        ...{ class: "tag-action-btn add-btn" },
                    }));
                    const __VLS_106 = __VLS_105({
                        ...{ 'onClick': {} },
                        type: "text",
                        size: "mini",
                        ...{ class: "tag-action-btn add-btn" },
                    }, ...__VLS_functionalComponentArgsRest(__VLS_105));
                    let __VLS_108;
                    let __VLS_109;
                    let __VLS_110;
                    const __VLS_111 = {
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
                    __VLS_107.slots.default;
                    const __VLS_112 = {}.IconPlus;
                    /** @type {[typeof __VLS_components.IconPlus, ]} */ ;
                    // @ts-ignore
                    const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({}));
                    const __VLS_114 = __VLS_113({}, ...__VLS_functionalComponentArgsRest(__VLS_113));
                    var __VLS_107;
                    var __VLS_103;
                    const __VLS_116 = {}.ATooltip;
                    /** @type {[typeof __VLS_components.ATooltip, typeof __VLS_components.aTooltip, typeof __VLS_components.ATooltip, typeof __VLS_components.aTooltip, ]} */ ;
                    // @ts-ignore
                    const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({
                        content: "删除标签条件",
                    }));
                    const __VLS_118 = __VLS_117({
                        content: "删除标签条件",
                    }, ...__VLS_functionalComponentArgsRest(__VLS_117));
                    __VLS_119.slots.default;
                    const __VLS_120 = {}.AButton;
                    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
                    // @ts-ignore
                    const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({
                        ...{ 'onClick': {} },
                        type: "text",
                        size: "mini",
                        ...{ class: "tag-action-btn remove-btn" },
                    }));
                    const __VLS_122 = __VLS_121({
                        ...{ 'onClick': {} },
                        type: "text",
                        size: "mini",
                        ...{ class: "tag-action-btn remove-btn" },
                    }, ...__VLS_functionalComponentArgsRest(__VLS_121));
                    let __VLS_124;
                    let __VLS_125;
                    let __VLS_126;
                    const __VLS_127 = {
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
                    __VLS_123.slots.default;
                    const __VLS_128 = {}.IconMinus;
                    /** @type {[typeof __VLS_components.IconMinus, ]} */ ;
                    // @ts-ignore
                    const __VLS_129 = __VLS_asFunctionalComponent(__VLS_128, new __VLS_128({}));
                    const __VLS_130 = __VLS_129({}, ...__VLS_functionalComponentArgsRest(__VLS_129));
                    var __VLS_123;
                    var __VLS_119;
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
        const __VLS_132 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
        // @ts-ignore
        const __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132({
            ...{ 'onClick': {} },
            type: "text",
            size: "mini",
            ...{ class: "collapse-btn" },
        }));
        const __VLS_134 = __VLS_133({
            ...{ 'onClick': {} },
            type: "text",
            size: "mini",
            ...{ class: "collapse-btn" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_133));
        let __VLS_136;
        let __VLS_137;
        let __VLS_138;
        const __VLS_139 = {
            onClick: (...[$event]) => {
                if (!!(!__VLS_ctx.group.conditions || __VLS_ctx.group.conditions.length === 0))
                    return;
                if (!(__VLS_ctx.behaviorConditions.length > 0))
                    return;
                __VLS_ctx.toggleSectionCollapse('behavior');
            }
        };
        __VLS_135.slots.default;
        if (!__VLS_ctx.collapsedSections.behavior) {
            const __VLS_140 = {}.IconDown;
            /** @type {[typeof __VLS_components.IconDown, ]} */ ;
            // @ts-ignore
            const __VLS_141 = __VLS_asFunctionalComponent(__VLS_140, new __VLS_140({}));
            const __VLS_142 = __VLS_141({}, ...__VLS_functionalComponentArgsRest(__VLS_141));
        }
        else {
            const __VLS_144 = {}.IconRight;
            /** @type {[typeof __VLS_components.IconRight, ]} */ ;
            // @ts-ignore
            const __VLS_145 = __VLS_asFunctionalComponent(__VLS_144, new __VLS_144({}));
            const __VLS_146 = __VLS_145({}, ...__VLS_functionalComponentArgsRest(__VLS_145));
        }
        var __VLS_135;
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
            const __VLS_148 = {}.ATooltip;
            /** @type {[typeof __VLS_components.ATooltip, typeof __VLS_components.aTooltip, typeof __VLS_components.ATooltip, typeof __VLS_components.aTooltip, ]} */ ;
            // @ts-ignore
            const __VLS_149 = __VLS_asFunctionalComponent(__VLS_148, new __VLS_148({
                content: "添加行为条件",
            }));
            const __VLS_150 = __VLS_149({
                content: "添加行为条件",
            }, ...__VLS_functionalComponentArgsRest(__VLS_149));
            __VLS_151.slots.default;
            const __VLS_152 = {}.AButton;
            /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
            // @ts-ignore
            const __VLS_153 = __VLS_asFunctionalComponent(__VLS_152, new __VLS_152({
                ...{ 'onClick': {} },
                type: "text",
                size: "mini",
                ...{ class: "condition-type-add-btn" },
            }));
            const __VLS_154 = __VLS_153({
                ...{ 'onClick': {} },
                type: "text",
                size: "mini",
                ...{ class: "condition-type-add-btn" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_153));
            let __VLS_156;
            let __VLS_157;
            let __VLS_158;
            const __VLS_159 = {
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
            __VLS_155.slots.default;
            const __VLS_160 = {}.IconPlus;
            /** @type {[typeof __VLS_components.IconPlus, ]} */ ;
            // @ts-ignore
            const __VLS_161 = __VLS_asFunctionalComponent(__VLS_160, new __VLS_160({}));
            const __VLS_162 = __VLS_161({}, ...__VLS_functionalComponentArgsRest(__VLS_161));
            var __VLS_155;
            var __VLS_151;
        }
        if (!__VLS_ctx.collapsedSections.behavior) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "condition-type-content" },
            });
            for (const [condition, conditionIndex] of __VLS_getVForSourceType((__VLS_ctx.behaviorConditions))) {
                (condition.id || conditionIndex);
                if (conditionIndex > 0) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "condition-logic-connector" },
                    });
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "logic-line" },
                    });
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                        ...{ class: "logic-text" },
                    });
                    (__VLS_ctx.group.logic === 'and' ? '且' : '或');
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "logic-line" },
                    });
                }
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
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
                    const __VLS_164 = {}.ATooltip;
                    /** @type {[typeof __VLS_components.ATooltip, typeof __VLS_components.aTooltip, typeof __VLS_components.ATooltip, typeof __VLS_components.aTooltip, ]} */ ;
                    // @ts-ignore
                    const __VLS_165 = __VLS_asFunctionalComponent(__VLS_164, new __VLS_164({
                        content: "删除条件",
                    }));
                    const __VLS_166 = __VLS_165({
                        content: "删除条件",
                    }, ...__VLS_functionalComponentArgsRest(__VLS_165));
                    __VLS_167.slots.default;
                    const __VLS_168 = {}.AButton;
                    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
                    // @ts-ignore
                    const __VLS_169 = __VLS_asFunctionalComponent(__VLS_168, new __VLS_168({
                        ...{ 'onClick': {} },
                        type: "text",
                        size: "mini",
                        ...{ class: "condition-remove-btn" },
                    }));
                    const __VLS_170 = __VLS_169({
                        ...{ 'onClick': {} },
                        type: "text",
                        size: "mini",
                        ...{ class: "condition-remove-btn" },
                    }, ...__VLS_functionalComponentArgsRest(__VLS_169));
                    let __VLS_172;
                    let __VLS_173;
                    let __VLS_174;
                    const __VLS_175 = {
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
                    __VLS_171.slots.default;
                    const __VLS_176 = {}.IconMinus;
                    /** @type {[typeof __VLS_components.IconMinus, ]} */ ;
                    // @ts-ignore
                    const __VLS_177 = __VLS_asFunctionalComponent(__VLS_176, new __VLS_176({}));
                    const __VLS_178 = __VLS_177({}, ...__VLS_functionalComponentArgsRest(__VLS_177));
                    var __VLS_171;
                    var __VLS_167;
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
                const __VLS_180 = {}.ASelect;
                /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
                // @ts-ignore
                const __VLS_181 = __VLS_asFunctionalComponent(__VLS_180, new __VLS_180({
                    modelValue: (condition.eventName),
                    size: "small",
                    ...{ class: "form-control" },
                    placeholder: "选择事件",
                    options: (__VLS_ctx.getEventOptions && __VLS_ctx.getEventOptions() || []),
                    allowSearch: true,
                    disabled: (!__VLS_ctx.editable),
                }));
                const __VLS_182 = __VLS_181({
                    modelValue: (condition.eventName),
                    size: "small",
                    ...{ class: "form-control" },
                    placeholder: "选择事件",
                    options: (__VLS_ctx.getEventOptions && __VLS_ctx.getEventOptions() || []),
                    allowSearch: true,
                    disabled: (!__VLS_ctx.editable),
                }, ...__VLS_functionalComponentArgsRest(__VLS_181));
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
                        const __VLS_184 = {}.ASelect;
                        /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
                        // @ts-ignore
                        const __VLS_185 = __VLS_asFunctionalComponent(__VLS_184, new __VLS_184({
                            modelValue: (property.name),
                            size: "small",
                            ...{ class: "property-name" },
                            placeholder: "属性名",
                            options: (__VLS_ctx.getEventPropertyOptions && condition.eventName ? __VLS_ctx.getEventPropertyOptions(condition.eventName) : []),
                            allowSearch: true,
                            disabled: (!__VLS_ctx.editable),
                        }));
                        const __VLS_186 = __VLS_185({
                            modelValue: (property.name),
                            size: "small",
                            ...{ class: "property-name" },
                            placeholder: "属性名",
                            options: (__VLS_ctx.getEventPropertyOptions && condition.eventName ? __VLS_ctx.getEventPropertyOptions(condition.eventName) : []),
                            allowSearch: true,
                            disabled: (!__VLS_ctx.editable),
                        }, ...__VLS_functionalComponentArgsRest(__VLS_185));
                        const __VLS_188 = {}.ASelect;
                        /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
                        // @ts-ignore
                        const __VLS_189 = __VLS_asFunctionalComponent(__VLS_188, new __VLS_188({
                            modelValue: (property.operator),
                            size: "small",
                            ...{ class: "property-operator" },
                            options: (__VLS_ctx.getPropertyOperatorOptions && __VLS_ctx.getPropertyOperatorOptions() || []),
                            disabled: (!__VLS_ctx.editable),
                        }));
                        const __VLS_190 = __VLS_189({
                            modelValue: (property.operator),
                            size: "small",
                            ...{ class: "property-operator" },
                            options: (__VLS_ctx.getPropertyOperatorOptions && __VLS_ctx.getPropertyOperatorOptions() || []),
                            disabled: (!__VLS_ctx.editable),
                        }, ...__VLS_functionalComponentArgsRest(__VLS_189));
                        const __VLS_192 = {}.AInput;
                        /** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
                        // @ts-ignore
                        const __VLS_193 = __VLS_asFunctionalComponent(__VLS_192, new __VLS_192({
                            modelValue: (property.value),
                            size: "small",
                            ...{ class: "property-value" },
                            placeholder: "属性值",
                            disabled: (!__VLS_ctx.editable),
                        }));
                        const __VLS_194 = __VLS_193({
                            modelValue: (property.value),
                            size: "small",
                            ...{ class: "property-value" },
                            placeholder: "属性值",
                            disabled: (!__VLS_ctx.editable),
                        }, ...__VLS_functionalComponentArgsRest(__VLS_193));
                        if (__VLS_ctx.editable) {
                            const __VLS_196 = {}.AButton;
                            /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
                            // @ts-ignore
                            const __VLS_197 = __VLS_asFunctionalComponent(__VLS_196, new __VLS_196({
                                ...{ 'onClick': {} },
                                type: "text",
                                size: "mini",
                                ...{ class: "remove-property-btn" },
                            }));
                            const __VLS_198 = __VLS_197({
                                ...{ 'onClick': {} },
                                type: "text",
                                size: "mini",
                                ...{ class: "remove-property-btn" },
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
                                    __VLS_ctx.$emit('removeEventProperty', condition, propertyIndex);
                                }
                            };
                            __VLS_199.slots.default;
                            const __VLS_204 = {}.IconMinus;
                            /** @type {[typeof __VLS_components.IconMinus, ]} */ ;
                            // @ts-ignore
                            const __VLS_205 = __VLS_asFunctionalComponent(__VLS_204, new __VLS_204({}));
                            const __VLS_206 = __VLS_205({}, ...__VLS_functionalComponentArgsRest(__VLS_205));
                            var __VLS_199;
                        }
                    }
                    if (__VLS_ctx.editable) {
                        const __VLS_208 = {}.AButton;
                        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
                        // @ts-ignore
                        const __VLS_209 = __VLS_asFunctionalComponent(__VLS_208, new __VLS_208({
                            ...{ 'onClick': {} },
                            type: "dashed",
                            size: "small",
                            ...{ class: "add-property-btn" },
                        }));
                        const __VLS_210 = __VLS_209({
                            ...{ 'onClick': {} },
                            type: "dashed",
                            size: "small",
                            ...{ class: "add-property-btn" },
                        }, ...__VLS_functionalComponentArgsRest(__VLS_209));
                        let __VLS_212;
                        let __VLS_213;
                        let __VLS_214;
                        const __VLS_215 = {
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
                        __VLS_211.slots.default;
                        {
                            const { icon: __VLS_thisSlot } = __VLS_211.slots;
                            const __VLS_216 = {}.IconPlus;
                            /** @type {[typeof __VLS_components.IconPlus, ]} */ ;
                            // @ts-ignore
                            const __VLS_217 = __VLS_asFunctionalComponent(__VLS_216, new __VLS_216({}));
                            const __VLS_218 = __VLS_217({}, ...__VLS_functionalComponentArgsRest(__VLS_217));
                        }
                        var __VLS_211;
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
        const __VLS_220 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
        // @ts-ignore
        const __VLS_221 = __VLS_asFunctionalComponent(__VLS_220, new __VLS_220({
            ...{ 'onClick': {} },
            type: "text",
            size: "mini",
            ...{ class: "collapse-btn" },
        }));
        const __VLS_222 = __VLS_221({
            ...{ 'onClick': {} },
            type: "text",
            size: "mini",
            ...{ class: "collapse-btn" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_221));
        let __VLS_224;
        let __VLS_225;
        let __VLS_226;
        const __VLS_227 = {
            onClick: (...[$event]) => {
                if (!!(!__VLS_ctx.group.conditions || __VLS_ctx.group.conditions.length === 0))
                    return;
                if (!(__VLS_ctx.detailConditions.length > 0))
                    return;
                __VLS_ctx.toggleSectionCollapse('detail');
            }
        };
        __VLS_223.slots.default;
        if (!__VLS_ctx.collapsedSections.detail) {
            const __VLS_228 = {}.IconDown;
            /** @type {[typeof __VLS_components.IconDown, ]} */ ;
            // @ts-ignore
            const __VLS_229 = __VLS_asFunctionalComponent(__VLS_228, new __VLS_228({}));
            const __VLS_230 = __VLS_229({}, ...__VLS_functionalComponentArgsRest(__VLS_229));
        }
        else {
            const __VLS_232 = {}.IconRight;
            /** @type {[typeof __VLS_components.IconRight, ]} */ ;
            // @ts-ignore
            const __VLS_233 = __VLS_asFunctionalComponent(__VLS_232, new __VLS_232({}));
            const __VLS_234 = __VLS_233({}, ...__VLS_functionalComponentArgsRest(__VLS_233));
        }
        var __VLS_223;
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
            const __VLS_236 = {}.ATooltip;
            /** @type {[typeof __VLS_components.ATooltip, typeof __VLS_components.aTooltip, typeof __VLS_components.ATooltip, typeof __VLS_components.aTooltip, ]} */ ;
            // @ts-ignore
            const __VLS_237 = __VLS_asFunctionalComponent(__VLS_236, new __VLS_236({
                content: "添加明细数据条件",
            }));
            const __VLS_238 = __VLS_237({
                content: "添加明细数据条件",
            }, ...__VLS_functionalComponentArgsRest(__VLS_237));
            __VLS_239.slots.default;
            const __VLS_240 = {}.AButton;
            /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
            // @ts-ignore
            const __VLS_241 = __VLS_asFunctionalComponent(__VLS_240, new __VLS_240({
                ...{ 'onClick': {} },
                type: "text",
                size: "mini",
                ...{ class: "condition-type-add-btn" },
            }));
            const __VLS_242 = __VLS_241({
                ...{ 'onClick': {} },
                type: "text",
                size: "mini",
                ...{ class: "condition-type-add-btn" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_241));
            let __VLS_244;
            let __VLS_245;
            let __VLS_246;
            const __VLS_247 = {
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
            __VLS_243.slots.default;
            const __VLS_248 = {}.IconPlus;
            /** @type {[typeof __VLS_components.IconPlus, ]} */ ;
            // @ts-ignore
            const __VLS_249 = __VLS_asFunctionalComponent(__VLS_248, new __VLS_248({}));
            const __VLS_250 = __VLS_249({}, ...__VLS_functionalComponentArgsRest(__VLS_249));
            var __VLS_243;
            var __VLS_239;
        }
        if (!__VLS_ctx.collapsedSections.detail) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "condition-type-content" },
            });
            for (const [condition, conditionIndex] of __VLS_getVForSourceType((__VLS_ctx.detailConditions))) {
                (condition.id || conditionIndex);
                if (conditionIndex > 0) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "condition-logic-connector" },
                    });
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "logic-line" },
                    });
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                        ...{ class: "logic-text" },
                    });
                    (__VLS_ctx.group.logic === 'and' ? '且' : '或');
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "logic-line" },
                    });
                }
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
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
                    const __VLS_252 = {}.ATooltip;
                    /** @type {[typeof __VLS_components.ATooltip, typeof __VLS_components.aTooltip, typeof __VLS_components.ATooltip, typeof __VLS_components.aTooltip, ]} */ ;
                    // @ts-ignore
                    const __VLS_253 = __VLS_asFunctionalComponent(__VLS_252, new __VLS_252({
                        content: "删除条件",
                    }));
                    const __VLS_254 = __VLS_253({
                        content: "删除条件",
                    }, ...__VLS_functionalComponentArgsRest(__VLS_253));
                    __VLS_255.slots.default;
                    const __VLS_256 = {}.AButton;
                    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
                    // @ts-ignore
                    const __VLS_257 = __VLS_asFunctionalComponent(__VLS_256, new __VLS_256({
                        ...{ 'onClick': {} },
                        type: "text",
                        size: "mini",
                        ...{ class: "condition-remove-btn" },
                    }));
                    const __VLS_258 = __VLS_257({
                        ...{ 'onClick': {} },
                        type: "text",
                        size: "mini",
                        ...{ class: "condition-remove-btn" },
                    }, ...__VLS_functionalComponentArgsRest(__VLS_257));
                    let __VLS_260;
                    let __VLS_261;
                    let __VLS_262;
                    const __VLS_263 = {
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
                    __VLS_259.slots.default;
                    const __VLS_264 = {}.IconMinus;
                    /** @type {[typeof __VLS_components.IconMinus, ]} */ ;
                    // @ts-ignore
                    const __VLS_265 = __VLS_asFunctionalComponent(__VLS_264, new __VLS_264({}));
                    const __VLS_266 = __VLS_265({}, ...__VLS_functionalComponentArgsRest(__VLS_265));
                    var __VLS_259;
                    var __VLS_255;
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
                const __VLS_268 = {}.ASelect;
                /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
                // @ts-ignore
                const __VLS_269 = __VLS_asFunctionalComponent(__VLS_268, new __VLS_268({
                    ...{ 'onChange': {} },
                    modelValue: (condition.dataSourceType),
                    size: "small",
                    ...{ class: "form-control" },
                    options: (__VLS_ctx.dataSourceTypeOptions),
                    disabled: (!__VLS_ctx.editable),
                }));
                const __VLS_270 = __VLS_269({
                    ...{ 'onChange': {} },
                    modelValue: (condition.dataSourceType),
                    size: "small",
                    ...{ class: "form-control" },
                    options: (__VLS_ctx.dataSourceTypeOptions),
                    disabled: (!__VLS_ctx.editable),
                }, ...__VLS_functionalComponentArgsRest(__VLS_269));
                let __VLS_272;
                let __VLS_273;
                let __VLS_274;
                const __VLS_275 = {
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
                var __VLS_271;
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "form-group" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
                    ...{ class: "form-label" },
                });
                const __VLS_276 = {}.ASelect;
                /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
                // @ts-ignore
                const __VLS_277 = __VLS_asFunctionalComponent(__VLS_276, new __VLS_276({
                    modelValue: (condition.fieldName),
                    size: "small",
                    ...{ class: "form-control wide" },
                    placeholder: "选择字段",
                    options: (__VLS_ctx.getFieldOptions && condition.dataSourceType ? __VLS_ctx.getFieldOptions(condition.dataSourceType) : []),
                    allowSearch: true,
                    disabled: (!__VLS_ctx.editable),
                }));
                const __VLS_278 = __VLS_277({
                    modelValue: (condition.fieldName),
                    size: "small",
                    ...{ class: "form-control wide" },
                    placeholder: "选择字段",
                    options: (__VLS_ctx.getFieldOptions && condition.dataSourceType ? __VLS_ctx.getFieldOptions(condition.dataSourceType) : []),
                    allowSearch: true,
                    disabled: (!__VLS_ctx.editable),
                }, ...__VLS_functionalComponentArgsRest(__VLS_277));
                if (condition.dataSourceType === 'detail' || condition.dataSourceType === 'behavior') {
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
                        modelValue: (condition.aggregationType),
                        size: "small",
                        ...{ class: "form-control" },
                        options: (__VLS_ctx.getAggregationOptions && condition.dataSourceType ? __VLS_ctx.getAggregationOptions(condition.dataSourceType) : []),
                        disabled: (!__VLS_ctx.editable),
                    }));
                    const __VLS_282 = __VLS_281({
                        modelValue: (condition.aggregationType),
                        size: "small",
                        ...{ class: "form-control" },
                        options: (__VLS_ctx.getAggregationOptions && condition.dataSourceType ? __VLS_ctx.getAggregationOptions(condition.dataSourceType) : []),
                        disabled: (!__VLS_ctx.editable),
                    }, ...__VLS_functionalComponentArgsRest(__VLS_281));
                }
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "form-group" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
                    ...{ class: "form-label" },
                });
                const __VLS_284 = {}.ASelect;
                /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
                // @ts-ignore
                const __VLS_285 = __VLS_asFunctionalComponent(__VLS_284, new __VLS_284({
                    modelValue: (condition.operator),
                    size: "small",
                    ...{ class: "form-control" },
                    options: (__VLS_ctx.getOperatorOptions && __VLS_ctx.getOperatorOptions(condition) || []),
                    disabled: (!__VLS_ctx.editable),
                }));
                const __VLS_286 = __VLS_285({
                    modelValue: (condition.operator),
                    size: "small",
                    ...{ class: "form-control" },
                    options: (__VLS_ctx.getOperatorOptions && __VLS_ctx.getOperatorOptions(condition) || []),
                    disabled: (!__VLS_ctx.editable),
                }, ...__VLS_functionalComponentArgsRest(__VLS_285));
                if (__VLS_ctx.needValueInput && __VLS_ctx.needValueInput(condition)) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "form-group" },
                    });
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
                        ...{ class: "form-label" },
                    });
                    const __VLS_288 = {}.AInput;
                    /** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
                    // @ts-ignore
                    const __VLS_289 = __VLS_asFunctionalComponent(__VLS_288, new __VLS_288({
                        modelValue: (condition.value),
                        size: "small",
                        ...{ class: "form-control" },
                        placeholder: (__VLS_ctx.getValuePlaceholder && __VLS_ctx.getValuePlaceholder(condition) || '请输入值'),
                        disabled: (!__VLS_ctx.editable),
                    }));
                    const __VLS_290 = __VLS_289({
                        modelValue: (condition.value),
                        size: "small",
                        ...{ class: "form-control" },
                        placeholder: (__VLS_ctx.getValuePlaceholder && __VLS_ctx.getValuePlaceholder(condition) || '请输入值'),
                        disabled: (!__VLS_ctx.editable),
                    }, ...__VLS_functionalComponentArgsRest(__VLS_289));
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
                    const __VLS_292 = {}.ASelect;
                    /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
                    // @ts-ignore
                    const __VLS_293 = __VLS_asFunctionalComponent(__VLS_292, new __VLS_292({
                        ...{ 'onChange': {} },
                        modelValue: (condition.dateType),
                        size: "small",
                        ...{ class: "form-control" },
                        options: (__VLS_ctx.dateTypeOptions),
                        disabled: (!__VLS_ctx.editable),
                    }));
                    const __VLS_294 = __VLS_293({
                        ...{ 'onChange': {} },
                        modelValue: (condition.dateType),
                        size: "small",
                        ...{ class: "form-control" },
                        options: (__VLS_ctx.dateTypeOptions),
                        disabled: (!__VLS_ctx.editable),
                    }, ...__VLS_functionalComponentArgsRest(__VLS_293));
                    let __VLS_296;
                    let __VLS_297;
                    let __VLS_298;
                    const __VLS_299 = {
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
                    var __VLS_295;
                    if (condition.dateType === 'fixed') {
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                            ...{ class: "form-group wide" },
                        });
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
                            ...{ class: "form-label" },
                        });
                        const __VLS_300 = {}.ARangePicker;
                        /** @type {[typeof __VLS_components.ARangePicker, typeof __VLS_components.aRangePicker, ]} */ ;
                        // @ts-ignore
                        const __VLS_301 = __VLS_asFunctionalComponent(__VLS_300, new __VLS_300({
                            modelValue: (condition.dateRange),
                            size: "small",
                            ...{ class: "form-control" },
                            format: "YYYY-MM-DD",
                            disabled: (!__VLS_ctx.editable),
                        }));
                        const __VLS_302 = __VLS_301({
                            modelValue: (condition.dateRange),
                            size: "small",
                            ...{ class: "form-control" },
                            format: "YYYY-MM-DD",
                            disabled: (!__VLS_ctx.editable),
                        }, ...__VLS_functionalComponentArgsRest(__VLS_301));
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
                        const __VLS_304 = {}.AInputNumber;
                        /** @type {[typeof __VLS_components.AInputNumber, typeof __VLS_components.aInputNumber, ]} */ ;
                        // @ts-ignore
                        const __VLS_305 = __VLS_asFunctionalComponent(__VLS_304, new __VLS_304({
                            modelValue: (condition.dynamicValue),
                            size: "small",
                            ...{ class: "dynamic-value" },
                            min: (1),
                            disabled: (!__VLS_ctx.editable),
                        }));
                        const __VLS_306 = __VLS_305({
                            modelValue: (condition.dynamicValue),
                            size: "small",
                            ...{ class: "dynamic-value" },
                            min: (1),
                            disabled: (!__VLS_ctx.editable),
                        }, ...__VLS_functionalComponentArgsRest(__VLS_305));
                        const __VLS_308 = {}.ASelect;
                        /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
                        // @ts-ignore
                        const __VLS_309 = __VLS_asFunctionalComponent(__VLS_308, new __VLS_308({
                            modelValue: (condition.dynamicUnit),
                            size: "small",
                            ...{ class: "dynamic-unit" },
                            options: (__VLS_ctx.dynamicUnitOptions),
                            disabled: (!__VLS_ctx.editable),
                        }));
                        const __VLS_310 = __VLS_309({
                            modelValue: (condition.dynamicUnit),
                            size: "small",
                            ...{ class: "dynamic-unit" },
                            options: (__VLS_ctx.dynamicUnitOptions),
                            disabled: (!__VLS_ctx.editable),
                        }, ...__VLS_functionalComponentArgsRest(__VLS_309));
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
            __VLS_ctx.$emit('addConditionByType', 'tag');
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
            __VLS_ctx.$emit('addConditionByType', 'behavior');
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
    const __VLS_336 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_337 = __VLS_asFunctionalComponent(__VLS_336, new __VLS_336({
        ...{ 'onClick': {} },
        type: "dashed",
        size: "small",
        ...{ class: "add-condition-btn" },
    }));
    const __VLS_338 = __VLS_337({
        ...{ 'onClick': {} },
        type: "dashed",
        size: "small",
        ...{ class: "add-condition-btn" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_337));
    let __VLS_340;
    let __VLS_341;
    let __VLS_342;
    const __VLS_343 = {
        onClick: (...[$event]) => {
            if (!(__VLS_ctx.editable))
                return;
            __VLS_ctx.$emit('addConditionByType', 'detail');
        }
    };
    __VLS_339.slots.default;
    {
        const { icon: __VLS_thisSlot } = __VLS_339.slots;
        const __VLS_344 = {}.IconPlus;
        /** @type {[typeof __VLS_components.IconPlus, ]} */ ;
        // @ts-ignore
        const __VLS_345 = __VLS_asFunctionalComponent(__VLS_344, new __VLS_344({}));
        const __VLS_346 = __VLS_345({}, ...__VLS_functionalComponentArgsRest(__VLS_345));
    }
    var __VLS_339;
}
/** @type {__VLS_StyleScopedClasses['condition-group-card']} */ ;
/** @type {__VLS_StyleScopedClasses['exclude-group']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-group-header']} */ ;
/** @type {__VLS_StyleScopedClasses['group-info']} */ ;
/** @type {__VLS_StyleScopedClasses['group-title-section']} */ ;
/** @type {__VLS_StyleScopedClasses['group-name-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['group-title']} */ ;
/** @type {__VLS_StyleScopedClasses['editable']} */ ;
/** @type {__VLS_StyleScopedClasses['group-name-input']} */ ;
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
/** @type {__VLS_StyleScopedClasses['condition-logic-connector']} */ ;
/** @type {__VLS_StyleScopedClasses['logic-line']} */ ;
/** @type {__VLS_StyleScopedClasses['logic-text']} */ ;
/** @type {__VLS_StyleScopedClasses['logic-line']} */ ;
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
/** @type {__VLS_StyleScopedClasses['condition-logic-connector']} */ ;
/** @type {__VLS_StyleScopedClasses['logic-line']} */ ;
/** @type {__VLS_StyleScopedClasses['logic-text']} */ ;
/** @type {__VLS_StyleScopedClasses['logic-line']} */ ;
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
/** @type {__VLS_StyleScopedClasses['condition-logic-connector']} */ ;
/** @type {__VLS_StyleScopedClasses['logic-line']} */ ;
/** @type {__VLS_StyleScopedClasses['logic-text']} */ ;
/** @type {__VLS_StyleScopedClasses['logic-line']} */ ;
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
// @ts-ignore
var __VLS_11 = __VLS_10;
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
            startEditGroupName: startEditGroupName,
            saveGroupName: saveGroupName,
            cancelEditGroupName: cancelEditGroupName,
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
