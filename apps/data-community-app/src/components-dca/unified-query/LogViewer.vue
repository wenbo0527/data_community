<template>
  <div class="uq-log">
    <div v-if="!logs.length" class="uq-log__empty">
      <icon-empty />
      <span>暂无执行日志,运行 SQL 后在此查看</span>
    </div>
    <pre v-else class="uq-log__body">
      <div v-for="(l, i) in logs" :key="i" class="uq-log__line">
        <span class="uq-log__level" :class="`is-${l.level}`">[{{ l.level.toUpperCase() }}]</span>
        <span class="uq-log__time">{{ l.time }}</span>
        <span class="uq-log__sep">-</span>
        <span class="uq-log__msg">{{ l.message }}</span>
      </div>
    </pre>
  </div>
</template>

<script setup lang="ts">
/**
 * 执行日志展示(F09)
 *
 * 成功 INFO 绿色 / 警告 WARN 橙色 / 失败 ERROR 红色,
 * 与 StatusTag 的状态语义保持一致。
 */
import type { LogEntry } from '@/mock/unified-query/types'

defineProps<{ logs: LogEntry[] }>()
</script>

<style lang="scss" scoped>
.uq-log {
  height: 100%;
  min-height: 140px;
  background: #1d2129;
  border-radius: 4px;
  overflow: auto;

  &__empty {
    display: flex;
    align-items: center;
    gap: 8px;
    height: 140px;
    justify-content: center;
    color: #86909c;
    font-size: 13px;
  }

  &__body {
    margin: 0;
    padding: 10px 14px;
    font-family: 'SFMono-Regular', Consolas, 'Courier New', monospace;
    font-size: 12px;
    line-height: 20px;
    white-space: pre-wrap;
    word-break: break-all;
  }

  &__line {
    display: flex;
    gap: 8px;
  }

  &__level {
    flex: none;
    width: 56px;
    font-weight: 600;

    &.is-info { color: #00d68f; }
    &.is-warn { color: #ffcf3d; }
    &.is-error { color: #ff7875; }
  }

  &__time { color: #86909c; flex: none; }
  &__sep { color: #4e5969; }
  &__msg { color: #e5e6eb; }
}
</style>
