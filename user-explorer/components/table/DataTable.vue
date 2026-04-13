<!-- components/table/DataTable.vue -->
<!--
  TEACHING NOTE: This is the main table component.
  It renders the table with:
  - Draggable column headers (for column reordering)
  - Sortable columns
  - Checkboxes for row selection
  - Infinite scroll sentinel (triggers loadMore)
  - Virtual rendering awareness

  KEY CONCEPT: Column Drag & Drop
  We use HTML5 native drag and drop API (no extra library needed).
  When you drag a column header:
  1. dragstart → remember which column you're dragging
  2. dragover → show visual feedback
  3. drop → swap the two columns in columnOrder array

  KEY CONCEPT: Intersection Observer (Infinite Scroll)
  We place a hidden <div> at the bottom of the table.
  When it becomes visible in the viewport, we load more data.
  This is much better than listening to scroll events.
-->
<template>
  <div class="relative">
    <!-- Offline banner -->
    <div v-if="store.isOffline"
      class="mb-3 px-4 py-2.5 bg-amber-950/50 border border-amber-800/50 rounded-lg
             flex items-center gap-2 text-sm text-amber-400 animate-slideDown">
      <svg class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M18.364 5.636a9 9 0 010 12.728M15.536 8.464a5 5 0 010 7.072M12 12h.01M8.464 15.536a5 5 0 010-7.072M5.636 18.364a9 9 0 010-12.728" />
      </svg>
      <span>Offline mode — showing cached data. Reconnect to see live updates.</span>
    </div>

    <!-- Table wrapper with horizontal scroll -->
    <div class="overflow-x-auto rounded-xl border border-surface-800">
      <table class="w-full border-collapse">

        <!-- TABLE HEADER -->
        <thead class="bg-surface-900 border-b border-surface-800">
          <tr>
            <!--
              v-for on columns from our ordered column list.
              Each column is draggable for reordering.
            -->
            <template v-for="col in orderedColumns" :key="col.key">

              <!-- Checkbox column (special - not sortable/draggable) -->
              <th v-if="col.key === 'select'" class="px-4 py-3 w-12">
                <input
                  ref="selectAllCheckbox"
                  type="checkbox"
                  :checked="store.selectAll"
                  @change="store.toggleSelectAll()"
                  class="w-4 h-4 rounded border-surface-600 bg-surface-800 text-brand-500
                         focus:ring-brand-500 focus:ring-offset-surface-900 cursor-pointer"
                />
              </th>

              <!-- Actions column (not sortable/draggable) -->
              <th v-else-if="col.key === 'actions'" class="px-4 py-3 w-20 text-right text-xs text-surface-500 uppercase tracking-wider">
                Actions
              </th>

              <!-- Regular sortable + draggable column -->
              <th
                v-else
                class="th-cell group relative"
                :class="{
                  'cursor-grab active:cursor-grabbing': true,
                  'bg-surface-800': dragOver === col.key
                }"
                draggable="true"
                @dragstart="onDragStart(col.key)"
                @dragover.prevent="onDragOver(col.key)"
                @drop="onDrop(col.key)"
                @dragend="onDragEnd"
                @click="col.sortable !== false && store.setSort(col.key as any)"
              >
                <div class="flex items-center gap-1.5">
                  <!-- Drag handle icon -->
                  <svg class="w-3 h-3 text-surface-600 group-hover:text-surface-400 flex-shrink-0 transition-colors"
                       fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M4 8h16M4 16h16" />
                  </svg>

                  {{ col.label }}

                  <!-- Sort indicator arrows -->
                  <span v-if="store.sortField === col.key" class="text-brand-400 ml-0.5">
                    {{ store.sortDir === 'asc' ? '↑' : '↓' }}
                  </span>
                  <span v-else class="text-surface-700 opacity-0 group-hover:opacity-100 transition-opacity">↕</span>
                </div>
              </th>

            </template>
          </tr>
        </thead>

        <!-- TABLE BODY -->
        <tbody>
          <!-- Loading skeleton rows (shown on initial load) -->
          <template v-if="store.isLoading && store.allUsers.length === 0">
            <UiSkeletonRow v-for="i in 8" :key="i" :cols="orderedColumns.length" />
          </template>

          <!-- Error state (full table error) -->
          <tr v-else-if="store.error && store.allUsers.length === 0">
            <td :colspan="orderedColumns.length">
              <UiErrorState :message="store.error" @retry="store.fetchUsers(true)" />
            </td>
          </tr>

          <!-- Empty state (no results) -->
          <tr v-else-if="store.filteredUsers.length === 0 && !store.isLoading">
            <td :colspan="orderedColumns.length">
              <UiEmptyState
                title="No users found"
                description="Try adjusting your search or filters to find what you're looking for."
                action-label="Clear Filters"
                @action="clearFilters"
              />
            </td>
          </tr>

          <!-- ACTUAL DATA ROWS -->
          <!--
            v-for renders one <tr> per user.
            :key is required - Vue uses it to track which rows to update
            when data changes. Always use a unique ID!
          -->
          <template v-else>
            <tr
              v-for="user in store.filteredUsers"
              :key="user.id"
              class="border-b border-surface-800/50 hover:bg-surface-800/30 transition-colors group animate-fadeIn"
              :class="{ 'bg-brand-950/20': store.selectedIds.includes(user.id) }"
            >
              <template v-for="col in orderedColumns" :key="col.key">

                <!-- Checkbox cell -->
                <td v-if="col.key === 'select'" class="px-4 py-3 w-12">
                  <input
                    type="checkbox"
                    :checked="store.selectedIds.includes(user.id)"
                    @change="store.toggleSelect(user.id)"
                    class="w-4 h-4 rounded border-surface-600 bg-surface-800 text-brand-500
                           focus:ring-brand-500 cursor-pointer"
                  />
                </td>

                <!-- Name cell with avatar -->
                <td v-else-if="col.key === 'name'" class="td-cell">
                  <div class="flex items-center gap-3">
                    <!-- Avatar image -->
                    <img
                      :src="user.avatar"
                      :alt="user.name"
                      class="w-8 h-8 rounded-full bg-surface-700 flex-shrink-0"
                      loading="lazy"
                    />
                    <div>
                      <p class="font-medium text-surface-200 text-sm">{{ user.name }}</p>
                      <p class="text-xs text-surface-500">@{{ user.username }}</p>
                    </div>
                  </div>
                </td>

                <!-- Email cell -->
                <td v-else-if="col.key === 'email'" class="td-cell">
                  <a :href="`mailto:${user.email}`" class="text-brand-400 hover:text-brand-300 transition-colors text-sm">
                    {{ user.email }}
                  </a>
                </td>

                <!-- Role cell with badge -->
                <td v-else-if="col.key === 'role'" class="td-cell">
                  <span class="badge" :class="roleColors[user.role]">{{ user.role }}</span>
                </td>

                <!-- Status cell with badge -->
                <td v-else-if="col.key === 'status'" class="td-cell">
                  <span class="badge" :class="statusColors[user.status]">
                    <span class="w-1.5 h-1.5 rounded-full mr-1.5" :class="statusDot[user.status]"></span>
                    {{ user.status }}
                  </span>
                </td>

                <!-- Department -->
                <td v-else-if="col.key === 'department'" class="td-cell text-surface-400 text-sm">
                  {{ user.department }}
                </td>

                <!-- Company -->
                <td v-else-if="col.key === 'company'" class="td-cell text-surface-400 text-sm">
                  {{ user.company?.name }}
                </td>

                <!-- Phone -->
                <td v-else-if="col.key === 'phone'" class="td-cell text-surface-500 text-xs font-mono">
                  {{ user.phone }}
                </td>

                <!-- Actions cell: Delete button -->
                <td v-else-if="col.key === 'actions'" class="td-cell text-right">
                  <button
                    @click="store.deleteUser(user.id)"
                    class="opacity-0 group-hover:opacity-100 transition-opacity
                           text-surface-500 hover:text-red-400 p-1 rounded"
                    title="Delete user"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>

                <!-- Fallback for any other column key -->
                <td v-else class="td-cell text-surface-400 text-sm">
                  {{ (user as any)[col.key] ?? '—' }}
                </td>

              </template>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <!-- INFINITE SCROLL SENTINEL -->
    <!--
      This invisible div sits below the table.
      When it enters the viewport, our IntersectionObserver fires
      and we call store.loadMore().
    -->
    <div ref="sentinel" class="h-10 flex items-center justify-center mt-4">
      <!-- Loading more indicator -->
      <div v-if="store.isLoadingMore" class="flex items-center gap-2 text-sm text-surface-500">
        <svg class="w-4 h-4 animate-spin text-brand-500" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
        Loading more users...
      </div>
      <!-- End of data message -->
      <div v-else-if="!store.hasMore && store.allUsers.length > 0"
           class="text-xs text-surface-600 border-t border-surface-800 w-full text-center pt-4">
        All {{ store.totalFiltered }} users loaded
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/*
  TEACHING NOTE: useIntersectionObserver from @vueuse/core
  This watches an element and fires a callback when it enters/leaves the viewport.
  Perfect for infinite scroll - when the "sentinel" div at the bottom
  becomes visible, we know the user has scrolled to the bottom.
*/
import { useIntersectionObserver } from '@vueuse/core'

const store = useUsersStore()

// Indeterminate state on the select-all checkbox must be set via JS (not a Vue binding)
const selectAllCheckbox = ref<HTMLInputElement | null>(null)
watch(
  () => store.selectedIds.length,
  () => {
    if (selectAllCheckbox.value) {
      selectAllCheckbox.value.indeterminate =
        store.selectedIds.length > 0 && !store.selectAll
    }
  }
)

// ===== COLUMN DEFINITIONS =====
// All possible columns with metadata
const allColumns = [
  { key: 'select', label: '', sortable: false },
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'role', label: 'Role', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'department', label: 'Department', sortable: false },
  { key: 'phone', label: 'Phone', sortable: false },
  { key: 'actions', label: '', sortable: false },
]

// Ordered columns based on store's columnOrder
// computed() recalculates whenever store.columnOrder changes
const orderedColumns = computed(() => {
  return store.columnOrder
    .map(key => allColumns.find(c => c.key === key))
    .filter(Boolean) as typeof allColumns
})

// ===== BADGE COLORS =====
const roleColors: Record<string, string> = {
  Admin: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
  Editor: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  Viewer: 'bg-surface-700 text-surface-400',
  Manager: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
}
const statusColors: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  inactive: 'bg-surface-700 text-surface-500',
  pending: 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
}
const statusDot: Record<string, string> = {
  active: 'bg-emerald-400',
  inactive: 'bg-surface-500',
  pending: 'bg-amber-500',
}

// ===== DRAG AND DROP for column reordering =====
const draggedCol = ref<string | null>(null)
const dragOver = ref<string | null>(null)

function onDragStart(key: string) {
  draggedCol.value = key
}

function onDragOver(key: string) {
  if (key !== draggedCol.value) dragOver.value = key
}

function onDrop(targetKey: string) {
  if (!draggedCol.value || draggedCol.value === targetKey) return

  // Swap positions in the column order array
  const order = [...store.columnOrder]
  const fromIdx = order.indexOf(draggedCol.value)
  const toIdx = order.indexOf(targetKey)

  if (fromIdx !== -1 && toIdx !== -1) {
    // Remove the dragged item and insert at new position
    order.splice(fromIdx, 1)
    order.splice(toIdx, 0, draggedCol.value)
    store.columnOrder = order
    store.saveColumnOrder()  // Persist to localStorage
  }

  onDragEnd()
}

function onDragEnd() {
  draggedCol.value = null
  dragOver.value = null
}

// ===== INFINITE SCROLL =====
const sentinel = ref<HTMLElement | null>(null)

// useIntersectionObserver watches when sentinel enters the viewport
useIntersectionObserver(
  sentinel,
  ([entry]) => {
    // isIntersecting = the element is visible on screen
    if (entry.isIntersecting && !store.isLoading) {
      store.loadMore()
    }
  },
  { threshold: 0.1 }  // Trigger when 10% of the element is visible
)

// ===== CLEAR FILTERS =====
function clearFilters() {
  store.search = ''
  store.filterRole = ''
  store.filterStatus = ''
  store.filterDomain = ''
  store.pushHistory()
}
</script>
