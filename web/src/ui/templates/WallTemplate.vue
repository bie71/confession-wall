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
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { storeToRefs } from 'pinia';
import { useWallStore } from '../../data/stores/wallStore';
import { useTheme } from '../composables/useTheme';
import { useAdmin } from '../composables/useAdmin';
import { confessionApiRepository } from '../../data/repositories/ConfessionApiRepository';

import Toolbar from "../organisms/Toolbar.vue";
import ConfessionForm from "../organisms/ConfessionForm.vue";
import ConfessionCard from "../organisms/ConfessionCard.vue";

const wall = useWallStore();
const { items, total, page, limit, loading, hasMore, totalPages, currentPage } = storeToRefs(wall);

const { theme, themeClasses, toggleTheme } = useTheme();
const { adminToken, adminState, isAdmin, requireAdmin } = useAdmin();

const loadMoreRef = ref<HTMLButtonElement | null>(null);
let observer: IntersectionObserver | null = null;

const loadMoreButtonClass = computed(() =>
  theme.value === "light"
    ? "group inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-2 text-sm font-semibold text-slate-900 transition hover:border-emerald-400 hover:bg-emerald-50"
    : "group inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-2 text-sm font-semibold text-white transition hover:border-emerald-300 hover:bg-emerald-400/10"
);

const visibleCount = computed(() => items.value.length);
const statusMap: Record<string, string> = {
  APPROVED: "Publik",
  PENDING: "Antrian",
  REJECTED: "Ditolak",
};
const statusLabel = computed(() => statusMap[wall.status] ?? "Publik");

const emptyCopy = computed(() => {
  if (wall.status === "PENDING") {
    return { title: "Belum ada yang menunggu moderasi.", body: "Semua kiriman baru akan muncul di sini." };
  }
  if (wall.status === "REJECTED") {
    return { title: "Tidak ada kiriman ditolak.", body: "Semoga semua confession tetap positif :)" };
  }
  return { title: "Belum ada confession.", body: "Jadilah yang pertama menulis lewat formulir di atas." };
});

const vote = async (id: number, value: 1 | -1) => {
  try {
    await confessionApiRepository.vote(id, value);
    // The WS will update the UI, but we can refresh for immediate feedback if needed
    // wall.refresh();
  } catch (error) {
    alert((error as Error).message);
  }
};
const approve = async (id: number) => {
  if (!requireAdmin()) return;
  try {
    await confessionApiRepository.approve(id, adminToken.value);
    wall.refresh();
  } catch (error) {
    alert((error as Error).message);
  }
};
const reject = async (id: number) => {
  if (!requireAdmin()) return;
  try {
    await confessionApiRepository.reject(id, adminToken.value);
    wall.refresh();
  } catch (error) {
    alert((error as Error).message);
  }
};
const remove = async (id: number) => {
  if (!requireAdmin()) return;
  try {
    await confessionApiRepository.remove(id, adminToken.value);
  } catch (error) {
    alert('Gagal hapus. ' + (error as Error).message);
  }
};

const manualLoad = () => {
  if (!loading.value) wall.loadMore();
};

const observeLoadMore = () => {
  if (observer) observer.disconnect();
  observer = new IntersectionObserver(
    (entries) => {
      const [entry] = entries;
      if (entry?.isIntersecting && hasMore.value && !loading.value) {
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
