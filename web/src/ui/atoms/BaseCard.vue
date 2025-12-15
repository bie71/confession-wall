<template>
  <component :is="tag" :class="['rounded-[28px] border p-5 backdrop-blur', themeClasses.container, themeClasses.shadow]">
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  tag?: string;
  theme: 'dark' | 'light';
}>(), {
  tag: 'article'
});

const themeMap = {
  dark: {
    container: 'border-white/10 bg-slate-900/60 text-slate-100',
    shadow: 'shadow-[0_20px_40px_rgba(2,6,23,0.65)]',
  },
  light: {
    container: 'border-slate-200 bg-white text-slate-900',
    shadow: 'shadow-[0_12px_28px_rgba(15,23,42,0.12)]',
  },
} as const;

const themeClasses = computed(() => themeMap[props.theme ?? 'dark']);
</script>
