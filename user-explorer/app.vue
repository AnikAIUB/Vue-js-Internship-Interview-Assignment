<!-- app.vue -->
<!--
  TEACHING NOTE: app.vue is the ROOT of your entire Vue/Nuxt application.
  Every page and layout wraps inside this file.
  <NuxtLayout> renders the current page's layout (found in /layouts/).
  <NuxtPage> renders the current page (found in /pages/).
-->
<template>
  <div>
    <!-- NuxtLayout applies a layout wrapper (default.vue or auth.vue) -->
    <NuxtLayout>
      <!-- NuxtPage renders whatever page matches the current URL -->
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
