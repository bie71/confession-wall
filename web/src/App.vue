<template>
  <div class="relative min-h-screen overflow-hidden bg-slate-950 text-slate-50">
    <div class="pointer-events-none absolute inset-0">
      <div class="absolute -top-24 -right-10 h-80 w-80 rounded-full bg-emerald-500/25 blur-[120px]"></div>
      <div class="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-sky-500/10 blur-[120px]"></div>
    </div>

    <main class="relative z-10 mx-auto grid max-w-7xl gap-6 px-4 py-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.2fr)]">
      <div class="flex flex-col gap-6">
        <section class="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_25px_60px_rgba(2,6,23,0.65)] backdrop-blur">
          <header class="flex flex-col gap-6">
            <div class="space-y-3">
              <div class="flex items-center gap-2 text-sm tracking-[0.3em] text-emerald-300">
                <span class="material-symbols-outlined text-base">forum</span>
                CONFESSION WALL
              </div>
              <h1 class="text-3xl font-semibold text-white md:text-4xl">
                Tuangkan cerita, dengarkan komunitas.
              </h1>
              <p class="text-slate-300">
                Kirim pesan anonim, dukung cerita lain, dan bantu moderator menyeleksi kiriman yang pantas
                tampil di halaman publik.
              </p>
            </div>
            <div class="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
              <label class="text-xs font-semibold uppercase tracking-widest text-slate-400">Admin token</label>
              <input
                v-model="adminToken"
                type="password"
                placeholder="Masukkan token"
                class="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
              />
              <p class="mt-2 text-xs text-slate-500">Token disimpan aman di browser kamu.</p>
            </div>
          </header>

          <dl class="mt-6 grid gap-4 sm:grid-cols-3">
            <div class="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
              <dt class="text-xs uppercase tracking-widest text-slate-400">Total data</dt>
              <dd class="text-3xl font-semibold text-white">{{ wall.total }}</dd>
              <p class="text-xs text-slate-500">Hasil dari filter saat ini.</p>
            </div>
            <div class="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
              <dt class="text-xs uppercase tracking-widest text-slate-400">Sedang tampil</dt>
              <dd class="text-3xl font-semibold text-white">{{ visibleCount }}</dd>
              <p class="text-xs text-slate-500">Scroll ke bawah untuk muat lebih banyak.</p>
            </div>
            <div class="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
              <dt class="text-xs uppercase tracking-widest text-slate-400">Mode tampilan</dt>
              <dd class="text-xl font-semibold text-white">{{ statusLabel }}</dd>
              <p class="text-xs text-slate-500">Ganti filter lewat panel di bawah.</p>
            </div>
          </dl>
        </section>

        <ConfessionForm />
      </div>

      <section class="flex flex-col gap-5">
        <Toolbar :is-admin="isAdmin" />

        <div class="rounded-[32px] border border-white/10 bg-white/5 p-5 shadow-[0_25px_60px_rgba(2,6,23,0.4)] backdrop-blur">
          <div class="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-400">
            <p>
              Menampilkan <span class="text-white">{{ visibleCount }}</span> dari
              <span class="text-white">{{ wall.total }}</span> confession.
            </p>
            <button
              type="button"
              class="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300 transition hover:text-white"
              @click="wall.refresh()"
            >
              <span class="material-symbols-outlined text-base">refresh</span>
              Segarkan data
            </button>
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
            @vote="(v) => vote(it.id, v)"
            @approve="approve(it.id)"
            @reject="reject(it.id)"
            @remove="remove(it.id)"
          />
        </TransitionGroup>

        <div
          v-if="!wall.loading && !wall.items.length"
          class="rounded-[28px] border border-dashed border-white/10 bg-white/5 p-8 text-center text-slate-300"
        >
          <span class="material-symbols-outlined mb-2 text-4xl text-emerald-300">nest_mini</span>
          <p class="text-lg font-medium text-white">{{ emptyCopy.title }}</p>
          <p class="text-sm text-slate-400">{{ emptyCopy.body }}</p>
        </div>

        <div v-if="wall.hasMore" class="pt-2 text-center">
          <button
            ref="loadMoreRef"
            class="group inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-2 text-sm font-semibold text-white transition hover:border-emerald-300 hover:bg-emerald-400/10"
            :disabled="wall.loading"
            @click="manualLoad"
          >
            <span class="material-symbols-outlined text-base transition group-hover:text-emerald-300">
              {{ wall.loading ? "motion_photos_pause" : "expand_more" }}
            </span>
            {{ wall.loading ? "Memuat..." : "Muat lagi" }}
          </button>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { wall } from "./store/wall";
import { api } from "./lib/api";
import Toolbar from "./components/Toolbar.vue";
import ConfessionForm from "./components/ConfessionForm.vue";
import ConfessionCard from "./components/ConfessionCard.vue";

const loadMoreRef = ref<HTMLButtonElement | null>(null);
let observer: IntersectionObserver | null = null;

const adminToken = ref(localStorage.getItem("adminToken") ?? "");
const isAdmin = computed(() => adminToken.value.trim().length > 0);
const visibleCount = computed(() => wall.items.length);
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

watch(adminToken, (val) => {
  if (val.trim()) {
    localStorage.setItem("adminToken", val);
  } else {
    localStorage.removeItem("adminToken");
    if (wall.status !== "APPROVED") {
      wall.status = "APPROVED";
      wall.refresh();
    }
  }
});

const vote = async (id: number, value: 1 | -1) => {
  await api.vote(id, value);
  wall.refresh();
};
const approve = async (id: number) => {
  if (!adminToken.value) return alert("Isi admin token dulu");
  await api.approve(id, adminToken.value);
  wall.refresh();
};
const reject = async (id: number) => {
  if (!adminToken.value) return alert("Isi admin token dulu");
  await api.reject(id, adminToken.value);
  wall.refresh();
};
const remove = async (id: number) => {
  if (!adminToken.value) return alert("Isi admin token dulu");
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
