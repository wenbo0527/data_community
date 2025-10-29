/// <reference types="../../../../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { IconDown, IconRight, IconDelete } from '@arco-design/web-vue/es/icon';
// Props
const __VLS_props = defineProps({
    node: {
        type: Object,
        required: true
    },
    isRoot: {
        type: Boolean,
        default: false
    },
    dataSourceTypeOptions: {
        type: Array,
        required: true
    },
    dateTypeOptions: {
        type: Array,
        required: true
    },
    dynamicUnitOptions: {
        type: Array,
        required: true
    },
    getAggregationOptions: {
        type: Function,
        required: true
    },
    getOperatorOptions: {
        type: Function,
        required: true
    },
    needValueInput: {
        type: Function,
        required: true
    },
    getValuePlaceholder: {
        type: Function,
        required: true
    }
});
// Emits
const __VLS_emit = defineEmits([
    'add-logic-node', 'add-condition-group', 'add-condition', 'add-exclude-condition',
    'toggle-node', 'toggle-logic-operator', 'remove-node', 'edit-group-name',
    'duplicate-condition', 'remove-condition', 'data-source-type-change',
    'date-type-change', 'configure-sequence'
]);
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['rule-node']} */ ;
/** @type {__VLS_StyleScopedClasses['rule-node']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-item']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "rule-node" },
    ...{ class: ([__VLS_ctx.node.type, { 'is-root': __VLS_ctx.isRoot }]) },
});
if (__VLS_ctx.node.type === 'logic') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "logic-node" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "logic-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "logic-info" },
    });
    const __VLS_0 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        ...{ 'onClick': {} },
        type: "text",
        size: "mini",
        ...{ class: "toggle-btn" },
    }));
    const __VLS_2 = __VLS_1({
        ...{ 'onClick': {} },
        type: "text",
        size: "mini",
        ...{ class: "toggle-btn" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    let __VLS_4;
    let __VLS_5;
    let __VLS_6;
    const __VLS_7 = {
        onClick: (...[$event]) => {
            if (!(__VLS_ctx.node.type === 'logic'))
                return;
            __VLS_ctx.$emit('toggle-node', __VLS_ctx.node);
        }
    };
    __VLS_3.slots.default;
    if (!__VLS_ctx.node.collapsed) {
        const __VLS_8 = {}.IconDown;
        /** @type {[typeof __VLS_components.IconDown, ]} */ ;
        // @ts-ignore
        const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({}));
        const __VLS_10 = __VLS_9({}, ...__VLS_functionalComponentArgsRest(__VLS_9));
    }
    else {
        const __VLS_12 = {}.IconRight;
        /** @type {[typeof __VLS_components.IconRight, ]} */ ;
        // @ts-ignore
        const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({}));
        const __VLS_14 = __VLS_13({}, ...__VLS_functionalComponentArgsRest(__VLS_13));
    }
    var __VLS_3;
    const __VLS_16 = {}.ATag;
    /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
        ...{ 'onClick': {} },
        color: (__VLS_ctx.node.operator === 'and' ? 'blue' : 'orange'),
        ...{ class: "logic-operator" },
    }));
    const __VLS_18 = __VLS_17({
        ...{ 'onClick': {} },
        color: (__VLS_ctx.node.operator === 'and' ? 'blue' : 'orange'),
        ...{ class: "logic-operator" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    let __VLS_20;
    let __VLS_21;
    let __VLS_22;
    const __VLS_23 = {
        onClick: (...[$event]) => {
            if (!(__VLS_ctx.node.type === 'logic'))
                return;
            __VLS_ctx.$emit('toggle-logic-operator', __VLS_ctx.node);
        }
    };
    __VLS_19.slots.default;
    (__VLS_ctx.node.operator === 'and' ? '且' : '或');
    var __VLS_19;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "node-count" },
    });
    (__VLS_ctx.node.children?.length || 0);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "logic-actions" },
    });
    const __VLS_24 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
        ...{ 'onClick': {} },
        size: "mini",
        type: "dashed",
    }));
    const __VLS_26 = __VLS_25({
        ...{ 'onClick': {} },
        size: "mini",
        type: "dashed",
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    let __VLS_28;
    let __VLS_29;
    let __VLS_30;
    const __VLS_31 = {
        onClick: (...[$event]) => {
            if (!(__VLS_ctx.node.type === 'logic'))
                return;
            __VLS_ctx.$emit('add-condition-group', __VLS_ctx.node);
        }
    };
    __VLS_27.slots.default;
    var __VLS_27;
    const __VLS_32 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
        ...{ 'onClick': {} },
        size: "mini",
        type: "dashed",
    }));
    const __VLS_34 = __VLS_33({
        ...{ 'onClick': {} },
        size: "mini",
        type: "dashed",
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    let __VLS_36;
    let __VLS_37;
    let __VLS_38;
    const __VLS_39 = {
        onClick: (...[$event]) => {
            if (!(__VLS_ctx.node.type === 'logic'))
                return;
            __VLS_ctx.$emit('add-logic-node', __VLS_ctx.node, 'and');
        }
    };
    __VLS_35.slots.default;
    var __VLS_35;
    const __VLS_40 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
        ...{ 'onClick': {} },
        size: "mini",
        type: "dashed",
    }));
    const __VLS_42 = __VLS_41({
        ...{ 'onClick': {} },
        size: "mini",
        type: "dashed",
    }, ...__VLS_functionalComponentArgsRest(__VLS_41));
    let __VLS_44;
    let __VLS_45;
    let __VLS_46;
    const __VLS_47 = {
        onClick: (...[$event]) => {
            if (!(__VLS_ctx.node.type === 'logic'))
                return;
            __VLS_ctx.$emit('add-logic-node', __VLS_ctx.node, 'or');
        }
    };
    __VLS_43.slots.default;
    var __VLS_43;
    if (!__VLS_ctx.isRoot) {
        const __VLS_48 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
        // @ts-ignore
        const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
            ...{ 'onClick': {} },
            size: "mini",
            type: "text",
            status: "danger",
        }));
        const __VLS_50 = __VLS_49({
            ...{ 'onClick': {} },
            size: "mini",
            type: "text",
            status: "danger",
        }, ...__VLS_functionalComponentArgsRest(__VLS_49));
        let __VLS_52;
        let __VLS_53;
        let __VLS_54;
        const __VLS_55 = {
            onClick: (...[$event]) => {
                if (!(__VLS_ctx.node.type === 'logic'))
                    return;
                if (!(!__VLS_ctx.isRoot))
                    return;
                __VLS_ctx.$emit('remove-node', __VLS_ctx.node.id);
            }
        };
        __VLS_51.slots.default;
        var __VLS_51;
    }
    if (!__VLS_ctx.node.collapsed) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "logic-content" },
        });
        for (const [child, index] of __VLS_getVForSourceType((__VLS_ctx.node.children))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                key: (child.id),
                ...{ class: "child-node" },
            });
            const __VLS_56 = {}.RuleNode;
            /** @type {[typeof __VLS_components.RuleNode, ]} */ ;
            // @ts-ignore
            const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
                ...{ 'onAddLogicNode': {} },
                ...{ 'onAddConditionGroup': {} },
                ...{ 'onAddCondition': {} },
                ...{ 'onAddExcludeCondition': {} },
                ...{ 'onToggleNode': {} },
                ...{ 'onToggleLogicOperator': {} },
                ...{ 'onRemoveNode': {} },
                ...{ 'onEditGroupName': {} },
                ...{ 'onDuplicateCondition': {} },
                ...{ 'onRemoveCondition': {} },
                ...{ 'onDataSourceTypeChange': {} },
                ...{ 'onDateTypeChange': {} },
                ...{ 'onConfigureSequence': {} },
                node: (child),
                isRoot: (false),
                dataSourceTypeOptions: (__VLS_ctx.dataSourceTypeOptions),
                dateTypeOptions: (__VLS_ctx.dateTypeOptions),
                dynamicUnitOptions: (__VLS_ctx.dynamicUnitOptions),
                getAggregationOptions: (__VLS_ctx.getAggregationOptions),
                getOperatorOptions: (__VLS_ctx.getOperatorOptions),
                needValueInput: (__VLS_ctx.needValueInput),
                getValuePlaceholder: (__VLS_ctx.getValuePlaceholder),
            }));
            const __VLS_58 = __VLS_57({
                ...{ 'onAddLogicNode': {} },
                ...{ 'onAddConditionGroup': {} },
                ...{ 'onAddCondition': {} },
                ...{ 'onAddExcludeCondition': {} },
                ...{ 'onToggleNode': {} },
                ...{ 'onToggleLogicOperator': {} },
                ...{ 'onRemoveNode': {} },
                ...{ 'onEditGroupName': {} },
                ...{ 'onDuplicateCondition': {} },
                ...{ 'onRemoveCondition': {} },
                ...{ 'onDataSourceTypeChange': {} },
                ...{ 'onDateTypeChange': {} },
                ...{ 'onConfigureSequence': {} },
                node: (child),
                isRoot: (false),
                dataSourceTypeOptions: (__VLS_ctx.dataSourceTypeOptions),
                dateTypeOptions: (__VLS_ctx.dateTypeOptions),
                dynamicUnitOptions: (__VLS_ctx.dynamicUnitOptions),
                getAggregationOptions: (__VLS_ctx.getAggregationOptions),
                getOperatorOptions: (__VLS_ctx.getOperatorOptions),
                needValueInput: (__VLS_ctx.needValueInput),
                getValuePlaceholder: (__VLS_ctx.getValuePlaceholder),
            }, ...__VLS_functionalComponentArgsRest(__VLS_57));
            let __VLS_60;
            let __VLS_61;
            let __VLS_62;
            const __VLS_63 = {
                onAddLogicNode: ((...args) => __VLS_ctx.$emit('add-logic-node', ...args))
            };
            const __VLS_64 = {
                onAddConditionGroup: ((...args) => __VLS_ctx.$emit('add-condition-group', ...args))
            };
            const __VLS_65 = {
                onAddCondition: ((...args) => __VLS_ctx.$emit('add-condition', ...args))
            };
            const __VLS_66 = {
                onAddExcludeCondition: ((...args) => __VLS_ctx.$emit('add-exclude-condition', ...args))
            };
            const __VLS_67 = {
                onToggleNode: ((...args) => __VLS_ctx.$emit('toggle-node', ...args))
            };
            const __VLS_68 = {
                onToggleLogicOperator: ((...args) => __VLS_ctx.$emit('toggle-logic-operator', ...args))
            };
            const __VLS_69 = {
                onRemoveNode: ((...args) => __VLS_ctx.$emit('remove-node', ...args))
            };
            const __VLS_70 = {
                onEditGroupName: ((...args) => __VLS_ctx.$emit('edit-group-name', ...args))
            };
            const __VLS_71 = {
                onDuplicateCondition: ((...args) => __VLS_ctx.$emit('duplicate-condition', ...args))
            };
            const __VLS_72 = {
                onRemoveCondition: ((...args) => __VLS_ctx.$emit('remove-condition', ...args))
            };
            const __VLS_73 = {
                onDataSourceTypeChange: ((...args) => __VLS_ctx.$emit('data-source-type-change', ...args))
            };
            const __VLS_74 = {
                onDateTypeChange: ((...args) => __VLS_ctx.$emit('date-type-change', ...args))
            };
            const __VLS_75 = {
                onConfigureSequence: ((...args) => __VLS_ctx.$emit('configure-sequence', ...args))
            };
            var __VLS_59;
            if (index < __VLS_ctx.node.children.length - 1) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "logic-connector" },
                });
                const __VLS_76 = {}.ATag;
                /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
                // @ts-ignore
                const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
                    size: "small",
                    color: (__VLS_ctx.node.operator === 'and' ? 'blue' : 'orange'),
                }));
                const __VLS_78 = __VLS_77({
                    size: "small",
                    color: (__VLS_ctx.node.operator === 'and' ? 'blue' : 'orange'),
                }, ...__VLS_functionalComponentArgsRest(__VLS_77));
                __VLS_79.slots.default;
                (__VLS_ctx.node.operator === 'and' ? '且' : '或');
                var __VLS_79;
            }
        }
    }
}
else if (__VLS_ctx.node.type === 'group') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "condition-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "group-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "group-info" },
    });
    const __VLS_80 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
        ...{ 'onClick': {} },
        type: "text",
        size: "mini",
        ...{ class: "toggle-btn" },
    }));
    const __VLS_82 = __VLS_81({
        ...{ 'onClick': {} },
        type: "text",
        size: "mini",
        ...{ class: "toggle-btn" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_81));
    let __VLS_84;
    let __VLS_85;
    let __VLS_86;
    const __VLS_87 = {
        onClick: (...[$event]) => {
            if (!!(__VLS_ctx.node.type === 'logic'))
                return;
            if (!(__VLS_ctx.node.type === 'group'))
                return;
            __VLS_ctx.$emit('toggle-node', __VLS_ctx.node);
        }
    };
    __VLS_83.slots.default;
    if (!__VLS_ctx.node.collapsed) {
        const __VLS_88 = {}.IconDown;
        /** @type {[typeof __VLS_components.IconDown, ]} */ ;
        // @ts-ignore
        const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({}));
        const __VLS_90 = __VLS_89({}, ...__VLS_functionalComponentArgsRest(__VLS_89));
    }
    else {
        const __VLS_92 = {}.IconRight;
        /** @type {[typeof __VLS_components.IconRight, ]} */ ;
        // @ts-ignore
        const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({}));
        const __VLS_94 = __VLS_93({}, ...__VLS_functionalComponentArgsRest(__VLS_93));
    }
    var __VLS_83;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ onClick: (...[$event]) => {
                if (!!(__VLS_ctx.node.type === 'logic'))
                    return;
                if (!(__VLS_ctx.node.type === 'group'))
                    return;
                __VLS_ctx.$emit('edit-group-name', __VLS_ctx.node);
            } },
        ...{ class: "group-name" },
    });
    (__VLS_ctx.node.name);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "condition-count" },
    });
    (__VLS_ctx.node.conditions?.length || 0);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "group-actions" },
    });
    const __VLS_96 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
        ...{ 'onClick': {} },
        size: "mini",
        type: "dashed",
    }));
    const __VLS_98 = __VLS_97({
        ...{ 'onClick': {} },
        size: "mini",
        type: "dashed",
    }, ...__VLS_functionalComponentArgsRest(__VLS_97));
    let __VLS_100;
    let __VLS_101;
    let __VLS_102;
    const __VLS_103 = {
        onClick: (...[$event]) => {
            if (!!(__VLS_ctx.node.type === 'logic'))
                return;
            if (!(__VLS_ctx.node.type === 'group'))
                return;
            __VLS_ctx.$emit('add-condition', __VLS_ctx.node);
        }
    };
    __VLS_99.slots.default;
    var __VLS_99;
    const __VLS_104 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({
        ...{ 'onClick': {} },
        size: "mini",
        type: "dashed",
    }));
    const __VLS_106 = __VLS_105({
        ...{ 'onClick': {} },
        size: "mini",
        type: "dashed",
    }, ...__VLS_functionalComponentArgsRest(__VLS_105));
    let __VLS_108;
    let __VLS_109;
    let __VLS_110;
    const __VLS_111 = {
        onClick: (...[$event]) => {
            if (!!(__VLS_ctx.node.type === 'logic'))
                return;
            if (!(__VLS_ctx.node.type === 'group'))
                return;
            __VLS_ctx.$emit('add-exclude-condition', __VLS_ctx.node);
        }
    };
    __VLS_107.slots.default;
    var __VLS_107;
    const __VLS_112 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({
        ...{ 'onClick': {} },
        size: "mini",
        type: "text",
        status: "danger",
    }));
    const __VLS_114 = __VLS_113({
        ...{ 'onClick': {} },
        size: "mini",
        type: "text",
        status: "danger",
    }, ...__VLS_functionalComponentArgsRest(__VLS_113));
    let __VLS_116;
    let __VLS_117;
    let __VLS_118;
    const __VLS_119 = {
        onClick: (...[$event]) => {
            if (!!(__VLS_ctx.node.type === 'logic'))
                return;
            if (!(__VLS_ctx.node.type === 'group'))
                return;
            __VLS_ctx.$emit('remove-node', __VLS_ctx.node.id);
        }
    };
    __VLS_115.slots.default;
    var __VLS_115;
    if (!__VLS_ctx.node.collapsed) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "group-content" },
        });
        for (const [condition, conditionIndex] of __VLS_getVForSourceType((__VLS_ctx.node.conditions))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                key: (condition.id),
                ...{ class: "condition-item" },
                ...{ class: ({ 'exclude-condition': condition.isExclude }) },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "condition-content" },
            });
            if (condition.isExclude) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "exclude-label" },
                });
                const __VLS_120 = {}.ATag;
                /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
                // @ts-ignore
                const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({
                    color: "red",
                    size: "small",
                }));
                const __VLS_122 = __VLS_121({
                    color: "red",
                    size: "small",
                }, ...__VLS_functionalComponentArgsRest(__VLS_121));
                __VLS_123.slots.default;
                var __VLS_123;
            }
            const __VLS_124 = {}.ASelect;
            /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
            // @ts-ignore
            const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({
                ...{ 'onChange': {} },
                modelValue: (condition.dataSourceType),
                size: "small",
                ...{ style: {} },
                options: (__VLS_ctx.dataSourceTypeOptions),
            }));
            const __VLS_126 = __VLS_125({
                ...{ 'onChange': {} },
                modelValue: (condition.dataSourceType),
                size: "small",
                ...{ style: {} },
                options: (__VLS_ctx.dataSourceTypeOptions),
            }, ...__VLS_functionalComponentArgsRest(__VLS_125));
            let __VLS_128;
            let __VLS_129;
            let __VLS_130;
            const __VLS_131 = {
                onChange: (...[$event]) => {
                    if (!!(__VLS_ctx.node.type === 'logic'))
                        return;
                    if (!(__VLS_ctx.node.type === 'group'))
                        return;
                    if (!(!__VLS_ctx.node.collapsed))
                        return;
                    __VLS_ctx.$emit('data-source-type-change', condition);
                }
            };
            var __VLS_127;
            const __VLS_132 = {}.AInput;
            /** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
            // @ts-ignore
            const __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132({
                modelValue: (condition.fieldName),
                size: "small",
                ...{ style: {} },
                placeholder: "字段名称",
            }));
            const __VLS_134 = __VLS_133({
                modelValue: (condition.fieldName),
                size: "small",
                ...{ style: {} },
                placeholder: "字段名称",
            }, ...__VLS_functionalComponentArgsRest(__VLS_133));
            if (condition.dataSourceType === 'detail' || condition.dataSourceType === 'behavior') {
                const __VLS_136 = {}.ASelect;
                /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
                // @ts-ignore
                const __VLS_137 = __VLS_asFunctionalComponent(__VLS_136, new __VLS_136({
                    modelValue: (condition.aggregationType),
                    size: "small",
                    ...{ style: {} },
                    options: (__VLS_ctx.getAggregationOptions(condition.dataSourceType)),
                }));
                const __VLS_138 = __VLS_137({
                    modelValue: (condition.aggregationType),
                    size: "small",
                    ...{ style: {} },
                    options: (__VLS_ctx.getAggregationOptions(condition.dataSourceType)),
                }, ...__VLS_functionalComponentArgsRest(__VLS_137));
            }
            const __VLS_140 = {}.ASelect;
            /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
            // @ts-ignore
            const __VLS_141 = __VLS_asFunctionalComponent(__VLS_140, new __VLS_140({
                modelValue: (condition.operator),
                size: "small",
                ...{ style: {} },
                options: (__VLS_ctx.getOperatorOptions(condition)),
            }));
            const __VLS_142 = __VLS_141({
                modelValue: (condition.operator),
                size: "small",
                ...{ style: {} },
                options: (__VLS_ctx.getOperatorOptions(condition)),
            }, ...__VLS_functionalComponentArgsRest(__VLS_141));
            if (__VLS_ctx.needValueInput(condition)) {
                const __VLS_144 = {}.AInput;
                /** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
                // @ts-ignore
                const __VLS_145 = __VLS_asFunctionalComponent(__VLS_144, new __VLS_144({
                    modelValue: (condition.value),
                    size: "small",
                    ...{ style: {} },
                    placeholder: (__VLS_ctx.getValuePlaceholder(condition)),
                }));
                const __VLS_146 = __VLS_145({
                    modelValue: (condition.value),
                    size: "small",
                    ...{ style: {} },
                    placeholder: (__VLS_ctx.getValuePlaceholder(condition)),
                }, ...__VLS_functionalComponentArgsRest(__VLS_145));
            }
            if (condition.dataSourceType !== 'attribute') {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "date-range-section" },
                });
                const __VLS_148 = {}.ASelect;
                /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
                // @ts-ignore
                const __VLS_149 = __VLS_asFunctionalComponent(__VLS_148, new __VLS_148({
                    ...{ 'onChange': {} },
                    modelValue: (condition.dateType),
                    size: "small",
                    ...{ style: {} },
                    options: (__VLS_ctx.dateTypeOptions),
                }));
                const __VLS_150 = __VLS_149({
                    ...{ 'onChange': {} },
                    modelValue: (condition.dateType),
                    size: "small",
                    ...{ style: {} },
                    options: (__VLS_ctx.dateTypeOptions),
                }, ...__VLS_functionalComponentArgsRest(__VLS_149));
                let __VLS_152;
                let __VLS_153;
                let __VLS_154;
                const __VLS_155 = {
                    onChange: (...[$event]) => {
                        if (!!(__VLS_ctx.node.type === 'logic'))
                            return;
                        if (!(__VLS_ctx.node.type === 'group'))
                            return;
                        if (!(!__VLS_ctx.node.collapsed))
                            return;
                        if (!(condition.dataSourceType !== 'attribute'))
                            return;
                        __VLS_ctx.$emit('date-type-change', condition);
                    }
                };
                var __VLS_151;
                if (condition.dateType === 'fixed') {
                    const __VLS_156 = {}.ARangePicker;
                    /** @type {[typeof __VLS_components.ARangePicker, typeof __VLS_components.aRangePicker, ]} */ ;
                    // @ts-ignore
                    const __VLS_157 = __VLS_asFunctionalComponent(__VLS_156, new __VLS_156({
                        modelValue: (condition.dateRange),
                        size: "small",
                        ...{ style: {} },
                    }));
                    const __VLS_158 = __VLS_157({
                        modelValue: (condition.dateRange),
                        size: "small",
                        ...{ style: {} },
                    }, ...__VLS_functionalComponentArgsRest(__VLS_157));
                }
                else if (condition.dateType === 'dynamic') {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "dynamic-date" },
                    });
                    const __VLS_160 = {}.AInputNumber;
                    /** @type {[typeof __VLS_components.AInputNumber, typeof __VLS_components.aInputNumber, ]} */ ;
                    // @ts-ignore
                    const __VLS_161 = __VLS_asFunctionalComponent(__VLS_160, new __VLS_160({
                        modelValue: (condition.dynamicValue),
                        size: "small",
                        ...{ style: {} },
                        min: (1),
                    }));
                    const __VLS_162 = __VLS_161({
                        modelValue: (condition.dynamicValue),
                        size: "small",
                        ...{ style: {} },
                        min: (1),
                    }, ...__VLS_functionalComponentArgsRest(__VLS_161));
                    const __VLS_164 = {}.ASelect;
                    /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
                    // @ts-ignore
                    const __VLS_165 = __VLS_asFunctionalComponent(__VLS_164, new __VLS_164({
                        modelValue: (condition.dynamicUnit),
                        size: "small",
                        ...{ style: {} },
                        options: (__VLS_ctx.dynamicUnitOptions),
                    }));
                    const __VLS_166 = __VLS_165({
                        modelValue: (condition.dynamicUnit),
                        size: "small",
                        ...{ style: {} },
                        options: (__VLS_ctx.dynamicUnitOptions),
                    }, ...__VLS_functionalComponentArgsRest(__VLS_165));
                }
                else if (condition.dateType === 'single') {
                    const __VLS_168 = {}.ADatePicker;
                    /** @type {[typeof __VLS_components.ADatePicker, typeof __VLS_components.aDatePicker, ]} */ ;
                    // @ts-ignore
                    const __VLS_169 = __VLS_asFunctionalComponent(__VLS_168, new __VLS_168({
                        modelValue: (condition.singleDate),
                        size: "small",
                        ...{ style: {} },
                        showTime: true,
                    }));
                    const __VLS_170 = __VLS_169({
                        modelValue: (condition.singleDate),
                        size: "small",
                        ...{ style: {} },
                        showTime: true,
                    }, ...__VLS_functionalComponentArgsRest(__VLS_169));
                }
            }
            if (condition.dataSourceType === 'behavior') {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "sequence-section" },
                });
                const __VLS_172 = {}.ACheckbox;
                /** @type {[typeof __VLS_components.ACheckbox, typeof __VLS_components.aCheckbox, typeof __VLS_components.ACheckbox, typeof __VLS_components.aCheckbox, ]} */ ;
                // @ts-ignore
                const __VLS_173 = __VLS_asFunctionalComponent(__VLS_172, new __VLS_172({
                    modelValue: (condition.enableSequence),
                    size: "small",
                }));
                const __VLS_174 = __VLS_173({
                    modelValue: (condition.enableSequence),
                    size: "small",
                }, ...__VLS_functionalComponentArgsRest(__VLS_173));
                __VLS_175.slots.default;
                var __VLS_175;
                if (condition.enableSequence) {
                    const __VLS_176 = {}.AButton;
                    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
                    // @ts-ignore
                    const __VLS_177 = __VLS_asFunctionalComponent(__VLS_176, new __VLS_176({
                        ...{ 'onClick': {} },
                        size: "mini",
                        type: "text",
                    }));
                    const __VLS_178 = __VLS_177({
                        ...{ 'onClick': {} },
                        size: "mini",
                        type: "text",
                    }, ...__VLS_functionalComponentArgsRest(__VLS_177));
                    let __VLS_180;
                    let __VLS_181;
                    let __VLS_182;
                    const __VLS_183 = {
                        onClick: (...[$event]) => {
                            if (!!(__VLS_ctx.node.type === 'logic'))
                                return;
                            if (!(__VLS_ctx.node.type === 'group'))
                                return;
                            if (!(!__VLS_ctx.node.collapsed))
                                return;
                            if (!(condition.dataSourceType === 'behavior'))
                                return;
                            if (!(condition.enableSequence))
                                return;
                            __VLS_ctx.$emit('configure-sequence', condition);
                        }
                    };
                    __VLS_179.slots.default;
                    var __VLS_179;
                }
            }
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "condition-actions" },
            });
            const __VLS_184 = {}.AButton;
            /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
            // @ts-ignore
            const __VLS_185 = __VLS_asFunctionalComponent(__VLS_184, new __VLS_184({
                ...{ 'onClick': {} },
                size: "mini",
                type: "text",
            }));
            const __VLS_186 = __VLS_185({
                ...{ 'onClick': {} },
                size: "mini",
                type: "text",
            }, ...__VLS_functionalComponentArgsRest(__VLS_185));
            let __VLS_188;
            let __VLS_189;
            let __VLS_190;
            const __VLS_191 = {
                onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.node.type === 'logic'))
                        return;
                    if (!(__VLS_ctx.node.type === 'group'))
                        return;
                    if (!(!__VLS_ctx.node.collapsed))
                        return;
                    __VLS_ctx.$emit('duplicate-condition', __VLS_ctx.node, condition);
                }
            };
            __VLS_187.slots.default;
            var __VLS_187;
            const __VLS_192 = {}.AButton;
            /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
            // @ts-ignore
            const __VLS_193 = __VLS_asFunctionalComponent(__VLS_192, new __VLS_192({
                ...{ 'onClick': {} },
                size: "mini",
                type: "text",
                status: "danger",
            }));
            const __VLS_194 = __VLS_193({
                ...{ 'onClick': {} },
                size: "mini",
                type: "text",
                status: "danger",
            }, ...__VLS_functionalComponentArgsRest(__VLS_193));
            let __VLS_196;
            let __VLS_197;
            let __VLS_198;
            const __VLS_199 = {
                onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.node.type === 'logic'))
                        return;
                    if (!(__VLS_ctx.node.type === 'group'))
                        return;
                    if (!(!__VLS_ctx.node.collapsed))
                        return;
                    __VLS_ctx.$emit('remove-condition', __VLS_ctx.node, conditionIndex);
                }
            };
            __VLS_195.slots.default;
            const __VLS_200 = {}.IconDelete;
            /** @type {[typeof __VLS_components.IconDelete, ]} */ ;
            // @ts-ignore
            const __VLS_201 = __VLS_asFunctionalComponent(__VLS_200, new __VLS_200({}));
            const __VLS_202 = __VLS_201({}, ...__VLS_functionalComponentArgsRest(__VLS_201));
            var __VLS_195;
        }
    }
}
/** @type {__VLS_StyleScopedClasses['rule-node']} */ ;
/** @type {__VLS_StyleScopedClasses['is-root']} */ ;
/** @type {__VLS_StyleScopedClasses['logic-node']} */ ;
/** @type {__VLS_StyleScopedClasses['logic-header']} */ ;
/** @type {__VLS_StyleScopedClasses['logic-info']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['logic-operator']} */ ;
/** @type {__VLS_StyleScopedClasses['node-count']} */ ;
/** @type {__VLS_StyleScopedClasses['logic-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['logic-content']} */ ;
/** @type {__VLS_StyleScopedClasses['child-node']} */ ;
/** @type {__VLS_StyleScopedClasses['logic-connector']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-group']} */ ;
/** @type {__VLS_StyleScopedClasses['group-header']} */ ;
/** @type {__VLS_StyleScopedClasses['group-info']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['group-name']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-count']} */ ;
/** @type {__VLS_StyleScopedClasses['group-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['group-content']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-item']} */ ;
/** @type {__VLS_StyleScopedClasses['exclude-condition']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-content']} */ ;
/** @type {__VLS_StyleScopedClasses['exclude-label']} */ ;
/** @type {__VLS_StyleScopedClasses['date-range-section']} */ ;
/** @type {__VLS_StyleScopedClasses['dynamic-date']} */ ;
/** @type {__VLS_StyleScopedClasses['sequence-section']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-actions']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            $props: __VLS_makeOptional(__VLS_props),
            ...__VLS_props,
            $emit: __VLS_emit,
            IconDown: IconDown,
            IconRight: IconRight,
            IconDelete: IconDelete,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {
            $props: __VLS_makeOptional(__VLS_props),
            ...__VLS_props,
            $emit: __VLS_emit,
        };
    },
});
; /* PartiallyEnd: #4569/main.vue */
