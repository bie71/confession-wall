<template>
  <div :class="['relative min-h-screen overflow-hidden transition-colors duration-300', themeClasses.root]">
    <div class="pointer-events-none absolute inset-0">
      <div :class="['absolute -top-24 -right-10 h-80 w-80 rounded-full blur-[120px]', themeClasses.accentTop]"></div>
      <div :class="['absolute bottom-0 left-1/3 h-72 w-72 rounded-full blur-[120px]', themeClasses.accentBottom]"></div>
    </div>

    <main class="relative z-10 mx-auto grid max-w-[100rem] gap-6 px-6 py-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.2fr)] lg:items-start">
      <div class="flex flex-col gap-6 lg:sticky lg:top-8 lg:pr-3">
        <section :class="['rounded-[32px] border p-6 backdrop-blur', themeClasses.card, themeClasses.shadow]">
          <header class="flex flex-col gap-6">
            <div class="space-y-3">
              <div class="flex items-center gap-2 text-sm tracking-[0.3em] text-emerald-300">
                <span class="material-symbols-outlined text-base">forum</span>
                CONFESSION WALL
              </div>
              <h1 :class="['text-3xl font-semibold md:text-4xl', themeClasses.heading]">
                Tuangkan cerita, dengarkan komunitas.
              </h1>
              <p :class="themeClasses.muted">
                Kirim pesan anonim, dukung cerita lain, dan bantu moderator menyeleksi kiriman yang pantas
                tampil di halaman publik.
              </p>
            </div>
            <div :class="['rounded-2xl border p-4', themeClasses.fieldWrapper]">
              <label :class="['text-xs font-semibold uppercase tracking-widest', themeClasses.label]">Admin token</label>
              <input
                v-model="adminToken"
                type="password"
                placeholder="Masukkan token"
                :class="themeClasses.input"
              />
              <p :class="['mt-2 text-xs min-h-[1.25rem]', themeClasses.subtle]" v-if="adminState.checking">Memeriksa token...</p>
              <p :class="['mt-2 text-xs min-h-[1.25rem]', themeClasses.success]" v-else-if="adminState.valid">Token valid. Hak admin aktif.</p>
              <p :class="['mt-2 text-xs min-h-[1.25rem]', themeClasses.error]" v-else-if="adminState.error">{{ adminState.error }}</p>
              <p :class="['mt-2 text-xs min-h-[1.25rem]', themeClasses.subtle]" v-else>Token disimpan aman di browser kamu.</p>
            </div>
          </header>

          <dl class="mt-6 grid gap-4 sm:grid-cols-3">
            <div :class="['rounded-2xl border p-4', themeClasses.cardSoft]">
              <dt :class="['text-xs uppercase tracking-widest', themeClasses.label]">Total data</dt>
              <dd :class="['text-3xl font-semibold', themeClasses.heading]">{{ wall.total }}</dd>
              <p :class="['text-xs', themeClasses.subtle]">Hasil dari filter saat ini.</p>
            </div>
            <div :class="['rounded-2xl border p-4', themeClasses.cardSoft]">
              <dt :class="['text-xs uppercase tracking-widest', themeClasses.label]">Sedang tampil</dt>
              <dd :class="['text-3xl font-semibold', themeClasses.heading]">{{ visibleCount }}</dd>
              <p :class="['text-xs', themeClasses.subtle]">Scroll ke bawah untuk muat lebih banyak.</p>
            </div>
            <div :class="['rounded-2xl border p-4', themeClasses.cardSoft]">
              <dt :class="['text-xs uppercase tracking-widest', themeClasses.label]">Halaman aktif</dt>
              <dd :class="['text-xl font-semibold', themeClasses.heading]">#{{ currentPage }} / {{ totalPages }}</dd>
              <p :class="['text-xs', themeClasses.subtle]">Mode: {{ statusLabel }} · {{ wall.limit }} item per batch.</p>
            </div>
          </dl>
        </section>

        <ConfessionForm :theme="theme" />
      </div>

      <section class="flex flex-col gap-5">
        <Toolbar :is-admin="isAdmin" :theme="theme" @toggle-theme="toggleTheme" />

        <div :class="['rounded-[32px] border p-5 backdrop-blur', themeClasses.card, themeClasses.shadow]">
          <div :class="['flex flex-wrap items-center justify-between gap-3 text-sm', themeClasses.textBody]">
            <p>
              Menampilkan <span :class="themeClasses.heading">{{ visibleCount }}</span> dari
              <span :class="themeClasses.heading">{{ wall.total }}</span> confession.
            </p>
            <button
              type="button"
              :class="['inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300 transition', theme === 'light' ? 'hover:text-emerald-600' : 'hover:text-white']"
              @click="wall.refresh()"
            >
              <span class="material-symbols-outlined text-base">refresh</span>
              Segarkan data
            </button>
          </div>
          <div :class="['mt-3 flex flex-wrap items-center gap-3 text-xs', themeClasses.subtle]">
            <span>Halaman {{ currentPage }} dari {{ totalPages }}</span>
            <span class="hidden sm:inline">•</span>
            <span>{{ wall.limit }} data per muatan · scroll / tombol di bawah untuk halaman selanjutnya.</span>
          </div>
        </div>

        <div v-if="wall.loading && !wall.items.length" class="grid gap-4">
          <div v-for="i in 3" :key="i" class="h-32 animate-pulse rounded-[28px] border border-white/5 bg-white/10"></div>
        </div>

        <TransitionGroup name="card" tag="div" class="grid gap-4">
          <ConfessionCard
            v-for="it in wall.items"
            :key="it.id"
            :item="it"
            :admin-token="adminToken"
            :theme="theme"
            @vote="(v) => vote(it.id, v)"
            @approve="approve(it.id)"
            @reject="reject(it.id)"
            @remove="remove(it.id)"
          />
        </TransitionGroup>

        <div
          v-if="!wall.loading && !wall.items.length"
          :class="['rounded-[28px] border border-dashed p-8 text-center', themeClasses.card]"
        >
          <span class="material-symbols-outlined mb-2 text-4xl text-emerald-400">inbox</span>
          <p :class="['text-lg font-medium', themeClasses.heading]">{{ emptyCopy.title }}</p>
          <p :class="['text-sm', themeClasses.muted]">{{ emptyCopy.body }}</p>
        </div>

        <div v-if="wall.hasMore" class="pt-2 text-center">
          <button
            ref="loadMoreRef"
            :class="loadMoreButtonClass"
            :disabled="wall.loading"
            @click="manualLoad"
          >
            <span class="material-symbols-outlined text-base transition group-hover:text-emerald-300">
              {{ wall.loading ? "motion_photos_pause" : "expand_more" }}
            </span>
            {{ wall.loading ? "Memuat..." : "Muat lagi" }}
          </button>
          <p :class="['mt-2 text-xs', themeClasses.subtle]">Setiap klik memuat 10 confession berikutnya.</p>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import { wall } from "./store/wall";
import { api } from "./lib/api";
import Toolbar from "./components/Toolbar.vue";
import ConfessionForm from "./components/ConfessionForm.vue";
import ConfessionCard from "./components/ConfessionCard.vue";

type Theme = "dark" | "light";

const loadMoreRef = ref<HTMLButtonElement | null>(null);
let observer: IntersectionObserver | null = null;

const adminToken = ref(localStorage.getItem("adminToken") ?? "");
const adminState = reactive({ valid: false, checking: false, error: "" });
const isAdmin = computed(() => adminState.valid);
const theme = ref<Theme>((localStorage.getItem("theme") as Theme) || "dark");
const THEME_PRESETS = {
  dark: {
    root: "bg-slate-950 text-slate-50",
    accentTop: "bg-emerald-500/25",
    accentBottom: "bg-sky-500/10",
    card: "border-white/10 bg-white/5 text-white",
    cardSoft: "border-white/10 bg-slate-900/40 text-white",
    heading: "text-white",
    muted: "text-slate-300",
    subtle: "text-slate-400",
    textBody: "text-slate-400",
    label: "text-slate-400",
    fieldWrapper: "border-white/10 bg-slate-900/40",
    input:
      "mt-2 w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none",
    shadow: "shadow-[0_25px_60px_rgba(2,6,23,0.65)]",
    success: "text-emerald-300",
    error: "text-rose-400",
  },
  light: {
    root: "bg-slate-50 text-slate-900",
    accentTop: "bg-emerald-300/40",
    accentBottom: "bg-sky-200/50",
    card: "border-slate-200 bg-white text-slate-900",
    cardSoft: "border-slate-200 bg-slate-100 text-slate-900",
    heading: "text-slate-900",
    muted: "text-slate-600",
    subtle: "text-slate-500",
    textBody: "text-slate-600",
    label: "text-slate-500",
    fieldWrapper: "border-slate-200 bg-white",
    input:
      "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none",
    shadow: "shadow-[0_12px_32px_rgba(15,23,42,0.12)]",
    success: "text-emerald-600",
    error: "text-rose-500",
  },
} as const;
const themeClasses = computed(() => THEME_PRESETS[theme.value]);
const toggleTheme = () => {
  theme.value = theme.value === "dark" ? "light" : "dark";
};
const loadMoreButtonClass = computed(() =>
  theme.value === "light"
    ? "group inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-2 text-sm font-semibold text-slate-900 transition hover:border-emerald-400 hover:bg-emerald-50"
    : "group inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-2 text-sm font-semibold text-white transition hover:border-emerald-300 hover:bg-emerald-400/10"
);

const visibleCount = computed(() => wall.items.length);
const statusMap: Record<string, string> = {
  APPROVED: "Publik",
  PENDING: "Antrian",
  REJECTED: "Ditolak",
};
const statusLabel = computed(() => statusMap[wall.status] ?? "Publik");
const currentPage = computed(() => {
  if (!wall.items.length) return 1;
  return Math.max(1, wall.page - 1);
});
const totalPages = computed(() => {
  const total = wall.total || 0;
  const limit = wall.limit || 10;
  return Math.max(1, Math.ceil(total / limit));
});
const emptyCopy = computed(() => {
  if (wall.status === "PENDING") {
    return { title: "Belum ada yang menunggu moderasi.", body: "Semua kiriman baru akan muncul di sini." };
  }
  if (wall.status === "REJECTED") {
    return { title: "Tidak ada kiriman ditolak.", body: "Semoga semua confession tetap positif :)" };
  }
  return { title: "Belum ada confession.", body: "Jadilah yang pertama menulis lewat formulir di atas." };
});

watch(theme, (val) => {
  localStorage.setItem("theme", val);
});

const resetToPublic = () => {
  if (wall.status !== "APPROVED") {
    wall.status = "APPROVED";
    wall.refresh();
  }
};

let verifyTimer: ReturnType<typeof setTimeout> | null = null;
let verifyRequestId = 0;
const verifyAdminToken = async () => {
  const token = adminToken.value.trim();
  const requestId = ++verifyRequestId;
  if (!token) {
    if (verifyTimer) {
      clearTimeout(verifyTimer);
      verifyTimer = null;
    }
    if (requestId === verifyRequestId) {
      adminState.valid = false;
      adminState.error = "";
      adminState.checking = false;
      localStorage.removeItem("adminToken");
      resetToPublic();
    }
    return;
  }
  adminState.checking = true;
  adminState.error = "";
  try {
    await api.verifyAdmin(token);
    if (requestId === verifyRequestId) {
      adminState.valid = true;
      adminState.error = "";
      localStorage.setItem("adminToken", token);
    }
  } catch (err) {
    if (requestId === verifyRequestId) {
      adminState.valid = false;
      adminState.error = "Token salah atau tidak sah.";
      localStorage.removeItem("adminToken");
      resetToPublic();
    }
  } finally {
    if (requestId === verifyRequestId) {
      adminState.checking = false;
    }
  }
};

watch(
  adminToken,
  () => {
    if (verifyTimer) clearTimeout(verifyTimer);
    verifyTimer = setTimeout(() => {
      verifyAdminToken();
    }, 400);
  },
  { immediate: true }
);

const requireAdmin = () => {
  if (!adminState.valid) {
    alert(adminState.error || "Masukkan token admin yang benar.");
    return false;
  }
  return true;
};

const vote = async (id: number, value: 1 | -1) => {
  await api.vote(id, value);
  wall.refresh();
};
const approve = async (id: number) => {
  if (!requireAdmin()) return;
  await api.approve(id, adminToken.value);
  wall.refresh();
};
const reject = async (id: number) => {
  if (!requireAdmin()) return;
  await api.reject(id, adminToken.value);
  wall.refresh();
};
const remove = async (id: number) => {
  if (!requireAdmin()) return;
  const ok = await api.remove(id, adminToken.value);
  if (!ok) alert("Gagal hapus (token salah?)");
  wall.refresh();
};

const manualLoad = () => {
  if (!wall.loading) wall.loadMore();
};

const observeLoadMore = () => {
  if (observer) observer.disconnect();
  observer = new IntersectionObserver(
    (entries) => {
      const [entry] = entries;
      if (entry?.isIntersecting && wall.hasMore && !wall.loading) {
        wall.loadMore();
      }
    },
    { rootMargin: "200px" }
  );
  if (loadMoreRef.value) observer.observe(loadMoreRef.value);
};

watch(
  () => loadMoreRef.value,
  () => observeLoadMore()
);

onMounted(() => {
  wall.refresh();
  wall.connectWS();
  observeLoadMore();
});

onBeforeUnmount(() => {
  observer?.disconnect();
});
</script>
