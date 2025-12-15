import { ref, computed } from 'vue';

export type Theme = 'dark' | 'light';

const THEME_PRESETS = {
  dark: {
    root: 'bg-slate-950 text-slate-50',
    accentTop: 'bg-emerald-500/25',
    accentBottom: 'bg-sky-500/10',
    card: 'border-white/10 bg-white/5 text-white',
    cardSoft: 'border-white/10 bg-slate-900/40 text-white',
    heading: 'text-white',
    muted: 'text-slate-300',
    subtle: 'text-slate-400',
    textBody: 'text-slate-400',
    label: 'text-slate-400',
    fieldWrapper: 'border-white/10 bg-slate-900/40',
    input: 'mt-2 w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none',
    shadow: 'shadow-[0_25px_60px_rgba(2,6,23,0.65)]',
    success: 'text-emerald-300',
    error: 'text-rose-400',
  },
  light: {
    root: 'bg-slate-50 text-slate-900',
    accentTop: 'bg-emerald-300/40',
    accentBottom: 'bg-sky-200/50',
    card: 'border-slate-200 bg-white text-slate-900',
    cardSoft: 'border-slate-200 bg-slate-100 text-slate-900',
    heading: 'text-slate-900',
    muted: 'text-slate-600',
    subtle: 'text-slate-500',
    textBody: 'text-slate-600',
    label: 'text-slate-500',
    fieldWrapper: 'border-slate-200 bg-white',
    input: 'mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none',
    shadow: 'shadow-[0_12px_32px_rgba(15,23,42,0.12)]',
    success: 'text-emerald-600',
    error: 'text-rose-500',
  },
} as const;

export function useTheme() {
  const theme = ref<Theme>((localStorage.getItem('theme') as Theme) || 'dark');
  const themeClasses = computed(() => THEME_PRESETS[theme.value]);

  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', theme.value);
  }

  return {
    theme,
    themeClasses,
    toggleTheme,
  };
}
