<!-- layouts/default.vue -->
<!--
  TEACHING NOTE: Layouts are wrappers around pages.
  The "default" layout is automatically used by all pages unless they specify otherwise.
  Think of it as the "shell" of your app - navbar, footer, sidebar, etc.
  <slot /> is where the page content gets inserted.
-->
<template>
  <div class="min-h-screen flex flex-col">
    <!-- Top Navigation Bar -->
    <AppNavbar />

    <!-- Main page content - slot is where pages render -->
    <main class="flex-1">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
// No special logic needed here - the navbar handles auth state
</script>
