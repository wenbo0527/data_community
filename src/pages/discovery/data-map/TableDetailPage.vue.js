/// <reference types="../../../../node_modules/.vue-global-types/vue_3.3_0_0_0.d.ts" />
import { ref, computed, watch, watchEffect, h } from 'vue';
import { IconStar, IconSafe, IconFolderAdd, IconLink, IconInfoCircle, IconExclamationCircle } from '@arco-design/web-vue/es/icon';
import { Modal } from '@arco-design/web-vue';
import { mockTables } from '@/mock/data-map';
import { useRoute, useRouter } from 'vue-router';
import RelationEditorPanel from './components/RelationEditorPanel.vue';
import AddToCollectionModal from './components/AddToCollectionModal.vue';
// Initialize logger first
const isDev = process.env.NODE_ENV === 'development';
const logger = {
    debug: (tag, ...args) => isDev && console.debug(`[TableDetail] ${tag}:`, ...args),
    info: (tag, ...args) => isDev && tag.includes('关联') && console.log(`[TableDetail] ${tag}:`, ...args),
    warn: (tag, ...args) => tag.includes('关联') && console.warn(`[TableDetail] ${tag}:`, ...args),
    error: (tag, ...args) => console.error(`[TableDetail] ${tag}:`, ...args)
};
const route = useRoute();
const router = useRouter();
const tableData = ref();
const goToTableDetail = (table) => {
    router.push(`/discovery/data-map/table/${encodeURIComponent(table.name)}`);
};
const isFavorite = ref(false);
const relationModalVisible = ref(false);
const sampleData = ref([]);
const currentField = ref();
const activeModalTab = ref('structure'); // 控制关联弹窗内的标签页
const relatedTables = ref([]);
const currentTableName = ref('');
// 基本信息数据 - 提取为计算属性
const tableBasicInfo = computed(() => {
    if (!tableData.value)
        return [];
    const data = tableData.value;
    return [
        { label: '表名', value: data.name },
        { label: '类型', value: data.type },
        { label: '分类', value: data.category },
        { label: '领域', value: data.domain },
        { label: '更新频率', value: data.updateFrequency },
        { label: '负责人', value: data.owner },
        { label: '创建时间', value: data.createTime || 'N/A' },
        { label: '最后更新时间', value: data.lastUpdateTime || 'N/A' },
    ];
});
// 获取关联字段 - 提取为顶层计算属性
const relatedFields = computed(() => {
    const fields = tableData.value?.fields?.filter(field => ['id', 'user_id', 'product_id'].includes(field.name.toLowerCase())) || [];
    logger.debug('关联字段解析', {
        totalFields: tableData.value?.fields?.length || 0,
        matchedFields: fields.map(f => f.name)
    });
    return fields;
});
// 弹窗标题
const modalTitle = computed(() => {
    if (currentTableName.value) {
        return `${tableData.value?.name} 与 ${currentTableName.value} 的关联关系`;
    }
    return `${currentField?.value?.name || ''} 关联表`;
});
// 从路由参数加载表数据
watchEffect(() => {
    const tableParam = Array.isArray(route.params.table) ? route.params.table[0] : route.params.table ||
        Array.isArray(route.params.tableName) ? route.params.tableName[0] : route.params.tableName;
    logger.debug('路由参数', { tableParam });
    if (tableParam) {
        tableData.value = parseTableData(tableParam) || createSafeTableData({});
        logger.debug('解析表数据', { name: tableData.value?.name });
    }
    else {
        tableData.value = createSafeTableData({});
    }
});
function parseTableData(tableStr) {
    try {
        const decoded = decodeURIComponent(tableStr);
        try {
            return JSON.parse(decoded);
        }
        catch {
            const mockTable = mockTables.find(t => t.name === decoded);
            if (mockTable) {
                // 为dim_user表添加特殊属性
                if (decoded === 'dim_user') {
                    return createSafeTableData({
                        ...mockTable,
                        rowCount: 1000000,
                        createTime: '2023-01-01',
                        lastUpdateTime: '2024-01-15',
                        storageSize: '500MB',
                        collectionOwner: '数据治理组',
                        type: 'dimension',
                        category: '用户数据',
                        domain: '用户域',
                        updateFrequency: '每日更新',
                        owner: '张三'
                    });
                }
                return createSafeTableData(mockTable);
            }
            return undefined;
        }
    }
    catch (error) {
        logger.warn('解析表数据失败', error);
        return undefined;
    }
}
function createSafeTableData(source) {
    return {
        name: '',
        type: '',
        category: '',
        domain: '',
        updateFrequency: '',
        owner: '',
        description: '',
        fields: [],
        ...source,
    };
}
watch(tableData, (currentRefData) => {
    if (!currentRefData || !currentRefData.fields?.length) {
        logger.debug('样本数据重置', '表数据为空或无字段');
        sampleData.value = [];
        return;
    }
    try {
        sampleData.value = Array(2).fill(0).map((_, i) => {
            const row = { id: i + 1 };
            currentRefData.fields.forEach(field => {
                if (field?.name) {
                    row[field.name] = `mock_${field.name}_${i + 1}`;
                }
            });
            return row;
        });
        logger.debug('样本数据生成', { count: sampleData.value.length });
    }
    catch (error) {
        logger.error('样本数据生成失败', error);
        sampleData.value = [];
    }
}, { immediate: true, deep: true });
const toggleFavorite = () => {
    isFavorite.value = !isFavorite.value;
};
const collections = ref([
    { label: '常用表集合', value: 'common' },
    { label: '个人收藏', value: 'personal' },
    { label: '项目表集合', value: 'project' },
    { label: '部门表集合', value: 'department' }
]);
const selectedCollection = ref('');
const showAddToCollection = () => {
    logger.debug('showAddToCollection called');
    logger.debug('打开添加到集合弹窗', { table: tableData.value?.name });
    logger.debug('集合数据', { collections: collections.value, selectedCollection: selectedCollection.value });
    const handleSelect = (value) => {
        logger.debug('handleSelect called', { value });
        if (!value) {
            logger.warn('用户未选择集合', { table: tableData.value?.name });
            Modal.error({ title: '错误', content: '请选择要添加到的集合' });
            return;
        }
        logger.info('添加到集合', {
            table: tableData.value?.name,
            collection: value,
            collectionLabel: collections.value.find(c => c.value === value)?.label || ''
        });
        Modal.success({
            title: '成功',
            content: '已添加到集合'
        });
        logger.debug('成功添加到集合', {
            table: tableData.value?.name,
            collection: value
        });
        selectedCollection.value = value;
    };
    Modal.info({
        title: '添加到集合',
        content: () => h(AddToCollectionModal, {
            collections: collections.value,
            initialSelectedCollection: selectedCollection.value,
            'onSelect-collection': handleSelect,
        }),
        onClose: () => {
            logger.debug('用户关闭添加到集合弹窗', {
                table: tableData.value?.name,
                selected: selectedCollection.value
            });
        }
    });
};
const applyPermission = () => {
    logger.info('申请权限', tableData.value?.name);
};
const showRelatedTables = (field) => {
    console.group('关联字段处理');
    logger.debug('开始处理关联字段', {
        field: field.name,
        fieldType: field.type,
        currentTable: tableData.value?.name
    });
    currentField.value = field;
    currentTableName.value = '';
    const tables = getRelatedTables(field);
    logger.debug('获取关联表结果', {
        fieldName: field.name,
        matchedTables: tables.map(t => t.name),
        totalCount: tables.length
    });
    // 为关联表添加更多信息
    relatedTables.value = tables.map(table => {
        const relationType = getRelationType(tableData.value?.name || '', table.name);
        const relationDescription = getRelationDescription(tableData.value?.name || '', table.name, field.name);
        logger.debug('处理关联表信息', {
            tableName: table.name,
            relationType,
            relationDescription
        });
        return {
            ...table,
            relationField: field.name,
            relationType,
            relationDescription
        };
    });
    relationModalVisible.value = true;
    activeModalTab.value = 'view';
    // 记录最终处理结果
    logger.info('关联表查询完成', {
        field: field.name,
        count: tables.length,
        relations: relatedTables.value.map(t => `${t.name}(${t.relationType})`)
    });
    console.groupEnd();
};
// 通过表名查看关联表
const showRelatedTablesByName = (tableName) => {
    currentTableName.value = tableName;
    const targetTable = mockTables.find(t => t.name === tableName);
    if (targetTable) {
        // 查找关联字段，默认为user_id
        const relationField = targetTable.fields?.find(f => f.name.toLowerCase() === 'user_id') || {
            name: 'user_id',
            type: 'string',
            description: '用户ID'
        };
        const relationType = getRelationType(tableData.value?.name || '', tableName);
        const relationDescription = getRelationDescription(tableData.value?.name || '', tableName, 'user_id');
        relatedTables.value = [{
                ...targetTable,
                relationField: relationField.name,
                relationType,
                relationDescription
            }];
        logger.debug('关联表信息更新', {
            tableName,
            relationField: relationField.name,
            relationType,
            relationDescription
        });
        relationModalVisible.value = true;
        activeModalTab.value = 'view';
    }
};
// 获取关联表信息
const getRelatedTables = (field) => {
    console.group('获取关联表');
    logger.debug('开始查找关联表', {
        fieldName: field.name,
        isRelationField: ['id', 'user_id'].includes(field.name.toLowerCase())
    });
    let result = [];
    if (['id', 'user_id'].includes(field.name.toLowerCase())) {
        // 返回与当前表关联的表
        result = mockTables.filter(t => {
            const hasMatchingField = t.fields?.some(f => f.name.toLowerCase() === field.name.toLowerCase());
            logger.debug('检查表字段匹配', {
                tableName: t.name,
                hasMatchingField,
                matchedField: field.name
            });
            return hasMatchingField;
        });
    }
    logger.debug('关联表查找完成', {
        fieldName: field.name,
        matchedTables: result.map(t => t.name),
        totalMatches: result.length
    });
    console.groupEnd();
    return result;
};
// 获取表类型对应的颜色
const getTypeColor = (type) => {
    const typeColors = {
        'dim': '#165DFF',
        'fact': '#FF7D00',
        'dwd': '#722ED1',
        'dws': '#0FC6C2',
        'ads': '#F5319D'
    };
    const typeKey = type.toLowerCase();
    return typeColors[typeKey] || '#86909C';
};
const editingField = ref(null);
const fieldRelations = ref([]); // State to hold relations for the currently edited field
const editFieldRelations = (field) => {
    logger.debug('编辑字段关联关系', { fieldName: field.name });
    editingField.value = field;
    // Load existing relations for this field (mock data or from API)
    fieldRelations.value = getMockRelationsForField(field.name); // Implement this function to fetch real data
    relationModalVisible.value = true;
    activeModalTab.value = 'edit';
};
const handleSaveRelations = (relations) => {
    logger.info('保存关联关系', { field: editingField.value?.name, relations });
    // Here you would typically save the relations to your backend or state management
    // For this mock, we'll just log it.
    // You might want to update a local state that stores relations per field.
    // Example: updateFieldRelations(editingField.value.name, relations)
};
// Mock function to get existing relations for a field
const getMockRelationsForField = (fieldName) => {
    // This is a placeholder. In a real app, fetch this data.
    if (fieldName.toLowerCase() === 'user_id') {
        return [
            { targetTable: 'fact_loan_apply', relationField: 'user_id', relationType: '维度-事实关联', relationDescription: '提供申请人基础信息' },
            { targetTable: 'dws_risk_score', relationField: 'user_id', relationType: '维度-汇总关联', relationDescription: '提供用户基础画像数据' },
        ];
    }
    else if (fieldName.toLowerCase() === 'id') {
        return [
            { targetTable: 'dim_product', relationField: 'product_id', relationType: '字段关联', relationDescription: '关联产品信息' },
        ];
    }
    return [];
};
// 获取关联类型
const getRelationType = (sourceTable, targetTable) => {
    if (!sourceTable || !targetTable)
        return '字段关联';
    const sourceType = mockTables.find(t => t.name === sourceTable)?.type?.toLowerCase() || '';
    const targetType = mockTables.find(t => t.name === targetTable)?.type?.toLowerCase() || '';
    if (sourceType === 'dim' && targetType.startsWith('fact')) {
        return '维度-事实关联';
    }
    else if (sourceType === 'dim' && (targetType.startsWith('dwd') || targetType.startsWith('dws'))) {
        return '维度-汇总关联';
    }
    else if (sourceType.startsWith('fact') && targetType === 'dim') {
        return '事实-维度关联';
    }
    else if ((sourceType.startsWith('dwd') || sourceType.startsWith('dws')) && targetType === 'dim') {
        return '汇总-维度关联';
    }
    return '字段关联';
};
// 获取关联说明
const getRelationDescription = (sourceTable, targetTable, fieldName) => {
    if (sourceTable === 'dim_user') {
        if (targetTable === 'fact_loan_apply') {
            return '提供申请人基础信息';
        }
        else if (targetTable === 'dws_risk_score') {
            return '提供用户基础画像数据';
        }
        else if (targetTable === 'dwd_fraud_alert') {
            return '提供欺诈风险信息';
        }
    }
    else if (targetTable === 'dim_user') {
        return '获取用户基础信息';
    }
    return '数据关联';
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "table-detail-page" },
});
const __VLS_0 = {}.APageHeader;
/** @type {[typeof __VLS_components.APageHeader, typeof __VLS_components.aPageHeader, typeof __VLS_components.APageHeader, typeof __VLS_components.aPageHeader, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onBack': {} },
    title: (__VLS_ctx.tableData?.name || '未命名表'),
    ...{ class: "page-header" },
}));
const __VLS_2 = __VLS_1({
    ...{ 'onBack': {} },
    title: (__VLS_ctx.tableData?.name || '未命名表'),
    ...{ class: "page-header" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onBack: (...[$event]) => {
        __VLS_ctx.router.go(-1);
    }
};
__VLS_3.slots.default;
{
    const { extra: __VLS_thisSlot } = __VLS_3.slots;
    const __VLS_8 = {}.ASpace;
    /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({}));
    const __VLS_10 = __VLS_9({}, ...__VLS_functionalComponentArgsRest(__VLS_9));
    __VLS_11.slots.default;
    const __VLS_12 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
        ...{ 'onClick': {} },
        type: "outline",
        size: "mini",
    }));
    const __VLS_14 = __VLS_13({
        ...{ 'onClick': {} },
        type: "outline",
        size: "mini",
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    let __VLS_16;
    let __VLS_17;
    let __VLS_18;
    const __VLS_19 = {
        onClick: (__VLS_ctx.toggleFavorite)
    };
    __VLS_15.slots.default;
    {
        const { icon: __VLS_thisSlot } = __VLS_15.slots;
        const __VLS_20 = {}.IconStar;
        /** @type {[typeof __VLS_components.IconStar, typeof __VLS_components.iconStar, ]} */ ;
        // @ts-ignore
        const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
            fill: (__VLS_ctx.isFavorite ? '#ffb400' : 'none'),
        }));
        const __VLS_22 = __VLS_21({
            fill: (__VLS_ctx.isFavorite ? '#ffb400' : 'none'),
        }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    }
    var __VLS_15;
    const __VLS_24 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
        ...{ 'onClick': {} },
        type: "outline",
        size: "mini",
    }));
    const __VLS_26 = __VLS_25({
        ...{ 'onClick': {} },
        type: "outline",
        size: "mini",
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    let __VLS_28;
    let __VLS_29;
    let __VLS_30;
    const __VLS_31 = {
        onClick: (__VLS_ctx.showAddToCollection)
    };
    __VLS_27.slots.default;
    {
        const { icon: __VLS_thisSlot } = __VLS_27.slots;
        const __VLS_32 = {}.IconFolderAdd;
        /** @type {[typeof __VLS_components.IconFolderAdd, typeof __VLS_components.iconFolderAdd, ]} */ ;
        // @ts-ignore
        const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({}));
        const __VLS_34 = __VLS_33({}, ...__VLS_functionalComponentArgsRest(__VLS_33));
    }
    var __VLS_27;
    const __VLS_36 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
        ...{ 'onClick': {} },
        type: "primary",
        size: "mini",
    }));
    const __VLS_38 = __VLS_37({
        ...{ 'onClick': {} },
        type: "primary",
        size: "mini",
    }, ...__VLS_functionalComponentArgsRest(__VLS_37));
    let __VLS_40;
    let __VLS_41;
    let __VLS_42;
    const __VLS_43 = {
        onClick: (__VLS_ctx.applyPermission)
    };
    __VLS_39.slots.default;
    {
        const { icon: __VLS_thisSlot } = __VLS_39.slots;
        const __VLS_44 = {}.IconSafe;
        /** @type {[typeof __VLS_components.IconSafe, typeof __VLS_components.iconSafe, ]} */ ;
        // @ts-ignore
        const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({}));
        const __VLS_46 = __VLS_45({}, ...__VLS_functionalComponentArgsRest(__VLS_45));
    }
    var __VLS_39;
    var __VLS_11;
}
var __VLS_3;
if (__VLS_ctx.tableData) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "table-content" },
    });
    const __VLS_48 = {}.ACard;
    /** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
    // @ts-ignore
    const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
        ...{ class: "table-info" },
    }));
    const __VLS_50 = __VLS_49({
        ...{ class: "table-info" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_49));
    __VLS_51.slots.default;
    const __VLS_52 = {}.ADescriptions;
    /** @type {[typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, ]} */ ;
    // @ts-ignore
    const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
        column: (2),
        data: (__VLS_ctx.tableBasicInfo),
    }));
    const __VLS_54 = __VLS_53({
        column: (2),
        data: (__VLS_ctx.tableBasicInfo),
    }, ...__VLS_functionalComponentArgsRest(__VLS_53));
    var __VLS_51;
    const __VLS_56 = {}.ACard;
    /** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
    // @ts-ignore
    const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
        ...{ class: "tab-content" },
    }));
    const __VLS_58 = __VLS_57({
        ...{ class: "tab-content" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_57));
    __VLS_59.slots.default;
    const __VLS_60 = {}.ATabs;
    /** @type {[typeof __VLS_components.ATabs, typeof __VLS_components.aTabs, typeof __VLS_components.ATabs, typeof __VLS_components.aTabs, ]} */ ;
    // @ts-ignore
    const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
        type: "rounded",
        activeKey: (__VLS_ctx.activeModalTab),
    }));
    const __VLS_62 = __VLS_61({
        type: "rounded",
        activeKey: (__VLS_ctx.activeModalTab),
    }, ...__VLS_functionalComponentArgsRest(__VLS_61));
    __VLS_63.slots.default;
    const __VLS_64 = {}.ATabPane;
    /** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ ;
    // @ts-ignore
    const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
        key: "structure",
        title: "表结构",
    }));
    const __VLS_66 = __VLS_65({
        key: "structure",
        title: "表结构",
    }, ...__VLS_functionalComponentArgsRest(__VLS_65));
    __VLS_67.slots.default;
    const __VLS_68 = {}.ATable;
    /** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ ;
    // @ts-ignore
    const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
        data: (__VLS_ctx.tableData.fields || []),
        bordered: (false),
        pagination: (false),
    }));
    const __VLS_70 = __VLS_69({
        data: (__VLS_ctx.tableData.fields || []),
        bordered: (false),
        pagination: (false),
    }, ...__VLS_functionalComponentArgsRest(__VLS_69));
    __VLS_71.slots.default;
    {
        const { columns: __VLS_thisSlot } = __VLS_71.slots;
        const __VLS_72 = {}.ATableColumn;
        /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
        // @ts-ignore
        const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
            title: "字段名",
            dataIndex: "name",
        }));
        const __VLS_74 = __VLS_73({
            title: "字段名",
            dataIndex: "name",
        }, ...__VLS_functionalComponentArgsRest(__VLS_73));
        __VLS_75.slots.default;
        {
            const { cell: __VLS_thisSlot } = __VLS_75.slots;
            const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
            if (['id', 'user_id'].includes(record.name.toLowerCase())) {
                const __VLS_76 = {}.ALink;
                /** @type {[typeof __VLS_components.ALink, typeof __VLS_components.aLink, typeof __VLS_components.ALink, typeof __VLS_components.aLink, ]} */ ;
                // @ts-ignore
                const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
                    ...{ 'onClick': {} },
                }));
                const __VLS_78 = __VLS_77({
                    ...{ 'onClick': {} },
                }, ...__VLS_functionalComponentArgsRest(__VLS_77));
                let __VLS_80;
                let __VLS_81;
                let __VLS_82;
                const __VLS_83 = {
                    onClick: (...[$event]) => {
                        if (!(__VLS_ctx.tableData))
                            return;
                        if (!(['id', 'user_id'].includes(record.name.toLowerCase())))
                            return;
                        __VLS_ctx.showRelatedTables(record);
                    }
                };
                __VLS_79.slots.default;
                (record.name);
                var __VLS_79;
            }
            else {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
                (record.name);
            }
        }
        var __VLS_75;
        const __VLS_84 = {}.ATableColumn;
        /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
        // @ts-ignore
        const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
            title: "类型",
            dataIndex: "type",
        }));
        const __VLS_86 = __VLS_85({
            title: "类型",
            dataIndex: "type",
        }, ...__VLS_functionalComponentArgsRest(__VLS_85));
        const __VLS_88 = {}.ATableColumn;
        /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
        // @ts-ignore
        const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
            title: "描述",
            dataIndex: "description",
        }));
        const __VLS_90 = __VLS_89({
            title: "描述",
            dataIndex: "description",
        }, ...__VLS_functionalComponentArgsRest(__VLS_89));
        const __VLS_92 = {}.ATableColumn;
        /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
        // @ts-ignore
        const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
            title: "操作",
        }));
        const __VLS_94 = __VLS_93({
            title: "操作",
        }, ...__VLS_functionalComponentArgsRest(__VLS_93));
        __VLS_95.slots.default;
        {
            const { cell: __VLS_thisSlot } = __VLS_95.slots;
            const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
            const __VLS_96 = {}.AButton;
            /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
            // @ts-ignore
            const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
                ...{ 'onClick': {} },
                type: "text",
                size: "mini",
            }));
            const __VLS_98 = __VLS_97({
                ...{ 'onClick': {} },
                type: "text",
                size: "mini",
            }, ...__VLS_functionalComponentArgsRest(__VLS_97));
            let __VLS_100;
            let __VLS_101;
            let __VLS_102;
            const __VLS_103 = {
                onClick: (...[$event]) => {
                    if (!(__VLS_ctx.tableData))
                        return;
                    __VLS_ctx.editFieldRelations(record);
                }
            };
            __VLS_99.slots.default;
            var __VLS_99;
        }
        var __VLS_95;
    }
    var __VLS_71;
    var __VLS_67;
    const __VLS_104 = {}.ATabPane;
    /** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ ;
    // @ts-ignore
    const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({
        key: "preview",
        title: "数据预览",
    }));
    const __VLS_106 = __VLS_105({
        key: "preview",
        title: "数据预览",
    }, ...__VLS_functionalComponentArgsRest(__VLS_105));
    __VLS_107.slots.default;
    const __VLS_108 = {}.ATable;
    /** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ ;
    // @ts-ignore
    const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({
        data: (__VLS_ctx.sampleData),
        bordered: (false),
        pagination: (false),
    }));
    const __VLS_110 = __VLS_109({
        data: (__VLS_ctx.sampleData),
        bordered: (false),
        pagination: (false),
    }, ...__VLS_functionalComponentArgsRest(__VLS_109));
    __VLS_111.slots.default;
    {
        const { columns: __VLS_thisSlot } = __VLS_111.slots;
        for (const [field] of __VLS_getVForSourceType((__VLS_ctx.tableData.fields))) {
            const __VLS_112 = {}.ATableColumn;
            /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
            // @ts-ignore
            const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({
                key: (field.name),
                title: (field.name),
                dataIndex: (field.name),
            }));
            const __VLS_114 = __VLS_113({
                key: (field.name),
                title: (field.name),
                dataIndex: (field.name),
            }, ...__VLS_functionalComponentArgsRest(__VLS_113));
        }
    }
    var __VLS_111;
    var __VLS_107;
    const __VLS_116 = {}.ATabPane;
    /** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ ;
    // @ts-ignore
    const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({
        key: "usage",
        title: "使用说明",
    }));
    const __VLS_118 = __VLS_117({
        key: "usage",
        title: "使用说明",
    }, ...__VLS_functionalComponentArgsRest(__VLS_117));
    __VLS_119.slots.default;
    const __VLS_120 = {}.ATypographyParagraph;
    /** @type {[typeof __VLS_components.ATypographyParagraph, typeof __VLS_components.aTypographyParagraph, typeof __VLS_components.ATypographyParagraph, typeof __VLS_components.aTypographyParagraph, ]} */ ;
    // @ts-ignore
    const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({}));
    const __VLS_122 = __VLS_121({}, ...__VLS_functionalComponentArgsRest(__VLS_121));
    __VLS_123.slots.default;
    (__VLS_ctx.tableData.description || '暂无使用说明');
    const __VLS_124 = {}.ALink;
    /** @type {[typeof __VLS_components.ALink, typeof __VLS_components.aLink, typeof __VLS_components.ALink, typeof __VLS_components.aLink, ]} */ ;
    // @ts-ignore
    const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({
        copyable: true,
    }));
    const __VLS_126 = __VLS_125({
        copyable: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_125));
    __VLS_127.slots.default;
    var __VLS_127;
    const __VLS_128 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_129 = __VLS_asFunctionalComponent(__VLS_128, new __VLS_128({
        ...{ 'onClick': {} },
        type: "primary",
        size: "small",
        ...{ style: {} },
    }));
    const __VLS_130 = __VLS_129({
        ...{ 'onClick': {} },
        type: "primary",
        size: "small",
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_129));
    let __VLS_132;
    let __VLS_133;
    let __VLS_134;
    const __VLS_135 = {
        onClick: (...[$event]) => {
            if (!(__VLS_ctx.tableData))
                return;
            __VLS_ctx.router.push('/discovery/data-map/table/dim_user');
        }
    };
    __VLS_131.slots.default;
    {
        const { icon: __VLS_thisSlot } = __VLS_131.slots;
        const __VLS_136 = {}.IconLink;
        /** @type {[typeof __VLS_components.IconLink, typeof __VLS_components.iconLink, ]} */ ;
        // @ts-ignore
        const __VLS_137 = __VLS_asFunctionalComponent(__VLS_136, new __VLS_136({}));
        const __VLS_138 = __VLS_137({}, ...__VLS_functionalComponentArgsRest(__VLS_137));
    }
    var __VLS_131;
    var __VLS_123;
    const __VLS_140 = {}.ATypographyParagraph;
    /** @type {[typeof __VLS_components.ATypographyParagraph, typeof __VLS_components.aTypographyParagraph, typeof __VLS_components.ATypographyParagraph, typeof __VLS_components.aTypographyParagraph, ]} */ ;
    // @ts-ignore
    const __VLS_141 = __VLS_asFunctionalComponent(__VLS_140, new __VLS_140({}));
    const __VLS_142 = __VLS_141({}, ...__VLS_functionalComponentArgsRest(__VLS_141));
    __VLS_143.slots.default;
    const __VLS_144 = {}.AAlert;
    /** @type {[typeof __VLS_components.AAlert, typeof __VLS_components.aAlert, typeof __VLS_components.AAlert, typeof __VLS_components.aAlert, ]} */ ;
    // @ts-ignore
    const __VLS_145 = __VLS_asFunctionalComponent(__VLS_144, new __VLS_144({
        type: "info",
    }));
    const __VLS_146 = __VLS_145({
        type: "info",
    }, ...__VLS_functionalComponentArgsRest(__VLS_145));
    __VLS_147.slots.default;
    {
        const { icon: __VLS_thisSlot } = __VLS_147.slots;
        const __VLS_148 = {}.IconInfoCircle;
        /** @type {[typeof __VLS_components.IconInfoCircle, typeof __VLS_components.iconInfoCircle, ]} */ ;
        // @ts-ignore
        const __VLS_149 = __VLS_asFunctionalComponent(__VLS_148, new __VLS_148({}));
        const __VLS_150 = __VLS_149({}, ...__VLS_functionalComponentArgsRest(__VLS_149));
    }
    {
        const { message: __VLS_thisSlot } = __VLS_147.slots;
        const __VLS_152 = {}.ASpace;
        /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
        // @ts-ignore
        const __VLS_153 = __VLS_asFunctionalComponent(__VLS_152, new __VLS_152({}));
        const __VLS_154 = __VLS_153({}, ...__VLS_functionalComponentArgsRest(__VLS_153));
        __VLS_155.slots.default;
        const __VLS_156 = {}.ATag;
        /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
        // @ts-ignore
        const __VLS_157 = __VLS_asFunctionalComponent(__VLS_156, new __VLS_156({
            ...{ 'onClick': {} },
            color: "#165DFF",
            ...{ style: {} },
        }));
        const __VLS_158 = __VLS_157({
            ...{ 'onClick': {} },
            color: "#165DFF",
            ...{ style: {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_157));
        let __VLS_160;
        let __VLS_161;
        let __VLS_162;
        const __VLS_163 = {
            onClick: (...[$event]) => {
                if (!(__VLS_ctx.tableData))
                    return;
                __VLS_ctx.router.push('/discovery/data-map/table/fact_loan_apply');
            }
        };
        __VLS_159.slots.default;
        var __VLS_159;
        const __VLS_164 = {}.ATag;
        /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
        // @ts-ignore
        const __VLS_165 = __VLS_asFunctionalComponent(__VLS_164, new __VLS_164({
            ...{ 'onClick': {} },
            color: "#722ED1",
            ...{ style: {} },
        }));
        const __VLS_166 = __VLS_165({
            ...{ 'onClick': {} },
            color: "#722ED1",
            ...{ style: {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_165));
        let __VLS_168;
        let __VLS_169;
        let __VLS_170;
        const __VLS_171 = {
            onClick: (...[$event]) => {
                if (!(__VLS_ctx.tableData))
                    return;
                __VLS_ctx.router.push('/discovery/data-map/table/dwd_fraud_alert');
            }
        };
        __VLS_167.slots.default;
        var __VLS_167;
        const __VLS_172 = {}.ATag;
        /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
        // @ts-ignore
        const __VLS_173 = __VLS_asFunctionalComponent(__VLS_172, new __VLS_172({
            ...{ 'onClick': {} },
            color: "#0FC6C2",
            ...{ style: {} },
        }));
        const __VLS_174 = __VLS_173({
            ...{ 'onClick': {} },
            color: "#0FC6C2",
            ...{ style: {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_173));
        let __VLS_176;
        let __VLS_177;
        let __VLS_178;
        const __VLS_179 = {
            onClick: (...[$event]) => {
                if (!(__VLS_ctx.tableData))
                    return;
                __VLS_ctx.router.push('/discovery/data-map/table/dws_risk_score');
            }
        };
        __VLS_175.slots.default;
        var __VLS_175;
        var __VLS_155;
    }
    var __VLS_147;
    var __VLS_143;
    const __VLS_180 = {}.ATypographyParagraph;
    /** @type {[typeof __VLS_components.ATypographyParagraph, typeof __VLS_components.aTypographyParagraph, typeof __VLS_components.ATypographyParagraph, typeof __VLS_components.aTypographyParagraph, ]} */ ;
    // @ts-ignore
    const __VLS_181 = __VLS_asFunctionalComponent(__VLS_180, new __VLS_180({}));
    const __VLS_182 = __VLS_181({}, ...__VLS_functionalComponentArgsRest(__VLS_181));
    __VLS_183.slots.default;
    const __VLS_184 = {}.AAlert;
    /** @type {[typeof __VLS_components.AAlert, typeof __VLS_components.aAlert, typeof __VLS_components.AAlert, typeof __VLS_components.aAlert, ]} */ ;
    // @ts-ignore
    const __VLS_185 = __VLS_asFunctionalComponent(__VLS_184, new __VLS_184({
        type: "warning",
    }));
    const __VLS_186 = __VLS_185({
        type: "warning",
    }, ...__VLS_functionalComponentArgsRest(__VLS_185));
    __VLS_187.slots.default;
    {
        const { icon: __VLS_thisSlot } = __VLS_187.slots;
        const __VLS_188 = {}.IconExclamationCircle;
        /** @type {[typeof __VLS_components.IconExclamationCircle, typeof __VLS_components.iconExclamationCircle, ]} */ ;
        // @ts-ignore
        const __VLS_189 = __VLS_asFunctionalComponent(__VLS_188, new __VLS_188({}));
        const __VLS_190 = __VLS_189({}, ...__VLS_functionalComponentArgsRest(__VLS_189));
    }
    {
        const { message: __VLS_thisSlot } = __VLS_187.slots;
    }
    var __VLS_187;
    var __VLS_183;
    var __VLS_119;
    var __VLS_63;
    var __VLS_59;
    const __VLS_192 = {}.AModal;
    /** @type {[typeof __VLS_components.AModal, typeof __VLS_components.aModal, typeof __VLS_components.AModal, typeof __VLS_components.aModal, ]} */ ;
    // @ts-ignore
    const __VLS_193 = __VLS_asFunctionalComponent(__VLS_192, new __VLS_192({
        visible: (__VLS_ctx.relationModalVisible),
        title: (__VLS_ctx.modalTitle),
        width: "800px",
    }));
    const __VLS_194 = __VLS_193({
        visible: (__VLS_ctx.relationModalVisible),
        title: (__VLS_ctx.modalTitle),
        width: "800px",
    }, ...__VLS_functionalComponentArgsRest(__VLS_193));
    __VLS_195.slots.default;
    if (__VLS_ctx.activeModalTab === 'view') {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        const __VLS_196 = {}.ATable;
        /** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ ;
        // @ts-ignore
        const __VLS_197 = __VLS_asFunctionalComponent(__VLS_196, new __VLS_196({
            data: (__VLS_ctx.relatedTables),
            bordered: (false),
        }));
        const __VLS_198 = __VLS_197({
            data: (__VLS_ctx.relatedTables),
            bordered: (false),
        }, ...__VLS_functionalComponentArgsRest(__VLS_197));
        __VLS_199.slots.default;
        {
            const { columns: __VLS_thisSlot } = __VLS_199.slots;
            const __VLS_200 = {}.ATableColumn;
            /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
            // @ts-ignore
            const __VLS_201 = __VLS_asFunctionalComponent(__VLS_200, new __VLS_200({
                title: "表名",
                dataIndex: "name",
            }));
            const __VLS_202 = __VLS_201({
                title: "表名",
                dataIndex: "name",
            }, ...__VLS_functionalComponentArgsRest(__VLS_201));
            __VLS_203.slots.default;
            {
                const { cell: __VLS_thisSlot } = __VLS_203.slots;
                const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
                const __VLS_204 = {}.ALink;
                /** @type {[typeof __VLS_components.ALink, typeof __VLS_components.aLink, typeof __VLS_components.ALink, typeof __VLS_components.aLink, ]} */ ;
                // @ts-ignore
                const __VLS_205 = __VLS_asFunctionalComponent(__VLS_204, new __VLS_204({
                    ...{ 'onClick': {} },
                }));
                const __VLS_206 = __VLS_205({
                    ...{ 'onClick': {} },
                }, ...__VLS_functionalComponentArgsRest(__VLS_205));
                let __VLS_208;
                let __VLS_209;
                let __VLS_210;
                const __VLS_211 = {
                    onClick: (...[$event]) => {
                        if (!(__VLS_ctx.tableData))
                            return;
                        if (!(__VLS_ctx.activeModalTab === 'view'))
                            return;
                        __VLS_ctx.goToTableDetail(record);
                    }
                };
                __VLS_207.slots.default;
                (record.name);
                var __VLS_207;
            }
            var __VLS_203;
            const __VLS_212 = {}.ATableColumn;
            /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
            // @ts-ignore
            const __VLS_213 = __VLS_asFunctionalComponent(__VLS_212, new __VLS_212({
                title: "类型",
                dataIndex: "type",
            }));
            const __VLS_214 = __VLS_213({
                title: "类型",
                dataIndex: "type",
            }, ...__VLS_functionalComponentArgsRest(__VLS_213));
            __VLS_215.slots.default;
            {
                const { cell: __VLS_thisSlot } = __VLS_215.slots;
                const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
                const __VLS_216 = {}.ATag;
                /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
                // @ts-ignore
                const __VLS_217 = __VLS_asFunctionalComponent(__VLS_216, new __VLS_216({
                    color: (__VLS_ctx.getTypeColor(record.type)),
                }));
                const __VLS_218 = __VLS_217({
                    color: (__VLS_ctx.getTypeColor(record.type)),
                }, ...__VLS_functionalComponentArgsRest(__VLS_217));
                __VLS_219.slots.default;
                (record.type);
                var __VLS_219;
            }
            var __VLS_215;
            const __VLS_220 = {}.ATableColumn;
            /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
            // @ts-ignore
            const __VLS_221 = __VLS_asFunctionalComponent(__VLS_220, new __VLS_220({
                title: "关联字段",
                dataIndex: "relationField",
            }));
            const __VLS_222 = __VLS_221({
                title: "关联字段",
                dataIndex: "relationField",
            }, ...__VLS_functionalComponentArgsRest(__VLS_221));
            __VLS_223.slots.default;
            {
                const { cell: __VLS_thisSlot } = __VLS_223.slots;
                const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
                (__VLS_ctx.currentField?.name || 'user_id');
            }
            var __VLS_223;
            const __VLS_224 = {}.ATableColumn;
            /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
            // @ts-ignore
            const __VLS_225 = __VLS_asFunctionalComponent(__VLS_224, new __VLS_224({
                title: "关联类型",
                dataIndex: "relationType",
            }));
            const __VLS_226 = __VLS_225({
                title: "关联类型",
                dataIndex: "relationType",
            }, ...__VLS_functionalComponentArgsRest(__VLS_225));
            __VLS_227.slots.default;
            {
                const { cell: __VLS_thisSlot } = __VLS_227.slots;
                const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
                (record.relationType || '主表关联');
            }
            var __VLS_227;
            const __VLS_228 = {}.ATableColumn;
            /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
            // @ts-ignore
            const __VLS_229 = __VLS_asFunctionalComponent(__VLS_228, new __VLS_228({
                title: "关联说明",
                dataIndex: "relationDescription",
            }));
            const __VLS_230 = __VLS_229({
                title: "关联说明",
                dataIndex: "relationDescription",
            }, ...__VLS_functionalComponentArgsRest(__VLS_229));
            __VLS_231.slots.default;
            {
                const { cell: __VLS_thisSlot } = __VLS_231.slots;
                const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
                (record.relationDescription || '提供数据关联');
            }
            var __VLS_231;
        }
        var __VLS_199;
    }
    if (__VLS_ctx.activeModalTab === 'edit') {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        /** @type {[typeof RelationEditorPanel, ]} */ ;
        // @ts-ignore
        const __VLS_232 = __VLS_asFunctionalComponent(RelationEditorPanel, new RelationEditorPanel({
            ...{ 'onSaveRelations': {} },
            fieldName: (__VLS_ctx.editingField?.name || ''),
            initialRelations: (__VLS_ctx.fieldRelations),
        }));
        const __VLS_233 = __VLS_232({
            ...{ 'onSaveRelations': {} },
            fieldName: (__VLS_ctx.editingField?.name || ''),
            initialRelations: (__VLS_ctx.fieldRelations),
        }, ...__VLS_functionalComponentArgsRest(__VLS_232));
        let __VLS_235;
        let __VLS_236;
        let __VLS_237;
        const __VLS_238 = {
            onSaveRelations: (__VLS_ctx.handleSaveRelations)
        };
        var __VLS_234;
    }
    var __VLS_195;
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "empty-state" },
    });
    const __VLS_239 = {}.AEmpty;
    /** @type {[typeof __VLS_components.AEmpty, typeof __VLS_components.aEmpty, ]} */ ;
    // @ts-ignore
    const __VLS_240 = __VLS_asFunctionalComponent(__VLS_239, new __VLS_239({
        description: "请选择一个数据表查看详情",
    }));
    const __VLS_241 = __VLS_240({
        description: "请选择一个数据表查看详情",
    }, ...__VLS_functionalComponentArgsRest(__VLS_240));
}
/** @type {__VLS_StyleScopedClasses['table-detail-page']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['table-content']} */ ;
/** @type {__VLS_StyleScopedClasses['table-info']} */ ;
/** @type {__VLS_StyleScopedClasses['tab-content']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            IconStar: IconStar,
            IconSafe: IconSafe,
            IconFolderAdd: IconFolderAdd,
            IconLink: IconLink,
            IconInfoCircle: IconInfoCircle,
            IconExclamationCircle: IconExclamationCircle,
            RelationEditorPanel: RelationEditorPanel,
            router: router,
            tableData: tableData,
            goToTableDetail: goToTableDetail,
            isFavorite: isFavorite,
            relationModalVisible: relationModalVisible,
            sampleData: sampleData,
            currentField: currentField,
            activeModalTab: activeModalTab,
            relatedTables: relatedTables,
            tableBasicInfo: tableBasicInfo,
            modalTitle: modalTitle,
            toggleFavorite: toggleFavorite,
            showAddToCollection: showAddToCollection,
            applyPermission: applyPermission,
            showRelatedTables: showRelatedTables,
            getTypeColor: getTypeColor,
            editingField: editingField,
            fieldRelations: fieldRelations,
            editFieldRelations: editFieldRelations,
            handleSaveRelations: handleSaveRelations,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
