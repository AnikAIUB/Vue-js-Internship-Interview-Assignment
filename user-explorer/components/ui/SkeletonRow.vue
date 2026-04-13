<!-- components/ui/SkeletonRow.vue -->
<!--
  TEACHING NOTE: A skeleton loader is a placeholder that shows
  while real content is loading. It looks like a "ghost" of the content.
  This is much better UX than just showing a spinner.

  We use CSS animation (shimmer) defined in main.css to make it shimmer.

  Props: In Vue, "props" are values passed FROM a parent component TO a child.
  Example: <SkeletonRow :cols="8" />  → passes cols=8 to this component
-->
<template>
  <tr class="border-b border-surface-800/50">
    <!-- Loop :cols times, creating a td for each column -->
    <td v-for="i in cols" :key="i" class="td-cell">
      <div class="flex items-center gap-2">
        <!-- First column has a circle (avatar placeholder) -->
        <div v-if="i === 1" class="skeleton w-8 h-8 rounded-full flex-shrink-0"></div>
        <!-- Random width so it looks natural -->
        <div class="skeleton h-3.5 rounded"
             :style="{ width: widths[i % widths.length] }">
        </div>
      </div>
    </td>
  </tr>
</template>

<script setup lang="ts">
// withDefaults wraps defineProps to give default values
// You only call defineProps ONCE - either bare or wrapped in withDefaults
const props = withDefaults(defineProps<{
  cols?: number  // How many columns to render (? = optional)
}>(), { cols: 8 })

// Different widths to make skeleton look more realistic
const widths = ['60%', '80%', '45%', '70%', '55%', '75%', '50%']
</script>
