<template>
  <div class="accompany-service">
    <a-card title="伴随服务" hoverable>
      <a-list :bordered="false">
        <a-list-item v-for="item in services" :key="item.key">
          <div class="item">
            <div class="meta">
              <div class="title">{{ item.title }}</div>
              <div class="desc">{{ item.desc }}</div>
            </div>
            <a-tag :color="item.color">{{ item.status }}</a-tag>
          </div>
        </a-list-item>
      </a-list>
    </a-card>
  </div>
  </template>

<script setup>
const services = [
  { key: 'consult', title: '业务咨询', desc: '专家提供业务实施建议', status: '可用', color: 'green' },
  { key: 'train', title: '培训服务', desc: '面向使用方的能力培训', status: '排期中', color: 'blue' },
  { key: 'support', title: '技术支持', desc: '现场/远程技术支持', status: '可用', color: 'green' }
]
</script>

<style scoped>
.item { display: flex; align-items: center; justify-content: space-between; width: 100%; }
.title { font-weight: 600; }
.desc { color: var(--color-text-3); }
</style>