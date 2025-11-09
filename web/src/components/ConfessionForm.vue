<template>
  <form
    class="rounded-[32px] border border-white/10 bg-gradient-to-b from-white/15 to-white/5 p-6 backdrop-blur"
    @submit.prevent="submit"
  >
    <div class="flex items-center justify-between gap-4">
      <div>
        <p class="text-xs uppercase tracking-[0.4em] text-slate-300">Tulis Confession</p>
        <h2 class="text-xl font-semibold text-white">Curhat, saran, atau cerita rahasia kamu.</h2>
      </div>
      <span class="rounded-full border border-white/20 px-4 py-1 text-xs font-semibold uppercase text-emerald-200">
        anonim
      </span>
    </div>

    <div class="mt-4 grid gap-4">
      <input v-model="website" type="text" tabindex="-1" autocomplete="off" class="hidden" />

      <div>
        <label class="text-xs uppercase tracking-[0.3em] text-slate-400">Nama (opsional)</label>
        <input
          v-model.trim="name"
          type="text"
          maxlength="40"
          class="mt-2 w-full rounded-2xl border border-white/15 bg-slate-900/40 px-4 py-2 text-white placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
          placeholder="Isi nama panggilan atau biarkan kosong"
        />
      </div>

      <div>
        <label class="text-xs uppercase tracking-[0.3em] text-slate-400">Isi pesan</label>
        <textarea
          v-model="message"
          rows="4"
          maxlength="500"
          class="mt-2 w-full rounded-2xl border border-white/15 bg-slate-900/40 px-4 py-3 text-white placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
          placeholder="Tulis minimal 3 karakter. Link otomatis ditandai pending untuk dicek admin."
        />
        <div class="mt-1 flex items-center justify-between text-xs">
          <span :class="remaining < 0 ? 'text-rose-400' : 'text-slate-400'">
            {{ remaining }} karakter tersisa
          </span>
          <span class="text-slate-500">Max 500 karakter</span>
        </div>
      </div>
    </div>

    <div class="mt-4 flex flex-wrap items-center gap-3">
      <p v-if="feedback" :class="feedback.type === 'success' ? 'text-emerald-300' : 'text-rose-400'">
        {{ feedback.message }}
      </p>
      <div class="ml-auto flex items-center gap-3">
        <button
          class="rounded-2xl border border-white/15 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
          type="button"
          @click="clearForm"
        >
          Hapus
        </button>
        <button
          class="rounded-2xl bg-emerald-400/90 px-6 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
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

const MAX_CHAR = 500;
const name = ref("");
const message = ref("");
const website = ref("");
const sending = ref(false);
const feedback = ref<{ type: "success" | "error"; message: string } | null>(null);

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
