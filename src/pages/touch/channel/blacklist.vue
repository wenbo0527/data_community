<template>
  <a-layout>
  <a-layout-content class="content">
    <a-card :bordered="false">
      <a-row :gutter="16" align="middle" style="margin-bottom: 16px">
        <a-col flex="auto">
          <a-form :model="formState" layout="inline" class="search-form">
            <a-row :gutter="16">
              <a-col :span="24">
                <a-space size="large">
                  <a-form-item label="姓名">
                    <a-input v-model="formState.username" placeholder="请输入姓名" style="width: 180px" />
                  </a-form-item>
                  <a-form-item label="手机号">
                    <a-input v-model="formState.phone" placeholder="请输入手机号" style="width: 180px" />
                  </a-form-item>
                  <a-form-item label="身份证号">
                    <a-input v-model="formState.idCard" placeholder="请输入身份证号" style="width: 220px" />
                  </a-form-item>
                </a-space>
              </a-col>
            </a-row>
            <a-row :gutter="16" style="margin-top: 8px">
              <a-col :span="24">
                <a-space size="large">
                  <a-form-item label="添加时间">
                    <a-range-picker v-model="formState.addTimeRange" style="width: 220px" :placeholder="['开始日期', '结束日期']" />
                  </a-form-item>
                  <a-form-item label="禁用时间">
                    <a-range-picker v-model="formState.banTimeRange" style="width: 220px" :placeholder="['开始日期', '结束日期']" />
                  </a-form-item>
                </a-space>
              </a-col>
            </a-row>
          </a-form>
        </a-col>
        <a-col>
          <a-space>
            <a-button type="primary" @click="handleSearch">查询</a-button>
            <a-button @click="handleReset">重置</a-button>
            <a-button v-show="activeTab === 'blacklist'" type="primary" @click="handleCreate">
              <template #icon><icon-plus /></template>
              新建
            </a-button>
            <a-button v-show="activeTab === 'blacklist'" type="outline" @click="handleImport">
              <template #icon><icon-upload /></template>
              批量导入
            </a-button>
          </a-space>
        </a-col>
      </a-row>
      
      <a-tabs type="card" class="blacklist-tabs" v-model:activeKey="activeTab">
        <a-tab-pane key="blacklist" title="黑名单库">
          <a-table
            :columns="blacklistColumns"
            :data="blacklistData"
            :pagination="{ pageSize: 10 }"
            :scroll="{ x: '100%', y: '400px' }"
            :bordered="{ wrapper: true, cell: true }"
            row-key="idCard"
            class="blacklist-table"
            @scroll.passive="handleTableScroll"
          >
            <template #operations="{ record }">
              <a-space>
                <a-tooltip content="解禁用户" mini>
                  <a-button type="outline" status="warning" size="small" @click="handleUnban(record)">
                    <template #icon><icon-undo /></template>
                  </a-button>
                </a-tooltip>
              </a-space>
            </template>
          </a-table>
        </a-tab-pane>
        <a-tab-pane key="unbanned" title="解禁名单库">
          <a-table
            :columns="unbannedColumns"
            :data="unbannedData"
            :scroll="{ x: '100%', y: '400px' }"
            :bordered="{ wrapper: true, cell: true }"
            :pagination="{ pageSize: 10 }"
            @scroll.passive="handleTableScroll"
          >
          </a-table>
        </a-tab-pane>
      </a-tabs>
    </a-card>
  </a-layout-content>
</a-layout>
</template>

<script>
import { IconUndo, IconPlus, IconUpload } from '@arco-design/web-vue/es/icon';
import mockData from '@/mock/touch';

export default {
  name: 'BlacklistManagement',
  components: {
    IconUndo,
    IconPlus,
    IconUpload
  },
  data() {
    const blacklistData = mockData.blacklist;
    const unbannedData = mockData.unbanned;
    const blacklistColumns = [
      { title: '用户名', dataIndex: 'username', width: 150, ellipsis: true, tooltip: true },
      { title: '手机号', dataIndex: 'phone', width: 160, ellipsis: true, tooltip: true, render: ({ record }) => this.maskPhone(record.phone) },
      { title: '身份证', dataIndex: 'idCard', width: 200, ellipsis: true, tooltip: true, render: ({ record }) => this.maskIdCard(record.idCard) },
      { title: '添加时间', dataIndex: 'addTime', width: 180, ellipsis: true, tooltip: true },
      { title: '禁用时间', dataIndex: 'banTime', width: 180, ellipsis: true, tooltip: true, render: ({ record }) => record.banTime || '永久禁用' },
      { title: '禁用策略', dataIndex: 'policy', width: 150, ellipsis: true, tooltip: true },
      { title: '来源', dataIndex: 'source', width: 150, ellipsis: true, tooltip: true },
      { title: '操作', dataIndex: 'operations', width: 120, fixed: 'right', slotName: 'operations' }
    ];
    const unbannedColumns = [
      { title: '用户名', dataIndex: 'username', width: 150, ellipsis: true, tooltip: true },
      { title: '手机号', dataIndex: 'phone', width: 160, ellipsis: true, tooltip: true, render: ({ record }) => this.maskPhone(record.phone) },
      { title: '身份证', dataIndex: 'idCard', width: 200, ellipsis: true, tooltip: true, render: ({ record }) => this.maskIdCard(record.idCard) },
      { title: '添加时间', dataIndex: 'addTime', width: 180, ellipsis: true, tooltip: true },
      { title: '禁用时间', dataIndex: 'banTime', width: 180, ellipsis: true, tooltip: true },
      { title: '解禁时间', dataIndex: 'unbanTime', width: 180, ellipsis: true, tooltip: true },
      { title: '禁用策略', dataIndex: 'policy', width: 150, ellipsis: true, tooltip: true },
      { title: '来源', dataIndex: 'source', width: 150, ellipsis: true, tooltip: true }
    ];
    console.log('初始化数据状态:', { blacklistData, unbannedData });
    return {
      formState: {
        username: '',
        phone: '',
        idCard: '',
        addTimeRange: [],
        banTimeRange: []
      },
      activeTab: 'blacklist',
      blacklistData,
      unbannedData,
      blacklistColumns,
      unbannedColumns
    }
  },
  mounted() {
    console.log('mounted时blacklistData:', this.blacklistData);
    console.log('mounted时unbannedData:', this.unbannedData);
  },
  watch: {
    blacklistData: {
      handler(val) {
        console.log('blacklistData变更:', val);
      },
      deep: true
    },
    unbannedData: {
      handler(val) {
        console.log('unbannedData变更:', val);
      },
      deep: true
    }
  },
  methods: {
    maskPhone(phone) {
      if (!phone) return '';
      return phone.slice(0, 3) + '****' + phone.slice(-4);
    },
    maskIdCard(idCard) {
      if (!idCard) return '';
      return idCard.slice(0, 6) + '********' + idCard.slice(-4);
    },
    handleTableScroll() {
      console.log('表格滚动事件触发');
    },
    handleSearch() {
      console.log('搜索条件:', this.formState);
      console.log('原始黑名单数据:', mockData.blacklist);
      this.blacklistData = mockData.blacklist.filter(item => {
        const matchesUsername = !this.formState.username || item.username.includes(this.formState.username);
        const matchesPhone = !this.formState.phone || item.phone.includes(this.formState.phone);
        const matchesIdCard = !this.formState.idCard || item.idCard.includes(this.formState.idCard);
        const matchesAddTime = !this.formState.addTimeRange.length || 
          (new Date(item.addTime) >= new Date(this.formState.addTimeRange[0]) && 
           new Date(item.addTime) <= new Date(this.formState.addTimeRange[1]));
        const matchesBanTime = !this.formState.banTimeRange.length || 
          (new Date(item.banTime) >= new Date(this.formState.banTimeRange[0]) && 
           new Date(item.banTime) <= new Date(this.formState.banTimeRange[1]));
        const result = matchesUsername && matchesPhone && matchesIdCard && matchesAddTime && matchesBanTime;
        console.log('筛选结果:', { item, result });
        return result;
      });
      console.log('筛选后的黑名单数据:', this.blacklistData);
    },
    handleReset() {
      console.log('重置表单');
      this.formState = {
        username: '',
        phone: '',
        idCard: '',
        addTimeRange: [],
        banTimeRange: []
      };
      this.handleSearch();
    },
    handleCreate() {
      // 实现新建逻辑
    },
    handleImport() {
      // 实现批量导入逻辑
    },
    handleUnban(row) {
      console.log('解禁用户:', row);
      this.unbannedData.push({
        ...row,
        unbanTime: new Date().toLocaleString()
      })
      this.blacklistData = this.blacklistData.filter(item => item !== row)
    }
  }
}
</script>

<style scoped>
.content {
  padding: 16px;
  height: calc(100vh - 60px);
}
.blacklist-table {
  height: 100%;
}
.blacklist-tabs {
  margin-top: 16px;
}
</style>