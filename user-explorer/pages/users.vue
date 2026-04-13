<!-- pages/users.vue -->
<!--
  TEACHING NOTE: This is the MAIN PAGE of the app - the User Explorer.
  It's protected by the 'auth' middleware.

  KEY CONCEPTS HERE:
  1. definePageMeta → sets middleware and page options
  2. useRoute/useRouter → access URL and navigate
  3. watch → sync URL ↔ store state
  4. useFetch vs $fetch → Nuxt's SSR-aware data fetching
  5. onMounted/onUnmounted → lifecycle hooks

  URL STATE SYNCHRONIZATION:
  The URL should always reflect the current table state.
  Example: /users?search=john&role=Admin&sort=email&dir=asc
  
  When URL changes (browser back/forward), we update the store.
  When store changes (user interacts), we update the URL.
  This creates a "single source of truth" for navigation state.
-->
<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

    <!-- Page header -->
    <div class="flex items-center justify-between mb-8 flex-wrap gap-4">
      <div>
        <h1 class="font-display text-3xl font-bold text-surface-50">User Explorer</h1>
        <p class="text-surface-500 text-sm mt-1">
          Browse, search, and manage your team members
        </p>
      </div>

      <!-- Stats badges -->
      <div class="flex items-center gap-3 flex-wrap">
        <div class="badge bg-surface-800 text-surface-400 border border-surface-700 px-3 py-1.5 text-xs">
          <span class="text-surface-200 font-semibold mr-1">{{ store.totalFiltered }}</span>
          {{ store.totalFiltered === 1 ? 'user' : 'users' }}
        </div>
        <div v-if="store.selectedCount > 0"
             class="badge bg-brand-950/50 text-brand-400 border border-brand-800/50 px-3 py-1.5 text-xs">
          <span class="font-semibold mr-1">{{ store.selectedCount }}</span> selected
        </div>
      </div>
    </div>

    <!-- Main content card -->
    <div class="card p-0 overflow-hidden">
      <!-- Toolbar -->
      <div class="p-4 border-b border-surface-800">
        <TableToolbar @filter-changed="onFilterChanged" />
      </div>

      <!-- Table -->
      <div class="p-4">
        <TableDataTable />
      </div>
    </div>

    <!-- Keyboard shortcuts hint -->
    <div class="mt-4 flex items-center gap-4 text-xs text-surface-600 flex-wrap">
      <span>
        <kbd class="px-1.5 py-0.5 bg-surface-800 rounded border border-surface-700 font-mono">Ctrl+Z</kbd>
        Undo
      </span>
      <span>
        <kbd class="px-1.5 py-0.5 bg-surface-800 rounded border border-surface-700 font-mono">Ctrl+Y</kbd>
        Redo
      </span>
      <span>Click column headers to sort · Drag to reorder columns</span>
    </div>
  </div>
</template>

<script setup lang="ts">
/*
  TEACHING NOTE: definePageMeta must be at the top level of <script setup>.
  It's a compiler macro that runs at build time to configure the page.
*/
definePageMeta({
  middleware: 'auth',  // Protect this page - redirect to /login if not authenticated
})

const store = useUsersStore()
const authStore = useAuthStore()
const route = useRoute()    // Current route info (path, query params, etc.)
const router = useRouter()  // Router instance for programmatic navigation

// ===== INITIALIZE ON PAGE LOAD =====
onMounted(async () => {
  // 1. Check auth
  authStore.initAuth()
  if (!authStore.isLoggedIn) {
    await navigateTo('/login')
    return
  }

  // 2. Load saved column order from localStorage
  store.loadColumnOrder()

  // 3. Read URL query params and apply them to store
  syncFromUrl()

  // 4. Push initial history entry for undo/redo
  store.pushHistory()

  // 5. Start BroadcastChannel for multi-tab sync
  store.initBroadcast()

  // 6. Register keyboard shortcuts
  window.addEventListener('keydown', handleKeyboard)

  // 7. Fetch initial data
  await store.fetchUsers(true)
})

// Cleanup when user leaves the page
onUnmounted(() => {
  store.closeBroadcast()
  window.removeEventListener('keydown', handleKeyboard)
})

// ===== URL SYNCHRONIZATION =====
/*
  TEACHING NOTE: URL sync has two directions:
  1. Store → URL: When user changes filters, update the URL (pushes to history)
  2. URL → Store: When URL changes (back/forward), update the store

  We use watch() for both directions.
*/

// Direction 1: Store changes → Update URL
// We watch multiple store values at once using a getter function
watch(
  () => ({
    search: store.search,
    role: store.filterRole,
    status: store.filterStatus,
    domain: store.filterDomain,
    sort: store.sortField,
    dir: store.sortDir,
  }),
  (newVal) => {
    // Build new query params object (only include non-empty values)
    const query: Record<string, string> = {}
    if (newVal.search) query.search = newVal.search
    if (newVal.role) query.role = newVal.role
    if (newVal.status) query.status = newVal.status
    if (newVal.domain) query.domain = newVal.domain
    if (newVal.sort !== 'name') query.sort = newVal.sort
    if (newVal.dir !== 'asc') query.dir = newVal.dir

    // Replace current URL without adding to browser history
    // (we don't want every keystroke to add a history entry)
    router.replace({ query })
  },
  { deep: true }
)

// Direction 2: URL changes → Update Store
// This fires when user presses Back/Forward in browser
watch(
  () => route.query,
  () => syncFromUrl(),
  { immediate: false }
)

// Read URL params and apply them to the store
function syncFromUrl() {
  const q = route.query
  store.search = (q.search as string) || ''
  store.filterRole = (q.role as string) || ''
  store.filterStatus = (q.status as string) || ''
  store.filterDomain = (q.domain as string) || ''
  store.sortField = (q.sort as any) || 'name'
  store.sortDir = (q.dir as any) || 'asc'
}

// Called when filters change - reset scroll position
function onFilterChanged() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// ===== KEYBOARD SHORTCUTS =====
function handleKeyboard(e: KeyboardEvent) {
  // Ignore if user is typing in an input
  if ((e.target as HTMLElement)?.tagName === 'INPUT') return
  // Ctrl+Z or Cmd+Z = Undo
  if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
    e.preventDefault()
    store.undo()
  }
  // Ctrl+Y or Ctrl+Shift+Z = Redo
  if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
    e.preventDefault()
    store.redo()
  }
}
</script>
