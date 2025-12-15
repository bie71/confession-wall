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
      <button
        v-if="isAdmin"
        type="button"
        :class="['inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold transition', ghostButton]"
        @click="handleExportCsv"
        :disabled="isExporting"
      >
        <span class="material-symbols-outlined text-base">{{ isExporting ? 'hourglass_empty' : 'download' }}</span>
        {{ isExporting ? 'Exporting...' : 'Export CSV' }}
      </button>
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
import { storeToRefs } from "pinia";
import { useWallStore } from "../../data/stores/wallStore";
import { useAuthStore } from "../../data/stores/authStore"; // Import auth store
import { confessionApiRepository } from "../../data/repositories/ConfessionApiRepository";
import type { ConfessionStatus } from "../../domain/models/Confession";

const props = defineProps<{ isAdmin: boolean; theme: "dark" | "light" }>();
defineEmits<{
  (e: "toggle-theme"): void;
}>();

const wall = useWallStore();
const { q, status } = storeToRefs(wall);
const auth = useAuthStore(); // Access auth store

const localQuery = ref(q.value);
const isExporting = ref(false);

const statusOptions = [
  { value: undefined, label: "Semua" }, // New "All" option
  { value: "APPROVED", label: "Publik" },
  { value: "PENDING", label: "Pending" },
  { value: "REJECTED", label: "Ditolak" },
];
const canFilterStatus = computed(() => props.isAdmin);

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

watch(q, (newQuery) => {
  localQuery.value = newQuery;
});

let debounce: ReturnType<typeof setTimeout> | undefined;
watch(localQuery, () => {
  if (debounce) clearTimeout(debounce);
  debounce = setTimeout(() => apply(), 450);
});

const apply = (force = false) => {
  const nextQ = localQuery.value.trim();
  let nextStatus: ConfessionStatus | undefined;

  if (canFilterStatus.value) {
    nextStatus = status.value; // Use current status if admin
  } else {
    nextStatus = "APPROVED"; // Default to APPROVED for non-admins
  }

  const needRefresh = force || nextQ !== wall.q || nextStatus !== wall.status;
  
  wall.q = nextQ;
  wall.status = nextStatus;
  
  if (needRefresh) {
    wall.refresh();
  }
};

const resetFilters = () => {
  localQuery.value = "";
  status.value = undefined; // Reset to "All"
  apply(true);
};

const setStatus = (value: ConfessionStatus | undefined) => { // Allow undefined
  status.value = value;
  apply(true);
};

const handleExportCsv = async () => {
  if (!props.isAdmin || !auth.token) {
    alert("You must be logged in as an admin to export CSV.");
    return;
  }

  isExporting.value = true;
  try {
    const params: { q?: string; status?: ConfessionStatus } = { q: q.value };
    if (status.value !== undefined) {
        params.status = status.value;
    }
    const url = confessionApiRepository.exportUrl(params);

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${auth.token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        alert("Unauthorized to export CSV. Please log in as an admin.");
        auth.logout(); // Optionally log out if token is invalid
      } else {
        const errorData = await response.json();
        alert(`Failed to export CSV: ${errorData.error || response.statusText}`);
      }
      return;
    }

    const blob = await response.blob();
    const filename = `confessions_export_${status.value || 'all'}_${new Date().toISOString()}.csv`;
    
    // Create a temporary URL and download link
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);

  } catch (error: any) {
    alert(`An error occurred during export: ${error.message}`);
  } finally {
    isExporting.value = false;
  }
};

</script>
