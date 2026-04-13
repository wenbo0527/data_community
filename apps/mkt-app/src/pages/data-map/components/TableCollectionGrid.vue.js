import { ref, computed, watch } from 'vue';
import { IconStar, IconStarFill, IconMore, IconEdit, IconDelete, IconPlus } from '@arco-design/web-vue/es/icon';
import { Message, Modal } from '@arco-design/web-vue';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
const props = defineProps();
const emit = defineEmits();
const currentPage = ref(1);
const pageSize = ref(props.pageSize || 12);
// 计算显示的集合
const displayCollections = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    return props.collections.slice(start, end);
});
const totalCount = computed(() => props.collections.length);
// 获取集合类型颜色
const getCollectionColor = (type) => {
    const colors = {
        '业务流程': 'blue',
        '数据分析': 'green',
        '风险管控': 'red',
        '用户画像': 'purple',
        '营销活动': 'orange'
    };
    return colors[type || '通用'] || 'gray';
};
// 格式化日期
const formatDate = (dateString) => {
    if (!dateString)
        return '未知';
    try {
        return formatDistanceToNow(new Date(dateString), {
            addSuffix: true,
            locale: zhCN
        });
    }
    catch {
        return '未知';
    }
};
// 处理集合点击
const handleCollectionClick = (collection) => {
    emit('collection-click', collection);
};
// 处理创建集合
const handleCreateCollection = () => {
    emit('create-collection');
};
// 切换收藏状态
const toggleFavorite = (collection) => {
    const newFavoriteState = !collection.isFavorite;
    emit('favorite-change', collection, newFavoriteState);
    Message.success(newFavoriteState ? '已添加到收藏' : '已取消收藏');
};
// 处理操作选择
const handleActionSelect = (value) => {
    const [action, id] = value.split('-');
    const collection = props.collections.find(c => c.id === id);
    if (!collection)
        return;
    switch (action) {
        case 'edit':
            emit('edit-collection', collection);
            break;
        case 'copy':
            handleCopyCollection(collection);
            break;
        case 'delete':
            handleDeleteCollection(collection);
            break;
    }
};
// 复制集合
const handleCopyCollection = (collection) => {
    const copiedCollection = {
        ...collection,
        id: Date.now().toString(),
        name: `${collection.name} (副本)`,
        createTime: new Date().toISOString()
    };
    emit('copy-collection', copiedCollection);
    Message.success('集合已复制');
};
// 删除集合
const handleDeleteCollection = (collection) => {
    Modal.confirm({
        title: '确认删除',
        content: `确定要删除集合 "${collection.name}" 吗？此操作不可撤销。`,
        okText: '删除',
        cancelText: '取消',
        okButtonProps: { status: 'danger' },
        onOk: () => {
            emit('delete-collection', collection);
            Message.success('集合已删除');
        }
    });
};
// 分页处理
const handlePageChange = (page) => {
    currentPage.value = page;
};
const handlePageSizeChange = (size) => {
    pageSize.value = size;
    currentPage.value = 1;
};
// 监听集合变化，重置分页
watch(() => props.collections.length, () => {
    if (currentPage.value > Math.ceil(props.collections.length / pageSize.value)) {
        currentPage.value = 1;
    }
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['collection-card']} */ 
/** @type {__VLS_StyleScopedClasses['collection-card']} */ 
/** @type {__VLS_StyleScopedClasses['collection-stats']} */ 
/** @type {__VLS_StyleScopedClasses['collection-card']} */ 
/** @type {__VLS_StyleScopedClasses['title-actions']} */ 
/** @type {__VLS_StyleScopedClasses['title-actions']} */ 
/** @type {__VLS_StyleScopedClasses['title-actions']} */ 
/** @type {__VLS_StyleScopedClasses['arco-btn']} */ 
/** @type {__VLS_StyleScopedClasses['title-actions']} */ 
/** @type {__VLS_StyleScopedClasses['arco-btn']} */ 
/** @type {__VLS_StyleScopedClasses['title-actions']} */ 
/** @type {__VLS_StyleScopedClasses['arco-btn']} */ 
/** @type {__VLS_StyleScopedClasses['favorited']} */ 
/** @type {__VLS_StyleScopedClasses['danger-option']} */ 
/** @type {__VLS_StyleScopedClasses['table-tag']} */ 
/** @type {__VLS_StyleScopedClasses['table-collection-grid']} */ 
/** @type {__VLS_StyleScopedClasses['collection-card']} */ 
/** @type {__VLS_StyleScopedClasses['card-content']} */ 
/** @type {__VLS_StyleScopedClasses['collection-cover']} */ 
/** @type {__VLS_StyleScopedClasses['card-content']} */ 
/** @type {__VLS_StyleScopedClasses['title-text']} */ 
/** @type {__VLS_StyleScopedClasses['card-description']} */ 
/** @type {__VLS_StyleScopedClasses['table-collection-grid']} */ 
/** @type {__VLS_StyleScopedClasses['arco-col']} */ 
/** @type {__VLS_StyleScopedClasses['collection-card']} */ 
/** @type {__VLS_StyleScopedClasses['title-actions']} */ 
/** @type {__VLS_StyleScopedClasses['empty-state']} */ 
/** @type {__VLS_StyleScopedClasses['table-collection-grid']} */ 
/** @type {__VLS_StyleScopedClasses['table-collection-grid']} */ 
/** @type {__VLS_StyleScopedClasses['arco-col']} */ 
/** @type {__VLS_StyleScopedClasses['collection-cover']} */ 
/** @type {__VLS_StyleScopedClasses['card-content']} */ 
/** @type {__VLS_StyleScopedClasses['title-text']} */ 
/** @type {__VLS_StyleScopedClasses['card-description']} */ 
/** @type {__VLS_StyleScopedClasses['collection-card']} */ 
/** @type {__VLS_StyleScopedClasses['card-title']} */ 
/** @type {__VLS_StyleScopedClasses['table-tags']} */ 
/** @type {__VLS_StyleScopedClasses['footer-meta']} */ 
/** @type {__VLS_StyleScopedClasses['empty-state']} */ 
/** @type {__VLS_StyleScopedClasses['empty-icon']} */ 
/** @type {__VLS_StyleScopedClasses['empty-text']} */ 
/** @type {__VLS_StyleScopedClasses['empty-description']} */ 
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "table-collection-grid" },
});
if (!__VLS_ctx.loading) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "grid-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "header-left" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "collection-count" },
    });
    (__VLS_ctx.totalCount);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "header-right" },
    });
    const __VLS_0 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_2 = __VLS_1({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    let __VLS_4;
    let __VLS_5;
    let __VLS_6;
    const __VLS_7 = {
        onClick: (__VLS_ctx.handleCreateCollection)
    };
    __VLS_3.slots.default;
    {
        const { icon: __VLS_thisSlot } = __VLS_3.slots;
        const __VLS_8 = {}.IconPlus;
        /** @type {[typeof __VLS_components.IconPlus, typeof __VLS_components.iconPlus, ]} */ 
        // @ts-ignore
        const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({}));
        const __VLS_10 = __VLS_9({}, ...__VLS_functionalComponentArgsRest(__VLS_9));
    }
    let __VLS_3;
}
if (__VLS_ctx.loading) {
    const __VLS_12 = {}.ARow;
    /** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ 
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
        gutter: ([16, 16]),
    }));
    const __VLS_14 = __VLS_13({
        gutter: ([16, 16]),
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    __VLS_15.slots.default;
    for (const [i] of __VLS_getVForSourceType((6))) {
        const __VLS_16 = {}.ACol;
        /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ 
        // @ts-ignore
        const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
            key: (i),
            span: (8),
        }));
        const __VLS_18 = __VLS_17({
            key: (i),
            span: (8),
        }, ...__VLS_functionalComponentArgsRest(__VLS_17));
        __VLS_19.slots.default;
        const __VLS_20 = {}.ASkeleton;
        /** @type {[typeof __VLS_components.ASkeleton, typeof __VLS_components.aSkeleton, typeof __VLS_components.ASkeleton, typeof __VLS_components.aSkeleton, ]} */ 
        // @ts-ignore
        const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({}));
        const __VLS_22 = __VLS_21({}, ...__VLS_functionalComponentArgsRest(__VLS_21));
        __VLS_23.slots.default;
        const __VLS_24 = {}.ASkeletonShape;
        /** @type {[typeof __VLS_components.ASkeletonShape, typeof __VLS_components.aSkeletonShape, ]} */ 
        // @ts-ignore
        const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
            shape: "square",
            ...{ style: ({ width: '100%', height: '200px' }) },
        }));
        const __VLS_26 = __VLS_25({
            shape: "square",
            ...{ style: ({ width: '100%', height: '200px' }) },
        }, ...__VLS_functionalComponentArgsRest(__VLS_25));
        var __VLS_23;
        var __VLS_19;
    }
    let __VLS_15;
}
else {
    if (__VLS_ctx.displayCollections.length > 0) {
        const __VLS_28 = {}.ARow;
        /** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ 
        // @ts-ignore
        const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
            gutter: ([16, 16]),
        }));
        const __VLS_30 = __VLS_29({
            gutter: ([16, 16]),
        }, ...__VLS_functionalComponentArgsRest(__VLS_29));
        __VLS_31.slots.default;
        for (const [collection] of __VLS_getVForSourceType((__VLS_ctx.displayCollections))) {
            const __VLS_32 = {}.ACol;
            /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ 
            // @ts-ignore
            const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
                key: (collection.id),
                xs: (24),
                sm: (12),
                md: (12),
                lg: (8),
                xl: (6),
            }));
            const __VLS_34 = __VLS_33({
                key: (collection.id),
                xs: (24),
                sm: (12),
                md: (12),
                lg: (8),
                xl: (6),
            }, ...__VLS_functionalComponentArgsRest(__VLS_33));
            __VLS_35.slots.default;
            const __VLS_36 = {}.ACard;
            /** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ 
            // @ts-ignore
            const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
                ...{ 'onClick': {} },
                ...{ class: "collection-card" },
                hoverable: true,
            }));
            const __VLS_38 = __VLS_37({
                ...{ 'onClick': {} },
                ...{ class: "collection-card" },
                hoverable: true,
            }, ...__VLS_functionalComponentArgsRest(__VLS_37));
            let __VLS_40;
            let __VLS_41;
            let __VLS_42;
            const __VLS_43 = {
                onClick: (...[$event]) => {
                    if (__VLS_ctx.loading)
                        return;
                    if (!(__VLS_ctx.displayCollections.length > 0))
                        return;
                    __VLS_ctx.handleCollectionClick(collection);
                }
            };
            __VLS_39.slots.default;
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "card-content" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "card-title" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({
                ...{ class: "title-text" },
                title: (collection.name),
            });
            (collection.name);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "title-actions" },
            });
            const __VLS_44 = {}.AButton;
            /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
            // @ts-ignore
            const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
                ...{ 'onClick': {} },
                type: "text",
                size: "mini",
                ...{ class: ({ 'favorited': collection.isFavorite }) },
            }));
            const __VLS_46 = __VLS_45({
                ...{ 'onClick': {} },
                type: "text",
                size: "mini",
                ...{ class: ({ 'favorited': collection.isFavorite }) },
            }, ...__VLS_functionalComponentArgsRest(__VLS_45));
            let __VLS_48;
            let __VLS_49;
            let __VLS_50;
            const __VLS_51 = {
                onClick: (...[$event]) => {
                    if (__VLS_ctx.loading)
                        return;
                    if (!(__VLS_ctx.displayCollections.length > 0))
                        return;
                    __VLS_ctx.toggleFavorite(collection);
                }
            };
            __VLS_47.slots.default;
            if (collection.isFavorite) {
                const __VLS_52 = {}.IconStarFill;
                /** @type {[typeof __VLS_components.IconStarFill, typeof __VLS_components.iconStarFill, ]} */ 
                // @ts-ignore
                const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({}));
                const __VLS_54 = __VLS_53({}, ...__VLS_functionalComponentArgsRest(__VLS_53));
            }
            else {
                const __VLS_56 = {}.IconStar;
                /** @type {[typeof __VLS_components.IconStar, typeof __VLS_components.iconStar, ]} */ 
                // @ts-ignore
                const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({}));
                const __VLS_58 = __VLS_57({}, ...__VLS_functionalComponentArgsRest(__VLS_57));
            }
            var __VLS_47;
            const __VLS_60 = {}.ADropdown;
            /** @type {[typeof __VLS_components.ADropdown, typeof __VLS_components.aDropdown, typeof __VLS_components.ADropdown, typeof __VLS_components.aDropdown, ]} */ 
            // @ts-ignore
            const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
                ...{ 'onSelect': {} },
            }));
            const __VLS_62 = __VLS_61({
                ...{ 'onSelect': {} },
            }, ...__VLS_functionalComponentArgsRest(__VLS_61));
            let __VLS_64;
            let __VLS_65;
            let __VLS_66;
            const __VLS_67 = {
                onSelect: (__VLS_ctx.handleActionSelect)
            };
            __VLS_63.slots.default;
            const __VLS_68 = {}.AButton;
            /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
            // @ts-ignore
            const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
                ...{ 'onClick': {} },
                type: "text",
                size: "mini",
            }));
            const __VLS_70 = __VLS_69({
                ...{ 'onClick': {} },
                type: "text",
                size: "mini",
            }, ...__VLS_functionalComponentArgsRest(__VLS_69));
            let __VLS_72;
            let __VLS_73;
            let __VLS_74;
            const __VLS_75 = {
                onClick: () => { }
            };
            __VLS_71.slots.default;
            const __VLS_76 = {}.IconMore;
            /** @type {[typeof __VLS_components.IconMore, typeof __VLS_components.iconMore, ]} */ 
            // @ts-ignore
            const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({}));
            const __VLS_78 = __VLS_77({}, ...__VLS_functionalComponentArgsRest(__VLS_77));
            var __VLS_71;
            {
                const { content: __VLS_thisSlot } = __VLS_63.slots;
                const __VLS_80 = {}.ADoption;
                /** @type {[typeof __VLS_components.ADoption, typeof __VLS_components.aDoption, typeof __VLS_components.ADoption, typeof __VLS_components.aDoption, ]} */ 
                // @ts-ignore
                const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
                    value: (`edit-${collection.id}`),
                }));
                const __VLS_82 = __VLS_81({
                    value: (`edit-${collection.id}`),
                }, ...__VLS_functionalComponentArgsRest(__VLS_81));
                __VLS_83.slots.default;
                const __VLS_84 = {}.IconEdit;
                /** @type {[typeof __VLS_components.IconEdit, typeof __VLS_components.iconEdit, ]} */ 
                // @ts-ignore
                const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({}));
                const __VLS_86 = __VLS_85({}, ...__VLS_functionalComponentArgsRest(__VLS_85));
                var __VLS_83;
                const __VLS_88 = {}.ADoption;
                /** @type {[typeof __VLS_components.ADoption, typeof __VLS_components.aDoption, typeof __VLS_components.ADoption, typeof __VLS_components.aDoption, ]} */ 
                // @ts-ignore
                const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
                    value: (`delete-${collection.id}`),
                    ...{ class: "danger-option" },
                }));
                const __VLS_90 = __VLS_89({
                    value: (`delete-${collection.id}`),
                    ...{ class: "danger-option" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_89));
                __VLS_91.slots.default;
                const __VLS_92 = {}.IconDelete;
                /** @type {[typeof __VLS_components.IconDelete, typeof __VLS_components.iconDelete, ]} */ 
                // @ts-ignore
                const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({}));
                const __VLS_94 = __VLS_93({}, ...__VLS_functionalComponentArgsRest(__VLS_93));
                var __VLS_91;
            }
            var __VLS_63;
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "collection-stats" },
            });
            const __VLS_96 = {}.ATag;
            /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ 
            // @ts-ignore
            const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
                size: "small",
                color: (__VLS_ctx.getCollectionColor(collection.type)),
            }));
            const __VLS_98 = __VLS_97({
                size: "small",
                color: (__VLS_ctx.getCollectionColor(collection.type)),
            }, ...__VLS_functionalComponentArgsRest(__VLS_97));
            __VLS_99.slots.default;
            (collection.type || '通用');
            var __VLS_99;
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "table-count" },
            });
            (collection.tables.length);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
                ...{ class: "card-description" },
                title: (collection.description || '暂无描述'),
            });
            (collection.description || '暂无描述');
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "card-footer" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "table-tags" },
            });
            for (const [table] of __VLS_getVForSourceType((collection.tables.slice(0, 3)))) {
                const __VLS_100 = {}.ATag;
                /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ 
                // @ts-ignore
                const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
                    key: (table.name),
                    size: "small",
                    ...{ class: "table-tag" },
                }));
                const __VLS_102 = __VLS_101({
                    key: (table.name),
                    size: "small",
                    ...{ class: "table-tag" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_101));
                __VLS_103.slots.default;
                (table.name);
                var __VLS_103;
            }
            if (collection.tables.length > 3) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    ...{ class: "more-tables" },
                });
                (collection.tables.length - 3);
            }
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "footer-meta" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "meta-item" },
            });
            (collection.owner || '未指定');
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "meta-item" },
            });
            (__VLS_ctx.formatDate(collection.updateTime));
            var __VLS_39;
            var __VLS_35;
        }
        let __VLS_31;
    }
    else {
        const __VLS_104 = {}.AEmpty;
        /** @type {[typeof __VLS_components.AEmpty, typeof __VLS_components.aEmpty, typeof __VLS_components.AEmpty, typeof __VLS_components.aEmpty, ]} */ 
        // @ts-ignore
        const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({
            ...{ class: "empty-state" },
        }));
        const __VLS_106 = __VLS_105({
            ...{ class: "empty-state" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_105));
        __VLS_107.slots.default;
        {
            const { description: __VLS_thisSlot } = __VLS_107.slots;
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        }
        {
            const { footer: __VLS_thisSlot } = __VLS_107.slots;
            const __VLS_108 = {}.AButton;
            /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
            // @ts-ignore
            const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({
                ...{ 'onClick': {} },
                type: "primary",
            }));
            const __VLS_110 = __VLS_109({
                ...{ 'onClick': {} },
                type: "primary",
            }, ...__VLS_functionalComponentArgsRest(__VLS_109));
            let __VLS_112;
            let __VLS_113;
            let __VLS_114;
            const __VLS_115 = {
                onClick: (...[$event]) => {
                    if (__VLS_ctx.loading)
                        return;
                    if (__VLS_ctx.displayCollections.length > 0)
                        return;
                    __VLS_ctx.$emit('create-collection');
                }
            };
            __VLS_111.slots.default;
            let __VLS_111;
        }
        let __VLS_107;
    }
}
if (!__VLS_ctx.loading && __VLS_ctx.totalCount > __VLS_ctx.pageSize) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "pagination-wrapper" },
    });
    const __VLS_116 = {}.APagination;
    /** @type {[typeof __VLS_components.APagination, typeof __VLS_components.aPagination, ]} */ 
    // @ts-ignore
    const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({
        ...{ 'onChange': {} },
        ...{ 'onPageSizeChange': {} },
        current: (__VLS_ctx.currentPage),
        total: (__VLS_ctx.totalCount),
        pageSize: (__VLS_ctx.pageSize),
        showTotal: (true),
        showJumper: (true),
        showPageSize: (true),
    }));
    const __VLS_118 = __VLS_117({
        ...{ 'onChange': {} },
        ...{ 'onPageSizeChange': {} },
        current: (__VLS_ctx.currentPage),
        total: (__VLS_ctx.totalCount),
        pageSize: (__VLS_ctx.pageSize),
        showTotal: (true),
        showJumper: (true),
        showPageSize: (true),
    }, ...__VLS_functionalComponentArgsRest(__VLS_117));
    let __VLS_120;
    let __VLS_121;
    let __VLS_122;
    const __VLS_123 = {
        onChange: (__VLS_ctx.handlePageChange)
    };
    const __VLS_124 = {
        onPageSizeChange: (__VLS_ctx.handlePageSizeChange)
    };
    let __VLS_119;
}
/** @type {__VLS_StyleScopedClasses['table-collection-grid']} */ 
/** @type {__VLS_StyleScopedClasses['grid-header']} */ 
/** @type {__VLS_StyleScopedClasses['header-left']} */ 
/** @type {__VLS_StyleScopedClasses['collection-count']} */ 
/** @type {__VLS_StyleScopedClasses['header-right']} */ 
/** @type {__VLS_StyleScopedClasses['collection-card']} */ 
/** @type {__VLS_StyleScopedClasses['card-content']} */ 
/** @type {__VLS_StyleScopedClasses['card-title']} */ 
/** @type {__VLS_StyleScopedClasses['title-text']} */ 
/** @type {__VLS_StyleScopedClasses['title-actions']} */ 
/** @type {__VLS_StyleScopedClasses['favorited']} */ 
/** @type {__VLS_StyleScopedClasses['danger-option']} */ 
/** @type {__VLS_StyleScopedClasses['collection-stats']} */ 
/** @type {__VLS_StyleScopedClasses['table-count']} */ 
/** @type {__VLS_StyleScopedClasses['card-description']} */ 
/** @type {__VLS_StyleScopedClasses['card-footer']} */ 
/** @type {__VLS_StyleScopedClasses['table-tags']} */ 
/** @type {__VLS_StyleScopedClasses['table-tag']} */ 
/** @type {__VLS_StyleScopedClasses['more-tables']} */ 
/** @type {__VLS_StyleScopedClasses['footer-meta']} */ 
/** @type {__VLS_StyleScopedClasses['meta-item']} */ 
/** @type {__VLS_StyleScopedClasses['meta-item']} */ 
/** @type {__VLS_StyleScopedClasses['empty-state']} */ 
/** @type {__VLS_StyleScopedClasses['pagination-wrapper']} */ 
let __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            IconStar: IconStar,
            IconStarFill: IconStarFill,
            IconMore: IconMore,
            IconEdit: IconEdit,
            IconDelete: IconDelete,
            IconPlus: IconPlus,
            currentPage: currentPage,
            pageSize: pageSize,
            displayCollections: displayCollections,
            totalCount: totalCount,
            getCollectionColor: getCollectionColor,
            formatDate: formatDate,
            handleCollectionClick: handleCollectionClick,
            handleCreateCollection: handleCreateCollection,
            toggleFavorite: toggleFavorite,
            handleActionSelect: handleActionSelect,
            handlePageChange: handlePageChange,
            handlePageSizeChange: handlePageSizeChange,
        };
    },
    __typeEmits: {},
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeEmits: {},
    __typeProps: {},
});
 /* PartiallyEnd: #4569/main.vue */
