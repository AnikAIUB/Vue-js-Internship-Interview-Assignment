<!-- components/AppNavbar.vue -->
<!--
  TEACHING NOTE: This is a Single File Component (SFC).
  It has 3 sections:
  - <template>: The HTML structure
  - <script setup>: The logic (using Composition API)
  - <style>: Scoped CSS (optional - we use Tailwind instead)

  "setup" in <script setup> means we're using the Composition API.
  Variables declared here are automatically available in the template.
-->
<template>
  <header class="sticky top-0 z-50 border-b border-surface-800 glass">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">

        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-2.5 group">
          <div class="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center
                      group-hover:bg-brand-500 transition-all duration-200 group-hover:scale-105">
            <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <span class="font-display font-bold text-lg text-gradient hidden sm:block">UserExplorer</span>
        </NuxtLink>

        <!-- Right side: user info + logout -->
        <div class="flex items-center gap-3">

          <!-- Show when LOGGED IN -->
          <template v-if="authStore.isLoggedIn">
            <!-- User avatar + name -->
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-full bg-brand-700 flex items-center justify-center text-sm font-semibold text-brand-200">
                {{ initials }}
              </div>
              <span class="text-sm text-surface-300 hidden md:block">{{ authStore.userName }}</span>
            </div>

            <!-- Divider -->
            <div class="w-px h-5 bg-surface-700 hidden md:block"></div>

            <!-- Logout button -->
            <button @click="handleLogout" class="btn-ghost text-sm py-1.5 px-3 flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span class="hidden sm:block">Logout</span>
            </button>
          </template>

          <!-- Show when LOGGED OUT -->
          <template v-else>
            <NuxtLink to="/login" class="btn-ghost text-sm py-1.5 px-3">Sign In</NuxtLink>
            <NuxtLink to="/signup" class="btn-primary text-sm py-1.5 px-3">Sign Up</NuxtLink>
          </template>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
// useAuthStore() accesses our Pinia auth store
const authStore = useAuthStore()
const router = useRouter()

// computed() auto-updates when authStore.userName changes
// It creates initials like "John Doe" → "JD"
const initials = computed(() => {
  return authStore.userName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

async function handleLogout() {
  authStore.signOut()
  // navigateTo is Nuxt's router.push equivalent
  await navigateTo('/login')
}
</script>
