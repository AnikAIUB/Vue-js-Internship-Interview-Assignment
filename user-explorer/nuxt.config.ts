// nuxt.config.ts
// This is the main configuration file for Nuxt 3.
// Think of it as the "settings" for your entire app.

export default defineNuxtConfig({
  devtools: { enabled: true },

  // Modules extend Nuxt's functionality
  modules: [
    '@pinia/nuxt',       // State management (like a global store for data)
    '@vueuse/nuxt',      // Utility composables (helpful tools)
    '@nuxtjs/tailwindcss' // CSS utility framework
  ],

  // CSS files loaded globally across every page
  css: ['~/assets/css/main.css'],

  // Runtime config: public = accessible in browser, private = server only
  runtimeConfig: {
    public: {
      apiBase: 'https://jsonplaceholder.typicode.com'
    }
  },

  // SSR (Server-Side Rendering) = true means pages render on server first
  // This is great for SEO and initial page load speed
  ssr: true,

  // Pinia store configuration
  pinia: {
    autoImports: ['defineStore', 'storeToRefs']
  },

  // Auto-import composables, components, etc.
  imports: {
    dirs: ['stores', 'composables']
  },

  // Nitro is Nuxt's server engine
  nitro: {
    preset: 'node-server'
  }
})
