<template>
  <article
    class="group relative overflow-hidden rounded-[28px] border border-white/10 bg-slate-900/60 p-5 text-slate-100 shadow-[0_20px_40px_rgba(2,6,23,0.65)] backdrop-blur"
  >
    <div
      class="pointer-events-none absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100"
      :class="badge.gradient"
    ></div>
    <div class="relative flex flex-col gap-3">
      <header class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-lg font-semibold">
            {{ initials }}
          </div>
          <div>
            <p class="text-base font-semibold text-white">{{ displayName }}</p>
            <p class="text-xs text-slate-400">{{ timeAgoText }}</p>
          </div>
        </div>
        <span
          class="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold"
          :class="badge.chip"
        >
          <span class="material-symbols-outlined text-base">{{ badge.icon }}</span>
          {{ badge.label }}
        </span>
      </header>

      <p class="text-sm leading-relaxed text-slate-100 whitespace-pre-line">
        {{ item.message }}
      </p>

      <div class="flex flex-wrap items-center gap-3 pt-3 text-sm">
        <button
          class="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/5 px-4 py-1 font-semibold text-emerald-100 transition hover:scale-[1.02] hover:border-emerald-300"
          title="Dukung"
          @click="$emit('vote', 1)"
        >
          <span class="text-xl">👍</span>
          <span class="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white">{{ item.likes }}</span>
        </button>
        <button
          class="inline-flex items-center gap-2 rounded-full border border-rose-400/30 bg-rose-400/5 px-4 py-1 font-semibold text-rose-100 transition hover:scale-[1.02] hover:border-rose-300"
          title="Kurang setuju"
          @click="$emit('vote', -1)"
        >
          <span class="text-xl">👎</span>
          <span class="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white">{{ item.dislikes }}</span>
        </button>

        <div class="ml-auto flex flex-wrap items-center gap-2" v-if="isAdmin">
          <button
            v-if="showModeration"
            class="inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200 hover:bg-emerald-400/20"
            @click="$emit('approve')"
          >
            <span class="material-symbols-outlined text-base">check</span>
            Approve
          </button>
          <button
            v-if="showModeration"
            class="inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-200 hover:bg-amber-400/20"
            @click="$emit('reject')"
          >
            <span class="material-symbols-outlined text-base">block</span>
            Reject
          </button>
          <button
            class="rounded-full border border-white/20 p-1 text-slate-400 transition hover:border-rose-400/40 hover:text-rose-200"
            @click="$emit('remove')"
            title="Hapus confession"
          >
            <span class="material-symbols-outlined text-base">delete</span>
          </button>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{ item: any; adminToken?: string }>();

const displayName = computed(() => props.item.name?.trim() || "Anon");
const initials = computed(() => displayName.value.charAt(0).toUpperCase());
const timeAgoText = computed(() => timeAgo(props.item.created_at));
const isAdmin = computed(() => Boolean(props.adminToken?.trim()));
const showModeration = computed(() => isAdmin.value && props.item.status === "PENDING");
const badge = computed(() => {
  const base = {
    chip: "border-white/10 bg-white/5 text-slate-200",
    label: "Publik",
    icon: "verified",
    gradient: "bg-gradient-to-br from-emerald-500/10 to-transparent",
  };
  if (props.item.status === "PENDING") {
    return {
      chip: "border-amber-400/40 bg-amber-500/10 text-amber-200",
      label: "Menunggu review",
      icon: "hourglass_top",
      gradient: "bg-gradient-to-br from-amber-500/20 to-transparent",
    };
  }
  if (props.item.status === "REJECTED") {
    return {
      chip: "border-rose-400/40 bg-rose-500/10 text-rose-200",
      label: "Ditolak",
      icon: "block",
      gradient: "bg-gradient-to-br from-rose-500/15 to-transparent",
    };
  }
  return base;
});

const timeAgo = (sec: number) => {
  const d = new Date(sec * 1000);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "baru saja";
  if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  return d.toLocaleString();
};
</script>
