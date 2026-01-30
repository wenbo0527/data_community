import { ref, onMounted, watchEffect } from 'vue';
import { useRoute } from 'vue-router';
import TableDetail from '@/pages/management/data-map/components/TableDetail.vue';
// 状态定义
const loading = ref(false);
const treeLoading = ref(false);
const tableLoading = ref(false);
const detailVisible = ref(false);
const currentTable = ref(null);
const treeData = ref([]);
const tableData = ref([]);
const searchForm = ref({
    name: '',
    type: ''
});
const pagination = ref({
    total: 0,
    current: 1,
    pageSize: 10
});
// 方法定义
const handleTreeSelect = (selectedKeys) => {
    // 处理树节点选择
    console.log('Selected:', selectedKeys);
};
const handleSearch = () => {
    // 处理搜索
    console.log('Search form:', searchForm.value);
};
const onPageChange = (page) => {
    pagination.value.current = page;
    // 加载新页数据
};
const showDetail = (record) => {
    // 显示表详情
    currentTable.value = record; // 保持原有赋值逻辑
    detailVisible.value = true;
};
const addToFavorite = (record) => {
    // 添加到收藏
    console.log('Add to favorite:', record);
};
const getTypeColor = (type) => {
    const colorMap = {
        dim: 'blue',
        fact: 'green',
        dwd: 'orange',
        dws: 'purple'
    };
    return colorMap[type] || 'gray';
};
// 监听路由参数变化
const route = useRoute();
const fetchTables = async () => {
    // 实现获取表数据的逻辑
};
watchEffect(() => {
    const tableName = route.query.tableName;
    if (tableName) {
        // 根据表名查找并显示详情
        const table = tableData.value.find(t => t.name === tableName);
        if (table) {
            showDetail(table);
        }
        else {
            // 如果表不在当前页，需要重新搜索
            searchForm.value.name = tableName;
            fetchTables();
        }
    }
});
onMounted(() => {
    fetchTables();
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
/** @type {[typeof TableDetail, ]} */ 
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(TableDetail, new TableDetail({}));
const __VLS_1 = __VLS_0({}, ...__VLS_functionalComponentArgsRest(__VLS_0));
const __VLS_3 = {};
let __VLS_2;
let __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            TableDetail: TableDetail,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
 /* PartiallyEnd: #4569/main.vue */
