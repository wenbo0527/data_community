<template>
  <a-card class="section-card">
    <template #title>
      <div class="section-title">
        <span class="title-text">锁定参数</span>
        <a-tooltip position="right">
          <span class="title-help">?</span>
          <template #content>设置优惠券的锁定期限和限制条件，防止用户提前结清规避优惠政策</template>
        </a-tooltip>
      </div>
    </template>

    <a-form-item field="hasLockPeriod" label="是否设定锁定期限">
      <a-radio-group v-model="formData.hasLockPeriod">
        <a-radio :value="true">是</a-radio>
        <a-radio :value="false">否</a-radio>
      </a-radio-group>
    </a-form-item>

    <template v-if="formData.hasLockPeriod">
      <a-grid :cols="2" :col-gap="16" :row-gap="16">
        <a-grid-item>
          <a-form-item field="lockPeriodType" label="锁定期限类型">
            <a-radio-group v-model="formData.lockPeriodType">
              <a-radio value="period">期</a-radio>
              <a-radio value="day">天</a-radio>
            </a-radio-group>
          </a-form-item>
        </a-grid-item>

        <a-grid-item>
          <a-form-item field="lockPeriodValue" label="锁定期限值">
            <a-input-number
              v-model="formData.lockPeriodValue"
              :min="1"
              :precision="0"
              placeholder="请输入锁定期限"
              style="width: 200px"
            />
            <span style="margin-left: 8px">{{ formData.lockPeriodType === 'period' ? '期' : '天' }}</span>
          </a-form-item>
        </a-grid-item>

        <a-grid-item span="2">
          <a-form-item field="lockLimitType" label="限定方式">
            <a-radio-group v-model="formData.lockLimitType">
              <a-radio value="repayment">限制还款</a-radio>
              <a-radio value="charge">补收免息息费</a-radio>
            </a-radio-group>
          </a-form-item>
        </a-grid-item>
      </a-grid>
    </template>
  </a-card>
</template>

<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  formData: {
    type: Object,
    required: true
  }
})
</script>