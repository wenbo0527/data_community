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
import { getStatusLabelConfig } from '../utils';

export default {
  name: 'StatusLabel',
  props: {
    status: {
      type: String,
      required: true,
      validator: value => ['pending', 'approved', 'rejected', 'processing', 'expired'].includes(value)
    }
  },
  computed: {
    config() {
      return getStatusLabelConfig(this.status);
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