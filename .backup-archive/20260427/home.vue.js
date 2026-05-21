/// <reference types="../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import ArchitectureChart from '../../components/layout/ArchitectureChart.vue';
import { ref, onMounted, markRaw } from 'vue';
import HomeWelcomeModal from '../../components/modals/HomeWelcomeModal.vue';
import { useUserStore } from '../../store/modules/user';
import { Statistic } from '@arco-design/web-vue';
import { IconUser, IconDown, IconApps, IconFile, IconNotification, IconStorage, IconBook, IconBulb, IconArrowRise, IconArrowFall, IconQuestion, IconCompass, IconEye, IconCloud, IconStar, IconPlus } from '@arco-design/web-vue/es/icon';
const userStore = useUserStore();
const toggleDepartment = () => {
    const departments = ['risk', 'marketing', 'data'];
    const currentIndex = departments.indexOf(userStore.userInfo.department);
    const nextIndex = (currentIndex + 1) % departments.length;
    userStore.setUserDepartment(departments[nextIndex]);
};
// 控制欢迎弹窗
const showWelcomeModal = ref(false);
// 切换用户角色
const toggleUserRole = () => {
    userStore.isNewUser = !userStore.isNewUser;
};
// 初始化用户角色和欢迎弹窗
onMounted(async () => {
    const isNewUser = await userStore.checkUserRole();
    showWelcomeModal.value = true;
});
// 通知数据
const notices = ref([
    {
        id: 1,
        title: '数据社区平台使用指南V2.0发布',
        type: '使用指南',
        time: '2024-01-15 10:00'
    },
    {
        id: 2,
        title: '数据接口申请工单已审批通过',
        type: '工单进度',
        time: '2024-01-14 15:30'
    },
    {
        id: 3,
        title: '数据社区2024年度工作规划',
        type: '社区发布',
        time: '2024-01-13 09:00'
    },
    {
        id: 4,
        title: '数据治理最佳实践案例分享',
        type: '案例',
        time: '2024-01-12 16:45'
    }
]);
// 获取通知类型对应的颜色
const getNoticeTypeColor = (type) => {
    const colorMap = {
        '使用指南': 'blue',
        '工单进度': 'green',
        '社区发布': 'purple',
        '案例': 'orange'
    };
    return colorMap[type] || 'blue';
};
// 待办数据
const todos = ref([
    {
        id: 1,
        title: '数据质量周报审核',
        priority: '高',
        deadline: '2024-01-16 18:00'
    },
    {
        id: 2,
        title: '新增数据接口评审',
        priority: '中',
        deadline: '2024-01-17 12:00'
    },
    {
        id: 3,
        title: '数据安全培训',
        priority: '低',
        deadline: '2024-01-18 15:00'
    },
    {
        id: 4,
        title: '月度数据统计报告',
        priority: '高',
        deadline: '2024-01-19 17:00'
    }
]);
// 使用markRaw包装图标组件
const icons = {
    IconQuestion: markRaw(IconQuestion),
    IconCompass: markRaw(IconCompass),
    IconEye: markRaw(IconEye),
    IconApps: markRaw(IconApps)
};
const username = ref('张珊');
const department = ref('数学部');
const activeMenu = ref('home');
// 快速通道数据
const quickChannels = ref([
    { id: 1, icon: icons.IconQuestion, name: '客户360', path: '/customer360' },
    { id: 2, icon: icons.IconCompass, name: '数据地图', path: '/data-map' },
    { id: 3, icon: icons.IconEye, name: '消费中心', path: '/consumption' }
]);
// 添加快捷方式弹窗
const showAddDialog = ref(false);
const newChannel = ref({
    name: '',
    path: ''
});
// 可选的页面路径
const availablePaths = [
    { label: '首页', value: '/home' },
    { label: '数据发现', value: '/discovery/external' },
    { label: '数据管理', value: '/management/service' },
    { label: '数据探索', value: '/exploration' },
    { label: '营销分析', value: '/marketing' }
];
// 添加快捷方式
const handleAddChannel = () => {
    if (newChannel.value.name && newChannel.value.path) {
        quickChannels.value.push({
            id: Date.now(),
            icon: icons.IconApps,
            name: newChannel.value.name,
            path: newChannel.value.path
        });
        newChannel.value = { name: '', path: '' };
        showAddDialog.value = false;
    }
};
// 跳转到对应页面
const navigateToPath = (path) => {
    if (path) {
        router.push(path);
    }
};
// 指标卡片数据
const metrics = ref([
    {
        title: '上日在途余额',
        value: 1234.56,
        trend: 'up',
        color: '#0fbf60',
        dayOverDay: 2.3 // 较前一日
    },
    {
        title: '上日放款金额',
        value: 987.65,
        trend: 'down',
        color: '#f53f3f',
        dayOverDay: -1.5
    },
    {
        title: '上日还款金额',
        value: 876.54,
        trend: 'up',
        color: '#0fbf60',
        dayOverDay: 3.2
    },
    {
        title: '上日在途加权定价',
        value: 765.43,
        trend: 'down',
        color: '#f53f3f',
        dayOverDay: -0.8
    }
]);
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['left-column']} */ 
/** @type {__VLS_StyleScopedClasses['right-column']} */ 
/** @type {__VLS_StyleScopedClasses['card-container']} */ 
/** @type {__VLS_StyleScopedClasses['right-column']} */ 
/** @type {__VLS_StyleScopedClasses['card-container']} */ 
/** @type {__VLS_StyleScopedClasses['architecture-column']} */ 
/** @type {__VLS_StyleScopedClasses['card-container']} */ 
/** @type {__VLS_StyleScopedClasses['notice-column']} */ 
/** @type {__VLS_StyleScopedClasses['card-container']} */ 
/** @type {__VLS_StyleScopedClasses['action-item']} */ 
/** @type {__VLS_StyleScopedClasses['action-item']} */ 
/** @type {__VLS_StyleScopedClasses['action-icon']} */ 
/** @type {__VLS_StyleScopedClasses['action-item']} */ 
/** @type {__VLS_StyleScopedClasses['metric-card']} */ 
/** @type {__VLS_StyleScopedClasses['nav-menu']} */ 
/** @type {__VLS_StyleScopedClasses['nav-menu']} */ 
/** @type {__VLS_StyleScopedClasses['nav-menu']} */ 
/** @type {__VLS_StyleScopedClasses['arco-menu-item']} */ 
/** @type {__VLS_StyleScopedClasses['card-container']} */ 
/** @type {__VLS_StyleScopedClasses['card-container']} */ 
/** @type {__VLS_StyleScopedClasses['card-container']} */ 
/** @type {__VLS_StyleScopedClasses['card-container']} */ 
/** @type {__VLS_StyleScopedClasses['user-stats']} */ 
/** @type {__VLS_StyleScopedClasses['stat-item']} */ 
/** @type {__VLS_StyleScopedClasses['stat-item']} */ 
/** @type {__VLS_StyleScopedClasses['stat-value']} */ 
/** @type {__VLS_StyleScopedClasses['stat-label']} */ 
/** @type {__VLS_StyleScopedClasses['channel-item-compact']} */ 
/** @type {__VLS_StyleScopedClasses['channel-item-compact']} */ 
/** @type {__VLS_StyleScopedClasses['channel-icon-compact']} */ 
/** @type {__VLS_StyleScopedClasses['channel-item-compact']} */ 
/** @type {__VLS_StyleScopedClasses['community-item-compact']} */ 
/** @type {__VLS_StyleScopedClasses['community-item-compact']} */ 
/** @type {__VLS_StyleScopedClasses['community-icon-compact']} */ 
/** @type {__VLS_StyleScopedClasses['metric-card']} */ 
/** @type {__VLS_StyleScopedClasses['arco-card-body']} */ 
/** @type {__VLS_StyleScopedClasses['metric-card']} */ 
/** @type {__VLS_StyleScopedClasses['metric-card']} */ 
/** @type {__VLS_StyleScopedClasses['architecture-chart']} */ 
/** @type {__VLS_StyleScopedClasses['notice-title']} */ 
// CSS variable injection 
// CSS variable injection end 
const __VLS_0 = {}.ALayout;
/** @type {[typeof __VLS_components.ALayout, typeof __VLS_components.aLayout, typeof __VLS_components.ALayout, typeof __VLS_components.aLayout, ]} */ 
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ class: "layout-container" },
}));
const __VLS_2 = __VLS_1({
    ...{ class: "layout-container" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
const __VLS_4 = {};
__VLS_3.slots.default;
const __VLS_5 = {}.ALayoutHeader;
/** @type {[typeof __VLS_components.ALayoutHeader, typeof __VLS_components.aLayoutHeader, typeof __VLS_components.ALayoutHeader, typeof __VLS_components.aLayoutHeader, ]} */ 
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent(__VLS_5, new __VLS_5({
    ...{ class: "header" },
}));
const __VLS_7 = __VLS_6({
    ...{ class: "header" },
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
__VLS_8.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "logo" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
    src: "../../assets/logo.svg",
    alt: "logo",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "nav-menu" },
});
const __VLS_9 = {}.AMenu;
/** @type {[typeof __VLS_components.AMenu, typeof __VLS_components.aMenu, typeof __VLS_components.AMenu, typeof __VLS_components.aMenu, ]} */ 
// @ts-ignore
const __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({
    mode: "horizontal",
    selectedKeys: ([__VLS_ctx.activeMenu]),
}));
const __VLS_11 = __VLS_10({
    mode: "horizontal",
    selectedKeys: ([__VLS_ctx.activeMenu]),
}, ...__VLS_functionalComponentArgsRest(__VLS_10));
__VLS_12.slots.default;
const __VLS_13 = {}.AMenuItem;
/** @type {[typeof __VLS_components.AMenuItem, typeof __VLS_components.aMenuItem, typeof __VLS_components.AMenuItem, typeof __VLS_components.aMenuItem, ]} */ 
// @ts-ignore
const __VLS_14 = __VLS_asFunctionalComponent(__VLS_13, new __VLS_13({
    ...{ 'onClick': {} },
    key: "home",
}));
const __VLS_15 = __VLS_14({
    ...{ 'onClick': {} },
    key: "home",
}, ...__VLS_functionalComponentArgsRest(__VLS_14));
let __VLS_17;
let __VLS_18;
let __VLS_19;
const __VLS_20 = {
    onClick: (...[$event]) => {
        __VLS_ctx.$router.push('/home');
    }
};
__VLS_16.slots.default;
let __VLS_16;
const __VLS_21 = {}.AMenuItem;
/** @type {[typeof __VLS_components.AMenuItem, typeof __VLS_components.aMenuItem, typeof __VLS_components.AMenuItem, typeof __VLS_components.aMenuItem, ]} */ 
// @ts-ignore
const __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({
    ...{ 'onClick': {} },
    key: "discovery",
}));
const __VLS_23 = __VLS_22({
    ...{ 'onClick': {} },
    key: "discovery",
}, ...__VLS_functionalComponentArgsRest(__VLS_22));
let __VLS_25;
let __VLS_26;
let __VLS_27;
const __VLS_28 = {
    onClick: (...[$event]) => {
        __VLS_ctx.$router.push('/discovery/external');
    }
};
__VLS_24.slots.default;
let __VLS_24;
const __VLS_29 = {}.AMenuItem;
/** @type {[typeof __VLS_components.AMenuItem, typeof __VLS_components.aMenuItem, typeof __VLS_components.AMenuItem, typeof __VLS_components.aMenuItem, ]} */ 
// @ts-ignore
const __VLS_30 = __VLS_asFunctionalComponent(__VLS_29, new __VLS_29({
    ...{ 'onClick': {} },
    key: "management",
}));
const __VLS_31 = __VLS_30({
    ...{ 'onClick': {} },
    key: "management",
}, ...__VLS_functionalComponentArgsRest(__VLS_30));
let __VLS_33;
let __VLS_34;
let __VLS_35;
const __VLS_36 = {
    onClick: (...[$event]) => {
        __VLS_ctx.$router.push('/management/service');
    }
};
__VLS_32.slots.default;
let __VLS_32;
const __VLS_37 = {}.AMenuItem;
/** @type {[typeof __VLS_components.AMenuItem, typeof __VLS_components.aMenuItem, typeof __VLS_components.AMenuItem, typeof __VLS_components.aMenuItem, ]} */ 
// @ts-ignore
const __VLS_38 = __VLS_asFunctionalComponent(__VLS_37, new __VLS_37({
    ...{ 'onClick': {} },
    key: "exploration",
}));
const __VLS_39 = __VLS_38({
    ...{ 'onClick': {} },
    key: "exploration",
}, ...__VLS_functionalComponentArgsRest(__VLS_38));
let __VLS_41;
let __VLS_42;
let __VLS_43;
const __VLS_44 = {
    onClick: (...[$event]) => {
        __VLS_ctx.$router.push('/exploration');
    }
};
__VLS_40.slots.default;
let __VLS_40;
const __VLS_45 = {}.AMenuItem;
/** @type {[typeof __VLS_components.AMenuItem, typeof __VLS_components.aMenuItem, typeof __VLS_components.AMenuItem, typeof __VLS_components.aMenuItem, ]} */ 
// @ts-ignore
const __VLS_46 = __VLS_asFunctionalComponent(__VLS_45, new __VLS_45({
    ...{ 'onClick': {} },
    key: "digital-marketing",
}));
const __VLS_47 = __VLS_46({
    ...{ 'onClick': {} },
    key: "digital-marketing",
}, ...__VLS_functionalComponentArgsRest(__VLS_46));
let __VLS_49;
let __VLS_50;
let __VLS_51;
const __VLS_52 = {
    onClick: (...[$event]) => {
        __VLS_ctx.$router.push('/digital-marketing');
    }
};
__VLS_48.slots.default;
let __VLS_48;
let __VLS_12;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "header-right" },
});
const __VLS_53 = {}.ASpace;
/** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ 
// @ts-ignore
const __VLS_54 = __VLS_asFunctionalComponent(__VLS_53, new __VLS_53({}));
const __VLS_55 = __VLS_54({}, ...__VLS_functionalComponentArgsRest(__VLS_54));
__VLS_56.slots.default;
const __VLS_57 = {}.AButtonGroup;
/** @type {[typeof __VLS_components.AButtonGroup, typeof __VLS_components.aButtonGroup, typeof __VLS_components.AButtonGroup, typeof __VLS_components.aButtonGroup, ]} */ 
// @ts-ignore
const __VLS_58 = __VLS_asFunctionalComponent(__VLS_57, new __VLS_57({}));
const __VLS_59 = __VLS_58({}, ...__VLS_functionalComponentArgsRest(__VLS_58));
__VLS_60.slots.default;
const __VLS_61 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
// @ts-ignore
const __VLS_62 = __VLS_asFunctionalComponent(__VLS_61, new __VLS_61({
    ...{ 'onClick': {} },
    type: "outline",
    size: "small",
}));
const __VLS_63 = __VLS_62({
    ...{ 'onClick': {} },
    type: "outline",
    size: "small",
}, ...__VLS_functionalComponentArgsRest(__VLS_62));
let __VLS_65;
let __VLS_66;
let __VLS_67;
const __VLS_68 = {
    onClick: (__VLS_ctx.toggleUserRole)
};
__VLS_64.slots.default;
let __VLS_64;
const __VLS_69 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
// @ts-ignore
const __VLS_70 = __VLS_asFunctionalComponent(__VLS_69, new __VLS_69({
    ...{ 'onClick': {} },
    type: "outline",
    size: "small",
}));
const __VLS_71 = __VLS_70({
    ...{ 'onClick': {} },
    type: "outline",
    size: "small",
}, ...__VLS_functionalComponentArgsRest(__VLS_70));
let __VLS_73;
let __VLS_74;
let __VLS_75;
const __VLS_76 = {
    onClick: (__VLS_ctx.toggleDepartment)
};
__VLS_72.slots.default;
let __VLS_72;
const __VLS_77 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
// @ts-ignore
const __VLS_78 = __VLS_asFunctionalComponent(__VLS_77, new __VLS_77({
    ...{ 'onClick': {} },
    type: "outline",
    size: "small",
}));
const __VLS_79 = __VLS_78({
    ...{ 'onClick': {} },
    type: "outline",
    size: "small",
}, ...__VLS_functionalComponentArgsRest(__VLS_78));
let __VLS_81;
let __VLS_82;
let __VLS_83;
const __VLS_84 = {
    onClick: (...[$event]) => {
        __VLS_ctx.showWelcomeModal = true;
    }
};
__VLS_80.slots.default;
let __VLS_80;
let __VLS_60;
const __VLS_85 = {}.AAvatar;
/** @type {[typeof __VLS_components.AAvatar, typeof __VLS_components.aAvatar, typeof __VLS_components.AAvatar, typeof __VLS_components.aAvatar, ]} */ 
// @ts-ignore
const __VLS_86 = __VLS_asFunctionalComponent(__VLS_85, new __VLS_85({}));
const __VLS_87 = __VLS_86({}, ...__VLS_functionalComponentArgsRest(__VLS_86));
__VLS_88.slots.default;
const __VLS_89 = {}.IconUser;
/** @type {[typeof __VLS_components.IconUser, ]} */ 
// @ts-ignore
const __VLS_90 = __VLS_asFunctionalComponent(__VLS_89, new __VLS_89({}));
const __VLS_91 = __VLS_90({}, ...__VLS_functionalComponentArgsRest(__VLS_90));
let __VLS_88;
const __VLS_93 = {}.ADropdown;
/** @type {[typeof __VLS_components.ADropdown, typeof __VLS_components.aDropdown, typeof __VLS_components.ADropdown, typeof __VLS_components.aDropdown, ]} */ 
// @ts-ignore
const __VLS_94 = __VLS_asFunctionalComponent(__VLS_93, new __VLS_93({}));
const __VLS_95 = __VLS_94({}, ...__VLS_functionalComponentArgsRest(__VLS_94));
__VLS_96.slots.default;
const __VLS_97 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
// @ts-ignore
const __VLS_98 = __VLS_asFunctionalComponent(__VLS_97, new __VLS_97({
    type: "text",
}));
const __VLS_99 = __VLS_98({
    type: "text",
}, ...__VLS_functionalComponentArgsRest(__VLS_98));
__VLS_100.slots.default;
(__VLS_ctx.userStore.userInfo.username);
const __VLS_101 = {}.IconDown;
/** @type {[typeof __VLS_components.IconDown, ]} */ 
// @ts-ignore
const __VLS_102 = __VLS_asFunctionalComponent(__VLS_101, new __VLS_101({}));
const __VLS_103 = __VLS_102({}, ...__VLS_functionalComponentArgsRest(__VLS_102));
let __VLS_100;
{
    const { content: __VLS_thisSlot } = __VLS_96.slots;
    const __VLS_105 = {}.ADoption;
    /** @type {[typeof __VLS_components.ADoption, typeof __VLS_components.aDoption, typeof __VLS_components.ADoption, typeof __VLS_components.aDoption, ]} */ 
    // @ts-ignore
    const __VLS_106 = __VLS_asFunctionalComponent(__VLS_105, new __VLS_105({}));
    const __VLS_107 = __VLS_106({}, ...__VLS_functionalComponentArgsRest(__VLS_106));
    __VLS_108.slots.default;
    let __VLS_108;
    const __VLS_109 = {}.ADoption;
    /** @type {[typeof __VLS_components.ADoption, typeof __VLS_components.aDoption, typeof __VLS_components.ADoption, typeof __VLS_components.aDoption, ]} */ 
    // @ts-ignore
    const __VLS_110 = __VLS_asFunctionalComponent(__VLS_109, new __VLS_109({}));
    const __VLS_111 = __VLS_110({}, ...__VLS_functionalComponentArgsRest(__VLS_110));
    __VLS_112.slots.default;
    let __VLS_112;
}
let __VLS_96;
let __VLS_56;
let __VLS_8;
const __VLS_113 = {}.ALayout;
/** @type {[typeof __VLS_components.ALayout, typeof __VLS_components.aLayout, typeof __VLS_components.ALayout, typeof __VLS_components.aLayout, ]} */ 
// @ts-ignore
const __VLS_114 = __VLS_asFunctionalComponent(__VLS_113, new __VLS_113({}));
const __VLS_115 = __VLS_114({}, ...__VLS_functionalComponentArgsRest(__VLS_114));
__VLS_116.slots.default;
const __VLS_117 = {}.ALayoutContent;
/** @type {[typeof __VLS_components.ALayoutContent, typeof __VLS_components.aLayoutContent, typeof __VLS_components.ALayoutContent, typeof __VLS_components.aLayoutContent, ]} */ 
// @ts-ignore
const __VLS_118 = __VLS_asFunctionalComponent(__VLS_117, new __VLS_117({
    ...{ class: "content" },
}));
const __VLS_119 = __VLS_118({
    ...{ class: "content" },
}, ...__VLS_functionalComponentArgsRest(__VLS_118));
__VLS_120.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "welcome-banner" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "banner-content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "welcome-text" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
(__VLS_ctx.username);
const __VLS_121 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ 
// @ts-ignore
const __VLS_122 = __VLS_asFunctionalComponent(__VLS_121, new __VLS_121({
    gutter: (12),
    ...{ class: "main-content-row" },
}));
const __VLS_123 = __VLS_122({
    gutter: (12),
    ...{ class: "main-content-row" },
}, ...__VLS_functionalComponentArgsRest(__VLS_122));
__VLS_124.slots.default;
const __VLS_125 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ 
// @ts-ignore
const __VLS_126 = __VLS_asFunctionalComponent(__VLS_125, new __VLS_125({
    span: (6),
    ...{ class: "left-column" },
}));
const __VLS_127 = __VLS_126({
    span: (6),
    ...{ class: "left-column" },
}, ...__VLS_functionalComponentArgsRest(__VLS_126));
__VLS_128.slots.default;
const __VLS_129 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ 
// @ts-ignore
const __VLS_130 = __VLS_asFunctionalComponent(__VLS_129, new __VLS_129({
    ...{ class: "card-container" },
}));
const __VLS_131 = __VLS_130({
    ...{ class: "card-container" },
}, ...__VLS_functionalComponentArgsRest(__VLS_130));
__VLS_132.slots.default;
{
    const { title: __VLS_thisSlot } = __VLS_132.slots;
}
{
    const { extra: __VLS_thisSlot } = __VLS_132.slots;
    const __VLS_133 = {}.ABadge;
    /** @type {[typeof __VLS_components.ABadge, typeof __VLS_components.aBadge, typeof __VLS_components.ABadge, typeof __VLS_components.aBadge, ]} */ 
    // @ts-ignore
    const __VLS_134 = __VLS_asFunctionalComponent(__VLS_133, new __VLS_133({
        count: (3),
        offset: ([10, 0]),
    }));
    const __VLS_135 = __VLS_134({
        count: (3),
        offset: ([10, 0]),
    }, ...__VLS_functionalComponentArgsRest(__VLS_134));
    __VLS_136.slots.default;
    const __VLS_137 = {}.IconNotification;
    /** @type {[typeof __VLS_components.IconNotification, ]} */ 
    // @ts-ignore
    const __VLS_138 = __VLS_asFunctionalComponent(__VLS_137, new __VLS_137({
        ...{ style: {} },
    }));
    const __VLS_139 = __VLS_138({
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_138));
    let __VLS_136;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "identity-info" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "user-profile" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "avatar-container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
    src: "/squirrel-avatar.svg",
    alt: "avatar",
    ...{ class: "avatar-image" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "online-indicator" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "user-details" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
    ...{ class: "user-name" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "department" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "user-stats" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "stat-value" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "stat-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "stat-value" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "stat-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "stat-value" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "stat-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "quick-actions" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "action-item" },
});
const __VLS_141 = {}.IconUser;
/** @type {[typeof __VLS_components.IconUser, ]} */ 
// @ts-ignore
const __VLS_142 = __VLS_asFunctionalComponent(__VLS_141, new __VLS_141({
    ...{ class: "action-icon" },
}));
const __VLS_143 = __VLS_142({
    ...{ class: "action-icon" },
}, ...__VLS_functionalComponentArgsRest(__VLS_142));
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "action-item" },
});
const __VLS_145 = {}.IconStorage;
/** @type {[typeof __VLS_components.IconStorage, ]} */ 
// @ts-ignore
const __VLS_146 = __VLS_asFunctionalComponent(__VLS_145, new __VLS_145({
    ...{ class: "action-icon" },
}));
const __VLS_147 = __VLS_146({
    ...{ class: "action-icon" },
}, ...__VLS_functionalComponentArgsRest(__VLS_146));
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "action-item" },
});
const __VLS_149 = {}.IconFile;
/** @type {[typeof __VLS_components.IconFile, ]} */ 
// @ts-ignore
const __VLS_150 = __VLS_asFunctionalComponent(__VLS_149, new __VLS_149({
    ...{ class: "action-icon" },
}));
const __VLS_151 = __VLS_150({
    ...{ class: "action-icon" },
}, ...__VLS_functionalComponentArgsRest(__VLS_150));
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
let __VLS_132;
const __VLS_153 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ 
// @ts-ignore
const __VLS_154 = __VLS_asFunctionalComponent(__VLS_153, new __VLS_153({
    ...{ class: "card-container" },
}));
const __VLS_155 = __VLS_154({
    ...{ class: "card-container" },
}, ...__VLS_functionalComponentArgsRest(__VLS_154));
__VLS_156.slots.default;
{
    const { title: __VLS_thisSlot } = __VLS_156.slots;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "quick-channel-compact" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "channel-row" },
});
for (const [channel] of __VLS_getVForSourceType((__VLS_ctx.quickChannels.slice(0, 4)))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.navigateToPath(channel.path);
            } },
        key: (channel.id),
        ...{ class: "channel-item-compact" },
    });
    const __VLS_157 = ((channel.icon));
    // @ts-ignore
    const __VLS_158 = __VLS_asFunctionalComponent(__VLS_157, new __VLS_157({
        ...{ class: "channel-icon-compact" },
    }));
    const __VLS_159 = __VLS_158({
        ...{ class: "channel-icon-compact" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_158));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (channel.name);
}
const __VLS_161 = {}.AModal;
/** @type {[typeof __VLS_components.AModal, typeof __VLS_components.aModal, typeof __VLS_components.AModal, typeof __VLS_components.aModal, ]} */ 
// @ts-ignore
const __VLS_162 = __VLS_asFunctionalComponent(__VLS_161, new __VLS_161({
    ...{ 'onOk': {} },
    ...{ 'onCancel': {} },
    visible: (__VLS_ctx.showAddDialog),
    title: "添加快捷方式",
}));
const __VLS_163 = __VLS_162({
    ...{ 'onOk': {} },
    ...{ 'onCancel': {} },
    visible: (__VLS_ctx.showAddDialog),
    title: "添加快捷方式",
}, ...__VLS_functionalComponentArgsRest(__VLS_162));
let __VLS_165;
let __VLS_166;
let __VLS_167;
const __VLS_168 = {
    onOk: (__VLS_ctx.handleAddChannel)
};
const __VLS_169 = {
    onCancel: (...[$event]) => {
        __VLS_ctx.showAddDialog = false;
    }
};
__VLS_164.slots.default;
const __VLS_170 = {}.AForm;
/** @type {[typeof __VLS_components.AForm, typeof __VLS_components.aForm, typeof __VLS_components.AForm, typeof __VLS_components.aForm, ]} */ 
// @ts-ignore
const __VLS_171 = __VLS_asFunctionalComponent(__VLS_170, new __VLS_170({
    model: (__VLS_ctx.newChannel),
}));
const __VLS_172 = __VLS_171({
    model: (__VLS_ctx.newChannel),
}, ...__VLS_functionalComponentArgsRest(__VLS_171));
__VLS_173.slots.default;
const __VLS_174 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_175 = __VLS_asFunctionalComponent(__VLS_174, new __VLS_174({
    field: "name",
    label: "名称",
}));
const __VLS_176 = __VLS_175({
    field: "name",
    label: "名称",
}, ...__VLS_functionalComponentArgsRest(__VLS_175));
__VLS_177.slots.default;
const __VLS_178 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ 
// @ts-ignore
const __VLS_179 = __VLS_asFunctionalComponent(__VLS_178, new __VLS_178({
    modelValue: (__VLS_ctx.newChannel.name),
    placeholder: "请输入快捷方式名称",
}));
const __VLS_180 = __VLS_179({
    modelValue: (__VLS_ctx.newChannel.name),
    placeholder: "请输入快捷方式名称",
}, ...__VLS_functionalComponentArgsRest(__VLS_179));
let __VLS_177;
const __VLS_182 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_183 = __VLS_asFunctionalComponent(__VLS_182, new __VLS_182({
    field: "path",
    label: "页面路径",
}));
const __VLS_184 = __VLS_183({
    field: "path",
    label: "页面路径",
}, ...__VLS_functionalComponentArgsRest(__VLS_183));
__VLS_185.slots.default;
const __VLS_186 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ 
// @ts-ignore
const __VLS_187 = __VLS_asFunctionalComponent(__VLS_186, new __VLS_186({
    modelValue: (__VLS_ctx.newChannel.path),
    placeholder: "请选择页面路径",
}));
const __VLS_188 = __VLS_187({
    modelValue: (__VLS_ctx.newChannel.path),
    placeholder: "请选择页面路径",
}, ...__VLS_functionalComponentArgsRest(__VLS_187));
__VLS_189.slots.default;
for (const [path] of __VLS_getVForSourceType((__VLS_ctx.availablePaths))) {
    const __VLS_190 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
    // @ts-ignore
    const __VLS_191 = __VLS_asFunctionalComponent(__VLS_190, new __VLS_190({
        key: (path.value),
        value: (path.value),
    }));
    const __VLS_192 = __VLS_191({
        key: (path.value),
        value: (path.value),
    }, ...__VLS_functionalComponentArgsRest(__VLS_191));
    __VLS_193.slots.default;
    (path.label);
    var __VLS_193;
}
let __VLS_189;
let __VLS_185;
let __VLS_173;
let __VLS_164;
let __VLS_156;
const __VLS_194 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ 
// @ts-ignore
const __VLS_195 = __VLS_asFunctionalComponent(__VLS_194, new __VLS_194({
    ...{ class: "card-container" },
}));
const __VLS_196 = __VLS_195({
    ...{ class: "card-container" },
}, ...__VLS_functionalComponentArgsRest(__VLS_195));
__VLS_197.slots.default;
{
    const { title: __VLS_thisSlot } = __VLS_197.slots;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "community-links-compact" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "community-row" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "community-item-compact" },
});
const __VLS_198 = {}.IconBook;
/** @type {[typeof __VLS_components.IconBook, ]} */ 
// @ts-ignore
const __VLS_199 = __VLS_asFunctionalComponent(__VLS_198, new __VLS_198({
    ...{ class: "community-icon-compact" },
}));
const __VLS_200 = __VLS_199({
    ...{ class: "community-icon-compact" },
}, ...__VLS_functionalComponentArgsRest(__VLS_199));
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "community-item-compact" },
});
const __VLS_202 = {}.IconFile;
/** @type {[typeof __VLS_components.IconFile, ]} */ 
// @ts-ignore
const __VLS_203 = __VLS_asFunctionalComponent(__VLS_202, new __VLS_202({
    ...{ class: "community-icon-compact" },
}));
const __VLS_204 = __VLS_203({
    ...{ class: "community-icon-compact" },
}, ...__VLS_functionalComponentArgsRest(__VLS_203));
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "community-item-compact" },
});
const __VLS_206 = {}.IconNotification;
/** @type {[typeof __VLS_components.IconNotification, ]} */ 
// @ts-ignore
const __VLS_207 = __VLS_asFunctionalComponent(__VLS_206, new __VLS_206({
    ...{ class: "community-icon-compact" },
}));
const __VLS_208 = __VLS_207({
    ...{ class: "community-icon-compact" },
}, ...__VLS_functionalComponentArgsRest(__VLS_207));
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "community-item-compact" },
});
const __VLS_210 = {}.IconBulb;
/** @type {[typeof __VLS_components.IconBulb, ]} */ 
// @ts-ignore
const __VLS_211 = __VLS_asFunctionalComponent(__VLS_210, new __VLS_210({
    ...{ class: "community-icon-compact" },
}));
const __VLS_212 = __VLS_211({
    ...{ class: "community-icon-compact" },
}, ...__VLS_functionalComponentArgsRest(__VLS_211));
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
let __VLS_197;
let __VLS_128;
const __VLS_214 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ 
// @ts-ignore
const __VLS_215 = __VLS_asFunctionalComponent(__VLS_214, new __VLS_214({
    span: (18),
    ...{ class: "right-column" },
}));
const __VLS_216 = __VLS_215({
    span: (18),
    ...{ class: "right-column" },
}, ...__VLS_functionalComponentArgsRest(__VLS_215));
__VLS_217.slots.default;
const __VLS_218 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ 
// @ts-ignore
const __VLS_219 = __VLS_asFunctionalComponent(__VLS_218, new __VLS_218({
    title: "社区数据站",
    ...{ class: "card-container" },
}));
const __VLS_220 = __VLS_219({
    title: "社区数据站",
    ...{ class: "card-container" },
}, ...__VLS_functionalComponentArgsRest(__VLS_219));
__VLS_221.slots.default;
const __VLS_222 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ 
// @ts-ignore
const __VLS_223 = __VLS_asFunctionalComponent(__VLS_222, new __VLS_222({
    gutter: (12),
    ...{ class: "metric-cards" },
}));
const __VLS_224 = __VLS_223({
    gutter: (12),
    ...{ class: "metric-cards" },
}, ...__VLS_functionalComponentArgsRest(__VLS_223));
__VLS_225.slots.default;
for (const [metric] of __VLS_getVForSourceType((__VLS_ctx.metrics))) {
    const __VLS_226 = {}.ACol;
    /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ 
    // @ts-ignore
    const __VLS_227 = __VLS_asFunctionalComponent(__VLS_226, new __VLS_226({
        span: (6),
        key: (metric.title),
    }));
    const __VLS_228 = __VLS_227({
        span: (6),
        key: (metric.title),
    }, ...__VLS_functionalComponentArgsRest(__VLS_227));
    __VLS_229.slots.default;
    const __VLS_230 = {}.ACard;
    /** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ 
    // @ts-ignore
    const __VLS_231 = __VLS_asFunctionalComponent(__VLS_230, new __VLS_230({
        ...{ class: "metric-card" },
    }));
    const __VLS_232 = __VLS_231({
        ...{ class: "metric-card" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_231));
    __VLS_233.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "metric-content" },
    });
    const __VLS_234 = {}.AStatistic;
    /** @type {[typeof __VLS_components.AStatistic, typeof __VLS_components.aStatistic, typeof __VLS_components.AStatistic, typeof __VLS_components.aStatistic, ]} */ 
    // @ts-ignore
    const __VLS_235 = __VLS_asFunctionalComponent(__VLS_234, new __VLS_234({
        title: (metric.title),
        value: (metric.value),
        precision: (2),
        showGroupSeparator: true,
        suffix: "亿元",
        valueStyle: ({ color: metric.color }),
    }));
    const __VLS_236 = __VLS_235({
        title: (metric.title),
        value: (metric.value),
        precision: (2),
        showGroupSeparator: true,
        suffix: "亿元",
        valueStyle: ({ color: metric.color }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_235));
    __VLS_237.slots.default;
    {
        const { prefix: __VLS_thisSlot } = __VLS_237.slots;
        if (metric.trend === 'up') {
            const __VLS_238 = {}.IconArrowRise;
            /** @type {[typeof __VLS_components.IconArrowRise, typeof __VLS_components.iconArrowRise, ]} */ 
            // @ts-ignore
            const __VLS_239 = __VLS_asFunctionalComponent(__VLS_238, new __VLS_238({
                ...{ style: {} },
            }));
            const __VLS_240 = __VLS_239({
                ...{ style: {} },
            }, ...__VLS_functionalComponentArgsRest(__VLS_239));
        }
        else {
            const __VLS_242 = {}.IconArrowFall;
            /** @type {[typeof __VLS_components.IconArrowFall, typeof __VLS_components.iconArrowFall, ]} */ 
            // @ts-ignore
            const __VLS_243 = __VLS_asFunctionalComponent(__VLS_242, new __VLS_242({
                ...{ style: {} },
            }));
            const __VLS_244 = __VLS_243({
                ...{ style: {} },
            }, ...__VLS_functionalComponentArgsRest(__VLS_243));
        }
    }
    var __VLS_237;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "comparison-data" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "comparison-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ style: ({ color: metric.dayOverDay >= 0 ? '#0fbf60' : '#f53f3f' }) },
    });
    (metric.dayOverDay >= 0 ? '+' : '');
    (metric.dayOverDay);
    var __VLS_233;
    var __VLS_229;
}
let __VLS_225;
let __VLS_221;
const __VLS_246 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ 
// @ts-ignore
const __VLS_247 = __VLS_asFunctionalComponent(__VLS_246, new __VLS_246({
    gutter: (12),
    ...{ class: "bottom-row" },
}));
const __VLS_248 = __VLS_247({
    gutter: (12),
    ...{ class: "bottom-row" },
}, ...__VLS_functionalComponentArgsRest(__VLS_247));
__VLS_249.slots.default;
const __VLS_250 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ 
// @ts-ignore
const __VLS_251 = __VLS_asFunctionalComponent(__VLS_250, new __VLS_250({
    span: (16),
    ...{ class: "architecture-column" },
}));
const __VLS_252 = __VLS_251({
    span: (16),
    ...{ class: "architecture-column" },
}, ...__VLS_functionalComponentArgsRest(__VLS_251));
__VLS_253.slots.default;
const __VLS_254 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ 
// @ts-ignore
const __VLS_255 = __VLS_asFunctionalComponent(__VLS_254, new __VLS_254({
    title: "社区架构图",
    ...{ class: "card-container" },
}));
const __VLS_256 = __VLS_255({
    title: "社区架构图",
    ...{ class: "card-container" },
}, ...__VLS_functionalComponentArgsRest(__VLS_255));
__VLS_257.slots.default;
/** @type {[typeof ArchitectureChart, ]} */ 
// @ts-ignore
const __VLS_258 = __VLS_asFunctionalComponent(ArchitectureChart, new ArchitectureChart({}));
const __VLS_259 = __VLS_258({}, ...__VLS_functionalComponentArgsRest(__VLS_258));
let __VLS_257;
let __VLS_253;
const __VLS_261 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ 
// @ts-ignore
const __VLS_262 = __VLS_asFunctionalComponent(__VLS_261, new __VLS_261({
    span: (8),
    ...{ class: "notice-column" },
}));
const __VLS_263 = __VLS_262({
    span: (8),
    ...{ class: "notice-column" },
}, ...__VLS_functionalComponentArgsRest(__VLS_262));
__VLS_264.slots.default;
const __VLS_265 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ 
// @ts-ignore
const __VLS_266 = __VLS_asFunctionalComponent(__VLS_265, new __VLS_265({
    title: "通知公告",
    ...{ class: "card-container" },
}));
const __VLS_267 = __VLS_266({
    title: "通知公告",
    ...{ class: "card-container" },
}, ...__VLS_functionalComponentArgsRest(__VLS_266));
__VLS_268.slots.default;
const __VLS_269 = {}.ATabs;
/** @type {[typeof __VLS_components.ATabs, typeof __VLS_components.aTabs, typeof __VLS_components.ATabs, typeof __VLS_components.aTabs, ]} */ 
// @ts-ignore
const __VLS_270 = __VLS_asFunctionalComponent(__VLS_269, new __VLS_269({}));
const __VLS_271 = __VLS_270({}, ...__VLS_functionalComponentArgsRest(__VLS_270));
__VLS_272.slots.default;
const __VLS_273 = {}.ATabPane;
/** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ 
// @ts-ignore
const __VLS_274 = __VLS_asFunctionalComponent(__VLS_273, new __VLS_273({
    key: "notice",
    title: "通知",
}));
const __VLS_275 = __VLS_274({
    key: "notice",
    title: "通知",
}, ...__VLS_functionalComponentArgsRest(__VLS_274));
__VLS_276.slots.default;
const __VLS_277 = {}.AList;
/** @type {[typeof __VLS_components.AList, typeof __VLS_components.aList, typeof __VLS_components.AList, typeof __VLS_components.aList, ]} */ 
// @ts-ignore
const __VLS_278 = __VLS_asFunctionalComponent(__VLS_277, new __VLS_277({
    maxHeight: (400),
}));
const __VLS_279 = __VLS_278({
    maxHeight: (400),
}, ...__VLS_functionalComponentArgsRest(__VLS_278));
__VLS_280.slots.default;
for (const [notice] of __VLS_getVForSourceType((__VLS_ctx.notices))) {
    const __VLS_281 = {}.AListItem;
    /** @type {[typeof __VLS_components.AListItem, typeof __VLS_components.aListItem, typeof __VLS_components.AListItem, typeof __VLS_components.aListItem, ]} */ 
    // @ts-ignore
    const __VLS_282 = __VLS_asFunctionalComponent(__VLS_281, new __VLS_281({
        key: (notice.id),
    }));
    const __VLS_283 = __VLS_282({
        key: (notice.id),
    }, ...__VLS_functionalComponentArgsRest(__VLS_282));
    __VLS_284.slots.default;
    const __VLS_285 = {}.ASpace;
    /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ 
    // @ts-ignore
    const __VLS_286 = __VLS_asFunctionalComponent(__VLS_285, new __VLS_285({
        direction: "vertical",
        ...{ style: {} },
    }));
    const __VLS_287 = __VLS_286({
        direction: "vertical",
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_286));
    __VLS_288.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "notice-title" },
    });
    const __VLS_289 = {}.ATypographyText;
    /** @type {[typeof __VLS_components.ATypographyText, typeof __VLS_components.aTypographyText, typeof __VLS_components.ATypographyText, typeof __VLS_components.aTypographyText, ]} */ 
    // @ts-ignore
    const __VLS_290 = __VLS_asFunctionalComponent(__VLS_289, new __VLS_289({}));
    const __VLS_291 = __VLS_290({}, ...__VLS_functionalComponentArgsRest(__VLS_290));
    __VLS_292.slots.default;
    (notice.title);
    var __VLS_292;
    const __VLS_293 = {}.ATag;
    /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ 
    // @ts-ignore
    const __VLS_294 = __VLS_asFunctionalComponent(__VLS_293, new __VLS_293({
        color: (__VLS_ctx.getNoticeTypeColor(notice.type)),
    }));
    const __VLS_295 = __VLS_294({
        color: (__VLS_ctx.getNoticeTypeColor(notice.type)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_294));
    __VLS_296.slots.default;
    (notice.type);
    var __VLS_296;
    const __VLS_297 = {}.ATypographyText;
    /** @type {[typeof __VLS_components.ATypographyText, typeof __VLS_components.aTypographyText, typeof __VLS_components.ATypographyText, typeof __VLS_components.aTypographyText, ]} */ 
    // @ts-ignore
    const __VLS_298 = __VLS_asFunctionalComponent(__VLS_297, new __VLS_297({
        type: "secondary",
        ...{ class: "notice-time" },
    }));
    const __VLS_299 = __VLS_298({
        type: "secondary",
        ...{ class: "notice-time" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_298));
    __VLS_300.slots.default;
    (notice.time);
    var __VLS_300;
    var __VLS_288;
    var __VLS_284;
}
let __VLS_280;
let __VLS_276;
const __VLS_301 = {}.ATabPane;
/** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ 
// @ts-ignore
const __VLS_302 = __VLS_asFunctionalComponent(__VLS_301, new __VLS_301({
    key: "todo",
    title: "待办",
}));
const __VLS_303 = __VLS_302({
    key: "todo",
    title: "待办",
}, ...__VLS_functionalComponentArgsRest(__VLS_302));
__VLS_304.slots.default;
const __VLS_305 = {}.AList;
/** @type {[typeof __VLS_components.AList, typeof __VLS_components.aList, typeof __VLS_components.AList, typeof __VLS_components.aList, ]} */ 
// @ts-ignore
const __VLS_306 = __VLS_asFunctionalComponent(__VLS_305, new __VLS_305({
    maxHeight: (400),
}));
const __VLS_307 = __VLS_306({
    maxHeight: (400),
}, ...__VLS_functionalComponentArgsRest(__VLS_306));
__VLS_308.slots.default;
for (const [todo] of __VLS_getVForSourceType((__VLS_ctx.todos))) {
    const __VLS_309 = {}.AListItem;
    /** @type {[typeof __VLS_components.AListItem, typeof __VLS_components.aListItem, typeof __VLS_components.AListItem, typeof __VLS_components.aListItem, ]} */ 
    // @ts-ignore
    const __VLS_310 = __VLS_asFunctionalComponent(__VLS_309, new __VLS_309({
        key: (todo.id),
    }));
    const __VLS_311 = __VLS_310({
        key: (todo.id),
    }, ...__VLS_functionalComponentArgsRest(__VLS_310));
    __VLS_312.slots.default;
    const __VLS_313 = {}.ASpace;
    /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ 
    // @ts-ignore
    const __VLS_314 = __VLS_asFunctionalComponent(__VLS_313, new __VLS_313({
        direction: "vertical",
        ...{ style: {} },
    }));
    const __VLS_315 = __VLS_314({
        direction: "vertical",
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_314));
    __VLS_316.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "notice-title" },
    });
    const __VLS_317 = {}.ATypographyText;
    /** @type {[typeof __VLS_components.ATypographyText, typeof __VLS_components.aTypographyText, typeof __VLS_components.ATypographyText, typeof __VLS_components.aTypographyText, ]} */ 
    // @ts-ignore
    const __VLS_318 = __VLS_asFunctionalComponent(__VLS_317, new __VLS_317({}));
    const __VLS_319 = __VLS_318({}, ...__VLS_functionalComponentArgsRest(__VLS_318));
    __VLS_320.slots.default;
    (todo.title);
    var __VLS_320;
    const __VLS_321 = {}.ATag;
    /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ 
    // @ts-ignore
    const __VLS_322 = __VLS_asFunctionalComponent(__VLS_321, new __VLS_321({
        color: (todo.priority === '高' ? 'red' : todo.priority === '中' ? 'orange' : 'blue'),
    }));
    const __VLS_323 = __VLS_322({
        color: (todo.priority === '高' ? 'red' : todo.priority === '中' ? 'orange' : 'blue'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_322));
    __VLS_324.slots.default;
    (todo.priority);
    var __VLS_324;
    const __VLS_325 = {}.ATypographyText;
    /** @type {[typeof __VLS_components.ATypographyText, typeof __VLS_components.aTypographyText, typeof __VLS_components.ATypographyText, typeof __VLS_components.aTypographyText, ]} */ 
    // @ts-ignore
    const __VLS_326 = __VLS_asFunctionalComponent(__VLS_325, new __VLS_325({
        type: "secondary",
        ...{ class: "notice-time" },
    }));
    const __VLS_327 = __VLS_326({
        type: "secondary",
        ...{ class: "notice-time" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_326));
    __VLS_328.slots.default;
    (todo.deadline);
    var __VLS_328;
    var __VLS_316;
    var __VLS_312;
}
let __VLS_308;
let __VLS_304;
let __VLS_272;
let __VLS_268;
let __VLS_264;
let __VLS_249;
let __VLS_217;
let __VLS_124;
let __VLS_120;
let __VLS_116;
/** @type {[typeof HomeWelcomeModal, ]} */ 
// @ts-ignore
const __VLS_329 = __VLS_asFunctionalComponent(HomeWelcomeModal, new HomeWelcomeModal({
    visible: (__VLS_ctx.showWelcomeModal),
    isNewUser: (__VLS_ctx.userStore.isNewUser),
}));
const __VLS_330 = __VLS_329({
    visible: (__VLS_ctx.showWelcomeModal),
    isNewUser: (__VLS_ctx.userStore.isNewUser),
}, ...__VLS_functionalComponentArgsRest(__VLS_329));
let __VLS_3;
/** @type {__VLS_StyleScopedClasses['layout-container']} */ 
/** @type {__VLS_StyleScopedClasses['header']} */ 
/** @type {__VLS_StyleScopedClasses['logo']} */ 
/** @type {__VLS_StyleScopedClasses['nav-menu']} */ 
/** @type {__VLS_StyleScopedClasses['header-right']} */ 
/** @type {__VLS_StyleScopedClasses['content']} */ 
/** @type {__VLS_StyleScopedClasses['welcome-banner']} */ 
/** @type {__VLS_StyleScopedClasses['banner-content']} */ 
/** @type {__VLS_StyleScopedClasses['welcome-text']} */ 
/** @type {__VLS_StyleScopedClasses['main-content-row']} */ 
/** @type {__VLS_StyleScopedClasses['left-column']} */ 
/** @type {__VLS_StyleScopedClasses['card-container']} */ 
/** @type {__VLS_StyleScopedClasses['identity-info']} */ 
/** @type {__VLS_StyleScopedClasses['user-profile']} */ 
/** @type {__VLS_StyleScopedClasses['avatar-container']} */ 
/** @type {__VLS_StyleScopedClasses['avatar-image']} */ 
/** @type {__VLS_StyleScopedClasses['online-indicator']} */ 
/** @type {__VLS_StyleScopedClasses['user-details']} */ 
/** @type {__VLS_StyleScopedClasses['user-name']} */ 
/** @type {__VLS_StyleScopedClasses['department']} */ 
/** @type {__VLS_StyleScopedClasses['user-stats']} */ 
/** @type {__VLS_StyleScopedClasses['stat-item']} */ 
/** @type {__VLS_StyleScopedClasses['stat-value']} */ 
/** @type {__VLS_StyleScopedClasses['stat-label']} */ 
/** @type {__VLS_StyleScopedClasses['stat-item']} */ 
/** @type {__VLS_StyleScopedClasses['stat-value']} */ 
/** @type {__VLS_StyleScopedClasses['stat-label']} */ 
/** @type {__VLS_StyleScopedClasses['stat-item']} */ 
/** @type {__VLS_StyleScopedClasses['stat-value']} */ 
/** @type {__VLS_StyleScopedClasses['stat-label']} */ 
/** @type {__VLS_StyleScopedClasses['quick-actions']} */ 
/** @type {__VLS_StyleScopedClasses['action-item']} */ 
/** @type {__VLS_StyleScopedClasses['action-icon']} */ 
/** @type {__VLS_StyleScopedClasses['action-item']} */ 
/** @type {__VLS_StyleScopedClasses['action-icon']} */ 
/** @type {__VLS_StyleScopedClasses['action-item']} */ 
/** @type {__VLS_StyleScopedClasses['action-icon']} */ 
/** @type {__VLS_StyleScopedClasses['card-container']} */ 
/** @type {__VLS_StyleScopedClasses['quick-channel-compact']} */ 
/** @type {__VLS_StyleScopedClasses['channel-row']} */ 
/** @type {__VLS_StyleScopedClasses['channel-item-compact']} */ 
/** @type {__VLS_StyleScopedClasses['channel-icon-compact']} */ 
/** @type {__VLS_StyleScopedClasses['card-container']} */ 
/** @type {__VLS_StyleScopedClasses['community-links-compact']} */ 
/** @type {__VLS_StyleScopedClasses['community-row']} */ 
/** @type {__VLS_StyleScopedClasses['community-item-compact']} */ 
/** @type {__VLS_StyleScopedClasses['community-icon-compact']} */ 
/** @type {__VLS_StyleScopedClasses['community-item-compact']} */ 
/** @type {__VLS_StyleScopedClasses['community-icon-compact']} */ 
/** @type {__VLS_StyleScopedClasses['community-item-compact']} */ 
/** @type {__VLS_StyleScopedClasses['community-icon-compact']} */ 
/** @type {__VLS_StyleScopedClasses['community-item-compact']} */ 
/** @type {__VLS_StyleScopedClasses['community-icon-compact']} */ 
/** @type {__VLS_StyleScopedClasses['right-column']} */ 
/** @type {__VLS_StyleScopedClasses['card-container']} */ 
/** @type {__VLS_StyleScopedClasses['metric-cards']} */ 
/** @type {__VLS_StyleScopedClasses['metric-card']} */ 
/** @type {__VLS_StyleScopedClasses['metric-content']} */ 
/** @type {__VLS_StyleScopedClasses['comparison-data']} */ 
/** @type {__VLS_StyleScopedClasses['comparison-item']} */ 
/** @type {__VLS_StyleScopedClasses['bottom-row']} */ 
/** @type {__VLS_StyleScopedClasses['architecture-column']} */ 
/** @type {__VLS_StyleScopedClasses['card-container']} */ 
/** @type {__VLS_StyleScopedClasses['notice-column']} */ 
/** @type {__VLS_StyleScopedClasses['card-container']} */ 
/** @type {__VLS_StyleScopedClasses['notice-title']} */ 
/** @type {__VLS_StyleScopedClasses['notice-time']} */ 
/** @type {__VLS_StyleScopedClasses['notice-title']} */ 
/** @type {__VLS_StyleScopedClasses['notice-time']} */ 
let __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            ArchitectureChart: ArchitectureChart,
            HomeWelcomeModal: HomeWelcomeModal,
            IconUser: IconUser,
            IconDown: IconDown,
            IconFile: IconFile,
            IconNotification: IconNotification,
            IconStorage: IconStorage,
            IconBook: IconBook,
            IconBulb: IconBulb,
            IconArrowRise: IconArrowRise,
            IconArrowFall: IconArrowFall,
            userStore: userStore,
            toggleDepartment: toggleDepartment,
            showWelcomeModal: showWelcomeModal,
            toggleUserRole: toggleUserRole,
            notices: notices,
            getNoticeTypeColor: getNoticeTypeColor,
            todos: todos,
            username: username,
            activeMenu: activeMenu,
            quickChannels: quickChannels,
            showAddDialog: showAddDialog,
            newChannel: newChannel,
            availablePaths: availablePaths,
            handleAddChannel: handleAddChannel,
            navigateToPath: navigateToPath,
            metrics: metrics,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
 /* PartiallyEnd: #4569/main.vue */
