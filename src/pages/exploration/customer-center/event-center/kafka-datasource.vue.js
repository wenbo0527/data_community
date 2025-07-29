import { ref, reactive, onMounted } from 'vue';
import { Message, Modal } from '@arco-design/web-vue';
import { IconSearch, IconPlus, IconEdit, IconDelete, IconMore, IconLink, IconCheckCircle, IconCloseCircle } from '@arco-design/web-vue/es/icon';
// 页面状态
const loading = ref(false);
const saving = ref(false);
const showCreateForm = ref(false);
const showTestResult = ref(false);
const isEdit = ref(false);
const testSuccess = ref(false);
const testMessage = ref('');
// 搜索表单
const searchForm = reactive({
    datasourceName: ''
});
// 数据源表单
const datasourceForm = reactive({
    id: null,
    datasourceName: '',
    brokerAddress: '',
    port: 9092,
    authType: 'NONE',
    saslMechanism: '',
    username: '',
    password: '',
    description: '',
    owner: ''
});
// 表单验证规则
const datasourceRules = {
    datasourceName: [
        { required: true, message: '请输入数据源名称' }
    ],
    brokerAddress: [
        { required: true, message: '请输入Broker地址' }
    ],
    port: [
        { required: true, message: '请输入端口号' }
    ],
    authType: [
        { required: true, message: '请选择认证方式' }
    ],
    owner: [
        { required: true, message: '请选择负责人' }
    ]
};
// 负责人选项
const owners = ref([
    { id: 'user1', name: '张三' },
    { id: 'user2', name: '李四' },
    { id: 'user3', name: '王五' },
    { id: 'user4', name: '赵六' }
]);
// 分页配置
const pagination = reactive({
    current: 1,
    pageSize: 15,
    total: 0
});
// 表格数据
const tableData = ref([]);
const datasourceFormRef = ref();
// 获取状态颜色
const getStatusColor = (status) => {
    const colorMap = {
        '正常': 'green',
        '异常': 'red',
        '未测试': 'gray'
    };
    return colorMap[status] || 'gray';
};
// 生成模拟数据
const generateMockData = () => {
    const mockData = [];
    const statuses = ['正常', '异常', '未测试'];
    const authTypes = ['NONE', 'SASL_PLAINTEXT', 'SASL_SSL', 'SSL'];
    for (let i = 1; i <= 50; i++) {
        mockData.push({
            id: i,
            datasourceName: `kafka-datasource-${i.toString().padStart(2, '0')}`,
            brokerAddress: `192.168.1.${100 + (i % 50)}`,
            port: 9092 + (i % 3),
            authType: authTypes[i % authTypes.length],
            status: statuses[i % statuses.length],
            createTime: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleString(),
            owner: owners.value[i % owners.value.length].name,
            description: `Kafka数据源${i}的描述信息`
        });
    }
    return mockData;
};
// 加载数据
const loadData = async () => {
    loading.value = true;
    try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 500));
        const allData = generateMockData();
        // 搜索过滤
        let filteredData = allData;
        if (searchForm.datasourceName) {
            filteredData = allData.filter(item => item.datasourceName.toLowerCase().includes(searchForm.datasourceName.toLowerCase()));
        }
        // 分页
        const start = (pagination.current - 1) * pagination.pageSize;
        const end = start + pagination.pageSize;
        tableData.value = filteredData.slice(start, end);
        pagination.total = filteredData.length;
    }
    catch (error) {
        Message.error('加载数据失败');
    }
    finally {
        loading.value = false;
    }
};
// 搜索
const handleSearch = () => {
    pagination.current = 1;
    loadData();
};
// 分页变化
const onPageChange = (page) => {
    pagination.current = page;
    loadData();
};
const onPageSizeChange = (pageSize) => {
    pagination.pageSize = pageSize;
    pagination.current = 1;
    loadData();
};
// 显示新建数据源
const showCreateDatasource = () => {
    isEdit.value = false;
    resetForm();
    showCreateForm.value = true;
};
// 编辑数据源
const editDatasource = (record) => {
    isEdit.value = true;
    Object.assign(datasourceForm, record);
    showCreateForm.value = true;
};
// 查看数据源详情
const viewDatasourceDetail = (record) => {
    editDatasource(record);
};
// 重置表单
const resetForm = () => {
    Object.assign(datasourceForm, {
        id: null,
        datasourceName: '',
        brokerAddress: '',
        port: 9092,
        authType: 'NONE',
        saslMechanism: '',
        username: '',
        password: '',
        description: '',
        owner: ''
    });
    datasourceFormRef.value?.resetFields();
};
// 取消创建
const cancelCreate = () => {
    showCreateForm.value = false;
    resetForm();
};
// 保存数据源
const saveDatasource = async () => {
    try {
        const valid = await datasourceFormRef.value?.validate();
        if (!valid) {
            saving.value = true;
            // 模拟API调用
            await new Promise(resolve => setTimeout(resolve, 1000));
            Message.success(isEdit.value ? '数据源更新成功' : '数据源创建成功');
            showCreateForm.value = false;
            resetForm();
            loadData();
        }
    }
    catch (error) {
        Message.error('保存失败，请检查表单信息');
    }
    finally {
        saving.value = false;
    }
};
// 测试连接
const testConnection = async (record) => {
    loading.value = true;
    try {
        // 模拟连接测试
        await new Promise(resolve => setTimeout(resolve, 2000));
        // 随机成功或失败
        const success = Math.random() > 0.3;
        testSuccess.value = success;
        testMessage.value = success
            ? `成功连接到 ${record.brokerAddress}:${record.port}`
            : '连接失败，请检查网络配置和认证信息';
        showTestResult.value = true;
    }
    catch (error) {
        Message.error('测试连接失败');
    }
    finally {
        loading.value = false;
    }
};
// 删除数据源
const deleteDatasource = (record) => {
    Modal.confirm({
        title: '确认删除',
        content: `确定要删除数据源 "${record.datasourceName}" 吗？此操作不可恢复。`,
        onOk: async () => {
            try {
                // 模拟API调用
                await new Promise(resolve => setTimeout(resolve, 500));
                Message.success('删除成功');
                loadData();
            }
            catch (error) {
                Message.error('删除失败');
            }
        }
    });
};
// 初始化
onMounted(() => {
    loadData();
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['arco-table-td']} */ ;
/** @type {__VLS_StyleScopedClasses['arco-input']} */ ;
/** @type {__VLS_StyleScopedClasses['arco-textarea']} */ ;
/** @type {__VLS_StyleScopedClasses['arco-btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['danger-option']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "kafka-datasource" },
});
if (!__VLS_ctx.showCreateForm) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "datasource-list" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "page-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "header-content" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "title-area" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
        ...{ class: "page-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "page-description" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "header-actions" },
    });
    const __VLS_0 = {}.ASpace;
    /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        size: "small",
    }));
    const __VLS_2 = __VLS_1({
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_3.slots.default;
    const __VLS_4 = {}.AInput;
    /** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
    // @ts-ignore
    const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
        ...{ 'onPressEnter': {} },
        modelValue: (__VLS_ctx.searchForm.datasourceName),
        placeholder: "搜索数据源名称",
        allowClear: true,
        ...{ style: {} },
    }));
    const __VLS_6 = __VLS_5({
        ...{ 'onPressEnter': {} },
        modelValue: (__VLS_ctx.searchForm.datasourceName),
        placeholder: "搜索数据源名称",
        allowClear: true,
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_5));
    let __VLS_8;
    let __VLS_9;
    let __VLS_10;
    const __VLS_11 = {
        onPressEnter: (__VLS_ctx.handleSearch)
    };
    __VLS_7.slots.default;
    {
        const { prefix: __VLS_thisSlot } = __VLS_7.slots;
        const __VLS_12 = {}.IconSearch;
        /** @type {[typeof __VLS_components.IconSearch, typeof __VLS_components.iconSearch, ]} */ ;
        // @ts-ignore
        const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
            ...{ style: {} },
        }));
        const __VLS_14 = __VLS_13({
            ...{ style: {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    }
    var __VLS_7;
    const __VLS_16 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
        ...{ 'onClick': {} },
        type: "primary",
        size: "small",
    }));
    const __VLS_18 = __VLS_17({
        ...{ 'onClick': {} },
        type: "primary",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    let __VLS_20;
    let __VLS_21;
    let __VLS_22;
    const __VLS_23 = {
        onClick: (__VLS_ctx.showCreateDatasource)
    };
    __VLS_19.slots.default;
    {
        const { icon: __VLS_thisSlot } = __VLS_19.slots;
        const __VLS_24 = {}.IconPlus;
        /** @type {[typeof __VLS_components.IconPlus, typeof __VLS_components.iconPlus, ]} */ ;
        // @ts-ignore
        const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({}));
        const __VLS_26 = __VLS_25({}, ...__VLS_functionalComponentArgsRest(__VLS_25));
    }
    var __VLS_19;
    var __VLS_3;
    const __VLS_28 = {}.ACard;
    /** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
        ...{ class: "content-card" },
        bordered: (false),
    }));
    const __VLS_30 = __VLS_29({
        ...{ class: "content-card" },
        bordered: (false),
    }, ...__VLS_functionalComponentArgsRest(__VLS_29));
    __VLS_31.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "table-section" },
    });
    const __VLS_32 = {}.ATable;
    /** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ ;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
        ...{ 'onPageChange': {} },
        ...{ 'onPageSizeChange': {} },
        data: (__VLS_ctx.tableData),
        loading: (__VLS_ctx.loading),
        pagination: ({
            ...__VLS_ctx.pagination,
            showTotal: true,
            showPageSize: true,
            pageSizeOptions: ['15', '30', '50', '100'],
            size: 'small'
        }),
        ...{ class: "datasource-table" },
        size: "small",
        scroll: ({ x: 1200 }),
    }));
    const __VLS_34 = __VLS_33({
        ...{ 'onPageChange': {} },
        ...{ 'onPageSizeChange': {} },
        data: (__VLS_ctx.tableData),
        loading: (__VLS_ctx.loading),
        pagination: ({
            ...__VLS_ctx.pagination,
            showTotal: true,
            showPageSize: true,
            pageSizeOptions: ['15', '30', '50', '100'],
            size: 'small'
        }),
        ...{ class: "datasource-table" },
        size: "small",
        scroll: ({ x: 1200 }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    let __VLS_36;
    let __VLS_37;
    let __VLS_38;
    const __VLS_39 = {
        onPageChange: (__VLS_ctx.onPageChange)
    };
    const __VLS_40 = {
        onPageSizeChange: (__VLS_ctx.onPageSizeChange)
    };
    __VLS_35.slots.default;
    {
        const { columns: __VLS_thisSlot } = __VLS_35.slots;
        const __VLS_41 = {}.ATableColumn;
        /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
        // @ts-ignore
        const __VLS_42 = __VLS_asFunctionalComponent(__VLS_41, new __VLS_41({
            title: "ID",
            dataIndex: "id",
            width: (80),
            fixed: "left",
        }));
        const __VLS_43 = __VLS_42({
            title: "ID",
            dataIndex: "id",
            width: (80),
            fixed: "left",
        }, ...__VLS_functionalComponentArgsRest(__VLS_42));
        const __VLS_45 = {}.ATableColumn;
        /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
        // @ts-ignore
        const __VLS_46 = __VLS_asFunctionalComponent(__VLS_45, new __VLS_45({
            title: "数据源名称",
            dataIndex: "datasourceName",
            width: (160),
        }));
        const __VLS_47 = __VLS_46({
            title: "数据源名称",
            dataIndex: "datasourceName",
            width: (160),
        }, ...__VLS_functionalComponentArgsRest(__VLS_46));
        __VLS_48.slots.default;
        {
            const { cell: __VLS_thisSlot } = __VLS_48.slots;
            const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
            const __VLS_49 = {}.ALink;
            /** @type {[typeof __VLS_components.ALink, typeof __VLS_components.aLink, typeof __VLS_components.ALink, typeof __VLS_components.aLink, ]} */ ;
            // @ts-ignore
            const __VLS_50 = __VLS_asFunctionalComponent(__VLS_49, new __VLS_49({
                ...{ 'onClick': {} },
            }));
            const __VLS_51 = __VLS_50({
                ...{ 'onClick': {} },
            }, ...__VLS_functionalComponentArgsRest(__VLS_50));
            let __VLS_53;
            let __VLS_54;
            let __VLS_55;
            const __VLS_56 = {
                onClick: (...[$event]) => {
                    if (!(!__VLS_ctx.showCreateForm))
                        return;
                    __VLS_ctx.viewDatasourceDetail(record);
                }
            };
            __VLS_52.slots.default;
            (record.datasourceName);
            var __VLS_52;
        }
        var __VLS_48;
        const __VLS_57 = {}.ATableColumn;
        /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
        // @ts-ignore
        const __VLS_58 = __VLS_asFunctionalComponent(__VLS_57, new __VLS_57({
            title: "Broker地址",
            dataIndex: "brokerAddress",
            width: (200),
        }));
        const __VLS_59 = __VLS_58({
            title: "Broker地址",
            dataIndex: "brokerAddress",
            width: (200),
        }, ...__VLS_functionalComponentArgsRest(__VLS_58));
        const __VLS_61 = {}.ATableColumn;
        /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
        // @ts-ignore
        const __VLS_62 = __VLS_asFunctionalComponent(__VLS_61, new __VLS_61({
            title: "端口",
            dataIndex: "port",
            width: (80),
        }));
        const __VLS_63 = __VLS_62({
            title: "端口",
            dataIndex: "port",
            width: (80),
        }, ...__VLS_functionalComponentArgsRest(__VLS_62));
        const __VLS_65 = {}.ATableColumn;
        /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
        // @ts-ignore
        const __VLS_66 = __VLS_asFunctionalComponent(__VLS_65, new __VLS_65({
            title: "认证方式",
            dataIndex: "authType",
            width: (100),
        }));
        const __VLS_67 = __VLS_66({
            title: "认证方式",
            dataIndex: "authType",
            width: (100),
        }, ...__VLS_functionalComponentArgsRest(__VLS_66));
        __VLS_68.slots.default;
        {
            const { cell: __VLS_thisSlot } = __VLS_68.slots;
            const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
            const __VLS_69 = {}.ATag;
            /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
            // @ts-ignore
            const __VLS_70 = __VLS_asFunctionalComponent(__VLS_69, new __VLS_69({
                size: "small",
            }));
            const __VLS_71 = __VLS_70({
                size: "small",
            }, ...__VLS_functionalComponentArgsRest(__VLS_70));
            __VLS_72.slots.default;
            (record.authType);
            var __VLS_72;
        }
        var __VLS_68;
        const __VLS_73 = {}.ATableColumn;
        /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
        // @ts-ignore
        const __VLS_74 = __VLS_asFunctionalComponent(__VLS_73, new __VLS_73({
            title: "状态",
            dataIndex: "status",
            width: (80),
        }));
        const __VLS_75 = __VLS_74({
            title: "状态",
            dataIndex: "status",
            width: (80),
        }, ...__VLS_functionalComponentArgsRest(__VLS_74));
        __VLS_76.slots.default;
        {
            const { cell: __VLS_thisSlot } = __VLS_76.slots;
            const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
            const __VLS_77 = {}.ATag;
            /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
            // @ts-ignore
            const __VLS_78 = __VLS_asFunctionalComponent(__VLS_77, new __VLS_77({
                color: (__VLS_ctx.getStatusColor(record.status)),
                size: "small",
            }));
            const __VLS_79 = __VLS_78({
                color: (__VLS_ctx.getStatusColor(record.status)),
                size: "small",
            }, ...__VLS_functionalComponentArgsRest(__VLS_78));
            __VLS_80.slots.default;
            (record.status);
            var __VLS_80;
        }
        var __VLS_76;
        const __VLS_81 = {}.ATableColumn;
        /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
        // @ts-ignore
        const __VLS_82 = __VLS_asFunctionalComponent(__VLS_81, new __VLS_81({
            title: "创建时间",
            dataIndex: "createTime",
            width: (140),
        }));
        const __VLS_83 = __VLS_82({
            title: "创建时间",
            dataIndex: "createTime",
            width: (140),
        }, ...__VLS_functionalComponentArgsRest(__VLS_82));
        __VLS_84.slots.default;
        {
            const { cell: __VLS_thisSlot } = __VLS_84.slots;
            const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ style: {} },
            });
            (record.createTime);
        }
        var __VLS_84;
        const __VLS_85 = {}.ATableColumn;
        /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
        // @ts-ignore
        const __VLS_86 = __VLS_asFunctionalComponent(__VLS_85, new __VLS_85({
            title: "负责人",
            dataIndex: "owner",
            width: (80),
        }));
        const __VLS_87 = __VLS_86({
            title: "负责人",
            dataIndex: "owner",
            width: (80),
        }, ...__VLS_functionalComponentArgsRest(__VLS_86));
        const __VLS_89 = {}.ATableColumn;
        /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
        // @ts-ignore
        const __VLS_90 = __VLS_asFunctionalComponent(__VLS_89, new __VLS_89({
            title: "操作",
            width: (120),
            fixed: "right",
        }));
        const __VLS_91 = __VLS_90({
            title: "操作",
            width: (120),
            fixed: "right",
        }, ...__VLS_functionalComponentArgsRest(__VLS_90));
        __VLS_92.slots.default;
        {
            const { cell: __VLS_thisSlot } = __VLS_92.slots;
            const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
            const __VLS_93 = {}.ASpace;
            /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
            // @ts-ignore
            const __VLS_94 = __VLS_asFunctionalComponent(__VLS_93, new __VLS_93({
                size: "mini",
            }));
            const __VLS_95 = __VLS_94({
                size: "mini",
            }, ...__VLS_functionalComponentArgsRest(__VLS_94));
            __VLS_96.slots.default;
            const __VLS_97 = {}.AButton;
            /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
            // @ts-ignore
            const __VLS_98 = __VLS_asFunctionalComponent(__VLS_97, new __VLS_97({
                ...{ 'onClick': {} },
                type: "text",
                size: "mini",
            }));
            const __VLS_99 = __VLS_98({
                ...{ 'onClick': {} },
                type: "text",
                size: "mini",
            }, ...__VLS_functionalComponentArgsRest(__VLS_98));
            let __VLS_101;
            let __VLS_102;
            let __VLS_103;
            const __VLS_104 = {
                onClick: (...[$event]) => {
                    if (!(!__VLS_ctx.showCreateForm))
                        return;
                    __VLS_ctx.editDatasource(record);
                }
            };
            __VLS_100.slots.default;
            const __VLS_105 = {}.IconEdit;
            /** @type {[typeof __VLS_components.IconEdit, typeof __VLS_components.iconEdit, ]} */ ;
            // @ts-ignore
            const __VLS_106 = __VLS_asFunctionalComponent(__VLS_105, new __VLS_105({}));
            const __VLS_107 = __VLS_106({}, ...__VLS_functionalComponentArgsRest(__VLS_106));
            var __VLS_100;
            const __VLS_109 = {}.AButton;
            /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
            // @ts-ignore
            const __VLS_110 = __VLS_asFunctionalComponent(__VLS_109, new __VLS_109({
                ...{ 'onClick': {} },
                type: "text",
                size: "mini",
            }));
            const __VLS_111 = __VLS_110({
                ...{ 'onClick': {} },
                type: "text",
                size: "mini",
            }, ...__VLS_functionalComponentArgsRest(__VLS_110));
            let __VLS_113;
            let __VLS_114;
            let __VLS_115;
            const __VLS_116 = {
                onClick: (...[$event]) => {
                    if (!(!__VLS_ctx.showCreateForm))
                        return;
                    __VLS_ctx.testConnection(record);
                }
            };
            __VLS_112.slots.default;
            const __VLS_117 = {}.IconLink;
            /** @type {[typeof __VLS_components.IconLink, typeof __VLS_components.iconLink, ]} */ ;
            // @ts-ignore
            const __VLS_118 = __VLS_asFunctionalComponent(__VLS_117, new __VLS_117({}));
            const __VLS_119 = __VLS_118({}, ...__VLS_functionalComponentArgsRest(__VLS_118));
            var __VLS_112;
            const __VLS_121 = {}.ADropdown;
            /** @type {[typeof __VLS_components.ADropdown, typeof __VLS_components.aDropdown, typeof __VLS_components.ADropdown, typeof __VLS_components.aDropdown, ]} */ ;
            // @ts-ignore
            const __VLS_122 = __VLS_asFunctionalComponent(__VLS_121, new __VLS_121({
                trigger: "click",
            }));
            const __VLS_123 = __VLS_122({
                trigger: "click",
            }, ...__VLS_functionalComponentArgsRest(__VLS_122));
            __VLS_124.slots.default;
            const __VLS_125 = {}.AButton;
            /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
            // @ts-ignore
            const __VLS_126 = __VLS_asFunctionalComponent(__VLS_125, new __VLS_125({
                type: "text",
                size: "mini",
            }));
            const __VLS_127 = __VLS_126({
                type: "text",
                size: "mini",
            }, ...__VLS_functionalComponentArgsRest(__VLS_126));
            __VLS_128.slots.default;
            const __VLS_129 = {}.IconMore;
            /** @type {[typeof __VLS_components.IconMore, typeof __VLS_components.iconMore, ]} */ ;
            // @ts-ignore
            const __VLS_130 = __VLS_asFunctionalComponent(__VLS_129, new __VLS_129({}));
            const __VLS_131 = __VLS_130({}, ...__VLS_functionalComponentArgsRest(__VLS_130));
            var __VLS_128;
            {
                const { content: __VLS_thisSlot } = __VLS_124.slots;
                const __VLS_133 = {}.ADoption;
                /** @type {[typeof __VLS_components.ADoption, typeof __VLS_components.aDoption, typeof __VLS_components.ADoption, typeof __VLS_components.aDoption, ]} */ ;
                // @ts-ignore
                const __VLS_134 = __VLS_asFunctionalComponent(__VLS_133, new __VLS_133({
                    ...{ 'onClick': {} },
                    ...{ class: "danger-option" },
                }));
                const __VLS_135 = __VLS_134({
                    ...{ 'onClick': {} },
                    ...{ class: "danger-option" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_134));
                let __VLS_137;
                let __VLS_138;
                let __VLS_139;
                const __VLS_140 = {
                    onClick: (...[$event]) => {
                        if (!(!__VLS_ctx.showCreateForm))
                            return;
                        __VLS_ctx.deleteDatasource(record);
                    }
                };
                __VLS_136.slots.default;
                const __VLS_141 = {}.IconDelete;
                /** @type {[typeof __VLS_components.IconDelete, typeof __VLS_components.iconDelete, ]} */ ;
                // @ts-ignore
                const __VLS_142 = __VLS_asFunctionalComponent(__VLS_141, new __VLS_141({}));
                const __VLS_143 = __VLS_142({}, ...__VLS_functionalComponentArgsRest(__VLS_142));
                var __VLS_136;
            }
            var __VLS_124;
            var __VLS_96;
        }
        var __VLS_92;
    }
    var __VLS_35;
    var __VLS_31;
}
const __VLS_145 = {}.AModal;
/** @type {[typeof __VLS_components.AModal, typeof __VLS_components.aModal, typeof __VLS_components.AModal, typeof __VLS_components.aModal, ]} */ ;
// @ts-ignore
const __VLS_146 = __VLS_asFunctionalComponent(__VLS_145, new __VLS_145({
    ...{ 'onOk': {} },
    ...{ 'onCancel': {} },
    visible: (__VLS_ctx.showCreateForm),
    title: (__VLS_ctx.isEdit ? '编辑Kafka数据源' : '新建Kafka数据源'),
    width: "800px",
    okLoading: (__VLS_ctx.saving),
}));
const __VLS_147 = __VLS_146({
    ...{ 'onOk': {} },
    ...{ 'onCancel': {} },
    visible: (__VLS_ctx.showCreateForm),
    title: (__VLS_ctx.isEdit ? '编辑Kafka数据源' : '新建Kafka数据源'),
    width: "800px",
    okLoading: (__VLS_ctx.saving),
}, ...__VLS_functionalComponentArgsRest(__VLS_146));
let __VLS_149;
let __VLS_150;
let __VLS_151;
const __VLS_152 = {
    onOk: (__VLS_ctx.saveDatasource)
};
const __VLS_153 = {
    onCancel: (__VLS_ctx.cancelCreate)
};
__VLS_148.slots.default;
const __VLS_154 = {}.AForm;
/** @type {[typeof __VLS_components.AForm, typeof __VLS_components.aForm, typeof __VLS_components.AForm, typeof __VLS_components.aForm, ]} */ ;
// @ts-ignore
const __VLS_155 = __VLS_asFunctionalComponent(__VLS_154, new __VLS_154({
    model: (__VLS_ctx.datasourceForm),
    rules: (__VLS_ctx.datasourceRules),
    ref: "datasourceFormRef",
    layout: "vertical",
}));
const __VLS_156 = __VLS_155({
    model: (__VLS_ctx.datasourceForm),
    rules: (__VLS_ctx.datasourceRules),
    ref: "datasourceFormRef",
    layout: "vertical",
}, ...__VLS_functionalComponentArgsRest(__VLS_155));
/** @type {typeof __VLS_ctx.datasourceFormRef} */ ;
var __VLS_158 = {};
__VLS_157.slots.default;
const __VLS_160 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_161 = __VLS_asFunctionalComponent(__VLS_160, new __VLS_160({
    gutter: (16),
}));
const __VLS_162 = __VLS_161({
    gutter: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_161));
__VLS_163.slots.default;
const __VLS_164 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_165 = __VLS_asFunctionalComponent(__VLS_164, new __VLS_164({
    span: (12),
}));
const __VLS_166 = __VLS_165({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_165));
__VLS_167.slots.default;
const __VLS_168 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_169 = __VLS_asFunctionalComponent(__VLS_168, new __VLS_168({
    field: "datasourceName",
    label: "数据源名称",
    required: true,
}));
const __VLS_170 = __VLS_169({
    field: "datasourceName",
    label: "数据源名称",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_169));
__VLS_171.slots.default;
const __VLS_172 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
const __VLS_173 = __VLS_asFunctionalComponent(__VLS_172, new __VLS_172({
    modelValue: (__VLS_ctx.datasourceForm.datasourceName),
    placeholder: "请输入数据源名称",
    allowClear: true,
}));
const __VLS_174 = __VLS_173({
    modelValue: (__VLS_ctx.datasourceForm.datasourceName),
    placeholder: "请输入数据源名称",
    allowClear: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_173));
var __VLS_171;
var __VLS_167;
const __VLS_176 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_177 = __VLS_asFunctionalComponent(__VLS_176, new __VLS_176({
    span: (12),
}));
const __VLS_178 = __VLS_177({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_177));
__VLS_179.slots.default;
const __VLS_180 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_181 = __VLS_asFunctionalComponent(__VLS_180, new __VLS_180({
    field: "owner",
    label: "负责人",
    required: true,
}));
const __VLS_182 = __VLS_181({
    field: "owner",
    label: "负责人",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_181));
__VLS_183.slots.default;
const __VLS_184 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_185 = __VLS_asFunctionalComponent(__VLS_184, new __VLS_184({
    modelValue: (__VLS_ctx.datasourceForm.owner),
    placeholder: "请选择负责人",
    allowSearch: true,
    allowClear: true,
}));
const __VLS_186 = __VLS_185({
    modelValue: (__VLS_ctx.datasourceForm.owner),
    placeholder: "请选择负责人",
    allowSearch: true,
    allowClear: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_185));
__VLS_187.slots.default;
for (const [owner] of __VLS_getVForSourceType((__VLS_ctx.owners))) {
    const __VLS_188 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
    // @ts-ignore
    const __VLS_189 = __VLS_asFunctionalComponent(__VLS_188, new __VLS_188({
        key: (owner.id),
        value: (owner.id),
    }));
    const __VLS_190 = __VLS_189({
        key: (owner.id),
        value: (owner.id),
    }, ...__VLS_functionalComponentArgsRest(__VLS_189));
    __VLS_191.slots.default;
    (owner.name);
    var __VLS_191;
}
var __VLS_187;
var __VLS_183;
var __VLS_179;
var __VLS_163;
const __VLS_192 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_193 = __VLS_asFunctionalComponent(__VLS_192, new __VLS_192({
    gutter: (16),
}));
const __VLS_194 = __VLS_193({
    gutter: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_193));
__VLS_195.slots.default;
const __VLS_196 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_197 = __VLS_asFunctionalComponent(__VLS_196, new __VLS_196({
    span: (16),
}));
const __VLS_198 = __VLS_197({
    span: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_197));
__VLS_199.slots.default;
const __VLS_200 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_201 = __VLS_asFunctionalComponent(__VLS_200, new __VLS_200({
    field: "brokerAddress",
    label: "Broker地址",
    required: true,
}));
const __VLS_202 = __VLS_201({
    field: "brokerAddress",
    label: "Broker地址",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_201));
__VLS_203.slots.default;
const __VLS_204 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
const __VLS_205 = __VLS_asFunctionalComponent(__VLS_204, new __VLS_204({
    modelValue: (__VLS_ctx.datasourceForm.brokerAddress),
    placeholder: "请输入Kafka Broker地址",
    allowClear: true,
}));
const __VLS_206 = __VLS_205({
    modelValue: (__VLS_ctx.datasourceForm.brokerAddress),
    placeholder: "请输入Kafka Broker地址",
    allowClear: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_205));
var __VLS_203;
var __VLS_199;
const __VLS_208 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_209 = __VLS_asFunctionalComponent(__VLS_208, new __VLS_208({
    span: (8),
}));
const __VLS_210 = __VLS_209({
    span: (8),
}, ...__VLS_functionalComponentArgsRest(__VLS_209));
__VLS_211.slots.default;
const __VLS_212 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_213 = __VLS_asFunctionalComponent(__VLS_212, new __VLS_212({
    field: "port",
    label: "端口",
    required: true,
}));
const __VLS_214 = __VLS_213({
    field: "port",
    label: "端口",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_213));
__VLS_215.slots.default;
const __VLS_216 = {}.AInputNumber;
/** @type {[typeof __VLS_components.AInputNumber, typeof __VLS_components.aInputNumber, ]} */ ;
// @ts-ignore
const __VLS_217 = __VLS_asFunctionalComponent(__VLS_216, new __VLS_216({
    modelValue: (__VLS_ctx.datasourceForm.port),
    placeholder: "端口号",
    min: (1),
    max: (65535),
    ...{ style: {} },
}));
const __VLS_218 = __VLS_217({
    modelValue: (__VLS_ctx.datasourceForm.port),
    placeholder: "端口号",
    min: (1),
    max: (65535),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_217));
var __VLS_215;
var __VLS_211;
var __VLS_195;
const __VLS_220 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_221 = __VLS_asFunctionalComponent(__VLS_220, new __VLS_220({
    gutter: (16),
}));
const __VLS_222 = __VLS_221({
    gutter: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_221));
__VLS_223.slots.default;
const __VLS_224 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_225 = __VLS_asFunctionalComponent(__VLS_224, new __VLS_224({
    span: (12),
}));
const __VLS_226 = __VLS_225({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_225));
__VLS_227.slots.default;
const __VLS_228 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_229 = __VLS_asFunctionalComponent(__VLS_228, new __VLS_228({
    field: "authType",
    label: "认证方式",
    required: true,
}));
const __VLS_230 = __VLS_229({
    field: "authType",
    label: "认证方式",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_229));
__VLS_231.slots.default;
const __VLS_232 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_233 = __VLS_asFunctionalComponent(__VLS_232, new __VLS_232({
    modelValue: (__VLS_ctx.datasourceForm.authType),
    placeholder: "请选择认证方式",
}));
const __VLS_234 = __VLS_233({
    modelValue: (__VLS_ctx.datasourceForm.authType),
    placeholder: "请选择认证方式",
}, ...__VLS_functionalComponentArgsRest(__VLS_233));
__VLS_235.slots.default;
const __VLS_236 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_237 = __VLS_asFunctionalComponent(__VLS_236, new __VLS_236({
    value: "NONE",
}));
const __VLS_238 = __VLS_237({
    value: "NONE",
}, ...__VLS_functionalComponentArgsRest(__VLS_237));
__VLS_239.slots.default;
var __VLS_239;
const __VLS_240 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_241 = __VLS_asFunctionalComponent(__VLS_240, new __VLS_240({
    value: "SASL_PLAINTEXT",
}));
const __VLS_242 = __VLS_241({
    value: "SASL_PLAINTEXT",
}, ...__VLS_functionalComponentArgsRest(__VLS_241));
__VLS_243.slots.default;
var __VLS_243;
const __VLS_244 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_245 = __VLS_asFunctionalComponent(__VLS_244, new __VLS_244({
    value: "SASL_SSL",
}));
const __VLS_246 = __VLS_245({
    value: "SASL_SSL",
}, ...__VLS_functionalComponentArgsRest(__VLS_245));
__VLS_247.slots.default;
var __VLS_247;
const __VLS_248 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_249 = __VLS_asFunctionalComponent(__VLS_248, new __VLS_248({
    value: "SSL",
}));
const __VLS_250 = __VLS_249({
    value: "SSL",
}, ...__VLS_functionalComponentArgsRest(__VLS_249));
__VLS_251.slots.default;
var __VLS_251;
var __VLS_235;
var __VLS_231;
var __VLS_227;
const __VLS_252 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_253 = __VLS_asFunctionalComponent(__VLS_252, new __VLS_252({
    span: (12),
}));
const __VLS_254 = __VLS_253({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_253));
__VLS_255.slots.default;
if (__VLS_ctx.datasourceForm.authType.includes('SASL')) {
    const __VLS_256 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_257 = __VLS_asFunctionalComponent(__VLS_256, new __VLS_256({
        field: "saslMechanism",
        label: "SASL机制",
    }));
    const __VLS_258 = __VLS_257({
        field: "saslMechanism",
        label: "SASL机制",
    }, ...__VLS_functionalComponentArgsRest(__VLS_257));
    __VLS_259.slots.default;
    const __VLS_260 = {}.ASelect;
    /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
    // @ts-ignore
    const __VLS_261 = __VLS_asFunctionalComponent(__VLS_260, new __VLS_260({
        modelValue: (__VLS_ctx.datasourceForm.saslMechanism),
        placeholder: "请选择SASL机制",
    }));
    const __VLS_262 = __VLS_261({
        modelValue: (__VLS_ctx.datasourceForm.saslMechanism),
        placeholder: "请选择SASL机制",
    }, ...__VLS_functionalComponentArgsRest(__VLS_261));
    __VLS_263.slots.default;
    const __VLS_264 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
    // @ts-ignore
    const __VLS_265 = __VLS_asFunctionalComponent(__VLS_264, new __VLS_264({
        value: "PLAIN",
    }));
    const __VLS_266 = __VLS_265({
        value: "PLAIN",
    }, ...__VLS_functionalComponentArgsRest(__VLS_265));
    __VLS_267.slots.default;
    var __VLS_267;
    const __VLS_268 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
    // @ts-ignore
    const __VLS_269 = __VLS_asFunctionalComponent(__VLS_268, new __VLS_268({
        value: "SCRAM-SHA-256",
    }));
    const __VLS_270 = __VLS_269({
        value: "SCRAM-SHA-256",
    }, ...__VLS_functionalComponentArgsRest(__VLS_269));
    __VLS_271.slots.default;
    var __VLS_271;
    const __VLS_272 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
    // @ts-ignore
    const __VLS_273 = __VLS_asFunctionalComponent(__VLS_272, new __VLS_272({
        value: "SCRAM-SHA-512",
    }));
    const __VLS_274 = __VLS_273({
        value: "SCRAM-SHA-512",
    }, ...__VLS_functionalComponentArgsRest(__VLS_273));
    __VLS_275.slots.default;
    var __VLS_275;
    var __VLS_263;
    var __VLS_259;
}
var __VLS_255;
var __VLS_223;
if (__VLS_ctx.datasourceForm.authType !== 'NONE') {
    const __VLS_276 = {}.ARow;
    /** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
    // @ts-ignore
    const __VLS_277 = __VLS_asFunctionalComponent(__VLS_276, new __VLS_276({
        gutter: (16),
    }));
    const __VLS_278 = __VLS_277({
        gutter: (16),
    }, ...__VLS_functionalComponentArgsRest(__VLS_277));
    __VLS_279.slots.default;
    const __VLS_280 = {}.ACol;
    /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
    // @ts-ignore
    const __VLS_281 = __VLS_asFunctionalComponent(__VLS_280, new __VLS_280({
        span: (12),
    }));
    const __VLS_282 = __VLS_281({
        span: (12),
    }, ...__VLS_functionalComponentArgsRest(__VLS_281));
    __VLS_283.slots.default;
    const __VLS_284 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_285 = __VLS_asFunctionalComponent(__VLS_284, new __VLS_284({
        field: "username",
        label: "用户名",
    }));
    const __VLS_286 = __VLS_285({
        field: "username",
        label: "用户名",
    }, ...__VLS_functionalComponentArgsRest(__VLS_285));
    __VLS_287.slots.default;
    const __VLS_288 = {}.AInput;
    /** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
    // @ts-ignore
    const __VLS_289 = __VLS_asFunctionalComponent(__VLS_288, new __VLS_288({
        modelValue: (__VLS_ctx.datasourceForm.username),
        placeholder: "请输入用户名",
        allowClear: true,
    }));
    const __VLS_290 = __VLS_289({
        modelValue: (__VLS_ctx.datasourceForm.username),
        placeholder: "请输入用户名",
        allowClear: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_289));
    var __VLS_287;
    var __VLS_283;
    const __VLS_292 = {}.ACol;
    /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
    // @ts-ignore
    const __VLS_293 = __VLS_asFunctionalComponent(__VLS_292, new __VLS_292({
        span: (12),
    }));
    const __VLS_294 = __VLS_293({
        span: (12),
    }, ...__VLS_functionalComponentArgsRest(__VLS_293));
    __VLS_295.slots.default;
    const __VLS_296 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_297 = __VLS_asFunctionalComponent(__VLS_296, new __VLS_296({
        field: "password",
        label: "密码",
    }));
    const __VLS_298 = __VLS_297({
        field: "password",
        label: "密码",
    }, ...__VLS_functionalComponentArgsRest(__VLS_297));
    __VLS_299.slots.default;
    const __VLS_300 = {}.AInputPassword;
    /** @type {[typeof __VLS_components.AInputPassword, typeof __VLS_components.aInputPassword, ]} */ ;
    // @ts-ignore
    const __VLS_301 = __VLS_asFunctionalComponent(__VLS_300, new __VLS_300({
        modelValue: (__VLS_ctx.datasourceForm.password),
        placeholder: "请输入密码",
        allowClear: true,
    }));
    const __VLS_302 = __VLS_301({
        modelValue: (__VLS_ctx.datasourceForm.password),
        placeholder: "请输入密码",
        allowClear: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_301));
    var __VLS_299;
    var __VLS_295;
    var __VLS_279;
}
const __VLS_304 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_305 = __VLS_asFunctionalComponent(__VLS_304, new __VLS_304({
    field: "description",
    label: "描述",
}));
const __VLS_306 = __VLS_305({
    field: "description",
    label: "描述",
}, ...__VLS_functionalComponentArgsRest(__VLS_305));
__VLS_307.slots.default;
const __VLS_308 = {}.ATextarea;
/** @type {[typeof __VLS_components.ATextarea, typeof __VLS_components.aTextarea, ]} */ ;
// @ts-ignore
const __VLS_309 = __VLS_asFunctionalComponent(__VLS_308, new __VLS_308({
    modelValue: (__VLS_ctx.datasourceForm.description),
    placeholder: "请输入数据源描述",
    maxLength: (200),
    showWordLimit: true,
    autoSize: ({ minRows: 3, maxRows: 5 }),
}));
const __VLS_310 = __VLS_309({
    modelValue: (__VLS_ctx.datasourceForm.description),
    placeholder: "请输入数据源描述",
    maxLength: (200),
    showWordLimit: true,
    autoSize: ({ minRows: 3, maxRows: 5 }),
}, ...__VLS_functionalComponentArgsRest(__VLS_309));
var __VLS_307;
var __VLS_157;
var __VLS_148;
const __VLS_312 = {}.AModal;
/** @type {[typeof __VLS_components.AModal, typeof __VLS_components.aModal, typeof __VLS_components.AModal, typeof __VLS_components.aModal, ]} */ ;
// @ts-ignore
const __VLS_313 = __VLS_asFunctionalComponent(__VLS_312, new __VLS_312({
    visible: (__VLS_ctx.showTestResult),
    title: "连接测试结果",
    width: "500px",
    footer: (false),
}));
const __VLS_314 = __VLS_313({
    visible: (__VLS_ctx.showTestResult),
    title: "连接测试结果",
    width: "500px",
    footer: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_313));
__VLS_315.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "test-result" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "result-icon" },
});
if (__VLS_ctx.testSuccess) {
    const __VLS_316 = {}.IconCheckCircle;
    /** @type {[typeof __VLS_components.IconCheckCircle, typeof __VLS_components.iconCheckCircle, ]} */ ;
    // @ts-ignore
    const __VLS_317 = __VLS_asFunctionalComponent(__VLS_316, new __VLS_316({
        ...{ style: {} },
    }));
    const __VLS_318 = __VLS_317({
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_317));
}
else {
    const __VLS_320 = {}.IconCloseCircle;
    /** @type {[typeof __VLS_components.IconCloseCircle, typeof __VLS_components.iconCloseCircle, ]} */ ;
    // @ts-ignore
    const __VLS_321 = __VLS_asFunctionalComponent(__VLS_320, new __VLS_320({
        ...{ style: {} },
    }));
    const __VLS_322 = __VLS_321({
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_321));
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "result-text" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
(__VLS_ctx.testSuccess ? '连接成功' : '连接失败');
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
(__VLS_ctx.testMessage);
var __VLS_315;
/** @type {__VLS_StyleScopedClasses['kafka-datasource']} */ ;
/** @type {__VLS_StyleScopedClasses['datasource-list']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['header-content']} */ ;
/** @type {__VLS_StyleScopedClasses['title-area']} */ ;
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
/** @type {__VLS_StyleScopedClasses['page-description']} */ ;
/** @type {__VLS_StyleScopedClasses['header-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['content-card']} */ ;
/** @type {__VLS_StyleScopedClasses['table-section']} */ ;
/** @type {__VLS_StyleScopedClasses['datasource-table']} */ ;
/** @type {__VLS_StyleScopedClasses['danger-option']} */ ;
/** @type {__VLS_StyleScopedClasses['test-result']} */ ;
/** @type {__VLS_StyleScopedClasses['result-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['result-text']} */ ;
// @ts-ignore
var __VLS_159 = __VLS_158;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            IconSearch: IconSearch,
            IconPlus: IconPlus,
            IconEdit: IconEdit,
            IconDelete: IconDelete,
            IconMore: IconMore,
            IconLink: IconLink,
            IconCheckCircle: IconCheckCircle,
            IconCloseCircle: IconCloseCircle,
            loading: loading,
            saving: saving,
            showCreateForm: showCreateForm,
            showTestResult: showTestResult,
            isEdit: isEdit,
            testSuccess: testSuccess,
            testMessage: testMessage,
            searchForm: searchForm,
            datasourceForm: datasourceForm,
            datasourceRules: datasourceRules,
            owners: owners,
            pagination: pagination,
            tableData: tableData,
            datasourceFormRef: datasourceFormRef,
            getStatusColor: getStatusColor,
            handleSearch: handleSearch,
            onPageChange: onPageChange,
            onPageSizeChange: onPageSizeChange,
            showCreateDatasource: showCreateDatasource,
            editDatasource: editDatasource,
            viewDatasourceDetail: viewDatasourceDetail,
            cancelCreate: cancelCreate,
            saveDatasource: saveDatasource,
            testConnection: testConnection,
            deleteDatasource: deleteDatasource,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
