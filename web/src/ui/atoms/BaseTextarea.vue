<template>
  <textarea
    :value="modelValue"
    @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    :class="['w-full rounded-2xl border px-4 py-2 focus:outline-none', themeClasses.input]">
  </textarea>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  theme: 'dark' | 'light';
  modelValue: string;
}>();

defineEmits(['update:modelValue']);

const themeMap = {
  dark: {
    input: 'border-white/15 bg-slate-900/40 text-white placeholder:text-slate-500 focus:border-emerald-400',
  },
  light: {
    input: 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-emerald-400',
  },
} as const;

const themeClasses = computed(() => themeMap[props.theme ?? 'dark']);
</script>
