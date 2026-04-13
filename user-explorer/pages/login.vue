<!-- pages/login.vue -->
<!--
  TEACHING NOTE: Files in /pages/ automatically become routes!
  This file → /login URL
  index.vue → / URL
  users.vue → /users URL
  signup.vue → /signup URL

  definePageMeta() configures this page:
  - layout: 'auth' → use the auth layout (centered card, no navbar)
  - middleware: none (public page - anyone can visit)
-->
<template>
  <div class="card animate-fadeIn">
    <!-- Card Header -->
    <div class="mb-8">
      <h1 class="font-display text-2xl font-bold text-surface-50 mb-1">Welcome back</h1>
      <p class="text-surface-500 text-sm">Sign in to access the User Explorer</p>
    </div>

    <!-- Demo credentials hint -->
    <div class="mb-6 p-3 bg-brand-950/50 border border-brand-900/50 rounded-lg">
      <p class="text-xs text-brand-400 font-medium mb-1">Demo credentials:</p>
      <p class="text-xs text-surface-400 font-mono">Email: demo@explorer.com</p>
      <p class="text-xs text-surface-400 font-mono">Password: demo1234</p>
      <button @click="fillDemo" class="text-xs text-brand-400 hover:text-brand-300 mt-1 underline">
        Fill automatically →
      </button>
    </div>

    <!-- Sign In Form -->
    <!--
      @submit.prevent = listen for form submit but prevent page reload
      (default form behavior is to reload the page - we don't want that)
    -->
    <form @submit.prevent="handleSubmit" class="space-y-4">

      <!-- Email field -->
      <div>
        <label for="email" class="block text-sm font-medium text-surface-300 mb-1.5">
          Email address
        </label>
        <!-- v-model binds input to our reactive ref -->
        <input
          id="email"
          v-model="form.email"
          type="email"
          autocomplete="email"
          placeholder="you@example.com"
          class="input-field"
          :class="{ 'border-red-700 focus:ring-red-500': errors.email }"
        />
        <p v-if="errors.email" class="mt-1 text-xs text-red-400">{{ errors.email }}</p>
      </div>

      <!-- Password field -->
      <div>
        <div class="flex items-center justify-between mb-1.5">
          <label for="password" class="text-sm font-medium text-surface-300">Password</label>
        </div>
        <div class="relative">
          <!-- :type changes between 'password' and 'text' based on showPassword -->
          <input
            id="password"
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="current-password"
            placeholder="••••••••"
            class="input-field pr-10"
            :class="{ 'border-red-700 focus:ring-red-500': errors.password }"
          />
          <!-- Show/hide password toggle -->
          <button type="button" @click="showPassword = !showPassword"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-200 transition-colors">
            <svg v-if="showPassword" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
            <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
        </div>
        <p v-if="errors.password" class="mt-1 text-xs text-red-400">{{ errors.password }}</p>
      </div>

      <!-- General error (wrong credentials etc.) -->
      <div v-if="authError"
        class="p-3 bg-red-950/50 border border-red-900/50 rounded-lg text-sm text-red-400">
        {{ authError }}
      </div>

      <!-- Submit button -->
      <!-- :disabled binds the disabled attribute to our loading state -->
      <button
        type="submit"
        :disabled="authStore.isLoading"
        class="btn-primary w-full h-10 flex items-center justify-center gap-2 mt-2"
      >
        <!-- Spinner while loading -->
        <svg v-if="authStore.isLoading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
        {{ authStore.isLoading ? 'Signing in...' : 'Sign In' }}
      </button>
    </form>

    <!-- Link to Sign Up -->
    <p class="mt-6 text-center text-sm text-surface-500">
      Don't have an account?
      <NuxtLink to="/signup" class="text-brand-400 hover:text-brand-300 font-medium transition-colors">
        Create one
      </NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
// Tell Nuxt to use 'auth' layout for this page
definePageMeta({ layout: 'auth' })

const authStore = useAuthStore()
const router = useRouter()

// REACTIVE STATE
// ref() creates reactive variables - when they change, the UI updates automatically
const form = reactive({
  email: '',
  password: ''
})
const errors = reactive({ email: '', password: '' })
const authError = ref('')
const showPassword = ref(false)

// Fill demo credentials
function fillDemo() {
  form.email = 'demo@explorer.com'
  form.password = 'demo1234'
}

// FORM VALIDATION
function validate() {
  errors.email = ''
  errors.password = ''

  if (!form.email) {
    errors.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Please enter a valid email'
  }

  if (!form.password) {
    errors.password = 'Password is required'
  }

  return !errors.email && !errors.password
}

async function handleSubmit() {
  authError.value = ''
  if (!validate()) return

  const result = await authStore.signIn(form.email, form.password)

  if (result.success) {
    // Navigate to users page after successful login
    await navigateTo('/users')
  } else {
    authError.value = result.error || 'Login failed'
  }
}

// If already logged in, redirect to users page
onMounted(() => {
  authStore.initAuth()
  if (authStore.isLoggedIn) {
    navigateTo('/users')
  }
})
</script>
