# 🔭 UserExplorer — Nuxt 3 Frontend Assignment

A production-grade user data exploration module built with **Nuxt 3**, **Vue 3 Composition API**, **Pinia**, and **Tailwind CSS**.

---

## 🚀 How to Run

### Prerequisites
- Node.js 18+ 
- npm or pnpm

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open http://localhost:3000
```

### Demo Credentials
```
Email:    demo@explorer.com
Password: demo1234
```

---

## 📁 Project Structure

```
user-explorer/
├── assets/css/
│   └── main.css           # Global styles, Tailwind config
├── components/
│   ├── AppNavbar.vue       # Top navigation bar
│   ├── table/
│   │   ├── DataTable.vue   # Main table with drag-drop columns
│   │   └── TableToolbar.vue# Search, filters, bulk actions
│   └── ui/
│       ├── SkeletonRow.vue # Loading placeholder
│       ├── EmptyState.vue  # No results UI
│       └── ErrorState.vue  # Error with retry
├── layouts/
│   ├── default.vue         # App shell with navbar
│   └── auth.vue            # Centered card layout for auth
├── middleware/
│   └── auth.ts             # Route protection
├── pages/
│   ├── index.vue           # Landing page
│   ├── login.vue           # Sign in
│   ├── signup.vue          # Sign up
│   └── users.vue           # Main feature page (protected)
├── plugins/
│   └── auth.client.ts      # Client-side auth init
├── stores/
│   ├── auth.ts             # Authentication state (Pinia)
│   └── users.ts            # Users data + table state (Pinia)
├── app.vue                 # Root component
├── nuxt.config.ts          # Nuxt configuration
└── tailwind.config.ts      # Tailwind configuration
```

---

## ✅ Feature Checklist

### 1. Authentication System
- [x] Sign Up page (`/signup`) with name, email, password, strength indicator
- [x] Sign In page (`/login`) with demo credentials helper
- [x] Route protection middleware (`middleware/auth.ts`) — redirects to `/login`
- [x] Persistence via `localStorage` (survives page refresh)
- [x] Logout button in navbar

### 2. Data Fetching (Nuxt-Specific)
- [x] Uses JSONPlaceholder API with `$fetch` (Nuxt's native fetch)
- [x] SSR-compatible (data fetched server-side first)
- [x] Loading state (skeleton rows)
- [x] Error state with retry button
- [x] Simulated pagination (5 pages × 10 users = 50 total)

### 3. Advanced Data Table
- [x] **Search**: Debounced (300ms), case-insensitive, searches name/email/username
- [x] **Sorting**: Name, Email, Role, Status — toggle ASC/DESC with arrows
- [x] **Filtering**: Role dropdown + Status dropdown + Email domain text filter
- [x] **Column Reordering**: Native HTML5 drag & drop on headers, persisted to localStorage
- [x] **Row Deletion**: Hover to reveal delete button, removes row immediately

### 4. Infinite Scrolling
- [x] `IntersectionObserver` via `@vueuse/core`'s `useIntersectionObserver`
- [x] Sentinel div at table bottom triggers `loadMore()`
- [x] Prevents duplicate requests (`isLoadingMore` guard)
- [x] "All users loaded" message when `hasMore === false`

### 5. URL State Synchronization
- [x] All filters sync to URL: `/users?search=john&role=Admin&sort=email&dir=asc`
- [x] Refresh → state persists (URL re-read on mount)
- [x] Browser back/forward → store updates via `watch(route.query)`
- [x] Changing search resets scroll position to top

### 6. Bulk Actions & Selection
- [x] Checkboxes on every row
- [x] "Select All" selects all filtered users (even unloaded ones handled via selectAll flag)
- [x] Delete Selected removes all selected users
- [x] Export Selected generates a CSV download

### 7. Real-Time Search / Race Conditions
- [x] `AbortController` cancels previous in-flight fetch when new search triggers
- [x] Aborted requests are silently ignored (not shown as errors)
- [x] Only the latest result is shown

### 8. Offline Support & Multi-Tab Sync
- [x] Successful fetch results cached to `localStorage`
- [x] On error, cached data loaded + offline banner shown
- [x] `BroadcastChannel` API syncs filter changes across open tabs

### 9. Undo / Redo
- [x] Every search/filter change pushes to history array
- [x] `undo()` and `redo()` step through history
- [x] Limited to 50 entries to prevent memory issues
- [x] Keyboard shortcuts: `Ctrl+Z` (undo), `Ctrl+Y` (redo)

### 10. Performance & UX
- [x] Skeleton loader during initial load
- [x] Empty state with clear action
- [x] Error state with retry
- [x] Previous data stays visible while loading more (infinite scroll)
- [x] `loadingMore` spinner separate from main `loading` state
- [x] `AbortController` prevents stale responses from appearing

### 11. Code Structure
- [x] Stores (Pinia) handle all business logic
- [x] Components only handle presentation
- [x] Reusable UI components (`SkeletonRow`, `EmptyState`, `ErrorState`)
- [x] TypeScript interfaces for User type

---

## 🧠 Architecture Decisions

### Why Pinia over Vuex?
Pinia is Vue 3's official state management. It uses the Composition API (same as our components), has built-in TypeScript support, and is simpler with no mutations — just actions directly modify state.

### Why localStorage over Cookies for Auth?
For simplicity in this demo. In production, you'd use `httpOnly` cookies set by the server so JavaScript can't access the token (prevents XSS attacks).

### How "Select All" handles unloaded data
`selectAll` is a boolean flag in the store. When true, the delete/export functions treat ALL filtered users (even pages not yet loaded) as selected. This avoids having to load everything first.

### How race conditions are handled
Each search triggers a new `AbortController`. Before making a new fetch, we call `abortController.abort()` on any existing controller. The `catch` block checks if the error is an `AbortError` and ignores it — so only the LATEST request completes.

### URL ↔ Store sync
Two `watch()` calls:
1. Watches store state → updates URL with `router.replace()` (no browser history entry)
2. Watches `route.query` → updates store (fires on back/forward navigation)

### Why `BroadcastChannel` for multi-tab sync?
`BroadcastChannel` is a native browser API that lets same-origin tabs communicate. When you change a filter, we `postMessage` the new filter state to the channel. Other tabs listen and apply the update to their store.

---

## ⚠️ Known Limitations

1. **Mock auth only** — passwords stored in `localStorage` in plain text. This is for demo only. Real apps use hashed passwords on a secure backend.
2. **JSONPlaceholder** has only 10 users. We simulate more by duplicating/reindexing them. Real apps would paginate from a backend.
3. **No real SSR auth** — server-side auth would require cookies, not localStorage (which is browser-only). The middleware partially handles this.
4. **No real-time updates** — multi-tab sync only syncs filters, not data changes. A real app might use WebSockets.
5. **Column reorder not available** on mobile (drag & drop requires pointer device).

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| Nuxt 3 | Framework (SSR, routing, auto-imports) |
| Vue 3 Composition API | UI components |
| Pinia | State management |
| Tailwind CSS | Utility-first styling |
| @vueuse/core | Composable utilities (debounce, intersection observer) |
| JSONPlaceholder | Mock REST API |
| TypeScript | Type safety |

---

*Built as a frontend intern assignment demonstrating production patterns in Nuxt 3.*
