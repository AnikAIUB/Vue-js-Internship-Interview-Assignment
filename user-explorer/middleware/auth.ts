// middleware/auth.ts
/*
  TEACHING NOTE: Middleware runs BEFORE a page loads.
  It's like a security guard at the door - it checks conditions
  and can redirect you elsewhere if needed.

  Nuxt middleware gets access to:
  - to: the page you're trying to navigate TO
  - from: the page you're coming FROM
  - navigateTo(): a function to redirect the user

  This middleware is "named" middleware (not global).
  Pages that want protection add:  definePageMeta({ middleware: 'auth' })
*/

export default defineNuxtRouteMiddleware((to, from) => {
  // import.meta.client = this code runs in the browser (not on the server)
  // We check localStorage only in the browser
  if (import.meta.client) {
    const authUser = localStorage.getItem('auth_user')

    // If no user in storage, redirect to login
    if (!authUser) {
      return navigateTo('/login')
    }

    // Could also check if token is expired here in a real app
  }

  // On the server side (SSR), we let the page load and the client will handle the redirect
  // In a real app, you'd check a cookie here instead
})
