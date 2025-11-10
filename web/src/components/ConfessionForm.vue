<template>
  <form
    :class="['rounded-[32px] border p-6 backdrop-blur transition-colors duration-300', themeConfig.wrapper, themeConfig.shadow]"
    @submit.prevent="submit"
  >
    <div class="flex items-center justify-between gap-4">
      <div>
        <p :class="['text-xs uppercase tracking-[0.4em]', themeConfig.label]">Tulis Confession</p>
        <h2 :class="['text-xl font-semibold', themeConfig.heading]">Curhat, saran, atau cerita rahasia kamu.</h2>
      </div>
      <span :class="['rounded-full border px-4 py-1 text-xs font-semibold uppercase', themeConfig.badge]">
        anonim
      </span>
    </div>

    <div class="mt-4 grid gap-4">
      <input v-model="website" type="text" tabindex="-1" autocomplete="off" class="hidden" />

      <div>
        <label :class="['text-xs uppercase tracking-[0.3em]', themeConfig.label]">Nama (opsional)</label>
        <input
          v-model.trim="name"
          type="text"
          maxlength="40"
          :class="themeConfig.input"
          placeholder="Isi nama panggilan atau biarkan kosong"
        />
      </div>

      <div>
        <label :class="['text-xs uppercase tracking-[0.3em]', themeConfig.label]">Isi pesan</label>
        <textarea
          v-model="message"
          rows="4"
          maxlength="500"
          :class="[themeConfig.input, 'min-h-[120px]']"
          placeholder="Tulis minimal 3 karakter. Link otomatis ditandai pending untuk dicek admin."
        />
        <div class="mt-1 flex items-center justify-between text-xs">
          <span :class="remaining < 0 ? 'text-rose-400' : themeConfig.subtle">
            {{ remaining }} karakter tersisa
          </span>
          <span :class="themeConfig.subtle">Max 500 karakter</span>
        </div>
      </div>
    </div>

    <div class="mt-4 flex flex-wrap items-center gap-3">
      <p v-if="feedback" :class="feedback.type === 'success' ? themeConfig.success : 'text-rose-400'">
        {{ feedback.message }}
      </p>
      <div class="ml-auto flex items-center gap-3">
        <button
          :class="['rounded-2xl border px-4 py-2 text-sm font-semibold transition', themeConfig.ghostButton]"
          type="button"
          @click="clearForm"
        >
          Hapus
        </button>
        <button
          :class="['rounded-2xl px-6 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60', themeConfig.primaryButton]"
          type="submit"
          :disabled="!canSubmit || sending"
        >
          {{ sending ? "Mengirim..." : "Kirim" }}
        </button>
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { api } from "../lib/api";
import { wall } from "../store/wall";

const props = defineProps<{ theme: "dark" | "light" }>();

const MAX_CHAR = 500;
const name = ref("");
const message = ref("");
const website = ref("");
const sending = ref(false);
const feedback = ref<{ type: "success" | "error"; message: string } | null>(null);

const themeMap = {
  dark: {
    wrapper: "border-white/10 bg-gradient-to-b from-white/15 to-white/5 text-white",
    heading: "text-white",
    label: "text-slate-300",
    badge: "border-white/20 text-emerald-200",
    input:
      "mt-2 w-full rounded-2xl border border-white/15 bg-slate-900/40 px-4 py-2 text-white placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none",
    subtle: "text-slate-400",
    ghostButton: "border-white/15 text-slate-200 hover:bg-white/10",
    primaryButton: "bg-emerald-400/90 text-emerald-950 hover:bg-emerald-300",
    success: "text-emerald-300",
    shadow: "shadow-[0_25px_60px_rgba(2,6,23,0.45)]",
  },
  light: {
    wrapper: "border-slate-200 bg-white text-slate-900",
    heading: "text-slate-900",
    label: "text-slate-600",
    badge: "border-emerald-200 bg-emerald-50 text-emerald-600",
    input:
      "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-slate-900 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none",
    subtle: "text-slate-500",
    ghostButton: "border-slate-300 text-slate-600 hover:bg-slate-100",
    primaryButton: "bg-emerald-500 text-white hover:bg-emerald-400",
    success: "text-emerald-500",
    shadow: "shadow-[0_12px_32px_rgba(15,23,42,0.12)]",
  },
} as const;

const themeConfig = computed(() => themeMap[props.theme ?? "dark"]);

const remaining = computed(() => MAX_CHAR - message.value.length);
const canSubmit = computed(() => message.value.trim().length >= 3 && remaining.value >= 0);

const clearForm = () => {
  name.value = "";
  message.value = "";
  website.value = "";
};

const submit = async () => {
  if (!canSubmit.value || sending.value) return;
  sending.value = true;
  feedback.value = null;
  try {
    const res = await api.create({
      name: name.value.trim(),
      message: message.value.trim(),
      website: website.value,
    });
    if (res?.error) throw new Error(res.error);
    feedback.value = {
      type: "success",
      message: res.status === "PENDING" ? "Terkirim! Menunggu moderasi." : "Terkirim dan sudah tampil publik.",
    };
    clearForm();
    wall.refresh();
  } catch (err: any) {
    feedback.value = { type: "error", message: err?.message || "Gagal mengirim. Coba lagi ya." };
  } finally {
    sending.value = false;
  }
};
</script>
