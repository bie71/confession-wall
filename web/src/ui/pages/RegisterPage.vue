<template>
    <AuthTemplate>
        <template #title>Create Account</template>
        <template #subtitle>Join our community of anonymous confessions</template>
        <template #form>
            <RegisterForm :theme="theme" :loading="loading" @submit="handleRegister" />
            <div v-if="error" class="mt-4 text-center text-sm text-rose-400">
                {{ error }}
            </div>
        </template>
        <template #footer-link>
            Already have an account?
            <router-link to="/login" class="font-semibold text-emerald-400 hover:underline">Login here</router-link>
        </template>
    </AuthTemplate>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useTheme } from '../composables/useTheme';
import AuthTemplate from '../templates/AuthTemplate.vue';
import RegisterForm from '../organisms/RegisterForm.vue';
import { useAuthStore } from '../../data/stores/authStore';

const { theme } = useTheme();
const router = useRouter();
const authStore = useAuthStore();

const loading = ref(false);
const error = ref('');

const handleRegister = async (data: any) => {
    loading.value = true;
    error.value = '';
    try {
        await authStore.register(data);
        alert('Registration successful! Please log in.');
        router.push('/login');
    } catch (err: any) {
        error.value = err.message || 'An unknown error occurred.';
    } finally {
        loading.value = false;
    }
};
</script>
