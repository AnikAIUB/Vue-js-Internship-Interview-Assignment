// plugins/auth.client.ts
/*
  TEACHING NOTE: Nuxt plugins run when the app starts.
  The ".client" in the filename means this ONLY runs in the browser
  (not on the server during SSR).

  This is important because localStorage doesn't exist on the server!

  Plugins are the right place to:
  - Initialize stores that need to run once on app start
  - Set up global listeners
  - Configure third-party libraries

  defineNuxtPlugin receives the nuxt app instance.
*/
export default defineNuxtPlugin(() => {
  const authStore = useAuthStore()

  // Check if user was previously logged in (reads from localStorage)
  authStore.initAuth()
})
