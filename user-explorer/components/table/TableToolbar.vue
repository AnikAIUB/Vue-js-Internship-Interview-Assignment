<!-- components/table/TableToolbar.vue -->
<!--
  TEACHING NOTE: This component contains all the controls above the table:
  - Search input (with debounce)
  - Filter dropdowns
  - Undo/Redo buttons
  - Bulk action buttons (delete/export)

  KEY CONCEPT: Debouncing
  When user types "john", without debounce we'd make 4 API calls: j, jo, joh, john.
  With debounce (300ms delay), we wait until user STOPS typing, then make 1 call.
  We use @vueuse/core's useDebounceFn for this.

  KEY CONCEPT: watch()
  watch() observes a reactive value and runs a function when it changes.
  This is how we push history entries and sync with URL.
-->
<template>
  <div class="space-y-3">
    <!-- Top row: Search + Filters -->
    <div class="flex flex-wrap gap-3">

      <!-- Search Input -->
      <div class="relative flex-1 min-w-[200px]">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500 pointer-events-none"
             fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" />
        </svg>
        <!-- v-model binds input value to searchInput ref -->
        <!-- @input fires every keystroke, but our watcher is debounced -->
        <input
          v-model="searchInput"
          type="text"
          placeholder="Search by name, email..."
          class="input-field pl-9 pr-4 h-10 text-sm"
        />
        <!-- Clear button -->
        <button v-if="searchInput" @click="clearSearch"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-200 transition-colors">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Role Filter -->
      <select v-model="store.filterRole" @change="onFilterChange" class="input-field w-auto h-10 text-sm pr-8">
        <option value="">All Roles</option>
        <option value="Admin">Admin</option>
        <option value="Editor">Editor</option>
        <option value="Viewer">Viewer</option>
        <option value="Manager">Manager</option>
      </select>

      <!-- Status Filter -->
      <select v-model="store.filterStatus" @change="onFilterChange" class="input-field w-auto h-10 text-sm pr-8">
        <option value="">All Statuses</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
        <option value="pending">Pending</option>
      </select>

      <!-- Email Domain Filter -->
      <input
        v-model="store.filterDomain"
        @input="onFilterChange"
        type="text"
        placeholder="Filter by domain..."
        class="input-field w-auto h-10 text-sm min-w-[160px]"
      />

      <!-- Undo/Redo -->
      <div class="flex gap-1">
        <button @click="store.undo()" :disabled="!store.canUndo"
          class="btn-ghost h-10 px-3 disabled:opacity-30" title="Undo (filter changes)">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
        </button>
        <button @click="store.redo()" :disabled="!store.canRedo"
          class="btn-ghost h-10 px-3 disabled:opacity-30" title="Redo">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M21 10H11a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Bottom row: Bulk actions + stats -->
    <div class="flex items-center justify-between flex-wrap gap-3">
      <!-- Result count -->
      <p class="text-sm text-surface-500">
        Showing <span class="text-surface-300 font-medium">{{ store.totalFiltered }}</span> users
        <span v-if="store.selectedCount > 0" class="text-brand-400">
          · {{ store.selectedCount }} selected
        </span>
      </p>

      <!-- Bulk action buttons - only show when items are selected -->
      <Transition name="slide-fade">
        <div v-if="store.selectedCount > 0" class="flex items-center gap-2">
          <span class="text-xs text-surface-500">{{ store.selectedCount }} selected:</span>
          <button @click="store.exportSelected()" class="btn-ghost text-sm py-1.5 px-3 flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </button>
          <button @click="store.deleteSelected()" class="btn-danger text-sm py-1.5 px-3 flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete Selected
          </button>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
/*
  TEACHING NOTE: useDebounceFn from @vueuse/core
  It wraps a function so it only runs after a delay.
  If called again before delay ends, the timer resets.
*/
import { useDebounceFn } from '@vueuse/core'

const store = useUsersStore()

// defineEmits must be declared at the top, before being used below
const emit = defineEmits<{ 'filter-changed': [] }>()

// Local search input - we debounce before writing to store
// Why separate? We show typed text immediately but filter after user stops typing.
const searchInput = ref(store.search)

// Keep local input in sync if store.search changes externally (e.g. undo/redo, URL sync)
watch(() => store.search, (val) => {
  if (val !== searchInput.value) searchInput.value = val
})

// Debounced function: runs 300ms after user stops typing
const debouncedSearch = useDebounceFn((value: string) => {
  store.search = value
  store.pushHistory()         // Save to undo history
  store.broadcastFilters()    // Sync to other tabs
  emit('filter-changed')
}, 300)

// watch() monitors searchInput and calls debouncedSearch whenever it changes
watch(searchInput, (value) => {
  debouncedSearch(value)
})

function clearSearch() {
  searchInput.value = ''
  store.search = ''
  store.pushHistory()
}

function onFilterChange() {
  store.pushHistory()
  store.broadcastFilters()
  emit('filter-changed')
}
</script>

<style scoped>
/* Transition for bulk actions appearing/disappearing */
.slide-fade-enter-active, .slide-fade-leave-active {
  transition: all 0.2s ease;
}
.slide-fade-enter-from, .slide-fade-leave-to {
  opacity: 0;
  transform: translateX(10px);
}
</style>
