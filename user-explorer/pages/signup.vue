<!-- pages/signup.vue -->
<!--
  TEACHING NOTE: Very similar to login.vue.
  Notice how we reuse the same 'auth' layout.
  The form has one extra field (name) and calls authStore.signUp().
-->
<template>
  <div class="card animate-fadeIn">
    <div class="mb-8">
      <h1 class="font-display text-2xl font-bold text-surface-50 mb-1">Create account</h1>
      <p class="text-surface-500 text-sm">Join UserExplorer to manage your team</p>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-4">

      <!-- Name -->
      <div>
        <label for="name" class="block text-sm font-medium text-surface-300 mb-1.5">
          Full name
        </label>
        <input
          id="name"
          v-model="form.name"
          type="text"
          autocomplete="name"
          placeholder="John Doe"
          class="input-field"
          :class="{ 'border-red-700': errors.name }"
        />
        <p v-if="errors.name" class="mt-1 text-xs text-red-400">{{ errors.name }}</p>
      </div>

      <!-- Email -->
      <div>
        <label for="email" class="block text-sm font-medium text-surface-300 mb-1.5">
          Email address
        </label>
        <input
          id="email"
          v-model="form.email"
          type="email"
          autocomplete="email"
          placeholder="you@example.com"
          class="input-field"
          :class="{ 'border-red-700': errors.email }"
        />
        <p v-if="errors.email" class="mt-1 text-xs text-red-400">{{ errors.email }}</p>
      </div>

      <!-- Password -->
      <div>
        <label for="password" class="block text-sm font-medium text-surface-300 mb-1.5">
          Password
        </label>
        <div class="relative">
          <input
            id="password"
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="new-password"
            placeholder="Min. 6 characters"
            class="input-field pr-10"
            :class="{ 'border-red-700': errors.password }"
          />
          <button type="button" @click="showPassword = !showPassword"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-200 transition-colors">
            <svg v-if="showPassword" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
            <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
        </div>
        <!-- Password strength indicator -->
        <div v-if="form.password" class="mt-2 flex gap-1">
          <div v-for="i in 3" :key="i" class="h-1 flex-1 rounded-full transition-colors"
               :class="passwordStrength >= i ? strengthColors[passwordStrength - 1] : 'bg-surface-700'">
          </div>
        </div>
        <p v-if="errors.password" class="mt-1 text-xs text-red-400">{{ errors.password }}</p>
      </div>

      <!-- General error -->
      <div v-if="authError"
        class="p-3 bg-red-950/50 border border-red-900/50 rounded-lg text-sm text-red-400">
        {{ authError }}
      </div>

      <button type="submit" :disabled="authStore.isLoading"
        class="btn-primary w-full h-10 flex items-center justify-center gap-2 mt-2">
        <svg v-if="authStore.isLoading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
        {{ authStore.isLoading ? 'Creating account...' : 'Create Account' }}
      </button>
    </form>

    <p class="mt-6 text-center text-sm text-surface-500">
      Already have an account?
      <NuxtLink to="/login" class="text-brand-400 hover:text-brand-300 font-medium transition-colors">
        Sign in
      </NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const authStore = useAuthStore()
const showPassword = ref(false)
const authError = ref('')

const form = reactive({ name: '', email: '', password: '' })
const errors = reactive({ name: '', email: '', password: '' })

// Compute password strength: 1=weak, 2=medium, 3=strong
const passwordStrength = computed(() => {
  const p = form.password
  if (!p) return 0
  let score = 0
  if (p.length >= 6) score++
  if (p.length >= 10) score++
  if (/[A-Z]/.test(p) && /[0-9]/.test(p)) score++
  return score
})

const strengthColors = ['bg-red-500', 'bg-amber-500', 'bg-emerald-500']

function validate() {
  errors.name = !form.name ? 'Name is required' : ''
  errors.email = !form.email ? 'Email is required'
    : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) ? 'Invalid email' : ''
  errors.password = !form.password ? 'Password is required'
    : form.password.length < 6 ? 'Minimum 6 characters' : ''
  return !errors.name && !errors.email && !errors.password
}

async function handleSubmit() {
  authError.value = ''
  if (!validate()) return

  const result = await authStore.signUp(form.name, form.email, form.password)
  if (result.success) {
    await navigateTo('/users')
  } else {
    authError.value = result.error || 'Sign up failed'
  }
}

onMounted(() => {
  authStore.initAuth()
  if (authStore.isLoggedIn) navigateTo('/users')
})
</script>
