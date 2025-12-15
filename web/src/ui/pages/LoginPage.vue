<template>
    <AuthTemplate>
        <template #title>Welcome Back</template>
        <template #subtitle>Login to manage your confessions</template>
        <template #form>
            <LoginForm :theme="theme" :loading="loading" @submit="handleLogin" />
            <div v-if="error" class="mt-4 text-center text-sm text-rose-400">
                {{ error }}
            </div>
        </template>
        <template #footer-link>
            Don't have an account? 
            <router-link to="/register" class="font-semibold text-emerald-400 hover:underline">Register here</router-link>
        </template>
    </AuthTemplate>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useTheme } from '../composables/useTheme';
import AuthTemplate from '../templates/AuthTemplate.vue';
import LoginForm from '../organisms/LoginForm.vue';
import { useAuthStore } from '../../data/stores/authStore';

const { theme } = useTheme();
const router = useRouter();
const authStore = useAuthStore();

const loading = ref(false);
const error = ref('');

const handleLogin = async (credentials: any) => {
    loading.value = true;
    error.value = '';
    try {
        await authStore.login(credentials);
        router.push('/');
    } catch (err: any) {
        error.value = err.message || 'An unknown error occurred.';
    } finally {
        loading.value = false;
    }
};
</script>
