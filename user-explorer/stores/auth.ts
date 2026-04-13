// stores/auth.ts
/*
  TEACHING NOTE: Pinia is Vue's official state management library.
  A "store" is a place to keep data that MULTIPLE components need to share.
  
  Example: The navbar needs to know if you're logged in.
           The users page needs to know if you're logged in.
           The middleware needs to know if you're logged in.
  
  Instead of passing this data through props (messy!), we put it in a store.
  Any component can then READ from or WRITE to the store directly.

  defineStore(name, setup function) creates a store.
  - ref() creates reactive data (like data() in Vue 2)
  - computed() creates derived values (like computed in Vue 2)
  - Functions defined inside are "actions" (like methods in Vue 2)
*/

export const useAuthStore = defineStore('auth', () => {
  // ===== STATE =====
  // ref() makes a value "reactive" - Vue watches it and updates the UI when it changes
  const user = ref<{ name: string; email: string } | null>(null)
  const isLoading = ref(false)

  // ===== GETTERS =====
  // computed() auto-recalculates when its dependencies (user) change
  const isLoggedIn = computed(() => !!user.value)
  const userName = computed(() => user.value?.name ?? '')

  // ===== ACTIONS =====

  // Called when app starts - check if user is already logged in from a previous session
  function initAuth() {
    // localStorage persists data even after browser closes
    // We check if we saved a user there previously
    if (import.meta.client) { // import.meta.client = we're in browser (not server)
      const saved = localStorage.getItem('auth_user')
      if (saved) {
        try {
          user.value = JSON.parse(saved)
        } catch {
          localStorage.removeItem('auth_user')
        }
      }
    }
  }

  // Sign Up: creates a fake account (in real app, this calls your backend API)
  async function signUp(name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> {
    isLoading.value = true

    try {
      // Simulate a network request (in real app: await $fetch('/api/auth/signup', {...}))
      await new Promise(resolve => setTimeout(resolve, 800))

      // Simple validation
      if (!name || !email || !password) return { success: false, error: 'All fields required' }
      if (password.length < 6) return { success: false, error: 'Password must be at least 6 characters' }

      // Save registered users to localStorage so they can log in later
      const users = getStoredUsers()
      if (users.find((u: any) => u.email === email)) {
        return { success: false, error: 'Email already registered' }
      }

      users.push({ name, email, password }) // In real app, NEVER store plain passwords!
      localStorage.setItem('registered_users', JSON.stringify(users))

      // Auto-login after signup
      user.value = { name, email }
      localStorage.setItem('auth_user', JSON.stringify(user.value))

      return { success: true }
    } finally {
      isLoading.value = false
    }
  }

  // Sign In: validates credentials and logs the user in
  async function signIn(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    isLoading.value = true

    try {
      await new Promise(resolve => setTimeout(resolve, 600))

      const users = getStoredUsers()
      // Check demo account OR registered users
      const found = users.find((u: any) => u.email === email && u.password === password)
        || (email === 'demo@explorer.com' && password === 'demo1234'
            ? { name: 'Demo User', email } : null)

      if (!found) return { success: false, error: 'Invalid email or password' }

      user.value = { name: found.name, email: found.email }
      localStorage.setItem('auth_user', JSON.stringify(user.value))

      return { success: true }
    } finally {
      isLoading.value = false
    }
  }

  // Sign Out: clear user data everywhere
  function signOut() {
    user.value = null
    localStorage.removeItem('auth_user')
  }

  // Helper: get registered users from localStorage
  function getStoredUsers() {
    if (!import.meta.client) return []
    try {
      return JSON.parse(localStorage.getItem('registered_users') || '[]')
    } catch {
      return []
    }
  }

  // Return everything that should be accessible outside the store
  return { user, isLoading, isLoggedIn, userName, initAuth, signUp, signIn, signOut }
})
