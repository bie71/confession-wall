<template>
    <AuthTemplate>
        <template #title>Welcome Back</template>
        <template #subtitle>Login to manage your confessions</template>
        <template #form>
            <LoginForm :theme="theme" :loading="loading" @submit="handleLogin" />
            <BaseErrorMessage :message="error" class="mt-4" />
        </template>
        <template #footer-link>
            Don't have an account? 
            <router-link to="/register" class="font-semibold text-emerald-400 hover:underline">Register here</router-link>
        </template>
    </AuthTemplate>
</template>

<script setup lang="ts">
import { onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useTheme } from '../composables/useTheme';
import AuthTemplate from '../templates/AuthTemplate.vue';
import LoginForm from '../organisms/LoginForm.vue';
import BaseErrorMessage from '../atoms/BaseErrorMessage.vue';
import { useAuthStore } from '../../data/stores/authStore';
import { storeToRefs } from 'pinia';

const { theme } = useTheme();
const router = useRouter();
const authStore = useAuthStore();
const { loading, error } = storeToRefs(authStore);

const handleLogin = async (credentials: any) => {
    await authStore.login(credentials);
    if (!error.value) { // Only redirect if login was successful
        router.push('/');
    }
};

// Clear errors when the component is left
onUnmounted(() => {
    authStore.clearError();
});
</script>
