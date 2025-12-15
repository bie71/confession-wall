<template>
  <button :class="['inline-flex items-center gap-2 rounded-full px-4 py-1 font-semibold transition', buttonClasses]">
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  theme: 'dark' | 'light';
  variant?: 'primary' | 'ghost' | 'voteUp' | 'voteDown' | 'danger';
}>(), {
  variant: 'primary'
});

const themeMap = {
  dark: {
    primary: 'bg-emerald-400/90 text-emerald-950 hover:bg-emerald-300',
    ghost: 'border border-white/15 text-slate-200 hover:bg-white/10',
    voteUp: 'border border-emerald-400/30 bg-emerald-400/5 text-emerald-100 hover:border-emerald-300',
    voteDown: 'border border-rose-400/30 bg-rose-400/5 text-rose-100 hover:border-rose-300',
    danger: 'border border-transparent text-rose-400 hover:bg-rose-400/10'
  },
  light: {
    primary: 'bg-emerald-500 text-white hover:bg-emerald-400',
    ghost: 'border border-slate-300 text-slate-600 hover:bg-slate-100',
    voteUp: 'border-emerald-400/40 bg-emerald-50 text-emerald-700 hover:border-emerald-300',
    voteDown: 'border-rose-400/40 bg-rose-50 text-rose-600 hover:border-rose-300',
    danger: 'border border-transparent text-rose-500 hover:bg-rose-500/10'
  },
} as const;

const buttonClasses = computed(() => {
  const themeVariant = themeMap[props.theme];
  return themeVariant[props.variant] || themeVariant.primary;
});
</script>
