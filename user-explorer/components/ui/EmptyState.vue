<!-- components/ui/EmptyState.vue -->
<!--
  TEACHING NOTE: An "empty state" is what you show when there's no data.
  Never just show a blank table - always tell users WHY it's empty
  and what they can do about it.

  This component accepts:
  - title: Main message
  - description: Explanation
  - actionLabel: Button text (optional)
  
  It also EMITS an event "action" when button is clicked.
  Events flow UPWARD (child → parent) while props flow DOWNWARD (parent → child).
-->
<template>
  <div class="flex flex-col items-center justify-center py-20 px-4 text-center animate-fadeIn">
    <!-- Illustration -->
    <div class="w-20 h-20 rounded-2xl bg-surface-800 border border-surface-700 flex items-center justify-center mb-5">
      <svg class="w-10 h-10 text-surface-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>

    <h3 class="font-display text-lg font-semibold text-surface-200 mb-2">{{ title }}</h3>
    <p class="text-sm text-surface-500 max-w-xs mb-6">{{ description }}</p>

    <!-- Action button (only shown if actionLabel is provided) -->
    <button v-if="actionLabel" @click="$emit('action')" class="btn-primary">
      {{ actionLabel }}
    </button>
  </div>
</template>

<script setup lang="ts">
// defineProps with TypeScript types
defineProps<{
  title: string
  description: string
  actionLabel?: string
}>()

// defineEmits declares what events this component can emit to its parent
defineEmits<{
  action: []
}>()
</script>
