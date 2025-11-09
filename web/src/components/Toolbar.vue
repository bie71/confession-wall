<template>
  <section
    class="rounded-[32px] border border-white/10 bg-white/10 p-5 text-slate-900 shadow-[0_25px_60px_rgba(2,6,23,0.35)] backdrop-blur"
  >
    <div class="space-y-3 text-slate-200">
      <div class="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
        <span class="material-symbols-outlined text-sm">tune</span>
        Panel Filter
      </div>
      <div class="relative">
        <span class="material-symbols-outlined pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
          search
        </span>
        <input
          v-model="q"
          type="search"
          placeholder="Cari nama atau isi confession..."
          class="w-full rounded-2xl border border-white/15 bg-slate-900/50 py-3 pl-12 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-emerald-300 focus:outline-none"
          @keyup.enter="apply(true)"
        />
      </div>
    </div>

    <div
      v-if="canFilterStatus"
      class="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-300"
    >
      <span>Status:</span>
      <button
        v-for="opt in statusOptions"
        :key="opt.value"
        class="rounded-full border px-4 py-1 text-[11px] transition"
        :class="
          status === opt.value
            ? 'border-emerald-300 bg-emerald-400/10 text-emerald-200'
            : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'
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
        class="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
      >
        <span class="material-symbols-outlined text-base">download</span>
        Export CSV
      </a>
      <button
        type="button"
        class="rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
        @click="resetFilters"
      >
        Reset
      </button>
      <button
        type="button"
        class="rounded-2xl bg-emerald-400/90 px-5 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-300"
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

const props = defineProps<{ isAdmin: boolean }>();

const q = ref(wall.q);
const status = ref(wall.status);
const statusOptions = [
  { value: "APPROVED", label: "Publik" },
  { value: "PENDING", label: "Pending" },
  { value: "REJECTED", label: "Ditolak" },
];
const canFilterStatus = computed(() => props.isAdmin);
const exportHref = computed(() => api.exportUrl({ q: wall.q, status: wall.status }));

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
