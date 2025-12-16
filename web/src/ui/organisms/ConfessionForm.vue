<template>
  <form
    :class="['rounded-[32px] border p-6 backdrop-blur transition-colors duration-300 mb-8', themeConfig.wrapper, themeConfig.shadow]"
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
        <BaseInput
          v-model.trim="name"
          type="text"
          maxlength="40"
          :theme="theme"
          class="mt-2"
          placeholder="Isi nama panggilan atau biarkan kosong"
        />
      </div>

      <div>
        <label :class="['text-xs uppercase tracking-[0.3em]', themeConfig.label]">Isi pesan</label>
        <BaseTextarea
          v-model="message"
          rows="4"
          maxlength="500"
          :theme="theme"
          class="mt-2 min-h-[120px]"
          placeholder="Tulis minimal 3 karakter. Link otomatis ditandai pending untuk dicek admin."
          @input="wallStore.clearSubmissionStatus"
        />
        <div class="mt-1 flex items-center justify-between text-xs">
          <span :class="remaining < 0 ? 'text-rose-400' : themeConfig.subtle">
            {{ remaining }} karakter tersisa
          </span>
          <span :class="themeConfig.subtle">Max 500 karakter</span>
        </div>
      </div>
    </div>

    <div class="mt-2 min-h-[20px]">
      <p v-if="submissionError || submissionSuccess" :class="['text-sm', submissionError ? 'text-rose-400' : themeConfig.success]">
        {{ submissionError || submissionSuccess }}
      </p>
    </div>

    <div class="mt-2 flex flex-wrap items-center gap-3">
      <div class="ml-auto flex items-center gap-3">
        <BaseButton
          :theme="theme"
          variant="ghost"
          type="button"
          @click="handleClearButtonClick"
        >
          Hapus
        </BaseButton>
        <BaseButton
          :theme="theme"
          variant="primary"
          type="submit"
          :disabled="!canSubmit || submissionLoading"
        >
          {{ submissionLoading ? "Mengirim..." : "Kirim" }}
        </BaseButton>
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useWallStore } from '../../data/stores/wallStore';
import { storeToRefs } from "pinia";

import BaseInput from '../atoms/BaseInput.vue';
import BaseTextarea from '../atoms/BaseTextarea.vue';
import BaseButton from '../atoms/BaseButton.vue';
import BaseErrorMessage from '../atoms/BaseErrorMessage.vue';

const props = defineProps<{ theme: "dark" | "light" }>();

const wallStore = useWallStore();
const { submissionLoading, submissionError, submissionSuccess } = storeToRefs(wallStore);

const MAX_CHAR = 500;
const name = ref("");
const message = ref("");
const website = ref(""); // Honeypot

const themeMap = {
  dark: {
    wrapper: "border-white/10 bg-gradient-to-b from-white/15 to-white/5 text-white",
    heading: "text-white",
    label: "text-slate-300",
    badge: "border-white/20 text-emerald-200",
    subtle: "text-slate-400",
    success: "text-emerald-300",
    shadow: "shadow-[0_25px_60px_rgba(2,6,23,0.45)]",
  },
  light: {
    wrapper: "border-slate-200 bg-white text-slate-900",
    heading: "text-slate-900",
    label: "text-slate-600",
    badge: "border-emerald-200 bg-emerald-50 text-emerald-600",
    subtle: "text-slate-500",
    success: "text-emerald-500",
    shadow: "shadow-[0_12px_32px_rgba(15,23,42,0.12)]",
  },
} as const;

const themeConfig = computed(() => themeMap[props.theme ?? "dark"]);

const remaining = computed(() => MAX_CHAR - message.value.length);
const canSubmit = computed(() => message.value.trim().length >= 3 && remaining.value >= 0);

const clearFormInputs = () => {
  name.value = "";
  message.value = "";
  website.value = "";
};

const handleClearButtonClick = () => {
  clearFormInputs();
  wallStore.clearSubmissionStatus();
};

const submit = async () => {
  if (!canSubmit.value || submissionLoading.value) return;
  
  const success = await wallStore.createConfession({
    name: name.value.trim(),
    message: message.value.trim(),
    website: website.value,
  });

  if (success) {
    clearFormInputs();
  }
};
</script>
