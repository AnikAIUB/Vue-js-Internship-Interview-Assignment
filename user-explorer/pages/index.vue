<!-- pages/index.vue -->
<!--
  TEACHING NOTE: index.vue maps to the root URL "/".
  This is our landing/home page.
  It has no middleware - anyone can see it.
-->
<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
    <!-- Hero section -->
    <div class="text-center max-w-3xl mx-auto animate-fadeIn">
      <!-- Eyebrow label -->
      <div class="inline-flex items-center gap-2 px-3 py-1 bg-brand-950/50 border border-brand-800/50
                  rounded-full text-brand-400 text-xs font-medium mb-6">
        <span class="w-1.5 h-1.5 bg-brand-400 rounded-full animate-pulse"></span>
        Frontend Intern Assignment · Nuxt 3
      </div>

      <!-- Main heading -->
      <h1 class="font-display text-5xl sm:text-6xl font-bold text-surface-50 mb-6 leading-tight">
        Explore & Manage
        <span class="text-gradient block">Users at Scale</span>
      </h1>

      <p class="text-surface-400 text-lg mb-10 leading-relaxed">
        A production-grade data exploration module built with Nuxt 3, featuring real-time search,
        infinite scroll, offline support, and full state management.
      </p>

      <!-- CTA buttons -->
      <div class="flex flex-wrap items-center justify-center gap-4">
        <NuxtLink v-if="authStore.isLoggedIn" to="/users" class="btn-primary px-6 py-3 text-base">
          Open User Explorer →
        </NuxtLink>
        <template v-else>
          <NuxtLink to="/signup" class="btn-primary px-6 py-3 text-base">
            Get Started Free
          </NuxtLink>
          <NuxtLink to="/login" class="btn-ghost px-6 py-3 text-base">
            Sign In
          </NuxtLink>
        </template>
      </div>
    </div>

    <!-- Feature grid -->
    <div class="mt-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="feature in features" :key="feature.title"
           class="card hover:border-surface-700 transition-all duration-200 group animate-fadeIn">
        <div class="w-10 h-10 rounded-lg bg-brand-950/50 border border-brand-900/30
                    flex items-center justify-center mb-4 group-hover:bg-brand-950 transition-colors">
          <span class="text-xl">{{ feature.icon }}</span>
        </div>
        <h3 class="font-display font-semibold text-surface-200 mb-2">{{ feature.title }}</h3>
        <p class="text-sm text-surface-500 leading-relaxed">{{ feature.desc }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const authStore = useAuthStore()

// Initialize auth state on mount (check localStorage)
onMounted(() => authStore.initAuth())

const features = [
  { icon: '🔐', title: 'Auth System', desc: 'Full sign up/sign in with route protection middleware and persistent sessions.' },
  { icon: '🔍', title: 'Smart Search', desc: 'Debounced search with race condition handling - only shows the latest result.' },
  { icon: '♾️', title: 'Infinite Scroll', desc: 'Loads more users as you scroll. Intersection Observer API, no duplicate requests.' },
  { icon: '🔗', title: 'URL State Sync', desc: 'All filters, search & sort sync to URL. Refresh or share the URL and state persists.' },
  { icon: '📦', title: 'Bulk Actions', desc: 'Select all, delete, or export selected users as CSV. Even handles unloaded items.' },
  { icon: '↩️', title: 'Undo / Redo', desc: 'Full history of filter/search changes with undo & redo (up to 50 states).' },
  { icon: '📡', title: 'Offline Support', desc: 'Caches last successful data. Works offline with an indicator banner.' },
  { icon: '🔄', title: 'Multi-Tab Sync', desc: 'Change filters in one tab and other tabs update automatically via BroadcastChannel.' },
  { icon: '🎨', title: 'Column Reorder', desc: 'Drag and drop columns to reorder them. Order is saved to localStorage.' },
]
</script>
