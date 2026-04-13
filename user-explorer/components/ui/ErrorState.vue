<!-- components/ui/ErrorState.vue -->
<template>
  <div class="flex flex-col items-center justify-center py-20 px-4 text-center animate-fadeIn">
    <div class="w-20 h-20 rounded-2xl bg-red-950/50 border border-red-900/50 flex items-center justify-center mb-5">
      <svg class="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    </div>

    <h3 class="font-display text-lg font-semibold text-surface-200 mb-2">Something went wrong</h3>
    <p class="text-sm text-surface-500 max-w-xs mb-6">{{ message }}</p>

    <button @click="$emit('retry')" class="btn-primary flex items-center gap-2">
      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
      Retry
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{ message: string }>()
defineEmits<{ retry: [] }>()
</script>
