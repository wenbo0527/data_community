<template>
  <div class="success-step">
    <!-- Success step content -->
  </div>
</template>

<script setup lang="ts">
// No imports needed for this component
import type { FormData } from '../../types/accompany'

const props = defineProps<{
  formData: FormData
}>()
</script>
