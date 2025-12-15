<template>
    <form @submit.prevent="submitForm" class="grid gap-4">
        <div>
            <label :class="themeConfig.label">Full Name</label>
            <BaseInput v-model="name" type="text" required :theme="theme" class="mt-2" placeholder="Your Name" />
        </div>
        <div>
            <label :class="themeConfig.label">Email</label>
            <BaseInput v-model="email" type="email" required :theme="theme" class="mt-2" placeholder="you@example.com" />
        </div>
        <div>
            <label :class="themeConfig.label">Password</label>
            <BaseInput v-model="password" type="password" required :theme="theme" class="mt-2" placeholder="••••••••" />
        </div>
        <div>
            <label :class="themeConfig.label">Confirm Password</label>
            <BaseInput v-model="passwordConfirmation" type="password" required :theme="theme" class="mt-2" placeholder="••••••••" />
        </div>
        <div class="mt-2">
            <BaseButton :theme="theme" variant="primary" type="submit" :disabled="loading" class="w-full justify-center !rounded-xl !py-3">
                {{ loading ? 'Creating Account...' : 'Create Account' }}
            </BaseButton>
        </div>
    </form>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import BaseInput from '../atoms/BaseInput.vue';
import BaseButton from '../atoms/BaseButton.vue';

const props = defineProps<{ theme: 'dark' | 'light'; loading: boolean }>();
const emit = defineEmits(['submit']);

const name = ref('');
const email = ref('');
const password = ref('');
const passwordConfirmation = ref('');

const submitForm = () => {
    emit('submit', { 
        name: name.value,
        email: email.value, 
        password: password.value,
        passwordConfirmation: passwordConfirmation.value,
    });
};

const themeMap = {
  dark: { label: "text-slate-300" },
  light: { label: "text-slate-600" },
};
const themeConfig = computed(() => themeMap[props.theme]);
</script>
