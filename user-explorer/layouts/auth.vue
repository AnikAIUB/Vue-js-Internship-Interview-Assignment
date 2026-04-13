<!-- layouts/auth.vue -->
<!--
  TEACHING NOTE: This is a separate layout just for auth pages (login, signup).
  Auth pages don't need a navbar - they have a centered card design instead.
  Pages use this by adding: definePageMeta({ layout: 'auth' })
-->
<template>
  <div class="min-h-screen flex items-center justify-center relative overflow-hidden">
    <!-- Background decorative elements - pure CSS art -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <!-- Glowing orbs in the background -->
      <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl"></div>
      <div class="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl"></div>
      <!-- Grid pattern overlay -->
      <div class="absolute inset-0 opacity-[0.03]"
           style="background-image: linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px); background-size: 40px 40px;">
      </div>
    </div>

    <!-- Auth card content -->
    <div class="relative z-10 w-full max-w-md px-4">
      <!-- Logo at top of auth pages -->
      <div class="text-center mb-8">
        <NuxtLink to="/" class="inline-flex items-center gap-2 group">
          <div class="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center group-hover:bg-brand-500 transition-colors">
            <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <span class="font-display text-xl font-bold text-gradient">UserExplorer</span>
        </NuxtLink>
      </div>

      <!-- Page content (the login or signup form) goes here -->
      <slot />
    </div>
  </div>
</template>
