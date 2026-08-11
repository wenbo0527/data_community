<template>
  <a-drawer
    :visible="visible"
    :title="title || '权限详情'"
    :width="640"
    @update:visible="$emit('update:visible', $event)"
    @cancel="$emit('update:visible', false)"
  >
    <template v-if="permission">
      <a-descriptions :column="1" bordered>
        <a-descriptions-item label="权限 ID">
          <code>{{ permission.id }}</code>
        </a-descriptions-item>
        <a-descriptions-item label="资源">
          {{ permission.resourceName }}
        </a-descriptions-item>
        <a-descriptions-item label="资源类型">
          <a-tag>{{ permission.resourceType }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="权限类型">
          <a-tag :color="permission.permissionType === 'write' ? 'orange' : 'blue'">
            {{ permission.permissionType === 'write' ? '读写' : '只读' }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="申请人">
          {{ permission.applicant }} ({{ permission.department }})
        </a-descriptions-item>
        <a-descriptions-item label="申请理由">
          {{ permission.reason }}
        </a-descriptions-item>
        <a-descriptions-item label="用途">
          <a-tag>{{ getUsageText(permission.usage) }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="有效期">
          {{ permission.validFrom }} ~ {{ permission.validTo }}
        </a-descriptions-item>
        <a-descriptions-item label="审批人">
          {{ permission.approver }}
        </a-descriptions-item>
        <a-descriptions-item label="审批意见">
          {{ permission.approverComment }}
        </a-descriptions-item>
        <a-descriptions-item label="创建时间">
          {{ permission.createTime }}
        </a-descriptions-item>
      </a-descriptions>
    </template>

    <template v-else>
      <a-empty description="暂无权限数据" />
    </template>
  </a-drawer>
</template>

<script setup>
/**
 * 权限详情抽屉 - 占位实现
 *
 * 用于 PermissionManagement.vue 显示权限详情
 * @see 文档 §5 申请管理
 */
const props = defineProps({
  visible: { type: Boolean, default: false },
  permission: { type: Object, default: null },
  title: { type: String, default: '' }
})

defineEmits(['update:visible'])

function getUsageText(usage) {
  const map = {
    data_analysis: '数据分析',
    risk_modeling: '风控建模',
    marketing: '营销',
    report: '报表',
    other: '其他'
  }
  return map[usage] || usage
}
</script>

<style scoped>
code {
  background: var(--color-fill-2);
  padding: 2px 6px;
  border-radius: 3px;
  font-family: monospace;
  color: #165dff;
}
</style>