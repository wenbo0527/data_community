<template>
  <a-tag
    :color="config.color"
    :style="{
      backgroundColor: config.bgColor,
      borderColor: config.borderColor,
      borderWidth: '1px',
      borderStyle: 'solid'
    }"
  >
    {{ config.text }}
  </a-tag>
</template>

<script>
import { getSensitivityLabelConfig } from '../utils';

export default {
  name: 'SensitivityLabel',
  props: {
    level: {
      type: String,
      required: true,
      validator: value => ['normal', 'sensitive', 'core'].includes(value)
    }
  },
  computed: {
    config() {
      return getSensitivityLabelConfig(this.level);
    }
  }
};
</script>

<style scoped>
.ant-tag {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
}
</style>