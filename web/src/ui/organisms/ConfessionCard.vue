<template>
  <BaseCard :theme="theme" class="group relative overflow-hidden">
    <div
      class="pointer-events-none absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100"
      :class="badge.gradient"
    ></div>
    <div class="relative flex flex-col gap-3">
      <header class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <div :class="['flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-semibold', themeClasses.avatar]">
            {{ initials }}
          </div>
          <div>
            <p :class="['text-base font-semibold', themeClasses.heading]">{{ displayName }}</p>
            <p :class="['text-xs', themeClasses.subtle]">{{ timeAgoText }}</p>
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

      <p :class="['text-sm leading-relaxed whitespace-pre-line', themeClasses.body]">
        {{ item.message }}
      </p>

      <div class="flex flex-wrap items-center gap-3 pt-3 text-sm">
        <BaseButton :theme="theme" variant="voteUp" title="Dukung" @click="$emit('vote', 1)">
          <span class="material-symbols-outlined text-lg">thumb_up</span>
          <span :class="['rounded-full px-2 py-0.5 text-xs', themeClasses.voteCount]">{{ item.likes }}</span>
        </BaseButton>
        <BaseButton :theme="theme" variant="voteDown" title="Kurang setuju" @click="$emit('vote', -1)">
          <span class="material-symbols-outlined text-lg">thumb_down</span>
          <span :class="['rounded-full px-2 py-0.5 text-xs', themeClasses.voteCount]">{{ item.dislikes }}</span>
        </BaseButton>

        <div class="ml-auto flex flex-wrap items-center gap-2" v-if="isAdmin">
           <BaseButton v-if="showModeration" :theme="theme" variant="ghost" @click="$emit('approve')">
            <span class="material-symbols-outlined text-base">check</span>
            Approve
          </BaseButton>
          <BaseButton v-if="showModeration" :theme="theme" variant="ghost" @click="$emit('reject')">
            <span class="material-symbols-outlined text-base">block</span>
            Reject
          </BaseButton>
          <BaseButton :theme="theme" variant="danger" @click="$emit('remove')" title="Hapus confession">
            <span class="material-symbols-outlined text-base">delete</span>
          </BaseButton>
        </div>
      </div>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import { computed } from "vue";
import BaseCard from '../atoms/BaseCard.vue';
import BaseButton from '../atoms/BaseButton.vue';
import { Confession } from "../../domain/models/Confession";

const props = defineProps<{ item: Confession; isAdmin: boolean; theme: "dark" | "light" }>();

const displayName = computed(() => props.item.name?.trim() || "Anon");
const initials = computed(() => displayName.value.charAt(0).toUpperCase());
const timeAgoText = computed(() => timeAgo(props.item.createdAt));
const showModeration = computed(() => props.isAdmin && props.item.status === "PENDING");

const themeMap = {
  dark: {
    avatar: "bg-white/10 text-white",
    heading: "text-white",
    body: "text-slate-100",
    subtle: "text-slate-400",
    voteCount: "bg-white/10 text-white",
  },
  light: {
    avatar: "bg-slate-100 text-slate-800",
    heading: "text-slate-900",
    body: "text-slate-700",
    subtle: "text-slate-500",
    voteCount: "bg-slate-100 text-slate-700",
  },
} as const;

const themeClasses = computed(() => themeMap[props.theme ?? "dark"]);

const badge = computed(() => {
  const base = {
    chip: props.theme === "light" ? "border-slate-200 bg-slate-100 text-slate-600" : "border-white/10 bg-white/5 text-slate-200",
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

const timeAgo = (dateValue: Date | string | number) => {
  if (!dateValue) return '';
  
  // Handle both Unix timestamp (number) and ISO string/Date object
  const d = typeof dateValue === 'number' ? new Date(dateValue * 1000) : new Date(dateValue);

  if (isNaN(d.getTime())) {
    return 'Invalid Date'; // Safety check
  }

  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "baru saja";
  if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  return d.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
};
</script>
