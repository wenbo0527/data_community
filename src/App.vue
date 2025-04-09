<script setup>
import MainLayout from './components/layout/MainLayout.vue'
</script>

<template>
  <main-layout v-if="$route.path !== '/login' && $route.path !== '/' && $route.path !== '/home'">
    <router-view />
  </main-layout>
  <router-view v-else />
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
