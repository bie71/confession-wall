<template>
  <div v-if="message" class="p-3 my-2 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800" role="alert">
    <span class="font-medium">{{ message }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  message: string | null;
}>();
</script>
