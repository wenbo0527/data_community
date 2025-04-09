<template>
  <div class="success-step">
    <!-- Success step content -->
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
import type { FormData } from '../../types/accompany'

const props = defineProps<{
  formData: FormData
}>()
</script>
