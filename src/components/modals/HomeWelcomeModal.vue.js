/// <reference types="../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, computed, watch, onMounted } from 'vue';
import { IconArrowRise, IconArrowFall, IconCheckCircle } from '@arco-design/web-vue/es/icon';
import { Message } from '@arco-design/web-vue';
import { useUserStore } from '@/store';
// 定义getDepartmentFeatures函数
const getDepartmentFeatures = () => {
    console.log('当前用户部门:', userStore.userInfo.department);
    let features;
    switch (userStore.userInfo.department) {
        case 'risk':
            features = [
                '风控场景：变量查询/外数管理/模型部署',
                '风险评估：实时风控/反欺诈',
                '监控预警：指标看板/异常告警',
                '效果分析：策略评估/场景复盘'
            ];
            break;
        case 'marketing':
            features = [
                '营销场景：精准营销/活动策划',
                '客群管理：圈选客群/策略执行',
                '渠道分析：触达效果/转化分析',
                '活动监控：实时监控/效果评估'
            ];
            break;
        case 'data':
            features = [
                '数据治理：质量监控/数据标准',
                '资产管理：元数据/数据地图',
                '数据服务：API管理/权限控制',
                '运维监控：性能分析/容量规划'
            ];
            break;
        default:
            features = [
                '场景概览：常用场景/最佳实践',
                '功能导览：核心功能/操作指南',
                '工具集成：分析工具/开发环境',
                '协作支持：团队协作/技术支持'
            ];
    }
    console.log('返回的场景指引内容:', features);
    return features;
};
const props = defineProps({
    visible: {
        type: Boolean,
        required: true
    },
    isNewUser: {
        type: Boolean,
        default: false
    }
});
const emit = defineEmits(['update:visible']);
// 获取用户store
const userStore = useUserStore();
// 模态框标题
const modalTitle = computed(() => {
    return props.isNewUser ? '欢迎加入数据社区' : '数据社区工作台';
});
// 新人引导相关
const currentStep = ref(0);
const guideStarted = ref(false);
// 计算当前显示的步骤内容
const currentStepContent = computed(() => {
    return stepContent[currentStep.value];
});
// 在组件挂载时输出currentStep的值
onMounted(() => {
    console.log('组件挂载时的currentStep值:', currentStep.value);
});
// 监听visible变化，当弹窗打开时重置步骤
watch(() => props.visible, (newVal) => {
    if (newVal && props.isNewUser) {
        currentStep.value = 0;
        guideStarted.value = false;
        console.log('弹窗打开时重置currentStep值:', currentStep.value);
    }
});
// 步骤内容
const stepContent = [
    {
        title: '认识数字社区',
        description: '数字社区是一个统一的数据应用门户入口，主要分为五大核心模块，你可以在此找到数据应用相关的所有功能',
        features: [
            '数据资产：查找和管理数据资产',
            '数据探索：数据查询与分析的工具包',
            '数字授信：变量中心与模型服务',
            '数字营销：营销策略与权益管理',
            '数字管理：数据服务与权限申请'
        ]
    },
    {
        title: '如何找数',
        description: '数据发现：全局数据资产管理，快速定位和使用所需数据。',
        features: [
            '数据地图：表/外部数据/CDP元素/风控变量',
            '搜索筛选：标签与关键词检索',
            '资产收藏：快速查询常用资产',
        ]
    },
    {
        title: '如何看数',
        description: '数据探索：多维度自助分析工具，支持深度数据洞察。',
        features: [
            'SQL分析：统一查询平台',
            '报表调取：智能报表库',
            '客群洞察：特征分析与人群比对',
            '模型开发：一站式开发部署'
        ]
    },
    {
        title: '用数指引',
        description: '基于部门角色的场景化应用指引。',
        features: getDepartmentFeatures()
    },
    {
        title: '常见问题',
        description: '全方位的数据安全保障与支持服务。',
        features: [
            '资产问题：直接联系数据责任人',
            '权限申请：标准化审批流程',
            '紧急支持：专人对接服务',
            '安全合规：数据使用规范'
        ]
    }
];
const startGuide = () => {
    // 设置guideStarted为true，触发视图切换
    guideStarted.value = true;
    currentStep.value = 0;
    console.log('点击开始体验后的currentStep值:', currentStep.value);
    // 确保显示认识数字社区的内容
    console.log('当前显示的步骤内容:', stepContent[currentStep.value]);
};
const prevStep = () => {
    currentStep.value = Math.max(0, currentStep.value - 1);
};
const nextStep = () => {
    if (currentStep.value < stepContent.length - 1) { // 根据stepContent数组长度判断
        const nextStepValue = currentStep.value + 1;
        currentStep.value = nextStepValue;
        console.log('切换到下一步:', nextStepValue);
    }
    else {
        Message.success('恭喜您完成新手引导！');
        emit('update:visible', false);
    }
};
// 待办列表数据
const todoList = ref([
    {
        title: '陪跑计划审批',
        priority: '高',
        deadline: '2024-01-16 18:00'
    },
    {
        title: '数据表权限申请',
        priority: '中',
        deadline: '2024-01-17 12:00'
    },
    {
        title: '监控指标X异常',
        priority: '低',
        deadline: '2024-01-18 15:00'
    }
]);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['feature-list']} */ ;
/** @type {__VLS_StyleScopedClasses['feature-list']} */ ;
/** @type {__VLS_StyleScopedClasses['step-detail']} */ ;
/** @type {__VLS_StyleScopedClasses['welcome-modal']} */ ;
/** @type {__VLS_StyleScopedClasses['welcome-modal']} */ ;
/** @type {__VLS_StyleScopedClasses['welcome-modal']} */ ;
/** @type {__VLS_StyleScopedClasses['arco-list-item']} */ ;
// CSS variable injection 
// CSS variable injection end 
const __VLS_0 = {}.AModal;
/** @type {[typeof __VLS_components.AModal, typeof __VLS_components.aModal, typeof __VLS_components.AModal, typeof __VLS_components.aModal, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onUpdate:visible': {} },
    visible: (__VLS_ctx.visible),
    title: (__VLS_ctx.modalTitle),
    maskClosable: (false),
    footer: (false),
    width: "800px",
    ...{ class: "welcome-modal" },
}));
const __VLS_2 = __VLS_1({
    ...{ 'onUpdate:visible': {} },
    visible: (__VLS_ctx.visible),
    title: (__VLS_ctx.modalTitle),
    maskClosable: (false),
    footer: (false),
    width: "800px",
    ...{ class: "welcome-modal" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    'onUpdate:visible': ((val) => __VLS_ctx.$emit('update:visible', val))
};
var __VLS_8 = {};
__VLS_3.slots.default;
if (__VLS_ctx.isNewUser) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "quick-start-guide" },
    });
    if (__VLS_ctx.currentStep === 0 && !__VLS_ctx.guideStarted) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "welcome-section" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
            ...{ class: "welcome-title" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "quick-start-card" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "welcome-desc" },
        });
        const __VLS_9 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
        // @ts-ignore
        const __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({
            ...{ 'onClick': {} },
            type: "primary",
            size: "large",
        }));
        const __VLS_11 = __VLS_10({
            ...{ 'onClick': {} },
            type: "primary",
            size: "large",
        }, ...__VLS_functionalComponentArgsRest(__VLS_10));
        let __VLS_13;
        let __VLS_14;
        let __VLS_15;
        const __VLS_16 = {
            onClick: (__VLS_ctx.startGuide)
        };
        __VLS_12.slots.default;
        var __VLS_12;
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "guide-steps-container" },
        });
        const __VLS_17 = {}.ASteps;
        /** @type {[typeof __VLS_components.ASteps, typeof __VLS_components.aSteps, typeof __VLS_components.ASteps, typeof __VLS_components.aSteps, ]} */ ;
        // @ts-ignore
        const __VLS_18 = __VLS_asFunctionalComponent(__VLS_17, new __VLS_17({
            current: (__VLS_ctx.currentStep),
            ...{ class: "guide-steps" },
        }));
        const __VLS_19 = __VLS_18({
            current: (__VLS_ctx.currentStep),
            ...{ class: "guide-steps" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_18));
        __VLS_20.slots.default;
        const __VLS_21 = {}.AStep;
        /** @type {[typeof __VLS_components.AStep, typeof __VLS_components.aStep, ]} */ ;
        // @ts-ignore
        const __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({
            title: "认识数字社区",
        }));
        const __VLS_23 = __VLS_22({
            title: "认识数字社区",
        }, ...__VLS_functionalComponentArgsRest(__VLS_22));
        const __VLS_25 = {}.AStep;
        /** @type {[typeof __VLS_components.AStep, typeof __VLS_components.aStep, ]} */ ;
        // @ts-ignore
        const __VLS_26 = __VLS_asFunctionalComponent(__VLS_25, new __VLS_25({
            title: "如何找数",
        }));
        const __VLS_27 = __VLS_26({
            title: "如何找数",
        }, ...__VLS_functionalComponentArgsRest(__VLS_26));
        const __VLS_29 = {}.AStep;
        /** @type {[typeof __VLS_components.AStep, typeof __VLS_components.aStep, ]} */ ;
        // @ts-ignore
        const __VLS_30 = __VLS_asFunctionalComponent(__VLS_29, new __VLS_29({
            title: "如何看数",
        }));
        const __VLS_31 = __VLS_30({
            title: "如何看数",
        }, ...__VLS_functionalComponentArgsRest(__VLS_30));
        const __VLS_33 = {}.AStep;
        /** @type {[typeof __VLS_components.AStep, typeof __VLS_components.aStep, ]} */ ;
        // @ts-ignore
        const __VLS_34 = __VLS_asFunctionalComponent(__VLS_33, new __VLS_33({
            title: "用数指引",
        }));
        const __VLS_35 = __VLS_34({
            title: "用数指引",
        }, ...__VLS_functionalComponentArgsRest(__VLS_34));
        const __VLS_37 = {}.AStep;
        /** @type {[typeof __VLS_components.AStep, typeof __VLS_components.aStep, ]} */ ;
        // @ts-ignore
        const __VLS_38 = __VLS_asFunctionalComponent(__VLS_37, new __VLS_37({
            title: "常见问题",
        }));
        const __VLS_39 = __VLS_38({
            title: "常见问题",
        }, ...__VLS_functionalComponentArgsRest(__VLS_38));
        var __VLS_20;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "guide-content" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "step-content" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "step-detail" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
        (__VLS_ctx.currentStepContent.title);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "step-description" },
        });
        (__VLS_ctx.currentStepContent.description);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "step-features" },
        });
        for (const [feature, index] of __VLS_getVForSourceType((__VLS_ctx.currentStepContent.features))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                key: (index),
                ...{ class: "feature-item" },
            });
            const __VLS_41 = {}.IconCheckCircle;
            /** @type {[typeof __VLS_components.IconCheckCircle, typeof __VLS_components.iconCheckCircle, ]} */ ;
            // @ts-ignore
            const __VLS_42 = __VLS_asFunctionalComponent(__VLS_41, new __VLS_41({
                ...{ class: "feature-icon" },
            }));
            const __VLS_43 = __VLS_42({
                ...{ class: "feature-icon" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_42));
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
            (feature);
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "step-actions" },
        });
        if (__VLS_ctx.currentStep > 0) {
            const __VLS_45 = {}.AButton;
            /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
            // @ts-ignore
            const __VLS_46 = __VLS_asFunctionalComponent(__VLS_45, new __VLS_45({
                ...{ 'onClick': {} },
            }));
            const __VLS_47 = __VLS_46({
                ...{ 'onClick': {} },
            }, ...__VLS_functionalComponentArgsRest(__VLS_46));
            let __VLS_49;
            let __VLS_50;
            let __VLS_51;
            const __VLS_52 = {
                onClick: (__VLS_ctx.prevStep)
            };
            __VLS_48.slots.default;
            var __VLS_48;
        }
        const __VLS_53 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
        // @ts-ignore
        const __VLS_54 = __VLS_asFunctionalComponent(__VLS_53, new __VLS_53({
            ...{ 'onClick': {} },
            type: "primary",
        }));
        const __VLS_55 = __VLS_54({
            ...{ 'onClick': {} },
            type: "primary",
        }, ...__VLS_functionalComponentArgsRest(__VLS_54));
        let __VLS_57;
        let __VLS_58;
        let __VLS_59;
        const __VLS_60 = {
            onClick: (__VLS_ctx.nextStep)
        };
        __VLS_56.slots.default;
        var __VLS_56;
    }
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "regular-user-content" },
    });
    const __VLS_61 = {}.ARow;
    /** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
    // @ts-ignore
    const __VLS_62 = __VLS_asFunctionalComponent(__VLS_61, new __VLS_61({}));
    const __VLS_63 = __VLS_62({}, ...__VLS_functionalComponentArgsRest(__VLS_62));
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
    const __VLS_69 = {}.ACard;
    /** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
    // @ts-ignore
    const __VLS_70 = __VLS_asFunctionalComponent(__VLS_69, new __VLS_69({
        title: "待办提醒",
        bordered: (false),
    }));
    const __VLS_71 = __VLS_70({
        title: "待办提醒",
        bordered: (false),
    }, ...__VLS_functionalComponentArgsRest(__VLS_70));
    __VLS_72.slots.default;
    const __VLS_73 = {}.AList;
    /** @type {[typeof __VLS_components.AList, typeof __VLS_components.aList, typeof __VLS_components.AList, typeof __VLS_components.aList, ]} */ ;
    // @ts-ignore
    const __VLS_74 = __VLS_asFunctionalComponent(__VLS_73, new __VLS_73({
        data: (__VLS_ctx.todoList),
        maxHeight: (300),
    }));
    const __VLS_75 = __VLS_74({
        data: (__VLS_ctx.todoList),
        maxHeight: (300),
    }, ...__VLS_functionalComponentArgsRest(__VLS_74));
    __VLS_76.slots.default;
    {
        const { item: __VLS_thisSlot } = __VLS_76.slots;
        const [{ item }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_77 = {}.AListItem;
        /** @type {[typeof __VLS_components.AListItem, typeof __VLS_components.aListItem, typeof __VLS_components.AListItem, typeof __VLS_components.aListItem, ]} */ ;
        // @ts-ignore
        const __VLS_78 = __VLS_asFunctionalComponent(__VLS_77, new __VLS_77({}));
        const __VLS_79 = __VLS_78({}, ...__VLS_functionalComponentArgsRest(__VLS_78));
        __VLS_80.slots.default;
        const __VLS_81 = {}.ASpace;
        /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
        // @ts-ignore
        const __VLS_82 = __VLS_asFunctionalComponent(__VLS_81, new __VLS_81({
            direction: "vertical",
            ...{ style: {} },
        }));
        const __VLS_83 = __VLS_82({
            direction: "vertical",
            ...{ style: {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_82));
        __VLS_84.slots.default;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "todo-item-header" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "ticket-id" },
        });
        (item.ticketId);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "ticket-title" },
        });
        (item.title);
        const __VLS_85 = {}.ASpace;
        /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
        // @ts-ignore
        const __VLS_86 = __VLS_asFunctionalComponent(__VLS_85, new __VLS_85({}));
        const __VLS_87 = __VLS_86({}, ...__VLS_functionalComponentArgsRest(__VLS_86));
        __VLS_88.slots.default;
        const __VLS_89 = {}.ATag;
        /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
        // @ts-ignore
        const __VLS_90 = __VLS_asFunctionalComponent(__VLS_89, new __VLS_89({}));
        const __VLS_91 = __VLS_90({}, ...__VLS_functionalComponentArgsRest(__VLS_90));
        __VLS_92.slots.default;
        (item.type);
        var __VLS_92;
        const __VLS_93 = {}.ATag;
        /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
        // @ts-ignore
        const __VLS_94 = __VLS_asFunctionalComponent(__VLS_93, new __VLS_93({
            color: (item.priority === '高' ? 'red' : item.priority === '中' ? 'orange' : 'blue'),
        }));
        const __VLS_95 = __VLS_94({
            color: (item.priority === '高' ? 'red' : item.priority === '中' ? 'orange' : 'blue'),
        }, ...__VLS_functionalComponentArgsRest(__VLS_94));
        __VLS_96.slots.default;
        (item.priority);
        var __VLS_96;
        const __VLS_97 = {}.ATag;
        /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
        // @ts-ignore
        const __VLS_98 = __VLS_asFunctionalComponent(__VLS_97, new __VLS_97({
            color: (item.status === '待处理' ? 'orange' : item.status === '待评审' ? 'blue' : 'cyan'),
        }));
        const __VLS_99 = __VLS_98({
            color: (item.status === '待处理' ? 'orange' : item.status === '待评审' ? 'blue' : 'cyan'),
        }, ...__VLS_functionalComponentArgsRest(__VLS_98));
        __VLS_100.slots.default;
        (item.status);
        var __VLS_100;
        var __VLS_88;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "todo-item-content" },
        });
        const __VLS_101 = {}.ATypographyParagraph;
        /** @type {[typeof __VLS_components.ATypographyParagraph, typeof __VLS_components.aTypographyParagraph, typeof __VLS_components.ATypographyParagraph, typeof __VLS_components.aTypographyParagraph, ]} */ ;
        // @ts-ignore
        const __VLS_102 = __VLS_asFunctionalComponent(__VLS_101, new __VLS_101({
            type: "secondary",
            ellipsis: ({ rows: 2 }),
        }));
        const __VLS_103 = __VLS_102({
            type: "secondary",
            ellipsis: ({ rows: 2 }),
        }, ...__VLS_functionalComponentArgsRest(__VLS_102));
        __VLS_104.slots.default;
        (item.description);
        var __VLS_104;
        const __VLS_105 = {}.ATypographyText;
        /** @type {[typeof __VLS_components.ATypographyText, typeof __VLS_components.aTypographyText, typeof __VLS_components.ATypographyText, typeof __VLS_components.aTypographyText, ]} */ ;
        // @ts-ignore
        const __VLS_106 = __VLS_asFunctionalComponent(__VLS_105, new __VLS_105({
            type: "secondary",
        }));
        const __VLS_107 = __VLS_106({
            type: "secondary",
        }, ...__VLS_functionalComponentArgsRest(__VLS_106));
        __VLS_108.slots.default;
        (item.deadline);
        var __VLS_108;
        var __VLS_84;
        var __VLS_80;
    }
    var __VLS_76;
    var __VLS_72;
    var __VLS_68;
    var __VLS_64;
}
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['welcome-modal']} */ ;
/** @type {__VLS_StyleScopedClasses['quick-start-guide']} */ ;
/** @type {__VLS_StyleScopedClasses['welcome-section']} */ ;
/** @type {__VLS_StyleScopedClasses['welcome-title']} */ ;
/** @type {__VLS_StyleScopedClasses['quick-start-card']} */ ;
/** @type {__VLS_StyleScopedClasses['welcome-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['guide-steps-container']} */ ;
/** @type {__VLS_StyleScopedClasses['guide-steps']} */ ;
/** @type {__VLS_StyleScopedClasses['guide-content']} */ ;
/** @type {__VLS_StyleScopedClasses['step-content']} */ ;
/** @type {__VLS_StyleScopedClasses['step-detail']} */ ;
/** @type {__VLS_StyleScopedClasses['step-description']} */ ;
/** @type {__VLS_StyleScopedClasses['step-features']} */ ;
/** @type {__VLS_StyleScopedClasses['feature-item']} */ ;
/** @type {__VLS_StyleScopedClasses['feature-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['step-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['regular-user-content']} */ ;
/** @type {__VLS_StyleScopedClasses['todo-item-header']} */ ;
/** @type {__VLS_StyleScopedClasses['ticket-id']} */ ;
/** @type {__VLS_StyleScopedClasses['ticket-title']} */ ;
/** @type {__VLS_StyleScopedClasses['todo-item-content']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            $props: __VLS_makeOptional(props),
            ...props,
            $emit: emit,
            IconCheckCircle: IconCheckCircle,
            modalTitle: modalTitle,
            currentStep: currentStep,
            guideStarted: guideStarted,
            currentStepContent: currentStepContent,
            startGuide: startGuide,
            prevStep: prevStep,
            nextStep: nextStep,
            todoList: todoList,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {
            $props: __VLS_makeOptional(props),
            ...props,
            $emit: emit,
        };
    },
});
; /* PartiallyEnd: #4569/main.vue */
