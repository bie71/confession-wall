import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authApiRepository } from '../repositories/AuthApiRepository';
// We'll need to decode the JWT to get user info like role
import { jwtDecode } from 'jwt-decode'; 

export const useAuthStore = defineStore('auth', () => {
    const token = ref(localStorage.getItem('token') || null);
    const user = ref(JSON.parse(localStorage.getItem('user') || 'null'));
    const error = ref<string | null>(null);
    const loading = ref(false);

    const isLoggedIn = computed(() => !!token.value);
    const isAdmin = computed(() => user.value?.role === 'admin');
    
    function setAuthData(userData: any, userToken: string) {
        user.value = userData;
        token.value = userToken;
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', userToken);
        error.value = null; // Clear error on success
    }

    function clearAuthData() {
        user.value = null;
        token.value = null;
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    }

    function clearError() {
      error.value = null;
    }

    async function login(credentials: any) {
        loading.value = true;
        error.value = null;
        try {
            const { user, token } = await authApiRepository.login(credentials);
            setAuthData(user, token);
        } catch (e: any) {
            error.value = e.message || "An unexpected error occurred during login.";
        } finally {
            loading.value = false;
        }
    }

    async function register(data: any) {
        loading.value = true;
        error.value = null;
        try {
            await authApiRepository.register(data);
        } catch (e: any) {
            error.value = e.message || "An unexpected error occurred during registration.";
            throw e; // re-throw to let the component know it failed
        } finally {
            loading.value = false;
        }
    }

    function logout() {
        clearAuthData();
    }
    
    // Check token on startup
    try {
        if (token.value) {
            const decoded: any = jwtDecode(token.value);
            if (decoded.exp * 1000 < Date.now()) {
                // Token expired
                clearAuthData();
            }
        }
    } catch (e) {
        // Invalid token
        clearAuthData();
    }


    return {
        token,
        user,
        isLoggedIn,
        isAdmin,
        error,
        loading,
        login,
        register,
        logout,
        clearError,
    };
});
