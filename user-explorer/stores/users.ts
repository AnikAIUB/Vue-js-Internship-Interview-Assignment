// stores/users.ts
/*
  TEACHING NOTE: This store manages ALL the state for the User Explorer table.
  This is the most complex store. Let's understand each piece:

  STATE = what data we have right now
  GETTERS = derived/calculated values from state
  ACTIONS = functions that change state (fetch data, delete, etc.)

  KEY CONCEPTS IN THIS FILE:
  - Debouncing: waiting before searching (prevents too many API calls)
  - Infinite scroll: loading more data as you scroll
  - URL sync: keeping URL params in sync with table state
  - Undo/Redo: history of state changes
  - Race conditions: handling multiple simultaneous API calls
  - Offline support: using cached data when offline
  - BroadcastChannel: syncing between browser tabs
*/

// TypeScript interface - defines the "shape" of a User object
export interface User {
  id: number
  name: string
  email: string
  phone: string
  website: string
  company: { name: string; catchPhrase: string; bs: string }
  address: { street: string; city: string; zipcode: string }
  username: string
  role: 'Admin' | 'Editor' | 'Viewer' | 'Manager'
  department: string
  status: 'active' | 'inactive' | 'pending'
  avatar: string
  joinDate: string
}

export type SortField = 'name' | 'email' | 'company' | 'status' | 'role'
export type SortDir = 'asc' | 'desc'

// The history entry shape for undo/redo
interface HistoryEntry {
  search: string
  filterRole: string
  filterStatus: string
  filterDomain: string
  sortField: SortField
  sortDir: SortDir
}

// The roles we assign randomly to API users
const ROLES: User['role'][] = ['Admin', 'Editor', 'Viewer', 'Manager']
const DEPARTMENTS = ['Engineering', 'Design', 'Marketing', 'Sales', 'HR', 'Finance', 'Product']
const STATUSES: User['status'][] = ['active', 'inactive', 'pending']

// Enrich a raw JSONPlaceholder user with extra fields we need
function enrichUser(raw: any, index: number): User {
  return {
    ...raw,
    role: ROLES[index % ROLES.length],
    department: DEPARTMENTS[index % DEPARTMENTS.length],
    status: STATUSES[index % STATUSES.length],
    // Dicebear generates avatar images based on a seed
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(raw.name)}&backgroundColor=3730a3`,
    joinDate: new Date(Date.now() - Math.random() * 3 * 365 * 24 * 60 * 60 * 1000)
      .toISOString().split('T')[0]
  }
}

export const useUsersStore = defineStore('users', () => {

  // ===== STATE =====
  const allUsers = ref<User[]>([])         // All loaded users
  const isLoading = ref(false)             // Are we fetching right now?
  const isLoadingMore = ref(false)         // Are we loading MORE (infinite scroll)?
  const error = ref<string | null>(null)   // Error message if fetch failed
  const hasMore = ref(true)               // Is there more data to load?
  const currentPage = ref(1)              // Current page for pagination
  const PAGE_SIZE = 10                    // Users per page
  const isOffline = ref(false)            // Are we offline?

  // ===== FILTER/SORT STATE =====
  // These drive what the table shows
  const search = ref('')
  const filterRole = ref('')
  const filterStatus = ref('')
  const filterDomain = ref('')
  const sortField = ref<SortField>('name')
  const sortDir = ref<SortDir>('asc')

  // ===== COLUMN ORDER =====
  // Default column order - user can drag to rearrange
  const columnOrder = ref<string[]>(['select', 'name', 'email', 'role', 'status', 'department', 'phone', 'actions'])

  // ===== SELECTION =====
  // IMPORTANT: Vue cannot detect mutations inside Set/Map inside ref().
  // We use a plain reactive array and convert to/from as needed.
  const selectedIds = ref<number[]>([])
  const selectAll = ref(false)

  // ===== UNDO/REDO HISTORY =====
  const MAX_HISTORY = 50
  const history = ref<HistoryEntry[]>([])
  const historyIndex = ref(-1)

  // ===== DELETED IDS =====
  const deletedIds = ref<number[]>([])

  // ===== RACE CONDITION PREVENTION =====
  // We track an "abort controller" - when a new search starts, we abort the old one
  let abortController: AbortController | null = null

  // ===== GETTERS (computed values) =====

  // Apply all filters + sort to allUsers
  const filteredUsers = computed(() => {
    let result = allUsers.value.filter(u => !deletedIds.value.includes(u.id))

    // Search filter (case-insensitive)
    if (search.value) {
      const q = search.value.toLowerCase()
      result = result.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q)
      )
    }

    // Role filter
    if (filterRole.value) result = result.filter(u => u.role === filterRole.value)

    // Status filter
    if (filterStatus.value) result = result.filter(u => u.status === filterStatus.value)

    // Email domain filter
    if (filterDomain.value) {
      result = result.filter(u => u.email.toLowerCase().includes(filterDomain.value.toLowerCase()))
    }

    // Sorting
    result = [...result].sort((a, b) => {
      const aVal = String(a[sortField.value as keyof User] || '').toLowerCase()
      const bVal = String(b[sortField.value as keyof User] || '').toLowerCase()
      const dir = sortDir.value === 'asc' ? 1 : -1
      return aVal < bVal ? -dir : aVal > bVal ? dir : 0
    })

    return result
  })

  const totalFiltered = computed(() => filteredUsers.value.length)
  const selectedCount = computed(() => selectedIds.value.length)

  // ===== ACTIONS =====

  // Load users from JSONPlaceholder API
  async function fetchUsers(reset = false) {
    if (reset) {
      allUsers.value = []
      currentPage.value = 1
      hasMore.value = true
      selectedIds.value = []
      selectAll.value = false
    }

    if (!hasMore.value) return
    // During a reset/initial load, use isLoading. During scroll, loadMore handles isLoadingMore.
    if (isLoading.value || isLoadingMore.value) return

    // RACE CONDITION FIX: cancel any previous in-flight request
    if (abortController) abortController.abort()
    abortController = new AbortController()

    // Show the right loading indicator
    if (reset || allUsers.value.length === 0) {
      isLoading.value = true
    } else {
      isLoadingMore.value = true
    }
    error.value = null

    try {
      // Use native fetch() so we can pass AbortController signal
      const response = await fetch(
        `https://jsonplaceholder.typicode.com/users`,
        { signal: abortController.signal }
      )
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const users: any[] = await response.json()

      // Simulate more pages by duplicating and altering IDs
      const pageOffset = (currentPage.value - 1) * PAGE_SIZE
      const pageUsers = [...users, ...users, ...users, ...users, ...users]
        .slice(pageOffset, pageOffset + PAGE_SIZE)
        .map((u, i) => enrichUser(u, pageOffset + i))
        .map((u, i) => ({ ...u, id: pageOffset * 100 + i + 1 }))

      allUsers.value = reset ? pageUsers : [...allUsers.value, ...pageUsers]

      // After 5 pages (50 users), pretend there's no more data
      hasMore.value = currentPage.value < 5
      currentPage.value++

      // Save to localStorage for offline cache
      saveCache(allUsers.value)

    } catch (e: any) {
      if (e?.name === 'AbortError') return // Intentional cancel — not an error

      // Try loading from cache if offline
      const cached = loadCache()
      if (cached?.length) {
        allUsers.value = cached
        isOffline.value = true
        error.value = 'You are offline. Showing cached data.'
      } else {
        error.value = 'Failed to load users. Please check your connection.'
      }
    } finally {
      isLoading.value = false
      isLoadingMore.value = false
    }
  }

  // Load MORE users (called by infinite scroll sentinel)
  async function loadMore() {
    if (isLoadingMore.value || isLoading.value || !hasMore.value) return
    await fetchUsers(false)
  }

  // Delete a single user
  function deleteUser(id: number) {
    if (!deletedIds.value.includes(id)) deletedIds.value.push(id)
    selectedIds.value = selectedIds.value.filter(sid => sid !== id)
  }

  // Delete all selected users
  function deleteSelected() {
    selectedIds.value.forEach(id => {
      if (!deletedIds.value.includes(id)) deletedIds.value.push(id)
    })
    selectedIds.value = []
    selectAll.value = false
  }

  // Toggle row selection
  function toggleSelect(id: number) {
    const idx = selectedIds.value.indexOf(id)
    if (idx !== -1) {
      selectedIds.value.splice(idx, 1)
    } else {
      selectedIds.value.push(id)
    }
    if (selectedIds.value.length < filteredUsers.value.length) {
      selectAll.value = false
    }
  }

  // Select / deselect ALL
  function toggleSelectAll() {
    if (selectAll.value) {
      selectedIds.value = []
      selectAll.value = false
    } else {
      selectedIds.value = filteredUsers.value.map(u => u.id)
      selectAll.value = true
    }
  }

  // Export selected as CSV
  function exportSelected() {
    const selected = filteredUsers.value.filter(u => selectedIds.value.includes(u.id))
    const headers = ['ID', 'Name', 'Email', 'Role', 'Status', 'Department', 'Phone']
    const rows = selected.map(u =>
      [u.id, u.name, u.email, u.role, u.status, u.department, u.phone].join(',')
    )
    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'users-export.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  // ===== SORTING =====
  function setSort(field: SortField) {
    if (sortField.value === field) {
      // Toggle direction if same field
      sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortField.value = field
      sortDir.value = 'asc'
    }
  }

  // ===== UNDO/REDO =====
  function snapshotState(): HistoryEntry {
    return {
      search: search.value,
      filterRole: filterRole.value,
      filterStatus: filterStatus.value,
      filterDomain: filterDomain.value,
      sortField: sortField.value,
      sortDir: sortDir.value,
    }
  }

  function pushHistory() {
    // Remove any "future" states (if user did undo then changed something)
    history.value = history.value.slice(0, historyIndex.value + 1)
    history.value.push(snapshotState())
    // Limit to MAX_HISTORY entries to prevent memory issues
    if (history.value.length > MAX_HISTORY) history.value.shift()
    historyIndex.value = history.value.length - 1
  }

  function undo() {
    if (historyIndex.value <= 0) return
    historyIndex.value--
    applyHistory(history.value[historyIndex.value])
  }

  function redo() {
    if (historyIndex.value >= history.value.length - 1) return
    historyIndex.value++
    applyHistory(history.value[historyIndex.value])
  }

  function applyHistory(entry: HistoryEntry) {
    search.value = entry.search
    filterRole.value = entry.filterRole
    filterStatus.value = entry.filterStatus
    filterDomain.value = entry.filterDomain
    sortField.value = entry.sortField
    sortDir.value = entry.sortDir
  }

  const canUndo = computed(() => historyIndex.value > 0)
  const canRedo = computed(() => historyIndex.value < history.value.length - 1)

  // ===== COLUMN ORDER PERSISTENCE =====
  function saveColumnOrder() {
    if (import.meta.client) {
      localStorage.setItem('column_order', JSON.stringify(columnOrder.value))
    }
  }

  function loadColumnOrder() {
    if (import.meta.client) {
      const saved = localStorage.getItem('column_order')
      if (saved) {
        try { columnOrder.value = JSON.parse(saved) } catch {}
      }
    }
  }

  // ===== OFFLINE CACHE =====
  function saveCache(users: User[]) {
    if (import.meta.client) {
      localStorage.setItem('users_cache', JSON.stringify(users))
      localStorage.setItem('users_cache_time', Date.now().toString())
    }
  }

  function loadCache(): User[] | null {
    if (!import.meta.client) return null
    try {
      const data = localStorage.getItem('users_cache')
      return data ? JSON.parse(data) : null
    } catch { return null }
  }

  // ===== BROADCAST CHANNEL (multi-tab sync) =====
  // BroadcastChannel lets different browser tabs communicate
  let channel: BroadcastChannel | null = null

  function initBroadcast() {
    if (!import.meta.client || !('BroadcastChannel' in window)) return

    channel = new BroadcastChannel('user_explorer_sync')

    // Listen for changes from OTHER tabs
    channel.onmessage = (event) => {
      const { type, payload } = event.data
      if (type === 'FILTER_CHANGE') {
        search.value = payload.search
        filterRole.value = payload.filterRole
        filterStatus.value = payload.filterStatus
        filterDomain.value = payload.filterDomain
      }
    }
  }

  // Broadcast current filter state to other tabs
  function broadcastFilters() {
    channel?.postMessage({
      type: 'FILTER_CHANGE',
      payload: { search: search.value, filterRole: filterRole.value,
                 filterStatus: filterStatus.value, filterDomain: filterDomain.value }
    })
  }

  function closeBroadcast() {
    channel?.close()
    channel = null
  }

  return {
    // State
    allUsers, isLoading, isLoadingMore, error, hasMore, isOffline,
    search, filterRole, filterStatus, filterDomain, sortField, sortDir,
    selectedIds, selectAll, columnOrder, history, historyIndex,
    // Getters
    filteredUsers, totalFiltered, selectedCount, canUndo, canRedo,
    // Actions
    fetchUsers, loadMore, deleteUser, deleteSelected,
    toggleSelect, toggleSelectAll, exportSelected,
    setSort, pushHistory, undo, redo,
    saveColumnOrder, loadColumnOrder,
    initBroadcast, broadcastFilters, closeBroadcast,
    loadCache
  }
})
