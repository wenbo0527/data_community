import { computed, ref } from 'vue';
import { IconPlus, IconDown, IconRight, IconMinus } from '@arco-design/web-vue/es/icon';
import ConditionGroup from './ConditionGroup.vue';
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
// 响应式数据
const enableExcludeGroups = ref(false);
// 响应式状态
const collapsedSections = ref({
    tag: false,
    behavior: false,
    detail: false
});
// 计算属性
const regularGroups = computed(() => {
    return props.conditionGroups.filter(group => !group.isExclude);
});
const excludeGroups = computed(() => {
    return props.conditionGroups.filter(group => group.isExclude);
});
// 监听排除条件组的变化，如果有排除条件组则自动开启开关
const updateExcludeGroupsSwitch = () => {
    if (excludeGroups.value.length > 0) {
        enableExcludeGroups.value = true;
    }
};
// 初始化时检查是否有排除条件组
updateExcludeGroupsSwitch();
// 方法
const addConditionGroup = () => {
    emit('addConditionGroup');
};
const addExcludeConditionGroup = () => {
    emit('addExcludeConditionGroup');
};
const deleteConditionGroup = (groupIndex) => {
    emit('deleteConditionGroup', groupIndex);
};
const deleteExcludeConditionGroup = (groupIndex) => {
    emit('deleteExcludeConditionGroup', groupIndex);
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
// 标签相关方法
const addTagToCondition = (group, conditionIndex) => {
    emit('addTagToCondition', group, conditionIndex);
};
const removeTagFromCondition = (group, conditionIndex) => {
    emit('removeTagFromCondition', group, conditionIndex);
};
// 事件相关方法
const addEventProperty = (condition) => {
    emit('addEventProperty', condition);
};
const removeEventProperty = (condition, propertyIndex) => {
    emit('removeEventProperty', condition, propertyIndex);
};
// 按类型获取条件
const getConditionsByType = (group, type) => {
    if (!group.conditions)
        return [];
    switch (type) {
        case 'tag':
            return group.conditions.filter(condition => condition.dataSourceType === 'attribute' || condition.dataSourceType === 'tag');
        case 'behavior':
            return group.conditions.filter(condition => condition.dataSourceType === 'behavior' || condition.dataSourceType === 'event');
        case 'detail':
            return group.conditions.filter(condition => condition.dataSourceType !== 'attribute' &&
                condition.dataSourceType !== 'tag' &&
                condition.dataSourceType !== 'behavior' &&
                condition.dataSourceType !== 'event');
        default:
            return [];
    }
};
// 从条件组中移除指定条件
const removeConditionFromGroup = (group, condition) => {
    const conditionIndex = group.conditions.findIndex(c => c.id === condition.id || c === condition);
    if (conditionIndex !== -1) {
        emit('removeCondition', group, conditionIndex);
    }
};
// 移除指定类型的最后一个条件
const removeLastConditionByType = (group, type) => {
    const conditionsOfType = getConditionsByType(group, type);
    if (conditionsOfType.length > 0) {
        const lastCondition = conditionsOfType[conditionsOfType.length - 1];
        removeConditionFromGroup(group, lastCondition);
    }
};
// 切换条件类型组的展开收起状态
const toggleSectionCollapse = (type) => {
    collapsedSections.value[type] = !collapsedSections.value[type];
};
// 为标签条件添加单个条件的加减号功能
const addTagConditionItem = (group, condition) => {
    emit('addConditionByType', group, 'tag');
};
const removeTagConditionItem = (group, condition) => {
    removeConditionFromGroup(group, condition);
};
// 排除条件组开关切换处理
const onExcludeGroupsToggle = (value) => {
    const boolValue = Boolean(value);
    if (!boolValue && excludeGroups.value.length > 0) {
        // 如果关闭开关且存在排除条件组，需要删除所有排除条件组
        // 这里可以添加确认对话框
        console.warn('关闭排除条件组功能将删除所有已创建的排除条件组');
    }
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
/** @type {__VLS_StyleScopedClasses['section-info']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-condition-state']} */ ;
/** @type {__VLS_StyleScopedClasses['cross-group-logic-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['cross-group-logic-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['clickable']} */ ;
/** @type {__VLS_StyleScopedClasses['cross-group-logic-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['cross-group-logic-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['regular-groups-section']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-groups-list']} */ ;
/** @type {__VLS_StyleScopedClasses['exclude-groups-section']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-groups-list']} */ ;
/** @type {__VLS_StyleScopedClasses['add-exclude-group-area']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-group-card']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-group-card']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-group-card']} */ ;
/** @type {__VLS_StyleScopedClasses['exclude-group']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-group-card']} */ ;
/** @type {__VLS_StyleScopedClasses['exclude-group']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-group-header']} */ ;
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
/** @type {__VLS_StyleScopedClasses['add-group-buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['add-group-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['add-exclude-group-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['add']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['remove']} */ ;
/** @type {__VLS_StyleScopedClasses['event-properties-header']} */ ;
/** @type {__VLS_StyleScopedClasses['form-label']} */ ;
/** @type {__VLS_StyleScopedClasses['event-property-item']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['event-property-item']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['event-property-item']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['remove-property-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-type-add-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-item-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-remove-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['collapse-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-type-header']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-type-header']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['add-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['remove-btn']} */ ;
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
(__VLS_ctx.regularGroups.length + __VLS_ctx.excludeGroups.length);
if (__VLS_ctx.regularGroups.length === 0 && __VLS_ctx.excludeGroups.length === 0) {
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
    if (__VLS_ctx.regularGroups.length > 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "regular-groups-section" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "section-title" },
        });
        if (__VLS_ctx.regularGroups.length > 1) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "vertical-logic-line" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "logic-line-vertical" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.regularGroups.length === 0 && __VLS_ctx.excludeGroups.length === 0))
                            return;
                        if (!(__VLS_ctx.regularGroups.length > 0))
                            return;
                        if (!(__VLS_ctx.regularGroups.length > 1))
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
        for (const [group, groupIndex] of __VLS_getVForSourceType((__VLS_ctx.regularGroups))) {
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
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "group-title-content" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "group-name" },
            });
            (group.name || `条件组 ${groupIndex + 1}`);
            if (group.isExclude) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    ...{ class: "exclude-group-label" },
                });
            }
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
            }));
            const __VLS_18 = __VLS_17({
                ...{ 'onClick': {} },
                type: "text",
                size: "mini",
            }, ...__VLS_functionalComponentArgsRest(__VLS_17));
            let __VLS_20;
            let __VLS_21;
            let __VLS_22;
            const __VLS_23 = {
                onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.regularGroups.length === 0 && __VLS_ctx.excludeGroups.length === 0))
                        return;
                    if (!(__VLS_ctx.regularGroups.length > 0))
                        return;
                    group.collapsed = !group.collapsed;
                }
            };
            __VLS_19.slots.default;
            {
                const { icon: __VLS_thisSlot } = __VLS_19.slots;
                const __VLS_24 = {}.IconDown;
                /** @type {[typeof __VLS_components.IconDown, ]} */ ;
                // @ts-ignore
                const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
                    ...{ class: ({ 'rotate-180': group.collapsed }) },
                }));
                const __VLS_26 = __VLS_25({
                    ...{ class: ({ 'rotate-180': group.collapsed }) },
                }, ...__VLS_functionalComponentArgsRest(__VLS_25));
            }
            var __VLS_19;
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
                            if (!!(__VLS_ctx.regularGroups.length === 0 && __VLS_ctx.excludeGroups.length === 0))
                                return;
                            if (!(__VLS_ctx.regularGroups.length > 0))
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
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "condition-type-group tag-group" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.regularGroups.length === 0 && __VLS_ctx.excludeGroups.length === 0))
                            return;
                        if (!(__VLS_ctx.regularGroups.length > 0))
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
            const __VLS_28 = {}.AButton;
            /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
            // @ts-ignore
            const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
                type: "text",
                size: "small",
                ...{ class: "collapse-btn" },
            }));
            const __VLS_30 = __VLS_29({
                type: "text",
                size: "small",
                ...{ class: "collapse-btn" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_29));
            __VLS_31.slots.default;
            if (!__VLS_ctx.collapsedSections.tag) {
                const __VLS_32 = {}.IconDown;
                /** @type {[typeof __VLS_components.IconDown, ]} */ ;
                // @ts-ignore
                const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({}));
                const __VLS_34 = __VLS_33({}, ...__VLS_functionalComponentArgsRest(__VLS_33));
            }
            else {
                const __VLS_36 = {}.IconRight;
                /** @type {[typeof __VLS_components.IconRight, ]} */ ;
                // @ts-ignore
                const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({}));
                const __VLS_38 = __VLS_37({}, ...__VLS_functionalComponentArgsRest(__VLS_37));
            }
            var __VLS_31;
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "condition-type-title" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "condition-type-count" },
            });
            (__VLS_ctx.getConditionsByType(group, 'tag').length);
            if (__VLS_ctx.editable) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ onClick: () => { } },
                    ...{ class: "condition-type-buttons" },
                });
                const __VLS_40 = {}.AButton;
                /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
                // @ts-ignore
                const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
                    ...{ 'onClick': {} },
                    type: "text",
                    size: "small",
                    ...{ class: "condition-type-add-btn" },
                    title: "添加标签条件",
                }));
                const __VLS_42 = __VLS_41({
                    ...{ 'onClick': {} },
                    type: "text",
                    size: "small",
                    ...{ class: "condition-type-add-btn" },
                    title: "添加标签条件",
                }, ...__VLS_functionalComponentArgsRest(__VLS_41));
                let __VLS_44;
                let __VLS_45;
                let __VLS_46;
                const __VLS_47 = {
                    onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.regularGroups.length === 0 && __VLS_ctx.excludeGroups.length === 0))
                            return;
                        if (!(__VLS_ctx.regularGroups.length > 0))
                            return;
                        if (!(__VLS_ctx.editable))
                            return;
                        __VLS_ctx.addConditionByType(group, 'tag');
                    }
                };
                __VLS_43.slots.default;
                const __VLS_48 = {}.IconPlus;
                /** @type {[typeof __VLS_components.IconPlus, ]} */ ;
                // @ts-ignore
                const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({}));
                const __VLS_50 = __VLS_49({}, ...__VLS_functionalComponentArgsRest(__VLS_49));
                var __VLS_43;
                if (__VLS_ctx.getConditionsByType(group, 'tag').length > 0) {
                    const __VLS_52 = {}.AButton;
                    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
                    // @ts-ignore
                    const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
                        ...{ 'onClick': {} },
                        type: "text",
                        size: "small",
                        ...{ class: "condition-remove-btn" },
                        title: "删除最后一个标签条件",
                    }));
                    const __VLS_54 = __VLS_53({
                        ...{ 'onClick': {} },
                        type: "text",
                        size: "small",
                        ...{ class: "condition-remove-btn" },
                        title: "删除最后一个标签条件",
                    }, ...__VLS_functionalComponentArgsRest(__VLS_53));
                    let __VLS_56;
                    let __VLS_57;
                    let __VLS_58;
                    const __VLS_59 = {
                        onClick: (...[$event]) => {
                            if (!!(__VLS_ctx.regularGroups.length === 0 && __VLS_ctx.excludeGroups.length === 0))
                                return;
                            if (!(__VLS_ctx.regularGroups.length > 0))
                                return;
                            if (!(__VLS_ctx.editable))
                                return;
                            if (!(__VLS_ctx.getConditionsByType(group, 'tag').length > 0))
                                return;
                            __VLS_ctx.removeLastConditionByType(group, 'tag');
                        }
                    };
                    __VLS_55.slots.default;
                    const __VLS_60 = {}.IconMinus;
                    /** @type {[typeof __VLS_components.IconMinus, ]} */ ;
                    // @ts-ignore
                    const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({}));
                    const __VLS_62 = __VLS_61({}, ...__VLS_functionalComponentArgsRest(__VLS_61));
                    var __VLS_55;
                }
            }
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "condition-type-content" },
            });
            __VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, value: (!__VLS_ctx.collapsedSections.tag) }, null, null);
            if (__VLS_ctx.getConditionsByType(group, 'tag').length === 0) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "condition-type-empty" },
                });
            }
            for (const [condition, conditionIndex] of __VLS_getVForSourceType((__VLS_ctx.getConditionsByType(group, 'tag')))) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    key: (condition.id || conditionIndex),
                    ...{ class: "condition-item-wrapper tag-condition" },
                    ...{ class: ({ 'excluded': condition.isExclude }) },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "condition-item" },
                });
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
                    ...{ class: "form-row primary tag-config" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "form-group wide" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
                    ...{ class: "form-label" },
                });
                const __VLS_64 = {}.ACascader;
                /** @type {[typeof __VLS_components.ACascader, typeof __VLS_components.aCascader, ]} */ ;
                // @ts-ignore
                const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
                    modelValue: (condition.tagPath),
                    size: "small",
                    ...{ class: "form-control" },
                    placeholder: "选择标签",
                    options: (__VLS_ctx.getTagOptions && __VLS_ctx.getTagOptions() || []),
                    disabled: (!__VLS_ctx.editable),
                    allowSearch: true,
                }));
                const __VLS_66 = __VLS_65({
                    modelValue: (condition.tagPath),
                    size: "small",
                    ...{ class: "form-control" },
                    placeholder: "选择标签",
                    options: (__VLS_ctx.getTagOptions && __VLS_ctx.getTagOptions() || []),
                    disabled: (!__VLS_ctx.editable),
                    allowSearch: true,
                }, ...__VLS_functionalComponentArgsRest(__VLS_65));
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "form-group" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
                    ...{ class: "form-label" },
                });
                const __VLS_68 = {}.ASelect;
                /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
                // @ts-ignore
                const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
                    modelValue: (condition.operator),
                    size: "small",
                    ...{ class: "form-control" },
                    options: (__VLS_ctx.getTagOperatorOptions && __VLS_ctx.getTagOperatorOptions() || []),
                    disabled: (!__VLS_ctx.editable),
                }));
                const __VLS_70 = __VLS_69({
                    modelValue: (condition.operator),
                    size: "small",
                    ...{ class: "form-control" },
                    options: (__VLS_ctx.getTagOperatorOptions && __VLS_ctx.getTagOperatorOptions() || []),
                    disabled: (!__VLS_ctx.editable),
                }, ...__VLS_functionalComponentArgsRest(__VLS_69));
                if (__VLS_ctx.needTagValueInput && __VLS_ctx.needTagValueInput(condition)) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "form-group" },
                    });
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
                        ...{ class: "form-label" },
                    });
                    const __VLS_72 = {}.AInput;
                    /** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
                    // @ts-ignore
                    const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
                        modelValue: (condition.value),
                        size: "small",
                        ...{ class: "form-control" },
                        placeholder: (__VLS_ctx.getTagValuePlaceholder && __VLS_ctx.getTagValuePlaceholder(condition) || '请输入值'),
                        disabled: (!__VLS_ctx.editable),
                    }));
                    const __VLS_74 = __VLS_73({
                        modelValue: (condition.value),
                        size: "small",
                        ...{ class: "form-control" },
                        placeholder: (__VLS_ctx.getTagValuePlaceholder && __VLS_ctx.getTagValuePlaceholder(condition) || '请输入值'),
                        disabled: (!__VLS_ctx.editable),
                    }, ...__VLS_functionalComponentArgsRest(__VLS_73));
                }
                if (__VLS_ctx.editable) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "form-group tag-actions" },
                    });
                    const __VLS_76 = {}.AButton;
                    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
                    // @ts-ignore
                    const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
                        ...{ 'onClick': {} },
                        type: "text",
                        size: "small",
                        ...{ class: "tag-action-btn add-btn" },
                        title: "在此位置后添加标签条件",
                    }));
                    const __VLS_78 = __VLS_77({
                        ...{ 'onClick': {} },
                        type: "text",
                        size: "small",
                        ...{ class: "tag-action-btn add-btn" },
                        title: "在此位置后添加标签条件",
                    }, ...__VLS_functionalComponentArgsRest(__VLS_77));
                    let __VLS_80;
                    let __VLS_81;
                    let __VLS_82;
                    const __VLS_83 = {
                        onClick: (...[$event]) => {
                            if (!!(__VLS_ctx.regularGroups.length === 0 && __VLS_ctx.excludeGroups.length === 0))
                                return;
                            if (!(__VLS_ctx.regularGroups.length > 0))
                                return;
                            if (!(__VLS_ctx.editable))
                                return;
                            __VLS_ctx.addTagConditionItem(group, condition);
                        }
                    };
                    __VLS_79.slots.default;
                    const __VLS_84 = {}.IconPlus;
                    /** @type {[typeof __VLS_components.IconPlus, ]} */ ;
                    // @ts-ignore
                    const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({}));
                    const __VLS_86 = __VLS_85({}, ...__VLS_functionalComponentArgsRest(__VLS_85));
                    var __VLS_79;
                    const __VLS_88 = {}.AButton;
                    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
                    // @ts-ignore
                    const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
                        ...{ 'onClick': {} },
                        type: "text",
                        size: "small",
                        ...{ class: "tag-action-btn remove-btn" },
                        title: "删除此标签条件",
                    }));
                    const __VLS_90 = __VLS_89({
                        ...{ 'onClick': {} },
                        type: "text",
                        size: "small",
                        ...{ class: "tag-action-btn remove-btn" },
                        title: "删除此标签条件",
                    }, ...__VLS_functionalComponentArgsRest(__VLS_89));
                    let __VLS_92;
                    let __VLS_93;
                    let __VLS_94;
                    const __VLS_95 = {
                        onClick: (...[$event]) => {
                            if (!!(__VLS_ctx.regularGroups.length === 0 && __VLS_ctx.excludeGroups.length === 0))
                                return;
                            if (!(__VLS_ctx.regularGroups.length > 0))
                                return;
                            if (!(__VLS_ctx.editable))
                                return;
                            __VLS_ctx.removeTagConditionItem(group, condition);
                        }
                    };
                    __VLS_91.slots.default;
                    const __VLS_96 = {}.IconMinus;
                    /** @type {[typeof __VLS_components.IconMinus, ]} */ ;
                    // @ts-ignore
                    const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({}));
                    const __VLS_98 = __VLS_97({}, ...__VLS_functionalComponentArgsRest(__VLS_97));
                    var __VLS_91;
                }
            }
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "condition-type-group behavior-group" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.regularGroups.length === 0 && __VLS_ctx.excludeGroups.length === 0))
                            return;
                        if (!(__VLS_ctx.regularGroups.length > 0))
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
            const __VLS_100 = {}.AButton;
            /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
            // @ts-ignore
            const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
                type: "text",
                size: "small",
                ...{ class: "collapse-btn" },
            }));
            const __VLS_102 = __VLS_101({
                type: "text",
                size: "small",
                ...{ class: "collapse-btn" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_101));
            __VLS_103.slots.default;
            if (!__VLS_ctx.collapsedSections.behavior) {
                const __VLS_104 = {}.IconDown;
                /** @type {[typeof __VLS_components.IconDown, ]} */ ;
                // @ts-ignore
                const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({}));
                const __VLS_106 = __VLS_105({}, ...__VLS_functionalComponentArgsRest(__VLS_105));
            }
            else {
                const __VLS_108 = {}.IconRight;
                /** @type {[typeof __VLS_components.IconRight, ]} */ ;
                // @ts-ignore
                const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({}));
                const __VLS_110 = __VLS_109({}, ...__VLS_functionalComponentArgsRest(__VLS_109));
            }
            var __VLS_103;
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "condition-type-title" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "condition-type-count" },
            });
            (__VLS_ctx.getConditionsByType(group, 'behavior').length);
            if (__VLS_ctx.editable) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ onClick: () => { } },
                    ...{ class: "condition-type-buttons" },
                });
                const __VLS_112 = {}.AButton;
                /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
                // @ts-ignore
                const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({
                    ...{ 'onClick': {} },
                    type: "text",
                    size: "small",
                    ...{ class: "condition-type-add-btn" },
                    title: "添加行为条件",
                }));
                const __VLS_114 = __VLS_113({
                    ...{ 'onClick': {} },
                    type: "text",
                    size: "small",
                    ...{ class: "condition-type-add-btn" },
                    title: "添加行为条件",
                }, ...__VLS_functionalComponentArgsRest(__VLS_113));
                let __VLS_116;
                let __VLS_117;
                let __VLS_118;
                const __VLS_119 = {
                    onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.regularGroups.length === 0 && __VLS_ctx.excludeGroups.length === 0))
                            return;
                        if (!(__VLS_ctx.regularGroups.length > 0))
                            return;
                        if (!(__VLS_ctx.editable))
                            return;
                        __VLS_ctx.addConditionByType(group, 'behavior');
                    }
                };
                __VLS_115.slots.default;
                const __VLS_120 = {}.IconPlus;
                /** @type {[typeof __VLS_components.IconPlus, ]} */ ;
                // @ts-ignore
                const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({}));
                const __VLS_122 = __VLS_121({}, ...__VLS_functionalComponentArgsRest(__VLS_121));
                var __VLS_115;
                if (__VLS_ctx.getConditionsByType(group, 'behavior').length > 0) {
                    const __VLS_124 = {}.AButton;
                    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
                    // @ts-ignore
                    const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({
                        ...{ 'onClick': {} },
                        type: "text",
                        size: "small",
                        ...{ class: "condition-remove-btn" },
                        title: "删除最后一个行为条件",
                    }));
                    const __VLS_126 = __VLS_125({
                        ...{ 'onClick': {} },
                        type: "text",
                        size: "small",
                        ...{ class: "condition-remove-btn" },
                        title: "删除最后一个行为条件",
                    }, ...__VLS_functionalComponentArgsRest(__VLS_125));
                    let __VLS_128;
                    let __VLS_129;
                    let __VLS_130;
                    const __VLS_131 = {
                        onClick: (...[$event]) => {
                            if (!!(__VLS_ctx.regularGroups.length === 0 && __VLS_ctx.excludeGroups.length === 0))
                                return;
                            if (!(__VLS_ctx.regularGroups.length > 0))
                                return;
                            if (!(__VLS_ctx.editable))
                                return;
                            if (!(__VLS_ctx.getConditionsByType(group, 'behavior').length > 0))
                                return;
                            __VLS_ctx.removeLastConditionByType(group, 'behavior');
                        }
                    };
                    __VLS_127.slots.default;
                    const __VLS_132 = {}.IconMinus;
                    /** @type {[typeof __VLS_components.IconMinus, ]} */ ;
                    // @ts-ignore
                    const __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132({}));
                    const __VLS_134 = __VLS_133({}, ...__VLS_functionalComponentArgsRest(__VLS_133));
                    var __VLS_127;
                }
            }
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "condition-type-content" },
            });
            __VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, value: (!__VLS_ctx.collapsedSections.behavior) }, null, null);
            if (__VLS_ctx.getConditionsByType(group, 'behavior').length === 0) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "condition-type-empty" },
                });
            }
            for (const [condition, conditionIndex] of __VLS_getVForSourceType((__VLS_ctx.getConditionsByType(group, 'behavior')))) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    key: (condition.id || conditionIndex),
                    ...{ class: "condition-item-wrapper behavior-condition" },
                    ...{ class: ({ 'excluded': condition.isExclude }) },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "condition-item" },
                });
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
                    ...{ class: "form-row primary event-config" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "form-group wide" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
                    ...{ class: "form-label" },
                });
                const __VLS_136 = {}.ASelect;
                /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
                // @ts-ignore
                const __VLS_137 = __VLS_asFunctionalComponent(__VLS_136, new __VLS_136({
                    modelValue: (condition.eventName),
                    size: "small",
                    ...{ class: "form-control" },
                    placeholder: "选择事件",
                    options: (__VLS_ctx.getEventOptions && __VLS_ctx.getEventOptions() || []),
                    allowSearch: true,
                    disabled: (!__VLS_ctx.editable),
                }));
                const __VLS_138 = __VLS_137({
                    modelValue: (condition.eventName),
                    size: "small",
                    ...{ class: "form-control" },
                    placeholder: "选择事件",
                    options: (__VLS_ctx.getEventOptions && __VLS_ctx.getEventOptions() || []),
                    allowSearch: true,
                    disabled: (!__VLS_ctx.editable),
                }, ...__VLS_functionalComponentArgsRest(__VLS_137));
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "form-row secondary event-properties" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "event-properties-header" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
                    ...{ class: "form-label" },
                });
                const __VLS_140 = {}.AButton;
                /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
                // @ts-ignore
                const __VLS_141 = __VLS_asFunctionalComponent(__VLS_140, new __VLS_140({
                    ...{ 'onClick': {} },
                    type: "dashed",
                    size: "mini",
                    disabled: (!__VLS_ctx.editable),
                }));
                const __VLS_142 = __VLS_141({
                    ...{ 'onClick': {} },
                    type: "dashed",
                    size: "mini",
                    disabled: (!__VLS_ctx.editable),
                }, ...__VLS_functionalComponentArgsRest(__VLS_141));
                let __VLS_144;
                let __VLS_145;
                let __VLS_146;
                const __VLS_147 = {
                    onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.regularGroups.length === 0 && __VLS_ctx.excludeGroups.length === 0))
                            return;
                        if (!(__VLS_ctx.regularGroups.length > 0))
                            return;
                        __VLS_ctx.addEventProperty(condition);
                    }
                };
                __VLS_143.slots.default;
                {
                    const { icon: __VLS_thisSlot } = __VLS_143.slots;
                    const __VLS_148 = {}.IconPlus;
                    /** @type {[typeof __VLS_components.IconPlus, ]} */ ;
                    // @ts-ignore
                    const __VLS_149 = __VLS_asFunctionalComponent(__VLS_148, new __VLS_148({}));
                    const __VLS_150 = __VLS_149({}, ...__VLS_functionalComponentArgsRest(__VLS_149));
                }
                var __VLS_143;
                if (condition.eventProperties && condition.eventProperties.length > 0) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "event-properties-list" },
                    });
                    for (const [property, propIndex] of __VLS_getVForSourceType((condition.eventProperties))) {
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                            key: (propIndex),
                            ...{ class: "event-property-item" },
                        });
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                            ...{ class: "form-group" },
                        });
                        const __VLS_152 = {}.ASelect;
                        /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
                        // @ts-ignore
                        const __VLS_153 = __VLS_asFunctionalComponent(__VLS_152, new __VLS_152({
                            modelValue: (property.name),
                            size: "small",
                            ...{ class: "form-control" },
                            placeholder: "属性名称",
                            options: (__VLS_ctx.getEventPropertyOptions && condition.eventName ? __VLS_ctx.getEventPropertyOptions(condition.eventName) : []),
                            disabled: (!__VLS_ctx.editable),
                        }));
                        const __VLS_154 = __VLS_153({
                            modelValue: (property.name),
                            size: "small",
                            ...{ class: "form-control" },
                            placeholder: "属性名称",
                            options: (__VLS_ctx.getEventPropertyOptions && condition.eventName ? __VLS_ctx.getEventPropertyOptions(condition.eventName) : []),
                            disabled: (!__VLS_ctx.editable),
                        }, ...__VLS_functionalComponentArgsRest(__VLS_153));
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                            ...{ class: "form-group" },
                        });
                        const __VLS_156 = {}.ASelect;
                        /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
                        // @ts-ignore
                        const __VLS_157 = __VLS_asFunctionalComponent(__VLS_156, new __VLS_156({
                            modelValue: (property.operator),
                            size: "small",
                            ...{ class: "form-control" },
                            options: (__VLS_ctx.getPropertyOperatorOptions && __VLS_ctx.getPropertyOperatorOptions() || []),
                            disabled: (!__VLS_ctx.editable),
                        }));
                        const __VLS_158 = __VLS_157({
                            modelValue: (property.operator),
                            size: "small",
                            ...{ class: "form-control" },
                            options: (__VLS_ctx.getPropertyOperatorOptions && __VLS_ctx.getPropertyOperatorOptions() || []),
                            disabled: (!__VLS_ctx.editable),
                        }, ...__VLS_functionalComponentArgsRest(__VLS_157));
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                            ...{ class: "form-group" },
                        });
                        const __VLS_160 = {}.AInput;
                        /** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
                        // @ts-ignore
                        const __VLS_161 = __VLS_asFunctionalComponent(__VLS_160, new __VLS_160({
                            modelValue: (property.value),
                            size: "small",
                            ...{ class: "form-control" },
                            placeholder: "属性值",
                            disabled: (!__VLS_ctx.editable),
                        }));
                        const __VLS_162 = __VLS_161({
                            modelValue: (property.value),
                            size: "small",
                            ...{ class: "form-control" },
                            placeholder: "属性值",
                            disabled: (!__VLS_ctx.editable),
                        }, ...__VLS_functionalComponentArgsRest(__VLS_161));
                        const __VLS_164 = {}.AButton;
                        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
                        // @ts-ignore
                        const __VLS_165 = __VLS_asFunctionalComponent(__VLS_164, new __VLS_164({
                            ...{ 'onClick': {} },
                            type: "text",
                            size: "small",
                            ...{ class: "remove-property-btn" },
                            disabled: (!__VLS_ctx.editable),
                        }));
                        const __VLS_166 = __VLS_165({
                            ...{ 'onClick': {} },
                            type: "text",
                            size: "small",
                            ...{ class: "remove-property-btn" },
                            disabled: (!__VLS_ctx.editable),
                        }, ...__VLS_functionalComponentArgsRest(__VLS_165));
                        let __VLS_168;
                        let __VLS_169;
                        let __VLS_170;
                        const __VLS_171 = {
                            onClick: (...[$event]) => {
                                if (!!(__VLS_ctx.regularGroups.length === 0 && __VLS_ctx.excludeGroups.length === 0))
                                    return;
                                if (!(__VLS_ctx.regularGroups.length > 0))
                                    return;
                                if (!(condition.eventProperties && condition.eventProperties.length > 0))
                                    return;
                                __VLS_ctx.removeEventProperty(condition, propIndex);
                            }
                        };
                        __VLS_167.slots.default;
                        const __VLS_172 = {}.IconMinus;
                        /** @type {[typeof __VLS_components.IconMinus, ]} */ ;
                        // @ts-ignore
                        const __VLS_173 = __VLS_asFunctionalComponent(__VLS_172, new __VLS_172({}));
                        const __VLS_174 = __VLS_173({}, ...__VLS_functionalComponentArgsRest(__VLS_173));
                        var __VLS_167;
                    }
                }
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "form-row secondary" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "form-group" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
                    ...{ class: "form-label" },
                });
                const __VLS_176 = {}.ASelect;
                /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
                // @ts-ignore
                const __VLS_177 = __VLS_asFunctionalComponent(__VLS_176, new __VLS_176({
                    ...{ 'onChange': {} },
                    modelValue: (condition.dateType),
                    size: "small",
                    ...{ class: "form-control" },
                    options: (__VLS_ctx.dateTypeOptions),
                    disabled: (!__VLS_ctx.editable),
                }));
                const __VLS_178 = __VLS_177({
                    ...{ 'onChange': {} },
                    modelValue: (condition.dateType),
                    size: "small",
                    ...{ class: "form-control" },
                    options: (__VLS_ctx.dateTypeOptions),
                    disabled: (!__VLS_ctx.editable),
                }, ...__VLS_functionalComponentArgsRest(__VLS_177));
                let __VLS_180;
                let __VLS_181;
                let __VLS_182;
                const __VLS_183 = {
                    onChange: (...[$event]) => {
                        if (!!(__VLS_ctx.regularGroups.length === 0 && __VLS_ctx.excludeGroups.length === 0))
                            return;
                        if (!(__VLS_ctx.regularGroups.length > 0))
                            return;
                        __VLS_ctx.onDateTypeChange && __VLS_ctx.onDateTypeChange(condition);
                    }
                };
                var __VLS_179;
                if (condition.dateType === 'fixed') {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "form-group wide" },
                    });
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
                        ...{ class: "form-label" },
                    });
                    const __VLS_184 = {}.ARangePicker;
                    /** @type {[typeof __VLS_components.ARangePicker, typeof __VLS_components.aRangePicker, ]} */ ;
                    // @ts-ignore
                    const __VLS_185 = __VLS_asFunctionalComponent(__VLS_184, new __VLS_184({
                        modelValue: (condition.dateRange),
                        size: "small",
                        ...{ class: "form-control" },
                        format: "YYYY-MM-DD",
                        disabled: (!__VLS_ctx.editable),
                    }));
                    const __VLS_186 = __VLS_185({
                        modelValue: (condition.dateRange),
                        size: "small",
                        ...{ class: "form-control" },
                        format: "YYYY-MM-DD",
                        disabled: (!__VLS_ctx.editable),
                    }, ...__VLS_functionalComponentArgsRest(__VLS_185));
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
                    const __VLS_188 = {}.AInputNumber;
                    /** @type {[typeof __VLS_components.AInputNumber, typeof __VLS_components.aInputNumber, ]} */ ;
                    // @ts-ignore
                    const __VLS_189 = __VLS_asFunctionalComponent(__VLS_188, new __VLS_188({
                        modelValue: (condition.dynamicValue),
                        size: "small",
                        ...{ class: "dynamic-value" },
                        min: (1),
                        disabled: (!__VLS_ctx.editable),
                    }));
                    const __VLS_190 = __VLS_189({
                        modelValue: (condition.dynamicValue),
                        size: "small",
                        ...{ class: "dynamic-value" },
                        min: (1),
                        disabled: (!__VLS_ctx.editable),
                    }, ...__VLS_functionalComponentArgsRest(__VLS_189));
                    const __VLS_192 = {}.ASelect;
                    /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
                    // @ts-ignore
                    const __VLS_193 = __VLS_asFunctionalComponent(__VLS_192, new __VLS_192({
                        modelValue: (condition.dynamicUnit),
                        size: "small",
                        ...{ class: "dynamic-unit" },
                        options: (__VLS_ctx.dynamicUnitOptions),
                        disabled: (!__VLS_ctx.editable),
                    }));
                    const __VLS_194 = __VLS_193({
                        modelValue: (condition.dynamicUnit),
                        size: "small",
                        ...{ class: "dynamic-unit" },
                        options: (__VLS_ctx.dynamicUnitOptions),
                        disabled: (!__VLS_ctx.editable),
                    }, ...__VLS_functionalComponentArgsRest(__VLS_193));
                }
            }
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "condition-type-group detail-group" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.regularGroups.length === 0 && __VLS_ctx.excludeGroups.length === 0))
                            return;
                        if (!(__VLS_ctx.regularGroups.length > 0))
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
            const __VLS_196 = {}.AButton;
            /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
            // @ts-ignore
            const __VLS_197 = __VLS_asFunctionalComponent(__VLS_196, new __VLS_196({
                type: "text",
                size: "small",
                ...{ class: "collapse-btn" },
            }));
            const __VLS_198 = __VLS_197({
                type: "text",
                size: "small",
                ...{ class: "collapse-btn" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_197));
            __VLS_199.slots.default;
            if (!__VLS_ctx.collapsedSections.detail) {
                const __VLS_200 = {}.IconDown;
                /** @type {[typeof __VLS_components.IconDown, ]} */ ;
                // @ts-ignore
                const __VLS_201 = __VLS_asFunctionalComponent(__VLS_200, new __VLS_200({}));
                const __VLS_202 = __VLS_201({}, ...__VLS_functionalComponentArgsRest(__VLS_201));
            }
            else {
                const __VLS_204 = {}.IconRight;
                /** @type {[typeof __VLS_components.IconRight, ]} */ ;
                // @ts-ignore
                const __VLS_205 = __VLS_asFunctionalComponent(__VLS_204, new __VLS_204({}));
                const __VLS_206 = __VLS_205({}, ...__VLS_functionalComponentArgsRest(__VLS_205));
            }
            var __VLS_199;
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "condition-type-title" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "condition-type-count" },
            });
            (__VLS_ctx.getConditionsByType(group, 'detail').length);
            if (__VLS_ctx.editable) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ onClick: () => { } },
                    ...{ class: "condition-type-buttons" },
                });
                const __VLS_208 = {}.AButton;
                /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
                // @ts-ignore
                const __VLS_209 = __VLS_asFunctionalComponent(__VLS_208, new __VLS_208({
                    ...{ 'onClick': {} },
                    type: "text",
                    size: "small",
                    ...{ class: "condition-type-add-btn" },
                    title: "添加明细数据条件",
                }));
                const __VLS_210 = __VLS_209({
                    ...{ 'onClick': {} },
                    type: "text",
                    size: "small",
                    ...{ class: "condition-type-add-btn" },
                    title: "添加明细数据条件",
                }, ...__VLS_functionalComponentArgsRest(__VLS_209));
                let __VLS_212;
                let __VLS_213;
                let __VLS_214;
                const __VLS_215 = {
                    onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.regularGroups.length === 0 && __VLS_ctx.excludeGroups.length === 0))
                            return;
                        if (!(__VLS_ctx.regularGroups.length > 0))
                            return;
                        if (!(__VLS_ctx.editable))
                            return;
                        __VLS_ctx.addConditionByType(group, 'detail');
                    }
                };
                __VLS_211.slots.default;
                const __VLS_216 = {}.IconPlus;
                /** @type {[typeof __VLS_components.IconPlus, ]} */ ;
                // @ts-ignore
                const __VLS_217 = __VLS_asFunctionalComponent(__VLS_216, new __VLS_216({}));
                const __VLS_218 = __VLS_217({}, ...__VLS_functionalComponentArgsRest(__VLS_217));
                var __VLS_211;
                if (__VLS_ctx.getConditionsByType(group, 'detail').length > 0) {
                    const __VLS_220 = {}.AButton;
                    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
                    // @ts-ignore
                    const __VLS_221 = __VLS_asFunctionalComponent(__VLS_220, new __VLS_220({
                        ...{ 'onClick': {} },
                        type: "text",
                        size: "small",
                        ...{ class: "condition-remove-btn" },
                        title: "删除最后一个明细数据条件",
                    }));
                    const __VLS_222 = __VLS_221({
                        ...{ 'onClick': {} },
                        type: "text",
                        size: "small",
                        ...{ class: "condition-remove-btn" },
                        title: "删除最后一个明细数据条件",
                    }, ...__VLS_functionalComponentArgsRest(__VLS_221));
                    let __VLS_224;
                    let __VLS_225;
                    let __VLS_226;
                    const __VLS_227 = {
                        onClick: (...[$event]) => {
                            if (!!(__VLS_ctx.regularGroups.length === 0 && __VLS_ctx.excludeGroups.length === 0))
                                return;
                            if (!(__VLS_ctx.regularGroups.length > 0))
                                return;
                            if (!(__VLS_ctx.editable))
                                return;
                            if (!(__VLS_ctx.getConditionsByType(group, 'detail').length > 0))
                                return;
                            __VLS_ctx.removeLastConditionByType(group, 'detail');
                        }
                    };
                    __VLS_223.slots.default;
                    const __VLS_228 = {}.IconMinus;
                    /** @type {[typeof __VLS_components.IconMinus, ]} */ ;
                    // @ts-ignore
                    const __VLS_229 = __VLS_asFunctionalComponent(__VLS_228, new __VLS_228({}));
                    const __VLS_230 = __VLS_229({}, ...__VLS_functionalComponentArgsRest(__VLS_229));
                    var __VLS_223;
                }
            }
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "condition-type-content" },
            });
            __VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, value: (!__VLS_ctx.collapsedSections.detail) }, null, null);
            if (__VLS_ctx.getConditionsByType(group, 'detail').length === 0) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "condition-type-empty" },
                });
            }
            for (const [condition, conditionIndex] of __VLS_getVForSourceType((__VLS_ctx.getConditionsByType(group, 'detail')))) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    key: (condition.id || conditionIndex),
                    ...{ class: "condition-item-wrapper detail-condition" },
                    ...{ class: ({ 'excluded': condition.isExclude }) },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "condition-item" },
                });
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
                const __VLS_232 = {}.ASelect;
                /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
                // @ts-ignore
                const __VLS_233 = __VLS_asFunctionalComponent(__VLS_232, new __VLS_232({
                    ...{ 'onChange': {} },
                    modelValue: (condition.dataSourceType),
                    size: "small",
                    ...{ class: "form-control" },
                    options: (__VLS_ctx.dataSourceTypeOptions),
                    disabled: (!__VLS_ctx.editable),
                }));
                const __VLS_234 = __VLS_233({
                    ...{ 'onChange': {} },
                    modelValue: (condition.dataSourceType),
                    size: "small",
                    ...{ class: "form-control" },
                    options: (__VLS_ctx.dataSourceTypeOptions),
                    disabled: (!__VLS_ctx.editable),
                }, ...__VLS_functionalComponentArgsRest(__VLS_233));
                let __VLS_236;
                let __VLS_237;
                let __VLS_238;
                const __VLS_239 = {
                    onChange: (...[$event]) => {
                        if (!!(__VLS_ctx.regularGroups.length === 0 && __VLS_ctx.excludeGroups.length === 0))
                            return;
                        if (!(__VLS_ctx.regularGroups.length > 0))
                            return;
                        __VLS_ctx.onDataSourceTypeChange && __VLS_ctx.onDataSourceTypeChange(condition);
                    }
                };
                var __VLS_235;
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "form-group" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
                    ...{ class: "form-label" },
                });
                const __VLS_240 = {}.ASelect;
                /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
                // @ts-ignore
                const __VLS_241 = __VLS_asFunctionalComponent(__VLS_240, new __VLS_240({
                    modelValue: (condition.fieldName),
                    size: "small",
                    ...{ class: "form-control wide" },
                    placeholder: "选择字段",
                    options: (__VLS_ctx.getFieldOptions && condition.dataSourceType ? __VLS_ctx.getFieldOptions(condition.dataSourceType) : []),
                    allowSearch: true,
                    disabled: (!__VLS_ctx.editable),
                }));
                const __VLS_242 = __VLS_241({
                    modelValue: (condition.fieldName),
                    size: "small",
                    ...{ class: "form-control wide" },
                    placeholder: "选择字段",
                    options: (__VLS_ctx.getFieldOptions && condition.dataSourceType ? __VLS_ctx.getFieldOptions(condition.dataSourceType) : []),
                    allowSearch: true,
                    disabled: (!__VLS_ctx.editable),
                }, ...__VLS_functionalComponentArgsRest(__VLS_241));
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "form-group" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
                    ...{ class: "form-label" },
                });
                const __VLS_244 = {}.ASelect;
                /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
                // @ts-ignore
                const __VLS_245 = __VLS_asFunctionalComponent(__VLS_244, new __VLS_244({
                    modelValue: (condition.aggregationType),
                    size: "small",
                    ...{ class: "form-control" },
                    options: (__VLS_ctx.getAggregationOptions && condition.dataSourceType ? __VLS_ctx.getAggregationOptions(condition.dataSourceType) : []),
                    disabled: (!__VLS_ctx.editable),
                }));
                const __VLS_246 = __VLS_245({
                    modelValue: (condition.aggregationType),
                    size: "small",
                    ...{ class: "form-control" },
                    options: (__VLS_ctx.getAggregationOptions && condition.dataSourceType ? __VLS_ctx.getAggregationOptions(condition.dataSourceType) : []),
                    disabled: (!__VLS_ctx.editable),
                }, ...__VLS_functionalComponentArgsRest(__VLS_245));
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "form-group" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
                    ...{ class: "form-label" },
                });
                const __VLS_248 = {}.ASelect;
                /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
                // @ts-ignore
                const __VLS_249 = __VLS_asFunctionalComponent(__VLS_248, new __VLS_248({
                    modelValue: (condition.operator),
                    size: "small",
                    ...{ class: "form-control" },
                    options: (__VLS_ctx.getOperatorOptions && __VLS_ctx.getOperatorOptions(condition) || []),
                    disabled: (!__VLS_ctx.editable),
                }));
                const __VLS_250 = __VLS_249({
                    modelValue: (condition.operator),
                    size: "small",
                    ...{ class: "form-control" },
                    options: (__VLS_ctx.getOperatorOptions && __VLS_ctx.getOperatorOptions(condition) || []),
                    disabled: (!__VLS_ctx.editable),
                }, ...__VLS_functionalComponentArgsRest(__VLS_249));
                if (__VLS_ctx.needValueInput && __VLS_ctx.needValueInput(condition)) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "form-group" },
                    });
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
                        ...{ class: "form-label" },
                    });
                    const __VLS_252 = {}.AInput;
                    /** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
                    // @ts-ignore
                    const __VLS_253 = __VLS_asFunctionalComponent(__VLS_252, new __VLS_252({
                        modelValue: (condition.value),
                        size: "small",
                        ...{ class: "form-control" },
                        placeholder: (__VLS_ctx.getValuePlaceholder && __VLS_ctx.getValuePlaceholder(condition) || '请输入值'),
                        disabled: (!__VLS_ctx.editable),
                    }));
                    const __VLS_254 = __VLS_253({
                        modelValue: (condition.value),
                        size: "small",
                        ...{ class: "form-control" },
                        placeholder: (__VLS_ctx.getValuePlaceholder && __VLS_ctx.getValuePlaceholder(condition) || '请输入值'),
                        disabled: (!__VLS_ctx.editable),
                    }, ...__VLS_functionalComponentArgsRest(__VLS_253));
                }
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "form-row secondary" },
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
                    modelValue: (condition.dateType),
                    size: "small",
                    ...{ class: "form-control" },
                    options: (__VLS_ctx.dateTypeOptions),
                    disabled: (!__VLS_ctx.editable),
                }));
                const __VLS_258 = __VLS_257({
                    ...{ 'onChange': {} },
                    modelValue: (condition.dateType),
                    size: "small",
                    ...{ class: "form-control" },
                    options: (__VLS_ctx.dateTypeOptions),
                    disabled: (!__VLS_ctx.editable),
                }, ...__VLS_functionalComponentArgsRest(__VLS_257));
                let __VLS_260;
                let __VLS_261;
                let __VLS_262;
                const __VLS_263 = {
                    onChange: (...[$event]) => {
                        if (!!(__VLS_ctx.regularGroups.length === 0 && __VLS_ctx.excludeGroups.length === 0))
                            return;
                        if (!(__VLS_ctx.regularGroups.length > 0))
                            return;
                        __VLS_ctx.onDateTypeChange && __VLS_ctx.onDateTypeChange(condition);
                    }
                };
                var __VLS_259;
                if (condition.dateType === 'fixed') {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "form-group wide" },
                    });
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
                        ...{ class: "form-label" },
                    });
                    const __VLS_264 = {}.ARangePicker;
                    /** @type {[typeof __VLS_components.ARangePicker, typeof __VLS_components.aRangePicker, ]} */ ;
                    // @ts-ignore
                    const __VLS_265 = __VLS_asFunctionalComponent(__VLS_264, new __VLS_264({
                        modelValue: (condition.dateRange),
                        size: "small",
                        ...{ class: "form-control" },
                        format: "YYYY-MM-DD",
                        disabled: (!__VLS_ctx.editable),
                    }));
                    const __VLS_266 = __VLS_265({
                        modelValue: (condition.dateRange),
                        size: "small",
                        ...{ class: "form-control" },
                        format: "YYYY-MM-DD",
                        disabled: (!__VLS_ctx.editable),
                    }, ...__VLS_functionalComponentArgsRest(__VLS_265));
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
                    const __VLS_268 = {}.AInputNumber;
                    /** @type {[typeof __VLS_components.AInputNumber, typeof __VLS_components.aInputNumber, ]} */ ;
                    // @ts-ignore
                    const __VLS_269 = __VLS_asFunctionalComponent(__VLS_268, new __VLS_268({
                        modelValue: (condition.dynamicValue),
                        size: "small",
                        ...{ class: "dynamic-value" },
                        min: (1),
                        disabled: (!__VLS_ctx.editable),
                    }));
                    const __VLS_270 = __VLS_269({
                        modelValue: (condition.dynamicValue),
                        size: "small",
                        ...{ class: "dynamic-value" },
                        min: (1),
                        disabled: (!__VLS_ctx.editable),
                    }, ...__VLS_functionalComponentArgsRest(__VLS_269));
                    const __VLS_272 = {}.ASelect;
                    /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
                    // @ts-ignore
                    const __VLS_273 = __VLS_asFunctionalComponent(__VLS_272, new __VLS_272({
                        modelValue: (condition.dynamicUnit),
                        size: "small",
                        ...{ class: "dynamic-unit" },
                        options: (__VLS_ctx.dynamicUnitOptions),
                        disabled: (!__VLS_ctx.editable),
                    }));
                    const __VLS_274 = __VLS_273({
                        modelValue: (condition.dynamicUnit),
                        size: "small",
                        ...{ class: "dynamic-unit" },
                        options: (__VLS_ctx.dynamicUnitOptions),
                        disabled: (!__VLS_ctx.editable),
                    }, ...__VLS_functionalComponentArgsRest(__VLS_273));
                }
            }
            if (group.conditions.length === 0) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "empty-conditions" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "empty-content" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    ...{ class: "empty-text" },
                });
                if (__VLS_ctx.editable) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "empty-actions" },
                    });
                    const __VLS_276 = {}.AButton;
                    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
                    // @ts-ignore
                    const __VLS_277 = __VLS_asFunctionalComponent(__VLS_276, new __VLS_276({
                        ...{ 'onClick': {} },
                        type: "dashed",
                        size: "small",
                        ...{ class: "add-condition-btn" },
                    }));
                    const __VLS_278 = __VLS_277({
                        ...{ 'onClick': {} },
                        type: "dashed",
                        size: "small",
                        ...{ class: "add-condition-btn" },
                    }, ...__VLS_functionalComponentArgsRest(__VLS_277));
                    let __VLS_280;
                    let __VLS_281;
                    let __VLS_282;
                    const __VLS_283 = {
                        onClick: (...[$event]) => {
                            if (!!(__VLS_ctx.regularGroups.length === 0 && __VLS_ctx.excludeGroups.length === 0))
                                return;
                            if (!(__VLS_ctx.regularGroups.length > 0))
                                return;
                            if (!(group.conditions.length === 0))
                                return;
                            if (!(__VLS_ctx.editable))
                                return;
                            __VLS_ctx.addConditionByType(group, 'tag');
                        }
                    };
                    __VLS_279.slots.default;
                    {
                        const { icon: __VLS_thisSlot } = __VLS_279.slots;
                        const __VLS_284 = {}.IconPlus;
                        /** @type {[typeof __VLS_components.IconPlus, ]} */ ;
                        // @ts-ignore
                        const __VLS_285 = __VLS_asFunctionalComponent(__VLS_284, new __VLS_284({}));
                        const __VLS_286 = __VLS_285({}, ...__VLS_functionalComponentArgsRest(__VLS_285));
                    }
                    var __VLS_279;
                    const __VLS_288 = {}.AButton;
                    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
                    // @ts-ignore
                    const __VLS_289 = __VLS_asFunctionalComponent(__VLS_288, new __VLS_288({
                        ...{ 'onClick': {} },
                        type: "dashed",
                        size: "small",
                        ...{ class: "add-condition-btn" },
                    }));
                    const __VLS_290 = __VLS_289({
                        ...{ 'onClick': {} },
                        type: "dashed",
                        size: "small",
                        ...{ class: "add-condition-btn" },
                    }, ...__VLS_functionalComponentArgsRest(__VLS_289));
                    let __VLS_292;
                    let __VLS_293;
                    let __VLS_294;
                    const __VLS_295 = {
                        onClick: (...[$event]) => {
                            if (!!(__VLS_ctx.regularGroups.length === 0 && __VLS_ctx.excludeGroups.length === 0))
                                return;
                            if (!(__VLS_ctx.regularGroups.length > 0))
                                return;
                            if (!(group.conditions.length === 0))
                                return;
                            if (!(__VLS_ctx.editable))
                                return;
                            __VLS_ctx.addConditionByType(group, 'behavior');
                        }
                    };
                    __VLS_291.slots.default;
                    {
                        const { icon: __VLS_thisSlot } = __VLS_291.slots;
                        const __VLS_296 = {}.IconPlus;
                        /** @type {[typeof __VLS_components.IconPlus, ]} */ ;
                        // @ts-ignore
                        const __VLS_297 = __VLS_asFunctionalComponent(__VLS_296, new __VLS_296({}));
                        const __VLS_298 = __VLS_297({}, ...__VLS_functionalComponentArgsRest(__VLS_297));
                    }
                    var __VLS_291;
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
                            if (!!(__VLS_ctx.regularGroups.length === 0 && __VLS_ctx.excludeGroups.length === 0))
                                return;
                            if (!(__VLS_ctx.regularGroups.length > 0))
                                return;
                            if (!(group.conditions.length === 0))
                                return;
                            if (!(__VLS_ctx.editable))
                                return;
                            __VLS_ctx.addConditionByType(group, 'detail');
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
                }
            }
        }
        if (__VLS_ctx.editable) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "add-condition-group-area" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "add-group-buttons" },
            });
            const __VLS_312 = {}.AButton;
            /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
            // @ts-ignore
            const __VLS_313 = __VLS_asFunctionalComponent(__VLS_312, new __VLS_312({
                ...{ 'onClick': {} },
                type: "dashed",
                ...{ class: "add-group-btn" },
            }));
            const __VLS_314 = __VLS_313({
                ...{ 'onClick': {} },
                type: "dashed",
                ...{ class: "add-group-btn" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_313));
            let __VLS_316;
            let __VLS_317;
            let __VLS_318;
            const __VLS_319 = {
                onClick: (__VLS_ctx.addConditionGroup)
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
        }
    }
    if (__VLS_ctx.editable) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "exclude-control-section" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "exclude-control-header" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "exclude-control-label" },
        });
        const __VLS_324 = {}.ASwitch;
        /** @type {[typeof __VLS_components.ASwitch, typeof __VLS_components.aSwitch, ]} */ ;
        // @ts-ignore
        const __VLS_325 = __VLS_asFunctionalComponent(__VLS_324, new __VLS_324({
            ...{ 'onChange': {} },
            modelValue: (__VLS_ctx.enableExcludeGroups),
            size: "small",
        }));
        const __VLS_326 = __VLS_325({
            ...{ 'onChange': {} },
            modelValue: (__VLS_ctx.enableExcludeGroups),
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_325));
        let __VLS_328;
        let __VLS_329;
        let __VLS_330;
        const __VLS_331 = {
            onChange: (__VLS_ctx.onExcludeGroupsToggle)
        };
        var __VLS_327;
        if (__VLS_ctx.enableExcludeGroups) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "exclude-control-description" },
            });
        }
    }
    if (__VLS_ctx.enableExcludeGroups && __VLS_ctx.excludeGroups.length > 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "exclude-groups-section" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "section-title exclude-title" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "condition-groups-list" },
        });
        for (const [group, groupIndex] of __VLS_getVForSourceType((__VLS_ctx.excludeGroups))) {
            /** @type {[typeof ConditionGroup, ]} */ ;
            // @ts-ignore
            const __VLS_332 = __VLS_asFunctionalComponent(ConditionGroup, new ConditionGroup({
                ...{ 'onDeleteConditionGroup': {} },
                ...{ 'onToggleGroupLogic': {} },
                ...{ 'onAddConditionByType': {} },
                ...{ 'onRemoveCondition': {} },
                ...{ 'onAddTagToCondition': {} },
                ...{ 'onRemoveTagFromCondition': {} },
                ...{ 'onAddEventProperty': {} },
                ...{ 'onRemoveEventProperty': {} },
                key: (group.id || groupIndex),
                group: (group),
                groupIndex: (groupIndex),
                isExclude: (true),
                editable: (__VLS_ctx.editable),
                dataSourceTypeOptions: (__VLS_ctx.dataSourceTypeOptions),
                dateTypeOptions: (__VLS_ctx.dateTypeOptions),
                dynamicUnitOptions: (__VLS_ctx.dynamicUnitOptions),
                getFieldOptions: (__VLS_ctx.getFieldOptions),
                getAggregationOptions: (__VLS_ctx.getAggregationOptions),
                getOperatorOptions: (__VLS_ctx.getOperatorOptions),
                needValueInput: (__VLS_ctx.needValueInput),
                getValuePlaceholder: (__VLS_ctx.getValuePlaceholder),
                onDataSourceTypeChange: (__VLS_ctx.onDataSourceTypeChange),
                onDateTypeChange: (__VLS_ctx.onDateTypeChange),
                getTagOptions: (__VLS_ctx.getTagOptions),
                getTagOperatorOptions: (__VLS_ctx.getTagOperatorOptions),
                needTagValueInput: (__VLS_ctx.needTagValueInput),
                getTagValuePlaceholder: (__VLS_ctx.getTagValuePlaceholder),
                getEventOptions: (__VLS_ctx.getEventOptions),
                getEventPropertyOptions: (__VLS_ctx.getEventPropertyOptions),
                getPropertyOperatorOptions: (__VLS_ctx.getPropertyOperatorOptions),
            }));
            const __VLS_333 = __VLS_332({
                ...{ 'onDeleteConditionGroup': {} },
                ...{ 'onToggleGroupLogic': {} },
                ...{ 'onAddConditionByType': {} },
                ...{ 'onRemoveCondition': {} },
                ...{ 'onAddTagToCondition': {} },
                ...{ 'onRemoveTagFromCondition': {} },
                ...{ 'onAddEventProperty': {} },
                ...{ 'onRemoveEventProperty': {} },
                key: (group.id || groupIndex),
                group: (group),
                groupIndex: (groupIndex),
                isExclude: (true),
                editable: (__VLS_ctx.editable),
                dataSourceTypeOptions: (__VLS_ctx.dataSourceTypeOptions),
                dateTypeOptions: (__VLS_ctx.dateTypeOptions),
                dynamicUnitOptions: (__VLS_ctx.dynamicUnitOptions),
                getFieldOptions: (__VLS_ctx.getFieldOptions),
                getAggregationOptions: (__VLS_ctx.getAggregationOptions),
                getOperatorOptions: (__VLS_ctx.getOperatorOptions),
                needValueInput: (__VLS_ctx.needValueInput),
                getValuePlaceholder: (__VLS_ctx.getValuePlaceholder),
                onDataSourceTypeChange: (__VLS_ctx.onDataSourceTypeChange),
                onDateTypeChange: (__VLS_ctx.onDateTypeChange),
                getTagOptions: (__VLS_ctx.getTagOptions),
                getTagOperatorOptions: (__VLS_ctx.getTagOperatorOptions),
                needTagValueInput: (__VLS_ctx.needTagValueInput),
                getTagValuePlaceholder: (__VLS_ctx.getTagValuePlaceholder),
                getEventOptions: (__VLS_ctx.getEventOptions),
                getEventPropertyOptions: (__VLS_ctx.getEventPropertyOptions),
                getPropertyOperatorOptions: (__VLS_ctx.getPropertyOperatorOptions),
            }, ...__VLS_functionalComponentArgsRest(__VLS_332));
            let __VLS_335;
            let __VLS_336;
            let __VLS_337;
            const __VLS_338 = {
                onDeleteConditionGroup: (...[$event]) => {
                    if (!!(__VLS_ctx.regularGroups.length === 0 && __VLS_ctx.excludeGroups.length === 0))
                        return;
                    if (!(__VLS_ctx.enableExcludeGroups && __VLS_ctx.excludeGroups.length > 0))
                        return;
                    __VLS_ctx.deleteExcludeConditionGroup(groupIndex);
                }
            };
            const __VLS_339 = {
                onToggleGroupLogic: (__VLS_ctx.toggleGroupLogic)
            };
            const __VLS_340 = {
                onAddConditionByType: ((type) => __VLS_ctx.addConditionByType(group, type))
            };
            const __VLS_341 = {
                onRemoveCondition: ((conditionIndex) => __VLS_ctx.removeCondition(group, conditionIndex))
            };
            const __VLS_342 = {
                onAddTagToCondition: ((conditionIndex) => __VLS_ctx.addTagToCondition(group, conditionIndex))
            };
            const __VLS_343 = {
                onRemoveTagFromCondition: ((conditionIndex) => __VLS_ctx.removeTagFromCondition(group, conditionIndex))
            };
            const __VLS_344 = {
                onAddEventProperty: (__VLS_ctx.addEventProperty)
            };
            const __VLS_345 = {
                onRemoveEventProperty: ((condition, propertyIndex) => __VLS_ctx.removeEventProperty(condition, propertyIndex))
            };
            var __VLS_334;
        }
    }
    if (__VLS_ctx.editable && __VLS_ctx.enableExcludeGroups && __VLS_ctx.excludeGroups.length === 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "add-exclude-group-area" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "add-group-buttons" },
        });
        const __VLS_346 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
        // @ts-ignore
        const __VLS_347 = __VLS_asFunctionalComponent(__VLS_346, new __VLS_346({
            ...{ 'onClick': {} },
            type: "dashed",
            ...{ class: "add-exclude-group-btn" },
        }));
        const __VLS_348 = __VLS_347({
            ...{ 'onClick': {} },
            type: "dashed",
            ...{ class: "add-exclude-group-btn" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_347));
        let __VLS_350;
        let __VLS_351;
        let __VLS_352;
        const __VLS_353 = {
            onClick: (__VLS_ctx.addExcludeConditionGroup)
        };
        __VLS_349.slots.default;
        {
            const { icon: __VLS_thisSlot } = __VLS_349.slots;
            const __VLS_354 = {}.IconPlus;
            /** @type {[typeof __VLS_components.IconPlus, ]} */ ;
            // @ts-ignore
            const __VLS_355 = __VLS_asFunctionalComponent(__VLS_354, new __VLS_354({}));
            const __VLS_356 = __VLS_355({}, ...__VLS_functionalComponentArgsRest(__VLS_355));
        }
        var __VLS_349;
    }
}
/** @type {__VLS_StyleScopedClasses['condition-config-component']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-groups-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['section-info']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-count']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-condition-state']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-groups-workspace']} */ ;
/** @type {__VLS_StyleScopedClasses['regular-groups-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
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
/** @type {__VLS_StyleScopedClasses['group-title-content']} */ ;
/** @type {__VLS_StyleScopedClasses['group-name']} */ ;
/** @type {__VLS_StyleScopedClasses['exclude-group-label']} */ ;
/** @type {__VLS_StyleScopedClasses['group-count']} */ ;
/** @type {__VLS_StyleScopedClasses['group-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['rotate-180']} */ ;
/** @type {__VLS_StyleScopedClasses['conditions-list']} */ ;
/** @type {__VLS_StyleScopedClasses['group-logic-line']} */ ;
/** @type {__VLS_StyleScopedClasses['logic-line']} */ ;
/** @type {__VLS_StyleScopedClasses['logic-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['and']} */ ;
/** @type {__VLS_StyleScopedClasses['or']} */ ;
/** @type {__VLS_StyleScopedClasses['clickable']} */ ;
/** @type {__VLS_StyleScopedClasses['logic-text']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-type-group']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-group']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-type-header']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-type-header-with-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-type-title-section']} */ ;
/** @type {__VLS_StyleScopedClasses['collapse-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-type-title']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-type-count']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-type-buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-type-add-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-remove-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-type-content']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-type-empty']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-item-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-condition']} */ ;
/** @type {__VLS_StyleScopedClasses['excluded']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-item']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-config']} */ ;
/** @type {__VLS_StyleScopedClasses['exclude-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['exclude-label']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-form']} */ ;
/** @type {__VLS_StyleScopedClasses['form-row']} */ ;
/** @type {__VLS_StyleScopedClasses['primary']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-config']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['wide']} */ ;
/** @type {__VLS_StyleScopedClasses['form-label']} */ ;
/** @type {__VLS_StyleScopedClasses['form-control']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-label']} */ ;
/** @type {__VLS_StyleScopedClasses['form-control']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-label']} */ ;
/** @type {__VLS_StyleScopedClasses['form-control']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['add-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['remove-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-type-group']} */ ;
/** @type {__VLS_StyleScopedClasses['behavior-group']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-type-header']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-type-header-with-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-type-title-section']} */ ;
/** @type {__VLS_StyleScopedClasses['collapse-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-type-title']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-type-count']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-type-buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-type-add-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-remove-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-type-content']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-type-empty']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-item-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['behavior-condition']} */ ;
/** @type {__VLS_StyleScopedClasses['excluded']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-item']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-config']} */ ;
/** @type {__VLS_StyleScopedClasses['exclude-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['exclude-label']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-form']} */ ;
/** @type {__VLS_StyleScopedClasses['form-row']} */ ;
/** @type {__VLS_StyleScopedClasses['primary']} */ ;
/** @type {__VLS_StyleScopedClasses['event-config']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['wide']} */ ;
/** @type {__VLS_StyleScopedClasses['form-label']} */ ;
/** @type {__VLS_StyleScopedClasses['form-control']} */ ;
/** @type {__VLS_StyleScopedClasses['form-row']} */ ;
/** @type {__VLS_StyleScopedClasses['secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['event-properties']} */ ;
/** @type {__VLS_StyleScopedClasses['event-properties-header']} */ ;
/** @type {__VLS_StyleScopedClasses['form-label']} */ ;
/** @type {__VLS_StyleScopedClasses['event-properties-list']} */ ;
/** @type {__VLS_StyleScopedClasses['event-property-item']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-control']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-control']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-control']} */ ;
/** @type {__VLS_StyleScopedClasses['remove-property-btn']} */ ;
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
/** @type {__VLS_StyleScopedClasses['condition-type-group']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-group']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-type-header']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-type-header-with-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-type-title-section']} */ ;
/** @type {__VLS_StyleScopedClasses['collapse-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-type-title']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-type-count']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-type-buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-type-add-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-remove-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-type-content']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-type-empty']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-item-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-condition']} */ ;
/** @type {__VLS_StyleScopedClasses['excluded']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-item']} */ ;
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
/** @type {__VLS_StyleScopedClasses['empty-conditions']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-content']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-text']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['add-condition-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['add-condition-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['add-condition-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['add-condition-group-area']} */ ;
/** @type {__VLS_StyleScopedClasses['add-group-buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['add-group-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['exclude-control-section']} */ ;
/** @type {__VLS_StyleScopedClasses['exclude-control-header']} */ ;
/** @type {__VLS_StyleScopedClasses['exclude-control-label']} */ ;
/** @type {__VLS_StyleScopedClasses['exclude-control-description']} */ ;
/** @type {__VLS_StyleScopedClasses['exclude-groups-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['exclude-title']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-groups-list']} */ ;
/** @type {__VLS_StyleScopedClasses['add-exclude-group-area']} */ ;
/** @type {__VLS_StyleScopedClasses['add-group-buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['add-exclude-group-btn']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            IconPlus: IconPlus,
            IconDown: IconDown,
            IconRight: IconRight,
            IconMinus: IconMinus,
            ConditionGroup: ConditionGroup,
            enableExcludeGroups: enableExcludeGroups,
            collapsedSections: collapsedSections,
            regularGroups: regularGroups,
            excludeGroups: excludeGroups,
            addConditionGroup: addConditionGroup,
            addExcludeConditionGroup: addExcludeConditionGroup,
            deleteExcludeConditionGroup: deleteExcludeConditionGroup,
            toggleGroupLogic: toggleGroupLogic,
            toggleCrossGroupLogic: toggleCrossGroupLogic,
            addConditionByType: addConditionByType,
            removeCondition: removeCondition,
            addTagToCondition: addTagToCondition,
            removeTagFromCondition: removeTagFromCondition,
            addEventProperty: addEventProperty,
            removeEventProperty: removeEventProperty,
            getConditionsByType: getConditionsByType,
            removeLastConditionByType: removeLastConditionByType,
            toggleSectionCollapse: toggleSectionCollapse,
            addTagConditionItem: addTagConditionItem,
            removeTagConditionItem: removeTagConditionItem,
            onExcludeGroupsToggle: onExcludeGroupsToggle,
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
