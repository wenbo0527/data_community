<template>
  <a-form :model="modelValue" layout="vertical" class="basic-info-form">
    <a-row :gutter="24">
      <a-col :span="6">
        <a-form-item label="计划名称" field="name" :rules="[{ required: true, message: '请输入计划名称' }]">
          <a-input v-model="modelValue.name" placeholder="请输入计划名称" show-word-limit :max-length="100" allow-clear
            class="custom-input" />
        </a-form-item>
      </a-col>
      <a-col :span="6">
        <a-form-item label="缓存时间" field="cacheTime" :rules="[{ required: true, message: '请选择缓存时间' }]">
          <a-select v-model="modelValue.cacheTime" placeholder="请选择缓存时间" class="custom-select">
            <a-option value="0">不使用缓存</a-option>
            <template v-for="i in 30" :key="i">
              <a-option :value="i">{{ i }}天</a-option>
            </template>
          </a-select>
        </a-form-item>
      </a-col>
      <a-col :span="6">
        <a-form-item label="陪跑天数" field="days"
          :rules="[{ required: true, message: '请输入陪跑天数' }, { type: 'number', min: 1, max: 365, message: '天数范围为1-365天' }]">
          <a-input-number v-model="modelValue.days" placeholder="请输入陪跑天数" :min="1" :max="365"
            class="custom-input-number" />
        </a-form-item>
      </a-col>
      <a-col :span="6">
        <a-form-item label="陪跑期数" field="periods" :rules="[{ required: true, message: '请选择陪跑期数' }]">
          <a-select v-model="modelValue.periods" placeholder="请选择陪跑期数" @change="handlePeriodsChange"
            class="custom-select">
            <template v-for="i in 10" :key="i">
              <a-option :value="i">{{ i }}期</a-option>
            </template>
          </a-select>
        </a-form-item>
      </a-col>
    </a-row>

    <a-row :gutter="24">
      <a-col :span="24">
        <a-form-item label="备注" field="description">
          <a-textarea v-model="modelValue.description" placeholder="请输入备注" :max-length="1000" show-word-limit
            allow-clear class="custom-textarea" />
        </a-form-item>
      </a-col>
    </a-row>

    <a-divider class="custom-divider">期数配置</a-divider>

    <a-row :gutter="[24, 16]">
      <template v-for="i in modelValue.periods" :key="i">
        <a-col :span="6">
          <a-form-item :label="`第${i}期天数`" :field="`periodDays.${i - 1}`"
            :rules="[{ required: true, message: '请输入天数' }, { type: 'number', min: 1, max: 365, message: '天数范围为1-365天' }]">
            <a-input-number v-model="modelValue.periodDays[i - 1]" placeholder="请输入天数" :min="1" :max="365"
              class="custom-input-number" />
          </a-form-item>
        </a-col>
      </template>
    </a-row>

    <div class="form-footer">
      <a-button type="primary" size="large" @click="handleNext">下一步</a-button>
    </div>
  </a-form>
</template>

<script setup lang="ts">
import { defineProps, withDefaults, defineEmits } from 'vue'
import type { BasicInfo } from '@/types/accompany'

interface Props {
  modelValue: BasicInfo
  step: number
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => ({
    name: '',
    cacheTime: '30',
    days: 0,
    periods: 0,
    description: '',
    periodDays: [30]
  }),
  step: 0
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: BasicInfo): void
  (e: 'next'): void
}>()

const handlePeriodsChange = (value: number) => {
  // 初始化期数天数数组
  props.modelValue.periodDays = new Array(value).fill(0)
  emit('update:modelValue', props.modelValue)
}

const handleNext = () => {
  emit('next')
}
</script>

<style scoped>
.basic-info-form {
  padding: 24px;
}

.custom-input,
.custom-select,
.custom-input-number,
.custom-textarea {
  width: 100%;
  border-radius: 4px;
}

.custom-divider {
  margin: 32px 0;
  font-size: 16px;
  font-weight: 500;
}

.form-footer {
  margin-top: 40px;
  text-align: center;
}

.form-footer :deep(.arco-btn) {
  min-width: 120px;
  height: 40px;
  font-size: 16px;
}
</style>
