import { computed, ref, nextTick } from 'vue';
import { IconPlus } from '@arco-design/web-vue/es/icon';
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
// 处理条件组名称更新
const handleUpdateGroupName = (group, newName) => {
    group.name = newName;
    group.isEditingName = false;
    group.editingName = '';
};
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
/** @type {__VLS_StyleScopedClasses['add-condition-type-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['add-group-buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['add-group-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['add-exclude-group-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['add']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['remove']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-group-header']} */ ;
/** @type {__VLS_StyleScopedClasses['group-name']} */ ;
/** @type {__VLS_StyleScopedClasses['group-name']} */ ;
/** @type {__VLS_StyleScopedClasses['group-name']} */ ;
/** @type {__VLS_StyleScopedClasses['editable']} */ ;
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
    /** @type {[typeof __VLS_components.IconPlus, ]} */ ;
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
        /** @type {[typeof __VLS_components.IconPlus, ]} */ ;
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
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "condition-groups-list" },
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
        for (const [group, groupIndex] of __VLS_getVForSourceType((__VLS_ctx.regularGroups))) {
            /** @type {[typeof ConditionGroup, ]} */ ;
            // @ts-ignore
            const __VLS_16 = __VLS_asFunctionalComponent(ConditionGroup, new ConditionGroup({
                ...{ 'onDeleteConditionGroup': {} },
                ...{ 'onToggleGroupLogic': {} },
                ...{ 'onAddConditionByType': {} },
                ...{ 'onRemoveCondition': {} },
                ...{ 'onAddTagToCondition': {} },
                ...{ 'onRemoveTagFromCondition': {} },
                ...{ 'onAddEventProperty': {} },
                ...{ 'onRemoveEventProperty': {} },
                ...{ 'onUpdateGroupName': {} },
                key: (group.id || groupIndex),
                group: (group),
                groupIndex: (groupIndex),
                isExclude: (false),
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
            const __VLS_17 = __VLS_16({
                ...{ 'onDeleteConditionGroup': {} },
                ...{ 'onToggleGroupLogic': {} },
                ...{ 'onAddConditionByType': {} },
                ...{ 'onRemoveCondition': {} },
                ...{ 'onAddTagToCondition': {} },
                ...{ 'onRemoveTagFromCondition': {} },
                ...{ 'onAddEventProperty': {} },
                ...{ 'onRemoveEventProperty': {} },
                ...{ 'onUpdateGroupName': {} },
                key: (group.id || groupIndex),
                group: (group),
                groupIndex: (groupIndex),
                isExclude: (false),
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
            }, ...__VLS_functionalComponentArgsRest(__VLS_16));
            let __VLS_19;
            let __VLS_20;
            let __VLS_21;
            const __VLS_22 = {
                onDeleteConditionGroup: (...[$event]) => {
                    if (!!(__VLS_ctx.regularGroups.length === 0 && __VLS_ctx.excludeGroups.length === 0))
                        return;
                    if (!(__VLS_ctx.regularGroups.length > 0))
                        return;
                    __VLS_ctx.deleteConditionGroup(groupIndex);
                }
            };
            const __VLS_23 = {
                onToggleGroupLogic: (__VLS_ctx.toggleGroupLogic)
            };
            const __VLS_24 = {
                onAddConditionByType: ((type) => __VLS_ctx.addConditionByType(group, type))
            };
            const __VLS_25 = {
                onRemoveCondition: ((conditionIndex) => __VLS_ctx.removeCondition(group, conditionIndex))
            };
            const __VLS_26 = {
                onAddTagToCondition: ((conditionIndex) => __VLS_ctx.addTagToCondition(group, conditionIndex))
            };
            const __VLS_27 = {
                onRemoveTagFromCondition: ((conditionIndex) => __VLS_ctx.removeTagFromCondition(group, conditionIndex))
            };
            const __VLS_28 = {
                onAddEventProperty: (__VLS_ctx.addEventProperty)
            };
            const __VLS_29 = {
                onRemoveEventProperty: ((condition, propertyIndex) => __VLS_ctx.removeEventProperty(condition, propertyIndex))
            };
            const __VLS_30 = {
                onUpdateGroupName: (__VLS_ctx.handleUpdateGroupName)
            };
            var __VLS_18;
        }
        if (__VLS_ctx.editable) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "add-condition-group-area" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "add-group-buttons" },
            });
            const __VLS_31 = {}.AButton;
            /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
            // @ts-ignore
            const __VLS_32 = __VLS_asFunctionalComponent(__VLS_31, new __VLS_31({
                ...{ 'onClick': {} },
                type: "dashed",
                ...{ class: "add-group-btn" },
            }));
            const __VLS_33 = __VLS_32({
                ...{ 'onClick': {} },
                type: "dashed",
                ...{ class: "add-group-btn" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_32));
            let __VLS_35;
            let __VLS_36;
            let __VLS_37;
            const __VLS_38 = {
                onClick: (__VLS_ctx.addConditionGroup)
            };
            __VLS_34.slots.default;
            {
                const { icon: __VLS_thisSlot } = __VLS_34.slots;
                const __VLS_39 = {}.IconPlus;
                /** @type {[typeof __VLS_components.IconPlus, ]} */ ;
                // @ts-ignore
                const __VLS_40 = __VLS_asFunctionalComponent(__VLS_39, new __VLS_39({}));
                const __VLS_41 = __VLS_40({}, ...__VLS_functionalComponentArgsRest(__VLS_40));
            }
            var __VLS_34;
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
        const __VLS_43 = {}.ASwitch;
        /** @type {[typeof __VLS_components.ASwitch, typeof __VLS_components.aSwitch, ]} */ ;
        // @ts-ignore
        const __VLS_44 = __VLS_asFunctionalComponent(__VLS_43, new __VLS_43({
            ...{ 'onChange': {} },
            modelValue: (__VLS_ctx.enableExcludeGroups),
            size: "small",
        }));
        const __VLS_45 = __VLS_44({
            ...{ 'onChange': {} },
            modelValue: (__VLS_ctx.enableExcludeGroups),
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_44));
        let __VLS_47;
        let __VLS_48;
        let __VLS_49;
        const __VLS_50 = {
            onChange: (__VLS_ctx.onExcludeGroupsToggle)
        };
        var __VLS_46;
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
            const __VLS_51 = __VLS_asFunctionalComponent(ConditionGroup, new ConditionGroup({
                ...{ 'onDeleteConditionGroup': {} },
                ...{ 'onToggleGroupLogic': {} },
                ...{ 'onAddConditionByType': {} },
                ...{ 'onRemoveCondition': {} },
                ...{ 'onAddTagToCondition': {} },
                ...{ 'onRemoveTagFromCondition': {} },
                ...{ 'onAddEventProperty': {} },
                ...{ 'onRemoveEventProperty': {} },
                ...{ 'onUpdateGroupName': {} },
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
            const __VLS_52 = __VLS_51({
                ...{ 'onDeleteConditionGroup': {} },
                ...{ 'onToggleGroupLogic': {} },
                ...{ 'onAddConditionByType': {} },
                ...{ 'onRemoveCondition': {} },
                ...{ 'onAddTagToCondition': {} },
                ...{ 'onRemoveTagFromCondition': {} },
                ...{ 'onAddEventProperty': {} },
                ...{ 'onRemoveEventProperty': {} },
                ...{ 'onUpdateGroupName': {} },
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
            }, ...__VLS_functionalComponentArgsRest(__VLS_51));
            let __VLS_54;
            let __VLS_55;
            let __VLS_56;
            const __VLS_57 = {
                onDeleteConditionGroup: (...[$event]) => {
                    if (!!(__VLS_ctx.regularGroups.length === 0 && __VLS_ctx.excludeGroups.length === 0))
                        return;
                    if (!(__VLS_ctx.enableExcludeGroups && __VLS_ctx.excludeGroups.length > 0))
                        return;
                    __VLS_ctx.deleteExcludeConditionGroup(groupIndex);
                }
            };
            const __VLS_58 = {
                onToggleGroupLogic: (__VLS_ctx.toggleGroupLogic)
            };
            const __VLS_59 = {
                onAddConditionByType: ((type) => __VLS_ctx.addConditionByType(group, type))
            };
            const __VLS_60 = {
                onRemoveCondition: ((conditionIndex) => __VLS_ctx.removeCondition(group, conditionIndex))
            };
            const __VLS_61 = {
                onAddTagToCondition: ((conditionIndex) => __VLS_ctx.addTagToCondition(group, conditionIndex))
            };
            const __VLS_62 = {
                onRemoveTagFromCondition: ((conditionIndex) => __VLS_ctx.removeTagFromCondition(group, conditionIndex))
            };
            const __VLS_63 = {
                onAddEventProperty: (__VLS_ctx.addEventProperty)
            };
            const __VLS_64 = {
                onRemoveEventProperty: ((condition, propertyIndex) => __VLS_ctx.removeEventProperty(condition, propertyIndex))
            };
            const __VLS_65 = {
                onUpdateGroupName: (__VLS_ctx.handleUpdateGroupName)
            };
            var __VLS_53;
        }
    }
    if (__VLS_ctx.editable && __VLS_ctx.enableExcludeGroups && __VLS_ctx.excludeGroups.length === 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "add-exclude-group-area" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "add-group-buttons" },
        });
        const __VLS_66 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
        // @ts-ignore
        const __VLS_67 = __VLS_asFunctionalComponent(__VLS_66, new __VLS_66({
            ...{ 'onClick': {} },
            type: "dashed",
            ...{ class: "add-exclude-group-btn" },
        }));
        const __VLS_68 = __VLS_67({
            ...{ 'onClick': {} },
            type: "dashed",
            ...{ class: "add-exclude-group-btn" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_67));
        let __VLS_70;
        let __VLS_71;
        let __VLS_72;
        const __VLS_73 = {
            onClick: (__VLS_ctx.addExcludeConditionGroup)
        };
        __VLS_69.slots.default;
        {
            const { icon: __VLS_thisSlot } = __VLS_69.slots;
            const __VLS_74 = {}.IconPlus;
            /** @type {[typeof __VLS_components.IconPlus, ]} */ ;
            // @ts-ignore
            const __VLS_75 = __VLS_asFunctionalComponent(__VLS_74, new __VLS_74({}));
            const __VLS_76 = __VLS_75({}, ...__VLS_functionalComponentArgsRest(__VLS_75));
        }
        var __VLS_69;
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
/** @type {__VLS_StyleScopedClasses['condition-groups-list']} */ ;
/** @type {__VLS_StyleScopedClasses['vertical-logic-line']} */ ;
/** @type {__VLS_StyleScopedClasses['logic-line-vertical']} */ ;
/** @type {__VLS_StyleScopedClasses['cross-group-logic-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['and']} */ ;
/** @type {__VLS_StyleScopedClasses['or']} */ ;
/** @type {__VLS_StyleScopedClasses['clickable']} */ ;
/** @type {__VLS_StyleScopedClasses['logic-text']} */ ;
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
            ConditionGroup: ConditionGroup,
            enableExcludeGroups: enableExcludeGroups,
            regularGroups: regularGroups,
            excludeGroups: excludeGroups,
            addConditionGroup: addConditionGroup,
            addExcludeConditionGroup: addExcludeConditionGroup,
            deleteConditionGroup: deleteConditionGroup,
            deleteExcludeConditionGroup: deleteExcludeConditionGroup,
            toggleGroupLogic: toggleGroupLogic,
            toggleCrossGroupLogic: toggleCrossGroupLogic,
            addConditionByType: addConditionByType,
            removeCondition: removeCondition,
            addTagToCondition: addTagToCondition,
            removeTagFromCondition: removeTagFromCondition,
            addEventProperty: addEventProperty,
            removeEventProperty: removeEventProperty,
            onExcludeGroupsToggle: onExcludeGroupsToggle,
            handleUpdateGroupName: handleUpdateGroupName,
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
