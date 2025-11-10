<template>
  <section
    :class="['rounded-[32px] border p-5 backdrop-blur transition-colors duration-300', panelClass, panelShadow]"
  >
    <div class="space-y-3">
      <div :class="['flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.35em]', accentText]">
        <span class="material-symbols-outlined text-base">tune</span>
        Panel Filter
        <button
          type="button"
          class="ml-auto inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] transition"
          :class="themeButtonClass"
          @click="$emit('toggle-theme')"
        >
          <span class="material-symbols-outlined text-base">{{ theme === "light" ? "dark_mode" : "light_mode" }}</span>
          {{ theme === "light" ? "Dark" : "Light" }}
        </button>
      </div>
      <div class="relative">
        <span
          class="material-symbols-outlined pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-500"
        >
          search
        </span>
        <input
          v-model="q"
          type="search"
          placeholder="Cari nama atau isi confession..."
          :class="inputClass"
          @keyup.enter="apply(true)"
        />
      </div>
    </div>

    <div
      v-if="canFilterStatus"
      :class="['mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em]', chipLabel]"
    >
      <span>Status:</span>
      <button
        v-for="opt in statusOptions"
        :key="opt.value"
        class="rounded-full border px-4 py-1 text-[11px] transition"
        :class="
          status === opt.value
            ? 'border-emerald-300 bg-emerald-400/10 text-emerald-700'
            : inactiveChip
        "
        type="button"
        @click="setStatus(opt.value)"
      >
        {{ opt.label }}
      </button>
    </div>

    <div class="mt-5 flex flex-wrap items-center gap-3">
      <a
        :href="exportHref"
        target="_blank"
        :class="['inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold transition', ghostButton]"
      >
        <span class="material-symbols-outlined text-base">download</span>
        Export CSV
      </a>
      <button
        type="button"
        :class="['rounded-2xl border px-4 py-2 text-sm font-semibold transition', ghostButton]"
        @click="resetFilters"
      >
        Reset
      </button>
      <button
        type="button"
        :class="['rounded-2xl px-5 py-2 text-sm font-semibold transition', primaryButton]"
        @click="apply(true)"
      >
        Terapkan
      </button>
    </div>
  </section>
</template>
<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { wall } from "../store/wall";
import { api } from "../lib/api";

const props = defineProps<{ isAdmin: boolean; theme: "dark" | "light" }>();
defineEmits<{
  (e: "toggle-theme"): void;
}>();

const q = ref(wall.q);
const status = ref(wall.status);
const statusOptions = [
  { value: "APPROVED", label: "Publik" },
  { value: "PENDING", label: "Pending" },
  { value: "REJECTED", label: "Ditolak" },
];
const canFilterStatus = computed(() => props.isAdmin);
const exportHref = computed(() => api.exportUrl({ q: wall.q, status: wall.status }));
const panelClass = computed(() =>
  props.theme === "light" ? "border-slate-200 bg-white text-slate-900" : "border-white/10 bg-white/10 text-slate-200"
);
const panelShadow = computed(() =>
  props.theme === "light"
    ? "shadow-[0_12px_28px_rgba(15,23,42,0.12)]"
    : "shadow-[0_25px_60px_rgba(2,6,23,0.35)]"
);
const accentText = computed(() => (props.theme === "light" ? "text-slate-600" : "text-slate-400"));
const chipLabel = computed(() => (props.theme === "light" ? "text-slate-600" : "text-slate-300"));
const inactiveChip = computed(() =>
  props.theme === "light"
    ? "border-slate-200 bg-slate-100 text-slate-500 hover:text-slate-800"
    : "border-white/10 bg-white/5 text-slate-400 hover:text-white"
);
const inputClass = computed(() =>
  props.theme === "light"
    ? "w-full rounded-2xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-300 focus:outline-none"
    : "w-full rounded-2xl border border-white/15 bg-slate-900/50 py-3 pl-12 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-emerald-300 focus:outline-none"
);
const ghostButton = computed(() =>
  props.theme === "light"
    ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
    : "border-white/15 bg-white/5 text-slate-200 hover:bg-white/10"
);
const primaryButton = computed(() =>
  props.theme === "light"
    ? "bg-emerald-500 text-white hover:bg-emerald-400"
    : "bg-emerald-400/90 text-emerald-950 hover:bg-emerald-300"
);
const themeButtonClass = computed(() =>
  props.theme === "light"
    ? "border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
    : "border-white/20 bg-white/5 text-slate-200 hover:bg-white/10"
);

watch(
  () => wall.q,
  (val) => {
    q.value = val;
  }
);
watch(
  () => wall.status,
  (val) => {
    status.value = val;
  }
);

let debounce: ReturnType<typeof setTimeout> | undefined;
watch(q, () => {
  if (debounce) clearTimeout(debounce);
  debounce = setTimeout(() => apply(), 450);
});

const apply = (force = false) => {
  const nextQ = q.value.trim();
  const nextStatus = canFilterStatus.value ? status.value : "APPROVED";
  const needRefresh = force || nextQ !== wall.q || nextStatus !== wall.status;
  wall.q = nextQ;
  wall.status = nextStatus;
  if (needRefresh) wall.refresh();
};

const resetFilters = () => {
  q.value = "";
  status.value = "APPROVED";
  apply(true);
};

const setStatus = (value: string) => {
  status.value = value;
  apply(true);
};
</script>
